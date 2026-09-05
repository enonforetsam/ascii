# Engines

ASCII keeps a `cols × rows` character buffer as the source of truth and draws it to a
canvas from a pre-baked glyph atlas. An engine is anything that fills that buffer each
frame. There are 12 generative engines; `image` and `words` are their own modes and
sit outside the registry.

## The buffer

Two typed arrays, both `gridN = cols * rows` long, indexed `y * cols + x`:

| array | type | meaning |
|---|---|---|
| `lum` | `Float32Array` | intensity per cell, `0..1`. The charset ramp maps it to a glyph. |
| `glyph` | `Uint32Array` | a forced code point per cell; `0` means "derive from `lum` via the ramp". |

An engine writes `lum` (and `glyph` when it wants a specific character, as matrix rain
does). The renderer never reads anything else, which is why every engine's output can be
copied as text, exported as `.txt` / `.ans`, or re-rendered at any cell size.

## The registry

Every generative engine is one entry in `ENGINES` (search `CENTRAL ENGINE REGISTRY` in
`index.html`):

```js
var ENGINES = {
  donut: { obj: Donut, tilt: true, sp: true, settle: function () { Donut.setTime(1.2); Donut.render(0, 0, 0); } },
  //      ^module      ^takes tilt ^advances by dt*speed   ^one deterministic static frame (for stills + swatches)
  …
};
```

| field | meaning |
|---|---|
| `obj` | the engine module: an object with `render(...)`, optionally `reset()`, `setTime(t)`, `settle()` |
| `tilt` | `true` when `render(dt, tiltX, tiltY)` takes the pointer tilt (the 3D solids) |
| `sp` | `true` when the engine advances by `dt * state.speed`; `false` when it steps a fixed amount per frame (life, fire, stars, tunnel) |
| `settle` | draws one stable frame with no animation, used for the gallery stills and the look swatches |

`step()`, `renderStaticFrame()` and `resetAllEngines()` all read this table, and a boot
assertion checks that the engine tabs in the HTML match its keys, so an engine cannot be
half-registered.

## Writing one

1. Write the module next to the others. The minimum is `render`:

   ```js
   var Ripple = (function () {
     var t = 0;
     function reset() { t = 0; }
     function setTime(v) { t = v; }
     function render(dt) {
       t += dt;
       var cx = cols / 2, cy = rows / 2;
       for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
         var d = Math.hypot((x - cx) * 0.5, y - cy);   // cells are ~2:1, halve x
         lum[y * cols + x] = 0.5 + 0.5 * Math.sin(d * 0.6 - t * 3);
       }
     }
     return { render: render, reset: reset, setTime: setTime };
   })();
   ```

   Use `rng()` (the seeded generator) rather than `Math.random()` so a seed reproduces
   the same frame; `reseed()` runs whenever the visitor reseeds.

2. Register it:

   ```js
   ripple: { obj: Ripple, tilt: false, sp: true, settle: function () { Ripple.setTime(2); Ripple.render(0); } },
   ```

3. Add a tab in the ENGINE group (`<button data-engine="ripple">ripple</button>`). The boot
   assertion will warn if the two lists drift.

4. Run `npm test`. Then open `index.html`, pick the engine, try every charset and the
   image / words modes are unaffected.

Keep it under 60 lines and dependency-free. If it needs state across frames, keep it in
the module closure and reset it in `reset()`. Cells are roughly twice as tall as they are
wide; scale x by `0.5` for anything circular.
