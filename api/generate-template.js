// API endpoint to generate ONE template image at a time
// Access via: /api/generate-template?poseId=basketball-dunk

import iconicPoses from '../../iconic-poses.json' assert { type: 'json' };

const FLUX_PRO_VERSION = '1119216b4bc8a63426da2c56c68dfc24bf0a6b20951d698ef73ea65aa17ad4c2';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { poseId } = req.query;

  if (!poseId) {
    return res.status(400).json({
      error: 'poseId required',
      availablePoses: iconicPoses.poses.map(p => p.id)
    });
  }

  const pose = iconicPoses.poses.find(p => p.id === poseId);

  if (!pose) {
    return res.status(404).json({ error: 'Pose not found' });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
  }

  console.log(`🎨 Generating template for: ${pose.name}`);

  try {
    // Create prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: FLUX_PRO_VERSION,
        input: {
          prompt: pose.prompt,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90,
          num_outputs: 1,
        }
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Replicate API error: ${createResponse.status}`);
    }

    const prediction = await createResponse.json();
    const pollUrl = prediction.urls.get;
    let attempts = 0;

    // Poll for completion
    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      const pollData = await pollResponse.json();

      if (pollData.status === 'succeeded') {
        const imageUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;

        return res.status(200).json({
          success: true,
          poseId: pose.id,
          poseName: pose.name,
          imageUrl: imageUrl,
          breed: pose.prompt.match(/\b(\w+\s?\w+)\s+dog/i)?.[1] || 'dog'
        });
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        throw new Error(`Generation failed: ${pollData.error || 'Unknown error'}`);
      }

      attempts++;
    }

    throw new Error('Generation timeout');

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Generation failed',
      details: error.message
    });
  }
}
