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

    // CRITICAL: EXTREME dog preservation - only modify background, keep dog 100% identical
    // Using minimal strength to barely transform the image - just add background elements
    const enhancedPrompt = `This exact dog wearing Revolutionary War general uniform, standing heroically in boat crossing icy Delaware River, Revolutionary War scene background, keep the dog's face and body EXACTLY as shown`;

    // EXTREME preservation mode - strength 0.15 to keep dog nearly untouched
    const requestBody = {
      version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf", // SDXL img2img working version
      input: {
        image: photoUrl, // Customer's dog photo (base64 or URL)
        prompt: enhancedPrompt,
        negative_prompt: "human, person, man, woman, people, different dog, cat, other animals, changed face, different breed, altered features, wrong dog",
        strength: 0.10, // MAXIMUM: 0.10 = 90% original preserved - last attempt before alternative approach
        num_inference_steps: 50,
        guidance_scale: 9.0, // Higher guidance to force prompt adherence
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
