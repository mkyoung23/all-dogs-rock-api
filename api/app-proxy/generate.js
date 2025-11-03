// COMPLETELY NEW APPROACH: Use customer's dog photo to generate iconic pose
// Instead of face swap, use image-to-image generation with dog photo as reference

import { readFileSync } from 'fs';
import { join } from 'path';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

// Use FLUX img2img to recreate pose with customer's actual dog
const FLUX_IMG2IMG_VERSION = '61d59b0fc94f31638c17fa4c4dc45ea864f87dd00e39f86e0f464e97fd4d5c3e';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { poseId, dogPhoto } = req.body;

    if (!poseId) {
      return res.status(400).json({ error: 'Pose ID is required' });
    }

    if (!dogPhoto) {
      return res.status(400).json({
        error: 'Dog photo is required',
        message: 'Please upload a photo of your dog'
      });
    }

    const selectedPose = iconicPoses.poses.find(pose => pose.id === poseId);
    if (!selectedPose) {
      return res.status(400).json({ error: `Invalid pose ID: ${poseId}` });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Replicate API token not configured' });
    }

    console.log('🎨 Generating iconic dog for:', selectedPose.name);
    console.log('📸 Using customer dog photo');

    // NEW APPROACH: Use customer's dog photo as the IMAGE INPUT
    // Tell AI to recreate the iconic pose using THIS SPECIFIC DOG
    const enhancedPrompt = `${selectedPose.prompt}. Use the exact dog from the reference image. Match the dog's breed, fur color, face, and all characteristics exactly. Keep the dog's appearance identical to the reference photo while placing it in this iconic scene.`;

    const request = {
      version: FLUX_IMG2IMG_VERSION,
      input: {
        prompt: enhancedPrompt,
        image: dogPhoto,  // Customer's dog photo as reference
        prompt_strength: 0.8,  // Strong adherence to prompt (pose)
        guidance: 3.5,
        num_inference_steps: 28,
        aspect_ratio: '1:1',
        output_format: 'jpg',
        output_quality: 90
      }
    };

    console.log('📤 Sending to FLUX img2img...');

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ FLUX Error:', JSON.stringify(errorData, null, 2));
      return res.status(response.status).json({
        error: 'Failed to generate image',
        details: errorData.detail || JSON.stringify(errorData),
      });
    }

    const prediction = await response.json();
    console.log('✅ Generation started:', prediction.id);

    // Poll for completion
    const imageUrl = await pollPrediction(prediction.urls.get, 'Image generation');
    console.log('🎉 SUCCESS! Image with customer\'s dog:', imageUrl);

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      poseName: selectedPose.name,
      poseId: selectedPose.id,
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to generate',
      details: error.message,
    });
  }

  async function pollPrediction(pollUrl, description) {
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error(`Failed to poll ${description}`);
      }

      const pollData = await pollResponse.json();
      console.log(`${description} poll ${attempts + 1}: ${pollData.status}`);

      if (pollData.status === 'succeeded') {
        return pollData.output;
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        throw new Error(`${description} failed: ${pollData.error || 'Canceled'}`);
      }

      attempts++;
    }

    throw new Error(`${description} timeout`);
  }
}
