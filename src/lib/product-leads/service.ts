import "server-only";
import { render } from "@react-email/render";
import { config, CONTACT, withUtm } from "../config";
import {
  AccountEmail,
  accountPlainText,
  accountSubject,
  ThanksEmail,
  thanksPlainText,
  thanksSubject,
  type EmailProduct,
  type ThanksWording,
} from "../email/ProductEmails";
import { getTransporter, mailerEnabled } from "../mailer";
import { getLogoPng, LOGO_CID } from "../report";
import { addZohoNote, upsertZohoLead, zohoEnabled } from "../zoho";
import type { LeadStore, ProductLead } from "./store";

// Everything a product showcase does with a lead after it's saved: thank-you email, account
// email, Zoho CRM, staff notes, staff-mode summary and CSV row.

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each product has its own lead shape
type AnyLead = ProductLead<any>;

export type ProductSpec<L extends AnyLead> = {
  key: string;
  name: string;
  websiteLabel: string;
  links: () => { bookingEmail: string; websiteEmail: string };
  utmSource: () => string;
  /** Default sign-up link for the "account ready" email; omit for products without accounts. */
  signupUrl?: () => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: LeadStore<any>;
  thanksParagraph: (lead: L) => string;
  /** Wording overrides for the thank-you email (e.g. an enquiry rather than a demo). */
  thanksWording?: (lead: L) => ThanksWording;
  /** Line in the "account ready" email; omit for products without accounts. */
  demoLine?: (lead: L) => string;
  zoho: (lead: L) => { description: string; tags: string[]; fields: Record<string, unknown>; company: string; website?: string | null };
  /** Short lines shown under the lead in staff mode. */
  staffDetails: (lead: L) => string[];
  csvRow: (lead: L) => Record<string, unknown>;
};

export const ukDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });

async function send(to: string, subject: string, html: string, text: string, logo: Buffer | null) {
  if (!mailerEnabled()) {
    console.info(`[email] SMTP not configured: would send "${subject}" to ${to}\n${text}`);
    return;
  }
  await getTransporter().sendMail({
    from: config.emailFrom,
    to,
    replyTo: config.emailReplyTo,
    subject,
    html,
    text,
    attachments: logo ? [{ filename: "sterlixit.png", content: logo, cid: LOGO_CID, contentType: "image/png" }] : [],
  });
}

