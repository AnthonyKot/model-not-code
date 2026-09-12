# CONTEXT — *The Program Is Now a Model*

Authoring constitution for `~/book20`, published as `AnthonyKot/model-not-code`. Read this before
touching an essay. Precedence when documents disagree: this file → `AGENT.md` → `notes/BRIEF.md`
(the essay contract) → the essay's pitch in `notes/pitches/<slug>.md` → prose.

## 1. Purpose and reader

Twenty to thirty standalone essays on the practical things a **senior software developer moving
into ML / AI engineering** needs. The reader has ten to twenty years of software behind them,
is fluent in systems, testing, deployment and measurement, and is new to ML practice. Nothing
here explains what a loop, a queue or a feedback loop is. Everything explains what changes when
the program you ship is a model: a table of numbers produced by an optimiser from data, with
behaviour you measure rather than read.

**Every essay is built around one mechanism**, explained step by step with a worked example the
reader can recompute, and closed with an exercise they can do without a GPU, a paid API or the
source. This is a standing lesson from the author's other books: one mechanism fully explained
outlasts an idea tour, and the only course on the author's shelf that was finished end to end was
the three-hour internals one.

Not for: the data scientist who wants statistics from the ground up; the researcher; the manager
who wants a vocabulary. Nothing is sold. The book ends and that is all it does.

## 2. Shelf and parts

The register is `site/catalog.mjs` — slug, part, title, the one-sentence mechanism, `sources[]`
and `status`. Array order is reading order. Slugs never change; titles may.

| Part | Title | Essays |
|---|---|---|
| I | The program is now a set of weights | 1–4 |
| II | Data and training | 5–12 |
| III | Evaluation and monitoring | 13–18 |
| IV | Serving and inference | 19–22 |
| V | LLM systems: retrieval, fine-tuning, agents | 23–26 |
| VI | The job | 27–30 |

Thirty candidates; the pitch gate (§7) cuts to whatever earns its place, expected 24–30.
Pilots: `kv-cache` (IV), `lora-is-a-low-rank-diff` (II), `measure-retrieval-before-blaming-the-model`
(III) — three parts, three source shapes.

Status values: `pitched` → `drafted` → `reviewed` → `read` (the author has read it and left a
note) → `published`. Only `published` essays are built into the index unless `--all`.

## 3. Essay contract

`notes/BRIEF.md`, adopted from book11 with one change: the sources are courses and books rather
than one book. In short: 1,000–1,800 words; one idea; a clear problem and its consequence; the
mechanism step by step; a worked example with actual reasoning and arithmetic; limits or a
counterexample; exactly one `<!--mission-->` before a final exercise with an expected result;
a short source credit. Third person for the mechanism, second person for the reader. No
manufactured scenes, no first-person anecdotes, no pull quotes. Invented examples are labelled
as examples.

## 4. Voice

Imported from *The Going Concern* §4 and kept whole:

- **Second person for the reader.** "You will see the loss stop falling" — not "we".
- **Numbers or nothing.** A number in the prose is either derived on the page, in a receipt, or
  absent. No numbers from memory. Being dull is a failure; being wrong is a betrayal.
- **Name the failure mode inside the principle**, not in a footnote.
- **No hero founders, no hero researchers.** The point of a paper or a course is the mechanism,
  not the person. Instructors are named as sources, not endorsed.
- **No war-metaphor register.** No crushing, dominating, beating, killing.
- **Nothing sold.** No newsletter, no course, no consulting, no affiliate anything.
- A provocation may open an essay. It may not close one; if a sentence stands unqualified at the
  end, qualify it or cut it.

Added for this book:

- **No anthropomorphism that hides the mechanism.** A model does not "understand", "know",
  "want" or "decide"; it produces a distribution over tokens, a score, an action. The word is
  allowed only when the next clause says what it stands for.
- **Frameworks are examples, not the subject.** TensorFlow, PyTorch, LangChain, vLLM appear as
  the instance the source used, dated "as of" the course's recording where it matters. The
  mechanism must survive a change of framework.
- **Courses are named study sources.** "Lecture 7.3 of the LLM Engineering course walks through
  the QLoRA settings" is fine; a lecture's number is written "as reported in the lecture" and
  labelled `reported` in the receipts. Nothing a lecturer said is repeated as the book's own
  finding.

## 5. Sourcing standard

Two source classes, three receipt forms, all in `site/catalog.mjs` `sources[]` and per essay in
`corpus/<slug>/receipts.tsv` (schema in `corpus/SCHEMA.md`):

- **Course lecture:** `course-<udemy id>/<NN-NN>` — must resolve to exactly one lecture file under
  `resources/udemy-subs/` (`.txt`, or `.en.txt` for the translated course). `checks/receipts.mjs`
  gates on this.
- **Book page:** a key in `resources/MANIFEST.tsv` plus a page or page range, located at drafting
  time by reading the page, never from memory. The check confirms the key exists and the page is
  in range; it cannot confirm the page says what the receipt claims — that is the reviewers'
  and the author's job.
