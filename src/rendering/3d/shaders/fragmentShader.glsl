uniform float threshold;
uniform vec3 gridDimensions;
precision mediump sampler3D;

uniform sampler3D gridTexture;
varying vec2 vUv;

// Precompute constants to avoid repeated calculations
const float MAX_STEPS = 2000.0;
const float STEP_SIZE = 0.07;
const vec3 THRESHOLD_COLOR = vec3(1.0, 0.0, 0.0);

vec3 worldToCell(vec3 worldPos) { return floor(worldPos); }

bool isInBounds(vec3 pos, vec3 dimensions) {
  // Combine comparisons to reduce branching
  return all(greaterThanEqual(pos, vec3(0.0))) &&
         all(lessThan(pos, dimensions));
}

void main() {
  // Precompute constants used in the loop
  vec2 scaledUv = vUv * 2.0 - 1.0;
  vec3 origin = vec3(-gridDimensions.x * 1.5, gridDimensions.y * 0.5,
                     gridDimensions.z * 0.5);
  vec3 direction = normalize(vec3(1.0, scaledUv));

  // Precompute inverse grid dimensions for normalization
  vec3 invGridDimensions = 1.0 / gridDimensions;

  // Calculate maximum distance based on grid size
  float maxDist = gridDimensions.x * 3.0;

  vec3 color = vec3(0.0);
  float steps = 0.0;

  // Main raymarching loop
  for (float t = 0.0; t < maxDist; t += STEP_SIZE) {
    vec3 worldPos = origin + direction * t;
    vec3 cellPos = worldToCell(worldPos);

    // Skip if out of bounds
    if (!isInBounds(cellPos, gridDimensions)) {
      continue;
    }

    // Normalize position using precomputed inverse dimensions
    vec3 normalizedPos = cellPos * invGridDimensions;

    // Sample texture
    float density = texture(gridTexture, normalizedPos).r / 256.0;

    // Accumulate color based on density threshold
    color += density > threshold ? vec3(density * 5.0, 0.0, 0.0)
                                 : vec3(density * 0.7);

    steps += 1.0;
  }

  // Normalize color by actual number of steps taken
  gl_FragColor = vec4(color / steps, 1.0);
}