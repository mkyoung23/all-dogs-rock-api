#!/usr/bin/env node

/**
 * Generate example images for key iconic poses
 * This creates preview images showing what each pose looks like with a dog
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const FLUX_VERSION = '80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

async function pollPrediction(getUrl) {
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await fetch(getUrl, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to poll');
    }

    const data = await response.json();

    if (data.status === 'succeeded') {
      return data.output;
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Generation failed: ${data.error}`);
    }

    process.stdout.write('.');
  }

  throw new Error('Timeout');
}

async function generateExample(pose) {
  console.log(`\n🎨 Generating: ${pose.name}`);

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
    console.error(`   ❌ Failed: ${JSON.stringify(errorData)}`);
    return null;
  }

  const prediction = await createResponse.json();
  console.log(`   ID: ${prediction.id}`);
  process.stdout.write('   Waiting');

  try {
    const imageUrl = await pollPrediction(prediction.urls.get);
    console.log(`\n   ✅ ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.log(`\n   ❌ ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Generating example images for top 5 poses...\n');

  // Generate top 5 most popular poses
  const topPoses = iconicPoses.poses.filter(p =>
    ['rocky-statue', 'mj-free-throw-dunk', 'einstein-tongue', 'mona-lisa', 'superman-flying'].includes(p.id)
  );

  const results = [];

  for (const pose of topPoses) {
    const imageUrl = await generateExample(pose);

    if (imageUrl) {
      results.push({
        id: pose.id,
        name: pose.name,
        imageUrl: imageUrl
      });
    }
  }

  console.log('\n\n✅ Generated ' + results.length + ' examples');
  console.log(JSON.stringify(results, null, 2));

  // Save results
  writeFileSync('example-images-generated.json', JSON.stringify({ examples: results }, null, 2));
  console.log('\n💾 Saved to example-images-generated.json');
}

main().catch(console.error);
