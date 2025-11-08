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

    // ✅ NEW APPROACH: InstantID for EXACT dog preservation
    // InstantID is designed specifically for identity-preserving generation
    // It takes the dog's face/features and places them in a new scene while preserving identity

    // Use the full selectedPose.prompt for better scene accuracy
    const enhancedPrompt = `${selectedPose.prompt}, professional photo, highly detailed, 8k quality`;

    // Using InstantID model - specifically designed for subject identity preservation
    const requestBody = {
      version: "2e4785a4d80dadf580077b2244c8d7c05d8e3faac04a04c02d8e099dd2876789", // zsxkib/instant-id latest
      input: {
        image: photoUrl, // Customer's dog photo - THIS FACE/IDENTITY WILL BE PRESERVED
        prompt: enhancedPrompt,
        negative_prompt: "human face, person, man, woman, people, blurry, low quality, distorted, wrong animal, cat, different dog breed",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        ip_adapter_scale: 0.8, // High value = strong identity preservation
        controlnet_conditioning_scale: 0.8, // Helps maintain pose
        num_outputs: 1,
        output_format: "png",
        seed: Math.floor(Math.random() * 1000000),
      }
    };

    console.log('📤 Sending to InstantID (identity-preserving generation)...');

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
