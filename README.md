# ASCII

**everything is characters** — a text-native generative art instrument, sibling to [Fluid](https://fluid.krackeddevs.com).

Where Fluid renders pixels (WebGL), ASCII renders **characters**. The character buffer is the source of truth, which unlocks things Fluid can't do: copy the live frame as text, export `.txt` / `.ans` (ANSI) / SVG / PNG / webm, braille-detail from media, and animated README banners.

- **Live (staging):** https://staging.ascii.krackeddevs.com
- **Status:** M0 — deployable skeleton (phosphor-CRT shell + one live ASCII effect). Roadmap M0–M5 in [PLAN.md](PLAN.md).

## Develop

```sh
npx wrangler dev      # worker + static assets locally
npm test              # smoke tests
```

One self-contained `index.html`. No build step, no runtime dependencies.

## Deploy

```sh
npx wrangler deploy --env staging   # → staging.ascii.krackeddevs.com
npx wrangler deploy                 # → ascii.krackeddevs.com (prod, after promote)
```

Staging-first: ship to staging, verify, then promote to prod.

## License

MIT.
