// Emergency deployment endpoint - tries to deploy homepage with debug info
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  try {
    // Show what env vars we have (check ALL env vars that might be Shopify-related)
    const allEnvs = Object.keys(process.env).filter(k =>
      k.toUpperCase().includes('SHOPIFY') ||
      k.toUpperCase().includes('ALLDOGSROCK') ||
      (k.toUpperCase().includes('ADMIN') && k.toUpperCase().includes('KEY'))
    );

    // Try all possible token names - INCLUDING the custom AllDogsRock one!
    const accessToken = process.env.AllDogsRock_Gallery_Admin_App_Key ||
                       process.env.SHOPIFY_APP_ADMIN_API_KEY ||
                       process.env.SHOPIFY_ADMIN_API_KEY ||
                       process.env.SHOPIFY_ACCESS_TOKEN ||
                       process.env.SHOPIFY_TOKEN ||
                       process.env.SHOPIFY_ADMIN_TOKEN;

    const shop = '8k5mna-5e.myshopify.com';

    if (!accessToken) {
      return res.json({
        error: 'No token found',
        availableEnvs: allEnvs,
        message: 'Set one of: AllDogsRock_Gallery_Admin_App_Key, SHOPIFY_ACCESS_TOKEN, etc.'
      });
    }

    const tokenSource = process.env.AllDogsRock_Gallery_Admin_App_Key ? 'AllDogsRock_Gallery_Admin_App_Key' :
                       process.env.SHOPIFY_APP_ADMIN_API_KEY ? 'SHOPIFY_APP_ADMIN_API_KEY' :
                       process.env.SHOPIFY_ADMIN_API_KEY ? 'SHOPIFY_ADMIN_API_KEY' :
                       process.env.SHOPIFY_ACCESS_TOKEN ? 'SHOPIFY_ACCESS_TOKEN' :
                       process.env.SHOPIFY_TOKEN ? 'SHOPIFY_TOKEN' :
                       process.env.SHOPIFY_ADMIN_TOKEN ? 'SHOPIFY_ADMIN_TOKEN' : 'unknown';

    // Read homepage
    const homepageHtml = readFileSync(join(process.cwd(), 'shopify-homepage.liquid'), 'utf-8');

    // Try GraphQL API
    const mutation = `
      mutation createPage($input: PageCreateInput!) {
        pageCreate(page: $input) {
          page { id title handle }
          userErrors { field message }
        }
      }
    `;

    const response = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            title: 'Welcome to All Dogs Rock',
            handle: 'home',
            body: homepageHtml,
            published: true
          }
        }
      }),
    });

    const data = await response.json();

    return res.json({
      status: response.status,
      tokenUsed: tokenSource,
      tokenPrefix: accessToken.substring(0, 10) + '...',
      availableEnvs: allEnvs,
      responseData: data,
      success: data.data?.pageCreate?.page ? true : false,
      pageUrl: data.data?.pageCreate?.page ? `https://www.alldogsrockshop.com/pages/home` : null
    });

  } catch (error) {
    return res.json({
      error: error.message,
      stack: error.stack
    });
  }
}
