import "server-only";
import { randomUUID } from "node:crypto";
import { config } from "./config";
import { readJson, writeJson } from "./json-file";
import type { CheckResult, Metrics, PsiStatus, QuickWin, Scores, SeoDetails, SiteInfo } from "./types";
import { cacheKey } from "./url";

// No database: Zoho CRM is the system of record for leads.
// - Scans are kept in memory and in SCANS_FILE (last 2 days), so a site that was already
//   checked comes back instantly, even after a restart.
// - Leads are kept in memory AND in LEADS_FILE so staff mode, re-sending and CSV export
//   survive a restart, and nothing is lost if Zoho is unreachable.

export type ScanRecord = {
  id: string;
  url: string;
  site: SiteInfo;
  /** Missing on scans saved before the SEO details were added. */
  seo?: SeoDetails | null;
  scores: Scores | null;
  metrics: Metrics | null;
  quickWins: QuickWin[];
  checks: CheckResult[];
  psiStatus: PsiStatus;
  createdAt: Date;
};

export type LeadRecord = {
  id: string;
  scanId: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  interest: string[];
  consentAt: Date;
  source: string;
  reportSentAt: Date | null;
  zohoId: string | null;
  zohoError: string | null;
  createdAt: Date;
};

/** A lead with a snapshot of the scan it came from. */
export type LeadWithScan = LeadRecord & { scan: ScanRecord };

export type NewScan = Omit<ScanRecord, "id" | "createdAt">;
export type ScanUpdate = Partial<Omit<ScanRecord, "id" | "createdAt" | "url" | "site" | "seo">>;
export type NewLead = Omit<LeadRecord, "id" | "createdAt" | "reportSentAt" | "zohoId" | "zohoError">;

type Db = { scans: Map<string, ScanRecord>; leads: Map<string, LeadWithScan>; loaded: Promise<void> | null };
const g = globalThis as unknown as { __sterlixDb?: Db };
const db: Db = (g.__sterlixDb ??= { scans: new Map(), leads: new Map(), loaded: null });

// ---------------------------------------------------------------------------------------------
// File persistence

const SCAN_KEEP_MS = 2 * 24 * 60 * 60 * 1000;

const reviveScan = (raw: ScanRecord): ScanRecord => ({
  ...raw,
  site: raw.site ?? { title: null, favicon: null },
  createdAt: new Date(raw.createdAt),
});

function reviveLead(raw: LeadWithScan): LeadWithScan {
  const d = (v: unknown) => (v ? new Date(v as string) : null);
  return {
    ...raw,
    consentAt: d(raw.consentAt)!,
    createdAt: d(raw.createdAt)!,
    reportSentAt: d(raw.reportSentAt),
    scan: reviveScan(raw.scan),
  };
}

function ensureLoaded(): Promise<void> {
  db.loaded ??= Promise.all([readJson<LeadWithScan>(config.leadsFile), readJson<ScanRecord>(config.scansFile)]).then(
    ([leads, scans]) => {
      for (const raw of leads) {
        const lead = reviveLead(raw);
        if (!db.leads.has(lead.id)) db.leads.set(lead.id, lead);
      }
      const cutoff = Date.now() - SCAN_KEEP_MS;
      for (const raw of scans) {
        const scan = reviveScan(raw);
        if (scan.createdAt.getTime() >= cutoff && !db.scans.has(scan.id)) db.scans.set(scan.id, scan);
      }
    },
  );
  return db.loaded;
}

const persist = () => writeJson(config.leadsFile, () => [...db.leads.values()]);
const persistScans = () => writeJson(config.scansFile, () => [...db.scans.values()]);

// ---------------------------------------------------------------------------------------------
// Scans

export async function createScan(data: NewScan): Promise<ScanRecord> {
  await ensureLoaded();
  const rec: ScanRecord = { ...data, id: randomUUID(), createdAt: new Date() };
  db.scans.set(rec.id, rec);
  const cutoff = Date.now() - SCAN_KEEP_MS;
  for (const [id, s] of db.scans) if (s.createdAt.getTime() < cutoff) db.scans.delete(id);
  await persistScans();
  return rec;
}

/** Adds a scan we only know from a signed snapshot (e.g. after a restart). */
export function restoreScan(scan: ScanRecord) {
  if (!db.scans.has(scan.id)) db.scans.set(scan.id, scan);
}

export async function updateScan(id: string, data: ScanUpdate): Promise<void> {
  await ensureLoaded();
  const rec = db.scans.get(id);
  if (!rec) return;
  const next = { ...rec, ...data };
  db.scans.set(id, next);
  await persistScans();
  // Keep lead snapshots in step (e.g. PageSpeed finished after the visitor left their details).
  let changed = false;
  for (const lead of db.leads.values()) {
    if (lead.scanId === id) {
      lead.scan = next;
      changed = true;
    }
  }
  if (changed) await persist();
}

export async function getScan(id: string): Promise<ScanRecord | null> {
  await ensureLoaded();
  return db.scans.get(id) ?? null;
}

/** Most recent scan of the same site (www and trailing slash ignored). */
export async function findLatestScan(key: string): Promise<ScanRecord | null> {
  await ensureLoaded();
  let latest: ScanRecord | null = null;
  for (const s of db.scans.values()) {
    if (cacheKey(s.url) === key && (!latest || s.createdAt > latest.createdAt)) latest = s;
  }
  return latest;
}

export async function listScans(since: Date): Promise<ScanRecord[]> {
  await ensureLoaded();
  return [...db.scans.values()].filter((s) => s.createdAt >= since).sort((a, b) => +b.createdAt - +a.createdAt);
}

// ---------------------------------------------------------------------------------------------
// Leads

export async function createLead(data: NewLead, scan: ScanRecord): Promise<LeadWithScan> {
  await ensureLoaded();
  const rec: LeadWithScan = {
    ...data,
    id: randomUUID(),
    createdAt: new Date(),
    reportSentAt: null,
    zohoId: null,
    zohoError: null,
    scan,
  };
  db.leads.set(rec.id, rec);
  await persist();
  return rec;
}

export async function getLead(id: string): Promise<LeadWithScan | null> {
  await ensureLoaded();
  return db.leads.get(id) ?? null;
}

export async function listLeads(since: Date | null): Promise<LeadWithScan[]> {
  await ensureLoaded();
  return [...db.leads.values()].filter((l) => !since || l.createdAt >= since).sort((a, b) => +b.createdAt - +a.createdAt);
}

export async function updateLead(id: string, data: Partial<Pick<LeadRecord, "reportSentAt" | "zohoId" | "zohoError">>) {
  await ensureLoaded();
  const lead = db.leads.get(id);
  if (!lead) return;
  Object.assign(lead, data);
  await persist();
}

/** Marks unsent leads for a scan as sent and returns them, so only one sender wins. */
export async function claimUnsentLeads(scanId: string): Promise<LeadWithScan[]> {
  await ensureLoaded();
  const now = new Date();
  const claimed = [...db.leads.values()].filter((l) => l.scanId === scanId && !l.reportSentAt);
  claimed.forEach((l) => (l.reportSentAt = now));
  if (claimed.length) await persist();
  return claimed;
}

/** Marks one lead as sent if it isn't already. Returns true if this caller won. */
export async function claimLead(id: string): Promise<boolean> {
  await ensureLoaded();
  const lead = db.leads.get(id);
  if (!lead || lead.reportSentAt) return false;
  lead.reportSentAt = new Date();
  await persist();
  return true;
}
