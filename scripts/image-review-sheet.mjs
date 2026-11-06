// Contact sheets are QA artifacts only, never website image assets.
import fs from 'node:fs';
import sharp from 'sharp';
const receipts=JSON.parse(fs.readFileSync('docs/stageliora-generation-receipts.json','utf8'));
const ids=process.argv.slice(2).length?process.argv.slice(2):Object.keys(receipts);
const width=600,height=400,label=34,cols=2;
fs.mkdirSync('qa-output',{recursive:true});
const layers=[];
for(let i=0;i<ids.length;i++){
 const id=ids[i],left=i%cols*width,top=Math.floor(i/cols)*(height+label);
 layers.push({input:await sharp(receipts[id].path).resize(width,height,{fit:'contain',background:'#eee'}).toBuffer(),left,top});
 layers.push({input:Buffer.from(`<svg width="${width}" height="${label}"><rect width="100%" height="100%" fill="white"/><text x="12" y="23" font-family="Arial" font-size="18">${id}</text></svg>`),left,top:top+height});
}
const output=process.env.REVIEW_SHEET || 'qa-output/image-review.png';
await sharp({create:{width:cols*width,height:Math.ceil(ids.length/cols)*(height+label),channels:3,background:'#eee'}}).composite(layers).png().toFile(output);
console.log(output);
