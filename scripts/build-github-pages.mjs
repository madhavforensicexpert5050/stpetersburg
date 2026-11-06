// GitHub Pages public preview build.
// Serves at https://madhavforensicexpert5050.github.io/stpetersburg/ — public, noindex, and NOT a production release.
// It records no approval and changes no release gate. Production still goes through build-production.mjs.
//
// Builds into dist-github-pages/, then checks the real output. Any failure deletes the output and exits 1,
// so a broken or unsafe artifact can never be uploaded.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

process.env.DEPLOY_TARGET = 'github-pages';
process.env.SITE_MODE = 'preview';
process.env.INDEXING = 'off';
delete process.env.CANDIDATE_ROUTES;
delete process.env.RELEASE_CHECK_PASSED;
if (process.env.QA_FIXTURE) { console.error('Refusing: QA_FIXTURE must not be used for a public build.'); process.exit(1); }

const OUT = 'dist-github-pages';
const ORIGIN = 'https://madhavforensicexpert5050.github.io';
const BASE = '/stpetersburg';
const line = (s = '') => console.log(s);

// Imported after the environment is set, because the registry reads it at load time.
const { routes, publicPreviewExclusion } = await import('../src/data/routes.ts');
const expected = routes.filter((r) => !publicPreviewExclusion(r)).map((r) => r.path);
const excluded = routes.filter((r) => publicPreviewExclusion(r));

line(`GitHub Pages public preview: ${routes.length} source routes, ${expected.length} eligible, ${excluded.length} excluded.`);
for (const r of excluded) line(`  EXCLUDED ${r.path}  ${publicPreviewExclusion(r)}`);

fs.rmSync(OUT, { recursive: true, force: true });
execSync('node scripts/generate-placeholders.mjs', { stdio: 'inherit' });
execSync('npx astro build', { stdio: 'inherit', env: { ...process.env, OUT_DIR: OUT } });

// ---------- Validate the actual output ----------
const fail = [];
const htmlFiles = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) htmlFiles.push(p); } })(OUT);
const rel = (f) => path.relative(OUT, f).replace(/\\/g, '/');
const builtPaths = htmlFiles.filter((f) => !f.endsWith('404.html')).map((f) => `/${path.relative(OUT, path.dirname(f)).replace(/\\/g, '/')}/`.replace('//', '/'));
for (const p of expected) if (!builtPaths.includes(p)) fail.push(`Eligible route was not built: ${p}`);
for (const p of builtPaths) if (!expected.includes(p)) fail.push(`Excluded or unknown route was built: ${p}`);
if (!fs.existsSync(path.join(OUT, '404.html'))) fail.push('404.html is missing');

