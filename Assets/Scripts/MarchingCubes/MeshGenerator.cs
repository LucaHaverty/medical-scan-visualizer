using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class MeshGenerator
{
    struct Triangle
    {
#pragma warning disable 649 // disable unassigned variable warning
        public Vector3 a;
        public Vector3 b;
        public Vector3 c;
    }

    public static Mesh GenerateMesh(Grid grid)
    {
        List<Vector3> vertices = new List<Vector3>();
        List<int> triangles = new List<int>();


        for (int x = 0; x < grid.gridSize.x - 1; x++)
        {
            for (int y = 0; y < grid.gridSize.y - 1; y++)
            {
                for (int z = 0; z < grid.gridSize.z - 1; z++)
                {
                    if (x <= grid.gridSize.x - 1 || y <= grid.gridSize.y - 1 || z <= grid.gridSize.z - 1)
                    {
                        // 8 corners of the current cube
                        Vector4[] cubeCorners = {
                            grid.points[x, y, z].pointData,
                            grid.points[x + 1, y, z].pointData,
                            grid.points[x + 1, y, z + 1].pointData,
                            grid.points[x, y, z + 1].pointData,
                            grid.points[x, y + 1, z].pointData,
                            grid.points[x + 1, y + 1, z].pointData,
                            grid.points[x + 1, y + 1, z + 1].pointData,
                            grid.points[x, y + 1, z + 1].pointData
                        };

                        // Find index in lookup table
                        int triIndex = 0;
                        if (cubeCorners[0].w < Settings.SelectedLayer.SurfaceCutoff) triIndex |= 1;
                        if (cubeCorners[1].w < Settings.SelectedLayer.SurfaceCutoff) triIndex |= 2;
                        if (cubeCorners[2].w < Settings.SelectedLayer.SurfaceCutoff) triIndex |= 4;
                        if (cubeCorners[3].w < Settings.SelectedLayer.SurfaceCutoff) triIndex |= 8;
                        if (cubeCorners[4].w < Settings.SelectedLayer.SurfaceCutoff) triIndex |= 16;
                        if (cubeCorners[5].w < Settings.SelectedLayer.SurfaceCutoff) triIndex |= 32;
                        if (cubeCorners[6].w < Settings.SelectedLayer.SurfaceCutoff) triIndex |= 64;
                        if (cubeCorners[7].w < Settings.SelectedLayer.SurfaceCutoff) triIndex |= 128;

                        // Create vertices
                        for (int i = 0; LookupTables.triangulation[triIndex, i] != -1; i += 3)
                        {
                            {
                                int vertex = LookupTables.triangulation[triIndex, i];
                                if (vertex != -1)
                                {
                                    // a b and c represent the points of triangle and 1 and 0 are the edge points to interpolate between for smoothing
                                    int a0 = LookupTables.inBetweenPointsOne[LookupTables.triangulation[triIndex, i]];
                                    int a1 = LookupTables.inBetweenPointsTwo[LookupTables.triangulation[triIndex, i]];

                                    int b0 = LookupTables.inBetweenPointsOne[LookupTables.triangulation[triIndex, i + 1]];
                                    int b1 = LookupTables.inBetweenPointsTwo[LookupTables.triangulation[triIndex, i + 1]];

                                    int c0 = LookupTables.inBetweenPointsOne[LookupTables.triangulation[triIndex, i + 2]];
                                    int c1 = LookupTables.inBetweenPointsTwo[LookupTables.triangulation[triIndex, i + 2]];

                                    Triangle newTri;
                                    
                                    Vector3 InterpolateVerts(Vector4 v1, Vector4 v2)
                                    {
                                        float t = (Settings.SelectedLayer.SurfaceCutoff - v1.w) / (v2.w - v1.w);
                                        return new Vector3(v1.x, v1.y, v1.z) + t * (new Vector3(v2.x, v2.y, v2.z) - new Vector3(v1.x, v1.y, v1.z));
                                    }

                                    newTri.a = InterpolateVerts(cubeCorners[a0], cubeCorners[a1]);
                                    newTri.b = InterpolateVerts(cubeCorners[b0], cubeCorners[b1]);
                                    newTri.c = InterpolateVerts(cubeCorners[c0], cubeCorners[c1]);

                                    vertices.Add(newTri.a);
                                    triangles.Add(vertices.Count - 1);
                                    vertices.Add(newTri.b);
                                    triangles.Add(vertices.Count - 1);
                                    vertices.Add(newTri.c);
                                    triangles.Add(vertices.Count - 1);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        Mesh mesh = new Mesh {
            indexFormat = UnityEngine.Rendering.IndexFormat.UInt32,
            vertices = vertices.ToArray(),
            triangles = triangles.ToArray()
        };

        mesh.RecalculateNormals();
        return mesh;
    }
}