// API route to serve the list of iconic poses for the gallery
import iconicPoses from '../../iconic-poses.json' assert { type: 'json' };

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

  // Return the full poses list
  return res.status(200).json({
    success: true,
    poses: iconicPoses.poses,
    totalPoses: iconicPoses.poses.length,
  });
}
