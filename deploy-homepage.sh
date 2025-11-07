#!/bin/bash
# Deploy Homepage to Shopify - Automated Script

echo "🏠 Deploying All Dogs Rock Homepage..."
echo ""

# Read the homepage content
HOMEPAGE_CONTENT=$(cat shopify-homepage.liquid)

# Escape for JSON
HOMEPAGE_JSON=$(jq -Rs . < shopify-homepage.liquid)

echo "📄 Creating homepage page in Shopify..."

# Create or update the page via Shopify Admin API
RESPONSE=$(curl -s -X POST "https://8k5mna-5e.myshopify.com/admin/api/2024-01/pages.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_APP_ADMIN_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"page\": {
      \"title\": \"Welcome to All Dogs Rock\",
      \"body_html\": ${HOMEPAGE_JSON},
      \"published\": true
    }
  }")

echo "$RESPONSE" | jq .

PAGE_ID=$(echo "$RESPONSE" | jq -r '.page.id')

if [ "$PAGE_ID" != "null" ] && [ "$PAGE_ID" != "" ]; then
  echo ""
  echo "✅ Success! Homepage created with ID: $PAGE_ID"
  echo ""
  echo "📋 Next Steps:"
  echo "1. Go to: https://admin.shopify.com/store/8k5mna-5e/pages/${PAGE_ID}"
  echo "2. Or visit: https://www.alldogsrockshop.com/pages/welcome-to-all-dogs-rock"
  echo ""
  echo "To set as homepage:"
  echo "1. Go to: Online Store → Themes → Customize"
  echo "2. Homepage section → Add section → Page content"
  echo "3. Select: 'Welcome to All Dogs Rock'"
  echo "4. Save!"
else
  echo ""
  echo "⚠️  Could not create page automatically."
  echo "Please follow manual instructions in HOMEPAGE_SETUP.md"
fi
