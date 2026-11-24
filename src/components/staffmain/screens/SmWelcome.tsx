"use client";

import { motion } from "motion/react";
import { AttractMode } from "../../AttractMode";
import { QRCodeSVG } from "qrcode.react";
import { LIVE, LIVE_EVENTS, LIVE_TILES, PRODUCT, TRIAL, WEBSITE_LABEL, WELCOME } from "@/config/staffmain";
import { CheckBadge, PillButton, TactileButton } from "../../Buttons";
import { Logo } from "../../Logo";
import { LetterRise } from "../../LetterRise";
import { LiveDisplaySection, LiveJump } from "../../LiveDisplay";
import { ClockInSection } from "../ClockInScene";
import { Cursor, Float, WaveWord } from "../../PlayfulHero";
import { ScaledStage } from "../../ScaledStage";
import { StaffmainLogo } from "../StaffmainLogo";

// StaffMain welcome: poster headline with glossy HR objects (clock-in, leave, rota, calendar,
// team) floating around it, in the same style as the health check hero.

function ClockInCard() {
  return (
    <div className="glossy w-[16rem] rounded-[1.4rem] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(150_60%_50%)] text-base font-bold text-white">AK</span>
        <div className="flex-1 leading-tight">
          <p className="text-base font-bold text-coal">Amira Khan</p>
          <p className="text-sm text-stone">Clocked in · 08:59</p>
        </div>
        <CheckBadge />
      </div>
      <div className="mt-3 flex gap-2 text-xs font-bold">
        <span className="rounded-full bg-[#EAF1FF] px-2.5 py-1 text-brand">QR</span>
        <span className="rounded-full bg-[#F1F2F5] px-2.5 py-1 text-stone">London office</span>
      </div>
    </div>
  );
}

function LeaveToast() {
  return (
    <div className="glossy flex items-center gap-3 rounded-[1.2rem] bg-gradient-to-b from-[#2E313A] to-[#15171D] py-3 pr-5 pl-3 text-white">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#FFE066] to-[#F5B400]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#16181D" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </svg>
      </span>
      <div className="leading-tight">
        <p className="text-base font-bold">Holiday approved</p>
        <p className="text-sm text-white/65">12–16 May · 5 days</p>
      </div>
    </div>
  );
}

function RotaTile() {
  const cells = ["#DCE8FF", "#DCE8FF", "", "#DCE8FF", "#FFF1D6", "", "#E7F8EE", "#E7F8EE", "#E7F8EE", "", "", "#F3E8FF", "#F3E8FF", "#FFF1D6", ""];
  return (
    <div className="glossy w-[11.5rem] rounded-[1.6rem] bg-white p-4">
      <p className="text-sm font-bold text-coal">Rota · week 21</p>
      <div className="mt-2.5 grid grid-cols-5 gap-1.5">
        {cells.map((c, i) => (
          <span key={i} className="h-6 rounded-md" style={{ background: c || "#F3F4F6" }} />
        ))}
      </div>
    </div>
  );
}

function CalendarTile() {
  return (
    <div className="glossy w-[7.5rem] overflow-hidden rounded-[1.6rem] bg-white text-center">
      <p className="bg-gradient-to-b from-[#FF6B60] to-[#E5372B] py-1.5 text-sm font-extrabold tracking-[0.14em] text-white uppercase">Mon</p>
      <p className="font-poster text-6xl leading-[1.1] text-coal">26</p>
      <p className="pb-2.5 text-xs font-bold text-poor-text">Bank holiday</p>
    </div>
  );
}

function TeamPill() {
  const people = [
    ["AK", 150],
    ["TF", 210],
    ["PS", 330],
    ["DM", 30],
  ] as const;
  return (
    <div className="glossy flex items-center gap-3 rounded-full bg-white py-2 pr-5 pl-2">
      <span className="flex -space-x-2.5">
        {people.map(([i, h]) => (
          <span key={i} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white" style={{ background: `hsl(${h} 60% 52%)` }}>
            {i}
          </span>
        ))}
      </span>
      <span className="text-base font-bold text-coal">
        12 in <span className="font-semibold text-stone">· 2 off</span>
      </span>
    </div>
  );
}

function DocTile() {
  return (
    <div className="glossy flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-[#4D94FF] to-[#1433D6]">
      <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3 5 6v5.5c0 4.2 2.9 7.8 7 9.5 4.1-1.7 7-5.3 7-9.5V6l-7-3Z" />
        <path d="m9 12 2.2 2.2L15.5 10" />
      </svg>
    </div>
  );
}

