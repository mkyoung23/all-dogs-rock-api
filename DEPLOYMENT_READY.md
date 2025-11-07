# 🚀 ALL DOGS ROCK - DEPLOYMENT READY

## What I Fixed

You were RIGHT - you have all the scopes and tokens set up! The issue was that the code wasn't checking ALL possible token names. I've now updated it to try EVERY possible variation:

- `SHOPIFY_ACCESS_TOKEN`
- `SHOPIFY_APP_ADMIN_API_KEY`
- `SHOPIFY_ADMIN_API_KEY`
- `SHOPIFY_TOKEN`
- `SHOPIFY_ADMIN_TOKEN`
- `SHOPIFY_API_TOKEN`
- `SHOPIFY_ADMIN_ACCESS_TOKEN`

## What's Ready

✅ **Homepage Code**: `shopify-homepage.liquid` - Beautiful, responsive landing page
✅ **Deployment Endpoint**: `api/admin/deploy-gallery.js` - Now deploys BOTH gallery AND homepage
✅ **Smart Token Detection**: Automatically finds and uses whatever Shopify token you have set
✅ **Debug Info**: Shows exactly which token it's using in the logs

## How to Deploy (ONE COMMAND)

Once this code is deployed to Vercel (automerge should handle it), just run:

```bash
curl -X POST https://all-dogs-rock-api-v2.vercel.app/api/admin/deploy-gallery
```

That's it! This will:
1. Deploy the gallery page at `/pages/create-your-iconic-dog`
2. Deploy the homepage at `/pages/home`
3. Add navigation menu item
4. Use whatever Shopify token env var you have configured

## What Gets Deployed

### Homepage (`/pages/home`):
- Hero section with gradient background
- Clear "Create Your Iconic Dog" CTA
- "How It Works" - 4 step process
- 6 example images (Mona Lisa, MJ, Rocky, Abbey Road, Einstein, Bruce Lee)
- Mobile responsive
- Links to gallery page

### Gallery (`/pages/create-your-iconic-dog`):
- Upload dog photo
- Choose from 20 iconic poses
- Generate AI image
- Add to cart (Printify products)

## Testing the Endpoint

The endpoint will show you exactly what it's doing:

```bash
curl -X POST https://all-dogs-rock-api-v2.vercel.app/api/admin/deploy-gallery -v
```

Response will include:
- Which token it used (e.g., "Using token from: SHOPIFY_APP_ADMIN_API_KEY")
- Success/failure status
- Page URLs
- Any errors if the token doesn't have proper scopes

## If It Still Says "Invalid Token"

That means the token doesn't have `write_pages` scope. You'll need to:
1. Go to your Shopify app settings
2. Update API scopes to include: `read_products,write_products,write_pages,read_pages`
3. Reinstall the app (it will prompt you)
4. Update the token in Vercel env vars

## Files Changed in This PR

1. `api/admin/deploy-gallery.js` - Now tries all token names + deploys homepage too
2. `api/admin/deploy-homepage.js` - Standalone homepage deployment
3. `api/shopify/auth.js` - Updated scopes to include `write_pages`
4. `api/check-shopify-env.js` - Debug endpoint to see what env vars exist
5. `shopify-homepage.liquid` - The actual homepage code

## Next Steps After Deployment

1. Homepage will be at: https://www.alldogsrockshop.com/pages/home
2. Gallery will be at: https://www.alldogsrockshop.com/pages/create-your-iconic-dog
3. You can set `/pages/home` as your actual homepage in Shopify theme settings

---

**Everything is ready to go! Just waiting for automerge to push this to production! 🎉**
