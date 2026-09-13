## Confirmed findings

1. **Category:** Result attribution / mechanism  
   **Severity:** Medium  
   **Offending text:** “The same run took the old task from 99.4% to 53.4%.”  
   **What is wrong:** The nearest named run is the thaw, but 53.4% belongs to option A. This can invert the lesson: the thaw retained 96.7% old-task accuracy.  
   **Evidence:** `thaw-24` and [run.log](/home/diablo/book20/corpus/transfer-learning-freeze-then-thaw/run.log) give option A as 0.994 → 0.534; `thaw-25` gives the thaw as 0.967.  
   **Fix:** “Letting the buffers follow the new data—option A—took the old task from 99.4% to 53.4%.”

2. **Category:** Source register  
   **Severity:** Medium  
   **Offending text:** The source credit names the PyTorch `BatchNorm1d`, `LayerNorm`, and `Module` documentation and Keras `BatchNormalization` documentation.  
   **What is wrong:** These sources appear in receipts but not in the catalog’s `sources[]`. CONTEXT.md §5 requires sources to appear in both places.  
   **Evidence:** Receipts `thaw-09`–`thaw-11`, `thaw-15`, `thaw-16`, `thaw-18`, and `thaw-23` cite those documentation URLs; [catalog.mjs](/home/diablo/book20/site/catalog.mjs:99) lists only the course and two books.  
   **Fix:** Add all four documentation URLs to the catalog entry as public-document sources.

3. **Category:** Framework currency  
   **Severity:** Low  
   **Offending text:** “10−5 by default in PyTorch”; “momentum, 0.1 by default”; “Keras…default 0.99.”  
   **What is wrong:** Reviewer A and Reviewer B independently identified this risk. The essay’s source line already bounds the documentation “as of 2026-09-13,” so Reviewer B’s demand to date every prose occurrence is excessive. However, CONTEXT.md §8 specifically requires product/API currency to be bounded in the catalog’s `caution` field, which currently mentions only domain shift.  
   **Evidence:** Receipts `thaw-09`–`thaw-11` and `thaw-18` record PyTorch 2.14.0+cpu and the 2026-09-13 inspection date; [catalog.mjs](/home/diablo/book20/site/catalog.mjs:104) omits it.  
   **Fix:** Add “PyTorch and Keras defaults and behaviours as of 2026-09-13 (PyTorch 2.14)” to `caution`.

4. **Category:** Anthropomorphism  
   **Severity:** Low  
   **Offending text:** “Once the head is sensible”  
   **What is wrong:** Both reviewers independently flagged this. “Sensible” assigns a human quality and substitutes for the actual stage transition. That conflicts with CONTEXT.md §4.  
   **Evidence:** Receipt `thaw-05` supports only “after the head has trained,” not a claim about sensibility or gradient stabilization.  
   **Fix:** “After the head-only training stage, thaw the backbone…”

## Rejected findings

- **“51.9%, close to guessing” lacks a balanced-binary premise:** Rejected. The exercise explicitly uses `nn.Linear(8, 2)`, and `target_batch()` thresholds a symmetric normal sum at its mean, giving a 50/50 population split; 51.9% is therefore close to random binary guessing.
- **Layer normalisation requires an explanation of its normalization axis:** Rejected. The essay’s mechanism is BatchNorm buffer drift; the relevant contrast—LayerNorm has no buffers—is stated, demonstrated by `named_buffers()`, and receipted in `thaw-15`. The axis explanation would be enrichment, not a missing mechanism step.

## Publication judgment

Not publishable as-is. The most important change is to name option A explicitly as the run that caused the 99.4% → 53.4% collapse, preventing readers from attributing it to the thaw.
