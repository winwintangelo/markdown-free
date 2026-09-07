# Images

Remote image (may be blocked offline):

![Remote](https://example.com/image.png)

Embedded SVG data image (allowed):

![Dot](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIvPjwvc3ZnPg==)

Disallowed data type (must be dropped):

![Bad](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)
