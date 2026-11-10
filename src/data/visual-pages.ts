/**
 * Copy for /portfolio/ (V19). The owner folded the Design Styles hub, the four style pages and the Design Library
 * into the Portfolio and retired those routes (src/data/retired-routes.ts). The page answers three questions in order:
 *   Before and after   What does staging change, and what does it leave alone?   (portfolioPage)
 *   Room designs       What does a style look like in this room?                  (roomDesigns, filterable)
 *   Choosing a style   Which style suits this house?                              (styleGuide, styleNotes)
 * Image-specific wording lives in image-notes.ts, bound to the files it describes.
 */
import type { RoomId, StyleId } from './taxonomy.ts';

export interface StyleGuideEntry { id: StyleId; summary: string; lookFor: string; mood: string; signature: string; pairsWith: string; care: string }

/** Extra notes from the retired /design-styles/{style}/ pages (modern, scandinavian, farmhouse, contemporary). */
export interface StyleNote { h: string; intro: string; bestFor: string[]; pieces: string[]; watch: string }
export const styleNotes: Partial<Record<StyleId, StyleNote>> = {
  modern: {
    h: 'Modern: fewer pieces, stronger lines', intro: 'Modern staging relies on low furniture, plain surfaces and a limited palette. It leaves wall and floor visible, which can help a compact room feel uncluttered.',
    bestFor: ['Newer condos and downtown towers', 'Mid-century homes with clean rooflines', 'Rooms with strong windows or a good view that is really there'],
    pieces: ['Low sofa with a slim frame', 'Black metal or dark wood accents', 'One strong piece of art', 'A single accent color'],
    watch: 'Too little furniture can make a room look unfinished, and undersized pieces can misstate its size. Keep the scale true.',
  },
  scandinavian: {
    h: 'Scandinavian: pale wood and borrowed daylight', intro: 'This style uses light woods, soft fabrics and simple forms. It works with the daylight a room already has, which makes it a natural choice for smaller or brighter rooms.',
    bestFor: ['Bungalows with original windows', 'Small bedrooms and home offices', 'Rooms that already get good natural light'],
    pieces: ['Rounded, light-legged seating', 'Pale oak tables and shelving', 'Wool rugs in quiet tones', 'A plant or two'],
    watch: 'In a dark room the pale palette can look washed out. Correct the exposure first, and keep the color truthful.',
  },
  farmhouse: {
    h: 'Farmhouse: sturdy, warm and easy to live in', intro: 'Farmhouse staging uses substantial shapes, natural textures and a little wear in the finishes. It suggests family life, and tends to suit homes with some traditional character.',
    bestFor: ['Older homes with porches and wood details', 'Larger kitchens and dining rooms', 'Single-family homes in established neighborhoods'],
    pieces: ['Slipcovered seating', 'A long wood dining table', 'Iron lighting and hardware', 'Woven baskets and greenery'],
    watch: 'This style can look out of place in a sleek high-rise. Match it to the architecture that is really in the photo.',
  },
  contemporary: {
    h: 'Contemporary: what feels current right now', intro: 'Modern refers to a fixed design era. Contemporary simply means what feels current, so its shapes keep changing. Today that often means soft curves, layered neutrals and mixed metals.',
    bestFor: ['Recently renovated homes', 'Open-plan living and dining rooms', 'Homes where buyers expect a finished, current look'],
    pieces: ['Curved sofas and rounded tables', 'Textured neutral fabrics', 'Brushed brass or smoked glass', 'Layered rugs and lighting'],
    watch: 'Trends date quickly. If a look feels too specific, it may distract from the home. Keep the attention on the room.',
  },
};

