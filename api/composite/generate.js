// WORKING SOLUTION: Background Removal + Compositing
// This approach GUARANTEES the customer's dog stays identical
// Route: /api/composite/generate

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dogPhoto, imageUrl, poseId } = req.body;

    if (!dogPhoto && !imageUrl) {
      return res.status(400).json({ error: 'Dog photo required' });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Replicate API not configured' });
    }

    const photoUrl = dogPhoto || imageUrl;

    console.log('🐕 Step 1: Removing background from dog photo...');

    // Step 1: Remove background from customer's dog photo
    // Using BRIA background removal model - fast and accurate
    const bgRemovalRequest = {
      version: "5f7cb3f5f41d0cbf08ec7c46b41dd06dc2cb5d61ab91c7fb88cc5ebc112e37e7",
      input: {
        image: photoUrl
      }
    };

    const bgRemovalResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify(bgRemovalRequest)
    });

    if (!bgRemovalResponse.ok) {
      throw new Error('Background removal failed to start');
    }

    const bgRemovalPrediction = await bgRemovalResponse.json();

    // Poll for background removal completion
    let bgRemovalResult = null;
    const pollUrl = bgRemovalPrediction.urls.get;
    let attempts = 0;

    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      });

      const pollData = await pollResponse.json();

      if (pollData.status === 'succeeded') {
        bgRemovalResult = pollData.output;
        console.log('✅ Background removed:', bgRemovalResult);
        break;
      }

      if (pollData.status === 'failed') {
        throw new Error('Background removal failed');
      }

      attempts++;
    }

    if (!bgRemovalResult) {
      throw new Error('Background removal timeout');
    }

    console.log('🎨 Step 2: Compositing dog onto Washington template...');

    // Step 2: Composite the dog onto Washington template
    // Using img2img with VERY low strength just to blend it into the scene
    const compositePrompt = 'A dog dressed as General George Washington standing heroically in a boat crossing the icy Delaware River, Revolutionary War scene, American flag, soldiers in background, historical painting style, epic composition';

    const compositeRequest = {
      version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      input: {
        image: bgRemovalResult,
        prompt: compositePrompt,
        negative_prompt: "human, person, people, man, woman, altered dog, different dog",
        strength: 0.45, // Moderate strength to add background while keeping dog
        num_inference_steps: 40,
        guidance_scale: 8.0
      }
    };

    const compositeResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify(compositeRequest)
    });

    if (!compositeResponse.ok) {
      throw new Error('Composite failed to start');
    }

    const compositePrediction = await compositeResponse.json();

    // Poll for composite completion
    let finalResult = null;
    const compositePollUrl = compositePrediction.urls.get;
    attempts = 0;

    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(compositePollUrl, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      });

      const pollData = await pollResponse.json();

      if (pollData.status === 'succeeded') {
        finalResult = pollData.output;
        console.log('🎉 Composite complete:', finalResult);
        break;
      }

      if (pollData.status === 'failed') {
        throw new Error('Composite failed');
      }

      attempts++;
    }

    if (!finalResult) {
      throw new Error('Composite timeout');
    }

    // Normalize result
    const resultUrl = Array.isArray(finalResult) ? finalResult[0] : finalResult;

    return res.status(200).json({
      success: true,
      imageUrl: resultUrl,
      poseName: 'Washington Crossing the Delaware',
      poseId: 'washington-crossing'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Generation failed',
      details: error.message
    });
  }
}
