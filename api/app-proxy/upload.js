// Image Upload Handler - Customer uploads their dog photo
// Route: /api/proxy/upload
// Accepts multipart/form-data with dog photo

import { requireShopifyProxy } from '../../lib/shopify-auth.js';

async function handler(req, res) {
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
    // Check if we have an image URL or base64 data
    const { imageUrl, imageData, imageBase64 } = req.body;

    if (!imageUrl && !imageData && !imageBase64) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please provide imageUrl, imageData, or imageBase64'
      });
    }

    let finalImageUrl;

    // If image URL is provided, use it directly
    if (imageUrl) {
      finalImageUrl = imageUrl;
    }
    // If base64 is provided, we need to upload it somewhere
    else if (imageBase64 || imageData) {
      // For now, we'll use Replicate's image input which accepts base64 or URLs
      // In production, you might want to upload to Cloudinary/S3 first
      finalImageUrl = imageBase64 || imageData;
    }

    console.log('📷 Dog photo received from shop:', req.shop);

    return res.status(200).json({
      success: true,
      imageUrl: finalImageUrl,
      message: 'Image uploaded successfully',
      shop: req.shop,
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
}

export default requireShopifyProxy(handler);
