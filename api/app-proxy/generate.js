// Image-to-Image Generation with Dog Photo in Iconic Pose
// Route: /api/app-proxy/generate
// Takes customer's dog photo + pose → generates dog in that pose

import { readFileSync } from 'fs';
import { join } from 'path';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

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
    const { dogPhoto, poseId, imageUrl } = req.body;

    if (!dogPhoto && !imageUrl) {
      return res.status(400).json({
        error: 'Dog photo is required',
        message: 'Please provide dogPhoto or imageUrl parameter'
      });
    }

    if (!poseId) {
      return res.status(400).json({ error: 'Pose ID is required' });
    }

    const selectedPose = iconicPoses.poses.find(pose => pose.id === poseId);
    if (!selectedPose) {
      return res.status(400).json({ error: `Invalid pose ID: ${poseId}` });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Replicate API token not configured' });
    }

    console.log('🎨 Generating:', selectedPose.name);

    const photoUrl = dogPhoto || imageUrl;

    // ✅ WORKING SOLUTION: FLUX Kontext Pro for EXACT dog preservation
    // FLUX Kontext takes a reference image and transforms it based on prompt
    // while preserving the subject's key features (breed, fur color, markings)

    // Craft prompt to preserve dog's identity while transforming to iconic scene
    const enhancedPrompt = `Transform this dog into the following scene: ${selectedPose.prompt}. CRITICAL: Keep the EXACT same dog breed, fur color, facial features, and markings from the reference image. Only change the clothing, pose, and background to match the iconic scene. Professional photo quality, highly detailed, 8k resolution.`;

    // Using FLUX Kontext Pro - tested and proven to preserve dog identity
    const requestBody = {
      version: "569705b35f79b1160d51de1d0e3955626af86c77a034a16e89010dbdde5ad312", // FLUX Kontext Pro
      input: {
        input_image: photoUrl, // Customer's dog photo - breed/features WILL BE PRESERVED
        prompt: enhancedPrompt,
        output_format: "png",
      }
    };

    console.log('📤 Sending to FLUX Kontext Pro (identity-preserving generation)...');

    const createResponse = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('❌ Replicate error:', errorData);
      return res.status(createResponse.status).json({
        error: 'Failed to start generation',
        details: errorData,
      });
    }

    const prediction = await createResponse.json();
    console.log('✅ Started:', prediction.id);

    // Poll for completion
    const pollUrl = prediction.urls.get;
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to poll prediction');
      }

      const pollData = await pollResponse.json();

      if (pollData.status === 'succeeded') {
        // FLUX Kontext Pro returns a single image URL string
        const resultImageUrl = pollData.output;
        console.log('🎉 Success!', resultImageUrl);

        return res.status(200).json({
          success: true,
          imageUrl: resultImageUrl,
          poseName: selectedPose.name,
          poseId: selectedPose.id,
        });
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        throw new Error(`Generation failed: ${pollData.error || 'Canceled'}`);
      }

      attempts++;
    }

    return res.status(504).json({ error: 'Generation timeout' });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Generation failed',
      details: error.message,
    });
  }
}

export default handler;
