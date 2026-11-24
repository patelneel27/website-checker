import { z } from "zod";
import {
  CURRENT_SOLUTIONS,
  DEFAULT_CARDS,
  EMPLOYEE_BANDS,
  INDUSTRIES,
  INDUSTRY_LINES,
  MOST_TIME,
  MOST_TIME_TO_CARD,
  RESULT_CARDS,
  SITE_BANDS,
  TIMEFRAMES,
  type EmployeeBand,
  type Industry,
  type MostTime,
  type ResultCardId,
  type SiteBand,
} from "@/config/staffmain";

// Shared by the kiosk (client-side checks) and the API (server-side checks).

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const StaffmainLeadSchema = z.object({
  /** Generated on the device, so a lead retried from the offline queue is never saved twice. */
  clientId: z.uuid(),
  /** When the visitor pressed submit (the lead may reach us later if the Wi-Fi dropped). */
  capturedAt: z.iso.datetime(),
  firstName: z.string().trim().min(1, "Please tell us your first name.").max(80),
  lastName: z.string().trim().min(1, "Please tell us your last name.").max(80),
  email: z.email("Please check your email address.").max(254),
  phone: optionalText(40),
  company: z.string().trim().min(1, "Please tell us your company name.").max(160),
  jobTitle: optionalText(120),
  // Optional on the server so a lead queued offline by an older kiosk version still saves.
  industry: z.enum(INDUSTRIES).nullable().default(null),
  employees: z.enum(EMPLOYEE_BANDS, "Please choose how many employees you have."),
  sites: z.enum(SITE_BANDS).nullable().default(null),
  mostTime: z.array(z.enum(MOST_TIME)).max(MOST_TIME.length).default([]),
  currentSolution: z.enum(CURRENT_SOLUTIONS).nullable().default(null),
  timeframe: z.enum(TIMEFRAMES).nullable().default(null),
  // UK GDPR: consent must be an explicit, positive action.
  consent: z.literal(true, "Please tick the box so we can contact you about your demo."),
});

export type StaffmainLeadInput = z.input<typeof StaffmainLeadSchema>;
export type StaffmainLeadData = z.output<typeof StaffmainLeadSchema>;

export const sitesLabel = (sites: SiteBand) => `${sites} site${sites === "1" ? "" : "s"}`;

/** The personal result for screen 4 (and the account email). */
export function buildResult(employees: EmployeeBand, sites: SiteBand, mostTime: MostTime[], industry?: Industry | null) {
  const ids: ResultCardId[] = [];
  // Keep the order the options are listed in, so the result is stable.
  for (const option of Object.keys(MOST_TIME_TO_CARD) as MostTime[]) {
    if (mostTime.includes(option)) ids.push(MOST_TIME_TO_CARD[option]);
  }
  for (const id of DEFAULT_CARDS) if (!ids.includes(id)) ids.push(id);
  const cards = ids.slice(0, 3).map((id) => ({ id, ...RESULT_CARDS[id] }));

  const multiSite = sites !== "1";
  const bigTeam = employees === "51–200" || employees === "201–500" || employees === "500+";
  const industryLine = industry ? INDUSTRY_LINES[industry] : null;
  return { cards, multiSite, bigTeam, industryLine, employeesLabel: `${employees} staff`, sitesLabel: sitesLabel(sites) };
}

/** "rotas, holiday requests and expenses" */
export function listPhrase(items: readonly string[]) {
  const lower = items.map((i) => i.charAt(0).toLowerCase() + i.slice(1));
  if (lower.length <= 1) return lower[0] ?? "";
  return `${lower.slice(0, -1).join(", ")} and ${lower[lower.length - 1]}`;
}
