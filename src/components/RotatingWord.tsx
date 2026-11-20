"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** A headline word that flips through a list, letters dropping in like a departures board. */
export function RotatingWord({ words, every = 2.2, className = "" }: { words: readonly string[]; every?: number; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % words.length), every * 1000);
    return () => clearInterval(t);
  }, [words.length, every]);
  const word = words[i];

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{words.join(", ")}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={word} aria-hidden="true" className="inline-block whitespace-pre">
          {[...word].map((ch, k) => (
            <motion.span
              key={k}
              className="inline-block"
              initial={{ y: "-0.6em", opacity: 0, rotateX: 90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: "0.5em", opacity: 0, rotateX: -90, transition: { duration: 0.18, delay: k * 0.012 } }}
              transition={{ type: "spring", stiffness: 420, damping: 24, delay: k * 0.03 }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
