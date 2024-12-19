uniform float time;
uniform vec3 gridDimensions;
precision mediump sampler3D;

uniform sampler3D gridTexture;  // Use 3D texture instead of array

varying vec2 vUv;

// Specify precision for sampler3D

// Convert world coordinates to grid cell coordinates
vec3 worldToCell(vec3 worldPos) {
    return floor(worldPos);
}

void main() {
    // Scale UV to normalized device coordinates
    vec2 scaledUv = vUv * 2.0 - 1.0;

    // Ray origin and direction
    vec3 origin = vec3(-300.0, 256.0, 256.0);
    vec3 direction = normalize(vec3(1.0, scaledUv));

    // Raycast parameters
    float stepSize = 0.1;
    float densityThreshold = 0.1;
    float densitySum;

    vec3 color = vec3(1, 0, 0);

    // Raycast through the volume
    for(float t = 0.0; t < 1000.0; t += stepSize) {
        // Current world position 
        vec3 worldPos = origin + direction * t;

        // Transform to grid cell coordinates
        vec3 cellPos = worldToCell(worldPos);

        // TODO: use actual texture size to check if in bounds
        if(cellPos.x < 0.0 || cellPos.x > 136.0 || cellPos.y < 0.0 || cellPos.y > 511.0 || cellPos.z < 0.0 || cellPos.z > 511.0) {
            continue;
        }

        // Sample grid value at current position
        float density = texture(gridTexture, cellPos / vec3(137, 512, 512)).r / 256.0;
        densitySum += density;

        // color = vec3(density);
        // break;
        // Check if density exceeds threshold
        // if(density > 0.5) {
        //     // Shade based on density
        //     color = vec3(density);
        //     break;
        // }
        // if(t > 9.0) {
        //     //color = vec3(abs(cellPos.x) / 10.0, abs(cellPos.y) / 10.0, 0);
        //     color = vec3(density);
        //     break;
        // }
    }

    color = vec3(densitySum / 1000.0);

    gl_FragColor = vec4(color, 1.0);
}