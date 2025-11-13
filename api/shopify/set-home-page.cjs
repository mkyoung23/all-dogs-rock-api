#!/usr/bin/env node
/**
 * Set Home Page in Shopify Theme
 * Updates the theme settings to use a specific page as the home page
 */

const https = require('https');

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_SECRET_KEY;
const API_VERSION = '2024-10';

function makeShopifyRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOPIFY_STORE_DOMAIN,
      port: 443,
      path: `/admin/api/${API_VERSION}${path}`,
      method: method,
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function getActiveTheme() {
  console.log('🎨 Fetching active theme...');
  const data = await makeShopifyRequest('GET', '/themes.json');
  const activeTheme = data.themes.find(theme => theme.role === 'main');

  if (!activeTheme) {
    throw new Error('No active theme found');
  }

  console.log(`✅ Found active theme: ${activeTheme.name} (ID: ${activeTheme.id})`);
  return activeTheme;
}

async function getPages() {
  console.log('\n📄 Fetching pages...');
  const data = await makeShopifyRequest('GET', '/pages.json');
  console.log(`✅ Found ${data.pages.length} pages:`);
  data.pages.forEach(page => {
    console.log(`   - "${page.title}" (handle: ${page.handle}, id: ${page.id})`);
  });
  return data.pages;
}

async function updateThemeSettings(themeId, pageHandle) {
  console.log(`\n🔧 Updating theme settings to use page: ${pageHandle}...`);

  // Get current theme settings
  const themeAssets = await makeShopifyRequest('GET', `/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`);
  const settings = JSON.parse(themeAssets.asset.value);

  console.log('Current settings:', JSON.stringify(settings, null, 2));

  // Update to use the page as home
  // Note: Different themes have different ways to set the home page
  // This is a common approach for Dawn theme and similar
  if (!settings.current) {
    settings.current = {};
  }

  // Try setting the home_page_template
  settings.current.home_page_template = pageHandle;

  // Upload updated settings
  await makeShopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
    asset: {
      key: 'config/settings_data.json',
      value: JSON.stringify(settings, null, 2)
    }
  });

  console.log('✅ Theme settings updated!');
}

async function main() {
  console.log('\n🏠 Shopify Home Page Setup Tool\n');
  console.log('=' .repeat(80));

  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
    console.error('❌ Missing required environment variables:');
    console.error('   SHOPIFY_STORE_DOMAIN');
    console.error('   SHOPIFY_SECRET_KEY');
    process.exit(1);
  }

  try {
    // Get the active theme
    const theme = await getActiveTheme();

    // Get all pages
    const pages = await getPages();

    // Find the welcome page
    const welcomePage = pages.find(p => p.handle === 'welcome');

    if (!welcomePage) {
      console.error('\n❌ Could not find "welcome" page. Please create it first.');
      process.exit(1);
    }

    console.log(`\n✨ Setting "${welcomePage.title}" as home page...`);

    // Note: Setting a page as the home page in Shopify is done through theme settings
    // This is theme-specific and may require different approaches

    console.log('\n📝 IMPORTANT NOTES:');
    console.log('   To set a page as your home page in Shopify:');
    console.log('   1. Go to: Online Store > Themes > Customize');
    console.log('   2. Click "Homepage" in the theme editor');
    console.log('   3. Change the template to use your custom page');
    console.log('   OR');
    console.log('   1. Go to: Online Store > Pages');
    console.log(`   2. Select "${welcomePage.title}"`);
    console.log('   3. Make it visible and promoted');
    console.log('\n   Your page URL: https://alldogsrockshop.com/pages/welcome');

    console.log('\n' + '='.repeat(80));
    console.log('✅ DONE!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getActiveTheme, getPages, updateThemeSettings };
