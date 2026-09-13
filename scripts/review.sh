#!/usr/bin/env bash
#
# review.sh — adversarial review of one essay: two Gemini lanes, codex consolidates.
#
#   scripts/review.sh kv-cache
#   scripts/review.sh essays/kv-cache.md
#
# Ported from book4/scripts/review.sh; same architecture, a checklist rewritten for
# this book's own failure modes (scripts/prompts/review-checklist.md).
#
# WHY THREE.
#
# Gemini flash and Gemini pro (both via agy --model) review independently against
# the same checklist and do not see each other's output. Claude is not in the loop
# on purpose: its tokens are the expensive ones and the checklist review does not
# need them. Independence is the point: two reviewers shown the same prior findings
# agree with them, and agreement is not verification.
#
# Codex then consolidates. Its job is adversarial toward the reviewers, not toward
# the essay — it drops findings that do not survive checking against CONTEXT.md,
# corpus/<slug>/receipts.tsv and the cited lecture files, recomputes any arithmetic
# finding, notes where both reviewers independently agreed, and ranks what is left.
#
# NOTHING IS APPLIED AUTOMATICALLY. The output is a report. The author accepts or
# rejects each finding by hand and logs both in CONTEXT.md §6/§8.
#
set -uo pipefail
cd "$(dirname "$0")/.."

INPUT="${1:-}"
if [ -z "$INPUT" ]; then
  echo "usage: scripts/review.sh <slug | chapters/<slug>.md | essays/<slug>.md>"; exit 2
fi
# Accept a bare slug.
if [ -f "$INPUT" ]; then
  ESSAY="$INPUT"
elif [ -f "chapters/${INPUT}.md" ]; then
  ESSAY="chapters/${INPUT}.md"          # chapters (the book since 2026-09-13) win over archived essays
else
  ESSAY="essays/${INPUT}.md"
