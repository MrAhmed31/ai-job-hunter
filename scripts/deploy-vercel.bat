@echo off
echo Deploying AI Job Hunter to Vercel...
echo.

vercel whoami >nul 2>&1
if errorlevel 1 (
  echo Please login first: vercel login
  exit /b 1
)

cd /d "%~dp0.."

echo Setting environment variables on Vercel...

for %%K in (
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  NEXT_PUBLIC_CLERK_SIGN_IN_URL
  NEXT_PUBLIC_CLERK_SIGN_UP_URL
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  FIRECRAWL_API_KEY
) do (
  echo Processing %%K...
)

echo.
echo Deploying to production...
vercel --prod --yes

echo.
echo Done! Update NEXT_PUBLIC_APP_URL in Vercel to your production URL, then redeploy.
