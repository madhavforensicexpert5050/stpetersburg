import { approvals } from './approvals.ts';
import { services } from './services.ts';

/** Pricing renders from approved values only. An empty approval list means "quote on request". */
export const pricing = {
  anyApproved: Object.keys(approvals.prices).length > 0,
  rows: services.map((s) => ({ slug: s.slug, name: s.name, track: s.track, price: approvals.prices[s.slug] ?? null })),
  structures: [
    { name: 'Per image', body: 'One price for each finished image, chosen service by service. The clearest fit for a single listing.', state: 'Rates not set' },
    { name: 'By quantity', body: 'A lower rate as the number of images in one request grows. The tiers have not been decided.', state: 'Not decided' },
    { name: 'Bundles', body: 'Prepaid images for agents who list regularly. Any bundle needs clear terms on expiry and refunds first.', state: 'Not decided' },
    { name: 'Teams', body: 'One arrangement for a team or brokerage. This appears only if there is a real team workflow behind it.', state: 'Not decided' },
  ],
  factors: [
    { h: 'What the room needs', b: 'An empty room needs furniture added. An occupied room needs belongings removed first, which is more work.' },
    { h: 'How many images', b: 'Tell us how many photos you have. A larger request may be quoted differently from a single image.' },
    { h: 'The service', b: 'Adding furniture, correcting exposure and creating a twilight look are different jobs, and each is quoted on its own.' },
    { h: 'The photo itself', b: 'A level, well-lit photo with visible floor is easier to work from than a dark or tilted one.' },
    { h: 'Where it will be used', b: 'Your MLS decides what is allowed in a listing photo. We check this first, since some requests should not go ahead at all.' },
    { h: 'What we need from you', b: 'The service you want, the number of photos, the property location and your MLS. Photos are not needed for a first quote.' },
  ],
  faqs: [
    { q: 'Why is there no price list?', a: 'StageLiora\'s prices have not been finalized. Rather than publish figures that might change, this page asks you to request a quote. Published prices will appear here once approved.' },
    { q: 'What decides the quote?', a: 'The service, the number of images, and what the photos need. Rooms with a lot to remove take more work than empty rooms.' },
    { q: 'Do you offer discounts or a free sample?', a: 'None are on offer. If that changes, the terms will be stated here.' },
    { q: 'How do I pay?', a: 'Your quote will explain how to pay. There is no online checkout. Please do not send card details by email or through the quote form.' },
  ],
};

export const generalFaqs = [
  { group: 'The basics', items: [
    { q: 'What is virtual staging?', a: 'Adding furniture and decor to a photo of a room using image editing. The room itself is not changed. Our guide explains it in more detail.' },
    { q: 'Who is StageLiora for?', a: 'Real estate agents, photographers, brokerages and other people who market property.' },
    { q: 'Do you have an office in St. Petersburg?', a: 'No. StageLiora works remotely and has no public office or storefront in Florida. St. Petersburg is the market this site is written for.' },
    { q: 'Can I see your finished work?', a: 'Not yet. The images on this site are placeholder drawings. Real examples will be added only when the photos are properly licensed, and they will be labeled.' },
  ] },
  { group: 'MLS and disclosure', items: [
    { q: 'Will an edited photo be compliant with my MLS?', a: 'We cannot promise that. Rules differ by MLS and change over time, and the agent and broker remain responsible for the listing. We explain the rules we have read and point you to the source.' },
    { q: 'What does Stellar MLS ask for?', a: 'For virtually staged photos, Article 04.04 requires "Virtually staged" in the photo description, the virtually staged field checked, and public remarks beginning "One or more photo(s) was virtually staged."' },
    { q: 'Can the words "virtually staged" go on the image itself?', a: 'Not in Stellar MLS. Article 04.04 strictly prohibits words and branding on property photographs submitted to the service. Use the fields instead.' },
    { q: 'Which edits are not allowed in Stellar listing photos?', a: 'Among others: exterior staging beyond unattached furniture or decor, changing permanent fixtures, adding views or lighting that could not exist, hiding defects, distorting room size, changing paint colors and adding landscape plantings.' },
  ] },
  { group: 'Working with us', items: [
    { q: 'How long does an order take?', a: 'A turnaround time has not been set. Your quote will tell you what to expect for your specific request.' },
    { q: 'What file types should I send?', a: 'Keep your original files and send them unfiltered. Upload is not active yet, so please do not send photos until your quote confirms how to share them.' },
    { q: 'Whose photos can I send?', a: 'Only photos you own or are licensed to have edited. A photographer may hold the copyright in listing photos, so check your agreement first.' },
    { q: 'What about revisions and refunds?', a: 'These terms have not been finalized. They will be published in the Refund and Revision Policy, and confirmed in writing before any work starts.' },
  ] },
];

