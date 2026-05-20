import { useState, useCallback } from 'react'
import { Notification, FileManager } from './marketplace'
import { Tabs } from './components/Tabs'
import { ModuleDemoTab } from './demo/ModuleDemoTab'
import { FileDemoTab } from './demo/FileDemoTab'
import { ChainViz } from './monitoring/ChainViz'
import { DAGGraph } from './monitoring/DAGGraph'
import { LedgerFeed } from './monitoring/LedgerFeed'
import { MemoryTimeline } from './monitoring/MemoryTimeline'
import { MiningActivityFeed } from './monitoring/MiningActivity'
import { MiningStatus } from './monitoring/MiningStatus'
import { useMiningSim } from './monitoring/hooks/useMiningSim'
import { mockBlocks } from './monitoring/data/blocks'
import { mockFileTree } from './data/file-tree'

const PRIMARY_TABS = ['项目监控', '业务功能']

// ── Monitoring Sub-tabs ──────────────────────────────────────
const MONITOR_TABS = ['区块链', 'DAG 依赖', '账本', '记忆系统', '文件结构']

function MonitoringView() {
  const [activeTab, setActiveTab] = useState(MONITOR_TABS[0])
  const { isMining, progress, activities, startMining, stopMining } = useMiningSim()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MiningStatus
        isMining={isMining}
        progress={progress}
        onStart={startMining}
        onStop={stopMining}
      />
      <Tabs tabs={MONITOR_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === '区块链' && (
        <>
          <ChainViz blocks={mockBlocks} miningHeight={isMining ? mockBlocks.length : null} miningProgress={progress} />
          <MiningActivityFeed activities={activities} />
        </>
      )}
      {activeTab === 'DAG 依赖' && <DAGGraph />}
      {activeTab === '账本' && <LedgerFeed />}
      {activeTab === '记忆系统' && <MemoryTimeline />}
      {activeTab === '文件结构' && (
        <div className="p-4">
          <FileManager files={mockFileTree} rootName="DREAM-AG协作协议" />
        </div>
      )}
    </div>
  )
}

// ── Business Function Sub-tabs ───────────────────────────────
const BIZ_TABS = ['模块演示', '文件管理', '通知中心']

function BusinessView() {
  const [activeTab, setActiveTab] = useState(BIZ_TABS[0])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Tabs tabs={BIZ_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === '模块演示' && <ModuleDemoTab />}
      {activeTab === '文件管理' && <FileDemoTab />}
      {activeTab === '通知中心' && <NotificationCenterTab />}
    </div>
  )
}

function NotificationCenterTab() {
  const [notifications, setNotifications] = useState<string[]>([])

  const add = (type: string, title: string, message: string) => {
    setNotifications((p) => [...p, `${type} — ${title}: ${message}`])
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        通知中心 — 测试所有通知类型
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {([
          ['info', 'Info 通知', '提示', '这是一条普通提示通知', 'blue'],
          ['success', 'Success 通知', '成功', '操作已成功完成', 'green'],
          ['warning', 'Warning 通知', '警告', '请注意此操作可能影响其他模块', 'yellow'],
          ['error', 'Error 通知', '错误', '网络连接失败，请稍后重试', 'red'],
        ] as const).map(([type, label, title, msg, color]) => (
          <button
            key={type}
            onClick={() => add(type, title, msg)}
            className={`px-4 py-2.5 text-sm rounded-lg bg-${color}-50 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-400 border border-${color}-200 dark:border-${color}-800 hover:bg-${color}-100 dark:hover:bg-${color}-900/30 transition-colors`}
          >
            {label}
          </button>
        ))}
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

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  const [primaryTab, setPrimaryTab] = useState(PRIMARY_TABS[0])

  const handleTabChange = useCallback((tab: string) => {
    setPrimaryTab(tab)
  }, [])

  return (
    <div>
      {/* Primary Navigation */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            DREAM Frontend
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            5 modules loaded · {mockBlocks.length} blocks mined
          </span>
        </div>
        <Tabs tabs={PRIMARY_TABS} activeTab={primaryTab} onTabChange={handleTabChange} />
      </header>
      {primaryTab === '项目监控' && <MonitoringView />}
      {primaryTab === '业务功能' && <BusinessView />}
      <Notification position="top-right" />
    </div>
  )
}
