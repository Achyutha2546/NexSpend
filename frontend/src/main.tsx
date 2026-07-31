import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "./providers/ThemeProvider"
import { registerServiceWorker } from "./swRegister"
import App from "./App"
import "./index.css"

const queryClient = new QueryClient()
registerServiceWorker()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="nexspend-theme">
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
