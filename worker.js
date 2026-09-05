/* ASCII edge worker — M0 skeleton.
   "everything is characters" — a text-native generative art instrument,
   sibling to Fluid (fluid.krackeddevs.com). Where Fluid renders pixels,
   ASCII renders CHARACTERS.

   This is the deployable shell only: a single self-contained index.html
   (inline script, inline style, a <canvas>, no external resources) served
   from static assets, plus one health probe. No state, no storage, no
   render API — all rendering happens in the visitor's browser. */

/* Security headers applied to every response. Mirrors Fluid's set.
   The app is ONE self-contained index.html with an inline <script> and
   inline <style>, so the CSP keeps 'unsafe-inline' for script/style and
   allows data: images — while everything external is forbidden
   (default-src 'self', object-src 'none', no third-party origins).
   frame-ancestors stays open so the instrument can be embedded. */
var SEC = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=15552000',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'content-security-policy': [
    "default-src 'self'",
    // 'unsafe-inline': the studio is one inline <script> in index.html (single-file
    // by design). static.cloudflareinsights.com: Cloudflare Web Analytics beacon ~
    // without it the beacon is blocked and the console shows a CSP error on every load.
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com",
    "worker-src 'self' blob:",
    "frame-ancestors *",
    "base-uri 'self'",
    "form-action 'none'",
    "object-src 'none'"
  ].join('; ')
};

function withSec(resp){
  var h = new Headers(resp.headers);
  for (var k in SEC){ h.set(k, SEC[k]); }
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: h
  });
}

export default {
  async fetch(request, env, ctx){
    var url = new URL(request.url);

    /* health probe — the only API surface in M0 */
    if (url.pathname === '/api/health'){
      return withSec(new Response(
        JSON.stringify({ ok: true, stage: env.STAGE }),
        { headers: { 'content-type': 'application/json; charset=utf-8' } }
      ));
    }

    /* everything else: serve from static assets, then attach security
       headers to whatever body/status comes back. Missing assets (404)
       pass straight through and still carry the headers. */
    var resp;
    try {
      resp = await env.ASSETS.fetch(request);
    } catch (e){
      resp = new Response('not found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }
    return withSec(resp);
  }
};
