import { z } from "zod";
import { scanRateLimit } from "@/lib/rate-limit";
import { scanWebsite } from "@/lib/scan-service";
import { assertPublicHost, UnreachableError } from "@/lib/safe-fetch";
import { tokenForResult } from "@/lib/scan-token";
import type { ScanErrorResponse } from "@/lib/types";
import { normaliseUrl } from "@/lib/url";

// PageSpeed can take up to 60 s; the background finish runs inside this budget too.
export const maxDuration = 60;

const Body = z.object({ url: z.string().max(2048), fresh: z.boolean().optional() });

function fail(error: ScanErrorResponse["error"], message: string, status: number, headers?: HeadersInit) {
  return Response.json({ error, message } satisfies ScanErrorResponse, { status, headers });
}

const UNREACHABLE =
  "We couldn't reach that website. Please check the address (for example yourcompany.co.uk) and try again.";

export async function POST(req: Request) {
  const limited = scanRateLimit(req);
  if (!limited.ok) {
    return fail("rate_limited", "Lots of checks running right now. Please try again in a moment.", 429, {
      "retry-after": String(limited.retryAfterS),
    });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("invalid_url", "Please type in your website address.", 400);

  const normalised = normaliseUrl(parsed.data.url);
  if (!normalised.ok) return fail("invalid_url", normalised.message, 400);

  try {
    await assertPublicHost(normalised.host);
  } catch {
    return fail("unreachable", UNREACHABLE, 422);
  }

  try {
    const outcome = await scanWebsite(normalised.url, { fresh: parsed.data.fresh });
    if (!outcome.ok) return fail("unreachable", UNREACHABLE, 422);
    return Response.json({ ...outcome.result, cached: outcome.cached, token: tokenForResult(outcome.result) });
  } catch (err) {
    if (err instanceof UnreachableError) return fail("unreachable", UNREACHABLE, 422);
    console.error("[api/scan] failed", err);
    return fail("server_error", "Something went wrong on our side. Please try again.", 500);
  }
}
