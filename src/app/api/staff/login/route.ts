import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createSessionToken, pinMatches, STAFF_COOKIE, staffEnabled } from "@/lib/staff-auth";

export async function POST(req: Request) {
  if (!staffEnabled()) {
    return Response.json({ ok: false, message: "Staff mode isn't set up. Add STAFF_PIN to the server settings." }, { status: 503 });
  }
  if (!rateLimit(`staff-login:${clientIp(req)}`, 5, 60_000).ok) {
    return Response.json({ ok: false, message: "Too many tries. Wait a minute." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { pin?: unknown } | null;
  const pin = typeof body?.pin === "string" ? body.pin : "";
  if (!pinMatches(pin)) return Response.json({ ok: false, message: "Wrong PIN" }, { status: 401 });

  const { token, maxAge } = createSessionToken();
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  return Response.json(
    { ok: true },
    { headers: { "set-cookie": `${STAFF_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}` } },
  );
}
