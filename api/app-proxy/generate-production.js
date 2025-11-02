// PRODUCTION READY ENDPOINT - Generated 2025-11-02
// This endpoint uses FLUX 1.1 Pro to generate iconic dog images
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple test: just confirm Replicate token exists and return success
    const hasToken = !!process.env.REPLICATE_API_TOKEN;

    if (!hasToken) {
      return res.status(500).json({
        error: 'Replicate token not configured',
        timestamp: new Date().toISOString()
      });
    }

    const { poseId = 'rocky-statue', dogBreed = 'golden retriever' } = req.body;

    // Create a minimal FLUX prediction
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-1.1-pro',
        input: {
          prompt: `A happy ${dogBreed} dog in a ${poseId} pose, professional photography, highly detailed`,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90
        }
      })
    });

    if (!replicateResponse.ok) {
      const errorData = await replicateResponse.json();
      return res.status(replicateResponse.status).json({
        error: 'Replicate API error',
        details: errorData,
        timestamp: new Date().toISOString()
      });
    }

    const prediction = await replicateResponse.json();

    // Poll for completion
    const pollUrl = prediction.urls.get;
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(pollUrl, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
      });

      if (!pollResponse.ok) {
        return res.status(500).json({ error: 'Polling failed' });
      }

      const pollData = await pollResponse.json();

      if (pollData.status === 'succeeded') {
        return res.status(200).json({
          success: true,
          imageUrl: pollData.output,
          poseId,
          dogBreed,
          predictionId: prediction.id,
          timestamp: new Date().toISOString()
        });
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        return res.status(500).json({
          error: 'Generation failed',
          details: pollData.error
        });
      }

      attempts++;
    }

    return res.status(504).json({ error: 'Timeout' });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
