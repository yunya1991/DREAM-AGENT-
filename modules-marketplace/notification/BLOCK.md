---
id: notification
module: modules-marketplace
type: reusable-module
framework: react + typescript
ui_library: tailwind
version: 1.0
quality_score: 91
category: user-feedback
owner: ""
depends: []
acceptance_criteria: |
  1. 通知渲染 < 50ms
  2. 支持同时显示最多 5 条通知
  3. 自动消失计时器精度 < 100ms
phase_d_contract: ""
ledger_task_id: ""
status: ready
last_updated: 2026-05-20
---

# 通知系统（Notification）

## 目标

全局通知管理组件，支持多种通知类型、自动消失、手动关闭、堆叠显示和操作回调。

## 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| 多类型通知 | ✓ | info/success/warning/error |
| 自动消失 | ✓ | 可配置超时时间 |
| 手动关闭 | ✓ | 关闭按钮 |
| 堆叠显示 | ✓ | 最多同时显示 5 条 |
| 进度条 | ✓ | 显示倒计时进度 |
| 操作按钮 | ✓ | 支持自定义操作 |
| 动画效果 | ✓ | 滑入/淡出动画 |
| 全局 API | ✓ | `notify.info()` 等便捷调用 |

## 使用示例

```tsx
import Notification, { notify } from './Notification';

function App() {
  const handleClick = () => {
    notify.success('保存成功', { duration: 3000 });
    notify.error('网络连接失败', { action: { label: '重试', onClick: retry } });
  };

  return (
    <>
      <button onClick={handleClick}>触发通知</button>
      <Notification position="top-right" />
    </>
  );
}
```

## 验收标准

1. 通知渲染 < 50ms
2. 支持同时显示最多 5 条通知
3. 自动消失计时器精度 < 100ms

## 定制指南

| 定制项 | 方法 |
|--------|------|
| 显示位置 | `position="top-right"` / `"top-left"` / `"bottom-right"` |
| 默认时长 | `defaultDuration={5000}` |
| 最大数量 | `maxVisible={3}` |
| 主题 | CSS 变量覆盖 |
