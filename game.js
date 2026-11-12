/* Sekinchan Frenzy - game.js */
(()=>{
'use strict';
/* Sekinchan Frenzy — core: helpers, data, icons, layout, state */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
function mkRng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
const store={
  get(k,d){try{const v=localStorage.getItem('sf_'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{localStorage.setItem('sf_'+k,JSON.stringify(v));}catch(e){}}
};
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const RM=n=>'RM'+Math.round(n);
const REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- data ---------- */
const COLS=5,ROWS=3,NP=15,CAP=30,LORRY_CAP=15,LORRY_TIME=8;
const ITEMS={
  padi:{n:'Padi',en:'paddy grain',price:6},
  jerami:{n:'Jerami',en:'straw',price:3},
  beras:{n:'Beras',en:'milled rice',price:20},
  cendawan:{n:'Cendawan Jerami',s:'Cendawan',en:'straw mushroom',price:30},
  kuih:{n:'Kuih Apam',s:'Kuih',en:'steamed rice cake',price:55}
};
const IKEYS=['padi','jerami','beras','cendawan','kuih'];
const BUILDS={
  mill:{n:'Kilang Padi',en:'rice mill',in:'padi',nin:2,out:'beras',time:5,cost:120,roof:'#8a3d2a',wall:'#b9773e'},
  shed:{n:'Bangsal Cendawan',en:'mushroom shed',in:'jerami',nin:3,out:'cendawan',time:6,cost:150,roof:'#5d6f3a',wall:'#a98a5a'},
  kitchen:{n:'Dapur Kuih',en:'kuih kitchen',in:'beras',nin:2,out:'kuih',time:6,cost:250,roof:'#2f6fb5',wall:'#e3c9a0'}
};
const BKEYS=['mill','shed','kitchen'];
const GUARDS={
  scarecrow:{n:'Orang-orang',en:'scarecrow · half as many birds',cost:80},
  owl:{n:'Rumah burung hantu',en:'barn owl box · half as many rats',cost:100},
  pump:{n:'Pam air',en:'water pump · faster flow',cost:120},
  dron:{n:'Dron',en:'sprays baja or racun on a whole row',cost:180}
};
const GKEYS=['scarecrow','owl','pump','dron'];
const MACH={
  traktor:{n:'Traktor',verb:'Bajak',cost:1,spd:2.6,rear:true,btn:'#mTraktor',need:'Nothing to plough. The Traktor works empty, stubble or dead petak.'},
  tanam:{n:'Mesin Tanam',verb:'Tanam',cost:2,spd:2.4,rear:true,btn:'#mTanam',need:'Mesin Tanam needs ploughed petak flooded to Basah.'},
  tuai:{n:'Mesin Tuai',verb:'Tuai',cost:1,spd:2.2,rear:false,btn:'#mTuai',need:'Mesin Tuai needs ripe (gold) padi drained to Kering.'}
};
const MKEYS=['traktor','tanam','tuai'];
const PEST={
  bird:{n:'burung pipit',en:'sparrow',eat:6.5},
  snail:{n:'siput gondang',en:'golden apple snail',eat:9},
  rat:{n:'tikus sawah',en:'field rat',eat:7}
};
const ALL=['mill','shed','kitchen','scarecrow','owl','pump','dron'];
const LEVELS=[
  {name:'Musim Pertama',goals:{padi:8},money:70,gold:130,silver:210,pests:{bird:20},bk:null,unlock:[],pre:[],
   tip:'Your first season. Send the <b>Traktor</b> to plough (bajak), tap each petak to flood it <b>Basah</b>, then send the <b>Mesin Tanam</b>. Lower the water to <b>Sederhana</b> once seedlings are up, drain to <b>Kering</b> when the padi turns gold, and send the <b>Mesin Tuai</b>. The guide bar always tells you the next step.'},
  {name:'Siput Gondang',goals:{padi:12,jerami:8},money:90,gold:210,silver:320,pests:{bird:18,snail:15},bk:[.72,.28,30],unlock:['scarecrow'],pre:[],
   tip:'<b>Siput gondang</b> (golden apple snails) eat young seedlings in Basah petak. Tap them off for RM1 each. Tap stubble after harvest to collect <b>Jerami</b> (straw). The bangkenal now rises and falls: when it is low, water flows slower.'},
  {name:'Kilang Padi',goals:{beras:5,rm:180},money:230,gold:310,silver:450,pests:{bird:16,snail:17,bena:32},bk:[.65,.30,28],unlock:['mill','scarecrow','pump','dron'],pre:[],
   tip:'Build the <b>Kilang Padi</b> (rice mill): 2 Padi become 1 Beras worth RM20. Watch for <b>bena perang</b> (brown planthopper): it spreads between Basah petak. Spray <b>Racun</b>, or lower the water to Sederhana to drive it out. Sell with the lorry to reach RM180.'},
  {name:'Cendawan Jerami',goals:{cendawan:3,beras:5},money:300,gold:400,silver:560,pests:{bird:14,snail:16,rat:20,bena:28},bk:[.60,.35,26],unlock:ALL,pre:['mill'],
   tip:'Straw is money too: the <b>Bangsal Cendawan</b> grows 1 Cendawan Jerami from 3 Jerami. <b>Tikus sawah</b> (field rats) raid Kering padi, so do not leave ripe padi dry for long. Catch one for RM5, or put up a barn owl box.'},
  {name:'Pesta Menuai',goals:{kuih:4,rm:500},money:420,gold:520,silver:720,pests:{bird:11,snail:14,rat:16,bena:24},bk:[.55,.40,24],unlock:ALL,pre:['mill'],
   tip:'Harvest festival! The <b>Dapur Kuih</b> steams 2 Beras into 1 Kuih Apam worth RM55. Use <b>Baja</b> for double Padi, keep every petak busy, and keep the lorry running to Pasar Sekinchan.'}
];
const DIFF={
  santai:{n:'Santai',pest:1.9,eat:1.6,medal:1.5,money:1.6,goal:.7,grow:1.35,free:true,mspd:1.3},
  biasa:{n:'Biasa',pest:1,eat:1,medal:1,money:1,goal:1,grow:1,free:false,mspd:1}
};

/* ---------- icons (all drawn in SVG) ---------- */
const drop=(x,on)=>`<path d="M${x} 4q-4.2 6.5-4.2 10a4.2 4.2 0 0 0 8.4 0q0-3.5-4.2-10z" fill="${on?'#4aa3d6':'none'}" stroke="${on?'#236a94':'#9a927a'}" stroke-width="1.3"/>`;
const IC={
  logo:'<circle cx="12" cy="12" r="11" fill="#f2c230"/><path d="M12 21V8" stroke="#2f7d22" stroke-width="2" stroke-linecap="round"/><path d="M12 12Q8 11 5 7M12 12q4-1 7-5M12 16q-4-1-7-4M12 16q4-1 7-4" stroke="#2f7d22" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="12" cy="5.5" rx="1.8" ry="3" fill="#fff8d0" stroke="#b8860b" stroke-width=".8"/>',
  coin:'<circle cx="12" cy="12" r="10" fill="#f2c230" stroke="#b8860b" stroke-width="2"/><text x="12" y="15.4" font-size="8.5" font-weight="900" text-anchor="middle" fill="#7a5200" font-family="Verdana,sans-serif">RM</text>',
  sound:'<path d="M3 9v6h4l5 4V5L7 9z" fill="currentColor"/><path class="on" d="M15.5 9q2 3 0 6M18.5 6.5q4 5.5 0 11" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path class="off" d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  music:'<path d="M9 18V5l10-2v13" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6.5" cy="18" r="3" fill="currentColor"/><circle cx="16.5" cy="16" r="3" fill="currentColor"/><path class="off" d="M3 3l18 18" stroke="#ff9d8f" stroke-width="2.5" stroke-linecap="round"/>',
  pause:'<rect x="6" y="5" width="4.500" height="14" rx="1.5" fill="currentColor"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.5" fill="currentColor"/>',
  point:'<path d="M4 12h13M12 6l6 6-6 6" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  traktor:'<rect x="9" y="11" width="11" height="5" rx="1" fill="#f28a1e"/><rect x="5" y="8.500" width="6" height="8" rx="1" fill="#e0701a"/><path d="M5.5 8.500V4.5h7v4" fill="none" stroke="#333" stroke-width="1.3"/><rect x="4" y="3.2" width="10" height="1.700" rx=".8" fill="#333"/><rect x="17" y="6" width="1.5" height="5" fill="#444"/><circle cx="8" cy="17" r="5" fill="#222"/><circle cx="8" cy="17" r="2" fill="#f2c230"/><circle cx="19" cy="18.500" r="3" fill="#222"/><circle cx="19" cy="18.5" r="1.1" fill="#f2c230"/>',
  tanam:'<rect x="8" y="12" width="12" height="5" rx="1.5" fill="#fff" stroke="#2f6fb5" stroke-width="1"/><rect x="14" y="9" width="6" height="4" rx="1" fill="#2f6fb5"/><path d="M3 15L9 6" stroke="#a9b3b8" stroke-width="5.500" stroke-linecap="round"/><path d="M3.5 14l5-7.500" stroke="#5cc04a" stroke-width="3" stroke-dasharray="1.6 1"/><circle cx="10" cy="19" r="3" fill="#222"/><circle cx="18" cy="19" r="3" fill="#222"/><circle cx="12" cy="8" r="2" fill="#f0c9a0"/>',
  tuai:'<rect x="5" y="8" width="12" height="9" rx="1.5" fill="#d93a2b"/><rect x="12" y="5" width="6" height="6" rx="1" fill="#9fd4ee" stroke="#7a1d12" stroke-width="1"/><rect x="5" y="6" width="7" height="3" fill="#f2c230"/><rect x="3" y="17" width="15" height="4.5" rx="2.2" fill="#222"/><path d="M18 14h4v5h-4z" fill="#b02a1e"/><circle cx="21.300" cy="14.500" r="2.200" fill="none" stroke="#f2c230" stroke-width="1.2"/>',
  gate:'<rect x="3" y="8" width="3" height="14" fill="#b9b9b0"/><rect x="18" y="8" width="3" height="14" fill="#b9b9b0"/><rect x="2" y="6.500" width="20" height="3" fill="#d2d2c9"/><rect x="7" y="12" width="10" height="10" fill="#5d6f7a"/><path d="M12 6v6" stroke="#444" stroke-width="1.6"/><circle cx="12" cy="4" r="3" fill="none" stroke="#d93a2b" stroke-width="1.7"/><path d="M9 4h6M12 1v6" stroke="#d93a2b" stroke-width="1.1"/>',
  hand:'<path d="M8.500 22q-2.500-3-4.500-7.500q-.6-1.800 1-2.200q1.300-.2 2 1.200l1 1.500V5.500a1.500 1.500 0 0 1 3 0V11V3.500a1.500 1.500 0 0 1 3 0V11V5a1.500 1.500 0 0 1 3 0v7V8a1.400 1.400 0 0 1 2.800 0v8q0 6-6 6z" fill="#f0c9a0" stroke="#8a5a2b" stroke-width="1.100" stroke-linejoin="round"/>',
  drop3:drop(5,1)+drop(12,1)+drop(19,1),
  drop2:drop(5,1)+drop(12,1)+drop(19,0),
  drop1:drop(5,1)+drop(12,0)+drop(19,0),
  baja:'<path d="M6 7q6-3 12 0l1.200 13q-7.200 2-14.400 0z" fill="#f4f1e4" stroke="#8a7a50" stroke-width="1.2"/><path d="M8 6q4-3.500 8 0" stroke="#8a7a50" stroke-width="1.5" fill="none"/><text x="12" y="16" font-size="5.800" font-weight="900" text-anchor="middle" fill="#2f7d22" font-family="Verdana,sans-serif">NPK</text>',
  racun:'<rect x="7" y="10" width="9" height="12" rx="2" fill="#3d8fbd"/><rect x="9" y="5" width="5" height="5" fill="#2a6a8f"/><path d="M14 6.500h4" stroke="#2a6a8f" stroke-width="2"/><path d="M19.500 4.500l2.500-1M19.500 6.500H22.500M19.500 8.500l2.500 1" stroke="#8fd3f2" stroke-width="1.3" stroke-linecap="round"/><rect x="8.500" y="13" width="6" height="5.500" fill="#fff"/><path d="M10 14.200l3 3M13 14.200l-3 3" stroke="#d93a2b" stroke-width="1.2"/>',
  drone:'<rect x="8" y="10" width="8" height="5" rx="2" fill="#39424a"/><path d="M4 9.500h6M14 9.500h6" stroke="#39424a" stroke-width="1.5"/><ellipse cx="5" cy="8" rx="4" ry="1.200" fill="#8fa3b0"/><ellipse cx="19" cy="8" rx="4" ry="1.200" fill="#8fa3b0"/><rect x="10" y="15" width="4" height="4" fill="#8fd3f2"/><path d="M9.500 20l-1 2.500M12 20v2.500M14.500 20l1 2.500" stroke="#4aa3d6" stroke-width="1.1" stroke-linecap="round"/>',
  lorry:'<rect x="2" y="7" width="12" height="9.500" fill="#c4914f" stroke="#2f6fb5" stroke-width="1.2"/><path d="M14 9h5l3 4v3.500h-8z" fill="#fff" stroke="#8d9499" stroke-width="1"/><path d="M3 7q5-4.500 10 0z" fill="#e9b824"/><circle cx="7" cy="18" r="2.600" fill="#222"/><circle cx="18" cy="18" r="2.600" fill="#222"/>',
  mill:'<path d="M3 11l9-7 9 7z" fill="#8a3d2a"/><rect x="5" y="11" width="14" height="8" fill="#b9773e"/><path d="M7 19v3M17 19v3" stroke="#5b3d24" stroke-width="2"/><rect x="10" y="13" width="4" height="6" fill="#6b4526"/>',
  stor:'<rect x="3" y="9" width="18" height="12" rx="1" fill="#c4914f" stroke="#7a5c36" stroke-width="1.2"/><path d="M3 13h18M3 17h18" stroke="#7a5c36"/><path d="M2 9l10-6 10 6z" fill="#8a3d2a"/>',
  padi:'<path d="M12 22V7" stroke="#8a9a2a" stroke-width="1.600" stroke-linecap="round"/><g fill="#e9b824" stroke="#b8860b" stroke-width=".7"><ellipse cx="12" cy="4.500" rx="1.700" ry="2.800"/><ellipse cx="8.500" cy="8" rx="1.600" ry="2.700" transform="rotate(-28 8.500 8)"/><ellipse cx="15.500" cy="8" rx="1.600" ry="2.700" transform="rotate(28 15.500 8)"/><ellipse cx="8" cy="12.500" rx="1.600" ry="2.700" transform="rotate(-28 8 12.500)"/><ellipse cx="16" cy="12.500" rx="1.600" ry="2.700" transform="rotate(28 16 12.500)"/><ellipse cx="8.500" cy="17" rx="1.500" ry="2.500" transform="rotate(-28 8.500 17)"/><ellipse cx="15.500" cy="17" rx="1.500" ry="2.500" transform="rotate(28 15.500 17)"/></g>',
  jerami:'<rect x="3" y="8" width="18" height="12" rx="3" fill="#d9c27a" stroke="#a08a48" stroke-width="1.2"/><path d="M9 8v12M15 8v12" stroke="#a0522d" stroke-width="1.5"/><path d="M5 11h3M10 14h4M17 17h2M5 17h2M16.500 11h3" stroke="#b79f58" stroke-linecap="round"/>',
  beras:'<path d="M6 8q6-2 12 0l1.500 12q-7.500 2-15 0z" fill="#fbf7ea" stroke="#9a8a60" stroke-width="1.2"/><path d="M8.500 7.300l1-3.300h5l1 3.300" fill="#e6dcc0" stroke="#9a8a60"/><g fill="#d9cfae"><ellipse cx="10" cy="13" rx="1" ry="1.800"/><ellipse cx="13.500" cy="14.500" rx="1" ry="1.800" transform="rotate(30 13.500 14.500)"/><ellipse cx="11" cy="17" rx="1" ry="1.800" transform="rotate(-30 11 17)"/></g>',
  cendawan:'<path d="M3.500 12.500a8.500 7.500 0 0 1 17 0z" fill="#b9906a" stroke="#7a5a3a" stroke-width="1.2"/><path d="M10 12.500h4l1 8.500h-6z" fill="#f4ead8" stroke="#7a5a3a" stroke-width="1.2"/><circle cx="9" cy="9" r="1" fill="#e9d3b8"/><circle cx="14.500" cy="8" r="1.200" fill="#e9d3b8"/>',
  kuih:'<path d="M6 13h12l-2 8H8z" fill="#f7e3b0" stroke="#b58a3a" stroke-width="1.2"/><path d="M5 13q0-7.500 7-7.500t7 7.500z" fill="#f6a8c0" stroke="#c0607f" stroke-width="1.2"/><path d="M12 5.500V13M8.500 7l1.500 6M15.500 7L14 13" stroke="#fff" stroke-width="1"/>',
  rm:'<circle cx="12" cy="12" r="10" fill="#f2c230" stroke="#b8860b" stroke-width="2"/><text x="12" y="15.400" font-size="8.500" font-weight="900" text-anchor="middle" fill="#7a5200" font-family="Verdana,sans-serif">RM</text>',
  scarecrow:'<path d="M12 9v13M5 12.500h14" stroke="#7a5c36" stroke-width="2" stroke-linecap="round"/><path d="M7.500 11h9l-1 7.500h-7z" fill="#d93a2b"/><circle cx="12" cy="7" r="3" fill="#f0d9a0"/><path d="M5.500 6.500L12 2l6.500 4.500z" fill="#c9a24a" stroke="#8a6a1a" stroke-width=".8"/>',
  owl:'<path d="M12 14v8" stroke="#7a5c36" stroke-width="2.2"/><rect x="6" y="5" width="12" height="10" rx="1" fill="#b9773e" stroke="#5b3d24"/><path d="M4.500 5.500L12 2l7.500 3.500z" fill="#5b3d24"/><circle cx="12" cy="10" r="3.200" fill="#2b2118"/><circle cx="10.900" cy="9.600" r=".9" fill="#ffd95a"/><circle cx="13.100" cy="9.600" r=".9" fill="#ffd95a"/>',
  pump:'<rect x="4" y="11" width="11" height="8" rx="2" fill="#2f6fb5"/><circle cx="9.500" cy="15" r="2.500" fill="#9fd4ee"/><path d="M15 13.500h5V9" stroke="#666" stroke-width="2.400" fill="none"/><path d="M20 4q-2.500 3.500 0 4.300q2.500-.8 0-4.300z" fill="#4aa3d6"/><path d="M3 21h14" stroke="#444" stroke-width="2" stroke-linecap="round"/>',
  dron:'<rect x="8" y="10" width="8" height="5" rx="2" fill="#39424a"/><path d="M4 9.500h6M14 9.500h6" stroke="#39424a" stroke-width="1.5"/><ellipse cx="5" cy="8" rx="4" ry="1.200" fill="#8fa3b0"/><ellipse cx="19" cy="8" rx="4" ry="1.200" fill="#8fa3b0"/><rect x="10" y="15" width="4" height="4" fill="#8fd3f2"/>',
  medal:'<path d="M8 2h3l2 7h-3zM16 2h-3l-2 7h3z" fill="#d93a2b"/><circle cx="12" cy="15" r="7" fill="currentColor" stroke="rgba(0,0,0,.28)" stroke-width="1.2"/><circle cx="12" cy="15" r="3.600" fill="rgba(255,255,255,.4)"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2" fill="#9a927a"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#9a927a" stroke-width="2.4"/>'
};
function icon(n,cls){return `<svg class="ic${cls?' '+cls:''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;}
function hydrateIcons(root){$$('i[data-ic]',root).forEach(e=>{const t=document.createElement('template');t.innerHTML=icon(e.dataset.ic,e.className);e.replaceWith(t.content.firstChild);});}

/* ---------- layout of the sawah plane (logical units) ---------- */
const L={mobile:null,PW:1000,PH:620};
function setLayout(mobile){
  L.mobile=mobile;L.PW=1000;L.PH=mobile?900:620;
  if(mobile){L.bk0=6;L.bk1=50;L.fx0=96;L.fx1=900;L.fy0=118;L.fy1=822;L.bi=7;}
  else{L.bk0=14;L.bk1=74;L.fx0=140;L.fx1=850;L.fy0=98;L.fy1=556;L.bi=5;}
  L.pw=(L.fx1-L.fx0)/COLS;L.ph=(L.fy1-L.fy0)/ROWS;
  L.py=L.fy0-34;L.pz0=mobile?34:30;L.pz1=L.pz0+14;
  L.par0=L.fy1+10;L.par1=L.fy1+(mobile?42:36);
  L.rx0=L.fx1+12;L.rx1=L.PW-6;L.rx=(L.rx0+L.rx1)/2;L.rw=L.rx1-L.rx0;
  L.padY=L.fy0+(L.fy1-L.fy0)*.52;L.padR=Math.min(36,L.rw*.42);
  L.shedY=L.fy0+(L.fy1-L.fy0)*.2;L.owlY=L.fy0+(L.fy1-L.fy0)*.88;
  L.gx=L.bk1+10;L.gy=L.py+8;
  L.U=L.pw*.6/100;
  L.hill=Math.sqrt(L.pw*L.ph)/147;
}

/* ---------- state ---------- */
const G={lvl:0,diff:store.get('diff','santai'),D:DIFF.santai,L:LEVELS[0],running:false,paused:false,won:false,t:0,
  money:0,stor:{},made:{},goals:[],gate:false,palong:100,bk:1,tool:'tangan',petak:[],pests:[],spawnT:{},
  builds:{},guards:{},lorry:{st:'idle',t:0,load:null,val:0,n:0},drone:null,hover:-1,focus:-1,pulse:-1,filling:0,draining:0,colFill:[0,0,0,0,0]};
if(!DIFF[G.diff])G.diff='santai';
const M={};
MKEYS.forEach(id=>{M[id]={id,active:false,x:0,y:0,face:-1,seg:'',p:null,lane:0,ldir:1,pdir:1,tx:0,ty:0,sx:0,sy:0,done:0,total:0,oi:-1,wheel:0,tank:0,tray:1,alpha:0,anim:0,working:false,fin:0};});
const ORDER=[];for(let r=ROWS-1;r>=0;r--){for(let k=0;k<COLS;k++){const c=(r%2===0)?COLS-1-k:k;ORDER.push(r*COLS+c);}}
const rowDir=r=>r%2===0?-1:1;

function mkPetak(){
  const a=[];
  for(let i=0;i<NP;i++){
    const R=mkRng(1000+i*7919);
    const p={i,c:i%COLS,r:(i/COLS)|0,st:'empty',g:0,water:0,wt:0,lv:0,baja:false,racunT:0,ripeT:0,stubT:0,bena:0,benaSp:0,benaDie:0,pest:null,work:null,splT:0,hintC:'',
      x0:0,y0:0,x1:0,y1:0,ju:new Float32Array(42),jv:new Float32Array(42),hx:new Float32Array(42),hy:new Float32Array(42),hs:new Float32Array(42),hn:new Float32Array(42),hv:new Uint8Array(42),
      cu:new Float32Array(14),cv:new Float32Array(14),cs:new Float32Array(14),su:new Float32Array(16),sv:new Float32Array(16),sa:new Float32Array(16),ru:new Float32Array(4),rv:new Float32Array(4),cr:[]};
    for(let n=0;n<42;n++){p.ju[n]=(R()-.5)*.56;p.jv[n]=(R()-.5)*.44;p.hs[n]=.86+R()*.3;p.hv[n]=(R()*5)|0;}
    for(let n=0;n<14;n++){p.cu[n]=.05+R()*.9;p.cv[n]=.06+R()*.88;p.cs[n]=.6+R()*.9;}
    for(let n=0;n<16;n++){p.su[n]=.05+R()*.9;p.sv[n]=.06+R()*.88;p.sa[n]=R()*3.14;}
    for(let n=0;n<4;n++){p.ru[n]=R();p.rv[n]=.12+R()*.76;}
    for(let n=0;n<5;n++){const pts=[];let u=.1+R()*.8,v=.1+R()*.8;for(let k=0;k<4;k++){pts.push(u,v);u=clamp(u+(R()-.5)*.3,.03,.97);v=clamp(v+(R()-.5)*.3,.04,.96);}p.cr.push(pts);}
    a.push(p);
  }
  return a;
}
function geomPetak(p){
  p.x0=L.fx0+p.c*L.pw+L.bi;p.x1=L.fx0+(p.c+1)*L.pw-L.bi;p.y0=L.fy0+p.r*L.ph+L.bi;p.y1=L.fy0+(p.r+1)*L.ph-L.bi;
  const w=p.x1-p.x0,h=p.y1-p.y0;
  for(let n=0;n<42;n++){const i=n%7,j=(n/7)|0;p.hn[n]=clamp((i+.5+p.ju[n])/7,.03,.97);p.hx[n]=p.x0+p.hn[n]*w;p.hy[n]=p.y0+clamp((j+.5+p.jv[n])/6,.04,.97)*h;}
}
const storCount=()=>IKEYS.reduce((s,k)=>s+(G.stor[k]||0),0);
const levelOf=p=>p.water<.25?0:p.water<.75?1:2;
const LVN=['Kering','Sederhana','Basah'];

/* ---------- Web Audio: everything is synthesised ---------- */
const Au=(()=>{
  let ac=null,sfx,mus,nbuf,quiet=false,nextT=0,step=0,birdAt=0;
  let sOn=store.get('snd',true),mOn=store.get('mus',true);
  const loops={};
  function init(){
    if(ac){if(ac.state==='suspended')ac.resume().catch(()=>{});return;}
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    try{ac=new C();}catch(e){ac=null;return;}
    const comp=ac.createDynamicsCompressor();comp.connect(ac.destination);
    sfx=ac.createGain();sfx.gain.value=sOn?.8:0;sfx.connect(comp);
    mus=ac.createGain();mus.gain.value=mOn?.42:0;mus.connect(comp);
    nbuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    nextT=ac.currentTime+.2;birdAt=ac.currentTime+4;
    setInterval(sched,110);
  }
  function tone(f,d,o){
    o=o||{};if(!ac)return;const t=ac.currentTime+(o.t||0),os=ac.createOscillator(),g=ac.createGain();
    os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+d);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.2,t+(o.a||.008));g.gain.exponentialRampToValueAtTime(.0001,t+d);
    os.connect(g);g.connect(o.bus||sfx);os.start(t);os.stop(t+d+.05);
  }
  function noise(d,o){
    o=o||{};if(!ac)return;const t=ac.currentTime+(o.t||0),s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
    s.buffer=nbuf;s.loop=true;f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);f.Q.value=o.q||1;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.2,t+(o.a||.01));g.gain.exponentialRampToValueAtTime(.0001,t+d);
    s.connect(f);f.connect(g);g.connect(o.bus||sfx);s.start(t,Math.random()*1.5);s.stop(t+d+.05);
  }
  function bell(f,d,v,t,bus){tone(f,d,{v,t,bus,a:.004});tone(f*2.01,d*.6,{v:v*.35,t,bus,a:.004});tone(f*3.02,d*.3,{v:v*.12,t,bus,a:.004});}
  const S={
    click(){tone(660,.06,{type:'triangle',v:.12});},
    water(){noise(.7,{f:900,f2:2200,q:.8,v:.22,a:.08});},
    drain(){noise(.8,{f:1600,f2:400,q:1.2,v:.2,a:.05});},
    harvest(){noise(.25,{f:3500,q:.7,v:.16,type:'highpass'});tone(880,.25,{t:.08,v:.12});tone(1320,.35,{t:.16,v:.1});},
    coin(){tone(1245,.08,{type:'square',v:.06});tone(1661,.22,{type:'square',v:.06,t:.07});},
    cash(){for(let i=0;i<8;i++)tone(1100+rnd(900),.12,{type:'triangle',v:.09,t:i*.07});},
    shoo(){noise(.3,{f:2500,f2:6000,q:2,v:.14});tone(2400,.12,{f2:3400,v:.08});},
    squeak(){tone(2200,.09,{f2:3100,type:'square',v:.05});tone(2600,.1,{f2:1900,type:'square',v:.05,t:.1});},
    pluck(){tone(320,.12,{f2:640,type:'triangle',v:.2});},
    tweet(){tone(3200,.07,{f2:4200,v:.07});tone(3600,.07,{f2:2900,v:.07,t:.1});tone(3300,.09,{f2:4400,v:.06,t:.2});},
    buzz(){tone(140,.35,{type:'sawtooth',v:.16});tone(105,.4,{type:'sawtooth',v:.14,t:.12});},
    warn(){tone(520,.12,{type:'triangle',v:.1});tone(390,.18,{type:'triangle',v:.1,t:.12});},
    baja(){for(let i=0;i<6;i++)noise(.05,{f:5000+rnd(2000),q:3,v:.1,t:i*.045});},
    racun(){noise(.6,{f:6000,q:.6,v:.12,type:'highpass',a:.05});},
    build(){for(let i=0;i<4;i++){noise(.06,{f:1800,q:2,v:.25,t:i*.16});tone(180,.08,{type:'square',v:.1,t:i*.16});}},
    clunk(){tone(120,.15,{type:'square',v:.14,f2:70});noise(.1,{f:700,q:1.5,v:.15,t:.02});},
    horn(){[0,.4].forEach(t=>{tone(311,.32,{type:'sawtooth',v:.09,t});tone(392,.32,{type:'sawtooth',v:.09,t});});},
    creak(){tone(180,.5,{type:'sawtooth',v:.06,f2:320});noise(.5,{f:900,f2:1500,q:8,v:.12});},
    start(){[523,659,784,1047].forEach((f,i)=>bell(f,.9,.16,i*.13,sfx));},
    win(){[523,659,784,1047,784,1047,1319].forEach((f,i)=>bell(f,.9,.18,i*.14,sfx));for(let i=0;i<8;i++)tone(1100+rnd(900),.12,{type:'triangle',v:.07,t:1+i*.07});},
    nope(){tone(200,.12,{type:'square',v:.06});}
  };
  function play(n){if(!ac||!sOn||quiet)return;try{S[n]&&S[n]();}catch(e){}}
  function mkLoop(name){
    const g=ac.createGain();g.gain.value=0;g.connect(sfx);
    if(name.indexOf('eng_')===0){
      const pitch={eng_traktor:55,eng_tanam:82,eng_tuai:46}[name]||60;
      const o=ac.createOscillator(),o2=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),lp=ac.createBiquadFilter();
      o.type='sawtooth';o.frequency.value=pitch;o2.type='square';o2.frequency.value=pitch*.5;lfo.frequency.value=7+pitch/20;lg.gain.value=pitch*.06;
      lfo.connect(lg);lg.connect(o.frequency);lp.type='lowpass';lp.frequency.value=420;o.connect(lp);o2.connect(lp);lp.connect(g);o.start();o2.start();lfo.start();
      return{g,v:.15,on:false};
    }
    if(name==='drone'){
      const a=ac.createOscillator(),b=ac.createOscillator(),bp=ac.createBiquadFilter();a.type=b.type='sawtooth';a.frequency.value=182;b.frequency.value=191;
      bp.type='bandpass';bp.frequency.value=900;bp.Q.value=.7;a.connect(bp);b.connect(bp);bp.connect(g);a.start();b.start();return{g,v:.07,on:false};
    }
    const s=ac.createBufferSource(),f=ac.createBiquadFilter();s.buffer=nbuf;s.loop=true;
    if(name==='spray'){f.type='highpass';f.frequency.value=5200;s.connect(f);f.connect(g);s.start();return{g,v:.06,on:false};}
    f.type='bandpass';f.frequency.value=650;f.Q.value=.5;s.connect(f);f.connect(g);s.start();return{g,v:.05,on:false};
  }
  function loop(name,on){
    if(!ac)return;let l=loops[name];if(!l){if(!on)return;l=loops[name]=mkLoop(name);}
    const want=!!(on&&sOn&&!quiet);if(l.on===want)return;l.on=want;
    l.g.gain.cancelScheduledValues(ac.currentTime);l.g.gain.setTargetAtTime(want?l.v:0,ac.currentTime,.12);
  }
  const SCALE=[261.6,293.7,329.6,392,440,523.3,587.3,659.3,784,880];
  const MEL=[4,-1,5,4,2,-1,3,-1, 4,5,7,-1,5,-1,4,-1, 2,-1,3,4,5,-1,3,-1, 2,3,1,-1,0,-1,-1,-1,
             5,-1,7,8,7,-1,5,-1, 4,5,7,-1,8,-1,7,5, 4,-1,3,4,2,-1,3,-1, 2,-1,1,2,0,-1,-1,-1];
  const BASS=[130.8,98,110,98,130.8,110,87.3,98];
  function sched(){
    if(!ac||quiet||ac.state!=='running')return;
    if(nextT<ac.currentTime-.5)nextT=ac.currentTime+.1;
    while(nextT<ac.currentTime+.4){
      const i=step%MEL.length,dt=nextT-ac.currentTime;
      if(mOn){
        const n=MEL[i];if(n>=0)bell(SCALE[n],1.2,.1,dt,mus);
        if(i%8===0)tone(BASS[(i/8)|0],1.4,{type:'triangle',v:.17,t:dt,bus:mus,a:.03});
        if(i%4===2)tone(BASS[(i/8)|0]*2,.5,{type:'triangle',v:.06,t:dt,bus:mus,a:.02});
        if(i%2===1)noise(.05,{f:7000,q:1,v:.025,type:'highpass',t:dt,bus:mus});
      }
      step++;nextT+=.27;
    }
    if(sOn&&G.running&&!G.paused&&ac.currentTime>birdAt){
      birdAt=ac.currentTime+rnd(5,11);const b=rnd(2600,3600);
      for(let k=0;k<3+((Math.random()*3)|0);k++)tone(b+rnd(-300,300),.07,{f2:b+rnd(200,900),v:.035,t:k*.11});
    }
  }
  return{
    init,play,loop,
    get sOn(){return sOn;},get mOn(){return mOn;},
    setSound(b){sOn=b;store.set('snd',b);if(ac)sfx.gain.setTargetAtTime(b?.8:0,ac.currentTime,.05);if(!b)for(const k in loops){loops[k].on=false;loops[k].g.gain.setTargetAtTime(0,ac.currentTime,.05);}},
    setMusic(b){mOn=b;store.set('mus',b);if(ac)mus.gain.setTargetAtTime(b?.42:0,ac.currentTime,.05);},
    quiet(b){quiet=b;if(!ac)return;if(b){for(const k in loops){loops[k].on=false;loops[k].g.gain.cancelScheduledValues(ac.currentTime);loops[k].g.gain.setTargetAtTime(0,ac.currentTime,.05);}}else nextT=ac.currentTime+.15;}
  };
})();

/* ---------- renderer: homography, padi sprites, ground, water, particles ---------- */
const cv=$('#cv'),ctx=cv.getContext('2d'),stage=$('#stage'),persp=$('#persp'),plane=$('#plane'),ov=$('#ov');
const mq=window.matchMedia('(max-width:600px)');
let dpr=1,CW=0,CH=0,Hver=0;
const Hm=new Float64Array(9),Hi=new Float64Array(9),ZK=.643,DK=.766,TAU=6.2832;
Hm[0]=Hm[4]=Hm[8]=1;Hi[0]=Hi[4]=Hi[8]=1;
let PX=0,PY=0,PS=1;
/* plane point (+ height z) -> canvas px; PS = local projection scale */
function PZ(x,y,z){const w=Hm[6]*x+Hm[7]*y+Hm[8];PX=(Hm[0]*x+Hm[1]*y+Hm[2])/w;PY=(Hm[3]*x+Hm[4]*y+Hm[5])/w;PS=(Hm[0]-Hm[6]*PX)/w;if(z)PY-=z*PS*ZK;}
/* canvas px -> plane point (inverse homography) */
function unP(sx,sy){const w=Hi[6]*sx+Hi[7]*sy+Hi[8];PX=(Hi[0]*sx+Hi[1]*sy+Hi[2])/w;PY=(Hi[3]*sx+Hi[4]*sy+Hi[5])/w;}
const mks=$$('.mk'),lastQ=new Float64Array(8).fill(-1);
function readH(){
  const sr=stage.getBoundingClientRect();let ch=false;
  for(let i=0;i<4;i++){const r=mks[i].getBoundingClientRect(),x=r.left+r.width/2-sr.left,y=r.top+r.height/2-sr.top;if(Math.abs(x-lastQ[i*2])>.05||Math.abs(y-lastQ[i*2+1])>.05)ch=true;lastQ[i*2]=x;lastQ[i*2+1]=y;}
  if(!ch)return false;
  const x0=lastQ[0],y0=lastQ[1],x1=lastQ[2],y1=lastQ[3],x2=lastQ[4],y2=lastQ[5],x3=lastQ[6],y3=lastQ[7];
  const dx1=x1-x2,dx2=x3-x2,sx=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,sy=y0-y1+y2-y3,den=dx1*dy2-dy1*dx2;
  let g=0,h=0;if(Math.abs(den)>1e-9){g=(sx*dy2-dx2*sy)/den;h=(dx1*sy-sx*dy1)/den;}
  Hm[0]=(x1-x0+g*x1)/L.PW;Hm[1]=(x3-x0+h*x3)/L.PH;Hm[2]=x0;Hm[3]=(y1-y0+g*y1)/L.PW;Hm[4]=(y3-y0+h*y3)/L.PH;Hm[5]=y0;Hm[6]=g/L.PW;Hm[7]=h/L.PH;Hm[8]=1;
  const A=Hm;
  Hi[0]=A[4]*A[8]-A[5]*A[7];Hi[1]=A[2]*A[7]-A[1]*A[8];Hi[2]=A[1]*A[5]-A[2]*A[4];
  Hi[3]=A[5]*A[6]-A[3]*A[8];Hi[4]=A[0]*A[8]-A[2]*A[6];Hi[5]=A[2]*A[3]-A[0]*A[5];
  Hi[6]=A[3]*A[7]-A[4]*A[6];Hi[7]=A[1]*A[6]-A[0]*A[7];Hi[8]=A[0]*A[4]-A[1]*A[3];
  Hver++;mkGrads();return true;
}
let bgGrad=null;const waterGrad=[null,null,null];
function mkGrads(){
  bgGrad=ctx.createLinearGradient(0,0,0,CH||1);bgGrad.addColorStop(0,'#b7e08a');bgGrad.addColorStop(.25,'#9fd46a');bgGrad.addColorStop(1,'#84c452');
  for(let r=0;r<ROWS;r++){
    PZ(L.fx0,L.fy0+r*L.ph,0);const ya=PY;PZ(L.fx0,L.fy0+(r+1)*L.ph,0);
    const g=ctx.createLinearGradient(0,ya,0,PY);g.addColorStop(0,'#d4f0fb');g.addColorStop(.45,'#8fcdea');g.addColorStop(1,'#4f9fcb');waterGrad[r]=g;
  }
}

/* ---------- padi sprites, pre-rendered once ---------- */
const SPR=[[],[],[]];
const PAL=[
  {seed:['#a8e063','#8fd14f','#7cc242'],till:['#6fbf3a','#5aa832','#4c9a2a','#7fcb48'],mat:['#3f8f2b','#347d24','#2a6b1e','#4a9c33'],ripe:['#b5b842','#9aa836','#c9c04a','#8a9a30']},
  {seed:['#86d84e','#63c23c','#52b032'],till:['#3f9e2e','#2f8a26','#278020','#4cac38'],mat:['#1f6e22','#195c1c','#257a28','#2d8530'],ripe:['#a3b03a','#869c2c','#b8ba40','#74902a']},
  {seed:['#b59a4c','#9a7b3a','#c2a85a'],till:['#9a7b3a','#7d6230','#b08d45','#8d7036'],mat:['#8a6c34','#6b5228','#a08040','#7a5f2e'],ripe:['#9a7b3a','#7d6230','#b08d45','#6b5228']}
];
function leaf(x,bx,len,ang,droop,w,col){
  const tx=bx+Math.sin(ang)*len+droop*len*.45,ty=-Math.cos(ang)*len+Math.abs(droop)*len*.4;
  const cx=bx+Math.sin(ang)*len*.5,cy=-Math.cos(ang)*len*.8;
  x.fillStyle=col;x.beginPath();x.moveTo(bx-w/2,0);x.quadraticCurveTo(cx-w*.5,cy,tx,ty);x.quadraticCurveTo(cx+w*.5,cy,bx+w/2,0);x.closePath();x.fill();
}
function mkSprite(st,v,pal){
  const c=document.createElement('canvas');c.width=80;c.height=112;
  const x=c.getContext('2d'),R=mkRng(st*977+v*131+pal*71+9),P=PAL[pal],pick=a=>a[(R()*a.length)|0];
  x.translate(40,106);
  if(st===0){for(let i=0;i<5;i++)leaf(x,(R()-.5)*5,20+R()*12,(R()-.5)*.9,(R()-.5)*.5,3.2,pick(P.seed));}
  else if(st===1){for(let i=0;i<11;i++)leaf(x,(R()-.5)*9,36+R()*20,(R()-.5)*1.25,(R()-.5)*.7,4,pick(P.till));}
  else if(st===2){for(let i=0;i<16;i++)leaf(x,(R()-.5)*11,58+R()*30,(R()-.5)*1.15,(R()-.5)*.8,4.6,pick(P.mat));}
  else if(st===3){
    for(let i=0;i<12;i++)leaf(x,(R()-.5)*11,54+R()*26,(R()-.5)*1.2,(R()-.5)*.9,4.4,pick(P.ripe));
    for(let i=0;i<6;i++){
      const bx=(R()-.5)*8,dir=R()<.5?-1:1,h=70+R()*20,sp=10+R()*14,tx=bx+dir*sp,ty=-h+18+R()*10,cx=bx+dir*sp*.35,cy=-h-6;
      x.strokeStyle='#b89a2a';x.lineWidth=1.3;x.beginPath();x.moveTo(bx,-20);x.quadraticCurveTo(cx,cy,tx,ty);x.stroke();
      for(let k=0;k<9;k++){
        const t=.45+k/9*.55,it=1-t,gx=it*it*bx+2*it*t*cx+t*t*tx,gy=it*it*-20+2*it*t*cy+t*t*ty;
        x.fillStyle=k%3===0?'#f7d658':k%3===1?'#e9b824':'#d39a14';x.beginPath();x.ellipse(gx+(k%2?1.8:-1.8),gy,1.9,3.1,dir*.5,0,TAU);x.fill();
      }
    }
  }
  else if(st===4){const cs=['#d9c27a','#c7ad62','#e5d391','#b89a52'];for(let i=0;i<8;i++){const bx=(R()-.5)*13,h=10+R()*9,lean=(R()-.5)*4;x.strokeStyle=pick(cs);x.lineWidth=2.2;x.beginPath();x.moveTo(bx,0);x.lineTo(bx+lean,-h);x.stroke();}}
  else{const cs=['#7a5a36','#644728','#8b6a42','#5a3f22'];for(let i=0;i<9;i++)leaf(x,(R()-.5)*12,22+R()*18,(R()<.5?-1:1)*(.9+R()*.6),.6,4,pick(cs));}
  return c;
}
function mkSprites(){
  for(let pal=0;pal<3;pal++)for(let st=0;st<6;st++){
    if(st>=4&&pal>0){SPR[pal][st]=SPR[0][st];continue;}
    const a=[];for(let v=0;v<5;v++)a.push(mkSprite(st,v,pal));SPR[pal][st]=a;
  }
}

/* ---------- primitives ---------- */
function quad(xa,ya,xb,yb){PZ(xa,ya,0);ctx.beginPath();ctx.moveTo(PX,PY);PZ(xb,ya,0);ctx.lineTo(PX,PY);PZ(xb,yb,0);ctx.lineTo(PX,PY);PZ(xa,yb,0);ctx.lineTo(PX,PY);ctx.closePath();}
function quadZ(xa,ya,xb,yb,z){PZ(xa,ya,z);ctx.beginPath();ctx.moveTo(PX,PY);PZ(xb,ya,z);ctx.lineTo(PX,PY);PZ(xb,yb,z);ctx.lineTo(PX,PY);PZ(xa,yb,z);ctx.lineTo(PX,PY);ctx.closePath();}
function box(xa,xb,ya,yb,z0,z1,ct,cf){
  PZ(xa,yb,0);const ax=PX,ay=PY,k=PS*ZK;PZ(xb,yb,0);const bx=PX,by=PY;
  ctx.fillStyle=cf;ctx.beginPath();ctx.moveTo(ax,ay-z0*k);ctx.lineTo(bx,by-z0*k);ctx.lineTo(bx,by-z1*k);ctx.lineTo(ax,ay-z1*k);ctx.closePath();ctx.fill();
  PZ(xa,ya,z1);const cx=PX,cy=PY;PZ(xb,ya,z1);
  ctx.fillStyle=ct;ctx.beginPath();ctx.moveTo(ax,ay-z1*k);ctx.lineTo(bx,by-z1*k);ctx.lineTo(PX,PY);ctx.lineTo(cx,cy);ctx.closePath();ctx.fill();
}
function line3(x0,y0,z0,x1,y1,z1){PZ(x0,y0,z0);ctx.beginPath();ctx.moveTo(PX,PY);PZ(x1,y1,z1);ctx.lineTo(PX,PY);ctx.stroke();}
let GE_x=0,GE_y=0,GE_rx=0,GE_ry=0;
function gEllipse(x,y,R){PZ(x,y-R,0);const ty=PY;PZ(x,y+R,0);const by=PY;PZ(x,y,0);GE_x=PX;GE_y=(ty+by)/2;GE_rx=R*PS;GE_ry=(by-ty)/2;}

/* ---------- particles (fixed pool) ---------- */
const PN=440,pX=new Float32Array(PN),pY=new Float32Array(PN),pZ=new Float32Array(PN),pVX=new Float32Array(PN),pVY=new Float32Array(PN),pVZ=new Float32Array(PN),pL=new Float32Array(PN),pM=new Float32Array(PN),pS=new Float32Array(PN),pK=new Uint8Array(PN);
let pHead=0;
const K_MUD=0,K_WATER=1,K_STRAW=2,K_DUST=3,K_SMOKE=4,K_BAJA=5,K_RACUN=6,K_GRAIN=7;
const PCOL=['#5a3d22','#c9ebfb','#e8d27a','#cbb68c','#6f6f6f','#ffffff','#bfe9ff','#f2c230'];
function emit(k,x,y,z,vx,vy,vz,life,size){const i=pHead;pHead=(pHead+1)%PN;pK[i]=k;pX[i]=x;pY[i]=y;pZ[i]=z;pVX[i]=vx;pVY[i]=vy;pVZ[i]=vz;pL[i]=life;pM[i]=life;pS[i]=size;}
function stepParticles(dt){
  for(let i=0;i<PN;i++){
    if(pL[i]<=0)continue;pL[i]-=dt;const k=pK[i];
    pX[i]+=pVX[i]*dt;pY[i]+=pVY[i]*dt;pZ[i]+=pVZ[i]*dt;
    if(k===K_DUST||k===K_SMOKE||k===K_RACUN){pVX[i]*=.97;pVZ[i]*=.985;}
    else{pVZ[i]-=260*dt;if(pZ[i]<0){pZ[i]=0;if(pL[i]>.08)pL[i]=.08;}}
  }
}
function drawParticles(){
  for(let i=0;i<PN;i++){
    if(pL[i]<=0)continue;const k=pK[i],a=pL[i]/pM[i];PZ(pX[i],pY[i],pZ[i]);let r=pS[i]*PS;
    if(k===K_DUST||k===K_SMOKE||k===K_RACUN){r*=1+(1-a)*1.7;ctx.globalAlpha=a*.42;}else ctx.globalAlpha=a>.5?1:a*2;
    ctx.fillStyle=PCOL[k];ctx.beginPath();
    if(k===K_STRAW)ctx.ellipse(PX,PY,r*2.2,r*.6,pX[i]*.3,0,TAU);else ctx.arc(PX,PY,r<.6?.6:r,0,TAU);
    ctx.fill();
  }
  ctx.globalAlpha=1;
}
function burst(k,x,y,n,sp,up,size,life){for(let i=0;i<n;i++)emit(k,x+rnd(-8,8),y+rnd(-6,6),rnd(2,10),rnd(-sp,sp),rnd(-sp,sp)*.5,rnd(up*.5,up),life*rnd(.7,1.2),size*rnd(.7,1.3));}

/* ---------- static scene ---------- */
function drawBase(t){
  ctx.fillStyle=bgGrad||'#9fd46a';ctx.fillRect(0,0,CW,CH);
  quad(0,0,L.PW,L.PH);ctx.fillStyle='#93cc5e';ctx.fill();
  // right strip: kampung yard
  quad(L.rx0-2,L.fy0-8,L.rx1,L.fy1+8);ctx.fillStyle='#a6d273';ctx.fill();
  // bangkenal (main canal)
  const by0=L.py-24,by1=L.par1+8,bw=L.bk1-L.bk0;
  quad(L.bk0-5,by0,L.bk1+5,by1);ctx.fillStyle='#8a6b42';ctx.fill();
  quad(L.bk0,by0+3,L.bk1,by1-3);ctx.fillStyle='#57452b';ctx.fill();
  const ins=bw*.5*(1-G.bk)*.6;
  quad(L.bk0+ins,by0+3,L.bk1-ins,by1-3);ctx.fillStyle='#3f93c4';ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.4;
  for(let k=0;k<8;k++){const yy=by0+8+((k/8+t*.07)%1)*(by1-by0-30),xx=L.bk0+ins+(bw-2*ins)*(.2+.6*((k*37)%10)/10);line3(xx,yy,0,xx,yy+14,0);}
  // parit (drain) along the front
  quad(L.bk1-2,L.par0-3,L.fx1+10,L.par1+3);ctx.fillStyle='#7d6039';ctx.fill();
  quad(L.bk1-6,L.par0,L.fx1+6,L.par1);ctx.fillStyle=G.draining>0?'#4a9fd0':'#4689b3';ctx.fill();
  const sp=G.draining>0?.42:.05,pl=L.fx1-L.bk1;
  ctx.strokeStyle='rgba(255,255,255,'+(G.draining>0?.75:.4)+')';ctx.lineWidth=1.5;
  for(let k=0;k<12;k++){const u=1-((k/12+t*sp)%1),xx=L.bk1+u*pl,yy=L.par0+(L.par1-L.par0)*(.25+.5*((k*53)%10)/10);line3(xx,yy,0,xx+18,yy,0);}
  // field bund base
  quad(L.fx0-6,L.fy0-6,L.fx1+6,L.fy1+6);ctx.fillStyle='#9a7848';ctx.fill();
  // dron pad
  if(G.L.unlock.indexOf('dron')>=0){
    gEllipse(L.rx,L.padY,L.padR);ctx.globalAlpha=G.guards.dron?1:.4;
    ctx.fillStyle='#8f979c';ctx.beginPath();ctx.ellipse(GE_x,GE_y,GE_rx,GE_ry,0,0,TAU);ctx.fill();
    ctx.strokeStyle='#f2c230';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(GE_x,GE_y,GE_rx*.86,GE_ry*.86,0,0,TAU);ctx.stroke();
    ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1.5,3*PS);const q=L.padR*.4;
    line3(L.rx-q,L.padY-q,0,L.rx-q,L.padY+q,0);line3(L.rx+q,L.padY-q,0,L.rx+q,L.padY+q,0);line3(L.rx-q,L.padY,0,L.rx+q,L.padY,0);
    ctx.globalAlpha=1;
  }
}
function drawPalong(t){
  const y0=L.py-11,y1=L.py+11,xa=L.bk1-4,xb=L.fx1-2,z0=L.pz0,z1=L.pz1;
  quad(xa,y1+6,xb,y1+26);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fill();
  for(let c=0;c<=COLS;c++){const x=L.fx0+c*L.pw;box(x-4,x+4,L.py-5,L.py+5,0,z0,'#aaa9a0','#96958c');}
  box(xa,xb,y0,y1,z0,z1,'#deded6','#c4c3ba');
  if(G.gate||G.palong>0){
    quadZ(xa+3,y0+4,xb-3,y1-4,z1-1);ctx.globalAlpha=G.gate?1:.35+.65*G.palong/100;ctx.fillStyle='#58b2e0';ctx.fill();ctx.globalAlpha=1;
    if(G.gate){ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1.4;for(let k=0;k<10;k++){const u=(k/10+t*.35)%1,xx=xa+6+u*(xb-xa-30);line3(xx,L.py+(k%2?3:-3),z1-1,xx+16,L.py+(k%2?3:-3),z1-1);}}
  }
  for(let c=0;c<COLS;c++){
    const x=L.fx0+(c+.5)*L.pw;box(x-6,x+6,y1,y1+12,z0+2,z0+9,'#d4d3ca','#b5b4ab');
    if(G.colFill[c]>0){
      PZ(x,y1+12,z0+4);const sx=PX,sy=PY,s=PS;PZ(x,L.fy0+L.bi+8,0);
      ctx.lineCap='round';ctx.strokeStyle='rgba(110,195,238,.9)';ctx.lineWidth=5.5*s;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx,sy-2*s,PX,PY);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.6*s;ctx.setLineDash([5*s,6*s]);ctx.lineDashOffset=-t*60;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(PX,PY);ctx.stroke();ctx.setLineDash([]);ctx.lineCap='butt';
    }
  }
}

/* ---------- petak ground + water ---------- */
const GCOL=['#8f6f47','#7c5937','#6e5a3c','#a88d58','#6a5136'];
const groundType=st=>st==='ploughed'?1:(st==='grow'||st==='ripe')?2:st==='stubble'?3:st==='dead'?4:0;
function drawGround(p,type,xa,ya,xb,yb){
  if(xb-xa<.5||yb-ya<.5)return;
  ctx.fillStyle=GCOL[type];quad(xa,ya,xb,yb);ctx.fill();
  const w=p.x1-p.x0,h=p.y1-p.y0;
  if(type===1){
    const n=9,sp=h/n;
    for(let i=0;i<n;i++){
      const y=p.y0+(i+.62)*sp;if(y<ya||y>yb)continue;
      PZ(xa,y,0);const ax=PX,ay=PY,s=PS;PZ(xb,y,0);
      ctx.strokeStyle='#553a20';ctx.lineWidth=Math.max(1,sp*.4*s*DK);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(PX,PY);ctx.stroke();
      const y2=y-sp*.5;if(y2<ya)continue;PZ(xa,y2,0);const cx=PX,cy=PY;PZ(xb,y2,0);
      ctx.strokeStyle='#a17c52';ctx.lineWidth=Math.max(.8,1.3*s);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(PX,PY);ctx.stroke();
    }
  }else if(type===3){
    ctx.strokeStyle='#e6d290';ctx.lineWidth=1.3;
    for(let k=0;k<16;k++){const x=p.x0+p.su[k]*w,y=p.y0+p.sv[k]*h;if(x<xa+3||x>xb-3||y<ya||y>yb)continue;const dx=Math.cos(p.sa[k])*5,dy=Math.sin(p.sa[k])*3;line3(x-dx,y-dy,0,x+dx,y+dy,0);}
  }else{
    const n=type===2?6:14;
    for(let k=0;k<n;k++){
      const x=p.x0+p.cu[k]*w,y=p.y0+p.cv[k]*h;if(x<xa+2||x>xb-2||y<ya+1||y>yb-1)continue;
      PZ(x,y,0);const r=p.cs[k]*3.2*PS*L.hill;
      ctx.fillStyle=type===2?'rgba(40,30,15,.25)':'#6a4f2f';ctx.beginPath();ctx.ellipse(PX,PY,r*1.4,r*.7,0,0,TAU);ctx.fill();
      if(type!==2){ctx.fillStyle='#a58560';ctx.beginPath();ctx.ellipse(PX-r*.3,PY-r*.3,r*.7,r*.3,0,0,TAU);ctx.fill();}
    }
  }
}
function drawPetakGround(p,t){
  const wk=p.work,gt=groundType(p.st);
  drawGround(p,gt,p.x0,p.y0,p.x1,p.y1);
  if(wk&&wk.lane>=0&&wk.id!=='tanam'){
    const at=wk.id==='traktor'?1:3,h=p.y1-p.y0,w=p.x1-p.x0;
    for(let k=0;k<3;k++){
      const f=clamp(wk.lt[k],0,1);if(f<=0)continue;
      const ya=p.y0+h*(2-k)/3,yb=ya+h/3,d=wk.pdir*(k%2?-1:1);
      if(d>0)drawGround(p,at,p.x0,ya,p.x0+w*f,yb);else drawGround(p,at,p.x1-w*f,ya,p.x1,yb);
    }
  }
  // dry cracks under thirsty growing padi
  if(p.st==='grow'&&p.water<.12){
    ctx.strokeStyle='rgba(50,35,18,.55)';ctx.lineWidth=1.1;const w=p.x1-p.x0,h=p.y1-p.y0;
    for(let n=0;n<p.cr.length;n++){const a=p.cr[n];PZ(p.x0+a[0]*w,p.y0+a[1]*h,0);ctx.beginPath();ctx.moveTo(PX,PY);for(let k=2;k<a.length;k+=2){PZ(p.x0+a[k]*w,p.y0+a[k+1]*h,0);ctx.lineTo(PX,PY);}ctx.stroke();}
  }
  // water: sky-reflecting gradient, opacity by level, drifting ripples
  if(p.water>.02){
    quad(p.x0,p.y0,p.x1,p.y1);ctx.globalAlpha=.2+.62*p.water;ctx.fillStyle=waterGrad[p.r]||'#7cc4e6';ctx.fill();
    ctx.globalAlpha=.55*p.water;ctx.strokeStyle='#fff';ctx.lineWidth=1.2;const w=p.x1-p.x0,h=p.y1-p.y0;
    for(let k=0;k<4;k++){const u=(p.ru[k]+t*.035*(1+k*.4))%1,x=p.x0+6+u*(w-26),y=p.y0+p.rv[k]*h;line3(x,y,0,x+12,y,0);}
    ctx.globalAlpha=1;
  }
}
function drawBatas(){
  ctx.strokeStyle='#7fb548';
  for(let r=0;r<=ROWS;r++){const y=L.fy0+r*L.ph;PZ(L.fx0-3,y,0);const ax=PX,ay=PY;ctx.lineWidth=Math.max(1.5,3.2*PS);PZ(L.fx1+3,y,0);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(PX,PY);ctx.stroke();}
  ctx.lineWidth=2.2;
  for(let c=0;c<=COLS;c++){const x=L.fx0+c*L.pw;line3(x,L.fy0-3,0,x,L.fy1+3,0);}
}

/* ---------- padi hills ---------- */
const lkStage=new Int8Array(NP),lkPal=new Uint8Array(NP),lkSc=new Float32Array(NP);
function computeLooks(){
  for(let i=0;i<NP;i++){
    const p=G.petak[i];let st=-1,sc=1,pal=0;
    if(p.st==='grow'){const g=p.g;if(g<.34){st=0;sc=.62+.4*(g/.34);}else if(g<.67){st=1;sc=.74+.3*((g-.34)/.33);}else{st=2;sc=.82+.18*((g-.67)/.33);}pal=p.bena>0?2:p.baja?1:0;}
    else if(p.st==='ripe'){st=3;pal=p.baja?1:0;}
    else if(p.st==='stubble')st=4;
    else if(p.st==='dead')st=5;
    lkStage[i]=st;lkPal[i]=pal;lkSc[i]=sc;
  }
}
function drawHillRow(p,j,t){
  const base=j*7,wk=p.work,k=2-(j>>1),hsc=L.hill*.5;
  let st0=lkStage[p.i],pal0=lkPal[p.i],sc0=lkSc[p.i],d=1,lim=0,mx=-1e9,as=-1,asc=1;
  if(wk){
    if(wk.id==='traktor'&&st0<4)st0=-1;
    if(wk.lane>=0){d=wk.pdir*(k%2?-1:1);lim=wk.lt[k];if(wk.lane===k)mx=M[wk.id].x;as=wk.id==='tanam'?0:wk.id==='tuai'?4:-1;asc=.62;}
  }
  const half=L.pw*.3;
  for(let i=0;i<7;i++){
    const n=base+i;let st=st0,pal=pal0,sc=sc0;
    if(wk&&wk.lane>=0){
      if(Math.abs(p.hx[n]-mx)<half)continue;
      const hn=d>0?p.hn[n]:1-p.hn[n];if(hn<lim){st=as;pal=0;sc=asc;}
    }
    if(st<0)continue;
    PZ(p.hx[n],p.hy[n],0);const s=PS*p.hs[n]*sc*hsc*dpr;
    let kx=0;if(st<4){kx=Math.sin(t*1.7+p.hx[n]*.013+p.hy[n]*.004)*.1+Math.sin(t*2.9+p.hx[n]*.031)*.04;if(st===0)kx*=.6;}
    ctx.setTransform(s,0,-s*kx,s,PX*dpr,PY*dpr);ctx.drawImage(SPR[pal][st][p.hv[n]],-40,-106);
  }
}
const dyn=[];const dynCmp=(a,b)=>a.y-b.y;
function drawStanding(t){
  dyn.sort(dynCmp);let di=0;const nd=dyn.length,ih=L.ph-2*L.bi;
  for(let r=0;r<ROWS;r++)for(let j=0;j<6;j++){
    const by=L.fy0+r*L.ph+L.bi+(j+.5)/6*ih;
    while(di<nd&&dyn[di].y<=by){dyn[di].draw(t);di++;}
    for(let c=0;c<COLS;c++)drawHillRow(G.petak[r*COLS+c],j,t);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  while(di<nd){dyn[di].draw(t);di++;}
}

/* ---------- marks drawn over the padi ---------- */
function outline(p,col,lw,fill){quad(p.x0,p.y0,p.x1,p.y1);if(fill){ctx.fillStyle=fill;ctx.fill();}ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.stroke();}
function drawMarks(t){
  for(let i=0;i<NP;i++){
    const p=G.petak[i],w=p.x1-p.x0,h=p.y1-p.y0;
    if(p.racunT>0){quad(p.x0,p.y0,p.x1,p.y1);ctx.fillStyle='rgba(170,225,255,'+(.17+.06*Math.sin(t*4+i)).toFixed(3)+')';ctx.fill();}
    if(p.bena>0){ctx.fillStyle='#2e1b0c';for(let k=0;k<9;k++){PZ(p.x0+(p.cu[k]+Math.sin(t*1.3+k)*.05)*w,p.y0+p.cv[k]*h,12+7*Math.sin(t*2+k*2));ctx.fillRect(PX-1.6*PS,PY-1*PS,3.2*PS,2*PS);}}
    const q=p.pest;
    if(q&&!q.gone){
      gEllipse((p.x0+p.x1)/2,(p.y0+p.y1)/2,Math.min(w,h)*.36);
      ctx.lineWidth=Math.max(3,5*PS);ctx.strokeStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(GE_x,GE_y,GE_rx,GE_ry,0,0,TAU);ctx.stroke();
      ctx.strokeStyle='#e5342a';ctx.beginPath();ctx.ellipse(GE_x,GE_y,GE_rx,GE_ry,0,-1.5708,-1.5708+TAU*clamp(q.t/q.max,0,1));ctx.stroke();
    }
    // water-level drops: 3 = Basah, 2 = Sederhana, 1 = Kering
    const n=p.lv+1,dr=3.1*L.hill;
    for(let k=0;k<3;k++){
      PZ(p.x0+6+dr+k*dr*2.7,p.y1-5-dr,0);const r=dr*PS;
      ctx.fillStyle=k<n?'#f2c230':'rgba(20,30,20,.3)';ctx.beginPath();ctx.moveTo(PX,PY-r*1.9);ctx.quadraticCurveTo(PX+r*1.3,PY-r*.2,PX+r,PY+r*.3);ctx.arc(PX,PY+r*.3,r,0,Math.PI);ctx.quadraticCurveTo(PX-r*1.3,PY-r*.2,PX,PY-r*1.9);ctx.fill();
      if(k<n){ctx.strokeStyle='#7a5200';ctx.lineWidth=.8;ctx.stroke();}
    }
  }
  if(G.pulse>=0){const a=.5+.5*Math.sin(t*6);outline(G.petak[G.pulse],'rgba(255,214,60,'+(.55+.45*a).toFixed(2)+')',2.5+2.5*a,'rgba(255,214,60,'+(.1+.12*a).toFixed(2)+')');}
  if(G.hover>=0)outline(G.petak[G.hover],'rgba(255,255,255,.9)',2.2,'rgba(255,255,255,.1)');
  if(G.focus>=0&&G.focus!==G.hover)outline(G.petak[G.focus],'#fff',3,null);
}

/* ---------- machines, egrets, dron station: drawn as simple 3D boxes, wheels and discs ---------- */
let mX=0,mY=0,mF=1,mU=1;
function mb(l0,l1,w0,w1,z0,z1,ct,cf){box(mX+mF*l0*mU,mX+mF*l1*mU,mY+w0*mU,mY+w1*mU,z0*mU,z1*mU,ct,cf);}
function mp(l,w,z){PZ(mX+mF*l*mU,mY+w*mU,z*mU);}
function mline(l0,w0,z0,l1,w1,z1){mp(l0,w0,z0);ctx.beginPath();ctx.moveTo(PX,PY);mp(l1,w1,z1);ctx.lineTo(PX,PY);ctx.stroke();}
function mwheel(l,w,r,rot,tire,hub,n){
  mp(l,w,r);const rx=r*mU*PS,ry=rx*ZK,x=PX,y=PY;
  ctx.fillStyle=tire;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();
  ctx.fillStyle=hub;ctx.beginPath();ctx.ellipse(x,y,rx*.52,ry*.52,0,0,TAU);ctx.fill();
  ctx.strokeStyle=tire;ctx.lineWidth=Math.max(.8,rx*.11);ctx.beginPath();
  for(let i=0;i<n;i++){const a=rot*mF+i*TAU/n;ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*rx*.52,y+Math.sin(a)*ry*.52);}
  ctx.stroke();
}
function mshadow(len,wid){PZ(mX,mY+5*mU,0);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(PX,PY,len*mU*PS,wid*mU*PS*DK,0,0,TAU);ctx.fill();}
function driver(l,w,z,shirt,hat){
  mb(l-5,l+5,w-6,w+6,z,z+15,shirt,shirt);
  mp(l,w+2,z+21);const r=5.2*mU*PS;ctx.fillStyle='#e8b98a';ctx.beginPath();ctx.arc(PX,PY,r,0,TAU);ctx.fill();
  mp(l,w+2,z+25);ctx.fillStyle=hat;ctx.beginPath();ctx.ellipse(PX,PY,r*1.9,r*.75,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.ellipse(PX,PY-r*.5,r*.95,r*.7,0,0,TAU);ctx.fill();
}
function drawTraktor(m,t){
  const wk=m.working,rot=m.wheel;
  mshadow(62,30);
  mwheel(-20,-19,24,rot/24,'#1c1c1c','#f2a23a',6);mwheel(32,-17,13,rot/13,'#1c1c1c','#f2a23a',5);
  // rotavator with spinning tines
  ctx.strokeStyle='#3a3a3a';ctx.lineWidth=Math.max(1,1.8*PS*mU);
  for(let i=0;i<6;i++){const w=-20+i*8,a=(wk?m.anim*16:0)+i*1.1;mline(-46,w,8,-46+Math.cos(a)*8,w,8+Math.sin(a)*7);mline(-46,w,8,-46-Math.cos(a)*8,w,8-Math.sin(a)*7);}
  mb(-58,-36,-23,23,9,21,'#f59a2e','#d9761a');
  ctx.strokeStyle='#555';ctx.lineWidth=Math.max(1,2.2*PS*mU);mline(-36,-8,18,-30,-8,22);mline(-36,8,18,-30,8,22);
  mb(-34,42,-11,11,12,26,'#f28a1e','#d86e12');
  mb(6,44,-10,10,26,40,'#f7982c','#e07a18');
  mb(41,44,-9,9,14,38,'#3a3a3a','#2a2a2a');
  mb(20,23,-2,2,40,58,'#4a4a4a','#2c2c2c');
  mb(-30,-22,-9,9,26,34,'#333','#222');
  driver(-16,0,27,'#3d7dd9','#e9d9a0');
  ctx.strokeStyle='#2e2e2e';ctx.lineWidth=Math.max(1.2,2.4*PS*mU);
  mline(-30,-12,26,-30,-12,66);mline(2,-12,36,2,-12,66);mline(-30,12,26,-30,12,66);mline(2,12,36,2,12,66);
  mb(-34,6,-14,14,66,70,'#444','#262626');
  mwheel(-20,19,24,rot/24,'#1c1c1c','#f2a23a',6);mwheel(32,17,13,rot/13,'#1c1c1c','#f2a23a',5);
}
function drawTanam(m,t){
  const wk=m.working,rot=m.wheel;
  mshadow(54,30);
  mb(-44,14,-24,24,0,5,'#4a90d9','#2f6fb5');
  mwheel(22,-18,13,rot/13,'#222','#e3e3e3',8);mwheel(-12,-18,16,rot/16,'#222','#e3e3e3',8);
  mb(-16,36,-11,11,10,24,'#fbfbf7','#dfe3e6');
  mb(12,38,-10,10,24,34,'#4a90d9','#2f6fb5');
  driver(-4,0,25,'#e9a13a','#f4f1e4');
  mp(10,0,42);ctx.strokeStyle='#222';ctx.lineWidth=Math.max(1,1.8*PS*mU);ctx.beginPath();ctx.ellipse(PX,PY,5*mU*PS,3*mU*PS,0,0,TAU);ctx.stroke();mline(10,0,42,12,0,34);
  // seedling mat tray (empties as it plants)
  const tl=-16,tz=46,bl=-42,bz=12;
  mp(tl,-24,tz);ctx.beginPath();ctx.moveTo(PX,PY);mp(tl,24,tz);ctx.lineTo(PX,PY);mp(bl,24,bz);ctx.lineTo(PX,PY);mp(bl,-24,bz);ctx.lineTo(PX,PY);ctx.closePath();
  ctx.fillStyle='#e8ecef';ctx.fill();ctx.strokeStyle='#8f9aa1';ctx.lineWidth=1;ctx.stroke();
  const f=clamp(m.tray,0,1);
  if(f>.02){const ml=lerp(bl,tl,f),mz=lerp(bz,tz,f);
    for(let c=0;c<4;c++){const w0=-22+c*11.5,w1=w0+9.5;mp(ml,w0,mz);ctx.beginPath();ctx.moveTo(PX,PY);mp(ml,w1,mz);ctx.lineTo(PX,PY);mp(bl,w1,bz);ctx.lineTo(PX,PY);mp(bl,w0,bz);ctx.lineTo(PX,PY);ctx.closePath();ctx.fillStyle=c%2?'#63c53f':'#7bd653';ctx.fill();}
  }
  // planting arms dip up and down
  ctx.strokeStyle='#555';ctx.lineWidth=Math.max(1,2*PS*mU);
  for(let i=0;i<4;i++){const w=-18+i*12,dz=wk?6+6*Math.sin(m.anim*20+i*1.6):9;mline(-42,w,12,-51,w,dz);if(wk&&dz<4){mp(-51,w,dz);ctx.fillStyle='#8fd14f';ctx.fillRect(PX-1.5,PY-3,3,4);}}
  mwheel(22,18,13,rot/13,'#222','#e3e3e3',8);mwheel(-12,18,16,rot/16,'#222','#e3e3e3',8);
}
function drawTuai(m,t){
  const wk=m.working;
  mshadow(66,36);
  mb(-34,30,-22,-12,0,14,'#2c2c2c','#1b1b1b');
  // header + cutter bar + turning reel
  mb(32,50,-30,30,2,14,'#c9302a','#a3241c');
  ctx.strokeStyle='#e6e6e6';ctx.lineWidth=Math.max(1,2*PS*mU);mline(52,-30,3,52,30,3);
  const ra=wk?m.anim*9:0;
  ctx.strokeStyle='#7a1d12';ctx.lineWidth=Math.max(1,1.6*PS*mU);mline(46,-30,14,46,-30,24);mline(46,30,14,46,30,24);
  for(let i=0;i<5;i++){const a=ra+i*TAU/5,l=46+Math.cos(a)*11,z=24+Math.sin(a)*11;
    ctx.strokeStyle='#f2c230';ctx.lineWidth=Math.max(1,2.2*PS*mU);mline(l,-30,z,l,30,z);
    ctx.strokeStyle='#b8860b';ctx.lineWidth=1;mline(46,30,24,l,30,z);mline(46,-30,24,l,-30,z);}
  mb(22,34,-8,8,8,22,'#b02a1e','#8f2018');
  mb(-40,22,-18,18,14,44,'#e0453a','#bf2f25');
  ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,2*PS*mU);mline(-36,18,24,16,18,24);
  // grain tank: top fills with gold
  mb(-36,2,-15,15,44,58,'#8f2018','#a3241c');
  if(m.tank>.02){const f=clamp(m.tank,0,1),zz=(52+f*8)*mU;quadZ(mX+mF*-34*mU,mY-13*mU,mX+mF*0*mU,mY+13*mU,zz);ctx.fillStyle='#f2c230';ctx.fill();
    mp(-17,0,60+f*10);ctx.fillStyle='#f7dc6a';ctx.beginPath();ctx.ellipse(PX,PY,12*f*mU*PS,5*f*mU*PS,0,0,TAU);ctx.fill();}
  // glass cabin with driver
  mb(4,26,-13,13,44,66,'rgba(205,232,246,.95)','rgba(150,205,238,.9)');
  mp(15,13,55);const r=4.6*mU*PS;ctx.fillStyle='#e8b98a';ctx.beginPath();ctx.arc(PX,PY,r,0,TAU);ctx.fill();ctx.fillStyle='#f2c230';ctx.beginPath();ctx.ellipse(PX,PY-r*.8,r*1.5,r*.55,0,0,TAU);ctx.fill();
  ctx.strokeStyle='#7a1d12';ctx.lineWidth=Math.max(1,1.6*PS*mU);mline(4,13,44,4,13,66);mline(26,13,44,26,13,66);
  mb(2,28,-14,14,66,69,'#f1f1f1','#c2c2c2');
  // unloading auger
  ctx.lineCap='round';ctx.strokeStyle='#ececec';ctx.lineWidth=Math.max(2,5*PS*mU);mline(-18,-4,60,-58,-8,76);ctx.strokeStyle='#8f2018';ctx.lineWidth=Math.max(2,5.5*PS*mU);mline(-55,-8,75,-58,-8,76);ctx.lineCap='butt';
  // near track with rolling tread
  mb(-34,30,12,22,0,14,'#333','#1b1b1b');
  ctx.strokeStyle='#5a5a5a';ctx.lineWidth=Math.max(1,1.6*PS*mU);
  const off=((m.wheel%8)+8)%8;for(let i=0;i<8;i++){const l=-34+((i*8+off)%64);mline(l,22,1,l,22,13);}
  mp(-26,22,7);ctx.fillStyle='#777';ctx.beginPath();ctx.ellipse(PX,PY,5*mU*PS,5*mU*PS*ZK,0,0,TAU);ctx.fill();
  mp(22,22,7);ctx.beginPath();ctx.ellipse(PX,PY,5*mU*PS,5*mU*PS*ZK,0,0,TAU);ctx.fill();
}
const MDRAW={traktor:drawTraktor,tanam:drawTanam,tuai:drawTuai};
function drawMachine(m,t){mX=m.x;mY=m.y;mF=m.face;mU=L.U;ctx.globalAlpha=clamp(m.alpha,0,1);MDRAW[m.id](m,t);ctx.globalAlpha=1;}

/* ---------- egrets (bangau) that follow the traktor ---------- */
const EG=[0,1,2].map(i=>({on:false,x:0,y:0,z:0,f:1,ph:i*2.1,fly:false,vx:0,y_:0,draw:null}));
EG.forEach(e=>{e.draw=t=>drawEgret(e,t);});
function drawEgret(e,t){
  PZ(e.x,e.y,0);if(e.z<3){ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(PX,PY,7*PS,2.5*PS,0,0,TAU);ctx.fill();}
  PZ(e.x,e.y,e.z);const s=PS*L.hill*1.15;
  ctx.save();ctx.translate(PX,PY);ctx.scale(s*e.f,s);
  if(e.z<3){ctx.strokeStyle='#3a3a3a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2,0);ctx.lineTo(-2,-9);ctx.moveTo(2,0);ctx.lineTo(2,-9);ctx.stroke();}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,-12,8,4.6,-.15,0,TAU);ctx.fill();
  if(e.z>=3){const a=Math.sin(t*14+e.ph);ctx.beginPath();ctx.moveTo(-5,-13);ctx.quadraticCurveTo(-2,-13-16*a,9,-13-10*a);ctx.lineTo(5,-11);ctx.closePath();ctx.fill();}
  const pk=e.z<3?Math.max(0,Math.sin(t*5+e.ph)):0,hx=9+3*pk,hy=-22+17*pk;
  ctx.strokeStyle='#fff';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(6,-13);ctx.quadraticCurveTo(11,-18+6*pk,hx,hy);ctx.stroke();
  ctx.beginPath();ctx.arc(hx,hy,2.4,0,TAU);ctx.fill();
  ctx.fillStyle='#f2b233';ctx.beginPath();ctx.moveTo(hx+1.5,hy-1);ctx.lineTo(hx+8.5,hy+1+2*pk);ctx.lineTo(hx+1.5,hy+1.5);ctx.closePath();ctx.fill();
  ctx.restore();ctx.lineCap='butt';
}
function updateEgrets(dt){
  const m=M.traktor;
  for(let i=0;i<3;i++){
    const e=EG[i];
    if(m.active&&m.seg!=='leave'&&m.seg!=='enter'){
      const tx=m.x-m.face*(78+i*20)*L.U,ty=m.y+(i-1)*13*L.U+6;
      if(!e.on||e.fly){e.on=true;e.fly=false;e.x=tx-m.face*160;e.y=ty;e.z=70;}
      e.x=lerp(e.x,tx,Math.min(1,dt*3.2));e.y=lerp(e.y,ty,Math.min(1,dt*3.2));e.z=Math.max(0,e.z-dt*110);e.f=m.face;
    }else if(e.on){
      if(!e.fly){e.fly=true;e.vx=rnd(60,130)*(i%2?1:-1);e.f=e.vx>0?1:-1;}
      e.z+=dt*(70+i*12);e.x+=e.vx*dt;e.y-=dt*26;if(e.z>300)e.on=false;
    }
  }
}

/* ---------- Stesen dron: shed with NPK sacks and racun drums ---------- */
function drawShed(){
  const x=L.rx,y=L.shedY,hw=Math.min(40,L.rw*.44);
  ctx.globalAlpha=G.guards.dron?1:.45;
  box(x-hw,x+hw,y-24,y,0,34,'#8a4a2a','#c9965a');
  PZ(x-hw*.45,y,0);const ax=PX,ay=PY,k=PS*ZK;PZ(x+hw*.45,y,0);ctx.fillStyle='#4a3020';ctx.fillRect(ax,ay-24*k,PX-ax,24*k);
  box(x-hw-4,x+hw+4,y-28,y+3,34,39,'#b3543a','#7d3524');
  box(x-hw+1,x-hw+19,y+5,y+15,0,9,'#f4f1e4','#d9d3bd');box(x-hw+4,x-hw+18,y+6,y+14,9,17,'#fbf9ee','#e3ddc8');
  PZ(x-hw+11,y+15,5);ctx.fillStyle='#2f7d22';ctx.fillRect(PX-4*PS,PY-1.5*PS,8*PS,3*PS);
  box(x+hw-21,x+hw-9,y+5,y+15,0,16,'#58b2e0','#2f6fb5');box(x+hw-10,x+hw+1,y+9,y+18,0,16,'#6ec3ee','#3579bd');
  ctx.globalAlpha=1;
}
const shedObj={y:0,draw:drawShed};
const dynM={};MKEYS.forEach(id=>{dynM[id]={y:0,draw:t=>drawMachine(M[id],t)};});
function collectDyn(){
  dyn.length=0;
  for(let i=0;i<3;i++){const m=M[MKEYS[i]];if(m.active){const o=dynM[m.id];o.y=m.y+2;dyn.push(o);}}
  for(let i=0;i<3;i++)if(EG[i].on){EG[i].y_=EG[i].y;dyn.push(EG[i]);}
  if(G.L.unlock.indexOf('dron')>=0){shedObj.y=L.shedY+16;dyn.push(shedObj);}
}
/* dron: ground shadow, filling hose, spray cone (the dron body itself is an upright DOM overlay) */
function drawDroneFx(t){
  const d=G.drone;if(!d||!G.guards.dron)return;
  PZ(d.x,d.y,0);ctx.fillStyle='rgba(0,0,0,'+(.24-Math.min(.14,d.z*.002)).toFixed(3)+')';ctx.beginPath();ctx.ellipse(PX,PY,(16+d.z*.05)*PS*L.hill,(6+d.z*.02)*PS*L.hill,0,0,TAU);ctx.fill();
  if(d.st==='fill'){
    const hw=Math.min(40,L.rw*.44),sx=d.kind==='baja'?L.rx-hw+10:L.rx+hw-10;
    PZ(sx,L.shedY+12,14);const ax=PX,ay=PY;PZ(d.x,d.y,9);
    ctx.strokeStyle='#2b2b2b';ctx.lineWidth=Math.max(1.5,3*PS);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ax,ay);ctx.quadraticCurveTo((ax+PX)/2+10*PS,Math.max(ay,PY)+16*PS,PX,PY);ctx.stroke();
    ctx.strokeStyle=d.kind==='baja'?'#fff':'#58b2e0';ctx.lineWidth=Math.max(.8,1.2*PS);ctx.setLineDash([4,6]);ctx.lineDashOffset=-t*40;ctx.stroke();ctx.setLineDash([]);ctx.lineCap='butt';
  }
  if(d.st==='spray'){
    PZ(d.x,d.y,d.z-5);const tx=PX,ty=PY;PZ(d.x-36,d.y+8,0);const ax=PX,ay=PY;PZ(d.x+36,d.y+8,0);
    const g=ctx.createLinearGradient(0,ty,0,ay);const c=d.kind==='baja'?'255,255,255':'150,215,255';g.addColorStop(0,'rgba('+c+',.55)');g.addColorStop(1,'rgba('+c+',.08)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(ax,ay);ctx.lineTo(PX,PY);ctx.closePath();ctx.fill();
  }
}
// EG objects are sorted by .y: keep it as the plane y

/* ---------- game logic ---------- */
let uiDirty=true;
const toastSeen={};
function toast(msg,warn){
  const now=performance.now();if(toastSeen[msg]&&now-toastSeen[msg]<2600)return;toastSeen[msg]=now;
  const box=$('#toasts'),el=document.createElement('div');el.className='toast'+(warn?' warn':'');el.textContent=msg;box.appendChild(el);
  while(box.children.length>3)box.firstChild.remove();setTimeout(()=>el.remove(),3300);if(warn)Au.play('warn');
}
function floatAt(txt,x,y,z,cls){PZ(x,y,z||0);const el=document.createElement('div');el.className='fl '+(cls||'');el.textContent=txt;el.style.left=PX.toFixed(1)+'px';el.style.top=PY.toFixed(1)+'px';ov.appendChild(el);setTimeout(()=>el.remove(),1200);}
const pcx=p=>(p.x0+p.x1)/2,pcy=p=>(p.y0+p.y1)/2;
function addMoney(n,p){
  G.money+=n;uiDirty=true;if(p)floatAt((n<0?'-':'+')+'RM'+Math.abs(n),pcx(p),pcy(p),30,n<0?'neg':'pos');
  if(n>0){const el=$('.money');el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
}
function spend(n,p){if(n<=0)return true;if(G.money<n)return false;addMoney(-n,p);return true;}
function addItem(k,n,p){G.stor[k]+=n;G.made[k]+=n;uiDirty=true;if(p)floatAt('+'+n+' '+(ITEMS[k].s||ITEMS[k].n),pcx(p),pcy(p),44,'pos');}
const unlocked=k=>G.L.unlock.indexOf(k)>=0||G.L.pre.indexOf(k)>=0;

function startLevel(i){
  G.lvl=i;G.L=LEVELS[i];G.D=DIFF[G.diff];const D=G.D,Lv=G.L;
  G.running=false;G.paused=false;G.won=false;G.t=0;
  G.money=Math.round(Lv.money*D.money);
  IKEYS.forEach(k=>{G.stor[k]=0;G.made[k]=0;});
  G.goals=Object.keys(Lv.goals).map(k=>{const n=Lv.goals[k];return{k,need:k==='rm'?Math.max(10,Math.round(n*D.goal/10)*10):Math.max(2,Math.round(n*D.goal))};});
  G.goldT=Math.round(Lv.gold*D.medal);G.silverT=Math.round(Lv.silver*D.medal);
  G.gate=false;G.palong=100;G.bk=1;G.tool='tangan';
  G.pests.forEach(q=>{if(q.el)q.el.remove();});G.pests=[];G.spawnT={};
  for(const k in Lv.pests)G.spawnT[k]=Lv.pests[k]*D.pest*.6+8;
  G.petak.forEach(p=>{p.st='empty';p.g=0;p.water=0;p.wt=0;p.lv=0;p.baja=false;p.racunT=0;p.ripeT=0;p.stubT=0;p.bena=0;p.benaSp=0;p.benaDie=0;p.pest=null;p.work=null;p.hintC='';});
  BKEYS.forEach(k=>{G.builds[k]={built:Lv.pre.indexOf(k)>=0,t:0,pending:0,hold:false};});
  GKEYS.forEach(k=>{G.guards[k]=false;});
  G.lorry={st:'idle',t:0,load:null,val:0,n:0};
  G.drone={st:'idle',kind:'baja',t:0,x:L.rx,y:L.padY,z:0,tank:0,row:0,lean:0,done:[0,0,0,0,0]};
  MKEYS.forEach(id=>{const m=M[id];m.active=false;m.p=null;m.alpha=0;m.working=false;m.seg='';});
  EG.forEach(e=>{e.on=false;});pL.fill(0);
  G.hover=-1;G.pulse=-1;G.filling=0;G.draining=0;G.colFill.fill(0);
  $$('.fl',ov).forEach(e=>e.remove());
  uiDirty=true;
}

/* ---------- water + growth ---------- */
function killPetak(p,why){
  if(p.pest)removePest(p.pest,'gone');
  p.st='dead';p.g=0;p.bena=0;p.baja=false;p.ripeT=0;uiDirty=true;
  toast('Petak '+(p.i+1)+' rosak (lost): '+why+'. Plough it again.',true);Au.play('buzz');burst(K_DUST,pcx(p),pcy(p),8,40,30,6,1);
}
function spreadBena(p){
  const nb=[];if(p.c>0)nb.push(p.i-1);if(p.c<COLS-1)nb.push(p.i+1);if(p.r>0)nb.push(p.i-COLS);if(p.r<ROWS-1)nb.push(p.i+COLS);
  const ok=nb.map(i=>G.petak[i]).filter(q=>q.st==='grow'&&q.lv===2&&q.bena<=0&&q.racunT<=0&&!q.work);
  if(ok.length){const q=ok[(Math.random()*ok.length)|0];q.bena=.01;q.benaSp=0;q.benaDie=0;Au.play('warn');uiDirty=true;}
}
function updatePetak(p,dt,flow,drainR){
  if(p.water<p.wt-.001){
    if(G.gate||G.palong>0){
      const d=Math.min(flow*dt,p.wt-p.water);p.water+=d;if(!G.gate)G.palong=Math.max(0,G.palong-d*12);G.filling++;G.colFill[p.c]++;
      if(Math.random()<dt*14)emit(K_WATER,pcx(p)+rnd(-8,8),p.y0+rnd(4,14),2,rnd(-30,30),rnd(0,30),rnd(40,90),.4,rnd(1.2,2.2));
    }
  }else if(p.water>p.wt+.001){p.water=Math.max(p.wt,p.water-drainR*dt);G.draining++;}
  const lv=levelOf(p);if(lv!==p.lv){p.lv=lv;uiDirty=true;}
  if(p.racunT>0)p.racunT-=dt;
  if(p.work)return;
  if(p.st==='grow'){
    if(p.bena>0){
      if(lv!==2){p.benaDie+=dt;if(p.benaDie>1.4){p.bena=0;floatAt('Bena perang gone',pcx(p),pcy(p),40,'pos');uiDirty=true;}}
      else{p.benaDie=0;p.bena+=dt;p.benaSp+=dt;if(p.benaSp>=12){p.benaSp=0;spreadBena(p);}if(p.bena>20*G.D.eat)killPetak(p,'bena perang');}
    }else{
      const m=p.g<.34?(lv===0?.45:lv===1?.75:1):(lv===0?.6:lv===1?1:.9);
      p.g+=dt/9*m*(p.baja?1.5:1)*G.D.grow;
      if(p.g>=1){p.g=1;p.st='ripe';p.ripeT=0;uiDirty=true;}
    }
  }else if(p.st==='ripe'){
    if(!(M.tuai.active&&lv===0))p.ripeT+=dt;
    if(p.ripeT>40*G.D.eat)killPetak(p,'left too long, the padi spoiled');
  }else if(p.st==='stubble'){p.stubT+=dt;if(p.stubT>18){p.st='empty';uiDirty=true;}}
}

/* ---------- tools ---------- */
function setWater(p,lv){
  const wt=lv/2;
  if(Math.abs(p.wt-wt)<.01){if(Math.abs(p.water-wt)<.02)toast('Petak '+(p.i+1)+' is already '+LVN[lv]+'.');return false;}
  if(wt>p.water&&!G.gate&&G.palong<=0){toast('The palong is empty. Open the pintu air (sluice gate)!',true);return false;}
  p.wt=wt;Au.play(wt>p.water?'water':'drain');uiDirty=true;return true;
}
function collectJerami(p){
  if(storCount()>=CAP){toast('Stor penuh (storage full). Send the lorry!',true);return false;}
  addItem('jerami',1,p);p.st='empty';p.stubT=0;burst(K_STRAW,pcx(p),pcy(p),REDUCED?3:10,60,120,1.8,.7);Au.play('pluck');return true;
}
function smart(p){
  if(p.st==='stubble')return collectJerami(p);
  if(p.st==='ploughed')return setWater(p,2);
  if(p.st==='grow')return setWater(p,p.g<.34?2:1);
  if(p.st==='ripe')return setWater(p,0);
  toast(p.st==='dead'?'This petak is rosak (dead). Send the Traktor to plough it.':'Empty petak. Send the Traktor to bajak (plough) first.');return false;
}
function doBaja(p,free){
  if(!(p.st==='grow'||(p.st==='ploughed'&&p.lv===2))){if(!free)toast('Baja works on growing padi or a Basah petak.');return false;}
  if(p.baja){if(!free)toast('This petak already has baja.');return false;}
  if(!free&&!spend(3,p)){toast('Baja costs RM3.',true);return false;}
  p.baja=true;uiDirty=true;if(!free)Au.play('baja');
  const n=REDUCED?4:16;for(let i=0;i<n;i++)emit(K_BAJA,rnd(p.x0+6,p.x1-6),rnd(p.y0+6,p.y1-6),rnd(30,60),rnd(-10,10),rnd(-6,6),rnd(-20,20),.9,1.6);
  return true;
}
function doRacun(p,free){
  if(p.st==='empty'||p.st==='stubble'||p.st==='dead'){if(!free)toast('Nothing to protect on this petak.');return false;}
  if(!free&&!spend(3,p)){toast('Racun costs RM3.',true);return false;}
  if(p.pest&&p.pest.type==='snail')removePest(p.pest,'caught');
  if(p.bena>0){p.bena=0;floatAt('Bena perang mati!',pcx(p),pcy(p),40,'pos');}
  p.racunT=20;uiDirty=true;if(!free)Au.play('racun');
  const n=REDUCED?3:10;for(let i=0;i<n;i++)emit(K_RACUN,rnd(p.x0+8,p.x1-8),rnd(p.y0+8,p.y1-8),rnd(10,30),rnd(-12,12),rnd(-6,6),rnd(8,24),1.2,rnd(5,8));
  return true;
}
function applyTool(p){
  if(!G.running||G.paused)return;
  if(p.work){toast('A machine is working on this petak.');return;}
  const t=G.tool;
  if(t==='tangan')smart(p);else if(t==='basah')setWater(p,2);else if(t==='sederhana')setWater(p,1);else if(t==='kering')setWater(p,0);else if(t==='baja')doBaja(p,false);else if(t==='racun')doRacun(p,false);
}
function toggleGate(){if(!G.running||G.paused)return;G.gate=!G.gate;Au.play('creak');uiDirty=true;}

/* ---------- pests ---------- */
function pestOk(type,p){
  if(p.work||p.pest)return false;
  if(type==='bird')return(p.st==='grow'||p.st==='ripe')&&p.lv!==1;
  if(type==='snail')return p.st==='grow'&&p.g<.34&&p.lv===2&&p.racunT<=0;
  if(type==='rat')return(p.st==='grow'||p.st==='ripe')&&p.lv===0;
  return p.st==='grow'&&p.lv===2&&p.bena<=0&&p.racunT<=0&&p.g>.08&&p.g<.95;
}
function pestStays(q){
  const p=q.p;if(p.work)return false;
  if(q.type==='bird')return(p.st==='grow'||p.st==='ripe')&&p.lv!==1;
  if(q.type==='snail')return p.st==='grow'&&p.lv===2&&p.g<.6;
  return(p.st==='grow'||p.st==='ripe')&&p.lv===0;
}
function spawnPest(type){
  const c=G.petak.filter(p=>pestOk(type,p));if(!c.length)return;
  const p=c[(Math.random()*c.length)|0];
  if(type==='bena'){p.bena=.01;p.benaSp=0;p.benaDie=0;uiDirty=true;toast('Bena perang (planthopper)! Spray Racun or lower the water to Sederhana.',true);return;}
  const q={type,p,t:0,max:PEST[type].eat*G.D.eat,gone:false,el:null,sx:0,sy:0,hw:0,hh:0,hv:-1};
  p.pest=q;G.pests.push(q);mkPestEl(q);if(type==='bird')Au.play('tweet');uiDirty=true;
}
let pestsDirty=false;
function removePest(q,how){
  if(q.gone)return;q.gone=true;pestsDirty=true;if(q.p.pest===q)q.p.pest=null;uiDirty=true;
  if(q.el){const el=q.el;el.classList.add(how==='caught'?'caught':'gone');setTimeout(()=>el.remove(),620);}
}
function hitPest(q){
  const p=q.p;
  if(q.type==='bird'){Au.play('shoo');floatAt('Shoo!',pcx(p),pcy(p),50,'pos');removePest(q,'gone');}
  else if(q.type==='snail'){Au.play('pluck');removePest(q,'caught');addMoney(1,p);}
  else{Au.play('squeak');removePest(q,'caught');addMoney(5,p);}
}
function updatePests(dt){
  for(const type in G.spawnT){
    G.spawnT[type]-=dt;
    if(G.spawnT[type]<=0){
      let iv=G.L.pests[type]*G.D.pest;if(type==='bird'&&G.guards.scarecrow)iv*=2;if(type==='rat'&&G.guards.owl)iv*=2;
      G.spawnT[type]=iv*rnd(.7,1.3);spawnPest(type);
    }
  }
  for(let i=0;i<G.pests.length;i++){
    const q=G.pests[i];if(q.gone)continue;
    if(!pestStays(q)){removePest(q,'gone');continue;}
    q.t+=dt;if(q.t>=q.max){const p=q.p;removePest(q,'gone');killPetak(p,'the '+PEST[q.type].n+' ate the padi');}
  }
  if(pestsDirty){G.pests=G.pests.filter(q=>!q.gone);pestsDirty=false;}
}

/* ---------- machines: lane by lane inside every petak ---------- */
const LANEY=[5/6,.5,1/6];
function eligible(id,p){
  if(p.work)return false;
  if(id==='traktor')return p.st==='empty'||p.st==='stubble'||p.st==='dead';
  if(id==='tanam')return p.st==='ploughed'&&p.water>=.95;
  return p.st==='ripe'&&p.water<=.05;
}
function countEligible(id){let n=0;for(let i=0;i<NP;i++)if(eligible(id,G.petak[i]))n++;return n;}
function nextIdx(m){
  for(let i=m.oi+1;i<NP;i++)if(eligible(m.id,G.petak[ORDER[i]]))return i;
  for(let i=0;i<=m.oi&&i<NP;i++)if(eligible(m.id,G.petak[ORDER[i]]))return i;
  return -1;
}
const laneX=(p,dir,n)=>dir>0?p.x0+n*(p.x1-p.x0):p.x1-n*(p.x1-p.x0);
function claimNext(m){
  const i=nextIdx(m);
  if(i<0){m.seg='leave';m.p=null;m.working=false;return false;}
  m.oi=i;const p=G.petak[ORDER[i]],cost=G.D.free?0:MACH[m.id].cost;
  if(cost>0&&G.money>=cost)addMoney(-cost,p);
  if(m.id!=='tanam'&&p.pest)removePest(p.pest,'gone');
  m.p=p;m.pdir=rowDir(p.r);m.lane=0;m.ldir=m.pdir;
  p.work={id:m.id,lane:-1,pdir:m.pdir,lt:[0,0,0]};
  if(m.id==='tanam')m.tray=1;
  m.tx=laneX(p,m.ldir,MACH[m.id].rear?.2:-.1);m.ty=p.y0+(p.y1-p.y0)*LANEY[0];m.seg='travel';
  return true;
}
function startMachine(id){
  const m=M[id];if(!G.running||G.paused)return;
  if(m.active){toast(MACH[id].n+' is already working.');return;}
  const n=countEligible(id);
  if(!n){toast(MACH[id].need);Au.play('nope');return;}
  m.active=true;m.oi=-1;m.done=0;m.total=n;m.alpha=0;m.tank=0;m.tray=1;m.wheel=0;m.anim=0;m.working=false;
  claimNext(m);m.x=m.tx-m.ldir*L.pw*.9;m.y=m.ty;m.face=m.ldir;
  Au.play('click');uiDirty=true;
}
function finalize(m,p){
  if(m.id==='traktor'){p.st='ploughed';p.g=0;p.baja=false;p.bena=0;p.stubT=0;}
  else if(m.id==='tanam'){p.st='grow';p.g=0;p.ripeT=0;p.bena=0;}
  else{
    addItem('padi',p.baja?2:1,p);p.st='stubble';p.stubT=0;p.baja=false;p.g=0;p.ripeT=0;m.tank=0;
    burst(K_GRAIN,pcx(p),pcy(p),REDUCED?4:14,70,150,2.2,.8);Au.play('harvest');
  }
  p.work=null;uiDirty=true;
}
function machineFx(m,dt){
  if(REDUCED&&Math.random()<.75)return;
  const U=L.U,f=m.face;
  if(m.id==='traktor'){
    if(Math.random()<dt*42)emit(K_MUD,m.x-f*50*U+rnd(-6,6),m.y+rnd(-18,18)*U,rnd(2,8),-f*rnd(20,90),rnd(-20,20),rnd(60,140),.6,rnd(1.5,3));
    if(Math.random()<dt*11)emit(K_SMOKE,m.x+f*21*U,m.y,58*U,-f*rnd(10,30),0,rnd(30,50),1,rnd(3,5));
  }else if(m.id==='tanam'){
    if(Math.random()<dt*30)emit(K_WATER,m.x-f*50*U,m.y+rnd(-20,20)*U,2,-f*rnd(10,60),rnd(-15,15),rnd(50,110),.45,rnd(1.2,2.4));
  }else{
    if(Math.random()<dt*38)emit(K_STRAW,m.x-f*42*U,m.y+rnd(-10,10)*U,rnd(20,40)*U,-f*rnd(40,120),rnd(-25,25),rnd(20,90),.7,rnd(1.3,2.2));
    if(Math.random()<dt*14)emit(K_DUST,m.x-f*46*U,m.y,26*U,-f*rnd(20,50),rnd(-8,8),rnd(10,30),.9,rnd(4,7));
  }
}
function updateMachines(dt){
  for(let k=0;k<3;k++){
    const m=M[MKEYS[k]];
    if(!m.active){Au.loop('eng_'+m.id,false);continue;}
    Au.loop('eng_'+m.id,true);
    const C=MACH[m.id],v=C.spd*L.pw*G.D.mspd,p=m.p;m.anim+=dt;
    if(m.seg==='leave'){
      const d=v*.5*dt;m.x+=m.face*d;m.wheel+=d/L.U;m.alpha-=dt*2.6;
      if(m.alpha<=0){m.active=false;m.alpha=0;uiDirty=true;}
      continue;
    }
    m.alpha=Math.min(1,m.alpha+dt*4);
    if(m.seg==='travel'||m.seg==='turn'){
      const turn=m.seg==='turn',sp=v*(turn?.6:1.3),dx=m.tx-m.x,dy=m.ty-m.y,dist=Math.hypot(dx,dy),stp=sp*dt;
      if(turn){const lt=p.work.lt;lt[m.lane-1]=Math.min(1.02,lt[m.lane-1]+dt*4);if(dist<m.turnD*.5)m.face=m.ldir;}
      else if(Math.abs(dx)>4)m.face=dx>0?1:-1;
      if(dist<=stp){m.x=m.tx;m.y=m.ty;m.seg='lane';m.face=m.ldir;p.work.lane=m.lane;}
      else{m.x+=dx/dist*stp;m.y+=dy/dist*stp;m.wheel+=stp/L.U;}
      m.working=turn||m.seg==='lane';
    }else if(m.seg==='lane'){
      const w=p.x1-p.x0,r0=C.rear?.2:-.1,r1=C.rear?1.05:.8,stp=v*dt;
      m.x+=m.ldir*stp;m.wheel+=stp/L.U;m.working=true;
      const n=m.ldir>0?(m.x-p.x0)/w:(p.x1-m.x)/w,lt=p.work.lt,pr=clamp((n-r0)/(r1-r0),0,1);
      lt[m.lane]=clamp(n+(C.rear?-.2:.2),lt[m.lane],1.02);
      if(m.id==='tanam')m.tray=1-(m.lane+pr)/3;else if(m.id==='tuai')m.tank=(m.lane+pr)/3;
      machineFx(m,dt);
      if(n>=r1){
        if(m.lane<2){m.lane++;m.ldir=-m.ldir;m.tx=laneX(p,m.ldir,r0);m.ty=p.y0+(p.y1-p.y0)*LANEY[m.lane];m.turnD=Math.hypot(m.tx-m.x,m.ty-m.y);m.seg='turn';}
        else m.seg='finish';
      }
    }else if(m.seg==='finish'){
      const lt=p.work.lt;lt[0]=lt[1]=1.02;lt[2]=Math.min(1.02,lt[2]+dt*5);
      if(lt[2]>=1.02){finalize(m,p);m.done++;claimNext(m);}
    }
  }
}

/* ---------- workshops, defences, lorry ---------- */
function buildOrProcess(k){
  if(!G.running||G.paused)return;const b=G.builds[k],B=BUILDS[k];
  if(!unlocked(k)){toast(B.n+' unlocks in a later level.');return;}
  if(!b.built){
    if(G.money<B.cost){toast('You need '+RM(B.cost)+' to build the '+B.n+'. Sell with the lorry.',true);return;}
    addMoney(-B.cost);b.built=true;Au.play('build');toast(B.n+' built! '+B.nin+' '+ITEMS[B.in].n+' → 1 '+ITEMS[B.out].n+'.');uiDirty=true;return;
  }
  if(G.stor[B.in]<B.nin){toast(B.n+' needs '+B.nin+' '+ITEMS[B.in].n+' (you have '+G.stor[B.in]+').');Au.play('nope');return;}
  if(b.pending>=6){toast(B.n+' is busy.');return;}
  G.stor[B.in]-=B.nin;b.pending++;Au.play('clunk');uiDirty=true;
}
function updateBuilds(dt){
  for(let i=0;i<3;i++){
    const k=BKEYS[i],b=G.builds[k],B=BUILDS[k];if(!b.pending)continue;
    if(!b.hold){b.t+=dt;if(b.t>=B.time)b.hold=true;}
    if(b.hold&&storCount()<CAP){b.hold=false;b.t=0;b.pending--;addItem(B.out,1);Au.play('coin');toast('+1 '+ITEMS[B.out].n+' from the '+B.n+'.');}
  }
}
function buyGuard(k){
  if(!G.running||G.paused)return;const g=GUARDS[k];
  if(!unlocked(k)){toast(g.n+' unlocks in a later level.');return;}
  if(G.guards[k])return;
  if(G.money<g.cost){toast('You need '+RM(g.cost)+' for the '+g.n+'.',true);return;}
  addMoney(-g.cost);G.guards[k]=true;Au.play('build');toast(g.n+' is ready: '+g.en+'.');uiDirty=true;layoutOverlays();
}
function sendLorry(load){
  const lo=G.lorry;if(lo.st!=='idle')return false;let n=0,val=0;
  IKEYS.forEach(k=>{const c=Math.min(load[k]||0,G.stor[k]);load[k]=c;n+=c;val+=c*ITEMS[k].price;});
  if(!n){toast('Load something first.');return false;}
  IKEYS.forEach(k=>{G.stor[k]-=load[k];});
  lo.st='out';lo.t=0;lo.load=load;lo.val=val;lo.n=n;Au.play('horn');uiDirty=true;return true;
}
function updateLorry(dt){
  const lo=G.lorry;if(lo.st==='idle')return;lo.t+=dt;
  if(lo.t>=LORRY_TIME){lo.st='idle';lo.t=0;addMoney(lo.val);Au.play('cash');toast('Lori pulang: +'+RM(lo.val)+' from Pasar Sekinchan.');uiDirty=true;}
}

/* ---------- dron ---------- */
function droneRow(kind){
  let best=-1,bs=0;
  for(let r=0;r<ROWS;r++){
    let s=0;
    for(let c=0;c<COLS;c++){
      const p=G.petak[r*COLS+c];if(p.work)continue;
      if(kind==='baja'){if(!p.baja&&(p.st==='grow'||(p.st==='ploughed'&&p.lv===2)))s+=1;}
      else{if(p.bena>0)s+=4;if(p.pest&&p.pest.type==='snail')s+=3;if((p.st==='grow'||p.st==='ripe')&&p.racunT<=0)s+=p.lv===2?1:.3;}
    }
    if(s>bs){bs=s;best=r;}
  }
  return best;
}
function startDrone(kind){
  if(!G.running||G.paused)return;
  if(!G.guards.dron){toast('Buy the Dron first (RM180, in Pertahanan).');return;}
  const d=G.drone;if(d.st!=='idle'){toast('The dron is busy.');return;}
  const r=droneRow(kind);if(r<0){toast(kind==='baja'?'No row needs baja right now.':'No row needs racun right now.');return;}
  if(G.money<2){toast('The dron spray costs RM2 per petak.',true);return;}
  d.kind=kind;d.row=r;d.st='fill';d.t=0;d.tank=0;d.done.fill(0);Au.play('click');uiDirty=true;
}
function flyTo(d,x,y,stp){const dx=x-d.x,dy=y-d.y,dist=Math.hypot(dx,dy);if(dist<=stp){d.x=x;d.y=y;return true;}d.x+=dx/dist*stp;d.y+=dy/dist*stp;return false;}
function droneMsg(){const d=G.drone;return d.st==='fill'?'Filling tank…':d.st==='takeoff'?'Taking off…':d.st==='go'||d.st==='spray'?'Spraying row '+(d.row+1):d.st==='home'?'Flying home':d.st==='land'?'Landing':'';}
function updateDrone(dt){
  const d=G.drone;if(!d)return;
  Au.loop('drone',d.st!=='idle'&&d.st!=='fill');Au.loop('spray',d.st==='spray');
  if(d.st==='idle')return;
  const st0=d.st,ry=L.fy0+(d.row+.5)*L.ph;d.t+=dt;
  if(d.st==='fill'){d.tank=Math.min(1,d.t/1.6);d.lean=0;if(d.t>=1.6)d.st='takeoff';}
  else if(d.st==='takeoff'){d.z=Math.min(64,d.z+dt*90);if(d.z>=64)d.st='go';}
  else if(d.st==='go'){d.lean=-.24;if(flyTo(d,L.fx1-4,ry,480*dt))d.st='spray';}
  else if(d.st==='spray'){
    d.x-=250*dt;d.lean=-.13;d.tank=clamp((d.x-L.fx0)/(L.fx1-L.fx0),0,1);
    if(Math.random()<dt*(REDUCED?12:50)){if(d.kind==='baja')emit(K_BAJA,d.x+rnd(-20,20),d.y+rnd(-14,14),d.z-10,rnd(-15,15),rnd(-8,8),-60,.7,1.6);else emit(K_RACUN,d.x+rnd(-20,20),d.y+rnd(-14,14),d.z-14,rnd(-15,15),rnd(-8,8),-40,1,5);}
    for(let c=0;c<COLS;c++){
      const p=G.petak[d.row*COLS+c];
      if(!d.done[c]&&d.x<pcx(p)){
        d.done[c]=1;if(p.work)continue;
        if(G.money<2){toast('Not enough RM for the dron spray.',true);continue;}
        if(d.kind==='baja'?doBaja(p,true):doRacun(p,true))addMoney(-2,p);
      }
    }
    if(d.x<=L.fx0+4)d.st='home';
  }
  else if(d.st==='home'){d.lean=.24;if(flyTo(d,L.rx,L.padY,480*dt)){d.st='land';d.lean=0;}}
  else if(d.st==='land'){d.z=Math.max(0,d.z-dt*80);if(d.z<=0){d.st='idle';d.tank=0;}}
  if(d.st!==st0)uiDirty=true;
}

/* ---------- goals + medals ---------- */
const goalProg=g=>g.k==='rm'?G.money:G.made[g.k];
function medalNow(){return G.t<=G.goldT?'gold':G.t<=G.silverT?'silver':'bronze';}
function checkGoals(){
  if(G.won||!G.running)return;
  for(let i=0;i<G.goals.length;i++)if(goalProg(G.goals[i])<G.goals[i].need)return;
  G.won=true;G.running=false;
  const medal=medalNow(),rank={bronze:1,silver:2,gold:3},best=store.get('best',{}),un=store.get('unlocked',1);
  if(!best[G.lvl]||rank[medal]>rank[best[G.lvl]]){best[G.lvl]=medal;store.set('best',best);}
  if(G.lvl+2>un)store.set('unlocked',Math.min(LEVELS.length,G.lvl+2));
  showWin(medal);
}

/* ---------- the step-by-step guide ---------- */
let gTxt='',gPetak=-1,gBtn='';
function guide(txt,petak,btn){gTxt=txt;gPetak=petak===undefined?-1:petak;gBtn=btn||'';}
function findP(f){for(let i=0;i<NP;i++){const p=G.petak[ORDER[i]];if(f(p))return p;}return null;}
function computeGuide(){
  let p;
  for(let i=0;i<G.pests.length;i++){const q=G.pests[i];if(!q.gone)return guide('Tap the '+PEST[q.type].n+' ('+PEST[q.type].en+') before it eats the padi!',q.p.i);}
  if((p=findP(p=>p.bena>0&&p.lv===2)))return guide('Bena perang! Spray Racun on it, or lower that petak to Sederhana.',p.i,'[data-tool=racun]');
  if((p=findP(p=>p.st==='ripe'&&!p.work&&p.wt!==0)))return guide('The padi is gold and ripe. Tap it to drain the petak to Kering.',p.i);
  if(!M.tuai.active&&countEligible('tuai'))return guide('Ripe padi is dry. Send the Mesin Tuai to harvest it!',-1,'#mTuai');
  if((p=findP(p=>p.st==='grow'&&p.g<.34&&p.wt<1&&p.bena<=0)))return guide('Seedlings need water. Tap to flood the petak back to Basah.',p.i);
  if((p=findP(p=>p.st==='grow'&&p.g>=.34&&p.wt===1&&!p.work)))return guide('Seedlings are established. Tap to lower the water to Sederhana (fastest growth, no pests).',p.i);
  if(!M.tanam.active&&countEligible('tanam'))return guide('Basah petak are ready. Send the Mesin Tanam to transplant seedlings.',-1,'#mTanam');
  const dry=findP(p=>p.st==='ploughed'&&p.wt<1&&!p.work);
  if(!G.gate&&G.palong<=0&&(dry||findP(p=>p.wt>p.water+.01)))return guide('The palong is empty. Open the pintu air to let water in from the bangkenal.',-1,'#gateBtn');
  if(dry)return guide('Isi air: tap each ploughed petak to flood it to Basah.',dry.i);
  if((p=findP(p=>p.st==='stubble'&&!p.work))&&storCount()<CAP)return guide('Tap the stubble to collect Jerami (straw) and clear the petak.',p.i);
  if(!M.traktor.active&&findP(p=>!p.work&&(p.st==='empty'||p.st==='dead')))return guide('Send the Traktor to bajak (plough) the bare petak.',-1,'#mTraktor');
  // workshops
  const need={};G.goals.forEach(g=>{if(g.k!=='rm'&&goalProg(g)<g.need)need[g.k]=1;});
  if(need.kuih)need.beras=1;
  const chain=[['kuih','kitchen'],['cendawan','shed'],['beras','mill']];
  let wantMoney=0;
  for(let i=0;i<3;i++){
    const it=chain[i][0],k=chain[i][1],b=G.builds[k],B=BUILDS[k];if(!need[it]||!unlocked(k))continue;
    if(!b.built){if(G.money>=B.cost)return guide('Build the '+B.n+' ('+RM(B.cost)+'): '+B.nin+' '+ITEMS[B.in].n+' → 1 '+ITEMS[B.out].n+'.',-1,'#b_'+k);wantMoney=1;continue;}
    if(G.stor[B.in]>=B.nin&&b.pending<3&&storCount()<=CAP)return guide('Tap the '+B.n+' to turn '+B.nin+' '+ITEMS[B.in].n+' into 1 '+ITEMS[B.out].n+'.',-1,'#b_'+k);
  }
  const rmGoal=G.goals.find(g=>g.k==='rm'),sc=storCount();
  if(G.lorry.st==='idle'&&sc>0&&(sc>=CAP-4||wantMoney||(rmGoal&&G.money<rmGoal.need&&(sc>=6||!Object.keys(need).length))))
    return guide(sc>=CAP-4?'The stor is nearly full. Load the lorry and sell at Pasar Sekinchan.':'You need more RM. Load the lorry and sell at Pasar Sekinchan.',-1,'#lorryBtn');
  if(G.lorry.st!=='idle')return guide('The lorry is on its way to Pasar Sekinchan. Keep the sawah busy!');
  guide('The padi is growing… watch for pests and keep the water right.');
}

/* ---------- per-frame update ---------- */
function update(dt){
  G.t+=dt;
  const bk=G.L.bk;G.bk=bk?clamp(bk[0]+bk[1]*Math.sin(G.t*TAU/bk[2]),.15,1):1;
  if(G.gate)G.palong=Math.min(100,G.palong+dt*70);
  const pump=G.guards.pump,flow=.55*(.45+.55*G.bk)*(pump?1.8:1),drainR=.6*(pump?1.6:1);
  G.filling=0;G.draining=0;G.colFill.fill(0);
  for(let i=0;i<NP;i++)updatePetak(G.petak[i],dt,flow,drainR);
  updatePests(dt);updateMachines(dt);updateEgrets(dt);updateBuilds(dt);updateLorry(dt);updateDrone(dt);
  stepParticles(dt);
  Au.loop('flow',G.gate);
  checkGoals();
}

/* ---------- UI: overlays, HUD, input, modals, dock, main loop ---------- */
function setTxt(el,s){if(el&&el._t!==s){el._t=s;el.textContent=s;}}
function setCls(el,c,on){on=!!on;if(el&&el['_c'+c]!==on){el['_c'+c]=on;el.classList.toggle(c,on);}}
function mkEl(tag,cls,html,parent){const e=document.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;(parent||ov).appendChild(e);return e;}

const ptBtns=[],hintEls=[];let lblBk,lblPal,lblPar,lblDr,gateEl,scareEl,owlEl,pumpEl,droneEl,droneTk;
const gateRect={x:0,y:0,w:0,h:0};
const SVG_GATE='<svg viewBox="0 0 44 46"><rect x="4" y="14" width="6" height="32" fill="#b9b9b0"/><rect x="34" y="14" width="6" height="32" fill="#b9b9b0"/><rect x="11" y="24" width="22" height="22" fill="#3f93c4"/><rect class="sh" x="11" y="24" width="22" height="22" fill="#5d6f7a" stroke="#3d4a52"/><rect x="2" y="10" width="40" height="6" fill="#d2d2c9"/><path d="M22 10V26" stroke="#444" stroke-width="3"/><g class="gw"><circle cx="22" cy="8" r="7" fill="none" stroke="#d93a2b" stroke-width="3"/><path d="M15 8H29M22 1V15" stroke="#d93a2b" stroke-width="2"/></g></svg>';
const SVG_SCARE='<svg viewBox="0 0 40 60"><path d="M20 20V60M4 30H36" stroke="#7a5c36" stroke-width="3" stroke-linecap="round"/><path d="M10 26H30L28 46H12Z" fill="#d93a2b"/><path d="M12 46l-2 5M16 46v6M20 46v6M24 46v6M28 46l2 5M4 30l-2 4M36 30l2 4" stroke="#e5d391" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="17" r="7" fill="#f0d9a0"/><path d="M17 16h.1M23 16h.1" stroke="#333" stroke-width="2" stroke-linecap="round"/><path d="M17 20q3 2 6 0" stroke="#333" fill="none"/><path d="M3 14L20 2L37 14Q20 18 3 14Z" fill="#c9a24a" stroke="#8a6a1a"/></svg>';
const SVG_OWL='<svg viewBox="0 0 30 70"><path d="M15 26V70" stroke="#7a5c36" stroke-width="3.5"/><rect x="4" y="6" width="22" height="22" rx="1" fill="#b9773e" stroke="#5b3d24" stroke-width="1.5"/><path d="M1 8L15 1L29 8Z" fill="#5b3d24"/><circle cx="15" cy="17" r="6.500" fill="#2b2118"/><circle cx="12.500" cy="16" r="1.800" fill="#ffd95a"/><circle cx="17.500" cy="16" r="1.800" fill="#ffd95a"/><path d="M14 19l1 1.500 1-1.500z" fill="#f2b233"/></svg>';
const SVG_PUMP='<svg viewBox="0 0 40 30"><path d="M2 28H30" stroke="#444" stroke-width="3" stroke-linecap="round"/><rect x="5" y="12" width="20" height="14" rx="3" fill="#2f6fb5" stroke="#1d4a80"/><circle cx="15" cy="19" r="4.500" fill="#9fd4ee"/><path d="M25 16h9V6" stroke="#666" stroke-width="4" fill="none"/><rect x="10" y="6" width="6" height="6" fill="#d93a2b"/></svg>';
const SVG_DRONE='<svg viewBox="0 0 60 40"><path d="M8 12H52" stroke="#39424a" stroke-width="3"/><path d="M8 12V9M52 12V9M22 10V6M38 10V6" stroke="#39424a" stroke-width="2"/><ellipse class="rt" cx="8" cy="8.500" rx="9" ry="2.400" fill="#aab8c2"/><ellipse class="rt" cx="52" cy="8.500" rx="9" ry="2.400" fill="#aab8c2"/><ellipse class="rt" cx="22" cy="5.500" rx="7" ry="2" fill="#c3ced6"/><ellipse class="rt" cx="38" cy="5.500" rx="7" ry="2" fill="#c3ced6"/><rect x="20" y="10" width="20" height="9" rx="4" fill="#39424a"/><circle cx="30" cy="14.500" r="2" fill="#d93a2b"/><rect x="22" y="19" width="16" height="12" rx="2" fill="#4a545b" stroke="#2b3238"/><rect class="tk" x="23.500" y="30" width="13" height="0" fill="#fff"/><path d="M18 31v5M42 31v5M14 36h8M38 36h8" stroke="#39424a" stroke-width="2" stroke-linecap="round"/></svg>';
const SVG_PEST={
  bird:'<svg viewBox="0 0 32 28"><g class="in"><path d="M13 22v5M17 22v5" stroke="#444" stroke-width="1.2"/><g class="bd"><ellipse cx="15" cy="16" rx="9" ry="6.500" fill="#8a5a33"/><ellipse cx="16" cy="18" rx="6" ry="4" fill="#d9c2a0"/><circle cx="23" cy="11" r="5" fill="#9a6a3d"/><path d="M27 10l5 1.500-5 1.500z" fill="#f2b233"/><circle cx="24.500" cy="10" r="1" fill="#111"/><path d="M6 16l-6-2 5 5z" fill="#6b4526"/><path class="wg" d="M9 14q5-9 12-2q-6 4-12 2z" fill="#5a3a1e"/></g></g></svg>',
  snail:'<svg viewBox="0 0 34 24"><g class="in"><g class="bd"><path d="M3 20q0-5 6-5h14q5 0 6-5" stroke="#c9a15a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="14" cy="11" r="8.500" fill="#e0a52e" stroke="#9a6a12" stroke-width="1.5"/><circle cx="14" cy="11" r="4.500" fill="none" stroke="#9a6a12" stroke-width="1.5"/><circle cx="14" cy="11" r="1.300" fill="#9a6a12"/><path d="M29 10l2-5M27 10l-1-5" stroke="#c9a15a" stroke-width="1.5" stroke-linecap="round"/></g></g></svg>',
  rat:'<svg viewBox="0 0 37 24"><g class="in"><g class="bd"><path d="M6 15q-6 1-5-6" stroke="#c99a9a" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="16" cy="14" rx="11" ry="6.500" fill="#7a6a5c"/><path d="M24 9.500q8 0 11 6.500q-5 3-11 1z" fill="#8a7a6c"/><circle cx="24" cy="8" r="3.200" fill="#9a8a7c"/><circle cx="24" cy="8" r="1.600" fill="#e5b5b5"/><circle cx="30" cy="13" r="1.100" fill="#111"/><circle cx="35.300" cy="16" r="1.100" fill="#e58a8a"/><path d="M10 20.500h3M20 20.500h3" stroke="#5a4a3c" stroke-width="2" stroke-linecap="round"/></g></g></svg>'
};
function mkStageDom(){
  for(let i=0;i<NP;i++){
    const b=document.createElement('button');b.className='pt';b.type='button';plane.appendChild(b);ptBtns.push(b);
    b.addEventListener('click',()=>{Au.init();tapPetak(G.petak[i]);});
    b.addEventListener('focus',()=>{G.focus=i;});b.addEventListener('blur',()=>{if(G.focus===i)G.focus=-1;});
    const h=mkEl('div','hint');h.hidden=true;hintEls.push(h);
  }
  lblBk=mkEl('div','lab','Bangkenal');lblPal=mkEl('div','lab inf','Palong');lblPar=mkEl('div','lab','Parit · drain');lblDr=mkEl('div','lab','Stesen dron');
  scareEl=mkEl('div','guard',SVG_SCARE);owlEl=mkEl('div','guard',SVG_OWL);pumpEl=mkEl('div','guard',SVG_PUMP);
  gateEl=mkEl('button','gateEl',SVG_GATE);gateEl.type='button';gateEl.setAttribute('aria-label','Pintu air (sluice gate)');gateEl.setAttribute('aria-pressed','false');
  gateEl.addEventListener('click',()=>{Au.init();toggleGate();});
  droneEl=mkEl('div','droneEl',SVG_DRONE);droneTk=$('.tk',droneEl);
}
function mkPestEl(q){q.el=mkEl('div','pest '+q.type,SVG_PEST[q.type]);q.hv=-1;}
function placePlaneDom(){
  for(let i=0;i<NP;i++){const p=G.petak[i],s=ptBtns[i].style;s.left=(p.x0/L.PW*100)+'%';s.top=(p.y0/L.PH*100)+'%';s.width=((p.x1-p.x0)/L.PW*100)+'%';s.height=((p.y1-p.y0)/L.PH*100)+'%';}
}
function put(el,x,y,z,wUnits){PZ(x,y,z);el.style.left=PX.toFixed(1)+'px';el.style.top=PY.toFixed(1)+'px';if(wUnits)el.style.width=Math.max(12,wUnits*PS).toFixed(1)+'px';}
function putClamped(el,x,y,z){PZ(x,y,z);const hw=el.offsetWidth/2+3;el.style.left=clamp(PX,hw,Math.max(hw,CW-hw)).toFixed(1)+'px';el.style.top=PY.toFixed(1)+'px';}
function layoutOverlays(){
  if(!CW)return;const k=L.hill,mob=L.mobile;
  for(let i=0;i<NP;i++){const p=G.petak[i];put(hintEls[i],pcx(p),p.y0+(p.y1-p.y0)*.4,44*k);if(mob)hintEls[i].style.maxWidth=Math.max(58,(p.x1-p.x0)*PS*1.1).toFixed(0)+'px';}
  putClamped(lblBk,(L.bk0+L.bk1)/2,L.fy0+(L.fy1-L.fy0)*.62,0);
  putClamped(lblPal,(L.fx0+L.fx1)/2,L.py,L.pz1+17);
  putClamped(lblPar,L.fx0+(L.fx1-L.fx0)*.5,(L.par0+L.par1)/2,0);
  const hasDr=G.L.unlock.indexOf('dron')>=0;lblDr.hidden=!hasDr;droneEl.hidden=!G.guards.dron;
  if(hasDr)putClamped(lblDr,L.rx,L.shedY-26,58);
  put(gateEl,L.gx,L.gy,0,(mob?66:46));
  PZ(L.gx,L.gy,0);const gw=Math.max(12,(mob?66:46)*PS);gateRect.w=gw;gateRect.h=gw*1.05;gateRect.x=PX-gw/2;gateRect.y=PY-gw*.97;
  scareEl.hidden=!G.guards.scarecrow;owlEl.hidden=!G.guards.owl;pumpEl.hidden=!G.guards.pump;
  put(scareEl,L.fx0+3*L.pw,L.fy0+L.ph,0,34*k);put(owlEl,L.rx,L.owlY,0,24*k);put(pumpEl,L.bk1+(L.fx0-L.bk1)*.5,L.fy0+L.ph*.55,0,(mob?40:34));
}
function syncOverlays(){
  // pests sit on top of the padi
  for(let i=0;i<G.pests.length;i++){
    const q=G.pests[i];if(!q.el)continue;const p=q.p;
    PZ(pcx(p),pcy(p),(p.st==='ripe'?40:p.st==='grow'?8+34*p.g:4)*L.hill);
    const sz=clamp(L.pw*PS*.42,28,60);q.sx=PX;q.sy=PY;q.hw=sz/2;q.hh=sz*.45;
    if(q.hv!==Hver||Math.abs(q.ly-PY)>.6){q.hv=Hver;q.ly=PY;const s=q.el.style;s.left=PX.toFixed(1)+'px';s.top=PY.toFixed(1)+'px';s.width=sz.toFixed(0)+'px';}
  }
  // dron
  const d=G.drone;
  if(d&&G.guards.dron){
    PZ(d.x,d.y,d.z);const dz=Math.max(26,50*PS*L.hill);
    droneEl.style.width=dz.toFixed(1)+'px';droneEl.style.transform='translate('+(PX-dz/2).toFixed(1)+'px,'+(PY-dz*.6).toFixed(1)+'px) rotate('+d.lean.toFixed(3)+'rad)';
    setCls(droneEl,'fly',d.st!=='idle'&&d.st!=='fill');
    const tk=Math.round(d.tank*10)/10+d.kind;
    if(droneEl._tk!==tk){droneEl._tk=tk;const h=10*d.tank;droneTk.setAttribute('y',(30-h).toFixed(1));droneTk.setAttribute('height',h.toFixed(1));droneTk.setAttribute('fill',d.kind==='baja'?'#ffffff':'#58b2e0');}
  }
  // lorry on the road strip
  const lo=G.lorry,el=lorryEl;
  if(lo.st==='idle'){if(el._s!=='idle'){el._s='idle';el.className='';el.style.transform='translateX(10px)';}}
  else{
    const W=roadW+30,t=lo.t;let x,flip=false;
    if(t<3.4){const u=t/3.4;x=10+u*u*W;}else if(t<4.6){x=W+200;}else{const u=(t-4.6)/(LORRY_TIME-4.6);x=10+(1-u)*(2-(1-u))*W;flip=true;x=10+(1-(1-(1-u)*(1-u)))*W;}
    el._s='move';el.className='moving'+(flip?'':' loaded');el.style.transform='translateX('+x.toFixed(1)+'px)'+(flip?' scaleX(-1)':'');
  }
}
let lorryEl=null,roadW=400;

/* ---------- stage sizing ---------- */
function geomAll(){G.petak.forEach(geomPetak);placePlaneDom();if(G.drone&&G.drone.st==='idle'){G.drone.x=L.rx;G.drone.y=L.padY;}}
function resize(){
  const mobile=mq.matches;
  if(mobile!==L.mobile){setLayout(mobile);geomAll();MKEYS.forEach(id=>{const m=M[id];if(m.active){if(m.p&&m.p.work)m.p.work=null;m.active=false;}});}
  const w=stage.clientWidth;if(!w)return;
  persp.style.height=(w*L.PH/L.PW).toFixed(1)+'px';persp.style.perspective=(w*1.7).toFixed(0)+'px';
  const pr=persp.getBoundingClientRect(),tl=mks[0].getBoundingClientRect();
  const head=Math.round(w*(mobile?.09:.06));
  stage.style.height=Math.round(pr.bottom-tl.top+head+8)+'px';
  dpr=Math.min(2,window.devicePixelRatio||1);CW=w;CH=stage.clientHeight;
  const cw=Math.round(CW*dpr),ch=Math.round(CH*dpr);if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;}
  roadW=$('#road').clientWidth;
  lastQ.fill(-1);readH();mkGrads();layoutOverlays();
}

/* ---------- rendering one frame ---------- */
function render(t){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawBase(t);drawPalong(t);
  for(let i=0;i<NP;i++)drawPetakGround(G.petak[i],t);
  drawBatas();
  computeLooks();collectDyn();drawStanding(t);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawMarks(t);drawDroneFx(t);drawParticles();
}

/* ---------- HUD + panels ---------- */
const mBtn={},E={};
function hintFor(p){
  if(p.work)return'';
  if(p.st==='dead')return'w|Rosak';
  if(p.bena>0)return'w|Bena perang! Racun';
  if(p.st==='ripe'){if(p.water<=.05)return'';return p.wt===0?'i|Mengering…':'o|Keringkan';}
  if(p.st==='grow'){if(p.g<.34&&p.lv!==2&&p.wt<1)return'w|Perlu basah';if(p.g>=.34&&p.lv===0&&p.wt===0)return'w|Terlalu kering';return'';}
  if(p.st==='ploughed'){if(p.water>=.95)return'o|Sedia tanam';if(p.wt<1)return'i|Isi air';}
  return'';
}
const STN={empty:'empty',ploughed:'ploughed',grow:'growing padi',ripe:'ripe padi',stubble:'stubble',dead:'rosak (dead)'};
function buildLevelUI(){
  const Lv=G.L;
  setTxt(E.lvlName,(G.lvl+1)+' · '+Lv.name+' · '+G.D.n);
  E.goals.innerHTML=G.goals.map((g,i)=>'<span class="chip" id="gch'+i+'">'+icon(g.k)+'<span></span></span>').join('');
  G.goals.forEach((g,i)=>{g.el=$('#gch'+i);g.sp=$('span',g.el);});
  $('#bcards').innerHTML=BKEYS.map(k=>{const B=BUILDS[k];return'<div class="bcard" id="bc_'+k+'"><div class="house"><svg viewBox="0 0 64 60"><g fill="#f4f4f4"><circle class="sm" cx="48" cy="8" r="4"/><circle class="sm b" cx="48" cy="8" r="4"/><circle class="sm c" cx="48" cy="8" r="4"/></g><rect x="45" y="10" width="6" height="14" fill="#6b5a4a"/><path d="M4 28L32 8L60 28Z" fill="'+B.roof+'"/><rect x="10" y="28" width="44" height="20" fill="'+B.wall+'"/><path d="M10 34H54M10 41H54" stroke="rgba(0,0,0,.15)"/><rect x="27" y="33" width="10" height="15" fill="#5b3d24"/><rect x="14" y="32" width="8" height="8" fill="#ffe9a8" stroke="#5b3d24"/><path d="M14 48V58M30 48V58M50 48V58M37 48L33 58" stroke="#5b3d24" stroke-width="3"/></svg></div><h3>'+B.n+' <small>'+B.en+'</small></h3><div class="rec"></div><div class="act"><button class="gold" id="b_'+k+'"></button><div class="bbar"><i></i></div><span class="q"></span></div></div>';}).join('');
  BKEYS.forEach(k=>{const c=$('#bc_'+k);E['bc_'+k]=c;E['bb_'+k]=$('button',c);E['br_'+k]=$('.rec',c);E['bp_'+k]=$('.bbar i',c);E['bq_'+k]=$('.q',c);E['bb_'+k].addEventListener('click',()=>buildOrProcess(k));});
  $('#gcards').innerHTML=GKEYS.map(k=>'<div class="gcard" id="gc_'+k+'">'+icon(k)+'<div>'+GUARDS[k].n+'<small>'+GUARDS[k].en+'</small></div><button class="gold" id="g_'+k+'"></button></div>').join('');
  GKEYS.forEach(k=>{E['gc_'+k]=$('#gc_'+k);E['gb_'+k]=$('#g_'+k);E['gb_'+k].addEventListener('click',()=>buyGuard(k));});
  $('#storChips').innerHTML=IKEYS.map(k=>'<span class="sc" id="sc_'+k+'" title="'+ITEMS[k].n+' ('+ITEMS[k].en+') · '+RM(ITEMS[k].price)+'">'+icon(k)+'<span></span></span>').join('');
  IKEYS.forEach(k=>{E['sc_'+k]=$('#sc_'+k);E['scs_'+k]=$('span',E['sc_'+k]);});
  $$('.tool[data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===G.tool?'true':'false'));
  layoutOverlays();uiDirty=true;
}
let pulsed=[];
function refreshUI(){
  setTxt(E.money,RM(G.money));setTxt(E.clock,fmtT(G.t));
  const md=medalNow();
  setTxt(E.pill,md==='gold'?'Gold · '+fmtT(G.goldT-G.t)+' left':md==='silver'?'Silver · '+fmtT(G.silverT-G.t)+' left':'Bronze');
  if(E.pill._m!==md){E.pill._m=md;E.pill.className='pill p'+md;}
  for(let i=0;i<G.goals.length;i++){const g=G.goals[i],v=goalProg(g);if(!g.el)continue;
    setTxt(g.sp,g.k==='rm'?RM(Math.max(0,v))+'/'+RM(g.need):Math.min(v,g.need)+'/'+g.need+' '+(ITEMS[g.k].s||ITEMS[g.k].n));setCls(g.el,'done',v>=g.need);}
  const sc=storCount();setTxt(E.storCap,sc+'/'+CAP);setCls(E.storCap,'full',sc>=CAP);
  IKEYS.forEach(k=>{setTxt(E['scs_'+k],G.stor[k]+' '+(ITEMS[k].s||ITEMS[k].n));setCls(E['sc_'+k],'zero',!G.stor[k]);});
  BKEYS.forEach(k=>{
    const b=G.builds[k],B=BUILDS[k],un=unlocked(k),bt=E['bb_'+k];if(!bt)return;
    setCls(E['bc_'+k],'locked',!un);setCls(E['bc_'+k],'work',b.pending>0&&!b.hold);
    setTxt(bt,!un?'Locked':!b.built?'Build '+RM(B.cost):'Proses');
    setTxt(E['br_'+k],B.nin+' '+ITEMS[B.in].n+' → 1 '+ITEMS[B.out].n+' · '+B.time+'s'+(b.built?' · have '+G.stor[B.in]:''));
    const w=b.pending?(b.hold?100:b.t/B.time*100):0;if(bt._w!==(w|0)){bt._w=w|0;E['bp_'+k].style.width=w.toFixed(0)+'%';}
    setTxt(E['bq_'+k],b.hold?'Stor full':b.pending>1?'×'+b.pending:'');
  });
  GKEYS.forEach(k=>{const un=unlocked(k),own=G.guards[k],bt=E['gb_'+k];if(!bt)return;setCls(E['gc_'+k],'locked',!un);setCls(E['gc_'+k],'own',own);setTxt(bt,!un?'Locked':own?'Owned':RM(GUARDS[k].cost));});
  MKEYS.forEach(id=>{
    const m=M[id],o=mBtn[id],n=countEligible(id),C=MACH[id];
    if(o.badge._n!==n){o.badge._n=n;o.badge.hidden=!n;o.badge.textContent=n;}
    setCls(o.b,'busy',m.active);
    const tot=Math.max(m.total,m.done+n+(m.p?1:0)),pr=m.active?clamp((m.done+(m.p?m.lane/3:0))/Math.max(1,tot),0,1)*100:0;
    if(o.bar._w!==(pr|0)){o.bar._w=pr|0;o.bar.style.width=pr.toFixed(0)+'%';}
    setTxt(o.st,m.active?C.verb+' · petak '+Math.min(m.done+1,tot)+' of '+tot+'…':'');
  });
  if(E.gateB._g!==G.gate){E.gateB._g=G.gate;E.gateB.setAttribute('aria-pressed',G.gate);gateEl.setAttribute('aria-pressed',G.gate);
    const b=$('b',E.gateB);b.textContent=G.gate?'Tutup pintu air':'Buka pintu air';b.dataset.short=G.gate?'Tutup':'Buka';$('small',E.gateB).textContent=G.gate?'Close sluice gate':'Open sluice gate';}
  setTxt(lblPal,G.gate?'Palong: Penuh ∞':G.palong>.5?'Palong '+Math.round(G.palong)+'%':'Palong kosong · empty');
  const d=G.drone,own=G.guards.dron;
  ['baja','racun'].forEach(kd=>{const b=E['dr_'+kd],busy=own&&d.st!=='idle'&&d.kind===kd;if(b.disabled!==!own)b.disabled=!own;setCls(b,'busy',busy);setTxt(b._sm,busy?droneMsg():own?'RM2/petak':'buy the Dron');});
  const lo=G.lorry,left=Math.ceil(LORRY_TIME-lo.t);
  setTxt(E.lorryTxt,lo.st==='idle'?'Load the lorry':'Back in '+left+'s');setTxt(E.dockLori,lo.st==='idle'?sc+'/'+CAP:left+'s');
  // petak hints + labels for keyboard users
  for(let i=0;i<NP;i++){const p=G.petak[i],c=hintFor(p);
    if(c!==p.hintC){p.hintC=c;const h=hintEls[i];h.hidden=!c;if(c){h.textContent=c.slice(2);h.className='hint'+(c[0]==='w'?' warn':c[0]==='o'?' ok':'');}}
    const al='Petak '+(i+1)+': '+STN[p.st]+', '+LVN[p.lv];if(ptBtns[i]._a!==al){ptBtns[i]._a=al;ptBtns[i].setAttribute('aria-label',al);}
  }
  // guide
  if(G.running){computeGuide();}else{gTxt=G.won?'Level complete!':'Welcome to the sawah of Sekinchan.';gPetak=-1;gBtn='';}
  setTxt(E.guide,gTxt);G.pulse=gPetak;
  let sel=gBtn;if(sel&&L.mobile){if(sel==='#lorryBtn')sel='#dockLori';else if(sel.indexOf('#b_')===0)sel=sel+',#dockKilang';}
  if(E.guide._sel!==sel){E.guide._sel=sel;pulsed.forEach(e=>e.classList.remove('pulse'));pulsed=sel?$$(sel):[];pulsed.forEach(e=>e.classList.add('pulse'));gateEl.classList.toggle('pulseG',sel==='#gateBtn');}
}

/* ---------- input on the sawah: never trust browser hit-testing inside the tilted plane ---------- */
function petakAt(x,y){
  if(x<L.fx0||x>=L.fx1||y<L.fy0||y>=L.fy1)return-1;
  return clamp(((y-L.fy0)/L.ph)|0,0,ROWS-1)*COLS+clamp(((x-L.fx0)/L.pw)|0,0,COLS-1);
}
function tapPetak(p){if(G.tool==='tangan'&&p.pest&&!p.pest.gone){hitPest(p.pest);return;}applyTool(p);}
function stageXY(e){const r=stage.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];}
stage.addEventListener('pointerdown',e=>{
  if(e.button>0)return;Au.init();if(!G.running||G.paused)return;
  const xy=stageXY(e),sx=xy[0],sy=xy[1],pad=e.pointerType==='mouse'?4:14;
  for(let i=0;i<G.pests.length;i++){const q=G.pests[i];if(q.gone)continue;if(sx>=q.sx-q.hw-pad&&sx<=q.sx+q.hw+pad&&sy>=q.sy-q.hh*2-pad&&sy<=q.sy+pad){hitPest(q);return;}}
  if(sx>=gateRect.x-pad&&sx<=gateRect.x+gateRect.w+pad&&sy>=gateRect.y-pad&&sy<=gateRect.y+gateRect.h+pad){toggleGate();return;}
  unP(sx,sy);const i=petakAt(PX,PY);if(i>=0)tapPetak(G.petak[i]);
});
stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'){G.hover=-1;return;}const xy=stageXY(e);unP(xy[0],xy[1]);G.hover=G.running&&!G.paused?petakAt(PX,PY):-1;});
stage.addEventListener('pointerleave',()=>{G.hover=-1;});
stage.addEventListener('contextmenu',e=>e.preventDefault());

/* ---------- modals ---------- */
function show(id,on){$(id).hidden=!on;}
function buildMenu(){
  const best=store.get('best',{}),un=store.get('unlocked',1),D=DIFF[G.diff];
  $$('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.diff===G.diff?'true':'false'));
  $('#lvlGrid').innerHTML=LEVELS.map((Lv,i)=>{
    const open=i<un,m=best[i];
    const goals=Object.keys(Lv.goals).map(k=>{const n=Lv.goals[k];return k==='rm'?RM(Math.max(10,Math.round(n*D.goal/10)*10)):Math.max(2,Math.round(n*D.goal))+' '+(ITEMS[k].s||ITEMS[k].n);}).join(' + ');
    return'<button class="lv" data-lv="'+i+'"'+(open?'':' disabled')+'><span class="n">'+(i+1)+'</span><span class="t">'+Lv.name+'</span><span class="g">'+goals+'</span>'+(open?icon('medal',m?'m'+m[0]:'mn'):icon('lock'))+'</button>';
  }).join('');
  $$('.lv').forEach(b=>b.addEventListener('click',()=>{Au.init();Au.play('click');openLevel(+b.dataset.lv);}));
}
function openMenu(){G.running=false;G.paused=false;Au.quiet(true);Au.quiet(false);show('#intro',false);show('#win',false);show('#pauseM',false);show('#sheet',false);buildMenu();show('#menu',true);}
function openLevel(i){
  startLevel(i);buildLevelUI();show('#menu',false);show('#win',false);show('#pauseM',false);
  const Lv=G.L;
  $('#inNum').textContent='Level '+(i+1)+' · '+G.D.n;$('#inName').textContent=Lv.name;
  $('#inGoals').innerHTML=G.goals.map(g=>'<span class="chip">'+icon(g.k)+(g.k==='rm'?'Have '+RM(g.need):g.need+' '+ITEMS[g.k].n)+'</span>').join('');
  $('#inTip').innerHTML=Lv.tip;$('#inGold').textContent=fmtT(G.goldT);$('#inSilver').textContent=fmtT(G.silverT);$('#inMoney').textContent=RM(G.money);
  show('#intro',true);$('#inStart').focus();
}
function beginPlay(){show('#intro',false);G.running=true;G.paused=false;Au.init();Au.quiet(false);Au.play('start');uiDirty=true;}
function showWin(medal){
  Au.quiet(true);Au.quiet(false);Au.play('win');
  const names={gold:'Pingat emas · Gold medal',silver:'Pingat perak · Silver medal',bronze:'Pingat gangsa · Bronze medal'};
  $('#winMedal').className='bigMedal m'+medal;$('#winTitle').textContent='Tahniah! '+G.L.name+' complete';
  $('#winTxt').innerHTML='<b>'+names[medal]+'</b> in '+fmtT(G.t)+' on '+G.D.n+'.'+(medal!=='gold'?' Gold needs '+fmtT(G.goldT)+'.':'');
  $('#winNext').hidden=G.lvl>=LEVELS.length-1;
  const m=$('#winMedal');m.style.animation='none';void m.offsetWidth;m.style.animation='';
  setTimeout(()=>{show('#win',true);(G.lvl>=LEVELS.length-1?$('#winAgain'):$('#winNext')).focus();},700);
}
function setPause(on){
  if(!G.running)return;G.paused=on;Au.quiet(on);show('#pauseM',on);if(on)$('#paResume').focus();
}
/* lorry sheet */
let shSel={};
function openSheet(){
  if(!G.running||G.paused)return;
  if(G.lorry.st!=='idle'){toast('The lorry is away. Back in '+Math.ceil(LORRY_TIME-G.lorry.t)+'s.');return;}
  if(!storCount()){toast('The stor is empty. Harvest something first.');return;}
  shSel={};IKEYS.forEach(k=>{shSel[k]=0;});renderSheet();show('#sheet',true);$('#shBest').focus();
}
function renderSheet(){
  let n=0,val=0;IKEYS.forEach(k=>{n+=shSel[k];val+=shSel[k]*ITEMS[k].price;});
  $('#shRows').innerHTML=IKEYS.filter(k=>G.stor[k]>0).map(k=>'<div class="shRow">'+icon(k)+'<div>'+ITEMS[k].n+'<small>'+RM(ITEMS[k].price)+' each · have '+G.stor[k]+'</small></div><div class="pm"><button data-k="'+k+'" data-d="-1" aria-label="Less '+ITEMS[k].n+'"'+(shSel[k]<=0?' disabled':'')+'>−</button><b>'+shSel[k]+'</b><button data-k="'+k+'" data-d="1" aria-label="More '+ITEMS[k].n+'"'+(shSel[k]>=G.stor[k]||n>=LORRY_CAP?' disabled':'')+'>+</button></div></div>').join('');
  $('#shCount').textContent=n;$('#shVal').textContent=RM(val);
}
function loadBest(){
  let left=LORRY_CAP;IKEYS.forEach(k=>{shSel[k]=0;});
  IKEYS.slice().sort((a,b)=>ITEMS[b].price-ITEMS[a].price).forEach(k=>{const c=Math.min(left,G.stor[k]);shSel[k]=c;left-=c;});
  renderSheet();
}

/* ---------- mobile dock ---------- */
function applyDock(){
  const mob=mq.matches,dock=$('#dock');
  if(mob){
    dock.hidden=false;const d1=$('#dock1'),first=$('#dockLori'),d2=$('#dock2');
    ['#mTraktor','#mTanam','#mTuai','#gateBtn'].forEach(s=>d1.insertBefore($(s),first));
    $$('#tools > *').forEach(e=>d2.appendChild(e));
  }else{
    dock.hidden=true;const ms=$('#machines'),ts=$('#tools');
    ['#mTraktor','#mTanam','#mTuai','#gateBtn'].forEach(s=>ms.appendChild($(s)));
    $$('#dock2 > *').forEach(e=>ts.appendChild(e));
  }
  const h=mob?dock.offsetHeight:0;document.documentElement.style.setProperty('--dockh',h+'px');document.body.style.paddingBottom=h?h+'px':'';
}

/* ---------- main loop ---------- */
let lastTs=0,uiT=0,tAnim=0;
function frame(ts){
  requestAnimationFrame(frame);
  const now=ts/1000,dt=Math.min(.05,Math.max(0,now-lastTs));lastTs=now;
  if(document.hidden||!CW)return;
  if(readH())layoutOverlays();
  const act=G.running&&!G.paused;
  if(act){const reps=window.__sfSpeed||1;for(let i=0;i<reps&&G.running;i++)update(dt);}
  if(!G.paused)tAnim+=dt;
  render(tAnim);syncOverlays();
  uiT-=dt;if(uiDirty||uiT<=0){uiDirty=false;uiT=.14;refreshUI();}
}

/* ---------- boot ---------- */
function boot(){
  hydrateIcons(document);
  E.lvlName=$('#lvlName');E.goals=$('#goals');E.money=$('#money');E.clock=$('#tClock');E.pill=$('#medalPill');E.storCap=$('#storCap');E.guide=$('#guideTxt');E.gateB=$('#gateBtn');E.lorryTxt=$('#lorryTxt');E.dockLori=$('#dockLoriTxt');
  E.dr_baja=$('#drBaja');E.dr_racun=$('#drRacun');E.dr_baja._sm=$('small',E.dr_baja);E.dr_racun._sm=$('small',E.dr_racun);
  lorryEl=$('#lorry');
  MKEYS.forEach(id=>{const b=$(MACH[id].btn);mBtn[id]={b,badge:$('.badge',b),bar:$('.mbar i',b),st:$('.mst',b)};b.addEventListener('click',()=>{Au.init();startMachine(id);});});
  E.gateB.addEventListener('click',()=>{Au.init();toggleGate();});
  $$('.tool[data-tool]').forEach(b=>b.addEventListener('click',()=>{G.tool=b.dataset.tool;Au.init();Au.play('click');$$('.tool[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));}));
  $$('.tool[data-drone]').forEach(b=>b.addEventListener('click',()=>{Au.init();startDrone(b.dataset.drone);}));
  $('#lorryBtn').addEventListener('click',openSheet);$('#dockLori').addEventListener('click',openSheet);
  $('#dockKilang').addEventListener('click',()=>{$('#workshops').scrollIntoView({behavior:REDUCED?'auto':'smooth',block:'start'});});
  $('#shRows').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k,d=+b.dataset.d;let n=0;IKEYS.forEach(x=>{n+=shSel[x];});if(d>0&&(n>=LORRY_CAP||shSel[k]>=G.stor[k]))return;shSel[k]=clamp(shSel[k]+d,0,G.stor[k]);Au.play('click');renderSheet();});
  $('#shBest').addEventListener('click',()=>{loadBest();Au.play('click');});
  $('#shClose').addEventListener('click',()=>show('#sheet',false));
  $('#shSend').addEventListener('click',()=>{if(sendLorry(Object.assign({},shSel)))show('#sheet',false);});
  $('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')show('#sheet',false);});
  $$('.seg button').forEach(b=>b.addEventListener('click',()=>{G.diff=b.dataset.diff;store.set('diff',G.diff);Au.init();Au.play('click');buildMenu();}));
  $('#inStart').addEventListener('click',beginPlay);$('#inBack').addEventListener('click',openMenu);
  $('#winMenu').addEventListener('click',openMenu);$('#winAgain').addEventListener('click',()=>openLevel(G.lvl));$('#winNext').addEventListener('click',()=>openLevel(Math.min(LEVELS.length-1,G.lvl+1)));
  $('#paResume').addEventListener('click',()=>setPause(false));$('#paRestart').addEventListener('click',()=>openLevel(G.lvl));$('#paMenu').addEventListener('click',openMenu);
  $('#bPause').addEventListener('click',()=>setPause(!G.paused));
  const bs=$('#bSnd'),bm=$('#bMus');bs.setAttribute('aria-pressed',Au.sOn);bm.setAttribute('aria-pressed',Au.mOn);
  bs.addEventListener('click',()=>{Au.init();Au.setSound(!Au.sOn);bs.setAttribute('aria-pressed',Au.sOn);Au.play('click');});
  bm.addEventListener('click',()=>{Au.init();Au.setMusic(!Au.mOn);bm.setAttribute('aria-pressed',Au.mOn);});
  document.addEventListener('pointerdown',()=>Au.init(),{passive:true});
  document.addEventListener('keydown',e=>{Au.init();if((e.key==='Escape'||e.key==='p'||e.key==='P')&&G.running&&$('#sheet').hidden)setPause(!G.paused);else if(e.key==='Escape')show('#sheet',false);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(G.running&&!G.paused)setPause(true);else Au.quiet(true);}else if(!G.paused)Au.quiet(false);});
  setLayout(mq.matches);G.petak=mkPetak();mkSprites();mkStageDom();G.petak.forEach(geomPetak);placePlaneDom();
  applyDock();startLevel(0);buildLevelUI();resize();
  const onMq=()=>{applyDock();resize();};if(mq.addEventListener)mq.addEventListener('change',onMq);else mq.addListener(onMq);
  window.addEventListener('resize',resize);window.addEventListener('orientationchange',()=>setTimeout(resize,200));
  if(window.ResizeObserver)new ResizeObserver(()=>{if(Math.abs(stage.clientWidth-CW)>1)resize();}).observe(stage);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{applyDock();layoutOverlays();}).catch(()=>{});
  buildMenu();
  // small hook for automated testing
  window.__sf={G,M,L,project:(x,y,z)=>{PZ(x,y,z||0);const r=stage.getBoundingClientRect();return[PX+r.left,PY+r.top,PS];},eligible,gateRect,spawnPest,startDrone};
  requestAnimationFrame(frame);
}
boot();

})();
