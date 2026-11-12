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
for (const p of ['/', '/services/', '/pricing/', '/guides/what-is-virtual-staging/', '/locations/st-petersburg-fl/', '/portfolio/']) {
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
check('Slider: no per-image "AI-created example" caption; accessible name still describes it', !/AI-created example/.test(await sl.locator('figcaption').innerText()) && /AI-created|before and after/i.test(await sl.locator('input[type=range]').getAttribute('aria-label')));
const touchCtx = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
const tp = await touchCtx.newPage();
await tp.goto(origin + '/services/furniture-removal-and-staging/');
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

// --- Portfolio Section 2: room chips, pair cards and More Design Ideas ---
await page.goto(origin + '/portfolio/');
const ideas = page.locator('#design-ideas');
const ideasOpen = () => ideas.evaluate((d) => d.open);
const visibleCount = () => page.locator('[data-item]:visible').count();
const countText = () => page.locator('[data-count]').innerText();
const pairCards = () => page.locator('[data-pair]:visible').count();
const allPairs = await page.locator('[data-pair]').count();
const chipPressed = (v) => page.locator(`[data-group-chip][data-value=${v}]`).getAttribute('aria-pressed');
check('Room chips: every comparison shows at load and the design ideas start collapsed', allPairs === 11 && (await pairCards()) === allPairs && !(await ideasOpen()) && (await page.locator('[data-pair-count]').innerText()) === `${allPairs} comparisons shown`, allPairs);
await page.locator('[data-group-chip][data-value=bedrooms]').click();
const bedroomCards = await page.locator('[data-pair]:visible').evaluateAll((els) => els.map((e) => e.dataset.group));
check('Room chips: a chip filters the cards, sets aria-pressed and keeps focus', bedroomCards.length === 3 && bedroomCards.every((g) => g === 'bedrooms') && (await chipPressed('bedrooms')) === 'true' && (await chipPressed('all')) === 'false' && (await page.evaluate(() => document.activeElement?.dataset.value)) === 'bedrooms' && (await page.locator('[data-pair-count]').innerText()) === '3 comparisons shown', bedroomCards.join(','));
await page.locator('[data-group-chip][data-value=outdoor]').click();
check('Room chips: Outdoor Spaces shows only the screened lanai, in its own block', (await pairCards()) === 1 && (await page.locator('[data-outdoor]').isVisible()) && (await page.locator('#patio').isVisible()) && !(await page.locator('#before-after').isVisible()));
await page.locator('[data-group-chip][data-value=sunroom]').click();
check('Room chips: Sunroom shows the sunroom pair', (await pairCards()) === 1 && (await page.locator('#sunroom').isVisible()) && !(await page.locator('[data-outdoor]').isVisible()));
check('Room chips: the occupied-room block is not filtered', await page.locator('#occupied-living-room').isVisible());
await page.locator('[data-group-chip][data-value=all]').click();
await ideas.locator('summary').click();
const total = await visibleCount();
check('Design ideas: open from their summary and list all 48 designs', (await ideasOpen()) && total === 48 && (await countText()) === '48 designs shown', total);
await page.locator('[data-filter=style][data-value=coastal]').click();
const coastal = await visibleCount();
check('Design ideas: style filter narrows the grid and sets aria-pressed', coastal > 0 && coastal < total && (await page.locator('[data-filter=style][data-value=coastal]').getAttribute('aria-pressed')) === 'true', coastal);
await page.locator('[data-group-chip][data-value=outdoor]').click();
const coastalOutdoor = await page.locator('[data-item]:visible').evaluateAll((els) => els.map((e) => `${e.dataset.style}/${e.dataset.room}`));
check('Design ideas: the room chip and the style filter combine, and the summary uses the live count', coastalOutdoor.length === 3 && coastalOutdoor.every((x) => /^coastal\/(patio|porch|deck)$/.test(x)) && (await ideas.locator('[data-ideas-summary]').innerText()) === 'Show 3 outdoor spaces design ideas', coastalOutdoor.join(','));
await page.locator('[data-group-chip][data-value=home-office]').click();
check('Design ideas: an empty combination shows the empty state', (await visibleCount()) === 0 && (await page.locator('[data-empty]').isVisible()) && (await countText()).startsWith('0'));
await page.locator('[data-clear-2]').click();
check('Design ideas: clearing filters restores every design and All Rooms', (await visibleCount()) === total && !(await page.locator('[data-empty]').isVisible()) && (await chipPressed('all')) === 'true' && (await pairCards()) === allPairs);
await page.goto(origin + '/portfolio/?style=modern&room=kitchen#room-designs');
check('Design ideas: ?style= and ?room= preset the chip and style and open the design ideas', (await ideasOpen()) && (await visibleCount()) === 2 && (await chipPressed('kitchen-dining')) === 'true' && (await page.locator('[data-style-btn][data-style=modern]').getAttribute('aria-pressed')) === 'true');
await page.goto(origin + '/portfolio/?style=bogus&room=entryway#room-designs');
check('Design ideas: unknown or ungrouped URL values are ignored', !(await ideasOpen()) && (await chipPressed('all')) === 'true' && (await page.locator('[data-filter=style][data-value=all]').getAttribute('aria-pressed')) === 'true' && (await page.locator('[data-style-btn][data-style=transitional]').getAttribute('aria-pressed')) === 'true');
await ideas.locator('summary').focus();
await page.keyboard.press('Enter');
check('Design ideas: the collapsed block opens from the keyboard', await ideasOpen());
await page.locator('[data-filter=style][data-value=modern]').focus();
await page.keyboard.press('Enter');
check('Design ideas: filters work from the keyboard', (await page.locator('[data-filter=style][data-value=modern]').getAttribute('aria-pressed')) === 'true');

// --- Lightbox ---
const opener = page.locator('[data-item]:visible .gal__btn').first();
await opener.focus();
await page.keyboard.press('Enter');
const dlg = page.locator('dialog.lb');
const lbSrc = await dlg.locator('img').evaluate((i) => new Promise((ok) => { if (i.complete && i.naturalWidth) ok(i.naturalWidth); else { i.onload = () => ok(i.naturalWidth); setTimeout(() => ok(i.naturalWidth), 2000); } }));
check('Lightbox: opens from the keyboard and loads the image', (await dlg.isVisible()) && lbSrc > 1);
check('Lightbox: titled by name, without a per-image AI label', (await dlg.locator('[data-lb-title]').innerText()).trim().length > 0 && !/AI concept|AI-created example/.test(await dlg.locator('[data-lb-title]').innerText()));
const lbAsk = dlg.locator('[data-lb-ask]');
const openerAsk = await opener.getAttribute('data-ask');
check('Lightbox: a room design offers Ask About This Style for that design', (await lbAsk.isVisible()) && (await lbAsk.getAttribute('href')) === openerAsk && /\?ask=staging&style=modern&room=/.test(openerAsk || ''), openerAsk);
await page.keyboard.press('Escape');
await page.waitForTimeout(80);
check('Lightbox: Escape closes it and focus returns to the opener', !(await dlg.isVisible()) && (await opener.evaluate((el) => el === document.activeElement)));
await page.goto(origin + '/');
const hgb = page.locator('.gal__btn').first();
await hgb.click();
check('Lightbox: works on the homepage gallery', await page.locator('dialog.lb').isVisible());
check('Lightbox: the homepage gallery shows no inquiry link', !(await page.locator('[data-lb-ask]').isVisible()));
await page.locator('[data-lb-close]').click();
await page.goto(origin + '/portfolio/');
await page.locator('#before-after [data-ideas-link=bedrooms]').first().click();
const bedIdeas = await page.locator('[data-item]:visible').evaluateAll((els) => els.map((e) => e.dataset.group));
check('Pair card: "More bedrooms design ideas" opens the design ideas filtered to bedrooms', (await ideasOpen()) && bedIdeas.length > 0 && bedIdeas.every((g) => g === 'bedrooms') && (await ideas.locator('[data-ideas-summary]').innerText()) === `Show ${bedIdeas.length} bedrooms design ideas`, bedIdeas.length);

// --- Portfolio Section 3: one room in eight styles ---
await page.goto(origin + '/portfolio/');
const sw = page.locator('[data-style-switch]');
const swAfter = sw.locator('[data-compare-after]');
const swPressed = () => sw.locator('[data-style-btn][aria-pressed=true]').evaluateAll((els) => els.map((e) => e.dataset.style).join());
const swPanels = () => sw.locator('[data-style-panel]:visible').evaluateAll((els) => els.map((e) => e.dataset.stylePanel).join());
check('Style switcher: Transitional by default, with only its panel shown', (await swPressed()) === 'transitional' && /living-room-transitional\.webp$/.test(await swAfter.getAttribute('src')) && (await swPanels()) === 'transitional' && (await sw.locator('[data-style-status]').innerText()) === 'Showing Transitional');
const swInput = sw.locator('input[type=range]');
await swInput.scrollIntoViewIfNeeded();
await swInput.focus();
for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft');
const swResults = [];
for (const [id, name] of [['modern', 'Modern'], ['contemporary', 'Contemporary'], ['coastal', 'Coastal'], ['scandinavian', 'Scandinavian'], ['farmhouse', 'Farmhouse'], ['traditional', 'Traditional'], ['industrial', 'Industrial'], ['transitional', 'Transitional']]) {
  await sw.locator(`[data-style-btn][data-style=${id}]`).click();
  const nw = await swAfter.evaluate((i) => new Promise((ok) => { const done = () => ok(i.naturalWidth); if (i.complete && i.naturalWidth) done(); else { i.addEventListener('load', done, { once: true }); setTimeout(done, 4000); } }));
  const ok = (await swAfter.getAttribute('src')).endsWith(`living-room-${id}.webp`) && (await swPressed()) === id && (await swPanels()) === id && (await sw.locator('[data-style-status]').innerText()) === `Showing ${name}` && (await swInput.getAttribute('aria-label')) === `Compare the empty room with the ${name} version` && /AI-created image of the same living room/.test(await swAfter.getAttribute('alt')) && nw > 1;
  swResults.push(`${id}:${ok}`);
}
check('Style switcher: each of the 8 buttons loads its own image, presses only itself, shows its panel and announces it', swResults.every((x) => x.endsWith('true')), swResults.join(' '));
check('Style switcher: the divider position is kept after a switch', (await swInput.inputValue()) === '47', await swInput.inputValue());
await swInput.focus(); await page.keyboard.press('ArrowRight');
check('Style switcher: the slider still moves after a switch', (await swInput.inputValue()) === '48' && (await swInput.getAttribute('aria-valuetext')) === '48 percent');
await sw.locator('[data-style-btn][data-style=coastal]').focus();
await page.keyboard.press('Space');
check('Style switcher: buttons work from the keyboard', (await swPressed()) === 'coastal');
await page.waitForTimeout(3000);
check('Style switcher: never rotates on its own', (await swPressed()) === 'coastal');
await page.goto(origin + '/portfolio/#style-coastal');
check('Style switcher: #style-coastal on arrival selects Coastal', (await swPressed()) === 'coastal' && (await swPanels()) === 'coastal');
await page.goto(origin + '/portfolio/');
await page.locator('.pf-start summary').focus();
await page.keyboard.press('Enter');
await page.locator('.pf-start [data-pick-style=industrial]').first().click();
check('Style switcher: "Not sure where to start?" opens from the keyboard and its style names select that style', (await page.locator('.pf-start').evaluate((d) => d.open)) && (await swPressed()) === 'industrial');

// --- Portfolio to inquiry form: the chosen style arrives filled in, visible and editable ---
await page.goto(origin + '/portfolio/#style-coastal');
const styleAsk = page.locator('#style-coastal a.pf-ask');
await styleAsk.click();
// Preview builds open the quote form; the GitHub Pages preview, without a live quote form, opens the contact form.
await page.waitForURL(/\/(contact|request-quote)\/\?ask=staging&style=coastal&room=living-room#inquiry$/);
const interestField = page.locator('[name=interest]');
check('Inquiry: Ask About This Style in the switcher fills the style and the living room', (await interestField.isVisible()) && (await interestField.inputValue()) === 'Virtual staging, Coastal style, as in the Coastal Living Room design', await interestField.inputValue());
await interestField.fill('Coastal, but warmer woods');
check('Inquiry: the filled-in style can be edited', (await interestField.inputValue()) === 'Coastal, but warmer woods');
await page.goto(origin + '/contact/?ask=staging&style=coastal&room=deck');
check('Inquiry: a room design adds the room', (await interestField.inputValue()) === 'Virtual staging, Coastal style, as in the Coastal Deck design', await interestField.inputValue());
await page.goto(origin + '/contact/?ask=staging&style=<script>&room=bogus');
check('Inquiry: unknown ids are never copied into the form', (await interestField.inputValue()) === 'Virtual staging');
await page.goto(origin + '/contact/');
check('Inquiry: without a link, the "Asking about" field stays hidden', !(await interestField.isVisible()));
await page.goto(origin + '/portfolio/');
await page.locator('.pf-cta a.btn').click();
await page.waitForURL(/\/(contact|request-quote)\/\?ask=staging#inquiry$/);
check('Inquiry: Ask About Your Rooms opens the inquiry form', (await interestField.inputValue()) === 'Virtual staging');
await page.goto(origin + '/portfolio/');
await page.locator('[data-pf-section="5"] a.btn:not(.btn--call)').click();
await page.waitForURL(/\/(contact|request-quote)\/\?ask=staging#inquiry$/);
check('Inquiry: the closing Ask About Your Rooms button opens the inquiry form', (await interestField.inputValue()) === 'Virtual staging');

// --- Portfolio order and mobile progressive disclosure ---
await page.goto(origin + '/portfolio/');
const order = await page.evaluate(() => ['room-designs', 'styles', 'faq'].map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? -1));
const nested = await page.evaluate(() => ['before-after', 'design-ideas'].every((id) => document.getElementById('room-designs').contains(document.getElementById(id))) && document.getElementById('styles').contains(document.getElementById('compare-styles')));
const tocOk = await page.evaluate(() => [...document.querySelectorAll('.pf-toc a')].map((a) => a.getAttribute('href')).join() === '#room-designs,#styles,#faq');
check('Portfolio: Room Designs, then Explore 8 Styles, then questions; the gallery and design ideas sit inside Room Designs; the hero links reach each', order.every((v, i) => v >= 0 && (i === 0 || v > order[i - 1])) && nested && tocOk, order.join(','));
await page.setViewportSize({ width: 390, height: 800 });
await page.goto(origin + '/portfolio/');
check('Room designs (mobile): 4 comparisons first, then Show all', (await pairCards()) === 4 && (await page.locator('[data-pairs-more]').innerText()) === `Show all ${allPairs} comparisons` && (await page.locator('[data-pair-count]').innerText()) === `Showing 4 of ${allPairs} comparisons`, await page.locator('[data-pair-count]').innerText());
await page.locator('[data-pairs-more]').click();
check('Room designs (mobile): Show all reveals every comparison', (await pairCards()) === allPairs && !(await page.locator('[data-pairs-more]').isVisible()));
check('Room designs (mobile): room chips stay in one scrollable row with no page overflow', (await page.locator('.pf-chips').first().evaluate((el) => getComputedStyle(el).flexWrap)) === 'nowrap' && (await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)));
await ideas.locator('summary').click();
const allDesigns = await page.locator('[data-item]').count();
check('Gallery (mobile): shows a first batch and a Show all button', (await visibleCount()) === 8 && (await page.locator('[data-more]').innerText()) === `Show all ${allDesigns} designs` && (await countText()) === `Showing 8 of ${allDesigns} designs`, `${await visibleCount()} ${await countText()}`);
await page.locator('[data-more]').click();
check('Gallery (mobile): Show all reveals every design and moves focus to the first new one', (await visibleCount()) === allDesigns && !(await page.locator('[data-more]').isVisible()) && (await page.evaluate(() => [...document.querySelectorAll('[data-item]')].indexOf(document.activeElement.closest('[data-item]')))) === 8);
await page.locator('[data-group-chip][data-value=living-open-plan]').click();
check('Gallery (mobile): a filter with eight or fewer matches needs no button', (await visibleCount()) === 8 && !(await page.locator('[data-more]').isVisible()));
await page.locator('[data-group-chip][data-value=all]').click();
await page.locator('[data-filter=style][data-value=scandinavian]').click();
check('Gallery (mobile): filters still narrow the list', (await page.locator('[data-item]:visible').evaluateAll((els) => els.every((e) => e.dataset.style === 'scandinavian'))) && (await visibleCount()) > 0);
await page.setViewportSize({ width: 1280, height: 900 });

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
check('Desktop nav: dropdown opens', await page.locator('.mega a[href="/services/furniture-removal-and-staging/"]').isVisible());
await page.keyboard.press('Escape');
check('Desktop nav: Escape closes the dropdown', !(await page.locator('.mega a[href="/services/furniture-removal-and-staging/"]').isVisible()));

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
await np.goto(origin + '/services/furniture-removal-and-staging/');
check('No JavaScript: comparison falls back to side by side', (await np.locator('.compare').first().evaluate((el) => getComputedStyle(el).display)) === 'grid');
await np.goto(origin + '/portfolio/');
check('No JavaScript: every comparison card and the occupied room are visible', (await np.locator('[data-pair]:visible').count()) === (await np.locator('[data-pair]').count()) && (await np.locator('[data-pair]').count()) === 11 && (await np.locator('#occupied-living-room').isVisible()));
await np.locator('#design-ideas summary').click();
check('No JavaScript: the design ideas still open and list all 48', (await np.locator('[data-item]:visible').count()) === 48 && (await np.locator('[data-empty]').isHidden()));
const njPanels = await np.locator('[data-style-panel]:visible').count();
const njImgs = await np.locator('[data-style-panel] .pf-panel__img').evaluateAll((els) => els.map((e) => e.getAttribute('src')));
check('No JavaScript: Section 3 shows the before once, then all 8 panels, each with its own after image', njPanels === 8 && njImgs.length === 8 && new Set(njImgs).size === 8 && njImgs.every((s) => /style-compare-living-room-[a-z]+\.webp$/.test(s)) && (await np.locator('img[src$="style-compare-living-room-before.webp"]').count()) === 1, `${njPanels} panels, ${njImgs.length} images`);
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
