import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { retiredRoutes } from './src/data/retired-routes.ts';

const mode = process.env.SITE_MODE === 'production' ? 'production' : 'preview';
const indexing = process.env.INDEXING === 'on';

/**
 * Where the build will be served. Each target has its own origin and base path.
 *   custom-domain (default): https://st.petersburg.stageliora.com/  — the future production host
 *   github-pages:            https://madhavforensicexpert5050.github.io/stpetersburg/  — public noindex preview
 * Templates never hardcode either: they go through src/lib/url.ts, which reads BASE_URL and SITE.
 */
const TARGETS = {
  'custom-domain': { site: 'https://st.petersburg.stageliora.com', base: '/' },
  'github-pages': { site: 'https://madhavforensicexpert5050.github.io', base: '/stpetersburg' },
};
const target = process.env.DEPLOY_TARGET || 'custom-domain';
if (!TARGETS[target]) throw new Error(`Unknown DEPLOY_TARGET "${target}". Use one of: ${Object.keys(TARGETS).join(', ')}.`);
// GitHub Pages is public and cannot require a password, so it only ever carries the noindex public preview.
if (target === 'github-pages' && mode === 'production') {
  throw new Error('DEPLOY_TARGET=github-pages builds the noindex public preview only. Production releases target the custom domain.');
}

// A raw production build used to exit 0 with only a 404 page, which a host would happily deploy.
// Production now has to go through scripts/build-production.mjs, which validates the release first.
if (mode === 'production' && process.env.RELEASE_CHECK_PASSED !== '1') {
  throw new Error('Use "npm run build:production". It validates owner approvals before anything is built.');
}
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'";

/**
 * Retired routes (src/data/retired-routes.ts) keep a forwarding path to the page that now holds their content.
 * Custom-domain builds get a real 301 in _redirects (Cloudflare Pages / Netlify format). GitHub Pages cannot send
 * a 301, so it gets a small noindex "this page has moved" page: visible link, immediate refresh, canonical to the
 * destination. If the destination is not in this build, the forward goes home; with no home either, none is written.
 */
function writeRetiredForwards(out) {
  const { site, base } = TARGETS[target];
  const prefix = base.replace(/\/$/, '');
  const built = (p) => fs.existsSync(path.join(out, p, 'index.html'));
  for (const r of retiredRoutes) if (built(r.from)) throw new Error(`Retired route ${r.from} was built as a page. Remove it from the registry.`);
  const forwards = retiredRoutes
    .map((r) => (built(r.to) ? { ...r, dest: r.to } : built('/') ? { ...r, dest: '/', label: 'the StageLiora homepage' } : null))
    .filter(Boolean);
  if (target === 'github-pages') {
    for (const r of forwards) {
      const href = `${prefix}${r.dest}`;
      const html = `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>This page has moved | StageLiora</title>
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="${site}${href}">
<meta http-equiv="refresh" content="0; url=${href}">
<style>body{margin:0;padding:48px 16px;background:#fff;color:#14213d;font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:40rem;margin:0 auto}a{color:#0b4f6c}</style>
</head>
<body>
<main>
<h1>This page has moved</h1>
<p>The guidance that was here is now in <a href="${href}">${r.label}</a>.</p>
<p><a href="${prefix}/">Go to the StageLiora homepage</a></p>
</main>
</body>
</html>
`;
      fs.mkdirSync(path.join(out, r.from), { recursive: true });
      fs.writeFileSync(path.join(out, r.from, 'index.html'), html);
    }
    return;
  }
  if (!forwards.length) return;
  const lines = forwards.flatMap((r) => [`${r.from} ${r.dest} 301`, `${r.from.replace(/\/$/, '')} ${r.dest} 301`]);
  fs.writeFileSync(path.join(out, '_redirects'), ['# Retired routes. Source: src/data/retired-routes.ts', ...lines, ''].join('\n'));
}

/** Post-build safety layer: writes host headers and unlinks anchors that point at excluded routes. */
function buildGuards() {
  return {
    name: 'stageliora-build-guards',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const out = fileURLToPath(dir);
        writeRetiredForwards(out);
        // GitHub Pages ignores _headers. There, robots meta tags carry noindex and scripts/build-github-pages.mjs checks them.
        if (target === 'github-pages') return;
        // With indexing on, each page's own robots meta decides. A global header here would override approved pages.
        const lines = ['/*', `  Content-Security-Policy: ${CSP}`, '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', '  Permissions-Policy: camera=(), microphone=(), geolocation=()'];
        if (mode === 'production') lines.push('  Strict-Transport-Security: max-age=31536000');
        if (process.env.CANDIDATE_ROUTES) lines.push('  X-Release-Candidate: not-authorized-for-deployment');
        if (!(mode === 'production' && indexing)) lines.push('  X-Robots-Tag: noindex, nofollow');
        const headers = lines.join('\n') + '\n\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n';
        fs.writeFileSync(path.join(out, '_headers'), headers);
        if (mode !== 'production') return;
        const files = [];
        (function walk(d) {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.html')) files.push(p);
          }
        })(out);
        const exists = (href) => {
          const clean = href.split(/[?#]/)[0];
          return fs.existsSync(path.join(out, clean, 'index.html')) || fs.existsSync(path.join(out, clean));
        };
        for (const f of files) {
          const html = fs.readFileSync(f, 'utf8');
          const next = html.replace(/<a\b([^>]*?)href="(\/[^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (m, _a, href, _b, inner) =>
            exists(href) ? m : `<span class="unlinked">${inner}</span>`);
          if (next !== html) fs.writeFileSync(f, next);
        }
      },
    },
  };
}

export default defineConfig({
  site: TARGETS[target].site,
  base: TARGETS[target].base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  output: 'static',
  outDir: process.env.OUT_DIR || 'dist',
  devToolbar: { enabled: false },
  integrations: [buildGuards()],
});
