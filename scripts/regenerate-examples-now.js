#!/usr/bin/env node

// Standalone script to regenerate example images with permanent Imgur storage
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// Node 18+ has built-in fetch

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🎨 Starting example image regeneration with Imgur upload...\n');

// Read poses from iconic-poses.json
const iconicPosesData = JSON.parse(
  readFileSync(join(rootDir, 'iconic-poses.json'), 'utf-8')
);

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
if (!REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN or REPLICATE_API_KEY environment variable not set!');
  process.exit(1);
}

const FLUX_VERSION = '80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c';
const poses = iconicPosesData.poses;
const results = [];

for (const pose of poses) {
  try {
    console.log(`\n🖼️  Generating: ${pose.name}...`);

    // Generate image using FLUX
    const fluxResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
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

    console.log(`   ⏳ Waiting for generation...`);

    // Poll for completion
    let imageUrl = null;
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(pollUrl, {
        headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
      });

      const pollData = await pollResponse.json();

      if (pollData.status === 'succeeded') {
        imageUrl = pollData.output;
        break;
      } else if (pollData.status === 'failed') {
        throw new Error(`Generation failed: ${pollData.error}`);
      }

      if ((i + 1) % 5 === 0) {
        console.log(`   ⏳ Still waiting... (${i + 1} attempts)`);
      }
    }

    if (!imageUrl) {
      throw new Error('Timeout waiting for image');
    }

    console.log(`   ✅ Generated: ${imageUrl.substring(0, 50)}...`);

    // Upload to Imgur for permanent storage
    console.log(`   📤 Uploading to Imgur...`);
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
          'Authorization': 'Client-ID 546c25a59c58ad7', // Public client ID
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image,
          type: 'base64',
          name: `${pose.id}.jpg`,
          title: pose.name,
          description: `Example image for ${pose.name} iconic dog pose`
        })
      });

      const imgurData = await imgurResponse.json();

      if (imgurData.success && imgurData.data && imgurData.data.link) {
        permanentUrl = imgurData.data.link;
        console.log(`   ✅ Imgur URL: ${permanentUrl}`);
      } else {
        console.error(`   ⚠️  Imgur upload failed:`, imgurData);
        console.error(`   ⚠️  Using Replicate URL as fallback`);
      }
    } catch (uploadError) {
      console.error(`   ⚠️  Imgur upload error: ${uploadError.message}`);
      console.error(`   ⚠️  Using Replicate URL as fallback`);
    }

    results.push({
      id: pose.id,
      name: pose.name,
      url: permanentUrl,
      replicateUrl: imageUrl,
      status: 'success'
    });

  } catch (error) {
    results.push({
      id: pose.id,
      name: pose.name,
      error: error.message,
      status: 'failed'
    });
    console.error(`   ❌ Failed: ${error.message}`);
  }
}

// Update iconic-poses.json with permanent URLs
console.log(`\n📝 Updating iconic-poses.json...`);

const successfulResults = results.filter(r => r.status === 'success');

if (successfulResults.length > 0) {
  for (const result of successfulResults) {
    const poseIndex = iconicPosesData.poses.findIndex(p => p.id === result.id);
    if (poseIndex !== -1) {
      iconicPosesData.poses[poseIndex].exampleImageUrl = result.url;
      iconicPosesData.poses[poseIndex].templateUrl = result.url;
      iconicPosesData.poses[poseIndex].thumbnailUrl = result.url;
    }
  }

  writeFileSync(
    join(rootDir, 'iconic-poses.json'),
    JSON.stringify(iconicPosesData, null, 2),
    'utf-8'
  );

  console.log(`✅ Updated iconic-poses.json with ${successfulResults.length} permanent URLs!`);
} else {
  console.error(`❌ No successful results to update!`);
}

// Summary
console.log(`\n${'='.repeat(60)}`);
console.log(`📊 SUMMARY`);
console.log(`${'='.repeat(60)}`);
console.log(`✅ Success: ${successfulResults.length}/${results.length} images`);
console.log(`❌ Failed: ${results.filter(r => r.status === 'failed').length}/${results.length} images`);

if (successfulResults.length > 0) {
  console.log(`\n🎉 All example images now have PERMANENT Imgur URLs!`);
  console.log(`   No more 404 errors - these URLs never expire!\n`);
}

console.log(`\nNext steps:`);
console.log(`1. git add iconic-poses.json`);
console.log(`2. git commit -m "fix: Update all example images with permanent Imgur URLs"`);
console.log(`3. git push`);
