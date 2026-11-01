const fs=require('fs'),Jimp=require('jimp');const src=fs.readFileSync('app.js','utf8');
const a=src.indexOf('const TW=32'),b=src.indexOf('let IDX=null');
const d0=src.indexOf('function pairSim'),d1=src.indexOf('function briefOf');
let seen=[];eval(src.slice(a,b)+src.slice(d0,d1)+';globalThis.X={pairSim,findCard,thumbFrom,descOf,nearest,decide,DL};');
var IDX;const meta=JSON.parse(fs.readFileSync('/workspace/cartes-pokemon-index.json'));IDX=new Int8Array(fs.readFileSync('/workspace/cartes-pokemon-index.bin'));
const N=meta.ids.length;console.log('dl',meta.dl,X.DL,'n',N,IDX.length/X.DL);
const sims=JSON.parse(fs.readFileSync('ocr/sim/meta.json'));
(async()=>{let ok=0,wrong=0,none=0;
for(let k=0;k<sims.length;k++){if(!sims[k])continue;
 const im=await Jimp.read('ocr/sim/'+k+'.jpg');seen=[];let got=null;
 // 4 images successives de la même scène, avec un léger bruit différent à chaque fois
 for(let f=0;f<4&&!got;f++){const c=im.clone();if(f)c.brightness((f%2?1:-1)*.04).blur(1);const px=c.bitmap.data,rc=X.findCard(px,288,402),top=X.nearest(X.descOf(X.thumbFrom(px,288,402,rc)),IDX,N,6);
  const t=f*90;const diff=top.find(x=>eval('pairSim')(top[0][1],x[1])<.9);seen.push({j:top[0][1],s:top[0][0],m:top[0][0]-(diff?diff[0]:top[top.length-1][0]-.05),q:rc.q,t,top});got=eval('decide')(t)}
 if(!got)none++;else if(meta.ids[got.j]===sims[k])ok++;else{wrong++;const A=meta.ids.indexOf(sims[k]);console.log('wrong',sims[k],meta.ids[got.j],A>=0?pairSim(A,got.j).toFixed(3):'?')}
}
console.log({ok,wrong,none});})();
