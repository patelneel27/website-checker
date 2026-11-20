"use client";

// The kiosk's two button styles, used on every screen so they feel like one product:
// - TactileButton: the main action. Dark key in a recessed tray, blue corner, lifts on hover.
// - PillButton: secondary actions (Back, Close, Start again). Soft white pill.

type TactileProps = { children: React.ReactNode; className?: string } & (
  | { href: string; onClick?: never; type?: never; disabled?: never; /** Default true: opens a new tab (external links). */ newTab?: boolean }
  | { href?: never; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }
);

export function TactileButton({ children, className = "", ...rest }: TactileProps) {
  const inner = (
    <>
      <span className="tactile-sheen" aria-hidden="true" />
      <span className="tactile-label relative flex items-center">
        {children}
        <span className="tactile-arrow text-right" aria-hidden="true">
          →
        </span>
      </span>
      <span
        className="tactile-corner absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-[#4D94FF] to-[#1362FB]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 12 12"
          className="tactile-corner-arrow absolute top-2 right-2 h-3.5 w-3.5"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9 9 3M4.5 3H9v4.5" />
        </svg>
      </span>
    </>
  );
  const cls =
    "tactile relative flex h-[5.5rem] w-full items-center justify-center overflow-hidden rounded-[1.2rem] bg-gradient-to-b from-[#2E313A] to-[#15171D] text-2xl font-bold text-white";

  return (
    <div className={`rounded-[1.6rem] border border-black/5 bg-tray p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] ${className}`}>
      {"href" in rest && rest.href ? (
        <a href={rest.href} {...((rest as { newTab?: boolean }).newTab === false ? {} : { target: "_blank", rel: "noopener noreferrer" })} className={cls}>
          {inner}
        </a>
      ) : (
        <button
          type={(rest as { type?: "button" | "submit" }).type ?? "button"}
          onClick={(rest as { onClick?: () => void }).onClick}
          disabled={(rest as { disabled?: boolean }).disabled}
          className={cls}
        >
          {inner}
        </button>
      )}
    </div>
  );
}

const PILL_ICONS = {
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  restart: <path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
} as const;

/** Soft white pill for secondary actions. The icon nudges on hover. */
export function PillButton({
  children,
  onClick,
  icon,
  iconSide = icon === "arrow" ? "right" : "left",
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: keyof typeof PILL_ICONS;
  iconSide?: "left" | "right";
  className?: string;
  type?: "button" | "submit";
}) {
  const svg = icon && (
    <svg
      viewBox="0 0 24 24"
      className={`pill-icon h-5 w-5 shrink-0 ${iconSide === "left" ? "pill-icon-left" : "pill-icon-right"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PILL_ICONS[icon]}
    </svg>
  );
  return (
    <button type={type} onClick={onClick} className={`pill ${className}`}>
      {iconSide === "left" && svg}
      {children}
      {iconSide === "right" && svg}
    </button>
  );
}

/** Glossy round status badge: green tick or amber "!". */
export function CheckBadge({ pass = true, size = "md" }: { pass?: boolean; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-24 w-24" : size === "md" ? "h-9 w-9" : "h-7 w-7";
  const icon = size === "lg" ? "h-12 w-12" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${dim} ${
        pass ? "bg-gradient-to-b from-[#4BE07F] to-[#17A94A]" : "bg-gradient-to-b from-[#FFC24D] to-[#F08C00]"
      } shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.12),0_4px_10px_-3px_rgba(10,19,66,0.35)]`}
    >
      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {pass ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M12 6v7.5M12 18h.01" />}
      </svg>
    </span>
  );
}

/** Selectable chip: white when off, dark with a green tick when on (like the lead form). */
export function ChoiceChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex min-h-14 items-center gap-2 rounded-full border px-6 text-lg font-semibold transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.96] ${
        on
          ? "border-transparent bg-gradient-to-b from-[#2E313A] to-[#15171D] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_14px_-6px_rgba(0,0,0,0.5)]"
          : "border-black/[0.06] bg-white text-coal shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
      }`}
    >
      {on && (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#5CE58F]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      )}
      {children}
    </button>
  );
}
