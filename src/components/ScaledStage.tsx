"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lays out decorative objects on a fixed-size canvas and scales the whole thing down to fit
 * narrower screens (a phone opening the page from a QR code), so nothing collides.
 */
export function ScaledStage({ width, height, children, className = "" }: { width: number; height: number; children: React.ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={outer} className={`relative w-full ${className}`} style={{ height: height * scale }}>
      <div className="absolute top-0 left-1/2" style={{ width, height, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center" }}>
        {children}
      </div>
    </div>
  );
}
