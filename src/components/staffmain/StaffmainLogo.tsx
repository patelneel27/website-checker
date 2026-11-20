/* eslint-disable @next/next/no-img-element -- small local SVG */
import { PRODUCT } from "@/config/staffmain";

/** StaffMain's own icon (from staffmain.sterlixit.co.uk) on a glossy tile, with the name. */
export function StaffmainLogo({ size = "md", byline = true }: { size?: "md" | "lg"; byline?: boolean }) {
  const tile = size === "lg" ? "h-20 w-20 rounded-[1.6rem]" : "h-14 w-14 rounded-[1.1rem]";
  const img = size === "lg" ? "h-12 w-12" : "h-9 w-9";
  return (
    <span className="inline-flex items-center gap-4">
      <span className={`glossy flex shrink-0 items-center justify-center bg-gradient-to-b from-white to-[#F1F2F6] ${tile}`}>
        <img src="/staffmain/icon.svg" alt="" className={img} />
      </span>
      <span className="leading-tight">
        <span className={`block font-display font-extrabold tracking-tight text-coal ${size === "lg" ? "text-4xl" : "text-2xl"}`}>{PRODUCT}</span>
        {byline && <span className="block text-base font-semibold text-stone">by Sterlixit</span>}
      </span>
    </span>
  );
}
