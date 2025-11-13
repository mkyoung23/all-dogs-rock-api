// Vercel API endpoint to cleanup ALL old pages and recreate the correct ones
// This will DELETE all existing All Dogs Rock pages and create fresh ones
// Call it: POST /api/shopify/cleanup-and-setup

import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '8k5mna-5e.myshopify.com';
  const ACCESS_TOKEN = process.env.SHOPIFY_SECRET_KEY
    || process.env.SHOPIFY_ACCESS_TOKEN
    || process.env.ALLDOGSROCK_GALLERY_ADMIN_APP_KEY;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({
      error: 'Missing Shopify access token',
      checked: ['SHOPIFY_SECRET_KEY', 'SHOPIFY_ACCESS_TOKEN', 'ALLDOGSROCK_GALLERY_ADMIN_APP_KEY']
    });
  }

  const log = [];
  const addLog = (msg) => {
    console.log(msg);
    log.push(msg);
  };

  try {
    addLog('🧹 STEP 1: Fetching all existing pages...');

    // Get all existing pages
    const listResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages.json`, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN
      }
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to list pages: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    const existingPages = listData.pages || [];

    addLog(`Found ${existingPages.length} existing pages`);

    // Log all pages
    existingPages.forEach(page => {
      addLog(`  - "${page.title}" (handle: ${page.handle}, id: ${page.id})`);
    });

    // Define the pages we want to keep/recreate
    const targetHandles = ['welcome', 'create-iconic-dog'];

    // Find pages to delete (any page with our target handles)
    const pagesToDelete = existingPages.filter(page =>
      targetHandles.includes(page.handle) ||
      page.title.includes('Welcome to All Dogs Rock') ||
      page.title.includes('Create Your Iconic Dog')
    );

    addLog(`\n🗑️  STEP 2: Deleting ${pagesToDelete.length} old/duplicate pages...`);

    const deletionResults = [];
    for (const page of pagesToDelete) {
      try {
        addLog(`  Deleting: "${page.title}" (id: ${page.id})`);

        const deleteResponse = await fetch(
          `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages/${page.id}.json`,
          {
            method: 'DELETE',
            headers: {
              'X-Shopify-Access-Token': ACCESS_TOKEN
            }
          }
        );

        if (deleteResponse.ok) {
          addLog(`  ✅ Deleted: ${page.title}`);
          deletionResults.push({ success: true, title: page.title });
        } else {
          const errorText = await deleteResponse.text();
          addLog(`  ❌ Failed to delete ${page.title}: ${deleteResponse.status} ${errorText}`);
          deletionResults.push({ success: false, title: page.title, error: errorText });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        addLog(`  ❌ Error deleting ${page.title}: ${error.message}`);
        deletionResults.push({ success: false, title: page.title, error: error.message });
      }
    }

    // Wait a moment for Shopify to process deletions
    addLog('\n⏳ Waiting for Shopify to process deletions...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    addLog('\n✨ STEP 3: Creating fresh pages with correct content...');

    // Define pages to create
    const pages = [
      {
        title: 'Welcome to All Dogs Rock',
        handle: 'welcome',
        body_html: readFileSync(join(process.cwd(), 'WELCOME_PAGE.liquid'), 'utf-8'),
        published: true
      },
      {
        title: 'Create Your Iconic Dog',
        handle: 'create-iconic-dog',
        body_html: readFileSync(join(process.cwd(), 'MAIN_PAGE_WITH_PRODUCTS.liquid'), 'utf-8'),
        published: true
      }
    ];

    const creationResults = [];

    for (const page of pages) {
      try {
        addLog(`  Creating: "${page.title}"`);

        const createResponse = await fetch(
          `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': ACCESS_TOKEN
            },
            body: JSON.stringify({ page })
          }
        );

        if (createResponse.ok) {
          const data = await createResponse.json();
          const url = `https://alldogsrockshop.com/pages/${data.page.handle}`;
          addLog(`  ✅ Created: ${page.title}`);
          addLog(`     URL: ${url}`);

          creationResults.push({
            success: true,
            title: page.title,
            handle: data.page.handle,
            url: url,
            id: data.page.id
          });
        } else {
          const errorText = await createResponse.text();
          addLog(`  ❌ Failed to create ${page.title}: ${createResponse.status} ${errorText}`);
          creationResults.push({
            success: false,
            title: page.title,
            error: `${createResponse.status}: ${errorText}`
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        addLog(`  ❌ Error creating ${page.title}: ${error.message}`);
        creationResults.push({
          success: false,
          title: page.title,
          error: error.message
        });
      }
    }

    const successfulCreations = creationResults.filter(r => r.success);
    const successfulDeletions = deletionResults.filter(r => r.success);

    // STEP 4: Set the home page by updating the theme's index.liquid
    addLog('\n🏠 STEP 4: Setting welcome page as home page...');

    let homePageSet = false;
    let homePageError = null;

    try {
      // Get the active theme
      addLog('  Fetching active theme...');
      const themesResponse = await fetch(
        `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/themes.json`,
        {
          headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN
          }
        }
      );

      if (themesResponse.ok) {
        const themesData = await themesResponse.json();
        const activeTheme = themesData.themes.find(t => t.role === 'main');

        if (activeTheme) {
          addLog(`  ✅ Found theme: ${activeTheme.name} (ID: ${activeTheme.id})`);

          // Create new index.liquid that redirects to welcome page
          const newIndexTemplate = `{%- comment -%}
  Custom Home Page - Redirects to Welcome Page
  Auto-generated by All Dogs Rock API
{%- endcomment -%}

<script>
  // Redirect to the custom welcome page
  window.location.href = '/pages/welcome';
</script>

{%- comment -%}
  Fallback for browsers with JavaScript disabled
{%- endcomment -%}
<noscript>
  <meta http-equiv="refresh" content="0; url=/pages/welcome">
</noscript>

<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
  <h1>Welcome to All Dogs Rock</h1>
  <p>Redirecting...</p>
  <p>If not redirected, <a href="/pages/welcome">click here</a>.</p>
</div>
`;

          addLog('  Updating home page template...');
          const updateResponse = await fetch(
            `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/themes/${activeTheme.id}/assets.json`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': ACCESS_TOKEN
              },
              body: JSON.stringify({
                asset: {
                  key: 'templates/index.liquid',
                  value: newIndexTemplate
                }
              })
            }
          );

          if (updateResponse.ok) {
            addLog('  ✅ Home page template updated!');
            addLog('  🌐 Your store home now redirects to: https://alldogsrockshop.com/pages/welcome');
            homePageSet = true;
          } else {
            const errorText = await updateResponse.text();
            addLog(`  ⚠️  Failed to update home page: ${updateResponse.status} ${errorText}`);
            homePageError = `${updateResponse.status}: ${errorText}`;
          }
        } else {
          addLog('  ⚠️  No active theme found');
          homePageError = 'No active theme found';
        }
      } else {
        const errorText = await themesResponse.text();
        addLog(`  ⚠️  Failed to fetch themes: ${themesResponse.status} ${errorText}`);
        homePageError = `${themesResponse.status}: ${errorText}`;
      }
    } catch (error) {
      addLog(`  ⚠️  Error setting home page: ${error.message}`);
      homePageError = error.message;
    }

    addLog('\n' + '='.repeat(80));
    addLog('✅ CLEANUP AND SETUP COMPLETE!');
    addLog(`   Deleted: ${successfulDeletions.length} pages`);
    addLog(`   Created: ${successfulCreations.length} pages`);
    addLog(`   Home page set: ${homePageSet ? 'YES' : 'NO'}`);
    addLog('='.repeat(80));

    if (successfulCreations.length > 0) {
      addLog('\n🚀 YOUR PAGES ARE LIVE:');
      successfulCreations.forEach(r => {
        addLog(`   • ${r.title}: ${r.url}`);
      });
    }

    if (homePageSet) {
      addLog('\n🏠 HOME PAGE:');
      addLog('   • Visit: https://alldogsrockshop.com');
      addLog('   • Redirects to: https://alldogsrockshop.com/pages/welcome');
    }

    return res.status(200).json({
      success: successfulCreations.length > 0,
      message: `Cleanup complete! Deleted ${successfulDeletions.length} old pages, created ${successfulCreations.length} fresh pages${homePageSet ? ', home page set' : ''}`,
      deleted: deletionResults,
      created: creationResults,
      urls: successfulCreations.map(r => r.url),
      homePageSet: homePageSet,
      homePageError: homePageError,
      homePageUrl: homePageSet ? 'https://alldogsrockshop.com' : null,
      log: log
    });

  } catch (error) {
    console.error('Fatal error:', error);
    addLog(`\n💥 FATAL ERROR: ${error.message}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to cleanup and setup pages',
      details: error.message,
      log: log
    });
  }
}
