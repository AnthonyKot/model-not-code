# Appendix C. Shipping the Classifier: ONNX Runtime, FastAPI, TensorBoard and a Page for the Reviewers

*As of: the recordings this appendix follows are from a TensorFlow course and export a different, larger image classifier; the appendix applies their steps to chapter 2's classifier in PyTorch 2.14.0, with onnx 1.23.0 and onnxruntime 1.30.0 installed by pip, the library's legacy exporter and opset 17. The export and its check were run on a CPU and their output is in the book's corpus; the serving endpoint, the profiler and the reviewers' page were not run, since their libraries are not installed on the book's machine, and their code is illustrative. The two timings are measured and vary.*

Chapter 2 trained a photo classifier and chose its blade threshold on validation listings; chapter 5 put the trained weights, the threshold, the category names, the alarm and its level into one release bundle, reloaded it and checked that the reloaded flags were identical. This appendix takes that bundle the rest of the way to a running service and shows, on a real export, where the boundary of chapter 5's bundle falls, the released function chapter 5 lists as weights, preprocessing, threshold, category names and the code that joins them: what a portable graph of the model carries, and what it does not, which is exactly the part the service has to carry itself. Then it puts the graph behind an HTTP endpoint with the preprocessing written beside it, looks at what a profiler shows about a training run's input pipeline, and sketches the page chapter 5's reviewers would use to check a flag.

## What the graph carries, and what the bundle carried

An exchange format for models, ONNX in the recordings, stores a computational graph: the operations in order, their weights, and named inputs and outputs. The point of it is portability. The graph is produced from the framework that trained the model and run by a separate engine, ONNX Runtime, which executes it on whatever hardware it is given through an **execution provider**, CPU here, and can be called from a language other than the one the model was trained in. The export takes the trained model, one example input of the right shape, names for the input and output, and a declaration of which axes may vary, the batch axis here:

```python
dummy = torch.zeros(1, 1, S, S)                        # one 12 x 12 photo, one channel
torch.onnx.export(live, dummy, "classifier.onnx", input_names=["photo"], output_names=["logits"],
                  dynamic_axes={"photo": {0: "batch"}, "logits": {0: "batch"}}, opset_version=17, dynamo=False)
```

Run on chapter 5's bundle, the export is small enough to read whole. The graph has seven nodes, the convolution, its activation, the maximum over the map and its matrix product, a flatten and its matrix product, and the add that joins them, which is chapter 2's `forward` in order, and six weight tensors, the classifier's weights and biases. The bundle and the graph do not hold the same things:

| | In chapter 5's bundle (`release.pt`, 60,741 bytes) | In the exported graph (`classifier.onnx`, 38,773 bytes) |
|---|---|---|
| The classifier's six weight tensors | yes | yes |
| The blade threshold, 0.05 | yes | no |
| The category names | yes | no |
| The four-photo mean that makes a listing's score | in the lab's `blade_score` function, not in the bundle either | no |
| The autoencoder and its alarm level | yes | no |
| The version string | yes | no |

The graph is the model and only the model. Everything the release decision depended on, the threshold chosen on validation with chapter 2's prices, the rule that a listing's score is the mean of its four photos, the alarm that watches the inputs, lives outside it, and a service built on the graph alone has silently dropped all of it. That is the boundary of chapter 5's bundle, seen from the other side: the bundle exists because the model file is not the release.

Two things do ride with the graph and are worth knowing by name. The **opset** version, 17 here, names the set of operations the runtime has to implement, so a runtime older than the opset refuses the file rather than running it wrong. And the **dynamic axis** declared at export, the batch, is the only dimension a request may vary; a service that sends one photo, four, or forty is within the contract, and one that sends a photo of another size is not, and finds out at the call.

<details>
<summary>Optional: the export script, and reading the graph back</summary>

The script that produced the numbers in this appendix imports chapter 5's definitions unchanged, regenerates chapter 5's validation listings from the same seeds, loads `release.pt`, exports, and reads the graph back with the format's own library to list its nodes, weights and names. The recorded export names its input `pixel_values` and its output `logits`, sets a dummy batch of one, declares the batch axis dynamic and uses opset 14; the appendix's differs only in the input name, the photo shape and the opset. The exporter used is the library's older, TorchScript-based one, selected explicitly so that the graph is the same on every run; the newer exporter is the default in the installed version and prints a deprecation notice for the old one.

