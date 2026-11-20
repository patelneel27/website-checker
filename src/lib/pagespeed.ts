import "server-only";
import { config } from "./config";
import { CATEGORY_KEYS, type CategoryKey, type Metrics, type QuickWin, type Scores } from "./types";

// Google PageSpeed Insights v5 (Lighthouse lab data, mobile). Field data
// (loadingExperience) is deliberately ignored.

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
export const PSI_TIMEOUT_MS = 60_000;

type Audit = {
  id: string;
  title: string;
  score: number | null;
  scoreDisplayMode?: string;
  numericValue?: number;
  displayValue?: string;
  details?: { type?: string; overallSavingsMs?: number };
  metricSavings?: Record<string, number>;
};

type AuditRef = { id: string; weight: number; group?: string };

type LighthouseResult = {
  categories: Record<string, { score: number | null; auditRefs: AuditRef[] }>;
  audits: Record<string, Audit>;
};

export type PsiResult = { scores: Scores; metrics: Metrics; quickWins: QuickWin[] };

export async function runPageSpeed(url: string): Promise<PsiResult> {
  const params = new URLSearchParams({ url, strategy: "mobile", locale: "en_GB" });
  for (const c of CATEGORY_KEYS) params.append("category", c);
  if (config.psiApiKey) params.set("key", config.psiApiKey);

  const res = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(PSI_TIMEOUT_MS), cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PageSpeed ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { lighthouseResult?: LighthouseResult };
  const lh = json.lighthouseResult;
  if (!lh) throw new Error("PageSpeed returned no lighthouseResult");
  return parseLighthouse(lh);
}

export function parseLighthouse(lh: LighthouseResult): PsiResult {
  const scores = Object.fromEntries(
    CATEGORY_KEYS.map((k) => {
      const s = lh.categories[k]?.score;
      return [k, typeof s === "number" ? Math.round(s * 100) : null];
    }),
  ) as Scores;

  const num = (id: string) => {
    const v = lh.audits[id]?.numericValue;
    return typeof v === "number" ? v : null;
  };
  const metrics: Metrics = {
    lcpMs: num("largest-contentful-paint"),
    cls: num("cumulative-layout-shift"),
    tbtMs: num("total-blocking-time"),
  };

  return { scores, metrics, quickWins: pickQuickWins(lh, metrics, 3) };
}

// ---------------------------------------------------------------------------------------------
// Quick wins

type Copy = { title: string; fix: string; group?: string };

