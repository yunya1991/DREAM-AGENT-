import { useState, useCallback } from 'react'
import { Notification } from './marketplace'
import { Tabs } from './components/Tabs'
import { ModuleDemoTab } from './components/ModuleDemoTab'
import { FileDemoTab } from './components/FileDemoTab'

const TABS = ['模块演示', '文件管理', '通知中心']

function NotificationCenterTab() {
  const [notifications, setNotifications] = useState<string[]>([])

  const addNotification = (type: string, title: string, message: string) => {
    setNotifications((prev) => [...prev, `${type} — ${title}: ${message}`])
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        通知中心 — 测试所有通知类型
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            addNotification('info', '提示', '这是一条普通提示通知')
          }}
          className="px-4 py-2.5 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          Info 通知
        </button>
        <button
          onClick={() => {
            addNotification('success', '成功', '操作已成功完成')
          }}
          className="px-4 py-2.5 text-sm rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          Success 通知
        </button>
        <button
          onClick={() => {
            addNotification('warning', '警告', '请注意此操作可能影响其他模块')
          }}
          className="px-4 py-2.5 text-sm rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
        >
          Warning 通知
        </button>
        <button
          onClick={() => {
            addNotification('error', '错误', '网络连接失败，请稍后重试')
          }}
          className="px-4 py-2.5 text-sm rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          Error 通知
        </button>
      </div>
      {notifications.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            通知历史 ({notifications.length})
          </h3>
          {notifications.map((msg, i) => (
            <div key={i} className="text-sm text-gray-700 dark:text-gray-300 py-1 border-b border-gray-100 dark:border-gray-700">
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Modules Demo
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            DREAM Marketplace — 5 modules loaded
          </span>
        </div>
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      </header>
      {activeTab === '模块演示' && <ModuleDemoTab />}
      {activeTab === '文件管理' && <FileDemoTab />}
      {activeTab === '通知中心' && <NotificationCenterTab />}
      <Notification position="top-right" />
    </div>
  )
}
