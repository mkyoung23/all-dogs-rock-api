// HMAC Verification Middleware for Shopify App Proxy
// Verifies all requests coming from Shopify App Proxy are legitimate

import crypto from 'crypto';

/**
 * Verify Shopify App Proxy signature (HMAC)
 * Shopify signs all App Proxy requests - we must verify them
 */
export function verifyShopifyProxy(query, secret) {
  const { signature, hmac, ...rest } = query;

  if (!signature && !hmac) {
    console.error('❌ No signature or hmac in request');
    return false;
  }

  // Build the message from sorted query params (excluding signature/hmac)
  const message = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key]}`)
    .join('');

  // Calculate expected HMAC
  const expectedHmac = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  const receivedHmac = signature || hmac;

  const isValid = receivedHmac === expectedHmac;

  if (!isValid) {
    console.error('❌ HMAC verification failed');
    console.error('Expected:', expectedHmac);
    console.error('Received:', receivedHmac);
  }

  return isValid;
}

/**
 * Verify Shopify webhook signature
 */
export function verifyWebhook(body, hmacHeader, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
}

/**
 * Middleware to verify all App Proxy requests
 */
export function requireShopifyProxy(handler) {
  return async (req, res) => {
    // Skip verification for OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return handler(req, res);
    }

    const secret = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_SECRET_KEY || process.env.SHOPIFY_API_SECRET_KEY;

    if (!secret) {
      console.error('❌ SHOPIFY_API_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify HMAC from query parameters
    if (!verifyShopifyProxy(req.query, secret)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid Shopify signature'
      });
    }

    // Extract shop domain from query
    req.shop = req.query.shop;

    return handler(req, res);
  };
}
