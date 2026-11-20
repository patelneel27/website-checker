import { sendReportForLead } from "@/lib/report";
import { isStaff, unauthorised } from "@/lib/staff-auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!isStaff(req)) return unauthorised();
  const body = (await req.json().catch(() => null)) as { leadId?: unknown } | null;
  if (typeof body?.leadId !== "string") return Response.json({ ok: false }, { status: 400 });
  const sent = await sendReportForLead(body.leadId, { force: true });
  return Response.json({ ok: sent }, { status: sent ? 200 : 502 });
}
