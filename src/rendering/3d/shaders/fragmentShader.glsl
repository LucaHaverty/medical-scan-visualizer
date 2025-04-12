uniform vec2 threshold;
uniform vec3 gridDimensions;
precision mediump sampler3D;

uniform sampler3D gridTexture;
varying vec2 vUv;

// Precompute constants to avoid repeated calculations
const float MAX_STEPS = 400.0;
const float STEP_SIZE = 0.5;
const vec3 THRESHOLD_COLOR = vec3(1.0, 0.0, 0.0);

vec3 worldToCell(vec3 worldPos) { return floor(worldPos); }

bool isInBounds(vec3 pos, vec3 dimensions) {
  // Combine comparisons to reduce branching
  return all(greaterThanEqual(pos, vec3(0.0))) &&
         all(lessThan(pos, dimensions));
}

vec3 applyRotation(vec3 p, vec4 r) {
  float num1 = r.x * 2.0;
  float num2 = r.y * 2.0;
  float num3 = r.z * 2.0;
  float num4 = r.x * num1;
  float num5 = r.y * num2;
  float num6 = r.z * num3;
  float num7 = r.x * num2;
  float num8 = r.x * num3;
  float num9 = r.y * num3;
  float num10 = r.w * num1;
  float num11 = r.w * num2;
  float num12 = r.w * num3;
  vec3 result = vec3(0.0, 0.0, 0.0);
  result.x = ((1.0 - (num5 + num6)) * p.x + (num7 - num12) * p.y +
              (num8 + num11) * p.z);
  result.y = ((num7 + num12) * p.x + (1.0 - (num4 + num6)) * p.y +
              (num9 - num10) * p.z);
  result.z = ((num8 - num11) * p.x + (num9 + num10) * p.y +
              (1.0 - (num4 + num5)) * p.z);
  return result;
}

float castRay(vec3 origin, vec3 direction) { return 0.0; }

void main() {
  vec2 scaledUv = vUv * 2.0 - 1.0;
  vec3 origin = vec3(-gridDimensions.x * 2.0, gridDimensions.y * 0.5,
                     gridDimensions.z * 0.5);

  // vec3 offset = vec3(-gridDimensions.x * 4.0, -gridDimensions.y * 0.5,
  //  -gridDimensions.z * 0.5);

  vec2 viewAngle = vec2(60.0, 60.0);

  vec4 cameraOrientation = vec4(1.0, 0.0, 0.0, 0.0);

  vec3 rayAngle = normalize(vec3(1.0, scaledUv.x * sin(viewAngle.x * 0.0174533),
                                 scaledUv.y * sin(viewAngle.y * 0.0174533)));

  vec3 direction = applyRotation(rayAngle, cameraOrientation);

  // Precompute inverse grid dimensions for normalization
  vec3 invGridDimensions = 1.0 / gridDimensions;

  // Calculate maximum distance based on grid size
  float maxDist = gridDimensions.x * 50.0;

  vec3 color = vec3(0.0);
  int steps = 0;

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
    float density = texture(gridTexture, normalizedPos).r;

    // Accumulate color based on density threshold
    color += (density >= threshold[0] && density <= threshold[1])
                 ? vec3(density * 5.0, 0.0, 0.0)
                 : vec3(density * 0.7);

    steps++;
  }

  gl_FragColor = vec4(color / 50.0 * (STEP_SIZE), 1.0);
}
