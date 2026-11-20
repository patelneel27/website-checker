"use client";

import { motion } from "motion/react";
import { CheckBadge, PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";
import { FeatureIcon, type FeatureIconId } from "../staffmain/FeatureIcon";

export type ResultCard = { id: string; title: string; text: string };

/** The personal "what it would do for you" result, like the health check's scores. */
export function Result({
  eyebrow,
  headline,
  cards,
  extras,
  nextTitle,
  next,
  cta,
  again,
  onBook,
  onAgain,
  onRestart,
  onLongPressLogo,
}: {
  eyebrow: string;
  headline: React.ReactNode;
  cards: ResultCard[];
  extras: string[];
  nextTitle: string;
  next: readonly string[];
  cta: string;
  again: string;
  onBook: () => void;
  onAgain: () => void;
  onRestart: () => void;
  onLongPressLogo: () => void;
}) {
  return (
    <div className="paper flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-44">
        <header className="flex items-center justify-between gap-4 px-6 pt-8 sm:px-8 sm:pt-9">
          <Logo onLongPress={onLongPressLogo} />
          <PillButton icon="restart" onClick={onRestart}>
            Start again
          </PillButton>
        </header>

        <section className="px-6 pt-10 sm:px-8">
          <p className="eyebrow">{eyebrow}</p>
          <motion.h1
            className="mt-4 font-poster text-[clamp(3.25rem,10vw,5.5rem)] leading-[0.95] font-normal text-coal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {headline}
          </motion.h1>
        </section>

        <section className="mt-10 grid gap-4 px-6 sm:grid-cols-3 sm:px-8" aria-label="What changes">
          {cards.map((c, i) => (
            <motion.article
              key={c.id}
              className="glossy flex flex-col rounded-[1.8rem] bg-gradient-to-b from-white to-[#F5F6F8] p-6"
              initial={{ opacity: 0, y: 40, scale: 0.9, rotate: i % 2 ? 4 : -4 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.3 + i * 0.12 }}
            >
              <div className="flex items-center justify-between">
                <FeatureIcon icon={c.id as FeatureIconId} size={64} />
                <span className="font-poster text-4xl text-black/10">0{i + 1}</span>
              </div>
              <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-coal">{c.title}</h2>
              <p className="mt-2 text-lg leading-snug text-stone">{c.text}</p>
            </motion.article>
          ))}
        </section>

        {extras.length > 0 && (
          <ul className="mt-8 space-y-3 px-6 sm:px-8">
            {extras.map((e, i) => (
              <motion.li
                key={e}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + i * 0.12 }}
                className="flex items-center gap-3 text-xl font-semibold text-coal"
              >
                <CheckBadge size="sm" />
                {e}
              </motion.li>
            ))}
          </ul>
        )}

        <section className="mt-14 px-6 sm:px-8">
          <p className="eyebrow">{nextTitle}</p>
          <ol className="mt-5 grid border-t-2 border-coal sm:grid-cols-3 sm:gap-6">
            {next.map((step, i) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="flex items-baseline gap-4 border-b border-black/10 py-5 sm:block sm:border-b-0"
              >
                <span className="font-poster text-4xl leading-none text-brand">0{i + 1}</span>
                <p className="text-xl leading-snug font-semibold text-coal sm:mt-3">{step}</p>
              </motion.li>
            ))}
          </ol>
        </section>
      </div>

      <div className="paper-bar">
        <div className="mx-auto flex max-w-3xl flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
          <PillButton icon="back" onClick={onAgain} className="justify-center">
            {again}
          </PillButton>
          <TactileButton onClick={onBook} className="flex-1">
            {cta}
          </TactileButton>
        </div>
      </div>
    </div>
  );
}
