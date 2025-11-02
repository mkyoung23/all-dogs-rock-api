// api/composite.js
// Composites pet image onto template background using Cloudinary or Photopea API

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      petImageData,
      petImageUrl,
      templateImageData,
      templateImageUrl,
      position,
      size,
    } = req.body;

    // Validate inputs
    if ((!petImageData && !petImageUrl) || (!templateImageData && !templateImageUrl)) {
      return res.status(400).json({
        error: 'Both pet image and template image are required',
      });
    }

    console.log('Starting image compositing...');

    // For now, we'll use a simple approach: return both images and let the client handle compositing
    // In production, this should use a service like Cloudinary or imgix for server-side compositing

    // If Cloudinary is configured, use it for compositing
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      // Upload images to Cloudinary and use transformation API
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

      // Upload pet image
      const petFormData = new URLSearchParams();
      petFormData.append('file', petImageData || petImageUrl);
      petFormData.append('upload_preset', 'unsigned'); // You'll need to create an unsigned preset

      const petUpload = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: petFormData,
      });

      const petResult = await petUpload.json();

      // Use Cloudinary transformation to composite
      // This is a simplified version - you'd customize the transformation parameters
      const pos = position || { x: 0.5, y: 0.5 };
      const sizeConfig = size || { width: 0.5, height: 0.5 };

      const compositedUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/l_${petResult.public_id},w_${sizeConfig.width * 100}p,g_center/${templateImageUrl}`;

      return res.status(200).json({
        success: true,
        imageUrl: compositedUrl,
        message: 'Images composited successfully via Cloudinary',
      });
    }

    // Fallback: Return instructions for client-side compositing
    return res.status(200).json({
      success: true,
      clientComposite: true,
      petImage: petImageData || petImageUrl,
      templateImage: templateImageData || templateImageUrl,
      position: position || { x: 0.5, y: 0.5 },
      size: size || { width: 0.5, height: 0.5 },
      message: 'Use client-side canvas to composite images',
    });
  } catch (error) {
    console.error('Error compositing images:', error);
    return res.status(500).json({
      error: 'Failed to composite images',
      details: error.message,
    });
  }
}
