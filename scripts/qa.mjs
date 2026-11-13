// Static QA over built output. Runs three real builds: preview, production with no approvals,
// and production with QA-assumed approvals (to prove the gates and the sitemap generator work).
// Writes qa-output/qa-static.json and exits non-zero on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { routes, publicationOf, indexingOf, buildStatusOf, ownerApprovalOf, contentApprovalOf, designApprovalOf } from '../src/data/routes.ts';
import { candidateRoutes } from '../src/data/release.ts';
import { approvals } from '../src/data/approvals.ts';
import { qaFixture } from '../src/data/approvals.qa-fixture.ts';
import { media } from '../src/data/media.ts';
import { business } from '../src/data/business.ts';

// Optional private list of competitor terms. Absent from a public clone, where this check is simply narrower.
const privateTerms = await import('../docs-src/qa-private-terms.mjs').then((m) => m.bannedBrandTerms).catch(() => []);
const fixtureValid = qaFixture('valid');
const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass, detail: String(detail).slice(0, 1500) }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail && !pass ? `\n      ${String(detail).slice(0, 700)}` : detail ? `  (${String(detail).slice(0, 120)})` : ''}`); };

function build(outDir, env) {
  execSync('npx astro build', { stdio: 'pipe', env: { ...process.env, ...env, OUT_DIR: outDir } });
}
const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, acc); else acc.push(p); } return acc; };
const pagePath = (r) => path.join('dist', r.path, 'index.html');
const attr = (html, re) => (html.match(re) || [])[1];

// ---------- Preview build ----------
execSync('node scripts/generate-placeholders.mjs', { stdio: 'pipe' });
build('dist', { SITE_MODE: 'preview', INDEXING: 'off', PUBLIC_FORM_ENDPOINT: '' });

// Owner's final structure (group: count), checked against the registry.
const expected = `/ /about/ /contact/ /how-it-works/ /pricing/ /faq/ /reviews/
/services/ /services/virtual-staging/ /services/furniture-removal-and-staging/ /services/interior-color-changes/ /services/flooring-visualization/ /services/ceiling-visualization/ /services/exterior-color-visualization/ /services/landscaping-visualization/ /services/day-to-dusk/ /services/photo-enhancement/
/portfolio/ /design-library/ /design-styles/ /design-styles/modern/ /design-styles/scandinavian/ /design-styles/farmhouse/ /design-styles/contemporary/
/for-real-estate-agents/ /for-real-estate-photographers/ /for-brokerages/
/online-interior-design/ /interior-designers/ /interior-design-projects/
/guides/ /guides/what-is-virtual-staging/ /guides/virtual-staging-cost/ /guides/virtual-staging-faqs/ /guides/virtual-staging-vs-traditional-staging/ /guides/how-to-prepare-photos-for-virtual-staging/ /guides/virtual-staging-disclosure-florida/ /guides/virtual-staging-for-real-estate-agents/
/locations/ /locations/st-petersburg-fl/ /locations/st-pete-beach/ /locations/gulfport/ /locations/treasure-island/ /locations/south-pasadena/ /locations/madeira-beach/ /locations/pinellas-park/ /locations/seminole/ /locations/largo/ /locations/clearwater/ /locations/dunedin/ /locations/safety-harbor/
/privacy-policy/ /terms-of-service/ /refund-and-revision-policy/ /cookie-policy/
/request-quote/ /order/ /account/ /orders/ /upload/`.split(/\s+/);
// Added by the owner in V10.1, outside the 60-route V3.0 approval.
const addedLater = ['/about/devender-garg/'];
// Retired by the owner in V18 (src/data/retired-routes.ts). They leave the registry but keep a forward.
const { retiredRoutes } = await import('../src/data/retired-routes.ts');
const retired = retiredRoutes.map((r) => r.from);
const current = expected.filter((p) => !retired.includes(p));
const reg = routes.map((r) => r.path);
check(`Registry matches the owner final structure (60 routes, ${retired.length} retired by the owner in V18-V20, plus the V10.1 founder page)`, expected.length === 60 && retired.every((p) => expected.includes(p)) && [...current, ...addedLater].every((p) => reg.includes(p)) && reg.every((p) => current.includes(p) || addedLater.includes(p)), `expected ${current.length}, registry ${reg.length}; missing: ${current.filter((p) => !reg.includes(p))}; extra: ${reg.filter((p) => !current.includes(p) && !addedLater.includes(p))}`);
check('Each retired route forwards to a current route, and no retired path is still a page', retiredRoutes.every((r) => reg.includes(r.to) && !reg.includes(r.from) && !fs.existsSync(path.join('dist', r.from, 'index.html'))), retiredRoutes.map((r) => `${r.from} -> ${r.to}`));
const redirectsFile = path.join('dist', '_redirects');
const redirectsTxt = fs.existsSync(redirectsFile) ? fs.readFileSync(redirectsFile, 'utf8') : '';
check('_redirects sends a 301 from each retired route to its destination', retiredRoutes.every((r) => redirectsTxt.includes(`${r.from} ${r.to} 301`) && redirectsTxt.includes(`${r.from.replace(/\/$/, '')} ${r.to} 301`)), redirectsTxt);
check('Every route built', routes.every((r) => fs.existsSync(pagePath(r))), routes.filter((r) => !fs.existsSync(pagePath(r))).map((r) => r.path).join(' '));
for (const f of ['404.html', 'robots.txt', 'sitemap.xml', 'llms.txt', '_headers']) check(`Technical file exists: ${f}`, fs.existsSync(path.join('dist', f)));

const pages = routes.map((r) => ({ r, html: fs.readFileSync(pagePath(r), 'utf8') }));
const titles = new Map(), descs = new Map();
const problems = { h1: [], title: [], desc: [], canon: [], robots: [], jsonld: [], schemaBan: [], alt: [], lang: [], dims: [] };
for (const { r, html } of pages) {
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.h1.push(r.path);
  const t = attr(html, /<title>([^<]*)<\/title>/); const d = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!t || t.length > 70) problems.title.push(`${r.path} (${t?.length})`);
  if (!d || d.length < 70 || d.length > 170) problems.desc.push(`${r.path} (${d?.length})`);
  titles.set(t, [...(titles.get(t) || []), r.path]); descs.set(d, [...(descs.get(d) || []), r.path]);
  if (attr(html, /<link rel="canonical" href="([^"]*)"/) !== `${business.siteUrl}${r.path}`) problems.canon.push(r.path);
  if (attr(html, /<meta name="robots" content="([^"]*)"/) !== 'noindex,nofollow') problems.robots.push(r.path);
  if (!/<html lang="en-US"/.test(html)) problems.lang.push(r.path);
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.stringify(JSON.parse(m[1])); if (/PostalAddress|LocalBusiness|aggregateRating|"review"|"geo"|streetAddress/i.test(j)) problems.schemaBan.push(r.path); } catch { problems.jsonld.push(r.path); }
  }
  if (!/application\/ld\+json/.test(html)) problems.jsonld.push(`${r.path} (none)`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    // Astro serializes a dynamic empty alt as a bare alt attribute; both are valid empty alternatives.
    if (!/\salt(?:\s|=|>)/.test(m[0])) problems.alt.push(r.path);
    if (!/\bwidth="/.test(m[0]) && !/data:image/.test(m[0])) problems.dims.push(r.path);
  }
}
check('Exactly one H1 on every page', !problems.h1.length, problems.h1);
check('Titles present and at most 70 characters', !problems.title.length, problems.title);
check('Descriptions 70 to 170 characters', !problems.desc.length, problems.desc);
const dup = (m) => [...m.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => `${k}: ${v}`);
check('Titles are unique', !dup(titles).length, dup(titles));
check('Descriptions are unique', !dup(descs).length, dup(descs));
check('Canonical matches target hostname and route', !problems.canon.length, problems.canon);
check('All preview pages are noindex,nofollow', !problems.robots.length, problems.robots);
check('html lang is en-US', !problems.lang.length, problems.lang);
check('JSON-LD present and parses', !problems.jsonld.length, problems.jsonld);
check('No LocalBusiness, address, geo or rating schema', !problems.schemaBan.length, problems.schemaBan);
check('Every img has alt text', !problems.alt.length, [...new Set(problems.alt)]);
check('Every content img declares dimensions', !problems.dims.length, [...new Set(problems.dims)]);

// Internal links and assets, including the 404 page
const all = [...pages.map((p) => [p.r.path, p.html]), ['/404', fs.readFileSync('dist/404.html', 'utf8')]];
const bad = new Set(); let linkCount = 0;
const exists = (u) => { const c = u.split(/[?#]/)[0]; const p = path.join('dist', decodeURIComponent(c)); return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html'))); };
for (const [p, html] of all) {
  for (const m of html.matchAll(/\b(?:href|src|data-zoom)="(\/[^"]*)"/g)) { linkCount++; if (!exists(m[1])) bad.add(`${p} -> ${m[1]}`); }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) { if (!html.includes(`id="${m[1]}"`)) bad.add(`${p} -> #${m[1]}`); }
}
check(`Internal links and assets resolve (${linkCount} checked)`, bad.size === 0, [...bad].slice(0, 20));

