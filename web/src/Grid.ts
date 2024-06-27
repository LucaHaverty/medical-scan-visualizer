import { Vector, Vector3 } from "three";
import Point from "./Point";
import { unstable_renderSubtreeIntoContainer } from "react-dom";

class Grid {
    worldPos: Vector3;
    gridSize: Vector3;
    pointSpacing: number;
    points: Point[][][];

    constructor(worldPos: Vector3, gridSize: Vector3, pointSpacing: number) {
        this.worldPos = worldPos;
        this.pointSpacing = pointSpacing;

        // TODO: sample rate
        throw new Error("Not fully implemented");
      /*   var sampleRate = Settings.SelectedLayer.PixelSampleRate;
        
        gridSize /= sampleRate;
        this.gridSize = gridSize; */
        const sampleRate = 1;
       
        this.points = [[[]]];

        for (let x = 0; x < gridSize.x; x++)
        {
            for (let y = 0; y < gridSize.y; y++)
            {
                for (let z = 0; z < gridSize.z; z++) {
                    const pointWorldPos = this.calculateWorldPosition(x*sampleRate, y*sampleRate, z*sampleRate);
          
                    float pointValue = 1 - DataParser.Instance.allData[x*sampleRate, z*sampleRate, y*sampleRate];

                    Vector4 point = new Vector4(pointWorldPos.x, pointWorldPos.y, pointWorldPos.z, pointValue);
                    points[x, y, z] = new Point(new Vector3Int(x, y, z), pointWorldPos, pointValue, 
                        Settings.SelectedLayer.SurfaceCutoff, point);
                }
            }
        }
    }

    public calculateWorldPosition(gridX: number, gridY: number, gridZ: number): Vector3
    {
        return new Vector3((gridX * this.pointSpacing), (gridY * this.pointSpacing), (gridZ * this.pointSpacing));
    }

    // Returns NULL if the closest point is outside of the grid
    public findClosePoint(worldPos: Vector3): ?Point
    {
        const x = Math.floor((worldPos.x - this.worldPos.x) / this.pointSpacing);
        const y = Math.floor((worldPos.y - this.worldPos.y) / this.pointSpacing);
        const z = Math.floor((worldPos.z - this.worldPos.z) / this.pointSpacing);

        if (x < 0 || x >= this.gridSize.x || y < 0 || y >= this.gridSize.y || z < 0 || z >= this.gridSize.z)
            return null;

        return this.points[x][y][z];
    }
}

export default Grid;