/**
 * Copy for /portfolio/ (V19, consolidated in V21). The owner folded the Design Styles hub, the four style pages and
 * the Design Library into the Portfolio and retired those routes (src/data/retired-routes.ts). The page answers three
 * questions in order:
 *   Before and after   What does staging change, and what does it leave alone?   (portfolioPage)
 *   Room designs       What does a style look like in this room?                  (roomDesigns, filterable)
 *   Choose your style  Which style suits this house?                              (styleGuide)
 * V21 merged "Choosing a style" and "Styles compared" into one section. Each style now has a single entry: the old
 * table columns (mood, signature materials, sits well with, use with care) and the four retired style-page notes were
 * folded into mood, summary, lookFor and care, so no fact about a style is stated twice.
 * Image-specific wording lives in image-notes.ts, bound to the files it describes.
 */
import type { RoomId, StyleId } from './taxonomy.ts';

/** One style, compared on the same four points: mood, materials (summary), features it suits, when to take care. */
export interface StyleGuideEntry { id: StyleId; mood: string; summary: string; lookFor: string; care: string }

export const styleGuide = {
  head: { eyebrow: 'Choose your style', h: 'Choose a style for the house, not the moodboard', p: 'A staging style works when it looks as if it belongs to the architecture in the photo. Start with the kind of listing you have, check what the photo already shows, then compare the eight directions and see them in the room designs below.' },
  situationsHead: { eyebrow: 'Common listings', h: 'What kind of listing is it?', p: 'Starting points, not rules. The rooms in your own photos have the final say.' },
  situations: [
    { photo: 'A condo with floor-to-ceiling glass and plain walls', styles: ['modern', 'contemporary'], why: 'Low, simple furniture keeps the windows as the main feature.' },
    { photo: 'An older bungalow with original wood windows and painted trim', styles: ['scandinavian', 'transitional', 'farmhouse'], why: 'Lighter, familiar shapes respect the period without making it look dated.' },
    { photo: 'A renovated home with arches, curved walls and warm white oak', styles: ['contemporary'], why: 'Curved furniture repeats the shapes already built into the rooms.' },
    { photo: 'A converted loft with brick, ducts or steel beams', styles: ['industrial', 'modern'], why: 'Leather, steel and dark wood match materials the buyer can already see.' },
    { photo: 'A home with crown molding, a formal dining room and a mantel', styles: ['traditional', 'transitional'], why: 'Defined rooms and classic detail suit balanced, classic furniture.' },
    { photo: 'A bright home with white trim and a covered porch', styles: ['coastal', 'scandinavian'], why: 'Light woods and natural fibers carry the brightness from room to room.' },
  ] as { photo: string; styles: StyleId[]; why: string }[],
  cuesHead: { eyebrow: 'Before you choose', h: 'Then check what the photo already shows', p: 'Staging adds furniture and decor. Everything else in the frame stays, so let the fixed parts of the room narrow the choice.' },
  cues: [
    { h: 'Read the fixed features', b: 'Trim, doors, ceiling details and window frames set the period of a room. Wood beams and shiplap point one way; arches and curved walls point another. Choose furniture that belongs with them.' },
    { h: 'Match the finishes that stay', b: 'Floor tone, cabinet color and metal finishes remain in every photo. A style whose woods and metals sit comfortably beside them looks settled rather than added.' },
    { h: 'Account for the light', b: 'Bright rooms carry pale palettes well. Rooms with less daylight usually photograph better with mid-tone woods and deeper fabrics that keep their shape on screen.' },
    { h: 'Picture who will tour it', b: 'A downsizer, a young family and someone relocating for work notice different things. Pick a direction your likely buyer would recognize as a home they could live in.' },
  ],
  entriesHead: { eyebrow: 'Eight directions', h: 'The eight directions compared', p: 'Each card answers the same questions, so the styles can be read side by side: the mood, the materials, the features a style suits, and when to use it with care.' },
  entries: [
    { id: 'modern', mood: 'Calm, graphic, uncluttered', summary: 'Straight lines and low furniture in charcoal upholstery, black metal and walnut, with one strong piece of art and a single accent color. Clear surfaces let the room\'s shape do the work and help a compact room feel uncluttered.', lookFor: 'Flat ceilings, plain drywall, flush doors, simple trim, large plain or black-framed windows, and pale or mid-tone floors.', care: 'The house has ornate trim, arched openings or heavy moldings that squared furniture would fight against. Keep the scale true as well: sparse or undersized pieces can make a room look unfinished or misstate its size.' },
    { id: 'scandinavian', mood: 'Bright, soft, quiet', summary: 'Pale oak, oatmeal fabric, wool and paper shades, with rounded, light-legged pieces kept sparse so daylight carries the room. A natural fit for small bedrooms and home offices.', lookFor: 'Several windows with white frames, white or light walls, and light oak or painted floors.', care: 'Floors are very dark or strongly orange-toned, so pale furniture seems to float on top of them. In a dim room, correct the exposure first so the pale palette does not wash out.' },
    { id: 'farmhouse', mood: 'Warm, sturdy, informal', summary: 'Substantial reclaimed-look wood, linen slipcovers and iron details, softened with baskets and greenery for a relaxed, family feel.', lookFor: 'Wood beams, shiplap, apron sinks, larger kitchens, porches, and warm-toned plank or hardwood floors.', care: 'Every room gets the same rustic accessories, or the home is a sleek high-rise. Across a full listing, the repetition reads as a theme rather than a home.' },
    { id: 'contemporary', mood: 'Soft, current, polished', summary: 'Soft curves, boucle and layered cream tones, finished with brushed brass and smoked glass.', lookFor: 'A recent renovation, arched openings, curved walls, warm white oak, statement light fixtures or large black-framed windows.', care: 'Rooms are small and boxy, since generous curved pieces need space around them. Very specific trends also date quickly and can pull attention away from the home.' },
    { id: 'industrial', mood: 'Robust, urban, moody', summary: 'Cognac leather, blackened steel and dark wood, with dome pendants and open metal shelving.', lookFor: 'Exposed brick, ductwork, concrete ceilings, steel beams, tall steel-grid windows or wide-plank floors.', care: 'The room is small or short on daylight. Dark leather and steel can make it look heavier and smaller in a photo.' },
    { id: 'traditional', mood: 'Formal, settled, symmetrical', summary: 'Classic proportions in cherry and mahogany, navy upholstery, brass lamps and patterned rugs, arranged in balanced pairs.', lookFor: 'Crown molding, wainscoting, paneled doors, double-hung windows, a fireplace with a mantel, and cherry-toned floors.', care: 'The plan is open with low ceilings. Formal pairs and heavy wood need defined rooms to make sense.' },
    { id: 'coastal', mood: 'Light, relaxed, breezy', summary: 'Rattan, jute and whitewashed wood with sea-glass and white fabrics, kept light and relaxed.', lookFor: 'Light floors, white trim, painted doors, bright rooms, and covered porches or other outdoor living space.', care: 'Nautical accessories pile up. Shells and stripes in every room pull attention away from the architecture.' },
    { id: 'transitional', mood: 'Neutral, comfortable, broad', summary: 'Greige upholstery, mid-tone oak, pewter and simple classic shapes: traditional comfort without the ornament.', lookFor: 'Neutral walls, oak floors and simple molding, or mixed features such as crown molding with updated lighting.', care: 'The house has a strong character of its own, such as a loft or a mid-century home, where a neutral look can feel generic.' },
  ] as StyleGuideEntry[],
  confusedHead: { eyebrow: 'Telling them apart', h: 'Four pairs that are easy to mix up' },
  confused: [
    { a: 'modern', b: 'contemporary', body: 'Modern names a fixed design era; contemporary means whatever feels current, so its shapes keep changing. Look at the edges. Modern furniture is straight and squared, usually charcoal, black metal and walnut. Contemporary pieces curve, and lean on cream boucle, brass and smoked glass. Both keep surfaces clear.' },
    { a: 'traditional', b: 'transitional', body: 'Both use classic shapes. Traditional adds carved wood, navy and brass, and arranges pieces in matching pairs. Transitional keeps the shapes but drops the ornament, with greige fabric and mid-tone oak.' },
    { a: 'scandinavian', b: 'coastal', body: 'Both are light and airy. Scandinavian stays with pale oak, wool and paper shades. Coastal brings in rattan, jute and blue-green sea-glass tones.' },
    { a: 'farmhouse', b: 'industrial', body: 'Both use dark iron and solid wood. Farmhouse softens them with linen slipcovers, baskets and greenery; industrial pairs them with leather and exposed structure.' },
  ] as { a: StyleId; b: StyleId; body: string }[],
  faqs: [
    { q: 'Can one listing mix two styles?', a: 'Neighboring styles can sit together without looking odd, such as transitional with traditional, or Scandinavian with coastal. Distant ones, like industrial in one room and farmhouse in the next, make the photos read like different houses. Choose one main direction and let small details vary by room.' },
    { q: 'Which style suits a home when the buyer is hard to predict?', a: 'Transitional is the least specific of the eight, with Scandinavian close behind. Both use neutral colors and familiar shapes that few people object to. The architecture should still lead: a transitional living room looks out of place in a brick loft.' },
    { q: 'Does a home in Florida need coastal staging?', a: 'No. Coastal suits homes with light floors, white trim and bright rooms, wherever they are. A ranch home with dark tile or a downtown condo may look more convincing in transitional, modern or contemporary. Location is one clue among several.' },
    { q: 'Should the style follow the age of the home or current trends?', a: 'Follow the fixed features first. A current look suits an older home only where its finishes have been updated; otherwise very current furniture can make the original kitchen or bath look older by comparison.' },
    { q: 'How do I tell StageLiora which style I want?', a: 'Choose Ask About This Style on a style card, a before-and-after pair or an enlarged room design. The contact form opens with that style, and the room when there is one, already filled in. Not sure yet? Describe the house and the people you expect to buy it, and ask for a suggestion.' },
  ],
};

