import React, { useState, useCallback } from 'react'
import { Notification, FileManager } from './marketplace'
import { Tabs } from './components/Tabs'
import { MiningStatus } from './components/MiningStatus'
import { ChainViz } from './components/ChainViz'
import { DAGGraph } from './components/DAGGraph'
import { LedgerFeed } from './components/LedgerFeed'
import { MemoryTimeline } from './components/MemoryTimeline'
import { MiningActivityFeed } from './components/MiningActivity'
import { useMiningSim } from './hooks/useMiningSim'
import { mockBlocks } from './data/blocks'
import { mockRegistryFiles } from './data/registry'

const TABS = ['区块链', 'DAG 依赖', '账本', '记忆系统', '文件结构']

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const { isMining, progress, activities, startMining, stopMining } = useMiningSim()

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Mining Network
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            DREAM Collaboration Blockchain — {mockBlocks.length} blocks
          </span>
        </div>
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      </header>

      {/* Mining Status */}
      <MiningStatus
        isMining={isMining}
        progress={progress}
        onStart={startMining}
        onStop={stopMining}
      />

      {/* Tab Content */}
      {activeTab === '区块链' && (
        <div className="bg-gray-50 dark:bg-gray-900">
          <ChainViz blocks={mockBlocks} miningHeight={isMining ? mockBlocks.length : null} miningProgress={progress} />
          <MiningActivityFeed activities={activities} />
        </div>
      )}
      {activeTab === 'DAG 依赖' && (
        <div className="bg-gray-50 dark:bg-gray-900">
          <DAGGraph />
        </div>
      )}
      {activeTab === '账本' && (
        <div className="bg-gray-50 dark:bg-gray-900">
          <LedgerFeed />
        </div>
      )}
      {activeTab === '记忆系统' && (
        <div className="bg-gray-50 dark:bg-gray-900">
          <MemoryTimeline />
        </div>
      )}
      {activeTab === '文件结构' && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4">
          <FileManager
            files={mockRegistryFiles}
            rootName="DREAM-AG协作协议"
          />
        </div>
      )}

      <Notification position="top-right" />
    </div>
  )
}
