export interface MemoryEvent {
  id: string
  taskId: string
  type: 'episode' | 'lesson' | 'retrospective' | 'value-check'
  timestamp: string
  summary: string
  score?: number
  pathEfficiency?: number
  category?: string
}

export const mockMemoryEvents: MemoryEvent[] = [
  { id: 'm1', taskId: '2', type: 'episode', timestamp: '2026-05-19 14:30', summary: '记忆系统端到端测试完成', score: 95, pathEfficiency: 0.88 },
  { id: 'm2', taskId: '2', type: 'lesson', timestamp: '2026-05-19 14:32', summary: 'decompose.py 路径解析修复：需检查 workspace 是否存在', category: 'environment_pitfall' },
  { id: 'm3', taskId: '3', type: 'retrospective', timestamp: '2026-05-20 08:15', summary: '文件头协议验证通过，33/33 文件有效', score: 92 },
  { id: 'm4', taskId: '7', type: 'lesson', timestamp: '2026-05-18 16:00', summary: '冲突门需要支持共享文件白名单', category: 'contract_violation' },
  { id: 'm5', taskId: '9', type: 'episode', timestamp: '2026-05-19 12:00', summary: '回溯引擎首次生成 lesson 3 条', score: 93 },
  { id: 'm6', taskId: '11', type: 'value-check', timestamp: '2026-05-19 13:00', summary: 'V1 客户至上检查通过', score: 100 },
  { id: 'm7', taskId: '11', type: 'value-check', timestamp: '2026-05-19 13:01', summary: 'V4 透明度检查：PR 评论指针正确', score: 95 },
  { id: 'm8', taskId: '13', type: 'lesson', timestamp: '2026-05-19 11:30', summary: '模式匹配发现：多个文件修改同一函数 → 需要冲突检测', category: 'environment_pitfall' },
  { id: 'm9', taskId: '17', type: 'retrospective', timestamp: '2026-05-20 09:00', summary: 'Phase D.5 区块分解 SKILL 验证完成', score: 91 },
  { id: 'm10', taskId: '12', type: 'episode', timestamp: '2026-05-19 15:00', summary: '路径优化器首次运行，实际路径 vs 最优路径偏差 12%', score: 84, pathEfficiency: 0.88 },
]
