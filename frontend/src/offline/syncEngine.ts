import { getPendingQueue, removeFromQueue } from "./idbStorage"
import { api } from "../services/api"

type SyncListener = (pendingCount: number, lastSyncTime?: Date) => void
const listeners: Set<SyncListener> = new Set()
let lastSyncTimestamp: Date | undefined = undefined

export function subscribeSyncStatus(listener: SyncListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners(pendingCount: number) {
  listeners.forEach((fn) => fn(pendingCount, lastSyncTimestamp))
}

export async function processSyncQueue(): Promise<number> {
  if (!navigator.onLine) return 0

  const pending = await getPendingQueue()
  if (pending.length === 0) {
    notifyListeners(0)
    return 0
  }

  let syncedCount = 0

  for (const item of pending) {
    try {
      if (item.type === "CREATE_TRANSACTION") {
        await api.post("/transactions", item.payload)
      } else if (item.type === "CHECKIN_HABIT") {
        await api.patch(`/productivity/habits/${item.payload.id}/checkin`)
      } else if (item.type === "CREATE_GOAL") {
        await api.post("/goals", item.payload)
      }

      await removeFromQueue(item.id)
      syncedCount++
    } catch (error) {
      console.error(`[SyncEngine] Failed to sync action ${item.id}`, error)
    }
  }

  lastSyncTimestamp = new Date()
  const remaining = await getPendingQueue()
  notifyListeners(remaining.length)

  return syncedCount
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[SyncEngine] Network reconnected. Triggering sync...")
    processSyncQueue()
  })
}
