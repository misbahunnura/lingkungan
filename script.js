const cv=document.getElementById('c'),cx=cv.getContext('2d'),$=id=>document.getElementById(id);
let W,H,S,dpr=Math.min(devicePixelRatio||1,2);
function size(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);S=H*.3}
addEventListener('resize',size);size();

let p,score,cleaned,fish,trash,hooks,pops,t,over,mode='net',said,best=0,combo=0,ct=0,parts=[],shake=0,sup=0,wave=1,barrel=null,sweepX=-1,audio,coins=0,up={net:0,sw:0,fil:0},flood=0,turtle=null,drop=null,mis=null,bub=[];
try{best=+localStorage.getItem('sungaiBest')||0}catch(e){}
let total=0,lastC=0;
try{total=+localStorage.getItem('sungaiTotal')||0}catch(e){}
const BD=[[0,'🌱','Pemula','Mulai peduli'],[10,'🧤','Relawan','10 sampah'],[30,'🌿','Penjaga Sungai','30 sampah'],[75,'🏅','Pahlawan Sungai','75 sampah'],[150,'🌍','Duta Lingkungan','150 sampah'],[300,'👑','Legenda Bumi','300 sampah']];
function drawBadges(){$('btot').textContent='Total diangkat: '+total+' sampah · Rekor skor: '+best;['badges','pbd'].forEach(id=>{const b=$(id);b.innerHTML='';BD.forEach(d=>{const e=document.createElement('div');e.className='bd'+(total>=d[0]?' on':'');e.innerHTML='<b>'+d[1]+'</b><strong>'+d[2]+'</strong><small>'+(total>=d[0]?'Terbuka':d[3])+'</small>';b.appendChild(e)})})}
function trackBadges(){if(cleaned<=lastC)return;const old=total;total+=cleaned-lastC;lastC=cleaned;try{localStorage.setItem('sungaiTotal',total)}catch(e){}BD.forEach(d=>{if(old<d[0]&&total>=d[0]){say(d[1]+' Lencana baru: '+d[2]+'!');beep(1200,.3);burst(W/2,S,'#ffd25e',40)}});drawBadges()}
const MOTI=['Sungai bersih dimulai dari tanganmu.','Satu sampah yang kamu pungut hari ini, satu masalah lebih kecil besok.','Aksi kecil yang dilakukan bersama-sama menjadi perubahan besar.','Sungai adalah sumber air, pangan, dan kehidupan. Jaga seperti menjaga rumah sendiri.','Jangan tunggu orang lain. Kamu bisa mulai sekarang.','Bumi tidak butuh segelintir orang yang sempurna, tapi banyak orang yang peduli.','Membuang sampah pada tempatnya itu kecil, tapi dampaknya sampai ke laut.'];
const PLEDGE=['Buang sampah pada tempatnya, hari ini','Bawa botol minum dan tas belanja sendiri','Ajak satu teman atau keluarga kerja bakti'];
const PLMSG=['Hebat! Kebiasaan kecil, dampak besar 💚','Kurangi plastik sekali pakai, sungai ikut lega 🌱','Kebaikan menular. Terima kasih sudah mengajak! 🤝'];
function mkFish(){const d=Math.random()<.5?1:-1;return{x:Math.random()*W,y:S+50+Math.random()*(H-S-90),v:(.4+Math.random()*.7)*d,ph:Math.random()*6,s:.8+Math.random()*.5,dead:0,r:Math.random()<.08}}
function init(){lastC=0;p=15;score=0;cleaned=0;trash=[];hooks=[];pops=[];t=0;over=false;said={};combo=0;ct=-999;parts=[];shake=0;sup=0;wave=1;barrel=null;sweepX=-1;coins=0;up={net:0,sw:0,fil:0};flood=0;turtle=null;drop=null;mis=null;fish=Array.from({length:10},mkFish);bub=Array.from({length:16},()=>({x:Math.random()*W,y:S+Math.random()*(H-S),r:1+Math.random()*3,v:.2+Math.random()*.5}));$('over').classList.remove('on')}
init();

