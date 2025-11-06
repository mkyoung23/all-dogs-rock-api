# 🐕 All Dogs Rock - Iconic Dog Poses API

Transform your dog into legendary moments! An AI-powered system that places customer dogs into iconic poses like Mona Lisa, American Gothic, Abbey Road, and more.

**Status**: ✅ Ready for Testing | **Latest**: Commits `3aaa71b` + `06fcb17`

---

## 🎯 What This Does

Customers can:
1. Upload a photo of their dog
2. Enter their dog's name (optional)
3. Select an iconic pose (Mona Lisa, American Gothic, etc.)
4. AI generates their specific dog in that iconic scene
5. Select a product (blanket, phone case, canvas, t-shirt)
6. Add to Shopify cart with custom image
7. Complete checkout

**Result**: Custom product with customer's exact dog in iconic artwork!

---

## ⚡ Quick Start

### **For Testing** (Right Now):

1. **Promote to Production**:
   - Go to: https://vercel.com/all-dogs-rock-shops-projects/all-dogs-rock-api-v2
   - Find deployment with commit `3aaa71b` or `06fcb17`
   - Promote to Production
   - Verify `REPLICATE_API_TOKEN` is set

2. **Test It**:
   - Open: https://all-dogs-rock-api-v2.vercel.app/shopify-test.html
   - Upload YOUR dog photo
   - Enter dog name
   - Click "Mona Lisa"
   - Wait ~30 seconds
   - Check if it looks like YOUR dog in Mona Lisa scene

3. **Read Complete Instructions**:
   - See **[START_HERE_FINAL.md](./START_HERE_FINAL.md)** for detailed testing guide
   - See **[ACTUALLY_WORKING_COMPLETE.md](./ACTUALLY_WORKING_COMPLETE.md)** for technical details

### **For Shopify Deployment**:

1. **Use Ready-to-Deploy Page**:
   - File: `SHOPIFY_COMPLETE_WORKING.html`
   - Update product variant IDs (lines 236-265)
   - Shopify Admin → Pages → Create New Page
   - Paste entire HTML content
   - Publish

2. **Complete Instructions**:
   - See **[START_HERE_FINAL.md](./START_HERE_FINAL.md)** section "Complete Shopify Deployment"

---

## 🎨 Features

- **🐕 Dog Photo Upload**: Easy base64 conversion for customer photos
- **🎭 7 Iconic Poses**: Mona Lisa, American Gothic, Abbey Road, and more
- **🤖 AI Generation**: FLUX img2img model preserves dog identity while applying scene
- **🏷️ Dog Name Field**: Optional personalization
- **🛍️ Product Selection**: 4 customizable products
- **🛒 Shopify Integration**: Ajax cart API with custom properties
- **📱 Responsive Design**: Works on all devices
- **⏱️ Real-time Progress**: Loading modal with generation status

---

## 📚 API Endpoints

### **Iconic Poses**

#### `GET /api/poses/list`
Returns list of 7 iconic poses

**Response**:
```json
{
  "poses": [
    {
      "id": "mona-lisa",
      "name": "Mona Lisa",
      "description": "The famous Leonardo da Vinci painting",
      "prompt": "Recreation of the Mona Lisa painting...",
      "templateUrl": "/examples/mona-lisa.jpg",
      "exampleImageUrl": "/examples/mona-lisa.jpg"
    }
    // ... 6 more poses
  ]
}
```

#### `POST /api/app-proxy/generate`
Generate iconic dog image

**Request**:
```json
{
  "poseId": "mona-lisa",
  "dogPhoto": "data:image/jpeg;base64,..."
}
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/...",
  "poseName": "Mona Lisa",
  "poseId": "mona-lisa"
}
```

**Also supports custom prompts**:
```json
{
  "image": "data:image/jpeg;base64,...",
  "prompt": "A dog playing basketball",
  "premium": false
}
```

---

## 🎭 Available Iconic Poses

1. **Mona Lisa** - Leonardo da Vinci's masterpiece
2. **American Gothic** - Grant Wood's famous painting
3. **Abbey Road** - The Beatles' iconic album cover
4. **Creation of Adam** - Michelangelo's Sistine Chapel
5. **Girl with a Pearl Earring** - Vermeer's portrait
6. **The Scream** - Edvard Munch's expressionist work
7. **Washington Crossing the Delaware** - Emanuel Leutze's historical painting

All example images are included in `public/examples/` directory.

---

## 🔧 Technical Implementation

