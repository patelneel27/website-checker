"use client";

import {
  ABOUT,
  CURRENT_SOLUTIONS,
  FEATURES,
  FORM,
  HEADACHES,
  MTD_OPTIONS,
  PRODUCT,
  PROPERTY_BANDS,
  RESULT,
  ROLES,
  SHOW_MTD,
  THANKS,
  TIMEFRAMES,
  type Headache,
  type PropertyBand,
  type Role,
} from "@/config/letflows";
import { buildResult } from "@/lib/letflows/schema";
import { ProductKiosk, type ProductDef, type ShowcaseConfig } from "../showcase/ProductKiosk";
import { LfWelcome } from "./LfWelcome";

function headline(role: Role, n: PropertyBand) {
  const agent = role === "Letting agent" || role === "Property manager";
  const what = <span className="whitespace-nowrap text-brand">{n === "1" ? "property" : `${n} properties`}</span>;
  return agent ? (
    <>Here&rsquo;s how LetFlows would work for the {what} you manage.</>
  ) : (
    <>Here&rsquo;s how LetFlows would work for your {what}.</>
  );
}

const LETFLOWS: ProductDef = {
  product: PRODUCT,
  path: "/letflows",
  themeClass: "theme-letflows",
  staffTab: "letflows",
  endpoint: "/api/letflows/lead",
  Welcome: LfWelcome,
  features: FEATURES,
  showcaseLastLabel: "Now, about your properties",
  about: {
    eyebrow: ABOUT.eyebrow,
    headline: ABOUT.headline,
    subline: ABOUT.subline,
    cta: ABOUT.cta,
    neededHint: ABOUT.needed,
    backLabel: "Features",
    questions: [
      { key: "role", title: ABOUT.role, options: ROLES, required: true },
      { key: "properties", title: ABOUT.properties, options: PROPERTY_BANDS, required: true },
      { key: "headaches", title: ABOUT.headaches, hint: ABOUT.headachesHint, options: HEADACHES, multi: true },
    ],
  },
  result: (a) => {
    const role = a.role as Role;
    const n = a.properties as PropertyBand;
    const r = buildResult(role, n, (a.headaches as Headache[]) ?? []);
    return {
      headline: headline(role, n),
      cards: r.cards,
      extras: [r.growing && RESULT.growing, r.agent && RESULT.agents].filter(Boolean) as string[],
    };
  },
  resultCopy: RESULT,
  form: {
    copy: { ...FORM, emailLabel: "Email", companyLabel: "Company / agency", companyRequired: false, showJobTitle: false },
    chipGroups: [
      { key: "role", label: "I'm a…", options: ROLES, required: true },
      { key: "properties", label: "Number of properties", options: PROPERTY_BANDS, required: true },
      ...(SHOW_MTD ? [{ key: "mtd", label: "Making Tax Digital applies to me", options: MTD_OPTIONS, hint: FORM.mtdHint }] : []),
      { key: "currentSolution", label: "What do you use now?", options: CURRENT_SOLUTIONS },
      { key: "timeframe", label: "When are you looking to start?", options: TIMEFRAMES },
    ],
  },
  thanks: THANKS,
  toLead: (a, f) => ({
    firstName: f.firstName.trim(),
    lastName: f.lastName.trim(),
    email: f.email.trim(),
    phone: f.phone.trim() || undefined,
    company: f.company.trim() || undefined,
    role: f.chips.role,
    properties: f.chips.properties,
    headaches: a.headaches ?? [],
    mtd: SHOW_MTD ? (f.chips.mtd ?? null) : null,
    currentSolution: f.chips.currentSolution ?? null,
    timeframe: f.chips.timeframe ?? null,
  }),
};

export function LetflowsKiosk({ config }: { config: ShowcaseConfig }) {
  return <ProductKiosk def={LETFLOWS} config={config} />;
}
