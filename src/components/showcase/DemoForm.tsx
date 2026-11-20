"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ChoiceChip, PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type DemoFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  consent: boolean;
  /** Single-choice chip answers, by key. */
  chips: Record<string, string | null>;
};

export type ChipGroup = { key: string; label: string; options: readonly string[]; required?: boolean; hint?: string };

export type DemoFormCopy = {
  eyebrow: string;
  headline: readonly string[];
  subline: string;
  consent: string;
  submit: string;
  emailLabel: string;
  companyLabel: string;
  companyRequired: boolean;
  showJobTitle: boolean;
};

export const emptyDemoForm = (): DemoFormData => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  consent: false,
  chips: {},
});

/** Demo registration form, shared by every product showcase. */
export function DemoForm({
  copy,
  chipGroups,
  initial,
  privacyUrl,
  submitting,
  serverError,
  onSubmit,
  onBack,
  onLongPressLogo,
}: {
  copy: DemoFormCopy;
  chipGroups: ChipGroup[];
  initial: DemoFormData;
  privacyUrl: string;
  submitting: boolean;
  serverError: { field?: string; message: string } | null;
  onSubmit: (data: DemoFormData) => void;
  onBack: () => void;
  onLongPressLogo: () => void;
}) {
  const [d, setD] = useState<DemoFormData>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const set = <K extends keyof DemoFormData>(k: K, v: DemoFormData[K]) => setD((x) => ({ ...x, [k]: v }));
  const setChip = (k: string, v: string | null) => setD((x) => ({ ...x, chips: { ...x.chips, [k]: v } }));

  const errors: Record<string, string | null> = {
    firstName: d.firstName.trim() ? null : "Please tell us your first name.",
    lastName: d.lastName.trim() ? null : "Please tell us your last name.",
    email: EMAIL_RE.test(d.email.trim()) ? null : "Please check your email address.",
    company: !copy.companyRequired || d.company.trim() ? null : "Please tell us your company name.",
  };
  for (const g of chipGroups) if (g.required) errors[g.key] = d.chips[g.key] ? null : `Please choose: ${g.label.toLowerCase()}.`;
  const valid = Object.values(errors).every((e) => !e) && d.consent;
  const err = (k: string) => (touched[k] && errors[k]) || (serverError?.field === k ? serverError.message : null);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const knownFields = ["firstName", "lastName", "email", "company", ...chipGroups.map((g) => g.key)];

  return (
    <div className="paper flex h-full flex-col">
      <form
        className="flex-1 overflow-y-auto px-6 pt-8 pb-12 sm:px-8 sm:pt-9"
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(Object.fromEntries(Object.keys(errors).map((k) => [k, true])));
          if (valid && !submitting) onSubmit(d);
        }}
      >
        <header className="flex items-center justify-between gap-4">
          <Logo onLongPress={onLongPressLogo} />
          <PillButton icon="back" onClick={onBack}>
            My results
          </PillButton>
        </header>

        <div className="mx-auto mt-10 max-w-3xl">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="mt-4 font-poster text-[clamp(4rem,13vw,6.5rem)] leading-[0.9] font-normal text-coal">
            {copy.headline[0]}
            <br />
            <span className="text-brand">{copy.headline[1]}</span>
          </h1>
          <p className="mt-5 text-xl leading-snug text-stone">{copy.subline}</p>

          <div className="mt-10 space-y-7">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="First name" error={err("firstName")}>
                <input className="field" name="firstName" autoCapitalize="words" enterKeyHint="next" value={d.firstName} onChange={(e) => set("firstName", e.target.value)} onBlur={blur("firstName")} />
              </Field>
              <Field label="Last name" error={err("lastName")}>
                <input className="field" name="lastName" autoCapitalize="words" enterKeyHint="next" value={d.lastName} onChange={(e) => set("lastName", e.target.value)} onBlur={blur("lastName")} />
              </Field>
            </div>
            <Field label={copy.emailLabel} error={err("email")}>
              <input
                className="field"
                name="email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                value={d.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={blur("email")}
              />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label={copy.companyLabel} optional={!copy.companyRequired} error={err("company")}>
                <input className="field" name="company" enterKeyHint="next" value={d.company} onChange={(e) => set("company", e.target.value)} onBlur={blur("company")} />
              </Field>
              {copy.showJobTitle ? (
                <Field label="Job title" optional>
                  <input className="field" name="jobTitle" enterKeyHint="next" value={d.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
                </Field>
              ) : (
                <Field label="Phone" optional>
                  <input className="field" name="phone" type="tel" inputMode="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
              )}
            </div>
            {copy.showJobTitle && (
              <Field label="Phone" optional>
                <input className="field" name="phone" type="tel" inputMode="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            )}

            {chipGroups.map((g) => (
              <fieldset key={g.key}>
                <legend className="mb-3 text-lg font-bold text-coal">
                  {g.label} {!g.required && <span className="font-medium text-stone/70">(optional)</span>}
                </legend>
                {g.hint && <p className="-mt-1 mb-3 text-base text-stone">{g.hint}</p>}
                <div className="flex flex-wrap gap-3">
                  {g.options.map((o) => (
                    <ChoiceChip key={o} on={d.chips[g.key] === o} onClick={() => setChip(g.key, d.chips[g.key] === o && !g.required ? null : o)}>
                      {o}
                    </ChoiceChip>
                  ))}
                </div>
                {err(g.key) && (
                  <p role="alert" className="mt-2 text-lg font-semibold text-poor-text">
                    {err(g.key)}
                  </p>
                )}
              </fieldset>
            ))}

            <label className="flex cursor-pointer items-start gap-4 rounded-[1.6rem] border border-black/5 bg-white/60 p-6">
              <input type="checkbox" className="peer sr-only" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} />
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-sky ${
                  d.consent
                    ? "border-transparent bg-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_10px_-4px_rgba(0,0,0,0.4)]"
                    : "border-black/15 bg-white shadow-[inset_0_2px_3px_rgba(0,0,0,0.06)]"
                }`}
              >
                {d.consent && (
                  <motion.svg initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </motion.svg>
                )}
              </span>
              <span className="text-lg leading-snug text-coal">
                {copy.consent}{" "}
                <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-2" onClick={(e) => e.stopPropagation()}>
                  Privacy policy
                </a>
              </span>
            </label>

            {serverError && !knownFields.includes(serverError.field ?? "") && (
              <p role="alert" className="text-lg font-semibold text-poor-text">
                {serverError.message}
              </p>
            )}

            <TactileButton type="submit" disabled={!valid || submitting}>
              {submitting ? "Sending…" : copy.submit}
            </TactileButton>
            {!d.consent && <p className="text-center text-base text-stone">Tick the box above so we can contact you about your demo.</p>}
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
