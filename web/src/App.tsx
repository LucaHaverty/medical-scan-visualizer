import { useState } from "react"
import Button from "@mui/material/Button"
import { Stack, Typography } from "@mui/material"
import DataParser from "./DataParser"
import SceneRenderer from "./SceneRenderer"
import Grid2d from "./visual_generation/Grid2d"
import { Vector2 } from "three"
import MeshGenerator from "./visual_generation/MeshGenerator"
import Settings from "./Settings"
import FileSelection from "./ui/FileSelection"
import RenderConfiguration from "./ui/RenderConfiguration"
import { RenderSettings } from "./BrainTypes"

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement
if (!canvas) throw new Error("no canvas")

const ctx = canvas.getContext("2d")
if (!ctx) throw new Error("no ctx")

const App = () => {
    const [parsedData, setParsedData] = useState<number[][][] | undefined>(
        undefined
    )

    const renderImage = (settings: RenderSettings) => {
        if (parsedData == undefined) return

        const data = parsedData[settings.imageLayer]
        const height = data.length
        const width = data[0].length

        canvas.width = width
        canvas.height = height
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

        ctx.strokeStyle = "#ff0000"
        ctx.lineWidth = 2
        ctx.stroke()
    }

    //if (parsedData != undefined) renderImage()

    const processData = (files: FileList) => {
        DataParser.parseData(files).then(data => {
            setParsedData(data)
            DataParser.PARSED_DATA = data
        })
    }

    return (
        <>
            <Stack direction={"column"} maxWidth={"20vw"} alignItems="stretch">
                <FileSelection setFiles={processData} />
                {parsedData ? (
                    <>
                        <Typography>{`Loaded ${parsedData.length} files`}</Typography>
                        <Stack
                            direction={"column"}
                            alignItems="stretch"
                            spacing=""
                        >
                            <Button
                                variant="contained"
                                onClick={() => {
                                    SceneRenderer.renderScan()
                                }}
                            >
                                Generate Model
                            </Button>
                            <RenderConfiguration
                                applySettings={settings => {
                                    renderImage(settings)
                                    console.log(settings.threshold)
                                }}
                                layerCount={parsedData.length}
                            />
                        </Stack>
                    </>
                ) : (
                    <></>
                )}
            </Stack>
        </>
    )
}

export default App
