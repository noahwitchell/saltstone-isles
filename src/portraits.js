/* ---------- portrait wallpapers ----------
   Each character's background is a little wallpaper for who they are and where they live. Patterns are kept soft
   (close to the background color) so the face stays the star. wallpaper(id,...) returns (i,j)=>color or null. */
function wallpaper(id,bg,hs,mixH){const L=shade(bg,.14),LL=shade(bg,.26),D=shade(bg,-.1),DD=shade(bg,-.2),A=(c,t=.35)=>mixH(bg,c,t);
  const rnd=(i,j)=>{let h=(i*374761393+j*668265263+hs*1442695)>>>0;h=Math.imul(h^(h>>>13),1274126177)>>>0;return ((h^(h>>>16))>>>0)/4294967296;};
  const M=(a,b)=>((a%b)+b)%b;
  const P={
    // post office: the wall of little brass-fronted PO boxes behind the counter, a letter poking out here and there
    mabel:(i,j)=>{const W='#8a5a34',u=M(i,8),v=M(j,7),bx=Math.floor(i/8),by=Math.floor(j/7);if(u===0||v===0)return A(W,.75);if(u===1||v===1)return A(W,.5);
      const brass=A('#c8a050',.55),glass=A('#3a3040',.35);if(v>=2&&v<=3&&u>=3&&u<=6)return (rnd(bx,by)<.3&&v===2)?'#f6f0e2':glass;if(v===5&&u===6)return A('#3a3030',.6);if(v===5&&u===3)return A('#e8d8b0',.6);return u===7||v===6?A('#a07a30',.55):brass;},
    // retired pilot: puffy clouds drifting across the sky
    bea:(i,j)=>{for(const [cx,cy,r] of [[8,8,5],[13,7,4],[34,20,6],[40,18,4],[18,40,5],[24,38,4],[46,42,4],[2,30,4]]){const d=Math.hypot(i-cx,(j-cy)*1.5);if(d<r)return d>r-1.2?L:LL;}return null;},
    // mechanic: pegboard with a wrench and a screwdriver hung on it
    gus:(i,j)=>{if(M(i,4)===2&&M(j,4)===2)return DD;const w=(x,y)=>{const a=(i-x)+(j-y);const b=(i-x)-(j-y);return Math.abs(b)<=1&&a>-12&&a<12||(Math.hypot(i-x-4,j-y-4)<2.6&&Math.hypot(i-x-5,j-y-5)>1.4);};if(w(6,6)||w(38,36))return A('#8a8a92',.6);
      if(i>=40&&i<=41&&j>=4&&j<=14)return A('#c2453a',.55);if(i===40&&j>14&&j<22)return A('#9a96a2',.6);return null;},
    // lighthouse keeper: the beam sweeping out from the top corner
    tomas:(i,j)=>{const a=Math.atan2(j+4,i+6);return Math.floor(a*18)%3===0?L:(Math.floor(a*18)%3===1&&(i+j)%2?shade(bg,.07):null);},
    // shepherd: a flock of little sheep on the green
    nell:(i,j)=>{const u=M(i+(Math.floor(j/11)%2)*7,14),v=M(j,11);if(v>=3&&v<=5&&u>=3&&u<=7)return u===7&&v===4?DD:'#f6f2ea';if(v===6&&(u===4||u===6))return DD;if(v===2&&(u===4||u===6))return '#f6f2ea';if(u===8&&v===4)return '#3a3434';return (i*3+j*7)%13===0?D:null;},
    // forest ranger: rows of pines
    ada:(i,j)=>{const u=M(i+(Math.floor(j/12)%2)*5,10),v=M(j,12);const half=Math.floor(v/2.2);if(v<9&&Math.abs(u-5)<=half)return (u>5?DD:D);if(v>=9&&v<11&&u===5)return A('#6a4a30',.5);return null;},
    // logging crew: wood planks with grain
    hank:(i,j)=>{const u=M(i,8);if(u===0)return DD;const g=Math.sin(j*.35+Math.floor(i/8)*2.1+u*.6)+Math.sin(j*.11+i);if(g>1.3)return D;if(rnd(Math.floor(i/8),Math.floor(j/16))<.2&&Math.hypot(u-4,M(j,16)-8)<1.6)return DD;return null;},
    // strip crew kid on the beach: sun-bleached waves and shells
    ollie:(i,j)=>{const w=M(j+Math.round(Math.sin(i*.45)*1.5),8);if(w===0)return LL;if(w===1)return L;if(rnd(i,j)<.012)return A('#e8a0a0',.6);return null;},
    // beach bar: big tropical leaves
    rosa:(i,j)=>{for(const [cx,cy,ang] of [[6,10,.6],[38,8,-.5],[10,38,-.8],[42,38,.9],[24,46,0]]){const c=Math.cos(ang),s=Math.sin(ang),u=(i-cx)*c+(j-cy)*s,v=-(i-cx)*s+(j-cy)*c;
      if(Math.abs(v)<3.4*(1-Math.abs(u)/9)&&Math.abs(u)<9)return Math.abs(v)<.6?A('#2f6a3a',.3):(Math.round(u)%3===0&&Math.abs(v)>1.5?null:A('#3f8f4a',.45));}return null;},
    // volcanologist: layered rock with glowing cracks
    ines:(i,j)=>{const b=j+Math.round(Math.sin(i*.2)*2+Math.sin(i*.07)*3),k=Math.floor(b/6);if(M(b,6)===0)return DD;if(rnd(i,j)<.02)return A('#ff7a3a',.6);return k%2?D:null;},
    // observatory cook: kitchen tiles
    otto:(i,j)=>{const u=M(i,8),v=M(j,8);if(u===0||v===0)return LL;return (Math.floor(i/8)+Math.floor(j/8))%2?D:null;},
    // Farhold field keeper: fog bands and a row of runway lights
    fen:(i,j)=>{if(j===34&&M(i,6)===2)return '#ffd36b';if((j===33||j===35)&&M(i,6)===2)return A('#ffd36b',.4);const f=Math.sin(j*.4+Math.sin(i*.1)*1.5);return f>.6&&(i+j)%2?L:(f>.85?L:null);},
    // the house with the lamp: old floral wallpaper
    ivy:(i,j)=>{const u=M(i+(Math.floor(j/10)%2)*5,10),v=M(j,10);if(Math.abs(u-5)+Math.abs(v-5)===1)return A('#c2456a',.4);if(u===5&&v===5)return A('#f1c84a',.5);if(u===0&&M(j,3)===0)return A('#4a7a4a',.3);return null;},
    // climber: mountain peaks with snow caps
    wren:(i,j)=>{for(const [cx,base,hgt] of [[8,20,12],[24,18,14],[40,22,12],[0,44,10],[16,46,14],[34,46,12],[48,44,11]]){const top=base-hgt,dx=Math.abs(i-cx);if(j>=top+dx&&j<=base)return j<top+4+dx*.2?LL:(i>cx?D:L);}return null;},
    // goatherd: rolling hills dotted with goats
    tam:(i,j)=>{const hills=[[16,3,.13,0,A('#9ab86a',.45)],[28,4,.09,2,A('#7a9a52',.55)],[40,3,.11,4,A('#5f7f42',.6)]];let col=null,hb=null;
      for(const H of hills){const h=H[0]+Math.sin(i*H[2]+H[3])*H[1];if(j>=h){col=Math.abs(j-h)<1?shade(H[4],.12):H[4];hb=H;}}
      for(const [gx,hi] of [[5,0],[41,0],[8,1],[38,1],[3,2],[44,2]]){const H=hills[hi],gy=Math.round(H[0]+Math.sin(gx*H[2]+H[3])*H[1])-1,u=i-gx,v=j-gy;
        if(v>=-2&&v<=0&&u>=0&&u<=3)return v===-2&&u===3?'#3a3030':(hi%2?'#f6f2ea':'#8a5a3a');if(v===1&&(u===0||u===3))return '#3a3030';if(v===-3&&u===3)return '#d8d0c0';}
      return col;},
    // orchard keeper: apples with little leaves
    hattie:(i,j)=>{const u=M(i+(Math.floor(j/10)%2)*5,10),v=M(j,10);if(Math.hypot(u-5,v-5.5)<2)return u<5&&v<5?A('#ff8a7a',.55):A('#d2493c',.55);if(u===5&&v===3)return A('#6a4a30',.6);if(u===6&&v===2)return A('#4a8a3a',.6);return null;},
    // salt raker: the grid of salt pans
    desmond:(i,j)=>{const u=M(i,9),v=M(j,9);if(u===0||v===0)return D;return rnd(Math.floor(i/9),Math.floor(j/9))<.5?LL:L;},
    // painter: paint splatters
    lio:(i,j)=>{const cols=['#e2703f','#3f8fc0','#f1c84a','#c2456a','#5fbf5a','#8a6ac0'];for(let k=0;k<11;k++){const cx=rnd(k,1)*48,cy=rnd(k,2)*48,r=1.2+rnd(k,3)*2.6;const d=Math.hypot(i-cx,j-cy);
      if(d<r||(d<r+2.4&&rnd(i,j)<.18))return A(cols[k%cols.length],.5);}return null;},
    // radio astronomer: stars and radio waves
    odile:(i,j)=>{const d=Math.hypot(i-46,j-2);if(M(Math.round(d),6)===0&&d>4)return L;if(rnd(i,j)<.03)return rnd(j,i)<.3?'#fff8ec':LL;return null;},
    // hut warden by the waterfall: falling streaks and ferns
    kit:(i,j)=>{const col=Math.floor(i/2),s=M(j+Math.floor(rnd(col,0)*30),7);if(s<4&&rnd(col,1)<.7)return s===0?'#f6faf8':(s<2?LL:L);if(rnd(i,j)<.05)return D;return null;},
    // lantern maker: strings of paper lanterns
    lu:(i,j)=>{const v=M(j,16),row=Math.floor(j/16),sag=Math.round(Math.sin(i/48*Math.PI)*2);if(v===1+sag)return D;const u=M(i+row*6,12);
      if(v>=3+sag&&v<=8+sag&&u>=4&&u<=8){const lv=v-3-sag;if(lv===0||lv===5)return A('#3a3030',.5);return (u===4||u===8)?A('#c2453a',.55):A(['#e8473a','#f0a33a','#e8473a'][row%3],.6);}
      if(v>=2+sag&&v<=9+sag&&u>=2&&u<=10&&(i+j)%2)return A('#ffd36b',.2);return null;},
    // quarryman: cut stone blocks
    bram:(i,j)=>{const row=Math.floor(j/6),u=M(i+(row%2)*6,12);if(M(j,6)===0||u===0)return DD;if(M(j,6)===1)return L;return rnd(Math.floor((i+(row%2)*6)/12),row)<.4?D:null;},
    // miller: stalks of wheat
    agnes:(i,j)=>{const u=M(i+(Math.floor(j/16)%2)*4,8),v=M(j,16);if(u===4&&v>5)return A('#b08a3a',.45);if(v<=6&&(u===3||u===5)&&v%2===(u===3?0:1))return A('#d8a83a',.55);if(u===4&&v<=6)return A('#d8a83a',.5);return null;},
  };
  return P[id]||(()=>null);}
