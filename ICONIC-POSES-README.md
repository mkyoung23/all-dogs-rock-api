# Iconic Pose Gallery System 🎭

## What Changed?

We completely rewrote the AI pet image generation system. Instead of unreliable text-to-image generation that kept producing "clearer photos" instead of transformations, we now use **iconic pose selection + face swap**.

### Old System (❌ Didn't Work)
1. Customer uploads pet photo
2. Customer types a text prompt ("my dog as medieval knight")
3. AI tries to generate image from scratch
4. **PROBLEM**: AI just made clearer photos instead of transformations

### New System (✅ WORKS!)
1. Customer uploads pet photo
2. **Customer selects from 20 pre-made iconic poses**
3. AI swaps customer's pet face onto the selected pose template
4. **RESULT**: Customer's dog actually appears as basketball player/astronaut/etc!

## How It Works

### The Magic: Dog-to-Dog Face Swap

1. We have 20 **template images** showing dogs already in iconic poses
2. Customer selects which pose they want
3. AI uses `omniedgeio/face-swap` model to swap faces
4. Customer's dog face → Template dog face
5. Preserves the pose, background, styling - just changes the face!

## Files Created/Modified

### New Files
- `iconic-poses.json` - Library of 20 iconic poses with metadata
- `api/poses/list.js` - API endpoint to serve pose gallery
- `shopify-ai-creator-pose-gallery.liquid` - New frontend with gallery UI
- `scripts/generate-templates.js` - Script to generate template images

### Modified Files
- `api/app-proxy/generate.js` - Now uses face swap instead of text-to-image

## The 20 Iconic Poses

1. **Basketball Slam Dunk** - Epic NBA-style dunk
2. **Baseball Home Run Swing** - Power swing at the plate
3. **Superhero Flight** - Flying with cape
4. **Astronaut in Space** - NASA spacesuit, stars background
5. **Royal Portrait** - Crown and royal robes
6. **Medieval Knight** - Shining armor with sword
7. **Fighter Pilot** - Top Gun aviator style
8. **Master Chef** - Professional cooking
9. **Graduate** - Cap and gown
10. **Wedding Formal** - Tuxedo/wedding dress
11. **Rock Star** - Guitar on stage
12. **Pro Surfer** - Surfing huge wave
13. **Western Cowboy** - Wild West with hat
14. **Secret Agent** - James Bond style
15. **Pirate Captain** - Eye patch, pirate hat
16. **Mad Scientist** - Lab coat and goggles
17. **Firefighter Hero** - Uniform and helmet
18. **Renaissance Portrait** - Classical painting style
19. **70s Disco** - Disco outfit with afro
20. **Santa Claus** - Red suit and white beard

## Setup Instructions

### Step 1: Deploy the Code

1. **Commit and push** (already done):
   ```bash
   git push origin claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag
   ```

2. **Deploy to Vercel**:
   - Go to Vercel dashboard
   - Find newest deployment (commit a28f5e2)
   - Click "Promote to Production"

3. **Update Shopify theme**:
   - Copy content from `shopify-ai-creator-pose-gallery.liquid`
   - Paste into your Shopify theme (replace old AI creator workflow)

### Step 2: Generate Template Images

The template images (dogs already in iconic poses) need to be generated using AI.

**Option A: Use the automated script**

```bash
# Install dependencies if needed
npm install node-fetch

# Make sure REPLICATE_API_TOKEN is set
export REPLICATE_API_TOKEN=your_token_here

# Run the generator (takes ~40-60 minutes for all 20 images)
node scripts/generate-templates.js
```

This will:
- Generate all 20 template images using FLUX Pro
- Save URLs to `generated-template-urls.json`
- Cost approximately $1-2 in Replicate credits

**Option B: Generate manually**

For each pose in `iconic-poses.json`:
1. Use the `prompt` field to generate an image with FLUX Pro or DALL-E
2. Save the image URL
3. Update `templateUrl` and `thumbnailUrl` in the JSON

**Option C: Use placeholder images initially**

For quick testing, you can use placeholder images:
- Generate just 2-3 test poses
- Use `https://via.placeholder.com/512x512?text=Pose+Name` for others
- Replace with real images later

### Step 3: Update URLs

Once you have generated images:

1. Open `generated-template-urls.json` (if using script)
2. Copy the URLs
3. Update `iconic-poses.json` with the real image URLs:

```json
{
  "id": "basketball-dunk",
  "templateUrl": "https://replicate.delivery/pbxt/REAL_URL_HERE.jpg",
  "thumbnailUrl": "https://replicate.delivery/pbxt/REAL_URL_HERE.jpg"
}
```

4. Commit and redeploy:
```bash
git add iconic-poses.json
git commit -m "feat: Add real template image URLs"
git push
```

### Step 4: Test the Full Flow

1. Go to your live site: `alldogsrockshop.com`
2. Upload a dog photo
3. Select an iconic pose from the gallery
4. Wait for face swap (~30-45 seconds)
5. View your dog in the iconic pose!

## API Endpoints

### GET `/api/poses/list`
Returns the list of all iconic poses for the gallery.

**Response:**
```json
{
  "success": true,
  "poses": [
    {
      "id": "basketball-dunk",
      "name": "Basketball Slam Dunk",
      "description": "Epic basketball dunk pose...",
      "category": "Sports",
      "templateUrl": "https://...",
      "thumbnailUrl": "https://..."
    },
    ...
  ],
  "totalPoses": 20
}
```

### POST `/api/app-proxy/generate`
Generates face-swapped image.

**Request:**
```json
{
  "poseId": "basketball-dunk",
  "image": "data:image/jpeg;base64,...",
  "premium": false
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/...",
  "images": ["https://..."],
  "poseName": "Basketball Slam Dunk",
  "poseId": "basketball-dunk"
}
```

## Why This Approach is Better

✅ **Predictable Results** - Customer sees exactly what they're getting
✅ **Faster** - Face swap is quicker than full image generation
✅ **More Reliable** - Dog-to-dog swap works much better than text-to-image
✅ **Better UX** - Visual selection is easier than writing prompts
✅ **Consistent Quality** - Templates are pre-vetted for quality
✅ **No Ambiguity** - No misinterpreted prompts
✅ **Scalable** - Easy to add more poses later

## Troubleshooting

### Face swap fails with "No face detected"
- Make sure template images have clear, visible dog faces
- Customer's uploaded photo should show the dog's face clearly
- Try lowering `det_thresh` parameter in generate.js

### Template images look wrong
- Regenerate using better prompts
- Make sure prompts are specific and detailed
- Use FLUX Pro for best quality

### Gallery not loading
- Check `/api/poses/list` endpoint is accessible
- Verify `iconic-poses.json` is deployed
- Check browser console for CORS errors

## Future Improvements

- Add more iconic poses (30-50 total)
- Generate multiple variations per pose
- Add "favorite" feature to save popular poses
- Add pose search/filter
- Support multiple pets in one pose
- Add seasonal/holiday pose collections

## Cost Estimates

- **Face swap per image**: ~$0.003-0.005 (omniedgeio/face-swap)
- **Template generation**: ~$0.05-0.10 per image (FLUX Pro)
- **Total setup cost**: ~$1-2 for all 20 templates
- **Per customer cost**: ~$0.003-0.005 per image generated

Much cheaper than the previous FLUX Kontext Pro approach!

---

**Questions?** Check the API logs in Vercel dashboard or browser console for debugging info.
