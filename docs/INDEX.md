# 🗂️ Documentation Index

Quick reference to all Morphos Core documentation.

---

## 📚 Main Documentation

### **README.md** (Start Here)
- ✅ Complete project overview
- ✅ Architecture & data flow diagrams
- ✅ RAG (Retrieval-Augmented Generation) explained
- ✅ MCP (Model Context Protocol) guide
- ✅ **FAQ Section** with 10+ questions answered
- ✅ Troubleshooting tips
- ✅ Security best practices
- ✅ Local development setup
- 📖 [Full README](../README.md)

---

## 🚀 Getting Started

### **QUICKSTART.md** (Deploy in 15 minutes)
- ✅ 5-phase deployment checklist
- ✅ GitHub Secrets setup (copy-paste ready)
- ✅ Verification steps
- ✅ Quick troubleshooting
- ⏱️ ~15 minutes to live deployment
- 📖 [Read QUICKSTART](QUICKSTART.md)

### **SETUP.md** (Detailed Guide)
- ✅ Step-by-step installation
- ✅ Account creation walkthrough
- ✅ GitHub Actions configuration
- ✅ Deployment verification
- ✅ Administrator access setup
- 📖 [Read SETUP](SETUP.md)

---

## 🆘 Troubleshooting

### **TROUBLESHOOTING.md** (Fix Common Issues)

**Issues Covered:**
- ❌ Chat widget says "offline" (4 solutions)
- ❌ Cannot upload knowledge documents
- ❌ No results from chat queries
- ❌ Database connection errors
- ❌ Deployment failures
- ❌ MCP skills not working
- ❌ Performance issues
- 🆘 Emergency reset commands

- 📖 [Read TROUBLESHOOTING](TROUBLESHOOTING.md)

---

## 🔧 Infrastructure & Operations

### **DEVOPS.md** (Technical Reference)

**For DevOps/Platform Engineers:**
- 🏗️ System architecture diagram
- 🔑 Environment variables reference
- 🗄️ Database schema with `pgvector`
- 🚀 Deployment pipeline explained
- 📊 API endpoints reference
- 🔐 Security (RLS, rate limiting, secrets)
- 📈 Monitoring & logging
- ⚡ Performance optimization
- 📈 Scaling considerations
- 🧪 Testing & CI/CD

- 📖 [Read DEVOPS](DEVOPS.md)

---

## 📋 Summary of Updates

### **UPDATE_SUMMARY.md** (What Changed)
- 📝 Files modified & improvements
- 🎯 Key changes by document
- 📊 Documentation statistics
- ✨ Impact & benefits
- 🎓 Learning resources

- 📖 [Read UPDATE_SUMMARY](UPDATE_SUMMARY.md)

---

## 🎯 Choose Your Path

### **I want to deploy quickly**
→ Start with [QUICKSTART.md](QUICKSTART.md)

### **I'm getting an error**
→ Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### **I want to understand the architecture**
→ Read [README.md FAQ section](../README.md#-faq) or [DEVOPS.md](DEVOPS.md)

### **I'm setting up for the first time**
→ Follow [SETUP.md](SETUP.md)

### **I manage the infrastructure**
→ Read [DEVOPS.md](DEVOPS.md)

### **I need to know what changed**
→ See [UPDATE_SUMMARY.md](UPDATE_SUMMARY.md)

### **I want the complete reference**
→ [README.md](../README.md) is comprehensive

---

## 📍 Where Things Are

```
morphos-core/
├── README.md                 ← Main documentation hub
├── docs/
│   ├── QUICKSTART.md        ← Deploy in 15 min
│   ├── SETUP.md             ← Detailed setup
│   ├── TROUBLESHOOTING.md   ← Fix issues
│   ├── DEVOPS.md            ← Infrastructure
│   ├── UPDATE_SUMMARY.md    ← What changed
│   └── INDEX.md             ← This file
├── apps/
│   ├── web/
│   │   └── .env.example     ← Frontend config reference
│   └── api/
│       └── .env.example     ← Backend config reference
└── .github/workflows/
    └── deploy.yml           ← Deployment automation
```

---

## 🔗 External Links

### Account Setup
- [GitHub](https://github.com)
- [Vercel](https://vercel.com)
- [Supabase](https://supabase.com)
- [Google AI Studio](https://aistudio.google.com/)

### API Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://ai.google.dev/)

---

## 📞 Quick Reference

### GitHub Secrets Needed
See [QUICKSTART.md - Phase 3](QUICKSTART.md#-phase-3-add-github-secrets-3-min)

### Environment Variables
- Frontend: [apps/web/.env.example](../apps/web/.env.example)
- Backend: [apps/api/.env.example](../apps/api/.env.example)

### Common Issues
Top 3:
1. Chat is offline → [TROUBLESHOOTING.md - "Chat Says Offline"](TROUBLESHOOTING.md#-error-im-temporarily-offline-please-try-again-after-the-api-finishes-deploying)
2. Cannot upload docs → [TROUBLESHOOTING.md - "Cannot Upload"](TROUBLESHOOTING.md#-error-sign-in-as-an-administrator-to-upload-knowledge)
3. Deployment failed → [TROUBLESHOOTING.md - "Deployment Failures"](TROUBLESHOOTING.md#-github-action-error-workflow-failure-in-deploy)

---

## 🎓 Learning Resources

### Beginners
1. [QUICKSTART.md](QUICKSTART.md) - Get it working
2. [README.md Key Features](../README.md#-key-features) - Understand what it is
3. [README.md FAQ](../README.md#-faq) - Answer common questions

### Developers
1. [README.md Architecture](../README.md#-architecture--data-flow) - How it works
2. [README.md RAG Explanation](../README.md#-how-rag--gemini-ai-works) - AI integration
3. [DEVOPS.md Database Schema](DEVOPS.md#-database-schema) - Data structure

### DevOps Engineers
1. [DEVOPS.md System Architecture](DEVOPS.md#-system-architecture)
2. [DEVOPS.md Deployment Pipeline](DEVOPS.md#-deployment-pipeline)
3. [DEVOPS.md Security](DEVOPS.md#-security-considerations)

---

## ✅ Verification Checklist

After deployment, verify with:

```bash
# API is running
curl https://your-site.vercel.app/api/health

# Frontend is accessible
curl https://your-site.vercel.app/

# Database is connected
curl -X GET https://your-site.vercel.app/api/v1/db-health
```

---

## 📞 Getting Help

1. **Documentation path:**
   - Stuck? → Check relevant section in appropriate doc
   - Unsure which doc? → Start with README.md FAQ
   
2. **Error diagnosis:**
   - Deployment error? → TROUBLESHOOTING.md
   - Configuration issue? → DEVOPS.md (Environment Variables)
   - Setup problem? → QUICKSTART.md or SETUP.md

3. **Deep understanding:**
   - Architecture? → README.md or DEVOPS.md
   - AI/RAG? → README.md FAQ
   - Infrastructure? → DEVOPS.md

---

## 🎉 You're Ready!

**Everything is documented.** Choose your path above and get started!

- ⏱️ **15 minutes to deployment:** [QUICKSTART.md](QUICKSTART.md)
- 🔧 **Infrastructure reference:** [DEVOPS.md](DEVOPS.md)
- ❓ **Need answers?** [README.md FAQ](../README.md#-faq)
- 🆘 **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
