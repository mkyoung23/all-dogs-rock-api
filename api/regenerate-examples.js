// Regenerate all example dog images
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'Missing REPLICATE_API_TOKEN' });
  }

  const FLUX_VERSION = '80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c';

  const poses = [
    {
      id: "mona-lisa",
      name: "Mona Lisa",
      prompt: "Recreation of the Mona Lisa painting by Leonardo da Vinci - elegant golden retriever dog in the exact pose and composition, sitting with paws folded, subtle smile, dark Renaissance clothing, misty landscape background with winding paths and bridge, museum quality Renaissance oil painting style, warm earth tones, highly detailed, masterpiece quality"
    },
    {
      id: "american-gothic",
      name: "American Gothic",
      prompt: "Recreation of the American Gothic painting by Grant Wood - two dogs (beagle and retriever) standing in front of white farmhouse with Gothic window, one holding a pitchfork, wearing 1930s farm clothing, stern expressions, Midwest American Gothic architectural background, oil painting style, museum quality, highly detailed"
    },
    {
      id: "abbey-road",
      name: "Abbey Road Crossing",
      prompt: "Recreation of the iconic Beatles Abbey Road album cover - golden retriever dog walking across the white striped crosswalk on Abbey Road, trees lining the street, vintage 1960s London street scene, sunny day, professional album cover photography, exact composition of the original, 8k, highly detailed"
    },
    {
      id: "creation-of-adam",
      name: "Creation of Adam",
      prompt: "Recreation of Michelangelo's Creation of Adam from Sistine Chapel - golden retriever dog as Adam reaching out paw to touch finger of God, reclining on green earth, flowing robes, Renaissance fresco painting style, divine light, classical art composition, museum masterpiece quality, highly detailed"
    },
    {
      id: "girl-pearl-earring",
      name: "Girl with a Pearl Earring",
      prompt: "Recreation of Girl with a Pearl Earring by Vermeer - elegant spaniel dog looking over shoulder, wearing exotic turban and large pearl earring, dark background, soft lighting from left side, Dutch Golden Age oil painting style, museum quality, exquisite detail, 8k"
    },
    {
      id: "the-scream",
      name: "The Scream",
      prompt: "Recreation of The Scream by Edvard Munch - husky dog with paws on face in anguished expression on wooden bridge, swirling orange and red sky background, two figures in distance, expressionist painting style, dramatic emotional scene, bold brushstrokes, museum masterpiece quality, 8k"
    },
    {
      id: "washington-crossing",
      name: "Washington Crossing the Delaware",
      prompt: "Recreation of Washington Crossing the Delaware painting - golden retriever dog as General Washington standing heroically in boat crossing icy river, Revolutionary War uniform with cape flowing, soldiers rowing boat, American flag, chunks of ice in water, dramatic historical oil painting style, 8k, highly detailed"
    }
  ];

  const results = [];

  for (const pose of poses) {
    try {
      console.log(`Generating ${pose.name}...`);

      const fluxResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: FLUX_VERSION,
          input: {
            prompt: pose.prompt,
            aspect_ratio: '1:1',
            output_format: 'jpg',
            output_quality: 90,
            safety_tolerance: 2,
            prompt_upsampling: true
          }
        }),
      });

      if (!fluxResponse.ok) {
        throw new Error(`FLUX API error: ${fluxResponse.status}`);
      }

      const prediction = await fluxResponse.json();
      const pollUrl = prediction.urls.get;

      // Poll for completion
      let imageUrl = null;
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pollResponse = await fetch(pollUrl, {
          headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
        });

        const pollData = await pollResponse.json();

        if (pollData.status === 'succeeded') {
          imageUrl = pollData.output;
          break;
        } else if (pollData.status === 'failed') {
          throw new Error(`Generation failed: ${pollData.error}`);
        }
      }

      if (!imageUrl) {
        throw new Error('Timeout waiting for image');
      }

      results.push({
        id: pose.id,
        name: pose.name,
        url: imageUrl,
        status: 'success'
      });

      console.log(`✅ ${pose.name}: ${imageUrl}`);

    } catch (error) {
      results.push({
        id: pose.id,
        name: pose.name,
        error: error.message,
        status: 'failed'
      });
      console.error(`❌ ${pose.name}: ${error.message}`);
    }
  }

  return res.status(200).json({ results });
}
