// api/editor.js
// Interactive pet photo editor interface

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pet Photo Editor - All Dogs Rock</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    .header p {
      font-size: 1.1em;
      opacity: 0.9;
    }

    .main-content {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 0;
      min-height: 600px;
    }

    .sidebar {
      background: #f8f9fa;
      padding: 30px;
      border-right: 1px solid #e0e0e0;
    }

    .section {
      margin-bottom: 30px;
    }

    .section h3 {
      font-size: 1.1em;
      margin-bottom: 15px;
      color: #333;
    }

    .file-upload {
      position: relative;
      display: block;
      width: 100%;
      padding: 40px 20px;
      background: white;
      border: 3px dashed #667eea;
      border-radius: 10px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
    }

    .file-upload:hover {
      border-color: #764ba2;
      background: #f8f9ff;
    }

    .file-upload input {
      display: none;
    }

    .file-upload-text {
      font-size: 1em;
      color: #667eea;
      font-weight: 600;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .template-item {
      border: 3px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .template-item:hover {
      border-color: #667eea;
      transform: scale(1.05);
    }

    .template-item.selected {
      border-color: #764ba2;
      box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);
    }

    .template-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      display: block;
    }

    .template-name {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 8px;
      font-size: 0.85em;
      text-align: center;
    }

    .controls {
      margin-top: 15px;
    }

    .control-group {
      margin-bottom: 15px;
    }

    .control-group label {
      display: block;
      font-size: 0.9em;
      color: #666;
      margin-bottom: 5px;
    }

    .slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
      -webkit-appearance: none;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
    }

    .slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      border: none;
    }

    .btn {
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 8px;
      font-size: 1.1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 10px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #28a745;
      color: white;
    }

    .btn-secondary:hover {
      background: #218838;
    }

    .canvas-area {
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
    }

    #previewCanvas {
      max-width: 100%;
      max-height: 700px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      background: white;
    }

    .status {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .loading {
      display: none;
      text-align: center;
      padding: 20px;
    }

    .loading.show {
      display: block;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐕 Pet Photo Editor</h1>
      <p>Upload your pet's photo and create amazing custom images!</p>
    </div>

    <div class="main-content">
      <div class="sidebar">
        <div class="section">
          <h3>1. Upload Your Pet Photo</h3>
          <label class="file-upload">
            <input type="file" id="petPhoto" accept="image/*">
            <div class="file-upload-text">📷 Click to Upload Photo</div>
          </label>
        </div>

        <div class="section">
          <h3>2. Choose a Template</h3>
          <div class="templates-grid" id="templatesGrid">
            <div class="loading show">
              <div class="spinner"></div>
              <p>Loading templates...</p>
            </div>
          </div>
        </div>

        <div class="section controls" id="controls" style="display: none;">
          <h3>3. Adjust Your Pet</h3>

          <div class="control-group">
            <label>Size: <span id="sizeValue">60%</span></label>
            <input type="range" class="slider" id="sizeSlider" min="20" max="100" value="60">
          </div>

          <div class="control-group">
            <label>Position X: <span id="posXValue">50%</span></label>
            <input type="range" class="slider" id="posXSlider" min="0" max="100" value="50">
          </div>

          <div class="control-group">
            <label>Position Y: <span id="posYValue">50%</span></label>
            <input type="range" class="slider" id="posYSlider" min="0" max="100" value="50">
          </div>

          <button class="btn btn-primary" id="processBtn" disabled>
            ✨ Process Image
          </button>

          <button class="btn btn-secondary" id="downloadBtn" style="display: none;">
            💾 Download Image
          </button>
        </div>
      </div>

      <div class="canvas-area">
        <div id="statusArea" class="status">
          <h2>👈 Start by uploading your pet's photo</h2>
          <p>Then choose a template and adjust the position and size</p>
        </div>
        <div id="loadingArea" class="loading">
          <div class="spinner"></div>
          <p id="loadingText">Processing your image...</p>
        </div>
        <canvas id="previewCanvas" style="display: none;"></canvas>
      </div>
    </div>
  </div>

  <script>
    const petPhotoInput = document.getElementById('petPhoto');
    const templatesGrid = document.getElementById('templatesGrid');
    const previewCanvas = document.getElementById('previewCanvas');
    const ctx = previewCanvas.getContext('2d');
    const statusArea = document.getElementById('statusArea');
    const loadingArea = document.getElementById('loadingArea');
    const loadingText = document.getElementById('loadingText');
    const controls = document.getElementById('controls');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    const sizeSlider = document.getElementById('sizeSlider');
    const posXSlider = document.getElementById('posXSlider');
    const posYSlider = document.getElementById('posYSlider');
    const sizeValue = document.getElementById('sizeValue');
    const posXValue = document.getElementById('posXValue');
    const posYValue = document.getElementById('posYValue');

    let uploadedPetImage = null;
    let petImageNoBg = null;
    let selectedTemplate = null;
    let templateImage = null;

    // Load templates
    async function loadTemplates() {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();

        templatesGrid.innerHTML = '';
        data.templates.forEach(template => {
          const div = document.createElement('div');
          div.className = 'template-item';
          div.dataset.id = template.id;
          div.innerHTML = \`
            <img src="\${template.thumbnail}" alt="\${template.name}">
            <div class="template-name">\${template.name}</div>
          \`;
          div.onclick = () => selectTemplate(template.id, template.url);
          templatesGrid.appendChild(div);
        });
      } catch (error) {
        console.error('Failed to load templates:', error);
        templatesGrid.innerHTML = '<p style="color: red;">Failed to load templates</p>';
      }
    }

    function selectTemplate(id, url) {
      selectedTemplate = { id, url };
      document.querySelectorAll('.template-item').forEach(el => {
        el.classList.remove('selected');
      });
      document.querySelector(\`[data-id="\${id}"]\`).classList.add('selected');

      checkReadyToProcess();
    }

    petPhotoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedPetImage = e.target.result;
        checkReadyToProcess();

        const img = new Image();
        img.onload = () => {
          statusArea.innerHTML = '<h2>✅ Photo uploaded!</h2><p>Now select a template</p>';
        };
        img.src = uploadedPetImage;
      };
      reader.readAsDataURL(file);
    });

    function checkReadyToProcess() {
      if (uploadedPetImage && selectedTemplate) {
        processBtn.disabled = false;
        controls.style.display = 'block';
        statusArea.innerHTML = '<h2>🎨 Ready to create!</h2><p>Adjust settings and click "Process Image"</p>';
      }
    }

    // Slider updates
    sizeSlider.oninput = () => {
      sizeValue.textContent = sizeSlider.value + '%';
      if (petImageNoBg && templateImage) {
        renderComposite();
      }
    };
    posXSlider.oninput = () => {
      posXValue.textContent = posXSlider.value + '%';
      if (petImageNoBg && templateImage) {
        renderComposite();
      }
    };
    posYSlider.oninput = () => {
      posYValue.textContent = posYSlider.value + '%';
      if (petImageNoBg && templateImage) {
        renderComposite();
      }
    };

    processBtn.onclick = async () => {
      try {
        statusArea.style.display = 'none';
        loadingArea.classList.add('show');
        loadingText.textContent = 'Removing background from your pet photo...';
        processBtn.disabled = true;

        // Remove background
        const bgResponse = await fetch('/api/remove-background', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: uploadedPetImage }),
        });

        if (!bgResponse.ok) {
          throw new Error('Background removal failed');
        }

        const bgResult = await bgResponse.json();
        petImageNoBg = bgResult.imageData;

        loadingText.textContent = 'Loading template...';

        // Load template image
        templateImage = await loadImageFromUrl(selectedTemplate.url);

        loadingText.textContent = 'Compositing your image...';

        // Render composite
        await renderComposite();

        loadingArea.classList.remove('show');
        previewCanvas.style.display = 'block';
        downloadBtn.style.display = 'block';
        processBtn.textContent = '🔄 Reprocess';
        processBtn.disabled = false;

      } catch (error) {
        console.error('Processing error:', error);
        loadingArea.classList.remove('show');
        statusArea.style.display = 'block';
        statusArea.innerHTML = '<h2 style="color: red;">❌ Error</h2><p>' + error.message + '</p>';
        processBtn.disabled = false;
      }
    };

    async function loadImageFromUrl(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    }

    async function loadImageFromData(data) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = data;
      });
    }

    async function renderComposite() {
      if (!petImageNoBg || !templateImage) return;

      const petImg = await loadImageFromData(petImageNoBg);

      // Set canvas size to template size
      previewCanvas.width = templateImage.width;
      previewCanvas.height = templateImage.height;

      // Clear canvas
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      // Draw template
      ctx.drawImage(templateImage, 0, 0);

      // Calculate pet dimensions and position
      const size = sizeSlider.value / 100;
      const posX = posXSlider.value / 100;
      const posY = posYSlider.value / 100;

      const petWidth = templateImage.width * size;
      const petHeight = (petImg.height / petImg.width) * petWidth;

      const x = templateImage.width * posX - petWidth / 2;
      const y = templateImage.height * posY - petHeight / 2;

      // Draw pet
      ctx.drawImage(petImg, x, y, petWidth, petHeight);
    }

    downloadBtn.onclick = () => {
      const link = document.createElement('a');
      link.download = 'my-pet-custom-image.png';
      link.href = previewCanvas.toDataURL('image/png');
      link.click();
    };

    // Initialize
    loadTemplates();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
