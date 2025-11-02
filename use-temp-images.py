#!/usr/bin/env python3
"""
Use temporary free stock dog images for testing face swap
These are just placeholders - we'll generate proper iconic images later
"""

import json

# Temporary dog images from Unsplash (royalty-free)
TEMP_IMAGES = {
    "mj-free-throw-dunk": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1024&h=1024&fit=crop",
    "mona-lisa": "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=1024&h=1024&fit=crop",
    "jeter-jump-throw": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1024&h=1024&fit=crop",
    "rocky-statue": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop",
    "american-gothic": "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1024&h=1024&fit=crop",
    "abbey-road": "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop",
    "iwo-jima-flag": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1024&h=1024&fit=crop",
    "creation-of-adam": "https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=1024&h=1024&fit=crop",
    "girl-pearl-earring": "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=1024&h=1024&fit=crop",
    "the-scream": "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=1024&h=1024&fit=crop",
    "washington-crossing": "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=1024&h=1024&fit=crop",
    "einstein-tongue": "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1024&h=1024&fit=crop",
    "marilyn-subway": "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1024&h=1024&fit=crop",
    "james-dean-rebel": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop",
    "the-thinker": "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1024&h=1024&fit=crop",
    "superman-flying": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1024&h=1024&fit=crop",
    "ali-over-liston": "https://images.unsplash.com/photo-1455526050980-d3e7b9b789a4?w=1024&h=1024&fit=crop",
    "babe-ruth-called-shot": "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=1024&h=1024&fit=crop",
    "bruce-lee-ready": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1024&h=1024&fit=crop",
    "usain-bolt-lightning": "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1024&h=1024&fit=crop",
}

# Load current poses
with open('iconic-poses.json', 'r') as f:
    poses_data = json.load(f)

# Update with temporary images
updated = 0
for pose in poses_data['poses']:
    if pose['id'] in TEMP_IMAGES:
        pose['templateUrl'] = TEMP_IMAGES[pose['id']]
        pose['thumbnailUrl'] = TEMP_IMAGES[pose['id']]
        updated += 1
        print(f"✅ Updated {pose['name']}")

# Save
with open('iconic-poses.json', 'w') as f:
    json.dump(poses_data, f, indent=2)

print(f"\n✅ Updated {updated}/20 poses with temporary images")
print("🎉 Ready to test face swap!")
print("\nNext: Deploy to production and test")
