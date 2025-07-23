@echo off
setlocal enabledelayedexpansion

echo 🚀 Quick Deploy: Supabase Edge Functions
echo ========================================

set PROJECT_REF=voosuqmkazvjzheipbrl

echo 📋 Checking prerequisites...

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Supabase CLI not found. Installing...
    
    REM Check if npm is available
    npm --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ npm not found. Please install Node.js first.
        echo https://nodejs.org/
        pause
        exit /b 1
    )
    
    echo 📥 Installing Supabase CLI via npm...
    npm install -g supabase
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Supabase CLI
        echo Please install manually: https://supabase.com/docs/guides/cli/getting-started
        pause
        exit /b 1
    )
) else (
    echo ✅ Supabase CLI found
)

echo 🔐 Checking authentication...
supabase projects list >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Not logged in to Supabase. Logging in...
    supabase login
    if %errorlevel% neq 0 (
        echo ❌ Login failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Already authenticated
)

echo 🔗 Linking project...
supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔗 Linking to project %PROJECT_REF%...
    supabase link --project-ref %PROJECT_REF%
    if %errorlevel% neq 0 (
        echo ❌ Failed to link project
        pause
        exit /b 1
    )
) else (
    echo ✅ Project already linked
)

echo 🚀 Deploying Edge Functions...
echo.

echo Deploying analyze-topic...
supabase functions deploy analyze-topic
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy analyze-topic
    pause
    exit /b 1
)
echo ✅ analyze-topic deployed successfully

echo Deploying analyze-chapter...
supabase functions deploy analyze-chapter
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy analyze-chapter
    pause
    exit /b 1
)
echo ✅ analyze-chapter deployed successfully

echo Deploying generate-embeddings...
supabase functions deploy generate-embeddings
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy generate-embeddings
    pause
    exit /b 1
)
echo ✅ generate-embeddings deployed successfully

echo.
echo 🎉 All Edge Functions deployed successfully!
echo.
echo 📊 Verification:
echo 1. Check your Supabase dashboard: https://supabase.com/dashboard/project/%PROJECT_REF%/functions
echo 2. Refresh your app to see the status change
echo 3. Your app will now use secure server-side AI analysis!
echo.

echo 🧪 Testing functions...
echo Testing analyze-topic...
supabase functions invoke analyze-topic --data "{\"topic\":\"test\"}" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ analyze-topic working
) else (
    echo ⚠️  analyze-topic test failed (might need OpenAI API key in secrets)
)

echo.
echo 🚀 Deployment complete! Your Edge Functions are live.
echo 💡 Don't forget to set your OPENAI_API_KEY in Supabase Edge Function Secrets if you haven't already.
echo.
pause
