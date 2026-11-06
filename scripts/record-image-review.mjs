import fs from 'node:fs';
const [qa,review,...ids]=process.argv.slice(2);
if(!['accepted','rejected'].includes(qa)||!review||!ids.length)throw Error('Usage: node scripts/record-image-review.mjs accepted|rejected "visual review notes" ids...');
const file='docs/image-review-decisions.json';const decisions=JSON.parse(fs.readFileSync(file,'utf8'));
for(const id of ids)decisions[id]={qa,review};
fs.writeFileSync(file,JSON.stringify(decisions,null,2)+'\n');
console.log(`${qa}: ${ids.join(', ')}`);
