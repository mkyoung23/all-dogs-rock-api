// Simple health check endpoint to verify deployment
export default async function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running - deployment successful',
    hasReplicateToken: !!process.env.REPLICATE_API_TOKEN
  });
}
