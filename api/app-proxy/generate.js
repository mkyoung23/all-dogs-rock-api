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

    // CRITICAL: Must preserve the EXACT dog while transforming scene
    // Strategy: Lower strength + stronger preservation prompts
    const enhancedPrompt = `Professional photo composite: Take the EXACT dog from the reference image (preserve every detail: breed, fur color, facial features, eye color, markings, body size) and place it into this scene: ${selectedPose.prompt}. The dog must be 100% identical to the reference photo. Only change the background and environment to match the iconic scene.`;

    // Use SDXL img2img with LOWER strength to preserve dog identity
    const requestBody = {
      version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf", // SDXL img2img working version
      input: {
        image: photoUrl, // Customer's dog photo (base64 or URL)
        prompt: enhancedPrompt,
        negative_prompt: "different dog, wrong dog, human, person, multiple dogs, wrong breed, different fur color, different markings, blurry, low quality, distorted, bad anatomy, mutated features, extra limbs, changed appearance",
        strength: 0.25, // CRITICAL: Very low strength for maximum dog preservation (was 0.65→0.35→0.25)
        num_inference_steps: 50,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
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
        let resultImageUrl = pollData.output;
        // Replicate sometimes returns array, sometimes string - normalize to string
        if (Array.isArray(resultImageUrl)) {
          resultImageUrl = resultImageUrl[0];
        }
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
