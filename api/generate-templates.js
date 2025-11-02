// API endpoint to generate all 20 template images using DALL-E 3
// This runs on Vercel where the OpenAI API key is available in environment variables

import iconicPoses from '../iconic-poses.json' assert { type: 'json' };

export const config = {
  maxDuration: 300, // 5 minutes max
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'OpenAI API key not configured'
    });
  }

  const { poseId, batchMode } = req.body;

  try {
    // If batchMode, generate all 20
    if (batchMode) {
      const results = [];

      for (const pose of iconicPoses.poses) {
        try {
          console.log(`Generating template for ${pose.name}...`);

          const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: pose.prompt,
              n: 1,
              size: '1024x1024',
              quality: 'hd',
            }),
          });

          const data = await response.json();

          if (data.error) {
            console.error(`Error generating ${pose.name}:`, data.error);
            results.push({
              poseId: pose.id,
              name: pose.name,
              success: false,
              error: data.error.message,
            });
          } else if (data.data && data.data[0] && data.data[0].url) {
            const imageUrl = data.data[0].url;
            console.log(`✅ Generated ${pose.name}: ${imageUrl}`);

            results.push({
              poseId: pose.id,
              name: pose.name,
              success: true,
              url: imageUrl,
            });
          } else {
            results.push({
              poseId: pose.id,
              name: pose.name,
              success: false,
              error: 'No image URL in response',
            });
          }

          // Wait 2 seconds between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`Error generating ${pose.name}:`, error);
          results.push({
            poseId: pose.id,
            name: pose.name,
            success: false,
            error: error.message,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;

      return res.status(200).json({
        success: true,
        message: `Generated ${successCount}/${iconicPoses.poses.length} templates`,
        results,
      });
    }

    // Single pose generation
    const pose = iconicPoses.poses.find(p => p.id === poseId);

    if (!pose) {
      return res.status(404).json({
        success: false,
        error: 'Pose not found'
      });
    }

    console.log(`Generating template for ${pose.name}...`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: pose.prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({
        success: false,
        error: data.error.message,
      });
    }

    if (data.data && data.data[0] && data.data[0].url) {
      const imageUrl = data.data[0].url;

      return res.status(200).json({
        success: true,
        poseId: pose.id,
        name: pose.name,
        url: imageUrl,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'No image URL in response',
    });

  } catch (error) {
    console.error('Error generating template:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
