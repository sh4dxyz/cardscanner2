// Mise à jour incrémentale de l'index : ajoute les cartes du catalogue TCGdex absentes de l'index
// (nouvelle extension, nouvelles promos) sans tout recalculer. Usage : node update.js [dossier de l'index, défaut ..]
// Penser ensuite à incrémenter ?v= dans loadIndex() (index.html).
const fs=require('fs'),path=require('path'),Jimp=require('jimp'),C=require('./core.js');
const dir=process.argv[2]||path.join(__dirname,'..'),binF=path.join(dir,'cartes-pokemon-index.bin'),metaF=path.join(dir,'cartes-pokemon-index.json');
const meta=JSON.parse(fs.readFileSync(metaF)),have=new Set(meta.ids);
const POCKET=/^(A\d+[a-z]?|B\d+[a-z]?|P-[AB])$/; // cartes numériques TCG Pocket exclues
const setOf=c=>c.id.endsWith('-'+c.localId)?c.id.slice(0,-c.localId.length-1):c.id.slice(0,c.id.lastIndexOf('-'));
// même test que isCut() dans index.html
function isCut(d,w,h){if(h/w<1.25)return true;let bad=0,n=0;for(let y=Math.floor(h*.8);y<h*.95;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4;n++;if(d[i+3]<20||Math.max(d[i],d[i+1],d[i+2])<16)bad++}return n>0&&bad/n>.85}
(async()=>{
  const fr=await (await fetch('https://api.tcgdex.net/v2/fr/cards')).json();
  const todo=fr.filter(c=>c.image&&!POCKET.test(setOf(c))&&!have.has(c.id));
  console.log(todo.length,'cartes à ajouter');
  const ids=[],chunks=[];
  for(const c of todo){
    for(const u of [c.image,c.image.replace('/fr/','/en/')]){
      try{const b=(await Jimp.read(u+'/low.jpg')).bitmap;if(isCut(b.data,b.width,b.height))continue;
        chunks.push(Buffer.from(C.descOf(C.thumbFrom(b.data,b.width,b.height,{x:0,y:0,w:b.width,h:b.height})).buffer));ids.push(c.id);console.log('ajoutée',c.id,c.name);break}
      catch(e){}
    }
    if(ids[ids.length-1]!==c.id)console.log('échec',c.id);
  }
  if(!ids.length)return;
  fs.writeFileSync(binF,Buffer.concat([fs.readFileSync(binF),...chunks]));
  meta.ids.push(...ids);fs.writeFileSync(metaF,JSON.stringify(meta));
  console.log(ids.length,'empreintes ajoutées, total',meta.ids.length);
})();
