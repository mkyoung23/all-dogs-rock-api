#!/usr/bin/env node

/**
 * Download DALL-E 3 generated images and re-host them permanently
 *
 * DALL-E 3 URLs expire after ~1 hour, so we need to:
 * 1. Download each image
 * 2. Upload to permanent storage (Vercel Blob, Cloudinary, S3, etc.)
 * 3. Update iconic-poses.json with permanent URLs
 *
 * Usage:
 * node scripts/download-and-rehost.js [--storage=vercel|cloudinary|s3]
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONIC_POSES_PATH = path.join(__dirname, '..', 'iconic-poses.json');
const DOWNLOAD_DIR = path.join(__dirname, '..', 'downloaded-templates');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (error) => {
        fs.unlink(filepath, () => {}); // Delete incomplete file
        reject(error);
      });
    }).on('error', reject);
  });
}

async function downloadAllTemplates() {
  // Read iconic poses
  const iconicPoses = JSON.parse(fs.readFileSync(ICONIC_POSES_PATH, 'utf8'));

  // Create download directory
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  console.log('📥 Downloading all template images...\n');
  console.log(`Download directory: ${DOWNLOAD_DIR}\n`);

  const results = [];

  for (const pose of iconicPoses.poses) {
    const filename = `${pose.id}.png`;
    const filepath = path.join(DOWNLOAD_DIR, filename);

    try {
      console.log(`Downloading ${pose.name}...`);
      console.log(`URL: ${pose.templateUrl.substring(0, 60)}...`);

      await downloadImage(pose.templateUrl, filepath);

      const stats = fs.statSync(filepath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ Saved: ${filename} (${sizeMB} MB)\n`);

      results.push({
        poseId: pose.id,
        name: pose.name,
        filename: filename,
        filepath: filepath,
        size: stats.size,
        success: true,
      });

    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);

      results.push({
        poseId: pose.id,
        name: pose.name,
        success: false,
        error: error.message,
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const totalSize = results.reduce((sum, r) => sum + (r.size || 0), 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  console.log('================================================');
  console.log('📥 DOWNLOAD COMPLETE!');
  console.log('================================================');
  console.log(`✅ Downloaded: ${successCount}/${iconicPoses.poses.length}`);
  console.log(`💾 Total size: ${totalSizeMB} MB`);
  console.log(`📁 Location: ${DOWNLOAD_DIR}`);

  console.log('\n📤 Next Steps:');
  console.log('\n1. Upload to permanent storage:');
  console.log('   - Vercel Blob: https://vercel.com/docs/storage/vercel-blob');
  console.log('   - Cloudinary: https://cloudinary.com');
  console.log('   - AWS S3: https://aws.amazon.com/s3/');
  console.log('   - Shopify Files: Upload via Shopify admin');
  console.log('\n2. Update iconic-poses.json with permanent URLs');
  console.log('   Use: node scripts/update-template-urls.js <urls.json>');
  console.log('\n3. Commit and deploy');

  // Save download manifest
  const manifest = {
    downloadedAt: new Date().toISOString(),
    downloadDir: DOWNLOAD_DIR,
    totalImages: iconicPoses.poses.length,
    successful: successCount,
    totalSize: totalSize,
    results: results,
  };

  const manifestPath = path.join(DOWNLOAD_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Manifest saved: ${manifestPath}`);

  return results;
}

// Auto-upload helpers (optional - requires additional setup)

async function uploadToVercelBlob(files) {
  console.log('\n📤 Uploading to Vercel Blob...');
  console.log('⚠️  Requires @vercel/blob package and BLOB_READ_WRITE_TOKEN');
  console.log('Install: npm install @vercel/blob');
  console.log('Set token: export BLOB_READ_WRITE_TOKEN="your-token"');

  // Implementation would go here
  // const { put } = await import('@vercel/blob');
  // for (const file of files) {
  //   const blob = await put(file.filename, fs.readFileSync(file.filepath), {
  //     access: 'public',
  //   });
  //   console.log(`✅ Uploaded: ${blob.url}`);
  // }
}

async function uploadToCloudinary(files) {
  console.log('\n📤 Uploading to Cloudinary...');
  console.log('⚠️  Requires cloudinary package and credentials');
  console.log('Install: npm install cloudinary');
  console.log('Set env: CLOUDINARY_URL="cloudinary://..."');

  // Implementation would go here
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Download and Re-host Template Images\n');
  console.log('Usage:');
  console.log('  node scripts/download-and-rehost.js');
  console.log('  node scripts/download-and-rehost.js --storage=vercel');
  console.log('  node scripts/download-and-rehost.js --storage=cloudinary\n');
  console.log('This will:');
  console.log('  1. Download all 20 template images from DALL-E URLs');
  console.log('  2. Save them locally to downloaded-templates/');
  console.log('  3. (Optional) Upload to permanent storage');
  console.log('  4. Generate manifest.json with file info\n');
  process.exit(0);
}

downloadAllTemplates()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
