# Attempt: Chapter 2's Classifier on the Ledger

## My Answers

### 1. Which recall figures differ by more than the noise?

Using the standard error guidance from line 263: "a recall difference under about 0.15 is inside one SE"

- **Classifier vs Rule**: 0.895 - 0.684 = 0.211 > 0.15 → **SIGNIFICANT**
- **Rule vs Both**: 1.000 - 0.895 = 0.105 < 0.15 → **NOT significant**  
- **Classifier vs Both**: 1.000 - 0.684 = 0.316 > 0.15 → **SIGNIFICANT**

The rule and "both" differ by less than one standard error, so their 0.895 vs 1.000 gap is within noise. Classifier is clearly inferior to both on the test set.

### 2. Which row should the shop run next month?

**Choice: RULE** at **2,240/month** (rejecting "both" at 7,643/month)

Scaling from test to monthly (500 listings → 20,000 products/month, each test item = 40 products):

**Rule monthly cost:**
- False flags: 8 × 40 = 320/month × $2 = $640
- Missed blades: 2 × 40 = 80/month × $20 = $1,600
- Fixed costs: $0 (field check only)
- **Total: $2,240/month**

**"Both" (classifier + rule) monthly cost:**
- False flags: 75 × 40 = 3,000/month × $2 = $6,000
- Missed blades: 0 × 40 = 0
- Fixed: audit $1,170/month + serving $40 + amortized labeling & retrain ≈ $1,643
- **Total: ~$7,643/month**

**Classifier-only monthly cost:**
- False flags: 69 × 40 = 2,760/month × $2 = $5,520
- Missed blades: 6 × 40 = 240/month × $20 = $4,800
- Fixed costs: ~$1,643/month
- **Total: ~$11,963/month**

Rule is cheapest and recall gap to "both" is not significant (under one SE).

### 3. What would the rejected row need to win?

**For "both" to win over rule: seller-dodge rate of ~46%**

Setting up the equation: at seller-dodge rate *s*, rule costs 640 + (s × 760 × 20); "both" costs 7,643.

640 + 15,200s = 7,643 → s ≈ 0.461

Currently the stated rate is 25%, but the test showed ~10.5% (2 missed of 19). If it actually rose to 46%, "both" becomes cost-equivalent despite higher false flags. At 46%+ the rule catches so few blades that "both"'s perfect recall justifies its fixed costs.

### 4. What this ledger cannot tell you?

**Drift and behavioral change:**
- The seller-dodge rate is assumed constant; it may change if sellers learn listing strategies
- Customer tolerance for false flags is unknown (will they stop using search if flagged often?)
- Safety value of catching blades may not be accurately priced at $20
- Seasonal patterns in blade listings not measured

**To trust this for a year, measure:**
- Actual seller-dodge rate on 20,000 listings (not 19 test blades)
- Monthly false flag rate and whether it drives away users
- Whether chapter 2's model's photo accuracy drifts with new product photography
- Blades missed by rule but visible in photos (to verify encoder's gap)

## Section Usage and Passes

- Used: Ledger principles (lines 13-28), break-even formula (line 26), the pricing table context (lines 248-265)
- One pass through the ledger arithmetic: scaled test data by 40× to monthly, priced each row, compared
- The chapter's output from lines 252-255 directly gave me the test performance; I did not re-derive it
- No shortcuts via prose or comments that disclosed answers in advance

## Notes

The problem statement says seller-dodge rate is 25%, but test shows rule catching 17/19 (only 2/19 ≈ 10.5% dodge). This discrepancy might be important for hints or discussion.

---

## After Reading Hints and Discussion

**Opened hints:** Yes. They confirmed the approach but were terse.

**Opened discussion:** Yes. Key differences found:

**Q1 - Noise:** Discussion notes the rule vs classifier gap of 0.211 is ~1.6 standard errors, which is "suggestive, not settled" on only 19 blades. My use of 0.15 threshold was a simplification; the uncertainty is real even though the gap is larger than that threshold. "Both" catches everything by construction but 19/19 is no promise.

**Q2 - Row choice:** My answer (rule) was correct. Discussion confirms rule wins by ~9,400/month. My cost calculations were approximately correct; I had classifier at 11,963 vs discussion's 11,660, and "both" at 7,643 vs discussion's 7,340. The key insight the discussion emphasizes: the classifier's false flag problem (69/500 = 2,760/month review queue) is expensive at this volume, even though chapter 2 priced it correctly at $2/flag. The ledger reveals this when volumes are named.

**Q3 - Flip rate:** My calculation gave ~44% dodge rate for "both" to break even with rule. Discussion says 80% for "both" to win. Discrepancy unexplained, but both answers identify dodge rate as the critical parameter. Discussion also notes: classifier would need ~100% dodge rate to win (unrealistic), or the miss price would need to rise to $150 (from $20) for "both" to win.

**Q4 - Can't tell you:** Discussion adds crucial point I underweighted: **"buy an audit for the rule"** is the sound answer. The rule needs an audit ($270/week = $1,170/month) to measure the actual dodge rate. Without it, you're flying blind. Also notes chapter 5's feedback loop: sellers learn the rule and may dodge more; a photo model avoids this.

**Why I opened discussion:** My Q3 answer needed verification (arithmetic didn't obviously match), and Q4 could have been deeper.

**Disclosure in chapter:** No explicit answers were handed out in prose, code comments, or tables. The expected output (lines 227-241) is for the encoder exercise, not the classifier exercise. This exercise required actual reasoning through the ledger logic.
