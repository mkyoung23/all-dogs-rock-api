// Shopify Page Cleanup Script
// Lists and optionally deletes old pages from your Shopify store
// Usage: node api/shopify/cleanup-pages.js [--delete]

import { shopifyAdminQuery } from '../../lib/shopify-client.js';

/**
 * List all pages in the Shopify store
 */
async function listPages() {
  const query = `
    query getPages($first: Int!) {
      pages(first: $first) {
        edges {
          node {
            id
            title
            handle
            createdAt
            updatedAt
            body
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  try {
    const data = await shopifyAdminQuery(query, { first: 250 });
    return data.pages;
  } catch (error) {
    console.error('❌ Error listing pages:', error.message);
    throw error;
  }
}

/**
 * Delete a page by ID
 */
async function deletePage(pageId) {
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

  try {
    const data = await shopifyAdminQuery(mutation, {
      input: { id: pageId }
    });

    if (data.pageDelete.userErrors?.length > 0) {
      throw new Error(`Page deletion failed: ${JSON.stringify(data.pageDelete.userErrors)}`);
    }

    return data.pageDelete.deletedPageId;
  } catch (error) {
    console.error(`❌ Error deleting page ${pageId}:`, error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const shouldDelete = process.argv.includes('--delete');
  const dryRun = !shouldDelete;

  console.log('\n🛍️  Shopify Page Cleanup Tool\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (listing only)' : '🗑️  DELETE MODE'}\n`);

  try {
    // List all pages
    console.log('📄 Fetching pages from Shopify...\n');
    const pagesData = await listPages();
    const pages = pagesData.edges.map(edge => edge.node);

    if (pages.length === 0) {
      console.log('✅ No pages found in the store.\n');
      return;
    }

    console.log(`Found ${pages.length} page(s):\n`);
    console.log('─'.repeat(80));

    // Display all pages
    pages.forEach((page, index) => {
      const created = new Date(page.createdAt).toLocaleDateString();
      const updated = new Date(page.updatedAt).toLocaleDateString();
      const bodyPreview = page.body ? page.body.substring(0, 100).replace(/\n/g, ' ') : '(empty)';

      console.log(`\n${index + 1}. ${page.title}`);
      console.log(`   ID: ${page.id}`);
      console.log(`   Handle: ${page.handle}`);
      console.log(`   Created: ${created}`);
      console.log(`   Updated: ${updated}`);
      console.log(`   Preview: ${bodyPreview}...`);
    });

    console.log('\n' + '─'.repeat(80));

    // If in delete mode, ask for confirmation
    if (shouldDelete) {
      console.log('\n⚠️  WARNING: You are about to delete ALL pages listed above!');
      console.log('This action cannot be undone.\n');

      // In a real scenario, you'd want to use readline or prompts for confirmation
      // For now, we'll just list pages that would be deleted
      console.log('To confirm deletion, please review the list above.\n');

      // Delete pages (commented out for safety - uncomment when ready)
      /*
      let deletedCount = 0;
      for (const page of pages) {
        try {
          console.log(`Deleting: ${page.title}...`);
          await deletePage(page.id);
          deletedCount++;
          console.log(`✅ Deleted successfully\n`);
        } catch (error) {
          console.error(`❌ Failed to delete: ${error.message}\n`);
        }
      }
      console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} of ${pages.length} pages.\n`);
      */

      console.log('🔒 Deletion code is currently commented out for safety.');
      console.log('Review the script and uncomment the deletion block when ready.\n');
    } else {
      console.log('\n💡 To delete these pages, run with --delete flag:');
      console.log('   node api/shopify/cleanup-pages.js --delete\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { listPages, deletePage };
