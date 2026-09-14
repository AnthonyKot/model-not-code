# Actionable review of one chapter (codex, read-only)

You are reviewing `chapters/{{SLUG}}.md`, one chapter of *The Program Is Now a Model*: eight project
chapters that follow one online shop, for a senior software developer new to ML practice. The author
and the main session will read your report together, decide change by change, and apply the accepted
ones by hand. **You do not edit any file.** Your output is a list of proposed changes that can be
accepted or rejected one at a time.

## Read first

- `scripts/prompts/review-checklist-chapter.md` — what a chapter must be, and the priority order of
  failures. It is the contract; its JSON output section does not apply to you (format below).
- `CONTEXT.md` §4, §5, §5b; `notes/chapters/CHAPTER-PLAN.md` (this chapter's section list and its
  links to other chapters); `notes/chapters/{{SLUG}}.md` (the drafting note).
- `corpus/{{SLUG}}/receipts.tsv` and every `corpus/{{SLUG}}/run*.log`.
- Source transcripts under `resources/udemy-subs/course-<id>/NN-NN-*.txt` when a proposal depends on
  what a source says; other chapters in `chapters/` when it depends on a forward or back reference.
- Earlier review output, as **leads to verify, not findings**: `checks/reviews/{{SLUG}}/flash.json`,
  `pro.json` and `checks/readers/{{SLUG}}/*.md` if they exist. Most leads will not survive; that is
  expected. `RESUME.md` lists findings already accepted for chapter 1; do not propose them again,
  but say so if you find one of them wrong.

You may run code in a scratch location (`/tmp`) to recompute a number: the exercise needs PyTorch,
which is in `/tmp/claude-1000/-home-diablo/61edc119-0ca2-4ae9-9e8b-fc1c94596078/scratchpad/venv/bin/python`
if that path exists. Never write inside the repository.

## What counts as a change worth proposing

A proposal must pass this test: **without the change, would a careful reader get something wrong, be
unable to recompute a worked number, misapply a knob in practice, or be misled about what the
evidence supports?** Or does the chapter break a hard rule in the checklist (source narration, an
unreceipted number, close paraphrase, an exercise that fails the contract)? If neither, drop it.

In scope, in the checklist's priority order: a missing step in a mechanism; a number with no receipt or
run log, or a claim stronger than its evidence; wrong arithmetic or output that does not match the log;
a recurring knob stated imprecisely or contradicting another chapter; a plan section missing or a
broken cross-chapter promise; close paraphrase; a product or framework claim without an "as of"; an
exercise or "thing to try" not supported by a log; source narration or anthropomorphism that hides the
mechanism; a passage a practitioner would never use that costs real length.

**Out of scope — do not propose:** word choice, rhythm, sentence order, synonyms, "clearer" rewordings
of correct sentences, formatting preferences, heading renames for taste, adding praise or summaries,
extra caveats that no evidence calls for, and new material the plan does not ask for. If you are unsure
whether something is cosmetic, it is.

At most **12 proposals**, ranked by how much damage the current text does. Fewer is better than padded.

## Every proposal must be directly applicable

- **Quote the current text exactly**, long enough to be unique in the file (it will be used as a
  search string), with its line number.
- **Give the replacement text exactly**, in the chapter's voice, with every number in it either already
  in the chapter's receipts or logs, or recomputed by you with the computation shown in the evidence.
  If the fix needs a new run or a source the repository does not have, say so instead of inventing text.
- **Show the evidence you checked**: file and line, the log line, the receipt id, the recomputed value.
- A change that touches several places (for example a number repeated in prose, table and exercise
  output) is one proposal listing every location.

## Output — markdown, exactly these sections

```
# Codex review: {{SLUG}}

## Proposed changes

### 1. <short title> — <category from the checklist>, <high|medium|low>
- **Where:** line N
- **Current:** "<exact text>"
- **Replace with:** "<exact text>"
- **Why it matters:** <what a reader gets wrong without it, one or two sentences>
- **Evidence:** <what you checked and found>

### 2. …

## Needs the author's decision
<judgment calls where the evidence does not settle it: the options, the trade-off, your
recommendation; at most 4; empty if none>

## Leads checked and dropped
<one line each for earlier-review leads you verified and rejected, with the reason>
```

Be concise. Every word is read by a person deciding whether to act.
