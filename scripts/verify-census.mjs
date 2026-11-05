// Recomputes the housing-mix figures in src/data/locations.ts from ACS table B25024 (via Census Reporter).
import { locations } from '../src/data/locations.ts';
const fips = { 'st-petersburg-fl': '63000', 'st-pete-beach': '62885', gulfport: '28175', 'treasure-island': '72325', 'south-pasadena': '67675', 'madeira-beach': '42400', 'pinellas-park': '56975', seminole: '64975', largo: '39425', clearwater: '12875', dunedin: '18575', 'safety-harbor': '62425' };
const ids = Object.values(fips).map((f) => `16000US12${f}`).join(',');
const res = await fetch(`https://api.censusreporter.org/1.0/data/show/latest?table_ids=B25024&geo_ids=${ids}`, { headers: { 'User-Agent': 'stageliora-site-qa' } });
if (!res.ok) { console.log(`Census Reporter returned ${res.status}`); process.exit(2); }
const j = await res.json();
console.log('release:', j.release?.name);
let bad = 0;
for (const l of locations) {
  const geo = j.geography[`16000US12${fips[l.slug]}`];
  const e = j.data[`16000US12${fips[l.slug]}`].B25024.estimate;
  const t = e.B25024001;
  const calc = { units: t, detached: Math.round((e.B25024002 / t) * 100), tenPlus: Math.round(((e.B25024007 + e.B25024008 + e.B25024009) / t) * 100), mobile: Math.round((e.B25024010 / t) * 100) };
  const ok = calc.units === l.units && calc.detached === l.detached && calc.tenPlus === l.tenPlus && calc.mobile === l.mobile;
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'DIFF'} ${l.name} [${geo?.name}] calc=${JSON.stringify(calc)} page=${JSON.stringify({ units: l.units, detached: l.detached, tenPlus: l.tenPlus, mobile: l.mobile })}`);
}
console.log(bad ? `${bad} differ` : 'all match');
