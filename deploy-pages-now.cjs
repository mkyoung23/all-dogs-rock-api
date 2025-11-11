#!/usr/bin/env node

// Quick script to deploy Shopify pages directly
const fs = require('fs');
const path = require('path');

const SHOPIFY_DOMAIN = 'alldogsrockshop.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_SECRET_KEY || process.env.SHOPIFY_ACCESS_TOKEN;

async function deployPages() {
  if (!ACCESS_TOKEN) {
    console.error('Error: Missing SHOPIFY_SECRET_KEY or SHOPIFY_ACCESS_TOKEN');
    process.exit(1);
  }

  console.log('Deploying pages to Shopify...\n');

  const pages = [
    {
      title: 'Welcome to All Dogs Rock',
      handle: 'welcome',
      body_html: fs.readFileSync(path.join(__dirname, 'WELCOME_PAGE.liquid'), 'utf-8')
    },
    {
      title: 'Create Your Iconic Dog',
      handle: 'create-iconic-dog',
      body_html: fs.readFileSync(path.join(__dirname, 'MAIN_PAGE_WITH_PRODUCTS.liquid'), 'utf-8')
    }
  ];

  // Get existing pages
  console.log('Fetching existing pages...');
  const listResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages.json`, {
    headers: {
      'X-Shopify-Access-Token': ACCESS_TOKEN
    }
  });

  let existingPages = [];
  if (listResponse.ok) {
    const data = await listResponse.json();
    existingPages = data.pages || [];
    console.log(`Found ${existingPages.length} existing pages\n`);
  }

  // Create or update each page
  for (const page of pages) {
    const existing = existingPages.find(p => p.handle === page.handle);

    if (existing) {
      // Update existing page
      console.log(`Updating page: ${page.title}...`);
      const updateResponse = await fetch(
        `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages/${existing.id}.json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ACCESS_TOKEN
          },
          body: JSON.stringify({ page: page })
        }
      );

      if (updateResponse.ok) {
        const data = await updateResponse.json();
        console.log(`✓ Updated: https://alldogsrockshop.com/pages/${data.page.handle}\n`);
      } else {
        const errorText = await updateResponse.text();
        console.error(`✗ Failed to update ${page.title}: ${updateResponse.status} ${errorText}\n`);
      }
    } else {
      // Create new page
      console.log(`Creating page: ${page.title}...`);
      const createResponse = await fetch(
        `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ACCESS_TOKEN
          },
          body: JSON.stringify({ page: page })
        }
      );

      if (createResponse.ok) {
        const data = await createResponse.json();
        console.log(`✓ Created: https://alldogsrockshop.com/pages/${data.page.handle}\n`);
      } else {
        const errorText = await createResponse.text();
        console.error(`✗ Failed to create ${page.title}: ${createResponse.status} ${errorText}\n`);
      }
    }
  }

  console.log('\nDeployment complete!');
  console.log('\nYour pages are now live at:');
  console.log('- https://alldogsrockshop.com/pages/welcome');
  console.log('- https://alldogsrockshop.com/pages/create-iconic-dog');
}

deployPages().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
