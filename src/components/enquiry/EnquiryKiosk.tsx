"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BUDGETS,
  CONTACT_PREFS,
  FORM,
  SERVICES,
  SERVICES_SCREEN,
  SOFTWARE,
  THANKS,
  TIMEFRAMES,
  WELCOME,
  type ServiceId,
  type Software,
} from "@/config/enquiry";
import { getHome, isKioskDevice } from "@/lib/kiosk-device";
import { sendLead } from "@/lib/lead-queue";
import { AttractMode } from "../AttractMode";
import { CheckBadge, ChoiceChip, PillButton, TactileButton } from "../Buttons";
import { IdleGuard } from "../IdleGuard";
import { LetterRise } from "../LetterRise";
import { Logo, LogoTapContext } from "../Logo";
import { Cursor, Float, WaveWord } from "../PlayfulHero";
import { ScaledStage } from "../ScaledStage";
import { Thanks } from "../showcase/Thanks";
import { StaffPanel } from "../StaffPanel";
import { FeatureIcon } from "../staffmain/FeatureIcon";

export type EnquiryConfig = { bookingQrUrl: string; bookingButtonUrl: string; privacyUrl: string; demoUrl: string };

type Screen = "welcome" | "services" | "form" | "thanks";

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  message: string;
  budget: string | null;
  timeframe: string | null;
  contactPref: string | null;
  consent: boolean;
};
const EMPTY_FORM: Form = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  message: "",
  budget: null,
  timeframe: null,
  contactPref: null,
  consent: false,
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** `quick`: opened from staff mode's "Quick enquiry"; goes straight to the form, tagged "Team member". */
export function EnquiryKiosk({ config, quick }: { config: EnquiryConfig; quick: boolean }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>(quick ? "form" : "welcome");
  const [services, setServices] = useState<ServiceId[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ field?: string; message: string } | null>(null);
  const [sent, setSent] = useState<{ firstName: string; queued: boolean } | null>(null);
  const [staffOpen, setStaffOpen] = useState(false);
  const [kiosk, setKiosk] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads device settings after mount
    setKiosk(isKioskDevice());
  }, []);

  const reset = useCallback(() => {
    setScreen("welcome");
    setServices([]);
    setSoftware([]);
    setForm(EMPTY_FORM);
    setSubmitting(false);
    setServerError(null);
    setSent(null);
    setStaffOpen(false);
    if (quick) router.replace("/enquiry");
  }, [quick, router]);

  const goHome = useCallback(() => {
    const home = getHome();
    if (home === "/enquiry") reset();
    else router.push(home);
  }, [reset, router]);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  const toggleService = (id: ServiceId) => {
    setServices((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
    if (id === "software" && services.includes("software")) setSoftware([]);
  };
  const toggleSoftware = (p: Software) => setSoftware((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));

  async function submit(f: Form) {
    setForm(f);
    setSubmitting(true);
    setServerError(null);
    const clientId = crypto.randomUUID();
    const body = {
      clientId,
      capturedAt: new Date().toISOString(),
      services,
      software: services.includes("software") ? software : [],
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim(),
      phone: f.phone.trim() || undefined,
      company: f.company.trim() || undefined,
      website: f.website.trim() || undefined,
      message: f.message.trim() || undefined,
      budget: f.budget,
      timeframe: f.timeframe,
      contactPref: f.contactPref,
      filledBy: quick ? "Team member" : "Visitor",
      consent: true,
    };
    const res = await sendLead("/api/enquiry/lead", clientId, body);
    setSubmitting(false);
    if (!res.ok) {
      setServerError({ field: res.field, message: res.message });
      return;
    }
    setSent({ firstName: body.firstName, queued: res.queued });
    setForm(EMPTY_FORM);
    go("thanks");
  }

  const openStaff = () => setStaffOpen(true);

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
            {screen === "welcome" && <EnquiryWelcome onStart={() => go("services")} onHome={goHome} onLongPressLogo={openStaff} />}
            {screen === "services" && (
              <ServicesScreen
                services={services}
                software={software}
                onToggle={toggleService}
                onToggleSoftware={toggleSoftware}
                onNext={() => go("form")}
                onBack={() => go("welcome")}
                onLongPressLogo={openStaff}
              />
            )}
            {screen === "form" && (
              <EnquiryForm
                quick={quick}
                initial={form}
                services={services}
                software={software}
                onToggle={toggleService}
                onToggleSoftware={toggleSoftware}
                privacyUrl={config.privacyUrl}
                submitting={submitting}
                serverError={serverError}
                onSubmit={submit}
                onBack={() => (quick ? goHome() : go("services"))}
                onLongPressLogo={openStaff}
              />
            )}
            {screen === "thanks" && sent && (
              <Thanks
                copy={THANKS}
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
        {staffOpen && <StaffPanel demoUrl={config.demoUrl} initialTab="enquiry" onClose={() => setStaffOpen(false)} onResetKiosk={goHome} />}
      </main>
    </LogoTapContext.Provider>
  );
}

// ---------------------------------------------------------------------------------------------
// 1. Welcome

function ChatBubble() {
  return (
    <div className="glossy w-[17rem] rounded-[1.4rem] rounded-bl-md bg-white p-4">
      <p className="text-sm font-bold text-stone">A visitor at the stand</p>
      <p className="mt-1 text-lg leading-snug font-semibold text-coal">&ldquo;We need a new website for our clinic by spring.&rdquo;</p>
    </div>
  );
}

function ReplyPill() {
  return (
    <div className="glossy flex items-center gap-3 rounded-full bg-gradient-to-b from-[#2E313A] to-[#15171D] py-2 pr-5 pl-2 text-white">
      <CheckBadge />
      <span className="text-base font-bold">
        Reply within 2 working days
      </span>
    </div>
  );
}

function EnquiryWelcome({ onStart, onHome, onLongPressLogo }: { onStart: () => void; onHome: () => void; onLongPressLogo: () => void }) {
  return (
    <div className="paper flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between gap-4 px-6 pt-8 sm:px-8 sm:pt-9">
        <Logo intro onTap={onHome} onLongPress={onLongPressLogo} />
        <PillButton icon="back" onClick={onHome}>
          All demos
        </PillButton>
      </header>

      <section className="px-6 pt-10 sm:px-8">
        <ScaledStage width={752} height={470}>
          <h1 className="relative z-10 font-poster text-[9rem] leading-[0.9] font-normal text-coal">
            <span className="sr-only">{WELCOME.headline.join(" ")}</span>
            <span aria-hidden="true" className="absolute top-[1rem] left-0 whitespace-nowrap">
              <LetterRise text={WELCOME.headline[0]} />
            </span>
            <span aria-hidden="true" className="absolute top-[12rem] right-0 whitespace-nowrap">
              <WaveWord text={WELCOME.headline[1]} tone="blue" autoAt={1.2} repeatEvery={11} />
            </span>
          </h1>

          <Float className="top-[0rem] right-[-0.5rem] z-20" rotate={8} delay={0.45} bob={7} duration={5}>
            <FeatureIcon icon="web" size={96} />
          </Float>
          <Float className="top-[12.5rem] left-[-0.5rem] z-20" rotate={-4} delay={0.6} bob={8} duration={5.4}>
            <ChatBubble />
          </Float>
          <Float className="top-[10rem] left-[19rem] z-0" rotate={-10} delay={0.75} bob={6} duration={4.6}>
            <FeatureIcon icon="branding" size={80} />
          </Float>
          <Float className="top-[22.5rem] left-[2rem] z-20" rotate={-8} delay={0.9} bob={7} duration={5.2}>
            <FeatureIcon icon="marketing" size={76} />
          </Float>
          <Float className="top-[23rem] left-[9rem] z-20" rotate={10} delay={1} bob={6} duration={4.4}>
            <FeatureIcon icon="ecommerce" size={64} />
          </Float>
          <Float className="top-[24rem] right-[1rem] z-30" rotate={-3} delay={1.1} bob={5} duration={4.8}>
            <ReplyPill />
          </Float>
          <Float className="top-[17.5rem] left-[13rem] z-40" delay={1.25} bob={8} duration={3.8}>
            <div className="origin-top-left scale-[0.75]">
              <Cursor />
            </div>
          </Float>
        </ScaledStage>

        <p className="mx-auto mt-8 max-w-xl text-center text-xl leading-snug text-stone sm:text-2xl">{WELCOME.subline}</p>
        <div className="mx-auto mt-8 max-w-[34rem]">
          <TactileButton onClick={onStart}>{WELCOME.cta}</TactileButton>
        </div>
        <p className="mx-auto mt-6 mb-10 max-w-[34rem] text-center text-base font-semibold text-stone">{WELCOME.rule}</p>
      </section>
      <AttractMode />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// 2. Services

function SoftwarePicker({ software, onToggle }: { software: Software[]; onToggle: (p: Software) => void }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="mt-3 rounded-[1.4rem] border border-black/5 bg-white/60 p-4">
        <p className="text-base font-bold text-coal">
          {SERVICES_SCREEN.softwareLabel} <span className="font-medium text-stone/70">(pick any)</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {SOFTWARE.map((p) => (
            <ChoiceChip key={p} on={software.includes(p)} onClick={() => onToggle(p)}>
              {p}
            </ChoiceChip>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ServicesScreen({
  services,
  software,
  onToggle,
  onToggleSoftware,
  onNext,
  onBack,
  onLongPressLogo,
}: {
  services: ServiceId[];
  software: Software[];
  onToggle: (id: ServiceId) => void;
  onToggleSoftware: (p: Software) => void;
  onNext: () => void;
  onBack: () => void;
  onLongPressLogo: () => void;
}) {
  return (
    <div className="paper flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-44">
        <header className="flex items-center justify-between gap-4 px-6 pt-8 sm:px-8 sm:pt-9">
          <Logo onLongPress={onLongPressLogo} />
          <PillButton icon="back" onClick={onBack}>
            Back
          </PillButton>
        </header>

        <section className="px-6 pt-10 sm:px-8">
          <p className="eyebrow">{SERVICES_SCREEN.eyebrow}</p>
          <h1 className="mt-4 font-poster text-[clamp(4rem,13vw,6.5rem)] leading-[0.9] font-normal text-coal">
            <LetterRise text={SERVICES_SCREEN.headline[0]} />
            <br />
            <LetterRise text={SERVICES_SCREEN.headline[1]} delay={0.25} className="text-brand" />
          </h1>
          <p className="mt-5 text-xl text-stone">{SERVICES_SCREEN.subline}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {SERVICES.map((sv, i) => {
              const on = services.includes(sv.id);
              return (
                <motion.div
                  key={sv.id}
                  className={sv.id === "software" || sv.id === "other" ? "sm:col-span-1" : ""}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 220, damping: 22 }}
                >
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggle(sv.id)}
                    className={`choice relative flex min-h-[8.5rem] w-full items-start gap-4 rounded-[1.6rem] p-5 text-left ${
                      on
                        ? "bg-gradient-to-b from-[#2E313A] to-[#15171D] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_24px_-12px_rgba(0,0,0,0.6)]"
                        : "glossy bg-gradient-to-b from-white to-[#F6F6F4] text-coal"
                    }`}
                  >
                    <FeatureIcon icon={sv.id} size={56} />
                    <span className="min-w-0 flex-1 pr-6">
                      <span className="block text-xl leading-tight font-extrabold">{sv.name}</span>
                      <span className={`mt-1 block text-base leading-snug ${on ? "text-white/70" : "text-stone"}`}>{sv.line}</span>
                    </span>
                    <AnimatePresence>
                      {on && (
                        <motion.span className="absolute top-3 right-3" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                          <CheckBadge size="sm" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <AnimatePresence>{sv.id === "software" && on && <SoftwarePicker software={software} onToggle={onToggleSoftware} />}</AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="paper-bar">
        <div className="mx-auto max-w-[34rem]">
          <TactileButton onClick={onNext} disabled={!services.length}>
            {services.length ? `${SERVICES_SCREEN.cta} (${services.length} picked)` : SERVICES_SCREEN.cta}
          </TactileButton>
          {!services.length && <p className="mt-2 text-center text-base text-stone">{SERVICES_SCREEN.needed}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// 3. Form

function EnquiryForm({
  quick,
  initial,
  services,
  software,
  onToggle,
  onToggleSoftware,
  privacyUrl,
  submitting,
  serverError,
  onSubmit,
  onBack,
  onLongPressLogo,
}: {
  quick: boolean;
  initial: Form;
  services: ServiceId[];
  software: Software[];
  onToggle: (id: ServiceId) => void;
  onToggleSoftware: (p: Software) => void;
  privacyUrl: string;
  submitting: boolean;
  serverError: { field?: string; message: string } | null;
  onSubmit: (f: Form) => void;
  onBack: () => void;
  onLongPressLogo: () => void;
}) {
  const [d, setD] = useState<Form>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setD((x) => ({ ...x, [k]: v }));
  const errors: Record<string, string | null> = {
    services: services.length ? null : "Please pick at least one service.",
    firstName: d.firstName.trim() ? null : "Please tell us your first name.",
    lastName: d.lastName.trim() ? null : "Please tell us your last name.",
    email: EMAIL_RE.test(d.email.trim()) ? null : "Please check your email address.",
  };
  const valid = Object.values(errors).every((e) => !e) && d.consent;
  const err = (k: string) => (touched[k] && errors[k]) || (serverError?.field === k ? serverError.message : null);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const chips = (key: "budget" | "timeframe" | "contactPref", label: string, options: readonly string[], hint?: string) => (
    <fieldset>
      <legend className="mb-3 text-lg font-bold text-coal">
        {label} <span className="font-medium text-stone/70">(optional)</span>
      </legend>
      {hint && <p className="-mt-1 mb-3 text-base text-stone">{hint}</p>}
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <ChoiceChip key={o} on={d[key] === o} onClick={() => set(key, d[key] === o ? null : o)}>
            {o}
          </ChoiceChip>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="paper flex h-full flex-col">
      <form
        className="flex-1 overflow-y-auto px-6 pt-8 pb-12 sm:px-8 sm:pt-9"
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched({ services: true, firstName: true, lastName: true, email: true });
          if (valid && !submitting) onSubmit(d);
        }}
      >
        <header className="flex items-center justify-between gap-4">
          <Logo onLongPress={onLongPressLogo} />
          <PillButton icon="back" onClick={onBack}>
            {quick ? "Close" : "Services"}
          </PillButton>
        </header>

        <div className="mx-auto mt-10 max-w-3xl">
          <p className="eyebrow">{quick ? FORM.quickEyebrow : FORM.eyebrow}</p>
          <h1 className="mt-4 font-poster text-[clamp(4rem,13vw,6.5rem)] leading-[0.9] font-normal text-coal">
            <LetterRise text={FORM.headline[0]} />
            <br />
            <LetterRise text={FORM.headline[1]} delay={0.25} className="text-brand" />
          </h1>
          <p className="mt-5 text-xl leading-snug text-stone">{FORM.subline}</p>

          <div className="mt-10 space-y-7">
            <fieldset>
              <legend className="mb-3 text-lg font-bold text-coal">{FORM.servicesLabel}</legend>
              <div className="flex flex-wrap gap-3">
                {SERVICES.map((sv) => (
                  <ChoiceChip key={sv.id} on={services.includes(sv.id)} onClick={() => onToggle(sv.id)}>
                    {sv.name}
                  </ChoiceChip>
                ))}
              </div>
              <AnimatePresence>{services.includes("software") && <SoftwarePicker software={software} onToggle={onToggleSoftware} />}</AnimatePresence>
              {err("services") && (
                <p role="alert" className="mt-2 text-lg font-semibold text-poor-text">
                  {err("services")}
                </p>
              )}
            </fieldset>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="First name" error={err("firstName")}>
                <input className="field" name="firstName" autoCapitalize="words" value={d.firstName} onChange={(e) => set("firstName", e.target.value)} onBlur={blur("firstName")} />
              </Field>
              <Field label="Last name" error={err("lastName")}>
                <input className="field" name="lastName" autoCapitalize="words" value={d.lastName} onChange={(e) => set("lastName", e.target.value)} onBlur={blur("lastName")} />
              </Field>
            </div>
            <Field label="Email" error={err("email")}>
              <input
                className="field"
                name="email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={d.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={blur("email")}
              />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Phone" optional>
                <input className="field" name="phone" type="tel" inputMode="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="Company" optional>
                <input className="field" name="company" value={d.company} onChange={(e) => set("company", e.target.value)} />
              </Field>
            </div>
            <Field label="Website (if you have one)" optional>
              <input
                className="field"
                name="website"
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="yourcompany.co.uk"
                value={d.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </Field>
            <Field label={FORM.messageLabel} optional>
              <textarea
                className="field min-h-28 resize-none py-4 leading-snug"
                name="message"
                rows={3}
                maxLength={2000}
                placeholder={FORM.messagePlaceholder}
                value={d.message}
                onChange={(e) => set("message", e.target.value)}
              />
            </Field>

            {chips("budget", FORM.budgetLabel, BUDGETS, FORM.budgetHint)}
            {chips("timeframe", "When are you looking to start?", TIMEFRAMES)}
            {chips("contactPref", "Best way to contact you", CONTACT_PREFS)}

            <label className="flex cursor-pointer items-start gap-4 rounded-[1.6rem] border border-black/5 bg-white/60 p-6">
              <input type="checkbox" className="peer sr-only" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} />
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-sky ${
                  d.consent ? "border-transparent bg-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" : "border-black/15 bg-white shadow-[inset_0_2px_3px_rgba(0,0,0,0.06)]"
                }`}
              >
                {d.consent && (
                  <motion.svg initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </motion.svg>
                )}
              </span>
              <span className="text-lg leading-snug text-coal">
                {FORM.consent}{" "}
                <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-2" onClick={(e) => e.stopPropagation()}>
                  Privacy policy
                </a>
              </span>
            </label>

            {serverError && !["services", "firstName", "lastName", "email"].includes(serverError.field ?? "") && (
              <p role="alert" className="text-lg font-semibold text-poor-text">
                {serverError.message}
              </p>
            )}

            <TactileButton type="submit" disabled={!valid || submitting}>
              {submitting ? "Sending…" : FORM.submit}
            </TactileButton>
            {!d.consent && <p className="text-center text-base text-stone">Tick the box above so we can contact you about your enquiry.</p>}
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-lg font-bold text-coal">
        {label} {optional && <span className="font-medium text-stone/70">(optional)</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-2 block text-lg font-semibold text-poor-text">
          {error}
        </span>
      )}
    </label>
  );
}
