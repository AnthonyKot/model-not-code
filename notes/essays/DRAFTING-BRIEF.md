# Drafting brief for essay agents (2026-09-13)

You draft ONE essay of *The Program Is Now a Model* in `/home/diablo/book20`. Your prompt names the
slug and the picked pitch letter. This brief carries everything the author has taught the book so
far; where it is stricter than `CONTEXT.md`, this brief wins (it records the author's latest rules).

For current project chapters, also apply `notes/chapters/REVIEW-GUIDE.md` and verify the
chapter-specific leads in `review.md`. The archived essay procedure below does not override the
current chapter plan or authorize parallel drafting. Guided output remains required; independent
judgment, where appropriate, can be a bounded part of the same mission with answers after the attempt.

## Read first, in this order

1. `CONTEXT.md` §1, §3, §4, §5, §5b and the §6 register entry for `lora-is-a-low-rank-diff` (its
   seven "Author's read" notes are the author's taste in concrete form).
2. `notes/BRIEF.md`, `corpus/SCHEMA.md`, `AGENT.md`.
3. Your pitch file `notes/pitches/<slug>.md` — draft the picked letter; its "Note on sources" lists
   what each lecture actually holds and any known traps.
4. The finished model essays: `essays/lora-is-a-low-rank-diff.md` (the author's most-revised essay)
   and `essays/model-is-a-learned-function.md`. Match their shape and density, not their topics.

## The reader

A senior software developer, ten to twenty years in, fluent in systems and testing, new to ML
practice, with some university maths they have not used in a decade. They will do arithmetic if
every step is on the page. They will not tolerate a formula they cannot read term by term.

## The author's rules (all hard)

- **The book is the source of truth.** The prose never says "the course", "the lecture", "the
  lecturer", "reported", "as reported", or names a book or paper as the source of a fact, and never
  discusses a source's mistakes or a disagreement between sources — state the correct version as
  fact. Provenance lives only in `corpus/<slug>/receipts.tsv` and the one italic credit line at the
  end. (Author: "we are the course"; "we are the source of truth for the reader".) The essays are
  still grounded in the real lectures and pages: read them, receipt them, paraphrase them.
- **No numbers from memory.** Every number is derived on the page, run in your script, or has a
  receipt row labelled `reported` / `inferred` with a real locator. Product facts get an "as of"
  in the receipt note.
- **Every display formula is glossed term by term** right under it, in words, before it is used.
- **Introduce a quantity before its convention.** Say what a hyperparameter is and why it exists
  before any rule of thumb about its value.
- **Worked example: small enough to write every number first**, then the realistic sizes. Show the
  computation happening, not only the counts.
- **Arithmetic with more than three terms goes in a table.** A shape, a flow or a timeline gets an
  inline SVG figure (`<figure class="diagram"><svg …>…</svg><figcaption>…</figcaption></figure>`,
  `fill="currentColor"`/`stroke="currentColor"` so it works in both themes, `viewBox` + `width="100%"`,
  `role="img"` and an `aria-label`). Use one figure where it genuinely helps; do not decorate.
- **The exercise is real code a practitioner would write — PyTorch by default** (plain Python only
  if PyTorch adds nothing, e.g. pure counting). CPU only, no downloads, no GPU, no paid API, runs in
  under a minute. You must RUN it: `/tmp/claude-1000/-home-diablo/61edc119-0ca2-4ae9-9e8b-fc1c94596078/scratchpad/venv/bin/python`
  has PyTorch 2.14 (CPU) and numpy 2.5. Save the script to `workspace/<slug>/exercise.py` and its
  output to `corpus/<slug>/run.log`. In the essay, after the code, a bulleted **line-by-line
  walk-through** of what each part does in real training code, then **Expected result** quoting the
  printed values as the script prints them (e.g. `[0.91, 0.335]`, not a reformatted version).
  If a library call is the usual way (e.g. `torch.nn.CrossEntropyLoss(weight=…)`,
  `torchvision.transforms.v2`, `DataLoader(num_workers=…)`), show it and say what it does under the
  hood; if a library is not installed (torchvision is not), show that snippet captioned
  `# illustrative, not executed; API as of the time of writing` and keep the executed code to torch.
- **Voice.** Second person for the reader, third for the mechanism; no "we"; no scenes beyond the
  reader's own situation; no anthropomorphism ("the model knows/wants/decides") unless the next
  clause says what it stands for; no war metaphors; nothing sold; the last sentence is not a slogan;
  no condescension ("you may have heard of", "if it mentions X it is not finished").
- **Title.** The `# ` line must equal the catalog title in `site/catalog.mjs` exactly. You may not
  edit the catalog; propose title, `payoff` (one reader-facing sentence for someone who has not read
  the essay), `caution` and source changes in your note.
- **Rendering.** HTML `<sub>`/`<sup>` for sub/superscripts, never `d_k`-style underscores in prose;
  `<p class="formula">…</p>` for display formulas; exactly one `<!--mission-->` line before the
  exercise heading.
- **Length.** 1,000–1,800 words of prose (code, tables, figures and the credit line excluded).
  *Superseded 2026-09-13:* the book is moving to project chapters of 20,000–35,000 characters —
  see `notes/chapters/CHAPTER-PLAN.md` before drafting anything new.

## Author's recommendations (2026-09-13)

- **Connect it forward and back (recommended).** When a quantity or knob appears in more than one
  essay, say so where it appears: temperature in embeddings is the same knob as temperature in
  generation; softmax scaling returns in LoRA's alpha. Chapters should build on each other.
- **Start from how the sources explain it practically (recommended).** Before writing a mechanism,
  check how the courses and books in the repo explain it to a practitioner (an API parameter, a config
  field, a line of code) and build on that framing. Do not re-derive what a practitioner never derives.


## Procedure — save files as you go (standing rule)

1. Research into `workspace/<slug>/lectures.md` (your notes with `NN-NN` locators; paraphrase only)
   and `workspace/<slug>/pages/` (`pdftotext -f N -l M -layout` dumps of the book pages you cite;
   EPUBs: unzip to `workspace/<slug>/epub/` and read the XHTML). Book files are under
   `resources/books/` per `resources/MANIFEST.tsv`; lectures under
   `resources/udemy-subs/course-<id>/NN-NN-*.txt`.
2. Write `corpus/<slug>/receipts.tsv` BEFORE the prose (header `claim_id paraphrase label source
   locator note`, tab-separated, no tabs inside cells, ids `<short>-NN`). Book locators are physical
   PDF pages within the manifest's page count; EPUBs use `unknown` plus the section in the note.
3. Write and run the exercise; save `run.log`.
4. Draft `essays/<slug>.md`.
5. Check with `node checks/receipts.mjs` and `node checks/paraphrase.mjs --all` and read only your
   slug's lines (other agents are drafting in parallel; do NOT run `npm run build` or anything that
   writes `docs/`). Fix every twelve-word failure and reword eight-word warnings unless the phrase is
   a generic technical term.
6. Write `notes/essays/<slug>.md`, starting with a line `**Drafted by:** <model name>, subagent (<date>)`; then pitch letter; sources actually used with locators; word counts
   (file and prose); provenance of every number; where you deviated from the pitch and why (if the
   pitch's arithmetic is wrong, the essay uses your verified numbers and the note says so);
   suggested catalog `payoff`, `caution`, title and `sources[]`; anything the essay owes another.

You own ONLY `essays/<slug>.md`, `corpus/<slug>/`, `notes/essays/<slug>.md`, `workspace/<slug>/`.
Do not edit anything else, do not create files at the repo root, do not commit.

Report back in under 200 words: word counts, the verified worked-example numbers, check status for
your slug, deviations from the pitch, and any source problem.

## Reader decision inside the mission (chapter 5 onward, 2026-09-16)

One bounded decision after the guided run, on a changed case whose answer is not the lowest printed number. The task
states the reasoning step it expects (which explanations to test, which trade to price), the purpose of every
supplied figure, and the success criteria including "a defensible action reached by an unsupported diagnosis is
not a pass". Hints and the worked discussion go in two separate `<details>` blocks after the attempt. Run a blind
cheap-model solve on the packet before the author reads it; log it under `notes/reviews/solver-<NN>-<date>/`.
