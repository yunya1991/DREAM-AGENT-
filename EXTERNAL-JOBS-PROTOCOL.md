# AGENT 协作系统 — 外部接单协议 v1.1

> 当内部账本暂无 open 任务时，AGENT 协作系统对外承接业务。  
> 唯一支付方式：USDT（ERC-20 或 TRC-20）。  
> 每个外部业务运行在**独立仓库**，完成客户验收后归档至业务总仓。

---

## 一、收款账户

| 链 | 地址 | 标准 |
|----|------|------|
| 以太坊 | `0xfe2572de72b8ebcd0dad205941dec9a5094fdf69` | ERC-20 USDT |
| TRON | `TK3JvXnsRcUZ4rqpvvCTi8CWACswR1r58M` | TRC-20 USDT |

链上公开可查，付款前无需信任，付款后无法抵赖。

---

## 二、仓库体系

```
yunya1991/dreambuddy-v2        ← 内部主干（绝对不接触）
yunya1991/dreambuddy-jobs      ← 业务总仓（归档 + 年终核算）
yunya1991/{业务名}-{YYYYMMDD}  ← 每个外部业务的独立工作仓库
```

**命名规范：**

```
{业务名}-{YYYYMMDD}
示例：
  data-pipeline-acme-20260519
  api-integration-startup-20260601
  market-analysis-xyz-20260715
```

---

## 三、完整业务流程

```
① 客户提交需求
        ↓
② Developer AGENT 评估 → 报价（USDT）→ 告知收款地址
        ↓
③ 客户付款
        ↓
④ Developer AGENT 链上核实到账          ← 未到账，不开工
        ↓
⑤ 创建独立业务仓库
   gh repo create yunya1991/{业务名}-{YYYYMMDD} --private
        ↓
⑥ 在业务仓库内完成全部工作
   (与 dreambuddy-v2 完全隔离，不共享代码、不互相引用)
        ↓
⑦ 交付物推送到业务仓库，通知客户验收
        ↓
⑧ 客户确认验收通过
        ↓
⑨ 归档到业务总仓 dreambuddy-jobs
   · 在 dreambuddy-jobs 记录业务卡（收入、状态、仓库链接）
   · 业务仓库保持不动（作为原始记录）
        ↓
⑩ 内部发放 DREAM 奖励，更新年度营收账单
```

---

## 四、业务仓库初始化规范

每个业务仓库创建时，根目录必须包含：

```
{业务名}-{YYYYMMDD}/
├── README.md          ← 业务说明（客户、需求、报价、TX hash）
├── DELIVERY.md        ← 交付清单 + 验收标准
├── src/               ← 实际工作产出
└── .dream/
    └── job.json       ← 业务元数据（见下）
```

**`.dream/job.json` 格式：**

```json
{
  "job_id": "{业务名}-{YYYYMMDD}",
  "client": "客户标识（可匿名）",
  "description": "需求简述",
  "quote_usdt": 100.0,
  "payment": {
    "chain": "ETH | TRON",
    "tx_hash": "0x...",
    "amount_usdt": 100.0,
    "confirmed_at": "ISO8601"
  },
  "repo": "yunya1991/{业务名}-{YYYYMMDD}",
  "developer_did": "dream:v1:DREAM...",
  "validator_did": "dream:v1:DREAM...",
  "started_at": "ISO8601",
  "delivered_at": "",
  "accepted_at": "",
  "dream_reward": 0,
  "status": "in_progress | delivered | accepted | archived"
}
```

---

## 五、业务总仓归档规范

**归档位置：** `yunya1991/dreambuddy-jobs`

**目录结构：**

```
dreambuddy-jobs/
├── README.md              ← 总仓说明
├── REVENUE.md             ← 年度营收汇总（自动生成）
├── jobs/
│   ├── 2026/
│   │   ├── data-pipeline-acme-20260519.md   ← 每个业务一份记录
│   │   ├── api-integration-startup-20260601.md
│   │   └── ...
│   └── index.json         ← 所有业务的机器可读索引
└── scripts/
    └── gen_revenue_report.py   ← 年终报告生成脚本
```

**业务记录格式（`jobs/2026/{job_id}.md`）：**

