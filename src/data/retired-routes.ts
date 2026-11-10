/**
 * Routes that were public and have been retired. Each one keeps a forwarding path, because a retired URL
 * may still be bookmarked or shared even though it was never indexed.
 *
 * No imports: astro.config.mjs reads this file at build time.
 *   Hosts that read _redirects (Cloudflare Pages, Netlify): a real 301 is written to _redirects.
 *   GitHub Pages cannot send a 301, so a small "this page has moved" page is written at the old path,
 *   with a visible link, an immediate refresh, a canonical pointing at the destination and noindex.
 * If the destination is not part of a build, the forward goes to the homepage instead.
 */
export interface RetiredRoute { from: string; to: string; retired: string; reason: string; label: string }

export const retiredRoutes: RetiredRoute[] = [
  {
    from: '/for-real-estate-agents/',
    to: '/guides/virtual-staging-for-real-estate-agents/',
    retired: '2026-11-10',
    label: 'How to use virtual staging for a real estate listing',
    reason: 'V18 consolidation: the agent decision content moved to the agent guide, How It Works, Pricing, the FAQ and the furniture removal service, so the landing page no longer competes with the homepage.',
  },
];
