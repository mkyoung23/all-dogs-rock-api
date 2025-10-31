# 🚨 COMPLETE SYSTEM AUDIT & FIX PLAN

## CURRENT STATE ANALYSIS

### GitHub Repositories

#### ✅ mkyoung23/all-dogs-rock-api (MAIN - KEEP THIS)
- **Status**: Active, contains all working code
- **Branch**: claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag
- **Connected to**: Vercel project all-dogs-rock-api-v2
- **Action**: KEEP - This is your primary repo

#### ❓ ymcmb232324-4AllTheDogs-Rome/all-dogs-rock-proxy (CONFLICT?)
- **Status**: Private repo, possibly outdated
- **Problem**: Might be connected to old Vercel project
- **Action**: CHECK IF IT'S CONNECTED TO ANYTHING, if not DELETE IT

---

## VERCEL PROJECTS AUDIT

### ✅ all-dogs-rock-api-v2 (PRIMARY - KEEP THIS)
- **Domain**: all-dogs-rock-api-v2.vercel.app
- **Status**: Production deployment active
- **Git Source**: mkyoung23/all-dogs-rock-api
- **Branch**: claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag
- **Action**: KEEP - This is correct

### ❌ all-dogs-rock-api (DUPLICATE - DELETE?)
- **Problem**: Duplicate project causing confusion
- **Action**: CHECK if anything uses this, then DELETE

### ❌ all-dogs-rock-proxy (OLD PROJECT - DELETE?)
- **Domain**: all-dogs-rock-proxy.vercel.app
- **Problem**: This is the OLD project your Shopify code WAS calling
- **Action**: DELETE THIS - It's not being used anymore

---

## CRITICAL ISSUES FOUND

### 🔴 ISSUE #1: AI Creator Not on Homepage
**Problem**: The AI Creator section is showing on product pages, NOT on the homepage

**WHY**: In Shopify theme customizer, the "AI Creator Workflow" section is:
- Added to: Product Template
- NOT added to: Homepage

**FIX**:
1. Go to Shopify Admin → Online Store → Themes → Customize
2. Make sure you're viewing the HOMEPAGE (not a product page)
3. Click "Add Section"
4. Find "AI Creator Workflow"
5. Add it to the TOP of your homepage
6. REMOVE it from product pages if you don't want it there
7. Save

---

### 🔴 ISSUE #2: Missing REPLICATE_API_TOKEN in Vercel
**Problem**: The API can't generate images without this token

**CHECK**:
1. Go to: https://vercel.com/mkyoung23s-projects/all-dogs-rock-api-v2/settings/environment-variables
2. Look for `REPLICATE_API_TOKEN` in the list
3. If it's NOT there, add it:
   - Name: `REPLICATE_API_TOKEN`
   - Value: `[USE YOUR REPLICATE TOKEN - the one you provided starting with r8_1yPzc...]`
   - Check all 3 environments (Production, Preview, Development)
4. After adding, click "Redeploy" latest deployment

---

### 🔴 ISSUE #3: Multiple Conflicting Projects
**Problem**: You have duplicate Vercel projects and GitHub repos causing confusion

**CLEANUP PLAN**:

#### DELETE These Vercel Projects:
1. ❌ all-dogs-rock-api (duplicate)
2. ❌ all-dogs-rock-proxy (old, using wrong API)

**How to delete**:
1. Go to each project settings
2. Scroll to bottom
3. Click "Delete Project"
4. Confirm

#### CHECK This GitHub Repo:
1. Go to: https://github.com/ymcmb232324-4AllTheDogs-Rome/all-dogs-rock-proxy
2. Check if ANY Vercel project is connected to it
3. If nothing is connected, DELETE this repo (it's just causing confusion)

---

### 🔴 ISSUE #4: Shopify Calling Wrong Endpoint (MAYBE FIXED?)
**Status**: Your current code shows it's calling the CORRECT endpoint:
```
https://all-dogs-rock-api-v2.vercel.app/app-proxy/generate
```

**BUT VERIFY**:
Open browser console on your site (F12 → Console) and check:
- Does it say: "API: https://all-dogs-rock-api-v2.vercel.app/app-proxy/generate"?
- OR does it say something else?

If it says something else, you need to update the Shopify code.

---

### 🔴 ISSUE #5: Image Generation Not Preserving Pet Identity
**Possible Causes**:
1. ❌ REPLICATE_API_TOKEN not set in Vercel (check Issue #2)
2. ❌ Shopify code sending wrong data format
3. ❌ Vercel function has errors

**TESTING STEPS**:
1. Open www.alldogsrockshop.com
2. Press F12 → Console tab
3. Try generating an image
4. Look for RED errors in console
5. Copy the EXACT error message and tell me

---

## CLEANUP CHECKLIST

### Step 1: Fix Shopify Homepage (5 minutes)
- [ ] Go to Shopify theme customizer
- [ ] View HOMEPAGE
- [ ] Add "AI Creator Workflow" section to top
- [ ] Remove from product pages (optional)
- [ ] Save

### Step 2: Verify/Add Replicate Token (2 minutes)
- [ ] Check if REPLICATE_API_TOKEN exists in Vercel
- [ ] If not, add it with value: r8_1yPzc...
- [ ] Redeploy after adding

### Step 3: Delete Duplicate Vercel Projects (3 minutes)
- [ ] Delete all-dogs-rock-api project
- [ ] Delete all-dogs-rock-proxy project
- [ ] Keep only all-dogs-rock-api-v2

### Step 4: Clean Up GitHub (2 minutes)
- [ ] Check if ymcmb232324-4AllTheDogs-Rome/all-dogs-rock-proxy is connected to anything
- [ ] If not, delete that repo

### Step 5: Test Everything (5 minutes)
- [ ] Go to www.alldogsrockshop.com
- [ ] Upload a dog photo
- [ ] Generate image
- [ ] Check if it looks like YOUR dog
- [ ] If errors, check browser console and report them

---

## WHAT SHOULD WORK AFTER CLEANUP

✅ Homepage has AI Creator as first thing customers see
✅ Customer uploads dog photo
✅ Customer writes prompt
✅ AI generates image that LOOKS LIKE their uploaded dog (not random)
✅ Customer can add to cart and checkout

---

## IF STILL BROKEN AFTER ALL THIS

Open browser console (F12) and:
1. Try generating an image
2. Screenshot the RED errors
3. Tell me EXACTLY what the error says
4. I'll fix the specific bug

---

## SUMMARY OF CHANGES NEEDED

**VERCEL** (you must do manually):
1. Verify/add REPLICATE_API_TOKEN environment variable
2. Delete duplicate projects

**SHOPIFY** (you must do manually):
1. Move AI Creator section to homepage
2. Verify it's calling correct API endpoint

**GITHUB** (optional cleanup):
1. Check/delete ymcmb232324 proxy repo if unused

---

**COMPLETE THESE 5 STEPS IN ORDER AND YOUR STORE WILL WORK!**
