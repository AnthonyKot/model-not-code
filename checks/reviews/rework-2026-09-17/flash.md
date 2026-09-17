### Publication Judgment

* **Chapter 6: Pass (Ready to publish).** The revision completely resolves the agent read’s findings. The injection demonstration now exhibits end-to-end causal integrity: the search returns top-3 chunks, the edited kettle chunk lands at rank 2, the scripted reading rule parses `assistant :` to request `apply_coupon`, the dispatch loop refuses the unconfirmed write, and the scripted writer emits the false price. The clean control confirms baseline behavior. T1 feedback now appropriately balances dual-stage diagnosis (retrieval miss plus unsupported attribution) while reinforcing evidence-based reasoning over intuition.
* **Chapter 8: Conditional Pass.** The structural improvements—adding a held-out set, the exact-lookup comparator, and conditioning the economic ledger on unseen paraphrase rates—are methodologically sound, and the rerun arithmetic reconciles byte-for-byte with the prose. However, publication is blocked on three editorial/technical text corrections: an erroneous explanation of the keyword rule's MRR, a stale table reference, and an overclaimed vocabulary constraint.

---

### Focus Area Review

* **Focus 1 (Chapter 6 Injection & Scripting): No substantive issue.** The trace now executes what the prose claims. Presenting the reading rule as a visible mechanism path rather than an empirical susceptibility rate is candid, pedagogical, and clearly stated in both prose and docstrings.
* **Focus 2 (Chapter 6 T1 Feedback): No substantive issue.** The T1 discussion is fair. It accepts naming both stages (retrieval boundary and writer attribution), distinguishes observed trace evidence from what requires a controlled rerun, prioritizes retrieval as the primary fix, and explicitly rejects "sounds made up" guesses.
* **Focus 3 (Chapter 8 Test Fairness & Numbers): Substantive issues found.** The lookup baseline is an exemplary, realistic software engineering comparator (lookup with rule fallback). The ledger’s scenario labeling is scrupulously conditioned on held-out rates. All printed numbers in prose match `run.log` exactly. However, the claim that held-out queries consist *only* of click-log words is factually inaccurate (see Finding 3).
* **Focus 4 (Chapter 8 Claims & Arithmetic): Substantive issues found.** Arithmetic across the ledger, golden set, held-out set, and both "things to try" is 100% verified; old numbers (3,752, 1,875, etc.) are purged. However, two claims lack support: line 58 misattributes the keyword rule's MRR to a "wrong product" match (see Finding 1), and line 61 retains an unedited reference to "the second table" (see Finding 2).
* **Focus 5 (Reader Burden): No substantive issue.** Expanding Chapter 6's search to top-3 aligns the loop fixture with the reader's three-chunk debugging scenario. Chapter 8's held-out set and lookup dictionary require minimal code (~10 lines) and directly reinforce the book's core theme: disciplined model skepticism.

---

### Ranked Actionable Findings

#### 1. Inverted explanation of keyword rule MRR
* **Location:** `chapters/did-the-shop-need-a-model.md:58`
* **Evidence:** Prose states: *"The rule's 0.083 is one lucky stopword, `the` in `clock for the wrist` matching a chunk of the wrong product at a low rank."*
* **Why it matters:** In `score()`, `rank` is computed *only* when `owner[j] == prod and line in chunks[j]`. A chunk from a wrong product yields `rank = None` and $0.0$ reciprocal rank. For $n=6$, an MRR of $0.083$ ($1/12 \approx 0.0833$) corresponds to reciprocal rank $1/2$. The rule placed the **correct** product's chunk (`leather watch tell the time...`, which contains *the*) at rank 2, behind another chunk that also contained *the*. Claiming it matched a "wrong product" contradicts the code's scoring definition.
* **Minimal fix:** Change to: *"The rule's 0.083 is one lucky stopword, `the` in `clock for the wrist` matching the watch's chunk at rank 2, pushed down by another chunk that also contained `the`."*

#### 2. Stale reference to "the second table"
* **Location:** `chapters/did-the-shop-need-a-model.md:60–61`
* **Evidence:** Prose states: *"The encoder's value is exactly the share of queries that look like the second table, and that share has to be measured, not assumed."*
* **Why it matters:** In the revised layout, the second table is the click-log table, where the lookup baseline dominates the encoder ($6/6$ vs $4/6$). The encoder provides economic advantage only on novel queries like the **third** table (the held-out paraphrases). This sentence is an unedited artifact from the prior two-table draft.
* **Minimal fix:** Change *"the second table"* to *"the third table"* (or *"the held-out table"*).

#### 3. Overclaimed vocabulary constraint for held-out queries
* **Location:** `chapters/did-the-shop-need-a-model.md:50, 149, 229, 268`
* **Evidence:** Prose and comments assert `HELD_OUT` queries are *"built only from words the click log taught"*. However, `HELD_OUT` includes *"maker of hot drink"* (`of`), *"room to brighten"* (`to`), and *"vegetables to slice"* (`to`). Neither `of` nor `to` appears in `PARAPHRASED`. `of` is entirely out-of-vocabulary (`<unk>`), and `to` originates from the catalogue/golden set (`carry books to school`).
* **Why it matters:** Readers tracing token vocabularies will observe that half the held-out queries rely on tokens never present in the click log, contradicting the explicit claim of strict vocabulary containment.
* **Minimal fix:** Rephrase prose/comments from *"built only from words the click log taught"* to *"built from click-log keywords with common connectors"* (or acknowledge that connector words like `of` map to `<unk>` / general vocabulary).

#### 4. Brittle query reconstruction in display helper
* **Location:** `chapters/build-the-assistant.md:313`
* **Evidence:** `show()` retrieves chunks via `search(question.rstrip("?"))["results"]` rather than inspecting what `run()` received in `messages`.
* **Why it matters:** Case B's scripted query happens to match `question.rstrip("?")`, but re-executing search couples the display helper to the question string rather than the writer's actual query. If `retrieved=True` were used on Case A, it would display chunks for the customer question rather than the writer's search query (`boil water fast`).
* **Minimal fix:** (Non-blocking editorial note) Capture and inspect the retrieved chunk list directly from `messages` in `show()`, or leave as-is since `retrieved=True` is scoped only to Case B.
