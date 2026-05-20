import { useMemo, useEffect } from 'react'
import { DataTable } from '../marketplace'
import type { Column } from '../marketplace'
import { useBlockTasks } from '../hooks/useBlockTasks'
import type { BlockTask } from '../hooks/useBlockTasks'

interface BlockTaskBoardProps {
  initialTasks?: BlockTask[] | null
}

function statusBadge(value: string) {
  const map: Record<string, string> = {
    pending: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    mining: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    mined: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  }
  const labelMap: Record<string, string> = { pending: '待处理', mining: '挖矿中', mined: '已完成' }
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[value] || ''}">${labelMap[value] || value}</span>`
}

function progressBar(value: number) {
  if (value <= 0) return '-'
  if (value >= 100) return '<span class="text-green-600">100%</span>'
  return `<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-blue-500 h-2 rounded-full transition-all" style="width:${value.toFixed(0)}%"></div></div><span class="text-xs text-gray-500">${value.toFixed(0)}%</span>`
}

const columns: Column[] = [
  { key: 'label', header: '任务', sortable: true },
  { key: 'proposer', header: '提议者', sortable: true },
  { key: 'status', header: '状态', sortable: true, render: statusBadge },
  { key: 'progress', header: '进度', render: progressBar },
  { key: 'reward', header: '奖励(DREAM)', sortable: true, render: (v) => (v === 0 ? '-' : `${v}`) },
  { key: 'hash', header: 'Hash', render: (v) => (v ? `<code class="text-xs font-mono text-purple-600 dark:text-purple-400">${v}</code>` : '-') },
  { key: 'dependsOn', header: '依赖', render: (v: string[]) => (v.length === 0 ? '无' : `${v.length} 项`) },
]

export default function BlockTaskBoard({ initialTasks }: BlockTaskBoardProps) {
  const { tasks, mineAll, resetAll, resetToTasks } = useBlockTasks()

  // When tasks are generated from canvas, replace the default tasks
  useEffect(() => {
    if (initialTasks && initialTasks.length > 0) {
      resetToTasks(initialTasks)
    }
  }, [initialTasks, resetToTasks])

  const minedCount = tasks.filter((t) => t.status === 'mined').length
  const miningCount = tasks.filter((t) => t.status === 'mining').length

  const tableData = useMemo(
    () =>
      tasks.map((t) => ({
        ...t,
        dependsOn: t.dependsOn.length,
      })),
    [tasks],
  )

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">协作任务链</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
          前端功能区块 → 区块链挖矿任务 | 已完成 {minedCount}/{tasks.length} | 进行中 {miningCount}
        </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={mineAll}
            disabled={miningCount > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            一键挖矿
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      {/* Dependency map */}
      <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">依赖关系</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          {tasks
            .filter((t) => t.dependsOn.length > 0)
            .map((t) => (
              <span key={t.id} className="text-gray-600 dark:text-gray-400">
                {t.dependsOn
                  .map((depId) => {
                    const dep = tasks.find((x) => x.id === depId)
                    return dep?.label || depId
                  })
                  .join(' + ')}{' '}
                → <span className="font-medium text-gray-800 dark:text-gray-200">{t.label}</span>
              </span>
            ))}
          <span className="text-gray-400">Dashboard, FileManager, Notification → 无依赖（可独立挖矿）</span>
        </div>
      </div>

      <DataTable columns={columns} data={tableData} />
    </div>
  )
}
