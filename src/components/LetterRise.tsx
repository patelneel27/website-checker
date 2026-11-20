"use client";

import { motion } from "motion/react";

/** Headline text whose letters rise into place one after another. */
export function LetterRise({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.5em", rotate: i % 2 ? 6 : -6 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: delay + i * 0.035 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