export const roomDesigns = {
  head: { eyebrow: 'Room designs', h: 'Browse design directions by style and room' },
  /** Narrow screens show this many designs first, with a button for the rest (site.ts). */
  firstBatch: 8,
  lede: (designs: number, rooms: number) => `Picture a direction in the type of room you are listing. ${designs} designs across eight styles and ${rooms} room types: filter by room and style, then open one to see it full size or ask about it.`,
  howTo: [
    { h: 'Pick the room', b: 'Start with the room type you are listing. Living rooms appear in all eight styles; outdoor spaces in fewer.' },
    { h: 'Compare directions', b: 'Open an image to see it full size. Notice how the palette, wood tones and furniture shapes change from one style to the next.' },
    { h: 'Ask about the one you like', b: 'In the enlarged view, choose Ask About This Style. The contact form opens with the style and room filled in, so you only add the details, such as a wood tone, a fabric or a rug.' },
  ],
  readingHead: { eyebrow: 'Using an image well', h: 'What a room design can and cannot tell you' },
  canTell: ['The palette and wood tones of a style', 'Typical furniture shapes and how much sits on surfaces', 'How a style dresses a particular type of room', 'The overall mood a direction gives a space'],
  cannotTell: [
    'How furniture will fit your room. Staging for your photo is fitted to your own room\'s size, layout and light',
    'Whether a style suits your home\'s architecture',
    'Exact products, brands or sources. You can point to a piece as a reference, but these designs are not a product catalog',
    'Anything about your own walls, windows or floors, since each image shows a different room',
  ],
  coverageHead: { eyebrow: 'Coverage', h: 'Rooms and styles covered', p: 'Which directions are shown for each room type.' },
  faqs: [
    { q: 'Why do some style and room combinations show no designs?', a: 'Not every combination has been designed. Some were left out because the pairing is uncommon, such as industrial furniture on a porch. Clear the filters, or try a neighboring style, to see what is there.' },
    { q: 'Why are patios, porches and decks included?', a: 'Outdoor living areas are often photographed empty, and furniture helps show how they can be used. The outdoor designs show movable furniture, rugs and planters. Stellar MLS limits exterior staging in listing photos to unattached furniture and decor; the Florida disclosure guide covers the rules.' },
  ],
};

