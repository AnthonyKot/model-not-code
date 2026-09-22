# Appendix A. Serving the Writer: vLLM, RunPod and Modal

*As of: the two recorded deployments this appendix follows name no tool versions, so everything here is as of their recording dates and of the editions named in the sources line. The flag names are as the serving book gives them. The code is illustrative and was not executed: it needs a GPU, a download of the weights and a paid account. Timings are one instructor's, on one machine, one session.*

Chapter 7 priced a generated token and found three levers: a cache of keys and values so a decode step computes one row instead of a square, fewer bytes per weight so the memory-bound step reads less, and a batch so each read of the weights serves more customers. It worked all three by hand on a sixteen-dimensional generator. This appendix names the packaged form of the same three levers, a serving engine, and the settings that correspond to each; then two ways to put that engine on a rented GPU, a serverless endpoint and a deployed function with a persistent volume; and it ends by reading chapter 7's week 37 report from the engine's side. Nothing here changes the arithmetic of chapter 7. It says which knob the arithmetic is attached to.

## What the engine packages

The engine, vLLM, introduces itself with a feature list, as of the recording: serving throughput, paged attention for key and value memory, continuous batching of incoming requests, CUDA graphs, quantisation, optimised attention kernels, speculative decoding and chunked prefill. Read against chapter 7 the list is the three levers, one scheduler, and one lever the chapter never touched.

| Feature on the list | Chapter 7's lever or cost | What the engine adds |
|---|---|---|
| Paged attention | the KV cache, and its memory per request | the cache is stored in fixed-size pages found through a lookup table, so a request's cache need not be one contiguous block and can live in fragmented memory |
| Continuous batching | batching by B, with a slot freed the moment a request finishes | a scheduler that admits the next queued request into the freed slot, capped by a maximum batch size and a maximum number of batched tokens |
| Chunked prefill | the newcomer's prefill, a compute-bound pass among memory-bound decode steps | the prompt is split into chunks the size of a decode step so that decoding customers keep receiving tokens while a new prompt is processed |
| Quantisation | four bits per weight, a quarter of the bytes per step | the mapping applied at load time, chosen by a setting rather than written by hand |
| Speculative decoding | not in chapter 7 | more than one token per pass over the weights, when the arithmetic units are idle anyway |
| CUDA graphs, attention kernels | not a lever in chapter 7's sense | fewer reads and writes of memory inside the attention step itself; the bytes of weights read per step do not change |

Two settings carry the batching lever, and the serving book's example gives both on one line:

```text
vllm serve  <model id>  --max-num-batched-tokens 4096  --max-num-seqs 128
```

The second, the maximum number of sequences, caps how many requests decode together: chapter 7's B, as an upper bound the scheduler may not exceed. The first caps the total tokens in one iteration, and it exists because prompts differ in length: a few long prompts arriving together would fill an iteration with prefill on their own, so the token cap is what governs prefill, and the sequence cap is what governs decode. Set the token cap too low and the card's arithmetic is never saturated during prefill; set the sequence cap higher than the card's memory can hold caches for and the cap is not the binding limit, the memory is. The two caps are the engine's names for the two axes of chapter 7's crossover table.

The lever chapter 7 did not work is speculative decoding, and it lives exactly in the regime chapter 7 diagnosed. A decode step at small batch is memory-bound: the weights are read once and the arithmetic units are mostly idle. Speculative decoding spends that idle arithmetic. A small **draft** model, or an extra head on the model itself, proposes several next tokens; the **target** model, the one being served, checks them all in one pass over its weights, accepts the prefix that matches what it would have produced, and adds one token of its own. A pass that accepts N draft tokens yields N + 1 tokens for one read of the weights. What it buys depends on three things: the cost of a draft token, the length of the draft, and the share of draft tokens accepted, which is high at the start of a draft and falls with each position, and falls further at higher sampling temperatures because the target's own choices become harder to predict. Once one draft token is rejected, everything after it is discarded. It improves tokens per second and the gap between tokens, not the time to the first token, which is prefill's. And it stops paying when the batch is large enough that the arithmetic is busy anyway; at that point the engine has nothing spare to spend on verification and the feature is switched off. The draft model is usually a much smaller member of the target's own family, at least ten times smaller by parameter count, and it costs memory of its own: weights, activations and a KV cache, all beside the target's.

