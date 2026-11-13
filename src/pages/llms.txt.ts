import { siteRoot } from '../lib/url.ts';
import { business } from '../data/business.ts';
import { buildRoutes, isIndexable } from '../data/routes.ts';

/** Mirrors indexing approval: lists only approved pages, so a draft is never advertised. */
export function GET() {
  const listed = buildRoutes.filter((r) => isIndexable(r.path));
  const lines = listed.length
    ? listed.map((r) => `- [${r.title}](${siteRoot}${r.path}): ${r.description}`).join('\n')
    : 'This site is not published. No pages are approved for listing.';
  const body = `# ${business.brand}\n\n> ${business.tagline}. Founded and operated by ${business.owner}; a fully remote service with no office in Florida. Makes no promise of MLS compliance.\n\n## Pages\n\n${lines}\n\n## Contact\n\n- Email: ${business.email}\n- Phone: ${business.phoneDisplay}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
