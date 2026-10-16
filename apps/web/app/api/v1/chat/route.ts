import { geminiAnswer } from "../../../../lib/server-integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: unknown; domain?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const domain = body.domain === "art-craft" ? "art-craft" : "bridal-makeup";
    if (!message || message.length > 2000) return Response.json({ detail: "Enter a message between 1 and 2,000 characters." }, { status: 400 });
    const result = await geminiAnswer(message, domain);
    return Response.json({ ...result, skills_available: domain === "art-craft" ? [] : ["get_bridal_service_menu", "prepare_bridal_enquiry"] });
  } catch (error) {
    console.error("Chat route failed", error);
    return Response.json({ detail: "The concierge could not process that request." }, { status: 500 });
  }
}
