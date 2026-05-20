import React, { useMemo, useState, useCallback } from 'react'

interface FileNode {
  id: string
  label: string
  type: string
  depends: string[]
}

const TYPE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  constitution: { fill: '#7c3aed20', stroke: '#7c3aed', text: '#7c3aed' },
  protocol: { fill: '#3b82f620', stroke: '#3b82f6', text: '#3b82f6' },
  architecture: { fill: '#06b6d420', stroke: '#06b6d4', text: '#06b6d4' },
  workflow: { fill: '#10b98120', stroke: '#10b981', text: '#10b981' },
  design: { fill: '#f59e0b20', stroke: '#f59e0b', text: '#f59e0b' },
  spec: { fill: '#ef444420', stroke: '#ef4444', text: '#ef4444' },
  script: { fill: '#84cc1620', stroke: '#84cc16', text: '#84cc16' },
  skill: { fill: '#ec489920', stroke: '#ec4899', text: '#ec4899' },
  ledger: { fill: '#6366f120', stroke: '#6366f1', text: '#6366f1' },
  memory: { fill: '#14b8a620', stroke: '#14b8a6', text: '#14b8a6' },
  index: { fill: '#64748b20', stroke: '#64748b', text: '#64748b' },
  reference: { fill: '#78716c20', stroke: '#78716c', text: '#78716c' },
  entry: { fill: '#47556920', stroke: '#475569', text: '#475569' },
  manifesto: { fill: '#d946ef20', stroke: '#d946ef', text: '#d946ef' },
  config: { fill: '#a855f720', stroke: '#a855f7', text: '#a855f7' },
  metrics: { fill: '#0ea5e920', stroke: '#0ea5e9', text: '#0ea5e9' },
}

// Simplified file registry data with dependencies
const REGISTRY_NODES: FileNode[] = [
  { id: '00', label: 'CONSTITUTION', type: 'constitution', depends: [] },
  { id: '01', label: 'PROTOCOL', type: 'protocol', depends: ['00'] },
  { id: '02', label: 'ARCHITECTURE', type: 'architecture', depends: ['00', '01'] },
  { id: '03', label: 'WORKFLOWS', type: 'workflow', depends: ['00', '01', '02'] },
  { id: '04', label: 'ENGINEERING', type: 'index', depends: ['00', '01', '02'] },
  { id: '05', label: 'FAQ', type: 'reference', depends: ['01'] },
  { id: '06', label: 'SKILLS', type: 'reference', depends: ['01'] },
  { id: 'MANIFESTO', label: 'MANIFESTO', type: 'manifesto', depends: ['00'] },
  { id: 'LEDGER', label: 'LEDGER', type: 'ledger', depends: ['01'] },
  { id: 'MEMORY', label: 'MEMORY', type: 'memory', depends: ['00'] },
  { id: 'CONFLICT', label: 'CONFLICT_GATE', type: 'script', depends: ['01'] },
  { id: 'LOOKUP', label: 'MEMORY_LOOKUP', type: 'script', depends: ['MEMORY'] },
  { id: 'RETRO', label: 'RETROSPECTIVE', type: 'script', depends: ['MEMORY'] },
  { id: 'VALUE', label: 'VALUE_CHECKER', type: 'script', depends: ['00'] },
  { id: 'DECOMPOSE', label: 'DECOMPOSE', type: 'skill', depends: ['01'] },
  { id: 'HEADERS', label: 'FILE_HEADERS', type: 'spec', depends: ['04'] },
  { id: 'VERIFY', label: 'VERIFY_HEADERS', type: 'script', depends: ['HEADERS'] },
  { id: 'EVOLUTION', label: 'EVOLUTION', type: 'metrics', depends: ['RETRO'] },
  { id: 'PATTERN', label: 'PATTERN_MATCHER', type: 'script', depends: ['MEMORY'] },
  { id: 'PATH', label: 'PATH_OPTIMIZER', type: 'script', depends: ['MEMORY'] },
  { id: 'GATECONFIG', label: 'GATEKEEPER', type: 'config', depends: ['CONFLICT'] },
  { id: 'DUAL', label: 'DUAL_AGENT', type: 'design', depends: ['00'] },
  { id: 'V1DESIGN', label: 'V1_DESIGN', type: 'design', depends: ['DUAL'] },
  { id: 'V1PLAN', label: 'V1_IMPL', type: 'plan', depends: ['V1DESIGN'] },
  { id: 'V1GOV', label: 'V1_GOVERNANCE', type: 'plan', depends: ['V1DESIGN'] },
  { id: 'LCDESIGN', label: 'LIFECYCLE', type: 'design', depends: ['00', '01'] },
  { id: 'LCPLAN', label: 'LIFECYCLE_IMPL', type: 'plan', depends: ['LCDESIGN'] },
  { id: 'EFF', label: 'EFFICIENT_MODE', type: 'protocol', depends: ['00', '01'] },
  { id: 'LEDGGOV', label: 'LEDGER_VS_GOV', type: 'spec', depends: ['00'] },
  { id: 'V1GOCYC', label: 'V1_GOV_CYCLE', type: 'plan', depends: ['V1DESIGN'] },
]

