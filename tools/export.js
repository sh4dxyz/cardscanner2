const fs=require('fs');const C=require('./core.js');
const m=JSON.parse(fs.readFileSync('thumbs.json')),TB=fs.readFileSync('thumbs.bin'),T=C.TW*C.TH*3;
const ids=[],chunks=[];
for(let j=0;j<m.ids.length;j++){if(!m.ok[j])continue;const th=new Float32Array(T);for(let i=0;i<T;i++)th[i]=TB[j*T+i];ids.push(m.ids[j]);chunks.push(Buffer.from(C.descOf(th).buffer))}
fs.writeFileSync('/workspace/cartes-pokemon-index.bin',Buffer.concat(chunks));fs.writeFileSync('/workspace/cartes-pokemon-index.json',JSON.stringify({dl:C.DL,ids}));
console.log(ids.length,Buffer.concat(chunks).length);
