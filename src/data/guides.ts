import { anyPlanPriced } from './pricing-plans.ts';
/** Original guides. Body blocks are rendered by GuideBody. Links use root-relative paths and are filtered in production builds. */
export type Block =
  | { t: 'p'; x: string }
  | { t: 'h2'; x: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'callout'; h: string; x: string }
  | { t: 'table'; head: string[]; rows: string[][]; caption: string }
  | { t: 'compare'; pair: string }
  | { t: 'links'; h: string; items: { href: string; label: string }[] };

/**
 * Featured image on the Guides hub card and in Article schema. Defaults to the guide's hero pair shown half before,
 * half after. 'before' shows only the original frame, for guides about the source photo rather than the edit.
 */
export interface Featured { pair: string; show: 'split' | 'before' }

export interface Guide { slug: string; path: string; title: string; h1: string; description: string; summary: string; reading: string; updated: string; heroPair?: string; featured?: Featured; sources: { name: string; url: string }[]; body: Block[]; faqs?: { q: string; a: string }[] }

const UPDATED = '2026-11-05';
const STELLAR = { name: 'Stellar MLS Article 04.04: Virtually Staged Photos (last updated Sep 27, 2026)', url: 'https://rules.stellarmls.com/article/article-0404-virtually-staged-photos' };
const STELLAR_PR = { name: 'Stellar MLS Listing Photo Rules and Tips', url: 'https://www.stellarmls.com/photorules' };
const NAR = { name: 'NAR, 2025 Profile of Home Staging', url: 'https://www.nar.realtor/newsroom/nar-report-reveals-home-staging-boosts-sale-prices-and-reduces-time-on-market' };

