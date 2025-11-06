// Shopify OAuth Callback - Exchange code for access token
// Route: /api/shopify/callback
// Shopify redirects here after user authorizes the app

import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    const { code, hmac, shop, state, timestamp } = req.query;

    if (!code || !shop) {
      return res.status(400).json({ error: 'Missing code or shop parameter' });
    }

    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_SECRET_KEY;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Shopify credentials not configured' });
    }

    // Verify HMAC to ensure request is from Shopify
    const queryWithoutHmac = { code, shop, state, timestamp };
    const message = Object.keys(queryWithoutHmac)
      .sort()
      .map(key => `${key}=${queryWithoutHmac[key]}`)
      .join('&');

    const expectedHmac = crypto
      .createHmac('sha256', apiSecret)
      .update(message)
      .digest('hex');

    if (hmac !== expectedHmac) {
      console.error('❌ HMAC verification failed');
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    console.log('✅ HMAC verified for shop:', shop);

    // Exchange code for access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('❌ Token exchange failed:', errorData);
      return res.status(tokenResponse.status).json({
        error: 'Token exchange failed',
        details: errorData,
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('✅ Access token obtained for shop:', shop);

    // TODO: Store token in database (Vercel KV, Postgres, etc.)
    // For now, we'll just log it (NOT PRODUCTION READY)
    console.log('🔑 Token:', accessToken.substring(0, 20) + '...');

    // In production, you'd:
    // 1. Store token in database keyed by shop domain
    // 2. Set up webhook subscriptions
    // 3. Create any required resources

    // Redirect to success page or app installation page
    const redirectUrl = `https://${shop}/admin/apps/${apiKey}`;

    return res.send(`
      <html>
        <head>
          <title>App Installed!</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            .success { color: green; font-size: 24px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="success">✅ All Dogs Rock App Installed Successfully!</div>
          <p>Shop: ${shop}</p>
          <p>Redirecting to Shopify admin...</p>
          <script>
            setTimeout(() => {
              window.top.location.href = "${redirectUrl}";
            }, 2000);
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return res.status(500).json({
      error: 'OAuth callback failed',
      details: error.message,
    });
  }
}
