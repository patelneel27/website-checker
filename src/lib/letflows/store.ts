import "server-only";
import { config } from "../config";
import { createLeadStore, type ProductLead } from "../product-leads/store";
import type { LetflowsLeadData } from "./schema";

export type LetflowsLead = ProductLead<LetflowsLeadData>;

export const letflowsStore = createLeadStore<LetflowsLeadData>("letflows", () => config.letflows.leadsFile);
