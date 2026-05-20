#!/usr/bin/env python3
# ---
# id: DECOMPOSE-BLOCKS
# type: script
# owner: ledger-protocol-agent
# depends:
#   - 00-AGENT-CONSTITUTION
#   - 01-COLLABORATION-PROTOCOL
# version: 1
# last_verified: 2026-05-20
# ---

"""
Task Decompose Blocks — Phase D.5 Core Script

Reads Phase C (frontend pages) + Phase D (module contracts), generates:
- Module folder structure under {workspace}/modules/{module-name}/
- BLOCK.md for each task (with YAML frontmatter header)
- INDEX.md per module (sub-engineering index)
- Contract reference copy
- Updates docs/file-registry.json modules field

Usage:
    # Single module
    python3 decompose.py \
        --module market-quote \
        --pages docs/frontend-pages/market-quote.md \
        --contract docs/module-contracts/market-quote.md \
        --workspace 7-ARTIFACT-HUB-V2

    # Batch mode
    python3 decompose.py \
        --batch modules-list.json \
        --workspace 7-ARTIFACT-HUB-V2

    # Dry run
    python3 decompose.py --module market-quote --pages ... --contract ... --dry-run
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone


def utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def iso_now():
    return datetime.now(timezone.utc).isoformat()


def kebab_case(name):
    """Convert Chinese or English text to kebab-case slug."""
    # Remove Chinese characters for slug generation
    slug = re.sub(r'[\u4e00-\u9fff]+', '', name)
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', slug).strip('-').lower()
    slug = re.sub(r'-+', '-', slug)
    if not slug:
        slug = f"task-{hash(name) % 10000:04d}"
    return slug[:30]


def parse_frontend_pages(pages_content):
    """
    Parse Phase C frontend pages markdown.
    Extracts: page title, components, interactions.
    Returns list of {name, components, data_source, triggers, state_changes}
    """
    components = []
    current_page = ""
    in_components = False

    for line in pages_content.split("\n"):
        # Detect page title
        m = re.match(r'^#+\s+(.+)', line)
        if m and not line.startswith('##'):
            current_page = m.group(1).strip()
            in_components = False
            continue

        # Detect component section
        if current_page and (line.startswith('##') or line.startswith('- **')):
            comp_name = re.sub(r'^[-#*\s]+', '', line).split(':')[0].strip()
            if comp_name:
                components.append({
                    "name": comp_name,
                    "page": current_page,
                    "data_source": "",
                    "triggers": "",
                    "state_changes": "",
                })
                in_components = True
            continue

        # Parse component details
        if in_components and components:
            if "数据来源" in line or "data source" in line.lower():
                components[-1]["data_source"] = line.split(":", 1)[-1].strip() if ":" in line else line
            if "触发条件" in line or "trigger" in line.lower():
                components[-1]["triggers"] = line.split(":", 1)[-1].strip() if ":" in line else line
            if "状态变化" in line or "state" in line.lower():
                components[-1]["state_changes"] = line.split(":", 1)[-1].strip() if ":" in line else line

    # If no structured components found, treat each paragraph/section as a component
    if not components:
        # Fallback: extract bullet points or sections
        sections = re.split(r'\n##?\s+', pages_content)
        for section in sections:
            title_match = re.match(r'^([^\n]+)', section)
            if title_match:
                name = title_match.group(1).strip()
                if name and len(name) > 1:
                    components.append({
                        "name": name,
                        "page": "",
                        "data_source": "",
                        "triggers": "",
                        "state_changes": "",
                    })

    return components


def parse_module_contract(contract_content):
    """
    Parse Phase D module contract markdown.
    Extracts: upstream output, downstream input, exception path, state sync.
    """
    result = {
        "upstream_output": "",
        "downstream_input": "",
        "exception_path": "",
        "state_sync": "",
    }

    for line in contract_content.split("\n"):
        if "上游输出" in line or "Upstream Output" in line:
            result["upstream_output"] = line.split(":", 1)[-1].strip() if ":" in line else line
        if "下游输入" in line or "Downstream Input" in line:
            result["downstream_input"] = line.split(":", 1)[-1].strip() if ":" in line else line
        if "异常" in line or "Exception" in line or "降级" in line:
            result["exception_path"] = line.split(":", 1)[-1].strip() if ":" in line else line
        if "状态同步" in line or "State Sync" in line:
            result["state_sync"] = line.split(":", 1)[-1].strip() if ":" in line else line

    return result


def infer_task_type(component, contract):
    """
    Infer task type from component and contract context.
    - shared-sync: involves shared state or contract boundary
    - serial: depends on other components
    - parallel: independent
    """
    name_lower = (component.get("name", "") + component.get("data_source", "")).lower()
    if any(kw in name_lower for kw in ["shared", "contract", "gateway", "types", "type", "index"]):
        return "shared-sync"
    if component.get("state_changes") and contract.get("state_sync"):
        return "shared-sync"
    if component.get("triggers") and ("上游" in component.get("triggers", "") or "upstream" in component.get("triggers", "").lower()):
        return "serial"
    return "parallel"


def generate_block_md(task_id, module_name, block_index, task_type, component, contract_path, created_at):
    """Generate BLOCK.md content."""
    acceptance_criteria = f"1. {component['name']} renders correctly\n2. Data source: {component.get('data_source', 'TBD')}\n3. Trigger: {component.get('triggers', 'TBD')}"

    block_content = f"""---
