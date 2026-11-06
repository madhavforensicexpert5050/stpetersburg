/**
 * Central route registry. Each route carries separate, non-interchangeable statuses:
 *   buildStatus         is the page built and complete as a page?
 *   publicationStatus   release classification (see PublicationStatus)
 *   indexingStatus      may search engines index it?
 *   ownerApprovalStatus has the owner documented approval?
 * SITE_MODE=preview builds everything, safely noindex. SITE_MODE=production builds only documented approvals.
 */
import { approvals } from './approvals.ts';
import { services } from './services.ts';
import { guides } from './guides.ts';
import { locations } from './locations.ts';
import { legalDocs } from './legal.ts';
import { stylePages, interiorDesign } from './content.ts';
import { styles } from './taxonomy.ts';

/** Legacy parity vocabulary required by the V2.0 brief. Describes development only. */
export type DevStatus = 'IMPLEMENTED' | 'IMPLEMENTED AS INTERNAL DRAFT' | 'PENDING OWNER BUSINESS CAPABILITY' | 'PENDING ASSET APPROVAL' | 'PENDING BACKEND INTEGRATION';
export type Template = 'home' | 'about' | 'contact' | 'how' | 'pricing' | 'faq' | 'reviews' | 'servicesHub' | 'service' | 'portfolio' | 'library' | 'stylesHub' | 'style' | 'audience' | 'interiorDesign' | 'designers' | 'designProjects' | 'guidesHub' | 'guide' | 'locationsHub' | 'location' | 'legal' | 'quote' | 'order' | 'account' | 'orders' | 'upload';

export type BuildStatus = 'COMPLETE' | 'COMPLETE_DRAFT_PENDING_INPUTS' | 'EMPTY_STATE_ONLY' | 'DISABLED_PREVIEW_ONLY';
export type PublicationStatus = 'READY_FOR_OWNER_REVIEW' | 'APPROVED_FOR_PUBLICATION' | 'PUBLIC_BUT_NOINDEX' | 'PRIVATE_OR_DISABLED' | 'BLOCKED_PENDING_EVIDENCE';
export type IndexingStatus = 'INDEX_APPROVED' | 'NOT_APPROVED_YET' | 'NOINDEX_IF_PUBLISHED' | 'NEVER_INDEX';
export type OwnerApprovalStatus = 'APPROVED_PUBLICATION_AND_INDEXING' | 'APPROVED_PUBLICATION_ONLY' | 'NOT_APPROVED';
export type ContentDesignStatus = 'APPROVED' | 'NOT_APPROVED';

export interface RouteDef {
  path: string; title: string; description: string; group: string; template: Template; ref?: string; crumb: string;
  dev: DevStatus; gate: string; plan: Plan;
}
/** The release proposal for a route. Reflects judgment, never approval. */
interface Plan {
  build: BuildStatus;
  proposed: Exclude<PublicationStatus, 'APPROVED_FOR_PUBLICATION'>;
  indexing: 'INDEX_AFTER_APPROVAL' | 'NOINDEX_IF_PUBLISHED' | 'NEVER_INDEX';
  /** What must be true first. See dependency keys in release.ts */
  needs: string[];
  why?: string;
  lastmod?: string;
}

const READY = (needs: string[] = [], lastmod?: string): Plan => ({ build: 'COMPLETE', proposed: 'READY_FOR_OWNER_REVIEW', indexing: 'INDEX_AFTER_APPROVAL', needs, lastmod });
const BLOCKED = (why: string, needs: string[], build: BuildStatus = 'COMPLETE_DRAFT_PENDING_INPUTS'): Plan => ({ build, proposed: 'BLOCKED_PENDING_EVIDENCE', indexing: 'INDEX_AFTER_APPROVAL', needs, why });
const PRIVATE = (why: string, needs: string[], build: BuildStatus = 'DISABLED_PREVIEW_ONLY'): Plan => ({ build, proposed: 'PRIVATE_OR_DISABLED', indexing: 'NEVER_INDEX', needs, why });

const r = (path: string, crumb: string, title: string, description: string, group: string, template: Template, dev: DevStatus, gate: string, plan: Plan, ref?: string): RouteDef => ({ path, crumb, title, description, group, template, dev, gate, plan, ref });

