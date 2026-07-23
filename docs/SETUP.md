# Morphos deployment checklist

This project uses one Vercel project for both the Next.js frontend and the FastAPI API. The API is served on the same domain under `/api`, so Render and Terraform are not required.

## 1. Create accounts and project

Create free accounts for GitHub, Vercel, Supabase, and Google AI Studio. In Supabase, create one project and enable Email auth. Copy its Project URL, anon/publishable key, project reference ID, and database password. Create a Gemini API key in Google AI Studio.

No Vercel dashboard configuration is required. GitHub Actions creates and deploys the Vercel project using your Vercel token. The included `vercel.json` builds the web app and deploys the Python API function together.

## 2. GitHub Actions secrets

In **GitHub → repository → Settings → Secrets and variables → Actions**, set only:

| Name | Where to get it |
| --- | --- |
| `VERCEL_TOKEN` | Vercel account settings → Tokens |
| `SUPABASE_ACCESS_TOKEN` | Supabase dashboard → Account → Access Tokens |
| `SUPABASE_PROJECT_REF` | Supabase project → Settings → General → Reference ID |
| `SUPABASE_DB_PASSWORD` | Password selected while creating the Supabase project |
| `SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase project → Settings → API → anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API → service-role key |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `MCP_API_KEY` | A unique, random 32+ character value |
| `INITIAL_ADMIN_EMAIL` | Email address permitted to upload knowledge |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Full Instagram profile URL, e.g. `https://instagram.com/yourname` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number with country code and digits only, e.g. `919876543210` |
| `NEXT_PUBLIC_ART_IMAGE_URL` | Public Supabase Storage URL for the featured Art & Craft image |
| `NEXT_PUBLIC_BRIDAL_IMAGE_URL` | Public Supabase Storage URL for the featured Bridal Makeup image |

The deploy workflow applies Supabase migrations first, then creates or updates two Vercel projects: `crafts-by-vani` and `monika-glamup`. The runtime secrets are passed directly from GitHub Actions and are not committed to the repository.

## 3. Deploy and verify

Commit and push to `main`. In GitHub Actions, wait for **Deploy portfolio** to succeed. Then verify:

1. Open `https://your-project.vercel.app/api/health` — it should return an `ok` status.
2. Open the Vercel site and send a concierge question.
3. If you use the protected skills endpoint, send `X-MCP-Key: <MCP_API_KEY>` to `GET /api/v1/skills`.

For local Vercel-style development, set the environment variables above in a local `.env` file and run `npx vercel dev`. If you run FastAPI separately on port 8000, set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `apps/web/.env.local`.
