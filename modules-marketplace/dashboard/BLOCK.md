---
id: dashboard
module: modules-marketplace
type: reusable-module
framework: react + typescript
ui_library: tailwind
version: 1.0
quality_score: 92
category: dashboard
owner: ""
depends: []
acceptance_criteria: |
  1. 页面加载 < 1s（首屏渲染）
  2. 数据刷新 < 200ms（WebSocket 推送）
  3. 响应式适配 320px-2560px
phase_d_contract: ""
ledger_task_id: ""
status: ready
last_updated: 2026-05-20
---

# 仪表盘（Dashboard）

## 目标

多标签页、可配置、响应式仪表盘，支持实时数据推送和暗色主题。

## 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| 多标签页切换 | ✓ | 动态添加/删除标签 |
| 响应式布局 | ✓ | CSS Grid + Flexbox |
| 暗色/亮色主题 | ✓ | 跟随系统或手动切换 |
| 实时数据推送 | ✓ | WebSocket hook 封装 |
| 卡片拖拽排序 | ✓ | react-grid-layout 封装 |
| 数据加载骨架 | ✓ | Skeleton 组件 |

## 使用示例

```tsx
import Dashboard from './Dashboard';

function App() {
  const widgets = [
    { id: 'quote', type: 'quote-panel', title: '行情面板', position: { x: 0, y: 0 } },
    { id: 'chart', type: 'kline-chart', title: 'K线图', position: { x: 6, y: 0 } },
    { id: 'orders', type: 'data-table', title: '订单列表', position: { x: 0, y: 4 } },
  ];

  return (
    <Dashboard
      widgets={widgets}
      dataProvider={fetchMarketData}
      theme="auto"
    />
  );
}
```

## 验收标准

> 可执行/可量化/独立于实现路径

1. 首屏渲染 < 1s（Lighthouse 测量）
2. 数据刷新延迟 < 200ms（WebSocket ping-pong）
3. 响应式适配 320px-2560px（viewport 测试）
4. 主题切换无闪烁（CSS transition 完成）

## 定制指南

| 定制项 | 方法 |
|--------|------|
| 数据源 | 传入 `dataProvider` 函数 |
| 主题色 | CSS 变量覆盖 `--primary-color` 等 |
| 布局网格 | 修改 `gridConfig` 参数 |
| 新增 Widget 类型 | 注册到 `WidgetRegistry` |
