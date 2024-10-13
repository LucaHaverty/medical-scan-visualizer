varying vec2 vUv;

struct grid {
  vec3[] dimentions;
  float cellSize;
  float[] cells;
}

float opSmoothUnion( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float distanceToScene(vec3 pos) {
  vec3 spherePos = vec3(0, 0, 3);
  float sphereRadius = 1.0;
  float l1 = length(pos-spherePos) - sphereRadius;

  vec3 sphere2Pos = vec3(1, 1, 3);
  float sphere2Radius = 1.0;
  float l2 = length(pos-sphere2Pos) - sphere2Radius;

  return opSmoothUnion(l1, l2, 0.5);
}

float worldToCell(vec3 worldPos) {
  
}

vec3 cellToWorld(vec3 cellPos) {

}

void main() {
    vec2 scaledUv = vUv * 2.0 - 1.0;

  vec3 origin = vec3(0,0,0);
  vec3 direction = normalize(vec3(scaledUv, 1));
  vec3 col = vec3(0);

float t = 0.0;
  for (int i = 0; i < 80; i++) {
    vec3 p = origin + direction * t;
    float d = distanceToScene(p);
    t += d;

    if (t < 0.001) break;
    if (t > 100.0) break;
  }

  col = vec3(t);

  vec3 color = vec3(scaledUv, 0.5);
  gl_FragColor = vec4(col/8.0, 1.0);
}
