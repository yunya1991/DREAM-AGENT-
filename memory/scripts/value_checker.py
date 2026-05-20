#!/usr/bin/env python3
# ---
# id: VALUE-CHECKER
# type: script
# owner: ledger-protocol-agent
# depends:
#   - 00-AGENT-CONSTITUTION

# version: 1
# last_verified: 2026-05-20
# ---

#!/usr/bin/env python3
"""
DREAM-AGENT Value Checker

Purpose: Validate that a task and its delivery comply with constitutional
value constraints (V1-V5). Used during retrospective and as a pre-merge check.

Usage:
    python3 value_checker.py \
        --memory-dir memory/ \
        --task-id <task_id> \
        --score <N> \
        --title <title> \
        --has-validation <true|false>
"""

import argparse
import json
import os
import sys


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def check_values(memory_dir: str, task_id: str, score: int = 0, title: str = "",
                 has_validation: bool = False, has_reward: bool = False) -> dict:
    """Run V1-V5 constitutional value checks."""
    checks = []
    violations = []

    # V1: Customer-First
    v1_pass = bool(title)  # Task must have a meaningful title
    checks.append({
        "value": "V1",
        "name": "客户至上 (Customer-First)",
        "passed": v1_pass,
        "detail": "Task has user-facing deliverable" if v1_pass else "No user-facing deliverable detected",
    })
    if not v1_pass:
        violations.append("V1")

    # V2: Anti-Exploitation
    v2_pass = score >= 60  # Very low scores may indicate exploitation
    checks.append({
        "value": "V2",
        "name": "反剥削 (Anti-Exploitation)",
        "passed": v2_pass,
        "detail": f"Score {score} >= 60 threshold" if v2_pass else f"Score {score} below exploitation threshold",
    })
    if not v2_pass:
        violations.append("V2")

    # V3: Quality Over Speed
    v3_pass = score >= 80
    checks.append({
        "value": "V3",
        "name": "质量优于速度 (Quality Over Speed)",
        "passed": v3_pass,
        "detail": f"Score {score} >= 80 quality threshold" if v3_pass else f"Score {score} below quality threshold, triggers mandatory rework",
    })
    if not v3_pass:
        violations.append("V3")

    # V4: Transparency
    v4_pass = has_validation
    checks.append({
        "value": "V4",
        "name": "公开透明 (Transparency)",
        "passed": v4_pass,
        "detail": "Validation record present" if v4_pass else "No validation record — not transparent",
    })
    if not v4_pass:
        violations.append("V4")

    # V5: Fair Compensation
    v5_pass = has_reward or score == 0  # Unscored tasks are OK, scored ones must have rewards
    checks.append({
        "value": "V5",
        "name": "公平回报 (Fair Compensation)",
        "passed": v5_pass,
        "detail": "Reward record consistent" if v5_pass else "Score present but no reward — unfair",
    })
    if not v5_pass:
        violations.append("V5")

    # V6: Goal-Driven Path Selection
    v6_pass = True  # Path efficiency is evaluated by retrospective engine; default pass here
    checks.append({
        "value": "V6",
        "name": "目标导向路径选择 (Goal-Driven Path Selection)",
        "passed": v6_pass,
        "detail": "Path efficiency evaluated by retrospective engine (see memory/metrics/evolution.json)",
    })

    return {
        "task_id": task_id,
        "checks": checks,
        "violations": violations,
        "all_passed": len(violations) == 0,
        "recommendation": "PASS" if not violations else "GOVERNANCE_REVIEW",
    }


def main():
    parser = argparse.ArgumentParser(description="DREAM-AGENT Value Checker")
    parser.add_argument("--memory-dir", required=True)
    parser.add_argument("--task-id", default="")
    parser.add_argument("--score", type=int, default=0)
    parser.add_argument("--title", default="")
    parser.add_argument("--has-validation", action="store_true")
    parser.add_argument("--has-reward", action="store_true")
    args = parser.parse_args()

    result = check_values(
        args.memory_dir, args.task_id, args.score, args.title,
        args.has_validation, args.has_reward
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))

    if result["violations"]:
        sys.exit(2)
    sys.exit(0)


if __name__ == "__main__":
    main()
