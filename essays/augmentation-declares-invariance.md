# Augmentation Is Telling the Model What Does Not Matter

You are training a classifier that sorts photographs of faces into three expressions: angry, happy and sad. It overfits, so you add the augmentation stack every tutorial shows: random rotation, random horizontal flip, random contrast, applied to the training images only. You retrain and validation accuracy drops from 75% to 54%. Nothing in the code is broken; each transform ran exactly as configured.

What went wrong is a claim. Every transform in a training pipeline asserts something about your labels, and one of the three asserted something your data does not support. This essay reads augmentation as a list of such claims and ends with a PyTorch run in which the same flip rescues one task and ruins another.

## A transform is a sentence about your labels

A training set is a list of pairs (x, y): an image and its label. An augmentation is a function T that changes the image. During training each pair is replaced, some of the time, by:

<p class="formula">(x, y) &nbsp;→&nbsp; (T(x), y)</p>

Read it term by term. x is the image as it was collected. T(x) is the same image after the transform: mirrored, turned, darkened. y is the label, and it appears unchanged on both sides of the arrow. That is the whole mechanism, and it is also a statement: *the correct label of T(x) is y*. Nothing checks the statement; the pair goes straight to the loss.

A transform can be wrong in two different ways.

**It can change the label.** Mirror a lowercase b and you get a d; turn a 6 through half a turn and you get a 9. The transform produces an image that belongs to another class and attaches the old label to it. The model is now shown the same picture under two labels, and no set of weights can fit both; the best the loss can reach on those pairs is a coin toss.

**It can keep the label but leave the world the model will serve.** A face lying on its side is still a happy face, so the label is right, but no validation image and no photo from the product looks like that. Every such pair spends training on inputs the model will never be asked about. This is what happened to the face classifier: the rotation range was wide enough to turn faces sideways and upside down, which one look at an augmented batch makes obvious.

An honest transform passes both tests. A quick check: a person looking at an augmented image should not be able to tell it was generated.

Two more pieces matter. Augmentation is applied to training batches only, with a fresh random draw each time an image is presented; the validation set stays as collected, because it stands in for the inputs you will actually get. And each transform carries its own probability p, the chance that it is applied to a given presentation, so a pipeline is a set of independent coin flips per image, per epoch. With p = 0.3 about three presentations in ten are transformed and seven pass through as the original.

## Worked example: one flip on a 3 × 3 grid, then how much it touches

The numbers below are the book's own. Take a 3 × 3 image of a hook: a bar across the top and a bar down the left side, 1 for ink and 0 for background. A horizontal flip reverses the order of the columns, so column 0 becomes column 2 and column 2 becomes column 0; the middle column stays.

<figure class="diagram">
<svg viewBox="0 0 520 220" width="100%" role="img" aria-label="A 3 by 3 hook glyph with ink in the top row and left column, and its horizontal mirror with ink in the top row and right column; under each, the label it gets in the shape task and in the facing task" style="max-width:520px;font-family:inherit;font-size:14px">
  <g fill="currentColor">
    <rect x="40" y="20" width="40" height="40"/><rect x="80" y="20" width="40" height="40"/><rect x="120" y="20" width="40" height="40"/>
    <rect x="40" y="60" width="40" height="40"/><rect x="40" y="100" width="40" height="40"/>
    <rect x="360" y="20" width="40" height="40"/><rect x="400" y="20" width="40" height="40"/><rect x="440" y="20" width="40" height="40"/>
    <rect x="440" y="60" width="40" height="40"/><rect x="440" y="100" width="40" height="40"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1">
    <rect x="40" y="20" width="120" height="120"/><rect x="360" y="20" width="120" height="120"/>
    <line x1="80" y1="20" x2="80" y2="140"/><line x1="120" y1="20" x2="120" y2="140"/><line x1="40" y1="60" x2="160" y2="60"/><line x1="40" y1="100" x2="160" y2="100"/>
    <line x1="400" y1="20" x2="400" y2="140"/><line x1="440" y1="20" x2="440" y2="140"/><line x1="360" y1="60" x2="480" y2="60"/><line x1="360" y1="100" x2="480" y2="100"/>
    <line x1="190" y1="80" x2="325" y2="80"/><polyline points="315,72 327,80 315,88"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="258" y="68" font-size="13">flip: reverse columns</text>
    <text x="100" y="170">shape task: hook</text><text x="100" y="195">facing task: right</text>
    <text x="420" y="170">shape task: hook</text><text x="420" y="195">facing task: left</text>
  </g>
