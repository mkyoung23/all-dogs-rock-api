// Shopify GraphQL Admin API Client
// Uses Admin API access token from Vercel environment variables

/**
 * Make a GraphQL query to Shopify Admin API
 * @param {string} query - GraphQL query string
 * @param {object} variables - Variables for the query
 * @returns {Promise<object>} - Response data
 */
export async function shopifyAdminQuery(query, variables = {}) {
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN || 'www.alldogsrockshop.com';
  const accessToken = process.env.SHOPIFY_SECRET_KEY; // This is the admin API access token

  // Remove www. and .com if present, add .myshopify.com
  let shopifyDomain = shopDomain.replace('www.', '').replace('.com', '');
  if (!shopifyDomain.includes('.myshopify.com')) {
    shopifyDomain = shopifyDomain.replace('.com', '') + '.myshopify.com';
  }

  const apiUrl = `https://${shopifyDomain}/admin/api/2025-01/graphql.json`;

  console.log('🛍️ Shopify API Request:', apiUrl);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Shopify API Error:', response.status, errorText);
    throw new Error(`Shopify API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (data.errors) {
    console.error('❌ GraphQL Errors:', JSON.stringify(data.errors, null, 2));
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

/**
 * Get product by ID
 */
export async function getProduct(productId) {
  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        description
        handle
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              sku
            }
          }
        }
      }
    }
  `;

  return shopifyAdminQuery(query, { id: productId });
}

/**
 * Create a new product in Shopify
 */
export async function createProduct({ title, description, productType, vendor, tags }) {
  const query = `
    mutation createProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          handle
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      title,
      descriptionHtml: description,
      productType: productType || 'Custom Dog Art',
      vendor: vendor || 'All Dogs Rock',
      tags: tags || ['custom', 'ai-generated', 'dog-art'],
    },
  };

  const data = await shopifyAdminQuery(query, variables);

  if (data.productCreate.userErrors?.length > 0) {
    throw new Error(`Product creation failed: ${JSON.stringify(data.productCreate.userErrors)}`);
  }

  return data.productCreate.product;
}

/**
 * Add variant to existing product
 */
export async function addProductVariant(productId, { title, price, sku, imageUrl }) {
  const query = `
    mutation productVariantCreate($input: ProductVariantInput!) {
      productVariantCreate(input: $input) {
        productVariant {
          id
          title
          price
          sku
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      productId,
      title,
      price: price.toString(),
      sku,
      ...(imageUrl && {
        imageSrc: imageUrl,
      }),
    },
  };

  const data = await shopifyAdminQuery(query, variables);

  if (data.productVariantCreate.userErrors?.length > 0) {
    throw new Error(`Variant creation failed: ${JSON.stringify(data.productVariantCreate.userErrors)}`);
  }

  return data.productVariantCreate.productVariant;
}

/**
 * List all products (paginated)
 */
export async function listProducts(limit = 10) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            productType
          }
        }
      }
    }
  `;

  return shopifyAdminQuery(query, { first: limit });
}