export function SmWelcome({
  websiteQrUrl,
  onStart,
  onHome,
  onLongPressLogo,
}: {
  websiteQrUrl: string;
  onStart: () => void;
  onHome: () => void;
  onLongPressLogo: () => void;
}) {
  return (
    <div className="paper flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between gap-4 px-6 pt-8 sm:px-8 sm:pt-9">
        <Logo onTap={onHome} onLongPress={onLongPressLogo} />
        <PillButton icon="back" onClick={onHome}>
          All demos
        </PillButton>
      </header>

      <section className="px-6 pt-8 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StaffmainLogo />
        </motion.div>

        <ScaledStage width={752} height={440} className="mt-6">
          <h1 className="relative z-10 font-poster text-[9.5rem] leading-[0.9] font-normal text-coal">
            <span className="sr-only">
              {WELCOME.headline.join(" ")} {WELCOME.subline}
            </span>
            <span aria-hidden="true" className="absolute top-[1rem] left-0 whitespace-nowrap">
              <LetterRise text={WELCOME.headline[0]} />
            </span>
            <span aria-hidden="true" className="absolute top-[12.5rem] right-0 whitespace-nowrap">
              <WaveWord text={WELCOME.headline[1]} tone="blue" autoAt={1.1} repeatEvery={11} />
            </span>
          </h1>

          <Float className="top-[0.5rem] right-[-1rem] z-20" rotate={5} delay={0.45} bob={7} duration={5}>
            <ClockInCard />
          </Float>
          <Float className="top-[9.5rem] right-[1rem] z-30" rotate={-4} delay={0.7} bob={6} duration={4.4}>
            <LeaveToast />
          </Float>
          <Float className="top-[12rem] left-[-0.5rem] z-20" rotate={-7} delay={0.55} bob={9} duration={5.6}>
            <RotaTile />
          </Float>
          <Float className="top-[19.5rem] left-[11rem] z-30" rotate={8} delay={0.85} bob={7} duration={4.8}>
            <CalendarTile />
          </Float>
          <Float className="top-[10.5rem] left-[13rem] z-0" rotate={-10} delay={0.95} bob={6} duration={5.2}>
            <DocTile />
          </Float>
          <Float className="top-[24.5rem] right-[2rem] z-30" rotate={-3} delay={1.05} bob={5} duration={4.6}>
            <TeamPill />
          </Float>
          <Float className="top-[16.25rem] left-[8.75rem] z-40" delay={1.2} bob={8} duration={3.8}>
            <div className="origin-top-left scale-[0.75]">
              <Cursor />
            </div>
          </Float>
        </ScaledStage>

        <p className="mx-auto mt-8 max-w-xl text-center text-xl leading-snug text-stone sm:text-2xl">{WELCOME.subline}</p>

        <div className="mx-auto mt-8 max-w-[34rem]">
          <TactileButton onClick={onStart}>{WELCOME.cta}</TactileButton>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-base font-semibold text-coal sm:text-lg">
            <span className="flex items-center gap-2">
              <CheckBadge size="sm" />
              {TRIAL.title}
            </span>
            {TRIAL.points.map((p) => (
              <span key={p} className="flex items-center gap-2">
                <CheckBadge size="sm" />
                {p}
              </span>
            ))}
          </p>
          <LiveJump label={LIVE.jump} href="/staffmain/live" />
        </div>

        <div className="mx-auto mt-10 flex max-w-[34rem] items-center justify-between gap-6 border-t border-black/10 py-6">
          <div>
            <p className="text-base font-bold text-coal">{WELCOME.builtBy}</p>
            <p className="mt-1 text-base text-stone">
              Have a look later at <span className="font-semibold text-brand">{WEBSITE_LABEL}</span>
            </p>
          </div>
          <div className="glossy shrink-0 rounded-2xl bg-white p-2.5" title={`Scan to visit ${WEBSITE_LABEL}`}>
            <QRCodeSVG value={websiteQrUrl} size={76} fgColor="#16181D" level="M" marginSize={0} />
          </div>
        </div>

        <ClockInSection />

        <LiveDisplaySection
          href="/staffmain/live"
          product={PRODUCT}
          {...LIVE}
          tiles={LIVE_TILES}
          events={LIVE_EVENTS}
          wallpaper="bg-gradient-to-br from-[#13265E] via-[#141B3A] to-[#0F1119]"
        />
      </section>
      <AttractMode />
    </div>
  );
}
