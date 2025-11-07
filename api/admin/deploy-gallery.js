// Admin endpoint to deploy gallery page to Shopify
// This uses the Shopify Admin API to create the page and add navigation

import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get credentials from environment or request body
    const accessToken = req.body.accessToken || process.env.SHOPIFY_ACCESS_TOKEN;
    const shop = req.body.shop || process.env.SHOPIFY_STORE_DOMAIN || '8k5mna-5e.myshopify.com';

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access token required',
        message: 'Please provide accessToken in request body or set SHOPIFY_ACCESS_TOKEN env var',
        hint: 'You can get this from the OAuth callback after app installation'
      });
    }

    console.log('🚀 Deploying gallery page to shop:', shop);

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

    return res.status(200).json({
      success: true,
      message: 'Gallery page deployed and added to navigation!',
      page: createdPage,
      pageUrl: `https://${shop.replace('.myshopify.com', '')}/pages/${createdPage.handle}`,
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
