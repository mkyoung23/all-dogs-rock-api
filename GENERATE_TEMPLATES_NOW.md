# 🎨 Generate 20 Real Template Images - QUICK START

Your face swap system is **LIVE** but needs real template images!

Currently the poses use placeholder images. You need to generate real DALL-E 3 dog images for all 20 poses.

---

## ⚡ FASTEST METHOD: API Call (2 minutes)

The easiest way is to call the Vercel API endpoint directly. Just run this command:

### Step 1: Make sure OPENAI_API_KEY is set in Vercel

Go to: https://vercel.com/dashboard
- Select project: **all-dogs-rock-api-v2**
- Settings → Environment Variables
- Verify `OPENAI_API_KEY` is set
- If not set, add it now and redeploy

### Step 2: Call the batch generation API

Open a new terminal and run this command:

```bash
curl -X POST https://all-dogs-rock-api-v2.vercel.app/api/generate-templates \
  -H "Content-Type: application/json" \
  -d '{"batchMode": true}' \
  > template-results.json
```

**This will:**
- Generate all 20 templates with DALL-E 3 HD quality
- Take ~60 seconds (2 seconds between each image)
- Cost ~$0.80 total
- Save results to `template-results.json`

### Step 3: Check the results

```bash
cat template-results.json
```

You should see JSON with 20 image URLs like:
```json
{
  "success": true,
  "message": "Generated 20/20 templates",
  "results": [
    {
      "poseId": "basketball-dunk",
      "name": "Basketball Slam Dunk",
      "success": true,
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/..."
    },
    ...
  ]
}
```

### Step 4: Update iconic-poses.json

Now you need to update the `iconic-poses.json` file with the real URLs.

**Option A: Use Python script (automatic)**
```bash
cd all-dogs-rock-api
export OPENAI_API_KEY="your_openai_key_here"
python3 generate-templates-NOW.py
```

This will automatically update `iconic-poses.json` with the real URLs.

**Option B: Manual update**
1. Open `template-results.json`
2. Copy each URL from the results
3. Open `iconic-poses.json`
4. Replace each placeholder URL with the real URL for that pose
5. Make sure to update both `templateUrl` and `thumbnailUrl` for each pose

### Step 5: Deploy to production

```bash
git add iconic-poses.json
git commit -m "feat: Add real DALL-E 3 generated dog template images"
git push origin claude/continue-previous-work-011CUj9cLkR3huUkFoWHA58c
```

Vercel will auto-deploy in ~30 seconds.

### Step 6: Verify it worked

```bash
curl https://all-dogs-rock-api-v2.vercel.app/api/poses/list | grep -o 'blob.core.windows.net' | wc -l
```

Should return `40` (20 poses × 2 URLs each: templateUrl + thumbnailUrl)

---

## 🐍 ALTERNATIVE: Python Script Method

If you prefer to use Python directly:

```bash
cd all-dogs-rock-api
export OPENAI_API_KEY="your_openai_key_here"
python3 generate-templates-NOW.py
```

The script will:
- ✅ Generate all 20 templates
- ✅ Automatically update `iconic-poses.json`
- ✅ Show progress for each pose
- ✅ Save a backup of the original file

Then just commit and push:
```bash
git add iconic-poses.json
git commit -m "feat: Add real DALL-E 3 template images"
git push origin claude/continue-previous-work-011CUj9cLkR3huUkFoWHA58c
```

---

## ✅ After Templates are Generated

Once you have real template images deployed, test the complete face swap:

### Test with a sample dog image:

```bash
curl -X POST https://all-dogs-rock-api-v2.vercel.app/api/app-proxy/generate \
  -H "Content-Type: application/json" \
  -d '{
    "poseId": "basketball-dunk",
    "image": "https://example.com/dog.jpg"
  }'
```

Should return a face-swapped image after ~10-15 seconds!

---

## 💰 Cost Breakdown

- **Template generation**: ~$0.80 one-time (20 images × $0.04 DALL-E 3 HD)
- **Per face swap**: ~$0.02-0.05 (Replicate usage)

---

## 🆘 Troubleshooting

### "OpenAI API key not configured"
- Add `OPENAI_API_KEY` to Vercel environment variables
- Redeploy the project after adding

### "Error generating templates"
- Check your OpenAI account has credits
- Verify API key is correct
- Try generating just 1 template first: `{"poseId": "basketball-dunk"}`

### URLs expire after 1 hour
DALL-E 3 URLs expire! You need to:
1. Download all 20 images within 1 hour
2. Upload to permanent storage (Cloudinary, AWS S3, etc.)
3. Update `iconic-poses.json` with permanent URLs

---

## 🎯 Next Steps

1. ✅ Generate 20 template images (using method above)
2. ✅ Update iconic-poses.json with real URLs
3. ✅ Deploy to production
4. ✅ Test face swap end-to-end
5. 🚀 Launch to customers!

**You're almost there!** Just need to generate those templates and you're ready to go live! 🎉
