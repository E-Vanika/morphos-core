# Morphos deployment checklist

This project uses one Vercel project for both the Next.js frontend and the FastAPI API. The API is served on the same domain under `/api`, so Render and Terraform are not required.

## 1. Create accounts and project

Create free accounts for GitHub, Vercel, Supabase, and Google AI Studio. In Supabase, create one project and enable Email auth. Copy its Project URL, anon/publishable key, project reference ID, and database password. Create a Gemini API key in Google AI Studio.

Import this repository into Vercel as a single project. Leave the Root Directory set to the repository root; the included `vercel.json` builds the web app and deploys the Python API function together.

## 2. Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, create these values for **Production**, **Preview**, and **Development**:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API → service-role key |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `MCP_API_KEY` | A unique, random 32+ character value |
| `INITIAL_ADMIN_EMAIL` | The email address allowed to upload knowledge |
| `DOMAIN_PRESET` | `professional-services` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `NEXT_PUBLIC_API_URL` | `/api` |

`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, and `MCP_API_KEY` are private server-side credentials. Never put them in a browser-prefixed `NEXT_PUBLIC_` variable or in GitHub repository secrets.

## 3. GitHub Actions secrets

In **GitHub → repository → Settings → Secrets and variables → Actions**, set only:

| Name | Where to get it |
| --- | --- |
| `VERCEL_TOKEN` | Vercel account settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General |
| `SUPABASE_ACCESS_TOKEN` | Supabase dashboard → Account → Access Tokens |
| `SUPABASE_PROJECT_REF` | Supabase project → Settings → General → Reference ID |
| `SUPABASE_DB_PASSWORD` | Password selected while creating the Supabase project |

The deploy workflow applies Supabase migrations first, then deploys the same Vercel project containing the frontend and API.

## 4. Deploy and verify

Commit and push to `main`. In GitHub Actions, wait for **Deploy portfolio** to succeed. Then verify:

1. Open `https://your-project.vercel.app/api/health` — it should return an `ok` status.
2. Open the Vercel site and send a concierge question.
3. If you use the protected skills endpoint, send `X-MCP-Key: <MCP_API_KEY>` to `GET /api/v1/skills`.

For local Vercel-style development, set the environment variables above in a local `.env` file and run `npx vercel dev`. If you run FastAPI separately on port 8000, set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `apps/web/.env.local`.
