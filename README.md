# DocuForge AI

> **"Understand, document, and maintain your codebase with AI."**

DocuForge AI is a serious, production-quality developer SaaS tool that allows developers to connect software projects, analyze their codebases, understand architectural structures, and generate high-quality technical documentation using AI.

---

## 🌟 Core Features

- 🔍 **Codebase Parsing & Structure Analysis** — Automatic scanning of repository files, ASTs, API route handlers, and database ORM schemas with filtering engine for binary and build artifacts.
- ⚡ **Provider-Independent AI Service** — Decoupled AI architecture supporting OpenAI, Anthropic, Gemini, or custom models without vendor lock-in.
- 📚 **Comprehensive Technical Documentation** — Auto-generates README, Project Overview, Architecture Guides, API Reference, Database ER schemas, Environment Variables, and Deployment guides.
- 🔄 **Documentation Drift Detection** — Detects codebase modifications and highlights affected documentation sections that require updating.
- 🛠️ **Developer-Focused SaaS Workspace** — Modern Next.js App Router workspace with dark/light themes, inline editing, and version snapshotting.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide React, Custom Reusable Component System |
| **Backend & APIs** | Next.js Route Handlers & Server Services |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Authentication** | Auth.js / NextAuth |
| **Validation & Forms** | Zod, React Hook Form |
| **AI Integration** | Provider-independent abstraction layer (`lib/ai/`) |

---

## 📁 Project Structure

```
DocuForge-AI/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── (auth)/                 # Public Auth Routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/            # Authenticated SaaS Workspace Routes
│   │   ├── dashboard/          # Developer Dashboard with metrics
│   │   └── projects/           # Projects list, creation wizard, workspace
│   │       └── [projectId]/    # Project Workspace (Overview, Repo, Analysis, Docs, Changes, Settings)
│   ├── api/                    # RESTful Route Handlers (projects, auth)
│   ├── globals.css             # Tailwind CSS & theme tokens
│   └── layout.tsx              # Root HTML layout
├── components/                 # Reusable UI & Feature Components
│   ├── ui/                     # Button, Card, Badge, Input, Textarea, Select, Tabs, Progress, Skeleton, EmptyState
│   ├── layout/                 # Sidebar, Header, Navigation
│   ├── dashboard/              # StatsCard, RecentProjectsTable, ActivityFeed
│   ├── projects/               # ProjectHeader, OverviewTab, RepositoryTab, AnalysisTab, DocumentationTab, ChangesTab, SettingsTab
│   └── documentation/          # Documentation workspace components
├── lib/                        # Core Domain Architectures & Service Layer
│   ├── db/                     # Prisma ORM singleton client (`prisma.ts`)
│   ├── auth/                   # NextAuth configuration options (`options.ts`)
│   ├── ai/                     # Provider-independent AI service layer (`types`, `provider`, `service`, `placeholder-provider`)
│   ├── analyzer/               # Codebase parser & AST analyzer engine (`types`, `service`)
│   ├── documentation/          # Documentation pipeline & drift detection (`types`, `pipeline`)
│   ├── github/                 # GitHub server-side API integration layer (`types`, `service`)
│   ├── validation/             # Zod validation schemas
│   └── utils/                  # Utility helpers (`cn`, date & byte formatters)
├── prisma/                     # Database Schema Definition
│   └── schema.prisma           # Prisma schema (User, Project, Repository, Analysis, Documentation, Activity, etc.)
├── types/                      # Global TypeScript definitions
├── .env.example                # Template for environment configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS design system configuration
└── tsconfig.json               # TypeScript strict configuration
```

---

## 🚦 Feature Roadmap & Status

### Implemented (Initialization Foundation)
- [x] Next.js 15 App Router foundation with TypeScript strict mode and `@/*` path aliases.
- [x] Prisma database schema (`User`, `Project`, `Repository`, `Analysis`, `AnalysisFile`, `Documentation`, `DocumentationSection`, `DocumentationVersion`, `Activity`).
- [x] Provider-Independent AI Architecture interface & service facade (`lib/ai/`).
- [x] Codebase Analysis Architecture engine with filtering rules (`lib/analyzer/`).
- [x] Documentation Pipeline & Drift Detection Architecture (`lib/documentation/`).
- [x] GitHub API Server-Side Service abstraction (`lib/github/`).
- [x] Zod validation schemas & React Hook Form integration setup.
- [x] Developer SaaS UI layout (Sidebar, Header, Top stats cards, Recent projects table).
- [x] Full Project Workspace UI with tabs (Overview, Repository, Analysis, Documentation, Changes/Drift, Settings).
- [x] Responsive Landing Page (`/`), Login (`/login`), Register (`/register`), Dashboard (`/dashboard`), Projects (`/projects`), New Project wizard (`/projects/new`), Project Workspace (`/projects/[projectId]`).
- [x] Environment configuration setup (`.env.example`, `.env`, `.gitignore`).

### Planned (Future Phases)
- [ ] GitHub OAuth live authentication & token exchange flow.
- [ ] Direct repository cloning & deep AST parsing (TypeScript, Python, Go, Rust).
- [ ] OpenAI / Anthropic / Gemini provider implementations in `lib/ai/`.
- [ ] Live AI text generation & section streaming via Server-Sent Events (SSE).
- [ ] Automated Git webhook trigger for documentation drift detection.
- [ ] Markdown & PDF documentation export bundle downloads.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database (or local connection string)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration parameters in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/docuforge?schema=public"
AUTH_SECRET="docuforge_development_secret_key_32_characters_minimum"
AI_PROVIDER="mock"
AI_API_KEY=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 3. Generate Database Client & Push Schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Build Commands

```bash
# Run ESLint check
npm run lint

# Generate Prisma Client
npm run db:generate

# Build production bundle
npm run build
```

---

## 🔐 Security & Architecture Rules

1. **Secrets Management**: All GitHub tokens and AI API keys strictly remain on the server side (`lib/github/` & `lib/ai/`).
2. **Untrusted Codebase Processing**: Repository contents are treated as untrusted data during analysis; no arbitrary code is executed.
3. **Provider Decoupling**: Application code depends exclusively on `AIService` and `AIProvider` abstractions, never direct vendor SDKs.
