import * as THREE from "three"
import { Vector2, Vector3, Vector4 } from "three"

import Grid3d from "./Grid3d"
import Settings from "../Settings"
import LookupTables from "./LookupTables"
import Grid2d from "./Grid2d"
import { lerp } from "three/src/math/MathUtils.js"

type Triangle3 = {
    a?: Vector3
    b?: Vector3
    c?: Vector3
}

type Triangle2 = {
    a?: Vector2
    b?: Vector2
    c?: Vector2
}

class MeshGenerator {
    public static GenerateMesh3(grid: Grid3d): THREE.Mesh {
        const vertices: number[] = []
        const triangles: number[] = []

        for (let x = 0; x < grid.gridSize.x - 1; x++) {
            for (let y = 0; y < grid.gridSize.y - 1; y++) {
                for (let z = 0; z < grid.gridSize.z - 1; z++) {
                    if (
                        x <= grid.gridSize.x - 1 ||
                        y <= grid.gridSize.y - 1 ||
                        z <= grid.gridSize.z - 1
                    ) {
                        // 8 corners of the current cube
                        const cubeCorners: Vector4[] = [
                            grid.points[x][y][z].pointData,
                            grid.points[x + 1][y][z].pointData,
                            grid.points[x + 1][y][z + 1].pointData,
                            grid.points[x][y][z + 1].pointData,
                            grid.points[x][y + 1][z].pointData,
                            grid.points[x + 1][y + 1][z].pointData,
                            grid.points[x + 1][y + 1][z + 1].pointData,
                            grid.points[x][y + 1][z + 1].pointData,
                        ]

                        // Find index in lookup table
                        let triIndex = 0
                        if (cubeCorners[0].w < Settings.SURFACE_CUTOFF)
                            triIndex |= 1
                        if (cubeCorners[1].w < Settings.SURFACE_CUTOFF)
                            triIndex |= 2
                        if (cubeCorners[2].w < Settings.SURFACE_CUTOFF)
                            triIndex |= 4
                        if (cubeCorners[3].w < Settings.SURFACE_CUTOFF)
                            triIndex |= 8
                        if (cubeCorners[4].w < Settings.SURFACE_CUTOFF)
                            triIndex |= 16
                        if (cubeCorners[5].w < Settings.SURFACE_CUTOFF)
                            triIndex |= 32
                        if (cubeCorners[6].w < Settings.SURFACE_CUTOFF)
                            triIndex |= 64
                        if (cubeCorners[7].w < Settings.SURFACE_CUTOFF)
                            triIndex |= 128

                        // Create vertices
                        for (
                            let i = 0;
                            LookupTables.Cube.triangulation[triIndex][i] != -1;
                            i += 3
                        ) {
                            {
                                const vertex: number =
                                    LookupTables.Cube.triangulation[triIndex][i]
                                if (vertex != -1) {
                                    // a b and c represent the points of triangle and 1 and 0 are the edge points to interpolate between for smoothing
                                    const a0: number =
                                        LookupTables.Cube.inBetweenPointsOne[
                                            LookupTables.Cube.triangulation[
                                                triIndex
                                            ][i]
                                        ]
                                    const a1: number =
                                        LookupTables.Cube.inBetweenPointsTwo[
                                            LookupTables.Cube.triangulation[
                                                triIndex
                                            ][i]
                                        ]

                                    const b0: number =
                                        LookupTables.Cube.inBetweenPointsOne[
                                            LookupTables.Cube.triangulation[
                                                triIndex
                                            ][i + 1]
                                        ]
                                    const b1: number =
                                        LookupTables.Cube.inBetweenPointsTwo[
                                            LookupTables.Cube.triangulation[
                                                triIndex
                                            ][i + 1]
                                        ]

                                    const c1: number =
                                        LookupTables.Cube.inBetweenPointsTwo[
                                            LookupTables.Cube.triangulation[
                                                triIndex
                                            ][i + 2]
                                        ]
                                    const c0: number =
                                        LookupTables.Cube.inBetweenPointsOne[
                                            LookupTables.Cube.triangulation[
                                                triIndex
                                            ][i + 2]
                                        ]

                                    const newTri: Triangle3 = {}

                                    newTri.a = this.interpolateVerts(
                                        cubeCorners[a0],
                                        cubeCorners[a1]
                                    )
                                    newTri.b = this.interpolateVerts(
                                        cubeCorners[b0],
                                        cubeCorners[b1]
                                    )
                                    newTri.c = this.interpolateVerts(
                                        cubeCorners[c0],
                                        cubeCorners[c1]
                                    )

                                    vertices.push(newTri.a.x)
                                    vertices.push(newTri.a.y)
                                    vertices.push(newTri.a.z)
                                    triangles.push(vertices.length - 1)
                                    vertices.push(newTri.b.x)
                                    vertices.push(newTri.b.y)
                                    vertices.push(newTri.b.z)
                                    triangles.push(vertices.length - 1)
                                    vertices.push(newTri.c.x)
                                    vertices.push(newTri.c.y)
                                    vertices.push(newTri.c.z)
                                    triangles.push(vertices.length - 1)
                                }
                            }
                        }
                    }
                }
            }
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        )
        geometry.setIndex(triangles)

        // Compute the normals for shading
        geometry.computeVertexNormals()

        // Create a basic material
        const material = new THREE.MeshNormalMaterial()

        // Create a mesh with the geometry and material, then add it to the scene
        const mesh = new THREE.Mesh(geometry, material)

        return mesh
    }

