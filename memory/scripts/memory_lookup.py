#!/usr/bin/env python3
# ---
# id: MEMORY-LOOKUP
# type: script
# owner: ledger-protocol-agent
# depends:
#   - MEMORY-INDEX

# version: 1
# last_verified: 2026-05-20
# ---

#!/usr/bin/env python3
"""
DREAM-AGENT Memory Lookup — Pre-Flight Check

Purpose: Before starting any task, query the memory system for:
1. Relevant lessons to avoid repeating mistakes
2. Optimal paths to follow the proven shortest approach
3. Known patterns that apply to the current context

Usage:
    python3 memory_lookup.py \
        --memory-dir memory/ \
        --task-id <task_id> \
        --task-type <task_type> \
        --files <file1,file2,...>
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


def query_lessons(memory_dir: str, task_type: str = None) -> list:
    """Find active lessons relevant to the task type."""
    index = load_json(os.path.join(memory_dir, "index.json"))
    if not index:
        return []
    lessons = []
    for lid, meta in index.get("lessons", {}).items():
        if meta.get("status") == "active":
            lessons.append({
                "lesson_id": lid,
                "severity": meta.get("severity", "medium"),
                "prevention_rule": f"Review lesson {lid} for applicable prevention rules",
            })
    return lessons


def query_optimal_path(memory_dir: str, task_type: str) -> dict | None:
    """Find the best known path for this task type."""
    index = load_json(os.path.join(memory_dir, "index.json"))
    if not index:
        return None
    paths = index.get("paths", {})
    best = None
    best_eff = 0
    for pid, meta in paths.items():
        if task_type in pid or task_type in meta.get("file", ""):
            path_data = load_json(os.path.join(memory_dir, meta["file"]))
            if path_data:
                eff = path_data.get("metrics", {}).get("path_efficiency", 0)
                if eff > best_eff:
                    best = path_data
                    best_eff = eff
    return best


def query_patterns(memory_dir: str, files_to_modify: list) -> list:
    """Check if any known patterns are triggered by the files being modified."""
    index = load_json(os.path.join(memory_dir, "index.json"))
    if not index:
        return []
    alerts = []
    for pid, meta in index.get("patterns", {}).items():
        pattern = load_json(os.path.join(memory_dir, meta["file"]))
        if not pattern:
            continue
        triggers = pattern.get("trigger_conditions", [])
        for trigger in triggers:
            for f in files_to_modify:
                if f in trigger:
                    alerts.append({
                        "pattern_id": pid,
                        "name": pattern.get("name", pid),
                        "risk_level": pattern.get("risk_level", "medium"),
                        "required_execution_mode": pattern.get("required_execution_mode", ""),
                    })
    return alerts


def main():
    parser = argparse.ArgumentParser(description="DREAM-AGENT Memory Pre-Flight Lookup")
    parser.add_argument("--memory-dir", required=True, help="Path to memory/ directory")
    parser.add_argument("--task-id", default="", help="Task ID (for lesson filtering)")
    parser.add_argument("--task-type", default="unknown", help="Task type")
    parser.add_argument("--files", default="", help="Comma-separated files to modify")
    args = parser.parse_args()

    files_to_modify = [f.strip() for f in args.files.split(",") if f.strip()] if args.files else []

    warnings = query_lessons(args.memory_dir, args.task_type)
    optimal_path = query_optimal_path(args.memory_dir, args.task_type)
    pattern_alerts = query_patterns(args.memory_dir, files_to_modify)

    result = {
        "task_id": args.task_id,
        "task_type": args.task_type,
        "warnings": warnings,
        "optimal_path": {
            "path_id": optimal_path["path_id"] if optimal_path else None,
            "steps": optimal_path.get("steps", []) if optimal_path else [],
            "efficiency_score": optimal_path.get("metrics", {}).get("path_efficiency") if optimal_path else None,
        },
        "pattern_alerts": pattern_alerts,
        "constitutional_checks": ["V1", "V2", "V3", "V4", "V5"],
        "recommendation": "PROCEED" if not any(w.get("severity") == "high" for w in warnings) else "REVIEW",
    }

    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
