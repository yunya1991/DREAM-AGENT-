import { useState } from 'react'
import { Dashboard, notify } from '../marketplace'
import { mockWidgets } from '../data/widgets'
import { triggerDemoNotifications } from '../data/demo-actions'
import { Bell, RefreshCw } from 'lucide-react'

export function ModuleDemoTab() {
  const [key, setKey] = useState(0)

  const handleRefresh = () => {
    setKey((k) => k + 1)
    notify.success('已刷新', { message: '数据已重新加载' })
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          模块演示 — 5 个 Marketplace 组件
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            刷新
          </button>
          <button
            onClick={triggerDemoNotifications}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell className="w-3 h-3" />
            触发通知
          </button>
        </div>
      </div>
      <div key={key}>
        <Dashboard widgets={mockWidgets} theme="auto" />
      </div>
    </div>
  )
}
