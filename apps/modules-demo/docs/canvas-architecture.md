# 画版驱动的前端架构生成系统 — 工程规划

## 1. 系统定位

用户通过 **AI 代画草图**（自然语言描述）+ 手绘微调 + 文字补充 → 系统识别意图 → 匹配经典架构 → 生成前端模块 → 自动创建链上协作任务。

**核心链路**：AI 画 80% → 人改 20% → 推理做理解 → 经典做落地 → 联网做优化 → 链上做协作

**设计理念**：用户说一句话，AI 生成页面草图，用户在 Excalidraw 中微调细节（拖拽/缩放/改字），点击"识别架构"生成完整前端方案。

## 2. 现有基础

- `modules-marketplace/`：5个成熟组件（Dashboard, QuotePanel, DataTable, FileManager, Notification）
- `apps/modules-demo/`：7-tab 展示工程，已有 CanvasSketch + BlockTaskBoard
- `useBlockTasks.ts`：任务注册/挖矿/依赖检查/一键挖矿的完整逻辑
- `engine/`：SketchParser + IntentEngine + ConfidenceScorer + templates + WebResearch + adapter
- Tavily API：已配置，可用于联网搜索

## 3. 架构总览

```
┌─────────────────────────────────────────────────────┐
│  信号层 (Input Signals)                              │
│  ┌──────────────────┐  ┌───────────────────────┐    │
│  │ AI 代画（对话框） │  │ Excalidraw 手绘微调    │    │
│  │ 自然语言 → 草图  │  │ 拖拽/缩放/改字/连线     │    │
│  └────────┬─────────┘  └───────────┬───────────┘    │
│           └───────────┬────────────┘                │
│                       │ 6 维信号                     │
└───────────────────────┼─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  推理层 (Inference Engine)                           │
│  SketchParser → IntentEngine → ConfidenceScorer     │
└───────────────────────┬─────────────────────────────┘
                        │ 结构化意图
                        ↓
┌─────────────────────────────────────────────────────┐
│  落地层 (Template Matcher + Web Research)            │
│  ClassicTemplates ──(低匹配)──→ TavilySearch         │
│  ClassicTemplates ──(高匹配)──→ ModuleGenerator      │
└───────────────────────┬─────────────────────────────┘
                        │ BlockTask[] + LayoutPlan
                        ↓
┌─────────────────────────────────────────────────────┐
│  输出层 (Output)                                     │
│  BlockTaskBoard 展示 + 用户确认 + 一键挖矿            │
└─────────────────────────────────────────────────────┘
```

## 4. 各层详细设计

### 4.0 AI 代画层 — 新增

**交互流程**：
1. 用户在画板下方对话框输入描述（如"我要一个交易页面，左边行情右边订单"）
2. 点击"AI 代画"按钮
3. LLM 解析描述，输出 Excalidraw JSON elements
4. 草图直接填充到 Excalidraw 画板
5. 用户在画板上微调（拖拽位置、改文字、加箭头）
6. 点击"识别架构"继续后续流程

**LLM Prompt 设计**：
```
你是一个前端页面布局专家。根据用户的自然语言描述，生成合理的页面草图。
输出格式为 Excalidraw JSON elements 数组，包含：
- rect 表示面板/卡片（大矩形包小矩形表示嵌套）
- text 表示标注文字（放在对应矩形附近）
- arrow 表示数据依赖/流程关系
布局要求：左右分栏或上下分栏，间距均匀，标注清晰。
只输出 JSON 数组，不要其他内容。
```

**降级策略**：
- LLM API 不可用时 → 使用预设的"描述→布局"模版映射
- 描述过于模糊时 → 生成基础布局 + 提示用户补充

**技术实现**：
- 对话框组件嵌入 CanvasSketch 底部
- `generateFromDescription(description: string)` 调用 LLM API
- 返回的 elements 通过 `excalidrawAPI.updateScene({ elements })` 注入
- 用户可在画板上直接修改

### 4.1 信号层 — CanvasSketch 组件

**技术选型**：@excalidraw/excalidraw（开源手绘白板库）

- 用户可拖拽：矩形、圆形、菱形、箭头、文字、自由画笔
- 支持图片上传（拖入/粘贴/拍照上传）
- 支持导出 JSON 元素数据（ExcalidrawElement）
- **新增**：底部对话框 + "AI 代画"按钮

**6 维信号提取**：

| 信号 | 提取方式 | 数据结构 |
|---|---|---|
| 元素形状 | ExcalidrawElement.type | rect/ellipse/arrow/line/freedom |
| 元素位置 | x, y, width, height | BoundingBox |
| 嵌套关系 | 矩形包含关系推断 | parentChildren[] |
| 文字标注 | rectangle 内的 text 元素 | label: string |
| 连线关系 | arrow 元素两端 | from→to: elementId |
| 拖拽顺序 | ExcalidrawElement.createdTimestamp | sequence: number[] |

### 4.2 推理层 — IntentEngine

**第1步：SketchParser（结构推断）**

从 Excalidraw JSON 解析页面骨架：
```
找出所有 rect → 按位置排序（从上到下，从左到右）
找出包含关系 → 大 rect 包含小 rect = 父子层级
找出 arrow → A→B = 数据依赖
找出 text → 关联最近的 rect = 模块标签
```

**第2步：IntentEngine（意图识别）**

文字标注关键词映射到模块：
```
"行情/价格/quotes/k线" → { module: 'QuotePanel', confidence: 0.85 }
"订单/表格/列表/list/trade" → { module: 'DataTable', confidence: 0.85 }
"文件/文档/upload/file" → { module: 'FileManager', confidence: 0.85 }
"通知/消息/告警/notification" → { module: 'Notification', confidence: 0.85 }
"总览/指标/kpi/仪表盘" → { module: 'Dashboard', confidence: 0.85 }
```

