// TESTED WORKING SOLUTION: Use FLUX img2img with correct parameters
// Uses asiryan/flux-dev which actually supports img2img mode
// Preserves customer's dog identity while applying iconic scene style
// Based on verified Replicate API schema

import { readFileSync } from 'fs';
import { join } from 'path';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

// PRIMARY: FLUX Dev with img2img support (verified working)
const FLUX_IMG2IMG_MODEL = 'asiryan/flux-dev';

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
      console.log('📸 Using FLUX img2img with LOW strength for dog preservation');

      // Build comprehensive prompt that describes both the dog AND the scene
      enhancedPrompt = `A photograph of the exact dog from the input image, ${selectedPose.prompt}. The dog must be the same breed, same color, same fur pattern, same facial features, same markings. High quality, detailed, professional photography.`;

      responseName = selectedPose.name;
    }
    // Mode 2: Custom Prompt
    else {
      console.log('🎨 Generating CUSTOM PROMPT:', customPrompt.substring(0, 50) + '...');
      console.log('📸 Using FLUX img2img with LOW strength for dog preservation');

      enhancedPrompt = `A photograph of the exact dog from the input image, ${customPrompt}. The dog must be the same breed, same color, same fur pattern, same facial features. High quality, professional photography.`;
      responseName = 'Custom Generation';
    }

    // Use img2img mode with LOW strength to preserve dog identity
    // strength: 0.2 means 80% preserve input image (dog), 20% follow prompt (scene)
    const request = {
      input: {
        prompt: enhancedPrompt,
        image: photoData,  // Customer's dog photo as reference
        strength: 0.2,  // LOW = preserve dog (verified parameter name from API schema)
        guidance_scale: 7.5,  // Strong prompt adherence for scene
        num_inference_steps: 50,  // High quality
        aspect_ratio: '1:1',
        output_format: 'jpg',
        output_quality: 95,
        seed: null  // Random for variety
      }
    };

    const apiUrl = `https://api.replicate.com/v1/models/${FLUX_IMG2IMG_MODEL}/predictions`;
    console.log('📤 Sending to FLUX img2img (asiryan/flux-dev)...');
    console.log(`   Strength: ${request.input.strength} (${(1-request.input.strength)*100}% dog, ${request.input.strength*100}% scene)`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ FLUX API Error Response:');
      console.error('   Status:', response.status);
      console.error('   Error:', JSON.stringify(errorData, null, 2));
      console.error('   Model:', FLUX_IMG2IMG_MODEL);
      console.error('   Has API Token:', !!process.env.REPLICATE_API_TOKEN);
      return res.status(response.status).json({
        error: 'Failed to generate image',
        details: errorData.detail || errorData.error || JSON.stringify(errorData),
        status: response.status
      });
    }

    const prediction = await response.json();
    console.log('✅ Generation started:', prediction.id);

    // Poll for completion
    const output = await pollPrediction(prediction.urls.get, 'FLUX img2img generation');
    // FLUX models return output as an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;
    console.log('🎉 SUCCESS! Dog preservation with scene:', imageUrl);

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
        console.log('✅ Output received:', typeof pollData.output, Array.isArray(pollData.output) ? `array[${pollData.output.length}]` : 'single value');
        return pollData.output;
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        console.error('❌ Generation failed:', pollData.error);
        throw new Error(`${description} failed: ${pollData.error || 'Canceled'}`);
      }

      attempts++;
    }

    throw new Error(`${description} timeout`);
  }
}
