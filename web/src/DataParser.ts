import { useRef } from "react"

class DataParser {
    public static SCAN_DATA: number[][][] = []

    public static async loadData() {
        console.log("Loading data...")
        // //await this.readFileFromPath("/scan_data/Circle of Willis/1-005.dcm")
        // await fetch("/test.json")
        //     .then(x => x.json())
        //     .then(x => {
        //         console.log(x)
        //     })
        //this.readFileFromPath("/test.json")

        const fileUploadRef = useRef<HTMLInputElement>(null)

        if (fileUploadRef.current) {
            fileUploadRef.current.click()
        }
    }

    private static async readFileFromPath(filePath: string) {
        try {
            const response = await fetch(filePath)
            if (!response.ok) {
                throw new Error("Network response was not ok")
            }
            const fileContent = await response.text()
            console.log("File content:", fileContent)
            // Process the file content as needed
            return fileContent
        } catch (error) {
            console.error("Error fetching or reading file:", error)
            return null
        }
    }
}

export default DataParser
