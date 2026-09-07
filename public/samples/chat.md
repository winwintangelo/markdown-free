# Gradient descent — quick summary

Gradient descent minimizes a loss \( J(\theta) \) by stepping against the gradient:

\[
\theta_{t+1} = \theta_t - \eta \nabla_\theta J(\theta_t)
\]

where \( \eta \) is the learning rate. With a decaying step size \( \eta_t = \eta_0 / \sqrt{t} \) the method converges at rate \( O(1/\sqrt{T}) \).

## Variants

| Variant | Batch size | Best for |
|:--------|:----------:|---------:|
| Batch GD | all data | small datasets |
| Mini-batch SGD | 32–512 | most training |
| SGD | 1 | streaming data |

## Minimal implementation

```python
theta = init()
for step in range(1, T + 1):
    lr = eta0 / step ** 0.5
    theta -= lr * grad(theta)
```

> Tip: plot the loss curve — a rising loss usually means \( \eta_0 \) is too large.
