# Sources (local only)

Everything in this directory except this README and `MANIFEST.tsv` is ignored by Git.

- `udemy-subs/` → symlink to `~/udemy-subs/`, the caption transcripts of seven Udemy courses the
  author is enrolled in, one folder per course id, one `NN-NN-<slug>.txt` per lecture (plus the
  verbatim `.vtt`; the Arabic course also has machine-translated `.en.txt`). Fetched 2026-09-12
  with `~/udemy-subs/fetch_subs.py`. Six videos in course 4735368 (2.3, 8.2, 8.4, 16.1, 22.4,
  29.3) and two in 3725442 (9.9, 11.10) carry no captions on Udemy and have no file.
- `books/` → symlink to the author's library on the Windows side (Telegram Desktop downloads).
- `MANIFEST.tsv` — committed: `key  kind  filename  size_mb  pages  edition_note` for every book
  and paper an essay may cite. Keys are the ones used in `site/catalog.mjs` and receipts.

Licensed material. Nothing here is reproduced in the book beyond a phrase; see `CONTEXT.md §5b`.
