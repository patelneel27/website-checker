"use client";

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CHECK_AREAS } from "@/lib/what-we-check";
import { AreaIcon } from "../AreaIcon";
import { BrowserBar } from "../BrowserBar";
import { CheckBadge } from "../Buttons";
import { Logo } from "../Logo";

// Order the checks roughly as they finish: our quick checks first, Lighthouse speed last.
const ORDER = ["security", "seo", "findability", "previews", "schema", "mobile", "accessibility", "speed"];
const STEPS = ORDER.map((id) => CHECK_AREAS.find((a) => a.id === id)!).filter(Boolean);

/** Time each check stays "running" before it ticks, so visitors can follow along. */
const STEP_MS = 850;
/** Pause on "All done" before the report opens. */
const FINISH_MS = 1300;
/** A repeat scan (saved result) runs the same ticks, just quicker: about 3 s in total. */
const FAST_STEP_MS = 230;
const FAST_FINISH_MS = 900;

/**
 * Ticks the checks off one at a time. The last one (Google's speed test) keeps running until the
 * real result has arrived (`ready`), then we celebrate briefly and call `onDone`.
 */
export function Scanning({ url, ready, fast, onDone }: { url: string; ready: boolean; fast: boolean; onDone: () => void }) {
  const [done, setDone] = useState(0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finished = done >= STEPS.length;
  const stepMs = fast ? FAST_STEP_MS : STEP_MS;

  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => onDoneRef.current(), fast ? FAST_FINISH_MS : FINISH_MS);
      return () => clearTimeout(t);
    }
    const last = done === STEPS.length - 1;
    if (last && !ready) return;
    const t = setTimeout(() => setDone((d) => d + 1), last ? (fast ? 300 : 700) : stepMs);
    return () => clearTimeout(t);
  }, [done, ready, finished, fast, stepMs]);

  // Percentage follows the ticks; while the last check waits on Google it creeps, never stalls.
  const pct = useMotionValue(0);
  const shown = useTransform(pct, (v) => Math.round(v));
  const waitingOnGoogle = done === STEPS.length - 1 && !ready;
  useEffect(() => {
    const target = finished ? 100 : ((done + 0.6) / STEPS.length) * 100;
    const controls = waitingOnGoogle
      ? animate(pct, 97, { duration: 30, ease: "easeOut" })
      : animate(pct, target, { duration: stepMs / 1000, ease: "easeOut" });
    return () => controls.stop();
  }, [done, finished, waitingOnGoogle, pct, stepMs]);
  const barWidth = useTransform(pct, (v) => `${v}%`);

  const site = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="paper flex h-full flex-col overflow-y-auto px-6 py-7 sm:px-8 sm:py-9" aria-live="polite">
      <Logo />

      <div className="mt-8 sm:mt-12">
        <BrowserBar state={finished ? "idle" : "busy"}>
          <span className="truncate font-display text-2xl font-bold tracking-tight text-coal sm:text-3xl">{site}</span>
        </BrowserBar>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4 sm:mt-10 sm:gap-6">
        <div>
          <AnimatePresence mode="wait">
            <motion.p
              key={finished ? "done" : "checking"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="eyebrow"
            >
              {finished ? "All done" : `Check ${Math.min(done + 1, STEPS.length)} of ${STEPS.length}`}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.h1
              key={finished ? "done" : STEPS[done].id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="mt-3 font-poster text-4xl leading-none font-normal text-coal sm:text-6xl"
            >
              {finished ? (
                <>
                  Your report <span className="text-good-text">is ready</span>
                </>
              ) : (
                STEPS[done].title
              )}
            </motion.h1>
          </AnimatePresence>
        </div>
        <p className="shrink-0 font-poster text-[5rem] leading-[0.8] font-normal text-coal tabular-nums sm:text-[8rem]">
          <motion.span>{shown}</motion.span>
          <span className="text-4xl text-brand sm:text-6xl">%</span>
        </p>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-tray shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${finished ? "from-[#4BE07F] to-[#17A94A]" : "from-[#4D94FF] to-[#1362FB]"}`}
          style={{ width: barWidth }}
        />
      </div>

      {/* The eight checks as glossy tiles: waiting (faded), running (lifted, pulsing), done (tick). */}
      <ul className="my-auto grid grid-cols-4 gap-x-2 gap-y-8 py-8 sm:gap-x-4 sm:gap-y-12 sm:py-10">
        {STEPS.map((step, i) => {
          const state = i < done ? "done" : i === done ? "running" : "waiting";
          return (
            <li key={step.id} className="flex flex-col items-center text-center">
              <motion.div
                className="relative"
                animate={
                  state === "running"
                    ? { scale: 1.1, y: [-4, -12, -4], opacity: 1, filter: "grayscale(0)" }
                    : state === "done"
                      ? { scale: [1.18, 1], y: 0, opacity: 1, filter: "grayscale(0)" }
                      : { scale: 0.92, y: 0, opacity: 0.4, filter: "grayscale(1)" }
                }
                transition={
                  state === "running"
                    ? { y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }, scale: { type: "spring", stiffness: 300 } }
                    : { type: "spring", stiffness: 320, damping: 16 }
                }
              >
                {state === "running" && (
                  <motion.span
                    className="absolute inset-0 rounded-[1.9rem] border-[3px] border-brand"
                    animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                    aria-hidden="true"
                  />
                )}
                <span className="block max-sm:[zoom:0.6]">
                  <AreaIcon icon={step.icon} size={104} />
                </span>
                <AnimatePresence>
                  {state === "done" && (
                    <motion.span
                      className="absolute -top-2.5 -right-2.5"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 14 }}
                    >
                      <CheckBadge />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <p className={`mt-3 text-sm leading-tight font-bold transition-colors sm:mt-5 sm:text-xl ${state === "waiting" ? "text-stone/45" : "text-coal"}`}>
                {step.title}
              </p>
              <p
                className={`mt-1 text-xs font-semibold sm:text-base ${
                  state === "done" ? "text-good-text" : state === "running" ? "text-brand" : "text-stone/40"
                }`}
              >
                {state === "done" ? "Done" : state === "running" ? (step.id === "speed" ? "Asking Google…" : "Checking…") : "Waiting"}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="pt-6 text-center text-base text-stone sm:text-lg">
        {waitingOnGoogle
          ? "Google’s Lighthouse test is running on a simulated phone. Nearly there…"
          : "We only look at your public homepage. Nothing is changed."}
      </p>
    </div>
  );
}
