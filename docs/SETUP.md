# Morphos setup checklist

## 1. Install local prerequisites

Install Node.js 22 LTS and Python 3.12, then restart your terminal. Run `npm install` at the repository root. Create a Python virtual environment, install `apps/api/requirements.txt`, copy both `.env.example` files to `.env`, and start the web/API services.

## 2. Create free accounts

Create accounts using GitHub login where possible: GitHub, Vercel Hobby, Render Free, Supabase Free, and Google AI Studio. Do not attach a card. Create one Supabase project, enable Email auth, and copy its project URL, anon key, and service-role key. Create a Gemini API key in AI Studio.

## 3. GitHub Actions secrets

Add these in **GitHub → repository → Settings → Secrets and variables → Actions**. Never commit them or paste them into chat.

| Name | Where to get it | Used by |
| --- | --- | --- |
| `VERCEL_TOKEN` | Vercel account settings → Tokens | GitHub Actions web deployment |
| `VERCEL_ORG_ID` | Vercel project → Settings → General | GitHub Actions non-interactive project selection |
| `RENDER_DEPLOY_HOOK_URL` | Render service → Settings → Deploy Hook | GitHub Actions API deployment |
| `RENDER_API_URL` | Render service public URL, e.g. `https://morphos-agent-api.onrender.com` | Terraform configures the frontend API URL |
| `SUPABASE_ACCESS_TOKEN` | Supabase dashboard → Account → Access Tokens | GitHub Actions database migration login |
| `SUPABASE_PROJECT_REF` | Supabase project → Settings → General → Reference ID | GitHub Actions selects the database |
| `SUPABASE_DB_PASSWORD` | Password chosen when creating the Supabase project | GitHub Actions applies migrations |
| `SUPABASE_URL` | Supabase project → Settings → API → Project URL | Terraform public frontend configuration |
| `SUPABASE_ANON_KEY` | Supabase project → Settings → API → anon/publishable key | Terraform public frontend configuration |
| `HCP_TERRAFORM_TOKEN` | HCP Terraform → User settings → Tokens | GitHub Actions uses secure remote Terraform state |
| `HCP_TERRAFORM_ORGANIZATION` | HCP Terraform organization name | GitHub Actions selects the state organization |
| `HCP_TERRAFORM_WORKSPACE` | HCP Terraform workspace name | GitHub Actions selects the state workspace |

`SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are **not GitHub secrets in this version**. Enter them directly in Render's environment settings because the deployed API needs them at runtime. Do not add either to Vercel.

## 4. Runtime-only secrets (Render dashboard)

Set Render environment variables: `ALLOWED_ORIGINS` to your Vercel URL, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `INITIAL_ADMIN_EMAIL`, and `DOMAIN_PRESET`.

Terraform writes Vercel's public variables, so do not add them manually. The Supabase URL and anon key are intentionally public browser configuration, not private credentials.

## 5. First deployment order

1. Create a Render Blueprint from `render.yaml`. Add its runtime-only secrets, copy its deploy-hook URL and public URL, then add them to GitHub secrets.
2. Create an HCP Terraform organization and one workspace. Set its execution mode to **Local** so GitHub Actions executes Terraform while HCP stores state. Copy its organization/workspace names and create a user token.
3. Add every GitHub secret in the table above.
4. Push to `main`. `Terraform validation` creates/updates Vercel; `Deploy portfolio` applies the Supabase migration, deploys the frontend, and triggers Render.
5. The workflow automatically reads the Terraform-created Vercel project ID and deploys into it—no project-ID secret or rerun is needed.
6. Visit `/health` on Render, then use the Vercel URL to test the chat and booking demo. The first Gemini response after uploading knowledge may be slower.

## Free-tier behavior

Render Free sleeps after 15 minutes idle; Supabase Free pauses after one inactive week. Both are suitable for a portfolio demo, not a production SLA.
