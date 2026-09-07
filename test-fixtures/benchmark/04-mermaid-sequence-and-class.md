# Mermaid: sequence and class diagrams

```mermaid
sequenceDiagram
    participant U as User
    participant S as Site
    U->>S: paste markdown
    S-->>U: preview
    U->>S: export
    S-->>U: file
```

Two diagrams in one document:

~~~mermaid
classDiagram
    class Document {
      +String title
      +render()
    }
    class Exporter {
      +toPdf()
    }
    Document --> Exporter
~~~

Done.
