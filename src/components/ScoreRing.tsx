"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { BAND_COLOURS, BAND_LABELS, bandFor } from "@/lib/scores";

const SIZE = 136;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function ScoreRing({
  label,
  meaning,
  score,
  pending,
  delay = 0,
}: {
  label: string;
  meaning: string;
  score: number | null;
  pending?: boolean;
  delay?: number;
}) {
  const progress = useMotionValue(0);
  const display = useTransform(progress, (v) => Math.round(v));
  const dashOffset = useTransform(progress, (v) => C * (1 - v / 100));

  useEffect(() => {
    if (score == null) return;
    const controls = animate(progress, score, { duration: 1.3, delay, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [score, delay, progress]);

  const band = score == null ? null : bandFor(score);
  const colours = band ? BAND_COLOURS[band] : null;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative max-sm:[zoom:0.82]" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#ECEEF2" strokeWidth={STROKE} />
          {colours && (
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={colours.ring}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ strokeDashoffset: dashOffset }}
            />
          )}
        </svg>
        {pending && (
          <motion.svg
            width={SIZE}
            height={SIZE}
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="#5C9BFF"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${C * 0.22} ${C}`}
            />
          </motion.svg>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          {colours ? (
            <motion.span className="display text-5xl tabular-nums" style={{ color: colours.text }}>
              {display}
            </motion.span>
          ) : (
            <span className="font-display text-lg font-bold text-stone/60">{pending ? "Measuring…" : "–"}</span>
          )}
        </div>
      </div>
      <p className="mt-3 font-display text-lg leading-tight font-bold text-coal sm:mt-4 sm:text-xl">{label}</p>
      <p className="mt-0.5 text-sm font-semibold sm:text-base" style={{ color: colours?.text ?? "#6B7596" }}>
        {band ? BAND_LABELS[band] : pending ? "Results on the way" : "Not measured"}
      </p>
      <p className="mt-1 max-w-[15rem] text-sm leading-snug text-stone sm:text-base">{meaning}</p>
    </div>
  );
}
