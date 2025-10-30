#!/bin/bash
# Quick deployment script for All Dogs Rock Shop
# This will add the environment variable and trigger a deployment

set -e  # Exit on any error

echo "🚀 All Dogs Rock Shop - Quick Deploy Script"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}ERROR: VERCEL_TOKEN environment variable not set${NC}"
    echo ""
    echo "To get your token:"
    echo "1. Go to https://vercel.com/account/tokens"
    echo "2. Create a new token (name it 'Deploy Script' or similar)"
    echo "3. Copy the token"
    echo "4. Run this script with: VERCEL_TOKEN=your_token_here ./quick-deploy.sh"
    echo ""
    exit 1
fi

echo "✓ Vercel token found"
echo ""

# Project details
PROJECT_NAME="all-dogs-rock-api"

# Check if REPLICATE_TOKEN is set
if [ -z "$REPLICATE_TOKEN" ]; then
    echo -e "${RED}ERROR: REPLICATE_TOKEN environment variable not set${NC}"
    echo ""
    echo "Please run this script with both tokens:"
    echo "VERCEL_TOKEN=your_vercel_token REPLICATE_TOKEN=your_replicate_token ./quick-deploy.sh"
    echo ""
    exit 1
fi

echo "✓ Replicate token found"
echo ""
echo "📝 Adding environment variable to Vercel..."
echo "   Variable: REPLICATE_API_TOKEN"
echo ""

# Get project ID
echo "🔍 Finding your Vercel project..."
PROJECT_LIST=$(curl -s "https://api.vercel.com/v9/projects" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json")

PROJECT_ID=$(echo "$PROJECT_LIST" | grep -o "\"id\":\"[^\"]*\"" | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}ERROR: Could not find project. Make sure you have access to the project.${NC}"
    echo ""
    echo "Your projects:"
    echo "$PROJECT_LIST" | grep -o "\"name\":\"[^\"]*\"" | cut -d'"' -f4
    exit 1
fi

echo "✓ Project found: $PROJECT_ID"
echo ""

# Add environment variable
echo "📌 Adding REPLICATE_API_TOKEN to Vercel..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"REPLICATE_API_TOKEN\",
    \"value\": \"$REPLICATE_TOKEN\",
    \"type\": \"encrypted\",
    \"target\": [\"production\", \"preview\", \"development\"]
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Environment variable added successfully!${NC}"
else
    echo -e "${YELLOW}⚠ Variable might already exist (code: $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "🚀 Triggering deployment..."

# Trigger a deployment by creating a new deployment
DEPLOY_RESPONSE=$(curl -s -X POST \
  "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"gitSource\": {
      \"type\": \"github\",
      \"ref\": \"claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag\",
      \"repoId\": \"auto\"
    }
  }")

DEPLOY_URL=$(echo "$DEPLOY_RESPONSE" | grep -o "\"url\":\"[^\"]*\"" | head -1 | cut -d'"' -f4)

if [ -n "$DEPLOY_URL" ]; then
    echo -e "${GREEN}✓ Deployment triggered!${NC}"
    echo ""
    echo "🌐 Deployment URL: https://$DEPLOY_URL"
    echo ""
    echo "⏳ Deployment is in progress. Check status at:"
    echo "   https://vercel.com/deployments"
    echo ""
    echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Wait 2-3 minutes for deployment to finish"
    echo "2. Test at: https://www.alldogsrockshop.com"
    echo "3. Upload a dog photo and verify it generates YOUR dog (not a random one)"
else
    echo -e "${RED}ERROR: Deployment failed${NC}"
    echo "Response: $DEPLOY_RESPONSE"
    echo ""
    echo "Try manual deployment:"
    echo "1. Go to https://vercel.com"
    echo "2. Select your project"
    echo "3. Click 'Deployments' tab"
    echo "4. Click 'Redeploy' on the latest deployment"
    exit 1
fi

echo ""
echo "🎉 All done! Your shop is now using Replicate IP-Adapter for identity-preserving image generation."
echo ""
