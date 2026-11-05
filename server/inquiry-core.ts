/**
 * Server-side form delivery. Host-neutral: the adapter in functions/api/inquiry.ts supplies the request,
 * configuration and email sender. Never logs names, emails, phone numbers or message text.
 */
export interface InquiryEnv { INQUIRY_TO?: string; INQUIRY_FROM?: string; ALLOWED_ORIGIN?: string; RESEND_API_KEY?: string }
export interface InquiryRequest { method: string; origin: string | null; contentType: string | null; ip: string; bodyText: string }
export interface OutgoingEmail { to: string; from: string; replyTo: string; subject: string; text: string }
export interface InquiryDeps { send: (m: OutgoingEmail) => Promise<boolean>; log: (event: string, data?: Record<string, unknown>) => void; now: () => number }
export interface InquiryResponse { status: number; body: { ok: boolean; error?: string; fields?: string[] } }

export const MAX_BODY = 20_000;
const LIMITS: Record<string, number> = { name: 120, email: 200, phone: 40, company: 150, role: 60, photos: 40, location: 120, mls: 60, use: 80, message: 5000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RATE_MAX = 5, RATE_WINDOW = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').trim().slice(0, max) : '');
/** Header values must never carry a line break. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

/** Best effort only: counts are per server instance. Add a host rate-limit rule in production. */
function rateLimited(ip: string, now: number) {
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}
export const resetRateLimit = () => hits.clear();

export async function handleInquiry(req: InquiryRequest, env: InquiryEnv, deps: InquiryDeps): Promise<InquiryResponse> {
  const fail = (status: number, error: string, event: string, fields?: string[]): InquiryResponse => {
    deps.log(event, { status, fieldCount: fields?.length ?? 0 });
    return { status, body: { ok: false, error, fields } };
  };
  if (req.method !== 'POST') return fail(405, 'Method not allowed', 'inquiry_bad_method');
  if (!env.INQUIRY_TO || !env.INQUIRY_FROM || !env.ALLOWED_ORIGIN) return fail(503, 'Form delivery is not configured', 'inquiry_not_configured');
  if (req.origin !== env.ALLOWED_ORIGIN) return fail(403, 'Origin not allowed', 'inquiry_bad_origin');
  if (!(req.contentType || '').toLowerCase().startsWith('application/json')) return fail(415, 'Unsupported content type', 'inquiry_bad_type');
  if (req.bodyText.length > MAX_BODY) return fail(413, 'Request too large', 'inquiry_too_large');
  if (rateLimited(req.ip, deps.now())) return fail(429, 'Too many requests. Please try again later or send an email.', 'inquiry_rate_limited');

  let data: Record<string, unknown>;
  try { data = JSON.parse(req.bodyText); if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('shape'); } catch { return fail(400, 'Invalid request', 'inquiry_bad_json'); }

  // A filled honeypot is a bot. It gets a normal-looking reply, and the drop is logged rather than silent.
  if (clean(data.website, 200)) { deps.log('inquiry_honeypot_dropped'); return { status: 200, body: { ok: true } }; }

  const f = Object.fromEntries(Object.entries(LIMITS).map(([k, max]) => [k, clean(data[k], max)]));
  const services = (Array.isArray(data.services) ? data.services : data.services ? [data.services] : []).map((s) => clean(s, 80)).filter(Boolean).slice(0, 12);
  const bad: string[] = [];
  if (f.name.length < 2) bad.push('name');
  if (!EMAIL.test(f.email)) bad.push('email');
  if (f.message.length < 10) bad.push('message');
  if (data.consent !== 'yes') bad.push('consent');
  if (bad.length) return fail(422, 'Please check the highlighted fields', 'inquiry_invalid', bad);

  const rows: [string, string][] = [['Name', f.name], ['Email', f.email], ['Phone', f.phone], ['Company', f.company], ['Role', f.role], ['Services', services.join(', ')], ['Number of photos', f.photos], ['Property location', f.location], ['MLS', f.mls], ['Intended use', f.use]];
  const text = `${rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessage:\n${f.message}\n\nSent from the StageLiora St. Petersburg website. The sender agreed to the privacy policy.\n`;
  const kind = services.length ? 'Quote request' : 'Website message';
  let delivered = false;
  try {
    delivered = await deps.send({ to: env.INQUIRY_TO, from: env.INQUIRY_FROM, replyTo: oneLine(f.email), subject: oneLine(`[StageLiora] ${kind} from ${f.name}`), text });
  } catch { delivered = false; }
  if (!delivered) return fail(502, 'We could not deliver your request. Please send an email instead.', 'inquiry_delivery_failed');
  deps.log('inquiry_delivered', { kind, serviceCount: services.length });
  return { status: 200, body: { ok: true } };
}

/** Email provider adapter (Resend). The key comes from host secrets and is never exposed to the browser. */
export function resendSender(apiKey: string, fetchImpl: typeof fetch = fetch) {
  return async (m: OutgoingEmail) => {
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: m.from, to: [m.to], reply_to: m.replyTo, subject: m.subject, text: m.text }),
    });
    return res.ok;
  };
}

/** Fails closed: any non-production deployment needs a password, and with none configured it stays shut. */
export function previewGuard(env: { SITE_MODE?: string; PREVIEW_PASSWORD?: string }, authorization: string | null): 'allow' | 'challenge' | 'closed' {
  if (env.SITE_MODE === 'production') return 'allow';
  if (!env.PREVIEW_PASSWORD) return 'closed';
  if (!authorization?.startsWith('Basic ')) return 'challenge';
  try {
    const decoded = atob(authorization.slice(6));
    return decoded.slice(decoded.indexOf(':') + 1) === env.PREVIEW_PASSWORD ? 'allow' : 'challenge';
  } catch { return 'challenge'; }
}
