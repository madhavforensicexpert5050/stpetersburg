import { approvals } from './approvals.ts';
import { anyPlanPriced, rateText } from './pricing-plans.ts';
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
    { h: 'Number of images', b: 'A single photo and a full listing are priced differently. Larger sets can be quoted as one bundle rather than image by image.' },
    { h: 'Type of edit', b: 'Adding furniture, removing belongings, correcting exposure and creating a twilight look are different jobs, each priced on its own.' },
    { h: 'Room complexity', b: 'An open plan with several zones, or a room shot from a wide angle, takes more placement work than a simple bedroom.' },
    { h: 'Furniture and styling', b: 'A full furnished look, a particular design direction or matching several rooms to one style all shape the effort involved.' },
    { h: 'Scope of changes', b: 'An occupied room needs belongings removed before staging. Concept edits to paint, floors or landscaping are separate work.' },
    { h: 'Revision requirements', b: 'How changes after the first version are handled is agreed in writing before any work starts.' },
  ],
  expect: [
    { h: 'Photo requirements', b: 'Level, well-lit, full-resolution photos with the floor visible give the most believable result. Send only photos you have the right to edit.', href: '/guides/how-to-prepare-photos-for-virtual-staging/', link: 'How to prepare your photos' },
    { h: 'Styling direction', b: 'Choose a direction that suits the house and its likely buyers. The Portfolio shows eight styles across different rooms, with a guide to choosing one.', href: '/portfolio/', link: 'Browse styles and room designs' },
    { h: 'Image review', b: 'Check each edited image against its original. Walls, windows, floors and fixtures should match before an image is used.', href: '/how-it-works/', link: 'How it works' },
    { h: 'Listing disclosure', b: 'In Stellar MLS, virtually staged photos are disclosed in the listing fields, not with words on the image.', href: '/guides/virtual-staging-disclosure-florida/', link: 'Florida disclosure guide' },
  ],
  /** Pricing, "Planning your virtual staging cost" (V18, from the retired agents page). Figures come only from approvals. */
  planning: {
    h: 'Planning your virtual staging cost',
    intro: 'StageLiora prices by the photo, so the useful question is how many photos actually need editing, not how many rooms the house has.',
    steps: [
      { h: 'Count photos, not rooms', b: 'Two angles of the same living room are two images. One strong angle per room is often enough, and bathrooms, hallways and garages rarely need staging at all.' },
      { h: 'Sort the photos by edit', b: 'List which photos need furniture added to an empty room and which need belongings cleared first, so each one is quoted for the work it really needs.' },
      { h: 'Compare the per-photo options', b: anyPlanPriced() && rateText('pay-as-you-go')
        ? `Pay As You Go is ${rateText('pay-as-you-go')} and suits a few images. The Essential Bundle (${rateText('essential-bundle')}) and the Plus Bundle (${rateText('plus-bundle')}) apply to photo sets. Dedicated Assistance (${rateText('dedicated-assistance')}) is for ongoing requirements.`
        : 'Single images and photo sets are priced differently. Ask which option fits the number of photos you have.' },
      { h: 'Read the bundle terms', b: 'A bundle rate applies only to a set of photos under terms agreed in writing, including quantity and how unused images are handled. Those terms decide whether the lower rate suits your listings, so read them before you commit.' },
      { h: 'Agree the scope first', b: 'The room list, the edit for each photo, the style and the price are settled before any photo is edited.' },
    ],
    example: anyPlanPriced() && rateText('pay-as-you-go')
      ? `For example, one angle each of the living room, primary bedroom and dining room is three photos. If each is standard virtual staging of an empty room on Pay As You Go, each one is billed at ${rateText('pay-as-you-go')}.`
      : null,
  },
  faqs: [
    { q: 'How is virtual staging pricing calculated?', a: `By the image. The service, the number of photos and the work each room needs set the cost, and it is agreed in a written quotation before any work starts.${anyPlanPriced() ? ' The current per-photo rates are shown on this page.' : ' Rates are not listed on the site yet, so ask about your listing directly.'}` },
    { q: 'What affects the cost of editing a property photo?', a: 'Mostly how much the room needs. An empty room needs furniture added; an occupied room needs belongings removed first. The quality of the source photo and the number of changes matter too.' },
    { q: 'When does a bundle make sense?', a: 'When you have a full listing, or several listings, to stage at once. One rate across a set keeps the cost predictable and the style consistent. Bundle sizes and terms are set out in writing before any payment.' },
    { q: 'What types of photographs are suitable?', a: 'Level, well-lit, high-resolution photos with the floor and corners visible. Dark, tilted or tightly cropped photos limit what can be done believably. The photo preparation guide covers the details.' },
    { q: 'How are revisions handled?', a: 'Each written quotation states the revision rounds included, the deadline for revision requests and the charge for any extra revisions. There is no standard free-revision promise.' },
    { q: 'Are design visualizations and listing-photo staging priced differently?', a: 'Yes. They are different jobs. Listing photo edits show a property as it is; concept visualizations of paint, flooring, ceilings or landscaping are for planning and are priced on their own.' },
    { q: 'How do I pay?', a: 'Your written quotation states the price, the accepted payment method, the due date and any payment conditions before work starts. There is no online checkout on this site, so please do not send card details by email or through a form.' },
  ],
};

