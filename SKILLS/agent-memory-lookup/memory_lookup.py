#!/usr/bin/env python3
"""
Agent Memory Lookup — CLI wrapper for SKILL integration.

This is a thin wrapper around the core memory_lookup.py script,
designed to be called from the SKILL execution flow.

Usage:
    python3 SKILLS/agent-memory-lookup/memory_lookup.py \
        --memory-dir memory/ \
        --task-id <task_id> \
        --task-type <type> \
        --files <f1,f2,...>
"""

import sys
import os

# Add parent scripts to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "memory", "scripts"))

from memory_lookup import main

if __name__ == "__main__":
    main()
