#!/usr/bin/env node

/**
 * Generate example images for all 20 iconic poses
 * This creates preview images showing what each pose looks like with a dog
 * Run: node scripts/generate-examples.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const FLUX_VERSION = '80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

async function generateExample(pose) {
  console.log(`\n🎨 Generating example for: ${pose.name}`);

  const requestBody = {
    version: FLUX_VERSION,
    input: {
      prompt: pose.prompt,
      aspect_ratio: '1:1',
      output_format: 'jpg',
      output_quality: 90,
      safety_tolerance: 2,
      prompt_upsampling: true
    }
  };

  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    console.error(`❌ Failed to start: ${JSON.stringify(errorData)}`);
    return null;
  }

  const prediction = await createResponse.json();
  console.log(`   Prediction ID: ${prediction.id}`);

  // Poll for completion
  const pollUrl = prediction.urls.get;
  let attempts = 0;

  while (attempts < 60) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pollResponse = await fetch(pollUrl, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });

    if (!pollResponse.ok) {
      console.error('❌ Failed to poll');
      return null;
    }

    const pollData = await pollResponse.json();

    if (pollData.status === 'succeeded') {
      console.log(`   ✅ Generated: ${pollData.output}`);
      return pollData.output;
    }

    if (pollData.status === 'failed' || pollData.status === 'canceled') {
      console.error(`   ❌ Failed: ${pollData.error}`);
      return null;
    }

    process.stdout.write('.');
    attempts++;
  }

  console.error('   ❌ Timeout');
  return null;
}

async function generateAll() {
  console.log('🚀 Generating example images for all 20 iconic poses...\n');
  console.log('This will take approximately 2-3 minutes (6-8 seconds per image)\n');

  const results = [];

  for (const pose of iconicPoses.poses) {
    const imageUrl = await generateExample(pose);

    if (imageUrl) {
      results.push({
        id: pose.id,
        name: pose.name,
        exampleImageUrl: imageUrl
      });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n✅ COMPLETE! Generated ' + results.length + ' example images\n');
  console.log('Results:');
  results.forEach(r => {
    console.log(`  ${r.name}: ${r.exampleImageUrl}`);
  });

  // Save results to file
  writeFileSync(
    'example-images.json',
    JSON.stringify({ examples: results }, null, 2)
  );

  console.log('\n💾 Saved to example-images.json');
  console.log('\n📝 Next steps:');
  console.log('   1. Update iconic-poses.json to add exampleImageUrl to each pose');
  console.log('   2. Update UI to use exampleImageUrl instead of templateUrl');
  console.log('   3. Redeploy to Vercel');
}

generateAll().catch(console.error);
