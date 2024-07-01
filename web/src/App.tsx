import { ChangeEvent, useRef, useState } from "react"
import Button from "@mui/material/Button"
import { Stack, Typography } from "@mui/material"
import * as dicomParser from "dicom-parser"

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement
if (!canvas) throw new Error("no canvas")

const ctx = canvas.getContext("2d")
if (!ctx) throw new Error("no ctx")

const App = () => {
    const fileUploadRef = useRef<HTMLInputElement>(null)

    const [selectedFiles, setSelectedFiles] = useState<FileList | undefined>(
        undefined
    )

    const [fileIndex, setFileIndex] = useState(0)

    const uploadClicked = () => {
        if (fileUploadRef.current) {
            fileUploadRef.current.click()
        }
    }

    const renderImage = () => {
        // if (!selectedFiles) throw new Error("Selected file no exist!!!")
        // const reader = new FileReader()
        // reader.onload = (e: ProgressEvent<FileReader>) => {
        //     const arrayBuffer = e.target?.result as ArrayBuffer
        //     const byteArray = new Uint8Array(arrayBuffer)
        //     try {
        //         const dataSet = dicomParser.parseDicom(byteArray)
        //         const pixelDataElement = dataSet.elements.x7fe00010
        //         const pixelData = new Uint16Array(
        //             dataSet.byteArray.buffer,
        //             pixelDataElement.dataOffset,
        //             pixelDataElement.length / 2
        //         )
        //         const width = dataSet.uint16("x00280011")
        //         const height = dataSet.uint16("x00280010")
        //         if (!width) throw new Error("no width")
        //         if (!height) throw new Error("no height")
        //         canvas.width = width
        //         canvas.height = height
        //         const imageData = ctx!.createImageData(width, height)
        //         for (let x = 0; x < width; x++) {
        //             for (let y = 0; y < height; y++) {}
        //         }
        //         for (let i = 0; i < pixelData.length; i++) {
        //             let value = pixelData[i]
        //             //value = ((value - minPixelValue) / (maxPixelValue - minPixelValue)) * 255;
        //             value = Math.max(0, Math.min(255, value)) // Clamp to 0-255
        //             imageData.data[i * 4] = value
        //             imageData.data[i * 4 + 1] = value
        //             imageData.data[i * 4 + 2] = value
        //             imageData.data[i * 4 + 3] = 255
        //         }
        //         ctx!.putImageData(imageData, 0, 0)
        //     } catch (error) {
        //         console.error("Error parsing DICOM file:", error)
        //     }
        // }
        // reader.readAsArrayBuffer(selectedFiles[fileIndex])
    }

    const onInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(e.target.files)
            renderImage()

            if (!selectedFiles) throw new Error("Selected file no exist!!!")

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

                    if (!width) throw new Error("no width")
                    if (!height) throw new Error("no height")

                    canvas.width = width
                    canvas.height = height
                    const imageData = ctx!.createImageData(width, height)

                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height; y++) {}
                    }

                    for (let i = 0; i < pixelData.length; i++) {
                        let value = pixelData[i]
                        //value = ((value - minPixelValue) / (maxPixelValue - minPixelValue)) * 255;
                        value = Math.max(0, Math.min(255, value)) // Clamp to 0-255

                        imageData.data[i * 4] = value
                        imageData.data[i * 4 + 1] = value
                        imageData.data[i * 4 + 2] = value
                        imageData.data[i * 4 + 3] = 255
                    }

                    ctx!.putImageData(imageData, 0, 0)
                } catch (error) {
                    console.error("Error parsing DICOM file:", error)
                }
            }

            reader.readAsArrayBuffer(selectedFiles[fileIndex])
        }
    }

    return (
        <>
            <Stack direction={"column"} maxWidth={"20vw"} alignItems="stretch">
                <input
                    ref={fileUploadRef}
                    onChange={onInputChanged}
                    type="file"
                    hidden={true}
                    {...({ directory: "true" } as any)}
                    {...({ webkitdirectory: "true" } as any)}
                    multiple
                />
                <Button variant="contained" onClick={uploadClicked}>
                    Load File
                </Button>
                {selectedFiles ? (
                    <>
                        <Typography>{`Loaded ${selectedFiles.length} files`}</Typography>
                        <Button variant="contained" onClick={renderImage}>
                            Render Image
                        </Button>
                        <Stack
                            direction={"row"}
                            alignItems="stretch"
                            spacing=""
                        >
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setFileIndex(fileIndex => fileIndex - 1)
                                    renderImage()
                                }}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setFileIndex(fileIndex => fileIndex + 1)
                                    renderImage()
                                }}
                            >
                                Next
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setFileIndex(fileIndex => fileIndex + 1)
                                    renderImage()
                                }}
                            >
                                Generate Model
                            </Button>
                        </Stack>
                    </>
                ) : (
                    <></>
                )}
            </Stack>
        </>
    )

    // return (
    //     <div className="flex flex-col items-center gap-5">
    //         <Button value="Upload" onClick={uploadClicked} />
    //         {selectedFile ? (
    //             <Typography>{`Selected File: ${selectedFile.name}`}</Typography>
    //         ) : (
    //             <></>
    //         )}
    //     </div>
    // )
}
// {
//     const fileUploadRef = useRef<HTMLInputElement>(null)

//     const [selectedFile, setSelectedFile] = useState<File | undefined>(
//         undefined
//     )

//     return (
//         <>
//             <Button variant="contained" onClick={() => {}}>
//                 Hello world
//             </Button>
//         </>
//     )
// }

export default App
