// Shared types used by the API routes, the kiosk UI and the report email.

export const CATEGORY_KEYS = [
  "performance",
  "seo",
  "accessibility",
  "best-practices",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/** Lighthouse category scores, 0–100. `null` when PageSpeed couldn't score it. */
export type Scores = Record<CategoryKey, number | null>;

export type Metrics = {
  /** Largest Contentful Paint, milliseconds */
  lcpMs: number | null;
  /** Cumulative Layout Shift, unitless */
  cls: number | null;
  /** Total Blocking Time, milliseconds */
  tbtMs: number | null;
};

export type QuickWin = {
  id: string;
  /** Plain-English problem, shown to the visitor */
  title: string;
  /** One sentence on what Sterlix would do about it (used in the email) */
  fix: string;
  category: CategoryKey | "checks";
};

export type CheckResult = {
  id: string;
  label: string;
  pass: boolean;
  message: string;
};

/** What the visitor's site looks like at a glance (shown at the top of the results). */
export type SiteInfo = {
  title: string | null;
  /** Favicon as a small PNG/ICO/SVG data URI, or null if the site has none. */
  favicon: string | null;
};

/** On-page SEO details, like the Ahrefs toolbar shows. */
export type SeoDetails = {
  title: string | null;
  description: string | null;
  canonical: string | null;
  lang: string | null;
  robots: string | null;
  headings: { h1: number; h2: number; h3: number; firstH1: string | null };
  wordCount: number;
  links: { internal: number; external: number };
  images: { total: number; missingAlt: number };
  social: {
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    /** null when there's no og:image to test */
    ogImageWorks: boolean | null;
    ogSiteName: string | null;
    ogType: string | null;
    twitterCard: string | null;
    twitterImage: string | null;
  };
  schema: { types: string[]; formats: string[]; invalidJsonLd: number };
};

export type PsiStatus = "pending" | "done" | "failed";

export type ScanResult = {
  id: string;
  url: string;
  site: SiteInfo;
  seo: SeoDetails | null;
  scores: Scores | null;
  metrics: Metrics | null;
  quickWins: QuickWin[];
  checks: CheckResult[];
  psiStatus: PsiStatus;
  summary: string;
  scannedAt: string;
  /** Signed copy of the scan, sent back with the lead form. */
  token?: string;
  /** True when this came from an earlier scan of the same site. */
  cached?: boolean;
};

export type ScanErrorCode = "invalid_url" | "unreachable" | "rate_limited" | "server_error";

export type ScanErrorResponse = { error: ScanErrorCode; message: string };

export const INTERESTS = ["Website", "Branding", "SaaS", "Marketing", "Just curious"] as const;
export type Interest = (typeof INTERESTS)[number];

/** Config the server hands to the kiosk at request time. */
export type KioskConfig = {
  /** Booking page with UTM tags for the QR code */
  bookingQrUrl: string;
  /** Booking page with UTM tags for the on-screen button */
  bookingButtonUrl: string;
  privacyUrl: string;
  eventName: string;
  demoUrl: string;
};
