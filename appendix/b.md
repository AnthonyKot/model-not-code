# Appendix B. The Assistant's Toolbox: Ollama, the Chat API, Gradio and Tool Calling

*As of: the recordings this appendix follows name model versions but no library versions, so everything here is as of their recording dates. The code is illustrative and was not executed: the machine this book was built on has no local model runner installed, and installing one and downloading a model is outside the rule that the book's code runs on a CPU without downloads. Sizes and timings are one instructor's, on one machine.*

Chapter 1 wrote the generator and named two request fields a hosted model exposes, `temperature` and `max_tokens`. Chapter 6 wrote the assistant's loop around a scripted stand-in for the writer: your code sends the conversation, the writer replies with an answer or a tool request, and three checks run in your code before any function is called. This appendix puts real parts where the book had stand-ins, and shows that nothing in the loop moves. A local model runner gives an open-weight writer behind the same chat endpoint as a hosted one. The chat endpoint's request format is the one chapter 6's messages already had. A small interface library turns the loop into a chat window with one callback. And a tool-calling API replaces the scripted request format with the provider's, and the three checks stay where they were.

## An open-weight writer behind the same endpoint

A local model runner, Ollama in the recordings, downloads a packaged open-weight model and serves it on the machine: `ollama run <model>` pulls the weights the first time and opens a prompt; `ollama serve` starts the server if it is not already running, and a complaint that the address is in use means it is. The models come in sizes, and the size is the whole story of what runs on a laptop. The recordings start with a 270-million-parameter model that answers "hi there" and little more, move to a 2.2 GB download that manages fun facts, and end with a 20-billion-parameter model that needs at least 16 GB of memory and about 20 GB of disk and made the instructor's machine grind. On the recorded two-coins probability question, whose answer is two thirds, the 3-billion-parameter model said fifty-fifty and the 20-billion one got it right. The trade the recordings state is the one chapter 7 priced: no per-call charge and no data leaving the machine, against a model something like a thousand times smaller than a hosted frontier model, with the capability to match.

<details>
<summary>Optional: what the runner is, against running the code yourself</summary>

Two ways to run an open-weight model appear in the recordings. One is the model's own code and weights loaded through a general library, in the recordings the Hugging Face Transformers library: the network as chapter 1 wrote it, at full size, in your Python process. The other is the runner: fixed versions of a fixed list of models, compressed into one weight file per model, executed by optimised native code, and exposed as a local API. The runner is faster to start and narrower in what it can run. Distilled variants appear in its catalogue under the name of the model that generated their training data: a 1.5-billion-parameter entry named for a large reasoning model is a small model of another family, further trained on the large model's outputs, and the recordings say so.

</details>

The runner also exposes an endpoint in the hosted providers' chat format, at `http://localhost:11434/v1` in the recordings, so the client library written for a hosted model is pointed at it and nothing else changes: the API key field is required by the client and ignored by the runner. The request is the shape chapter 6's loop already built by hand, a list of messages with a role and a content each:

```python
# illustrative, not executed
from openai import OpenAI
local = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")   # any string; ignored
reply = local.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "system", "content": "You answer in one sentence."},
              {"role": "user", "content": "how much is the steel kettle?"}],
    temperature=0.2,
    max_tokens=60,
)
print(reply.choices[0].message.content)
```

The fields are the book's. `temperature` divides every logit before the softmax that picks a token, chapter 1's T, and at 0 the choice is greedy; `max_tokens` is the number of decode steps the request may cost, each one a pass over the weights, chapter 7's step. A model's own request format exists too, and the recordings show two providers' native clients, one of which makes `max_tokens` mandatory; their advice, and the book's, is to use the one shared format, since the assistant's loop should not know which writer is behind it. Two more layers can sit between your code and the writer: a **router**, a remote service that takes one key and forwards each request to the provider named in the model string, and an **abstraction layer**, a library on your machine with one call for every provider. The recordings show one of each and treat the choice as a choice; the book does the same.

<details>
<summary>Optional: what one call costs, and the cache that makes the second one cheaper</summary>

