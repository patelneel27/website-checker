"use client";

import { motion } from "motion/react";
import { forwardRef, useEffect, useState } from "react";
import { TactileButton } from "./Buttons";

// Welcome hero: oversized condensed headline with glossy, website-themed objects floating
// around and over it (Google result, share card, score, toggle, cursor, speed/search/lock).

/** Entrance pop + gentle endless bob. */
export function Float({
  children,
  className,
  rotate = 0,
  delay = 0,
  bob = 10,
  duration = 5,
}: {
  children: React.ReactNode;
  className: string;
  rotate?: number;
  delay?: number;
  bob?: number;
  duration?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute ${className}`}
      initial={{ opacity: 0, scale: 0.6, rotate: rotate - 18, y: 30 }}
      animate={{ opacity: 1, scale: 1, rotate, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 16, delay }}
    >
      <motion.div
        animate={{ y: [0, -bob, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay: delay + 0.8 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------------------------
// Objects

function GoogleCard() {
  return (
    <div className="glossy w-[15.5rem] rounded-[1.4rem] bg-white p-4 font-[Arial,sans-serif]">
      <div className="flex items-center gap-2">
        <span className="h-6 w-6 rounded-full bg-gradient-to-br from-sky to-brand" />
        <span className="text-[13px] leading-tight text-[#4D5156]">
          Your Business
          <br />
          yourwebsite.co.uk
        </span>
      </div>
      <p className="mt-2 text-[17px] leading-snug text-[#1A0DAB]">Web design &amp; SEO in London</p>
      <span className="mt-2 block h-2 w-full rounded-full bg-[#E8EAED]" />
      <span className="mt-1.5 block h-2 w-4/5 rounded-full bg-[#E8EAED]" />
      <span className="absolute top-3 right-4 text-[11px] font-bold tracking-wide text-ink/40 uppercase">Google</span>
    </div>
  );
}

function ShareCard() {
  return (
    <div className="glossy w-[13rem] overflow-hidden rounded-[1.4rem] bg-white">
      <div className="relative h-28 bg-gradient-to-br from-[#5C9BFF] via-[#1362FB] to-[#1433D6]">
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60 L55 18 L95 45 L135 8 L200 52 L200 60 Z" fill="rgba(255,255,255,0.35)" />
        </svg>
        <span className="absolute top-4 right-5 h-6 w-6 rounded-full bg-[#FFD43B]" />
      </div>
      <div className="bg-[#F2F3F5] px-4 py-2.5 font-[Arial,sans-serif]">
        <p className="text-[11px] tracking-wide text-[#606770] uppercase">yourwebsite.co.uk</p>
        <p className="text-[14px] font-bold text-[#1D2129]">og:image ✓</p>
      </div>
    </div>
  );
}

function ScoreCard() {
  const R = 34;
  const C = 2 * Math.PI * R;
  return (
    <div className="glossy flex w-[9.5rem] flex-col items-center rounded-[1.6rem] bg-gradient-to-b from-white to-[#F3F5FA] px-4 pt-5 pb-4">
      <div className="relative h-[84px] w-[84px]">
        <svg width="84" height="84" className="-rotate-90" aria-hidden="true">
          <circle cx="42" cy="42" r={R} fill="none" stroke="#E6EAF5" strokeWidth="8" />
          <motion.circle
            cx="42"
            cy="42"
            r={R}
            fill="none"
            stroke="#0CCE6B"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * 0.08 }}
            transition={{ duration: 1.6, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-extrabold text-good-text">92</span>
      </div>
      <p className="mt-2 text-base font-bold text-navy">SEO</p>
    </div>
  );
}

function Toggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 1300);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={`glossy relative h-[5.5rem] w-[10.5rem] rounded-full p-2 transition-colors duration-500 ${
        on ? "bg-gradient-to-b from-[#4BE07F] to-[#17A94A]" : "bg-gradient-to-b from-[#D9DBE1] to-[#BFC3CC]"
      }`}
    >
      <motion.span
        className="block h-[4.5rem] w-[4.5rem] rounded-full bg-gradient-to-b from-white to-[#E9ECF2] shadow-[0_6px_14px_rgba(0,0,0,0.25),inset_0_-3px_6px_rgba(0,0,0,0.08)]"
        animate={{ x: on ? 66 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
    </div>
  );
}

export function Cursor() {
  return (
    <svg width="92" height="104" viewBox="0 0 46 52" className="drop-shadow-[0_14px_14px_rgba(10,19,66,0.35)]" aria-hidden="true">
      <defs>
        <linearGradient id="cur" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A3F4D" />
          <stop offset="1" stopColor="#0E1018" />
        </linearGradient>
      </defs>
      <path d="M4 3 L42 24 L25 28 L33 46 L26 49 L18 31 L6 42 Z" fill="url(#cur)" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function Tile({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`glossy flex items-center justify-center rounded-[1.8rem] ${className}`}>{children}</div>;
}

function BoltTile() {
  return (
    <Tile className="h-[7.5rem] w-[7.5rem] bg-gradient-to-b from-[#2B2F3B] to-[#0F1119]">
      <svg width="62" height="74" viewBox="0 0 31 37" aria-hidden="true">
        <defs>
          <linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE066" />
            <stop offset="1" stopColor="#F5A700" />
          </linearGradient>
        </defs>
        <path d="M19 1 L3 21 H14 L11 36 L28 14 H17 Z" fill="url(#bolt)" />
      </svg>
    </Tile>
  );
}

function SearchTile() {
  return (
    <Tile className="h-[7rem] w-[7rem] border border-white/70 bg-white/55 backdrop-blur-md">
      <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#1362FB" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </svg>
    </Tile>
  );
}

function LockTile() {
  return (
    <Tile className="h-[8.5rem] w-[8.5rem] bg-gradient-to-br from-[#4D94FF] to-[#1433D6]">
      <svg width="70" height="80" viewBox="0 0 35 40" aria-hidden="true">
        <defs>
          <linearGradient id="lockbody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4F6FA" />
            <stop offset="1" stopColor="#AEB6C6" />
          </linearGradient>
        </defs>
        <path d="M9 17 V11 a8.5 8.5 0 0 1 17 0 V17" fill="none" stroke="#DDE2EC" strokeWidth="4" />
        <rect x="3" y="16" width="29" height="22" rx="5" fill="url(#lockbody)" />
        <circle cx="17.5" cy="25.5" r="3" fill="#2B3142" />
        <rect x="16.2" y="26" width="2.6" height="6" rx="1.3" fill="#2B3142" />
      </svg>
    </Tile>
  );
}


// ---------------------------------------------------------------------------------------------
// Headline words that come alive: glossy gradient letters that jump in a wave on hover or tap.
// They also play once on their own after the entrance, since the kiosk tablet has no hover.

const WORD_TONES = {
  green: "from-[#3BD677] to-[#0E9442]",
  blue: "from-[#4D94FF] to-[#1450F0]",
  brick: "from-[#F0704A] to-[#C4431E]",
  coal: "from-[#3A3F4D] to-[#0E1018]",
} as const;

export type WordTone = keyof typeof WORD_TONES;

/**
 * A headline word whose glossy letters jump in a wave on hover or tap. It also plays on its own
 * shortly after the page loads, then every `repeatEvery` seconds, since the kiosk has no hover.
 */
export function WaveWord({
  text,
  tone,
  autoAt,
  pulse,
  repeatEvery,
}: {
  text: string;
  tone: WordTone;
  autoAt: number;
  pulse?: boolean;
  repeatEvery?: number;
}) {
  const [run, setRun] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRun((n) => n + 1), autoAt * 1000);
    const r = repeatEvery ? setInterval(() => setRun((n) => n + 1), repeatEvery * 1000) : undefined;
    return () => {
      clearTimeout(t);
      clearInterval(r);
    };
  }, [autoAt, repeatEvery]);

  useEffect(() => {
    if (!run) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot trigger
    setActive(true);
    const t = setTimeout(() => setActive(false), 400 + text.length * 45);
    return () => clearTimeout(t);
  }, [run, text.length]);

  const trigger = () => {
    if (!active) setRun((n) => n + 1);
  };
  const letters = [...text];

  return (
    <span className="relative inline-block cursor-default" onPointerEnter={trigger} onPointerDown={trigger}>
      <span className="sr-only">{text}</span>
      {letters.map((ch, i) => {
        const isMark = ch === "?";
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className={`inline-block whitespace-pre bg-gradient-to-b -my-[0.15em] bg-clip-text py-[0.15em] text-transparent ${WORD_TONES[tone]}`}
            animate={
              active
                ? {
                    y: [0, -26, 4, 0],
                    rotate: isMark ? [0, 200, 360] : [0, i % 2 ? 7 : -7, 0],
                    scale: [1, 1.08, 0.98, 1],
                  }
                : { y: 0, rotate: 0, scale: 1 }
            }
            transition={active ? { duration: isMark ? 0.8 : 0.55, delay: i * 0.045, ease: "easeOut" } : { duration: 0.2 }}
          >
            {ch}
          </motion.span>
        );
      })}
      {pulse && <Heartbeat active={active} />}
    </span>
  );
}

/** A heart-monitor line that draws under "healthy" when it animates. */
function Heartbeat({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 300 40"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-[0.55em] left-0 h-[0.42em] w-full overflow-visible"
      aria-hidden="true"
    >
      <motion.path
        d="M0 22 H95 L110 22 L122 4 L136 38 L150 12 L160 22 H300"
        fill="none"
        stroke="#17A94A"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 0.35 }}
        transition={active ? { duration: 0.7, ease: "easeInOut" } : { duration: 0.8, delay: 0.3 }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------------------------

export const PlayfulHero = forwardRef<HTMLDivElement, { onStart: () => void }>(function PlayfulHero({ onStart }, ctaRef) {
  return (
    <section className="relative px-8 pt-6 pb-10">
      {/* Stage: headline with objects layered around and over it */}
      <div className="relative mx-auto h-[31rem] max-w-[47rem]">
        {/* Objects are decorative; the headline carries the meaning. */}
        <h1 className="relative z-10 font-poster text-[7.6rem] leading-[0.9] tracking-[-0.005em] text-[#16181D]">
          <motion.span
            className="absolute whitespace-nowrap top-[1.5rem] left-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0, ease: [0.22, 1, 0.36, 1] }}
          >
            How <WaveWord text="healthy" tone="green" autoAt={1.5} repeatEvery={11} pulse />
          </motion.span>
          <motion.span
            className="absolute whitespace-nowrap top-[10.5rem] left-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            is your
          </motion.span>
          <motion.span
            className="absolute whitespace-nowrap top-[19.5rem] right-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <WaveWord text="website?" tone="blue" autoAt={2.1} repeatEvery={11} />
          </motion.span>
        </h1>

        {/* Toggle switching on, overlapping the end of line 1 */}
        <Float className="top-[3rem] right-[-1.5rem] z-30" rotate={-8} delay={0.5} bob={6} duration={4.2}>
          <Toggle />
        </Float>

        {/* Website cards fanned to the right of line 2 */}
        <Float className="top-[8.5rem] right-[-2rem] z-0" rotate={16} delay={0.35} bob={8} duration={5.5}>
          <ShareCard />
        </Float>
        <Float className="top-[9.5rem] left-[25rem] z-10" rotate={-8} delay={0.45} bob={7} duration={4.8}>
          <ScoreCard />
        </Float>
        <Float className="top-[11.25rem] right-[-0.75rem] z-20" rotate={6} delay={0.55} bob={10} duration={6}>
          <GoogleCard />
        </Float>

        {/* Cursor pointing at the Google result */}
        <Float className="top-[15rem] left-[22.5rem] z-30" rotate={-4} delay={0.9} bob={12} duration={3.6}>
          <Cursor />
        </Float>

        {/* Speed / search / security cluster, left of line 3 */}
        <Float className="top-[19rem] left-[-1rem] z-20" rotate={-10} delay={0.7} bob={9} duration={5.2}>
          <BoltTile />
        </Float>
        <Float className="top-[18.5rem] left-[8.5rem] z-20" rotate={12} delay={0.9} bob={10} duration={5.8}>
          <LockTile />
        </Float>
        <Float className="top-[23rem] left-[5.5rem] z-30" rotate={6} delay={0.8} bob={7} duration={4.6}>
          <SearchTile />
        </Float>
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-xl leading-relaxed text-[#4A4F5C]">
        A free 60-second check of your speed, SEO, social previews and security, using Google&rsquo;s own Lighthouse test,
        explained in plain English.
      </p>

      {/* Tactile CTA */}
      <div ref={ctaRef} className="mx-auto mt-8 max-w-[34rem]">
        <TactileButton onClick={onStart}>Check my website</TactileButton>
      </div>

      <ol className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-lg font-semibold text-[#4A4F5C]">
        {["Type in your website", "See your scores", "Get the full report by email"].map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="font-poster text-xl text-brand">0{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
});
