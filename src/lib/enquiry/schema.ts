import { z } from "zod";
import { BUDGETS, CONTACT_PREFS, FILLED_BY, SERVICE_IDS, SOFTWARE, TIMEFRAMES } from "@/config/enquiry";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const EnquiryLeadSchema = z.object({
  clientId: z.uuid(),
  capturedAt: z.iso.datetime(),
  services: z.array(z.enum(SERVICE_IDS)).min(1, "Please pick at least one service.").max(SERVICE_IDS.length),
  software: z.array(z.enum(SOFTWARE)).max(SOFTWARE.length).default([]),
  firstName: z.string().trim().min(1, "Please tell us your first name.").max(80),
  lastName: z.string().trim().min(1, "Please tell us your last name.").max(80),
  email: z.email("Please check your email address.").max(254),
  phone: optionalText(40),
  company: optionalText(160),
  website: optionalText(300),
  message: optionalText(2000),
  budget: z.enum(BUDGETS).nullable().default(null),
  timeframe: z.enum(TIMEFRAMES).nullable().default(null),
  contactPref: z.enum(CONTACT_PREFS).nullable().default(null),
  filledBy: z.enum(FILLED_BY).default("Visitor"),
  consent: z.literal(true, "Please tick the box so we can contact you about your enquiry."),
});

export type EnquiryLeadData = z.output<typeof EnquiryLeadSchema>;

/** "A, B and C", keeping capitals (service names are proper names). */
export function joinNames(items: readonly string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
