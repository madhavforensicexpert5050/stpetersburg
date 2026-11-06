import fs from 'node:fs';
const target='docs/stageliora-generation-receipts.json';
const all=fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):{};
for(const file of fs.readdirSync('docs/image-receipts').sort()){
 const data=JSON.parse(fs.readFileSync(`docs/image-receipts/${file}`,'utf8'));
 if(data.id) all[data.id]=data; else Object.assign(all,data);
}
const decisions=fs.existsSync('docs/image-review-decisions.json')?JSON.parse(fs.readFileSync('docs/image-review-decisions.json','utf8')):{};
for(const [id,review] of Object.entries(decisions)) if(all[id]) Object.assign(all[id],review);
fs.writeFileSync(target,JSON.stringify(all,null,2)+'\n');
console.log(`${Object.keys(all).length} saved generation receipts; ${Object.values(all).filter(r=>r.qa==='accepted').length} accepted.`);
