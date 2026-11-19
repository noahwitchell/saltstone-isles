'use strict';
/* =================== GAME v2 =================== */
const $=id=>document.getElementById(id);
/* paper: a small generated scrap-of-paper texture (fibers, flecks, a few soft stains) used behind every card, menu and toast */
(function paperTexture(){const N=320,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');let sd=7;const r=()=>{sd=(Math.imul(sd,1664525)+1013904223)>>>0;return sd/4294967296;};
  // only faint light patches (no dark blotches), spread over a large tile so the repeat isn't noticeable
  for(let k=0;k<10;k++){const cx=r()*N,cy=r()*N,rr=30+r()*60,g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,`rgba(255,250,235,${.06+r()*.06})`);g.addColorStop(1,'rgba(0,0,0,0)');
    for(const ox of [-N,0,N])for(const oy of [-N,0,N]){x.save();x.translate(ox,oy);x.fillStyle=g;x.fillRect(cx-rr,cy-rr,rr*2,rr*2);x.restore();}}
  for(let k=0;k<900;k++){const px=Math.floor(r()*N),py=Math.floor(r()*N),len=1+Math.floor(r()*4),dark=r()<.55;x.fillStyle=dark?`rgba(120,90,50,${.05+r()*.07})`:`rgba(255,252,240,${.16+r()*.2})`;
    if(r()<.5)x.fillRect(px,py,len,1);else x.fillRect(px,py,1,len);}
  for(let k=0;k<300;k++){x.fillStyle=`rgba(90,60,30,${.1+r()*.16})`;x.fillRect(Math.floor(r()*N),Math.floor(r()*N),1,1);}
  document.documentElement.style.setProperty('--paperTex',`url(${c.toDataURL()})`);})();
let tod='golden';
function setTOD(k){tod=k;const T=TOD[k];
  const az=T.sunAz*DEG,el=T.sunEl*DEG;sunDir.set(Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el));
  sunL.color.setHex(T.sun);sunL.intensity=T.sunI;
  hemi.color.setHex(T.sky);hemi.groundColor.setHex(T.gnd);hemi.intensity=T.hemiI;
  scene.fog.color.setHex(T.hor);scene.fog.near=T.fogN;scene.fog.far=T.fogF;
  const u=skyMat.uniforms;u.cZen.value.setHex(T.zen);u.cHigh.value.setHex(T.high);u.cHor.value.setHex(T.hor);u.cHaze.value.setHex(T.haze);u.cSun.value.setHex(T.sunc);u.uStars.value=T.stars;u.uDisc.value=T.disc;
  const w=waterMat.uniforms;w.fogColor.value.setHex(T.hor);w.fogNear.value=T.fogN;w.fogFar.value=T.fogF;w.cDeep.value.setHex(T.deep);w.cMid.value.setHex(T.mid);w.cShal.value.setHex(T.shal);w.cGlint.value.setHex(T.glint);
  const pu=postMat.uniforms;pu.con.value=T.con;pu.sat.value=T.sat;pu.vig.value=T.vig;
  lightPts.visible=T.lights>0;lightPts.material.color.setScalar(T.lights);navPts.visible=T.lights>0;
  NIGHT_GLOW.set(T.lights>=1?1:0);bakeTerrainShadow(sunDir,{noon:0,golden:0,sunset:0,dusk:.6,night:.3}[k]||0);fogK=-1;if(typeof applyWeather==='function')applyWeather();}

/* ---------- save data ---------- */
const sightOn=v=>!v.night||TOD[tod].lights>=1;
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const settings=Object.assign({steady:true,stallGuard:true,autoTrim:true,tips:true,dog:true,invert:false,sound:true,engVol:1,music:.5,fps:false,shadows:true,tilt:false,pixels:'classic',light:'golden',station:'lofi'},store.get('tac-settings',{}));
if(!TOD[settings.light])settings.light='golden';
const log=Object.assign({fields:{},sights:{},goals:{},trips:0,flights:0,tips:{},howto:false,stamps:0,met:{},mail:{day:1,bag:[],active:false}},store.get('tac-log',{}));
if(!log.mail)log.mail={day:1,bag:[],active:false};if(!log.met)log.met={};if(log.stamps==null)log.stamps=0;
const saveS=()=>store.set('tac-settings',settings), saveL=()=>store.set('tac-log',log);
const GOALS=[
  {id:'firstflight',name:'First flight',hint:'Take off from any field.'},
  {id:'land_harbor',name:'Land at Harbor Field',hint:'Come to a full stop on the paved runway.'},
  {id:'land_light',name:'Land at Gull Point',hint:'The grass strip on the clifftop island west of Ferrow.'},
  {id:'land_ridge',name:'Land at Ridge Strip',hint:'The short dirt strip up on Tallpine mountain.'},
  {id:'land_marram',name:'Land at Marram Beach',hint:'The hard-sand strip on the atoll far to the southeast.'},
  {id:'land_kettle',name:'Land at Crater Shelf',hint:'The cinder strip on the volcano, far to the northeast.'},
  {id:'land_farhold',name:'Land at Farhold',hint:'The lit runway on the foggy island far to the northwest.'},
  {id:'hopper',name:'Island hopper',hint:'Land at every airfield in the islands.'},
  {id:'tailwind',name:'Riding the wind',hint:'Stack three tailwinds into one gale.'},
  {id:'gale5',name:'Full gale',hint:'Stack all five tailwinds at once.'},
  {id:'updraft3',name:'Going up',hint:'Stack all three updrafts at once.'},
  {id:'roll',name:'Barrel roll',hint:'Roll the plane all the way round.'},
  {id:'loop',name:'Loop the loop',hint:'Fly a full loop.'},
  {id:'trip',name:'Make a trip',hint:'Take off from one field and land at another.'},
  {id:'butter',name:'Butter landing',hint:'Touch down on a runway at under 90 ft/min.'},
  {id:'checklist',name:'By the book',hint:'Land with the whole before-landing checklist done.'},
  {id:'ridge3',name:'Three stars on the ridge',hint:'A three-star landing at Ridge Strip.'},
  {id:'summit',name:'Over the top',hint:'Fly over the summit of the mountain.'},
  {id:'night',name:'Night mail',hint:'Land on a runway at night.'},
  {id:'instrument',name:'From the seat',hint:'Land on a runway in Cockpit view.'},
  {id:'week',name:'A full week',hint:'Finish the first six days of mail.'},
  {id:'week2',name:'The whole chain',hint:'Finish the second week, out to the far islands.'},
  {id:'week3',name:'The archipelago',hint:'Finish the third week of mail, out to Bea\'s new chart.'},
  {id:'canyon',name:'Canyon run',hint:'Fly the Cleft on Cleft Isle end to end, under the rim.'},
  {id:'threader',name:'Needle threader',hint:'Fly through every gap, arch and bridge in the islands.'},
  {id:'drop1',name:'Special delivery',hint:'Air-drop a parcel onto one of the bullseye drop targets.'},
  {id:'bullseye',name:'Bullseye',hint:'Land a parcel within 5 m of the middle of a drop target.'},
  {id:'drops',name:'Air mail',hint:'Deliver ten air drops.'},
  {id:'floatplane',name:'Splashdown',hint:'Pull the floats and land on the water.'},
  {id:'honk',name:'Hello down there',hint:'Honk the horn at three or more people at once.'},
  {id:'errand',name:'Good neighbour',hint:'Finish an errand for an islander.'},
  {id:'errands',name:'Everybody\'s favourite',hint:'Finish every islander\'s errand.'},
];
const DESC_ARCH={hollow:'Hollowpeak. Grass on the western shoulder of the big green peak.',oyster:'Oyster Bay. Sand strip along the back of the crescent, calm bay beside it.',ridgeback:'Ridgeback. Dirt strip under the long ridge. Rough air when the wind crosses it.',fern:'Fernhollow. Grass in a wooded valley. Trees close on both sides.',bracken:'Brackenmoor. Long paved runway on the open moor, far out west.',sunrise:'Sunrise Cay. Hard sand through the palms.',anvil:'The Anvil. Dirt strip on top of a red rock tower. Cliffs at both ends.',creel:'Creel Isle. Grass strip above the fishing hamlet.',fiddler:'Fiddler\'s Reach. Grass along the inner shore of the crescent.',daybreak:'Daybreak Head. Paved runway on the headland, the farthest east.',sisters:'Twin Sisters. Grass shelf beside two rock spires. Gusty off the rocks.',cleft:'Cleft Isle. Dirt strip on the plateau, beside a canyon.',apple:'Applecross. Paved, among the orchards. Easy and friendly.',
  salt:'The Saltpans. Hard white salt, flat as a table. Glare at noon.',mirror:'Looking-Glass Isle. Grass beside the lake rim. Short-ish.',mesa:'Starwatch Mesa. Paved, on top of the mesa. Cliffs at both ends.',
  cascade:'Cascade Isle. Grass terrace under the cliffs. Mind the trees.',lantern:'Lantern Key. Paved, low and lit. Lovely at night.',quarry:'Greystone. Dirt strip on the quarry hill. Dusty.',windward:'Windward. Grass on the ridge flank. Always a breeze.'};
const DESC={harbor:'Ferrow. Long paved runway by the village. The friendly one.',light:'Gull Point. Grass strip on the clifftop, sea at both ends.',ridge:'Tallpine. Short dirt strip on a mountain saddle. Slow down early.',
  marram:'Marram Cay. Hard sand on a low atoll. Flat, but watch the palms.',kettle:'Kettle Rock. Cinder shelf below the crater. Bumpy air off the slopes.',farhold:'Farhold. Long lit runway, nearly always in fog. Trust the lights.',...DESC_ARCH};
for(const st of STRIPS.slice(6))GOALS.splice(GOALS.findIndex(g=>g.id==='hopper'),0,{id:'land_'+st.id,name:'Land at '+st.name,hint:DESC_ARCH[st.id]||st.name});

/* ---------- characters & portraits ---------- */
const CHARS={
  mabel:{name:'Mabel Ostrander',role:'POSTMASTER · HARBOR FIELD',home:'harbor',sp:{bg:'#f2c6a0',skin:'#e8b896',hair:'#cfc8c0',style:'bun',glasses:true,shirt:'#3f8f8a'}},
  bea:{name:'Bea Hollis',role:'RETIRED MAIL PILOT · HARBOR FIELD',home:'harbor',sp:{bg:'#9cc3e6',skin:'#d9a07a',hair:'#f1ece4',style:'short',hat:'aviator',hatc:'#7a4a2a',shirt:'#e9dcc4',scarf:'#c2453a'}},
  gus:{name:'Gus Amari',role:'MECHANIC · HARBOR FIELD',home:'harbor',sp:{bg:'#e9d27a',skin:'#8d5a3b',hair:'#221c1c',style:'short',beard:'#221c1c',hat:'cap',hatc:'#e2703f',shirt:'#3a5a8c'}},
  tomas:{name:'Tomas Reyes',role:'LIGHTHOUSE KEEPER · GULL POINT',home:'light',sp:{bg:'#c8d8e8',skin:'#c98c5e',hair:'#3a3434',style:'short',mustache:'#4a4040',hat:'beanie',hatc:'#2c3a5a',shirt:'#2c3a5a'}},
  nell:{name:'Nell Talley',role:'SHEPHERD · GULL POINT',home:'light',sp:{bg:'#cfe3b0',skin:'#f0c7a4',hair:'#c0582e',style:'long',shirt:'#5b7f3a',freckles:true}},
  ada:{name:'Ada Pennick',role:'FOREST RANGER · TALLPINE',home:'ridge',sp:{bg:'#b8d4a8',skin:'#6e4a33',hair:'#1c1616',style:'curly',hat:'ranger',hatc:'#a89060',shirt:'#6b7a3a'}},
  hank:{name:'Hank Oduya',role:'LOGGING CREW · TALLPINE',home:'ridge',sp:{bg:'#e8c0a8',skin:'#e2a982',hair:'#6a4a30',style:'short',beard:'#6a4a30',hat:'beanie',hatc:'#c2453a',shirt:'#b8443a',plaid:true}},
  ollie:{name:'Ollie Brand',role:'AGE 11 · STRIP CREW · MARRAM CAY',home:'marram',sp:{bg:'#ffd9a0',skin:'#c98c5e',hair:'#2a2020',style:'curly',hat:'cap',hatc:'#ff7a2e',shirt:'#3f8fc0',freckles:true}},
  rosa:{name:'Rosa Kahale',role:'BEACH BAR · MARRAM CAY',home:'marram',sp:{bg:'#f4c0c8',skin:'#a8704a',hair:'#1c1414',style:'long',shirt:'#e8a33a'}},
  ines:{name:'Dr. Ines Varga',role:'VOLCANOLOGIST · KETTLE ROCK',home:'kettle',sp:{bg:'#d8c8e8',skin:'#f0c7a4',hair:'#8a8480',style:'bun',glasses:true,shirt:'#c2553f'}},
  otto:{name:'Otto Lind',role:'OBSERVATORY COOK · KETTLE ROCK',home:'kettle',sp:{bg:'#c8e0d8',skin:'#e8b896',hair:'#e8d8a0',style:'short',beard:'#e8d8a0',hat:'beanie',hatc:'#3a5a8c',shirt:'#eae2cf'}},
  fen:{name:'Fen Morrow',role:'FIELD KEEPER · FARHOLD',home:'farhold',sp:{bg:'#c0c8d0',skin:'#d9a07a',hair:'#5a4a40',style:'short',mustache:'#5a4a40',hat:'cap',hatc:'#4a4e5c',shirt:'#5b6e86',scarf:'#d8d2c8'}},
  ivy:{name:'Ivy Calder',role:'THE HOUSE WITH THE LAMP · FARHOLD',home:'farhold',sp:{bg:'#f0e0b0',skin:'#e2a982',hair:'#f1ece4',style:'long',shirt:'#6a5a8c',scarf:'#d2493c'}},
  wren:{name:'Wren Okafor',role:'CLIMBER · TWIN SISTERS',home:'sisters',sp:{bg:'#c8e0f0',skin:'#4e3226',hair:'#1c1616',style:'curly',shirt:'#e2703f',hat:'beanie',hatc:'#3f8fc0'}},
  tam:{name:'Tam Marlow',role:'GOATHERD · CLEFT ISLE',home:'cleft',sp:{bg:'#e8d0b0',skin:'#e2a982',hair:'#8a5a30',style:'short',beard:'#8a5a30',shirt:'#6b7a3a',hat:'cap',hatc:'#8a5a3a'}},
  hattie:{name:'Hattie Bloom',role:'ORCHARD KEEPER · APPLECROSS',home:'apple',sp:{bg:'#f4d0d8',skin:'#e8b48e',hair:'#d8a050',style:'bun',shirt:'#d2493c'}},
  desmond:{name:'Desmond Achebe',role:'SALT RAKER · THE SALTPANS',home:'salt',sp:{bg:'#f0ece0',skin:'#5a3a28',hair:'#e8e4dc',style:'short',beard:'#e8e4dc',shirt:'#3f6f8f',hat:'ranger',hatc:'#e8dcc0'}},
  lio:{name:'Lio Tanaka',role:'PAINTER · LOOKING-GLASS ISLE',home:'mirror',sp:{bg:'#c8e8e0',skin:'#e8c09a',hair:'#1c1616',style:'long',shirt:'#6a8ab8',glasses:true}},
  odile:{name:'Prof. Odile Marchetti',role:'RADIO ASTRONOMER · STARWATCH MESA',home:'mesa',sp:{bg:'#9cb0d0',skin:'#d9a07a',hair:'#3a3434',style:'bun',shirt:'#e8e4dc',glasses:true,scarf:'#e8a33a'}},
  kit:{name:'Kit Calloway',role:'HUT WARDEN · CASCADE ISLE',home:'cascade',sp:{bg:'#b8d8b0',skin:'#c98c5e',hair:'#6a4a30',style:'short',shirt:'#3f6b3a',hat:'ranger',hatc:'#6b7a3a'}},
  lu:{name:'Auntie Lu',role:'LANTERN MAKER · LANTERN KEY',home:'lantern',sp:{bg:'#f8d8a8',skin:'#e8c09a',hair:'#cfc8c0',style:'bun',shirt:'#d2493c',glasses:true}},
  bram:{name:'Bram Holloway',role:'QUARRYMAN · GREYSTONE',home:'quarry',sp:{bg:'#d0ccc4',skin:'#e2a982',hair:'#3a3434',style:'short',mustache:'#3a3434',shirt:'#8a8a92',hat:'cap',hatc:'#e8a33a'}},
  agnes:{name:'Agnes Flint',role:'MILLER · WINDWARD',home:'windward',sp:{bg:'#f0e4c0',skin:'#f0c7a4',hair:'#f1ece4',style:'bun',shirt:'#8a5a3a',scarf:'#3f8f8a'}},
};
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=v=>clamp(Math.round(a<0?v*(1+a):v+(255-v)*a),0,255);return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
const PORT={};
/* portrait(id) lives in portraits.js */

