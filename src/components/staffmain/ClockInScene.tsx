"use client";

/* eslint-disable @next/next/no-img-element -- small local SVG */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CheckBadge } from "../Buttons";
import { ScaledStage } from "../ScaledStage";

// "Tap. Clocked in. Stored." A phone taps the StaffMain point by the door (NFC), the phone
// confirms, a pulse travels to the attendance record, and a new row lands at the top of the list.

const PEOPLE = [
  { name: "Amira Khan", initials: "AK", hue: 150, time: "08:59", method: "NFC", site: "London office" },
  { name: "Tom Fielding", initials: "TF", hue: 210, time: "09:01", method: "QR", site: "London office" },
  { name: "Priya Shah", initials: "PS", hue: 330, time: "09:03", method: "NFC", site: "London office" },
  { name: "Dan Morris", initials: "DM", hue: 30, time: "09:06", method: "Location", site: "London office" },
];

const EARLIER = [
  { name: "Ella Brooks", initials: "EB", hue: 270, time: "08:41", method: "NFC" },
  { name: "Sam Okoro", initials: "SO", hue: 190, time: "08:47", method: "QR" },
];

/** 0 approach · 1 tap · 2 confirmed + sending · 3 stored */
type Phase = 0 | 1 | 2 | 3;
const TIMES: Record<Phase, number> = { 0: 900, 1: 900, 2: 1100, 3: 1900 };

const PATH = "M 250 205 C 330 120, 420 120, 470 170";

function Avatar({ initials, hue, size = 40 }: { initials: string; hue: number; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.34, background: `hsl(${hue} 60% 52%)` }}
    >
      {initials}
    </span>
  );
}

function NfcIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a8.5 8.5 0 0 1 0 12M13 3.5a12 12 0 0 1 0 17" />
    </svg>
  );
}

