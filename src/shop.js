/* ---------- coins and Gus's garage ----------
   Delivering mail, air drops, errands, new landmarks and good landings pay a few coins. Spend them at Gus's garage
   (land at Harbor Field) on bigger tailwind and updraft tanks, quicker refills, an engine tune-up, paint and smoke. */
if(log.coins==null)log.coins=0;
if(!log.shop)log.shop={};const SH=log.shop;
for(const [k,v] of [['wind',0],['up',0],['quick',0],['engine',0]])if(SH[k]==null)SH[k]=v;
if(!SH.paint)SH.paint={owned:['classic'],sel:'classic'};if(!SH.smoke)SH.smoke={owned:['white'],sel:'white'};
const COIN_IMG=(()=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d'),P=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  P('#8a5a18',2,0,4,8);P('#8a5a18',0,2,8,4);P('#8a5a18',1,1,6,6);P('#f1c84a',2,1,4,6);P('#f1c84a',1,2,6,4);P('#fff2b0',2,2,2,2);P('#c8902e',4,5,2,1);return c.toDataURL();})();
function coinTag(n){return `<img src="${COIN_IMG}" alt="coins" style="width:12px;height:12px;image-rendering:pixelated;vertical-align:-1px;margin-right:2px">${n.toLocaleString()}`;}
function addCoins(n){if(!n)return;log.coins+=n;saveL();updScore();const e=$('score');if(e){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}}
const UPG=[
  {id:'wind',name:'Bigger tailwind tank',desc:'One more tailwind charge.',max:2,cost:[60,140]},
  {id:'up',name:'Bigger updraft tank',desc:'One more updraft charge.',max:2,cost:[50,120]},
  {id:'quick',name:'Quick refill',desc:'Tailwinds and updrafts come back faster.',max:2,cost:[80,160]},
  {id:'engine',name:'Engine tune-up',desc:'More power: faster climbs and a higher top speed.',max:3,cost:[100,180,280]},
];
const PAINTS=[['classic','Classic',0xf3e7cf,0xd2493c,0],['sky','Sky blue',0xdcecf6,0x2f6fb0,40],['forest','Forest',0xe8e4c8,0x2f6a3a,40],['sunset','Sunset',0xffe2b8,0xe2703f,40],
  ['bumble','Bumblebee',0xf6d24a,0x2c2833,60],['midnight','Midnight',0x2e3550,0xf1c84a,60],['seafoam','Seafoam',0xd4f0e4,0x3f8f8a,40],['rose','Rose',0xf8dce0,0xc2456a,40]];
const SMOKES=[['white','White',[.96,.95,.94],0],['pink','Pink',[1,.72,.82],30],['sky','Sky blue',[.62,.82,1],30],['gold','Gold',[1,.86,.45],30],['mint','Mint',[.66,.95,.8],30],['lilac','Lilac',[.82,.72,1],30]];
const PARK0={body:0xf3e7cf,trim:0xd2493c};
function applyUpgrades(){
  WIND_N=5+SH.wind;UP_N=3+SH.up;WIND_CD=[5,3.8,2.8][SH.quick];UP_CD=[6,4.6,3.4][SH.quick];windCharges=Math.min(windCharges,WIND_N);if(windWait>WIND_CD)windWait=WIND_CD;upCharges=Math.min(upCharges,UP_N);
  AC.Tmax=3000*(1+.09*SH.engine);
  const P=PAINTS.find(p=>p[0]===SH.paint.sel)||PAINTS[0],np=buildPlane({body:P[2],trim:P[3]}),U=plane.userData;
  U.bodyM.geometry.dispose();U.bodyM.geometry=np.userData.bodyM.geometry;U.wingM.geometry.dispose();U.wingM.geometry=np.userData.wingM.geometry;
  const S=SMOKES.find(s=>s[0]===SH.smoke.sel)||SMOKES[0];smokeMat.uniforms.uSmokeC.value.setRGB(...S[2]);
  if(typeof updWindUI==='function')updWindUI();if(typeof updUpUI==='function')updUpUI();}
function shopCard(s){const meet=!log.met.gus;if(meet){log.met.gus=1;saveL();}
  const row=(name,desc,btn)=>`<div class="tog"><div><b>${name}</b><span>${desc}</span></div>${btn}</div>`;
  const buy=(attr,cost,label)=>`<button ${attr} ${log.coins<cost?'disabled style="opacity:.45"':''}>${label||'BUY'} · ${coinTag(cost)}</button>`;
  const ups=UPG.map(u=>{const lv=SH[u.id];return row(`${u.name} <span style="display:inline;font-family:var(--mono);font-size:13px;color:var(--ink2)">${'■'.repeat(lv)+'□'.repeat(u.max-lv)}</span>`,u.desc,lv>=u.max?'<button disabled style="opacity:.55">MAXED</button>':buy(`data-up="${u.id}"`,u.cost[lv]));}).join('');
  const sw=(list,kind)=>list.map(([id,name,a,b,cost])=>{const own=SH[kind].owned.includes(id),sel=SH[kind].sel===id,bg=kind==='paint'?`linear-gradient(135deg,#${a.toString(16).padStart(6,'0')} 55%,#${b.toString(16).padStart(6,'0')} 55%)`:`rgb(${a.map(v=>Math.round(v*255)).join(',')})`,price=kind==='paint'?cost:b;
    return `<button data-${kind}="${id}" style="background:${bg};min-width:96px;padding:6px 8px;font-size:13px;${sel?'outline:3px solid #241c2e;outline-offset:1px;':''}${!own&&log.coins<price?'opacity:.5;':''}"><span style="background:#fff8ecdd;padding:1px 4px">${name}${own?'':' · '+price}</span></button>`;}).join('');
  showCard(`<div class="who"><img src="${portrait('gus')}" alt=""><div><b>Gus's garage</b><span>GUS AMARI · MECHANIC · HARBOR FIELD</span></div></div>
    ${meet?`<p class="say">“${MEET.gus}”</p>`:''}<p class="say">“${['What are we fixing today?','Bring the plane round the back and I\'ll have a look.','Coins in the jar, upgrades on the plane. Simple.'][(log.flights||0)%3]}”</p>
    <div class="sub" style="font-size:16px">YOU HAVE ${coinTag(log.coins)} COINS</div>
    <h3>UPGRADES</h3>${ups}<h3>PAINT</h3><div class="btns">${sw(PAINTS,'paint')}</div><h3>SMOKE COLOR</h3><div class="btns">${sw(SMOKES,'smoke')}</div>
    <p style="font-size:13px;color:var(--ink2)">Coins come from delivering mail, air drops, errands, new landmarks and good landings.</p>`,
    [['Back',()=>{if(s)showCard(`<h2>${s.name}</h2><p>All fixed up.</p>`,[['Take off',()=>spawnField(s),true],['Look around first',()=>{hideModal();mode='fly';}]]);else back();},true]]);
  const B=$('cardBody'),pay=c=>{if(log.coins<c){toast('Not enough coins yet.',1.4);return false;}log.coins-=c;saveL();updScore();snd.beep(1320);setTimeout(()=>snd.beep(1760),90);return true;};
  B.querySelectorAll('[data-up]').forEach(b=>b.addEventListener('click',()=>{const u=UPG.find(q=>q.id===b.dataset.up),lv=SH[u.id];if(lv>=u.max||!pay(u.cost[lv]))return;SH[u.id]++;saveL();applyUpgrades();
    if(u.id==='wind')windCharges=WIND_N;if(u.id==='up')upCharges=UP_N;toast(`${u.name}: fitted.`,1.6);shopCard(s);}));
  for(const [kind,list] of [['paint',PAINTS],['smoke',SMOKES]])B.querySelectorAll(`[data-${kind}]`).forEach(b=>b.addEventListener('click',()=>{const it=list.find(q=>q[0]===b.dataset[kind]),own=SH[kind].owned.includes(it[0]),price=kind==='paint'?it[4]:it[3];
    if(!own){if(!pay(price))return;SH[kind].owned.push(it[0]);}SH[kind].sel=it[0];saveL();applyUpgrades();snd.click();shopCard(s);}));}
applyUpgrades();window.__shopReady=true;updScore();
