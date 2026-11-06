/**
 * StageLiora pricing: the single source of truth for the four cards on /pricing/ and any price
 * mentioned elsewhere on the site.
 *
 * Two layers, never mixed:
 *  1. PROPOSALS (below): the owner's V12 pricing notes. Kept for calculation, review and tests.
 *     They are NEVER rendered to visitors.
 *  2. APPROVALS (approvals.planPricing in approvals.ts): owner records with who, when and a reference.
 *     Only these figures can appear on the public site.
 *
 * Money is held in integer cents, so 20.00 x 0.90 is exactly 18.00. Unknown values are null, never 0.
 * The $20 base rate is an internal calculation reference, not a previous or regular selling price,
 * so it is never shown as a crossed-out price or a "Save X%" claim.
 */
import { approvals, type PlanPrice, type ApprovalRecord } from './approvals.ts';

export type PlanId = 'pay-as-you-go' | 'essential-bundle' | 'plus-bundle' | 'dedicated-assistance';
export type Cents = number;

// ---------------------------------------------------------------- money helpers
/** Rate after a whole-number percentage discount, in integer cents. */
export const discounted = (baseCents: Cents, discountPercent: number): Cents => {
  if (!Number.isInteger(baseCents) || !Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 100) throw new Error('Invalid price input');
  return Math.round((baseCents * (100 - discountPercent)) / 100);
};
/** Bundle total, only from an approved quantity and an approved rate. */
export const bundleTotal = (quantity: number | null, rateCents: Cents | null): Cents | null =>
  quantity == null || rateCents == null || !Number.isInteger(quantity) || quantity <= 0 ? null : quantity * rateCents;
/** USD display: "$18", "$3,000", "$14.50". */
export const usd = (cents: Cents) => {
  if (!Number.isInteger(cents) || cents < 0) throw new Error('Invalid cents');
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars.toLocaleString('en-US')}` : `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ---------------------------------------------------------------- terms model
export interface PlanTerms {
  planId: PlanId;
  title: string;
  baseRate: Cents | null;
  discountPercentage: number | null;
  calculatedRate: Cents | null;
  currency: 'USD';
  pricingUnit: 'photo' | 'year' | null;
  bundleQuantity: number | null;
  bundlePrepayment: Cents | null;
  annualFee: Cents | null;
  includedCredits: Cents | null;
  creditRedemptionRules: string | null;
  minimumOrder: number | null;
  expiryTerms: string | null;
  revisionTerms: string | null;
  eligibleServices: string[] | null;
  isApproved: boolean;
  approvalEvidence: string | null;
  ctaType: 'contact' | 'tel';
  ctaDestination: string;
}

/** Owner's V12 proposal (handwritten pricing notes). PROPOSED, not approved. Never rendered. */
const BASE: Cents = 2000;
const proposal = (planId: PlanId, title: string, p: Partial<PlanTerms>): PlanTerms => ({
  planId, title, baseRate: null, discountPercentage: null, calculatedRate: null, currency: 'USD', pricingUnit: null,
  bundleQuantity: null, bundlePrepayment: null, annualFee: null, includedCredits: null, creditRedemptionRules: null,
  minimumOrder: null, expiryTerms: null, revisionTerms: null, eligibleServices: null,
  isApproved: false, approvalEvidence: 'Owner V12 handwritten pricing notes (proposal only)',
  ctaType: 'contact', ctaDestination: '/contact/', ...p,
});
export const proposals: Record<PlanId, PlanTerms> = {
  'pay-as-you-go': proposal('pay-as-you-go', 'Pay As You Go', { baseRate: BASE, discountPercentage: 10, calculatedRate: discounted(BASE, 10), pricingUnit: 'photo' }),
  'essential-bundle': proposal('essential-bundle', 'Essential Bundle', { baseRate: BASE, discountPercentage: 20, calculatedRate: discounted(BASE, 20), pricingUnit: 'photo' }),
  'plus-bundle': proposal('plus-bundle', 'Plus Bundle', { baseRate: BASE, discountPercentage: 30, calculatedRate: discounted(BASE, 30), pricingUnit: 'photo' }),
  // Credits ($3,000?), a $12 rate and an assigned person appear in the notes but are ambiguous: not recorded as terms.
  'dedicated-assistance': proposal('dedicated-assistance', 'Dedicated Assistance', { annualFee: 300000, pricingUnit: 'year', ctaType: 'tel', ctaDestination: 'tel:+918890929329' }),
};

