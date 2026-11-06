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

const OWNER_APPROVALS: OwnerApprovals = {
  websiteContent: OWNER_CONTENT_DESIGN,
  pageDesign: OWNER_CONTENT_DESIGN,
  publicDeployment: null,
  searchIndexing: null,
  publication: {},
  indexing: {},
  services: {},
  prices: {},
  legalReview: {},
  coverage: {},
  formDeliveryVerified: null,
  genuineReviews: null,
  founderStatements: { by: 'Devender Garg (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V10.1: first-person statements in src/data/founder.ts approved as written' },
  founderRole: { by: 'Devender Garg (confirmed in the Claude Code session)', date: '2026-11-06', reference: 'V10.1: Founder & Owner of StageLiora confirmed' },
};

/** QA_FIXTURE swaps in clearly fake approvals to test the gates. The production build script refuses it. */
export const qaFixtureName = process.env.QA_FIXTURE || '';
export const approvals: OwnerApprovals = qaFixtureName ? (qaFixture(qaFixtureName) as OwnerApprovals) : OWNER_APPROVALS;