/* ---------- the mail ---------- */
const DAYS=[
  {intro:"Morning, new pilot. Bea says you can land without bending anything. Let's find out. Two stops today.",
   items:[{to:'tomas',item:'Seed catalog',line:"The seed catalog! The gulls ate my lettuce again, so this year I'm growing something they hate."},
          {to:'ada',item:'Owl survey forms',line:"Survey forms, perfect. If you spot anything big and feathery up here, wag your wings at me."}],
   out:{tomas:[{to:'mabel',item:'Letter for the mainland',line:"Mainland post. It goes out on Thursday's boat. Thank you, dear."}]},
   outro:"Not one bent propeller. Bea owes me a coffee."},
  {intro:"Wool clippers and a thermos. The ridge crew has been asking about that thermos all week.",
   items:[{to:'nell',item:'Shearing blades',line:"New blades! The sheep won't thank you, but I will."},
          {to:'hank',item:'Big steel thermos',line:"Finally. The crew's been fighting over the last one since spring."}],
   out:{hank:[{to:'gus',item:'Broken saw part',line:"Ha, they snapped it again. I'll have it fixed by the end of the week."}]},
   outro:"Gus says you're the first pilot who brings him work instead of making it."},
  {intro:"A letter with a university stamp. I think Tomas has been waiting for this one.",
   items:[{to:'tomas',item:'Letter from Lucía',line:"From Lucía! She says the city is loud. Good. It makes her miss the waves."},
          {to:'ada',item:'Telescope lens',line:"Careful, careful... With this I can count owls from across the valley."}],
   out:{ada:[{to:'bea',item:'Owl sketch for Bea',line:"Ada drew me an owl. She's been asking about spotting from the air. Keep your eyes open up there."}]},
   outro:"Three days in a row. I've started a chart on the wall."},
  {intro:"Wool for Nell and Hank's saw part, good as new. Gus fixed it overnight.",
   items:[{to:'nell',item:'Knitting wool, six colors',line:"Six colors! The sheep will be so jealous of what I make from someone else's wool."},
          {to:'hank',item:'Repaired saw part',line:"Gus fixed it? Tell him the next round at the pub is on me."}],
   out:{nell:[{to:'mabel',item:'Parcel for Mabel',line:"A scarf. In teal. That woman knows me too well."}]},
   outro:"Don't tell anyone, but I'm wearing it."},
  {intro:"One official envelope today. I don't like the look of it.",
   items:[{to:'tomas',item:'Letter from the lighthouse board',line:"Automation. They're replacing me with a clock and a bulb. Well. The clock won't make tea for passing pilots."},
          {to:'ada',item:'Postcard from the bird society',line:"They want my count by spring. Two owls so far. They're shy, like me."}],
   out:{tomas:[{to:'mabel',item:'Letter to Lucía',line:"Going to the city. He pressed hard with the pen on this one."}]},
   outro:"Go easy on yourself tonight. It's been a week."},
  {intro:"Last bag of the week. Bea asked to ride along in spirit, whatever that means.",
   items:[{to:'tomas',item:'Train ticket from Lucía',line:"A ticket to visit her. I suppose the gulls can mind the light for a week."},
          {to:'ada',item:'Brass owl whistle',line:"From the society! They say three owls is a record. I counted three yesterday."},
          {to:'nell',item:'Tide table',line:"Tides! The sheep keep wandering onto the beach. Now at least I'll know when to panic."}],
   out:{},
   outro:"That's the week. Bea says there are islands past the horizon that haven't seen a mail plane in years. Get some sleep."},
  {intro:"Week two. Bea's old charts show three more islands. First, Marram Cay, way out southeast. Follow the tailwinds, and land on the hard sand.",
   items:[{to:'ollie',item:'Real pilot\'s tide chart',line:"A real one! With the little numbers! I'm putting it on my wall. Next to the drawing of your plane."},
          {to:'rosa',item:'Box of paper umbrellas',line:"Umbrellas for the drinks. The tourists don't come, but the umbrellas make me happy anyway."}],
   out:{ollie:[{to:'bea',item:'Drawing of your plane',line:"Ollie drew my old girl? He got the stripe right. Pin it up in the hangar, would you?"}]},
   outro:"Marram Cay. I haven't stamped that name in twenty years."},
  {intro:"Kettle Rock today, the volcano to the northeast. Dr. Varga's parcel is marked 'handle gently, it listens'.",
   items:[{to:'ines',item:'Seismometer parts',line:"My new ears. Now I can hear the mountain think. It's been thinking a lot."},
          {to:'otto',item:'Sack of coffee beans',line:"Coffee! We ran out four days ago. Ines has been drinking tea. It was terrible for everyone."},
          {to:'tomas',item:'Letter from Lucía',line:"She's back on the island for the summer. She wants to learn how the light works before the clock takes over."}],
   out:{ines:[{to:'mabel',item:'Readings for the mainland',line:"Volcano readings, bound for the university. Dr. Varga writes very small."}]},
   outro:"Two new islands in two days. Bea's started calling you 'the kid' when she thinks I can't hear."},
  {intro:"Farhold. It's out past Gull Point to the northwest, and it's usually in fog. Fen Morrow keeps the lights on. Go slow and trust them.",
   items:[{to:'fen',item:'Spare runway bulbs',line:"Bulbs! Half my approach lights were dark. Now the rabbit can run all the way out again."},
          {to:'ada',item:'Owl leg bands',line:"Bands! Tiny brass ones. The owls won't like it, but the society will."}],
   out:{fen:[{to:'bea',item:'Letter, no return address',line:"Another one. Same hand as the others. ...I'll read it later. Thank you, dear."}]},
   outro:"That letter for Bea. It's the fourth this year with no name on it. She went very quiet."},
  {intro:"A busy bag. Ollie's ordered something from a catalog, and I'm afraid it has propellers.",
   items:[{to:'ollie',item:'Model plane kit',line:"It's got a real rubber band motor! I'm painting it cream and red. Like yours. Obviously."},
          {to:'otto',item:'Telescope eyepiece',line:"For the big telescope. Tonight we look at Saturn. You should stay. It's better than the coffee."},
          {to:'nell',item:'New ram bell',line:"For Barnaby. He's the one who sits on the runway. Now I'll hear him before you hit him."}],
   out:{ollie:[{to:'gus',item:'List of engine questions',line:"Forty-two questions. Numbered. Tell the boy I'll answer one per delivery."}],otto:[{to:'ines',item:'Thermos of soup',line:"Otto sent soup down the hill? He worries. Tell him the mountain is fine. Mostly."}]},
   outro:"Gus has started a folder for Ollie's questions. He pretends to grumble."},
  {intro:"Dr. Varga needs a new probe, and Fen says someone on Farhold would like to meet you.",
   items:[{to:'ines',item:'Thermometer probe',line:"This one goes right into the vent. The old one melted. Don't tell the university."},
          {to:'ivy',item:'Seed packets',line:"Sweet peas. Bea always said they wouldn't grow in fog. We'll see."},
          {to:'hank',item:'New axe handle',line:"Hickory. Proper. The crew's been using a broom."}],
   out:{ivy:[{to:'bea',item:'Letter, signed Ivy',line:"Ivy. Forty years, and she signs it this time. ...Do you know, I promised her I'd fly back for her in the spring of '86. Then the engine went, and the spring went, and so did the years."}]},
   outro:"Bea asked to borrow my good pen tonight. I didn't ask why."},
  {intro:"Last day of the chain. Bea's written a letter to Farhold herself, and she's sealed it twice.",
   items:[{to:'rosa',item:'New tide book',line:"Fresh tides for the season! You'll get your lemonade now, pilot. The sand's dry all week."},
          {to:'ines',item:'Postcard from the university',line:"They read my readings. They're sending a whole team in spring. The mountain will love the attention."},
          {to:'ivy',item:'Bea\'s letter',line:"She's coming. On the Thursday boat, she says, because she's too old to land in fog. Forty years late. That's alright. The sweet peas are up."}],
   out:{},
   outro:"That's every island on the chain with its mail again. Bea's off to Farhold on Thursday. She asked who'd fly the post while she's gone. I told her we already have a pilot."},
  {intro:"Week three. Bea's back from Farhold, and she brought a new chart: fourteen more islands, and nobody's flown mail to them in thirty years. Start east, at the Twin Sisters and Lantern Key.",
   items:[{to:'wren',item:'New climbing rope',line:"Sixty metres, bright blue. The tall Sister doesn't stand a chance. ...Probably."},
          {to:'lu',item:'Box of rice paper',line:"Paper for the festival lanterns! A whole box. I'll make you one with a little plane on it."}],
   out:{lu:[{to:'bea',item:'A paper lantern',line:"A lantern from Lu? I used to bring her matches. She remembered."}]},
   outro:"Twin Sisters and Lantern Key, back on the route. Bea pinned the new chart over my desk. She drew Biscuit in the corner."},
  {intro:"South today. Applecross has orchards to the water, and someone on Looking-Glass Isle has ordered a great deal of blue paint.",
   items:[{to:'hattie',item:'Grafting knife',line:"Sharp as anything. I'll graft the old Saltwhistle Pippin onto the young trees. Bea's mother planted the first one."},
          {to:'lio',item:'Tubes of blue paint',line:"Cerulean, cobalt, ultramarine. The lake needs all three. On a good day it needs more."}],
   out:{hattie:[{to:'mabel',item:'Basket of apples',line:"Apples from Hattie? The post office will smell like autumn for a week."}],lio:[{to:'tomas',item:'Painting of the lighthouse',line:"Lio painted my light from the air? From your plane? Well. It's never looked so brave."}]},
   outro:"Hattie's apples are on the counter. Take one. Gus has had four."},
  {intro:"West, to the Saltpans and Windward. Agnes at the mills has been waiting on her chisel since before you were born.",
   items:[{to:'desmond',item:'New rake teeth',line:"Iron teeth! The old rake has been bald since spring. The salt will come up white again."},
          {to:'agnes',item:'Millstone chisel',line:"Finally. You dress a millstone or it grinds like gravel. Thirty years I've waited. It was worth it. Almost."}],
   out:{agnes:[{to:'hattie',item:'Sack of flour',line:"Flour from Agnes! Apple pie it is. You'll have the first slice."}]},
   outro:"Agnes sent a note: she says the post is very slow these days. Then she drew a smiley face. I've never seen her smile."},
  {intro:"Starwatch Mesa, out to the far west. Professor Marchetti's parcel is marked 'fragile, from space'. It isn't. It's from the mainland.",
   items:[{to:'odile',item:'Box of radio valves',line:"New valves! The dish has been half deaf. Tonight we'll hear the whole sky."},
          {to:'desmond',item:'Letter from his daughter',line:"From Ama. She's coming home for the salt harvest. You've made an old raker very happy."},
          {to:'ines',item:'Star chart from Odile',line:"A star chart, from the mesa? Odile and I were at university together. She still writes in green ink."}],
   out:{odile:[{to:'otto',item:'Recording of Saturn',line:"A recording of Saturn. From Odile. It sounds like... a kettle. I love it."}]},
   outro:"Two observatories writing to each other. Bea says the islands are talking again, and it's your doing."},
  {intro:"North: Cascade Isle and Greystone. Kit at the hut needs a first-aid kit, and Bram needs his wedges. Don't mix them up.",
   items:[{to:'kit',item:'First-aid kit',line:"Bandages, iodine, and somebody's put in a chocolate bar. Probably you. Thank you."},
          {to:'bram',item:'Steel wedges',line:"Proper wedges. Now the stone splits clean. Ferrow's new harbour wall starts tomorrow."}],
   out:{bram:[{to:'mabel',item:'Stone for the post office step',line:"A new step for the post office? From Bram? I'll stop tripping on the old one. Tell him thank you."}]},
   outro:"Bram's stone came over on the boat. The new step has a little plane carved in it. And a dog."},
  {intro:"Last day of Bea's chart. Tam's goats need bells, and Bea has one more letter. She says you'll know who it's for.",
   items:[{to:'tam',item:'Goat bells',line:"Bells! Now I'll hear them on the ledges. The goats are furious. That's how you know it's working."},
          {to:'wren',item:'Bea\'s old flying gloves',line:"Bea's gloves? For climbing? She says they've held on to worse. I'll wear them up the tall Sister."},
          {to:'lu',item:'Bea\'s letter',line:"She wants a lantern for every island on the chart. Twenty lanterns, one festival night, all lit at once. ...Tell her yes."}],
   out:{},
   outro:"Every island on Bea's chart has its mail. Lu's lighting twenty lanterns on festival night, one for each island, and Bea wants you to fly over them. So do I."},
];
const MEET={
  mabel:"I'm Mabel. I run the post office, which means I run this island. Your mail goes out from here every morning.",
  bea:"So you're the one flying my old girl. Read my logbook before you do anything clever. It's under the seat.",
  gus:"Gus. I fix what pilots break. Try not to keep me too busy.",
  tomas:"Tomas Reyes, keeper of the light. You'll always get tea here, pilot.",
  nell:"Nell. Mind the sheep on the strip, they think it's theirs.",
  ada:"Ada Pennick, ranger. I'm counting owls on this mountain. Very slowly.",
  hank:"Hank. Ridge crew. Anything that comes up this mountain by plane, we're grateful for.",
  ollie:"I'm Ollie! I run the strip. Well, I wave the flag. Is it true you can do a loop? Don't do a loop.",
  rosa:"Rosa. I keep the bar and the tide book. If the sand's wet, go around. If it's dry, lemonade's on me.",
  ines:"Ines Varga. I listen to the volcano. It's been chatty lately, so I'm glad the post finally comes up here.",
  otto:"Otto. I cook for the observatory, which is mostly coffee. You'll stay for a cup, ja?",
  fen:"Fen Morrow. I keep the lights on this field so pilots can find it. You're the first one in a long while.",
  ivy:"So you're the one carrying my letters. I'm Ivy. Bea and I learned to fly together, a very long time ago.",
  wren:"Wren. I climb the Sisters. Not the tall one yet. Next summer. Did you fly between them? Everyone does once.",
  tam:"Tam. Goats, mostly. The goats think the bridge is theirs and I've stopped arguing.",
  hattie:"Hattie Bloom. Two hundred apple trees and a cider barn. Take an apple. Take two, they're small this year.",
  desmond:"Desmond. I rake salt. White pans, pink pans, and the sun does the rest. Don't land in a pan, please.",
  lio:"I'm Lio. I paint the lake. Every day it's a different lake. Hold still, you're in the light.",
  odile:"Odile Marchetti. I listen to the sky with a very big ear. Mostly it hums. Sometimes it sings.",
  kit:"Kit. I keep the hut and the trail on Cascade. If you hear thunder on a clear day, that's the falls.",
  lu:"Everyone calls me Auntie Lu. I make the lanterns. Come at night and you'll see why.",
  bram:"Bram. Greystone's mine, and the stone in every harbour wall from here to Ferrow. Mind the dust on the strip.",
  agnes:"Agnes Flint. Seven mills and I know every creak. The wind never stops on Windward, so neither do I.",
};
const mail=log.mail;
const bagFor=stripId=>mail.bag.filter(it=>CHARS[it.to].home===stripId);
function mailDest(){if(!mail.active)return null;const it=mail.bag[0];if(it)return stripById(CHARS[it.to].home);return STRIPS[0];}
/* the task pill: one short line up top saying what's left to do, always on screen. Tap it for the mail bag */
const TASK_IMG=(()=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d'),P=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  P('#5a4030',0,1,8,6);P('#f6efe0',1,2,6,4);P('#c9b89a',1,2,1,1);P('#c9b89a',6,2,1,1);P('#c9b89a',2,3,1,1);P('#c9b89a',5,3,1,1);P('#c9b89a',3,4,2,1);P('#d2493c',5,4,1,1);return c.toDataURL();})();
function updTask(){const t=$('task');if(!t)return;const parts=[];
  if(mail.active){const n=mail.bag.length,nx=mailDest();parts.push(n?`<b>${n}</b> ${n>1?'letters':'letter'} <span class="dim">next</span> ${nx?nx.name:''}`:`Bag empty <span class="dim">head home to</span> Harbor Field`);
    const dl=(mail.drops||[]).filter(d=>!d.done).length;if(dl)parts.push(`<b>${dl}</b> ${dl>1?'drops':'drop'}`);}
  if(typeof activeErrands==='function'){const er=activeErrands();if(er.length)parts.push(er.map(errLine).join(', '));}
  t.hidden=!parts.length;if(parts.length)t.innerHTML=`<img src="${TASK_IMG}" alt="">`+parts.join(' <span class="dim">/</span> ');}
function refreshBag(){const b=$('bag');updJob();updTask();if(!mail.active){b.hidden=true;return;}
  const n=mail.bag.length,nx=mailDest();b.hidden=false;b.textContent=n?`✉ ${n} → ${nx.name.toUpperCase()}`:'✉ BAG EMPTY → HOME';}
/* the little "today's jobs" panel: mail, air drops, errands. Tap it for the mail bag */
function updJob(){const jd=$('jDay');if(!jd)return;jd.textContent=mail.active?'DAY '+mail.day:'FREE FLIGHT';
  const dr=$('jDrop'),A=mail.active?mail.drops:[];dr.hidden=!A.length;
  dr.innerHTML=A.map(d=>d.done?`<span class="done">✓ DROPPED: ${d.place.toUpperCase()}</span>`:d.seen?`▼ DROP: ${d.place.toUpperCase()}`:`▼ DROP ON ${ISLES[d.isle].name.toUpperCase()}`).join('<br>');
  if(typeof updErrandUI==='function')updErrandUI();const r=$('rDrop');if(r)r.hidden=!activeDrops().length;}
function mailRoute(){const stops=[];for(const it of mail.bag){const h=CHARS[it.to].home;let st=stops.find(x=>x.id===h);if(!st){st={id:h,items:[]};stops.push(st);}st.items.push(it);}return stops;}
function mailCard(){const wasFly=mode==='fly';if(wasFly)mode='paused';
  const stops=mailRoute(),day=DAYS[mail.day-1];let html='';
  stops.forEach((st,i)=>{const S=stripById(st.id),km=(Math.hypot(S.x-ac.pos.x,S.z-ac.pos.z)/1000).toFixed(1);
    html+=`<h3>${i===0?'NEXT · ':'STOP '+(i+1)+' · '}${S.name.toUpperCase()} · ${km} KM</h3><div class="list">`+st.items.map(it=>`<div class="item ${i===0?'':''}"><span style="display:flex;gap:10px;align-items:center"><img src="${portrait(it.to)}" alt="" style="width:36px;height:36px;image-rendering:pixelated"><span><b>${it.item}</b><span class="d">For ${CHARS[it.to].name}${it.from?' · from '+CHARS[it.from].name:''}</span></span></span></div>`).join('')+'</div>';});
  const H=STRIPS[0],hk=(Math.hypot(H.x-ac.pos.x,H.z-ac.pos.z)/1000).toFixed(1);
  html+=`<h3>${stops.length?'THEN':'NEXT'} · ${H.name.toUpperCase()} · ${hk} KM</h3><div class="list"><div class="item"><span><b>Back to Mabel</b><span class="d">Bring in any outgoing mail and close the day.</span></span></div></div>`;
  showCard(`<h2>Mail bag</h2><div class="sub">DAY ${mail.day} · ${mail.bag.length} ITEM${mail.bag.length===1?'':'S'} · THE CYAN MARKER IS YOUR NEXT STOP</div>${html}`,
    wasFly?[['Resume',()=>{hideModal();mode='fly';},true],["Bea's chart",()=>bigMap()],['Menu',()=>openMenu()]]:[['Back',back,true]]);}
function stamp(n=1){log.stamps+=n;saveL();}

/* ---------- extra world bits ---------- */
(function sheds(){const it=[];
  const s=STRIPS[2];const p=toWorld(s,40,-(s.wid/2+16));const y=groundH(p.x,p.z);
  it.push({geo:BOX(7,4,6),m:M([p.x,y+1.5,p.z],[0,-s.hdg*DEG,0]),color:0xe9d3b0});
  it.push({geo:new THREE.CylinderGeometry(4.4,4.4,6.6,3).rotateX(-Math.PI/2),m:M([p.x,y+4.3,p.z],[0,-s.hdg*DEG+Math.PI/2,0],[1,.55,1]),color:0xc2553f});
  addLight(p.x,y+2,p.z,0xffc25a);
  const l=STRIPS[1];const q=toWorld(l,-60,l.wid/2+18);const yy=groundH(q.x,q.z);
  it.push({geo:BOX(6,3.6,5),m:M([q.x,yy+1.3,q.z],[0,-l.hdg*DEG,0]),color:0xdfe3e6});
  it.push({geo:new THREE.CylinderGeometry(3.8,3.8,5.6,3).rotateX(-Math.PI/2),m:M([q.x,yy+3.9,q.z],[0,-l.hdg*DEG+Math.PI/2,0],[1,.55,1]),color:0x3f6f8f});
  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));})();
lightPts.geometry.setAttribute('position',new THREE.Float32BufferAttribute(LIGHTP,3));lightPts.geometry.setAttribute('color',new THREE.Float32BufferAttribute(LIGHTC,3));
const PAPIS=[];
for(const s of STRIPS)for(const dir of [1,-1]){
  const g=new THREE.Group();const lights=[];
  const aimS=-dir*(s.len/2-s.len*.22);const a=toWorld(s,aimS,0);
  const dx=s.fx*dir,dz=s.fz*dir;const lx=dz,lz=-dx;
  const base=new V3(a.x+lx*(s.wid/2+9),groundH(a.x,a.z)+1,a.z+lz*(s.wid/2+9));g.position.copy(base);
  for(let j=0;j<4;j++){const m=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.6,1.6),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));m.position.set(lx*j*5,0,lz*j*5);m.rotation.y=-s.hdg*DEG;g.add(m);lights.push(m);}
  scene.add(g);PAPIS.push({s,dir,g,lights,base});
}
/* approach gates: three floating frames on the 4-degree glide path, 2.0 / 1.3 / 0.7 km before the aim point */
const GATE_D=[2000,1300,700],gateGrp=new THREE.Group();scene.add(gateGrp);const gates=[];
{const mat=new THREE.MeshBasicMaterial({color:0x8ff0e8,fog:false});
  for(let i=0;i<3;i++){const fr=new THREE.Group();const W=46,Hh=30,T=2.4;
    for(const [x,y,w,h] of [[0,Hh/2,W,T],[0,-Hh/2,W,T],[-W/2,0,T,Hh],[W/2,0,T,Hh]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,T),mat);b.position.set(x,y,0);fr.add(b);}
    gateGrp.add(fr);gates.push(fr);}}
let gateDir=1,gatePassed=[false,false,false],gateAlong=1e9;
function gateSide(s){const l=toLocal(s,ac.pos.x,ac.pos.z),side=l.s<0?1:-1;return approachClear(s,side)?side:(approachClear(s,-side)?-side:side);}
function gatePos(s,dir,d){const aimS=-dir*(s.len/2-s.len*.22),p=toWorld(s,aimS-dir*d,0);return new V3(p.x,s.elev+AC.gearH+Math.tan(4*DEG)*d,p.z);}
function updGates(){
  const show=dest&&!ac.ground&&(mode==='fly'||mode==='paused')&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)<7500;gateGrp.visible=!!show;if(!show){gatePassed=[false,false,false];gateAlong=1e9;return;}
  const nd=gateSide(dest);if(nd!==gateDir){gateDir=nd;gatePassed=[false,false,false];}
  const s=dest,aimS=-gateDir*(s.len/2-s.len*.22),l=toLocal(s,ac.pos.x,ac.pos.z),along=(aimS-l.s)*gateDir,lat=l.t*gateDir;
  if(gateAlong>=1e8){gatePassed=GATE_D.map(d=>d>along);gateAlong=along;}
  gates.forEach((fr,i)=>{const p=gatePos(s,gateDir,GATE_D[i]);fr.position.copy(p);fr.rotation.set(0,-(s.hdg+(gateDir<0?180:0))*DEG,0);
    const dist=p.distanceTo(camera.position);fr.scale.setScalar(clamp(dist/450,1,6));fr.visible=!gatePassed[i];
    if(!gatePassed[i]&&gateAlong>GATE_D[i]&&along<=GATE_D[i]){gatePassed[i]=true;const dy=ac.pos.y-p.y;const inside=Math.abs(lat)<34&&Math.abs(dy)<26;
      snd.beep(inside?990:440);toast(inside?`Gate ${i+1} ✓ ${i<2?'on the path':'nice. Flaps 2, power back.'}`:`Missed gate ${i+1}. ${Math.abs(dy)>=26?(dy>0?'A little high.':'A little low.'):'Off to the side.'} Line up for the next.`,2);}});
  gateAlong=along;}

/* tailwind button: three charges, each a 6 s gust that carries you along fast and holds your height.
   Tap again while a gust is blowing and they stack: two gusts go faster, three faster still.
   Charges refill one every 5 s once every gust has died down. */
const BOOST_V=55,BOOST_T=6,STACK=[0,1,1.7,2.25,2.75,3.2,3.6,3.95];let WIND_N=5,WIND_CD=5;   // Gus can fit bigger tanks and quicker refills
let windCharges=WIND_N,windCD=0,windUiT=0,windWait=WIND_CD,windPeak=0;
const glideAlt=(s,d)=>s.elev+AC.gearH+Math.tan(4*DEG)*d;
function windBlock(){if(ac.ground||mode!=='fly')return 'IN THE AIR';const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z);if(agl<40)return 'TOO LOW';
  return null;}
function useWind(){const b=windBlock();
  if(windCharges<=0){toast(ac.gusts&&ac.gusts.length?'Every tailwind is blowing. Ride it out, or hold BRAKE to stop it.':`The wind is gathering. Next one in ${Math.ceil(windCD)} s.`,1.4);return;}
  if(b){toast(b==='TOO LOW'?'Climb a little first. Tailwinds need some height.':'Tailwinds work once you\'re flying.',1.8);return;}
  if(!ac.gusts)ac.gusts=[];ac.gusts.push(BOOST_T);windCharges--;const n=ac.gusts.length;windPeak=Math.max(windPeak,n);
  windWait=WIND_CD;windCD=windWait;ac.boostT=Math.max(...ac.gusts);
  snd.beep(1320+n*180);setTimeout(()=>snd.beep(1760+n*220),90);
  toast(n>1?`Tailwind ×${n}!${n>=5?' FULL GALE!':n===3?' A proper gale.':''}`:windCharges?`Tailwind! ${windCharges} left.`:'Last tailwind for now.',1.4);
  if(!log.goals.tailwind&&n>=3)goal('tailwind');if(n>=5)goal('gale5');if(n>=2)tip('windstop','Going too fast? Hold BRAKE in the air and the tailwind stops at once.',1);updWindUI();}
function updWindUI(){const b=$('wind');if(!b)return;const blk=windBlock(),cool=windCharges<=0,n=(ac.gusts||[]).length,fill=windCharges<WIND_N&&!n;
  b.innerHTML=`<img src="${RICON.wind}" alt="Tailwind">${n>1?'×'+n:''}<span>${'●'.repeat(windCharges)+'○'.repeat(WIND_N-windCharges)}</span>`;
  b.classList.toggle('cool',cool&&!n);b.classList.toggle('off',!!blk&&!cool);b.classList.toggle('on',n>0);
  b.style.setProperty('--w',fill?Math.round((1-windCD/windWait)*100)+'%':'0%');}
function updWind(dt){const blowing=ac.gusts&&ac.gusts.length;
  if(!blowing&&windCharges<WIND_N){windCD-=dt;if(windCD<=0){windCharges++;windCD=windWait;if(windCharges===WIND_N){windCD=0;windPeak=0;windWait=WIND_CD;}}}
  windUiT-=dt;if(windUiT<=0){windUiT=.1;updWindUI();}}
function stepBoost(dt){
  if(!ac.gusts)ac.gusts=[];const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z);
  if(agl<30||ac.ground)ac.gusts.length=0;
  /* holding BRAKE in the air calls off the tailwind straight away (and the extra speed bleeds off fast) */
  if(ac.brakeHeld&&!ac.ground&&ac.gusts.length){ac.gusts.length=0;ac.windStop=1.2;snd.burst(.35,900,.5);toast('Tailwind off.',1.2);}
  if(ac.windStop>0)ac.windStop-=dt;
  for(let i=ac.gusts.length-1;i>=0;i--){ac.gusts[i]-=dt;if(ac.gusts[i]<=0)ac.gusts.splice(i,1);}
  ac.boostT=ac.gusts.length?Math.max(...ac.gusts):0;const tgt=STACK[ac.gusts.length];
  ac.bst=lerp(ac.bst||0,tgt,1-Math.exp(-dt*(tgt>(ac.bst||0)?2.5:ac.windStop>0?5:1.1)));
  if(ac.bst<.005||ac.ground)return;
  axes();const hl=Math.hypot(_f.x,_f.z);if(hl<.2)return;
  ac.pos.x+=_f.x/hl*BOOST_V*ac.bst*dt;ac.pos.z+=_f.z/hl*BOOST_V*ac.bst*dt;
  ac.vel.y+=(0-ac.vel.y)*Math.min(1,dt*3*Math.min(ac.bst,1));}

const beacon=new THREE.Mesh(new THREE.CylinderGeometry(5,5,700,10,1,true).translate(0,350,0),new THREE.MeshBasicMaterial({color:0x8ff0e8,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
scene.add(beacon);
/* ground shadow: the plane's silhouette dropped straight down onto whatever is below, darker and sharper the closer
   you get. Straight down (not along the sun) so it always sits under you and shows your real height on landing. */
const blob=(()=>{const P=[],q=(x0,z0,x1,z1,w0,w1)=>{P.push(-w0,0,z0, w0,0,z0, -w1,0,z1, -w1,0,z1, w0,0,z0, w1,0,z1);};
  q(0,-3.2,0,-1.75,.42,.55);q(0,-1.75,0,-.25,5.25,5.25);q(0,-.25,0,3.65,.58,.2);q(0,3.65,0,4.5,1.7,1.7);q(0,-3.45,0,-3.2,.1,.42);
  for(const sx of [-1,1])P.push(sx*5.25,0,-1.75, sx*5.25,0,-.25, sx*5.6,0,-1.6);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x1c1626,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  m.matrixAutoUpdate=false;m.renderOrder=2;m.frustumCulled=false;scene.add(m);return m;})();
const _flat=new THREE.Matrix4();
{const hp=toWorld(STRIPS[0],95,-38);parked.position.set(hp.x,groundH(hp.x,hp.z)+1.35,hp.z);parked.quaternion.setFromEuler(new THREE.Euler(0,-(STRIPS[0].hdg+200)*DEG,0,'YXZ'));}
const smokeBurst=[];{const mat=new THREE.MeshToonMaterial({color:0x6e6574,gradientMap:gradTex,flatShading:true});
  for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),mat);m.visible=false;scene.add(m);smokeBurst.push(m);}}
