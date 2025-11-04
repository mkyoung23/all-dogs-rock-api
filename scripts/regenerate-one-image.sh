#!/bin/bash

# Generate a single example image and upload to Imgur
# Usage: ./regenerate-one-image.sh "pose-id" "prompt" "pose-name"

POSE_ID="$1"
PROMPT="$2"
POSE_NAME="$3"

if [ -z "$REPLICATE_API_KEY" ]; then
  echo "❌ REPLICATE_API_KEY environment variable not set!"
  exit 1
fi

echo "🖼️  Generating: $POSE_NAME..."
echo "   Prompt: ${PROMPT:0:80}..."

# Step 1: Create prediction
echo "   📤 Sending to Replicate..."

PREDICTION=$(curl -s -X POST \
  https://api.replicate.com/v1/predictions \
  -H "Authorization: Token $REPLICATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": \"80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c\",
    \"input\": {
      \"prompt\": \"$PROMPT\",
      \"aspect_ratio\": \"1:1\",
      \"output_format\": \"jpg\",
      \"output_quality\": 90,
      \"safety_tolerance\": 2,
      \"prompt_upsampling\": true
    }
  }")

GET_URL=$(echo "$PREDICTION" | grep -o '"get":"[^"]*"' | cut -d'"' -f4)

if [ -z "$GET_URL" ]; then
  echo "   ❌ Failed to create prediction"
  echo "$PREDICTION"
  exit 1
fi

echo "   ⏳ Waiting for generation..."

# Step 2: Poll for result
for i in {1..60}; do
  sleep 2

  RESULT=$(curl -s -H "Authorization: Token $REPLICATE_API_KEY" "$GET_URL")
  STATUS=$(echo "$RESULT" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

  if [ "$STATUS" = "succeeded" ]; then
    IMAGE_URL=$(echo "$RESULT" | grep -o '"output":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Generated: $IMAGE_URL"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "   ❌ Generation failed"
    echo "$RESULT"
    exit 1
  fi

  if [ $((i % 5)) -eq 0 ]; then
    echo "   ⏳ Still waiting... ($i attempts)"
  fi
done

if [ -z "$IMAGE_URL" ]; then
  echo "   ❌ Timeout waiting for image"
  exit 1
fi

# Step 3: Download and upload to Imgur
echo "   📥 Downloading image..."
TMP_FILE="/tmp/${POSE_ID}.jpg"
curl -s -o "$TMP_FILE" "$IMAGE_URL"

echo "   📤 Uploading to Imgur..."

# Use multipart form data to upload file directly (no base64 needed)
IMGUR_RESPONSE=$(curl -s -X POST \
  https://api.imgur.com/3/image \
  -H "Authorization: Client-ID 546c25a59c58ad7" \
  -F "image=@$TMP_FILE" \
  -F "type=file" \
  -F "name=${POSE_ID}.jpg" \
  -F "title=$POSE_NAME")

IMGUR_URL=$(echo "$IMGUR_RESPONSE" | grep -o '"link":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$IMGUR_URL" ]; then
  echo "   ⚠️  Imgur upload failed, using Replicate URL"
  IMGUR_URL="$IMAGE_URL"
else
  echo "   ✅ Imgur URL: $IMGUR_URL"
fi

# Output result
echo "$POSE_ID|$IMGUR_URL|$IMAGE_URL"

rm -f "$TMP_FILE"
