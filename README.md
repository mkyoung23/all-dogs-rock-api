# All Dogs Rock API - Custom Pet Image Editor

A complete API solution for creating custom pet images by compositing customer photos into beautiful templates. Perfect for e-commerce stores selling personalized pet products!

## 🎨 Features

- **🐕 Pet Photo Upload** - Easy-to-use upload interface for customer photos
- **✂️ Background Removal** - Automatically removes backgrounds using remove.bg API
- **🖼️ Template System** - Multiple beautiful templates (park, beach, living room, garden, etc.)
- **🎛️ Interactive Editor** - Real-time preview with adjustable size and position
- **💾 Export Options** - Download final images or integrate with Shopify
- **🎨 AI Generation** - Optional DALL-E integration for AI-generated backgrounds
- **🛒 Customily Integration** - Apply images directly to Customily product templates

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd all-dogs-rock-api
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Required API keys:
- **REMOVEBG_API_KEY** - Get from [remove.bg](https://www.remove.bg/api)
- **OPENAI_API_KEY** (optional) - Get from [OpenAI](https://platform.openai.com/api-keys)
- **CUSTOMILY_API_KEY** (optional) - Get from your Customily dashboard
- **SHOPIFY_STOREFRONT_TOKEN** (optional) - For Shopify integration

### 3. Deploy to Vercel

```bash
vercel deploy
```

Or click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## 📚 API Endpoints

### Photo Upload
- **POST** `/api/upload` - Upload pet photos
- **GET** `/api/upload` - Upload form interface
- **GET** `/api/uploads/{id}` - Retrieve uploaded photos

### Background Removal
- **POST** `/api/remove-background` - Remove background from images
  ```json
  {
    "imageUrl": "https://...",
    "imageData": "data:image/png;base64,..."
  }
  ```

### Image Compositing
- **POST** `/api/composite` - Composite pet into template
  ```json
  {
    "petImageData": "data:image/png;base64,...",
    "templateImageUrl": "https://...",
    "position": { "x": 0.5, "y": 0.5 },
    "size": { "width": 0.6, "height": 0.6 }
  }
  ```

### Complete Workflow
- **POST** `/api/process-pet-image` - Full pipeline (upload → remove bg → composite)
  ```json
  {
    "petImageUrl": "https://...",
    "templateName": "park",
    "position": { "x": 0.5, "y": 0.5 },
    "size": { "width": 0.6, "height": 0.6 }
  }
  ```

### Templates
- **GET** `/api/templates` - List all available templates
- **GET** `/api/templates/{id}` - Get specific template image
- **POST** `/api/templates` - Add new template (admin)

### Interactive Editor
- **GET** `/api/editor` - Full-featured web interface for customers

### AI Generation (Optional)
- **POST** `/api/generate` - Generate AI backgrounds with DALL-E
- **POST** `/api/app-proxy/generate` - Shopify app proxy compatible

### Customily Integration (Optional)
- **POST** `/api/customily/apply` - Apply image to Customily template

## 🎨 Using the Interactive Editor

The easiest way to use the system is through the interactive editor:

1. Navigate to `/api/editor` on your deployed URL
2. Upload your pet's photo
3. Choose a template from the gallery
4. Adjust size and position with sliders
5. Click "Process Image" to remove background and composite
6. Download your final image!

## 🔧 Integration Examples

### Basic JavaScript Integration

```javascript
// Upload and process a pet photo
async function createCustomPetImage(petFile, templateName) {
  // 1. Upload the pet photo
  const reader = new FileReader();
  const imageData = await new Promise((resolve) => {
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(petFile);
  });

  // 2. Process with full workflow
  const response = await fetch('/api/process-pet-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      petImageData: imageData,
      templateName: templateName,
      position: { x: 0.5, y: 0.5 },
      size: { width: 0.6, height: 0.6 }
    })
  });

  const result = await response.json();
  return result.finalImage; // Base64 or URL
}
```

### React Component Example

```jsx
import { useState } from 'react';

function PetImageEditor() {
  const [finalImage, setFinalImage] = useState(null);

  const handleProcess = async (file, template) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch('/api/process-pet-image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    setFinalImage(result.finalImage);
  };

  return (
    <div>
      {finalImage && <img src={finalImage} alt="Custom pet" />}
    </div>
  );
}
```

## 🏗️ Architecture

```
Customer Upload → Background Removal (remove.bg) → Image Compositing → Final Output
                                                   ↓
                                            Template System
                                            (5 default templates)
```

## 📋 Available Templates

1. **default** - Classic white background with decorative border
2. **park** - Beautiful park with green grass and trees
3. **beach** - Sunny beach with sand and ocean
4. **living-room** - Cozy indoor living room setting
5. **garden** - Lush garden with flowers and greenery

## 🎯 Use Cases

- **E-commerce Product Customization** - Let customers preview their pet on products
- **Print-on-Demand** - Generate custom designs for t-shirts, mugs, posters
- **Pet Portrait Services** - Professional-looking pet portraits with custom backgrounds
- **Social Media Content** - Fun pet images for sharing
- **Greeting Cards** - Custom pet greeting cards

## 🔐 Security

- All API endpoints support CORS for web integration
- Uploaded images stored temporarily in memory
- No permanent storage of customer photos (privacy-focused)
- Environment variables for sensitive API keys

## 📈 Performance

- Edge functions for fast global response
- Optimized image processing
- Template caching
- Concurrent API calls where possible

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use for commercial projects

## 🆘 Support

For issues or questions, check the documentation or create an issue on GitHub.

---

Made with ❤️ for pet lovers everywhere! 🐕🐈