const CORE = 'Owner publication approval; DEC-004, DEC-006';
const G = { main: 'Main business', svc: 'Services', vis: 'Portfolio & design library', cust: 'Customer-specific', id: 'Online interior design', gd: 'Resources & guides', loc: 'Location pages', leg: 'Legal', ord: 'Customer order system' };

export const routes: RouteDef[] = [
  r('/', 'Home', 'Virtual Staging for Listings in St. Petersburg, FL | StageLiora', 'Virtual staging and real estate photo editing for St. Petersburg, FL listings. See what changes, what must stay, and how to disclose it.', G.main, 'home', 'IMPLEMENTED', `${CORE}; DEC-008; DEC-023`, READY(['anyService'])),
  r('/about/', 'About', 'About StageLiora | Virtual Staging and Photo Editing', 'What StageLiora does, who it is for, how it approaches honest listing images, and what the company does not claim, including a Florida office.', G.main, 'about', 'IMPLEMENTED', 'DEC-005; owner facts', READY()),
  r('/contact/', 'Contact', 'Contact StageLiora | Email and Phone', 'Reach StageLiora by email or phone. StageLiora works remotely and has no public office in Florida. Send a question about a listing or a project.', G.main, 'contact', 'IMPLEMENTED', 'DEC-006; DEC-027; contact routing test', READY()),
  r('/how-it-works/', 'How It Works', 'How Virtual Staging Works at StageLiora', 'The steps from describing your listing to reviewing edited images, and what happens at each one, including photo rights and MLS disclosure.', G.main, 'how', 'IMPLEMENTED', 'DEC-007; DEC-013', READY(['anyService'])),
  r('/pricing/', 'Pricing', 'Virtual Staging Pricing and Quotes | StageLiora', 'What shapes the cost of edited listing photos: the service, the number of images, the room and the source photo. No invented discounts or packages.', G.main, 'pricing', 'IMPLEMENTED', 'DEC-009; DEC-010', READY(['anyService'])),
  r('/faq/', 'FAQ', 'Virtual Staging FAQ | StageLiora', 'Answers about virtual staging, Stellar MLS disclosure, photo rights, timing and what StageLiora can and cannot promise for your listing.', G.main, 'faq', 'IMPLEMENTED', 'DEC-011; DEC-012; DEC-013', READY()),
  r('/reviews/', 'Reviews', 'Reviews (Draft) | StageLiora', 'Reviews from StageLiora clients, published only with their permission and exactly as written. No reviews have been posted yet.', G.main, 'reviews', 'IMPLEMENTED AS INTERNAL DRAFT', 'Genuine reviews must exist (LEG-008)', BLOCKED('No genuine reviews exist. An empty reviews page has no customer purpose.', ['genuineReviews'], 'EMPTY_STATE_ONLY')),

  r('/services/', 'Services', 'Virtual Staging and Photo Editing Services | StageLiora', 'StageLiora image services, split between listing-photo edits and concept visualizations, each with its scope, limits and Stellar MLS notes.', G.svc, 'servicesHub', 'IMPLEMENTED', 'DEC-008', READY(['anyService'])),
  ...services.map((s) => r(s.path, s.name, s.title, s.description, G.svc, 'service', 'IMPLEMENTED AS INTERNAL DRAFT', s.track === 'concept-visualization' ? 'DEC-008; DEC-020 (finish and exterior edits)' : 'DEC-008; DEC-007; DEC-023', BLOCKED(s.track === 'concept-visualization' ? 'Concept only. Not approved for sale, and not usable as a Stellar listing photo.' : 'Content is ready, but the owner has not confirmed the service can be sold and delivered.', [`service:${s.slug}`]), s.slug)),

  r('/portfolio/', 'Portfolio', 'Before and After Examples (Placeholders) | StageLiora', 'Before-and-after comparisons by room. Current examples are illustrations, not client projects. Licensed client work will be added and labeled.', G.vis, 'portfolio', 'PENDING ASSET APPROVAL', 'DEC-023; written image rights', BLOCKED('Publishing placeholders as a portfolio could suggest completed work.', ['realImages:/portfolio/'], 'EMPTY_STATE_ONLY')),
  r('/design-library/', 'Design Library', 'Virtual Staging Design Library | StageLiora', 'Browse design directions by style and room. Filter eight styles across thirteen room types. Images are illustrations of each direction.', G.vis, 'library', 'PENDING ASSET APPROVAL', 'DEC-023; DEC-008', BLOCKED('A library of placeholders offers no real design choice to a customer.', ['realImages:/design-library/', 'anyService'])),
  r('/design-styles/', 'Design Styles', 'Virtual Staging Design Styles | StageLiora', 'How to choose a staging style that suits the home in the photo. Compare modern, Scandinavian, farmhouse, contemporary and four more directions.', G.vis, 'stylesHub', 'IMPLEMENTED', 'DEC-023', BLOCKED('Style choices cannot be ordered, and examples are placeholders.', ['realImages:/design-library/', 'anyService'])),
  ...styles.filter((s) => s.hasPage).map((s) => r(`/design-styles/${s.id}/`, s.name, stylePages[s.id].title, stylePages[s.id].description, G.vis, 'style', 'IMPLEMENTED AS INTERNAL DRAFT', 'DEC-023: needs approved visual examples', BLOCKED('The brief allows style pages only with approved visual examples.', ['realImages:/design-library/', 'anyService']), s.id)),

  r('/for-real-estate-agents/', 'For Agents', 'Virtual Staging for Real Estate Agents | StageLiora', 'A practical page for listing agents on where staging helps, how to keep edits honest, and the disclosure checklist for Stellar MLS listings.', G.cust, 'audience', 'IMPLEMENTED', 'DEC-014', READY(['anyService']), 'agents'),
  r('/for-real-estate-photographers/', 'For Photographers', 'Virtual Staging for Real Estate Photographers | StageLiora', 'Notes for real estate photographers on shooting for staging, rights in edited files, and twilight conditions. No partner program is available yet.', G.cust, 'audience', 'IMPLEMENTED AS INTERNAL DRAFT', 'DEC-028', BLOCKED('No partner program exists, so the page would describe an offer that cannot be bought.', ['capability:photographer-program']), 'photographers'),
  r('/for-brokerages/', 'For Brokerages', 'Altered Photo Standards for Brokerages | StageLiora', 'How a brokerage can set a clear standard for edited listing photos across its agents. No team plan or brokerage account is available yet.', G.cust, 'audience', 'IMPLEMENTED AS INTERNAL DRAFT', 'Team workflow; DEC-009', BLOCKED('No team workflow or plan exists.', ['capability:team-plan']), 'brokerages'),

  r('/online-interior-design/', 'Online Interior Design', interiorDesign.title, interiorDesign.description, G.id, 'interiorDesign', 'PENDING OWNER BUSINESS CAPABILITY', 'Owner capability; SSOT SVC-G marks this out of scope', PRIVATE('Service not offered. A page that exists only to say so has no customer purpose.', ['capability:interior-design'], 'EMPTY_STATE_ONLY')),
  r('/interior-designers/', 'Interior Designers', 'Interior Designers (Not Available) | StageLiora', 'Draft directory page. StageLiora has no interior designers listed. Profiles appear only for real, authorized designers with their written consent.', G.id, 'designers', 'PENDING OWNER BUSINESS CAPABILITY', 'Real authorized designer records', PRIVATE('No designers exist. None may be invented.', ['capability:interior-design'], 'EMPTY_STATE_ONLY')),
  r('/interior-design-projects/', 'Interior Design Projects', 'Interior Design Projects (Not Available) | StageLiora', 'Draft project page. StageLiora has no interior design projects to show. Projects appear here only when real and authorized for publication.', G.id, 'designProjects', 'PENDING OWNER BUSINESS CAPABILITY', 'Real projects with rights', PRIVATE('No projects exist. None may be invented.', ['capability:interior-design'], 'EMPTY_STATE_ONLY')),

  r('/guides/', 'Guides', 'Virtual Staging Guides for Agents | StageLiora', 'Plain guides on virtual staging: what it is, what it costs, how to prepare photos, and how to handle disclosure for Florida listings.', G.gd, 'guidesHub', 'IMPLEMENTED', 'Editorial approval', READY()),
  ...guides.map((g) => r(g.path, g.h1, g.title, g.description, G.gd, 'guide', 'IMPLEMENTED', 'Editorial approval; legal recheck every 90 days (Rule 6)', READY([], g.updated), g.slug)),

  r('/locations/', 'Locations', 'St. Petersburg Area Market Notes | StageLiora', 'Housing-mix notes for St. Petersburg and nearby Pinellas County cities, for planning listing photos. StageLiora works remotely and has no local office.', G.loc, 'locationsHub', 'IMPLEMENTED AS INTERNAL DRAFT', 'DEC-033; owner approval', BLOCKED('A hub needs at least two published location pages. It is also a research table today.', ['twoLocations'])),
  ...locations.map((l) => r(l.path, l.name, l.title, l.description, G.loc, 'location', l.slug === 'st-petersburg-fl' ? 'IMPLEMENTED' : 'IMPLEMENTED AS INTERNAL DRAFT', 'Eligibility rules 4 and 7: coverage approval and owner authorization', l.slug === 'st-petersburg-fl' ? READY([`coverage:${l.slug}`]) : BLOCKED(l.decisionWhy, [`coverage:${l.slug}`]), l.slug)),

  ...legalDocs.map((d) => r(d.path, d.h1, d.title, d.description, G.leg, 'legal', 'IMPLEMENTED AS INTERNAL DRAFT', 'DEC-005; DEC-006; DEC-018 attorney review', { ...BLOCKED('Unfilled items and no legal review. Needs entity, address, terms and sign-off.', [`legal:${d.slug}`]), indexing: 'NOINDEX_IF_PUBLISHED' }, d.slug)),

  r('/request-quote/', 'Request a Quote', 'Request a Virtual Staging Quote | StageLiora', 'Tell StageLiora about your listing and what you need. Validated quote form, with a clear email option whenever online delivery is not available.', G.ord, 'quote', 'PENDING BACKEND INTEGRATION', 'Tested submission endpoint; DEC-027', { build: 'COMPLETE', proposed: 'PUBLIC_BUT_NOINDEX', indexing: 'NOINDEX_IF_PUBLISHED', needs: ['anyService'], why: 'A form page has little value in search. Works truthfully through email until live delivery is verified.' }),
  r('/order/', 'Order', 'Order (Internal Draft) | StageLiora', 'Internal draft of the order flow. Not available to customers. No payment is taken and no order is created.', G.ord, 'order', 'PENDING BACKEND INTEGRATION', 'DEC-009; DEC-016; backend', PRIVATE('No checkout, prices or order backend exist.', ['backend:orders'])),
  r('/account/', 'Account', 'Account (Internal Draft) | StageLiora', 'Internal draft of the customer account screen. Sign-in is not connected and no account can be created.', G.ord, 'account', 'PENDING BACKEND INTEGRATION', 'Auth backend; DEC-015', PRIVATE('No authentication exists.', ['backend:auth'])),
  r('/orders/', 'Orders', 'Orders (Internal Draft) | StageLiora', 'Internal draft of order tracking. It displays an empty state because no orders exist and no backend is connected.', G.ord, 'orders', 'PENDING BACKEND INTEGRATION', 'Order backend; DEC-015', PRIVATE('No authentication or order storage exists.', ['backend:orders'])),
  r('/upload/', 'Upload', 'Photo Upload (Internal Draft) | StageLiora', 'Internal draft of secure photo upload. Files are checked in your browser only and are never transmitted. Storage is not connected.', G.ord, 'upload', 'PENDING BACKEND INTEGRATION', 'Private storage; DEC-030; LEG-001', PRIVATE('No private storage, access control or retention policy exists.', ['backend:storage'])),
];

