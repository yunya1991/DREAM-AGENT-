import { useState, useCallback, useRef } from 'react'
import { generateFromDescription, SCENE_PRESETS, offsetElements } from '../engine/AIDrawer'

interface Props {
  onGenerated: (elements: any[], description: string) => void
  onAddScene: (elements: any[], label: string) => void
  existingElementCount: number
}

const SUGGESTIONS = [
  '520，爱心和花送给女朋友',
  '迪士尼乐园，小女孩走过城堡',
  '小女孩穿过公园，有树和花',
  '情侣散步，有花和礼物',
  '城堡和探险地图',
  '动画工作室，卡通角色设计',
  '社交动态，好友聊天气泡',
  '图片画廊，网格布局展示照片',
]

export default function AIDialog({ onGenerated, onAddScene, existingElementCount }: Props) {
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showScenes, setShowScenes] = useState(false)
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return
    setIsGenerating(true)
    setError(null)
    try {
      const desc = input.trim()
      const elements = await generateFromDescription(desc)
      if (elements.length === 0) {
        setError('未能生成布局，请换一种描述')
      } else {
        onGenerated(elements, desc)
        setInput('')
      }
    } catch (e: any) {
      setError(e.message || '生成失败')
    } finally {
      setIsGenerating(false)
    }
  }, [input, onGenerated])

  const handleSuggestion = useCallback((s: string) => {
    setInput(s)
  }, [])

  /** Click a scene chip: add to canvas at default position */
  const handleSceneClick = useCallback((sceneId: string) => {
    const preset = SCENE_PRESETS.find((s) => s.id === sceneId)
    if (!preset) return
    // Place below existing content, or at origin
    const dy = existingElementCount > 0 ? 650 : 0
    const elements = offsetElements(preset.generate(), 0, dy)
    onAddScene(elements, preset.label)
  }, [existingElementCount, onAddScene])

  /** Start dragging a scene from the panel */
  const handleDragStart = useCallback((e: React.DragEvent, sceneId: string) => {
    dragState.current = { id: sceneId, offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY }
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', sceneId)
  }, [])

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">AI 代画：</span>
        <button
          onClick={() => setShowScenes(!showScenes)}
          className="text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          {showScenes ? '收起场景' : '+ 添加场景'}
        </button>
      </div>

      {/* Scene chips — expandable panel */}
      {showScenes && (
        <div className="mb-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-400 mb-1.5">点击添加 / 拖拽到画布</div>
          <div className="flex flex-wrap gap-1.5">
            {SCENE_PRESETS.map((s) => (
              <button
                key={s.id}
                draggable
                onDragStart={(e) => handleDragStart(e, s.id)}
                onClick={() => handleSceneClick(s.id)}
                className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-700 dark:text-gray-300 cursor-grab active:cursor-grabbing"
                title={`点击添加到画布，或拖拽到指定位置`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 truncate max-w-[200px]"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input + button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) handleGenerate() }}
          placeholder="描述你想要的页面布局..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
        >
          {isGenerating ? '生成中...' : 'AI 代画'}
        </button>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-500">{error}</div>
      )}
    </div>
  )
}
