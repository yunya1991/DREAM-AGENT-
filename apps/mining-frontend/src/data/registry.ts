import type { FileItem } from '@marketplace/file-manager/components/FileManager'

export const mockRegistryFiles: FileItem[] = [
  {
    id: 'f1', name: 'docs', type: 'folder', path: '/docs/', children: [
      { id: 'f1-1', name: '00-AGENT-CONSTITUTION.md', type: 'file', size: 6517, modified: Date.now() - 86400000, path: '/docs/00-AGENT-CONSTITUTION.md' },
      { id: 'f1-2', name: '01-COLLABORATION-PROTOCOL.md', type: 'file', size: 6605, modified: Date.now() - 86400000, path: '/docs/01-COLLABORATION-PROTOCOL.md' },
      { id: 'f1-3', name: '02-ARCHITECTURE.md', type: 'file', size: 8920, modified: Date.now() - 86400000, path: '/docs/02-ARCHITECTURE.md' },
      { id: 'f1-4', name: '03-WORKFLOWS-AND-NORMS.md', type: 'file', size: 7543, modified: Date.now() - 86400000, path: '/docs/03-WORKFLOWS-AND-NORMS.md' },
      { id: 'f1-5', name: '04-ENGINEERING-INDEX.md', type: 'file', size: 4321, modified: Date.now() - 86400000, path: '/docs/04-ENGINEERING-INDEX.md' },
      { id: 'f1-6', name: '05-FAQ.md', type: 'file', size: 3200, modified: Date.now() - 172800000, path: '/docs/05-FAQ.md' },
      { id: 'f1-7', name: '06-SKILLS-INVENTORY.md', type: 'file', size: 5100, modified: Date.now() - 86400000, path: '/docs/06-SKILLS-INVENTORY.md' },
      { id: 'f1-8', name: '08-FILE-HEADER-PROTOCOL.md', type: 'file', size: 2800, modified: Date.now() - 86400000, path: '/docs/08-FILE-HEADER-PROTOCOL.md' },
      { id: 'f1-9', name: 'file-registry.json', type: 'file', size: 12800, modified: Date.now() - 3600000, path: '/docs/file-registry.json' },
    ],
  },
  {
    id: 'f2', name: 'SKILLS', type: 'folder', path: '/SKILLS/', children: [
      { id: 'f2-1', name: 'conflict_gate.py', type: 'file', size: 4500, modified: Date.now() - 172800000, path: '/SKILLS/dual-agent-conflict-gate/conflict_gate.py' },
      { id: 'f2-2', name: 'ledger_sync.py', type: 'file', size: 8900, modified: Date.now() - 86400000, path: '/SKILLS/collab-ledger-planner/ledger_sync.py' },
      { id: 'f2-3', name: 'decompose.py', type: 'file', size: 5200, modified: Date.now() - 86400000, path: '/SKILLS/task-decompose-blocks/decompose.py' },
    ],
  },
  {
    id: 'f3', name: 'ledger', type: 'folder', path: '/ledger/', children: [
      { id: 'f3-1', name: 'index.json', type: 'file', size: 70585, modified: Date.now() - 86400000, path: '/ledger/tasks/index.json' },
    ],
  },
  {
    id: 'f4', name: 'memory', type: 'folder', path: '/memory/', children: [
      { id: 'f4-1', name: 'index.json', type: 'file', size: 3672, modified: Date.now() - 86400000, path: '/memory/index.json' },
    ],
  },
  {
    id: 'f5', name: 'modules-marketplace', type: 'folder', path: '/modules-marketplace/', children: [
      { id: 'f5-1', name: 'INDEX.md', type: 'file', size: 2400, modified: Date.now() - 3600000, path: '/modules-marketplace/INDEX.md' },
    ],
  },
  { id: 'f6', name: 'README.md', type: 'file', size: 3200, modified: Date.now() - 172800000, path: '/README.md' },
  { id: 'f7', name: 'MANIFESTO.md', type: 'file', size: 2800, modified: Date.now() - 172800000, path: '/MANIFESTO.md' },
]
