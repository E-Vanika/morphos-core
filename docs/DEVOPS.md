# 🔧 DevOps & Technical Reference

Detailed technical documentation for infrastructure, deployment, and operations.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Repository                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  .github/workflows/                                      │   │
│  │  ├─ deploy.yml          (Trigger: push to main)         │   │
│  │  └─ ci.yml              (Lint & test)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                       │
│                   GitHub Actions                                │
│         ┌─────────────────────────────────┐                    │
│         │  1. Supabase DB Migration       │                    │
│         │  (supabase db push --linked)    │                    │
│         └─────────────────────────────────┘                    │
│                          ↓                                       │
│         ┌─────────────────────────────────┐                    │
│         │  2. Vercel Deployment           │                    │
│         │  (npx vercel deploy --prod)     │                    │
│         └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
         ↓                           ↓
    ┌─────────────┐            ┌──────────────┐
    │   Vercel    │            │  Supabase    │
    │  (Frontend  │            │ (Database)   │
    │  + API)     │            │   + Auth     │
    └──────┬──────┘            └──────┬───────┘
           │                          │
           └──────────────┬───────────┘
                          ↓
                   Google Gemini API
                 (embeddings + chat)
```

---

## 🔑 Environment Variables Reference

### Build-Time Variables (Next.js)

Set in `--build-env` during Vercel deployment:

```bash
NEXT_PUBLIC_SUPABASE_URL              # Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY         # Public anon key
NEXT_PUBLIC_API_URL                   # API endpoint (/api for same domain)
NEXT_PUBLIC_SITE_KIND                 # bridal OR craft (per deployment)
NEXT_PUBLIC_INSTAGRAM_URL             # Social link
NEXT_PUBLIC_WHATSAPP_NUMBER           # Contact number
NEXT_PUBLIC_ART_IMAGE_URL             # CDN URL for art featured image
NEXT_PUBLIC_BRIDAL_IMAGE_URL          # CDN URL for bridal featured image
```

### Runtime Variables (FastAPI Backend)

Set in `--env` during Vercel deployment + Supabase secrets:

```bash
# Critical (no API works without these)
SUPABASE_URL                          # Database URL
SUPABASE_SERVICE_ROLE_KEY             # Service auth token
GEMINI_API_KEY                        # Google Gemini API key

# Security & Configuration
MCP_API_KEY                           # Machine-to-machine API key
ADMIN_EMAILS                          # Comma-separated admin emails
ALLOWED_ORIGINS                       # CORS origins (comma-separated)

# Optional
CRAFTS_BUCKET                         # Supabase Storage bucket for art images
BRIDAL_BUCKET                         # Supabase Storage bucket for bridal images
DOMAIN_PRESET                         # Default domain profile
LOG_LEVEL                             # DEBUG, INFO, WARNING, ERROR
```

### How Variables Are Passed

**GitHub Actions Workflow:**

```yaml
# deploy.yml
- name: Deploy to Vercel
  run: |
    runtime_vars=(
      "SUPABASE_URL=${{ secrets.SUPABASE_URL }}"
      "GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}"
      # ... more vars
    )
    build_vars=(
      "NEXT_PUBLIC_SUPABASE_URL=${{ secrets.SUPABASE_URL }}"
      # ... more vars
    )
    # Arrays passed to npx vercel
    for value in "${runtime_vars[@]}"; do
      args+=(--env "$value")
    done
    for value in "${build_vars[@]}"; do
      args+=(--build-env "$value")
    done
    npx vercel deploy "${args[@]}"