export interface PortfolioStory { key: string; room: RoomId; before: string; added: string; unchanged: string; afterSrc: string }

/**
 * Each explanation was written by comparing the two image files named by its pair. `afterSrc` binds it to the
 * after file; if that file changes, the page shows only the room and style until the text is rechecked.
 */
const story = (room: RoomId, before: string, added: string, unchanged: string): PortfolioStory =>
  ({ key: `pf-${room}`, room, before, added, unchanged, afterSrc: `/media/generated/virtual-staging-portfolio-${room}-after.webp` });

export const portfolioPage = {
  h1: 'Virtual staging portfolio: before and after, room designs and styles',
  lede: (designs: number) => `See what virtual staging changes in an empty room, find the style that suits your listing, then picture it room by room in ${designs} designs. Furniture and decor are added; the room itself stays as it was.`,
  nav: [
    { id: 'before-after', label: 'Before and after' },
    { id: 'styles', label: 'Choose your style' },
    { id: 'room-designs', label: 'Room designs' },
    { id: 'faq', label: 'Questions' },
  ],
  pairsHead: { eyebrow: 'Before and after', h: 'Six rooms, before and after staging', p: 'Drag the divider to compare. Each pair is the same frame before and after furniture and decor were added.' },
  /** Section-level note on where the images come from (no per-image labels; About #images has the detail). */
  sampleNote: { p: 'These six rooms are sample images created to demonstrate the method. They are not client projects or photos of real listings.', link: 'How these images were made' },
  introHead: { eyebrow: 'Reading a comparison', h: 'What to check in each pair', p: 'The camera position, daylight and view stay put, so any difference should be something that was added. Check these four things.' },
  checks: [
    { h: 'Walls, ceiling and trim', b: 'Same color, same beams and moldings, same ceiling lights.' },
    { h: 'Windows, doors and the view', b: 'Same size and position, with the same scene outside.' },
    { h: 'Floors and built-in features', b: 'Flooring, cabinets, appliances and fixed lighting unchanged.' },
    { h: 'Scale and walkways', b: 'Furniture sized to the room, with doorways and paths left clear.' },
  ],
  /** Shown right after the pairs, where a visitor has just seen the result. Links to the existing inquiry form. */
  pairsCta: { h: 'Have a vacant listing? Ask us about your rooms.', p: 'Tell us which rooms are empty and what the house is like. We answer questions and style preferences by email.', label: 'Ask About Your Rooms', styles: 'Not sure which style fits? Explore the style guide' },
  /** Final call to action, after the questions. The CTA band adds the bookings note while bookings are closed. */
  finalCta: { h: 'Know the style you want? Tell us about the listing.', p: 'Name the direction you have in mind, or describe the house and who you expect to buy it, and ask what would suit it.' },
  stories: [
    story('living-room', 'An open living area with a whitewashed, beamed ceiling, a sea-glass front door, tall windows onto a porch and an open kitchen to one side.', 'A cream slipcovered sectional, two rattan armchairs, a whitewashed coffee table with woven baskets, a jute rug, rattan side tables, a table lamp and a potted palm.', 'The beams, door, windows, kitchen cabinets and oak floor. The seating sits clear of the front door and the kitchen opening.'),
    story('primary-bedroom', 'A bedroom with walnut doors, an open en suite, recessed lights and a wide black-framed window looking onto trees.', 'A low charcoal upholstered bed, walnut nightstands with black lamps, a walnut dresser on a steel base, a large landscape print and a textured rug.', 'The doors, en suite, window, view and wood floor. The bed sits under the window, leaving the doorway open.'),
    story('guest-bedroom', 'A bedroom with crown molding, a brass ceiling light, a white paneled door and two double-hung windows over cherry-toned hardwood.', 'A carved cherry bed with navy bedding, a navy bench with nailhead trim, matching nightstands with brass lamps, a cherry chest, framed art and a patterned rug.', 'The molding, ceiling light, windows, door and floor. The bed is centered between the two windows.'),
    story('dining-room', 'A dining room with a curved wall, an arched opening to the kitchen, a lit tray ceiling, a glass-and-brass pendant and corner windows onto a garden.', 'A round smoked-glass table on a brass pedestal, five curved boucle chairs, a layered organic rug, abstract art and a potted olive tree.', 'The curved wall, arch, ceiling, pendant, windows and French door. The table is centered under the existing pendant.'),
    story('home-office', 'A loft room with exposed steel beams, a concrete ceiling, brick walls, tall steel-grid windows and a glass-paneled door.', 'A dark wood desk on a steel frame, a cognac leather desk chair, two cognac leather armchairs, a metal cabinet, a tripod floor lamp, a desk lamp and a large landscape painting.', 'The beams, ceiling, brick, windows, door and plank floor. The furniture stays out of the door\'s swing.'),
    story('kitchen', 'A kitchen and dining space with flat-front pale oak cabinets, a built-in oven, two oak-framed windows onto a garden and a wood side door with a narrow glass panel.', 'An oak dining table with spindle-back chairs, three oak counter stools, a cream rug and a few small items on the counter.', 'The cabinets, oven, counters, windows, side door and floor. The table stands in the open area, leaving the kitchen clear.'),
  ],
  faqs: [
    { q: 'Why is each room shown in a different style?', a: 'So that six rooms cover six of the eight design directions. A real listing is usually staged in one direction throughout; Choose your style, right after the comparisons, explains how to pick it.' },
    { q: 'Can an occupied room be shown this way?', a: 'Yes, with an extra step. These six start from empty rooms. An occupied room has its belongings removed first and is then staged, which is a separate service.' },
    { q: 'Can I use these images to market my own listing?', a: 'No. They do not show your property. Listing photos should show the actual home, with any virtual staging disclosed as your MLS requires.' },
    { q: 'Why are some lamps switched on after staging?', a: 'Lamps are part of the furniture being added, so they can be shown lit. Daylight, ceiling fixtures and recessed lights stay as they were in the empty frame.' },
  ],
  /** Grouped questions for the single FAQ section: before-and-after, room designs, then styles. */
  faqGroups: { pairs: 'About the before-and-after comparisons', designs: 'Using the room designs', styles: 'Choosing a staging style' },
  related: [
    { href: '/services/furniture-removal-and-staging/', label: 'Furniture removal and staging for occupied rooms' },
    { href: '/how-it-works/', label: 'How a staging project works' },
    { href: '/guides/how-to-prepare-photos-for-virtual-staging/', label: 'How to prepare photos for virtual staging' },
    { href: '/guides/virtual-staging-disclosure-florida/', label: 'Virtual staging disclosure in Florida' },
  ],
};
