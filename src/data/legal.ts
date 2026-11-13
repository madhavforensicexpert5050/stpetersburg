/**
 * Legal drafts (V27; Privacy Policy and Terms brought to final-draft form 2026-11-13 with no open brackets). Not lawyer-reviewed and not signed off. Owner decisions L1-L8, L15 and L17 are written in as
 * plain text; everything still unverified or unapproved is a bracketed "pending" item. A bracketed item blocks the
 * production build (build-production.mjs), so these pages cannot go live until each one is resolved and
 * approvals.legalReview holds Devender Garg's actual sign-off.
 */
import type { Block } from './guides.ts';
import { business } from './business.ts';
import { approvals, qaFixtureName } from './approvals.ts';

export interface LegalDoc { slug: string; path: string; title: string; h1: string; description: string; body: Block[] }

/** Point 1 business identity. No street address is published: the former Florida mailing address was withdrawn. */
const IDENTITY: Block = { t: 'ul', items: [
  business.ownershipStatement,
  `Business type: ${business.businessType}`,
  `Operating country: ${business.operatingCountry}`,
  `Email: ${business.email}`,
  `Phone: ${business.phoneDisplay}`,
] };
const DRAFT_NOTE = 'This draft is awaiting review and sign-off by Devender Garg. It is not yet in force.';
/** A policy counts as signed off only with a complete approvals.legalReview record (who, when, reference). Never fabricate one. */
const signedOff = (slug: string) => { const a = approvals.legalReview[slug]; return Boolean(a && a.by && a.date && a.reference); };

