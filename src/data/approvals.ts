/**
 * OWNER APPROVAL RECORD. The only place an owner decision changes what the site publishes.
 *
 * Every approval is a documented record (who, when, where it was given). A bare "yes" is not accepted.
 * Website content, public deployment and search indexing are three separate decisions:
 * approving one does not imply the others.
 *
 * Nothing is approved today. Add entries only from a written owner decision, and copy the same
 * decision into docs/stageliora-final-owner-release-checklist.md.
 */
import { qaFixture } from './approvals.qa-fixture.ts';

export interface ApprovalRecord { by: string; date: string; reference: string }

/** Owner-approved figures for one pricing card on /pricing/. Every number must come from a written owner decision. */
export interface PlanPrice extends ApprovalRecord {
  currency: 'USD';
  /** Integer cents. Leave a field out when it has not been approved; never use 0 for unknown. */
  pricePerPhotoCents?: number;
  annualFeeCents?: number;
  prepaidCents?: number;
  includedPhotos?: number;
  minimumPhotos?: number;
  includedCreditsCents?: number;
}

/** Every field must be answered before a service can be sold. A competitor offering it proves nothing. */
export interface ServiceApproval extends ApprovalRecord {
  performedBy: string;
  customerFiles: string;
  output: string;
  limitations: string;
  turnaround: string;
  revisions: string;
  disclosureRestrictionsReviewed: boolean;
}

export interface OwnerApprovals {
  /** Release-level decisions. Content and design approval cover all 60 routes, and nothing beyond them. */
  websiteContent: ApprovalRecord | null;
  pageDesign: ApprovalRecord | null;
  publicDeployment: ApprovalRecord | null;
  searchIndexing: ApprovalRecord | null;
  /** Route path -> record */
  publication: Record<string, ApprovalRecord>;
  indexing: Record<string, ApprovalRecord>;
  /** Service slug -> full operational answers */
  services: Record<string, ServiceApproval>;
  /** Service slug -> USD per image, approved under DEC-009 */
  prices: Record<string, number>;
  /** Plan id (see src/data/pricing-plans.ts) -> approved figures. Empty means no price is shown. */
  planPricing: Record<string, PlanPrice>;
  /**
   * Pricing-card claims that need their own owner decision, beyond the approved prices.
   * bundleSavings: "Save 11%" / "Save 22%" badges, measured against the Pay As You Go rate. Needs approved bundle eligibility terms.
   * noBundleRequired: "No Bundle Required" on Pay As You Go. While null, the card shows "Flexible Per-Photo Pricing".
   */
  pricingClaims: { bundleSavings: ApprovalRecord | null; noBundleRequired: ApprovalRecord | null };
  /** Legal doc slug -> attorney or owner legal sign-off */
  legalReview: Record<string, ApprovalRecord>;
  /** Location slug -> service coverage and page authorization */
  coverage: Record<string, ApprovalRecord>;
  /** Set only after a real message has arrived in the recipient inbox from the deployed endpoint */
  formDeliveryVerified: ApprovalRecord | null;
  /** Set only when genuine, permitted customer reviews exist */
  genuineReviews: ApprovalRecord | null;
  /** Devender Garg's approval of the first-person statements in src/data/founder.ts. Required before they are published. */
  founderStatements: ApprovalRecord | null;
  /** Confirmation that Devender Garg is StageLiora's Founder & Owner. Required before that title is shown. */
  founderRole: ApprovalRecord | null;
  /** Devender Garg's own photograph (or his approved professional edit), supplied for publication. Required before any portrait is shown. */
  founderPortrait: ApprovalRecord | null;
  /** The owner-uploaded horizontal STAGELIORA logo artwork. Required before it replaces the text wordmark. */
  brandLogo: ApprovalRecord | null;
}

/**
 * PAGE_CONTENT_APPROVAL = APPROVED and PAGE_DESIGN_APPROVAL = APPROVED, for all 60 routes.
 * The owner's instruction named no signer and carried no signature or timestamp, so none is recorded.
 * This does NOT establish: legal entity, service fulfillment, prices, turnaround, refund or revision terms,
 * image rights, reviews, geographic coverage, payments, accounts, uploads, email delivery, legal review,
 * public deployment or search indexing.
 */
const OWNER_CONTENT_DESIGN: ApprovalRecord = {
  by: 'Owner instruction (no named signer)',
  date: 'Recorded 2026-11-05; the instruction carried no timestamp of its own',
  reference: 'Master Prompt V3.0, Section 1',
};

/** V23 location approval. Same honesty rule as above: no signer or timestamp is invented. */
const LOCATION_COVERAGE: ApprovalRecord = {
  by: 'Owner instruction in the Claude Code session (no named signer)',
  date: '2026-11-12',
  reference: 'V23: "All 12 StageLiora location pages are now owner-approved"; remote service coverage and page ownership for this site, subject to factual and editorial checks',
};

