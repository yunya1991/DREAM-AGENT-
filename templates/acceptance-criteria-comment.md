[协作清单 / COLLAB_CHECKLIST]

Agent: <agent_id>

模块拆分：
1. <模块 A>
   - 执行类型：parallel | serial | shared-sync
   - 依赖：<前置任务>
   - 验收标准：<可执行的验收条件>
2. <模块 B>
   - 执行类型：parallel | serial | shared-sync
   - 依赖：<前置任务>
   - 验收标准：<可执行的验收条件>

分配：
- 模块 A → <agent_id>
- 模块 B → <agent_id>

防漂移声明：
- 每个模块的交付物对应一个明确的前端组件/页面
- 验收标准已前置定义，开发过程中始终对照
- 模块间契约已锁定，不可自行扩展接口或改变数据格式
