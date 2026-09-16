# 壊れた入力 · 깨진 입력 · 损坏的输入

A diagram with CJK labels and a syntax error:

```mermaid
flowchart LR
    A[開始 --> B[終了]
```

A formula with CJK text and an undefined command: $\text{面积} = \notacommand{r}$

Valid CJK content must still render: 你好，世界！こんにちは。안녕하세요.

Right-to-left after a failure: مرحبا بالعالم — שלום עולם

| 语言 | 状態 |
|:-----|-----:|
| 中文 | 正常 |
| 日本語 | 正常 |

Text after everything must still render.
