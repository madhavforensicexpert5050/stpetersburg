/**
 * Central URL helpers. Every internal href, src and data-zoom in a template goes through url(),
 * so one site can be served from the domain root (custom domain) or from a subpath (GitHub Pages).
 *
 * Route logic (the registry, isLive, findRoute) always works with unprefixed paths like "/about/".
 * The base path is applied only at render time, here.
 *
 * Astro sets BASE_URL and SITE from astro.config.mjs, which picks them from DEPLOY_TARGET.
 */
import { business } from '../data/business.ts';
const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, ''); // '' at the root, '/stpetersburg' on GitHub Pages
const origin = (import.meta.env.SITE || business.siteUrl).replace(/\/+$/, '');

/**
 * Prefixes a root-relative path with the base path. Anything else (https:, mailto:, tel:, #hash,
 * protocol-relative //host, data:) passes through untouched. Idempotent: a path that already
 * carries the base is returned as is, so the base can never be applied twice.
 */
export function url(p: string): string {
  if (!p || !p.startsWith('/') || p.startsWith('//')) return p;
  if (!base) return p;
  if (p === base || p.startsWith(`${base}/`)) return p;
  return `${base}${p}`;
}

/** Absolute URL for canonical links, Open Graph and structured data. */
export const absUrl = (p: string) => `${origin}${url(p)}`;

/** The site's own root without a trailing slash, e.g. https://madhavforensicexpert5050.github.io/stpetersburg */
export const siteRoot = `${origin}${base}`;
