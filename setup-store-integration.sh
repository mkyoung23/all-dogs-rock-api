#!/bin/bash

# All Dogs Rock - Complete Store Integration
# This script will:
# 1. Set homepage to redirect to welcome page
# 2. Add navigation menu links

set -a
source .env.local 2>/dev/null || true
set +a

SHOPIFY_DOMAIN="8k5mna-5e.myshopify.com"
ACCESS_TOKEN="${SHOPIFY_SECRET_KEY}"
THEME_ID="142814445649"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: Missing Shopify access token"
  exit 1
fi

echo "🚀 Setting up All Dogs Rock Shop integration..."
echo ""

# Step 1: Update homepage template to redirect to welcome page
echo "📝 Step 1: Setting up homepage redirect..."

HOMEPAGE_CODE='{% comment %}
AUTO-REDIRECT TO WELCOME PAGE
{% endcomment %}

<script>
  // Immediate redirect to welcome page
  if (window.location.pathname === "/" || window.location.pathname === "") {
    window.location.replace("/pages/welcome-to-all-dogs-rock");
  }
</script>

<noscript>
  <meta http-equiv="refresh" content="0; url=/pages/welcome-to-all-dogs-rock">
  <p>Redirecting to <a href="/pages/welcome-to-all-dogs-rock">Welcome Page</a>...</p>
</noscript>

{% comment %}
Original homepage template preserved below
{% endcomment %}

{% section "image-banner" %}
{% section "rich-text" %}
{% section "featured-collection" %}
{% section "collage" %}
{% section "video" %}
{% section "multicolumn" %}
'

# Update index.liquid template
HOMEPAGE_JSON=$(jq -n --arg value "$HOMEPAGE_CODE" '{asset: {key: "templates/index.liquid", value: $value}}')

curl -s -X PUT \
  "https://$SHOPIFY_DOMAIN/admin/api/2024-10/themes/$THEME_ID/assets.json" \
  -H "X-Shopify-Access-Token: $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$HOMEPAGE_JSON" > /dev/null

if [ $? -eq 0 ]; then
  echo "  ✓ Homepage redirect configured"
else
  echo "  ✗ Failed to update homepage"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📍 Your store URLs:"
echo "  Homepage: https://alldogsrockshop.com"
echo "  Welcome: https://alldogsrockshop.com/pages/welcome-to-all-dogs-rock"
echo "  Create: https://alldogsrockshop.com/pages/create-iconic-dog"
echo ""
echo "🔗 Next Steps:"
echo "  1. Visit your store homepage - it should auto-redirect to Welcome page"
echo "  2. Add navigation links in Shopify Admin → Navigation"
echo "  3. Test the create iconic dog flow!"
