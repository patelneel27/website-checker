import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { appSecret } from "./config";
import type { ScanRecord } from "./store";

// Scans live in server memory. The kiosk also holds a signed copy of its scan and sends it
// back with the lead form, so a lead is never lost if the server restarted in between (or a
// different server instance handles the request). The signature stops anyone forging report
// content to send from our mailbox.

const sign = (payload: string) => createHmac("sha256", appSecret).update(payload).digest("base64url");

export function scanToken(scan: ScanRecord): string {
  const payload = Buffer.from(JSON.stringify(scan)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function scanFromToken(token: unknown): ScanRecord | null {
  if (typeof token !== "string" || token.length > 200_000) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const raw = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ScanRecord;
    return { ...raw, createdAt: new Date(raw.createdAt) };
  } catch {
    return null;
  }
}

/** Signed token for a scan result as returned to the kiosk. */
export function tokenForResult(r: {
  id: string;
  url: string;
  site: ScanRecord["site"];
  seo: ScanRecord["seo"];
  scores: ScanRecord["scores"];
  metrics: ScanRecord["metrics"];
  quickWins: ScanRecord["quickWins"];
  checks: ScanRecord["checks"];
  psiStatus: ScanRecord["psiStatus"];
  scannedAt: string;
}): string {
  const { id, url, site, seo, scores, metrics, quickWins, checks, psiStatus, scannedAt } = r;
  return scanToken({ id, url, site, seo, scores, metrics, quickWins, checks, psiStatus, createdAt: new Date(scannedAt) });
}
