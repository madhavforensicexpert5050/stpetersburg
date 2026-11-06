import { siteRoot } from '../lib/url.ts';
import { isPreview, isPublicPreview, sitemapRoutes } from '../data/routes.ts';

/**
 * robots.txt never blocks crawling, because a blocked crawler cannot read a page's noindex and the URL
 * could still surface in search. Noindex handles search. Authentication handles anything private.
 */
export function GET() {
  const hasSitemap = !isPreview && sitemapRoutes().length > 0;
  const head = isPublicPreview
    ? '# Public preview on GitHub Pages. Every page carries noindex. This is not a production release.\n'
    : isPreview
    ? '# Preview build. Every page carries noindex. Preview deployments must also require a password.\n'
    : hasSitemap ? '' : '# Published pages carry noindex until search indexing is approved.\n';
  const body = `${head}User-agent: *\nAllow: /\n${hasSitemap ? `\nSitemap: ${siteRoot}/sitemap.xml\n` : ''}`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
