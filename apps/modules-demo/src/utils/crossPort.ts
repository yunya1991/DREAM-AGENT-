/** Cross-port task communication via IndexedDB (shared across all ports on same host) */

const DB_NAME = 'dream-tasks-db'
const STORE_NAME = 'tasks'
const TASK_KEY = 'latest'

interface TaskMessage {
  tasks: any[]
  timestamp: number
}

export function broadcastTasks(tasks: any[]) {
  const request = indexedDB.open(DB_NAME, 1)
  request.onupgradeneeded = (e) => {
    const db = (e.target as IDBOpenDBRequest).result
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'key' })
    }
  }
  request.onsuccess = (e) => {
    const db = (e.target as IDBOpenDBRequest).result
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const msg: TaskMessage = { tasks, timestamp: Date.now() }
    store.put({ key: TASK_KEY, ...msg })
    db.close()
  }
}

export function listenForTasks(onTasks: (tasks: any[]) => void): () => void {
  let polling: ReturnType<typeof setInterval> | null = null
  let lastTimestamp = 0

  function check() {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    request.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(TASK_KEY)
      req.onsuccess = () => {
        const result = req.result as TaskMessage | undefined
        if (result && result.timestamp > lastTimestamp) {
          lastTimestamp = result.timestamp
          onTasks(result.tasks)
        }
        db.close()
      }
      req.onerror = () => db.close()
    }
  }

  // Check every 500ms
  polling = setInterval(check, 500)

  return () => {
    if (polling) clearInterval(polling)
  }
}
