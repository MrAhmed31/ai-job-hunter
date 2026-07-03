# AI Job Hunter — Project Review

> Review date: July 2026 · Production URL: https://ai-job-hunter-liard.vercel.app

---

## Overall Assessment

The project is a **solid MVP** with real integrations (Clerk, Supabase, Firecrawl, OpenAI), clean architecture, and a deployed production site. Core feature code exists for all 6 modules + RAG chat. The main gap is **OpenAI not configured on production** — most AI features will error until `OPENAI_API_KEY` is added to Vercel.

**Grade: B+** — Production-ready shell; needs OpenAI, polish, and monetization to be a complete SaaS.

---

## What's Working Well

| Area | Notes |
|------|-------|
| Architecture | Clear separation: `actions/` → `services/` → `lib/` |
| Auth | Clerk + proxy.ts (Next.js 16 compatible) |
| Database | Comprehensive schema with pgvector RAG |
| UI | Modern landing page, dashboard, dark/light theme |
| Deploy | Live on Vercel, SEO (sitemap, robots) |
| Type safety | Full TypeScript types for all entities |
| Usage limits | Free/Pro tier gating in `usage.ts` |
| Prompts | Dedicated templates per feature in `lib/ai/prompts.ts` |

---

## Flaws & Gaps

### Critical

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | **No `OPENAI_API_KEY` on Vercel** | All AI features fail at runtime | Add key in Vercel env vars |
| 2 | **Clerk domain may not be configured** | Sign-up page can appear blank | Add `ai-job-hunter-liard.vercel.app` in Clerk Domains |
| 3 | **Clerk webhook not set** | User profiles may not sync to Supabase on signup | Add webhook URL + `CLERK_WEBHOOK_SECRET` |
| 4 | **`getOpenAI()` throws hard error** | No graceful "AI unavailable" UI | Add friendly error messages in services |

### High Priority

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 5 | **No PDF/DOCX export** | Users can't download improved resumes | Implement export with `docx` + PDF lib |
| 6 | **No Stripe integration** | Pro tier is UI-only, no revenue | Add Stripe Checkout + webhook |
| 7 | **Mobile sidebar missing** | Dashboard unusable on mobile | Add hamburger menu + sheet drawer |
| 8 | **Command palette non-functional** | Button exists but does nothing | Wire up `cmdk` command palette |
| 9 | **No streaming AI responses** | Long waits with no feedback | Use OpenAI streaming + UI loaders |
| 10 | **Job save uses wrong ID path** | Save job may fail in edge cases | Validate `job_id` in save flow |

### Medium Priority

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 11 | **No admin panel** | Can't see users, usage, revenue | Build `/admin` routes |
| 12 | **No rate limiting middleware** | API abuse possible | Add Vercel rate limits or Upstash |
| 13 | **RLS policies empty** | Tables have RLS enabled but no policies | Add policies or document service-role-only access |
| 14 | **No automated tests** | Regressions undetected | Add Vitest/Playwright tests |
| 15 | **No CI pipeline on GitHub** | Build not verified on push | Add `.github/workflows/ci.yml` (needs workflow scope) |
| 16 | **Watch Demo button** | Does nothing on landing page | Add demo video or scroll to features |
| 17 | **Privacy/Terms links** | Point to `#` placeholders | Create legal pages |
| 18 | **Embeddings index** | `ivfflat` needs data before effective | Document or use `hnsw` index |

### Low Priority

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 19 | **No onboarding flow** | New users don't set career preferences | Add onboarding wizard |
| 20 | **No email notifications** | Users miss updates | Add Resend/SendGrid |
| 21 | **No OG image** | Poor social sharing previews | Add `opengraph-image.tsx` |
| 22 | **GitHub rate limits** | Portfolio review may hit API limits | Add token or cache |
| 23 | **Single conversation in chat** | Can't start new chat easily | Add "New conversation" button |

---

## OpenAI Usage Map

Every feature that calls OpenAI and what it does:

| Feature | File | OpenAI Usage | Model |
|---------|------|--------------|-------|
| Resume analysis | `lib/services/resume.ts` | ATS scoring, grammar, keywords, views | GPT-4o |
| Resume versions | `lib/services/resume.ts` | Generate ATS/Modern/Executive/etc. | GPT-4o |
| LinkedIn review | `lib/services/linkedin.ts` | Profile analysis + rewrites | GPT-4o |
| Portfolio review | `lib/services/portfolio.ts` | Code/UX/README analysis | GPT-4o |
| Job matching | `lib/services/jobs.ts` | Resume vs JD comparison | GPT-4o |
| Cover letters | `lib/services/cover-letter.ts` | Personalized letter generation | GPT-4o |
| Interview prep | `lib/services/interview.ts` | Questions + STAR answers | GPT-4o |
| Interview evaluate | `lib/services/interview.ts` | Mock response scoring | GPT-4o |
| AI chat | `lib/services/chat.ts` | Career advice responses | GPT-4o |
| RAG embeddings | `lib/rag/embeddings.ts` | Vector embeddings for all uploads | text-embedding-3-small |
| RAG retrieval | `lib/rag/embeddings.ts` | Query embedding for chat context | text-embedding-3-small |

**Firecrawl-only (no OpenAI):** Scraping LinkedIn, job pages, portfolios — data collection works; analysis step needs OpenAI.

---

## Recommended Work Plan

### Sprint 1 — Make AI Work (1 day)
- [ ] Add `OPENAI_API_KEY` to Vercel
- [ ] Configure Clerk domain + webhook
- [ ] Test all 6 features end-to-end
- [ ] Add user-friendly error when OpenAI missing

### Sprint 2 — Core Polish (2–3 days)
- [ ] Mobile responsive dashboard sidebar
- [ ] PDF/DOCX resume export
- [ ] Streaming AI responses with loading states
- [ ] Functional command palette

### Sprint 3 — Monetization (3–5 days)
- [ ] Stripe Checkout for Pro tier
- [ ] Webhook for subscription status
- [ ] Enforce limits based on `subscription_tier`

### Sprint 4 — Growth (1 week)
- [ ] Admin panel (users, usage, revenue)
- [ ] OG images + schema.org
- [ ] Automated tests + CI
- [ ] Legal pages (Privacy, Terms)

---

## Security Reminders

- Rotate API keys shared in chat (Clerk, Supabase service_role, Firecrawl)
- Never commit `.env.local`
- `service_role` key must stay server-only (already correct)
- Regenerate keys after any exposure
