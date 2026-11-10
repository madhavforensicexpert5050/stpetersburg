/**
 * Image-specific wording, written by looking at each image file listed here.
 *
 * Every note is bound to one file (`src`). If a slot later points at a different file, for example after
 * the image-production phase replaces it, the note no longer applies: pages fall back to generic wording and
 * `npm run qa` reports the mismatch, so the text is rechecked against the new image before it is shown.
 * Do not edit a note without opening the image it describes.
 */
import type { RoomId, StyleId } from './taxonomy.ts';

export interface ImageNote { src: string; text: string }

const lib = (style: StyleId, room: RoomId, text: string): [string, ImageNote] =>
  [`lib-${style}-${room}`, { src: `/media/generated/design-style-${style}-${room}.webp`, text }];

/** Design Library: what each image visibly shows. Shown as the card caption and in the enlarged view. */
export const libraryNotes: Record<string, ImageNote> = Object.fromEntries([
  lib('modern', 'living-room', 'Charcoal sectional, a black-framed lounge chair, a slim coffee table and a low walnut media console.'),
  lib('modern', 'primary-bedroom', 'Charcoal upholstered bed, walnut nightstands with black lamps and a single large landscape print.'),
  lib('modern', 'dining-room', 'Walnut table and charcoal upholstered chairs under a linear pendant, with a low walnut sideboard.'),
  lib('modern', 'home-office', 'Walnut desk on a black steel frame, a task chair, a low credenza and a charcoal lounge chair.'),
  lib('modern', 'kitchen', 'Walnut island with three charcoal stools under two disc pendants, against dark lower cabinets.'),
  lib('modern', 'basement', 'Charcoal sectional, a round walnut coffee table and a floating media console under recessed lights.'),
  lib('modern', 'patio', 'Charcoal outdoor sofa and chair with slatted wood sides, a wood coffee table and a dining set behind.'),

  lib('scandinavian', 'living-room', 'Oatmeal sectional, an oak lounge chair and a round oak coffee table under a paper lantern.'),
  lib('scandinavian', 'primary-bedroom', 'Cream upholstered bed with a knitted throw, oak nightstands and a paper lantern overhead.'),
  lib('scandinavian', 'guest-bedroom', 'Upholstered bed with a gray throw, oak nightstands with mushroom lamps and a paper lantern.'),
  lib('scandinavian', 'childrens-bedroom', 'Pale wood daybed, a small oak desk, a knitted pouf and open shelves of books and toys.'),
  lib('scandinavian', 'dining-room', 'Oak table with woven-seat chairs, a ribbed oak sideboard and a white dome pendant.'),
  lib('scandinavian', 'home-office', 'Oak desk with a fabric task chair, open oak shelving and an armchair with a knitted throw.'),
  lib('scandinavian', 'entryway', 'Oak bench with a woven basket, a round mirror over a pale cabinet and a peg rail for coats.'),
  lib('scandinavian', 'sunroom', 'Light wood-framed sofa, a round coffee table and a small dining set under pale ceiling beams.'),

  lib('farmhouse', 'living-room', 'Slipcovered sofa and armchair, a reclaimed-wood coffee table and a stone fireplace below wood beams.'),
  lib('farmhouse', 'primary-bedroom', 'Iron bed with linen bedding, a rustic wood bench and an iron candle chandelier below wood beams.'),
  lib('farmhouse', 'dining-room', 'Reclaimed-wood trestle table with linen slipcovered chairs under an iron candle chandelier.'),
  lib('farmhouse', 'kitchen', 'Reclaimed-wood island with slipcovered stools, iron pendants and open shelves beside a white range hood.'),
  lib('farmhouse', 'entryway', 'Rustic console, a wood bench with baskets, an iron lantern pendant and wall hooks by a wood front door.'),
  lib('farmhouse', 'porch', 'Linen sofa, a reclaimed-wood coffee table and lanterns, with a trestle dining table farther along the porch.'),
  lib('farmhouse', 'deck', 'Slipcovered sofa and armchair, a reclaimed-wood coffee table and a trestle dining table on a wide-plank deck.'),

  lib('contemporary', 'living-room', 'Curved boucle sofa and chairs around a smoked-glass coffee table, with brass lamps and a drum pendant.'),
  lib('contemporary', 'primary-bedroom', 'Low boucle bed with a matching bench, a swivel chair and a frosted drum ceiling light.'),
  lib('contemporary', 'guest-bedroom', 'Rounded boucle headboard, a swivel chair and smoked-glass nightstands with brass mushroom lamps.'),
  lib('contemporary', 'dining-room', 'Oval smoked-glass table on a brass pedestal with curved boucle chairs and a tiered pendant.'),
  lib('contemporary', 'home-office', 'Rounded cream desk with brass feet, a boucle lounge chair, a ring pendant and an arched glass cabinet.'),
  lib('contemporary', 'sunroom', 'Curved sofa and swivel chairs around a glass-and-brass table, under arched black-framed windows.'),
  lib('contemporary', 'patio', 'Curved cream sofa, a stone drum table and a round dining set beneath a curved overhang.'),

  lib('industrial', 'living-room', 'Cognac leather sectional and armchair, a steel-and-wood coffee table and metal shelving under an exposed duct.'),
  lib('industrial', 'home-office', 'Steel-and-wood desk, a cognac leather chair and a tall metal shelving unit beside steel-grid windows.'),
  lib('industrial', 'basement', 'Cognac leather sectional, a steel-and-wood coffee table, a bar with stools and a pool table.'),
  lib('industrial', 'dining-room', 'Dark wood table with cognac leather cantilever chairs under black dome pendants and an exposed duct.'),

  lib('traditional', 'living-room', 'Navy rolled-arm sofa and armchairs, a cherry coffee table and a white mantel framed by bookcases.'),
  lib('traditional', 'primary-bedroom', 'Carved cherry bed with navy bedding, a tufted navy bench and a wing chair under a brass chandelier.'),
  lib('traditional', 'dining-room', 'Cherry table with navy nailhead chairs under a brass chandelier, a mahogany sideboard and navy drapes.'),
  lib('traditional', 'entryway', 'Mahogany console with brass lamps, a pair of navy wing chairs and a patterned rug by a paneled door.'),

  lib('coastal', 'living-room', 'Sea-glass slipcovered sofa, rattan armchairs and a whitewashed coffee table on a jute rug.'),
  lib('coastal', 'primary-bedroom', 'Rattan headboard with white bedding and a seafoam throw, a palm-leaf ceiling fan and bamboo shades.'),
  lib('coastal', 'guest-bedroom', 'Woven headboard, a seafoam throw and a rattan armchair, with a round rattan mirror and a woven pendant.'),
  lib('coastal', 'sunroom', 'Rattan sofa and armchairs and a whitewashed coffee table in a room lined with windows.'),
  lib('coastal', 'porch', 'Rattan seating with sea-glass cushions, a white lattice side table and a woven pendant on a covered porch.'),
  lib('coastal', 'deck', 'Rattan sofa and armchairs around a whitewashed coffee table, with an umbrella-shaded dining set by a cable railing.'),
  lib('coastal', 'patio', 'Rattan sofa and armchairs with striped cushions under a whitewashed pergola, facing a lawn.'),

  lib('transitional', 'living-room', 'Greige sofa and linen armchair, an oak coffee table and a fireplace with an arched mirror above.'),
  lib('transitional', 'primary-bedroom', 'Greige upholstered bed with a tufted bench, oak nightstands and three framed landscapes.'),
  lib('transitional', 'dining-room', 'Mid-tone oak trestle table with greige upholstered chairs under a shaded candle chandelier.'),
  lib('transitional', 'home-office', 'Oak writing desk, a tufted chair and a tall oak bookcase under a drum ceiling light.'),
]);

