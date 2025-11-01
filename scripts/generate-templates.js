// Script to generate the 20 iconic pose template images using Replicate
// Run with: node scripts/generate-templates.js

import fs from 'fs';

// Load iconic poses
const iconicPoses = JSON.parse(fs.readFileSync('./iconic-poses.json', 'utf8'));

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN not found in environment variables!');
  console.error('Please set it with: export REPLICATE_API_TOKEN=your_token');
  process.exit(1);
}

// Use FLUX Pro for high-quality template generation
const FLUX_PRO_VERSION = '1119216b4bc8a63426da2c56c68dfc24bf0a6b20951d698ef73ea65aa17ad4c2';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

async function generateTemplateImage(pose) {
  console.log(`\n🎨 Generating template for: ${pose.name}`);
  console.log(`📝 Prompt: ${pose.prompt}`);

  try {
    // Create prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: FLUX_PRO_VERSION,
        input: {
          prompt: pose.prompt,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90,
          num_outputs: 1,
        }
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`HTTP ${createResponse.status}: ${createResponse.statusText}`);
    }

    const prediction = await createResponse.json();
    console.log(`⏳ Prediction created: ${prediction.id}`);

    // Poll for completion
    const pollUrl = prediction.urls.get;
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
      });

      const pollData = await pollResponse.json();
      console.log(`  Poll ${attempts + 1}/${MAX_POLL_ATTEMPTS}: ${pollData.status}`);

      if (pollData.status === 'succeeded') {
        const imageUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
        console.log(`✅ Generated: ${imageUrl}`);
        return imageUrl;
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        throw new Error(`Generation failed: ${pollData.error || 'Unknown error'}`);
      }

      attempts++;
    }

    throw new Error('Generation timeout');

  } catch (error) {
    console.error(`❌ Error generating ${pose.name}:`, error.message);
    return null;
  }
}

async function generateAllTemplates() {
  console.log('🚀 Starting template generation for all poses...');
  console.log(`📊 Total poses to generate: ${iconicPoses.poses.length}\n`);

  const results = [];

  for (const pose of iconicPoses.poses) {
    const imageUrl = await generateTemplateImage(pose);

    results.push({
      id: pose.id,
      name: pose.name,
      templateUrl: imageUrl,
      thumbnailUrl: imageUrl, // Same URL for now - could resize separately
    });

    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save results
  const outputFile = './generated-template-urls.json';
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  console.log(`\n✅ Done! Generated ${results.length} templates`);
  console.log(`📄 URLs saved to: ${outputFile}`);
  console.log('\nNext steps:');
  console.log('1. Review the generated images');
  console.log('2. Update iconic-poses.json with the new URLs');
  console.log('3. Deploy to production');

  // Print summary
  console.log('\n📊 Summary:');
  console.log(`Total: ${results.length}`);
  console.log(`Success: ${results.filter(r => r.templateUrl).length}`);
  console.log(`Failed: ${results.filter(r => !r.templateUrl).length}`);
}

// Run the generator
generateAllTemplates().catch(console.error);
