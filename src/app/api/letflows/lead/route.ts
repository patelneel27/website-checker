import { LetflowsLeadSchema } from "@/lib/letflows/schema";
import { letflows } from "@/lib/letflows/service";
import { leadRoute } from "@/lib/product-leads/lead-route";

export const maxDuration = 60;

export const POST = leadRoute(LetflowsLeadSchema, letflows);
