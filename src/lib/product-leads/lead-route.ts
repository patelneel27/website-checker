import "server-only";
import { after } from "next/server";
import type { ZodType } from "zod";
import { config, leadSource } from "../config";
import { clientIp, rateLimit } from "../rate-limit";
import type { ProductService } from "./service";

/**
 * POST handler for a product's demo request. Safe to retry (deduplicated by clientId), which
 * the kiosk's offline queue relies on. Email and Zoho run after the response.
 */
export function leadRoute(
  schema: ZodType,
  service: ProductService,
  /** Last-moment adjustments, e.g. only trusting "Team member" from a signed-in staff device. */
  transform?: (data: Record<string, unknown>, req: Request) => Record<string, unknown>,
) {
  return async function POST(req: Request) {
    if (!rateLimit(`${service.spec.key}-lead:${clientIp(req)}`, 20, 60_000).ok) {
      return Response.json({ ok: false, message: "Please try again in a moment." }, { status: 429 });
    }
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return Response.json(
        { ok: false, field: String(first?.path[0] ?? ""), message: first?.message ?? "Please check the form." },
        { status: 400 },
      );
    }
    const data = transform ? transform(parsed.data as Record<string, unknown>, req) : parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- validated by the product's schema
    const { lead, created } = await service.store.create(data as any, { source: leadSource(), eventName: config.eventName });
    if (created) {
      after(async () => {
        await service.sendThanks(lead.id);
        await service.sync(lead.id);
      });
    }
    return Response.json({ ok: true });
  };
}