</details>

## The reload test, made real

Chapter 5's reload test loaded the bundle and checked that the flags on the validation listings were identical to the ones computed before saving. The same test against the graph is the check that the served function is the saved one, and it needs the served function to be written first: the graph gives logits per photo, and the softmax, the mean over four photos and the threshold are code beside it.

```python
session = ort.InferenceSession("classifier.onnx", providers=["CPUExecutionProvider"])
def served_blade_score(photos):                            # photos: numpy [4n, 1, S, S] float32
    logits = session.run(None, {"photo": photos})[0]
    p = np.exp(logits - logits.max(1, keepdims=True)); p /= p.sum(1, keepdims=True)   # softmax
    return p.reshape(-1, 4, 4).mean(1)[:, 3]               # chapter 5's blade_score: the four-photo mean
```

On the 500 validation listings, 2,000 photos, the largest difference between the saved model's logits and the graph's is 4.77 × 10⁻⁶, the largest difference in a listing's blade score 1.19 × 10⁻⁷, and at the threshold of 0.05 both flag the same 68 listings. That is the number the reload test printed for the bundle, `reloaded flags identical: True`, now printed for the service. The differences are float arithmetic done in a different order by a different engine; they are far below anything the threshold can see, and the check is that they stay there.

The recordings carry a slip that the same test catches. Their preprocessing rescales pixels by dividing by 225 in one place and 255 in another, and neither applies the normalisation the model was trained with. Chapter 2's photos need no rescaling, so the appendix inserts the slip deliberately: the same 2,000 photos multiplied by 255/225, as if the service divided by 225 where training had divided by 255, and the graph flags 61 listings instead of 68. The model did not change; the flag count fell by seven because the service fed it something training never saw. The check that the served flags equal the saved flags is the only line that would have caught it, which is why it belongs in the service's tests and not in a notebook.

One listing of four photos takes about 0.19 ms through the saved model and about 0.08 ms through the runtime on this CPU, measured and varying by machine; at chapter 5's 1,000 listings a week, either is nothing. The runtime's advantage is not speed here but the two things the graph bought: a service that installs the runtime and nothing of the training stack, and one file whose contents can be listed.

## The endpoint, with the preprocessing beside it

The recordings serve the graph behind an HTTP endpoint with FastAPI: the runtime session is created once when the application starts, through a lifespan handler, and reused for every request rather than rebuilt per call; a `GET` at the root says the service is live; a `POST` takes an uploaded file, preprocesses it in code written in the same file, runs the session and returns the predicted index. The appendix's version returns what the shop's review queue needs, and reads the threshold from the bundle so that the service and the release cannot disagree about it:

```python
# illustrative, not executed
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile
state = {}

@asynccontextmanager
async def lifespan(app):
    state["session"] = ort.InferenceSession("classifier.onnx", providers=["CPUExecutionProvider"])
    bundle = torch.load("release.pt")                      # the threshold and the version come from the release
    state["threshold"], state["version"] = bundle["blade_threshold"], bundle["version"]
    yield
    state.clear()

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def live():
    return {"status": "live", "version": state["version"]}

@app.post("/flag")
async def flag(listing: UploadFile):
    photos = preprocess(await listing.read())             # four photos -> float32 [4, 1, S, S], as training saw them
    score = float(served_blade_score(photos)[0])
    return {"blade_score": score, "flag": score >= state["threshold"], "version": state["version"]}
```

Three things in that sketch are the appendix's and not the recordings'. The threshold is read from the bundle, not typed into the service. The version is returned with every answer, so that a flag in the reviewers' records can be traced to the release that made it. And `preprocess` is the function the check above tested, on the photos the check used, before the endpoint existed. The recordings' endpoint returns an index and nothing else, and its preprocessing is where their slip lives.

<details>
<summary>Optional: the recorded service, step by step</summary>

