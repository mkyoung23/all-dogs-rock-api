// API route for generating AI images using Replicate FLUX img2img
// This endpoint accepts BOTH a prompt AND a reference image (the customer's pet photo)
// to create images that preserve the pet's identity
// FLUX model provides superior pet identity preservation and prompt following

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 60; // ~90 seconds max

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image, premium = false, human_in_photo = false } = req.body;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!image) {
      return res.status(400).json({
        error: 'Image is required - customer must upload their pet photo first'
      });
    }

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('❌ REPLICATE_API_TOKEN is not set in environment variables!');
      return res.status(500).json({
        error: 'Replicate API token not configured. Please contact support.'
      });
    }

    console.log('🚀 Generating images with FLUX img2img...');
    console.log('Prompt:', prompt);
    console.log('Image data starts with:', image.substring(0, 50) + '...');
    console.log('Image data length:', image.length);
    console.log('Premium:', premium);

    // Use IP-Adapter + ControlNet Depth - PERFECT for pet identity + scene transformation
    const model = 'chigozienri/ip_adapter-sdxl-controlnet-depth';

    console.log('Using IP-Adapter + ControlNet Depth for pet transformation:', model);

    // Enhance the prompt to describe the scene we want
    const enhancedPrompt = `Professional photo of a dog ${prompt}, high quality, detailed, photorealistic`;

    console.log('Enhanced prompt:', enhancedPrompt);

    // Create the prediction request for IP-Adapter + ControlNet
    const requestBody = {
      input: {
        input_image: image,  // Pet photo for depth/structure
        ip_image: image,  // Pet photo for identity preservation
        prompt: enhancedPrompt,
        negative_prompt: "blurry, low quality, distorted, deformed, ugly, cartoon, illustration",
        ip_adapter_scale: 0.75,  // Strong identity preservation (0.75 = 75% pet's appearance)
        controlnet_scale: 0.5,  // Moderate depth control (allows scene transformation)
        num_inference_steps: 30,  // Quality steps
        guidance_scale: 7.5,  // Strong prompt following
        num_outputs: 2,  // Generate 2 variations
        seed: -1  // Random seed each time
      }
    };

    console.log('📤 Request prepared with ip_adapter_scale:', requestBody.input.ip_adapter_scale);

    // Use the model-based predictions endpoint
    const createResponse = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Create response status:', createResponse.status);

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('❌ Replicate API error response:', JSON.stringify(errorData, null, 2));
      console.error('Status:', createResponse.status);
      console.error('Status Text:', createResponse.statusText);

      return res.status(createResponse.status).json({
        error: 'Failed to start image generation',
        details: errorData.detail || errorData.error || JSON.stringify(errorData),
        status: createResponse.status,
        replicateError: errorData
      });
    }

    const prediction = await createResponse.json();
    console.log('Prediction created:', prediction.id);

    // Poll for completion
    const pollUrl = prediction.urls.get;
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to poll prediction status');
      }

      const pollData = await pollResponse.json();
      console.log(`Poll attempt ${attempts + 1}: status=${pollData.status}`);

      if (pollData.status === 'succeeded') {
        const generatedUrls = Array.isArray(pollData.output)
          ? pollData.output
          : [pollData.output];

        console.log('✅ Images generated successfully:', generatedUrls.length, 'images');
        generatedUrls.forEach((url, i) => console.log(`  Image ${i+1}:`, url));

        return res.status(200).json({
          success: true,
          images: generatedUrls,  // Return array of all images
          imageUrl: generatedUrls[0],  // Keep for backwards compatibility
          prompt: prompt,
          premium: premium,
        });
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        console.error('❌ Generation failed:', pollData.error);
        return res.status(500).json({
          error: 'Image generation failed',
          details: pollData.error || 'Generation was canceled or failed',
        });
      }

      attempts++;
    }

    // Timeout
    console.error('⏱️ Generation timeout after', MAX_POLL_ATTEMPTS, 'attempts');
    return res.status(504).json({
      error: 'Image generation timeout',
      details: 'Generation took too long. Please try again.',
    });

  } catch (error) {
    console.error('❌ Error in generate endpoint:', error);
    return res.status(500).json({
      error: 'Failed to generate image',
      details: error.message,
    });
  }
}
