### 1. Gut reaction after first read
Clean, grounding, and refreshingly direct about why RL optimization goes off the rails compared to supervised learning. Framing non-stationary targets as moving labels will click immediately for anyone who has watched recommendation model losses oscillate during online updates. But I immediately smelled hand-waving in how REINFORCE was casually dragged in without any policy-gradient mechanics, and doubted whether the code would actually deliver on the replay buffer claims.

### 2. What landed
- *"In a supervised dataset each target is fixed on disk. In this loop each target is computed from the network's own output, so every step toward the target moves the target."* Isolates the non-stationarity problem in two sentences without drowning in Bellman operator formalism.
- *"The target uses the best action in s′, not the action actually taken next, so the data can come from any exploratory behaviour and the update still estimates the value of acting greedily. That is what 'off-policy' means here."* Cuts straight to why off-policy learning works, explaining why Q-learning decouples data generation from target evaluation better than most textbooks do.
- The corridor propagation walk ($\alpha=1$) visually demystifies 1-step bootstrapping: watching information travel backward exactly one state per episode makes the theoretical lag visceral.

### 3. What didn't
- **Conflating Monte Carlo evaluation with REINFORCE:** *"REINFORCE scales each action's probability update by the same measured $G_t$ and inherits both properties."* and *"The exercise measures that difference."* The code never touches REINFORCE. It implements tabular Monte Carlo *policy evaluation* on a static policy. REINFORCE updates parameterized action probabilities via $\nabla_\theta \log \pi_\theta(a|s) G_t$. Passing off tabular value averaging as REINFORCE skips the entire policy-gradient mechanism.
- **Faking the replay demonstration:** The essay states *"The exercise measures that difference"* regarding replay buffers. Part C does not implement a replay buffer; it resets the RNG seed (`torch.set_rng_state`) to feed identical online steps to both algorithms. Showing Q-learning is off-policy is the mathematical prerequisite for replay, not an empirical test of replay memory.
- **Phantom versioning:** *"PyTorch 2.14, CPU, seed 0"*. PyTorch has never had a 2.14 release (it moved 2.1, 2.2, ..., 2.5). Passing off a non-existent version degrades technical credibility.
- **Arithmetic check:** The math holds up. At $\alpha=0.5$, Episode 4 gives $Q(S_0)=0.5 \times 0.9 \times 0.10125 = 0.0456$, and $Q(S_1..S_3) = [0.2531, 0.6187, 0.9375]$, which matched my manual calculations exactly.

### 4. Could I do the exercise with what is on the page, and would I know if I got it right?
Yes. The script has zero external dependencies outside PyTorch, avoids OpenAI Gym/Gymnasium bloat with a clean 10-line deterministic `step` function, and explicitly provides terminal printouts for Parts A, B, and C. You can run it immediately and verify every float.

### 5. What changed between read one and read two
On read one, the narrative felt tight: moving labels motivate bootstrapping, bootstrapping enables off-policy updates, and off-policy enables replay. On read two, I realized the author pulled a bait-and-switch: deep RL concepts (DQN target nets, experience replay, REINFORCE) are used to frame the narrative, but the code retreats entirely into tabular policy evaluation while asserting it has proven the deep RL claims.

### 6. One concrete thing I'd tell the author to change
Stop claiming the exercise implements or measures REINFORCE and replay buffers. Explicitly clarify that Part C demonstrates *off-policy value iteration versus on-policy Monte Carlo policy evaluation*, explain that this off-policy property is the mathematical license that *enables* replay in DQN, and correct "PyTorch 2.14" to a real release.