<details>
<summary>Optional: the quick start and the request, as recorded</summary>

The quick start is three lines: a list of prompts, an engine object built from a model identifier, and a call that returns the outputs. Installation is `pip install vllm`. Illustrative, not executed:

```python
from vllm import LLM
prompts = ["the steel kettle", "the slim wireless keyboard"]
llm = LLM(model="<model id>")          # loads the weights; a GPU and a download
outputs = llm.generate(prompts)
```

The server speaks the same request format as the OpenAI API, so a client written for that API is pointed at a different base URL and an endpoint key, and nothing else changes. The recorded request has a system message and a user message, a temperature of 0.7 and a limit of 1,000 new tokens:

```python
from openai import OpenAI
client = OpenAI(api_key="<endpoint key>", base_url="<endpoint url>/v1")
reply = client.chat.completions.create(
    model="<model id>",
    messages=[{"role": "system", "content": "You are a helpful assistant."},
              {"role": "user", "content": "explain briefly temperature in large language models"}],
    temperature=0.7,
    max_tokens=1000,
)
```

Two of those fields are chapter 7's numbers in another name. `max_tokens` is the number of decode steps the request may cost, the 120 of the week 37 report; a limit of 100 cut a recorded answer off mid-sentence. `temperature` scales the writer's next-token scores before the softmax at sampling time: two recorded runs at 0.1 and 1.0 gave a narrower and a broader answer to the same question, and the appendix's last section says what it costs speculative decoding.

</details>

## A serverless endpoint: the engine on somebody else's card

The first recorded deployment puts the engine on a hosting platform, RunPod, through its console, from a template that wraps vLLM behind an OpenAI-compatible endpoint. The form asks for the model's identifier on Hugging Face, an access token if the model is gated, the engine's version, and then a page of settings left at their defaults. The platform picks a GPU that fits the model. Two numbers are set by hand: a **maximum number of workers**, two in the recording, and a number of **active workers**, left at zero. An active worker is a replica kept running between requests; zero of them means every idle period ends in a cold start, and the console says as much, that active workers exist to reduce cold-start time.

The console's health page is the dashboard, and it shows queues and workers rather than tokens: jobs completed, failed, in progress, queued and retried; workers idle, initialising, running, throttled and unhealthy. Chapter 7's lines, tokens per second and utilisation, are not on it. Two things happened in the recording that the page did show. The first deployment's workers went unhealthy because the model was gated and no token had been given; the logs said so, and the fix was a redeploy with the token. The first successful request then took long enough to watch, because the worker had to download the weights and start the engine before it could serve a token; the same question a second time returned in 1.2 seconds. The two numbers together are the whole of what a serverless endpoint costs in latency: a cold start you pay whenever no worker is warm, and a warm response after it. The platform also required a minimum balance before it would deploy, ten dollars at the time of the recording.

What a cold start is made of, chapter 7's source on serving spells out: getting a GPU, loading the container image, loading the weights, starting the engine, and for engines that compile, the compilation. The weight-loading term is bytes over bandwidth, which is why chapter 7's four-bit lever shows up here a second time. The week 37 generator's 7.0 GB of weights at two bytes each is 1.75 GB at half a byte, and the load takes a quarter of the time on the same link. The remedy the console offers, an active worker, is chapter 7's last paragraph priced: a replica that is never cold costs its card every hour, requests or none.

## A deployed function with a volume: the same cold start, measured

The second recorded deployment puts a fine-tuned model on a different platform, Modal, as a Python function rather than a console form. The module declares its hardware, a T4, and the function that loads the model and prices one product description; `modal deploy <module>` publishes it, a handle is looked up by name, and `.remote(...)` runs it on the platform's card. The first remote call took one minute and twenty seconds, mostly loading; the next, one minute and eight; a redeployed version, one minute and five. The numbers are one session's and vary, but they are all the same thing: the model downloaded and loaded into memory on a container that starts empty.

