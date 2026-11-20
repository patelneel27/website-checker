import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// The kiosk is public, so our server must only ever fetch public websites, never internal
// addresses (localhost, cloud metadata, private networks). Every redirect hop is re-checked.

function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::") return true;
    if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? isPrivateIp(mapped[1]) : false;
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

export class UnreachableError extends Error {}

/** Resolves the hostname and throws if it doesn't exist or points somewhere private. */
export async function assertPublicHost(hostname: string): Promise<void> {
  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new UnreachableError(`DNS lookup failed for ${hostname}`);
  }
  if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
    throw new UnreachableError(`Refusing to fetch non-public host ${hostname}`);
  }
}

const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36 SterlixHealthCheck/1.0";

export type SafeFetchResult = {
  response: Response;
  finalUrl: string;
  /** Time until the final response's headers arrived, ms */
  ttfbMs: number;
};

/** fetch() with manual, re-validated redirects and a hard timeout. */
export async function safeFetch(
  url: string,
  { timeoutMs = 8000, method = "GET" }: { timeoutMs?: number; method?: string } = {},
): Promise<SafeFetchResult> {
  const signal = AbortSignal.timeout(timeoutMs);
  let current = url;
  for (let hop = 0; hop < 6; hop++) {
    const target = new URL(current);
    if (target.protocol !== "https:" && target.protocol !== "http:") throw new UnreachableError("Bad protocol");
    await assertPublicHost(target.hostname);

    const started = performance.now();
    const response = await fetch(current, {
      method,
      redirect: "manual",
      signal,
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,*/*;q=0.8", "accept-language": "en-GB,en;q=0.9" },
      cache: "no-store",
    });
    const ttfbMs = performance.now() - started;

    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      current = new URL(location, current).toString();
      continue;
    }
    return { response, finalUrl: current, ttfbMs };
  }
  throw new UnreachableError("Too many redirects");
}

/** Reads at most `maxBytes` of a response body as text. */
export async function readTextCapped(response: Response, maxBytes = 2_000_000): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks).subarray(0, maxBytes));
}
