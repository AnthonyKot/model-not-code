# input-pipeline-is-the-bottleneck — essay note

**Drafted by:** Claude Opus 5, subagent (2026-09-13). Review lanes: Gemini 3.8 flash and Gemini 3.1 pro via agy; consolidation and one reader persona: codex gpt-5.6-sol (when not rate-limited).

**Pitch:** A (a training step is max(producer, consumer) once they overlap), picked by the author
2026-09-13. **Drafted:** 2026-09-13 by a subagent, receipts first. Status: drafted, not reviewed.

**Sources actually used:**
- course-4735368 (Deep Learning Masterclass with TensorFlow 2): 03-11 (prefetch as overlapping
  load with train; the load/train block sketch ending at about two thirds of sequential time; memory
  cost of the buffer), 11-04 (only the parallel-calls map on the training set), 11-05 (small files
  versus large records; storing preprocessed/augmented data once). 10-04 dropped (hyperparameter
  tuning), as the catalog comment says.
- geron-pytorch physical p. 367 (printed 337, ch. 10): pin_memory / non_blocking, num_workers,
  prefetch_factor, worker overhead, persistent_workers.
- dist-ml-patterns physical p. 29 (printed 8, work-queue pattern) and pp. 59–60 (printed 38–39,
  caching pattern with preprocessing).
- PyTorch 2.14.0+cpu `torch/utils/data/dataloader.py` and `_utils/fetch.py`, read from the
  installed package 2026-09-13 (prefetch_factor docstring and default, round-robin index dispatch,
  cap of prefetch_factor × num_workers outstanding tasks, in-order return, pin-memory thread,
  warning when pin_memory has no accelerator). Receipts cite the v2.14.0 GitHub path.
- Python `multiprocessing` docs (start methods, safe importing of main) for the `__main__` guard.
Page dumps in `workspace/input-pipeline-is-the-bottleneck/pages/`; lecture notes in `lectures.md`.

**Word count:** 2,574 in the file; 1,798 prose by the pilot's method (code blocks, tables, figure
and source line excluded); 1,728 with headings and the three formula lines also excluded.

**Numbers and provenance.**
- Formulas L + C, max(L, C), max(L/W, C), total n·max + min: the book's derivation (pipe-02, 04),
  checked on hand timelines (L=2,C=1: 9 vs 7; L=C=1: 6 vs 4, which reproduces 03-11's "about two
  thirds" sketch; pipe-01).
- Small example L=2, C=1, three steps: 9 / 7 units, steps end 3, 5, 7; two workers → 1 unit
  (pipe-05). Drawn in the SVG timeline.
- Worked table (pitch A, recomputed): L = 64 × 4 = 256 ms, C = 80 ms; 336 / 256 / 128 / 80 / 80 ms;
  busy 23.8% / 31.3% / 62.5% / 100% / 100%; 10,000/64 = 156.25 → 157 steps (156 × 64 = 9,984, short
  batch of 16 counted as full); epochs 52.752 → 52.8, 40.192 → 40.2, 20.096 → 20.1, 12.56 → 12.6 s
  (pipe-06, 07, 26). The pitch's 336/256/80 ms, 24%/31%, 52.8/40.2/12.6 s are all correct; the essay
  adds the two- and eight-worker rows.
- Faster card: C = 40 → 256 ms and 15.6%; sequential 296 ms (pipe-08, 25). Fourth worker the last
  useful one: 256/3 = 85.3 > 80 (pipe-24).
- Exercise: `corpus/input-pipeline-is-the-bottleneck/run.log` (pipe-15): measured L = 269, C = 80;
  forecast 349/269/134/80/80/80, measured 348/271/137/83/84/84 ms; wall 22.6 s. Two earlier runs
  gave L 270–274 and all measured values within 10 ms of forecast (sleep-based, stable).
  The opening's "about 31%" is the one-worker row of the invented example.

**Deviations from the pitch.**
- The pitch's exercise was a language-agnostic threads simulation; per the brief it is a real
  PyTorch `DataLoader` (`num_workers` 0/1/2/4/8, `prefetch_factor` 1 and 2), measuring L and C first
  and forecasting from the measured values rather than the nominal 256/80.
- Added: the one-off n·max + min term (the pitch's per-step view omits the warm-up edge); a
  two-worker row; the observation that prefetch_factor sets queue depth, not steady-state speed
  (run shows 83 vs 84 ms); an under-the-hood section on num_workers / prefetch_factor / pin_memory;
  a limits section (free cores, steady state and jitter, persistent_workers, storage throughput,
  caching deterministic preprocessing, tf.data as the same design without naming the course).
- pin_memory is shown only in an illustrative snippet (no accelerator; PyTorch 2.14 warns and does
  nothing when pinning without one — pipe-14).
- The pitch's shuffle-buffer correctness limit was not used (DataLoader's map-style shuffle permutes
  indices fully; it belongs to a tf.data-specific essay if anywhere).
- The core-count limit is not measured (sleep uses no CPU); the exercise suggests the CPU-work
  variation to the reader. pipe-20 is `inferred` from geron-pytorch p. 367.

**Suggested catalog fields.**
- Title: keep "Your GPU Is Waiting on Your JPEG Decoder".
- payoff: "Why a faster GPU often leaves training no faster, and how two timings of your own loop
  tell you what more data-loader workers, prefetching or a new card would actually buy."
- caution: "The forecast is for steady state and assumes a free CPU core per worker; storage
  throughput and variable decode times are outside it."
- mechanism line (optional update): "Once loading overlaps compute, a step costs max(load, compute),
  not their sum; parallel workers divide the load term."
- sources[]: C("4735368", "03-11", "11-04", "11-05"), B("geron-pytorch", "p. 367"),
  B("dist-ml-patterns", "pp. 29, 59–60"), plus the PyTorch `torch.utils.data` source (v2.14.0) if the
  catalog has a form for it. 11-04 is new to this entry; 10-04 stays dropped.

**Owed to other essays.** The storage-side fix (record files, shards) is pitch B's territory and is
one sentence here; caching a frozen backbone's outputs is pitch C / `transfer-learning-freeze-then-thaw`;
"a cached random augmentation stops being random" touches `augmentation-declares-invariance`.
