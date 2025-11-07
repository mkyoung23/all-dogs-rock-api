#!/usr/bin/env python3

import json
import os
import urllib.request
import urllib.error

print("🚀 Deploying homepage to Shopify...\n")

# Read homepage template
with open('shopify-homepage.liquid', 'r') as f:
    homepage_html = f.read()

print(f"✅ Homepage template loaded ({len(homepage_html)} characters)\n")

# Configuration
shop = "8k5mna-5e.myshopify.com"
access_token = os.environ.get('SHOPIFY_APP_ADMIN_API_KEY') or os.environ.get('SHOPIFY_ACCESS_TOKEN')

if not access_token:
    print("❌ No access token found!")
    print("Please set SHOPIFY_APP_ADMIN_API_KEY or SHOPIFY_ACCESS_TOKEN")
    exit(1)

print(f"📍 Shop: {shop}")
print(f"🔑 Using access token: {access_token[:10]}...\n")

# GraphQL mutation
mutation = """
mutation createPage($input: PageCreateInput!) {
  pageCreate(page: $input) {
    page {
      id
      title
      handle
    }
    userErrors {
      field
      message
    }
  }
}
"""

variables = {
    "input": {
        "title": "Welcome to All Dogs Rock",
        "handle": "home",
        "body": homepage_html,
        "published": True
    }
}

payload = {
    "query": mutation,
    "variables": variables
}

# Make request
url = f"https://{shop}/admin/api/2024-01/graphql.json"
print(f"📤 Sending request to: {url}\n")

headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': access_token
}

json_data = json.dumps(payload).encode('utf-8')

try:
    req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')

    with urllib.request.urlopen(req) as response:
        response_data = response.read().decode('utf-8')
        result = json.loads(response_data)

        print(f"📊 Response status: {response.status}")
        print(f"\n📥 Response body:")
        print(json.dumps(result, indent=2))

        if result.get('data', {}).get('pageCreate', {}).get('page'):
            page = result['data']['pageCreate']['page']
            print(f"\n✅ SUCCESS! Homepage deployed!")
            print(f"\n🌐 Your page: https://www.alldogsrockshop.com/pages/{page['handle']}")
            print(f"\n📝 Next steps:")
            print(f"   1. Go to: https://admin.shopify.com/store/8k5mna-5e/themes/current/editor")
            print(f"   2. Click: Homepage → Add section → Custom Liquid")
            print(f"   3. Paste the homepage code and Save")
        elif result.get('errors'):
            print(f"\n❌ GraphQL Errors:")
            print(json.dumps(result['errors'], indent=2))
        elif result.get('data', {}).get('pageCreate', {}).get('userErrors'):
            print(f"\n❌ User Errors:")
            print(json.dumps(result['data']['pageCreate']['userErrors'], indent=2))

except urllib.error.HTTPError as e:
    print(f"\n❌ HTTP Error {e.code}:")
    error_body = e.read().decode('utf-8')
    print(error_body)
    try:
        error_json = json.loads(error_body)
        print(json.dumps(error_json, indent=2))
    except:
        pass
except Exception as e:
    print(f"\n❌ Request failed: {e}")
    import traceback
    traceback.print_exc()
