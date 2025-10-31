// Test endpoint to verify Replicate API token and connection
// Access at: /api/test-replicate

export default async function handler(req, res) {
  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🧪 Testing Replicate API connection...');

    // Check if token exists
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'REPLICATE_API_TOKEN not found in environment variables',
        tokenExists: false
      });
    }

    const token = process.env.REPLICATE_API_TOKEN;
    console.log('✅ Token exists, length:', token.length);
    console.log('Token starts with:', token.substring(0, 10) + '...');

    // Test token by making a simple API call
    console.log('📡 Testing token with Replicate API...');

    const testResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', testResponse.status);

    if (testResponse.status === 401) {
      return res.status(200).json({
        success: false,
        error: 'Replicate API token is INVALID - 401 Unauthorized',
        tokenExists: true,
        tokenValid: false,
        tokenPrefix: token.substring(0, 10),
        recommendation: 'Get a new token from https://replicate.com/account/api-tokens'
      });
    }

    if (testResponse.status === 403) {
      return res.status(200).json({
        success: false,
        error: 'Replicate API token does not have permission',
        tokenExists: true,
        tokenValid: false,
        recommendation: 'Check token permissions at https://replicate.com/account/api-tokens'
      });
    }

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return res.status(200).json({
        success: false,
        error: `Replicate API returned ${testResponse.status}`,
        tokenExists: true,
        tokenValid: false,
        details: errorText
      });
    }

    // Token is valid!
    return res.status(200).json({
      success: true,
      message: '✅ Replicate API token is VALID and working!',
      tokenExists: true,
      tokenValid: true,
      tokenPrefix: token.substring(0, 10),
      apiStatus: 'Connected'
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
}