export function createProductService<L extends AnyLead>(spec: ProductSpec<L>) {
  const store = spec.store as unknown as LeadStore<never> & { get(id: string): Promise<L | null>; update(id: string, d: object): Promise<L | null> };

  async function shared(lead: L) {
    const logo = await getLogoPng().catch(() => null);
    const product: EmailProduct = { name: spec.name, websiteUrl: spec.links().websiteEmail, websiteLabel: spec.websiteLabel };
    return {
      logo,
      props: {
        product,
        firstName: lead.firstName as string,
        logoUrl: logo ? `cid:${LOGO_CID}` : null,
        eventName: lead.eventName,
        contact: { ...CONTACT, websiteUrl: withUtm(CONTACT.websiteUrl, "email", `${spec.key}-email-footer`, spec.utmSource()) },
      },
    };
  }

  /** Email 1: thank you. Sent once (unless `force`). Returns whether it went out. */
  async function sendThanks(leadId: string, { force = false } = {}): Promise<boolean> {
    const lead = await store.get(leadId);
    if (!lead) return false;
    if (force) await store.update(lead.id, { thanksSentAt: null });
    if (!(await store.claimThanks(lead.id))) return false;
    try {
      const { logo, props: base } = await shared(lead);
      const wording = spec.thanksWording?.(lead);
      const props = { ...base, paragraph: spec.thanksParagraph(lead), bookingUrl: spec.links().bookingEmail, wording };
      await send(lead.email as string, thanksSubject(base.product, wording), await render(ThanksEmail(props)), thanksPlainText(props), logo);
      return true;
    } catch (err) {
      console.error(`[email] ${spec.name} thank-you to ${lead.email} failed`, err);
      await store.update(lead.id, { thanksSentAt: null });
      return false;
    }
  }

  /** Email 2: account ready, sent by staff once the account exists. */
  async function sendAccountEmail(leadId: string, signupUrl: string): Promise<boolean> {
    const lead = await store.get(leadId);
    if (!lead || !spec.demoLine) return false;
    try {
      const { logo, props: base } = await shared(lead);
      const props = { ...base, signupUrl, bookingUrl: spec.links().bookingEmail, demoLine: spec.demoLine(lead) };
      await send(lead.email as string, accountSubject(base.product), await render(AccountEmail(props)), accountPlainText(props), logo);
      await store.update(lead.id, { accountEmailSentAt: new Date() });
      return true;
    } catch (err) {
      console.error(`[email] ${spec.name} account email to ${lead.email} failed`, err);
      return false;
    }
  }

  /** Creates/updates the lead in Zoho and records the outcome. Never throws. */
  async function sync(leadId: string): Promise<boolean> {
    const lead = await store.get(leadId);
    if (!lead) return false;
    if (!zohoEnabled()) {
      await store.update(lead.id, { zohoError: "Zoho isn't configured" });
      return false;
    }
    try {
      const z = spec.zoho(lead);
      const zohoId = await upsertZohoLead({
        firstName: lead.firstName as string,
        lastName: lead.lastName as string,
        email: lead.email as string,
        phone: (lead.phone as string | null) ?? null,
        company: z.company,
        website: z.website ?? null,
        jobTitle: (lead.jobTitle as string | null | undefined) ?? null,
        source: lead.source,
        description: z.description,
        tags: z.tags,
        noteTitle: spec.demoLine ? `${spec.name} demo request` : spec.name,
        fields: z.fields,
      });
      await store.update(lead.id, { zohoId, zohoError: null });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[zoho] ${spec.name} sync failed for ${lead.email}`, message);
      await store.update(lead.id, { zohoError: message.slice(0, 300) });
      return false;
    }
  }

  /** Saves the staff note, and copies it to Zoho as a Note if the lead is already there. */
  async function saveNote(leadId: string, note: string): Promise<boolean> {
    const lead = await store.update(leadId, { note });
    if (!lead) return false;
    if (lead.zohoId && note && zohoEnabled()) {
      await addZohoNote(lead.zohoId, `Staff note (${spec.name})`, note).catch((err) => console.error("[zoho] note failed", err));
    }
    return true;
  }

  /** The row staff mode shows for this lead. */
  function staffRow(lead: L) {
    return {
      id: lead.id,
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email as string,
      phone: (lead.phone as string | null) ?? null,
      company: (lead.company as string | null) ?? null,
      jobTitle: (lead.jobTitle as string | null | undefined) ?? null,
      details: spec.staffDetails(lead),
      note: lead.note,
      thanksSentAt: lead.thanksSentAt?.toISOString() ?? null,
      accountEmailSentAt: lead.accountEmailSentAt?.toISOString() ?? null,
      zohoId: lead.zohoId,
      zohoError: lead.zohoError,
      createdAt: lead.capturedAt.toISOString(),
    };
  }

  const stamp = (d: Date | null) => (d ? d.toISOString().replace("T", " ").slice(0, 16) : "");
  function csvRow(lead: L) {
    return {
      Date: stamp(lead.capturedAt),
      "First name": lead.firstName,
      "Last name": lead.lastName,
      Email: lead.email,
      Phone: lead.phone ?? "",
      ...spec.csvRow(lead),
      "Staff note": lead.note,
      "Thank-you sent": stamp(lead.thanksSentAt) || "No",
      "Account email sent": stamp(lead.accountEmailSentAt) || "No",
      "Consent at": lead.consentAt.toISOString(),
      Source: lead.source,
      "Zoho lead ID": lead.zohoId ?? "Not synced",
    };
  }

  return { spec, store: spec.store, sendThanks, sendAccountEmail, sync, saveNote, staffRow, csvRow };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any product
export type ProductService = ReturnType<typeof createProductService<any>>;
