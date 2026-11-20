"use client";

import { useState } from "react";
import { INTERESTS, type Interest } from "@/lib/types";
import { motion } from "motion/react";
import { PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";

export type LeadInput = {
  name: string;
  email: string;
  company: string;
  phone: string;
  interest: Interest[];
  consent: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LeadForm({
  site,
  privacyUrl,
  submitting,
  serverError,
  onSubmit,
  onBack,
  onLongPressLogo,
}: {
  site: string;
  privacyUrl: string;
  submitting: boolean;
  serverError: { field?: string; message: string } | null;
  onSubmit: (data: LeadInput) => void;
  onBack: () => void;
  onLongPressLogo: () => void;
}) {
  const [data, setData] = useState<LeadInput>({ name: "", email: "", company: "", phone: "", interest: [], consent: false });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = <K extends keyof LeadInput>(k: K, v: LeadInput[K]) => setData((d) => ({ ...d, [k]: v }));
  const errors = {
    name: !data.name.trim() ? "Please tell us your name." : null,
    email: !EMAIL_RE.test(data.email.trim()) ? "Please check your email address." : null,
  };
  const canSubmit = !errors.name && !errors.email && data.consent && !submitting;

  const fieldError = (k: "name" | "email") =>
    (touched[k] && errors[k]) || (serverError?.field === k ? serverError.message : null);

  return (
    <div className="paper flex h-full flex-col">
      <form
        className="flex-1 overflow-y-auto px-8 pt-9 pb-12"
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched({ name: true, email: true });
          if (canSubmit) onSubmit(data);
        }}
      >
        <header className="flex items-center justify-between">
          <Logo onLongPress={onLongPressLogo} />
          <PillButton icon="back" onClick={onBack}>
            Back to results
          </PillButton>
        </header>

        <div className="mx-auto mt-12 max-w-3xl">
          <p className="eyebrow">Step 3 of 3 · Your full report</p>
          <h1 className="mt-4 font-poster text-[6.5rem] leading-[0.9] font-normal text-coal">
            Where should we
            <br />
            <span className="text-brand">send it?</span>
          </h1>
          <p className="mt-6 text-xl leading-snug text-stone">
            We&rsquo;ll email the report for <strong className="text-coal">{site}</strong> with your top 3 fixes and how to sort
            them.
          </p>

          <div className="mt-10 space-y-7">
            <Field label="Your name" error={fieldError("name")}>
              <input
                className="field"
                name="name"
                autoComplete="off"
                autoCapitalize="words"
                enterKeyHint="next"
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              />
            </Field>
            <Field label="Email" error={fieldError("email")}>
              <input
                className="field"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Company" optional>
                <input className="field" name="company" autoComplete="off" value={data.company} onChange={(e) => set("company", e.target.value)} />
              </Field>
              <Field label="Phone" optional>
                <input
                  className="field"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
            </div>

            <fieldset>
              <legend className="mb-3 text-lg font-bold text-coal">What would you like help with?</legend>
              <div className="flex flex-wrap gap-3">
                {INTERESTS.map((option) => {
                  const on = data.interest.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        set("interest", on ? data.interest.filter((i) => i !== option) : [...data.interest, option])
                      }
                      className={`flex min-h-14 items-center gap-2 rounded-full border px-6 text-lg font-semibold transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.96] ${
                        on
                          ? "border-transparent bg-gradient-to-b from-[#2E313A] to-[#15171D] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_14px_-6px_rgba(0,0,0,0.5)]"
                          : "border-black/[0.06] bg-white text-coal shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                      }`}
                    >
                      {on && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          viewBox="0 0 24 24"
                          className="h-5 w-5 text-[#5CE58F]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </motion.svg>
                      )}
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="flex cursor-pointer items-start gap-4 rounded-[1.6rem] border border-black/5 bg-white/60 p-6">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={data.consent}
                onChange={(e) => set("consent", e.target.checked)}
              />
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-sky ${
                  data.consent
                    ? "border-transparent bg-gradient-to-b from-[#4D94FF] to-[#1362FB] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_10px_-4px_rgba(19,98,251,0.6)]"
                    : "border-black/15 bg-white shadow-[inset_0_2px_3px_rgba(0,0,0,0.06)]"
                }`}
              >
                {data.consent && (
                  <motion.svg initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </motion.svg>
                )}
              </span>
              <span className="text-lg leading-snug text-coal">
                I&rsquo;d like Sterlixit (Sterlix IT Ltd) to email me my website report and contact me about it. I can unsubscribe at any time.{" "}
                <a
                  href={privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy policy
                </a>
              </span>
            </label>

            {serverError && serverError.field !== "name" && serverError.field !== "email" && (
              <p role="alert" className="text-lg font-semibold text-poor-text">
                {serverError.message}
              </p>
            )}

            <TactileButton type="submit" disabled={!canSubmit}>
              {submitting ? "Sending…" : "Send my report"}
            </TactileButton>
            {!data.consent && <p className="text-center text-base text-stone">Tick the box above so we can email your report.</p>}
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
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