```

**⚠️ Important:**
- `NEXT_PUBLIC_*` are exposed to browser (safe to public)
- Everything else is server-side only (secure)
- `GEMINI_API_KEY` never reaches frontend
- GitHub Secrets are not logged or printed

---

## 🗄️ Database Schema

### Vector Embeddings for RAG

```sql
-- Table: knowledge_documents
-- Stores metadata about uploaded files
CREATE TABLE public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id text NOT NULL,              -- professional-services, bridal-makeup, etc.
  storage_path text NOT NULL UNIQUE,    -- Supabase Storage path
  filename text NOT NULL,               -- Original filename (shown in responses)
  uploaded_by uuid NOT NULL,            -- Supabase user ID
  created_at timestamptz DEFAULT now()
);

-- Table: knowledge_chunks
-- Text segments with vector embeddings for similarity search
CREATE TABLE public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,            -- References knowledge_documents
  content text NOT NULL,                -- Chunk text (1200 chars)
  embedding vector(768),                -- 768-dim Gemini embedding
  created_at timestamptz DEFAULT now()
);

-- Custom RPC: Vector similarity search
CREATE FUNCTION match_knowledge_chunks(
  query_embedding vector(768),
  match_count int default 4
)
RETURNS TABLE (id uuid, content text, filename text, similarity float)
LANGUAGE SQL STABLE
AS $$
  SELECT chunks.id, chunks.content, documents.filename,
         1 - (chunks.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks AS chunks
  JOIN knowledge_documents AS documents 
    ON documents.id = chunks.document_id
  WHERE chunks.embedding IS NOT NULL
  ORDER BY chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Index: Speed up vector similarity search
CREATE INDEX ON public.knowledge_chunks 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

### pgvector Configuration

```sql
-- Install pgvector extension (must be done once)
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT extname FROM pg_extension WHERE extname = 'vector';

-- Vector similarity operators:
-- <->  cosine distance (default)
-- <#>  negative inner product
-- <=>  L2 distance (Euclidean)
```

### Other Core Tables

```sql
CREATE TABLE public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id text NOT NULL,
  name text NOT NULL,
  specialty text NOT NULL,
  profile jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id),
  customer_id uuid,
  guest_email text,
  starts_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.domain_profiles (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

---

## 🚀 Deployment Pipeline

### Step 1: Database Migration

**Trigger:** GitHub Actions on push to `main`

```bash
# Supabase CLI links to project
supabase link --project-ref "$SUPABASE_PROJECT_REF" \
              --password "$SUPABASE_DB_PASSWORD"

# Applies all migrations in supabase/migrations/
supabase db push --linked

# Results:
# - Creates all tables
# - Installs pgvector extension
# - Sets up RPC functions
# - Enables Row-Level Security (RLS)
```

**Migrations Applied:**
1. `202607190001_initial.sql` - Core schema + pgvector setup
2. `202607230002_order_requests.sql` - Booking requests table
3. `202607230003_services.sql` - Service listings
4. `202607230004_knowledge_sources.sql` - RAG-specific tables + match_knowledge_chunks RPC

### Step 2: Vercel Deployment

**Trigger:** After database migration completes

```bash
npx vercel deploy --prod \
  --name "crafts-by-vani" \
  --token "$VERCEL_TOKEN" \
  --env SUPABASE_URL="$SUPABASE_URL" \
  --env GEMINI_API_KEY="$GEMINI_API_KEY" \
  --build-env NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
```

**Deployment Steps:**
1. Build Next.js app: `npm run build:web`
2. Package FastAPI (python/index.py) as serverless function
3. Deploy to Vercel CDN + Functions
4. Set environment variables
5. Create domain: `crafts-by-vani.vercel.app`

**Result:**
```
Frontend:  https://crafts-by-vani.vercel.app/ (Next.js on CDN)
API:       https://crafts-by-vani.vercel.app/api/ (FastAPI Function)
```

### Step 3: Two Sites, One Codebase

**workflow deploys TWO separate Vercel projects:**

```bash
# Site 1: Art & Craft
deploy_site crafts-by-vani craft
# NEXT_PUBLIC_SITE_KIND=craft

# Site 2: Bridal Makeup
deploy_site monika-glamup bridal
# NEXT_PUBLIC_SITE_KIND=bridal
```

**Each has:**
- Own Vercel project
- Own custom domain
- Shared Supabase backend
- Domain-specific system prompts

---

## 📈 API Endpoints

### Public Endpoints (No Auth)

```
GET  /api/health
     Returns: {"status":"ok","service":"morphos-agent","version":"0.1.0"}

POST /api/v1/chat
     Request: {"message":"Hello","domain":"bridal-makeup"}
     Returns: {"answer":"...","skills_available":[...],"sources":[]}

GET  /api/v1/services?site=bridal
     Returns: [{"id":"...","name":"...","price":"..."}]

GET  /api/v1/gallery?site=craft
     Returns: {"images":["https://...", ...]}
```

### Protected Endpoints (Admin)

```
POST /api/v1/admin/documents
     Header: Authorization: Bearer <SUPABASE_TOKEN>
     Body: FormData with file
     Returns: {"status":"indexed","chunks":"42"}

POST /api/v1/services
     Header: Authorization: Bearer <SUPABASE_TOKEN>
     Body: {"site":"bridal","name":"...","price":"..."}

PATCH /api/v1/services/{id}
     Header: Authorization: Bearer <SUPABASE_TOKEN>
     Updates service

DELETE /api/v1/services/{id}
     Header: Authorization: Bearer <SUPABASE_TOKEN>
```

### MCP Endpoints

```
GET /api/v1/skills
    Header: X-MCP-Key: <MCP_API_KEY>
    Returns: [{"id":"search_providers",...}, ...]
```

---

## 🔐 Security Considerations

### Secret Management

| Secret | Storage | Usage | Risk |
|--------|---------|-------|------|
| `GEMINI_API_KEY` | GitHub Secrets | Backend only | High (API billing) |
| `SUPABASE_SERVICE_ROLE_KEY` | GitHub Secrets | Backend only | Critical (full DB access) |
| `VERCEL_TOKEN` | GitHub Secrets | Deployment | High (can deploy code) |
| `MCP_API_KEY` | GitHub Secrets | Machine auth | Medium (skills access) |
| `SUPABASE_ANON_KEY` | Frontend env | Public client auth | Low (limited by RLS) |

### Row-Level Security (RLS)

```sql
-- Only public data visible without auth
CREATE POLICY "public can read domains" 
  ON public.domain_profiles 
  FOR SELECT USING (true);

CREATE POLICY "public can read providers" 
  ON public.providers 
  FOR SELECT USING (true);

-- Users can only read their own data
CREATE POLICY "users read own bookings" 
  ON public.bookings 
  FOR SELECT USING (auth.uid() = customer_id);
```

### API Rate Limiting

```python
# Built-in memory-based rate limiting
CHAT_RATE_LIMIT = 12        # requests
CHAT_RATE_WINDOW_SECONDS = 60  # per client IP per minute

# For production:
# - Add Vercel Edge Middleware
# - Use API Gateway WAF rules
# - Consider Redis for distributed rate limiting
```

---

## 🔧 Monitoring & Logging

### Vercel Logs

Access at: `Vercel Dashboard → Select Project → Logs`

```json
{
  "event": "request_completed",
  "request_id": "abc-123-def-456",
  "method": "POST",
  "path": "/api/v1/chat",
  "status_code": 200,
  "duration_ms": 1234
}
```

### Log Levels

```python
# Set via LOG_LEVEL environment variable
DEBUG   - Verbose: all function calls, variable values
INFO    - Standard: request/response summary
WARNING - Issues: slow queries, missing data
ERROR   - Failures: exceptions, API errors
```

### Structured Logging

All logs are JSON with:
- `event` - What happened
- `request_id` - Trace requests across services
- `duration_ms` - Performance monitoring
- Never logs: secrets, message content, PII

---

## 🎯 Performance Optimization

### Vector Search Performance

```sql
-- Current: Linear scan (O(n))
-- Suitable for: < 1 million vectors

-- Optimize with IVFFlat index (approximate)
CREATE INDEX ON knowledge_chunks 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- For enterprise scale (> 1M vectors):
-- Consider: Pinecone, Weaviate, or Milvus
```

### Function Timeout

```json
// vercel.json
{
  "functions": {
    "api/index.py": {
      "maxDuration": 60  // seconds, max 900 on Pro plan
    }
  }
}
```

### Gemini API Costs

```
Embeddings: $0.02 per million tokens
Chat (Flash): $0.075 per million input tokens
Chat (Pro):   $0.30 per million input tokens

Example cost (100 requests/day):
- Embeddings: ~$0.015/day = $0.45/month
- Chat: ~$0.30/day = $9/month
- Total: ~$10/month for small usage
```

### Supabase Costs

```
Free tier: 500 MB storage, unlimited API calls
           Good for: < 10k users, < 500 documents

Pro tier:  $25/month + usage
           Good for: > 10k users, enterprise features
```

---

## 🚨 Common DevOps Issues

### Timeout on Large Documents

```
Problem: Uploading 100+ MB document
Solution:
  1. Increase maxDuration in vercel.json
  2. Chunk externally before upload
  3. Use background job service
```

### Rate Limiting Users

```
Current: 12 req/min per IP (in-memory)
Production: Use Vercel Edge Middleware
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "60s"),
  });
