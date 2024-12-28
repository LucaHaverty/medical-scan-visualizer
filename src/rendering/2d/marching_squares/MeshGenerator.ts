import * as THREE from "three"
import { Vector2, Vector3, Vector4 } from "three"

import LookupTables from "./LookupTables"
import Grid2d from "./Grid2d"
import { lerp } from "three/src/math/MathUtils.js"
import { RenderSettings } from "../../../BrainTypes"

type Triangle2 = {
    a?: Vector2
    b?: Vector2
    c?: Vector2
}

class MeshGenerator {
    public static GenerateMesh2(
        grid: Grid2d,
        renderSettings: RenderSettings
    ): [THREE.Mesh, [number, number][]] {
        const surfaceCutoff = 1 - renderSettings.threshold[0]

        const vertices: number[] = []
        const triangles: number[] = []

        const edgePoints: [number, number][] = []

        for (let y = 0; y < grid.gridSize.y - 1; y++) {
            for (let x = 0; x < grid.gridSize.x - 1; x++) {
                if (x <= grid.gridSize.x - 1 || y <= grid.gridSize.y - 1) {
                    // 4 corners of the current square
                    const cubeCorners = [
                        grid.points[x][y].value,
                        grid.points[x + 1][y].value,
                        grid.points[x + 1][y + 1].value,
                        grid.points[x][y + 1].value,
                    ]

                    // Find index in lookup table
                    let triIndex = 0
                    if (cubeCorners[0].z < surfaceCutoff) triIndex |= 1
                    if (cubeCorners[2].z < surfaceCutoff) triIndex |= 4
                    if (cubeCorners[3].z < surfaceCutoff) triIndex |= 8
                    if (cubeCorners[1].z < surfaceCutoff) triIndex |= 2

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
                                    cubeCorners[a1],
                                    surfaceCutoff
                                )
                                newTri.b = MeshGenerator.InterpolateVerts(
                                    cubeCorners[b0],
                                    cubeCorners[b1],
                                    surfaceCutoff
                                )
                                newTri.c = MeshGenerator.InterpolateVerts(
                                    cubeCorners[c0],
                                    cubeCorners[c1],
                                    surfaceCutoff
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

    public static interpolateVerts(
        v1: Vector4,
        v2: Vector4,
        surfaceCutoff: number
    ): Vector3 {
        const t: number = (surfaceCutoff - v1.w) / (v2.w - v1.w)
        return new Vector3(v1.x, v1.y, v1.z).add(
            new Vector3(v2.x, v2.y, v2.z)
                .sub(new Vector3(v1.x, v1.y, v1.z))
                .multiplyScalar(t)
        )
    }

    private static InterpolateVerts(
        v1: Vector3,
        v2: Vector3,
        surfaceCutoff: number
    ): Vector2 {
        if (v1 == v2) return new Vector2(v1.x, v1.y)

        let t = (surfaceCutoff - v1.z) / (v2.z - v1.z)

        const smoothAmount = 1
        t = lerp(0.5, t, smoothAmount)
        return new Vector2(v1.x, v1.y).add(
            new Vector2(v2.x, v2.y)
                .sub(new Vector2(v1.x, v1.y))
                .multiplyScalar(t)
        )
        //return new Vector2(v1.x, v1.y) + t * (new Vector2(v2.x, v2.y) - new Vector2(v1.x, v1.y));
    }
}

export default MeshGenerator