One abstraction layer in the recordings prints the token count and the price of each call, and the recorded numbers are the scale to keep in mind: a short question answered in about a hundred tokens cost a small fraction of a cent, and the same question with the whole of a play pasted in as context, about 53,000 input tokens, cost half a cent. Asked a second time within minutes, the same 53,000-token request cost about a fifth as much, because most of the input tokens came back counted as cached: the provider had kept the processed prefix. The rule the recordings draw is the one that matters for chapter 6's assistant, whose every request begins with the same tool descriptions and system text: the cached part is the prefix, so the static content goes first and anything that changes per request, the date, the question, goes last. One provider caches automatically; another has to be told, charges more to write the cache and much less to read it. Chapter 7's price per token, in chapter 8's ledger, is the price after this.

</details>

## The loop's window: one callback

Chapter 6's loop takes a question and returns an answer. The interface library in the recordings, Gradio, needs exactly that: a Python function it may call when the user presses a button, a **callback**, with the inputs and outputs named. The library runs a local web server and renders the page; the function is passed, not called, and the library calls it.

```python
# illustrative, not executed
import gradio as gr
gr.Interface(fn=answer, inputs="textbox", outputs="textbox", flagging_mode="never").launch()
```

For a conversation the callback's shape is fixed by the library: it receives the new message and the history, the history in the same role-and-content list the chat endpoint takes, and it returns the reply. The recordings prepend the system message, since the window does not know there is one, strip the history down to role and content because some providers reject extra fields, and append the new message as the last user turn; that list is chapter 6's `messages`. Streaming is the same callback written as a generator: the request carries `stream=True`, each chunk's text is appended to the reply so far, and the reply so far is yielded, so the window redraws with the cumulative text rather than the pieces.

```python
# illustrative, not executed
def chat(message, history):
    history = [{"role": m["role"], "content": m["content"]} for m in history]
    messages = [{"role": "system", "content": SYSTEM}] + history + [{"role": "user", "content": message}]
    stream = client.chat.completions.create(model=MODEL, messages=messages, stream=True)
    reply = ""
    for chunk in stream:
        reply += chunk.choices[0].delta.content or ""
        yield reply

gr.ChatInterface(fn=chat, type="messages").launch()
```

Two switches in the recordings belong to chapter 5's side of the shop, not the customer's. `share=True` opens a public address through a tunnel back to the machine running the callback, for a week; `auth=("user", "password")` puts a login in front of the page. The recordings say what the book would say about both: the tunnel is for showing a colleague, not for serving, and a password in a source file is not a credential store.

## The three checks with a real tool-calling API

Chapter 6 explained tool calling without a provider: your code puts the tools' names and parameters into the prompt as text, and the writer, trained on that format, may reply with a request instead of an answer. The recordings make the same point with a bare prompt to a chat product, "you can fetch a ticket price by replying *use tool to fetch ticket price for* a city", and the product replies with exactly that line instead of an answer. Nothing runs inside the model. The model emits tokens that name a tool; your code reads them, runs the function, appends the result and calls the model again with the longer conversation. Every call is stateless, so the second call carries the whole history, including the request and its result. A provider's tool-calling API is that protocol with a fixed format, which is what makes the model reliable at emitting it: it was trained on a great deal of exactly this JSON.

The format has three parts. The tool description, sent with every request as the `tools` field, gives each function a name, a description, and its parameters with their types and which are required:

```python
# illustrative, not executed; chapter 6's three tools in the provider's format
tools = [{"type": "function", "function": {
            "name": "search",
            "description": "Find the catalogue chunks closest to the customer's question.",
            "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}},
         {"type": "function", "function": {
            "name": "get_price",
            "description": "The listed price of one product.",
            "parameters": {"type": "object", "properties": {"product": {"type": "string"}}, "required": ["product"]}}},
         {"type": "function", "function": {
            "name": "apply_coupon",
            "description": "Apply a coupon code to a product. Changes the price the customer pays.",
            "parameters": {"type": "object", "properties": {"product": {"type": "string"}, "code": {"type": "string"}},
                           "required": ["product", "code"]}}}]
```

The reply, when the model wants a tool, has a finish reason of `tool_calls` and a list of requested calls on the message, each with an identifier, a function name and a JSON string of arguments. And the result goes back as a message with the role `tool`, carrying the identifier of the call it answers, so that a reply with several requests gets several results and each is matched to its call.

