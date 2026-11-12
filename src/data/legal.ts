/** Legal drafts. Not lawyer-reviewed. Bracketed items are launch dependencies recorded in the approval register. */
import type { Block } from './guides.ts';
import { business } from './business.ts';
import { qaFixtureName } from './approvals.ts';

export interface LegalDoc { slug: string; path: string; title: string; h1: string; description: string; body: Block[] }

const ENTITY = '[Legal entity name: pending from owner]';
const ADDRESS = '[Business postal address: pending from owner]';

const drafts: LegalDoc[] = [
  {
    slug: 'privacy-policy', path: '/privacy-policy/', title: 'Privacy Policy (Draft) | StageLiora', h1: 'Privacy Policy',
    description: 'Draft privacy policy for the StageLiora St. Petersburg website: what the site collects, how quote requests are handled, and what is still to be decided.',
    body: [
      { t: 'p', x: `This policy describes how StageLiora ("we") handles information through ${business.host}. The legal entity responsible for this site is ${ENTITY}, at ${ADDRESS}.` },
      { t: 'h2', x: 'What this website collects today' },
      { t: 'ul', items: ['Information you choose to send us through email, a phone call or the quote form. This can include your name, email address, phone number, company, property location and project details.', 'Technical information your browser normally sends to a web host, such as IP address and pages requested. The site is hosted on Cloudflare Pages. [Log retention period: pending, to be confirmed from the Cloudflare terms for this account.]'] },
      { t: 'p', x: 'While online form delivery is not connected, the quote form does not send information to us. If you use its email option, your own email app creates the message and you decide whether to send it.' },
      { t: 'h2', x: 'What this website does not do' },
      { t: 'ul', items: ['It does not use advertising trackers or analytics in this version. If that changes, this policy will be updated first.', 'It does not take payment information.', 'It does not accept photo uploads in this version.'] },
      { t: 'h2', x: 'How we use information' },
      { t: 'p', x: 'To respond to your request, prepare a quote, and keep a record of our correspondence. We do not sell your information.' },
      { t: 'h2', x: 'Property photos' },
      { t: 'p', x: 'Photos can show personal items, documents or addresses. Please remove these where you can. Secure upload, storage, access controls and the deletion schedule will be described here before upload is enabled. [Retention period: pending, DEC-030.]' },
      { t: 'h2', x: 'Service providers and retention' },
      { t: 'p', x: '[List of email, hosting, form and storage providers: pending.] [How long inquiries are kept: pending.]' },
      { t: 'h2', x: 'Your choices' },
      { t: 'p', x: `You can ask us to access, correct or delete information you have given us by writing to ${business.email}. Depending on where you live, you may have additional rights under law.` },
      { t: 'h2', x: 'Children' },
      { t: 'p', x: 'This site is for business users and is not directed to children.' },
      { t: 'h2', x: 'Contact' },
      { t: 'p', x: `Email ${business.email} or call ${business.phoneDisplay}.` },
    ],
  },
  {
    slug: 'terms-of-service', path: '/terms-of-service/', title: 'Terms of Service (Draft) | StageLiora', h1: 'Terms of Service',
    description: 'Draft terms for using the StageLiora website and requesting image-editing services, including photo rights, MLS responsibility and open items.',
    body: [
      { t: 'p', x: `These draft terms apply to ${business.host}, operated by ${ENTITY}. They will be finalized before any services are sold.` },
      { t: 'h2', x: 'Information on this site' },
      { t: 'p', x: 'The information here is general, and is not legal advice. MLS and legal summaries reflect our reading on the dates shown, and may be out of date. Images marked as placeholders are illustrations, and are not examples of completed work.' },
      { t: 'h2', x: 'Quotes' },
      { t: 'p', x: 'A quote request does not create an order. Work starts only after we have both agreed in writing on scope, price and timing.' },
      { t: 'h2', x: 'Your photos' },
      { t: 'p', x: 'You must own the photos you send us or have permission to have them edited. You remain responsible for that permission. We will ask you to confirm it before work starts.' },
      { t: 'h2', x: 'How edited images may be used' },
      { t: 'p', x: 'You are responsible for how you use any image, including following the rules of your MLS, your broker and applicable law, and making any required disclosure. We do not promise that an image will be accepted by any MLS or will comply with any rule.' },
      { t: 'p', x: 'We may decline any edit that would hide a defect, misrepresent a property or its surroundings, or that we believe would mislead a buyer.' },
      { t: 'h2', x: 'Concept images' },
      { t: 'p', x: 'Concept visualizations show ideas such as a different paint color, floor or planting. They do not show the current condition of a property, and should not be presented as if they do.' },
      { t: 'h2', x: 'No results promised' },
      { t: 'p', x: 'We do not promise any sale, sale price, time on market or number of inquiries.' },
      { t: 'h2', x: 'Items to be completed' },
      { t: 'ul', items: ['[Ownership and license of finished images: pending.]', '[Any right to show your images in our marketing: pending. None is assumed.]', '[Payment terms: pending.]', '[Limitation of liability and governing law: pending attorney review.]'] },
      { t: 'h2', x: 'Contact' },
      { t: 'p', x: `Email ${business.email}.` },
    ],
  },
  {
    slug: 'refund-and-revision-policy', path: '/refund-and-revision-policy/', title: 'Refund and Revision Policy (Draft) | StageLiora', h1: 'Refund and Revision Policy',
    description: 'Draft page for the StageLiora refund and revision policy. Terms are not yet set. Nothing is guaranteed until the owner approves the final policy.',
    body: [
      { t: 'callout', h: 'Terms not yet set', x: 'StageLiora has not finalized its refund and revision terms, and is not currently taking paid orders. This page does not offer any guarantee. Any terms for a specific job will be confirmed in writing with your quote.' },
      { t: 'h2', x: 'What this policy will cover' },
      { t: 'ul', items: ['[Number of revision rounds: pending, DEC-011.]', '[How long you have to request a revision: pending, DEC-011.]', '[What counts as a revision and what counts as new work: pending, DEC-011.]', '[When a refund is available, how to ask for it and how it is paid: pending, DEC-012.]', '[Effect of publishing an image to an MLS or other marketing before raising an issue: pending, DEC-012.]'] },
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
export const legalDocs: LegalDoc[] = drafts.map((d) => ({ ...d, body: d.body.map((b) => ('x' in b ? { ...b, x: fill(b.x) } : b.t === 'ul' || b.t === 'ol' ? { ...b, items: b.items.map(fill) } : b)) as Block[] }));
export const getLegal = (slug: string) => {
  const d = legalDocs.find((x) => x.slug === slug);
  if (!d) throw new Error(`Unknown legal doc: ${slug}`);
  return d;
};
