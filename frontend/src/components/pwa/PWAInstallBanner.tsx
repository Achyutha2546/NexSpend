import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setIsVisible(false)
    }
    setDeferredPrompt(null)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border shadow-xl rounded-xl p-4 max-w-sm flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
      <div>
        <h4 className="font-bold text-sm">Install NexSpend App</h4>
        <p className="text-xs text-muted-foreground">Add to home screen for near-native experience & offline access.</p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8 text-xs" onClick={handleInstall}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Install
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsVisible(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
