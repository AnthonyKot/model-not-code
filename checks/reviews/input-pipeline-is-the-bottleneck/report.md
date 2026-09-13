## Confirmed findings

1. **Category:** Arithmetic / mechanism boundary  
   **Severity:** Medium  
   **Offending text:** “Over n steps the total is `n × max(L, C) + min(L, C)`” versus “Epoch (157 steps)” values `40.2 s`, `20.1 s`, and `12.6 s`.  
   **What is wrong:** The table multiplies the steady-state step time by 157 but labels the result as the epoch duration, omitting startup and drain costs immediately after presenting a formula that includes them. Receipt `pipe-07` repeats that omission. Reviewer A correctly identified the one-worker inconsistency, but its multi-worker correction is not valid because whole-batch workers finish in bursts.  
   **Verified evidence:** `CONTEXT.md` §3 and §5 require recomputable worked arithmetic. For one worker, `157 × 256 + 80 = 40,272 ms = 40.3 s`, not `40.2 s`. Under the described whole-batch schedule, my exact recurrence gives `20.304 s → 20.3 s` for two workers and `12.816 s → 12.8 s` for four or eight workers; sequential remains `52.752 s → 52.8 s`. Lecture `03-11-tensorflow-datasets.txt` illustrates overlap but supplies none of these epoch figures; they are the book’s own arithmetic.  
   **Concrete fix:** Relabel the column “Steady-state estimate (`157 × step`; startup/drain excluded)” and explicitly contrast it with elapsed epoch time. If exact epoch totals are wanted, define the multi-worker startup schedule and recompute them from that schedule.

2. **Category:** Undated framework/API claims  
   **Severity:** Medium  
   **Independent agreement:** Reviewers A and B found the same problem.  
   **Offending text:** “With the default of 0…”, “2 × W by default”, “`pin_memory=True` adds a thread…”, and “`persistent_workers=True` keeps the processes alive”.  
   **What is wrong:** Version-specific PyTorch defaults and implementation details are presented as timeless. The later exercise label and source credit mention PyTorch 2.14, but they do not clearly bound this section; the catalog caution is also undated.  
   **Verified evidence:** `CONTEXT.md` §4 requires framework details to be dated where they matter; §8 specifically requires API currency in the catalog caution. Receipts `pipe-12`–`pipe-14` bind the claims to PyTorch 2.14.0 as inspected on 2026-09-13, while `site/catalog.mjs` has no corresponding bound.  
   **Concrete fix:** Begin the section with “As of PyTorch 2.14…” and add that version to the catalog caution.

3. **Category:** Incomplete source register  
   **Severity:** Low  
   **Offending text:** The source credit names “the PyTorch 2.14 `torch.utils.data` source”, but the catalog lists only the course and two books.  
   **What is wrong:** A public document used for implementation claims is registered in receipts but absent from `sources[]`.  
   **Verified evidence:** `CONTEXT.md` §5 requires sources to appear in both the catalog and receipts. Receipts `pipe-12`–`pipe-14` cite the PyTorch v2.14.0 `dataloader.py`; `site/catalog.mjs` does not include it.  
   **Concrete fix:** Add the versioned PyTorch source to this essay’s `sources[]`.

4. **Category:** Anthropomorphism hiding the mechanism  
   **Severity:** Low  
   **Independent agreement:** Reviewers A and B found the same sentence.  
   **Offending text:** “The depth decides how large a burst of slow batches is absorbed before the loop feels it.”  
   **What is wrong:** “Feels it” suppresses the actual event: the result queue empties and the training loop blocks. Reviewer B’s reference to a *full* queue is mechanically wrong; a full queue blocks producers, not the consumer.  
   **Verified evidence:** `CONTEXT.md` §4 prohibits anthropomorphism that hides the mechanism; the consistency check also flags `decides`.  
   **Concrete fix:** “The queue depth determines how many slow batches can be absorbed before the result queue empties and the training loop blocks.”

## Rejected findings

- Reviewer A’s proposed two-worker correction of `20.2 s` does not survive recomputation: substituting `L/W` into the single-producer boundary formula ignores bursty whole-batch worker completion; the described schedule gives `20.3 s`.
- Reviewer A’s assertion that the omitted boundary cost is always below `0.2%` does not survive: it is about `0.20%` for one worker, `1.0%` for two, and `2.0%` for four or eight under the described schedule.
- No reviewer finding is rejected in full; the remaining diagnoses survive with the corrections above.

## Publication judgment

Not publishable as-is. The single most important change is to reconcile the “Epoch” column with the essay’s finite-run scheduling model—either label those numbers explicitly as steady-state estimates or define and compute actual startup-to-finish epoch durations.
