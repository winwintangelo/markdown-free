# Comprehensive Markdown Test Document

This document contains all common Markdown syntax elements for testing purposes.

## Headings

### Level 3 Heading
#### Level 4 Heading
##### Level 5 Heading
###### Level 6 Heading

---

## Text Formatting

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***.

You can also use __underscores for bold__ and _underscores for italic_.

Here's some ~~strikethrough text~~ and `inline code`.

---

## Lists

### Unordered List

- First item
- Second item
  - Nested item 2.1
  - Nested item 2.2
    - Deep nested item
- Third item

### Ordered List

1. First step
2. Second step
   1. Sub-step 2.1
   2. Sub-step 2.2
3. Third step

### Task List

- [x] Completed task
- [x] Another completed task
- [ ] Pending task
- [ ] Future task

---

## Links and Images

Here's a [link to Google](https://www.google.com).

Here's an auto-linked URL: https://www.example.com

Email link: <contact@example.com>

---

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> > Nested blockquotes are also possible.
>
> Back to the first level.

---

## Code Blocks

### Inline Code

Use the `console.log()` function to debug.

### Fenced Code Block (JavaScript)

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return {
    message: "Welcome",
    timestamp: new Date()
  };
}

greet("World");
```

### Fenced Code Block (Python)

```python
def calculate_fibonacci(n):
    """Calculate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print(calculate_fibonacci(10))
```

### Fenced Code Block (JSON)

```json
{
  "name": "markdown-free",
  "version": "1.0.0",
  "features": ["pdf", "docx", "html", "txt"],
  "settings": {
    "theme": "dark",
    "fontSize": 14
  }
}
```

---

## Tables

| Feature | PDF | DOCX | HTML | TXT |
|---------|:---:|:----:|:----:|:---:|
| Headings | ✓ | ✓ | ✓ | ✓ |
| Bold/Italic | ✓ | ✓ | ✓ | - |
| Code Blocks | ✓ | ✓ | ✓ | ✓ |
| Tables | ✓ | ✓ | ✓ | - |
| Images | ✓ | - | ✓ | - |

### Wide Table

| Column 1 | Column 2 | Column 3 | Column 4 | Column 5 |
|----------|----------|----------|----------|----------|
| Data A1 | Data A2 | Data A3 | Data A4 | Data A5 |
| Data B1 | Data B2 | Data B3 | Data B4 | Data B5 |
| Data C1 | Data C2 | Data C3 | Data C4 | Data C5 |

---

## Horizontal Rules

Above this line.

---

Below this line.

***

Another separator.

___

Final separator.

---

## Special Characters & Escaping

- Asterisks: \*not italic\*
- Underscores: \_not italic\_
- Backticks: \`not code\`
- Hash: \# not a heading
- Ampersand: Tom & Jerry
- Less than: 5 < 10
- Greater than: 10 > 5
- Quotes: "Hello" and 'World'

---

## Math & Technical Content

### Equations (if supported)

The quadratic formula: x = (-b ± √(b² - 4ac)) / 2a

Einstein's equation: E = mc²

### Technical Terms

- CPU: Central Processing Unit
- RAM: Random Access Memory
- API: Application Programming Interface
- JSON: JavaScript Object Notation

---

## Long Paragraph

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

---

## Footnotes (if supported)

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

---

## Summary

This document tests:
- ✅ All heading levels (H1-H6)
- ✅ Text formatting (bold, italic, strikethrough, code)
- ✅ Unordered, ordered, and task lists
- ✅ Nested lists
- ✅ Links (inline and auto-linked)
- ✅ Blockquotes (including nested)
- ✅ Code blocks (inline and fenced with language)
- ✅ Tables (simple and aligned)
- ✅ Horizontal rules
- ✅ Special character escaping
- ✅ Long paragraphs

---

*Document generated for Markdown Free testing purposes.*
**Last updated: January 2026**
