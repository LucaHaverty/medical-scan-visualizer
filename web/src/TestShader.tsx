import React, { useEffect } from "react"
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    PlaneGeometry,
    ShaderMaterial,
} from "three"

// Import shaders as strings
import vertexShader from "./shaders/vertexShader.glsl"
import fragmentShader from "./shaders/fragmentShader.glsl"

const TestShader = () => {
    useEffect(() => {
        // Basic setup
        const scene = new Scene()
        const camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        const renderer = new WebGLRenderer()
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)

        // Step 1: Create a ShaderMaterial with the imported vertex and fragment shaders
        const material = new ShaderMaterial({
            vertexShader, // Pass the imported vertex shader
            fragmentShader, // Pass the imported fragment shader
        })

        // Step 2: Create a plane geometry to apply the shader material
        const geometry = new PlaneGeometry(5, 5)
        const plane = new Mesh(geometry, material)
        scene.add(plane)

        camera.position.z = 5

        // Step 3: Animation loop
        const animate = () => {
            requestAnimationFrame(animate)
            plane.rotation.x += 0.01
            plane.rotation.y += 0.01
            renderer.render(scene, camera)
        }
        //animate()
        renderer.render(scene, camera)

        return () => {
            document.body.removeChild(renderer.domElement)
        }
    }, [])

    return <div />
}

export default TestShader
