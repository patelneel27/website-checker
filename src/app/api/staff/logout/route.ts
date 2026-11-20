import { STAFF_COOKIE } from "@/lib/staff-auth";

export async function POST() {
  return Response.json(
    { ok: true },
    { headers: { "set-cookie": `${STAFF_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` } },
  );
}
