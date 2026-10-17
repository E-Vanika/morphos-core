import { cookies } from "next/headers";
import { ADMIN_COOKIE, createAdminSession, sameOrigin, verifyAdminPassword } from "../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; resetAt: number }>();

function attemptKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function limited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) { attempts.delete(key); return false; }
  return current.count >= 8;
}

function recordFailure(key: string) {
  const current = attempts.get(key);
  if (!current) attempts.set(key, { count: 1, resetAt: Date.now() + 15 * 60_000 });
  else current.count += 1;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ detail: "Invalid request origin." }, { status: 403 });
  const key = attemptKey(request);
  if (limited(key)) return Response.json({ detail: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429 });
  const body = await request.json().catch(() => ({})) as { password?: string };
  if (!verifyAdminPassword(body.password ?? "")) { recordFailure(key); return Response.json({ detail: "Incorrect administrator password." }, { status: 401 }); }
  attempts.delete(key);
  const session = createAdminSession();
  (await cookies()).set(ADMIN_COOKIE, session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: session.maxAge });
  return Response.json({ authenticated: true });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ detail: "Invalid request origin." }, { status: 403 });
  (await cookies()).set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return Response.json({ authenticated: false });
}
