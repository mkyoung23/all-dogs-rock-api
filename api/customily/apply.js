// api/customily/apply.js
// Applies generated AI images to Customily product templates

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
    const { imageUrl, templateId, layerId, productId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    if (!templateId || !layerId) {
      return res.status(400).json({ error: 'Template ID and Layer ID are required' });
    }

    if (!process.env.CUSTOMILY_API_KEY) {
      return res.status(500).json({ error: 'Customily API key not configured' });
    }

    // Call Customily API to apply image to template
    const customilyResponse = await fetch('https://api.customily.com/v1/apply-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOMILY_API_KEY}`
      },
      body: JSON.stringify({
        template_id: templateId,
        layer_id: layerId,
        image_url: imageUrl,
        product_id: productId
      })
    });

    if (!customilyResponse.ok) {
      const errorData = await customilyResponse.json();
      console.error('Customily API error:', errorData);
      return res.status(customilyResponse.status).json({ 
        error: 'Failed to apply image to template', 
        details: errorData 
      });
    }

    const data = await customilyResponse.json();

    // Return success response with preview URL
    return res.status(200).json({
      success: true,
      previewUrl: data.preview_url || data.previewUrl,
      templateId: templateId,
      message: 'Image applied successfully'
    });

  } catch (error) {
    console.error('Error applying image to Customily template:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
