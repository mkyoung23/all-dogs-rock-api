# 🚀 DEPLOY YOUR SHOPIFY PAGES - 3 EASY OPTIONS

Your All Dogs Rock pages are ready to deploy! Choose whichever method works best for you:

---

## ⚡ OPTION 1: Run the Script (FASTEST - 30 seconds)

**From your computer's terminal** (NOT the Claude environment):

```bash
# Clone or download this repo to your computer first, then:
cd all-dogs-rock-api

# Make sure you have .env.local with your Shopify credentials
# OR set the environment variable:
export SHOPIFY_SECRET_KEY=your_shopify_admin_access_token

# Run the script
node deploy-shopify-pages-fixed.cjs
```

**What it does:**
- Automatically creates/updates your Welcome page
- Automatically creates/updates your Create page
- Shows you the live URLs when done

---

## 🌐 OPTION 2: Use the Browser Tool (NO CODING)

1. **Download** the file `deploy-all-shopify-pages.html` from this repo
2. **Open it** in your web browser (Chrome, Firefox, Edge, etc.)
3. **Enter your Shopify admin access token** in the form (starts with `shpat_`)
4. **Click** the "Deploy Everything Now" button
5. **Wait** 10 seconds while it deploys

**That's it!** The tool runs entirely in your browser and shows you real-time progress.

---

## 🖱️ OPTION 3: Manual Copy/Paste (15 minutes)

If the scripts don't work, you can do this manually:

### Step 1: Create Welcome Page

1. Go to: https://admin.shopify.com/store/alldogsrockshop/pages
2. Click **"Add page"**
3. Fill in:
   - **Title:** `Welcome to All Dogs Rock`
   - **Content:** Click the `<>` button (Show HTML), then paste **entire contents** of `WELCOME_PAGE.liquid`
4. **Save**

### Step 2: Set URL Handle for Welcome Page

1. Click on the page you just created
2. In the **Search engine listing** section at the bottom, click "Edit website SEO"
3. Set **URL handle** to: `welcome`
4. **Save**

### Step 3: Create Main Page

1. Still in **Pages**, click **"Add page"** again
2. Fill in:
   - **Title:** `Create Your Iconic Dog`
   - **Content:** Click `<>` (Show HTML), paste **entire contents** of `MAIN_PAGE_WITH_PRODUCTS.liquid`
3. In **Search engine listing** section, set **URL handle** to: `create-iconic-dog`
4. **Save**

---

## 📍 After Deployment - Set Your Homepage

Whichever method you used, now set your homepage to redirect:

### Auto-Redirect Method (Recommended):

1. Go to: https://admin.shopify.com/store/alldogsrockshop/themes
2. Click **"..." next to your active theme** → **"Edit code"**
3. In left sidebar, click: **`templates/index.liquid`**
4. Add this code at the **VERY TOP** of the file:

```liquid
{%- comment -%}
AUTO-REDIRECT TO WELCOME PAGE
{%- endcomment -%}

<script>
  window.location.replace('/pages/welcome');
</script>

<noscript>
  <meta http-equiv="refresh" content="0; url=/pages/welcome">
</noscript>
```

5. Click **"Save"** (top right)

---

## ✅ Test Your Pages

Open these URLs in an **incognito/private window** to see them:

- **Welcome Page:** https://alldogsrockshop.com/pages/welcome
- **Create Page:** https://alldogsrockshop.com/pages/create-iconic-dog
- **Homepage:** https://alldogsrockshop.com (should redirect to welcome)

---

## 🐛 Troubleshooting

### "Page not found"
- Wait 1-2 minutes for Shopify's cache to clear
- Clear your browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
- Try in incognito/private mode

### Script won't run
- Make sure you have Node.js installed: https://nodejs.org/
- Make sure you're in the project directory: `cd all-dogs-rock-api`
- Try the browser tool instead (Option 2)

### "Permission denied" error
- Your access token might be invalid
- Check that your Admin API access token starts with `shpat_`
- Verify the token has `write_online_store_pages` permission

---

## 📧 Need Help?

If you're stuck:
1. Try the **Browser Tool** (Option 2) - it's the most reliable
2. Or do it **Manually** (Option 3) - guaranteed to work
3. Check the Shopify Admin directly to see if pages were created

---

**You're almost done!** Once these pages are live, customers can start creating iconic dog images! 🐕
