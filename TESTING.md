# Testing Guide - All Dogs Rock API

This guide will help you test the complete pet image editing system.

## Prerequisites

Before testing, make sure you have:

1. **Remove.bg API Key** - Required for background removal
   - Sign up at https://www.remove.bg/api
   - Add to environment variables: `REMOVEBG_API_KEY`

2. **Deployed to Vercel** (or running locally)
   - Set all environment variables in Vercel dashboard
   - Or copy `.env.example` to `.env.local` for local testing

## Quick Testing Checklist

### 1. Test the Landing Page
- Navigate to your deployed URL root (e.g., `https://your-app.vercel.app/api/index`)
- Should see a beautiful landing page with API documentation
- ✅ Verify all buttons and links work

### 2. Test the Interactive Editor
- Navigate to `/api/editor`
- You should see a professional photo editor interface

**Test Steps:**
1. Click "Upload Your Pet Photo" and select a pet image
2. Choose a template from the gallery (park, beach, etc.)
3. Adjust the size and position sliders
4. Click "Process Image" button
5. Wait for background removal and compositing
6. Preview should show your pet composited into the template
7. Click "Download Image" to save the result

**Expected Results:**
- Background is cleanly removed from pet photo
- Pet is properly placed in chosen template
- Sliders allow real-time adjustment of position and size
- Final image can be downloaded

### 3. Test Template API

```bash
# List all templates
curl https://your-app.vercel.app/api/templates

# Get specific template
curl https://your-app.vercel.app/api/templates/park
```

**Expected Response:**
```json
{
  "templates": [
    {
      "id": "default",
      "name": "Default Template",
      "description": "Classic white background with decorative border",
      "url": "https://...",
      "thumbnail": "https://..."
    },
    ...
  ]
}
```

### 4. Test Background Removal API

```bash
curl -X POST https://your-app.vercel.app/api/remove-background \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "imageData": "data:image/png;base64,...",
  "message": "Background removed successfully"
}
```

### 5. Test Complete Workflow API

```bash
curl -X POST https://your-app.vercel.app/api/process-pet-image \
  -H "Content-Type: application/json" \
  -d '{
    "petImageUrl": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500",
    "templateName": "park",
    "position": {"x": 0.5, "y": 0.5},
    "size": {"width": 0.6, "height": 0.6}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "workflow": "client-side",
  "petImageNoBg": "data:image/png;base64,...",
  "templateUrl": "https://...",
  "message": "Background removed. Use client-side compositing."
}
```

### 6. Test Upload System

**Via Web Interface:**
- Navigate to `/api/upload`
- Upload 1-3 pet photos
- Copy the returned URLs

**Via API:**
```bash
# First convert image to base64
base64 -i my-pet.jpg > image.txt

# Then upload
curl -X POST https://your-app.vercel.app/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "pet.jpg",
    "data": "data:image/jpeg;base64,/9j/4AAQ..."
  }'
```

## Integration Testing

### JavaScript Integration Test

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Pet Editor</title>
</head>
<body>
  <input type="file" id="petFile" accept="image/*">
  <button onclick="processImage()">Process</button>
  <img id="result" style="max-width: 500px;">

  <script>
    async function processImage() {
      const file = document.getElementById('petFile').files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const response = await fetch('/api/process-pet-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petImageData: e.target.result,
            templateName: 'park',
            position: { x: 0.5, y: 0.5 },
            size: { width: 0.6, height: 0.6 }
          })
        });

        const result = await response.json();

        // If client-side compositing is needed
        if (result.workflow === 'client-side') {
          // Use canvas to composite
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const templateImg = await loadImage(result.templateUrl);
          const petImg = await loadImage(result.petImageNoBg);

          canvas.width = templateImg.width;
          canvas.height = templateImg.height;

          ctx.drawImage(templateImg, 0, 0);
          ctx.drawImage(petImg, 100, 100, 400, 400);

          document.getElementById('result').src = canvas.toDataURL();
        }
      };

      reader.readAsDataURL(file);
    }

    function loadImage(src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.src = src;
      });
    }
  </script>
</body>
</html>
```

## Common Issues & Troubleshooting

### Issue: "Remove.bg API key not configured"
**Solution:** Make sure `REMOVEBG_API_KEY` is set in your environment variables

### Issue: CORS errors
**Solution:** All endpoints already have CORS headers configured. Make sure you're not blocking them with browser extensions.

### Issue: Image too large
**Solution:** Remove.bg has file size limits. Resize images to under 10MB before uploading.

### Issue: Templates not loading
**Solution:** Templates use Unsplash URLs. Make sure your network allows external image requests.

### Issue: Slow processing
**Solution:** Background removal can take 3-10 seconds depending on image size. This is normal.

## Performance Benchmarks

Expected processing times:
- **Upload**: < 1 second
- **Background Removal**: 3-10 seconds (remove.bg API)
- **Template Loading**: < 2 seconds
- **Client-side Compositing**: < 1 second
- **Total Workflow**: 5-15 seconds

## Production Checklist

Before going live:

- [ ] Set all required API keys in production environment
- [ ] Test with various pet photo types (dogs, cats, different breeds)
- [ ] Test with all template options
- [ ] Verify mobile responsiveness
- [ ] Test download functionality
- [ ] Check error handling (invalid images, network errors)
- [ ] Monitor API rate limits (remove.bg has limits per month)
- [ ] Set up monitoring/logging
- [ ] Test integration with Shopify/Customily if using
- [ ] Add analytics tracking

## API Rate Limits

**Remove.bg Free Tier:**
- 50 API calls per month
- 0.25 megapixels per image

**Remove.bg Paid Plans:**
- Start at 500 API calls/month
- Higher resolution support

**Recommendation:** Start with free tier for testing, upgrade based on usage.

## Next Steps

After successful testing:

1. **Customize Templates**: Add your own template images via `/api/templates` POST endpoint
2. **Brand the Interface**: Customize colors and styling in `/api/editor.js`
3. **Add to Shopify**: Integrate with your product pages
4. **Connect to Customily**: Use `/api/customily/apply` to apply to products
5. **Add Analytics**: Track usage and conversions
6. **Optimize Images**: Add image compression for faster loading
7. **Add User Accounts**: Store customer photos and designs

## Support

For issues or questions:
- Check the main README.md
- Review API endpoint documentation
- Test with the interactive editor first
- Verify all API keys are correctly set

---

Happy testing! 🐕
