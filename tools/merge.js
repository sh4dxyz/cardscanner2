const fs=require('fs');const parts=[0,3000,6000,9000,12000,15000,18000];
const bufs=[],ok=[];let ids,en;
for(const a of parts){if(!fs.existsSync('part'+a+'.json'))continue;const m=JSON.parse(fs.readFileSync('part'+a+'.json'));ids=m.ids;en=m.en;bufs.push(fs.readFileSync('part'+a+'.bin'));for(let i=a;i<Math.min(a+3000,m.ids.length);i++)ok[i]=m.ok[i]}
fs.writeFileSync('thumbs.bin',Buffer.concat(bufs));fs.writeFileSync('thumbs.json',JSON.stringify({ids,en,ok}));console.log(ids.length,ok.filter(Boolean).length,Buffer.concat(bufs).length/(32*44*3));
