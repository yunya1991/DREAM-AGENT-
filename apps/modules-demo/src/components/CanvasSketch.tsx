import { useState, useCallback, useEffect, useRef } from 'react'
import { parseSketch } from '../engine/SketchParser'
import { inferIntent, extractKeywords } from '../engine/IntentEngine'
import { matchTemplates } from '../engine/templates'
import { computeConfidence } from '../engine/ConfidenceScorer'
import { webResearch } from '../engine/WebResearch'
import { inferenceToTasks } from '../engine/adapter'
import { SCENE_PRESETS } from '../engine/AIDrawer'
import type { InferenceResult as InferenceResultType } from '../engine/types'
import InferenceResultPanel from './InferenceResult'
import AIDialog from './AIDialog'

interface CanvasSketchProps {
  onTasksGenerated: (tasks: import('../hooks/useBlockTasks').BlockTask[]) => void
}

export default function CanvasSketch({ onTasksGenerated }: CanvasSketchProps) {
  const [inferenceResult, setInferenceResult] = useState<InferenceResultType | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [purpose, setPurpose] = useState('')

  const apiRef = useRef<any>(null)
  const [lastDescription, setLastDescription] = useState('')

  useEffect(() => {
    let cancelled = false
    import('@excalidraw/excalidraw')
      .then((mod) => {
        if (!cancelled) {
          // @ts-ignore - CSS import, handled by Vite
          import('@excalidraw/excalidraw/index.css')
            .then(() => setExcalidrawComponent(() => mod.Excalidraw))
            .catch(() => setExcalidrawComponent(() => mod.Excalidraw))
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })
    return () => { cancelled = true }
  }, [])

  const handleAIGenerated = useCallback((elements: any[], description: string) => {
    if (apiRef.current) {
      apiRef.current.updateScene({ elements })
    }
    setLastDescription(description)
  }, [])

  /** Add a scene to the existing canvas (append, not replace) */
  const handleAddScene = useCallback((elements: any[], label: string) => {
    if (!apiRef.current) return
    const current = apiRef.current.getSceneElements()
    apiRef.current.updateScene({ elements: [...current, ...elements] })
    setLastDescription((prev) => prev ? `${prev} + ${label}` : label)
  }, [])

  /** Handle drop of scene chip onto canvas */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const sceneId = e.dataTransfer.getData('text/plain')
    const preset = SCENE_PRESETS.find((s) => s.id === sceneId)
    if (!preset || !apiRef.current) return
    // Convert drop position to Excalidraw coordinates
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const dropX = e.clientX - rect.left
    const dropY = e.clientY - rect.top
    // Offset scene to drop position (subtract default origin, add drop coords)
    const offset = (els: any[], dx: number, dy: number) =>
      els.map((el: any) => ({ ...el, x: el.x + dx, y: el.y + dy }))
    const elements = offset(preset.generate(), dropX - 400, dropY - 300)
    const current = apiRef.current.getSceneElements()
    apiRef.current.updateScene({ elements: [...current, ...elements] })
    setLastDescription((prev) => prev ? `${prev} + ${preset.label}` : preset.label)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!apiRef.current) return
    setIsAnalyzing(true)

    const elements = apiRef.current.getSceneElements()

    if (elements.length === 0) {
      setIsAnalyzing(false)
      return
    }

    // Step 1: Parse sketch structure
    const skeleton = parseSketch(elements)

    // Step 2: Infer user intent (include AI description + purpose for better matching)
    const modules = inferIntent(skeleton, lastDescription, purpose)
    const keywords = extractKeywords(skeleton)

    // Step 3: Compute confidence
    const scores = computeConfidence(skeleton, modules.length, keywords.length > 0)

    // Step 4: Match classic templates
    const templateMatches = matchTemplates(modules, keywords)
    const bestMatch = templateMatches.length > 0 && templateMatches[0].similarity >= 0.3 ? templateMatches[0] : null

    // Step 5: Web research if confidence is low
    let webResult: InferenceResultType['webResearch']
    const needsResearch = scores.overall < 60 || (bestMatch != null && bestMatch.similarity < 0.6)
    if (needsResearch && keywords.length > 0) {
      webResult = await webResearch(keywords)
    }

    // Build summary
    const moduleNames = modules.map((m) => m.label).join(' + ')
    const summary = moduleNames
      ? `识别到 ${modules.length} 个功能模块：${moduleNames}`
      : '未能识别具体功能模块，请添加文字标注'

    const result: InferenceResultType = {
      modules,
      templateMatch: bestMatch,
      overallConfidence: scores.overall,
      needsWebResearch: needsResearch,
      webResearch: webResult,
      summary,
    }

    setInferenceResult(result)
    setIsAnalyzing(false)
  }, [])

  const handleGenerateTasks = useCallback(() => {
    if (!inferenceResult) return
    const templateName = inferenceResult.templateMatch?.template.name || '自定义'
    const tasks = inferenceToTasks(inferenceResult.modules, templateName, purpose)
    onTasksGenerated(tasks)
  }, [inferenceResult, purpose, onTasksGenerated])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center text-red-500">
          <p className="text-lg font-bold mb-2">画板加载失败</p>
          <p className="text-sm text-gray-500">{loadError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left: Excalidraw canvas + AI dialog */}
      <div className="flex-1 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">
            画版设计
          </h2>
          <div className="flex-1 mx-4 flex items-center gap-2">
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="目的：你为什么要做这个？AI 将以此为导向进行架构识别..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {isAnalyzing ? '分析中...' : '识别架构'}
            </button>
          </div>
        </div>
        {ExcalidrawComponent ? (
          <div
            className="flex-1 min-h-0"
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
            onDrop={handleDrop}
          >
            <ExcalidrawComponent
              excalidrawAPI={(api: any) => { apiRef.current = api }}
              initialData={{ appState: { viewBackgroundColor: '#ffffff', currentItemFontFamily: 1 } }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">加载画板中...</div>
        )}
        {/* AI Dialog at bottom of canvas area */}
        <AIDialog
          onGenerated={handleAIGenerated}
          onAddScene={handleAddScene}
          existingElementCount={apiRef.current?.getSceneElements()?.length ?? 0}
        />
      </div>

      {/* Right: Inference result panel */}
      <div className="w-96 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {inferenceResult ? (
          <InferenceResultPanel
            result={inferenceResult}
            purpose={purpose}
            onGenerate={handleGenerateTasks}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm p-6 text-center">
            <p className="mb-2">用 AI 代画或手动绘制页面草图</p>
            <p className="mb-2">在底部输入框描述需求，AI 自动生成布局</p>
            <p>画好后点击"识别架构"生成前端方案</p>
          </div>
        )}
      </div>
    </div>
  )
}
