// Shared by the results screen and the report email (keep free of server-only imports).
import type { SeoDetails } from "./types";

export type FactStatus = "good" | "warn" | "bad" | "neutral";
export type Fact = { label: string; value: string; status: FactStatus; note?: string };

export const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Ahrefs-style on-page facts with a traffic-light status each. */
export function seoFacts(seo: SeoDetails): Fact[] {
  const noindex = /noindex|none/i.test(seo.robots ?? "");
  return [
    {
      label: "Main heading (H1)",
      value: seo.headings.h1 === 1 ? "1 heading" : `${seo.headings.h1} headings`,
      status: seo.headings.h1 === 1 ? "good" : "warn",
      note: seo.headings.firstH1 ? `“${cut(seo.headings.firstH1, 70)}”` : undefined,
    },
    {
      label: "Sub-headings (H2 / H3)",
      value: `${seo.headings.h2} / ${seo.headings.h3}`,
      status: seo.headings.h2 > 0 ? "good" : "warn",
    },
    {
      label: "Words on the page",
      value: seo.wordCount.toLocaleString("en-GB"),
      status: seo.wordCount >= 300 ? "good" : "warn",
      note: seo.wordCount < 300 ? "Thin content: Google likes 300+ words" : undefined,
    },
    {
      label: "Links",
      value: `${seo.links.internal} internal · ${seo.links.external} external`,
      status: seo.links.internal > 0 ? "good" : "warn",
    },
    {
      label: "Images",
      value: seo.images.total === 0 ? "None" : `${seo.images.total} images`,
      status: seo.images.total === 0 ? "neutral" : seo.images.missingAlt === 0 ? "good" : "warn",
      note: seo.images.missingAlt > 0 ? `${seo.images.missingAlt} missing alt text` : seo.images.total > 0 ? "All have alt text" : undefined,
    },
    {
      label: "Canonical tag",
      value: seo.canonical ? "Set" : "Missing",
      status: seo.canonical ? "good" : "warn",
    },
    { label: "Language", value: seo.lang ?? "Not set", status: seo.lang ? "good" : "warn" },
    { label: "Shown in Google", value: noindex ? "No (noindex)" : "Yes", status: noindex ? "bad" : "good" },
  ];
}
