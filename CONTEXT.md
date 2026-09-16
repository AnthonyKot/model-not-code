# CONTEXT — *The Program Is Now a Model*

Authoring constitution for `~/book20`, published as `AnthonyKot/model-not-code`. Read this before
touching an essay. Precedence when documents disagree: this file → `AGENT.md` → `notes/BRIEF.md`
(the essay contract) → the essay's pitch in `notes/pitches/<slug>.md` → prose.

## 1. Purpose and reader

> **Superseded in form (2026-09-13):** the essays are being merged into project chapters of
> 20,000–35,000 characters, each explaining one thing end to end on a real project. The plan is
> `notes/chapters/CHAPTER-PLAN.md`; where this section says "standalone essay" or "1,000–1,800 words",
> the plan wins. Every other rule (sourcing, register, formulas, exercises) still holds. Since the
> late-night entry in §9 the chapters are written from scratch in `chapters/`; the essays are an archive.

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

Two one-liners per essay, for two readers: `mechanism` is the register's statement of what the
essay explains, in the book's technical shorthand; `payoff` is the line shown under the title and
on the shelf card, written for someone who has not read the essay yet (author's note on the LoRA
pilot, 2026-09-13: the mechanism line was "cryptic if you have not read the thing"). Every drafted
essay gets a `payoff`; the build falls back to `mechanism` only when it is empty.
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

Recommendations the author added on 2026-09-13 after reading essay 4:

- **Connect it forward and back (recommended).** When a quantity or knob appears in more than one
  essay, say so where it appears: temperature in embeddings is the same knob as temperature in
  generation; softmax scaling returns in LoRA's alpha. Chapters should build on each other.
- **Start from how the sources explain it practically (recommended).** Before writing a mechanism,
  check how the courses and books in the repo explain it to a practitioner (an API parameter, a config
  field, a line of code) and build on that framing. Do not re-derive what a practitioner never derives.


Added for this book:

- **No anthropomorphism that hides the mechanism.** A model does not "understand", "know",
  "want" or "decide"; it produces a distribution over tokens, a score, an action. The word is
  allowed only when the next clause says what it stands for.
- **Frameworks are examples, not the subject.** TensorFlow, PyTorch, LangChain, vLLM appear as
  the instance the source used, dated "as of" the course's recording where it matters. The
  mechanism must survive a change of framework.
- **Courses are named study sources, in the receipts and the credit line, not in the prose.**
  (Author's rule, 2026-09-13, after the LoRA pilot: inline "(lecture 7.3, as reported)" citations
  read as refereeing a video and distract; the essay names the course once where a figure is the
  course's, `reported` receipts carry the lecture numbers, and the source credit at the end lists
  them.) The prose never says "the course", "the lecturer", "reported" or "as reported": the book
  is the voice ("we are the course" — author, 2026-09-13); facts are stated as facts and the
  receipts say where they came from. Where a source and a primary disagree, the essay states the
  correct version and does not stage the disagreement.

## 4b. Review and practice guidance (2026-09-16)

The author requested improving guidance and prompts using Book21's review findings. Apply
`notes/chapters/REVIEW-GUIDE.md` alongside the technical checklist. `review.md` holds
chapter-specific editorial leads, to verify before acting. Review explanatory focus, the decision
left to the reader, combined answer disclosure and fairness of feedback. Keep the connected shop
chapters, recomputable examples and executed CPU demonstration with exactly one mission marker.
A bounded independent decision may sit within that mission; do not replace the demonstration or
import Book21's lab format, word targets or weekly budget.

Treat guided execution, model solvability and observed human learning as distinct evidence. Preserve
necessary limitations; do not interpret shorter prose or a larger exercise as improvement by itself.
This update adopts review criteria, not chapter revisions or evidence of learner progress.

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
  author's instruction so it can be read on Pages. Author's read in progress: provisional 3 of 5,
  "does not block starting new chapters". Read notes: (1) the subtitle under the title was the
  catalog mechanism line, cryptic before reading — fixed by a reader-facing `payoff` on every essay
  (§2). (2) The forward-pass formula was not annotated and the alpha paragraph was too fast —
  fixed; standing lesson: every display formula gets a term-by-term gloss, and a hyperparameter
  is introduced before its convention is stated.
  (3) The 512 × 512 worked example only counted parameters and was hard to follow — replaced by
  a rank-1 diff written out entry by entry, then the sizes; lesson: a worked example shows the
  computation on numbers small enough to write, before it shows the sizes.
  (4) "The course gives the model's inner width as 3072" — "we are the course": no source
  narration in prose at all (rule in §4). (5) The heavy-configuration paragraph was a wall of
  arithmetic; "I can bet the course explains this better, maybe pictures" — both configurations
  are now tables and a shape diagram sits under the forward-pass formula; lesson: arithmetic over
  more than three terms goes in a table, and a shape or flow gets a picture.
  (6) "What Q&A book, let's stop referencing. We are the source of truth for the reader" — the
  Raschka-error paragraph is cut; no essay discusses a source's mistakes; the receipts keep them.
  (7) The numpy exercise was not the code the reader wants to see — "insert a real PyTorch
  snippet and explain what happens in real code". Replaced by a from-scratch LoRA layer in
  PyTorch, run on CPU, explained line by line, plus the PEFT config as an illustrative snippet.
  Lesson for the contract: the exercise shows the mechanism in the code a practitioner would
  actually write (PyTorch by default), still CPU-only, still run with its output in the corpus.