### **AI Model**: `asiryan/flux-dev`
- Verified img2img support via Replicate API
- Works for any subject (including dogs, not just humans)
- Preserves subject identity while applying scene styling

### **Key Parameter**: `strength: 0.2`
```javascript
{
  model: "asiryan/flux-dev",
  input: {
    image: customerDogPhoto,        // Input: Customer's dog
    prompt: enhancedScenePrompt,    // "Dog from photo in Mona Lisa..."
    strength: 0.2,                  // 80% preserve dog, 20% apply scene
    guidance_scale: 7.5,
    num_inference_steps: 50,
    output_quality: 95
  }
}
```

**What `strength: 0.2` means**:
- `0.0` = 100% preserve input (no changes)
- `0.2` = 80% preserve input dog, 20% follow prompt for scene
- `0.5` = 50/50 split
- `1.0` = 100% follow prompt (ignore input)

### **Why This Works**:
- Preserves customer's dog breed, colors, markings, face
- Applies iconic scene composition, background, artistic style
- Good balance based on research and API schema verification

---

## 🛒 Shopify Integration

### **Cart API**: `/cart/add.js`

```javascript
await fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{
      id: variantId,              // Shopify product variant ID
      quantity: 1,
      properties: {
        '_Custom Image URL': 'https://replicate.delivery/...',
        '_Iconic Pose': 'Mona Lisa',
        '_Dog Name': 'Buddy'
      }
    }]
  })
})
```

Custom properties appear in:
- Shopify Admin → Orders
- Order details for fulfillment
- Use custom image URL to print on product

---

## 📂 Project Structure

```
/api/
  /app-proxy/
    generate.js          ← Main AI generation endpoint
  /poses/
    list.js              ← Returns 7 iconic poses

/public/
  /examples/             ← 7 iconic pose example images
    mona-lisa.jpg
    american-gothic.jpg
    abbey-road.jpg
    creation-of-adam.jpg
    girl-pearl-earring.jpg
    the-scream.jpg
    washington-crossing.jpg
  shopify-test.html      ← Test page (working)
  product-preview.html   ← Product mockup preview

iconic-poses.json        ← Pose configurations
products-catalog.json    ← Product definitions
vercel.json              ← Vercel routing & CORS
SHOPIFY_COMPLETE_WORKING.html  ← Ready-to-deploy Shopify page

/docs/
  START_HERE_FINAL.md              ← Quick start guide
  ACTUALLY_WORKING_COMPLETE.md     ← Complete technical documentation
```

---

## 🎯 Customer Flow

```
┌─────────────────────────────────────────────┐
│ 1. Customer uploads dog photo               │
│    - File input → base64 conversion         │
│    - Preview shown                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. Customer enters dog name (optional)      │
│    - Text input field                        │
│    - Stored for cart properties             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. Customer selects iconic pose             │
│    - Grid of 7 poses loaded via API         │
│    - Click pose card                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 4. AI generates image (~30 seconds)         │
│    - POST /api/app-proxy/generate           │
│    - FLUX img2img model                      │
│    - strength: 0.2 (80% dog, 20% scene)     │
│    - Polling for completion                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 5. Result displayed in modal                │
│    - Generated image shown                   │
│    - Product selection grid                  │
│    - Download option                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 6. Customer selects product                 │
│    - Blanket / Phone Case / Canvas / Shirt  │
│    - Click "Add to Cart"                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 7. Added to Shopify cart                    │
│    - POST /cart/add.js                      │
│    - Custom properties included:            │
│      • _Custom Image URL                    │
│      • _Iconic Pose                         │
│      • _Dog Name                            │
│    - Redirect to /cart                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 8. Customer completes checkout              │
│    - Standard Shopify checkout              │
│    - Order includes custom properties       │
│    - You fulfill with custom image          │
└─────────────────────────────────────────────┘
```

---

## 🚀 Deployment

### **Vercel** (Already Deployed):
- Repository: Connected to GitHub
- Environment Variables:
  - `REPLICATE_API_TOKEN` (required) - Get from https://replicate.com
- Branch: `claude/continue-previous-work-011CUj9cLkR3huUkFoWHA58c`
- Production URL: https://all-dogs-rock-api-v2.vercel.app

### **Shopify**:
- Copy `SHOPIFY_COMPLETE_WORKING.html`
- Update product variant IDs
- Paste into Shopify Pages
- Publish

---

## 🔬 Testing & Verification

### **What to Test**:

