# Tables that are not quite tables

No separator row (not a table at all):

| A | B |
| 1 | 2 |

Ragged rows:

| A | B | C |
|---|---|---|
| 1 |
| 1 | 2 | 3 | 4 |

Pipes inside code, and an escaped pipe:

| Cell | Meaning |
|------|---------|
| `a \| b` | pipe in code |
| \| | a bare pipe |

A header with no body:

| Head |
|------|

Text after the tables must still render.
