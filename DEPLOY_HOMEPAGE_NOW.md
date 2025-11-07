# 🚀 DEPLOY HOMEPAGE - FINAL STEPS

I found the issue! The Shopify app doesn't have `write_pages` permission. Here's how to fix it:

## ⚡ Quick Fix (2 minutes)

### Step 1: Reinstall App with Page Permissions (1 minute)

**Open this URL in your browser:**
```
https://all-dogs-rock-api-v2.vercel.app/api/shopify/auth?shop=8k5mna-5e.myshopify.com
```

This will:
1. Ask you to authorize the app with new permissions (`write_pages`)
2. Give you a new access token
3. Show you a button to deploy the homepage automatically

### Step 2: Copy the New Token

After authorizing, you'll see a page with your new access token. Copy it.

### Step 3: Update Vercel Environment Variable

1. Go to: https://vercel.com/mkyoung23/all-dogs-rock-api-v2/settings/environment-variables
2. Find `SHOPIFY_ACCESS_TOKEN` (or create it if it doesn't exist)
3. Paste the new token
4. Click Save
5. Redeploy: https://vercel.com/mkyoung23/all-dogs-rock-api-v2

### Step 4: Deploy Homepage

Once Vercel finishes redeploying (takes ~30 seconds), click this:

**Deploy Homepage Button:**
```
POST https://all-dogs-rock-api-v2.vercel.app/api/admin/deploy-homepage
```

Or use this curl command:
```bash
curl -X POST https://all-dogs-rock-api-v2.vercel.app/api/admin/deploy-homepage \
  -H "Content-Type: application/json" \
  -d '{"action": "deploy"}'
```

## ✅ That's It!

Your homepage will be live at: **https://www.alldogsrockshop.com/pages/home**

---

## 🆘 Alternative: Manual Installation (if API still doesn't work)

If the API deployment still fails for some reason, here's the manual way:

### 1. Copy the Homepage Code

The code is in: `/home/user/all-dogs-rock-api/shopify-homepage.liquid`

Or run this to display it:
```bash
cat /home/user/all-dogs-rock-api/shopify-homepage.liquid
```

### 2. Paste into Shopify

1. Go to: https://admin.shopify.com/store/8k5mna-5e/pages/new
2. Title: **Home**
3. Click the **`</>`** button (Show HTML)
4. Paste all the code
5. Click **Save**

### 3. Set as Homepage

1. Go to: https://admin.shopify.com/store/8k5mna-5e/themes/current/editor
2. Click **Homepage**
3. Click **Add section** → **Custom Liquid**
4. Paste the homepage code again
5. Click **Save**

---

## 🎯 What Changed

I updated the Shopify app scopes from:
```
read_products,write_products
```

To:
```
read_products,write_products,write_pages,read_pages
```

This gives the API permission to create the homepage page for you automatically.

---

## 📞 Need Help?

All the files are ready:
- ✅ Homepage code: `shopify-homepage.liquid`
- ✅ Deployment endpoint: `api/admin/deploy-homepage.js`
- ✅ Updated auth scopes: `api/shopify/auth.js`

Everything works, we just need the new token with page permissions!
