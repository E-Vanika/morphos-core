# Troubleshooting Guide

## 🔴 Chat Widget Says "Offline"

### ❌ Error: "I'm temporarily offline. Please try again after the API finishes deploying."

**Root Causes:**

#### 1. Missing or Invalid Gemini API Key
```
Problem: GEMINI_API_KEY not set in GitHub Secrets or is expired
Solution:
  ✓ Go to https://aistudio.google.com/
  ✓ Click "Get API Key"
  ✓ Create new API key
  ✓ Add to GitHub Secrets: GEMINI_API_KEY
  ✓ Re-run deployment (GitHub Actions → Re-run job)
```

#### 2. Supabase Connection Issues
```
Problem: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL incorrect
Solution:
  ✓ Verify Supabase Project exists: https://app.supabase.com/
  ✓ Go to Settings → API
  ✓ Copy exact URL: https://xxxxx.supabase.co
  ✓ Copy Service Role Key (starts with eyJ...)
  ✓ Update GitHub Secrets
  ✓ Wait for deployment to complete
  ✓ Test: curl https://your-site.vercel.app/api/health
```

#### 3. API Endpoint Not Responding
```
Check:
  ✓ Vercel deployment status (GitHub → Actions → check logs)
  ✓ No errors in Vercel Function logs
  ✓ API can be reached: https://your-site.vercel.app/api/v1/chat returns HTTP response
```

#### 4. CORS Issues (Different Domain)
```
Problem: Frontend on domain A, API on domain B
Solution:
  ✓ Add your domain to ALLOWED_ORIGINS GitHub Secret
  ✓ Format: https://your-domain.vercel.app
  ✓ Multiple domains: comma-separated
  ✓ Redeploy to apply
```

### ✅ Test the API Directly

```bash
# 1. Health Check
curl https://your-site.vercel.app/api/health

# Expected: {"status":"ok","service":"morphos-agent","version":"0.1.0"}

# 2. Chat Endpoint (no knowledge yet)
curl -X POST https://your-site.vercel.app/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","domain":"bridal-makeup"}'

# Expected: {"answer":"I am the Monika Glam Up assistant...","skills_available":[...],"sources":[]}
```

---

## 📤 Cannot Upload Knowledge Documents

### ❌ Error: "Sign in as an administrator to upload knowledge"

**Steps to Fix:**

1. **Create Supabase Auth Account**
   ```
   Go to: https://your-site.vercel.app
   Sign up → Use your email
   Verify email (check inbox)
   ```

2. **Add Email to Admin List**
   ```
   GitHub → Settings → Secrets
   Edit ADMIN_EMAILS
   Add your email: admin@example.com
   Redeploy
   ```

3. **Get Your Supabase Access Token**
   ```
   Go to: https://app.supabase.com/ → Account → Access Tokens
   Create new token
   Copy token (store securely)
   ```

4. **Upload Document**
   ```bash
   curl -X POST https://your-site.vercel.app/api/v1/admin/documents \
     -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
     -F "file=@pricing.pdf"
   ```

### ❌ Error: "Invalid access token"

**Solution:**
- Token is expired or incorrect
- Generate new token at: https://app.supabase.com/ → Account → Access Tokens
- Use token immediately (they expire after 1 hour)

### ❌ Error: "Only configured administrators can perform this action"

**Solution:**
- Your email is not in `ADMIN_EMAILS` GitHub Secret
- Add your email → Redeploy → Sign in again
- Verify your Supabase account email matches `ADMIN_EMAILS`

---

## 📊 No Results from Chat

### ❌ Chat Says: "I could not generate an answer" or Generic Response

**Possible Causes:**

#### 1. No Knowledge Uploaded Yet
```
Check: Has any document been uploaded?
  ✓ Supabase Dashboard → SQL Editor
  ✓ SELECT COUNT(*) FROM knowledge_chunks;
  ✓ Should return > 0
  
If 0: Upload a PDF/document first using admin endpoint
```

#### 2. Wrong Domain Used
```
Problem: Asking in one domain, knowledge uploaded to another
Example: Knowledge in "bridal-makeup" but chat uses "art-craft"

Solution:
  ✓ Check domain used in chat request
  ✓ Upload knowledge to correct domain
  ✓ Use same domain in chat query
```

#### 3. Query Doesn't Match Knowledge
```
Problem: Asking questions unrelated to uploaded knowledge
Example: Uploaded pricing list, asked about company history

Solution:
  ✓ Upload comprehensive knowledge base
  ✓ Include FAQ, pricing, services, etc.
  ✓ Test with questions directly in documents
```

### ✅ Debug Vector Search

```bash
# Check if embeddings exist
curl https://your-site.vercel.app/api/health

# Check database directly
Supabase Dashboard → SQL Editor → Run:
SELECT COUNT(*) FROM knowledge_chunks WHERE embedding IS NOT NULL;

# Should return > 0
```

---

## 🗄️ Database Connection Errors

### ❌ Error: "Supabase URL is missing"

**Solution:**
```
GitHub Secrets → Add/Update SUPABASE_URL
Format: https://your-project-id.supabase.co
Get it from: Supabase Dashboard → Settings → API → Project URL
```

### ❌ Error: "Supabase service role key is missing"

**Solution:**
```
GitHub Secrets → Add/Update SUPABASE_SERVICE_ROLE_KEY
Get it from: Supabase Dashboard → Settings → API → Service Role Key
⚠️ Keep this secret! Do NOT commit to git
```

### ❌ Error: "Database connection failed"

**Steps:**

1. **Verify Database is Running**
   ```
   Supabase Dashboard → Check project status
   Should show: Project is running
   ```