id: {task_id}
module: {module_name}
block_index: {block_index}
type: {task_type}
owner: ""
depends: []
acceptance_criteria: |
  {acceptance_criteria}
phase_d_contract: ../contracts/phase-d.md
ledger_task_id: ""
status: ready
version: 1
created_at: {created_at}
---

# {component['name']}

## 目标
{component.get('data_source', '详见 Phase C 页面定义')}

## 验收标准

> 从 Phase F 继承，可执行/可量化/独立于实现路径

{acceptance_criteria}

## 已知教训

> 飞行前查找自动注入：来自 memory/lessons/ 的相关警告

<!-- 自动生成，勿手动编辑 -->

## 最优路径

> 来自 memory/paths/ 的推荐步骤

<!-- 自动生成，勿手动编辑 -->

## 实现笔记

- 数据来源：{component.get('data_source', 'TBD')}
- 触发条件：{component.get('triggers', 'TBD')}
- 状态变化：{component.get('state_changes', 'TBD')}
"""
    return block_content


def generate_index_md(module_id, module_title, blocks, contract, created_at):
    """Generate INDEX.md content."""
    parallel_count = sum(1 for b in blocks if b["type"] == "parallel")
    serial_count = sum(1 for b in blocks if b["type"] == "serial")
    shared_count = sum(1 for b in blocks if b["type"] == "shared-sync")

    table_rows = ""
    for b in blocks:
        deps = ", ".join(b["depends"]) if b["depends"] else "-"
        table_rows += f"| {b['block_index']} | {b['id']} | {b['type']} | {deps} | ready | {b.get('owner', '') or '待分配'} |\n"

    index_content = f"""---
id: {module_id}
type: module
owner: governance-agent
depends:
  - phase-d-contract: ./contracts/phase-d.md
total_tasks: {len(blocks)}
parallel_tasks: {parallel_count}
serial_tasks: {serial_count}
shared_sync_tasks: {shared_count}
status: ready
created_at: {created_at}
---

# {module_title} 模块

## 区块列表

| # | ID | 类型 | 依赖 | 状态 | 负责人 |
|---|---|------|------|------|--------|
{table_rows}
## 模块契约（Phase D）

- 上游输出：{contract.get('upstream_output', 'TBD')}
- 下游输入：{contract.get('downstream_input', 'TBD')}
- 异常降级：{contract.get('exception_path', 'TBD')}
- 状态同步：{contract.get('state_sync', 'TBD')}

## 前端页面定义（Phase C）

各组件定义详见 Phase C 前端页面定义。
"""
    return index_content


def load_file_registry(root_dir):
    """Load or create file-registry.json."""
    registry_path = os.path.join(root_dir, "docs", "file-registry.json")
    if os.path.exists(registry_path):
        with open(registry_path, "r", encoding="utf-8") as f:
            return json.load(f), registry_path
    return {"version": 1, "generated_at": iso_now(), "owner": "ledger-protocol-agent", "files": [], "modules": {}}, registry_path


def update_registry_modules(registry, module_name, index_path, contract_path, blocks):
    """Add module to registry's modules field."""
    if "modules" not in registry:
        registry["modules"] = {}

    registry["modules"][module_name] = {
        "index": index_path,
        "phase_d_contract": contract_path,
        "total_tasks": len(blocks),
        "status": "ready",
        "block_ids": [b["id"] for b in blocks],
    }


