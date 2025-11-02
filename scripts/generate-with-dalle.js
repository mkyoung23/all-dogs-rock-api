#!/usr/bin/env node

/**
 * Generate all 20 template images using DALL-E 3
 * Requires: OPENAI_API_KEY environment variable
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONIC_POSES_PATH = path.join(__dirname, '..', 'iconic-poses.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'generated-template-urls.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is required');
  console.log('\nUsage:');
  console.log('export OPENAI_API_KEY="your-api-key-here"');
  console.log('node scripts/generate-with-dalle.js');
  process.exit(1);
}

async function generateImage(prompt) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  if (!data.data || !data.data[0] || !data.data[0].url) {
    throw new Error('No image URL in response');
  }

  return data.data[0].url;
}

async function generateAllTemplates() {
  // Read iconic poses
  const iconicPoses = JSON.parse(fs.readFileSync(ICONIC_POSES_PATH, 'utf8'));

  console.log('🎨 Generating all 20 template images with DALL-E 3');
  console.log('================================================\n');
  console.log(`Total poses: ${iconicPoses.poses.length}`);
  console.log('⏱️  Estimated time: ~40-60 seconds');
  console.log('💰 Estimated cost: ~$0.80 (20 × $0.04 HD images)\n');

  const results = [];
  const urlMapping = {};

  for (let i = 0; i < iconicPoses.poses.length; i++) {
    const pose = iconicPoses.poses[i];

    try {
      console.log(`\n[${i + 1}/20] Generating: ${pose.name}`);
      console.log(`Prompt: ${pose.prompt.substring(0, 80)}...`);

      const imageUrl = await generateImage(pose.prompt);

      console.log(`✅ Success: ${imageUrl.substring(0, 60)}...`);

      results.push({
        poseId: pose.id,
        name: pose.name,
        success: true,
        url: imageUrl,
      });

      urlMapping[pose.id] = imageUrl;

      // Wait 2 seconds between requests to avoid rate limiting
      if (i < iconicPoses.poses.length - 1) {
        process.stdout.write('⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        process.stdout.write(' Done\n');
      }

    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);

      results.push({
        poseId: pose.id,
        name: pose.name,
        success: false,
        error: error.message,
      });
    }
  }

  // Save results
  const output = {
    generatedAt: new Date().toISOString(),
    totalPoses: iconicPoses.poses.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results: results,
    urlMapping: urlMapping,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log('\n================================================');
  console.log('🎉 GENERATION COMPLETE!');
  console.log('================================================');
  console.log(`✅ Successful: ${output.successful}`);
  console.log(`❌ Failed: ${output.failed}`);
  console.log(`📁 Results saved to: ${OUTPUT_FILE}`);

  if (output.successful > 0) {
    console.log('\n📋 URL Mapping (copy this):');
    console.log(JSON.stringify(urlMapping, null, 2));

    console.log('\n🚀 Next steps:');
    console.log('1. Run: node scripts/update-template-urls.js generated-template-urls.json');
    console.log('2. Commit and push the updated iconic-poses.json');
    console.log('3. Deploy to Vercel');
  }

  return output;
}

// Run the generation
generateAllTemplates()
  .then(output => {
    process.exit(output.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
