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
    console.log('🔑 Token:', accessToken.substring(0, 20) + '...');

    // Store token temporarily - in production use a database
    // For now, we'll display it to the user to add to Vercel
    const tokenDisplay = accessToken;

    // Redirect to success page or app installation page
    const redirectUrl = `https://${shop}/admin/apps/${apiKey}`;

    return res.send(`
      <html>
        <head>
          <title>App Installed!</title>
          <style>
            body { font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .success { color: green; font-size: 24px; margin-bottom: 20px; }
            .token-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .token { font-family: monospace; word-break: break-all; font-size: 12px; }
            .instructions { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
            button { background: #008060; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
            button:hover { background: #006d52; }
            .copy-btn { background: #5c6ac4; }
          </style>
        </head>
        <body>
          <div class="success">✅ All Dogs Rock App Installed Successfully!</div>
          <p><strong>Shop:</strong> ${shop}</p>

          <div class="instructions">
            <h3>📝 Next Steps:</h3>
            <ol>
              <li>Copy your access token below</li>
              <li>Add it to Vercel as environment variable: <code>SHOPIFY_ACCESS_TOKEN</code></li>
              <li>Click "Deploy Gallery Page" button or visit: <code>/api/admin/deploy-gallery</code></li>
            </ol>
          </div>

          <div class="token-box">
            <strong>Access Token:</strong><br>
            <div class="token" id="token">${tokenDisplay}</div>
            <button class="copy-btn" onclick="copyToken()">📋 Copy Token</button>
          </div>

          <button onclick="window.open('${redirectUrl}', '_blank')">Open Shopify Admin</button>
          <button onclick="deployGallery()">🚀 Deploy Gallery Page</button>

          <div id="status" style="margin-top: 20px;"></div>

          <script>
            function copyToken() {
              const token = document.getElementById('token').textContent;
              navigator.clipboard.writeText(token);
              alert('Token copied to clipboard!');
            }

            async function deployGallery() {
              const statusDiv = document.getElementById('status');
              statusDiv.innerHTML = '<p>🔄 Deploying gallery page...</p>';

              try {
                const response = await fetch('/api/admin/deploy-gallery', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    accessToken: '${tokenDisplay}',
                    shop: '${shop}'
                  })
                });

                const data = await response.json();

                if (data.success) {
                  statusDiv.innerHTML = \`
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; color: #155724;">
                      <h3>✅ \${data.message}</h3>
                      <p><strong>Page URL:</strong> <a href="\${data.pageUrl}" target="_blank">\${data.pageUrl}</a></p>
                    </div>
                  \`;
                } else {
                  statusDiv.innerHTML = \`
                    <div style="background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24;">
                      <h3>❌ Deployment Error</h3>
                      <pre>\${JSON.stringify(data, null, 2)}</pre>
                    </div>
                  \`;
                }
              } catch (error) {
                statusDiv.innerHTML = \`
                  <div style="background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24;">
                    <h3>❌ Error</h3>
                    <p>\${error.message}</p>
                  </div>
                \`;
              }
            }
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