export const siteMode = process.env.SITE_MODE === 'production' ? 'production' : 'preview';
export const isPreview = siteMode === 'preview';
export const indexingEnv = process.env.INDEXING === 'on';

const validRecord = (x?: { by: string; date: string; reference: string } | null) => Boolean(x && x.by && x.date && x.reference);
const contentAndDeploy = validRecord(approvals.websiteContent) && validRecord(approvals.pageDesign) && validRecord(approvals.publicDeployment);
/** Set only by the release-candidate build: the routes whose own dependencies are met. Never a publication approval. */
const candidateRoutes = (process.env.CANDIDATE_ROUTES || '').split(',').filter(Boolean);
export const isCandidateBuild = candidateRoutes.length > 0;

/** Hard exclusion: these can never reach a production build while their application backend is absent. */
export const isPublishable = (x: RouteDef) => x.plan.proposed !== 'PRIVATE_OR_DISABLED' && contentAndDeploy && validRecord(approvals.publication[x.path]);

/**
 * DEPLOY_TARGET=github-pages builds a PUBLIC PREVIEW: anyone can open it, but it is noindex and is not a
 * production release. It is still a preview build (no publication approval is implied), so it keeps the
 * honest status labels. It differs from the internal review build in two ways:
 *   1. Routes that are unsafe on an open URL are left out (publicPreviewExclusion explains each one).
 *   2. Owner-facing working notes are hidden (see isInternalReview).
 */
