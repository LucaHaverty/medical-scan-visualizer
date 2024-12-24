import * as dicomParser from "dicom-parser"

class DataParser {
    public static PARSED_DATA: number[][][]

    public static async parseData(folder: FileList): Promise<number[][][]> {
        const data: number[][][] = new Array(folder.length)

        for (let layer = 0; layer < folder.length; layer++) {
            await DataParser.parseLayer(folder[layer]).then(layerData => {
                data[layer] = layerData
            })
        }

        return data
    }

    public static parseLayer(file: File): Promise<number[][]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (e: ProgressEvent<FileReader>) => {
                const arrayBuffer = e.target?.result as ArrayBuffer
                const byteArray = new Uint8Array(arrayBuffer)

                try {
                    const dataSet = dicomParser.parseDicom(byteArray)
                    const pixelDataElement = dataSet.elements.x7fe00010
                    const pixelData = new Uint16Array(
                        dataSet.byteArray.buffer,
                        pixelDataElement.dataOffset,
                        pixelDataElement.length / 2
                    )

                    const width = dataSet.uint16("x00280011")
                    const height = dataSet.uint16("x00280010")

                    if (!width) throw new Error("No width found in DICOM file.")
                    if (!height)
                        throw new Error("No height found in DICOM file.")

                    const data: number[][] = Array.from(
                        { length: height },
                        () => new Array(width)
                    )

                    for (let h = 0; h < height; h++) {
                        for (let w = 0; w < width; w++) {
                            const value = pixelData[h * width + w]
                            data[h][w] = value / 1.5
                        }
                    }

                    resolve(data)
                } catch (error) {
                    reject(new Error("Error parsing DICOM file: " + error))
                }
            }

            reader.onerror = error => {
                reject(new Error("File reading failed: " + error))
            }

            reader.readAsArrayBuffer(file)
        })
    }
}

export default DataParser
