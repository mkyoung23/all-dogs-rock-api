// Update iconic-poses.json with actual reference images
// These show the REAL iconic moments so customers know exactly what they're choosing

import { readFileSync, writeFileSync } from 'fs';

const poses = JSON.parse(readFileSync('iconic-poses.json', 'utf-8'));

// Update with high-quality reference images of the actual iconic moments
const imageUpdates = {
  "mj-free-throw-dunk": "https://i.imgur.com/2YHlL9N.jpg", // MJ dunk
  "mona-lisa": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
  "rocky-statue": "https://static01.nyt.com/images/2015/11/29/sports/29ROCKY/29ROCKY-superJumbo.jpg",
  "einstein-tongue": "https://i.imgur.com/McD2NKg.jpg",
  "superman-flying": "https://i.imgur.com/Th8zQXR.jpg",
  "ali-over-liston": "https://npr.brightspotcdn.com/dims4/default/8fc3f90/2147483647/strip/true/crop/3000x1997+0+0/resize/880x586!/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Flegacy%2Fsites%2Fkazu%2Ffiles%2F201505%2Fali-liston.jpg",
  "jeter-jump-throw": "https://i.imgur.com/h8NBnJN.jpg",
  "abbey-road": "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
  "american-gothic": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg",
  "girl-pearl-earring": "https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg",
  "the-scream": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
  "creation-of-adam": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1920px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
  "the-thinker": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Rodin_-_The_Thinker.jpg/800px-Rodin_-_The_Thinker.jpg",
  "washington-crossing": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/1920px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg",
  "iwo-jima-flag": "https://upload.wikimedia.org/wikipedia/en/a/a1/WW2_Iwo_Jima_flag_raising.jpg",
  "marilyn-subway": "https://i.imgur.com/s5ZyQJ6.jpg",
  "james-dean-rebel": "https://i.imgur.com/X7fN8Bh.jpg",
  "bruce-lee-ready": "https://i.imgur.com/B1KpjXR.jpg",
  "babe-ruth-called-shot": "https://i.imgur.com/TkP8l1P.jpg",
  "usain-bolt-lightning": "https://i.imgur.com/yRhWxLP.jpg"
};

// Update poses with new images
poses.poses.forEach(pose => {
  if (imageUpdates[pose.id]) {
    pose.templateUrl = imageUpdates[pose.id];
    pose.thumbnailUrl = imageUpdates[pose.id];
  }
});

writeFileSync('iconic-poses.json', JSON.stringify(poses, null, 2));
console.log('✅ Updated iconic-poses.json with real reference images!');
