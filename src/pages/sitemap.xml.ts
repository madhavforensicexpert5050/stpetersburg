import { business } from '../data/business.ts';
import { sitemapRoutes } from '../data/routes.ts';

/**
 * Lists only routes that are built, published and individually approved for indexing.
 * lastmod appears only where the date is reliably known, and is never invented.
 * scripts/build-production.mjs checks every entry against the actual output.
 */
export function GET() {
  const urls = sitemapRoutes().map((r) => `  <url>\n    <loc>${business.siteUrl}${r.path}</loc>${r.plan.lastmod ? `\n    <lastmod>${r.plan.lastmod}</lastmod>` : ''}\n  </url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
