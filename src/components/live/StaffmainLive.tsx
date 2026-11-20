"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CheckBadge } from "../Buttons";
import { FeatureIcon, type FeatureIconId } from "../staffmain/FeatureIcon";
import { LivePage } from "./LivePage";

// StaffMain Live: the team display's screens, one per story step.

const PEOPLE = [
  ["AK", 150, "Amira"],
  ["TF", 210, "Tom"],
  ["PS", 330, "Priya"],
  ["DM", 30, "Dan"],
  ["EB", 270, "Ella"],
  ["SO", 190, "Sam"],
  ["LJ", 100, "Lily"],
  ["RN", 0, "Raj"],
] as const;

const Avatar = ({ i, h, size = 34, dim }: { i: string; h: number; size?: number; dim?: boolean }) => (
  <span
    className="flex shrink-0 items-center justify-center rounded-full font-bold text-white transition-opacity"
    style={{ width: size, height: size, fontSize: size * 0.34, background: `hsl(${h} 60% 52%)`, opacity: dim ? 0.3 : 1 }}
  >
    {i}
  </span>
);

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
      <Tile icon="attendance" label="London office" value="13 / 14 in" on i={0} />
      <Tile icon="attendance" label="Manchester" value="9 / 9 in" on i={1} />
      <Tile icon="rota" label="On a break" value="2" i={2} />
      <Tile icon="leave" label="Off today" value="Priya" i={3} />
      <Tile icon="records" label="Late today" value="1" i={4} />
      <Tile icon="rtw" label="Right to work" value="All valid" on i={5} />
    </div>
  );
}

function WhosInScreen() {
  const [n, setN] = useState(4);
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x >= PEOPLE.length ? 4 : x + 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid h-full grid-cols-[1fr_1.3fr] gap-4">
      <div className="flex flex-col justify-between rounded-[1.2rem] bg-white/10 p-4 backdrop-blur">
        <p className="text-sm font-semibold text-white/60">London office · now</p>
        <p className="font-display text-6xl leading-none font-extrabold tabular-nums">
          {n}
          <span className="text-3xl text-white/50"> / 8 in</span>
        </p>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
          <motion.div className="h-full rounded-full bg-[#5CE58F]" animate={{ width: `${(n / 8) * 100}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-4 content-center gap-3 rounded-[1.2rem] bg-white/95 p-4">
        {PEOPLE.map(([i, h, name], k) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="relative">
              <Avatar i={i} h={h} size={42} dim={k >= n} />
              <AnimatePresence>
                {k < n && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#17A94A]" />
                )}
              </AnimatePresence>
            </div>
            <span className={`text-[11px] font-semibold ${k < n ? "text-coal" : "text-stone/50"}`}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TapScreen() {
  const feed = [
    ["AK", 150, "Amira Khan", "NFC", "08:59"],
    ["TF", 210, "Tom Fielding", "QR", "09:01"],
    ["PS", 330, "Priya Shah", "Location", "09:03"],
    ["DM", 30, "Dan Morris", "NFC", "09:06"],
  ] as const;
  const [k, setK] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setK((x) => (x >= feed.length ? 1 : x + 1)), 1300);
    return () => clearInterval(t);
  }, [feed.length]);
  return (
    <div className="grid h-full grid-cols-[0.8fr_1.4fr] gap-4">
      <div className="relative flex flex-col items-center justify-center rounded-[1.2rem] bg-white/10 backdrop-blur">
        <div className="relative flex h-24 w-24 items-center justify-center">
          {[0, 1, 2].map((r) => (
            <motion.span
              key={`${k}-${r}`}
              className="absolute inset-0 rounded-full border-2 border-[#5CE58F]"
              initial={{ scale: 0.5, opacity: 0.9 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 1.1, delay: r * 0.2 }}
            />
          ))}
          <svg viewBox="0 0 24 24" className="h-14 w-14 text-[#5CE58F]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a8.5 8.5 0 0 1 0 12M13 3.5a12 12 0 0 1 0 17" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-bold">Front door point</p>
        <p className="text-xs text-white/60">NFC · QR · location</p>
      </div>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {feed
            .slice(0, k)
            .reverse()
            .map(([i, h, name, how, at], idx) => (
              <motion.li
                key={name}
                layout
                initial={{ opacity: 0, x: -40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1, backgroundColor: idx === 0 ? "#FFFFFF" : "rgba(255,255,255,0.88)" }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-coal"
              >
                <Avatar i={i} h={h} size={30} />
                <span className="flex-1 text-sm font-bold">{name}</span>
                <span className="rounded-full bg-[#EAF1FF] px-2 py-0.5 text-[11px] font-bold text-brand">{how}</span>
                <span className="text-sm font-extrabold tabular-nums">{at}</span>
              </motion.li>
            ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function BreaksScreen() {
  return (
    <div className="grid h-full grid-cols-2 gap-4">
      {[
        ["EB", 270, "Ella Brooks", "Lunch", 0.65, "Back 13:30"],
        ["SO", 190, "Sam Okoro", "Short break", 0.3, "Back 11:15"],
      ].map(([i, h, name, kind, p, back], k) => (
        <motion.div
          key={name as string}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: k * 0.2 }}
          className="flex flex-col items-center justify-center rounded-[1.2rem] bg-white/95 p-4 text-coal"
        >
          <div className="relative h-28 w-28">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#ECEEF2" strokeWidth="9" />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#1362FB"
                strokeWidth="9"
                strokeLinecap="round"
                pathLength={1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: p as number }}
                transition={{ duration: 1.4, delay: 0.3 + k * 0.2 }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center">
              <Avatar i={i as string} h={h as number} size={52} />
            </span>
          </div>
          <p className="mt-2 text-base font-extrabold">{name}</p>
          <p className="text-sm text-stone">
            {kind} · {back}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function LeaveScreen() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid flex-1 grid-cols-5 gap-2">
        {days.map((d, i) => (
          <motion.div
            key={d}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex flex-col gap-1.5 rounded-[1rem] p-2.5 ${i === 2 ? "bg-white text-coal" : "bg-white/12"}`}
          >
            <p className={`text-xs font-bold ${i === 2 ? "text-brand" : "text-white/60"}`}>{i === 2 ? "Today" : d}</p>
            {(i === 1 || i === 2 || i === 3) && <span className="rounded-md bg-[#FFC93C] px-1.5 py-1 text-[11px] font-bold text-coal">Priya</span>}
            {(i === 2 || i === 4) && <span className="rounded-md bg-[#9DB5FF] px-1.5 py-1 text-[11px] font-bold text-coal">Ella</span>}
            {i === 4 && <span className="rounded-md bg-[#FF8BB0] px-1.5 py-1 text-[11px] font-bold text-coal">Bank hol.</span>}
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-3 rounded-xl bg-white/95 px-3 py-2.5 text-coal"
      >
        <CheckBadge size="sm" />
        <span className="text-sm font-bold">Ella&rsquo;s holiday approved · 2 days · 18 left this year</span>
      </motion.div>
    </div>
  );
}

