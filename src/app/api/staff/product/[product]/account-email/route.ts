import { getProduct } from "@/lib/product-leads/registry";
import { isStaff, unauthorised } from "@/lib/staff-auth";

export const maxDuration = 30;

// Email 2 ("Your … account is ready"), sent by staff once the account exists.
export async function POST(req: Request, { params }: { params: Promise<{ product: string }> }) {
  if (!isStaff(req)) return unauthorised();
  const product = getProduct((await params).product);
  const body = (await req.json().catch(() => null)) as { leadId?: unknown; signupUrl?: unknown } | null;
  if (!product?.spec.signupUrl || typeof body?.leadId !== "string") return Response.json({ ok: false }, { status: 400 });
  let signupUrl = product.spec.signupUrl();
  if (typeof body.signupUrl === "string" && body.signupUrl.trim()) {
    try {
      const u = new URL(body.signupUrl.trim());
      if (u.protocol !== "https:") throw new Error("not https");
      signupUrl = u.toString();
    } catch {
      return Response.json({ ok: false, message: "The sign-up link must start with https://" }, { status: 400 });
    }
  }
  const ok = await product.sendAccountEmail(body.leadId, signupUrl);
  return Response.json({ ok }, { status: ok ? 200 : 502 });
}
