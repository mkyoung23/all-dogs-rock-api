export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    message: 'app-proxy path is working!',
    timestamp: new Date().toISOString(),
    endpoint: '/api/app-proxy/test',
    note: 'If you see this, the generate endpoint should work too'
  });
}