function computeRanks(nodes: FileNode[]): Map<string, number> {
  const rankMap = new Map<string, number>()
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  function getRank(id: string, visited: Set<string>): number {
    if (rankMap.has(id)) return rankMap.get(id)!
    if (visited.has(id)) return 0
    visited.add(id)
    const node = nodeMap.get(id)
    if (!node || node.depends.length === 0) {
      rankMap.set(id, 0)
      return 0
    }
    const maxDepRank = Math.max(...node.depends.map((d) => getRank(d, visited)))
    rankMap.set(id, maxDepRank + 1)
    return maxDepRank + 1
  }

  nodes.forEach((n) => getRank(n.id, new Set()))
  return rankMap
}

export function DAGGraph() {
  const ranks = useMemo(() => computeRanks(REGISTRY_NODES), [])

  const nodesByRank = useMemo(() => {
    const groups: Map<number, FileNode[]> = new Map()
    REGISTRY_NODES.forEach((node) => {
      const rank = ranks.get(node.id) ?? 0
      if (!groups.has(rank)) groups.set(rank, [])
      groups.get(rank)!.push(node)
    })
    return groups
  }, [ranks])

  const maxRank = Math.max(...nodesByRank.keys())
  const NODE_W = 120
  const NODE_H = 32
  const RANK_GAP = 180
  const NODE_GAP = 44
  const PADDING = 40

  const svgWidth = (maxRank + 1) * RANK_GAP + PADDING * 2
  const maxNodesInRank = Math.max(...nodesByRank.values().map((v) => v.length))
  const svgHeight = maxNodesInRank * NODE_GAP + PADDING * 2

  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>()
    nodesByRank.forEach((nodes, rank) => {
      const totalH = nodes.length * NODE_GAP
      const startY = (svgHeight - totalH) / 2 + NODE_GAP / 2
      nodes.forEach((node, i) => {
        positions.set(node.id, {
          x: PADDING + rank * RANK_GAP,
          y: startY + i * NODE_GAP,
        })
      })
    })
    return positions
  }, [nodesByRank, svgHeight])

  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const highlightedUpstream = useMemo(() => {
    if (!highlightedId) return new Set<string>()
    const upstream = new Set<string>()
    const visit = (id: string) => {
      if (upstream.has(id)) return
      upstream.add(id)
      const node = REGISTRY_NODES.find((n) => n.id === id)
      node?.depends.forEach(visit)
    }
    visit(highlightedId)
    return upstream
  }, [highlightedId])

  const highlightedDownstream = useMemo(() => {
    if (!highlightedId) return new Set<string>()
    const downstream = new Set<string>()
    const visit = (id: string) => {
      if (downstream.has(id)) return
      downstream.add(id)
      REGISTRY_NODES.filter((n) => n.depends.includes(id)).forEach((n) => visit(n.id))
    }
    visit(highlightedId)
    return downstream
  }, [highlightedId])

  const isHighlighted = useCallback((id: string) => {
    if (!highlightedId) return false
    return highlightedUpstream.has(id) || highlightedDownstream.has(id)
  }, [highlightedId, highlightedUpstream, highlightedDownstream])

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
        <span>点击节点高亮依赖关系</span>
        {highlightedId && (
          <button
            onClick={() => setHighlightedId(null)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            清除高亮
          </button>
        )}
      </div>
      <svg width={svgWidth} height={svgHeight} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Edges */}
        {REGISTRY_NODES.map((node) => {
          const targetPos = nodePositions.get(node.id)
          if (!targetPos) return null
          return node.depends.map((depId) => {
            const sourcePos = nodePositions.get(depId)
            if (!sourcePos) return null
            const sx = sourcePos.x + NODE_W
            const sy = sourcePos.y
            const tx = targetPos.x
            const ty = targetPos.y
            const isPathEdge = isHighlighted(node.id) && isHighlighted(depId)
            return (
              <line
                key={`${depId}->${node.id}`}
                x1={sx} y1={sy} x2={tx} y2={ty}
                stroke={isPathEdge ? '#3b82f6' : '#d1d5db'}
                strokeWidth={isPathEdge ? 2 : 1}
                opacity={highlightedId && !isPathEdge ? 0.2 : 0.6}
                markerEnd={!isPathEdge ? undefined : 'url(#arrow)'}
              />
            )
          })
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Nodes */}
        {REGISTRY_NODES.map((node) => {
          const pos = nodePositions.get(node.id)
          if (!pos) return null
          const colors = TYPE_COLORS[node.type] || TYPE_COLORS.reference
          const hl = isHighlighted(node.id)
          const isSource = node.id === highlightedId
          return (
            <g
              key={node.id}
              onClick={() => setHighlightedId(isSource ? null : node.id)}
              className="cursor-pointer"
              opacity={highlightedId && !hl ? 0.3 : 1}
            >
              <rect
                x={pos.x} y={pos.y - NODE_H / 2}
                width={NODE_W} height={NODE_H}
                rx={6} ry={6}
                fill={colors.fill}
                stroke={isSource ? '#3b82f6' : colors.stroke}
                strokeWidth={isSource ? 2 : hl ? 1.5 : 1}
              />
              <text
                x={pos.x + NODE_W / 2} y={pos.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fontWeight={isSource ? 'bold' : 'normal'}
                fill={colors.text}
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
        {Object.entries(TYPE_COLORS).slice(0, 8).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.stroke }} />
            <span>{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
