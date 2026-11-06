// Browser QA in real Chrome against dist/: every route at 11 widths, axe-core, and interaction tests.
// Writes qa-output/qa-browser.json and exits non-zero on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { routes } from '../src/data/routes.ts';

const axeSource = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const WIDTHS = [320, 360, 375, 390, 414, 480, 768, 1024, 1280, 1440, 1920];
const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass, detail: String(detail).slice(0, 2000) }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${!pass && detail ? `\n      ${String(detail).slice(0, 900)}` : ''}`); };

let mockHandler = null;
const { server, origin } = await serve(path.resolve('dist'), 0, { '/__mock/quote': (req, res) => mockHandler(req, res) });
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
// axe has to inject a script, which the site's CSP correctly blocks. It alone runs with CSP bypassed.
const axeCtx = await browser.newContext({ bypassCSP: true, viewport: { width: 1280, height: 900 } });
const axePage = await axeCtx.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${page.url()}: ${m.text()}`); });
page.on('pageerror', (e) => consoleErrors.push(`${page.url()}: ${e.message}`));
const failedRequests = [];
page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/definitely-missing/')) failedRequests.push(`${r.status()} ${r.url()}`); });
const externalRequests = [];
page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) externalRequests.push(r.url()); });

// --- Routes and responsive sweep ---
const overflow = [];
const axeBad = [];
const axeRuns = { n: 0 };
const brokenImages = [];
const tapSmall = new Set();
for (const r of routes) {
  const res = await page.goto(origin + r.path, { waitUntil: 'load' });
  if (res.status() !== 200) failedRequests.push(`route ${res.status()} ${r.path}`);
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 800 });
    const o = await page.evaluate(() => {
      const de = document.documentElement; const excess = de.scrollWidth - de.clientWidth;
      if (excess <= 0) return null;
      const off = [...document.querySelectorAll('body *')].filter((el) => { const b = el.getBoundingClientRect(); return b.right > de.clientWidth + 1 && b.width > 0 && !el.closest('.table-wrap, .strip, .hp, .skip'); }).slice(0, 3).map((el) => el.tagName + '.' + el.className);
      return { excess, off };
    });
    if (o) overflow.push(`${r.path} @${w}: +${o.excess}px ${o.off.join(' | ')}`);
  }
  // Load all lazy images, then verify them
  await page.setViewportSize({ width: 1280, height: 900 });
  const bad = await page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach((i) => { i.loading = 'eager'; });
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((ok) => { i.onload = i.onerror = ok; setTimeout(ok, 4000); }))));
    return imgs.filter((i) => !(i.naturalWidth > 0)).map((i) => i.src);
  });
  bad.forEach((b) => brokenImages.push(`${r.path}: ${b}`));
  // axe at desktop and phone
  await axePage.goto(origin + r.path, { waitUntil: 'load' });
  await axePage.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => null))));
  for (const w of [1280, 375]) {
    await axePage.setViewportSize({ width: w, height: 800 });
    await axePage.addScriptTag({ content: axeSource });
    const v = await axePage.evaluate(async () => {
      const res = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] });
      return res.violations.map((x) => ({ id: x.id, impact: x.impact, n: x.nodes.length, t: x.nodes[0].target.join(' ') }));
    });
    axeRuns.n++;
    v.forEach((x) => axeBad.push(`${r.path} @${w}: ${x.id} [${x.impact}] x${x.n} ${x.t}`));
  }
  // Tap targets on phones: interactive elements below 24px are WCAG 2.5.8 failures
  await page.setViewportSize({ width: 375, height: 800 });
  const small = await page.evaluate(() => [...document.querySelectorAll('main button, main select, main input:not([type=range]):not([type=checkbox]):not([type=file]), header button, header a, .sticky-cta a')].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.height < 40 && !el.closest('.hp'); }).map((el) => el.tagName + ':' + (el.textContent || '').trim().slice(0, 20)));
  small.forEach((s) => tapSmall.add(`${r.path} ${s}`));
}
check(`All ${routes.length} routes return 200 with no failed requests`, failedRequests.length === 0, failedRequests.slice(0, 20).join('\n'));
check(`No horizontal page overflow on any route at ${WIDTHS.length} widths (${routes.length * WIDTHS.length} combinations)`, overflow.length === 0, overflow.slice(0, 25).join('\n'));
check('All images decode on every route', brokenImages.length === 0, brokenImages.slice(0, 20).join('\n'));
check(`axe-core: no violations (${axeRuns.n} runs, WCAG 2.2 AA and best-practice)`, axeBad.length === 0, [...new Set(axeBad)].slice(0, 40).join('\n'));
check('Phone controls in header and main are at least 40px tall', tapSmall.size === 0, [...tapSmall].slice(0, 20).join('\n'));
check('No requests to third parties', externalRequests.length === 0, [...new Set(externalRequests)].slice(0, 10).join('\n'));

