import * as THREE from "three"
import Grid3d from "./visual_generation/Grid3d"
import { Vector3 } from "three"
import MeshGenerator from "./visual_generation/MeshGenerator"

class SceneRenderer {
    static _scene: THREE.Scene
    static _camera: THREE.PerspectiveCamera
    static _renderer: THREE.WebGLRenderer

    public static setup() {
        this._camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        this._camera.position.z = 5
        this._camera.position.x = -100
        this._camera.setRotationFromEuler(new THREE.Euler(90, -0.6, 0))

        this._scene = new THREE.Scene()

        this._renderer = new THREE.WebGLRenderer()
        this._renderer.setSize(window.innerWidth, window.innerHeight)
        //this.renderer.setAnimationLoop(animate)
        document.body.appendChild(this._renderer.domElement)
    }

    public static createTestCube() {
        // Define the vertices of the cube
        const vertices = new Float32Array([
            -1.0,
            -1.0,
            1.0, // 0
            1.0,
            -1.0,
            1.0, // 1
            1.0,
            1.0,
            1.0, // 2
            -1.0,
            1.0,
            1.0, // 3
            -1.0,
            -1.0,
            -1.0, // 4
            1.0,
            -1.0,
            -1.0, // 5
            1.0,
            1.0,
            -1.0, // 6
            -1.0,
            1.0,
            -1.0, // 7
        ])

        // Define the indices (triangles) of the cube
        const indices = [
            0,
            1,
            2,
            0,
            2,
            3, // Front face
            1,
            5,
            6,
            1,
            6,
            2, // Right face
            5,
            4,
            7,
            5,
            7,
            6, // Back face
            4,
            0,
            3,
            4,
            3,
            7, // Left face
            3,
            2,
            6,
            3,
            6,
            7, // Top face
            4,
            5,
            1,
            4,
            1,
            0, // Bottom face
        ]

        // Create the geometry and set its vertices and indices
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(vertices, 3)
        )
        geometry.setIndex(indices)

        // Compute the normals for shading
        geometry.computeVertexNormals()

        // Create a basic material
        const material = new THREE.MeshNormalMaterial()

        // Create a mesh with the geometry and material, then add it to the scene
        const customMesh = new THREE.Mesh(geometry, material)

        SceneRenderer._scene.add(customMesh)

        this._renderer.render(this._scene, this._camera)
    }

    public static renderScan = () => {
        console.log("test")
        const grid = new Grid3d(
            new Vector3(0, 0, 0),
            new Vector3(512, 512, 512),
            100
        )
        const mesh = MeshGenerator.GenerateMesh3(grid)

        SceneRenderer._scene.add(mesh)
        this._renderer.render(this._scene, this._camera)
    }

    // Position the camera

    // Animation loop
    // function animate() {
    //     // Rotate the mesh
    //     // customMesh.rotation.x += 0.01;
    //     // customMesh.rotation.y += 0.01;

    //     // Render the scene from the perspective of the camera
    //     renderer.render(scene, camera)
    // }
}
export default SceneRenderer