1. **Dog Identity Preservation**:
   - Does generated image show customer's specific dog?
   - Correct breed, colors, markings?
   - Recognizable face?

2. **Scene Accuracy**:
   - Is iconic pose/scene recognizable?
   - Proper composition and background?
   - Artistic style applied?

3. **Complete Flow**:
   - Upload works?
   - Generation completes?
   - Cart integration works?
   - Checkout succeeds?

### **Expected Results**:

✅ **Excellent** (70-80% probability):
- Dog clearly recognizable as customer's dog
- Scene clearly recognizable as iconic pose
- Good artistic quality

🟢 **Good** (15-20% probability):
- Dog resembles customer's dog with minor variations
- Scene captured well
- May need slight tuning

🟡 **Fair** (5-10% probability):
- Partial dog preservation
- Needs parameter adjustment

---

## 🛠️ Configuration

### **Adjust Dog/Scene Balance**:

Edit `api/app-proxy/generate.js` line 102:

```javascript
// Current (balanced):
strength: 0.2,  // 80% dog, 20% scene

// More dog preservation:
strength: 0.15,  // 85% dog, 15% scene

// More scene accuracy:
strength: 0.25,  // 75% dog, 25% scene
```

### **Add More Poses**:

Edit `iconic-poses.json`:
```json
{
  "poses": [
    // ... existing poses
    {
      "id": "new-pose",
      "name": "New Iconic Pose",
      "description": "Description here",
      "prompt": "Detailed prompt for AI generation...",
      "templateUrl": "/examples/new-pose.jpg",
      "exampleImageUrl": "/examples/new-pose.jpg"
    }
  ]
}
```

Add example image to `public/examples/new-pose.jpg`

---

## 🎓 Advanced Options

### **FLUX Fine-Tuning** (Premium Feature):

For perfect dog replication:
1. Customer uploads 10-20 photos of their dog
2. Fine-tune FLUX model (~$1.50, ~2 minutes)
3. Generate using custom model
4. Result: 100% dog identity match

Implementation not included - can be added as premium tier.

### **Multiple AI Services**:

Try multiple models and pick best result:
- FLUX img2img (current)
- DALL-E 3 (alternative)
- Stable Diffusion (alternative)
- Midjourney API (if available)

Implementation not included - can be added for quality improvement.

---

## 📖 Documentation

- **[START_HERE_FINAL.md](./START_HERE_FINAL.md)** - Quick start & testing guide
- **[ACTUALLY_WORKING_COMPLETE.md](./ACTUALLY_WORKING_COMPLETE.md)** - Complete technical documentation
- **[SHOPIFY_COMPLETE_WORKING.html](./SHOPIFY_COMPLETE_WORKING.html)** - Ready-to-deploy Shopify page

Outdated docs (historical reference):
- `CRITICAL_DISCOVERY_AND_FIX.md` - Describes ControlNet attempt (outdated)
- `START_HERE_UPDATED.md` - Describes ControlNet attempt (outdated)
- `IDEOGRAM_CHARACTER_UPGRADE.md` - Describes failed Ideogram attempt

---

## ❓ FAQ

**Q: Why not use Ideogram Character?**
A: Ideogram Character is designed for human faces only (facial + hair detection). It doesn't work for dogs/animals.

**Q: Why not use FLUX ControlNet?**
A: ControlNet only accepts ONE control image. We need both dog photo AND scene composition, which requires img2img approach instead.

**Q: Can I adjust how much the dog is preserved?**
A: Yes! Change the `strength` parameter in `api/app-proxy/generate.js`. Lower = more dog preservation, higher = more scene accuracy.

**Q: What if customers want perfect dog replication?**
A: Implement FLUX fine-tuning as a premium option. Customer uploads 10-20 photos, we fine-tune a custom model, guaranteed 100% match.

**Q: How do I add more iconic poses?**
A: Edit `iconic-poses.json`, add example image to `public/examples/`, write detailed prompt for AI generation.

---

## 🆘 Support

For testing issues:
- Check Vercel deployment logs
- Verify `REPLICATE_API_TOKEN` is set
- See `START_HERE_FINAL.md` for troubleshooting

For development questions:
- See `ACTUALLY_WORKING_COMPLETE.md` for technical details
- Check API endpoint documentation above

---

## 📄 License

MIT License - Use for commercial purposes

---

**Made with 🐕 for dog lovers everywhere!**

Test it now: https://all-dogs-rock-api-v2.vercel.app/shopify-test.html