/* ---------- character portraits ----------
   48x48 pixel art. Each character has their own face in FACES: head shape (width, forehead, chin, how square or
   pointed the jaw is), eye shape and spacing, brows, nose, mouth, age lines, ears, neck and shoulders. Clothes, hair,
   hats, glasses and beards come from CHARS. Hair and hats are drawn for a standard head, then stretched to fit the
   real one, so a cap sits right on a wide head or a narrow one. The figure gets a soft dark outline over a background
   with a glow behind the head. Light comes from the upper left. */
const FACES={
  mabel:{outfit:'postal',shirt:'#2f3f6a',w:10.6,top:12,bot:10.5,jaw:2.2,cheek:1.06,eye:'small',sep:4,brow:{a:-.6},nose:'button',nl:5,mouth:'smile',mw:3,age:2,chub:1,blush:1.3},
  bea:{under:'wisps',w:9.4,top:12.5,bot:12.4,jaw:2.6,eye:'narrow',tilt:-1,sep:4,brow:{t:2,a:.4},nose:'long',nl:6,mouth:'smirk',mw:3,age:3,bones:1},
  gus:{outfit:'coveralls',shirt:'#4a5e7a',fh:'boxed',under:'none',w:12,top:10.8,bot:11,jaw:2.2,cheek:1.14,sep:5,age:0,sh:1.2,nk:6,ears:1.3,chub:1},
  tomas:{fh:'walrus',w:9.6,top:12.8,bot:12.6,jaw:2.4,eye:'heavy',sep:4,brow:{t:2,a:-.3},nose:'hook',nl:6,mouth:'flat',mw:3,age:1,bones:1},
  nell:{hair:'braids',w:9.8,top:12.4,bot:10.6,jaw:1.45,eye:'big',sep:4,tilt:1,brow:{a:-.5,y:-5},nose:'button',nl:4,mouth:'laugh',mw:3,blush:1.4},
  ada:{under:'curls',w:9.4,top:12.8,bot:11.8,jaw:1.35,sep:4,bones:1,earring:'#f1c84a'},
  hank:{fh:'bushy',under:'shaggy',w:10,top:13.2,bot:13,jaw:3.2,cheek:1,sep:4,sh:1.22,nk:6,ears:1.05},
  ollie:{under:'curls',w:10.2,top:11.6,bot:11.2,jaw:2.1,cheek:1.04,eye:'open',sep:4,brow:{y:-4},nose:'button',nl:4,mouth:'laugh',mw:3,my:8,sh:.86,nk:3,ears:1.15,blush:1.4,dimple:1},
  rosa:{hair:'wavy',w:10.4,top:11.8,bot:11,jaw:2,cheek:1.05,eye:'happy',sep:4,brow:{a:-.4,y:-5},nose:'wide',nl:5,mouth:'laugh',mw:4,blush:1.3},
  ines:{hair:'pony',w:9,top:13,bot:12,jaw:1.6,eye:'almond',sep:4,brow:{raise:1,a:.2},nose:'pointed',nl:6,mouth:'pursed',age:1,bones:1},
  otto:{hat:null,hair:'bald',fh:'fluffy',w:11.4,top:11.2,bot:11.2,jaw:2.2,cheek:1.1,eye:'happy',sep:5,brow:{a:-.6},nose:'button',nl:4,mouth:'grin',mw:4,chub:1,age:1,blush:1.6,sh:1.12,nk:5},
  fen:{hat:'flat',fh:'pencil',w:9,top:13,bot:12.8,jaw:2.3,eye:'heavy',tilt:-1,sep:4,brow:{a:-.7},nose:'long',nl:7,mouth:'flat',mw:2,age:1,ears:1.2},
  ivy:{w:9.4,top:12.6,bot:11.2,jaw:1.6,eye:'happy',sep:4,brow:{a:-.5,y:-5},nose:'pointed',nl:5,mouth:'small',age:3,blush:1.2},
  wren:{under:'locs',w:10.2,top:11.2,bot:11.4,jaw:2.8,cheek:1.02,sep:5},
  tam:{hat:null,hair:'tousled',fh:'goatee',w:9,top:12.6,bot:13.4,jaw:2.6,cheek:.95,sep:3,age:1,ears:1.35,bones:1,blush:1.9},
  hattie:{hair:'sidebraid',w:10.8,top:11.4,bot:10.4,jaw:2.2,cheek:1.1,sep:4,age:1,blush:1.5,dimple:1},
  desmond:{hat:'straw',fh:'trim',w:10.4,top:13,bot:12,jaw:2,cheek:1.02,sep:4,age:3,ears:1.2},
  lio:{hair:'bob',w:9.2,top:12.2,bot:11.4,jaw:1.5,eye:'heavy',sep:4,tilt:1,brow:{a:-.2},nose:'pointed',nl:5,mouth:'small',mole:[-6,6]},
  odile:{hair:'topknot',w:9.2,top:13.2,bot:12,jaw:1.8,eye:'almond',sep:4,brow:{raise:1,a:.4},nose:'long',nl:6,mouth:'pursed',age:2,bones:1},
  kit:{hat:null,hair:'side',w:10.2,top:11.6,bot:10.8,jaw:2,eye:'open',sep:5,brow:{a:-.2},nose:'button',nl:4,mouth:'grin',mw:3,dimple:1,ears:1.1},
  lu:{hair:'perm',w:10.8,top:11.6,bot:10.8,jaw:2.1,cheek:1.06,eye:'happy',sep:4,brow:{a:-.5,y:-5},nose:'wide',nl:5,mouth:'laugh',mw:3,age:3,chub:1,blush:1.4},
  bram:{hat:null,hair:'crop',fh:'handlebar',w:11.4,top:11.2,bot:12,jaw:3.8,eye:'small',sep:5,brow:{t:2,a:.25,y:-4},nose:'broad',nl:5,mouth:'flat',mw:3,sh:1.18,nk:6,dimple:1},
  agnes:{hair:'chignon',w:9.6,top:12.4,bot:11,jaw:1.5,eye:'small',sep:4,brow:{a:.1},nose:'hook',nl:6,mouth:'small',age:2,bones:1},
};
/* Each character's own eyes, brows, nose and mouth. No two unrelated people share a set: the checker in the test
   harness fails if any eye, brow, nose or mouth spec repeats. (Nobody on the islands is related to anyone else with a
   portrait yet; relatives could share a feature or two.)
   eye: w width 3-5, h height 1-3, lid thin|thick|lash|hood|wing|crease, tilt -1/0/1, low lower lid, closed arc|line
   brow: t thickness 1-3, len, arch 0-2, a slant, raise (one brow up), y
   nose: k kind, l length.  mouth: k kind, w half width */
