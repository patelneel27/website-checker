import "server-only";
import type { CheerioAPI } from "cheerio";
import { safeFetch } from "./safe-fetch";
import type { SeoDetails } from "./types";

// Ahrefs-toolbar-style on-page details: what Google and social networks actually see.

const clean = (s: string | undefined | null) => {
  const v = (s ?? "").replace(/\s+/g, " ").trim();
  return v ? v : null;
};

function absolute(href: string | null, base: string): string | null {
  if (!href) return null;
  try {
    const u = new URL(href, base);
    return /^https?:$/.test(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Collects the top-level @types in JSON-LD (including @graph items), not nested ones like PostalAddress. */
function jsonLdTypes(value: unknown, out: Set<string>, depth = 0) {
  if (depth > 4 || value == null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((v) => jsonLdTypes(v, out, depth + 1));
    return;
  }
  const obj = value as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") out.add(t);
  else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && out.add(x));
  if (obj["@graph"]) jsonLdTypes(obj["@graph"], out, depth + 1);
}

const shortType = (t: string) => t.replace(/^https?:\/\/schema\.org\//i, "").replace(/^schema:/i, "").split(/[/#]/).pop() ?? t;

export function extractSeo($: CheerioAPI, pageUrl: string): SeoDetails {
  const meta = (selector: string) => clean($(selector).first().attr("content"));
  const host = new URL(pageUrl).hostname.replace(/^www\./, "");

  // ---- Structured data (schema.org)
  const types = new Set<string>();
  const formats = new Set<string>();
  let invalidJsonLd = 0;
  $('script[type="application/ld+json" i]').each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;
    try {
      jsonLdTypes(JSON.parse(text), types);
      formats.add("JSON-LD");
    } catch {
      invalidJsonLd++;
    }
  });
  // Top-level microdata / RDFa items only (nested ones carry itemprop / property).
  $("[itemscope][itemtype]:not([itemprop])").each((_, el) => {
    ($(el).attr("itemtype") ?? "").split(/\s+/).filter(Boolean).forEach((t) => types.add(t));
    formats.add("Microdata");
  });
  $("[typeof]:not([property])").each((_, el) => {
    ($(el).attr("typeof") ?? "").split(/\s+/).filter(Boolean).forEach((t) => types.add(t));
    formats.add("RDFa");
  });

  // ---- Headings, words, links, images
  const h1s = $("h1").toArray();
  const body = $("body").clone();
  body.find("script, style, noscript, template, svg").remove();
  const words = (body.text().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;

  let internal = 0;
  let external = 0;
  $("a[href]").each((_, el) => {
    const href = absolute($(el).attr("href") ?? null, pageUrl);
    if (!href) return;
    const linkHost = new URL(href).hostname.replace(/^www\./, "");
    if (linkHost === host) internal++;
    else external++;
  });

  const images = $("img").toArray();

  return {
    title: clean($("head > title").first().text() || $("title").first().text()),
    description: meta('meta[name="description" i]'),
    canonical: absolute(clean($('link[rel~="canonical" i]').attr("href")), pageUrl),
    lang: clean($("html").attr("lang")),
    robots: meta('meta[name="robots" i]'),
    headings: { h1: h1s.length, h2: $("h2").length, h3: $("h3").length, firstH1: clean($(h1s[0]).text())?.slice(0, 140) ?? null },
    wordCount: words,
    links: { internal, external },
    images: { total: images.length, missingAlt: images.filter((el) => $(el).attr("alt") === undefined).length },
    social: {
      ogTitle: meta('meta[property="og:title" i]'),
      ogDescription: meta('meta[property="og:description" i]'),
      ogImage: absolute(meta('meta[property="og:image" i]') ?? meta('meta[property="og:image:url" i]'), pageUrl),
      ogImageWorks: null,
      ogSiteName: meta('meta[property="og:site_name" i]'),
      ogType: meta('meta[property="og:type" i]'),
      twitterCard: meta('meta[name="twitter:card" i]'),
      twitterImage: absolute(meta('meta[name="twitter:image" i]'), pageUrl),
    },
    schema: { types: [...new Set([...types].map(shortType))].slice(0, 12), formats: [...formats], invalidJsonLd },
  };
}

/** Checks the social preview image actually loads (a broken og:image shows nothing when shared). */
export async function checkImageLoads(url: string): Promise<boolean> {
  const { response } = await safeFetch(url, { timeoutMs: 5000 });
  const ok = response.status === 200 && (response.headers.get("content-type") ?? "").startsWith("image/");
  await response.body?.cancel();
  return ok;
}
