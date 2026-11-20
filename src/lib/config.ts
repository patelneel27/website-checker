import "server-only";
import { createHash } from "node:crypto";

// Central place for environment variables. See .env.example for what each one does.

const env = (k: string, fallback = "") => (process.env[k] ?? fallback).trim();

export const config = {
  psiApiKey: env("PSI_API_KEY"),

  smtp: {
    host: env("SMTP_HOST"),
    port: Number(env("SMTP_PORT", "465")),
    secure: env("SMTP_SECURE", "true") !== "false",
    user: env("SMTP_USER"),
    password: env("SMTP_PASSWORD"),
  },
  emailFrom: env("EMAIL_FROM", "Sterlixit <hello@sterlixit.co.uk>"),
  emailReplyTo: env("EMAIL_REPLY_TO", "hello@sterlixit.co.uk"),

  zoho: {
    clientId: env("ZOHO_CLIENT_ID"),
    clientSecret: env("ZOHO_CLIENT_SECRET"),
    refreshToken: env("ZOHO_REFRESH_TOKEN"),
    accountsUrl: env("ZOHO_ACCOUNTS_URL", "https://accounts.zoho.in").replace(/\/$/, ""),
    apiDomain: env("ZOHO_API_DOMAIN", "https://www.zohoapis.in").replace(/\/$/, ""),
    leadModule: env("ZOHO_LEAD_MODULE", "Leads"),
  },

  /** Local JSON backup of every lead, so nothing is lost if Zoho is unreachable. */
  leadsFile: env("LEADS_FILE", "data/leads.json"),
  /** Recent scans, so repeat checks of the same site are instant (even after a restart). */
  scansFile: env("SCANS_FILE", "data/scans.json"),

  staffPin: env("STAFF_PIN"),
  bookingUrl: env("BOOKING_URL", "https://www.sterlixit.co.uk/book-free-strategy-call"),
  privacyUrl: env("PRIVACY_URL", "https://www.sterlixit.co.uk/legal/privacy-policy"),
  eventName: env("EVENT_NAME", "Event"),
  demoUrl: "sterlixit.co.uk",
  utmSource: env("UTM_SOURCE", "website-health-check"),
  /** Defaults to the event name as a slug, e.g. "business-show-2026". */
  utmCampaign: env("UTM_CAMPAIGN"),

  staffmain: {
    /** StaffMain demo requests (local backup; Zoho is the system of record). */
    leadsFile: env("STAFFMAIN_LEADS_FILE", "data/staffmain-leads.json"),
    websiteUrl: env("STAFFMAIN_URL", "https://staffmain.sterlixit.co.uk"),
    /** Booking page for demos. Defaults to the main booking page. */
    bookingUrl: env("STAFFMAIN_BOOKING_URL") || env("BOOKING_URL", "https://www.sterlixit.co.uk/book-free-strategy-call"),
    /** Default "create your password" link for the account-ready email (staff can change it per lead). */
    signupUrl: env("STAFFMAIN_SIGNUP_URL", "https://staffmain.sterlixit.co.uk"),
    utmSource: env("STAFFMAIN_UTM_SOURCE", "staffmain-showcase"),
  },

  letflows: {
    /** LetFlows demo requests (local backup; Zoho is the system of record). */
    leadsFile: env("LETFLOWS_LEADS_FILE", "data/letflows-leads.json"),
    websiteUrl: env("LETFLOWS_URL", "https://letflows.com"),
    /** Booking page for demos. Defaults to the main booking page. */
    bookingUrl: env("LETFLOWS_BOOKING_URL") || env("BOOKING_URL", "https://www.sterlixit.co.uk/book-free-strategy-call"),
    /** Default "create your password" link for the account-ready email (staff can change it per lead). */
    signupUrl: env("LETFLOWS_SIGNUP_URL", "https://app.letflows.com"),
    utmSource: env("LETFLOWS_UTM_SOURCE", "letflows-showcase"),
  },

  enquiry: {
    /** General enquiries (local backup; Zoho is the system of record). */
    leadsFile: env("ENQUIRY_LEADS_FILE", "data/enquiry-leads.json"),
    utmSource: env("ENQUIRY_UTM_SOURCE", "general-enquiry"),
  },

  /**
   * Optional custom Zoho fields, all in one place. Leave blank to keep everything in the Lead's
   * description, tags and notes (works with a standard Zoho set-up).
   */
  zohoFields: {
    product: env("ZOHO_FIELD_PRODUCT"),
    employees: env("ZOHO_FIELD_EMPLOYEES"),
    sites: env("ZOHO_FIELD_SITES"),
    mostTime: env("ZOHO_FIELD_MOST_TIME"),
    currentSolution: env("ZOHO_FIELD_CURRENT_SOLUTION"),
    timeframe: env("ZOHO_FIELD_TIMEFRAME"),
    // LetFlows
    role: env("ZOHO_FIELD_ROLE"),
    properties: env("ZOHO_FIELD_PROPERTIES"),
    headaches: env("ZOHO_FIELD_HEADACHES"),
    mtd: env("ZOHO_FIELD_MTD"),
    // General enquiry
    services: env("ZOHO_FIELD_SERVICES"),
    budget: env("ZOHO_FIELD_BUDGET"),
    contactPref: env("ZOHO_FIELD_CONTACT_PREF"),
    filledBy: env("ZOHO_FIELD_FILLED_BY"),
  },
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "event";

/**
 * Adds UTM tags so bookings and visits show up in Google Analytics, e.g.
 * source=website-health-check, medium=qr|kiosk|email, campaign=<event>, content=<which link>.
 */
export function withUtm(url: string, medium: string, content: string, source = config.utmSource) {
  const u = new URL(url);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", config.utmCampaign || slug(config.eventName));
  u.searchParams.set("utm_content", content);
  return u.toString();
}

export const bookingLinks = () => ({
  /** QR code on the thank-you screen (scanned with the visitor's phone). */
  qr: withUtm(config.bookingUrl, "qr", "thank-you-qr"),
  /** Button on the thank-you screen (opens on the kiosk). */
  kiosk: withUtm(config.bookingUrl, "kiosk", "thank-you-button"),
  /** Button in the report email. */
  email: withUtm(config.bookingUrl, "email", "report-cta"),
});

/** StaffMain links, tagged with source=staffmain-showcase. */
export const staffmainLinks = () => {
  const s = config.staffmain;
  return {
    bookingQr: withUtm(s.bookingUrl, "qr", "staffmain-thank-you-qr", s.utmSource),
    bookingKiosk: withUtm(s.bookingUrl, "kiosk", "staffmain-thank-you-button", s.utmSource),
    bookingEmail: withUtm(s.bookingUrl, "email", "staffmain-thanks-email", s.utmSource),
    websiteQr: withUtm(s.websiteUrl, "qr", "staffmain-website-qr", s.utmSource),
    websiteEmail: withUtm(s.websiteUrl, "email", "staffmain-email-footer", s.utmSource),
  };
};

/** LetFlows links, tagged with source=letflows-showcase. */
export const letflowsLinks = () => {
  const s = config.letflows;
  return {
    bookingQr: withUtm(s.bookingUrl, "qr", "letflows-thank-you-qr", s.utmSource),
    bookingKiosk: withUtm(s.bookingUrl, "kiosk", "letflows-thank-you-button", s.utmSource),
    bookingEmail: withUtm(s.bookingUrl, "email", "letflows-thanks-email", s.utmSource),
    websiteQr: withUtm(s.websiteUrl, "qr", "letflows-website-qr", s.utmSource),
    websiteEmail: withUtm(s.websiteUrl, "email", "letflows-email-footer", s.utmSource),
  };
};

/** General enquiry links: the main booking page, tagged source=general-enquiry. */
export const enquiryLinks = () => {
  const src = config.enquiry.utmSource;
  return {
    bookingQr: withUtm(config.bookingUrl, "qr", "enquiry-thank-you-qr", src),
    bookingKiosk: withUtm(config.bookingUrl, "kiosk", "enquiry-thank-you-button", src),
    bookingEmail: withUtm(config.bookingUrl, "email", "enquiry-thanks-email", src),
    websiteEmail: withUtm(CONTACT.websiteUrl, "email", "enquiry-email-footer", src),
  };
};

/** Secret for signing scan snapshots. Falls back to one derived from other secrets. */
export const appSecret =
  env("APP_SECRET") ||
  createHash("sha256")
    .update(`sterlix-health-check:${config.smtp.password}:${config.zoho.clientSecret}:${config.staffPin}`)
    .digest("hex");

export const CONTACT = {
  phone: "+44 20 8004 3327",
  email: "hello@sterlixit.co.uk",
  address: "595a Cranbrook Road, Gants Hill, London, IG2 6JZ",
  website: "www.sterlixit.co.uk",
  websiteUrl: "https://www.sterlixit.co.uk",
};

export function leadSource() {
  return `Stand – ${config.eventName}`;
}