export const generalFaqs = [
  { group: 'The basics', items: [
    { q: 'What is virtual staging?', a: 'Adding furniture and decor to a photo of a room using image editing. The room itself is not changed. Our guide explains it in more detail.' },
    { q: 'Who is StageLiora for?', a: 'Real estate agents, photographers, brokerages and other people who market property.' },
    { q: 'Do the walls, windows and floors stay the same?', a: 'In a listing photo edit, yes. Virtual staging adds or replaces movable furniture and decor. Walls, windows, flooring, fixtures and the view stay as photographed. Changing those, such as new paint, flooring or cabinets, is a renovation or concept visualization. It can help someone plan, but it does not show the home as it is, so in Stellar MLS it cannot be used as a listing photo.' },
    { q: 'Should I stage every empty room in a listing?', a: 'Usually not. Stage the rooms buyers see first and the ones hardest to read without furniture, then stop. A listing can mix staged and unstaged photos, as long as each staged one is disclosed.' },
    { q: 'Can I see the same room in more than one style?', a: 'The room designs in the Portfolio show each room type across several of the eight design directions, so you can compare them side by side. In the listing itself, one style per home is usually better: buyers scrolling the photos would see the same room twice, and each version is another image to pay for and disclose. Keep alternatives for a seller conversation.' },
    { q: 'How is the price of a project set?', a: `By the service, the number of images, what each room needs and the quality of the source photo. ${anyPlanPriced() ? 'The pricing page lists the current rates' : 'Rates are not published on the site'}, and explains how each factor affects the cost.` },
    { q: 'Will virtual staging guarantee a faster sale?', a: 'No, and nobody can promise that. In NAR\'s 2025 Profile of Home Staging, 49% of sellers\' agents said staging reduced time on market, but that is agents\' experience of staging in general, not a measured result of virtual staging. Your own inquiries and showings are better evidence.' },
    { q: 'Do you have an office in St. Petersburg?', a: 'No. StageLiora works remotely and has no public office or storefront in Florida. St. Petersburg is the market this site is written for.' },
    { q: 'Can I see your finished work?', a: 'The before-and-after examples on this site are AI-created concepts of fictional rooms. They show the approach and the editing limits. Client work will be published only with permission, and labeled as client work.' },
  ] },
  { group: 'MLS and disclosure', items: [
    { q: 'Will an edited photo be compliant with my MLS?', a: 'We cannot promise that. Rules differ by MLS and change over time, and the agent and broker remain responsible for the listing. We explain the rules we have read and point you to the source.' },
    { q: 'What does Stellar MLS ask for?', a: 'For virtually staged photos, Article 04.04 requires "Virtually staged" in the photo description, the virtually staged field checked, and public remarks beginning "One or more photo(s) was virtually staged."' },
    { q: 'Can the words "virtually staged" go on the image itself?', a: 'Not in Stellar MLS. Article 04.04 strictly prohibits words and branding on property photographs submitted to the service. Use the fields instead.' },
    { q: 'Can a staged photo replace the original?', a: 'In the listing, with the required disclosure, yes. As your record, no. Keep every original: you need it to check the edit, to answer a buyer\'s question and to show what the room looks like today.' },
    { q: 'Which edits are not allowed in Stellar listing photos?', a: 'Among others: exterior staging beyond unattached furniture or decor, changing permanent fixtures, adding views or lighting that could not exist, hiding defects, distorting room size, changing paint colors and adding landscape plantings.' },
  ] },
  { group: 'Working with us', items: [
    { q: 'How long does a project take?', a: 'It depends on the number of photos and the edits requested. The estimated turnaround for your project is stated in the written quotation before work begins. No fixed delivery time is promised.' },
    { q: 'Who edits the photos?', a: 'Devender Garg, StageLiora’s founder, handles each project. Images are staged with AI-assisted editing and then refined by hand. StageLiora does not claim to own or have built the AI tools it uses.' },
    { q: 'What file types should I send?', a: 'High-resolution JPG/JPEG or PNG files, unfiltered, with the room type and any preferred style. Photos are sent by email, because this site has no upload. Please wait until your written quotation is agreed before sending them.' },
    { q: 'Whose photos can I send?', a: 'Only photos you own or are licensed to have edited. Photographers often keep the copyright and license listing photos for listing use only, so ask for written permission that covers editing by a third party.' },
    { q: 'What about refunds?', a: 'Refund terms will be set out in writing before any work starts. Revision terms are part of every written quotation.' },
  ] },
];

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
  { n: '01', h: 'Share your property details', b: 'Tell us the room types, how the photos were taken and where the images will be used. The MLS matters, because the rules differ.' },
  { n: '02', h: 'Discuss your project', b: 'We talk through which edits suit each room, what should stay unchanged and which service fits. Nothing starts until scope and cost are agreed.' },
  { n: '03', h: 'Share your photos', b: 'Send only full-resolution photos you have the right to edit. There is no upload on this site, so the transfer method is agreed with you.' },
  { n: '04', h: 'Review the visuals', b: 'Check each edited image against its original. Walls, windows, floors and fixtures should match before any image is used.' },
  { n: '05', h: 'Prepare for listing use', b: 'Keep the original and complete the disclosure your MLS requires. In Stellar MLS that happens in the listing fields, not on the image.' },
];

