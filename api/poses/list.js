// API route to serve the list of iconic poses for the gallery
// Updated to read file at runtime to avoid build-time caching

import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read poses from file at RUNTIME (not build time) to avoid caching
  const iconicPoses = JSON.parse(
    readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
  );

  // Return the full poses list
  return res.status(200).json({
    success: true,
    poses: iconicPoses.poses,
    totalPoses: iconicPoses.poses.length,
  });
}
