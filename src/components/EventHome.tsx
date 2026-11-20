"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { AreaIcon } from "./AreaIcon";
import { AttractMode } from "./AttractMode";
import { CheckBadge } from "./Buttons";
import { LetterRise } from "./LetterRise";
import { Logo } from "./Logo";
import { WaveWord } from "./PlayfulHero";
import { StaffPanel } from "./StaffPanel";
import { FeatureIcon } from "./staffmain/FeatureIcon";

// The event home: one link for the whole stand. The team (or a visitor) picks a demo here.

function MiniRing({ value }: { value: number }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  return (
    <div className="glossy relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-[1.4rem] bg-gradient-to-b from-white to-[#F3F5FA]">
      <svg width="72" height="72" className="-rotate-90" aria-hidden="true">
        <circle cx="36" cy="36" r={R} fill="none" stroke="#E6EAF5" strokeWidth="7" />
        <motion.circle
          cx="36"
          cy="36"
          r={R}
          fill="none"
          stroke="#0CCE6B"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - value / 100) }}
          transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute font-display text-2xl font-extrabold text-good-text">{value}</span>
    </div>
  );
}

function Choice({
  href,
  index,
  visual,
  title,
  text,
  meta,
}: {
  href: string;
  index: number;
  visual: React.ReactNode;
  title: string;
  text: string;
  meta: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: index % 2 ? 2 : -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.35 + index * 0.12 }}
    >
      <Link href={href} className="choice glossy group block rounded-[2.2rem] bg-gradient-to-b from-white to-[#F6F6F4] p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 max-sm:[zoom:0.82]">{visual}</div>
          <span className="choice-arrow flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#2E313A] to-[#15171D] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_16px_-8px_rgba(0,0,0,0.5)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
        </div>
        <h2 className="mt-6 font-poster text-[2.75rem] leading-none font-normal text-coal sm:text-[3.25rem]">{title}</h2>
        <p className="mt-3 text-lg leading-snug text-stone sm:text-xl">{text}</p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {meta.map((m) => (
            <li key={m} className="flex items-center gap-2 text-base font-semibold text-coal">
              <CheckBadge size="sm" />
              {m}
            </li>
          ))}
        </ul>
      </Link>
    </motion.div>
  );
}

export function EventHome({ eventName, demoUrl }: { eventName: string; demoUrl: string }) {
  const [staffOpen, setStaffOpen] = useState(false);

  return (
    <main className="paper flex h-dvh flex-col overflow-y-auto">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 pt-8 sm:px-8 sm:pt-9">
        <Logo intro onLongPress={() => setStaffOpen(true)} />
        <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-bold tracking-[0.12em] text-coal uppercase shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:text-sm">
          {eventName}
        </span>
      </header>

      <section className="px-6 pt-12 sm:px-8">
        <p className="eyebrow">Welcome to the Sterlixit stand</p>
        <h1 className="mt-4 font-poster text-[clamp(3.5rem,15vw,8.5rem)] leading-[0.88] font-normal text-coal">
          <span className="block">
            <LetterRise text="What can we" />
          </span>
          <span className="block">
            <WaveWord text="show you?" tone="blue" autoAt={1.1} repeatEvery={11} />
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-xl leading-snug text-stone sm:text-2xl">Pick one to get started. Each takes just a couple of minutes. Not sure? Pick “Something else?”.</p>
      </section>

      <section className="grid gap-6 px-6 pt-10 pb-10 sm:px-8">
        <Choice
          href="/health-check"
          index={0}
          visual={
            <div className="flex items-center gap-3">
              <MiniRing value={92} />
              <AreaIcon icon="speed" size={64} className="-rotate-6" />
              <AreaIcon icon="search" size={56} className="rotate-6" />
            </div>
          }
          title="Website Health Check"
          text="How fast, findable and secure is your website? A free 60-second check using Google's own test."
          meta={["60 seconds", "Free report by email"]}
        />
        <Choice
          href="/staffmain"
          index={1}
          visual={
            <div className="flex items-center gap-3">
              <span className="glossy flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-[1.4rem] bg-gradient-to-b from-white to-[#F1F2F6]">
                {/* eslint-disable-next-line @next/next/no-img-element -- small local SVG */}
                <img src="/staffmain/icon.svg" alt="" className="h-14 w-14" />
              </span>
              <FeatureIcon icon="attendance" size={64} className="-rotate-6" />
              <FeatureIcon icon="leave" size={56} className="rotate-6" />
            </div>
          }
          title="StaffMain"
          text="HR software made simple: people, leave, rota and attendance in one place. See what it would do for your team."
          meta={["2–3 minutes", "Free demo"]}
        />
        <Choice
          href="/letflows"
          index={2}
          visual={
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- small local SVG */}
              <img src="/letflows/mark.svg" alt="" className="glossy h-[5.5rem] w-[5.5rem] rounded-[1.4rem]" />
              <FeatureIcon icon="rent" size={64} className="-rotate-6" />
              <FeatureIcon icon="compliance" size={56} className="rotate-6" />
            </div>
          }
          title="LetFlows"
          text="Let it flow: all your properties on one platform. Rent, repairs, compliance and tax today, buying and selling next."
          meta={["2–3 minutes", "Free demo"]}
        />
        <Choice
          href="/enquiry"
          index={3}
          visual={
            <div className="flex items-center gap-3">
              <FeatureIcon icon="web" size={76} />
              <FeatureIcon icon="branding" size={64} className="-rotate-6" />
              <FeatureIcon icon="other" size={56} className="rotate-6" />
            </div>
          }
          title="Something else?"
          text="Websites, branding, apps, marketing… tell us what you need. Not sure which one fits? This is always the right place."
          meta={["Under 1 minute", "Reply within 2 working days"]}
        />
      </section>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-black/10 px-6 py-6 text-base text-stone sm:px-8">
        <span>
          <strong className="text-coal">Sterlixit</strong> · web, branding and software
        </span>
        <span className="font-semibold text-brand">sterlixit.co.uk</span>
      </footer>

      <AttractMode />
      {staffOpen && <StaffPanel demoUrl={demoUrl} onClose={() => setStaffOpen(false)} onResetKiosk={() => setStaffOpen(false)} />}
    </main>
  );
}
