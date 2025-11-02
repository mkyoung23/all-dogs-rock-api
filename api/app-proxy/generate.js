// API route for generating iconic dog images using FLUX 1.1 Pro
// Customer provides dog breed, we generate their dog in iconic poses
// Deployed: 2025-11-02

import iconicPoses from '../../iconic-poses.json' assert { type: 'json' };

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

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
    const { poseId, dogBreed = 'golden retriever', premium = false } = req.body;

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

    console.log('🎨 Generating:', selectedPose.name, 'with', dogBreed);

    // Use FLUX 1.1 Pro to generate the image
    const prompt = selectedPose.prompt.replace(/golden retriever|german shepherd|husky|beagle|corgi|rottweiler|boxer|french bulldog|labrador retriever|poodle|dalmatian|australian shepherd|border collie|doberman|shiba inu|jack russell terrier|saint bernard|cavalier king charles spaniel|pug|samoyed|spaniel|bulldog|poodle|greyhound/gi, dogBreed);

    const requestBody = {
      model: 'black-forest-labs/flux-1.1-pro',
      input: {
        prompt: prompt,
        aspect_ratio: '1:1',
        output_format: 'jpg',
        output_quality: 90,
        safety_tolerance: 2,
        prompt_upsampling: true
      }
    };

    console.log('📤 Sending request to FLUX 1.1 Pro...');

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
      console.error('❌ Error:', JSON.stringify(errorData, null, 2));
      return res.status(createResponse.status).json({
        error: 'Failed to start generation',
        details: errorData.detail || JSON.stringify(errorData),
      });
    }

    const prediction = await createResponse.json();
    console.log('✅ Prediction created:', prediction.id);

    // Poll for completion
    const pollUrl = prediction.urls.get;
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to poll prediction');
      }

      const pollData = await pollResponse.json();
      console.log(`Poll ${attempts + 1}: ${pollData.status}`);

      if (pollData.status === 'succeeded') {
        const imageUrl = pollData.output;
        console.log('🎉 Success! Image:', imageUrl);

        return res.status(200).json({
          success: true,
          imageUrl: imageUrl,
          poseName: selectedPose.name,
          poseId: selectedPose.id,
        });
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        console.error('❌ Failed:', pollData.error);
        return res.status(500).json({
          error: 'Generation failed',
          details: pollData.error || 'Canceled',
        });
      }

      attempts++;
    }

    return res.status(504).json({
      error: 'Generation timeout',
      details: 'Took too long',
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to generate',
      details: error.message,
    });
  }
}
