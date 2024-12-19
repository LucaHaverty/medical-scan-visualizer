import { Vector2, Vector3 } from "three"

class Point {
    arrayPos: Vector2
    worldPos: Vector2
    pointData: Vector3
    inGround: boolean

    constructor(
        arrayPos: Vector2,
        worldPos: Vector2,
        noiseValue: number,
        surfaceCutoff: number
    ) {
        this.arrayPos = arrayPos
        this.worldPos = worldPos
        this.pointData = new Vector3(worldPos.x, worldPos.y, noiseValue)
        this.inGround = noiseValue < surfaceCutoff
    }
}

export default Point
