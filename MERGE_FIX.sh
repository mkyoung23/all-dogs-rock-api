#!/bin/bash
# Quick fix script - Merge the build error fix

echo "🔧 FIXING BUILD ERROR"
echo "===================="
echo ""
echo "Merging fix from: claude/fix-build-error-011CUj9cLkR3huUkFoWHA58c"
echo ""

# Navigate to repo
cd "$(dirname "$0")"

# Checkout main and pull latest
git checkout main
git pull origin main

# Merge the fix
git merge claude/fix-build-error-011CUj9cLkR3huUkFoWHA58c -m "Merge fix for deprecated 'assert' keyword"

# Push to main
git push origin main

echo ""
echo "✅ Fix deployed! Vercel will rebuild in ~60 seconds"
echo ""
echo "Test with:"
echo "curl https://all-dogs-rock-api-v2.vercel.app/api/poses/list"
