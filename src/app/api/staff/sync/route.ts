import { PRODUCTS } from "@/lib/product-leads/registry";
import { syncLeadToZoho } from "@/lib/report";
import { isStaff, unauthorised } from "@/lib/staff-auth";
import { listLeads } from "@/lib/store";

export const maxDuration = 60;

// Retries Zoho CRM for every lead that isn't in Zoho yet (e.g. the connection dropped).
export async function POST(req: Request) {
  if (!isStaff(req)) return unauthorised();
  let total = 0;
  let synced = 0;
  for (const lead of (await listLeads(null)).filter((l) => !l.zohoId)) {
    total++;
    if (await syncLeadToZoho(lead.id)) synced++;
  }
  for (const product of Object.values(PRODUCTS)) {
    for (const lead of (await product.store.list(null)).filter((l) => !l.zohoId)) {
      total++;
      if (await product.sync(lead.id)) synced++;
    }
  }
  return Response.json({ ok: synced === total, synced, failed: total - synced });
}
