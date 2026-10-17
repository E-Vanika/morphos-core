import { randomUUID } from "node:crypto";
import { isAdmin, sameOrigin } from "../../../../lib/admin-auth";
import { sheetsPost } from "../../../../lib/server-integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!await isAdmin()) return Response.json({ detail: "Authentication required." }, { status: 401 });
  if (!sameOrigin(request)) return Response.json({ detail: "Invalid request origin." }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  const slot = String(form.get("slot") ?? "");
  const alt = String(form.get("alt") ?? "").trim().slice(0, 160);
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_000_000) return Response.json({ detail: "Upload a JPG, PNG or WebP image smaller than 5 MB." }, { status: 400 });
  if (!(["hero-main", "hero-detail", "experience"].includes(slot)) || !alt) return Response.json({ detail: "Choose a valid image position and add accessible description text." }, { status: 400 });

  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const bucket = process.env.BRIDAL_BUCKET ?? "bridal-images";
  if (!supabaseUrl || !serviceKey) return Response.json({ detail: "Supabase upload is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `admin/${slot}-${randomUUID()}.${extension}`;
  const upload = await fetch(`${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": file.type, "x-upsert": "false" },
    body: await file.arrayBuffer(),
  });
  if (!upload.ok) return Response.json({ detail: `Supabase upload failed (${upload.status}). Check that the ${bucket} bucket exists and is public.` }, { status: 502 });
  const url = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path}`;
  await sheetsPost("upsert_image", { id: slot, url, alt });
  return Response.json({ status: "saved", image: { id: slot, url, alt } });
}
