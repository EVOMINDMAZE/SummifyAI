#!/bin/bash

echo "🚀 Quick Deploy: Supabase Edge Functions"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_REF="voosuqmkazvjzheipbrl"

echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo -e "${RED}❌ Homebrew not found. Please install Supabase CLI manually:${NC}"
            echo "https://supabase.com/docs/guides/cli/getting-started"
            exit 1
        fi
    else
        # Linux/WSL
        echo -e "${BLUE}📥 Downloading Supabase CLI...${NC}"
        curl -sSfL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
        sudo mv supabase /usr/local/bin/
    fi
else
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
fi

# Check if logged in
echo -e "${BLUE}🔐 Checking authentication...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase. Logging in...${NC}"
    supabase login
else
    echo -e "${GREEN}✅ Already authenticated${NC}"
fi

# Link project if not linked
echo -e "${BLUE}🔗 Linking project...${NC}"
if ! supabase status &> /dev/null; then
    echo -e "${BLUE}🔗 Linking to project ${PROJECT_REF}...${NC}"
    supabase link --project-ref $PROJECT_REF
else
    echo -e "${GREEN}✅ Project already linked${NC}"
fi

# Deploy functions
echo -e "${BLUE}🚀 Deploying Edge Functions...${NC}"
echo ""

echo -e "${YELLOW}Deploying analyze-topic...${NC}"
if supabase functions deploy analyze-topic; then
    echo -e "${GREEN}✅ analyze-topic deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy analyze-topic${NC}"
    exit 1
fi

echo -e "${YELLOW}Deploying analyze-chapter...${NC}"
if supabase functions deploy analyze-chapter; then
    echo -e "${GREEN}✅ analyze-chapter deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy analyze-chapter${NC}"
    exit 1
fi

echo -e "${YELLOW}Deploying generate-embeddings...${NC}"
if supabase functions deploy generate-embeddings; then
    echo -e "${GREEN}✅ generate-embeddings deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy generate-embeddings${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All Edge Functions deployed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Verification:${NC}"
echo "1. Check your Supabase dashboard: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo "2. Refresh your app to see the status change"
echo "3. Your app will now use secure server-side AI analysis!"
echo ""

# Test functions
echo -e "${BLUE}🧪 Testing functions...${NC}"
echo -e "${YELLOW}Testing analyze-topic...${NC}"
if supabase functions invoke analyze-topic --data '{"topic":"test"}' &> /dev/null; then
    echo -e "${GREEN}✅ analyze-topic working${NC}"
else
    echo -e "${YELLOW}⚠️  analyze-topic test failed (might need OpenAI API key in secrets)${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Deployment complete! Your Edge Functions are live.${NC}"
echo -e "${BLUE}💡 Don't forget to set your OPENAI_API_KEY in Supabase Edge Function Secrets if you haven't already.${NC}"