export const isPublicPreview = isPreview && process.env.DEPLOY_TARGET === 'github-pages';
/** The internal review build, meant only for the owner. Shows working notes that a public visitor should not see. */
export const isInternalReview = isPreview && !isPublicPreview;

/** Why a route stays out of the public preview, or null when it is eligible. */
export function publicPreviewExclusion(x: RouteDef): string | null {
  if (x.plan.proposed === 'PRIVATE_OR_DISABLED') return `Disabled route: ${x.plan.why}`;
  if (x.template === 'legal') return 'Unreviewed legal draft with unfilled items. Publishing draft terms could be read as the business\'s actual terms.';
  if (x.template === 'quote') return 'Quote requests depend on an owner-approved service, and none is approved yet.';
  if (x.template === 'location') {
    const decision = locations.find((l) => l.slug === x.ref)?.decision;
    if (decision === 'CONSOLIDATE_OR_RESEARCH_ONLY' || decision === 'HOLD_OVERLAP_WITH_OTHER_PROPERTY') return 'Internal research record. Its own text says it is not intended for publication in this form.';
  }
  return null;
}

export const buildRoutes = routes.filter((x) =>
  isPublicPreview ? !publicPreviewExclusion(x) : isPreview || (isCandidateBuild ? candidateRoutes.includes(x.path) : isPublishable(x)));
