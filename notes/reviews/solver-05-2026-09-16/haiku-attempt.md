# Attempt: "Your call: the same release in another quarter"

## Reading Process
- Single pass through chapter and exercise table
- Used tables from weeks 1-5 and 6-10, plus audit math from chapter section "Fewer blades listed, or more blades missed?"
- Key sections: the cost formula (lines 261-262), audit estimate formula (line 65), threshold discussion (line 151-152)
- Time: ~15 minutes

## Analysis

### Question 1: Has quality changed enough to justify action?

**Yes, quality has degraded significantly.**

**Evidence:**
- Weeks 1-5: 206 confirmed blades (average 41.2/week), precision 0.30 average
- Weeks 6-10: 77 confirmed blades (average 15.4/week), precision 0.14 average
- **Drop: 62% fewer confirmed blades, precision halved**

**Using audit to estimate missed blades:**
- Weeks 1-5: 6 blades found in 403 audited; 4,287 unflagged
  - Miss rate: 6/403 = 0.0149
  - Estimated missed: (6/403) × 4,287 = 63.8
  - Estimated recall: 206 / (206 + 63.8) = 0.763

- Weeks 6-10: 3 blades found in 420 audited; 4,414 unflagged
  - Miss rate: 3/420 = 0.0071
  - Estimated missed: (3/420) × 4,414 = 31.5
  - Estimated recall: 77 / (77 + 31.5) = 0.710
  
**The audit miss rate dropped by 52%, but confirmed blades dropped by 62%, which means the model is flagging fewer true blades overall—likely due to a product change (elevated alarm share at weeks 3 and 6+ suggests photos have changed, similar to the folding knife problem in the chapter).**

**Cost comparison:**
- Weeks 1-5: cost = 2(507 false flags) + 20(63.8 missed) = 1,014 + 1,276 = 2,290 per 5,000 = 458 per 1,000
- Weeks 6-10: cost = 2(509 false flags) + 20(31.5 missed) = 1,018 + 630 = 1,648 per 5,000 = 330 per 1,000

Cost appears lower, but this masks the degradation: the model is catching only 37% of flagged true blades in weeks 6-10 vs 29% in weeks 1-5. **The model's discriminative quality has degraded.**

### Question 2: What would I do next week?

**Keep the live model and gather evidence** (do not lower threshold, do not retrain yet).

- The alarm is working (elevated share in weeks 3 and 6+ signals photo change, matching the chapter's guidance: "an alarm says the photos are different")
- Increase audit rate from 10% to 15-20% of unflagged listings for 2-3 weeks to quickly measure recall on the new photo distribution
- Calculate how many true blades exist at score 0.02-0.05 threshold to understand threshold-lowering cost

**Why not lower threshold immediately:** The chapter explicitly showed (line 151-152) that lowering threshold when the model has never seen a product type increases cost (from 718 to 770 per 1,000). The 37 audited listings between 0.02-0.05 in weeks 6-10 had 1 blade out of 37 (2.7% rate). If ~426 listings fall in that band weekly (from "Extra flags at 0.02"), lowering catches ~11 more blades but flags ~415 new false positives, costing 2(415) - 20(11) = 830 - 220 = 610 extra per 5,000 = 122 extra per 1,000. Cost would worsen.

### Question 3: Option rejected—why?

**Rejected: Immediate retraining**

Rationale: The chapter's Part 4 demonstrated that retraining on the live model's flags learns its mistakes (the feedback loop). The candidate model in the chapter caught fewer folding knives (10 vs 14) due to being trained on the live model's false negatives. Without new labels for what changed in the photos (the new product or seasonal shift), retraining would entrench the current model's blind spot. The gate requires both margin (cost) and floor (recall), and the chapter showed the floor is unmet when trained on feedback alone. Only retrain after targeted audit or review of the changed photo type.

### Question 4: What would change my mind in two weeks?

- **If audit rate increases and shows true recall dropping below 0.68:** This would breach chapter 2's release promise (recall 0.684) decisively and trigger retraining with targeted labels for the new photo type.
- **If alarm share returns to ~0.005:** This would mean photo change reversed and degradation was temporary; revert to current model.
- **If precision recovers to 0.25+ despite low confirmed blade counts:** This would suggest fewer blades are being listed, not that the model is worse; continue monitoring without action.
- **If two weeks of increased audit (say 20%) finds 20+ additional blades not originally flagged:** This confirms systematic misses and justifies threshold change or retraining with new labels.

## Sections Actually Used
- Audit math (chapter section "Fewer blades listed, or more blades missed?" and formula line 65)
- Cost formula (line 261-262)
- Threshold guidance (line 151-152: "Moving the threshold is the cheapest response and it does not help here.")
- Feedback loop warning (section "Retraining learns the shop's labels, including the wrong ones")
- Gate logic (section "The candidate must beat the live model")

## Did anything shortcut the reasoning?
No. The exercise required:
1. Computing audit-based recall estimates for both periods (not given, required chapter formula)
2. Calculating costs to evaluate threshold-lowering (not stated, requires arithmetic from chapter prices)
3. Distinguishing between "fewer blades listed" vs "more blades missed" using the audit logic (core reasoning, not automated)

The algebra was straightforward but not bypassed by table headers or output.

---

## Hints opened?
Yes. Hint confirmed the approach: use audit logic to estimate missed blades and compare extra review cost with blade recovery from the 37 audited listings between score bands. Hints did not change my answer significantly.

## Discussion opened?
Yes. **Significant correction found.**

### What the discussion says vs. my answer:

**Key finding: The audit data supports the FIRST explanation (fewer blades listed), not the second.**

Using Poisson probabilities:
- If fewer were listed & recall unchanged: expect 2.34 audited blades in weeks 6-10; actual 3 has prob 0.414 ✓ (plausible)
- If as many were listed, rest missed: expect 18.35 audited blades; actual 3 has prob ~0.00001 ✗ (implausible)

**My error:** I concluded "the model's discriminative quality has degraded." This was wrong. The data actually says: **sellers are listing fewer blades starting week 6 (fell from ~53 to ~23 per week), and the model catches them about as well as before (true recall 0.52–0.77 in weeks 6-10 vs 0.78-0.82 in weeks 1-5 noise range).**

**Corrected analysis:**
- Precision dropping from 0.30 to 0.14 is NOT a sign of model degradation; it reflects fewer true blades being listed, not more false flags
- The alarm is not causally related to the week-6 drop: it rose at week 3 with the banner, but confirmed blades stayed stable through week 5
- The confirmed blade count drop is explained by **seller behavior change**, not model failure

### What should I actually recommend (correction):

**Q2 correction:** Keep the live model and threshold. **Also check seller blade listings independently** (via category owner data) to confirm fewer are being listed. Do NOT increase audit—the current 10% rate is what separated the two explanations. Cutting it would remove the measurement of misses.

### My wrong recommendation from attempt:
- "Increase audit rate from 10% to 15-20%"—WRONG. The discussion says keep at 10% because that's the measurement that works.
- "Model is catching fewer of the true blades"—WRONG. The model's recall per blade is stable; sellers listed fewer blades.

### Decisions I got right:
- Do not lower threshold to 0.02 (correct calculation: 852 cost for ~230 benefit is bad trade)
- Do not retrain immediately (correct reasoning: unclear what to retrain on)
- Keep the model and gather evidence (correct)

### Decisions I missed:
- Query seller/category data independently to confirm blade listings actually fell (provides evidence orthogonal to the model)

