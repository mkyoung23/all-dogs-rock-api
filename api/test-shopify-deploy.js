// Test endpoint to deploy homepage and debug credentials
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  try {
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || process.env.SHOPIFY_APP_ADMIN_API_KEY;
    const shop = '8k5mna-5e.myshopify.com';

    // Debug info
    const debugInfo = {
      hasShopifyAccessToken: !!process.env.SHOPIFY_ACCESS_TOKEN,
      hasShopifyAppAdminApiKey: !!process.env.SHOPIFY_APP_ADMIN_API_KEY,
      shopifyAccessTokenLength: process.env.SHOPIFY_ACCESS_TOKEN?.length || 0,
      shopifyAppAdminApiKeyLength: process.env.SHOPIFY_APP_ADMIN_API_KEY?.length || 0,
      accessTokenPrefix: accessToken?.substring(0, 10) || 'none',
      shop: shop
    };

    if (!accessToken) {
      return res.status(400).json({
        error: 'No access token found',
        debug: debugInfo
      });
    }

    // Read homepage template
    const homepageTemplate = readFileSync(
      join(process.cwd(), 'shopify-homepage.liquid'),
      'utf-8'
    );

    // Try REST API first (simpler)
    const restUrl = `https://${shop}/admin/api/2024-01/pages.json`;

    const restResponse = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        page: {
          title: 'Welcome to All Dogs Rock - Test',
          body_html: homepageTemplate,
          published: true
        }
      }),
    });

    const restData = await restResponse.json();

    if (restResponse.ok) {
      return res.status(200).json({
        success: true,
        message: 'Homepage deployed via REST API!',
        page: restData.page,
        pageUrl: `https://www.alldogsrockshop.com/pages/${restData.page.handle}`,
        debug: debugInfo
      });
    }

    // If REST fails, try GraphQL
    const graphqlUrl = `https://${shop}/admin/api/2024-01/graphql.json`;

    const createPageMutation = `
      mutation createPage($input: PageCreateInput!) {
        pageCreate(page: $input) {
          page {
            id
            title
            handle
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const graphqlResponse = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: createPageMutation,
        variables: {
          input: {
            title: 'Welcome to All Dogs Rock',
            handle: 'home',
            body: homepageTemplate,
            published: true
          }
        }
      }),
    });

    const graphqlData = await graphqlResponse.json();

    return res.status(200).json({
      restAttempt: {
        status: restResponse.status,
        statusText: restResponse.statusText,
        data: restData
      },
      graphqlAttempt: {
        status: graphqlResponse.status,
        statusText: graphqlResponse.statusText,
        data: graphqlData
      },
      debug: debugInfo
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Deployment failed',
      message: error.message,
      stack: error.stack
    });
  }
}
