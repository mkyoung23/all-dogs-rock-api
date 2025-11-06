// ULTIMATE FIX: Use Ideogram Character for perfect dog identity preservation
// Ideogram Character (July 2025) maintains character consistency from single reference image
// Preserves BOTH the customer's exact dog AND the iconic scene composition
// Supports BOTH iconic poses AND custom descriptions

import { readFileSync } from 'fs';
import { join } from 'path';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

// PRIMARY: Ideogram Character - preserves subject identity across different scenes
const IDEOGRAM_CHARACTER_MODEL = 'ideogram-ai/ideogram-character';

// FALLBACK: FLUX img2img (if Ideogram doesn't work well for certain cases)
const FLUX_IMG2IMG_VERSION = 'black-forest-labs/flux-dev';

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
      console.log('📸 Using Ideogram Character for perfect dog identity preservation');

      // Ideogram Character requires describing the scene, not instructing about preservation
      // The model automatically preserves the character's identity from the reference image
      enhancedPrompt = `${selectedPose.prompt}. High quality, detailed, professional photography.`;
      responseName = selectedPose.name;
    }
    // Mode 2: Custom Prompt
    else {
      console.log('🎨 Generating CUSTOM PROMPT:', customPrompt.substring(0, 50) + '...');
      console.log('📸 Using Ideogram Character for perfect dog identity preservation');

      enhancedPrompt = `${customPrompt}. High quality, detailed, professional photography.`;
      responseName = 'Custom Generation';
    }

    // Use Ideogram Character model for perfect identity preservation
    const request = {
      input: {
        prompt: enhancedPrompt,
        character_reference_image: photoData,  // Customer's dog photo as character reference
        style_type: 'Realistic',  // Realistic style for authentic dog photos
        aspect_ratio: '1:1',
        rendering_speed: 'Quality',  // Use Quality mode for best results
        magic_prompt_option: 'Off',  // Don't modify our carefully crafted prompts
      }
    };

    console.log('📤 Sending to Ideogram Character (preserves dog identity perfectly)...');

    const response = await fetch(`https://api.replicate.com/v1/models/${IDEOGRAM_CHARACTER_MODEL}/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Ideogram Character Error:', JSON.stringify(errorData, null, 2));
      return res.status(response.status).json({
        error: 'Failed to generate image with Ideogram Character',
        details: errorData.detail || JSON.stringify(errorData),
      });
    }

    const prediction = await response.json();
    console.log('✅ Ideogram Character generation started:', prediction.id);

    // Poll for completion
    const imageUrl = await pollPrediction(prediction.urls.get, 'Ideogram Character generation');
    console.log('🎉 SUCCESS! Perfect dog identity preservation:', imageUrl);

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
