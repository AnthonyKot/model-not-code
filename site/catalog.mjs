// The register of the book. Reading order = array order. Slugs are stable forever.
// status: pitched → drafted → reviewed → read → published. Only `published` is built unless --all.
// sources[]: {kind:"course", course:"<udemy id>", lectures:["NN-NN", …]} — lecture files under resources/udemy-subs/course-<id>/
//            {kind:"book", key:"<MANIFEST.tsv key>", pages:"pp. …"}           — page receipts, located at drafting time
//            {kind:"paper", id:"arXiv:…", section:"…"}                         — public primary source
// Numbers quoted from a lecture are "as reported in lecture X" in the prose and `reported` in corpus/<slug>/receipts.tsv.
// Book keys used in sources[] are defined in resources/MANIFEST.tsv.

export const meta = {
  title: "The Program Is Now a Model",
  slug: "model-not-code",
  subtitle: "Standalone essays for a senior developer moving into ML and AI engineering",
  repo: "https://github.com/AnthonyKot/model-not-code",
  site: "https://anthonykot.github.io/model-not-code/",
};

export const parts = [
  { id: "I",   title: "The program is now a set of weights" },
  { id: "II",  title: "Data and training" },
  { id: "III", title: "Evaluation and monitoring" },
  { id: "IV",  title: "Serving and inference" },
  { id: "V",   title: "LLM systems: retrieval, fine-tuning, agents" },
  { id: "VI",  title: "The job" },
];

// Udemy courses the author owns; named as study sources, never quoted beyond a phrase.
export const courses = {
  "4735368": { title: "Deep Learning Masterclass with TensorFlow 2 Over 20 Projects", by: "Neuralearn.ai", lang: "en" },
  "6100015": { title: "AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents", by: "Ed Donner", lang: "en" },
  "5004958": { title: "Machine Learning Projects for Industry 4.0", by: "(Udemy instructor)", lang: "en" },
  "3725442": { title: "Reinforcement Learning beginner to master — AI in Python", by: "(Udemy instructor)", lang: "en" },
  "4635836": { title: "Advanced Reinforcement Learning: policy gradient methods", by: "(Udemy instructor)", lang: "en" },
  "6538601": { title: "Building LLMs like ChatGPT from Scratch and Cloud Deployment", by: "Neuralearn.ai", lang: "en" },
  "6199297": { title: "Multimodal GenAI RAG Apps (Practical GenAI, Part 2)", by: "Ahmad ElSallab, Coursat.ai", lang: "ar", note: "machine-translated captions; receipts point at the .en.txt files" },
};

const C = (course, ...lectures) => ({ kind: "course", course, lectures });
const B = (key, pages = "") => ({ kind: "book", key, pages });
const P = (id, section = "") => ({ kind: "paper", id, section });

const E = (slug, part, title, mechanism, sources, extra = {}) => ({
  slug, part, title, mechanism, sources,
  status: "pitched",
  domain: "", payoff: "", artifact: "", mission: "", missionLabel: "", caution: "",
  recommended: false,
  ...extra,
});

