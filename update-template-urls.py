#!/usr/bin/env python3
"""
Update iconic-poses.json with generated template URLs from template-results.json
Run this after calling the batch generation API
"""

import json
import sys
from pathlib import Path

def update_template_urls():
    # Load the results from the API call
    results_file = Path('template-results.json')
    poses_file = Path('iconic-poses.json')

    if not results_file.exists():
        print("❌ Error: template-results.json not found!")
        print("Run this first:")
        print("  curl -X POST https://all-dogs-rock-api-v2.vercel.app/api/generate-templates \\")
        print("    -H 'Content-Type: application/json' \\")
        print("    -d '{\"batchMode\": true}' \\")
        print("    > template-results.json")
        sys.exit(1)

    if not poses_file.exists():
        print(f"❌ Error: {poses_file} not found!")
        sys.exit(1)

    print("📖 Loading template-results.json...")
    with open(results_file, 'r') as f:
        results_data = json.load(f)

    if not results_data.get('success'):
        print("❌ Error: Template generation failed!")
        print(json.dumps(results_data, indent=2))
        sys.exit(1)

    print("📖 Loading iconic-poses.json...")
    with open(poses_file, 'r') as f:
        poses_data = json.load(f)

    # Create backup
    backup_file = poses_file.with_suffix('.json.backup')
    print(f"💾 Creating backup: {backup_file}")
    with open(backup_file, 'w') as f:
        json.dump(poses_data, f, indent=2)

    # Create URL mapping from results
    url_mapping = {}
    for result in results_data.get('results', []):
        if result.get('success'):
            pose_id = result['poseId']
            url = result['url']
            url_mapping[pose_id] = url
            print(f"  ✅ {result['name']}: {url[:60]}...")
        else:
            print(f"  ❌ {result['name']}: {result.get('error', 'Unknown error')}")

    print(f"\n🔧 Updating {len(url_mapping)} poses with real URLs...")

    # Update poses with real URLs
    updated_count = 0
    for pose in poses_data['poses']:
        if pose['id'] in url_mapping:
            old_url = pose['templateUrl']
            new_url = url_mapping[pose['id']]

            if 'placeholder' in old_url:
                pose['templateUrl'] = new_url
                pose['thumbnailUrl'] = new_url
                updated_count += 1
                print(f"  ✅ Updated {pose['name']}")
            else:
                print(f"  ⏭️  Skipped {pose['name']} (already has real URL)")

    # Save updated poses
    print(f"\n💾 Saving updated iconic-poses.json...")
    with open(poses_file, 'w') as f:
        json.dump(poses_data, f, indent=2)

    print(f"\n✅ Success! Updated {updated_count} poses")
    print(f"\nNext steps:")
    print(f"  1. Review the changes: git diff iconic-poses.json")
    print(f"  2. Commit: git add iconic-poses.json")
    print(f"  3. Commit: git commit -m 'feat: Add real DALL-E 3 template images'")
    print(f"  4. Push: git push origin claude/continue-previous-work-011CUj9cLkR3huUkFoWHA58c")
    print(f"\n⚠️  IMPORTANT: DALL-E URLs expire in 1 hour!")
    print(f"  You should download these images and upload to permanent storage (Cloudinary, S3, etc.)")

if __name__ == '__main__':
    update_template_urls()