export const audiences = {
  agents: {
    eyebrow: 'For real estate agents', h1: 'Vacant listing, sitting too long? Start with the photos.',
    intro: 'Most people meet your listing as a stack of photos on a phone. An empty room gives them very little to go on. Staging the right rooms can help them read scale and use, without pretending the house is something it is not.',
    pairKey: 'showcase-bedroom',
    needs: [
      { h: 'Decide which rooms to stage', b: 'You rarely need every room. Start with the living area, the primary bedroom and any room whose use is unclear, like a bonus room or an odd alcove.' },
      { h: 'Keep the record straight', b: 'Hold on to the original of every edited photo. In Stellar MLS you complete the disclosure in the fields, because words on the photo itself are not allowed.' },
      { h: 'Set expectations before the showing', b: 'Buyers will walk into an empty room. A clear label and an original in the listing materials help avoid an awkward moment at the door.' },
    ],
    checklist: ['Original files saved and backed up', 'Permission to edit the photos, if a photographer took them', 'Photo description reads "Virtually staged"', 'Virtually staged field is checked', 'Public remarks begin with the required sentence', 'No defects, fixtures, views or room sizes altered'],
  },
  photographers: {
    eyebrow: 'For real estate photographers', h1: 'Add staging to a shoot without adding it to your day.',
    intro: 'Agents ask their photographer about staging because you are the person holding the files. This page describes how a partner workflow could work. No partner or white-label program is in place today.',
    pairKey: 'svc-photo-enhancement',
    needs: [
      { h: 'Start from a clean file', b: 'Staging starts better from a level, well-exposed room with visible floor. Small changes on site can save a lot of editing later.' },
      { h: 'Be clear about rights', b: 'If you hold the copyright, you decide who edits your photos and how the agent may use the results. Put that in your agreement.' },
      { h: 'Twilight needs facts', b: 'Stellar conditions twilight images on real lights and a true sun position. Record the direction the home faces and which lights work while you are there.' },
    ],
    checklist: ['License allows edits by a third party', 'Compass direction recorded for exteriors', 'Working exterior lights noted', 'Unedited originals archived', 'Agent knows disclosure is handled in MLS fields'],
  },
  brokerages: {
    eyebrow: 'For brokerages', h1: 'One clear standard for altered photos across your office.',
    intro: 'A broker carries responsibility for what agents advertise. A written standard on edited photos is useful whichever vendor your agents use. No team plan or brokerage account is available from StageLiora today.',
    pairKey: 'showcase-dining',
    needs: [
      { h: 'Write down what is off limits', b: 'Agents move fast. A one-page list of what can and cannot be altered is easier to follow than a long policy, and Stellar\'s own lists are a good start.' },
      { h: 'Train on the disclosure steps', b: 'The Stellar disclosure has three parts. Missing one can mean the photos are removed and an automatic fine.' },
      { h: 'Keep the originals', b: 'If a question comes up later, the unaltered original is what shows what was changed. Decide where those files should live.' },
    ],
    checklist: ['Written photo-editing standard', 'Agents shown the Stellar disclosure steps', 'Rights check on photographer files', 'Retention rule for original photos', 'Named person for compliance questions'],
  },
};

