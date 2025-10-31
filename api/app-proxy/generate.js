// API route for generating AI images using Replicate IP-Adapter
// This endpoint accepts BOTH a prompt AND a reference image (the customer's pet photo)
// to create images that preserve the pet's identity

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

    console.log('🚀 Generating image with Replicate IP-Adapter...');
    console.log('Prompt:', prompt);
    console.log('Image data starts with:', image.substring(0, 50) + '...');
    console.log('Image data length:', image.length);
    console.log('Premium:', premium);
    console.log('Human in photo:', human_in_photo);

    // Use the standard IP-Adapter SDXL model
    const modelVersion = human_in_photo
      ? '226c6bf67a75a129b0f978e518fed33e1fb13956e15761c1ac53c9d2f898c9af'  // Face model
      : '3a7e0da6ab5ce58e62a8e6494a28daf15ada8178b69217732c90a3daaae1bc75'; // Image model

    console.log('Using model version:', modelVersion);

    // Create the prediction request
    const requestBody = {
      version: modelVersion,
      input: {
        image: image,
        prompt: prompt,
        num_outputs: 1,
        num_inference_steps: premium ? 50 : 30,
        guidance_scale: premium ? 7.5 : 5.0,
        scheduler: "K_EULER"
      }
    };

    console.log('📤 Request body prepared, image field length:', requestBody.input.image.length);

    // Create the prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
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
        const generatedUrl = Array.isArray(pollData.output)
          ? pollData.output[0]
          : pollData.output;

        console.log('✅ Image generated successfully:', generatedUrl);

        return res.status(200).json({
          success: true,
          imageUrl: generatedUrl,
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