</svg>
<figcaption>The hook [[1, 1, 1], [1, 0, 0], [1, 0, 0]] and its mirror [[1, 1, 1], [0, 0, 1], [0, 0, 1]]. The pixels are the same in both tasks; what the flip does to the label depends only on what the label means.</figcaption>
</figure>

Row by row, [1, 1, 1] stays [1, 1, 1]; [1, 0, 0] becomes [0, 0, 1], twice. Now attach two different labellings to the same images.

In the **shape task** the label says which glyph is drawn, a hook or some other shape. The mirrored hook is still a hook, so the pair (flipped hook, "hook") is true. If your training photos happened to show every hook facing right while real inputs face both ways, the flip supplies the half of the world your collection missed.

In the **facing task** the label says which way the glyph points. The mirrored right-facing hook is, pixel for pixel, a left-facing hook, and the flip hands it to the loss labelled "right". With p = 0.5 both directions arrive under both labels equally often, and nothing is left to separate them.

Now the scale of a claim. Suppose 1,000 training images, 20 epochs, and three independent transforms, each at p = 0.5.

| Quantity | Computation | Value |
|---|---|---|
| Presentations | 1,000 × 20 | 20,000 |
| Chance an image is left untouched | 0.5 × 0.5 × 0.5 | 0.125 |
| Untouched originals | 20,000 × 0.125 | 2,500 |
| Variants | 20,000 − 2,500 | 17,500 |
| Presentations carrying any one transform | 20,000 × 0.5 | 10,000 |

Seven of every eight images the model sees are variants, and each single transform touches half of everything. A wrong transform at p = 0.5 is not a small contamination to be averaged away; it is half the training signal.

The size of a transform is a claim too. Some frameworks express a rotation range as a fraction of a full turn rather than in degrees. A factor of 0.25 is 0.25 × 360 = 90°; a factor of 0.025 is 0.025 × 360 = 9°. Read one for the other and a "small" rotation becomes a quarter turn. For the face classifier, limiting rotation to ±9° turned the same stack from harmful to helpful: validation accuracy came back to about 78%, above the unaugmented 75%. The transform stayed; the claim shrank from "a face at any angle is this expression, and you will see such faces" to "a face tilted a few degrees is this expression", which is true and matches real photos.

## Auditing a task before you add a transform

Because the claim is about labels and inputs, the same transform gets a different verdict on each task. The table is the book's own starting judgement for four tasks, to be checked against your data. **Safe** means the label is unchanged and test inputs contain such variants; **unseen** means the label is unchanged but test inputs never look like that; **label** means the label can change or be destroyed; **look** means it depends on details only the data can show.

| Transform | Faces (expression) | Blood-cell microscopy | Handwritten digits | Road signs |
|---|---|---|---|---|
| Horizontal flip | safe | safe | label | label (arrows, text) |
| Vertical flip or 180° turn | unseen | safe | label (6 and 9) | label |
| Small rotation, ±10° | safe | safe | safe | safe |
| Crop to 80% | look | label | look | look |
| Brightness | safe | look | safe | safe |
| Grid shuffle, 3 × 3 cells | label | look | label | label |

Some cells follow from how the images are made. A microscope slide has no up, so every rotation and flip of a cell image is a view the microscope could have produced, and rotation keeps the regions that separate a parasitized cell from an uninfected one; a crop can cut exactly those regions out. Text and other asymmetrical objects fail the horizontal flip. The **look** cells are the honest ones: whether an 80% crop can remove the stroke that separates a 7 from a 1 depends on how the digits sit in their frames, and whether brightness carries stain information in a microscopy set depends on the staining. Settle those by viewing a batch of augmented images before training on them.

