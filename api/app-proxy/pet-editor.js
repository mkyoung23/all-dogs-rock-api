// api/app-proxy/pet-editor.js
// Shopify App Proxy - Customer-facing pet photo editor
// Accessible at: alldogsrockshop.com/apps/pet-editor

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const baseUrl = url.origin;

  // Get product ID from query params if provided
  const productId = url.searchParams.get('product_id');
  const variantId = url.searchParams.get('variant_id');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Your Custom Pet Product - All Dogs Rock</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      font-size: 1.2em;
      opacity: 0.95;
    }

    .main-content {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 0;
      min-height: 600px;
    }

    @media (max-width: 968px) {
      .main-content {
        grid-template-columns: 1fr;
      }
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
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      font-size: 0.9em;
      font-weight: bold;
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
      transform: scale(1.02);
    }

    .file-upload input {
      display: none;
    }

    .file-upload-text {
      font-size: 1em;
      color: #667eea;
      font-weight: 600;
    }

    .file-upload-icon {
      font-size: 2.5em;
      margin-bottom: 10px;
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
      font-weight: 500;
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #218838;
      transform: translateY(-2px);
    }

    .canvas-area {
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      flex-direction: column;
    }

    #previewCanvas {
      max-width: 100%;
      max-height: 600px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      background: white;
    }

    .status {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .status h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.8em;
    }

    .status p {
      font-size: 1.1em;
      line-height: 1.6;
    }

    .loading {
      display: none;
      text-align: center;
      padding: 40px 20px;
    }

    .loading.show {
      display: block;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .success-message {
      background: #d4edda;
      border: 2px solid #28a745;
      color: #155724;
      padding: 20px;
      border-radius: 10px;
      margin-top: 20px;
      display: none;
    }

    .success-message.show {
      display: block;
    }

    .success-message h3 {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .emoji {
      font-size: 1.2em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span class="emoji">🐕</span> Create Your Custom Pet Product</h1>
      <p>Upload your pet's photo and create a personalized masterpiece!</p>
    </div>

    <div class="main-content">
      <div class="sidebar">
        <div class="section">
          <h3><span class="step-number">1</span> Upload Pet Photo</h3>
          <label class="file-upload" for="petPhoto">
            <input type="file" id="petPhoto" accept="image/*">
            <div class="file-upload-icon">📷</div>
            <div class="file-upload-text">Click to Upload</div>
          </label>
        </div>

        <div class="section">
          <h3><span class="step-number">2</span> Choose Template</h3>
          <div class="templates-grid" id="templatesGrid">
            <div class="loading show">
              <div class="spinner"></div>
              <p>Loading templates...</p>
            </div>
          </div>
        </div>

        <div class="section controls" id="controls" style="display: none;">
          <h3><span class="step-number">3</span> Adjust Your Pet</h3>

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
            <span class="emoji">✨</span> Process Image
          </button>

          <button class="btn btn-success" id="addToCartBtn" style="display: none;">
            <span class="emoji">🛒</span> Add to Cart
          </button>
        </div>
      </div>

      <div class="canvas-area">
        <div id="statusArea" class="status">
          <h2><span class="emoji">👈</span> Let's Get Started!</h2>
          <p>Upload your pet's photo to begin creating your custom product</p>
          <p style="margin-top: 15px; font-size: 0.95em; color: #999;">Your pet will look amazing on our products!</p>
        </div>

        <div id="loadingArea" class="loading">
          <div class="spinner"></div>
          <p id="loadingText" style="font-size: 1.1em; color: #667eea; font-weight: 600;">Processing your image...</p>
        </div>

        <canvas id="previewCanvas" style="display: none;"></canvas>

        <div id="successMessage" class="success-message">
          <h3><span class="emoji">✅</span> Ready to Order!</h3>
          <p>Your custom pet image is ready. Click "Add to Cart" to continue shopping!</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const API_BASE = '${baseUrl}';
    const PRODUCT_ID = '${productId || ''}';
    const VARIANT_ID = '${variantId || ''}';

    const petPhotoInput = document.getElementById('petPhoto');
    const templatesGrid = document.getElementById('templatesGrid');
    const previewCanvas = document.getElementById('previewCanvas');
    const ctx = previewCanvas.getContext('2d');
    const statusArea = document.getElementById('statusArea');
    const loadingArea = document.getElementById('loadingArea');
    const loadingText = document.getElementById('loadingText');
    const controls = document.getElementById('controls');
    const processBtn = document.getElementById('processBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const successMessage = document.getElementById('successMessage');

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
    let finalImageData = null;

    // Load templates
    async function loadTemplates() {
      try {
        const response = await fetch(API_BASE + '/api/templates');
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
        templatesGrid.innerHTML = '<p style="color: red; padding: 20px;">Failed to load templates</p>';
      }
    }

    function selectTemplate(id, url) {
      selectedTemplate = { id, url };
      document.querySelectorAll('.template-item').forEach(el => {
        el.classList.remove('selected');
      });
      const selected = document.querySelector(\`[data-id="\${id}"]\`);
      if (selected) selected.classList.add('selected');

      checkReadyToProcess();
    }

    petPhotoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image too large! Please use an image under 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedPetImage = e.target.result;
        checkReadyToProcess();

        const img = new Image();
        img.onload = () => {
          statusArea.innerHTML = \`
            <h2><span class="emoji">✅</span> Photo Uploaded!</h2>
            <p>Now choose a template for your pet</p>
          \`;
        };
        img.src = uploadedPetImage;
      };
      reader.readAsDataURL(file);
    });

    function checkReadyToProcess() {
      if (uploadedPetImage && selectedTemplate) {
        processBtn.disabled = false;
        controls.style.display = 'block';
        if (!petImageNoBg) {
          statusArea.innerHTML = \`
            <h2><span class="emoji">🎨</span> Ready to Create!</h2>
            <p>Adjust settings and click "Process Image" to continue</p>
          \`;
        }
      }
    }

    // Slider updates
    sizeSlider.oninput = () => {
      sizeValue.textContent = sizeSlider.value + '%';
      if (petImageNoBg && templateImage) renderComposite();
    };
    posXSlider.oninput = () => {
      posXValue.textContent = posXSlider.value + '%';
      if (petImageNoBg && templateImage) renderComposite();
    };
    posYSlider.oninput = () => {
      posYValue.textContent = posYSlider.value + '%';
      if (petImageNoBg && templateImage) renderComposite();
    };

    processBtn.onclick = async () => {
      try {
        statusArea.style.display = 'none';
        successMessage.classList.remove('show');
        loadingArea.classList.add('show');
        loadingText.textContent = 'Removing background from your pet photo...';
        processBtn.disabled = true;

        // Remove background
        const bgResponse = await fetch(API_BASE + '/api/remove-background', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: uploadedPetImage }),
        });

        if (!bgResponse.ok) {
          throw new Error('Background removal failed. Please try a different image.');
        }

        const bgResult = await bgResponse.json();
        petImageNoBg = bgResult.imageData;

        loadingText.textContent = 'Loading template...';

        // Load template image
        templateImage = await loadImageFromUrl(selectedTemplate.url);

        loadingText.textContent = 'Creating your custom image...';

        // Render composite
        await renderComposite();

        loadingArea.classList.remove('show');
        previewCanvas.style.display = 'block';
        addToCartBtn.style.display = 'flex';
        successMessage.classList.add('show');
        processBtn.textContent = '🔄 Reprocess';
        processBtn.disabled = false;

      } catch (error) {
        console.error('Processing error:', error);
        loadingArea.classList.remove('show');
        statusArea.style.display = 'block';
        statusArea.innerHTML = \`
          <h2 style="color: red;"><span class="emoji">❌</span> Error</h2>
          <p>\${error.message}</p>
          <p style="margin-top: 15px; font-size: 0.95em;">Please try again or contact support if the issue persists.</p>
        \`;
        processBtn.disabled = false;
      }
    };

    async function loadImageFromUrl(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load template'));
        img.src = url;
      });
    }

    async function loadImageFromData(data) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
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

      // Store final image data
      finalImageData = previewCanvas.toDataURL('image/png');
    }

    addToCartBtn.onclick = async () => {
      if (!finalImageData) {
        alert('Please process your image first!');
        return;
      }

      try {
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<span class="emoji">⏳</span> Adding to Cart...';

        // Here you would integrate with your Shopify cart
        // For now, we'll prepare the data and show success

        const customizationData = {
          petImage: finalImageData,
          template: selectedTemplate.id,
          position: {
            x: posXSlider.value / 100,
            y: posYSlider.value / 100
          },
          size: sizeSlider.value / 100
        };

        // If variant ID is provided, add to cart
        if (VARIANT_ID) {
          // TODO: Integrate with your cart API
          console.log('Adding to cart:', { variantId: VARIANT_ID, customizationData });

          // For now, just show success and redirect
          alert('Success! Your custom pet product has been added to your cart!');
          window.location.href = '/cart';
        } else {
          // No product selected, offer download
          const link = document.createElement('a');
          link.download = 'custom-pet-image.png';
          link.href = finalImageData;
          link.click();

          addToCartBtn.innerHTML = '<span class="emoji">✅</span> Downloaded!';
          setTimeout(() => {
            addToCartBtn.innerHTML = '<span class="emoji">🛒</span> Add to Cart';
            addToCartBtn.disabled = false;
          }, 2000);
        }

      } catch (error) {
        console.error('Add to cart error:', error);
        alert('Failed to add to cart. Please try again.');
        addToCartBtn.innerHTML = '<span class="emoji">🛒</span> Add to Cart';
        addToCartBtn.disabled = false;
      }
    };

    // Initialize
    loadTemplates();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Type': 'application/liquid',
    },
  });
}
