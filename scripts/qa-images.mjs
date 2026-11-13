// Verify the production asset chain without private receipts or local master files.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { media } from '../src/data/media.ts';
import { approvals } from '../src/data/approvals.ts';
const approvedIds=new Set(approvals.productionImages?.ids??[]);
const provenance=JSON.parse(fs.readFileSync('public/media/generated/provenance.json','utf8'));
const errors=[];let bytes=0,variants=0;
for(const m of media){
 if(m.rights!=='ai-generated'){errors.push(`${m.id}: unreplaced asset`);continue;}
 const p=provenance.find(p=>p.id===m.id);
 if(!p||p.src!==m.src||!p.visualReview||!p.prompt)errors.push(`${m.id}: provenance missing`);
 if((m.ownerApproved?!(m.publication==='synthetic-approved-for-production'&&approvedIds.has(m.id)):m.publication!=='synthetic-preview-only')||!/AI-created|AI-generated/.test(m.caption)||!/^AI-(created|generated)/.test(m.alt))errors.push(`${m.id}: synthetic classification or disclosure`);
 if(!m.alt||!m.responsive||m.responsive.length!==3)errors.push(`${m.id}: alt text or responsive variants`);
 for(const v of m.responsive||[]){
  const file=path.join('public',v.src);
  if(!fs.existsSync(file)){errors.push(`${m.id}: missing ${v.src}`);continue;}
  const meta=await sharp(file).metadata();
  if(meta.width!==v.width||meta.height!==v.width/1.5||meta.format!=='webp')errors.push(`${m.id}: wrong dimensions/format at ${v.width}`);
  if(!/^[a-z0-9-]+\.webp$/.test(path.basename(file)))errors.push(`${m.id}: filename`);
  const size=fs.statSync(file).size;bytes+=size;variants++;
  if(size>600000)errors.push(`${m.id}: variant exceeds 600KB`);
 }
 const full=path.join('public',m.src);
 if(fs.existsSync(full)&&p?.sha256!==crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'))errors.push(`${m.id}: asset hash differs from reviewed provenance`);
 if(m.pair){
  const before=media.find(x=>x.pair===m.pair&&x.role==='before');
  if(!before||m.width!==before.width||m.height!==before.height)errors.push(`${m.id}: paired dimensions`);
  if(m.role==='after'&&p?.base!==before?.id)errors.push(`${m.id}: after not derived from its own before`);
 }
}
const report={assets:media.length,pairs:new Set(media.filter(m=>m.pair).map(m=>m.pair)).size,variants,totalBytes:bytes,errors};
fs.mkdirSync('qa-output',{recursive:true});fs.writeFileSync('qa-output/qa-images.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
