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
  /** Per-asset production approval for AI-created example images. Only the listed media ids are approved. */
  productionImages: (ApprovalRecord & { ids: string[] }) | null;
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

/** V30 (2026-11-13): owner decisions relayed in the Claude Code session by Devender Garg's authorized representative,
 *  who confirmed in session that Devender himself read and approved each item. No signature exists and none is implied.
 *  No attorney review took place. Search indexing is NOT approved. /request-quote/ and /portfolio/ are NOT published. */
const V30_RELAY = 'Devender Garg, relayed in the Claude Code session by his authorized representative (no signature)';
const V30_PUBLICATION: ApprovalRecord = { by: V30_RELAY, date: '2026-11-13', reference: 'V30: owner-approved 31-page production release set (route publication only; noindex; bookings closed; no /request-quote/, no /portfolio/)' };
export const V30_CORE_ROUTES = ['/', '/about/', '/about/devender-garg/', '/contact/', '/how-it-works/', '/pricing/', '/services/', '/faq/', '/guides/', '/guides/what-is-virtual-staging/', '/guides/virtual-staging-cost/', '/guides/virtual-staging-faqs/', '/guides/virtual-staging-vs-traditional-staging/', '/guides/how-to-prepare-photos-for-virtual-staging/', '/guides/virtual-staging-disclosure-florida/', '/guides/virtual-staging-for-real-estate-agents/', '/privacy-policy/', '/terms-of-service/'];

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
  publication: Object.fromEntries(['/locations/', ...['st-petersburg-fl', 'st-pete-beach', 'gulfport', 'treasure-island', 'south-pasadena', 'madeira-beach', 'pinellas-park', 'seminole', 'largo', 'clearwater', 'dunedin', 'safety-harbor'].map((s) => `/locations/${s}/`)].map((p) => [p, LOCATION_PUBLICATION]).concat(V30_CORE_ROUTES.map((p) => [p, V30_PUBLICATION]))),
  indexing: {},
  // V27: owner answers S1-S6 for Virtual Staging. V30 (2026-11-13): S7 confirmed. The representative stated in session that
  // Devender Garg personally reviewed Stellar MLS Rules Article 04.04 and confirms the site's disclosure wording is consistent.
  services: {
    'virtual-staging': {
      by: 'Owner instruction in the Claude Code session (no named signer)', date: '2026-11-12', reference: 'V27: Virtual Staging policies S1-S6 confirmed (2026-11-12); V30: S7 Stellar MLS Article 04.04 review confirmed by Devender Garg, relayed in session 2026-11-13',
      performedBy: 'Devender Garg, using AI-assisted editing combined with manual refinement (no proprietary AI claimed)',
      customerFiles: 'High-resolution JPG/JPEG or PNG photos sent by Google email, with the room type and an optional style; no website upload',
      output: 'Edited JPG/JPEG or PNG images as agreed, at the original pixel dimensions where feasible; originals kept unaltered and separate for the retention period',
      limitations: 'No misleading structural changes, hidden defects, changed views, misrepresented permanent fixtures, staged rooms presented as furnished, or other edits prohibited by listing or advertising rules',
      turnaround: 'Estimated per project in the written quotation; no fixed 24/48/72-hour promise',
      revisions: 'Included rounds, request deadline and extra-revision charges stated in each written quotation; no fixed free-revision promise',
      disclosureRestrictionsReviewed: true,
    },
  },
  prices: {},
  planPricing: {
    'pay-as-you-go': { by: 'Devender Garg, Founder & Owner (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V12 pricing: $18 per photo approved for publication as a net price (no comparison or savings claim)', currency: 'USD', pricePerPhotoCents: 1800 },
    'essential-bundle': { by: 'Devender Garg, Founder & Owner (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V12 pricing: $16 per photo approved as a net price. Bundle size, prepayment, expiry and refunds not yet set', currency: 'USD', pricePerPhotoCents: 1600 },
    'plus-bundle': { by: 'Devender Garg, Founder & Owner (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V12 pricing: $14 per photo approved as a net price. Bundle size, prepayment, expiry and refunds not yet set', currency: 'USD', pricePerPhotoCents: 1400 },
    'dedicated-assistance': { by: 'Devender Garg, Founder & Owner (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V12 pricing: $3,000 per year fee approved for display only. Credits, a $12 rate and an assigned person NOT approved', currency: 'USD', annualFeeCents: 300000 },
  },
  // V13: not approved. Bundle eligibility (size, prepayment, expiry, refunds) is not set, so no savings badge is published.
  pricingClaims: { bundleSavings: null, noBundleRequired: null },
  // V30: OWNER sign-off only (not an attorney review) of the final drafts dated 2026-11-13, approved as written.
  legalReview: {
    'privacy-policy': { by: V30_RELAY, date: '2026-11-13', reference: 'V30: final Privacy Policy draft of 2026-11-13 (docs/stageliora-legal-final-drafts-2026-11-13.md) approved as written; owner sign-off, no attorney review' },
    'terms-of-service': { by: V30_RELAY, date: '2026-11-13', reference: 'V30: final Terms of Service draft of 2026-11-13 (docs/stageliora-legal-final-drafts-2026-11-13.md) approved as written; owner sign-off, no attorney review' },
  },
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
  // V30 (2026-11-13): Devender Garg confirmed, relayed in session, that exactly the 36 AI-created images used on the
  // 31-page release are approved for public website use (docs/stageliora-v30-production-image-list.md). They stay
  // disclosed as AI-created; this is NOT a licensed-photo approval, so /portfolio/ (realImages) stays gated.
  productionImages: { by: V30_RELAY, date: '2026-11-13', reference: 'V30: the 36 AI-created images on the 31-page production release approved for public website use (docs/stageliora-v30-production-image-list.md); remaining Portfolio and unused images not approved', ids: ['hero-living-after', 'hero-living-before', 'lib-coastal-deck', 'lib-coastal-living-room', 'lib-coastal-porch', 'lib-coastal-primary-bedroom', 'lib-contemporary-living-room', 'lib-farmhouse-porch', 'lib-modern-living-room', 'lib-scandinavian-living-room', 'lib-scandinavian-sunroom', 'lib-traditional-living-room', 'lib-transitional-living-room', 'lib-transitional-primary-bedroom', 'pf-dining-room-after', 'pf-dining-room-before', 'pf-guest-bedroom-after', 'pf-guest-bedroom-before', 'pf-home-office-after', 'pf-home-office-before', 'pf-kitchen-after', 'pf-kitchen-before', 'pf-living-room-after', 'pf-living-room-before', 'pf-primary-bedroom-after', 'pf-primary-bedroom-before', 'showcase-bedroom-after', 'showcase-bedroom-before', 'showcase-dining-after', 'showcase-dining-before', 'svc-furniture-removal-after', 'svc-furniture-removal-before', 'svc-photo-enhancement-after', 'svc-photo-enhancement-before', 'svc-virtual-staging-after', 'svc-virtual-staging-before'] },
  brandLogo: { by: 'Owner (uploaded in the Claude Code session as the approved primary logo)', date: '2026-11-10', reference: 'V16.0: approved STAGELIORA horizontal logo; source src/assets/brand/stageliora-primary-horizontal.png, sha256 7c3a8c2d' },
};

/** QA_FIXTURE swaps in clearly fake approvals to test the gates. The production build script refuses it. */
export const qaFixtureName = process.env.QA_FIXTURE || '';
export const approvals: OwnerApprovals = qaFixtureName ? (qaFixture(qaFixtureName) as OwnerApprovals) : OWNER_APPROVALS;