// --- Layout shift on key pages ---
const cls = [];
for (const p of ['/', '/services/', '/pricing/', '/guides/what-is-virtual-staging/', '/locations/st-petersburg-fl/', '/design-library/']) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(origin + p, { waitUntil: 'load' });
  const v = await page.evaluate(() => new Promise((ok) => { let s = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) s += e.value; }).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => ok(s), 1800); }));
  cls.push([p, v]);
}
check('Layout shift below 0.1 on key pages (local, desktop)', cls.every(([, v]) => v < 0.1), cls.map(([p, v]) => `${p} ${v.toFixed(3)}`).join(', '));

// --- Location graphic ---
await page.goto(origin + '/locations/largo/');
check('Location page shows a labeled housing-mix bar and text key', (await page.locator('.mixbar[role=img]').getAttribute('aria-label')).includes('26% mobile homes') && (await page.locator('.mixkey li').count()) === 4);

// --- 404 ---
await page.setViewportSize({ width: 1280, height: 900 });
const r404 = await page.goto(`${origin}/definitely-missing/`);
check('Custom 404 page is served with a 404 status', r404.status() === 404 && (await page.locator('h1').innerText()).includes('Nothing is staged here'));
check('404 links home and is noindex', (await page.locator('main a[href="/"]').count()) === 1 && (await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'));

// --- Slider ---
await page.goto(origin + '/');
await page.waitForTimeout(1700);
const sl = page.locator('[data-compare]').nth(1);
await sl.scrollIntoViewIfNeeded();
const clipOf = () => sl.locator('.compare__after').evaluate((el) => getComputedStyle(el).clipPath);
const start = await clipOf();
const input = sl.locator('input[type=range]');
await input.focus();
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
const afterKeys = await clipOf();
check('Slider: arrow keys move the divider', start !== afterKeys && (await input.inputValue()) === '52', `${start} -> ${afterKeys}`);
await page.keyboard.press('Home'); check('Slider: Home goes to 0', (await input.inputValue()) === '0');
await page.keyboard.press('End'); check('Slider: End goes to 100', (await input.inputValue()) === '100');
check('Slider: announces its value', (await input.getAttribute('aria-valuetext')) === '100 percent');
const box = await sl.locator('.compare').boundingBox();
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
await page.mouse.down(); await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5, { steps: 6 }); await page.mouse.up();
const dragged = Number(await input.inputValue());
check('Slider: mouse drag moves the divider', dragged > 15 && dragged < 35, `value ${dragged}`);
await sl.locator('[data-compare-toggle]').click();
const sideOk = await sl.evaluate((el) => el.classList.contains('is-side') && getComputedStyle(el.querySelector('.compare')).display === 'grid');
check('Slider: side-by-side fallback works', sideOk && (await sl.locator('[data-compare-toggle]').getAttribute('aria-pressed')) === 'true');
await sl.locator('[data-compare-toggle]').click();
check('Slider: tags identify the image as an AI concept or illustration', /AI concept|Illustrative|Design concept/.test(await sl.locator('.compare__tag--a').innerText()) && /AI-created|Illustrative/.test(await sl.locator('figcaption').innerText()));
const touchCtx = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
const tp = await touchCtx.newPage();
await tp.goto(origin + '/services/virtual-staging/');
await tp.locator('.compare input').first().scrollIntoViewIfNeeded();
await tp.evaluate(() => { const c = document.querySelector('.compare'); window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - 120); });
const tb = await tp.locator('.compare input').first().boundingBox();
await tp.touchscreen.tap(tb.x + tb.width * 0.8, tb.y + tb.height * 0.5);
const tv = Number(await tp.locator('.compare input').first().inputValue());
check('Slider: touch tap moves the divider on a phone', tv > 60, `value ${tv}`);
await touchCtx.close();