    public static GenerateMesh2(
        grid: Grid2d
    ): [THREE.Mesh, [number, number][]] {
        const vertices: number[] = []
        const triangles: number[] = []

        const edgePoints: [number, number][] = []

        for (let y = 0; y < grid.gridSize.y - 1; y++) {
            for (let x = 0; x < grid.gridSize.x - 1; x++) {
                if (x <= grid.gridSize.x - 1 || y <= grid.gridSize.y - 1) {
                    // 4 corners of the current square
                    const cubeCorners = [
                        grid.points[x][y].pointData,
                        grid.points[x + 1][y].pointData,
                        grid.points[x + 1][y + 1].pointData,
                        grid.points[x][y + 1].pointData,
                    ]

                    // Find index in lookup table
                    let triIndex = 0
                    if (cubeCorners[0].z < Settings.SURFACE_CUTOFF)
                        triIndex |= 1
                    if (cubeCorners[2].z < Settings.SURFACE_CUTOFF)
                        triIndex |= 4
                    if (cubeCorners[3].z < Settings.SURFACE_CUTOFF)
                        triIndex |= 8
                    if (cubeCorners[1].z < Settings.SURFACE_CUTOFF)
                        triIndex |= 2

                    // Create verticies
                    let doneWithBorder = false
                    for (
                        let i = 0;
                        LookupTables.Square.TRIANGULATION_TABLE_EDGES[triIndex][
                            i
                        ] != -1;
                        i += 3
                    ) {
                        {
                            if (
                                LookupTables.Square.TRIANGULATION_TABLE_EDGES[
                                    triIndex
                                ][i] == -2
                            ) {
                                i++
                                doneWithBorder = true
                            }

                            const vertex =
                                LookupTables.Square.TRIANGULATION_TABLE_EDGES[
                                    triIndex
                                ][i]
                            if (vertex != -1) {
                                // a b and c represent the points of triangle and 1 and 0 are the edge points to interpolate between for smoothing
                                const a0 =
                                    LookupTables.Square.IN_BETWEEN_POINTS_A[
                                        LookupTables.Square
                                            .TRIANGULATION_TABLE_EDGES[
                                            triIndex
                                        ][i]
                                    ]
                                const a1 =
                                    LookupTables.Square.IN_BETWEEN_POINTS_B[
                                        LookupTables.Square
                                            .TRIANGULATION_TABLE_EDGES[
                                            triIndex
                                        ][i]
                                    ]

                                const b0 =
                                    LookupTables.Square.IN_BETWEEN_POINTS_A[
                                        LookupTables.Square
                                            .TRIANGULATION_TABLE_EDGES[
                                            triIndex
                                        ][i + 1]
                                    ]
                                const b1 =
                                    LookupTables.Square.IN_BETWEEN_POINTS_B[
                                        LookupTables.Square
                                            .TRIANGULATION_TABLE_EDGES[
                                            triIndex
                                        ][i + 1]
                                    ]

                                const c0 =
                                    LookupTables.Square.IN_BETWEEN_POINTS_A[
                                        LookupTables.Square
                                            .TRIANGULATION_TABLE_EDGES[
                                            triIndex
                                        ][i + 2]
                                    ]
                                const c1 =
                                    LookupTables.Square.IN_BETWEEN_POINTS_B[
                                        LookupTables.Square
                                            .TRIANGULATION_TABLE_EDGES[
                                            triIndex
                                        ][i + 2]
                                    ]

                                const newTri: Triangle2 = {}

                                newTri.a = MeshGenerator.InterpolateVerts(
                                    cubeCorners[a0],
                                    cubeCorners[a1]
                                )
                                newTri.b = MeshGenerator.InterpolateVerts(
                                    cubeCorners[b0],
                                    cubeCorners[b1]
                                )
                                newTri.c = MeshGenerator.InterpolateVerts(
                                    cubeCorners[c0],
                                    cubeCorners[c1]
                                )

                                //Debug.DrawLine((Vector2) newTri.a, (Vector2) newTri.b, Color.red, 1000);
                                //Debug.DrawLine((Vector2) newTri.b, (Vector2) newTri.c, Color.red, 1000);
                                //Debug.DrawLine((Vector2) newTri.c, (Vector2) newTri.a, Color.red, 1000);

                                vertices.push(newTri.a.x)
                                vertices.push(newTri.a.y)
                                vertices.push(0)
                                triangles.push(vertices.length - 1)
                                vertices.push(newTri.b.x)
                                vertices.push(newTri.b.y)
                                vertices.push(0)
                                triangles.push(vertices.length - 1)
                                vertices.push(newTri.c.x)
                                vertices.push(newTri.c.y)
                                vertices.push(0)
                                triangles.push(vertices.length - 1)
                                if (doneWithBorder) continue

                                edgePoints.push([newTri.a.x, newTri.a.y])
                                edgePoints.push([newTri.b.x, newTri.b.y])
                            }
                        }
                    }
                }
            }
        }

        // Mesh mesh = new Mesh();
        // mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;

        // mesh.vertices = vertices.ToArray();
        // mesh.triangles = triangles.ToArray();
        // mesh.RecalculateNormals();

        // return (mesh, edgePoints);

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        )
        geometry.setIndex(triangles)

