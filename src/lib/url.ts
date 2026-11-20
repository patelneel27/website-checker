// URL normalisation (shared with the client for instant feedback).

export type NormaliseResult = { ok: true; url: string; host: string } | { ok: false; message: string };

/**
 * Accepts `example.co.uk`, `www.example.co.uk`, `http://…` or `https://example.co.uk/page`
 * and returns an `https://` URL. Only public-looking hostnames are allowed.
 */
export function normaliseUrl(input: string): NormaliseResult {
  let raw = (input ?? "").trim().replace(/\s+/g, "");
  if (!raw) return { ok: false, message: "Please type in your website address." };

  // People often paste "https//" or add trailing punctuation.
  raw = raw.replace(/^https?\/\//i, "").replace(/[.,;]+$/, "");
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, message: "That doesn't look like a website address. Try something like yourcompany.co.uk" };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, message: "That doesn't look like a website address. Try something like yourcompany.co.uk" };
  }
  parsed.protocol = "https:";

  const host = parsed.hostname.toLowerCase();
  const looksLikeDomain = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(host);
  if (!looksLikeDomain || parsed.username || parsed.password || parsed.port) {
    return { ok: false, message: "That doesn't look like a website address. Try something like yourcompany.co.uk" };
  }

  parsed.hash = "";
  let url = parsed.toString();
  // Treat "https://example.co.uk/" and "https://example.co.uk" as the same site.
  if (parsed.pathname === "/" && !parsed.search) url = url.replace(/\/$/, "");
  return { ok: true, url, host };
}

/** Key used for the 24-hour cache. */
export function cacheKey(url: string) {
  return url.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
