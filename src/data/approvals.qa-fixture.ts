/** FAKE approvals, used only by scripts/qa.mjs to prove the release gates work. Never real decisions. */
const R = { by: 'QA-FIXTURE', date: '2000-01-01', reference: 'Automated gate test. Not an owner decision.' };
const rec = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, R]));
const service = { ...R, performedBy: 'QA', customerFiles: 'QA', output: 'QA', limitations: 'QA', turnaround: 'QA', revisions: 'QA', disclosureRestrictionsReviewed: true };

const core = ['/', '/about/', '/contact/', '/how-it-works/', '/pricing/', '/faq/', '/services/', '/services/virtual-staging/', '/guides/', '/guides/what-is-virtual-staging/', '/guides/virtual-staging-disclosure-florida/', '/for-real-estate-agents/', '/locations/st-petersburg-fl/', '/request-quote/', '/privacy-policy/', '/terms-of-service/'];
const indexed = ['/', '/about/', '/guides/', '/guides/what-is-virtual-staging/', '/guides/virtual-staging-disclosure-florida/', '/locations/st-petersburg-fl/'];

const valid = () => ({
  websiteContent: R, pageDesign: R, publicDeployment: R, searchIndexing: R,
  publication: rec(core), indexing: rec(indexed),
  services: { 'virtual-staging': service }, prices: {},
  legalReview: rec(['privacy-policy', 'terms-of-service']), coverage: rec(['st-petersburg-fl']),
  formDeliveryVerified: null, genuineReviews: null,
});

export function qaFixture(name: string) {
  const v = valid();
  switch (name) {
    case 'valid': return v;
    case 'valid-no-indexing': return { ...v, searchIndexing: null, indexing: {} };
    case 'no-deployment-approval': return { ...v, publicDeployment: null };
    case 'no-content-approval': return { ...v, websiteContent: null };
    case 'no-legal': return { ...v, legalReview: {} };
    case 'unapproved-service': return { ...v, services: {}, publication: { ...v.publication } };
    case 'incomplete-service': return { ...v, services: { 'virtual-staging': { ...service, turnaround: '' } } };
    case 'private-route': return { ...v, publication: { ...v.publication, '/order/': R } };
    case 'index-unpublished': return { ...v, indexing: { ...v.indexing, '/faq/': R, '/portfolio/': R } };
    case 'index-noindex-route': return { ...v, indexing: { ...v.indexing, '/request-quote/': R } };
    case 'no-coverage': return { ...v, coverage: {} };
    case 'placeholder-portfolio': return { ...v, publication: { ...v.publication, '/portfolio/': R } };
    case 'fake-reviews': return { ...v, publication: { ...v.publication, '/reviews/': R } };
    case 'unknown-route': return { ...v, publication: { ...v.publication, '/does-not-exist/': R } };
    case 'unsigned': return { ...v, publication: { ...v.publication, '/about/': { by: '', date: '', reference: '' } } };
    case 'unverified-form-endpoint': return v;
    default: throw new Error(`Unknown QA fixture: ${name}`);
  }
}
