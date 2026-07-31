import { useState, useEffect } from "react"
import { subscribeSyncStatus, processSyncQueue } from "@/offline/syncEngine"
import { getPendingQueue } from "@/offline/idbStorage"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Wifi, WifiOff, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function SyncStatusWidget() {
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSync, setLastSync] = useState<Date | undefined>(undefined)
  const [isSyncing, setIsSyncing] = useState(false)
  const isOnline = navigator.onLine

  useEffect(() => {
    getPendingQueue().then((q) => setPendingCount(q.length))

    const unsubscribe = subscribeSyncStatus((count, time) => {
      setPendingCount(count)
      if (time) setLastSync(time)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.warning("Cannot sync while offline.")
      return
    }
    setIsSyncing(true)
    try {
      const count = await processSyncQueue()
      toast.success(`Sync completed! ${count} actions processed.`)
    } catch (error) {
      toast.error("Sync failed.")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card text-xs">
      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-emerald-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-amber-500" />
        )}
        <span className="font-semibold">{isOnline ? "Connected" : "Offline Mode"}</span>
      </div>

      {pendingCount > 0 ? (
        <Badge variant="destructive" className="text-[10px]">
          {pendingCount} Pending Sync
        </Badge>
      ) : (
        <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/40">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Synced
        </Badge>
      )}

      {lastSync && (
        <span className="text-muted-foreground text-[10px]">
          Last sync: {lastSync.toLocaleTimeString()}
        </span>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 ml-auto"
        onClick={handleManualSync}
        disabled={isSyncing || !isOnline}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
      </Button>
    </div>
  )
}
