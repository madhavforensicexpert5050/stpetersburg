// Tests the server-side form handler, then drives the real form in Chrome against it, using a fake email sender.
// This proves the code path. It is NOT proof of email delivery: that needs a deployed site and a real inbox.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { handleInquiry, resetRateLimit, resendSender, previewGuard, MAX_BODY } from '../server/inquiry-core.ts';

const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass, detail: String(detail) }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${!pass && detail ? `  ${detail}` : ''}`); };

const ORIGIN = 'https://st.petersburg.stageliora.com';
const env = { INQUIRY_TO: 'dev@devendergarg.com', INQUIRY_FROM: 'Site <a@b.example>', ALLOWED_ORIGIN: ORIGIN };
const good = { name: 'Pat Secretname', email: 'pat.secret@example.com', phone: '555-SECRET', message: 'Private message about 33705 rooms.', consent: 'yes', services: ['Virtual Staging'], website: '' };
function run(body, { over = {}, sendOk = true, sendThrows = false, envOver = {} } = {}) {
  const sent = [], logs = [];
  const req = { method: 'POST', origin: ORIGIN, contentType: 'application/json', ip: '1.1.1.1', bodyText: typeof body === 'string' ? body : JSON.stringify(body), ...over };
  return handleInquiry(req, { ...env, ...envOver }, { send: async (m) => { if (sendThrows) throw new Error('down'); sent.push(m); return sendOk; }, log: (e, d) => logs.push({ e, d }), now: () => 1000 }).then((res) => ({ res, sent, logs }));
}

let t = await run(good);
check('Valid request is delivered, returns 200', t.res.status === 200 && t.sent.length === 1);
check('Goes to the confirmed recipient', t.sent[0]?.to === 'dev@devendergarg.com');
check('Reply-to is the customer', t.sent[0]?.replyTo === 'pat.secret@example.com');
check('Email contains the request details', /Private message/.test(t.sent[0]?.text) && /Virtual Staging/.test(t.sent[0]?.text));
const logged = JSON.stringify(t.logs);
check('Logs contain no name, email, phone or message', !/Secret|secret|33705/.test(logged) && /inquiry_delivered/.test(logged), logged);
resetRateLimit(); t = await run({ ...good, services: undefined, interest: 'Virtual staging, Coastal style' });
check('A style chosen on the Portfolio reaches the email', /Asking about: Virtual staging, Coastal style/.test(t.sent[0]?.text ?? ''));
resetRateLimit(); t = await run({ ...good, services: undefined });
check('Contact form (no services) is accepted', t.res.status === 200 && /Website message/.test(t.sent[0].subject));
resetRateLimit(); t = await run({ ...good, name: 'Pat\r\nBcc: evil@example.com', email: 'pat@example.com' });
check('Line breaks cannot inject email headers', !/[\r\n]/.test(t.sent[0]?.subject ?? 'x'));
resetRateLimit(); t = await run({ ...good, email: 'nope' });
check('Bad email returns 422 and names the field', t.res.status === 422 && t.res.body.fields.includes('email') && t.sent.length === 0);
resetRateLimit(); t = await run({ ...good, consent: undefined });
check('Missing consent returns 422', t.res.status === 422 && t.res.body.fields.includes('consent'));
resetRateLimit(); t = await run({ ...good, message: 'short' });
check('Short message returns 422', t.res.status === 422);
resetRateLimit(); t = await run({ ...good, website: 'http://spam' });
check('Honeypot: nothing sent, and the drop is logged', t.res.status === 200 && t.sent.length === 0 && /honeypot/.test(JSON.stringify(t.logs)));
resetRateLimit(); t = await run(good, { over: { origin: 'https://evil.example' } });
check('Foreign origin returns 403', t.res.status === 403 && t.sent.length === 0);
t = await run(good, { over: { origin: null } });
check('Missing origin returns 403', t.res.status === 403);
t = await run(good, { over: { method: 'GET' } });
check('GET returns 405', t.res.status === 405);
t = await run(good, { over: { contentType: 'text/plain' } });
check('Wrong content type returns 415', t.res.status === 415);
t = await run('x'.repeat(MAX_BODY + 1));
check('Oversized body returns 413', t.res.status === 413);
resetRateLimit(); t = await run('{bad json');
check('Malformed JSON returns 400', t.res.status === 400);
resetRateLimit(); t = await run(good, { envOver: { INQUIRY_TO: '' } });
check('Missing configuration returns 503 and sends nothing', t.res.status === 503 && t.sent.length === 0);
resetRateLimit(); t = await run(good, { sendOk: false });
check('Provider rejection returns 502, never success', t.res.status === 502 && t.res.body.ok === false && /delivery_failed/.test(JSON.stringify(t.logs)));
resetRateLimit(); t = await run(good, { sendThrows: true });
check('Provider outage returns 502', t.res.status === 502);
resetRateLimit(); for (let i = 0; i < 5; i++) await run(good); t = await run(good);
check('Sixth request in the window returns 429', t.res.status === 429 && t.sent.length === 0);
resetRateLimit();

let captured;
const ok = await resendSender('KEY', async (u, o) => { captured = { u, o }; return { ok: true }; })({ to: 'a@b.c', from: 'x@y.z', replyTo: 'r@s.t', subject: 's', text: 't' });
check('Provider adapter sends bearer auth and the fields', ok === true && captured.o.headers.Authorization === 'Bearer KEY' && JSON.parse(captured.o.body).reply_to === 'r@s.t');
check('Preview guard: production passes', previewGuard({ SITE_MODE: 'production' }, null) === 'allow');
check('Preview guard: no password means closed', previewGuard({}, null) === 'closed');
check('Preview guard: password required', previewGuard({ PREVIEW_PASSWORD: 'pw' }, null) === 'challenge');
check('Preview guard: wrong password refused', previewGuard({ PREVIEW_PASSWORD: 'pw' }, `Basic ${btoa('u:no')}`) === 'challenge');
check('Preview guard: right password allowed', previewGuard({ PREVIEW_PASSWORD: 'pw' }, `Basic ${btoa('u:pw')}`) === 'allow');

// Secret never reaches the browser bundle
const js = []; (function w(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) w(p); else if (/\.(js|html)$/.test(e.name)) js.push(p); } })('dist');
check('No provider key name or provider URL in built files', !js.some((f) => /RESEND_API_KEY|api\.resend\.com/.test(fs.readFileSync(f, 'utf8'))));

// Real form in a real browser, through the real handler, with a fake sender
const sentE2E = [];
let providerUp = true;
const api = { '/api/inquiry': (req, res, origin) => { let b = ''; req.on('data', (d) => { b += d; }); req.on('end', async () => {
  const out = await handleInquiry({ method: req.method, origin: req.headers.origin ?? null, contentType: req.headers['content-type'] ?? null, ip: '2.2.2.2', bodyText: b }, { ...env, ALLOWED_ORIGIN: origin }, { send: async (m) => { sentE2E.push(m); return providerUp; }, log: () => {}, now: () => Date.now() });
  res.writeHead(out.status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(out.body));
}); } };
const { server, origin } = await serve(path.resolve('dist'), 0, api);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
async function submit(p) {
  await page.goto(origin + p);
  await page.locator('form[data-inquiry]').evaluate((f) => { f.dataset.endpoint = '/api/inquiry'; });
  await page.locator('[name=name]').fill('Pat Tester'); await page.locator('[name=email]').fill('pat@example.com'); await page.locator('[name=message]').fill('Three empty rooms in 33705.');
  if (p === '/request-quote/') await page.locator('[name=services]').first().check();
  await page.locator('[name=consent]').check();
  await page.locator('button[type=submit]').click();
}
await submit('/request-quote/');
await page.locator('[data-status][data-kind=ok]').waitFor({ timeout: 5000 });
check('Browser to handler: quote form shows success only after the sender accepts', sentE2E.length === 1 && sentE2E[0].to === 'dev@devendergarg.com');
await submit('/contact/');
await page.locator('[data-status][data-kind=ok]').waitFor({ timeout: 5000 });
check('Browser to handler: contact form works', sentE2E.length === 2);
providerUp = false;
await submit('/request-quote/');
await page.locator('[data-status][data-kind=error]').waitFor({ timeout: 5000 });
check('Browser to handler: provider failure shows an error and keeps the details', (await page.locator('[name=name]').inputValue()) === 'Pat Tester' && (await page.locator('[data-status] a').count()) === 1);
await browser.close();
server.close();

const failed = results.filter((r) => !r.pass);
fs.writeFileSync('qa-output/qa-form.json', JSON.stringify({ date: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 1));
console.log(`\nForm QA: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
