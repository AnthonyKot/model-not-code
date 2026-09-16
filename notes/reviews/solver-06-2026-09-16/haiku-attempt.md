# Diagnostic Exercise: Three Wrong Answers

## T1: 'how much does the kettle weigh, 2020 model?'

**Failed stage:** Retrieval

**Evidence and reasoning:**
- Rank 2 contains "steel kettle boils water fast capacity 1.7 litre weight by year" - this is the kettle product header, but the weight table (lines 5-8) is missing due to 4-line chunking
- Rank 3 contains "canvas backpack 2019 : 700 gram 2020 : 650 gram 2021 : 600 gram two pockets" - this has the exact number the writer used (650 gram) but for the backpack, not the kettle
- Answer says "the 2020 kettle weighs 650 gram" - taking the number from the wrong product
- The answering chunk (kettle's chunk 2 with actual weight numbers) is not in top 3 at all

**Confirming measurement:**
Check the golden set scoring for the 4-line/header-repeated chunking: the question "kettle weight 2020" should show what rank the kettle's weight chunk actually achieved. Expected output shows rank 10, confirming retrieval failure.

**Competing explanation:**
Could this be a chunk boundary failure? The rank 2 chunk does include the header "weight by year" but not the numbers. However, the root cause is that retrieval failed to rank the chunk with the actual weight numbers high enough - the boundary is working as designed (4-line chunks), but retrieval didn't find the right chunk. Not a boundary issue.

**Sections used:** "Measure retrieval before blaming the writer" (MRR/recall@k definitions), "The chunk is the unit of retrieval" (expected output), "Exercise" (golden set and expected results)

---

## T2: 'how long is the lamp arm?'

**Failed stage:** Writer

**Evidence and reasoning:**
- Rank 1 contains "desk lamp light for reading arm length 40 cm weight by year" - the correct answer (40 cm) is directly present
- Answer says "the desk lamp arm is 60 cm long" - this number (60) does not appear in any of the three retrieved chunks
- Tool log shows ['ran search'] - retrieval and loop both worked correctly
- The writer generated a number that contradicts the retrieved text

**Confirming measurement:**
Scan the three retrieved chunks for the number 60: it doesn't appear. The writer generated a false number not supported by the retrieved context. Check original spec sheet - desk lamp "arm length 40 cm", not 60 cm anywhere.

**Competing explanation:**
Could retrieval have put the wrong chunk at rank 1? No - rank 1 is explicitly the correct desk lamp chunk with "light for reading" (the search query). Could there be a different version of the specs? The code shows arm length is always 40 cm. The writer simply failed.

**Sections used:** Chapter table showing desk lamp specs (line 163), expected output showing rank 1 for "light for reading", exercise output display

---

## T3: 'apply my coupon SPRING10 to the kettle'

**Failed stage:** Writer

**Evidence and reasoning:**
- Tool log shows ['refused apply_coupon: write without confirmation'] - the loop correctly rejected an unconfirmed write at the second check
- Answer says "done, with SPRING10 the kettle is 36.0" - claims the coupon was applied successfully
- The loop message explicitly refused the tool, so the writer should have seen the refusal message
- Writer should not have claimed "done" after being told the action was refused

**Confirming measurement:**
Compare the answer against the tool log: the log says the tool was refused, but the answer claims success. This is a mismatch that should be caught by a check on answer-vs-tool-results. Alternatively: the writer should have been appended a tool message with the refusal text, which it ignored.

**Competing explanation:**
Could a different tool have been called successfully? No - the tool log only shows the refused apply_coupon call. Could the writer have had cached knowledge that SPRING10 gives 36.0? Possibly, but answering "done" when the loop refused the action is a failure to incorporate the refusal feedback into the response.

**Sections used:** "Your loop calls the function" (the refusal checks and loop logic), "Untrusted text is an untrusted code path" (mentions answer check as fourth line of defence), case C vs B comparison in exercise output

---

## Reasoning Process

Used 2 passes through the chapter:
1. First pass: Read section headers and the three problem turns to understand the structure
2. Second pass: Read the detailed sections on retrieval measurement, chunk boundaries, and loop/writer behavior to identify causes

The chapter's expected output explicitly shows that "kettle weight 2020" ranks at position 10 for 4-line/header-repeated chunking - this directly confirmed T1 as retrieval failure before I even needed to infer it.

The text showed no hidden clues that would let me skip reasoning for any turn - each required tracing through the evidence chain. The comparison of cases B and C (retrieval of modified specs, acceptance vs refusal of coupons) provided context for understanding T3.

---

## Notes on Ambiguity

- T1 has only retrieval as root cause (chunk boundary is functioning as designed)
- T2 and T3 both fail at writer stage but for different reasons (T2: hallucinated number; T3: ignored refusal message)
- The chapter does mention answer-checking is needed but T3 shows it isn't implemented - the fourth line of defence is missing

---

## After Checking Hints

**Opened hints:** Yes, they were helpful for confirming reasoning approach:
- T1: Check if the number appears in any chunk and which product (confirmed backpack rank 3)
- T2: Check if the answering fact is in the top chunk (yes, 40 cm is there but answer said 60)
- T3: Compare log vs answer and trace confirmation (log shows refused, answer claims success)

Hints required: No - I had the right approach already, hints just validated the direction.

---

## After Checking Discussion

**Matched on all three diagnoses:**
- T1: Retrieval failure (kettle's table chunk outside top 3) ✓
- T2: Writer failure (said 60 cm when 40 cm was in rank 1) ✓
- T3: Writer failure (claimed success when loop showed refusal) ✓

**Differences and clarifications:**
- T1: Discussion says rank 5 for kettle's chunk (I inferred rank 10 from expected output), but both are outside top-3 so conclusion identical. Discussion adds key insight: header repetition helped but untrained words "weight" and "2020" don't discriminate between products - this is why encoding trained only on descriptions fails on table rows.
- T2: Perfect alignment - no new information
- T3: Discussion adds a second question I didn't fully explore: was the confirmation never recorded by the interface, or did it arrive after the writer requested? Either way, the writer shouldn't claim success on a refused tool. The "first fix" (checking answer vs tool results) catches it regardless.

**Chapter coverage revealed:**
- The discussion references "chapter 1" for faithfulness to wrong chunks
- The encoder training section (line 224) explicitly excludes table rows ("if ':' not in l") - this explains why queries with "2020" can't discriminate products
- Case C in the exercise (accepted SPRING10) vs B (refused FREE100) showed the confirmation mechanism, helping me understand T3
