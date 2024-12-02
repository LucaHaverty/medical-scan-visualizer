uniform float time;
uniform vec3 gridDimensions;
precision mediump sampler3D;

uniform sampler3D gridTexture;  // Use 3D texture instead of array

varying vec2 vUv;

// Specify precision for sampler3D

// Convert world coordinates to grid cell coordinates
vec3 worldToCell(vec3 worldPos) {
    return floor(worldPos * 1000000.0);
}

// // Sample grid value with bounds checking
// float sampleGridValue(vec3 cellPos) {
//     // Ensure we're within grid bounds
//     if (cellPos.x < 0.0 || cellPos.x >= gridDimensions.x ||
//         cellPos.y < 0.0 || cellPos.y >= gridDimensions.y ||
//         cellPos.z < 0.0 || cellPos.z >= gridDimensions.z) {
//         return 0.0;
//     }

//     // Calculate linear index
//     int index = int(
//         cellPos.x + 
//         cellPos.y * gridDimensions.x + 
//         cellPos.z * gridDimensions.x * gridDimensions.y
//     );

//     // Ensure index is within array bounds
//     if (index < 0 || index >= 1000) {
//         return 0.0;
//     }

//     return gridData[index];
// }

void main() {
    // Scale UV to normalized device coordinates
    vec2 scaledUv = vUv * 2.0 - 1.0;
    
    // Ray origin and direction
    vec3 origin = vec3(0.0,1.0, 0.0);
    vec3 direction = normalize(vec3(scaledUv, 1.0));
    
    // Raycast parameters
    float stepSize = 0.01;
    float densityThreshold = 0.5;
    vec3 color = vec3(0.0);
    
    // Raycast through the volume
    for (float t = 0.0; t < 10.0; t += stepSize) {
        // Current world position
        vec3 worldPos = origin + direction * t;
        
        // Transform to grid cell coordinates
        vec3 cellPos = worldToCell(worldPos);
        
        // Sample grid value at current position
        float density = texture(gridTexture, cellPos).r;
        
        // Check if density exceeds threshold
        if (density > densityThreshold) {
            // Shade based on density
            color = vec3(density);
            break;
        }
    }
    
    // Output the color
    vec3 testPos = vec3(vUv.x,vUv.y,0);
    float test = texture(gridTexture, testPos).r;

    gl_FragColor = vec4(test,0.0,0.0, 1.0);
}