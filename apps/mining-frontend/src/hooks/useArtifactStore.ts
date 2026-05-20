import { useState, useCallback, useEffect } from 'react'

export interface Artifact {
  id: string
  taskId: string
  taskLabel: string
  moduleName: string
  type: 'preview' | 'source' | 'resource' | 'link' | 'video' | 'image'
  title: string
  description: string
  url: string
  thumbnail?: string
  size: string
  createdAt: string
  agentName: string
}

const STORAGE_KEY = 'dream-artifacts'

// Counter for unique IDs within a session
let _artifactCounter = 0

function generateArtifact(task: { id: string; label: string; moduleName: string; agentName: string; reward: number }): Artifact[] {
  const now = new Date().toLocaleString('zh-CN')
  const mod = task.moduleName.toLowerCase()
  const artifacts: Artifact[] = []

  _artifactCounter++

  if (mod.includes('theme') || mod.includes('romance') || mod.includes('page')) {
    artifacts.push({
      id: `artifact-${_artifactCounter}-preview-${task.id}`,
      taskId: task.id,
      taskLabel: task.label,
      moduleName: task.moduleName,
      type: 'preview',
      title: `${task.label} — 页面预览`,
      description: `Agent ${task.agentName} 完成的前端页面预览`,
      url: `/artifacts/${task.id}/preview.html`,
      thumbnail: '',
      size: '1.2 MB',
      createdAt: now,
      agentName: task.agentName,
    })
    artifacts.push({
      id: `artifact-${_artifactCounter}-source-${task.id}`,
      taskId: task.id,
      taskLabel: task.label,
      moduleName: task.moduleName,
      type: 'source',
      title: `${task.label} — 源代码`,
      description: `生成的 React 组件源码 (TSX + CSS)`,
      url: `/artifacts/${task.id}/source.tsx`,
      size: '45 KB',
      createdAt: now,
      agentName: task.agentName,
    })
  }

  if (mod.includes('theme') || mod.includes('park') || mod.includes('romance')) {
    artifacts.push({
      id: `artifact-${_artifactCounter}-video-${task.id}`,
      taskId: task.id,
      taskLabel: task.label,
      moduleName: task.moduleName,
      type: 'video',
      title: `${task.label} — 动画演示`,
      description: `Agent ${task.agentName} 生成的动画效果视频`,
      url: `/artifacts/${task.id}/video.html`,
      thumbnail: '',
      size: '8.5 MB',
      createdAt: now,
      agentName: task.agentName,
    })
  }

  // Fallback: always generate at least a preview for any task
  if (!artifacts.length) {
    artifacts.push({
      id: `artifact-${_artifactCounter}-preview-${task.id}`,
      taskId: task.id,
      taskLabel: task.label,
      moduleName: task.moduleName,
      type: 'preview',
      title: `${task.label} — 产出物`,
      description: `Agent ${task.agentName} 完成的模块代码`,
      url: `/artifacts/${task.id}/preview.html`,
      size: '1.2 MB',
      createdAt: now,
      agentName: task.agentName,
    })
  }

  return artifacts
}

function loadArtifacts(): Artifact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveArtifacts(artifacts: Artifact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artifacts))
}

/** POST artifacts to 5173 API so they get written to project root artifacts/ folder */
async function writeArtifactsToDisk(task: { id: string; label: string; moduleName: string; agentName: string; reward: number; hash: string }, artifacts: Artifact[]) {
  try {
    const res = await fetch(`http://localhost:5173/api/artifacts/${task.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskLabel: task.label,
        moduleName: task.moduleName,
        agentName: task.agentName,
        reward: task.reward,
        hash: task.hash,
        artifacts,
      }),
    })
    const data = await res.json()
    console.log('[artifacts] written to', data.dir)
    return data
  } catch (err) {
    console.warn('[artifacts] failed to write to disk:', err)
    return null
  }
}

export function useArtifactStore() {
  const [artifacts, setArtifacts] = useState<Artifact[]>(loadArtifacts)

  // Auto-save on change
  useEffect(() => { saveArtifacts(artifacts) }, [artifacts])

  // When a task is mined, generate artifacts for it and write to disk
  const addTaskArtifacts = useCallback(async (task: { id: string; label: string; moduleName: string; agentName: string; reward: number; hash: string }) => {
    // Dedup: skip if this task already has artifacts
    if (artifacts.some((a) => a.taskId === task.id)) {
      console.log('[useArtifactStore] skipping duplicate artifacts for', task.id)
      return []
    }
    const newOnes = generateArtifact(task)
    setArtifacts((prev) => [...prev, ...newOnes])
    // Write to project root artifacts/ folder
    await writeArtifactsToDisk(task, newOnes)
    return newOnes
  }, [artifacts])

  const clearAll = useCallback(() => {
    setArtifacts([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const byTask = useCallback((taskId: string) => artifacts.filter((a) => a.taskId === taskId), [artifacts])

  return { artifacts, addTaskArtifacts, clearAll, byTask, count: artifacts.length }
}
