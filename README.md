# morphos-core

**A hyper-variablized, domain-agnostic marketplace and booking engine that instantly morphs to any brand identity.**

Morphos Core dynamically adapts its brand identity, database schemas (JSONB), and AI-powered capabilities through simple environment variable configuration. No code changes required—transform from one industry vertical to another with a single deployment.

## 🎯 Key Features

- **Domain-Agnostic Architecture**: One codebase powers multiple marketplace verticals (services, rentals, bookings, etc.)
- **Environment-Driven Configuration**: Morph brand identity, schemas, and AI behavior via environment variables
- **Gemini-Powered RAG/MCP AI Chatbot**: Intelligent agent with provider discovery, availability lookup, and booking management
- **Dynamic JSONB Schemas**: Auto-generated PostgreSQL schemas that adapt to your domain requirements
- **Full-Stack Automation**: Terraform + GitHub Actions for zero-cost cloud deployments
- **Modern Tech Stack**: Next.js (frontend), FastAPI (serverless), Supabase (database)

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js + TypeScript (37.3%) |
| **Backend** | FastAPI + Python (52.5%) |
| **Database** | Supabase + PostgreSQL with JSONB (10.2% PLpgSQL) |
| **AI Engine** | Google Gemini with RAG/MCP |
| **Infrastructure** | Terraform + GitHub Actions |
| **Hosting** | Serverless Cloud (auto-deployed) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account
- Google Gemini API key
- Environment variables configured (see `.env.example`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/E-Vanika/morphos-core.git
   cd morphos-core
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Configure your domain profile, brand identity, and API keys
   ```

3. **Install dependencies**
   ```bash
   # Frontend
   cd apps/web && npm install
   
   # Backend
   cd ../api && pip install -r requirements.txt
   ```

4. **Deploy with Terraform**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

## 💡 Use Cases

- **Professional Services Marketplace**: Connect clients with consultants, coaches, and agencies
- **Vacation Rental Platform**: List properties, manage availability, process bookings
- **Equipment Rental Service**: Rent tools, vehicles, or specialized equipment
- **Beauty & Wellness Booking**: Salon appointments, personal training, spa services
- **Any marketplace vertical**: Customize via environment configuration

## 🤖 AI Agent Capabilities

The Gemini-powered agent provides:
- **Provider Discovery**: Find relevant providers based on requirements
- **Availability Lookup**: Real-time scheduling and availability checks
- **Booking Management**: Draft and process bookings through natural conversation
- **Multi-turn Context**: Remembers conversation history for seamless interactions

## 📊 Architecture

```
morphos-core/
├── apps/web/              # Next.js frontend
│   ├── app/               # App router & pages
│   └── components/        # React components
├── apps/api/              # FastAPI backend
│   ├── routes/            # API endpoints
│   └── schemas/           # Dynamic JSONB schemas
├── terraform/             # Infrastructure as code
├── .github/workflows/     # CI/CD automation
└── docker-compose.yml     # Local development
```

## 🔧 Environment Configuration

Control your marketplace morphing through environment variables:

```env
# Domain Profile
DOMAIN_NAME=professional-services
VERTICAL=marketplace

# Brand Identity
BRAND_NAME=Your Brand
BRAND_COLOR=#0066cc
BRAND_LOGO_URL=https://...

# AI Configuration
GEMINI_API_KEY=your_api_key
RAG_ENABLED=true
MCP_ENABLED=true

# Database
DATABASE_URL=your_supabase_url
JSONB_SCHEMA_VERSION=1

# Deployment
CLOUD_PROVIDER=gcp
TERRAFORM_STATE_BUCKET=your_bucket
```

## 📈 Deployment

### Local Development
```bash
docker-compose up
# Access at http://localhost:3000
```

### Cloud Deployment (Zero-Cost)
```bash
cd terraform
terraform apply
# Automatically deployed via GitHub Actions on push
```

## 🔐 Security

- Environment variable isolation for sensitive data
- JSONB encryption at rest in Supabase
- RAG/MCP AI context isolation per session
- GitHub Actions secrets management for CI/CD

## 📝 Project Showcase

**Current Deployment**: Professional Services Booking Marketplace
- Provider skills: discovery, availability, booking-draft creation
- Fully responsive design with mobile support
- Real-time availability updates
- One-click booking confirmation

## 🛠️ Development Workflow

1. **Create a branch** for your feature
2. **Push changes** → GitHub Actions auto-tests
3. **Deploy preview** via Terraform Cloud
4. **Merge to main** → Production deployment

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md)
- [API Reference](./docs/API.md)
- [Domain Configuration](./docs/CONFIGURATION.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with detailed description

## 📄 License

[Add your license here]

## 🙋 Support

For questions or issues:
- Open a GitHub issue
- Check existing discussions
- Review the documentation

---

**Built with ❤️ by the Morphos team**
