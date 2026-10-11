# Year 6 Ratio and Proportion — Curriculum Map

## Verified curriculum scope

The KSSR Mathematics Year 6 DSKP (Bahagian Pembangunan Kurikulum, September 2021), Topic 7.0 “Coordinates, Ratio and Proportion”, states:

| Standard | Exact DSKP wording | Notes |
|---|---|---|
| 7.2.1 | “Represent the ratio of two quantities in its simplest form.” | “Ratio involves whole numbers only.” |
| 7.3.1 | “Determine the proportionate quantity based on a given ratio.” | Suggested activity note: “Can determine one or both quantities based on the given ratio.” |
| 7.4.1 | “Solve daily problems involving coordinates, ratio and proportion.” | Problem-solving note recommends Polya: understand, plan, carry out, check. This is contextual application, not a new ratio learning standard in this course. |

The DSKP Performance Standard for Topic 7 groups these outcomes with other Topic 7 outcomes. Level 1 includes reading scales and stating a ratio; Level 2 asks pupils to explain steps for representing ratios and determining quantities; Level 3 explicitly includes simplest-form representation and determining proportionate quantities. Levels 4–6 broaden to routine and non-routine daily problem solving. The current Year 6 interaction data provide evidence chiefly for the Level 2–3 skills; they do not yet constitute a validated full Level 4–6 assessment.

## Learning map

| Official standard | Intended understanding | Course lessons | Question families | Assessment criteria and evidence | Misconceptions to revisit |
|---|---|---|---|---|---|
| 7.2.1 | Identify both quantities in order; reduce both terms using the same common factor; explain why equal grouping preserves the relationship; identify an already simplest ratio. | A ratio compares two quantities; Simplest form; Find a common factor; Keep the relationship. | Compute simplest form; identify simplest form; explain a grouping; evaluate an invalid operation. | Across at least five varied items, pupil correctly represents in simplest whole-number terms and explains/recognises why the terms preserve the comparison. Multiple-choice results alone are provisional evidence. | Reversing order; dividing one term; using unequal factors; stopping early; subtracting rather than scaling; treating ratio automatically as part/whole. |
| 7.3.1 | Use the multiplier between corresponding quantities; determine one or both missing quantities; check that the resulting collection retains the ratio. | Scale both quantities; Find one missing quantity; Find both quantities and check. | Known first term; known second term; repeated groups; additive-versus-multiplicative claim; proportionate quantity. | Across at least five varied items, pupil determines corresponding quantity/quantities and checks with the same multiplier or equivalent ratio. Current interaction checks are provisional evidence. | Applying multiplier to only one term; adding the same number; using a wrong factor; accepting a result that does not retain the ratio. |
| Integrated (primary 7.2.1, secondary 7.3.1) | Simplify a given collection's ratio, then use the simplified relationship to determine a new corresponding quantity. | Connect simplest form and proportion. | Multi-step simplify-and-scale. | Evidence must include independent 7.2.1 and 7.3.1 items as well as integrated items; integrated performance alone does not determine either mastery. | Confusing the simplification task with scaling a new collection. |

## Research-informed design

Perumal and Syed Zamri (2022) report a qualitative case study of seven Year Five pupils, examining their conceptions and representations of ratio and proportion. Their findings support making pupil meanings and representations visible in instruction; the small case study is not treated as a prevalence estimate or as evidence that every pupil has the same misconception. Lessons therefore use equal groups, ordered labels, ratio notation, worked reasoning, and error analysis.

## Source record

1. **Curriculum:** Bahagian Pembangunan Kurikulum, *Dokumen Standard Kurikulum dan Pentaksiran Matematik Tahun 6* (KSSR Semakan 2017, September 2021), Topic 7, printed pages 55–57 / PDF pages 66–68. [PDF copy](https://asiemodel.net/wp-content/uploads/2022/08/3.-DSKP-MATEMATIK-TAHUN-6_isbn.pdf); [DLP page 63 flipbook](https://fliphtml5.com/wgvyt/ktyp/DSKP_Mathematics_Tahun_6_%28DLP%29/63/). Accessed 11 October 2026. Exact learning-standard translations above are from the English DLP edition; Malay edition cross-check: “Mewakilkan nisbah dua kuantiti dalam bentuk termudah”; “Menentukan kuantiti yang berkadaran dengan berdasarkan nisbah yang diberi.”
2. **Research:** Vani a/p Perumal and Sharifah Norul Akmar Syed Zamri (2022), “Conceptions of Ratio and Proportions Among Year Five Pupils: Case Study,” *Malaysian Online Journal of Educational Sciences*, 10(1). [ERIC full text](https://files.eric.ed.gov/fulltext/EJ1332853.pdf); [journal record](https://mjcs.um.edu.my/index.php/MOJES/article/view/34504). Accessed 11 October 2026. Used to inform representation and conceptual explanation; all website items are classified as original, not authentic exam questions.

## Implemented question bank audit

The integrated app bank has 268 records: the original 24 standard-specific Year 6 questions and 4 integrated questions, plus 240 independently parameterised library records. The library has 40 records in each requested category:

| Category | Count |
|---|---:|
| Simplifying ratios — foundational | 40 |
| Simplifying ratios — intermediate | 40 |
| Simplifying ratios — challenging and contextual | 40 |
| Proportionate quantities — foundational | 40 |
| Proportionate quantities — intermediate | 40 |
| Proportionate quantities — challenging and contextual | 40 |

The library spans 20 task families, 7 named task formats, and multiple choice and numeric entry. Generated answers are derived from each record's numeric data. The audit checks stable IDs, exact duplicate prompts, category counts, answer/options consistency, simplification and scaling arithmetic, and emoji counts; the report is regenerated by `frontend/scripts/auditYear6Bank.cjs` to `frontend/YEAR6_QUESTION_AUDIT.json`. The current audit finds 0 duplicate IDs and 0 exact duplicate prompts, with all generated answer and visual checks passing.

Practice sessions sample without replacement, balance category coverage, and store a recent-question history in browser local storage. The formal Year 6 challenge uses a fixed 10-question set with five items per standard and a 2/2/1 distribution across foundational/intermediate/challenging tiers for each standard. Practice retries do not change the first-try session score; all attempts still contribute to formative evidence.

The Year 6 Learn, Practice, and Visual Lab pages use the existing Year 5 `ObjectBoard`/`ObjectToken` representation, responsive cards, entry animation, feedback states, and app audio. Emoji quantities are labelled and model counts match represented values; large quantities use compact groups of ten instead of hundreds of emoji tokens.

Automated checks establish arithmetic and data consistency, not the educational quality of every explanation. Teacher review is still recommended for age-level phrasing, distractors, and difficulty progression. The question set supports the stated standards but does not by itself establish full Topic 7 Performance Standard Levels 4–6. The Jest runner could not execute in this sandbox because Node received `EPERM` resolving the workspace/temp path; the standalone audit script ran successfully.
