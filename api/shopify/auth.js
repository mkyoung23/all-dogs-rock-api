// Shopify OAuth - Initiate authentication flow
// Route: /api/shopify/auth
// Redirects to Shopify to authorize the app

export default async function handler(req, res) {
  try {
    const { shop } = req.query;

    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }

    const apiKey = process.env.SHOPIFY_API_KEY;
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,write_pages,read_pages';
    const redirectUri = `${process.env.APP_URL || 'https://all-dogs-rock-api-v2.vercel.app'}/api/shopify/callback`;

    if (!apiKey) {
      return res.status(500).json({ error: 'SHOPIFY_API_KEY not configured' });
    }

    // Build Shopify OAuth URL
    const shopifyAuthUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${apiKey}&` +
      `scope=${scopes}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`;

    console.log('🔐 Initiating OAuth for shop:', shop);

    // Redirect to Shopify
    return res.redirect(302, shopifyAuthUrl);

  } catch (error) {
    console.error('❌ OAuth initiation error:', error);
    return res.status(500).json({
      error: 'OAuth initiation failed',
      details: error.message,
    });
  }
}
