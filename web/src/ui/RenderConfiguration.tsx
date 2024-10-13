import { defaultBrainSettings, RenderSettings } from "@/BrainTypes"
import { Slider } from "@mui/material"
import { FC, useEffect, useState } from "react"

interface RenderConfigurationProps {
    applySettings: (settings: RenderSettings) => void
    layerCount: number
}

const RenderConfiguration: FC<RenderConfigurationProps> = ({
    applySettings,
    layerCount,
}) => {
    const [imageLayer, setImageLayer] = useState<number>(
        defaultBrainSettings.imageLayer
    )
    const [threshold, setThreshold] = useState<number[]>(
        defaultBrainSettings.threshold
    )

    useEffect(() => {
        applySettings({ threshold: threshold, imageLayer: imageLayer })
    }, [imageLayer, threshold, applySettings])

    return (
        <>
            <Slider
                getAriaLabel={() => "Volume"}
                defaultValue={[0.4, 0.6]}
                max={1}
                step={0.01}
                onChange={(_, value) => setThreshold(value as number[])}
                valueLabelDisplay="auto"
            />
            <Slider
                aria-label="Volume"
                defaultValue={0}
                max={layerCount - 1}
                step={1}
                onChange={(_, value) => setImageLayer(value as number)}
                valueLabelDisplay="auto"
            />
        </>
    )
}

export default RenderConfiguration