- **`model-is-a-learned-function`** — pitch A. Drafted and reviewed 2026-09-13 (main session);
  9 findings applied, 2 rejected (§8). Status `reviewed`.
- **`tokens-not-characters`** — pitch A. Drafted 2026-09-13 (subagent); flash lane and readers
  applied by the main session (essay note); pro lane rerun read and applied (2 findings). BPE paper arXiv:1508.07909 §3.2 added to
  sources. Status `reviewed`.
- **`attention-is-a-soft-lookup`** — pitch B. Drafted 2026-09-13 (subagent); readers applied;
  review lanes pending in `checks/reviews/attention-is-a-soft-lookup/`. llm-deep-dive pp. 63–68,
  81 added to sources. Flash lane applied (4), 1 rejected; pro lane idled out. Status `reviewed`.

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
- **`model-is-a-learned-function`** (2026-09-13; flash 6, pro 4, three personas). Accepted: the
  "nine numbers" leak from the course's eight-feature model (both lanes, two readers); "seven
  billion" unreceipted / close to 03-05; learning rate "the only knob not derived from data";
  "twenty lines"; a closing overclaim about what a flat curve shows; "a decision was made";
  chain-rule step for the gradient; scale claim softened; "the course" phrasing removed.
  Rejected: the pull-request opening as a scene; noisy points in the worked example.

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
- **2026-09-13** — Author's read of the pilot on Pages: (a) published for reading before the read
  note, on the author's say; (b) inline lecture citations and the "two sources disagree" framing
  removed from the prose at the author's instruction (rule recorded in §4); (c) formulas: `d_in`
  style underscores replaced by HTML subscripts and a `.formula` display line added to the
  stylesheet after the author found the rendering odd in Chrome.
- **2026-09-13** — Outline audit of Parts III–VI delivered as recommendation only
  (`notes/research/outline-audit-2026-09-13.md`): 11 keep, 2 merge, 3 defer, 1 drop, 6 proposed
  additions on the engineering spine, four manifest rows to add, eight open questions. Awaits
  the author's decisions before Parts III–VI are pitched.

- **2026-09-13** — Part I essays 1–3 (`model-is-a-learned-function`, `tokens-not-characters`,
  `attention-is-a-soft-lookup`) published on the author's instruction so they can be read on Pages;
  the author's read notes are still owed.

- **2026-09-13 (morning)** — Author's decisions on the Parts III–VI audit: prompt injection stays a
  standalone essay (`untrusted-text-is-an-untrusted-code-path` is not merged); Part VI keeps two
  essays; Part III at eight is too heavy, so `the-score-is-not-the-lift` is deferred (Part III = 7).
  The rest of the audit's proposed outline is taken as accepted (additions A–D and F, merges of
  `design-the-data-loop-first` into `labels-arrive-later`, drop `show-the-eval-not-the-demo`, defer
  `which-feature-moved-the-prediction`, `position-is-a-rotation`, `predict-the-time-left`). Total
  stays 30. Catalog reshaping for III–VI is queued; the author asked to finish Parts I and II first.

- **2026-09-13** — Essay 1 (`model-is-a-learned-function`) read by the author as "a bit plump";
  rewritten by codex from a written brief into a tighter technical register that a curious
  non-technical reader can follow (prose ~1,800 → ~1,080 words). If the author likes it, this register
  becomes the target for the rest of the book.

- **2026-09-13 (afternoon)** — The eight reviewed Part I–II essays published on the author's say; all
  twelve Part I–II essays are live. The author wants codex rewrites of the ready essays in essay 1's
  tighter register published *alongside* the current versions so they can compare and choose per
  essay; Parts III–IV wait until Parts I–II are final.

- **2026-09-13 (evening)** — Versions picked for essays 1–5; one page per essay, comparison variants
  removed (older versions stay in git history). Essay 1: the codex rewrite. Essay 2: the shorter
  rewrite plus trace. Essay 3: the shorter version rewritten as one story. Essay 4: the original (the
  codex variant was rejected; two passages await a practitioner-register redo). Essay 5: the codex
  tight rewrite.

- **2026-09-13 (night)** — The author read the twelve published essays as "separate islands of ML".
  Decision: merge them into bigger chapters (20,000–35,000 characters) that explain one thing end to
  end on a real project; essay 9 (transfer) joins LoRA; plan everything before writing. Plan in
  `notes/chapters/CHAPTER-PLAN.md` (8 chapters on three running projects: shop product search,
  malaria cell classifier, reward-trained agent), awaiting the author's approval. Parts III–VI are
  planned as chapters 5–8 in the same form.

