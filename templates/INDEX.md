---
id: {{MODULE_ID}}
type: module
owner: governance-agent
depends:
  - phase-d-contract: {{CONTRACT_PATH}}
total_tasks: {{TOTAL_TASKS}}
parallel_tasks: {{PARALLEL_TASKS}}
serial_tasks: {{SERIAL_TASKS}}
shared_sync_tasks: {{SHARED_SYNC_TASKS}}
status: ready
created_at: {{CREATED_AT}}
---

# {{MODULE_TITLE}} 模块

## 区块列表

| # | ID | 类型 | 依赖 | 状态 | 负责人 |
|---|---|------|------|------|--------|
{{BLOCK_TABLE_ROWS}}

## 模块契约（Phase D）

- 上游输出：{{UPSTREAM_OUTPUT}}
- 下游输入：{{DOWNSTREAM_INPUT}}
- 异常降级：{{EXCEPTION_PATH}}
- 状态同步：{{STATE_SYNC}}

## 前端页面定义（Phase C）

{{FRONTEND_PAGES}}