// Plain-English copy. Older Lighthouse audit ids and their newer "insight" equivalents
// share a `group` so we never show the same problem twice.
// A string value is an alias to another entry.
const COPY: Record<string, Copy | string | ((a: Audit, m: Metrics) => Copy)> = {
  "largest-contentful-paint": (_a, m) => ({
    title: `Your main content takes ${((m.lcpMs ?? 0) / 1000).toFixed(1)} s to appear on mobile. Under 2.5 s is good.`,
    fix: "We'd streamline what loads first so your main content appears in under 2.5 seconds.",
  }),
  "render-blocking-resources": {
    title: "Some files stop your page showing quickly. We can load them smarter.",
    fix: "We'd defer and inline the files that block your page, so it starts showing straight away.",
    group: "render-blocking",
  },
  "render-blocking-insight": "render-blocking-resources",
  "uses-optimized-images": {
    title: "Your images are larger than they need to be. Compressing them makes pages faster.",
    fix: "We'd compress and resize your images and serve modern formats like WebP and AVIF.",
    group: "images",
  },
  "modern-image-formats": "uses-optimized-images",
  "image-delivery-insight": "uses-optimized-images",
  "uses-responsive-images": "uses-optimized-images",
  "offscreen-images": {
    title: "Images further down the page load before they're needed, slowing phones down.",
    fix: "We'd lazy-load images so only what's on screen loads first.",
    group: "images-lazy",
  },
  "unused-javascript": {
    title: "Your site loads code it doesn't use, which slows phones down.",
    fix: "We'd remove and split unused code so phones only download what each page needs.",
    group: "js",
  },
  "legacy-javascript-insight": {
    title: "Your site sends old-style code to modern phones, which adds weight.",
    fix: "We'd update your build so modern browsers get smaller, faster code.",
    group: "js-legacy",
  },
  "unused-css-rules": {
    title: "Your site loads styling it doesn't use, which delays the first view.",
    fix: "We'd trim unused styles so pages render sooner.",
    group: "css",
  },
  "server-response-time": {
    title: "Your server is slow to send the first byte of your page.",
    fix: "We'd add caching and tune your hosting so pages start loading instantly.",
    group: "server",
  },
  "document-latency-insight": "server-response-time",
  "uses-long-cache-ttl": {
    title: "Returning visitors re-download files they already have.",
    fix: "We'd set proper caching so repeat visits load almost instantly.",
    group: "cache",
  },
  "cache-insight": "uses-long-cache-ttl",
  "uses-text-compression": {
    title: "Your pages aren't compressed, so they take longer to download.",
    fix: "We'd switch on compression on your server, a quick and easy win.",
    group: "compression",
  },
  "font-display": {
    title: "Text stays invisible while your fonts load.",
    fix: "We'd make text show instantly while custom fonts load in the background.",
    group: "fonts",
  },
  "font-display-insight": "font-display",
  "third-party-summary": {
    title: "Third-party scripts (chat, tracking, widgets) are slowing your pages.",
    fix: "We'd audit your third-party scripts and load them only when needed.",
    group: "third-party",
  },
  "third-parties-insight": "third-party-summary",
  "dom-size": {
    title: "Your pages are very complex behind the scenes, which makes phones work harder.",
    fix: "We'd simplify your page structure so it renders faster.",
    group: "dom",
  },
  "dom-size-insight": "dom-size",
  "lcp-discovery-insight": {
    title: "Your main image is found late, so it appears later than it should.",
    fix: "We'd tell the browser about your main image early so it loads first.",
    group: "lcp-discovery",
  },
  "cls-culprits-insight": {
    title: "Your page jumps around while it loads, which is frustrating on mobile.",
    fix: "We'd reserve space for images and adverts so nothing shifts as the page loads.",
    group: "cls",
  },
  "layout-shifts": "cls-culprits-insight",
  "network-dependency-tree-insight": {
    title: "Files load one after another instead of together, delaying your page.",
    fix: "We'd restructure loading so key files arrive in parallel.",
    group: "chains",
  },
  "critical-request-chains": "network-dependency-tree-insight",
  "bootup-time": {
    title: "Your site's code takes a long time to run on phones.",
    fix: "We'd reduce and optimise your scripts so pages respond quickly to taps.",
    group: "js-exec",
  },
  "mainthread-work-breakdown": "bootup-time",
  "meta-description": {
    title: "Google has no description to show under your link.",
    fix: "We'd write a compelling description for each key page to win more clicks from Google.",
    group: "meta-description",
  },
  "document-title": {
    title: "Your page is missing a clear title in Google.",
    fix: "We'd write clear, keyword-rich titles for your key pages.",
    group: "title",
  },
  "color-contrast": {
    title: "Some text is hard to read against its background.",
    fix: "We'd adjust your colours so every word is easy to read, keeping your brand look.",
    group: "contrast",
  },
  "image-alt": {
    title: "Images are missing descriptions, which hurts accessibility and SEO.",
    fix: "We'd add descriptive alt text to your images for screen readers and Google.",
    group: "alt",
  },
  "tap-targets": {
    title: "Buttons and links are too close together on mobile.",
    fix: "We'd enlarge and space out buttons and links so they're easy to tap.",
    group: "tap",
  },
  "target-size": "tap-targets",
  "is-on-https": {
    title: "Your site isn't fully secure (https).",
    fix: "We'd make sure every page and file loads securely, so visitors see the padlock.",
    group: "https",
  },
  "link-text": {
    title: "Some links say things like 'click here', which doesn't help Google or visitors.",
    fix: "We'd rewrite link text so it clearly says where each link goes.",
    group: "link-text",
  },
  "crawlable-anchors": {
    title: "Some links can't be followed by Google.",
    fix: "We'd fix your links so Google can follow them to every page.",
    group: "crawl-links",
  },
  "is-crawlable": {
    title: "Your page is blocked from appearing in Google.",
    fix: "We'd check your settings so the pages you want found can appear in Google.",
    group: "indexing",
  },
  "robots-txt": {
    title: "Your robots.txt file has problems that may confuse Google.",
    fix: "We'd correct your robots.txt so Google crawls the right pages.",
    group: "robots",
  },
  "button-name": {
    title: "Some buttons have no label, so screen readers can't describe them.",
    fix: "We'd label every button so the site works for everyone.",
    group: "button-name",
  },
  "link-name": {
    title: "Some links have no text, so screen readers can't describe them.",
    fix: "We'd give every link a clear name.",
    group: "link-name",
  },
  "label": {
    title: "Some form fields have no label, which makes forms hard to fill in.",
    fix: "We'd label every form field so enquiries are easy to send.",
    group: "label",
  },
  "heading-order": {
    title: "Your headings skip levels, which makes pages harder to follow.",
    fix: "We'd tidy your heading structure for readers and Google.",
    group: "heading-order",
  },
  "html-has-lang": {
    title: "Your page doesn't say which language it's in.",
    fix: "We'd set the page language so browsers and screen readers handle it properly.",
    group: "lang",
  },
  "errors-in-console": {
    title: "Your site has behind-the-scenes errors that may break features for some visitors.",
    fix: "We'd track down and fix the errors your site throws in the browser.",
    group: "console",
  },
  "inspector-issues": "errors-in-console",
  "image-aspect-ratio": {
    title: "Some images look stretched or squashed.",
    fix: "We'd fix image sizing so everything looks crisp and in proportion.",
    group: "aspect",
  },
  "image-size-responsive": {
    title: "Some images look blurry on high-resolution phone screens.",
    fix: "We'd serve sharper images sized for modern screens.",
    group: "img-res",
  },
  "viewport": {
    title: "Your site isn't set up for mobile screens.",
    fix: "We'd make your site properly responsive so it looks great on every phone.",
    group: "viewport",
  },
  "viewport-insight": "viewport",
};

