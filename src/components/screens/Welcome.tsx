"use client";

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BAND_COLOURS, bandFor, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/scores";
import { CHECK_AREAS } from "@/lib/what-we-check";
import { AttractMode } from "../AttractMode";
import { Logo } from "../Logo";
import { WhatWeCheckSheet } from "../WhatWeCheckSheet";
import { PillButton, TactileButton } from "../Buttons";
import { PlayfulHero } from "../PlayfulHero";

export function Welcome({ onStart, onLongPressLogo }: { onStart: () => void; onLongPressLogo: () => void }) {
  const [sheet, setSheet] = useState<{ open: boolean; focus?: string }>({ open: false });
  const heroCta = useRef<HTMLDivElement>(null);
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);

  // Show the sticky button only once the hero's own button has scrolled away.
  useEffect(() => {
    const el = heroCta.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setHeroCtaVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="paper flex h-full flex-col">
      <div className="flex-1 overflow-x-hidden overflow-y-auto pb-32">
        <header className="flex items-center justify-between gap-3 px-6 pt-7 sm:gap-4 sm:px-8 sm:pt-9">
          <Logo intro onLongPress={onLongPressLogo} />
          <div className="shrink-0 max-sm:[zoom:0.72]">
            <FreeSticker />
          </div>
        </header>

        <PlayfulHero ref={heroCta} onStart={onStart} />

        {/* What we check */}
        <section className="px-6 pt-12 sm:px-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <p className="eyebrow">What we check</p>
              <h2 className="display mt-3 text-3xl leading-tight sm:text-4xl">Eight areas. One quick scan.</h2>
            </div>
            <PillButton icon="arrow" onClick={() => setSheet({ open: true })} className="shrink-0">
              Full details
            </PillButton>
          </div>

          <ul className="mt-8 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
            {CHECK_AREAS.map((area, i) => (
              <li key={area.id} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setSheet({ open: true, focus: area.id })}
                  className="group flex w-full items-start gap-4 py-4 text-left sm:py-5"
                >
                  <span className="font-poster text-2xl leading-none text-brand tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-navy sm:text-xl">{area.title}</span>
                    <span className="mt-0.5 block text-base leading-snug text-ink">{area.short}</span>
                  </span>
                  <span className="pt-0.5 text-xl text-navy/30 transition group-active:translate-x-1 group-active:text-brand" aria-hidden="true">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-base text-ink">
            We only look at your public homepage, exactly as Google sees it. Nothing behind a login, and we never change anything.
          </p>
        </section>

        <ExampleStrip />
      </div>

      <AnimatePresence>
        {!heroCtaVisible && (
          <motion.div
            className="paper-bar"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="mx-auto max-w-[34rem]">
              <TactileButton onClick={onStart}>Check my website</TactileButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AttractMode enabled={!sheet.open} />

      <AnimatePresence>
        {sheet.open && (
          <WhatWeCheckSheet
            focus={sheet.focus}
            onClose={() => setSheet({ open: false })}
            onStart={() => {
              setSheet({ open: false });
              onStart();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Example result: shows what the visitor will get (clearly labelled as an example).

const EXAMPLES: { scores: number[]; summary: string }[] = [
  { scores: [58, 92, 88, 100], summary: "Findable, but slow on mobile" },
  { scores: [34, 71, 79, 83], summary: "Lots of quick wins to grab" },
  { scores: [96, 100, 95, 100], summary: "In excellent shape" },
];

function ExampleStrip() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % EXAMPLES.length), 4000);
    return () => clearInterval(t);
  }, []);
  const ex = EXAMPLES[i];

  return (
    <section className="mt-14 bg-white/70 px-6 py-10 sm:px-8 sm:py-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p className="eyebrow">Example result</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={ex.summary}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-lg font-bold text-navy sm:text-xl"
          >
            {ex.summary}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-navy/10">
        {CATEGORY_ORDER.map((k, idx) => {
          const v = ex.scores[idx];
          const c = BAND_COLOURS[bandFor(v)];
          return (
            <div key={k} className="sm:px-5 sm:first:pl-0 sm:last:pr-0">
              <AnimatePresence mode="wait">
                <motion.p
                  key={v}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="display text-5xl tabular-nums sm:text-6xl"
                  style={{ color: c.text }}
                >
                  {v}
                </motion.p>
              </AnimatePresence>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/10">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${v}%`, backgroundColor: c.ring }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-3 text-base font-semibold text-navy sm:text-lg">{CATEGORY_LABELS[k]}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-base text-ink">Scores out of 100 from Google Lighthouse. 90+ is good.</p>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------
// "Free · 60 sec" as a glossy sticker: pops on at a tilt, counts up to 60, stopwatch ticks.

function FreeSticker() {
  const secs = useMotionValue(0);
  const shown = useTransform(secs, (v) => Math.round(v));
  useEffect(() => {
    const c = animate(secs, 60, { duration: 1.4, delay: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [secs]);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.5, rotate: 14, y: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 4, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 13, delay: 0.5 }}
      whileHover={{ rotate: [4, -3, 6, 4], transition: { duration: 0.5 } }}
      whileTap={{ scale: 0.94, rotate: -2 }}
      aria-label="Free, takes 60 seconds"
      role="img"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
        className="glossy flex items-center gap-3 rounded-full bg-gradient-to-b from-white to-[#F3F4F6] py-2 pr-5 pl-2"
      >
        <span className="rounded-full bg-gradient-to-b from-[#4BE07F] to-[#17A94A] px-3.5 py-1.5 text-sm font-extrabold tracking-[0.14em] text-white uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          Free
        </span>
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
          <rect x="13" y="1.5" width="6" height="3.5" rx="1.2" fill="#16181D" />
          <rect x="24.5" y="5.5" width="4" height="3" rx="1" transform="rotate(45 26.5 7)" fill="#16181D" />
          <circle cx="16" cy="18" r="12" fill="#fff" stroke="#16181D" strokeWidth="2.6" />
          <g className="stopwatch-hand" style={{ transformBox: "view-box", transformOrigin: "16px 18px" }}>
            <path d="M16 18V10" stroke="#1362FB" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          <circle cx="16" cy="18" r="1.8" fill="#16181D" />
        </svg>
        <span className="flex items-baseline gap-1 text-coal">
          <motion.span className="font-poster text-3xl leading-none tabular-nums">{shown}</motion.span>
          <span className="text-base font-bold">sec</span>
        </span>
      </motion.div>
    </motion.div>
  );
}
