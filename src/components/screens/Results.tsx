"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { CATEGORY_LABELS, CATEGORY_MEANINGS, CATEGORY_ORDER } from "@/lib/scores";
import type { ScanResult } from "@/lib/types";
import { CheckBadge, PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";
import { ScoreRing } from "../ScoreRing";
import { SeoGlance } from "../SeoGlance";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Results({
  result,
  onContinue,
  onRestart,
  onLongPressLogo,
}: {
  result: ScanResult;
  onContinue: () => void;
  onRestart: () => void;
  onLongPressLogo: () => void;
}) {
  const site = result.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const pending = result.psiStatus === "pending";
  const psiFailed = result.psiStatus === "failed" && !result.scores;
  const showRings = !psiFailed;
  const [shownAt] = useState(() => Date.now());
  const ageMs = shownAt - new Date(result.scannedAt).getTime();
  const checkedEarlier =
    result.cached && ageMs > 60_000
      ? `Checked earlier at ${new Date(result.scannedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}, so here are the saved results.`
      : null;
  const passed = result.checks.filter((c) => c.pass).length;

  return (
    <div className="paper flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-40">
        <header className="flex items-center justify-between gap-4 px-6 pt-7 sm:px-8 sm:pt-9">
          <Logo onLongPress={onLongPressLogo} />
          <PillButton icon="restart" onClick={onRestart}>
            Start again
          </PillButton>
        </header>

        {/* Site + summary */}
        <section className="px-6 pt-10 sm:px-8 sm:pt-12">
          <p className="eyebrow">Step 2 of 3 · Your results</p>
          <motion.div
            className="mt-6 flex items-center gap-4 sm:gap-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="glossy flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.4rem] bg-gradient-to-b from-white to-[#F3F4F7]">
              {result.site.favicon ? (
                // eslint-disable-next-line @next/next/no-img-element -- small data URI
                <img src={result.site.favicon} alt="" className="h-10 w-10 object-contain" />
              ) : (
                <span className="font-poster text-4xl text-brand">{site.replace(/^www\./, "").charAt(0).toUpperCase()}</span>
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xl font-bold text-coal sm:text-2xl">{result.site.title ?? site}</p>
              <p className="truncate text-lg font-semibold text-brand">{site}</p>
            </div>
          </motion.div>

          <motion.h1
            className="mt-8 font-poster text-[clamp(2.75rem,12vw,5.75rem)] leading-[0.95] font-normal text-coal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            {result.summary}
          </motion.h1>
          {checkedEarlier && <p className="mt-6 text-base text-stone">{checkedEarlier}</p>}
          {pending && (
            <p className="mt-5 flex items-center gap-3 text-base font-semibold text-coal sm:text-lg">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-brand" />
              </span>
              Google&rsquo;s speed test is taking a little longer. We&rsquo;ll email your full speed report shortly.
            </p>
          )}
        </section>

        {/* Scores as glossy tiles, the same family as the welcome screen's objects */}
        {showRings && (
          <section className="mt-10 grid grid-cols-2 gap-3 px-6 sm:grid-cols-4 sm:gap-4 sm:px-8" aria-label="Scores">
            {CATEGORY_ORDER.map((k, i) => (
              <motion.div
                key={k}
                className="glossy rounded-[1.8rem] bg-gradient-to-b from-white to-[#F5F6F8] px-2 pt-5 pb-4 sm:px-3 sm:pt-6 sm:pb-5"
                initial={{ opacity: 0, y: 40, scale: 0.9, rotate: i % 2 ? 4 : -4 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.25 + i * 0.1 }}
              >
                <ScoreRing
                  label={CATEGORY_LABELS[k]}
                  meaning={CATEGORY_MEANINGS[k]}
                  score={result.scores?.[k] ?? null}
                  pending={pending}
                  delay={0.4 + 0.15 * i}
                />
              </motion.div>
            ))}
          </section>
        )}

        {/* Quick wins */}
        {result.quickWins.length > 0 && (
          <section className="px-6 pt-14 sm:px-8 sm:pt-16">
            <p className="eyebrow">Quick wins</p>
            <h2 className="mt-3 font-poster text-5xl leading-none font-normal text-coal sm:text-6xl">
              {result.quickWins.length === 1 ? "The one thing" : `${result.quickWins.length === 3 ? "Three" : "Two"} things`}{" "}
              <span className="text-brand">to fix first</span>
            </h2>
            <ol className="mt-8 border-t-2 border-coal">
              {result.quickWins.map((w, i) => (
                <motion.li
                  key={w.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.15, ease: EASE }}
                  className="grid grid-cols-[3.5rem_1fr] items-start border-b border-black/10 py-6 sm:grid-cols-[5.5rem_1fr] sm:py-7"
                >
                  <span className="font-poster text-5xl leading-[0.85] text-brand tabular-nums sm:text-6xl">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-xl leading-snug font-bold text-coal sm:text-2xl">{w.title}</p>
                    {w.fix && <p className="mt-1.5 text-base leading-snug text-stone sm:text-lg">{w.fix}</p>}
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>
        )}

        {result.seo && <SeoGlance seo={result.seo} site={result.site} url={result.url} />}

        {/* Quick checks */}
        {result.checks.length > 0 && (
          <section className="px-6 pt-14 sm:px-8 sm:pt-16">
            <p className="eyebrow">Quick checks</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <h2 className="font-poster text-5xl leading-none font-normal text-coal sm:text-6xl">
                {passed} of {result.checks.length} <span className="text-good-text">passed</span>
              </h2>
              <div className="h-3 w-full overflow-hidden rounded-full sm:mb-2 sm:w-48 bg-tray shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#4BE07F] to-[#17A94A]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(passed / result.checks.length) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE }}
                />
              </div>
            </div>
            <ul className="mt-8 grid border-t-2 border-coal sm:grid-cols-2 sm:gap-x-10">
              {result.checks.map((c) => (
                <li key={c.id} className="flex items-start gap-3 border-b border-black/10 py-4">
                  <span className="mt-0.5" aria-label={c.pass ? "Pass" : "Could improve"}>
                    <CheckBadge pass={c.pass} size="sm" />
                  </span>
                  <span className="text-base leading-snug text-coal sm:text-lg">{c.message}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="px-6 pt-10 text-base text-stone sm:px-8">
          Scores out of 100 from Google&rsquo;s Lighthouse mobile test. 90+ is good, 50–89 needs improvement, under 50 is poor.
        </p>
      </div>

      <div className="paper-bar">
        <div className="mx-auto flex max-w-3xl items-center gap-6">
          <p className="hidden max-w-[13rem] text-base leading-snug text-stone sm:block">
            Get every detail, plus how to fix it, <strong className="text-coal">free</strong>.
          </p>
          <TactileButton onClick={onContinue} className="flex-1">
            Email me the full report
          </TactileButton>
        </div>
      </div>
    </div>
  );
}
