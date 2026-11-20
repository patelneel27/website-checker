// All StaffMain showcase copy lives here so it's easy to edit. UK English throughout.
// Safe to import on the client and the server.

import type { LiveEvent, LiveTile } from "@/components/LiveDisplay";

export const PRODUCT = "StaffMain";
export const WEBSITE_LABEL = "staffmain.sterlixit.co.uk";

export const WELCOME = {
  headline: ["HR made", "simple."],
  subline: "People, leave, rota and attendance in one place.",
  cta: "See what StaffMain does",
  builtBy: "Built by Sterlixit",
};

// ---- StaffMain Live (coming soon) ---------------------------------------------------------------

export const LIVE = {
  title: ["StaffMain", "Live."] as [string, string],
  text: "A live display made only for StaffMain customers. Put it on the office TV, an iPad or your phone, and see who's in, who's on a break and who's off, updating by itself every minute.",
  points: ["Updates every minute", "Office TV, iPad or phone", "Only for StaffMain customers"],
  greeting: "Good morning",
  place: "Your team · 3 sites",
  jump: "New: StaffMain Live · take the tour",
};

export const LIVE_TILES: LiveTile[] = [
  { id: "london", icon: "attendance", label: "London office", value: "12 / 14 in", sub: "2 on the way", on: true },
  { id: "manchester", icon: "attendance", label: "Manchester", value: "8 / 9 in", sub: "1 on the way", on: true },
  { id: "break", icon: "rota", label: "On a break", value: "2", sub: "Back by 13:30", on: false },
  { id: "leave", icon: "leave", label: "Off today", value: "Priya", sub: "Annual leave", on: false },
  { id: "late", icon: "records", label: "Late today", value: "1", sub: "Dan · 09:14", on: false },
  { id: "rtw", icon: "rtw", label: "Right to work", value: "All valid", sub: "Next check in 60 days", on: true },
];

export const LIVE_EVENTS: LiveEvent[] = [
  { tile: "manchester", value: "9 / 9 in", sub: "Everyone's here", on: true, toast: "Tom Fielding clocked in · Manchester" },
  { tile: "break", value: "1", sub: "Back by 13:30", on: false, toast: "Amira is back from her break" },
  { tile: "london", value: "13 / 14 in", sub: "1 on the way", on: true, toast: "Sam clocked in by QR · London" },
  { tile: "rtw", value: "1 due", sub: "Sam's visa · 30 days", on: false, toast: "Reminder sent: Sam's visa check" },
  { tile: "leave", value: "Priya, Ella", sub: "Annual leave", on: false, toast: "Ella's holiday approved" },
  { tile: "london", value: "14 / 14 in", sub: "Everyone's here", on: true, toast: "Dan clocked in · London" },
];

export type FeatureId = "attendance" | "rota" | "leave" | "records" | "expenses" | "reports";

export type Feature = {
  id: FeatureId;
  title: string;
  benefit: string;
  bullets: [string, string, string];
  /**
   * Real screenshot or short screen recording in /public/staffmain/. Without one, the slide shows
   * a drawn preview of the screen. Videos play muted on a loop.
   */
  media?: { type: "image" | "video"; src: string; alt: string };
};

export const FEATURES: Feature[] = [
  {
    id: "attendance",
    title: "Live attendance",
    benefit: "See who's in, right now, across every site.",
    bullets: ["Clock in by QR, NFC, location or IP", "Live board for every location", "Late and missed clock-ins flagged"],
    media: { type: "image", src: "/staffmain/attendance.jpg", alt: "StaffMain attendance board with clock-in and clock-out times for each employee" },
  },
  {
    id: "rota",
    title: "Weekly rota",
    benefit: "Build the week's rota in minutes, not hours.",
    bullets: ["Drag-and-drop shifts", "Copy last week in one tap", "Staff see their rota on their phone"],
    media: { type: "image", src: "/staffmain/rota.jpg", alt: "StaffMain weekly rota with office, client site, WFH and holiday shifts" },
  },
  {
    id: "leave",
    title: "Leave & bank holidays",
    benefit: "Holiday requests approved in a tap.",
    bullets: ["Entitlements worked out for you", "UK bank holidays built in", "Team calendar shows who's off"],
    media: { type: "image", src: "/staffmain/leave.jpg", alt: "StaffMain leave requests with pending, approved and rejected requests" },
  },
  {
    id: "records",
    title: "Employee records & documents",
    benefit: "Every employee and document in one secure place.",
    bullets: ["Personal and job details", "Contracts and documents stored securely", "Right-to-work checks with expiry reminders"],
    media: { type: "image", src: "/staffmain/records.jpg", alt: "StaffMain employee profile with employment details and documents tab" },
  },
  // NOTE: no expenses module was found in the StaffMain code, so this slide still shows a drawn
  // preview. Confirm the feature, or swap this slide for the real payroll report
  // (/staffmain/payroll.jpg is ready).
  {
    id: "expenses",
    title: "Expenses",
    benefit: "Expenses submitted, approved and tracked.",
    bullets: ["Staff upload receipts", "Managers approve on the go", "Clear totals for payroll"],
  },
  {
    id: "reports",
    title: "Reports & multi-company",
    benefit: "Clear reports, for one company or several.",
    bullets: ["Hours, leave and attendance reports", "Several companies or branches in one account", "Export when you need it"],
    media: { type: "image", src: "/staffmain/reports.jpg", alt: "StaffMain reports hub: employee, leave, rota, attendance, branch and payroll reports" },
  },
];

