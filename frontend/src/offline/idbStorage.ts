const DB_NAME = "NexSpend_Offline_DB"
const DB_VERSION = 1

export interface QueuedAction {
  id: string
  type: string
  payload: any
  timestamp: number
  retryCount: number
  status: "pending" | "synced" | "failed"
}

export function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event: any) => {
      const db: IDBDatabase = event.target.result

      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "_id" })
      }
      if (!db.objectStoreNames.contains("budgets")) {
        db.createObjectStore("budgets", { keyPath: "_id" })
      }
      if (!db.objectStoreNames.contains("goals")) {
        db.createObjectStore("goals", { keyPath: "_id" })
      }
      if (!db.objectStoreNames.contains("actionQueue")) {
        db.createObjectStore("actionQueue", { keyPath: "id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addToQueue(action: Omit<QueuedAction, "id" | "timestamp" | "retryCount" | "status">): Promise<QueuedAction> {
  const db = await openIDB()
  const queuedItem: QueuedAction = {
    ...action,
    id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
    retryCount: 0,
    status: "pending",
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction("actionQueue", "readwrite")
    const store = tx.objectStore("actionQueue")
    const req = store.add(queuedItem)

    req.onsuccess = () => resolve(queuedItem)
    req.onerror = () => reject(req.error)
  })
}

export async function getPendingQueue(): Promise<QueuedAction[]> {
  const db = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("actionQueue", "readonly")
    const store = tx.objectStore("actionQueue")
    const req = store.getAll()

    req.onsuccess = () => {
      const all: QueuedAction[] = req.result
      resolve(all.filter((item) => item.status === "pending"))
    }
    req.onerror = () => reject(req.error)
  })
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("actionQueue", "readwrite")
    const store = tx.objectStore("actionQueue")
    const req = store.delete(id)

    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