export const essays = [
  // ── I. The program is now a set of weights ──────────────────────────────
  E("model-is-a-learned-function", "I", "The Program Is Now a Table of Numbers, and Training Is the Compile Step",
    "Loss plus gradient descent turn a parametrised function into behaviour; the artefact you ship is weights plus preprocessing, not code.",
    [C("4735368", "03-05", "03-06", "03-07", "03-08", "03-09"), B("geron-pytorch")]),
  E("tokens-not-characters", "I", "Why the Model Cannot Count the Letters in “Strawberry”",
    "Byte-pair merges map text to integer IDs from a fixed table; tokens, not characters, are the unit of cost, context length and many errors.",
    [C("6100015", "01-29", "01-30", "01-31", "01-32", "03-11", "03-12", "03-13", "03-14"), C("6538601", "03-02"), B("llm-deep-dive")]),  // 01-24..01-27 held no tokenizer material (pitch note 2026-09-12)
  E("attention-is-a-soft-lookup", "I", "Attention Is a Dictionary Lookup That Returns a Weighted Mix",
    "Scaled query·key scores, softmaxed, weight the values; a causal mask hides the future.",
    [C("6538601", "02-02"), C("6100015", "03-18"), C("4735368", "28-02"), B("raschka-qai")]),
  E("embeddings-are-coordinates", "I", "Nearest Neighbour in 384 Dimensions Is the Whole Trick",
    "An encoder maps text to a vector; cosine similarity ranks; contrastive training pulls matching pairs together.",
    [C("4735368", "34-02", "34-04", "25-01"), C("6100015", "05-04", "05-05"), B("raschka-qai")]),

  // ── II. Data and training ───────────────────────────────────────────────
  E("validation-set-is-a-budget", "II", "You Only Get to Look at the Test Set Once",
    "Train, validation and test are three budgets; the validation curve picks the checkpoint, and every look at the test set spends it.",
    [C("4735368", "03-09", "03-10", "07-04"), C("6100015", "07-19", "07-20"), B("huyen-dmls")]),
  E("class-imbalance-changes-the-loss", "II", "95% Accuracy on a 95/5 Dataset Is the Baseline, Not a Result",
    "Class weights or resampling change how much loss each class contributes; the confusion matrix shows per-class recall.",
    [C("4735368", "15-02", "06-02", "06-03"), B("huyen-dmls")]),
  E("augmentation-declares-invariance", "II", "Augmentation Is Telling the Model What Does Not Matter",
    "Label-preserving transforms enlarge the training distribution; mixup and cutmix mix the labels too.",
    [C("4735368", "08-03", "08-05", "11-04"), B("geron-pytorch")]),  // 08-02 and 08-04 have no captions on Udemy
  E("input-pipeline-is-the-bottleneck", "II", "Your GPU Is Waiting on Your JPEG Decoder",
    "Serialise once, read sequentially, map in parallel, prefetch: the producer–consumer pattern applied to training.",
    [C("4735368", "11-05", "03-11"), B("dist-ml-patterns")]),  // 10-04 is hyperparameter tuning; dropped (pitch note)
  E("transfer-learning-freeze-then-thaw", "II", "Borrow the Eyes, Retrain the Judgement",
    "Freeze a pretrained backbone, train a new head, then unfreeze with a small learning rate.",
    [C("4735368", "13-01", "13-02", "12-03", "12-05"), B("geron-pytorch"), B("raschka-qai")]),
  E("lora-is-a-low-rank-diff", "II", "Fine-Tuning Without Touching the Weights",
    "A low-rank delta B·A of rank r is trained beside frozen weights; QLoRA keeps the base in 4-bit and the adapters in higher precision.",
    [C("6100015", "07-01", "07-02", "07-03", "07-04", "07-05", "07-06", "07-11", "07-12"), B("raschka-qai"), B("quant-ru")],
    { recommended: true }),
  E("learn-the-action-or-learn-its-worth", "II", "Learn What To Do, or Learn What It Is Worth",
    "Value methods estimate returns and act greedily; policy-gradient methods move action probabilities in proportion to return.",
    [C("3725442", "05-08", "09-03", "09-04", "11-01", "11-02", "11-03", "11-04", "11-05"), B("lapan-drl")]),
  E("ppo-clips-the-step", "II", "PPO: Reuse the Samples, But Not Too Much",
    "The probability ratio new/old is clipped so a reused batch cannot move the policy too far; the trust region is the motivation, RLHF the application.",
    [C("4635836", "11-01", "11-02", "11-03", "11-04", "11-05", "11-06", "12-01", "13-01"), B("lapan-drl"), P("arXiv:2203.02155", "3.5")]),

  // ── III. Evaluation and monitoring ──────────────────────────────────────
  E("the-model-outputs-a-score", "III", "The Model Outputs a Score; You Choose the Threshold",
    "Precision, recall and the ROC curve are functions of a threshold over scores; the threshold is a product decision, not a model property.",
    [C("4735368", "06-02", "06-03", "06-04"), B("stats-programmers"), B("huyen-dmls")]),
  E("benchmark-is-a-claim-about-a-test-set", "III", "A Benchmark Score Is a Claim About a Test Set That May Be in the Training Set",
    "Public benchmarks leak into training data; a private evaluation set and pairwise comparison are the defence.",
    [C("6100015", "04-03", "04-04", "04-05", "04-09", "04-18"), B("huyen-dmls"), B("llm-deep-dive")]),
  E("measure-retrieval-before-blaming-the-model", "III", "Measure Retrieval Before You Blame the Model",
    "Mean reciprocal rank and nDCG over a golden question set score retrieval on its own; the answer is judged separately.",
    [C("6100015", "05-17", "05-18", "05-19", "05-20", "05-21", "05-31"), C("6199297", "05-09"), B("huyen-dmls")],
    { recommended: true }),
  E("which-feature-moved-the-prediction", "III", "Which Feature Moved This Prediction, and By How Much",
    "Shapley attribution: contributions sum to prediction minus baseline, exact by enumerating coalitions.",
    [C("5004958", "17-01", "17-02", "17-03"), C("4735368", "14-02")]),
  E("autoencoder-learns-normal", "III", "An Autoencoder Learns “Normal”; Anomaly Is Reconstruction Error",
    "A bottleneck forces reconstruction of what is common; a threshold on reconstruction error flags what is not.",
    [C("5004958", "08-01", "08-02", "14-02", "14-03", "14-04"), B("geron-pytorch")]),
  E("predict-the-time-left", "III", "Predict the Time Left, Not the Failure",
    "Remaining useful life is regression on run-to-failure cycles: the label is cycles remaining, clipped; sliding windows feed the model.",
    [C("5004958", "03-08", "03-09", "10-01", "10-02", "10-03", "10-04", "10-05", "10-12"), B("ts-foundation")]),

  // ── IV. Serving and inference ───────────────────────────────────────────
  E("kv-cache", "IV", "Why the Second Token Is Cheaper Than the First",
    "Keys and values are cached per layer so each new token attends over stored ones; prefill and decode differ, the cache grows with the sequence, and grouped-query and sliding-window attention are the two ways to shrink it.",
    [C("6538601", "03-07", "03-05", "03-06", "02-03"), B("inference-eng"), B("llm-serving")],
    { recommended: true }),
  E("position-is-a-rotation", "IV", "Position Is a Rotation",
    "Rotary position encoding rotates query and key pairs by position times a frequency, so their dot product depends only on relative distance.",
    [C("6538601", "03-03", "03-04"), B("llm-deep-dive")]),
  E("four-bits-per-weight", "IV", "Four Bits Per Weight: What You Lose and Where",
    "Block-wise scale and zero point map floats to small integers; the error is bounded by the step size; NF4 and double quantisation are variants.",
    [C("6100015", "03-15", "03-16", "07-03", "07-05"), B("quant-ru"), B("inference-eng")]),
  E("batching-is-where-throughput-comes-from", "IV", "Batching Is Where the Throughput Comes From",
    "Decoding is memory-bound, so a batch of sequences costs about the same as one; continuous batching and a paged cache keep the batch full.",
    [C("6538601", "04-01"), C("4735368", "18-02", "18-03"), C("6100015", "08-01", "08-02", "08-03", "08-04", "08-05"), B("llm-serving"), B("inference-eng")]),

  // ── V. LLM systems ──────────────────────────────────────────────────────
  E("the-chunk-is-the-unit-of-retrieval", "V", "The Chunk Is the Unit of Retrieval, and the Table Header Is in the Wrong One",
    "Chunk size and overlap decide what one embedding can represent; headers lost at boundaries are the common failure; semantic chunking, query rewriting and reranking are the repairs.",
    [C("6100015", "05-08", "05-22", "05-25", "05-26", "05-28", "05-29", "05-30"), C("6199297", "03-08", "03-09", "05-01")]),
  E("your-loop-calls-the-function", "V", "The Model Does Not Call Your Function; Your Loop Does",
    "A tool schema goes into the prompt, the model emits a structured call, your code runs it and appends the result, and the loop needs a stop rule and a budget.",
    [C("6100015", "02-14", "02-15", "02-16", "02-17", "08-12", "08-15", "08-16", "08-17", "08-18"), B("owasp-llm")]),
  E("untrusted-text-is-an-untrusted-code-path", "V", "Text in the Context Window Is Input, Not Instruction",
    "The model cannot tell instruction from data; retrieved text can carry instructions; the defence is limiting what the model is allowed to do, not filtering what it reads.",
    [B("owasp-llm"), B("llm-security-playbook"), C("6100015", "02-10", "05-16"), C("6199297", "03-06")]),
  E("when-fine-tuning-lost", "V", "The Fine-Tuned Frontier Model Got Worse; the Small Network Won",
    "Fine-tuning changes format and style cheaply and knowledge expensively; a baseline ladder from random to linear to trees to a small network to a frontier model to SFT tells you which rung you needed.",
    [C("6100015", "06-12", "06-13", "06-14", "06-15", "06-16", "06-17", "06-18", "06-19", "06-20", "06-21", "06-22", "06-23", "06-24", "06-25", "06-26", "06-27", "07-21", "07-22", "07-23", "07-24"), B("huyen-dmls")]),

  // ── VI. The job ─────────────────────────────────────────────────────────
  E("read-the-table-first", "VI", "Read the Paper for Its Table, Then Its Method",
    "A reading order for a paper: the claim, the results table, the method, what was held fixed; then re-derive one number.",
    [P("arXiv:2203.02155"), C("6538601", "03-06")]),
  E("show-the-eval-not-the-demo", "VI", "Show the Eval, Not the Demo",
    "A portfolio repository a hiring engineer trusts leads with the baseline table, the evaluation harness and the failure cases; the demo comes last.",
    [C("6100015", "01-03", "08-19"), B("staff-eng-path")]),
  E("design-the-data-loop-first", "VI", "The ML System Design Interview Is a Real Design Exercise",
    "Framing, data, features, model, evaluation, serving and monitoring, with the feedback path drawn: the loop is the design.",
    [B("huyen-dmls"), B("ml-system-design"), B("acing-sdi"), C("6100015", "06-07", "06-08")]),
  E("the-rule-was-cheaper", "VI", "The Rule Was Cheaper, and You Could Test It",
    "Machine learning costs data, evaluation and drift; a rule costs a test; the conditions under which the model earns its cost are few and checkable.",
    [B("huyen-dmls"), B("ds-hard-parts"), C("6100015", "06-07")]),
];

export const skips = [];