Chapter 6's loop, rewritten against that API, keeps its three checks in their three places. The scripted writer becomes one request with `tools=tools`; the writer's request becomes `message.tool_calls`; the `messages.append` of a result becomes a `tool` message with the identifier. The schema check compares the requested name and its parsed arguments against the tools offered; the confirmation check refuses a write the customer has not confirmed in the interface; the dispatch table maps a name to a function and nothing is ever evaluated from text.

```python
# illustrative, not executed; chapter 6's run() against a tool-calling endpoint
def run(question, max_calls=5):
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
    for _ in range(max_calls):
        reply = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
        message = reply.choices[0].message
        if reply.choices[0].finish_reason != "tool_calls":
            return message.content                                              # an answer ends the loop
        messages.append(message)                                                # the request stays in the history
        for call in message.tool_calls:                                         # several requests in one reply
            name, params = call.function.name, json.loads(call.function.arguments)
            spec = next((t["function"] for t in tools if t["function"]["name"] == name), None)
            if spec is None or set(params) != set(spec["parameters"]["required"]):          # 1. schema
                result = f"refused {name}: not in the schema"
            elif name in WRITES and (name, json.dumps(params, sort_keys=True)) not in CONFIRMED:   # 2. confirmation
                result = f"refused {name}: write without confirmation"
            else:
                result = json.dumps(TOOLS[name](**params))                                   # 3. dispatch table
            LOG.append(result if result.startswith("refused") else f"ran {name}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
    return "(stopped: call budget spent)"
```

Three lines in that code are lessons the recordings paid for. The loop is a loop and not an `if`, because a model may ask for a second tool after seeing the first's result, and a single check handles one round and then stops; the recorded fix was to change `if` to `while` and to pass the tools on every call, not only the first. The inner `for` exists because a reply can request several tools at once, and code that reads only the first request fails on "which is cheaper, London or Paris". And `max_calls` is the guard the recordings call prudent: models rarely loop forever, and a loop that could is not one to ship. The recorded airline assistant, given the ticket-price tool, printed the tool's own trace, "tool called for city London", before answering that a ticket costs 799, and asked to check Paris only if London was under a thousand, it called London, then Paris, in order.

The recordings also name what changes with the writer. A 3-billion-parameter local model "gets quite confused with tool calling", and a somewhat larger open model does a decent job; the format is learned, and a model that saw little of it emits it badly. Chapter 6's coupon case reads the same against a real API. The seller's line in the kettle's sheet comes back inside a `tool` result; if the writer turns it into an `apply_coupon` request, the request arrives as a tool call like any other, and the second check refuses it because nobody confirmed that call in the interface. Whether the writer's final sentence then says the kettle is free is chapter 6's finding, not the API's: the checks govern the action, and only the golden set governs the sentence.

<details>
<summary>Optional: the system message that sets the loop's rules</summary>

The recorded assistant's system message is four short sentences: who the assistant is, that answers are short and courteous, that they are accurate, and that if it does not know the answer it says so. The last is the recordings' standard line against invented answers, and it belongs beside chapter 6's tool descriptions in the same first message. Examples of question and answer placed in that message, **multi-shot prompting** in the recordings, bias the writer toward the format shown; the cache fold above says why that text belongs at the start of the prompt and the customer's question at the end.

</details>

## Where it stops

Each part here stands in for a part the book built, and the book's measurements do not transfer to the stand-in. A local open-weight writer is a different writer, and it goes through chapter 6's golden set before it answers a customer; the recordings' own note that a small model is confused by tool calling is that measurement, unpriced. The interface library's callback is chapter 6's loop and inherits its guarantees and nothing more: a login on the page is not chapter 5's audit, and a public tunnel is not serving. The tool-calling API fixes the format the writer emits and the shape of the result; the three checks are still yours, and so is the finding that a refused action can still be described as done. What a provider adds beyond this format, managed tools that run code or browse on the provider's machines, is paid and provider-specific, which is the recordings' reason to stay with the shared chat format, and the book's. Nothing here ran; the appendix names which of chapter 6's lines each part replaces, so that when you run it, the checks are in the places the lab tested.

*Sources: AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents (Ed Donner, Udemy), lectures 1.1, 1.16, 1.19, 2.4, 2.5, 2.7–2.13 and 2.15–2.18, paraphrased as study material.*
