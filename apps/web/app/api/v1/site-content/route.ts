import { mergeSiteContent, type SiteImage, type SiteService } from "../../../../lib/site-content";
import { sheetsGet } from "../../../../lib/server-integrations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await sheetsGet<{ services?: SiteService[]; images?: SiteImage[] }>("site_content");
    return Response.json(mergeSiteContent(content.services, content.images));
  } catch (error) {
    console.error("Site content read failed", error);
    return Response.json(mergeSiteContent(), { headers: { "X-Content-Fallback": "static" } });
  }
}