```

### Cold Start Latency

```
First request: ~1-2 seconds
Subsequent: ~100-500ms

Improve:
  - Vercel Pro keeps functions warm
  - Pre-warm with health check cronjob
  - Optimize imports in api/index.py
```

---

## 📊 Scaling Considerations

### When to Scale Up

| Metric | Threshold | Action |
|--------|-----------|--------|
| Vectors | 500k+ | Switch to Pinecone/Weaviate |
| Requests | 100/sec | Add caching layer (Redis) |
| Storage | 10GB+ | Archive old documents |
| Latency | >2sec | Optimize Gemini calls |

### Scaling Architecture

```
Current (Single Vercel + Single Supabase)
├─ Suitable for: < 100k users, < 1M vectors
├─ Cost: ~$100-500/month
└─ Latency: 500ms-2s

Future (Multi-region)
├─ Vercel Edge: Global CDN
├─ Pinecone/Weaviate: Distributed vector search
├─ Redis: Caching layer
├─ Supabase Read Replicas: Geographic SQL nodes
└─ Suitable for: 1M+ users
```

---

## 🧪 Testing & CI/CD

### Local Testing

```bash
# Frontend
cd apps/web
npm run lint      # Check code style
npm run test      # Run vitest suite
npm run build     # Test production build

# Backend
cd apps/api
python -m pytest  # Run tests (if added)
python -m black .  # Format code
```

### CI Pipeline (ci.yml)

```yaml
# Runs on every push
- Lint Next.js
- Lint Python
- Run tests
- Type check TypeScript
```

---

## 📚 Infrastructure as Code

### Current: GitHub Actions + Vercel

- ✅ Zero infrastructure to manage
- ✅ Auto-scaling
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ❌ Limited to Vercel/Supabase ecosystem

### Alternative: Terraform

Could add:
```hcl
resource "vercel_project" "morphos" {
  name = "morphos-core"
  git_repository = "github-org/morphos-core"
}

resource "supabase_project" "morphos_db" {
  name = "morphos-production"
  region = "us-east-1"
}
```

---

## 🔍 Debugging Commands

```bash
# Check deployment status
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v9/projects

# Test API health
curl https://your-site.vercel.app/api/health

# Check vector count
# (Run in Supabase SQL Editor)
SELECT COUNT(*) FROM knowledge_chunks WHERE embedding IS NOT NULL;

# Test Gemini API
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

## 📖 References

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://ai.google.dev/)
