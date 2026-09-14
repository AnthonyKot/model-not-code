#!/usr/bin/env bash
#
# codex-review.sh — actionable, read-only codex review of chapters, one at a time.
#
#   scripts/codex-review.sh search-the-catalogue trust-the-number ...
#
# Prompt: scripts/prompts/codex-actionable-review.md. Output per chapter:
# checks/reviews/<slug>/codex-actionable.md (proposed exact replacements; nothing is applied).
# Runs sequentially: the next chapter starts only when the previous run has finished.
set -uo pipefail
cd "$(dirname "$0")/.."
[ $# -gt 0 ] || { echo "usage: scripts/codex-review.sh <slug> [<slug> ...]"; exit 2; }

for SLUG in "$@"; do
  [ -f "chapters/$SLUG.md" ] || { echo "no chapter: $SLUG"; continue; }
  OUT="checks/reviews/$SLUG"; mkdir -p "$OUT"
  PROMPT=$(sed "s/{{SLUG}}/$SLUG/g" scripts/prompts/codex-actionable-review.md)
  echo "── $SLUG: codex started $(date +%H:%M:%S)"
  timeout 2400 codex exec --skip-git-repo-check -s read-only -m "${CODEX_MODEL:-gpt-5.6-sol}" \
    -c model_reasoning_effort="high" -C "$PWD" -o "$OUT/codex-actionable.md" "$PROMPT" \
    < /dev/null > "$OUT/codex-actionable.log" 2>&1
  rc=$?
  if grep -q "You've hit your usage limit" "$OUT/codex-actionable.log"; then
    echo "── $SLUG: codex usage limit — stopping the chain"; exit 1
  fi
  if [ $rc -ne 0 ] || [ ! -s "$OUT/codex-actionable.md" ]; then
    echo "── $SLUG: FAILED (rc=$rc) — see $OUT/codex-actionable.log"; continue
  fi
  echo "── $SLUG: done $(date +%H:%M:%S), $(grep -c '^### ' "$OUT/codex-actionable.md") proposals"
done
