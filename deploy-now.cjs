#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

console.log('🚀 Deploying homepage to Shopify...\n');

// Read homepage template
const homepageHtml = fs.readFileSync('./shopify-homepage.liquid', 'utf8');
console.log(`✅ Homepage template loaded (${homepageHtml.length} characters)\n`);

// Configuration
const shop = '8k5mna-5e.myshopify.com';
const accessToken = process.env.SHOPIFY_APP_ADMIN_API_KEY || process.env.SHOPIFY_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ No access token found!');
  console.error('Please set SHOPIFY_APP_ADMIN_API_KEY or SHOPIFY_ACCESS_TOKEN');
  process.exit(1);
}

console.log(`📍 Shop: ${shop}`);
console.log(`🔑 Using access token: ${accessToken.substring(0, 10)}...`);

// GraphQL mutation to create page
const mutation = `
  mutation createPage($input: PageCreateInput!) {
    pageCreate(page: $input) {
      page {
        id
        title
        handle
        body
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const variables = {
  input: {
    title: 'Welcome to All Dogs Rock',
    handle: 'home',
    body: homepageHtml,
    published: true
  }
};

const payload = JSON.stringify({
  query: mutation,
  variables: variables
});

const options = {
  hostname: shop,
  path: '/admin/api/2024-01/graphql.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log(`\n📤 Sending request to: https://${shop}/admin/api/2024-01/graphql.json\n`);

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📊 Response status: ${res.statusCode}`);
    console.log(`📊 Response headers:`, res.headers);
    console.log(`\n📥 Response body:`);

    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));

      if (response.data?.pageCreate?.page) {
        const page = response.data.pageCreate.page;
        console.log('\n✅ SUCCESS! Homepage deployed!');
        console.log(`\n🌐 Your page: https://www.alldogsrockshop.com/pages/${page.handle}`);
        console.log(`\n📝 Next steps:`);
        console.log(`   1. Go to: https://admin.shopify.com/store/8k5mna-5e/themes/current/editor`);
        console.log(`   2. Click: Homepage → Add section → Custom Liquid`);
        console.log(`   3. Paste the homepage code and Save`);
      } else if (response.errors) {
        console.log('\n❌ GraphQL Errors:', response.errors);
      } else if (response.data?.pageCreate?.userErrors?.length > 0) {
        console.log('\n❌ User Errors:', response.data.pageCreate.userErrors);
      }
    } catch (e) {
      console.log('Raw response:', data);
      console.error('\n❌ Failed to parse response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request failed:', error.message);
  process.exit(1);
});

req.write(payload);
req.end();
