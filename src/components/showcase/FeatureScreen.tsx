/* eslint-disable @next/next/no-img-element -- local screenshots */

export type ShowcaseMedia = { type: "image" | "video"; src: string; alt: string };

export type ShowcaseFeature = {
  id: string;
  title: string;
  benefit: string;
  bullets: readonly string[];
  /** Real screenshot or short muted recording; without it, `fallback` is shown. */
  media?: ShowcaseMedia;
};

/** A feature's screen in a glossy browser frame. */
export function FeatureScreen({ feature, product, fallback }: { feature: ShowcaseFeature; product: string; fallback?: React.ReactNode }) {
  return (
    <div className="glossy overflow-hidden rounded-[1.8rem] border border-white bg-white">
      <div className="flex items-center gap-3 border-b border-black/5 bg-[#F7F7F9] px-5 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </span>
        <span className="text-sm font-semibold text-stone">
          {product} · {feature.title}
        </span>
      </div>
      <div className="relative aspect-[16/9] overflow-hidden bg-white">
        {feature.media?.type === "image" && (
          <img src={feature.media.src} alt={feature.media.alt} className="h-full w-full object-cover object-[left_top]" />
        )}
        {feature.media?.type === "video" && (
          <video src={feature.media.src} aria-label={feature.media.alt} className="h-full w-full object-cover" autoPlay muted loop playsInline />
        )}
        {!feature.media && fallback}
      </div>
    </div>
  );
}
