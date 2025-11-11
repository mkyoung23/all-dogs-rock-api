/**
 * COMPLETE HOMEPAGE SETUP
 * This endpoint:
 * 1. Creates the welcome page in Shopify with the beautiful design
 * 2. Sets the homepage to redirect to the welcome page
 *
 * Usage: POST https://all-dogs-rock-api-v2.vercel.app/api/setup-homepage-complete
 */

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN || 'alldogsrockshop.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_SECRET_KEY;
const API_VERSION = '2024-10';

// The welcome page content from WELCOME_PAGE.liquid
const WELCOME_PAGE_CONTENT = `
{% comment %}
  ALL DOGS ROCK - WELCOME / HOW IT WORKS PAGE
  This is the landing page customers see first
{% endcomment %}

<style>
  .welcome-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .hero-section {
    text-align: center;
    padding: 50px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    color: white;
    margin-bottom: 40px;
  }

  .hero-section h1 {
    font-size: 3.5em;
    margin-bottom: 20px;
    font-weight: 900;
  }

  .hero-section p {
    font-size: 1.5em;
    margin-bottom: 40px;
    opacity: 0.95;
  }

  .hero-image {
    max-width: 800px;
    margin: 40px auto;
    border-radius: 15px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }

  .btn-get-started {
    background: white;
    color: #667eea;
    border: none;
    padding: 25px 60px;
    border-radius: 50px;
    font-size: 1.5em;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
    display: inline-block;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .btn-get-started:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
  }

  .how-it-works {
    margin: 40px 0;
  }

  .how-it-works h2 {
    text-align: center;
    font-size: 2.5em;
    margin-bottom: 50px;
    color: #333;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    margin-bottom: 60px;
  }

  .step-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s;
  }

  .step-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  }

  .step-number {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5em;
    font-weight: 900;
    margin: 0 auto 25px;
  }

  .step-card h3 {
    font-size: 1.8em;
    margin-bottom: 15px;
    color: #333;
  }

  .step-card p {
    color: #666;
    font-size: 1.1em;
    line-height: 1.6;
  }

  .examples-section {
    background: #f8f9ff;
    padding: 50px 20px;
    border-radius: 20px;
    margin: 40px 0;
  }

  .examples-section h2 {
    text-align: center;
    font-size: 2.5em;
    margin-bottom: 20px;
    color: #333;
  }

  .examples-section p {
    text-align: center;
    font-size: 1.2em;
    color: #666;
    margin-bottom: 40px;
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .example-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .example-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .example-card h4 {
    padding: 20px;
    text-align: center;
    font-size: 1.3em;
    color: #333;
  }

  .products-section {
    text-align: center;
    margin: 40px 0;
  }

  .products-section h2 {
    font-size: 2.5em;
    margin-bottom: 30px;
    color: #333;
  }

  .products-section p {
    font-size: 1.3em;
    color: #666;
    margin-bottom: 50px;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    max-width: 900px;
    margin: 0 auto 50px;
  }

  .product-card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .product-card h4 {
    font-size: 1.5em;
    margin-bottom: 10px;
    color: #333;
  }

  .product-card p {
    color: #666;
    font-size: 1em;
  }

  .cta-section {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    color: white;
  }

  .cta-section h2 {
    font-size: 2.5em;
    margin-bottom: 20px;
  }

  .cta-section p {
    font-size: 1.3em;
    margin-bottom: 40px;
    opacity: 0.95;
  }

  @media (max-width: 768px) {
    .hero-section h1 {
      font-size: 2.5em;
    }

    .hero-section p {
      font-size: 1.2em;
    }

    .btn-get-started {
      font-size: 1.2em;
      padding: 20px 40px;
    }
  }
</style>

<div class="welcome-container">
  <!-- Hero Section -->
  <div class="hero-section">
    <h1>All Dogs Rock Shop</h1>
    <p>Transform Your Dog Into History's Greatest Icons!</p>
    <p style="font-size: 1.1em; opacity: 0.9;">Upload your dog's photo and watch AI place them perfectly into famous moments—Washington crossing the Delaware, Rocky at the steps, Babe Ruth's called shot, and more!</p>

    <a href="/pages/create-iconic-dog" class="btn-get-started">
      Get Started Now
    </a>
  </div>

  <!-- How It Works Section -->
  <div class="how-it-works">
    <h2>How It Works</h2>

    <div class="steps-grid">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3>Upload Your Dog's Photo</h3>
        <p>Upload 1-3 clear photos of your dog from different angles. Our AI needs to see your dog's unique features to preserve them perfectly!</p>
      </div>

      <div class="step-card">
        <div class="step-number">2</div>
        <h3>Choose an Iconic Pose</h3>
        <p>Pick from 5 legendary moments: Washington, Rocky, Babe Ruth, Presidential Speech, or NFL Team Photo. Your dog, your choice!</p>
      </div>

      <div class="step-card">
        <div class="step-number">3</div>
        <h3>AI Creates Your Masterpiece</h3>
        <p>In 10-15 seconds, our advanced AI preserves your dog's EXACT breed, color, and markings while placing them into the iconic scene!</p>
      </div>

      <div class="step-card">
        <div class="step-number">4</div>
        <h3>Choose Your Product</h3>
        <p>Get your iconic dog on a premium framed print, stretched canvas, or custom t-shirt. Perfect gift for any dog lover!</p>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="/pages/create-iconic-dog" class="btn-get-started">
        Create Your Iconic Dog
      </a>
    </div>
  </div>

  <!-- Examples Section -->
  <div class="examples-section">
    <h2>See Real Examples - Your Dog as an Icon</h2>
    <p>These are actual AI-generated images from our customers. Your dog will look just as amazing!</p>

    <div class="examples-grid">
      <div class="example-card">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/500px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg" class="example-image" alt="Washington">
        <h4>Washington Crossing Delaware</h4>
      </div>

      <div class="example-card">
        <img src="https://replicate.delivery/yhqm/1ut7IpU4wbJfZKEa9D5DLBuoenHtYe2N6QQKIRzHuF0sVlNrA/out-0.png" class="example-image" alt="Rocky">
        <h4>Rocky at the Steps</h4>
      </div>

      <div class="example-card">
        <img src="https://replicate.delivery/yhqm/TrQgZT3CYkLXHh3pTFjEiNURqAYp6YzKeGJ9U5HquuegsymVA/out-0.png" class="example-image" alt="Babe Ruth">
        <h4>Babe Ruth Called Shot</h4>
      </div>

      <div class="example-card">
        <img src="https://via.placeholder.com/400x250/1C3664/FFFFFF/png?text=Presidential+Speech" class="example-image" alt="President">
        <h4>Presidential Speech</h4>
      </div>
    </div>
  </div>

  <!-- Products Section -->
  <div class="products-section">
    <h2>Available Products</h2>
    <p>Turn your iconic dog into a beautiful keepsake</p>

    <div class="products-grid">
      <div class="product-card">
        <h4>Framed Print</h4>
        <p>Premium quality frame with museum-grade print</p>
      </div>

      <div class="product-card">
        <h4>Canvas Print</h4>
        <p>Gallery-wrapped canvas stretched on wood frame</p>
      </div>

      <div class="product-card">
        <h4>Custom T-Shirt</h4>
        <p>High-quality print on comfortable cotton tee</p>
      </div>
    </div>
  </div>

  <!-- Final CTA -->
  <div class="cta-section">
    <h2>Ready to Make Your Dog a Legend?</h2>
    <p>Join thousands of dog owners who've transformed their pets into icons!</p>
    <a href="/pages/create-iconic-dog" class="btn-get-started">
      Start Creating Now
    </a>
  </div>
</div>
`;

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
  // Allow both GET and POST for easy testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const logs = [];
  function log(message) {
    console.log(message);
    logs.push(message);
  }

  try {
    log('🚀 Starting complete homepage setup...');

    // STEP 1: Check if welcome page exists, if not create it
    log('📄 Checking for existing welcome page...');
    const pagesData = await graphqlQuery(`
      query {
        pages(first: 50) {
          edges {
            node {
              id
              title
              handle
              body
            }
          }
        }
      }
    `);

    const pages = pagesData.pages.edges.map(e => e.node);
    let welcomePage = pages.find(p => p.handle === 'welcome');

    if (welcomePage) {
      log(`✓ Found existing welcome page: "${welcomePage.title}"`);

      // Update it with new content
      log('📝 Updating welcome page content...');
      const updateResult = await graphqlQuery(`
        mutation($id: ID!, $input: PageUpdateInput!) {
          pageUpdate(id: $id, page: $input) {
            page {
              id
              title
              handle
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        id: welcomePage.id,
        input: {
          title: 'Welcome to All Dogs Rock',
          body: WELCOME_PAGE_CONTENT
        }
      });

      if (updateResult.pageUpdate.userErrors.length > 0) {
        throw new Error(`Failed to update page: ${JSON.stringify(updateResult.pageUpdate.userErrors)}`);
      }

      log('✓ Welcome page updated successfully!');
    } else {
      // Create the welcome page
      log('📝 Creating new welcome page...');
      const createResult = await graphqlQuery(`
        mutation($input: PageCreateInput!) {
          pageCreate(page: $input) {
            page {
              id
              title
              handle
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        input: {
          title: 'Welcome to All Dogs Rock',
          handle: 'welcome',
          body: WELCOME_PAGE_CONTENT,
          isPublished: true
        }
      });

      if (createResult.pageCreate.userErrors.length > 0) {
        throw new Error(`Failed to create page: ${JSON.stringify(createResult.pageCreate.userErrors)}`);
      }

      welcomePage = createResult.pageCreate.page;
      log(`✓ Created welcome page: "${welcomePage.title}"`);
    }

    // STEP 2: Get active theme
    log('🎨 Fetching active theme...');
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
      throw new Error('No active theme found');
    }

    log(`✓ Found active theme: "${activeTheme.name}"`);

    // STEP 3: Get current index.liquid content
    log('📝 Fetching current index.liquid...');
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
      throw new Error('index.liquid not found in theme');
    }

    const currentContent = fileData.theme.file.content;
    log(`✓ Got current template (${currentContent.length} characters)`);

    // STEP 4: Create new content with redirect
    log('💾 Creating redirect template...');
    const timestamp = new Date().toISOString();
    const newContent = `{%- comment -%}
AUTO-REDIRECT TO WELCOME PAGE
Modified: ${timestamp}
Tool: Complete Homepage Setup API
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
ORIGINAL HOMEPAGE TEMPLATE (PRESERVED BELOW)
{%- endcomment -%}
${currentContent}`;

    // STEP 5: Update the file
    log('💾 Updating theme template...');
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
      throw new Error(`Failed to update template: ${JSON.stringify(updateResult.onlineStoreThemeFilesUpsert.userErrors)}`);
    }

    log('✓ Theme template updated successfully!');
    log('');
    log('🎉 SUCCESS! Your homepage is now set up!');

    return res.status(200).json({
      success: true,
      message: 'Homepage setup complete! Your store now shows the welcome page.',
      data: {
        welcomePage: {
          title: welcomePage.title,
          handle: welcomePage.handle,
          url: `https://alldogsrockshop.com/pages/welcome`
        },
        theme: {
          name: activeTheme.name,
          id: activeTheme.id
        },
        updatedFile: 'templates/index.liquid',
        timestamp
      },
      testUrls: [
        'https://alldogsrockshop.com',
        'https://8k5mna-5e.myshopify.com',
        `https://alldogsrockshop.com/pages/welcome`
      ],
      logs
    });

  } catch (error) {
    log(`❌ Error: ${error.message}`);
    console.error('Full error:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
      logs
    });
  }
}
