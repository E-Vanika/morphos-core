import { isAdmin, sameOrigin } from "../../../../lib/admin-auth";
import { sheetsGet, sheetsPost, type Review } from "../../../../lib/server-integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await isAdmin()) return Response.json({ detail: "Authentication required." }, { status: 401 });
  return Response.json(await sheetsGet<{ reviews: Review[] }>("admin_reviews"));
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return Response.json({ detail: "Authentication required." }, { status: 401 });
  if (!sameOrigin(request)) return Response.json({ detail: "Invalid request origin." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { id?: string };
  if (!body.id) return Response.json({ detail: "Review ID is required." }, { status: 400 });
  await sheetsPost("delete_review", { id: body.id });
  return Response.json({ status: "deleted" });
}
