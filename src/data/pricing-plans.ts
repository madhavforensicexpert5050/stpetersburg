/**
 * The four pricing cards on /pricing/. Single source for plan names, copy, features and CTAs.
 *
 * Amounts are NEVER written here. They come only from owner-approved records in
 * approvals.planPricing[planId] (who, when, reference, plus the figures). Until a plan has an
 * approved record, its card explains the pricing model and offers an inquiry, with no dollar figure.
 * Reference-site prices (for example $35, $28, $24.50, $399, $799, 20% or 30%) must not be used
 * unless the owner approves them as StageLiora's own.
 */
import { approvals, type PlanPrice } from './approvals.ts';

export type PlanId = 'pay-as-you-go' | 'essential-bundle' | 'plus-bundle' | 'dedicated-assistance';

export interface Plan {
  planId: PlanId;
  planName: string;
  subtitle: string;
  /** Shown in place of a price until an amount is approved. */
  model: string;
  modelNote: string;
  features: string[];
  ctaLabel: string;
  /** 'contact' = the published Contact page; 'tel' = the business phone. */
  ctaDestination: 'contact' | 'tel';
  variant: 'standard' | 'assist';
}

export const plans: Plan[] = [
  {
    planId: 'pay-as-you-go', planName: 'Pay As You Go', subtitle: 'Flexible pricing for individual images.',
    model: 'Priced per photo', modelNote: 'No prepayment',
    features: ['Each image priced on its own', 'Any service, from staging to twilight', 'Ideal for a single room or a few photos', 'Scope and cost agreed before any work'],
    ctaLabel: 'Ask About This Option', ctaDestination: 'contact', variant: 'standard',
  },
  {
    planId: 'essential-bundle', planName: 'Essential Bundle', subtitle: 'A bundled option for multiple property images.',
    model: 'One rate per set', modelNote: 'For a full listing',
    features: ['One rate across a set of photos', 'Mix of rooms from the same listing', 'A consistent style across the set', 'Bundle size and terms in writing first'],
    ctaLabel: 'Ask About This Bundle', ctaDestination: 'contact', variant: 'standard',
  },
  {
    planId: 'plus-bundle', planName: 'Plus Bundle', subtitle: 'An option designed for larger photo requirements.',
    model: 'Larger-set rate', modelNote: 'For larger photo sets',
    features: ['For larger sets or several listings', 'One design direction across the set', 'Unused-image terms agreed in advance', 'Terms in writing before any payment'],
    ctaLabel: 'Discuss the Plus Bundle', ctaDestination: 'contact', variant: 'standard',
  },
  {
    planId: 'dedicated-assistance', planName: 'Dedicated Assistance', subtitle: 'Discuss the visual approach for your property.',
    model: 'Contact for details', modelNote: 'Talk it through first',
    features: ['Talk through your photos and goals', 'Find the right edit for each room', 'Clarify the scope before you decide', 'Ask about preparing your photos'],
    ctaLabel: 'Call StageLiora', ctaDestination: 'tel', variant: 'assist',
  },
];

const validRecord = (x?: PlanPrice | null) => Boolean(x && x.by && x.date && x.reference);

/** Approved figures for a plan, or null. Only these may ever be shown as prices. */
export const approvedPrice = (id: PlanId): PlanPrice | null => {
  const rec = approvals.planPricing[id];
  return validRecord(rec) ? rec : null;
};

export const anyPlanPriced = () => plans.some((p) => approvedPrice(p.planId));

/** USD formatting: whole dollars without cents, otherwise two decimals. */
export const usd = (n: number) => (Number.isInteger(n) ? `$${n.toLocaleString('en-US')}` : `$${n.toFixed(2)}`);
