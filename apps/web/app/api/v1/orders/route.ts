import { sheetsPost, telegramEnquiry } from "../../../../lib/server-integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (name.length < 2 || phone.length < 6) return Response.json({ detail: "Name and mobile number are required." }, { status: 400 });
    await sheetsPost("new_enquiry", body);
    let telegram = false;
    try { telegram = await telegramEnquiry(body); }
    catch (error) { console.error("Telegram notification failed after the enquiry was saved", error); }
    return Response.json({ status: "received", telegram, message: "Your enquiry is saved for Monika to review." });
  } catch (error) {
    console.error("Enquiry route failed", error);
    return Response.json({ detail: error instanceof Error ? error.message : "The enquiry could not be saved." }, { status: 502 });
  }
}
