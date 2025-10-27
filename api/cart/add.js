// api/cart/add.js
// Adds customized products to Shopify cart

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { variantId, quantity = 1, properties = {}, cartId } = req.body;

    if (!variantId) {
      return res.status(400).json({ error: 'Variant ID is required' });
    }

    if (!process.env.SHOPIFY_STOREFRONT_TOKEN || !process.env.SHOPIFY_STORE_DOMAIN) {
      return res.status(500).json({ error: 'Shopify credentials not configured' });
    }

    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

    // GraphQL mutation to add item to cart
    const mutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      cartId: cartId,
      lines: [{
        quantity: quantity,
        merchandiseId: variantId,
        attributes: Object.entries(properties).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      }]
    };

    // Call Shopify Storefront API
    const shopifyResponse = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken
      },
      body: JSON.stringify({ query: mutation, variables })
    });

    if (!shopifyResponse.ok) {
      const errorData = await shopifyResponse.json();
      console.error('Shopify API error:', errorData);
      return res.status(shopifyResponse.status).json({ 
        error: 'Failed to add item to cart', 
        details: errorData 
      });
    }

    const data = await shopifyResponse.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return res.status(400).json({ 
        error: 'GraphQL errors', 
        details: data.errors 
      });
    }

    const cartData = data.data.cartLinesAdd;

    if (cartData.userErrors && cartData.userErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Failed to add to cart', 
        details: cartData.userErrors 
      });
    }

    // Return success response with cart data and checkout URL
    return res.status(200).json({
      success: true,
      cart: cartData.cart,
      checkoutUrl: cartData.cart.checkoutUrl,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
