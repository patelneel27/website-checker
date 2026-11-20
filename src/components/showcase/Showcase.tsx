"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckBadge, PillButton, TactileButton } from "../Buttons";
import { Logo } from "../Logo";
import { FeatureIcon, type FeatureIconId } from "../staffmain/FeatureIcon";
import { FeatureScreen, type ShowcaseFeature } from "./FeatureScreen";

const SWIPE_PX = 70;

/** Six swipeable feature screens with progress dots. */
export function Showcase({
  product,
  features,
  lastLabel,
  fallback,
  index,
  direction,
  onIndex,
  onDone,
  onHome,
  onLongPressLogo,
}: {
  product: string;
  features: ShowcaseFeature[];
  /** Label for the button on the last slide, e.g. "Now, about your business". */
  lastLabel: string;
  /** Drawn stand-in for a feature without real media. */
  fallback?: (id: string) => React.ReactNode;
  index: number;
  direction: 1 | -1;
  onIndex: (i: number) => void;
  onDone: () => void;
  onHome: () => void;
  onLongPressLogo: () => void;
}) {
  const FEATURES = features;
  const f = FEATURES[index];
  const last = index === FEATURES.length - 1;
  const next = () => (last ? onDone() : onIndex(index + 1));
  const prev = () => index > 0 && onIndex(index - 1);

  return (
    <div className="paper flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-40">
        <header className="flex items-center justify-between gap-4 px-6 pt-8 sm:px-8 sm:pt-9">
          <Logo onTap={onHome} onLongPress={onLongPressLogo} />
          <PillButton icon="arrow" onClick={onDone}>
            Skip to my results
          </PillButton>
        </header>

        <div className="mt-8 flex items-center justify-between gap-4 px-6 sm:px-8">
          <p className="eyebrow">What {product} does</p>
          <p className="font-poster text-3xl text-coal tabular-nums">
            {index + 1}
            <span className="text-stone/40"> / {FEATURES.length}</span>
          </p>
        </div>

        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.section
            key={f.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 120 }),
              centre: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -120 }),
            }}
            initial="enter"
            animate="centre"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_PX) next();
              else if (info.offset.x > SWIPE_PX) prev();
            }}
            className="touch-pan-y px-6 pt-5 sm:px-8"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${FEATURES.length}: ${f.title}`}
          >

            <div className="flex items-start gap-5">
              <FeatureIcon icon={f.id as FeatureIconId} size={72} className="hidden sm:inline-flex" />
              <div className="min-w-0">
                <h1 className="font-poster text-5xl leading-[0.95] font-normal text-coal sm:text-6xl">{f.title}</h1>
                <p className="mt-3 text-2xl leading-snug font-semibold text-brand">{f.benefit}</p>
              </div>
            </div>

            <div className="mt-6 pointer-events-none select-none">
              <FeatureScreen feature={f} product={product} fallback={fallback?.(f.id)} />
            </div>

            <ul className="mt-6 space-y-3">
              {f.bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-center gap-3 text-xl text-coal"
                >
                  <CheckBadge size="sm" />
                  {b}
                </motion.li>
              ))}
            </ul>
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="paper-bar">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Features">
            {FEATURES.map((ft, i) => (
              <button
                key={ft.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={ft.title}
                onClick={() => onIndex(i)}
                className="flex h-8 items-center px-1"
              >
                <motion.span
                  className={`block h-2.5 rounded-full transition-colors ${i === index ? "bg-brand" : i < index ? "bg-coal" : "bg-[#C9CAC6]"}`}
                  animate={{ width: i === index ? 36 : 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {index > 0 && (
              <PillButton icon="back" onClick={prev} className="shrink-0">
                Back
              </PillButton>
            )}
            <TactileButton onClick={next} className="flex-1">
              {last ? lastLabel : `Next: ${FEATURES[index + 1].title}`}
            </TactileButton>
          </div>
        </div>
      </div>
    </div>
  );
}
