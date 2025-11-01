// API route for generating AI images using Replicate Face Swap
// This endpoint accepts a customer's pet photo and swaps it onto iconic pose templates
// Using dog-to-dog face swap for reliable, consistent results
// Customer selects from pre-made iconic poses (basketball dunk, astronaut, etc.)

import iconicPoses from '../../iconic-poses.json' assert { type: 'json' };

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
    const { poseId, image, premium = false } = req.body;

    // Validate required fields
    if (!poseId) {
      return res.status(400).json({ error: 'Pose ID is required - customer must select an iconic pose' });
    }

    if (!image) {
      return res.status(400).json({
        error: 'Image is required - customer must upload their pet photo first'
      });
    }

    // Look up the selected pose template
    const selectedPose = iconicPoses.poses.find(pose => pose.id === poseId);

    if (!selectedPose) {
      return res.status(400).json({
        error: `Invalid pose ID: ${poseId}`,
        availablePoses: iconicPoses.poses.map(p => p.id)
      });
    }

    console.log('🎭 Selected pose:', selectedPose.name);
    console.log('📸 Template URL:', selectedPose.templateUrl);

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('❌ REPLICATE_API_TOKEN is not set in environment variables!');
      return res.status(500).json({
        error: 'Replicate API token not configured. Please contact support.'
      });
    }

    console.log('🚀 Starting face swap...');
    console.log('Customer image data starts with:', image.substring(0, 50) + '...');
    console.log('Customer image data length:', image.length);
    console.log('Premium:', premium);

    // Use omniedgeio/face-swap for reliable dog-to-dog face swapping
    // This model swaps faces from one image to another while preserving pose/background
    const version = '1251f6b5b8c3ce671f937d1262cc7d542b7729c30ae5e67a4bf0eef61fdb8d82';

    console.log('Using omniedgeio/face-swap for face replacement');

    // Create the prediction request for face swap
    // swap_image: customer's dog photo (face source)
    // target_image: iconic pose template (body/pose/background)
    const requestBody = {
      version: version,
      input: {
        swap_image: image,  // Customer's pet photo (the face to use)
        target_image: selectedPose.templateUrl,  // Template pose (the body/scene)
        det_thresh: 0.1,  // Detection threshold for face detection
        weight: 0.5,  // Blending weight
      }
    };

    console.log('📤 Face swap request prepared - swapping customer dog onto', selectedPose.name);

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
        // Face swap returns a single image URL
        const swappedImageUrl = pollData.output;

        console.log('✅ Face swap completed successfully!');
        console.log('📷 Swapped image URL:', swappedImageUrl);

        return res.status(200).json({
          success: true,
          imageUrl: swappedImageUrl,
          images: [swappedImageUrl],  // Return as array for compatibility
          poseName: selectedPose.name,
          poseId: selectedPose.id,
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
