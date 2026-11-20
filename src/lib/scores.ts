// Score bands, plain-English meanings and the friendly summary line.
// Shared by the kiosk UI and the report email, so keep it free of server-only imports.

import type { CategoryKey, CheckResult, Scores } from "./types";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  performance: "Performance",
  seo: "SEO",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
};

export const CATEGORY_MEANINGS: Record<CategoryKey, string> = {
  performance: "How fast your site loads on a phone",
  seo: "How easily Google can find and understand your site",
  accessibility: "How easy your site is for everyone to use",
  "best-practices": "Security and modern web standards",
};

/** Order the rings appear in. */
export const CATEGORY_ORDER: CategoryKey[] = ["performance", "seo", "accessibility", "best-practices"];

export type Band = "good" | "average" | "poor";

export function bandFor(score: number): Band {
  if (score >= 90) return "good";
  if (score >= 50) return "average";
  return "poor";
}

export const BAND_LABELS: Record<Band, string> = {
  good: "Good",
  average: "Needs improvement",
  poor: "Poor",
};

/** Google's Lighthouse colours. `ring` for strokes/fills, `text` is darkened for readable text. */
export const BAND_COLOURS: Record<Band, { ring: string; text: string; tint: string }> = {
  good: { ring: "#0CCE6B", text: "#067A3E", tint: "#E6FAF0" },
  average: { ring: "#FFA400", text: "#A35400", tint: "#FFF4E0" },
  poor: { ring: "#FF4E42", text: "#C4140A", tint: "#FFECEA" },
};

const STRENGTH: Record<CategoryKey, string> = {
  performance: "fast",
  seo: "findable",
  accessibility: "easy to use",
  "best-practices": "secure",
};

const WEAKNESS: Record<CategoryKey, string> = {
  performance: "slow on mobile. That's costing you visitors.",
  seo: "harder for Google to find than it should be. That's costing you enquiries.",
  accessibility: "harder to use than it should be for some visitors.",
  "best-practices": "missing some modern security and web standards.",
};

function joinWords(words: string[]) {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/** One friendly sentence. Helpful, never insulting. */
export function summarise(scores: Scores | null, checks: CheckResult[], psiPending: boolean): string {
  if (!scores || CATEGORY_ORDER.every((k) => scores[k] == null)) {
    const failed = checks.filter((c) => !c.pass).length;
    if (psiPending) {
      return failed === 0
        ? "Here's a first look: the basics are in place. Your full speed report is on its way."
        : "Here's a first look at where you could improve. Your full speed report is on its way.";
    }
    return failed === 0
      ? "The basics look good. Here's what else we spotted."
      : "Here's where you could improve.";
  }

  const scored = CATEGORY_ORDER.filter((k) => scores[k] != null) as CategoryKey[];
  const strong = scored.filter((k) => (scores[k] as number) >= 90);
  const weak = scored
    .filter((k) => (scores[k] as number) < 90)
    .sort((a, b) => (scores[a] as number) - (scores[b] as number));

  if (weak.length === 0) {
    return "Great news: your site is in excellent shape. A few tweaks could make it even better.";
  }

  const weakest = weak[0];
  if (strong.length > 0) {
    const strengths = strong.slice(0, 2).map((k) => STRENGTH[k]);
    return `Your site is ${joinWords(strengths)} but ${WEAKNESS[weakest]}`;
  }
  if ((scores[weakest] as number) >= 50) {
    return `You're on the right track. The biggest opportunity: your site is ${WEAKNESS[weakest]}`;
  }
  return `There's real room to grow here. Right now your site is ${WEAKNESS[weakest]}`;
}
