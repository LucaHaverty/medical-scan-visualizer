import React, { useEffect, useRef } from "react"
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    PlaneGeometry,
    ShaderMaterial,
    Vector3,
    Data3DTexture,
    RedFormat,
    FloatType,
} from "three"

// Import shaders as strings
import vertexShader from "./shaders/vertexShader.glsl"
import fragmentShader from "./shaders/fragmentShader.glsl"

interface ShaderProps {
    parsedData: number[][][]
}

const Render3d: React.FC<ShaderProps> = ({ parsedData }) => {
    const rendererRef = useRef<WebGLRenderer | null>(null)

    // Function to generate a 3D grid of sample data
    const generateGridData = (
        width: number = 64,
        height: number = 64,
        depth: number = 64
    ): Float32Array => {
        const gridSize = width * height * depth
        const gridData = new Float32Array(gridSize)

        // Create more complex 3D noise
        for (let z = 0; z < depth; z++) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = x + y * width + z * width * height
                    // Combine noise and density
                    gridData[index] = parsedData[x][y][z]
                }
            }
        }

        return gridData
    }

    useEffect(() => {
        // Grid dimensions (can now be much larger)
        const gridWidth = 137
        const gridHeight = 512
        const gridDepth = 512

        // Generate grid data
        const gridData = generateGridData(gridWidth, gridHeight, gridDepth)

        // Create 3D texture
        const texture = new Data3DTexture(
            gridData,
            gridWidth,
            gridHeight,
            gridDepth
        )
        texture.format = RedFormat
        texture.type = FloatType
        texture.needsUpdate = true

        // Basic setup
        const scene = new Scene()
        const camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        const renderer = new WebGLRenderer()
        rendererRef.current = renderer

        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)

        // Create a ShaderMaterial with the imported vertex and fragment shaders
        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                time: { value: 0.0 },
                gridDimensions: {
                    value: new Vector3(gridWidth, gridHeight, gridDepth),
                },
                gridTexture: { value: texture },
            },
        })

        // Create a plane geometry to apply the shader material
        const geometry = new PlaneGeometry(5, 5)
        const plane = new Mesh(geometry, material)
        scene.add(plane)

        camera.position.z = 5

        renderer.render(scene, camera)

        // Cleanup
        return () => {
            document.body.removeChild(renderer.domElement)
            renderer.dispose()
            texture.dispose()
        }
    }, [parsedData])

    return null
}

export default Render3d
