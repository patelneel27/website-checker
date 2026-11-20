"use client";

/* eslint-disable @next/next/no-img-element -- small local SVG */

import { motion } from "motion/react";
import { AttractMode } from "../AttractMode";
import { QRCodeSVG } from "qrcode.react";
import { LIVE, LIVE_EVENTS, LIVE_TILES, PRODUCT, WEBSITE_LABEL, WELCOME } from "@/config/letflows";
import { CheckBadge, PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";
import { LetterRise } from "../LetterRise";
import { RotatingWord } from "../RotatingWord";
import { LiveDisplaySection, LiveJump } from "../LiveDisplay";
import { Cursor, Float, WaveWord } from "../PlayfulHero";
import { ScaledStage } from "../ScaledStage";
import type { WelcomeProps } from "../showcase/ProductKiosk";

// LetFlows welcome: poster headline with glossy property objects (rent, certificates, repairs,
// tax) floating around it, in the same style as the health check and StaffMain heroes.

/** LetFlows' own logo (from its brand kit), with the "by Sterlixit" line. */
export function LetflowsLogo() {
  return (
    <span className="inline-flex flex-col gap-1">
      <img src="/letflows/logo.svg" alt="LetFlows" className="h-10 w-auto self-start" />
      <span className="text-base font-semibold text-stone">by Sterlixit</span>
    </span>
  );
}

function RentCard() {
  return (
    <div className="glossy w-[18.5rem] rounded-[1.4rem] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F8EE] text-good-text">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
            <circle cx="12" cy="12" r="2.6" />
          </svg>
        </span>
        <div className="flex-1 leading-tight">
          <p className="text-base font-bold text-coal">£1,150 received</p>
          <p className="text-sm text-stone">Direct Debit · on time</p>
        </div>
        <CheckBadge />
      </div>
      <div className="mt-3 flex gap-2 text-xs font-bold">
        <span className="rounded-full bg-[#FDECE6] px-2.5 py-1 text-[#C4431E]">14 Albert Tce</span>
        <span className="rounded-full bg-[#F1F2F5] px-2.5 py-1 text-stone">1 Dec</span>
      </div>
    </div>
  );
}

function CertToast() {
  return (
    <div className="glossy flex items-center gap-3 rounded-[1.2rem] bg-gradient-to-b from-[#2E313A] to-[#15171D] py-3 pr-5 pl-3 text-white">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#FFE066] to-[#F5B400]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#16181D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3 5 6v5.5c0 4.2 2.9 7.8 7 9.5 4.1-1.7 7-5.3 7-9.5V6l-7-3Z" />
          <path d="m9 12 2.2 2.2L15.5 10" />
        </svg>
      </span>
      <div className="leading-tight">
        <p className="text-base font-bold">Gas Safety renewed</p>
        <p className="text-sm text-white/65">Valid until Dec 2027</p>
      </div>
    </div>
  );
}

function RentDayTile() {
  return (
    <div className="glossy w-[7.5rem] overflow-hidden rounded-[1.6rem] bg-white text-center">
      <p className="bg-gradient-to-b from-[#F0704A] to-[#C4431E] py-1.5 text-sm font-extrabold tracking-[0.14em] text-white uppercase">Rent day</p>
      <p className="font-poster text-6xl leading-[1.1] text-coal">1st</p>
      <p className="pb-2.5 text-xs font-bold text-good-text">94% collected</p>
    </div>
  );
}

function BidCard() {
  return (
    <div className="glossy w-[13rem] rounded-[1.4rem] bg-white p-4">
      <p className="text-sm font-bold text-coal">Kitchen tap · 3 bids</p>
      <div className="mt-2.5 flex items-center justify-between rounded-xl border-2 border-good bg-[#E7F8EE] px-3 py-2">
        <span className="text-sm font-semibold text-coal">Northside</span>
        <span className="font-serif text-lg font-semibold text-coal">£240</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between rounded-xl bg-[#F3F4F6] px-3 py-2">
        <span className="text-sm text-stone">Swift Heating</span>
        <span className="font-serif text-lg text-stone">£265</span>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for reuse
function MtdPill() {
  return (
    <div className="glossy flex items-center gap-3 rounded-full bg-white py-2 pr-5 pl-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#2B2F3B] to-[#0F1119]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#FFC93C" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" />
        </svg>
      </span>
      <span className="text-base font-bold text-coal">
        Q2 return filed <span className="font-semibold text-stone">· HMRC</span>
      </span>
    </div>
  );
}

export function LfWelcome({ websiteQrUrl, onStart, onHome, onLongPressLogo }: WelcomeProps) {
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
          <LetflowsLogo />
        </motion.div>

        <ScaledStage width={752} height={520} className="mt-6">
          <h1 className="relative z-10 font-poster text-[9.5rem] leading-[0.9] font-normal text-coal">
            <span className="sr-only">
              {WELCOME.rotating.join(" ")} In flow. {WELCOME.tagline}
            </span>
            <span aria-hidden="true" className="absolute top-[0.5rem] left-0 whitespace-nowrap" style={{ perspective: 600 }}>
              <RotatingWord words={WELCOME.rotating} every={2.4} />
            </span>
            <span aria-hidden="true" className="absolute top-[10rem] right-0 whitespace-nowrap">
              <LetterRise text="In " delay={0.3} />
              <WaveWord text="flow." tone="brick" autoAt={1.4} repeatEvery={9} />
            </span>
          </h1>

          <Float className="top-[11rem] left-[0.5rem] z-30" rotate={-8} delay={0.5} bob={7} duration={4.8}>
            <RentDayTile />
          </Float>
          <Float className="top-[20.5rem] left-[-0.5rem] z-20" rotate={-6} delay={0.55} bob={9} duration={5.6}>
            <BidCard />
          </Float>
          <Float className="top-[19.5rem] left-[16rem] z-10" rotate={4} delay={0.45} bob={7} duration={5}>
            <RentCard />
          </Float>
          <Float className="top-[22.5rem] right-[0rem] z-30" rotate={3} delay={0.9} bob={5} duration={4.6}>
            <CertToast />
          </Float>
          <Float className="top-[24.5rem] left-[6rem] z-40" delay={1.2} bob={8} duration={3.8}>
            <div className="origin-top-left scale-[0.75]">
              <Cursor />
            </div>
          </Float>
        </ScaledStage>

        <p className="mx-auto mt-8 max-w-xl text-center font-display text-2xl font-extrabold tracking-tight text-coal sm:text-3xl">{WELCOME.tagline}</p>
        <p className="mx-auto mt-2 max-w-xl text-center text-xl leading-snug text-stone">{WELCOME.subline}</p>

        <div className="mx-auto mt-8 max-w-[34rem]">
          <TactileButton onClick={onStart}>{WELCOME.cta}</TactileButton>
          <LiveJump label={LIVE.jump} href="/letflows/live" />
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

        <LiveDisplaySection
          href="/letflows/live"
          product={PRODUCT}
          {...LIVE}
          tiles={LIVE_TILES}
          events={LIVE_EVENTS}
          wallpaper="bg-gradient-to-br from-[#3A1F18] via-[#1B1F2E] to-[#0F1A2E]"
        />
      </section>
      <AttractMode />
    </div>
  );
}
