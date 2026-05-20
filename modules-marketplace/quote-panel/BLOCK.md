---
id: quote-panel
module: modules-marketplace
type: reusable-module
framework: react + typescript
ui_library: tailwind
version: 1.0
quality_score: 90
category: data-display
owner: ""
depends: []
acceptance_criteria: |
  1. 数据加载 < 200ms（含 API 调用）
  2. 实时更新延迟 < 50ms（WebSocket）
  3. 涨跌颜色区分（红涨绿跌 / 绿涨红跌 可配置）
phase_d_contract: ""
ledger_task_id: ""
status: ready
last_updated: 2026-05-20
---

# 行情面板（Quote Panel）

## 目标

展示实时行情数据，支持多品种同时显示，自动刷新和涨跌颜色区分。

## 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| 多品种显示 | ✓ | 同时展示多个交易品种 |
| 实时更新 | ✓ | WebSocket 推送 + 本地缓存 |
| 涨跌颜色 | ✓ | 红涨绿跌（可配置为绿涨红跌） |
| 价格格式化 | ✓ | 自动保留小数位 |
| 涨跌幅百分比 | ✓ | 自动计算日涨跌 |
| 骨架加载 | ✓ | 加载动画 |

## 使用示例

```tsx
import QuotePanel from './QuotePanel';

function App() {
  const symbols = [
    { code: 'AAPL', name: '苹果公司', exchange: 'NASDAQ' },
    { code: 'GOOGL', name: '谷歌', exchange: 'NASDAQ' },
    { code: 'TSLA', name: '特斯拉', exchange: 'NASDAQ' },
  ];

  return (
    <QuotePanel
      symbols={symbols}
      colorScheme="red-up"     // 红涨绿跌（A股习惯）
      decimals={2}
      wsUrl="wss://market-data.example.com/stream"
    />
  );
}
```

## 验收标准

1. 数据加载 < 200ms（首次 API 调用）
2. 实时更新延迟 < 50ms（WebSocket 推送）
3. 涨跌颜色正确区分显示

## 定制指南

| 定制项 | 方法 |
|--------|------|
| 数据源 | 修改 `dataProvider` 函数 |
| 涨跌颜色 | `colorScheme="red-up"` 或 `"green-up"` |
| 小数位 | `decimals={2}` |
| 刷新间隔 | `refreshInterval={5000}`（毫秒） |
