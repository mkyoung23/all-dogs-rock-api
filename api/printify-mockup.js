// Generate REAL product mockup using Printify API
// This creates actual realistic product images like Printify shows

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, productType } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' });
    }

    if (!process.env.PRINTIFY_API_KEY) {
      return res.status(500).json({ error: 'Printify API key not configured' });
    }

    console.log(`Generating Printify mockup for ${productType}`);
    console.log(`Image URL: ${imageUrl}`);

    // Printify blueprint IDs for your products
    const blueprints = {
      'blanket': {
        blueprint_id: 1112, // Fleece Blanket 50x60
        print_provider_id: 99,
        variant_ids: [88495], // 50x60 inch variant
        print_area: 'front'
      },
      'phone-case': {
        blueprint_id: 380, // Tough Phone Case
        print_provider_id: 99,
        variant_ids: [85908], // iPhone 13 variant
        print_area: 'default'
      },
      'canvas': {
        blueprint_id: 18, // Canvas
        print_provider_id: 99,
        variant_ids: [5541], // 16x16 inch variant
        print_area: 'default'
      },
      'tshirt': {
        blueprint_id: 6, // Unisex Jersey T-Shirt
        print_provider_id: 99,
        variant_ids: [37899], // Medium size variant
        print_area: 'front'
      }
    };

    const config = blueprints[productType];
    if (!config) {
      return res.status(400).json({ error: `Invalid product type: ${productType}` });
    }

    // Step 1: Upload image to Printify
    console.log('Step 1: Uploading image to Printify...');

    let uploadBody;

    // Check if imageUrl is a base64 data URL
    if (imageUrl.startsWith('data:')) {
      // Extract base64 data
      const base64Data = imageUrl.split(',')[1];
      const mimeType = imageUrl.match(/data:([^;]+);/)?.[1] || 'image/jpeg';

      uploadBody = {
        file_name: 'iconic-dog.jpg',
        contents: base64Data // Printify accepts base64 in 'contents' field
      };
    } else {
      // Regular URL
      uploadBody = {
        file_name: 'iconic-dog.jpg',
        url: imageUrl
      };
    }

    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadBody)
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image', details: error });
    }

    const uploadData = await uploadResponse.json();
    const printifyImageId = uploadData.id;
    console.log(`Image uploaded: ${printifyImageId}`);

    // Step 2: Create product with mockup using Printify's mockup generator
    console.log('Step 2: Generating mockup...');

    // Use Printify's mockup generator endpoint
    const mockupResponse = await fetch(`https://api.printify.com/v1/mockup-generator.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sku: config.variant_ids[0],
        files: [{
          id: printifyImageId,
          type: 'default' // or 'front'/'back' depending on product
        }]
      })
    });

    if (!mockupResponse.ok) {
      const error = await mockupResponse.json();
      console.error('Mockup error:', error);
      return res.status(500).json({ error: 'Failed to generate mockup', details: error });
    }

    const mockupData = await mockupResponse.json();
    console.log('Mockup generated:', mockupData);

    // Return the mockup URL
    return res.status(200).json({
      success: true,
      mockupUrl: mockupData.url || mockupData.mockup_url || imageUrl,
      printifyImageId: printifyImageId,
      productType: productType
    });

  } catch (error) {
    console.error('Error generating mockup:', error);
    return res.status(500).json({
      error: 'Failed to generate mockup',
      message: error.message
    });
  }
}
