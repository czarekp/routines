#!/usr/bin/env bash
cd "$CLAUDE_PROJECT_DIR" || exit 0
OUT=$(npm run typecheck --silent 2>&1)
ERR_COUNT=$(printf '%s' "$OUT" | grep -cE 'error TS')
if [ "$ERR_COUNT" -gt 0 ]; then
  echo "⚠ $ERR_COUNT TypeScript error(s) remain. Run /check for details."
fi
exit 0
