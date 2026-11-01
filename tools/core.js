// ==== cœur de reconnaissance (copié tel quel dans l'appli) ====
const TW=32,TH=44;
function findCard(px,W,H){
  const w=W>>1,h=H>>1,g=new Float32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const i=((2*y+dy)*W+2*x+dx)*4;s+=px[i]*.3+px[i+1]*.59+px[i+2]*.11}g[y*w+x]=s/4}
  const cp=new Float32Array(w),rp=new Float32Array(h);
  for(let y=Math.floor(h*.3);y<h*.7;y++)for(let x=1;x<w-1;x++)cp[x]+=Math.abs(g[y*w+x+1]-g[y*w+x-1]);
  for(let y=1;y<h-1;y++)for(let x=Math.floor(w*.3);x<w*.7;x++)rp[y]+=Math.abs(g[(y+1)*w+x]-g[(y-1)*w+x]);
  const m=1/12; // bord du cadre dans la zone (zone = cadre +20 %)
  const best=(p,n,lo,hi,exp)=>{let b=-1,bv=0;for(let i=Math.max(1,Math.floor(lo*n));i<Math.min(n-1,hi*n);i++){const v=p[i]*(1-Math.min(1,Math.abs(i/n-exp)/.22));if(v>bv){bv=v;b=i}}return b};
  let l=best(cp,w,0,.32,m),r=best(cp,w,.68,1,1-m),t=best(rp,h,0,.3,m),b=best(rp,h,.7,1,1-m);
  const A=63/88*(H/W); // largeur/hauteur attendue en unités normalisées... (en pixels zone)
  const okH=l>0&&r>0&&(r-l)>w*.55, okV=t>0&&b>0&&(b-t)>h*.55;
  let L=l/w,R_=r/w,T=t/h,B=b/h;
  const asp=x=>x; // ratio pixels: (R-L)*W / ((B-T)*H) ≈ 63/88
  const ratio=okH&&okV?((R_-L)*W)/((B-T)*H)/(63/88):0;
  if(okH&&okV&&ratio>.88&&ratio<1.12)return{x:L*W,y:T*H,w:(R_-L)*W,h:(B-T)*H,q:2};
  if(okH){const cw=(R_-L)*W,ch=cw*88/63,cy=okV?((T+B)/2)*H:H/2;return{x:L*W,y:cy-ch/2,w:cw,h:ch,q:1}}
  if(okV){const ch=(B-T)*H,cw=ch*63/88,cx=W/2;return{x:cx-cw/2,y:T*H,w:cw,h:ch,q:1}}
  return{x:W*m,y:H*m,w:W*(1-2*m),h:H*(1-2*m),q:0};
}
function thumbFrom(px,W,H,rc){ // moyenne par blocs du rectangle rc vers TW x TH RGB
  const out=new Float32Array(TW*TH*3);
  for(let ty=0;ty<TH;ty++){const y0=Math.max(0,Math.floor(rc.y+ty*rc.h/TH)),y1=Math.min(H,Math.max(y0+1,Math.floor(rc.y+(ty+1)*rc.h/TH)));
   for(let tx=0;tx<TW;tx++){const x0=Math.max(0,Math.floor(rc.x+tx*rc.w/TW)),x1=Math.min(W,Math.max(x0+1,Math.floor(rc.x+(tx+1)*rc.w/TW)));
    let r=0,g=0,b=0,n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*4;r+=px[i];g+=px[i+1];b+=px[i+2];n++}
    const k=(ty*TW+tx)*3;n=n||1;out[k]=r/n;out[k+1]=g/n;out[k+2]=b/n}}
  return out;
}
// descripteur : grille GX x GY sur la partie intérieure du thumb (marge MB cellules), normalisée par canal, en int8
const GX=8,GY=11,MB=1,DL=GX*GY*3;
function descOf(th){
  const v=new Float32Array(DL),iw=TW-2*MB,ih=TH-2*MB;
  for(let gy=0;gy<GY;gy++)for(let gx=0;gx<GX;gx++){const x0=MB+Math.floor(gx*iw/GX),x1=MB+Math.floor((gx+1)*iw/GX),y0=MB+Math.floor(gy*ih/GY),y1=MB+Math.floor((gy+1)*ih/GY);
    let r=0,g=0,b=0,n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*TW+x)*3;r+=th[i];g+=th[i+1];b+=th[i+2];n++}
    const k=(gy*GX+gx)*3;v[k]=r/n;v[k+1]=g/n;v[k+2]=b/n}
  const q=new Int8Array(DL);
  for(let c=0;c<3;c++){let m=0,s=0;const N=GX*GY;for(let i=c;i<DL;i+=3)m+=v[i];m/=N;for(let i=c;i<DL;i+=3)s+=(v[i]-m)**2;s=Math.sqrt(s/N)||1;
    for(let i=c;i<DL;i+=3)q[i]=Math.max(-127,Math.min(127,Math.round((v[i]-m)/s*40)))}
  return q;
}
function nearest(q,IDX,n,k){ // IDX Int8Array n*DL ; retourne top k [score,index]
  const top=[];let min=-1e9;
  for(let j=0,o=0;j<n;j++,o+=DL){let s=0;for(let i=0;i<DL;i++)s+=q[i]*IDX[o+i];
    if(top.length<k||s>min){top.push([s,j]);top.sort((a,b)=>b[0]-a[0]);if(top.length>k)top.pop();min=top[top.length-1][0]}}
  return top.map(([s,j])=>[s/(DL*1600),j]);
}
if(typeof module!=='undefined')module.exports={TW,TH,findCard,thumbFrom,descOf,nearest,DL};
