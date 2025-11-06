// App Proxy Health Check
// Route: /api/proxy/health
// Verifies App Proxy is working correctly

import { requireShopifyProxy } from '../../lib/shopify-auth.js';

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    success: true,
    message: 'App Proxy is working!',
    shop: req.shop,
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
  });
}

// Export with HMAC verification
export default requireShopifyProxy(handler);
