import "server-only";
import { render } from "@react-email/render";
import { iconImage } from "./brand/icon-image";
import { bookingLinks, config, CONTACT, withUtm } from "./config";
import { displayUrl, ReportEmail, reportPlainText, type ReportEmailProps } from "./email/ReportEmail";
import { getTransporter, mailerEnabled } from "./mailer";
import { toResult } from "./scan-result";
import { claimLead, claimUnsentLeads, getLead, getScan, updateLead, type LeadWithScan } from "./store";
import { pushLeadToZoho, zohoEnabled } from "./zoho";

export const LOGO_CID = "sterlix-logo";
let logoPng: Promise<Buffer> | null = null;

/** The star mark as a PNG, embedded in the email (Gmail and Outlook don't show SVG). */
export function getLogoPng() {
  logoPng ??= iconImage(128, { padding: 0.06 })
    .arrayBuffer()
    .then((b) => Buffer.from(b))
    .catch((err) => {
      logoPng = null;
      throw err;
    });
  return logoPng;
}

const FAVICON_CID = "site-favicon";

/** The visitor's favicon as an inline attachment (email clients block data: URIs and ICO/SVG). */
function faviconAttachment(dataUri: string | null) {
  const m = dataUri?.match(/^data:(image\/(?:png|jpe?g|gif));base64,(.+)$/);
  if (!m) return null;
  const ext = m[1].split("/")[1].replace("jpeg", "jpg");
  return { filename: `favicon.${ext}`, content: Buffer.from(m[2], "base64"), cid: FAVICON_CID, contentType: m[1] };
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

/** Renders and sends one report via SMTP. Throws on failure. */
export async function sendReportEmail(lead: LeadWithScan): Promise<void> {
  const logo = await getLogoPng().catch(() => null);
  const favicon = faviconAttachment(lead.scan.site?.favicon ?? null);
  const props: ReportEmailProps = {
    firstName: firstName(lead.name),
    scan: toResult(lead.scan),
    bookingUrl: bookingLinks().email,
    eventName: config.eventName,
    logoUrl: logo ? `cid:${LOGO_CID}` : null,
    faviconUrl: favicon ? `cid:${FAVICON_CID}` : null,
    contact: { ...CONTACT, websiteUrl: withUtm(CONTACT.websiteUrl, "email", "report-footer") },
  };
  const html = await render(ReportEmail(props));
  const text = reportPlainText(props);
  const subject = `Your website health check for ${displayUrl(lead.scan.url)}`;

  if (!mailerEnabled()) {
    console.info(`[email] SMTP not configured: would send "${subject}" to ${lead.email}\n${text}`);
    return;
  }

  await getTransporter().sendMail({
    from: config.emailFrom,
    to: lead.email,
    replyTo: config.emailReplyTo,
    subject,
    html,
    text,
    attachments: [
      ...(logo ? [{ filename: "sterlixit.png", content: logo, cid: LOGO_CID, contentType: "image/png" }] : []),
      ...(favicon ? [favicon] : []),
    ],
  });
}

async function sendClaimed(lead: LeadWithScan): Promise<boolean> {
  try {
    await sendReportEmail(lead);
    return true;
  } catch (err) {
    console.error(`[email] send to ${lead.email} failed`, err);
    await updateLead(lead.id, { reportSentAt: null });
    return false;
  }
}

/** Sends the report for one lead (never twice unless `force`). Returns whether it went out. */
export async function sendReportForLead(leadId: string, { force = false } = {}): Promise<boolean> {
  const lead = await getLead(leadId);
  if (!lead) return false;
  if (force) await updateLead(lead.id, { reportSentAt: null });
  if (!(await claimLead(lead.id))) return false;
  return sendClaimed(lead);
}

/** Sends to every lead on this scan that hasn't had its report yet. */
export async function sendReportsForScan(scanId: string): Promise<void> {
  const scan = await getScan(scanId);
  for (const lead of await claimUnsentLeads(scanId)) {
    if (scan) lead.scan = scan;
    await sendClaimed(lead);
  }
}

/** Creates/updates the lead in Zoho CRM and records the outcome. Never throws. */
export async function syncLeadToZoho(leadId: string): Promise<boolean> {
  const lead = await getLead(leadId);
  if (!lead) return false;
  if (!zohoEnabled()) {
    await updateLead(lead.id, { zohoError: "Zoho isn't configured" });
    return false;
  }
  try {
    const zohoId = await pushLeadToZoho(lead, toResult(lead.scan));
    await updateLead(lead.id, { zohoId, zohoError: null });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[zoho] sync failed for ${lead.email}`, message);
    await updateLead(lead.id, { zohoError: message.slice(0, 300) });
    return false;
  }
}
