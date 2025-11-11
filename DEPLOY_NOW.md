# 🚀 Deploy Updated Pages to Shopify - Action Required

## ✅ What I've Completed

1. **Updated all 5 page templates** - removed emojis, improved UX, added example images
2. **Fixed the deployment script** to use correct environment variables
3. **Added `SHOPIFY_STORE_DOMAIN` to Vercel** environment variables
4. **Committed all changes** to branch: `claude/cleanup-store-remove-old-pages-011CUyNw8LtUVK81DSJeqSGL`

## 🔴 What You Need to Do NOW

### Step 1: Merge the Latest Commits to Main

You already merged PR #29, but there are 2 new commits that fix the deployment:

```bash
# On GitHub
1. Go to: https://github.com/mkyoung23/all-dogs-rock-api/compare/main...claude/cleanup-store-remove-old-pages-011CUyNw8LtUVK81DSJeqSGL
2. Click "Create pull request"
3. Merge immediately
```

OR via command line:
```bash
cd /path/to/all-dogs-rock-api
git checkout main
git pull origin main
git merge claude/cleanup-store-remove-old-pages-011CUyNw8LtUVK81DSJeqSGL
git push origin main
```

### Step 2: Wait for Vercel to Deploy (2-3 minutes)

Vercel will auto-deploy when you push to main. Check status at:
- https://vercel.com/mkyoung23/all-dogs-rock-api-v2

### Step 3: Deploy Pages to Shopify

**Option A - API Endpoint (Easiest):**
```bash
curl -X POST https://all-dogs-rock-api-v2.vercel.app/api/setup-shopify-pages
```

**Option B - Direct Script (If API fails):**
```bash
cd /path/to/all-dogs-rock-api
./deploy-direct.sh
```

## 📋 Expected Result

After completing these steps, you should see:

✅ **Welcome Page Live**: https://alldogsrockshop.com/pages/welcome
✅ **Create Page Live**: https://alldogsrockshop.com/pages/create-iconic-dog

With:
- No emojis anywhere
- Compact, professional design
- AI-generated example images visible
- Clear "Example" labels on all poses

---

## 🔧 Troubleshooting

### If the API returns 404 errors:

The script needs these Vercel environment variables (I added `SHOPIFY_STORE_DOMAIN`, check if the others exist):

```
SHOPIFY_STORE_DOMAIN=alldogsrockshop.myshopify.com
SHOPIFY_SECRET_KEY=<from your .env.local file>
SHOPIFY_ACCESS_TOKEN=<from your .env.local file>
```

Add them at: https://vercel.com/mkyoung23/all-dogs-rock-api-v2/settings/environment-variables

The values are in your local `.env.local` file in the repo.

### If deploy-direct.sh fails:

1. Make sure you're in the repo directory
2. Run: `chmod +x deploy-direct.sh`
3. Check that `.env.local` exists with the right values
4. Run: `./deploy-direct.sh`

---

## 📞 Status Check

After deploying, verify everything works:

1. Visit: https://alldogsrockshop.com
2. You should see the welcome page (or set it as homepage in Shopify)
3. Click "Get Started Now" → should go to create page
4. Upload a dog photo → choose a pose → see AI examples
5. Generate → see result → choose product

---

## 🎯 What's NOT Done Yet

The product templates (framed print, canvas, t-shirt) have image customization controls, but they DON'T actually add to Shopify cart yet. That requires:

1. Creating actual products in Shopify
2. Linking to Printify/Customily fulfillment
3. Updating cart integration code

Let me know when you want to tackle that next!
