const fs=require('fs'),Jimp=require('jimp');
const fr=JSON.parse(fs.readFileSync('/tmp/frcards.json')),en=new Map(JSON.parse(fs.readFileSync('/tmp/encards.json')).map(c=>[c.id,c.image]));
const POCKET=/^(A\d+[a-z]?|B\d+[a-z]?|P-[AB])$/;
const list=[];
for(const c of fr){const setId=c.id.endsWith('-'+c.localId)?c.id.slice(0,-c.localId.length-1):c.id.slice(0,c.id.lastIndexOf('-'));if(POCKET.test(setId))continue;
 const img=c.image||en.get(c.id);if(img)list.push([c.id,img,c.image?0:1])}
const [A,B]=process.argv.slice(2).map(Number);console.log("todo",list.length,A,B);
const TW=32,TH=44,out=Buffer.alloc(list.length*TW*TH*3),ok=new Uint8Array(list.length);
function thumb(bm,o){const W=bm.width,H=bm.height,d=bm.data;for(let ty=0;ty<TH;ty++)for(let tx=0;tx<TW;tx++){const x0=Math.floor(tx*W/TW),x1=Math.floor((tx+1)*W/TW),y0=Math.floor(ty*H/TH),y1=Math.floor((ty+1)*H/TH);let r=0,g=0,b=0,n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*4;r+=d[i];g+=d[i+1];b+=d[i+2];n++}const k=o+(ty*TW+tx)*3;out[k]=r/n;out[k+1]=g/n;out[k+2]=b/n}}
let i=A,done=0,fail=0;
async function get(u){for(let a=0;a<3;a++){try{const r=await fetch(u);if(r.ok)return Buffer.from(await r.arrayBuffer());if(r.status===404)return null}catch(e){}await new Promise(r=>setTimeout(r,500))}return null}
(async()=>{await Promise.all(Array.from({length:48},async()=>{while(i<Math.min(B,list.length)){const k=i++;const b=await get(list[k][1]+'/low.jpg');
 if(b){try{thumb((await Jimp.read(b)).bitmap,k*TW*TH*3);ok[k]=1}catch(e){fail++}}else fail++;
 if(++done%1000===0)console.log(done,fail)}}));
 fs.writeFileSync('part'+A+'.bin',out.subarray(A*TW*TH*3,Math.min(B,list.length)*TW*TH*3));fs.writeFileSync('part'+A+'.json',JSON.stringify({ids:list.map(x=>x[0]),en:list.map(x=>x[2]),ok:[...ok]}));console.log('end',done,fail)})();