const FEAT={
  mabel:{eye:{w:3,h:1,lid:'thin'},brow:{t:1,len:4,arch:1},nose:{k:'button',l:4},mouth:{k:'smile',w:3}},
  bea:{eye:{w:4,h:1,lid:'thick',tilt:-1,low:1},brow:{t:2,len:5,a:.4},nose:{k:'long',l:6},mouth:{k:'smirk',w:3}},
  gus:{eye:{w:4,h:2,lid:'thick',low:1},brow:{t:3,len:5,arch:0},nose:{k:'broad',l:4},mouth:{k:'grin',w:4}},
  tomas:{eye:{w:4,h:2,lid:'hood',tilt:-1},brow:{t:2,len:6,arch:0,y:-5},nose:{k:'hook',l:6},mouth:{k:'flat',w:3}},
  nell:{eye:{w:4,h:3,lid:'lash',tilt:1},brow:{t:1,len:5,arch:2,y:-5},nose:{k:'upturned',l:4},mouth:{k:'soft',w:3}},
  ada:{eye:{w:5,h:2,lid:'wing',tilt:1},brow:{t:2,len:6,arch:1,a:.3},nose:{k:'straight',l:5},mouth:{k:'soft',w:4}},
  hank:{eye:{w:3,h:1,lid:'hood'},brow:{t:3,len:6,arch:1,a:0},nose:{k:'round',l:7},mouth:{k:'smile',w:4}},
  ollie:{eye:{w:4,h:2,lid:'lash'},brow:{t:1,len:4,arch:1,y:-5},nose:{k:'snub',l:3},mouth:{k:'gap',w:3}},
  rosa:{eye:{w:4,h:1,closed:'arc'},brow:{t:2,len:5,arch:2,y:-6},nose:{k:'wide',l:5},mouth:{k:'laugh',w:4}},
  ines:{eye:{w:4,h:1,lid:'crease',tilt:1},brow:{t:1,len:5,raise:1,a:.2},nose:{k:'pointed',l:6},mouth:{k:'pursed',w:1}},
  otto:{eye:{w:3,h:1,closed:'line'},brow:{t:2,len:4,arch:2,y:-5},nose:{k:'bulb',l:4},mouth:{k:'wide',w:3}},
  fen:{eye:{w:3,h:2,lid:'crease',tilt:-1},brow:{t:1,len:6,arch:0,y:-4},nose:{k:'roman',l:7},mouth:{k:'small',w:1}},
  ivy:{eye:{w:3,h:1,lid:'lash',low:1},brow:{t:1,len:4,arch:2,y:-5},nose:{k:'dainty',l:4},mouth:{k:'tongue',w:2}},
  wren:{eye:{w:4,h:3,lid:'hood'},brow:{t:2,len:5,arch:0,y:-5},nose:{k:'flared',l:5},mouth:{k:'lopsided',w:3}},
  tam:{eye:{w:4,h:1,lid:'thick'},brow:{t:1,len:6,arch:1},nose:{k:'roman',l:6},mouth:{k:'content',w:3}},
  hattie:{eye:{w:3,h:2,lid:'lash',tilt:1},brow:{t:2,len:5,arch:1,a:.1,y:-5},nose:{k:'button',l:3},mouth:{k:'cheer',w:3}},
  desmond:{eye:{w:4,h:1,lid:'hood',low:1},brow:{t:3,len:5,arch:1},nose:{k:'flared',l:7},mouth:{k:'beam',w:3}},
  lio:{eye:{w:4,h:2,lid:'wing'},brow:{t:1,len:4,arch:0,a:.1},nose:{k:'straight',l:6},mouth:{k:'small',w:2}},
  odile:{eye:{w:5,h:1,lid:'crease'},brow:{t:1,len:6,raise:1,a:.3},nose:{k:'long',l:7},mouth:{k:'pursed',w:2}},
  kit:{eye:{w:5,h:3,lid:'thin'},brow:{t:2,len:4,arch:1},nose:{k:'button',l:5},mouth:{k:'grin',w:3}},
  lu:{eye:{w:3,h:2,lid:'hood'},brow:{t:1,len:5,arch:2,y:-6},nose:{k:'round',l:4},mouth:{k:'cheer',w:4}},
  bram:{eye:{w:3,h:1,lid:'thick'},brow:{t:3,len:6,arch:0,a:.25},nose:{k:'crooked',l:6},mouth:{k:'flat',w:4}},
  agnes:{eye:{w:4,h:2,lid:'crease',low:1},brow:{t:1,len:5,arch:1,a:.15},nose:{k:'hook',l:5},mouth:{k:'smile',w:2}},
};
function portrait(id){if(PORT[id])return PORT[id];
  const sp=CHARS[id].sp,fc=Object.assign({w:10.2,top:12,bot:11.5,jaw:1.8,cheek:1,eye:'open',sep:4,tilt:0,brow:{},nose:'button',nl:5,mouth:'smile',mw:3,my:9,ey:0,age:0,ears:1,sh:1,nk:4,blush:1},FACES[id]||{});
  const FT=FEAT[id]||{eye:{w:4,h:2,lid:'thin'},brow:{t:1,len:5,arch:1},nose:{k:'button',l:5},mouth:{k:'smile',w:3}};fc.mw=FT.mouth.w;fc.nl=FT.nose.l;const EYE=FT.eye;
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
    if(HS==='tousled'){fillCap(11.8,14.2,dx=>-6+((dx+40+hs)%3===0?1:0),hcol);for(let x=CX-11;x<=CX+11;x++){let ty=C0-16;while(ty<C0&&!get(x,ty))ty++;const sp_=((x*7+hs)%4);for(let k=1;k<=sp_;k++)put(x+((x+k)%2?0:(x<CX?-1:1)),ty-k,k===sp_?hairD:hair);}
      for(const s of [-1,1])for(let y=C0-7;y<=C0-1;y++)for(let a=9;a<=12;a++){if(a===12&&(y+hs)%2)continue;put(CX+s*a,y,s>0?hairD:hair);}for(const x of [CX-6,CX-3,CX+1,CX+4])put(x,C0-5,hair);}
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
    if(HT==='straw'){const band='#3f6f8f';for(let y=C0-9;y<=C0-7;y++)for(let x=CX-18+(y===C0-9?1:0);x<=CX+18-(y===C0-9?1:0);x++)put(x,y,y===C0-7?hDD:((x+y)%2?hD:h));
      for(let y=C0-17;y<=C0-10;y++){const w=y<C0-15?7:9;for(let x=CX-w;x<=CX+w;x++){let c=(x*2+y)%3===0?hD:(x<CX-4?hL:h);if(x>CX+5)c=hD;if(y>=C0-12)c=y===C0-12?shade(band,.15):band;put(x,y,c);}}}
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
  const SHIRT=fc.shirt||sp.shirt;const SH=fc.sh;for(let y=CY+14;y<N;y++){const w=Math.min(23*SH,(11+(y-CY-14)*1.6)*SH);for(let x=Math.ceil(CX-w);x<=Math.floor(CX+w);x++){const e=(x-CX)/w;
      let c=SHIRT;if(e<-.55&&y<CY+20)c=shade(SHIRT,.12);if(e>.5)c=shade(SHIRT,-.16);if(e>.82||y>45)c=shade(SHIRT,-.26);
      if(sp.plaid&&((x%5===0)||(y%5===2)))c=shade(c,-.32);put(x,y,c);}}
  for(let y=CY+19;y<N;y++){put(CX-Math.round(15*SH)+((y-CY-19)>>2),y,shade(SHIRT,-.22));put(CX+Math.round(15*SH)-((y-CY-19)>>2),y,shade(SHIRT,-.3));}
  /* neck, collar */
  const NK=fc.nk,NY=CY+fc.bot-3;
  for(let y=NY;y<CY+17;y++)for(let x=CX-NK;x<=CX+NK;x++)put(x,y,x>CX+NK-3?sk(-.18):sk(-.08));
  for(let k=0;k<5;k++){for(let x=CX-NK+k;x<=CX+NK-k;x++)put(x,CY+15+k,x>CX+1?sk(-.16):sk(-.06));}
  const col=shade(SHIRT,.28),colD=shade(SHIRT,-.1),cy0=CY+14;
  for(let k=0;k<5;k++){put(CX-NK-1-k,cy0+k,col);put(CX-NK-k,cy0+1+k,col);put(CX-NK-1+k,cy0+1+k,colD);put(CX+NK+1+k,cy0+k,colD);put(CX+NK+k,cy0+1+k,colD);put(CX+NK+1-k,cy0+1+k,col);}
  if(fc.outfit==='coveralls'){/* mechanic's coveralls: pointed collar, zip down the front, a name patch, a pen in the pocket, oil stains */
    const cv=SHIRT,cvL=shade(cv,.22),cvD=shade(cv,-.2),oil='#2a2228',oilL='#4a3e44';
    for(let k=0;k<5;k++){for(let x=CX-NK+k;x<=CX+NK-k;x++)put(x,cy0+k,x>CX+1?sk(-.16):sk(-.06));}
    for(let k=0;k<5;k++){put(CX-NK-1-k,cy0+k,cvL);put(CX-NK-k,cy0+1+k,cvL);put(CX-NK+k-1,cy0+2+k,cvL);put(CX+NK+1+k,cy0+k,cv);put(CX+NK+k,cy0+1+k,cv);put(CX+NK-k+1,cy0+2+k,cv);}
    for(let y=cy0+5;y<N;y++)put(CX,y,y%2?'#b8bcc4':'#8a8e98');put(CX,cy0+5,'#d8dce4');
    for(let x=CX-10;x<=CX-4;x++)for(let y=cy0+7;y<=cy0+10;y++){const edge=x===CX-10||x===CX-4||y===cy0+7||y===cy0+10;put(x,y,edge?'#d8d2c6':'#f4f0e8');}
    for(let x=CX-9;x<=CX-5;x++)put(x,cy0+8,'#c2453a');put(CX-9,cy0+9,'#c2453a');
    for(let x=CX+4;x<=CX+9;x++)put(x,cy0+7,cvD);put(CX+6,cy0+5,'#e8e4dc');put(CX+6,cy0+6,'#c2453a');put(CX+7,cy0+6,'#e8e4dc');
    for(const [ox,oy,r] of [[CX+11,cy0+11,2.2],[CX-14,cy0+13,1.6],[CX+5,cy0+15,1.4],[CX-3,cy0+12,1],[CX+15,cy0+6,1.2]])
      for(let y=Math.floor(oy-r);y<=oy+r;y++)for(let x=Math.floor(ox-r);x<=ox+r;x++){const d=Math.hypot(x-ox,(y-oy)*1.2);if(d<r&&get(x,y))put(x,y,d<r*.5?oil:mixH(cv,oil,.55));else if(d<r+1&&(x+y+hs)%3===0&&get(x,y))put(x,y,mixH(cv,oilL,.35));}
}
  else   if(fc.outfit==='postal'){/* postmaster's jacket: white shirt collar and a navy tie in the V, wide lapels, brass buttons, a post badge */
    const wc='#f4f0e8',wcD='#d8d2c6',lap=shade(SHIRT,.16),lapD=shade(SHIRT,-.18),tie='#c2453a';
    for(let k=0;k<6;k++){for(let x=CX-NK+k;x<=CX+NK-k;x++)put(x,cy0+k,x<CX?wc:wcD);}
    for(let k=0;k<3;k++){put(CX-1-k,cy0+k,wc);put(CX+1+k,cy0+k,wcD);}
    for(let y=cy0+1;y<cy0+9;y++){const w=y<cy0+3?0:1;for(let x=CX-w;x<=CX+w;x++)put(x,y,y===cy0+1?shade(tie,.15):tie);}
    for(let k=0;k<7;k++){put(CX-NK-1-k+(k>>1),cy0+2+k,lap);put(CX-NK-2-k+(k>>1),cy0+2+k,lap);put(CX+NK+1+k-(k>>1),cy0+2+k,lapD);put(CX+NK+2+k-(k>>1),cy0+2+k,lapD);}
    for(const y of [cy0+10,cy0+13])put(CX+2,y,'#e8c060');
    put(CX-8,cy0+8,'#e8c060');put(CX-7,cy0+8,'#c2453a');put(CX-8,cy0+9,'#c2453a');put(CX-7,cy0+9,'#e8c060');}
  else if(!sp.scarf){put(CX,CY+19,shade(SHIRT,-.35));put(CX,CY+21,shade(SHIRT,.2));put(CX,CY+24,shade(SHIRT,.2));}
  if(fc.age>=3){put(CX-2,NY+3,sk(-.2));put(CX-1,NY+4,sk(-.2));put(CX+2,NY+3,sk(-.26));}
  /* ears */
  const EY=CY+fc.ey,erh=Math.round(3*fc.ears);
  for(const s of [-1,1]){const ex=CX+s*(faceHW(EY+1)+1);for(let y=EY-erh+1;y<=EY+erh+1;y++)for(let i=0;i<(fc.ears>1.15?3:2);i++){const x=ex+s*i,c=s>0?sk(-.14):skin;if(!(i>0&&(y===EY-erh+1||y===EY+erh+1)))put(x,y,c);}
    put(ex,EY,sk(-.26));put(ex,EY+1,sk(-.26));put(ex+s,EY+2,sk(-.2));if(fc.earring){put(ex,EY+erh+2,fc.earring);put(ex,EY+erh+3,shade(fc.earring,-.25));}}
  /* face with shading */
  for(let y=CY-14;y<=CY+14;y++)for(let x=CX-14;x<=CX+14;x++){if(!inFace(x,y))continue;const dx=x-CX,dy=y-CY,hw=faceHW(y);let c=skin;
    if(dx>=hw-4||(dy>=fc.bot-4&&dx>=2))c=sk(-.12);if(dx>=hw-1||(dy>=fc.bot-1.5))c=sk(-.2);
    if(dx<=-hw+2&&dx>=-hw+5-3&&dy>=-4&&dy<=4)c=sk(.07);if(dx<=-2&&dx>=-6&&dy>=-fc.top+2&&dy<=-6)c=sk(.09);
    put(x,y,c);}
  if(fc.chub){const by=CY+Math.round(fc.bot);for(let x=CX-5;x<=CX+5;x++){put(x,by+1,x>CX+2?sk(-.24):sk(-.12));}for(let x=CX-4;x<=CX+4;x++)put(x,by,sk(-.04));}
  if(fc.bones)for(const s of [-1,1]){const hw=faceHW(EY+4);put(CX+s*(hw-2),EY+4,sk(-.12));put(CX+s*(hw-3),EY+5,sk(-.12));put(CX+s*(hw-3),EY+6,sk(-.08));}
  /* eyes and brows */
  const ew=EYE.w,eh=EYE.h,iw=ew===5?3:(ew===4?2:1),Ei=shade(eyeC,-.3),EYX=s=>s<0?CX-fc.sep-ew:CX+fc.sep;
  for(const s of [-1,1]){const x0=EYX(s),outer=s<0?x0:x0+ew-1,ic=x0+((ew-iw)>>1),tl=EYE.tilt||0;
    if(EYE.closed==='arc'){put(x0,EY+1,lidC);for(let i=1;i<ew-1;i++)put(x0+i,EY,lidC);put(x0+ew-1,EY+1,lidC);put(outer+s,EY+2,shade(lidC,.4));}
    else if(EYE.closed==='line'){put(x0,EY,lidC);for(let i=1;i<ew-1;i++)put(x0+i,EY+1,lidC);put(x0+ew-1,EY,lidC);put(outer+s,EY-1,shade(lidC,.4));}
    else{rect(x0,EY,ew,eh,'#f6f2ee');
      for(let r=0;r<eh;r++)for(let k=0;k<iw;k++)put(ic+k,EY+r,r===2?eyeC:Ei);
      // solid pupils; a glint only where the iris is big enough (3x3) to keep a full pupil around it
      if(iw===1)for(let r=0;r<eh;r++)put(ic,EY+r,'#1c1620');
      else{for(let r=0;r<eh;r++)for(let k=0;k<iw;k++)put(ic+k,EY+r,r===0&&eh>1?shade(eyeC,-.15):shade(eyeC,-.42));if(iw===3&&eh===3)put(ic,EY,'#ffffff');}
      const lid=EYE.lid||'thin';
      if(lid==='hood')rect(x0,EY-2,ew,1,sk(-.15));
      if(lid==='crease')for(let i=1;i<ew-1;i++)put(x0+i,EY-3,sk(-.13));
      rect(x0,EY-1,ew,1,lidC);
      if(lid==='thick'){put(outer+s,EY-1,lidC);put(outer,EY,lidC);for(let i=0;i<ew;i++)tint(x0+i,EY-2,'#000000',.12);}
      if(lid==='lash'){put(outer+s,EY-1,lidC);put(outer+s,EY-2,lidC);put(outer,EY-2,lidC);}
      if(lid==='wing'){put(outer+s,EY-1,lidC);put(outer+2*s,EY-2,lidC);}
      if(tl>0)put(outer+s,EY-2,lidC);if(tl<0){put(outer,EY,lidC);put(outer+s,EY,lidC);}
      if(EYE.low)for(let i=0;i<ew;i++)tint(x0+i,EY+eh,'#000000',.15);}
    if(fc.age>=2){put(outer+2*s,EY,sk(-.18));put(outer+2*s,EY+2,sk(-.16));}
    if(fc.age>=3)for(let i=0;i<ew-1;i++)tint(x0+(s<0?1:0)+i,EY+eh+1,'#000000',.12);
    // brow
    const B=FT.brow,len=B.len||5,bx0=x0+((ew-len)>>1)-(s<0?0:0),by=EY+(B.y??-4)-(B.raise&&s>0?1:0),a=B.a||0,ar=B.arch??1;
    for(let i=0;i<len;i++){const t=i/(len-1),inner=s<0?t:1-t,end=(i===0||i===len-1);
      let y=by+Math.round(a*(inner-.5)*2.2);if(ar>=1&&end)y+=1;if(ar>=2&&!end&&Math.abs(t-.5)<.3)y-=1;if(B.raise&&s>0&&!end)y-=1;
      const x=bx0+i;if(end&&inner>.9&&B.t===1){put(x,y,shade(brow,.15));continue;}put(x,y,brow);
      if(B.t>=2&&!end)put(x,y+1,shade(brow,.12));if(B.t>=3){put(x,y+1,brow);if((i+hs)%2===0)put(x,y-1,shade(brow,.1));}}}
  /* nose */
  const NB=EY+1,NT=EY+fc.nl;
  switch(FT.nose.k){
    case 'long':for(let y=NB;y<=NT;y++)put(CX+1,y,sk(-.13));put(CX,NT,sk(.07));put(CX-1,NT+1,sk(-.2));put(CX+1,NT+1,sk(-.26));put(CX,NT+1,sk(-.08));put(CX-1,NB+2,sk(.08));break;
    case 'broad':for(let y=NB+1;y<NT;y++)put(CX+1,y,sk(-.12));put(CX-3,NT,sk(-.1));put(CX-2,NT,sk(-.2));put(CX-1,NT,sk(-.08));put(CX,NT-1,sk(.08));put(CX,NT,sk(.02));put(CX+1,NT,sk(-.12));put(CX+2,NT,sk(-.26));put(CX+3,NT,sk(-.14));put(CX-1,NT+1,sk(-.16));put(CX+1,NT+1,sk(-.2));break;
    case 'wide':for(let y=NB+1;y<NT;y++)put(CX+1,y,sk(-.1));put(CX-2,NT,sk(-.16));put(CX-1,NT,sk(-.1));put(CX,NT-1,sk(.08));put(CX+1,NT,sk(-.14));put(CX+2,NT,sk(-.22));put(CX-1,NT+1,sk(-.12));put(CX+1,NT+1,sk(-.18));break;
    case 'hook':for(let y=NB;y<=NT;y++)put(CX+1,y,sk(-.12));put(CX+2,NB+2,sk(-.14));put(CX+2,NB+3,sk(-.18));put(CX,NB+2,sk(.08));put(CX,NT,sk(-.06));put(CX+1,NT+1,sk(-.26));put(CX,NT+1,sk(-.2));put(CX-1,NT,sk(-.14));break;
    case 'pointed':for(let y=NB;y<NT;y++)put(CX+1,y,sk(-.1));put(CX,NT-1,sk(.08));put(CX,NT,sk(-.16));put(CX-1,NT,sk(-.24));put(CX+1,NT,sk(-.12));break;
    case 'upturned':put(CX+1,NT-1,sk(-.1));put(CX,NT-1,sk(.1));put(CX,NT,sk(.04));put(CX-1,NT,sk(-.3));put(CX+1,NT,sk(-.34));break;
    case 'round':put(CX+1,NT-3,sk(-.08));put(CX+1,NT-2,sk(-.1));put(CX-1,NT-1,sk(.08));put(CX,NT-1,sk(.12));put(CX+1,NT-1,sk(-.04));put(CX-2,NT,sk(-.14));put(CX+2,NT,sk(-.2));put(CX-1,NT+1,sk(-.18));put(CX,NT+1,sk(-.14));put(CX+1,NT+1,sk(-.24));break;
    case 'straight':for(let y=NB;y<=NT;y++)put(CX+1,y,sk(-.1));put(CX,NT,sk(-.1));put(CX+1,NT,sk(-.18));break;
    case 'snub':put(CX,NT-1,sk(.1));put(CX-1,NT,sk(-.22));put(CX,NT,sk(-.06));put(CX+1,NT,sk(-.26));break;
    case 'bulb':for(let y=NB+1;y<NT-1;y++)put(CX+1,y,sk(-.1));put(CX-1,NT-1,sk(.12));put(CX,NT-1,sk(.08));put(CX+1,NT-1,sk(-.08));put(CX-2,NT,sk(-.08));put(CX-1,NT,sk(.04));put(CX,NT,sk(-.02));put(CX+1,NT,sk(-.14));put(CX+2,NT,sk(-.22));put(CX-1,NT+1,sk(-.2));put(CX,NT+1,sk(-.22));put(CX+1,NT+1,sk(-.28));break;
    case 'roman':for(let y=NB;y<=NT;y++)put(CX+1,y,sk(-.12));put(CX+2,NB+1,sk(-.12));put(CX,NB+1,sk(.1));put(CX,NT,sk(-.04));put(CX,NT+1,sk(-.24));put(CX+1,NT+1,sk(-.22));put(CX-1,NT,sk(-.16));break;
    case 'crooked':for(let y=NB;y<=NT;y++)put(CX+(y<NB+3?1:2),y,sk(-.13));put(CX+1,NB+2,sk(.08));put(CX,NT,sk(.04));put(CX-1,NT+1,sk(-.18));put(CX+1,NT+1,sk(-.2));put(CX+3,NT,sk(-.2));break;
    case 'dainty':put(CX,NT-1,sk(.06));put(CX-1,NT,sk(-.14));put(CX+1,NT,sk(-.18));break;
    case 'flared':for(let y=NB+1;y<NT-1;y++)put(CX+1,y,sk(-.1));put(CX,NT-1,sk(.06));put(CX-3,NT-1,sk(-.08));put(CX+3,NT-1,sk(-.12));put(CX-3,NT,sk(-.22));put(CX-2,NT,sk(-.12));put(CX-1,NT,sk(-.26));put(CX,NT,sk(-.04));put(CX+1,NT,sk(-.28));put(CX+2,NT,sk(-.16));put(CX+3,NT,sk(-.26));break;
    default:put(CX+1,NT-2,sk(-.1));put(CX+1,NT-1,sk(-.12));put(CX,NT-1,sk(.07));put(CX-1,NT,sk(-.16));put(CX+1,NT,sk(-.22));put(CX,NT,sk(-.05));}
  /* cheeks, freckles, marks */
  const blush=dark?'#c0606a':'#f07a80',bk=(dark?.2:.28)*fc.blush,ch=EY+(EYE.closed?2:eh+2);
  for(const s of [-1,1]){const bx=s<0?EYX(s)-1:EYX(s)+ew-2;for(let i=0;i<3;i++){tint(bx+i,ch,blush,bk);tint(bx+i,ch+1,blush,bk*.6);}}
  if(sp.freckles)for(const [a,b] of [[-6,4],[-4,5],[-7,6],[3,4],[5,5],[6,4],[-2,3],[2,3],[4,6]])put(CX+a,EY+b,sk(-.24));
  if(fc.mole)put(CX+fc.mole[0],EY+fc.mole[1],sk(-.42));
  if(fc.outfit==='coveralls'){tint(CX+fc.sep+3,EY+5,'#2a2228',.35);tint(CX+fc.sep+4,EY+5,'#2a2228',.25);tint(CX+fc.sep+4,EY+6,'#2a2228',.2);}
  if(fc.nosering){put(CX-4,EY+fc.nl,'#f1c84a');}
  if(fc.dimple){const y=CY+Math.round(fc.bot)-2;put(CX,y,sk(-.16));}
  /* mouth */
  const lip=dark?mixH(skin,'#3a1418',.55):mixH(skin,'#8a2a30',.55),lipL=mixH(skin,'#c05a5a',.22),MY=EY+fc.my,mw=fc.mw,TE='#f4efe6',IN='#5a1a22';
  const row=(y,a,b,c)=>{for(let x=CX+a;x<=CX+b;x++)put(x,y,c);};
  switch(FT.mouth.k){
    case 'grin':row(MY-1,-mw,mw,lip);put(CX-mw-1,MY-2,lip);put(CX+mw+1,MY-2,lip);row(MY,-mw+1,mw-1,TE);put(CX-mw,MY,lip);put(CX+mw,MY,lip);row(MY+1,-mw+1,mw-1,lip);row(MY+2,-mw+2,mw-2,lipL);break;
    case 'laugh':row(MY-1,-mw,mw,lip);put(CX-mw-1,MY-2,lip);put(CX+mw+1,MY-2,lip);row(MY,-mw+1,mw-1,TE);row(MY+1,-mw+1,mw-1,IN);put(CX-mw,MY,lip);put(CX+mw,MY,lip);put(CX-mw+1,MY+1,lip);put(CX+mw-1,MY+1,lip);row(MY+1,-1,1,'#c0505a');row(MY+2,-mw+2,mw-2,lip);put(CX,MY+3,lipL);break;
    case 'flat':row(MY,-mw,mw,lip);row(MY+1,-mw+1,mw-1,lipL);put(CX,MY+2,sk(-.1));break;
    case 'smirk':row(MY,-mw,mw,lip);put(CX+mw+1,MY-1,lip);put(CX+mw+2,MY-2,sk(-.16));row(MY+1,-mw+1,mw-1,lipL);put(CX,MY+2,sk(-.1));break;
    case 'small':row(MY,-1,1,lip);put(CX-2,MY-1,mixH(lip,skin,.4));put(CX+2,MY-1,mixH(lip,skin,.4));put(CX,MY+1,lipL);break;
    case 'pursed':row(MY,-mw,mw,lip);put(CX,MY,shade(lip,-.12));row(MY+1,-mw+1,mw-1,lipL);put(CX-mw-1,MY,sk(-.12));put(CX+mw+1,MY,sk(-.16));put(CX,MY+2,sk(-.1));break;
    case 'soft':row(MY,-mw,mw,lip);put(CX-mw-1,MY-1,lip);put(CX+mw+1,MY-1,lip);row(MY+1,-mw+1,mw-1,mixH(skin,'#d06a70',.4));row(MY+2,-mw+2,mw-2,lipL);break;
    case 'wide':row(MY,-mw,mw,lip);put(CX-mw-1,MY-1,lip);put(CX+mw+1,MY-1,lip);put(CX-mw-2,MY-2,lip);put(CX+mw+2,MY-2,lip);put(CX,MY+1,lipL);break;
    case 'beam':row(MY-1,-mw,mw,lip);put(CX-mw-1,MY-2,lip);put(CX+mw+1,MY-2,lip);row(MY,-mw+1,mw-1,TE);put(CX-mw,MY,lip);put(CX+mw,MY,lip);row(MY+1,-mw+2,mw-2,IN);put(CX-mw+1,MY+1,lip);put(CX+mw-1,MY+1,lip);row(MY+2,-mw+2,mw-2,lip);break;
    case 'gap':row(MY-1,-mw,mw,lip);put(CX-mw-1,MY-2,lip);put(CX+mw+1,MY-2,lip);row(MY,-mw+1,mw-1,TE);put(CX,MY,IN);put(CX-mw,MY,lip);put(CX+mw,MY,lip);row(MY+1,-mw+1,mw-1,IN);put(CX-mw+1,MY+1,lip);put(CX+mw-1,MY+1,lip);put(CX,MY+1,'#c0505a');row(MY+2,-mw+2,mw-2,lip);put(CX,MY+3,lipL);break;
    case 'toothy':row(MY-1,-mw,mw,lip);put(CX-mw-1,MY-2,lip);put(CX+mw+1,MY-2,lip);row(MY,-mw+1,mw-1,TE);row(MY+1,-mw+1,mw-1,TE);for(let x=CX-mw+2;x<=CX+mw-2;x+=2)put(x,MY+1,'#d8d0c4');put(CX-mw,MY,lip);put(CX+mw,MY,lip);put(CX-mw,MY+1,lip);put(CX+mw,MY+1,lip);row(MY+2,-mw+1,mw-1,lip);break;
    case 'tongue':row(MY,-mw,mw,lip);put(CX-mw-1,MY-1,lip);put(CX+mw+1,MY-1,lip);put(CX,MY+1,'#e06a7a');put(CX+1,MY+1,'#e06a7a');put(CX,MY+2,'#c0505a');break;
    case 'lopsided':row(MY,-mw,mw,lip);put(CX+mw+1,MY-1,lip);put(CX+mw+2,MY-2,lip);row(MY+1,0,mw,TE);put(CX-1,MY+1,lip);put(CX+mw+1,MY,lip);row(MY+2,0,mw-1,lip);break;
    case 'content':row(MY,-mw+1,mw-1,lip);put(CX-mw,MY-1,lip);put(CX+mw,MY-1,lip);put(CX-mw-1,MY-1,sk(-.2));put(CX+mw+1,MY-1,sk(-.24));put(CX-mw-1,MY,sk(-.14));put(CX+mw+1,MY,sk(-.18));put(CX,MY+1,lipL);break;
    case 'cheer':row(MY-1,-mw,mw,lip);put(CX-mw-1,MY-2,lip);put(CX+mw+1,MY-2,lip);row(MY,-mw+1,mw-1,IN);row(MY+1,-mw+2,mw-2,IN);row(MY+1,-1,1,'#d05a6a');put(CX-mw,MY,lip);put(CX+mw,MY,lip);put(CX-mw+1,MY+1,lip);put(CX+mw-1,MY+1,lip);row(MY+2,-mw+2,mw-2,lip);break;
    default:row(MY,-mw,mw,lip);put(CX-mw-1,MY-1,lip);put(CX+mw+1,MY-1,lip);put(CX-mw-2,MY-2,sk(-.12));put(CX+mw+2,MY-2,sk(-.16));row(MY+1,-mw+1,mw-1,lipL);put(CX,MY+2,sk(-.1));}
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
  if(sp.glasses){const g='#2a2030',gb=Math.max(eh,2)+1;for(const s of [-1,1]){const ox=EYX(s)-1,fw=ew+2;for(let i=0;i<fw;i++){put(ox+i,EY-2,g);put(ox+i,EY+gb,g);}for(let j=-1;j<gb;j++){put(ox,EY+j,g);put(ox+fw-1,EY+j,g);}
      for(let i=1;i<fw-1;i++)for(let j=-1;j<gb;j++)tint(ox+i,EY+j,'#cfe8ff',.18);put(ox+1,EY-1,'#ffffff');}
    for(let x=CX-fc.sep+1;x<=CX+fc.sep-2;x++)put(x,EY-1,g);const hw=faceHW(EY);put(CX-hw-1,EY,g);put(CX+hw,EY,g);}
  /* hair and hats on top */
  fit(HF,F);
  /* scarf */
  if(sp.scarf){const s=sp.scarf,sD=shade(s,-.22),sL=shade(s,.18),y0=CY+12;for(let y=y0;y<=y0+4;y++)for(let x=CX-9+(y-y0);x<=CX+9-(y-y0)*.5;x++)put(x,y,(x+y)%4===0?sD:(x<CX-4?sL:s));
    for(let y=y0+4;y<=y0+12;y++)for(let x=CX+3;x<=CX+6;x++)put(x+((y-y0-4)>>2),y,x===CX+6?sD:((y%3===0)?sD:s));put(CX+4,y0+13,sD);put(CX+6,y0+13,sD);}
  /* paint: background, a glow behind the head, soft outline round the figure */
  const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');
  const bg=sp.bg,bgL=shade(bg,.22),bgD=shade(bg,-.1),WP=wallpaper(id,bg,hs,mixH);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const d=Math.hypot(i-CX,(j-19)*1.05);let col=WP(i,j)||bg;
    {const r=Math.hypot(i-24,j-22)/32,e=clamp((r-.45)/.65,0,1),k=e*e*(3-2*e);col=shade(col,.1-.38*r*r-.3*k);
      if(k>0){const c=hx(col),l=(c[0]+c[1]+c[2])/3;col=toH(c.map(v=>l+(v-l)*(1+k*.9)));}}
    // a soft glow behind the head so the face still pops off the pattern
    if(d<15)col=mixH(col,bgL,.55);else if(d<19)col=mixH(col,bgL,(i+j)%2===0?.4:.18);
    const v=F[j*N+i];if(v){col=v;}else{let nb=null;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const q=F[(j+b)*N+i+a];if(i+a>=0&&i+a<N&&j+b>=0&&j+b<N&&q){nb=q;break;}}if(nb)col=mixH(shade(nb,-.55),col,.25);}
    x.fillStyle=col;x.fillRect(i,j,1,1);}
  PORT[id]=c.toDataURL();return PORT[id];}