/**
 * How It Works, #check-images (V18, from the retired agents page). What the customer checks in each edited image.
 * The example rows describe the showcase-bedroom files only; How.astro hides them if either file changes.
 */
export const imageChecks = {
  h: 'How to check your edited images',
  intro: 'Open each edited image next to its original at the same size, and go through the room one feature at a time. A believable edit changes only what could be carried out of the house.',
  checks: [
    { h: 'Original architecture', b: 'Walls, ceilings and openings match the original. Art can hang on a wall, but the wall itself should not move or change color.' },
    { h: 'Windows and doorways', b: 'Every window keeps its size, position and view, with no water view or skyline that is not really there. No furniture hides a doorway buyers will find at the showing.' },
    { h: 'Permanent fixtures', b: 'Light fixtures, ceiling fans, built-ins, cabinets, vents and flooring appear exactly as photographed.' },
    { h: 'Furniture scale', b: 'Use the door as a ruler. A standard interior door is about 6 feet 8 inches tall, so a bed or sofa should look right beside it. Undersized furniture makes a room look bigger than it is.' },
    { h: 'Perspective', b: 'Furniture sits flat on the floor and follows the same lines as the room, with no piece that looks tilted, stretched or floating.' },
    { h: 'Lighting consistency', b: 'Shadows fall away from the windows as they do in the original, and no lamp glows where there is no working light.' },
    { h: 'Original versus edited', b: 'Anything visible in the original, such as cracks, holes or worn flooring, is still visible. Keep both files: the original is your record.' },
    { h: 'Image disclosure', b: 'There are no words or logos on the image. In Stellar MLS the disclosure goes in the listing fields, not on the photo.' },
  ],
  stop: 'do not use the image. Raise it before the photo goes anywhere.',
  example: {
    h: 'Reading this example',
    intro: 'Drag the divider and run the same checks you would run on your own listing photo.',
    rows: [
      { h: 'The original room', b: 'An empty bedroom with a four-door built-in wardrobe, a wide three-pane window onto a garden, light wood flooring and an open door to the hallway.' },
      { h: 'What was added', b: 'A bed with linen bedding and a knitted throw, an upholstered bench, a large wool rug, a nightstand with a lamp, framed art, a woven basket and a few small pieces on the windowsill.' },
      { h: 'What stayed the same', b: 'The wardrobe, the window and the view through it, the flooring, the ceiling light, the baseboards and the doorway.' },
      { h: 'The scale check', b: 'The wardrobe is built in, so it stays exactly as photographed. Compare the bed with the door and the window: that is the check to run on your own photos.' },
    ],
  },
};
