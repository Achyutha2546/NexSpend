import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function KeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        navigate("/productivity")
        toast.info("Navigated to Global Search & Productivity Hub")
      } else if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        navigate("/budget")
        toast.info("Navigated to Budget Planning")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigate])

  return null
}
