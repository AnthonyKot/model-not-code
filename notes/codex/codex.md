# Codex prompts that worked

Reference copies of prompts the main session gave codex, with the exact invocation. Add new ones at
the bottom when a prompt produces work the author accepts.

---

## 1. "Plump" rewrite of an essay (2026-09-13) — accepted by the author ("good job")

**Result:** `essays/model-is-a-learned-function.md`, prose ~1,800 → ~1,140 words; example first,
arithmetic in tables, formulas glossed, every number unchanged. Two small fixes by the main session
afterwards (a truncated sentence; one sentence tying the opening back to the title).

**Invocation** (run from the repo root; the stdin redirect is mandatory in background jobs):

```bash
timeout 1800 codex exec --skip-git-repo-check -s workspace-write -C /home/diablo/book20 \
  "Follow workspace/<slug>/CODEX-REWRITE.md exactly. Read the current essay, its receipts \
(corpus/<slug>/receipts.tsv), run.log, CONTEXT.md §4, and the author's most revised essay \
essays/lora-is-a-low-rank-diff.md as the model of density and tone. Then rewrite \
essays/<slug>.md in place." < /dev/null > checks/codex-rewrite-<slug>.log 2>&1
```

Before running: copy the essay to `workspace/<slug>/essay-before-codex.md`. After: read the whole
rewrite, run `scripts/lint-voice.sh <slug>`, `node checks/receipts.mjs`, `node checks/paraphrase.mjs --all`,
check that the opening still delivers the title's promise and that no sentence was truncated, then
log the rewrite in the essay note and CONTEXT §9.

**The brief** (`workspace/<slug>/CODEX-REWRITE.md`), as used for essay 1 — replace the
essay-specific "What must stay" items for other essays:

````markdown
# Rewrite brief: essays/model-is-a-learned-function.md

The author read this essay and found it "a bit plump". Rewrite it so it reads as a **serious
technical article** — precise, economical, confident — that a **curious non-technical reader** can
still follow, while remaining useful to the book's main reader (a senior developer new to ML).

## What "plump" means here (cut or compress these)
- Commentary around the mechanism instead of the mechanism: the pull-request scene in the opening,
  "two questions for the reviewer", "a loss curve is evidence about the loop", "half the program",
  sentences that announce what the essay is about to do, restatements of a point just made.
- Hedged or doubled sentences; rhetorical set-ups ("That slowing is not a defect; it is the mechanism").

## What must stay
- The title line exactly: `# The Program Is Now a Table of Numbers, and Training Is the Compile Step`.
- The mechanism: parameters → loss → gradient → step, repeated; why the loss falls fast then slowly;
  what the learning rate does (too large diverges, too small crawls); the loss formula and fitted
  preprocessing as part of the program; one short limit about non-linear networks.
- The worked example on (1,2), (2,4), (3,6) from m = c = 0 with η = 0.05, and the η = 0.5
  divergence, every number shown so a reader can check it with a pencil. All numbers already in the
  essay are verified (see corpus/model-is-a-learned-function/receipts.tsv and run.log); do not
  invent new ones. If you add a number, compute it and show the computation on the page.
- The exercise section after exactly one `<!--mission-->` line: the same Python script (you may
  tighten comments), a short walk-through of what each part does, and the expected output quoted as
  the script prints it (see run.log). Keep the two follow-up variations and their verified numbers
  (η = 0.005 → loss 0.048 at step 200; third point (3, 12) → loss flattens near 2, m → 5, c → −4).
- The italic source credit line at the end, unchanged.

## Author's rules (hard)
- The book is the source of truth: never write "the course", "the lecture", "reported", or name a
  book as the source of a fact; no discussion of sources in the prose.
- Every display formula (`<p class="formula">…</p>`) is explained term by term right after it.
  Define every technical word the first time (weight, bias, loss, gradient, derivative, learning rate).
- Small numbers first, then any generalisation. Arithmetic with more than three terms goes in a
  markdown table.
- HTML `<sub>`/`<sup>`, never underscores for subscripts in prose.
- Second person for the reader, no "we", no anthropomorphism, no slogans, no condescension.
- Target 1,000–1,300 words of prose (code, tables and credit line excluded). Current is ~1,800.

## How to work
- Edit only `essays/model-is-a-learned-function.md`. Do not touch any other file. Do not commit.
- When done, run `node checks/paraphrase.mjs --all 2>&1 | grep model-is-a-learned` and
  `node checks/receipts.mjs | grep model-is-a-learned`; both must show 0 failures.
- Report: prose word count, what you cut, what you restructured, and any number you changed.
````

**Why it worked** (main session's read): the brief named the author's complaint in the author's
word and then turned it into concrete cut targets; it listed exactly what must survive, with the
verified numbers and where they live, so the rewrite could change the prose without touching the
facts; it pointed at a finished essay as the model of tone instead of describing tone in adjectives;
it bounded the length; and it restricted codex to one file and asked for a report it could be
checked against.

---

## 2. Apply a consolidated review report to one essay (2026-09-13)

```bash
timeout 1500 codex exec --skip-git-repo-check -s workspace-write -C /home/diablo/book20 "<prompt below with SLUG filled in>" < /dev/null > checks/codex-apply-<slug>.log 2>&1
```

Prompt:

```text
Apply every item under "Confirmed findings" in checks/reviews/SLUG/report.md to essays/SLUG.md, using each finding's fix
(adapt wording only where the fix would break CONTEXT.md §4: no "the course"/"lecture"/"reported" in prose, no source
narration, formulas glossed, no anthropomorphism). Ignore "Rejected findings". Do NOT edit site/catalog.mjs — list any
catalog change a finding asks for (sources[], caution, mechanism) in your report instead. If a fix changes any number
or code in the exercise, rerun the script with
/tmp/claude-1000/-home-diablo/61edc119-0ca2-4ae9-9e8b-fc1c94596078/scratchpad/venv/bin/python workspace/SLUG/exercise.py,
overwrite corpus/SLUG/run.log with the new output, update the essay's quoted expected output and every affected row of
corpus/SLUG/receipts.tsv, and make the code block in the essay identical to the script. Append a dated "Review applied
by codex" paragraph to notes/essays/SLUG.md listing each finding and what changed. Edit only essays/SLUG.md,
corpus/SLUG/, notes/essays/SLUG.md and workspace/SLUG/. Do not commit. Finish by running
node checks/receipts.mjs | grep SLUG and node checks/paraphrase.mjs --all | grep SLUG (0 failures required), then report
what changed per finding and the catalog changes requested.
```
