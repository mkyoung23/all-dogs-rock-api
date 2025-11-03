// API route for generating iconic dog images with FACE SWAP
// Customer uploads their dog photo, we swap it into iconic poses
// Two-step process: 1) Generate base image with FLUX, 2) Face swap customer's dog
// Deployed: 2025-11-03

import { readFileSync } from 'fs';
import { join } from 'path';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

// Face swap model version (yan-ops/face_swap with face enhancer)
const FACE_SWAP_VERSION = 'd5900f9ebed33e7ae08a07f17e0d98b4ebc68ab9528a70462afc3899cfe23bab';
// FLUX 1.1 Pro version
const FLUX_VERSION = '80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c';

export default async function handler(req, res) {
  // CORS
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

    // Validate inputs
    if (!poseId) {
      return res.status(400).json({ error: 'Pose ID is required' });
    }

    if (!dogPhoto) {
      return res.status(400).json({
        error: 'Dog photo is required',
        message: 'Please upload a photo of your dog (URL or base64)'
      });
    }

    const selectedPose = iconicPoses.poses.find(pose => pose.id === poseId);
    if (!selectedPose) {
      return res.status(400).json({ error: `Invalid pose ID: ${poseId}` });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Replicate API token not configured' });
    }

    console.log('🎨 Starting face swap for:', selectedPose.name);
    console.log('📸 Customer dog photo received');

    // NEW APPROACH: Skip FLUX, use pre-generated iconic pose templates
    // Then swap customer's dog face directly onto the template
    console.log('📤 Using pre-generated template for:', selectedPose.name);

    // Use the templateUrl from iconic-poses.json as the base
    // If it's broken/404, we'll generate it on the fly
    let baseImageUrl = selectedPose.templateUrl;

    // Check if we need to generate fresh base image
    const needsGeneration = !baseImageUrl || baseImageUrl.includes('replicate.delivery');

    if (needsGeneration) {
      console.log('📤 Generating fresh base image with FLUX...');

      // Use original prompt without breed replacement
      const fluxRequest = {
        version: FLUX_VERSION,
        input: {
          prompt: selectedPose.prompt,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90,
          safety_tolerance: 2,
          prompt_upsampling: true
        }
      };

      const fluxResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify(fluxRequest),
      });

      if (!fluxResponse.ok) {
        const errorData = await fluxResponse.json();
        console.error('❌ FLUX Error:', JSON.stringify(errorData, null, 2));
        return res.status(fluxResponse.status).json({
          error: 'Failed to generate base image',
          details: errorData.detail || JSON.stringify(errorData),
        });
      }

      const fluxPrediction = await fluxResponse.json();
      console.log('✅ Base image generation started:', fluxPrediction.id);

      // Poll FLUX for completion
      baseImageUrl = await pollPrediction(fluxPrediction.urls.get, 'FLUX base image');
      console.log('🎉 Base image ready:', baseImageUrl);
    }

    // STEP 2: Face swap - replace dog in template with customer's dog
    console.log('📤 Swapping customer\'s dog face onto template...');

    const swapRequest = {
      version: FACE_SWAP_VERSION,
      input: {
        source_image: dogPhoto,      // Customer's dog photo (source - face to extract)
        target_image: baseImageUrl   // Template image (destination - where to place face)
      }
    };

    const swapResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify(swapRequest),
    });

    if (!swapResponse.ok) {
      const errorData = await swapResponse.json();
      console.error('❌ Face Swap Error:', JSON.stringify(errorData, null, 2));
      return res.status(swapResponse.status).json({
        error: 'Failed to swap faces',
        details: errorData.detail || JSON.stringify(errorData),
      });
    }

    const swapPrediction = await swapResponse.json();
    console.log('✅ Face swap started:', swapPrediction.id);

    // Poll face swap for completion
    const finalImageUrl = await pollPrediction(swapPrediction.urls.get, 'Face swap');
    console.log('🎉 SUCCESS! Final image with customer\'s dog:', finalImageUrl);

    return res.status(200).json({
      success: true,
      imageUrl: finalImageUrl,
      baseImageUrl: baseImageUrl,  // Include base image for debugging
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

  // Helper function to poll a prediction until completion
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
        // Handle different output formats
        const output = pollData.output;

        // If output is an object with 'image' property (face swap), return the image URL
        if (output && typeof output === 'object' && output.image) {
          return output.image;
        }

        // Otherwise return output directly (FLUX returns direct URL)
        return output;
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        throw new Error(`${description} failed: ${pollData.error || 'Canceled'}`);
      }

      attempts++;
    }

    throw new Error(`${description} timeout`);
  }
}
