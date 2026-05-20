import React from 'react'
import { MemoryEvent, mockMemoryEvents } from '../data/memory'
import { AlertTriangle, CheckCircle2, Info, BookOpen } from 'lucide-react'

const TYPE_CONFIG: Record<MemoryEvent['type'], { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  episode: { icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', label: '经验' },
  lesson: { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', label: '教训' },
  retrospective: { icon: Info, color: 'text-purple-600 dark:text-purple-400', label: '复盘' },
  'value-check': { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', label: '价值检查' },
}

export function MemoryTimeline() {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        记忆时间线 ({mockMemoryEvents.length} 条)
      </h3>
      <div className="relative ml-4 space-y-0">
        {/* Timeline line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />

        {mockMemoryEvents.map((event, i) => {
          const config = TYPE_CONFIG[event.type]
          const Icon = config.icon
          return (
            <div key={event.id} className="relative pl-6 pb-4 last:pb-0">
              {/* Dot */}
              <div className={`absolute left-[-16px] top-1.5 w-7 h-7 rounded-full border-2 bg-white dark:bg-gray-800 flex items-center justify-center ${config.color.replace('text-', 'border-')}`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400">{event.timestamp}</span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {event.summary}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>任务 #{event.taskId}</span>
                  {event.score != null && <span>评分: {event.score}</span>}
                  {event.pathEfficiency != null && <span>路径效率: {(event.pathEfficiency * 100).toFixed(0)}%</span>}
                  {event.category && <span className="text-red-500">{event.category}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
