import "server-only";
import type { CheerioAPI } from "cheerio";
import { safeFetch } from "./safe-fetch";

// Finds the site's favicon (like the Ahrefs toolbar shows) and returns it as a small data URI.
// Raster formats (PNG/JPEG/GIF/WebP) are preferred because email clients can't show ICO/SVG.

const MAX_BYTES = 64 * 1024;
const RASTER = /^image\/(png|jpe?g|gif|webp)$/;

type Icon = { url: string; type: string; bytes: Buffer };

function candidates($: CheerioAPI, pageUrl: string): string[] {
  const links = $("link[rel][href]")
    .toArray()
    .map((el) => ({ rel: ($(el).attr("rel") ?? "").toLowerCase(), href: $(el).attr("href") ?? "", sizes: $(el).attr("sizes") ?? "" }))
    .filter((l) => /(^|\s)(icon|apple-touch-icon|apple-touch-icon-precomposed)(\s|$)/.test(l.rel) && !l.rel.includes("mask-icon"));
  // Apple touch icons are crisp PNGs; then larger declared sizes first.
  const score = (l: (typeof links)[number]) =>
    (l.rel.includes("apple-touch-icon") ? 1000 : 0) + (parseInt(l.sizes, 10) || (/\.svg(\?|$)/i.test(l.href) ? 64 : 16));
  const urls = links.sort((a, b) => score(b) - score(a)).map((l) => {
    try {
      return new URL(l.href, pageUrl).toString();
    } catch {
      return null;
    }
  });
  urls.push(new URL("/favicon.ico", pageUrl).toString());
  return [...new Set(urls.filter((u): u is string => !!u && /^https?:/.test(u)))].slice(0, 5);
}

async function load(url: string): Promise<Icon | null> {
  const { response } = await safeFetch(url, { timeoutMs: 5000 });
  if (response.status !== 200 || !response.body) {
    await response.body?.cancel();
    return null;
  }
  let type = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!type.startsWith("image/")) {
    if (/\.ico(\?|$)/i.test(url)) type = "image/x-icon";
    else {
      await response.body.cancel();
      return null;
    }
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total <= MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  if (total === 0 || total > MAX_BYTES) return null;
  return { url, type, bytes: Buffer.concat(chunks) };
}

/** Google's favicon service always returns a PNG, a good fallback for ICO/SVG-only sites. */
async function googlePng(host: string): Promise<Icon | null> {
  const res = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`, {
    signal: AbortSignal.timeout(5000),
  });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.startsWith("image/png")) return null;
  const bytes = Buffer.from(await res.arrayBuffer());
  return bytes.length > 0 && bytes.length <= MAX_BYTES ? { url: res.url, type: "image/png", bytes } : null;
}

export type FaviconResult = { found: boolean; dataUri: string | null };

export async function loadFavicon($: CheerioAPI, pageUrl: string): Promise<FaviconResult> {
  const icons = (await Promise.allSettled(candidates($, pageUrl).map(load)))
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((i): i is Icon => !!i);
  if (icons.length === 0) return { found: false, dataUri: null };

  const toUri = (i: Icon) => `data:${i.type};base64,${i.bytes.toString("base64")}`;
  const raster = icons.find((i) => RASTER.test(i.type));
  if (raster) return { found: true, dataUri: toUri(raster) };
  const google = await googlePng(new URL(pageUrl).hostname).catch(() => null);
  return { found: true, dataUri: toUri(google ?? icons[0]) };
}
