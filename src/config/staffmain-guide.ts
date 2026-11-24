// The full StaffMain feature list, shown in staff mode ("StaffMain guide" tab) so the team can
// answer "does it do…?" or turn the tablet round and let a visitor read it. UK English, plain words.

import type { FeatureIconId } from "@/components/staffmain/FeatureIcon";

export type GuideSection = { icon: FeatureIconId; title: string; summary: string; points: string[] };

export const GUIDE_INTRO = {
  title: "Everything StaffMain does",
  text: "HR for teams in one place: people, leave, rota, attendance and reports, for one company or several.",
};

/** Industries StaffMain is set up for. */
export const GUIDE_INDUSTRIES = ["Construction", "Restaurants", "Cafes", "Shops and stores", "Hospitality", "Tuition"];

/** StaffMain renames its screens to fit the business. Tuition is the main example. */
export const GUIDE_WORDS: { everyone: string; tuition: string }[] = [
  { everyone: "Employees", tuition: "Students" },
  { everyone: "Sites", tuition: "Classes" },
  { everyone: "Site managers", tuition: "Class teachers" },
  { everyone: "Assigned employees", tuition: "Enrolments" },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    icon: "dashboard",
    title: "Dashboard",
    summary: "The whole business at a glance.",
    points: ["Overview, summary and stats", "Charts, cards and boards", "Quick view of who's in and what needs doing"],
  },
  {
    icon: "multisite",
    title: "Multi-company",
    summary: "Several companies or branches in one account.",
    points: ["Create as many companies or branches as you need", "Switch between them in a tap", "Reports for each one, or all together"],
  },
  {
    icon: "leave",
    title: "Leave management",
    summary: "Set it up your way, then approve in a tap.",
    points: [
      "Choose the month your leave year starts",
      "Pick your leave types, or create your own",
      "Entitlements for all staff",
      "Requests approved or rejected in a tap",
      "Holiday calendar, with carry-over into next year",
      "Bank holidays for England & Wales, Scotland and Northern Ireland, live from GOV.UK",
      "Leave dashboard with stats, charts and cards",
    ],
  },
  {
    icon: "records",
    title: "Office staff",
    summary: "Every person and document in one secure place.",
    points: [
      "Right-to-work checks, with reminders before they expire",
      "Staff details: overview, edit and documents",
      "Password management with two-factor login (2FA)",
      "Each person's leave and login sessions",
      "Former employees' records kept after they leave",
    ],
  },
  {
    icon: "attendance",
    title: "Attendance",
    summary: "Clock in by NFC tag, QR code or location.",
    points: [
      "Rules for clocking in and out, and working hours",
      "Clock-in locations, with rules for each location",
      "Secure NFC tags, bought straight through StaffMain",
      "Reports on where and when people clock in",
      "Live attendance you can filter and correct",
      "Every change logged: who changed it, when, and for whom",
    ],
  },
  {
    icon: "rota",
    title: "Weekly rota",
    summary: "Build the week, and see every change.",
    points: ["Shift categories you create and pick in the rota", "Compare changes: who changed what, and when", "Staff see their rota on their phone"],
  },
  {
    icon: "reports",
    title: "Reports and payroll",
    summary: "The numbers payroll needs, without the spreadsheet.",
    points: ["Filter attendance by person, site or date", "Total hours and break hours", "Payroll-ready reports"],
  },
  {
    icon: "expenses",
    title: "Running the business",
    summary: "The rest of HR, in the same place.",
    points: ["Expenses", "Departments", "Announcements", "Policies", "Audit log of every change", "Media and file management"],
  },
  {
    icon: "settings",
    title: "Your settings",
    summary: "Make StaffMain look and sound like you.",
    points: [
      "Your branding",
      "Your own words for things (e.g. Students instead of Employees)",
      "Your own forms",
      "Your own domain",
      "Send emails from your own email address",
      "Permissions: choose who sees and changes what",
      "Your plan",
    ],
  },
];