export const styleGuide = {
  head: { eyebrow: 'Choosing a style', h: 'Choose a style for the house, not the moodboard', p: 'A staging style works when it looks as if it belongs to the architecture in the photo. Here is how to read a room before choosing, and what each of the eight directions brings to it.' },
  cuesHead: { eyebrow: 'Before you choose', h: 'Start with what the photo already shows', p: 'Staging adds furniture and decor. Everything else in the frame stays, so let the fixed parts of the room narrow the choice.' },
  cues: [
    { h: 'Read the fixed features', b: 'Trim, doors, ceiling details and window frames set the period of a room. Wood beams and shiplap point one way; arches and curved walls point another. Choose furniture that belongs with them.' },
    { h: 'Match the finishes that stay', b: 'Floor tone, cabinet color and metal finishes remain in every photo. A style whose woods and metals sit comfortably beside them looks settled rather than added.' },
    { h: 'Account for the light', b: 'Bright rooms carry pale palettes well. Rooms with less daylight usually photograph better with mid-tone woods and deeper fabrics that keep their shape on screen.' },
    { h: 'Picture who will tour it', b: 'A downsizer, a young family and someone relocating for work notice different things. Pick a direction your likely buyer would recognize as a home they could live in.' },
  ],
  entries: [
    { id: 'modern', summary: 'Straight lines, low furniture and a short list of materials. Surfaces stay mostly clear, so the room\'s shape does a lot of the work.', lookFor: 'Flat ceilings, large plain windows, simple trim and pale or mid-tone floors.', mood: 'Calm, graphic, uncluttered', signature: 'Charcoal upholstery, black metal, walnut', pairsWith: 'Plain drywall, flush doors, black window frames', care: 'The house has ornate trim, arched openings or heavy moldings that squared furniture would fight against.' },
    { id: 'scandinavian', summary: 'Pale oak, oatmeal fabrics and rounded, light-legged pieces, kept sparse so daylight carries the room.', lookFor: 'Several windows, white or light walls, and light wood or painted floors.', mood: 'Bright, soft, quiet', signature: 'Pale oak, oatmeal fabric, wool, paper shades', pairsWith: 'White walls, light oak floors, white window frames', care: 'Floors are very dark or strongly orange-toned, so pale furniture seems to float on top of them.' },
    { id: 'farmhouse', summary: 'Substantial wood pieces, linen slipcovers and iron details, softened with baskets and greenery for a relaxed, family feel.', lookFor: 'Wood beams, shiplap, larger kitchens, porches and warm-toned hardwood.', mood: 'Warm, sturdy, informal', signature: 'Reclaimed-look wood, linen slipcovers, iron', pairsWith: 'Shiplap, ceiling beams, apron sinks, plank floors', care: 'Every room gets the same rustic accessories. Across a full listing, the repetition reads as a theme rather than a home.' },
    { id: 'contemporary', summary: 'Soft curves, boucle and layered cream tones, finished with brushed brass and smoked glass.', lookFor: 'A recent renovation, arched openings, curved walls or large black-framed windows.', mood: 'Soft, current, polished', signature: 'Boucle, brushed brass, smoked glass', pairsWith: 'Arches, curved walls, warm white oak, statement light fixtures', care: 'Rooms are small and boxy. Generous curved pieces need space around them and can crowd a compact room.' },
    { id: 'industrial', summary: 'Cognac leather, blackened steel and dark wood, with dome pendants and open metal shelving.', lookFor: 'Exposed brick, ductwork, concrete, steel beams or tall grid windows.', mood: 'Robust, urban, moody', signature: 'Cognac leather, blackened steel, dark wood', pairsWith: 'Brick, concrete ceilings, steel-grid windows, wide planks', care: 'The room is small or short on daylight. Dark leather and steel can make it look heavier and smaller in a photo.' },
    { id: 'traditional', summary: 'Classic proportions in cherry and mahogany, navy upholstery, brass lamps and patterned rugs, arranged in balanced pairs.', lookFor: 'Crown molding, paneled doors, double-hung windows and a fireplace with a mantel.', mood: 'Formal, settled, symmetrical', signature: 'Cherry wood, navy fabric, brass, patterned rugs', pairsWith: 'Crown molding, wainscoting, mantels, cherry-toned floors', care: 'The plan is open with low ceilings. Formal pairs and heavy wood need defined rooms to make sense.' },
    { id: 'coastal', summary: 'Rattan, jute and whitewashed wood with sea-glass and white fabrics, kept light and relaxed.', lookFor: 'Light floors, white trim, bright rooms, and porches or other outdoor living space.', mood: 'Light, relaxed, breezy', signature: 'Rattan, jute, whitewashed wood, sea-glass fabric', pairsWith: 'White trim, light floors, painted doors, covered porches', care: 'Nautical accessories pile up. Shells and stripes in every room pull attention away from the architecture.' },
    { id: 'transitional', summary: 'Greige upholstery, mid-tone oak and simple classic shapes: traditional comfort without the ornament.', lookFor: 'Mixed features, such as crown molding with updated lighting, or a newer home with neutral finishes.', mood: 'Neutral, comfortable, broad', signature: 'Greige fabric, mid-tone oak, pewter', pairsWith: 'Neutral walls, oak floors, simple molding', care: 'The house has a strong character of its own, such as a loft or a mid-century home, where a neutral look can feel generic.' },
  ] as StyleGuideEntry[],
  tableHead: { eyebrow: 'Side by side', h: 'The eight directions compared', p: 'Use the last column as a check before committing to a style for a listing.' },
  situationsHead: { eyebrow: 'Common listings', h: 'Where each direction tends to fit', p: 'Starting points, not rules. The rooms in your own photos have the final say.' },
  situations: [
    { photo: 'A condo with floor-to-ceiling glass and plain walls', styles: ['modern', 'contemporary'], why: 'Low, simple furniture keeps the windows as the main feature.' },
    { photo: 'An older bungalow with original wood windows and painted trim', styles: ['scandinavian', 'transitional', 'farmhouse'], why: 'Lighter, familiar shapes respect the period without making it look dated.' },
    { photo: 'A renovated home with arches, curved walls and warm white oak', styles: ['contemporary'], why: 'Curved furniture repeats the shapes already built into the rooms.' },
    { photo: 'A converted loft with brick, ducts or steel beams', styles: ['industrial', 'modern'], why: 'Leather, steel and dark wood match materials the buyer can already see.' },
    { photo: 'A home with crown molding, a formal dining room and a mantel', styles: ['traditional', 'transitional'], why: 'Defined rooms and classic detail suit balanced, classic furniture.' },
    { photo: 'A bright home with white trim and a covered porch', styles: ['coastal', 'scandinavian'], why: 'Light woods and natural fibers carry the brightness from room to room.' },
  ] as { photo: string; styles: StyleId[]; why: string }[],
  confusedHead: { eyebrow: 'Telling them apart', h: 'Four pairs that are easy to mix up' },
  confused: [
    { a: 'modern', b: 'contemporary', body: 'Look at the edges. Modern furniture is straight and squared, usually charcoal, black metal and walnut. Contemporary pieces curve, and lean on cream boucle, brass and smoked glass. Both keep surfaces clear.' },
    { a: 'traditional', b: 'transitional', body: 'Both use classic shapes. Traditional adds carved wood, navy and brass, and arranges pieces in matching pairs. Transitional keeps the shapes but drops the ornament, with greige fabric and mid-tone oak.' },
    { a: 'scandinavian', b: 'coastal', body: 'Both are light and airy. Scandinavian stays with pale oak, wool and paper shades. Coastal brings in rattan, jute and blue-green sea-glass tones.' },
    { a: 'farmhouse', b: 'industrial', body: 'Both use dark iron and solid wood. Farmhouse softens them with linen slipcovers, baskets and greenery; industrial pairs them with leather and exposed structure.' },
  ] as { a: StyleId; b: StyleId; body: string }[],
  faqs: [
    { q: 'Can one listing mix two styles?', a: 'Neighboring styles can sit together without looking odd, such as transitional with traditional, or Scandinavian with coastal. Distant ones, like industrial in one room and farmhouse in the next, make the photos read like different houses. Choose one main direction and let small details vary by room.' },
    { q: 'Which style suits a home when the buyer is hard to predict?', a: 'Transitional is the least specific of the eight, with Scandinavian close behind. Both use neutral colors and familiar shapes that few people object to. The architecture should still lead: a transitional living room looks out of place in a brick loft.' },
    { q: 'Does a home in Florida need coastal staging?', a: 'No. Coastal suits homes with light floors, white trim and bright rooms, wherever they are. A ranch home with dark tile or a downtown condo may look more convincing in transitional, modern or contemporary. Location is one clue among several.' },
    { q: 'Should the style follow the age of the home or current trends?', a: 'Start with the fixed features, because they appear in every photo and at every showing. A current look can work in an older home whose finishes have been updated. Where they have not, very current furniture can make the original kitchen or bath look older by comparison.' },
    { q: 'How do I tell StageLiora which style I want?', a: 'Name one of the eight directions in this style guide, or describe the house and the people you expect to buy it and ask for a suggestion. If a particular room design above appeals to you, mention its style and room type.' },
  ],
};

