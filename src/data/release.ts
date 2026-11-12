/**
 * Strict release validation. Decides whether a production release is blocked, invalid or allowed,
 * and explains each route's blockers. Used by the production build, QA and the generated documents.
 */
import { approvals, qaFixtureName } from './approvals.ts';
import { media } from './media.ts';
import { routes, findRoute, type RouteDef } from './routes.ts';
import { services } from './services.ts';
import { locations } from './locations.ts';

const valid = (x?: { by: string; date: string; reference: string } | null) => Boolean(x && x.by && x.date && x.reference);

export type ServiceReadiness = 'OWNER_APPROVED_AND_OPERATIONAL' | 'CONTENT_READY_BUT_UNAPPROVED' | 'CONCEPT_ONLY' | 'NOT_OFFERED';

export function serviceApprovalGaps(slug: string): string[] {
  const a = approvals.services[slug];
  if (!a) return ['No owner approval'];
  const gaps: string[] = [];
  if (!valid(a)) gaps.push('Approval record is incomplete');
  const asks: [keyof typeof a, string][] = [['performedBy', 'Who performs the editing'], ['customerFiles', 'Required customer files'], ['output', 'Output supplied'], ['limitations', 'Editing limitations'], ['turnaround', 'Approved turnaround'], ['revisions', 'Revision handling']];
  for (const [k, label] of asks) if (!a[k]) gaps.push(label);
  if (!a.disclosureRestrictionsReviewed) gaps.push('Disclosure restrictions not reviewed');
  return gaps;
}
export const serviceReadiness = (slug: string): ServiceReadiness => {
  if (serviceApprovalGaps(slug).length === 0) return 'OWNER_APPROVED_AND_OPERATIONAL';
  return services.find((s) => s.slug === slug)?.track === 'concept-visualization' ? 'CONCEPT_ONLY' : 'CONTENT_READY_BUT_UNAPPROVED';
};
const operational = () => services.filter((s) => serviceReadiness(s.slug) === 'OWNER_APPROVED_AND_OPERATIONAL');

/** Images on a page count as ready only when every one has been replaced and approved. */
const pageImagesApproved = (page: string) => { const items = media.filter((m) => m.page === page); return items.length > 0 && items.every((m) => m.publication === 'approved' && m.ownerApproved); };

/** Returns a plain description when the dependency is unmet, otherwise null. */
export function unmet(dep: string): string | null {
  const [kind, arg] = dep.split(/:(.*)/);
  switch (kind) {
    case 'anyService': return operational().length ? null : 'No service is owner-approved and operational';
    case 'service': { const g = serviceApprovalGaps(arg); return g.length ? `Service "${arg}" not approved (${g.join('; ')})` : null; }
    case 'legal': return valid(approvals.legalReview[arg]) ? null : `Legal review missing for "${arg}"`;
    case 'coverage': return valid(approvals.coverage[arg]) ? null : `Coverage and page authorization missing for "${arg}"`;
    case 'realImages': return pageImagesApproved(arg) ? null : `Licensed images missing for ${arg}`;
    case 'founderStatements': return valid(approvals.founderStatements) ? null : 'Devender Garg has not approved the first-person statements';
    case 'genuineReviews': return valid(approvals.genuineReviews) ? null : 'No genuine, permitted reviews exist';
    case 'twoLocations': return locations.filter((l) => l.decision === 'PUBLISH' && valid(approvals.coverage[l.slug])).length >= 2 ? null : 'Fewer than two location pages are approved and eligible';
    case 'capability': return `Capability "${arg}" does not exist`;
    case 'backend': return `Backend "${arg}" does not exist`;
    default: return `Unknown dependency "${dep}"`;
  }
}
export const routeBlockers = (r: RouteDef) => r.plan.needs.map(unmet).filter((x): x is string => Boolean(x));

/** Largest set whose own dependencies are met today. Release-level approvals are reported separately. */
export const candidateRoutes = () => routes.filter((r) => !['PRIVATE_OR_DISABLED'].includes(r.plan.proposed) && r.plan.proposed !== 'BLOCKED_PENDING_EVIDENCE' && routeBlockers(r).length === 0);

export interface ReleaseReport { state: 'BLOCKED' | 'INVALID' | 'READY'; errors: string[]; blockers: string[]; warnings: string[]; publishable: string[]; indexable: string[] }

export function validateRelease(env: { endpoint?: string } = {}): ReleaseReport {
  const errors: string[] = [], blockers: string[] = [], warnings: string[] = [];
  const pub = Object.keys(approvals.publication);
  const idx = Object.keys(approvals.indexing);

  if (!valid(approvals.websiteContent)) blockers.push('APPROVE WEBSITE CONTENT has not been recorded');
  if (!valid(approvals.pageDesign)) blockers.push('Page design approval has not been recorded');
  if (!valid(approvals.publicDeployment)) blockers.push('APPROVE PUBLIC DEPLOYMENT has not been recorded');
  if (pub.length === 0) blockers.push('No public route has documented owner approval');

  for (const p of pub) {
    const route = findRoute(p);
    if (!route) { errors.push(`Approved route does not exist: ${p}`); continue; }
    if (!valid(approvals.publication[p])) errors.push(`Approval for ${p} has no who, when or reference`);
    if (route.plan.proposed === 'PRIVATE_OR_DISABLED') errors.push(`${p} is a disabled route and cannot be published`);
    for (const b of routeBlockers(route)) errors.push(`${p}: ${b}`);
  }
  if (pub.length) {
    for (const req of ['/privacy-policy/', '/terms-of-service/']) if (!valid(approvals.publication[req])) errors.push(`A public site requires ${req} to be published`);
  }
  for (const p of idx) {
    const route = findRoute(p);
    if (!route) { errors.push(`Indexing approved for unknown route: ${p}`); continue; }
    if (!valid(approvals.publication[p])) errors.push(`Indexing approved for unpublished route: ${p}`);
    if (route.plan.indexing !== 'INDEX_AFTER_APPROVAL') errors.push(`${p} must stay noindex but has indexing approval`);
  }
  if (idx.length && !valid(approvals.searchIndexing)) errors.push('Route indexing approvals exist without APPROVE SEARCH INDEXING');
  if (env.endpoint && !valid(approvals.formDeliveryVerified)) warnings.push('A form endpoint is configured, but real inbox delivery has not been recorded. Verify on the deployed site before relying on it.');
  if (!env.endpoint) warnings.push('No form endpoint configured. Forms stay in truthful email-fallback mode.');
  for (const p of pub) if (['/', '/services/', '/guides/virtual-staging-for-real-estate-agents/'].includes(p) && media.some((m) => m.page === p && m.rights === 'project-placeholder')) warnings.push(`${p} still shows labeled placeholder drawings`);
  if (qaFixtureName) warnings.push(`QA fixture active: ${qaFixtureName}`);

  const state = errors.length ? 'INVALID' : blockers.length ? 'BLOCKED' : 'READY';
  return { state, errors, blockers, warnings, publishable: state === 'READY' ? pub : [], indexable: state === 'READY' && valid(approvals.searchIndexing) ? idx : [] };
}
