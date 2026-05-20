---
id: data-table
module: modules-marketplace
type: reusable-module
framework: react + typescript
ui_library: tailwind
version: 1.0
quality_score: 88
category: data-display
owner: ""
depends: []
acceptance_criteria: |
  1. 1000 行数据排序 < 100ms
  2. 搜索过滤 < 50ms（前端过滤）
  3. 分页支持 > 10000 行数据
phase_d_contract: ""
ledger_task_id: ""
status: ready
last_updated: 2026-05-20
---

# 数据表格（Data Table）

## 目标

高性能数据表格，支持排序、搜索、过滤、分页和行选择。

## 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| 列排序 | ✓ | 点击列头排序 |
| 搜索过滤 | ✓ | 全局搜索 + 列级过滤 |
| 分页 | ✓ | 可配置每页大小 |
| 行选择 | ✓ | 单选/多选 |
| 固定列头 | ✓ | 滚动时列头固定 |
| 导出 CSV | ✓ | 一键导出当前数据 |

## 使用示例

```tsx
import DataTable from './DataTable';

function App() {
  const columns = [
    { key: 'id', header: 'ID', sortable: true, width: '60px' },
    { key: 'name', header: '名称', sortable: true },
    { key: 'price', header: '价格', sortable: true, render: (v) => `$${v}` },
    { key: 'status', header: '状态', render: (v) => <Badge>{v}</Badge> },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      pageSize={20}
      searchable
      exportable
    />
  );
}
```

## 验收标准

1. 1000 行数据排序 < 100ms
2. 搜索过滤 < 50ms（前端过滤）
3. 分页支持 > 10000 行数据

## 定制指南

| 定制项 | 方法 |
|--------|------|
| 列定义 | 修改 `columns` 数组 |
| 自定义渲染 | 列的 `render` 函数 |
| 分页大小 | `pageSize={50}` |
| 主题 | CSS 变量覆盖 |