export const roomDesigns = {
  head: { eyebrow: 'Room designs', h: 'Browse design directions by style and room' },
  lede: (designs: number, rooms: number) => `${designs} room designs across eight styles and ${rooms} room types. Filter by the room you are listing to see how each direction would furnish it.`,
  howTo: [
    { h: 'Pick the room', b: 'Start with the room type you are listing. Living rooms appear in all eight styles; outdoor spaces in fewer.' },
    { h: 'Compare directions', b: 'Open an image to see it full size. Notice how the palette, wood tones and furniture shapes change from one style to the next.' },
    { h: 'Note what you like', b: 'Write down the style, the room and anything specific, such as a wood tone, a fabric or a rug. That gives a clear brief when you describe the look you want.' },
  ],
  readingHead: { eyebrow: 'Using an image well', h: 'What a room design can and cannot tell you' },
  canTell: ['The palette and wood tones of a style', 'Typical furniture shapes and how much sits on surfaces', 'How a style dresses a particular type of room', 'The overall mood a direction gives a space'],
  cannotTell: ['How furniture will fit your room\'s size and layout', 'Whether a style suits your home\'s architecture', 'Exact products, brands or sources for any piece', 'Anything about your own walls, windows or floors, since each image shows a different room'],
  coverageHead: { eyebrow: 'Coverage', h: 'Rooms and styles covered', p: 'Which directions are shown for each room type. A filter combination with no designs leads to an empty result rather than a substitute.' },
  faqs: [
    { q: 'Why do some style and room combinations show no designs?', a: 'Not every combination has been designed. Some were left out because the pairing is uncommon, such as industrial furniture on a porch. Clear the filters, or try a neighboring style, to see what is there.' },
    { q: 'Will my room look like the image I choose?', a: 'It will share the direction, not the room. Each room design shows a different space with its own walls, windows and floor. Staging for your photo is fitted to your room\'s size, layout and light.' },
    { q: 'Can I ask for specific pieces from a room design?', a: 'You can point to them as a reference when you describe the look you want. These designs are not a product catalog, so matching an exact sofa or rug is not something to count on.' },
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
  lede: (designs: number) => `Six empty rooms staged in six design directions, ${designs} room designs to filter by style and room, and a guide to choosing the style that suits the house. Furniture and decor are added; the room itself stays as it was.`,
  nav: [
    { id: 'before-after', label: 'Before and after' },
    { id: 'room-designs', label: 'Room designs' },
    { id: 'styles', label: 'Choosing a style' },
    { id: 'compare-styles', label: 'Styles compared' },
    { id: 'faq', label: 'Questions' },
  ],
  pairsHead: { eyebrow: 'Before and after', h: 'Six rooms, before and after staging', p: 'Drag the divider to compare. Each pair is the same frame before and after furniture and decor were added.' },
  introHead: { eyebrow: 'Reading a comparison', h: 'What to check in each pair', p: 'Each pair shows an empty room and the same frame after virtual staging. The camera position, daylight and view stay put, so any difference should be something that was added. Check these four things.' },
  checks: [
    { h: 'Walls, ceiling and trim', b: 'Same color, same beams and moldings, same ceiling lights.' },
    { h: 'Windows, doors and the view', b: 'Same size and position, with the same scene outside.' },
    { h: 'Floors and built-in features', b: 'Flooring, cabinets, appliances and fixed lighting unchanged.' },
    { h: 'Scale and walkways', b: 'Furniture sized to the room, with doorways and paths left clear.' },
  ],
  stories: [
    story('living-room', 'An open living area with a whitewashed, beamed ceiling, a sea-glass front door, tall windows onto a porch and an open kitchen to one side.', 'A cream slipcovered sectional, two rattan armchairs, a whitewashed coffee table with woven baskets, a jute rug, rattan side tables, a table lamp and a potted palm.', 'The beams, door, windows, kitchen cabinets and oak floor. The seating sits clear of the front door and the kitchen opening.'),
    story('primary-bedroom', 'A bedroom with walnut doors, an open en suite, recessed lights and a wide black-framed window looking onto trees.', 'A low charcoal upholstered bed, walnut nightstands with black lamps, a walnut dresser on a steel base, a large landscape print and a textured rug.', 'The doors, en suite, window, view and wood floor. The bed sits under the window, leaving the doorway open.'),
    story('guest-bedroom', 'A bedroom with crown molding, a brass ceiling light, a white paneled door and two double-hung windows over cherry-toned hardwood.', 'A carved cherry bed with navy bedding, a navy bench with nailhead trim, matching nightstands with brass lamps, a cherry chest, framed art and a patterned rug.', 'The molding, ceiling light, windows, door and floor. The bed is centered between the two windows.'),
    story('dining-room', 'A dining room with a curved wall, an arched opening to the kitchen, a lit tray ceiling, a glass-and-brass pendant and corner windows onto a garden.', 'A round smoked-glass table on a brass pedestal, five curved boucle chairs, a layered organic rug, abstract art and a potted olive tree.', 'The curved wall, arch, ceiling, pendant, windows and French door. The table is centered under the existing pendant.'),
    story('home-office', 'A loft room with exposed steel beams, a concrete ceiling, brick walls, tall steel-grid windows and a glass-paneled door.', 'A dark wood desk on a steel frame, a cognac leather desk chair, two cognac leather armchairs, a metal cabinet, a tripod floor lamp, a desk lamp and a large landscape painting.', 'The beams, ceiling, brick, windows, door and plank floor. The furniture stays out of the door\'s swing.'),
    story('kitchen', 'A kitchen and dining space with flat-front pale oak cabinets, a built-in oven, two oak-framed windows onto a garden and a wood side door with a narrow glass panel.', 'An oak dining table with spindle-back chairs, three oak counter stools, a cream rug and a few small items on the counter.', 'The cabinets, oven, counters, windows, side door and floor. The table stands in the open area, leaving the kitchen clear.'),
  ],
  faqs: [
    { q: 'Why is each room shown in a different style?', a: 'So that six rooms cover six of the eight design directions. A real listing is usually staged in one direction throughout; the style guide further down this page explains how to choose it.' },
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