        // Compute the normals for shading
        geometry.computeVertexNormals()

        // Create a basic material
        const material = new THREE.MeshNormalMaterial()

        // Create a mesh with the geometry and material, then add it to the scene
        const mesh = new THREE.Mesh(geometry, material)

        return [mesh, edgePoints]
    }

    public static interpolateVerts(v1: Vector4, v2: Vector4): Vector3 {
        const t: number = (Settings.SURFACE_CUTOFF - v1.w) / (v2.w - v1.w)
        return new Vector3(v1.x, v1.y, v1.z).add(
            new Vector3(v2.x, v2.y, v2.z)
                .sub(new Vector3(v1.x, v1.y, v1.z))
                .multiplyScalar(t)
        )
    }

    private static InterpolateVerts(v1: Vector3, v2: Vector3): Vector2 {
        if (v1 == v2) return new Vector2(v1.x, v1.y)

        let t = (Settings.SURFACE_CUTOFF - v1.z) / (v2.z - v1.z)

        t = lerp(0.5, t, Settings.SMOOTH_AMOUNT)
        return new Vector2(v1.x, v1.y).add(
            new Vector2(v2.x, v2.y)
                .sub(new Vector2(v1.x, v1.y))
                .multiplyScalar(t)
        )
        //return new Vector2(v1.x, v1.y) + t * (new Vector2(v2.x, v2.y) - new Vector2(v1.x, v1.y));
    }
}

export default MeshGenerator
