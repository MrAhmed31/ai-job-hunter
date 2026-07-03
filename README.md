# AI Job Hunter

**Land Better Jobs Faster with AI.**

A production-ready SaaS application for resume optimization, job matching, cover letter generation, interview preparation, and AI-powered career coaching.

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query
- **Backend:** Next.js Server Actions, Route Handlers
- **Auth:** Clerk
- **Database:** Supabase PostgreSQL + pgvector
- **AI:** OpenAI GPT-4o + text-embedding-3-small
- **Scraping:** Firecrawl
- **Deployment:** Vercel + Supabase

## Getting Started

### 1. Clone and install

```bash
cd ai-job-hunter
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `OPENAI_API_KEY` | OpenAI API key |
| `FIRECRAWL_API_KEY` | Firecrawl API key |

### 3. Database setup

Run `database/schema.sql` in your Supabase SQL Editor. This creates all tables, pgvector extension, RLS policies, and the `match_embeddings` function.

Create a Supabase Storage bucket named `resumes` (public or with appropriate policies).

### 4. Clerk setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Set sign-in/sign-up URLs to `/sign-in` and `/sign-up`
3. Add webhook endpoint: `https://your-domain/api/webhooks/clerk` for `user.created`, `user.updated`, `user.deleted`

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

| Feature | Status |
|---------|--------|
| Landing page (hero, pricing, FAQ) | ✅ |
| Clerk authentication | ✅ |
| Dashboard with stats | ✅ |
| Resume Optimizer (PDF/DOCX/TXT) | ✅ |
| LinkedIn Profile Review | ✅ |
| Portfolio Review (GitHub + Firecrawl) | ✅ |
| Job Matching (Firecrawl scrape) | ✅ |
| Cover Letter Generator | ✅ |
| Interview Preparation | ✅ |
| AI Career Chat (RAG) | ✅ |
| Usage limits (Free/Pro tiers) | ✅ |
| Dark/Light mode | ✅ |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # UI + feature components
├── lib/
│   ├── ai/                 # OpenAI client + prompts
│   ├── rag/                # Chunking, embedding, retrieval
│   ├── firecrawl/          # Web scraping
│   ├── supabase/           # Database clients
│   └── services/           # Business logic
├── actions/                # Server Actions
└── types/                  # TypeScript types
database/
└── schema.sql              # Full PostgreSQL schema
docs/
├── ARCHITECTURE.md
└── ROADMAP.md
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design, RAG pipeline, and AI pipelines.

See [docs/ROADMAP.md](docs/ROADMAP.md) for implementation phases.

## License

Private — All rights reserved.
