import { useState, useCallback, useRef } from 'react'
import { notify } from '../marketplace'

export interface BlockTask {
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

const INITIAL_TASKS: BlockTask[] = [
  {
    id: 'task-dashboard',
    moduleName: 'Dashboard',
    label: '仪表盘组装',
    proposer: 'Agent-Dash',
    status: 'pending',
    progress: 0,
    reward: 0,
    hash: '',
    dependsOn: [],
  },
  {
    id: 'task-quote',
    moduleName: 'QuotePanel',
    label: '行情面板接入',
    proposer: 'Agent-Quote',
    status: 'pending',
    progress: 0,
    reward: 0,
    hash: '',
    dependsOn: ['task-dashboard'],
  },
  {
    id: 'task-table',
    moduleName: 'DataTable',
    label: '数据表格接入',
    proposer: 'Agent-Table',
    status: 'pending',
    progress: 0,
    reward: 0,
    hash: '',
    dependsOn: ['task-dashboard'],
  },
  {
    id: 'task-file',
    moduleName: 'FileManager',
    label: '文件管理接入',
    proposer: 'Agent-File',
    status: 'pending',
    progress: 0,
    reward: 0,
    hash: '',
    dependsOn: [],
  },
  {
    id: 'task-notify',
    moduleName: 'Notification',
    label: '通知中心接入',
    proposer: 'Agent-Notify',
    status: 'pending',
    progress: 0,
    reward: 0,
    hash: '',
    dependsOn: [],
  },
]

export function useBlockTasks() {
  const [tasks, setTasks] = useState<BlockTask[]>(INITIAL_TASKS)
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  const mineTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId)
      if (!task || task.status !== 'pending') return prev
      // Check dependencies
      const unmetDeps = task.dependsOn.filter((depId) => {
        const dep = prev.find((t) => t.id === depId)
        return !dep || dep.status !== 'mined'
      })
      if (unmetDeps.length > 0) {
        notify.warning(`依赖未满足`, {
          message: `任务 ${task.label} 依赖: ${unmetDeps.map((d) => prev.find((t) => t.id === d)?.label).join(', ')}`,
        })
        return prev
      }
      return prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'mining' as const, progress: 0, reward: +(Math.random() * 2 + 0.5).toFixed(1) }
          : t,
      )
    })

    const duration = 2000 + Math.random() * 3000
    const interval = 50
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      const progress = Math.min(100, (elapsed / duration) * 100)

      if (progress >= 100) {
        clearInterval(timer)
        timersRef.current.delete(taskId)
        const hash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: 'mined' as const, progress: 100, hash } : t,
          ),
        )
        setTasks((prev) => {
          const task = prev.find((t) => t.id === taskId)
          if (task) {
            notify.success(`任务已挖出`, {
              message: `${task.label} | 奖励: ${task.reward} DREAM | Hash: ${hash}`,
              duration: 5000,
            })
          }
          return prev
        })
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, progress } : t)),
        )
      }
    }, interval)

    timersRef.current.set(taskId, timer)
  }, [])

  const mineAll = useCallback(() => {
    // Mine tasks in dependency order
    const order: string[] = []
    const visited = new Set<string>()
    const visit = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)
      const task = tasks.find((t) => t.id === id)
      if (!task) return
      task.dependsOn.forEach(visit)
      order.push(id)
    }
    tasks.forEach((t) => visit(t.id))

    order.forEach((id, i) => {
      setTimeout(() => mineTask(id), i * 2500)
    })
  }, [tasks, mineTask])

  const resetAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearInterval(timer))
    timersRef.current.clear()
    setTasks(INITIAL_TASKS)
  }, [])

  const addTasks = useCallback((newTasks: BlockTask[]) => {
    setTasks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id))
      const filtered = newTasks.filter((t) => !existingIds.has(t.id))
      return filtered.length > 0 ? [...prev, ...filtered] : prev
    })
  }, [])

  const resetToTasks = useCallback((newTasks: BlockTask[]) => {
    timersRef.current.forEach((timer) => clearInterval(timer))
    timersRef.current.clear()
    setTasks(newTasks)
  }, [])

  return { tasks, mineTask, mineAll, resetAll, addTasks, resetToTasks }
}
