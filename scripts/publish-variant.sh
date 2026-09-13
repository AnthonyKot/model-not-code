#!/usr/bin/env bash
# Verify a codex tight variant and, if it passes, rebuild and push it. Usage: scripts/publish-variant.sh <slug>
set -uo pipefail
cd "$(dirname "$0")/.."
s="$1"
out=$(python3 scripts/verify-variant.py "$s" tight); echo "$out"
echo "$out" | grep -q "RESULT: PASS" || { echo "NOT PUBLISHED: $s needs a hand check"; exit 1; }
node checks/paraphrase.mjs --all 2>&1 | grep -E "^FAIL $s\.tight" && { echo "NOT PUBLISHED: paraphrase failure"; exit 1; }
npm run build >/dev/null && npm run check >/dev/null 2>&1 || { echo "NOT PUBLISHED: build/check failed"; exit 1; }
git add "essays/variants/$s.tight.md" docs/ && git commit -q -m "Publish the tighter rewrite of $s beside the current version (codex; verified)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01E9e68qCpp1h6jfkQ5NTrWt" && git push -q origin master && echo "PUBLISHED $s--tight"