- **Paper / public document:** arXiv id or URL plus section; the PDF, if on disk, is under
  `resources/books/`.

Evidence labels (from book11, extended): `observed` (the essay's own arithmetic or a fact the
reader can recompute) · `reported` (a number or claim as the lecturer or author states it) ·
`inferred` (the book's reading of a source) · `hypothesis` (the book's own claim, marked as such)
· `disputed` (source and a public primary source disagree; the essay says which it follows).

**Worked-example numbers are the book's own** and must be recomputable from the page. Lecture
figures (a 0.73 → 0.91 MRR, an 18M-parameter adapter) are `reported` and stay in the lecturer's
mouth.

## 5b. Licensed material

The transcripts are paid course captions and the books are the author's copies. Rules:

- **Paraphrase only.** No transcript sentence is reproduced. `checks/paraphrase.mjs` fails the
  build on any 12-word run shared with a cited course's lecture files and warns on 8-word runs;
  deliberate quotations of a phrase (≤ 8 words, in quotation marks) are listed in
  `checks/paraphrase-allow.tsv`.
- **No transcript or book text enters the repository.** `resources/` and `workspace/` are
  gitignored; `site/check.mjs` fails on any leaked private path.
- **Ideas and examples are re-derived.** A worked example in the book uses the book's own
  numbers, not the lecture's, unless the lecture's number is the point and is labelled `reported`.
- **Courses are credited by name** in each essay's source line and on the about page, as
  study material the author paid for. The book is not a substitute for them and says so.

## 6. Essay register

One entry per slug, appended as the essay moves through §7. Format: pitch chosen (letter and
one line), sources actually used, checks status, review findings accepted / rejected with a
line each, the author's read verdict, published date. Empty until the pitch gate runs.

**Pitch picks, Parts I and II (author, 2026-09-13; agents' recommendations accepted as
picked):** 1 `model-is-a-learned-function` A · 2 `tokens-not-characters` A ·
3 `attention-is-a-soft-lookup` B · 4 `embeddings-are-coordinates` B ·
5 `validation-set-is-a-budget` A · 6 `class-imbalance-changes-the-loss` A ·
7 `augmentation-declares-invariance` A · 8 `input-pipeline-is-the-bottleneck` A ·
9 `transfer-learning-freeze-then-thaw` B · 10 `lora-is-a-low-rank-diff` A ·
11 `learn-the-action-or-learn-its-worth` B · 12 `ppo-clips-the-step` A. Any pick may be
changed before its essay is drafted.

