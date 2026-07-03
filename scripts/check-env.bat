@echo off
echo ============================================
echo  AI Job Hunter - Environment Setup Checker
echo ============================================
echo.

set MISSING=0

if not exist ".env.local" (
  echo [MISSING] .env.local file - copy from .env.example
  set MISSING=1
) else (
  echo [OK] .env.local exists
)

if "%MISSING%"=="1" (
  echo.
  echo Create .env.local from .env.example and fill in your keys.
  echo See docs/DEPLOY.md for where to get each key.
  exit /b 1
)

echo.
echo All set! Run: npm run dev
exit /b 0
