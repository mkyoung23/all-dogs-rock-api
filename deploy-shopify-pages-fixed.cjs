#!/usr/bin/env node

/**
 * ALL DOGS ROCK - Shopify Page Deployment Script
 *
 * This script deploys pages directly to your Shopify store using the Admin API.
 * Run with: node deploy-shopify-pages-fixed.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration - Reads from environment variables
const CONFIG = {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || 'alldogsrockshop.myshopify.com',
    accessToken: process.env.SHOPIFY_SECRET_KEY || process.env.SHOPIFY_ACCESS_TOKEN,
    apiVersion: '2024-10'
};

// Check for required credentials
if (!CONFIG.accessToken) {
    console.error('\n❌ Error: Missing Shopify access token!');
    console.error('\nPlease set one of these environment variables:');
    console.error('  SHOPIFY_SECRET_KEY  (Admin API access token)');
    console.error('  SHOPIFY_ACCESS_TOKEN  (Admin API access token)');
    console.error('\nExample:');
    console.error('  SHOPIFY_SECRET_KEY=your_token_here node deploy-shopify-pages-fixed.cjs');
    console.error('\nOr create a .env.local file with your credentials.\n');
    process.exit(1);
}

// Pages to deploy
const PAGES = [
    {
        title: 'Welcome to All Dogs Rock',
        handle: 'welcome',
        file: 'WELCOME_PAGE.liquid'
    },
    {
        title: 'Create Your Iconic Dog',
        handle: 'create-iconic-dog',
        file: 'MAIN_PAGE_WITH_PRODUCTS.liquid'
    }
];

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function makeShopifyRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: CONFIG.storeDomain,
            port: 443,
            path: `/admin/api/${CONFIG.apiVersion}/${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': CONFIG.accessToken
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve({ success: true, statusCode: res.statusCode });
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function getExistingPages() {
    try {
        log('📋 Fetching existing pages...', 'cyan');
        const response = await makeShopifyRequest('GET', 'pages.json');
        return response.pages || [];
    } catch (error) {
        log(`⚠️  Could not fetch existing pages: ${error.message}`, 'yellow');
        return [];
    }
}

async function createOrUpdatePage(title, handle, bodyHtml, existingPages) {
    const existing = existingPages.find(p => p.handle === handle);

    const pageData = {
        page: {
            title: title,
            handle: handle,
            body_html: bodyHtml
        }
    };

    try {
        if (existing) {
            log(`📝 Updating "${title}"...`, 'blue');
            await makeShopifyRequest('PUT', `pages/${existing.id}.json`, pageData);
            log(`✅ Updated: https://alldogsrockshop.com/pages/${handle}`, 'green');
        } else {
            log(`📝 Creating "${title}"...`, 'blue');
            await makeShopifyRequest('POST', 'pages.json', pageData);
            log(`✅ Created: https://alldogsrockshop.com/pages/${handle}`, 'green');
        }
        return true;
    } catch (error) {
        log(`❌ Error with "${title}": ${error.message}`, 'red');
        return false;
    }
}

async function deployPages() {
    log('\n🚀 ALL DOGS ROCK - Shopify Page Deployment\n', 'bright');
    log(`Store: ${CONFIG.storeDomain}`, 'cyan');
    log(`Deploying ${PAGES.length} pages...\n`, 'cyan');

    // Get existing pages
    const existingPages = await getExistingPages();
    log(`Found ${existingPages.length} existing pages\n`, 'green');

    let successCount = 0;
    let failCount = 0;

    // Deploy each page
    for (const pageConfig of PAGES) {
        try {
            // Read file content
            const filePath = path.join(__dirname, pageConfig.file);
            if (!fs.existsSync(filePath)) {
                log(`❌ File not found: ${pageConfig.file}`, 'red');
                failCount++;
                continue;
            }

            const bodyHtml = fs.readFileSync(filePath, 'utf-8');

            // Create or update page
            const success = await createOrUpdatePage(
                pageConfig.title,
                pageConfig.handle,
                bodyHtml,
                existingPages
            );

            if (success) {
                successCount++;
            } else {
                failCount++;
            }

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            log(`❌ Error processing ${pageConfig.file}: ${error.message}`, 'red');
            failCount++;
        }

        log(''); // Empty line for readability
    }

    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 Deployment Summary', 'bright');
    log('='.repeat(60), 'cyan');
    log(`✅ Successful: ${successCount}`, 'green');
    if (failCount > 0) {
        log(`❌ Failed: ${failCount}`, 'red');
    }
    log('\n🌐 Your pages should now be live at:', 'bright');
    PAGES.forEach(page => {
        log(`   https://alldogsrockshop.com/pages/${page.handle}`, 'cyan');
    });

    log('\n📝 Next Steps:', 'yellow');
    log('   1. Visit the URLs above to verify pages are working', 'yellow');
    log('   2. Set your homepage redirect (see FIX-HOMEPAGE-MANUAL.md)', 'yellow');
    log('   3. Test the full user flow\n', 'yellow');

    if (failCount > 0) {
        log('⚠️  Some pages failed to deploy. Check the errors above.\n', 'red');
        process.exit(1);
    }
}

// Run deployment
deployPages().catch(error => {
    log(`\n❌ Deployment failed: ${error.message}\n`, 'red');
    process.exit(1);
});
