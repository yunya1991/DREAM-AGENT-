import { useState } from 'react'
import { Block } from './data/blocks'
import { Link, Shield, Hash, Clock } from 'lucide-react'

interface ChainVizProps {
  blocks: Block[]
  miningHeight?: number | null
  miningProgress?: number
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  mined: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-300 dark:border-green-700' },
  validating: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700' },
  pending: { bg: 'bg-gray-50 dark:bg-gray-700/30', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-600' },
}

export function ChainViz({ blocks, miningHeight, miningProgress }: ChainVizProps) {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-start gap-0 min-w-max">
        {blocks.map((block, i) => {
          const colors = STATUS_COLORS[block.status]
          const isMining = block.status === 'validating'
          const isSelected = selectedBlock === block.height

          return (
            <React.Fragment key={block.height}>
              {/* Block */}
              <button
                onClick={() => setSelectedBlock(isSelected ? null : block.height)}
                className={`flex-shrink-0 w-48 rounded-lg border-2 ${colors.border} ${colors.bg} p-3 text-left transition-all ${
                  isMining ? 'animate-mining-glow' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${colors.text}`}>
                    #{block.height}
                  </span>
                  <Shield className={`w-3.5 h-3.5 ${colors.text}`} />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {block.taskTitle}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Hash className="w-3 h-3" />
                  <span className="truncate">{block.hash}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500">{block.proposer}</span>
                  <span className={`font-medium ${colors.text}`}>
                    {block.score > 0 ? `${block.score}分` : block.status}
                  </span>
                </div>
                {block.reward > 0 && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    +{block.reward.toFixed(1)} DREAM
                  </div>
                )}
                {isMining && miningProgress != null && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{ width: `${miningProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-500 mt-0.5">{Math.round(miningProgress)}%</span>
                  </div>
                )}
              </button>

              {/* Connector */}
              {i < blocks.length - 1 && (
                <div className="flex-shrink-0 flex items-center px-1 pt-8">
                  <Link className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Selected Block Details */}
      {selectedBlock != null && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
          {(() => {
            const block = blocks.find((b) => b.height === selectedBlock)
            if (!block) return null
            return (
              <div className="grid grid-cols-4 gap-4">
                <div><span className="text-gray-500">高度</span><div className="font-medium">#{block.height}</div></div>
                <div><span className="text-gray-500">提案者</span><div className="font-medium">{block.proposer}</div></div>
                <div><span className="text-gray-500">文件数</span><div className="font-medium">{block.fileCount}</div></div>
                <div><span className="text-gray-500">状态</span><div className="font-medium">{block.status}</div></div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
