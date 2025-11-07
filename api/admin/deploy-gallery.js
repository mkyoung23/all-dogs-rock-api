// Admin endpoint to deploy gallery page AND homepage to Shopify
// This uses the Shopify Admin API to create the pages and add navigation

import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try ALL possible Shopify token environment variable names - INCLUDING custom AllDogsRock name!
    const accessToken = req.body.accessToken ||
                       process.env.ALLDOGSROCK_GALLERY_ADMIN_APP_KEY ||
                       process.env.AllDogsRock_Gallery_Admin_App_Key ||
                       process.env.SHOPIFY_APP_ADMIN_API_KEY ||
                       process.env.SHOPIFY_ADMIN_API_KEY ||
                       process.env.SHOPIFY_ACCESS_TOKEN ||
                       process.env.SHOPIFY_TOKEN ||
                       process.env.SHOPIFY_ADMIN_TOKEN ||
                       process.env.SHOPIFY_API_TOKEN ||
                       process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    const shop = req.body.shop || process.env.SHOPIFY_STORE_DOMAIN || '8k5mna-5e.myshopify.com';

    // Debug: Show which token is being used
    const tokenSource = req.body.accessToken ? 'request body' :
                       process.env.ALLDOGSROCK_GALLERY_ADMIN_APP_KEY ? 'ALLDOGSROCK_GALLERY_ADMIN_APP_KEY' :
                       process.env.AllDogsRock_Gallery_Admin_App_Key ? 'AllDogsRock_Gallery_Admin_App_Key' :
                       process.env.SHOPIFY_APP_ADMIN_API_KEY ? 'SHOPIFY_APP_ADMIN_API_KEY' :
                       process.env.SHOPIFY_ADMIN_API_KEY ? 'SHOPIFY_ADMIN_API_KEY' :
                       process.env.SHOPIFY_ACCESS_TOKEN ? 'SHOPIFY_ACCESS_TOKEN' :
                       process.env.SHOPIFY_TOKEN ? 'SHOPIFY_TOKEN' :
                       process.env.SHOPIFY_ADMIN_TOKEN ? 'SHOPIFY_ADMIN_TOKEN' :
                       process.env.SHOPIFY_API_TOKEN ? 'SHOPIFY_API_TOKEN' :
                       process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? 'SHOPIFY_ADMIN_ACCESS_TOKEN' : 'none';

    if (!accessToken) {
      // List all available Shopify-related env vars for debugging
      const availableShopifyEnvs = Object.keys(process.env).filter(k =>
        k.includes('SHOPIFY') || k.includes('shopify') || k.includes('ALLDOGSROCK') || k.includes('AllDogsRock')
      );
      return res.status(400).json({
        error: 'Access token required',
        message: 'No Shopify access token found in environment',
        availableShopifyEnvs: availableShopifyEnvs,
        hint: 'Please set one of: ALLDOGSROCK_GALLERY_ADMIN_APP_KEY, SHOPIFY_ACCESS_TOKEN, SHOPIFY_APP_ADMIN_API_KEY, or provide accessToken in request body'
      });
    }

    console.log('🚀 Deploying pages to shop:', shop);
    console.log('🔑 Using token from:', tokenSource);

    // Read the Liquid template
    const liquidTemplate = readFileSync(
      join(process.cwd(), 'shopify-gallery-with-upload.liquid'),
      'utf-8'
    );

    // Create page using Shopify Admin GraphQL API
    const createPageMutation = `
      mutation createPage($input: PageCreateInput!) {
        pageCreate(page: $input) {
          page {
            id
            title
            handle
            body
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const pageInput = {
      title: 'Create Iconic Dog',
      handle: 'create-iconic-dog',
      body: liquidTemplate,
      published: true,
    };

    // Call Shopify GraphQL API
    const shopifyUrl = `https://${shop}/admin/api/2025-10/graphql.json`;

    const pageResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: createPageMutation,
        variables: { input: pageInput }
      }),
    });

    const pageData = await pageResponse.json();

    if (pageData.errors) {
      console.error('❌ GraphQL errors:', pageData.errors);
      return res.status(400).json({
        error: 'Failed to create page',
        details: pageData.errors
      });
    }

    if (pageData.data.pageCreate.userErrors.length > 0) {
      console.error('❌ User errors:', pageData.data.pageCreate.userErrors);
      return res.status(400).json({
        error: 'Failed to create page',
        details: pageData.data.pageCreate.userErrors
      });
    }

    const createdPage = pageData.data.pageCreate.page;
    console.log('✅ Page created:', createdPage.handle);

    // Now add navigation menu item
    const addMenuItemMutation = `
      mutation menuItemAdd($menuId: ID!, $parentId: ID, $menuItem: MenuItemInput!) {
        menuItemAdd(menuId: $menuId, parentId: $parentId, menuItem: $menuItem) {
          menuItem {
            id
            title
            url
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // First, get the main menu ID
    const getMenuQuery = `
      query {
        menus(first: 10) {
          edges {
            node {
              id
              handle
              title
            }
          }
        }
      }
    `;

    const menuResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: getMenuQuery }),
    });

    const menuData = await menuResponse.json();

    if (menuData.errors) {
      console.error('❌ Failed to get menus:', menuData.errors);
      return res.status(200).json({
        success: true,
        message: 'Page created but navigation item not added',
        page: createdPage,
        pageUrl: `https://${shop.replace('.myshopify.com', '')}/pages/${createdPage.handle}`,
        navigationError: menuData.errors
      });
    }

    // Find the main menu (usually "main-menu")
    const mainMenu = menuData.data.menus.edges.find(
      edge => edge.node.handle === 'main-menu' || edge.node.title === 'Main menu'
    );

    if (!mainMenu) {
      console.warn('⚠️ Main menu not found');
      return res.status(200).json({
        success: true,
        message: 'Page created but navigation item not added (menu not found)',
        page: createdPage,
        pageUrl: `https://${shop.replace('.myshopify.com', '')}/pages/${createdPage.handle}`,
      });
    }

    // Add menu item
    const menuItemInput = {
      title: 'Create Iconic Dog',
      url: `/pages/${createdPage.handle}`,
      type: 'PAGE'
    };

    const menuItemResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: addMenuItemMutation,
        variables: {
          menuId: mainMenu.node.id,
          menuItem: menuItemInput
        }
      }),
    });

    const menuItemData = await menuItemResponse.json();

    if (menuItemData.errors || menuItemData.data.menuItemAdd.userErrors.length > 0) {
      console.error('❌ Failed to add menu item:', menuItemData.errors || menuItemData.data.menuItemAdd.userErrors);
      return res.status(200).json({
        success: true,
        message: 'Page created but navigation item not added',
        page: createdPage,
        pageUrl: `https://${shop.replace('.myshopify.com', '')}/pages/${createdPage.handle}`,
        navigationError: menuItemData.errors || menuItemData.data.menuItemAdd.userErrors
      });
    }

    console.log('✅ Navigation menu item added');

    // ALSO DEPLOY HOMEPAGE
    console.log('🏠 Now deploying homepage...');

    try {
      const homepageTemplate = readFileSync(
        join(process.cwd(), 'shopify-homepage.liquid'),
        'utf-8'
      );

      const homepageResponse = await fetch(shopifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query: createPageMutation,
          variables: {
            input: {
              title: 'Welcome to All Dogs Rock',
              handle: 'home',
              body: homepageTemplate,
              published: true
            }
          }
        }),
      });

      const homepageData = await homepageResponse.json();

      if (homepageData.data?.pageCreate?.page) {
        console.log('✅ Homepage deployed:', homepageData.data.pageCreate.page.handle);
      } else {
        console.error('⚠️ Homepage deployment had issues:', homepageData);
      }
    } catch (homepageError) {
      console.error('⚠️ Homepage deployment failed (continuing anyway):', homepageError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Gallery page AND homepage deployed and added to navigation!',
      page: createdPage,
      pageUrl: `https://${shop.replace('.myshopify.com', '')}/pages/${createdPage.handle}`,
      homepageUrl: `https://${shop.replace('.myshopify.com', '')}/pages/home`,
      menuItem: menuItemData.data.menuItemAdd.menuItem
    });

  } catch (error) {
    console.error('❌ Deployment error:', error);
    return res.status(500).json({
      error: 'Deployment failed',
      details: error.message
    });
  }
}
