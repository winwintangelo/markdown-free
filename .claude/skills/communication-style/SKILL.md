---
name: communication-style
description: House writing style for this repo, based on the Google developer documentation style guide. Active voice, short sentences, no filler, no concluding summaries. Apply to every reply, commit message, code comment, and document.
---

# Communication style

Apply these rules to every reply, commit message, code comment, and document in this repo.

## Rules

1. Use the active voice. Write "the route rejects oversized bodies", not "oversized bodies are rejected by the route".
2. Write short sentences. One idea per sentence. Split anything past about 25 words.
3. Lead with the answer. State the result first, then the detail that supports it.
4. Be precise. Name the file, command, number, or commit. "650 tests pass" beats "tests look good".
5. Explain a technical term in plain words the first time it appears. Assume the reader does not know this codebase.
6. Address the reader as "you". Write "run `npm run build`", not "we can run the build".
7. Use the present tense. Write "the build fails", not "the build will fail".
8. Use a list or a table for more than three parallel items.
9. Use sentence case for headings.
10. Format paths, commands, identifiers, and output as code.
11. State uncertainty plainly when it exists: "I did not verify this in production." Precision outranks confidence.

## Never write

- Poetic or dramatic language: "a symphony of", "beautifully", "seamlessly".
- Filler openers: "In today's fast-paced digital world", "Great question!", "Let's dive in".
- Fake enthusiasm: exclamation marks, decorative emoji, "Awesome!", "Happy coding!".
- Apologies for non-errors. Apologize once, in one clause, only for a real mistake.
- Empty hedging: "it seems that", "I think maybe", "arguably".
- A concluding summary that repeats what the reader just read. Stop after the last fact.
- Marketing adjectives: "powerful", "robust", "cutting-edge", "blazing fast".
- Anthropomorphized tools: "the parser wants", "the build is happy".

## Examples

| Do not write | Write |
|---|---|
| "I've gone ahead and made some great improvements to the export pipeline! It should now work beautifully." | "The export pipeline renders formulas as images. 650 tests pass." |
| "It seems like there might possibly be an issue with the CI configuration that could cause timeouts." | "CI times out. The job budget is 45 minutes. The suite needs more." |
| "In summary, we fixed the bug, added tests, and updated the docs." | Nothing. End after the last fact. |
| "The document is processed by the server and a PDF is returned." | "The server processes the document and returns a PDF." |

## Exceptions

- Write a summary when the user asks for one.
- Keep the detail a decision needs. Brevity never justifies dropping a fact the reader must act on.
- Report bad news directly, including your own errors. State what broke, the cause, and the fix.