// ---------------------------------------------------------------- public cards
export interface Plan {
  planId: PlanId;
  planName: string;
  subtitle: string;
  /** Shown in place of a price until an amount is approved. */
  model: string;
  modelNote: string;
  features: string[];
  /** Comparison table cells (customer-facing wording; unknown terms say so plainly). */
  compare: { unit: string; use: string };
  ctaLabel: string;
  ctaDestination: 'contact' | 'tel';
  variant: 'standard' | 'assist';
}

export const plans: Plan[] = [
  {
    planId: 'pay-as-you-go', planName: 'Pay As You Go', subtitle: 'A flexible option for individual virtual staging images.',
    model: 'Priced per photo', modelNote: 'Pay for the images you need',
    features: ['Each image priced on its own', 'Suits a single room or a few photos', 'Any service, from staging to twilight', 'Scope and cost agreed before any work'],
    compare: { unit: 'Per photo', use: 'A few images at a time' },
    ctaLabel: 'Ask About This Option', ctaDestination: 'contact', variant: 'standard',
  },
  {
    planId: 'essential-bundle', planName: 'Essential Bundle', subtitle: 'A bundled option for multiple property images.',
    model: 'One rate per set', modelNote: 'For a full listing',
    features: ['One per-photo rate across a set', 'Mix of rooms from one listing', 'A consistent style across the set', 'Bundle size and terms in writing first'],
    compare: { unit: 'Per photo, in a set', use: 'A full listing' },
    ctaLabel: 'Ask About This Bundle', ctaDestination: 'contact', variant: 'standard',
  },
  {
    planId: 'plus-bundle', planName: 'Plus Bundle', subtitle: 'A lower per-image rate for larger photo requirements.',
    model: 'Larger-set rate', modelNote: 'For larger photo sets',
    features: ['For larger sets or several listings', 'One design direction across the set', 'Defined bundle terms, agreed in advance', 'Terms in writing before any payment'],
    compare: { unit: 'Per photo, in a larger set', use: 'Several listings or a large set' },
    ctaLabel: 'Discuss the Plus Bundle', ctaDestination: 'contact', variant: 'standard',
  },
  {
    planId: 'dedicated-assistance', planName: 'Dedicated Assistance', subtitle: 'A personalized option for discussing ongoing property-image requirements.',
    model: 'Contact for details', modelNote: 'Talk it through first',
    features: ['Discuss ongoing image requirements', 'Clarify project scope', 'Explore suitable editing services', 'Direct contact with StageLiora'],
    compare: { unit: 'Discussed directly', use: 'Ongoing requirements' },
    ctaLabel: 'Call StageLiora', ctaDestination: 'tel', variant: 'assist',
  },
];

// ---------------------------------------------------------------- approved figures only
const validRecord = (x?: PlanPrice | ApprovalRecord | null) => Boolean(x && x.by && x.date && x.reference);

/** Approved figures for a plan, or null. Only these may ever be shown as prices. */
export const approvedPrice = (id: PlanId): PlanPrice | null => {
  const rec = approvals.planPricing[id];
  return validRecord(rec) ? rec : null;
};
export const anyPlanPriced = () => plans.some((p) => approvedPrice(p.planId));

/** Headline figure for a card, e.g. "$18" + "/ photo", or null when nothing is approved. */
export const headline = (id: PlanId): { amount: string; unit: string } | null => {
  const a = approvedPrice(id);
  if (!a) return null;
  if (a.pricePerPhotoCents != null) return { amount: usd(a.pricePerPhotoCents), unit: '/ photo' };
  if (a.annualFeeCents != null) return { amount: usd(a.annualFeeCents), unit: '/ year' };
  return null;
};

