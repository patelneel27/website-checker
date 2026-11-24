"use client";

import { useCallback, useEffect, useState } from "react";
import { getAttract, getHome, getKioskMode, HOMES, isKioskDevice, setAttract, setHome, setKioskMode, type KioskMode } from "@/lib/kiosk-device";
import { queuedLeadCount } from "@/lib/lead-queue";
import { BAND_COLOURS, bandFor } from "@/lib/scores";
import type { Scores } from "@/lib/types";
import { PillButton } from "./Buttons";
import { StaffmainGuide } from "./staffmain/StaffmainGuide";

type TodayData = {
  zohoEnabled: boolean;
  mailerEnabled: boolean;
  scans: { id: string; url: string; scores: Scores | null; psiStatus: string; createdAt: string }[];
  leads: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    interest: string[];
    url: string;
    reportSentAt: string | null;
    zohoId: string | null;
    zohoError: string | null;
    createdAt: string;
  }[];
  products: Record<ProductKey, { signupUrl: string | null; leads: ProductRow[] }>;
};

const PRODUCT_TABS = { enquiry: "Enquiries", staffmain: "StaffMain", letflows: "LetFlows" } as const;
const ZOHO_TAG = { enquiry: "General Enquiry", staffmain: "StaffMain", letflows: "LetFlows" } as const;
type ProductKey = keyof typeof PRODUCT_TABS;
const isProductTab = (t: string): t is ProductKey => t in PRODUCT_TABS;

type ProductRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  details: string[];
  note: string;
  thanksSentAt: string | null;
  accountEmailSentAt: string | null;
  zohoId: string | null;
  zohoError: string | null;
  createdAt: string;
};

