# System Architecture - All Dogs Rock API

## Overview

The All Dogs Rock API is a complete image processing pipeline designed to help e-commerce businesses offer personalized pet products. The system takes customer pet photos, removes backgrounds, and composites them onto professional templates.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER INTERFACE                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Landing Page │  │ Photo Editor │  │   Upload Interface   │  │
│  │  /api/index  │  │ /api/editor  │  │    /api/upload       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Complete Workflow Endpoint                     │ │
│  │          /api/process-pet-image (Orchestrator)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│          │                    │                    │              │
│          ▼                    ▼                    ▼              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │   Upload     │   │  Background  │   │  Compositing │        │
│  │   Service    │   │   Removal    │   │   Service    │        │
│  │              │   │              │   │              │        │
│  │ /api/upload  │   │ /api/remove- │   │ /api/        │        │
│  │              │   │  background  │   │  composite   │        │
│  └──────────────┘   └──────────────┘   └──────────────┘        │
│                              │                    │              │
│                              ▼                    ▼              │
│                     ┌──────────────┐   ┌──────────────┐        │
│                     │  Remove.bg   │   │  Template    │        │
│                     │     API      │   │   Manager    │        │
│                     └──────────────┘   │              │        │
│                                        │ /api/        │        │
│                                        │  templates   │        │
│                                        └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPTIONAL INTEGRATIONS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Customily  │  │    Shopify   │  │  OpenAI DALL-E       │  │
│  │  Integration │  │     Cart     │  │  (AI Backgrounds)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Upload Service (`/api/upload.js`)

**Purpose:** Handle customer pet photo uploads

**Technology:** Vercel Edge Function

**Features:**
- In-memory storage of uploaded images
- Base64 encoding/decoding
- Unique ID generation for each upload
- Public URL generation for uploaded images
- HTML form interface for easy uploading

**Flow:**
1. Customer uploads photo via form or API
2. Image converted to base64 and stored in memory
3. Unique ID generated
4. Public URL returned: `/api/uploads/{id}`
5. Image accessible via GET request to public URL

**Limitations:**
- Images stored in memory (cleared on cold start)
- For production, consider cloud storage (S3, Cloudinary)

### 2. Background Removal Service (`/api/remove-background.js`)

**Purpose:** Remove backgrounds from pet photos

**Technology:** Vercel Edge Function + Remove.bg API

**Features:**
- Accepts image URL or base64 data
- Calls remove.bg API
- Returns transparent PNG with background removed
- Handles errors gracefully

**Flow:**
1. Receives pet image (URL or base64)
2. Sends to remove.bg API
3. Receives processed image with transparent background
4. Returns base64-encoded PNG

**API Requirements:**
- `REMOVEBG_API_KEY` environment variable
- Rate limits apply (50/month free, paid plans available)

**Performance:**
- Average processing time: 3-10 seconds
- Depends on image size and API load

### 3. Template Manager (`/api/templates.js`)

**Purpose:** Manage and serve template background images

**Technology:** Vercel Edge Function

**Features:**
- In-memory template storage (Map)
- 5 pre-configured templates
- REST API for listing and retrieving
- Easy template addition via POST

**Available Templates:**
1. **default** - Classic white background with border
2. **park** - Outdoor park scene
3. **beach** - Beach with ocean
4. **living-room** - Indoor cozy setting
5. **garden** - Lush garden scene

**Template Structure:**
```javascript
{
  id: 'park',
  name: 'Park Scene',
  description: 'Beautiful park with green grass',
  url: 'https://...',
  thumbnail: 'https://...'
}
```

**Endpoints:**
- `GET /api/templates` - List all templates
- `GET /api/templates/{id}` - Get specific template (redirects to image)
- `POST /api/templates` - Add new template

### 4. Compositing Service (`/api/composite.js`)

**Purpose:** Merge pet image with template background

**Technology:** Node.js Serverless Function

**Features:**
- Accepts pet image (no background) and template
- Position and size controls
- Can use Cloudinary for server-side compositing
- Fallback to client-side compositing