const spot=new THREE.SpotLight(0xfff2d8,0,240,.3,.5,2);spot.position.set(0,-.4,-2.6);const spotT=new THREE.Object3D();spotT.position.set(0,-14,-80);plane.add(spot,spotT);spot.target=spotT;
const navPts=(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-5.3,.8,-.5,5.3,.8,-.5,0,1.7,4.5],3));g.setAttribute('color',new THREE.Float32BufferAttribute([1,.25,.2,.3,1,.4,1,1,1],3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,vertexColors:true,fog:false}));plane.add(m);return m;})();
const TG=new Map();for(const t of trees){const k=((t.x/60)|0)+','+((t.z/60)|0);if(!TG.has(k))TG.set(k,[]);TG.get(k).push(t);}
function treeHit(x,y,z){const cx=(x/60)|0,cz=(z/60)|0;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const L=TG.get((cx+i)+','+(cz+j));if(!L)continue;
  for(const t of L){const r=3.6*t.s+1.5;if((t.x-x)**2+(t.z-z)**2<r*r&&y<t.h+10.5*t.s)return true;}}return false;}
let summit={x:0,z:0,h:0};{let m=-1e9,mi=0;for(let k=0;k<HGT.length;k++)if(HGT[k]>m){m=HGT[k];mi=k;}summit={x:-HALFX+(mi%NVX)*CELL,z:-HALFZ+Math.floor(mi/NVX)*CELL,h:m};}
const stripAt=(x,z,m=2)=>STRIPS.find(s=>{const l=toLocal(s,x,z);return Math.abs(l.s)<s.len/2&&Math.abs(l.t)<s.wid/2+m;})||null;
const stripById=id=>STRIPS.find(s=>s.id===id);

/* ---------- flight model ---------- */
const G=9.81,RHO=1.225,KT=1.94384,FT=3.28084;
const AC={mass:650,S:16,span:10.5,CLa:5.2,CL0:.3,CD0:.031,k:.058,Tmax:3000,Vp:75,stall:15*DEG,Ka:16,Ke:4.8,Kr:6.5,Kd:1.5,Kb:6,Kru:2.5,gearH:1.35};
const FLAPS=[{dCL:0,dSt:0,dCD:0},{dCL:.35,dSt:-1*DEG,dCD:.016},{dCL:.6,dSt:-2*DEG,dCD:.06}];
const WIND=new V3(Math.sin(70*DEG),0,-Math.cos(70*DEG)).multiplyScalar(3);
const ac={pos:new V3(),vel:new V3(),q:new Q(),w:new V3(),ground:true,gYaw:0,gPitch:0,u:0,throttle:0,flaps:0,brake:0,brakeHeld:false,trim:.06,trimHold:0,
  alpha:0,beta:0,as:AC.stall,stall:false,stallWarn:false,ias:0,td:null,from:'harbor',lastField:'harbor',rpm:.25,prop:0,
  carb:false,lean:false,light:false,ice:0,rough:0,pf:1};
function CLof(a,f){const as=AC.stall+f.dSt,c0=AC.CL0+f.dCL,mx=c0+AC.CLa*as;
  if(a>as)return Math.max(mx*.5,mx-(a-as)*4)*(a>1.2?Math.max(0,(1.57-a)/.37):1);
  const an=-.2;if(a<an){const mn=c0+AC.CLa*an;return Math.min(mn*.5,mn+(an-a)*4);}
  return c0+AC.CLa*a;}
let CEIL=1500;   // the air thins above this (m); Gus's supercharger raises it
const thrust=u=>AC.Tmax*ac.throttle*ac.pf*Math.max(0,1-u/AC.Vp)*clamp(1-(ac.pos.y-CEIL)/450,0,1);
function engine(dt){
  const ft=(ac.pos.y-AC.gearH)*FT;
  if(!ac.ground&&!ac.carb&&ac.throttle<.4)ac.ice=Math.min(1,ac.ice+dt/32);
  else if(ac.carb)ac.ice=Math.max(0,ac.ice-dt/6);else ac.ice=Math.max(0,ac.ice-dt/70);
  let pf=1;if(ac.carb)pf*=.93;
  let leanRough=0;if(ac.lean){if(ft>2000)pf*=1.06;else{pf*=.86;leanRough=ac.throttle>.6?.5:.2;}}
  pf*=1-.35*ac.ice;ac.pf=pf;ac.rough=Math.max(ac.ice>.25?ac.ice:0,leanRough);
}
const _f=new V3(),_u=new V3(),_r=new V3(),_va=new V3(),_vb=new V3(),_qi=new Q(),_fo=new V3(),_d=new V3(),_l=new V3(),_dq=new Q(),_ax=new V3(),_p=new V3(),_e=new THREE.Euler();
const surfH=(x,z)=>Math.max(groundH(x,z),0);
const inp={pitch:0,roll:0,yaw:0};
let simT=0;
function axes(){_f.set(0,0,-1).applyQuaternion(ac.q);_u.set(0,1,0).applyQuaternion(ac.q);_r.set(1,0,0).applyQuaternion(ac.q);}
function stepAir(dt){
  axes();const F=_f,U=_u,R=_r;
  const va=_va.copy(ac.vel).sub(WIND),V=va.length();
  const vb=_vb.copy(va).applyQuaternion(_qi.copy(ac.q).invert());
  const u=-vb.z,alpha=Math.atan2(-vb.y,Math.max(u,.5)),beta=Math.atan2(vb.x,Math.max(Math.abs(u),2));
  const f=FLAPS[ac.flaps],as=AC.stall+f.dSt;
  const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z),ge=agl<AC.span?1+.1*(1-Math.max(agl,0)/AC.span):1;
  const CL=CLof(alpha,f)*ge,qd=.5*RHO*V*V,stalled=alpha>as;
  const CD=AC.CD0+f.dCD+.012*(ac.floats||0)+.014*(1-ac.throttle)+AC.k*CL*CL/(ge*ge)+(stalled?.06+(alpha-as)*.6:0);
  const force=_fo.set(0,-AC.mass*G,0);
  if(V>1){const dir=_d.copy(va).multiplyScalar(1/V);
    const ld=_l.copy(U).addScaledVector(dir,-U.dot(dir));if(ld.lengthSq()>1e-6){ld.normalize();force.addScaledVector(ld,qd*AC.S*CL);}
    force.addScaledVector(dir,-qd*AC.S*CD);force.addScaledVector(R,-qd*AC.S*.9*beta);}
  force.addScaledVector(F,thrust(Math.max(u,0)));
  ac.vel.addScaledVector(force,dt/AC.mass);ac.pos.addScaledVector(ac.vel,dt);
  const A=clamp(qd/551,0,2.2),sA=Math.sqrt(A);
  const bank=Math.atan2(-R.y,U.y),rollRate=-ac.w.z;
  let e=inp.pitch,a=inp.roll,r=inp.yaw;
  if(settings.steady){r+=clamp(beta*2.5,-1,1);/* steady wings levels you out, but not while you're pulling hard (so loops go all the way round) */if(Math.abs(inp.roll)<.05&&Math.abs(inp.pitch)<.6)a=clamp(-bank*1.1-rollRate*.35,-.7,.7);}
  if(settings.autoTrim){if(Math.abs(inp.pitch)<.04){if(ac.trimHold>=0&&!stalled){ac.trim=ac.trimNow!=null?ac.trimNow:alpha;ac.trimHold=-1;}}else{ac.trimHold=0;ac.trimNow=alpha;}}
  ac.trim=clamp(ac.trim,-.03,as-.07);
  if(settings.stallGuard){const lim=(as-.04-ac.trim)*AC.Ka/AC.Ke;e=Math.min(e,lim);if(alpha>as-.05)e-=(alpha-(as-.05))*25;}
  const stallRoll=stalled?vnoise(simT*.9,0,77)*8*Math.min(alpha-as+.05,.3):0;
  ac.w.x+=(A*(AC.Ke*e-AC.Ka*(alpha-ac.trim))-(5.2*sA+.6)*ac.w.x)*dt;
  ac.w.z+=(A*(-AC.Kr*a+AC.Kd*beta)+stallRoll-(5.5*sA+.6)*ac.w.z)*dt;
  ac.w.y+=(A*(-AC.Kb*beta-AC.Kru*r)-(3*sA+.6)*ac.w.y)*dt;
  const wl=ac.w.length();if(wl>1e-6){_dq.setFromAxisAngle(_ax.copy(ac.w).multiplyScalar(1/wl),wl*dt);ac.q.multiply(_dq).normalize();}
  ac.alpha=alpha;ac.beta=beta;ac.as=as;ac.stall=stalled;ac.stallWarn=alpha>as-3*DEG&&V>4;ac.ias=V*Math.cos(Math.min(Math.abs(alpha),1.2));
  airContact();
}
const GEAR=[new V3(-1.15,-1.35,.15),new V3(1.15,-1.35,.15),new V3(0,-1.35,-2.15)];
const BODY=[new V3(-5.25,.78,-.55),new V3(5.25,.78,-.55),new V3(0,-.05,-3.05),new V3(0,.4,4.4),new V3(0,1.6,4.3)];
function airContact(){
  for(const b of BODY){_p.copy(b).applyQuaternion(ac.q).add(ac.pos);if(_p.y<surfH(_p.x,_p.z)){
    const gh=groundH(_p.x,_p.z);return crash(gh<.3?'water':(ac.pos.y-surfH(ac.pos.x,ac.pos.z)>3?'terrain':(b.x!==0?'bank':'nose')));}}
  if(propHit(ac.pos.x,ac.pos.y,ac.pos.z,3))return crash('rock');
  if(ac.pos.y-surfH(ac.pos.x,ac.pos.z)<25&&treeHit(ac.pos.x,ac.pos.y-AC.gearH,ac.pos.z))return crash('tree');
  const fl=typeof floatLift==='function'?floatLift():0;let low=1e9;for(const g of GEAR){_p.copy(g);_p.y-=fl;_p.applyQuaternion(ac.q).add(ac.pos);low=Math.min(low,_p.y-surfH(_p.x,_p.z));}
  if(low<=0){if(ac.vel.y>.2){ac.pos.y-=low;return;}touchdown(low);}
}
function checklistState(){const T=TOD[tod];return {carb:ac.carb,mix:!ac.lean,flaps:ac.flaps>=1,light:T.lights>0?ac.light:true,needLight:T.lights>0};}
function touchdown(low){
  axes();const gh=groundH(ac.pos.x,ac.pos.z);
  const onWater=gh<.3;if(onWater&&ac.floats<.9)return crash('water');
  const pitch=Math.asin(clamp(_f.y,-1,1)),bank=Math.atan2(-_r.y,_u.y),sink=-ac.vel.y;
  if(sink>4.2)return crash('hard',sink);
  if(Math.abs(bank)>14*DEG)return crash('bank');
  if(pitch<-5*DEG)return crash('nose');
  const st=stripAt(ac.pos.x,ac.pos.z);
  if(!st&&!onWater&&slopeAt(ac.pos.x,ac.pos.z)>.2)return crash('rough');
  if(!ac.td){const fh=new V3(_f.x,0,_f.z).normalize();
    const dirSign=st?Math.sign(fh.x*st.fx+fh.z*st.fz)||1:1;const l=st?toLocal(st,ac.pos.x,ac.pos.z):null;
    ac.td={strip:st?st.id:null,sink,kt:ac.ias*KT,bankDeg:Math.abs(bank)/DEG,s:l?l.s:0,t:l?l.t:0,dirSign,bounced:false,view:camMode,done:false,check:checklistState(),tod,water:onWater};}
  if(sink>2.3&&!ac.td.bounced){ac.td.bounced=true;ac.vel.y=sink*.35;ac.pos.y-=low-.05;ac.w.x*=.3;snd.thump(.8);
    toast('Bounced! Hold the nose up gently and let it settle.',3);return;}
  snd.thump(clamp(sink/2.5,.25,1));
  ac.pos.y-=low;ac.ground=true;ac.gYaw=Math.atan2(-_f.x,-_f.z);ac.gPitch=clamp(pitch,0,.21);
  const fh=new V3(-Math.sin(ac.gYaw),0,-Math.cos(ac.gYaw));ac.u=Math.max(0,ac.vel.dot(fh));ac.w.set(0,0,0);
  toast(`${onWater?'Splashdown':'Touchdown'} · ${Math.round(ac.td.sink*196.85)} ft/min`,2.2);if(onWater)snd.burst(.5,1800,.6);
}
const _fh=new V3();
function stepGround(dt){
  const st=stripAt(ac.pos.x,ac.pos.z),wet=groundH(ac.pos.x,ac.pos.z)<.25&&ac.floats>=.9,surf=st?st.surf:wet?'water':'rough';
  const fh=_fh.set(-Math.sin(ac.gYaw),0,-Math.cos(ac.gYaw));
  const ua=ac.u-WIND.dot(fh),qd=.5*RHO*ua*Math.abs(ua),f=FLAPS[ac.flaps];
  const rot=clamp((ua/23)**2,0,1.3);
  const tgt=clamp(inp.pitch*.22*rot,0,.21);ac.gPitch+=clamp(tgt-ac.gPitch,-.5*dt,.6*dt);
  const CL=CLof(ac.gPitch,f)*1.1,L=qd*AC.S*CL,N=Math.max(0,AC.mass*G-L);
  const mu={paved:.025,grass:.05,dirt:.06,sand:.075,cinder:.06,rough:.09,water:.13}[surf]??.09,bmu=surf==='paved'?.8:surf==='water'?.25:.6;
  const D=qd*AC.S*(AC.CD0+f.dCD+AC.k*CL*CL),fr=(mu+ac.brake*bmu)*N;
  let acc=(thrust(ac.u)-D)/AC.mass;
  if(ac.u>.01)acc-=fr/AC.mass;else acc=acc*AC.mass>fr?acc-fr/AC.mass:0;
  ac.u=Math.max(0,ac.u+acc*dt);
  const steer=clamp(inp.roll+inp.yaw,-1,1);ac.gYaw+=-steer*.9*smooth(0,3,ac.u)/(1+ac.u/16)*dt;
  ac.pos.addScaledVector(fh,ac.u*dt);
  const gh=groundH(ac.pos.x,ac.pos.z);ac.pos.y=Math.max(gh,0)+AC.gearH+(typeof floatLift==='function'?floatLift():0);
  const bob=gh<.25?1:0;ac.q.setFromEuler(_e.set(ac.gPitch+bob*Math.sin(simT*1.3)*.012,ac.gYaw,bob*Math.sin(simT*1.05)*.02,'YXZ'));ac.vel.copy(fh).multiplyScalar(ac.u);ac.w.set(0,0,0);
  ac.ias=Math.max(0,ua);ac.alpha=ac.gPitch;ac.stall=false;ac.stallWarn=false;ac.trim=.06;
  if(gh<.25&&ac.u>.3&&ac.floats<.9)return crash('water');
  if(!st&&gh>=.25&&ac.u>6&&slopeAt(ac.pos.x,ac.pos.z)>.2)return crash('rough');
  if(ac.u>3&&treeHit(ac.pos.x,gh+.5,ac.pos.z))return crash('tree');
  if(L>AC.mass*G*1.02&&ac.gPitch>.02)liftoff();
}
function liftoff(){
  const fh=new V3(-Math.sin(ac.gYaw),0,-Math.cos(ac.gYaw));ac.ground=false;ac.vel.copy(fh).multiplyScalar(ac.u);ac.vel.y=.6;ac.w.set(.05,0,0);
  ac.trim=clamp(ac.gPitch,.02,.12);
  const st=stripAt(ac.pos.x,ac.pos.z,40);if(st)ac.from=st.id;ac.td=null;
  log.flights++;goal('firstflight');saveL();tip('airborne','You\'re flying. Ease off the stick and let it climb at about 60 knots. The little map shows where you\'re headed.');
}

/* ---------- crash / spawn ---------- */
let spawnQuiet=false,mode='title',camMode='chase',crashT=0,snapCam=true,dest=STRIPS[1];
const REASONS={
  water:['Into the drink','This plane needs a runway or a flat field, not the sea. Unless you pull the red FLOATS handle first: then the sea is fair game.'],
  terrain:['Met the ground','The ground came up faster than expected. Watch altitude near hills, and give mountains room.'],
  hard:['Too hard a landing','Just above the runway, ease back on the stick so the plane settles instead of dropping.'],
  bank:['A wingtip touched','Keep the wings level as you touch down. Small stick moves near the ground.'],
  nose:['Nose first','Touch down on the main wheels with the nose slightly up.'],
  tree:['Into the trees','Trees are taller than they look. Stay over the runway or open ground when low.'],
  rock:['Met the rock','That gap was a little tighter than it looked. Line up early, wings level, and go straight through.'],
  rough:['Too rough here','That ground was too steep or bumpy to land or roll on.'],
};
function crash(why,v){
  if(mode!=='fly')return;axes();const cn={kt:ac.ias*KT,fpm:Math.max(0,-ac.vel.y*196.85),bank:Math.abs(Math.atan2(-_r.y,_u.y))/DEG,pitch:Math.asin(clamp(_f.y,-1,1))/DEG};mode='crashed';crashT=0;snd.thump(1.2);snd.crash();
  smokeBurst.forEach((m,i)=>{m.visible=true;m.position.copy(ac.pos).add(new V3((hash2(i,1,1)-.5)*6,hash2(i,2,1)*3,(hash2(i,3,1)-.5)*6));m.scale.setScalar(.5);m.userData.v=1+hash2(i,4,1)*2;});
  setTimeout(()=>{const [t,b]=REASONS[why];const bad=(x,ok)=>ok?x:`<b style="color:#c2453a">${x}</b>`;
    const extra=`<div class="rows"><span class="k">SPEED</span><span>${bad(Math.round(cn.kt)+' kt',cn.kt>=45&&cn.kt<=62)}</span><span class="s">AIM 50–55</span><span class="k">DESCENT</span><span>${bad(Math.round(cn.fpm)+' ft/min',cn.fpm<500)}</span><span class="s">UNDER 300</span><span class="k">BANK</span><span>${bad(Math.round(cn.bank)+'°',cn.bank<10)}</span><span class="s">UNDER 10°</span><span class="k">NOSE</span><span>${bad((cn.pitch>=0?'up ':'down ')+Math.abs(Math.round(cn.pitch))+'°',cn.pitch>=0&&cn.pitch<12)}</span><span class="s">UP 2–8°</span></div>`;
    showCard(`<div class="who"><img src="${portrait('gus')}" alt=""><div><b>${t}</b><span>GUS PATCHES IT UP · THE MAIL IS STILL IN THE BAG</span></div></div><p>${b}</p>${extra}`,[
      ...(()=>{const landed=STRIPS.filter(s=>(log.fields[s.id]||{}).landings||s.id==='harbor'),near=landed.reduce((a,s)=>Math.hypot(s.x-ac.pos.x,s.z-ac.pos.z)<Math.hypot(a.x-ac.pos.x,a.z-ac.pos.z)?s:a,landed[0]);
        const b=[['Take off from '+near.name,()=>spawnField(near),true]];if(dest)b.push(['Try that approach again',()=>spawnApproach(dest)]);return [b];})()[0]]);},900);
}
function resetAc(){if(typeof refillParcels==='function'){refillParcels();lookDown=false;}if(typeof resetSwitches==='function')resetSwitches();ac.boostT=0;ac.bst=0;ac.gusts=[];ac.ups=[];ac.ust=0;ac.w.set(0,0,0);ac.td=null;ac.brake=0;ac.brakeHeld=false;ac.trimHold=0;ac.ice=0;smokeBurst.forEach(m=>m.visible=false);snapCam=true;}
function intoWindDir(s){return (s.fx*WIND.x+s.fz*WIND.z)<0?1:-1;}
function spawnField(s,dirSign){
  dirSign=dirSign||intoWindDir(s);resetAc();
  const p=toWorld(s,-dirSign*(s.len/2-18),0);
  ac.pos.set(p.x,groundH(p.x,p.z)+AC.gearH,p.z);ac.gYaw=-((s.hdg+(dirSign<0?180:0))*DEG);ac.gPitch=0;ac.u=0;
  ac.q.setFromEuler(_e.set(0,ac.gYaw,0,'YXZ'));ac.vel.set(0,0,0);ac.ground=true;ac.throttle=0;ac.flaps=0;ac.trim=.06;
  ac.from=s.id;ac.lastField=s.id;pickDest(s.id);if(typeof lightStrip==='function')lightStrip(s,2,true);if(spawnQuiet)return;startFly();
  tip('start','Push the throttle lever all the way up to start rolling. Push the stick sideways to steer.',1.2);
}
function approachClear(s,dir){const aimS=-dir*(s.len/2-s.len*.22),gs=Math.tan(4*DEG);for(let d=100;d<=1600;d+=50){const p=toWorld(s,aimS-dir*d,0);if(surfH(p.x,p.z)>s.elev+gs*d-Math.min(25,gs*d*.5))return false;}return true;}
function spawnApproach(s,dirSign){
  if(!dirSign){const w=intoWindDir(s);dirSign=approachClear(s,w)?w:-w;}resetAc();
  const aimS=-dirSign*(s.len/2-s.len*.22),d=1500,gs=Math.tan(4*DEG);
  const p=toWorld(s,aimS-dirSign*d,0);const hdg=(s.hdg+(dirSign<0?180:0))*DEG;
  ac.pos.set(p.x,s.elev+AC.gearH+gs*d,p.z);ac.q.setFromEuler(_e.set(-1*DEG,-hdg,0,'YXZ'));
  ac.vel.set(Math.sin(hdg),-gs,-Math.cos(hdg)).multiplyScalar(30).add(WIND);ac.ground=false;ac.throttle=.12;ac.flaps=1;ac.trim=.02;ac.carb=true;ac.lean=false;
  dest=s;ac.from='__approach';startFly();updSwitches();
  tip('approach0','You\'re on approach. Keep the runway ahead, hold about 55 knots, and follow the lights beside the runway down.',.5);
}
function pickDest(cur){const md=mailDest();if(md){dest=md;return;}const opts=STRIPS.filter(s=>s.id!==cur);opts.sort((a,b)=>((log.fields[a.id]||{}).landings||0)-((log.fields[b.id]||{}).landings||0));dest=opts[0];}
function startFly(){if(settings.tilt){if(!tilt.listening)enableTilt();recenterTilt();setTimeout(recenterTilt,600);}updTiltUI();mode='fly';hideModal();$('title').hidden=true;$('flightUI').hidden=false;snd.init();snd.setOn(settings.sound);
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{});}catch(e){}
  setThrottleUI();updFlaps();updSwitches();refreshBag();mapT=0;
  if(!log.howto){log.howto=true;saveL();showHowTo();}
  else if(mail.active&&!log.met.bea&&ac.lastField==='harbor')setTimeout(meetBea,400);}