## Limits

A verdict can be true for most classes and false for a few. Horizontal flip is fine for a stop sign and wrong for a left-turn sign, so a road-sign pipeline either drops the flip or applies it per class, and applying it per class means the pipeline now depends on the label.

Spatial transforms in detection or segmentation have to move the bounding boxes or masks along with the image; a flipped image with unflipped boxes is a false pair of a different kind.

Mixing transforms such as mixup and cutmix make a different declaration altogether: they change the label along with the input, so the claim is no longer that the label is unchanged but that a blend of two inputs deserves the same blend of their labels.

And the table does not replace measurement. Add transforms one at a time and keep each only if validation improves; the exercise's last variation shows a true claim that buys nothing once the data already contains its variants.

<!--mission-->
## Exercise: one flip, two tasks

The script builds both tasks from the worked example in tensors, with nothing to download, and trains the same small convolutional model on each, with and without a random horizontal flip. It runs on a CPU in a few seconds.

```python
import torch
import torch.nn as nn

torch.manual_seed(0)

# Two 3x3 glyphs, each drawn facing right. torch.flip(..., dims=[-1]) makes them face left.
HOOK = torch.tensor([[1., 1., 1.],
                     [1., 0., 0.],
                     [1., 0., 0.]])
STEP = torch.tensor([[1., 0., 0.],
                     [1., 1., 0.],
                     [0., 1., 1.]])
GLYPHS = [HOOK, STEP]


def make_images(n, glyph_id, facing_left):
    """n noisy 8x8 images; each holds one glyph (index tensor) at a random position."""
    x = 0.2 * torch.rand(n, 1, 8, 8)
    for i in range(n):
        g = GLYPHS[glyph_id[i]]
        if facing_left[i]:
            g = torch.flip(g, dims=[-1])
        r, c = torch.randint(0, 6, (2,)).tolist()
        x[i, 0, r:r + 3, c:c + 3] += g
    return x


def dataset(task, n, train):
    glyph_id = torch.randint(0, 2, (n,))
    if task == "shape" and train:
        facing_left = torch.zeros(n, dtype=torch.bool)   # every training glyph was collected facing right
    else:
        facing_left = torch.rand(n) < 0.5                # validation, and the facing task: both ways
    x = make_images(n, glyph_id, facing_left)
    y = glyph_id if task == "shape" else facing_left.long()
    return x, y, facing_left


def random_hflip(x, p=0.5):
    """What RandomHorizontalFlip does to a batch: mirror each image with probability p, keep its label."""
    flip = torch.rand(x.shape[0]) < p
    x = x.clone()
    x[flip] = torch.flip(x[flip], dims=[-1])             # reverse the column order, i.e. mirror left-right
    return x


def train_and_validate(task, augment):
    torch.manual_seed(1)
    x_train, y_train, _ = dataset(task, 400, train=True)
    x_val, y_val, val_left = dataset(task, 1000, train=False)
    model = nn.Sequential(nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(),
                          nn.Flatten(), nn.Linear(8 * 8 * 8, 2))
    opt = torch.optim.Adam(model.parameters(), lr=1e-2)
    loss_fn = nn.CrossEntropyLoss()
    for epoch in range(30):
        order = torch.randperm(len(x_train))
        for start in range(0, len(order), 50):
            idx = order[start:start + 50]
            xb, yb = x_train[idx], y_train[idx]
            if augment:
                xb = random_hflip(xb)                    # training batches only, a fresh draw every time
            loss = loss_fn(model(xb), yb)
            opt.zero_grad()
            loss.backward()
            opt.step()
    model.eval()
    with torch.no_grad():                                # validation is never augmented
        correct = (model(x_val).argmax(dim=1) == y_val).float()
    return round(correct.mean().item(), 3), round(correct[val_left].mean().item(), 3)


x = HOOK.reshape(1, 1, 3, 3)
print("hook:", HOOK.tolist())
print("flipped:", torch.flip(x, dims=[-1])[0, 0].tolist())

for task in ("shape", "facing"):
    (plain, plain_left), (flipped, flipped_left) = [train_and_validate(task, a) for a in (False, True)]
    print(f"{task:6s} task, validation accuracy [no flip, flip]: {[plain, flipped]}"
          f"   on left-facing images only: {[plain_left, flipped_left]}")
```

