#!/usr/bin/env python3
# ---
# id: RETROSPECTIVE-ENGINE
# type: script
# owner: ledger-protocol-agent
# depends:
#   - MEMORY-INDEX

# version: 1
# last_verified: 2026-05-20
# ---

#!/usr/bin/env python3
"""
DREAM-AGENT Memory Retrospective Engine

Trigger: Task reaches Phase 8 (archived) OR is BLOCKED OR a fork occurs.
Purpose: Convert execution history into structured memory (episodes, lessons,
         paths, patterns, value checks) and update evolution metrics.

Usage:
    python3 retrospective_engine.py \
        --task-index ledger/tasks/index.json \
        --memory-dir memory/ \
        --task-id <task_id> \
        --trigger <archived|blocked|fork>
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone


def load_json(path):
    """Load a JSON file, return None if not found."""
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    """Atomically write JSON to disk."""
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def lesson_hash(root_cause: str, category: str, existing_lessons: list) -> str:
    """
    Normalize and hash a root cause to detect duplicate lessons.
    If an existing lesson has >0.8 similarity, return that lesson_id.
    Simple normalization: lowercase, strip, collapse whitespace.
    """
    normalized = " ".join(root_cause.lower().strip().split())
    for lesson_id, lesson_data in existing_lessons.items():
        existing_norm = lesson_data.get("root_cause_normalized", "")
        # Simple containment check for now; real implementation would use embeddings
        if normalized in existing_norm or existing_norm in normalized:
            return lesson_id
    return hashlib.sha256(f"{category}:{normalized}".encode()).hexdigest()[:12]


def load_existing_lessons(memory_dir: str) -> dict:
    """Load all existing lessons from memory/lessons/."""
    lessons = {}
    lessons_index = os.path.join(memory_dir, "index.json")
    idx = load_json(lessons_index)
    if not idx:
        return lessons
    for lesson_id, meta in idx.get("lessons", {}).items():
        path = meta.get("file", "")
        # Resolve relative to memory dir
        rel_path = os.path.normpath(os.path.join(memory_dir, path))
        data = load_json(rel_path)
        if data:
            # Ensure the file path is available for later saving
            data["_file_path"] = rel_path
            lessons[lesson_id] = data
        else:
            lessons[lesson_id] = {"_file_path": rel_path, "root_cause_normalized": meta.get("root_cause_normalized", lesson_id)}
    return lessons


def find_task(index_path: str, task_id: str) -> dict | None:
    """Find a task by ID in the ledger index."""
    tasks = load_json(index_path)
    if not tasks or "tasks" not in tasks:
        return None
    for task in tasks["tasks"]:
        if task.get("task_id") == task_id:
            return task
    return None


def infer_task_type(task: dict) -> str:
    """Infer task type from task metadata."""
    task_type = task.get("task_type", "unknown")
    title = task.get("title", "").lower()
    if any(kw in title for kw in ["skeleton", "骨架", "init", "初始化"]):
        return "service_skeleton"
    if any(kw in title for kw in ["page", "页面", "component", "组件"]):
        return "frontend_page"
    if any(kw in title for kw in ["type", "类型", "contract", "契约"]):
        return "shared_boundary_change"
    return task_type


def calculate_path_efficiency(task: dict, actual_steps: int) -> float:
    """Calculate path efficiency as ideal_steps / actual_steps."""
    task_type = task.get("task_type", "parallel")
    # Ideal step counts by type (minimum viable steps)
    ideal_map = {
        "parallel": 5,
        "serial": 7,
        "shared-sync": 9,
    }
    ideal = ideal_map.get(task_type, 6)
    return min(1.0, ideal / max(1, actual_steps))


def run_retrospective(task_index_path: str, memory_dir: str, task_id: str, trigger: str):
    """Main retrospective engine."""
    print(f"[Retrospective] Starting for {task_id} (trigger: {trigger})")

    # ── Step 1: Gather Evidence ──
    task = find_task(task_index_path, task_id)
    if not task:
        print(f"[Retrospective] SKIP: Task {task_id} not found in {task_index_path}")
        print("[Retrospective] This is expected when the trigger is a PR merge without a matching ledger task.")
        sys.exit(0)

    memory_index = load_json(os.path.join(memory_dir, "index.json")) or {
        "version": 1,
        "last_updated": "",
        "entries": [],
        "lessons": {},
        "paths": {},
        "patterns": {},
        "stats": {"total_episodes": 0, "total_lessons": 0, "total_paths": 0,
                  "total_patterns": 0, "tasks_with_retrospective": 0, "tasks_without_retrospective": 0},
    }
    evolution = load_json(os.path.join(memory_dir, "metrics/evolution.json")) or {
        "version": 1, "generated_at": "", "by_task_type": {}, "by_agent": {},
        "system_health": {}, "trending": {},
    }
    existing_lessons = load_existing_lessons(memory_dir)

    now = datetime.now(timezone.utc).isoformat()
    task_type = infer_task_type(task)

    # ── Step 2: Create Experience Memory (Episode) ──
    score = task.get("score") or 0
    rework_cycles = 0  # Would be parsed from PR comments in real integration
    fork_count = task.get("fork_count", 0)
    created_at = task.get("created_at", "")
    archived_at = task.get("archived_at", now)

    # Calculate duration
    duration_minutes = 0
    if created_at and archived_at:
        try:
            t1 = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            t2 = datetime.fromisoformat(archived_at.replace("Z", "+00:00"))
            duration_minutes = max(1, int((t2 - t1).total_seconds() / 60))
        except (ValueError, TypeError):
            duration_minutes = 0

    actual_steps = 8 + rework_cycles * 3 + fork_count * 2  # Base 8 phases + overhead
    path_efficiency = calculate_path_efficiency(task, actual_steps)

    episode = {
        "task_id": task_id,
        "episode_type": "task_execution",
        "trigger": trigger,
        "task_type": task_type,
        "decomposition_path": {
            "goal_id": task.get("goal_id", ""),
            "parent_task_id": task.get("parent_task_id", ""),
            "phase_e_pointer": task.get("claim_pointer", ""),
            "phase_f_pointer": "",
        },
        "execution_path": [
            {"phase": "Phase 0-8", "status": task.get("status", "unknown")}
        ],
        "decisions": [],
        "outcome": {
            "final_status": task.get("status", "unknown"),
            "score": score,
            "rework_cycles": rework_cycles,
            "total_duration_minutes": duration_minutes,
            "delivery_pointer": task.get("delivery_pointer", ""),
            "fork_count": fork_count,
            "path_efficiency": round(path_efficiency, 3),
        },
        "customer_value_check": {
            "served_end_user": True,
            "user_facing_deliverable": task.get("title", ""),
            "exploitation_risk_flags": [],
            "value_checks": [],
        },
        "created_at": now,
        "retrospective_run": True,
        "retrospective_at": now,
    }

    episode_path = os.path.join(memory_dir, f"episodes/{task_id}.json")
    save_json(episode_path, episode)
    print(f"  [Episode] Written to {episode_path}")

    # ── Step 3: Value Check (V1-V5) ──
    value_constitution = load_json(os.path.join(memory_dir, "values/category_index.json"))
    value_results = []
    value_violations = []

    # V1: Customer-First
    v1_pass = task.get("title") != ""  # Simplified check
    value_results.append({"value": "V1", "passed": v1_pass})
    if not v1_pass:
        value_violations.append("V1")

    # V2: Anti-Exploitation
    v2_pass = score >= 80  # Low scores may indicate exploitation risk
    value_results.append({"value": "V2", "passed": v2_pass})
    if not v2_pass:
        value_violations.append("V2")

    # V3: Quality Over Speed
    v3_pass = score >= 80
    value_results.append({"value": "V3", "passed": v3_pass})
    if not v3_pass:
        value_violations.append("V3")

    # V4: Transparency
    v4_pass = task.get("validation_pointer") != ""
    value_results.append({"value": "V4", "passed": v4_pass})
    if not v4_pass:
        value_violations.append("V4")

    # V5: Fair Compensation
    v5_pass = task.get("reward") is not None or task.get("score") is None
    value_results.append({"value": "V5", "passed": v5_pass})
    if not v5_pass:
        value_violations.append("V5")

    episode["customer_value_check"]["value_checks"] = value_results
    save_json(episode_path, episode)

    # ── Step 4: Generate Lessons (if rework or fork or low score) ──
    new_lessons = []
    if rework_cycles > 0 or fork_count > 0 or score < 80:
        reason = "rework" if rework_cycles > 0 else ("fork" if fork_count > 0 else "low_score")
        lesson_id = f"lesson-auto-{task_id}-{reason}"
        h = lesson_hash(f"{task_type} {reason} on {task_id}", "pattern_mismatch", existing_lessons)
        if h in existing_lessons:
            # Increment count instead of creating new
            existing_lessons[h]["observed_count"] = existing_lessons[h].get("observed_count", 1) + 1
            existing_lessons[h]["last_observed"] = now
            # Persist the increment to disk
            lesson_path = existing_lessons[h].get("_file_path", "")
            if lesson_path and os.path.exists(lesson_path):
                # Strip internal key before saving
                save_data = {k: v for k, v in existing_lessons[h].items() if k != "_file_path"}
                save_json(lesson_path, save_data)
            # Also update the index metadata
            if h in memory_index.get("lessons", {}):
                memory_index["lessons"][h]["observed_count"] = existing_lessons[h]["observed_count"]
            print(f"  [Lesson] Incremented existing lesson {h} (count={existing_lessons[h]['observed_count']})")
        else:
            lesson = {
                "lesson_id": lesson_id,
                "category": "pattern_mismatch",
                "severity": "medium" if score >= 60 else "high",
                "first_observed": now[:10],
                "observed_count": 1,
                "last_observed": now,
                "task_ids": [task_id],
                "status": "active",
                "root_cause_normalized": f"{task_type} {reason}",
                "situation": f"Task {task_id} ({task_type}) experienced {reason}",
                "prevention_rule": f"Review optimal path for {task_type} before starting similar tasks",
            }
            lesson_dir = os.path.join(memory_dir, f"lessons/pattern_mismatch")
            os.makedirs(lesson_dir, exist_ok=True)
            save_json(os.path.join(lesson_dir, f"{lesson_id}.json"), lesson)
            new_lessons.append(lesson_id)
            memory_index["lessons"][lesson_id] = {
                "file": f"lessons/pattern_mismatch/{lesson_id}.json",
                "status": "active",
                "severity": lesson["severity"],
            }
            print(f"  [Lesson] Created {lesson_id}")

    # ── Step 5: Update Optimal Path ──
    path_id = f"path-{task_type}-v1"
    path_dir = os.path.join(memory_dir, f"paths/{task_type}")
    os.makedirs(path_dir, exist_ok=True)
    existing_path_file = os.path.join(path_dir, f"{path_id}.json")
    existing_path = load_json(existing_path_file)

    if existing_path:
        existing_path["proven_by_task_ids"].append(task_id)
        existing_path["last_validated"] = now
        existing_path["validation_count"] = existing_path.get("validation_count", 1) + 1
        avg_eff = (existing_path["metrics"].get("path_efficiency", 0) + path_efficiency) / 2
        existing_path["metrics"]["path_efficiency"] = round(avg_eff, 3)
        existing_path["metrics"]["total_time_minutes"] = (
            (existing_path["metrics"].get("total_time_minutes", 0) * (existing_path["validation_count"] - 1) + duration_minutes)
            // existing_path["validation_count"]
        )
        save_json(existing_path_file, existing_path)
        print(f"  [Path] Updated {path_id} (efficiency: {avg_eff:.3f})")
    else:
        path_data = {
            "path_id": path_id,
            "task_type": task_type,
            "task_pattern": task.get("title", ""),
            "proven_by_task_ids": [task_id],
            "steps": [{"order": i + 1, "phase": f"Phase {i}", "action": f"Complete Phase {i}"} for i in range(9)],
            "metrics": {
                "total_time_minutes": duration_minutes,
                "rework_cycles": rework_cycles,
                "quality_score": score,
                "path_efficiency": round(path_efficiency, 3),
            },
            "anti_patterns_to_avoid": new_lessons,
            "created_at": now,
            "last_validated": now,
            "validation_count": 1,
        }
        save_json(existing_path_file, path_data)
        memory_index["paths"][path_id] = {
            "file": f"paths/{task_type}/{path_id}.json",
            "validation_count": 1,
            "avg_efficiency": round(path_efficiency, 3),
        }
        print(f"  [Path] Created new optimal path {path_id}")

    # ── Step 6: Write Retrospective Summary ──
    retrospective_md = (
        f"# Retrospective: {task_id}\n\n"
        f"> Task: {task.get('title', 'N/A')}\n"
        f"> Type: {task_type}\n"
        f"> Trigger: {trigger}\n"
        f"> Date: {now}\n\n"
        f"## Outcome\n\n"
        f"- Final Status: {task.get('status', 'unknown')}\n"
        f"- Score: {score}\n"
        f"- Rework Cycles: {rework_cycles}\n"
        f"- Fork Count: {fork_count}\n"
        f"- Duration: {duration_minutes} minutes\n"
        f"- Path Efficiency: {path_efficiency:.3f}\n\n"
        f"## Value Checks\n\n"
        f"| Value | Passed |\n|---|---|\n"
        + "\n".join(f"| {v['value']} | {'PASS' if v['passed'] else 'FAIL'} |" for v in value_results)
        + f"\n\n## Lessons Generated\n\n"
        + (", ".join(f"`{lid}`" for lid in new_lessons) if new_lessons else "None (clean execution)")
        + f"\n\n## Optimal Path\n\n"
        f"Path ID: `{path_id}` (efficiency: {path_efficiency:.3f})\n"
    )
    retro_path = os.path.join(memory_dir, f"retrospectives/{task_id}.md")
    with open(retro_path, "w", encoding="utf-8") as f:
        f.write(retrospective_md)
    print(f"  [Retrospective] Written to {retro_path}")

    # ── Step 7: Update Memory Index ──
    entry = {
        "task_id": task_id,
        "episode_file": f"episodes/{task_id}.json",
        "lessons_generated": new_lessons,
        "path_id": path_id,
        "patterns_triggered": [],
        "value_checks_passed": [v["value"] for v in value_results if v["passed"]],
        "retrospective_summary_file": f"retrospectives/{task_id}.md",
    }
    memory_index["entries"].append(entry)
    memory_index["last_updated"] = now
    memory_index["stats"]["total_episodes"] = len(memory_index["entries"])
    memory_index["stats"]["total_lessons"] = len(memory_index["lessons"])
    memory_index["stats"]["total_paths"] = len(memory_index["paths"])
    memory_index["stats"]["tasks_with_retrospective"] = len(memory_index["entries"])
    save_json(os.path.join(memory_dir, "index.json"), memory_index)

    # ── Step 8: Update Evolution Metrics ──
    evolution["generated_at"] = now
    if task_type not in evolution["by_task_type"]:
        evolution["by_task_type"][task_type] = {
            "total_tasks": 0, "success_rate": 1.0, "avg_quality_score": 0,
            "avg_rework_cycles": 0, "avg_time_minutes": 0,
            "best_path_id": path_id, "common_failures": [],
        }
    tt = evolution["by_task_type"][task_type]
    tt["total_tasks"] += 1
    tt["avg_quality_score"] = round(
        (tt["avg_quality_score"] * (tt["total_tasks"] - 1) + score) / tt["total_tasks"], 1
    )
    tt["avg_time_minutes"] = (
        (tt["avg_time_minutes"] * (tt["total_tasks"] - 1) + duration_minutes) // tt["total_tasks"]
    )
    if path_efficiency > tt.get("best_efficiency", 0):
        tt["best_path_id"] = path_id
        tt["best_efficiency"] = path_efficiency

    # System health
    evolution["system_health"] = {
        "total_lessons_learned": memory_index["stats"]["total_lessons"],
        "lessons_resolved": len([l for l in memory_index["lessons"].values() if l.get("status") == "resolved"]),
        "lessons_active": len([l for l in memory_index["lessons"].values() if l.get("status") == "active"]),
        "optimal_paths_defined": memory_index["stats"]["total_paths"],
        "patterns_recognized": memory_index["stats"]["total_patterns"],
        "value_violations_detected": len(value_violations),
        "process_improvements_proposed": 0,
        "process_improvements_adopted": 0,
    }
    save_json(os.path.join(memory_dir, "metrics/evolution.json"), evolution)

    # ── Step 9: Threshold Checks (Automated Actions) ──
    actions_taken = []
    if tt["total_tasks"] >= 3 and tt["avg_quality_score"] < 70:
        actions_taken.append("ALERT: Low quality trend for {task_type} — propose process improvement")
    for lid, lmeta in memory_index["lessons"].items():
        if lmeta.get("status") == "active" and lmeta.get("observed_count", 1) >= 3:
            actions_taken.append(f"FAQ_PROPOSAL: Lesson {lid} observed {lmeta['observed_count']} times — draft FAQ entry")
    if value_violations:
        actions_taken.append(f"GOVERNANCE_REVIEW: Value violations detected: {value_violations}")

    if actions_taken:
        for action in actions_taken:
            print(f"  [Action] {action}")

    print(f"\n[Retrospective] Complete for {task_id}")
    print(f"  Episode: {episode_path}")
    print(f"  Retrospective: {retro_path}")
    print(f"  Lessons: {len(new_lessons)} new")
    print(f"  Path: {path_id} (efficiency: {path_efficiency:.3f})")
    print(f"  Value checks: {len(value_violations)} violations")
    return {
        "task_id": task_id,
        "episode_file": episode_path,
        "retrospective_file": retro_path,
        "lessons_created": new_lessons,
        "path_id": path_id,
        "path_efficiency": round(path_efficiency, 3),
        "value_violations": value_violations,
        "actions": actions_taken,
    }


def main():
    parser = argparse.ArgumentParser(description="DREAM-AGENT Memory Retrospective Engine")
    parser.add_argument("--task-index", required=True, help="Path to ledger/tasks/index.json")
    parser.add_argument("--memory-dir", required=True, help="Path to memory/ directory")
    parser.add_argument("--task-id", required=True, help="Task ID to run retrospective for")
    parser.add_argument("--trigger", choices=["archived", "blocked", "fork"], default="archived",
                        help="What triggered this retrospective")
    args = parser.parse_args()

    result = run_retrospective(args.task_index, args.memory_dir, args.task_id, args.trigger)
    if result.get("value_violations"):
        sys.exit(2)  # Signal value violations to CI
    sys.exit(0)


if __name__ == "__main__":
    main()