/* ---------- landing grades + deliveries ---------- */
function stars(n){return '★'.repeat(n)+'☆'.repeat(3-n);}
function finishLanding(){
  const td=ac.td;td.done=true;if(td.strip)refillParcels();
  if(!td.strip){if(td.water){const first=goal('floatplane',true);addScore(first?250:60);if(first)stamp(1);snd.beep(1175);toast(`Splashdown! The floats did their job. +${first?250:60}${first?' · +1 STAMP':''}\nThrottle up and you can take off from the water too.`,3.5);return;}toast('Off-field landing. Gentle, but find a runway next time.',3);return;}
  const s=stripById(td.strip),dist=td.s*td.dirSign+s.len/2,aim=s.len*.22,fpm=td.sink*196.85;
  let soft=fpm<180?3:fpm<360?2:1,softTxt=fpm<90?'Butter':fpm<180?'Soft':fpm<360?'Firm':'Hard';if(td.bounced){soft=1;softTxt='Bounced';}
  const off=Math.abs(td.t)/(s.wid/2),cen=off<.2?3:off<.5?2:1;
  const zd=dist-aim,zone=dist<0?1:Math.abs(zd)<Math.max(30,s.len*.08)?3:Math.abs(zd)<s.len*.25?2:1;
  const zoneTxt=dist<0?'Short of the runway':Math.abs(zd)<Math.max(30,s.len*.08)?'On the markers':zd<0?`${Math.round(-zd)} m early`:`${Math.round(zd)} m long`;
  const stopped=stripAt(ac.pos.x,ac.pos.z)===s;
  let total=Math.round((soft+cen+zone)/3);if(!stopped)total=Math.max(1,total-1);
  const F=log.fields[s.id]||(log.fields[s.id]={landings:0,best:0});F.landings++;if(chartIsle(isleOfStrip(s),2))setTimeout(()=>toast(`${ISLES[isleOfStrip(s)].name} is on your chart now.`,2.6),1800);F.best=Math.max(F.best,total);
  const fromId=ac.from,isTrip=fromId&&fromId!==s.id&&fromId!=='__approach';
  const ck=td.check,ckOk=ck.carb&&ck.mix&&ck.flaps&&ck.light;
  const news=[];const g=id=>{if(goal(id,true))news.push(GOALS.find(x=>x.id===id).name);};
  g('land_'+s.id);if(STRIPS.every(q=>log.goals['land_'+q.id]))g('hopper');if(isTrip){log.trips++;g('trip');}if(fpm<90&&!td.bounced)g('butter');if(s.id==='ridge'&&total===3)g('ridge3');if(td.view==='cockpit')g('instrument');
  if(ckOk)g('checklist');if(td.tod==='night')g('night');
  if(ckOk&&mail.active)stamp(1);
  const firstHere=F.landings===1,lpts=total*25+(firstHere?150:0);addScore(lpts);addCoins(total*2);
  ac.lastField=s.id;ac.from=s.id;saveL();
  const missed=[!ck.carb&&'carb heat',!ck.mix&&'mixture rich',!ck.flaps&&'flaps',!ck.light&&'landing light'].filter(Boolean).join(', ');
  const ckRow=`<span class="k">CHECKLIST</span><span>${ckOk?'All done'+(mail.active?' · +1 stamp':''):'Missed: '+missed}</span><span class="s">${ckOk?'✓':''}</span>`;
  const here=mail.active?bagFor(s.id):[];
  const homeDone=mail.active&&s.id==='harbor'&&!mail.bag.length;
  const btns=here.length?[[`Deliver the mail (${here.length})`,()=>deliverAt(s),true]]
    :homeDone?[['Hand in the day',endDay,true]]
    :[['Take off from here',()=>spawnField(s),true],['Practice this landing',()=>spawnApproach(s,td.dirSign)],['Keep taxiing',()=>{hideModal();mode='fly';}]];
  btns.splice(1,0,...errandBtns(s));if(s.id==='harbor')btns.splice(1,0,["Gus's garage",()=>shopCard(s)]);
  showCard(`<h2>${stopped?'Landed at':'Rolled off'} ${s.name}</h2><div class="sub">${isTrip?'TRIP FROM '+stripById(fromId).name.toUpperCase()+' · ':''}${stars(total)}</div>
    <div class="rows"><span class="k">TOUCHDOWN</span><span>${Math.round(fpm)} ft/min at ${Math.round(td.kt)} kt · ${softTxt}</span><span class="s">${stars(soft)}</span>
    <span class="k">CENTERLINE</span><span>${off<.2?'Right down the middle':off<.5?'A little off center':'Way off center'}</span><span class="s">${stars(cen)}</span>
    <span class="k">AIM POINT</span><span>${zoneTxt}</span><span class="s">${stars(zone)}</span>${ckRow}<span class="k">SCORE</span><span>+${lpts} · +${total*2} coins${firstHere?' · first landing here':''}</span><span class="s"></span></div>
    ${!stopped?'<p>You ran off the end. Touch down nearer the markers and hold BRAKE.</p>':''}
    ${news.length?`<p><b>New in your logbook:</b> ${news.join(', ')}</p>`:''}`,btns);
  mode='card';
}
function deliverAt(s){
  const here=bagFor(s.id);const queue=[];
  for(const it of here){if(!log.met[it.to])queue.push({kind:'meet',who:it.to});queue.push({kind:'give',it});}
  const step=()=>{const q=queue.shift();
    if(!q){mail.bag=mail.bag.filter(it=>CHARS[it.to].home!==s.id);
      const day=DAYS[mail.day-1];const pick=[];for(const it of here){const out=(day&&day.out&&day.out[it.to])||[];for(const o of out){if(!mail.bag.some(b=>b.item===o.item)){mail.bag.push({...o,from:it.to});pick.push(o);}}}
      saveL();refreshBag();const md=mailDest();if(md)dest=md;
      const homeDone=s.id==='harbor'&&!mail.bag.length;
      const nxt=mail.bag.length?`Next stop: <b>${dest.name}</b>.`:homeDone?'That\'s everything. Mabel is waiting to close the day.':'The bag is empty. Head home to Harbor Field.';
      showCard(`<h2>Mail delivered</h2><div class="sub">${log.stamps} STAMPS ON YOUR ROUTE CARD</div>${pick.length?`<p>Picked up: ${pick.map(o=>`<b>${o.item}</b> for ${CHARS[o.to].name.split(' ')[0]}`).join(', ')}.</p>`:''}<p>${nxt}</p>`,
        homeDone?[['Hand in the day',endDay,true]]:[['Take off',()=>spawnField(s),true],...errandBtns(s),['Look around first',()=>{hideModal();mode='fly';}]]);return;}
    if(q.kind==='meet'){log.met[q.who]=1;saveL();const c=CHARS[q.who];
      showCard(`<div class="who"><img src="${portrait(q.who)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div><p class="say">“${MEET[q.who]}”</p>`,[['Nice to meet you',step,true]]);return;}
    const it=q.it,c=CHARS[it.to];stamp(1);addScore(100);addCoins(15);
    showCard(`<div class="who"><img src="${portrait(it.to)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div><p class="say">“${it.line}”</p><div class="got">DELIVERED: ${it.item.toUpperCase()} · +1 STAMP · +100 · +15 COINS</div>`,[['You\'re welcome',step,true]]);};
  step();
}
function offerDay(after){
  mode=mode==='fly'?'card':mode;
  const day=DAYS[mail.day-1];
  if(!day){showCard(`<div class="who"><img src="${portrait('mabel')}" alt=""><div><b>Mabel Ostrander</b><span>POSTMASTER · HARBOR FIELD</span></div></div><p class="say">“No mail today. Every island on the chain is caught up. Go and enjoy the sky.”</p>`,[['Go flying',after,true]]);return;}
  const meet=!log.met.mabel;if(meet)log.met.mabel=1;saveL();
  const list=day.items.map(it=>`<b>${it.item}</b> for ${CHARS[it.to].name}, ${stripById(CHARS[it.to].home).name}`).join('<br>');
  showCard(`<div class="who"><img src="${portrait('mabel')}" alt=""><div><b>Mabel Ostrander</b><span>POSTMASTER · ${mail.day>6?'WEEK '+Math.ceil(mail.day/6)+' · DAY '+((mail.day-1)%6+1):'DAY '+mail.day} OF 6</span></div></div>
    ${meet?`<p class="say">“${MEET.mabel}”</p>`:''}<p class="say">“${day.intro}”</p><p>${list}</p>${(spawnDrops(),dropLine())}`,
    [['Load the bag',()=>{mail.bag=day.items.map(x=>({...x}));mail.active=true;saveL();syncSites();parcelsLeft=parcelCap();updParcelUI();refreshBag();after();},true],['Just flying today',()=>{mail.active=false;clearDrops();saveL();refreshBag();after();}]]);
}
function meetBea(){if(mode!=='fly'||log.met.bea)return;log.met.bea=1;saveL();mode='card';
  showCard(`<div class="who"><img src="${portrait('bea')}" alt=""><div><b>Bea Hollis</b><span>RETIRED MAIL PILOT · HARBOR FIELD</span></div></div><p class="say">“${MEET.bea}”</p><p>Bea's logbook is in the pause menu whenever you want it.</p>`,[['Thanks, Bea',()=>{hideModal();mode='fly';},true],['Open the logbook',()=>bea(-1)]]);}
function endDay(){const day=DAYS[mail.day-1];mail.active=false;mail.bag=[];clearDrops();addCoins(40);mail.day++;stamp(2);if(mail.day>6)goal('week',true);if(mail.day>12)goal('week2',true);if(mail.day>18)goal('week3',true);saveL();refreshBag();
  showCard(`<div class="who"><img src="${portrait('mabel')}" alt=""><div><b>Mabel Ostrander</b><span>END OF DAY · +2 STAMPS</span></div></div><p class="say">“${day?day.outro:'Good flying.'}”</p><div class="got">${log.stamps} STAMPS ON YOUR ROUTE CARD · +40 COINS</div>`,
    [[mail.day<=DAYS.length?'Start the next day':'Keep flying',()=>{if(mail.day<=DAYS.length)offerDay(()=>spawnField(STRIPS[0]));else{hideModal();mode='fly';}},true],['Free flight',()=>{hideModal();mode='fly';pickDest('harbor');}]]);}
function goal(id,quiet){if(log.goals[id])return false;log.goals[id]=Date.now();saveL();if(!quiet){const g=GOALS.find(x=>x.id===id);toast('Logbook: '+g.name,2.5);}return true;}

/* ---------- tips & toast ---------- */
let toastT=0;
const petSay=s=>typeof petName==='function'&&petName()!=='Biscuit'?String(s).replace(/Biscuit/g,petName()):s;
function toast(msg,sec=3){msg=petSay(msg);const t=$('toast');t.textContent=msg;fixNums(t);t.hidden=false;toastT=sec;t.classList.toggle('up',!$('stallBan').hidden);}
const tipQ=[];
function tip(id,text,delay=0){if(!settings.tips||log.tips[id]||tipQ.some(q=>q.id===id))return;tipQ.push({id,text,delay});}
function runTips(dt){if(!tipQ.length||toastT>0.5)return;const q=tipQ[0];q.delay-=dt;if(q.delay>0)return;tipQ.shift();log.tips[q.id]=1;saveL();toast(q.text,6.5);}

/* ---------- glide guidance ---------- */
function glide(s){
  const fx=-Math.sin(ac.gYaw),fz=-Math.cos(ac.gYaw);axes();const hx=ac.ground?fx:_f.x,hz=ac.ground?fz:_f.z;
  const dirSign=(hx*s.fx+hz*s.fz)>=0?1:-1,aimS=-dirSign*(s.len/2-s.len*.22),l=toLocal(s,ac.pos.x,ac.pos.z);
  const along=(aimS-l.s)*dirSign,lat=l.t*dirSign;
  return {dirSign,along,lat:Math.atan2(lat,Math.max(along,1)),v:Math.atan2(ac.pos.y-AC.gearH-s.elev,Math.max(along,1)),active:!ac.ground&&along>60&&along<7000&&Math.abs(Math.atan2(lat,Math.max(along,1)))<30*DEG};
}
const PAPI_T=[4.8,4.3,3.7,3.2];
function updPAPI(){for(const P of PAPIS){const s=P.s,l=toLocal(s,ac.pos.x,ac.pos.z),aimS=-P.dir*(s.len/2-s.len*.22),along=(aimS-l.s)*P.dir;
  const vis=along>20&&along<7000;P.g.visible=vis;if(!vis)continue;
  const dist=P.base.distanceTo(camera.position);P.g.scale.setScalar(clamp(dist*.006,1,30));
  const ang=Math.atan2(ac.pos.y-AC.gearH-s.elev,along)/DEG;P.lights.forEach((m,j)=>m.material.color.setHex(ang>PAPI_T[j]?0xfff4dc:0xff3b30));}}

/* ---------- tilt steering ---------- */
// Gravity in screen space from deviceorientation (beta/gamma are the same on iOS and Android).
// Bank = how far the phone is turned like a steering wheel. Nose = tip toward/away from you, measured from where you held it at the start (recenter).
const tilt={listening:false,ok:false,roll:0,pitch:0,p0:null,raw:null};
const orientAngle=()=>{if(ROT)return 90;const a=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(window.orientation||0);return ((a%360)+360)%360;};
function onOrient(e){if(e.beta==null||e.gamma==null)return;const b=e.beta*DEG,gm=e.gamma*DEG;
  const ux=-Math.cos(b)*Math.sin(gm),uy=Math.sin(b),uz=Math.cos(b)*Math.cos(gm),a=orientAngle();
  let sx,sy;if(a===90){sx=-uy;sy=ux;}else if(a===270){sx=uy;sy=-ux;}else if(a===180){sx=-ux;sy=-uy;}else{sx=ux;sy=uy;}
  const roll=Math.asin(clamp(-sx,-1,1)),pit=Math.atan2(uz,sy);tilt.raw={roll,pit};tilt.ok=true;if(tilt.p0==null)tilt.p0=pit;
  const dz=(v,d)=>Math.abs(v)<d?0:v-Math.sign(v)*d;
  tilt.roll=lerp(tilt.roll,clamp(dz(roll,2*DEG)/(24*DEG),-1,1),.6);tilt.pitch=lerp(tilt.pitch,clamp(dz(pit-tilt.p0,2*DEG)/(18*DEG),-1,1),.6);}
function recenterTilt(){if(tilt.raw)tilt.p0=tilt.raw.pit;tilt.pitch=0;}
async function enableTilt(){
  try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw new Error('denied');}
    if(!tilt.listening){addEventListener('deviceorientation',onOrient);tilt.listening=true;}
    tilt.p0=null;setTimeout(()=>{if(!tilt.ok&&settings.tilt)toast('No tilt sensor found here. The touch stick still works.',3.5);},1500);return true;}
  catch(e){settings.tilt=false;saveS();updTiltUI();toast('Tilt needs motion access. You can allow it next time you switch Tilt on.',4);return false;}}
function disableTilt(){if(tilt.listening){removeEventListener('deviceorientation',onOrient);tilt.listening=false;}tilt.ok=false;tilt.roll=tilt.pitch=0;}
function updTiltUI(){const b=$('center');if(b)b.hidden=!settings.tilt;const h=$('ringHint');if(h)h.textContent=settings.tilt?'TILT TO FLY · OR DRAG HERE':'STICK · DRAG ANYWHERE';}

/* ---------- input ---------- */
const stick={id:null,ox:0,oy:0,x:0,y:0},R_STICK=54;
const stickEl=$('stick'),ring=$('ring'),knob=$('knob');
function placeRingIdle(){const r=rectL(stickEl);ring.style.left=(r.width*.55)+'px';ring.style.top=(r.height*.55)+'px';ring.classList.add('idle');knob.style.transform='';}
stickEl.addEventListener('pointerdown',e=>{if(stick.id!==null)return;stick.id=e.pointerId;const r=rectL(stickEl),P=ptL(e);stick.ox=P.x;stick.oy=P.y;stick.x=stick.y=0;
  ring.style.left=(P.x-r.left)+'px';ring.style.top=(P.y-r.top)+'px';ring.classList.remove('idle');$('ringHint').hidden=true;try{stickEl.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
stickEl.addEventListener('pointermove',e=>{if(e.pointerId!==stick.id)return;const P=ptL(e);let dx=(P.x-stick.ox)/R_STICK,dy=(P.y-stick.oy)/R_STICK;const L=Math.hypot(dx,dy);if(L>1){dx/=L;dy/=L;}
  stick.x=dx;stick.y=dy;knob.style.transform=`translate(${dx*R_STICK}px,${dy*R_STICK}px)`;});
const endStick=e=>{if(e.pointerId!==stick.id)return;stick.id=null;stick.x=stick.y=0;placeRingIdle();};
stickEl.addEventListener('pointerup',endStick);stickEl.addEventListener('pointercancel',endStick);
/* throttle quadrant lever: grab the knob and push it up or pull it back; tap the track to jump it there */
const thrEl=$("thr"),THR_T=22,THR_B=36;let thrId=null,thrGrab=null;
const thrSpan=()=>rectL(thrEl).height-THR_T-THR_B;
function thrYOf(t){const r=rectL(thrEl);return r.bottom-THR_B-t*thrSpan();}
function thrFromY(y){const r=rectL(thrEl);ac.throttle=clamp((r.bottom-THR_B-y)/thrSpan(),0,1);setThrottleUI();}
thrEl.addEventListener('pointerdown',e=>{thrId=e.pointerId;try{thrEl.setPointerCapture(e.pointerId);}catch(_){}
  const ky=thrYOf(ac.throttle),py=ptL(e).y;thrGrab=Math.abs(py-ky)<26?py-ky:0;if(!thrGrab&&Math.abs(py-ky)>=26)thrFromY(py);e.preventDefault();});
thrEl.addEventListener('pointermove',e=>{if(e.pointerId===thrId)thrFromY(ptL(e).y-thrGrab);});
thrEl.addEventListener('pointerup',e=>{if(e.pointerId===thrId)thrId=null;});thrEl.addEventListener('pointercancel',()=>thrId=null);
function setThrottleUI(){thrEl.style.setProperty('--t',ac.throttle.toFixed(4));$('thrPct').textContent=Math.round(ac.throttle*100)+'%';}
/* flap lever: three notches, 0 at the top (up), 2 at the bottom (full). Drag or tap a notch; F steps through them */
const flapEl=$("flapL"),FLAP_Y=[20,34,48];let flapId=null;
function setFlaps(n){n=clamp(n,0,2);if(n===ac.flaps)return;ac.flaps=n;updFlaps();snd.clunk();
  if(n)tip('flaps','Flaps give more lift and more drag, so you can fly slower. 1 for takeoff and approach, 2 for landing. Bea\'s logbook has the details.');}
function flapFromY(y){const r=rectL(flapEl),ly=y-r.top;let bi=0;FLAP_Y.forEach((v,i)=>{if(Math.abs(ly-v)<Math.abs(ly-FLAP_Y[bi]))bi=i;});setFlaps(bi);}
flapEl.addEventListener('pointerdown',e=>{flapId=e.pointerId;try{flapEl.setPointerCapture(e.pointerId);}catch(_){}flapFromY(ptL(e).y);e.preventDefault();});
flapEl.addEventListener('pointermove',e=>{if(e.pointerId===flapId)flapFromY(ptL(e).y);});
flapEl.addEventListener('pointerup',()=>flapId=null);flapEl.addEventListener('pointercancel',()=>flapId=null);
flapEl.querySelectorAll('.fd').forEach((el,i)=>el.style.top=FLAP_Y[i]+'px');
function updFlaps(){$('flapH').style.top=FLAP_Y[ac.flaps]+'px';flapEl.querySelectorAll('.fd').forEach((el,i)=>el.classList.toggle('on',i===ac.flaps));}
const brk=$('brake');const bOn=e=>{ac.brakeHeld=true;brk.classList.add('on');if(e&&e.preventDefault)e.preventDefault();},bOff=()=>{ac.brakeHeld=false;brk.classList.remove('on');};
brk.addEventListener('pointerdown',bOn);brk.addEventListener('pointerup',bOff);brk.addEventListener('pointercancel',bOff);brk.addEventListener('pointerleave',bOff);
/* metal toggle switches: bat handle up = on */
function updSwitches(){$('swCarb').classList.toggle('on',ac.carb);$('swCarb').classList.toggle('warn',!ac.carb&&ac.ice>.25);
  $('swMix').classList.toggle('on',!ac.lean);$('swLight').classList.toggle('on',ac.light);}
$('swCarb').addEventListener('click',()=>{ac.carb=!ac.carb;updSwitches();snd.flick();});
$('swMix').addEventListener('click',()=>{ac.lean=!ac.lean;updSwitches();snd.flick();if(ac.lean)tip('lean','Leaning the mixture gives a little more power up high. Below 2,000 ft, keep it RICH.');});
$('swLight').addEventListener('click',()=>{ac.light=!ac.light;updSwitches();snd.flick();});
/* the rail: little buttons down the left edge that fold the panels away so you can take in the view */
function railIcon(rows,pal){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const k=r[i];if(k!=='.'&&pal[k]){x.fillStyle=pal[k];x.fillRect(i,j,1,1);}}});return c.toDataURL();}
const RICON={
  map:railIcon(['................','..aaa..bbb..aaa.','..aca..bcb..aca.','..acaa.bcb.aaca.','..acca.bccbacca.','..accab.bccbcca.','..acdcbbbccdcca.','..accdbccbcdcca.','..acccbdcbbccca.','..acccbcdcbccca.','..acccbccdbccca.','..aaaabbbbbaaaa.','................','................','................','................'].slice(0,16),{a:'#e9d3b0',b:'#c9b08a',c:'#7fae4f',d:'#e5483b'}),
  job:railIcon(['................','................','.aaaaaaaaaaaaaa.','.abbaaaaaaaabba.','.abcbbaaaabbcba.','.abccdbbbbdccba.','.abcccdddddccba.','.abccccccccccba.','.abccccccccccba.','.abccccccccccba.','.abccccccccccba.','.abbbbbbbbbbbba.','.aaaaaaaaaaaaaa.','................','................','................'],{a:'#241c2e',b:'#e9d3b0',c:'#f5e8cf',d:'#e2703f'}),
  eng:railIcon(['................','.......aa.......','.......ab.......','.......ab.......','......aabb......','.....aabbbb.....','......a..b......','....cccccccc....','...cddddddddc...','..cdde....eddc..','..cde.ffff.edc..','..cde.ffff.edc..','..cdde....eddc..','...cddddddddc...','....cccccccc....','................'],{a:'#9a96a2',b:'#d8d2c8',c:'#15121a',d:'#3a3344',e:'#55505c',f:'#cfc4b2'}),
  drop:railIcon(['.....aabbaa.....','...abbaabbaab...','..abbaabbaabba..','.aaaaaaaaaaaaaa.','.c....c..c....c.','..c...c..c...c..','...c..c..c..c...','....c.c..c.c....','.....cc..cc.....','.....dddddd.....','.....dedded.....','.....eeeeee.....','.....dedded.....','.....dddddd.....','................','................'],{a:'#d8463a',b:'#f6f1e4',c:'#3a3030',d:'#b07a48',e:'#f4e4c8'}),
  chk:railIcon(['................','.....aaaaaa.....','..bbbaccccabbb..','..bdddddddddddb.','..bdeedfffffdb..','..bdeedddddddb..','..bdddddddddddb.','..bdeedfffffdb..','..bdeedddddddb..','..bdddddddddddb.','..bd..dfffffdb..','..bd..dddddddb..','..bdddddddddddb.','..bbbbbbbbbbbbb.','................','................'].map(r=>r.slice(0,16)),{a:'#9a96a2',b:'#7a4a1a',c:'#d8d2c8',d:'#f5e8cf',e:'#5fbf5a',f:'#8a8090'}),
  fun:railIcon(['................','................','..aaaaaaaaaaaa..','..abbbbbbbbbba..','..ab.c....c.ba..','..ab.c....c.ba..','..ab.c....c.ba..','..ab.c....d.ba..','..abeee..eeeba..','..abeee..eeeba..','..abeee..eeeba..','..ab.d....c.ba..','..abbbbbbbbbba..','..aaaaaaaaaaaa..','................','................'],{a:'#15121a',b:'#3a3344',c:'#f4f2f8',d:'#e5483b',e:'#9a96a2'}),
  wind:railIcon(['................','................','.......aaaa.....','..........aa....','...........a....','.aaaaaaaaaa.....','................','..aaaaaaaaaaaa..','..............a.','.............a..','.aaaaaaaaaaa....','................','....aaaaaa......','..........a.....','.........a......','................'],{a:'#7a4a1a'})};
