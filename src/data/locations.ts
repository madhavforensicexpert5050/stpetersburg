/**
 * Location research candidates. Every record is an internal draft: none has owner publication approval.
 * Sources verified 2026-11-05. Census = ACS 2020-2024 5-year table B25024 for all twelve places (recompute with scripts/verify-census.mjs).
 * Listing figures = Realtor.com October 2026, by ZIP or postal city, as held in the project research data.
 * "evidence" records whether a fact came from an opened page or a search snippet, so nothing weak is promoted.
 */
export type PublicationDecision = 'RECOMMEND_AFTER_APPROVAL' | 'DRAFT_NEEDS_LOCAL_REVIEW' | 'CONSOLIDATE_OR_RESEARCH_ONLY' | 'HOLD_OVERLAP_WITH_OTHER_PROPERTY';

export interface LocationFact { text: string; source: string; url: string; evidence: 'opened' | 'snippet' | 'dataset' }
export interface LocationRecord {
  slug: string; path: string; name: string; officialName: string; officialNameVerified: boolean; status: string; website: string; relationship: string;
  units: number; detached: number; tenPlus: number; mobile: number;
  listing: { label: string; zips: string; active: number | null; fresh: number | null; dom: string; price: string; caveat: string };
  headline: string; intro: string; localAngle: { h: string; b: string }[]; facts: LocationFact[];
  decision: PublicationDecision; decisionWhy: string;
  title: string; description: string;
}

const COUNTY = { source: 'Pinellas County, municipalities list', url: 'https://pinellas.gov/municipalities-and-cities/', evidence: 'opened' as const };
const SD = { text: 'Pinellas County applies a substantial-damage test of 49% or more of pre-disaster value, and letter holders from Helene and Milton have until December 31, 2026 to comply. City residents are referred to their local officials.', source: 'Pinellas County, substantial damage FAQs', url: 'https://pinellas.gov/substantial-damage-faqs/', evidence: 'opened' as const };

