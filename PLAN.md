# ASCII — Build Plan

> A text-native generative art instrument. Sibling to **Fluid**.
> **Domain:** [ascii.krackeddevs.com](https://ascii.krackeddevs.com)
> **Tagline:** *everything is characters.*

---

## Positioning

Fluid renders **pixels** (WebGL). ASCII renders **characters**.

The key difference is the source of truth. In Fluid, the GPU framebuffer is the
artwork — pixels are the only thing that exists. In ASCII, a **character buffer**
is the artwork; pixels are just one of several ways to display it.

Because the character buffer is the source of truth, ASCII unlocks superpowers
that Fluid structurally cannot do:

- **Copy-as-text** — select the art and paste it into a chat, a README, a terminal.
- **`.txt` / `.ans` export** — real text files and ANSI-colored terminal art.
- **Braille subpixel detail** — 2×4 dots per cell for high-resolution "vector" line art.
- **Animated README banners** — the same buffer that draws on screen serializes
  into a looping banner for a repo's front page.

Pixels remain available (PNG / webm) — but they are a *projection* of the buffer,
not the buffer itself.

---

## Architecture

### Char-buffer engine

The core data structure is a `cols × rows` grid of cells, each `{ char, color }`.

An **engine** is a pure-ish function:

```
engine(grid, t, params) → fills cells
```

It takes the grid, a time value `t`, and a params object, and writes a character
+ color into each cell. Engines never touch the DOM or the canvas — they only
shape the buffer. This keeps every superpower (copy, export, banner) downstream
of one shared representation.

### Live render — pre-baked glyph atlas

To display the buffer fast, every glyph in the active charset is **pre-baked once**
into an offscreen atlas (a sprite sheet of characters). Each frame, the renderer
**blits** the right glyph per cell, tinting it with that cell's color.

```
[ char-buffer ]  →  [ glyph atlas blit, per-cell color ]  →  [ <canvas> ]
```

Properties of this approach:

- **Fast** — blitting cached glyphs avoids per-frame text layout / `fillText`.
- **Per-cell color** — each cell tints independently (phosphor, gradient, source).
- **Dependency-free** — plain Canvas 2D, no libraries, no build step.

### Superpowers off the same buffer

Everything below reads the **one** char buffer:

| Output | What it is |
| --- | --- |
| Copy as text | Serialize `grid.char` rows → clipboard |
| `.txt` | Plain monospace text file |
| `.ans` | ANSI escape codes for color → terminal art |
| `.svg` | Vector `<text>` per cell (crisp at any size) |
| PNG | Rasterize the canvas |
| webm | Capture animated frames |
| README banner | Looping animated text/SVG banner for a repo |

---

## Generative engines

**Generative-led.** The v1 hero set is **donut · matrix · plasma** — three instantly
recognizable, demo-able effects.

| Engine | Description |
| --- | --- |
| **donut** | The classic `donut.c` rotating torus, brightness-ramped to chars. |
| **matrix** | Falling green katakana/glyph rain. |
| **plasma** | Sine-field plasma mapped to a charset ramp. |
| **life** | Conway's Game of Life. |
| **flow** | Curl-noise advection (particles drifting through a flow field). |
| **fire** | Classic demoscene fire (heat propagation upward). |
| **starfield** | Warp-speed star streaks. |
| **tunnel** | Rotating/zooming tunnel. |
| **ripple** | Pointer-reactive concentric ripples. |
| **automata** | Rule 110 (and friends) 1D cellular automata. |

---

## The palette is the charset

Where Fluid has a color palette, ASCII has a **charset ramp** — the ordered set of
characters from "empty/dark" to "full/bright."

| Ramp | Characters |
| --- | --- |
| **standard** | `` .:-=+*#%@`` |
| **blocks** | block-drawing glyphs (`░▒▓█`) |
| **braille** | 2×4 subpixel dots per cell (highest detail) |
| **dots** | sparse dot ramp |
| **katakana** | half-width katakana (matrix flavor) |
| **binary** | `0` / `1` |
| **custom** | user-supplied string |

### Color modes

| Mode | Look |
| --- | --- |
| **phosphor** | green CRT (default) |
| **amber** | amber CRT |
| **paper** | dark ink on light paper |
| **gradient** | a color palette mapped to the underlying field value |
| **source** | sample the color from input media (image/video/webcam) |

### Global CRT look

A post layer over the whole canvas:

- **bloom** (glow on bright glyphs)
- **scanlines**
- optional **curvature** (CRT screen bulge)

---

## Media modes (later)

Once the generative core is solid, the buffer becomes a destination for real media:

- **image upload** → ASCII
- **webcam** → ASCII (live)
- **video** → ASCII
- **edge-detection** ASCII (Sobel/Canny → line-art chars)

---

## Infrastructure (Master Lab spine — mirrors Fluid)

- **Single `index.html` studio** — no build step, the app is the file.
- **`worker.js`** — Cloudflare Worker serving static assets + security headers;
  later `/api` + `/mcp` + OG image + animated favicon.
- **`gallery.html` / `manual.html` / `dev.html`** — the supporting pages.
- **Append-only share-hash**, mirrored in the worker (same discipline as Fluid).
- **wrangler**: prod `ascii.krackeddevs.com` + staging `staging.ascii.krackeddevs.com`.
- **`.assetsignore`** excludes `.git` + `.wrangler` (PII / leak guard).
- **`node --test`** suite for the engine + serializers.
- **GitHub repo** — private until scrubbed for open source.
- **Vault map page** at `20_projects/experiments/ascii.md`.
- **Push-to-deploy** via `.github/workflows/deploy.yml`.
- **Likely sibling later:** an **`ascii-bg`** npm package (the `fluid-bg` analog —
  drop a live ASCII background into any page).

---

## Milestones

### M0 — scaffold · **← CURRENT**

Claim the ground and prove one effect runs on real infra.

- folder + `wrangler.jsonc` (prod + staging)
- `.assetsignore`
- worker skeleton (assets + security headers)
- studio shell with **one live ASCII effect**
- `deploy.yml`
- **deploy to staging to claim the subdomain**

### M1 — engine + renderer + look

A demo-able landing.

- char-buffer engine + glyph-atlas renderer + CRT look
- engines: **donut, matrix, plasma**
- charset picker
- color modes: **phosphor / amber / paper**
- pointer-reactive

### M2 — studio + export

- studio shell + controls + presets / looks
- share-hash + copy-as-text
- export: `.txt` / `.ans` / PNG / webm
- gallery / manual / dev pages

### M3 — more engines + media

- engines: life, flow, fire, starfield, tunnel, ripple, automata
- media modes: image, webcam → braille, video, edge-detect

### M4 — API + MCP + ship

- worker JSON API + MCP endpoint
- OG image rotation + animated favicon
- browser-test
- **promote staging → prod**

### M5 — `ascii-bg` package (optional)

- npm package: drop a live ASCII background into any page (the `fluid-bg` analog).

---

## Current milestone

**M0 — scaffold.** Stand up the folder, wrangler (prod + staging), `.assetsignore`,
a worker skeleton, a studio shell running one live ASCII effect, and `deploy.yml`;
then deploy to **staging** to claim `staging.ascii.krackeddevs.com`.
