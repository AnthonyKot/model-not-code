# Verified review — chapters 6 and 8 rework (2026-09-17)

Trigger: Codex's editorial read of chapters 5–8 (notes/reviews/chapters-05-08-read-2026-09-17.md), three supported findings. Revision by the Claude main session; Codex out of tokens. Independent review: AGY gemini-3.8-flash-high, `--mode plan`, read-only bundle (instructions, the Codex read, the unified diff of both chapters, both new run logs); flash.md 6,503 bytes, exit 0. Judgment: chapter 6 pass; chapter 8 conditional on three text corrections. Reviewer executed nothing; runtime evidence in corpus/build-the-assistant/ and corpus/did-the-shop-need-a-model/ (PyTorch 2.14.0+cpu in a scratch venv; both exercises reproduced their published logs byte-for-byte before the change).

## Findings and verification

1. **Chapter 8, the rule's held-out MRR 0.083 explained as a wrong-product match — accepted.** Verified by running `rule_order('clock for the wrist')`: the watch's own chunk is at rank 2 behind the lamp's chunk, both containing *the*; `score` gives 0 for a wrong product, so 0.083 = ½ ÷ 6. Sentence corrected.
2. **"the second table" left over from the two-table draft — accepted.** Now "the third table".
3. **Held-out queries claimed to be built only from click-log words; *of* is out of vocabulary and *to* is a catalogue word — accepted.** Verified against the vocabulary. Prose, code comment, print label and bullet now say click-log content words with ordinary connectors.
4. **`show()` re-ran the search on the question string instead of showing what the loop received — accepted (non-blocking).** `search` now records what it handed over in `LAST_SEARCH`; `show` prints that. Outputs unchanged.

Chapter 6 and the T1 discussion: no substantive issue reported; reading rule judged honestly presented (path shown, rate not claimed). Arithmetic and prose–output agreement verified by the reviewer and by rerun after the fixes.
