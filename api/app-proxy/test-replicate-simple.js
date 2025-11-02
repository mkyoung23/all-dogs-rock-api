// Minimal Replicate test endpoint
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const hasToken = !!process.env.REPLICATE_API_TOKEN;
    const tokenPreview = process.env.REPLICATE_API_TOKEN ?
      process.env.REPLICATE_API_TOKEN.substring(0, 10) + '...' : 'none';

    if (!hasToken) {
      return res.status(500).json({
        error: 'No Replicate token',
        hasToken: false
      });
    }

    // Try to create a simple FLUX prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-1.1-pro',
        input: {
          prompt: 'a happy golden retriever dog',
          aspect_ratio: '1:1'
        }
      })
    });

    const data = await response.json();

    return res.status(200).json({
      success: response.ok,
      status: response.status,
      hasToken,
      tokenPreview,
      replicateResponse: data
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
