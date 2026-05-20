---
id: TASK-DECOMPOSE-BLOCKS
name: task-decompose-blocks
type: skill
owner: ledger-protocol-agent
depends:
  - 01-COLLABORATION-PROTOCOL
version: 1
last_verified: 2026-05-20
description: Phase D.5 核心 SKILL — 将模块契约（Phase D）+ 前端页面定义（Phase C）拆解为具象的模块文件夹/任务区块结构。触发词：任务拆解、区块生成、模块文件夹、生成区块、decompose blocks
created: "2026-05-20"
status: "active"
---

# Task Decompose Blocks（任务拆解区块）

## 用途

Phase D（模块联动模拟）完成后，本 SKILL 将抽象的契约和页面定义转化为**物理的模块文件夹 + 任务区块结构**。

每个功能模块自包含、自描述、自索引，Agent 开工前只需读区块头（前 10 行）就知道：做什么、依赖什么、怎么验收。

## 输入

| 输入 | 来源 | 说明 |
|------|------|------|
| Phase C 前端页面定义 | PR 评论 `[前端页面定义 / FRONTEND_PAGES]` | 页面结构、组件层级 |
| Phase D 模块契约 | PR 评论 `[模块契约 / MODULE_CONTRACT]` | 上游/下游/异常/状态同步 |
| 协作清单草稿 | Phase E 前置任务列表 | 待拆解的功能模块列表 |

## 输出物（五件套）

| 输出 | 路径 | 说明 |
|------|------|------|
| 模块文件夹 | `{workspace}/modules/{module-name}/` | 每个功能模块一个文件夹 |
| 任务区块 | `{workspace}/modules/{module-name}/tasks/{N}-slug/BLOCK.md` | 每个任务一个区块文件 |
| 子工程索引 | `{workspace}/modules/{module-name}/INDEX.md` | 模块级索引（区块头 + 区块列表） |
| 契约引用 | `{workspace}/modules/{module-name}/contracts/phase-d.md` | Phase D 契约的物理引用 |
| 总索引更新 | `docs/file-registry.json` | modules 字段追加新模块引用 |

## 目录结构

```
{workspace}/modules/
├── market-quote/                    ← 模块文件夹（区块集合）
│   ├── INDEX.md                     ← 子工程索引（区块头）
│   ├── contracts/
│   │   └── phase-d.md               ← Phase D 契约引用
│   └── tasks/
│       ├── 001-quote-fetcher/       ← 任务区块
│       │   └── BLOCK.md             ← 任务区块头 + 详情
│       ├── 002-quote-cache/
│       │   └── BLOCK.md
│       └── 003-quote-ui/
│           └── BLOCK.md
└── kline-chart/
    ├── INDEX.md
    └── tasks/
        └── ...
```

## 区块头结构（BLOCK.md frontmatter）

```yaml
---
id: 001-quote-fetcher           # 区块唯一 ID
module: market-quote            # 所属模块
block_index: 1                  # 区块序号
type: parallel                  # parallel | serial | shared-sync
owner: ""                       # 待分配
depends: []                     # 依赖的区块 ID 列表
acceptance_criteria: |          # 从 Phase F 继承
  1. ...
phase_d_contract: ../contracts/phase-d.md
ledger_task_id: ""              # 后续由 ledger_sync 填充
status: ready                   # ready | in_progress | completed | blocked
version: 1
created_at: 2026-05-20
---
```

## 拆解规则

1. **从 Phase C 页面定义提取组件** → 每个组件生成一个并行任务区块
2. **从 Phase D 契约提取依赖** → 上游输出模块标记为 serial 依赖
3. **共享状态/接口** → 标记为 shared-sync，需要强同步
4. **区块 ID 格式**：`{N}-{slug}`（N 为 3 位序号，slug 取自组件名 kebab-case）
5. **状态初始化**：所有区块 status=ready，等待 Phase E 分配 owner
6. **依赖关系**：depends 字段构成 DAG，不可有循环依赖

## 一步完成：decompose 命令

```bash
python3 SKILLS/task-decompose-blocks/decompose.py \
  --module <module-name> \
  --pages <phase-c-pages.md> \
  --contract <phase-d-contract.md> \
  --workspace 7-ARTIFACT-HUB-V2
```

这会完成：
1. 创建模块文件夹结构
2. 为每个组件/任务生成 BLOCK.md
3. 生成子工程索引 INDEX.md
4. 写入契约引用
5. 更新 docs/file-registry.json 的 modules 字段

加 `--dry-run` 只预览不写文件。

## 批量拆解

```bash
python3 SKILLS/task-decompose-blocks/decompose.py \
  --batch <modules-list.json> \
  --workspace 7-ARTIFACT-HUB-V2
```

modules-list.json 格式：
```json
[
  {
    "module_name": "market-quote",
    "pages_file": "docs/frontend-pages/market-quote.md",
    "contract_file": "docs/module-contracts/market-quote.md"
  }
]
```

## 与现有 SKILL 的衔接

- 本 SKILL 在 Phase D 完成后运行，输出物作为 Phase E（协作清单）和 Phase F（验收标准）的输入
- `collab-ledger-planner` SKILL 读取本 SKILL 生成的区块结构，写入 `ledger/tasks/index.json`
- Agent 开工时读 BLOCK.md 前 10 行（区块头），不需要读整个 JSON
