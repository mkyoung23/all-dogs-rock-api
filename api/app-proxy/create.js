// Customer creation flow - accessible via /apps/adrs/create
// This is the main customer-facing page for creating custom pet portraits

export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Dogs Rock - Create Your Custom Pet Portrait</title>
</head>
<body>

<div id="adrs-creator">
  <!-- Step 1: How It Works -->
  <div id="step-how-it-works" class="adrs-step active">
    <div class="adrs-container">
      <h1>🐕 Create Your Custom Pet Portrait</h1>
      <div class="how-it-works">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3>Upload Your Photos</h3>
          <p>Upload 1-3 photos of your dog, cat, or you with your pet</p>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h3>Describe Your Vision</h3>
          <p>Tell us what scene you want - superhero, royalty, astronaut, anything!</p>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h3>Get Your Custom Art</h3>
          <p>Our AI creates stunning images that actually look like YOUR pet</p>
        </div>
        <div class="step-card">
          <div class="step-number">4</div>
          <h3>Choose Your Product</h3>
          <p>See it on mugs, canvases, shirts, phone cases & more!</p>
        </div>
      </div>
      <button class="adrs-btn adrs-btn-primary" onclick="adrsNext('upload')">
        Continue →
      </button>
    </div>
  </div>

  <!-- Step 2: Upload Photos -->
  <div id="step-upload" class="adrs-step">
    <div class="adrs-container">
      <h2>📸 Upload Your Pet Photos</h2>
      <p class="subtitle">Upload 1-3 clear photos of your pet (or you with your pet)</p>

      <div class="upload-area" id="upload-drop-zone">
        <input type="file" id="photo-input" accept="image/*" multiple style="display: none;">
        <label for="photo-input" class="upload-label">
          <div class="upload-icon">📷</div>
          <div class="upload-text">Click to upload or drag photos here</div>
          <div class="upload-hint">JPG, PNG, WebP • Max 10MB each</div>
        </label>
      </div>

      <div id="photo-preview" class="photo-preview"></div>

      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" id="has-human">
          <span>My photo includes a person (me with my pet)</span>
        </label>
      </div>

      <div class="button-group">
        <button class="adrs-btn adrs-btn-secondary" onclick="adrsBack('how-it-works')">
          ← Back
        </button>
        <button class="adrs-btn adrs-btn-primary" id="upload-continue" onclick="adrsNext('prompt')" disabled>
          Continue →
        </button>
      </div>
    </div>
  </div>

  <!-- Step 3: Write Prompt -->
  <div id="step-prompt" class="adrs-step">
    <div class="adrs-container">
      <h2>✨ Describe Your Vision</h2>
      <p class="subtitle">Tell us what you want to see - be creative!</p>

      <textarea
        id="prompt-input"
        class="prompt-textarea"
        placeholder="Example: my dog as a superhero flying over the city"
        rows="4"
      ></textarea>

      <div class="prompt-examples">
        <p><strong>Need ideas? Click to use:</strong></p>
        <button class="example-chip" onclick="useExample('my dog wearing a royal crown on a throne')">
          👑 Royal Portrait
        </button>
        <button class="example-chip" onclick="useExample('my dog as an astronaut in space with stars')">
          🚀 Space Explorer
        </button>
        <button class="example-chip" onclick="useExample('my dog as a superhero with a cape flying')">
          🦸 Superhero
        </button>
        <button class="example-chip" onclick="useExample('my dog at the beach wearing sunglasses')">
          🏖️ Beach Vibes
        </button>
      </div>

      <div class="button-group">
        <button class="adrs-btn adrs-btn-secondary" onclick="adrsBack('upload')">
          ← Back
        </button>
        <button class="adrs-btn adrs-btn-primary" id="prompt-continue" onclick="generateImages()" disabled>
          Generate Images →
        </button>
      </div>
    </div>
  </div>

  <!-- Step 4: Generating -->
  <div id="step-generating" class="adrs-step">
    <div class="adrs-container">
      <h2>🎨 Creating Your Custom Images...</h2>
      <p class="subtitle">This takes 30-60 seconds. Please wait!</p>

      <div class="loading-container">
        <div class="spinner"></div>
        <div class="progress-bar">
          <div class="progress-fill" id="progress"></div>
        </div>
        <p id="status-text" class="status-text">Starting generation...</p>
        <p id="time-text" class="time-text">Estimated time: 45 seconds</p>
      </div>
    </div>
  </div>

  <!-- Step 5: Choose Your Image -->
  <div id="step-choose" class="adrs-step">
    <div class="adrs-container">
      <h2>🖼️ Choose Your Favorite!</h2>
      <p class="subtitle">Click on the image you like best</p>

      <div id="generated-images" class="image-grid"></div>

      <div class="button-group">
        <button class="adrs-btn adrs-btn-secondary" onclick="adrsBack('prompt')">
          ← Try Different Prompt
        </button>
        <button class="adrs-btn adrs-btn-primary" id="choose-continue" onclick="adrsNext('products')" disabled>
          Continue to Products →
        </button>
      </div>
    </div>
  </div>

  <!-- Step 6: Choose Product -->
  <div id="step-products" class="adrs-step">
    <div class="adrs-container">
      <h2>🛍️ Choose Your Product</h2>
      <p class="subtitle">Your custom image will be printed on:</p>

      <div class="product-grid">
        <div class="product-card" onclick="selectProduct('canvas')">
          <div class="product-image">🖼️</div>
          <h3>Canvas Print</h3>
          <p class="price">From $49.99</p>
        </div>
        <div class="product-card" onclick="selectProduct('mug')">
          <div class="product-image">☕</div>
          <h3>Coffee Mug</h3>
          <p class="price">$19.99</p>
        </div>
        <div class="product-card" onclick="selectProduct('tshirt')">
          <div class="product-image">👕</div>
          <h3>T-Shirt</h3>
          <p class="price">$24.99</p>
        </div>
        <div class="product-card" onclick="selectProduct('phone')">
          <div class="product-image">📱</div>
          <h3>Phone Case</h3>
          <p class="price">$29.99</p>
        </div>
      </div>

      <p class="note">Note: Product preview and selection coming soon. For now, this takes you to our product catalog.</p>
    </div>
  </div>
