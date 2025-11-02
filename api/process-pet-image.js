// api/process-pet-image.js
// Complete workflow: Upload pet photo → Remove background → Composite into template

export const config = {
  runtime: 'edge',
  maxDuration: 60, // Allow up to 60 seconds for processing
};

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { petImageUrl, petImageData, templateName, position, size } = await req.json();

    if (!petImageUrl && !petImageData) {
      return new Response(
        JSON.stringify({ error: 'Pet image URL or data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const baseUrl = url.origin;

    console.log('Starting complete pet image processing workflow...');

    // Step 1: Remove background from pet photo
    console.log('Step 1: Removing background...');
    const bgRemovalResponse = await fetch(`${baseUrl}/api/remove-background`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: petImageUrl,
        imageData: petImageData,
      }),
    });

    if (!bgRemovalResponse.ok) {
      const error = await bgRemovalResponse.json();
      return new Response(
        JSON.stringify({
          error: 'Background removal failed',
          details: error,
        }),
        { status: bgRemovalResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bgRemovalResult = await bgRemovalResponse.json();
    const petNoBgImage = bgRemovalResult.imageData;

    console.log('Background removed successfully');

    // Step 2: Get template image
    console.log('Step 2: Loading template...');
    const template = templateName || 'default';
    const templateUrl = `${baseUrl}/api/templates/${template}`;

    // Step 3: Composite pet image onto template
    console.log('Step 3: Compositing images...');
    const compositeResponse = await fetch(`${baseUrl}/api/composite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petImageData: petNoBgImage,
        templateImageUrl: templateUrl,
        position: position || { x: 0.5, y: 0.5 },
        size: size || { width: 0.6, height: 0.6 },
      }),
    });

    if (!compositeResponse.ok) {
      const error = await compositeResponse.json();

      // If client-side compositing is suggested, return that info
      if (error.clientComposite) {
        return new Response(
          JSON.stringify({
            success: true,
            workflow: 'client-side',
            petImageNoBg: petNoBgImage,
            templateUrl: templateUrl,
            position: position || { x: 0.5, y: 0.5 },
            size: size || { width: 0.6, height: 0.6 },
            message: 'Background removed. Use client-side compositing.',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'Image compositing failed',
          details: error,
        }),
        { status: compositeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const compositeResult = await compositeResponse.json();

    console.log('Pet image processing completed successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        workflow: 'server-side',
        finalImage: compositeResult.imageData || compositeResult.imageUrl,
        petImageNoBg: petNoBgImage,
        templateUsed: template,
        message: 'Pet image processed and composited successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pet image processing workflow:', error);
    return new Response(
      JSON.stringify({
        error: 'Workflow failed',
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
