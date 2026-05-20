import type { Artifact } from '../hooks/useArtifactStore'

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  preview: { icon: '🖥️', color: 'text-blue-600 dark:text-blue-400', label: '页面预览' },
  source: { icon: '📦', color: 'text-purple-600 dark:text-purple-400', label: '源代码' },
  video: { icon: '🎬', color: 'text-pink-600 dark:text-pink-400', label: '动画演示' },
  image: { icon: '🖼️', color: 'text-green-600 dark:text-green-400', label: '图片资源' },
  link: { icon: '🔗', color: 'text-cyan-600 dark:text-cyan-400', label: '链接' },
  resource: { icon: '📎', color: 'text-orange-600 dark:text-orange-400', label: '资源文件' },
}


interface Props {
  artifacts: Artifact[]
  onClear: () => void
}

export default function ArtifactsPanel({ artifacts, onClear }: Props) {
  if (artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
        <p className="text-4xl mb-3">📂</p>
        <p>产物仓库为空</p>
        <p className="mt-1">Agent 完成任务后会自动生成产物</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">产物仓库 ({artifacts.length})</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Agent 完成任务后自动生成的产物，点击即可获取</p>
        </div>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-sm font-medium transition-colors"
        >
          清空产物
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {artifacts.map((a) => {
          const meta = TYPE_META[a.type] || { icon: '📄', color: 'text-gray-600', label: '文件' }
          return (
            <div
              key={a.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Type badge */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="text-lg">{meta.icon}</span>
                <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                <span className="text-xs text-gray-400 ml-auto">{a.size}</span>
              </div>

              {/* Title */}
              <div className="px-4 pb-2">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{a.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.description}</p>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-2 px-4 pb-2 text-xs text-gray-400">
                <span>来源: {a.taskLabel}</span>
                <span>•</span>
                <span>{a.agentName}</span>
                <span>•</span>
                <span>{a.createdAt}</span>
              </div>

              {/* Action */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  获取此产物 →
                </a>
                <code className="text-[10px] text-gray-400 font-mono truncate ml-2 max-w-[200px]" title={a.url}>
                  {a.url}
                </code>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
