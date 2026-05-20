---
name: agent-memory-lookup
description: Memory pre-flight check. Before starting any task, query the memory system
  for relevant lessons, optimal paths, and known patterns. Trigger words: memory lookup,
  check memory, 查记忆, 经验查询, 记忆查找
version: "1.0"
---

# Agent Memory Lookup

## Purpose

Before executing any task, consult the memory system to:
1. Avoid repeating known mistakes (lessons)
2. Follow the proven optimal path (paths)
3. Recognize known risk patterns (patterns)
4. Verify constitutional values (V1-V5)

## Mandatory Usage

This SKILL MUST be called before:
- Every task claim (Phase 0)
- Every rework cycle
- Every fork operation

It is equivalent in priority to `dual-agent-conflict-gate`.
**No memory lookup, no task start.**

## When to Use

- Starting a new task from the ledger
- Beginning a rework cycle after VALIDATION_RESULT says REWORK
- Creating a fork branch due to blocker or rejection
- Modifying shared boundary files

## Input

```json
{
  "task_id": "task-...",
  "task_type": "parallel | serial | shared-sync",
  "files_to_modify": ["path/to/file1", "path/to/file2"],
  "workspace_path": "7-ARTIFACT-HUB-V2"
}
```

## Execution

```bash
# Step 1: Memory lookup
python3 memory/scripts/memory_lookup.py \
  --memory-dir memory/ \
  --task-id "<task_id>" \
  --task-type "<task_type>" \
  --files "$(echo "${files_to_modify}" | tr ',' '\n')"

# Step 2: Pattern match
python3 memory/scripts/pattern_matcher.py \
  --memory-dir memory/ \
  --files "$(echo "${files_to_modify}" | tr ',' '\n')"

# Step 3: Path optimizer (if task type is known)
python3 memory/scripts/path_optimizer.py \
  --memory-dir memory/ \
  --task-type "<task_type>"
```

## Output Interpretation

### warnings (from lessons)
If any warning has `severity: high`, the agent must:
1. Read the full lesson markdown file
2. Confirm the prevention rule is addressed in the plan
3. Document how the lesson will be avoided in the STARTED comment

### optimal_path
If an optimal path exists:
- Follow the recommended steps
- If deviating, document why in the plan
- Target the stated efficiency score

### pattern_alerts
If any pattern has `risk_level: high`:
- Switch to `STRONG_SYNC` execution mode
- Complete all `required_pre_flight` steps
- Post UPDATED comment if scope changes

### constitutional_checks
If the value checker detects violations:
- Stop and create a governance review task
- Do not proceed with the task

## Output Format

```json
{
  "task_id": "task-...",
  "warnings": [
    {
      "lesson_id": "lesson-...",
      "severity": "high | medium | low",
      "prevention_rule": "..."
    }
  ],
  "optimal_path": {
    "path_id": "path-...",
    "steps": [{"order": 1, "action": "..."}],
    "efficiency_score": 0.95
  },
  "pattern_alerts": [
    {
      "pattern_id": "pattern-...",
      "risk_level": "high | medium | low",
      "required_execution_mode": "STRONG_SYNC"
    }
  ],
  "constitutional_checks": ["V1", "V2", "V3", "V4", "V5"],
  "recommendation": "PROCEED | REVIEW | BLOCK"
}
```

## Integration with Conflict Gate

Memory lookup runs BEFORE the conflict gate:

1. Memory lookup → check lessons, paths, patterns
2. Apply findings to refine the conflict gate input
3. Conflict gate → check file boundaries and contracts
4. Both pass → post STARTED → begin work
