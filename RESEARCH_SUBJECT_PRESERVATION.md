# RESEARCH: How to Preserve Customer's Dog Identity

## THE PROBLEM:
Customer uploads THEIR dog photo → System should generate THEIR EXACT dog in iconic pose
Currently: Generating random/generic dogs instead

## POTENTIAL SOLUTIONS TO RESEARCH:

### Option 1: Fix FLUX Parameters
- Lower prompt_strength (0.3 instead of 0.8) = more weight on dog image
- Add detailed description of dog in prompt
- Use guidance_scale differently
- Try different aspect ratios

### Option 2: Different Replicate Model
Research these models:
- `fofr/face-to-many` - subject-driven generation
- `stability-ai/stable-diffusion-xl-base-1.0` with IP-Adapter
- InstantID models - identity preservation
- Face swap models - direct face replacement

### Option 3: Multi-Image Approach
- Send dog photo as PRIMARY reference
- Send iconic pose as SECONDARY reference  
- Let model blend them

### Option 4: ControlNet + Subject
- Use ControlNet for pose/composition
- Use IP-Adapter for subject identity
- Requires model that supports both

### Option 5: Img2Img with Lower Prompt Strength
- prompt_strength: 0.2-0.4 (more weight on image)
- Highly detailed prompt describing the dog
- Multiple passes if needed

## NEXT STEPS:
1. Test Option 1 (lower prompt_strength) - fastest to try
2. Research what models Replicate actually has for this
3. Find examples of successful subject-preserving generation
4. Implement the solution that actually works
