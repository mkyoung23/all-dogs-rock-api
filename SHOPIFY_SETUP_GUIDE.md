# 🚀 ALL DOGS ROCK - SHOPIFY SETUP GUIDE

Since the Shopify Admin API isn't accessible directly, here's the SIMPLE copy/paste method:

## 📋 QUICK SETUP (5 MINUTES)

### STEP 1: Create Welcome Page

1. Go to **Shopify Admin** → **Online Store** → **Pages**
2. Click **Add page**
3. Fill in:
   - **Title**: `Welcome to All Dogs Rock`
   - **Content**: Click the `<>` (Show HTML) button, then paste the ENTIRE contents of `WELCOME_PAGE.liquid`
4. Click **Save**
5. **Set as homepage** (optional): Go to Online Store → Themes → Customize → Homepage → Select "Welcome"

---

### STEP 2: Create Main Creation Page

1. Still in **Pages**, click **Add page**
2. Fill in:
   - **Title**: `Create Your Iconic Dog`
   - **Content**: Click `<>` (Show HTML), paste ENTIRE contents of `MAIN_PAGE_WITH_PRODUCTS.liquid`
3. In **Search engine listing** section, set **URL handle** to: `create-iconic-dog`
4. Click **Save**

---

### STEP 3: Create Product Pages (if using Customily/Printify)

For each product, create a Shopify product:

#### Framed Print Product:
1. **Products** → **Add product**
2. **Title**: `Framed Iconic Dog Print`
3. **Description**: Click `<>` and paste `PRODUCT_FRAMED_PRINT.liquid`
4. **Price**: $49.99
5. **URL handle**: `framed-iconic-dog-print`
6. Save

#### Canvas Print Product:
1. **Products** → **Add product**
2. **Title**: `Canvas Iconic Dog Print`
3. **Description**: Click `<>` and paste `PRODUCT_CANVAS_PRINT.liquid`
4. **Price**: $59.99
5. **URL handle**: `canvas-iconic-dog-print`
6. Save

#### T-Shirt Product:
1. **Products** → **Add product**
2. **Title**: `Iconic Dog T-Shirt`
3. **Description**: Click `<>` and paste `PRODUCT_TSHIRT.liquid`
4. **Price**: $29.99
5. **URL handle**: `iconic-dog-tshirt`
6. Save

---

## 🔗 YOUR LIVE URLS (after setup)

- **Welcome Page**: https://alldogsrockshop.com/pages/welcome
- **Create Page**: https://alldogsrockshop.com/pages/create-iconic-dog
- **Framed Print**: https://alldogsrockshop.com/products/framed-iconic-dog-print
- **Canvas Print**: https://alldogsrockshop.com/products/canvas-iconic-dog-print
- **T-Shirt**: https://alldogsrockshop.com/products/iconic-dog-tshirt

---

## ⚙️ VERCEL ENVIRONMENT VARIABLES

Make sure these are set in **Vercel** → **Project Settings** → **Environment Variables**:

### Required:
```
SHOPIFY_SECRET_KEY=your_shopify_admin_access_token
SHOPIFY_STORE_DOMAIN=alldogsrockshop.myshopify.com
REPLICATE_API_TOKEN=your_replicate_api_token
PRINTIFY_TOKEN=your_printify_bearer_token
CUSTOMILY_API_KEY=your_customily_api_key
OPENAI_API_KEY=your_openai_api_key
REMOVEBG_API_KEY=your_removebg_api_key
```

### Optional:
```
PRINTIFY_SHOP_ID=your_printify_shop_id
OPENAI_ORG_ID=your_openai_org_id
VERCEL_TOKEN=your_vercel_token
```

**Note:** Copy these from your `.env.local` file in this repo.

---

## ✅ TESTING THE FLOW

1. Visit https://alldogsrockshop.com/pages/welcome
2. Click "Get Started"
3. Upload a dog photo
4. Choose an iconic pose
5. Wait for AI to generate (calls your Vercel API)
6. Choose a product
7. Customize and add to cart

---

## 📁 FILE REFERENCE

| File | What It Is | Where It Goes |
|------|-----------|---------------|
| `WELCOME_PAGE.liquid` | Landing/welcome page | Shopify → Pages → New page |
| `MAIN_PAGE_WITH_PRODUCTS.liquid` | Main 4-stage creation flow | Shopify → Pages → "Create Your Iconic Dog" |
| `PRODUCT_FRAMED_PRINT.liquid` | Framed print page with editor | Shopify → Products → Description |
| `PRODUCT_CANVAS_PRINT.liquid` | Canvas page with editor | Shopify → Products → Description |
| `PRODUCT_TSHIRT.liquid` | T-shirt page with editor | Shopify → Products → Description |

---

## 🐛 TROUBLESHOOTING

### "API call failed" when generating
- Check Vercel logs: https://vercel.com/your-project/logs
- Verify all environment variables are set in Vercel
- Make sure Replicate API token is valid

### Images not loading
- Check CORS settings on your API
- Verify the API URL in MAIN_PAGE_WITH_PRODUCTS.liquid line 570

### Product links broken
- Verify URL handles match exactly:
  - `create-iconic-dog`
  - `framed-iconic-dog-print`
  - `canvas-iconic-dog-print`
  - `iconic-dog-tshirt`

---

## 🎉 THAT'S IT!

You now have a complete AI dog image generator integrated into your Shopify store!