export const guides: Guide[] = [
  {
    slug: 'what-is-virtual-staging', path: '/guides/what-is-virtual-staging/', heroPair: 'svc-virtual-staging', reading: '5 min', updated: UPDATED, sources: [STELLAR, NAR],
    title: 'What Is Virtual Staging? A Plain-English Guide | StageLiora', h1: 'What is virtual staging?',
    description: 'Virtual staging adds furniture and decor to a photo of a room. How it works, when it helps, what it should never change, and how to disclose it.',
    summary: 'Virtual staging adds furniture and decor to a photo of a room without changing the room itself.',
    body: [
      { t: 'p', x: 'Virtual staging means adding furniture, rugs, art and decor to a photograph of a room using image editing or software. Nothing is carried into the house. The room in the photo keeps its real walls, floors, windows and fixtures, and only the movable items are new.' },
      { t: 'compare', pair: 'svc-virtual-staging' },
      { t: 'h2', x: 'Why agents use it' },
      { t: 'p', x: 'An empty room can be hard to read in a photo. It is difficult to judge whether a bed will fit, or what an unusual alcove is for. Furniture gives buyers a reference for scale and a suggestion of use.' },
      { t: 'p', x: 'In the National Association of Realtors 2025 Profile of Home Staging, 83% of buyers\' agents said staging made it easier for buyers to picture a home as their future home. That is an opinion survey of agents about staging in general, with a low response rate. It is not a measured result for virtual staging, so treat it as background and not as a promise.' },
      { t: 'h2', x: 'What it should not do' },
      { t: 'p', x: 'The line is simple: staging can change what moves out with the seller, and it should not change what stays with the house.' },
      { t: 'ul', items: ['Do not cover up holes, stains, damaged floors or exposed wiring.', 'Do not add, remove or change permanent fixtures.', 'Do not add a view or lighting that could not exist at the property.', 'Do not use undersized furniture to make a room look larger.'] },
      { t: 'p', x: 'Each of those appears as a prohibited use in Stellar MLS Article 04.04, the rule that applies to listings in Stellar MLS. Other MLSs have their own versions, so check yours.' },
      { t: 'h2', x: 'Which rooms are worth staging' },
      { t: 'p', x: 'Most listings do not need every room done. Start with the rooms buyers look for first, usually the main living area and the primary bedroom, along with any room whose purpose is not obvious. Our guide to preparing photos covers what makes a photo suitable.' },
      { t: 'h2', x: 'Disclosure' },
      { t: 'p', x: 'Buyers who visit will find an empty room, so be upfront about the edit. Rules differ by MLS and by state. In Stellar MLS, disclosure happens in the listing fields. Our Florida disclosure guide sets out the steps.' },
      { t: 'links', h: 'Next steps', items: [{ href: '/guides/how-to-prepare-photos-for-virtual-staging/', label: 'How to prepare photos' }, { href: '/guides/virtual-staging-disclosure-florida/', label: 'Virtual staging disclosure in Florida' }, { href: '/guides/virtual-staging-vs-traditional-staging/', label: 'Virtual or traditional staging?' }] },
    ],
  },
  {
    slug: 'virtual-staging-cost', path: '/guides/virtual-staging-cost/', heroPair: 'svc-furniture-removal', reading: '5 min', updated: UPDATED, sources: [NAR],
    title: 'How Much Does Virtual Staging Cost? | StageLiora', h1: 'How much does virtual staging cost?',
    description: 'A look at the price ranges in the virtual staging market, what drives them, and what to compare beyond the price per photo.',
    summary: 'Market prices range from under a dollar per image for AI tools to about $60 for some human services.',
    body: [
      { t: 'p', x: 'Prices vary widely, mostly because very different products share the same name. Here is what our November 2026 review of published vendor pages found. These are other companies\' figures and they change often. They are not StageLiora prices.' },
      { t: 'table', caption: 'Published per-image price ranges, reviewed November 2026', head: ['Type of service', 'Typical published range', 'What you are buying'], rows: [
        ['AI software tools', 'About $0.20 to $10.50', 'Automated output in seconds or minutes. You choose and check the result.'],
        ['Human or designer services', 'About $16 to $60', 'A person places or finishes the furniture, usually over hours or days.'],
      ] },
      { t: 'p', x: 'For comparison, the National Association of Realtors 2025 Profile of Home Staging reports a median of $1,500 for physical staging. Physical staging is a different service with different benefits, including how a home feels at a showing, so the two figures are not like for like.' },
      { t: 'h2', x: 'What moves the price' },
      { t: 'ul', items: ['Whether a person is involved in the result, and how much', 'How much has to come out of the room first', 'Quantity, bundles and subscriptions', 'Revision limits and how long you have to ask for changes', 'How quickly you need the images back'] },
      { t: 'h2', x: 'What to compare besides the price' },
      { t: 'ol', items: ['Do you get the unaltered original back as well as the edited image?', 'What does the revision policy cover, and when does it end?', 'Are there extra charges for removal, rush handling or more styles?', 'Does the vendor understand your MLS, or does it just say "compliant"?', 'Who owns the result, and may the vendor use your photos in its own marketing?'] },
      { t: 'callout', h: 'A price is only useful if the image can be used', x: 'A cheap edit that adds a fixture, hides a defect or puts words on a Stellar listing photo can cost more than it saved. Stellar\'s penalty for non-compliant virtually staged photos is removal plus an automatic fine.' },
      { t: 'h2', x: 'StageLiora pricing' },
      { t: 'p', x: anyPlanPriced() ? 'StageLiora lists its current rates on the pricing page. Any StageLiora project is priced before work starts.' : 'StageLiora does not list rates on this site. Any StageLiora project is priced before work starts.' },
      { t: 'links', h: 'Related', items: [{ href: '/pricing/', label: 'What affects a StageLiora quote' }, { href: '/request-quote/', label: 'Request a quote' }, { href: '/guides/virtual-staging-vs-traditional-staging/', label: 'Virtual or traditional staging?' }] },
    ],
  },
  {
    slug: 'virtual-staging-faqs', path: '/guides/virtual-staging-faqs/', heroPair: 'showcase-bedroom', reading: '6 min', updated: UPDATED, sources: [STELLAR, STELLAR_PR],
    title: 'Virtual Staging FAQs for Listing Agents | StageLiora', h1: 'Virtual staging questions agents actually ask',
    description: 'Straight answers on virtual staging for listing agents: occupied homes, exteriors, labels, originals, twilight photos, and who is responsible for disclosure.',
    summary: 'Short answers to the practical questions that come up when staging a listing.',
    body: [{ t: 'p', x: 'These answers are written with Stellar MLS in mind, because it is a major MLS in the St. Petersburg area. Other MLSs differ, and none of this is legal advice.' }],
    faqs: [
      { q: 'Can I stage an occupied home?', a: 'Yes, in Stellar MLS. Article 04.04 permits removing existing furniture and replacing it with digital furniture and decor. Defects and permanent fixtures must stay as they are.' },
      { q: 'Can I stage the exterior?', a: 'Only with unattached furniture or decor. Stellar prohibits other virtual staging on exterior photos, and its photo rules specifically prohibit adding landscape plantings and removing utility lines.' },
      { q: 'Can I virtually paint a wall?', a: 'Not in a Stellar listing photo. The photo rules list changing paint colors as something you cannot do. A concept image for planning is a different use, and should not be presented as the home\'s condition.' },
      { q: 'Where does the "Virtually staged" label go?', a: 'In Stellar, in the photo description field, along with checking the virtually staged field. The first words of the public remarks must also read "One or more photo(s) was virtually staged."' },
      { q: 'Can I put a watermark on the photo?', a: 'Stellar strictly prohibits words and branding on property photographs submitted to the service. Its pages do not use the word watermark, but a text watermark would be words on a photo. A website label on your own marketing is a separate question.' },
      { q: 'Do I need to show the original photo too?', a: 'Stellar\'s article does not say so. California law and some other MLSs do require access to the original, so keep every original regardless. It is good protection in any market.' },
      { q: 'Are twilight photos allowed?', a: 'Stellar accepts them as long as lighting is not added where it does not exist, and the sunset or sunrise truly reflects where the sun rises and sets.' },
      { q: 'Can I stage a home that is not finished yet?', a: 'Not in Stellar. Virtual staging shall not be used for pre-construction and under-construction properties.' },
      { q: 'Who is responsible if a photo breaks a rule?', a: 'Stellar\'s rules apply to the listing in its service, and the consequences (photo removal and an automatic fine) fall under its compliance process. Ask your broker how your office handles this.' },
      { q: 'Can a vendor promise that a photo meets MLS rules?', a: 'Be cautious with anyone who does. StageLiora does not make that claim. Rules vary, they change, and the final use of the image is in your hands.' },
    ],
  },
  {
    slug: 'virtual-staging-vs-traditional-staging', path: '/guides/virtual-staging-vs-traditional-staging/', heroPair: 'showcase-dining', reading: '5 min', updated: UPDATED, sources: [NAR],
    title: 'Virtual Staging vs. Traditional Staging | StageLiora', h1: 'Virtual staging or traditional staging?',
    description: 'A fair comparison of virtual and traditional home staging: cost, timing, showings and risks, plus how to decide which suits a particular listing.',
    summary: 'Virtual staging helps online photos. Traditional staging also changes how the home feels in person.',
    body: [
      { t: 'p', x: 'These two options solve overlapping problems, and a vendor who sells only one of them will tend to tell you it always wins. It does not. The right answer depends on the home and on how buyers will first experience it.' },
      { t: 'table', caption: 'How the two options compare', head: ['', 'Virtual staging', 'Traditional staging'], rows: [
        ['What changes', 'The photos only', 'The physical home'],
        ['At the showing', 'The room is still empty', 'The room is furnished'],
        ['Logistics', 'No movers or access needed', 'Movers, scheduling and access'],
        ['Typical cost', 'Per image; varies widely', 'NAR reports a $1,500 median'],
        ['Main risk', 'Buyer expectations; MLS rules', 'Cost and rental term if the home sits'],
      ] },
      { t: 'h2', x: 'When virtual staging fits' },
      { t: 'ul', items: ['The home is vacant and physical staging does not fit the budget', 'The listing is already live and the photos are the weak point', 'Only one or two rooms are hard to read in photos'] },
      { t: 'h2', x: 'When traditional staging fits' },
      { t: 'ul', items: ['Buyers at this price point expect a furnished showing', 'Furniture will help people navigate a difficult layout in person', 'The seller can fund staging for the likely time on market'] },
      { t: 'h2', x: 'Doing both' },
      { t: 'p', x: 'Some agents physically stage the key rooms and use images for the rest. This works best when you explain clearly which rooms are which, so buyers are not surprised on arrival.' },
      { t: 'callout', h: 'Be careful with statistics', x: 'Staging claims are often published by companies selling staging. NAR\'s report is a survey of agent opinion. It is useful, but it does not prove that either type of staging will produce a particular sale result for your listing.' },
      { t: 'links', h: 'Related', items: [{ href: '/guides/virtual-staging-cost/', label: 'What virtual staging costs' }, { href: '/guides/what-is-virtual-staging/', label: 'What is virtual staging?' }] },
    ],
  },
  {
    slug: 'how-to-prepare-photos-for-virtual-staging', path: '/guides/how-to-prepare-photos-for-virtual-staging/', heroPair: 'svc-photo-enhancement', featured: { pair: 'pf-primary-bedroom', show: 'before' }, reading: '5 min', updated: UPDATED, sources: [STELLAR_PR],
    title: 'How to Prepare Photos for Virtual Staging | StageLiora', h1: 'How to prepare photos for virtual staging',
    description: 'A practical shooting checklist for virtual staging: camera height, angles, light, clutter, file size and rights, for phones and professional cameras.',
    summary: 'A good staged image starts with a level, well-exposed photo that shows the floor.',
    body: [
      { t: 'p', x: 'Editing cannot fully fix a poor photo. Furniture looks natural when the room gives it something to sit on: a clear floor, level lines and believable light. A few minutes on site can make a real difference.' },
      { t: 'h2', x: 'Set up the shot' },
      { t: 'ol', items: ['Hold the camera level, at about chest height, so vertical lines stay vertical.', 'Shoot from a corner or doorway to show two or three walls.', 'Keep as much floor in frame as you can. Furniture needs a floor to stand on.', 'Avoid extreme wide-angle settings, which can stretch a room and misstate its size.', 'Take at least one extra angle of every room you plan to stage.'] },
      { t: 'h2', x: 'Manage the light' },
      { t: 'ul', items: ['Turn on all the working lights in the room.', 'Open the blinds if the view is what you want to show.', 'Shoot when sunlight is not throwing hard patches across the floor.', 'Avoid filters. Keep the file as close to the camera\'s output as possible.'] },
      { t: 'h2', x: 'Prepare the room' },
      { t: 'ul', items: ['Remove small items you can pick up: cords, boxes, cleaning supplies.', 'Do not hide damage behind objects. It should be repaired or disclosed, and it should not be edited out.', 'For occupied rooms, note what conveys with the home so it is not removed by mistake.'] },
      { t: 'h2', x: 'Exteriors and twilight' },
      { t: 'p', x: 'For a twilight edit, write down which way the home faces and which outside lights actually work. Stellar requires that lighting not be added where it does not exist, and that the sun position be true.' },
      { t: 'h2', x: 'Files and rights' },
      { t: 'ul', items: ['Keep the untouched originals in a folder of their own, apart from any edited versions.', 'Ask the photographer for the full-resolution original. A downsized MLS export or a screenshot limits what can be done.', 'Send the uncropped frame. Cropping after staging is safer than staging a crop that cuts off the corners of the room.', 'Say where each image will be used: the MLS, your website, flyers or social posts.', 'Confirm you may have the photo edited. If a photographer took it, check your license. Stellar\'s own tips are to take the photo yourself or get the proper license, and not to scrape photos from the internet.'] },
      { t: 'links', h: 'Related', items: [{ href: '/guides/virtual-staging-disclosure-florida/', label: 'Virtual staging disclosure in Florida' }, { href: '/services/photo-enhancement/', label: 'Photo enhancement' }, { href: '/services/virtual-staging/', label: 'Virtual staging' }] },
    ],
  },
  {
    slug: 'virtual-staging-disclosure-florida', path: '/guides/virtual-staging-disclosure-florida/', heroPair: 'hero-living', reading: '7 min', updated: UPDATED,
    sources: [STELLAR, STELLAR_PR, { name: 'Florida Statutes section 475.25, 2026', url: 'http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0475/Sections/0475.25.html' }, { name: 'Fla. Admin. Code R. 61J2-10.025 (Cornell LII copy)', url: 'https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-61J2-10-025' }, { name: 'NAR Code of Ethics', url: 'https://www.nar.realtor/about-nar/governing-documents/code-of-ethics/2026-code-of-ethics-standards-of-practice' }],
    title: 'Virtual Staging Disclosure in Florida | StageLiora', h1: 'Virtual staging disclosure in Florida',
    description: 'What Stellar MLS requires for virtually staged photos, what Florida statutes do and do not say, and a checklist for listing agents. Not legal advice.',
    summary: 'Stellar MLS sets explicit disclosure steps. Florida\'s general advertising rules apply too, though we found no photo-specific law.',
    body: [
      { t: 'callout', h: 'Not legal advice', x: 'This guide summarizes rules read on November 5, 2026. Rules change. Confirm with Stellar MLS compliance, your broker or a Florida attorney before relying on it.' },
      { t: 'h2', x: 'The short version' },
      { t: 'p', x: 'If you list in Stellar MLS, you need to do three things for virtually staged photos. Florida also has general rules against misleading advertising. We did not find a Florida statute or Florida Real Estate Commission rule written specifically about altered listing photos, though that is not proof that none exists.' },
      { t: 'h2', x: 'The three Stellar MLS steps' },
      { t: 'ol', items: ['Add the words "Virtually staged" in the photo description field.', 'Check the virtually staged field.', 'Start the public remarks with: "One or more photo(s) was virtually staged."'] },
      { t: 'p', x: 'Photos must also present a "True Picture" of the property. Non-compliant virtually staged photos are removed from the service, and an automatic Level I fine applies under the fine schedule in Article 11.' },
      { t: 'h2', x: 'What Stellar allows and prohibits' },
      { t: 'table', caption: 'Summary of Stellar MLS Article 04.04 and the Stellar photo rules page', head: ['Allowed', 'Prohibited'], rows: [
        ['Adding furniture, mirrors, artwork, plants and similar items', 'Virtual staging on pre-construction and under-construction properties'],
        ['Removing existing furniture and replacing it digitally', 'Virtually staging exterior photos, except unattached furniture or decor'],
        ['Twilight photos, if lighting is not added where none exists and the sun position is true', 'Attaching, removing, altering or adding permanent fixtures'],
        ['Brightening underexposed photos', 'Adding elements outside the owner\'s control, such as a Gulf view or landmark that is not physically possible'],
        ['Removing easily removable exterior items', 'Excluding negative elements such as holes, exposed wiring or damaged flooring'],
        ['', 'Words, branding or people on property photos; distorting room size; changing paint colors; adding landscape plantings; removing utility lines'],
      ] },
      { t: 'h2', x: 'Words on photos' },
      { t: 'p', x: 'This is a common mistake. Many vendors offer a "virtually staged" stamp on the image, and some MLSs elsewhere ask for one. Stellar strictly prohibits words on any property photograph submitted to the service, so use the fields instead. The before and after labels on this website are for explanation, and are not MLS labels.' },
      { t: 'h2', x: 'What Florida law says' },
      { t: 'p', x: 'Section 475.25(1)(b) and (c) of the Florida Statutes allows discipline of licensees for misrepresentation and concealment, and for advertising that is fraudulent, false, deceptive or misleading in form or content. Rule 61J2-10.025 of the Florida Administrative Code also bars fraudulent, false, deceptive or misleading advertising. Neither text mentions photos or images.' },
      { t: 'p', x: 'Applying those general rules to an altered photo is our inference, not a stated rule. We did not find a court case or Commission order applying them to virtual staging. A separate 2021 rule-development notice on internet advertising was seen, and its outcome was not verified.' },
      { t: 'p', x: 'If you are a REALTOR, Article 12 of the NAR Code of Ethics also requires a true picture in your representations.' },
      { t: 'h2', x: 'A listing checklist' },
      { t: 'ul', items: ['Original saved for every edited photo', 'Permission to edit each photo', 'Nothing permanent, defective or outside the owner\'s control has been changed', 'Furniture is true to the size of the room', 'No words, logos or people on the image', 'Description field reads "Virtually staged"', 'Virtually staged field is checked', 'Public remarks begin with the required sentence', 'The same honesty carries over to your website, flyers and social posts'] },
      { t: 'links', h: 'Related', items: [{ href: '/locations/st-petersburg-fl/', label: 'St. Petersburg listing photo guide' }, { href: '/guides/virtual-staging-faqs/', label: 'Questions agents ask' }, { href: '/guides/virtual-staging-for-real-estate-agents/', label: 'Using virtual staging on a listing' }] },
    ],
  },
  {
    // V18: absorbed the decision content of the retired /for-real-estate-agents/ page (room priority, vacant vs
    // occupied, workflow, review, publishing). Stellar 04.04 and the NAR figures were re-read on 2026-11-10.
    slug: 'virtual-staging-for-real-estate-agents', path: '/guides/virtual-staging-for-real-estate-agents/', heroPair: 'pf-living-room', reading: '9 min', updated: '2026-11-10', sources: [STELLAR, NAR],
    title: 'How to Use Virtual Staging for a Real Estate Listing | StageLiora', h1: 'How to use virtual staging for a real estate listing',
    description: 'A listing agent\'s guide to virtual staging: which rooms to stage, vacant versus occupied homes, a photo-by-photo workflow, reviewing edits and getting ready to publish.',
    summary: 'Choose the rooms worth staging, treat vacant and occupied homes differently, and check every edit before the listing goes live.',
    body: [
      { t: 'p', x: 'Virtual staging is most useful when it is part of a plan for the listing and not a last-minute fix. This guide follows one listing from the first look at the photos to the day it goes live.' },
      { t: 'h2', x: 'Decide whether the listing needs it' },
      { t: 'ul', items: ['Vacant homes with rooms that are hard to judge in photos', 'Occupied homes with furniture that distracts from the space', 'Listings that have been live for a while, where the photos are the weak point'] },
      { t: 'p', x: 'Skip it where the problem is price, condition or the photo itself. Better photos rarely fix a listing that gets showings but no offers, repairs have to be made or disclosed rather than edited out, and a dark or tilted photo usually needs a reshoot before it is worth staging.' },
      { t: 'h2', x: 'Choose the rooms to stage' },
      { t: 'p', x: 'Begin with the rooms that appear first in the listing and the rooms a buyer would find hardest to read. Add more only if a specific photo is still unclear.' },
      { t: 'table', caption: 'When a room usually justifies staging, and when it can stay as photographed', head: ['Room', 'Usually worth staging when', 'Often fine as is when'], rows: [
        ['Living room', 'It is empty, or it is the first interior photo in the listing.', 'An occupied room already has neutral furniture in proportion to the space.'],
        ['Primary bedroom', 'Buyers need to see that a bed and two nightstands fit with room to walk around them.', 'The existing furniture is in scale and the room is uncluttered.'],
        ['Dining room or dining zone', 'It is a separate room, or an open-plan area buyers cannot place.', 'An eat-in spot is obvious from the kitchen layout.'],
        ['Kitchen', 'An eat-in area or island seating is unclear. Cabinets, counters and appliances stay as photographed.', 'The photo is mostly cabinetry. Stools and a table would add little.'],
        ['Home office or spare room', 'You want to show a realistic second use for a spare room.', 'The room is clearly a bedroom and marketed as one.'],
        ['Bonus room, loft or alcove', 'The space is a selling point but its purpose is unclear.', 'It is small and one photo already explains it.'],
        ['Secondary bedrooms', 'A small bedroom might be read as storage.', 'There are several similar rooms. Staging one often shows the scale for the rest.'],
      ] },
      { t: 'p', x: 'For a sense of where buyers look first: NAR surveyed REALTORS in February 2025 for its 2025 Profile of Home Staging, released May 6, 2025. For home buyers, staging the living room was considered the most important (37%), then the primary bedroom (34%) and the kitchen (23%), while the guest bedroom ranked last at 7%. Those answers are about staging in general, not virtual staging, and they describe agents\' views, not a measured result.' },
      { t: 'h2', x: 'Leave some rooms as photographed' },
      { t: 'p', x: 'Not every photo needs staging, and a listing can mix staged and unstaged rooms. Bathrooms, hallways, laundry rooms and garages usually show buyers what they need to know without furniture, and staging one of several similar bedrooms often explains the rest.' },
      { t: 'h2', x: 'Vacant and occupied homes need different decisions' },
      { t: 'p', x: 'In a vacant home, the job is to show what an empty room can hold. In an occupied home, the job is to take attention off the seller\'s belongings without changing anything that stays with the house.' },
      { t: 'table', caption: 'How the decision differs between vacant and occupied homes', head: ['', 'Vacant home', 'Occupied home'], rows: [
        ['Main goal', 'Show the scale and purpose of empty rooms', 'Remove distractions without misstating the space'],
        ['Type of edit', 'Furniture and decor added to the empty room', 'Belongings removed first, then new furniture placed'],
        ['Decide before editing', 'Which use to show in each room, and furniture sized to fit it', 'What conveys with the sale, and which features are permanent'],
        ['Most common mistake', 'Furniture too small for the room, so it looks larger than it is', 'Removing something attached to the house, such as a ceiling fan or built-in shelving'],
        ['At the showing', 'Buyers walk into empty rooms', 'Buyers see the seller\'s furniture, not the staged furniture'],
      ] },
      { t: 'p', x: 'Stellar\'s Article 04.04 permits removing existing furniture and replacing it with digital furniture, but no permanent fixture may be attached, removed, altered or added. For an occupied home, settle with the seller what conveys before anything is edited.' },
      { t: 'h2', x: 'Write a useful brief' },
      { t: 'ol', items: ['State the likely buyer and the use you want to show for each room.', 'Choose a style that suits the architecture actually in the photo.', 'List anything that conveys with the sale.', 'Name your MLS, so limits can be flagged early.'] },
      { t: 'h2', x: 'Talk to your seller' },
      { t: 'p', x: 'Explain what will change in the photos, what will not, and why you will disclose it. Sellers may ask for extras like greener grass or a fresh coat of paint. It helps to be able to explain that Stellar does not allow those in listing photos.' },
      { t: 'h2', x: 'A photo-by-photo workflow' },
      { t: 'ol', items: [
        'Go through the photos you have. Note which rooms are hard to read, and set aside any photo too weak to stage so it can be reshot.',
        'Shortlist rooms from the table above, decide the use to show in each one, and pick a single style for the home.',
        'Read the rules for every place the photos will run: your MLS (Article 04.04 if you list in Stellar) and your brokerage\'s own policy.',
        'Agree the room list, the edit for each photo and the price before any photo is edited.',
        'Put the untouched originals in a folder of their own. You need them to check each edit and to answer questions later.',
        'Check every edited image against its original before you use it.',
        'Complete the disclosure, then publish.',
      ] },
      { t: 'h2', x: 'Review each edit before it is used' },
      { t: 'p', x: 'Open each edited image beside its original at the same size. A believable edit changes only what could be carried out of the house: windows, views, walls, floors, doorways and fixtures match, any visible damage is still there, and the furniture looks right next to the door. If something permanent has changed, do not use the image, and raise it before the photo goes anywhere. How It Works sets out each check.' },
      { t: 'h2', x: 'Get ready to publish' },
      { t: 'ul', items: [
        'Complete your MLS\'s disclosure for each staged photo. In Stellar that is the photo description, the virtually staged field and the required opening sentence of the public remarks.',
        'Keep words and logos off the image itself. Stellar prohibits words and branding on listing photos.',
        'Carry the same disclosure to your website, flyers and social posts.',
        'Tell showing agents which rooms are empty. A buyer who expects furniture and finds an empty room may feel misled even when everything was disclosed, so printed originals at showings can help.',
      ] },
      { t: 'h2', x: 'After you publish' },
      { t: 'p', x: 'Track what happens with your own listings. Your own showings and inquiries will tell you more about whether staging is worth it than any vendor statistic, including ours.' },
      { t: 'links', h: 'Related', items: [{ href: '/how-it-works/#check-images', label: 'How to check your edited images' }, { href: '/guides/how-to-prepare-photos-for-virtual-staging/', label: 'How to prepare photos' }, { href: '/guides/virtual-staging-disclosure-florida/', label: 'Disclosure in Florida' }, { href: '/services/furniture-removal-and-staging/', label: 'Furniture removal and staging' }, { href: '/pricing/', label: 'Planning your cost' }] },
    ],
  },
];

/** The guide's featured image: its own setting, else its hero pair split, else none. */
export const featuredOf = (g: Guide): Featured | null => g.featured ?? (g.heroPair ? { pair: g.heroPair, show: 'split' } : null);

export const getGuide = (slug: string) => {
  const g = guides.find((x) => x.slug === slug);
  if (!g) throw new Error(`Unknown guide: ${slug}`);
  return g;
};
