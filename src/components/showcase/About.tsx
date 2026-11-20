"use client";

import { motion } from "motion/react";
import { ChoiceChip, PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";

export type Answers = Record<string, string | string[] | null>;

export type Question = {
  key: string;
  title: string;
  hint?: string;
  options: readonly string[];
  /** Pick any number (stored as string[]), otherwise pick one. */
  multi?: boolean;
  required?: boolean;
};

/** Three quick taps about the visitor's business. */
export function About({
  eyebrow,
  headline,
  subline,
  questions,
  cta,
  neededHint,
  backLabel,
  answers,
  onChange,
  onContinue,
  onBack,
  onLongPressLogo,
}: {
  eyebrow: string;
  headline: readonly [string, string] | readonly string[];
  subline: string;
  questions: Question[];
  cta: string;
  neededHint: string;
  backLabel: string;
  answers: Answers;
  onChange: (a: Answers) => void;
  onContinue: () => void;
  onBack: () => void;
  onLongPressLogo: () => void;
}) {
  const ready = questions.every((q) => !q.required || (q.multi ? (answers[q.key] as string[] | undefined)?.length : answers[q.key]));

  const pick = (q: Question, option: string) => {
    if (q.multi) {
      const list = (answers[q.key] as string[] | null) ?? [];
      onChange({ ...answers, [q.key]: list.includes(option) ? list.filter((x) => x !== option) : [...list, option] });
    } else {
      onChange({ ...answers, [q.key]: option });
    }
  };
  const isOn = (q: Question, option: string) =>
    q.multi ? ((answers[q.key] as string[] | null) ?? []).includes(option) : answers[q.key] === option;

  return (
    <div className="paper flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-44">
        <header className="flex items-center justify-between gap-4 px-6 pt-8 sm:px-8 sm:pt-9">
          <Logo onLongPress={onLongPressLogo} />
          <PillButton icon="back" onClick={onBack}>
            {backLabel}
          </PillButton>
        </header>

        <section className="mx-auto max-w-3xl px-6 pt-10 sm:px-8">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-poster text-[clamp(4rem,13vw,6.5rem)] leading-[0.9] font-normal text-coal">
            {headline[0]}
            <br />
            <span className="text-brand">{headline[1]}</span>
          </h1>
          <p className="mt-5 text-xl text-stone">{subline}</p>

          <div className="mt-10 space-y-8">
            {questions.map((q, i) => (
              <motion.fieldset
                key={q.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i + 1) * 0.08 }}
                className="border-t border-black/10 pt-6"
              >
                <legend className="sr-only">{q.title}</legend>
                <div className="flex items-baseline gap-4" aria-hidden="true">
                  <span className="font-poster text-3xl text-brand">0{i + 1}</span>
                  <p className="font-display text-2xl font-extrabold tracking-tight text-coal">
                    {q.title}
                    {q.hint && <span className="ml-3 font-sans text-base font-semibold text-stone">{q.hint}</span>}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {q.options.map((o) => (
                    <ChoiceChip key={o} on={isOn(q, o)} onClick={() => pick(q, o)}>
                      {o}
                    </ChoiceChip>
                  ))}
                </div>
              </motion.fieldset>
            ))}
          </div>
        </section>
      </div>

      <div className="paper-bar">
        <div className="mx-auto max-w-[34rem]">
          <TactileButton onClick={onContinue} disabled={!ready}>
            {cta}
          </TactileButton>
          {!ready && <p className="mt-2 text-center text-base text-stone">{neededHint}</p>}
        </div>
      </div>
    </div>
  );
}
