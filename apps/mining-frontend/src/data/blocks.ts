export interface Block {
  height: number
  hash: string
  prevHash: string
  timestamp: string
  proposer: string
  taskTitle: string
  score: number
  reward: number
  fileCount: number
  status: 'mined' | 'pending' | 'validating'
}

export const mockBlocks: Block[] = [
  { height: 0, hash: '0x0000...0000', prevHash: '0x0000...0000', timestamp: '2026-05-19', proposer: 'genesis', taskTitle: '创世区块', score: 100, reward: 0, fileCount: 0, status: 'mined' },
  { height: 1, hash: '0xa1b2c3d4', prevHash: '0x0000...0000', timestamp: '2026-05-19', proposer: 'Governance Agent', taskTitle: 'PR#9 Central Hub v2', score: 97, reward: 1.2, fileCount: 7, status: 'mined' },
  { height: 2, hash: '0xe5f6a7b8', prevHash: '0xa1b2c3d4', timestamp: '2026-05-19', proposer: 'Ledger Agent', taskTitle: '记忆系统全量实现', score: 95, reward: 2.1, fileCount: 15, status: 'mined' },
  { height: 3, hash: '0xc9d0e1f2', prevHash: '0xe5f6a7b8', timestamp: '2026-05-20', proposer: 'Governance Agent', taskTitle: '文件头协议骨架', score: 92, reward: 1.5, fileCount: 33, status: 'mined' },
  { height: 4, hash: '0x3456abcd', prevHash: '0xc9d0e1f2', timestamp: '2026-05-20', proposer: 'Ledger Agent', taskTitle: 'Phase D.5 任务分解区块', score: 90, reward: 1.8, fileCount: 5, status: 'mined' },
  { height: 5, hash: '0x7890ef01', prevHash: '0x3456abcd', timestamp: '2026-05-20', proposer: 'Marketplace Agent', taskTitle: 'Modules Marketplace 5模块', score: 89, reward: 2.5, fileCount: 15, status: 'mined' },
  { height: 6, hash: '0x2345fedc', prevHash: '0x7890ef01', timestamp: '2026-05-20', proposer: 'Frontend Agent', taskTitle: '前端 Demo 工程搭建', score: 0, reward: 0, fileCount: 0, status: 'validating' },
]