const PANELS={map:['rMap','mapc'],job:['rJob','job'],eng:['rEng','eng'],fun:['rFun','fun'],chk:['rChk','check'],drop:['rDrop','dropUI']};
if(!settings.panels)settings.panels={map:true,job:true,eng:true,drop:true};if(settings.panels.fun==null)settings.panels.fun=true;
function applyPanels(){for(const [k,[b,el]] of Object.entries(PANELS)){$(b).classList.toggle('on',!!settings.panels[k]);if(k!=='drop'&&k!=='chk')$(el).hidden=!settings.panels[k];}updPanels();}
function updPanels(){const ad=activeDrops().length>0,air=mode==='fly'&&!ac.ground,du=$('dropUI'),show=ad&&air&&!!settings.panels.drop;if(du.hidden===show)du.hidden=!show;
  const rd=$('rDrop');if(rd.hidden===ad)rd.hidden=!ad;
  const near=ad&&nearestDrop(ac.pos.x,ac.pos.z).dist<2200;rd.classList.toggle('nudge',near&&!settings.panels.drop);
}
for(const [k,[b]] of Object.entries(PANELS)){$(b).innerHTML=`<img src="${RICON[k]}" alt="">`;$(b).addEventListener('click',e=>{e.stopPropagation();settings.panels[k]=!settings.panels[k];saveS();applyPanels();snd.click();});}
const VIEWS=['chase','cockpit'],VNAME={chase:'CHASE',cockpit:'COCKPIT'};
function setView(v){camMode=v;$('view').textContent=VNAME[v];snapCam=true;camera.fov=v==='chase'?58:70;camera.near=v==='chase'?.4:.15;camera.updateProjectionMatrix();postMat.uniforms.cNear.value=camera.near;
  if(v==='cockpit')tip('cockpit','Cockpit view. Left: speed, attitude, heading. Right: altitude, climb, engine RPM. The line-up meter appears up top on approach.');}
$('view').addEventListener('click',()=>setView(VIEWS[(VIEWS.indexOf(camMode)+1)%VIEWS.length]));
$('pause').addEventListener('click',()=>{if(mode==='fly')openMenu();});
$('job').addEventListener('click',()=>{if(mode!=='fly')return;if(mail.active)mailCard();else{mode='paused';bigMap();}});
$('task').addEventListener('click',e=>{e.stopPropagation();if(mode!=='fly')return;if(mail.active)mailCard();else{mode='paused';bigMap();}});
setInterval(()=>{if(typeof updTask==='function')updTask();},1000);
$('center').addEventListener('click',()=>{recenterTilt();toast('Tilt centered. Hold the phone like this to fly level.',2);});
$('dest').addEventListener('click',()=>{const i=STRIPS.indexOf(dest);dest=STRIPS[(i+1)%STRIPS.length];toast('Heading for '+dest.name,1.6);});
$('mapc').addEventListener('click',()=>{if(mode==='fly'){mode='paused';bigMap();}});
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if($('chartOv')&&(e.code==='Escape'||e.code==='KeyM')){closeChart();return;}if(mode!=='fly')return;
  if(e.code==='KeyF')setFlaps((ac.flaps+1)%3);if(e.code==='KeyV')$('view').click();if(e.code==='KeyL')toggleLook();if(e.code==='KeyG')doDrop();if(e.code==='KeyB')bOn();if(e.code==='KeyM'){mode='paused';bigMap();}
  if(e.code==='KeyC')$('swCarb').click();if(e.code==='KeyT')recenterTilt();if(e.code==='KeyH')$('swLight').click();if(e.code==='KeyJ')$('swSearch').click();if(e.code==='KeyK')$('swSmoke').click();if(e.code==='KeyO')$('swFloat').click();if(e.code==='KeyR')keyMic();if(e.code==='KeyN')honk();if(e.code==='KeyU')useUpdraft();
  if(e.code==='Escape'||e.code==='KeyP')openMenu();if(e.code.startsWith('Arrow'))e.preventDefault();});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyB')bOff();});
const kb={p:0,r:0};
function readInput(dt){
  const tp=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0),tr=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0);
  kb.p+=clamp(tp-kb.p,-3*dt,3*dt);kb.r+=clamp(tr-kb.r,-3*dt,3*dt);
  if(keys.KeyW||keys.ShiftLeft){ac.throttle=clamp(ac.throttle+dt*.6,0,1);setThrottleUI();}
  if(keys.KeyS||keys.ControlLeft){ac.throttle=clamp(ac.throttle-dt*.6,0,1);setThrottleUI();}
  const ex=v=>Math.sign(v)*Math.pow(Math.abs(v),1.3);
  const useTilt=stick.id===null&&settings.tilt&&tilt.ok;const sx=stick.id!==null?stick.x:useTilt?tilt.roll:kb.r,sy=stick.id!==null?stick.y:useTilt?tilt.pitch:kb.p;
  inp.roll=ex(sx);inp.pitch=ex(sy)*(settings.invert?-1:1);inp.yaw=(keys.KeyE?1:0)-(keys.KeyQ?1:0);
  ac.brake=ac.brakeHeld?Math.min(1,ac.brake+dt*1.25):0;brk.style.setProperty('--b',Math.round(ac.brake*100)+'%');
}

/* ---------- audio ---------- */
const snd={ctx:null,
  init(){if(this.ctx)return;try{const AC_=window.AudioContext||window.webkitAudioContext;this.ctx=new AC_();}catch(e){return;}
    const c=this.ctx;this.master=c.createGain();this.master.gain.value=settings.sound?.5:0;this.master.connect(c.destination);
    this.o1=c.createOscillator();this.o1.type='triangle';this.o2=c.createOscillator();this.o2.type='sawtooth';this.dr=0;this.dv=0;
    this.lp=c.createBiquadFilter();this.lp.type='lowpass';this.lp.frequency.value=500;this.eg=c.createGain();this.eg.gain.value=0;
    const g2=c.createGain();g2.gain.value=.3;this.o1.connect(this.lp);this.o2.connect(g2);g2.connect(this.lp);this.am=c.createGain();this.am.gain.value=.8;this.lp.connect(this.am);this.am.connect(this.eg);this.eg.connect(this.master);
    this.lfo=c.createOscillator();this.lfo.type='sine';this.lfo.frequency.value=9;this.lfoG=c.createGain();this.lfoG.gain.value=.2;this.lfo.connect(this.lfoG);this.lfoG.connect(this.am.gain);this.lfo.start();this.o1.start();this.o2.start();
    const buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.buf=buf;
    this.noise=c.createBufferSource();this.noise.buffer=buf;this.noise.loop=true;this.bp=c.createBiquadFilter();this.bp.type='lowpass';this.bp.frequency.value=380;this.bp.Q.value=.3;
    this.wg=c.createGain();this.wg.gain.value=0;this.noise.connect(this.bp);this.bp.connect(this.wg);this.wg.connect(this.master);this.noise.start();
    this.ho=c.createOscillator();this.ho.type='triangle';this.ho.frequency.value=470;this.hg=c.createGain();this.hg.gain.value=0;this.ho.connect(this.hg);this.hg.connect(this.master);this.ho.start();music.start();},
  update(rpm,ias,stall,run,rough){if(!this.ctx)return;const t=this.ctx.currentTime;
    this.dv+=(Math.random()-.5)*.02-this.dr*.02;this.dv*=.9;this.dr+=this.dv;const irr=1+this.dr*.6+Math.sin(t*1.7)*.012+Math.sin(t*.43)*.018;
    const wob=(rough>0?1+Math.sin(t*23)*.08*rough+Math.sin(t*7.3)*.06*rough:1)*irr,f=(36+rpm*62)*wob;
    this.lfo.frequency.setTargetAtTime(f*.25*(1+this.dr),t,.08);this.lfoG.gain.setTargetAtTime(.14+Math.abs(Math.sin(t*.9))*.12,t,.2);
    this.o1.frequency.setTargetAtTime(f,t,.05);this.o2.frequency.setTargetAtTime(f*.5,t,.05);this.lp.frequency.setTargetAtTime(180+rpm*420,t,.1);
    const cut=rough>0&&Math.sin(t*11)>.6?1-.4*rough:1;
    this.eg.gain.setTargetAtTime(run?(.03+rpm*.038)*cut*settings.engVol:0,t,.04);this.bp.frequency.setTargetAtTime(220+Math.min(ias,60)*4,t,.3);this.wg.gain.setTargetAtTime(run?Math.min(.045,ias*ias/60000):0,t,.4);
    this.hg.gain.setTargetAtTime(stall&&run&&((t*2.2)%1<.45)?.014:0,t,.03);},
  burst(v,lp,dur){if(!this.ctx)return;const c=this.ctx,s=c.createBufferSource();s.buffer=this.buf;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;const g=c.createGain(),t=c.currentTime;
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t,Math.random());s.stop(t+dur+.05);},
  beep(f){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.2);},
  thump(v=1){this.burst(.6*v,260,.25);},crash(){this.burst(.5,900,1.2);},click(){this.burst(.25,3000,.03);},toot(){if(!this.ctx)return;const c=this.ctx;for(let k=0;k<2;k++){const t=c.currentTime+.02+k*.75,g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.08);g.gain.setValueAtTime(.3,t+.5);g.gain.linearRampToValueAtTime(0,t+.65);lp.connect(g);g.connect(this.master);
    for(const f of [k?98:110,k?147:165]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(lp);o.start(t);o.stop(t+.7);}}},honk(){if(!this.ctx)return;/* a semi-truck air horn: a short blast then a long one. Two brassy sawtooths a sour third apart, driven through a soft clipper
    for the blare, a burst of air hiss at the start of each honk, and a little upward bend as the air pressure comes up */
    const c=this.ctx,t0=c.currentTime+.02,cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cv[i]=Math.tanh(x*2.6);}
    for(let k=0;k<2;k++){const t=t0+(k?.29:0),D=k?.62:.18,ws=c.createWaveShaper(),pk=c.createBiquadFilter(),lp=c.createBiquadFilter(),g=c.createGain();ws.curve=cv;
      pk.type='peaking';pk.frequency.value=1150;pk.Q.value=1.1;pk.gain.value=7;lp.type='lowpass';lp.frequency.value=3600;ws.connect(pk);pk.connect(lp);
      g.gain.value=0;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.03);g.gain.setValueAtTime(.19,t+D-.06);g.gain.linearRampToValueAtTime(0,t+D);lp.connect(g);g.connect(this.master);
      const pre=c.createGain();pre.gain.value=.55;pre.connect(ws);
      for(const f of [277,349]){const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*.94,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);o.frequency.setValueAtTime(f,t+D-.05);o.frequency.linearRampToValueAtTime(f*.97,t+D);o.connect(pre);o.start(t);o.stop(t+D+.02);}
      const nb=c.createBuffer(1,Math.floor(c.sampleRate*.12),c.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=(Math.random()*2-1)*(1-i/nd.length);
      const ns=c.createBufferSource(),nf=c.createBiquadFilter(),ng=c.createGain();ns.buffer=nb;nf.type='bandpass';nf.frequency.value=2400;nf.Q.value=.7;ng.gain.value=.12;ns.connect(nf);nf.connect(ng);ng.connect(this.master);ns.start(t);}},squelch(){this.burst(.3,5200,.07);setTimeout(()=>this.burst(.12,2600,.05),70);},hiss(v=1){this.burst(.45*v,3600,.9);setTimeout(()=>this.burst(.3*v,900,.15),650);},flick(){this.burst(.4,7000,.012);setTimeout(()=>this.burst(.22,2200,.025),22);},clunk(){this.burst(.35,1400,.05);setTimeout(()=>this.burst(.25,600,.08),40);},
  setOn(v){if(this.master)this.master.gain.value=v?.5:0;if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();}};

/* ---------- the radio: five generative stations (all WebAudio), one dial on the flight screen ---------- */
const STATIONS=[
  {id:'lofi',fq:'88.1',name:'Saltwhistle Lo-fi',desc:'Dusty keys, brushed drums, vinyl hiss.',bpm:72,sw:.16,lp:2400,minor:false},
  {id:'tide',fq:'91.4',name:'Slow Tide',desc:'Long soft pads and bells, no drums. For drifting.',bpm:56,sw:0,lp:1900,minor:false},
  {id:'jazz',fq:'94.7',name:'Harbor Jazz',desc:'Walking bass, ride cymbal and a trio that has been at it all night.',bpm:104,sw:.26,lp:3200,minor:false},
  {id:'bounce',fq:'99.2',name:'Island Bounce',desc:'Steel pan, off-beat chords and a shaker. Sunny and quick.',bpm:112,sw:.08,lp:3600,minor:false},
  {id:'night',fq:'102.5',name:'Night Shift',desc:'Deep and slow. Sub bass, vibes and a heartbeat kick.',bpm:64,sw:.12,lp:1600,minor:true},
];
const stationAt=id=>STATIONS.find(s=>s.id===id)||STATIONS[0];
const music={on:false,
  start(){const c=snd.ctx;if(!c||this.out)return;
    this.out=c.createGain();this.out.gain.value=0;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;lp.Q.value=.4;this.lp=lp;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-22;comp.ratio.value=3;this.bus=c.createGain();this.bus.gain.value=1;
    this.bus.connect(lp);lp.connect(comp);comp.connect(this.out);this.out.connect(snd.master);
    // a little echo for the slow stations
    this.dly=c.createDelay(1);this.dly.delayTime.value=.42;this.fb=c.createGain();this.fb.gain.value=.32;this.wet=c.createGain();this.wet.gain.value=0;
    this.bus.connect(this.dly);this.dly.connect(this.fb);this.fb.connect(this.dly);this.dly.connect(this.wet);this.wet.connect(lp);
    this.wow=c.createOscillator();this.wow.frequency.value=.55;this.wowG=c.createGain();this.wowG.gain.value=7;this.wow.connect(this.wowG);this.wow.start();
    // vinyl: soft hiss plus sparse crackle
    const n=c.sampleRate*3,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++){d[i]=(Math.random()*2-1)*.18;if(Math.random()<.00035)d[i]=(Math.random()<.5?-1:1)*(.5+Math.random()*.5);}
    const v=c.createBufferSource();v.buffer=b;v.loop=true;const vf=c.createBiquadFilter();vf.type='bandpass';vf.frequency.value=2600;vf.Q.value=.6;this.vg=c.createGain();this.vg.gain.value=.05;v.connect(vf);vf.connect(this.vg);this.vg.connect(this.out);v.start();
    this.noise=snd.buf;this.beat=c.currentTime+.3;this.step=0;this.bar=0;this.tune(settings.station,true);
    this.timer=setInterval(()=>this.tick(),70);this.setVol();},
  setVol(){if(!this.out)return;const v=(settings.music??.5);this.out.gain.setTargetAtTime(v*.55,snd.ctx.currentTime,.4);},
  tune(id,quiet){this.st=stationAt(id);const S=this.st,c=snd.ctx;this.bpm=S.bpm;this.bar=0;this.step=0;this.pickKey();this.pickProg();if(!c||!this.lp)return;const t=c.currentTime;
    this.lp.frequency.setTargetAtTime(S.lp,t,.2);this.wet.gain.setTargetAtTime(S.id==='tide'||S.id==='night'?.28:S.id==='lofi'?.08:0,t,.3);this.vg.gain.setTargetAtTime(S.id==='lofi'?.05:S.id==='jazz'?.035:.012,t,.3);
    this.dly.delayTime.setTargetAtTime(60/S.bpm*.75,t,.1);
    if(!quiet&&(settings.music??.5)>0&&settings.sound){// between stations: a short burst of tuning static
      const s=c.createBufferSource();s.buffer=this.noise;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=1.4;f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(3200,t+.35);
      const g=c.createGain();g.gain.setValueAtTime(.0,t);g.gain.linearRampToValueAtTime(.12*(settings.music??.5)*2,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+.45);s.connect(f);f.connect(g);g.connect(snd.master);s.start(t,Math.random());s.stop(t+.5);
      this.bus.gain.setValueAtTime(0,t);this.bus.gain.setTargetAtTime(1,t+.35,.15);this.beat=t+.4;}},
  pickKey(){this.key=[0,2,3,5,7,8,10][(Math.random()*7)|0]-2;},
  PROGS:[[[5,'M9'],[4,'m7'],[2,'m9'],[0,'M7']],[[2,'m9'],[7,'13'],[0,'M9'],[9,'m9']],[[9,'m9'],[5,'M7'],[0,'M9'],[7,'6']],[[0,'M9'],[9,'m7'],[2,'m9'],[7,'9sus']],[[4,'m7'],[9,'m7'],[2,'m9'],[7,'13']]],
  BRIGHT:[[[0,'M7'],[5,'M7'],[7,'9sus'],[0,'6']],[[0,'6'],[9,'m7'],[5,'M9'],[7,'13']],[[5,'M7'],[7,'6'],[0,'M9'],[0,'M9']]],
  MINOR:[[[0,'m9'],[8,'M7'],[3,'M9'],[10,'9sus']],[[0,'m9'],[5,'m7'],[8,'M9'],[7,'m7']],[[0,'m7'],[0,'m9'],[8,'M7'],[10,'6']]],
  Q:{M7:[0,4,7,11],M9:[0,4,11,14],m7:[0,3,7,10],m9:[0,3,10,14],'13':[0,4,10,21],'6':[0,4,9,14],'9sus':[0,5,10,14]},
  pickProg(){const id=this.st?this.st.id:'lofi',L=id==='bounce'?this.BRIGHT:id==='night'?this.MINOR:this.PROGS;this.prog=L[(Math.random()*L.length)|0];},
  hz(m){return 440*Math.pow(2,(m-69)/12);},
  tick(){const c=snd.ctx;if(!c||!this.out)return;const on=(settings.music??.5)>0&&settings.sound;
    const sp=60/this.bpm/4,sw=this.st.sw;while(this.beat<c.currentTime+.35){if(on)this.play(this.step,this.beat);
      this.beat+=sp*(this.step%2?1-sw:1+sw);this.step++;if(this.step>=16){this.step=0;this.bar++;if(this.bar%8===0)this.pickProg();if(this.bar%32===0)this.pickKey();}}},
  play(st,t){const ch=this.prog[this.bar%4],root=48+this.key+ch[0],iv=this.Q[ch[1]],beat=60/this.bpm,R=Math.random,id=this.st.id,pent=[0,2,4,7,9,12,14,16];
    if(id==='lofi'){
      if(st===0){iv.forEach((x,i)=>this.keys(root+12+x,t+i*.018+R()*.01,beat*3.7,.07));this.bass(root-12,t,.9);}
      if(st===10&&R()<.7)this.bass(root-12+(R()<.5?7:12),t,.4);
      if(st===8&&R()<.35)iv.slice(1).forEach((x,i)=>this.keys(root+12+x,t+i*.02,beat*1.6,.035));
      if(st===0||st===7&&R()<.5||st===10)this.kick(t);
      if(st===4||st===12)this.snare(t);
      if(st%2===0&&R()<.9)this.hat(t,st%4===0?.05:.028);
      if(st%2===0&&R()<.16)this.lead(60+this.key+pent[(R()*pent.length)|0]+(R()<.3?12:0),t,.5);}
    else if(id==='tide'){
      if(st===0&&this.bar%2===0){iv.forEach((x,i)=>this.pad(root+12+x,t+i*.15,beat*7.5,.048));this.bass(root-12,t,beat*7,.2);}
      if(st%4===0&&R()<.22)this.bell(72+this.key+pent[(R()*6)|0],t,.065);
      if(st===8&&this.bar%2===1&&R()<.5)this.keys(root+24+iv[(R()*4)|0],t,beat*3,.03);}
    else if(id==='jazz'){
      if(st%4===0){const walk=[0,iv[1],iv[2],iv[2]+2][st/4],app=st===12?(R()<.5?11:13):walk;this.bass(root-12+app%24,t,beat*.9,.2);}
      if(st===6||st===14||(st===0&&R()<.4))iv.forEach((x,i)=>this.keys(root+12+x,t+i*.008,beat*(R()<.5?.45:1.2),.05));
      if(st%4===0||st%4===3&&R()<.7)this.ride(t,st%8===4?.06:.04);
      if(st===4||st===12)this.hat(t,.035);
      if(st%2===0&&R()<.5)this.brush(t,.03+R()*.03);
      if(st===0&&R()<.5)this.kick(t,.25);
      if(st%2===0&&R()<.22)this.lead(62+this.key+[0,2,3,4,7,9,10,12,14][(R()*9)|0],t,.32);}
    else if(id==='bounce'){
      if(st===0||st===6||st===10)this.bass(root-12+(st===6?7:st===10?12:0),t,.22,.22);
      if(st%4===2)iv.slice(0,3).forEach((x,i)=>this.pluck(root+12+x,t+i*.006,.12,.05));
      if(st===0||st===8)this.kick(t,.4);
      if(st===4||st===12)this.rim(t,.08);
      this.shaker(t,st%2?.018:.03);
      if(R()<(st%2?.12:.38))this.steel(72+this.key+pent[(R()*pent.length)|0],t,.075);}
    else if(id==='night'){
      if(st===0&&this.bar%2===0){iv.forEach((x,i)=>this.pad(root+x,t+i*.08,beat*7.6,.03));}
      if(st===0||st===10&&R()<.6)this.bass(root-24,t,beat*(st?1.5:2.6),.26);
      if(st===0)this.kick(t,.45);if(st===3&&R()<.6)this.kick(t,.25);
      if(st===8)this.rim(t,.05);
      if(st%2===0&&R()<.5)this.hat(t,.018);
      if(st%2===0&&R()<.18)this.vibe(72+this.key+[0,3,5,7,10,12,15][(R()*7)|0],t,.05);}},
  env(g,t,a,peak,dec,sus,len){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setTargetAtTime(peak*sus,t+a,dec);g.gain.setTargetAtTime(0,t+len,.12);},
  keys(m,t,len,v){const c=snd.ctx,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),g2=c.createGain(),f=this.hz(m);o.type='sine';o.frequency.value=f;o2.type='triangle';o2.frequency.value=f*2;g2.gain.value=.12;
    this.wowG.connect(o.detune);this.wowG.connect(o2.detune);o.connect(g);o2.connect(g2);g2.connect(g);g.connect(this.bus);this.env(g,t,.012,v,.5,.35,len);o.start(t);o2.start(t);o.stop(t+len+.8);o2.stop(t+len+.8);},
  pad(m,t,len,v){const c=snd.ctx,g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=900;f.Q.value=.3;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+len*.35);g.gain.setTargetAtTime(0,t+len*.7,len*.15);
    for(const dt_ of [-7,6]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=this.hz(m);o.detune.value=dt_;this.wowG.connect(o.detune);o.connect(f);o.start(t);o.stop(t+len*1.4);}f.connect(g);g.connect(this.bus);},
  bell(m,t,v){const c=snd.ctx;for(const [k,a,d] of [[1,1,1.6],[2.76,.35,.6],[5.4,.12,.3]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=this.hz(m)*k;g.gain.setValueAtTime(v*a,t);g.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+d+.05);}},
  vibe(m,t,v){const c=snd.ctx,o=c.createOscillator(),g=c.createGain(),tr=c.createOscillator(),tg=c.createGain();o.type='sine';o.frequency.value=this.hz(m);tr.frequency.value=5.5;tg.gain.value=v*.35;tr.connect(tg);tg.connect(g.gain);
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+1.4);o.connect(g);g.connect(this.bus);o.start(t);tr.start(t);o.stop(t+1.5);tr.stop(t+1.5);},
  steel(m,t,v){const c=snd.ctx;for(const [k,a,d] of [[1,1,.5],[2,.45,.25],[3.02,.15,.12]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=this.hz(m)*k;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*a,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+d+.05);}},
  pluck(m,t,len,v){const c=snd.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='square';o.frequency.value=this.hz(m);f.type='lowpass';f.frequency.setValueAtTime(2600,t);f.frequency.exponentialRampToValueAtTime(500,t+len);
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+len+.05);o.connect(f);f.connect(g);g.connect(this.bus);o.start(t);o.stop(t+len+.1);},
  lead(m,t,len){const c=snd.ctx,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=this.hz(m);this.wowG.connect(o.detune);o.connect(g);g.connect(this.bus);this.env(g,t,.03,.035,.25,.4,len);o.start(t);o.stop(t+len+.8);},
  bass(m,t,len,v=.22){const c=snd.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=this.hz(m);o.connect(g);g.connect(this.bus);this.env(g,t,.01,v,.3,.5,len);o.start(t);o.stop(t+len+.6);},
  kick(t,v=.5){const c=snd.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+.35);},
  nz(t,type,fq,q,v,dur){const c=snd.ctx,s=c.createBufferSource();s.buffer=this.noise;const f=c.createBiquadFilter();f.type=type;f.frequency.value=fq;f.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    s.connect(f);f.connect(g);g.connect(this.bus);s.start(t,Math.random());s.stop(t+dur+.03);},
  snare(t){this.nz(t,'bandpass',1700,.7,.16,.22);},
  hat(t,v){this.nz(t,'highpass',6500,.7,v*(.6+Math.random()*.5),.045);},
  ride(t,v){this.nz(t,'bandpass',7800,2.5,v,.38);},
  brush(t,v){this.nz(t,'bandpass',3200,.5,v,.16);},
  rim(t,v){this.nz(t,'bandpass',2900,9,v*2.2,.05);},
  shaker(t,v){this.nz(t,'highpass',8500,.7,v*(.7+Math.random()*.6),.05);}};
