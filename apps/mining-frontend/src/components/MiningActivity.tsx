import React, { useRef, useEffect } from 'react'
import { MiningActivity } from '../hooks/useMiningSim'
import { Activity, Shield, CheckCircle2, AlertTriangle } from 'lucide-react'

const TYPE_ICONS: Record<MiningActivity['type'], React.ComponentType<{ className?: string }>> = {
  info: Activity,
  success: CheckCircle2,
  warning: AlertTriangle,
}

const TYPE_COLORS: Record<MiningActivity['type'], string> = {
  info: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
}

interface MiningActivityFeedProps {
  activities: MiningActivity[]
}

export function MiningActivityFeed({ activities }: MiningActivityFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [activities])

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        活动日志
      </h3>
      <div ref={containerRef} className="max-h-64 overflow-y-auto space-y-1">
        {activities.map((a) => {
          const Icon = TYPE_ICONS[a.type]
          return (
            <div key={a.id} className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${TYPE_COLORS[a.type]}`} />
              <span className="text-xs text-gray-400 w-10 flex-shrink-0">{a.timestamp}</span>
              <span className="text-gray-700 dark:text-gray-300">{a.message}</span>
            </div>
          )
        })}
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            暂无活动
          </div>
        )}
      </div>
    </div>
  )
}
