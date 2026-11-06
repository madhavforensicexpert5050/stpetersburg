import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { media } from '../src/data/media.ts';
import { routes, publicPreviewExclusion } from '../src/data/routes.ts';
const csv=(rows)=>rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
const plan=JSON.parse(fs.readFileSync('docs/stageliora-image-production-plan.json','utf8'));
const receipts=JSON.parse(fs.readFileSync('docs/stageliora-generation-receipts.json','utf8'));
const usage=new Map(media.map(m=>[m.id,[]]));
const routeAudit=routes.map(r=>{
 const file=path.join('dist',r.path,'index.html');
 if(!fs.existsSync(file)) throw Error(`Build the full preview first: ${file}`);
 const html=fs.readFileSync(file,'utf8');
 const ids=media.filter(m=>html.includes(m.src)).map(m=>m.id);
 ids.forEach(id=>usage.get(id).push(r.path));
 return {path:r.path,title:r.title,template:r.template,publicPreview:!publicPreviewExclusion(r),assets:ids,imageElements:[...html.matchAll(/<img\b/g)].length};
});
fs.writeFileSync('docs/stageliora-route-image-audit.json',JSON.stringify(routeAudit,null,2)+'\n');
const headers=['Image ID','Source route','Page title','Section name','Component name','Current asset path','Required visual subject','Service category','Room type','Design style','Before/after role','Pair ID','Target audience','Customer search intent','Recommended composition','Target aspect ratio','Target resolution','Target filename','Generated file path','Alt text','Caption','Content role','Production status','Generation method','Rights/provenance status','QA status','Deployment eligibility'];
const rows=media.map(m=>{
 const p=plan.find(p=>p.id===m.id),r=receipts[m.id], s=m.scene;
 return [m.id,usage.get(m.id).join('; '),usage.get(m.id).map(p=>routes.find(r=>r.path===p)?.crumb).join('; '),m.section,m.pair?'Compare / ServiceTiles':'MediaImage / gallery',m.src,s.kind==='interior'?`${s.room}; ${s.furnish}; ${s.style}`:`exterior; ${s.yard}; ${s.time||'day'}`,m.pair?.startsWith('svc-')?m.pair.slice(4):'virtual-staging / design direction',s.kind==='interior'?s.room:'exterior',s.kind==='interior'?s.style:'',m.role||'single',m.pair,'Real estate agents, photographers and homeowners','Evaluate an illustrative service or room design','Architectural photograph; consistent framing within pairs','3:2','1500x1000; 900x600; 480x320',p.filename,m.rights==='ai-generated'?m.src:'',m.alt,m.caption,'Synthetic demonstration',m.rights==='ai-generated'?'REPLACED_WITH_VERIFIED_ORIGINAL_ASSET':r?'PENDING_VISUAL_QA':'PENDING_GENERATION',r?.method||'',m.rights==='ai-generated'?'Original AI-generated fictional scene; not client work':m.rights,r?.qa||'pending',usage.get(m.id).some(p=>!publicPreviewExclusion(routes.find(r=>r.path===p)))?'Public noindex preview':'Source-only / gated'];
});
fs.writeFileSync('docs/stageliora-complete-image-inventory.csv',csv([headers,...rows]));
const generated=media.filter(m=>m.rights==='ai-generated');
const errors=[];let bytes=0;
for(const m of generated){
 const file=path.join('public',m.src); const meta=await sharp(file).metadata();bytes+=fs.statSync(file).size;
 if(meta.width!==m.width||meta.height!==m.height)errors.push(`${m.id}: dimensions`);
 if(!/^[a-z0-9-]+\.webp$/.test(path.basename(m.src)))errors.push(`${m.id}: filename`);
 if(!m.alt||!/AI-generated/.test(m.caption))errors.push(`${m.id}: disclosure`);
 for(const v of m.responsive||[])if(!fs.existsSync(path.join('public',v.src)))errors.push(`${m.id}: missing variant`);
}
const pairs=[...new Set(media.filter(m=>m.pair).map(m=>m.pair))];
for(const key of pairs){const items=media.filter(m=>m.pair===key);if(items.some(m=>m.rights==='ai-generated')&&!items.every(m=>m.rights==='ai-generated'))errors.push(`${key}: partially integrated pair`);if(new Set(items.map(m=>`${m.width}x${m.height}`)).size!==1)errors.push(`${key}: size mismatch`);}
const rejectedOutputs=Object.values(receipts).filter(r=>r.rejectedAttempt).length;
const summary={sourceRoutes:routes.length,publicPreviewRoutes:routeAudit.filter(r=>r.publicPreview).length,originalAssets:media.length,totalImageOccurrences:routeAudit.reduce((n,r)=>n+r.imageElements,0),generatedReceipts:Object.keys(receipts).length,generatedOutputs:Object.keys(receipts).length+rejectedOutputs,rejectedOutputs,integrated:generated.length,integratedPairs:pairs.filter(p=>media.filter(m=>m.pair===p).every(m=>m.rights==='ai-generated')).length,pending:media.length-generated.length,fullSizeWebpBytes:bytes,errors};
fs.writeFileSync('docs/stageliora-image-coverage-summary.json',JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync('docs/stageliora-before-after-pair-audit.md','# Before/after visual review\n\n'+pairs.map(p=>`## ${p}\n\n`+media.filter(m=>m.pair===p).map(m=>`- ${m.role}: ${receipts[m.id]?.qa||'pending'} — ${receipts[m.id]?.review||'Awaiting review'}`).join('\n')).join('\n\n')+'\n');
fs.writeFileSync('docs/stageliora-image-seo-audit.md','# Filename and image metadata audit\n\n'+media.map(m=>`- ${m.id}: /media/placeholders/${m.id}.svg → ${m.src}; alt: ${m.alt}`).join('\n')+'\n');
fs.writeFileSync('docs/stageliora-image-generation-manifest.md','# Production manifest\n\nActual per-asset prompts are in stageliora-image-production-plan.json. Saved generation receipts and visual decisions are separate; a generation receipt alone never counts as accepted.\n\n'+JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync('docs/stageliora-image-rights-and-provenance.md','# Rights and provenance\n\nGenerated using the built-in OpenAI image_gen tool from original synthetic scene briefs. No competitor or stock photographs used. All properties are fictional demonstrations, not client projects or verified local listings. No claim of exclusive copyright, registration or universal MLS acceptance. Model-visible instructions require no text, logos, watermarks or people. Public asset hashes, prompts and base-image lineage are in public/media/generated/provenance.json. Private receipts retain original saved-image locations. Production publication approvals are unchanged.\n');
console.log(JSON.stringify(summary,null,2));
if(errors.length)process.exitCode=1;
