"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckBadge, TactileButton } from "./Buttons";
import { FeatureIcon, type FeatureIconId } from "./staffmain/FeatureIcon";

// A "Home view"-style live display (think Apple Home on an iPad): rounded tiles that update by
// themselves, plus a toast for each change. Used to introduce the LetFlows and StaffMain live
// displays. The real product refreshes every minute; this demo speeds it up so visitors see it.

export type LiveTile = { id: string; icon: FeatureIconId; label: string; value: string; sub: string; on: boolean };
export type LiveEvent = { tile: string; value: string; sub: string; on: boolean; toast: string };

const STEP_MS = 2600;

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client clock
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function LiveScreen({ greeting, place, tiles, events, wallpaper }: { greeting: string; place: string; tiles: LiveTile[]; events: LiveEvent[]; wallpaper: string }) {
  const [state, setState] = useState(tiles);
  const [step, setStep] = useState(-1);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const now = useClock();

  useEffect(() => {
    const t = setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (step < 0) return;
    const e = events[step % events.length];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- apply the next simulated update
    setState((tiles) => tiles.map((t) => (t.id === e.tile ? { ...t, value: e.value, sub: e.sub, on: e.on } : t)));
    setToast({ id: step, text: e.toast });
  }, [step, events]);

  const changed = step >= 0 ? events[step % events.length].tile : null;

  return (
    <div className={`relative overflow-hidden rounded-[1.6rem] p-5 text-white sm:p-6 ${wallpaper}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white/60">{place}</p>
          <p className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{greeting}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">
            {now ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "09:41"}
          </p>
          <p className="flex items-center justify-end gap-1.5 text-xs font-bold tracking-[0.12em] text-[#5CE58F] uppercase">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#5CE58F]" /> Live
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {state.map((t) => (
          <motion.div
            key={t.id}
            layout
            animate={
              t.id === changed
                ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0 0 rgba(255,255,255,0)", "0 0 0 4px rgba(255,255,255,0.35)", "0 0 0 0 rgba(255,255,255,0)"] }
                : { scale: 1 }
            }
            transition={{ duration: 0.7 }}
            className={`flex min-h-[7.5rem] flex-col justify-between rounded-[1.2rem] p-3.5 transition-colors duration-500 ${
              t.on ? "bg-white/95 text-coal" : "bg-white/12 text-white backdrop-blur-md"
            }`}
          >
            <FeatureIcon icon={t.icon} size={38} />
            <div className="mt-2 leading-tight">
              <p className={`text-[13px] font-semibold ${t.on ? "text-stone" : "text-white/65"}`}>{t.label}</p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={t.value}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  className="text-lg font-extrabold tabular-nums"
                >
                  {t.value}
                </motion.p>
              </AnimatePresence>
              <p className={`truncate text-[12px] ${t.on ? "text-stone" : "text-white/55"}`}>{t.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-5 bottom-5 flex justify-center sm:inset-x-6">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="flex items-center gap-2.5 rounded-full bg-black/70 py-2 pr-4 pl-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
            >
              <CheckBadge size="sm" />
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="h-12" aria-hidden="true" />
    </div>
  );
}

/** "Coming soon" section introducing a product's live display, with the animated screen. */
export function LiveDisplaySection({
  href,
  product,
  title,
  text,
  points,
  greeting,
  place,
  tiles,
  events,
  wallpaper,
}: {
  /** The product's Live page, for the "take the tour" button. */
  href: string;
  product: string;
  title: [string, string];
  text: string;
  points: string[];
  greeting: string;
  place: string;
  tiles: LiveTile[];
  events: LiveEvent[];
  wallpaper: string;
}) {
  return (
    <section id="live" className="mx-auto max-w-[47rem] scroll-mt-6 border-t border-black/10 pt-12 pb-16">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-coal px-3.5 py-1.5 text-sm font-extrabold tracking-[0.12em] text-white uppercase">Coming soon</span>
        <span className="rounded-full bg-brand/12 px-3.5 py-1.5 text-sm font-bold text-brand">Only for {product} customers</span>
      </div>
      <h2 className="mt-5 font-poster text-[clamp(3.5rem,11vw,5.5rem)] leading-[0.92] font-normal text-coal">
        {title[0]} <span className="text-brand">{title[1]}</span>
      </h2>
      <p className="mt-4 max-w-2xl text-xl leading-snug text-stone">{text}</p>

      <motion.div
        className="mt-8 rounded-[2.2rem] bg-gradient-to-b from-[#2B2F3B] to-[#0F1119] p-2.5 shadow-[0_40px_60px_-30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]"
        initial={{ opacity: 0, y: 40, rotateX: 12 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{ transformPerspective: 1200 }}
        aria-label={`${product} live display preview`}
        role="img"
      >
        <LiveScreen greeting={greeting} place={place} tiles={tiles} events={events} wallpaper={wallpaper} />
      </motion.div>

      <ul className="mt-7 grid gap-3 sm:grid-cols-3">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-3 text-lg font-semibold text-coal">
            <CheckBadge size="sm" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-8 max-w-[34rem]">
        <TactileButton href={href} newTab={false}>
          Take the tour of {product} Live
        </TactileButton>
      </div>
    </section>
  );
}

/** Small chip under a hero's main button that opens the product's Live page. */
export function LiveJump({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="mx-auto mt-5 flex min-h-12 w-fit items-center gap-2.5 rounded-full bg-white/70 py-1.5 pr-4 pl-1.5 text-base font-bold text-coal shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition active:scale-95"
    >
      <span className="flex h-8 items-center gap-1.5 rounded-full bg-coal px-3 text-xs font-extrabold tracking-[0.12em] text-white uppercase">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#5CE58F]" /> New
      </span>
      {label}
      <motion.span aria-hidden="true" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
        →
      </motion.span>
    </Link>
  );
}
