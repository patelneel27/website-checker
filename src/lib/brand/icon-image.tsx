import { ImageResponse } from "next/og";
import { MARK_HEIGHT, MARK_PATHS, MARK_VIEWBOX, MARK_WIDTH } from "./mark";

/** PNG of the star mark on white: PWA icons, Apple touch icon and the email header. */
export function iconImage(size: number, { padding = 0.16 }: { padding?: number } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
        <svg width={(inner * MARK_WIDTH) / MARK_HEIGHT} height={inner} viewBox={MARK_VIEWBOX}>
          {MARK_PATHS.map((p, i) => (
            <path key={i} d={p.d} fill={p.fill} />
          ))}
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
