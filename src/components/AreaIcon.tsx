import type { CheckArea } from "@/lib/what-we-check";

// Small glossy tiles, one per check area, in the same family as the hero's 3D objects.

const TILE: Record<CheckArea["icon"], { bg: string; stroke: string }> = {
  speed: { bg: "bg-gradient-to-b from-[#2B2F3B] to-[#0F1119]", stroke: "#FFC93C" },
  search: { bg: "bg-gradient-to-b from-white to-[#ECEEF3] border border-white", stroke: "#1362FB" },
  share: { bg: "bg-gradient-to-br from-[#5C9BFF] to-[#1433D6]", stroke: "#FFFFFF" },
  schema: { bg: "bg-gradient-to-b from-white to-[#ECEEF3] border border-white", stroke: "#16181D" },
  lock: { bg: "bg-gradient-to-br from-[#4D94FF] to-[#1433D6]", stroke: "#FFFFFF" },
  access: { bg: "bg-gradient-to-b from-[#4BE07F] to-[#17A94A]", stroke: "#FFFFFF" },
  phone: { bg: "bg-gradient-to-b from-[#2B2F3B] to-[#0F1119]", stroke: "#FFFFFF" },
  map: { bg: "bg-gradient-to-b from-[#FFE066] to-[#F5B400]", stroke: "#16181D" },
};

const PATHS: Record<CheckArea["icon"], React.ReactNode> = {
  speed: <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#FFC93C" stroke="none" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  share: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="m3.5 16 5-5 4 4 2.5-2.5 5.5 5" />
      <circle cx="16" cy="9" r="1.4" fill="#FFFFFF" />
    </>
  ),
  schema: <path d="M9 4H7.5A2.5 2.5 0 0 0 5 6.5v3L3 12l2 2.5v3A2.5 2.5 0 0 0 7.5 20H9M15 4h1.5A2.5 2.5 0 0 1 19 6.5v3l2 2.5-2 2.5v3a2.5 2.5 0 0 1-2.5 2.5H15" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  access: (
    <>
      <circle cx="12" cy="4.8" r="1.8" />
      <path d="M5 8.5c4.5 1.2 9.5 1.2 14 0M12 9.8v4.7m0 0-3 6.5m3-6.5 3 6.5" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
};

export function AreaIcon({ icon, size = 56, className = "" }: { icon: CheckArea["icon"]; size?: number; className?: string }) {
  const t = TILE[icon];
  return (
    <span
      className={`glossy inline-flex shrink-0 items-center justify-center ${t.bg} ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: size * 0.52, height: size * 0.52 }}
        fill="none"
        stroke={t.stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATHS[icon]}
      </svg>
    </span>
  );
}
