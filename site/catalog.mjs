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
  subtitle: "Eight project chapters for a senior developer moving into ML and AI engineering",
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
    [C("4735368", "03-05", "03-06", "03-07", "03-09"), B("geron-pytorch", "pp. 173–177")],
    { status: "published",
      payoff: "The loop that turns a loss and a gradient into a file of weights, walked once by hand, and the two ways a training run visibly goes wrong." }),
  E("tokens-not-characters", "I", "Why the Model Cannot Count the Letters in “Strawberry”",
    "Byte-pair merges map text to integer IDs from a fixed table; tokens, not characters, are the unit of cost, context length and many errors.",
    [C("6100015", "01-29", "01-30", "01-31", "01-32", "03-11", "03-12", "03-13", "03-14"), C("6538601", "03-02"), B("llm-deep-dive", "pp. 65–66, 77"), P("arXiv:1508.07909", "3.2")],  // 01-24..01-27 held no tokenizer material (pitch note 2026-09-12)
    { status: "published",
      payoff: "How a tokenizer's table is built by counting, why a common word reaches the network as one integer, and what that does to any question about its letters.",
      caution: "The 128,256-entry table and the four-characters-per-token rule are Llama 3 / English-prose figures as of the course's recording (2025)." }),
  E("attention-is-a-soft-lookup", "I", "Attention Is a Dictionary Lookup That Returns a Weighted Mix",
    "Scaled query·key scores, softmaxed, weight the values; a causal mask hides the future.",
    [C("6538601", "02-02"), C("6100015", "03-18"), C("4735368", "28-02"), B("raschka-qai", "pp. 117–126"), B("llm-deep-dive", "pp. 63–68, 81")],
    { status: "published",
      payoff: "The score table inside every attention layer, the mask that hides the future in it, and why that mask makes training on whole documents and generating one token at a time the same computation." }),
  E("embeddings-are-coordinates", "I", "Similar Means Whatever the Training Pairs Said",
    "Cosine similarity ranks stored vectors; an in-batch contrastive loss with a temperature pulls each training pair together and pushes the rest of the batch apart, so only pair types present in training are arranged.",
    [C("4735368", "34-02", "34-04", "25-01"), C("6100015", "05-04", "05-05"), B("raschka-qai", "pp. 27–29, 218"), B("geron-pytorch", "pp. 702–704")],
    { status: "published",
      payoff: "How an embedding model comes to put matching texts close together, worked through one training step by hand, and why queries of a kind it never trained on can come back as noise.",
      caution: "Worked numbers and the toy encoder are the book's own. In the exercise's lookup-table encoder an untrained pair's vectors do not move at all; in a transformer encoder they move as a side effect of other pairs, so real failures are less clean." }),

  // ── II. Data and training ───────────────────────────────────────────────
  E("validation-set-is-a-budget", "II", "You Only Get to Look at the Test Set Once",
    "Train, validation and test are three budgets; the validation curve picks the checkpoint, and every look at the test set spends it.",
    [C("4735368", "03-09", "07-04"), C("6100015", "07-19", "07-20"), B("huyen-dmls", "pp. 116, 164–166, 223")],
    { status: "published",
      payoff: "The best validation score out of many tries is inflated by the trying: how much, what it depends on, and why the test set is scored once.",
      caution: "Scores are simulated rather than trained; real checkpoints are correlated and differ in quality, which shrinks but does not remove the inflation." }),
  E("class-imbalance-changes-the-loss", "II", "95% Accuracy on a 95/5 Dataset Is the Baseline, Not a Result",
    "Class weights or resampling change how much loss each class contributes; the confusion matrix shows per-class recall.",
    [C("4735368", "15-02", "06-02", "06-03"), B("huyen-dmls", "pp. 120–133")],
    { status: "published",
      payoff: "When one class is 95% of your rows the training loss is mostly written by that class; a class weight changes what the model is trained to predict, and the confusion matrix shows what that costs.",
      caution: "PyTorch loss arguments as of 2.14; the synthetic data is invented; weighting changes the scores' meaning as probabilities." }),
  E("augmentation-declares-invariance", "II", "Augmentation Is Telling the Model What Does Not Matter",
    "Each transform keeps the label and so declares an invariance; a false declaration trains on contradictory or unseen inputs.",
    [C("4735368", "08-03", "08-05", "11-02", "11-04"), B("geron-pytorch", "pp. 468–469, 492–493"), P("https://docs.pytorch.org/vision/stable/generated/torchvision.transforms.v2.RandomRotation.html", "degrees parameter")],
    { status: "published",
      payoff: "Why adding a standard flip or rotation can lower validation accuracy, and how to check which transforms your labels actually allow before you train.",
      caution: "The audit table is a starting judgement, not a rule; the exercise data is synthetic." }),
  E("input-pipeline-is-the-bottleneck", "II", "Your GPU Is Waiting on Your JPEG Decoder",
    "Once loading overlaps compute, a step costs max(load, compute), not their sum; parallel workers divide the load term.",
    [C("4735368", "03-11", "11-04", "11-05"), B("geron-pytorch", "p. 367"), B("dist-ml-patterns", "pp. 29, 59–60"), P("https://github.com/pytorch/pytorch/blob/v2.14.0/torch/utils/data/dataloader.py"), P("https://docs.python.org/3/library/multiprocessing.html")],
    { status: "published",
      payoff: "Why a faster GPU often leaves training no faster, and how two timings of your own loop tell you what more data-loader workers, prefetching or a new card would actually buy.",
      caution: "PyTorch DataLoader defaults and internals as of PyTorch 2.14. The forecast is for steady state and assumes a free CPU core per worker; storage throughput and variable decode times are outside it." }),
  E("transfer-learning-freeze-then-thaw", "II", "Borrow the Eyes, Retrain the Judgement",
    "requires_grad=False stops gradients but not BatchNorm's running statistics; eval() on those layers freezes them, and parameter groups give the thawed backbone a smaller learning rate.",
    [C("4735368", "13-01", "13-02", "12-03"), B("geron-pytorch", "pp. 406–409, 413–416, 436, 492–493"), B("raschka-qai", "pp. 132–133"), P("https://pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html", "momentum note"), P("https://pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html"), P("https://pytorch.org/docs/stable/generated/torch.nn.Module.html", "train/eval"), P("https://keras.io/api/layers/normalization_layers/batch_normalization/", "momentum")],
    { status: "published",
      payoff: "Why a backbone you froze with requires_grad=False can still change during training, and how to freeze, train a new head and thaw without that happening by accident.",
      caution: "PyTorch and Keras defaults and behaviours as of 2026-09-13 (PyTorch 2.14). The exercise's domain shift is deliberately extreme; on real data, whether frozen or re-estimated BatchNorm statistics serve the new task better has to be measured." }),
  E("lora-is-a-low-rank-diff", "II", "Fine-Tuning Without Touching the Weights",
    "A low-rank delta B·A of rank r is trained beside frozen weights; QLoRA keeps the base in 4-bit and the adapters in higher precision.",
    [C("6100015", "07-02", "07-03", "07-04", "07-05", "07-06", "07-11", "07-12", "07-20"), B("raschka-qai", "pp. 141–142"), P("arXiv:2106.09685", "4.1")],
    { recommended: true, status: "published",
      payoff: "What a LoRA adapter actually is, why it is so much smaller than the model it changes, and how to work out its size before you train." }),
  E("learn-the-action-or-learn-its-worth", "II", "Measure the Return, or Guess It From the Next State",
    "Monte Carlo methods wait for the episode to end and average the returns they observed; Q-learning updates every step toward one reward plus its own estimate of the next state, which is why a deep Q-network needs a target network and can use a replay memory.",
    [C("3725442", "02-05", "02-06", "02-08", "04-01", "04-09", "05-01", "05-03", "05-08", "06-03", "09-03", "09-04", "10-01", "11-01", "11-05"), B("lapan-drl")],
    { status: "published",
      payoff: "Why a Q-learning network chases a target that moves as it learns, and why waiting for the whole episode avoids that at the price of noisier, slower updates.",
      caution: "Tabular and deterministic; the corridor shows bias and propagation speed exactly, but variance only through an exploratory behaviour, not through random rewards." }),
  E("ppo-clips-the-step", "II", "PPO: Reuse the Samples, But Not Too Much",
    "The probability ratio new/old is clipped so a reused batch cannot move the policy too far; the trust region is the motivation, RLHF the application.",
    [C("4635836", "11-01", "11-02", "11-03", "11-06", "12-01", "12-05", "12-06", "13-01"), B("lapan-drl"), P("arXiv:1707.06347", "3, 5"), P("arXiv:2203.02155", "3.5")],
    { status: "published",
      payoff: "Why training a reinforcement-learning policy on the same batch for several epochs can wreck it, and how PPO's clipped ratio switches off each sample's gradient once the policy has moved far enough on its account.",
      caution: "The clip removes the incentive to move further; it does not cap how far the policy actually moves, as the exercise shows." }),

  // ── III. Evaluation and monitoring ──────────────────────────────────────
  E("not-available-at-prediction-time", "III", "The Feature That Knew the Answer",
    "A feature that uses information absent at prediction time makes the offline score a claim about a different function; split by time and fit every transform on the training split only.",
    [B("huyen-dmls", "pp. 163–165"), B("ds-hard-parts", "pp. 139–143"), C("4735368", "03-09"), B("ml-system-design")]),
  E("the-model-outputs-a-score", "III", "The Model Outputs a Score; You Choose the Threshold",
    "Precision, recall and the ROC curve are functions of a threshold over scores; the threshold is a product decision, not a model property.",
    [C("4735368", "06-02", "06-03", "06-04"), B("geron-pytorch", "pp. 146–147"), B("stats-programmers")]),
  E("benchmark-is-a-claim-about-a-test-set", "III", "A Benchmark Score Is a Claim About Someone Else's Test Set",
    "A public benchmark number is evidence only about its test set: selection on a fixed public set inflates it, contamination is the extreme case, and a private once-used set with blind pairwise comparison is the defence.",
    [C("6100015", "04-03", "04-04", "04-05", "04-09"), B("llm-deep-dive")]),
  E("measure-retrieval-before-blaming-the-model", "III", "Measure Retrieval Before You Blame the Model",
    "Rank-based metrics over a golden question set score retrieval on its own; the answer is judged separately; keyword checks are proxies.",
    [C("6100015", "05-17", "05-18", "05-19", "05-20", "05-21", "05-31"), C("6199297", "05-09"), B("llm-deep-dive", "pp. 324–325")],
    { recommended: true }),
  E("labels-arrive-later", "III", "The Labels Arrive Later",
    "Prediction time, feedback time and label time are three clocks; each makes a different set of quantities measurable, a short feedback window under-counts, and a cumulative metric hides a dip.",
    [B("huyen-dmls", "pp. 317–318, 332, 334–335"), B("geron-pytorch", "p. 132"), C("6100015", "04-18", "06-07", "06-08"), B("ml-system-design")]),
  E("autoencoder-learns-normal", "III", "An Autoencoder Learns “Normal”; Anomaly Is Reconstruction Error",
    "A bottleneck forces reconstruction of what is common; reconstruction error is a label-free score, and a quantile threshold fixes the flag rate, not the anomaly rate.",
    [C("5004958", "08-01", "08-02"), B("geron-pytorch", "pp. 727, 733")]),
  E("the-model-picks-its-own-training-data", "III", "The Model Picks Its Own Training Data",
    "Only items the model shows receive feedback, so the next model trains on the last model's choices; small ranking gaps grow, and random exposure plus a positional feature break the loop.",
    [B("huyen-dmls", "pp. 323–325")]),

  // Deferred by the author's outline decision (2026-09-13); kept for the record, not pitched.
  E("which-feature-moved-the-prediction", "III", "Which Feature Moved This Prediction, and By How Much",
    "Shapley attribution: contributions sum to prediction minus baseline, exact by enumerating coalitions.",
    [C("5004958", "17-01", "17-02", "17-03")],
    { status: "deferred" }),
  E("predict-the-time-left", "III", "The Label Is a Design Decision",
    "Remaining useful life is a constructed label: how it is clipped and windowed changes the error you report.",
    [C("5004958", "10-02", "10-03", "10-04")],
    { status: "deferred" }),

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

