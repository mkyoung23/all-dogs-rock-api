// Simple endpoint to check which Shopify env vars are available
export default async function handler(req, res) {
  const shopifyEnvs = {
    SHOPIFY_ACCESS_TOKEN: {
      exists: !!process.env.SHOPIFY_ACCESS_TOKEN,
      length: process.env.SHOPIFY_ACCESS_TOKEN?.length || 0,
      prefix: process.env.SHOPIFY_ACCESS_TOKEN?.substring(0, 8) || 'none'
    },
    SHOPIFY_APP_ADMIN_API_KEY: {
      exists: !!process.env.SHOPIFY_APP_ADMIN_API_KEY,
      length: process.env.SHOPIFY_APP_ADMIN_API_KEY?.length || 0,
      prefix: process.env.SHOPIFY_APP_ADMIN_API_KEY?.substring(0, 8) || 'none'
    },
    SHOPIFY_ADMIN_API_KEY: {
      exists: !!process.env.SHOPIFY_ADMIN_API_KEY,
      length: process.env.SHOPIFY_ADMIN_API_KEY?.length || 0,
      prefix: process.env.SHOPIFY_ADMIN_API_KEY?.substring(0, 8) || 'none'
    },
    SHOPIFY_TOKEN: {
      exists: !!process.env.SHOPIFY_TOKEN,
      length: process.env.SHOPIFY_TOKEN?.length || 0,
      prefix: process.env.SHOPIFY_TOKEN?.substring(0, 8) || 'none'
    },
    SHOPIFY_STOREFRONT_APP_API_KEY: {
      exists: !!process.env.SHOPIFY_STOREFRONT_APP_API_KEY,
      length: process.env.SHOPIFY_STOREFRONT_APP_API_KEY?.length || 0,
      prefix: process.env.SHOPIFY_STOREFRONT_APP_API_KEY?.substring(0, 8) || 'none'
    },
    SHOPIFY_STORE_DOMAIN: {
      exists: !!process.env.SHOPIFY_STORE_DOMAIN,
      value: process.env.SHOPIFY_STORE_DOMAIN || 'none'
    }
  };

  // List all env vars that contain SHOPIFY
  const allShopifyKeys = Object.keys(process.env).filter(k =>
    k.toUpperCase().includes('SHOPIFY')
  );

  return res.json({
    checkedVars: shopifyEnvs,
    allShopifyEnvKeys: allShopifyKeys,
    recommendation: allShopifyKeys.length > 0 ?
      `Found ${allShopifyKeys.length} Shopify env vars. Try using: ${allShopifyKeys[0]}` :
      'No Shopify env vars found'
  });
}
