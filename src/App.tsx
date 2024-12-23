import { useRef, useState } from "react"
import { Box, Stack, Typography } from "@mui/material"
import DataParser from "./data_input/DataParser"
import Grid2d from "./rendering/2d/marching_squares/Grid2d"
import { Vector2 } from "three"

import MeshGenerator from "./rendering/2d/marching_squares/MeshGenerator"
import Settings from "./Settings"
import FileSelection from "./data_input/FileSelection"
import RenderConfiguration from "./data_input/RenderConfiguration"
import { RenderSettings } from "./BrainTypes"
import Render3d from "./rendering/3d/Render3d"

// const canvas = document.getElementById("myCanvas") as HTMLCanvasElement
// if (!canvas) throw new Error("no canvas")

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [parsedData, setParsedData] = useState<number[][][] | undefined>(
        undefined
    )
    const [fuckThis, setFuckThis] = useState<boolean>()

    const renderImage = (settings: RenderSettings) => {
        if (parsedData == undefined) return

        if (canvasRef.current == undefined) throw new Error("No Canvas")

        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) throw new Error("no ctx")

        const data = parsedData[settings.imageLayer]
        const height = data.length
        const width = data[0].length

        canvasRef.current.width = width
        canvasRef.current.height = height
        const imageData = ctx!.createImageData(width, height)
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
                const index = h * width + w
                let value = data[w][h]

                value = Math.max(0, Math.min(255, value)) // Clamp to 0-255
                if (
                    value >= settings.threshold[0] * 255 &&
                    value <= settings.threshold[1] * 255
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

        Settings.SURFACE_CUTOFF = 1 - settings.threshold[0]
        const grid = new Grid2d(
            new Vector2(0, 0),
            new Vector2(512, 512),
            1,
            settings.imageLayer
        )
        const edgePoints = MeshGenerator.GenerateMesh2(grid)[1]

        ctx!.putImageData(imageData, 0, 0)
        ctx.beginPath()

        for (let i = 0; i < edgePoints.length; i += 2) {
            ctx.moveTo(edgePoints[i][0], edgePoints[i][1])
            ctx.lineTo(edgePoints[i + 1][0], edgePoints[i + 1][1])
        }

        ctx.strokeStyle = "#CC0099"
        ctx.lineWidth = 2
        ctx.stroke()

        setFuckThis(true)
    }

    const processData = (files: FileList) => {
        DataParser.parseData(files).then(data => {
            setParsedData(data)
            DataParser.PARSED_DATA = data
        })
    }

    return (
        <Box
            display="flex"
            flexDirection={"column"}
            maxWidth={"45vw"}
            alignItems={"flex-start"}
            alignSelf={"center"}
            margin={"0 auto"}
        >
            <canvas ref={canvasRef} />
            {parsedData ? (
                <>
                    {fuckThis ? <Render3d parsedData={parsedData} /> : <></>}
                    <Box width="70%">
                        <Typography>{`Loaded ${parsedData!.length} files`}</Typography>
                        <Stack
                            direction={"column"}
                            alignItems="stretch"
                            spacing=""
                        >
                            <RenderConfiguration
                                applySettings={settings => {
                                    renderImage(settings)
                                }}
                                layerCount={parsedData!.length}
                            />
                            <Box height="15px"></Box>
                        </Stack>
                    </Box>
                </>
            ) : (
                <FileSelection setFiles={processData} />
            )}
        </Box>
    )
}
export default App
