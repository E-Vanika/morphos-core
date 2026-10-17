import { isAdmin, sameOrigin } from "../../../../lib/admin-auth";
import { mergeSiteContent, type SiteImage, type SiteService } from "../../../../lib/site-content";
import { sheetsGet, sheetsPost } from "../../../../lib/server-integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await isAdmin()) return Response.json({ detail: "Authentication required." }, { status: 401 });
  const content = await sheetsGet<{ services?: SiteService[]; images?: SiteImage[] }>("site_content");
  return Response.json(mergeSiteContent(content.services, content.images));
}

export async function POST(request: Request) {
  if (!await isAdmin()) return Response.json({ detail: "Authentication required." }, { status: 401 });
  if (!sameOrigin(request)) return Response.json({ detail: "Invalid request origin." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as Partial<SiteService> & Partial<SiteImage> & { type?: string };
  if (body.type === "service") {
    const id = String(body.id ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
    const name = String(body.name ?? "").trim().slice(0, 100);
    const price = String(body.price ?? "").trim().slice(0, 40);
    const description = String(body.description ?? "").trim().slice(0, 300);
    if (!id || !name || !price || !description) return Response.json({ detail: "Service name, price and description are required." }, { status: 400 });
    await sheetsPost("upsert_service", { id, name, price, description });
    return Response.json({ status: "saved", service: { id, name, price, description } });
  }
  if (body.type === "image") {
    const id = String(body.id ?? "");
    const url = String(body.url ?? "").trim();
    const alt = String(body.alt ?? "").trim().slice(0, 160);
    if (!["hero-main", "hero-detail", "experience"].includes(id) || !/^https:\/\//.test(url) || !alt) return Response.json({ detail: "Choose an image slot and provide a secure URL and description." }, { status: 400 });
    await sheetsPost("upsert_image", { id, url, alt });
    return Response.json({ status: "saved", image: { id, url, alt } });
  }
  return Response.json({ detail: "Unsupported content type." }, { status: 400 });
}
