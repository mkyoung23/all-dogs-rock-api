# 🎨 Template Generation Guide

## Current Status

All 20 iconic pose templates need real dog images. Currently using placeholder images.

**Issue**: Vercel API endpoints returning "Access denied" - need to fix deployment settings first.

## 🔧 Step 1: Fix Vercel "Access Denied" Issue

Your Vercel deployment is currently blocking all API access. To fix this:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `all-dogs-rock-api-v2`
3. **Go to Settings → Deployment Protection**
   - Make sure it's set to **"Disabled"** or **"Standard Protection"** (not "Only Production Deployment")
   - If using Standard, make sure you're accessing the production URL

4. **Check Settings → Security**
   - Ensure no IP restrictions are enabled
   - Disable any authentication on public API routes

5. **Test the fix**:
   ```bash
   curl https://all-dogs-rock-api-v2.vercel.app/api/poses/list
   ```
   Should return JSON, not "Access denied"

## 🚀 Step 2: Generate All 20 Templates

Once Vercel is accessible, you have **3 options**:

### Option A: Browser-Based Generation (RECOMMENDED - Easiest)

1. **Open the generator page**:
   https://all-dogs-rock-api-v2.vercel.app/generate-all-templates.html

2. **Click "Start Generating All 20 Templates"**
   - Takes ~40-60 seconds
   - Costs ~$0.80 total ($0.04 per HD image)

3. **Copy the JSON output**
   - Save to a file: `generated-template-urls.json`

4. **Update iconic-poses.json**:
   ```bash
   node scripts/update-template-urls.js generated-template-urls.json
   ```

### Option B: Direct Node.js Script (If you can run locally)

If you can't access the browser page, run this locally:

```bash
# Set your OpenAI API key (use the one from Vercel environment variables)
export OPENAI_API_KEY="your-openai-api-key-here"

# Generate all templates
node scripts/generate-with-dalle.js

# Update iconic-poses.json
node scripts/update-template-urls.js generated-template-urls.json
```

### Option C: Call Vercel API Directly

```bash
curl -X POST https://all-dogs-rock-api-v2.vercel.app/api/generate-templates \
  -H "Content-Type: application/json" \
  -d '{"batchMode": true}' \
  | jq '.results' > generated-template-urls.json

node scripts/update-template-urls.js generated-template-urls.json
```

## 📦 Step 3: Commit and Deploy

```bash
# Commit the updated iconic-poses.json
git add iconic-poses.json
git commit -m "feat: Update all 20 poses with real DALL-E 3 generated images"
git push

# Vercel will auto-deploy
```

## ✅ Step 4: Test the Complete Flow

1. **Visit your Shopify store**
2. **Go to the AI Creator page** (wherever you embedded shopify-ai-creator-pose-gallery.liquid)
3. **Upload a dog photo**
4. **Select an iconic pose** - you should see real dog template images now
5. **The face swap should happen automatically**
6. **View the result** - your dog's face on the iconic pose template

## 🔍 Verification Checklist

- [ ] Vercel API endpoints are accessible (not "Access denied")
- [ ] All 20 templates generated successfully
- [ ] iconic-poses.json updated with real URLs
- [ ] Changes committed and pushed
- [ ] Vercel deployed successfully
- [ ] Shopify page shows real template images
- [ ] Face swap works end-to-end
- [ ] Can purchase products with generated images

## 🐛 Troubleshooting

### "Access denied" on all Vercel endpoints
→ Fix Deployment Protection settings (Step 1 above)

### Template generation fails
→ Check OPENAI_API_KEY is set in Vercel environment variables
→ Verify API key is valid and has credits

### Face swap not working
→ Check REPLICATE_API_TOKEN in Vercel environment
→ Verify template URLs are publicly accessible

### Images not loading in Shopify
→ DALL-E 3 URLs expire after ~1 hour
→ You may need to re-host images permanently (use Cloudinary, S3, or Vercel Blob)

## 💡 Important Notes

**DALL-E 3 URLs Expire!**

OpenAI's DALL-E 3 returns temporary URLs that expire after ~1 hour. For production, you should:

1. Generate the 20 templates
2. Download each image
3. Re-upload to permanent hosting:
   - Vercel Blob Storage
   - Cloudinary
   - AWS S3
   - Shopify Files

I can create a script to do this automatically if needed.

## 📞 Need Help?

If you're stuck, check:
1. Vercel deployment logs: https://vercel.com/mkyoung23/all-dogs-rock-api-v2/deployments
2. Vercel environment variables are set correctly
3. All API keys are valid and have credits

---

**Current deployment**: `claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag` branch

Last updated: 2025-11-02
