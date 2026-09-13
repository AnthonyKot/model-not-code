# Tight rewrite brief (generic) — produces a comparison variant, never edits the published essay

Based on the brief the author accepted for essay 1 (see notes/codex/codex.md §1). Target register:
a **serious technical article** — precise, economical, confident — that a **curious non-technical
reader** can still follow, while remaining useful to the book's main reader (a senior developer new to
ML). Model of the register: `essays/model-is-a-learned-function.md` (the accepted rewrite).

## Input and output
- Read `essays/SLUG.md` (the published version), `corpus/SLUG/receipts.tsv`, `corpus/SLUG/run.log`,
  `notes/essays/SLUG.md` (author's read notes and review decisions — honour every accepted one), and
  CONTEXT.md §4.
- Write the rewrite to `essays/variants/SLUG.tight.md`. **Do not edit `essays/SLUG.md`** or any
  other file.

## Cut or compress
- Commentary around the mechanism: scene-setting openings, advice to the reader about what to do at
  work, sentences announcing what comes next, restatements, doubled or hedged sentences, rhetorical
  set-ups ("That is not a defect; it is the mechanism").

## Keep, exactly
- The `# ` title line, unchanged.
- The mechanism and its limits; the worked example with every number shown so a reader can check it;
  every table's numbers; every `<figure>` SVG (you may shorten its caption); every
  `<p class="formula">` (keep a term-by-term gloss right after each).
- The exercise section after exactly one `<!--mission-->` line: the code block **character for
  character** (it is the script that was run), a shorter walk-through, and the expected output exactly
  as printed in `run.log`. Keep any follow-up variations and their verified numbers.
- The italic source credit line at the end, unchanged.
- Do not invent numbers. If you must add one, compute it and show the computation on the page.

## Author's rules (hard)
- The book is the source of truth: never write "the course", "the lecture", "reported", or name a
  book as the source of a fact; no discussion of sources in the prose.
- Define every technical word on first use. Small numbers first, then generalisation. Arithmetic
  with more than three terms in a markdown table. HTML `<sub>`/`<sup>`, never underscores for
  subscripts in prose.
- Second person, no "we", no anthropomorphism, no slogans, no condescension.
- Target about 60–70% of the current prose length, never below 1,000 words of prose.

## Finish
- Run `node checks/paraphrase.mjs --all 2>&1 | grep 'SLUG.tight'` (0 twelve-word failures required).
- Report: prose word count before and after, what you cut, what you restructured, any number touched.
