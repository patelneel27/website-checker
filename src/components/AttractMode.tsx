"use client";

/* eslint-disable @next/next/no-img-element -- small local SVGs */

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LIVE as LF_LIVE, LIVE_EVENTS as LF_EVENTS, LIVE_TILES as LF_TILES, WELCOME as LF_WELCOME } from "@/config/letflows";
import { getAttract, getHome, isKioskDevice } from "@/lib/kiosk-device";
import { AreaIcon } from "./AreaIcon";
import { LetterRise } from "./LetterRise";
import { LiveScreen } from "./LiveDisplay";
import { Logo } from "./Logo";
import { WaveWord } from "./PlayfulHero";
import { RotatingWord } from "./RotatingWord";
import { ClockInScene } from "./staffmain/ClockInScene";
import { FeatureIcon, type FeatureIconId } from "./staffmain/FeatureIcon";

// Attract mode: when nobody has touched a start screen for a while, a full-screen showreel of
// the four demos takes over, big enough to read from across the hall. A tap opens the demo on
// screen (or just closes the reel on a tablet that's locked to one demo).
// Kiosk devices only; never mid-form, and never over staff mode.

const IDLE_MS = 45_000;
const SCENE_MS = 9_000;

type Scene = { id: string; href: string; bg: string; dark: boolean; cta: string; render: () => React.ReactNode };

