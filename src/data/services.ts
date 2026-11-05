/**
 * Service records. A page existing here is not approval to sell the service (DEC-008, DEC-020).
 * MLS notes summarize Stellar MLS Article 04.04 and the Stellar photo rules page, read 2026-11-05.
 */
import { approvals } from './approvals.ts';

export type StellarListingUse = 'permitted-with-disclosure' | 'conditional' | 'not-for-listing-photos' | 'not-addressed';
export type Track = 'listing-editing' | 'concept-visualization';
export type Tier = 'proposed-launch' | 'proposed-later' | 'gated-concept';

export interface Service {
  slug: string;
  path: string;
  name: string;
  short: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  track: Track;
  tier: Tier;
  pairKey: string;
  audience: string[];
  goodPhotos: string[];
  includes: string[];
  excludes: string[];
  steps: string[];
  stellar: { use: StellarListingUse; label: string; detail: string; source: string };
  faqs: { q: string; a: string }[];
  related: string[];
}

const A404 = 'Stellar MLS Article 04.04';
const PR = 'Stellar MLS photo rules page';

export const services: Service[] = [
  {
    slug: 'virtual-staging', path: '/services/virtual-staging/', name: 'Virtual Staging', short: 'Add furniture and decor to a photo of an empty room.',
    title: 'Virtual Staging for Listing Photos | StageLiora',
    description: 'Add furniture and decor to photos of empty rooms so buyers can read scale and use. Scope, limits, Stellar MLS disclosure notes and quote requests.',
    h1: 'Virtual staging that keeps the room honest',
    intro: 'An empty room photographs as a box. Adding furniture and decor gives buyers a sense of scale and shows how the space could be used, while the walls, windows, floors and fixtures stay exactly as they are.',
    track: 'listing-editing', tier: 'proposed-launch', pairKey: 'svc-virtual-staging',
    audience: ['Listing agents with vacant homes', 'Sellers who have already moved out', 'Teams marketing several empty units'],
    goodPhotos: ['Empty rooms shot level and from a corner or doorway', 'Enough visible floor to place furniture convincingly', 'Natural exposure, with window detail intact if possible'],
    includes: ['Furniture, rugs, lamps, wall art, plants and decor', 'A room type and optional design style you choose', 'Furniture sized to the visible room'],
    excludes: ['Changes to walls, floors, ceilings, windows or doors', 'Adding or altering permanent fixtures', 'Hiding damage or defects', 'Altered views or surroundings'],
    steps: ['You send the photo with the room type and any style preference.', 'The photo is checked for angle, light and usable floor area.', 'Furniture and decor are placed to the scale of the room.', 'You review the image and the unaltered original together.'],
    stellar: { use: 'permitted-with-disclosure', label: 'Permitted, with required disclosure', source: A404, detail: 'Article 04.04 permits adding furniture, mirrors, artwork and plants to a room photo. It requires "Virtually staged" in the photo description, the virtually staged field checked, and public remarks that begin "One or more photo(s) was virtually staged." It does not allow virtual staging on pre-construction or under-construction properties.' },
    faqs: [
      { q: 'Can furniture make a small room look bigger?', a: 'It should not. Stellar prohibits distorting the dimensions of a room, and gives undersized furniture as its example. Furniture should match the actual size of the space.' },
      { q: 'Can you stage a home that is still under construction?', a: 'Not for use in Stellar MLS listing photos. Article 04.04 says virtual staging shall not be used for pre-construction and under-construction properties.' },
      { q: 'Can a patio be staged?', a: 'Stellar allows exterior photos to show added unattached furniture or decor only. Nothing attached or permanent may change.' },
    ],
    related: ['furniture-removal-and-staging', 'photo-enhancement', 'day-to-dusk'],
  },
  {
    slug: 'furniture-removal-and-staging', path: '/services/furniture-removal-and-staging/', name: 'Furniture Removal & Staging', short: 'Replace movable furniture and clutter with new staging.',
    title: 'Furniture Removal and Virtual Staging | StageLiora',
    description: 'Replace dated movable furniture and clutter in an occupied home with new virtual staging. What can be removed, what must stay, and Stellar MLS notes.',
    h1: 'Clear the furniture. Keep the facts.',
    intro: 'Occupied homes often photograph smaller and busier than they are. This service removes movable belongings from the photo and restages the room, so buyers see the space and not the current owner\'s furniture.',
    track: 'listing-editing', tier: 'proposed-launch', pairKey: 'svc-furniture-removal',
    audience: ['Agents listing occupied homes', 'Sellers who cannot move furniture before photos', 'Rooms with dated or oversized pieces'],
    goodPhotos: ['Rooms where the floor and wall behind the furniture can be reasonably inferred', 'Photos taken after clutter is picked up, where possible', 'Notes listing anything that conveys with the sale'],
    includes: ['Removing movable furniture and belongings', 'Rebuilding floor and wall areas from what is visible', 'Staging the cleared room'],
    excludes: ['Removing stains, holes, damaged floors or exposed wiring', 'Removing permanent fixtures or built-ins', 'Removing utility lines or anything outside the property', 'Inventing a floor or wall condition that cannot be seen'],
    steps: ['You send the photo and mark what stays and what goes.', 'Each marked item is checked to confirm it is movable.', 'The room is cleared and restaged at true scale.', 'You review the result beside the unaltered original.'],
    stellar: { use: 'permitted-with-disclosure', label: 'Permitted, with limits', source: A404, detail: 'Article 04.04 permits removing existing furniture and replacing it with digital furniture and decor. It prohibits removing negative elements such as holes in a wall, exposed wiring or damaged flooring, and prohibits altering permanent fixtures. The same disclosure steps apply.' },
    faqs: [
      { q: 'Can you remove a stain or a crack while the furniture is out?', a: 'No. Stellar specifically prohibits removing negative visual elements, and hiding a defect would misrepresent the property in any market.' },
      { q: 'Is the built-in shelving movable?', a: 'Usually not. If it is attached to the home, treat it as a permanent fixture that has to stay in the photo.' },
      { q: 'Can items just be removed, with no new furniture?', a: 'Stellar\'s permitted use describes removal paired with digital replacement. Ask your MLS before relying on removal alone for a listing photo.' },
    ],
    related: ['virtual-staging', 'photo-enhancement', 'interior-color-changes'],
  },
  {
    slug: 'interior-color-changes', path: '/services/interior-color-changes/', name: 'Interior Color Changes', short: 'Concept images of new wall, trim or cabinet color.',
    title: 'Interior Color Visualization Concepts | StageLiora',
    description: 'Concept images showing possible wall, trim or cabinet colors, for renovation planning. Stellar MLS says listing photos cannot change paint colors.',
    h1: 'See the color before anyone opens a can',
    intro: 'A color concept helps a seller, buyer or contractor talk about a repaint with a picture in front of them. It is a planning image. It is not a photo of the property as it stands today.',
    track: 'concept-visualization', tier: 'gated-concept', pairKey: 'svc-interior-color',
    audience: ['Sellers deciding whether to repaint before listing', 'Agents advising on pre-listing improvements', 'Buyers planning changes after closing'],
    goodPhotos: ['Even light with minimal color cast', 'Clear edges between walls, trim and cabinets', 'A note of the colors to compare'],
    includes: ['Concept color on walls, trim or cabinets', 'Matched light and shadow on the new color'],
    excludes: ['Use as a Stellar MLS listing photo', 'Any claim that the home has been painted', 'Color matching to a specific paint product'],
    steps: ['You describe the decision the image needs to support.', 'You confirm the intended use, and that it is not a listing photo.', 'The concept color is applied to the areas you selected.', 'The image is delivered and clearly identified as a concept.'],
    stellar: { use: 'not-for-listing-photos', label: 'Not for Stellar listing photos', source: PR, detail: 'The Stellar photo rules list "Change paint colors" under interior items you cannot do. Article 04.04 also prohibits altering permanent fixtures, which would reach cabinets.' },
    faqs: [
      { q: 'Could I show this image to a buyer?', a: 'Only if it is plainly presented as a concept and not as the home\'s condition. Check with your broker before using it in any marketing.' },
      { q: 'What if the home is really being repainted?', a: 'Photograph it after the work is done. Stellar\'s rules do not list an exception for planned paint.' },
    ],
    related: ['flooring-visualization', 'ceiling-visualization', 'virtual-staging'],
  },
  {
    slug: 'flooring-visualization', path: '/services/flooring-visualization/', name: 'Flooring Visualization', short: 'Concept images of a different floor material.',
    title: 'Flooring Visualization Concepts | StageLiora',
    description: 'Concept images comparing flooring options for renovation planning. Not a way to hide worn floors in a listing. Stellar MLS notes and limits explained.',
    h1: 'Compare floors without pulling a single board',
    intro: 'Flooring changes the whole read of a room, and it is expensive to get wrong. A concept image lets people compare a material in the actual room before committing.',
    track: 'concept-visualization', tier: 'gated-concept', pairKey: 'svc-flooring',
    audience: ['Sellers pricing a pre-listing flooring project', 'Buyers planning a renovation', 'Contractors presenting options to a client'],
    goodPhotos: ['A wide view with most of the floor visible', 'Little furniture covering the floor', 'A note of the material to compare'],
    includes: ['A concept floor material in the existing room', 'Plank or tile direction matched to the room perspective'],
    excludes: ['Hiding damaged flooring in a listing photo', 'Use as a statement of the home\'s current condition', 'Measurement or product quantities'],
    steps: ['You describe the materials you want to compare.', 'You confirm the intended use.', 'The concept floor is applied and matched to the light in the room.', 'The image is delivered and identified as a concept.'],
    stellar: { use: 'not-for-listing-photos', label: 'Treat as not for Stellar listing photos', source: A404, detail: 'Neither Stellar page has a line on new flooring as such. Article 04.04 does name "damaged flooring" as a negative element that may not be removed, and requires photos to present a true and accurate picture of property features. StageLiora treats floor changes as concepts unless Stellar confirms otherwise for a specific use.' },
    faqs: [
      { q: 'Is there a rule that says flooring changes are banned?', a: 'Stellar\'s pages do not address replacing flooring by name. The true-picture requirement and the damaged-flooring example are why this is treated as a concept service. Ask Stellar compliance about your own case.' },
      { q: 'Can this cover up a worn floor?', a: 'Not in a listing. Removing damaged flooring from a listing photo is one of Stellar\'s own examples of what is prohibited.' },
    ],
    related: ['interior-color-changes', 'ceiling-visualization', 'virtual-staging'],
  },
  {
    slug: 'ceiling-visualization', path: '/services/ceiling-visualization/', name: 'Ceiling Visualization', short: 'Concept images of ceiling finishes or beams.',
    title: 'Ceiling Visualization Concepts | StageLiora',
    description: 'Concept images of ceiling finishes and beams for renovation planning. Stellar MLS does not address ceilings by name, so this stays a concept service.',
    h1: 'Look up, and picture what could change',
    intro: 'Painted popcorn, wood planks or exposed beams can change how a room feels. A concept image shows the idea in the real room, so the conversation with a seller or contractor starts from something concrete.',
    track: 'concept-visualization', tier: 'gated-concept', pairKey: 'svc-ceiling',
    audience: ['Owners planning a remodel', 'Agents discussing pre-listing work', 'Contractors presenting ideas'],
    goodPhotos: ['A wide view that shows the ceiling plane', 'Visible edges where the ceiling meets the walls', 'A note on lights and vents that have to stay'],
    includes: ['A concept finish, color or beam layout', 'Existing lights and vents kept in place'],
    excludes: ['Use as a statement of the home\'s current condition', 'Structural advice or engineering', 'Hiding ceiling stains or damage'],
    steps: ['You describe the finish you are considering.', 'You confirm the intended use.', 'The concept is applied and matched to the room.', 'The image is delivered and identified as a concept.'],
    stellar: { use: 'not-addressed', label: 'Not addressed by name; treat as concept only', source: A404, detail: 'Neither Stellar page mentions ceilings. Article 04.04 still prohibits altering permanent fixtures and requires a true and accurate picture of property features, so a changed ceiling should not be presented as the existing home.' },
    faqs: [
      { q: 'Could this hide a water stain?', a: 'No. A concept should never be used to conceal damage, and Stellar prohibits excluding negative elements from listing photos.' },
      { q: 'Does this tell me whether beams can be added?', a: 'No. It shows appearance only. Whether the work is possible is a question for a licensed contractor.' },
    ],
    related: ['interior-color-changes', 'flooring-visualization', 'photo-enhancement'],
  },
  {
    slug: 'exterior-color-visualization', path: '/services/exterior-color-visualization/', name: 'Exterior Color Visualization', short: 'Concept images of new exterior paint, trim or door color.',
    title: 'Exterior Color Visualization Concepts | StageLiora',
    description: 'Concept images of exterior wall, trim or door colors for planning a repaint. Stellar MLS limits exterior edits, so these are not listing photos.',
    h1: 'Try a new front door color on paper first',
    intro: 'Exterior color is a big, visible decision, and sometimes one that needs a neighbor or an association to agree. A concept image makes that conversation easier. It does not describe the house as it is today.',
    track: 'concept-visualization', tier: 'gated-concept', pairKey: 'svc-exterior-color',
    audience: ['Owners comparing repaint options', 'Sellers weighing curb-appeal work', 'Owners preparing a request to a homeowners association'],
    goodPhotos: ['Straight-on view of the facade in even daylight', 'Nothing parked in front of the walls being changed', 'A note of which surfaces change'],
    includes: ['Concept color on walls, trim or door', 'Existing shape and materials retained'],
    excludes: ['Use as a Stellar MLS listing photo', 'Changing the roof, windows or structure', 'Changing neighboring property'],
    steps: ['You choose the surfaces and colors to compare.', 'You confirm the intended use.', 'The concept color is applied and matched to daylight.', 'The image is delivered and identified as a concept.'],
    stellar: { use: 'not-for-listing-photos', label: 'Not for Stellar listing photos', source: A404, detail: 'Article 04.04 prohibits virtually staging exterior photos except for unattached furniture or decor, and prohibits altering permanent fixtures on the exterior. All photos must be a true and accurate picture of property features and surroundings.' },
    faqs: [
      { q: 'Does this replace a homeowners association approval?', a: 'No. It can support a request, and your association still decides.' },
      { q: 'Can I use it as the main listing photo?', a: 'Not in Stellar MLS. The exterior rules above apply to property photos submitted to the service.' },
    ],
    related: ['landscaping-visualization', 'day-to-dusk', 'interior-color-changes'],
  },
  {
    slug: 'landscaping-visualization', path: '/services/landscaping-visualization/', name: 'Landscaping Visualization', short: 'Concept images of planting and yard ideas.',
    title: 'Landscaping Visualization Concepts | StageLiora',
    description: 'Concept images of planting and yard improvements for planning. Stellar MLS says listing photos cannot add landscape plantings. Limits explained.',
    h1: 'Plan the yard before the first plant goes in',
    intro: 'A landscaping concept helps people judge a planting idea from the street. It is a plan in picture form, and it should never suggest that the plants are already there.',
    track: 'concept-visualization', tier: 'gated-concept', pairKey: 'svc-landscaping',
    audience: ['Owners planning curb-appeal work', 'Sellers deciding what to do before listing', 'Landscapers presenting an idea'],
    goodPhotos: ['A clear view of the yard from the street', 'Taken in daylight with no parked cars in the way', 'A note on what is planned'],
    includes: ['Concept plants and beds', 'A view that keeps the home and boundaries as they are'],
    excludes: ['Use as a Stellar MLS listing photo', 'Hiding utility lines or neighboring structures', 'Plant selection, irrigation or horticultural advice'],
    steps: ['You describe the planned yard work.', 'You confirm the intended use.', 'The concept planting is added to the photo.', 'The image is delivered and identified as a concept.'],
    stellar: { use: 'not-for-listing-photos', label: 'Not for Stellar listing photos', source: PR, detail: 'The Stellar photo rules list "Add landscape plantings" and "Remove utility lines" under exterior items you cannot do, and Article 04.04 bars adding elements outside a property owner\'s control.' },
    faqs: [
      { q: 'What if the landscaping will be done before closing?', a: 'Take the listing photo after the work is finished. Stellar\'s rules do not list an exception for planned planting.' },
      { q: 'Can this remove power lines from the shot?', a: 'No. Stellar lists removing utility lines as something you cannot do.' },
    ],
    related: ['exterior-color-visualization', 'day-to-dusk', 'photo-enhancement'],
  },
  {
    slug: 'day-to-dusk', path: '/services/day-to-dusk/', name: 'Day to Dusk', short: 'Turn a daytime exterior into a twilight look, within limits.',
    title: 'Day to Dusk Photo Editing | StageLiora',
    description: 'Turn a daytime exterior photo into a twilight image, and understand the Stellar MLS conditions on lighting and the true position of the sun.',
    h1: 'A twilight exterior, with the sun where it really sets',
    intro: 'A dusk image can give a listing a stronger first photo. It also has conditions: in Stellar MLS, lighting cannot appear where it does not exist, and the sunset has to match where the sun actually sets.',
    track: 'listing-editing', tier: 'proposed-later', pairKey: 'svc-day-to-dusk',
    audience: ['Listing agents choosing a primary exterior', 'Photographers without a twilight shoot booked', 'Homes with working exterior or interior lights'],
    goodPhotos: ['Clear daytime exterior from the street', 'A note of which way the home faces', 'A note of which lights actually exist and work'],
    includes: ['Sky and overall light adjusted to a twilight look', 'Windows and fixtures lit only where lights really exist'],
    excludes: ['Adding lights that do not exist on the property', 'A sunset in a direction the home cannot face', 'Adding a water view or landmark', 'Removing utility lines'],
    steps: ['You send the photo and the direction the home faces.', 'You note which lights exist.', 'Sky and lighting are adjusted within those limits.', 'You review the result beside the original.'],
    stellar: { use: 'conditional', label: 'Conditional', source: A404, detail: 'Article 04.04 accepts twilight photos "as long as lighting is not added where it does not exist and sunset/sunrise is a true reflection of where the sun rises and sets". Neither page addresses sky replacement by name, and neither says whether a converted image needs the virtually staged disclosure. Confirm this with Stellar compliance for your listing.' },
    faqs: [
      { q: 'Does my home have to face west?', a: 'The sky should reflect where the sun really rises and sets for that home. Tell us the direction it faces, and do not use a sunset that could not happen there.' },
      { q: 'Can you add a Gulf sunset behind the home?', a: 'No. Stellar prohibits adding a Gulf or ocean view that is not physically possible from the location.' },
    ],
    related: ['photo-enhancement', 'virtual-staging', 'exterior-color-visualization'],
  },
  {
    slug: 'photo-enhancement', path: '/services/photo-enhancement/', name: 'Photo Enhancement', short: 'Correct exposure, color and straight lines.',
    title: 'Real Estate Photo Enhancement | StageLiora',
    description: 'Correct underexposed real estate photos with exposure, white balance and straightening that do not change what the property looks like. Limits explained.',
    h1: 'Better light. Same house.',
    intro: 'Enhancement fixes the camera, not the property. It corrects dark rooms, color casts and tilted lines so a phone or point-and-shoot photo shows what you actually saw in the room.',
    track: 'listing-editing', tier: 'proposed-launch', pairKey: 'svc-photo-enhancement',
    audience: ['Agents shooting their own photos', 'Listings with dark interiors', 'Photos with a color cast or tilted verticals'],
    goodPhotos: ['The largest file you have', 'A steady shot, in focus', 'Photos not already heavily filtered'],
    includes: ['Exposure and brightness', 'White balance and color correction', 'Straightening and cropping'],
    excludes: ['Sky replacement', 'Removing objects, fixtures or defects', 'Changing the color of walls, floors or the lawn', 'Adding a view'],
    steps: ['You send the original files.', 'Exposure, color and lines are corrected.', 'The image is checked against the original for truthful color.', 'You receive the corrected image.'],
    stellar: { use: 'permitted-with-disclosure', label: 'Basic brightening is allowed', source: PR, detail: 'The Stellar photo rules list "Brighten underexposed photos" under interior items you can do. Other adjustments are not listed individually. All photos must remain a true and accurate picture of the property. The virtually staged disclosure is written for staging, and Stellar\'s pages do not say it applies to basic corrections.' },
    faqs: [
      { q: 'Will you replace a gray sky?', a: 'Not under this service. Sky changes alter how the property is represented, so they are kept out of basic enhancement.' },
      { q: 'Can you fix a very blurry photo?', a: 'Often not well. Reshooting usually gets a better result than trying to rescue a blurry file.' },
    ],
    related: ['virtual-staging', 'day-to-dusk', 'furniture-removal-and-staging'],
  },
];

export const getService = (slug: string) => {
  const s = services.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown service: ${slug}`);
  return s;
};
export const isServiceApproved = (slug: string) => Boolean(approvals.services[slug]);
export const availabilityLabel = (slug: string) => (isServiceApproved(slug) ? 'Available' : 'Not yet offered: pending owner approval');
export const trackLabel: Record<Track, string> = { 'listing-editing': 'Listing photo edit', 'concept-visualization': 'Concept visualization' };
