// Vercel API endpoint to create Shopify pages
// This endpoint uses the ALLDOGSROCK_GALLERY_ADMIN_APP_KEY already in Vercel
// Call it: POST /api/setup-shopify-pages

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

  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'alldogsrockshop.myshopify.com';
  const ACCESS_TOKEN = process.env.SHOPIFY_SECRET_KEY
    || process.env.SHOPIFY_ACCESS_TOKEN
    || process.env.ALLDOGSROCK_GALLERY_ADMIN_APP_KEY;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({
      error: 'Missing Shopify access token',
      checked: ['SHOPIFY_SECRET_KEY', 'SHOPIFY_ACCESS_TOKEN', 'ALLDOGSROCK_GALLERY_ADMIN_APP_KEY'],
      available: Object.keys(process.env).filter(k => k.includes('SHOPIFY'))
    });
  }

  try {
    // Define pages to create
    const pages = [
      {
        title: 'Welcome to All Dogs Rock',
        handle: 'welcome',
        body_html: readFileSync(join(process.cwd(), 'WELCOME_PAGE.liquid'), 'utf-8')
      },
      {
        title: 'Create Your Iconic Dog',
        handle: 'create-iconic-dog',
        body_html: readFileSync(join(process.cwd(), 'MAIN_PAGE_WITH_PRODUCTS.liquid'), 'utf-8')
      }
    ];

    const results = [];

    // Get existing pages first
    const listResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-10/pages.json`, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN
      }
    });

    let existingPages = [];
    if (listResponse.ok) {
      const data = await listResponse.json();
      existingPages = data.pages || [];
    }

    // Create or update each page
    for (const page of pages) {
      try {
        // Check if page exists
        const existing = existingPages.find(p => p.handle === page.handle);

        if (existing) {
          // Update existing page
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
            results.push({
              success: true,
              action: 'updated',
              title: page.title,
              url: `https://alldogsrockshop.com/pages/${data.page.handle}`
            });
          } else {
            const errorText = await updateResponse.text();
            results.push({
              success: false,
              action: 'update',
              title: page.title,
              error: `${updateResponse.status}: ${errorText}`
            });
          }
        } else {
          // Create new page
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
            results.push({
              success: true,
              action: 'created',
              title: page.title,
              url: `https://alldogsrockshop.com/pages/${data.page.handle}`
            });
          } else {
            const errorText = await createResponse.text();
            results.push({
              success: false,
              action: 'create',
              title: page.title,
              error: `${createResponse.status}: ${errorText}`
            });
          }
        }
      } catch (error) {
        results.push({
          success: false,
          action: 'error',
          title: page.title,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success);

    return res.status(200).json({
      success: successful.length > 0,
      message: `Created/updated ${successful.length} of ${results.length} pages`,
      results,
      urls: successful.map(r => r.url)
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({
      error: 'Failed to set up pages',
      details: error.message
    });
  }
}