function ScoreDial() {
  const v = useMotionValue(0);
  const shown = useTransform(v, (n) => Math.round(n));
  const colour = useTransform(v, [0, 49, 50, 89, 90, 100], ["#FF4E42", "#FF4E42", "#FFA400", "#FFA400", "#0CCE6B", "#0CCE6B"]);
  useEffect(() => {
    const c = animate(v, [0, 34, 34, 92], { duration: 4.2, times: [0, 0.35, 0.55, 1], ease: "easeInOut", delay: 0.6 });
    return () => c.stop();
  }, [v]);
  const R = 120;
  const C = 2 * Math.PI * R;
  const offset = useTransform(v, (n) => C * (1 - n / 100));
  return (
    <div className="relative mx-auto h-[19rem] w-[19rem]">
      <svg viewBox="0 0 280 280" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="22" />
        <motion.circle cx="140" cy="140" r={R} fill="none" strokeWidth="22" strokeLinecap="round" strokeDasharray={C} style={{ stroke: colour, strokeDashoffset: offset }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="font-poster text-[8rem] leading-none text-white tabular-nums">{shown}</motion.span>
        <span className="text-xl font-bold text-white/70">out of 100</span>
      </div>
    </div>
  );
}

const SERVICES: FeatureIconId[] = ["web", "branding", "saas", "marketing", "mvp", "ecommerce", "support", "software", "other"];

const SCENES: Scene[] = [
  {
    id: "health",
    href: "/health-check",
    bg: "bg-gradient-to-br from-[#1E6BFF] via-[#1362FB] to-[#0B3FC9]",
    dark: true,
    cta: "Tap to check your website",
    render: () => (
      <>
        <p className="text-2xl font-extrabold tracking-[0.14em] text-white/70 uppercase">Free · 60 seconds</p>
        <h2 className="mt-4 font-poster text-[clamp(5rem,15vw,9.5rem)] leading-[0.88] text-white">
          <LetterRise text="How healthy is" />
          <br />
          <LetterRise text="your website?" delay={0.35} className="text-[#FFE066]" />
        </h2>
        <div className="mt-10 flex items-center justify-center gap-6">
          <motion.div initial={{ x: -60, opacity: 0, rotate: -12 }} animate={{ x: 0, opacity: 1, rotate: -8 }} transition={{ delay: 0.8, type: "spring" }}>
            <AreaIcon icon="speed" size={88} />
          </motion.div>
          <ScoreDial />
          <motion.div initial={{ x: 60, opacity: 0, rotate: 12 }} animate={{ x: 0, opacity: 1, rotate: 8 }} transition={{ delay: 1, type: "spring" }}>
            <AreaIcon icon="search" size={88} />
          </motion.div>
        </div>
      </>
    ),
  },
  {
    id: "staffmain",
    href: "/staffmain",
    bg: "paper",
    dark: false,
    cta: "Tap to see StaffMain",
    render: () => (
      <>
        <p className="flex items-center justify-center gap-3 text-2xl font-extrabold tracking-[0.14em] text-brand uppercase">
          <img src="/staffmain/icon.svg" alt="" className="h-10 w-10" /> StaffMain · HR made simple
        </p>
        <h2 className="mt-4 font-poster text-[clamp(4rem,12vw,7.5rem)] leading-[0.9] text-coal">
          <span className="whitespace-nowrap">
            <LetterRise text="Tap." /> <LetterRise text="Clocked in." delay={0.3} />
          </span>
          <br />
          <WaveWord text="Stored." tone="blue" autoAt={1.2} />
        </h2>
        <div className="mt-10 text-left">
          <ClockInScene />
        </div>
      </>
    ),
  },
  {
    id: "letflows",
    href: "/letflows",
    bg: "bg-gradient-to-br from-[#2A1712] via-[#141C2E] to-[#0B1322]",
    dark: true,
    cta: "Tap to see LetFlows",
    render: () => (
      <>
        <img src="/letflows/logo-dark.svg" alt="LetFlows" className="mx-auto h-12 w-auto" />
        <h2 className="mt-6 font-poster text-[clamp(5rem,15vw,9.5rem)] leading-[0.88] text-white" style={{ perspective: 600 }}>
          <RotatingWord words={LF_WELCOME.rotating} every={1.6} />
          <br />
          <LetterRise text="In " delay={0.2} />
          <WaveWord text="flow." tone="brick" autoAt={0.9} />
        </h2>
        <motion.div
          className="mt-8 rounded-[2.2rem] bg-gradient-to-b from-[#2B2F3B] to-[#0F1119] p-2.5 text-left shadow-[0_40px_60px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)]"
          initial={{ y: 60, opacity: 0, rotateX: 18 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.5 }}
          style={{ transformPerspective: 1200 }}
        >
          <LiveScreen
            greeting={LF_LIVE.greeting}
            place={LF_LIVE.place}
            tiles={LF_TILES}
            events={LF_EVENTS}
            wallpaper="bg-gradient-to-br from-[#3A1F18] via-[#1B1F2E] to-[#0F1A2E]"
          />
        </motion.div>
      </>
    ),
  },
  {
    id: "enquiry",
    href: "/enquiry",
    bg: "bg-gradient-to-br from-[#25282F] via-[#16181D] to-[#0E1014]",
    dark: true,
    cta: "Tap to tell us what you need",
    render: () => (
      <>
        <p className="text-2xl font-extrabold tracking-[0.14em] text-white/60 uppercase">Websites · Branding · Apps · Marketing</p>
        <h2 className="mt-4 font-poster text-[clamp(5rem,15vw,9.5rem)] leading-[0.88] text-white">
          <LetterRise text="How can we" />
          <br />
          <WaveWord text="help?" tone="blue" autoAt={1} />
        </h2>
        <div className="mx-auto mt-12 grid max-w-[34rem] grid-cols-3 gap-6">
          {SERVICES.map((id, i) => (
            <motion.div
              key={id}
              className="flex justify-center"
              initial={{ scale: 0, rotate: i % 2 ? 25 : -25 }}
              animate={{ scale: 1, rotate: i % 2 ? 6 : -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.5 + i * 0.12 }}
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}>
                <FeatureIcon icon={id} size={112} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </>
    ),
  },
];

export function AttractMode({ enabled = true }: { enabled?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const [index, setIndex] = useState(0);
  const last = useRef(0);
  const allowed = useRef(false);

  useEffect(() => {
    allowed.current = isKioskDevice() && getAttract();
  }, []);

  // Start with the scene for the page we're on, so the reel feels "about" this demo first.
  const startAt = useCallback(() => Math.max(0, SCENES.findIndex((s) => s.href === pathname)), [pathname]);

  useEffect(() => {
    if (!enabled || on) return;
    last.current = Date.now();
    const bump = () => (last.current = Date.now());
    const events = ["pointerdown", "keydown", "touchstart", "wheel", "scroll", "input"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true, capture: true }));
    const t = setInterval(() => {
      if (!allowed.current || document.hidden || document.body.dataset.staff) {
        last.current = Date.now();
        return;
      }
      if (Date.now() - last.current >= IDLE_MS) {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        setIndex(startAt());
        setOn(true);
      }
    }, 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump, { capture: true }));
      clearInterval(t);
    };
  }, [enabled, on, startAt]);

  // Next scene every few seconds; close if staff mode opens.
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => {
      if (document.body.dataset.staff) setOn(false);
      else setIndex((i) => (i + 1) % SCENES.length);
    }, SCENE_MS);
    return () => clearInterval(t);
  }, [on]);

  const scene = SCENES[index];

  const tap = () => {
    setOn(false);
    // A tablet locked to one demo stays there; the event home sends people to the demo shown.
    if (getHome() === "/" && scene.href !== pathname) router.push(scene.href);
  };

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          key="attract"
          className="fixed inset-0 z-[70] cursor-pointer overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            tap();
          }}
          role="button"
          aria-label={`${scene.cta}. Tap anywhere to start.`}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={scene.id}
              className={`absolute inset-0 flex flex-col ${scene.bg}`}
              style={{ zIndex: 2 }}
              initial={{ clipPath: "circle(0% at 50% 100%)" }}
              animate={{ clipPath: "circle(150% at 50% 100%)" }}
              // Keep the old scene underneath until the new one has fully wiped over it.
              exit={{ zIndex: 1, opacity: 0, transition: { opacity: { delay: 1, duration: 0 }, zIndex: { duration: 0 } } }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            >
              <div className="flex items-center justify-between px-10 pt-10">
                <Logo tone={scene.dark ? "light" : "dark"} />
                <span className={`rounded-full px-4 py-2 text-base font-extrabold tracking-[0.12em] uppercase ${scene.dark ? "bg-white/12 text-white" : "bg-coal text-white"}`}>
                  Come and say hello
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center px-10 pb-44 text-center">{scene.render()}</div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom: story-style progress and the call to action */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-10 pb-10">
            <div className="mx-auto mb-6 flex max-w-xl gap-2" aria-hidden="true">
              {SCENES.map((s, i) => (
                <span key={s.id} className={`h-1.5 flex-1 overflow-hidden rounded-full ${scene.dark ? "bg-white/20" : "bg-black/10"}`}>
                  {i < index && <span className={`block h-full w-full ${scene.dark ? "bg-white" : "bg-coal"}`} />}
                  {i === index && (
                    <motion.span
                      key={`${s.id}-${index}`}
                      className={`block h-full ${scene.dark ? "bg-white" : "bg-coal"}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: SCENE_MS / 1000, ease: "linear" }}
                    />
                  )}
                </span>
              ))}
            </div>
            <motion.div
              key={scene.cta}
              className={`mx-auto flex w-fit items-center gap-4 rounded-full py-3 pr-8 pl-3 text-2xl font-extrabold shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)] ${
                scene.dark ? "bg-white text-coal" : "bg-coal text-white"
              }`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 220, damping: 18 }}
            >
              <span className="relative flex h-14 w-14 items-center justify-center">
                <motion.span
                  className={`absolute inset-0 rounded-full ${scene.dark ? "bg-brand" : "bg-white"}`}
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                <span className={`relative flex h-14 w-14 items-center justify-center rounded-full ${scene.dark ? "bg-brand text-white" : "bg-white text-coal"}`}>
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.9-2.5L4 14.4a1.6 1.6 0 0 1 2.4-2.1L9 14.5" />
                  </svg>
                </span>
              </span>
              {scene.cta}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
