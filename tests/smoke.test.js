// ASCII — M0 smoke tests. Dependency-free. Run: node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
// strip /* */ and // comments, but never touch `://` (protects https://)
const stripJsonc = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

test('package.json is valid and named ascii', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.strictEqual(pkg.name, 'ascii');
  assert.ok(pkg.scripts.deploy, 'has a deploy script');
  assert.ok(pkg.scripts['deploy:staging'], 'has a staging deploy script');
});

test('wrangler.jsonc parses and targets the right domains', () => {
  const wr = JSON.parse(stripJsonc(read('wrangler.jsonc')));
  assert.strictEqual(wr.main, 'worker.js');
  assert.strictEqual(wr.assets.run_worker_first, true);
  assert.strictEqual(wr.routes[0].pattern, 'ascii.krackeddevs.com');
  assert.strictEqual(wr.env.staging.routes[0].pattern, 'staging.ascii.krackeddevs.com');
});

test('.assetsignore guards against leaking secrets/build files', () => {
  const lines = read('.assetsignore').split('\n').map((l) => l.trim());
  for (const must of ['.git', '.wrangler', '.dev.vars', 'worker.js', 'wrangler.jsonc', 'node_modules']) {
    assert.ok(lines.includes(must), `.assetsignore must exclude ${must}`);
  }
});

test('worker.js exports a fetch handler', () => {
  const w = read('worker.js');
  assert.match(w, /export default/);
  assert.match(w, /async fetch/);
});

test('index.html is self-contained and on-brand', () => {
  const html = read('index.html');
  assert.match(html, /everything is characters/);
  const scripts = html.match(/<script>/g) || [];
  assert.strictEqual(scripts.length, 1, 'exactly one bare <script> block');
  assert.ok(
    !/https?:\/\/(cdn|unpkg|jsdelivr|fonts\.googleapis|fonts\.gstatic|ajax)/i.test(html),
    'no external CDN/font references'
  );
});

test('the inline script parses (Function constructor)', () => {
  const html = read('index.html');
  const body = html.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.doesNotThrow(() => new Function(body), 'inline script must parse');
});

test('M2: full-state hash keys are wired', () => {
  const html = read('index.html');
  // readHash handles every key
  for (const k of ["'e'", "'c'", "'k'", "'sp'", "'ce'", "'ct'", "'sd'"]) {
    assert.ok(html.includes(k), `readHash/writeHash references ${k}`);
  }
  // append-only: legacy single-key hashes still present in writer order
  assert.match(html, /\['e', 'c', 'k', 'sp', 'ce', 'ct', 'sd'\]/);
});

test('M2: studio superpowers present', () => {
  const html = read('index.html');
  assert.match(html, /function gridToText\(/, 'gridToText exists');
  assert.match(html, /function gridToAnsi\(/, 'ANSI export exists');
  assert.match(html, /\\x1b\[38;2;/, 'ANSI truecolor escape');
  assert.match(html, /function mulberry32\(/, 'seeded PRNG exists');
  assert.match(html, /canvas\.captureStream/, 'webm capture');
  assert.match(html, /new MediaRecorder/, 'MediaRecorder used');
  assert.match(html, /toBlob\(/, 'png export');
  assert.match(html, /navigator\.clipboard/, 'clipboard copy');
  assert.match(html, /execCommand\('copy'\)/, 'clipboard fallback');
});

test('M2: LOOKS / ACTIONS / EXPORT groups + toast in the rail', () => {
  const html = read('index.html');
  for (const id of ['seg-looks', 'act-copy', 'act-share', 'act-shuffle',
                    'exp-txt', 'exp-ans', 'exp-png', 'exp-rec', 'id="toast"']) {
    assert.ok(html.includes(id), `markup includes ${id}`);
  }
  for (const look of ['Neo', 'Solaris', 'Blueprint', 'Mono', 'Signal', 'Ember']) {
    assert.ok(html.includes('data-look="' + look + '"'), `look chip ${look}`);
  }
});
