// Script to automatically create Shopify pages with the liquid templates
// Usage: node api/shopify/create-pages.js

import { shopifyAdminQuery } from '../../lib/shopify-client.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a page in Shopify
 */
async function createPage({ title, handle, body }) {
  const mutation = `
    mutation pageCreate($input: PageInput!) {
      pageCreate(input: $input) {
        page {
          id
          title
          handle
          createdAt
          onlineStoreUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await shopifyAdminQuery(mutation, {
      input: {
        title,
        handle,
        body
      }
    });

    if (data.pageCreate.userErrors?.length > 0) {
      throw new Error(`Page creation failed: ${JSON.stringify(data.pageCreate.userErrors)}`);
    }

    return data.pageCreate.page;
  } catch (error) {
    console.error(`❌ Error creating page ${title}:`, error.message);
    throw error;
  }
}

/**
 * Check if page already exists
 */
async function pageExists(handle) {
  const query = `
    query getPageByHandle($handle: String!) {
      pageByHandle(handle: $handle) {
        id
        title
        handle
      }
    }
  `;

  try {
    const data = await shopifyAdminQuery(query, { handle });
    return data.pageByHandle !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Delete a page by handle (for cleanup)
 */
async function deletePageByHandle(handle) {
  // First get the page
  const query = `
    query getPageByHandle($handle: String!) {
      pageByHandle(handle: $handle) {
        id
      }
    }
  `;

  const data = await shopifyAdminQuery(query, { handle });
  if (!data.pageByHandle) {
    console.log(`Page ${handle} doesn't exist, skipping delete`);
    return;
  }

  const mutation = `
    mutation pageDelete($input: PageDeleteInput!) {
      pageDelete(input: $input) {
        deletedPageId
        userErrors {
          field
          message
        }
      }
    }
  `;

  await shopifyAdminQuery(mutation, {
    input: { id: data.pageByHandle.id }
  });

  console.log(`✅ Deleted old page: ${handle}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🛍️  Shopify Page Creator\n');
  console.log('Creating pages in your Shopify store...\n');

  const rootDir = join(__dirname, '..', '..');

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
      description: '4-stage creation flow (upload, pose, generate, product)'
    }
  ];

  const results = [];

  for (const page of pages) {
    try {
      console.log(`\n📄 Processing: ${page.title}`);
      console.log(`   Handle: ${page.handle}`);
      console.log(`   Description: ${page.description}`);

      // Check if page exists
      const exists = await pageExists(page.handle);
      if (exists) {
        console.log(`   ⚠️  Page already exists. Deleting old version...`);
        await deletePageByHandle(page.handle);
        // Wait a moment for Shopify to process
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Read the liquid template
      console.log(`   📖 Reading template: ${page.file}`);
      const body = readFileSync(page.file, 'utf-8');

      // Create the page
      console.log(`   ✨ Creating page in Shopify...`);
      const created = await createPage({
        title: page.title,
        handle: page.handle,
        body: body
      });

      console.log(`   ✅ SUCCESS!`);
      console.log(`   🔗 URL: https://alldogsrockshop.com/pages/${created.handle}`);
      console.log(`   📋 Admin: https://admin.shopify.com/store/alldogsrockshop/pages/${created.id.split('/').pop()}`);

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
    console.log('🚀 NEXT STEPS:');
    console.log('   1. Visit https://alldogsrockshop.com/pages/welcome to see your landing page');
    console.log('   2. Test the full flow at https://alldogsrockshop.com/pages/create-iconic-dog');
    console.log('   3. Make sure your Vercel API is deployed at: https://all-dogs-rock-api-v2.vercel.app\n');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}

export { createPage, pageExists, deletePageByHandle };
