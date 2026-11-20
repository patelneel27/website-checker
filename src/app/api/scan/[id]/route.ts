import { toResult } from "@/lib/scan-result";
import { tokenForResult } from "@/lib/scan-token";
import { getScan } from "@/lib/store";

// Polled by the results screen while PageSpeed finishes in the background.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const scan = await getScan(id);
  if (!scan) return Response.json({ error: "not_found" }, { status: 404 });
  const result = toResult(scan);
  return Response.json({ ...result, token: tokenForResult(result) }, { headers: { "cache-control": "no-store" } });
}
