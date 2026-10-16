import { timingSafeEqual } from "node:crypto";
import { geminiAnswer, sheetsPost, telegramEnquiry } from "../../../lib/server-integrations";
import { MONIKA_PRICES } from "../../../lib/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const services = [
  { category: "bridal", name: "Matte Finish Bridal Look", price: MONIKA_PRICES.matte },
  { category: "bridal", name: "Soft Glam Bridal Look", price: MONIKA_PRICES.softGlam },
  { category: "bridal", name: "Skin Finish Bridal Look", price: MONIKA_PRICES.skinFinish },
  { category: "bridal", name: "Glow Finish Bridal Look", price: MONIKA_PRICES.glow },
  { category: "bridesmaid", name: "Bridesmaid Makeup Package", price: MONIKA_PRICES.bridesmaid },
  { category: "party", name: "Party Makeup Package", price: MONIKA_PRICES.party },
  { category: "hair", name: "Bridal Hairstyling", price: MONIKA_PRICES.bridalHair },
  { category: "saree", name: "Saree Draping", price: MONIKA_PRICES.sareeDraping },
];

const tools = [
  { name: "get_bridal_service_menu", description: "Return Monika Glam Up's published services and starting prices.", inputSchema: { type: "object", properties: { category: { type: "string", enum: ["bridal", "bridesmaid", "party", "hair", "saree"] } }, additionalProperties: false } },
  { name: "ask_bridal_concierge", description: "Answer from the retrieved Monika Glam Up service knowledge.", inputSchema: { type: "object", properties: { message: { type: "string", minLength: 1, maxLength: 2000 } }, required: ["message"], additionalProperties: false } },
  { name: "prepare_bridal_enquiry", description: "Save a private enquiry to Google Sheets and send an optional Telegram alert. This does not confirm a booking.", inputSchema: { type: "object", properties: { customer_name: { type: "string", minLength: 2 }, phone: { type: "string", minLength: 6 }, requested_service: { type: "string" }, event_date: { type: "string" }, event_time: { type: "string" }, event_place: { type: "string" }, client_count: { type: "integer", minimum: 1, maximum: 50 }, details: { type: "string" } }, required: ["customer_name", "phone", "requested_service"], additionalProperties: false } },
];

function authorised(request: Request) {
  const expected = process.env.MCP_API_KEY;
  const supplied = request.headers.get("x-mcp-key");
  if (!expected || !supplied) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

function rpcResult(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: unknown, code: number, message: string, status = 400) {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } }, { status });
}

export async function POST(request: Request) {
  if (!authorised(request)) return rpcError(null, -32001, "A valid X-MCP-Key is required.", 401);
  let payload: { id?: unknown; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };
  try { payload = await request.json(); }
  catch { return rpcError(null, -32700, "Parse error"); }
  const id = payload.id ?? null;
  if (payload.method === "initialize") return rpcResult(id, { protocolVersion: "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "monika-glam-up", version: "1.0.0" } });
  if (payload.method === "notifications/initialized") return rpcResult(id, {});
  if (payload.method === "tools/list") return rpcResult(id, { tools });
  if (payload.method !== "tools/call") return rpcError(id, -32601, "Method not found");

  const name = payload.params?.name;
  const args = payload.params?.arguments ?? {};
  try {
    if (name === "get_bridal_service_menu") {
      const category = typeof args.category === "string" ? args.category : "";
      const menu = category ? services.filter(service => service.category === category) : services;
      return rpcResult(id, { content: [{ type: "text", text: JSON.stringify(menu) }] });
    }
    if (name === "ask_bridal_concierge") {
      const message = typeof args.message === "string" ? args.message.trim() : "";
      if (!message) throw new Error("message is required");
      const result = await geminiAnswer(message);
      return rpcResult(id, { content: [{ type: "text", text: result.answer }], _meta: { sources: result.sources } });
    }
    if (name === "prepare_bridal_enquiry") {
      const customerName = typeof args.customer_name === "string" ? args.customer_name.trim() : "";
      const phone = typeof args.phone === "string" ? args.phone.trim() : "";
      const requestedService = typeof args.requested_service === "string" ? args.requested_service.trim() : "";
      if (customerName.length < 2 || phone.length < 6 || !requestedService) throw new Error("customer_name, phone, and requested_service are required");
      const enquiry = { ...args, service: "bridal-makeup", customer_name: customerName, phone, requested_service: requestedService };
      await sheetsPost("new_enquiry", enquiry);
      try { await telegramEnquiry(enquiry); } catch (error) { console.error("MCP Telegram alert failed after save", error); }
      return rpcResult(id, { content: [{ type: "text", text: "The enquiry was saved for Monika to review. Availability is not yet confirmed." }] });
    }
    return rpcError(id, -32602, `Unknown tool: ${name ?? ""}`);
  } catch (error) {
    return rpcResult(id, { content: [{ type: "text", text: error instanceof Error ? error.message : "Tool call failed" }], isError: true });
  }
}