const built = new Set(buildRoutes.map((x) => x.path));

/** True when a path exists in this build. Use it to filter navigation, cards and links. */
export const isLive = (p: string) => built.has(p.split(/[?#]/)[0]);
export const findRoute = (p: string) => routes.find((x) => x.path === p);

/** Search indexing needs its own release approval, its own route approval and INDEXING=on. */
export const isIndexable = (p: string) => {
  const route = findRoute(p);
  return Boolean(route) && !isPreview && !isCandidateBuild && indexingEnv && built.has(p) && route!.plan.indexing === 'INDEX_AFTER_APPROVAL' && validRecord(approvals.searchIndexing) && validRecord(approvals.indexing[p]);
};
export const sitemapRoutes = () => buildRoutes.filter((x) => isIndexable(x.path));

export const buildStatusOf = (x: RouteDef): BuildStatus => x.plan.build;
export const contentApprovalOf = (_x: RouteDef): ContentDesignStatus => (validRecord(approvals.websiteContent) ? 'APPROVED' : 'NOT_APPROVED');
export const designApprovalOf = (_x: RouteDef): ContentDesignStatus => (validRecord(approvals.pageDesign) ? 'APPROVED' : 'NOT_APPROVED');
export const ownerApprovalOf = (x: RouteDef): OwnerApprovalStatus => (validRecord(approvals.publication[x.path]) ? (validRecord(approvals.indexing[x.path]) ? 'APPROVED_PUBLICATION_AND_INDEXING' : 'APPROVED_PUBLICATION_ONLY') : 'NOT_APPROVED');
/** Only a documented owner approval can produce APPROVED_FOR_PUBLICATION. */
export const publicationOf = (x: RouteDef): PublicationStatus => (validRecord(approvals.publication[x.path]) && x.plan.proposed !== 'PRIVATE_OR_DISABLED' ? 'APPROVED_FOR_PUBLICATION' : x.plan.proposed);
export const indexingOf = (x: RouteDef): IndexingStatus => (x.plan.indexing === 'NEVER_INDEX' ? 'NEVER_INDEX' : x.plan.indexing === 'NOINDEX_IF_PUBLISHED' ? 'NOINDEX_IF_PUBLISHED' : validRecord(approvals.indexing[x.path]) && validRecord(approvals.searchIndexing) ? 'INDEX_APPROVED' : 'NOT_APPROVED_YET');
