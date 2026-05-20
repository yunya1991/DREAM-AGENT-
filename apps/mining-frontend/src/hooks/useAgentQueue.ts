import { useState, useCallback, useEffect, useRef } from 'react'
import { notify } from '../marketplace'

export interface AgentTask {
  id: string
  moduleName: string
  label: string
  proposer: string
  status: 'queued' | 'mining' | 'mined' | 'failed'
  progress: number
  reward: number
  hash: string
  agentName: string
  startedAt?: number
}

const AGENT_NAMES = ['Agent-Alpha', 'Agent-Beta', 'Agent-Gamma', 'Agent-Delta']

export function useAgentQueue() {
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [miningTask, setMiningTask] = useState<AgentTask | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const taskQueueRef = useRef<AgentTask[]>([])
  const activeRef = useRef(false)
  const completedIdsRef = useRef<Set<string>>(new Set())

  const enqueueTasks = useCallback((rawTasks: any[]) => {
    const newTasks: AgentTask[] = rawTasks.map((t, i) => ({
      id: t.id || `agent-task-${Date.now()}-${i}`,
      moduleName: t.moduleName || 'Unknown',
      label: t.label || '未命名任务',
      proposer: t.proposer || 'AI',
      status: 'queued' as const,
      progress: 0,
      reward: +(Math.random() * 3 + 1).toFixed(1),
      hash: '',
      agentName: AGENT_NAMES[i % AGENT_NAMES.length],
    }))
    // Only add tasks not already in queue or completed
    const existingIds = new Set([...taskQueueRef.current.map((t) => t.id), ...completedIdsRef.current])
    const fresh = newTasks.filter((t) => !existingIds.has(t.id))
    if (fresh.length > 0) {
      taskQueueRef.current = [...taskQueueRef.current, ...fresh]
      setEnqueueCount((c) => c + 1)
      notify.info(`Agent 队列更新`, { message: `新增 ${fresh.length} 个任务到队列` })
    }
  }, [])

  const mineNext = useCallback((onComplete: (t: AgentTask, hash: string) => void) => {
    if (activeRef.current || taskQueueRef.current.length === 0) return
    activeRef.current = true

    const task = taskQueueRef.current.shift()!
    const agentName = task.agentName
    notify.info(`${agentName} 已领取任务`, { message: task.label })

    // Show mining
    setMiningTask({ ...task, status: 'mining', progress: 0 })

    const duration = 2000 + Math.random() * 3000
    const interval = 50
    let elapsed = 0

    timerRef.current = setInterval(() => {
      elapsed += interval
      const progress = Math.min(100, (elapsed / duration) * 100)

      if (progress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null

        const hash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`
        const completed = { ...task, status: 'mined' as const, progress: 100, hash }
        completedIdsRef.current.add(task.id)

        notify.success(`${agentName} 任务完成`, { message: `${task.label} | 奖励: ${task.reward} DREAM | Hash: ${hash}` })

        // Add to main task list as mined
        setTasks((prev) => [...prev, completed])
        setMiningTask(null)
        console.log('[useAgentQueue] onComplete called for', completed.id, 'hash:', hash)
        onComplete(completed, hash)

        activeRef.current = false
        // Small delay then process next
        setTimeout(() => mineNext(onComplete), 500)
      } else {
        setMiningTask((prev) => prev ? { ...prev, progress } : null)
      }
    }, interval)
  }, [])

  // Auto-start mining when tasks arrive
  const [enqueueCount, setEnqueueCount] = useState(0)
  const onCompleteRef = useRef<(t: AgentTask, hash: string) => void>(() => {})
  useEffect(() => {
    if (taskQueueRef.current.length > 0 && !activeRef.current) {
      mineNext(onCompleteRef.current)
    }
  }, [enqueueCount]) // trigger when tasks are enqueued

  // Bump enqueueCount to trigger mining
  const bumpQueue = useCallback(() => setEnqueueCount((c) => c + 1), [])

  const resetQueue = useCallback(() => {
    setTasks([])
    setMiningTask(null)
    taskQueueRef.current = []
    completedIdsRef.current.clear()
    activeRef.current = false
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  // Expose callback setter
  const setOnTaskComplete = useCallback((cb: (task: AgentTask, hash: string) => void) => {
    onCompleteRef.current = cb
  }, [])

  const minedCount = tasks.filter((t) => t.status === 'mined').length
  const queuedCount = taskQueueRef.current.length

  return { tasks, enqueueTasks, resetQueue, isProcessing: activeRef.current, miningTask, minedCount, queuedCount, setOnTaskComplete }
}
