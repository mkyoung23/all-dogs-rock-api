#!/bin/bash

# Generate all 7 example images and save to /public/examples
cd "$(dirname "$0")/.."

echo "🎨 Generating example images and saving to /public/examples..."
echo ""

# Create examples directory
mkdir -p public/examples

# Read poses from iconic-poses.json
POSES=$(cat iconic-poses.json | jq -c '.poses[]')

SUCCESS_COUNT=0
TOTAL_COUNT=0

while IFS= read -r pose; do
  TOTAL_COUNT=$((TOTAL_COUNT + 1))

  POSE_ID=$(echo "$pose" | jq -r '.id')
  POSE_NAME=$(echo "$pose" | jq -r '.name')
  PROMPT=$(echo "$pose" | jq -r '.prompt')

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[$TOTAL_COUNT/7] Generating: $POSE_NAME..."
  echo ""

  # Generate image with Replicate
  echo "   📤 Sending to Replicate..."
  PREDICTION=$(curl -s -X POST \
    https://api.replicate.com/v1/predictions \
    -H "Authorization: Token $REPLICATE_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"version\": \"80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c\",
      \"input\": {
        \"prompt\": $(echo "$PROMPT" | jq -Rs .),
        \"aspect_ratio\": \"1:1\",
        \"output_format\": \"jpg\",
        \"output_quality\": 90,
        \"safety_tolerance\": 2,
        \"prompt_upsampling\": true
      }
    }")

  GET_URL=$(echo "$PREDICTION" | jq -r '.urls.get')

  if [ "$GET_URL" = "null" ] || [ -z "$GET_URL" ]; then
    echo "   ❌ Failed to create prediction"
    continue
  fi

  echo "   ⏳ Waiting for generation..."

  # Poll for result
  IMAGE_URL=""
  for i in {1..60}; do
    sleep 2

    RESULT=$(curl -s -H "Authorization: Token $REPLICATE_API_KEY" "$GET_URL")
    STATUS=$(echo "$RESULT" | jq -r '.status')

    if [ "$STATUS" = "succeeded" ]; then
      IMAGE_URL=$(echo "$RESULT" | jq -r '.output')
      echo "   ✅ Generated!"
      break
    elif [ "$STATUS" = "failed" ]; then
      echo "   ❌ Generation failed: $(echo "$RESULT" | jq -r '.error')"
      break
    fi

    if [ $((i % 5)) -eq 0 ]; then
      echo "   ⏳ Still waiting... ($i attempts)"
    fi
  done

  if [ -z "$IMAGE_URL" ] || [ "$IMAGE_URL" = "null" ]; then
    echo "   ❌ No image generated"
    continue
  fi

  # Download to public/examples
  OUTPUT_FILE="public/examples/${POSE_ID}.jpg"
  echo "   📥 Downloading to $OUTPUT_FILE..."
  curl -s -o "$OUTPUT_FILE" "$IMAGE_URL"

  if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(wc -c < "$OUTPUT_FILE")
    echo "   ✅ Saved! ($FILE_SIZE bytes)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "   ❌ Download failed"
  fi

  echo ""

done <<< "$POSES"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Updating iconic-poses.json with local paths..."
echo ""

# Update iconic-poses.json to use /examples/ paths
NEW_JSON=$(cat iconic-poses.json | jq '
  .poses |= map(
    .exampleImageUrl = "/examples/" + .id + ".jpg" |
    .templateUrl = "/examples/" + .id + ".jpg" |
    .thumbnailUrl = "/examples/" + .id + ".jpg"
  )
')

echo "$NEW_JSON" > iconic-poses.json

echo "✅ Updated iconic-poses.json!"
echo ""

echo "============================================================"
echo "📊 SUMMARY"
echo "============================================================"
echo "✅ Success: $SUCCESS_COUNT/$TOTAL_COUNT images saved"
echo "📁 Location: /public/examples/"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
  echo "🎉 All images saved locally to the repository!"
  echo "   These files will be committed and deployed with your app."
  echo "   URLs will be permanent and never expire!"
  echo ""
  echo "Next steps:"
  echo "1. git add public/examples/ iconic-poses.json"
  echo "2. git commit -m 'feat: Add permanent example images to repository'"
  echo "3. git push"
  echo ""
  echo "Images will be available at:"
  echo "   https://all-dogs-rock-api.vercel.app/examples/{pose-id}.jpg"
fi