// Orphans: every route linked from at least one other page
const inbound = new Set();
for (const [p, html] of all) for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) if (m[1] !== p) inbound.add(m[1]);
const orphans = reg.filter((p) => !inbound.has(p) && p !== '/');
// Private routes never reach a public or production build. The order routes and, since the owner removed the footer
// Explore group (V19), the three interior-design drafts are deliberately unlinked. Every other route needs a link.
const privateRoute = (p) => routes.find((r) => r.path === p)?.plan.proposed === 'PRIVATE_OR_DISABLED';
const orphanOk = orphans.every((p) => privateRoute(p));
check('No orphan pages (private draft routes deliberately unlinked)', orphanOk, `unlinked: ${orphans.join(' ')}`);
const leak = pages.filter(({ r }) => !['/order/', '/account/', '/orders/', '/upload/'].includes(r.path)).filter(({ html }) => /href="\/(order|account|orders|upload)\/"/.test(html)).map(({ r }) => r.path);
check('No public page links to order, account, orders or upload', !leak.length, leak);

// Contact accuracy
const tels = new Set(), mails = new Set();
for (const [, html] of all) { for (const m of html.matchAll(/href="tel:([^"]+)"/g)) tels.add(m[1]); for (const m of html.matchAll(/href="mailto:([^"?]+)/g)) mails.add(m[1]); }
check('Only the owner phone appears as a tel link', tels.size === 1 && tels.has('+918890929329'), [...tels]);
check('Only the owner email appears as a mailto link', mails.size === 1 && mails.has('dev@devendergarg.com'), [...mails]);
const contact = fs.readFileSync('dist/contact/index.html', 'utf8');
check('Contact page shows the exact email and phone', contact.includes('dev@devendergarg.com') && contact.includes('+91 88909 29329'));

// Claims scan on visible text
const visible = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&quot;|&#34;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const banned = [...privateTerms, /america'?s #?1/i, /#1\b/, /\bfloridian team\b/i, /best virtual staging/i, /guaranteed? (results|sale|compliance|compliant)/i, /\bmls[- ](approved|compliant|ready)\b/i, /\bsatisfaction guarantee/i, /money[- ]back/i, /\b\d[\d,]*\+ (clients|customers|agents|projects|photos)\b/i, /\byears of experience\b/i, /award[- ]winning/i, /\blocated in st\.? pete/i, /\bour (st\.? petersburg|florida|tampa) (office|team|studio)\b/i, /24[- ]hour (delivery|turnaround)/i, /starting at \$/i, /\b\d(\.\d)? ?stars?\b/i];
const claimHits = [];
for (const [p, html] of all) { const t = visible(html); for (const re of banned) { const m = t.match(re); if (m) claimHits.push(`${p}: "${m[0]}"`); } }
check('No banned brand, ranking, guarantee, count or office claims', !claimHits.length, claimHits);
const priceHits = [];
// Only figures recorded in approvals.planPricing may appear (none at all when nothing is approved).
const { plans: qaPlans, headline: qaHeadline } = await import('../src/data/pricing-plans.ts');
const approvedAmounts = new Set(qaPlans.map((p) => qaHeadline(p.planId)?.amount).filter(Boolean));
for (const { r, html } of pages) { if (['guide', 'guidesHub', 'location'].includes(r.template)) continue; const m = (visible(html).replace(/\$[\d.,]+[KM]/g, '').match(/\$\d[\d,.]*/g) || []).map((x) => x.replace(/[.,]$/, '')).filter((x) => !approvedAmounts.has(x)); if (m.length) priceHits.push(`${r.path}: ${m.join(', ')}`); }
check('No StageLiora price shown unless it matches an owner-approved figure', !priceHits.length, priceHits);
check('No street address pattern anywhere', !all.some(([, h]) => /(?<![\d+] )\b\d{2,5} [A-Z][a-z]+ (St|Street|Ave|Avenue|Blvd|Road|Rd|Suite)\b/.test(visible(h))));  // digits continuing a phone number are not a house number
// Point 1: the former Florida mailing address was withdrawn. It must not appear in any page, metadata, JSON-LD or text output.
const formerAddress = /4110\s*32nd|32nd\s+St(reet)?\.?\s+N(orth)?\b/i;
const addressFiles = [...all, ...['llms.txt', 'robots.txt', 'sitemap.xml', '_redirects'].filter((f) => fs.existsSync('dist/' + f)).map((f) => [f, fs.readFileSync('dist/' + f, 'utf8')])];
check('Former Florida mailing address appears nowhere in the build output', !addressFiles.some(([, h]) => formerAddress.test(h)), addressFiles.filter(([, h]) => formerAddress.test(h)).map(([p]) => p));
// Point 1 business identity (owner-approved wording)
const vis = (p) => visible(fs.readFileSync(p, 'utf8'));
check('Footer About text is the owner-supplied wording on every page', all.every(([, h]) => { const m = h.match(/<div class="foot-brand">[\s\S]*?<p>([^<]*)<\/p>/); return m && m[1].replace(/&#39;/g, "'") === business.footerAbout; }));
check('Footer has no "About our images" link (owner decision 2026-11-13)', all.every(([, h]) => { const f = (h.match(/<footer class="site-footer">[\s\S]*?<\/footer>/) || [''])[0]; return f && !/About our images|about\/#images/.test(f); }));
check('Contact page states the approved remote operating model', vis('dist/contact/index.html').includes('Founded and operated by Devender Garg from India, StageLiora serves St. Petersburg, Florida, through a fully remote service model.'));
if (fs.existsSync('dist/about/index.html')) check('About page states the approved operating location', vis('dist/about/index.html').includes('Founded and operated by Devender Garg, StageLiora provides remote virtual staging services to real estate professionals and property owners in St. Petersburg, Florida. The business operates from India.'));
if (fs.existsSync('dist/about/devender-garg/index.html')) check('Founder page shows the approved owner introduction', vis('dist/about/devender-garg/index.html').includes('Devender Garg is the founder and owner of StageLiora. He personally manages customer communication and oversees virtual staging projects'));

// Near-duplicate location check on main content
const mainText = (h) => visible((h.match(/<main[\s\S]*<\/main>/) || [''])[0]).toLowerCase();
const shingles = (t) => { const w = t.split(/\W+/).filter(Boolean); const s = new Set(); for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' ')); return s; };
const loc = pages.filter(({ r }) => r.template === 'location').map(({ r, html }) => ({ p: r.path, s: shingles(mainText(html)) }));
let maxJ = 0, maxPair = '', overlaps = [];
for (let i = 0; i < loc.length; i++) for (let j = i + 1; j < loc.length; j++) {
  const a = loc[i].s, b = loc[j].s; let inter = 0; for (const x of a) if (b.has(x)) inter++;
  const J = inter / (a.size + b.size - inter);
  if (J > maxJ) { maxJ = J; maxPair = `${loc[i].p} ~ ${loc[j].p}`; }
  overlaps.push(J);
}
check(`Location pages are not near-duplicates (max 5-word overlap ${(maxJ * 100).toFixed(1)}% ${maxPair})`, maxJ < 0.5, 'Threshold 50%. Shared template sentences account for the overlap.');
const statsOk = pages.filter(({ r }) => r.template === 'location').every(({ html }) => /No local office/.test(html));
check('Every location page states there is no local office', statsOk);
// V23 location SEO rules: one primary keyword per page, never shared; titles fit; each page carries its own FAQs and links.
const { locations: qaLocs } = await import('../src/data/locations.ts');
const pubLocs = qaLocs.filter((l) => l.decision === 'PUBLISH');
const prim = pubLocs.map((l) => l.keywords.primary.toLowerCase());
check('Location pages: every primary keyword is unique and differs from the homepage target', new Set(prim).size === prim.length && !prim.includes('virtual staging st. petersburg fl'), prim);
const tooLong = pubLocs.filter((l) => l.title.replace(/&/g, '&amp;').length > 70 || l.description.length > 160 || l.description.length < 110).map((l) => `${l.slug} (${l.title.length}/${l.description.length})`);
check('Location pages: titles at most 70 characters, descriptions 110-160', !tooLong.length, tooLong);
const kwWords = (t) => t.toLowerCase().replace(/[.,:']/g, ' ').split(/\s+/).filter((w) => w && w !== 'fl' && w !== 'florida');
const kwMiss = pubLocs.filter((l) => { const have = new Set(kwWords(`${l.title} ${l.h1}`)); return !kwWords(l.keywords.primary).every((w) => have.has(w)) || !kwWords(l.keywords.primary).every((w) => new Set(kwWords(l.title)).has(w)); }).map((l) => l.slug);
check('Location pages: every word of the primary keyword appears in the title', !kwMiss.length, kwMiss);
check('Location pages: at least three city-specific FAQs, two nearby links and no snippet-only facts', pubLocs.every((l) => l.faq.length >= 3 && l.nearby.length >= 2 && l.nearby.every((n) => pubLocs.some((x) => x.slug === n)) && l.facts.every((f) => f.evidence !== 'snippet')), pubLocs.filter((l) => !(l.faq.length >= 3 && l.nearby.length >= 2)).map((l) => l.slug));
check('Location pages: each shows a different example image', new Set(pubLocs.map((l) => l.image)).size === pubLocs.length);

// Indexing safeguards
const robots = fs.readFileSync('dist/robots.txt', 'utf8');
check('Preview robots.txt does not hide noindex from crawlers', !/^Disallow: \/\s*$/m.test(robots) && !/Sitemap:/.test(robots));
const sm = fs.readFileSync('dist/sitemap.xml', 'utf8');
check('Preview sitemap.xml lists zero URLs', !/<loc>/.test(sm) && /<urlset/.test(sm));
check('llms.txt lists no pages while unapproved', /No pages are approved/.test(fs.readFileSync('dist/llms.txt', 'utf8')));
check('_headers sends X-Robots-Tag noindex', /X-Robots-Tag: noindex/.test(fs.readFileSync('dist/_headers', 'utf8')));

// Media manifest
const srcs = media.map((m) => path.join('public', m.src));
check(`All ${media.length} manifest images exist on disk`, srcs.every((s) => fs.existsSync(s)));
check('Media ids are unique', new Set(media.map((m) => m.id)).size === media.length);
check('Every before has an after in its pair', media.filter((m) => m.pair).every((m) => media.some((x) => x.pair === m.pair && x.role !== m.role)));
check('Synthetic examples are disclosed and remain separate from licensed client work', media.every((m) => m.rights === 'owner-licensed' || (m.rights === 'project-placeholder' ? !m.ownerApproved && fs.readFileSync(path.join('public', m.src), 'utf8').includes('ILLUSTRATION') : m.rights === 'ai-generated' && (m.ownerApproved ? m.publication === 'synthetic-approved-for-production' && (approvals.productionImages?.ids ?? []).includes(m.id) : m.publication === 'synthetic-preview-only') && /AI-created|AI-generated/.test(m.caption) && /^AI-(created|generated)/.test(m.alt))));
// V30: exactly the 36 owner-approved production images, none from outside the release list, and no licensed-photo status.
const approvedImgs = media.filter((m) => m.ownerApproved);
check('Exactly 36 AI images are approved for production, all from the V30 record, none marked as licensed photos', approvedImgs.length === 36 && approvals.productionImages?.ids.length === 36 && approvedImgs.every((m) => m.publication === 'synthetic-approved-for-production' && m.rights === 'ai-generated') && /^V30: /.test(approvals.productionImages?.reference ?? ''), approvedImgs.length);
check('Portfolio stays gated: approving 36 images did not approve the Portfolio page images', !media.filter((m) => m.page === '/portfolio/').every((m) => m.ownerApproved));
const { brandMedia } = await import('../src/data/media.ts');
check('Images are served only through the manifest (property examples or approved brand images)', all.every(([, h]) => [...h.matchAll(/<img[^>]+src="(\/media[^"]+)"/g)].every((m) => media.some((x) => x.src === m[1]) || brandMedia.some((x) => x.src === m[1]))));
// Image-specific wording must describe the file actually shown (image-notes.ts, visual-pages.ts).
const { staleNotes } = await import('../src/data/image-notes.ts');
const { portfolioPage } = await import('../src/data/visual-pages.ts');
const stale = [...staleNotes(media), ...portfolioPage.stories.filter((s) => media.find((m) => m.id === `${s.key}-after`)?.src !== s.afterSrc).map((s) => `story:${s.key}`)];
check('Image captions and portfolio explanations match the image files they were written for', !stale.length, `Recheck the text against the new image, then update its src: ${stale.join(' ')}`);

// V19: Design Styles, the style pages and the Design Library were merged into the Portfolio. Their sections came from
// separate pages, so the merged page must not repeat a sentence, and its FAQs must appear nowhere else on the site.
const VISUAL = ['/portfolio/'];
const visualMain = (h) => visible(((h.match(/<main[\s\S]*?<\/main>/) || [''])[0]).replace(/<section class="cta-band"[\s\S]*?<\/section>/g, ''));
const sentenceList = (h) => visualMain(h).split(/(?<=[.?!])\s+/).map((s) => s.trim().toLowerCase()).filter((s) => s.split(/\s+/).length >= 8);
const pfSentences = sentenceList(pages.find((x) => x.r.path === '/portfolio/').html);
const repeated = [...new Set(pfSentences.filter((s, i) => pfSentences.indexOf(s) !== i))];
check('The merged Portfolio repeats no sentence of eight words or more', !repeated.length, repeated.slice(0, 8));
const pfHtml = pages.find((x) => x.r.path === '/portfolio/').html;
const { styles } = await import('../src/data/taxonomy.ts');
check('Portfolio holds its anchors: room designs with the before-and-after gallery and design ideas, styles, style comparison and questions', ['id="before-after"', 'id="room-designs"', 'data-pairs', 'data-library', 'id="design-ideas"', 'id="styles"', 'id="compare-styles"', 'id="faq"'].every((s) => pfHtml.includes(s)) && styles.every((s) => pfHtml.includes(`id="style-${s.id}"`)));
// V24: exactly five main sections, in order, and nothing else directly inside <main>.
const pfMain = (pfHtml.match(/<main[^>]*>([\s\S]*)<\/main>/) || ['', ''])[1];
const pfMarks = [...pfMain.matchAll(/data-pf-section="(\d)"/g)].map((m) => m[1]);
const topLevel = (() => { const out = []; let depth = 0; for (const m of pfMain.matchAll(/<(\/?)(section|div|nav|aside|dialog)\b([^>]*)>/g)) { if (m[1]) depth--; else { if (depth === 0) out.push(`${m[2]}${/data-pf-section/.test(m[3]) ? '*' : ''}`); depth++; } } return out; })();
check('Portfolio has exactly five main sections, in order, and no other top-level section', pfMarks.join('') === '12345' && topLevel.every((t) => t.endsWith('*')) && topLevel.length === 5, `${pfMarks.join(',')} | ${topLevel.join(',')}`);
const { galleryPairs, occupiedPairs, styleCompareReady } = await import('../src/data/media.ts');
const pfKeys = [...galleryPairs, ...occupiedPairs].map((p) => p.key);
const EXCLUDED = ['hero-living', 'svc-interior-color', 'svc-flooring', 'svc-ceiling', 'svc-exterior-color', 'svc-landscaping', 'svc-day-to-dusk', 'svc-photo-enhancement'];
const srcOfPf = (id) => media.find((m) => m.id === id).src;
const roomsHtml = (pfMain.match(/id="room-designs"[\s\S]*?<\/section>/) || [''])[0];
check('Portfolio pairs: each appears once, none excluded, no style-comparison image in Room Designs, no placeholder', new Set(pfKeys).size === pfKeys.length && !pfKeys.some((k) => EXCLUDED.includes(k) || k.startsWith('ors-')) && !EXCLUDED.some((k) => pfHtml.includes(srcOfPf(`${k}-after`)) || pfHtml.includes(srcOfPf(`${k}-before`))) && !/virtual-staging-style-compare-/.test(roomsHtml) && !pfHtml.includes('/media/placeholders/'));
check('Portfolio pairs: every listed pair is two integrated images and appears in the page', [...galleryPairs, ...occupiedPairs].every((p) => ['before', 'after'].every((r) => media.find((m) => m.id === `${p.key}-${r}`).rights === 'ai-generated' && pfHtml.includes(srcOfPf(`${p.key}-${r}`)))));
check('Portfolio: the sunroom and screened-lanai pairs and the Sunroom and Outdoor Spaces chips are shown', pfKeys.includes('pf-sunroom') && pfKeys.includes('pf-patio') && /data-value="sunroom"/.test(pfHtml) && /data-value="outdoor"/.test(pfHtml) && />Outdoor Spaces<\/h3>/.test(pfHtml));
const chipIds = [...pfHtml.matchAll(/data-group-chip data-value="([^"]+)"/g)].map((m) => m[1]).filter((v) => v !== 'all');
check('Portfolio: the room chips are exactly the groups with at least one pair', chipIds.length === new Set(chipIds).size && [...new Set(galleryPairs.map((p) => p.group))].sort().join(',') === [...chipIds].sort().join(','), chipIds);
check('Portfolio Section 3: one shared before and eight style afters, all integrated', styleCompareReady && (pfHtml.match(/virtual-staging-style-compare-living-room-before\.webp"/g) || []).length === 1 && styles.every((s) => pfHtml.includes(`virtual-staging-style-compare-living-room-${s.id}.webp`)) && (pfHtml.match(/data-style-btn /g) || []).length === 8 && [...pfHtml.matchAll(/<button[^>]*data-style-btn[^>]*>/g)].filter((m) => /aria-pressed="true"/.test(m[0])).map((m) => /data-style="transitional"/.test(m[0])).join() === 'true');
check('Portfolio: 7 questions, and the 48 single designs sit only inside More Design Ideas', (pfMain.match(/id="faq"[\s\S]*?<\/section>/) || [''])[0].split('<details').length - 1 === 7 && (pfHtml.match(/data-item /g) || []).length === 48 && ((pfHtml.match(/id="design-ideas"[\s\S]*?<\/details>\s*<dialog/) || [''])[0].match(/data-item /g) || []).length === 48 && /These are single design images, not before-and-after comparisons/.test(pfHtml));
// V21/V24: each style is described once, in its Section 3 panel. No second comparison table, cards or style notes.
check('Portfolio describes each style once: eight Best fit entries, no second comparison table or style notes', !/<details class="pf-more"/.test(pfHtml) && !/<table/.test(pfMain) && !/class="card pf-style"/.test(pfHtml) && (pfHtml.match(/<dt[^>]*>Best fit:<\/dt>/g) || []).length === 8 && !/<dt[^>]*>Look for<\/dt>/.test(pfHtml));
check('Portfolio: occupied rooms copy stays within the Furniture Removal & Staging service and states what was kept', /Occupied Rooms: Furniture Removal and Staging/.test(pfHtml) && /not a separate decluttering or removal-only service/.test(pfHtml) && /the curtains and the framed art were kept/.test(pfHtml) && !/everything (was|is) removed/i.test(visible(pfMain)));
const pfVisible = visible(pfMain);
// The two booking notes show only while /request-quote/ is not live (the same rule as every CTA band).
const notesWanted = routes.some((r) => r.path === '/request-quote/') && fs.existsSync(path.join('dist', 'request-quote', 'index.html')) ? 0 : 1;
check(`Portfolio: booking notes shown ${notesWanted ? 'once each' : 'only while quotes are closed'}, and no Book, Upload, Order or Get started calls to action`, (pfVisible.match(/Project bookings are not open yet, so please don't send photos\./g) || []).length === notesWanted && (pfVisible.match(/Bookings are not open yet; questions are welcome\./g) || []).length === notesWanted &&![...pfMain.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/g)].some((m) => /\b(Book( Now)?|Upload|Order|Get started|Start Your Project)\b/i.test(visible(m[2]))));
// V28 (owner brief 2026-11-12): editorial H1. The search phrase moved to the lede; title and description are unchanged.
check('Portfolio: V28 H1 with the search phrase in the lede; title, meta description, canonical and robots unchanged from V21', /<h1[^>]*>See the Potential in Every Space\.<\/h1>/.test(pfHtml) && /virtual staging portfolio shows rooms before and after staging/.test(pfHtml) && (pfHtml.match(/<h1[\s>]/g) || []).length === 1 && pfHtml.includes('<title>Virtual Staging Portfolio: Before and After, Styles | StageLiora</title>') && pfHtml.includes('<meta name="description" content="Before-and-after virtual staging examples, room designs to filter by style and room, and a guide to choosing among eight staging styles for a listing.">') && pfHtml.includes(`<link rel="canonical" href="${business.siteUrl}/portfolio/">`) && pfHtml.includes('<meta name="robots" content="noindex,nofollow">'));
// V21/V24 inquiry path: every Ask link opens the inquiry form with known ids only. Count from the data:
// one per pair card, one for the occupied card, the inline CTA, one per style panel, the Section 5 band and (V28) the hero.
const askHrefs = [...pfHtml.matchAll(/href="([^"]*\?ask=staging[^"]*)"/g)].map((m) => m[1].replace(/&amp;|&#38;/g, '&'));
const askData = [...pfHtml.matchAll(/data-ask="([^"]+)"/g)].map((m) => m[1].replace(/&amp;|&#38;/g, '&'));
const askAll = [...askHrefs, ...askData];
const askTarget = (h) => h.split('?')[0];
const wantAsk = galleryPairs.length + occupiedPairs.length + 1 + 8 + 1 + 1;
check('Portfolio: pairs, style panels, design ideas and both CTAs link to the inquiry form with their context', askHrefs.length === wantAsk && askData.length === (pfHtml.match(/data-item /g) || []).length && askAll.every((h) => ['/contact/', '/request-quote/'].includes(askTarget(h)) && /#inquiry$/.test(h)) && styles.every((s) => askHrefs.some((h) => h.includes(`style=${s.id}&room=living-room#`))), `${askHrefs.length}/${wantAsk} links, ${askData.length} designs`);
const faqQs = (h) => [...((h.match(/<main[\s\S]*?<\/main>/) || [''])[0]).matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map((m) => visible(m[1]).trim().toLowerCase());
const faqDup = [];
for (const p of VISUAL) for (const q of faqQs(pages.find((x) => x.r.path === p).html)) for (const o of pages) if (o.r.path !== p && faqQs(o.html).includes(q)) faqDup.push(`${p} & ${o.r.path}: ${q}`);
check('FAQ questions on the visual pages appear nowhere else on the site', !faqDup.length, faqDup);

// V18 consolidation: the retired agents page was spread over these pages. Nothing migrated may be pasted twice.
// Deliberately shared components are removed first: the CTA band, FAQ answers (the homepage shows a few from /faq/),
// the guide "Keep reading" sidebar, and the five process steps that Home and How It Works both render.
const { process: processSteps } = await import('../src/data/content.ts');
const CONSOLIDATED = ['/', '/how-it-works/', '/pricing/', '/faq/', '/guides/virtual-staging-for-real-estate-agents/', '/guides/how-to-prepare-photos-for-virtual-staging/', '/guides/virtual-staging-disclosure-florida/', '/services/furniture-removal-and-staging/', '/guides/virtual-staging-faqs/', '/portfolio/'];
const processSentences = new Set(processSteps.flatMap((s) => `${s.h} ${s.b}`.split(/(?<=[.?!])\s+/)).map((s) => s.trim().toLowerCase()));
const consolMain = (h) => visible(((h.match(/<main[\s\S]*?<\/main>/) || [''])[0])
  .replace(/<section class="cta-band"[\s\S]*?<\/section>/g, ' ').replace(/<details[\s\S]*?<\/details>/g, ' ')
  .replace(/<aside class="side-box[\s\S]*?<\/aside>/g, ' ').replace(/<ol class="(?:process__list|steps)"[^>]*>[\s\S]*?<\/ol>/g, ' '));
const consol = CONSOLIDATED.map((p) => { const t = consolMain(pages.find((x) => x.r.path === p).html); return { p, sent: new Set(t.split(/(?<=[.?!])\s+/).map((s) => s.trim().toLowerCase()).filter((s) => s.split(/\s+/).length >= 8 && !processSentences.has(s))), sh: shingles(t.toLowerCase()) }; });
const consolShared = []; let consolMax = 0, consolPair = '';
for (let i = 0; i < consol.length; i++) for (let j = i + 1; j < consol.length; j++) {
  for (const s of consol[i].sent) if (consol[j].sent.has(s)) consolShared.push(`${consol[i].p} & ${consol[j].p}: "${s.slice(0, 80)}"`);
  let inter = 0; for (const x of consol[i].sh) if (consol[j].sh.has(x)) inter++;
  const J = inter / (consol[i].sh.size + consol[j].sh.size - inter);
  if (J > consolMax) { consolMax = J; consolPair = `${consol[i].p} ~ ${consol[j].p}`; }
}
check('Consolidated pages share no sentence of eight words or more (exact duplicate check)', !consolShared.length, consolShared.slice(0, 8));
check(`Consolidated pages are not near-duplicates (max 5-word overlap ${(consolMax * 100).toFixed(1)}% ${consolPair})`, consolMax < 0.12, 'Threshold 12%.');
const generalQs = faqQs(pages.find((x) => x.r.path === '/faq/').html), agentFaqQs = faqQs(pages.find((x) => x.r.path === '/guides/virtual-staging-faqs/').html);
check('The FAQ page repeats no question from the agent FAQ guide', !generalQs.some((q) => agentFaqQs.includes(q)), generalQs.filter((q) => agentFaqQs.includes(q)));

// Guides: every card on the hub shows its featured image, and every guide's Article schema names an image.
const guidePages = pages.filter(({ r }) => r.template === 'guide');
const hubHtml = pages.find((x) => x.r.path === '/guides/').html;
const hubCards = [...hubHtml.matchAll(/<a class="card card--link gcard"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ href: m[1], img: /<div class="gcard__img[^"]*"[^>]*>\s*<img [^>]*src="\/media\//.test(m[2]) }));
const noFeatured = guidePages.map(({ r }) => r.path).filter((p) => !hubCards.some((c) => c.href === p && c.img));
check(`Every guide card on the Guides hub shows a featured image (${hubCards.filter((c) => c.img).length}/${guidePages.length})`, !noFeatured.length && hubCards.length === guidePages.length, noFeatured);
const noSchemaImage = guidePages.filter(({ html }) => !/"@type":"Article"[^<]*"image":"https?:\/\/[^"]+\/media\/[^"]+\.webp"/.test(html)).map(({ r }) => r.path);
check('Every guide Article schema includes its featured image', !noSchemaImage.length, noSchemaImage);

// Navigation (owner spec, header and footer update)
const homeHtml = pages.find((x) => x.r.path === '/').html;
const navHtml = (homeHtml.match(/<nav class="nav"[\s\S]*?<\/nav>/) || [''])[0];
const topItems = [...navHtml.replace(/<div class="mega">[\s\S]*?<\/details>/g, '</details>').matchAll(/<(?:a|summary)\b[^>]*>([\s\S]*?)<\/(?:a|summary)>/g)].map((m) => visible(m[1]).trim());
check('Header nav reads Home | Services | How It Works | Portfolio | Pricing', topItems.join('|') === 'Home|Services|How It Works|Portfolio|Pricing', topItems.join('|'));
check('Header phone button shows the verified number and dials tel:+918890929329', /<a class="head-call" href="tel:\+918890929329"[^>]*>[\s\S]*?<svg[\s\S]*?\+91 88909 29329/.test(homeHtml));
// V18: the agents landing page was retired, so Real Estate opens the agent guide that absorbed its content.
const AGENT_GUIDE = '/guides/virtual-staging-for-real-estate-agents/';
check('Header has no Real Estate item (owner V18.1), and the agent guide is still linked from the homepage body', !topItems.includes('Real Estate') && !navHtml.includes(`href="${AGENT_GUIDE}"`) && (homeHtml.split('<main')[1] || '').split('</main>')[0].includes(`href="${AGENT_GUIDE}"`));
check('No page links to a retired route', !pages.some(({ html }) => retired.some((p) => html.includes(`href="${p}"`))), pages.filter(({ html }) => retired.some((p) => html.includes(`href="${p}"`))).map(({ r }) => r.path));
// V18.2: the owner removed the Who We Serve group and its pages. Four link groups remain, with no empty column.
const footBlock = (homeHtml.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
const footGroups = [...footBlock.matchAll(/<nav aria-label="Footer: ([^"]+)"[^>]*>\s*<h2[^>]*>[^<]+<\/h2>\s*<ul[^>]*>([\s\S]*?)<\/ul>/g)].map((m) => ({ h: m[1], n: (m[2].match(/<li[\s>]/g) || []).length }));
check('Footer has exactly Services, Company and Resources, each with links, and no Who We Serve or Explore group', footGroups.map((g) => g.h).join('|') === 'Services|Company|Resources' && footGroups.every((g) => g.n > 0) && !/Who We Serve|>Explore<|for-real-estate-photographers|for-brokerages|design-styles|design-library/.test(footBlock), footGroups.map((g) => `${g.h}:${g.n}`).join(' '));
const footHtml = (homeHtml.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
const footGroup = (h) => { const m = footHtml.match(new RegExp(`<h2>${h}</h2>\\s*<ul>([\\s\\S]*?)</ul>`)); return m ? [...m[1].matchAll(/<a[^>]*>([^<]*)<\/a>/g)].map((x) => x[1]) : []; };
const wantFoot = { Company: ['About StageLiora', 'About Devender Garg', 'Contact'], Resources: ['Guides', 'How It Works', 'Portfolio'] };
const footBad = Object.entries(wantFoot).flatMap(([h, ls]) => { const got = footGroup(h); return [...ls.filter((l) => !got.includes(l)).map((l) => `${h} lacks ${l}`), ...(new Set(got).size !== got.length ? [`${h} has a duplicate`] : [])]; });
check('Footer groups hold the required links with no duplicates within a group', !footBad.length, footBad);

// Approved logo (V16.0): one shared component, owner-approved artwork, linked home, intrinsic size, header not lazy.
const logoRe = (variant) => new RegExp(`<a class="brand-logo brand-logo--${variant}" href="/" aria-label="StageLiora — Home">\\s*<img src="/media/brand/stageliora-logo-\\d+w\\.webp" srcset="[^"]+" sizes="[^"]+" width="2084" height="562" alt="" loading="${variant === 'header' ? 'eager' : 'lazy'}"`);
const logoMiss = pages.filter(({ html }) => !logoRe('header').test(html) || !logoRe('footer').test(html)).map(({ r }) => r.path);
check('Every page shows the approved logo in the header and footer, linked home', !logoMiss.length, logoMiss.slice(0, 10));
check('No page still renders the old text wordmark', !pages.some(({ html }) => /class="logo"[^>]*>Stage<i/.test(html)));
const { approvals: liveApprovals } = await import('../src/data/approvals.ts');
check('Logo artwork is backed by an owner approval and an untouched source file', Boolean(liveApprovals.brandLogo?.reference) && fs.existsSync('src/assets/brand/stageliora-primary-horizontal.png') && [320, 480, 640, 960].every((w) => fs.existsSync(`public/media/brand/stageliora-logo-${w}w.webp`)));

check('Brand images are owner-licensed, owner-approved and present on disk', brandMedia.length > 0 && brandMedia.every((m) => m.rights === 'owner-licensed' && m.ownerApproved && m.alt && fs.existsSync(path.join('public', m.src)) && (m.responsive || []).every((v) => fs.existsSync(path.join('public', v.src)))));

// Secrets and third parties
const textFiles = walk('dist').filter((f) => /\.(html|js|css|txt|xml)$/.test(f));
const secretHit = textFiles.filter((f) => /sk_live|sk_test|api[_-]?key\s*[:=]|BEGIN (RSA|PRIVATE)/i.test(fs.readFileSync(f, 'utf8')));
check('No secrets in built files', !secretHit.length, secretHit);
// Any absolute script, stylesheet, link or image URL must be on the production host (business.siteUrl).
const third = textFiles.filter((f) => f.endsWith('.html')).filter((f) => [...fs.readFileSync(f, 'utf8').matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)="(https?:\/\/[^"/]+)/gi)].some((m) => m[1] !== business.siteUrl));
check('No third-party scripts, styles or images', !third.length, third);
check('No cookies or storage set by site scripts', !textFiles.filter((f) => f.endsWith('.js')).some((f) => /document\.cookie|localStorage|sessionStorage/.test(fs.readFileSync(f, 'utf8'))));

// ---------- Registry statuses ----------
const FIVE = ['READY_FOR_OWNER_REVIEW', 'APPROVED_FOR_PUBLICATION', 'PUBLIC_BUT_NOINDEX', 'PRIVATE_OR_DISABLED', 'BLOCKED_PENDING_EVIDENCE'];
check('Every route has one of the five publication statuses', routes.every((r) => FIVE.includes(publicationOf(r))));
check('No route is APPROVED_FOR_PUBLICATION without a documented approval', routes.filter((r) => publicationOf(r) === 'APPROVED_FOR_PUBLICATION').length === Object.keys(approvals.publication).length);
const founderRoute = routes.find((r) => r.template === 'founder');
check('Founder page content counts as approved only with its own approval record', founderRoute && contentApprovalOf(founderRoute) === (approvals.founderStatements ? 'APPROVED' : 'NOT_APPROVED') && designApprovalOf(founderRoute) === contentApprovalOf(founderRoute));
check(`Owner content and design approval is recorded for all ${60 - retired.length} remaining V3.0 routes (60 approved, ${retired.length} retired in V18-V20)`, routes.filter((r) => r.template !== 'founder').length === 60 - retired.length && routes.filter((r) => r.template !== 'founder').every((r) => contentApprovalOf(r) === 'APPROVED' && designApprovalOf(r) === 'APPROVED') && /V3\.0/.test(approvals.websiteContent.reference) && /V3\.0/.test(approvals.pageDesign.reference));
{
  const { plans, approvedPrice } = await import('../src/data/pricing-plans.ts');
  const pricingHtml = fs.readFileSync(path.join('dist', 'pricing', 'index.html'), 'utf8');
  const shown = [...pricingHtml.matchAll(/\$\d[\d,]*(?:\.\d+)?/g)].map((m) => m[0]);
  check('Pricing: exactly four plan cards in the configured order', plans.map((p) => p.planName).join('|') === 'Pay As You Go|Essential Bundle|Plus Bundle|Dedicated Assistance' && (pricingHtml.match(/class="plan(?: plan--assist)?"/g) || []).length === 4, (pricingHtml.match(/class="plan[^"]*"/g) || []).join(' '));
  check('Pricing: no dollar figure is shown unless an owner record approves it', plans.some((p) => approvedPrice(p.planId)) || shown.length === 0, shown.join(' '));
  const pp = await import('../src/data/pricing-plans.ts');
  check('Pricing math: $20 base less 10%, 20%, 30% is exactly $18, $16, $14 (integer cents)', pp.discounted(2000, 10) === 1800 && pp.discounted(2000, 20) === 1600 && pp.discounted(2000, 30) === 1400 && pp.proposals['pay-as-you-go'].calculatedRate === 1800 && pp.proposals['essential-bundle'].calculatedRate === 1600 && pp.proposals['plus-bundle'].calculatedRate === 1400);
  check('Pricing: USD formatting', pp.usd(1800) === '$18' && pp.usd(300000) === '$3,000' && pp.usd(1450) === '$14.50' && pp.usd(2000) === '$20');
  check('Pricing: unknown terms are null, never zero; no bundle total without approved quantity', Object.values(pp.proposals).every((t) => t.bundleQuantity === null && t.bundlePrepayment === null && t.includedCredits === null && t.minimumOrder === null && !t.isApproved) && pp.bundleTotal(null, 1600) === null && pp.bundleTotal(10, null) === null && pp.bundleTotal(10, 1600) === 16000);
  check('Pricing: proposed rates are never published without approval', plans.some((p) => approvedPrice(p.planId)) || !/\$18\b|\$16\b|\$14\b|\$3,000|\$12\b|\$20\b/.test(pricingHtml));
  // Savings claims: none at all unless approvals.pricingClaims.bundleSavings is recorded, and then only the computed, rounded-down figures.
  const savingsOn = pp.bundleSavingsApproved();
  const allowedSave = new Set(savingsOn ? plans.map((p) => pp.planBadge(p.planId)).filter((b) => b?.tone === 'save').map((b) => b.text) : []);
  const saveShown = [...pricingHtml.matchAll(/Save \d+%/gi)].map((m) => m[0]);
  check('Pricing: no crossed-out prices, unapproved savings claims, totals or checkout links', !/<(s|del|strike)\b|line-through|\d+% off|Total:|href="[^"]*\/(order|upload|account|checkout)\//i.test(pricingHtml) && saveShown.every((s) => allowedSave.has(s)), saveShown.join(' '));
  check('Pricing math V13: savings vs the $18 Pay As You Go rate round down to 11% and 22%, never up', pp.savingsPercent(1600, 1800) === 11 && pp.savingsPercent(1400, 1800) === 22 && pp.savingsPercent(1800, 1800) === null && pp.savingsPercent(1900, 1800) === null && pp.savingsPercent(1400, 0) === null);
  check('Pricing: the $20 internal base is never shown on the page', !/\$20\b/.test(pricingHtml));
  check('Pricing: every card carries exactly one label above its heading', (pricingHtml.match(/class="plan__badge[^"]*"[^>]*>[\s\S]*?<\/p>\s*<h3 class="plan__name"/g) || []).length === (plans.every((p) => pp.planBadge(p.planId)) ? 4 : (pricingHtml.match(/class="plan__badge/g) || []).length));
  check('Pricing: savings disclosure appears once only when savings badges are published, and never otherwise', savingsOn ? (pricingHtml.match(/Bundle savings are compared with/g) || []).length === 1 : !/Bundle savings are compared with|Save \d+%/.test(pricingHtml));
  check('Pricing: without bundle approval, labels are Bundle Rate and Lowest Per-Photo Rate; Dedicated is Annual Plan', savingsOn || (pp.planBadge('essential-bundle')?.text === 'Bundle Rate' && pp.planBadge('plus-bundle')?.text === 'Lowest Per-Photo Rate' && pp.planBadge('dedicated-assistance')?.text === 'Annual Plan'));
  check('Pricing: "No Bundle Required" only with an owner record', pp.planBadge('pay-as-you-go')?.text !== 'No Bundle Required' || Boolean((await import('../src/data/approvals.ts')).approvals.pricingClaims.noBundleRequired));
  check('Pricing: Dedicated Assistance offers Call StageLiora (tel) and Contact Us', /plan--assist[\s\S]*?href="tel:\+918890929329"[\s\S]*?Contact Us/.test(pricingHtml));
  check('Pricing: no rendered figure differs from the approval records', (() => { const allowed = new Set(plans.map((p) => pp.headline(p.planId)?.amount).filter(Boolean)); const inCards = [...pricingHtml.matchAll(/class="plan__amount"><span>([^<]+)<\/span>/g)].map((m) => m[1]); return inCards.every((a) => allowed.has(a)); })());
  check('Pricing: no reference-site prices, unapproved savings badges or Individuals/Teams tabs', !/\$35\b|\$28\b|\$24\.50|\$399|\$799|Save 20%|Save 30%|Most Popular|For Individuals|For Teams/.test(pricingHtml) && saveShown.every((s) => allowedSave.has(s)));
}
check('No signer or signature was invented', /no named signer/.test(approvals.websiteContent.by));
// V30: the only publication records are the V23.1 location routes and the exact V30 release set; only two legal sign-offs exist.
const V30_SET = new Set((await import('../src/data/approvals.ts')).V30_CORE_ROUTES);
check('V30 release set is exactly 18 core routes and excludes /request-quote/ and /portfolio/', V30_SET.size === 18 && !V30_SET.has('/request-quote/') && !V30_SET.has('/portfolio/'));
check('Content approval did not create any other approval', Object.entries(approvals.publication).every(([p, a]) => (p.startsWith('/locations/') && /^V23\.1: /.test(a.reference) && /no named signer/.test(a.by)) || (V30_SET.has(p) && /^V30: /.test(a.reference) && /no signature/.test(a.by))) && Object.keys(approvals.publication).length === 31 && Object.keys(approvals.indexing).length === 0 && Object.entries(approvals.services).every(([k, v]) => k === 'virtual-staging' && /^V27: .*V30: S7/.test(v.reference) && v.disclosureRestrictionsReviewed === true) && Object.keys(approvals.prices).length === 0 && Object.keys(approvals.legalReview).sort().join() === 'privacy-policy,terms-of-service' && Object.values(approvals.legalReview).every((a) => /^V30: /.test(a.reference) && /no attorney review/.test(a.reference)) && Object.values(approvals.coverage).every((c) => /^V23: /.test(c.reference) && /no named signer/.test(c.by)) && (!approvals.publicDeployment || /^V24: /.test(approvals.publicDeployment.reference)) && !approvals.searchIndexing && !approvals.formDeliveryVerified && !approvals.genuineReviews);
check('Service slugs were not changed by the hostname migration', routes.some((r) => r.path === '/locations/st-petersburg-fl/'));
const oldHost = ['st-petersburg', 'stageliora', 'com'].join('.');
const scan = walk('dist').filter((f) => /\.(html|txt|xml|js)$/.test(f)).filter((f) => fs.readFileSync(f, 'utf8').includes(oldHost));
check('Old hostname is absent from the build', scan.length === 0, scan);
const srcScan = [...walk('src'), ...walk('scripts'), ...walk('server'), ...walk('functions'), 'astro.config.mjs', '.env.example', 'README.md'].filter((f) => fs.readFileSync(f, 'utf8').includes(oldHost));
check('Old hostname is absent from code and configuration', srcScan.length === 0, srcScan);
const metaBad = pages.filter(({ r, html }) => !html.includes(`property="og:url" content="${business.siteUrl}${r.path}"`) || !html.includes('name="twitter:card"') || !html.includes(`"url":"${business.siteUrl}"`)).map(({ r }) => r.path);
check('Open Graph, Twitter and structured data use the new hostname', metaBad.length === 0, metaBad);
check('Build, publication, indexing and owner statuses are separate fields', routes.every((r) => buildStatusOf(r) && publicationOf(r) && indexingOf(r) && ownerApprovalOf(r)));
check('No FAQ rich-result schema', !pages.some(({ html }) => /FAQPage/.test(html)));
// Point 1 owner decision (2026-11-13): areaServed is allowed only on Service nodes, only with the approved St. Petersburg value.
const ldNodes = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => { try { const j = JSON.parse(m[1]); return j['@graph'] ?? [j]; } catch { return []; } });
const approvedArea = JSON.stringify(business.serviceArea);
const areaBad = pages.flatMap(({ r, html }) => ldNodes(html).filter((n) => 'areaServed' in n && (n['@type'] !== 'Service' || JSON.stringify(n.areaServed) !== approvedArea)).map(() => r.path));
check('Service-area schema appears only on Service nodes with the approved St. Petersburg value', !areaBad.length, areaBad);
const svcPages = pages.filter(({ r }) => r.template === 'service');
check('Every service page Service schema names the approved service area', svcPages.length > 0 && svcPages.every(({ html }) => ldNodes(html).some((n) => n['@type'] === 'Service' && JSON.stringify(n.areaServed) === approvedArea)), svcPages.length);
check('Removed unverified facts are gone', !pages.some(({ html }) => /27 acres|100\.6 road|six feet of surge/.test(html)));

// ---------- Production release matrix (real builds through the real script) ----------
const prod = (fixture) => {
  const out = fixture ? `dist-qa/${fixture}` : 'dist-production';
  const r = spawnSync('node', ['scripts/build-production.mjs'], { encoding: 'utf8', env: { ...process.env, ...(fixture ? { QA_FIXTURE: fixture } : {}), OUT_DIR: out, SITE_MODE: '', INDEXING: '' } });
  return { code: r.status, out, text: r.stdout + r.stderr, exists: fs.existsSync(out) };
};
const none = prod(null);
// Current real approvals (V30): exactly the 31 approved routes build, still noindex with an empty sitemap and no draft material.
const builtIdx = none.exists ? walk('dist-production').filter((x) => x.endsWith('index.html')) : [];
check('Current approvals: production build succeeds with exactly the 31 approved routes', none.code === 0 && none.exists && builtIdx.length === 31 && Object.keys(approvals.publication).every((p) => fs.existsSync(path.join('dist-production', p, 'index.html'))), none.text);
if (none.exists) {
  const ph = builtIdx.map((x) => fs.readFileSync(x, 'utf8'));
  check('Current approvals: /request-quote/, /portfolio/ and private routes are not built', ['/request-quote/', '/portfolio/', '/reviews/', '/order/', '/account/', '/orders/', '/upload/'].every((p) => !fs.existsSync(path.join('dist-production', p, 'index.html'))));
  check('Current approvals: every page noindex, sitemap empty, header noindex', ph.every((h) => /<meta name="robots" content="noindex/.test(h)) && !/<loc>/.test(fs.readFileSync('dist-production/sitemap.xml', 'utf8')) && /X-Robots-Tag: noindex/.test(fs.readFileSync('dist-production/_headers', 'utf8')));
  check('Current approvals: no draft notice, placeholder or preview ribbon in production', ph.every((h) => !/not yet in force|\(Draft\)|Draft: awaiting|class="ribbon"|\[[A-Z][^\]]*pending/i.test(h)));
  check('Current approvals: bookings stay closed on the homepage and Contact', ['index.html', 'contact/index.html'].every((p) => /bookings are not open yet/.test(fs.readFileSync(path.join('dist-production', p), 'utf8'))));
  check('Current approvals: Portfolio is not linked from production pages', !ph.some((h) => /href="\/portfolio\//.test(h)));
}
const raw = spawnSync('npx', ['astro', 'build'], { encoding: 'utf8', shell: true, env: { ...process.env, SITE_MODE: 'production', OUT_DIR: 'dist-qa/raw' } });
check('Raw production build without the release script is refused', raw.status !== 0 && !fs.existsSync('dist-qa/raw/index.html'));
// The real release now builds dist-production (V30), so the check is that the fixture is refused and leaves that output untouched.
const realIdx = 'dist-production/index.html';
const before = fs.existsSync(realIdx) ? fs.statSync(realIdx).mtimeMs + ':' + fs.readFileSync(realIdx, 'utf8').length : 'absent';
const refuse = spawnSync('node', ['scripts/build-production.mjs'], { encoding: 'utf8', env: { ...process.env, QA_FIXTURE: 'valid', OUT_DIR: 'dist-production' } });
const after = fs.existsSync(realIdx) ? fs.statSync(realIdx).mtimeMs + ':' + fs.readFileSync(realIdx, 'utf8').length : 'absent';
check('QA fixture cannot build into the real output folder', refuse.status === 1 && /Refusing: QA_FIXTURE/.test(refuse.stdout + refuse.stderr) && before === after && !(fs.existsSync(realIdx) && /QA-FIXTURE/.test(fs.readFileSync(realIdx, 'utf8'))));
for (const [fixture, why] of [['no-content-approval', 'content approval missing'], ['no-deployment-approval', 'deployment approval missing']]) {
  const x = prod(fixture); check(`Blocked when ${why}`, x.code === 2 && !x.exists, x.text);
}
for (const [fixture, why] of [['unapproved-image', 'a public page uses an unapproved image'], ['no-legal', 'legal review missing'], ['unapproved-service', 'service not approved'], ['incomplete-service', 'service answers incomplete'], ['private-route', 'disabled route approved'], ['index-unpublished', 'indexing an unpublished route'], ['index-noindex-route', 'indexing a noindex route'], ['no-coverage', 'location coverage missing'], ['placeholder-portfolio', 'portfolio of placeholders'], ['fake-reviews', 'reviews page with no reviews'], ['unknown-route', 'unknown route approved'], ['unsigned', 'approval without who or when']]) {
  const x = prod(fixture); check(`Invalid when ${why}`, x.code === 1 && !x.exists, x.text);
}
const cand = spawnSync('node', ['scripts/build-production.mjs', '--candidate'], { encoding: 'utf8', env: { ...process.env, OUT_DIR: 'dist-qa/candidate', SITE_MODE: '', INDEXING: '' } });
const candList = candidateRoutes().map((r) => r.path);
check(`Release candidate builds the ${candList.length} routes with no unmet dependency`, cand.status === 0 && candList.every((p) => fs.existsSync(path.join('dist-qa/candidate', p, 'index.html'))) && walk('dist-qa/candidate').filter((f) => f.endsWith('index.html')).length === candList.length, cand.stdout + cand.stderr);
check('Release candidate is marked, noindex, with an empty sitemap', fs.existsSync('dist-qa/candidate/NOT-AUTHORIZED-FOR-DEPLOYMENT.txt') && !/<loc>/.test(fs.readFileSync('dist-qa/candidate/sitemap.xml', 'utf8')) && /X-Robots-Tag: noindex/.test(fs.readFileSync('dist-qa/candidate/_headers', 'utf8')));
const V = prod('valid');
check('Valid fixture: production build succeeds', V.code === 0 && V.exists, V.text);
if (V.exists) {
  const pub = Object.keys(fixtureValid.publication), idx = Object.keys(fixtureValid.indexing);
  const G = V.out;
  check(`Valid fixture: exactly the ${pub.length} approved routes exist`, walk(G).filter((f) => f.endsWith('index.html')).length === pub.length && pub.every((p) => fs.existsSync(path.join(G, p, 'index.html'))));
  check('Valid fixture: gated, draft and private routes are absent', ['/order/', '/account/', '/orders/', '/upload/', '/reviews/', '/portfolio/', '/design-library/', '/locations/gulfport/', '/services/interior-color-changes/'].every((p) => !fs.existsSync(path.join(G, p, 'index.html'))));
  const gh = walk(G).filter((f) => f.endsWith('.html')).map((f) => [f, fs.readFileSync(f, 'utf8')]);
  const gbad = new Set();
  for (const [f, html] of gh) for (const m of html.matchAll(/\b(?:href|src)="(\/[^"]*)"/g)) { const c = m[1].split(/[?#]/)[0]; const t = path.join(G, c); if (!(fs.existsSync(t) && (fs.statSync(t).isFile() || fs.existsSync(path.join(t, 'index.html'))))) gbad.add(`${f}: ${m[1]}`); }
  check('Valid fixture: no broken links after exclusions', gbad.size === 0, [...gbad].slice(0, 15));
  const gsm = fs.readFileSync(path.join(G, 'sitemap.xml'), 'utf8');
  const locs = [...gsm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(`Valid fixture: sitemap has exactly the ${idx.length} index-approved URLs`, locs.length === idx.length && idx.every((p) => locs.includes(`${business.siteUrl}${p}`)), locs.join(' '));
  check('Valid fixture: lastmod only where known', /<lastmod>2026-11-05<\/lastmod>/.test(gsm) && /<loc>[^<]*\/locations\/st-petersburg-fl\/<\/loc>\s*<lastmod>2026-11-12<\/lastmod>/.test(gsm) && (gsm.match(/<lastmod>/g) || []).length === 3);
  check('Valid fixture: published but not index-approved pages carry noindex', /noindex/.test(fs.readFileSync(path.join(G, 'faq/index.html'), 'utf8')) && /noindex/.test(fs.readFileSync(path.join(G, 'request-quote/index.html'), 'utf8')));
  check('Valid fixture: approved pages are indexable and draft wording is gone', /content="index,follow/.test(fs.readFileSync(path.join(G, 'index.html'), 'utf8')) && !gh.some(([, h]) => /class="ribbon"|Not yet offered|Bookings not yet open|Draft: not reviewed/.test(h)));
  check('Valid fixture: robots.txt allows crawling and names the sitemap', /Allow: \//.test(fs.readFileSync(path.join(G, 'robots.txt'), 'utf8')) && fs.readFileSync(path.join(G, 'robots.txt'), 'utf8').includes(`Sitemap: ${business.siteUrl}/sitemap.xml`));
  check('Valid fixture: no global noindex header overriding approved pages', !/X-Robots-Tag/.test(fs.readFileSync(path.join(G, '_headers'), 'utf8')));
  check('Valid fixture: homepage drops placeholder portfolio and style sections', !/Rooms in each design direction|Match the style to the house/.test(fs.readFileSync(path.join(G, 'index.html'), 'utf8')));
  check('Valid fixture: no empty footer column', !gh.some(([, h]) => /<h2>[^<]*<\/h2>\s*<ul>\s*<\/ul>/.test(h)));
  check('Valid fixture: St. Petersburg guide omits snippet-only facts', !/from a search summary/.test(fs.readFileSync(path.join(G, 'locations/st-petersburg-fl/index.html'), 'utf8')));
}
const NI = prod('valid-no-indexing');
check('Published without indexing approval: build succeeds, sitemap empty, global noindex, no sitemap line', NI.code === 0 && !/<loc>/.test(fs.readFileSync(path.join(NI.out, 'sitemap.xml'), 'utf8')) && /X-Robots-Tag: noindex/.test(fs.readFileSync(path.join(NI.out, '_headers'), 'utf8')) && !/Sitemap:/.test(fs.readFileSync(path.join(NI.out, 'robots.txt'), 'utf8')) && !/Disallow: \/\s*$/m.test(fs.readFileSync(path.join(NI.out, 'robots.txt'), 'utf8')));
fs.rmSync('dist-qa', { recursive: true, force: true });
fs.rmSync('dist-production', { recursive: true, force: true });

const failed = results.filter((r) => !r.pass);
fs.mkdirSync('qa-output', { recursive: true });
fs.writeFileSync('qa-output/qa-static.json', JSON.stringify({ date: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 1));
console.log(`\nStatic QA: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
