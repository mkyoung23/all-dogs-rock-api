// List all pages currently on the Shopify store
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const accessToken = process.env.AllDogsRock_Gallery_Admin_App_Key ||
                       process.env.SHOPIFY_ACCESS_TOKEN;
    const shop = process.env.SHOPIFY_STORE_DOMAIN || '8k5mna-5e.myshopify.com';

    if (!accessToken) {
      return res.status(400).json({ error: 'No Shopify access token found' });
    }

    console.log('📋 Listing all pages on store:', shop);

    // Query to get all pages
    const query = `
      query {
        pages(first: 50) {
          edges {
            node {
              id
              title
              handle
              createdAt
              updatedAt
              body
            }
          }
        }
      }
    `;

    const shopifyUrl = `https://${shop}/admin/api/2024-01/graphql.json`;
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return res.status(400).json({ error: 'Failed to list pages', details: data.errors });
    }

    const pages = data.data.pages.edges.map(edge => edge.node);

    console.log(`✅ Found ${pages.length} pages`);
    pages.forEach(page => {
      console.log(`  - ${page.title} (${page.handle})`);
    });

    return res.status(200).json({
      success: true,
      count: pages.length,
      pages: pages.map(p => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        url: `/pages/${p.handle}`,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ error: 'Failed to list pages', details: error.message });
  }
}