- **2026-09-13 (later)** — Codex reviewed the chapter plan against the sources; five remarks, all
  adopted (generation was never introduced before the serving chapter; LoRA goes on the language
  model; chapters 2/5 split before/after release; temperature and the RLHF bridge stated precisely;
  chapter 8 closes as a project decision). The author chose to run the image classifier on the
  shop's product photos, so the book follows **one shop**; the assistant chapter now precedes serving.
  Plan revision 2 in `notes/chapters/CHAPTER-PLAN.md`, awaiting approval; chapter 1 is the pilot.

- **2026-09-13 (late night)** — The author approved plan revision 2 and amended it: the chapters are
  written **from scratch**, and the existing essays are kept online for reference only, under
  `docs/old/` (old essay URLs redirect there; each archived page names its replacement chapter). Site
  rebuilt around `chapters[]` in the catalog; checks extended to chapters. Chapter 1, *Search the
  Catalogue, Then Answer From It*, written as the pilot (~27,700 characters of prose; one figure;
  35 receipts; worked numbers verified in `corpus/search-the-catalogue/run-worked.log`; the exercise
  and its two variations run on CPU with logs) and published for the author's read. Not yet through
  the review lanes.
- **2026-09-13 (later still)** — At the author's request ("let's do chapter 2 and I review couple"),
  chapter 2, *Trust the Number Before You Ship the Classifier*, written from scratch and published
  (≈24.6k characters of prose; the age-check flag on the rare blade category carries imbalance and the
  threshold; 34 receipts; exercise, worked numbers and three variations run). The author reviews
  chapters 1 and 2 together before chapter 3.
- **2026-09-13 (night, continued)** — At the author's request, chapter 3, *Reuse a Pretrained Model*,
  written from scratch and published before the review of chapters 1–2 (freeze/thaw with the BatchNorm
  buffer trap on the photo classifier; LoRA on chapter 1's attention projections for the answer writer;
  ≈22k characters of prose; 26 receipts; exercise and two variations run). Chapters 4–8 wait for the
  author's feedback on 1–3.
- **2026-09-13 (night, prep while the author reads 1–3)** — Author's decision: no chapter 4 prose before
  the feedback on chapters 1–3; do the low-regret work instead. Done: (1) `scripts/review.sh` and
  `scripts/readers.sh` accept chapters (`chapters/<slug>.md` wins over `essays/`), with a chapter checklist
  (`scripts/prompts/review-checklist-chapter.md`) and reader frame; the essay checklist's outdated "as
  reported in the lecture" line replaced by the no-source-narration rule; review lanes launched on chapters
  1–3 (reports in `checks/reviews/<slug>/`, `checks/readers/<slug>/`; nothing applied). (2) Chapter 4
  research notes (`workspace/train-from-reward/NOTES.md`; Lapan ch. 19 on RLHF and InstructGPT §3.5 are the
  bridge sources; no course lecture implements a reward model). (3) Exercise prototype verified
  (`workspace/train-from-reward/PROTOTYPE.md`, `corpus/train-from-reward/prototype-run.log`): one shared
  `ppo_loss` for a corridor policy and the answer writer; noisy preference pairs → reward model (0.770
  held-out pair accuracy) → PPO; without the KL penalty the learned reward rises while the labeler's score
  falls (reward hacking); without the clip, 10 reused epochs escape even with KL on. Draft receipts in
  `corpus/train-from-reward/receipts.tsv`.
- **2026-09-14** — At the author's request ("could we also start chapter 4?"), chapter 4, *Train From
  Reward*, written from scratch and published before the review of chapters 1–3 (corridor → Monte Carlo vs
  Q-learning → policy gradient as advantage-weighted cross-entropy → PPO clip → the writer as a policy →
  preference pairs → reward model → PPO with a KL penalty; clip and KL shown as different guards across ten
  seeds; ≈31.6k characters of prose; 34 receipts). Notes `notes/chapters/train-from-reward.md`. Chapters 5–8
  still need an outline approved first.

- **2026-09-16** — Chapter 5, *Keep It Right After Launch*, outlined, approved with three author decisions (question:
  has quality changed enough to justify action when labels arrive selectively; one harmless-alarm change and one hidden
  consequential error, verified in runs; a bounded reader decision in this chapter; the random audit priced separately),
  written from scratch, reviewed by Gemini (2 applied) and published with chapters 1–4's targeted fixes. ≈31.9k
  characters of prose; 44 receipts; exercise, variations, large-sample checks and reader case logged in `corpus/`.

## 10. Open questions

- Whether Part VI's four essays, sourced mostly from books rather than courses, belong in this
  book or in a later companion; decide after the pilots.
- Whether the paraphrase guard's 12-word threshold is right for spoken transcripts, where filler
  makes accidental 12-word matches unlikely and 8-word matches plausible; recalibrate after the
  first pilot.
- The Arabic course's translated captions are machine output; receipts point at `.en.txt` and
  the essay's `caution` must say the source is a translation.
