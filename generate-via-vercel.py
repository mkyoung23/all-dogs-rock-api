#!/usr/bin/env python3
"""
Generate iconic dog template images one at a time using Vercel API
This bypasses the batch timeout issue
"""

import requests
import json
import time
from pathlib import Path

# Vercel API endpoint
VERCEL_API = "https://all-dogs-rock-api-v2.vercel.app/api/generate-templates"

def load_poses():
    """Load iconic poses from JSON"""
    with open('iconic-poses.json', 'r') as f:
        data = json.load(f)
    return data['poses']

def generate_single_template(pose_id, pose_name):
    """Generate a single template via Vercel API"""
    print(f"🎨 Generating: {pose_name}")

    try:
        response = requests.post(
            VERCEL_API,
            headers={'Content-Type': 'application/json'},
            json={'poseId': pose_id},
            timeout=180
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                url = data.get('url')
                print(f"  ✅ Success! URL: {url[:60]}...")
                return url
            else:
                print(f"  ❌ Failed: {data.get('error', 'Unknown error')}")
                return None
        else:
            print(f"  ❌ HTTP {response.status_code}: {response.text[:100]}")
            return None

    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return None

def main():
    print("=" * 70)
    print("🎨 GENERATING 20 ICONIC DOG TEMPLATE IMAGES")
    print("=" * 70)
    print()

    poses = load_poses()
    results = {}

    for i, pose in enumerate(poses, 1):
        print(f"\n[{i}/20] ", end='')
        url = generate_single_template(pose['id'], pose['name'])

        if url:
            results[pose['id']] = url

        # Wait 3 seconds between requests
        if i < len(poses):
            print("  ⏳ Waiting 3 seconds...")
            time.sleep(3)

    print("\n" + "=" * 70)
    print(f"✅ Generated {len(results)}/{len(poses)} templates successfully")
    print("=" * 70)

    # Save results
    with open('template-urls.json', 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n💾 Saved URLs to template-urls.json")
    print("\nNext step: Run update-template-urls.py to update iconic-poses.json")

if __name__ == '__main__':
    main()
