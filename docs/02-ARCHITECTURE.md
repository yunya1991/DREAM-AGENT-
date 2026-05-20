---
id: 02-ARCHITECTURE
type: architecture
owner: ledger-protocol-agent
depends:
  - 00-AGENT-CONSTITUTION
  - 01-COLLABORATION-PROTOCOL
version: 3
last_verified: 2026-05-20
---

# Collaboration System Architecture

> Status: active  
> Focus: roles, data flow, and source-of-truth files  
> Last updated: 2026-05-20

## 1. Core Roles

- Governance AGENT: governs merges and conflicts; enforces gates; closes out PRs.
- Ledger/Protocol AGENT: evolves protocol docs, ledger schema, contracts; produces protocol PRs.
- Developer AGENT: implements within declared scope; posts `STARTED/UPDATED/DONE`.
- Validator AGENT: validates and posts `VALIDATION_RESULT`; supplies score and decision.

## 2. Source-of-Truth Artifacts

- Protocol docs: `docs/*`
- Comment templates: `templates/*`
- Lifecycle gate rules: `SKILLS/agent-collab-supervisor/rules.json`
- Gate checkers: `github-actions/*`
- Ledger:
  - tasks: `ledger/tasks/index.json`
  - rewards: `ledger/rewards/index.json`
- Contracts: `docs/superpowers/contracts/**`

## 3. Runtime Data Flow (PR-Centric)

1. Developer posts `STARTED` (declares scope + conflict gate result).
2. Developer posts `TEST_REPORT` (local evidence).
3. Validator posts `VALIDATION_RESULT` (decision + score + handoff).
4. Claim/ledger workflows advance task status and write rewards (when state changes).
5. Governance AGENT merges only when gates and validation are satisfied.

## 4. Automation Placement

- “Gates” live as GitHub Actions workflows and python scripts under `github-actions/`.
- Self-hosted runner setup is documented under `docs/self-hosted-runner.md` (trialed on PR9).

## 5. UI-Driven Decomposition Architecture (New)

协作系统采用「以终为始」的 UI-driven 分解策略。分解锚点是用户可见的功能边界（前端页面/模块），不是技术边界（API/DB）。这使每个 AGENT 的交付物对应一个明确的前端功能模块，验收标准可视化，大幅降低任务漂移。

### 5.1 六步协作流

```
技术文档
  ↓
工程架构图（目的驱动 + 数据流向）
  ↓
前端页面（精确到组件级）
  ↓
模块联动模拟（定义模块间契约）
  ↓
按模块拆解协作清单
  ↓
每个清单附带验收标准
```

每一步的产出是下一步的输入，不可跳步。

### 5.2 各步目标与产出

| 步骤 | 目标 | 产出物 | 主责 AGENT |
|---|---|---|---|
| 技术文档 | 明确业务目标、用户需求、非功能约束 | `docs/tech-spec-*.md` | Governance AGENT |
| 工程架构图 | 展示系统如何服务于前端目的，保留数据流向但不陷入实现细节 | `docs/architecture-*.md` + 架构图 | Governance AGENT + Validator AGENT |
| 前端页面 | 定义页面结构、组件层级、交互流程 | `docs/frontend-pages/*.md` + 页面草图/原型 | Governance AGENT |
| 模块联动模拟 | 定义模块间契约：数据怎么流、状态怎么变、异常怎么处理 | `docs/module-contracts/*.md` | Validator AGENT |
| 协作清单 | 按前端模块拆分任务，分配 AGENT，声明依赖 | `ledger/tasks/index.json` + `templates/collab-checklist-*.md` | Governance AGENT |
| 验收标准 | 为每个清单定义可验证的完成标准 | 清单内嵌 `Acceptance Criteria` 段落 | Validator AGENT |

### 5.3 架构图设计原则

- **目的驱动**：架构图的核心是”前端用户看到什么 → 背后需要什么服务”，不是”技术组件怎么分层”
- **保留数据流向**：必须体现 数据源 → 服务层 → 前端模块 的垂直切片视图，否则模块拆分后可能出现循环依赖
- **不必陷入路径细节**：只要路径符合传统金融工程实践即可，不需要在架构图里展开每个函数的实现

### 5.4 模块契约设计原则

模块联动模拟 = 定义模块间的契约。这是防止 AI 漂移最关键的约束机制。每个契约必须包含：

- 上游模块输出的数据格式与触发条件
- 下游模块的输入依赖与响应行为
- 异常/降级路径（数据缺失时怎么办）
- 状态同步机制（多模块共享状态时如何保持一致）

### 5.5 与现有 PR 协议的衔接

UI-driven 分解流完成后，每个协作清单条目进入现有的 Phase 0-8 生命周期：

```
协作清单条目 → Phase 0 任务登记 → Phase 1 方案评审 → ... → Phase 8 完成归档
```

六步协作流是”任务从哪里来、怎么拆”，现有 Phase 0-8 是”任务怎么执行、怎么验收”。两者互补，不替代。

### 5.6 PR Comment Anchors for UI-Driven Flow

六步协作流的每一步都在 PR 中留下结构化评论锚点：

- `[技术文档 / TECHNICAL_SPEC]` — 业务目标、用户需求、非功能约束
- `[架构评审 / ARCHITECTURE_REVIEW]` — 工程架构图的目的性与数据流向评审
- `[前端页面定义 / FRONTEND_PAGES]` — 页面结构、组件层级、交互流程定义
- `[模块契约 / MODULE_CONTRACT]` — 模块间数据流、状态同步、异常处理契约
- `[协作清单 / COLLAB_CHECKLIST]` — 按模块拆分的任务清单与验收标准
- `[验收标准 / ACCEPTANCE_CRITERIA]` — 每个清单条目的可验证完成标准确认

这些锚点与现有的 `STARTED/DESIGN_REVIEW/TEST_REPORT/VALIDATION_RESULT/DONE` 共存，属于方案评审阶段的前置产出。