function AlertsScreen() {
  return (
    <div className="flex h-full flex-col gap-3">
      {[
        ["records", "Not clocked in yet", "Dan Morris · rota started 09:00 · manager notified", "#C4140A"],
        ["rtw", "Right to work check due", "Sam Okoro · visa expires in 30 days", "#A35400"],
        ["attendance", "Missed clock-out yesterday", "Lily James · fixed by her manager", "#067A3E"],
      ].map(([icon, title, text, colour], i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.35, type: "spring", stiffness: 240, damping: 22 }}
          className="flex items-center gap-3 rounded-[1.1rem] bg-white/95 p-3 text-coal"
        >
          <FeatureIcon icon={icon as FeatureIconId} size={40} />
          <div className="leading-tight">
            <p className="text-base font-extrabold" style={{ color: colour }}>
              {title}
            </p>
            <p className="text-sm text-stone">{text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const SCREENS: Record<string, React.ComponentType> = {
  hero: HeroScreen,
  whosin: WhosInScreen,
  tap: TapScreen,
  breaks: BreaksScreen,
  leave: LeaveScreen,
  alerts: AlertsScreen,
};

export function StaffmainLive() {
  return (
    <LivePage
      product="StaffMain"
      productPath="/staffmain"
      tone="blue"
      wallpaper="bg-gradient-to-br from-[#13265E] via-[#141B3A] to-[#0F1119]"
      place="Your team · 3 sites"
      hero={{
        title: "Your team,",
        word: "live.",
        text: "StaffMain Live turns any screen into a live board of your people: who's in, who's on a break and who's off, updating itself every minute.",
      }}
      steps={[
        { id: "whosin", eyebrow: "Who's in", title: "See the office fill up.", text: "As people arrive, their faces light up on the board and the count for each site ticks up." },
        { id: "tap", eyebrow: "Clock-ins", title: "Every tap, the second it happens.", text: "NFC taps, QR scans and location clock-ins land on the screen straight away, with the time and how they clocked in." },
        { id: "breaks", eyebrow: "Breaks", title: "Breaks, without the guesswork.", text: "Who's on a break, for how long, and when they're due back." },
        { id: "leave", eyebrow: "Leave", title: "Who's off this week.", text: "Holidays, sick days and bank holidays on one strip, with approvals as they happen." },
        { id: "alerts", eyebrow: "Alerts", title: "Problems, before they're problems.", text: "Late or missing clock-ins and right-to-work checks that are coming due, flagged for the right manager." },
      ]}
      screen={(id) => {
        const Screen = SCREENS[id] ?? HeroScreen;
        return <Screen />;
      }}
      devices={[
        { name: "Office TV or monitor", text: "A live board on the wall by reception." },
        { name: "iPad on the desk", text: "For the manager on shift, always up to date." },
        { name: "Your phone", text: "Check who's in from anywhere." },
        { name: "Any browser", text: "Nothing to install. If it has a browser, it works." },
      ]}
      setup={[
        { title: "Sign in to StaffMain", text: "Go to Settings and switch on Live." },
        { title: "Open the display link", text: "On your TV, iPad or phone." },
        { title: "Watch your team", text: "It updates every minute, by itself." },
      ]}
      cta={{
        title: "Want it first?",
        text: "StaffMain Live is coming soon for StaffMain customers. Book a demo and we'll show you the preview.",
        button: "Book a StaffMain demo",
      }}
    />
  );
}
