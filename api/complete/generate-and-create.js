// Complete Unified Flow: Generate AI Image → Create Printify Product → Add to Shopify
// This is the main endpoint customers will use

import { readFileSync } from 'fs';
import { join } from 'path';

const iconicPoses = JSON.parse(
  readFileSync(join(process.cwd(), 'iconic-poses.json'), 'utf-8')
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      poseId,
      dogBreed = 'golden retriever',
      productType = 'poster',
      createProduct = false, // Set to true to create Printify product
    } = req.body;

    if (!poseId) {
      return res.status(400).json({ error: 'Pose ID is required' });
    }

    const selectedPose = iconicPoses.poses.find((pose) => pose.id === poseId);
    if (!selectedPose) {
      return res.status(400).json({ error: `Invalid pose ID: ${poseId}` });
    }

    console.log('🎨 COMPLETE FLOW STARTED 🎨');
    console.log('Step 1: Generate AI image');
    console.log('Pose:', selectedPose.name);
    console.log('Breed:', dogBreed);

    // ========== STEP 1: GENERATE AI IMAGE ==========
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Replicate API token not configured' });
    }

    const prompt = selectedPose.prompt.replace(
      /golden retriever|german shepherd|husky|beagle|corgi|rottweiler|boxer|french bulldog|labrador retriever|poodle|dalmatian|australian shepherd|border collie|doberman|shiba inu|jack russell terrier|saint bernard|cavalier king charles spaniel|pug|samoyed|spaniel|bulldog|poodle|greyhound/gi,
      dogBreed
    );

    const createResponse = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-1.1-pro',
        input: {
          prompt: prompt,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90,
          safety_tolerance: 2,
          prompt_upsampling: true,
        },
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      return res.status(createResponse.status).json({
        error: 'Failed to start image generation',
        details: errorData,
      });
    }

    const prediction = await createResponse.json();
    console.log('✅ AI generation started:', prediction.id);

    // Poll for completion
    const pollUrl = prediction.urls.get;
    let attempts = 0;
    const maxAttempts = 60;
    let imageUrl = null;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pollResponse = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to poll prediction');
      }

      const pollData = await pollResponse.json();

      if (pollData.status === 'succeeded') {
        imageUrl = pollData.output;
        console.log('✅ AI image generated:', imageUrl);
        break;
      }

      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        throw new Error(`Generation failed: ${pollData.error || 'Canceled'}`);
      }

      attempts++;
    }

    if (!imageUrl) {
      return res.status(504).json({ error: 'Generation timeout' });
    }

    // ========== STEP 2: CREATE PRINTIFY PRODUCT (Optional) ==========
    let printifyProductId = null;
    let shopifyProductId = null;

    if (createProduct && process.env.PRINTIFY_SECRET_KEY) {
      console.log('Step 2: Creating Printify product...');

      try {
        const productTitle = `${dogBreed} as ${selectedPose.name}`;
        const productDescription = `Stunning AI-generated art featuring your ${dogBreed} in the iconic "${selectedPose.name}" pose. Perfect for dog lovers!`;

        // Upload to Printify
        const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PRINTIFY_SECRET_KEY}`,
          },
          body: JSON.stringify({
            file_name: `${selectedPose.id}_${dogBreed}_${Date.now()}.jpg`,
            url: imageUrl,
          }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          console.log('✅ Uploaded to Printify:', uploadData.id);

          // Create product
          const shopId = process.env.PRINTIFY_SHOP_ID || '15007872';

          const blueprintMap = {
            poster: { blueprint_id: 3, print_provider_id: 1, variant_ids: [17388] },
            canvas: { blueprint_id: 165, print_provider_id: 1, variant_ids: [45790] },
            mug: { blueprint_id: 19, print_provider_id: 1, variant_ids: [12181] },
            tshirt: { blueprint_id: 6, print_provider_id: 1, variant_ids: [17390] },
          };

          const config = blueprintMap[productType] || blueprintMap.poster;

          const productResponse = await fetch(
            `https://api.printify.com/v1/shops/${shopId}/products.json`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PRINTIFY_SECRET_KEY}`,
              },
              body: JSON.stringify({
                title: productTitle,
                description: productDescription,
                blueprint_id: config.blueprint_id,
                print_provider_id: config.print_provider_id,
                variants: config.variant_ids.map((id) => ({
                  id,
                  price: 1999,
                  is_enabled: true,
                })),
                print_areas: [
                  {
                    variant_ids: config.variant_ids,
                    placeholders: [
                      {
                        position: 'front',
                        images: [
                          {
                            id: uploadData.id,
                            x: 0.5,
                            y: 0.5,
                            scale: 1,
                            angle: 0,
                          },
                        ],
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (productResponse.ok) {
            const productData = await productResponse.json();
            printifyProductId = productData.id;
            console.log('✅ Printify product created:', printifyProductId);

            // Try to publish to Shopify
            try {
              await fetch(
                `https://api.printify.com/v1/shops/${shopId}/products/${printifyProductId}/publish.json`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PRINTIFY_SECRET_KEY}`,
                  },
                  body: JSON.stringify({
                    title: true,
                    description: true,
                    images: true,
                    variants: true,
                    tags: ['custom-dog-art', 'ai-generated', selectedPose.category.toLowerCase()],
                  }),
                }
              );
              console.log('✅ Published to Shopify');
            } catch (publishError) {
              console.warn('⚠️ Could not publish to Shopify:', publishError.message);
            }
          }
        }
      } catch (printifyError) {
        console.error('⚠️ Printify error (continuing anyway):', printifyError.message);
      }
    }

    // ========== RETURN COMPLETE RESPONSE ==========
    console.log('🎉 COMPLETE FLOW FINISHED 🎉');

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      poseName: selectedPose.name,
      poseId: selectedPose.id,
      dogBreed: dogBreed,
      productType: productType,
      ...(printifyProductId && {
        printifyProductId: printifyProductId,
        productCreated: true,
      }),
      ...(shopifyProductId && {
        shopifyProductId: shopifyProductId,
      }),
      message: 'Image generated successfully!',
    });
  } catch (error) {
    console.error('❌ Complete flow error:', error);
    return res.status(500).json({
      error: 'Failed to complete generation',
      details: error.message,
    });
  }
}
