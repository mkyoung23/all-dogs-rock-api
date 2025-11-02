// Update iconic-poses.json with placeholder images from Lorem Picsum
// These are real hosted images that will work immediately

import fs from 'fs';

const iconicPoses = JSON.parse(fs.readFileSync('./iconic-poses.json', 'utf8'));

// Use Lorem Picsum for high-quality placeholder images
// Format: https://picsum.photos/seed/{seed}/1024/1024
const seeds = [
  'basketball', 'baseball', 'superhero', 'astronaut', 'royal',
  'knight', 'pilot', 'chef', 'graduate', 'wedding',
  'rockstar', 'surfer', 'cowboy', 'spy', 'pirate',
  'scientist', 'firefighter', 'renaissance', 'disco', 'santa'
];

iconicPoses.poses.forEach((pose, index) => {
  const seed = seeds[index] || `dog${index}`;
  const url = `https://picsum.photos/seed/${seed}/1024/1024`;

  pose.templateUrl = url;
  pose.thumbnailUrl = url;

  console.log(`✅ ${pose.name}: ${url}`);
});

fs.writeFileSync('./iconic-poses.json', JSON.stringify(iconicPoses, null, 2));

console.log('\n✅ Updated iconic-poses.json with 20 placeholder images');
console.log('These are temporary placeholders - replace with real dog images later');
