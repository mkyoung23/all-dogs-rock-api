#!/usr/bin/env node

// Script to list and optionally delete pages from Shopify store
// This helps clean up old test pages that confuse customers

const SHOPIFY_ADMIN_TOKEN = process.env.AllDogsRock_Gallery_Admin_App_Key || process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN || '8k5mna-5e.myshopify.com';
const API_VERSION = '2024-01';

if (!SHOPIFY_ADMIN_TOKEN) {
  console.error('❌ Error: SHOPIFY_ACCESS_TOKEN environment variable not set');
  console.error('Please set it with: export AllDogsRock_Gallery_Admin_App_Key=your-token');
  process.exit(1);
}

async function listPages() {
  const query = `
    query {
      pages(first: 50) {
        edges {
          node {
            id
            title
            handle
            createdAt
            updatedAt
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error('❌ Error:', data.errors);
    return [];
  }

  return data.data.pages.edges.map(edge => edge.node);
}

async function deletePage(pageId) {
  const mutation = `
    mutation deletePage($id: ID!) {
      pageDelete(id: $id) {
        deletedPageId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { id: pageId }
    }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error('❌ Error deleting page:', data.errors);
    return false;
  }

  if (data.data.pageDelete.userErrors.length > 0) {
    console.error('❌ User errors:', data.data.pageDelete.userErrors);
    return false;
  }

  return true;
}

async function listCollections() {
  const query = `
    query {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
            productsCount
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error('❌ Error:', data.errors);
    return [];
  }

  return data.data.collections.edges.map(edge => edge.node);
}

async function main() {
  console.log('🔍 Scanning Shopify store:', SHOPIFY_STORE);
  console.log('');

  // List pages
  console.log('📄 PAGES:');
  const pages = await listPages();

  if (pages.length === 0) {
    console.log('  No pages found');
  } else {
    pages.forEach((page, index) => {
      console.log(`  ${index + 1}. "${page.title}" → /pages/${page.handle}`);
      console.log(`     ID: ${page.id}`);
      console.log(`     Created: ${new Date(page.createdAt).toLocaleDateString()}`);
      console.log('');
    });
  }

  console.log('');
  console.log('📦 COLLECTIONS:');
  const collections = await listCollections();

  if (collections.length === 0) {
    console.log('  No collections found');
  } else {
    collections.forEach((collection, index) => {
      console.log(`  ${index + 1}. "${collection.title}" → /collections/${collection.handle}`);
      console.log(`     ID: ${collection.id}`);
      console.log(`     Products: ${collection.productsCount}`);
      console.log('');
    });
  }

  console.log('');
  console.log('✅ SCAN COMPLETE');
  console.log('');
  console.log('TO DELETE A PAGE, run:');
  console.log('  node cleanup-shopify-pages.js delete-page <page-id>');
}

// Handle command line arguments
if (process.argv[2] === 'delete-page' && process.argv[3]) {
  const pageId = process.argv[3];
  console.log('🗑️  Deleting page:', pageId);
  deletePage(pageId).then(success => {
    if (success) {
      console.log('✅ Page deleted successfully');
    } else {
      console.log('❌ Failed to delete page');
    }
  });
} else {
  main();
}
