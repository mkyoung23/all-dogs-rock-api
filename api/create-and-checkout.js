// Create Printify Product and Initiate Checkout
// This endpoint creates a custom product with the dog image and redirects to checkout

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, productTier, poseName, dogName } = req.body;

    if (!imageUrl || !productTier) {
      return res.status(400).json({ error: 'imageUrl and productTier are required' });
    }

    console.log(`🛒 Creating ${productTier} product for ${dogName || 'dog'}`);

    // Product configurations with great margins
    const productConfigs = {
      poster: {
        blueprint_id: 3,
        print_provider_id: 1,
        variant_ids: [17388], // 12x18 poster
        price: 2999, // $29.99 (cost ~$7, profit ~$23)
        title: `Iconic ${dogName || 'Dog'} Poster - ${poseName || 'Custom Art'}`,
        description: `Your beloved ${dogName || 'dog'} immortalized in an iconic pose! Premium 12x18" matte poster, museum-quality print.`,
      },
      tshirt: {
        blueprint_id: 6,
        print_provider_id: 1,
        variant_ids: [17390, 17391, 17392, 17393, 17394], // S, M, L, XL, 2XL
        price: 4499, // $44.99 (cost ~$13, profit ~$32)
        title: `Iconic ${dogName || 'Dog'} T-Shirt - ${poseName || 'Custom Design'}`,
        description: `Wear your ${dogName || 'dog'} with pride! Premium unisex t-shirt featuring your dog in an iconic pose. Soft, comfortable, conversation starter.`,
      },
      canvas: {
        blueprint_id: 165,
        print_provider_id: 1,
        variant_ids: [45790], // 16x20 canvas
        price: 7999, // $79.99 (cost ~$25, profit ~$55)
        title: `Iconic ${dogName || 'Dog'} Canvas - ${poseName || 'Premium Art'}`,
        description: `Museum-quality 16x20" canvas featuring your ${dogName || 'dog'} in an iconic pose. Gallery-wrapped, ready to hang. A true statement piece.`,
      },
    };

    const config = productConfigs[productTier];
    if (!config) {
      return res.status(400).json({ error: 'Invalid product tier. Use: poster, tshirt, or canvas' });
    }

    const printifyApiKey = process.env.PRINTIFY_API_KEY || process.env.PRINTIFY_SECRET_KEY || process.env.PRINTIFY_TOKEN;
    if (!printifyApiKey) {
      return res.status(500).json({ error: 'Printify API key not configured' });
    }

    const shopId = process.env.PRINTIFY_SHOP_ID || '24946062';

    // Step 1: Upload image to Printify
    console.log('📤 Uploading image to Printify...');
    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${printifyApiKey}`,
      },
      body: JSON.stringify({
        file_name: `${poseName || 'iconic-dog'}_${Date.now()}.jpg`,
        url: imageUrl,
      }),
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('❌ Printify upload error:', errorData);
      return res.status(uploadResponse.status).json({
        error: 'Failed to upload image to Printify',
        details: errorData,
      });
    }

    const uploadData = await uploadResponse.json();
    const printifyImageId = uploadData.id;
    console.log('✅ Image uploaded:', printifyImageId);

    // Step 2: Create product in Printify
    console.log('🎨 Creating product in Printify...');
    const createProductResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${printifyApiKey}`,
        },
        body: JSON.stringify({
          title: config.title,
          description: config.description,
          blueprint_id: config.blueprint_id,
          print_provider_id: config.print_provider_id,
          variants: config.variant_ids.map((variant_id) => ({
            id: variant_id,
            price: config.price,
            is_enabled: true,
          })),
          print_areas: [
            {
              variant_ids: config.variant_ids,
              placeholders: [
                {
                  position: 'front',
                  images: [
                    {
                      id: printifyImageId,
                      x: 0.5,
                      y: 0.5,
                      scale: 1,
                      angle: 0,
                    },
                  ],
                },
              ],
            },
          ],
        }),
      }
    );

    if (!createProductResponse.ok) {
      const errorData = await createProductResponse.json();
      console.error('❌ Product creation error:', errorData);
      return res.status(createProductResponse.status).json({
        error: 'Failed to create product in Printify',
        details: errorData,
      });
    }

    const productData = await createProductResponse.json();
    console.log('✅ Product created:', productData.id);

    // Step 3: Publish to Shopify
    console.log('🚀 Publishing to Shopify...');
    const publishResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products/${productData.id}/publish.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${printifyApiKey}`,
        },
        body: JSON.stringify({
          title: true,
          description: true,
          images: true,
          variants: true,
          tags: ['iconic-dog', 'custom-ai-art', poseName?.toLowerCase()],
        }),
      }
    );

    if (!publishResponse.ok) {
      const publishErrorData = await publishResponse.json();
      console.error('⚠️ Publish error:', publishErrorData);
      // Continue anyway - we can still provide the Printify product
    } else {
      console.log('✅ Published to Shopify!');
    }

    const publishData = await publishResponse.json();

    // Step 4: Get Shopify product handle/ID from publish response
    // Printify returns external { id, handle } when publishing to Shopify
    let shopifyProductId = null;
    let shopifyHandle = null;

    if (publishData.external && publishData.external.id) {
      // Shopify ID format: "gid://shopify/Product/123456789"
      shopifyProductId = publishData.external.id;
      shopifyHandle = publishData.external.handle;
      console.log('✅ Shopify product:', shopifyHandle);

      // Wait a moment for Shopify to index the new product
      console.log('⏳ Waiting for Shopify to index product...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
    }

    // Step 5: Get Shopify variant ID and create checkout URL
    let checkoutUrl = null;

    if (shopifyProductId && shopifyHandle) {
      const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN;
      const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || '8k5mna-5e.myshopify.com';

      if (storefrontToken) {
        try {
          // First, get the product with its variants using Storefront API
          const productQuery = `
            query {
              product(handle: "${shopifyHandle}") {
                id
                variants(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          `;

          const productResponse = await fetch(`https://${shopifyDomain}/api/2024-10/graphql.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': storefrontToken,
            },
            body: JSON.stringify({ query: productQuery }),
          });

          if (productResponse.ok) {
            const productData = await productResponse.json();
            const variantId = productData.data?.product?.variants?.edges?.[0]?.node?.id;

            if (variantId) {
              console.log('✅ Found variant ID:', variantId);

              // Now create cart with this variant
              const cartCreateMutation = `
                mutation {
                  cartCreate(
                    input: {
                      lines: [
                        {
                          merchandiseId: "${variantId}"
                          quantity: 1
                        }
                      ]
                    }
                  ) {
                    cart {
                      id
                      checkoutUrl
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `;

              const cartResponse = await fetch(`https://${shopifyDomain}/api/2024-10/graphql.json`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Storefront-Access-Token': storefrontToken,
                },
                body: JSON.stringify({ query: cartCreateMutation }),
              });

              if (cartResponse.ok) {
                const cartData = await cartResponse.json();
                if (cartData.data?.cartCreate?.cart?.checkoutUrl) {
                  checkoutUrl = cartData.data.cartCreate.cart.checkoutUrl;
                  console.log('✅ Checkout URL created!');
                } else if (cartData.data?.cartCreate?.userErrors?.length > 0) {
                  console.error('⚠️ Cart errors:', cartData.data.cartCreate.userErrors);
                }
              }
            }
          }
        } catch (cartError) {
          console.error('⚠️ Cart creation error:', cartError.message);
        }
      }
    }

    // Fallback: use product page URL
    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || '8k5mna-5e.myshopify.com';
    const productUrl = shopifyHandle
      ? `https://${shopifyDomain.replace('.myshopify.com', '')}.myshopify.com/products/${shopifyHandle}`
      : null;

    return res.status(200).json({
      success: true,
      printifyProductId: productData.id,
      shopifyProductId: shopifyProductId,
      shopifyHandle: shopifyHandle,
      checkoutUrl: checkoutUrl,
      productUrl: productUrl,
      price: config.price / 100,
      message: 'Product created and ready for purchase!',
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to create product and checkout',
      details: error.message,
    });
  }
}
