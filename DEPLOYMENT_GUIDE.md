# 🚀 All Dogs Rock Shop - Complete Deployment Guide

## ✅ What Has Been Fixed

### CRITICAL FIX: Image Generation Now Uses Customer's Pet Photo

**Problem Identified:**
- ❌ Old code used OpenAI DALL-E 3, which **cannot** accept a reference image
- ❌ This caused random dogs to be generated instead of the customer's uploaded pet

**Solution Implemented:**
- ✅ Switched to **Replicate IP-Adapter SDXL** models
- ✅ These models accept BOTH a prompt AND a reference image
- ✅ The customer's uploaded pet photo is now used to preserve identity
- ✅ Two model variants: one for human+pet photos, one for pets only

**Files Changed:**
- `/api/app-proxy/generate.js` - Completely rewritten to use Replicate
- `/.env.example` - Updated with proper configuration guide

---

## 📋 What You Need to Do Now

### Step 1: Add Replicate API Token to Vercel

You need to add your Replicate API token to Vercel's environment variables.

**Where to find your token:**
- Log in to https://replicate.com
- Go to https://replicate.com/account/api-tokens
- Copy your token (it starts with `r8_`)

**Instructions:**

1. Go to https://vercel.com and log in
2. Select your project (should be `all-dogs-rock-api` or similar)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Click **Add New**
6. Add this variable:
   ```
   Key: REPLICATE_API_TOKEN
   Value: [paste your token here - starts with r8_]
   ```
7. Select all environments: **Production**, **Preview**, and **Development**
8. Click **Save**

### Step 2: Deploy the Updated Code

**Option A: Deploy via Vercel Dashboard (Easiest)**
1. Go to your Vercel project
2. Click on **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait for deployment to complete (~1-2 minutes)

**Option B: Deploy via Git Push**
1. Make sure your code is committed to your GitHub repository
2. Push to the main branch:
   ```bash
   git add .
   git commit -m "Fix: Switch to Replicate IP-Adapter for identity-preserving generation"
   git push origin main
   ```
3. Vercel will automatically deploy the new code

### Step 3: Verify the Fix

Once deployed, test the API endpoint:

**Test URL:**
```
https://your-vercel-domain.vercel.app/app-proxy/generate
```

**Test with curl:**
```bash
curl -X POST https://your-vercel-domain.vercel.app/app-proxy/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "my dog as an astronaut in space",
    "image": "https://example.com/dog-photo.jpg",
    "premium": false,
    "human_in_photo": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/...",
  "prompt": "my dog as an astronaut in space",
  "premium": false
}
```

---

## 🎯 How The System Works Now

### Customer Flow:

1. **Upload Photo** → Customer uploads their pet photo
   - Photo is stored and a URL is generated

2. **Enter Prompt** → Customer describes what they want
   - Example: "my dog as a superhero"

3. **Generate Image** → API calls Replicate IP-Adapter
   - **CRITICAL**: Both `prompt` AND `image` are sent to the API
   - Replicate uses the uploaded photo as a reference
   - Generated image preserves the pet's identity

4. **Choose Result** → Customer selects their favorite

5. **Preview on Products** → Customily shows the image on products

6. **Add to Cart** → Standard Shopify checkout

### API Request Format:

```javascript
POST /app-proxy/generate
{
  "prompt": "my dog wearing a crown",
  "image": "https://your-server.com/uploads/dog-123.jpg",  // REQUIRED!
  "premium": false,     // true for HD ($8.99 upcharge)
  "human_in_photo": false  // true to use face-specific model
}
```

**KEY POINT**: The `image` field MUST contain the URL to the customer's uploaded photo!

---

## 🔧 Technical Details

### Model Selection Logic

The code automatically selects the right Replicate model:

- **If `human_in_photo: true`** → Uses `lucataco/ip_adapter-sdxl-face`
  - Best for photos containing both people and pets
  - Better at preserving human faces

- **If `human_in_photo: false`** → Uses `lucataco/ip_adapter-sdxl-image`
  - Optimized for pet-only photos
  - Works great for dogs, cats, other animals

### Premium vs Standard:

| Feature | Standard | Premium (HD +$8.99) |
|---------|----------|---------------------|
| Inference Steps | 30 | 50 |
| Guidance Scale | 5.0 | 7.5 |
| Processing Time | ~30-45 sec | ~60-90 sec |
| Quality | Good | Better detail/clarity |

