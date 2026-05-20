import { useState, useCallback, useEffect } from 'react'
import { Tabs } from './components/Tabs'
import { Notification, notify, DataTable, Dashboard, QuotePanel, FileManager } from './marketplace'
import { mockSymbols } from './data/quotes'
import { mockOrders, orderColumns } from './data/orders'
import { mockFileTree } from './data/file-tree'
import { mockWidgets } from './data/widgets'
import BlockTaskBoard from './components/BlockTaskBoard'
import CanvasSketch from './components/CanvasSketch'
import type { BlockTask } from './hooks/useBlockTasks'

const TABS = ['画版设计', 'Dashboard', '行情面板', '数据表格', '文件管理', '通知中心', '任务协作']

function DashboardTab() { return <Dashboard widgets={mockWidgets} theme="auto" /> }
function QuoteTab() { return <div className="p-4 max-w-3xl mx-auto"><QuotePanel symbols={mockSymbols} colorScheme="red-up" decimals={2} /></div> }
function TableTab() { return <div className="p-4"><DataTable columns={orderColumns} data={mockOrders} pageSize={10} searchable exportable /></div> }
function FileTab() { return <div className="p-4"><FileManager files={mockFileTree} rootName="DREAM-AG协作协议" /></div> }
function NotificationTab() {
  const [msgs, setMsgs] = useState<string[]>([])
  const types = ['info', 'success', 'warning', 'error'] as const
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">通知中心</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {types.map((t) => (
          <button key={t} onClick={() => { notify[t](`${t} 通知`); setMsgs((p) => [...p, `${t}: ${new Date().toLocaleTimeString()}`]) }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300">{t}</button>
        ))}
      </div>
      {msgs.length > 0 && msgs.map((m, i) => <div key={i} className="text-sm text-gray-600">{m}</div>)}
    </div>
  )
}

function writeTasksToDB(tasks: any[]) {
  const req = indexedDB.open('dream-tasks-db', 1)
  req.onupgradeneeded = (e) => {
    const db = (e.target as IDBOpenDBRequest).result
    if (!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks', { keyPath: 'key' })
  }
  req.onsuccess = (e) => {
    const db = (e.target as IDBOpenDBRequest).result
    const tx = db.transaction('tasks', 'readwrite')
    tx.objectStore('tasks').put({ key: 'latest', tasks, timestamp: Date.now() })
    tx.oncomplete = () => db.close()
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [canvasTasks, setCanvasTasks] = useState<BlockTask[] | null>(null)
  const [debug, setDebug] = useState<string[]>([])

  // Monitor IndexedDB (same DB the iframe bridge reads from)
  useEffect(() => {
    const poll = setInterval(() => {
      const req = indexedDB.open('dream-tasks-db', 1)
      req.onupgradeneeded = (e) => { const db=(e.target as IDBOpenDBRequest).result; if(!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks',{keyPath:'key'}) }
      req.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        const tx = db.transaction('tasks','readonly')
        const r = tx.objectStore('tasks').get('latest')
        r.onsuccess = () => {
          const val = r.result
          if (val) setDebug((p) => [...p, `DB: ${val.tasks?.length||0} tasks`].slice(-3))
          db.close()
        }
        r.onerror = () => db.close()
      }
    }, 2000)
    return () => clearInterval(poll)
  }, [])

  const handleTasksGenerated = useCallback((tasks: BlockTask[]) => {
    setCanvasTasks(tasks)
    setActiveTab('任务协作')
    notify.info('任务已生成', { message: `从画版推理生成 ${tasks.length} 个协作任务` })
    // Write to 5173's IndexedDB — iframe bridge on 5174 reads from here
    writeTasksToDB(tasks)
    setDebug((p) => [...p, `Write: ${tasks.length} tasks`].slice(-3))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Modules Demo</h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">Canvas → Architecture → Tasks</span>
        </div>
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </header>
      {activeTab === '画版设计' && <CanvasSketch onTasksGenerated={handleTasksGenerated} />}
      {activeTab === 'Dashboard' && <DashboardTab />}
      {activeTab === '行情面板' && <QuoteTab />}
      {activeTab === '数据表格' && <TableTab />}
      {activeTab === '文件管理' && <FileTab />}
      {activeTab === '通知中心' && <NotificationTab />}
      {activeTab === '任务协作' && <BlockTaskBoard initialTasks={canvasTasks} />}
      <Notification position="top-right" />

      {/* Debug overlay */}
      <div className="fixed bottom-2 left-2 z-[999] bg-black/80 text-green-400 text-xs font-mono p-2 rounded max-w-xs">
        <div className="font-bold mb-1 text-white">DEBUG 5173 写入</div>
        {debug.length === 0 && <div className="text-gray-500">等待任务...</div>}
        {debug.map((d, i) => <div key={i}>{d}</div>)}
      </div>
    </div>
  )
}
