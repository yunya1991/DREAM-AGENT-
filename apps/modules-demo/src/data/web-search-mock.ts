import type { WebResearchResult } from '../engine/types'

/** Mock web search results for development */
export const mockSearchResults: Record<string, WebResearchResult> = {
  default: {
    query: '金融 前端 UI 架构',
    suggestions: [
      'Bloomberg Terminal UI Design Patterns',
      'React Financial Dashboard Best Practices',
      'Trading Platform Frontend Architecture',
    ],
    industryPatterns: [
      'DataTable（数据表格）是金融场景的标准组件',
      'QuotePanel（行情面板）用于实时报价场景',
      'Dashboard（仪表盘）用于数据总览/KPI展示',
      'Notification（通知系统）用于告警/消息推送',
      'FileManager（文件管理）用于研报/文档管理',
    ],
    confidence: 0.65,
  },
  '行情-订单': {
    query: '行情 订单 UI 前端 架构 布局',
    suggestions: [
      'Interactive Brokers Trading UI',
      'Coinbase Pro Layout Analysis',
      '富途牛牛交易终端设计',
    ],
    industryPatterns: [
      '交易终端标准布局：左侧行情 + 右侧下单',
      'QuotePanel（行情面板）+ DataTable（委托表格）是核心组合',
      '通常需要实时WebSocket推送',
    ],
    confidence: 0.75,
  },
  '文件-文档': {
    query: '文件 文档 UI 前端 架构 布局',
    suggestions: [
      'Google Docs File Manager Pattern',
      'Notion Document Architecture',
      '企业文档管理系统前端方案'],
    industryPatterns: [
      'FileManager（文件管理）+ 树形结构是标准模式',
      'Notification（通知）用于协作提醒',
      '需要支持拖拽上传和在线预览',
    ],
    confidence: 0.7,
  },
}
