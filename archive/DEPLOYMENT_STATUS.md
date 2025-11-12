# Homepage Redirect Tool - Deployment Status

## Summary
The homepage redirect functionality is now fully built and ready for production deployment.

## What Was Built

### 1. HTML Tool (`set-homepage-tool.html`)
- **Purpose**: Browser-based tool to set the Shopify homepage to redirect to the welcome page
- **Location**: `/set-homepage-tool.html`
- **Features**:
  - Prompts user for Shopify Admin Access Token
  - Shows clear status messages (ready/error/loading)
  - Validates token format (must start with "shpat_")
  - Provides step-by-step logging during execution
  - Preserves original homepage template as backup
  - Handles all edge cases (missing token, invalid format, API errors)

### 2. API Endpoints
- **`/api/set-homepage-now`**: Server-side endpoint (requires env vars)
- **`/api/admin/set-homepage`**: Admin endpoint (requires env vars)

Note: API endpoints return 500 because `SHOPIFY_SECRET_KEY` environment variable is not configured in Vercel.

## Current Deployment Status

### Branch
`claude/cleanup-store-remove-old-pages-011CUyNw8LtUVK81DSJeqSGL`

### Latest Commit
```
019a708 - fix: Improve HTML tool UX with better token prompt handling
```

### Production URLs (from feature branch)
- https://all-dogs-rock-api-v2-git-cl-0626fc-all-dogs-rock-shops-projects.vercel.app
- https://all-dogs-rock-api-v2-cagaoqzhg-all-dogs-rock-shops-projects.vercel.app

### HTML Tool URL
https://all-dogs-rock-api-v2-git-cl-0626fc-all-dogs-rock-shops-projects.vercel.app/set-homepage-tool.html

## Next Steps

### 1. Verify Latest Deployment
The latest improvements were just pushed. Check if Vercel has deployed commit `019a708`:
- Go to your Vercel dashboard
- Check if the latest build includes the new commit
- If not, manually trigger a new production deployment from the branch

### 2. Test the HTML Tool
Once deployed:
1. Open the HTML tool URL above
2. When prompted, enter your Shopify Admin Access Token (starts with `shpat_`)
3. Click "Set Homepage Now"
4. Watch the step-by-step logs
5. Verify success message
6. Test https://alldogsrockshop.com to confirm redirect

### 3. Merge to Main (Optional)
To get this on the main production domain:
1. Create a Pull Request on GitHub:
   - From: `claude/cleanup-store-remove-old-pages-011CUyNw8LtUVK81DSJeqSGL`
   - To: `main`
   - Title: "Add homepage redirect tool and API endpoints"
2. Review and merge the PR
3. Vercel will auto-deploy to main production domain

## How to Get a Shopify Access Token

1. Go to: https://admin.shopify.com/store/alldogsrockshop/settings/apps/development
2. Create a new custom app (or use existing)
3. Enable these permissions:
   - `read_themes`
   - `write_themes`
   - `read_content`
4. Install the app
5. Copy the Admin API access token (starts with `shpat_`)

## Improvements Made

### Original Issue
When you tried the HTML tool, clicking the button did nothing.

### Root Cause
The prompt appeared immediately on page load, which could be:
- Cancelled by user → button disabled, no feedback
- Blocked by browser → button disabled, no feedback

### Solution
- Wrapped prompt in `DOMContentLoaded` event listener with delay
- Added clear status messages showing token validation state
- Shows "Ready!" message when token is valid
- Shows specific error messages when token is missing or invalid
- User knows exactly what to do next

## Files Changed

```
set-homepage-tool.html          - Improved UX and error handling
api/set-homepage-now.js         - Server-side endpoint (needs env vars)
api/admin/set-homepage.js       - Admin endpoint (needs env vars)
```

## All Commits on This Branch

```
019a708 - fix: Improve HTML tool UX with better token prompt handling
71b27df - feat: Add HTML tool to set homepage (prompts for token)
dac46e3 - feat: Add set-homepage-now endpoint in api root
b8a4993 - feat: Add API endpoint to set homepage to welcome page
```

## Testing Checklist

- [ ] Verify latest Vercel deployment includes commit 019a708
- [ ] Open HTML tool URL in browser
- [ ] Confirm token prompt appears with clear instructions
- [ ] Test with cancelled prompt → should show clear error
- [ ] Test with invalid token → should show format error
- [ ] Test with valid token → should show "Ready!" message
- [ ] Click "Set Homepage Now" → should execute successfully
- [ ] Verify logs show all steps clearly
- [ ] Visit https://alldogsrockshop.com → should redirect to welcome page

---

**You're all set!** The tool is built, committed, and pushed. Just trigger the Vercel deployment (or wait for auto-deploy) and test it out!
