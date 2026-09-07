# HTML table with merged cells

Raw HTML tables are not rendered until Phase 0b (raw HTML is disabled in the pipeline). This document must still render its Markdown parts.

<table>
  <tr><th colspan="2">Merged header</th></tr>
  <tr><td rowspan="2">Tall cell</td><td>r1</td></tr>
  <tr><td>r2</td></tr>
</table>

| Plain | Table |
|-------|-------|
| still | works |
