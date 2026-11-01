// génère des "images caméra" simulées : zone = cadre agrandi de 20 %, 288x402
const fs=require('fs'),Jimp=require('jimp');
const fr=JSON.parse(fs.readFileSync('/tmp/frcards.json')).filter(c=>c.image&&!/^(A\d|B\d|P-A)/.test(c.id));
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;const R=(a,b)=>a+(b-a)*rnd();
const ZW=288,ZH=402;fs.mkdirSync('sim',{recursive:true});
const pick=[];while(pick.length<200){const c=fr[Math.floor(rnd()*fr.length)];if(!pick.includes(c))pick.push(c)}
(async()=>{const meta=[];let k=0;
await Promise.all(Array.from({length:12},async()=>{while(k<pick.length){const idx=k++;const c=pick[idx];
 try{const card=await Jimp.read(c.image+'/high.jpg');
  const bgType=Math.floor(rnd()*3);const bg=new Jimp(ZW,ZH,0);
  const base=[[60,40,25],[225,225,220],[30,30,35]][bgType];
  bg.scan(0,0,ZW,ZH,(x,y,i)=>{const n=(rnd()-.5)*30+(bgType===0?Math.sin(y*.15+x*.02)*18:0);bg.bitmap.data[i]=base[0]+n;bg.bitmap.data[i+1]=base[1]+n;bg.bitmap.data[i+2]=base[2]+n;bg.bitmap.data[i+3]=255});
  const fw=ZW/1.2,fh=ZH/1.2,s=R(.82,1.0);card.resize(Math.round(fw*s),Math.round(fh*s)).rotate(R(-4,4),false);
  const cx=ZW/2+R(-.05,.05)*fw-card.bitmap.width/2,cy=ZH/2+R(-.05,.05)*fh-card.bitmap.height/2;
  bg.composite(card,Math.round(cx),Math.round(cy));
  const wb=[R(.85,1.15),R(.9,1.1),R(.8,1.2)],br=R(-40,30),ct=R(.75,1.1);
  const gx=R(0,ZW),gy=R(0,ZH),gr=R(30,90),ga=R(0,.6);
  bg.scan(0,0,ZW,ZH,(x,y,i)=>{const dd=Math.hypot(x-gx,(y-gy)*.7)/gr,gl=dd<1?(1-dd)*ga*255:0;for(let ch=0;ch<3;ch++){let v=bg.bitmap.data[i+ch];v=(v-128)*ct+128+br;v=v*wb[ch]+gl+(rnd()-.5)*14;bg.bitmap.data[i+ch]=Math.max(0,Math.min(255,v))}});
  bg.blur(Math.max(1,Math.round(R(0,2.5))));
  await bg.quality(70).writeAsync('sim/'+idx+'.jpg');meta[idx]=c.id;
 }catch(e){meta[idx]=null}}}));
fs.writeFileSync('sim/meta.json',JSON.stringify(meta));console.log('ok',meta.filter(Boolean).length)})();