// --- Tile hover ---
await page.goto(origin + '/services/');
const tile = page.locator('.tile').first();
await tile.scrollIntoViewIfNeeded();
await tile.hover(); await page.waitForTimeout(700);
check('Service tile reveals the after image on hover', (await tile.locator('.after').evaluate((el) => getComputedStyle(el).clipPath)).includes('8%'));

// --- Design library ---
await page.goto(origin + '/design-library/');
const visibleCount = () => page.locator('[data-item]:visible').count();
const total = await visibleCount();
const countText = () => page.locator('[data-count]').innerText();
check('Library: shows all designs at load', total > 40 && (await countText()).startsWith(String(total)), `${total}`);
await page.locator('[data-filter=style][data-value=coastal]').click();
const coastal = await visibleCount();
check('Library: style filter narrows the grid and sets aria-pressed', coastal > 0 && coastal < total && (await page.locator('[data-filter=style][data-value=coastal]').getAttribute('aria-pressed')) === 'true', coastal);
await page.locator('[data-filter=room][data-value=deck]').click();
check('Library: style and room filters combine', (await visibleCount()) === 1 && (await page.locator('[data-item]:visible').getAttribute('data-style')) === 'coastal');
await page.locator('[data-filter=room][data-value=basement]').click();
check('Library: an empty combination shows the empty state', (await visibleCount()) === 0 && (await page.locator('[data-empty]').isVisible()) && (await countText()).startsWith('0'));
await page.locator('[data-clear-2]').click();
check('Library: clearing filters restores the grid', (await visibleCount()) === total && !(await page.locator('[data-empty]').isVisible()));
await page.goto(origin + '/design-library/?style=modern&room=kitchen');
check('Library: URL parameters preset the filters', (await visibleCount()) === 1);
await page.goto(origin + '/design-library/?style=bogus');
check('Library: unknown URL parameter is ignored', (await visibleCount()) === total);
await page.locator('[data-filter=style][data-value=modern]').focus();
await page.keyboard.press('Enter');
check('Library: filters work from the keyboard', (await page.locator('[data-filter=style][data-value=modern]').getAttribute('aria-pressed')) === 'true');

// --- Lightbox ---
const opener = page.locator('[data-item]:visible .gal__btn').first();
await opener.focus();
await page.keyboard.press('Enter');
const dlg = page.locator('dialog.lb');
const lbSrc = await dlg.locator('img').evaluate((i) => new Promise((ok) => { if (i.complete && i.naturalWidth) ok(i.naturalWidth); else { i.onload = () => ok(i.naturalWidth); setTimeout(() => ok(i.naturalWidth), 2000); } }));
check('Lightbox: opens from the keyboard and loads the image', (await dlg.isVisible()) && lbSrc > 1);
check('Lightbox: identifies the image as an AI concept or illustration', /AI concept|illustration/.test(await dlg.locator('[data-lb-title]').innerText()));
await page.keyboard.press('Escape');
await page.waitForTimeout(80);
check('Lightbox: Escape closes it and focus returns to the opener', !(await dlg.isVisible()) && (await opener.evaluate((el) => el === document.activeElement)));
await page.goto(origin + '/');
const hgb = page.locator('.gal__btn').first();
await hgb.click();
check('Lightbox: works on the homepage gallery', await page.locator('dialog.lb').isVisible());
await page.locator('[data-lb-close]').click();

// --- Mobile nav ---
await page.setViewportSize({ width: 390, height: 800 });
await page.goto(origin + '/');
const menu = page.locator('[data-menu-btn]');
check('Mobile nav: closed by default', !(await page.locator('#site-nav').isVisible()) && (await menu.getAttribute('aria-expanded')) === 'false');
await menu.click();
check('Mobile nav: opens and updates aria-expanded', (await page.locator('#site-nav').isVisible()) && (await menu.getAttribute('aria-expanded')) === 'true');
await page.locator('#site-nav summary').first().click();
check('Mobile nav: services submenu opens', await page.locator('#site-nav a[href="/services/day-to-dusk/"]').isVisible());
await page.keyboard.press('Escape');
await page.keyboard.press('Escape');
check('Mobile nav: Escape closes it', !(await page.locator('#site-nav').isVisible()));
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(origin + '/');
await page.locator('.nav summary').first().click();
check('Desktop nav: dropdown opens', await page.locator('.mega a[href="/services/virtual-staging/"]').isVisible());
await page.keyboard.press('Escape');
check('Desktop nav: Escape closes the dropdown', !(await page.locator('.mega a[href="/services/virtual-staging/"]').isVisible()));

