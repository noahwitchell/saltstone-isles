/* ---------- character portraits ----------
   48x48 pixel art, drawn from each character's traits in CHARS (skin, hair style and color, hat, glasses, beard,
   scarf, freckles, shirt). The figure is drawn into its own layer, given a soft dark outline, then laid over a
   background with a little glow behind the head. Light comes from the upper left. Older folks (white or grey hair)
   get smile lines. */
function portrait(id){if(PORT[id])return PORT[id];
  const sp=CHARS[id].sp,N=48,F=new Array(N*N).fill(null),Z=new Array(N*N).fill(0);
  const hx=h=>{const n=parseInt(h.slice(1),16);return [n>>16,(n>>8)&255,n&255];},toH=c=>'#'+c.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
  const mixH=(a,b,t)=>{const A=hx(a),B=hx(b);return toH(A.map((v,i)=>v+(B[i]-v)*t));};
  const lum=h=>{const c=hx(h);return c[0]*.3+c[1]*.59+c[2]*.11;},sat=h=>{const c=hx(h);return Math.max(...c)-Math.min(...c);};
  let hs=0;for(const ch of id)hs=(hs*31+ch.charCodeAt(0))>>>0;
  const put=(x,y,c,z=0)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=N||y>=N)return;F[y*N+x]=c;Z[y*N+x]=z;};
  const get=(x,y)=>F[y*N+x];
  const rect=(x,y,w,h,c,z)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)put(x+i,y+j,c,z);};
  const ell=(cx,cy,rx,ry,c,fn)=>{for(let j=Math.floor(-ry);j<=ry;j++)for(let i=Math.floor(-rx);i<=rx;i++)if((i*i)/(rx*rx)+(j*j)/(ry*ry)<=1.02){const col=fn?fn(i,j,c):c;if(col)put(cx+i,cy+j,col);}};
  const tint=(x,y,c,t)=>{const o=get(x,y);if(o)F[y*N+x]=mixH(o,c,t);};
  const skin=sp.skin,hair=sp.hair,old=lum(hair)>185&&sat(hair)<40,dark=lum(skin)<120;
  const hairD=shade(hair,old?-.22:-.3),hairL=shade(hair,old?.25:.3),hairDD=shade(hair,-.5);
  const eyeC=['#5a3a22','#3a6a9a','#4a7a4a','#6a4a2a','#3a3040','#6a6a3a'][hs%6];
  const brow=old?shade(hair,-.15):(sp.style==='long'||lum(hair)>150?shade(hair,-.35):hair);
  const CX=24,CY=21;
  // face mask: rounder forehead, softer narrowing jaw
  const inFace=(x,y)=>{const dx=x-CX,dy=y-CY;return dy<=0?Math.pow(Math.abs(dx)/10.2,2.4)+Math.pow(-dy/12,2)<=1:Math.pow(Math.abs(dx)/10.2,1.8)+Math.pow(dy/11.6,2)<=1;};
  /* long hair falls behind everything */
  if(sp.style==='long'){for(let y=8;y<44;y++){const t=(y-8)/36,w=y<16?8+(y-8)*.9:Math.min(15,14.2-Math.max(0,y-36)*.6);for(let x=Math.round(CX-w);x<=Math.round(CX+w);x++){const e=Math.abs(x-CX)/w;
      let c=e>.86?hairD:(x<CX-3&&((x+y)%5===0)?hairL:hair);if(y>40)c=hairD;put(x,y,c);}}
    for(let y=14;y<42;y+=3){put(CX-11,y,hairD);put(CX+11,y+1,hairD);}}
  /* shoulders and shirt */
  for(let y=35;y<N;y++){const w=Math.min(23,11+(y-35)*1.6);for(let x=Math.ceil(CX-w);x<=Math.floor(CX+w);x++){const e=(x-CX)/w;
      let c=sp.shirt;if(e<-.55&&y<41)c=shade(sp.shirt,.12);if(e>.5)c=shade(sp.shirt,-.16);if(e>.82||y>45)c=shade(sp.shirt,-.26);
      if(sp.plaid&&((x%5===0)||(y%5===2)))c=shade(c,-.32);put(x,y,c);}}
  // shoulder seams / arm creases
  for(let y=40;y<N;y++){put(CX-15+((y-40)>>2),y,shade(sp.shirt,-.22));put(CX+15-((y-40)>>2),y,shade(sp.shirt,-.3));}
  /* neck */
  for(let y=29;y<38;y++)for(let x=CX-4;x<=CX+4;x++)put(x,y,x>CX+1?shade(skin,-.18):shade(skin,-.08));
  // collar: open neck showing a V of skin, folded collar points
  for(let k=0;k<5;k++){for(let x=CX-4+k;x<=CX+4-k;x++)put(x,36+k,x>CX+1?shade(skin,-.16):shade(skin,-.06));}
  const col=shade(sp.shirt,.28),colD=shade(sp.shirt,-.1);
  for(let k=0;k<5;k++){put(CX-5-k,35+k,col);put(CX-4-k,36+k,col);put(CX-5+k,36+k,colD);put(CX+5+k,35+k,colD);put(CX+4+k,36+k,colD);put(CX+5-k,36+k,col);}
  if(!sp.scarf){put(CX,40,shade(sp.shirt,-.35));put(CX,42,shade(sp.shirt,.2));put(CX,45,shade(sp.shirt,.2));}
  /* ears */
  for(const [ex,s] of [[CX-11,-1],[CX+11,1]]){for(let y=18;y<=24;y++)for(let i=0;i<2;i++){const x=ex+s*i,c=s>0?shade(skin,-.14):skin;if(!(i===1&&(y===18||y===24)))put(x,y,c);}
    put(ex,20,shade(skin,-.26));put(ex,21,shade(skin,-.26));put(ex+s,22,shade(skin,-.2));}
  /* face with shading */
  for(let y=CY-13;y<=CY+12;y++)for(let x=CX-11;x<=CX+11;x++){if(!inFace(x,y))continue;const dx=x-CX,dy=y-CY;let c=skin;
    if(dx>=6||(dy>=8&&dx>=2))c=shade(skin,-.12);if(dx>=9||(dy>=10))c=shade(skin,-.2);
    if(dx<=-5&&dx>=-8&&dy>=-4&&dy<=4)c=shade(skin,.07);if(dx<=-2&&dx>=-6&&dy>=-10&&dy<=-6)c=shade(skin,.09);
    put(x,y,c);}
  /* brows, eyes */
  const EY=CY;
  for(const [ex,s] of [[CX-6,-1],[CX+5,1]]){
    // whites
    rect(ex-1,EY,4,2,'#f6f2ee');
    // iris centered, darker pupil, a glint top left
    put(ex,EY,'#ffffff');put(ex+1,EY,shade(eyeC,-.15));put(ex,EY+1,eyeC);put(ex+1,EY+1,shade(eyeC,-.45));
    // upper lid line with a lash flick
    rect(ex-1,EY-1,4,1,dark?'#1c1418':'#3a2a2a');put(s<0?ex-2:ex+3,EY-1,dark?'#1c1418':'#3a2a2a');put(s<0?ex-2:ex+3,EY-2,dark?'#2a1e22':'#5a4040');
    // lower lid / under-eye
    for(let i=0;i<4;i++)tint(ex-1+i,EY+2,'#000000',.08);
    if(old){put(s<0?ex-2:ex+3,EY+1,shade(skin,-.2));for(let i=0;i<3;i++)tint(ex+i,EY+3,'#000000',.1);}
    // brow, a gentle arch
    const by=EY-4;put(ex-1,by+1,brow);put(ex,by,brow);put(ex+1,by,brow);put(ex+2,by,brow);put(s<0?ex+3:ex-2,by+1,shade(brow,.1));
    if(!old||lum(hair)<200)put(s<0?ex-1:ex+2,by,brow);}
  /* nose: shadow down the right side, a soft tip */
  for(let y=EY+1;y<=EY+5;y++)put(CX+1,y,shade(skin,-.13));put(CX,EY+5,shade(skin,.06));put(CX-1,EY+6,shade(skin,-.18));put(CX+1,EY+6,shade(skin,-.24));put(CX,EY+6,shade(skin,-.08));put(CX-1,EY+3,shade(skin,.08));
  /* cheeks */
  const blush=dark?'#c0606a':'#f07a80';for(const bx of [CX-8,CX+5])for(let i=0;i<3;i++){tint(bx+i,EY+4,blush,dark?.22:.3);tint(bx+i,EY+5,blush,dark?.14:.18);}
  if(sp.freckles)for(const [a,b] of [[-6,4],[-4,5],[-7,6],[3,4],[5,5],[6,4],[-2,3],[2,3],[4,6]])put(CX+a,EY+b,shade(skin,-.24));
  /* mouth: a friendly closed smile */
  const lip=dark?mixH(skin,'#3a1418',.55):mixH(skin,'#8a2a30',.55),MY=EY+9;
  for(let x=CX-3;x<=CX+3;x++)put(x,MY,lip);put(CX-4,MY-1,lip);put(CX+4,MY-1,lip);put(CX-5,MY-2,shade(skin,-.12));put(CX+5,MY-2,shade(skin,-.16));
  for(let x=CX-2;x<=CX+2;x++)put(x,MY+1,mixH(skin,'#c05a5a',.22));put(CX,MY+2,shade(skin,-.1));
  if(old){put(CX-5,MY-2,shade(skin,-.16));put(CX-5,MY-1,shade(skin,-.14));put(CX+5,MY-2,shade(skin,-.2));put(CX+5,MY-1,shade(skin,-.18));}
  /* facial hair */
  if(sp.beard){const b=sp.beard,bD=shade(b,-.25),bL=shade(b,.22);
    for(let y=EY+5;y<=CY+15;y++)for(let x=CX-11;x<=CX+11;x++){const dx=x-CX,dy=y-EY;if(!(inFace(x,y)||(y>CY+10&&Math.abs(dx)<9-(y-CY-10)*2)))continue;
      if(dy<8&&Math.abs(dx)<8)continue;if(Math.abs(dx)<=3&&y>=MY-1&&y<=MY+1)continue;
      let c=(x+y*3+hs)%7===0?bL:((x*5+y)%6===0?bD:b);if(dx>5)c=shade(c,-.15);put(x,y,c);}
    for(let x=CX-4;x<=CX+4;x++)put(x,MY-1,x>CX?bD:b);put(CX-5,MY,b);put(CX+5,MY,bD);
    for(let x=CX-3;x<=CX+3;x++)put(x,MY,lip);}
  if(sp.mustache&&!sp.beard){const m=sp.mustache;for(let x=CX-4;x<=CX+4;x++){put(x,MY-2,x>CX+1?shade(m,-.2):m);}for(const s of [-1,1]){put(CX+s*5,MY-1,m);put(CX+s*5,MY,shade(m,-.2));}put(CX,MY-3,shade(skin,-.1));}
  /* glasses */
  if(sp.glasses){const g='#2a2030';for(const ox of [CX-8,CX+3]){for(let i=0;i<6;i++){put(ox+i,EY-2,g);put(ox+i,EY+3,g);}for(let j=-1;j<3;j++){put(ox,EY+j,g);put(ox+5,EY+j,g);}
      for(let i=1;i<5;i++)for(let j=-1;j<3;j++)tint(ox+i,EY+j,'#cfe8ff',.18);put(ox+1,EY-1,'#ffffff');}
    put(CX-2,EY-1,g);put(CX-1,EY-1,g);put(CX+1,EY-1,g);put(CX+2,EY-1,g);put(CX,EY-1,g);put(CX-12,EY,g);put(CX+11,EY,g);}
  /* hair on top */
  const strands=(x,y)=>((x*3+y*7+hs)%9===0)?hairD:((x+y*2)%11===0&&x<CX?hairL:hair);
  if(sp.style==='short'||sp.style==='bun'||sp.style==='long'){
    for(let y=CY-15;y<=CY+3;y++)for(let x=CX-12;x<=CX+12;x++){const dx=x-CX,dy=y-CY;
      const top=Math.pow(Math.abs(dx)/11.6,2.2)+Math.pow((dy+1)/14,2)<=1&&dy<-6+Math.round(Math.abs(dx)*.12+(dx<0?Math.max(0,3-Math.abs(dx+4)):0)*.6);
      const side=Math.abs(dx)>=9&&Math.abs(dx)<=11&&dy>=-7&&dy<=(sp.style==='long'?6:-2);
      if(!(top||side))continue;let c=strands(x,y);if(dx>6)c=hairD;if(dx<-2&&dx>-8&&dy<-10)c=hairL;put(x,y,c);}
    // a part on the left, a little swoop across the forehead
    for(let k=0;k<5;k++)put(CX-4+k,CY-12+(k>>1),hairD);for(let x=CX-8;x<=CX+2;x++)put(x,CY-9+((x+CX)%3===0?1:0),strands(x,CY-9));}
  if(sp.style==='bun'){ell(CX+1,CY-16,4.6,4,hair,(i,j)=>i>1?hairD:(i<-1&&j<0?hairL:strands(i,j)));for(let i=-2;i<=2;i++)put(CX+1+i,CY-12,hairD);}
  if(sp.style==='curly'){const cur=[];for(let k=0;k<15;k++){const a=Math.PI*(-.08+k/14*1.16);cur.push([CX+Math.cos(a)*10.5,CY-5-Math.sin(a)*8.5,3.2]);}
    for(let k=0;k<6;k++){const a=Math.PI*(.2+k/5*.6);cur.push([CX+Math.cos(a)*6,CY-9-Math.sin(a)*3.5,3]);}
    for(const [x0,y0,r] of cur)ell(Math.round(x0),Math.round(y0),r,r,hair,(i,j)=>i+j>2?hairD:(i+j<-3?hairL:hair));
    for(const [x0,y0] of cur){put(Math.round(x0)-1,Math.round(y0)-1,hairL);put(Math.round(x0)+2,Math.round(y0)+1,hairDD);}}
  /* hats */
  if(sp.hat){const h=sp.hatc,hD=shade(h,-.22),hL=shade(h,.2),hDD=shade(h,-.4);
    if(sp.hat==='cap'){ell(CX,CY-11,11,6.5,h,(i,j)=>j>3?null:(i>5?hD:(i<-4&&j<-2?hL:h)));for(let x=CX-11;x<=CX+11;x++)put(x,CY-7,hD);
      for(let x=CX-4;x<=CX+15;x++){put(x,CY-6,hDD);put(x,CY-7,x>CX+11?hD:get(x,CY-7));}put(CX,CY-17,hL);for(let j=0;j<5;j++)put(CX+(j>>1),CY-16+j,hD);}
    if(sp.hat==='beanie'){ell(CX,CY-11,11.4,7.5,h,(i,j)=>j>3?null:((i+40)%3===0?hD:(i<-5?hL:h)));for(let x=CX-12;x<=CX+12;x++)for(let j=0;j<3;j++)put(x,CY-8+j,((x)%2===0)?hD:h);
      ell(CX,CY-19,2.6,2.2,shade(h,.38),(i,j)=>i>0&&j>0?shade(h,.15):shade(h,.38));}
    if(sp.hat==='ranger'){for(let x=CX-17;x<=CX+17;x++){put(x,CY-8,x>CX+8?hD:h);put(x,CY-7,hDD);}for(let x=CX-15;x<=CX+15;x++)put(x,CY-9,h);
      for(let y=CY-17;y<=CY-9;y++)for(let x=CX-9;x<=CX+9;x++){if(y===CY-17&&Math.abs(x-CX)>6)continue;let c=x>CX+4?hD:(x<CX-5?hL:h);if(y===CY-11||y===CY-10)c=shade(h,-.45);if(Math.abs(x-CX)<2&&y<CY-14)c=hD;put(x,y,c);}}
    if(sp.hat==='aviator'){ell(CX,CY-8,12,10,h,(i,j)=>j>2?null:(i>6?hD:(i<-5&&j<-4?hL:h)));for(const s of [-1,1])for(let y=CY-6;y<=CY+8;y++)for(let i=0;i<4;i++)put(CX+s*(9+i),y,s>0||i>2?hD:h);
      for(const s of [-1,1])put(CX+s*11,CY+8,hDD);for(let x=CX-12;x<=CX+12;x++)put(x,CY-10,'#4a3020');
      for(const gx of [CX-6,CX+5]){ell(gx,CY-11,3.2,2.6,'#8a8070');ell(gx,CY-11,2.2,1.6,'#9ad6e8',(i,j)=>i<0&&j<0?'#e8faff':'#9ad6e8');}}}
  /* scarf */
  if(sp.scarf){const s=sp.scarf,sD=shade(s,-.22),sL=shade(s,.18);for(let y=33;y<=37;y++)for(let x=CX-9+(y-33);x<=CX+9-(y-33)*.5;x++)put(x,y,(x+y)%4===0?sD:(x<CX-4?sL:s));
    for(let y=37;y<=45;y++)for(let x=CX+3;x<=CX+6;x++)put(x+((y-37)>>2),y,x===CX+6?sD:((y%3===0)?sD:s));put(CX+4,46,sD);put(CX+6,46,sD);}
  /* paint: background, a glow behind the head, soft outline round the figure */
  const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');
  const bg=sp.bg,bgL=shade(bg,.22),bgD=shade(bg,-.1);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const d=Math.hypot(i-CX,(j-CY+2)*1.05);let col=d<17?bgL:(d<19&&(i+j)%2===0?bgL:bg);if(j>40)col=bgD;if(j===40&&i%2===0)col=bgD;
    const v=F[j*N+i];if(v){col=v;}else{let nb=null;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const q=F[(j+b)*N+i+a];if(i+a>=0&&i+a<N&&j+b>=0&&j+b<N&&q){nb=q;break;}}if(nb)col=mixH(shade(nb,-.55),col,.25);}
    x.fillStyle=col;x.fillRect(i,j,1,1);}
  PORT[id]=c.toDataURL();return PORT[id];}