2. **Check Migrations Were Applied**
   ```
   Supabase Dashboard → Migrations
   Should see: 202607190001, 202607230002, 202607230003, 202607230004
   All should be green checkmarks
   ```

3. **Manual Migration**
   ```
   Supabase Dashboard → SQL Editor
   Paste contents of: supabase/migrations/*.sql
   Execute each migration
   Verify: SELECT * FROM information_schema.tables WHERE table_schema='public';
   ```

4. **Verify Vector Extension**
   ```sql
   -- Run in Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS vector;
   SELECT * FROM pg_extension WHERE extname = 'vector';
   -- Should return one row
   ```

---

## 🚀 Deployment Failures

### ❌ GitHub Action Error: "Workflow Failure in Deploy"

**Check Logs:**
```
GitHub → Your Repo → Actions → Failed Workflow → Expand logs
```

**Common Issues:**

#### 1. Invalid Supabase Credentials
```
Error: "Failed to link project"
Solution:
  ✓ Verify SUPABASE_PROJECT_REF (just the ID, no URL)
  ✓ Verify SUPABASE_DB_PASSWORD (password you set during setup)
  ✓ Verify SUPABASE_ACCESS_TOKEN is valid
```

#### 2. Invalid Vercel Token
```
Error: "Invalid Vercel token"
Solution:
  ✓ Go to: https://vercel.com/account/tokens
  ✓ Create new token (full access)
  ✓ Update VERCEL_TOKEN GitHub Secret
  ✓ Retry deployment
```

#### 3. Missing Required Secrets
```
Error: "env variable not found"
Solution:
  ✓ Check GitHub Secrets section (Settings → Secrets)
  ✓ Add ALL secrets from table in README.md
  ✓ Verify no typos in secret names
  ✓ Re-run workflow
```

### ✅ Manual Rerun

```
GitHub → Actions → Failed Workflow → "Re-run job"
```

---

## 🔐 MCP Skills Not Working

### ❌ Error: "A valid X-MCP-Key is required"

**Solution:**

```bash
# Include X-MCP-Key header
curl -H "X-MCP-Key: YOUR_MCP_API_KEY" \
  https://your-site.vercel.app/api/v1/skills
```

### ❌ Skills Return Empty List

**Cause:** Skills are defined but not yet implemented

**Current Status:**
- ✅ Skills endpoint works
- ✅ Returns skill definitions
- ❌ Actual skill execution not yet implemented

**To Enable Skill Execution:**
1. Extend Gemini to use `tools` parameter
2. Implement skill handler endpoints
3. Add database tables for providers, availability, bookings

---

## 💾 Resetting Database

### ⚠️ Danger: This will delete all data

```bash
# Option 1: Through Supabase Dashboard
Supabase → Settings → Database → Danger Zone → Reset Database

# Option 2: Manual approach
1. Backup your data first!
2. Delete all tables
3. Re-run migrations
4. Re-upload knowledge documents
```

---

## 📊 Performance Issues

### ❌ Chat Takes > 3 seconds

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Large knowledge base (1000+ docs) | Consider dedicated vector DB (Pinecone, Weaviate) |
| Slow Gemini API | Normal during peak hours; add caching layer |
| Cold start (first request) | Vercel keeps functions warm; repeat request |
| Network latency | Check: curl times, Vercel region |

### ✅ Optimize Performance

```python
# apps/api/app/main.py
# Option 1: Increase Vercel function timeout
# In vercel.json: "maxDuration": 120

# Option 2: Reduce chunk search count
def retrieve_context(message: str) -> tuple[str, list[str]]:
    rows = supabase_client().rpc(
        "match_knowledge_chunks",
        {"query_embedding": embed(message), "match_count": 2}  # Reduced from 4
    )
```

---

## 🔍 Debugging Tips

### 1. Enable Verbose Logging

```bash
# In apps/api/.env or GitHub Secrets
LOG_LEVEL=DEBUG
```

### 2. Check API Response Headers

```bash
curl -i https://your-site.vercel.app/api/health

# Look for:
# X-Request-ID: [unique request ID]
# Use this to find logs in Vercel dashboard
```

### 3. Monitor Vercel Logs

```
Vercel Dashboard → Select Project → Logs
Filter by function: api/index.py
```

### 4. Test Each Component

```bash
# 1. Frontend can reach API
curl https://your-site.vercel.app/api/health

# 2. API can reach Gemini
# (No direct test; check error responses)

# 3. API can reach Supabase
curl -X GET "https://your-site.vercel.app/api/v1/db-health"
```

---

## 📚 Getting Help

**Still stuck?**

1. **Check error in browser console** (F12 → Console tab)
2. **Look at Vercel function logs** (Vercel Dashboard → Logs)
3. **Verify all GitHub Secrets are set** (Settings → Secrets)
4. **Re-run deployment** (GitHub Actions → Re-run job)
5. **Test with curl** (see above examples)
6. **Read logs carefully** (often shows exact issue)

---

## 🆘 Emergency Commands

### Reset Everything (Local Dev)

```bash
# Remove all local state
rm -rf .vercel
rm -rf apps/web/.next
rm -rf apps/web/node_modules

# Fresh install
npm install

# Fresh local dev
vercel dev
```

### Force Redeployment

```
GitHub → Actions → Deploy Portfolio → Run Workflow
```

### Check All Secrets Are Present

```bash
# Run locally (for testing)
# Create .env.local in apps/api and apps/web
# Must have all values from .env.example

# Verify:
echo $GEMINI_API_KEY       # Should not be empty
echo $SUPABASE_URL        # Should be https://...
echo $SUPABASE_SERVICE_ROLE_KEY  # Should start with eyJ...
```
