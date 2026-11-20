import { after } from "next/server";
import { z } from "zod";
import { leadSource } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendReportForLead, sendReportsForScan, syncLeadToZoho } from "@/lib/report";
import { toResult } from "@/lib/scan-result";
import { scanFromToken } from "@/lib/scan-token";
import { createLead, getScan, restoreScan } from "@/lib/store";
import { INTERESTS } from "@/lib/types";

export const maxDuration = 60;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const Body = z.object({
  scanId: z.string().min(1).max(64),
  scanToken: z.string().max(200_000).optional(),
  name: z.string().trim().min(1, "Please tell us your name.").max(120),
  email: z.email("Please check your email address.").max(254),
  company: optionalText(160),
  phone: optionalText(40),
  interest: z.array(z.enum(INTERESTS)).max(INTERESTS.length).default([]),
  // UK GDPR: consent must be an explicit, positive action.
  consent: z.literal(true, "Please tick the box so we can email your report."),
});

export async function POST(req: Request) {
  if (!rateLimit(`lead:${clientIp(req)}`, 20, 60_000).ok) {
    return Response.json({ ok: false, message: "Please try again in a moment." }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return Response.json(
      { ok: false, field: String(first?.path[0] ?? ""), message: first?.message ?? "Please check the form." },
      { status: 400 },
    );
  }
  const { scanId, scanToken, name, email, company, phone, interest } = parsed.data;

  // Normally the scan is in memory; after a restart we fall back to the kiosk's signed copy.
  let scan = await getScan(scanId);
  if (!scan) {
    const fromToken = scanFromToken(scanToken);
    if (fromToken?.id === scanId) {
      restoreScan(fromToken);
      scan = fromToken;
    }
  }
  if (!scan) return Response.json({ ok: false, message: "Please run the check again." }, { status: 404 });

  const lead = await createLead(
    { scanId, name, email, company, phone, interest, consentAt: new Date(), source: leadSource() },
    scan,
  );

  // Email + Zoho happen after we respond, so the visitor sees "Thank you" straight away.
  const pending = toResult(scan).psiStatus === "pending";
  after(async () => {
    if (pending) {
      // PageSpeed is still finishing; the scan request emails this lead when it's done. As a
      // safety net we wait here too (claims prevent a double send), then send whatever we have.
      const deadline = Date.now() + 50_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        const current = await getScan(scanId);
        if (!current || current.psiStatus !== "pending") break;
      }
      await sendReportsForScan(scanId);
    } else {
      await sendReportForLead(lead.id);
    }
    await syncLeadToZoho(lead.id);
  });

  return Response.json({ ok: true });
}
