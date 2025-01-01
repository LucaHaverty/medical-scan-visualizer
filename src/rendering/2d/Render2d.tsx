import { useEffect, useRef } from "react"
import { Vector2 } from "three"
import Grid2d from "./marching_squares/Grid2d"
import MeshGenerator from "./marching_squares/MeshGenerator"
import { RenderSettings } from "../../DataTypes"

interface Render2dProps {
    parsedData: number[][][]
    renderSettings: RenderSettings
}

const Render2d: React.FC<Render2dProps> = ({ parsedData, renderSettings }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        if (parsedData == undefined) return

        if (canvasRef.current == undefined) throw new Error("No Canvas")

        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) throw new Error("no ctx")

        const data = parsedData[renderSettings.imageLayer]
        const height = data.length
        const width = data[0].length

        canvasRef.current.width = width
        canvasRef.current.height = height
        const imageData = ctx!.createImageData(width, height)
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
                const index = h * width + w
                let value = data[w][h] * 255

                if (
                    value >= renderSettings.threshold[0] * 255 &&
                    value <= renderSettings.threshold[1] * 255
                ) {
                    imageData.data[index * 4] = 0
                    imageData.data[index * 4 + 1] = value
                    imageData.data[index * 4 + 2] = 255
                    imageData.data[index * 4 + 3] = 255
                } else {
                    imageData.data[index * 4] = value
                    imageData.data[index * 4 + 1] = value
                    imageData.data[index * 4 + 2] = value
                    imageData.data[index * 4 + 3] = 255
                }
            }
        }

        const grid = new Grid2d(
            new Vector2(0, 0),
            new Vector2(512, 512),
            1,
            renderSettings.imageLayer
        )
        const edgePoints = MeshGenerator.GenerateMesh2(grid, renderSettings)[1]

        ctx!.putImageData(imageData, 0, 0)
        ctx.beginPath()

        for (let i = 0; i < edgePoints.length; i += 2) {
            ctx.moveTo(edgePoints[i][0], edgePoints[i][1])
            ctx.lineTo(edgePoints[i + 1][0], edgePoints[i + 1][1])
        }

        ctx.strokeStyle = "#CC0099"
        ctx.lineWidth = 2
        ctx.stroke()
    }, [renderSettings])
    return (
        <>
            <canvas ref={canvasRef} />
        </>
    )
}

export default Render2d
