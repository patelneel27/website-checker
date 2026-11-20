"use client";

import { motion } from "motion/react";
import { createContext, useContext, useRef } from "react";

/** Lets a kiosk make every logo tap go "home" without threading a prop through each screen. */
export const LogoTapContext = createContext<(() => void) | null>(null);
import { MARK_HEIGHT, MARK_PATHS, MARK_VIEWBOX, MARK_WIDTH } from "@/lib/brand/mark";

export function StarMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={(size * MARK_WIDTH) / MARK_HEIGHT}
      height={size}
      viewBox={MARK_VIEWBOX}
      className={className}
      aria-hidden="true"
    >
      {MARK_PATHS.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

const LONG_PRESS_MS = 1500;

/**
 * Sterlixit logo: official star mark + wordmark, as on sterlixit.co.uk.
 * - `intro` (welcome screen): the star spins in and the name rises into place.
 * - Every screen: a soft blue shine sweeps across the name now and then, like the main button,
 *   and the star does one spin on hover.
 * A long press (1.5 s) opens staff mode; it gives no visual hint on purpose. A tap calls `onTap`.
 */
export function Logo({
  size = "md",
  tone = "dark",
  intro = false,
  onLongPress,
  onTap,
}: {
  size?: "md" | "lg";
  tone?: "dark" | "light";
  intro?: boolean;
  onLongPress?: () => void;
  /** A normal tap (e.g. back to the event home). */
  onTap?: () => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contextTap = useContext(LogoTapContext);
  onTap ??= contextTap ?? undefined;
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const mark = size === "lg" ? 64 : 40;

  return (
    <div
      className={`logo inline-flex select-none items-center gap-3 ${onTap ? "cursor-pointer" : ""}`}
      onPointerDown={() => {
        cancel();
        timer.current = setTimeout(() => {
          timer.current = null;
          onLongPress?.();
        }, LONG_PRESS_MS);
      }}
      onPointerUp={() => {
        // Released before the long press fired: that's a tap.
        const wasPending = timer.current != null;
        cancel();
        if (wasPending) onTap?.();
      }}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.span
        className="inline-flex"
        initial={intro ? { scale: 0, rotate: -160 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
      >
        <StarMark size={mark} className="logo-star" />
      </motion.span>
      <span className="inline-block overflow-hidden pb-[0.1em]">
        <motion.span
          className={`wordmark-shine block font-display font-extrabold tracking-tight ${tone === "light" ? "wordmark-light" : ""} ${
            size === "lg" ? "text-5xl" : "text-3xl"
          }`}
          initial={intro ? { y: "110%" } : false}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          Sterlixit
        </motion.span>
      </span>
    </div>
  );
}