// --- Keyboard ---
await page.goto(origin + '/about/');
await page.keyboard.press('Tab');
check('Keyboard: first Tab reaches the skip link', (await page.evaluate(() => document.activeElement.className)) === 'skip');
await page.keyboard.press('Enter');
check('Keyboard: skip link moves focus to main', (await page.evaluate(() => document.activeElement.id)) === 'main');
const outline = await page.evaluate(() => { const a = document.querySelector('main a'); a.focus(); return getComputedStyle(a).outlineStyle; });
check('Keyboard: focused links show a visible outline', outline !== 'none');

// --- Reduced motion ---
const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
const rp = await rm.newPage();
await rp.goto(origin + '/');
const rmv = await rp.evaluate(() => ({ a: getComputedStyle(document.querySelector('.anim-reveal .compare')).animationName, b: getComputedStyle(document.querySelector('.hero__copy h1')).animationName, s: getComputedStyle(document.documentElement).scrollBehavior }));
check('Reduced motion: animations are off', rmv.a === 'none' && rmv.b === 'none' && rmv.s === 'auto', JSON.stringify(rmv));
await rm.close();

// --- No JavaScript ---
const nj = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
const np = await nj.newPage();
await np.goto(origin + '/services/virtual-staging/');
check('No JavaScript: comparison falls back to side by side', (await np.locator('.compare').first().evaluate((el) => getComputedStyle(el).display)) === 'grid');
await np.goto(origin + '/design-library/');
check('No JavaScript: library still lists all images', (await np.locator('[data-item]').count()) > 40 && (await np.locator('[data-empty]').isHidden()));
await nj.close();

// --- Forms without an endpoint: must never claim success ---
await page.goto(origin + '/request-quote/');
const form = page.locator('form[data-inquiry]');
const status = form.locator('[data-status]');
await form.locator('button[type=submit]').click();
check('Form: empty submit shows field errors', (await form.locator('[data-err=name]').isVisible()) && (await form.locator('[data-err=email]').isVisible()) && (await form.locator('[data-err=message]').isVisible()) && (await form.locator('[data-err=services]').isVisible()) && (await form.locator('[data-err=consent]').isVisible()));
check('Form: focus moves to the first invalid field', (await page.evaluate(() => document.activeElement.getAttribute('name'))) === 'name');
check('Form: invalid fields are marked aria-invalid', (await form.locator('[name=email]').getAttribute('aria-invalid')) === 'true');
await form.locator('[name=name]').fill('Pat Tester');
await form.locator('[name=email]').fill('not-an-email');
await form.locator('[name=message]').fill('Three empty rooms in 33705.');
await form.locator('[name=services]').first().check();
await form.locator('[name=consent]').check();
await form.locator('button[type=submit]').click();
check('Form: a bad email is rejected', await form.locator('[data-err=email]').isVisible());
await form.locator('[name=email]').fill('pat@example.com');
await form.locator('[name=mls]').selectOption('Stellar MLS');
await form.locator('button[type=submit]').click();
const stxt = await status.innerText();
check('Form: with no endpoint it says nothing was sent, and never shows success', /has not been sent/.test(stxt) && !/received|thank/i.test(stxt), stxt);
const mt = await status.locator('a').getAttribute('href');
const md = decodeURIComponent(mt);
check('Form: email fallback targets the owner and carries the details', mt.startsWith('mailto:dev@devendergarg.com') && md.includes('Pat Tester') && md.includes('pat@example.com') && md.includes('33705') && md.includes('Stellar MLS'));
await page.goto(origin + '/contact/');
const cf = page.locator('form[data-inquiry]');
await cf.locator('[name=name]').fill('Pat Tester'); await cf.locator('[name=email]').fill('pat@example.com'); await cf.locator('[name=message]').fill('A question about a listing.'); await cf.locator('[name=consent]').check();
await cf.locator('button[type=submit]').click();
check('Contact form: same honest behavior', /has not been sent/.test(await cf.locator('[data-status]').innerText()));
check('Contact links: tel and mailto are correct', (await page.locator('.side-box a[href="tel:+918890929329"]').count()) === 1 && (await page.locator('.side-box a[href="mailto:dev@devendergarg.com"]').count()) === 1);

