import "server-only";
import * as cheerio from "cheerio";
import { readTextCapped, safeFetch, UnreachableError, type SafeFetchResult } from "./safe-fetch";
import { loadFavicon } from "./favicon";
import { checkImageLoads, extractSeo } from "./seo";
import type { CheckResult, SeoDetails, SiteInfo } from "./types";

// Our own fast checks, run in parallel with PageSpeed. Any check that errors is simply
// left out: the visitor never sees an error.

const TIMEOUT_MS = 8000;

const TLS_ERROR_CODES = new Set([
  "CERT_HAS_EXPIRED",
  "CERT_NOT_YET_VALID",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "ERR_SSL_WRONG_VERSION_NUMBER",
]);

function errorCode(err: unknown): string | undefined {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.cause?.code ?? e?.code;
}

export type QuickCheckOutcome = {
  /** False when we couldn't load the site at all over https or http. */
  reachable: boolean;
  checks: CheckResult[];
  site: SiteInfo;
  seo: SeoDetails | null;
};

async function fetchHomepage(url: string): Promise<{ result: SafeFetchResult; httpsOk: boolean } | null> {
  try {
    const result = await safeFetch(url, { timeoutMs: TIMEOUT_MS });
    return { result, httpsOk: result.finalUrl.startsWith("https://") };
  } catch (err) {
    if (err instanceof UnreachableError) return null;
    const code = errorCode(err);
    const tlsProblem = code ? TLS_ERROR_CODES.has(code) || code.includes("CERT") || code.includes("SSL") : false;
    const refused = code === "ECONNREFUSED" || code === "ECONNRESET";
    if (!tlsProblem && !refused) return null;
    // https is broken: see whether the plain-http site works.
    try {
      const result = await safeFetch(url.replace(/^https:/, "http:"), { timeoutMs: TIMEOUT_MS });
      return { result, httpsOk: false };
    } catch {
      return null;
    }
  }
}

async function urlExists(url: string): Promise<boolean> {
  const { response } = await safeFetch(url, { timeoutMs: TIMEOUT_MS });
  const ok = response.status === 200;
  await response.body?.cancel();
  return ok;
}

