import React from 'react'
import type { WidgetConfig } from '../marketplace'
import { mockSymbols } from './quotes'
import { mockOrders, orderColumns } from './orders'
import { QuotePanel } from '../marketplace'
import { DataTable } from '../marketplace'

export const mockWidgets: WidgetConfig[] = [
  {
    id: 'quote-panel',
    type: 'quote-panel',
    title: '行情面板',
    description: '实时行情数据展示',
    badge: 'Live',
    content: React.createElement(QuotePanel, {
      symbols: mockSymbols,
      colorScheme: 'red-up' as const,
      decimals: 2,
      refreshInterval: 5000,
    }),
  },
  {
    id: 'data-table',
    type: 'data-table',
    title: '订单数据',
    description: '交易订单列表',
    badge: '50',
    content: React.createElement(DataTable, {
      columns: orderColumns,
      data: mockOrders,
      pageSize: 10,
      searchable: true,
      exportable: true,
    }),
  },
  {
    id: 'system-status',
    type: 'status-card',
    title: '系统状态',
    description: '运行指标',
    content: (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">CPU</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">23%</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '23%' }} />
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">内存</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">1.2 GB</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">运行时间</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">4h 32m</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">模块数</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">5</div>
        </div>
      </div>
    ),
  },
  {
    id: 'activity-log',
    type: 'activity-log',
    title: '活动日志',
    description: '最近操作记录',
    content: (
      <div className="space-y-2 text-sm">
        {[
          { time: '14:32', msg: '模块 marketplace 加载完成', color: 'text-green-600' },
          { time: '14:30', msg: '行情数据源已连接', color: 'text-blue-600' },
          { time: '14:28', msg: '主题切换为 dark', color: 'text-gray-600' },
          { time: '14:25', msg: 'DataTable 导出 CSV', color: 'text-gray-600' },
          { time: '14:20', msg: '系统初始化完成', color: 'text-green-600' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-10">{item.time}</span>
            <span className={item.color}>{item.msg}</span>
          </div>
        ))}
      </div>
    ),
  },
]