export function ClockInScene() {
  const [phase, setPhase] = useState<Phase>(0);
  const [n, setN] = useState(0);
  const [rows, setRows] = useState<{ key: string; name: string; initials: string; hue: number; time: string; method: string }[]>(
    EARLIER.map((e) => ({ ...e, key: e.name })),
  );
  const person = PEOPLE[n % PEOPLE.length];

  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === 2) {
        setRows((r) => [{ ...person, key: `${person.name}-${n}` }, ...r].slice(0, 4));
        setPhase(3);
      } else if (phase === 3) {
        setN((x) => x + 1);
        setPhase(0);
      } else setPhase((phase + 1) as Phase);
    }, TIMES[phase]);
    return () => clearTimeout(t);
  }, [phase, n, person]);

  const tapped = phase >= 1;
  const inCount = 10 + Math.min(n, 3) + (phase === 3 ? 1 : 0);

  return (
    <ScaledStage width={752} height={400}>
      {/* The clock-in point by the door */}
      <div className="absolute top-[3.5rem] left-[1rem] flex h-[17rem] w-[11rem] flex-col items-center justify-between rounded-[1.8rem] bg-gradient-to-b from-[#2E313A] to-[#15171D] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_30px_40px_-20px_rgba(0,0,0,0.6)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <img src="/staffmain/icon.svg" alt="" className="h-8 w-8" />
        </span>
        <div className="relative flex h-20 w-20 items-center justify-center">
          {[0, 1, 2].map((k) => (
            <motion.span
              key={`${n}-${k}`}
              className="absolute inset-0 rounded-full border-2 border-[#5CE58F]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={tapped && phase < 3 ? { scale: [0.6, 2.2], opacity: [0.9, 0] } : { scale: 0.6, opacity: 0 }}
              transition={{ duration: 1.1, delay: k * 0.22, ease: "easeOut" }}
            />
          ))}
          <NfcIcon className={`h-12 w-12 transition-colors ${tapped ? "text-[#5CE58F]" : "text-white/70"}`} />
        </div>
        <p className="text-center text-sm leading-tight font-bold">
          Tap to clock in
          <span className="block font-medium text-white/55">NFC · QR · location</span>
        </p>
      </div>

      {/* The phone */}
      <motion.div
        className="absolute top-[5.5rem] left-[10.5rem] z-20 h-[15rem] w-[7.6rem] rounded-[1.6rem] bg-[#0E1018] p-1.5 shadow-[0_30px_40px_-18px_rgba(0,0,0,0.55)]"
        animate={{ x: tapped ? -64 : 30, rotate: tapped ? -10 : 4, y: tapped ? 6 : 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
      >
        <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-[#1B2A55] to-[#0F1119] px-2 text-center text-white">
          <span className="absolute top-1.5 h-1.5 w-10 rounded-full bg-black/60" />
          <AnimatePresence mode="wait">
            {phase >= 2 ? (
              <motion.div key="ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <CheckBadge size="md" />
                <p className="mt-2 text-[13px] font-extrabold">Clocked in</p>
                <p className="font-display text-xl font-extrabold tabular-nums">{person.time}</p>
                <p className="text-[10px] text-white/60">
                  {person.site} · {person.method}
                </p>
              </motion.div>
            ) : (
              <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <Avatar initials={person.initials} hue={person.hue} size={36} />
                <p className="mt-2 text-[12px] font-bold">{person.name.split(" ")[0]}</p>
                <p className="text-[10px] text-white/60">{tapped ? "Reading…" : "Hold near the point"}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* The record travelling to StaffMain */}
      <svg className="absolute inset-0 z-10 h-full w-full overflow-visible" viewBox="0 0 752 400" aria-hidden="true">
        <path d={PATH} fill="none" stroke="#16181D" strokeOpacity="0.18" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      </svg>
      <AnimatePresence>
        {phase === 2 && (
          <motion.span
            key={`dot-${n}`}
            className="absolute top-0 left-0 z-30 flex h-9 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-extrabold text-white shadow-[0_8px_16px_-6px_rgba(19,98,251,0.7)]"
            style={{ offsetPath: `path("${PATH}")`, offsetRotate: "0deg" }}
            initial={{ offsetDistance: "0%", opacity: 0, scale: 0.6 }}
            animate={{ offsetDistance: "100%", opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 1, ease: [0.45, 0, 0.2, 1] }}
          >
            {person.time} · {person.method}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Attendance in StaffMain */}
      <div className="glossy absolute top-[1.5rem] right-0 w-[18.5rem] rounded-[1.6rem] bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-sm font-semibold text-stone">Attendance · today</p>
            <p className="font-display text-lg font-extrabold text-coal">London office</p>
          </div>
          <motion.span key={inCount} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="rounded-full bg-[#E7F8EE] px-3 py-1 text-sm font-extrabold text-good-text tabular-nums">
            {inCount} / 14 in
          </motion.span>
        </div>
        <ul className="mt-3 space-y-2">
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.li
                key={r.key}
                layout
                initial={{ opacity: 0, y: -16, backgroundColor: "#EAF1FF" }}
                animate={{ opacity: 1, y: 0, backgroundColor: i === 0 && phase === 3 ? "#EAF1FF" : "#F7F8FA" }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
              >
                <Avatar initials={r.initials} hue={r.hue} size={30} />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-coal">{r.name}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-stone">{r.method}</span>
                <span className="text-sm font-extrabold text-coal tabular-nums">{r.time}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-good-text">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
          Saved to each person&rsquo;s attendance record
        </p>
      </div>
    </ScaledStage>
  );
}

/** The scene with its heading, for the StaffMain welcome page. */
export function ClockInSection() {
  return (
    <section className="mx-auto max-w-[47rem] border-t border-black/10 pt-12 pb-4">
      <p className="eyebrow">How clocking in works</p>
      <h2 className="mt-4 font-poster text-[clamp(3.5rem,11vw,5.5rem)] leading-[0.92] font-normal text-coal">
        Tap. Clocked in. <span className="text-brand">Stored.</span>
      </h2>
      <p className="mt-4 max-w-2xl text-xl leading-snug text-stone">
        Staff tap their phone on the StaffMain point by the door, or scan its QR code, or clock in by location. The time, place and
        method go straight onto their attendance record, so you always know who&rsquo;s in.
      </p>
      <div className="mt-8">
        <ClockInScene />
      </div>
    </section>
  );
}
