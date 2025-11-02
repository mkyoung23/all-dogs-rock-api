// api/remove-background.js
// Removes background from uploaded pet photos using remove.bg API

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { imageUrl, imageData } = await req.json();

    if (!imageUrl && !imageData) {
      return new Response(
        JSON.stringify({ error: 'Either imageUrl or imageData is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if remove.bg API key is configured
    if (!process.env.REMOVEBG_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Remove.bg API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Removing background from image...');

    // Prepare form data for remove.bg API
    const formData = new FormData();

    if (imageUrl) {
      formData.append('image_url', imageUrl);
    } else {
      // If imageData is provided (base64), convert to blob
      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      formData.append('image_file', blob, 'image.png');
    }

    formData.append('size', 'auto');
    formData.append('format', 'png');

    // Call remove.bg API
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
      },
      body: formData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error('Remove.bg API error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to remove background',
          details: errorText,
        }),
        {
          status: removeBgResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the processed image as blob
    const imageBlob = await removeBgResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );
    const resultImageData = `data:image/png;base64,${base64Image}`;

    console.log('Background removed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        imageData: resultImageData,
        message: 'Background removed successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error removing background:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to remove background',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
