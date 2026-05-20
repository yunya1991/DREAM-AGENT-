import type { ClassicTemplate, TemplateMatch, InferredModule } from './types'

export const CLASSIC_TEMPLATES: ClassicTemplate[] = [
  {
    id: 'trading-terminal',
    name: '交易终端',
    modules: ['QuotePanel', 'DataTable'],
    keywords: ['行情', '价格', 'quotes', 'k线', '订单', '买卖', 'trade', 'order', '交易', '股票', '期货', '加密货币'],
    description: '股票/期货/加密货币交易终端 — 行情报价 + 委托下单表格',
  },
  {
    id: 'admin-dashboard',
    name: '管理后台',
    modules: ['Dashboard', 'DataTable', 'FileManager'],
    keywords: ['管理', '后台', 'crud', 'admin', '用户', '权限', '数据管理', '系统'],
    description: '通用管理后台 — 仪表盘 + 数据列表 + 文件管理',
  },
  {
    id: 'risk-monitor',
    name: '风控看板',
    modules: ['Dashboard', 'Notification', 'DataTable'],
    keywords: ['风控', '监控', '告警', 'risk', 'monitor', '告警', '实时', 'dashboard'],
    description: '风险控制/实时监控 — 指标仪表盘 + 告警通知 + 数据表格',
  },
  {
    id: 'data-platform',
    name: '数据中台',
    modules: ['DataTable', 'Dashboard'],
    keywords: ['数据', '报表', '统计', 'analytics', '报表', '分析', '中台'],
    description: '数据分析/报表系统 — 数据表格 + 指标仪表盘',
  },
  {
    id: 'doc-center',
    name: '文档中心',
    modules: ['FileManager', 'Notification'],
    keywords: ['文档', '文件', '知识', 'doc', 'document', 'wiki', '知识库'],
    description: '文档管理/知识库 — 文件管理 + 通知系统',
  },
]

/** Compute Jaccard similarity between user modules and template modules */
function jaccard(userModules: Set<string>, templateModules: Set<string>): number {
  const intersection = new Set([...userModules].filter((m) => templateModules.has(m)))
  const union = new Set([...userModules, ...templateModules])
  return union.size === 0 ? 0 : intersection.size / union.size
}

/** Check if the user's keywords match a template's keywords */
function keywordScore(keywords: string[], templateKeywords: string[]): number {
  if (keywords.length === 0) return 0
  const hits = keywords.filter((k) =>
    templateKeywords.some((tk) => tk.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(tk.toLowerCase())),
  )
  return hits.length / Math.max(keywords.length, templateKeywords.length) * 1.5 // bonus for keyword match
}

/** Match user's inferred modules against classic templates */
export function matchTemplates(modules: InferredModule[], keywords: string[]): TemplateMatch[] {
  const userModuleSet = new Set(modules.map((m) => m.module))
  const results: TemplateMatch[] = []

  for (const tpl of CLASSIC_TEMPLATES) {
    const tplSet = new Set(tpl.modules)
    const j = jaccard(userModuleSet, tplSet)
    const k = keywordScore(keywords, tpl.keywords)
    const similarity = Math.min(1, j * 0.6 + k * 0.4)

    const matchedModules = [...userModuleSet].filter((m) => tplSet.has(m))
    const missingModules = [...tplSet].filter((m) => !userModuleSet.has(m))

    results.push({ template: tpl, similarity, matchedModules, missingModules })
  }

  return results.sort((a, b) => b.similarity - a.similarity)
}
