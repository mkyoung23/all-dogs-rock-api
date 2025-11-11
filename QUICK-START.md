# 🚀 QUICK START - Get Your Store Live in 5 Minutes

**Your All Dogs Rock store is ready to go! Here's the fastest way to get it online:**

---

## ⚡ FASTEST METHOD (Recommended)

### 1. Download this repository to your computer

```bash
git clone <your-repo-url>
cd all-dogs-rock-api
```

### 2. Make sure your .env.local file exists

The script reads credentials from `.env.local`. If you don't have this file, copy from `.env.example`:

```bash
cp .env.example .env.local
# Then edit .env.local with your actual Shopify credentials
```

OR set the environment variable directly:

```bash
export SHOPIFY_SECRET_KEY=your_shopify_admin_token_here
```

### 3. Run the deployment script

```bash
node deploy-shopify-pages-fixed.cjs
```

**That's it!** The script will:
- ✅ Create your Welcome page at `/pages/welcome`
- ✅ Create your Create page at `/pages/create-iconic-dog`
- ✅ Show you the live URLs

### 4. Set your homepage (one-time, 2 minutes)

1. Go to: https://admin.shopify.com/store/alldogsrockshop/themes
2. Click **"..." → "Edit code"**
3. Click **`templates/index.liquid`** in the left sidebar
4. Add this at the **VERY TOP**:

```liquid
<script>window.location.replace('/pages/welcome');</script>
<noscript><meta http-equiv="refresh" content="0; url=/pages/welcome"></noscript>
```

5. Click **Save**

### 5. Test it!

Visit: **https://alldogsrockshop.com**

You should see your beautiful welcome page!

---

## 🆘 ALTERNATIVE METHOD (If script doesn't work)

**See `DEPLOY-INSTRUCTIONS.md` for:**
- Browser-based deployment tool (no coding required)
- Manual copy/paste method
- Detailed troubleshooting

---

## ✅ What Happens After Deployment

Your customers will be able to:

1. **Visit your homepage** → See the welcome page
2. **Click "Get Started"** → Go to the creation page
3. **Upload dog photos** → Select from your device
4. **Choose an iconic pose** → Washington, Rocky, Babe Ruth, etc.
5. **AI generates the image** → Takes 10-15 seconds
6. **Choose a product** → Framed print, canvas, or t-shirt
7. **Checkout** → Complete their purchase!

---

## 🔧 What's Already Configured

- ✅ Shopify store domain: `alldogsrockshop.myshopify.com`
- ✅ Admin API access token (valid)
- ✅ Replicate API for AI image generation
- ✅ Vercel API endpoint ready
- ✅ All page templates created
- ✅ Example images working

---

## 📋 Next Steps (Optional)

After your store is live, you can:

1. **Add products** - Create product listings for framed prints, canvas, t-shirts
2. **Customize theme** - Adjust colors, fonts, layout
3. **Set up payment** - Configure Shopify Payments or other gateway
4. **Configure shipping** - Set up shipping rates and zones
5. **Add domain** - Connect your custom domain (alldogsrockshop.com)

---

## 🐛 Troubleshooting

**"Page not found"**
- Wait 1-2 minutes for Shopify cache to clear
- Clear browser cache or try incognito mode

**"Script error"**
- Make sure Node.js is installed: https://nodejs.org/
- Make sure you're in the right directory: `cd all-dogs-rock-api`

**"Permission denied"**
- Check your access token in `deploy-shopify-pages-fixed.cjs`
- Verify it starts with `shpat_`

**Still stuck?**
- Use the manual method in `DEPLOY-INSTRUCTIONS.md`
- Or contact support

---

## 🎉 You're Ready!

Your All Dogs Rock store is configured and ready to transform dogs into icons!

**Live URLs after deployment:**
- Homepage: https://alldogsrockshop.com
- Welcome: https://alldogsrockshop.com/pages/welcome
- Create: https://alldogsrockshop.com/pages/create-iconic-dog
