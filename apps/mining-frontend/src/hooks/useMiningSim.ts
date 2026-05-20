import { useState, useEffect, useRef, useCallback } from 'react'
import { notify } from '../marketplace'
import { mockBlocks } from '../data/blocks'

export interface MiningActivity {
  id: number
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning'
}

export interface MiningState {
  isMining: boolean
  progress: number
  currentBlock: { height: number; taskTitle: string } | null
  activities: MiningActivity[]
}

export function useMiningSim() {
  const [state, setState] = useState<MiningState>({
    isMining: false,
    progress: 0,
    currentBlock: null,
    activities: [
      { id: 1, timestamp: '08:00', message: '系统启动，加载 6 个已挖区块', type: 'info' },
    ],
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activityCounter = useRef(1)

  const addActivity = useCallback((message: string, type: MiningActivity['type']) => {
    activityCounter.current += 1
    const now = new Date()
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setState((prev) => ({
      ...prev,
      activities: [...prev.activities, { id: activityCounter.current, timestamp: ts, message, type }],
    }))
  }, [])

  const startMining = useCallback(() => {
    setState((prev) => {
      if (prev.isMining) return prev
      const nextHeight = mockBlocks.length + 1
      return {
        ...prev,
        isMining: true,
        progress: 0,
        currentBlock: { height: nextHeight, taskTitle: '新任务待分配' },
      }
    })
    addActivity('开始挖矿...', 'info')

    const duration = 3000 + Math.random() * 5000
    const interval = 50
    let elapsed = 0

    timerRef.current = setInterval(() => {
      elapsed += interval
      const progress = Math.min(100, (elapsed / duration) * 100)

      setState((prev) => {
        if (progress >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          const nextHeight = mockBlocks.length + Math.floor(elapsed / duration) + 1
          const hash = `0x${Math.random().toString(16).slice(2, 10)}`
          notify.success(`区块 #${nextHeight} 已挖出`, {
            message: `Hash: ${hash} | 奖励: ${(Math.random() * 2 + 0.5).toFixed(1)} DREAM`,
            duration: 5000,
          })
          addActivity(`区块 #${nextHeight} 挖出成功 — ${hash}`, 'success')
          return {
            isMining: false,
            progress: 100,
            currentBlock: null,
            activities: prev.activities,
          }
        }
        return { ...prev, progress }
      })
    }, interval)
  }, [addActivity])

  const stopMining = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setState((prev) => ({
      ...prev,
      isMining: false,
      progress: 0,
      currentBlock: null,
    }))
    addActivity('挖矿已停止', 'warning')
  }, [addActivity])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return { ...state, startMining, stopMining }
}
