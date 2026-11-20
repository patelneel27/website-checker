import "server-only";
import { config } from "../config";
import { createLeadStore, type ProductLead } from "../product-leads/store";
import type { EnquiryLeadData } from "./schema";

export type EnquiryLead = ProductLead<EnquiryLeadData>;

export const enquiryStore = createLeadStore<EnquiryLeadData>("enquiry", () => config.enquiry.leadsFile);