**Parameters:**
- `petImageData` or `petImageUrl` - Pet image with transparent background
- `templateImageData` or `templateImageUrl` - Background template
- `position` - { x: 0-1, y: 0-1 } where 0.5, 0.5 is center
- `size` - { width: 0-1, height: 0-1 } as percentage of template size

**Compositing Strategies:**

**Strategy 1: Cloudinary (Server-side)**
- If Cloudinary credentials are configured
- Uploads both images to Cloudinary
- Uses transformation API to composite
- Returns public URL

**Strategy 2: Client-side**
- Returns both images and positioning data
- Client uses HTML Canvas to composite
- Better for interactive editing

### 5. Complete Workflow (`/api/process-pet-image.js`)

**Purpose:** Orchestrate the complete process

**Technology:** Vercel Edge Function

**Features:**
- Coordinates all services
- Handles errors at each step
- Returns final composited image
- Can fallback to client-side processing

**Flow:**
1. Receive pet image and template selection
2. Call background removal service
3. Get template from template manager
4. Call compositing service
5. Return final image or client-side data

**Error Handling:**
- Validates inputs at each step
- Provides detailed error messages
- Falls back to client-side if server-side fails

## User Interfaces

### 1. Landing Page (`/api/index.js`)

**Purpose:** Welcome page and API documentation

**Features:**
- Feature showcase
- Quick links to editor and upload
- API endpoint documentation
- Beautiful gradient design
- Responsive layout

### 2. Interactive Editor (`/api/editor.js`)

**Purpose:** Full-featured photo editing interface

**Features:**
- Drag-and-drop file upload
- Template gallery with thumbnails
- Real-time canvas preview
- Interactive sliders for size and position
- Live preview updates
- Download functionality

**User Flow:**
1. Upload pet photo
2. Select template from gallery
3. Adjust size slider (20-100%)
4. Adjust position X slider (0-100%)
5. Adjust position Y slider (0-100%)
6. Click "Process Image"
7. Wait for background removal
8. See composited result
9. Download final image

**Technical Implementation:**
- HTML5 Canvas for rendering
- FileReader API for upload
- Fetch API for backend calls
- CSS Grid for layout
- Responsive design

### 3. Upload Interface (`/api/upload.js`)

**Purpose:** Simple file upload form

**Features:**
- Multi-file upload (1-3 photos)
- Progress indication
- URL generation
- Copy-to-clipboard
- Mobile-friendly

## Data Flow

### Complete User Journey

```
1. Customer visits /api/editor
   ↓
2. Uploads pet photo (FileReader → base64)
   ↓
3. Selects template from gallery
   ↓
4. Adjusts position and size sliders
   ↓
5. Clicks "Process Image"
   ↓
6. POST /api/remove-background
   ├─ Sends base64 image
   ├─ Remove.bg processes (3-10s)
   └─ Returns transparent PNG
   ↓
7. GET /api/templates/{id}
   └─ Retrieves template URL
   ↓
8. Client-side Canvas Compositing
   ├─ Loads template image
   ├─ Loads pet (no bg) image
   ├─ Calculates dimensions & position
   ├─ Draws template on canvas
   ├─ Draws pet on top
   └─ Renders final result
   ↓
9. Customer downloads result
   └─ Canvas.toDataURL('image/png')
```

## API Contracts

### Background Removal

**Request:**
```json
POST /api/remove-background
{
  "imageUrl": "https://example.com/pet.jpg",
  // OR
  "imageData": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "imageData": "data:image/png;base64,iVBORw0KG...",
  "message": "Background removed successfully"
}
```

### Template List

**Request:**
```
GET /api/templates
```

**Response:**
```json
{
  "templates": [
    {
      "id": "park",
      "name": "Park Scene",
      "description": "Beautiful park with green grass",
      "url": "https://...",
      "thumbnail": "https://..."
    }
  ]
}
```

### Complete Workflow

**Request:**
```json
POST /api/process-pet-image
{
  "petImageData": "data:image/jpeg;base64,...",
  "templateName": "park",
  "position": { "x": 0.5, "y": 0.5 },
  "size": { "width": 0.6, "height": 0.6 }
}
```

