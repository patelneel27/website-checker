import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "./config";

// Staff mode uses a signed, http-only cookie issued after a correct STAFF_PIN. The panel asks for
// the PIN every time it opens and signs out when it closes; the short expiry covers a tablet left
// on the "quick enquiry" page.

export const STAFF_COOKIE = "sterlix_staff";
const SESSION_MS = 30 * 60 * 1000;

function sign(value: string) {
  return createHmac("sha256", `sterlix-staff:${config.staffPin}`).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function staffEnabled() {
  return config.staffPin.length > 0;
}

export function pinMatches(pin: string) {
  return staffEnabled() && safeEqual(pin, config.staffPin);
}

export function createSessionToken() {
  const expires = String(Date.now() + SESSION_MS);
  return { token: `${expires}.${sign(expires)}`, maxAge: SESSION_MS / 1000 };
}

function readCookie(req: Request, name: string) {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function isStaff(req: Request): boolean {
  if (!staffEnabled()) return false;
  const token = readCookie(req, STAFF_COOKIE);
  if (!token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(sig, sign(expires));
}

export function unauthorised() {
  return Response.json({ error: "unauthorised" }, { status: 401 });
}
