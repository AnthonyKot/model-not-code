## 1. Gut reaction after first read

I finally have something concrete to inspect: what gets updated, what it reads, and when that read happens. The corridor made sense to me as an ordering problem. But the opening promises an explanation of unstable network training, while most of the evidence comes from a deterministic table; I finished understanding the table better than the network.

## 2. What landed — specific passages

“Within an episode S1 is updated before S2” is the sentence that made the example click. I can trace those reads and writes exactly as I would trace mutable state in a service.

“One real reward plus a guess for everything after” gives me a usable interpretation of the target before asking me to manipulate it.

The frozen target network and “bounded store of past transitions” also landed. Those are concrete engineering changes: maintain another snapshot, decide when to refresh it, retain historical records, sample batches. That answers some of my actual question about what changes in the system.

## 3. What didn't

“That … separates the two families of reinforcement learning” left me with a classification I no longer trusted by the end. The next section uses Monte Carlo to learn a **value table**, although the introduction associates measured returns with policy gradients. Are we comparing what the model outputs, or how we construct its learning signal? I need those distinguished.

“A gradient step that raises the estimate for one state also raises it for states with similar inputs” sounds more guaranteed than the explanation establishes. I understand shared parameters can affect several outputs. I cannot infer that those changes always have the same direction.

“And it cannot replay” also reads like an absolute architectural prohibition. The reason given explains why an old return belongs to an old policy; it does not show me why that mismatch could never be accounted for.

The arithmetic held up. I got returns of 1, 0.9, 0.81, and 0.729 working backward. With α = 0.5, I got S1 = 0.10125 after episode 3, then S0 = 0.0455625 after episode 4. My episode-12 S0 value was approximately 0.675786, matching 0.6758.

## 4. Could I do the exercise with what is on the page, and would I know if I got it right?

I could copy and run it once PyTorch was installed, and the supplied outputs give me useful checks. I could also reproduce Parts A and B with a pen.

Part C asks more of me. “Iterate the Bellman expectation to a fixed point” introduces the reference calculation without explaining why its weighted recurrence gives the desired answer. I can follow the assignment statements, but reproducing code is weaker than independently checking its oracle.

I also would not have implemented or inspected a policy-gradient update by the end. The exercise compares two table updates, despite the repeated REINFORCE claims.

## 5. What changed between read one and read two

Initially I read Part C as a race between two estimators. On rereading, I realised they are estimating different policies. The gap is therefore evidence about what each update means, not evidence that Monte Carlo is simply worse.

## 6. One concrete thing I'd tell the author to change

Replace the opening classification with an explicit distinction between **what is learned**—action probabilities or values—and **how the learning signal is obtained**—measured returns or bootstrapped estimates. Then identify REINFORCE and Q-learning as the particular examples being compared.