export const locations: LocationRecord[] = [
  {
    slug: 'st-petersburg-fl', path: '/locations/st-petersburg-fl/', name: 'St. Petersburg', officialName: 'City of St. Petersburg', officialNameVerified: false, status: 'Incorporated municipality', website: 'https://www.stpete.org/', relationship: 'Anchor city for this site',
    units: 141508, detached: 55, tenPlus: 26, mobile: 2,
    listing: { label: 'Postal city "Saint Petersburg" (16 ZIPs)', zips: '33701–33716', active: 3049, fresh: 764, dom: '60 to 133 days by ZIP', price: '$219,500 to $1,199,500 median list price by ZIP', caveat: 'Postal-city figures are not city limits. ZIPs 33706, 33707 and 33708 reach beyond St. Petersburg proper.' },
    headline: 'St. Petersburg listings: one city name, very different markets',
    intro: 'Across the ZIP codes labeled Saint Petersburg, October 2026 median list prices ran from $219,500 to $1,199,500, and typical time on market from 60 days to 133. That spread is why one approach to listing photos will not suit every property here.',
    localAngle: [
      { h: 'Towers and bungalows need different photos', b: 'About 55% of the city\'s housing units are single detached homes and 26% are in buildings with ten or more units. A staged downtown condo and a staged 1920s bungalow are different briefs, and the furniture scale differs too.' },
      { h: 'Flood history belongs in the conversation, not the edit', b: 'Pinellas County set a December 31, 2026 compliance date for owners holding Helene and Milton substantial-damage letters. Photos of repaired homes should still show the home as it is. Stellar prohibits editing out damage, and an image is no substitute for what a buyer is entitled to be told.' },
      { h: 'Older neighborhoods have real architectural character', b: 'The Roser Park Historic District is in the National Register system. If a home has original details, staging should sit alongside them, because Stellar does not allow permanent fixtures to be changed in a listing photo.' },
    ],
    facts: [
      { text: 'St. Petersburg is one of 24 municipalities on the county\'s list.', ...COUNTY },
            { text: 'The Roser Park Historic District appears in the National Register system as a district, reference 98000295, dated April 1, 1998.', source: 'National Park Service, NRIS record', url: 'https://npgallery.nps.gov/AssetDetail/NRIS/98000295', evidence: 'opened' },
      SD,
      { text: 'October 2026 listings: 3,049 active, 764 new, across 16 postal ZIPs.', source: 'Realtor.com Core Metrics, ZIP data', url: 'https://www.realtor.com/research/data/', evidence: 'dataset' },
    ],
    decision: 'RECOMMEND_AFTER_APPROVAL',
    decisionWhy: 'Identity verified and the page has local substance. Still needs service-coverage approval and owner authorization.',
    title: 'St. Petersburg, FL Listing Photo Guide | StageLiora', description: 'How St. Petersburg listing prices and days on market vary by ZIP, what the housing mix means for staging, and which MLS photo limits to keep in mind.',
  },
  {
    slug: 'st-pete-beach', path: '/locations/st-pete-beach/', name: 'St. Pete Beach', officialName: 'City of St. Pete Beach', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.stpetebeach.org/', relationship: 'Barrier island west of St. Petersburg',
    units: 8400, detached: 41, tenPlus: 44, mobile: 0,
    listing: { label: 'ZIP 33706, reported as Saint Petersburg', zips: '33706', active: 362, fresh: 84, dom: '99 days', price: '$599,000 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a St. Pete Beach figure.' },
    headline: 'St. Pete Beach: listing photos after the storm seasons',
    intro: 'About 44% of housing units here sit in buildings of ten or more units, and 41% are single detached homes. Much of the island was also affected by the 2024 storms, which makes accurate photos especially important.',
    localAngle: [
      { h: 'A renovated unit and an unrepaired one should not look alike', b: 'The city assessed more than 3,000 damaged structures and defines substantial damage as repairs exceeding 50% of structure value. Photos need to reflect the actual condition of the property on the day.' },
      { h: 'Views cannot be improved', b: 'Stellar names an edited-in Gulf or ocean view as prohibited. Whatever the window shows should stay as it was shot.' },
    ],
    facts: [
      { text: 'More than 3,000 damaged structures assessed; substantial damage means repairs over 50% of structure value.', source: 'City of St. Pete Beach, substantial damage appeals', url: 'https://www.stpetebeach.org/829/Substantial-Damage-Determination-Appeal-', evidence: 'opened' },
      SD,
    ],
    decision: 'DRAFT_NEEDS_LOCAL_REVIEW',
    decisionWhy: 'Distinct housing mix and official storm facts. Needs local review, service-coverage approval and owner authorization.',
    title: 'St. Pete Beach Listing Photos | StageLiora', description: 'Listing photos in St. Pete Beach, FL: a condo-heavy housing mix, storm-recovery context and MLS limits on edited views.',
  },
  {
    slug: 'gulfport', path: '/locations/gulfport/', name: 'Gulfport', officialName: 'City of Gulfport', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://mygulfport.us/', relationship: 'Borders St. Petersburg',
    units: 7952, detached: 61, tenPlus: 25, mobile: 3,
    listing: { label: 'ZIP 33707, reported as Saint Petersburg', zips: '33707', active: 278, fresh: 72, dom: '81 days', price: '$394,999 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a Gulfport figure.' },
    headline: 'Gulfport: a historic waterfront and mostly detached homes',
    intro: 'Gulfport has a 57.9-acre Waterfront Redevelopment District and a Casino building listed on the National Register. About 61% of housing units are single detached homes.',
    localAngle: [
      { h: 'Small rooms need honest scale', b: 'Where rooms are compact, undersized furniture is tempting. Stellar prohibits furniture that makes a room seem larger than it is.' },
      { h: 'Say what was repaired, and photograph it as it is', b: 'The city reports more than 600 properties impacted in the 2024 season. Current photos should show the current state of the property.' },
    ],
    facts: [
      { text: '57.9-acre Waterfront Redevelopment District, created August 18, 1992; Casino on the National Register in 2014.', source: 'City of Gulfport, Waterfront Redevelopment District', url: 'https://mygulfport.us/waterfront-redevelopment-district/', evidence: 'opened' },
      { text: 'More than 600 properties impacted in the 2024 storm season.', source: 'City of Gulfport homepage', url: 'https://mygulfport.us/', evidence: 'opened' },
    ],
    decision: 'DRAFT_NEEDS_LOCAL_REVIEW',
    decisionWhy: 'Facts are from opened city pages. Needs more original local information and owner authorization.',
    title: 'Gulfport, FL Listing Photos | StageLiora', description: 'Listing photos in Gulfport, FL, covering the waterfront district, the housing mix, storm-recovery context and honest room scale.',
  },
  {
    slug: 'treasure-island', path: '/locations/treasure-island/', name: 'Treasure Island', officialName: 'City of Treasure Island', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.mytreasureisland.org/', relationship: 'Barrier island community; position to St. Petersburg not verified',
    units: 6192, detached: 36, tenPlus: 34, mobile: 1,
    listing: { label: 'ZIP 33706, reported as Saint Petersburg', zips: '33706', active: 362, fresh: 84, dom: '99 days', price: '$599,000 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a Treasure Island figure.' },
    headline: 'Treasure Island: draft notes',
    intro: 'Treasure Island has a mix of detached homes (about 36% of units) and larger buildings (about 34%). Research on this page is limited, and most of it comes from search snippets.',
    localAngle: [{ h: 'Keep the water as it is', b: 'Stellar names an edited-in water view as prohibited, and that matters in any island market.' }],
    facts: [{ text: 'Four towns incorporated as the city on May 3, 1955.', source: 'City of Treasure Island, about page', url: 'https://www.mytreasureisland.org/visitors/about/index.php', evidence: 'snippet' }],
    decision: 'CONSOLIDATE_OR_RESEARCH_ONLY',
    decisionWhy: 'Not enough distinct verified information for its own page. Cover it in a barrier-island section of the St. Petersburg guide.',
    title: 'Treasure Island, FL Listing Photos: Draft Notes | StageLiora', description: 'Draft research notes on listing photos in Treasure Island, FL. Limited verified local information. Not intended for publication in this form.',
  },
  {
    slug: 'south-pasadena', path: '/locations/south-pasadena/', name: 'South Pasadena', officialName: 'City of South Pasadena', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.mysouthpasadena.com/', relationship: 'On Boca Ciega Bay, south of St. Petersburg\'s Pasadena area',
    units: 4998, detached: 6, tenPlus: 80, mobile: 8,
    listing: { label: 'ZIP 33707, reported as Saint Petersburg', zips: '33707', active: 278, fresh: 72, dom: '81 days', price: '$394,999 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a South Pasadena figure.' },
    headline: 'South Pasadena: where most homes are in larger buildings',
    intro: 'About 80% of housing units here are in buildings of ten or more units, and only about 6% are single detached homes. That is the most multi-family mix among the places in this research.',
    localAngle: [
      { h: 'Think condo interiors first', b: 'Living rooms, small dining areas and enclosed balconies will come up more often than yards. Note that Stellar allows only unattached furniture and decor on exterior spaces.' },
      { h: 'Check community rules before assuming anything', b: 'Whether any given building is age-restricted has to be confirmed building by building. This page does not make a claim either way.' },
    ],
    facts: [{ text: 'The city describes most residents as retirees living in condominiums or assisted living, with about 300 single-family homes.', source: 'City of South Pasadena, about page', url: 'https://www.mysouthpasadena.com/community/about_south_pasadena.php', evidence: 'snippet' }],
    decision: 'DRAFT_NEEDS_LOCAL_REVIEW',
    decisionWhy: 'The housing mix is distinct. City-page facts must be confirmed in a browser, because the site blocked automated reading.',
    title: 'South Pasadena, FL Listing Photos | StageLiora', description: 'Listing photos in South Pasadena, FL, where most homes are in larger buildings. What that means for staging condo interiors.',
  },
  {
    slug: 'madeira-beach', path: '/locations/madeira-beach/', name: 'Madeira Beach', officialName: 'City of Madeira Beach', officialNameVerified: false, status: 'Incorporated municipality', website: 'https://www.madeirabeachfl.gov/', relationship: 'Barrier island west of St. Petersburg',
    units: 4001, detached: 37, tenPlus: 40, mobile: 1,
    listing: { label: 'ZIP 33708, reported as Saint Petersburg', zips: '33708', active: 325, fresh: 56, dom: '100 days', price: '$599,900 median list price', caveat: 'This ZIP is reported under Saint Petersburg and also serves other communities, so it is not a Madeira Beach figure.' },
    headline: 'Madeira Beach: draft notes',
    intro: 'Madeira Beach combines detached homes (about 37% of units) with larger buildings (about 40%). Its most relevant local issue in this research is storm recovery.',
    localAngle: [{ h: 'Photos should match the recovery status', b: 'The city has posted address-level substantial-damage letters after Helene. Agents should check a property\'s status with the proper sources, and photos should show the property as it is.' }],
    facts: [{ text: 'The city posts per-address Helene substantial-damage letters.', source: 'City of Madeira Beach documents', url: 'https://www.madeirabeachfl.gov/documents/552-johns-pass-ave-sd-letter/', evidence: 'snippet' }, SD],
    decision: 'CONSOLIDATE_OR_RESEARCH_ONLY',
    decisionWhy: 'Too similar to the other barrier-island notes at this stage. Consolidate unless more original information is gathered.',
    title: 'Madeira Beach, FL Listing Photos: Draft Notes | StageLiora', description: 'Draft research notes on listing photos in Madeira Beach, FL. Storm-recovery context only. Not intended for publication in this form.',
  },
  {
    slug: 'pinellas-park', path: '/locations/pinellas-park/', name: 'Pinellas Park', officialName: 'City of Pinellas Park', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.pinellaspark.gov/', relationship: 'Borders St. Petersburg and Largo',
    units: 25640, detached: 52, tenPlus: 14, mobile: 15,
    listing: { label: 'ZIPs 33781 and 33782', zips: '33781, 33782', active: 185, fresh: 52, dom: '79 to 81 days', price: '$312,200 to $334,900 median list price', caveat: 'Postal ZIPs, not city limits. Each ZIP\'s median is shown separately rather than averaged.' },
    headline: 'Pinellas Park: detached homes and manufactured housing',
    intro: 'About 52% of housing units here are single detached homes and about 15% are mobile homes, one of the larger shares in this research. Those homes are photographed differently from a downtown condo, and often in tighter spaces.',
    localAngle: [
      { h: 'Narrow rooms test furniture scale', b: 'In narrower rooms, a realistic furniture layout matters more than filling the space. Stellar prohibits furniture that distorts how large a room appears.' },
      { h: 'Do not assume "inland" means no flood history', b: 'The city itself says it has experienced flooding because of its proximity to the Gulf and the bay. Avoid implying otherwise in listing materials.' },
    ],
    facts: [{ text: 'The city says it has flooded due to its proximity to the Gulf and bay.', source: 'City of Pinellas Park, flood protection', url: 'https://www.pinellaspark.gov/313/Flood-Protection', evidence: 'opened' }, { text: 'Incorporated October 14, 1914.', source: 'City of Pinellas Park CRA expansion report', url: 'https://www.pinellaspark.gov/DocumentCenter/View/6723/Pinellas-Park-CRA-Expansion-2018-FON-Report', evidence: 'snippet' }],
    decision: 'DRAFT_NEEDS_LOCAL_REVIEW',
    decisionWhy: 'Distinct housing mix and an opened city source. Needs service-coverage approval and owner authorization.',
    title: 'Pinellas Park, FL Listing Photos | StageLiora', description: 'Listing photos in Pinellas Park, FL: detached homes and mobile homes, realistic furniture scale, and flood-history context.',
  },
  {
    slug: 'seminole', path: '/locations/seminole/', name: 'Seminole', officialName: 'City of Seminole', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.myseminole.com/', relationship: 'North of St. Petersburg',
    units: 10843, detached: 41, tenPlus: 31, mobile: 13,
    listing: { label: 'Postal city "Seminole" (3 ZIPs)', zips: '33772, 33776, 33777', active: 316, fresh: 104, dom: '62 to 68 days by ZIP', price: '$299,450 to $546,950 median list price by ZIP', caveat: 'Postal-city figures are not city limits. The postal area may extend beyond the city limits.' },
    headline: 'Seminole: draft notes',
    intro: 'Seminole\'s housing mix is split between detached homes (about 41% of units), larger buildings (about 31%) and mobile homes (about 13%). The city was the last Pinellas municipality to incorporate, in 1970.',
    localAngle: [{ h: 'Postal area versus city', b: 'The area using a Seminole mailing address may extend beyond the city limits. Any local claim has to be clear about which one it means.' }],
    facts: [{ text: 'Incorporated November 15, 1970, the last municipality in Pinellas to do so.', source: 'City of Seminole, timeline', url: 'https://www.myseminole.com/373/Timeline', evidence: 'snippet' }, { text: 'Over one-third of residents are 65 or older.', source: 'City of Seminole archive document', url: 'https://www.myseminole.com/ArchiveCenter/ViewFile/Item/115', evidence: 'snippet' }],
    decision: 'CONSOLIDATE_OR_RESEARCH_ONLY',
    decisionWhy: 'City-site facts were not opened (site timed out). Keep in the research and outreach database for now.',
    title: 'Seminole, FL Listing Photos: Draft Notes | StageLiora', description: 'Draft research notes on listing photos in Seminole, FL, with the housing mix and the postal-versus-city caveat. Not intended for publication in this form.',
  },
  {
    slug: 'largo', path: '/locations/largo/', name: 'Largo', officialName: 'City of Largo', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.largo.com/', relationship: 'Central Pinellas, with Clearwater to the north',
    units: 46806, detached: 30, tenPlus: 24, mobile: 26,
    listing: { label: 'Postal city "Largo" (5 ZIPs)', zips: '33770, 33771, 33773, 33774, 33778', active: 407, fresh: 128, dom: '47 to 93 days by ZIP', price: '$299,000 to $399,900 median list price by ZIP', caveat: 'Postal-city figures are not city limits.' },
    headline: 'Largo: where manufactured homes are a major part of the market',
    intro: 'About 26% of Largo\'s housing units are mobile homes, close to the 30% that are single detached homes. No other city in this research comes close to that share, and it should shape what a listing photo guide says here.',
    localAngle: [
      { h: 'Manufactured-home rooms have their own proportions', b: 'Room widths and wall treatments can differ from a site-built house. Good staging respects those proportions rather than hiding them.' },
      { h: 'Listing pace varies within the city', b: 'Median days on market ran from 47 to 93 days across Largo\'s ZIPs in October 2026, so a single citywide statement about pace would be misleading.' },
    ],
    facts: [{ text: 'Mobile homes are about 27% of housing, around 12,400 units, with a median year built of 1977.', source: 'City of Largo housing market and needs report', url: 'https://cms7files.revize.com/largoflorida/document_center/Housing%20Assistance%20Resources/Housing%20Market,%20Needs%20Final%2012-10-23.pdf', evidence: 'opened' }],
    decision: 'DRAFT_NEEDS_LOCAL_REVIEW',
    decisionWhy: 'Strong original angle from an opened city report. Owner must decide which property covers Largo.',
    title: 'Largo, FL Listing Photos | StageLiora', description: 'Listing photos in Largo, FL, where mobile homes make up over a quarter of housing and days on market differ widely by ZIP.',
  },
  {
    slug: 'clearwater', path: '/locations/clearwater/', name: 'Clearwater', officialName: 'City of Clearwater', officialNameVerified: false, status: 'Incorporated municipality', website: 'https://www.myclearwater.com/', relationship: 'North of St. Petersburg, with its beach on a separate barrier island',
    units: 61123, detached: 38, tenPlus: 36, mobile: 5,
    listing: { label: 'Postal city "Clearwater" (9 ZIPs)', zips: '33755–33765', active: 1043, fresh: 260, dom: '62 to 115 days by ZIP', price: '$199,000 to $405,000 median list price by ZIP', caveat: 'Postal-city figures are not city limits. Clearwater Beach (33767) is reported separately.' },
    headline: 'Clearwater: internal record only',
    intro: 'Clearwater is its own candidate in the wider geographic plan. To avoid two similar StageLiora pages about the same city, this route holds only an internal record for now.',
    localAngle: [{ h: 'Why there is no guide here', b: 'If a Clearwater property is ever built, it should own this content. If it is not, the owner can reconsider a page on this site.' }],
    facts: [{ text: 'Some Island Estates homes were still being rebuilt two years after Helene.', source: 'Bay News 9, September 27, 2026', url: 'https://baynews9.com/fl/tampa/news/2026/09/27/two-years-later-clearwater-resident-shares-hurricane-helene-story', evidence: 'snippet' }],
    decision: 'HOLD_OVERLAP_WITH_OTHER_PROPERTY',
    decisionWhy: 'Cannibalization risk. Hold until the owner decides which property owns Clearwater.',
    title: 'Clearwater, FL: Internal Research Record | StageLiora', description: 'Internal research record for Clearwater, FL. Held back from publication to avoid duplicating a separate Clearwater candidate in the geographic plan.',
  },
  {
    slug: 'dunedin', path: '/locations/dunedin/', name: 'Dunedin', officialName: 'City of Dunedin', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.dunedin.gov/', relationship: 'North county, bordering Clearwater',
    units: 21305, detached: 45, tenPlus: 22, mobile: 11,
    listing: { label: 'ZIP 34698', zips: '34698', active: 241, fresh: 80, dom: '75 days', price: '$399,000 median list price', caveat: 'Postal ZIP, not city limits.' },
    headline: 'Dunedin: internal record for now',
    intro: 'Dunedin has a recognizable identity, including Highland Games held since 1967. It is also far from St. Petersburg and has its own candidate slug, so it may fit better elsewhere in the plan.',
    localAngle: [{ h: 'Identity is not listing advice', b: 'Scottish heritage is real local color, but it says little about how to photograph a home here. More real-estate detail is needed before this could be a useful page.' }],
    facts: [{ text: 'Highland Games since 1967; Elliot tartan adopted 1983; Stirling is a sister city.', source: 'City of Dunedin, Scottish history', url: 'https://www.dunedin.gov/Activities-and-Recreation/Arts-Culture/Scottish-History-of-Dunedin', evidence: 'opened' }],
    decision: 'HOLD_OVERLAP_WITH_OTHER_PROPERTY',
    decisionWhy: 'Own candidate slug and thin real-estate substance. Keep in research.',
    title: 'Dunedin, FL: Internal Research Record | StageLiora', description: 'Internal research record for Dunedin, FL. Held back from publication pending a decision on geographic ownership and more real-estate detail.',
  },
  {
    slug: 'safety-harbor', path: '/locations/safety-harbor/', name: 'Safety Harbor', officialName: 'City of Safety Harbor', officialNameVerified: true, status: 'Incorporated municipality', website: 'https://www.cityofsafetyharbor.com/', relationship: 'West shore of Tampa Bay',
    units: 7650, detached: 66, tenPlus: 7, mobile: 10,
    listing: { label: 'ZIP 34695', zips: '34695', active: 64, fresh: 28, dom: '67 days', price: '$574,900 median list price', caveat: 'Postal ZIP, not city limits. A small count for one month.' },
    headline: 'Safety Harbor: draft notes',
    intro: 'About 66% of housing units here are single detached homes, the largest share among these places. The sample of active listings is small, so no market conclusions are drawn from it.',
    localAngle: [{ h: 'Mostly a house market', b: 'With few large buildings, staging here is more likely to mean living rooms, bedrooms and unattached patio furniture than condo interiors.' }],
    facts: [{ text: 'Espiritu Santo Springs is marked by a state historical marker.', source: 'Florida Division of Historical Resources, marker record', url: 'https://markers.flheritage.com/home/details/630', evidence: 'snippet' }],
    decision: 'CONSOLIDATE_OR_RESEARCH_ONLY',
    decisionWhy: 'Far from St. Petersburg, with thin verified real-estate content. Keep in research.',
    title: 'Safety Harbor, FL Listing Photos: Draft Notes | StageLiora', description: 'Draft research notes on listing photos in Safety Harbor, FL, covering the detached-home housing mix. Not intended for publication in this form.',
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
