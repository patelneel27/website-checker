// Glossy tiles for StaffMain features, in the same family as the health check's AreaIcon.

export type FeatureIconId =
  | "attendance" | "rota" | "leave" | "records" | "rtw" | "expenses" | "reports"
  // LetFlows
  | "tenancies" | "rent" | "owners" | "maintenance" | "compliance" | "mtd" | "listings" | "dashboard"
  // General enquiry services
  | "web" | "branding" | "saas" | "marketing" | "mvp" | "ecommerce" | "support" | "software" | "other";

const TILE: Record<FeatureIconId, { bg: string; stroke: string }> = {
  attendance: { bg: "bg-gradient-to-b from-[#4BE07F] to-[#17A94A]", stroke: "#FFFFFF" },
  rota: { bg: "bg-gradient-to-b from-[#2B2F3B] to-[#0F1119]", stroke: "#FFFFFF" },
  leave: { bg: "bg-gradient-to-b from-[#FFE066] to-[#F5B400]", stroke: "#16181D" },
  records: { bg: "bg-gradient-to-b from-white to-[#ECEEF3] border border-white", stroke: "#1362FB" },
  rtw: { bg: "bg-gradient-to-br from-[#4D94FF] to-[#1433D6]", stroke: "#FFFFFF" },
  expenses: { bg: "bg-gradient-to-b from-white to-[#ECEEF3] border border-white", stroke: "#067A3E" },
  reports: { bg: "bg-gradient-to-br from-[#5C9BFF] to-[#1433D6]", stroke: "#FFFFFF" },
  tenancies: { bg: "bg-gradient-to-b from-[#F0704A] to-[#C4431E]", stroke: "#FFFFFF" },
  rent: { bg: "bg-gradient-to-b from-[#4BE07F] to-[#17A94A]", stroke: "#FFFFFF" },
  owners: { bg: "bg-gradient-to-b from-[#2B2F3B] to-[#0F1119]", stroke: "#FFFFFF" },
  maintenance: { bg: "bg-gradient-to-b from-white to-[#ECEEF3] border border-white", stroke: "#C4431E" },
  compliance: { bg: "bg-gradient-to-b from-[#FFE066] to-[#F5B400]", stroke: "#16181D" },
  mtd: { bg: "bg-gradient-to-b from-[#2B2F3B] to-[#0F1119]", stroke: "#FFC93C" },
  listings: { bg: "bg-gradient-to-b from-white to-[#ECEEF3] border border-white", stroke: "#16181D" },
  dashboard: { bg: "bg-gradient-to-br from-[#5C9BFF] to-[#1433D6]", stroke: "#FFFFFF" },
  web: { bg: "bg-gradient-to-br from-[#5C9BFF] to-[#1433D6]", stroke: "#FFFFFF" },
  branding: { bg: "bg-gradient-to-b from-[#FF8BB0] to-[#E0457B]", stroke: "#FFFFFF" },
  saas: { bg: "bg-gradient-to-b from-[#2B2F3B] to-[#0F1119]", stroke: "#5C9BFF" },
  marketing: { bg: "bg-gradient-to-b from-[#FFE066] to-[#F5B400]", stroke: "#16181D" },
  mvp: { bg: "bg-gradient-to-b from-[#B78CFF] to-[#7A3FF0]", stroke: "#FFFFFF" },
  ecommerce: { bg: "bg-gradient-to-b from-[#4BE07F] to-[#17A94A]", stroke: "#FFFFFF" },
  support: { bg: "bg-gradient-to-b from-white to-[#ECEEF3] border border-white", stroke: "#1362FB" },
  software: { bg: "bg-gradient-to-b from-[#F0704A] to-[#C4431E]", stroke: "#FFFFFF" },
  other: { bg: "bg-gradient-to-b from-white to-[#ECEEF3] border border-white", stroke: "#16181D" },
};

const PATHS: Record<FeatureIconId, React.ReactNode> = {
  attendance: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  rota: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h3M13.5 14h3M7.5 17h3" />
    </>
  ),
  leave: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  records: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <circle cx="12" cy="10" r="2.6" />
      <path d="M7.5 17c.8-2.2 2.5-3.2 4.5-3.2s3.7 1 4.5 3.2" />
    </>
  ),
  rtw: (
    <>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.8 7 9.5 4.1-1.7 7-5.3 7-9.5V6l-7-3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  expenses: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M14.5 8.2a2.3 2.3 0 0 0-4.3 1.1V14H15M9.2 11.5h4" />
    </>
  ),
  reports: <path d="M4 20h16M7 16.5V11M12 16.5V6M17 16.5v-8" />,
  tenancies: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8M16 7l2.5 2.5M14 9l2 2" />
    </>
  ),
  rent: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v.01M18 14.5v.01" />
    </>
  ),
  owners: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M16 6a3 3 0 0 1 0 5.6M17.5 14.6c1.6.6 2.6 2 3 4.4" />
    </>
  ),
  maintenance: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  compliance: (
    <>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.8 7 9.5 4.1-1.7 7-5.3 7-9.5V6l-7-3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  mtd: <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" />,
  listings: <path d="M4 10v4l3 .5L16 19V5L7 9.5 4 10ZM7 9.5v5M18.5 9a3.5 3.5 0 0 1 0 6" />,
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  web: (
    <>
      <rect x="2.5" y="4" width="19" height="14" rx="2.5" />
      <path d="M2.5 8h19M8 21h8M12 18v3" />
    </>
  ),
  branding: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.6-1.3-.6-2.1 0-.9.7-1.6 1.6-1.6H17a4.5 4.5 0 0 0 4-4.5C21 6.6 17 3 12 3Z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
  saas: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
  marketing: <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />,
  mvp: <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.8-.8.8-2.1 0-2.9a2.1 2.1 0 0 0-3 0ZM12 15l-3-3a15 15 0 0 1 9-9c1.1 0 3 1.9 3 3a15 15 0 0 1-9 9ZM9 12H5s.5-3 2-4c1.6-1.1 5 0 5 0M12 15v4s3-.5 4-2c1.1-1.6 0-5 0-5" />,
  ecommerce: (
    <>
      <path d="M3 4h2.5l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2" />
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </>
  ),
  support: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </>
  ),
  software: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
      <path d="M17 3.5v7M13.5 7h7M3.5 17h7" />
    </>
  ),
  other: (
    <>
      <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12Z" />
      <path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.6-2.4 2.2-2.4 2.2M12 15.5h.01" />
    </>
  ),
};

export function FeatureIcon({ icon, size = 64, className = "" }: { icon: FeatureIconId; size?: number; className?: string }) {
  const t = TILE[icon];
  return (
    <span
      className={`glossy inline-flex shrink-0 items-center justify-center ${t.bg} ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" style={{ width: size * 0.52, height: size * 0.52 }} fill="none" stroke={t.stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        {PATHS[icon]}
      </svg>
    </span>
  );
}
