// api/index.js
// Landing page for All Dogs Rock API

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const baseUrl = url.origin;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Dogs Rock API - Custom Pet Image Editor</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      line-height: 1.6;
    }

    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
    }

    .hero-content {
      max-width: 800px;
      background: rgba(255, 255, 255, 0.95);
      padding: 60px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    h1 {
      font-size: 3em;
      margin-bottom: 20px;
      color: #667eea;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .subtitle {
      font-size: 1.4em;
      color: #666;
      margin-bottom: 40px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 40px 0;
      text-align: left;
    }

    .feature {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #667eea;
    }

    .feature h3 {
      color: #667eea;
      margin-bottom: 10px;
      font-size: 1.1em;
    }

    .feature p {
      color: #666;
      font-size: 0.95em;
    }

    .cta-buttons {
      margin-top: 40px;
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 18px 40px;
      border: none;
      border-radius: 50px;
      font-size: 1.1em;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s;
      display: inline-block;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 3px solid #667eea;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }

    .api-info {
      margin-top: 50px;
      padding: 30px;
      background: #f8f9fa;
      border-radius: 10px;
      text-align: left;
    }

    .api-info h2 {
      color: #667eea;
      margin-bottom: 20px;
    }

    .endpoint {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      border-left: 4px solid #764ba2;
    }

    .endpoint code {
      background: #f1f3f5;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      color: #d63384;
    }

    .method {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85em;
      margin-right: 10px;
    }

    .method-get {
      background: #28a745;
      color: white;
    }

    .method-post {
      background: #007bff;
      color: white;
    }

    footer {
      text-align: center;
      padding: 30px;
      color: white;
      font-size: 0.9em;
    }

    .emoji {
      font-size: 1.3em;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="hero-content">
      <h1><span class="emoji">🐕</span> All Dogs Rock API</h1>
      <p class="subtitle">
        Create stunning custom pet images with AI-powered background removal and professional templates
      </p>

      <div class="features">
        <div class="feature">
          <h3><span class="emoji">✂️</span> Background Removal</h3>
          <p>Automatically remove backgrounds from pet photos</p>
        </div>
        <div class="feature">
          <h3><span class="emoji">🖼️</span> Template Gallery</h3>
          <p>Choose from beautiful pre-made templates</p>
        </div>
        <div class="feature">
          <h3><span class="emoji">🎨</span> Real-time Editor</h3>
          <p>Adjust size and position with live preview</p>
        </div>
        <div class="feature">
          <h3><span class="emoji">⚡</span> Fast API</h3>
          <p>Edge-optimized for global performance</p>
        </div>
      </div>

      <div class="cta-buttons">
        <a href="${baseUrl}/api/editor" class="btn btn-primary">
          <span class="emoji">🎨</span> Try the Editor
        </a>
        <a href="${baseUrl}/api/upload" class="btn btn-secondary">
          <span class="emoji">📤</span> Upload Photos
        </a>
      </div>

      <div class="api-info">
        <h2><span class="emoji">📚</span> API Endpoints</h2>

        <div class="endpoint">
          <span class="method method-get">GET</span>
          <code>/api/editor</code>
          <p>Interactive photo editor interface</p>
        </div>

        <div class="endpoint">
          <span class="method method-post">POST</span>
          <code>/api/remove-background</code>
          <p>Remove background from images</p>
        </div>

        <div class="endpoint">
          <span class="method method-post">POST</span>
          <code>/api/composite</code>
          <p>Composite pet image with template</p>
        </div>

        <div class="endpoint">
          <span class="method method-post">POST</span>
          <code>/api/process-pet-image</code>
          <p>Complete workflow: upload → remove bg → composite</p>
        </div>

        <div class="endpoint">
          <span class="method method-get">GET</span>
          <code>/api/templates</code>
          <p>List all available templates</p>
        </div>

        <div class="endpoint">
          <span class="method method-post">POST</span>
          <code>/api/upload</code>
          <p>Upload pet photos</p>
        </div>

        <div class="endpoint">
          <span class="method method-post">POST</span>
          <code>/api/generate</code>
          <p>AI-generated backgrounds (DALL-E)</p>
        </div>

        <div class="endpoint">
          <span class="method method-post">POST</span>
          <code>/api/customily/apply</code>
          <p>Apply to Customily product templates</p>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 10px; border-left: 4px solid #ffc107;">
        <strong><span class="emoji">📖</span> Documentation:</strong>
        <p style="margin-top: 10px;">Check the <a href="https://github.com/your-repo" style="color: #667eea; font-weight: 600;">GitHub README</a> for complete API documentation and integration examples.</p>
      </div>
    </div>
  </div>

  <footer>
    <p>Made with <span class="emoji">❤️</span> for pet lovers everywhere</p>
    <p style="margin-top: 10px; opacity: 0.8;">Powered by remove.bg, OpenAI, and Vercel Edge Functions</p>
  </footer>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
