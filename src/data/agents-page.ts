/**
 * Copy for /for-real-estate-agents/ (V17). One intent: help a listing agent decide whether, where and how to use
 * virtual staging on a specific listing, before they contact anyone. The homepage sells the service; this page
 * supports the decision. Facts checked November 10, 2026 against the sources listed below.
 *
 * Prices come from approvals via rateText(); never type a figure here.
 */
import { rateText, anyPlanPriced } from './pricing-plans.ts';

export const agentSources = [
  { name: 'Stellar MLS Rules, Article 04.04: Virtually Staged Photos (page last updated Sep 27, 2026)', url: 'https://rules.stellarmls.com/article/article-0404-virtually-staged-photos' },
  { name: 'Stellar MLS, Listing Photo Rules and Tips', url: 'https://www.stellarmls.com/photorules' },
  { name: 'National Association of REALTORS, 2025 Profile of Home Staging (survey of February 2025, released May 6, 2025)', url: 'https://www.nar.realtor/research-and-statistics/research-reports/profile-of-home-staging' },
];
export const STELLAR_0404 = agentSources[0].url;

export const agentsPage = {
  eyebrow: 'For listing agents',
  h1: 'Virtual Staging for Real Estate Agents',
  lede: 'An empty room is hard to judge on a phone screen. Use this page to decide which rooms in a listing are worth staging, how to prepare the photos, what to check in each edited image and what Stellar MLS asks you to disclose.',
  onThisPage: [
    { id: 'fit', label: 'Is it a fit?' },
    { id: 'rooms', label: 'Which rooms' },
    { id: 'vacant-occupied', label: 'Vacant or occupied' },
    { id: 'photos', label: 'Preparing photos' },
    { id: 'review', label: 'Reviewing an edit' },
    { id: 'mls', label: 'MLS disclosure' },
    { id: 'cost', label: 'Cost' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'faq', label: 'FAQ' },
  ],

  fit: {
    h: 'Does virtual staging fit this listing?',
    intro: 'Staging changes what a buyer sees in a photo. It does not change the house, its condition or its price. It earns its cost where the photo itself is the weak point.',
    helps: [
      { h: 'Empty living rooms', b: 'Without furniture, buyers cannot tell whether a sofa and two chairs fit, or where people would walk through.' },
      { h: 'Vacant bedrooms', b: 'Bare bedrooms tend to look smaller in photos, and a small one can be mistaken for storage.' },
      { h: 'Rooms with no clear purpose', b: 'A loft, bonus room or alcove looks like leftover space until something shows how it could be used.' },
      { h: 'Distracting furniture in an occupied home', b: 'Worn, oversized or very personal pieces can be removed and replaced, provided nothing permanent changes.' },
      { h: 'Awkward layouts', b: 'Angled walls, several doorways or an open plan with no obvious zones are easier to understand with furniture placed in them.' },
      { h: 'Scale that is hard to read', b: 'Furniture at true size acts as a measuring stick. Undersized furniture does the opposite, and Stellar prohibits it.' },
    ],
    limits: [
      { h: 'A pricing problem', b: 'If showings happen but offers do not, better photos are unlikely to be the answer.' },
      { h: 'Poor condition or unfinished repairs', b: 'Damage has to be repaired or disclosed. Editing it out of a listing photo is prohibited in Stellar.' },
      { h: 'Structural limits', b: 'Staging cannot add a closet, move a wall or make a 10-by-10 room hold a king bed with space to spare.' },
      { h: 'Weak source photos', b: 'A dark, tilted or tightly cropped photo usually needs a reshoot first. Staging a poor photo leaves you with a poor photo.' },
      { h: 'Misleading photography', b: 'A lens setting that stretches a room misstates its size whether or not furniture is added.' },
    ],
  },

  rooms: {
    h: 'Which rooms should you prioritize?',
    intro: 'Begin with the rooms that appear first in the listing and the rooms a buyer would find hardest to read. Add more only if a specific photo is still unclear.',
    nar: 'In NAR\'s 2025 Profile of Home Staging, buyers\' agents named the living room (37%), the primary bedroom (34%) and the kitchen (23%) as the most important rooms to stage. The guest bedroom was the least important, at 7%. These answers are about staging in general, gathered from agents in February 2025. We found no comparable survey for virtual staging, so treat them as a guide to where buyers look, not a predicted result.',
    table: {
      caption: 'When a room usually justifies staging, and when it can stay as photographed',
      head: ['Room', 'Usually worth staging when', 'Often fine as is when'],
      rows: [
        ['Living room', 'It is empty, or it is the first interior photo in the listing.', 'An occupied room already has neutral furniture in proportion to the space.'],
        ['Primary bedroom', 'Buyers need to see that a bed and two nightstands fit with room to walk around them.', 'The existing furniture is in scale and the room is uncluttered.'],
        ['Dining room or dining zone', 'It is a separate room, or an open-plan area buyers cannot place.', 'An eat-in spot is obvious from the kitchen layout.'],
        ['Kitchen', 'An eat-in area or island seating is unclear. Cabinets, counters and appliances stay as photographed.', 'The photo is mostly cabinetry. Stools and a table would add little.'],
        ['Home office or spare room', 'You want to show a realistic second use for a spare room.', 'The room is clearly a bedroom and marketed as one.'],
        ['Bonus room, loft or alcove', 'The space is a selling point but its purpose is unclear.', 'It is small and one photo already explains it.'],
        ['Secondary bedrooms', 'A small bedroom might be read as storage.', 'There are several similar rooms. Staging one often shows the scale for the rest.'],
      ],
    },
    skip: 'Not every photo needs staging, and a listing can mix staged and unstaged rooms. Bathrooms, hallways, laundry rooms and garages usually show buyers what they need to know without furniture.',
  },

  vacantOccupied: {
    h: 'Vacant and occupied listings need different decisions',
    intro: 'In a vacant home, the job is to show what an empty room can hold. In an occupied home, the job is to take attention off the seller\'s belongings without changing anything that stays with the house.',
    table: {
      caption: 'How the decision differs between vacant and occupied homes',
      head: ['', 'Vacant home', 'Occupied home'],
      rows: [
        ['Main goal', 'Show the scale and purpose of empty rooms', 'Remove distractions without misstating the space'],
        ['Type of edit', 'Furniture and decor added to the empty room', 'Belongings removed first, then new furniture placed'],
        ['Decide before editing', 'Which use to show in each room, and furniture sized to fit it', 'What conveys with the sale, and which features are permanent'],
        ['Most common mistake', 'Furniture too small for the room, so it looks larger than it is', 'Removing something attached to the house, such as a ceiling fan or built-in shelving'],
        ['At the showing', 'Buyers walk into empty rooms', 'Buyers see the seller\'s furniture, not the staged furniture'],
      ],
    },
    note: 'Stellar\'s Article 04.04 permits removing existing furniture and replacing it with digital furniture. It does not permit attaching, removing, altering or adding permanent fixtures. For an occupied home, write down what conveys before the photos are edited, so nothing that stays with the house is taken out by mistake.',
  },

  photos: {
    h: 'How to prepare the photos',
    intro: 'Editing cannot fully repair a weak photo. Most of the quality of a staged image is decided when the original is taken.',
    items: [
      'Ask the photographer for the original full-resolution file, not a downsized MLS export or a screenshot.',
      'Check that your license lets a third party edit the photos. Photographers often keep the copyright.',
      'Choose frames shot at about chest height, with vertical lines straight, taken from a corner or doorway.',
      'Pick photos with even light and plenty of visible floor. Furniture needs a floor to stand on.',
      'Send the uncropped frame. Cropping after staging is safer than staging a crop that cuts off corners.',
      'Keep an untouched copy of every original in a folder of its own.',
      'Note where each image will be used: the MLS, your website, flyers or social posts.',
      'For an occupied home, list the items that convey with the sale.',
    ],
  },

  review: {
    h: 'How to review a staged image',
    intro: 'Open the edited image next to its original at the same size and go through the room one feature at a time. A believable result changes only what could be carried out of the house.',
    checks: [
      { h: 'Windows and views', b: 'Same size, same position, same view. No water view, skyline or landmark that is not really there.' },
      { h: 'Walls', b: 'Same color and the same openings. Art can hang on a wall; the wall itself should not change.' },
      { h: 'Flooring', b: 'Same material and color. A rug should not sit over a stain or damaged boards that the original shows.' },
      { h: 'Doorways', b: 'Every door and opening still visible. Furniture should not hide a doorway buyers will find at the showing.' },
      { h: 'Permanent fixtures', b: 'Light fixtures, ceiling fans, built-ins, cabinets and vents exactly as photographed.' },
      { h: 'Scale and proportion', b: 'Use the door as a ruler. A standard interior door is about 6 feet 8 inches tall, so a bed or sofa should look right beside it.' },
      { h: 'Damage and defects', b: 'Anything visible in the original, such as cracks, holes or worn flooring, is still visible.' },
      { h: 'Light and shadow', b: 'Shadows fall away from the windows, as they do in the original. No glow from lamps or lights that do not exist.' },
    ],
    close: 'If something permanent has changed, do not use the image. Raise it before the photo goes anywhere.',
  },

  example: {
    h: 'Reading the example above',
    intro: 'Drag the divider in the comparison at the top of this page and check it the way you would check your own listing photo.',
    rows: [
      { h: 'The original room', b: 'An empty bedroom with a four-door built-in wardrobe, a wide three-pane window onto a garden, light wood flooring and an open door to the hallway.' },
      { h: 'What was added', b: 'A bed with linen bedding and a knitted throw, an upholstered bench, a large wool rug, a nightstand with a lamp, framed art, a woven basket and a few small pieces on the windowsill.' },
      { h: 'What stayed the same', b: 'The wardrobe, the window and the view through it, the flooring, the ceiling light, the baseboards and the doorway.' },
      { h: 'What it shows', b: 'The wardrobe is built in, so it stays exactly as photographed. The furniture only shows how the floor in front of it can be used. Compare the bed with the door and the window: that is the scale check to run on your own photos.' },
    ],
  },

  mls: {
    h: 'MLS disclosure and listing accuracy',
    intro: 'Stellar MLS is a major MLS in the St. Petersburg area, and its Article 04.04 sets out how virtually staged photos must be handled. This is a plain summary of the version we read, last updated on September 27, 2026. It is not legal advice.',
    steps: [
      'Type "Virtually staged" in the photo description field for each staged photo.',
      'Check the virtually staged field.',
      'Begin the public remarks with: "One or more photo(s) was virtually staged."',
    ],
    rules: [
      { h: 'No words or branding on the photo', b: 'People, words and branding are prohibited on photos submitted to Stellar, so a "Virtually staged" stamp or a logo on the image breaks the rule. The disclosure belongs in the fields.' },
      { h: 'Permanent fixtures stay as they are', b: 'Nothing permanent, inside or out, may be attached, removed, altered or added. Stellar\'s photo rules also list changing paint colors as off limits.' },
      { h: 'Defects stay visible', b: 'Holes in walls, exposed wiring, damaged flooring and similar problems must not be edited out.' },
      { h: 'Room size stays true', b: 'Distorting a room\'s dimensions is prohibited, including placing small furniture to make a room look larger.' },
      { h: 'Exteriors and twilight', b: 'Exterior photos may show unattached furniture or decor, nothing more. Twilight photos are allowed only if no lighting is added where none exists and the sun position is true.' },
      { h: 'No staging before completion', b: 'Virtual staging may not be used for pre-construction or under-construction properties.' },
    ],
    penalty: 'Photos that break these rules are removed from the service, and an automatic Level I fine applies under Stellar\'s fine schedule.',
    responsibility: 'StageLiora does not promise that an image meets any MLS\'s rules. Rules differ between MLSs and change over time, and you and your broker remain responsible for the listing. Read the current article and your brokerage\'s policy before you publish.',
  },

  cost: {
    h: 'Planning the cost',
    intro: 'StageLiora prices by the photo, so the useful question is how many photos actually need editing, not how many rooms the house has.',
    rates: anyPlanPriced()
      ? `Pay As You Go is ${rateText('pay-as-you-go')}. The Essential Bundle is ${rateText('essential-bundle')} and the Plus Bundle is ${rateText('plus-bundle')}; bundle sizes and terms are agreed in writing before any payment. Dedicated Assistance, for ongoing requirements, is ${rateText('dedicated-assistance')}.`
      : 'Rates are agreed before any work starts.',
    factors: [
      { h: 'Count photos, not rooms', b: 'Two angles of the same living room are two images. One strong angle per room is often enough.' },
      { h: 'Type of edit', b: 'Adding furniture to an empty room and clearing an occupied room before staging it are different amounts of work. Confirm the rate for each edit before work starts.' },
      { h: 'One listing or several', b: 'If you have a full listing or several listings at once, ask whether a bundle applies to that set.' },
      { h: 'Scope agreed first', b: 'Room list, edit type, style and price are settled before any photo is edited.' },
    ],
    example: anyPlanPriced()
      ? `For example, staging one angle each of the living room, primary bedroom and dining room is three photos, each billed at the Pay As You Go rate of ${rateText('pay-as-you-go')} if it is standard virtual staging of an empty room.`
      : null,
  },

  workflow: {
    h: 'A practical workflow for one listing',
    intro: 'These steps work with any provider. Where StageLiora is involved, the step says how it works today.',
    steps: [
      { h: 'Review the property and the photos you have', b: 'Note which rooms are hard to read, and whether any photo is too weak to stage and should be reshot.' },
      { h: 'Choose the rooms', b: 'Shortlist from the room table above. Decide the use you want to show in each one and a single style for the home.' },
      { h: 'Check the rules for where the photos will run', b: 'Read Article 04.04 if you list in Stellar, or your own MLS\'s rules, plus your brokerage\'s policy.' },
      { h: 'Confirm scope and price', b: 'Call or email StageLiora with the room list, the number of photos and the edits you need. Scope and cost are agreed before any work starts, and the way to share photos is agreed with you. There is no upload on this site.' },
      { h: 'Keep the originals', b: 'Store the untouched files separately. You need them to check the edits and to answer questions later.' },
      { h: 'Review every edited image against its original', b: 'Use the checklist above. Raise anything that changed and should not have before the image is used.' },
      { h: 'Disclose, then publish', b: 'Complete the three Stellar steps, carry the same care to your website, flyers and social posts, and tell showing agents which rooms are empty.' },
    ],
  },

  faqs: [
    { q: 'Should I stage every empty room in a listing?', a: 'Usually not. Stage the rooms buyers look at first and the rooms that are hardest to read without furniture, then stop. A listing can mix staged and unstaged photos; in Stellar, each staged photo gets its own "Virtually staged" description.' },
    { q: 'Can I use virtual staging while the sellers still live in the home?', a: 'Yes. Stellar permits removing existing furniture and replacing it digitally. The extra step is agreeing what conveys and what is permanent before editing, so nothing that stays with the house disappears from the photo.' },
    { q: 'How is virtual staging different from a renovation visualization?', a: 'Virtual staging changes only movable things: furniture, rugs, art and decor. A renovation visualization changes the house itself, such as paint, flooring or cabinets. It can help a buyer plan, but it does not show the home as it is, so in Stellar it cannot be used as a listing photo.' },
    { q: 'Do I need the photographer\'s permission to have listing photos staged?', a: 'If you did not take the photos, check the license. Many photographers keep the copyright and license the images for listing use only. Ask for written permission that covers editing by a third party. If you took the photos yourself, this question does not arise.' },
    { q: 'Can a staged photo replace the original everywhere?', a: 'It can stand in the listing with the required disclosure, but it should never replace the original as your record. Keep every original. Stellar\'s article does not require posting the unstaged version, though having it on hand at showings helps buyers who arrive at an empty house.' },
    { q: 'Is it worth showing one room in two styles in the listing?', a: 'Rarely. Buyers scrolling the listing see the same room twice, and each version is another photo to pay for and disclose. Choose one style for the home and keep alternatives for a seller conversation or a separate marketing piece.' },
    { q: 'What should I check before sending staged photos to my brokerage?', a: 'That every original is saved, you have permission to edit each photo, nothing permanent or defective has changed, the furniture is to scale, and there are no words or logos on the images. Then check whether your brokerage has its own policy on altered photos.' },
    { q: 'Will virtual staging make my listing sell faster?', a: 'Nobody can promise that. In NAR\'s 2025 survey, 49% of sellers\' agents said staging reduced time on market, but that reflects agents\' opinions about staging in general, not virtual staging. Your own inquiry and showing numbers are better evidence.' },
  ],

  cta: {
    h: 'Have a Listing in Mind?',
    p: 'Tell StageLiora which rooms you are considering and how many photos you have. Scope and price are agreed before any work starts.',
  },
};