// --- Forms with an endpoint: a local test server, to prove the integration path ---
let received = null; let mode = 200;
mockHandler = (req, res) => { let b = ''; req.on('data', (d) => { b += d; }); req.on('end', () => { received = JSON.parse(b); res.writeHead(mode, { 'Content-Type': 'application/json' }); res.end('{}'); }); };
const ep = '/__mock/quote';
async function fillQuote() {
  await page.goto(origin + '/request-quote/');
  await page.locator('form[data-inquiry]').evaluate((f, e) => { f.dataset.endpoint = e; }, ep);
  await page.locator('[name=name]').fill('Pat Tester'); await page.locator('[name=email]').fill('pat@example.com'); await page.locator('[name=message]').fill('Three empty rooms in 33705.');
  await page.locator('[name=services]').nth(0).check(); await page.locator('[name=services]').nth(2).check(); await page.locator('[name=consent]').check();
}
await fillQuote();
await page.locator('button[type=submit]').click();
await page.locator('[data-status][data-kind=ok]').waitFor({ timeout: 5000 });
check('Form with test endpoint: a 200 shows success and posts JSON', received?.email === 'pat@example.com' && Array.isArray(received.services) && received.services.length === 2);
check('Form with test endpoint: success clears the form', (await page.locator('[name=name]').inputValue()) === '');
mode = 500; await fillQuote();
await page.locator('button[type=submit]').click();
await page.locator('[data-status][data-kind=error]').waitFor({ timeout: 5000 });
const et = await page.locator('[data-status]').innerText();
check('Form with test endpoint: a 500 shows an error, keeps the details and offers email', /could not be sent/.test(et) && !/received/i.test(et) && (await page.locator('[name=name]').inputValue()) === 'Pat Tester' && (await page.locator('[data-status] a').count()) === 1);
mode = 200; received = null; await fillQuote();
await page.locator('[name=website]').evaluate((el) => { el.value = 'spam'; });
await page.locator('button[type=submit]').click();
await page.waitForTimeout(300);
check('Form: the honeypot blocks the request', received === null);

// --- Upload draft: nothing transmitted ---
await page.goto(origin + '/upload/');
const posts = []; const onReq = (r) => { if (r.method() !== 'GET') posts.push(r.url()); }; page.on('request', onReq);
await page.locator('input[type=file]').setInputFiles([{ name: 'room.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('x') }, { name: 'bad.gif', mimeType: 'image/gif', buffer: Buffer.from('x') }]);
const ft = await page.locator('[data-files]').innerText();
check('Upload draft: checks file types locally', /room\.jpg[\s\S]*Passes local check/.test(ft) && /bad\.gif[\s\S]*Not accepted/.test(ft), ft);
check('Upload draft: transmits nothing and has submit disabled', posts.length === 0 && (await page.locator('button:has-text("Upload")').isDisabled()));
page.off('request', onReq);
for (const [p, t] of [['/order/', 'Continue'], ['/account/', 'Sign in']]) { await page.goto(origin + p); check(`${p} draft: primary action is disabled`, await page.locator(`button:has-text("${t}")`).isDisabled()); }

// The 404 visit and the mock 500 are provoked on purpose above, so only those two are excluded.
const unexpected = consoleErrors.filter((e) => !/definitely-missing.*404|request-quote.*status of 500/.test(e));
check('No unexpected console errors or page exceptions across the run', unexpected.length === 0, [...new Set(unexpected)].slice(0, 12).join('\n'));

await browser.close();
server.close();
const failed = results.filter((r) => !r.pass);
fs.writeFileSync('qa-output/qa-browser.json', JSON.stringify({ date: new Date().toISOString(), browser: 'Chrome (installed channel)', widths: WIDTHS, total: results.length, failed: failed.length, results }, null, 1));
console.log(`\nBrowser QA: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
