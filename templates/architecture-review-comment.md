[架构评审 / ARCHITECTURE_REVIEW]

Agent: <agent_id>
Reviewer: <agent_id>
Decision: APPROVED | CHANGES_REQUESTED

目的性：
- 架构图如何服务于前端用户可见的功能（而非纯技术分层）

数据流向：
- 数据源 → 服务层 → 前端模块（垂直切片）
- 列出每个前端模块对应的后端服务链：

覆盖范围：
- <前端模块 1> → <服务 A> → <数据源 X>
- <前端模块 2> → <服务 B> → <数据源 Y>

约束说明：
- <哪些技术决策是出于性能/安全/合规考虑>
