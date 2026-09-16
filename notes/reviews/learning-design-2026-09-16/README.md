# Learning-design review of chapters 1–4

Date: 2026-09-16. Requested by the author after adopting Book21-inspired review guidance.
Reviewer: Codex, this session. Method: `notes/chapters/REVIEW-GUIDE.md` and the
`audit-learning-ux` skill, applied to the five requested criteria. No external reviewer or blind
solver was commissioned. Chapters, exercises, site code and previous review reports were not edited.

## Reports and priorities

| Chapter | What to preserve | Most useful improvement |
|---|---|---|
| [1. Search the Catalogue](01-search-the-catalogue.md) | Connected retrieval/generation demonstration and distinct failure paths | A short changed-case diagnosis with an evidence rubric; readable mobile map |
| [2. Trust the Number](02-trust-the-number.md) | Clear release question, cost trade-offs and evaluation discipline | First reconcile the listing-level release record with the photo-level mission; then a bounded release decision |
| [3. Reuse a Pretrained Model](03-reuse-a-pretrained-model.md) | Buffer controls, adapter restoration and explicit limits | A constrained adaptation choice that requires evaluating old and new behaviour |
| [4. Train From Reward](04-train-from-reward.md) | Shared PPO loss, reward counterexample and seed exceptions | Judge a changed run from independent evidence; clarify model versus reader and toy evaluation scope |

Every report covers: independent decisions versus guided execution; combined answer disclosure;
fair assessment and alternatives; focus and workload; and limits of model-based learning evidence.
Reports include observations, reader consequences, minimal proposals and verification criteria.

**Highest-priority confirmed defect:** chapter 2 promises that the mission prints the release
record's numbers but uses a different decision unit. The listing figures do have supporting authoring
evidence; the problem is the learner-facing reproduction path, not fabricated numbers.

**Shared design gap:** the existing missions are complete guided demonstrations with supplied
outcomes. They fulfill much of the original contract. The absence of an independent decision is
an improvement target under the new guidance, not evidence that the demonstrations fail to teach.
Showing guided answers is appropriate. It becomes assessment leakage when those same cases are
reused as supposedly independent work.

**Shared evidence boundary:** the rendered call to action says “Check your understanding” and asks
readers to compare output. Completion can be marked without submitting an answer. This is a
self-report, not a mastery claim or automated correctness check. If adding independent work,
describe what the reader should be able to justify and provide a rubric, without implying that
the button verifies it. The About page already disclaims demonstrated learning.

## Evidence and coverage

- Baseline commit: `fddbd814ae09a05cd878bb2c6751b6d1bb7ce3b1`, with the previous turn's guidance
  changes still uncommitted. The existing untracked `review.md` and historical review artifacts
  were preserved. Source hashes are in [source-evidence.json](source-evidence.json).
- Read all four current chapter manuscripts including their complete mission code, expected output
  and variations. Inspected the chapter plan, authoring guidance, `review.md`, relevant chapter 2
  revision notes, site generation and completion code, and the About page.
- Compared each embedded mission script with its `workspace/<slug>/exercise.py`: all four match.
  Compared each expected output block with `corpus/<slug>/run.log`: all four occur exactly in the
  stored log. Embedded mission code and expected output also match the inspected generated HTML.
  These are comparisons with existing execution evidence, **not new training runs**.
- Inspected chapter 2's separate listing script and variation log, and chapter 4's variation/seed
  log. Did not re-execute all variations or independently verify every source receipt or numerical
  claim. This is a learning-design review, not a replacement for the technical review lanes.
- Exercised the local generated site with Chromium headless at 1440px and 390px widths. For each
  chapter: entered from its shelf card, inspected the mission and disclosures, used the completion
  button with keyboard Enter, reloaded and returned to the shelf. All eight paths reached the
  correct chapter; each had one mission and no page-wide horizontal overflow. Completion persisted
  and the shelf reported “EXERCISE DONE.” [DOM results](browser-evidence.json).
- The only `details` disclosure on each inspected chapter was “Sources and limits,” outside the
  mission; there was no independent-task hint/answer gate. That is not itself a defect for guided work.
- Captured mission screenshots for all eight browser paths locally. Retained and visually inspected
  the [chapter 1 mobile diagram](search-mobile-diagram.png) and
  [chapter 4 mobile mission opening](reward-mobile-mission.png). Other diagram readability was not
  individually rated from screenshots; no global accessibility claim follows from this check.
- The first browser launch was blocked by the sandbox's localhost restriction; the approved retry
  used the installed headless shell after correcting an obsolete browser path. Those were review
  environment issues, not chapter defects. The existing `site/visual-check.mjs` contains unrelated
  legacy routes, so this review used a focused temporary browser script rather than claiming that
  legacy suite validated these chapters.
- No production deployment, human learner trial, assistive-technology audit, fresh-model solver,
  retention measurement or measured study time. Proposed gains in focus and workload remain
  editorial hypotheses until tried with the author/reader. Chapters 5–8 have no current manuscripts
  and are outside this review.

Local verification: `node site/check.mjs` passed for 19 generated pages; report links resolve;
`git diff --check` passed; all four chapter hashes are unchanged.

## How to use these reports

Fix the chapter 2 reproduction promise first. For learning-design revision, pilot one bounded
changed case in chapter 1, then use the author's attempt and feedback to calibrate the approach.
Keep one mission and the guided CPU examples. Vary the decision across chapters rather than
imposing a release-review lab everywhere. The reports deliberately specify task shape and criteria,
not finished independent cases or answer keys.

Reading a report does not mean its editorial proposals have been accepted. Preserve source receipts,
existing run evidence and review history; record decisions separately when revisions are authorized.
