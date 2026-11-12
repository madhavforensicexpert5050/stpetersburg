/** Owner-supplied business configuration. Single source for every contact detail on the site. */
export const business = {
  brand: 'StageLiora',
  mainDomain: 'stageliora.com',
  /** V25: the owner approved stpetersburg.pages.dev as the temporary production host (2026-11-12).
   *  stageliora.com is not registered. When a custom domain is approved, change these two lines only. */
  host: 'stpetersburg.pages.dev',
  siteUrl: 'https://stpetersburg.pages.dev',
  email: 'dev@devendergarg.com',
  emailHref: 'mailto:dev@devendergarg.com',
  phoneDisplay: '+91 88909 29329',
  phoneHref: 'tel:+918890929329',
  targetArea: 'St. Petersburg, Florida',
  /** Launch dependencies. Null means unknown; never substitute a guess. */
  /** V27 owner statement. Florida fictitious-name (DBA) registration NOT verified (Sunbiz blocks automated search). */
  legalEntity: 'Devender Garg, doing business as StageLiora' as string | null,
  /** V27 owner-supplied MAILING address. Not an office, storefront or place to visit. Shown on the legal pages only. */
  postalAddress: '4110 32nd St N, St. Petersburg, FL 33714, USA' as string | null,
  supportHours: null as string | null,
  turnaround: null as string | null,
} as const;

export const researchDate = 'November 5, 2026';
