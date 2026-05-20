#!/usr/bin/env python3
# ---
# id: PATTERN-MATCHER
# type: script
# owner: ledger-protocol-agent
# depends:
#   - MEMORY-INDEX

# version: 1
# last_verified: 2026-05-20
# ---

#!/usr/bin/env python3
"""
DREAM-AGENT Pattern Matcher

Purpose: Given a set of files to modify, check against known risk patterns
and return required precautions.

Usage:
    python3 pattern_matcher.py \
        --memory-dir memory/ \
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


def match_patterns(memory_dir: str, files_to_modify: list) -> list:
    """Match files against known patterns and return alerts."""
    index = load_json(os.path.join(memory_dir, "index.json"))
    results = []

    # Check known patterns from index
    if index:
        for pid, meta in index.get("patterns", {}).items():
            pattern = load_json(os.path.join(memory_dir, meta.get("file", "")))
            if not pattern:
                continue
            triggers = pattern.get("trigger_conditions", [])
            matched = []
            for trigger in triggers:
                for f in files_to_modify:
                    if f in trigger:
                        matched.append(f)
            if matched:
                results.append({
                    "pattern_id": pid,
                    "name": pattern.get("name", pid),
                    "matched_files": matched,
                    "risk_level": pattern.get("risk_level", "medium"),
                    "required_execution_mode": pattern.get("required_execution_mode", ""),
                    "required_pre_flight": pattern.get("required_pre_flight", []),
                    "canonical_response": pattern.get("canonical_response", {}),
                })

    # Built-in pattern detection (always active, even without registered patterns)
    shared_indicators = ["types.ts", "index.ts", "contract", "shared", "gateway"]
    matched_files = set()
    for f in files_to_modify:
        for indicator in shared_indicators:
            if indicator in f:
                matched_files.add(f)
                break  # One match per file is enough
    if matched_files:
        results.append({
            "pattern_id": "builtin-shared-file",
            "name": "Shared/Contract file modification",
            "matched_files": sorted(matched_files),
            "risk_level": "high",
            "required_execution_mode": "STRONG_SYNC",
            "required_pre_flight": [
                "Run conflict_gate with contracts_depended",
                "Declare shared_boundary in PR body",
            ],
            "canonical_response": {
                "before_start": "Run conflict_gate, expect WARNING minimum",
                "during_work": "Post UPDATED for any scope change",
                "before_merge": "Require non-owner review + governance approval",
            },
        })

    return results


def main():
    parser = argparse.ArgumentParser(description="DREAM-AGENT Pattern Matcher")
    parser.add_argument("--memory-dir", required=True)
    parser.add_argument("--files", required=True, help="Comma-separated files to modify")
    args = parser.parse_args()

    files_to_modify = [f.strip() for f in args.files.split(",") if f.strip()]
    results = match_patterns(args.memory_dir, files_to_modify)

    output = {
        "files_checked": files_to_modify,
        "patterns_matched": len(results),
        "alerts": results,
        "overall_risk": max([a.get("risk_level", "low") for a in results], key=lambda x: {"low": 0, "medium": 1, "high": 2}.get(x, 0)) if results else "low",
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
