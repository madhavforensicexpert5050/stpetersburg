// Smoke test in Chromium, Firefox and WebKit engines. Run after a build. Records engines it could not launch.
import fs from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { serve } from './serve.mjs';

const { server, origin } = await serve(path.resolve('dist'));
const out = [];
for (const [name, type, opts] of [['Chrome', chromium, { channel: 'chrome' }], ['Firefox', firefox, {}], ['WebKit', webkit, {}]]) {
  let b;
  try { b = await type.launch(opts); } catch (e) { out.push({ engine: name, launched: false, reason: e.message.split('\n')[0] }); console.log(`SKIP ${name}: ${e.message.split('\n')[0]}`); continue; }
  const p = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const r = {};
  await p.goto(`${origin}/`);
  r.overflowHome = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const input = p.locator('.compare input').first();
  await input.focus(); await p.keyboard.press('ArrowRight');
  r.sliderMoved = (await input.inputValue()) === '51';
  r.clipApplied = (await p.locator('.compare__after').first().evaluate((e) => getComputedStyle(e).clipPath)).includes('51');
  await p.goto(`${origin}/portfolio/`);
  r.overflowPortfolio = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const pairs = await p.locator('[data-pair]').count();
  await p.locator('[data-group-chip][data-value=bedrooms]').click();
  r.roomChipWorks = (await p.locator('[data-pair]:visible').count()) < pairs;
  await p.locator('[data-group-chip][data-value=all]').click();
  await p.locator('[data-style-btn][data-style=coastal]').click();
  r.styleSwitchWorks = (await p.locator('[data-compare-after]').getAttribute('src')).endsWith('living-room-coastal.webp') && (await p.locator('#style-coastal').isVisible());
  // The 48 design ideas are collapsed in V24; open them first.
  await p.locator('#design-ideas summary').click();
  const all = await p.locator('[data-item]:visible').count();
  await p.locator('[data-filter=style][data-value=coastal]').click();
  r.filterWorks = all > 0 && (await p.locator('[data-item]:visible').count()) < all;
  await p.locator('[data-item]:visible .gal__btn').first().click();
  r.lightbox = await p.locator('dialog.lb').isVisible();
  await p.goto(`${origin}/request-quote/`);
  await p.locator('button[type=submit]').click();
  r.formValidates = await p.locator('[data-err=email]').isVisible();
  r.overflowQuote = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  r.pageErrors = errors.length;
  const pass = r.overflowHome <= 0 && r.overflowQuote <= 0 && r.overflowPortfolio <= 0 && r.sliderMoved && r.clipApplied && r.roomChipWorks && r.styleSwitchWorks && r.filterWorks && r.lightbox && r.formValidates && !r.pageErrors;
  out.push({ engine: name, version: b.version(), launched: true, pass, ...r });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name} ${b.version()} ${JSON.stringify(r)}`);
  await b.close();
}
server.close();
fs.writeFileSync('qa-output/qa-cross.json', JSON.stringify(out, null, 1));
