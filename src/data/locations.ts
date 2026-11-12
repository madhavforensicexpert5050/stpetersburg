/**
 * Location pages (V23). All 12 are owner-approved (approvals.coverage); `decision` records the separate editorial check.
 * Census = ACS 2020-2024 5-year table B25024 for all twelve places (recompute with scripts/verify-census.mjs).
 * Listing figures = Realtor.com October 2026, by ZIP or postal city, as held in the project research data.
 * Facts were re-verified on 2026-11-12 from pages that were actually opened. "evidence" records how each fact was
 * obtained; a 'snippet' fact never reaches a public build, and qa.mjs fails if a published page relies on one.
 *
 * SEO rules (V23): each page owns one primary keyword that no other page targets. The homepage owns
 * "virtual staging St. Petersburg FL", so the St. Petersburg page targets listing photos by ZIP instead.
 * No search-volume figures are claimed anywhere. Copy is written per city from its own research, never by
 * swapping a city name into shared text. Do not target buyers by age, family status or any protected class.
 */
export type PublicationDecision = 'PUBLISH' | 'RECOMMEND_AFTER_APPROVAL' | 'DRAFT_NEEDS_LOCAL_REVIEW' | 'CONSOLIDATE_OR_RESEARCH_ONLY' | 'HOLD_OVERLAP_WITH_OTHER_PROPERTY';

export interface LocationFact { text: string; source: string; url: string; evidence: 'opened' | 'snippet' | 'dataset' }
export interface LocationRecord {
  slug: string; path: string; name: string; officialName: string; officialNameVerified: boolean; status: string; website: string; relationship: string;
  units: number; detached: number; tenPlus: number; mobile: number;
  listing: { label: string; zips: string; active: number | null; fresh: number | null; dom: string; price: string; caveat: string };
  /** Keyword map. Not rendered. primary is unique across the site; secondary are supporting phrases used naturally. */
  keywords: { primary: string; secondary: string[] };
  h1: string; intro: string;
  /** Service explanation for this city's housing stock. */
  staging: { eyebrow: string; h: string; p: string[] };
  /** Service slug (services.ts) and why it fits here. Only live service pages are linked. */
  fits: { service: string; why: string }[];
  /** A media.ts library id. Its alt text comes from the checked image note, never from this file. */
  image: string; imageNote: string;
  pointsH: string; localAngle: { h: string; b: string }[]; facts: LocationFact[];
  faq: { q: string; a: string }[];
  nearby: string[]; guides: string[];
  hubLine: string; linkLabel: string; cta: { h: string; p: string };
  checked: string; updated: string;
  decision: PublicationDecision; decisionWhy: string;
  title: string; description: string;
}

const COUNTY = { source: 'Pinellas County, municipalities list', url: 'https://pinellas.gov/municipalities-and-cities/', evidence: 'opened' as const };
const SD = { text: 'Pinellas County applies a substantial-damage test of 49% or more of pre-disaster value, and letter holders from Helene and Milton have until December 31, 2026 to comply. City residents are referred to their local officials.', source: 'Pinellas County, substantial damage FAQs', url: 'https://pinellas.gov/substantial-damage-faqs/', evidence: 'opened' as const };
const REALTOR = { source: 'Realtor.com Core Metrics, ZIP data', url: 'https://www.realtor.com/research/data/', evidence: 'dataset' as const };
const G = {
  disclosure: '/guides/virtual-staging-disclosure-florida/', prep: '/guides/how-to-prepare-photos-for-virtual-staging/', cost: '/guides/virtual-staging-cost/',
  agents: '/guides/virtual-staging-for-real-estate-agents/', vs: '/guides/virtual-staging-vs-traditional-staging/', faqs: '/guides/virtual-staging-faqs/',
};
const CHECKED = 'November 12, 2026';
const UPDATED = '2026-11-12';
const OK = 'V23: owner-approved, and every published fact was verified on an opened source on 2026-11-12. Distinct local content; no office or project claims.';

