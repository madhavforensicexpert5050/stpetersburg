# StageLiora: St. Petersburg

Source for the StageLiora website, a virtual staging and real estate photo editing business, written for the St. Petersburg, Florida market. Target address: `https://st.petersburg.stageliora.com/`.

**Status:** a noindex public preview is on GitHub Pages at https://madhavforensicexpert5050.github.io/stpetersburg/. The production site is not deployed. Production releases are held behind approval gates (see below). Staged images in this repository are labeled placeholder illustrations, not completed customer work.

## Technology

Astro 5 static site, TypeScript and CSS, with no client framework and no third-party scripts. Fonts are self-hosted. Form delivery is a small server function.

Requires Node 24 or newer, because the scripts import TypeScript directly.

## Run it

```
npm install
npm run dev
```

## Build

| Command | Result |
|---|---|
| `npm run build` | Internal review build in `dist/`: all routes, every page noindex. Not for public hosting |
| `npm run build:candidate` | `dist-candidate/`: routes with no unmet dependency. Noindex, and marked not authorized for deployment |
| `npm run build:github-pages` | `dist-github-pages/`: public preview for GitHub Pages under `/stpetersburg/`. Noindex, no private, legal-draft or quote routes, owner working notes hidden. Validates its own output and deletes it on any failure |
| `npm run build:production` | Validates recorded approvals first. Exits 2 if blocked, 1 if invalid. On success, writes `dist-production/` and checks the output |

A blocked production build is expected until the release approvals are recorded.

## Test

```
npm run qa
npm run build
npm run qa:browser
npm run qa:form
npm run qa:cross
npm run qa:census
```

`qa` runs static checks and the release gate matrix. Browser suites use an installed Chrome. `qa:cross` also needs Playwright's Firefox and WebKit. `qa:census` needs network access.

## Architecture

| Path | Purpose |
|---|---|
| `src/data/routes.ts` | Central registry of 60 routes, with separate build, publication, indexing and approval statuses |
| `src/data/approvals.ts` | The record of release decisions. Each needs who, when and a reference |
| `src/data/release.ts` | Release validation and service readiness |
| `src/data/business.ts` | Brand and contact details |
| `src/data/media.ts` | Central image manifest |
| `src/data/` (others) | Services, guides, locations, legal drafts |
| `src/views/`, `src/components/`, `src/layouts/` | Page templates and components |
| `src/pages/` | Route generation, 404, robots, sitemap, llms.txt |
| `server/`, `functions/` | Form handler, preview password, Cloudflare Pages adapters |
| `scripts/` | Production build, placeholder generator, QA |

## Images

Every image resolves through `src/data/media.ts`. To replace a placeholder, add the licensed file, then update that entry's `src`, dimensions, rights and approval fields. Pages update on their own. Only use images with verified rights.

## Environment

Copy `.env.example` to `.env` for local settings. Never commit real values. Server secrets belong in the host's secret store and must not use the `PUBLIC_` prefix.

Until `PUBLIC_FORM_ENDPOINT` points at a tested endpoint, forms never claim to have sent anything, and offer a prefilled email instead.

## Deployment

### GitHub Pages preview

`.github/workflows/deploy.yml` runs on every push to `main` (or manually). It type-checks, runs `npm run qa`, builds with `npm run build:github-pages` and deploys `dist-github-pages/`. In the repository settings, Pages must use **Source: GitHub Actions**.

`DEPLOY_TARGET=github-pages` sets the site to `https://madhavforensicexpert5050.github.io` and the base to `/stpetersburg`. Without it, builds target the custom domain at the root. Templates never hardcode paths: internal links and images go through `url()` in `src/lib/url.ts`, and canonical URLs go through `absUrl()`.

The preview is public. Anyone with the link can open it, and GitHub Pages cannot require a password. Every page carries noindex, and the sitemap is empty. Do not submit this URL to Search Console. Forms only open a prefilled email, and the server functions in `functions/` do not run on GitHub Pages.

### Production

The production site is not deployed. `wrangler.toml` and `functions/` are prepared for Cloudflare Pages, but hosting has not been finalized and they have not run on a host.

- Build command: `npm run build:production`
- Output folder: `dist-production`
- `st.petersburg` is a two-level subdomain, so a `*.stageliora.com` wildcard certificate does not cover it. Confirm a certificate for the exact hostname.
- Any preview deployment other than the GitHub Pages public preview above must require a password.

## Release restrictions

Page content and design are approved. Publication, search indexing, service availability, legal policies and form delivery are separate release conditions, and are not complete. Do not bypass the gates to make a build pass. No page may claim a Florida office, reviews, prices or guarantees that have not been verified.
