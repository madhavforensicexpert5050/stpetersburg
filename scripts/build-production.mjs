// Production build. Refuses to produce a deployable site unless the release is valid, then validates what it built.
// Exit codes: 0 ready, 2 blocked (no approvals yet), 1 invalid configuration or a failed post-build check.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { validateRelease, candidateRoutes } from '../src/data/release.ts';
import { routes, sitemapRoutes, findRoute } from '../src/data/routes.ts';
import { serve } from './serve.mjs';

const CANDIDATE = process.argv.includes('--candidate');
const OUT = process.env.OUT_DIR || (CANDIDATE ? 'dist-candidate' : 'dist-production');
const SITE = 'https://st.petersburg.stageliora.com';
const line = (s = '') => console.log(s);

if (process.env.QA_FIXTURE && !OUT.startsWith('dist-qa')) { console.error('Refusing: QA_FIXTURE may only build into dist-qa/.'); process.exit(1); }

const report = validateRelease({ endpoint: process.env.PUBLIC_FORM_ENDPOINT });
line(`Release state: ${report.state}`);
report.errors.forEach((e) => line(`  ERROR    ${e}`));
report.blockers.forEach((e) => line(`  BLOCKER  ${e}`));
report.warnings.forEach((e) => line(`  WARNING  ${e}`));
fs.rmSync(OUT, { recursive: true, force: true });
if (report.state === 'BLOCKED' && !CANDIDATE) { line('\nPRODUCTION RELEASE BLOCKED. Nothing was built, so nothing can be deployed by mistake.'); line('See docs/stageliora-final-owner-release-checklist.md'); process.exit(2); }
if (report.state === 'INVALID' && !CANDIDATE) { line('\nPRODUCTION RELEASE INVALID. Fix the errors above. Nothing was built.'); process.exit(1); }

execSync('node scripts/generate-placeholders.mjs', { stdio: 'pipe' });
const candidate = candidateRoutes().map((r) => r.path);
if (CANDIDATE && !candidate.length) { line('No candidate routes.'); process.exit(1); }
execSync('npx astro build', { stdio: 'pipe', env: { ...process.env, SITE_MODE: 'production', OUT_DIR: OUT, RELEASE_CHECK_PASSED: '1', INDEXING: !CANDIDATE && report.indexable.length ? 'on' : 'off', ...(CANDIDATE ? { CANDIDATE_ROUTES: candidate.join(',') } : {}) } });

// ---------- Post-build validation against the actual output ----------
const fail = [];
const expected = CANDIDATE ? candidate : report.publishable;
if (CANDIDATE) report.indexable = [];
const htmlFiles = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) htmlFiles.push(p); } })(OUT);
const builtPaths = htmlFiles.filter((f) => !f.endsWith('404.html')).map((f) => `/${path.relative(OUT, path.dirname(f)).replace(/\\/g, '/')}/`.replace('//', '/'));
for (const p of expected) if (!builtPaths.includes(p)) fail.push(`Approved route was not built: ${p}`);
for (const p of builtPaths) if (!expected.includes(p)) fail.push(`Unapproved route was built: ${p}`);

const forbidden = [[/class="ribbon"/, 'preview ribbon'], [/Internal draft/i, 'internal draft wording'], [/\bDEC-\d{3}\b/, 'internal decision ID'], [/\[[A-Z][^\]]*pending[^\]]*\]/i, 'unfilled bracket item'], [/Publication decision/, 'internal publication note'], [/LOC-\d{4}/, 'internal research ID'], [/Not yet offered/, '"Not yet offered" on a public page']];
const pages = htmlFiles.map((f) => [f, fs.readFileSync(f, 'utf8')]);
for (const [f, html] of pages) {
  for (const [re, label] of forbidden) if (re.test(html)) fail.push(`${path.relative(OUT, f)} contains ${label}`);
  for (const m of html.matchAll(/\bhref="(\/[^"#?]*)/g)) { const t = path.join(OUT, m[1]); if (!(fs.existsSync(t) && (fs.statSync(t).isFile() || fs.existsSync(path.join(t, 'index.html'))))) fail.push(`${path.relative(OUT, f)} has a broken link: ${m[1]}`); }
}

const sm = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const { server, origin } = await serve(path.resolve(OUT));
for (const loc of locs) {
  const p = loc.replace(SITE, '');
  if (!loc.startsWith(`${SITE}/`)) fail.push(`Sitemap URL is not on the production host: ${loc}`);
  if (!report.indexable.includes(p)) fail.push(`Sitemap URL lacks indexing approval: ${loc}`);
  const res = await fetch(origin + p);
  if (res.status !== 200) fail.push(`Sitemap URL returned ${res.status}: ${loc}`);
  const html = await res.text();
  if (!/<meta name="robots" content="index,follow/.test(html)) fail.push(`Sitemap URL is not indexable: ${loc}`);
  if (!html.includes(`<link rel="canonical" href="${loc}"`)) fail.push(`Sitemap URL canonical mismatch: ${loc}`);
}
server.close();
for (const p of report.indexable) if (!locs.includes(`${SITE}${p}`)) fail.push(`Approved indexable route missing from sitemap: ${p}`);
for (const r of routes) if (!report.indexable.includes(r.path) && locs.includes(`${SITE}${r.path}`)) fail.push(`Route should not be in sitemap: ${r.path}`);
for (const p of expected) if (!report.indexable.includes(p)) { const html = fs.readFileSync(path.join(OUT, p, 'index.html'), 'utf8'); if (!/<meta name="robots" content="noindex/.test(html)) fail.push(`Published non-indexed page must carry noindex: ${p}`); }
const robots = fs.readFileSync(path.join(OUT, 'robots.txt'), 'utf8');
if (/^Disallow: \/\s*$/m.test(robots)) fail.push('Production robots.txt must not block crawlers from reading noindex');
if (locs.length && !robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail.push('robots.txt must reference the sitemap');
if (!locs.length && /Sitemap:/.test(robots)) fail.push('robots.txt references an empty sitemap');

if (fail.length) { line('\nPOST-BUILD VALIDATION FAILED:'); fail.slice(0, 40).forEach((x) => line(`  ${x}`)); fs.rmSync(OUT, { recursive: true, force: true }); process.exit(1); }
if (CANDIDATE) {
  fs.writeFileSync(path.join(OUT, 'NOT-AUTHORIZED-FOR-DEPLOYMENT.txt'), `Release candidate for review. Public deployment is not authorized.\nRelease state: ${report.state}\n`);
  line(`\nRelease candidate valid: ${expected.length} routes, ${locs.length} sitemap URLs, in ${OUT}/. NOT AUTHORIZED FOR DEPLOYMENT.`);
} else line(`\nProduction build valid: ${expected.length} public routes, ${locs.length} sitemap URLs, in ${OUT}/`);
void sitemapRoutes; void findRoute;
