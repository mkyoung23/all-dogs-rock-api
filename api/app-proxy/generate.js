// COMPLETE FIX: Use customer's dog photo to generate iconic pose OR custom prompts
// Supports BOTH iconic poses AND custom descriptions
// Works with Shopify Custom Liquid code AND iconic poses gallery

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
    // Support multiple parameter formats:
    // Format 1: { poseId, dogPhoto } - for iconic poses
    // Format 2: { prompt, image } - for custom prompts (Shopify Custom Liquid)
    const {
      poseId,
      dogPhoto,
      image,
      prompt: customPrompt,
      premium = false
    } = req.body;

    // Determine which photo parameter was provided
    const photoData = dogPhoto || image;

    // Determine mode: iconic pose or custom prompt
    const isCustomMode = !!customPrompt;
    const isIconicMode = !!poseId;

    if (!isCustomMode && !isIconicMode) {
      return res.status(400).json({
        error: 'Either poseId (for iconic poses) or prompt (for custom) is required'
      });
    }

    if (!photoData) {
      return res.status(400).json({
        error: 'Dog photo is required',
        message: 'Please upload a photo of your dog using either "dogPhoto" or "image" parameter'
      });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Replicate API token not configured' });
    }

    let enhancedPrompt;
    let responseName;

    // Mode 1: Iconic Pose
    if (isIconicMode) {
      const selectedPose = iconicPoses.poses.find(pose => pose.id === poseId);
      if (!selectedPose) {
        return res.status(400).json({ error: `Invalid pose ID: ${poseId}` });
      }

      console.log('🎨 Generating ICONIC POSE:', selectedPose.name);
      console.log('📸 Using customer dog photo (img2img)');

      enhancedPrompt = `${selectedPose.prompt}. Use the exact dog from the reference image. Match the dog's breed, fur color, face, and all characteristics exactly. Keep the dog's appearance identical to the reference photo while placing it in this iconic scene.`;
      responseName = selectedPose.name;
    }
    // Mode 2: Custom Prompt
    else {
      console.log('🎨 Generating CUSTOM PROMPT:', customPrompt.substring(0, 50) + '...');
      console.log('📸 Using customer dog photo (img2img)');

      enhancedPrompt = `${customPrompt}. Use the exact dog/pet from the reference image. Match all characteristics exactly - breed, fur color, face, markings. Keep the appearance identical to the reference photo.`;
      responseName = 'Custom Generation';
    }

    const request = {
      version: FLUX_IMG2IMG_VERSION,
      input: {
        prompt: enhancedPrompt,
        image: photoData,  // Customer's dog photo as reference (from dogPhoto or image param)
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

    // Return response based on mode
    const responseData = {
      success: true,
      imageUrl: imageUrl,
      name: responseName,
    };

    // Add mode-specific fields
    if (isIconicMode) {
      responseData.poseName = responseName;
      responseData.poseId = poseId;
    } else {
      // For Shopify Custom Liquid compatibility, return as array
      responseData.images = [imageUrl];
    }

    return res.status(200).json(responseData);

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
