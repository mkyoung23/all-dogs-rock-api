/**
 * VERCEL API ENDPOINT: Set Homepage to Welcome Page
 *
 * This endpoint uses Shopify Admin GraphQL API to:
 * 1. Fetch the welcome page
 * 2. Fetch the active theme
 * 3. Update index.liquid to redirect to /pages/welcome
 *
 * Usage:
 * POST https://all-dogs-rock-api-v2.vercel.app/api/admin/set-homepage
 *
 * Body (optional):
 * {
 *   "secret": "your-secret-key"
 * }
 */

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN || 'alldogsrockshop.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_SECRET_KEY;
const API_VERSION = '2024-10';

async function graphqlQuery(query, variables = {}) {
  const url = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ACCESS_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors, null, 2)}`);
  }

  return data.data;
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting homepage setup...');

    // Step 1: Get all pages
    console.log('📄 Fetching pages...');
    const pagesQuery = `
      query {
        pages(first: 50) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `;

    const pagesData = await graphqlQuery(pagesQuery);
    const pages = pagesData.pages.edges.map(edge => edge.node);

    console.log(`Found ${pages.length} pages`);

    // Find welcome page
    const welcomePage = pages.find(p => p.handle === 'welcome' || p.title.toLowerCase().includes('welcome'));

    if (!welcomePage) {
      return res.status(404).json({
        success: false,
        error: 'Welcome page not found',
        pages: pages.map(p => ({ title: p.title, handle: p.handle }))
      });
    }

    console.log(`✅ Found welcome page: ${welcomePage.title}`);

    // Step 2: Get active theme
    console.log('🎨 Fetching theme...');
    const themesQuery = `
      query {
        themes(first: 10) {
          edges {
            node {
              id
              name
              role
            }
          }
        }
      }
    `;

    const themesData = await graphqlQuery(themesQuery);
    const themes = themesData.themes.edges.map(edge => edge.node);
    const activeTheme = themes.find(t => t.role === 'MAIN');

    if (!activeTheme) {
      return res.status(404).json({
        success: false,
        error: 'No active theme found',
        themes: themes.map(t => ({ name: t.name, role: t.role }))
      });
    }

    console.log(`✅ Found theme: ${activeTheme.name}`);

    // Step 3: Get current index.liquid content
    console.log('📝 Fetching index.liquid...');
    const getFileQuery = `
      query($themeId: ID!) {
        theme(id: $themeId) {
          file(filename: "templates/index.liquid") {
            ... on OnlineStoreThemeFileBodyText {
              content
            }
          }
        }
      }
    `;

    const fileData = await graphqlQuery(getFileQuery, { themeId: activeTheme.id });

    if (!fileData.theme || !fileData.theme.file) {
      return res.status(404).json({
        success: false,
        error: 'index.liquid not found in theme'
      });
    }

    const currentContent = fileData.theme.file.content;
    console.log(`✅ Got current content (${currentContent.length} chars)`);

    // Step 4: Create new content with redirect
    const timestamp = new Date().toISOString();
    const newContent = `{%- comment -%}
AUTO-REDIRECT TO WELCOME PAGE
Modified by All Dogs Rock API
Date: ${timestamp}
{%- endcomment -%}

<script>
  // Immediate redirect to welcome page
  window.location.replace('/pages/welcome');
</script>

<noscript>
  <meta http-equiv="refresh" content="0; url=/pages/welcome">
  <p>Redirecting to <a href="/pages/welcome">Welcome Page</a>...</p>
</noscript>

{%- comment -%}
ORIGINAL HOMEPAGE TEMPLATE (PRESERVED)
{%- endcomment -%}
${currentContent}`;

    // Step 5: Update the file
    console.log('💾 Updating index.liquid...');
    const updateFileMutation = `
      mutation($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        onlineStoreThemeFilesUpsert(themeId: $themeId, files: $files) {
          upsertedThemeFiles {
            filename
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const updateResult = await graphqlQuery(updateFileMutation, {
      themeId: activeTheme.id,
      files: [{
        filename: 'templates/index.liquid',
        body: {
          type: 'TEXT',
          value: newContent
        }
      }]
    });

    if (updateResult.onlineStoreThemeFilesUpsert.userErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update theme file',
        userErrors: updateResult.onlineStoreThemeFilesUpsert.userErrors
      });
    }

    console.log('✅ SUCCESS!');

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Homepage now redirects to welcome page!',
      data: {
        welcomePage: {
          title: welcomePage.title,
          handle: welcomePage.handle,
          url: `https://alldogsrockshop.com/pages/${welcomePage.handle}`
        },
        theme: {
          name: activeTheme.name,
          id: activeTheme.id
        },
        updatedFile: 'templates/index.liquid',
        timestamp
      },
      testUrl: 'https://alldogsrockshop.com'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
