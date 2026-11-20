"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { CheckBadge } from "../Buttons";
import { FeatureIcon, type FeatureIconId } from "../staffmain/FeatureIcon";
import { LivePage } from "./LivePage";

// LetFlows Live: the property display's screens, one per story step.

function CountUp({ from, to, prefix = "", duration = 2.2 }: { from: number; to: number; prefix?: string; duration?: number }) {
  const v = useMotionValue(from);
  const text = useTransform(v, (n) => `${prefix}${Math.round(n).toLocaleString("en-GB")}`);
  useEffect(() => {
    const c = animate(v, to, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [v, to, duration]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

const Tile = ({ icon, label, value, on, i = 0 }: { icon: FeatureIconId; label: string; value: string; on?: boolean; i?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08 * i }}
    className={`flex flex-col justify-between rounded-[1.1rem] p-3 ${on ? "bg-white/95 text-coal" : "bg-white/12 text-white backdrop-blur"}`}
  >
    <FeatureIcon icon={icon} size={34} />
    <div className="mt-2 leading-tight">
      <p className={`text-[12px] font-semibold ${on ? "text-stone" : "text-white/60"}`}>{label}</p>
      <p className="text-base font-extrabold">{value}</p>
    </div>
  </motion.div>
);

function HeroScreen() {
  return (
    <div className="grid h-full grid-cols-3 grid-rows-2 gap-3">
      <Tile icon="rent" label="Rent this month" value="£19,075" on i={0} />
      <Tile icon="maintenance" label="Repairs" value="2 open" i={1} />
      <Tile icon="compliance" label="Certificates" value="All valid" on i={2} />
      <Tile icon="listings" label="Listings" value="2 live" on i={3} />
      <Tile icon="tenancies" label="Renewals" value="1 this month" i={4} />
      <Tile icon="mtd" label="Tax (MTD)" value="Q2 ready" i={5} />
    </div>
  );
}

function RentScreen() {
  const rows = [
    ["Flat 1 · R. Clarke", "£1,150"],
    ["7 Mill Lane · S. Ahmed", "£1,420"],
    ["22 Quay St · L. Brown", "£890"],
  ];
  return (
    <div className="grid h-full grid-cols-[1.1fr_1fr] gap-4">
      <div className="flex flex-col justify-between rounded-[1.2rem] bg-white/10 p-4 backdrop-blur">
        <p className="text-sm font-semibold text-white/60">Collected in December</p>
        <p className="font-serif text-6xl leading-none font-semibold">
          <CountUp from={16200} to={19075} prefix="£" />
        </p>
        <div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
            <motion.div className="h-full rounded-full bg-[#5CE58F]" initial={{ width: "82%" }} animate={{ width: "97%" }} transition={{ duration: 2.2 }} />
          </div>
          <p className="mt-2 text-sm text-white/60">of £19,600 due · 97%</p>
        </div>
      </div>
      <ul className="space-y-2">
        {rows.map(([who, amt], i) => (
          <motion.li
            key={who}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.5, type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-center justify-between rounded-xl bg-white/95 px-3 py-2.5 text-coal"
          >
            <span className="text-sm font-semibold">{who}</span>
            <span className="flex items-center gap-2 text-sm font-extrabold">
              {amt}
              <span className="rounded-full bg-[#E7F8EE] px-2 py-0.5 text-[11px] text-good-text">Paid</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function RepairScreen() {
  const bids = [
    ["Northside Plumbing", "£240", "4.9"],
    ["Swift Heating", "£265", "4.7"],
  ];
  return (
    <div className="relative grid h-full grid-cols-3 grid-rows-2 gap-3">
      {["rent", "compliance", "listings", "tenancies", "mtd", "dashboard"].map((ic, i) => (
        <div key={ic} className="rounded-[1.1rem] bg-white/8" style={{ opacity: 0.5 - i * 0.04 }} />
      ))}
      <motion.div
        className="absolute inset-x-6 top-1 rounded-[1.4rem] bg-white p-4 text-coal shadow-2xl"
        initial={{ y: 60, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
      >
        <div className="flex items-center gap-3">
          <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <FeatureIcon icon="maintenance" size={44} />
          </motion.span>
          <div className="flex-1 leading-tight">
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#C4431E] uppercase">New repair · just now</p>
            <p className="text-lg font-extrabold">Boiler leaking · Flat 2</p>
            <p className="text-sm text-stone">Reported by A. Patel, with 2 photos</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {bids.map(([n, p, r], i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.7 }}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${i === 0 ? "border-2 border-good bg-[#E7F8EE]" : "bg-[#F3F4F6]"}`}
            >
              <span className="font-semibold">
                {n} <span className="text-stone">★ {r}</span>
              </span>
              <span className="font-serif text-lg font-semibold">{p}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CalendarScreen() {
  const marks: Record<number, "renew" | "cert" | "today"> = { 4: "cert", 11: "renew", 17: "today", 19: "cert", 26: "renew" };
  return (
    <div className="grid h-full grid-cols-[1.25fr_1fr] gap-4">
      <div className="rounded-[1.2rem] bg-white/10 p-3 backdrop-blur">
        <p className="text-sm font-bold">December</p>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px]">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d, i) => {
            const m = marks[d];
            return (
              <motion.span
                key={d}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.015 }}
                className={`flex h-6 items-center justify-center rounded-md font-semibold ${
                  m === "today" ? "bg-white text-coal" : m === "cert" ? "bg-[#FFC93C] text-coal" : m === "renew" ? "bg-[#E4572E]" : "text-white/70"
                }`}
              >
                {d}
              </motion.span>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        {[
          ["cert", "Gas Safety · 14 Albert Tce", "in 2 days · engineer booked"],
          ["renew", "Tenancy renewal · Flat 3", "in 9 days · offer sent"],
          ["cert", "EICR · 7 Mill Lane", "in 2 weeks · reminder sent"],
        ].map(([k, t, s], i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.25 }}
            className="rounded-xl bg-white/95 px-3 py-2 text-coal"
          >
            <p className="flex items-center gap-2 text-sm font-extrabold">
              <span className={`h-2.5 w-2.5 rounded-full ${k === "cert" ? "bg-[#F5B400]" : "bg-[#E4572E]"}`} />
              {t}
            </p>
            <p className="text-xs text-stone">{s}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TaxScreen() {
  const bars = [44, 62, 54, 72, 66, 90];
  return (
    <div className="grid h-full grid-cols-[1.3fr_1fr] gap-4">
      <div className="flex flex-col rounded-[1.2rem] bg-white/10 p-4 backdrop-blur">
        <p className="text-xs font-bold tracking-[0.12em] text-white/60 uppercase">Q2 2026/27 · property income</p>
        <div className="mt-3 flex flex-1 items-end gap-2">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className={`flex-1 rounded-t-md ${i === bars.length - 1 ? "bg-[#5CE58F]" : "bg-[#9DB5FF]"}`}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 140, damping: 18 }}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-white/70">
          Profit <span className="font-serif text-lg font-semibold text-white">£45,270</span>
        </p>
      </div>
      <motion.div
        className="flex flex-col items-center justify-center rounded-[1.2rem] bg-white/95 p-4 text-center text-coal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <FeatureIcon icon="mtd" size={44} />
        <p className="mt-2 font-serif text-xl font-semibold">Making Tax Digital</p>
        <p className="text-sm text-stone">Quarterly update ready</p>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3, type: "spring" }} className="mt-3">
          <CheckBadge />
        </motion.span>
      </motion.div>
    </div>
  );
}

function SalesScreen() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s + 1) % 4), 1200);
    return () => clearInterval(t);
  }, []);
  const steps = ["Listed", "Viewings", "Offer", "Sold"];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#E4572E] px-3 py-1 text-xs font-extrabold tracking-[0.12em] uppercase">Coming next</span>
        <span className="text-sm font-semibold text-white/70">Buying and selling, in the same flow</span>
      </div>
      <motion.div
        className="flex items-center gap-4 rounded-[1.2rem] bg-white/95 p-4 text-coal"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <FeatureIcon icon="listings" size={46} />
        <div className="flex-1 leading-tight">
          <p className="text-xs font-extrabold tracking-[0.12em] text-[#C4431E] uppercase">Offer received</p>
          <p className="font-serif text-3xl font-semibold">£285,000</p>
          <p className="text-sm text-stone">3 Canal Wharf · 3 viewings this week</p>
        </div>
      </motion.div>
      <div className="mt-auto grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <div key={s} className={`rounded-xl px-2 py-2.5 text-center text-sm font-bold transition-colors duration-500 ${i <= stage ? "bg-[#5CE58F] text-coal" : "bg-white/12 text-white/60"}`}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREENS: Record<string, React.ComponentType> = {
  hero: HeroScreen,
  rent: RentScreen,
  repairs: RepairScreen,
  dates: CalendarScreen,
  tax: TaxScreen,
  sales: SalesScreen,
};

export function LetflowsLive() {
  return (
    <LivePage
      product="LetFlows"
      productPath="/letflows"
      themeClass="theme-letflows"
      tone="brick"
      wallpaper="bg-gradient-to-br from-[#3A1F18] via-[#1B1F2E] to-[#0F1A2E]"
      place="Your portfolio · 14 homes"
      hero={{
        title: "Your portfolio,",
        word: "live.",
        text: "LetFlows Live turns any screen into a window on every property you own or manage. It updates itself every minute, so you see what's happening without opening a thing.",
      }}
      steps={[
        { id: "rent", eyebrow: "Rent", title: "Rent, the moment it lands.", text: "The total ticks up as each Direct Debit clears, and every payment slides in with the property it came from." },
        { id: "repairs", eyebrow: "Repairs", title: "A leak can't hide.", text: "When a tenant reports a repair, it takes over the screen with their photos, and contractor bids appear as they arrive." },
        { id: "dates", eyebrow: "Dates", title: "Renewals and certificates, ahead of time.", text: "Gas safety, EICR and tenancy renewals sit on one calendar, with the next ones called out before they're due." },
        { id: "tax", eyebrow: "Tax", title: "Making Tax Digital, quietly ready.", text: "Income and costs build the quarterly update as you go, so it's ready long before HMRC needs it." },
        { id: "sales", eyebrow: "Coming next", title: "From renting to selling.", text: "Buying and selling join the same flow: listings, viewings and offers on the same screen as everything else." },
      ]}
      screen={(id) => {
        const Screen = SCREENS[id] ?? HeroScreen;
        return <Screen />;
      }}
      devices={[
        { name: "Office TV or monitor", text: "Open the display link full screen. Great for a busy office." },
        { name: "iPad on your desk", text: "A glanceable dashboard that never needs refreshing." },
        { name: "Your phone", text: "The same live view when you're out at a viewing." },
        { name: "Any browser", text: "Nothing to install. If it has a browser, it works." },
      ]}
      setup={[
        { title: "Sign in to LetFlows", text: "Go to Settings and switch on Live." },
        { title: "Open the display link", text: "On your TV, iPad or phone." },
        { title: "Watch it flow", text: "It updates every minute, by itself." },
      ]}
      cta={{
        title: "Want it first?",
        text: "LetFlows Live is coming soon for LetFlows customers. Book a demo and we'll show you the preview.",
        button: "Book a LetFlows demo",
      }}
    />
  );
}
