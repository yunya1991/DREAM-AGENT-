---
id: 00-AGENT-CONSTITUTION
type: constitution
owner: ledger-protocol-agent
depends: []
version: 3
last_verified: 2026-05-20
---

# AGENT Collaboration Constitution (Fail-Closed)

> Status: active  
> Scope: dreambuddy-v1 repository collaboration  
> Source of truth: `docs/*`

## 0. Purpose

This constitution defines the non-negotiable collaboration rules for all AGENTs working in this repository.

## 1. Source of Truth

- Collaboration documentation source of truth lives in `docs/`.
- Legacy documents may exist elsewhere; when inconsistent, this constitution wins.

## 2. Roles (Behavior-Defined)

- Governance AGENT: merge gates, conflict resolution, branch closeout, final merge.
- Ledger/Protocol AGENT: evolves collaboration protocol docs, ledger structures, contracts; does not handle merges/conflicts.
- Developer AGENT: implements changes in declared scope; produces delivery evidence.
- Validator AGENT: runs validation, scores quality, publishes `VALIDATION_RESULT`.

## 3. Default Workspace & Branch Policy

- Default workspace: `7-ARTIFACT-HUB-V2/**`.
- Each AGENT works on its own `agent/<agent_id>/*` branch and opens an independent PR.
- Working directly on `main` is forbidden.
- If branch metadata becomes inconsistent or cannot be renamed reliably: prefer “new branch + new PR” as the fail-closed strategy.

## 4. Mandatory PR Protocol (Fail-Closed)

An AGENT PR MUST satisfy all of the following:

### 4.1 分解线前置条件（UI-Driven Flow）

- Comments include decomposition anchors (all six steps, in order, no skip):
  - `[技术文档 / TECHNICAL_SPEC]`
  - `[架构评审 / ARCHITECTURE_REVIEW]`
  - `[前端页面定义 / FRONTEND_PAGES]`
  - `[模块契约 / MODULE_CONTRACT]`
  - `[协作清单 / COLLAB_CHECKLIST]`
  - `[验收标准 / ACCEPTANCE_CRITERIA]`

### 4.2 执行线门禁

- PR body includes required fields (task card, owner agent, shared file declaration).
- Comments include required anchors:
  - `[方案评审记录 / DESIGN_REVIEW]` (must include `Reviewer:`)
  - `[协作开工声明 / STARTED]`
  - `[测试报告 / TEST_REPORT]`
  - `[协作完成回报 / DONE]`
- If scope changes: `[协作状态更新 / UPDATED]` MUST be posted before changing scope.
- If blocked: `[协作阻塞通知 / BLOCKED]` MUST be posted.

## 5. Scope & Exception Declaration

- If the work touches any path outside the default workspace, the PR MUST declare it in `STARTED` (and `UPDATED` when changed).
- Shared boundaries MUST be declared and treated as strong-sync points.

## 6. Hard Boundaries: Governance vs Ledger/Protocol

- Ledger/Protocol AGENT MUST NOT modify:
  - `.github/workflows/**`
  - `github-actions/**`
  - `SKILLS/**` (except purely documentary text that does not change behavior)
- Governance AGENT MUST NOT “fix gates” by directly editing `ledger/**`.

## 7. Conflict Resolution Priority

1. If PR metadata/branch policy is unsatisfied and cannot be repaired safely: create a replacement PR and close the original.
2. If massive add/add conflicts: use a rescue branch (clean base from `main`, then move only the effective changes).
3. If shared boundaries are touched: switch to strong-sync and require explicit coordination.

## 8. When Blocked: What to Read First

- Policy dispute / “is this allowed?”: `00-AGENT-CONSTITUTION.md`
- Comment fields / templates / required anchors: `01-COLLABORATION-PROTOCOL.md`
- Role responsibilities & system chain: `02-ARCHITECTURE.md`
- Step-by-step execution / gates / closeout: `03-WORKFLOWS-AND-NORMS.md`
- “Which file should I edit?”: `04-ENGINEERING-INDEX.md`
- Automation/CI/ledger issues: `05-FAQ.md`
- “Which SKILL should I call?”: `06-SKILLS-INVENTORY.md`

## 9. Memory and Learning (记忆与学习)

This system does not merely execute tasks — it learns from every execution.
The memory system is a constitutional requirement, not an optional feature.

### 9.1 Mandatory Retrospective (强制复盘)

Every task completion (Phase 8 archived) triggers an automatic retrospective.
This is non-negotiable. The retrospective:
- Records what happened (experience memory)
- Extracts lessons from failures (lesson memory)
- Updates the proven optimal path (path memory)
- Checks constitutional values (value memory)

### 9.2 Pre-Flight Memory Lookup (飞行前查找)

Before starting any task, the executing agent MUST consult the memory system:
- Check for relevant lessons to avoid repeating mistakes
- Check for optimal paths to follow the proven shortest approach
- Check for known patterns that apply to the current context

This is equivalent in priority to the conflict gate requirement:
**no memory lookup, no task start.**

### 9.3 Customer-First as Hard Constraint (客户至上硬约束)

Every retrospective runs the value check (V1-V5) from `memory/values/constitution.md`.
If any value is violated:
- The episode is flagged
- A governance review task is created
- The violation is recorded in the task ledger

This ensures “our company serves customers, not tortures or exploits them” is
enforced at the system level, not merely aspirational.

### 9.4 Continuous Evolution (持续进化)

The system measures itself:
- Success rate per task type
- Rework cycle trends
- Path efficiency improvements
- Recurring failure patterns

When metrics cross thresholds (defined in `memory/metrics/evolution.json`),
the system automatically proposes improvements to the appropriate AGENT role.
This is how the system gets better without manual intervention.

### 9.5 Memory as Source of Truth (记忆即真源)

The memory system is a source of truth equal to the ledger. When memory says
“this approach failed 3 times,” that is as authoritative as a gate rule.
**Ignoring memory warnings is equivalent to ignoring conflict gate BLOCK results.**

### 9.6 Goal-Driven Path Selection (目标导向路径选择)

We are goal-oriented, not path-prescribing. The only criterion for path selection is:
under conventional engineering practice, choose the **best, optimal, shortest** delivery path.
No cutting corners, no shortcuts, no technical debt.

- **Best** (最佳): sound architecture, maintainable, extensible, compatible
- **Optimal** (最优): highest quality score, fewest rework cycles, lowest risk
- **Shortest** (最短): minimum steps and time, given Best and Optimal are satisfied

The path optimizer recommends but does not mandate. Agents may deviate with documented reasoning.
The retrospective engine automatically compares actual vs recommended path efficiency.