export async function runQuickChecks(url: string): Promise<QuickCheckOutcome> {
  const home = await fetchHomepage(url);
  if (!home) return { reachable: false, checks: [], site: { title: null, favicon: null }, seo: null };

  const { result, httpsOk } = home;
  const origin = new URL(result.finalUrl).origin;
  const checks: CheckResult[] = [];
  const site: SiteInfo = { title: null, favicon: null };
  let seo: SeoDetails | null = null;

  // Start robots/sitemap while we parse the page.
  const robotsPromise = safeFetch(`${origin}/robots.txt`, { timeoutMs: TIMEOUT_MS }).then(async ({ response }) => ({
    ok: response.status === 200,
    text: response.status === 200 ? await readTextCapped(response, 200_000) : (await response.body?.cancel(), ""),
  }));
  const sitemapPromise = urlExists(`${origin}/sitemap.xml`);

  checks.push(
    httpsOk
      ? { id: "https", label: "Secure connection", pass: true, message: "Your site is secure (padlock)" }
      : { id: "https", label: "Secure connection", pass: false, message: "Visitors may see a 'Not secure' warning" },
  );

  const ttfb = result.ttfbMs / 1000;
  checks.push(
    result.ttfbMs < 800
      ? { id: "response-time", label: "Server response", pass: true, message: `Your server responds quickly (${ttfb.toFixed(1)} s)` }
      : {
          id: "response-time",
          label: "Server response",
          pass: false,
          message: `Your server takes ${ttfb.toFixed(1)} s to respond. Under 0.8 s is ideal.`,
        },
  );

  const contentType = result.response.headers.get("content-type") ?? "";
  if (result.response.status < 400 && contentType.includes("html")) {
    const html = await readTextCapped(result.response);
    const $ = cheerio.load(html);

    const title = ($("head > title").first().text() || $("title").first().text()).replace(/\s+/g, " ").trim();
    site.title = title ? title.slice(0, 120) : null;
    if (!title) {
      checks.push({ id: "title", label: "Page title", pass: false, message: "Your page is missing a clear title in Google" });
    } else if (title.length < 10 || title.length > 60) {
      checks.push({
        id: "title",
        label: "Page title",
        pass: false,
        message: `Your page title is ${title.length < 10 ? "very short" : "too long and gets cut off"} in Google (${title.length} characters; 10–60 is ideal)`,
      });
    } else {
      checks.push({ id: "title", label: "Page title", pass: true, message: "Google shows a clear page title" });
    }

    const description = ($('meta[name="description" i]').attr("content") ?? "").trim();
    if (!description) {
      checks.push({ id: "meta-description", label: "Google description", pass: false, message: "Google has no description to show under your link" });
    } else if (description.length < 50 || description.length > 160) {
      checks.push({
        id: "meta-description",
        label: "Google description",
        pass: false,
        message: `Your Google description is ${description.length < 50 ? "too short to sell the click" : "too long and gets cut off"} (${description.length} characters; 50–160 is ideal)`,
      });
    } else {
      checks.push({ id: "meta-description", label: "Google description", pass: true, message: "Google has a description to show under your link" });
    }

    const hasViewport = $('meta[name="viewport" i]').length > 0;
    checks.push(
      hasViewport
        ? { id: "viewport", label: "Mobile screens", pass: true, message: "Built for mobile screens" }
        : { id: "viewport", label: "Mobile screens", pass: false, message: "Your site isn't set up for mobile screens, so phones show a shrunken desktop page" },
    );

    const h1Count = $("h1").length;
    checks.push(
      h1Count === 1
        ? { id: "h1", label: "Main heading", pass: true, message: "Clear main heading for Google" }
        : {
            id: "h1",
            label: "Main heading",
            pass: false,
            message:
              h1Count === 0
                ? "Your page has no main heading, so Google has to guess what it's about"
                : `Your page has ${h1Count} main headings; one clear heading helps Google`,
          },
    );

    seo = extractSeo($, result.finalUrl);
    const social = seo.social;
    if (social.ogImage) social.ogImageWorks = await checkImageLoads(social.ogImage).catch(() => false);
    const socialProblem = !social.ogTitle
      ? "Links to your site show no proper title when shared on social media"
      : !social.ogImage
        ? "Links to your site show no preview image when shared on social media"
        : social.ogImageWorks === false
          ? "Your social preview image is broken, so shares show no picture"
          : null;
    checks.push(
      socialProblem
        ? { id: "social", label: "Social sharing", pass: false, message: socialProblem }
        : { id: "social", label: "Social sharing", pass: true, message: "Looks good when shared on social media (title and preview image)" },
    );

    const schemaTypes = seo.schema.types;
    checks.push(
      schemaTypes.length > 0
        ? {
            id: "schema",
            label: "Structured data (schema)",
            pass: true,
            message: `Has structured data Google can read: ${schemaTypes.slice(0, 4).join(", ")}${schemaTypes.length > 4 ? "…" : ""}`,
          }
        : {
            id: "schema",
            label: "Structured data (schema)",
            pass: false,
            message: "No structured data (schema), so Google can't show rich results like your business details, reviews or FAQs",
          },
    );

    // ---- Ahrefs-style on-page extras ----------------------------------------------------------

    // Indexable: a "noindex" hides the page from Google entirely, so it goes first if it fails.
    const robotsMeta = ($('meta[name="robots" i]').attr("content") ?? "") + " " + ($('meta[name="googlebot" i]').attr("content") ?? "");
    const robotsHeader = result.response.headers.get("x-robots-tag") ?? "";
    const noindex = /noindex|none/i.test(robotsMeta) || /noindex|none/i.test(robotsHeader);
    checks.push(
      noindex
        ? { id: "indexable", label: "Shown in Google", pass: false, message: "This page tells Google not to show it in search results (noindex)" }
        : { id: "indexable", label: "Shown in Google", pass: true, message: "Google is allowed to show this page in search results" },
    );

    const canonical = ($('link[rel~="canonical" i]').attr("href") ?? "").trim();
    checks.push(
      canonical
        ? { id: "canonical", label: "Main address (canonical)", pass: true, message: "Tells Google which address is the main version of the page" }
        : {
            id: "canonical",
            label: "Main address (canonical)",
            pass: false,
            message: "No canonical tag, so Google may see duplicate versions of your pages",
          },
    );

    const images = $("img").toArray();
    if (images.length > 0) {
      const missingAlt = images.filter((el) => $(el).attr("alt") === undefined).length;
      checks.push(
        missingAlt === 0
          ? { id: "img-alt", label: "Image descriptions", pass: true, message: `All ${images.length} images have descriptions (alt text)` }
          : {
              id: "img-alt",
              label: "Image descriptions",
              pass: false,
              message: `${missingAlt} of ${images.length} images have no description (alt text), which hurts accessibility and SEO`,
            },
      );
    }

    // Favicon: the little logo in browser tabs, bookmarks and Google's mobile results.
    const favicon = await loadFavicon($, result.finalUrl).catch(() => null);
    site.favicon = favicon?.dataUri ?? null;
    checks.push(
      favicon?.found
        ? { id: "favicon", label: "Favicon", pass: true, message: "Has a favicon, so your logo shows in browser tabs and Google results" }
        : { id: "favicon", label: "Favicon", pass: false, message: "No favicon, so Google and browser tabs show a blank icon instead of your logo" },
    );
  } else {
    await result.response.body?.cancel();
  }

  const [robots, sitemap] = await Promise.allSettled([robotsPromise, sitemapPromise]);
  if (robots.status === "fulfilled" || sitemap.status === "fulfilled") {
    const robotsOk = robots.status === "fulfilled" && robots.value.ok;
    // A sitemap listed in robots.txt (e.g. /sitemap_index.xml) counts too.
    const sitemapOk =
      (sitemap.status === "fulfilled" && sitemap.value) ||
      (robots.status === "fulfilled" && /^\s*sitemap:\s*\S+/im.test(robots.value.text));
    checks.push(
      robotsOk && sitemapOk
        ? { id: "crawl", label: "Google can find your pages", pass: true, message: "Google can find all your pages" }
        : {
            id: "crawl",
            label: "Google can find your pages",
            pass: false,
            message: !sitemapOk
              ? "There's no sitemap, so Google may miss some of your pages"
              : "There's no robots.txt file to guide Google around your site",
          },
    );
  }

  return { reachable: true, checks, site, seo };
}