**Response:**
```json
{
  "success": true,
  "workflow": "client-side",
  "petImageNoBg": "data:image/png;base64,...",
  "templateUrl": "https://...",
  "position": { "x": 0.5, "y": 0.5 },
  "size": { "width": 0.6, "height": 0.6 },
  "message": "Background removed. Use client-side compositing."
}
```

## Technology Stack

### Runtime
- **Vercel Edge Functions** - For ultra-fast global performance
- **Node.js Serverless** - For image processing functions

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5 Canvas API** - For image compositing
- **FileReader API** - For image uploads
- **CSS3** - For modern styling and gradients

### Backend APIs
- **Remove.bg API** - Background removal
- **OpenAI DALL-E** - Optional AI background generation
- **Cloudinary API** - Optional server-side compositing
- **Customily API** - Optional product template integration

### Storage
- **In-memory Maps** - Temporary upload and template storage
- **Base64 encoding** - Image data transfer

## Security Considerations

### API Keys
- All sensitive keys stored in environment variables
- Never exposed to client-side code
- Separate keys for dev/staging/prod

### CORS
- Configured for cross-origin requests
- Allow all origins (*) for flexibility
- Can be restricted to specific domains

### Rate Limiting
- Remove.bg enforces rate limits
- Free tier: 50 requests/month
- Monitor usage to avoid overages

### Data Privacy
- Images stored temporarily in memory
- No permanent storage of customer photos
- Cleared on function cold starts
- Consider adding user consent notices

## Scalability

### Current Limitations
1. **In-memory storage** - Not persistent across deployments
2. **Remove.bg rate limits** - Limited free tier requests
3. **Function timeout** - Edge functions limited to 30s

### Scaling Solutions
1. **Cloud Storage** - Move to S3, Cloudinary, or similar
2. **Paid API tiers** - Upgrade remove.bg for higher limits
3. **Image optimization** - Compress images before processing
4. **CDN caching** - Cache template images
5. **Database** - Store user projects and history

## Future Enhancements

### Phase 1 (Immediate)
- [ ] Add user authentication
- [ ] Implement cloud storage (S3/Cloudinary)
- [ ] Add image optimization
- [ ] Implement template caching

### Phase 2 (Near-term)
- [ ] Custom template upload for businesses
- [ ] Save customer projects
- [ ] Social media sharing
- [ ] Email delivery of final images

### Phase 3 (Long-term)
- [ ] AI-powered auto-positioning
- [ ] Multiple pet support (groups)
- [ ] Video background removal
- [ ] Mobile app integration

## Deployment

### Vercel Configuration

**Environment Variables Required:**
```
REMOVEBG_API_KEY=xxx
OPENAI_API_KEY=xxx (optional)
CUSTOMILY_API_KEY=xxx (optional)
CLOUDINARY_CLOUD_NAME=xxx (optional)
CLOUDINARY_API_KEY=xxx (optional)
SHOPIFY_STORE_DOMAIN=xxx (optional)
SHOPIFY_STOREFRONT_TOKEN=xxx (optional)
```

**vercel.json:**
- Configures edge runtime for appropriate endpoints
- Sets up CORS headers globally
- Defines rewrite rules for app-proxy

### Performance Metrics

**Target Metrics:**
- Time to First Byte (TTFB): < 100ms
- Background Removal: 3-10s (API dependent)
- Client Compositing: < 1s
- Total Workflow: 5-15s

**Monitoring:**
- Vercel Analytics for function performance
- Remove.bg dashboard for API usage
- Custom logging for error tracking

## Maintenance

### Regular Tasks
- Monitor Remove.bg API quota
- Update template library
- Review error logs
- Update dependencies
- Test with various image types

### Backup Strategy
- Git repository for code
- Environment variables documented
- Template URLs backed up
- No customer data to backup (ephemeral)

---

This architecture provides a solid foundation for a production-ready pet image editing system that can scale with your business needs.
