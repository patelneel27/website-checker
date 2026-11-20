import { toCsv } from "@/lib/csv";
import { isStaff, unauthorised } from "@/lib/staff-auth";
import { getProduct } from "@/lib/product-leads/registry";
import { listLeads } from "@/lib/store";

// GET /api/staff/export?range=today|all&product=health-check|staffmain → leads as CSV
// (opens in Excel and Google Sheets).
export async function GET(req: Request) {
  if (!isStaff(req)) return unauthorised();
  const params = new URL(req.url).searchParams;
  const range = params.get("range") === "all" ? "all" : "today";
  const since = range === "today" ? new Date(new Date().setHours(0, 0, 0, 0)) : null;
  const date = new Date().toISOString().slice(0, 10);

  const product = getProduct(params.get("product") ?? "");
  if (product) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each product's own lead shape
    const rows = (await product.store.list(since)).map((l: any) => product.csvRow(l));
    return new Response(toCsv(rows), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${product.spec.key}-leads-${range}-${date}.csv"`,
        "cache-control": "no-store",
      },
    });
  }

  const leads = await listLeads(since);
  const rows = leads.map((l) => ({
    "Date": l.createdAt.toISOString().replace("T", " ").slice(0, 16),
    "Name": l.name,
    "Email": l.email,
    "Company": l.company ?? "",
    "Phone": l.phone ?? "",
    "Website": l.scan.url,
    "Interest": l.interest.join("; "),
    "Performance": l.scan.scores?.performance ?? "",
    "SEO": l.scan.scores?.seo ?? "",
    "Accessibility": l.scan.scores?.accessibility ?? "",
    "Best Practices": l.scan.scores?.["best-practices"] ?? "",
    "Top fixes": l.scan.quickWins.map((w) => w.title).join(" | "),
    "Report sent": l.reportSentAt ? l.reportSentAt.toISOString().replace("T", " ").slice(0, 16) : "No",
    "Consent at": l.consentAt.toISOString(),
    "Source": l.source,
    "Zoho lead ID": l.zohoId ?? "Not synced",
  }));

  return new Response(toCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="sterlix-leads-${range}-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
