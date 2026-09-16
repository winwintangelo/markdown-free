# Diagrams that cannot render

A syntax error (unclosed bracket):

```mermaid
flowchart LR
    A[Start --> B
```

An unknown diagram type:

```mermaid
floowchart TD
    A --> B
```

An empty fence:

```mermaid
```

One that works, so a partial failure stays partial:

```mermaid
flowchart LR
    Good --> Fine
```

Text after the diagrams must still render.
