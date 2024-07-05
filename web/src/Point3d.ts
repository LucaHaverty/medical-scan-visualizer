import { Vector3, Vector4 } from "three"

class Point3d {
    arrayPos: Vector3
    worldPos: Vector3
    pointData: Vector4
    inGround: boolean

    constructor(
        arrayPos: Vector3,
        worldPos: Vector3,
        noiseValue: number,
        surfaceCutoff: number
    ) {
        this.arrayPos = arrayPos
        this.worldPos = worldPos
        this.pointData = new Vector4(
            worldPos.x,
            worldPos.y,
            worldPos.z,
            noiseValue
        )
        this.inGround = noiseValue < surfaceCutoff
    }
}

export default Point3d