/* the dial: a little knob next to the time-of-day button. Tap to turn to the next station; the last stop is OFF. */
const DIAL=[...STATIONS.map(s=>s.id),'off'];
function dialPic(i){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),P=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  const cx=16,cy=17;for(let yy=0;yy<32;yy++)for(let xx=0;xx<32;xx++){const d=Math.hypot(xx+.5-cx,yy+.5-cy);if(d<11.5)P(d>10.3?'#241c2e':d<7?'#e3cda4':'#5a4a63',xx,yy);}
  for(let yy=0;yy<32;yy++)for(let xx=0;xx<32;xx++){const d=Math.hypot(xx+.5-cx,yy+.5-cy);if(d<7&&d>5.8)P('#b89a6a',xx,yy);}
  DIAL.forEach((_,k)=>{const a=(-130+k*260/(DIAL.length-1))*DEG,on=k===i;const px=Math.round(cx+Math.sin(a)*14-.5),py=Math.round(cy-Math.cos(a)*14-.5);P(on?(k===DIAL.length-1?'#e5483b':'#ffd36b'):'#f5e8cf',px,py,on?2:1,on?2:1);});
  const a=(-130+i*260/(DIAL.length-1))*DEG;for(let r=1;r<10;r++)P('#241c2e',Math.round(cx+Math.sin(a)*r-.5),Math.round(cy-Math.cos(a)*r-.5),2,2);
  for(let r=2;r<9;r++)P(i===DIAL.length-1?'#e5483b':'#e2703f',Math.round(cx+Math.sin(a)*r-.5),Math.round(cy-Math.cos(a)*r-.5));
  return c.toDataURL();}
const DIAL_PICS=DIAL.map((_,i)=>dialPic(i));
function dialIndex(){return (settings.music??.5)<=0?DIAL.length-1:Math.max(0,DIAL.indexOf(settings.station));}
function updRadioBtn(){const b=$('radioBtn');if(!b)return;const i=dialIndex(),S=i<STATIONS.length?STATIONS[i]:null;b.innerHTML=`<img src="${DIAL_PICS[i]}" alt="Radio">`;b.title=S?`${S.fq} ${S.name}`:'Radio off';}
function setStation(id,quiet){if(id==='off'){if((settings.music??.5)>0)settings.lastMusic=settings.music;settings.music=0;saveS();music.setVol();if(!quiet)toast('Radio off.',1.4);updRadioBtn();return;}
  const wasOff=(settings.music??.5)<=0;settings.station=id;if(wasOff)settings.music=settings.lastMusic||.5;saveS();snd.init();music.start();music.tune(id,quiet);music.setVol();updRadioBtn();
  const S=stationAt(id);if(!quiet)toast(`RADIO ${S.fq} · ${S.name}\n${S.desc}${settings.sound?'':'\n(Sound is off in Settings.)'}`,2.2);}
function turnDial(){const i=dialIndex();setStation(DIAL[(i+1)%DIAL.length]);snd.click();}
/* ---------- maps ---------- */
const MAPX=SIZEX,MAPZ=SIZEZ,MAPNX=1072,MAPNY=512,ISLE_IDS=Object.keys(ISLES),mapOwner=new Uint8Array(MAPNX*MAPNY),mapBase=(()=>{const NX=MAPNX,N=MAPNY,c=document.createElement('canvas');c.width=NX;c.height=N;const x=c.getContext('2d'),img=x.createImageData(NX,N);
  for(let j=0;j<N;j++)for(let i=0;i<NX;i++){const wx=-MAPX/2+(i+.5)*MAPX/NX,wz=-MAPZ/2+(j+.5)*MAPZ/N,h=groundH(wx,wz);let r,g,b;
    if(h<0){const d=clamp(-h/40,0,1);r=lerp(70,30,d);g=lerp(150,72,d);b=lerp(170,120,d);}
    else if(h<4){r=226;g=205;b=150;}
    else{const t=clamp(h/600,0,1),sl=slopeAt(wx,wz);r=lerp(118,190,t*t);g=lerp(166,178,t);b=lerp(84,150,t*t);if(sl>.45){r=150;g=136;b=126;}
      if(isFarm(wx,wz,h,sl)){const fc=fieldColor(wx,wz);if(fc>=0){r=(fc>>16)&255;g=(fc>>8)&255;b=fc&255;}}
      if(((h/60)|0)!==((groundH(wx+MAPX/NX,wz)/60)|0)){r*=.82;g*=.82;b*=.82;}}
    if(h>=0)mapOwner[j*NX+i]=ISLE_IDS.indexOf(isleAt(wx,wz))+1;
    const k=(j*NX+i)*4;img.data[k]=r;img.data[k+1]=g;img.data[k+2]=b;img.data[k+3]=255;}
  x.putImageData(img,0,0);return c;})();
/* ---------- the uncharted map ----------
   You start with Ferrow and Gull Point on the chart. Everything else is uncharted haze. Fly over an island and its
   outline goes on the chart; land on one of its runways and the whole island is charted, names and all. A job to an
   uncharted field shows only as an X over the haze. */
if(!log.chart){log.chart={ferrow:2,gull:2};for(const st of STRIPS)if((log.fields[st.id]||{}).landings)log.chart[isleAt(st.x,st.z)]=2;}
const isleOfStrip=st=>st.__isle||(st.__isle=isleAt(st.x,st.z));
const charted=st=>log.chart[isleOfStrip(st)]===2;
const mapView=(()=>{const c=document.createElement('canvas');c.width=MAPNX;c.height=MAPNY;return c;})();
const mapBaseData=mapBase.getContext('2d').getImageData(0,0,MAPNX,MAPNY).data;
function rebuildChart(){const NX=MAPNX,NY=MAPNY,n=NX*NY,D=new Float32Array(n).fill(1e9),own=mapOwner;
  for(let q=0;q<n;q++){const o=own[q];if(o&&log.chart[ISLE_IDS[o-1]]===2)D[q]=0;}
  // two-pass chamfer distance (in map pixels) from charted land, so the sea round a charted island shows too
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const q=j*NX+i;let d=D[q];if(i>0)d=Math.min(d,D[q-1]+1);if(j>0){d=Math.min(d,D[q-NX]+1);if(i>0)d=Math.min(d,D[q-NX-1]+1.41);if(i<NX-1)d=Math.min(d,D[q-NX+1]+1.41);}D[q]=d;}
  for(let j=NY-1;j>=0;j--)for(let i=NX-1;i>=0;i--){const q=j*NX+i;let d=D[q];if(i<NX-1)d=Math.min(d,D[q+1]+1);if(j<NY-1){d=Math.min(d,D[q+NX]+1);if(i<NX-1)d=Math.min(d,D[q+NX+1]+1.41);if(i>0)d=Math.min(d,D[q+NX-1]+1.41);}D[q]=d;}
  const x=mapView.getContext('2d'),img=x.createImageData(NX,NY),o=img.data,B=mapBaseData;
  const seenL=(q)=>{const v=own[q];return v&&log.chart[ISLE_IDS[v-1]]===1;};
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const q=j*NX+i,k=q*4,v=own[q],st=v?log.chart[ISLE_IDS[v-1]]:0,d=D[q];let r,g,b;
    const hz=Math.sin(i*.045+Math.sin(j*.07)*2.2)*Math.sin(j*.06+i*.011),fogL=((i+j*3)%9===0||hz>.82);
    const fog=()=>{r=fogL?52:40;g=fogL?92:78;b=fogL?132:116;};
    if(st===2||(!v&&d<=12)||(!v&&d<=17&&((i+j)%2===0||d<=14.5))){r=B[k];g=B[k+1];b=B[k+2];}
    else if(st===1){const edge=!seenL(q-1)||!seenL(q+1)||!seenL(q-NX)||!seenL(q+NX);if(edge){r=226;g=232;b=232;}else if((i+j)%3===0){r=120;g=150;b=168;}else fog();}
    else fog();
    o[k]=r;o[k+1]=g;o[k+2]=b;o[k+3]=255;}
  x.putImageData(img,0,0);}
rebuildChart();
function chartIsle(id,lvl){if(!id||(log.chart[id]||0)>=lvl)return false;log.chart[id]=lvl;saveL();rebuildChart();return true;}
let seenT=0;
function updCharting(dt){seenT+=dt;if(seenT<.5||ac.ground)return;seenT=0;if(groundH(ac.pos.x,ac.pos.z)<1)return;const id=isleAt(ac.pos.x,ac.pos.z);
  const hasRwy=STRIPS.some(st=>isleOfStrip(st)===id);
  if(!hasRwy){if(chartIsle(id,2))toast(`${ISLES[id].name} is on your chart now.`,2.4);}
  else if(!log.chart[id]&&chartIsle(id,1))toast(`Land below! Its outline is on your chart now.\nLand on its runway to chart it properly.`,3);}
/* an X over the haze for a field you haven't charted */
function drawX(x,px,pz,q,col){x.save();x.strokeStyle='#241c2e';x.lineWidth=q*.9;x.beginPath();x.moveTo(px-q,pz-q);x.lineTo(px+q,pz+q);x.moveTo(px+q,pz-q);x.lineTo(px-q,pz+q);x.stroke();
  x.strokeStyle=col;x.lineWidth=q*.45;x.beginPath();x.moveTo(px-q,pz-q);x.lineTo(px+q,pz+q);x.moveTo(px+q,pz-q);x.lineTo(px-q,pz+q);x.stroke();x.restore();}
const mctx=$('mapc').getContext('2d');
function drawStripsOn(x,k,highlight){for(const s of STRIPS){if(!charted(s)){if(s===highlight)drawX(x,s.x,s.z,7/k,'#8ff0e8');continue;}const a=toWorld(s,-s.len/2,0),b=toWorld(s,s.len/2,0);const hi=s===highlight;
  if(hi){x.save();x.fillStyle='#8ff0e8';for(const d of GATE_D){const p=gatePos(s,gateDir,d);x.fillRect(p.x-3/k,p.z-3/k,6/k,6/k);}x.strokeStyle='#8ff0e8';x.lineWidth=1.3/k;x.setLineDash([5/k,4/k]);for(const e of [-1,1]){const p0=toWorld(s,e*s.len/2,0),p1=toWorld(s,e*(s.len/2+2600),0);x.beginPath();x.moveTo(p0.x,p0.z);x.lineTo(p1.x,p1.z);x.stroke();}x.restore();}
  x.strokeStyle=hi?'#ffffff':'#f5e8cf';x.lineWidth=(hi?3:2.2)/k;x.beginPath();x.moveTo(a.x,a.z);x.lineTo(b.x,b.z);x.stroke();}}
let mapT=0;
function drawMiniMap(dt){mapT-=dt;if(mapT>0)return;mapT=.08;const W=96,x=mctx;x.imageSmoothingEnabled=false;
  axes();const hdg=ac.ground?-ac.gYaw:Math.atan2(_f.x,-_f.z);
  const near=dest?Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z):1e9,R=near<2600?1500:2800,k=(W/2)/R,cy=W/2+14;
  x.fillStyle='#1d2a44';x.fillRect(0,0,W,W);x.save();x.translate(W/2,cy);x.rotate(-hdg);x.scale(k,k);x.translate(-ac.pos.x,-ac.pos.z);
  x.drawImage(mapView,-MAPX/2,-MAPZ/2,MAPX,MAPZ);drawStripsOn(x,k,dest);
  x.fillStyle='#ffb02e';for(const [k_,v] of Object.entries(sights))if(log.sights[k_])x.fillRect(v.x-2/k,v.z-2/k,4/k,4/k);x.fillStyle='#8ff0e8';for(const g of FLYGATES)if(log.gates[g.id])x.fillRect(g.x-2/k,g.z-2/k,4/k,4/k);
  dropMarks(x,(a,b)=>[a,b],1/k);
  if(dest&&charted(dest)){x.fillStyle='#8ff0e8';x.beginPath();x.arc(dest.x,dest.z,3.5/k,0,TAU);x.fill();}
  x.restore();
  x.fillStyle='#fff8ec';x.strokeStyle='#241c2e';x.lineWidth=1;x.beginPath();x.moveTo(W/2,cy-6);x.lineTo(W/2-4,cy+4);x.lineTo(W/2,cy+2);x.lineTo(W/2+4,cy+4);x.closePath();x.fill();x.stroke();
  const na=-hdg;x.fillStyle='#ffb02e';x.font='13px VT323, monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('N',clamp(W/2+Math.sin(na)*40,6,W-6),clamp(cy-Math.cos(na)*40,6,W-6));
  if(dest&&near>R*.9){const brg=Math.atan2(dest.x-ac.pos.x,-(dest.z-ac.pos.z))-hdg;x.fillStyle='#8ff0e8';x.beginPath();x.arc(clamp(W/2+Math.sin(brg)*44,4,W-4),clamp(cy-Math.cos(brg)*44,4,W-4),3,0,TAU);x.fill();}}
/* Bea's chart: fills the whole screen, a thin white border, a small legend top left and an X to close */
function closeChart(){const o=$('chartOv');if(o)o.remove();removeEventListener('resize',chartResize);mode='fly';}
function chartResize(){if($('chartOv'))drawChart();}
function bigMap(){hideModal();if(mode==='fly')mode='paused';let o=$('chartOv');
  if(!o){o=document.createElement('div');o.id='chartOv';o.innerHTML=`<canvas id="bigmap"></canvas><div id="chartLeg"></div><button id="chartX" aria-label="Close the chart">✕</button>`;document.body.appendChild(o);
    $('chartX').addEventListener('click',e=>{e.stopPropagation();closeChart();});addEventListener('resize',chartResize);}
  $('chartLeg').innerHTML=`<b>BEA'S CHART</b> · ★ ${log.score.toLocaleString()}<br>${ISLE_IDS.filter(q=>log.chart[q]===2).length}/${ISLE_IDS.length} islands charted · ${Object.keys(sights).filter(q=>log.sights[q]).length}/${Object.keys(sights).length} landmarks (orange) · ${FLYGATES.filter(g=>log.gates[g.id]).length}/${FLYGATES.length} gaps (cyan)${activeDrops().length?' · '+activeDrops().length+' air drops (orange rings)':''}${activeErrands().length?'<br>Errands: '+activeErrands().map(errLine).join(', '):''}`;
  drawChart();}
function drawChart(){const c=$('bigmap'),r=rectL(c),W=Math.max(200,Math.round(r.width)),H=Math.max(150,Math.round(r.height));c.width=W;c.height=H;
  const x=c.getContext('2d');x.imageSmoothingEnabled=false;const k=Math.min(W/45200,H/20600),CX=0,CZ=500,sc=clamp(Math.min(W/512,H/384),1,2.2);
  x.fillStyle='#1e4878';x.fillRect(0,0,W,H);x.save();x.translate(W/2-CX*k,H/2-CZ*k);x.scale(k,k);
  x.drawImage(mapView,-MAPX/2,-MAPZ/2,MAPX,MAPZ);drawStripsOn(x,k/sc,dest);
  x.restore();
  const P=(wx,wz)=>[W/2+(wx-CX)*k,H/2+(wz-CZ)*k];x.textBaseline='middle';
  x.font=`${Math.round(13*sc)}px VT323, monospace`;
  const label=(t,wx,wz,col,dy=-12)=>{let [a,b]=P(wx,wz);const hw=x.measureText(t).width/2+5;a=clamp(a,hw,W-hw);b=clamp(b+dy*sc,10*sc,H-10*sc)-dy*sc;x.textAlign='center';x.fillStyle='#241c2e';x.fillText(t,a+1,b+dy*sc+1);x.fillStyle=col;x.fillText(t,a,b+dy*sc);};
  for(const [k_,v] of Object.entries(sights)){if(!log.sights[k_])continue;const [a,b]=P(v.x,v.z);x.fillStyle='#241c2e';x.fillRect(a-3*sc,b-3*sc,6*sc,6*sc);x.fillStyle='#ffb02e';x.fillRect(a-2*sc,b-2*sc,4*sc,4*sc);}
  for(const g of FLYGATES){if(!log.gates[g.id])continue;const [a,b]=P(g.x,g.z),q=4*sc;x.fillStyle='#8ff0e8';x.beginPath();x.moveTo(a,b-q);x.lineTo(a+q,b);x.lineTo(a,b+q);x.lineTo(a-q,b);x.closePath();x.fill();}
  dropMarks(x,P,sc);
  for(const [id,I] of Object.entries(ISLES))if(log.chart[id]===2)label(I.name.toUpperCase(),I.x,I.z+(I.r?Math.min(I.r*.6,600)+260:1500),'#ffd890',0);
  if(dest)label(charted(dest)?dest.name.toUpperCase():dest.name.toUpperCase()+' (UNCHARTED)',dest.x,dest.z,'#8ff0e8',charted(dest)?-11:-16);
  const [px,pz]=P(ac.pos.x,ac.pos.z);axes();const hdg=ac.ground?-ac.gYaw:Math.atan2(_f.x,-_f.z);x.save();x.translate(px,pz);x.rotate(hdg);x.scale(sc,sc);x.fillStyle='#fff8ec';x.strokeStyle='#241c2e';x.lineWidth=1.5;x.beginPath();x.moveTo(0,-9);x.lineTo(-6,6);x.lineTo(0,3);x.lineTo(6,6);x.closePath();x.fill();x.stroke();x.restore();
  const wx=W-30*sc,wy=H-34*sc,wd=70*DEG;x.fillStyle='#ffb02e';x.textAlign='center';x.fillText('N ↑',30*sc,H-14*sc);
  x.strokeStyle='#fff8ec';x.lineWidth=2;x.beginPath();x.moveTo(wx-Math.sin(wd)*12*sc,wy+Math.cos(wd)*12*sc);x.lineTo(wx+Math.sin(wd)*12*sc,wy-Math.cos(wd)*12*sc);x.stroke();x.fillStyle='#fff8ec';x.fillText('WIND',wx,H-12*sc);}
