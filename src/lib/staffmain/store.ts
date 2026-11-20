import "server-only";
import { config } from "../config";
import { createLeadStore, type ProductLead } from "../product-leads/store";
import type { StaffmainLeadData } from "./schema";

export type StaffmainLead = ProductLead<StaffmainLeadData>;

export const staffmainStore = createLeadStore<StaffmainLeadData>("staffmain", () => config.staffmain.leadsFile);
