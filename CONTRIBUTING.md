# Contributing to ASCII

ASCII is one HTML file. No build step, no bundler, no dependencies. Open `index.html`
in a browser and you are running the current source.

## Ways in

- **A new engine** is the best contribution: about 30 to 60 lines that fill the character
  buffer. [docs/ENGINES.md](docs/ENGINES.md) walks through it.
- **A new charset** is a string ordered dark → light plus a name in the CHARSET group.
- **A look** is a preset: engine, charset, palette, cell size, contrast. Add it to the
  LOOKS list and it appears as a swatch.
- **Bugs**: open an issue with the share link (`#p=…`) that reproduces it.

## Rules of the file

- The character buffer (`lum`, `glyph`) is the source of truth. Engines write it; the
  renderer reads it; nothing else touches the canvas.
- The share hash `#p=` is append-only. Add fields at the end, never reorder.
- `worker.js` mirrors the looks and the share hash for previews. Change them together.
- Stay ES5-compatible in `index.html` (the file has to run from `file://` in old browsers too).

## Before you open a PR

```sh
npm test          # smoke tests: package, wrangler config, assets ignore, HTML sanity
```

Then load `index.html`, switch through every engine and mode once, and paste a share
link in the PR so a reviewer can see what you saw.

By contributing you agree your work is released under the MIT licence.
