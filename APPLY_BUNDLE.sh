#!/bin/bash
# Script to apply the git bundle with all commits

echo "=========================================="
echo "Applying All Dogs Rock Git Bundle"
echo "=========================================="
echo ""

# Check if bundle exists
if [ ! -f "all-dogs-rock-complete.bundle" ]; then
    echo "❌ Error: all-dogs-rock-complete.bundle not found!"
    echo "Make sure you're in the all-dogs-rock-api directory"
    exit 1
fi

# Verify bundle
echo "🔍 Verifying bundle..."
git bundle verify all-dogs-rock-complete.bundle

if [ $? -ne 0 ]; then
    echo "❌ Bundle verification failed!"
    exit 1
fi

echo "✅ Bundle verified successfully"
echo ""

# Check current branch
current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"

if [ "$current_branch" != "claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag" ]; then
    echo "⚠️  You're not on the right branch!"
    echo "Switching to claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag..."
    git checkout claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag
fi

echo ""
echo "📦 Applying bundle commits..."
git pull all-dogs-rock-complete.bundle claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Bundle applied successfully!"
    echo ""
    echo "Recent commits:"
    git log --oneline -5
    echo ""
    echo "=========================================="
    echo "✨ Now push to GitHub:"
    echo "=========================================="
    echo ""
    echo "git push origin claude/online-store-planning-011CUeAhybwWGj8dcMimZ9Ag"
    echo ""
else
    echo "❌ Failed to apply bundle"
    exit 1
fi
