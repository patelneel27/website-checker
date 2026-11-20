"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { normaliseUrl } from "@/lib/url";
import { BrowserBar } from "../BrowserBar";
import { PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";
import { Cursor } from "../PlayfulHero";

export function EnterUrl({
  initialValue,
  error,
  demoUrl,
  onSubmit,
  onBack,
  onLongPressLogo,
}: {
  initialValue: string;
  error: string | null;
  demoUrl: string;
  onSubmit: (url: string) => void;
  onBack: () => void;
  onLongPressLogo: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shownError = localError ?? error;

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  function submit(raw: string) {
    const result = normaliseUrl(raw);
    if (!result.ok) {
      setLocalError(result.message);
      inputRef.current?.focus();
      return;
    }
    setLocalError(null);
    inputRef.current?.blur();
    onSubmit(result.url);
  }

  return (
    <div className="paper flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between gap-4 px-6 pt-7 sm:px-8 sm:pt-9">
        <Logo onLongPress={onLongPressLogo} />
        <PillButton icon="back" onClick={onBack}>
          Back
        </PillButton>
      </header>

      <form
        className="mx-auto w-full max-w-[47rem] px-6 pt-10 pb-12 sm:px-8 sm:pt-14"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        noValidate
      >
        <p className="eyebrow">Step 1 of 3</p>
        <h1 className="mt-4 font-poster text-[clamp(3.75rem,15vw,7rem)] leading-[0.9] font-normal text-coal">
          <motion.span className="block" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            What&rsquo;s your
          </motion.span>
          <motion.span
            className="block text-brand"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            website?
          </motion.span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-snug text-stone sm:mt-6 sm:text-xl">
          We&rsquo;ll check your homepage on a mobile connection, exactly how your customers see it.
        </p>

        <label htmlFor="url" className="sr-only">
          Website address
        </label>
        <motion.div
          className="relative mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 30, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.15 }}
        >
          <BrowserBar state={shownError ? "error" : "idle"}>
            <span className="hidden text-2xl font-semibold text-stone/45 sm:inline">https://</span>
            <input
              ref={inputRef}
              id="url"
              name="url"
              type="url"
              inputMode="url"
              enterKeyHint="go"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="yourcompany.co.uk"
              value={value}
              onChange={(e) => {
                setValue(e.target.value.replace(/^https?:\/\//i, ""));
                setLocalError(null);
              }}
              className="min-w-0 flex-1 bg-transparent pl-1 font-display text-2xl font-bold tracking-tight text-coal outline-none sm:text-3xl placeholder:font-sans placeholder:font-medium placeholder:text-stone/30"
              aria-invalid={!!shownError}
              aria-describedby={shownError ? "url-error" : undefined}
            />
          </BrowserBar>
          <motion.div
            className="pointer-events-none absolute -right-2 -bottom-14 w-16 max-sm:hidden"
            initial={{ opacity: 0, x: 30, y: 30 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{ opacity: { delay: 0.6 }, x: { delay: 0.6, type: "spring" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
            aria-hidden="true"
          >
            <div className="origin-top-left scale-[0.7] -rotate-6">
              <Cursor />
            </div>
          </motion.div>
        </motion.div>

        <p id="url-error" role="alert" className="mt-4 min-h-8 text-lg font-semibold text-poor-text">
          {shownError}
        </p>

        <TactileButton type="submit" disabled={!value.trim()} className="mt-6">
          Run my check
        </TactileButton>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-base text-stone sm:text-lg">Just looking?</span>
          <PillButton
            icon="arrow"
            onClick={() => {
              setValue(demoUrl);
              submit(demoUrl);
            }}
          >
            Try it with {demoUrl}
          </PillButton>
        </div>
      </form>
    </div>
  );
}