What each part does:

- **`HOOK` and `STEP`** are the two glyphs, drawn facing right. `torch.flip(g, dims=[-1])` reverses the last dimension, the columns, which is the worked example's flip; the first two printed lines show the hook before and after.
- **`make_images`** paints one glyph per image onto noise at a random row and column, so the model cannot rely on a fixed pixel position.
- **`dataset`** is the only place the tasks differ: the label is either the glyph's identity or its direction. The shape task's training set faces right only, a stand-in for a collection that under-samples one orientation.
- **`random_hflip`** is what a library flip transform does under the hood: one coin per image with probability p, a mirror for the images that come up heads, and the labels untouched. It never receives the label, so it has no way to check its claim.
- **The training loop** is ordinary: shuffle, batches of 50, cross-entropy, Adam. The flip sits inside the loop, so each epoch draws new coins.
- **Validation** runs under `torch.no_grad()` with no augmentation, and the script reports accuracy overall and on left-facing validation images alone, the half that the shape task's training set never contained.

**Expected result.** Run with PyTorch 2.14 on a CPU; the full output is in the essay's corpus. The hook prints as `[[1.0, 1.0, 1.0], [1.0, 0.0, 0.0], [1.0, 0.0, 0.0]]` and flips to `[[1.0, 1.0, 1.0], [0.0, 0.0, 1.0], [0.0, 0.0, 1.0]]`. The shape task prints `[0.762, 1.0]`, and on left-facing images `[0.531, 1.0]`: without the flip the model is near a coin toss on the orientation it never saw; with it, every validation image is right. The facing task prints `[1.0, 0.492]`, and on left-facing images `[1.0, 0.513]`: the task is easy until the flip makes the two classes identical in training, and then accuracy falls to chance. Changing the per-run seed from 1 to 2, 3, 4 or 5 moves the no-flip shape number between 0.695 and 0.818 and leaves the pattern as it is.

Then change one line: in `dataset`, let the shape task's training set face both ways. Both shape runs now print `[1.0, 1.0]`. The flip stops helping because there is no longer a missing half for it to supply; its claim is still true, but the data already says it.

In a torchvision pipeline the same claims are written as a composed list of transforms:

```python
# illustrative, not executed; API as of the time of writing
import torch
import torchvision.transforms.v2 as T

train_transforms = T.Compose([
    T.RandomHorizontalFlip(p=0.5),      # the claim: a mirror image has the same label
    T.RandomRotation(degrees=10),       # the claim: a tilt from -10 to +10 degrees has the same label
    T.ToImage(),
    T.ToDtype(torch.float32, scale=True),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
val_transforms = T.Compose([T.ToImage(), T.ToDtype(torch.float32, scale=True),
                            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])
```

`RandomHorizontalFlip(p=0.5)` is `random_hflip` above, applied per image as it is loaded. `RandomRotation(degrees=10)` draws an angle from the range −10° to +10° for each image; a single number here is degrees, not a fraction of a turn. The random transforms come before conversion and normalisation, and the validation list has none of them.

*Sources: the Deep Learning Masterclass with TensorFlow 2 (Neuralearn.ai, Udemy), lectures 8.3, 8.5, 11.2 and 11.4, paraphrased as study material; Aurélien Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch, chapter 12, the data augmentation sidebar and the transfer-learning section (printed pp. 438 and 462–463); torchvision documentation for RandomRotation, as of 2026-09-13.*
