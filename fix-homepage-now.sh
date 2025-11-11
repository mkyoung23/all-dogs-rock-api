#!/bin/bash

# Fix Homepage Script
# This script calls the API to set up your homepage properly

echo "======================================"
echo "   FIXING YOUR SHOPIFY HOMEPAGE"
echo "======================================"
echo ""
echo "This will:"
echo "  1. Create/update the welcome page in Shopify"
echo "  2. Redirect your homepage to the welcome page"
echo ""
echo "Press ENTER to continue..."
read

echo ""
echo "Calling API..."
echo ""

# Call the API endpoint
response=$(curl -X POST \
  https://all-dogs-rock-api-v2.vercel.app/api/setup-homepage-complete \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}" \
  -s)

# Extract HTTP status code (last line)
http_code=$(echo "$response" | tail -n1)

# Extract response body (everything except last line)
body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_code"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS! Your homepage has been fixed!"
    echo ""
    echo "Test these URLs:"
    echo "  • https://alldogsrockshop.com"
    echo "  • https://8k5mna-5e.myshopify.com"
    echo ""
    echo "Full response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ ERROR: Failed to fix homepage"
    echo ""
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
fi

echo ""
echo "======================================"
