import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material"

const theme = createTheme({
    palette: {
        mode: "dark",
    },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>
)
