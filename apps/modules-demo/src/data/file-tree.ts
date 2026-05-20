import type { FileItem } from '@marketplace/file-manager/components/FileManager'

export const mockFileTree: FileItem[] = [
  {
    id: '1', name: 'docs', type: 'folder', path: '/docs/', children: [
      { id: '1-1', name: '00-AGENT-CONSTITUTION.md', type: 'file', size: 6517, modified: Date.now() - 86400000, path: '/docs/00-AGENT-CONSTITUTION.md' },
      { id: '1-2', name: '01-COLLABORATION-PROTOCOL.md', type: 'file', size: 6605, modified: Date.now() - 86400000, path: '/docs/01-COLLABORATION-PROTOCOL.md' },
      { id: '1-3', name: '02-ARCHITECTURE.md', type: 'file', size: 8920, modified: Date.now() - 86400000, path: '/docs/02-ARCHITECTURE.md' },
      { id: '1-4', name: '03-WORKFLOWS-AND-NORMS.md', type: 'file', size: 7543, modified: Date.now() - 86400000, path: '/docs/03-WORKFLOWS-AND-NORMS.md' },
      { id: '1-5', name: '04-ENGINEERING-INDEX.md', type: 'file', size: 4321, modified: Date.now() - 86400000, path: '/docs/04-ENGINEERING-INDEX.md' },
      { id: '1-6', name: 'file-registry.json', type: 'file', size: 12800, modified: Date.now() - 3600000, path: '/docs/file-registry.json' },
    ],
  },
  {
    id: '2', name: 'modules-marketplace', type: 'folder', path: '/modules-marketplace/', children: [
      {
        id: '2-1', name: 'dashboard', type: 'folder', path: '/modules-marketplace/dashboard/', children: [
          { id: '2-1-1', name: 'BLOCK.md', type: 'file', size: 1800, modified: Date.now() - 7200000, path: '/modules-marketplace/dashboard/BLOCK.md' },
          { id: '2-1-2', name: 'Dashboard.tsx', type: 'file', size: 7200, modified: Date.now() - 7200000, path: '/modules-marketplace/dashboard/components/Dashboard.tsx' },
        ],
      },
      { id: '2-2', name: 'quote-panel', type: 'folder', path: '/modules-marketplace/quote-panel/', children: [
        { id: '2-2-1', name: 'BLOCK.md', type: 'file', size: 1600, modified: Date.now() - 7200000, path: '/modules-marketplace/quote-panel/BLOCK.md' },
        { id: '2-2-2', name: 'QuotePanel.tsx', type: 'file', size: 6800, modified: Date.now() - 7200000, path: '/modules-marketplace/quote-panel/components/QuotePanel.tsx' },
      ]},
      { id: '2-3', name: 'data-table', type: 'folder', path: '/modules-marketplace/data-table/', children: [
        { id: '2-3-1', name: 'BLOCK.md', type: 'file', size: 1500, modified: Date.now() - 7200000, path: '/modules-marketplace/data-table/BLOCK.md' },
        { id: '2-3-2', name: 'DataTable.tsx', type: 'file', size: 8200, modified: Date.now() - 7200000, path: '/modules-marketplace/data-table/components/DataTable.tsx' },
      ]},
      { id: '2-4', name: 'file-manager', type: 'folder', path: '/modules-marketplace/file-manager/', children: [] },
      { id: '2-5', name: 'notification', type: 'folder', path: '/modules-marketplace/notification/', children: [] },
    ],
  },
  {
    id: '3', name: 'ledger', type: 'folder', path: '/ledger/', children: [
      { id: '3-1', name: 'index.json', type: 'file', size: 70585, modified: Date.now() - 86400000, path: '/ledger/tasks/index.json' },
    ],
  },
  {
    id: '4', name: 'memory', type: 'folder', path: '/memory/', children: [
      { id: '4-1', name: 'index.json', type: 'file', size: 3672, modified: Date.now() - 86400000, path: '/memory/index.json' },
    ],
  },
  {
    id: '5', name: 'SKILLS', type: 'folder', path: '/SKILLS/', children: [
      { id: '5-1', name: 'conflict_gate.py', type: 'file', size: 4500, modified: Date.now() - 172800000, path: '/SKILLS/dual-agent-conflict-gate/conflict_gate.py' },
      { id: '5-2', name: 'ledger_sync.py', type: 'file', size: 8900, modified: Date.now() - 86400000, path: '/SKILLS/collab-ledger-planner/ledger_sync.py' },
    ],
  },
  { id: '6', name: 'README.md', type: 'file', size: 3200, modified: Date.now() - 172800000, path: '/README.md' },
  { id: '7', name: 'MANIFESTO.md', type: 'file', size: 2800, modified: Date.now() - 172800000, path: '/MANIFESTO.md' },
]
