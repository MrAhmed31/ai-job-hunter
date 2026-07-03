# Deploy AI Job Hunter to Vercel

## One-time setup (do these in order)

### 1. Clerk — https://dashboard.clerk.com
- Create application → name: **AI Job Hunter**
- **API Keys** → copy Publishable + Secret keys
- **Paths**: Sign-in `/sign-in`, Sign-up `/sign-up`, After sign-in `/dashboard`
- **Webhooks** → Add endpoint (after Vercel deploy):
  - URL: `https://YOUR-APP.vercel.app/api/webhooks/clerk`
  - Events: `user.created`, `user.updated`, `user.deleted`
  - Copy **Signing Secret**

### 2. Supabase — https://supabase.com/dashboard
- New project → wait for provisioning
- **SQL Editor** → paste entire `database/schema.sql` → Run
- **Settings → API** → copy URL, anon key, service_role key

### 3. OpenAI — https://platform.openai.com/api-keys
- Create API key (requires billing)

### 4. Firecrawl — https://www.firecrawl.dev
- Sign up → copy API key from dashboard

---

## Deploy on Vercel

1. Go to https://vercel.com/new
2. Import **MrAhmed31/ai-job-hunter**
3. Add **Environment Variables** (all required):

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g. `https://ai-job-hunter.vercel.app`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys |
| `CLERK_SECRET_KEY` | Clerk → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk → Webhooks (after deploy) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (service_role) |
| `OPENAI_API_KEY` | OpenAI platform |
| `FIRECRAWL_API_KEY` | Firecrawl dashboard |

4. Click **Deploy**
5. After deploy: update `NEXT_PUBLIC_APP_URL` to your real URL, redeploy
6. Add Clerk webhook URL with your live domain
7. In Clerk → **Domains**: add your Vercel domain

---

## Verify

- [ ] Landing page loads
- [ ] Sign up works
- [ ] Dashboard shows after login
- [ ] Upload resume → ATS analysis returns
- [ ] AI chat responds

---

## Free tier limits

| Service | Free tier |
|---------|-----------|
| Clerk | 10,000 MAU |
| Supabase | 500MB DB, 1GB storage |
| OpenAI | Pay per use (~$0.01/resume analysis) |
| Firecrawl | 500 credits/month |
| Vercel | Hobby free |
