// API route for generating AI images using Replicate IP-Adapter
// This endpoint accepts BOTH a prompt AND a reference image (the customer's pet photo)
// to create images that preserve the pet's identity

export const config = {
  runtime: 'edge',
};

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 60; // ~90 seconds max

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const { prompt, image, premium = false, human_in_photo = false } = await req.json();

    // Validate required fields
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required - customer must upload their pet photo first' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Replicate API token not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log('Generating image with Replicate IP-Adapter...');
    console.log('Prompt:', prompt);
    console.log('Image URL:', image.substring(0, 50) + '...');
    console.log('Premium:', premium);
    console.log('Human in photo:', human_in_photo);

    // Choose the right model version
    // For faces (human + pet), use the face-specific model
    // For pets only, use the generic image model
    const model = human_in_photo
      ? 'lucataco/ip_adapter-sdxl-face:226c6bf67a75a129b0f978e518fed33e1fb13956e15761c1ac53c9d2f898c9af'
      : 'lucataco/ip_adapter-sdxl-image:3a7e0da6ab5ce58e62a8e6494a28daf15ada8178b69217732c90a3daaae1bc75';

    // Create the prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: model.split(':')[1], // Extract version hash
        input: {
          image: image,  // The customer's uploaded pet photo
          prompt: prompt,
          num_outputs: 1,
          num_inference_steps: premium ? 50 : 30,
          guidance_scale: premium ? 7.5 : 5.0,
          scheduler: "K_EULER",
        },
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('Replicate API error:', errorData);
      return new Response(
        JSON.stringify({
          error: 'Failed to start image generation',
          details: errorData.detail || 'Unknown error',
        }),
        {
          status: createResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const prediction = await createResponse.json();
    console.log('Prediction created:', prediction.id);

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
        throw new Error('Failed to poll prediction status');
      }

      const pollData = await pollResponse.json();
      console.log(`Poll attempt ${attempts + 1}: status=${pollData.status}`);

      if (pollData.status === 'succeeded') {
        const generatedUrl = Array.isArray(pollData.output)
          ? pollData.output[0]
          : pollData.output;

        console.log('Image generated successfully:', generatedUrl);

        return new Response(
          JSON.stringify({
            success: true,
            imageUrl: generatedUrl,
            prompt: prompt,
            premium: premium,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        console.error('Generation failed:', pollData.error);
        return new Response(
          JSON.stringify({
            error: 'Image generation failed',
            details: pollData.error || 'Generation was canceled or failed',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      attempts++;
    }

    // Timeout
    return new Response(
      JSON.stringify({
        error: 'Image generation timeout',
        details: 'Generation took too long. Please try again.',
      }),
      {
        status: 504,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error in generate endpoint:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate image',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
