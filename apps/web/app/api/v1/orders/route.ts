import { sheetsPost, telegramEnquiry } from "../../../../lib/server-integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (name.length < 2 || phone.length < 6) return Response.json({ detail: "Name and mobile number are required." }, { status: 400 });
    const isBridal = body.service === "bridal-makeup";
    const requestedService = typeof body.requested_service === "string" ? body.requested_service.trim() : "";
    const eventDate = typeof body.event_date === "string" ? body.event_date.trim() : "";
    const eventTime = typeof body.event_time === "string" ? body.event_time.trim() : "";
    const eventPlace = typeof body.event_place === "string" ? body.event_place.trim() : "";
    const details = typeof body.details === "string" ? body.details.trim() : "";
    const clientCount = Number(body.client_count);
    if (isBridal && (!requestedService || !eventDate || !eventTime || !eventPlace || details.length < 10 || !Number.isInteger(clientCount) || clientCount < 1 || clientCount > 50)) {
      return Response.json({ detail: "Service, event date, time, place, number of clients and look details are required." }, { status: 400 });
    }
    const enquiry = { ...body, customer_name: name, phone, requested_service: requestedService || null, event_date: eventDate || null, event_time: eventTime || null, event_place: eventPlace || null, client_count: Number.isFinite(clientCount) && clientCount > 0 ? clientCount : null, details: details || null };
    await sheetsPost("new_enquiry", enquiry);
    let telegram = false;
    let notificationDelayed = false;
    try {
      telegram = await telegramEnquiry(enquiry);
      notificationDelayed = !telegram;
    }
    catch (error) { notificationDelayed = true; console.error("Telegram notification failed after the enquiry was saved", error); }
    return Response.json({
      status: "received",
      telegram,
      notification_delayed: notificationDelayed,
      contact_url: notificationDelayed ? (isBridal ? (process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/message/FMLPL4OHORWNC1") : "https://www.instagram.com/crafts.by.vani") : undefined,
      message: notificationDelayed
        ? `Your enquiry was saved, but the instant notification was delayed. Sorry for the inconvenience—please also message ${isBridal ? "Monika on WhatsApp" : "Vani on Instagram"} for a faster response.`
        : isBridal ? "Your enquiry is saved for Monika to review." : "Your creative enquiry is saved for Vani to review.",
    });
  } catch (error) {
    console.error("Enquiry route failed", error);
    return Response.json({ detail: error instanceof Error ? error.message : "The enquiry could not be saved." }, { status: 502 });
  }
}
