import { Vector3 } from "three"
import Point from "./Point"
import Settings from "./Settings"

class Grid {
    public gridSize: Vector3
    public points: Point[][][]

    private _worldPos: Vector3
    private _pointSpacing: number

    constructor(worldPos: Vector3, gridSize: Vector3, pointSpacing: number) {
        this._worldPos = worldPos
        this._pointSpacing = pointSpacing

        // TODO: Load sample rate from some sort of settings
        var sampleRate = Settings.PIXEL_SAMPLE_RATE

        gridSize = gridSize.multiplyScalar(sampleRate)
        this.gridSize = gridSize

        this.points = Array(gridSize.x)
            .fill(null)
            .map(() =>
                Array(gridSize.y)
                    .fill(null)
                    .map(() => Array(gridSize.z).fill(0))
            )
        console.log(this.points)

        for (let x = 0; x < gridSize.x; x++) {
            for (let y = 0; y < gridSize.y; y++) {
                for (let z = 0; z < gridSize.z; z++) {
                    const pointWorldPos = this.calculateWorldPosition(
                        x * sampleRate,
                        y * sampleRate,
                        z * sampleRate
                    )

                    // const pointValue: number =
                    //     1 -
                    //     DataParser.SCAN_DATA[x * sampleRate][z * sampleRate][
                    //         y * sampleRate
                    //     ]
                    const pointValue = Math.random()

                    this.points[x][y][z] = new Point(
                        new Vector3(x, y, z),
                        pointWorldPos,
                        pointValue,
                        Settings.SURFACE_CUTOFF
                    )
                }
            }
        }
    }

    public calculateWorldPosition(
        gridX: number,
        gridY: number,
        gridZ: number
    ): Vector3 {
        return new Vector3(
            gridX * this._pointSpacing,
            gridY * this._pointSpacing,
            gridZ * this._pointSpacing
        )
    }

    // Returns NULL if the closest point is outside of the grid
    public findClosePoint(worldPos: Vector3): Point | null {
        const x = Math.floor(
            (worldPos.x - this._worldPos.x) / this._pointSpacing
        )
        const y = Math.floor(
            (worldPos.y - this._worldPos.y) / this._pointSpacing
        )
        const z = Math.floor(
            (worldPos.z - this._worldPos.z) / this._pointSpacing
        )

        if (
            x < 0 ||
            x >= this.gridSize.x ||
            y < 0 ||
            y >= this.gridSize.y ||
            z < 0 ||
            z >= this.gridSize.z
        )
            return null

        return this.points[x][y][z]
    }
}

export default Grid
