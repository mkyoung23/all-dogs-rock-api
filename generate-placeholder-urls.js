// Generate working placeholder URLs for all 20 poses
import fs from 'fs';

const iconicPoses = JSON.parse(fs.readFileSync('./iconic-poses.json', 'utf8'));

// Use via.placeholder.com - it's reliable and hosted
const colors = [
  '667eea', 'f44336', '4caf50', '2196f3', 'ff9800',
  '9c27b0', '00bcd4', 'ff5722', '3f51b5', '8bc34a',
  'e91e63', '009688', 'ffc107', '673ab7', 'cddc39',
  'ff9800', '607d8b', '795548', 'ff5722', 'f44336'
];

iconicPoses.poses.forEach((pose, index) => {
  const color = colors[index];
  const text = encodeURIComponent(pose.name);

  // Use placeholder with custom text
  const url = `https://via.placeholder.com/1024x1024.png/${color}/ffffff?text=${text}`;

  pose.templateUrl = url;
  pose.thumbnailUrl = url;

  console.log(`✅ ${pose.name}: ${url}`);
});

fs.writeFileSync('./iconic-poses.json', JSON.stringify(iconicPoses, null, 2));

console.log('\n✅ Updated iconic-poses.json with 20 working placeholder URLs');
console.log('🚀 Ready to deploy - system will work immediately!');
console.log('💡 Replace with real dog images later when you can generate them');
