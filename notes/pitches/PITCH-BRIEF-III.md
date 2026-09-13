# Pitch brief — Part III (Evaluation and monitoring), 2026-09-13

You write pitches, not essays. For each slug you are given, write `notes/pitches/<slug>.md` with
**three pitches (A, B, C)** and a short note on sources, in the same format as the existing Part I–II
pitch files (read `notes/pitches/lora-is-a-low-rank-diff.md` and `notes/pitches/validation-set-is-a-budget.md`
first as the model).

Each pitch is four sentences: (1) the problem the reader brings and its consequence; (2) the one
mechanism, stated step by step compactly; (3) the worked example, with small invented numbers that you
have actually computed (show them; they must be recomputable); (4) the exercise — **real PyTorch or
plain Python, CPU-only, no downloads, runs in under a minute** — and its expected result. After the four
sentences, a "Draws on:" line naming the lectures (`course-<id>/NN-NN`) and book pages (manifest key +
physical page) the pitch would use. Mark one pitch **(recommended)** and say why in one line.

Before pitching, READ the sources. Start with `notes/research/outline-audit-2026-09-13.md` (the section
for your slug: it lists checked passages, traps, and what the essay must not claim) and
`notes/research/source-map-2026-09-13.md`. Open the cited lectures under
`resources/udemy-subs/course-<id>/NN-NN-*.txt` and book pages (`pdftotext -f N -l M -layout` on the file
named in `resources/MANIFEST.tsv`) — cite only what you read. No numbers from memory.

The reader and the author's rules are in `notes/essays/DRAFTING-BRIEF.md` — pitches must be draftable
under them (no source narration in the eventual prose, glossed formulas, small numbers first, a real
exercise). Boundaries with published essays: `validation-set-is-a-budget` already covers best-of-N on
your own validation set; `class-imbalance-changes-the-loss` covers class weights (the threshold essay
must not re-explain them); `model-is-a-learned-function` covers fitted preprocessing briefly.

The catalog title for each slug is a placeholder; propose a better title in the note if it helps.

Save each file as soon as it is written. Edit nothing except your `notes/pitches/<slug>.md` files and
scratch under `workspace/<slug>/`. Do not commit. Report back in under 150 words per slug: the three
pitch headlines, your recommendation, and any source gap that would block drafting.
