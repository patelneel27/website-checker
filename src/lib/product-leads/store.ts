import "server-only";
import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "../json-file";

// Demo-request leads for a product showcase (StaffMain, LetFlows…). Kept in memory and in a
// JSON file per product (Zoho is the system of record), so staff mode, notes and CSV export
// survive a restart.

type Base = { clientId: string; capturedAt: string; consent: true; firstName: string; lastName: string; email: string };

export type ProductLead<D extends Base> = Omit<D, "consent" | "capturedAt"> & {
  id: string;
  source: string;
  eventName: string;
  capturedAt: Date;
  consentAt: Date;
  createdAt: Date;
  note: string;
  thanksSentAt: Date | null;
  accountEmailSentAt: Date | null;
  zohoId: string | null;
  zohoError: string | null;
};

export type LeadPatch = Partial<{
  note: string;
  thanksSentAt: Date | null;
  accountEmailSentAt: Date | null;
  zohoId: string | null;
  zohoError: string | null;
}>;

const DATE_KEYS = ["capturedAt", "consentAt", "createdAt", "thanksSentAt", "accountEmailSentAt"] as const;

export function createLeadStore<D extends Base>(key: string, file: () => string) {
  type Lead = ProductLead<D>;
  type Db = { leads: Map<string, Lead>; loaded: Promise<void> | null };
  const g = globalThis as unknown as Record<string, Db | undefined>;
  const db: Db = (g[`__leads_${key}`] ??= { leads: new Map(), loaded: null });

  const revive = (raw: Lead): Lead => {
    const lead = { ...raw } as Record<string, unknown>;
    for (const k of DATE_KEYS) lead[k] = raw[k] ? new Date(raw[k] as unknown as string) : null;
    return lead as Lead;
  };

  const ensureLoaded = () =>
    (db.loaded ??= readJson<Lead>(file()).then((rows) => {
      for (const raw of rows) if (!db.leads.has(raw.id)) db.leads.set(raw.id, revive(raw));
    }));

  const persist = () => writeJson(file(), () => [...db.leads.values()]);

  return {
    /** Saves a lead. If this device already sent it (offline retry), returns the existing one. */
    async create(data: D, meta: { source: string; eventName: string }): Promise<{ lead: Lead; created: boolean }> {
      await ensureLoaded();
      for (const l of db.leads.values()) if (l.clientId === data.clientId) return { lead: l, created: false };
      const { consent: _c, capturedAt, ...rest } = data;
      void _c;
      const lead = {
        ...rest,
        ...meta,
        id: randomUUID(),
        capturedAt: new Date(capturedAt),
        consentAt: new Date(capturedAt),
        createdAt: new Date(),
        note: "",
        thanksSentAt: null,
        accountEmailSentAt: null,
        zohoId: null,
        zohoError: null,
      } as unknown as Lead;
      db.leads.set(lead.id, lead);
      await persist();
      return { lead, created: true };
    },

    async get(id: string): Promise<Lead | null> {
      await ensureLoaded();
      return db.leads.get(id) ?? null;
    },

    async list(since: Date | null): Promise<Lead[]> {
      await ensureLoaded();
      return [...db.leads.values()].filter((l) => !since || l.capturedAt >= since).sort((a, b) => +b.capturedAt - +a.capturedAt);
    },

    async update(id: string, data: LeadPatch): Promise<Lead | null> {
      await ensureLoaded();
      const lead = db.leads.get(id);
      if (!lead) return null;
      Object.assign(lead, data);
      await persist();
      return lead;
    },

    /** Marks the thank-you email as sent if it isn't already. Returns true if this caller won. */
    async claimThanks(id: string): Promise<boolean> {
      await ensureLoaded();
      const lead = db.leads.get(id);
      if (!lead || lead.thanksSentAt) return false;
      lead.thanksSentAt = new Date();
      await persist();
      return true;
    },
  };
}

export type LeadStore<D extends Base> = ReturnType<typeof createLeadStore<D>>;
