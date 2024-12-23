export type RenderSettings = {
    threshold: number[]
    imageLayer: number
}

export const defaultBrainSettings: RenderSettings = {
    imageLayer: 0,
    threshold: [0.4, 0.6],
}