/** V23.1 route publication for the location pages and hub. Not a deployment or indexing approval. */
const LOCATION_PUBLICATION: ApprovalRecord = {
  by: 'Owner instruction in the Claude Code session (no named signer)',
  date: '2026-11-12',
  reference: 'V23.1: "The owner has approved all 12 location pages and Locations hub"; route publication only',
};

const OWNER_APPROVALS: OwnerApprovals = {
  websiteContent: OWNER_CONTENT_DESIGN,
  pageDesign: OWNER_CONTENT_DESIGN,
  // V24: "The owner explicitly approves completing the remaining StageLiora production-release work and deploying
  // the verified website to Cloudflare." Deployment of whatever passes every other gate; it does not approve any
  // route, legal page, service or search indexing, and the release still stops while those are missing.
  publicDeployment: { by: 'Owner instruction in the Claude Code session (no named signer)', date: '2026-11-12', reference: 'V24: owner approves completing production-release work and deploying the verified website to Cloudflare Pages; search indexing explicitly stays disabled' },
  searchIndexing: null,
  // V23.1: the owner approved publishing the 12 location pages and the Locations hub, and nothing else.
  // This is route-level publication only. Public deployment of the site, search indexing, legal review and
  // service approvals are separate decisions that have NOT been given, so the release stays gated.
  publication: Object.fromEntries(['/locations/', ...['st-petersburg-fl', 'st-pete-beach', 'gulfport', 'treasure-island', 'south-pasadena', 'madeira-beach', 'pinellas-park', 'seminole', 'largo', 'clearwater', 'dunedin', 'safety-harbor'].map((s) => `/locations/${s}/`)].map((p) => [p, LOCATION_PUBLICATION])),
  indexing: {},
  services: {},
  prices: {},
  planPricing: {
    'pay-as-you-go': { by: 'Devender Garg, Founder & Owner (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V12 pricing: $18 per photo approved for publication as a net price (no comparison or savings claim)', currency: 'USD', pricePerPhotoCents: 1800 },
    'essential-bundle': { by: 'Devender Garg, Founder & Owner (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V12 pricing: $16 per photo approved as a net price. Bundle size, prepayment, expiry and refunds not yet set', currency: 'USD', pricePerPhotoCents: 1600 },
    'plus-bundle': { by: 'Devender Garg, Founder & Owner (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V12 pricing: $14 per photo approved as a net price. Bundle size, prepayment, expiry and refunds not yet set', currency: 'USD', pricePerPhotoCents: 1400 },
    'dedicated-assistance': { by: 'Devender Garg, Founder & Owner (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V12 pricing: $3,000 per year fee approved for display only. Credits, a $12 rate and an assigned person NOT approved', currency: 'USD', annualFeeCents: 300000 },
  },
  // V13: not approved. Bundle eligibility (size, prepayment, expiry, refunds) is not set, so no savings badge is published.
  pricingClaims: { bundleSavings: null, noBundleRequired: null },
  legalReview: {},
  // V23: the owner approved all 12 location pages in one written instruction. It named no signer, so none is recorded.
  // This covers geographic coverage (remote editing of listing photos for properties in that city) and authorization
  // for this site to own the page. It is NOT publication of the production site, search indexing or a service approval.
  // Whether a page meets the editorial bar is a separate check: see `decision` in src/data/locations.ts.
  coverage: Object.fromEntries(['st-petersburg-fl', 'st-pete-beach', 'gulfport', 'treasure-island', 'south-pasadena', 'madeira-beach', 'pinellas-park', 'seminole', 'largo', 'clearwater', 'dunedin', 'safety-harbor'].map((slug) => [slug, LOCATION_COVERAGE])),
  formDeliveryVerified: null,
  genuineReviews: null,
  founderStatements: { by: 'Devender Garg (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V10.1: first-person statements in src/data/founder.ts approved as written' },
  founderRole: { by: 'Devender Garg (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V10.1: Founder & Owner of StageLiora confirmed' },
  founderPortrait: { by: 'Devender Garg (supplied in the Claude Code session)', date: '2026-11-06', reference: 'V10.3: owner-supplied founder photograph (professional edit) for the founder page and homepage note' },
  brandLogo: { by: 'Owner (uploaded in the Claude Code session as the approved primary logo)', date: '2026-11-10', reference: 'V16.0: approved STAGELIORA horizontal logo; source src/assets/brand/stageliora-primary-horizontal.png, sha256 7c3a8c2d' },
};

/** QA_FIXTURE swaps in clearly fake approvals to test the gates. The production build script refuses it. */
export const qaFixtureName = process.env.QA_FIXTURE || '';
export const approvals: OwnerApprovals = qaFixtureName ? (qaFixture(qaFixtureName) as OwnerApprovals) : OWNER_APPROVALS;
