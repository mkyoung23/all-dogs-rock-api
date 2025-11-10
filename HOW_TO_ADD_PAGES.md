# 🚀 How to Add Shopify Pages

## Quick Setup (2 Minutes)

All your Vercel environment variables are already configured! Just add the pages to Shopify:

### Step 1: Add Welcome Page

1. Go to **Shopify Admin** → **Online Store** → **Pages**
2. Click **Add page**
3. **Title**: `Welcome to All Dogs Rock`
4. **Content**: Click the `<>` button (Show HTML)
5. Open `WELCOME_PAGE.liquid` from this repo
6. Copy ALL contents and paste into Shopify
7. Click **Save**

### Step 2: Add Main Creation Page

1. Click **Add page** again
2. **Title**: `Create Your Iconic Dog`
3. **Content**: Click `<>` button
4. Open `MAIN_PAGE_WITH_PRODUCTS.liquid` from this repo
5. Copy ALL contents and paste into Shopify
6. **IMPORTANT**: Under "Search engine listing" → Click "Edit website SEO"
7. Set **URL handle** to: `create-iconic-dog`
8. Click **Save**

## Your Live URLs

After creating the pages:

- **Welcome**: https://alldogsrockshop.com/pages/welcome
- **Creation Flow**: https://alldogsrockshop.com/pages/create-iconic-dog

## What's Already Set Up

✅ All API keys are in Vercel environment variables
✅ Shopify Admin API access configured
✅ Printify integration ready
✅ Replicate AI image generation ready
✅ OpenAI backup generation ready
✅ All 5 iconic pose templates built

## Testing

1. Visit the creation page
2. Upload a dog photo
3. Choose an iconic pose
4. Wait for AI generation (~10-15 seconds)
5. Choose your product (framed print, canvas, or t-shirt)

## Need Help?

Check `SHOPIFY_SETUP_GUIDE.md` for detailed troubleshooting.
