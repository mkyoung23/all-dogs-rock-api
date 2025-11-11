#!/bin/bash

# Direct Shopify deployment script
# Load environment variables
set -a
source .env.local 2>/dev/null || true
set +a

SHOPIFY_DOMAIN="8k5mna-5e.myshopify.com"
ACCESS_TOKEN="${SHOPIFY_SECRET_KEY:-${SHOPIFY_ACCESS_TOKEN}}"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: Missing Shopify access token"
  exit 1
fi

echo "Deploying pages to Shopify..."
echo "Using domain: $SHOPIFY_DOMAIN"
echo "Token starts with: ${ACCESS_TOKEN:0:8}..."
echo ""

# Function to create/update page
deploy_page() {
  local TITLE="$1"
  local HANDLE="$2"
  local FILE="$3"

  echo "Processing: $TITLE"

  # Read file content and escape for JSON
  BODY=$(cat "$FILE" | jq -Rs .)

  # Check if page exists
  EXISTING=$(curl -s -X GET \
    "https://$SHOPIFY_DOMAIN/admin/api/2024-10/pages.json" \
    -H "X-Shopify-Access-Token: $ACCESS_TOKEN" \
    -H "Content-Type: application/json")

  PAGE_ID=$(echo "$EXISTING" | jq -r ".pages[] | select(.handle==\"$HANDLE\") | .id")

  if [ -n "$PAGE_ID" ] && [ "$PAGE_ID" != "null" ]; then
    echo "  Updating existing page (ID: $PAGE_ID)..."
    RESPONSE=$(curl -s -X PUT \
      "https://$SHOPIFY_DOMAIN/admin/api/2024-10/pages/$PAGE_ID.json" \
      -H "X-Shopify-Access-Token: $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"page\":{\"id\":$PAGE_ID,\"title\":\"$TITLE\",\"body_html\":$BODY}}")
  else
    echo "  Creating new page..."
    RESPONSE=$(curl -s -X POST \
      "https://$SHOPIFY_DOMAIN/admin/api/2024-10/pages.json" \
      -H "X-Shopify-Access-Token: $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"page\":{\"title\":\"$TITLE\",\"handle\":\"$HANDLE\",\"body_html\":$BODY}}")
  fi

  # Check for errors
  if echo "$RESPONSE" | jq -e '.errors' > /dev/null 2>&1; then
    echo "  ✗ Failed:"
    echo "$RESPONSE" | jq '.errors'
  else
    HANDLE_OUT=$(echo "$RESPONSE" | jq -r '.page.handle')
    echo "  ✓ Success: https://alldogsrockshop.com/pages/$HANDLE_OUT"
  fi
  echo ""
}

# Deploy pages
deploy_page "Welcome to All Dogs Rock" "welcome" "WELCOME_PAGE.liquid"
deploy_page "Create Your Iconic Dog" "create-iconic-dog" "MAIN_PAGE_WITH_PRODUCTS.liquid"

echo "Deployment complete!"
