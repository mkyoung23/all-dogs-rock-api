// API route for generating AI images using Replicate FLUX Kontext Pro
// This endpoint accepts BOTH a prompt AND a reference image (the customer's pet photo)
// to create scene transformations that preserve the pet's identity
// FLUX Kontext Pro is specifically designed for pet transformations - it transforms
// entire scenes while maintaining subject identity (NOT just img2img enhancement)

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

    console.log('🚀 Generating images with FLUX Kontext Pro...');
    console.log('Prompt:', prompt);
    console.log('Image data starts with:', image.substring(0, 50) + '...');
    console.log('Image data length:', image.length);
    console.log('Premium:', premium);

    // Use FLUX Kontext Pro - specifically designed for pet transformations!
    // This model transforms entire scenes while preserving subject identity
    const version = '0f1178f5a27e9aa2d2d39c8a43c110f7fa7cbf64062ff04a04cd40899e546065';

    console.log('Using FLUX Kontext Pro (black-forest-labs/flux-kontext-pro) for pet scene transformation');

    // Create prompt that describes the DESIRED OUTPUT SCENE
    // FLUX Kontext Pro will automatically preserve the pet's identity from reference image
    // Best practices: be specific about what you want in the final image
    const enhancedPrompt = `A ${prompt}, professional photography, highly detailed, photorealistic`;

    console.log('Enhanced prompt:', enhancedPrompt);

    // Create the prediction request for FLUX Kontext Pro
    // Note: This is NOT img2img - it's reference-based text-to-image generation
    const requestBody = {
      version: version,
      input: {
        prompt: enhancedPrompt,
        input_image: image,  // Reference image for pet identity
        num_outputs: 2,  // Generate 2 variations
        steps: 28,  // Default inference steps for quality
        // FLUX Kontext Pro automatically preserves subject identity - no prompt_strength needed!
      }
    };

    console.log('📤 Request prepared for reference-based scene transformation');

    // Use the version-based predictions endpoint
    const createResponse = await fetch(`https://api.replicate.com/v1/predictions`, {
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