function copyFor(audit: Audit, metrics: Metrics): Copy {
  let entry = COPY[audit.id];
  if (typeof entry === "string") entry = COPY[entry];
  if (typeof entry === "function") return { ...entry(audit, metrics), group: audit.id };
  if (entry && typeof entry !== "string") return entry;
  // Fallback: Lighthouse's own title.
  return { title: audit.title, fix: "We'd look into this and fix it as part of your website health plan.", group: audit.id };
}

function savingsMs(a: Audit): number {
  if (typeof a.details?.overallSavingsMs === "number") return a.details.overallSavingsMs;
  const m = a.metricSavings ?? {};
  return (m.LCP ?? 0) + (m.FCP ?? 0) + (m.TBT ?? 0) + (m.INP ?? 0);
}

function failed(a: Audit | undefined): a is Audit {
  if (!a || a.score == null) return false;
  if (a.scoreDisplayMode && ["informative", "notApplicable", "manual", "error"].includes(a.scoreDisplayMode)) return false;
  return a.score < 0.9;
}

function pickQuickWins(lh: LighthouseResult, metrics: Metrics, limit: number): QuickWin[] {
  const candidates: { audit: Audit; category: CategoryKey }[] = [];

  // 1. A slow main-content time is the easiest thing for a visitor to understand.
  const lcp = lh.audits["largest-contentful-paint"];
  if (failed(lcp)) candidates.push({ audit: lcp, category: "performance" });

  // 2. Performance opportunities, biggest saving first.
  const perfRefs = lh.categories.performance?.auditRefs ?? [];
  const opportunities = perfRefs
    .filter((r) => r.group !== "metrics" && r.group !== "hidden")
    .map((r) => lh.audits[r.id])
    .filter(failed)
    .filter((a) => a.details?.type === "opportunity" || savingsMs(a) > 0)
    .sort((a, b) => savingsMs(b) - savingsMs(a));
  opportunities.forEach((audit) => candidates.push({ audit, category: "performance" }));

  // 3. Failed SEO, then accessibility, then best-practice audits, most important first.
  for (const category of ["seo", "accessibility", "best-practices"] as const) {
    (lh.categories[category]?.auditRefs ?? [])
      .filter((r) => r.weight > 0 && r.group !== "hidden")
      .sort((a, b) => b.weight - a.weight)
      .map((r) => lh.audits[r.id])
      .filter(failed)
      .forEach((audit) => candidates.push({ audit, category }));
  }

  const seen = new Set<string>();
  const wins: QuickWin[] = [];
  for (const { audit, category } of candidates) {
    const copy = copyFor(audit, metrics);
    const group = copy.group ?? audit.id;
    if (seen.has(group)) continue;
    seen.add(group);
    wins.push({ id: audit.id, title: copy.title, fix: copy.fix, category });
    if (wins.length >= limit) break;
  }
  return wins;
}
