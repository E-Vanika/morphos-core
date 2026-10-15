# Monika Glam Up

A professional bridal beauty website with transparent service pricing, portfolio, AI concierge, private enquiries, moderated client reviews, and MCP tools.

The repository can still build the `Crafts by Vani` variation, but Monika Glam Up is the primary experience.

## Your setup checklist

- [ ] Create the Google Sheet and deploy [the provided Apps Script](docs/google-sheets-apps-script.gs).
- [ ] Add `GOOGLE_SHEETS_WEBHOOK_URL` to GitHub Actions secrets.
- [ ] Add `GEMINI_API_KEY` so the bridal concierge can answer visitors.
- [ ] Add a long random `MCP_API_KEY` for protected MCP access.
- [ ] Check `NEXT_PUBLIC_INSTAGRAM_URL` points to Monika's correct account.
- [ ] Optionally add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for private alerts.
- [ ] Confirm the PDF's unusual ₹400 combined pre-pleating + draping price before publishing it.
- [ ] Push to `main`, wait for the Vercel workflow, and send one test enquiry.
- [ ] Mark a test review `TRUE` in the Sheet's `Approved` column and confirm it appears.

## What is included

- Responsive bridal website using the supplied Monika Glam Up service guide
- Bridal finishes from ₹8,000 to ₹12,000
- Bridesmaid, party makeup, hairstyling, and saree draping services
- Clear package inclusions, add-on notes, booking journey, and FAQs
- AI bridal concierge grounded in the approved service guide
- Google Sheets enquiry storage—no Supabase database required
- Client rating/comment form with approval before publication
- Optional private Telegram alert after an enquiry is saved
- Real MCP endpoint with service-menu, concierge, and enquiry tools
- Existing gallery images served from `apps/web/public/gallery`

## Architecture

```text
Next.js website
  ├─ Service menu and portfolio
  ├─ Enquiry and review forms
  └─ AI concierge
          │
          ▼
FastAPI /api
  ├─ Google Sheets Apps Script (enquiries + moderated reviews)
  ├─ Gemini (AI responses; optional but recommended)
  ├─ Telegram Bot (private alerts; optional)
  └─ MCP JSON-RPC tools
```

Supabase database access is not required for enquiries, ratings, comments, or the service menu. Legacy Supabase routes remain in the API for compatibility, but the Monika site does not call them.

## 1. Connect Google Sheets

Google Sheets is the operational source of truth for enquiries and reviews.

1. Create a blank Google Sheet.
2. Copy the spreadsheet ID from its URL—the text between `/d/` and `/edit`.
3. Open [script.google.com](https://script.google.com), create a **New project**, and paste [docs/google-sheets-apps-script.gs](docs/google-sheets-apps-script.gs) into the editor. This standalone route also works when **Extensions → Apps Script** fails.
4. In **Project Settings → Script properties**, add both values:

   ```text
   WEBHOOK_KEY = a-long-random-secret
   SPREADSHEET_ID = the-id-copied-from-the-sheet-url
   ```

5. Run `setupSheets` once and approve the requested Sheet permission.
6. Choose **Deploy → New deployment → Web app**.
7. Set **Execute as** to yourself and **Who has access** to anyone.
8. Copy the `/exec` deployment URL and append the key:

   ```text
   https://script.google.com/macros/s/DEPLOYMENT_ID/exec?key=a-long-random-secret
   ```

9. Save the complete URL as `GOOGLE_SHEETS_WEBHOOK_URL` in Vercel or GitHub Secrets.

The script creates two tabs:

- `Enquiries`: new leads and their event details
- `Reviews`: submitted ratings and comments

To publish a review on the site, change its `Approved` cell to `TRUE`. Unapproved comments never appear publicly.

If you change the Apps Script code, create a new deployment version. Editing the code alone does not update an existing deployment.

## 2. Configure the AI concierge

Create a Gemini API key and add it as:

```text
GEMINI_API_KEY=your-key
```

The assistant is grounded in the Monika service guide even when Supabase knowledge search is unavailable. It can explain prices, finishes, inclusions, add-ons, and what information a client should provide. It cannot confirm availability or claim that a booking is complete.

Without `GEMINI_API_KEY`, the rest of the website works but chat returns a configuration message.

## 3. Optional Telegram alerts

Google Sheets remains the primary record. Telegram can send Monika an immediate private alert after the Sheet accepts an enquiry.

Add both values only if this is wanted:

```text
TELEGRAM_BOT_TOKEN=123456:bot-token
TELEGRAM_CHAT_ID=123456789
```

The public site does not redirect visitors to WhatsApp or Telegram.

## Environment variables

Backend:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec?key=...
GEMINI_API_KEY=
MCP_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
```

Frontend:

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_KIND=bridal
```

`MCP_API_KEY` should be a long random value. When it is set, callers must send it through `X-MCP-Key`.

## Local development

Requirements:

- Node.js 22+
- Python 3.12+

Install dependencies:

```bash
npm install
python -m pip install -r requirements.txt
```

Run the full Vercel-style application:

```bash
npx vercel dev
```

Or run the two parts separately:

```bash
# Terminal 1
cd apps/web
npm run dev

# Terminal 2
cd apps/api
python -m uvicorn app.main:app --reload --port 8000
```

For separate development, set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `apps/web/.env.local`.

## Build and verify

```bash
npm run build:web
python -m compileall apps/api/app api
```

Useful checks after deployment:

```bash
curl https://YOUR_DOMAIN/api/health

curl -X POST https://YOUR_DOMAIN/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"service":"bridal-makeup","customer_name":"Test Bride","phone":"9876543210","requested_service":"Soft Glam Bridal Look"}'
```

Delete the test row from the Sheet afterward.

## MCP

Endpoint:

```text
POST /api/mcp
Header: X-MCP-Key: your-key
```

Available tools:

- `get_bridal_service_menu` — reads approved service names and prices
- `ask_bridal_concierge` — answers from approved Monika knowledge
- `prepare_bridal_enquiry` — saves an enquiry to Google Sheets; never confirms a booking

List tools:

```bash
curl -X POST https://YOUR_DOMAIN/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-MCP-Key: YOUR_MCP_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## API reference

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Deployment health |
| `POST` | `/api/v1/chat` | AI concierge |
| `POST` | `/api/v1/orders` | Save enquiry to Google Sheets |
| `GET` | `/api/v1/reviews` | Read approved Sheet reviews |
| `POST` | `/api/v1/reviews` | Submit a review for approval |
| `GET` | `/api/v1/skills` | Human-readable skill list |
| `POST` | `/api/mcp` | MCP JSON-RPC endpoint |

## Deployment

The GitHub Actions workflow deploys two Vercel projects:

- `monika-glamup` with `NEXT_PUBLIC_SITE_KIND=bridal`
- `crafts-by-vani` with `NEXT_PUBLIC_SITE_KIND=craft`

Add the required values under **GitHub → Settings → Secrets and variables → Actions**, then push to `main` or run the workflow manually.

The old automatic Supabase migration job has been removed because the customer workflow now uses Google Sheets.

## Important content note

The supplied PDF lists `Pre-Pleating + Draping` at ₹400, which is lower than either service separately. The public website does not advertise that combined price; confirm the intended amount before adding it.
