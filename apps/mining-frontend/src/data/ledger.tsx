export interface LedgerEntry {
  taskId: string
  title: string
  owner: string
  status: string
  score: number | null
  reward: number | null
  mode: string
  dependsCount: number
  syncItems: number
  archivedAt: string
}

export const ledgerColumns = [
  { key: 'taskId', header: '任务 ID', sortable: true, width: '50px' },
  { key: 'title', header: '标题', sortable: true },
  { key: 'owner', header: '负责人' },
  {
    key: 'status',
    header: '状态',
    render: (v: string) => {
      const colors: Record<string, string> = {
        'archived': 'text-green-600',
        'in-progress': 'text-blue-600',
        'blocked': 'text-red-600',
        'validating': 'text-yellow-600',
      }
      return <span className={`${colors[v] || 'text-gray-600'} font-medium`}>{v}</span>
    },
  },
  { key: 'score', header: '评分', sortable: true },
  { key: 'reward', header: '奖励', sortable: true, render: (v: number | null) => v != null ? `${v.toFixed(1)} DREAM` : '--' },
  { key: 'mode', header: '模式' },
  { key: 'archivedAt', header: '完成时间', sortable: true },
]

export const mockLedger: LedgerEntry[] = [
  { taskId: '1', title: 'PR#9 Central Hub v2', owner: 'Governance Agent', status: 'archived', score: 97, reward: 1.2, mode: 'default', dependsCount: 3, syncItems: 7, archivedAt: '2026-05-19' },
  { taskId: '2', title: '记忆系统全量实现', owner: 'Ledger Agent', status: 'archived', score: 95, reward: 2.1, mode: 'default', dependsCount: 1, syncItems: 22, archivedAt: '2026-05-19' },
  { taskId: '3', title: '文件头协议骨架', owner: 'Governance Agent', status: 'archived', score: 92, reward: 1.5, mode: 'default', dependsCount: 2, syncItems: 33, archivedAt: '2026-05-20' },
  { taskId: '4', title: 'Phase D.5 任务分解', owner: 'Ledger Agent', status: 'archived', score: 90, reward: 1.8, mode: 'default', dependsCount: 1, syncItems: 5, archivedAt: '2026-05-20' },
  { taskId: '5', title: 'Modules Marketplace', owner: 'Marketplace Agent', status: 'archived', score: 89, reward: 2.5, mode: 'default', dependsCount: 0, syncItems: 15, archivedAt: '2026-05-20' },
  { taskId: '6', title: '前端 Demo 工程', owner: 'Frontend Agent', status: 'validating', score: null, reward: null, mode: 'default', dependsCount: 5, syncItems: 45, archivedAt: '' },
  { taskId: '7', title: 'Dual Agent Conflict Gate', owner: 'Governance Agent', status: 'archived', score: 88, reward: 1.0, mode: 'parallel', dependsCount: 0, syncItems: 3, archivedAt: '2026-05-18' },
  { taskId: '8', title: 'Ledger Sync Script', owner: 'Ledger Agent', status: 'archived', score: 85, reward: 0.8, mode: 'efficient', dependsCount: 1, syncItems: 4, archivedAt: '2026-05-18' },
  { taskId: '9', title: 'Retrospective Engine', owner: 'Governance Agent', status: 'archived', score: 93, reward: 1.6, mode: 'default', dependsCount: 2, syncItems: 8, archivedAt: '2026-05-19' },
  { taskId: '10', title: 'Pre-flight Memory Lookup', owner: 'Ledger Agent', status: 'archived', score: 91, reward: 1.4, mode: 'default', dependsCount: 1, syncItems: 3, archivedAt: '2026-05-19' },
  { taskId: '11', title: 'Value Checker V1-V6', owner: 'Governance Agent', status: 'archived', score: 87, reward: 0.9, mode: 'default', dependsCount: 1, syncItems: 6, archivedAt: '2026-05-19' },
  { taskId: '12', title: 'Path Optimizer', owner: 'Ledger Agent', status: 'archived', score: 84, reward: 1.1, mode: 'parallel', dependsCount: 1, syncItems: 4, archivedAt: '2026-05-19' },
  { taskId: '13', title: 'Pattern Matcher', owner: 'Governance Agent', status: 'archived', score: 86, reward: 1.0, mode: 'default', dependsCount: 1, syncItems: 5, archivedAt: '2026-05-19' },
  { taskId: '14', title: 'Evolution Metrics', owner: 'Ledger Agent', status: 'archived', score: 82, reward: 0.7, mode: 'efficient', dependsCount: 1, syncItems: 2, archivedAt: '2026-05-19' },
  { taskId: '15', title: 'Header Verification', owner: 'Governance Agent', status: 'archived', score: 90, reward: 1.3, mode: 'default', dependsCount: 0, syncItems: 33, archivedAt: '2026-05-20' },
  { taskId: '16', title: 'Workflow Documentation', owner: 'Ledger Agent', status: 'archived', score: 88, reward: 0.6, mode: 'efficient', dependsCount: 0, syncItems: 2, archivedAt: '2026-05-18' },
  { taskId: '17', title: 'SKILL: Decompose Blocks', owner: 'Governance Agent', status: 'archived', score: 91, reward: 1.5, mode: 'default', dependsCount: 2, syncItems: 4, archivedAt: '2026-05-20' },
  { taskId: '18', title: 'FAQ Construction', owner: 'Ledger Agent', status: 'archived', score: 79, reward: 0.5, mode: 'efficient', dependsCount: 0, syncItems: 1, archivedAt: '2026-05-18' },
  { taskId: '19', title: 'Gitignore Cleanup', owner: 'Governance Agent', status: 'archived', score: 75, reward: 0.3, mode: 'efficient', dependsCount: 0, syncItems: 1, archivedAt: '2026-05-20' },
  { taskId: '20', title: 'Mining Frontend', owner: 'Frontend Agent', status: 'in-progress', score: null, reward: null, mode: 'default', dependsCount: 6, syncItems: 0, archivedAt: '' },
]