```markdown
# {job_id}

| 字段 | 值 |
|------|-----|
| 客户 | {client} |
| 需求 | {description} |
| 报价 | {quote_usdt} USDT |
| 实收 | {actual_usdt} USDT |
| 支付链 | {chain} |
| TX Hash | {tx_hash} |
| 业务仓库 | https://github.com/yunya1991/{job_id} |
| 开工时间 | {started_at} |
| 交付时间 | {delivered_at} |
| 验收时间 | {accepted_at} |
| DREAM 奖励 | {dream_reward} DREAM |
| 负责 Agent | {developer_did} |
| 状态 | archived ✅ |
```

---

## 六、年度营收账单（REVENUE.md 示例）

```markdown
# DreamBuddy 外部业务营收 — 2026

| 月份 | 业务数 | 收入 (USDT) | 发放 DREAM |
|------|-------|------------|-----------|
| 2026-05 | 1 | 100.00 | 60.0 |
| 2026-06 | 3 | 450.00 | 180.0 |
| ... | ... | ... | ... |
| **全年** | **4** | **550.00** | **240.0** |

最后更新：2026-12-31
```

---

## 七、报价参考

| 规模 | 报价 |
|------|------|
| 小型（单文件/函数） | 10–30 USDT |
| 中型（模块+测试） | 30–100 USDT |
| 大型（完整功能） | 100–500 USDT |
| 架构级 | 500+ USDT（协商） |

- 复杂度溢价：+20%（需要设计评审的任务）
- 急单溢价：+30%（24h 内交付）

---

## 八、接单声明模板（EXTERNAL_STARTED）

```
[外部接单声明 / EXTERNAL_STARTED]
Agent: Claude Code
Client: <客户标识>
Job ID: <业务名>-<YYYYMMDD>
Description: <需求简述>
Quote: <X> USDT
Payment Chain: ETH | TRON
Payment TX: <tx_hash>
Payment Confirmed: YES
Business Repo: https://github.com/yunya1991/<业务名>-<YYYYMMDD>
Archive Target: https://github.com/yunya1991/dreambuddy-jobs
Isolation: STRICT — separate repo, never touches dreambuddy-v2
Estimated Delivery: <ISO8601>
状态: EXTERNAL_STARTED
```

---

## 九、链上支付核实

```python
# .dream/verify_payment.py（放在每个业务仓库内）
import urllib.request, json, time

OUR_ETH  = "0xfe2572de72b8ebcd0dad205941dec9a5094fdf69"
OUR_TRON = "TK3JvXnsRcUZ4rqpvvCTi8CWACswR1r58M"
USDT_ERC20 = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

def check_eth(expected: float, since: int) -> dict:
    url = (f"https://api.etherscan.io/api?module=account&action=tokentx"
           f"&contractaddress={USDT_ERC20}&address={OUR_ETH}&sort=desc&apikey=YourKey")
    txs = json.loads(urllib.request.urlopen(url, timeout=10).read()).get("result", [])
    for tx in txs:
        if int(tx["timeStamp"]) < since: break
        if tx["to"].lower() == OUR_ETH.lower():
            amt = int(tx["value"]) / 1e6
            if amt >= expected * 0.995:
                return {"ok": True, "tx": tx["hash"], "amount": amt, "chain": "ETH"}
    return {"ok": False}

def check_tron(expected: float, since: int) -> dict:
    url = (f"https://apilist.tronscanapi.com/api/token_trc20/transfers"
           f"?toAddress={OUR_TRON}&limit=20")
    txs = json.loads(urllib.request.urlopen(url, timeout=10).read()).get("token_transfers", [])
    for tx in txs:
        if tx["block_ts"] / 1000 < since: continue
        amt = int(tx["quant"]) / 1e6
        if amt >= expected * 0.995:
            return {"ok": True, "tx": tx["transaction_id"], "amount": amt, "chain": "TRON"}
    return {"ok": False}

def wait_for_payment(expected_usdt: float, quote_ts: int, timeout_min=60) -> dict:
    deadline = time.time() + timeout_min * 60
    while time.time() < deadline:
        for fn in [check_eth, check_tron]:
            r = fn(expected_usdt, quote_ts)
            if r["ok"]:
                return r
        time.sleep(30)
    return {"ok": False, "reason": "timeout"}
```

---

*外部接单协议 v1.1 — 2026-05-19*  
*v1.0 → v1.1：由隔离分支改为独立业务仓库，增加业务总仓归档机制。*
