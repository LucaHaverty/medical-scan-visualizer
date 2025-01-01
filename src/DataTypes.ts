export type RenderSettings = {
    threshold: number[]
    imageLayer: number
}

export type ParsedData = {
    data: number[][][]
    maxValue: number
    minValue: number
}

export const defaultRenderSettings: RenderSettings = {
    threshold: [0.4, 0.6],
    imageLayer: 0,
}