const MS=[[50,'Mulai bagus! Terus jaga airnya'],[150,'Ikanmu makin sehat 🐟'],[300,'Sungai jadi jernih ✨'],[500,'Kamu penjaga sungai!']];
const CM=[[10,'♻️ 10 sampah terangkat! Sungai bernapas lebih lega'],[25,'🌱 25 sampah! Kamu sudah seperti relawan sungai'],[50,'🏅 50 sampah! Bayangkan kalau semua orang ikut peduli'],[100,'🌍 100 sampah! Pahlawan lingkungan sejati']];
function say(x){const m=$('msg');m.textContent=x;m.classList.add('on');clearTimeout(say.k);say.k=setTimeout(()=>m.classList.remove('on'),2600)}
function pop(x,y,s){pops.push({x,y,s,l:60})}
function setMode(m){mode=m;cv.className=m;$('mNet').setAttribute('aria-pressed',m==='net');$('mFish').setAttribute('aria-pressed',m==='fish')}
$('mSup').onclick=()=>superSweep();$('mNet').onclick=()=>setMode('net');$('mFish').onclick=()=>setMode('fish');
addEventListener('keydown',e=>{if(e.key==='1')setMode('net');if(e.key==='2')setMode('fish');if(e.key==='3')superSweep()});
$('ag').onclick=init;
PLEDGE.forEach((s,i)=>{const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.onchange=()=>{if(c.checked){say(PLMSG[i]);beep(880,.2)}};l.append(c,' '+s);$('pl').appendChild(l)});

cv.addEventListener('pointerdown',e=>{
  if(over||paused)return;
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
  if(drop&&Math.hypot(x-drop.x,y-drop.y)<44){p=Math.max(0,p-15);score+=10;burst(drop.x,drop.y,'#6cf',20);pop(drop.x,drop.y,'Air murni! -15 kotor');beep(900,.25);drop=null;return}
  if(mode==='net'&&turtle&&Math.hypot(x-turtle.x,y-(S+14))<34){score=Math.max(0,score-20);combo=0;shake=10;pop(turtle.x,S-10,'Jangan ganggu penyu! -20');beep(120,.2,'square');return}
  if(barrel&&Math.hypot(x-barrel.x,y-barrel.y)<48){barrel.hp--;burst(barrel.x,barrel.y,'#e5533d',10);beep(180,.1,'square');shake=8;if(barrel.hp<=0){score+=60;coins+=10;pop(barrel.x,barrel.y-30,'BOSS KALAH +60');burst(barrel.x,barrel.y,'#ffd25e',40);beep(900,.3);barrel=null;say('Limbah dihentikan! Pabrik harus olah limbah sebelum dibuang 🏭')}return}
  if(mode==='net'){
    const i=trash.findIndex(k=>Math.hypot(x-k.x,y-(S+4))<(W<620?56:38)+up.net*14);
    if(i<0){pop(x,Math.max(30,y),'meleset');combo=0;return}
    const k=trash.splice(i,1)[0];netHit(k);
  }else{
    hooks.push({x,y:Math.max(y,S+10),l:34});
    let b=-1,bd=40;fish.forEach((f,i)=>{const d=Math.hypot(x-f.x,y-f.y);if(!f.dead&&d<bd){bd=d;b=i}});
    if(b<0)return;
    const f=fish.splice(b,1)[0];
    if(f.r){score+=50;coins+=10;pop(f.x,f.y,'⭐ IKAN LANGKA +50');burst(f.x,f.y,'#ffd25e',30);beep(1000,.3)}
    else if(p<40){score+=12;pop(f.x,f.y,'ikan sehat +12');burst(f.x,f.y,'#fff',10);beep(660)}
    else if(p<70){score+=5;pop(f.x,f.y,'ikan kurang sehat +5')}
    else pop(f.x,f.y,'ikan tercemar, dibuang')
  }
});

