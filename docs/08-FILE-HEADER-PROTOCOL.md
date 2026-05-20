---
id: FILE-HEADER-PROTOCOL
type: spec
owner: ledger-protocol-agent
depends:
  - 04-ENGINEERING-INDEX
version: 1
last_verified: 2026-05-20
---

# File Header Protocol

> Status: active  
> Owner: ledger-protocol-agent  
> Purpose: every core file carries its own metadata in the first 10 lines, enabling fast AI navigation without full-text reasoning

## Design Rationale

AI systems default to "read everything → reason → decide". This is expensive and error-prone under context limits. The file header protocol flips this:

1. **First 10 lines = metadata** — AI reads the header, knows id/type/owner/dependencies/version
2. **`depends` = DAG** — changing a file tells you exactly which downstream files need re-validation
3. **`hash` = integrity** — content hash detects drift between header claims and actual content
4. **`file-registry.json` = central index** — one JSON file replaces directory scanning

This is analogous to blockchain's block header: each file is a "block" with its own proof-of-existence (hash), link to parents (depends), and state version.

## Header Format

All core `.md` / `.py` / `.json` files use YAML frontmatter:

```yaml
---
id: 04-ENGINEERING-INDEX
type: index
owner: ledger-protocol-agent
depends:
  - 00-AGENT-CONSTITUTION
  - 01-COLLABORATION-PROTOCOL
version: 3
last_verified: 2026-05-20
---
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (UPPER-CASE-KEBAB). Matches `file-registry.json` entry |
| `type` | enum | Yes | `constitution` / `protocol` / `architecture` / `workflow` / `index` / `reference` / `design` / `plan` / `spec` / `manifesto` / `entry` / `script` / `config` / `ledger` / `memory` / `metrics` / `template` / `skill` |
| `owner` | string | Yes | Responsible agent: `ledger-protocol-agent` or `governance-agent` |
| `depends` | list | No | File IDs this file depends on. Empty = root document. Forms a DAG |
| `version` | int | Yes | Incremented on every meaningful change |
| `last_verified` | date | Yes | Last date a human or script confirmed paths/references are correct |

## Usage

### For AI Agents

1. Read `docs/file-registry.json` first — get all file IDs, types, and dependencies
2. Before editing: check `depends` to know what downstream docs may need updating
3. After editing: increment `version`, update `last_verified`

### For Humans

Run the verification script to check integrity:

```bash
python3 docs/scripts/verify-headers.py
```

This checks:
- Every file in the registry has a matching header
- `depends` references are valid IDs (no dangling pointers)
- No circular dependencies in the DAG
- File content hash matches header (when available)

## Migration

Existing files are being migrated incrementally. New files MUST include headers from creation. Legacy files without headers should be treated as `version: 0, type: unknown`.
