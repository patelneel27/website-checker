import { leadRoute } from "@/lib/product-leads/lead-route";
import { StaffmainLeadSchema } from "@/lib/staffmain/schema";
import { staffmain } from "@/lib/staffmain/service";

export const maxDuration = 60;

export const POST = leadRoute(StaffmainLeadSchema, staffmain);
