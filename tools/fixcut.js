// Corrige les empreintes des cartes dont l'image TCGdex française est coupée (bas vide/noir ou image tronquée) :
// repère les candidates dans l'index (2 dernières lignes de la grille quasi constantes), vérifie l'image FR,
// puis recalcule l'empreinte depuis l'image anglaise. Usage : node fixcut.js [dossier de l'index, défaut ..]
const fs=require('fs'),path=require('path'),Jimp=require('jimp'),C=require('./core.js');
const dir=process.argv[2]||path.join(__dirname,'..'),bin=path.join(dir,'cartes-pokemon-index.bin'),meta=JSON.parse(fs.readFileSync(path.join(dir,'cartes-pokemon-index.json')));
const I=new Int8Array(fs.readFileSync(bin)),fr=new Map(JSON.parse(fs.readFileSync('/tmp/frcards.json')).map(c=>[c.id,c.image]));
// même test que isCut() dans index.html
function isCut(d,w,h){if(h/w<1.25)return true;let bad=0,n=0;for(let y=Math.floor(h*.8);y<h*.95;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4;n++;if(d[i+3]<20||Math.max(d[i],d[i+1],d[i+2])<16)bad++}return n>0&&bad/n>.85}
(async()=>{let fixed=0;
 for(let j=0;j<meta.ids.length;j++){const o=j*C.DL;let r=0;
  for(let ch=0;ch<3;ch++){let mn=1e9,mx=-1e9;for(let gy=9;gy<11;gy++)for(let gx=0;gx<8;gx++){const v=I[o+(gy*8+gx)*3+ch];mn=Math.min(mn,v);mx=Math.max(mx,v)}r=Math.max(r,mx-mn)}
  if(r>14)continue;const id=meta.ids[j],u=fr.get(id);if(!u)continue;
  try{const b=(await Jimp.read(u+'/low.jpg')).bitmap;if(!isCut(b.data,b.width,b.height))continue;
   const e=(await Jimp.read(u.replace('/fr/','/en/')+'/low.jpg')).bitmap;if(isCut(e.data,e.width,e.height)){console.log('EN aussi coupée',id);continue}
   I.set(C.descOf(C.thumbFrom(e.data,e.width,e.height,{x:0,y:0,w:e.width,h:e.height})),o);fixed++;console.log('corrigée',id)}catch(err){console.log('échec',id,err.message)}}
 fs.writeFileSync(bin,Buffer.from(I.buffer));console.log(fixed,'empreintes corrigées')})();
