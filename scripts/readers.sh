#!/usr/bin/env bash
#
# readers.sh — reader-experience pass on one essay, one persona per model.
#
#   scripts/readers.sh kv-cache
#   scripts/readers.sh essays/kv-cache.md
#
# Companion to review.sh, which checks an essay against a checklist. This does
# something different: it asks four models to READ the essay twice, each as a
# different reader, and report what landed, what didn't, and what changed between
# the reads. The useful output is where the readers disagree. Ported from
# book4/scripts/readers.sh.
#
# Readers do not see the repo. The essay markdown (mission marker stripped) is
# embedded directly in the prompt, so a model cannot wander into CONTEXT.md and
# start reviewing the method instead of the essay. Personas live in
# scripts/prompts/readers/*.txt — add a file to add a reader; the model each
# persona runs on is set in PERSONAS below.
#
# NOTHING IS APPLIED AUTOMATICALLY. Output lands in checks/readers/<slug>/.
#
set -uo pipefail
cd "$(dirname "$0")/.."

INPUT="${1:-}"
if [ -z "$INPUT" ]; then
  echo "usage: scripts/readers.sh <slug | essays/<slug>.md>"; exit 2
fi
if [ -f "$INPUT" ]; then
  ESSAY="$INPUT"
else
  ESSAY="essays/${INPUT}.md"
fi
if [ ! -f "$ESSAY" ]; then
  echo "no such essay: $1"; exit 2
fi

SLUG=$(basename "$ESSAY" .md)
OUT="checks/readers/$SLUG"
mkdir -p "$OUT"

# model:persona — persona is scripts/prompts/readers/<persona>.txt
PERSONAS=(
  "codex:senior-dev"
  "flash:working-mle"
  "pro:stats-sceptic"
  "flash:hiring-manager"
)
FLASH="${FLASH_MODEL:-gemini-3.8-flash-high}"
PRO="${PRO_MODEL:-gemini-3.1-pro-high}"

PROSE=$(sed 's/<!--mission-->//' "$ESSAY")
FRAME=$(cat scripts/prompts/readers/_frame.txt)

build_prompt() {  # persona-file
  local persona; persona=$(cat "$1")
  printf '%s\n\nAdopt this persona fully: %s\n\n%s\n\n===== ESSAY TEXT =====\n%s\n===== END =====\n' \
    "$(sed -n '1,/^---$/p' <<<"$FRAME" | sed '$d')" "$persona" \
    "$(sed -n '/^---$/,$p' <<<"$FRAME" | sed '1d')" "$PROSE"
}

echo "── readers on $SLUG ───────────────────────────────────────────"
echo "  nothing below is applied automatically — this produces reports only."

pids=(); labels=()
for entry in "${PERSONAS[@]}"; do
  model=${entry%%:*}; persona=${entry##*:}
  pfile="scripts/prompts/readers/$persona.txt"
  [ -f "$pfile" ] || { echo "  $model/$persona  SKIPPED — no $pfile"; continue; }
  prompt=$(build_prompt "$pfile")
  out="$OUT/$model-$persona.md"; err="$OUT/$model-$persona.err"
  echo "  $model/$persona …"
  case $model in
    codex)  ( timeout 900 codex exec --skip-git-repo-check -C "$PWD" "$prompt" \
                < /dev/null > "$out" 2> "$err" ) & ;;
    # agy: options must precede -p (it takes the prompt as its argument).
    flash)  ( timeout 900 agy --print-timeout 14m --model "$FLASH" -p "$prompt" > "$out" 2> "$err" ) & ;;
    pro)    ( timeout 900 agy --print-timeout 14m --model "$PRO"   -p "$prompt" > "$out" 2> "$err" ) & ;;
    agy)    ( timeout 900 agy --print-timeout 14m -p "$prompt" > "$out" 2> "$err" ) & ;;
    grok)   ( timeout "${GROK_TIMEOUT:-300}" grok --cwd "$PWD" --output-format plain -p "$prompt" \
                > "$out" 2> "$err" ) & ;;
    claude) ( timeout 900 claude --model opus -p "$prompt" > "$out" 2> "$err" ) & ;;  # not in PERSONAS by default
    *)      echo "  unknown model $model"; continue ;;
  esac
  pids+=($!); labels+=("$model/$persona")
done

for i in "${!pids[@]}"; do
  wait "${pids[$i]}"; rc=$?
  f="$OUT/${labels[$i]/\//-}.md"
  [ -s "$f" ] || rc=1   # empty output counts as a failure
  [ $rc -eq 0 ] && echo "  ${labels[$i]}  ok ($(wc -c < "$f") bytes)" \
                || echo "  ${labels[$i]}  FAILED (rc=$rc) — see ${f%.md}.err"
done

echo
echo "  reports: $OUT/"
echo "  read them side by side; the disagreements are the finding."
