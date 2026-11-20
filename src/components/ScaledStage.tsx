"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Lays out decorative objects on a fixed-size canvas and scales the whole thing down to fit
 * narrower screens (a phone opening the page from a QR code), so nothing collides.
 */
export function ScaledStage({ width, height, children, className = "" }: { width: number; height: number; children: React.ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  // Unknown until measured: the canvas stays hidden for that first frame so a phone never
  // flashes the full-size layout spilling off the screen.
  const [scale, setScale] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const fit = (w: number) => setScale(Math.min(1, w / width));
    fit(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => fit(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  const s = scale ?? 1;
  return (
    <div ref={outer} className={`relative w-full ${className}`} style={{ height: height * s }}>
      <div
        className="absolute top-0 left-1/2"
        style={{ width, height, transform: `translateX(-50%) scale(${s})`, transformOrigin: "top center", visibility: scale === null ? "hidden" : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