export type StaffTab = "leads" | "enquiry" | "staffmain" | "letflows" | "guide" | "scans" | "device";
type Tab = StaffTab;

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const site = (url: string) => url.replace(/^https?:\/\//, "");

export function StaffPanel({
  demoUrl,
  initialTab = "leads",
  onClose,
  onResetKiosk,
}: {
  demoUrl: string;
  initialTab?: Tab;
  onClose: () => void;
  onResetKiosk: () => void;
}) {
  // Always starts locked: the PIN is asked for every time staff mode opens.
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<TodayData | null>(null);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  /** The StaffMain guide on its own, full screen, for a visitor to read. */
  const [presenting, setPresenting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/staff/today", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    if (res.ok) setData(await res.json());
  }, []);

  // Tells attract mode not to cover staff mode.
  useEffect(() => {
    document.body.dataset.staff = "open";
    return () => {
      delete document.body.dataset.staff;
    };
  }, []);

  async function resend(leadId: string) {
    setBusy(leadId);
    const res = await fetch("/api/staff/resend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    setBusy(null);
    setNotice(res.ok ? "Report sent again." : "Couldn't send the report. Check the email settings.");
    void load();
  }

  async function warmUp() {
    setBusy("warm");
    setNotice(`Scanning ${demoUrl}… this can take up to a minute.`);
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: demoUrl, fresh: true }),
    });
    setBusy(null);
    setNotice(res.ok ? `${demoUrl} is cached: the demo will be instant.` : "Warm-up scan failed. Check the connection and PSI_API_KEY.");
    void load();
  }

  async function retryZoho() {
    setBusy("zoho");
    const res = await fetch("/api/staff/sync", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as { synced?: number; failed?: number };
    setBusy(null);
    setNotice(
      res.ok && !body.failed
        ? `Zoho is up to date${body.synced ? ` (${body.synced} lead${body.synced === 1 ? "" : "s"} added)` : ""}.`
        : `${body.failed ?? "Some"} lead(s) still couldn't reach Zoho. They're saved here; try again later.`,
    );
    void load();
  }

  /** Close and sign out, so the next long press asks for the PIN again. */
  function close() {
    void fetch("/api/staff/logout", { method: "POST", keepalive: true }).catch(() => {});
    onClose();
  }

  async function logoutAndReset() {
    await fetch("/api/staff/logout", { method: "POST" }).catch(() => {});
    onResetKiosk();
  }

  if (presenting) {
    // Visitor view: only the guide. Closing signs out, so nobody can tap back into the leads.
    return (
      <div className="paper fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label="StaffMain guide">
        <div className="flex-1 overflow-y-auto pb-28">
          <StaffmainGuide large />
        </div>
        <div className="paper-bar">
          <div className="mx-auto flex max-w-[34rem] justify-center">
            <PillButton icon="close" onClick={close} className="w-full justify-center">
              Close the guide
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-navy/60 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Staff mode">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b-2 border-line px-6 py-4">
          <h2 className="text-2xl font-extrabold">Staff mode</h2>
          <button type="button" className="btn-secondary" onClick={close}>
            Close
          </button>
        </div>

        {!authed && <PinPad onSuccess={load} />}

        {authed && (
          <>
            <div className="flex flex-wrap gap-3 border-b-2 border-line px-6 py-4">
              <a className="btn-primary min-h-14 px-6 text-lg" href="/enquiry?by=team">
                + Quick enquiry
              </a>
              <a className="btn-secondary" href={`/api/staff/export?range=today${isProductTab(tab) ? `&product=${tab}` : ""}`} download>
                Export today (CSV)
              </a>
              <a className="btn-secondary" href={`/api/staff/export?range=all${isProductTab(tab) ? `&product=${tab}` : ""}`} download>
                Export all (CSV)
              </a>
              <button type="button" className="btn-secondary" onClick={warmUp} disabled={busy === "warm"}>
                {busy === "warm" ? "Warming up…" : "Warm up demo"}
              </button>
              <button type="button" className="btn-secondary" onClick={retryZoho} disabled={busy === "zoho"}>
                {busy === "zoho" ? "Syncing…" : "Retry Zoho sync"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => void load()}>
                Refresh
              </button>
              <button type="button" className="btn-primary min-h-14 px-6 text-lg" onClick={logoutAndReset}>
                Reset kiosk
              </button>
            </div>

            {notice && <p className="bg-mist px-6 py-3 text-lg font-semibold text-navy">{notice}</p>}
            {data && (!data.zohoEnabled || !data.mailerEnabled) && (
              <p className="bg-[#FFF4E0] px-6 py-3 text-base font-semibold text-average-text">
                {!data.zohoEnabled && "Zoho CRM isn't configured (ZOHO_* settings). "}
                {!data.mailerEnabled && "Email isn't configured (SMTP_* settings): reports are only logged."}
              </p>
            )}

            <div className="flex flex-wrap gap-2 px-6 pt-4">
              {(["leads", "enquiry", "staffmain", "letflows", "guide", "scans", "device"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`min-h-14 rounded-xl px-5 text-lg font-bold ${tab === t ? "bg-navy text-white" : "bg-mist text-navy"}`}
                >
                  {t === "leads"
                    ? `Health check (${data?.leads.length ?? 0})`
                    : isProductTab(t)
                      ? `${PRODUCT_TABS[t]} (${data?.products[t].leads.length ?? 0})`
                      : t === "guide"
                        ? "StaffMain guide"
                        : t === "scans"
                          ? `Scans (${data?.scans.length ?? 0})`
                          : "This device"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tab === "leads" &&
                (data?.leads.length ? (
                  <ul className="space-y-3">
                    {data.leads.map((l) => (
                      <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-line p-4">
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-navy">
                            {l.name} {l.company && <span className="font-medium text-ink">· {l.company}</span>}
                          </p>
                          <p className="text-base break-all text-ink">
                            {l.email}
                            {l.phone ? ` · ${l.phone}` : ""}
                          </p>
                          <p className="text-base text-ink">
                            {time(l.createdAt)} · {site(l.url)}
                            {l.interest.length ? ` · ${l.interest.join(", ")}` : ""}
                          </p>
                          <p className={`text-base font-semibold ${l.reportSentAt ? "text-good-text" : "text-average-text"}`}>
                            {l.reportSentAt ? `Report sent ${time(l.reportSentAt)}` : "Report not sent yet"}
                          </p>
                          <p
                            className={`text-base font-semibold ${l.zohoId ? "text-good-text" : "text-average-text"}`}
                            title={l.zohoError ?? undefined}
                          >
                            {l.zohoId ? "Saved in Zoho" : l.zohoError ? "Not in Zoho yet (will retry)" : "Sending to Zoho…"}
                          </p>
                        </div>
                        <button type="button" className="btn-secondary" disabled={busy === l.id} onClick={() => resend(l.id)}>
                          {busy === l.id ? "Sending…" : "Re-send report"}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-lg text-ink">No leads yet today.</p>
                ))}

              {isProductTab(tab) &&
                (data?.products[tab].leads.length ? (
                  <ul className="space-y-3">
                    {data.products[tab].leads.map((l) => (
                      <ProductLeadItem
                        key={l.id}
                        product={tab}
                        lead={l}
                        signupUrl={data.products[tab].signupUrl}
                        onNotice={setNotice}
                        onChanged={load}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-lg text-ink">{tab === "enquiry" ? "No enquiries yet today." : `No ${PRODUCT_TABS[tab]} demo requests yet today.`}</p>
                ))}

              {tab === "device" && <DeviceSettings onNotice={setNotice} />}

              {tab === "guide" && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist px-5 py-4">
                    <p className="text-base font-semibold text-navy">Turning the tablet round? Show the guide on its own, with no leads on screen.</p>
                    <button type="button" className="btn-primary min-h-14 px-6 text-lg" onClick={() => setPresenting(true)}>
                      Show to visitor
                    </button>
                  </div>
                  <StaffmainGuide />
                </>
              )}

              {tab === "scans" &&
                (data?.scans.length ? (
                  <ul className="divide-y-2 divide-line">
                    {data.scans.map((s) => (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <span className="text-lg text-navy">
                          <span className="text-ink">{time(s.createdAt)}</span> · {site(s.url)}
                        </span>
                        <span className="flex gap-2">
                          {s.scores ? (
                            (["performance", "seo", "accessibility", "best-practices"] as const).map((k) => {
                              const v = s.scores?.[k];
                              return (
                                <span
                                  key={k}
                                  className="min-w-12 rounded-lg px-2 py-1 text-center text-base font-bold"
                                  style={{
                                    background: v == null ? "#F4F6FB" : BAND_COLOURS[bandFor(v)].tint,
                                    color: v == null ? "#6B7596" : BAND_COLOURS[bandFor(v)].text,
                                  }}
                                  title={k}
                                >
                                  {v ?? "–"}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-base text-ink">PageSpeed {s.psiStatus}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-lg text-ink">No scans yet today.</p>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductLeadItem({
  product,
  lead: l,
  signupUrl,
  onNotice,
  onChanged,
}: {
  product: ProductKey;
  lead: ProductRow;
  signupUrl: string | null;
  onNotice: (n: string) => void;
  onChanged: () => void;
}) {
  const [note, setNote] = useState(l.note);
  const [link, setLink] = useState(signupUrl ?? "");
  const [showAccount, setShowAccount] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function post(path: string, body: object, ok: string, fail: string) {
    const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const b = (await res.json().catch(() => ({}))) as { message?: string };
    onNotice(res.ok ? ok : (b.message ?? fail));
    onChanged();
    return res.ok;
  }

  return (
    <li className="rounded-2xl border-2 border-line p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-navy">
            {l.name} {l.company && <span className="font-medium text-ink">· {l.company}</span>}
            {l.jobTitle && <span className="font-medium text-ink"> · {l.jobTitle}</span>}
          </p>
          <p className="text-base break-all text-ink">
            {l.email}
            {l.phone ? ` · ${l.phone}` : ""}
          </p>
          <p className="text-base text-ink">
            {time(l.createdAt)} · {l.details[0]}
          </p>
          {l.details.slice(1).map((d) => (
            <p key={d} className="text-base font-semibold text-navy">
              {d}
            </p>
          ))}
          <p className={`text-base font-semibold ${l.thanksSentAt ? "text-good-text" : "text-average-text"}`}>
            {l.thanksSentAt ? `Thank-you email sent ${time(l.thanksSentAt)}` : "Thank-you email not sent yet"}
            {l.accountEmailSentAt ? ` · Account email sent ${time(l.accountEmailSentAt)}` : ""}
          </p>
          <p className={`text-base font-semibold ${l.zohoId ? "text-good-text" : "text-average-text"}`} title={l.zohoError ?? undefined}>
            {l.zohoId ? `Saved in Zoho (tagged ${ZOHO_TAG[product]})` : l.zohoError ? "Not in Zoho yet (will retry)" : "Sending to Zoho…"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="btn-secondary"
            disabled={busy === "thanks"}
            onClick={async () => {
              setBusy("thanks");
              await post(`/api/staff/product/${product}/resend`, { leadId: l.id }, "Thank-you email sent again.", "Couldn't send the email.");
              setBusy(null);
            }}
          >
            {busy === "thanks" ? "Sending…" : "Re-send thank-you"}
          </button>
          {signupUrl && (
            <button type="button" className="btn-secondary" onClick={() => setShowAccount((v) => !v)}>
              Account ready email
            </button>
          )}
        </div>
      </div>

      {showAccount && (
        <div className="mt-3 rounded-xl bg-mist p-3">
          <label className="block text-base font-semibold text-navy">
            Sign-up link for this lead
            <input className="field mt-1 min-h-12 text-lg" value={link} onChange={(e) => setLink(e.target.value)} />
          </label>
          <button
            type="button"
            className="btn-primary mt-3 min-h-12 px-5 text-lg"
            disabled={busy === "account"}
            onClick={async () => {
              setBusy("account");
              const ok = await post(
                `/api/staff/product/${product}/account-email`,
                { leadId: l.id, signupUrl: link },
                `"Your ${PRODUCT_TABS[product]} account is ready" sent to ${l.email}.`,
                "Couldn't send the account email.",
              );
              setBusy(null);
              if (ok) setShowAccount(false);
            }}
          >
            {busy === "account" ? "Sending…" : "Send account email"}
          </button>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          className="field min-h-12 flex-1 text-lg"
          placeholder="Note, e.g. Hot: 3 care homes, contract ends March"
          value={note}
          maxLength={2000}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          className="btn-secondary"
          disabled={busy === "note" || note === l.note}
          onClick={async () => {
            setBusy("note");
            await post(`/api/staff/product/${product}/note`, { leadId: l.id, note }, "Note saved (and added to Zoho).", "Couldn't save the note.");
            setBusy(null);
          }}
        >
          {busy === "note" ? "Saving…" : "Save note"}
        </button>
      </div>
    </li>
  );
}

function DeviceSettings({ onNotice }: { onNotice: (n: string) => void }) {
  const [home, setHomeState] = useState(getHome);
  const [mode, setMode] = useState<KioskMode>(getKioskMode);
  const [attract, setAttractState] = useState(getAttract);
  const queued = queuedLeadCount();
  return (
    <div className="space-y-8 py-2">
      <section>
        <h3 className="text-xl font-extrabold text-navy">Start screen for this tablet</h3>
        <p className="mt-1 text-base text-ink">Where it goes after each visitor (idle, Done, logo tap).</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HOMES.map((h) => (
            <button
              key={h.path}
              type="button"
              onClick={() => {
                setHome(h.path);
                setHomeState(h.path);
                onNotice(`This tablet now starts on: ${h.label}.`);
              }}
              className={`min-h-14 rounded-xl px-5 text-lg font-bold ${home === h.path ? "bg-navy text-white" : "bg-mist text-navy"}`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-xl font-extrabold text-navy">Kiosk mode</h3>
        <p className="mt-1 text-base text-ink">
          Resets after 90 s idle and returns to the start screen. Auto turns it on for tablets and installed apps, off for phones. Now:{" "}
          <strong>{isKioskDevice() ? "on" : "off"}</strong>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["auto", "on", "off"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setKioskMode(m);
                setMode(m);
                onNotice(`Kiosk mode: ${m}. Reload the page to apply.`);
              }}
              className={`min-h-14 rounded-xl px-5 text-lg font-bold capitalize ${mode === m ? "bg-navy text-white" : "bg-mist text-navy"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-xl font-extrabold text-navy">Attract mode</h3>
        <p className="mt-1 text-base text-ink">
          After 45 seconds with nobody using a start screen, a full-screen showreel of the demos plays. A tap opens the demo on screen. Kiosk
          devices only.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => {
                setAttract(v);
                setAttractState(v);
                onNotice(`Attract mode ${v ? "on" : "off"}. Reload the page to apply.`);
              }}
              className={`min-h-14 rounded-xl px-5 text-lg font-bold ${attract === v ? "bg-navy text-white" : "bg-mist text-navy"}`}
            >
              {v ? "On" : "Off"}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-xl font-extrabold text-navy">Offline queue</h3>
        <p className="mt-1 text-base text-ink">
          {queued ? `${queued} lead${queued === 1 ? " is" : "s are"} waiting on this device and will send when the connection is back.` : "Nothing waiting: every lead from this device has been sent."}
        </p>
      </section>
    </div>
  );
}

function PinPad({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function submit(value: string) {
    setChecking(true);
    const res = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin: value }),
    });
    setChecking(false);
    if (res.ok) {
      onSuccess();
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    setError(body.message ?? "Wrong PIN");
    setPin("");
  }

  const press = (d: string) => {
    setError(null);
    setPin((p) => (p.length < 12 ? p + d : p));
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <p className="text-xl font-bold text-navy">Enter staff PIN</p>
      <p className="mt-4 h-12 font-display text-4xl tracking-[0.5em] text-navy" aria-live="polite">
        {"•".repeat(pin.length) || " "}
      </p>
      <p role="alert" className="h-8 text-lg font-semibold text-poor-text">
        {error}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <PadKey key={d} onClick={() => press(d)}>
            {d}
          </PadKey>
        ))}
        <PadKey onClick={() => setPin((p) => p.slice(0, -1))} label="Delete">
          ⌫
        </PadKey>
        <PadKey onClick={() => press("0")}>0</PadKey>
        <PadKey onClick={() => pin && !checking && submit(pin)} label="Enter" primary>
          {checking ? "…" : "OK"}
        </PadKey>
      </div>
    </div>
  );
}

function PadKey({ children, onClick, label, primary }: { children: React.ReactNode; onClick: () => void; label?: string; primary?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`h-20 w-24 rounded-2xl font-display text-3xl font-bold transition active:scale-95 ${
        primary ? "bg-brand text-white" : "bg-mist text-navy active:bg-line"
      }`}
    >
      {children}
    </button>
  );
}
