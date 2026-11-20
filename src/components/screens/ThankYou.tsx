"use client";

import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { CheckBadge, PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";

export function ThankYou({
  name,
  email,
  bookingQrUrl,
  bookingButtonUrl,
  onDone,
  onLongPressLogo,
}: {
  name: string;
  email: string;
  bookingQrUrl: string;
  bookingButtonUrl: string;
  onDone: () => void;
  onLongPressLogo: () => void;
}) {
  const first = name.trim().split(/\s+/)[0];

  return (
    <div className="paper flex h-full flex-col overflow-y-auto px-6 py-7 sm:px-8 sm:py-9">
      <header className="flex items-center justify-between gap-4">
        <Logo onLongPress={onLongPressLogo} />
        <PillButton icon="check" onClick={onDone}>
          Done
        </PillButton>
      </header>

      <div className="relative mt-12 sm:mt-16">
        <motion.div
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: -8 }}
          transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.1 }}
          className="absolute top-0 right-0 max-sm:[zoom:0.7] sm:top-2 sm:right-4"
          aria-hidden="true"
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
            <CheckBadge size="lg" />
          </motion.div>
        </motion.div>

        <p className="eyebrow">Report sent</p>
        <h1 className="mt-4 font-poster text-[clamp(4rem,16vw,7.5rem)] leading-[0.88] font-normal text-coal">
          <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Thank you{first ? "," : ""}
          </motion.span>
          {first && (
            <motion.span
              className="block truncate text-brand"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {first}.
            </motion.span>
          )}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-snug text-stone sm:mt-7 sm:text-2xl">
          Your report is on its way to <strong className="break-all text-coal">{email}</strong>. Check your junk folder if it
          isn&rsquo;t there in a few minutes.
        </p>
      </div>

      <section className="mt-auto pt-14">
        <p className="eyebrow">Next step</p>
        <h2 className="mt-3 font-poster text-5xl leading-none font-normal text-coal sm:text-6xl">
          Book a free <span className="text-brand">strategy call</span>
        </h2>
        <div className="mt-8 grid items-center gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
          <motion.div
            className="glossy justify-self-center rounded-[1.8rem] bg-white p-5"
            initial={{ opacity: 0, y: 30, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.35 }}
          >
            <QRCodeSVG value={bookingQrUrl} size={190} fgColor="#16181D" level="M" marginSize={0} />
            <p className="mt-3 text-center text-sm font-bold tracking-[0.12em] text-stone uppercase">Scan with your phone</p>
          </motion.div>
          <ul className="space-y-4 text-lg text-coal sm:text-xl">
            {["30 minutes with a Sterlixit specialist", "We walk through your report together", "No obligation, no hard sell"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckBadge size="sm" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <TactileButton href={bookingButtonUrl} className="mt-10">
          Or book on this screen
        </TactileButton>
      </section>
    </div>
  );
}
