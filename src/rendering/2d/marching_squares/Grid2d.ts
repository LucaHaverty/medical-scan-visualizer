import { Vector2 } from "three"
import DataParser from "../../../data_input/DataParser"
import Point2d from "./Point2d"

class Grid2d {
    public gridSize: Vector2
    public points: Point2d[][]

    private _worldPos: Vector2
    private _pointSpacing: number

    constructor(
        worldPos: Vector2,
        gridSize: Vector2,
        pointSpacing: number,
        layer: number
    ) {
        this._worldPos = worldPos
        this._pointSpacing = pointSpacing

        // TODO: Load sample rate from some sort of settings
        const sampleRate = 1

        gridSize = gridSize.divideScalar(sampleRate).floor()
        this.gridSize = gridSize
        this.gridSize = new Vector2(this.gridSize.x, this.gridSize.y)

        this.points = Array(gridSize.x)
            .fill(null)
            .map(() => Array(gridSize.y).fill(null))

        for (let x = 0; x < gridSize.x; x++) {
            for (let y = 0; y < gridSize.y; y++) {
                const pointWorldPos = this.calculateWorldPosition(
                    x * sampleRate,
                    y * sampleRate
                )

                // TODO: sample rate
                const pointValue: number =
                    1 -
                    DataParser.PARSED_DATA[layer][x * sampleRate][
                        y * sampleRate
                    ]

                //pointValue = Math.random()

                this.points[x][y] = new Point2d(
                    new Vector2(x, y),
                    pointWorldPos,
                    pointValue
                )
            }
        }
    }

    public calculateWorldPosition(gridX: number, gridY: number): Vector2 {
        return new Vector2(
            gridX * this._pointSpacing,
            gridY * this._pointSpacing
        )
    }

    // Returns NULL if the closest point is outside of the grid
    public findClosePoint(worldPos: Vector2): Point2d | null {
        const x = Math.floor(
            (worldPos.x - this._worldPos.x) / this._pointSpacing
        )
        const y = Math.floor(
            (worldPos.y - this._worldPos.y) / this._pointSpacing
        )

        if (x < 0 || x >= this.gridSize.x || y < 0 || y >= this.gridSize.y)
            return null

        return this.points[x][y]
    }
}

export default Grid2d
