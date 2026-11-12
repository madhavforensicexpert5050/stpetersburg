/**
 * Copy for /portfolio/ (V24, five sections). The owner folded the Design Styles hub, the four style pages and the
 * Design Library into the Portfolio in V19 and retired those routes (src/data/retired-routes.ts). V24 rebuilt the
 * page into exactly five main sections:
 *   1 Hero and navigation
 *   2 Room Designs: Before and After  (vacant gallery, Outdoor Spaces, Occupied Rooms, More Design Ideas)  portfolioPage, roomDesigns
 *   3 Explore 8 Styles: one room, before and after                                                       styleGuide
 *   4 Common Questions                                                                                     portfolioPage.faqs
 *   5 Ask About Your Listing Photos (CTA band)                                                              portfolioPage.finalCta
 * Each style is described once, in its Section 3 panel. Image-specific wording lives in image-notes.ts and in the
 * stories below, each bound to the after file it was written from.
 */
import type { StyleId } from './taxonomy.ts';

/** One style, described once: what it looks like, where it fits best, and when to use it with care. */
export interface StyleGuideEntry { id: StyleId; description: string; bestFit: string; care: string }

export const styleGuide = {
  head: { eyebrow: 'One room, eight styles', h: 'Explore 8 Styles: One Room, Before and After', p: 'One empty room, staged eight ways. The walls, windows, floor and camera angle stay the same, so only the furniture and decor change. Choose a style to compare it with the empty room.' },
  /** Shown only if the eight-style set cannot ship (styleCompareReady false). */
  fallbackHead: { h: 'Explore 8 Styles', p: 'Eight staging styles, compared on what each looks like, where it fits best and when to use it with care.' },
  switchLabel: 'Choose a style',
  defaultStyle: 'transitional' as StyleId,
  order: ['modern', 'contemporary', 'coastal', 'scandinavian', 'farmhouse', 'traditional', 'industrial', 'transitional'] as StyleId[],
  status: (name: string) => `Showing ${name}`,
  sliderLabel: (name: string) => `Compare the empty room with the ${name} version`,
  entries: [
    { id: 'modern', description: 'Straight lines, low furniture and clear surfaces in charcoal, black metal and walnut, with one strong piece of art.', bestFit: 'Condos and newer homes with flat ceilings, plain walls and large windows.', care: 'Ornate trim or arched openings can clash with squared furniture, and undersized pieces can misstate a room\'s size.' },
    { id: 'contemporary', description: 'Soft curves, cream bouclé, brushed brass and smoked glass. Polished and current.', bestFit: 'Recent renovations, arched openings, curved walls and warm white oak.', care: 'Small, boxy rooms. Trend-heavy pieces date quickly.' },
    { id: 'coastal', description: 'Rattan, jute, whitewashed wood and white fabrics with soft sea-glass accents.', bestFit: 'Bright rooms, light floors, white trim, porches and lanais.', care: 'Shells and stripes in every room. Not every Florida home needs a coastal look.' },
    { id: 'scandinavian', description: 'Pale oak, wool, linen and paper shades on light, rounded pieces, kept sparse so daylight leads.', bestFit: 'Small bedrooms, home offices, and bright rooms with white walls and light floors.', care: 'Very dark or orange-toned floors, and dim rooms.' },
    { id: 'farmhouse', description: 'Sturdy reclaimed-look wood, linen slipcovers and iron, softened with baskets and greenery.', bestFit: 'Wood beams, shiplap, apron sinks, porches and warm plank floors.', care: 'Sleek condos, or the same rustic accessories repeated in every room.' },
    { id: 'traditional', description: 'Classic proportions in cherry and mahogany, navy upholstery, brass lamps and patterned rugs, arranged in balanced pairs.', bestFit: 'Crown molding, wainscoting, mantels and formal dining rooms.', care: 'Open plans with low ceilings.' },
    { id: 'industrial', description: 'Cognac leather, blackened steel and dark wood, with dome pendants and open metal shelving.', bestFit: 'Lofts with brick, ductwork, concrete or steel beams.', care: 'Small or dim rooms, which can look heavier and smaller.' },
    { id: 'transitional', description: 'Greige upholstery, mid-tone oak and pewter on simple classic shapes. Traditional comfort without the ornament.', bestFit: 'Neutral walls and oak floors. A safe choice when the likely buyer is hard to predict.', care: 'Homes with strong character, such as lofts or mid-century homes, can look generic.' },
  ] as StyleGuideEntry[],
  situationsHead: { h: 'Not sure where to start?', p: 'Starting points, not rules. The rooms in your own photos have the final say.' },
  situations: [
    { photo: 'A condo with floor-to-ceiling glass and plain walls', styles: ['modern', 'contemporary'], why: 'Low, simple furniture keeps the windows as the main feature.' },
    { photo: 'An older bungalow with original wood windows and painted trim', styles: ['scandinavian', 'transitional', 'farmhouse'], why: 'Lighter, familiar shapes respect the period without making it look dated.' },
    { photo: 'A renovated home with arches, curved walls and warm white oak', styles: ['contemporary'], why: 'Curved furniture repeats the shapes already built into the rooms.' },
    { photo: 'A converted loft with brick, ducts or steel beams', styles: ['industrial', 'modern'], why: 'Leather, steel and dark wood match materials the buyer can already see.' },
    { photo: 'A home with crown molding, a formal dining room and a mantel', styles: ['traditional', 'transitional'], why: 'Defined rooms and classic detail suit balanced, classic furniture.' },
    { photo: 'A bright home with white trim and a covered porch', styles: ['coastal', 'scandinavian'], why: 'Light woods and natural fibers carry the brightness from room to room.' },
  ] as { photo: string; styles: StyleId[]; why: string }[],
};

