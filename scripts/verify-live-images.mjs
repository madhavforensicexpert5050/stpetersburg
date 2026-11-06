// Read-only verification of the actual GitHub Pages deployment and its asset hashes.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
process.env.DEPLOY_TARGET='github-pages';process.env.SITE_MODE='preview';
const { routes, publicPreviewExclusion }=await import('../src/data/routes.ts');
const base='https://madhavforensicexpert5050.github.io/stpetersburg';
const expectedCommit=process.argv[2];
const errors=[],report={expectedCommit,base,checkedRoutes:0,checkedAssets:0,browser:[],errors};
if(expectedCommit){
 const res=await fetch('https://api.github.com/repos/madhavforensicexpert5050/stpetersburg/actions/runs?per_page=10',{headers:{'User-Agent':'StageLiora-image-QA','Accept':'application/vnd.github+json'}});
 if(!res.ok)throw Error(`GitHub API: ${res.status}`);
 const runs=(await res.json()).workflow_runs;const run=runs.find(r=>r.head_sha===expectedCommit);
 if(!run){console.log('Deployment run not visible yet.');process.exit(2);}
 report.workflow={id:run.id,url:run.html_url,status:run.status,conclusion:run.conclusion,sha:run.head_sha};
 if(run.status!=='completed'){console.log(JSON.stringify(report.workflow));process.exit(2);}
 if(run.conclusion!=='success')throw Error(`Workflow did not succeed: ${run.html_url} ${run.conclusion}`);
}
const provenance=JSON.parse(fs.readFileSync('public/media/generated/provenance.json','utf8'));
const { media }=await import('../src/data/media.ts');
const work=[...routes.filter(r=>!publicPreviewExclusion(r)).map(r=>({kind:'page',path:r.path})),...media.flatMap(m=>m.responsive.map(v=>({kind:'asset',path:v.src,main:v.src===m.src,id:m.id})))];let next=0;
await Promise.all(Array.from({length:6},async()=>{while(next<work.length){const item=work[next++];try{
 const url=item.kind==='page'?base+item.path:base+item.path;
 const res=await fetch(url+'?image-qa='+(expectedCommit||'current'));
 if(!res.ok)throw Error(`HTTP ${res.status}`);
 if(item.kind==='page'){
  const html=await res.text();if(!/<meta name="robots" content="noindex/.test(html))throw Error('noindex missing');
  if(html.includes('/media/placeholders/'))throw Error('old placeholder reference');
  if(!html.includes('StageLiora'))throw Error('wrong page');report.checkedRoutes++;
 }else{
  const data=Buffer.from(await res.arrayBuffer());if(!/webp/.test(res.headers.get('content-type')||''))throw Error('wrong content type');
  if(item.main){const p=provenance.find(p=>p.id===item.id);if(crypto.createHash('sha256').update(data).digest('hex')!==p.sha256)throw Error('live bytes differ from reviewed local file');}
  report.checkedAssets++;
 }
 }catch(e){errors.push(`${item.path}: ${e.message}`);}}}));
const browser=await chromium.launch({channel:'chrome'});
try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(`browser: ${e.message}`));
 for(const route of ['/','/design-library/','/portfolio/','/services/day-to-dusk/','/locations/st-petersburg-fl/']){
  await page.goto(base+route,{waitUntil:'load'});
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});
   const state=await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>null)));return {overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)};});
   if(state.overflow||state.broken.length)errors.push(`${route}@${width}: ${JSON.stringify(state)}`);
   if(route==='/'){await page.waitForTimeout(500);await page.screenshot({path:`qa-output/live-home-${width}.png`});}
   report.browser.push({route,width,...state});
  }
 }
 await page.goto(base+'/');const input=page.locator('.compare input').first();await input.focus();await page.keyboard.press('End');if(await input.inputValue()!=='100')errors.push('Live slider keyboard input');
 await page.locator('[data-compare-toggle]').first().click();if(!await page.locator('[data-compare]').first().evaluate(el=>el.classList.contains('is-side')))errors.push('Live side-by-side toggle');
 await page.goto(base+'/design-library/');await page.locator('[data-filter=style][data-value=coastal]').click();if(await page.locator('[data-item]:visible').count()!==7)errors.push('Live coastal filter');
 await page.locator('[data-item]:visible .gal__btn').first().click();if(!await page.locator('dialog.lb').isVisible())errors.push('Live lightbox');await page.keyboard.press('Escape');
}finally{await browser.close();}
fs.mkdirSync('qa-output',{recursive:true});fs.writeFileSync('qa-output/qa-live-images.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
