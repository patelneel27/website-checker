"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getHome, isKioskDevice } from "@/lib/kiosk-device";
import { sendLead } from "@/lib/lead-queue";
import { IdleGuard } from "../IdleGuard";
import { LogoTapContext } from "../Logo";
import { StaffPanel, type StaffTab } from "../StaffPanel";
import { About, type Answers, type Question } from "./About";
import { DemoForm, emptyDemoForm, type ChipGroup, type DemoFormCopy, type DemoFormData } from "./DemoForm";
import type { ShowcaseFeature } from "./FeatureScreen";
import { Result, type ResultCard } from "./Result";
import { Showcase } from "./Showcase";
import { Thanks, type ThanksCopy } from "./Thanks";

/** Server-provided links (read from env at request time). */
export type ShowcaseConfig = {
  bookingQrUrl: string;
  bookingButtonUrl: string;
  websiteQrUrl: string;
  privacyUrl: string;
  demoUrl: string;
};

export type WelcomeProps = { websiteQrUrl: string; onStart: () => void; onHome: () => void; onLongPressLogo: () => void };

/** Everything that makes one product's showcase different. Lives in a client module. */
export type ProductDef = {
  product: string;
  /** This page's own path, e.g. "/staffmain". */
  path: string;
  /** Extra class on the page root, e.g. to swap the accent colour. */
  themeClass?: string;
  staffTab: StaffTab;
  endpoint: string;
  Welcome: React.ComponentType<WelcomeProps>;
  features: ShowcaseFeature[];
  fallback?: (id: string) => React.ReactNode;
  showcaseLastLabel: string;
  about: { eyebrow: string; headline: readonly string[]; subline: string; cta: string; neededHint: string; backLabel: string; questions: Question[] };
  result: (answers: Answers) => { headline: React.ReactNode; cards: ResultCard[]; extras: string[] };
  resultCopy: { eyebrow: string; nextTitle: string; next: readonly string[]; cta: string; again: string };
  form: { copy: DemoFormCopy; chipGroups: ChipGroup[] };
  thanks: ThanksCopy;
  /** Builds the API body (without clientId, capturedAt and consent). */
  toLead: (answers: Answers, form: DemoFormData) => Record<string, unknown>;
};

type Screen = "welcome" | "showcase" | "about" | "result" | "form" | "thanks";

export function ProductKiosk({ def, config }: { def: ProductDef; config: ShowcaseConfig }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [slide, setSlide] = useState({ index: 0, direction: 1 as 1 | -1 });
  const [answers, setAnswers] = useState<Answers>({});
  const [form, setForm] = useState<DemoFormData>(emptyDemoForm);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ field?: string; message: string } | null>(null);
  const [sent, setSent] = useState<{ firstName: string; queued: boolean } | null>(null);
  const [staffOpen, setStaffOpen] = useState(false);
  const [kiosk, setKiosk] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads device settings after mount
    setKiosk(isKioskDevice());
  }, []);

  // Clears every trace of the last visitor.
  const reset = useCallback(() => {
    setScreen("welcome");
    setSlide({ index: 0, direction: 1 });
    setAnswers({});
    setForm(emptyDemoForm());
    setSubmitting(false);
    setServerError(null);
    setSent(null);
    setStaffOpen(false);
  }, []);

  /** Back to this device's home: the event home, unless staff locked the tablet to this demo. */
  const goHome = useCallback(() => {
    const home = getHome();
    if (home === def.path) reset();
    else router.push(home);
  }, [def.path, reset, router]);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  async function submit(data: DemoFormData) {
    setForm(data);
    setSubmitting(true);
    setServerError(null);
    const clientId = crypto.randomUUID();
    const body = { ...def.toLead(answers, data), clientId, capturedAt: new Date().toISOString(), consent: true };
    const res = await sendLead(def.endpoint, clientId, body);
    setSubmitting(false);
    if (!res.ok) {
      setServerError({ field: res.field, message: res.message });
      return;
    }
    setSent({ firstName: data.firstName.trim(), queued: res.queued });
    // Don't keep the visitor's details in memory once they're sent (or queued).
    setForm(emptyDemoForm());
    go("thanks");
  }

  const openStaff = () => setStaffOpen(true);
  const { Welcome } = def;
  const result = screen === "result" ? def.result(answers) : null;

  return (
    <LogoTapContext.Provider value={goHome}>
      <main className={`paper h-dvh overflow-hidden ${def.themeClass ?? ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="h-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {screen === "welcome" && <Welcome websiteQrUrl={config.websiteQrUrl} onStart={() => go("showcase")} onHome={goHome} onLongPressLogo={openStaff} />}
            {screen === "showcase" && (
              <Showcase
                product={def.product}
                features={def.features}
                lastLabel={def.showcaseLastLabel}
                fallback={def.fallback}
                index={slide.index}
                direction={slide.direction}
                onIndex={(i) => setSlide((s) => ({ index: i, direction: i >= s.index ? 1 : -1 }))}
                onDone={() => go("about")}
                onHome={goHome}
                onLongPressLogo={openStaff}
              />
            )}
            {screen === "about" && (
              <About
                {...def.about}
                answers={answers}
                onChange={setAnswers}
                onContinue={() => {
                  // Pre-fill the form's matching questions from these answers.
                  const chips = { ...form.chips };
                  for (const g of def.form.chipGroups) {
                    const a = answers[g.key];
                    if (typeof a === "string") chips[g.key] = a;
                  }
                  setForm((f) => ({ ...f, chips }));
                  go("result");
                }}
                onBack={() => go("showcase")}
                onLongPressLogo={openStaff}
              />
            )}
            {screen === "result" && result && (
              <Result
                {...def.resultCopy}
                {...result}
                onBook={() => go("form")}
                onAgain={() => {
                  setSlide({ index: 0, direction: -1 });
                  go("showcase");
                }}
                onRestart={reset}
                onLongPressLogo={openStaff}
              />
            )}
            {screen === "form" && (
              <DemoForm
                copy={def.form.copy}
                chipGroups={def.form.chipGroups}
                initial={form}
                privacyUrl={config.privacyUrl}
                submitting={submitting}
                serverError={serverError}
                onSubmit={submit}
                onBack={() => go("result")}
                onLongPressLogo={openStaff}
              />
            )}
            {screen === "thanks" && sent && (
              <Thanks
                copy={def.thanks}
                firstName={sent.firstName}
                queued={sent.queued}
                autoReturn={kiosk}
                bookingQrUrl={config.bookingQrUrl}
                bookingButtonUrl={config.bookingButtonUrl}
                onDone={goHome}
                onLongPressLogo={openStaff}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <IdleGuard active={kiosk && screen !== "welcome" && screen !== "thanks" && !staffOpen} onTimeout={goHome} />

        {staffOpen && <StaffPanel demoUrl={config.demoUrl} initialTab={def.staffTab} onClose={() => setStaffOpen(false)} onResetKiosk={goHome} />}
      </main>
    </LogoTapContext.Provider>
  );
}
