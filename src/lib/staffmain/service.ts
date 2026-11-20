import "server-only";
import { PRODUCT, WEBSITE_LABEL } from "@/config/staffmain";
import { config, staffmainLinks } from "../config";
import { createProductService, ukDate } from "../product-leads/service";
import { buildResult, listPhrase, sitesLabel } from "./schema";
import { staffmainStore, type StaffmainLead } from "./store";

const sites = (l: StaffmainLead) => (l.sites ? sitesLabel(l.sites) : "sites not given");

export const staffmain = createProductService<StaffmainLead>({
  key: "staffmain",
  name: PRODUCT,
  websiteLabel: WEBSITE_LABEL,
  links: () => ({ bookingEmail: staffmainLinks().bookingEmail, websiteEmail: staffmainLinks().websiteEmail }),
  utmSource: () => config.staffmain.utmSource,
  signupUrl: () => config.staffmain.signupUrl,
  store: staffmainStore,

  thanksParagraph: (l) =>
    `Thanks for visiting the Sterlixit stand today.${
      l.mostTime.length ? ` You told us ${listPhrase(l.mostTime)} take${l.mostTime.length === 1 ? "s" : ""} up too much of your week.` : ""
    } We'll be in touch within 2 working days to set up your StaffMain account and a short live demo around how ${l.company} works.`,

  demoLine: (l) => {
    const r = buildResult(l.employees, l.sites ?? "1", l.mostTime);
    return `We'll walk through ${listPhrase(r.cards.map((c) => c.title))} using your own team's set-up.`;
  },

  zoho: (l) => {
    const r = buildResult(l.employees, l.sites ?? "1", l.mostTime);
    const f = config.zohoFields;
    return {
      company: l.company,
      tags: ["StaffMain", l.eventName, l.timeframe ?? ""],
      fields: {
        [f.product]: "StaffMain",
        [f.employees]: l.employees,
        [f.sites]: l.sites,
        [f.mostTime]: l.mostTime.join(", "),
        [f.currentSolution]: l.currentSolution,
        [f.timeframe]: l.timeframe,
      },
      description: [
        `StaffMain demo request: registered at the Sterlixit stand, ${ukDate(l.capturedAt)} (${l.eventName})`,
        "",
        "Product interest: StaffMain",
        `Employees: ${l.employees}`,
        `Sites / branches: ${sites(l)}`,
        `What takes the most time: ${l.mostTime.length ? l.mostTime.join(", ") : "not given"}`,
        `Uses now: ${l.currentSolution ?? "not given"}`,
        `Looking to start: ${l.timeframe ?? "not given"}`,
        `Job title: ${l.jobTitle ?? "not given"}`,
        `Shown on screen: ${r.cards.map((c) => c.title).join(", ")}`,
        ...(l.note ? ["", `Staff note: ${l.note}`] : []),
        "",
        `Consent to contact given: ${l.consentAt.toISOString()}`,
      ].join("\n"),
    };
  },

  staffDetails: (l) => [
    [`${l.employees} staff`, sites(l), l.timeframe, l.currentSolution && `uses ${l.currentSolution}`].filter(Boolean).join(" · "),
    `Most time: ${l.mostTime.length ? l.mostTime.join(", ") : "not given"}`,
  ],

  csvRow: (l) => ({
    Company: l.company,
    "Job title": l.jobTitle ?? "",
    Employees: l.employees,
    Sites: l.sites ?? "",
    "Most time": l.mostTime.join("; "),
    "Uses now": l.currentSolution ?? "",
    Timeframe: l.timeframe ?? "",
  }),
});
