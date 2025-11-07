// Debug endpoint to see what environment variables are available
export default async function handler(req, res) {
  const envVars = {
    // Shopify related
    SHOPIFY_ACCESS_TOKEN: !!process.env.SHOPIFY_ACCESS_TOKEN,
    SHOPIFY_APP_ADMIN_API_KEY: !!process.env.SHOPIFY_APP_ADMIN_API_KEY,
    SHOPIFY_ADMIN_API_KEY: !!process.env.SHOPIFY_ADMIN_API_KEY,
    SHOPIFY_API_KEY: !!process.env.SHOPIFY_API_KEY,
    SHOPIFY_TOKEN: !!process.env.SHOPIFY_TOKEN,
    SHOPIFY_ADMIN_TOKEN: !!process.env.SHOPIFY_ADMIN_TOKEN,
    SHOPIFY_STORE_DOMAIN: !!process.env.SHOPIFY_STORE_DOMAIN,

    // Get first 10 chars of tokens that exist
    tokens: {}
  };

  // Check all variations
  const possibleTokenKeys = [
    'SHOPIFY_ACCESS_TOKEN',
    'SHOPIFY_APP_ADMIN_API_KEY',
    'SHOPIFY_ADMIN_API_KEY',
    'SHOPIFY_TOKEN',
    'SHOPIFY_ADMIN_TOKEN'
  ];

  possibleTokenKeys.forEach(key => {
    if (process.env[key]) {
      envVars.tokens[key] = process.env[key].substring(0, 15) + '...';
    }
  });

  // List all env vars that contain 'SHOPIFY' (just names, not values)
  const allShopifyEnvs = Object.keys(process.env).filter(k => k.includes('SHOPIFY') || k.includes('shopify'));

  return res.json({
    available: envVars,
    allShopifyEnvKeys: allShopifyEnvs,
    recommendation: allShopifyEnvs.length > 0 ? `Use: ${allShopifyEnvs[0]}` : 'No Shopify env vars found'
  });
}
