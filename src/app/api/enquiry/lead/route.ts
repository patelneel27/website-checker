import { enquiry } from "@/lib/enquiry/service";
import { EnquiryLeadSchema } from "@/lib/enquiry/schema";
import { leadRoute } from "@/lib/product-leads/lead-route";
import { isStaff } from "@/lib/staff-auth";

export const maxDuration = 60;

// "Team member" is only trusted from a device signed in to staff mode (the Quick enquiry button).
export const POST = leadRoute(EnquiryLeadSchema, enquiry, (data, req) => ({
  ...data,
  filledBy: data.filledBy === "Team member" && isStaff(req) ? "Team member" : "Visitor",
}));