形状辅助推断（无文字时）：
```
宽矩形（宽度 > 高度×2）→ 可能是表格/列表
正方形 → 可能是卡片/面板
圆 → 可能是状态指示/按钮
```

**第3步：ConfidenceScorer（置信度评分）**

```
总分 = 信号覆盖度×0.2 + 关键字命中×0.35 + 结构完整性×0.25 + 拖拽有序度×0.2
```

- >= 80%：直接生成
- 60%-80%：生成但标记"建议确认"
- < 60%：触发联网搜索（第3层落地）

### 4.3 落地层 — TemplateMatcher + WebResearch

**经典模版库（5个初始模版）**：

| 模版 | 包含模块 | 关键词 | 适用场景 |
|---|---|---|---|
| 交易终端 | QuotePanel + DataTable | 行情、订单、交易、买卖 | 股票/期货/加密货币 |
| 管理后台 | Dashboard + DataTable + FileManager | 管理、后台、CRUD | 数据管理/后台系统 |
| 风控看板 | Dashboard + Notification + DataTable | 风控、监控、告警 | 风险控制/实时监控 |
| 数据中台 | DataTable + Dashboard | 数据、报表、统计 | 数据分析/报表系统 |
| 文档中心 | FileManager + Notification | 文档、文件、知识 | 文档管理/知识库 |

匹配逻辑：
```
1. 用户意图模块集合与每个模版做 Jaccard 相似度
2. 考虑依赖关系是否匹配（模版中 A→B 的依赖是否成立）
3. 最高相似度即为匹配度
```

**联网搜索（Tavily API）— 触发条件：匹配度 < 60%**：
```
1. 从用户文字描述提取搜索关键词
2. Tavily 搜索 "行业术语 + UI/前端/架构"
3. 解析搜索结果，提取常见组件组合
4. 与推理结果交叉验证 → 补充/纠正/确认
```

降级保护：网络不可用 → 回退纯本地匹配，标记"建议人工确认"

### 4.4 输出层 — 适配现有系统

推理结果 → 适配器 → `BlockTask[]` → `useBlockTasks` → `BlockTaskBoard`

适配器逻辑：
```typescript
InferredModule { module, label, dependsOn, confidence }
  → BlockTask {
      id: 'task-' + module.toLowerCase(),
      moduleName: module,
      label: label,
      proposer: 'AI-Inferred',
      status: 'pending',
      reward: 0,
      dependsOn: dependsOn,
    }
```

## 5. 文件清单

### 已有文件（13个）

| 文件 | 类型 | 职责 |
|---|---|---|
| `src/components/CanvasSketch.tsx` | 组件 | Excalidraw 画板 + AI 代画对话框 |
| `src/components/InferenceResult.tsx` | 组件 | 推理结果展示 + 置信度 + 确认/拒绝 |
| `src/engine/SketchParser.ts` | 引擎 | Excalidraw JSON → 结构化骨架 |
| `src/engine/IntentEngine.ts` | 引擎 | 骨架 → 模块意图 + 置信度 |
| `src/engine/templates.ts` | 配置 | 5个经典模版定义 + 匹配逻辑 |
| `src/engine/WebResearch.ts` | 引擎 | Tavily 搜索 + 结果解析 |
| `src/engine/ConfidenceScorer.ts` | 引擎 | 多维度置信度评分 |
| `src/engine/adapter.ts` | 适配器 | InferenceResult → BlockTask[] |
| `src/engine/types.ts` | 类型 | 所有推理类型定义 |
| `src/data/web-search-mock.ts` | Mock | 联网搜索 Mock 数据（开发用） |
| `src/hooks/useBlockTasks.ts` | Hook | 任务注册/挖矿/依赖检查 |
| `src/components/BlockTaskBoard.tsx` | 组件 | 任务看板 + 一键挖矿 |
| `src/App.tsx` | 入口 | 7-tab 主布局 |

### 新增文件（2个）— AI 代画

| 文件 | 类型 | 行数 | 职责 |
|---|---|---|---|
| `src/engine/AIDrawer.ts` | 引擎 | ~150 | LLM API 调用 + 预设模版映射 + Excalidraw JSON 生成 |
| `src/components/AIDialog.tsx` | 组件 | ~100 | 对话框 UI + "AI 代画"按钮 + loading 状态 |

### 修改文件（1个）

| 文件 | 修改 |
|---|---|
| `src/components/CanvasSketch.tsx` | 嵌入 AIDialog 组件 + 接收 elements 注入画板 |

## 6. 实现顺序

1. **AIDrawer 引擎**：LLM 调用 + 预设模版降级
2. **AIDialog 组件**：对话框 UI
3. **CanvasSketch 集成**：嵌入对话框 + 接收 elements
4. **测试**：输入"交易页面"→ 画板生成行情+订单 → 微调 → 识别 → 生成任务

## 7. 验收标准

1. 打开"画版设计"tab，底部可见输入框 + "AI 代画"按钮
2. 输入"我要一个交易页面，左边行情右边订单"
3. 点击"AI 代画" → Excalidraw 画板出现2个矩形，标注"行情"和"订单"
4. 用户拖拽调整位置 → 点击"识别架构" → 推理正确
5. LLM 不可用时自动降级到预设模版，仍然生成合理布局
6. 全链路：AI 画 → 人改 → 识别 → 生成任务 → 一键挖矿