/** Short sentence for FAQs and other pages, e.g. "$18 per photo", or null. */
export const rateText = (id: PlanId): string | null => {
  const a = approvedPrice(id);
  if (a?.pricePerPhotoCents != null) return `${usd(a.pricePerPhotoCents)} per photo`;
  if (a?.annualFeeCents != null) return `${usd(a.annualFeeCents)} per year`;
  return null;
};

/** Comparison cells for terms that need their own approval. */
export const approvedTerm = (id: PlanId, key: 'prepay' | 'minimum' | 'credits'): string | null => {
  const a = approvedPrice(id);
  if (!a) return null;
  if (key === 'prepay' && a.prepaidCents != null) return usd(a.prepaidCents);
  if (key === 'minimum' && a.minimumPhotos != null) return `${a.minimumPhotos} photos`;
  if (key === 'credits' && a.includedCreditsCents != null) return usd(a.includedCreditsCents);
  return null;
};

// ---------------------------------------------------------------- card labels (V13)
/**
 * Whole-number saving of a bundle rate against the Pay As You Go rate, rounded DOWN so it is never
 * overstated: (1800 - 1600) / 1800 = 11.11% -> 11; (1800 - 1400) / 1800 = 22.22% -> 22.
 */
export const savingsPercent = (rateCents: Cents, referenceCents: Cents): number | null => {
  if (!Number.isInteger(rateCents) || !Number.isInteger(referenceCents) || referenceCents <= 0 || rateCents <= 0 || rateCents >= referenceCents) return null;
  return Math.floor(((referenceCents - rateCents) * 100) / referenceCents);
};

export interface PlanBadge { text: string; tone: 'neutral' | 'save'; /** Extra words for screen readers, or null. */ srText: string | null }

/** True only when the owner has approved bundle savings claims AND the Pay As You Go reference price. */
export const bundleSavingsApproved = () => validRecord(approvals.pricingClaims?.bundleSavings) && approvedPrice('pay-as-you-go')?.pricePerPhotoCents != null;

/** The label above each card heading. Savings badges appear only behind approvals.pricingClaims.bundleSavings. */
export const planBadge = (id: PlanId): PlanBadge | null => {
  const rate = approvedPrice(id);
  if (!rate) return null;
  if (id === 'dedicated-assistance') return rate.annualFeeCents != null ? { text: 'Annual Plan', tone: 'neutral', srText: null } : null;
  if (id === 'pay-as-you-go') return { text: validRecord(approvals.pricingClaims?.noBundleRequired) ? 'No Bundle Required' : 'Flexible Per-Photo Pricing', tone: 'neutral', srText: null };
  const ref = approvedPrice('pay-as-you-go')?.pricePerPhotoCents;
  if (bundleSavingsApproved() && rate.pricePerPhotoCents != null && ref != null) {
    const pct = savingsPercent(rate.pricePerPhotoCents, ref);
    if (pct) return { text: `Save ${pct}%`, tone: 'save', srText: `compared with the ${usd(ref)} Pay As You Go rate` };
  }
  const perPhoto = plans.map((p) => approvedPrice(p.planId)?.pricePerPhotoCents).filter((c): c is number => c != null);
  const lowest = rate.pricePerPhotoCents != null && perPhoto.length > 0 && rate.pricePerPhotoCents === Math.min(...perPhoto);
  return { text: lowest ? 'Lowest Per-Photo Rate' : 'Bundle Rate', tone: 'neutral', srText: null };
};

/** One comparison note under the grid, shown only while savings badges are published. */
export const savingsDisclosure = (): string | null => {
  const ref = approvedPrice('pay-as-you-go')?.pricePerPhotoCents;
  return bundleSavingsApproved() && ref != null ? `Bundle savings are compared with StageLiora's ${usd(ref)} Pay As You Go rate. Bundle eligibility and terms apply.` : null;
};
