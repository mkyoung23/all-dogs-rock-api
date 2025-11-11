// Script to create Shopify pages using REST API
// Usage: node api/shopify/create-pages-rest.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'alldogsrockshop.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_SECRET_KEY;

/**
 * Create a page using REST API
 */
async function createPage({ title, handle, body_html }) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages.json`;

  console.log(`   🔗 API URL: ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ACCESS_TOKEN
    },
    body: JSON.stringify({
      page: {
        title,
        handle,
        body_html
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.page;
}

/**
 * Get all pages using REST API
 */
async function getPages() {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages.json`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ACCESS_TOKEN
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.pages;
}

/**
 * Delete a page by ID
 */
async function deletePage(pageId) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages/${pageId}.json`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Shopify-Access-Token': ACCESS_TOKEN
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🛍️  Shopify Page Creator (REST API)\n');
  console.log(`Store: ${SHOPIFY_DOMAIN}`);
  console.log(`Access Token: ${ACCESS_TOKEN ? '✅ Present' : '❌ Missing'}\n`);

  if (!ACCESS_TOKEN) {
    console.error('❌ ERROR: SHOPIFY_SECRET_KEY environment variable is not set!');
    process.exit(1);
  }

  const rootDir = join(__dirname, '..', '..');

  try {
    // First, list existing pages
    console.log('📋 Listing existing pages...\n');
    const existingPages = await getPages();
    console.log(`Found ${existingPages.length} existing page(s):\n`);
    existingPages.forEach(page => {
      console.log(`   • ${page.title} (${page.handle}) - ID: ${page.id}`);
    });
    console.log('');

    // Define pages to create
    const pages = [
      {
        title: 'Welcome to All Dogs Rock',
        handle: 'welcome',
        file: join(rootDir, 'WELCOME_PAGE.liquid'),
        description: 'Landing page with How It Works'
      },
      {
        title: 'Create Your Iconic Dog',
        handle: 'create-iconic-dog',
        file: join(rootDir, 'MAIN_PAGE_WITH_PRODUCTS.liquid'),
        description: '4-stage creation flow'
      }
    ];

    const results = [];

    for (const page of pages) {
      try {
        console.log(`\n📄 Processing: ${page.title}`);
        console.log(`   Handle: ${page.handle}`);
        console.log(`   Description: ${page.description}`);

        // Check if page exists and delete it
        const existing = existingPages.find(p => p.handle === page.handle);
        if (existing) {
          console.log(`   ⚠️  Page already exists (ID: ${existing.id}). Deleting...`);
          await deletePage(existing.id);
          console.log(`   ✅ Deleted old version`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Read the liquid template
        console.log(`   📖 Reading template...`);
        const body_html = readFileSync(page.file, 'utf-8');

        // Create the page
        console.log(`   ✨ Creating page...`);
        const created = await createPage({
          title: page.title,
          handle: page.handle,
          body_html
        });

        console.log(`   ✅ SUCCESS!`);
        console.log(`   🔗 Public URL: https://alldogsrockshop.com/pages/${created.handle}`);

        results.push({
          success: true,
          title: page.title,
          handle: page.handle,
          url: `https://alldogsrockshop.com/pages/${created.handle}`,
          id: created.id
        });

      } catch (error) {
        console.error(`   ❌ FAILED: ${error.message}`);
        results.push({
          success: false,
          title: page.title,
          handle: page.handle,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 SUMMARY\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    if (successful.length > 0) {
      console.log('✅ Successfully created pages:\n');
      successful.forEach(r => {
        console.log(`   • ${r.title}`);
        console.log(`     ${r.url}\n`);
      });
    }

    if (failed.length > 0) {
      console.log('❌ Failed to create:\n');
      failed.forEach(r => {
        console.log(`   • ${r.title}: ${r.error}\n`);
      });
    }

    console.log('═'.repeat(80));
    console.log(`\n🎉 Done! Created ${successful.length} of ${results.length} pages.\n`);

    if (successful.length > 0) {
      console.log('🚀 YOUR LIVE PAGES:');
      console.log('   1. Welcome Page: https://alldogsrockshop.com/pages/welcome');
      console.log('   2. Creation Page: https://alldogsrockshop.com/pages/create-iconic-dog\n');
    }

  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createPage, getPages, deletePage };
