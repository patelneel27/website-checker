"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getHome } from "@/lib/kiosk-device";
import type { KioskConfig, ScanErrorResponse, ScanResult } from "@/lib/types";
import { EnterUrl } from "./screens/EnterUrl";
import { LeadForm, type LeadInput } from "./screens/LeadForm";
import { Results } from "./screens/Results";
import { Scanning } from "./screens/Scanning";
import { ThankYou } from "./screens/ThankYou";
import { Welcome } from "./screens/Welcome";
import { StaffPanel } from "./StaffPanel";
import { IdleGuard } from "./IdleGuard";
import { LogoTapContext } from "./Logo";

type Screen = "welcome" | "url" | "scanning" | "results" | "lead" | "thanks";


function deviceId(): string {
  try {
    let id = localStorage.getItem("sterlix-device-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sterlix-device-id", id);
    }
    return id;
  } catch {
    return "";
  }
}

export function Kiosk({ config }: { config: KioskConfig }) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [urlInput, setUrlInput] = useState("");
  const [scanUrl, setScanUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  /** The scan result has arrived; the scanning screen finishes its ticks, then shows it. */
  const [scanReady, setScanReady] = useState(false);
  const [lead, setLead] = useState<{ name: string; email: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<{ field?: string; message: string } | null>(null);
  const [staffOpen, setStaffOpen] = useState(false);
  const scanAbort = useRef<AbortController | null>(null);
  const router = useRouter();

  // Clears every trace of the last visitor.
  const reset = useCallback(() => {
    scanAbort.current?.abort();
    setScreen("welcome");
    setUrlInput("");
    setScanUrl("");
    setUrlError(null);
    setResult(null);
    setScanReady(false);
    setLead(null);
    setSubmitting(false);
    setLeadError(null);
    setStaffOpen(false);
    window.scrollTo(0, 0);
  }, []);

  /** Back to this device's home: the event home, unless staff locked the tablet to this demo. */
  const goHome = useCallback(() => {
    const home = getHome();
    if (home === "/health-check") reset();
    else {
      scanAbort.current?.abort();
      router.push(home);
    }
  }, [reset, router]);

  // ---- Scan -------------------------------------------------------------------------------------
  async function runScan(url: string) {
    scanAbort.current?.abort();
    const controller = new AbortController();
    scanAbort.current = controller;
    setScanUrl(url);
    setUrlError(null);
    setResult(null);
    setScanReady(false);
    setScreen("scanning");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json", "x-device-id": deviceId() },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      const body = (await res.json().catch(() => null)) as (ScanResult & { cached?: boolean }) | ScanErrorResponse | null;
      if (controller.signal.aborted) return;

      if (!res.ok || !body || "error" in body) {
        setUrlError(
          body && "message" in body ? body.message : "We couldn't check that website just now. Please try again.",
        );
        setScreen("url");
        return;
      }
      setResult(body);
      setScanReady(true);
    } catch {
      if (controller.signal.aborted) return;
      setUrlError("We couldn't check that website just now. Please check the connection and try again.");
      setScreen("url");
    }
  }

  // While PageSpeed finishes in the background, poll for the full scores.
  const resultId = result?.id;
  const resultPending = result?.psiStatus === "pending";
  useEffect(() => {
    if (!resultId || !resultPending) return;
    let tries = 0;
    const timer = setInterval(async () => {
      if (++tries > 30) return clearInterval(timer);
      const res = await fetch(`/api/scan/${resultId}`, { cache: "no-store" }).catch(() => null);
      if (!res?.ok) return;
      const next = (await res.json()) as ScanResult;
      if (next.psiStatus !== "pending") {
        setResult((r) => (r?.id === next.id ? { ...next, cached: r.cached } : r));
        clearInterval(timer);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [resultId, resultPending]);

  // ---- Lead -------------------------------------------------------------------------------------
  async function submitLead(data: LeadInput) {
    if (!result) return;
    setSubmitting(true);
    setLeadError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, scanId: result.id, scanToken: result.token }),
      });
      const body = (await res.json().catch(() => null)) as { ok: boolean; field?: string; message?: string } | null;
      if (!res.ok || !body?.ok) {
        setLeadError({ field: body?.field, message: body?.message ?? "Something went wrong. Please try again." });
        return;
      }
      setLead({ name: data.name, email: data.email.trim() });
      setScreen("thanks");
    } catch {
      setLeadError({ message: "We couldn't send that. Please check the connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const openStaff = () => setStaffOpen(true);
  const showResults = useCallback(() => setScreen("results"), []);

  return (
    <LogoTapContext.Provider value={goHome}>
    <main className="paper h-dvh overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="h-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {screen === "welcome" && <Welcome onStart={() => setScreen("url")} onLongPressLogo={openStaff} />}
          {screen === "url" && (
            <EnterUrl
              initialValue={urlInput}
              error={urlError}
              demoUrl={config.demoUrl}
              onSubmit={(url) => {
                setUrlInput(url.replace(/^https:\/\//, ""));
                void runScan(url);
              }}
              onBack={reset}
              onLongPressLogo={openStaff}
            />
          )}
          {screen === "scanning" && <Scanning url={scanUrl} ready={scanReady} fast={scanReady && !!result?.cached} onDone={showResults} />}
          {screen === "results" && result && (
            <Results result={result} onContinue={() => setScreen("lead")} onRestart={reset} onLongPressLogo={openStaff} />
          )}
          {screen === "lead" && result && (
            <LeadForm
              site={result.url.replace(/^https?:\/\//, "")}
              privacyUrl={config.privacyUrl}
              submitting={submitting}
              serverError={leadError}
              onSubmit={submitLead}
              onBack={() => setScreen("results")}
              onLongPressLogo={openStaff}
            />
          )}
          {screen === "thanks" && lead && (
            <ThankYou
              name={lead.name}
              email={lead.email}
              bookingQrUrl={config.bookingQrUrl}
              bookingButtonUrl={config.bookingButtonUrl}
              onDone={goHome}
              onLongPressLogo={openStaff}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <IdleGuard active={screen !== "welcome" && screen !== "scanning" && !staffOpen} onTimeout={goHome} />

      {staffOpen && <StaffPanel demoUrl={config.demoUrl} onClose={() => setStaffOpen(false)} onResetKiosk={reset} />}
    </main>
    </LogoTapContext.Provider>
  );
}
