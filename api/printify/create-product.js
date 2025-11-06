// Printify Product Creation API
// Creates products in Printify with custom AI-generated dog images
// Uses PRINTIFY_SECRET_KEY from Vercel environment variables

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
    const { imageUrl, title, description, productType = 'poster', poseName } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    if (!process.env.PRINTIFY_SECRET_KEY) {
      return res.status(500).json({ error: 'Printify API key not configured' });
    }

    console.log('🖨️ Creating Printify product:', title);

    // Step 1: Upload image to Printify
    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PRINTIFY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        file_name: `${poseName || 'dog-art'}_${Date.now()}.jpg`,
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

    console.log('✅ Image uploaded to Printify:', printifyImageId);

    // Step 2: Get shop ID (or use from env if available)
    // For now, we'll use a placeholder - you need to get this from Printify dashboard
    const shopId = process.env.PRINTIFY_SHOP_ID || '15007872';

    // Step 3: Get blueprint ID for the product type
    // Poster (matte): blueprint_id = 3
    // Canvas: blueprint_id = 165
    // Mug: blueprint_id = 19
    // T-Shirt: blueprint_id = 6
    const blueprintMap = {
      poster: { blueprint_id: 3, print_provider_id: 1, variant_ids: [17388] }, // 12x18 poster
      canvas: { blueprint_id: 165, print_provider_id: 1, variant_ids: [45790] }, // 16x20 canvas
      mug: { blueprint_id: 19, print_provider_id: 1, variant_ids: [12181] }, // 11oz mug
      tshirt: { blueprint_id: 6, print_provider_id: 1, variant_ids: [17390] }, // Medium t-shirt
    };

    const productConfig = blueprintMap[productType] || blueprintMap.poster;

    // Step 4: Create product
    const createProductResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PRINTIFY_SECRET_KEY}`,
        },
        body: JSON.stringify({
          title: title || 'Custom Iconic Dog Art',
          description: description || 'Your dog in an iconic pose, AI-generated custom art.',
          blueprint_id: productConfig.blueprint_id,
          print_provider_id: productConfig.print_provider_id,
          variants: productConfig.variant_ids.map((variant_id) => ({
            id: variant_id,
            price: 1999, // $19.99 in cents
            is_enabled: true,
          })),
          print_areas: [
            {
              variant_ids: productConfig.variant_ids,
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
      console.error('❌ Printify product creation error:', errorData);
      return res.status(createProductResponse.status).json({
        error: 'Failed to create product in Printify',
        details: errorData,
      });
    }

    const productData = await createProductResponse.json();

    console.log('✅ Product created in Printify:', productData.id);

    // Step 5: Publish product to Shopify (if connected)
    // This requires Printify to be connected to your Shopify store
    try {
      const publishResponse = await fetch(
        `https://api.printify.com/v1/shops/${shopId}/products/${productData.id}/publish.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PRINTIFY_SECRET_KEY}`,
          },
          body: JSON.stringify({
            title: true,
            description: true,
            images: true,
            variants: true,
            tags: ['custom-dog-art', 'ai-generated'],
          }),
        }
      );

      if (publishResponse.ok) {
        console.log('✅ Product published to Shopify via Printify');
      }
    } catch (publishError) {
      console.warn('⚠️ Could not publish to Shopify (may not be connected):', publishError.message);
    }

    return res.status(200).json({
      success: true,
      printifyProductId: productData.id,
      printifyImageId: printifyImageId,
      message: 'Product created successfully in Printify',
      productData: productData,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to create Printify product',
      details: error.message,
    });
  }
}
