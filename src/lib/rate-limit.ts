import "server-only";

// Simple in-memory sliding-window limiter. Good enough for a handful of kiosk tablets on one
// server; swap for Redis/Upstash if you ever run several server instances.

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterS: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfterS: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return { ok: true, retryAfterS: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * All tablets on a stand share one hotspot IP, so the kiosk sends a per-device id.
 * We limit per device (10/min) and per IP (a looser 30/min) so a spoofed id can't bypass it.
 */
export function scanRateLimit(req: Request) {
  const ip = clientIp(req);
  const device = (req.headers.get("x-device-id") ?? "").slice(0, 64) || "none";
  const perDevice = rateLimit(`scan:dev:${ip}:${device}`, 10, 60_000);
  if (!perDevice.ok) return perDevice;
  return rateLimit(`scan:ip:${ip}`, 30, 60_000);
}
