---
description: Scan the codebase for recurring anti-patterns and update the pattern log
allowed-tools: Read, Glob, Grep, Edit, Write
argument-hint: [path-or-glob]
---
Scope: $ARGUMENTS (default: `src/`, excluding node_modules/.next/out/coverage).
Use Grep/Glob only; read full files only when a hit needs context to interpret. Look for the
categories listed in CLAUDE.md's Conventions section and in `.claude/docs/patterns.md`.

Append new, non-duplicate findings to `.claude/docs/patterns.md` under `## Anti-Patterns`,
grouped by category, one line + file:line each. Reply with only a short summary: counts per
category and the 5 most severe findings — not the full list.
