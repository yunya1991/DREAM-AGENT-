# DREAM-AGENT Memory & Learning System

> Status: active
> Version: 1.0
> Date: 2026-05-20

## 设计哲学

本系统不是简单的日志记录。它是 AGENT 协作系统的**核心学习器官**：

- **每次执行都产生记忆** — 宪法要求，不是可选项
- **每次开工前必查记忆** — 和冲突门禁同等优先级
- **教训按根因去重** — 相同问题不重复创建，只累积观察
- **最优路径由数据涌现** — 不是预设的，是多次执行后自然涌现
- **价值约束不可绕过** — 客户至上是硬约束

## 五层记忆模型

| 层 | 类型 | 存储 | 用途 |
|---|---|---|---|
| L1 | 经验记忆 (Episodes) | `episodes/<task_id>.json` | 记录每次任务实际发生了什么 |
| L2 | 教训记忆 (Lessons) | `lessons/<category>/<lesson_id>.md` | 什么做错了、为什么、如何避免 |
| L3 | 最优路径 (Paths) | `paths/<task_type>/<path_id>.json` | 经数据验证的最短/最佳路径 |
| L4 | 模式记忆 (Patterns) | `patterns/<pattern_id>.json` | 可识别场景及其标准响应 |
| L5 | 价值记忆 (Values) | `values/constitution.md` | 宪法级约束（客户至上等） |

## 分支检查点模型

每个工作流步骤都是不可变检查点，支持 fork 和 rewind：

```
task-abc/phase-a/tech-spec          ← Phase A 检查点
  └── task-abc/phase-b/arch-review   ← Phase B 检查点
      ├── task-abc/phase-c/pages     ← 主线继续
      └── task-abc/phase-b/arch-v2   ← fork：架构被拒后重试
```

## 回溯引擎

每次任务完成（Phase 8 archived）或被阻塞（BLOCKED）时自动触发：

1. 收集证据（ledger + PR 评论 + checkpoint 历史）
2. 分析路径（时间/返工/fork 数/效率）
3. 生成教训（去重 + 分类 + 根因）
4. 更新最优路径（对比已有路径效率）
5. 发现模式（新文件/共享边界/风险模式）
6. 价值检查（V1-V5 宪法约束验证）
7. 写入复盘总结
8. 反馈行动（FAQ 更新 / 流程改进 / 治理审查）

## 飞行前查找

每个 SKILL 执行前、每个任务开工前，必须查询记忆系统：
- 检查相关教训 → 避免重复踩坑
- 检查最优路径 → 跟随已验证最短路径
- 检查已知模式 → 识别当前风险

## 进化循环

```
任务完成 → 回溯引擎 → 更新记忆 → 进化指标 → 阈值检查 → 自动改进提案 → 下次执行更优
```

## 目录结构

```
memory/
├── index.json              # 中央注册表
├── README.md               # 本文件
├── episodes/               # 经验记忆
├── lessons/                # 教训记忆（按分类子目录）
├── paths/                  # 最优路径（按任务类型子目录）
├── patterns/               # 模式记忆
├── values/                 # 价值记忆
├── checkpoints/            # 分支检查点
├── retrospectives/         # 复盘总结
├── metrics/                # 进化指标
└── scripts/                # 记忆系统脚本
```
