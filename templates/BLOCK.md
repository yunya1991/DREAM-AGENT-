---
id: {{TASK_ID}}
module: {{MODULE_NAME}}
block_index: {{BLOCK_INDEX}}
type: {{TASK_TYPE}}
owner: {{OWNER_AGENT}}
depends:
  - {{DEPENDENCIES}}
acceptance_criteria: |
  {{ACCEPTANCE_CRITERIA}}
phase_d_contract: {{CONTRACT_PATH}}
ledger_task_id: {{LEDGER_TASK_ID}}
status: ready
version: 1
created_at: {{CREATED_AT}}
---

# {{TASK_TITLE}}

## 目标
{{TASK_DESCRIPTION}}

## 验收标准

> 从 Phase F 继承，可执行/可量化/独立于实现路径

{{ACCEPTANCE_CRITERIA_DETAIL}}

## 已知教训

> 飞行前查找自动注入：来自 memory/lessons/ 的相关警告

<!-- 自动生成，勿手动编辑 -->

## 最优路径

> 来自 memory/paths/ 的推荐步骤

<!-- 自动生成，勿手动编辑 -->

## 实现笔记

{{IMPLEMENTATION_NOTES}}
