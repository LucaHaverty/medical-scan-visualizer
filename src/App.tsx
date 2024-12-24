import { useState } from "react"
import { Box, Stack, Typography } from "@mui/material"
import DataParser from "./data_input/DataParser"

import FileSelection from "./data_input/FileSelection"
import RenderConfiguration from "./data_input/RenderConfiguration"
import { RenderSettings } from "./BrainTypes"
import Render2d from "./rendering/2d/Render2d"

// const canvas = document.getElementById("myCanvas") as HTMLCanvasElement
// if (!canvas) throw new Error("no canvas")

const App = () => {
    const [parsedData, setParsedData] = useState<number[][][] | undefined>(
        undefined
    )
    const [renderSettings, setRenderSettings] = useState<
        RenderSettings | undefined
    >(undefined)

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
            {renderSettings && parsedData && (
                <Render2d
                    parsedData={parsedData}
                    renderSettings={renderSettings}
                />
            )}
            {parsedData ? (
                // <>
                //     {fuckThis && (
                //         <Render3d
                //             parsedData={parsedData}
                //             threshold={renderSettings!.threshold[0]}
                //         />
                //     )}
                <Box width="70%">
                    <Typography>{`Loaded ${parsedData!.length} files`}</Typography>
                    <Stack direction={"column"} alignItems="stretch" spacing="">
                        <RenderConfiguration
                            applySettings={settings => {
                                setRenderSettings(settings)
                            }}
                            layerCount={parsedData!.length}
                        />
                        <Box height="15px"></Box>
                    </Stack>
                </Box>
            ) : (
                //</>
                <FileSelection setFiles={processData} />
            )}
        </Box>
    )
}
export default App
