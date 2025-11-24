import Replicate from "replicate";

// We don't need fs/iconic-poses here if we pass the prompt from frontend
// helping to avoid file read errors in Serverless

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || process.env.NEW_REPLICATE_API_KEY,
});

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { dogPhoto, prompt, poseId } = req.body;

    // Simple prompt construction to be safe
    // This ensures we use the text if poseId lookup fails
    let finalPrompt = prompt;
    
    if (!finalPrompt) {
        // Fallback logic if only ID is sent
        if (poseId === 'santa-paws') finalPrompt = "Santa Claus dog, festive holiday background";
        else if (poseId === 'washington') finalPrompt = "George Washington crossing the Delaware river, dog as general";
        else finalPrompt = "A dog in an iconic scene";
    }

    // ✅ THE MAGIC PROMPT (From your code)
    // Preserves identity while transforming scene
    const enhancedPrompt = `Transform this dog into the following scene: ${finalPrompt}. CRITICAL: Keep the EXACT same dog breed, fur color, facial features, and markings from the reference image. Only change the clothing, pose, and background to match the iconic scene. Professional photo quality, highly detailed, 8k resolution.`;

    console.log('🚀 Starting FLUX Kontext Generation...');

    // START PREDICTION (Async - Returns ID immediately)
    const prediction = await replicate.predictions.create({
      version: "569705b35f79b1160d51de1d0e3955626af86c77a034a16e89010dbdde5ad312", // ✅ YOUR FLUX ID
      input: {
        input_image: dogPhoto, 
        prompt: enhancedPrompt,
        output_format: "png",
      }
    });

    // Return ID immediately (Stops Vercel Timeout!)
    res.status(201).json({ id: prediction.id, status: prediction.status });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}