/** Maps a URL path on the live site to a file in the artifact, or null if it would 404. */
const resolveLocal = (u) => {
  const clean = decodeURIComponent(u.split(/[?#]/)[0]);
  if (!(clean === BASE || clean.startsWith(`${BASE}/`))) return null;
  const t = path.join(OUT, clean.slice(BASE.length) || '/');
  if (fs.existsSync(t) && fs.statSync(t).isFile()) return t;
  if (fs.existsSync(path.join(t, 'index.html'))) return path.join(t, 'index.html');
  return null;
};

const forbidden = [
  [/Local preview/, 'internal-preview ribbon'], [/Internal [Dd]raft/, 'private-screen draft label'], [/\bDEC-\d{3}\b/, 'internal decision ID'],
  [/\bLOC-\d{4}\b/, 'internal research ID'], [/Publication decision/, 'owner publication note'], [/Internal: pricing/, 'internal pricing options'],
  [/\[[A-Z][^\]]*pending[^\]]*\]/i, 'unfilled bracket item'], [/confirm before publication/, 'unverified research fact'],
  [/localhost|127\.0\.0\.1/, 'localhost URL'], [/https?:\/\/st\.petersburg\.stageliora\.com/, 'link to the unconfigured custom domain'],
  [/\/stpetersburg\/stpetersburg/, 'doubled base path'],
  // Development-stage wording that the customer-facing copy replaced. Capital P avoids input placeholder="" and /media/placeholders/.
  [/Placeholder/, '"Placeholder" wording'], [/Website preview|not open for orders/i, 'old preview banner'],
  [/pending owner approval|Draft Notes|Internal Research Record|internal record/i, 'internal status wording'],
];
const attrRe = /\b(?:href|src|action|data-zoom|poster)="([^"]*)"/g;

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const name = rel(f);
  for (const [re, label] of forbidden) if (re.test(html)) fail.push(`${name} contains ${label}`);
  if (!/<meta name="robots" content="noindex/.test(html)) fail.push(`${name} lacks a noindex robots meta tag`);
  // No sitewide banner on the public site. Instead, disclosure must sit next to what it describes:
  // per-image captions such as "AI-created example" are not shown; example images keep honest alt text instead,
  // and every contact point must say that project bookings are not open.
  if (/class="ribbon"/.test(html)) fail.push(`${name} still shows a sitewide development banner`);
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  // about/ holds the one media-information disclosure, so it is the only page allowed to say this.
  if (name !== 'about/index.html' && /AI-created example|AI concept ·|· AI concept/.test(visible)) fail.push(`${name} still shows a per-image AI disclosure label`);
  for (const a of html.matchAll(/<img[^>]*src="[^"]*\/media\/generated\/[^"]*"[^>]*>/g)) if (!/alt="AI-(created|generated)|\salt(="")?[\s>]/.test(a[0])) { fail.push(`${name} has a generated image without honest alt text`); break; }
  if (/class="cta-band"/.test(html) && !/Project bookings are not open yet/.test(visible)) fail.push(`${name} has a contact call to action without the bookings limitation`);
  // Transparency without labels: the one media-information disclosure must be reachable from every page.
  if (/\/media\/generated\//.test(html) && !/href="\/stpetersburg\/about\/#images"/.test(html)) fail.push(`${name} shows generated images but no link to the image information`);
  for (const m of html.matchAll(attrRe)) {
    const v = m[1];
    if (!v.startsWith('/') || v.startsWith('//')) continue;
    if (!(v === `${BASE}/` || v.startsWith(`${BASE}/`))) { fail.push(`${name} has a root path outside ${BASE}/: ${v}`); continue; }
    if (!resolveLocal(v)) fail.push(`${name} has a broken internal link or asset: ${v}`);
  }
  for (const m of html.matchAll(/srcset="([^"]*)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(/\s+/)[0]; if (u.startsWith('/') && !resolveLocal(u)) fail.push(`${name} has a broken srcset entry: ${u}`); }
  if (!f.endsWith('404.html')) {
    const p = `/${path.relative(OUT, path.dirname(f)).replace(/\\/g, '/')}/`.replace('//', '/');
    const want = `${ORIGIN}${BASE}${p}`;
    if (!html.includes(`<link rel="canonical" href="${want}"`)) fail.push(`${name} canonical is not ${want}`);
  }
}

// CSS: every url() must resolve inside the artifact (fonts and images).
const cssFiles = fs.existsSync(path.join(OUT, '_astro')) ? fs.readdirSync(path.join(OUT, '_astro')).filter((x) => x.endsWith('.css')) : [];
if (!cssFiles.length) fail.push('No CSS bundle in _astro/');
for (const c of cssFiles) {
  const css = fs.readFileSync(path.join(OUT, '_astro', c), 'utf8');
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    const u = m[1];
    if (u.startsWith('data:') || u.startsWith('#')) continue;
    const local = u.startsWith('/') ? resolveLocal(u) : (fs.existsSync(path.join(OUT, '_astro', u.split(/[?#]/)[0])) ? u : null);
    if (!local) fail.push(`_astro/${c} references a missing file: ${u}`);
  }
}

// The one media-information disclosure: About states plainly what the example images are.
const aboutHtml = fs.existsSync(path.join(OUT, 'about', 'index.html')) ? fs.readFileSync(path.join(OUT, 'about', 'index.html'), 'utf8') : '';
if (!/id="images"/.test(aboutHtml) || !/AI-created examples of fictional properties, not photographs of completed client projects/.test(aboutHtml)) fail.push('about/index.html lacks the image-origin disclosure section');

// Homepage: the real site, not a README render.
const home = fs.existsSync(path.join(OUT, 'index.html')) ? fs.readFileSync(path.join(OUT, 'index.html'), 'utf8') : '';
if (!home) fail.push('index.html is missing from the artifact root');
else {
  if (!/<title>[^<]*StageLiora/.test(home)) fail.push('Homepage title does not name StageLiora');
  if (!/<header class="site-header"/.test(home)) fail.push('Homepage has no site header');
  if (!/<footer/.test(home)) fail.push('Homepage has no footer');
  if (!/<h1[\s>]/.test(home) || /<h1[^>]*>\s*stpetersburg\s*<\/h1>/i.test(home)) fail.push('Homepage H1 is missing or is the README heading');
  if (!new RegExp(`<link rel="stylesheet" href="${BASE}/_astro/`).test(home) && !/<style>/.test(home)) fail.push('Homepage loads no stylesheet');
  if (/Jekyll/.test(home)) fail.push('Homepage looks like a Jekyll render');
}

// Search: no indexable URLs.
const sm = fs.existsSync(path.join(OUT, 'sitemap.xml')) ? fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8') : '';
if (/<url>/.test(sm)) fail.push('sitemap.xml lists URLs in a noindex preview');

if (fail.length) {
  line(`\nGITHUB PAGES BUILD VALIDATION FAILED (${fail.length}):`);
  fail.slice(0, 60).forEach((x) => line(`  ${x}`));
  fs.rmSync(OUT, { recursive: true, force: true });
  process.exit(1);
}
// Actions deploys the artifact without Jekyll, but this keeps _astro/ safe if the folder is ever served by a branch build.
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
line(`\nGitHub Pages preview valid: ${builtPaths.length} routes plus 404.html in ${OUT}/, served at ${ORIGIN}${BASE}/ (noindex).`);
