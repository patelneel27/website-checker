// All LetFlows showcase copy lives here so it's easy to edit. UK English throughout.
// Features are taken from LetFlows' own site config (letlfows/src/config/site.ts), which is the
// product's source of truth. Safe to import on the client and the server.

import type { LiveEvent, LiveTile } from "@/components/LiveDisplay";

export const PRODUCT = "LetFlows";
export const WEBSITE_LABEL = "letflows.com";

// Brand note: LetFlows is a whole-property platform, not just a lettings tool (buying and
// selling are on the way), so the copy never pitches it as "lettings". "Let" is used as a
// verb: let it flow.

/**
 * Making Tax Digital is a LetFlows feature, so it's shown. Set to false to hide every MTD
 * option, card and form question (the MTD slide is then replaced by Listings).
 */
export const SHOW_MTD = true;

export const WELCOME = {
  /** The first line flips through everything LetFlows handles; each lands on "In flow." */
  rotating: ["Rent.", "Repairs.", "Tenancies.", "Tax.", "Listings.", "Sales."],
  headline: ["Everything property,", "In flow."],
  tagline: "All your properties, one platform.",
  subline: "Rent, repairs, compliance and tax flowing in one place, with buying and selling coming next.",
  cta: "See what LetFlows does",
  builtBy: "Built by Sterlixit · letflows.com",
};

// ---- LetFlows Live (coming soon) ----------------------------------------------------------------

export const LIVE = {
  title: ["LetFlows", "Live."] as [string, string],
  text: "A live display made only for LetFlows customers. Put it on the office TV, an iPad or your phone, and watch every property update by itself every minute: rent arriving, repairs moving, certificates renewed.",
  points: ["Updates every minute", "Office TV, iPad or phone", "Only for LetFlows customers"],
  greeting: "Good morning",
  place: "Your portfolio · 14 homes",
  jump: "New: LetFlows Live · take the tour",
};

export const LIVE_TILES: LiveTile[] = [
  { id: "rent", icon: "rent", label: "Rent this month", value: "£18,450", sub: "of £19,600 · 94%", on: true },
  { id: "arrears", icon: "dashboard", label: "Arrears", value: "1 tenant", sub: "Flat 3 · retry 4 Dec", on: false },
  { id: "repairs", icon: "maintenance", label: "Repairs", value: "3 open", sub: "1 awaiting bids", on: false },
  { id: "certs", icon: "compliance", label: "Certificates", value: "All valid", sub: "Next: Gas Safety", on: true },
  { id: "listings", icon: "listings", label: "Listings", value: "2 live", sub: "128 views today", on: true },
  { id: "tax", icon: "mtd", label: "Tax (MTD)", value: "Q2 ready", sub: "Due 5 Feb", on: false },
];

export const LIVE_EVENTS: LiveEvent[] = [
  { tile: "rent", value: "£19,075", sub: "of £19,600 · 97%", on: true, toast: "£625 received · 7 Mill Lane" },
  { tile: "repairs", value: "2 open", sub: "Kitchen tap fixed", on: false, toast: "Repair done · 14 Albert Terrace" },
  { tile: "arrears", value: "All paid", sub: "Flat 3 paid on retry", on: true, toast: "Flat 3 rent collected on retry" },
  { tile: "listings", value: "2 live", sub: "211 views today", on: true, toast: "New viewing request · 3 Canal Wharf" },
  { tile: "certs", value: "Booked", sub: "Gas Safety · Thu 10:00", on: true, toast: "Engineer booked · Gas Safety" },
  { tile: "tax", value: "Sent", sub: "HMRC receipt 8F2K", on: true, toast: "Q2 update sent to HMRC" },
  { tile: "rent", value: "£19,600", sub: "All rent in · 100%", on: true, toast: "Last rent in · 22 Quay Street" },
];

export type LfFeatureId = "tenancies" | "rent" | "owners" | "maintenance" | "compliance" | "mtd" | "listings";

