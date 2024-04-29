using UnityEngine;

public class Grid
{
    Vector3 worldPos;

    public Vector3Int gridSize;
    private float pointSpacing;
    
    public Point[,,] points;

    public Grid(Vector3 worldPos, Vector3Int gridSize, float pointSpacing)
    {
        this.worldPos = worldPos;
        this.pointSpacing = pointSpacing;

        var sampleRate = Settings.SelectedLayer.PixelSampleRate;
        
        gridSize /= sampleRate;
        this.gridSize = gridSize;
       
        points = new Point[gridSize.x, gridSize.y, gridSize.z];
        for (int x = 0; x < gridSize.x; x++)
        {
            for (int y = 0; y < gridSize.y; y++)
            {
                for (int z = 0; z < gridSize.z; z++) {
                    Vector3 pointWorldPos = GetWorldPos(x*sampleRate, y*sampleRate, z*sampleRate);
          
                    float pointValue = 1 - DataParser.Instance.allData[x*sampleRate, z*sampleRate, y*sampleRate];

                    Vector4 point = new Vector4(pointWorldPos.x, pointWorldPos.y, pointWorldPos.z, pointValue);
                    points[x, y, z] = new Point(new Vector3Int(x, y, z), pointWorldPos, pointValue, 
                        Settings.SelectedLayer.SurfaceCutoff, point);
                }
            }
        }
    }

    public Vector3 GetWorldPos(int x, int y, int z)
    {
        return new Vector3((x * pointSpacing), (y * pointSpacing), (z * pointSpacing));
    }

    // Returns NULL if the closest point is outside of the grid
    public Point FindClosePoint(Vector3 worldPos)
    {
        int x = Mathf.FloorToInt((worldPos.x - this.worldPos.x) / pointSpacing);
        int y = Mathf.FloorToInt((worldPos.y - this.worldPos.y) / pointSpacing);
        int z = Mathf.FloorToInt((worldPos.z - this.worldPos.z) / pointSpacing);

        if (x < 0 || x >= gridSize.x) return null;
        if (y < 0 || y >= gridSize.y) return null;
        if (z < 0 || z >= gridSize.z) return null;

        return points[x, y, z];
    }
}
