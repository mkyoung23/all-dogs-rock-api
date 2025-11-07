// Admin endpoint to deploy homepage to Shopify
// This uses the Shopify Admin API to create the homepage and set it as the main page

import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get credentials from environment or request body
    const accessToken = req.body.accessToken || process.env.SHOPIFY_APP_ADMIN_API_KEY || process.env.SHOPIFY_ACCESS_TOKEN;
    const shop = req.body.shop || process.env.SHOPIFY_STORE_DOMAIN || '8k5mna-5e.myshopify.com';

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access token required',
        message: 'Please provide accessToken in request body or set SHOPIFY_ACCESS_TOKEN env var'
      });
    }

    console.log('🏠 Deploying homepage to shop:', shop);

    // Read the homepage Liquid template
    const homepageTemplate = readFileSync(
      join(process.cwd(), 'shopify-homepage.liquid'),
      'utf-8'
    );

    // Create page using Shopify Admin GraphQL API
    const createPageMutation = `
      mutation createPage($input: PageCreateInput!) {
        pageCreate(page: $input) {
          page {
            id
            title
            handle
            body
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const pageInput = {
      title: 'Welcome to All Dogs Rock',
      handle: 'home',
      body: homepageTemplate,
      published: true,
    };

    // Call Shopify GraphQL API
    const shopifyUrl = `https://${shop}/admin/api/2024-01/graphql.json`;

    const pageResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: createPageMutation,
        variables: { input: pageInput }
      }),
    });

    const pageData = await pageResponse.json();

    if (pageData.errors) {
      console.error('❌ GraphQL errors:', pageData.errors);
      return res.status(400).json({
        error: 'Failed to create page',
        details: pageData.errors
      });
    }

    if (pageData.data?.pageCreate?.userErrors?.length > 0) {
      console.error('❌ User errors:', pageData.data.pageCreate.userErrors);
      return res.status(400).json({
        error: 'Failed to create page',
        details: pageData.data.pageCreate.userErrors
      });
    }

    const createdPage = pageData.data.pageCreate.page;
    console.log('✅ Homepage page created:', createdPage.handle);

    return res.status(200).json({
      success: true,
      message: 'Homepage deployed successfully!',
      page: createdPage,
      pageUrl: `https://www.alldogsrockshop.com/pages/${createdPage.handle}`,
      nextSteps: [
        'Go to: Online Store → Themes → Customize',
        'Click: Homepage section',
        'Add section → Custom Liquid or Page',
        'Select the "Welcome to All Dogs Rock" page',
        'Save!'
      ]
    });

  } catch (error) {
    console.error('❌ Deployment error:', error);
    return res.status(500).json({
      error: 'Deployment failed',
      details: error.message
    });
  }
}