export type LfFeature = {
  id: LfFeatureId;
  title: string;
  benefit: string;
  bullets: [string, string, string];
  media?: { type: "image" | "video"; src: string; alt: string };
};

const MTD_FEATURE: LfFeature = {
  id: "mtd",
  title: "Making Tax Digital",
  benefit: "Get ready for Making Tax Digital for Income Tax.",
  bullets: ["Income and expenses kept digitally", "Quarterly updates built from your ledger", "Submitted to HMRC from inside LetFlows"],
  media: { type: "image", src: "/letflows/mtd.jpg", alt: "LetFlows quarterly property income and a Making Tax Digital update submitted to HMRC" },
};

const LISTINGS_FEATURE: LfFeature = {
  id: "listings",
  title: "Listings",
  benefit: "Listed on Rightmove and Zoopla in one click.",
  bullets: ["Publish to the major portals at once", "Updates and withdrawals sync automatically", "See views from the first hour"],
  media: { type: "image", src: "/letflows/listings.jpg", alt: "LetFlows listing published live on Rightmove, Zoopla and your website" },
};

export const FEATURES: LfFeature[] = [
  {
    id: "tenancies",
    title: "Tenants & tenancies",
    benefit: "Tenant details and tenancy dates, always up to date.",
    bullets: ["Tenancies signed and deposits protected with TDS", "Start, end and renewal dates tracked", "Tenancy documents stored securely"],
    media: { type: "image", src: "/letflows/tenancies.jpg", alt: "LetFlows tenancy signed, deposit protected with TDS and move-in tasks done" },
  },
  {
    id: "rent",
    title: "Rent collection",
    benefit: "See who's paid, who's late and what's due.",
    bullets: ["Rent collected by Direct Debit", "Failed payments flagged the same day", "Reconciled for you automatically"],
    media: { type: "image", src: "/letflows/rent.jpg", alt: "LetFlows rent run showing paid and failed payments for each property" },
  },
  {
    id: "owners",
    title: "Landlord statements",
    benefit: "Statements and payouts that build themselves.",
    bullets: ["Monthly statements generated automatically", "Fees and repair costs worked out for you", "Payouts visible in the owner portal"],
    media: { type: "image", src: "/letflows/owners.jpg", alt: "LetFlows landlord statement with rent, fees and repairs, and the payout sent" },
  },
  {
    id: "maintenance",
    title: "Maintenance",
    benefit: "Log repairs and track every job.",
    bullets: ["Tenants report issues with photos", "Contractors bid, you pick the best quote", "Track each job to done"],
    media: { type: "image", src: "/letflows/maintenance.jpg", alt: "LetFlows repair reported by a tenant with three contractor bids" },
  },
  {
    id: "compliance",
    title: "Compliance certificates",
    benefit: "Never miss a gas safety, EICR or EPC renewal.",
    bullets: ["All certificates in one place", "Reminders before expiry", "Engineers booked, certificates filed"],
    media: { type: "image", src: "/letflows/compliance.jpg", alt: "LetFlows compliance list with gas safety, EICR, EPC and Right to Rent" },
  },
  SHOW_MTD ? MTD_FEATURE : LISTINGS_FEATURE,
];

// ---- Step 3: about your properties --------------------------------------------------------------

export const ROLES = ["Landlord", "Letting agent", "Property manager", "Other"] as const;
export const PROPERTY_BANDS = ["1", "2–5", "6–20", "21–100", "100+"] as const;
const ALL_HEADACHES = [
  "Chasing rent",
  "Repairs and maintenance",
  "Certificate renewals",
  "Tenant paperwork",
  "Tax and Making Tax Digital",
  "Keeping track in spreadsheets",
] as const;
export const HEADACHES_ALL = ALL_HEADACHES;
export const HEADACHES = SHOW_MTD ? ALL_HEADACHES : ALL_HEADACHES.filter((h) => h !== "Tax and Making Tax Digital");

