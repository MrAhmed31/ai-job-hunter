<p align="center">
  <h1 align="center">AI Job Hunter</h1>
  <p align="center"><strong>Land Better Jobs Faster with AI</strong></p>
  <p align="center">
    <a href="https://ai-job-hunter-liard.vercel.app">Live Demo</a> ·
    <a href="https://github.com/MrAhmed31/ai-job-hunter">GitHub</a> ·
    <a href="docs/ARCHITECTURE.md">Architecture</a> ·
    <a href="docs/DEPLOY.md">Deploy Guide</a>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square" alt="Clerk" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000?style=flat-square&logo=vercel" alt="Vercel" />
</p>

---

## Overview

**AI Job Hunter** is a full-stack AI SaaS that helps job seekers optimize resumes, match jobs, generate cover letters, prepare for interviews, and get personalized career coaching — all in one platform.

**Live:** [https://ai-job-hunter-liard.vercel.app](https://ai-job-hunter-liard.vercel.app)

---

## Features

| Feature | Description |
|---------|-------------|
| **Resume Optimizer** | Upload PDF/DOCX/TXT → ATS score, keyword analysis, 5 improved versions |
| **LinkedIn Review** | Scrape & analyze profile → headline rewrites, SEO, networking tips |
| **Portfolio Review** | GitHub + website analysis → code quality, UX, README feedback |
| **Job Matching** | Paste job URL → match %, missing skills, learning path |
| **Cover Letters** | AI-generated letters in 4 tones, short/long versions |
| **Interview Coach** | Technical, behavioral, HR questions + STAR answers + mock evaluation |
| **AI Career Chat** | RAG-powered assistant with conversation history |
| **Dashboard** | Stats, AI suggestions, application tracking |

---

## What Needs OpenAI?

| Works without OpenAI | Requires `OPENAI_API_KEY` |
|----------------------|---------------------------|
| Landing page, auth, dashboard UI | Resume ATS analysis & version generation |
| Firecrawl scraping (LinkedIn, jobs, portfolios) | LinkedIn / portfolio AI analysis |
| Supabase data storage | Job match scoring & suggestions |
| | Cover letter generation |
| | Interview questions & evaluation |
| | AI career chat (RAG embeddings + responses) |

Add `OPENAI_API_KEY` in Vercel → Environment Variables to unlock all AI features. Estimated cost: **~$0.01–0.05 per resume analysis** on GPT-4o.

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | Next.js 16 (App Router), TypeScript, React 19 |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Auth | Clerk |
| Database | Supabase PostgreSQL + pgvector |
| AI | OpenAI GPT-4o + text-embedding-3-small |
| Scraping | Firecrawl |
| State | TanStack Query, Server Actions |
| Deploy | Vercel |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/MrAhmed31/ai-job-hunter.git
cd ai-job-hunter
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `FIRECRAWL_API_KEY` | Yes | Firecrawl API key |
| `OPENAI_API_KEY` | For AI features | OpenAI API key |
| `CLERK_WEBHOOK_SECRET` | Production | Clerk webhook signing secret |

Clerk URL paths (add to `.env.local`):

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Database

Run `database/schema.sql` in the **Supabase SQL Editor** (creates tables, pgvector, storage bucket, RLS).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Import [MrAhmed31/ai-job-hunter](https://github.com/MrAhmed31/ai-job-hunter) on [vercel.com/new](https://vercel.com/new)
2. Add all environment variables (see [docs/DEPLOY.md](docs/DEPLOY.md))
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
4. Add your domain in **Clerk → Configure → Domains**
5. Add Clerk webhook: `https://your-app.vercel.app/api/webhooks/clerk`

Full checklist: [docs/DEPLOY.md](docs/DEPLOY.md) · Env reference: [docs/VERCEL-ENV.md](docs/VERCEL-ENV.md)

---

## Project Structure

```
ai-job-hunter/
├── src/
│   ├── app/                  # Pages (marketing, dashboard, auth, API)
│   ├── components/           # UI + feature components
│   ├── actions/              # Server Actions
│   ├── lib/
│   │   ├── ai/               # OpenAI client + prompt templates
│   │   ├── rag/              # Chunking, embeddings, retrieval
│   │   ├── firecrawl/        # Web scraping
│   │   ├── supabase/         # Database clients
│   │   └── services/         # Business logic
│   ├── types/
│   └── proxy.ts              # Auth proxy (Next.js 16)
├── database/
│   └── schema.sql            # Full PostgreSQL schema
└── docs/
    ├── ARCHITECTURE.md
    ├── DEPLOY.md
    ├── ROADMAP.md
    └── PROJECT-REVIEW.md
```

---

## Architecture

```
User → Clerk Auth → Next.js App Router
                         ├── Server Actions → Supabase (PostgreSQL + pgvector)
                         ├── OpenAI GPT-4o (analysis, generation)
                         └── Firecrawl (scraping)
```

Detailed design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Pricing Tiers (In-App)

| | Free | Pro ($19/mo) |
|---|------|--------------|
| Resume reviews | 3/mo | Unlimited |
| Job matches | 5/mo | Unlimited |
| Cover letters | 1/mo | Unlimited |
| Interview sessions | 1/mo | Unlimited |

> Stripe payments not yet integrated — Pro upgrade is UI-only.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full plan.

**Next priorities:** OpenAI integration on production, PDF/DOCX export, Stripe payments, mobile sidebar, streaming AI responses, admin panel.

**Known gaps & review:** [docs/PROJECT-REVIEW.md](docs/PROJECT-REVIEW.md)

---

## License

Private — All rights reserved.

---

<p align="center">Built by <a href="https://github.com/MrAhmed31">MrAhmed31</a></p>
