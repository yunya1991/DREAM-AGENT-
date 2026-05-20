#!/usr/bin/env python3
# ---
# id: VERIFY-HEADERS
# type: script
# owner: ledger-protocol-agent
# depends:
#   - FILE-HEADER-PROTOCOL
# version: 1
# last_verified: 2026-05-20
# ---

"""
Verify file headers across the DREAM-AGENT project.

Checks:
1. Every file in file-registry.json has a matching header
2. depends references are valid IDs
3. No circular dependencies in the DAG
4. version is a positive integer
5. last_verified is a valid date
"""

import json
import os
import re
import sys
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# docs/scripts/ -> docs/ -> project root/
ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
REGISTRY = os.path.join(ROOT, "docs", "file-registry.json")


def load_registry():
    with open(REGISTRY, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_header(filepath):
    """Parse header from a file. Returns dict or None.
    Supports: YAML frontmatter (---), # comments (.py), _header field (.json)
    """
    full_path = os.path.join(ROOT, filepath)
    if not os.path.exists(full_path):
        return None
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()

    # YAML frontmatter (.md)
    match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
    if match:
        header = {}
        for line in match.group(1).split("\n"):
            if ": " in line:
                key, val = line.split(": ", 1)
                header[key.strip()] = val.strip()
        if "depends" in header:
            depends_raw = header["depends"]
            if depends_raw.startswith("["):
                header["depends"] = [x.strip().strip('"') for x in depends_raw.strip("[]").split(",") if x.strip()]
            else:
                header["depends"] = []
        return header

    # Python # comments (.py)
    if filepath.endswith(".py"):
        header = {}
        in_header = False
        for line in content.split("\n"):
            if line.startswith("# ---"):
                if not in_header:
                    in_header = True
                    continue
                else:
                    break
            if in_header and line.startswith("# "):
                inner = line[2:].strip()
                if ": " in inner:
                    key, val = inner.split(": ", 1)
                    header[key.strip()] = val.strip()
                elif key == "depends" and val.strip() == "[]":
                    header["depends"] = []
                elif key == "depends" and val.startswith("- "):
                    header.setdefault("depends", []).append(val[2:].strip())
        if header:
            return header

    # JSON _header field (.json)
    if filepath.endswith(".json"):
        try:
            data = json.loads(content)
            if "_header" in data:
                return data["_header"]
        except json.JSONDecodeError:
            pass

    return None


def check_dag_cycles(registry):
    """Detect circular dependencies. Returns list of cycle paths."""
    files = {f["id"]: [d for d in f.get("depends", [])] for f in registry["files"]}
    cycles = []
    visited = set()
    path = []

    def dfs(node):
        if node in path:
            cycle_start = path.index(node)
            cycles.append(path[cycle_start:] + [node])
            return
        if node in visited:
            return
        visited.add(node)
        path.append(node)
        for dep in files.get(node, []):
            dfs(dep)
        path.pop()

    for fid in files:
        if fid not in visited:
            dfs(fid)
    return cycles


def main():
    registry = load_registry()
    errors = []
    warnings = []

    all_ids = {f["id"] for f in registry["files"]}

    for entry in registry["files"]:
        fid = entry["id"]
        fpath = entry["path"]
        full_path = os.path.join(ROOT, fpath)

        if not os.path.exists(full_path):
            errors.append(f"MISSING: {fpath} (id={fid})")
            continue

        header = parse_header(fpath)
        if header is None:
            warnings.append(f"NO_HEADER: {fpath} (id={fid})")
            continue

        # Check id match
        if header.get("id") != fid:
            errors.append(f"ID_MISMATCH: {fpath} header says '{header.get('id')}', registry says '{fid}'")

        # Check type match
        if header.get("type") != entry.get("type"):
            errors.append(f"TYPE_MISMATCH: {fpath} header says '{header.get('type')}', registry says '{entry.get('type')}'")

        # Check depends are valid IDs
        deps = header.get("depends", [])
        if isinstance(deps, list):
            for dep in deps:
                if dep not in all_ids:
                    errors.append(f"INVALID_DEPEND: {fid} depends on '{dep}' (not in registry)")

        # Check version is int
        ver = header.get("version", "0")
        try:
            v = int(ver)
            if v < 1:
                errors.append(f"INVALID_VERSION: {fid} version={v}")
        except ValueError:
            errors.append(f"INVALID_VERSION: {fid} version='{ver}' (not an integer)")

        # Check last_verified is a date
        lv = header.get("last_verified", "")
        try:
            datetime.strptime(lv, "%Y-%m-%d")
        except ValueError:
            errors.append(f"INVALID_DATE: {fid} last_verified='{lv}'")

    # Check DAG cycles
    cycles = check_dag_cycles(registry)
    for cycle in cycles:
        errors.append(f"DAG_CYCLE: {' -> '.join(cycle)}")

    # Print results
    if warnings:
        print(f"\n{'='*60}")
        print(f"WARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"  ⚠ {w}")

    if errors:
        print(f"\n{'='*60}")
        print(f"ERRORS ({len(errors)}):")
        for e in errors:
            print(f"  ✗ {e}")
        print(f"\nFailed: {len(errors)} errors, {len(warnings)} warnings")
        sys.exit(1)
    else:
        total = len(registry["files"])
        with_header = total - len(warnings)
        print(f"\n{'='*60}")
        print(f"OK: {with_header}/{total} files have valid headers")
        print(f"    {len(warnings)} files pending header migration")
        print(f"    No circular dependencies detected")
        sys.exit(0)


if __name__ == "__main__":
    main()
