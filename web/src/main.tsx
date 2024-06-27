import * as THREE from 'three';
import Grid from './grid';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// Define the vertices of the cube
const vertices = new Float32Array([
    -1.0, -1.0,  1.0,  // 0
     1.0, -1.0,  1.0,  // 1
     1.0,  1.0,  1.0,  // 2
    -1.0,  1.0,  1.0,  // 3
    -1.0, -1.0, -1.0,  // 4
     1.0, -1.0, -1.0,  // 5
     1.0,  1.0, -1.0,  // 6
    -1.0,  1.0, -1.0   // 7
]);

// Define the indices (triangles) of the cube
const indices = [
    0, 1, 2,  0, 2, 3,  // Front face
    1, 5, 6,  1, 6, 2,  // Right face
    5, 4, 7,  5, 7, 6,  // Back face
    4, 0, 3,  4, 3, 7,  // Left face
    3, 2, 6,  3, 6, 7,  // Top face
    4, 5, 1,  4, 1, 0   // Bottom face
];

// Create the geometry and set its vertices and indices
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(indices);

// Compute the normals for shading
geometry.computeVertexNormals();

// Create a basic material
const material = new THREE.MeshNormalMaterial();

// Create a mesh with the geometry and material, then add it to the scene
const customMesh = new THREE.Mesh(geometry, material);
scene.add(customMesh);

// Position the camera
camera.position.z = 5;

// Animation loop
function animate() {
    // Rotate the mesh
    customMesh.rotation.x += 0.01;
    customMesh.rotation.y += 0.01;

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}