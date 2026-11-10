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
  {
    from: '/for-real-estate-photographers/',
    to: '/guides/how-to-prepare-photos-for-virtual-staging/',
    retired: '2026-11-10',
    label: 'How to prepare photos for virtual staging',
    reason: 'V18.2: owner removed the Who We Serve footer group and its pages. The closest guidance (shooting, rights, twilight) is the photo preparation guide.',
  },
  {
    from: '/for-brokerages/',
    to: '/guides/virtual-staging-disclosure-florida/',
    retired: '2026-11-10',
    label: 'Virtual staging disclosure in Florida',
    reason: 'V18.2: owner removed the Who We Serve footer group and its pages. The closest guidance (disclosure steps, what to put in writing) is the Florida disclosure guide.',
  },
  {
    from: '/design-styles/',
    to: '/portfolio/',
    retired: '2026-11-10',
    label: 'Virtual staging portfolio: before and after, room designs and styles',
    reason: 'V19: owner folded Design Styles, the style pages and the Design Library into the Portfolio (style guide, comparison table, situations, look-alike pairs, FAQs).',
  },
  {
    from: '/design-styles/modern/',
    to: '/portfolio/',
    retired: '2026-11-10',
    label: 'Virtual staging portfolio: before and after, room designs and styles',
    reason: 'V19: owner folded Design Styles, the style pages and the Design Library into the Portfolio (its notes now open from its card in the style guide).',
  },
  {
    from: '/design-styles/scandinavian/',
    to: '/portfolio/',
    retired: '2026-11-10',
    label: 'Virtual staging portfolio: before and after, room designs and styles',
    reason: 'V19: owner folded Design Styles, the style pages and the Design Library into the Portfolio (its notes now open from its card in the style guide).',
  },
  {
    from: '/design-styles/farmhouse/',
    to: '/portfolio/',
    retired: '2026-11-10',
    label: 'Virtual staging portfolio: before and after, room designs and styles',
    reason: 'V19: owner folded Design Styles, the style pages and the Design Library into the Portfolio (its notes now open from its card in the style guide).',
  },
  {
    from: '/design-styles/contemporary/',
    to: '/portfolio/',
    retired: '2026-11-10',
    label: 'Virtual staging portfolio: before and after, room designs and styles',
    reason: 'V19: owner folded Design Styles, the style pages and the Design Library into the Portfolio (its notes now open from its card in the style guide).',
  },
  {
    from: '/design-library/',
    to: '/portfolio/',
    retired: '2026-11-10',
    label: 'Virtual staging portfolio: before and after, room designs and styles',
    reason: 'V19: owner folded Design Styles, the style pages and the Design Library into the Portfolio (filterable room designs, coverage table, FAQs).',
  },
];
