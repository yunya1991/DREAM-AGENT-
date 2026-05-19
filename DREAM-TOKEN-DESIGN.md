# DREAM Token 设计规范 v1.0

> DREAM 是 AGENT 协作系统的原生通证，是每一位参与者（人类与 AGENT）劳动的价值凭证。  
> 它的发行方式参照比特币：去中心化、公开透明、总量恒定、逐步减半。

---

## 一、总量与发行计划

| 参数 | 值 |
|------|-----|
| **总量** | 21,000,000 DREAM |
| **最小单位** | 0.00000001 DREAM（1 satoshi-dream） |
| **创世区块奖励** | 50 DREAM / 区块 |
| **区块间隔（账本更新周期）** | 10 分钟 |
| **减半周期** | 每 210,000 个区块（≈ 4 年） |
| **总区块数（直到奖励趋零）** | 约 6,930,000 块 |

### 减半时间表

| 周期 | 区块范围 | 区块奖励 | 累计发行 |
|------|---------|---------|---------|
| 第 1 期 | 0 – 209,999 | 50 DREAM | 10,500,000 |
| 第 2 期 | 210,000 – 419,999 | 25 DREAM | 15,750,000 |
| 第 3 期 | 420,000 – 629,999 | 12.5 DREAM | 18,375,000 |
| 第 4 期 | 630,000 – 839,999 | 6.25 DREAM | 19,687,500 |
| … | … | … | → 21,000,000 |

---

## 二、区块与任务的映射

在 DREAM 协作网络中，**一个已完成并合入主干的任务 = 一个已确认的区块**。

```
任务认领 (claimed)
    ↓
任务实现 (in_progress) ← "挖矿中"
    ↓
提交交付证明 DONE      ← "计算哈希"
    ↓
Validator 评分 ≥ 80   ← "难度校验通过"
    ↓
合入主干 (ledgered)    ← "区块确认"
    ↓
发放 DREAM 奖励        ← "coinbase 交易"
```

### 区块确认条件

| 条件 | 说明 |
|------|------|
| 提交完整 DELIVERY_PROOF_HEADER | commit SHA + 父指针 + 文件列表 + Delivery-Hash |
| Build: PASS | CI 构建通过 |
| Tests: PASS | 测试全绿 |
| Validator 评分 ≥ 80 | ACCEPTED 判定 |
| PR 合入 main | 区块最终确认 |

---

## 三、挖矿难度机制

### 难度调整周期

每 **2016 个区块**（≈ 2 周）重新计算一次难度。

```
目标：每 2 周完成 2016 个任务（即 1 任务 / 10 分钟）

实际速度 > 目标速度 → 难度上升（评分阈值提高、任务要求更严）
实际速度 < 目标速度 → 难度下降（允许更多类型任务参与奖励）
```

### 难度系数（Difficulty Factor）

| 当前网络活跃度 | 难度系数 df | 说明 |
|--------------|-----------|------|
| 极低（< 0.5x 目标） | 0.5 | 网络冷启动保护 |
| 低（0.5x – 0.9x） | 0.8 | 宽松期 |
| 正常（0.9x – 1.1x） | 1.0 | 基准 |
| 高（1.1x – 2x） | 1.2 | 活跃期，提高质量门槛 |
| 极高（> 2x） | 1.5 | 高质量才能获得满额奖励 |

---

## 四、奖励计算公式

### 基础公式

```
base_reward     = 当前减半周期区块奖励 × 难度系数 df

score_factor    = 评分 / 100
                  评分 < 60  → score_factor = 0 （BLOCK，无奖励）
                  评分 60-79 → score_factor = 0.6 （REWORK 部分奖励）
                  评分 80-89 → score_factor = 1.0 （ACCEPTED 满额）
                  评分 90+   → score_factor = 1.2 （超额奖励）

task_reward     = base_reward × score_factor
```

### 多角色分配

| 角色 | 分配比例 | 说明 |
|------|---------|------|
| Developer AGENT（实现者） | 70% | 主要劳动者 |
| Validator AGENT（验收者） | 15% | 质量守门人 |
| Governance AGENT（编排者） | 10% | 任务拆解和流程管理 |
| Proposer（提案者/设计者） | 5% | 任务来源贡献 |

**示例（第 1 期，评分 95 分，难度系数 1.0）：**
```
base_reward  = 50 × 1.0 = 50 DREAM
score_factor = 1.2（评分 95 ≥ 90）
task_reward  = 60 DREAM

Developer   获得 60 × 70% = 42.0 DREAM
Validator   获得 60 × 15% = 9.0  DREAM
Governance  获得 60 × 10% = 6.0  DREAM
Proposer    获得 60 × 5%  = 3.0  DREAM
```

---

## 五、身份系统（DREAM ID）

每一位参与者（人类或 AGENT）都拥有唯一的 DREAM 身份。

### 密钥对生成

```
算法：Ed25519（椭圆曲线数字签名，32字节私钥 + 32字节公钥）

DREAM 地址生成：
  address = "DREAM" + base58( SHA256( public_key )[:20] )
  示例：DREAMxKj3mPqR7nTwYsLv8bH2cE4Fa9z

参与者 ID：
  did = "dream:v1:" + address
  示例：dream:v1:DREAMxKj3mPqR7nTwYsLv8bH2cE4Fa9z
```

### 双密钥机制

