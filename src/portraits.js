/* ---------- character portraits ----------
   48x48 pixel art. Each character has their own face in FACES: head shape (width, forehead, chin, how square or
   pointed the jaw is), eye shape and spacing, brows, nose, mouth, age lines, ears, neck and shoulders. Clothes, hair,
   hats, glasses and beards come from CHARS. Hair and hats are drawn for a standard head, then stretched to fit the
   real one, so a cap sits right on a wide head or a narrow one. The figure gets a soft dark outline over a background
   with a glow behind the head. Light comes from the upper left. */
const FACES={
  mabel:{w:10.6,top:12,bot:10.5,jaw:2.2,cheek:1.06,eye:'small',sep:4,brow:{a:-.6},nose:'button',nl:5,mouth:'smile',mw:3,age:2,chub:1,blush:1.3},
  bea:{under:'wisps',w:9.4,top:12.5,bot:12.4,jaw:2.6,eye:'narrow',tilt:-1,sep:4,brow:{t:2,a:.4},nose:'long',nl:6,mouth:'smirk',mw:3,age:3,bones:1},
  gus:{fh:'boxed',under:'none',w:11.2,top:11.5,bot:11.4,jaw:3.4,eye:'open',sep:5,brow:{t:2,a:.3},nose:'broad',nl:5,mouth:'grin',mw:4,sh:1.12,nk:5,ears:1.15},
  tomas:{fh:'walrus',w:9.6,top:12.8,bot:12.6,jaw:2.4,eye:'heavy',sep:4,brow:{t:2,a:-.3},nose:'hook',nl:6,mouth:'flat',mw:3,age:1,bones:1},
  nell:{hair:'braids',w:9.8,top:12.4,bot:10.6,jaw:1.45,eye:'big',sep:4,tilt:1,brow:{a:-.5,y:-5},nose:'button',nl:4,mouth:'laugh',mw:3,blush:1.4},
  ada:{under:'curls',w:9.6,top:12,bot:11.6,jaw:1.9,eye:'almond',tilt:1,sep:4,brow:{t:2,a:.25},nose:'pointed',nl:5,mouth:'smirk',mw:3,bones:1},
  hank:{fh:'bushy',under:'shaggy',w:11.4,top:11,bot:11.8,jaw:3.6,eye:'small',sep:5,brow:{t:2,a:.2},nose:'broad',nl:6,mouth:'grin',mw:4,sh:1.16,nk:6,ears:1.2},
  ollie:{under:'curls',kid:1,w:9.2,top:11.2,bot:9.4,jaw:1.7,eye:'big',sep:4,ey:1,brow:{a:-.6},nose:'button',nl:3,mouth:'laugh',mw:3,my:7,sh:.82,nk:3,ears:1.25,blush:1.4},
  rosa:{hair:'wavy',w:10.4,top:11.8,bot:11,jaw:2,cheek:1.05,eye:'happy',sep:4,brow:{a:-.4,y:-5},nose:'wide',nl:5,mouth:'laugh',mw:4,blush:1.3},
  ines:{hair:'pony',w:9,top:13,bot:12,jaw:1.6,eye:'almond',sep:4,brow:{raise:1,a:.2},nose:'pointed',nl:6,mouth:'pursed',age:1,bones:1},
  otto:{hat:null,hair:'bald',fh:'fluffy',w:11.4,top:11.2,bot:11.2,jaw:2.2,cheek:1.1,eye:'happy',sep:5,brow:{a:-.6},nose:'button',nl:4,mouth:'grin',mw:4,chub:1,age:1,blush:1.6,sh:1.12,nk:5},
  fen:{hat:'flat',fh:'pencil',w:9,top:13,bot:12.8,jaw:2.3,eye:'heavy',tilt:-1,sep:4,brow:{a:-.7},nose:'long',nl:7,mouth:'flat',mw:2,age:1,ears:1.2},
  ivy:{w:9.4,top:12.6,bot:11.2,jaw:1.6,eye:'happy',sep:4,brow:{a:-.5,y:-5},nose:'pointed',nl:5,mouth:'small',age:3,blush:1.2},
  wren:{under:'locs',w:9.6,top:11.6,bot:11.8,jaw:2,eye:'open',sep:5,tilt:1,brow:{t:2,a:.2},nose:'wide',nl:5,mouth:'grin',mw:3,bones:1},
  tam:{fh:'goatee',under:'shaggy',w:10.6,top:11.6,bot:11.8,jaw:3,eye:'narrow',sep:4,brow:{t:2,a:.2},nose:'broad',nl:5,mouth:'smile',mw:3,age:1,ears:1.3},
  hattie:{hair:'sidebraid',w:10.4,top:12,bot:10.6,jaw:1.9,cheek:1.05,eye:'big',sep:4,brow:{a:-.3},nose:'button',nl:4,mouth:'grin',mw:3,blush:1.5,dimple:1},
  desmond:{fh:'trim',w:9.8,top:12.8,bot:12.4,jaw:2.4,eye:'narrow',tilt:-1,sep:4,brow:{t:2,a:-.4},nose:'broad',nl:6,mouth:'grin',mw:3,age:3,ears:1.2},
  lio:{hair:'bob',w:9.2,top:12.2,bot:11.4,jaw:1.5,eye:'heavy',sep:4,tilt:1,brow:{a:-.2},nose:'pointed',nl:5,mouth:'small',mole:[-6,6]},
  odile:{hair:'topknot',w:9.2,top:13.2,bot:12,jaw:1.8,eye:'almond',sep:4,brow:{raise:1,a:.4},nose:'long',nl:6,mouth:'pursed',age:2,bones:1},
  kit:{hat:null,hair:'side',w:10.2,top:11.6,bot:10.8,jaw:2,eye:'open',sep:5,brow:{a:-.2},nose:'button',nl:4,mouth:'grin',mw:3,dimple:1,ears:1.1},
  lu:{hair:'perm',w:10.8,top:11.6,bot:10.8,jaw:2.1,cheek:1.06,eye:'happy',sep:4,brow:{a:-.5,y:-5},nose:'wide',nl:5,mouth:'laugh',mw:3,age:3,chub:1,blush:1.4},
  bram:{hat:null,hair:'crop',fh:'handlebar',w:11.4,top:11.2,bot:12,jaw:3.8,eye:'small',sep:5,brow:{t:2,a:.25,y:-4},nose:'broad',nl:5,mouth:'flat',mw:3,sh:1.18,nk:6,dimple:1},
  agnes:{hair:'chignon',w:9.6,top:12.4,bot:11,jaw:1.5,eye:'small',sep:4,brow:{a:.1},nose:'hook',nl:6,mouth:'small',age:2,bones:1},
};
function portrait(id){if(PORT[id])return PORT[id];
  const sp=CHARS[id].sp,fc=Object.assign({w:10.2,top:12,bot:11.5,jaw:1.8,cheek:1,eye:'open',sep:4,tilt:0,brow:{},nose:'button',nl:5,mouth:'smile',mw:3,my:9,ey:0,age:0,ears:1,sh:1,nk:4,blush:1},FACES[id]||{});
  const N=48,F=new Array(N*N).fill(null),HB=new Array(N*N).fill(null),HF=new Array(N*N).fill(null);
  const hx=h=>{const n=parseInt(h.slice(1),16);return [n>>16,(n>>8)&255,n&255];},toH=c=>'#'+c.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
  const mixH=(a,b,t)=>{const A=hx(a),B=hx(b);return toH(A.map((v,i)=>v+(B[i]-v)*t));};
  const lum=h=>{const c=hx(h);return c[0]*.3+c[1]*.59+c[2]*.11;};
  let hs=0;for(const ch of id)hs=(hs*31+ch.charCodeAt(0))>>>0;
  let L=F;const put=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=N||y>=N)return;L[y*N+x]=c;};
  const get=(x,y)=>L[y*N+x];
  const rect=(x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)put(x+i,y+j,c);};
  const ell=(cx,cy,rx,ry,c,fn)=>{for(let j=Math.floor(-ry);j<=ry;j++)for(let i=Math.floor(-rx);i<=rx;i++)if((i*i)/(rx*rx)+(j*j)/(ry*ry)<=1.02){const col=fn?fn(i,j,c):c;if(col)put(cx+i,cy+j,col);}};
  const tint=(x,y,c,t)=>{x=Math.round(x);y=Math.round(y);const o=F[y*N+x];if(o)F[y*N+x]=mixH(o,c,t);};
  const skin=sp.skin,hair=sp.hair,old=fc.age>=2,_d=0,dark=lum(skin)<120;
  const hairD=shade(hair,old?-.22:-.3),hairL=shade(hair,old?.25:.3),hairDD=shade(hair,-.5);
  const eyeC=['#5a3a22','#3a6a9a','#4a7a4a','#6a4a2a','#3a3040','#6a6a3a'][hs%6];
  const brow=lum(hair)>200?shade(hair,-.18):(sp.style==='long'||lum(hair)>150?shade(hair,-.35):hair);
  const CX=24,CY=fc.kid?23:21,W=fc.w,sk=d=>shade(skin,d),lidC=dark?'#1c1418':'#3a2a2a';
  /* the head: a rounded forehead over a jaw that can be anything from pointed (low jaw) to square (high jaw) */
  const inFace=(x,y)=>{const dx=Math.abs(x-CX),dy=y-CY;return dy<=0?Math.pow(dx/W,2.4)+Math.pow(-dy/fc.top,2)<=1:Math.pow(dx/(W*fc.cheek),fc.jaw)+Math.pow(dy/fc.bot,2)<=1;};
  const faceHW=y=>{let w=0;while(w<16&&inFace(CX+w+1,y))w++;return w;};
  /* hair and hats are drawn for a standard head (half width 10.2, forehead 12) into their own layers */
  const sw=W/10.2,st=fc.top/12;
  const HS=fc.hair||sp.style,HT=fc.hat!==undefined?fc.hat:sp.hat,UN=HT?(fc.under||'short'):null,C0=21;
  const strands=(x,y)=>((x*3+y*7+hs)%9===0)?hairD:((x+y*2)%11===0&&x<CX?hairL:hair);
  const capM=(dx,dy,rx,ry,line)=>Math.pow(Math.abs(dx)/rx,2.2)+Math.pow((dy+1)/ry,2)<=1&&dy<line;
  const fillCap=(rx,ry,lineF,col)=>{for(let y=C0-17;y<=C0+3;y++)for(let x=CX-14;x<=CX+14;x++){const dx=x-CX,dy=y-C0;if(capM(dx,dy,rx,ry,lineF(dx)))put(x,y,col(x,y,dx,dy));}};
  const hcol=(x,y,dx,dy)=>{let c=strands(x,y);if(dx>6)c=hairD;if(dx<-2&&dx>-8&&dy<-10)c=hairL;return c;};
  const curl=(x0,y0,r)=>ell(Math.round(x0),Math.round(y0),r,r,hair,(i,j)=>i+j>1?hairD:(i+j<-2?hairL:hair));
  /* behind the head */
  L=HB;
  if(HS==='long'||UN==='long'){for(let y=8;y<44;y++){const w=y<16?8+(y-8)*.9:Math.min(15,14.2-Math.max(0,y-36)*.6);for(let x=Math.round(CX-w);x<=Math.round(CX+w);x++){const e=Math.abs(x-CX)/w;
      let c=e>.86?hairD:(x<CX-3&&((x+y)%5===0)?hairL:hair);if(y>40)c=hairD;put(x,y,c);}}
    for(let y=14;y<42;y+=3){put(CX-11,y,hairD);put(CX+11,y+1,hairD);}}
  if(HS==='wavy'){for(let y=7;y<47;y++){const b=y<15?9+(y-7)*.95:16.5-Math.max(0,y-39)*.9,wv=Math.sin(y*.5)*1.6;for(let x=Math.round(CX-b-wv);x<=Math.round(CX+b+wv);x++){const e=Math.abs(x-CX)/(b+wv);
      let c=e>.85?hairD:((x+Math.round(Math.sin(y*.5+x*.25)*2))%4===0?hairL:hair);if(y>43)c=hairD;put(x,y,c);}}}
  if(HS==='bob'){for(let y=8;y<=C0+7;y++){const w=y<14?8+(y-8)*.8:12.8;for(let x=Math.round(CX-w);x<=Math.round(CX+w);x++){let c=Math.abs(x-CX)>w-1.5?hairD:((x*2+y)%7===0?hairL:hair);if(y===C0+7)c=hairD;put(x,y,c);}}}
  if(HS==='pony'){for(let k=0;k<21;k++){const y=C0-6+k,x=CX+10+Math.round(Math.sin(k*.35)*1.4+k*.15);for(let i=-1;i<=(k<13?2:1);i++)put(x+i,y,i>0?hairD:(i<0&&k%3===0?hairL:hair));}}
  if(HS==='chignon')for(const s of [-1,1])ell(CX+s*10,C0+1,3.4,3,hair,(i,j)=>s>0||i+j>1?hairD:(i+j<-2?hairL:hair));
  if(UN==='locs')for(let x=CX-14;x<=CX+14;x++){if(Math.abs(x-CX)<8||(x+hs)%2)continue;const len=9+((x*7+hs)%6)+Math.abs(x-CX)*.4;for(let y=C0-7;y<C0-7+len;y++)put(x,y,(y%3===0)?hairD:hair);}
  /* on top */
  L=HF;
  if(!HT){
    if(HS==='short'||HS==='bun'||HS==='long'){fillCap(11.6,14,dx=>-6+Math.round(Math.abs(dx)*.12+(dx<0?Math.max(0,3-Math.abs(dx+4)):0)*.6),hcol);
      for(let y=C0-7;y<=C0+(HS==='long'?6:-2);y++)for(const s of [-1,1])for(let a=9;a<=11;a++)put(CX+s*a,y,s>0?hairD:hair);
      for(let k=0;k<5;k++)put(CX-4+k,C0-12+(k>>1),hairD);for(let x=CX-8;x<=CX+2;x++)put(x,C0-9+((x+CX)%3===0?1:0),strands(x,C0-9));}
    if(HS==='bun'){ell(CX+1,C0-16,4.6,4,hair,(i,j)=>i>1?hairD:(i<-1&&j<0?hairL:strands(i,j)));for(let i=-2;i<=2;i++)put(CX+1+i,C0-12,hairD);}
    if(HS==='crop'){fillCap(10.9,12.9,dx=>Math.abs(dx)>8?-3:-8,(x,y,dx)=>(x+y)%2?(dx>5?hairD:hair):mixH(hair,skin,.45));}
    if(HS==='side'){fillCap(12.2,15.5,dx=>dx<-3?-5:(dx<3?-6:-8),(x,y,dx,dy)=>((x-y)%5===0)?hairL:(dx>6?hairD:((x+y*3+hs)%8===0?hairD:hair)));
      for(let k=0;k<7;k++)put(CX-7+k,C0-6-(k>>1),k%2?hairD:hair);for(let y=C0-7;y<=C0-3;y++)for(const s of [-1,1])put(CX+s*10,y,s>0?hairD:hair);}
    if(HS==='bald'){for(let y=C0-6;y<=C0+1;y++)for(const s of [-1,1])for(let a=8;a<=11;a++){if(a===8&&y<C0-4)continue;put(CX+s*a,y,(a+y+hs)%3===0?hairL:(s>0?hairD:hair));}}
    if(HS==='bob'){fillCap(12.2,14.2,()=>-4,(x,y,dx,dy)=>dy===-5?hairD:hcol(x,y,dx,dy));for(let y=C0-6;y<=C0+7;y++)for(const s of [-1,1])for(let a=10;a<=12;a++)put(CX+s*a,y,s>0||a===12?hairD:hair);}
    if(HS==='pony'||HS==='chignon'||HS==='topknot'){fillCap(11,13.4,dx=>-7+(Math.abs(dx)>7?2:0),(x,y,dx,dy)=>(y%2===0&&(x+hs)%4===0)?hairD:(dx>6?hairD:(dx<-3&&dy<-9?hairL:hair)));
      if(HS==='chignon'){put(CX-10,C0-4,hairL);put(CX-11,C0-3,hair);put(CX+10,C0-4,hairD);}
      if(HS==='pony')for(let i=0;i<2;i++)put(CX+10+i,C0-7,'#d2493c');}
    if(HS==='topknot'){ell(CX,C0-16,4.2,3.6,hair,(i,j)=>i>1?hairD:(i<-1&&j<0?hairL:strands(i,j)));put(CX-4,C0-19,hair);put(CX+4,C0-18,hairD);put(CX+1,C0-20,hair);
      for(let k=0;k<9;k++)put(CX+4-k,C0-21+k,k===0?'#e88a8a':(k===8?'#3a3434':'#f1c84a'));}
    if(HS==='perm'){for(let y=C0-16;y<=C0+2;y+=3)for(let x=CX-13;x<=CX+13;x+=3){const dx=x-CX+((y/3)%2?1.5:0),dy=y-C0;if(capM(dx,dy,13.2,15.5,Math.abs(dx)>9?3:-5))curl(CX+dx,y,1.9);}}
    if(HS==='braids'){fillCap(11.4,13.8,()=>-6,(x,y,dx,dy)=>dx===0||dx===1?hairD:((dx<0?(x+y)%4===0:(x-y)%4===0)?hairD:hair));
      for(const s of [-1,1]){for(let k=0;k<20;k++){const y=C0-3+k,x=CX+s*(11+(k>10?1:0));for(let i=-1;i<=1;i++)put(x+i,y,(k+i+20)%3===0?hairD:(i<0?hairL:hair));}put(CX+s*12,C0+17,'#e8a33a');put(CX+s*12,C0+18,hairD);put(CX+s*11,C0+18,hair);}}
    if(HS==='wavy'){fillCap(12.2,14.4,dx=>dx<-1?-5:-7,hcol);for(let y=C0-7;y<=C0+10;y++){const wv=Math.round(Math.sin(y*.5)*1.2);for(const s of [-1,1])for(let a=9;a<=12;a++)put(CX+s*(a+wv),y,a===12||s>0?hairD:hair);}}
    if(HS==='sidebraid'){fillCap(11.6,14,dx=>dx<-2?-6:-7,hcol);for(let k=0;k<22;k++){const y=C0-4+k,x=CX-10+Math.round(k*.28);for(let i=-1;i<=1;i++)put(x+i,y,(k+i+20)%3===0?hairD:(i<0?hairL:hair));}put(CX-4,C0+18,'#e8a33a');put(CX-4,C0+19,hair);}
    if(HS==='curly'){const cur=[];for(let k=0;k<15;k++){const a=Math.PI*(-.08+k/14*1.16);cur.push([CX+Math.cos(a)*10.5,C0-5-Math.sin(a)*8.5,3.2]);}
      for(let k=0;k<6;k++){const a=Math.PI*(.2+k/5*.6);cur.push([CX+Math.cos(a)*6,C0-9-Math.sin(a)*3.5,3]);}
      for(const [x0,y0,r] of cur)curl(x0,y0,r);for(const [x0,y0] of cur){put(Math.round(x0)-1,Math.round(y0)-1,hairL);put(Math.round(x0)+2,Math.round(y0)+1,hairDD);}}}
  /* what shows below a hat */
  if(UN==='short'||UN==='long')for(let y=C0-7;y<=C0-2;y++)for(const s of [-1,1])for(let a=9;a<=11;a++)put(CX+s*a,y,s>0?hairD:hair);
  if(UN==='shaggy')for(let y=C0-7;y<=C0+2;y++)for(const s of [-1,1])for(let a=9;a<=13;a++){if(y>C0-3+((a*3+hs+s)%4)||(a===13&&y<C0-4))continue;put(CX+s*a,y,(a+y)%3===0?hairD:(s>0?hairD:hair));}
  if(UN==='curls')for(const s of [-1,1])for(const [a,b,r] of [[10.5,-5,2.4],[12,-2,2.4],[11,1,2.2]])curl(CX+s*a,C0+b,r);
  if(UN==='locs')for(let x=CX-12;x<=CX+12;x++){if(Math.abs(x-CX)<9||(x+hs)%2===0)continue;for(let y=C0-7;y<=C0+6+((x+hs)%4);y++)put(x,y,(y%3===0)?hairD:hair);}
  if(UN==='wisps')for(const s of [-1,1])for(const [a,b] of [[10,-6],[11,-5],[11,-3],[12,-2]])put(CX+s*a,C0+b,s>0?hairD:hairL);
  /* hats */
  if(HT){const h=fc.hatc||sp.hatc,hD=shade(h,-.22),hL=shade(h,.2),hDD=shade(h,-.4);
    if(HT==='cap'){ell(CX,C0-11,11,6.5,h,(i,j)=>j>3?null:(i>5?hD:(i<-4&&j<-2?hL:h)));for(let x=CX-11;x<=CX+11;x++)put(x,C0-7,hD);
      for(let x=CX-4;x<=CX+15;x++){put(x,C0-6,hDD);put(x,C0-7,x>CX+11?hD:get(x,C0-7));}put(CX,C0-17,hL);for(let j=0;j<5;j++)put(CX+(j>>1),C0-16+j,hD);}
    if(HT==='flat'){ell(CX+1,C0-10,12,5.4,h,(i,j)=>j>2?null:((i+j+40)%3===0?hD:(i>6?hD:(i<-5?hL:h))));for(let x=CX-11;x<=CX+12;x++)put(x,C0-11,(x%2)?hD:h);
      for(let x=CX-9;x<=CX+11;x++){put(x,C0-7,hDD);put(x,C0-8,x>CX+6?hD:h);}put(CX+1,C0-15,hD);}
    if(HT==='beanie'){ell(CX,C0-11,11.4,7.5,h,(i,j)=>j>3?null:((i+40)%3===0?hD:(i<-5?hL:h)));for(let x=CX-12;x<=CX+12;x++)for(let j=0;j<3;j++)put(x,C0-8+j,((x)%2===0)?hD:h);
      ell(CX,C0-19,2.6,2.2,shade(h,.38),(i,j)=>i>0&&j>0?shade(h,.15):shade(h,.38));}
    if(HT==='ranger'){for(let x=CX-17;x<=CX+17;x++){put(x,C0-8,x>CX+8?hD:h);put(x,C0-7,hDD);}for(let x=CX-15;x<=CX+15;x++)put(x,C0-9,h);
      for(let y=C0-17;y<=C0-9;y++)for(let x=CX-9;x<=CX+9;x++){if(y===C0-17&&Math.abs(x-CX)>6)continue;let c=x>CX+4?hD:(x<CX-5?hL:h);if(y===C0-11||y===C0-10)c=shade(h,-.45);if(Math.abs(x-CX)<2&&y<C0-14)c=hD;put(x,y,c);}}
    if(HT==='aviator'){ell(CX,C0-8,12,10,h,(i,j)=>j>2?null:(i>6?hD:(i<-5&&j<-4?hL:h)));for(const s of [-1,1])for(let y=C0-6;y<=C0+8;y++)for(let i=0;i<4;i++)put(CX+s*(9+i),y,s>0||i>2?hD:h);
      for(const s of [-1,1])put(CX+s*11,C0+8,hDD);for(let x=CX-12;x<=CX+12;x++)put(x,C0-10,'#4a3020');
      for(const gx of [CX-6,CX+5]){ell(gx,C0-11,3.2,2.6,'#8a8070');ell(gx,C0-11,2.2,1.6,'#9ad6e8',(i,j)=>i<0&&j<0?'#e8faff':'#9ad6e8');}}}
  // stretch a standard-head layer onto this head (nearest pixel), anchored at the eyes' line
  const fit=(S,dst)=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dy=y-CY,sy=Math.round(C0+(dy<0?dy/st:dy)),sx=Math.round(CX+(x-CX)/sw);if(sx<0||sy<0||sx>=N||sy>=N)continue;const v=S[sy*N+sx];if(v)dst[y*N+x]=v;}};
  L=F;fit(HB,F);
  /* shoulders and shirt */
  const SH=fc.sh;for(let y=CY+14;y<N;y++){const w=Math.min(23*SH,(11+(y-CY-14)*1.6)*SH);for(let x=Math.ceil(CX-w);x<=Math.floor(CX+w);x++){const e=(x-CX)/w;
      let c=sp.shirt;if(e<-.55&&y<CY+20)c=shade(sp.shirt,.12);if(e>.5)c=shade(sp.shirt,-.16);if(e>.82||y>45)c=shade(sp.shirt,-.26);
      if(sp.plaid&&((x%5===0)||(y%5===2)))c=shade(c,-.32);put(x,y,c);}}
  for(let y=CY+19;y<N;y++){put(CX-Math.round(15*SH)+((y-CY-19)>>2),y,shade(sp.shirt,-.22));put(CX+Math.round(15*SH)-((y-CY-19)>>2),y,shade(sp.shirt,-.3));}
  /* neck, collar */
  const NK=fc.nk,NY=CY+fc.bot-3;
  for(let y=NY;y<CY+17;y++)for(let x=CX-NK;x<=CX+NK;x++)put(x,y,x>CX+NK-3?sk(-.18):sk(-.08));
  for(let k=0;k<5;k++){for(let x=CX-NK+k;x<=CX+NK-k;x++)put(x,CY+15+k,x>CX+1?sk(-.16):sk(-.06));}
  const col=shade(sp.shirt,.28),colD=shade(sp.shirt,-.1),cy0=CY+14;
  for(let k=0;k<5;k++){put(CX-NK-1-k,cy0+k,col);put(CX-NK-k,cy0+1+k,col);put(CX-NK-1+k,cy0+1+k,colD);put(CX+NK+1+k,cy0+k,colD);put(CX+NK+k,cy0+1+k,colD);put(CX+NK+1-k,cy0+1+k,col);}
  if(!sp.scarf){put(CX,CY+19,shade(sp.shirt,-.35));put(CX,CY+21,shade(sp.shirt,.2));put(CX,CY+24,shade(sp.shirt,.2));}
  if(fc.age>=3){put(CX-2,NY+3,sk(-.2));put(CX-1,NY+4,sk(-.2));put(CX+2,NY+3,sk(-.26));}
  /* ears */
  const EY=CY+fc.ey,eh=Math.round(3*fc.ears);
  for(const s of [-1,1]){const ex=CX+s*(faceHW(EY+1)+1);for(let y=EY-eh+1;y<=EY+eh+1;y++)for(let i=0;i<(fc.ears>1.15?3:2);i++){const x=ex+s*i,c=s>0?sk(-.14):skin;if(!(i>0&&(y===EY-eh+1||y===EY+eh+1)))put(x,y,c);}
    put(ex,EY,sk(-.26));put(ex,EY+1,sk(-.26));put(ex+s,EY+2,sk(-.2));}
  /* face with shading */
  for(let y=CY-14;y<=CY+14;y++)for(let x=CX-14;x<=CX+14;x++){if(!inFace(x,y))continue;const dx=x-CX,dy=y-CY,hw=faceHW(y);let c=skin;
    if(dx>=hw-4||(dy>=fc.bot-4&&dx>=2))c=sk(-.12);if(dx>=hw-1||(dy>=fc.bot-1.5))c=sk(-.2);
    if(dx<=-hw+2&&dx>=-hw+5-3&&dy>=-4&&dy<=4)c=sk(.07);if(dx<=-2&&dx>=-6&&dy>=-fc.top+2&&dy<=-6)c=sk(.09);
    put(x,y,c);}
  if(fc.chub){const by=CY+Math.round(fc.bot);for(let x=CX-5;x<=CX+5;x++){put(x,by+1,x>CX+2?sk(-.24):sk(-.12));}for(let x=CX-4;x<=CX+4;x++)put(x,by,sk(-.04));}
  if(fc.bones)for(const s of [-1,1]){const hw=faceHW(EY+4);put(CX+s*(hw-2),EY+4,sk(-.12));put(CX+s*(hw-3),EY+5,sk(-.12));put(CX+s*(hw-3),EY+6,sk(-.08));}
  /* eyes and brows */
  const lowest={v:EY+1};
  for(const s of [-1,1]){const x0=s<0?CX-fc.sep-3:CX+fc.sep,outer=s<0?x0-1:x0+4,inner=s<0?x0+3:x0,io=s<0?x0:x0+3,ii=s<0?x0+3:x0;
    const E=shade(eyeC,-.3),iris=(y,rows)=>{put(x0+1,y,'#ffffff');put(x0+2,y,E);for(let r=1;r<rows;r++){put(x0+1,y+r,r===2?eyeC:E);put(x0+2,y+r,r===2?eyeC:E);}};
    const flick=dy=>{put(outer,EY-1+dy,lidC);};
    const ty=fc.tilt;
    switch(fc.eye){
      case 'big':rect(x0,EY,4,3,'#f6f2ee');iris(EY,3);put(x0+1,EY+2,shade(eyeC,.1));rect(x0,EY-1,4,1,lidC);flick(-ty);put(outer,EY-2-Math.max(0,ty),dark?'#2a1e22':'#5a4040');for(let i=0;i<4;i++)tint(x0+i,EY+3,'#000000',.07);lowest.v=EY+2;break;
      case 'small':put(x0+1,EY,'#ffffff');put(x0+2,EY,'#1c1620');put(x0+1,EY+1,'#1c1620');put(x0+2,EY+1,'#1c1620');for(let i=0;i<4;i++)tint(x0+i,EY-1,'#000000',.12);break;
      case 'narrow':rect(x0,EY,4,1,lidC);put(outer,EY+(ty<0?1:0),lidC);put(io,EY+1,'#e8e2dc');put(ii,EY+1,'#e8e2dc');put(x0+1,EY+1,'#ffffff');put(x0+2,EY+1,shade(eyeC,-.35));for(let i=0;i<4;i++)tint(x0+i,EY+2,'#000000',.1);break;
      case 'happy':put(x0,EY+1,lidC);put(x0+1,EY,lidC);put(x0+2,EY,lidC);put(x0+3,EY+1,lidC);put(outer,EY+(s<0?1:1),shade(lidC,.3));for(let i=0;i<4;i++)tint(x0+i,EY+2,'#ffffff',.06);break;
      case 'heavy':rect(x0,EY-2,4,1,sk(-.14));rect(x0,EY-1,4,1,lidC);rect(x0,EY-1+1,4,2,'#f6f2ee');iris(EY,2);put(outer,EY-1,lidC);break;
      case 'almond':put(io,EY,sk(-.1));for(let i=0;i<4;i++)if(x0+i!==io)put(x0+i,EY,'#f6f2ee');rect(x0,EY+1,4,1,'#f6f2ee');iris(EY,2);rect(x0,EY-1,4,1,lidC);put(io,EY,lidC);flick(-ty);put(outer,EY-1-ty,lidC);break;
      default:rect(x0,EY,4,2,'#f6f2ee');iris(EY,2);rect(x0,EY-1,4,1,lidC);flick(-ty);put(outer,EY-2,dark?'#2a1e22':'#5a4040');for(let i=0;i<4;i++)tint(x0+i,EY+2,'#000000',.08);}
    if(fc.age>=2){put(outer+s,EY,sk(-.18));put(outer+s,EY+2,sk(-.16));}
    if(fc.age>=3)for(let i=0;i<3;i++)tint(x0+(s<0?1:0)+i,lowest.v+2,'#000000',.12);
    // brows: arch, angle (stern = inner end low), thickness, one raised
    const B=fc.brow,by=EY+(B.y??-4)-(B.raise&&s>0?1:0),a=Math.max(0,B.a||0);
    for(let i=-1;i<=4;i++){const innerness=s<0?(i+1)/5:(4-i)/5,arch=(i===-1||i===4)?1:(B.raise&&s>0&&(i===1||i===2)?-1:0);
      const y=by+arch+Math.round(a*(innerness-.5)*2.2);if((i===-1&&s>0)||(i===4&&s<0)){if(innerness>.9)put(x0+i,y,shade(brow,.12));continue;}put(x0+i,y,brow);if(B.t===2&&i>=0&&i<=3)put(x0+i,y+1,shade(brow,.12));}}
  /* nose */
  const NB=EY+1,NT=EY+fc.nl;
  switch(fc.nose){
    case 'long':for(let y=NB;y<=NT;y++)put(CX+1,y,sk(-.13));put(CX,NT,sk(.07));put(CX-1,NT+1,sk(-.2));put(CX+1,NT+1,sk(-.26));put(CX,NT+1,sk(-.08));put(CX-1,NB+2,sk(.08));break;
    case 'broad':for(let y=NB+1;y<NT;y++)put(CX+1,y,sk(-.12));put(CX-3,NT,sk(-.1));put(CX-2,NT,sk(-.2));put(CX-1,NT,sk(-.08));put(CX,NT-1,sk(.08));put(CX,NT,sk(.02));put(CX+1,NT,sk(-.12));put(CX+2,NT,sk(-.26));put(CX+3,NT,sk(-.14));put(CX-1,NT+1,sk(-.16));put(CX+1,NT+1,sk(-.2));break;
    case 'wide':for(let y=NB+1;y<NT;y++)put(CX+1,y,sk(-.1));put(CX-2,NT,sk(-.16));put(CX-1,NT,sk(-.1));put(CX,NT-1,sk(.08));put(CX+1,NT,sk(-.14));put(CX+2,NT,sk(-.22));put(CX-1,NT+1,sk(-.12));put(CX+1,NT+1,sk(-.18));break;
    case 'hook':for(let y=NB;y<=NT;y++)put(CX+1,y,sk(-.12));put(CX+2,NB+2,sk(-.14));put(CX+2,NB+3,sk(-.18));put(CX,NB+2,sk(.08));put(CX,NT,sk(-.06));put(CX+1,NT+1,sk(-.26));put(CX,NT+1,sk(-.2));put(CX-1,NT,sk(-.14));break;
    case 'pointed':for(let y=NB;y<NT;y++)put(CX+1,y,sk(-.1));put(CX,NT-1,sk(.08));put(CX,NT,sk(-.16));put(CX-1,NT,sk(-.24));put(CX+1,NT,sk(-.12));break;
    default:put(CX+1,NT-2,sk(-.1));put(CX+1,NT-1,sk(-.12));put(CX,NT-1,sk(.07));put(CX-1,NT,sk(-.16));put(CX+1,NT,sk(-.22));put(CX,NT,sk(-.05));}
  /* cheeks, freckles, marks */
  const blush=dark?'#c0606a':'#f07a80',bk=(dark?.2:.28)*fc.blush,ch=fc.eye==='happy'?EY+3:EY+4;
  for(const s of [-1,1]){const bx=s<0?CX-fc.sep-4:CX+fc.sep+1;for(let i=0;i<3;i++){tint(bx+i,ch,blush,bk);tint(bx+i,ch+1,blush,bk*.6);}}
  if(sp.freckles)for(const [a,b] of [[-6,4],[-4,5],[-7,6],[3,4],[5,5],[6,4],[-2,3],[2,3],[4,6]])put(CX+a,EY+b,sk(-.24));
  if(fc.mole)put(CX+fc.mole[0],EY+fc.mole[1],sk(-.42));
  if(fc.dimple){const y=CY+Math.round(fc.bot)-2;put(CX,y,sk(-.16));}
  /* mouth */
  const lip=dark?mixH(skin,'#3a1418',.55):mixH(skin,'#8a2a30',.55),lipL=mixH(skin,'#c05a5a',.22),MY=EY+fc.my,mw=fc.mw;
  switch(fc.mouth){
    case 'grin':for(let x=CX-mw;x<=CX+mw;x++)put(x,MY-1,lip);put(CX-mw-1,MY-2,lip);put(CX+mw+1,MY-2,lip);for(let x=CX-mw+1;x<=CX+mw-1;x++)put(x,MY,'#f4efe6');put(CX-mw,MY,lip);put(CX+mw,MY,lip);
      for(let x=CX-mw+1;x<=CX+mw-1;x++)put(x,MY+1,lip);for(let x=CX-mw+2;x<=CX+mw-2;x++)put(x,MY+2,lipL);break;
    case 'laugh':for(let x=CX-mw;x<=CX+mw;x++)put(x,MY-1,lip);put(CX-mw-1,MY-2,lip);put(CX+mw+1,MY-2,lip);for(let x=CX-mw+1;x<=CX+mw-1;x++){put(x,MY,'#f4efe6');put(x,MY+1,'#5a1a22');}
      put(CX-mw,MY,lip);put(CX+mw,MY,lip);put(CX-mw+1,MY+1,lip);put(CX+mw-1,MY+1,lip);for(let x=CX-1;x<=CX+1;x++)put(x,MY+1,'#c0505a');for(let x=CX-mw+2;x<=CX+mw-2;x++)put(x,MY+2,lip);put(CX,MY+3,lipL);break;
    case 'flat':for(let x=CX-mw;x<=CX+mw;x++)put(x,MY,lip);for(let x=CX-mw+1;x<=CX+mw-1;x++)put(x,MY+1,lipL);put(CX,MY+2,sk(-.1));break;
    case 'smirk':for(let x=CX-mw;x<=CX+mw;x++)put(x,MY,lip);put(CX+mw+1,MY-1,lip);put(CX+mw+2,MY-2,sk(-.16));for(let x=CX-mw+1;x<=CX+mw-1;x++)put(x,MY+1,lipL);put(CX,MY+2,sk(-.1));break;
    case 'small':for(let x=CX-1;x<=CX+1;x++)put(x,MY,lip);put(CX-2,MY-1,mixH(lip,skin,.4));put(CX+2,MY-1,mixH(lip,skin,.4));put(CX,MY+1,lipL);break;
    case 'pursed':put(CX-1,MY,lip);put(CX,MY,shade(lip,-.1));put(CX+1,MY,lip);put(CX,MY+1,lipL);put(CX-2,MY,sk(-.12));put(CX+2,MY,sk(-.16));put(CX,MY+2,sk(-.1));break;
    default:for(let x=CX-mw;x<=CX+mw;x++)put(x,MY,lip);put(CX-mw-1,MY-1,lip);put(CX+mw+1,MY-1,lip);put(CX-mw-2,MY-2,sk(-.12));put(CX+mw+2,MY-2,sk(-.16));
      for(let x=CX-mw+1;x<=CX+mw-1;x++)put(x,MY+1,lipL);put(CX,MY+2,sk(-.1));}
  // smile lines and forehead lines with age
  if(fc.age>=1){const ox=mw+3;put(CX-ox,MY-3,sk(-.12));put(CX-ox,MY-2,sk(-.14));put(CX-ox+1,MY-1,sk(-.1));put(CX+ox,MY-3,sk(-.18));put(CX+ox,MY-2,sk(-.2));put(CX+ox-1,MY-1,sk(-.14));}
  if(fc.age>=2&&!HT){const fy=CY-Math.round(fc.top)+5;for(let x=CX-4;x<=CX+3;x++)put(x,fy,sk(-.08));}
  if(fc.age>=3&&!HT){const fy=CY-Math.round(fc.top)+7;for(let x=CX-3;x<=CX+4;x++)put(x,fy,sk(-.07));}
  /* facial hair */
  const FH=fc.fh||(sp.beard?'full':(sp.mustache?'stache':null)),fhc=sp.beard||sp.mustache;
  if(FH){const b=fhc,bD=shade(b,-.25),bL=shade(b,.22),bot=CY+fc.bot,tex=(x,y)=>(x+y*3+hs)%7===0?bL:((x*5+y)%6===0?bD:b);
    const beard=(extra,wide,tidy,mouthGap)=>{for(let y=EY+5;y<=bot+extra;y++)for(let x=CX-16;x<=CX+16;x++){const dx=x-CX,dy=y-EY,yb=Math.min(y,Math.round(bot-2));
        const ins=inFace(x,y)||(Math.abs(dx)<=faceHW(yb)+wide&&y<=bot+extra-Math.abs(dx)*(extra+2)/(faceHW(yb)+wide+1)&&y>=EY+5);if(!ins)continue;
        if(dy<fc.my-1&&Math.abs(dx)<faceHW(y)-2)continue;if(Math.abs(dx)<=mw&&y>=MY-1&&y<=MY+mouthGap)continue;
        let c=tidy?((x*5+y)%9===0?bD:b):tex(x,y);if(dx>5)c=shade(c,-.15);if(!tidy&&wide&&(Math.abs(dx)===faceHW(yb)+wide)&&(y+hs)%2)continue;put(x,y,c);}
      for(let x=CX-mw-1;x<=CX+mw+1;x++)put(x,MY-2,x>CX?bD:b);put(CX-mw-2,MY-1,b);put(CX+mw+2,MY-1,bD);};
    const stache=(rows,droop,wid)=>{for(let r=0;r<rows;r++)for(let x=CX-mw-wid;x<=CX+mw+wid;x++)put(x,MY-2-r+ (rows>1?1:0),x>CX+1?shade(b,-.2-r*.05):(r===rows-1?bL:b));
      for(const s of [-1,1])for(let d=0;d<droop;d++)put(CX+s*(mw+wid),MY-1+d,s>0?bD:b);};
    if(FH==='full')beard(4,0,false,2);
    if(FH==='bushy')beard(7,2,false,2);
    if(FH==='fluffy'){beard(6,2,false,2);for(let x=CX-8;x<=CX+8;x+=3)put(x,bot+6-Math.abs(x-CX)*.3,bL);}
    if(FH==='boxed'){beard(2,0,true,1);for(let x=CX-6;x<=CX+6;x++)put(x,bot+2,bD);}
    if(FH==='trim'){for(let y=EY+3;y<=bot+1;y++)for(let x=CX-14;x<=CX+14;x++){const dx=Math.abs(x-CX),yb=Math.min(y,Math.round(bot-1));if(!inFace(x,Math.min(y,bot)))continue;
        if(faceHW(yb)-dx<=1||y>=bot-2||(dx<=mw+1&&y>=MY+2))put(x,y,(x+y)%5===0?bL:(x>CX+5?bD:b));}
      stache(1,1,1);}
    if(FH==='goatee'){for(let y=MY+2;y<=bot+2;y++){const w=y>bot?2:mw;for(let x=CX-w;x<=CX+w;x++)put(x,y,tex(x,y));}for(const s of [-1,1])for(let y=MY-1;y<=MY+2;y++)put(CX+s*(mw+1),y,s>0?bD:b);stache(1,0,1);
      for(let y=EY+6;y<=bot;y++)for(let x=CX-14;x<=CX+14;x++)if(inFace(x,y)&&(x*7+y*13+hs)%5===0&&Math.abs(x-CX)>mw+1)tint(x,y,b,.35);}
    if(FH==='walrus')stache(3,2,2);
    if(FH==='pencil')for(let x=CX-mw;x<=CX+mw;x++)if(x!==CX)put(x,MY-2,b);
    if(FH==='handlebar'){stache(2,0,1);for(const s of [-1,1]){put(CX+s*(mw+2),MY-2,b);put(CX+s*(mw+3),MY-3,b);put(CX+s*(mw+3),MY-4,s>0?bD:b);put(CX+s*(mw+2),MY-4,bL);}}
    if(FH==='stache')stache(2,1,1);}
  if(HS==='bald'&&!HT){const ty=CY-Math.round(fc.top);put(CX-4,ty+2,sk(.18));put(CX-3,ty+2,sk(.22));put(CX-3,ty+3,sk(.15));put(CX-5,ty+3,sk(.12));}
  /* glasses */
  if(sp.glasses){const g='#2a2030',gb=fc.eye==='big'?4:3;for(const s of [-1,1]){const ox=(s<0?CX-fc.sep-3:CX+fc.sep)-1;for(let i=0;i<6;i++){put(ox+i,EY-2,g);put(ox+i,EY+gb,g);}for(let j=-1;j<gb;j++){put(ox,EY+j,g);put(ox+5,EY+j,g);}
      for(let i=1;i<5;i++)for(let j=-1;j<gb;j++)tint(ox+i,EY+j,'#cfe8ff',.18);put(ox+1,EY-1,'#ffffff');}
    for(let x=CX-fc.sep+2;x<=CX+fc.sep-2;x++)put(x,EY-1,g);const hw=faceHW(EY);put(CX-hw-1,EY,g);put(CX+hw,EY,g);}
  /* hair and hats on top */
  fit(HF,F);
  /* scarf */
  if(sp.scarf){const s=sp.scarf,sD=shade(s,-.22),sL=shade(s,.18),y0=CY+12;for(let y=y0;y<=y0+4;y++)for(let x=CX-9+(y-y0);x<=CX+9-(y-y0)*.5;x++)put(x,y,(x+y)%4===0?sD:(x<CX-4?sL:s));
    for(let y=y0+4;y<=y0+12;y++)for(let x=CX+3;x<=CX+6;x++)put(x+((y-y0-4)>>2),y,x===CX+6?sD:((y%3===0)?sD:s));put(CX+4,y0+13,sD);put(CX+6,y0+13,sD);}
  /* paint: background, a glow behind the head, soft outline round the figure */
  const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');
  const bg=sp.bg,bgL=shade(bg,.22),bgD=shade(bg,-.1);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const d=Math.hypot(i-CX,(j-21+2)*1.05);let col=d<17?bgL:(d<19&&(i+j)%2===0?bgL:bg);if(j>40)col=bgD;if(j===40&&i%2===0)col=bgD;
    const v=F[j*N+i];if(v){col=v;}else{let nb=null;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const q=F[(j+b)*N+i+a];if(i+a>=0&&i+a<N&&j+b>=0&&j+b<N&&q){nb=q;break;}}if(nb)col=mixH(shade(nb,-.55),col,.25);}
    x.fillStyle=col;x.fillRect(i,j,1,1);}
  PORT[id]=c.toDataURL();return PORT[id];}