export type Role = (typeof ROLES)[number];
export type PropertyBand = (typeof PROPERTY_BANDS)[number];
export type Headache = (typeof ALL_HEADACHES)[number];

export const ABOUT = {
  eyebrow: "About your properties",
  headline: ["Tell us about", "your properties."],
  subline: "Three quick taps and we'll show how LetFlows would fit.",
  role: "I'm a…",
  properties: "How many properties?",
  headaches: "What's the biggest headache?",
  headachesHint: "Pick any",
  cta: "Show my results",
  needed: "Choose your role and number of properties first.",
};

// ---- Step 4: your result ----------------------------------------------------------------------

export type LfCardId = "rent" | "maintenance" | "compliance" | "tenancies" | "mtd" | "dashboard";

export const RESULT_CARDS: Record<LfCardId, { title: string; text: string }> = {
  rent: { title: "Rent tracking", text: "See who's paid and who's late at a glance, with arrears flagged early." },
  maintenance: { title: "Maintenance", text: "Every repair logged, assigned and tracked to done." },
  compliance: { title: "Compliance", text: "Gas safety, EICR and EPC dates in one place, with reminders before they expire." },
  tenancies: { title: "Tenancies", text: "Tenant details, dates and documents stored securely in one place." },
  mtd: { title: "Making Tax Digital", text: "Income and expenses kept digitally, ready for HMRC." },
  dashboard: { title: "One dashboard", text: "Your whole portfolio in one place, instead of spreadsheets." },
};

export const HEADACHE_TO_CARD: Record<Headache, LfCardId> = {
  "Chasing rent": "rent",
  "Repairs and maintenance": "maintenance",
  "Certificate renewals": "compliance",
  "Tenant paperwork": "tenancies",
  "Tax and Making Tax Digital": "mtd",
  "Keeping track in spreadsheets": "dashboard",
};

export const DEFAULT_CARDS: LfCardId[] = ["rent", "compliance", "maintenance"];

export const RESULT = {
  eyebrow: "Your LetFlows result",
  growing: "Built to handle a growing portfolio, with reports across every property.",
  agents: "Manage properties for several landlords from one account.",
  nextTitle: "What happens next",
  next: ["Register for your free demo (one minute)", "We set up LetFlows with a couple of your properties", "A short live demo, using a set-up like yours"],
  cta: "Book my free demo",
  again: "See the features again",
};

// ---- Step 5: the form ---------------------------------------------------------------------------

export const MTD_OPTIONS = ["Yes, from April 2026", "Yes, from 2027 or later", "Not sure", "No"] as const;
export const CURRENT_SOLUTIONS = ["Spreadsheets/paper", "Another property software", "An agent manages it", "Nothing yet"] as const;
export const TIMEFRAMES = ["Now", "In 1–3 months", "Just researching"] as const;
export type MtdOption = (typeof MTD_OPTIONS)[number];
export type CurrentSolution = (typeof CURRENT_SOLUTIONS)[number];
export type Timeframe = (typeof TIMEFRAMES)[number];

/** Sent to Zoho when the company field is left blank. */
export const PRIVATE_LANDLORD = "Private landlord";

export const FORM = {
  eyebrow: "Register for a demo",
  headline: ["Book your", "free demo."],
  subline: "We'll set up LetFlows with a couple of your properties and show you round.",
  consent:
    "I'd like Sterlixit (Sterlix IT Ltd) to contact me about a LetFlows demo and send me related information. I can unsubscribe at any time.",
  submit: "Register for my demo",
  mtdHint: "Making Tax Digital for Income Tax started in April 2026 for landlords with qualifying income over £50,000. Check HMRC's guidance for your situation.",
};

// ---- Step 6: thank you --------------------------------------------------------------------------

export const THANKS = {
  headline: ["You’re on", "the list."],
  text: "We'll email you within 2 working days to set up your LetFlows demo.",
  qrTitle: "Pick a time now",
  qrText: "Scan with your phone camera to book your demo straight away.",
  back: "Back to start",
  returnAfterS: 20,
};
