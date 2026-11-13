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
  /** Point 1 (Business Identity & Address Optimization), owner-approved. StageLiora stays the primary brand. */
  owner: 'Devender Garg',
  /** Where the business is run from. Stated on About, Contact and the legal drafts only, not on every marketing page. */
  operatingCountry: 'India',
  /** Footer tagline (owner-approved wording; no "Remote"). */
  tagline: 'Virtual Staging for Real Estate Listings in St. Petersburg, FL',
  /** Footer About text below the logo (owner-supplied wording, 2026-11-13; used exactly as given). */
  footerAbout: 'StageLiora helps real estate professionals in St. Petersburg, Florida, present properties through thoughtful virtual staging and image visualization. Led by Devender Garg, our remote service focuses on realistic presentation, preserving property details, and clear project communication. We help agents explore visual possibilities while respecting original photos and listing requirements.',
  /** Launch dependencies. Null means unknown; never substitute a guess. */
  /** Point 1 owner decision (2026-11-13): the unverified V27 "doing business as" statement was removed.
   *  The legal form of the business and any business-name registration stay pending verification (legal drafts). */
  ownershipStatement: 'StageLiora is owned and operated by Devender Garg.',
  /** Owner-confirmed business model (2026-11-13). No registration is claimed. */
  businessType: 'Sole proprietorship',
  /** Point 1 owner decision (2026-11-13): service-area structured data is approved on Service schema ONLY.
   *  Never on Organization, never LocalBusiness, PostalAddress, geo or opening hours (qa.mjs enforces). */
  serviceArea: { '@type': 'City', name: 'St. Petersburg', containedInPlace: { '@type': 'State', name: 'Florida', containedInPlace: { '@type': 'Country', name: 'United States' } } },
  /** Point 1: the former V27 Florida mailing address was withdrawn and must not be published anywhere.
   *  No replacement is known. Never substitute a guessed or invented address; the legal drafts flag it for legal review. */
  postalAddress: null as string | null,
  supportHours: null as string | null,
  turnaround: null as string | null,
} as const;

export const researchDate = 'November 5, 2026';
