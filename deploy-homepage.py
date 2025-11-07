#!/usr/bin/env python3
import json
import os
import sys
import http.client

# Read the homepage content
with open('/home/user/all-dogs-rock-api/shopify-homepage.liquid', 'r') as f:
    homepage_html = f.read()

# Prepare the data
data = {
    "page": {
        "title": "Welcome to All Dogs Rock",
        "body_html": homepage_html,
        "published": True
    }
}

json_data = json.dumps(data)

# API credentials
api_key = os.environ.get('SHOPIFY_APP_ADMIN_API_KEY')
if not api_key:
    print('❌ SHOPIFY_APP_ADMIN_API_KEY not found in environment')
    sys.exit(1)

print('🏠 Creating homepage page in Shopify...')
print('')

# Make the API request
conn = http.client.HTTPSConnection("8k5mna-5e.myshopify.com")
headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': api_key
}

try:
    conn.request("POST", "/admin/api/2024-01/pages.json", json_data, headers)
    response = conn.getresponse()
    response_data = response.read().decode()

    if response.status in [200, 201]:
        result = json.loads(response_data)
        if 'page' in result and 'id' in result['page']:
            page_id = result['page']['id']
            page_handle = result['page'].get('handle', 'unknown')

            print('✅ SUCCESS! Homepage page created!')
            print('')
            print(f'Page ID: {page_id}')
            print(f'Page Handle: {page_handle}')
            print('')
            print(f'View at: https://www.alldogsrockshop.com/pages/{page_handle}')
            print(f'Edit at: https://admin.shopify.com/store/8k5mna-5e/pages/{page_id}')
            print('')
            print('🎯 Next: Set this as your homepage in Theme Customizer!')
            print('   Go to: Online Store → Themes → Customize')
            print('   Homepage → Add section → Custom Liquid or Page')
            print(f'   Select: "{page_handle}"')
        else:
            print('✅ Page created but unexpected response format')
            print(response_data)
    else:
        print(f'❌ Error: Status {response.status}')
        print(response_data)

except Exception as e:
    print(f'❌ Error: {e}')
finally:
    conn.close()
