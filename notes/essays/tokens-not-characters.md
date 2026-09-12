# tokens-not-characters — essay note

**Pitch:** A (the model never saw the letters; byte-pair merges derived on the page), picked by
the author 2026-09-13. **Drafted:** 2026-09-13 by a subagent, receipts first.

**Sources actually used:** course-6100015 lectures 01-29, 01-30, 01-31, 01-32, 03-11, 03-12,
03-13, 03-14 (Ed Donner, LLM Engineering); course-6538601 03-02 (Mistral tokenizer, begin-of-
sentence ID); llm-deep-dive physical pp. 65 and 77 (printed 35 and 47; §2.3.3 and §2.4.2.5; both
read via pdftotext, dumps in `workspace/tokens-not-characters/pages/`); Sennrich, Haddow and
Birch, arXiv:1508.07909 §3.2, fetched 2026-09-13 (not in `resources/books/`; the PDF is in the
session scratchpad only).

**Source finding that changes the source map.** `notes/research/source-map-2026-09-13.md` says no
lecture and no checked book page derives the byte-pair merge procedure, and that is confirmed:
the lectures show only tokenizer outputs, and llm-deep-dive p. 65 names BPE and WordPiece with an
"unhappiness" example but gives no algorithm. However, the original paper (arXiv:1508.07909 §3.2)
does state the procedure in full: initialise with the character vocabulary, each word as its
characters plus an end-of-word symbol, count all symbol pairs, replace every occurrence of the most
frequent pair with a new symbol, repeat; final vocabulary = characters + merges; the merge count is
the only hyperparameter; pairs never cross word boundaries so the count runs over the word list
weighted by frequency. The essay's five-step list is written from that section in the book's own
words and verified by the toy trainer; the procedure is therefore `reported` to the paper
(tokens-17) and the worked example is `observed` (tokens-18..22, 24). The book's page is cited only
for what it says (subwords, the unhappiness split, tokenizer trained before the model, embedding
row lookups).

**Word count:** 2,214 in the file; 1,801 prose (code block, tables, mission marker and source
line excluded). One word over the 1,800 guide (the pilot was 1,802); the "What this does to a question about letters" section is the
place to trim if a reviewer asks.

**Numbers and their provenance:**
- Round-1 pair counts 9 / 7 / 4 / 2 / 1 / 1, round-2 counts 7 / 3 / 2 / 1, round-3 counts 3 / 2 / 1,
  the merges u+n, s+un, sun+g, the 8-entry table (5 + 3) and the encodings sun 1, sung 1, gun 2,
  gong 4, snug 4 — hand tally in `workspace/tokens-not-characters/lectures.md`, confirmed by
  `workspace/tokens-not-characters/exercise.py` (`corpus/tokens-not-characters/run.log`). **The
  pitch's claimed merges and counts were correct.**
- "About four characters per token / three quarters of a word", "61 characters, 12 words,
  15 tokens", three-digit number chunks, and "128,256 entries of which 256 reserved" — `reported`
  (tokens-05, 06, 11, 12), attributed once in the prose to "the course this essay draws on", no
  lecture numbers inline.
- "A 1994 compression trick that replaced the most frequent pair of bytes with an unused byte" —
  from arXiv:1508.07909 §3.2's description of Gage 1994 (tokens-17).
- 200-merge run on the essay's own prose (1,791 words, 469 distinct; first merges th, the, er, in, or, an, un, en; "and" 14th; "strawberry" → 7 pieces st, ra, w, b, er, r, y; "snug" → 3; "sung" → 1)
  — `observed` (tokens-24), Python 3.12, no library. The reporting paragraph is part of the prose
  it describes, so it was iterated to a fixed point (the run on the final text reproduces the
  figures the text states). Any later edit to the prose must rerun the trainer and refresh that
  paragraph, receipt tokens-24 and run.log.
- No real tokenizer's split of "strawberry" is claimed anywhere: tiktoken is not installed and
  nothing on disk reports it. The title's word is handled by the mechanism only ("count the
  pieces that come back").

**Hypothesis, labelled:** that letter-counting fails because the count must be recalled from
training text rather than read from the input is the book's own reading (tokens-23), stated as
such in the prose ("the book's reading of the failure, put forward as a reading and not tested
here"), and bounded in Limits: the mechanism proves the letters are absent from the input, not
that a model cannot count them.

**Simplifications the essay declares:** the toy drops the paper's end-of-word symbol (so `un` in
"gun" and inside "sung" are one entry), and does not decide ties (the exercise code breaks them
alphabetically, and the toy corpus has no tie in its first three rounds). An earlier draft said
real tables start from bytes; that had no receipt and was cut.

**Exercise:** plain Python 3, `workspace/tokens-not-characters/exercise.py`, run with Python
3.12.3; expected result in the essay matches run.log (u+n, s+un, sun+g; sung 1, gun 2, gong 4,
snug 4).

**Checks:** `BUILD_ALL=1 npm run build && BUILD_ALL=1 npm run check` green 2026-09-13 for this slug:
16 receipts passed, 0 failed, 8 paper receipts unchecked by design; 0 twelve-word failures, 0
eight-word warnings.

**Suggested catalog changes (not applied; the catalog is not this agent's to edit):**
- `sources[]`: add the paper, arXiv:1508.07909 §3.2 — it is the only source on disk or fetched
  that states the merge procedure, and the essay's mechanism rests on it. Consider dropping
  lecture 01-32 (used for one sentence on cost and window being counted in tokens) if the
  catalog prefers a tight list.
- `caution`: the 128,256 vocabulary and the four-characters rule are the course's figures as of
  its recording; the essay does not name the model family for the rule.
- Title: keep. The essay does not claim any real tokenizer's split of "strawberry"; if the
  author wants the title's word tokenized on the page, a `reported` figure from a tokenizer UI
  would have to be added at review time and dated.

**Owes:** the context-window and cost arithmetic is left to Pitch B territory ("another essay in
this part") — that essay does not exist in the catalog under this slug; if no Part I or IV essay
picks it up, the sentence should be softened to "elsewhere". Nothing owed to other essays
otherwise; `attention-is-a-soft-lookup` and `embeddings-are-coordinates` may cite tokens-01 /
tokens-16 for "token IDs in, vectors later".
