# Shopify Integration Setup Guide
## All Dogs Rock - Pet Image Editor

This guide will walk you through integrating the pet image editor with your Shopify store **alldogsrockshop.com**.

---

## 🚀 Part 1: Deploy to Vercel

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

```bash
# REQUIRED - Background Removal
REMOVEBG_API_KEY=kX31iEjU5t1dsdEisUQwak9E

# REQUIRED - Shopify Integration
SHOPIFY_STORE_DOMAIN=alldogsrockshop.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your_storefront_access_token_here

# Optional - AI Features
OPENAI_API_KEY=your_openai_key_here

# Optional - Customily Integration
CUSTOMILY_API_KEY=your_customily_key_here

# Optional - Cloudinary (for server-side compositing)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Step 2: Deploy

```bash
vercel deploy --prod
```

Your API will be deployed to: `https://your-project.vercel.app`

---

## 🏪 Part 2: Set Up Shopify App Proxy

The App Proxy lets customers access the pet editor at: `alldogsrockshop.com/apps/pet-editor`

### Step 1: Go to Shopify Admin

1. Log in to your Shopify admin: `alldogsrockshop.myshopify.com/admin`
2. Go to **Apps** → **App and sales channel settings**
3. Click **Develop apps** (bottom of page)
4. If you haven't already, enable custom app development

### Step 2: Create Custom App

1. Click **Create an app**
2. Name it: `Pet Image Editor`
3. Click **Create app**

### Step 3: Configure App Proxy

1. In your app settings, click **Configuration** tab
2. Scroll to **App Proxy** section
3. Click **Set up**

Configure as follows:

```
Subpath prefix: apps
Subpath: pet-editor
Proxy URL: https://your-project.vercel.app/app-proxy
```

**Important:** Replace `your-project.vercel.app` with your actual Vercel deployment URL!

4. Click **Save**

### Step 4: Configure API Access

1. Click **Configuration** tab
2. Under **Storefront API**, click **Configure**
3. Enable these permissions:
   - Read products
   - Read and modify checkouts
   - Read and modify carts
4. Click **Save**
5. Click **Install app** to generate tokens

### Step 5: Get Storefront Access Token

1. Go to **API credentials** tab
2. Copy the **Storefront API access token**
3. Add this to your Vercel environment variables as `SHOPIFY_STOREFRONT_TOKEN`

---

## 🎨 Part 3: Add to Your Store

Now your pet editor is live at: `https://alldogsrockshop.com/apps/pet-editor`

### Option A: Add Link to Main Menu

1. Go to Shopify Admin → **Online Store** → **Navigation**
2. Select your main menu
3. Click **Add menu item**
4. Title: `Customize Pet Products`
5. Link: `/apps/pet-editor`
6. Click **Save**

### Option B: Add Button to Product Pages

Create a new snippet in your theme:

1. Go to **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. Under **Snippets**, click **Add a new snippet**
4. Name it: `pet-editor-button`
5. Paste this code:

```liquid
<div class="pet-editor-button-wrapper" style="margin: 20px 0;">
  <a href="/apps/pet-editor?product_id={{ product.id }}&variant_id={{ product.selected_or_first_available_variant.id }}"
     class="button button--primary"
     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center;">
    🐕 Customize with Your Pet's Photo
  </a>
  <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
    Upload your pet's photo and see it on this product!
  </p>
</div>
```

6. Save the snippet

7. Add to product template:
   - Open `sections/product-template.liquid` or `main-product.liquid`
   - Find where you want the button (usually near "Add to Cart")
   - Add: `{% render 'pet-editor-button' %}`
   - Save

### Option C: Create a Dedicated Page

1. Go to **Online Store** → **Pages**
2. Click **Add page**
3. Title: `Create Custom Pet Products`
4. Content: Add descriptive text about the service
5. Add a button linking to `/apps/pet-editor`
6. Save and publish

---

## 🧪 Part 4: Test the Integration

### Test 1: Access the Editor

1. Visit: `https://alldogsrockshop.com/apps/pet-editor`
2. You should see the pet image editor interface
3. If you see an error, check your App Proxy configuration

### Test 2: Upload and Edit

