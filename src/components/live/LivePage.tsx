"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getHome, isKioskDevice } from "@/lib/kiosk-device";
import { CheckBadge, PillButton, TactileButton } from "../Buttons";
import { IdleGuard } from "../IdleGuard";
import { LetterRise } from "../LetterRise";
import { Logo, LogoTapContext } from "../Logo";
import { WaveWord, type WordTone } from "../PlayfulHero";

// A product's "coming soon" live-display page, told as a scroll story:
// 1 hero with the display floating · 2 pinned display that changes with each step as you scroll ·
// 3 the screens it runs on · 4 set up in three steps · 5 call to action.

export type LiveStory = { id: string; eyebrow: string; title: string; text: string };

export type LivePageProps = {
  product: string;
  /** e.g. "/letflows" (the "Back" button and the main CTA). */
  productPath: string;
  themeClass?: string;
  tone: WordTone;
  /** Wallpaper classes for the display. */
  wallpaper: string;
  hero: { title: string; word: string; text: string };
  place: string;
  steps: LiveStory[];
  /** Renders the display contents for a step (or "hero"). */
  screen: (step: string) => React.ReactNode;
  devices: { name: string; text: string }[];
  setup: { title: string; text: string }[];
  cta: { title: string; text: string; button: string };
};

function useClock() {
  const [now, setNow] = useState<string>("09:41");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const t = setInterval(tick, 15_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** The width the display's screens are drawn for. Narrower screens get a scaled-down copy. */
const DESIGN_W = 600;
const DESIGN_H = (DESIGN_W - 20) * (10 / 16) + 20;

/** The smart-display frame: dark bezel, live clock, the given contents. */
export function DisplayFrame({ place, wallpaper, children, compact = false }: { place: string; wallpaper: string; children: React.ReactNode; compact?: boolean }) {
  const now = useClock();
  const outer = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // On a phone the screens keep their tablet layout and shrink as one piece, like a device photo.
  const scale = width !== null && width < DESIGN_W ? width / DESIGN_W : 1;

  return (
    <div ref={outer} style={scale < 1 ? { height: DESIGN_H * scale } : undefined}>
      <div
        className="rounded-[2rem] bg-gradient-to-b from-[#2B2F3B] to-[#0F1119] p-2.5 shadow-[0_40px_60px_-30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]"
        style={scale < 1 ? { width: DESIGN_W, transform: `scale(${scale})`, transformOrigin: "top left" } : undefined}
      >
        <div className={`relative overflow-hidden rounded-[1.5rem] text-white ${wallpaper} ${compact ? "aspect-[16/10] p-4" : "aspect-[16/10] p-5"}`}>
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-white/60">{place}</p>
            <div className="text-right leading-none">
              <p className="font-display text-2xl font-extrabold tabular-nums">{now}</p>
              <p className="mt-1 flex items-center justify-end gap-1.5 text-[11px] font-bold tracking-[0.12em] text-[#5CE58F] uppercase">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#5CE58F]" /> Live
              </p>
            </div>
          </div>
          <div className="absolute inset-x-5 top-[4.6rem] bottom-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LivePage(p: LivePageProps) {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(p.steps[0].id);
  const [kiosk, setKiosk] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads device settings after mount
    setKiosk(isKioskDevice());
  }, []);

  const goHome = useCallback(() => router.push(getHome()), [router]);

  // Hero display tilts flat as you scroll into the page.
  const { scrollYProgress } = useScroll({ container: scroller, target: heroRef, offset: ["start start", "end start"] });
  const tilt = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // Which story step is in the reading zone.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.step!);
      },
      { root, rootMargin: "-55% 0px -30% 0px" },
    );
    root.querySelectorAll("[data-step]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const index = p.steps.findIndex((s) => s.id === active);

  return (
    <LogoTapContext.Provider value={goHome}>
      <main className={`paper flex h-dvh flex-col ${p.themeClass ?? ""}`}>
        <div ref={scroller} className="flex-1 overflow-y-auto">
          <header className="flex items-center justify-between gap-4 px-6 pt-8 sm:px-8 sm:pt-9">
            <Logo />
            <PillButton icon="back" onClick={() => router.push(p.productPath)}>
              {p.product}
            </PillButton>
          </header>

          {/* 1. Hero */}
          <section ref={heroRef} className="px-6 pt-10 sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-coal px-3.5 py-1.5 text-sm font-extrabold tracking-[0.12em] text-white uppercase">Coming soon</span>
              <span className="rounded-full bg-brand/12 px-3.5 py-1.5 text-sm font-bold text-brand">Only for {p.product} customers</span>
            </div>
            <h1 className="mt-5 font-poster text-[clamp(3.5rem,14vw,8rem)] leading-[0.9] font-normal text-coal">
              <LetterRise text={p.hero.title} />
              <br />
              <WaveWord text={p.hero.word} tone={p.tone} autoAt={1.2} repeatEvery={10} />
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-snug text-stone sm:text-2xl">{p.hero.text}</p>

            <motion.div
              className="mx-auto mt-10 max-w-[44rem]"
              style={{ rotateX: tilt, y: lift, transformPerspective: 1400 }}
              initial={{ opacity: 0, y: 60, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.3 }}
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                <DisplayFrame place={p.place} wallpaper={p.wallpaper}>
                  {p.screen("hero")}
                </DisplayFrame>
              </motion.div>
            </motion.div>
            <p className="mt-8 text-center text-base font-semibold text-stone">Scroll to see it in action ↓</p>
          </section>

          {/* 2. Scroll story: the display stays pinned while the steps scroll past */}
          <section className="relative mt-16">
            <div className="paper sticky top-0 z-10 px-6 pt-4 pb-5 shadow-[0_24px_24px_-8px_#ECECE9] sm:px-8">
              <div className="mx-auto max-w-[44rem]">
                <DisplayFrame place={p.place} wallpaper={p.wallpaper}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      className="h-full"
                      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                      transition={{ duration: 0.35 }}
                    >
                      {p.screen(active)}
                    </motion.div>
                  </AnimatePresence>
                </DisplayFrame>
                <div className="mt-4 flex items-center justify-center gap-2" aria-hidden="true">
                  {p.steps.map((s, i) => (
                    <motion.span
                      key={s.id}
                      className={`block h-2 rounded-full ${i === index ? "bg-brand" : i < index ? "bg-coal" : "bg-[#C9CAC6]"}`}
                      animate={{ width: i === index ? 32 : 8 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-[44rem] px-6 sm:px-8">
              {p.steps.map((s, i) => (
                <div key={s.id} data-step={s.id} className="flex min-h-[48vh] items-center py-8 sm:py-10">
                  <motion.div
                    animate={{ opacity: active === s.id ? 1 : 0.28, x: active === s.id ? 0 : -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="flex items-center gap-3">
                      <span className="font-poster text-4xl text-brand">0{i + 1}</span>
                      <span className="eyebrow">{s.eyebrow}</span>
                    </p>
                    <h2 className="mt-3 font-poster text-[clamp(2.5rem,8vw,4.25rem)] leading-[0.95] font-normal text-coal">{s.title}</h2>
                    <p className="mt-3 max-w-xl text-lg leading-snug text-stone sm:text-xl">{s.text}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Screens it runs on */}
          <section className="mx-auto max-w-[47rem] px-6 pt-16 sm:px-8">
            <p className="eyebrow">Works on what you already have</p>
            <h2 className="mt-3 font-poster text-[clamp(3rem,9vw,5rem)] leading-[0.92] font-normal text-coal">
              No new hardware. <span className="text-brand">Just a screen.</span>
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {p.devices.map((d, i) => (
                <motion.div
                  key={d.name}
                  className="glossy flex items-center gap-5 rounded-[1.8rem] bg-gradient-to-b from-white to-[#F5F6F8] p-5"
                  initial={{ opacity: 0, y: 36, rotate: i % 2 ? 1.5 : -1.5 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, amount: 0.4, root: scroller }}
                  transition={{ type: "spring", stiffness: 160, damping: 20, delay: (i % 2) * 0.1 }}
                >
                  <DeviceGlyph kind={i} wallpaper={p.wallpaper} />
                  <div>
                    <p className="font-display text-xl font-extrabold tracking-tight text-coal">{d.name}</p>
                    <p className="mt-1 text-base leading-snug text-stone">{d.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 4. Set-up */}
          <section className="mx-auto max-w-[47rem] px-6 pt-16 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Set up</p>
                <h2 className="mt-3 font-poster text-[clamp(3rem,9vw,5rem)] leading-[0.92] font-normal text-coal">
                  Live in <span className="text-brand">2 minutes.</span>
                </h2>
              </div>
            </div>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {p.setup.map((s, i) => (
                <motion.li
                  key={s.title}
                  className="rounded-[1.8rem] border border-black/5 bg-white/60 p-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5, root: scroller }}
                  transition={{ delay: i * 0.15, type: "spring", stiffness: 180, damping: 20 }}
                >
                  <span className="font-poster text-6xl leading-none text-brand">0{i + 1}</span>
                  <p className="mt-3 font-display text-xl font-extrabold tracking-tight text-coal">{s.title}</p>
                  <p className="mt-1 text-base leading-snug text-stone">{s.text}</p>
                </motion.li>
              ))}
            </ol>
          </section>

          {/* 5. Call to action */}
          <section className="mx-auto max-w-[47rem] px-6 pt-16 pb-20 text-center sm:px-8">
            <h2 className="font-poster text-[clamp(3rem,9vw,5rem)] leading-[0.92] font-normal text-coal">{p.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-xl leading-snug text-stone">{p.cta.text}</p>
            <ul className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-2">
              {["Coming soon", `Only for ${p.product} customers`, "Included in your plan"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-base font-semibold text-coal">
                  <CheckBadge size="sm" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mx-auto mt-8 max-w-[34rem]">
              <TactileButton onClick={() => router.push(p.productPath)}>{p.cta.button}</TactileButton>
            </div>
            <Link href={p.productPath} className="mt-4 inline-block text-base font-semibold text-stone underline underline-offset-4">
              Back to {p.product}
            </Link>
          </section>
        </div>

        <IdleGuard active={kiosk} onTimeout={goHome} />
      </main>
    </LogoTapContext.Provider>
  );
}

/** Tiny device outlines with a glowing screen: TV, iPad, phone, browser. */
function DeviceGlyph({ kind, wallpaper }: { kind: number; wallpaper: string }) {
  const screen = (cls: string) => (
    <span className={`block overflow-hidden ${cls} ${wallpaper}`}>
      <span className="grid h-full grid-cols-3 gap-[3px] p-[5px]">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={`rounded-[3px] ${i % 3 === 0 ? "bg-white/90" : "bg-white/20"}`} />
        ))}
      </span>
    </span>
  );
  if (kind === 0)
    return (
      <span className="flex w-24 shrink-0 flex-col items-center">
        <span className="rounded-md bg-[#15171D] p-1">{screen("h-12 w-[5.5rem] rounded-[3px]")}</span>
        <span className="h-2 w-1.5 bg-[#15171D]" />
        <span className="h-1.5 w-10 rounded-full bg-[#15171D]" />
      </span>
    );
  if (kind === 1) return <span className="w-24 shrink-0 rounded-xl bg-[#15171D] p-1.5">{screen("h-14 w-full rounded-md")}</span>;
  if (kind === 2)
    return (
      <span className="flex w-24 shrink-0 justify-center">
        <span className="rounded-[0.9rem] bg-[#15171D] p-1">{screen("h-[4.5rem] w-9 rounded-[0.6rem]")}</span>
      </span>
    );
  return (
    <span className="w-24 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white">
      <span className="flex gap-1 border-b border-black/5 px-1.5 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28C840]" />
      </span>
      {screen("h-11 w-full")}
    </span>
  );
}
