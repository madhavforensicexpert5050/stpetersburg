// Cloudflare Pages middleware. Keeps every non-production deployment behind a password, and shut if none is set.
import { previewGuard } from '../server/inquiry-core.ts';

export const onRequest = async ({ request, env, next }: { request: Request; env: { SITE_MODE?: string; PREVIEW_PASSWORD?: string }; next: () => Promise<Response> }) => {
  const decision = previewGuard(env, request.headers.get('Authorization'));
  if (decision === 'allow') return next();
  if (decision === 'closed') return new Response('Preview is closed: no password is configured.', { status: 403, headers: { 'X-Robots-Tag': 'noindex, nofollow' } });
  return new Response('Password required.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="StageLiora preview"', 'X-Robots-Tag': 'noindex, nofollow' } });
};
