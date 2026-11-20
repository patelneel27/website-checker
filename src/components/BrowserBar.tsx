/** Glossy browser address bar: holds the URL input, and shows the site while scanning. */
export function BrowserBar({ children, state = "idle" }: { children: React.ReactNode; state?: "idle" | "error" | "busy" }) {
  return (
    <div
      className={`glossy flex h-24 items-center gap-4 rounded-[1.8rem] border-2 bg-gradient-to-b from-white to-[#F6F7F9] px-5 transition-[border-color,box-shadow] ${
        state === "error" ? "border-poor" : "border-white focus-within:border-brand"
      }`}
    >
      <span className="hidden shrink-0 gap-1.5 sm:flex" aria-hidden="true">
        <span className="h-3.5 w-3.5 rounded-full bg-[#FF5F57]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[#28C840]" />
      </span>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F8EE] text-good-text"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        </svg>
      </span>
      <div className="flex min-w-0 flex-1 items-baseline">{children}</div>
      {state === "busy" && (
        <span className="h-8 w-8 shrink-0 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand" aria-hidden="true" />
      )}
    </div>
  );
}
