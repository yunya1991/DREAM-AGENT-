import { useState, useCallback, lazy, Suspense } from 'react'
import { Tabs } from './components/Tabs'
import { Notification, notify, DataTable, Dashboard, QuotePanel, FileManager } from './marketplace'
import { mockSymbols } from './data/quotes'
import { mockOrders, orderColumns } from './data/orders'
import { mockFileTree } from './data/file-tree'
import { mockWidgets } from './data/widgets'

const TABS = ['Dashboard', '行情面板', '数据表格', '文件管理', '通知中心']

function DashboardTab() {
  return <Dashboard widgets={mockWidgets} theme="auto" />
}

function QuoteTab() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <QuotePanel symbols={mockSymbols} colorScheme="red-up" decimals={2} />
    </div>
  )
}

function TableTab() {
  return (
    <div className="p-4">
      <DataTable columns={orderColumns} data={mockOrders} pageSize={10} searchable exportable />
    </div>
  )
}

function FileTab() {
  return (
    <div className="p-4">
      <FileManager files={mockFileTree} rootName="DREAM-AG协作协议" />
    </div>
  )
}

function NotificationTab() {
  const [msgs, setMsgs] = useState<string[]>([])
  const types = ['info', 'success', 'warning', 'error'] as const
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">通知中心</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => {
              notify[t](`${t} 通知`, { message: `这是一条 ${t} 类型的通知` })
              setMsgs((p) => [...p, `${t}: ${new Date().toLocaleTimeString()}`])
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
          >
            {t}
          </button>
        ))}
      </div>
      {msgs.length > 0 && (
        <div className="space-y-1">
          {msgs.map((m, i) => <div key={i} className="text-sm text-gray-600">{m}</div>)}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Modules Demo
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            5 marketplace modules
          </span>
        </div>
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </header>
      {activeTab === 'Dashboard' && <DashboardTab />}
      {activeTab === '行情面板' && <QuoteTab />}
      {activeTab === '数据表格' && <TableTab />}
      {activeTab === '文件管理' && <FileTab />}
      {activeTab === '通知中心' && <NotificationTab />}
      <Notification position="top-right" />
    </div>
  )
}
