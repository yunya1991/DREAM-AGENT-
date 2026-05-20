#!/usr/bin/env python3
# ---
# id: PATH-OPTIMIZER
# type: script
# owner: ledger-protocol-agent
# depends:
#   - MEMORY-INDEX

# version: 1
# last_verified: 2026-05-20
# ---

#!/usr/bin/env python3
"""
DREAM-AGENT Path Optimizer

Purpose: Compare actual execution path against known optimal paths.
Suggests the best proven path for a given task type.

Usage:
    python3 path_optimizer.py \
        --memory-dir memory/ \
        --task-type <task_type> \
        --actual-steps <N>
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


def find_all_paths(memory_dir: str, task_type: str) -> list:
    """Find all paths for a given task type."""
    index = load_json(os.path.join(memory_dir, "index.json"))
    if not index:
        return []
    paths = []
    for pid, meta in index.get("paths", {}).items():
        path_data = load_json(os.path.join(memory_dir, meta["file"]))
        if path_data and path_data.get("task_type") == task_type:
            paths.append(path_data)
    return paths


def recommend_path(memory_dir: str, task_type: str, actual_steps: int = None) -> dict:
    """Recommend the best known path for a task type."""
    paths = find_all_paths(memory_dir, task_type)
    if not paths:
        return {"recommendation": "no_known_path", "paths_available": 0}

    # Sort by efficiency
    paths.sort(key=lambda p: p.get("metrics", {}).get("path_efficiency", 0), reverse=True)
    best = paths[0]

    result = {
        "recommendation": "follow_optimal",
        "best_path": {
            "path_id": best["path_id"],
            "efficiency": best.get("metrics", {}).get("path_efficiency"),
            "steps": best.get("steps", []),
            "validation_count": best.get("validation_count", 0),
            "proven_by_tasks": best.get("proven_by_task_ids", []),
        },
        "all_paths": [
            {"path_id": p["path_id"], "efficiency": p.get("metrics", {}).get("path_efficiency")}
            for p in paths
        ],
        "anti_patterns_to_avoid": best.get("anti_patterns_to_avoid", []),
    }

    if actual_steps is not None:
        ideal = len(best.get("steps", []))
        result["comparison"] = {
            "your_steps": actual_steps,
            "optimal_steps": ideal,
            "difference": actual_steps - ideal,
            "suggestion": "You took more steps than optimal" if actual_steps > ideal else "You matched or beat optimal",
        }

    return result


def main():
    parser = argparse.ArgumentParser(description="DREAM-AGENT Path Optimizer")
    parser.add_argument("--memory-dir", required=True)
    parser.add_argument("--task-type", required=True)
    parser.add_argument("--actual-steps", type=int, default=None)
    args = parser.parse_args()

    result = recommend_path(args.memory_dir, args.task_type, args.actual_steps)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