/* ---------- Bea's logbook (flight guide) ---------- */
const BEA=[
  {t:'The two thumbs',h:`<p>Left thumb is the throttle. Right thumb is the stick: touch anywhere on the right side and drag.</p><ul><li><b>Drag down</b> to raise the nose. <b>Drag up</b> to lower it.</li><li><b>Drag sideways</b> to bank. Banking is how you turn.</li><li>The rudder looks after itself while Steady Wings is on.</li></ul><p>Small moves. The plane does what you ask, just a moment later than you'd like.</p>`},
  {t:'Pitch and power',h:`<p>Here's the secret most new pilots fight: <b>the stick sets your speed, the throttle sets climb or descent.</b></p><ul><li>Nose up, slower. Nose down, faster.</li><li>Want to climb without slowing down? Add power.</li><li>Want to come down without speeding up? Take power off.</li></ul><p>Let go of the stick and the plane holds the speed you left it at. That's Auto-trim, doing what a real pilot does with the trim wheel.</p>`},
  {t:'Flaps',h:`<p>Flaps are hinged panels on the back of the wing. Lowering them makes the wing curvier: more lift, and also more drag.</p><table><tr><td>FLAPS 0</td><td><b>Cruise.</b> Clean wing, least drag. Climbing out and flying around.</td></tr><tr><td>FLAPS 1</td><td><b>Takeoff and approach.</b> A bit more lift, so you can fly a few knots slower. Good for short strips and the start of an approach.</td></tr><tr><td>FLAPS 2</td><td><b>Landing.</b> Most lift and most drag. You can come down steeply without speeding up, and touch down slow.</td></tr></table><p>Don't fly fast with flaps out: above 85 knots (the top of the white arc on the speed gauge) they're working too hard. With flaps down you need more power to hold your height.</p>`},
  {t:'The six gauges',h:`<table><tr><td>SPEED</td><td>Airspeed in knots. White arc: flap range. Green: normal. Yellow: careful, smooth air only.</td></tr><tr><td>ATTITUDE</td><td>Blue is sky, brown is ground. The orange wings are you. Shows bank and nose up or down, even when you can't see outside.</td></tr><tr><td>ALTITUDE</td><td>Height in feet above the sea. The long needle is hundreds, the short one thousands. (The readout at the top of the screen is height above the ground, which matters more for landing.)</td></tr><tr><td>HEADING</td><td>Your compass direction. The cyan mark is the way to your next stop.</td></tr><tr><td>CLIMB</td><td>Feet per minute up or down. On approach, about 400 down is right.</td></tr><tr><td>RPM</td><td>Engine speed. The green band is cruise power.</td></tr></table><p>Trick: glance, don't stare. Speed, attitude, back to the window.</p>`},
  {t:'Taking off',h:`<ul><li>Flaps 0 on a long runway, 1 on a short one.</li><li>Full power. Keep straight with small sideways stick.</li><li>At about 45 knots, drag the stick gently down. The nose lifts and the plane flies itself off.</li><li>Climb at 55 to 65 knots. Let go and it holds that.</li><li>Flaps up once you're well above the trees.</li></ul>`},
  {t:'Turning',h:`<p>Bank to turn. The steeper the bank, the faster the turn, but the wing spends some of its lift turning instead of holding you up.</p><ul><li>In a turn, hold the stick a little down (back) to keep the nose up and stay level.</li><li>Gentle turns are about 20 degrees of bank. Thirty is brisk.</li><li>Let go of the stick and Steady Wings rolls you level.</li></ul>`},
  {t:'The approach',h:`<p>A good landing is made two kilometers out.</p><ul><li>On the chart, the runway you're headed for has a <b>dashed line</b> coming out of each end. Fly to that line, then turn to follow it toward the runway.</li><li>About 2 km out and a few hundred feet up: <b>flaps 1</b>, power back, <b>55 knots</b>.</li><li>Watch the <b>four lights</b> beside the runway. Two white and two red: perfect. More white: too high, take off power. More red: too low, add power.</li><li>Closer in: flaps 2, and keep the runway centered in the windshield.</li><li>Do your before-landing checklist.</li></ul>`},
  {t:'Landing numbers',h:`<p>Pin these on your knee. The speed and height readouts turn <b style="color:#3e7334">green</b>, <b style="color:#b8862a">amber</b> or <b style="color:#c2453a">red</b> on approach to tell you how you're doing.</p><table><tr><td>2 KM OUT</td><td><b>Gate 1</b>, about <b>450 ft up</b>, lined up on the dashed line, flaps 1, <b>55 knots</b>. Start heading for it from 4 or 5 km away so you have time to turn in.</td></tr><tr><td>GATES 2 AND 3</td><td>1.3 km (about 300 ft) and 0.7 km (about 160 ft). Keep the diamond in the ring on the line-up meter.</td></tr><tr><td>ON FINAL</td><td><b>50 to 60 knots.</b> Coming down about <b>400 ft/min</b>. Two white and two red lights.</td></tr><tr><td>OVER THE END</td><td>Flaps 2, power to idle, <b>about 50 knots</b>, 30 to 50 ft up.</td></tr><tr><td>FLARE</td><td>At <b>10 to 20 ft</b>, ease the nose up a little. The meter switches to FLARE: put both markers in the green, <b>nose up 2 to 8°</b> and <b>sink under 300 ft/min</b>.</td></tr><tr><td>TOUCHDOWN</td><td>Wings level (<b>under 10°</b> of bank), nose slightly up, about <b>45 to 50 knots</b>.</td></tr></table><p>The height readout is <b>feet above the ground under you</b>, not above the sea. Trees are about 30 to 45 ft tall; a house is about 20. Near the runway you'll hear little beeps at 100, 50, 30, 20 and 10 ft.</p><p>Over 800 ft/min at touchdown and Gus gets a phone call.</p>`},
  {t:'Landing and stopping',h:`<ul><li>Aim at the white markers about a quarter of the way down the runway.</li><li>Just above the runway, <b>ease the stick down (back)</b> to raise the nose a little. This is the flare: it turns a drop into a settle.</li><li>Power to idle as the wheels touch.</li><li>Hold <b>BRAKE</b>. It builds up the longer you hold: tap it for a little, hold it for a lot.</li></ul><p>Under 180 ft/min is soft. Under 90 is butter.</p>`},
  {t:'Stalls',h:`<p>A wing can only meet the air so steeply. Push past that and it stalls: it stops lifting, and the nose drops.</p><ul><li>The horn and the red STALL sign mean you're close.</li><li><b>Fix it: lower the nose.</b> Speed comes back, the wing works again. Then add power.</li><li>Slow, steep and turning is where stalls happen. On approach, watch the speed.</li></ul><p>Stall Guard stops you pulling into one. Turn it off in Settings when you want to feel it.</p>`},
  {t:'Before-landing checklist',h:`<p>I did this every single landing for forty years. Four things:</p><table><tr><td>CARB HEAT</td><td>ON. Low power on approach is when carb ice forms.</td></tr><tr><td>MIXTURE</td><td>RICH, so full power is there if you need to go around.</td></tr><tr><td>FLAPS</td><td>1 or 2.</td></tr><tr><td>LANDING LIGHT</td><td>ON at sunset, blue hour and night.</td></tr></table><p>The checklist box shows up on approach. Land with all of it done and Mabel adds a bonus stamp.</p>`},
  {t:'Carb heat and mixture',h:`<p><b>Carb ice.</b> The carburetor mixes fuel and air, and it gets cold inside, cold enough to freeze damp air. At low power it can ice up and the engine runs rough and weak. CARB HEAT warms the air going in and melts it, at the cost of a little power. Running rough on a long descent? Carb heat on.</p><p><b>Mixture.</b> Higher up the air is thinner, so the engine wants less fuel. Leaning (MIX LEAN) above 2,000 ft gives a little more power. Down low, lean means too little fuel: keep it RICH.</p>`},
  {t:'Flying by the gauges',h:`<p>In cloud or fog you can't trust your body; it will swear you're level when you're turning. Trust the attitude gauge.</p><ul><li>Keep the orange wings level on the horizon line.</li><li>On approach, the <b>line-up meter</b> at the top: the diamond is where the path is. Fly gently toward it until it sits in the ring.</li></ul>`},
  {t:'Air drops',h:`<p>Some folk camp out too far from a runway for the mail. For them we drop parcels on little parachutes.</p><ul><li>When you load the bag, Mabel may hand you one, two or three air drops. She'll only know which <b>island</b> they're on, so it's a dashed circle on the chart. Keep a lookout for <b>orange smoke</b>: under it is a painted <b>bullseye</b> and someone waving.</li><li>Tap the <b>target</b> button on the left to bring up LOOK DOWN and DROP.</li><li>Fly over low and steady, 300 to 400 ft up. With LOOK DOWN on, the <b>crosshair is where the parcel lands</b> if you let go now. It falls a long way forward, so let go well before you're over the rings.</li><li>The moment it's out you'll be told if it's heading for the rings or going wide, and which way. The chute pops low, so it's down in a few seconds.</li><li>A good drop: they cheer, and the camp packs itself up. Land at any field for more parcels.</li></ul>`},
  {t:'Night flying',h:`<ul><li>Runways have edge lights at night. Amber ones mark the ends.</li><li>Turn on your landing light on approach: it lights the runway in front of you.</li><li>The approach lights work just the same at night, so trust them over your eyes.</li><li>Some things on the islands only show themselves after dark. Go looking at blue hour or night: a few of them glow.</li></ul>`},
];
function bea(i){if(mode==='fly')mode='paused';const p=BEA[i];
  if(i<0){const list=BEA.map((b,j)=>`<button class="item" data-p="${j}"><span><b>${j+1}. ${b.t}</b></span><span class="r">READ</span></button>`).join('');
    showCard(`<div class="who"><img src="${portrait('bea')}" alt=""><div><b>Bea's logbook</b><span>FORTY YEARS OF FLYING THIS ROUTE</span></div></div><div class="list">${list}</div>`,[['Back',back,true]]);
    $('cardBody').querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>bea(+b.dataset.p)));return;}
  showCard(`<div class="page"><div class="sub">BEA'S LOGBOOK · PAGE ${i+1} OF ${BEA.length}</div><h2>${p.t}</h2>${p.h}</div>`,[
    ['All pages',()=>bea(-1)],...(i>0?[['Previous',()=>bea(i-1)]]:[]),...(i<BEA.length-1?[['Next page',()=>bea(i+1),true]]:[['Done',back,true]])]);}

/* ---------- handwritten pixel lettering ---------- */
// A real script font drawn small on a canvas and scaled up with square pixels. Swap SCRIPT to try another hand.
const SCRIPT={family:'Dancing Script',weight:700};const PXC={};let scriptReady=false;
function pixelText(txt,px,col,shadow){const k=[txt,px,col,shadow].join('|');if(PXC[k])return PXC[k];
  const c=document.createElement('canvas'),x=c.getContext('2d'),font=`${SCRIPT.weight} ${px}px "${SCRIPT.family}"`;x.font=font;
  c.width=Math.ceil(x.measureText(txt).width+px*.7+3);c.height=Math.ceil(px*1.55);x.font=font;x.textBaseline='middle';const y=c.height/2,x0=Math.round(px*.2);
  if(shadow){x.fillStyle=shadow;x.fillText(txt,x0+1,y+1);}x.fillStyle=col;x.fillText(txt,x0,y);
  const d=x.getImageData(0,0,c.width,c.height);for(let i=3;i<d.data.length;i+=4)d.data[i]=d.data[i]>105?255:0;x.putImageData(d,0,0);
  return PXC[k]={url:c.toDataURL(),w:c.width,h:c.height};}
function scriptify(root){if(!scriptReady)return;
  root.querySelectorAll('#title h1').forEach(el=>{if(el.dataset.px)return;const big=el.tagName==='H1',txt=el.textContent.trim();if(!txt)return;
    const r=big?pixelText(txt,26,'#f5e8cf','#241c2e'):pixelText(txt,el.tagName==='H2'?17:15,'#241c2e',null),sc=big?3:2;
    el.dataset.px=1;el.setAttribute('aria-label',txt);el.innerHTML=`<img class="px-img" src="${r.url}" alt="${txt.replace(/"/g,'&quot;')}" width="${r.w*sc}" height="${r.h*sc}" style="width:${r.w*sc}px">`;});}
document.fonts&&document.fonts.load(`${SCRIPT.weight} 26px "${SCRIPT.family}"`).then(f=>{if(f&&f.length){scriptReady=true;scriptify(document);}}).catch(()=>{});

/* numbers in running text use VT323, whose digits can't be mistaken for letters */
function fixNums(root){const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>/\d/.test(n.nodeValue)&&!(n.parentElement&&n.parentElement.closest('.num,.k,.sub,.got,button,script,style'))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
  const list=[];while(tw.nextNode())list.push(tw.currentNode);
  for(const n of list){const f=document.createDocumentFragment();let last=0;const s=n.nodeValue;s.replace(/\d+(?:[.,:]\d+)*(?:[–-]\d+(?:[.,:]\d+)*)?/g,(m,i)=>{if(i>last)f.appendChild(document.createTextNode(s.slice(last,i)));const sp=document.createElement('span');sp.className='num';sp.textContent=m;f.appendChild(sp);last=i+m.length;return m;});
    if(last<s.length)f.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(f,n);}}

/* ---------- menus ---------- */
/* menus: "Back"-type buttons sit in a bar at the top of the card; everything else stays at the bottom */
const isBackBtn=(l,fn)=>fn===back||l==='Back to flying'||l==='All pages'||l==='Resume'||l==='Title screen';
function showCard(html,buttons,opt){html=petSay(html);$('cardBody').innerHTML='<div class="topbar"></div>'+html+'<div class="btns'+(opt&&opt.grid?' grid':'')+'"></div>';$('cardBody').classList.remove('wide');const b=$('cardBody').querySelector('.btns:last-child'),tb=$('cardBody').querySelector('.topbar');
  (buttons||[]).forEach(([l,fn,p])=>{const el=document.createElement('button');const top=isBackBtn(l,fn);el.textContent=top&&l!=='Title screen'?'‹ '+(l==='Done'?'Back':l):l;if(l==='Title screen'){el.style.marginLeft='auto';el.style.setProperty('--bc','#eaa6a6');el.style.background='#eaa6a6';}if(p&&!top)el.className='primary';if(top)el.classList.add('backbtn');if(opt&&opt.colors&&opt.colors[l])el.style.setProperty('--bc',opt.colors[l]);el.addEventListener('click',fn);(top?tb:b).appendChild(el);});
  if(!tb.children.length)tb.remove();if(!b.children.length)b.remove();$('modal').hidden=false;$('cardBody').scrollTop=0;scriptify($('cardBody'));fixNums($('cardBody'));}
function hideModal(){$('modal').hidden=true;}
function back(){hideModal();if(mode==='title')$('title').hidden=false;else if(mode==='paused'||mode==='card')openMenu();}
function openMenu(){if(mode==='fly')mode='paused';showCard(`<h2>Paused</h2><div class="sub">${dest?'HEADING FOR '+dest.name.toUpperCase():''}${mail.active?' · '+mail.bag.length+' IN THE BAG':''} · ${log.stamps} STAMPS</div>`,[
  ['Resume',()=>{hideModal();mode='fly';},true],['Title screen',()=>{hideModal();toTitle();}],['Mail bag',()=>mail.active?mailCard():showCard('<h2>Mail bag</h2><p>No mail in the bag today. Start a day at Harbor Field from the title screen and Mabel will load it.</p>',[['Back',back,true]])],["Bea's chart",()=>bigMap()],["Bea's logbook",()=>bea(-1)],['Your logbook',()=>logbook()],['Practice a landing',()=>picker('practice')],['Start at a field',()=>picker('start')],['Hangar',()=>hangarCard()],['Settings',()=>settingsCard()]],{grid:true,colors:MENU_COL});$('cardBody').classList.add('wide');}
/* each pause-menu button gets its own color so they're easy to tell apart at a glance */
const MENU_COL={'Mail bag':'#f2c25a',"Bea's chart":'#7cc4d4',"Bea's logbook":'#a6d38a','Practice a landing':'#c4aee6','Start at a field':'#f0a77c','Your logbook':'#9fc4ef','Settings':'#cfc6b4','Hangar':'#f2a8d4'};
function picker(kind){
  const items=STRIPS.filter(charted).map(s=>{const F=log.fields[s.id];return `<button class="item" data-id="${s.id}"><span><b>${s.name}</b><span class="d">${DESC[s.id]}</span></span><span class="r">${F&&F.best?stars(F.best):'NOT YET'}</span></button>`;}).join('');
  showCard(`<h2>${kind==='practice'?'Practice a landing':'Start at a field'}</h2><div class="sub">${kind==='practice'?'START 1.5 KM OUT, LINED UP, ON THE GLIDE PATH':'START ON THE RUNWAY, ENGINE AT IDLE'} · FIELDS ON YOUR CHART</div><div class="list">${items}</div>`,[['Back',back]]);
  $('cardBody').querySelectorAll('.item').forEach(b=>b.addEventListener('click',()=>{const s=stripById(b.dataset.id);if(kind==='practice')spawnApproach(s);else if(s.id==='harbor'&&!mail.active&&mode==='title')offerDay(()=>spawnField(s));else spawnField(s);}));}
function logbook(){
  const f=STRIPS.map(s=>{const F=log.fields[s.id]||{};return `<div class="item ${F.landings?'done':''}"><span><b>${s.name}</b><span class="d">${F.landings?F.landings+' landing'+(F.landings>1?'s':''):'Not visited yet'}</span></span><span class="r">${F.best?stars(F.best):''}</span></div>`;}).join('');
  const ppl=Object.keys(CHARS).map(id=>log.met[id]?`<div class="item done"><span style="display:flex;gap:10px;align-items:center"><img src="${portrait(id)}" alt="" style="width:40px;height:40px;image-rendering:pixelated"><span><b>${CHARS[id].name}</b><span class="d">${CHARS[id].role}</span></span></span></div>`:`<div class="item"><span><b>???</b><span class="d">Someone you haven't met yet.</span></span></div>`).join('');
  const si=Object.entries(sights).map(([k,v])=>`<div class="item ${log.sights[k]?'done':''}"><span><b>${log.sights[k]?v.name:'???'}</b><span class="d">${log.sights[k]?(v.desc||'Spotted'):v.night?'Something out there only shows itself after dark.':'Something worth seeing. Fly over it to put it on the chart.'}</span></span><span class="chk">${log.sights[k]?'✓':''}</span></div>`).join('');
  const go=GOALS.map(g=>`<div class="item ${log.goals[g.id]?'done':''}"><span><b>${g.name}</b><span class="d">${g.hint}</span></span><span class="chk">${log.goals[g.id]?'✓':''}</span></div>`).join('');
  const done=GOALS.filter(g=>log.goals[g.id]).length;
  showCard(`<h2>Your logbook</h2><div class="sub">${log.flights} FLIGHTS · ${log.trips} TRIPS · ${log.stamps} STAMPS · ${done}/${GOALS.length} GOALS</div><h3>PEOPLE</h3><div class="list">${ppl}</div><h3>FIELDS</h3><div class="list">${f}</div><h3>SIGHTS</h3><div class="list">${si}</div><h3>GOALS</h3><div class="list">${go}</div>`,[['Back',back,true]]);}
const SET=[['tilt','Tilt to steer','Turn the phone like a steering wheel to bank. Tip it toward you to raise the nose, away to lower it. CENTER resets the level point. The touch stick still works.'],['steady','Steady wings','Levels the wings when you let go, and handles the rudder.'],['stallGuard','Stall guard','Stops you pulling the nose up far enough to stall.'],
  ['autoTrim','Auto-trim','Holds your current speed when you let go of the stick.'],['tips','Tips','Short pointers the first time things happen.'],['dog','Biscuit barks at landmarks','A call when you fly near a landmark or gap you haven\'t found. Never at errand items: tap the clue button up top for those.'],
  ['invert','Invert pitch','Drag up to raise the nose instead of down.'],['shadows','Shadows','Long shadows from the sun and moon. Turn off if your phone gets warm.'],['sound','Sound','Engine, wind, music and the stall horn.'],['fps','Frame rate','Shows frames per second, the slowest frame, triangles and draw calls in a strip at the top of the screen while you fly. For checking how your phone keeps up.']];
function settingsCard(){
  const rows=SET.map(([k,n,d])=>`<div class="tog"><div><b>${n}</b><span>${d}</span></div><button data-k="${k}" class="${settings[k]?'on':''}">${settings[k]?'ON':'OFF'}</button></div>`).join('');
  const px=['chunky','classic','fine'].map(k=>`<button data-px="${k}" class="${settings.pixels===k?'primary':''}">${k.toUpperCase()}</button>`).join('');
  const ev=[['OFF',0],['HUSH',.5],['SOFT',1],['FULL',2]].map(([n,v])=>`<button data-ev="${v}" class="${settings.engVol==v?'primary':''}">${n}</button>`).join('');
  const mv=[['OFF',0],['SOFT',.5],['ON',1]].map(([n,v])=>`<button data-mv="${v}" class="${(settings.music??.5)==v?'primary':''}">${n}</button>`).join('');
  const st=STATIONS.map(S=>`<button data-st="${S.id}" class="${settings.station===S.id?'primary':''}">${S.fq} ${S.name.toUpperCase()}</button>`).join('');
  const lt=Object.keys(TOD).map(k=>`<button data-lt="${k}" class="${settings.light===k?'primary':''}">${TOD[k].name.toUpperCase()}</button>`).join('');
  showCard(`<h2>Settings</h2><div class="sub">ASSISTS · TURN THEM OFF ONE AT A TIME AS YOU IMPROVE</div>${rows}<h3>ENGINE VOLUME</h3><div class="btns">${ev}</div><h3>RADIO VOLUME</h3><div class="btns">${mv}</div><h3>RADIO STATION · OR TAP THE DIAL UP TOP WHILE FLYING</h3><div class="btns">${st}</div><h3>TIME OF DAY</h3><div class="btns">${lt}</div><h3>WEATHER · TRYING IT OUT</h3><div class="btns">${Object.entries(WX).map(([k,W])=>`<button data-wx="${k}" class="${settings.weather===k?'primary':''}">${W.name.toUpperCase()}</button>`).join('')}</div><h3>PIXELS</h3><div class="btns">${px}</div><div class="sub" style="margin-top:14px">BUILD __BUILD__</div>`,[['Back',back,true]]);
  const cb=$('cardBody');
  cb.querySelectorAll('[data-k]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.k;if(k==='tilt'){if(!settings.tilt){settings.tilt=true;saveS();enableTilt().then(()=>{updTiltUI();settingsCard();});}else{settings.tilt=false;saveS();disableTilt();updTiltUI();settingsCard();}return;}settings[k]=!settings[k];saveS();if(k==='sound')snd.setOn(settings.sound);if(k==='fps'){$('fps').hidden=!settings.fps;$('fps').textContent='FPS: measuring…';fpsN=fpsT=0;fpsLast=0;}if(k==='sound')music.setVol();settingsCard();}));
  cb.querySelectorAll('[data-px]').forEach(b=>b.addEventListener('click',()=>{settings.pixels=b.dataset.px;pixMode=settings.pixels;saveS();resize();settingsCard();}));
  cb.querySelectorAll('[data-mv]').forEach(b=>b.addEventListener('click',()=>{settings.music=+b.dataset.mv;saveS();snd.init();music.start();music.setVol();updRadioBtn();settingsCard();}));
  cb.querySelectorAll('[data-st]').forEach(b=>b.addEventListener('click',()=>{setStation(b.dataset.st);settingsCard();}));
  cb.querySelectorAll('[data-ev]').forEach(b=>b.addEventListener('click',()=>{settings.engVol=+b.dataset.ev;saveS();settingsCard();}));
  cb.querySelectorAll('[data-wx]').forEach(b=>b.addEventListener('click',()=>{settings.weather=b.dataset.wx;saveS();setTOD(tod);settingsCard();}));
  cb.querySelectorAll('[data-lt]').forEach(b=>b.addEventListener('click',()=>{settings.light=b.dataset.lt;saveS();setTOD(settings.light);updTodBtn();settingsCard();}));}
function showHowTo(){mode='card';
  showCard(`<h2>How to fly</h2><div class="sub">TWO THUMBS</div>
    <div class="rows"><span class="k">LEFT</span><span><b>Throttle lever.</b> Push it up for more power. Beside it, a rail of little buttons folds things away: the map, today's jobs, the landing panel (flap lever, switches, brake), air drops, and the tailwind.</span><span></span>
    <span class="k">RIGHT</span><span><b>Stick.</b> Touch anywhere on the right and drag. Drag down to raise the nose, up to lower it, sideways to bank and turn.</span><span></span>
    <span class="k">TOP</span><span>Speed on the left, <b>height above the ground</b> on the right. On approach they turn green when you're on the numbers. <b>VIEW</b> switches chase, cockpit and gauges.</span><span></span></div>
    <p>To take off: full power, roll down the runway, and at about 45 knots drag the stick down gently. Everything else is in Bea's logbook.</p>`,[['Got it',()=>{hideModal();mode='fly';if(mail.active&&!log.met.bea)setTimeout(meetBea,300);},true]]);}
function toTitle(){mode='title';spawnQuiet=true;spawnField(STRIPS[0]);spawnQuiet=false;mode='title';$('flightUI').hidden=true;$('title').hidden=false;setView('chase');if(typeof titleButtons==='function')titleButtons();}
$('tFly').addEventListener('click',()=>{$('title').hidden=true;if(mail.active)spawnField(STRIPS[0]);else offerDay(()=>spawnField(STRIPS[0]));});
$('tStart').addEventListener('click',()=>{$('title').hidden=true;picker('start');});
$('rotOk').addEventListener('click',()=>{$('rotate').hidden=true;rotDismissed=true;});
let rotDismissed=false;
function checkRotate(){$('rotate').hidden=true;}

/* ---------- checks each frame ---------- */
let sightT=0,hdgPrev=0,turnRate=0,airT=0,swT=0;
function gameChecks(dt){
  if(ac.ground&&ac.td&&!ac.td.done&&ac.u<.6)finishLanding();
  if(!ac.ground)airT+=dt;else airT=0;
  engine(dt);swT-=dt;if(swT<0){swT=.25;updSwitches();}
  axes();const kt=ac.ias*KT,agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z),bank=Math.atan2(-_r.y,_u.y);
  if(ac.ground&&ac.throttle>.5&&kt>40&&!ac.td)tip('rotate','Now drag the stick down gently to lift the nose.');
  if(ac.stallWarn)tip('stall','Stall warning: the wing is running out of lift. Lower the nose to gain speed.');
  if(ac.ice>.3)tip('ice','The engine is running rough. That\'s carb ice from flying at low power. Switch CARB HEAT on to melt it.');
  if(ac.lean&&ac.rough>.3)tip('leanlow','Rough running down low with the mixture lean. Set MIX back to RICH.');
  if(!ac.ground&&Math.abs(bank)>20*DEG&&ac.vel.y<-1.5)tip('turn','In a turn, hold the stick a little down (back) to keep from sinking.');
  if(airT>45)tip('pitchpower','Good to know: the stick mostly sets your speed. Power decides whether you climb or descend.');
  let showCheck=false;
  if(!ac.ground&&dest&&airT>8&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)>3500)tip('tailwind','Long way to go? Tap the wind button under the throttle for a short gust that carries you fast and level. Tap again while it blows to stack gusts and go faster. Charges come back one every 5 seconds once the wind dies down.',.5);
  if(dest){const gl=glide(dest);if(!ac.ground&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)<5500)tip('gates','See the cyan gates? They show the way in. Start lining up at the first one, 2 km out and about 450 ft up.');
    if(gl.active&&gl.along<3200){tip('chkbtn','Want the before-landing checklist? Tap the clipboard on the left to show it. Tap again to hide it.',4);tip('approach','Fly through the three cyan gates. Keep the diamond in the ring at the top of the screen. Flaps down, power back, about 55 knots.');
      if(gl.along<1800)tip('papi','The four lights beside the runway: two white and two red means you\'re on the glide path. All white is too high, all red too low.',3);}
    const st=stripAt(ac.pos.x,ac.pos.z,10);if(st&&!ac.ground&&agl<7&&ac.vel.y<-.5)tip('flare','Just above the runway, ease the stick down (back) to soften the touchdown.');}
  if(ac.ground&&ac.td&&ac.u>8)tip('brake','Hold BRAKE to stop. The longer you hold, the harder it brakes.');
  const ck=$('check');if(settings.panels.chk&&!ac.ground){const c=checklistState();const row=(ok,t)=>`<span class="${ok?'ok':''}">${ok?'✓':'○'} ${t}</span><br>`;
    ck.innerHTML=`<b>BEFORE LANDING</b>${row(c.carb,'CARB HEAT ON')}${row(c.mix,'MIXTURE RICH')}${row(c.flaps,'FLAPS 1 OR 2')}${c.needLight?row(c.light,'LANDING LIGHT'):''}${c.needLight&&typeof rwyLit==='function'?row(rwyLit(dest),'RUNWAY LIGHTS (MIC)'):''}`;ck.hidden=false;tip('checklist','Before-landing checklist: flick the switches and set the flap lever in the landing panel, bottom left. Bea\'s logbook explains each one.',1);}
  else ck.hidden=true;
  sightT+=dt;if(sightT>.3){sightT=0;
    for(const [k,v] of Object.entries(sights)){if(log.sights[k]||!sightOn(v))continue;if(Math.hypot(ac.pos.x-v.x,ac.pos.z-v.z)<450&&ac.pos.y-v.y<650){log.sights[k]=Date.now();stamp(1);addScore(100);addCoins(5);saveL();
      const n=Object.keys(sights).filter(q=>log.sights[q]).length;snd.beep(990);setTimeout(()=>snd.beep(1320),110);setTimeout(()=>snd.beep(1760),220);
      toast(`Discovered: ${v.name} (${n}/${Object.keys(sights).length}) · +100\n${v.desc||''}`,4);tip('discover','Landmarks you discover go on Bea\'s chart, with a stamp for each. Fly over anything that looks interesting.',4.5);}}
    if(!ac.ground&&Math.hypot(ac.pos.x-summit.x,ac.pos.z-summit.z)<320&&ac.pos.y>summit.h+10)goal('summit');}
  const hdg=(Math.atan2(_f.x,-_f.z)/DEG+360)%360;let dh=hdg-hdgPrev;if(dh>180)dh-=360;if(dh<-180)dh+=360;hdgPrev=hdg;turnRate=lerp(turnRate,dh/Math.max(dt,1e-3),.1);
}