const drafts: LegalDoc[] = [
  {
    slug: 'privacy-policy', path: '/privacy-policy/', title: 'Privacy Policy (Draft) | StageLiora', h1: 'Privacy Policy',
    description: 'Draft privacy policy for StageLiora: what the website and a virtual staging project collect, who processes it, how long it is kept and how to ask about it.',
    body: [
      { t: 'callout', h: 'Draft, not yet in force', x: DRAFT_NOTE },
      { t: 'p', x: `This policy explains how StageLiora ("we") handles personal information through ${business.host} and during virtual staging projects.` },
      { t: 'h2', x: 'Who we are' },
      IDENTITY,
      { t: 'p', x: 'StageLiora serves St. Petersburg, Florida, through a fully remote service model. It has no office in Florida.' },
      { t: 'h2', x: 'What we collect' },
      { t: 'ul', items: [
        'Information you choose to send us by email, phone or the quote form: for example your name, email address, phone number, company, property location and project details.',
        'For a project: your property photos, the room types and any preferred staging style. Photos are sent to us by email. This website does not accept uploads.',
        'Technical information your browser sends to the website host, such as IP address, browser type and pages requested. The site is hosted on Cloudflare Pages, which processes these requests and may keep technical logs of them under Cloudflare\'s own privacy policy.',
      ] },
      { t: 'p', x: 'The site does not use analytics or advertising trackers and does not take payments. While online form delivery is not connected, the quote form does not send information to us; if you use its email option, your own email app creates the message and you decide whether to send it.' },
      { t: 'h2', x: 'How we use information' },
      { t: 'p', x: 'To answer your inquiry, prepare a written quotation, carry out and deliver a project you have agreed to, and keep a record of our correspondence. We do not sell personal information, and we do not share it with third parties for their own marketing without your permission.' },
      { t: 'h2', x: 'Who processes it for us' },
      { t: 'ul', items: [
        'Google: our email service, which receives your messages and photos, and Google Drive, where project files are stored.',
        'Cloudflare: hosting for this website.',
        'AI-assisted editing tools used to stage your photos. Photos you send for a project may be processed by the providers of these tools under their own terms.',
      ] },
      { t: 'p', x: 'StageLiora does not build or train its own AI models. We do not sell your photos, and we do not use them for anything other than your project without your written permission.' },
      { t: 'p', x: 'StageLiora is operated from India. Information you send us is accessed and handled in India, and may be stored by our service providers in other countries.' },
      { t: 'h2', x: 'How long we keep it' },
      { t: 'ul', items: [
        'Property photos and project files: deleted within 90 days after the project is delivered, unless we agree a different arrangement with you. Your original photos are kept unaltered and separate from the edited images during that period. This schedule covers our own copies; copies held by an AI editing provider follow that provider\'s terms.',
        'Inquiries and correspondence: kept for up to 24 months and then deleted, unless the law requires a longer period.',
      ] },
      { t: 'h2', x: 'Security' },
      { t: 'p', x: 'Access to customer photos and project files is limited to Devender Garg and anyone he authorizes for a specific project.' },
      { t: 'h2', x: 'Your requests' },
      { t: 'p', x: `You can ask to access, correct or delete personal information you have given us by writing to ${business.email}. We may need to confirm your identity first. We handle each request under the law that applies to you, and some records may need to be kept for legal reasons.` },
      { t: 'h2', x: 'Children' },
      { t: 'p', x: 'This site is for business users and is not directed to children.' },
      { t: 'h2', x: 'Contact' },
      { t: 'p', x: `Email ${business.email} or call ${business.phoneDisplay}.` },
    ],
  },
  {
    slug: 'terms-of-service', path: '/terms-of-service/', title: 'Terms of Service (Draft) | StageLiora', h1: 'Terms of Service',
    description: 'Draft terms for the StageLiora website and virtual staging projects: quotations, photos, editing limits, MLS responsibility, image rights and payment.',
    body: [
      { t: 'callout', h: 'Draft, not yet in force', x: DRAFT_NOTE },
      { t: 'p', x: `These terms apply to ${business.host} and to virtual staging projects provided by StageLiora. Project bookings are not open yet.` },
      { t: 'h2', x: 'Who we are' },
      IDENTITY,
      { t: 'h2', x: 'Information on this site' },
      { t: 'p', x: 'The information here is general, and is not legal advice. MLS and legal summaries reflect our reading on the dates shown, and may be out of date. Example images on this site are AI-created illustrations of fictional rooms, not completed client work.' },
      { t: 'h2', x: 'Written quotations' },
      { t: 'p', x: 'A request does not create an order. Before any work starts, a written quotation sets out the scope, the price, the accepted payment method, the payment due date and any payment conditions, the estimated turnaround, the revision rounds included, the deadline for revision requests and the charge for any additional revisions. Work starts only after we have both agreed to it.' },
      { t: 'h2', x: 'How the work is done' },
      { t: 'p', x: 'Devender Garg handles each project. Images are edited with AI-assisted tools and refined by hand. StageLiora does not claim to own or have developed the AI tools it uses.' },
      { t: 'h2', x: 'Your photos' },
      { t: 'p', x: 'Send high-resolution JPG/JPEG or PNG photos by email, with the room type and any preferred style. You must own the photos or have permission to have them edited, and you remain responsible for that permission. You keep all rights you hold in your original photos.' },
      { t: 'h2', x: 'What you receive' },
      { t: 'p', x: 'Edited images in JPG/JPEG or PNG, as agreed in the quotation, at the original pixel dimensions where that is technically feasible. Your original photos are kept unaltered and separately for the retention period in our Privacy Policy.' },
      { t: 'h2', x: 'Editing limits' },
      { t: 'p', x: 'We will not make an edit that misrepresents a property, including misleading structural changes, hiding existing defects, changing the actual view, misrepresenting permanent fixtures, presenting a virtually staged room as actually furnished, or any other change prohibited by the listing or advertising rules that apply.' },
      { t: 'h2', x: 'MLS rules and disclosure' },
      { t: 'p', x: 'We aim to produce images consistent with Stellar MLS requirements for virtually staged photos. StageLiora is not certified, endorsed or partnered by Stellar MLS, is not a brokerage and does not upload listings. Uploading images and making every required disclosure remain the responsibility of the listing agent or broker. We do not promise that an image will be accepted by any MLS.' },
      { t: 'h2', x: 'Use of edited images' },
      { t: 'p', x: 'After full payment, StageLiora grants you a non-exclusive, perpetual license to use the delivered edited images for the property\'s listings, applicable MLS use and real estate marketing, limited to the rights StageLiora can lawfully grant. Copyright is not transferred unless agreed in writing.' },
      { t: 'p', x: 'We will not publish or reuse your original or edited photos in a portfolio, advertisement, social media or any other marketing without your explicit prior written permission.' },
      { t: 'h2', x: 'Concept images' },
      { t: 'p', x: 'Concept visualizations show ideas such as a different paint color, floor or planting. They do not show the current condition of a property, and should not be presented as if they do.' },
      { t: 'h2', x: 'No results promised' },
      { t: 'p', x: 'We do not promise any sale, sale price, time on market or number of inquiries.' },
      { t: 'h2', x: 'Contact' },
      { t: 'p', x: `Email ${business.email} or call ${business.phoneDisplay}.` },
    ],
  },
  {
    slug: 'refund-and-revision-policy', path: '/refund-and-revision-policy/', title: 'Refund and Revision Policy (Draft) | StageLiora', h1: 'Refund and Revision Policy',
    description: 'Draft page for the StageLiora refund and revision policy. Terms are not yet set. Nothing is guaranteed until the owner approves the final policy.',
    body: [
      { t: 'callout', h: 'Terms not yet set', x: 'StageLiora has not finalized its refund and revision terms, and is not currently taking paid orders. This page does not offer any guarantee. Any terms for a specific job will be confirmed in writing with your quote.' },
      { t: 'h2', x: 'What this policy will cover' },
      { t: 'ul', items: ['Revisions: each written quotation states the revision rounds included, the deadline for revision requests and the charge for any additional revisions.', '[What counts as a revision and what counts as new work: pending, DEC-011.]', '[When a refund is available, how to ask for it and how it is paid: pending, DEC-012.]', '[Effect of publishing an image to an MLS or other marketing before raising an issue: pending, DEC-012.]'] },
      { t: 'h2', x: 'Questions' },
      { t: 'p', x: `Email ${business.email}.` },
    ],
  },
  {
    slug: 'cookie-policy', path: '/cookie-policy/', title: 'Cookie Policy (Draft) | StageLiora', h1: 'Cookie Policy',
    description: 'Draft cookie policy for StageLiora. This version of the website sets no cookies and uses no analytics or advertising trackers. Fonts are self-hosted.',
    body: [
      { t: 'p', x: 'This version of the website does not set cookies, and does not use analytics or advertising trackers. Fonts and images are served from the site itself rather than from third parties.' },
      { t: 'p', x: 'The site is hosted on Cloudflare Pages, which may use its own technical cookies once the site is deployed. This page will be updated before any cookies or analytics are added, including any choices you have about them.' },
      { t: 'h2', x: 'Questions' },
      { t: 'p', x: `Email ${business.email}.` },
    ],
  },
];
/** Gate tests only: fills bracket items so the valid-release path can be exercised. Real values come from the owner. */
const fill = (x: string) => (qaFixtureName ? x.replace(/\[[^\]]+\]/g, 'QA-FIXTURE') : x);
// Once signed off, the draft callout and the "(Draft)" title marker drop out; nothing else changes.
const finalize = (d: LegalDoc): LegalDoc => (signedOff(d.slug) ? { ...d, title: d.title.replace(' (Draft)', ''), description: d.description.replace(/^Draft (\w)/, (_, c: string) => c.toUpperCase()), body: d.body.filter((b) => !(b.t === 'callout' && 'x' in b && b.x === DRAFT_NOTE)) } : d);
export const legalDocs: LegalDoc[] = drafts.map(finalize).map((d) => ({ ...d, body: d.body.map((b) => ('x' in b ? { ...b, x: fill(b.x) } : b.t === 'ul' || b.t === 'ol' ? { ...b, items: b.items.map(fill) } : b)) as Block[] }));
export const getLegal = (slug: string) => {
  const d = legalDocs.find((x) => x.slug === slug);
  if (!d) throw new Error(`Unknown legal doc: ${slug}`);
  return d;
};