A virtual environment with the runtime, the web framework, a multipart parser for uploads, and an image library; a module-level session variable set inside the lifespan handler and cleared after it yields; a preprocessing function that opens the bytes as an image, converts to RGB, resizes to the training size, moves the channel axis first, adds the batch axis and rescales; an `infer` route that returns an error if the session is missing, reads the upload, preprocesses, runs and returns the argmax; a root route that answers "the API is live"; the server started with auto-reload; and the framework's generated documentation page, where an upload field appears only once the parameter is declared as an upload file. The recording tests it with one image and reads back index 0, the healthy class.

</details>

## What a profiler shows about a training run

The recordings profile a training run with TensorBoard's profiler and read its overview page: the average step time split into input time, compute time and the rest, and a summary that says where to look first. In the recorded run the input pipeline took 68.4% of the step, the tool's first recommendation was to reduce it, and its breakdown put the time in the dataset's map and batch stages rather than in reading files. That is chapter 2's lab setup measured by a tool instead of by its four step timings against a forecast: the accelerator waits on the loader, and the remedy is more loading parallelism or preprocessing done once, offline. The same page showed that none of the device computation was in 16-bit arithmetic and suggested mixed precision, which is a different lever, and a trace viewer that shows every operation in one step on a timeline, with a ruler to time any of them.

In PyTorch the equivalent is the built-in profiler, which records the same timeline for a few steps and writes it for the same viewer; the appendix does not run it, since the viewer is a separate install. What it would show for chapter 2's lab is what the lab's own step timings already show, which is the point: a profiler is the loader's time and the step's time taken at every operation, and it earns its place when the two timings disagree with the intuition, not before.

```python
# illustrative, not executed
from torch.profiler import profile, ProfilerActivity, schedule, tensorboard_trace_handler
with profile(activities=[ProfilerActivity.CPU], schedule=schedule(wait=1, warmup=1, active=3),
             on_trace_ready=tensorboard_trace_handler("runs/chapter-2")) as prof:
    for idx in torch.randperm(len(x)).split(64):
        opt.zero_grad(); loss_fn(net(x[idx]), y[idx]).backward(); opt.step()
        prof.step()
```

## A page for the reviewers

Chapter 5's reviewers see a flagged listing and say whether it is a blade; the audit samples unflagged ones for the same question. The recordings build the smallest possible version of that page with Gradio: an image upload, a function that runs the model, and a label as the output.

```python
# illustrative, not executed
import gradio as gr
def review(photos):
    score = float(served_blade_score(preprocess(photos))[0])
    return {"blade score": round(score, 3), "flag": score >= THRESHOLD, "version": VERSION}
gr.Interface(fn=review, inputs=gr.Image(type="pil", label="The listing's photos"),
             outputs=gr.JSON(label="What the classifier said"), title="Blade check").launch()
```

The recordings stop at the label. The shop's page needs one more field, the reviewer's own verdict, recorded where chapter 5's reviewers' and auditors' verdicts are kept: without it the page shows the model's answer and records nothing, and the audit that separates fewer blades from more misses has no data. The recordings also score their model on a test set and draw a confusion matrix that shows no errors at all, which they read as success; on the shop's terms it is a test set too easy or too small to say anything, and chapter 2's standard error on 19 blades is the reason.

## Where it stops

The graph is the model and not the release; the service is the graph plus the preprocessing, the threshold, the four-photo rule and the version, and every one of those is a line the check in this appendix has to cover. The check was run on chapter 2's synthetic photos, where preprocessing is the identity and the model is seven nodes; a real classifier has a preprocessing pipeline of its own, and the recordings show how easily one number in it goes wrong. The endpoint and the reviewers' page were not run. The profiler shows where a step's time goes and nothing about whether the model is right, which is chapter 2's question and then chapter 5's. And chapter 8's ledger prices the review queue this page feeds, 2 per false flag, which no export changes.

*Sources: Deep Learning Masterclass with TensorFlow 2 Over 20 Projects (Neuralearn.ai, Udemy), lectures 18.2, 18.3, 17.4 and 10.5, paraphrased as study material; the export, its check and the timings are the book's own run, in the corpus.*
