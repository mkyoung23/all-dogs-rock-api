#!/bin/bash
# Generate all 20 template images using curl and Replicate API

TOKEN="$REPLICATE_API_TOKEN"
FLUX_PRO="1119216b4bc8a63426da2c56c68dfc24bf0a6b20951d698ef73ea65aa17ad4c2"
OUTPUT_FILE="generated-urls.json"

echo "[" > $OUTPUT_FILE

poses=(
  "basketball-dunk:Professional photo of a golden retriever dog in mid-air slam dunking a basketball, wearing basketball jersey, NBA arena with crowd, dramatic lighting, photorealistic, 8k, highly detailed"
  "baseball-swing:Professional photo of a german shepherd dog swinging a baseball bat hitting a home run, wearing baseball uniform, stadium with bright lights, action shot, photorealistic, 8k, highly detailed"
  "superhero-flying:Professional photo of a husky dog in superhero costume flying through the sky with red cape flowing dramatically, cityscape background, cinematic lighting, photorealistic, 8k, highly detailed"
  "astronaut-space:Professional photo of a beagle dog astronaut in white NASA spacesuit floating in space, Earth visible in background, stars and galaxies, epic space scene, photorealistic, 8k, highly detailed"
)

count=0
total=${#poses[@]}

for pose_data in "${poses[@]}"; do
  IFS=':' read -r pose_id prompt <<< "$pose_data"
  count=$((count + 1))

  echo ""
  echo "========================================="
  echo "Generating $count/$total: $pose_id"
  echo "========================================="

  # Create prediction
  response=$(curl -s -X POST \
    -H "Authorization: Token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"version\":\"$FLUX_PRO\",\"input\":{\"prompt\":\"$prompt\",\"aspect_ratio\":\"1:1\",\"output_format\":\"jpg\",\"output_quality\":90,\"num_outputs\":1}}" \
    https://api.replicate.com/v1/predictions)

  prediction_id=$(echo $response | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$prediction_id" ]; then
    echo "❌ Failed to create prediction"
    continue
  fi

  echo "⏳ Prediction ID: $prediction_id"
  echo "⏳ Waiting for completion..."

  # Poll for completion
  for i in {1..60}; do
    sleep 3
    status_response=$(curl -s -H "Authorization: Token $TOKEN" \
      https://api.replicate.com/v1/predictions/$prediction_id)

    status=$(echo $status_response | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

    echo -n "."

    if [ "$status" = "succeeded" ]; then
      image_url=$(echo $status_response | grep -o '"output":\["[^"]*"' | cut -d'"' -f4)
      echo ""
      echo "✅ SUCCESS: $image_url"

      # Add to JSON
      if [ $count -gt 1 ]; then
        echo "," >> $OUTPUT_FILE
      fi
      echo "  {\"id\":\"$pose_id\",\"url\":\"$image_url\"}" >> $OUTPUT_FILE
      break
    elif [ "$status" = "failed" ]; then
      echo ""
      echo "❌ Generation failed"
      break
    fi
  done

  sleep 2
done

echo "" >> $OUTPUT_FILE
echo "]" >> $OUTPUT_FILE

echo ""
echo "========================================="
echo "✅ DONE! Check $OUTPUT_FILE"
echo "========================================="
