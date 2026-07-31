import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="bg-amber-500 text-slate-950 font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 z-50">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Offline Mode Active. NexSpend is running from local cache.</span>
    </div>
  )
}