</div>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  padding: 20px 0;
}

#adrs-creator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.adrs-container {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.adrs-step {
  display: none;
}

.adrs-step.active {
  display: block;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

h1, h2 {
  color: #333;
  margin-top: 0;
  text-align: center;
}

h1 { font-size: 2.5em; }
h2 { font-size: 2em; }

.subtitle {
  text-align: center;
  color: #666;
  font-size: 1.1em;
  margin-bottom: 30px;
}

.how-it-works {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.step-card {
  text-align: center;
  padding: 30px 20px;
  border: 2px solid #eee;
  border-radius: 12px;
  transition: all 0.3s;
}

.step-card:hover {
  border-color: #0070f3;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,112,243,0.1);
}

.step-number {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  background: #0070f3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.step-card h3 {
  margin: 15px 0 10px;
  color: #333;
}

.step-card p {
  color: #666;
  line-height: 1.5;
}

.upload-area {
  border: 3px dashed #ccc;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin: 30px 0;
}

.upload-area:hover, .upload-area.dragover {
  border-color: #0070f3;
  background: #f8f9ff;
}

.upload-label {
  cursor: pointer;
  display: block;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.upload-text {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.upload-hint {
  color: #999;
  font-size: 14px;
}

.photo-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #eee;
}

.photo-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.photo-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255,0,0,0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
}

.checkbox-group {
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  cursor: pointer;
}

.checkbox-label input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.prompt-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 20px;
}

.prompt-textarea:focus {
  outline: none;
  border-color: #0070f3;
}

.prompt-examples {
  margin: 20px 0;
}

.prompt-examples p {
  margin-bottom: 15px;
  color: #666;
}

.example-chip {
  display: inline-block;
  padding: 10px 20px;
  margin: 5px;
  border: 2px solid #0070f3;
  background: white;
  color: #0070f3;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.example-chip:hover {
  background: #0070f3;
  color: white;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 30px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid #0070f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar {
  width: 100%;
  max-width: 500px;
  height: 30px;
  margin: 0 auto 20px;
  background: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0070f3, #00a8ff);
  width: 0%;
  transition: width 0.5s ease;
}

.status-text {
  font-size: 18px;
  color: #333;
  margin: 15px 0;
}

.time-text {
  color: #999;
  font-size: 14px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.generated-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s;
}

.generated-image:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.generated-image.selected {
  border-color: #00d084;
  box-shadow: 0 0 30px rgba(0,208,132,0.3);
}

.generated-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.selected-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #00d084;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.product-card {
  text-align: center;
  padding: 30px 20px;
  border: 2px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.product-card:hover {
  border-color: #0070f3;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,112,243,0.15);
}

.product-image {
  font-size: 60px;
  margin-bottom: 15px;
}

.product-card h3 {
  margin: 10px 0;
  color: #333;
}

.price {
  color: #0070f3;
  font-size: 18px;
  font-weight: bold;
}

.note {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.adrs-btn {
  padding: 15px 40px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.adrs-btn-primary {
  background: #0070f3;
  color: white;
}

.adrs-btn-primary:hover:not(:disabled) {
  background: #0051cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,112,243,0.3);
}

.adrs-btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.adrs-btn-secondary:hover {
  background: #e0e0e0;
}

.adrs-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .adrs-container {
    padding: 20px;
  }

  h1 { font-size: 1.8em; }
  h2 { font-size: 1.5em; }

  .how-it-works {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .adrs-btn {
    width: 100%;
  }
}
</style>

<script>
const state = {
  uploadedPhotos: [],
  uploadedPhotoURLs: [],
  humanInPhoto: false,
  prompt: '',
  generatedImages: [],
  selectedImage: null,
  selectedProduct: null
};

const API_BASE = window.location.origin;

function adrsNext(stepId) {
  document.querySelectorAll('.adrs-step').forEach(el => el.classList.remove('active'));
  document.getElementById('step-' + stepId).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function adrsBack(stepId) {
  adrsNext(stepId);
}

const photoInput = document.getElementById('photo-input');
const dropZone = document.getElementById('upload-drop-zone');
const photoPreview = document.getElementById('photo-preview');
const uploadContinue = document.getElementById('upload-continue');
const hasHumanCheckbox = document.getElementById('has-human');

photoInput.addEventListener('change', handleFiles);

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles({ target: { files: e.dataTransfer.files } });
});

hasHumanCheckbox.addEventListener('change', (e) => {
  state.humanInPhoto = e.target.checked;
});

function handleFiles(e) {
  const files = Array.from(e.target.files);

  if (files.length === 0) return;
  if (files.length > 3) {
    alert('Please upload maximum 3 photos');
    return;
  }

  photoPreview.innerHTML = '';
  state.uploadedPhotos = [];
  state.uploadedPhotoURLs = [];

  files.forEach((file, index) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(\`File \${file.name} is too large. Max 10MB per file.\`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      state.uploadedPhotos.push(file);
      state.uploadedPhotoURLs.push(dataURL);

      const photoItem = document.createElement('div');
      photoItem.className = 'photo-item';
      photoItem.innerHTML = \`
        <img src="\${dataURL}" alt="Uploaded photo \${index + 1}">
        <button class="photo-remove" onclick="removePhoto(\${index})">×</button>
      \`;
      photoPreview.appendChild(photoItem);

      uploadContinue.disabled = false;
    };
    reader.readAsDataURL(file);
  });
}

function removePhoto(index) {
  state.uploadedPhotos.splice(index, 1);
  state.uploadedPhotoURLs.splice(index, 1);

  photoPreview.innerHTML = '';
  state.uploadedPhotoURLs.forEach((url, i) => {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.innerHTML = \`
      <img src="\${url}" alt="Uploaded photo \${i + 1}">
      <button class="photo-remove" onclick="removePhoto(\${i})">×</button>
    \`;
    photoPreview.appendChild(photoItem);
  });

  uploadContinue.disabled = state.uploadedPhotos.length === 0;
}

const promptInput = document.getElementById('prompt-input');
const promptContinue = document.getElementById('prompt-continue');

promptInput.addEventListener('input', (e) => {
  state.prompt = e.target.value.trim();
  promptContinue.disabled = state.prompt.length < 5;
});

function useExample(examplePrompt) {
  promptInput.value = examplePrompt;
  state.prompt = examplePrompt;
  promptContinue.disabled = false;
}

async function generateImages() {
  adrsNext('generating');

  const statusText = document.getElementById('status-text');
  const timeText = document.getElementById('time-text');
  const progress = document.getElementById('progress');

  let timeRemaining = 60;
  let progressPercent = 0;

  const progressInterval = setInterval(() => {
    timeRemaining--;
    progressPercent = Math.min(progressPercent + 1.5, 95);
    progress.style.width = progressPercent + '%';
    timeText.textContent = \`Estimated time: \${timeRemaining} seconds\`;

    if (timeRemaining <= 45 && timeRemaining > 30) {
      statusText.textContent = 'Analyzing your pet photos...';
    } else if (timeRemaining <= 30 && timeRemaining > 15) {
      statusText.textContent = 'Generating custom images...';
    } else if (timeRemaining <= 15) {
      statusText.textContent = 'Almost done! Finalizing...';
    }
  }, 1000);

  try {
    const referenceImage = state.uploadedPhotoURLs[0];

    console.log('Calling API with:');
    console.log('- Prompt:', state.prompt);
    console.log('- Image size:', referenceImage.length, 'characters');
    console.log('- Human in photo:', state.humanInPhoto);

    const response = await fetch(\`\${API_BASE}/app-proxy/generate\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: state.prompt,
        image: referenceImage,
        premium: false,
        human_in_photo: state.humanInPhoto
      })
    });

    clearInterval(progressInterval);
    progress.style.width = '100%';

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error || 'Generation failed');
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (data.success && data.imageUrl) {
      state.generatedImages = [data.imageUrl];
      displayGeneratedImages();
      adrsNext('choose');
    } else {
      throw new Error(data.error || 'No image generated');
    }

  } catch (error) {
    clearInterval(progressInterval);
    console.error('Generation error:', error);
    alert('Failed to generate image: ' + error.message + '\\n\\nPlease try again or contact support.');
    adrsBack('prompt');
  }
}

function displayGeneratedImages() {
  const container = document.getElementById('generated-images');
  container.innerHTML = '';

  state.generatedImages.forEach((url, index) => {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'generated-image';
    imageDiv.innerHTML = \`
      <img src="\${url}" alt="Generated option \${index + 1}">
    \`;
    imageDiv.onclick = () => selectImage(index);
    container.appendChild(imageDiv);
  });
}

function selectImage(index) {
  state.selectedImage = state.generatedImages[index];

  document.querySelectorAll('.generated-image').forEach((el, i) => {
    if (i === index) {
      el.classList.add('selected');
      if (!el.querySelector('.selected-badge')) {
        const badge = document.createElement('div');
        badge.className = 'selected-badge';
        badge.textContent = '✓ Selected';
        el.appendChild(badge);
      }
    } else {
      el.classList.remove('selected');
      const badge = el.querySelector('.selected-badge');
      if (badge) badge.remove();
    }
  });

  document.getElementById('choose-continue').disabled = false;
}

function selectProduct(productType) {
  state.selectedProduct = productType;
  alert(\`Product selection coming soon! You selected: \${productType}\\n\\nFor now, this will redirect you to our product catalog where you can browse all options.\`);
}

console.log('All Dogs Rock Creator loaded!');
console.log('API endpoint:', API_BASE);
</script>

</body>
</html>
  `;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
