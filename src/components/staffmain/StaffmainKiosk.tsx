"use client";

import {
  ABOUT,
  CURRENT_SOLUTIONS,
  EMPLOYEE_BANDS,
  FEATURES,
  FORM,
  MOST_TIME,
  PRODUCT,
  RESULT,
  SITE_BANDS,
  THANKS,
  TIMEFRAMES,
  type EmployeeBand,
  type FeatureId,
  type MostTime,
  type SiteBand,
} from "@/config/staffmain";
import { buildResult } from "@/lib/staffmain/schema";
import { ProductKiosk, type ProductDef, type ShowcaseConfig } from "../showcase/ProductKiosk";
import { StaffmainPreview } from "./Previews";
import { SmWelcome } from "./screens/SmWelcome";

const STAFFMAIN: ProductDef = {
  product: PRODUCT,
  path: "/staffmain",
  staffTab: "staffmain",
  endpoint: "/api/staffmain/lead",
  Welcome: SmWelcome,
  features: FEATURES,
  fallback: (id) => <StaffmainPreview id={id as FeatureId} />,
  showcaseLastLabel: "Now, about your business",
  about: {
    eyebrow: "About your business",
    headline: ABOUT.headline,
    subline: ABOUT.subline,
    cta: ABOUT.cta,
    neededHint: "Choose your team size and number of sites first.",
    backLabel: "Features",
    questions: [
      { key: "employees", title: ABOUT.employees, options: EMPLOYEE_BANDS, required: true },
      { key: "sites", title: ABOUT.sites, options: SITE_BANDS, required: true },
      { key: "mostTime", title: ABOUT.mostTime, hint: ABOUT.mostTimeHint, options: MOST_TIME, multi: true },
    ],
  },
  result: (a) => {
    const r = buildResult(a.employees as EmployeeBand, a.sites as SiteBand, (a.mostTime as MostTime[]) ?? []);
    return {
      headline: (
        <>
          Here&rsquo;s how StaffMain would work for <span className="whitespace-nowrap text-brand">{r.employeesLabel}</span> across{" "}
          <span className="whitespace-nowrap text-brand">{r.sitesLabel}</span>.
        </>
      ),
      cards: r.cards,
      extras: [r.multiSite && RESULT.multiSite(a.sites as string), r.bigTeam && RESULT.bigTeam].filter(Boolean) as string[],
    };
  },
  resultCopy: RESULT,
  form: {
    copy: { ...FORM, emailLabel: "Work email", companyLabel: "Company", companyRequired: true, showJobTitle: true },
    chipGroups: [
      { key: "employees", label: "Number of employees", options: EMPLOYEE_BANDS, required: true },
      { key: "sites", label: "Number of sites or branches", options: SITE_BANDS },
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
    company: f.company.trim(),
    jobTitle: f.jobTitle.trim() || undefined,
    employees: f.chips.employees,
    sites: f.chips.sites ?? null,
    mostTime: a.mostTime ?? [],
    currentSolution: f.chips.currentSolution ?? null,
    timeframe: f.chips.timeframe ?? null,
  }),
};

export function StaffmainKiosk({ config }: { config: ShowcaseConfig }) {
  return <ProductKiosk def={STAFFMAIN} config={config} />;
}
