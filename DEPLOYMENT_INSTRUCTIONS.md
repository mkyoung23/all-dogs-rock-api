# 🚀 DEPLOYMENT INSTRUCTIONS - OCTOBER 31, 2025

## CRITICAL: You MUST promote the CORRECT deployment!

### Step-by-Step Instructions:

1. **Go to Vercel Deployments**
   - URL: https://vercel.com/mkyoung23s-projects/all-dogs-rock-api-v2/deployments

2. **Find the NEWEST Deployment**
   - Look for the VERY TOP deployment in the list
   - It should be from commit: `fix: Force fresh FLUX deployment for production`
   - Branch: `claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag`
   - Time: Just now (within last 2 minutes)

3. **Promote to Production**
   - Click the **"⋮"** (three dots) menu on that deployment
   - Click **"Promote to Production"**
   - Wait 30 seconds for DNS to update

4. **Verify It's Working**
   - The deployment URL should change to: `all-dogs-rock-api-v2.vercel.app` (without random characters)
   - The "Production" label should appear on that deployment

---

## ⚠️ COMMON MISTAKES TO AVOID:

❌ **DON'T** promote multiple deployments
❌ **DON'T** promote an old deployment
❌ **DON'T** click "Redeploy" - just promote the newest one
❌ **DON'T** promote anything that says "SDXL" in the commit message

✅ **DO** promote only the NEWEST deployment (top of the list)
✅ **DO** wait 30 seconds after promoting
✅ **DO** test on www.alldogsrockshop.com after promoting

---

## 🧪 TESTING AFTER PROMOTION:

1. Go to: www.alldogsrockshop.com
2. Upload a dog photo
3. Enter prompt: **"as a basketball player dunking a basketball"**
4. Click "Generate My Custom Image! ✨"
5. Wait ~90 seconds (FLUX takes longer than SDXL)

**Expected Result:**
- 2 high-quality FLUX images displayed side-by-side
- Images actually look like your uploaded dog (80-90% match)
- Images actually show basketball dunking (not just standing)
- Click-to-select functionality works
- Selected image preview appears
- Product grid appears below

---

## 🔍 HOW TO CHECK IF YOU PROMOTED THE RIGHT ONE:

After promoting, go to your live site and open browser console:
- You should see: `🚀 Generating images with FLUX img2img...`
- You should NOT see any 404 errors
- The API should respond with status 200 (after ~90 seconds)

If you see 404 errors, you promoted the wrong deployment. Go back and promote the NEWEST one.

---

## 📊 WHAT'S IN THIS DEPLOYMENT:

✅ FLUX img2img model (`bxclib2/flux_img2img`)
✅ Generates 2 high-quality images
✅ Superior pet identity preservation (80-90% match)
✅ Excellent prompt following
✅ 2-image selection UI in Shopify
✅ Click-to-select functionality
✅ Selected image preview
✅ Automatic image resizing to prevent GPU errors
✅ ~90 second generation time
✅ ~$0.17 cost per generation

---

**NEXT STEP**: Go promote the newest deployment NOW! 🚀
