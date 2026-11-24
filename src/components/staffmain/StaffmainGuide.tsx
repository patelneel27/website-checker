"use client";

/* eslint-disable @next/next/no-img-element -- small local SVG */

import { motion } from "motion/react";
import { TRIAL } from "@/config/staffmain";
import { GUIDE_INDUSTRIES, GUIDE_INTRO, GUIDE_SECTIONS, GUIDE_WORDS } from "@/config/staffmain-guide";
import { CheckBadge } from "../Buttons";
import { TrialBadge } from "../showcase/Result";
import { FeatureIcon } from "./FeatureIcon";

// The full StaffMain feature list, inside staff mode. Big, plain type so the team can read from it
// or turn the tablet round and let a visitor read it ("Show to visitor" opens it full screen).

export function StaffmainGuide({ large = false }: { large?: boolean }) {
  return (
    <div className={`mx-auto max-w-4xl ${large ? "px-6 py-8 sm:px-10 sm:py-10" : "py-2"}`}>
      <header className="flex items-center gap-4">
        <span className="glossy flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.2rem] bg-gradient-to-b from-white to-[#F1F2F6]">
          <img src="/staffmain/icon.svg" alt="" className="h-10 w-10" />
        </span>
        <div>
          <p className="eyebrow">StaffMain by Sterlixit</p>
          <h2 className="font-poster text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] font-normal text-coal">{GUIDE_INTRO.title}</h2>
        </div>
      </header>
      <p className="mt-4 max-w-2xl text-xl leading-snug text-stone">{GUIDE_INTRO.text}</p>

      <TrialBadge trial={TRIAL} className="mt-6" />

      {/* Who it's for */}
      <section className="mt-8">
        <h3 className="font-display text-2xl font-extrabold tracking-tight text-coal">Built for</h3>
        <ul className="mt-3 flex flex-wrap gap-2.5">
          {GUIDE_INDUSTRIES.map((i) => (
            <li key={i} className="rounded-full border border-black/5 bg-white px-4 py-2 text-lg font-semibold text-coal shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              {i}
            </li>
          ))}
        </ul>
      </section>

      {/* Its own words for each business */}
      <section className="mt-8 rounded-[1.6rem] bg-[#F3F5FA] p-5 sm:p-6">
        <h3 className="font-display text-2xl font-extrabold tracking-tight text-coal">Speaks your language</h3>
        <p className="mt-1 text-lg leading-snug text-stone">StaffMain uses the right words for your business. For tuition:</p>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          {GUIDE_WORDS.map((w) => (
            <div key={w.everyone} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-white px-4 py-3 text-lg leading-snug">
              <dt className="text-stone">{w.everyone}</dt>
              <span aria-hidden="true" className="text-brand">
                →
              </span>
              <dd className="font-bold text-coal">{w.tuition}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Every feature */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {GUIDE_SECTIONS.map((s, i) => (
          <motion.section
            key={s.title}
            className="glossy rounded-[1.8rem] bg-gradient-to-b from-white to-[#F6F7F9] p-5 sm:p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 6) * 0.05 }}
          >
            <div className="flex items-center gap-4">
              <FeatureIcon icon={s.icon} size={52} />
              <div className="min-w-0">
                <h3 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-coal">{s.title}</h3>
                <p className="text-lg leading-snug text-stone">{s.summary}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2.5">
              {s.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-lg leading-snug text-coal">
                  <span className="mt-0.5">
                    <CheckBadge size="sm" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
