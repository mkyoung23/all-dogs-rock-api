#!/bin/bash

# Regenerate all 7 example images and update iconic-poses.json
cd "$(dirname "$0")/.."

echo "🎨 Starting example image regeneration with Imgur upload..."
echo ""

# Read poses from iconic-poses.json
POSES_JSON=$(cat iconic-poses.json)

# Array to store results
declare -A RESULTS

# Generate each pose
while IFS= read -r line; do
  POSE_ID=$(echo "$line" | jq -r '.id')
  POSE_NAME=$(echo "$line" | jq -r '.name')
  PROMPT=$(echo "$line" | jq -r '.prompt')

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Call single image generator
  RESULT=$(./scripts/regenerate-one-image.sh "$POSE_ID" "$PROMPT" "$POSE_NAME" 2>&1)

  # Extract URLs from last line
  LAST_LINE=$(echo "$RESULT" | tail -1)
  if [[ "$LAST_LINE" == *"|"* ]]; then
    IMGUR_URL=$(echo "$LAST_LINE" | cut -d'|' -f2)
    RESULTS["$POSE_ID"]="$IMGUR_URL"
    echo "✅ Success: $POSE_ID -> $IMGUR_URL"
  else
    echo "❌ Failed: $POSE_ID"
    echo "$RESULT"
  fi

  echo ""
done < <(echo "$POSES_JSON" | jq -c '.poses[]')

# Update iconic-poses.json with new URLs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Updating iconic-poses.json with permanent URLs..."

UPDATED_JSON=$(echo "$POSES_JSON" | jq '
  .poses |= map(
    . + {
      exampleImageUrl: $results[.id] // .exampleImageUrl,
      templateUrl: $results[.id] // .templateUrl,
      thumbnailUrl: $results[.id] // .thumbnailUrl
    }
  )' --argjson results "$(
  for key in "${!RESULTS[@]}"; do
    echo "\"$key\": \"${RESULTS[$key]}\","
  done | sed '$ s/,$//' | awk 'BEGIN{print "{"} {print} END{print "}"}'
)")

echo "$UPDATED_JSON" > iconic-poses.json

# Count successes
SUCCESS_COUNT=${#RESULTS[@]}
echo "✅ Updated iconic-poses.json with $SUCCESS_COUNT permanent Imgur URLs!"
echo ""

echo "============================================================"
echo "📊 SUMMARY"
echo "============================================================"
echo "✅ Success: $SUCCESS_COUNT/7 images"
echo "❌ Failed: $((7 - SUCCESS_COUNT))/7 images"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
  echo "🎉 All successful images now have PERMANENT Imgur URLs!"
  echo "   No more 404 errors - these URLs never expire!"
  echo ""
  echo "Next steps:"
  echo "1. git add iconic-poses.json"
  echo "2. git commit -m \"fix: Update all example images with permanent Imgur URLs\""
  echo "3. git push"
fi