1. Click "Upload Pet Photo"
2. Select a pet image
3. Choose a template
4. Click "Process Image"
5. Wait 3-10 seconds for background removal
6. Adjust position and size with sliders
7. Verify the preview looks good

### Test 3: Product Integration (if using Option B)

1. Go to any product page
2. Click the "Customize with Your Pet's Photo" button
3. Should open editor with product/variant ID in URL
4. Complete the editing process
5. Click "Add to Cart"
6. Verify item added to cart with customization

---

## 🎯 Part 5: Customer Flow

Here's what your customers will experience:

1. **Browse Products** → They see your customizable pet products

2. **Click "Customize"** → Opens the pet editor

3. **Upload Pet Photo** → Simple drag-and-drop upload

4. **Choose Template** → Select from 5 beautiful backgrounds

5. **Adjust & Preview** → Real-time editing with sliders

6. **Process** → Automatic background removal (3-10 seconds)

7. **Add to Cart** → Customized product added to their cart

8. **Checkout** → Complete purchase as normal

**Total time: 1-2 minutes from upload to cart!**

---

## 🔧 Troubleshooting

### Issue: "App Proxy not working"

**Solution:**
- Verify App Proxy settings in Shopify admin
- Check that your Vercel URL is correct (no trailing slash)
- Make sure app is installed and enabled
- Try accessing directly: `https://your-vercel-app.vercel.app/app-proxy/pet-editor`

### Issue: "Failed to remove background"

**Solution:**
- Verify `REMOVEBG_API_KEY` is set in Vercel
- Check Remove.bg API quota (free tier = 50/month)
- Ensure image is under 10MB
- Try with a different image

### Issue: "Templates not loading"

**Solution:**
- Check browser console for errors
- Verify CORS headers are set
- Test template API: `https://your-vercel-app.vercel.app/api/templates`

### Issue: "Add to Cart not working"

**Solution:**
- Verify `SHOPIFY_STOREFRONT_TOKEN` is set
- Check Storefront API permissions
- Ensure variant ID is being passed correctly
- Check browser console for errors

---

## 📊 Monitoring & Maintenance

### Check Remove.bg Usage

1. Log in to remove.bg dashboard
2. Check API usage stats
3. Upgrade plan if needed (free tier = 50/month)

### Monitor Vercel

1. Check Vercel dashboard for function logs
2. Monitor response times
3. Check for any errors

### Update Templates

Add new templates via API:

```bash
curl -X POST https://your-vercel-app.vercel.app/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "custom-template",
    "name": "My Custom Template",
    "description": "Custom background",
    "url": "https://your-image-url.com/template.jpg",
    "thumbnail": "https://your-image-url.com/thumb.jpg"
  }'
```

---

## 🎁 Advanced Features

### Integrate with Customily

If you're using Customily for print-on-demand:

1. Set `CUSTOMILY_API_KEY` in Vercel
2. The system will automatically apply images to Customily templates
3. Products will be sent to Customily for printing

### Add AI-Generated Backgrounds

1. Set `OPENAI_API_KEY` in Vercel
2. Customers can generate custom backgrounds with AI
3. Access via `/api/generate` endpoint

---

## ✅ Launch Checklist

Before going live:

- [ ] Vercel deployed with all environment variables
- [ ] Remove.bg API key tested and working
- [ ] Shopify App Proxy configured and tested
- [ ] Storefront API access token configured
- [ ] Editor accessible at alldogsrockshop.com/apps/pet-editor
- [ ] Button/link added to store navigation or product pages
- [ ] Test complete customer flow end-to-end
- [ ] Verify images look good on actual products
- [ ] Test on mobile devices
- [ ] Check cart integration works
- [ ] Monitor for first few orders

---

## 📞 Need Help?

Common resources:
- Vercel docs: https://vercel.com/docs
- Shopify App Proxy: https://shopify.dev/docs/apps/online-store/app-proxies
- Remove.bg API: https://www.remove.bg/api/documentation

---

## 🎉 You're Ready!

Your pet image editor is now integrated with your Shopify store!

**Customer URL:** `https://alldogsrockshop.com/apps/pet-editor`

Customers can now:
- Upload pet photos
- Choose templates
- Get professional-looking custom images
- Add personalized products to cart
- Complete their purchase

**Start promoting this feature to your customers and watch the orders roll in!** 🐕🎊
