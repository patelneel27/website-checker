import "server-only";
import { config } from "./config";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "./scores";
import type { LeadRecord } from "./store";
import type { ScanResult } from "./types";

// Zoho CRM: every captured visitor becomes a Lead. If the email already exists in Zoho, we
// leave the existing record alone and attach the details as a Note instead.

let cachedToken: { value: string; expires: number } | null = null;

export function zohoEnabled() {
  const z = config.zoho;
  return Boolean(z.clientId && z.clientSecret && z.refreshToken);
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.value;
  const z = config.zoho;
  const res = await fetch(`${z.accountsUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: z.refreshToken,
      client_id: z.clientId,
      client_secret: z.clientSecret,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !body.access_token) throw new Error(`Zoho token refresh failed: ${body.error ?? res.status}`);
  cachedToken = { value: body.access_token, expires: Date.now() + ((body.expires_in ?? 3600) - 120) * 1000 };
  return body.access_token;
}

async function zohoFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${config.zoho.apiDomain}/crm/v2${path}`, {
    ...init,
    headers: { authorization: `Zoho-oauthtoken ${await accessToken()}`, "content-type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 401) cachedToken = null;
  return res;
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "Website Health Check" };
  if (parts.length === 1) return { first: "", last: parts[0] };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

function reportText(lead: LeadRecord, scan: ScanResult) {
  const lines = [`Website Health Check at ${lead.source}`, `Website: ${scan.url}`, ""];
  if (scan.scores) {
    lines.push("Scores (Lighthouse mobile, out of 100):");
    for (const k of CATEGORY_ORDER) lines.push(`- ${CATEGORY_LABELS[k]}: ${scan.scores[k] ?? "n/a"}`);
    lines.push("");
  } else {
    lines.push("PageSpeed scores: not available (quick checks only)", "");
  }
  if (scan.quickWins.length) {
    lines.push("Top fixes:");
    scan.quickWins.forEach((w, i) => lines.push(`${i + 1}. ${w.title}`));
    lines.push("");
  }
  const failed = scan.checks.filter((c) => !c.pass);
  if (failed.length) {
    lines.push("Quick checks to improve:");
    failed.forEach((c) => lines.push(`- ${c.message}`));
    lines.push("");
  }
  if (scan.seo) {
    lines.push(`Schema: ${scan.seo.schema.types.length ? scan.seo.schema.types.join(", ") : "none"}`);
    lines.push(`Social preview image: ${scan.seo.social.ogImage ? (scan.seo.social.ogImageWorks === false ? "broken" : "yes") : "missing"}`);
    lines.push(`Words on homepage: ${scan.seo.wordCount}`, "");
  }
  lines.push(`Interested in: ${lead.interest.length ? lead.interest.join(", ") : "not specified"}`);
  lines.push(`Consent to email/contact given: ${lead.consentAt.toISOString()}`);
  return lines.join("\n");
}

type ZohoRow = { code: string; message?: string; details?: { id?: string; duplicate_record?: { id?: string } } };

export type ZohoLeadInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  jobTitle?: string | null;
  source: string;
  description: string;
  tags: string[];
  /** Title of the Note added when the person is already in Zoho. */
  noteTitle: string;
  /** Extra (custom) fields by API name; empty names are skipped. */
  fields?: Record<string, unknown>;
};

/**
 * Creates the Lead in Zoho, or, if the email already exists, adds a Note and tags to the
 * existing record so we never overwrite someone's details. Returns the record id. Throws.
 */
export async function upsertZohoLead(input: ZohoLeadInput): Promise<string> {
  const moduleName = config.zoho.leadModule;
  // Zoho tag names are limited to 25 characters.
  const tags = [...new Set(input.tags.map((t) => t.slice(0, 25).trim()).filter(Boolean))];

  const record: Record<string, unknown> = {
    First_Name: input.firstName,
    Last_Name: input.lastName || input.noteTitle,
    Email: input.email,
    Phone: input.phone ?? undefined,
    Website: input.website ?? undefined,
    Designation: input.jobTitle ?? undefined,
    Description: input.description,
    Tag: tags.map((name) => ({ name })),
  };
  for (const [k, v] of Object.entries(input.fields ?? {})) if (k && v != null && v !== "") record[k] = v;
  if (moduleName.toLowerCase() === "leads") {
    record.Company = input.company || input.noteTitle;
    record.Lead_Source = input.source;
  }

  const search = await zohoFetch(`/${moduleName}/search?email=${encodeURIComponent(input.email)}`);
  if (search.status === 200) {
    const found = (await search.json()) as { data?: { id: string }[] };
    const existingId = found.data?.[0]?.id;
    if (existingId) {
      await addZohoNote(existingId, input.noteTitle, input.description);
      await addTags(moduleName, existingId, tags);
      return existingId;
    }
  } else if (search.status !== 204) {
    throw new Error(`Zoho search failed (${search.status}): ${(await search.text()).slice(0, 300)}`);
  }

  const res = await zohoFetch(`/${moduleName}`, {
    method: "POST",
    body: JSON.stringify({ data: [record], trigger: ["workflow", "assignment_rule"] }),
  });
  const body = (await res.json().catch(() => ({}))) as { data?: ZohoRow[] };
  const row = body.data?.[0];
  if (row?.code === "SUCCESS" && row.details?.id) return row.details.id;
  if (row?.code === "DUPLICATE_DATA") {
    const id = row.details?.duplicate_record?.id ?? row.details?.id;
    if (id) {
      await addZohoNote(id, input.noteTitle, input.description);
      return id;
    }
  }
  throw new Error(`Zoho create failed (${res.status}): ${JSON.stringify(body).slice(0, 400)}`);
}

/** Creates (or annotates) the health check Lead in Zoho. Returns the Zoho record id. Throws on failure. */
export async function pushLeadToZoho(lead: LeadRecord, scan: ScanResult): Promise<string> {
  const { first, last } = splitName(lead.name);
  return upsertZohoLead({
    firstName: first,
    lastName: last,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    website: scan.url,
    source: lead.source,
    description: reportText(lead, scan),
    tags: ["Website Health Check", config.eventName, ...lead.interest],
    noteTitle: "Website Health Check",
  });
}

export async function addZohoNote(recordId: string, title: string, content: string) {
  const res = await zohoFetch(`/${config.zoho.leadModule}/${recordId}/Notes`, {
    method: "POST",
    body: JSON.stringify({ data: [{ Note_Title: title, Note_Content: content }] }),
  });
  if (!res.ok) throw new Error(`Zoho note failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
}

async function addTags(moduleName: string, recordId: string, tags: string[]) {
  // Best effort: tags are nice to have, not worth failing the sync over.
  await zohoFetch(`/${moduleName}/${recordId}/actions/add_tags?tag_names=${encodeURIComponent(tags.join(","))}`, {
    method: "POST",
  }).catch(() => {});
}
