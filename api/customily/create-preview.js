// Customily Preview API Integration
// Creates product previews with custom AI-generated dog images
// Uses CUSTOMILY_SECRET_KEY from Vercel environment variables

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
    const { imageUrl, productId, variantId, personalizationData } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    if (!process.env.CUSTOMILY_SECRET_KEY) {
      return res.status(500).json({ error: 'Customily API key not configured' });
    }

    console.log('🎨 Creating Customily preview for:', productId);

    // Customily Preview API endpoint
    // Documentation: https://help.customily.com/article/116-preview-api

    const customilyResponse = await fetch('https://api.customily.com/v1/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOMILY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        product_id: productId || 'default-template',
        variant_id: variantId || 'default',
        personalization: {
          // Upload user's custom image
          custom_image: imageUrl,
          ...(personalizationData || {}),
        },
        // Options for preview generation
        options: {
          format: 'png',
          width: 1000,
          height: 1000,
          quality: 'high',
        },
      }),
    });

    if (!customilyResponse.ok) {
      const errorData = await customilyResponse.json();
      console.error('❌ Customily API error:', errorData);
      return res.status(customilyResponse.status).json({
        error: 'Failed to create Customily preview',
        details: errorData,
      });
    }

    const previewData = await customilyResponse.json();

    console.log('✅ Customily preview created:', previewData.preview_url);

    return res.status(200).json({
      success: true,
      previewUrl: previewData.preview_url,
      previewId: previewData.preview_id,
      productId: previewData.product_id,
      message: 'Preview created successfully',
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to create Customily preview',
      details: error.message,
    });
  }
}
