import type { InferenceResult } from '../engine/types'

function confColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-500'
}

function confBg(score: number): string {
  if (score >= 80) return 'bg-green-100 dark:bg-green-900'
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900'
  return 'bg-red-100 dark:bg-red-900'
}

function confLabel(score: number): string {
  if (score >= 80) return '高置信'
  if (score >= 60) return '中置信'
  return '低置信'
}

interface Props {
  result: InferenceResult
  purpose?: string
  onGenerate: () => void
}

export default function InferenceResult({ result, purpose, onGenerate }: Props) {
  const { modules, templateMatch, overallConfidence, webResearch, summary } = result

  return (
    <div className="p-4 space-y-4">
      {/* Purpose */}
      {purpose && (
        <div className="rounded-lg p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">目的导向</div>
          <p className="text-sm text-blue-800 dark:text-blue-300">{purpose}</p>
        </div>
      )}

      {/* Summary */}
      <div>
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">识别结果</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{summary}</p>
      </div>

      {/* Confidence */}
      <div className={`rounded-lg p-3 ${confBg(overallConfidence)}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">整体置信度</span>
          <span className={`text-lg font-bold ${confColor(overallConfidence)}`}>{overallConfidence}%</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{confLabel(overallConfidence)}</div>
      </div>

      {/* Inferred Modules */}
      {modules.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">推断模块</h4>
          <div className="space-y-2">
            {modules.map((m, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.label}</span>
                  <span className={`text-xs font-bold ${confColor(m.confidence * 100)}`}>{Math.round(m.confidence * 100)}%</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">组件: {m.module}</div>
                {m.dependsOn.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">依赖: {m.dependsOn.join(', ')}</div>
                )}
                {m.evidence.length > 0 && (
                  <div className="text-xs text-blue-500 mt-1">{m.evidence[0]}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Match */}
      {templateMatch && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">匹配模版</h4>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{templateMatch.template.name}</span>
              <span className="text-xs font-bold text-blue-600">{Math.round(templateMatch.similarity * 100)}%</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{templateMatch.template.description}</div>
            {templateMatch.missingModules.length > 0 && (
              <div className="text-xs text-yellow-600 mt-1">
                建议补充: {templateMatch.missingModules.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Web Research */}
      {webResearch && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            联网参考 <span className="text-xs font-normal text-gray-400">(搜索: {webResearch.query})</span>
          </h4>
          <div className="space-y-1">
            {webResearch.industryPatterns.map((p, i) => (
              <div key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded p-2 border border-gray-100 dark:border-gray-700">
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No modules found */}
      {modules.length === 0 && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
          未识别到功能模块。请尝试：
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>画矩形并在内部标注文字（如"行情""订单"）</li>
            <li>用箭头连接表示依赖关系</li>
          </ul>
        </div>
      )}

      {/* Generate button */}
      {modules.length > 0 && (
        <button
          onClick={onGenerate}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
        >
          生成任务链
        </button>
      )}
    </div>
  )
}
