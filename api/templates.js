// api/templates.js
// Manages template images for compositing

export const config = {
  runtime: 'edge',
};

// In-memory storage for template images
// In production, these would be stored in a database or CDN
const templates = new Map([
  [
    'default',
    {
      name: 'Default Template',
      description: 'Classic white background with decorative border',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=1200&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop',
    },
  ],
  [
    'park',
    {
      name: 'Park Scene',
      description: 'Beautiful park with green grass and trees',
      url: 'https://images.unsplash.com/photo-1587463272361-c0e69d8c3a7b?w=1200&h=1200&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1587463272361-c0e69d8c3a7b?w=300&h=300&fit=crop',
    },
  ],
  [
    'beach',
    {
      name: 'Beach Background',
      description: 'Sunny beach with sand and ocean',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=1200&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop',
    },
  ],
  [
    'living-room',
    {
      name: 'Cozy Living Room',
      description: 'Comfortable indoor living room setting',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=1200&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    },
  ],
  [
    'garden',
    {
      name: 'Garden Scene',
      description: 'Lush garden with flowers and greenery',
      url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&h=1200&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300&h=300&fit=crop',
    },
  ],
]);

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  // GET /api/templates - List all templates
  if (req.method === 'GET' && pathname === '/api/templates') {
    const templateList = Array.from(templates.entries()).map(([id, template]) => ({
      id,
      ...template,
    }));

    return new Response(JSON.stringify({ templates: templateList }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // GET /api/templates/{id} - Get specific template or redirect to its URL
  if (req.method === 'GET' && pathname.startsWith('/api/templates/')) {
    const templateId = pathname.split('/api/templates/')[1];
    const template = templates.get(templateId);

    if (!template) {
      return new Response(JSON.stringify({ error: 'Template not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Redirect to the actual template image URL
    return Response.redirect(template.url, 302);
  }

  // POST /api/templates - Add new template (admin only)
  if (req.method === 'POST' && pathname === '/api/templates') {
    try {
      const { id, name, description, url, thumbnail } = await req.json();

      if (!id || !name || !url) {
        return new Response(
          JSON.stringify({ error: 'Template id, name, and url are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      templates.set(id, { name, description, url, thumbnail });

      return new Response(
        JSON.stringify({ success: true, message: 'Template added successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to add template', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
