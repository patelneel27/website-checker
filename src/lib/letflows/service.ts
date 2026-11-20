import "server-only";
import { PRIVATE_LANDLORD, PRODUCT, WEBSITE_LABEL } from "@/config/letflows";
import { config, letflowsLinks } from "../config";
import { createProductService, ukDate } from "../product-leads/service";
import { listPhrase } from "../staffmain/schema";
import { buildResult, propertiesLabel } from "./schema";
import { letflowsStore, type LetflowsLead } from "./store";

export const letflows = createProductService<LetflowsLead>({
  key: "letflows",
  name: PRODUCT,
  websiteLabel: WEBSITE_LABEL,
  links: () => ({ bookingEmail: letflowsLinks().bookingEmail, websiteEmail: letflowsLinks().websiteEmail }),
  utmSource: () => config.letflows.utmSource,
  signupUrl: () => config.letflows.signupUrl,
  store: letflowsStore,

  thanksParagraph: (l) => {
    const pain = l.headaches.length ? ` and ${listPhrase(l.headaches)} ${l.headaches.length === 1 ? "is" : "are"} the biggest headache` : "";
    return `Thanks for visiting the Sterlixit stand today. You told us you look after ${propertiesLabel(l.properties)}${pain}. We'll be in touch within 2 working days to set up your LetFlows account and a short live demo using a set-up like yours.`;
  },

  demoLine: (l) => {
    const r = buildResult(l.role, l.properties, l.headaches);
    return `We'll show you ${listPhrase(r.cards.map((c) => c.title))} with a couple of your own properties added.`;
  },

  zoho: (l) => {
    const r = buildResult(l.role, l.properties, l.headaches);
    const f = config.zohoFields;
    return {
      company: l.company ?? PRIVATE_LANDLORD,
      tags: ["LetFlows", l.eventName, l.role, l.timeframe ?? ""],
      fields: {
        [f.product]: "LetFlows",
        [f.role]: l.role,
        [f.properties]: l.properties,
        [f.headaches]: l.headaches.join(", "),
        [f.mtd]: l.mtd,
        [f.currentSolution]: l.currentSolution,
        [f.timeframe]: l.timeframe,
      },
      description: [
        `LetFlows demo request: registered at the Sterlixit stand, ${ukDate(l.capturedAt)} (${l.eventName})`,
        "",
        "Product interest: LetFlows",
        `Role: ${l.role}`,
        `Properties: ${l.properties}`,
        `Biggest headaches: ${l.headaches.length ? l.headaches.join(", ") : "not given"}`,
        `Making Tax Digital applies: ${l.mtd ?? "not given"}`,
        `Uses now: ${l.currentSolution ?? "not given"}`,
        `Looking to start: ${l.timeframe ?? "not given"}`,
        `Company / agency: ${l.company ?? PRIVATE_LANDLORD}`,
        `Shown on screen: ${r.cards.map((c) => c.title).join(", ")}`,
        ...(l.note ? ["", `Staff note: ${l.note}`] : []),
        "",
        `Consent to contact given: ${l.consentAt.toISOString()}`,
      ].join("\n"),
    };
  },

  staffDetails: (l) => [
    [l.role, propertiesLabel(l.properties), l.timeframe, l.currentSolution && `uses ${l.currentSolution}`].filter(Boolean).join(" · "),
    `Headaches: ${l.headaches.length ? l.headaches.join(", ") : "not given"}`,
    `MTD: ${l.mtd ?? "not given"}`,
  ],

  csvRow: (l) => ({
    "Company / agency": l.company ?? PRIVATE_LANDLORD,
    Role: l.role,
    Properties: l.properties,
    Headaches: l.headaches.join("; "),
    MTD: l.mtd ?? "",
    "Uses now": l.currentSolution ?? "",
    Timeframe: l.timeframe ?? "",
  }),
});
