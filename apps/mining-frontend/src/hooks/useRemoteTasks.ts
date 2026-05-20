import { useState, useEffect, useCallback } from 'react'

interface RemoteTask {
  id: string
  moduleName: string
  label: string
  proposer: string
  status: 'pending' | 'mining' | 'mined'
  progress: number
  reward: number
  hash: string
  dependsOn: string[]
}

export function useRemoteTasks(onNewTask?: (task: RemoteTask) => void) {
  const [tasks, setTasks] = useState<RemoteTask[]>([])

  useEffect(() => {
    const ch = new BroadcastChannel('dream-tasks')
    ch.onmessage = (e: MessageEvent) => {
      if (e.data?.type === 'tasks-generated' && Array.isArray(e.data.tasks)) {
        const newTasks: RemoteTask[] = e.data.tasks
        setTasks(newTasks)
        // Notify each task
        newTasks.forEach((t) => onNewTask?.(t))
      }
    }
    return () => ch.close()
  }, [onNewTask])

  const clearTasks = useCallback(() => setTasks([]), [])

  return { tasks, clearTasks }
}
