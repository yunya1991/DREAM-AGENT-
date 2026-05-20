import React, { useState, useCallback, useEffect } from 'react'
import { Notification, FileManager, DataTable } from './marketplace'
import type { Column } from './marketplace'
import { Tabs } from './components/Tabs'
import { MiningStatus } from './components/MiningStatus'
import { ChainViz } from './components/ChainViz'
import { DAGGraph } from './components/DAGGraph'
import { LedgerFeed } from './components/LedgerFeed'
import { MemoryTimeline } from './components/MemoryTimeline'
import { MiningActivityFeed } from './components/MiningActivity'
import ArtifactsPanel from './components/ArtifactsPanel'
import { useMiningSim } from './hooks/useMiningSim'
import { useAgentQueue } from './hooks/useAgentQueue'
import { useArtifactStore } from './hooks/useArtifactStore'
import { mockBlocks } from './data/blocks'
import { mockRegistryFiles } from './data/registry'

const TABS = ['区块链', 'DAG 依赖', '账本', '记忆系统', '文件结构', 'Agent 队列', '产物']

function agentStatusBadge(status: string) {
  const m: Record<string,string> = {
    queued:'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    mining:'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    mined:'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    failed:'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }
  const l: Record<string,string> = { queued:'队列中', mining:'Agent 处理中', mined:'已完成', failed:'失败' }
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m[status]||''}">${l[status]||status}</span>`
}
function agentProgress(v: number) {
  if(v<=0) return '-'
  if(v>=100) return '<span class="text-green-600">100%</span>'
  return `<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-blue-500 h-2 rounded-full transition-all" style="width:${v.toFixed(0)}%"></div></div><span class="text-xs text-gray-500">${v.toFixed(0)}%</span>`
}
const agentColumns: Column[] = [
  { key:'agentName', header:'Agent', sortable:true },
  { key:'label', header:'任务', sortable:true },
  { key:'moduleName', header:'模块' },
  { key:'status', header:'状态', sortable:true, render:agentStatusBadge },
  { key:'progress', header:'进度', render:agentProgress },
  { key:'reward', header:'奖励(DREAM)', render:(v) => v===0?'-':`${v}` },
  { key:'hash', header:'Hash', render:(v) => v?`<code class="text-xs font-mono text-purple-600">${v.slice(0,14)}...</code>`:'-' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [debug, setDebug] = useState<string[]>([])
  const { isMining, progress, activities, startMining, stopMining } = useMiningSim()
  const { tasks: agentTasks, enqueueTasks, resetQueue, isProcessing, miningTask, minedCount, queuedCount, setOnTaskComplete } = useAgentQueue()
  const { artifacts, addTaskArtifacts, clearAll: clearArtifacts, count: artifactCount } = useArtifactStore()
  const handleTabChange = useCallback((tab: string) => setActiveTab(tab), [])

  // Wire artifact generation on task completion
  useEffect(() => {
    setOnTaskComplete((task, hash) => {
      const newArtifacts = addTaskArtifacts({ ...task, hash })
      setDebug((p) => [...p, `Artifacts: ${newArtifacts.length} created`].slice(-5))
    })
  }, [setOnTaskComplete, addTaskArtifacts])

  // Listen for tasks from 5173 via iframe bridge (postMessage)
  useEffect(() => {
    let lastTs = 0
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'tasks-from-bridge' && e.data?.timestamp > lastTs) {
        lastTs = e.data.timestamp
        setDebug((p) => [...p, `Bridge: ${e.data.tasks?.length||0} tasks`].slice(-5))
        enqueueTasks(e.data.tasks)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [enqueueTasks])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hidden iframe bridge - reads 5173's IndexedDB and posts tasks here */}
      <iframe
        src="http://localhost:5173/task-bridge.html"
        style={{ display:'none', width:0, height:0, border:0 }}
        title="task-bridge"
      />

      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Mining Network</h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            DREAM Collaboration — {mockBlocks.length} blocks | Agent: {minedCount} 完成, {queuedCount} 等待 | 产物: {artifactCount}
          </span>
        </div>
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      </header>
      <MiningStatus isMining={isMining} progress={progress} onStart={startMining} onStop={stopMining} />
      {activeTab==='区块链' && <div className="bg-gray-50 dark:bg-gray-900"><ChainViz blocks={mockBlocks} miningHeight={isMining?mockBlocks.length:null} miningProgress={progress}/><MiningActivityFeed activities={activities}/></div>}
      {activeTab==='DAG 依赖' && <DAGGraph/>}
      {activeTab==='账本' && <LedgerFeed/>}
      {activeTab==='记忆系统' && <MemoryTimeline/>}
      {activeTab==='文件结构' && <div className="p-4 bg-gray-50 dark:bg-gray-900"><FileManager files={mockRegistryFiles} rootName="DREAM-AG协作协议"/></div>}

      {activeTab==='Agent 队列' && (
        <div className="p-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Agent 任务队列</h2>
              <p className="text-sm text-gray-500">从 5173 画版设计 → 目的驱动架构识别 → 任务链生成 → iframe 桥接同步 → Agent 自动挖矿 → 产物生成</p>
            </div>
            <div className="flex items-center gap-3">
              {miningTask && (
                <span className="text-sm text-blue-600 font-semibold">{miningTask.agentName} 正在处理: {miningTask.label}</span>
              )}
              {!miningTask && agentTasks.length === 0 && queuedCount === 0 && <span className="text-sm text-gray-500">等待任务...</span>}
              {!miningTask && queuedCount > 0 && <span className="text-sm text-green-600">Agent 空闲中</span>}
              <button onClick={resetQueue} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors">重置队列</button>
            </div>
          </div>

          {miningTask && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{miningTask.agentName}</span>
                <span className="text-sm font-bold text-blue-600">{miningTask.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-100" style={{ width: `${miningTask.progress}%` }} />
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{miningTask.label}</div>
            </div>
          )}

          {miningTask && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{miningTask.agentName}</span>
                <span className="text-sm font-bold text-blue-600">{miningTask.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-100" style={{ width: `${miningTask.progress}%` }} />
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{miningTask.label}</div>
            </div>
          )}

          {agentTasks.length > 0 ? (
            <details open className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 select-none">
                已完成任务 ({agentTasks.length})
              </summary>
              <div className="px-4 pb-3">
                <DataTable columns={agentColumns} data={agentTasks} pageSize={5} />
              </div>
            </details>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
              <p>在 5173 的画版设计 tab 中画好草图</p>
              <p>点击"识别架构" → "生成任务链"</p>
              <p>Agent 会自动领取并处理任务，完成后生成产物</p>
            </div>
          )}
        </div>
      )}

      {activeTab==='产物' && (
        <div className="p-4 max-w-6xl mx-auto">
          <ArtifactsPanel artifacts={artifacts} onClear={clearArtifacts} />
        </div>
      )}
      <Notification position="top-right" />

      {/* Debug overlay */}
      <div className="fixed bottom-2 left-2 z-[999] bg-black/80 text-green-400 text-xs font-mono p-2 rounded max-w-xs">
        <div className="font-bold mb-1 text-white">DEBUG 5174</div>
        {debug.length===0 && <div className="text-gray-500">等待...</div>}
        {debug.map((d,i)=><div key={i}>{d}</div>)}
        {agentTasks.length>0 && <div className="text-yellow-400 mt-1">Agent: {minedCount} done, {queuedCount} queued</div>}
        <div className="text-orange-400 mt-1">Artifacts: {artifacts.length}</div>
      </div>
    </div>
  )
}
