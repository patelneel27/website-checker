"use client";

import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { CheckBadge, PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";

export type ThanksCopy = {
  headline: readonly string[];
  text: string;
  qrTitle: string;
  qrText: string;
  back: string;
  returnAfterS: number;
};

export function Thanks({
  copy: THANKS,
  firstName,
  queued,
  autoReturn,
  bookingQrUrl,
  bookingButtonUrl,
  onDone,
  onLongPressLogo,
}: {
  copy: ThanksCopy;
  firstName: string;
  /** Saved on this device because the Wi-Fi was down; it sends itself when back online. */
  queued: boolean;
  /** Kiosk: go back to the event home after THANKS.returnAfterS seconds. */
  autoReturn: boolean;
  bookingQrUrl: string;
  bookingButtonUrl: string;
  onDone: () => void;
  onLongPressLogo: () => void;
}) {
  const [left, setLeft] = useState<number>(THANKS.returnAfterS);
  useEffect(() => {
    if (!autoReturn) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [autoReturn]);
  useEffect(() => {
    if (autoReturn && left <= 0) onDone();
  }, [autoReturn, left, onDone]);

  return (
    <div className="paper flex h-full flex-col overflow-y-auto px-6 py-8 sm:px-8 sm:py-9">
      <header className="flex items-center justify-between gap-4">
        <Logo onTap={onDone} onLongPress={onLongPressLogo} />
        <PillButton icon="restart" onClick={onDone}>
          {THANKS.back}
        </PillButton>
      </header>

      <div className="relative mt-14">
        <motion.div
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: -8 }}
          transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.1 }}
          className="absolute top-0 right-2"
          aria-hidden="true"
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
            <CheckBadge size="lg" />
          </motion.div>
        </motion.div>

        <p className="eyebrow">Thanks{firstName ? `, ${firstName}` : ""}</p>
        <h1 className="mt-4 font-poster text-[clamp(4.5rem,15vw,7.5rem)] leading-[0.88] font-normal text-coal">
          <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {THANKS.headline[0]}
          </motion.span>
          <motion.span className="block text-brand" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            {THANKS.headline[1]}
          </motion.span>
        </h1>
        <p className="mt-7 max-w-2xl text-2xl leading-snug text-stone">{THANKS.text}</p>
        {queued && (
          <p className="mt-4 flex items-center gap-3 text-lg font-semibold text-coal">
            <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-average" />
            Saved on this device: it will send itself as soon as we&rsquo;re back online.
          </p>
        )}
      </div>

      <section className="mt-auto pt-14">
        <p className="eyebrow">Next step</p>
        <h2 className="mt-3 font-poster text-6xl leading-none font-normal text-coal">
          {THANKS.qrTitle.split(" ").slice(0, -1).join(" ")} <span className="text-brand">{THANKS.qrTitle.split(" ").slice(-1)}</span>
        </h2>
        <div className="mt-8 grid grid-cols-[auto_1fr] items-center gap-8">
          <motion.div
            className="glossy rounded-[1.8rem] bg-white p-5"
            initial={{ opacity: 0, y: 30, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.35 }}
          >
            <QRCodeSVG value={bookingQrUrl} size={170} fgColor="#16181D" level="M" marginSize={0} />
            <p className="mt-3 text-center text-sm font-bold tracking-[0.12em] text-stone uppercase">Scan with your phone</p>
          </motion.div>
          <p className="text-xl leading-snug text-coal">{THANKS.qrText}</p>
        </div>
        <TactileButton href={bookingButtonUrl} className="mt-10">
          Or book on this screen
        </TactileButton>
        {autoReturn && <p className="mt-4 text-center text-base text-stone tabular-nums">Back to start in {Math.max(0, left)} s</p>}
      </section>
    </div>
  );
}