const pf = (room: RoomId, role: 'before' | 'after', text: string): [string, ImageNote] =>
  [`pf-${room}-${role}`, { src: `/media/generated/virtual-staging-portfolio-${room}-${role}.webp`, text }];

/** Portfolio: alt-text descriptions of each before and after frame. */
export const portfolioNotes: Record<string, ImageNote> = Object.fromEntries([
  pf('living-room', 'before', 'an empty open living room with a whitewashed beamed ceiling, a sea-glass front door and tall windows facing a porch.'),
  pf('living-room', 'after', 'the same living room with a cream sectional, two rattan armchairs and a whitewashed coffee table on a jute rug.'),
  pf('primary-bedroom', 'before', 'an empty bedroom with walnut doors, an open en suite and a black-framed window onto trees.'),
  pf('primary-bedroom', 'after', 'the same bedroom with a low charcoal bed, walnut nightstands, a walnut dresser and a large landscape print.'),
  pf('guest-bedroom', 'before', 'an empty bedroom with crown molding, a brass ceiling light and two double-hung windows over cherry-toned floors.'),
  pf('guest-bedroom', 'after', 'the same bedroom with a carved cherry bed, a navy bench, matching nightstands with brass lamps and a patterned rug.'),
  pf('dining-room', 'before', 'an empty dining room with a curved wall, an arched opening to the kitchen, a tray ceiling and corner windows.'),
  pf('dining-room', 'after', 'the same dining room with a round glass table on a brass base and five curved boucle chairs under the existing pendant.'),
  pf('home-office', 'before', 'an empty loft room with steel beams, a concrete ceiling, brick walls and large steel-grid windows.'),
  pf('home-office', 'after', 'the same loft room with a wood and steel desk, cognac leather chairs, a metal cabinet and a tripod floor lamp.'),
  pf('kitchen', 'before', 'an empty kitchen and dining space with pale oak cabinets, a built-in oven and two oak-framed garden windows.'),
  pf('kitchen', 'after', 'the same kitchen with an oak dining table and chairs on a cream rug and three oak stools at the counter.'),
]);

