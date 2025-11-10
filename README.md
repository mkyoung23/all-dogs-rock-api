# All Dogs Rock Shop - API

This is the backend API for **www.alldogsrockshop.com** - a Shopify store that transforms customer's dog photos into iconic scenes.

## How It Works

1. Customer uploads photo of their dog
2. Customer picks an iconic pose (Washington, Rocky, Babe Ruth, or NFL Team)
3. AI (FLUX Kontext Pro) preserves the EXACT dog and places it in the iconic scene
4. Customer gets their personalized dog image to purchase on products

## Current Poses

- **Washington Crossing Delaware** - Dog as General Washington
- **Rocky at the Steps** - Dog as Rocky Balboa with arms raised
- **Babe Ruth Called Shot** - Dog pointing to outfield
- **NFL Team Photo** - Dog in custom NFL jersey (pick team + number)

## Files

- `iconic-poses.json` - The 4 available poses
- `api/app-proxy/generate.js` - Main generation endpoint (uses FLUX Kontext Pro)
- `api/poses/list.js` - Returns list of poses
- `shopify-gallery-with-upload.liquid` - The Shopify page code
- `vercel.json` - Deployment config

## Deployed To

- **API:** https://all-dogs-rock-api-v2.vercel.app
- **Shopify Page:** www.alldogsrockshop.com/pages/create-iconic-dog

## Adding New Poses

Edit `iconic-poses.json` and add new pose objects. Push to deploy automatically via Vercel.