/** Original copy for the four design-style pages. */
export const stylePages: Record<string, { h1: string; intro: string; bestFor: string[]; pieces: string[]; watch: string; title: string; description: string }> = {
  modern: {
    title: 'Modern Virtual Staging Style | StageLiora', description: 'What modern staging looks like in a listing photo, which homes suit it, and what to watch for. Original style notes with placeholder room examples.',
    h1: 'Modern: fewer pieces, stronger lines', intro: 'Modern staging relies on low furniture, plain surfaces and a limited palette. It leaves wall and floor visible, which can help a compact room feel uncluttered.',
    bestFor: ['Newer condos and downtown towers', 'Mid-century homes with clean rooflines', 'Rooms with strong windows or a good view that is really there'],
    pieces: ['Low sofa with a slim frame', 'Black metal or dark wood accents', 'One strong piece of art', 'A single accent color'],
    watch: 'Too little furniture can make a room look unfinished, and undersized pieces can misstate its size. Keep the scale true.',
  },
  scandinavian: {
    title: 'Scandinavian Virtual Staging Style | StageLiora', description: 'How Scandinavian staging reads in listing photos: pale wood, soft textiles and daylight. Which rooms suit it, with placeholder room examples.',
    h1: 'Scandinavian: pale wood and borrowed daylight', intro: 'This style uses light woods, soft fabrics and simple forms. It works with the daylight a room already has, which makes it a natural choice for smaller or brighter rooms.',
    bestFor: ['Bungalows with original windows', 'Small bedrooms and home offices', 'Rooms that already get good natural light'],
    pieces: ['Rounded, light-legged seating', 'Pale oak tables and shelving', 'Wool rugs in quiet tones', 'A plant or two'],
    watch: 'In a dark room the pale palette can look washed out. Correct the exposure first, and keep the color truthful.',
  },
  farmhouse: {
    title: 'Farmhouse Virtual Staging Style | StageLiora', description: 'Farmhouse staging in listing photos: painted wood, sturdy shapes and warm texture. Which homes it suits and where it can feel out of place.',
    h1: 'Farmhouse: sturdy, warm and easy to live in', intro: 'Farmhouse staging uses substantial shapes, natural textures and a little wear in the finishes. It suggests family life, and tends to suit homes with some traditional character.',
    bestFor: ['Older homes with porches and wood details', 'Larger kitchens and dining rooms', 'Single-family homes in established neighborhoods'],
    pieces: ['Slipcovered seating', 'A long wood dining table', 'Iron lighting and hardware', 'Woven baskets and greenery'],
    watch: 'This style can look out of place in a sleek high-rise. Match it to the architecture that is really in the photo.',
  },
  contemporary: {
    title: 'Contemporary Virtual Staging Style | StageLiora', description: 'Contemporary staging in listing photos: current shapes, curves and layered neutrals. Which homes it suits, and how it differs from modern staging.',
    h1: 'Contemporary: what feels current right now', intro: 'Modern refers to a fixed design era. Contemporary simply means what feels current, so its shapes keep changing. Today that often means soft curves, layered neutrals and mixed metals.',
    bestFor: ['Recently renovated homes', 'Open-plan living and dining rooms', 'Homes where buyers expect a finished, current look'],
    pieces: ['Curved sofas and rounded tables', 'Textured neutral fabrics', 'Brushed brass or smoked glass', 'Layered rugs and lighting'],
    watch: 'Trends date quickly. If a look feels too specific, it may distract from the home. Keep the attention on the room.',
  },
};

export const interiorDesign = {
  title: 'Online Interior Design (Not Yet Offered) | StageLiora',
  description: 'Draft page describing what an online interior design service could include. StageLiora does not currently offer interior design or employ designers.',
  deliverables: [
    { h: 'Design brief', b: 'A record of your room, budget, style and how you want to use the space.' },
    { h: 'Concept direction', b: 'One or more ideas for layout, color and materials.' },
    { h: '3D room plan', b: 'A visual of the planned room, based on measurements you provide.' },
    { h: 'Shopping list', b: 'Suggested pieces with links, so you can buy what you choose.' },
  ],
};

export const process = [
  { n: '01', h: 'Tell us about the listing', b: 'Choose a service, describe the rooms and say where the images will be used. The MLS matters, because the rules differ.' },
  { n: '02', h: 'Get a quote', b: 'We reply with what can be done, what cannot, the price and the timing for your request. Nothing starts until you agree.' },
  { n: '03', h: 'Share your photos', b: 'Send only photos you have the right to edit. Secure upload is not active yet, so your quote will explain how to share them.' },
  { n: '04', h: 'Review the result', b: 'You check each edited image against its original before using it, and ask for any changes under the agreed terms.' },
  { n: '05', h: 'Disclose and publish', b: 'You keep the original and complete whatever disclosure your MLS requires. In Stellar MLS that happens in the listing fields, not on the image.' },
];
