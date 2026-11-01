const fs=require('fs'),Jimp=require('jimp');const C=require('./core.js');
const meta=JSON.parse(fs.readFileSync('thumbs.json')),TB=fs.readFileSync('thumbs.bin');
const n=meta.ids.length,IDX=new Int8Array(n*C.DL),T=C.TW*C.TH*3;
for(let j=0;j<n;j++){const th=new Float32Array(T);for(let i=0;i<T;i++)th[i]=TB[j*T+i];IDX.set(C.descOf(th),j*C.DL)}
const pos=new Map(meta.ids.map((id,j)=>[id,j]));
const sims=JSON.parse(fs.readFileSync('sim/meta.json'));
(async()=>{let top1=0,top5=0,tot=0,noDet=0,q2=0,t0=Date.now(),sc={ok:[],bad:[]},sameArt=0;
for(let k=0;k<sims.length;k++){const id=sims[k];if(!id||!pos.has(id))continue;tot++;
 const im=await Jimp.read('sim/'+k+'.jpg'),px=im.bitmap.data,W=im.bitmap.width,H=im.bitmap.height;
 const rc=C.findCard(px,W,H);if(rc.q===2)q2++;
 const r=C.nearest(C.descOf(C.thumbFrom(px,W,H,rc)),IDX,n,5);
 const ids=r.map(x=>meta.ids[x[1]]);
 if(ids[0]===id){top1++;sc.ok.push([r[0][0],r[0][0]-r[1][0]])}else{sc.bad.push([r[0][0],r[0][0]-r[1][0]]);
   // même illustration ? (descripteur quasi identique de la vraie carte et du top1)
   const a=IDX.subarray(pos.get(id)*C.DL,(pos.get(id)+1)*C.DL),b=IDX.subarray(r[0][1]*C.DL,(r[0][1]+1)*C.DL);let s=0;for(let i=0;i<C.DL;i++)s+=a[i]*b[i];if(s/(C.DL*1600)>.9)sameArt++}
 if(ids.includes(id))top5++;
 const m=C.nearest(C.descOf(C.thumbFrom(px,W,H,{x:W/12,y:H/12,w:W*10/12,h:H*10/12})),IDX,n,1);if(meta.ids[m[0][1]]===id)noDet++;
}
const q=(a,p)=>{const s=a.map(x=>x).sort((x,y)=>x-y);return s[Math.floor(p*(s.length-1))]?.toFixed(3)};
console.log({tot,top1,top5,noDet,q2,sameArt,ms:(Date.now()-t0)/tot|0});
console.log('ok score p10/p50',q(sc.ok.map(x=>x[0]),.1),q(sc.ok.map(x=>x[0]),.5),'margin p10/p50',q(sc.ok.map(x=>x[1]),.1),q(sc.ok.map(x=>x[1]),.5));
console.log('bad score p50/p90',q(sc.bad.map(x=>x[0]),.5),q(sc.bad.map(x=>x[0]),.9),'margin p50/p90',q(sc.bad.map(x=>x[1]),.5),q(sc.bad.map(x=>x[1]),.9));
})();
