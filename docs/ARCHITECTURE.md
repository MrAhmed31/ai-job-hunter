# AI Job Hunter — Software Architecture

> **Tagline:** Land Better Jobs Faster with AI.

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel (Edge + Serverless)                │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 16 App Router                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Server       │  │ Route        │  │ Client Components    │  │
│  │ Actions      │  │ Handlers     │  │ (React Query, Motion)│  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│  ┌──────┴─────────────────┴──────────────────────┴───────────┐  │
│  │                    Service Layer (lib/services)              │  │
│  └──────┬─────────────────┬──────────────────────┬───────────┘  │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
    ┌─────▼─────┐    ┌──────▼──────┐        ┌──────▼──────┐
    │  Clerk    │    │  Supabase   │        │  OpenAI     │
    │  Auth     │    │  PG+pgvector│        │  GPT+Embed  │
    └───────────┘    │  Storage    │        └─────────────┘
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │  Firecrawl  │
                     │  Scraping   │
                     └─────────────┘
```

## 2. Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js App Router | SSR, Server Actions, streaming AI responses |
| Auth | Clerk | Production-ready OAuth, MFA, session management |
| Database | Supabase PostgreSQL + pgvector | Single store for relational + vector data |
| AI | OpenAI GPT-4o + text-embedding-3-small | Best quality/cost balance |
| Scraping | Firecrawl | Structured markdown extraction, reliable |
| State | TanStack Query + Server Components | Cache server data, optimistic updates |
| File parsing | pdf-parse + mammoth | PDF/DOCX text extraction server-side |
| Exports | docx + custom PDF | DOCX native; PDF via print-ready HTML |

## 3. Folder Structure

```
src/
├── app/
│   ├── (marketing)/          # Public landing, pricing, FAQ
│   ├── (auth)/               # Clerk sign-in/up
│   ├── (dashboard)/          # Protected app shell
│   │   ├── dashboard/
│   │   ├── resume/
│   │   ├── linkedin/
│   │   ├── portfolio/
│   │   ├── jobs/
│   │   ├── cover-letter/
│   │   ├── interview/
│   │   ├── chat/
│   │   └── settings/
│   ├── api/                  # Route handlers (webhooks, streaming)
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── layout/               # Nav, sidebar, command palette
│   └── features/             # Feature-specific components
├── lib/
│   ├── ai/                   # OpenAI client, prompts, pipelines
│   ├── rag/                  # Chunking, embedding, retrieval
│   ├── firecrawl/            # Scraping client
│   ├── supabase/             # DB clients (server/browser)
│   ├── clerk/                # Auth helpers
│   ├── services/             # Business logic
│   └── utils/                # Shared utilities
├── actions/                  # Server Actions
├── hooks/
└── types/
database/
├── schema.sql                # Full schema + RLS
└── migrations/
docs/
├── ARCHITECTURE.md
├── API.md
└── ROADMAP.md
```

## 4. Authentication Flow

1. User signs in via Clerk (`/sign-in`, `/sign-up`)
2. Clerk webhook (`/api/webhooks/clerk`) syncs user → `profiles` table
3. Middleware protects `/dashboard/*` routes
4. Server Actions call `auth()` + `currentUser()` for user context
5. Supabase RLS uses `clerk_id` from JWT custom claims (service role on server)

## 5. RAG Pipeline

```
Upload/Scrape → Extract Text → Chunk (512 tokens, 50 overlap)
    → Embed (text-embedding-3-small) → Store in embeddings table
    → On query: embed query → vector similarity search (cosine)
    → Top-K chunks + metadata → GPT context window → Stream response
```

**Knowledge sources:** resumes, cover letters, job descriptions, company pages, career guides, LinkedIn data, portfolio data.

## 6. AI Pipelines

### Resume Analysis Pipeline
`upload → extract → clean → embed → store → analyze (GPT) → improve → generate versions → export`

### Job Matching Pipeline
`scrape job (Firecrawl) → extract fields → embed → compare resume embedding → score → suggestions`

### Interview Pipeline
`analyze resume + job → generate questions → generate STAR answers → evaluate mock responses`

## 7. Security

- Rate limiting via middleware + `usage_logs` per tier
- Zod validation on all Server Actions
- Service role key server-only; anon key client with RLS
- Input sanitization before AI prompts
- Audit trail in `usage_logs`

## 8. Subscription Tiers

| Feature | Free | Pro |
|---------|------|-----|
| Resume Reviews | 3/mo | Unlimited |
| Job Matches | 5/mo | Unlimited |
| Cover Letters | 1/mo | Unlimited |
| Interview Sessions | 1/mo | Unlimited |
| AI Chat | Basic | Priority |
