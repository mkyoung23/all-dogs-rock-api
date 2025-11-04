// Regenerate all example dog images and upload to Imgur for permanent storage
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'Missing REPLICATE_API_TOKEN' });
  }

  // Read poses from iconic-poses.json to use CORRECT prompts (without breed forcing)
  const iconicPosesData = JSON.parse(
    readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
  );

  const FLUX_VERSION = '80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c';
  const poses = iconicPosesData.poses;

  const results = [];

  for (const pose of poses) {
    try {
      console.log(`Generating ${pose.name}...`);

      const fluxResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: FLUX_VERSION,
          input: {
            prompt: pose.prompt,
            aspect_ratio: '1:1',
            output_format: 'jpg',
            output_quality: 90,
            safety_tolerance: 2,
            prompt_upsampling: true
          }
        }),
      });

      if (!fluxResponse.ok) {
        throw new Error(`FLUX API error: ${fluxResponse.status}`);
      }

      const prediction = await fluxResponse.json();
      const pollUrl = prediction.urls.get;

      // Poll for completion
      let imageUrl = null;
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pollResponse = await fetch(pollUrl, {
          headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
        });

        const pollData = await pollResponse.json();

        if (pollData.status === 'succeeded') {
          imageUrl = pollData.output;
          break;
        } else if (pollData.status === 'failed') {
          throw new Error(`Generation failed: ${pollData.error}`);
        }
      }

      if (!imageUrl) {
        throw new Error('Timeout waiting for image');
      }

      // Upload to Imgur for permanent storage
      console.log(`📤 Uploading ${pose.name} to Imgur...`);
      let permanentUrl = imageUrl; // Fallback to Replicate URL

      try {
        // Download image from Replicate
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        // Upload to Imgur (anonymous upload, free, permanent)
        const imgurResponse = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            'Authorization': 'Client-ID 546c25a59c58ad7', // Public client ID for anonymous uploads
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: base64Image,
            type: 'base64',
            name: `${pose.id}.jpg`,
            title: pose.name
          })
        });

        const imgurData = await imgurResponse.json();

        if (imgurData.success && imgurData.data && imgurData.data.link) {
          permanentUrl = imgurData.data.link;
          console.log(`✅ Uploaded to Imgur: ${permanentUrl}`);
        } else {
          console.error(`⚠️ Imgur upload failed, using Replicate URL`);
        }
      } catch (uploadError) {
        console.error(`⚠️ Imgur upload error: ${uploadError.message}`);
      }

      results.push({
        id: pose.id,
        name: pose.name,
        url: permanentUrl,
        replicateUrl: imageUrl,
        status: 'success'
      });

      console.log(`✅ ${pose.name}: ${permanentUrl}`);

    } catch (error) {
      results.push({
        id: pose.id,
        name: pose.name,
        error: error.message,
        status: 'failed'
      });
      console.error(`❌ ${pose.name}: ${error.message}`);
    }
  }

  // Update iconic-poses.json with permanent URLs
  try {
    const successfulResults = results.filter(r => r.status === 'success');

    if (successfulResults.length > 0) {
      console.log(`\n📝 Updating iconic-poses.json with ${successfulResults.length} permanent URLs...`);

      // Update poses with new URLs
      for (const result of successfulResults) {
        const poseIndex = iconicPosesData.poses.findIndex(p => p.id === result.id);
        if (poseIndex !== -1) {
          iconicPosesData.poses[poseIndex].exampleImageUrl = result.url;
          iconicPosesData.poses[poseIndex].templateUrl = result.url;
          iconicPosesData.poses[poseIndex].thumbnailUrl = result.url;
        }
      }

      // Write updated file
      writeFileSync(
        join(process.cwd(), 'iconic-poses.json'),
        JSON.stringify(iconicPosesData, null, 2),
        'utf-8'
      );

      console.log(`✅ iconic-poses.json updated with permanent Imgur URLs!`);
    }
  } catch (updateError) {
    console.error(`⚠️ Failed to update iconic-poses.json: ${updateError.message}`);
  }

  return res.status(200).json({
    results,
    message: `Generated ${results.filter(r => r.status === 'success').length}/${results.length} images`,
    updatedFile: results.filter(r => r.status === 'success').length > 0
  });
}
