import { Vector2, Vector3 } from "three"

class Point2d {
    arrayPos: Vector2
    worldPos: Vector2
    value: Vector3

    constructor(arrayPos: Vector2, worldPos: Vector2, value: number) {
        this.arrayPos = arrayPos
        this.worldPos = worldPos
        this.value = new Vector3(worldPos.x, worldPos.y, value)
    }
}

export default Point2d
