# 🔍 Vercel Projects Analysis - Which One Should We Use?

Based on the conversation history, you mentioned having **3 Vercel projects**. Let's figure out which one is actually being used and consolidate to avoid confusion.

## 📊 The 3 Projects (Likely):

### 1. **all-dogs-rock-proxy**
- **URL**: Probably `https://all-dogs-rock-proxy.vercel.app`
- **Status**: You mentioned this one "doesn't work" (404 errors)
- **Issue**: May be empty/wrong code or not connected to the right GitHub repo
- **Should we use it?**: ❌ NO - appears to be broken

### 2. **all-dogs-rock-proxy-kappa**
- **URL**: `https://all-dogs-rock-proxy-kappa.vercel.app`
- **Status**: You mentioned this is what your Shopify App Proxy is currently pointing to
- **Current Shopify App Proxy config**:
  - Proxy URL: `https://all-dogs-rock-proxy-kappa.vercel.app/app-proxy`
- **Should we use it?**: ⚠️ MAYBE - if this has your current working code

### 3. **all-dogs-rock-api-v2**
- **Status**: You mentioned "v2 is the one with my api keys in the environment"
- **Has**: Environment variables (OpenAI, Customily, Shopify tokens)
- **Issue**: Unclear if this is connected to correct GitHub repo
- **Should we use it?**: ⚠️ MAYBE - has the environment variables

---

## 🎯 CRITICAL QUESTIONS TO ANSWER:

### Question 1: Which Vercel project is your Shopify App Proxy pointing to?

**To check:**
1. Go to https://admin.shopify.com/store/8k5mna-5e/settings/apps/development
2. Find your public/partner app (should be something like "All Dogs Rock App")
3. Look for "App Proxy" section
4. Check the "Proxy URL" field

**Current guess**: It's probably pointing to `https://all-dogs-rock-proxy-kappa.vercel.app/app-proxy`

### Question 2: Which Vercel projects are connected to your GitHub repo?

**Your GitHub repo**: `mkyoung23/all-dogs-rock-api`

**To check in Vercel:**
1. Go to https://vercel.com
2. For EACH of the 3 projects, click on it
3. Go to Settings → Git
4. Check which GitHub repo it's connected to

**We want**: The project that's connected to `mkyoung23/all-dogs-rock-api` on branch `claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag`

### Question 3: Which project has the environment variables?

**To check:**
1. Go to each Vercel project
2. Settings → Environment Variables
3. Check which one has:
   - `OPENAI_API_KEY`
   - `CUSTOMILY_API_KEY`
   - `SHOPIFY_STOREFRONT_TOKEN`
   - `SHOPIFY_STORE_DOMAIN`

**You said**: "all-dogs-rock-api-v2" has these

---

## 🎯 RECOMMENDED SOLUTION: Consolidate to ONE Project

Here's what I recommend to eliminate confusion:

### Option A: Use **all-dogs-rock-api-v2** (Recommended)

**Why?**
- ✅ Already has environment variables
- ✅ Name matches our code (`all-dogs-rock-api`)
- ✅ Can connect to GitHub repo
- ✅ Clean slate for new deployment

**Steps:**
1. Go to `all-dogs-rock-api-v2` in Vercel
2. Settings → Git → Connect to `mkyoung23/all-dogs-rock-api` repo
3. Add the missing environment variable: `REPLICATE_API_TOKEN`
4. Deploy the branch: `claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag`
5. Get the deployment URL (e.g., `https://all-dogs-rock-api-v2.vercel.app`)
6. Update Shopify App Proxy to point to this URL

### Option B: Fix **all-dogs-rock-proxy-kappa**

**Why?**
- Already connected to Shopify App Proxy
- Don't need to update Shopify settings

**Steps:**
1. Go to `all-dogs-rock-proxy-kappa` in Vercel
2. Add ALL environment variables (copy from v2)
3. Make sure it's connected to correct GitHub repo
4. Add `REPLICATE_API_TOKEN`
5. Redeploy

### Option C: Delete Old Projects & Start Fresh

**Why?**
- Clean up confusion
- Only one project to maintain

**Steps:**
1. Create ONE new Vercel project: `all-dogs-rock-shop`
2. Connect to GitHub: `mkyoung23/all-dogs-rock-api`
3. Add all environment variables (including `REPLICATE_API_TOKEN`)
4. Deploy
5. Update Shopify App Proxy to new URL
6. Delete the 3 old projects

---

## 🔗 Current Shopify Integration (What You Need to Update)

**Shopify App Proxy** must point to whichever Vercel project you choose:

**Current format:**
```
Prefix: apps
Subpath: adrs
Proxy URL: https://[YOUR-VERCEL-PROJECT].vercel.app/app-proxy
```

**This makes requests work like:**
```
Customer visits: https://alldogsrockshop.com/apps/adrs/generate
Shopify forwards to: https://[YOUR-VERCEL-PROJECT].vercel.app/app-proxy/generate
```

**To update Shopify App Proxy:**
1. Go to https://admin.shopify.com/store/8k5mna-5e/settings/apps/development
2. Click on your public/partner app
3. Find "App Proxy" section
4. Update the "Proxy URL" field
5. Save

---

## 🎯 MY RECOMMENDATION (Simplest Path):

**Use all-dogs-rock-api-v2 and rename it:**

1. **Rename Project** (for clarity)
   - Go to `all-dogs-rock-api-v2` in Vercel
   - Settings → General → Project Name
   - Rename to: `all-dogs-rock-shop` (or keep as is)

2. **Verify/Connect GitHub**
   - Settings → Git
   - Make sure it's connected to: `mkyoung23/all-dogs-rock-api`
   - Set production branch to: `claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag`

3. **Add Missing Environment Variable**
   - Settings → Environment Variables
   - Add: `REPLICATE_API_TOKEN` = [your Replicate token from https://replicate.com/account/api-tokens]
   - Select all environments

4. **Deploy**
   - Go to Deployments tab
   - Click "Redeploy"
   - Note the deployment URL

5. **Update Shopify App Proxy**
   - Point to: `https://[your-v2-project-url].vercel.app/app-proxy`

6. **Delete Old Projects**
   - Delete `all-dogs-rock-proxy` (broken)
   - Delete `all-dogs-rock-proxy-kappa` (no longer needed)

---

## 🧪 How to Test Which Project Is Currently Working

Run this test to see which project your store is actually using:

1. Open browser console on your store
2. Run:
```javascript
fetch('/apps/adrs/generate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({prompt: 'test'})
}).then(r => r.json()).then(console.log)
```

3. Check the response:
   - If you get an error about "Image is required" ✅ = New code is deployed (good!)
   - If you get an error about OpenAI ❌ = Old code still deployed
   - If you get 404 ❌ = App Proxy not configured correctly

---

## 📋 Action Items for You:

Can you help me by checking:

1. **In Vercel dashboard**, list the 3 project names you see
2. **In Shopify App Proxy**, what is the current "Proxy URL"?
3. **Which Vercel project** do you want to use as the main one?

Once I know this, I can give you exact step-by-step instructions to consolidate everything to ONE working project!

---

**Bottom line:** Having 3 projects is definitely confusing and can cause issues. Let's consolidate to ONE project that has:
- ✅ Correct code (connected to GitHub)
- ✅ All environment variables (including Replicate)
- ✅ Connected to Shopify App Proxy
- ✅ Deployed and working
