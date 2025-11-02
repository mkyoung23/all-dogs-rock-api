#!/usr/bin/env node

/**
 * Script to update iconic-poses.json with real template URLs
 *
 * Usage:
 * 1. First generate templates: Open generate-all-templates.html in browser and click generate
 * 2. Run this script with the JSON output: node scripts/update-template-urls.js
 *
 * Or provide a URL mapping JSON file:
 * node scripts/update-template-urls.js path/to/urls.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONIC_POSES_PATH = path.join(__dirname, '..', 'iconic-poses.json');

async function updateTemplateUrls(urlMapping) {
  // Read the current iconic-poses.json
  const iconicPoses = JSON.parse(fs.readFileSync(ICONIC_POSES_PATH, 'utf8'));

  let updatedCount = 0;
  let skippedCount = 0;

  // Update each pose with its new template URL
  iconicPoses.poses.forEach(pose => {
    if (urlMapping[pose.id]) {
      pose.templateUrl = urlMapping[pose.id];
      pose.thumbnailUrl = urlMapping[pose.id]; // Use same URL for thumbnail
      console.log(`✅ Updated ${pose.name}: ${urlMapping[pose.id].substring(0, 60)}...`);
      updatedCount++;
    } else {
      console.log(`⏭️  Skipped ${pose.name}: No URL provided`);
      skippedCount++;
    }
  });

  // Write back to file
  fs.writeFileSync(ICONIC_POSES_PATH, JSON.stringify(iconicPoses, null, 2));

  console.log('\n=== UPDATE COMPLETE ===');
  console.log(`✅ Updated: ${updatedCount} poses`);
  console.log(`⏭️  Skipped: ${skippedCount} poses`);
  console.log(`📁 File: ${ICONIC_POSES_PATH}`);
  console.log('\n🚀 Ready to commit and deploy!');
}

// If a JSON file is provided as argument, use it
if (process.argv[2]) {
  const urlsPath = process.argv[2];

  if (!fs.existsSync(urlsPath)) {
    console.error(`❌ Error: File not found: ${urlsPath}`);
    process.exit(1);
  }

  try {
    const urlMapping = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));
    await updateTemplateUrls(urlMapping);
  } catch (error) {
    console.error(`❌ Error reading JSON file: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log('📝 Usage:');
  console.log('1. Generate templates using: https://all-dogs-rock-api-v2.vercel.app/generate-all-templates.html');
  console.log('2. Copy the JSON output to a file (e.g., template-urls.json)');
  console.log('3. Run: node scripts/update-template-urls.js template-urls.json');
  console.log('\nOr paste the JSON mapping below and press Ctrl+D when done:');
  console.log('Example: {"basketball-dunk": "https://...", ...}');

  // Read from stdin
  let data = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', chunk => {
    data += chunk;
  });

  process.stdin.on('end', async () => {
    if (!data.trim()) {
      console.log('\n❌ No input provided. Exiting.');
      process.exit(1);
    }

    try {
      const urlMapping = JSON.parse(data);
      await updateTemplateUrls(urlMapping);
    } catch (error) {
      console.error(`❌ Error parsing JSON: ${error.message}`);
      process.exit(1);
    }
  });
}