/** More Design Ideas: the 48 single design images, collapsed inside Section 2. */
export const roomDesigns = {
  h: 'More Design Ideas',
  /** Narrow screens show this many designs first, with a button for the rest (site.ts). */
  firstBatch: 8,
  p: 'These are single design images, not before-and-after comparisons. Each one shows a different room, so use them to picture a style\'s palette, materials and furniture shapes, not how furniture would fit your own room.',
  summaryAll: (n: number) => `Show all ${n} design ideas`,
  summaryGroup: (n: number, group: string) => `Show ${n} ${group.toLowerCase()} design ideas`,
};

export interface PortfolioStory { key: string; before: string; added: string; unchanged: string; removed?: string; afterSrc: string }

/**
 * Each explanation was written by comparing the two image files named by its pair. `afterSrc` binds it to the
 * after file; if that file changes, the card shows only its title until the text is rechecked (npm run qa).
 */
const story = (key: string, afterSrc: string, before: string, added: string, unchanged: string, removed?: string): PortfolioStory =>
  ({ key, before, added, unchanged, afterSrc: `/media/generated/${afterSrc}`, ...(removed ? { removed } : {}) });
const pf = (room: string) => `virtual-staging-portfolio-${room}-after.webp`;

export const portfolioPage = {
  // V28 editorial hero (owner brief 2026-11-12). The search phrase lives in the lede, the <title> and the meta description.
  eyebrow: 'The StageLiora Portfolio',
  h1: 'See the Potential in Every Space.',
  lede: 'Our virtual staging portfolio shows rooms before and after staging, an occupied room restaged, and one room in eight design styles. Furniture and decor are added. Walls, windows, floors and fixtures stay as photographed.',
  heroCta: { primary: 'Ask About Your Listing', secondary: 'Explore Transformations' },
  /** Counts come from the data, never typed by hand. They describe examples on this page, not client work. */
  stats: { pairs: 'before-and-after examples', styles: 'styles shown on one room', ideas: 'single design ideas' },
  heroFigure: { kicker: 'One room, eight styles', label: 'Compare the styles', alt: 'transitional' },
  tocLabel: 'On this page',
  /** Used only if the eight-style set cannot ship. */
  ledeTextOnly: 'Our virtual staging portfolio shows vacant rooms before and after staging, and helps you find the style that suits your listing. Furniture and decor are added. Walls, windows, floors and fixtures stay as photographed.',
  nav: { primary: 'Room Designs', secondary: 'Explore 8 Styles', faq: 'FAQ' },
  roomsHead: { eyebrow: 'Before and after', h: 'Room Designs: Before and After', p: 'Each pair shows the same photo of a vacant room before and after virtual staging. Drag the divider, or tap anywhere on the image, to compare. Choose a room type to see matching examples.' },
  /** Section-level note on where the images come from (no per-image labels; About #images has the detail). */
  sampleNote: { p: 'These rooms are sample images created to demonstrate the method. They are not client projects or photos of real listings.', link: 'How these images were made' },
  check: 'In every pair, the walls, ceiling, windows, doors, floors and built-in features stay the same. Only movable furniture and decor are added, sized to the room.',
  chipsLabel: 'Room type',
  allRooms: 'All Rooms',
  /** Narrow screens show this many pairs first (site.ts). */
  firstPairs: 4,
  changedLabel: 'What changed',
  outdoor: {
    eyebrow: 'Patios, lanais, porches and decks',
    h: 'Outdoor Spaces',
    p: 'Patios, lanais, porches and decks are often photographed empty. Staging adds movable outdoor furniture, rugs and planters so buyers can see how the space can be used.',
    points: [
      { k: 'Added', v: 'Movable outdoor furniture, rugs and planters.' },
      { k: 'Never added', v: 'Landscaping, outdoor kitchens, pools or structures.' },
      { k: 'The view', v: 'Never changed.' },
    ],
    mls: 'Stellar MLS allows exterior staging only with unattached furniture or decor.',
  },
  occupied: {
    eyebrow: 'Occupied rooms',
    h: 'Occupied Rooms: Furniture Removal and Staging',
    p: 'Not every listing is vacant. When a room is still furnished, the existing movable furniture and belongings are removed from the photo, and the room is then staged with new furniture and decor. This is part of the Furniture Removal & Staging service. It is not a separate decluttering or removal-only service.',
    rules: [
      { k: 'Can be removed', v: 'movable furniture, rugs, decor and personal items.' },
      { k: 'Always stays', v: 'walls, floors, windows, doors, built-ins, light fixtures, ceiling fans and anything that conveys with the sale.' },
      { k: 'Never hidden', v: 'damage or defects, such as holes, stains, exposed wiring or damaged flooring.' },
    ],
    mls: 'Stellar MLS permits removing existing furniture and replacing it with digital furniture, with the same disclosure as any virtually staged photo. Rules differ between MLSs, so check yours before you list.',
    cardLabel: 'Occupied room: furniture removed, then restaged',
    service: 'About Furniture Removal & Staging',
    ask: 'Ask about an occupied room',
  },
  inlineCta: { h: 'Have a vacant listing? Ask us about your rooms.', p: 'Tell us which rooms are empty and what the house is like. We answer questions and style preferences by email.', note: 'Bookings are not open yet; questions are welcome.', label: 'Ask About Your Rooms' },
  /** Grid tile beside the pairs: the one rule every example follows. */
  checkTile: { h: 'What never changes' },
  finalCta: { eyebrow: 'Your listing', h: 'Ready to Reimagine Your Listing Photos?', p: 'Tell us which rooms need staging and the style you have in mind, or describe the house and ask what would suit it.', note: 'Project bookings are not open yet, so please don\'t send photos. Questions are welcome.', label: 'Ask About Your Rooms' },
  stories: [
    story('pf-living-room', pf('living-room'), 'An open living area with a whitewashed, beamed ceiling, a sea-glass front door, tall windows onto a porch and an open kitchen to one side.', 'A cream slipcovered sectional, two rattan armchairs, a whitewashed coffee table with woven baskets, a jute rug, rattan side tables, a table lamp and a potted palm.', 'The beams, door, windows, kitchen cabinets and oak floor. The seating sits clear of the front door and the kitchen opening.'),
    story('pf-primary-bedroom', pf('primary-bedroom'), 'A bedroom with walnut doors, an open en suite, recessed lights and a wide black-framed window looking onto trees.', 'A low charcoal upholstered bed, walnut nightstands with black lamps, a walnut dresser on a steel base, a large landscape print and a textured rug.', 'The doors, en suite, window, view and wood floor. The bed sits under the window, leaving the doorway open.'),
    story('pf-guest-bedroom', pf('guest-bedroom'), 'A bedroom with crown molding, a brass ceiling light, a white paneled door and two double-hung windows over cherry-toned hardwood.', 'A carved cherry bed with navy bedding, a navy bench with nailhead trim, matching nightstands with brass lamps, a cherry chest, framed art and a patterned rug.', 'The molding, ceiling light, windows, door and floor. The bed is centered between the two windows.'),
    story('pf-dining-room', pf('dining-room'), 'A dining room with a curved wall, an arched opening to the kitchen, a lit tray ceiling, a glass-and-brass pendant and corner windows onto a garden.', 'A round smoked-glass table on a brass pedestal, five curved boucle chairs, a layered organic rug, abstract art and a potted olive tree.', 'The curved wall, arch, ceiling, pendant, windows and French door. The table is centered under the existing pendant.'),
    story('pf-home-office', pf('home-office'), 'A loft room with exposed steel beams, a concrete ceiling, brick walls, tall steel-grid windows and a glass-paneled door.', 'A dark wood desk on a steel frame, a cognac leather desk chair, two cognac leather armchairs, a metal cabinet, a tripod floor lamp, a desk lamp and a large landscape painting.', 'The beams, ceiling, brick, windows, door and plank floor. The furniture stays out of the door\'s swing.'),
    story('pf-kitchen', pf('kitchen'), 'A kitchen and dining space with flat-front pale oak cabinets, a built-in oven, two oak-framed windows onto a garden and a wood side door with a narrow glass panel.', 'An oak dining table with spindle-back chairs, three oak counter stools, a cream rug and a few small items on the counter.', 'The cabinets, oven, counters, windows, side door and floor. The table stands in the open area, leaving the kitchen clear.'),
    story('svc-virtual-staging', 'service-virtual-staging-after.webp', 'An open-plan living area with a large black-framed window, a glass door and a kitchen with walnut cabinets, a dark island and a steel refrigerator.', 'A charcoal sectional, a black-framed lounge chair, a wood and metal coffee table, a low console, a textured rug, a side table, plants and three counter stools.', 'The window, door, column, kitchen, recessed lights and wood floor. The seating sits clear of the door.'),
    story('showcase-bedroom', 'virtual-staging-bedroom-after.webp', 'A bedroom with a full-height oak wardrobe wall, an oak door to the hallway, an oak-framed window and a light oak floor.', 'A pale oak bed with linen bedding, an upholstered bench, an oak nightstand with a lamp, a woven basket, a framed print and a wool rug.', 'The wardrobe, door, window, ceiling light and floor. The wardrobe doors and the doorway stay clear.'),
    story('showcase-dining', 'virtual-staging-dining-after.webp', 'A dining room with rough-sawn ceiling beams, shiplap walls, a triple window, a wood door with glass panes and an opening to the kitchen.', 'A trestle table with six slipcovered chairs, a painted sideboard, a framed landscape, a lantern, a jute rug and a hydrangea centerpiece.', 'The beams, shiplap, windows, door, kitchen opening and plank floor. The table sits clear of the door.'),
    // V24 P1 pairs: written from the approved files on 2026-11-12, nothing beyond what is visible. Owner to review the wording.
    story('pf-sunroom', pf('sunroom'), 'An enclosed sunroom with two walls of sliding windows onto a fenced garden, a white plank ceiling with a fan, French doors and stone-look tile.', 'A greige sofa, two linen armchairs, an oak coffee table, a neutral rug, a round oak table with two chairs and two potted plants.', 'The windows, garden view, ceiling, fan, French doors and tile. The doorway and the path along the windows stay clear.'),
    story('pf-patio', pf('patio'), 'A screened lanai with a white ceiling and two recessed lights, a sliding glass door, a screen door and travertine pavers, looking onto a lawn and palms.', 'A woven outdoor sofa and two armchairs with white and sea-glass cushions, whitewashed tables, a round dining table with woven chairs, an outdoor rug and two potted palms.', 'The screens, screen door, sliding door, ceiling lights, pavers and view. Nothing was planted or built, and the screen door stays clear.'),
    story('svc-furniture-removal', 'service-furniture-removal-after.webp', 'A furnished living room with a brown sofa, a floral armchair, a curio cabinet, side and coffee tables, a red patterned rug and personal items.', 'A greige sofa, two upholstered armchairs, a wood coffee table, two side tables with lamps, a pale rug and flowers.', 'The door, windows, crown molding and floor. In this example the curtains and the framed art were kept.', 'The sofa, armchair, curio cabinet, tables, rug, and the books, mug, photo frame and clock.'),
  ],
  faqHead: { eyebrow: 'Questions', h: 'Common Questions', p: 'Short answers about these examples, the staging method and listing use.' },
  /** Closing band: how a project is handled. Sentences follow the owner-confirmed workflow (content.ts process). */
  trust: {
    h: 'How a project is handled',
    items: [
      { k: 'One point of contact', v: 'Devender Garg, StageLiora’s founder, handles each project himself.' },
      { k: 'Careful editing', v: 'AI-assisted editing, then refined by hand to the scale of the room.' },
      { k: 'Agreed delivery', v: 'Finished images arrive as JPG or PNG files, through the workflow agreed with you.' },
    ],
    founderLink: 'About Devender Garg',
  },
  faqs: [
    { q: 'How does virtual staging work?', a: 'You send a photo of an empty room, and furniture, rugs and decor are added to that photo digitally. Walls, windows, floors and fixtures stay exactly as photographed.' },
    { q: 'Can a room that still has furniture be staged?', a: 'Yes, through Furniture Removal & Staging. Movable furniture and belongings are taken out of the photo and the room is restaged. Permanent fixtures, anything that conveys with the sale and any damage stay visible.' },
    { q: 'Are these portfolio images real client projects?', a: 'No. They are sample images that show the method, not photos of real listings or client work.', link: { href: '/about/#images', label: 'How these images were made' } },
    { q: 'Can I use virtually staged photos in an MLS listing?', a: 'Stellar MLS permits virtual staging with disclosure. Its Article 04.04 asks for:', list: ['the words "Virtually staged" in the photo description', 'the virtually staged field checked', 'public remarks that begin "One or more photo(s) was virtually staged."'], after: 'Rules differ by MLS and change over time, and the listing agent and broker remain responsible for the listing. Keep every original photo.', link: { href: '/guides/virtual-staging-disclosure-florida/', label: 'Virtual staging disclosure in Florida' } },
    { q: 'Can I choose a different style for each room?', a: 'You can, but a listing usually looks most convincing with one main style throughout. Neighboring styles, such as traditional and transitional, mix well. Distant ones can make the rooms look like different houses.' },
    { q: 'Which rooms can be staged?', a: 'Living areas, bedrooms, kitchens and dining areas, home offices and sunrooms, plus outdoor spaces with movable furniture only. For another space, such as a basement or entryway, ask us.' },
    { q: 'Can I book a project now?', a: 'Not yet. We are not taking projects or photos at the moment, but questions about a listing, a room or a style are welcome.' },
  ] as { q: string; a: string; list?: string[]; after?: string; link?: { href: string; label: string } }[],
};