fi
case "$ESSAY" in chapters/*) KIND=chapter ;; *) KIND=essay ;; esac
if [ ! -f "$ESSAY" ]; then
  echo "no such essay: $1"; exit 2
fi

SLUG=$(basename "$ESSAY" .md)
OUT="checks/reviews/$SLUG"
mkdir -p "$OUT"

if [ "$KIND" = chapter ]; then
  CHECKLIST=$(cat scripts/prompts/review-checklist-chapter.md)
else
  CHECKLIST=$(cat scripts/prompts/review-checklist.md)
fi
BODY=$(cat "$ESSAY")

PROMPT="$CHECKLIST

---

# The $KIND under review — \`$ESSAY\`

$BODY"

echo "── reviewing $SLUG ────────────────────────────────────────────"
echo "  nothing below is applied automatically — this produces a report only."

# -- independent passes, in parallel ----------------------------------------
# NB agy: every option must precede -p, because -p takes the prompt as its argument.
FLASH="${FLASH_MODEL:-gemini-3.8-flash-high}"
PRO="${PRO_MODEL:-gemini-3.1-pro-high}"
echo "  flash  … ($FLASH)"
( timeout 900 agy --dangerously-skip-permissions --print-timeout 14m --model "$FLASH" \
    -p "$PROMPT" > "$OUT/flash.json" 2>"$OUT/flash.err" ) &
FLASH_PID=$!

echo "  pro    … ($PRO)"
( timeout 900 agy --dangerously-skip-permissions --print-timeout 14m --model "$PRO" \
    -p "$PROMPT" > "$OUT/pro.json" 2>"$OUT/pro.err" ) &
PRO_PID=$!

# A failure of either reviewer must not abort the run — wait on each separately
# and check its own exit code.
wait $FLASH_PID; flash_rc=$?
wait $PRO_PID;   pro_rc=$?

# An empty file is a failure too: agy is known to exit 0 having written nothing.
[ $flash_rc -eq 0 ] && [ -s "$OUT/flash.json" ] || flash_rc=1
[ $pro_rc   -eq 0 ] && [ -s "$OUT/pro.json" ]   || pro_rc=1
[ $flash_rc -eq 0 ] && echo "  flash  ok ($(wc -c < "$OUT/flash.json") bytes)" \
                    || echo "  flash  FAILED (rc=$flash_rc, $(wc -c < "$OUT/flash.json") bytes) — see $OUT/flash.err"
[ $pro_rc   -eq 0 ] && echo "  pro    ok ($(wc -c < "$OUT/pro.json") bytes)" \
                    || echo "  pro    FAILED (rc=$pro_rc, $(wc -c < "$OUT/pro.json") bytes) — see $OUT/pro.err"

if [ $flash_rc -ne 0 ] && [ $pro_rc -ne 0 ]; then
  echo "  both reviewers failed — nothing to consolidate."; exit 1
fi

# -- consolidation ----------------------------------------------------------
echo "  codex  … consolidating (${CODEX_MODEL:-gpt-5.6-sol})"

CONSOLIDATE="You are the meta-reviewer for one $KIND ($ESSAY) of *The Program Is Now a Model*. If it is a chapter,
the contract is scripts/prompts/review-checklist-chapter.md and notes/chapters/CHAPTER-PLAN.md, not notes/BRIEF.md. Two models
reviewed it independently against a fixed checklist (scripts/prompts/review-checklist.md). Your
job is to be adversarial toward THEIR findings, not toward the essay.

For each finding they report:

1. **Verify it against the repository.** You have shell access at the repo root. Check the
   finding against CONTEXT.md §3–§5b (the essay contract, voice, the sourcing standard and the
   licensed-material rules), against corpus/$SLUG/receipts.tsv, and against the cited lecture
   files under resources/udemy-subs/ — read the transcript when a finding depends on what it
   actually says. Recompute any arithmetic finding yourself and report the number you get.
2. **Drop what does not survive.** A wrong finding costs more than a missed one: the author has
   to spend attention rejecting it.
3. **Merge duplicates.** If both reviewers found the same problem, say so explicitly —
   independent agreement is a real signal.
4. **Rank by severity**, most serious first, favouring the checklist's own priority order: a
   missing step in the mechanism, an unreceipted number, close paraphrase of a lecture, wrong
   arithmetic, a framework or product presented as the mechanism without an 'as of', an exercise
   that fails the contract, an unlabelled invented example, anthropomorphism that hides the
   mechanism, a voice violation, overlap with another essay.

Output a markdown report with exactly these sections:

- **Confirmed findings**, ranked, each with: category, severity, the offending text, what is
  wrong, the evidence you verified (cite the CONTEXT.md section, the receipts row, or the
  lecture file and what it says), and a concrete fix.
- **Rejected findings**, with one line each on why they did not survive.
- **Publication judgment** — is this essay publishable as-is, and if not, the single most
  important change.

Be concise. The author reads every word of this. Nothing you write is applied automatically —
this is a report for a human to accept or reject finding by finding.

## Reviewer A (Gemini flash: $FLASH)

$(cat "$OUT/flash.json" 2>/dev/null || echo '(failed)')

## Reviewer B (Gemini pro: $PRO)

$(cat "$OUT/pro.json" 2>/dev/null || echo '(failed)')

## The essay

$BODY"

# stdin must be closed: with a positional prompt, `codex exec` still waits on
# stdin and will hang forever inside a background job.
timeout 900 codex exec --skip-git-repo-check -m "${CODEX_MODEL:-gpt-5.6-sol}" -C "$PWD" "$CONSOLIDATE" \
  < /dev/null > "$OUT/report.md" 2>"$OUT/codex.err" || {
    echo "  codex FAILED — see $OUT/codex.err"
    echo "  raw reviewer output is in $OUT/"; exit 1; }

echo
echo "  report: $OUT/report.md"
echo "  nothing above was applied to the essay. Read the report and accept or"
echo "  reject each finding by hand, then log both in CONTEXT.md §6 and §8."
echo
sed -n '1,60p' "$OUT/report.md"