// ---- Step 3: about your business ----------------------------------------------------------------

export const EMPLOYEE_BANDS = ["1–10", "11–50", "51–200", "201–500", "500+"] as const;
export const SITE_BANDS = ["1", "2–5", "6–20", "20+"] as const;
export const MOST_TIME = [
  "Rotas",
  "Holiday requests",
  "Tracking attendance",
  "Right-to-work checks",
  "Expenses",
  "Paperwork and records",
  "Reports",
] as const;

export type EmployeeBand = (typeof EMPLOYEE_BANDS)[number];
export type SiteBand = (typeof SITE_BANDS)[number];
export type MostTime = (typeof MOST_TIME)[number];

export const ABOUT = {
  headline: ["Tell us about", "your business."],
  subline: "Three quick taps and we'll show how StaffMain would fit.",
  employees: "How many employees?",
  sites: "How many sites or branches?",
  mostTime: "What takes the most time today?",
  mostTimeHint: "Pick any",
  cta: "Show my results",
};

// ---- Step 4: your result ----------------------------------------------------------------------

export type ResultCardId = "rota" | "leave" | "attendance" | "rtw" | "expenses" | "records" | "reports";

export const RESULT_CARDS: Record<ResultCardId, { title: string; text: string }> = {
  rota: { title: "Weekly rota", text: "Build and share the rota in minutes; staff see it on their phone." },
  leave: { title: "Leave", text: "Requests and approvals in one tap, with entitlements and bank holidays worked out for you." },
  attendance: { title: "Live attendance", text: "See who's in across every site, with QR, NFC, location or IP clock-in." },
  rtw: { title: "Right-to-work", text: "Documents stored securely, with reminders before anything expires." },
  expenses: { title: "Expenses", text: "Receipts uploaded by staff, approved by managers, totals ready for payroll." },
  records: { title: "Employee records", text: "Every person, contract and document in one secure place." },
  reports: { title: "Reports", text: "Hours, leave and attendance reports in a click." },
};

/** Which card each "most time" answer maps to. */
export const MOST_TIME_TO_CARD: Record<MostTime, ResultCardId> = {
  Rotas: "rota",
  "Holiday requests": "leave",
  "Tracking attendance": "attendance",
  "Right-to-work checks": "rtw",
  Expenses: "expenses",
  "Paperwork and records": "records",
  Reports: "reports",
};

/** Used to fill up to three cards when fewer were picked. */
export const DEFAULT_CARDS: ResultCardId[] = ["attendance", "rota", "leave"];

export const RESULT = {
  eyebrow: "Your StaffMain result",
  nextTitle: "What happens next",
  next: [
    "Register for your free demo (one minute)",
    "We set up a StaffMain account for your team",
    "A short live demo, built around how you work",
  ],
  multiSite: (sites: string) => `All ${sites} sites in one account, with a live view of each.`,
  bigTeam: "Managers get their own team view, so HR isn't the bottleneck.",
  cta: "Book my free demo",
  again: "See the features again",
};

// ---- Step 5: the form ---------------------------------------------------------------------------

export const CURRENT_SOLUTIONS = ["Spreadsheets/paper", "Another HR system", "Nothing yet"] as const;
export const TIMEFRAMES = ["Now", "In 1–3 months", "Just researching"] as const;
export type CurrentSolution = (typeof CURRENT_SOLUTIONS)[number];
export type Timeframe = (typeof TIMEFRAMES)[number];

export const FORM = {
  eyebrow: "Register for a demo",
  headline: ["Book your", "free demo."],
  subline: "We'll set up a StaffMain account and a short live demo around how your team works.",
  consent:
    "I'd like Sterlixit (Sterlix IT Ltd) to contact me about a StaffMain demo and send me related information. I can unsubscribe at any time.",
  submit: "Register for my demo",
};

// ---- Step 6: thank you --------------------------------------------------------------------------

export const THANKS = {
  headline: ["You’re on", "the list."],
  text: "We'll email you within 2 working days to set up your StaffMain demo.",
  qrTitle: "Pick a time now",
  qrText: "Scan with your phone camera to book your demo straight away.",
  back: "Back to start",
  /** Kiosk returns to the event home after this long. */
  returnAfterS: 20,
};
