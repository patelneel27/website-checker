import { getProduct } from "@/lib/product-leads/registry";
import { isStaff, unauthorised } from "@/lib/staff-auth";

export async function POST(req: Request, { params }: { params: Promise<{ product: string }> }) {
  if (!isStaff(req)) return unauthorised();
  const product = getProduct((await params).product);
  const body = (await req.json().catch(() => null)) as { leadId?: unknown; note?: unknown } | null;
  if (!product || typeof body?.leadId !== "string" || typeof body.note !== "string") return Response.json({ ok: false }, { status: 400 });
  const ok = await product.saveNote(body.leadId, body.note.trim().slice(0, 2000));
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
