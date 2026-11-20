"use client";

import { motion } from "motion/react";

/**
 * Headline text whose letters rise into place one after another. Letters are grouped per word
 * so a narrow screen wraps between words, never in the middle of one.
 */
export function LetterRise({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  let i = 0;
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <span key={w} aria-hidden="true">
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch) => {
              const n = i++;
              return (
                <motion.span
                  key={n}
                  className="inline-block"
                  initial={{ opacity: 0, y: "0.5em", rotate: n % 2 ? 6 : -6 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: delay + n * 0.035 }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
          {w < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}