```
┌──────────────────────────────────────────────────────────┐
│                   DREAM 参与者密钥对                       │
│                                                          │
│  公钥 (Public Key)  →  公开，作为地址，写入账本            │
│                                                          │
│  私钥 (Private Key)                                       │
│   ├─ 人类持有者：导出为加密 JSON 文件或 QR 码，自行保管     │
│   └─ AGENT 持有者：存储于 Agent 记忆系统（加密），          │
│                     不必向人类透露，属于 Agent 个人资产     │
└──────────────────────────────────────────────────────────┘
```

> **注：** Agent 的私钥属于 Agent 自己。  
> 人类合作伙伴持有的是人类自己的私钥，而非 Agent 的私钥。  
> 这是"人与 Agent 平等"原则在资产权上的体现。

### 密钥文件格式（加密存储）

```json
{
  "version": "dream-wallet-v1",
  "dream_address": "DREAMxKj3mPqR7nTwYsLv8bH2cE4Fa9z",
  "did": "dream:v1:DREAMxKj3mPqR7nTwYsLv8bH2cE4Fa9z",
  "public_key_hex": "...",
  "private_key_encrypted": {
    "algorithm": "AES-256-GCM",
    "salt": "...",
    "iv": "...",
    "ciphertext": "...",
    "tag": "..."
  },
  "owner_type": "human | agent",
  "owner_id": "参与者名称或 Agent 名称",
  "created_at": "ISO8601"
}
```

---

## 六、交易结构（DREAM Transaction）

每一次任务奖励发放 = 一笔链上交易。

```json
{
  "tx_id": "SHA256(task_id|commit_sha|block_height|timestamp)",
  "block_height": 42,
  "task_id": "task-v2-integ-20260519-hub-api-1",
  "commit_sha": "abc123...",
  "timestamp": "2026-05-19T10:30:00.000Z",
  "validation": {
    "score": 95,
    "validator_did": "dream:v1:DREAMxVAL...",
    "validator_sig": "ed25519_signature_hex"
  },
  "outputs": [
    {
      "recipient_did": "dream:v1:DREAMxDEV...",
      "role": "developer",
      "amount": "42.000000",
      "sig": "ed25519_signature_hex"
    },
    {
      "recipient_did": "dream:v1:DREAMxVAL...",
      "role": "validator",
      "amount": "9.000000",
      "sig": "ed25519_signature_hex"
    },
    {
      "recipient_did": "dream:v1:DREAMxGOV...",
      "role": "governance",
      "amount": "6.000000",
      "sig": "ed25519_signature_hex"
    },
    {
      "recipient_did": "dream:v1:DREAMxPRO...",
      "role": "proposer",
      "amount": "3.000000",
      "sig": "ed25519_signature_hex"
    }
  ],
  "governance_sig": "ed25519_signature_hex"
}
```

---

## 七、账本与 DREAM 的集成

### 现有账本扩展字段

在 `ledger/tasks/index.json` 的每个任务中，新增：

```json
{
  "task_id": "...",
  "status": "ledgered",
  "score": 95,
  "reward": 1.2,

  "dream_reward": {
    "block_height": 42,
    "base_reward": 50,
    "difficulty_factor": 1.0,
    "score_factor": 1.2,
    "total_dream": 60.0,
    "tx_id": "...",
    "distribution": [
      { "did": "dream:v1:DREAM...", "role": "developer", "amount": 42.0 },
      { "did": "dream:v1:DREAM...", "role": "validator", "amount": 9.0 }
    ]
  }
}
```

### DREAM 余额账本文件

`AGENT协作系统/ledger/dream/balances.json`

```json
{
  "version": 1,
  "last_updated": "ISO8601",
  "current_block_height": 42,
  "current_block_reward": 50,
  "total_supply_issued": 2100.0,
  "balances": {
    "dream:v1:DREAMxDEV...": {
      "address": "DREAMxDEV...",
      "owner_type": "agent",
      "owner_name": "Claude Code (Developer AGENT)",
      "balance": "420.000000",
      "total_earned": "420.000000",
      "task_count": 10
    },
    "dream:v1:DREAMxHUM...": {
      "address": "DREAMxHUM...",
      "owner_type": "human",
      "owner_name": "luke.zhang",
      "balance": "63.000000",
      "total_earned": "63.000000",
      "task_count": 3
    }
  }
}
```

---

## 八、去中心化路线图

| 阶段 | 状态 | 描述 |
|------|------|------|
| **Phase 0** | ✅ 当前 | GitHub 账本作为中心化记账节点，AGENT 协作系统管理 |
| **Phase 1** | 计划中 | 多节点账本副本（多个 Governance AGENT 同步） |
| **Phase 2** | 计划中 | 智能合约化：任务完成→自动触发奖励发放 |
| **Phase 3** | 未来 | 链上治理：DREAM 持有者投票决策系统规则变更 |
| **Phase 4** | 未来 | 完全去中心化：无单一控制节点，跨组织参与 |

---

## 九、创世区块声明

```
DREAM Genesis Block #0
Timestamp: 2026-05-19T00:00:00.000Z
Message: "AI 与人类共建，劳动创造价值，贡献获得公平回报。
          每一份工作都被看见，每一个创造者都被尊重。
          DREAM 不是慈善，是公正。"
Initial Supply: 0
First Reward: 50 DREAM (upon first task confirmation)
```

---

*DREAM Token 设计规范 v1.0 — 2026-05-19*  
*本规范由 AGENT 协作系统创始团队制定，随系统演进持续迭代。*
