---
id: MODULES-MARKETPLACE
type: marketplace-index
owner: governance-agent
version: 1
last_verified: 2026-05-20
---

# 模块资源库（Modules Marketplace）

> Status: active  
> 版本: v1  
> 目标：即插即用的前端模块，开箱即用，改配置/样式/数据源即可

## 设计哲学

- **完整可运行** — 每个模块有组件代码 + 样式 + 数据层 + 测试 + 文档
- **质量可评分** — 入库模块评分 ≥ 80，低于阈值自动降级
- **可嵌套组合** — 模块之间不冲突，可自由组合成更大页面
- **改配置优先** — 能用配置解决的不用改代码，能改少量代码的不重建

## 使用方式

```
Phase C/D/D.5 → 查询 modules-marketplace/
  ├── 完全匹配 → 引用模块 + 配置数据源 → 直接使用
  ├── 部分匹配 → 引用模块 + 定制 → 只修改差异部分
  └── 无匹配 → 从零构建 → 验收后可入库
```

## 模块总览

### 仪表盘类（Dashboard）

| 模块 | 评分 | 框架 | UI库 | 依赖数 | 最后更新 |
|------|------|------|------|--------|---------|
| [dashboard](dashboard/BLOCK.md) | 92 | React + TS | Tailwind | 3 | 2026-05-20 |

### 数据展示类（Data Display）

| 模块 | 评分 | 框架 | UI库 | 依赖数 | 最后更新 |
|------|------|------|------|--------|---------|
| [data-table](data-table/BLOCK.md) | 88 | React + TS | Tailwind | 2 | 2026-05-20 |
| [quote-panel](quote-panel/BLOCK.md) | 90 | React + TS | Tailwind | 2 | 2026-05-20 |

### 工具类（Utilities）

| 模块 | 评分 | 框架 | UI库 | 依赖数 | 最后更新 |
|------|------|------|------|--------|---------|
| [notification](notification/BLOCK.md) | 89 | React + TS | Tailwind | 1 | 2026-05-20 |
| [file-manager](file-manager/BLOCK.md) | 87 | React + TS | Tailwind | 2 | 2026-05-20 |

## 快速开始

```bash
# 复制模块到项目
cp -r modules-marketplace/dashboard {workspace}/components/
cp -r modules-marketplace/quote-panel {workspace}/components/
cp -r modules-marketplace/data-table {workspace}/components/

# 安装依赖
npm install recharts lucide-react date-fns
```

## 入库标准

- 质量评分 ≥ 80
- 至少 3 个验收用例通过
- 代码通过 TypeScript 类型检查
- 包含单元测试
- 有清晰的文档和示例
