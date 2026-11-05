// Dev helper: node scripts/shots.mjs <width> <fullpage:0|1> /path/ /path/ ...
import { chromium } from 'playwright';
import path from 'node:path';
import { serve } from './serve.mjs';

const [w, full, ...paths] = process.argv.slice(2);
const { server, origin } = await serve(path.resolve(process.env.SHOT_ROOT || 'dist'));
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: Number(w), height: Number(w) < 700 ? 800 : 900 } });
for (const u of paths) {
  await p.goto(origin + u, { waitUntil: 'load' });
  await p.waitForTimeout(1700);
  if (full === '1') { await p.evaluate(async () => { document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }); for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); }); await p.waitForTimeout(300); }
  const name = `qa-output/shot-${w}${u.replace(/\//g, '_')}.png`;
  await p.screenshot({ path: name, fullPage: full === '1' });
  console.log(name);
}
await b.close();
server.close();