def decompose_module(module_name, pages_file, contract_file, workspace, dry_run=False):
    """
    Decompose a single module into folder + blocks structure.
    Returns dict with paths and block info.
    """
    # Read inputs
    if not os.path.exists(pages_file):
        print(f"[ERROR] Pages file not found: {pages_file}", file=sys.stderr)
        return None
    if not os.path.exists(contract_file):
        print(f"[ERROR] Contract file not found: {contract_file}", file=sys.stderr)
        return None

    with open(pages_file, "r", encoding="utf-8") as f:
        pages_content = f.read()
    with open(contract_file, "r", encoding="utf-8") as f:
        contract_content = f.read()

    # Parse
    components = parse_frontend_pages(pages_content)
    contract = parse_module_contract(contract_content)
    created_at = utc_now()

    if not components:
        print(f"[WARN] No components extracted from {pages_file}, creating default task", file=sys.stderr)
        components = [{"name": module_name, "page": "", "data_source": "", "triggers": "", "state_changes": ""}]

    # Determine workspace root for path resolution
    root_dir = os.getcwd()
    if os.path.exists(os.path.join(root_dir, workspace)):
        root_dir = os.path.join(root_dir, workspace)
    else:
        root_dir = os.path.join(root_dir, os.path.dirname(workspace)) if workspace else os.getcwd()

    # Create module folder structure
    module_dir = os.path.join(root_dir, "modules", module_name)
    tasks_dir = os.path.join(module_dir, "tasks")
    contracts_dir = os.path.join(module_dir, "contracts")

    if not dry_run:
        os.makedirs(tasks_dir, exist_ok=True)
        os.makedirs(contracts_dir, exist_ok=True)
        # Copy contract reference
        with open(os.path.join(contracts_dir, "phase-d.md"), "w", encoding="utf-8") as f:
            f.write(f"# Phase D 模块契约 — {module_name}\n\n")
            f.write(contract_content)

    # Generate blocks
    blocks = []
    for i, comp in enumerate(components, 1):
        slug = kebab_case(comp["name"])
        task_id = f"{i:03d}-{slug}"
        block_dir = os.path.join(tasks_dir, task_id)
        block_file = os.path.join(block_dir, "BLOCK.md")

        task_type = infer_task_type(comp, contract)

        block_content = generate_block_md(
            task_id, module_name, i, task_type, comp, f"../contracts/phase-d.md", created_at
        )

        if dry_run:
            print(f"  [DRY-RUN] Would create: modules/{module_name}/tasks/{task_id}/BLOCK.md (type={task_type})")
        else:
            os.makedirs(block_dir, exist_ok=True)
            with open(block_file, "w", encoding="utf-8") as f:
                f.write(block_content)
            print(f"  [BLOCK] Created: modules/{module_name}/tasks/{task_id}/BLOCK.md")

        blocks.append({
            "id": task_id,
            "module": module_name,
            "block_index": i,
            "type": task_type,
            "depends": [],
            "owner": "",
        })

    # Generate INDEX.md
    module_title = module_name.replace("-", " ").title()
    index_content = generate_index_md(module_name, module_title, blocks, contract, created_at)
    index_path = os.path.join(module_dir, "INDEX.md")

    if dry_run:
        print(f"  [DRY-RUN] Would create: modules/{module_name}/INDEX.md ({len(blocks)} blocks)")
    else:
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(index_content)
        print(f"  [INDEX] Created: modules/{module_name}/INDEX.md")

    # Update file registry
    registry, registry_path = load_file_registry(root_dir)
    rel_index = f"{workspace}/modules/{module_name}/INDEX.md"
    rel_contract = f"{workspace}/modules/{module_name}/contracts/"
    update_registry_modules(registry, module_name, rel_index, rel_contract, blocks)

    if dry_run:
        print(f"  [DRY-RUN] Would update docs/file-registry.json → modules['{module_name}']")
    else:
        registry["generated_at"] = iso_now()
        with open(registry_path, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False)
        print(f"  [REGISTRY] Updated: modules['{module_name}']")

    return {
        "module": module_name,
        "index_path": rel_index,
        "contract_path": rel_contract,
        "blocks": blocks,
        "total_tasks": len(blocks),
    }


def decompose_batch(batch_file, workspace, dry_run=False):
    """Decompose multiple modules from a JSON list."""
    with open(batch_file, "r", encoding="utf-8") as f:
        modules = json.load(f)

    results = []
    for mod in modules:
        result = decompose_module(
            module_name=mod["module_name"],
            pages_file=mod.get("pages_file", ""),
            contract_file=mod.get("contract_file", ""),
            workspace=workspace,
            dry_run=dry_run,
        )
        if result:
            results.append(result)

    return results


def main():
    parser = argparse.ArgumentParser(description="Task Decompose Blocks — Phase D.5")
    parser.add_argument("--module", help="Module name (e.g., market-quote)")
    parser.add_argument("--pages", help="Path to Phase C frontend pages markdown")
    parser.add_argument("--contract", help="Path to Phase D module contract markdown")
    parser.add_argument("--batch", help="Path to batch modules list JSON")
    parser.add_argument("--workspace", default="7-ARTIFACT-HUB-V2", help="Workspace directory")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, do not write files")
    args = parser.parse_args()

    if args.batch:
        results = decompose_batch(args.batch, args.workspace, args.dry_run)
        print(f"\n[Decompose] Batch complete: {len(results)} modules processed")
        for r in results:
            print(f"  {r['module']}: {r['total_tasks']} blocks")
    elif args.module and args.pages and args.contract:
        result = decompose_module(args.module, args.pages, args.contract, args.workspace, args.dry_run)
        if not result:
            sys.exit(1)
        print(f"\n[Decompose] Module '{args.module}' complete: {result['total_tasks']} blocks")
    else:
        parser.print_help()
        print("\nError: either --module + --pages + --contract, or --batch is required")
        sys.exit(1)


if __name__ == "__main__":
    main()