// ── Chapters (plan revision 2, notes/chapters/CHAPTER-PLAN.md) ─────────────────────────
// The book is now eight project chapters on one shop, written from scratch. The essays above are
// kept as an archive, built under docs/old/. A chapter is built when status is "published" (or
// --all) and chapters/<slug>.md exists; the rest are listed on the home page as planned.
// builtFrom[] names the archived essays whose ground the chapter covers (for the archive banner).
const CH = (number, slug, title, payoff, builtFrom, sources, extra = {}) => ({
  number, slug, title, payoff, builtFrom, sources,
  status: "planned", caution: "", missionLabel: "",
  ...extra,
});

export const chapters = [
  CH(1, "search-the-catalogue", "Search the Catalogue, Then Answer From It",
    "The shop's search box and its answer writer, built from the same parts: tokens, attention, a vector per text trained on query–title pairs, and the causal mask that turns the blocks into a generator.",
    ["model-is-a-learned-function", "tokens-not-characters", "attention-is-a-soft-lookup", "embeddings-are-coordinates"],
    [C("4735368", "03-07", "28-02", "34-02", "34-04"), C("6100015", "01-29", "01-32", "03-11", "03-13", "03-20", "07-22"), C("6538601", "02-03"),
     B("llm-deep-dive", "pp. 63–68, 88–89"), B("geron-pytorch", "pp. 173–177, 702–703"), P("arXiv:1508.07909", "3.2")],
    { status: "published",
      caution: "Every example is synthetic: toy catalogue, hand-chosen vectors, a one-block model trained in seconds. Library defaults are as of sentence-transformers 6.0.1 and PyTorch 2.14." }),
  CH(2, "trust-the-number", "Trust the Number Before You Ship the Classifier",
    "The shop's product-photo classifier evaluated before release: the split, leakage, rare categories, the threshold as a cost, augmentation and the input pipeline.",
    ["validation-set-is-a-budget", "class-imbalance-changes-the-loss", "augmentation-declares-invariance", "input-pipeline-is-the-bottleneck"],
    [C("4735368", "03-09", "03-11", "06-02", "06-03", "06-04", "07-04", "08-05", "11-04", "11-05", "15-02"), C("6100015", "04-04", "07-20"),
     B("huyen-dmls", "pp. 116, 120–133, 163–166, 223"), B("ds-hard-parts", "pp. 139–143"), B("geron-pytorch", "pp. 146–151, 367, 468–469"), B("dist-ml-patterns", "pp. 29, 59–60"),
     P("https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html"), P("https://github.com/pytorch/pytorch/blob/v2.14.0/torch/utils/data/dataloader.py")],
    { status: "published",
      caution: "Every example is synthetic: 12 x 12 photos, invented prices for the two mistakes, sleeps standing in for decoding and training. PyTorch behaviour as of 2.14." }),
  CH(3, "reuse-a-pretrained-model", "Reuse a Pretrained Model",
    "Freeze and thaw a pretrained backbone for the photo classifier; then adapt the shop's language model with a low-rank diff.",
    ["transfer-learning-freeze-then-thaw", "lora-is-a-low-rank-diff"], []),
  CH(4, "train-from-reward", "Train From Reward",
    "A game agent learns from reward; the same method, with a reward model fitted to people's preferences, tunes the shop's answer writer.",
    ["learn-the-action-or-learn-its-worth", "ppo-clips-the-step"], []),
  CH(5, "keep-it-right-after-launch", "Keep It Right After Launch",
    "The photo classifier in production: what ships, what can be measured before the labels arrive, when an anomaly means investigate, and the feedback loop.",
    [], []),
  CH(6, "build-the-assistant", "Build the Assistant",
    "The shop's assistant from search and the generator: measure retrieval, choose the chunk, run the tool loop, and treat retrieved text as untrusted input.",
    [], []),
  CH(7, "serve-the-assistant-cheaply", "Serve the Assistant Cheaply",
    "What the generator costs per token and where it goes down: the KV cache, four bits per weight, batching.",
    [], []),
  CH(8, "did-the-shop-need-a-model", "Did the Shop Need a Model?",
    "A keyword rule, the search encoder and the assistant compared on the quality and cost measured in this book.",
    [], []),
];

