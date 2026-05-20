---
id: file-manager
module: modules-marketplace
type: reusable-module
framework: react + typescript
ui_library: tailwind
version: 1.0
quality_score: 89
category: file-management
owner: ""
depends: []
acceptance_criteria: |
  1. 虚拟滚动支持 > 1000 文件无卡顿
  2. 搜索过滤 < 50ms
  3. 支持文件树展开/折叠
phase_d_contract: ""
ledger_task_id: ""
status: ready
last_updated: 2026-05-20
---

# 文件管理器（File Manager）

## 目标

可视化文件目录浏览、搜索和操作，支持树形结构、面包屑导航、文件选择和批量操作。

## 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| 树形目录 | ✓ | 支持展开/折叠 |
| 面包屑导航 | ✓ | 当前路径可视化 |
| 文件列表视图 | ✓ | 列表/网格切换 |
| 搜索过滤 | ✓ | 按名称过滤 |
| 文件选择 | ✓ | 单选/多选/全选 |
| 批量操作 | ✓ | 删除/移动/重命名 |
| 文件图标 | ✓ | 按类型自动匹配图标 |
| 拖拽排序 | ✓ | 拖拽移动文件 |

## 使用示例

```tsx
import FileManager from './FileManager';

function App() {
  const files = [
    { id: '1', name: 'README.md', type: 'file', size: 1024, modified: Date.now(), path: '/' },
    { id: '2', name: 'src', type: 'folder', path: '/' },
  ];

  return (
    <FileManager
      files={files}
      onFileSelect={(f) => console.log(f)}
      onFileAction={(action, files) => console.log(action, files)}
      rootName="项目文件"
    />
  );
}
```

## 验收标准

1. 虚拟滚动支持 > 1000 文件无卡顿
2. 搜索过滤 < 50ms
3. 支持文件树展开/折叠

## 定制指南

| 定制项 | 方法 |
|--------|------|
| 文件数据源 | 修改 `files` 数组或 `dataProvider` |
| 操作菜单 | 修改 `availableActions` 配置 |
| 文件图标 | 传入自定义 `iconMap` |
| 视图模式 | `defaultView="grid"` 或 `"list"` |
