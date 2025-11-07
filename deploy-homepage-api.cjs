#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

// Read the homepage content
const homepageHtml = fs.readFileSync('/home/user/all-dogs-rock-api/shopify-homepage.liquid', 'utf8');

// Prepare the API request
const postData = JSON.stringify({
  page: {
    title: "Welcome to All Dogs Rock",
    body_html: homepageHtml,
    published: true
  }
});

const options = {
  hostname: '8k5mna-5e.myshopify.com',
  port: 443,
  path: '/admin/api/2024-01/pages.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
    'X-Shopify-Access-Token': process.env.SHOPIFY_APP_ADMIN_API_KEY
  }
};

console.log('🏠 Creating homepage page in Shopify...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.page && response.page.id) {
        console.log('✅ SUCCESS! Homepage page created!');
        console.log('');
        console.log('Page ID:', response.page.id);
        console.log('Page Handle:', response.page.handle);
        console.log('');
        console.log('View at: https://www.alldogsrockshop.com/pages/' + response.page.handle);
        console.log('Edit at: https://admin.shopify.com/store/8k5mna-5e/pages/' + response.page.id);
        console.log('');
        console.log('🎯 Next: Set this as your homepage in Theme settings!');
      } else {
        console.log('Response:', data);
      }
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error);
});

req.write(postData);
req.end();
