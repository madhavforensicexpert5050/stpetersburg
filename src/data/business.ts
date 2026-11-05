/** Owner-supplied business configuration. Single source for every contact detail on the site. */
export const business = {
  brand: 'StageLiora',
  mainDomain: 'stageliora.com',
  host: 'st.petersburg.stageliora.com',
  siteUrl: 'https://st.petersburg.stageliora.com',
  email: 'dev@devendergarg.com',
  emailHref: 'mailto:dev@devendergarg.com',
  phoneDisplay: '+91 88909 29329',
  phoneHref: 'tel:+918890929329',
  targetArea: 'St. Petersburg, Florida',
  /** Launch dependencies. Null means unknown; never substitute a guess. */
  legalEntity: null as string | null,
  postalAddress: null as string | null,
  supportHours: null as string | null,
  turnaround: null as string | null,
} as const;

export const researchDate = 'November 5, 2026';
