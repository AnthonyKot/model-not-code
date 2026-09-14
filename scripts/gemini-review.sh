#!/usr/bin/env bash
#
# gemini-review.sh — second actionable review (Gemini via agy) after a codex round was applied.
#
#   scripts/gemini-review.sh trust-the-number reuse-a-pretrained-model ...
#
# Same prompt as codex (scripts/prompts/codex-actionable-review.md) plus a note that the codex
# round is applied. Output: checks/reviews/<slug>/proposal2.md. Sequential. Nothing is applied.
set -uo pipefail
cd "$(dirname "$0")/.."
MODEL="${GEMINI_MODEL:-gemini-3.1-pro-high}"
for SLUG in "$@"; do
  [ -f "chapters/$SLUG.md" ] || { echo "no chapter: $SLUG"; continue; }
  OUT="checks/reviews/$SLUG"; mkdir -p "$OUT"
  PROMPT="$(sed "s/{{SLUG}}/$SLUG/g; s/^# Codex review: /# Gemini review: /" scripts/prompts/codex-actionable-review.md)

## This is the second round

A codex review (\`checks/reviews/$SLUG/codex-actionable.md\`) has already been applied; what was accepted
and how is logged under \"Review decisions\" in \`notes/chapters/$SLUG.md\`. Review the chapter as it is now.
Do not propose those changes again. Do propose a fix if an applied change introduced an error, a
contradiction or a number its log does not support. Do not create, edit or delete any file anywhere in
the repository, including scratch files; print the report only."
  echo "── $SLUG: gemini ($MODEL) started $(date +%H:%M:%S)"
  timeout 1500 agy --dangerously-skip-permissions --print-timeout 24m --model "$MODEL" \
    -p "$PROMPT" > "$OUT/proposal2.md" 2> "$OUT/proposal2.err"
  rc=$?
  if [ $rc -ne 0 ] || [ ! -s "$OUT/proposal2.md" ]; then
    echo "── $SLUG: FAILED (rc=$rc) — see $OUT/proposal2.err"; continue
  fi
  echo "── $SLUG: done $(date +%H:%M:%S), $(grep -c '^### ' "$OUT/proposal2.md") proposals"
done
