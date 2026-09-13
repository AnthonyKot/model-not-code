**Drafted by:** Claude Opus 5 (main session), 2026-09-13, from scratch

# Chapter 3 — Reuse a Pretrained Model

- Plan: CHAPTER-PLAN rev 2 chapter 3. Freeze/thaw on the photo classifier (new supplier's garden range,
  shifted features); the BatchNorm buffer trap with three freezes; thaw with parameter groups; then the
  shop's answer writer: memory of a full fine-tune, LoRA on chapter 1's q/k/v/o projections, alpha/r
  stated precisely as a size-holding division like sqrt(d_k), not a temperature; Llama 3.2 3B adapter
  count; QLoRA pointer to ch 7; limits (rank ceiling; an attached adapter does not protect old behaviour,
  only the base file); a choosing table.
- Length: file ~36k chars; prose without code ≈ 22k (≈ 20k without tables). Figures: LoRA two-path diagram.
- New worked numbers: BatchNorm unit (mean 1.0, sd 0.6, input 1.6) checked against torch BatchNorm1d;
  rank-1 diff A = [2, -1, 0, 1], B = [1, 0, 3, -1]^T; memory table 12/12/12/12 = 48 GB. Reported model
  facts (13 GB, 3072/1024 widths, 73.4 MB, 2.2 GB, 33% -> 72.2%, 320 images < 50% vs 71.3%) re-receipted.
- Exercise: freezes, thaw, LoRA r=1 and r=4, unplug, merge, full fine-tune; deterministic (run twice);
  variations run (thaw at head's rate; q,v only). Honest findings kept: in this run moving BN statistics
  did NOT help the new task (differs from the archived essay's run); the attached adapter hurt the old
  text more than the full fine-tune did.
- Checks: 23 receipts passed, 3 unchecked (paper); paraphrase 0/0.
- Not done: review lanes; the author's read.
