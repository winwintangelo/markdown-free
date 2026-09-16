# Pathological but legal input

Unclosed emphasis: *not italic and **not bold

Unclosed link: [text](http://example.com

Injection attempts that must never execute: <script>window.__pwned = 1</script>
and <img src=x onerror="window.__pwned = 2"> and [click](javascript:window.__pwned=3)

Deep nesting:

- 1
  - 2
    - 3
      - 4
        - 5
          - 6
            - 7

A very long line: lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum.

Text after the nesting must still render.

An unclosed code fence closes the document:

```js
console.log("this fence never closes");
