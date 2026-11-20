import "server-only";
import { after } from "next/server";
import { runPageSpeed, type PsiResult } from "./pagespeed";
import { runQuickChecks } from "./quick-checks";
import { sendReportsForScan } from "./report";
import { toResult } from "./scan-result";
import { createScan, findLatestScan, updateScan, type ScanRecord } from "./store";
import { cacheKey } from "./url";
import type { CheckResult, QuickWin, ScanResult } from "./types";

export { toResult };

/** A full result (with PageSpeed scores) is reused for 24 hours. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
/** If PageSpeed failed, the quick-check result is reused for an hour before we try again. */
const FAILED_TTL_MS = 60 * 60 * 1000;
/** After this long we show quick checks and finish PageSpeed in the background. */
const PSI_SOFT_DEADLINE_MS = 45_000;

// ---------------------------------------------------------------------------------------------
// Turning failed quick checks into quick wins

const CHECK_WIN_ORDER = [
  "indexable",
  "https",
  "viewport",
  "title",
  "meta-description",
  "response-time",
  "crawl",
  "h1",
  "img-alt",
  "canonical",
  "favicon",
  "schema",
  "social",
];

const CHECK_FIXES: Record<string, string> = {
  https: "We'd set up and enforce https so every visitor sees the padlock.",
  viewport: "We'd make your site properly responsive so it looks great on every phone.",
  title: "We'd write clear, keyword-rich titles for your key pages.",
  "meta-description": "We'd write a compelling description for each key page to win more clicks from Google.",
  "response-time": "We'd add caching and tune your hosting so pages start loading instantly.",
  crawl: "We'd add a sitemap and robots.txt so Google finds every page.",
  h1: "We'd give each page one clear main heading that tells Google what it's about.",
  social: "We'd add social preview tags so every share shows your image and headline.",
  indexable: "We'd remove the 'noindex' setting so Google can list this page again.",
  canonical: "We'd add canonical tags so Google knows which version of each page to rank.",
  "img-alt": "We'd add descriptive alt text to your images for screen readers and Google.",
  schema: "We'd add structured data (schema) so Google can show your business details, reviews and FAQs in results.",
  favicon: "We'd add a crisp favicon so your logo shows in browser tabs, bookmarks and Google.",
};

/** PageSpeed audits that cover the same ground as one of our checks. */
const CHECK_OVERLAPS: Record<string, string[]> = {
  https: ["is-on-https"],
  viewport: ["viewport", "viewport-insight"],
  title: ["document-title"],
  "meta-description": ["meta-description"],
  "response-time": ["server-response-time", "document-latency-insight"],
  crawl: ["robots-txt"],
  indexable: ["is-crawlable"],
  "img-alt": ["image-alt"],
};

export function mergeQuickWins(psiWins: QuickWin[], checks: CheckResult[], limit = 3): QuickWin[] {
  const wins = psiWins.slice(0, limit);
  const covered = new Set(wins.map((w) => w.id));
  const failedChecks = checks
    .filter((c) => !c.pass)
    .sort((a, b) => CHECK_WIN_ORDER.indexOf(a.id) - CHECK_WIN_ORDER.indexOf(b.id));
  for (const c of failedChecks) {
    if (wins.length >= limit) break;
    if ((CHECK_OVERLAPS[c.id] ?? []).some((id) => covered.has(id))) continue;
    wins.push({
      id: `check:${c.id}`,
      title: c.message.endsWith(".") ? c.message : `${c.message}.`,
      fix: CHECK_FIXES[c.id] ?? "We'd fix this as part of your website health plan.",
      category: "checks",
    });
  }
  return wins;
}

// ---------------------------------------------------------------------------------------------
// Running a scan

export type ScanOutcome = { ok: true; result: ScanResult; cached: boolean } | { ok: false; error: "unreachable" };

const g = globalThis as unknown as { __sterlixInflight?: Map<string, Promise<ScanOutcome>> };
const inflight = (g.__sterlixInflight ??= new Map());

/** Can an earlier scan of this site be shown again instead of re-scanning? */
function reusable(scan: ScanRecord): boolean {
  if (scan.seo === undefined) return false; // saved before the SEO details existed: re-scan
  const age = Date.now() - scan.createdAt.getTime();
  const status = toResult(scan).psiStatus; // stale "pending" scans count as failed
  if (status === "done") return age < CACHE_TTL_MS;
  if (status === "pending") return true; // PageSpeed still running: join it, the screen will update
  return age < FAILED_TTL_MS;
}

export async function scanWebsite(url: string, { fresh = false } = {}): Promise<ScanOutcome> {
  const key = cacheKey(url);

  // Two taps on "Run check" (or two tablets) share one scan.
  const running = inflight.get(key);
  if (running) return running;

  if (!fresh) {
    const latest = await findLatestScan(key).catch(() => null);
    if (latest && reusable(latest)) return { ok: true, result: toResult(latest), cached: true };
  }

  const promise = runFreshScan(url).finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

async function runFreshScan(url: string): Promise<ScanOutcome> {
  const started = Date.now();
  const psi: Promise<PsiResult> = runPageSpeed(url);
  psi.catch(() => {}); // handled below; avoid unhandled-rejection noise

  const quick = await runQuickChecks(url).catch((err) => {
    console.error("[scan] quick checks crashed", err);
    return { reachable: true, checks: [] as CheckResult[], site: { title: null, favicon: null }, seo: null };
  });

  if (!quick.reachable) return { ok: false, error: "unreachable" };

  type Settled = { state: "done"; value: PsiResult } | { state: "failed" } | { state: "pending" };
  const remaining = Math.max(0, PSI_SOFT_DEADLINE_MS - (Date.now() - started));
  let timer: ReturnType<typeof setTimeout> | undefined;
  const settled: Settled = await Promise.race([
    psi.then(
      (value): Settled => ({ state: "done", value }),
      (err): Settled => {
        console.error("[scan] PageSpeed failed", err instanceof Error ? err.message : err);
        return { state: "failed" };
      },
    ),
    new Promise<Settled>((resolve) => {
      timer = setTimeout(() => resolve({ state: "pending" }), remaining);
    }),
  ]);
  clearTimeout(timer);

  const psiValue = settled.state === "done" ? settled.value : null;
  const scan = await createScan({
    url,
    site: quick.site,
    seo: quick.seo,
    scores: psiValue?.scores ?? null,
    metrics: psiValue?.metrics ?? null,
    quickWins: mergeQuickWins(psiValue?.quickWins ?? [], quick.checks),
    checks: quick.checks,
    psiStatus: settled.state,
  });
  const result = toResult(scan);

  if (settled.state === "pending") {
    // Finish PageSpeed after responding, then email anyone who already asked for the report.
    after(async () => {
      const update = await psi.then(
        (v) => ({ psiStatus: "done" as const, scores: v.scores, metrics: v.metrics, quickWins: mergeQuickWins(v.quickWins, quick.checks) }),
        () => ({ psiStatus: "failed" as const }),
      );
      await updateScan(scan.id, update);
      await sendReportsForScan(scan.id);
    });
  }

  return { ok: true, result, cached: false };
}
