# On the Convergence of Stochastic Gradient Descent

**Abstract.** We study SGD with step size $\eta_t = \eta_0 / \sqrt{t}$ and prove an $O(1/\sqrt{T})$ rate.

## 1. Introduction

Let $f: \mathbb{R}^d \to \mathbb{R}$ be $L$-smooth. The iteration is

$$
x_{t+1} = x_t - \eta_t g_t, \qquad \mathbb{E}[g_t \mid x_t] = \nabla f(x_t).
$$

## 2. Main result

**Theorem 1.** Under assumptions A1–A3,

\[
\min_{t \le T} \mathbb{E}\|\nabla f(x_t)\|^2 \le \frac{C}{\sqrt{T}}.
\]

| Method | Rate | Reference |
|--------|:----:|-----------|
| SGD | $O(1/\sqrt{T})$ | [1] |
| Adam | $O(1/\sqrt{T})$ | [2] |

## References

1. Robbins, H. & Monro, S. (1951). A stochastic approximation method.
2. Kingma, D. & Ba, J. (2015). Adam: A method for stochastic optimization.
