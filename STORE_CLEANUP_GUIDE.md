# 🧹 All Dogs Rock - Store Cleanup Guide

## What You're Cleaning Up

Your Shopify store at **www.alldogsrockshop.com** currently has old test pages that confuse customers. You want customers to ONLY see:

✅ **The working flow**: `/pages/create-iconic-dog` (upload dog photo → choose Washington pose → generate image)

## Option 1: Manual Cleanup (Easiest)

### Step 1: Log in to Shopify Admin
Go to: https://8k5mna-5e.myshopify.com/admin

### Step 2: Navigate to Pages
Click: **Online Store** → **Pages**

### Step 3: Delete Old Pages

Look for these pages and DELETE them if they exist:
- ❌ "Iconic Dog Gallery"
- ❌ "Create Your Dog" (if there are multiple versions)
- ❌ "Test Page"
- ❌ "Gallery"
- ❌ Any other test/demo pages

**KEEP THIS ONE:**
- ✅ "Create Iconic Dog" (`/pages/create-iconic-dog`) - This is your working page!

### Step 4: Check Collections
Click: **Products** → **Collections**

Delete any old/test collections that customers shouldn't see.

---

## Option 2: Automated Cleanup Tool

### Using the HTML Tool:

1. **Download** the file: `shopify-cleanup-tool.html` from this repo
2. **Edit line 97** and replace `'YOUR_SHOPIFY_ADMIN_TOKEN_HERE'` with your AllDogsRock_Gallery_Admin_App_Key token
3. **Open** the HTML file in your browser
4. **Click** "Load All Pages" to see what's on your store
5. **Delete** any pages that aren't the working one
6. **Click** "Load All Collections" and delete confusing ones

---

## What to Keep vs Delete

### ✅ KEEP:
- `/pages/create-iconic-dog` - Your working upload + generate page
- `/pages/home` - Your homepage (if you have one)
- Any product pages you've created

### ❌ DELETE:
- Any duplicate "Create Dog" or "Gallery" pages
- Old test pages
- Pages with names like "Test", "Demo", "Draft"
- Empty collections
- Collections named "All" or "Frontpage" (unless you use them)

---

## After Cleanup

Once you've removed the old pages, customers will only see:

1. **Homepage** at www.alldogsrockshop.com
2. **Create Iconic Dog** page (your working flow)
3. **Products** (when you add them)

Clean and simple!

---

## Quick Check

Visit these URLs and make sure you DON'T see any confusing pages:
- www.alldogsrockshop.com (homepage - should be clean)
- www.alldogsrockshop.com/pages (should redirect or show 404)
- www.alldogsrockshop.com/collections (should only show collections you want)

---

## Need Help?

If you want me to help identify specific pages, just tell me what you see when you visit:
- Your Shopify Admin → Online Store → Pages
- The navigation menu on your live store

I can then tell you exactly which ones to delete!
