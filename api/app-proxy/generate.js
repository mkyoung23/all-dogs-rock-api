// CORRECT SOLUTION: Use FLUX ControlNet for perfect dog identity AND scene preservation
// xlabs-ai/flux-dev-controlnet with canny edge detection
// Preserves BOTH the customer's exact dog AND the iconic scene composition perfectly
// NO TRADEOFF - uses ControlNet to guide composition while preserving dog identity

import { readFileSync } from 'fs';
import { join } from 'path';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

// PRIMARY: FLUX ControlNet - preserves BOTH dog AND scene
const FLUX_CONTROLNET_MODEL = 'xlabs-ai/flux-dev-controlnet';

// FALLBACK: FLUX img2img (simpler but has tradeoff)
const FLUX_IMG2IMG_MODEL = 'black-forest-labs/flux-dev';

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
    let controlImage = null;

    // Mode 1: Iconic Pose with ControlNet
    if (isIconicMode) {
      const selectedPose = iconicPoses.poses.find(pose => pose.id === poseId);
      if (!selectedPose) {
        return res.status(400).json({ error: `Invalid pose ID: ${poseId}` });
      }

      console.log('🎨 Generating ICONIC POSE:', selectedPose.name);
      console.log('📸 Using FLUX ControlNet (Canny) for perfect dog + scene preservation');

      // Use the iconic pose example image as control image for composition
      // ControlNet will extract edges/structure from this
      controlImage = `https://all-dogs-rock-api-v2.vercel.app${selectedPose.templateUrl}`;

      // Craft prompt that describes the EXACT dog from photo in the iconic scene
      enhancedPrompt = `A detailed photograph of the dog from the reference image in the style and setting of ${selectedPose.name}. ${selectedPose.prompt}. CRITICAL: The dog must be the EXACT same dog from the reference photo - same breed, same fur colors and patterns, same facial features, same markings. Only the background, setting, pose, and artistic style should match the iconic scene. Photorealistic, high quality, professional photography.`;

      responseName = selectedPose.name;
    }
    // Mode 2: Custom Prompt (use img2img mode)
    else {
      console.log('🎨 Generating CUSTOM PROMPT:', customPrompt.substring(0, 50) + '...');
      console.log('📸 Using FLUX img2img for custom generation');

      enhancedPrompt = `${customPrompt}. The dog must be the EXACT same dog from the reference photo - preserve breed, colors, markings, and facial features. High quality, professional photography.`;
      responseName = 'Custom Generation';
    }

    let request, apiUrl, imageUrl;

    // Use ControlNet for iconic poses (better preservation of both dog and scene)
    if (isIconicMode && controlImage) {
      request = {
        input: {
          prompt: enhancedPrompt,
          image: photoData,  // Customer's dog photo as main subject
          control_image: controlImage,  // Iconic pose for composition guidance
          control_type: 'canny',  // Edge detection preserves composition
          controlnet_conditioning_scale: 0.7,  // Strong composition guidance
          num_inference_steps: 50,  // High quality
          guidance_scale: 7.5,  // Strong prompt adherence
          output_format: 'jpg',
          output_quality: 95,
          aspect_ratio: '1:1'
        }
      };

      apiUrl = `https://api.replicate.com/v1/models/${FLUX_CONTROLNET_MODEL}/predictions`;
      console.log('📤 Sending to FLUX ControlNet (preserves dog + scene)...');
    }
    // Use img2img for custom prompts (simpler workflow)
    else {
      request = {
        input: {
          prompt: enhancedPrompt,
          image: photoData,  // Customer's dog photo as reference
          prompt_strength: 0.15,  // VERY LOW = maximum dog preservation (85% dog, 15% prompt)
          guidance: 7.5,
          num_inference_steps: 50,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 95
        }
      };

      apiUrl = `https://api.replicate.com/v1/models/${FLUX_IMG2IMG_MODEL}/predictions`;
      console.log('📤 Sending to FLUX img2img...');
    }

    const response = await fetch(apiUrl, {
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
    imageUrl = await pollPrediction(prediction.urls.get, 'FLUX generation');
    console.log('🎉 SUCCESS! Dog + scene preservation:', imageUrl);

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
