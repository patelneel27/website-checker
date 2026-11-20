import { mailerEnabled } from "@/lib/mailer";
import { isStaff, unauthorised } from "@/lib/staff-auth";
import { PRODUCTS } from "@/lib/product-leads/registry";
import { listLeads, listScans } from "@/lib/store";
import { zohoEnabled } from "@/lib/zoho";

export async function GET(req: Request) {
  if (!isStaff(req)) return unauthorised();
  const since = new Date(new Date().setHours(0, 0, 0, 0));
  const [scans, leads] = await Promise.all([listScans(since), listLeads(since)]);
  const products = Object.fromEntries(
    await Promise.all(
      Object.entries(PRODUCTS).map(async ([key, p]) => [
        key,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each product's own lead shape
        { signupUrl: p.spec.signupUrl?.() ?? null, leads: (await p.store.list(since)).map((l: any) => p.staffRow(l)) },
      ]),
    ),
  );
  return Response.json(
    {
      zohoEnabled: zohoEnabled(),
      mailerEnabled: mailerEnabled(),
      scans: scans.map((s) => ({ id: s.id, url: s.url, scores: s.scores, psiStatus: s.psiStatus, createdAt: s.createdAt.toISOString() })),
      leads: leads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        company: l.company,
        phone: l.phone,
        interest: l.interest,
        url: l.scan.url,
        reportSentAt: l.reportSentAt?.toISOString() ?? null,
        zohoId: l.zohoId,
        zohoError: l.zohoError,
        createdAt: l.createdAt.toISOString(),
      })),
      products,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
