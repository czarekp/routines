---
description: Review this session's changes and record recurring good/bad patterns for future sessions
allowed-tools: Bash(git:*), Read, Edit
---

Review: !`git diff --stat HEAD` and !`git log --oneline -10`

Note anything from this session that recurred or stood out: good patterns worth repeating,
anti-patterns introduced or fixed, naming/structural conventions confirmed or violated — each
as one line with a file:line example. Append new items to `.claude/docs/patterns.md` (dedupe
against existing entries).

If an item now appears 3+ times across the pattern log, promote a one-line summary of it into
CLAUDE.md's Conventions section (inside the AUTO-GENERATED markers) and delete the now-redundant
detail entries from patterns.md, so the pattern log doesn't grow without bound.

Reply with a 2–4 line summary of what changed in the pattern log, nothing else.
