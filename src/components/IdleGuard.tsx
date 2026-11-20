"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TactileButton } from "./Buttons";

const IDLE_MS = 90_000;
const WARNING_S = 10;

/**
 * After 90 s without a touch, shows "Still there?" for 10 s, then calls `onTimeout`.
 * Only runs while `active` (e.g. not on the welcome screen, and only on kiosk devices).
 *
 * Built to be hard to miss on a tablet: a tap anywhere on the popup counts as "I'm still here",
 * the on-screen keyboard is closed when it appears (so the button is never hidden under it),
 * and typing counts as activity.
 */
export function IdleGuard({ active, onTimeout }: { active: boolean; onTimeout: () => void }) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const last = useRef(0);

  const stillHere = useCallback(() => {
    last.current = Date.now();
    setCountdown(null);
  }, []);

  useEffect(() => {
    if (!active) return;
    last.current = Date.now();
    const events = ["pointerdown", "keydown", "touchstart", "wheel", "scroll", "input"] as const;
    events.forEach((e) => window.addEventListener(e, stillHere, { passive: true, capture: true }));
    const timer = setInterval(() => {
      const left = Math.ceil((IDLE_MS - (Date.now() - last.current)) / 1000);
      if (left <= 0) {
        setCountdown(null);
        onTimeout();
      } else if (left <= WARNING_S) {
        setCountdown((c) => {
          if (c == null && document.activeElement instanceof HTMLElement) document.activeElement.blur();
          return left;
        });
      }
    }, 500);
    return () => {
      events.forEach((e) => window.removeEventListener(e, stillHere, { capture: true }));
      clearInterval(timer);
      setCountdown(null);
    };
  }, [active, onTimeout, stillHere]);

  return (
    <AnimatePresence>
      {countdown != null && (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-coal/40 p-8 backdrop-blur-sm"
          onPointerDown={stillHere}
          role="alertdialog"
          aria-modal="true"
          aria-label="Still there?"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="paper glossy w-full max-w-md rounded-[2rem] p-10 text-center"
          >
            <p className="font-poster text-[7rem] leading-none text-brand tabular-nums">{countdown}</p>
            <h2 className="mt-2 font-poster text-5xl font-normal text-coal">Still there?</h2>
            <p className="mt-3 text-xl text-stone">We&rsquo;ll start over to keep your details private. Tap anywhere to carry on.</p>
            <TactileButton onClick={stillHere} className="mt-8">
              I&rsquo;m still here
            </TactileButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
