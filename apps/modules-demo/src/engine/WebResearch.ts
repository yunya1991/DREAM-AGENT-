import type { WebResearchResult } from './types'
import { mockSearchResults } from '../data/web-search-mock'

/** Build a search query from user keywords */
function buildQuery(keywords: string[]): string {
  const terms = keywords.filter((k) => k.length > 1).slice(0, 5)
  return [...terms, 'UI 前端 架构 布局'].join(' ')
}

/** Parse Tavily search results into structured suggestions */
function parseSearchResults(raw: string[]): WebResearchResult['industryPatterns'] {
  const patterns: string[] = []
  for (const text of raw) {
    const lower = text.toLowerCase()
    if (lower.includes('table') || lower.includes('表格') || lower.includes('datatable')) patterns.push('DataTable（数据表格）是标准组件')
    if (lower.includes('quote') || lower.includes('行情') || lower.includes('price')) patterns.push('QuotePanel（行情面板）用于实时报价场景')
    if (lower.includes('dashboard') || lower.includes('仪表') || lower.includes('概览')) patterns.push('Dashboard（仪表盘）用于数据总览/KPI展示')
    if (lower.includes('file') || lower.includes('文档') || lower.includes('upload')) patterns.push('FileManager（文件管理）用于文档/文件操作')
    if (lower.includes('notification') || lower.includes('通知') || lower.includes('alert')) patterns.push('Notification（通知系统）用于告警/消息推送')
  }
  return [...new Set(patterns)]
}

/**
 * Search the web for industry best practices.
 * When TAVILY_API_KEY is set, calls the real API.
 * During development, falls back to mock data.
 */
export async function webResearch(keywords: string[]): Promise<WebResearchResult> {
  const query = buildQuery(keywords)
  const suggestions: string[] = []
  let industryPatterns: string[] = []

  try {
    const apiKey = (import.meta as any).env?.VITE_TAVILY_API_KEY
    if (apiKey) {
      const resp = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, query, max_results: 5 }),
      })
      const data = await resp.json()
      if (data.results) {
        for (const r of data.results) {
          suggestions.push(r.title)
        }
        industryPatterns = parseSearchResults(data.results.map((r: { content: string }) => r.content))
      }
    } else {
      // Fallback to mock
      const mock = mockSearchResults[keywords.join('-')] || mockSearchResults['default']
      suggestions.push(...mock.suggestions)
      industryPatterns = mock.industryPatterns
    }
  } catch {
    // Network error — fallback to mock
    const mock = mockSearchResults['default']
    suggestions.push(...mock.suggestions)
    industryPatterns = mock.industryPatterns
  }

  return {
    query,
    suggestions,
    industryPatterns,
    confidence: industryPatterns.length > 0 ? 0.6 : 0.3,
  }
}