/* ---------- HUD ---------- */
let hudT=0,hudWasDrawn=true,lastCall=999,callT=0;
function callout(n){const c=$('callout');c.textContent=n;c.hidden=false;callT=1.1;snd.beep(n<=20?880:660);}
function drawHUD(dt){
  axes();const kt=ac.ias*KT,ft=(ac.pos.y-AC.gearH)*FT,fpm=ac.vel.y*196.85,hdg=(Math.atan2(_f.x,-_f.z)/DEG+360)%360;
  const brg=dest?(Math.atan2(dest.x-ac.pos.x,-(dest.z-ac.pos.z))/DEG+360)%360:0;
  hudT-=dt;if(hudT<=0){hudT=.1;
    const agl=Math.max(0,(ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z))*FT),gl=dest?glide(dest):null,final=!ac.ground&&gl&&gl.active&&gl.along<3500;
    const sinkF=-fpm,spdC=ac.stallWarn?'warn':!final?'':kt>=50&&kt<=62?'ok':(kt>=45&&kt<=75)?'caution':'warn';
    const vC=!final?'':agl<30?(sinkF<300?'ok':sinkF<500?'caution':'bad'):(sinkF>=200&&sinkF<=600?'ok':sinkF<=800&&sinkF>=0?'caution':sinkF<0?'caution':'bad');
    const sp=$('spd');sp.innerHTML=`${Math.round(kt)}<small>KT${final?' · AIM 55':''}</small>`;sp.className='pill '+spdC;
    $('alt').innerHTML=`${agl<100?Math.round(agl):Math.round(agl/10)*10}<small>FT UP</small><span id="vsi" class="${vC}">${Math.abs(fpm)<50?'· 0':(fpm>0?'▲ ':'▼ ')+Math.round(Math.abs(fpm)/10)*10}${final?' <small>AIM ▼400</small>':''}</span>`;
    if(final||(!ac.ground&&stripAt(ac.pos.x,ac.pos.z,60))){for(const c of [100,50,30,20,10]){if(agl<c&&lastCall>c){lastCall=c;callout(c);break;}}}
    if(agl>160||ac.ground)lastCall=999;
    if(dest){const d=Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z);$('destTxt').textContent=`${dest.name} ${d<1000?Math.round(d/10)*10+' m':(d/1000).toFixed(1)+' km'}`;$('arr').style.transform=`rotate(${brg-hdg}deg)`;}}
  $('stallBan').hidden=!(ac.stallWarn&&mode==='fly');
  if(mode==='fly'){drawMiniMap(dt);updCharting(dt);}
  if(lookDown&&(mode==='fly'||mode==='paused')){pb.clear();drawDropSight(dt);pb.flush();hudWasDrawn=true;return;}
  if(camMode==='chase'||mode==='title'){pb.clear();if(mode==='fly'&&approachMeter()){pb.flush();hudWasDrawn=true;}else if(hudWasDrawn){pb.flush();hudWasDrawn=false;}return;}
  hudWasDrawn=true;const bank=Math.atan2(-_r.y,_u.y),pitch=Math.asin(clamp(_f.y,-1,1));
  drawCockpit({kt,bank,pitch,ft,turn:turnRate,slip:clamp(ac.beta*4,-1,1),hdg,brg,fpm,extra:()=>drawExtras()});
}
function approachMeter(){
  if(!dest||ac.ground||mode!=='fly')return false;
  const gl=glide(dest),agl=(ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z))*FT,over=stripAt(ac.pos.x,ac.pos.z,25);
  const w=LW,h=LH,S=Math.max(16,Math.min(Math.round(h*.12),28)),cx=Math.round(w/2),cy=Math.round(h*.3),K=rgba(0x241c2e);
  const txt=(t,x,y,c,left)=>{pb.text(t,x+1,y+1,K,1,!left);pb.text(t,x,y,c,1,!left);};
  /* landing only: not on the way up after takeoff (climbing, or just airborne) */
  if(agl<38&&ac.vel.y<.4&&airT>6&&(over||(gl.active&&gl.along<350))){
    // FLARE: nose angle and sink rate, each with a green target band
    axes();const pitch=Math.asin(clamp(_f.y,-1,1))/DEG,sink=-ac.vel.y*196.85,bw=S*3,x0=cx-Math.round(bw/2),y0=cy-8;
    const bar=(y,lo,hi,g0,g1,v,lab,ok)=>{const X=t=>x0+Math.round((t-lo)/(hi-lo)*bw);pb.rect(x0-1,y-1,bw+2,6,K);pb.rect(x0,y,bw,4,C.face);pb.rect(X(g0),y,X(g1)-X(g0),4,C.green);
      const vx=clamp(X(v),x0,x0+bw-2);pb.rect(vx-2,y-3,5,10,K);pb.rect(vx-1,y-2,3,8,ok?C.white:C.orange);txt(lab,x0-19,y,C.tick,true);};
    const pOk=pitch>=2&&pitch<=8,sOk=sink<300;
    txt(pOk&&sOk?'FLARE - GOOD':'FLARE',cx,y0-12,pOk&&sOk?C.green:C.tick);
    bar(y0,-6,16,2,8,pitch,'NOSE',pOk);bar(y0+14,0,900,0,300,sink,'DROP',sOk);return true;}
  if(!gl.active||gl.along>3600)return false;
  // LINE UP: corner brackets, a ring for "on path", and a diamond showing where the path is. Fly toward the diamond.
  const brk=(sx,sy)=>{pb.rect(cx+sx*S-(sx>0?5:0),cy+sy*S,6,1,K);pb.rect(cx+sx*S-(sx>0?5:0),cy+sy*S-1,6,1,C.tick);pb.rect(cx+sx*S,cy+sy*S-(sy>0?5:0),1,6,C.tick);};
  brk(-1,-1);brk(1,-1);brk(-1,1);brk(1,1);
  const tx=clamp(-gl.lat/(5*DEG),-1,1),ty=clamp((gl.v/DEG-4)/1.5,-1,1),on=Math.abs(tx)<.25&&Math.abs(ty)<.25,rr=Math.max(4,Math.round(S*.28));
  for(let a=0;a<48;a++){const t=a/48*TAU,px=cx+Math.cos(t)*rr,py=cy+Math.sin(t)*rr;pb.px(px+1,py+1,K);pb.px(px,py,on?C.green:C.tick);}
  const mx=Math.round(cx+tx*(S-3)),my=Math.round(cy+ty*(S-3)),dc=on?C.green:C.cyan;
  for(let d=0;d<=3;d++){pb.rect(mx-4+d,my-d-1,9-2*d,1,K);pb.rect(mx-4+d,my+d+1,9-2*d,1,K);}
  for(let d=0;d<=2;d++){pb.rect(mx-3+d,my-d,7-2*d,1,dc);pb.rect(mx-3+d,my+d,7-2*d,1,dc);}
  txt(on?'ON PATH':ty>.25?'TOO HIGH':ty<-.25?'TOO LOW':tx<0?'STEER LEFT':'STEER RIGHT',cx,cy-S-9,on?C.green:C.tick);
  txt((gl.along/1000).toFixed(1)+' KM',cx,cy+S+4,C.tick);
  return true;}
function glideBox(bx,by,hs){
  pb.rect(bx-hs-2,by-hs-2,hs*2+4,hs*2+4,C.bezel);pb.rect(bx-hs,by-hs,hs*2,hs*2,C.face);
  for(let k=-2;k<=2;k++){pb.px(bx+k*hs/2.5,by,C.dim);pb.px(bx,by+k*hs/2.5,C.dim);}
  const gl=dest?glide(dest):{active:false};
  if(gl.active){const nx=bx+clamp(-gl.lat/(5*DEG),-1,1)*(hs-2),ny=by+clamp((gl.v/DEG-4)/1.5,-1,1)*(hs-2);
    pb.rect(Math.round(nx),by-hs+1,1,hs*2-2,C.cyan);pb.rect(Math.round(nx)+1,by-hs+1,1,hs*2-2,C.cyan);
    pb.rect(bx-hs+1,Math.round(ny),hs*2-2,1,C.cyan);pb.rect(bx-hs+1,Math.round(ny)+1,hs*2-2,1,C.cyan);
    if(hs>14)pb.text((gl.along/1000).toFixed(1),bx,by-hs+3,C.tick,1,true);}
  else pb.text('--',bx,by-2,C.dim,1,true);
}
function drawExtras(){
  approachMeter();const T=tachCock;
  if(T){gaugeBase(T);const rA=v=>(-135+clamp(v,0,3000)/3000*270)*DEG;band(T,rA(2100),rA(2550),C.green);ticks(T,rA(0),rA(3000),6,2,C.tick);
    const rpm=600+ac.rpm*1950;needle(T,rA(rpm),T.r-3,C.needle);if(T.r>15)pb.text('RPM',T.x,T.y+Math.round(T.r*.35),C.dim,1,true);}
}

/* ---------- camera & visuals ---------- */
let camLow=0;const camPos=new V3(),_c1=new V3(),_c2=new V3(),_c3=new V3(),tiltQ=new Q().setFromAxisAngle(new V3(1,0,0),-12*DEG);
function updateCam(dt,t){
  axes();
  if(mode==='title'){const a=t*.1,p=ac.pos;camera.position.set(p.x+Math.cos(a)*24,p.y+4.5,p.z+Math.sin(a)*24);camera.up.set(0,1,0);camera.lookAt(p.x,p.y+.5,p.z);return;}
  if(lookDown&&mode!=='crashed'){lookDownCam();return;}
  const outside=camMode==='chase'||mode==='crashed';
  if(outside){
    const bf=_c1.copy(_f);bf.y*=.4;if(bf.lengthSq()<.01)bf.set(0,0,-1);bf.normalize();
    const aglC=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z);camLow=lerp(camLow,ac.ground||mode==='crashed'?camLow*.98:1-smooth(8,70,aglC),1-Math.exp(-dt*2));
    const des=_c2.copy(ac.pos).addScaledVector(bf,-15-camLow*5).add(_c3.set(0,4.2+camLow*2.4,0));
    const gh=surfH(des.x,des.z)+2;if(des.y<gh)des.y=gh;
    if(snapCam){camPos.copy(des);snapCam=false;}else camPos.lerp(des,1-Math.exp(-dt*4));
    camera.position.copy(camPos);
    if(ac.ground&&ac.u>4){const st=stripAt(ac.pos.x,ac.pos.z);if(!st||st.surf!=='paved')camera.position.y+=(hash2((t*30)|0,1,9)-.5)*.06*Math.min(ac.u/15,1);}
    camera.up.set(0,1,0).lerp(_u,.22).normalize();camera.lookAt(_c3.copy(ac.pos).addScaledVector(_f,6).add(_c2.set(0,1.2-camLow*4.4,0)));
  } else {
    camera.position.copy(ac.pos).add(_c1.set(0,.5,-.85).applyQuaternion(ac.q));camera.quaternion.copy(ac.q).multiply(tiltQ);
    if((ac.stall&&!ac.ground)||ac.rough>.3){camera.position.x+=(hash2((t*40)|0,3,3)-.5)*.04;}
  }
}
const _sc=new V3(),_lr=new V3(),_lu=new V3(),_wy=new V3(0,1,0);
function snapShadow(c){_lr.crossVectors(_wy,sunDir);if(_lr.lengthSq()<1e-5)_lr.set(1,0,0);_lr.normalize();_lu.crossVectors(sunDir,_lr).normalize();
  const tx=2*SHADOW_HALF/sunL.shadow.mapSize.x,a=c.dot(_lr),b=c.dot(_lu);c.addScaledVector(_lr,Math.round(a/tx)*tx-a).addScaledVector(_lu,Math.round(b/tx)*tx-b);}
function sunBlocked(p){const hl=Math.hypot(sunDir.x,sunDir.z);if(sunDir.y<=0||hl<1e-3)return false;const ux=sunDir.x/hl,uz=sunDir.z/hl,tan=sunDir.y/hl;
  for(let k=1;k<110;k++){const d=k*30,ray=p.y+d*tan;if(ray>720)return false;if(groundH(p.x+ux*d,p.z+uz*d)>ray)return true;}return false;}
let litT=0,planeTarget=1,fogK=-1;const WXF={on:false,col:new THREE.Color(),n:0,f:0};const _fc=new THREE.Color(),_fc2=new THREE.Color();
function updFog(){const I=ISLES.farhold,p=camera.position,k=smooth(4200,1300,Math.hypot(p.x-I.x,p.z-I.z));if(Math.abs(k-fogK)<.003)return;fogK=k;const T=TOD[tod];
  if(WXF.on)_fc.copy(WXF.col);else _fc.setHex(T.hor);const gy=(_fc.r+_fc.g+_fc.b)/3;_fc2.setRGB(gy,gy,gy*1.04).lerp(_fc,.35);const fc=_fc.clone().lerp(_fc2,k);
  scene.fog.color.copy(fc);scene.fog.near=lerp(WXF.on?WXF.n:T.fogN,25,k);scene.fog.far=lerp(WXF.on?WXF.f:T.fogF,720,k);
  const w=waterMat.uniforms;w.fogColor.value.copy(fc);w.fogNear.value=scene.fog.near;w.fogFar.value=scene.fog.far;
  const u=skyMat.uniforms;[['cZen',T.zen,.75],['cHigh',T.high,.9],['cHor',T.hor,1],['cHaze',T.haze,1],['cSun',T.sunc,.8]].forEach(([n,h,a])=>u[n].value.setHex(h).lerp(fc,k*a));u.uDisc.value=k>.6?2:T.disc;}
function stepBumps(dt){const I=ISLES.kettle,d=Math.hypot(ac.pos.x-I.x,ac.pos.z-I.z);if(d>2300)return;const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z);if(agl<12)return;
  const k=smooth(2300,900,d)*clamp(agl/40,0,1)*clamp(1.6-(ac.pos.y-200)/500,0,1);ac.vel.y+=(vnoise(simT*.8,1,7)-.5)*6*k*dt+(d<700?1.4*k*dt:0);ac.vel.x+=(vnoise(simT*.6,2,7)-.5)*3*k*dt;}
function updateVisuals(dt,t){
  plane.position.copy(ac.pos);plane.quaternion.copy(ac.q);
  litT-=dt;if(litT<=0){litT=.15;planeTarget=sunBlocked(ac.pos)?0:1;}planeLit.value=lerp(planeLit.value,planeTarget,1-Math.exp(-dt*6));
  const outside=camMode==='chase'||(mode!=='fly'&&mode!=='paused');
  const U=plane.userData;U.bodyM.visible=outside;U.blades.visible=outside;
  const running=mode!=='crashed';ac.rpm=lerp(ac.rpm,running?.22+ac.throttle*ac.pf*.78+Math.min(ac.ias/60,.3):0,1-Math.exp(-dt*3));
  ac.prop+=ac.rpm*60*dt;U.blades.rotation.z=ac.prop;U.disc.material.opacity=running?.06+ac.rpm*.2:0;
  const gh=surfH(ac.pos.x,ac.pos.z),agl=ac.pos.y-AC.gearH-gh;
  blob.visible=mode!=='crashed'&&mode!=='title'&&agl<220;if(blob.visible){plane.updateMatrix();_flat.set(1,0,0,0, 0,0,0,gh+.22, 0,0,1,0, 0,0,0,1);blob.matrix.multiplyMatrices(_flat,plane.matrix);blob.matrixWorld.copy(blob.matrix);
    blob.material.opacity=(settings.shadows?.42:.55)*(1-smooth(4,200,agl))+(ac.ground?.08:0);}
  if(dest){beacon.visible=mode==='fly'||mode==='paused';beacon.position.set(dest.x,dest.elev,dest.z);const d=Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z);beacon.material.opacity=.13*smooth(500,1600,d);}
  spot.intensity=ac.light&&mode!=='title'?(TOD[tod].lights>0?1.35:.3):0;
  updPAPI();updGates();updWind(dt);updFog();updDrops(dt);updSwitchesFx(dt);updUpdraft(dt);updDecor(dt,t);updPanels();updDog(dt,t);if(typeof updPet==='function')updPet(t);updSpark(dt,t);
  {const fb=(lookDown?64:camMode==='chase'?58:70)+(ac.bst||0)*6;if(Math.abs(camera.fov-fb)>.05){camera.fov=fb;camera.updateProjectionMatrix();}}
  sunL.castShadow=settings.shadows;const fo=mode==='title'?ac.pos:camera.position;
  axes();_sc.set(fo.x+_f.x*SHADOW_HALF*.5,surfH(fo.x,fo.z),fo.z+_f.z*SHADOW_HALF*.5);snapShadow(_sc);sunL.target.position.copy(_sc);sunL.position.copy(_sc).addScaledVector(sunDir,1500);
  if(mode==='crashed'){crashT+=dt;smokeBurst.forEach(m=>{m.position.y+=dt*m.userData.v*1.5;m.scale.setScalar(Math.min(.5+crashT*m.userData.v*1.5,6));});}
  snd.update(ac.rpm,ac.ias+(ac.bst||0)*22,ac.stallWarn,mode==='fly',ac.rough);
}

const _mistW=new THREE.Color(0xffffff);
/*@PLAY@*/

/* ---------- main loop ---------- */
let acc=0,last=performance.now(),fpsN=0,fpsT=0,fpsLast=0,fpsPrev=0,fpsMin=999;renderer.info.autoReset=false;
function loop(now){
  const dt=clamp((now-last)/1000,0,.05);last=now;const t=now/1000;
  skyMat.uniforms.uTime.value=t;waterMat.uniforms.uTime.value=t;for(const a of anims)a(t);
  cloudGroup.position.set((t*2.2)%4000,0,-(t*.8)%4000);
  {const pu=postMat.uniforms;pu.mist.value=lerp(pu.mist.value,cloudMist(camera.position),1-Math.exp(-dt*5));pu.mistC.value.copy(scene.fog.color).lerp(_mistW,.3);}
  if(mode==='fly'){readInput(dt);acc+=dt;const H_=1/120;let n=0;while(acc>=H_&&n<10){if(ac.ground)stepGround(H_);else{stepAir(H_);stepBoost(H_);stepUp(H_);stepBumps(H_);if(typeof stepWeather==='function')stepWeather(H_);if(typeof stepGuard==='function')stepGuard(H_);}simT+=H_;acc-=H_;n++;if(mode!=='fly')break;}if(n>=10)acc=0;
    if(!Number.isFinite(ac.pos.x+ac.pos.y+ac.pos.z+ac.vel.x+ac.vel.y+ac.vel.z+ac.q.x+ac.q.w)){console.warn('sim NaN, respawning');spawnField(stripById(ac.lastField)||STRIPS[0]);}
    if(mode==='fly'){gameChecks(dt);playChecks(dt);}runTips(dt);}
  else acc=0;
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').hidden=true;}
  if(callT>0){callT-=dt;if(callT<=0)$('callout').hidden=true;}
  updateVisuals(dt,t);updateCam(dt,t);cullChunks(camera.position);waterMat.uniforms.uCamY.value=camera.position.y;if(typeof spotUniforms==='function'){camera.updateMatrixWorld();spotUniforms();}sky.position.copy(camera.position);
  renderer.info.reset();renderer.setRenderTarget(rt);renderer.render(scene,camera);const tri=renderer.info.render.triangles,dc=renderer.info.render.calls;renderer.setRenderTarget(null);renderer.render(postScene,postCam);
  drawHUD(dt);
  if(settings.fps){fpsN++;fpsT+=now-(fpsLast||now);fpsLast=now;fpsMin=Math.min(fpsMin,1000/Math.max(now-(fpsPrev||now-16),1));fpsPrev=now;
    if(fpsT>=500){$('fps').textContent=`${Math.round(fpsN*1000/fpsT)} FPS · LOW ${Math.round(fpsMin)} · ${(tri/1e6).toFixed(2)}M TRI · ${dc} DRAWS · ${LW}×${LH}`;fpsN=0;fpsT=0;fpsMin=999;}}
  requestAnimationFrame(loop);
}
addEventListener('resize',()=>{setRot();resize();setThrottleUI();placeRingIdle();checkRotate();});
$('wind').addEventListener('click',e=>{e.stopPropagation();useWind();});pixMode=settings.pixels;resize();setTOD(settings.light);toTitle();placeRingIdle();checkRotate();refreshBag();applyPanels();
updScore();updErrandUI();updTodBtn();updRadioBtn();$('lookBtn').addEventListener('click',e=>{e.stopPropagation();toggleLook();});$('dropBtn').addEventListener('click',e=>{e.stopPropagation();doDrop();});updParcelUI();$('radioBtn').addEventListener('click',e=>{e.stopPropagation();turnDial();});const ld=$('load');if(ld)ld.hidden=true;$('fps').hidden=!settings.fps;$('fps').textContent='FPS: measuring…';
requestAnimationFrame(loop);
