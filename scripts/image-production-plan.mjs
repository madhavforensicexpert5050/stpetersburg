// Reproducible production briefs derived from the actual media and route registries.
import fs from 'node:fs';
import { media } from '../src/data/media.ts';
import { routes, publicPreviewExclusion } from '../src/data/routes.ts';
import { styles } from '../src/data/taxonomy.ts';

const style = (m) => m.scene.kind === 'interior' ? styles.find(s => s.id === m.scene.style) : null;
const subject = (m) => m.scene.kind === 'exterior' ? 'Florida single-story residential bungalow exterior' : m.scene.room.replaceAll('-', ' ');
const shared = 'Original photorealistic architectural real-estate photograph for a premium virtual staging demonstration website. Landscape 3:2, 1536 by 1024. Natural detailed materials, professional straight verticals, realistic proportions and perspective, restrained daylight, no people, text, logos, watermarks or collage. Fictional property, no named building or landmark, no client-work claim.';
function basePrompt(m) {
  const s = m.scene, st = style(m);
  let scene;
  if (s.kind === 'exterior') scene = `One ${subject(m)}, ${s.color || 'warm ivory'} exterior paint, ${s.trim || 'white'} trim, ${s.door || 'natural wood'} front door. ${s.yard === 'bare' ? 'Sparse existing lawn with bare planting beds, no shrubs added' : 'Restrained established subtropical garden with palms and low shrubs'}. Daytime, full house and roofline visible, modest ordinary home, three-quarter view from across driveway, real real-estate photography.`;
  else scene = `One ${subject(m)}, ${st.name} architecture and design direction: ${st.note} Materials: ${st.materials}. ${s.furnish === 'none' ? 'Completely empty of movable furniture, rugs, art and decorations; preserve fixed kitchen cabinetry and appliances if kitchen.' : s.furnish === 'old' ? 'Occupied with dated bulky brown sofa, old armchair, cluttered movable coffee table and mismatched rug; no damage or structural defects.' : `Tastefully furnished as a functional ${subject(m)} with believable furniture scale and a coherent ${st.name.toLowerCase()} palette.`} ${s.wall ? `Walls painted ${s.wall}.` : 'Warm neutral walls.'} ${s.floor === 'worn' ? 'Existing worn wood floor, visibly aged but intact.' : 'Natural realistic flooring suited to the room.'} ${s.ceiling === 'plain' ? 'Plain white ceiling clearly visible.' : ''} ${s.dim ? 'Underexposed capture with mild warm color cast, details still visible, no damaged property.' : ''} ${['patio','porch','deck'].includes(s.room) ? 'This is an outdoor covered or open-air residential space with weather-appropriate furniture, not an indoor living room.' : s.room === 'basement' ? 'Clearly a below-grade finished room with small high windows; general design concept, not a claim about a Florida property.' : 'Simple distinct residential layout, windows and an entrance visible, natural 24mm lens from a corner at eye height.'}`;
  return `${shared} ${scene}`;
}
function editPrompt(m) {
  const key=m.pair, s=m.scene, st=style(m);
  let change;
  if(key==='svc-interior-color') change='Change ONLY the painted wall surfaces from beige to muted sage green. Keep furniture, floor and all other materials identical.';
  else if(key==='svc-flooring') change='Change ONLY the existing floor finish to a realistic medium walnut wood flooring concept, retaining the exact floor plane and room geometry. Keep all furniture and other finishes identical.';
  else if(key==='svc-ceiling') change='Add ONLY a plausible decorative wood beam treatment to the existing ceiling. Preserve ceiling height and shape, fixtures, walls, flooring and furniture.';
  else if(key==='svc-exterior-color') change='Change ONLY exterior wall paint to muted blue-gray, trim to white and front door paint to restrained terracotta. Preserve roof, landscaping, paving, doors, windows and every physical detail.';
  else if(key==='svc-landscaping') change='Add ONLY a tasteful conceptual subtropical landscape with low native-looking shrubs, groundcover and small planting beds in the existing bare yard. Preserve building, roof, driveway, paths, camera and existing terrain. Do not hide property conditions.';
  else if(key==='svc-day-to-dusk') change='Change ONLY sky and illumination to believable blue-hour dusk, warm light through existing windows. Keep every building feature, tree, shrub, driveway and camera framing exactly unchanged.';
  else if(key==='svc-photo-enhancement') change='Correct ONLY exposure and white balance with restrained natural photographic enhancement. Preserve every physical object and all architecture, materials and textures. Do not replace the sky or invent details.';
  else if(key==='svc-furniture-removal') change=`Replace ONLY movable dated furniture and decor with tasteful ${st.name.toLowerCase()} staging: refined sofa, chairs, coffee table, rug, lamps and art. Keep permanent features unchanged.`;
  else change=`Add ONLY realistic ${st.name.toLowerCase()} furniture and decor appropriate to this ${subject(m)}. ${st.note} Materials: ${st.materials}. Preserve usable circulation and realistic scale. ${s.room==='kitchen'?'Add only movable stools and a few restrained countertop accessories; do not alter fixed cabinets, counters or appliances.':''}`;
  return `Use case: precise-object-edit. Input image is the EDIT TARGET and the exact base photograph, not merely inspiration. ${change} CRITICAL: retain exact image dimensions, framing, camera position, angle, perspective, walls, windows, doors, floor geometry, baseboards, ceiling, fixtures, outdoor view and room dimensions. Do not add or remove windows, doors or fixed features. Do not crop, zoom, reframe or remodel. Match the input lighting except for explicitly requested lighting edits. Premium photorealistic real estate demonstration. No text, watermark, logos or people. Output a single full image, no split screen.`;
}
export const plan=media.map(m=>({id:m.id,pair:m.pair,role:m.role||'single',page:m.page,section:m.section,scene:m.scene,filename:`${m.id.replace(/^hero-living/,'virtual-staging-living-room-hero').replace(/^showcase-/,'virtual-staging-').replace(/^svc-/,'service-').replace(/^pf-/,'virtual-staging-portfolio-').replace(/^lib-/,'design-style-')}.webp`,prompt:m.role==='after'?editPrompt(m):basePrompt(m),mode:m.role==='after'?'edit':'generate'}));
fs.mkdirSync('docs',{recursive:true});
fs.writeFileSync('docs/stageliora-image-production-plan.json',JSON.stringify(plan,null,2)+'\n');
fs.writeFileSync('docs/stageliora-route-image-audit.json',JSON.stringify(routes.map(r=>({path:r.path,title:r.title,template:r.template,publicPreview:!publicPreviewExclusion(r),registryAssets:media.filter(m=>m.page===r.path).map(m=>m.id)})),null,2)+'\n');
if(process.argv.includes('--json')) console.log(JSON.stringify(plan));
else console.log(`${routes.length} routes; ${plan.length} assets; ${plan.filter(m=>m.mode==='edit').length} source-preserving edits.`);
