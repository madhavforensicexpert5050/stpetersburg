// Cloudflare Pages Function adapter. Hosting is not decided: on another host, write the same thin adapter around handleInquiry.
import { handleInquiry, resendSender, type InquiryEnv } from '../../server/inquiry-core.ts';

export const onRequest = async ({ request, env }: { request: Request; env: InquiryEnv }) => {
  const result = await handleInquiry(
    { method: request.method, origin: request.headers.get('Origin'), contentType: request.headers.get('Content-Type'), ip: request.headers.get('CF-Connecting-IP') || 'unknown', bodyText: request.method === 'POST' ? await request.text() : '' },
    env,
    {
      send: env.RESEND_API_KEY ? resendSender(env.RESEND_API_KEY) : async () => false,
      log: (event, data) => console.log(JSON.stringify({ event, ...data })),
      now: () => Date.now(),
    },
  );
  return new Response(JSON.stringify(result.body), { status: result.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};