The fix is a **persistent volume**: a directory that survives between containers, mounted where the model library caches its downloads, so the weights are fetched once and read from local disk after. The function becomes a class, with a method marked to run once when the container starts and a method that answers requests, and the cold start fell to about thirty seconds. A second call while the container was warm returned almost at once. Then the caveat the recording ends on: the platform puts an idle container to sleep after two minutes, and waking it costs the thirty seconds again, because the volume caches the weights on disk and not in memory. The two remedies are the same two the first platform had: keep at least one container alive, at the price of its card around the clock, or lengthen the idle window, to twenty minutes in the recording, so that a customer arriving inside it finds the model in memory.

One line of the recording belongs to chapter 5 rather than chapter 7. The deployed pricer was trained on descriptions in a fixed preprocessed format, and the request is preprocessed into that format before it is sent, on the principle that inference should see what training saw. In the one recorded example the answer did not change; the principle is chapter 5's bundle boundary, and it holds whether or not one example shows it.

<details>
<summary>Optional: the shape of the deployed class, not the recorded module</summary>

The recorded module is shown on screen and the appendix does not reproduce it. The shape, in the platform's own terms: an image with the libraries installed, a volume mounted at the cache directory, a class that loads the model in a method run at container start and prices in a method run per request, and hardware named in the decorator.

```python
# shape only; not the recorded file, not executed
volume = Volume.from_name("model-cache", create_if_missing=True)

@app.cls(gpu="T4", image=image, volumes={"/cache": volume})
class Pricer:
    @enter()                     # once per container start: load from the volume
    def load(self):
        self.model = load_model(cache_dir="/cache")

    @method()                    # once per request
    def price(self, description):
        return self.model.price(preprocess(description))
```

</details>

## The week 37 report from the engine's side

Chapter 7's lab hands the reader a serving report and a proposal to buy a bigger card; the appendix's last job is to say which of its lines the engine's settings and dashboards speak to.

| Report line | What it is on the engine's side |
|---|---|
| requests decoding at once, average 3.4 | the running batch, bounded above by the maximum number of sequences |
| GPU memory: weights 7.0 GB + caches 1.2 GB of 24.0 GB | the weights as loaded, at two bytes each here, and the pages the cache manager has filled; chapter 7 worked 0.353 GB per request from these two lines |
| time to first token 180 ms | prefill, governed by the token cap and by whether prefill is chunked |
| decode speed 28 tokens/s per request | one decode step every 36 ms, memory-bound at this batch; the line speculative decoding would move |
| GPU utilisation 19% | the arithmetic idle four fifths of the time: the regime speculative decoding is for, and the regime in which the proposal's extra arithmetic buys nothing |
| monthly cost 620 | the card by the hour, whether or not a worker is warm |

Two things follow that chapter 7 could not say without the engine. First, the sequence cap in the book's example, 128, is not a number this card can honour: chapter 7 worked that 48 requests' caches fill it, so the memory bounds the batch long before the cap does, and a report that shows 3.4 decoding at once is not near either limit. Second, the report's regime, a small batch and idle arithmetic, is where speculative decoding pays, and its price is on the memory line: a draft model at a tenth of the target's size is 0.7 GB of the 15.8 GB free, plus its own cache. What it would buy is the acceptance rate, which is measured, not assumed, and which falls as the sampling temperature rises; the recorded request ran at 0.7. Chapter 7's ranking stands: four-bit weights first, then the batch, then the card; speculative decoding is a fourth lever for the same regime, and the card is still last.

## Where it stops

A tool walkthrough is dated on the day it is recorded. Feature lists grow, flag names change, and a platform's console is redesigned; what does not change is the arithmetic each setting is attached to, which is why this appendix names the setting beside chapter 7's lever rather than the other way round. Nothing here ran: the code needs a GPU, a download and an account, and the numbers are one instructor's timings on one machine. Before any of it serves a customer, the quantised or speculatively decoded generator goes back through chapter 6's golden set with chapter 2's standard error, as chapter 7 said, and the cold start goes into chapter 8's ledger as a line item, because a customer who arrives at a sleeping container pays it.

*Sources: Building LLMs like ChatGPT from Scratch and Cloud Deployment (Neuralearn.ai, Udemy), lecture 4.1; AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lecture 8.5; both paraphrased as study material. Inference Engineering, pp. 70, 131–134 and 190–192 (physical); Hands-On LLM Serving and Optimization (EPUB), chapter 6.*