### Error Handling:

The endpoint now handles:
- ✅ Missing prompt → Returns 400 error
- ✅ Missing image → Returns 400 error with clear message
- ✅ Missing API token → Returns 500 error
- ✅ Generation failure → Returns 500 with details
- ✅ Timeout (90 seconds) → Returns 504 error
- ✅ All responses include CORS headers

---

## 🐛 Troubleshooting

### "Replicate API token not configured"
→ You forgot Step 1 above. Add the token to Vercel environment variables and redeploy.

### "Image is required - customer must upload their pet photo first"
→ The frontend is not sending the `image` field. Check your Shopify theme code.

### "Failed to start image generation"
→ Check the Replicate API token is correct and has credits.

### Images still look random / not like the uploaded pet
→ Make sure the `image` URL being sent is:
- Publicly accessible (Replicate needs to fetch it)
- A valid image format (JPG, PNG, WebP)
- Actually contains the pet photo (not a placeholder)

---

## 📊 Product IDs for Integration

When customers add to cart, use these variant IDs:

| Product Name | Variant ID |
|-------------|-----------|
| Cotton Canvas Tote Bag | 15579600683089 |
| Custom Pet Portrait Velveteen Plush Blanket | 15579600257105 |
| Custom Pet Portrait Tough Phone Case | 15579599929425 |
| Custom Funny Pet Portrait Canvas Print | 15579598913617 |
| Custom Funny Pet Portrait Canvas Print Upload | 15579585052753 |
| Custom Dog Bag | 15574750265425 |
| Regal Canine Portrait Canvas | 15569325457489 |
| Custom Royal Pet Portrait Canvas | 15533020807249 |
| Custom Pet Portrait T-Shirt | 7855615672401 |

**HD Upsell Product:**
- Create a hidden product called "HD Artwork Upgrade" priced at $8.99
- Add it as a second line item when customer selects HD option

---

## 🎨 Frontend Integration Checklist

Your Shopify theme needs to:

- [ ] Upload customer's pet photo and get a public URL
- [ ] Send both `prompt` AND `image` to `/app-proxy/generate`
- [ ] Show loading state during generation (~30-90 seconds)
- [ ] Display generated image to customer
- [ ] Allow customer to select from multiple variations
- [ ] Show preview on products via Customily
- [ ] Add correct product variant ID to cart
- [ ] Add HD upgrade product if premium is selected
- [ ] Include custom properties in cart (uploaded image URL, generated image URL, etc.)

---

## 💰 Cost Estimation

**Replicate IP-Adapter Pricing:**
- Standard generation (~30 steps): ~$0.02 - $0.03 per image
- Premium generation (~50 steps): ~$0.03 - $0.05 per image

**Recommended Pricing:**
- Charge customers $8.99 for HD upgrade
- Your margin: ~$8.90+ per HD order
- Standard orders: Free generation (or build into product price)

---

## 🔐 Security Notes

- ✅ REPLICATE_API_TOKEN is kept server-side only (environment variable)
- ✅ Never expose the token in frontend code
- ✅ API endpoint validates all inputs
- ✅ CORS headers allow cross-origin requests from your storefront
- ⚠️ Upload endpoint stores images in-memory (lost on server restart)
  - Consider upgrading to Vercel Blob or AWS S3 for production

---

## 📞 Need Help?

If something isn't working:

1. Check Vercel deployment logs for errors
2. Test the API endpoint directly with curl
3. Verify the Replicate API token has credits
4. Make sure the uploaded image URL is publicly accessible
5. Check the browser console for frontend errors

---

## ✨ Next Steps (Optional Improvements)

- [ ] Add multiple image outputs (num_outputs: 3) for customer choice
- [ ] Implement proper image storage (Vercel Blob or S3)
- [ ] Add content moderation filter for uploads
- [ ] Create admin dashboard to view generated images
- [ ] Add analytics tracking for generation success rate
- [ ] Implement retry logic for failed generations
- [ ] Add image caching to reduce costs

---

**Last Updated:** October 30, 2025
**Status:** ✅ Ready for deployment
**Critical Fix:** Image generation now preserves customer's pet identity
