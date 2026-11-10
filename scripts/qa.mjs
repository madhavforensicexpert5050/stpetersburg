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
check(`Registry matches the owner final structure (60 routes, ${retired.length} retired in V18, plus the V10.1 founder page)`, expected.length === 60 && retired.every((p) => expected.includes(p)) && [...current, ...addedLater].every((p) => reg.includes(p)) && reg.every((p) => current.includes(p) || addedLater.includes(p)), `expected ${current.length}, registry ${reg.length}; missing: ${current.filter((p) => !reg.includes(p))}; extra: ${reg.filter((p) => !current.includes(p) && !addedLater.includes(p))}`);
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
const orphanOk = orphans.every((p) => ['/order/', '/account/', '/orders/', '/upload/'].includes(p));
check('No orphan pages (internal order routes deliberately unlinked)', orphanOk, `unlinked: ${orphans.join(' ')}`);
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
check('Synthetic examples are disclosed and remain separate from licensed client work', media.every((m) => m.rights === 'owner-licensed' || (!m.ownerApproved && (m.rights === 'project-placeholder' ? fs.readFileSync(path.join('public', m.src), 'utf8').includes('ILLUSTRATION') : m.rights === 'ai-generated' && m.publication === 'synthetic-preview-only' && /AI-created|AI-generated/.test(m.caption) && /^AI-(created|generated)/.test(m.alt)))));
const { brandMedia } = await import('../src/data/media.ts');
check('Images are served only through the manifest (property examples or approved brand images)', all.every(([, h]) => [...h.matchAll(/<img[^>]+src="(\/media[^"]+)"/g)].every((m) => media.some((x) => x.src === m[1]) || brandMedia.some((x) => x.src === m[1]))));
// Image-specific wording must describe the file actually shown (image-notes.ts, visual-pages.ts).
const { staleNotes } = await import('../src/data/image-notes.ts');
const { portfolioPage } = await import('../src/data/visual-pages.ts');
const stale = [...staleNotes(media), ...portfolioPage.stories.filter((s) => media.find((m) => m.id === `${s.key}-after`)?.src !== s.afterSrc).map((s) => `story:${s.key}`)];
check('Image captions and portfolio explanations match the image files they were written for', !stale.length, `Recheck the text against the new image, then update its src: ${stale.join(' ')}`);

// The three visual pages answer different questions, so they share no sentence and no FAQ with each other or the site.
const VISUAL = ['/design-styles/', '/design-library/', '/portfolio/'];
const visualMain = (h) => visible(((h.match(/<main[\s\S]*?<\/main>/) || [''])[0]).replace(/<section class="cta-band"[\s\S]*?<\/section>/g, ''));
const sentencesOf = (h) => new Set(visualMain(h).split(/(?<=[.?!])\s+/).map((s) => s.trim().toLowerCase()).filter((s) => s.split(/\s+/).length >= 8));
const vis = VISUAL.map((p) => [p, sentencesOf(pages.find((x) => x.r.path === p).html)]);
const shared = [];
for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) for (const s of vis[i][1]) if (vis[j][1].has(s)) shared.push(`${vis[i][0]} & ${vis[j][0]}: "${s.slice(0, 80)}"`);
check('Design Styles, Design Library and Portfolio share no sentence of eight words or more', !shared.length, shared.slice(0, 8));
const faqQs = (h) => [...((h.match(/<main[\s\S]*?<\/main>/) || [''])[0]).matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map((m) => visible(m[1]).trim().toLowerCase());
const faqDup = [];
for (const p of VISUAL) for (const q of faqQs(pages.find((x) => x.r.path === p).html)) for (const o of pages) if (o.r.path !== p && faqQs(o.html).includes(q)) faqDup.push(`${p} & ${o.r.path}: ${q}`);
check('FAQ questions on the visual pages appear nowhere else on the site', !faqDup.length, faqDup);

// V18 consolidation: the retired agents page was spread over these pages. Nothing migrated may be pasted twice.
// Deliberately shared components are removed first: the CTA band, FAQ answers (the homepage shows a few from /faq/),
// the guide "Keep reading" sidebar, and the five process steps that Home and How It Works both render.
const { process: processSteps } = await import('../src/data/content.ts');
const CONSOLIDATED = ['/', '/how-it-works/', '/pricing/', '/faq/', '/guides/virtual-staging-for-real-estate-agents/', '/guides/how-to-prepare-photos-for-virtual-staging/', '/guides/virtual-staging-disclosure-florida/', '/services/furniture-removal-and-staging/', '/guides/virtual-staging-faqs/'];
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

// Navigation (owner spec, header and footer update)
const homeHtml = pages.find((x) => x.r.path === '/').html;
const navHtml = (homeHtml.match(/<nav class="nav"[\s\S]*?<\/nav>/) || [''])[0];
const topItems = [...navHtml.replace(/<div class="mega">[\s\S]*?<\/details>/g, '</details>').matchAll(/<(?:a|summary)\b[^>]*>([\s\S]*?)<\/(?:a|summary)>/g)].map((m) => visible(m[1]).trim());
check('Header nav reads Home | Services | How It Works | Portfolio | Pricing', topItems.join('|') === 'Home|Services|How It Works|Portfolio|Pricing', topItems.join('|'));
check('Header phone button shows the verified number and dials tel:+918890929329', /<a class="head-call" href="tel:\+918890929329"[^>]*>[\s\S]*?<svg[\s\S]*?\+91 88909 29329/.test(homeHtml));
// V18: the agents landing page was retired, so Real Estate opens the agent guide that absorbed its content.
const AGENT_GUIDE = '/guides/virtual-staging-for-real-estate-agents/';
check('Header has no Real Estate item (owner V18.1), and the agent guide is still linked from the footer', !topItems.includes('Real Estate') && !navHtml.includes(`href="${AGENT_GUIDE}"`) && (homeHtml.split('<footer')[1] || '').includes(`href="${AGENT_GUIDE}">Real Estate Agents<`));
check('No page links to a retired route', !pages.some(({ html }) => retired.some((p) => html.includes(`href="${p}"`))), pages.filter(({ html }) => retired.some((p) => html.includes(`href="${p}"`))).map(({ r }) => r.path));
const footWho = ((homeHtml.match(/<footer[\s\S]*?<\/footer>/) || [''])[0].match(/<h2>Who We Serve<\/h2>\s*<ul>([\s\S]*?)<\/ul>/) || ['', ''])[1];
check('Footer Who We Serve keeps Photographers and Brokerages, and Real Estate Agents opens the agent guide', footWho.includes(`href="${AGENT_GUIDE}">Real Estate Agents<`) && footWho.includes('href="/for-real-estate-photographers/">Photographers<') && footWho.includes('href="/for-brokerages/">Brokerages<'), footWho);
const footHtml = (homeHtml.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
const footGroup = (h) => { const m = footHtml.match(new RegExp(`<h2>${h}</h2>\\s*<ul>([\\s\\S]*?)</ul>`)); return m ? [...m[1].matchAll(/<a[^>]*>([^<]*)<\/a>/g)].map((x) => x[1]) : []; };
const wantFoot = { Company: ['About StageLiora', 'About Devender Garg', 'Contact'], 'Who We Serve': ['Real Estate Agents', 'Photographers', 'Brokerages'], Explore: ['Design Styles', 'Design Library', 'Portfolio'], Resources: ['Guides', 'How It Works'] };
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
const third = textFiles.filter((f) => f.endsWith('.html')).filter((f) => /<(script|link|img)\b[^>]*(src|href)="https?:\/\/(?!st\.petersburg\.stageliora\.com)/i.test(fs.readFileSync(f, 'utf8')));
check('No third-party scripts, styles or images', !third.length, third);
check('No cookies or storage set by site scripts', !textFiles.filter((f) => f.endsWith('.js')).some((f) => /document\.cookie|localStorage|sessionStorage/.test(fs.readFileSync(f, 'utf8'))));

// ---------- Registry statuses ----------
const FIVE = ['READY_FOR_OWNER_REVIEW', 'APPROVED_FOR_PUBLICATION', 'PUBLIC_BUT_NOINDEX', 'PRIVATE_OR_DISABLED', 'BLOCKED_PENDING_EVIDENCE'];
check('Every route has one of the five publication statuses', routes.every((r) => FIVE.includes(publicationOf(r))));
check('No route is APPROVED_FOR_PUBLICATION without a documented approval', routes.filter((r) => publicationOf(r) === 'APPROVED_FOR_PUBLICATION').length === Object.keys(approvals.publication).length);
const founderRoute = routes.find((r) => r.template === 'founder');
check('Founder page content counts as approved only with its own approval record', founderRoute && contentApprovalOf(founderRoute) === (approvals.founderStatements ? 'APPROVED' : 'NOT_APPROVED') && designApprovalOf(founderRoute) === contentApprovalOf(founderRoute));
check(`Owner content and design approval is recorded for all ${60 - retired.length} remaining V3.0 routes (60 approved, ${retired.length} retired in V18)`, routes.filter((r) => r.template !== 'founder').length === 60 - retired.length && routes.filter((r) => r.template !== 'founder').every((r) => contentApprovalOf(r) === 'APPROVED' && designApprovalOf(r) === 'APPROVED') && /V3\.0/.test(approvals.websiteContent.reference) && /V3\.0/.test(approvals.pageDesign.reference));
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
check('Content approval did not create any other approval', Object.keys(approvals.publication).length === 0 && Object.keys(approvals.indexing).length === 0 && Object.keys(approvals.services).length === 0 && Object.keys(approvals.prices).length === 0 && Object.keys(approvals.legalReview).length === 0 && Object.keys(approvals.coverage).length === 0 && !approvals.publicDeployment && !approvals.searchIndexing && !approvals.formDeliveryVerified && !approvals.genuineReviews);
check('Service slugs were not changed by the hostname migration', routes.some((r) => r.path === '/locations/st-petersburg-fl/'));
const oldHost = ['st-petersburg', 'stageliora', 'com'].join('.');
const scan = walk('dist').filter((f) => /\.(html|txt|xml|js)$/.test(f)).filter((f) => fs.readFileSync(f, 'utf8').includes(oldHost));
check('Old hostname is absent from the build', scan.length === 0, scan);
const srcScan = [...walk('src'), ...walk('scripts'), ...walk('server'), ...walk('functions'), 'astro.config.mjs', '.env.example', 'README.md'].filter((f) => fs.readFileSync(f, 'utf8').includes(oldHost));
check('Old hostname is absent from code and configuration', srcScan.length === 0, srcScan);
const metaBad = pages.filter(({ r, html }) => !html.includes(`property="og:url" content="https://st.petersburg.stageliora.com${r.path}"`) || !html.includes('name="twitter:card"') || !html.includes('"url":"https://st.petersburg.stageliora.com"')).map(({ r }) => r.path);
check('Open Graph, Twitter and structured data use the new hostname', metaBad.length === 0, metaBad);
check('Build, publication, indexing and owner statuses are separate fields', routes.every((r) => buildStatusOf(r) && publicationOf(r) && indexingOf(r) && ownerApprovalOf(r)));
check('No FAQ rich-result schema or unapproved service-area schema', !pages.some(({ html }) => /FAQPage|areaServed/.test(html)));
check('Removed unverified facts are gone', !pages.some(({ html }) => /27 acres|100\.6 road|six feet of surge/.test(html)));

// ---------- Production release matrix (real builds through the real script) ----------
const prod = (fixture) => {
  const out = fixture ? `dist-qa/${fixture}` : 'dist-production';
  const r = spawnSync('node', ['scripts/build-production.mjs'], { encoding: 'utf8', env: { ...process.env, ...(fixture ? { QA_FIXTURE: fixture } : {}), OUT_DIR: out, SITE_MODE: '', INDEXING: '' } });
  return { code: r.status, out, text: r.stdout + r.stderr, exists: fs.existsSync(out) };
};
const none = prod(null);
check('No approvals: release is BLOCKED, exit 2, nothing built', none.code === 2 && !none.exists && /PRODUCTION RELEASE BLOCKED/.test(none.text), none.text);
const raw = spawnSync('npx', ['astro', 'build'], { encoding: 'utf8', shell: true, env: { ...process.env, SITE_MODE: 'production', OUT_DIR: 'dist-qa/raw' } });
check('Raw production build without the release script is refused', raw.status !== 0 && !fs.existsSync('dist-qa/raw/index.html'));
const refuse = spawnSync('node', ['scripts/build-production.mjs'], { encoding: 'utf8', env: { ...process.env, QA_FIXTURE: 'valid', OUT_DIR: 'dist-production' } });
check('QA fixture cannot build into the real output folder', refuse.status === 1 && !fs.existsSync('dist-production/index.html'));
for (const [fixture, why] of [['no-content-approval', 'content approval missing'], ['no-deployment-approval', 'deployment approval missing']]) {
  const x = prod(fixture); check(`Blocked when ${why}`, x.code === 2 && !x.exists, x.text);
}
for (const [fixture, why] of [['no-legal', 'legal review missing'], ['unapproved-service', 'service not approved'], ['incomplete-service', 'service answers incomplete'], ['private-route', 'disabled route approved'], ['index-unpublished', 'indexing an unpublished route'], ['index-noindex-route', 'indexing a noindex route'], ['no-coverage', 'location coverage missing'], ['placeholder-portfolio', 'portfolio of placeholders'], ['fake-reviews', 'reviews page with no reviews'], ['unknown-route', 'unknown route approved'], ['unsigned', 'approval without who or when']]) {
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
  check('Valid fixture: lastmod only where known', /<lastmod>2026-11-05<\/lastmod>/.test(gsm) && (gsm.match(/<lastmod>/g) || []).length === 2);
  check('Valid fixture: published but not index-approved pages carry noindex', /noindex/.test(fs.readFileSync(path.join(G, 'faq/index.html'), 'utf8')) && /noindex/.test(fs.readFileSync(path.join(G, 'request-quote/index.html'), 'utf8')));
  check('Valid fixture: approved pages are indexable and draft wording is gone', /content="index,follow/.test(fs.readFileSync(path.join(G, 'index.html'), 'utf8')) && !gh.some(([, h]) => /class="ribbon"|Not yet offered|Bookings not yet open|Draft: not reviewed/.test(h)));
  check('Valid fixture: robots.txt allows crawling and names the sitemap', /Allow: \//.test(fs.readFileSync(path.join(G, 'robots.txt'), 'utf8')) && /Sitemap: https:\/\/st\.petersburg\.stageliora\.com\/sitemap\.xml/.test(fs.readFileSync(path.join(G, 'robots.txt'), 'utf8')));
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
