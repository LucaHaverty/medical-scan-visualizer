import * as THREE from "three"
import { Vector3, Vector4 } from "three"

import Grid3d from "./Grid3d"
import Settings from "./Settings"
import LookupTables from "./LookupTables"

type Triangle = {
    a?: THREE.Vector3
    b?: Vector3
    c?: Vector3
}

class MeshGenerator {
    public static GenerateMesh(grid: Grid3d) {
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
                            LookupTables.triangulation[triIndex][i] != -1;
                            i += 3
                        ) {
                            {
                                const vertex: number =
                                    LookupTables.triangulation[triIndex][i]
                                if (vertex != -1) {
                                    // a b and c represent the points of triangle and 1 and 0 are the edge points to interpolate between for smoothing
                                    const a0: number =
                                        LookupTables.inBetweenPointsOne[
                                            LookupTables.triangulation[
                                                triIndex
                                            ][i]
                                        ]
                                    const a1: number =
                                        LookupTables.inBetweenPointsTwo[
                                            LookupTables.triangulation[
                                                triIndex
                                            ][i]
                                        ]

                                    const b0: number =
                                        LookupTables.inBetweenPointsOne[
                                            LookupTables.triangulation[
                                                triIndex
                                            ][i + 1]
                                        ]
                                    const b1: number =
                                        LookupTables.inBetweenPointsTwo[
                                            LookupTables.triangulation[
                                                triIndex
                                            ][i + 1]
                                        ]

                                    const c1: number =
                                        LookupTables.inBetweenPointsTwo[
                                            LookupTables.triangulation[
                                                triIndex
                                            ][i + 2]
                                        ]
                                    const c0: number =
                                        LookupTables.inBetweenPointsOne[
                                            LookupTables.triangulation[
                                                triIndex
                                            ][i + 2]
                                        ]

                                    const newTri: Triangle = {}

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

        // Mesh mesh = new Mesh {
        //     indexFormat = UnityEngine.Rendering.IndexFormat.UInt32,
        //     vertices = vertices.ToArray(),
        //     triangles = triangles.ToArray()
        // };

        // mesh.RecalculateNormals();
        // return mesh;
        return mesh
    }

    public static interpolateVerts(v1: Vector4, v2: Vector4): Vector3 {
        const t: number = (Settings.SURFACE_CUTOFF - v1.w) / (v2.w - v1.w)
        return new Vector3(v1.x, v1.y, v1.z).add(
            new Vector3(v2.x, v2.y, v2.z)
                .sub(new Vector3(v1.x, v1.y, v1.z))
                .multiplyScalar(t)
        )
    }
}

export default MeshGenerator
