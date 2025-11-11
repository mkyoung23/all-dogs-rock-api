/**
 * VERCEL API: Set Homepage to Welcome Page
 * Endpoint: /api/set-homepage-now
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
    throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Step 1: Get pages
    const pagesData = await graphqlQuery(`
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
    `);

    const pages = pagesData.pages.edges.map(e => e.node);
    const welcomePage = pages.find(p => p.handle === 'welcome');

    if (!welcomePage) {
      return res.status(404).json({
        success: false,
        error: 'Welcome page not found',
        pages: pages.map(p => ({ title: p.title, handle: p.handle }))
      });
    }

    // Step 2: Get theme
    const themesData = await graphqlQuery(`
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
    `);

    const themes = themesData.themes.edges.map(e => e.node);
    const activeTheme = themes.find(t => t.role === 'MAIN');

    if (!activeTheme) {
      return res.status(404).json({
        success: false,
        error: 'No active theme found'
      });
    }

    // Step 3: Get current index.liquid
    const fileData = await graphqlQuery(`
      query($themeId: ID!) {
        theme(id: $themeId) {
          file(filename: "templates/index.liquid") {
            ... on OnlineStoreThemeFileBodyText {
              content
            }
          }
        }
      }
    `, { themeId: activeTheme.id });

    if (!fileData.theme || !fileData.theme.file) {
      return res.status(404).json({
        success: false,
        error: 'index.liquid not found'
      });
    }

    const currentContent = fileData.theme.file.content;

    // Step 4: Create new content
    const newContent = `{%- comment -%}
AUTO-REDIRECT TO WELCOME PAGE
Modified: ${new Date().toISOString()}
{%- endcomment -%}

<script>
  window.location.replace('/pages/welcome');
</script>

<noscript>
  <meta http-equiv="refresh" content="0; url=/pages/welcome">
  <p>Redirecting to <a href="/pages/welcome">Welcome Page</a>...</p>
</noscript>

{%- comment -%}
ORIGINAL TEMPLATE PRESERVED
{%- endcomment -%}
${currentContent}`;

    // Step 5: Update file
    const updateResult = await graphqlQuery(`
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
    `, {
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
        error: 'Failed to update',
        userErrors: updateResult.onlineStoreThemeFilesUpsert.userErrors
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Homepage now redirects to welcome page!',
      data: {
        welcomePage: {
          title: welcomePage.title,
          url: `https://alldogsrockshop.com/pages/${welcomePage.handle}`
        },
        theme: activeTheme.name,
        updatedFile: 'templates/index.liquid'
      },
      testUrl: 'https://alldogsrockshop.com'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
