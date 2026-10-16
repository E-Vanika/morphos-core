export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    service: "monika-glamup-web-api",
    integrations: {
      google_sheets: Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      mcp: Boolean(process.env.MCP_API_KEY),
    },
  });
}
