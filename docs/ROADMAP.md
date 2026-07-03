# AI Job Hunter — Implementation Roadmap

## Phase 1: Foundation ✅ (Current)
- [x] Next.js scaffold + TypeScript + Tailwind
- [x] Clerk authentication (sign-in, sign-up, middleware)
- [x] Supabase schema + clients
- [x] Design system (shadcn/ui components, dark/light theme)
- [x] Landing page (hero, features, pricing, FAQ, footer)
- [x] Dashboard shell (sidebar, stats, command palette)
- [x] RAG infrastructure (chunking, embedding, retrieval)
- [x] AI career chat with conversation history
- [x] User profile sync (Clerk webhook)
- [x] Usage tracking + rate limiting

## Phase 2: Resume Optimizer
- [ ] PDF/DOCX/TXT upload to Supabase Storage
- [ ] Text extraction pipeline
- [ ] ATS analysis (score, keywords, grammar, formatting)
- [ ] Recruiter/Hiring Manager views
- [ ] Generate improved versions (ATS, Modern, Executive, Student, Internship)
- [ ] PDF/DOCX export
- [ ] Embeddings for RAG

## Phase 3: LinkedIn Profile Review
- [ ] Firecrawl LinkedIn scrape
- [ ] Profile analysis + scoring
- [ ] Headline/About/Experience rewrites
- [ ] Connection strategy + networking tips

## Phase 4: Portfolio Review
- [ ] GitHub API + Firecrawl for websites
- [ ] Code quality, README, UI/UX analysis
- [ ] Portfolio score + suggestions

## Phase 5: Job Matching
- [ ] Multi-source job scraping (Firecrawl)
- [ ] Resume vs JD comparison
- [ ] Match %, missing skills, learning path
- [ ] Save/favorite jobs

## Phase 6: Cover Letter Generator
- [ ] Job + resume + company context
- [ ] Multiple tones and lengths
- [ ] Rich text editor + export

## Phase 7: Interview Preparation
- [ ] Question generation (technical, behavioral, HR, coding, system design)
- [ ] STAR answers + mock interview
- [ ] Evaluation + confidence score

## Phase 8: Admin Panel
- [ ] Analytics, users, revenue, AI usage
- [ ] Feature flags, support tickets

## Phase 9: Polish & Deploy
- [ ] SEO (sitemap, robots, OG tags, schema.org)
- [ ] Performance (caching, virtual lists)
- [ ] Vercel + Supabase production deploy