function beep(f,d=.08,ty='sine'){try{audio=audio||new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.type=ty;o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch(e){}}
function burst(x,y,c,n=10){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*6,vy:-Math.random()*4-1,l:40,c})}
function netHit(k){combo=(t-ct<150)?combo+1:1;ct=t;const m=1+Math.floor(combo/5)*.5,pts=Math.round(5*m);cleaned++;score+=pts;coins++;if(mis&&k.e===mis.e){mis.got++;if(mis.got>=mis.n){coins+=8;score+=40;say('✅ Misi selesai! +8 koin');beep(1100,.3);mis=null}}p=Math.max(0,p-4);pop(k.x,S-10,'+'+pts);burst(k.x,S,'#fff',12);beep(480+Math.min(combo,20)*35)}
function superSweep(){if(sup>0||over||!trash.length)return;sup=1800-up.sw*420;trash.forEach(k=>{score+=5;cleaned++;p=Math.max(0,p-2);burst(k.x,S,'#7ff',10)});trash=[];sweepX=0;shake=14;say('💥 SAPU BERSIH!');beep(300,.4,'sawtooth')}
const UP=[['net','🧺','Jaring besar',[15,30,60]],['sw','💥','Sapu cepat',[20,40,80]],['fil','🧪','Penyaring air',[25,50,100]]];
UP.forEach(u=>{const b=document.createElement('button');b.className='up';b.id='up'+u[0];b.onclick=()=>{const l=up[u[0]];if(l<3&&coins>=u[3][l]){coins-=u[3][l];up[u[0]]++;beep(800,.15);say(u[1]+' '+u[2]+' naik level!');updShop()}};$('shop').appendChild(b)});
function updShop(){UP.forEach(u=>{const b=$('up'+u[0]),l=up[u[0]];b.textContent=l>=3?u[1]+' '+u[2]+' MAX':u[1]+' '+u[2]+' Lv'+l+' · '+u[3][l]+' 🪙';b.disabled=l>=3||coins<u[3][l]})}
updShop();
const mix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k));
const C0=[28,150,205],C1=[98,122,72],C2=[84,58,34];
const wc=q=>q<.5?mix(C0,C1,q*2):mix(C1,C2,(q-.5)*2);
function drawScene(q){
  const s=Math.min(1,W/900);
  const sk=cx.createLinearGradient(0,0,0,S);
  sk.addColorStop(0,`rgb(${mix([108,190,235],[120,100,80],q)})`);sk.addColorStop(1,`rgb(${mix([225,246,246],[165,140,110],q)})`);
  cx.fillStyle=sk;cx.fillRect(0,0,W,S+4);
  cx.fillStyle=`rgba(255,215,100,${1-q*.7})`;cx.beginPath();cx.arc(W*.1,S*.4,Math.min(34,W*.05),0,6.3);cx.fill();
  if(q<.5){cx.fillStyle=`rgba(255,240,170,${.14*(1-q*2)})`;for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(W*.1,S*.4);cx.lineTo(W*.1+120+i*140,S+4);cx.lineTo(W*.1+190+i*140,S+4);cx.fill()}}
  cx.fillStyle=`rgb(${mix([150,208,170],[110,95,70],q)})`;
  cx.beginPath();cx.moveTo(0,S+4);for(let x=0;x<=W;x+=12)cx.lineTo(x,S-S*.35-Math.sin(x/120)*S*.15);cx.lineTo(W,S+4);cx.fill();
  for(let i=0;i<14;i++){const x=(i*83+20)%W;if(x>W*.62&&x<W*.9)continue;
    cx.fillStyle='#6b4a2f';cx.fillRect(x-2,S-14,4,14);
    cx.fillStyle=`rgb(${mix([48,150,90],[100,78,44],Math.min(1,q*1.2))})`;
    cx.beginPath();cx.arc(x,S-26,16*(.8+(i%3)*.15),0,6.3);cx.fill()}
  const fx=W*.74,fw=120*s,fh=56*s;
  cx.fillStyle='#2b3943';cx.fillRect(fx,S-fh,fw,fh);cx.fillRect(fx+fw*.16,S-fh-38*s,14*s,38*s);cx.fillRect(fx+fw*.62,S-fh-28*s,14*s,28*s);
  cx.fillStyle='#e5533d';for(let i=0;i<4;i++)cx.fillRect(fx+10*s+i*27*s,S-fh*.7,12*s,9*s);
  for(let c=0;c<2;c++){const bx=fx+fw*(c?.68:.22),by=S-fh-(c?28:38)*s;
    for(let i=0;i<6;i++){const k=((t*.006+i/6)%1);
      cx.beginPath();cx.arc(bx+k*60*s,by-k*S*.5,(6+k*22)*s,0,6.3);
      cx.fillStyle=`rgba(85,85,88,${(1-k)*(.1+q*.6)})`;cx.fill()}}
}
function drawWater(q){
  const c=wc(q),g=cx.createLinearGradient(0,S,0,H);
  g.addColorStop(0,`rgb(${c.map(v=>Math.min(255,v*1.2|0))})`);g.addColorStop(1,`rgb(${c.map(v=>v*.45|0)})`);
  cx.fillStyle=g;cx.fillRect(0,S,W,H-S);
  cx.strokeStyle='rgba(255,255,255,.4)';cx.lineWidth=2;cx.beginPath();
  for(let x=0;x<=W;x+=8){const y=S+Math.sin(x/40+t*.04)*3;x?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke();
  if(q<.5){cx.fillStyle=`rgba(255,255,255,${.3*(1-q*2)})`;for(let i=0;i<12;i++){const x=(i*151+t*.4*(1+i%3))%W,y=H-((t*.8*(1+i%4)+i*70)%(H-S));cx.beginPath();cx.arc(x,y,2+i%3,0,6.3);cx.fill()}}
  cx.strokeStyle=`rgba(255,255,255,${.35*(1-q)})`;cx.lineWidth=1.5;bub.forEach(b=>{b.y-=b.v;if(b.y<S+6){b.y=H-4;b.x=Math.random()*W}cx.beginPath();cx.arc(b.x+Math.sin(t*.03+b.r)*3,b.y,b.r,0,6.3);cx.stroke()});
  if(q>.15){const fx=W*.74-6,pg=cx.createLinearGradient(0,S,0,S+150);pg.addColorStop(0,`rgba(110,78,36,${q})`);pg.addColorStop(1,'rgba(110,78,36,0)');
    cx.fillStyle=pg;cx.beginPath();cx.moveTo(fx,S);cx.lineTo(fx+14,S);cx.lineTo(fx-60*q-10,S+60+110*q);cx.lineTo(fx-90*q-30,S+60+110*q);cx.fill()}
}

function frame(){
  if(!over&&!paused){
    t++;
    p=Math.max(0,Math.min(100,p+.004+trash.length*.0015-up.fil*.0012));
    if(flood>0)flood--;
    if(t%900===450&&!turtle)turtle={x:-40};
    if(turtle){turtle.x+=.8;if(turtle.x>W+40){score+=15;coins+=3;pop(W-90,S-20,'Penyu selamat +15');turtle=null}}
    if(t%1300===700&&!drop)drop={x:60+Math.random()*(W-120),y:-20};
    if(drop){drop.y+=1.6;if(drop.y>H*.8)drop=null}
    if(t%1500===600&&!mis){const E=['🥤','🛍️','🍾','🥫','📦'];mis={e:E[Math.floor(Math.random()*5)],n:4,got:0,left:1800};say('📋 Misi: angkat 4 '+mis.e+' dalam 30 detik')}
    if(mis){mis.left--;if(mis.left<=0){say('Misi gagal, coba lagi nanti');mis=null}}
    if(t%3600===1800&&!flood){flood=600;say('⛈️ BANJIR SAMPAH! Sampah yang dibuang sembarangan akhirnya kembali ke kita');beep(90,.5,'sawtooth')}
    if(sup>0)sup--;
    if(t%2700===0&&!barrel){barrel={x:W*.74,y:S,hp:3};say('⚠️ BOSS: tong limbah beracun! Klik 3 kali');beep(120,.4,'sawtooth')}
    if(barrel){barrel.x-=.6;barrel.y=S+Math.sin(t*.06)*5;if(barrel.x<20){p=Math.min(100,p+25);shake=22;pop(60,S-20,'LIMBAH BOCOR! +25 kotor');beep(100,.5,'sawtooth');barrel=null}}
    const q=p/100;
    const nw=1+Math.floor(score/150);if(nw>wave){wave=nw;say('🌊 Gelombang '+wave+'! Sampah makin banyak, kamu pasti bisa');beep(700,.25)}const iv=Math.max(38,120-(wave-1)*12);
    if(t%Math.round(flood>0?iv/2:iv)===0)for(let c=0;c<(Math.random()<.25?3:1);c++)trash.push({x:-20-c*40,e:['🥤','🛍️','🍾','🥫','📦'][Math.floor(Math.random()*5)],v:.5+Math.random()*.5,ph:Math.random()*6});
    trash=trash.filter(k=>{k.x+=k.v;if(k.x>W+20){p=Math.min(100,p+4);pop(W-60,S-10,'sampah lolos!');shake=10;combo=0;beep(150,.2,'square');return false}return true});
    const target=Math.max(0,Math.round(12*(1-q)));
    const live=fish.filter(f=>!f.dead).length;
    if(t%70===0){
      if(live<target)fish.push(mkFish());
      else if(live>target){const f=fish.find(f=>!f.dead);if(f)f.dead=1}
    }
    if(p>=100){over=true;try{if(score>best){best=score;localStorage.setItem('sungaiBest',best)}}catch(e){}
      trackBadges();drawBadges();
      $('ot').textContent='Sungai tercemar parah';
      $('ov').textContent=`Peringkat: ${['Pemula Sungai','Penjaga Sungai','Pahlawan Sungai','Legenda Sungai'][score<100?0:score<300?1:score<600?2:3]}. Skormu ${score}. Rekor ${best}. Kamu mengangkat ${cleaned} sampah. Ini hanya game, tapi sungai asli bisa kita selamatkan.`;
      $('oq').textContent='“'+MOTI[Math.floor(Math.random()*MOTI.length)]+'”';
      document.querySelectorAll('#pl input').forEach(c=>c.checked=false);
      $('over').classList.add('on')}
  }
  const q=p/100;
  cx.save();if(shake>.5){cx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.9}else shake=0;
  drawScene(q);drawWater(q);
  cx.textAlign='center';cx.textBaseline='middle';
  fish=fish.filter(f=>{
    if(f.dead){f.dead++;f.y+=(S+6-f.y)*.02;if(f.dead>260)return false;
      cx.save();cx.translate(f.x,f.y);cx.rotate(Math.PI);cx.font=`${28*f.s}px serif`;cx.globalAlpha=.7;cx.fillText('🐟',0,0);cx.restore();cx.globalAlpha=1;return true}
    if(!over&&!paused){f.x+=f.v;f.y+=Math.sin(t*.04+f.ph)*.35;if(f.x<20||f.x>W-20)f.v*=-1;f.y=Math.max(S+30,Math.min(H-30,f.y))}
    cx.save();cx.translate(f.x,f.y);cx.scale(f.v>0?-1:1,1);cx.font=`${32*f.s}px serif`;
    cx.globalAlpha=1-q*.45;if(q>.55)cx.filter='grayscale(.9)';
    if(f.r){cx.shadowColor='#ffd25e';cx.shadowBlur=18}cx.fillText(f.r?'🐠':'🐟',0,0);cx.shadowBlur=0;cx.restore();cx.globalAlpha=1;cx.filter='none';return true;
  });
  cx.font='30px serif';
  trash.forEach(k=>cx.fillText(k.e,k.x,S+4+Math.sin(t*.05+k.ph)*4));
  if(turtle){cx.font='40px serif';cx.fillText('🐢',turtle.x,S+14+Math.sin(t*.05)*3)}
  if(drop){cx.font='34px serif';cx.fillText('💧',drop.x,drop.y)}
  if(barrel){cx.font='62px serif';cx.fillText('🛢️',barrel.x,barrel.y);cx.fillStyle='#e5533d';cx.fillRect(barrel.x-26,barrel.y-50,52*(barrel.hp/3),7);cx.strokeStyle='#fff';cx.lineWidth=2;cx.strokeRect(barrel.x-26,barrel.y-50,52,7)}
  cx.strokeStyle='#fff';cx.lineWidth=1.5;
  hooks=hooks.filter(h=>{h.l--;cx.beginPath();cx.moveTo(h.x,0);cx.lineTo(h.x,h.y);cx.stroke();cx.fillStyle='#fff';cx.beginPath();cx.arc(h.x,h.y,4,0,6.3);cx.fill();return h.l>0});
  cx.font='800 16px Nunito,sans-serif';
  pops=pops.filter(o=>{o.y-=.7;o.l--;cx.globalAlpha=Math.min(1,o.l/30);cx.fillStyle='#0c2f3a';cx.strokeStyle='#fff';cx.lineWidth=4;cx.strokeText(o.s,o.x,o.y);cx.fillText(o.s,o.x,o.y);cx.globalAlpha=1;return o.l>0});
  parts=parts.filter(o=>{o.x+=o.vx;o.y+=o.vy;o.vy+=.15;o.l--;cx.globalAlpha=Math.max(0,o.l/40);cx.fillStyle=o.c;cx.beginPath();cx.arc(o.x,o.y,3,0,6.3);cx.fill();cx.globalAlpha=1;return o.l>0});
  const ph=(t%5400)/5400,nt=(1-Math.cos(ph*6.283))/2;
  if(nt>.05){cx.fillStyle='rgba(4,12,40,'+nt*.55+')';cx.fillRect(0,0,W,H);
    if(nt>.35){cx.fillStyle='#fff';for(let i=0;i<30;i++){cx.globalAlpha=(nt-.35)*(.5+.5*Math.sin(t*.05+i));cx.fillRect((i*97)%W,(i*53)%(S*.8),2,2)}cx.globalAlpha=1}
    cx.fillStyle='rgba(243,240,216,'+Math.min(1,nt*1.5)+')';cx.beginPath();cx.arc(W*.9,S*.35,Math.min(26,W*.04),0,6.3);cx.fill()}
  if(flood>0){cx.fillStyle='rgba(20,30,50,.25)';cx.fillRect(0,0,W,H);cx.strokeStyle='rgba(200,230,255,.55)';cx.lineWidth=1;for(let i=0;i<70;i++){const x=(i*61+t*7)%W,y=(i*37+t*18)%H;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-4,y+14);cx.stroke()}
    if(Math.random()<.012){cx.fillStyle='rgba(255,255,255,.45)';cx.fillRect(0,0,W,H);beep(70,.3,'sawtooth');shake=6}}
  if(sweepX>=0){const g=cx.createLinearGradient(sweepX-90,0,sweepX,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(170,255,255,.65)');cx.fillStyle=g;cx.fillRect(sweepX-90,0,90,H);sweepX+=26;if(sweepX>W+90)sweepX=-1}
  cx.restore();
  if(combo>1&&t-ct<150){cx.save();cx.textAlign='left';cx.font=`800 ${W<620?22:30}px "Baloo 2",sans-serif`;cx.fillStyle='#fff';cx.strokeStyle='#0c2f3a';cx.lineWidth=5;const m=1+Math.floor(combo/5)*.5,tx='COMBO x'+combo+(m>1?'  ('+m+'x poin)':'');cx.strokeText(tx,16,44);cx.fillText(tx,16,44);cx.restore()}
  if(mis){cx.save();cx.textAlign='right';cx.font=`800 ${W<620?14:18}px Nunito,sans-serif`;cx.fillStyle='#fff';cx.strokeStyle='#0c2f3a';cx.lineWidth=4;const m2='Misi '+mis.e+' '+mis.got+'/'+mis.n+' · '+Math.ceil(mis.left/60)+' dtk',my=W<620?H-14:34;cx.strokeText(m2,W-16,my);cx.fillText(m2,W-16,my);cx.restore()}
  if(t%6===0){
    const si=p<33?0:p<66?1:2;document.querySelectorAll('#legend div').forEach((d,i)=>d.classList.toggle('on',i===si));const st=p<33?['Aman','--ok']:p<66?['Peringatan','--warn']:['Kotor','--bad'];
    document.documentElement.style.setProperty('--sc',`var(${st[1]})`);
    $('hC').textContent=st[0]+' '+Math.round(100-p)+'%';$('hb').style.setProperty('--w',(100-p)+'%');
    $('hS').textContent=score;$('hK').textContent=coins;updShop();$('hW').textContent=wave;$('mSup').textContent=sup>0?'⏳ '+Math.ceil(sup/60)+' dtk':'💥 Sapu bersih';$('mSup').disabled=sup>0;$('hF').textContent=fish.filter(f=>!f.dead).length;$('hT').textContent=cleaned;
    MS.forEach(([n,m])=>{if(score>=n&&!said[n]){said[n]=1;say(m)}});
    trackBadges();
    CM.forEach(([n,m])=>{if(cleaned>=n&&!said['c'+n]){said['c'+n]=1;say(m);burst(W/2,S,'#9ff0c4',30)}});
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

const TIPS=['Ikan sehat hanya hidup di air yang bersih dan banyak oksigen.','Sampah plastik di sungai akhirnya terbawa ke laut dan dimakan hewan laut.','Limbah pabrik yang tidak diolah bisa membuat air berbau dan berbahaya.','Memancing berlebihan membuat jumlah ikan cepat habis. Ambil secukupnya.','Gotong royong membersihkan sungai membuat air lebih jernih.'];
drawBadges();
let ti=0,mi=0;$('tip').textContent=TIPS[0];$('moti').textContent=MOTI[0];
setInterval(()=>{ti=(ti+1)%TIPS.length;$('tip').textContent=TIPS[ti]},8000);
setInterval(()=>{const e=$('moti');e.style.opacity=0;setTimeout(()=>{mi=(mi+1)%MOTI.length;e.textContent=MOTI[mi];e.style.opacity=1},500)},7000);
$('go').onclick=()=>{init();over=false;$('start').classList.remove('on');beep(600);say('Klik sampah yang mengapung untuk mengangkatnya')};
let paused=false;
function pauseGame(){if(over||paused)return;paused=true;drawBadges();
  const cur=[...BD].reverse().find(d=>total>=d[0]),nx=BD.find(d=>total<d[0]);
  $('pp').innerHTML='<span style="font-size:clamp(34px,6vw,52px);font-family:\'Baloo 2\',sans-serif;font-weight:800;display:block;line-height:1.1">Skor '+score+'</span>Rekor '+best+' · '+cleaned+' sampah diangkat di permainan ini<br><b>Lencanamu sekarang: '+cur[1]+' '+cur[2]+'</b><br>'+(nx?'Tinggal '+(nx[0]-total)+' sampah lagi menuju '+nx[1]+' '+nx[2]+'!':'Semua lencana sudah terbuka. Kamu legenda! 🎉');
  $('pause').classList.add('on')}
function resumeGame(){paused=false;$('pause').classList.remove('on')}
$('mPause').onclick=()=>paused?resumeGame():pauseGame();
$('rs').onclick=resumeGame;
$('qt').onclick=()=>{paused=false;$('pause').classList.remove('on');init();over=true;$('start').classList.add('on')};
addEventListener('keydown',e=>{if(e.key==='p'||e.key==='P'||e.key==='Escape')paused?resumeGame():pauseGame()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});
over=true;
