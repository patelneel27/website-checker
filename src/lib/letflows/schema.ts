import { z } from "zod";
import {
  CURRENT_SOLUTIONS,
  DEFAULT_CARDS,
  HEADACHE_TO_CARD,
  HEADACHES_ALL,
  MTD_OPTIONS,
  PROPERTY_BANDS,
  RESULT_CARDS,
  ROLES,
  SHOW_MTD,
  TIMEFRAMES,
  type Headache,
  type LfCardId,
  type PropertyBand,
  type Role,
} from "@/config/letflows";

// Shared by the kiosk (result screen) and the API (server-side checks).

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const LetflowsLeadSchema = z.object({
  clientId: z.uuid(),
  capturedAt: z.iso.datetime(),
  firstName: z.string().trim().min(1, "Please tell us your first name.").max(80),
  lastName: z.string().trim().min(1, "Please tell us your last name.").max(80),
  email: z.email("Please check your email address.").max(254),
  phone: optionalText(40),
  /** Blank means a private landlord. */
  company: optionalText(160),
  role: z.enum(ROLES, "Please choose your role."),
  properties: z.enum(PROPERTY_BANDS, "Please choose how many properties."),
  headaches: z.array(z.enum(HEADACHES_ALL)).max(HEADACHES_ALL.length).default([]),
  mtd: z.enum(MTD_OPTIONS).nullable().default(null),
  currentSolution: z.enum(CURRENT_SOLUTIONS).nullable().default(null),
  timeframe: z.enum(TIMEFRAMES).nullable().default(null),
  consent: z.literal(true, "Please tick the box so we can contact you about your demo."),
});

export type LetflowsLeadData = z.output<typeof LetflowsLeadSchema>;

export const isAgent = (role: Role) => role === "Letting agent" || role === "Property manager";
export const propertiesLabel = (n: PropertyBand) => (n === "1" ? "1 property" : `${n} properties`);

/** The personal result for screen 4 (and the account email). */
export function buildResult(role: Role, properties: PropertyBand, headaches: Headache[]) {
  const ids: LfCardId[] = [];
  for (const h of Object.keys(HEADACHE_TO_CARD) as Headache[]) {
    const id = HEADACHE_TO_CARD[h];
    if (headaches.includes(h) && (SHOW_MTD || id !== "mtd") && !ids.includes(id)) ids.push(id);
  }
  for (const id of DEFAULT_CARDS) if (!ids.includes(id)) ids.push(id);
  const cards = ids.slice(0, 3).map((id) => ({ id, ...RESULT_CARDS[id] }));
  return {
    cards,
    agent: isAgent(role),
    growing: properties === "21–100" || properties === "100+",
  };
}
