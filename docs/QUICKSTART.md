# 🚀 Quick Start Checklist

Use this checklist to deploy Morphos Core in < 15 minutes.

## ✅ Phase 1: Create Accounts (5 min)

- [ ] GitHub account ([github.com](https://github.com))
- [ ] Vercel account ([vercel.com](https://vercel.com)) - Connect GitHub
- [ ] Supabase account ([supabase.com](https://supabase.com))
- [ ] Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

**Supabase Setup:**
- [ ] Create new project
- [ ] Note: Project URL (Settings → API)
- [ ] Note: Anon Key (Settings → API)
- [ ] Note: Service Role Key (Settings → API) ⚠️ Keep secret!
- [ ] Note: Reference ID (Settings → General)
- [ ] Note: Database password (you created during signup)

## ✅ Phase 2: Fork & Configure Repository (5 min)

- [ ] Fork: [github.com/E-Vanika/morphos-core](https://github.com/E-Vanika/morphos-core)
- [ ] Clone to your machine:
  ```bash
  git clone https://github.com/YOUR_USERNAME/morphos-core.git
  cd morphos-core
  ```

## ✅ Phase 3: Add GitHub Secrets (3 min)

Go to: **GitHub** → **Your Repo** → **Settings** → **Secrets and variables** → **Actions**

Create these secrets (copy-paste values exactly):

| Secret Name | Your Value |
|---|---|
| `VERCEL_TOKEN` | From https://vercel.com/account/tokens (create new token) |
| `SUPABASE_ACCESS_TOKEN` | From Supabase Dashboard → Account → Access Tokens |
| `SUPABASE_PROJECT_REF` | Project ID (just the ID, not the full URL) |
| `SUPABASE_DB_PASSWORD` | Password you set during Supabase signup |
| `SUPABASE_URL` | From Supabase Settings → API (e.g., https://xxx.supabase.co) |
| `SUPABASE_ANON_KEY` | From Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Settings → API (⚠️ Keep secret) |
| `GEMINI_API_KEY` | From https://aistudio.google.com (Get API Key) |
| `MCP_API_KEY` | Generate random: `openssl rand -hex 16` |
| `ADMIN_EMAILS` | Your email: `you@example.com` |
| `CRAFTS_BUCKET` | `Art and craft` |
| `BRIDAL_BUCKET` | `Monika glamup` |

## ✅ Phase 4: Deploy (2 min)

```bash
# Push to trigger deployment
git push origin main

# Monitor: GitHub → Actions → "Deploy portfolio"
# Wait for ✅ All checks passed
```

## ✅ Phase 5: Verify (Time varies)

Once GitHub Actions completes:

1. **Health Check**
   ```bash
   curl https://your-app.vercel.app/api/health
   # Should return: {"status":"ok",...}
   ```

2. **Visit Site**
   - Go to: `https://your-app.vercel.app`
   - Click "Ask AI ✦" button at bottom-right
   - Try asking: "What services do you offer?"
   - Should see: "No uploaded knowledge yet" message

3. **Upload Knowledge** (Optional)
   - Sign in with email from `ADMIN_EMAILS`
   - Use admin panel to upload PDF/TXT files
   - Chat should then use uploaded knowledge

---

## 🎯 What You Get After Deployment

✅ **Live AI Chatbot**
- Running at: `https://your-app.vercel.app`
- Powered by: Google Gemini
- Free hosting: Vercel + Supabase

✅ **API Endpoints**
- `/api/v1/chat` - Chat with AI
- `/api/v1/skills` - MCP endpoint (with X-MCP-Key header)
- `/api/v1/admin/documents` - Upload knowledge
- `/api/v1/services` - List marketplace items

✅ **Database**
- PostgreSQL with pgvector
- Vector embeddings for RAG
- Knowledge document storage

---

## 🆘 Stuck? Try This

### "Chat says offline"
1. Check: `https://your-app.vercel.app/api/health` returns `ok`
2. Check: GitHub Secrets all present (Settings → Secrets)
3. Re-run: GitHub Actions → "Deploy portfolio" → "Re-run job"

### "Deployment failed"
1. Check: GitHub Actions logs (Actions tab, failed workflow)
2. Verify: All GitHub Secrets have correct values (no typos)
3. Check: Supabase project is active

### "Can't upload knowledge"
1. Verify: Your email in ADMIN_EMAILS GitHub Secret
2. Sign out / Sign in to site
3. Try uploading a `.txt` file first (simpler than PDF)

**Detailed troubleshooting:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 Next Steps

After deployment works:

1. **Customize Domain** - Add your own domain in Vercel
2. **Upload Knowledge** - Add PDFs/TXT files for AI knowledge base
3. **Configure Brand** - Edit colors/text in `apps/web/app/page.tsx`
4. **Add More Verticals** - Edit `PROFILES` in `apps/api/app/domain.py`
5. **Implement Skills** - Add actual endpoints for provider search, availability, bookings

---

## 📞 Support

- **Issues?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Setup help?** See [SETUP.md](SETUP.md)
- **Full docs?** See [../README.md](../README.md)
