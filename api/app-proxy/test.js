// Simple test endpoint without HMAC verification
export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
  });
}