- **`lora-is-a-low-rank-diff`** — pitch A. Drafted 2026-09-13 (main session). Sources used:
  course-6100015 07-02..07-06, 07-11, 07-12, 07-20; raschka-qai pp. 141–142; arXiv:2106.09685
  §4.1–4.2. Checks green (15 receipts passed, 5 paper receipts unchecked, 0 paraphrase hits).
  Two `disputed` receipts: alpha convention (essay follows the paper's alpha / r) and Raschka's
  printed 25 × 50 = 6,250 (essay gives 1,250). Reviewed 2026-09-13: 8 findings accepted and
  applied, 2 rejected (see §8 and `notes/essays/lora-is-a-low-rank-diff.md`). Published 2026-09-13 on the
  author's instruction so it can be read on Pages; the author's read note is still owed.

## 7. Pipeline

1. **Pitch gate** — for each slug in a part, three four-sentence pitches (problem, mechanism,
   worked example, exercise), each naming the lectures and pages it would draw on, written to
   `notes/pitches/<slug>.md`. The author picks one, asks for a rewrite, or rejects the essay. **No
   essay is drafted without a picked pitch.** Runs part by part: I with II first (they hold two
   pilots), then III (the third pilot), then IV, V, VI.
2. **Research** — the drafting session reads the cited lectures and book pages into
   `workspace/<slug>/` (notes, page dumps); receipts are written *during* this step.
3. **Draft** — the main session writes the essay in one sitting from the picked pitch and the
   notes. Subagents draft only when several essays run in parallel, and then they write files as
   they go and own only `essays/<slug>.md`, `corpus/<slug>/` and `notes/essays/<slug>.md`.
4. **Checks** — `npm run check` (structure, links, leak paths, receipts, paraphrase) must be green.
5. **Review** — `scripts/review.sh <slug>` (two Gemini lanes, codex consolidating; nothing
   applied) and `scripts/readers.sh <slug>` (four personas). Findings accepted or rejected by hand,
   logged in `notes/essays/<slug>.md` and summarised here in §8. Mechanical application of accepted
   findings goes to codex.
6. **The author's read** — `status: read` only on the author's note; `published` on their say.
7. **Consistency pass** before publishing a batch — `npm run consistency` (shared 5-grams,
   opener variety, hedge density, anthropomorphism list).

## 8. Verification and its limits

What the checks prove: every cited lecture exists; every book key is in the manifest and every
page in range; no transcript run of twelve words appears in an essay; the site builds with one
title, one mission and no broken link per page; no private path leaked.

What they cannot prove, and the about page says so: that the lecturer is right (mechanism
claims are re-derived in the essay's own arithmetic; the rest is `reported`); that any code
snippet runs (snippets are captioned "illustrative, not executed" unless `corpus/<slug>/run.log`
exists); that the mechanism supports the lesson drawn from it (only reading catches that — the
review checklist's first item and the author's read are the only two checks); product and API
currency (bounded with "as of" in the `caution` field; tools are examples); that any reader
learned anything (exercises carry expected results; nothing claims an outcome).

Review log (accepted / rejected, by essay) accumulates below as essays are reviewed.

- **`lora-is-a-low-rank-diff`** (2026-09-13; Gemini flash 6 findings, Gemini pro 2, three reader
  personas; codex at its usage limit, consolidated by hand). Accepted: memory claim overclaimed
  (only gradients and optimiser state scale with the diff); SVD check lacked the formula; 20,000 /
  800,000 rows unreceipted (both lanes independently); exercise updated B before A's gradient;
  assertion locator; "gradient says so"; why weight-space fit stands in for the task loss; the
  evaluation-metric claim cited to 7.11 instead of 7.6.
  Rejected: drop lecture citations and state model dimensions from memory (against §4/§5);
  speculate on the cause of Raschka's arithmetic error. Retro note for the pilots: the review
  lanes worked without codex; the flash lane's first run wandered into a file search and had
  to be rerun; the codex persona is dead whenever codex is rate-limited.

## 9. Decision log

- **2026-09-12** — Book planned from the author's seven Udemy transcripts and ML library.
  Decisions: `~/book20`; reader = the Going Concern reader; form = book11 standalone contract;
  transcripts as named, paraphrased study sources; title *The Program Is Now a Model*, slug
  `model-not-code`; pitch gate part by part; pilots `kv-cache`, `lora-is-a-low-rank-diff`,
  `measure-retrieval-before-blaming-the-model`. Thirty candidates registered in the catalog.
- **2026-09-12** — Lectures 8.2 and 8.4 of the TensorFlow course carry no captions on Udemy (six
  such videos in that course; see `resources/README.md`); the augmentation essay cites 8.3 and
  8.5 instead. Section 33 of the TensorFlow course is lecture-for-lecture the same as the
  Mistral course; cite `6538601` as primary.

- **2026-09-12 (late)** — Pitch gate run for Parts I and II (12 slugs × 3 pitches in
  `notes/pitches/`, agents' picks in `notes/pitches/PICKS-I-II.md`; the author has not picked yet).
  Catalog corrected from the pitch writers' source notes: `tokens-not-characters` cites 01-29..01-32
  (01-24..01-27 held no tokenizer material); `input-pipeline-is-the-bottleneck` drops 10-04. Other
  notes to carry into drafting: no cited lecture explains the BPE merge procedure (source it from
  `llm-deep-dive`); only 4735368/28-02 carries the causal mask with shapes; LoRA lectures describe
  alpha as a plain multiplier where the paper uses alpha/r (follow the paper, say so), and 07-06's
  "17MB" is a slip for ~70MB; none of the PPO lectures mentions RLHF (rests on arXiv:2203.02155
  §3.5); the RL lectures show formulas only on slides, so Lapan's pages are needed for the written
  updates. codex was unavailable (usage limit); the phase-0 port was done by a Sonnet agent
  (`notes/codex/phase0-report.md`); review.sh/readers.sh are ported but not yet exercised.

- **2026-09-13** — A Codex session (before this one) stepped back from the pitch pipeline to
  audit the sources; its reports are now in `notes/research/source-map-2026-09-13.md` and
  `notes/research/codex-handoff-2026-09-13.md` (the file inventory, which holds private paths,
  stays in the ignored `workspace/`). The author decided: pilot first, audit after — draft the
  LoRA pilot now from pitch A, accept the agents' Part I–II picks as the author's, and run an
  outline audit of Parts III–VI (`notes/research/outline-audit-2026-09-13.md`, recommendation
  only) before pitching those parts. Part III/IV pitch agents were therefore not launched.
  Findings from the source map carried into drafting: Raschka's LoRA page (physical 142) has a
  wrong product (6,250 for 25 × 50); the retrieval-evaluation lectures use keyword proxies; no
  cited lecture derives BPE merges; several local editions are early releases or drafts and
  receipts should say so; four books (Data Contracts, Data Engineering Design Patterns,
  Kubeflow, OpenShift MLOps) are candidates for the manifest.
- **2026-09-13** — LoRA pilot drafted; `review.sh` / `readers.sh` exercised for the first time.

## 10. Open questions

- Whether Part VI's four essays, sourced mostly from books rather than courses, belong in this
  book or in a later companion; decide after the pilots.
- Whether the paraphrase guard's 12-word threshold is right for spoken transcripts, where filler
  makes accidental 12-word matches unlikely and 8-word matches plausible; recalibrate after the
  first pilot.
- The Arabic course's translated captions are machine output; receipts point at `.en.txt` and
  the essay's `caution` must say the source is a translation.
