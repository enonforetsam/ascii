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
