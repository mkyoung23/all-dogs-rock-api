#!/usr/bin/env python3
"""
Generate all 20 template images using DALL-E 3
Run this script to generate REAL dog template images
"""

import requests
import json
import time
from pathlib import Path

# Your OpenAI API key
OPENAI_API_KEY = "your_openai_api_key_here"

def generate_template(pose, index, total):
    """Generate a single template image"""
    print(f"\n[{index}/{total}] 🎨 Generating: {pose['name']}")
    print(f"    Prompt: {pose['prompt'][:80]}...")

    try:
        response = requests.post(
            'https://api.openai.com/v1/images/generations',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'dall-e-3',
                'prompt': pose['prompt'],
                'n': 1,
                'size': '1024x1024',
                'quality': 'hd'
            },
            timeout=120
        )

        if response.status_code == 200:
            data = response.json()
            url = data['data'][0]['url']
            print(f"    ✅ Success!")
            print(f"    📸 URL: {url[:60]}...")
            return {
                'id': pose['id'],
                'name': pose['name'],
                'url': url,
                'success': True
            }
        else:
            error_msg = response.json().get('error', {}).get('message', 'Unknown error')
            print(f"    ❌ Failed: {error_msg}")
            return {
                'id': pose['id'],
                'name': pose['name'],
                'error': error_msg,
                'success': False
            }

    except Exception as e:
        print(f"    ❌ Error: {str(e)}")
        return {
            'id': pose['id'],
            'name': pose['name'],
            'error': str(e),
            'success': False
        }

def main():
    print("=" * 70)
    print("🎨 GENERATING 20 REAL DOG TEMPLATE IMAGES WITH DALL-E 3")
    print("=" * 70)
    print("\n⏱️  Estimated time: ~60 seconds")
    print("💰 Cost: ~$0.80 (20 images × $0.04 HD quality)")
    print("\nStarting generation...\n")

    # Load poses
    poses_file = Path(__file__).parent / 'iconic-poses.json'
    with open(poses_file, 'r') as f:
        poses_data = json.load(f)

    poses = poses_data['poses']
    results = []

    # Generate all templates
    for i, pose in enumerate(poses, 1):
        result = generate_template(pose, i, len(poses))
        results.append(result)

        # Rate limit: wait 2 seconds between requests (except for last one)
        if i < len(poses):
            print("    ⏳ Waiting 2 seconds...")
            time.sleep(2)

    # Summary
    print("\n" + "=" * 70)
    print("🎉 GENERATION COMPLETE!")
    print("=" * 70)

    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]

    print(f"\n✅ Successful: {len(successful)}/{len(results)}")
    if failed:
        print(f"❌ Failed: {len(failed)}/{len(results)}")
        print("\nFailed templates:")
        for r in failed:
            print(f"  - {r['name']}: {r.get('error', 'Unknown error')}")

    # Save results
    output_file = Path(__file__).parent / 'template-urls.json'
    url_mapping = {r['id']: r['url'] for r in successful}

    with open(output_file, 'w') as f:
        json.dump(url_mapping, f, indent=2)

    print(f"\n📁 URLs saved to: {output_file}")

    # Update iconic-poses.json automatically
    if len(successful) > 0:
        print("\n🔄 Updating iconic-poses.json with new URLs...")

        for pose in poses:
            if pose['id'] in url_mapping:
                new_url = url_mapping[pose['id']]
                pose['templateUrl'] = new_url
                pose['thumbnailUrl'] = new_url

        # Save updated poses
        with open(poses_file, 'w') as f:
            json.dump(poses_data, f, indent=2)

        print(f"✅ Updated {len(successful)} poses in iconic-poses.json")

        print("\n" + "=" * 70)
        print("🚀 READY TO DEPLOY!")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Review iconic-poses.json - it's been updated with real URLs")
        print("2. Commit and push:")
        print("   git add iconic-poses.json template-urls.json")
        print("   git commit -m 'feat: Add real DALL-E 3 template images'")
        print("   git push")
        print("3. Test the face swap on your Vercel deployment!")
        print("\n✨ Your face swap system is ready to use!")

    return len(successful), len(failed)

if __name__ == "__main__":
    try:
        success_count, fail_count = main()
        exit(0 if fail_count == 0 else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Generation interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        exit(1)