export const locations: LocationRecord[] = [
  {
    slug: 'st-petersburg-fl', path: '/locations/st-petersburg-fl/', name: 'St. Petersburg', officialName: 'City of St. Petersburg', officialNameVerified: false, status: 'Incorporated municipality', website: 'https://www.stpete.org/', relationship: 'Anchor city for this site',
    units: 141508, detached: 55, tenPlus: 26, mobile: 2,
    listing: { label: 'Postal city "Saint Petersburg" (16 ZIPs)', zips: '33701–33716', active: 3049, fresh: 764, dom: '60 to 133 days by ZIP', price: '$219,500 to $1,199,500 median list price by ZIP', caveat: 'Postal-city figures are not city limits. ZIPs 33706, 33707 and 33708 reach beyond St. Petersburg proper.' },
    keywords: { primary: 'St. Petersburg listing photos', secondary: ['St. Petersburg home prices by ZIP', 'staging St. Petersburg condos', 'Kenwood bungalow listing photos', 'historic district listing photos St. Petersburg'] },
    h1: 'St. Petersburg listing photos: one city name, very different markets',
    intro: 'Across the ZIP codes labeled Saint Petersburg, October 2026 median list prices ran from $219,500 to $1,199,500, and typical time on market from 60 days to 133. A downtown tower unit and a Craftsman bungalow in Kenwood are different listings, and their photos should be planned differently too.',
    staging: {
      eyebrow: 'Staging by home type',
      h: 'Planning staged photos for towers, bungalows and everything between',
      p: [
        'Virtual staging adds furniture and decor to photos of empty rooms so buyers can read the size and purpose of each space. In St. Petersburg the right brief depends on the building: a tower unit needs compact pieces that leave the window line clear, while an older bungalow needs furniture that sits alongside original floors, built-ins and fireplaces.',
        'Whatever the home, the edit stays inside Stellar MLS rules. Permanent features, the view and the condition of the property stay as photographed, and the listing must say that photos were virtually staged.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'empty condos, vacant rentals and bungalows between owners.' },
      { service: 'furniture-removal-and-staging', why: 'occupied homes, where Stellar permits replacing existing furniture with digital furniture.' },
      { service: 'photo-enhancement', why: 'brightness and color correction that leaves the home itself unchanged.' },
    ],
    image: 'lib-transitional-living-room', imageNote: 'A transitional room design, the kind of middle-ground style that can work in a tower unit or an older house. Furniture size should always match the real room.',
    pointsH: 'What St. Petersburg listings ask of photos',
    localAngle: [
      { h: 'Towers and bungalows need different photos', b: 'About 55% of the city\'s housing units are single detached homes and 26% are in buildings with ten or more units. A staged downtown condo and a staged bungalow are different briefs, and the furniture scale differs too.' },
      { h: 'Historic districts have real architectural character', b: 'Roser Park, Kenwood and Round Lake are all historic districts in the National Register system. When a home has original details, staging should sit alongside them, because Stellar does not allow permanent fixtures to be changed in a listing photo.' },
      { h: 'Flood history belongs in the conversation, not the edit', b: 'Pinellas County set a December 31, 2026 compliance date for owners holding Helene and Milton substantial-damage letters. Photos of repaired homes should still show the home as it is. Stellar prohibits editing out damage, and an image is no substitute for what a buyer is entitled to be told.' },
      { h: 'Plan per ZIP, not per city', b: 'Median days on market ran from 60 in one ZIP to 133 in another during October 2026. A citywide rule of thumb about pace would mislead, so decide which rooms to stage listing by listing.' },
    ],
    facts: [
      { text: 'St. Petersburg is one of 24 municipalities on the county\'s list.', ...COUNTY },
      { text: 'The Roser Park Historic District is in the National Register system (reference 98000295), with Bungalow/Craftsman, Prairie School and revival styles recorded.', source: 'National Park Service, NRIS record 98000295', url: 'https://npgallery.nps.gov/AssetDetail/NRIS/98000295', evidence: 'opened' },
      { text: 'The Kenwood Historic District is in the National Register system (reference 03000729), recorded as Bungalow/Craftsman.', source: 'National Park Service, NRIS record 03000729', url: 'https://npgallery.nps.gov/AssetDetail/NRIS/03000729', evidence: 'opened' },
      { text: 'The Round Lake Historic District is in the National Register system (reference 03000824), with buildings from 1900 to 1974.', source: 'National Park Service, NRIS record 03000824', url: 'https://npgallery.nps.gov/AssetDetail/NRIS/03000824', evidence: 'opened' },
      { text: 'Kenwood\'s neighborhood association says all exterior alterations in its local historic districts need prior approval from the city\'s preservation office, a Certificate of Appropriateness.', source: 'Historic Kenwood neighborhood association', url: 'https://www.historickenwood.org/historic-preservation', evidence: 'opened' },
      SD,
      { text: 'October 2026 listings: 3,049 active, 764 new, across 16 postal ZIPs.', ...REALTOR },
    ],
    faq: [
      { q: 'Can you virtually stage a bungalow in a St. Petersburg historic district?', a: 'Yes, inside. Furniture and decor can be added to empty rooms, while original floors, built-ins and fireplaces stay exactly as photographed, because Stellar does not allow permanent fixtures to be changed. Outside, Stellar allows only unattached furniture or decor. Any real exterior change in a local historic district is a matter for the city, not an image edit.' },
      { q: 'Which ZIP codes does this guide cover?', a: 'The 16 ZIPs that Realtor.com reports as Saint Petersburg, 33701 to 33716. Three of them, 33706, 33707 and 33708, also serve beach and bay cities, which have their own guides on this site.' },
      { q: 'What should I send for a downtown condo?', a: 'Full-resolution, uncropped originals of each room, a note on which rooms to stage, and where the images will be used. The view through the windows stays as it was shot: Stellar names an edited-in water view as prohibited.' },
      { q: 'Does StageLiora have a St. Petersburg office?', a: 'No. StageLiora works remotely and has no office, staff or storefront in St. Petersburg or anywhere in Florida. Photos are shared and returned online.' },
    ],
    nearby: ['gulfport', 'south-pasadena', 'st-pete-beach', 'pinellas-park'], guides: [G.disclosure, G.prep, G.agents],
    hubLine: 'Sixteen postal ZIPs, from downtown towers to Craftsman bungalows in Kenwood and Roser Park.', linkLabel: 'St. Petersburg listing photo guide',
    cta: { h: 'Have a listing in St. Petersburg?', p: 'Tell us the ZIP, which rooms you have in mind and where the images will be used.' },
    checked: CHECKED, updated: UPDATED,
    decision: 'PUBLISH', decisionWhy: `${OK} The city's own site blocked automated reading, so the legal name is not shown.`,
    title: 'St. Petersburg Listing Photos by ZIP and Home Type | StageLiora',
    description: 'How St. Petersburg listing prices and days on market vary across 16 ZIPs, what towers and historic bungalows need from staging, and Stellar MLS photo rules.',
  },
  {
    slug: 'st-pete-beach', path: '/locations/st-pete-beach/', name: 'St. Pete Beach', officialName: 'City of St. Pete Beach', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.stpetebeach.org/', relationship: 'Barrier island west of St. Petersburg',
    units: 8400, detached: 41, tenPlus: 44, mobile: 0,
    listing: { label: 'ZIP 33706, reported as Saint Petersburg', zips: '33706', active: 362, fresh: 84, dom: '99 days', price: '$599,000 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a St. Pete Beach figure.' },
    keywords: { primary: 'virtual staging St. Pete Beach', secondary: ['St. Pete Beach condo listing photos', 'Pass-a-Grille listing photos', 'beach condo virtual staging Florida', 'St. Pete Beach rental zoning'] },
    h1: 'Virtual staging in St. Pete Beach: condos, cottages and storm recovery',
    intro: 'About 44% of St. Pete Beach housing units are in buildings of ten or more units and 41% are single detached homes, from Gulf-front towers to the older cottages of Pass-a-Grille. Much of the island was damaged in 2024, so accurate photos matter here more than almost anywhere else in the county.',
    staging: {
      eyebrow: 'Beach listings',
      h: 'Staging a beach condo or cottage without overselling it',
      p: [
        'On the island, the room is the product and the view is the bonus. Virtual staging can furnish an empty condo or cottage so buyers see where the sofa, the dining table and the bed go, while the windows and the water beyond them stay untouched.',
        'Two local facts shape the brief. Whether a unit can be rented by the night depends on its zoning, so a staged "vacation rental" look can set the wrong expectation. And after the 2024 storms, a renovated unit and an unrepaired one should never be made to look alike.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'empty condos and cottages, at furniture sizes that fit the real rooms.' },
      { service: 'day-to-dusk', why: 'only where the sunset in the edit matches where the sun really sets from that view.' },
      { service: 'photo-enhancement', why: 'balancing bright window light with darker interiors, without changing the view.' },
    ],
    image: 'lib-coastal-living-room', imageNote: 'A coastal room design. Light finishes suit many beach condos, but the view outside a real listing\'s windows must stay as photographed.',
    pointsH: 'What St. Pete Beach listings ask of photos',
    localAngle: [
      { h: 'A renovated unit and an unrepaired one should not look alike', b: 'The city assessed more than 3,000 damaged structures. It treats a home in a flood hazard area as substantially damaged when the repair cost is more than 50% of its market value, excluding land. Photos need to show the property as it is on the day.' },
      { h: 'Rental zoning shapes the presentation', b: 'The city allows stays of less than 30 days, up to three times in 12 months, only in the RM zoning district and the Pass-A-Grille Overlay District. Rentals of a month or more are allowed citywide. Check the zoning before styling a unit as a nightly rental.' },
      { h: 'Views cannot be improved', b: 'Stellar names an edited-in Gulf or ocean view as prohibited. Whatever the window shows should stay as it was shot.' },
      { h: 'Pass-a-Grille is a historic district', b: 'The Pass-a-Grille Historic District is in the National Register system. Staging in an older cottage should work around original features, which Stellar does not allow to be changed.' },
    ],
    facts: [
      { text: 'More than 3,000 damaged structures assessed; a home is substantially damaged when repairs exceed 50% of its market value, excluding land.', source: 'City of St. Pete Beach, substantial damage appeals', url: 'https://www.stpetebeach.org/829/Substantial-Damage-Determination-Appeal-', evidence: 'opened' },
      { text: 'Stays under 30 days are allowed up to three times per 12 months only in the RM zoning district and the Pass-A-Grille Overlay District; rentals of a month or more are allowed in all residences.', source: 'City of St. Pete Beach, short-term rental rules', url: 'https://www.stpetebeach.org/438/Short-Term-Rental-Rules-Regulations', evidence: 'opened' },
      { text: 'The Pass-a-Grille Historic District is in the National Register system (reference 89001734), with a 2003 boundary increase (reference 03000943).', source: 'National Park Service, NRIS record 89001734', url: 'https://npgallery.nps.gov/AssetDetail/NRIS/89001734', evidence: 'opened' },
      SD,
    ],
    faq: [
      { q: 'Can you add a Gulf view to a St. Pete Beach condo photo?', a: 'No. Stellar MLS names an edited-in Gulf or ocean view as prohibited. Rooms can be furnished, but what the window shows stays exactly as photographed.' },
      { q: 'Can I stage a home that is still being repaired after the storms?', a: 'Not in a Stellar listing photo. Virtual staging must not be used for under-construction properties. Stage the rooms that are finished, and describe the repairs in the listing.' },
      { q: 'Should a condo be staged to look like a vacation rental?', a: 'Only if it can be rented that way. The city allows stays under 30 days only in the RM zoning district and the Pass-A-Grille Overlay District, so many units are better shown as homes to live in.' },
      { q: 'Is a twilight photo allowed for a beachfront listing?', a: 'Stellar accepts twilight edits as long as no lighting is added where none exists and the sunset or sunrise reflects where the sun truly sets or rises from that spot.' },
    ],
    nearby: ['treasure-island', 'south-pasadena', 'st-petersburg-fl'], guides: [G.disclosure, G.faqs, G.prep],
    hubLine: 'Condo towers and Pass-a-Grille cottages, with rental zoning and storm recovery to account for.', linkLabel: 'St. Pete Beach staging guide',
    cta: { h: 'Selling on St. Pete Beach?', p: 'Tell us whether it is a condo or a house, which rooms you need and where the photos will appear.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: OK,
    title: 'Virtual Staging in St. Pete Beach, FL: Condos, Cottages | StageLiora',
    description: 'Virtual staging notes for St. Pete Beach listings: a condo-heavy housing mix, rental zoning, Pass-a-Grille, storm recovery and Stellar MLS view rules.',
  },
  {
    slug: 'gulfport', path: '/locations/gulfport/', name: 'Gulfport', officialName: 'City of Gulfport', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://mygulfport.us/', relationship: 'Borders St. Petersburg',
    units: 7952, detached: 61, tenPlus: 25, mobile: 3,
    listing: { label: 'ZIP 33707, reported as Saint Petersburg', zips: '33707', active: 278, fresh: 72, dom: '81 days', price: '$394,999 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a Gulfport figure.' },
    keywords: { primary: 'virtual staging Gulfport FL', secondary: ['Gulfport FL listing photos', 'small home staging Gulfport', 'elevated home listing photos', 'Gulfport waterfront district homes'] },
    h1: 'Virtual staging in Gulfport, FL: compact homes near a historic waterfront',
    intro: 'About 61% of Gulfport\'s 7,952 housing units are single detached homes. The city\'s 57.9-acre waterfront district along Beach Blvd. South mixes shops and restaurants with preserved residential streets, and more than 600 Gulfport properties were affected by the 2024 hurricane season.',
    staging: {
      eyebrow: 'Smaller houses',
      h: 'Staging compact rooms at their true size',
      p: [
        'Many Gulfport listings are houses rather than condos, and some rooms are small. Virtual staging helps buyers see that a bedroom fits a real bed and a living room fits a real sofa. It only works if the furniture is drawn at true scale.',
        'Gulfport also has many homes that were repaired, raised or rebuilt after 2024. Staging goes inside the finished rooms. The house itself, including any new stairs or a raised entry, stays exactly as it now stands.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'empty compact rooms, furnished at real-world scale.' },
      { service: 'furniture-removal-and-staging', why: 'occupied homes where oversized or dated furniture hides the room.' },
      { service: 'photo-enhancement', why: 'even light and true color in older, smaller-windowed rooms.' },
    ],
    image: 'lib-coastal-porch', imageNote: 'A covered porch with coastal styling. On an exterior, Stellar allows only unattached furniture and decor to be added.',
    pointsH: 'What Gulfport listings ask of photos',
    localAngle: [
      { h: 'Small rooms need honest scale', b: 'Where rooms are compact, undersized furniture is tempting. Stellar prohibits furniture that makes a room seem larger than it is.' },
      { h: 'A raised home is shown as it stands', b: 'Gulfport applies the FEMA 50% rule: a substantially damaged home must be elevated or rebuilt to current floodplain code, above the base flood elevation plus one foot. Photograph the home as it is now, without editing back its old look.' },
      { h: 'Permits belong in the file, not the photo', b: 'Since October 1, 2024 the city has processed 3,420 permit applications, and it lists 192 flooded properties without permits. Ask the seller for permit records before marketing any renovation.' },
    ],
    facts: [
      { text: '57.9-acre Waterfront Redevelopment District along Beach Blvd. South, created August 18, 1992, allowing mixed uses while preserving existing residential neighborhoods.', source: 'City of Gulfport, Waterfront Redevelopment District', url: 'https://mygulfport.us/waterfront-redevelopment-district/', evidence: 'opened' },
      { text: 'More than 600 Gulfport properties were impacted by the 2024 hurricane season.', source: 'City of Gulfport homepage', url: 'https://mygulfport.us/', evidence: 'opened' },
      { text: 'Repairs of 50% or more of pre-damage value must meet current flood-zone standards, including elevation above the base flood elevation plus one foot.', source: 'City of Gulfport, FEMA information', url: 'https://mygulfport.us/fema', evidence: 'opened' },
      { text: '3,420 permit applications processed since October 1, 2024; 192 flooded properties without permits.', source: 'City of Gulfport, flood damage update', url: 'https://mygulfport.us/flood-damage-update/', evidence: 'opened' },
      { text: 'The Casino was listed in the National Register of Historic Places on August 8, 2014, and is one of only three local historical landmarks in the city, which incorporated in 1910.', source: 'City of Gulfport, Casino history', url: 'https://mygulfport.us/recreation/casino/casino-history/', evidence: 'opened' },
    ],
    faq: [
      { q: 'How do you stage a small Gulfport living room without making it look bigger?', a: 'By drawing furniture at its real size and leaving normal walking space. Stellar prohibits furniture that makes a room seem larger than it is, so a smaller sofa than the room would really hold is not an option.' },
      { q: 'My listing was raised after the storms. Can the edit hide the new stairs?', a: 'No. Stairs, entries and other permanent features stay as photographed. On the outside of a home, Stellar allows only unattached furniture or decor to be added.' },
      { q: 'Does it matter if the home is in the waterfront district?', a: 'Not for the editing itself. The district mixes shops and restaurants with residential streets, but the photos show the home, and the process is the same anywhere in Gulfport.' },
    ],
    nearby: ['st-petersburg-fl', 'south-pasadena', 'st-pete-beach'], guides: [G.prep, G.disclosure, G.vs],
    hubLine: 'Mostly detached homes near a mixed-use waterfront, with thousands of post-storm permits filed.', linkLabel: 'Gulfport staging guide',
    cta: { h: 'Listing a home in Gulfport?', p: 'Send a note about the rooms, their rough sizes and where the images will be used.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: OK,
    title: 'Virtual Staging in Gulfport, FL: Small Homes, True Scale | StageLiora',
    description: 'Virtual staging for Gulfport, FL listings: detached homes near the waterfront district, the FEMA 50% rule, post-storm permits and furniture drawn at true scale.',
  },
  {
    slug: 'treasure-island', path: '/locations/treasure-island/', name: 'Treasure Island', officialName: 'City of Treasure Island', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.mytreasureisland.org/', relationship: 'Gulf barrier island reached by the John\'s Pass, Blind Pass and Treasure Island Causeway bridges',
    units: 6192, detached: 36, tenPlus: 34, mobile: 1,
    listing: { label: 'ZIP 33706, reported as Saint Petersburg', zips: '33706', active: 362, fresh: 84, dom: '99 days', price: '$599,000 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a Treasure Island figure.' },
    keywords: { primary: 'virtual staging Treasure Island FL', secondary: ['Treasure Island condo-hotel listing photos', 'Sunset Beach cottage staging', 'Treasure Island beach home photos'] },
    h1: 'Virtual staging in Treasure Island, FL: condo-hotels, cottages and low ground',
    intro: 'Treasure Island runs along nearly four miles of Gulf beach. The city\'s own guide describes a mid-island strip of motels, hotels and condo-hotels, with more residential ends at Sunshine Beach and Sunset Beach, home to everything from beach cottages to three-story Key West-style houses.',
    staging: {
      eyebrow: 'Island listings',
      h: 'One island, two very different kinds of listing',
      p: [
        'A unit in a mid-island condo-hotel and a cottage at Sunset Beach share a ZIP code and little else. The first usually needs compact, durable-looking furniture in a single open room. The second may need a whole house furnished, porch included.',
        'Either way, the edit keeps the island as it is. The water stays as photographed, the sunset in a twilight edit must be where the sun really sets, and storm repairs are shown, not hidden.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'vacant condo-hotel units and empty cottages.' },
      { service: 'day-to-dusk', why: 'Gulf-side twilight images, where the sun position must be true.' },
      { service: 'photo-enhancement', why: 'bright beach light balanced without changing the view.' },
    ],
    image: 'lib-coastal-deck', imageNote: 'A deck with coastal furniture. Unattached outdoor furniture is the only kind of exterior staging Stellar allows.',
    pointsH: 'What Treasure Island listings ask of photos',
    localAngle: [
      { h: 'Know which end of the island you are on', b: 'Mid-island is mostly motels, hotels and condo-hotels; the north and south ends are more residential. Style and furniture scale should follow the building, not the beach.' },
      { h: 'Keep the water as it is', b: 'Stellar names an edited-in water view as prohibited, and that matters in any island market.' },
      { h: 'Low ground, honest condition', b: 'The whole city is in Evacuation Zone A because of its low elevation and the strong possibility of storm surge and flooding. Photos should show current condition, and the county\'s substantial-damage deadline still applies to letter holders.' },
    ],
    facts: [
      { text: 'The four towns of Treasure Island, Boca Ciega, Sunshine Beach and Sunset Beach incorporated as the City of Treasure Island on May 3, 1955.', source: 'City of Treasure Island, Resident Guide (2021)', url: 'https://cms3.revize.com/revize/mytreasureislandsb/Documents/Resident%20Guide%204-2021.pdf', evidence: 'opened' },
      { text: 'The city lists five neighborhoods: Sunshine Beach, Sunset Beach, Isle of Capri, Isle of Palms and Paradise Island.', source: 'City of Treasure Island, Resident Guide (2021)', url: 'https://cms3.revize.com/revize/mytreasureislandsb/Documents/Resident%20Guide%204-2021.pdf', evidence: 'opened' },
      { text: 'Treasure Island is in Evacuation Zone A due to its low elevation, and the city operates one of its three bridges, a drawbridge on the causeway.', source: 'City of Treasure Island, Resident Guide (2021)', url: 'https://cms3.revize.com/revize/mytreasureislandsb/Documents/Resident%20Guide%204-2021.pdf', evidence: 'opened' },
      SD,
    ],
    faq: [
      { q: 'How should a Treasure Island condo-hotel unit be staged?', a: 'As the room it is: compact furniture at true scale and no added view. Whether a unit can be rented by the night depends on its building and zoning, so confirm that before styling it as a rental.' },
      { q: 'Can a twilight edit show the sunset over the Gulf?', a: 'Only if the sun really sets in that direction from that view. Stellar accepts twilight photos when no lighting is added where none exists and the sun position is true.' },
      { q: 'Which neighborhoods does this guide cover?', a: 'All of the city, which lists five neighborhoods: Sunshine Beach, Sunset Beach, Isle of Capri, Isle of Palms and Paradise Island. Listing data for the area is reported under a Saint Petersburg ZIP.' },
    ],
    nearby: ['madeira-beach', 'st-pete-beach', 'st-petersburg-fl'], guides: [G.disclosure, G.prep, G.cost],
    hubLine: 'Condo-hotels mid-island, cottages and Key West-style houses at Sunshine and Sunset Beach.', linkLabel: 'Treasure Island staging guide',
    cta: { h: 'A listing on Treasure Island?', p: 'Tell us which end of the island it is on, which rooms you need and where the images will run.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: `${OK} The city's about page blocked automated reading, so facts come from the city's own Resident Guide.`,
    title: 'Virtual Staging in Treasure Island, FL: Beach Listings | StageLiora',
    description: 'Virtual staging for Treasure Island, FL: condo-hotel units mid-island, cottages at Sunset Beach, Evacuation Zone A and Stellar MLS rules for views and twilight.',
  },
  {
    slug: 'south-pasadena', path: '/locations/south-pasadena/', name: 'South Pasadena', officialName: 'City of South Pasadena', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.mysouthpasadena.com/', relationship: 'Small bayfront city sharing boundaries with St. Petersburg, Gulfport and St. Pete Beach',
    units: 4998, detached: 6, tenPlus: 80, mobile: 8,
    listing: { label: 'ZIP 33707, reported as Saint Petersburg', zips: '33707', active: 278, fresh: 72, dom: '81 days', price: '$394,999 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a South Pasadena figure.' },
    keywords: { primary: 'virtual staging South Pasadena FL', secondary: ['South Pasadena Florida condo staging', 'condo listing photos Pinellas County', 'occupied condo virtual staging'] },
    h1: 'Virtual staging in South Pasadena, Florida: a condo city in Pinellas County',
    intro: 'South Pasadena, Florida covers 0.6 square mile between St. Petersburg, Gulfport and St. Pete Beach. About 80% of its housing units are in buildings of ten or more units, the most multi-family mix of the 12 cities on this site, and every property in the city is in a mapped flood hazard area.',
    staging: {
      eyebrow: 'Condo interiors',
      h: 'Staging condo rooms, balconies and occupied units',
      p: [
        'With only about 6% of homes detached, a South Pasadena listing is usually a condo. Virtual staging furnishes the living room, dining area and bedrooms so buyers can judge the layout, and it can replace a seller\'s own furniture when the unit is still lived in.',
        'Balconies and patios count as exterior spaces in Stellar MLS, so only unattached furniture and decor can be added there. The water view, if there is one, stays as photographed.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'vacant condo units, room by room.' },
      { service: 'furniture-removal-and-staging', why: 'occupied units, which Stellar allows to be shown with digital furniture in place of the existing pieces.' },
      { service: 'photo-enhancement', why: 'interior light and color, with windows and views left true.' },
    ],
    image: 'lib-contemporary-living-room', imageNote: 'A contemporary living room design with a compact seating group, the kind of layout a condo living room often calls for.',
    pointsH: 'What South Pasadena listings ask of photos',
    localAngle: [
      { h: 'Think condo interiors first', b: 'Living rooms, small dining areas and enclosed balconies will come up more often than yards. Stellar allows only unattached furniture and decor on exterior spaces.' },
      { h: 'Every lot is in a flood zone', b: 'The city says all property within its limits is in a Special Flood Hazard Area, and new or substantially improved buildings must be built at least two feet above base flood elevation. Show updated units as they are; flood questions belong in the disclosures.' },
      { h: 'Check community rules before assuming anything', b: 'Rules on rentals, pets or occupancy are set building by building. This page makes no claim about any building, and staging should not imply one.' },
    ],
    facts: [
      { text: 'Incorporated July 1, 1955; 0.6 square mile; shares boundaries with St. Petersburg, Gulfport and St. Pete Beach; population about 5,000.', source: 'City of South Pasadena, about the city', url: 'https://files.mysouthpasadena.com/community/about_south_pasadena.php', evidence: 'opened' },
      { text: 'All property in the city is in a Special Flood Hazard Area; new or substantially improved buildings must be at least 2 feet above base flood elevation; the city takes part in the NFIP and the Community Rating System.', source: 'City of South Pasadena, FEMA and flood safety', url: 'https://files.mysouthpasadena.com/government/departments/community_improvement/fema_flood_safety.php', evidence: 'opened' },
    ],
    faq: [
      { q: 'Is this guide about South Pasadena, California?', a: 'No. This page is about South Pasadena, Florida, a small city in Pinellas County between St. Petersburg, Gulfport and St. Pete Beach.' },
      { q: 'Can you stage a condo that is still occupied?', a: 'Yes. Stellar MLS permits removing existing furniture from a photo and replacing it with digital furniture and decor. Defects and permanent fixtures must stay as they are.' },
      { q: 'Can you stage a balcony or patio?', a: 'Only with unattached furniture or decor, such as a bistro set or planters on the floor. Stellar prohibits other virtual staging of exterior spaces.' },
    ],
    nearby: ['st-petersburg-fl', 'gulfport', 'st-pete-beach'], guides: [G.faqs, G.disclosure, G.prep],
    hubLine: 'The most condo-heavy city on this site, with every property in a mapped flood zone.', linkLabel: 'South Pasadena condo staging guide',
    cta: { h: 'Selling a condo in South Pasadena?', p: 'Tell us whether the unit is vacant or occupied, which rooms you need and where the photos will run.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: `${OK} The earlier retirees and 300-homes claim could not be found on the city's page and was removed.`,
    title: 'Virtual Staging in South Pasadena, FL: Condo Interiors | StageLiora',
    description: 'Virtual staging for South Pasadena, Florida condos: a mostly multi-family city, occupied-unit staging, balcony rules and flood-zone context. Not California.',
  },
  {
    slug: 'madeira-beach', path: '/locations/madeira-beach/', name: 'Madeira Beach', officialName: 'City of Madeira Beach', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.madeirabeachfl.gov/', relationship: 'Gulf barrier island city, home to John\'s Pass Village',
    units: 4001, detached: 37, tenPlus: 40, mobile: 1,
    listing: { label: 'ZIP 33708, reported as Saint Petersburg', zips: '33708', active: 325, fresh: 56, dom: '100 days', price: '$599,900 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a Madeira Beach figure.' },
    keywords: { primary: 'virtual staging Madeira Beach', secondary: ['Madeira Beach listing photos', 'John\'s Pass condo staging', 'Madeira Beach vacation rental rules', 'substantial damage letter listing'] },
    h1: 'Virtual staging in Madeira Beach, FL: John\'s Pass, rental maps and recovery',
    intro: 'Madeira Beach is a Gulf barrier island city with a two-mile beach and John\'s Pass Village at its southern end. Its roughly 4,000 housing units are split between larger buildings (about 40%) and detached homes (about 37%), and after Helene the city posted substantial-damage letters address by address.',
    staging: {
      eyebrow: 'Island recovery',
      h: 'Staging what is finished, and only what is finished',
      p: [
        'Many Madeira Beach listings follow a repair or a rebuild. Virtual staging can furnish finished rooms so buyers see a home rather than an empty shell, but it must not be used on a property that is still under construction.',
        'Rental rules matter here too. The city maps where vacation rentals are restricted, so check that map before giving a unit the look of a short-stay rental.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'finished, empty rooms after repairs or between owners.' },
      { service: 'furniture-removal-and-staging', why: 'occupied homes and furnished rentals with tired furniture.' },
      { service: 'photo-enhancement', why: 'correcting exposure and color without changing the property.' },
    ],
    image: 'lib-coastal-primary-bedroom', imageNote: 'A coastal bedroom design. In a real listing, the bed and furniture sizes have to suit the actual room.',
    pointsH: 'What Madeira Beach listings ask of photos',
    localAngle: [
      { h: 'Photos should match the recovery status', b: 'The city sends a substantial-damage letter only when FEMA\'s assessment tool finds a home substantially damaged, and it posts those letters by address. Check a property\'s status with the city, and let photos show the home as it is.' },
      { h: 'Vacation rental rules are mapped', b: 'The city publishes a vacation rental restriction map and an interactive zoning and rental map. Styling a unit as a nightly rental where that is restricted would set the wrong expectation.' },
      { h: 'Water views stay as shot', b: 'Near John\'s Pass and along the Gulf, the view is a selling point. Stellar names an edited-in water view as prohibited, so the window shows only what the camera saw.' },
    ],
    facts: [
      { text: 'The city posts per-address substantial-damage letters after Helene, and sends one only when FEMA\'s Substantial Damage tool finds a home substantially damaged.', source: 'City of Madeira Beach, substantial damage letters', url: 'https://madeirabeachfl.gov/substantial-damage-letters/', evidence: 'opened' },
      { text: 'The city held a public meeting on the FEMA 50% rule on October 23, 2024.', source: 'City of Madeira Beach, FEMA 50% rule meeting', url: 'https://madeirabeachfl.gov/fema-50-rule-public-meeting-10-23-24/', evidence: 'opened' },
      { text: 'John\'s Pass Village has its own zoning district and development standards (Ordinances 2024-09 and 2024-11).', source: 'City of Madeira Beach, John\'s Pass Village Activity Center plan', url: 'https://madeirabeachfl.gov/johns-pass-activity-center-plan/', evidence: 'opened' },
      { text: 'The city publishes a vacation rental restriction map (August 2021) and an interactive zoning and rental restrictions map.', source: 'City of Madeira Beach, vacation rental restriction map', url: 'https://madeirabeachfl.gov/documents/vacation-rental-restriction-map/', evidence: 'opened' },
      { text: 'The city describes itself as a Gulf Coast barrier island community with a two-mile beach.', source: 'City of Madeira Beach, about', url: 'https://madeirabeachfl.gov/about/', evidence: 'opened' },
    ],
    faq: [
      { q: 'How do I check whether a Madeira Beach home received a substantial-damage letter?', a: 'The city posts its Helene letters by address on its website, and letters go only to homes its assessment found substantially damaged. Confirm the status with the city before listing.' },
      { q: 'Can I stage a Madeira Beach condo as a vacation rental?', a: 'Check the city\'s vacation rental restriction map first. Where short stays are restricted, stage the unit as a home to live in.' },
      { q: 'Can you stage a home that is being rebuilt?', a: 'Not for a Stellar listing photo. Virtual staging must not be used for pre-construction or under-construction properties. Wait until the rooms are finished.' },
    ],
    nearby: ['treasure-island', 'st-pete-beach', 'seminole'], guides: [G.disclosure, G.agents, G.prep],
    hubLine: 'John\'s Pass, mapped vacation rental limits and address-by-address storm letters.', linkLabel: 'Madeira Beach staging guide',
    cta: { h: 'Listing in Madeira Beach?', p: 'Tell us whether the home is finished, which rooms you need and where the photos will be used.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: OK,
    title: 'Virtual Staging in Madeira Beach, FL: Island Listings | StageLiora',
    description: 'Virtual staging for Madeira Beach, FL: John\'s Pass, vacation rental maps, address-level storm letters and why only finished rooms can be staged under Stellar.',
  },
  {
    slug: 'pinellas-park', path: '/locations/pinellas-park/', name: 'Pinellas Park', officialName: 'City of Pinellas Park', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.pinellaspark.gov/', relationship: 'Borders St. Petersburg and Largo',
    units: 25640, detached: 52, tenPlus: 14, mobile: 15,
    listing: { label: 'ZIPs 33781 and 33782', zips: '33781, 33782', active: 185, fresh: 52, dom: '79 to 81 days', price: '$312,200 to $334,900 median list price', caveat: 'Postal ZIPs, not city limits. Each ZIP\'s median is shown separately rather than averaged.' },
    keywords: { primary: 'virtual staging Pinellas Park', secondary: ['Pinellas Park FL listing photos', 'mobile home virtual staging', 'small house staging Pinellas County'] },
    h1: 'Virtual staging in Pinellas Park: detached homes and manufactured housing',
    intro: 'About 52% of housing units here are single detached homes and about 15% are mobile homes, one of the larger shares among these 12 cities. Those homes are photographed differently from a downtown condo, and often in tighter spaces.',
    staging: {
      eyebrow: 'Houses and manufactured homes',
      h: 'Staging narrow rooms without distorting them',
      p: [
        'In a mid-century house or a manufactured home, rooms can be narrow and furniture choices are tight. Virtual staging shows a realistic layout: a sofa that fits the wall, a bed with room to walk around it, a dining table that leaves the doorway clear.',
        'The goal is a photo that buyers recognize when they walk in. Stellar prohibits furniture that makes a room seem larger than it is, and it does not allow walls, floors or fixtures to be changed.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'empty houses and manufactured homes, furnished at true scale.' },
      { service: 'furniture-removal-and-staging', why: 'occupied homes where bulky furniture crowds a small room.' },
      { service: 'photo-enhancement', why: 'brighter, truer photos of rooms with limited window light.' },
    ],
    image: 'lib-scandinavian-living-room', imageNote: 'A Scandinavian living room design with light, low furniture, a style often chosen for smaller rooms. The scale still has to be true to the room.',
    pointsH: 'What Pinellas Park listings ask of photos',
    localAngle: [
      { h: 'Narrow rooms test furniture scale', b: 'In narrower rooms, a realistic furniture layout matters more than filling the space. Stellar prohibits furniture that distorts how large a room appears.' },
      { h: 'Do not assume "inland" means no flood history', b: 'The city says it has historically flooded because of its proximity to the Gulf and Tampa Bay, and much of it was swamp until the Cross Bayou Canal was dug in 1916. Avoid implying otherwise in listing materials.' },
      { h: 'Older homes in the redevelopment area', b: 'In the city\'s 2018 study of its redevelopment expansion area, the median home was built in 1970, and the area held nearly 50 acres of mobile home parks. That figure covers the study area only, not the whole city.' },
    ],
    facts: [
      { text: 'The city says it has historically experienced flooding due to its proximity to the Gulf of Mexico and Tampa Bay.', source: 'City of Pinellas Park, flood protection', url: 'https://www.pinellaspark.gov/313/Flood-Protection', evidence: 'opened' },
      { text: 'Incorporated October 14, 1914; the 1916 Cross Bayou Canal drained the swamps, allowing farming and later development.', source: 'City of Pinellas Park, CRA expansion findings report (2018)', url: 'https://www.pinellaspark.gov/DocumentCenter/View/6723/Pinellas-Park-CRA-Expansion-2018-FON-Report', evidence: 'opened' },
      { text: 'In the CRA expansion study area, the median year built of 1,062 residential structures (excluding mobile homes) is 1970, and there are nearly 50 acres of mobile home parks.', source: 'City of Pinellas Park, CRA expansion findings report (2018)', url: 'https://www.pinellaspark.gov/DocumentCenter/View/6723/Pinellas-Park-CRA-Expansion-2018-FON-Report', evidence: 'opened' },
    ],
    faq: [
      { q: 'Can you virtually stage a mobile home in Pinellas Park?', a: 'Yes. The same rules apply as for any home: furniture at true scale, and walls, floors and fixtures left as photographed.' },
      { q: 'The home is inland. Does flood history still matter?', a: 'It can. The city itself says it has flooded because of its proximity to the Gulf and Tampa Bay. Listing materials should not suggest otherwise, and photos should show the home\'s current condition.' },
      { q: 'What photos should I send for a smaller home?', a: 'Wide, uncropped, full-resolution originals taken from a corner of each room, plus rough room sizes if you have them. Our photo preparation guide covers the details.' },
    ],
    nearby: ['largo', 'seminole', 'st-petersburg-fl'], guides: [G.prep, G.cost, G.disclosure],
    hubLine: 'Detached homes and manufactured housing, where narrow rooms test furniture scale.', linkLabel: 'Pinellas Park staging guide',
    cta: { h: 'A listing in Pinellas Park?', p: 'Tell us the type of home, which rooms need furnishing and where the images will appear.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: OK,
    title: 'Virtual Staging in Pinellas Park, FL: Compact Homes | StageLiora',
    description: 'Virtual staging for Pinellas Park, FL: detached and manufactured homes, narrow rooms drawn at true scale, flood history and older homes near redevelopment.',
  },
  {
    slug: 'seminole', path: '/locations/seminole/', name: 'Seminole', officialName: 'City of Seminole', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.myseminole.com/', relationship: 'North of St. Petersburg, between Largo and the beach cities',
    units: 10843, detached: 41, tenPlus: 31, mobile: 13,
    listing: { label: 'Postal city "Seminole" (3 ZIPs)', zips: '33772, 33776, 33777', active: 316, fresh: 104, dom: '62 to 68 days by ZIP', price: '$299,450 to $546,950 median list price by ZIP', caveat: 'Postal-city figures are not city limits. The postal area may extend beyond the city limits.' },
    keywords: { primary: 'virtual staging Seminole FL', secondary: ['Seminole FL condo listing photos', 'Seminole Florida real estate photos', 'staging condos and villas Pinellas'] },
    h1: 'Virtual staging in Seminole, FL: condos, villas and a city that doubled in size',
    intro: 'Seminole\'s housing is split between detached homes (about 41% of units), larger buildings (about 31%) and mobile homes (about 13%). It was the last Pinellas municipality to incorporate, in 1970, and its population and land area doubled in the early 2000s through annexations.',
    staging: {
      eyebrow: 'Mixed housing',
      h: 'Staging for a mix of condos, apartments and houses',
      p: [
        'The city notes that it has several condominiums, apartments and retirement homes alongside its single-family neighborhoods. That means a Seminole listing might be a one-bedroom condo, a villa or a family house, and each one calls for a different staging plan.',
        'Staging is chosen for the space, never for an assumed type of buyer. The aim is a clear, accurate picture of how each room can be used.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'vacant condos, villas and houses.' },
      { service: 'furniture-removal-and-staging', why: 'homes that are still furnished when they are photographed.' },
      { service: 'photo-enhancement', why: 'consistent light and color across a full set of listing photos.' },
    ],
    image: 'lib-transitional-primary-bedroom', imageNote: 'A transitional bedroom design. Neutral, uncluttered rooms are easy for any buyer to read.',
    pointsH: 'What Seminole listings ask of photos',
    localAngle: [
      { h: 'Postal area versus city', b: 'The area using a Seminole mailing address may extend beyond the city limits. Any local claim has to be clear about which one it means.' },
      { h: 'Annexed areas are part of the city now', b: 'Nine annexation referendums between 2000 and 2003 roughly doubled the city\'s population and land area, bringing in condominium communities and subdivisions. A home\'s jurisdiction can be newer than the home itself.' },
      { h: 'Repairs should look like repairs', b: 'The city reports spending $1,391,385 on recovery from Hurricanes Helene and Milton. Photos of a repaired home should show it as it is now.' },
    ],
    facts: [
      { text: 'Seminole became the last municipality to incorporate in Pinellas County, on November 15, 1970.', source: 'City of Seminole, timeline', url: 'https://www.myseminole.com/373/Timeline', evidence: 'opened' },
      { text: 'Nine large annexation referendums between 2000 and 2003 doubled the city\'s population and land area.', source: 'City of Seminole, timeline', url: 'https://www.myseminole.com/373/Timeline', evidence: 'opened' },
      { text: 'The city has several condominiums, apartments and retirement homes, covers 5.3 square miles, and spent $1,391,385 on Helene and Milton recovery.', source: 'City of Seminole, Annual Comprehensive Financial Report FY2025', url: 'https://www.myseminole.com/ArchiveCenter/ViewFile/Item/115', evidence: 'opened' },
    ],
    faq: [
      { q: 'Does a Seminole mailing address mean the home is in the city?', a: 'Not always. The postal area may extend beyond the city limits, so check the property records before describing a home as being in the City of Seminole.' },
      { q: 'Can you stage a condo or villa in Seminole?', a: 'Yes, vacant or occupied. In an occupied home, Stellar permits replacing existing furniture with digital furniture, as long as defects and permanent fixtures stay as they are.' },
      { q: 'Can staging make a repaired home look move-in ready?', a: 'Only if it is. Staging adds furniture to finished rooms. It cannot hide damage or unfinished work, and Stellar prohibits staging properties that are still under construction.' },
    ],
    nearby: ['largo', 'pinellas-park', 'madeira-beach'], guides: [G.agents, G.disclosure, G.vs],
    hubLine: 'Condos, apartments and houses in a city that doubled through annexation.', linkLabel: 'Seminole staging guide',
    cta: { h: 'Listing a home in Seminole?', p: 'Tell us the type of home, which rooms you need and where the images will be used.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: `${OK} Age statistics are deliberately not used to target staging.`,
    title: 'Virtual Staging in Seminole, FL: Condos, Villas, Houses | StageLiora',
    description: 'Virtual staging for Seminole, FL listings: a mix of condos, apartments and houses, the postal-versus-city question, annexed areas and storm-repair photos.',
  },
  {
    slug: 'largo', path: '/locations/largo/', name: 'Largo', officialName: 'City of Largo', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.largo.com/', relationship: 'Central Pinellas, with Clearwater to the north',
    units: 46806, detached: 30, tenPlus: 24, mobile: 26,
    listing: { label: 'Postal city "Largo" (5 ZIPs)', zips: '33770, 33771, 33773, 33774, 33778', active: 407, fresh: 128, dom: '47 to 93 days by ZIP', price: '$299,000 to $399,900 median list price by ZIP', caveat: 'Postal-city figures are not city limits.' },
    keywords: { primary: 'virtual staging Largo FL', secondary: ['manufactured home virtual staging', 'Largo FL mobile home listing photos', 'Largo real estate photo editing'] },
    h1: 'Virtual staging in Largo, FL: where manufactured homes are a major part of the market',
    intro: 'About 26% of Largo\'s housing units are mobile homes, close to the 30% that are single detached homes. No other city on this site comes close to that share, and it should shape how listing photos are planned here.',
    staging: {
      eyebrow: 'Manufactured homes',
      h: 'Staging manufactured and older homes as they really are',
      p: [
        'A manufactured home has its own proportions: long, narrow rooms, lower ceilings in some models and built-in features that cannot be moved. Virtual staging can show buyers a workable layout in those rooms, with furniture sized for them.',
        'Largo\'s housing is also older than most: the city\'s own report says 60% was built before 1980. Staging furnishes the rooms, but finishes, walls and fixtures stay as photographed. Stellar does not allow paint colors or permanent features to be changed.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'empty manufactured homes and older houses.' },
      { service: 'furniture-removal-and-staging', why: 'seasonal homes or estates that are listed still furnished.' },
      { service: 'photo-enhancement', why: 'truer color and light in rooms with small or few windows.' },
    ],
    image: 'lib-scandinavian-sunroom', imageNote: 'A sunroom design with light wood furniture. Enclosed sunrooms are common in Florida homes, and they are staged like any other room.',
    pointsH: 'What Largo listings ask of photos',
    localAngle: [
      { h: 'Manufactured-home rooms have their own proportions', b: 'Room widths and wall treatments can differ from a site-built house, and some parks hold homes built before the 1976 HUD Code. Good staging respects those proportions rather than hiding them.' },
      { h: 'Listing pace varies within the city', b: 'Median days on market ran from 47 to 93 days across Largo\'s ZIPs in October 2026, so a single citywide statement about pace would be misleading.' },
      { h: 'Seasonal homes are often listed furnished', b: 'More than one in eight Largo housing units (12.8%) is held for seasonal use, according to the city. A seasonal home listed with its owner\'s furniture can be a case for furniture removal and staging.' },
    ],
    facts: [
      { text: 'Mobile homes are about 27% of housing, around 12,400 units, and the median year built for Largo housing is 1977.', source: 'City of Largo housing market and needs report', url: 'https://cms7files.revize.com/largoflorida/document_center/Housing%20Assistance%20Resources/Housing%20Market,%20Needs%20Final%2012-10-23.pdf', evidence: 'opened' },
      { text: '60% of Largo\'s housing was built before 1980, with the 1970s the largest decade (36.5% of the stock); 12.8% of units are held for seasonal use.', source: 'City of Largo housing market and needs report', url: 'https://cms7files.revize.com/largoflorida/document_center/Housing%20Assistance%20Resources/Housing%20Market,%20Needs%20Final%2012-10-23.pdf', evidence: 'opened' },
      { text: 'Some mobile home parks are dominated by homes built before the 1976 HUD Code, and the city reports flooding in older parks with limited stormwater systems.', source: 'City of Largo housing market and needs report', url: 'https://cms7files.revize.com/largoflorida/document_center/Housing%20Assistance%20Resources/Housing%20Market,%20Needs%20Final%2012-10-23.pdf', evidence: 'opened' },
      { text: 'Downtown Largo\'s historic core runs along West Bay Drive and Clearwater-Largo Road.', source: 'City of Largo, Downtown Largo', url: 'https://largo.com/connect/living_in_largo/downtown_largo/', evidence: 'opened' },
    ],
    faq: [
      { q: 'Can you virtually stage a manufactured home in Largo?', a: 'Yes. Furniture is drawn to suit the real room widths, and walls, ceilings and built-in features stay as photographed.' },
      { q: 'Can staging make an older mobile home look newer?', a: 'No. Staging adds furniture and decor. Stellar does not allow paint colors, permanent fixtures or the condition of the home to be changed in a listing photo.' },
      { q: 'Why does this page show 26% mobile homes when the city says 27%?', a: 'They come from different sources. The 26% is from the Census Bureau\'s 2020 to 2024 survey; the 27% is from the city\'s own housing report. Both say roughly one home in four.' },
    ],
    nearby: ['pinellas-park', 'seminole', 'clearwater'], guides: [G.prep, G.cost, G.vs],
    hubLine: 'About one home in four is a mobile home, and 60% of housing predates 1980.', linkLabel: 'Largo staging guide',
    cta: { h: 'Have a Largo listing?', p: 'Tell us whether it is a manufactured home or a house, which rooms you need and where the photos will run.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: `${OK} The owner's approval settles that this site, not a separate property, covers Largo.`,
    title: 'Virtual Staging in Largo, FL: Manufactured Homes | StageLiora',
    description: 'Virtual staging for Largo, FL: a market where mobile homes are about a quarter of housing, 60% of homes predate 1980, and days on market vary widely by ZIP.',
  },
  {
    slug: 'clearwater', path: '/locations/clearwater/', name: 'Clearwater', officialName: 'City of Clearwater', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.myclearwater.com/', relationship: 'North of St. Petersburg, with its beach on a separate barrier island',
    units: 61123, detached: 38, tenPlus: 36, mobile: 5,
    listing: { label: 'Postal city "Clearwater" (9 ZIPs)', zips: '33755–33765', active: 1043, fresh: 260, dom: '62 to 115 days by ZIP', price: '$199,000 to $405,000 median list price by ZIP', caveat: 'Postal-city figures are not city limits. Clearwater Beach (33767) is reported separately and is not included.' },
    keywords: { primary: 'virtual staging Clearwater FL', secondary: ['Clearwater Beach condo listing photos', 'Island Estates listing photos', 'Clearwater real estate photo editing'] },
    h1: 'Virtual staging in Clearwater, FL: beach condos and mainland homes',
    intro: 'Clearwater\'s 61,123 housing units split almost evenly between single detached homes (38%) and buildings of ten or more units (36%). Its beach, on a separate barrier island, has been planned under its own rules, Beach by Design, since 2001.',
    staging: {
      eyebrow: 'Beach and mainland',
      h: 'Two markets under one city name',
      p: [
        'A Gulf-front condo on Clearwater Beach and a house on the mainland need different staging. The condo calls for compact pieces that keep the windows clear. The house may need several rooms furnished in a consistent style.',
        'In both, Stellar MLS rules apply: the view stays as photographed, a twilight edit must show the sun where it really sets, and a home that is still being rebuilt cannot be virtually staged.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'vacant beach condos and empty mainland houses.' },
      { service: 'furniture-removal-and-staging', why: 'occupied homes and furnished rentals.' },
      { service: 'day-to-dusk', why: 'Gulf-facing twilight images, with no lights added where none exist.' },
    ],
    image: 'lib-modern-living-room', imageNote: 'A modern living room design with low, clean-lined furniture, a style that suits many newer condo towers.',
    pointsH: 'What Clearwater listings ask of photos',
    localAngle: [
      { h: 'The beach and the mainland are different briefs', b: 'Beach by Design divides Clearwater Beach into eight character districts, from Old Florida and the Small Motel District to Pier 60. Staging should follow the building in the photo, not a single citywide look.' },
      { h: 'Rebuilt is not the same as repaired', b: 'In September 2026 Bay News 9 reported that some homes in Island Estates were still being rebuilt, with others torn down and their lots left empty. Stage finished rooms only; Stellar prohibits staging under-construction properties.' },
      { h: 'Leave the water and the sunset as they are', b: 'Stellar names an edited-in water view as prohibited, and twilight edits must show the sun where it truly sets.' },
    ],
    facts: [
      { text: 'Beach by Design, adopted in 2001, divides Clearwater Beach into eight character districts.', source: 'City of Clearwater, Beach by Design', url: 'https://www.myclearwater.com/Business-Development/City-Projects/Beach-by-Design', evidence: 'opened' },
      { text: 'The city\'s Community Rating System class improved from 6 to 5 on October 1, 2024, giving residents a 25% discount on flood insurance; updated FEMA coastal flood maps took effect in August 2021.', source: 'City of Clearwater, floodplain management', url: 'https://myclearwater.com/My-Government/City-Departments/Public-Works/Floodplain-Management', evidence: 'opened' },
      { text: 'Some homes in Island Estates, among the hardest-hit parts of Clearwater, were still being rebuilt in September 2026.', source: 'Bay News 9, September 27, 2026', url: 'https://baynews9.com/fl/tampa/news/2026/09/27/two-years-later-clearwater-resident-shares-hurricane-helene-story', evidence: 'opened' },
      { text: 'October 2026 listings: 1,043 active, 260 new, across 9 postal ZIPs.', ...REALTOR },
    ],
    faq: [
      { q: 'Can you stage a Clearwater Beach condo with a Gulf view?', a: 'Yes, the rooms can be furnished. The view through the window stays exactly as photographed, because Stellar names an edited-in water view as prohibited.' },
      { q: 'Can I stage a home in Island Estates that is still being rebuilt?', a: 'Not in a Stellar listing photo. Virtual staging must not be used for under-construction properties. Wait until the rooms are finished.' },
      { q: 'Should the city\'s flood insurance discount appear in the photos?', a: 'No. Clearwater\'s Community Rating System class gives residents a 25% flood insurance discount, according to the city, but that belongs in the listing description, confirmed with an insurer. It has no place in an edited image.' },
      { q: 'Do Clearwater Beach listings use the same data as the mainland?', a: 'No. Realtor.com reports Clearwater Beach (33767) separately, so the figures on this page cover the nine mainland Clearwater ZIPs only.' },
    ],
    nearby: ['dunedin', 'safety-harbor', 'largo'], guides: [G.disclosure, G.agents, G.faqs],
    hubLine: 'Beach by Design districts on the island, mainland houses and Island Estates still rebuilding.', linkLabel: 'Clearwater staging guide',
    cta: { h: 'Selling in Clearwater?', p: 'Tell us whether the home is on the beach or the mainland, which rooms you need and where the images will run.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: `${OK} The owner's approval settles that this site covers Clearwater; no separate Clearwater property exists.`,
    title: 'Virtual Staging in Clearwater, FL: Beach and Mainland | StageLiora',
    description: 'Virtual staging for Clearwater, FL: Gulf-front condos under Beach by Design, mainland houses, Island Estates rebuilding and Stellar MLS view and twilight rules.',
  },
  {
    slug: 'dunedin', path: '/locations/dunedin/', name: 'Dunedin', officialName: 'City of Dunedin', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.dunedin.gov/', relationship: 'North county, bordering Clearwater',
    units: 21305, detached: 45, tenPlus: 22, mobile: 11,
    listing: { label: 'ZIP 34698', zips: '34698', active: 241, fresh: 80, dom: '75 days', price: '$399,000 median list price', caveat: 'Postal ZIP, not city limits.' },
    keywords: { primary: 'virtual staging Dunedin FL', secondary: ['Dunedin historic home listing photos', 'Dunedin landmark home staging', 'Dunedin FL real estate photos'] },
    h1: 'Virtual staging in Dunedin, FL: historic landmarks and everyday homes',
    intro: 'Dunedin has 31 locally designated historic landmarks, and exterior changes to them need a Certificate of Appropriateness. About 45% of its 21,305 housing units are single detached homes, 22% are in larger buildings and 11% are mobile homes.',
    staging: {
      eyebrow: 'Historic and everyday homes',
      h: 'Staging around original features, not over them',
      p: [
        'Most Dunedin listings are everyday houses, condos and manufactured homes, staged like anywhere else. The city\'s landmark homes are the exception: their value is in original features, so staging adds furniture while every original detail stays visible and untouched.',
        'Exterior changes to a landmark need the city\'s approval, and Stellar allows only unattached furniture and decor on exterior photos. A concept image of a different paint color can help an owner plan, but it is not a listing photo.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'empty rooms in houses, condos and landmark homes alike.' },
      { service: 'furniture-removal-and-staging', why: 'occupied homes, with original features left exactly as they are.' },
      { service: 'exterior-color-visualization', why: 'owner planning only. It is a concept image and never a listing photo.' },
    ],
    image: 'lib-farmhouse-porch', imageNote: 'A porch staged with farmhouse furniture. Adding unattached furniture to a porch is allowed; changing the house itself is not.',
    pointsH: 'What Dunedin listings ask of photos',
    localAngle: [
      { h: 'A landmark home should look like a landmark', b: 'Exterior alterations within a designated landmark need a Certificate of Appropriateness from the city. Stellar does not allow permanent features to be changed in a listing photo either, so staging works around original details.' },
      { h: 'Keep the plaque in the frame', b: 'The city requires landmark owners to install a plaque where it is visible from the street. It is part of the house as it stands, so an exterior photo should not edit it out.' },
      { h: 'Heritage is local color, not a style brief', b: 'Dunedin\'s Scottish heritage, from the Highland Games to its official tartan, is real. It says little about how to stage a particular room, which should follow the house.' },
    ],
    facts: [
      { text: 'There are 31 local historic landmark designations in the city, and Dunedin qualified as a Certified Local Government in 2019.', source: 'City of Dunedin, historic preservation in Dunedin', url: 'https://www.dunedin.gov/Your-Government/Learn-and-Engage/Dunedin-insights/Enhancing-Dunedin/Historic-Preservation-in-Dunedin', evidence: 'opened' },
      { text: 'Exterior alterations within a designated landmark need a Certificate of Appropriateness; owners install a plaque visible from the street; designated properties may qualify for an ad valorem tax exemption.', source: 'City of Dunedin, historic preservation applications', url: 'https://www.dunedin.gov/City-Services/Service-Requests/Historic-Preservation-Applications', evidence: 'opened' },
      { text: 'Highland Games since 1967; Elliot tartan adopted 1983; Stirling, Scotland is a sister city.', source: 'City of Dunedin, Scottish history', url: 'https://www.dunedin.gov/Activities-and-Recreation/Arts-Culture/Scottish-History-of-Dunedin', evidence: 'opened' },
    ],
    faq: [
      { q: 'Can you virtually change the exterior of a Dunedin landmark home?', a: 'Not in a listing photo. Stellar allows only unattached furniture or decor on exteriors, and a real exterior change to a landmark needs the city\'s Certificate of Appropriateness. A concept image can help an owner plan, but it must not be presented as the home\'s condition.' },
      { q: 'Should I mention landmark status in the listing?', a: 'Only once it is confirmed with the city. Designated properties may qualify for an ad valorem tax exemption, according to the city, but whether a particular home does is a question for the city and the seller.' },
      { q: 'Can you stage a mobile home or condo in Dunedin?', a: 'Yes. About 11% of Dunedin homes are mobile homes and 22% are in larger buildings. Each is staged with furniture sized to the real room.' },
    ],
    nearby: ['clearwater', 'safety-harbor', 'largo'], guides: [G.disclosure, G.vs, G.prep],
    hubLine: '31 historic landmarks with exterior review, alongside everyday houses and condos.', linkLabel: 'Dunedin staging guide',
    cta: { h: 'Listing a home in Dunedin?', p: 'Tell us whether it is a designated landmark, which rooms you need and where the photos will appear.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: `${OK} Real-estate substance added from the city's preservation pages; the owner's approval settles geographic ownership.`,
    title: 'Virtual Staging in Dunedin, FL: Historic Homes, Condos | StageLiora',
    description: 'Virtual staging for Dunedin, FL: 31 historic landmarks with exterior review, street-visible plaques, a mixed housing stock and Stellar MLS exterior limits.',
  },
  {
    slug: 'safety-harbor', path: '/locations/safety-harbor/', name: 'Safety Harbor', officialName: 'City of Safety Harbor', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.cityofsafetyharbor.com/', relationship: 'West shore of Tampa Bay',
    units: 7650, detached: 66, tenPlus: 7, mobile: 10,
    listing: { label: 'ZIP 34695', zips: '34695', active: 64, fresh: 28, dom: '67 days', price: '$574,900 median list price', caveat: 'Postal ZIP, not city limits. A small count for one month.' },
    keywords: { primary: 'virtual staging Safety Harbor', secondary: ['Safety Harbor FL listing photos', 'Safety Harbor house staging', 'yard and tree listing photo rules'] },
    h1: 'Virtual staging in Safety Harbor, FL: a house market with big trees',
    intro: 'About 66% of housing units here are single detached homes, the largest share among the 12 cities on this site, and only 7% are in larger buildings. The city protects its largest native trees as Grand Trees and applies its own 49% rule to flood-zone repairs.',
    staging: {
      eyebrow: 'Whole houses',
      h: 'Staging whole houses, inside and out',
      p: [
        'Safety Harbor is mostly a house market, so a listing often needs several rooms furnished in one consistent style: the living room, the main bedroom, perhaps a dining room and a lanai or patio.',
        'Outside, the yard stays as it is. Stellar allows only unattached furniture and decor on exterior photos, and its photo rules prohibit adding landscape plantings. Large trees, which the city may protect, stay in the picture.',
      ],
    },
    fits: [
      { service: 'virtual-staging', why: 'empty houses, furnished room by room in one style.' },
      { service: 'furniture-removal-and-staging', why: 'occupied homes where the seller\'s furniture is still in place.' },
      { service: 'landscaping-visualization', why: 'owner planning for a yard. It is a concept image and never a listing photo.' },
    ],
    image: 'lib-traditional-living-room', imageNote: 'A traditional living room design. In a house listing, one consistent style across rooms makes the photos read as one home.',
    pointsH: 'What Safety Harbor listings ask of photos',
    localAngle: [
      { h: 'Mostly a house market', b: 'With few large buildings, staging here is more likely to mean living rooms, bedrooms and unattached patio furniture than condo interiors.' },
      { h: 'Big trees stay in the picture', b: 'A tree can be evaluated for Grand Tree status at 26 inches in diameter or more if it is one of ten listed native species, such as live oak or southern magnolia. Editing a tree out, or planting one in, would misstate the lot.' },
      { h: 'The 49% rule is the city\'s own', b: 'Structures in the flood zone are reviewed for substantial improvement and damage at 49%, and roof, window and door permits go to Pinellas County rather than the city. Ask the seller for both sets of records before marketing renovations.' },
    ],
    facts: [
      { text: 'Flood-zone structures must be reviewed for substantial improvement and substantial damage under a 49% rule; roof, window and door permits are submitted solely to Pinellas County.', source: 'City of Safety Harbor, permit requirements', url: 'https://www.cityofsafetyharbor.com/95', evidence: 'opened' },
      { text: 'Grand Tree status requires at least 26 inches in diameter, a condition rating of at least 3.5, and one of ten native species, including live oak, southern magnolia and bald cypress.', source: 'City of Safety Harbor, Grand Tree qualifying form', url: 'https://www.cityofsafetyharbor.com/DocumentCenter/View/15884/DRAFT-GRAND-TREE-QUALIFYING-FORM-', evidence: 'opened' },
      { text: 'Several structures in the city have been judged potentially eligible for the National Register of Historic Places.', source: 'City of Safety Harbor, historic sites survey', url: 'https://www.cityofsafetyharbor.com/241/Historic-Sites-Survey', evidence: 'opened' },
      { text: 'Espiritu Santo Springs is marked by a state historical marker, which notes that the Safety Harbor Sanitorium opened there in 1926.', source: 'Florida Division of Historical Resources, marker record', url: 'https://markers.flheritage.com/home/details/630', evidence: 'opened' },
    ],
    faq: [
      { q: 'Can you remove a large tree from a Safety Harbor listing photo?', a: 'No. A tree is part of the property as it stands, and the city may protect large native trees as Grand Trees. Stellar\'s photo rules also prohibit adding landscape plantings, so the yard is shown as it is.' },
      { q: 'Can you stage a lanai or patio?', a: 'Yes, with unattached furniture and decor such as a dining set or lounge chairs. Stellar prohibits other virtual staging on exterior photos.' },
      { q: 'Why is there so little listing data on this page?', a: 'ZIP 34695 had 64 active listings in October 2026. One month of a small sample is not enough to describe the market, so no conclusions are drawn from it.' },
    ],
    nearby: ['clearwater', 'dunedin', 'largo'], guides: [G.prep, G.faqs, G.cost],
    hubLine: 'The most house-heavy city here, with protected Grand Trees and its own 49% flood rule.', linkLabel: 'Safety Harbor staging guide',
    cta: { h: 'A house for sale in Safety Harbor?', p: 'Tell us which rooms and outdoor spaces you need and where the images will be used.' },
    checked: CHECKED, updated: UPDATED, decision: 'PUBLISH', decisionWhy: `${OK} Real-estate substance added from the city's permit, tree and survey pages.`,
    title: 'Virtual Staging in Safety Harbor, FL: Houses and Yards | StageLiora',
    description: 'Virtual staging for Safety Harbor, FL: a house-heavy market, protected Grand Trees, the city\'s 49% flood rule and Stellar MLS limits on yard and exterior edits.',
  },
];

/** ZIP table for the St. Petersburg guide. Realtor.com, October 2026, from project research data. */
export const stPeteZips = [
  { zip: '33701', active: 232, fresh: 56, dom: 74, price: 1199500 }, { zip: '33702', active: 190, fresh: 48, dom: 78, price: 337400 },
  { zip: '33703', active: 248, fresh: 72, dom: 86, price: 430000 }, { zip: '33704', active: 100, fresh: 36, dom: 89, price: 975000 },
  { zip: '33705', active: 192, fresh: 44, dom: 61, price: 399000 }, { zip: '33706', active: 362, fresh: 84, dom: 99, price: 599000 },
  { zip: '33707', active: 278, fresh: 72, dom: 81, price: 394999 }, { zip: '33708', active: 325, fresh: 56, dom: 100, price: 599900 },
  { zip: '33709', active: 174, fresh: 40, dom: 82, price: 250000 }, { zip: '33710', active: 164, fresh: 48, dom: 67, price: 437599 },
  { zip: '33711', active: 165, fresh: 40, dom: 80, price: 349650 }, { zip: '33712', active: 117, fresh: 36, dom: 68, price: 399950 },
  { zip: '33713', active: 159, fresh: 52, dom: 60, price: 450000 }, { zip: '33714', active: 96, fresh: 24, dom: 64, price: 294000 },
  { zip: '33715', active: 208, fresh: 44, dom: 113, price: 539000 }, { zip: '33716', active: 39, fresh: 12, dom: 133, price: 219500 },
];

export const decisionLabel: Record<PublicationDecision, string> = {
  PUBLISH: 'Approved and eligible: published',
  RECOMMEND_AFTER_APPROVAL: 'Recommended after owner approval',
  DRAFT_NEEDS_LOCAL_REVIEW: 'Draft: needs local review',
  CONSOLIDATE_OR_RESEARCH_ONLY: 'Consolidate or keep in research',
  HOLD_OVERLAP_WITH_OTHER_PROPERTY: 'Hold: overlaps another property',
};

export const getLocation = (slug: string) => {
  const l = locations.find((x) => x.slug === slug);
  if (!l) throw new Error(`Unknown location: ${slug}`);
  return l;
};
