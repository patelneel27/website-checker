import { getProduct } from "@/lib/product-leads/registry";
import { isStaff, unauthorised } from "@/lib/staff-auth";

export const maxDuration = 30;

export async function POST(req: Request, { params }: { params: Promise<{ product: string }> }) {
  if (!isStaff(req)) return unauthorised();
  const product = getProduct((await params).product);
  const body = (await req.json().catch(() => null)) as { leadId?: unknown } | null;
  if (!product || typeof body?.leadId !== "string") return Response.json({ ok: false }, { status: 400 });
  const ok = await product.sendThanks(body.leadId, { force: true });
  return Response.json({ ok }, { status: ok ? 200 : 502 });
}
