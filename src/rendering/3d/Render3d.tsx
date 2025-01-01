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
    Vector2,
    OrthographicCamera,
    WebGLRenderTarget,
} from "three"

// Import shaders as strings
import vertexShader from "./shaders/vertexShader.glsl"
import fragmentShader from "./shaders/fragmentShader.glsl"
import { RenderSettings } from "../../DataTypes"

interface Render3dProps {
    parsedData: number[][][]
    renderSettings: RenderSettings
}

const Render3d: React.FC<Render3dProps> = ({ parsedData, renderSettings }) => {
    const rendererRef = useRef<WebGLRenderer | undefined>(undefined)
    const textureRef = useRef<Data3DTexture | undefined>(undefined)

    const sampleRate = 1.0

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
                    gridData[index] =
                        parsedData[x * sampleRate][y * sampleRate][
                            z * sampleRate
                        ]
                }
            }
        }

        return gridData
    }

    useEffect(() => {
        // Grid dimensions (can now be much larger)
        const gridWidth = parsedData.length / sampleRate
        const gridHeight = parsedData[0].length / sampleRate
        const gridDepth = parsedData[0][0].length / sampleRate

        if (textureRef.current == undefined) {
            // Generate grid data
            const gridData = generateGridData(gridWidth, gridHeight, gridDepth)

            // Create 3D texture
            textureRef.current = new Data3DTexture(
                gridData,
                gridWidth,
                gridHeight,
                gridDepth
            )
            textureRef.current.format = RedFormat
            textureRef.current.type = FloatType
            textureRef.current.needsUpdate = true
        }

        console.log("update 1")
    }, [parsedData])

    useEffect(() => {
        const gridWidth = parsedData.length / sampleRate
        const gridHeight = parsedData[0].length / sampleRate;
        const gridDepth = parsedData[0][0].length / sampleRate

        const scene = new Scene()
        const camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )

        // Add render target at lower resolution
        const resolutionScale = 1 // Try different values: 0.5 = half res, 0.25 = quarter res
        const renderTarget = new WebGLRenderTarget(
            Math.floor(window.innerWidth * resolutionScale),
            Math.floor(window.innerHeight * resolutionScale)
        )

        const renderer = new WebGLRenderer()
        rendererRef.current = renderer
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)

        // Your existing main shader material
        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                threshold: {
                    value: new Vector2(
                        renderSettings.threshold[0],
                        renderSettings.threshold[1]
                    ),
                },
                gridDimensions: {
                    value: new Vector3(gridWidth, gridHeight, gridDepth),
                },
                gridTexture: { value: textureRef.current },
            },
        })

        // Create a simple upscale material
        const upscaleMaterial = new ShaderMaterial({
            vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
            fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D tDiffuse;
            void main() {
                gl_FragColor = texture2D(tDiffuse, vUv);
            }
        `,
            uniforms: {
                tDiffuse: { value: renderTarget.texture },
            },
        })

        // Main scene setup
        const geometry = new PlaneGeometry(5, 5)
        const plane = new Mesh(geometry, material)
        scene.add(plane)

        // Upscale scene setup
        const orthoScene = new Scene()
        const fullscreenQuad = new Mesh(
            new PlaneGeometry(2, 2),
            upscaleMaterial
        )
        orthoScene.add(fullscreenQuad)
        const orthoCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

        camera.position.z = 5

        // Render both passes
        renderer.setRenderTarget(renderTarget)
        renderer.render(scene, camera)
        renderer.setRenderTarget(null)
        renderer.render(orthoScene, orthoCamera)

        // Cleanup
        return () => {
            document.body.removeChild(renderer.domElement)
            renderer.dispose()
            renderTarget.dispose()
            geometry.dispose()
            material.dispose()
            upscaleMaterial.dispose()
            textureRef.current?.dispose()
        }
    }, [parsedData, renderSettings.threshold])

    return null
}

export default Render3d
