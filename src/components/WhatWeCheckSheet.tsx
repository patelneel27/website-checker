"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CHECK_AREAS, FAQ } from "@/lib/what-we-check";
import { AreaIcon } from "./AreaIcon";
import { PillButton, TactileButton } from "./Buttons";

const IDLE_CLOSE_MS = 90_000;

/** Full explainer of every check plus FAQs, for visitors and for staff answering questions. */
export function WhatWeCheckSheet({ focus, onClose, onStart }: { focus?: string; onClose: () => void; onStart: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [current, setCurrent] = useState<string | null>(focus ?? null);

  const jump = (id: string, smooth = true) => {
    setCurrent(id);
    scroller.current?.querySelector<HTMLElement>(`[data-area="${id}"]`)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  };

  // Opened from a specific check: show it straight away, right under the titles.
  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => jump(focus, false), 60);
    return () => clearTimeout(t);
  }, [focus]);

  // Light up the title of the check being read.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setCurrent((visible.target as HTMLElement).dataset.area ?? null);
      },
      { root, rootMargin: "-120px 0px -55% 0px" },
    );
    root.querySelectorAll("[data-area]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Don't leave it open for the next visitor.
  useEffect(() => {
    let timer = setTimeout(onClose, IDLE_CLOSE_MS);
    const bump = () => {
      clearTimeout(timer);
      timer = setTimeout(onClose, IDLE_CLOSE_MS);
    };
    window.addEventListener("pointerdown", bump, { passive: true });
    const el = scroller.current;
    el?.addEventListener("scroll", bump, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", bump);
      el?.removeEventListener("scroll", bump);
    };
  }, [onClose]);

  return (
    <motion.div
      className="paper fixed inset-0 z-30 flex flex-col"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      role="dialog"
      aria-modal="true"
      aria-label="What we check"
    >
      <div className="flex items-center justify-between gap-4 px-8 pt-7 pb-4">
        <p className="eyebrow">What we check</p>
        <PillButton icon="close" onClick={onClose}>
          Close
        </PillButton>
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto px-8 pb-40">
        {/* Every check's title, always visible: tap one to jump straight to it. */}
        <nav className="paper sticky top-0 z-10 -mx-8 border-b border-black/5 px-8 py-3" aria-label="Jump to a check">
          <div className="flex flex-wrap gap-2">
            {CHECK_AREAS.map((a, i) => {
              const on = current === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-current={on ? "true" : undefined}
                  onClick={() => jump(a.id)}
                  className={`flex min-h-12 items-center gap-2 rounded-full py-1 pr-4 pl-1.5 text-base font-semibold transition active:scale-95 ${
                    on ? "bg-coal text-white shadow-[0_6px_14px_-6px_rgba(0,0,0,0.5)]" : "bg-white/80 text-coal shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  <AreaIcon icon={a.icon} size={34} />
                  <span className={`font-poster text-lg ${on ? "text-white/50" : "text-brand"}`}>0{i + 1}</span>
                  {a.title}
                </button>
              );
            })}
          </div>
        </nav>

        <h2 className="mt-8 font-poster text-[5rem] leading-[0.92] font-normal text-coal">
          Every check, <span className="text-brand">explained.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-xl leading-snug text-stone">
          Your free health check combines Google&rsquo;s own Lighthouse test with our SEO checks of your public homepage. Tap a title above
          to go straight to it.
        </p>

        <div className="mt-12 space-y-5">
          {CHECK_AREAS.map((area, i) => (
            <motion.article
              key={area.id}
              data-area={area.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2, root: scroller }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`scroll-mt-[13rem] rounded-[2rem] border bg-white/60 p-7 transition-colors ${
                area.id === focus ? "border-brand/40 bg-white shadow-[0_0_0_4px_rgba(19,98,251,0.12)]" : "border-black/5"
              }`}
            >
              <div className="flex items-center gap-5">
                <AreaIcon icon={area.icon} size={72} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-3xl font-extrabold tracking-tight text-coal">{area.title}</h3>
                  <p className="mt-1 text-lg text-stone">{area.short}</p>
                </div>
                <span className="font-poster text-6xl leading-none text-black/10 tabular-nums" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <dl className="mt-7 grid gap-6 md:grid-cols-[1fr_1fr_0.9fr]">
                <div>
                  <dt className="text-sm font-bold tracking-[0.12em] text-brand uppercase">What we look at</dt>
                  <dd className="mt-2 text-lg leading-snug text-coal">{area.what}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold tracking-[0.12em] text-brand uppercase">Why it matters</dt>
                  <dd className="mt-2 text-lg leading-snug text-coal">{area.why}</dd>
                </div>
                <div className="rounded-2xl bg-[#E7F8EE] p-5">
                  <dt className="flex items-center gap-2 text-sm font-bold tracking-[0.12em] text-good-text uppercase">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                    Good looks like
                  </dt>
                  <dd className="mt-2 text-lg leading-snug text-coal">{area.good}</dd>
                </div>
              </dl>
            </motion.article>
          ))}
        </div>

        {/* FAQ as an accordion, so staff can find an answer fast. */}
        <h2 className="mt-20 font-poster text-7xl leading-none font-normal text-coal">
          Questions <span className="text-brand">people ask</span>
        </h2>
        <div className="mt-8 border-t-2 border-coal">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className="border-b border-black/10">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex min-h-20 w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-xl font-bold text-coal">{item.q}</span>
                  <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl leading-none transition-colors ${
                      open ? "bg-brand text-white" : "bg-white text-coal shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-3xl pb-6 text-lg leading-snug text-stone">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="paper-bar">
        <TactileButton onClick={onStart} className="mx-auto max-w-[34rem]">
          Check my website
        </TactileButton>
      </div>
    </motion.div>
  );
}
