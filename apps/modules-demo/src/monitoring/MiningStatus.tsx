import { Pickaxe, Coins, Users, Play, Square } from 'lucide-react'
import { mockBlocks } from './data/blocks'

interface MiningStatusProps {
  isMining: boolean
  progress: number
  onStart: () => void
  onStop: () => void
}

export function MiningStatus({ isMining, progress, onStart, onStop }: MiningStatusProps) {
  const minedBlocks = mockBlocks.filter((b) => b.status === 'mined').length
  const totalReward = mockBlocks.reduce((sum, b) => sum + b.reward, 0)
  const activeAgents = 5

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Pickaxe className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">已挖区块</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{minedBlocks}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">总奖励</div>
              <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{totalReward.toFixed(1)} DREAM</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">活跃 Agent</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{activeAgents}</div>
            </div>
          </div>
        </div>

        {/* Mining controls */}
        <div className="flex items-center gap-3">
          {isMining && (
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100 animate-chain-pulse"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
            </div>
          )}
          {!isMining ? (
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              开始挖矿
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              停止
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
