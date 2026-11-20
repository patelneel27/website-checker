import { summarise } from "./scores";
import type { ScanRecord } from "./store";
import type { ScanResult } from "./types";

/** A scan still "pending" after this long was orphaned (e.g. the server restarted). */
const PENDING_STALE_MS = 3 * 60 * 1000;

export function toResult(scan: ScanRecord): ScanResult {
  const stale = scan.psiStatus === "pending" && Date.now() - scan.createdAt.getTime() > PENDING_STALE_MS;
  const psiStatus = stale ? "failed" : scan.psiStatus;
  return {
    id: scan.id,
    url: scan.url,
    site: scan.site ?? { title: null, favicon: null },
    seo: scan.seo ?? null,
    scores: scan.scores,
    metrics: scan.metrics,
    quickWins: scan.quickWins,
    checks: scan.checks,
    psiStatus,
    summary: summarise(scan.scores, scan.checks, psiStatus === "pending"),
    scannedAt: scan.createdAt.toISOString(),
  };
}
