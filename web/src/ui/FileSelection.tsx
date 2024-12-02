import { Button } from "@mui/material"
import { ChangeEvent, FC, useRef } from "react"

// Extend the JSX Intrinsic Elements for the 'input' tag
declare module "react" {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        directory?: string
        webkitdirectory?: string
    }
}

interface FileSelectionProps {
    setFiles: (files: FileList) => void
}

const FileSelection: FC<FileSelectionProps> = ({ setFiles }) => {
    const fileUploadRef = useRef<HTMLInputElement>(null)

    const uploadClicked = () => {
        if (fileUploadRef.current) {
            fileUploadRef.current.click()
        }
    }

    const onInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(e.target.files)
            console.log("data received")
        } else {
            console.log("nope")
        }
    }

    return (
        <>
            <input
                ref={fileUploadRef}
                onChange={onInputChanged}
                type="file"
                hidden={true}
                directory="true"
                webkitdirectory="true"
                multiple
            />
            <Button variant="contained" onClick={uploadClicked}>
                Select Folder
            </Button>
        </>
    )
}

export default FileSelection
