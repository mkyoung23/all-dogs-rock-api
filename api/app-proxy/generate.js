// Image-to-Image Generation with Dog Photo in Iconic Pose
// Route: /api/proxy/generate
// Takes customer's dog photo + pose → generates dog in that pose

import { requireShopifyProxy } from '../../lib/shopify-auth.js';
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

    console.log('🎨 Generating:', selectedPose.name, 'for shop:', req.shop);

    const photoUrl = dogPhoto || imageUrl;

    // Enhanced prompt to keep customer's dog recognizable while placing in iconic scene
    const enhancedPrompt = `Photo-realistic image: Take the EXACT dog from the reference image (same breed, same fur color, same facial features, same size) and place it in this scene: ${selectedPose.prompt}. The dog must look IDENTICAL to the uploaded photo - same markings, same coat, same everything. Only change the background/environment and the dog's pose to match the iconic scene. Keep the dog's unique appearance 100% accurate.`;

    // Use FLUX 1.1 Pro with image-to-image capability
    // This keeps the customer's dog looking exactly like their dog
    const requestBody = {
      version: 'bf2f2c84d4f87c00cab1da85ac63a06b124949255fa7bf81328b482d0fac30b1', // FLUX 1.1 Pro
      input: {
        prompt: enhancedPrompt,
        image: photoUrl, // Customer's dog photo (base64 or URL)
        prompt_strength: 0.75, // Balance: keep dog recognizable but transform scene
        aspect_ratio: '1:1',
        output_format: 'jpg',
        output_quality: 95,
        safety_tolerance: 2,
        seed: Math.floor(Math.random() * 1000000), // Random seed for variety
      }
    };

    console.log('📤 Sending to FLUX (img2img)...');

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
        const resultImageUrl = pollData.output;
        console.log('🎉 Success!', resultImageUrl);

        return res.status(200).json({
          success: true,
          imageUrl: resultImageUrl,
          poseName: selectedPose.name,
          poseId: selectedPose.id,
          shop: req.shop,
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

export default requireShopifyProxy(handler);