/**
 * Page explanations of a specific comparison, keyed by media id. Written from the files on 2026-11-10.
 * /for-real-estate-agents/ reads its "Reading the example above" text only while both files still match.
 */
export const exampleNotes: Record<string, ImageNote> = {
  'showcase-bedroom-before': { src: '/media/generated/virtual-staging-bedroom-before.webp', text: 'Empty bedroom: four-door built-in wardrobe, wide three-pane window onto a garden, light wood floor, open door to the hallway, round ceiling light.' },
  'showcase-bedroom-after': { src: '/media/generated/virtual-staging-bedroom-after.webp', text: 'Same room with a linen-dressed bed and knitted throw, upholstered bench, wool rug, one visible nightstand with lamp, framed art, woven basket and windowsill decor.' },
};

/** True while every listed media slot still shows the file its example note was written for. */
export function exampleCurrent(ids: string[], current: { id: string; src: string }[]): boolean {
  return ids.every((id) => exampleNotes[id] && current.find((m) => m.id === id)?.src === exampleNotes[id].src);
}

/** The note for a media slot, only while the slot still shows the exact file the note was written for. */
export function noteFor(id: string, src: string): string | null {
  const n = libraryNotes[id] ?? portfolioNotes[id];
  return n && n.src === src ? n.text : null;
}

/** Notes whose slot now shows a different file. `npm run qa` fails on any of these. */
export function staleNotes(current: { id: string; src: string }[]): string[] {
  const all = { ...libraryNotes, ...portfolioNotes, ...exampleNotes };
  return Object.entries(all).filter(([id, n]) => { const m = current.find((x) => x.id === id); return !m || m.src !== n.src; }).map(([id]) => id);
}
