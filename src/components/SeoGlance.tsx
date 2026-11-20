"use client";

/* eslint-disable @next/next/no-img-element -- third-party images (the visitor's own og:image / favicon) */

import { cut, seoFacts, type FactStatus as Status } from "@/lib/seo-facts";
import type { SeoDetails, SiteInfo } from "@/lib/types";

const DOT: Record<Status, string> = {
  good: "bg-good",
  warn: "bg-average",
  bad: "bg-poor",
  neutral: "bg-ink/30",
};

/** A small "● label" status, used under the previews. */
function Status({ status, children }: { status: Status; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-base font-semibold text-coal">
      <span className={`h-2.5 w-2.5 rounded-full ${DOT[status]}`} aria-hidden="true" />
      {children}
    </span>
  );
}

function SubHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-2xl font-extrabold tracking-tight text-coal">{title}</h3>
      {subtitle && <p className="mt-1 text-base text-stone">{subtitle}</p>}
    </div>
  );
}

export function SeoGlance({ seo, site, url }: { seo: SeoDetails; site: SiteInfo; url: string }) {
  const u = new URL(url);
  const domain = u.hostname.replace(/^www\./, "");
  const breadcrumb = `${u.protocol}//${u.hostname}${u.pathname === "/" ? "" : u.pathname.replace(/\//g, " › ")}`;
  const titleLen = seo.title?.length ?? 0;
  const descLen = seo.description?.length ?? 0;
  const s = seo.social;
  const shareImage = s.ogImage && s.ogImageWorks !== false ? s.ogImage : null;
  const shareTitle = s.ogTitle ?? seo.title;
  const shareDesc = s.ogDescription ?? seo.description;
  const facts = seoFacts(seo);

  return (
    <section className="pt-16">
      <div className="px-8">
        <p className="eyebrow">SEO at a glance</p>
        <h2 className="mt-3 font-poster text-6xl leading-none font-normal text-coal">
          What Google <span className="text-brand">&amp; social media see</span>
        </h2>
      </div>

      {/* Previews sit on a tinted stage so the mock UIs read as "real". */}
      <div className="mt-8 grid gap-10 bg-black/[0.035] px-8 py-10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] lg:grid-cols-2">
        <div>
          <SubHeading title="On Google" subtitle="Your search result on a phone" />
          <div className="mt-5 glossy rounded-[1.4rem] bg-white p-5 font-[Arial,sans-serif]">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-line bg-[#F1F3F4]">
                {site.favicon ? <img src={site.favicon} alt="" className="h-5 w-5 object-contain" /> : null}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-base text-[#202124]">{s.ogSiteName ?? domain}</span>
                <span className="block truncate text-base text-[#4D5156]">{breadcrumb}</span>
              </span>
            </div>
            <p className="mt-2 text-xl leading-snug text-[#1A0DAB]">{seo.title ? cut(seo.title, 60) : <em>No page title</em>}</p>
            <p className="mt-1 text-base leading-relaxed text-[#4D5156]">
              {seo.description ? cut(seo.description, 160) : <em>No description: Google will pick some text from your page.</em>}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <Status status={titleLen >= 10 && titleLen <= 60 ? "good" : "warn"}>Title {titleLen ? `${titleLen} chars` : "missing"}</Status>
            <Status status={descLen >= 50 && descLen <= 160 ? "good" : "warn"}>
              Description {descLen ? `${descLen} chars` : "missing"}
            </Status>
          </div>
        </div>

        <div>
          <SubHeading title="When shared" subtitle="Facebook, LinkedIn, WhatsApp and X" />
          <div className="mt-5 glossy overflow-hidden rounded-[1.4rem] bg-white">
            {shareImage ? (
              <img src={shareImage} alt="" className="aspect-[1.91/1] w-full bg-line object-cover" />
            ) : (
              <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-[#E4E6EB] text-lg font-semibold text-[#606770]">
                {s.ogImage ? "Preview image is broken" : "No preview image"}
              </div>
            )}
            <div className="border-t border-[#DADDE1] bg-[#F2F3F5] px-4 py-3 font-[Arial,sans-serif]">
              <p className="text-base tracking-wide text-[#606770] uppercase">{domain}</p>
              <p className="truncate text-lg font-bold text-[#1D2129]">{shareTitle ?? "No title"}</p>
              {shareDesc && <p className="line-clamp-1 text-base text-[#606770]">{shareDesc}</p>}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <Status status={s.ogTitle ? "good" : "warn"}>og:title</Status>
            <Status status={shareImage ? "good" : "bad"}>og:image{s.ogImage && !shareImage ? " (broken)" : ""}</Status>
            <Status status={s.ogDescription ? "good" : "warn"}>og:description</Status>
            <Status status={s.twitterCard ? "good" : "warn"}>X card</Status>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 px-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <SubHeading title="Structured data" subtitle="Schema unlocks rich results: address, reviews, FAQs, breadcrumbs" />
          {seo.schema.types.length > 0 ? (
            <>
              <div className="mt-5 flex flex-wrap gap-2">
                {seo.schema.types.map((t) => (
                  <span key={t} className="rounded-full border border-black/5 bg-gradient-to-b from-white to-[#F6F7F9] px-4 py-1.5 text-lg font-semibold text-brand-deep shadow-[inset_0_1px_0_#fff,0_4px_10px_-6px_rgba(10,19,66,0.35)]">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-base text-stone">Found as {seo.schema.formats.join(", ")}.</p>
            </>
          ) : (
            <p className="mt-5">
              <Status status="bad">No schema found</Status>
            </p>
          )}
          {seo.schema.invalidJsonLd > 0 && (
            <p className="mt-3 text-base font-semibold text-poor-text">
              {seo.schema.invalidJsonLd} schema block{seo.schema.invalidJsonLd === 1 ? " has" : "s have"} errors Google can&rsquo;t read.
            </p>
          )}
        </div>

        <div>
          <SubHeading title="On-page facts" />
          <dl className="mt-5 grid border-t-2 border-coal sm:grid-cols-2 sm:gap-x-10">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-3 border-b border-black/10 py-3.5">
                <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[f.status]}`} aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-base text-stone">{f.label}</dt>
                  <dd className="text-lg font-bold text-coal">{f.value}</dd>
                  {f.note && <dd className="truncate text-base text-stone">{f.note}</dd>}
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
