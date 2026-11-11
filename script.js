const cv=document.getElementById('c');let g=cv.getContext('2d');
const W=800,H=600,BX=100,BY=190,BW=600,BH=240,PINK='#ff2d75',TL=34;
let AC,master,nb,S='mode',players=[],bi=0,BO=null,bt=0,shake=0,mus=null,TXT='',tc=0,nextFn=null,hz=[],ev=[],ei=0,tb=0,turn=0,mi=0,subI=0,sub=[],spare=0,bhp=0,items=2,mode=1,atk={x:0},flash=0,bhurt=0,hapT=[],bhap=0,loseT0=0,loseK=0,loseI=0,lastDn=0,winTxt='',ms=0,fromG=0,dmgAdj=0,dmgNow=0,greenTooth=0;
const keys={};
let npOn=0,npI=0,pk=0,picks=[],fb=[],ptI=0,msgWho=-1,fbDone=0,fleeMsg=0,pw=-1;
const PCOL=['#19e3ff','#ffd23f','#7dff3d','#ff9a2e'],SPXF=[[.3],[.3,.7],[.2,.5,.8],[.15,.38,.62,.85]];
const spx=(i,n)=>BX+BW*(SPXF[Math.max(0,Math.min(3,n-1))][i]||.5);
/* ---------- settings menu ---------- */
let out,mG,sG,gOn=0,setI=0,setFrom='mode',setT0=0;
const LANGS=[['en','English'],['es','Español'],['fr','Français'],['ja','日本語'],['zh-TW','繁體中文'],['zh-CN','简体中文'],['it','Italiano'],['de','Deutsch'],['ru','Русский'],['tr','Türkçe']];
const SET=(()=>{const o={music:10,sfx:10,lang:'en'};try{const s=JSON.parse(localStorage.getItem('soulxbeat-settings'));if(s){for(const k of['music','sfx'])if(Number.isInteger(s[k])&&s[k]>=0&&s[k]<=10)o[k]=s[k];if(LANGS.some(l=>l[0]==s.lang))o.lang=s.lang}}catch(e){}return o})();
let SETSAVED={};
const saveSet=()=>{try{let st={};try{st=JSON.parse(localStorage.getItem('soulxbeat-settings'))||{}}catch(e){}for(const k in SET)if(SET[k]!==SETSAVED[k]){st[k]=SET[k];SETSAVED[k]=SET[k]}localStorage.setItem('soulxbeat-settings',JSON.stringify(st))}catch(e){}};
const applyVol=()=>{if(mG)mG.gain.value=SET.music/10;if(sG)sG.gain.value=SET.sfx/10};
/* ---------- translations: addTR({'English text':[es,fr,ja,zh-TW,zh-CN,it,de,ru,tr]}) ---------- */
const TR={},hasK=(d,k)=>Object.prototype.hasOwnProperty.call(d,k),fillT=(r,a)=>{a.forEach((v,i)=>{r=r.split('{'+i+'}').join(v)});return r};
const TPL=[[/^MERCY (\d+)%$/,'MERCY {0}%'],[/^Song: (.+) \((.+), (\d+) BPM\)$/,'Song: {0} ({1}, {2} BPM)'],[/^ONLINE  you = P(\d)$/,'ONLINE  you = P{0}'],[/^ONLINE CO-OP - you are P(\d) \((yellow|cyan|green|orange)\)$/,'ONLINE CO-OP - you are P{0} ({1})',[1]],[/^\((EASY|NORMAL|HARD)\)$/,'({0})',[0]],[/^KEYBOARD \((.+)\)$/,'KEYBOARD ({0})',[0]],[/^Keyboard \((.+)\)$/,'Keyboard ({0})',[0]]];
const AUTO=[];
function addTR(o){for(const k in o){o[k].forEach((v,i)=>{const l=LANGS[i+1][0];(TR[l]=TR[l]||{})[k]=v});if(/\{\d\}/.test(k)&&!AUTO.some(a=>a[1]==k))AUTO.push([new RegExp('^'+k.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\{(\d)\}/g,'(.+?)')+'$'),k])}}
function lx(s){s=String(s);const d=TR[SET.lang];if(!d)return s;let m;
if(hasK(d,s))return d[s];
if((m=/^(.+) x(\d+)$/.exec(s))&&hasK(d,m[1]))return d[m[1]]+' x'+m[2];
if(s.startsWith('* ')){const r=lx(s.slice(2));if(r!==s.slice(2))return'* '+r}
for(const[re,k,tl]of TPL)if(m=re.exec(s)){const a=m.slice(1);(tl||[]).forEach(i=>{a[i]=lx(a[i])});return fillT(hasK(d,k)?d[k]:k,a)}
for(const[re,k]of AUTO)if(m=re.exec(s))return fillT(hasK(d,k)?d[k]:k,m.slice(1));
if(s.includes('\n')){const p=s.split('\n'),r=p.map(lx);if(r.some((v,i)=>v!==p[i]))return r.join('\n')}
return s}
const applyLang=()=>{try{document.documentElement.lang=SET.lang}catch(e){}};applyLang();
addTR({
"* Prism's smile is flickering.":["* La sonrisa de Prism titila.","* Le sourire de Prism vacille.","* Prism の笑顔がちらついている。","* Prism 的笑容在閃爍。","* Prism 的笑容在闪烁。","* Il sorriso di Prism vacilla.","* Prisms Lächeln flackert.","* Улыбка Prism меркнет.","* Prism'in gülümsemesi titriyor."],
"* Prism's glow is fading.":["* El brillo de Prism se apaga.","* L'éclat de Prism s'estompe.","* Prism の輝きが薄れていく。","* Prism 的光芒漸漸黯淡。","* Prism 的光芒渐渐黯淡。","* Il bagliore di Prism si affievolisce.","* Prisms Glanz verblasst.","* Свечение Prism угасает.","* Prism'in parıltısı sönüyor."],
"* Prism is out of breath, but still swaying.":["* Prism está sin aliento, pero sigue meciéndose.","* Prism est à bout de souffle, mais continue de se balancer.","* Prism は息が上がっているが、まだ揺れている。","* Prism 上氣不接下氣，卻仍在搖擺。","* Prism 上气不接下气，却仍在摇摆。","* Prism è senza fiato, ma continua a dondolare.","* Prism ist außer Atem, wiegt sich aber weiter.","* Prism запыхался, но всё ещё покачивается.","* Prism nefes nefese, ama hâlâ sallanıyor."],
"* Pulsar is sputtering.":["* Pulsar chisporrotea.","* Pulsar crépite.","* Pulsar がバチバチと火花を散らしている。","* Pulsar 發出劈啪聲，運轉不穩。","* Pulsar 发出噼啪声，运转不稳。","* Pulsar scoppietta.","* Pulsar stottert.","* Pulsar фыркает и трещит.","* Pulsar cızırdıyor."],
"* Pulsar's lights are flickering.":["* Las luces de Pulsar parpadean.","* Les lumières de Pulsar clignotent.","* Pulsar の光がちらついている。","* Pulsar 的燈光在閃爍。","* Pulsar 的灯光在闪烁。","* Le luci di Pulsar sfarfallano.","* Pulsars Lichter flackern.","* Огни Pulsar мерцают.","* Pulsar'ın ışıkları titreşiyor."],
"* Pulsar's beat is starting to skip.":["* El ritmo de Pulsar empieza a fallar.","* Le rythme de Pulsar commence à sauter.","* Pulsar のビートが飛び始めた。","* Pulsar 的節拍開始跳拍。","* Pulsar 的节拍开始跳拍。","* Il ritmo di Pulsar comincia a saltare.","* Pulsars Beat fängt an auszusetzen.","* Ритм Pulsar начинает сбиваться.","* Pulsar'ın ritmi aksamaya başlıyor."],
"* MAW is wheezing, one eye half shut.":["* MAW resuella, con un ojo medio cerrado.","* MAW respire avec peine, un œil à moitié fermé.","* MAW はゼイゼイ息をし、片目が半分閉じている。","* MAW 喘著粗氣，一隻眼睛半閉著。","* MAW 喘着粗气，一只眼睛半闭着。","* MAW ansima, con un occhio socchiuso.","* MAW keucht, ein Auge halb geschlossen.","* MAW хрипит, один глаз полуприкрыт.","* MAW hırıldıyor, bir gözü yarı kapalı."],
"* MAW's teeth are chattering.":["* A MAW le castañetean los dientes.","* Les dents de MAW claquent.","* MAW の歯がカチカチ鳴っている。","* MAW 的牙齒在打顫。","* MAW 的牙齿在打颤。","* I denti di MAW battono.","* MAWs Zähne klappern.","* Зубы MAW стучат.","* MAW'ın dişleri takırdıyor."],
"* MAW is wobbling, but won't fall.":["* MAW se tambalea, pero no cae.","* MAW chancelle, mais ne tombe pas.","* MAW はふらついているが、倒れない。","* MAW 搖搖晃晃，卻沒有倒下。","* MAW 摇摇晃晃，却没有倒下。","* MAW barcolla, ma non cade.","* MAW wankt, fällt aber nicht.","* MAW шатается, но не падает.","* MAW sendeliyor ama düşmüyor."]
});
addTR({
"* You ate the Pink Pie.\n* It tastes a little... Corrupted?\n* You recovered 12 HP.":["* Te comes la Tarta Rosa.\n* Sabe un poco... ¿corrupto?\n* Recuperas 12 HP.","* Vous mangez la Tarte Rose.\n* Ça a un goût un peu... corrompu ?\n* Vous récupérez 12 HP.","* ピンクパイを食べた。\n* ちょっと……バグった味がする？\n* HPが12回復した。","* 你吃了粉紅派。\n* 嚐起來有點……壞掉了？\n* HP 恢復了 12 點。","* 你吃了粉红派。\n* 尝起来有点……坏掉了？\n* HP 恢复了 12 点。","* Mangi la Torta Rosa.\n* Ha un sapore un po'... corrotto?\n* Recuperi 12 HP.","* Du isst den Rosa Kuchen.\n* Es schmeckt ein bisschen... verdorben?\n* Du erhältst 12 HP zurück.","* Ты съел Розовый пирог.\n* На вкус чуть-чуть... испорчено?\n* Ты восстановил 12 HP.","* Pembe Turta'yı yedin.\n* Tadı biraz... bozulmuş gibi?\n* 12 HP kazandın."],
"* You ate the Pink Pie.\n* It tastes a little... Corrupted?\n* You recovered 12 HP.\n* Fallen allies get up!":["* Te comes la Tarta Rosa.\n* Sabe un poco... ¿corrupto?\n* Recuperas 12 HP.\n* ¡Los aliados caídos se levantan!","* Vous mangez la Tarte Rose.\n* Ça a un goût un peu... corrompu ?\n* Vous récupérez 12 HP.\n* Les alliés tombés se relèvent !","* ピンクパイを食べた。\n* ちょっと……バグった味がする？\n* HPが12回復した。\n* 倒れた仲間が起き上がる！","* 你吃了粉紅派。\n* 嚐起來有點……壞掉了？\n* HP 恢復了 12 點。\n* 倒下的夥伴站了起來！","* 你吃了粉红派。\n* 尝起来有点……坏掉了？\n* HP 恢复了 12 点。\n* 倒下的伙伴站了起来！","* Mangi la Torta Rosa.\n* Ha un sapore un po'... corrotto?\n* Recuperi 12 HP.\n* Gli alleati caduti si rialzano!","* Du isst den Rosa Kuchen.\n* Es schmeckt ein bisschen... verdorben?\n* Du erhältst 12 HP zurück.\n* Gefallene Verbündete stehen auf!","* Ты съел Розовый пирог.\n* На вкус чуть-чуть... испорчено?\n* Ты восстановил 12 HP.\n* Павшие союзники встают!","* Pembe Turta'yı yedin.\n* Tadı biraz... bozulmuş gibi?\n* 12 HP kazandın.\n* Düşen müttefikler ayağa kalkıyor!"],
"* You ate the Pink Pie.\n* It tastes a little... Corrupted?\n* Your HP was maxed out.":["* Te comes la Tarta Rosa.\n* Sabe un poco... ¿corrupto?\n* Tus HP están al máximo.","* Vous mangez la Tarte Rose.\n* Ça a un goût un peu... corrompu ?\n* Vos HP sont au maximum.","* ピンクパイを食べた。\n* ちょっと……バグった味がする？\n* HPが満タンになった。","* 你吃了粉紅派。\n* 嚐起來有點……壞掉了？\n* HP 已經全滿了。","* 你吃了粉红派。\n* 尝起来有点……坏掉了？\n* HP 已经全满了。","* Mangi la Torta Rosa.\n* Ha un sapore un po'... corrotto?\n* I tuoi HP sono al massimo.","* Du isst den Rosa Kuchen.\n* Es schmeckt ein bisschen... verdorben?\n* Deine HP sind voll.","* Ты съел Розовый пирог.\n* На вкус чуть-чуть... испорчено?\n* Твои HP на максимуме.","* Pembe Turta'yı yedin.\n* Tadı biraz... bozulmuş gibi?\n* HP'n tamamen doldu."],
"* You ate the Pink Pie.\n* It tastes a little... Corrupted?\n* Your HP was maxed out.\n* Fallen allies get up!":["* Te comes la Tarta Rosa.\n* Sabe un poco... ¿corrupto?\n* Tus HP están al máximo.\n* ¡Los aliados caídos se levantan!","* Vous mangez la Tarte Rose.\n* Ça a un goût un peu... corrompu ?\n* Vos HP sont au maximum.\n* Les alliés tombés se relèvent !","* ピンクパイを食べた。\n* ちょっと……バグった味がする？\n* HPが満タンになった。\n* 倒れた仲間が起き上がる！","* 你吃了粉紅派。\n* 嚐起來有點……壞掉了？\n* HP 已經全滿了。\n* 倒下的夥伴站了起來！","* 你吃了粉红派。\n* 尝起来有点……坏掉了？\n* HP 已经全满了。\n* 倒下的伙伴站了起来！","* Mangi la Torta Rosa.\n* Ha un sapore un po'... corrotto?\n* I tuoi HP sono al massimo.\n* Gli alleati caduti si rialzano!","* Du isst den Rosa Kuchen.\n* Es schmeckt ein bisschen... verdorben?\n* Deine HP sind voll.\n* Gefallene Verbündete stehen auf!","* Ты съел Розовый пирог.\n* На вкус чуть-чуть... испорчено?\n* Твои HP на максимуме.\n* Павшие союзники встают!","* Pembe Turta'yı yedin.\n* Tadı biraz... bozulmuş gibi?\n* HP'n tamamen doldu.\n* Düşen müttefikler ayağa kalkıyor!"]
});
function applyLobbyLang(){const lu=el('lobby-ui');lu.lang=SET.lang;el('lobby-title').textContent=lx('ONLINE CO-OP');el('host-btn').textContent=lx('Host a room');el('join-btn').textContent=lx('Join');el('start-btn').textContent=lx('Start');;el('back-btn').textContent=lx('Back');el('join-code').placeholder=lx('CODE')}
const FONTS={ja:'"Yu Gothic","Hiragino Kaku Gothic ProN","Meiryo","Noto Sans CJK JP"','zh-TW':'"Microsoft JhengHei","PingFang TC","Noto Sans CJK TC"','zh-CN':'"Microsoft YaHei","PingFang SC","Noto Sans CJK SC"'};
/* ---------- settings screen ---------- */
let setJ=0,warnOpen=0,warnI=0,lvOpen=0,lvI=0;
const SROWS=[['MUSIC','music','slider'],['SFX','sfx','slider'],['LANGUAGE','lang','lang'],
['','','toggles',[['SCREEN SHAKE','shake'],['REDUCE FLASHING','reduceFlash']],{x:178,p:250,lw:150,sx:158}],
['','','toggles',[['MENUS','bgMenus'],['BOSSES','bgBoss']],{x:340,p:150,lw:76,sx:88}],
['VISUAL BACKGROUNDS','bgStyle','style'],
['','','toggles',[['TOUCH CONTROLS','touch'],['VIRTUAL JOYSTICK AND BUTTONS','vjoy']],{x:150,p:255,lw:190,sx:196}],
['CONTROLLERS','','link'],
['CONTROLS','keys','link']],RY=[142,175,208,241,274,307,340,373,406],PX=100,PY=75,PW=600,PH=450,TX=380,TW=220,BKY=458;
function prevMus(){if(!AC)return;master=mG;try{[0,4,7].forEach((m,i)=>tone(mtof(64+m),T0()+i*.08,.22,'triangle',.25))}finally{master=sG}}
function setVol(k,v){v=Math.max(0,Math.min(10,v));if(v==SET[k])return;SET[k]=v;saveSet();initAudio();applyVol();if(k=='music')prevMus();else sfxDash()}
function cycleLang(d){const i=LANGS.findIndex(l=>l[0]==SET.lang);SET.lang=LANGS[(i+d+LANGS.length)%LANGS.length][0];saveSet();applyLang();AC&&sfxSel()}
function cycleBG(d){const i=Math.max(0,BGS.findIndex(b=>b.id==SET.bgStyle));SET.bgStyle=BGS[(i+d+BGS.length)%BGS.length].id;saveSet();AC&&sfxSel()}
function flipSet(k){if((k=='touch'&&SET.touch&&!SET.vjoy)||(k=='vjoy'&&SET.vjoy&&!SET.touch)){warnOpen=k=='touch'?1:2;warnI=0;AC&&sfxSel();return}SET[k]=!SET[k];saveSet();AC&&sfxSel()}
function warnPress(is){if(is(L)||is(R)){const j=is(L)?0:1;if(j!=warnI){warnI=j;AC&&sfxSel()}}else if(is(OK)){if(warnI==1){SET[warnOpen==1?'touch':'vjoy']=false;saveSet()}warnOpen=0;AC&&sfxSel()}else if(is(NO)){warnOpen=0;AC&&sfxSel()}}
function warnTap(x,y,inR){for(let j=0;j<2;j++)if(inR(W/2+(j?90:-90)-80,355,160,50)){if(warnI==j)warnPress(a=>a===OK);else{warnI=j;AC&&sfxSel()}return}}
function askLeave(){if(!net.ok){doLeave();return}lvOpen=1;lvI=0;if(S=='lobby')el('lobby-ui').style.display='none';AC&&sfxSel()}
function closeLv(){lvOpen=0;if(S=='lobby'&&net.role)el('lobby-ui').style.display='block'}
function doLeave(){if(S=='lobby'){leaveLobby();return}if(!net.role)return;{sendNet({t:net.role=='guest'?'gbye':'bye'});netDown('You left the room.')}}
function lvPress(is){if(is(L)||is(R)){const j=is(L)?0:1;if(j!=lvI){lvI=j;AC&&sfxSel()}}else if(is(OK)){const go=lvI==1;closeLv();if(go)doLeave();else AC&&sfxSel()}else if(is(NO)){closeLv();AC&&sfxSel()}}
function lvTap(x,y,inR){for(let j=0;j<2;j++)if(inR(W/2+(j?90:-90)-80,355,160,50)){if(lvI==j)lvPress(a=>a===OK);else{lvI=j;AC&&sfxSel()}return}}
function drawLv(){if(!lvOpen)return;if(!net.role||(S!='boss'&&S!='lobby')){closeLv();return}const bx=170,by=185,bw=460,bh=230,host=net.role=='host',lob=S=='lobby';g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);g.fillStyle='#000';g.fillRect(bx,by,bw,bh);g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(bx,by,bw,bh);
txt('LEAVE ROOM?',W/2,by+42,24,'#ff0','center');
(host?(lob?['Closing the room disconnects','everyone who has joined.']:['You are the host. Leaving ends','the match for everyone in the room.']):(lob?['You can rejoin with the room code','until the match starts.']:['You will not be able to rejoin','once the match has started.'])).forEach((t,i)=>txt(t,W/2,by+88+i*28,16,'#fff','center',bw-30));
[['STAY',W/2-90],['LEAVE',W/2+90]].forEach((b,j)=>{const on=lvI==j;if(on)soul(b[1]-62,by+bh-38,'#19e3ff');txt(b[0],b[1],by+bh-31,20,on?'#ff0':'#888','center',110)})}
function drawWarn(){const bx=170,by=185,bw=460,bh=230;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(PX,PY,PW,PH);g.fillStyle='#000';g.fillRect(bx,by,bw,bh);g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(bx,by,bw,bh);
txt('WARNING',W/2,by+42,24,'#ff0','center');
(warnOpen==2?['If you turn off the joystick and buttons',"while touch controls are off, you'll need a",'keyboard or controller to turn either back on.']:['If you turn off touch controls on a phone,',"you'll need a keyboard or controller",'to turn them back on.']).forEach((s,i)=>txt(s,W/2,by+88+i*28,16,'#fff','center',bw-30));
[['CANCEL',W/2-90],['CONTINUE',W/2+90]].forEach((b,j)=>{const on=warnI==j;if(on)soul(b[1]-62,by+bh-38,'#19e3ff');txt(b[0],b[1],by+bh-31,20,on?'#ff0':'#888','center',110)})}
function openSet(){setFrom=S;S='set';setI=0;setJ=0;setT0=performance.now();AC&&sfxSel()}
function closeSet(){S=setFrom;AC&&sfxSel()}
function gearPress(c,is){if(!gOn){gOn=1;AC&&sfxSel()}else if(is(OK))openSet();else if(is(Dn)||is(L)||is(R)||is(NO)){gOn=0;AC&&sfxSel()}else{gOn=0;press(c)}}
function rowAct(i,d){const r=SROWS[i],k=r[1],t=r[2];if(t=='slider')setVol(k,SET[k]+d);else if(t=='lang')cycleLang(d);else if(t=='style')cycleBG(d);else if(t=='link')(k=='keys'?openKeys:openCtl)()}
function setPress(c,is){const n=SROWS.length+1,r=setI<SROWS.length?SROWS[setI]:null;
if(warnOpen){warnPress(is);return}
if(is(U)){setI=(setI+n-1)%n;AC&&sfxSel()}
else if(is(Dn)){setI=(setI+1)%n;AC&&sfxSel()}
else if(r&&r[2]=='toggles'){if(is(L)||is(R)){const j=is(L)?0:1;if(j!=setJ){setJ=j;AC&&sfxSel()}}else if(is(OK))flipSet(r[3][setJ][1]);else if(is(NO))closeSet()}
else if(r&&(is(L)||is(R))){if(r[2]!='link')rowAct(setI,is(L)?-1:1)}
else if(r&&is(OK)){if(r[2]!='slider')rowAct(setI,1)}
else if((setI==SROWS.length&&is(OK))||is(NO))closeSet()}
function setTap(x,y){const inR=(a,b,w,h)=>x>=a&&x<=a+w&&y>=b&&y<=b+h;
if(warnOpen){warnTap(x,y,inR);return}
for(let i=0;i<SROWS.length;i++){const yy=RY[i],r=SROWS[i];
if(r[2]=='toggles'){const q=r[4];for(let j=0;j<2;j++)if(inR(q.x+j*q.p-6,yy-17,q.p-14,34)){setI=i;setJ=j;flipSet(r[3][j][1]);return}continue}
if(inR(PX+20,yy-20,PW-40,40)){if(r[2]=='link'&&setI!=i){setI=i;AC&&sfxSel();return}setI=i;if(inR(TX-14,yy-20,TW+28,40)){if(r[2]=='slider')setVol(r[1],Math.round((x-TX)/TW*10));else rowAct(i,x<TX+TW/2?-1:1)}return}}
if(inR(W/2-100,BKY-22,200,44)){if(setI==SROWS.length)closeSet();else setI=SROWS.length;return}
if(!inR(PX,PY,PW,PH))closeSet()}
function drawGear(){const on=gOn,c=on?'#ff0':'#888';g.save();g.translate(52,42);g.fillStyle=c;for(let i=0;i<8;i++){g.rotate(Math.PI/4);g.fillRect(-4,-18,8,9)}g.beginPath();g.arc(0,0,13,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.arc(0,0,5,0,7);g.fill();g.restore();if(on)soul(20,42,'#19e3ff')}
function drawSet(){g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W,H);
const k=Math.min(1,(performance.now()-setT0)/180),e=1-(1-k)*(1-k),w=PW*e,h=PH*e,x=W/2-w/2,y=PY+PH/2-h/2;
g.fillStyle='#000';g.fillRect(x,y,w,h);g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(x,y,w,h);if(k<1)return;
txt('SETTINGS',W/2,PY+42,24,'#fff','center');
const CX=TX+TW/2;
SROWS.forEach((r,i)=>{const yy=RY[i],on=setI==i,c=on?'#ff0':'#888',t=r[2];
if(on)soul(PX+36,yy,'#19e3ff');
if(t=='toggles'){const q=r[4];r[3].forEach((it,j)=>{const ox=q.x+j*q.p,cc=on&&setJ==j?'#ff0':'#888',v=SET[it[1]],sx=ox+q.sx;txt(it[0],ox,yy+5,16,cc,'left',q.lw);g.fillStyle=v?'#1f5a14':'#333';g.fillRect(sx,yy-8,36,16);g.strokeStyle=cc;g.lineWidth=2;g.strokeRect(sx,yy-8,36,16);g.fillStyle=v?'#7dff3d':'#888';g.fillRect(v?sx+20:sx+4,yy-4,12,8)});return}
txt(r[0],PX+60,yy+6,18,c,'left',TX-PX-76);
if(t=='slider'){const v=SET[r[1]];g.fillStyle='#333';g.fillRect(TX,yy-6,TW,12);g.fillStyle=c;g.fillRect(TX,yy-6,TW*v/10,12);g.fillStyle='#fff';g.fillRect(TX+TW*v/10-4,yy-13,8,26);txt(v*10+'%',TX+TW+14,yy+6,18,c)}
else if(t=='link'){txt('OPEN',CX,yy+7,20,c,'center',TW-60)}
else{const nm=t=='lang'?LANGS.find(l=>l[0]==SET.lang)[1]:(BGS.find(b=>b.id==SET.bgStyle)||BGS[0]).name;g.fillStyle=c;g.beginPath();g.moveTo(TX+4,yy);g.lineTo(TX+18,yy-9);g.lineTo(TX+18,yy+9);g.fill();g.beginPath();g.moveTo(TX+TW-4,yy);g.lineTo(TX+TW-18,yy-9);g.lineTo(TX+TW-18,yy+9);g.fill();txt(nm,CX,yy+7,20,c,'center',TW-60)}});
const on=setI==SROWS.length;if(on)soul(W/2-60,BKY,'#19e3ff');txt('BACK',W/2,BKY+7,22,on?'#ff0':'#888','center');
txt('Up / Down choose    Left / Right change    X / B back',W/2,PY+PH-16,13,'#777','center',560);if(warnOpen)drawWarn()}
/* ---------- translations, part 1: menus and interface [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] ---------- */
addTR({
"SETTINGS":["AJUSTES","PARAMÈTRES","設定","設定","设置","IMPOSTAZIONI","EINSTELLUNGEN","НАСТРОЙКИ","AYARLAR"],
"Settings":["Ajustes","Paramètres","設定","設定","设置","Impostazioni","Einstellungen","Настройки","Ayarlar"],
"MUSIC":["MÚSICA","MUSIQUE","音楽","音樂","音乐","MUSICA","MUSIK","МУЗЫКА","MÜZİK"],
"SFX":["EFECTOS","EFFETS","効果音","音效","音效","EFFETTI","EFFEKTE","ЗВУКИ","EFEKTLER"],
"LANGUAGE":["IDIOMA","LANGUE","言語","語言","语言","LINGUA","SPRACHE","ЯЗЫК","DİL"],
"BACK":["VOLVER","RETOUR","もどる","返回","返回","INDIETRO","ZURÜCK","НАЗАД","GERİ"],
"Up / Down choose    Left / Right change    X / B back":["Arriba / Abajo: elegir    Izq. / Der.: cambiar    X / B: volver","Haut / Bas : choisir    Gauche / Droite : modifier    X / B : retour","上 / 下：選択    左 / 右：変更    X / B：もどる","上 / 下：選擇    左 / 右：調整    X / B：返回","上 / 下：选择    左 / 右：调整    X / B：返回","Su / Giù: scegli    Sinistra / Destra: cambia    X / B: indietro","Hoch / Runter: wählen    Links / Rechts: ändern    X / B: zurück","Вверх / Вниз: выбор    Влево / Вправо: изменить    X / B: назад","Yukarı / Aşağı: seç    Sol / Sağ: değiştir    X / B: geri"],
"an Undertale / Just Shapes & Beats inspired fan mashup":["un crossover de fans inspirado en Undertale / Just Shapes & Beats","un mashup de fans inspiré d'Undertale / Just Shapes & Beats","Undertale / Just Shapes & Beats にインスパイアされたファンメイドのマッシュアップ","受 Undertale / Just Shapes & Beats 啟發的同人混搭作品","受 Undertale / Just Shapes & Beats 启发的同人混搭作品","un mashup amatoriale ispirato a Undertale / Just Shapes & Beats","ein Fan-Mashup, inspiriert von Undertale / Just Shapes & Beats","фанатский мэшап по мотивам Undertale / Just Shapes & Beats","Undertale / Just Shapes & Beats'ten esinlenen bir hayran projesi"],
"SELECT MODE":["SELECCIONA MODO","CHOISIR LE MODE","モード選択","選擇模式","选择模式","SCEGLI MODALITÀ","MODUS WÄHLEN","ВЫБЕРИТЕ РЕЖИМ","MOD SEÇ"],
"SOLO":["SOLO","SOLO","ソロ","單人","单人","SOLO","SOLO","СОЛО","TEK"],
"CO-OP":["COOP","COOP","協力","合作","合作","COOP","KOOP","КООП","KOOP"],
"ONLINE":["EN LÍNEA","EN LIGNE","オンライン","線上","在线","ONLINE","ONLINE","ОНЛАЙН","ÇEVRİMİÇİ"],
"Left / Right to choose, Enter / Z / A to confirm (or press 1, 2 or 3)":["Izquierda / Derecha para elegir, Enter / Z / A para confirmar (o pulsa 1, 2 o 3)","Gauche / Droite pour choisir, Entrée / Z / A pour valider (ou touches 1, 2, 3)","左 / 右で選択、Enter / Z / A で決定（または 1、2、3 キー）","左 / 右選擇，Enter / Z / A 確認（或按 1、2、3）","左 / 右选择，Enter / Z / A 确认（或按 1、2、3）","Sinistra / Destra per scegliere, Invio / Z / A per confermare (o premi 1, 2 o 3)","Links / Rechts zum Wählen, Enter / Z / A zum Bestätigen (oder 1, 2 oder 3 drücken)","Влево / Вправо — выбор, Enter / Z / A — подтвердить (или нажмите 1, 2 или 3)","Seçmek için Sol / Sağ, onaylamak için Enter / Z / A (veya 1, 2 ya da 3 tuşu)"],
"CO-OP = one screen    ONLINE = play over the internet (PeerJS)":["COOP = una pantalla    EN LÍNEA = juega por internet (PeerJS)","COOP = un seul écran    EN LIGNE = jouer par Internet (PeerJS)","協力 = 1画面    オンライン = インターネットでプレイ（PeerJS）","合作 = 同一螢幕    線上 = 透過網路遊玩（PeerJS）","合作 = 同一屏幕    在线 = 通过网络游玩（PeerJS）","COOP = stesso schermo    ONLINE = gioca via internet (PeerJS)","KOOP = ein Bildschirm    ONLINE = über das Internet spielen (PeerJS)","КООП = один экран    ОНЛАЙН = игра по интернету (PeerJS)","KOOP = tek ekran    ÇEVRİMİÇİ = internet üzerinden oyna (PeerJS)"],
"SOLO / ONLINE: WASD or ARROWS to move, SPACE or SHIFT to dash":["SOLO / EN LÍNEA: WASD o FLECHAS para moverte, ESPACIO o MAYÚS para el dash","SOLO / EN LIGNE : WASD ou FLÈCHES pour bouger, ESPACE ou MAJ pour le dash","ソロ / オンライン：WASD または矢印キーで移動、スペースまたは Shift でダッシュ","單人 / 線上：WASD 或方向鍵移動，空白鍵或 Shift 衝刺","单人 / 在线：WASD 或方向键移动，空格键或 Shift 冲刺","SOLO / ONLINE: WASD o FRECCE per muoverti, SPAZIO o MAIUSC per lo scatto","SOLO / ONLINE: WASD oder PFEILTASTEN zum Bewegen, LEERTASTE oder UMSCHALT zum Dash","СОЛО / ОНЛАЙН: WASD или СТРЕЛКИ — движение, ПРОБЕЛ или SHIFT — рывок","TEK / ÇEVRİMİÇİ: Hareket için WASD veya OK TUŞLARI, atılmak için BOŞLUK veya SHIFT"],
"CO-OP  P1: WASD + SPACE/SHIFT    P2: ARROWS + RIGHT SHIFT or /":["COOP  P1: WASD + ESPACIO/MAYÚS    P2: FLECHAS + MAYÚS DER. o /","COOP  P1 : WASD + ESPACE/MAJ    P2 : FLÈCHES + MAJ DROITE ou /","協力  P1：WASD + スペース/Shift    P2：矢印キー + 右Shift または /","合作  P1：WASD + 空白鍵/Shift    P2：方向鍵 + 右 Shift 或 /","合作  P1：WASD + 空格键/Shift    P2：方向键 + 右 Shift 或 /","COOP  P1: WASD + SPAZIO/MAIUSC    P2: FRECCE + MAIUSC DESTRO o /","KOOP  P1: WASD + LEERTASTE/UMSCHALT    P2: PFEILTASTEN + RECHTE UMSCHALT oder /","КООП  P1: WASD + ПРОБЕЛ/SHIFT    P2: СТРЕЛКИ + ПРАВЫЙ SHIFT или /","KOOP  P1: WASD + BOŞLUK/SHIFT    P2: OK TUŞLARI + SAĞ SHIFT veya /"],
"Controllers: D-pad/stick to move, A to confirm and dash. 1st pad = P1, 2nd = P2.":["Mandos: cruceta/palanca para moverte, A para confirmar y hacer dash. 1.er mando = P1, 2.º = P2.","Manettes : croix directionnelle/stick pour bouger, A pour valider et dasher. 1re manette = P1, 2e = P2.","コントローラー：十字キー/スティックで移動、Aで決定とダッシュ。1台目 = P1、2台目 = P2。","手把：十字鍵/搖桿移動，A 鍵確認與衝刺。第 1 支 = P1，第 2 支 = P2。","手柄：十字键/摇杆移动，A 键确认与冲刺。第 1 个 = P1，第 2 个 = P2。","Controller: croce direzionale/stick per muoversi, A per confermare e scattare. 1º pad = P1, 2º = P2.","Controller: Steuerkreuz/Stick zum Bewegen, A zum Bestätigen und Dashen. 1. Pad = P1, 2. = P2.","Геймпады: крестовина/стик — движение, A — подтвердить и рывок. 1-й геймпад = P1, 2-й = P2.","Kontrolcüler: Hareket için yön tuşları/analog, onay ve atılma için A. 1. kol = P1, 2. kol = P2."],
"Click or press a key once to enable sound (needed for controller-only play).":["Haz clic o pulsa una tecla una vez para activar el sonido (necesario si juegas solo con mando).","Cliquez ou appuyez sur une touche pour activer le son (nécessaire avec une manette seule).","クリックかキーを1回押すと音が有効になります（コントローラーのみの場合に必要）。","點擊或按任意鍵一次以啟用聲音（僅使用手把時需要）。","点击或按任意键一次以启用声音（仅使用手柄时需要）。","Clicca o premi un tasto una volta per attivare l'audio (necessario con solo il controller).","Einmal klicken oder eine Taste drücken, um den Ton zu aktivieren (nötig bei reiner Controller-Steuerung).","Нажмите кнопку мыши или любую клавишу, чтобы включить звук (нужно при игре только на геймпаде).","Sesi açmak için bir kez tıklayın veya bir tuşa basın (yalnızca kontrolcü kullanırken gereklidir)."],
"SELECT BOSS":["ELIGE JEFE","CHOISIR LE BOSS","ボス選択","選擇首領","选择首领","SCEGLI BOSS","BOSS WÄHLEN","ВЫБЕРИТЕ БОССА","BOSS SEÇ"],
"EASY":["FÁCIL","FACILE","かんたん","簡單","简单","FACILE","LEICHT","ЛЁГКИЙ","KOLAY"],
"NORMAL":["NORMAL","NORMAL","ふつう","普通","普通","NORMALE","NORMAL","СРЕДНИЙ","NORMAL"],
"HARD":["DIFÍCIL","DIFFICILE","むずかしい","困難","困难","DIFFICILE","SCHWER","СЛОЖНЫЙ","ZOR"],
"Left / Right to choose, Enter / Z / A to fight, X / B to go back":["Izquierda / Derecha para elegir, Enter / Z / A para luchar, X / B para volver","Gauche / Droite pour choisir, Entrée / Z / A pour combattre, X / B pour revenir","左 / 右で選択、Enter / Z / A でたたかう、X / B でもどる","左 / 右選擇，Enter / Z / A 戰鬥，X / B 返回","左 / 右选择，Enter / Z / A 战斗，X / B 返回","Sinistra / Destra per scegliere, Invio / Z / A per combattere, X / B per tornare","Links / Rechts zum Wählen, Enter / Z / A zum Kämpfen, X / B zurück","Влево / Вправо — выбор, Enter / Z / A — в бой, X / B — назад","Seçmek için Sol / Sağ, savaşmak için Enter / Z / A, geri dönmek için X / B"],
"Press confirm near the center!":["¡Pulsa confirmar cerca del centro!","Appuyez sur valider près du centre !","中央付近で決定ボタンを押そう！","在中央附近按下確認鍵！","在中央附近按下确认键！","Premi conferma vicino al centro!","Bestätigen nahe der Mitte drücken!","Нажмите «подтвердить» ближе к центру!","Onay tuşuna merkeze yakınken bas!"],
"Waiting for the host to choose a boss... X / B to leave":["Esperando a que el anfitrión elija un jefe... X / B para salir","En attente que l'hôte choisisse un boss... X / B pour quitter","ホストがボスを選ぶのを待っています…… X / B で退出","等待房主選擇首領…… X / B 離開","等待房主选择首领…… X / B 离开","In attesa che l'host scelga un boss... X / B per uscire","Warte darauf, dass der Host einen Boss wählt... X / B zum Verlassen","Ожидание, пока хост выберет босса... X / B — выйти","Ev sahibinin boss seçmesi bekleniyor... X / B ile çık"],
"GAME OVER":["FIN DEL JUEGO","PARTIE TERMINÉE","ゲームオーバー","遊戲結束","游戏结束","GAME OVER","GAME OVER","ИГРА ОКОНЧЕНА","OYUN BİTTİ"],
"Stay determined...  Enter / R / A to retry":["Mantente decidido...  Enter / R / A para reintentar","Reste déterminé...  Entrée / R / A pour réessayer","あきらめるな...  Enter / R / A でリトライ","保持決心……  Enter / R / A 重試","坚定你的决心……  Enter / R / A 重试","Resta determinato...  Invio / R / A per riprovare","Bleib entschlossen...  Enter / R / A zum Wiederholen","Не сдавайся...  Enter / R / A — повторить","Kararlı kal...  Tekrar denemek için Enter / R / A"],
"REVIVE":["REVIVIR","RÉANIMER","ふっかつ","復活","复活","RIANIMA","BELEBEN","ВОЗРОДИТЬ","CANLANDIR"],
"FIGHT":["LUCHAR","COMBAT","たたかう","戰鬥","战斗","COMBATTI","KAMPF","БОЙ","SAVAŞ"],
"ACT":["ACTUAR","ACTION","こうどう","行動","行动","AGISCI","AKTION","ДЕЙСТВИЕ","EYLEM"],
"ITEM":["OBJETO","OBJET","アイテム","物品","物品","OGGETTO","ITEM","ПРЕДМЕТ","EŞYA"],
"MERCY":["PIEDAD","PITIÉ","みのがす","仁慈","仁慈","PIETÀ","GNADE","ПОЩАДА","MERHAMET"],
"DODGE!":["¡ESQUIVA!","ESQUIVEZ !","よけろ！","閃避！","闪避！","SCHIVA!","AUSWEICHEN!","УВОРАЧИВАЙСЯ!","KAÇIN!"],
"MERCY {0}%":["PIEDAD {0}%","PITIÉ {0}%","みのがす {0}%","仁慈 {0}%","仁慈 {0}%","PIETÀ {0}%","GNADE {0}%","ПОЩАДА {0}%","MERHAMET {0}%"],
"Song: {0} ({1}, {2} BPM)":["Canción: {0} ({1}, {2} BPM)","Morceau : {0} ({1}, {2} BPM)","曲：{0}（{1}、{2} BPM）","歌曲：{0}（{1}，{2} BPM）","歌曲：{0}（{1}，{2} BPM）","Brano: {0} ({1}, {2} BPM)","Lied: {0} ({1}, {2} BPM)","Песня: {0} ({1}, {2} BPM)","Şarkı: {0} ({1}, {2} BPM)"],
"ONLINE  you = P{0}":["EN LÍNEA  tú = P{0}","EN LIGNE  vous = P{0}","オンライン  あなた = P{0}","線上  你是 P{0}","在线  你是 P{0}","ONLINE  tu = P{0}","ONLINE  du = P{0}","ОНЛАЙН  ты = P{0}","ÇEVRİMİÇİ  sen = P{0}"],
"ONLINE CO-OP - you are P{0} ({1})":["COOP EN LÍNEA - eres P{0} ({1})","COOP EN LIGNE - vous êtes P{0} ({1})","オンライン協力 - あなたは P{0}（{1}）","線上合作 - 你是 P{0}（{1}）","在线合作 - 你是 P{0}（{1}）","COOP ONLINE - sei P{0} ({1})","ONLINE-KOOP - du bist P{0} ({1})","ОНЛАЙН-КООП — ты P{0} ({1})","ÇEVRİMİÇİ KOOP - sen P{0} ({1})"],
"yellow":["amarillo","jaune","黄色","黃色","黄色","giallo","gelb","жёлтый","sarı"],
"cyan":["cian","cyan","シアン","青色","青色","ciano","cyan","голубой","camgöbeği"],
"Check":["Examinar","Examiner","しらべる","檢查","检查","Esamina","Prüfen","Осмотр","İncele"],
"Spare":["Perdonar","Épargner","みのがす","饒恕","饶恕","Risparmia","Verschonen","Пощадить","Esirge"],
"Flee":["Huir","Fuir","にげる","逃跑","逃跑","Fuggi","Fliehen","Бежать","Kaç"],
"Pink Pie":["Tarta Rosa","Tarte Rose","ピンクパイ","粉紅派","粉红派","Torta Rosa","Rosa Kuchen","Розовый пирог","Pembe Turta"],
"Dance":["Bailar","Danser","おどる","跳舞","跳舞","Balla","Tanzen","Танцевать","Dans et"],
"Hum":["Tararear","Fredonner","ハミング","哼唱","哼唱","Canticchia","Summen","Напевать","Mırıldan"],
"Clap":["Aplaudir","Applaudir","はくしゅ","拍手","拍手","Applaudi","Klatschen","Хлопать","Alkışla"],
"Vibe":["Vibrar","Vibrer","ノる","律動","律动","Vibra","Grooven","Качаться","Havaya gir"],
"Headbang":["Sacudir la cabeza","Headbanger","ヘッドバンギング","甩頭","甩头","Headbanging","Headbangen","Хэдбэнг","Headbang yap"],
"Brush Teeth":["Cepillar dientes","Brosser les dents","歯をみがく","刷牙","刷牙","Spazzola i denti","Zähne putzen","Чистить зубы","Dişleri fırçala"]
});
/* ---------- translations, part 2: battle dialogue [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] ---------- */
addTR({
"* Prism floats in, humming an upbeat tune.":["* Prism entra flotando, tarareando una melodía animada.","* Prism arrive en flottant, fredonnant un air entraînant.","* Prism がふわりと現れた。陽気なメロディをハミングしている。","* Prism 飄了進來，哼著輕快的旋律。","* Prism 飘了进来，哼着轻快的旋律。","* Prism fluttua dentro, canticchiando un motivetto allegro.","* Prism schwebt herein und summt eine fröhliche Melodie.","* Prism подплывает, напевая бодрую мелодию.","* Prism süzülerek geliyor, neşeli bir melodi mırıldanıyor."],
"* Prism bounces to the beat.":["* Prism rebota al ritmo.","* Prism rebondit en rythme.","* Prism はビートに合わせて跳ねている。","* Prism 隨著節拍彈跳。","* Prism 随着节拍弹跳。","* Prism rimbalza a ritmo.","* Prism hüpft im Takt.","* Prism подпрыгивает в такт.","* Prism ritme göre zıplıyor."],
"* Prism is smiling.":["* Prism sonríe.","* Prism sourit.","* Prism は笑顔だ。","* Prism 面帶微笑。","* Prism 面带微笑。","* Prism sorride.","* Prism lächelt.","* Prism улыбается.","* Prism gülümsüyor."],
"* Prism hums along.":["* Prism tararea.","* Prism fredonne.","* Prism も一緒にハミングしている。","* Prism 跟著哼唱。","* Prism 跟着哼唱。","* Prism canticchia.","* Prism summt mit.","* Prism подпевает.","* Prism eşlik ediyor."],
"* PRISM - 4 ATK 2 DEF\n* DIFFICULTY: EASY\n* He's just looking for someone to dance with.":["* PRISM - 4 ATQ 2 DEF\n* DIFICULTAD: FÁCIL\n* Solo busca a alguien con quien bailar.","* PRISM - 4 ATQ 2 DÉF\n* DIFFICULTÉ : FACILE\n* Il cherche juste quelqu'un avec qui danser.","* PRISM - ATK 4 DEF 2\n* 難易度：かんたん\n* いっしょに踊る相手を探しているだけ。","* PRISM - 攻擊 4 防禦 2\n* 難度：簡單\n* 他只是想找個人一起跳舞。","* PRISM - 攻击 4 防御 2\n* 难度：简单\n* 他只是想找个人一起跳舞。","* PRISM - 4 ATT 2 DIF\n* DIFFICOLTÀ: FACILE\n* Cerca solo qualcuno con cui ballare.","* PRISM - 4 ANG 2 VER\n* SCHWIERIGKEIT: LEICHT\n* Er sucht nur jemanden zum Tanzen.","* PRISM - АТК 4 ЗАЩ 2\n* СЛОЖНОСТЬ: ЛЁГКИЙ\n* Он просто ищет, с кем потанцевать.","* PRISM - SAV 4 SVN 2\n* ZORLUK: KOLAY\n* Sadece dans edecek birini arıyor."],
"* Pulsar spins up. The bass kicks in!":["* Pulsar se pone en marcha. ¡Entra el bajo!","* Pulsar s'emballe. La basse démarre !","* Pulsar が回転を上げた。ベースが鳴り響く！","* Pulsar 開始加速旋轉。低音響起了！","* Pulsar 开始加速旋转。低音响起了！","* Pulsar prende velocità. Entra il basso!","* Pulsar dreht auf. Der Bass setzt ein!","* Pulsar раскручивается. Врывается бас!","* Pulsar hızlanıyor. Bas devreye giriyor!"],
"* Pulsar throbs with the kick drum.":["* Pulsar palpita con el bombo.","* Pulsar pulse au rythme de la grosse caisse.","* Pulsar がバスドラムに合わせて脈打っている。","* Pulsar 隨著大鼓節奏脈動。","* Pulsar 随着底鼓节奏脉动。","* Pulsar pulsa con la grancassa.","* Pulsar pulsiert mit der Bassdrum.","* Pulsar пульсирует в такт бочке.","* Pulsar kick davulla birlikte atıyor."],
"* The lights are blinding.":["* Las luces ciegan.","* Les lumières sont aveuglantes.","* まぶしいライトで目がくらむ。","* 燈光刺眼得讓人睜不開眼。","* 灯光刺眼得让人睁不开眼。","* Le luci sono accecanti.","* Die Lichter blenden.","* Свет слепит глаза.","* Işıklar göz kamaştırıyor."],
"* Pulsar is charging up.":["* Pulsar se está cargando.","* Pulsar se charge.","* Pulsar がエネルギーをためている。","* Pulsar 正在蓄力。","* Pulsar 正在蓄力。","* Pulsar si sta caricando.","* Pulsar lädt sich auf.","* Pulsar накапливает энергию.","* Pulsar şarj oluyor."],
"* PULSAR - 5 ATK 3 DEF\n* DIFFICULTY: NORMAL\n* A star who really likes to rave.":["* PULSAR - 5 ATQ 3 DEF\n* DIFICULTAD: NORMAL\n* Una estrella a la que le encanta la fiesta.","* PULSAR - 5 ATQ 3 DÉF\n* DIFFICULTÉ : NORMAL\n* Une étoile qui adore faire la fête.","* PULSAR - ATK 5 DEF 3\n* 難易度：ふつう\n* レイブが大好きなスター。","* PULSAR - 攻擊 5 防禦 3\n* 難度：普通\n* 超愛狂歡派對的一顆星星。","* PULSAR - 攻击 5 防御 3\n* 难度：普通\n* 超爱狂欢派对的一颗星星。","* PULSAR - 5 ATT 3 DIF\n* DIFFICOLTÀ: NORMALE\n* Una stella che ama davvero i rave.","* PULSAR - 5 ANG 3 VER\n* SCHWIERIGKEIT: NORMAL\n* Ein Stern, der Raves wirklich liebt.","* PULSAR - АТК 5 ЗАЩ 3\n* СЛОЖНОСТЬ: СРЕДНИЙ\n* Звезда, которая обожает рейвы.","* PULSAR - SAV 5 SVN 3\n* ZORLUK: NORMAL\n* Rave'e bayılan bir yıldız."],
"* MAW rumbles. The floor shakes.":["* MAW retumba. El suelo tiembla.","* MAW gronde. Le sol tremble.","* MAW がうなりをあげる。床が揺れている。","* MAW 發出隆隆聲。地面在震動。","* MAW 发出隆隆声。地面在震动。","* MAW rimbomba. Il pavimento trema.","* MAW grollt. Der Boden bebt.","* MAW рокочет. Пол трясётся.","* MAW gürlüyor. Zemin sarsılıyor."],
"* MAW grinds its teeth.":["* MAW rechina los dientes.","* MAW grince des dents.","* MAW が歯ぎしりしている。","* MAW 咬牙切齒。","* MAW 咬牙切齿。","* MAW digrigna i denti.","* MAW knirscht mit den Zähnen.","* MAW скрежещет зубами.","* MAW dişlerini gıcırdatıyor."],
"* The bass wobbles the air.":["* El bajo hace vibrar el aire.","* La basse fait vibrer l'air.","* ベースの揺れで空気がうねっている。","* 低音讓空氣都在震盪。","* 低音让空气都在震荡。","* Il basso fa vibrare l'aria.","* Der Bass lässt die Luft wabern.","* Бас заставляет воздух дрожать.","* Bas havayı titretiyor."],
"* MAW stares with three eyes.":["* MAW te mira con tres ojos.","* MAW vous fixe de ses trois yeux.","* MAW が3つの目でじっと見つめている。","* MAW 用三隻眼睛盯著你。","* MAW 用三只眼睛盯着你。","* MAW ti fissa con tre occhi.","* MAW starrt dich mit drei Augen an.","* MAW смотрит на тебя тремя глазами.","* MAW üç gözüyle bakıyor."],
"* MAW - 6 ATK 4 DEF\n* DIFFICULTY: HARD\n* Rumble rectangle who goes hard with the bass, and teeth.":["* MAW - 6 ATQ 4 DEF\n* DIFICULTAD: DIFÍCIL\n* Un rectángulo rugiente que lo da todo con el bajo... y los dientes.","* MAW - 6 ATQ 4 DÉF\n* DIFFICULTÉ : DIFFICILE\n* Un rectangle grondant qui se déchaîne sur la basse, et les dents.","* MAW - ATK 6 DEF 4\n* 難易度：むずかしい\n* ベースと歯で全力をぶつけてくる、うなる長方形。","* MAW - 攻擊 6 防禦 4\n* 難度：困難\n* 隨著低音瘋狂輸出的轟隆長方形，還有牙齒。","* MAW - 攻击 6 防御 4\n* 难度：困难\n* 随着低音疯狂输出的轰隆长方形，还有牙齿。","* MAW - 6 ATT 4 DIF\n* DIFFICOLTÀ: DIFFICILE\n* Un rettangolo rombante che va a tutto basso, e a denti.","* MAW - 6 ANG 4 VER\n* SCHWIERIGKEIT: SCHWER\n* Ein grollendes Rechteck, das bei Bass und Zähnen alles gibt.","* MAW - АТК 6 ЗАЩ 4\n* СЛОЖНОСТЬ: СЛОЖНЫЙ\n* Громыхающий прямоугольник: выкладывается на басу и зубах.","* MAW - SAV 6 SVN 4\n* ZORLUK: ZOR\n* Basla ve dişlerle kendini ortaya koyan gürleyen bir dikdörtgen."],
"* You clap along with the beat.\n* Pulsar seems pleased with your contribution.":["* Aplaudes al ritmo.\n* Pulsar parece contento con tu aportación.","* Vous applaudissez en rythme.\n* Pulsar semble apprécier votre contribution.","* ビートに合わせて手をたたいた。\n* Pulsar は君の参加を喜んでいるようだ。","* 你跟著節拍拍手。\n* Pulsar 似乎很滿意你的參與。","* 你跟着节拍拍手。\n* Pulsar 似乎很满意你的参与。","* Applaudi a ritmo.\n* Pulsar sembra apprezzare il tuo contributo.","* Du klatschst im Takt mit.\n* Pulsar scheint von deinem Beitrag angetan.","* Ты хлопаешь в такт.\n* Pulsar, кажется, доволен твоим вкладом.","* Ritme göre alkışlıyorsun.\n* Pulsar katkından memnun görünüyor."],
"* You sway your arms and hips.\n* Pulsar seems impressed by your moves.":["* Mueves los brazos y las caderas.\n* Pulsar parece impresionado por tus pasos.","* Vous balancez les bras et les hanches.\n* Pulsar semble impressionné par vos mouvements.","* 腕と腰をゆらした。\n* Pulsar は君の動きに感心しているようだ。","* 你擺動手臂和腰身。\n* Pulsar 似乎對你的舞步印象深刻。","* 你摆动手臂和腰身。\n* Pulsar 似乎对你的舞步印象深刻。","* Muovi le braccia e i fianchi.\n* Pulsar sembra colpito dalle tue mosse.","* Du wiegst Arme und Hüften.\n* Pulsar scheint von deinen Moves beeindruckt.","* Ты покачиваешь руками и бёдрами.\n* Pulsar, кажется, впечатлён твоими движениями.","* Kollarını ve kalçanı sallıyorsun.\n* Pulsar hareketlerinden etkilenmiş görünüyor."],
"* Pulsar's ATTACK decreases!":["* ¡El ATAQUE de Pulsar disminuye!","* L'ATTAQUE de Pulsar diminue !","* Pulsar の攻撃力が下がった！","* Pulsar 的攻擊力下降了！","* Pulsar 的攻击力下降了！","* L'ATTACCO di Pulsar diminuisce!","* Pulsars ANGRIFF sinkt!","* АТАКА Pulsar снижается!","* Pulsar'ın SALDIRISI azaldı!"],
"* You and Maw headbang to the dub.\n* But the intense head movement gives you headaches...\n* Your DEFENSE decreased.":["* Tú y Maw hacéis headbang al dub.\n* Pero tanto movimiento de cabeza te da dolor de cabeza...\n* Tu DEFENSA disminuyó.","* Vous et Maw headbangez sur le dub.\n* Mais ces mouvements de tête vous donnent mal au crâne...\n* Votre DÉFENSE a baissé.","* 君と Maw はダブに合わせてヘッドバンギング。\n* でも激しく振りすぎて頭が痛くなった……\n* 君の防御力が下がった。","* 你和 Maw 隨著 Dub 甩頭。\n* 但劇烈的甩頭動作讓你頭痛了……\n* 你的防禦力下降了。","* 你和 Maw 随着 Dub 甩头。\n* 但剧烈的甩头动作让你头痛了……\n* 你的防御力下降了。","* Tu e Maw fate headbanging sul dub.\n* Ma tutto quel movimento ti fa venire mal di testa...\n* La tua DIFESA è diminuita.","* Du und Maw headbangt zum Dub.\n* Doch die heftigen Bewegungen machen Kopfschmerzen...\n* Deine VERTEIDIGUNG sinkt.","* Ты и Maw качаете головами под даб.\n* Но от резких движений начинает болеть голова...\n* Твоя ЗАЩИТА снизилась.","* Sen ve Maw dub eşliğinde kafa sallıyorsunuz.\n* Ama bu hareketler baş ağrıtıyor...\n* SAVUNMAN azaldı."],
"* You offer to clean Maw's teeth.\n* His spikes perk up and he seems to be excited!":["* Te ofreces a limpiar los dientes de Maw.\n* ¡Sus púas se enderezan y parece emocionado!","* Vous proposez de nettoyer les dents de Maw.\n* Ses pointes se dressent, il semble tout excité !","* Maw の歯をみがくと申し出た。\n* トゲがピンと立ち、Maw は大喜びのようだ！","* 你主動提議幫 Maw 刷牙。\n* 他的尖刺豎了起來，看起來很興奮！","* 你主动提议帮 Maw 刷牙。\n* 他的尖刺竖了起来，看起来很兴奋！","* Ti offri di pulire i denti di Maw.\n* Le sue punte si rizzano e sembra entusiasta!","* Du bietest an, Maws Zähne zu putzen.\n* Seine Stacheln stellen sich auf, er wirkt begeistert!","* Ты предлагаешь почистить Maw зубы.\n* Его шипы приподнимаются, он, кажется, в восторге!","* Maw'ın dişlerini temizlemeyi teklif ediyorsun.\n* Dikenleri dikleşiyor, heyecanlanmış görünüyor!"],
"* Miss...":["* Fallo...","* Raté...","* ミス……","* 未命中……","* 未命中……","* Mancato...","* Verfehlt...","* Промах...","* Iska..."],
"* {0} damage!":["* ¡{0} de daño!","* {0} dégâts !","* {0}のダメージ！","* 造成 {0} 點傷害！","* 造成 {0} 点伤害！","* {0} danni!","* {0} Schaden!","* {0} урона!","* {0} hasar!"],
"* You dance! Prism sways.":["* ¡Bailas! Prism se balancea.","* Vous dansez ! Prism se balance.","* 君は踊った！ Prism も体をゆらしている。","* 你跳起舞來！Prism 隨之搖擺。","* 你跳起舞来！Prism 随之摇摆。","* Balli! Prism ondeggia.","* Du tanzt! Prism wiegt sich.","* Ты танцуешь! Prism раскачивается.","* Dans ediyorsun! Prism sallanıyor."],
"* You hum along. Prism starts to feel a little better.":["* Tarareas con él. Prism empieza a sentirse un poco mejor.","* Vous fredonnez avec lui. Prism se sent un peu mieux.","* いっしょにハミングした。Prism は少し元気になってきた。","* 你跟著哼唱。Prism 開始覺得好一些了。","* 你跟着哼唱。Prism 开始觉得好一些了。","* Canticchi insieme. Prism inizia a sentirsi un po' meglio.","* Du summst mit. Prism fühlt sich langsam etwas besser.","* Ты подпеваешь. Prism начинает чувствовать себя лучше.","* Sen de mırıldanıyorsun. Prism biraz daha iyi hissediyor."],
"* You ate the Pink Pie.\n* HP restored. Fallen allies get up!":["* Te comes la Tarta Rosa.\n* HP restaurados. ¡Los aliados caídos se levantan!","* Vous mangez la Tarte Rose.\n* HP restaurés. Les alliés tombés se relèvent !","* ピンクパイを食べた。\n* HPが回復した。倒れた仲間が起き上がる！","* 你吃了粉紅派。\n* HP 已恢復。倒下的夥伴站了起來！","* 你吃了粉红派。\n* HP 已恢复。倒下的伙伴站了起来！","* Mangi la Torta Rosa.\n* HP ripristinati. Gli alleati caduti si rialzano!","* Du isst den Rosa Kuchen.\n* HP aufgefüllt. Gefallene Verbündete stehen auf!","* Ты съел Розовый пирог.\n* HP восстановлено. Павшие союзники встают!","* Pembe Turta'yı yedin.\n* HP yenilendi. Düşen müttefikler ayağa kalkıyor!"],
"* {0} isn't ready to stop yet.\n* (Raise MERCY with ACT.)":["* {0} aún no está listo para parar.\n* (Sube la PIEDAD con ACTUAR.)","* {0} n'est pas encore prêt à arrêter.\n* (Augmentez la PITIÉ avec ACTION.)","* {0} はまだやめる気になれない。\n* （「こうどう」で みのがす ゲージを上げよう。）","* {0} 還不想停下來。\n* （用「行動」提升仁慈值。）","* {0} 还不想停下来。\n* （用“行动”提升仁慈值。）","* {0} non è ancora pronto a fermarsi.\n* (Aumenta la PIETÀ con AGISCI.)","* {0} will noch nicht aufhören.\n* (Erhöhe die GNADE mit AKTION.)","* {0} ещё не готов остановиться.\n* (Повышай ПОЩАДУ через ДЕЙСТВИЕ.)","* {0} henüz durmaya hazır değil.\n* (EYLEM ile MERHAMET'i artır.)"],
"* No items left.":["* No quedan objetos.","* Il ne reste plus d'objets.","* もうアイテムがない。","* 沒有物品了。","* 没有物品了。","* Non hai più oggetti.","* Keine Items mehr.","* Предметов не осталось.","* Eşya kalmadı."],
"* YOU WON!\n* You spared {0}.\n\n  (Enter: back to boss select)":["* ¡HAS GANADO!\n* Has perdonado a {0}.\n\n  (Enter: volver a elegir jefe)","* VICTOIRE !\n* Vous avez épargné {0}.\n\n  (Entrée : retour au choix du boss)","* 勝利！\n* {0} を見逃した。\n\n  （Enter：ボス選択にもどる）","* 你贏了！\n* 你饒恕了 {0}。\n\n  （Enter：返回選擇首領）","* 你赢了！\n* 你饶恕了 {0}。\n\n  （Enter：返回选择首领）","* HAI VINTO!\n* Hai risparmiato {0}.\n\n  (Invio: torna alla scelta del boss)","* GEWONNEN!\n* Du hast {0} verschont.\n\n  (Enter: zurück zur Boss-Auswahl)","* ТЫ ПОБЕДИЛ!\n* Ты пощадил {0}.\n\n  (Enter: назад к выбору босса)","* KAZANDIN!\n* {0} bağışladın.\n\n  (Enter: boss seçimine dön)"],
"* YOU WON!\n* {0} fades away...\n\n  (Enter: back to boss select)":["* ¡HAS GANADO!\n* {0} se desvanece...\n\n  (Enter: volver a elegir jefe)","* VICTOIRE !\n* {0} s'évanouit...\n\n  (Entrée : retour au choix du boss)","* 勝利！\n* {0} は消えていった……\n\n  （Enter：ボス選択にもどる）","* 你贏了！\n* {0} 消失了……\n\n  （Enter：返回選擇首領）","* 你赢了！\n* {0} 消失了……\n\n  （Enter：返回选择首领）","* HAI VINTO!\n* {0} svanisce...\n\n  (Invio: torna alla scelta del boss)","* GEWONNEN!\n* {0} löst sich auf...\n\n  (Enter: zurück zur Boss-Auswahl)","* ТЫ ПОБЕДИЛ!\n* {0} исчезает...\n\n  (Enter: назад к выбору босса)","* KAZANDIN!\n* {0} yok oluyor...\n\n  (Enter: boss seçimine dön)"]
});
/* ---------- translations, part 3: online lobby [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] ---------- */
addTR({
"ONLINE CO-OP":["COOP EN LÍNEA","COOP EN LIGNE","オンライン協力","線上合作","在线合作","COOP ONLINE","ONLINE-KOOP","ОНЛАЙН-КООП","ÇEVRİMİÇİ KOOP"],
"Host a room":["Crear una sala","Créer une salle","ルームを作る","建立房間","创建房间","Crea una stanza","Raum erstellen","Создать комнату","Oda kur"],
"Join":["Unirse","Rejoindre","参加","加入","加入","Unisciti","Beitreten","Войти","Katıl"],
"Back":["Volver","Retour","もどる","返回","返回","Indietro","Zurück","Назад","Geri"],
"CODE":["CÓDIGO","CODE","コード","代碼","代码","CODICE","CODE","КОД","KOD"],
"Status: {0}":["Estado: {0}","État : {0}","状態：{0}","狀態：{0}","状态：{0}","Stato: {0}","Status: {0}","Статус: {0}","Durum: {0}"],
"Connected! Waiting for the host...":["¡Conectado! Esperando al anfitrión...","Connecté ! En attente de l'hôte...","接続しました！ホストを待っています……","已連線！等待房主……","已连接！等待房主……","Connesso! In attesa dell'host...","Verbunden! Warte auf den Host...","Подключено! Ожидание хоста...","Bağlandı! Ev sahibi bekleniyor..."],
"PeerJS failed to load. Online play needs an internet connection.":["No se pudo cargar PeerJS. El juego en línea necesita conexión a internet.","Échec du chargement de PeerJS. Le jeu en ligne nécessite une connexion Internet.","PeerJS を読み込めませんでした。オンラインプレイにはインターネット接続が必要です。","PeerJS 載入失敗。線上遊玩需要網際網路連線。","PeerJS 加载失败。在线游玩需要网络连接。","Impossibile caricare PeerJS. Il gioco online richiede una connessione a internet.","PeerJS konnte nicht geladen werden. Online-Spiel benötigt eine Internetverbindung.","Не удалось загрузить PeerJS. Для онлайн-игры нужно подключение к интернету.","PeerJS yüklenemedi. Çevrimiçi oyun için internet bağlantısı gerekir."],
"Host a room, or enter a friend's code.":["Crea una sala o introduce el código de un amigo.","Créez une salle ou saisissez le code d'un ami.","ルームを作るか、友だちのコードを入力してください。","建立房間，或輸入朋友的代碼。","创建房间，或输入朋友的代码。","Crea una stanza o inserisci il codice di un amico.","Erstelle einen Raum oder gib den Code eines Freundes ein.","Создайте комнату или введите код друга.","Bir oda kur veya bir arkadaşının kodunu gir."],
"Creating room...":["Creando sala...","Création de la salle...","ルームを作成中……","正在建立房間……","正在创建房间……","Creazione della stanza...","Raum wird erstellt...","Создание комнаты...","Oda oluşturuluyor..."],
"Room open. Waiting for player 2 to enter the code...":["Sala abierta. Esperando a que el jugador 2 introduzca el código...","Salle ouverte. En attente du joueur 2 pour saisir le code...","ルームを開きました。プレイヤー2がコードを入力するのを待っています……","房間已開啟。等待玩家 2 輸入代碼……","房间已开启。等待玩家 2 输入代码……","Stanza aperta. In attesa che il giocatore 2 inserisca il codice...","Raum geöffnet. Warte darauf, dass Spieler 2 den Code eingibt...","Комната открыта. Ждём, пока игрок 2 введёт код...","Oda açık. 2. oyuncunun kodu girmesi bekleniyor..."],
"Error: {0}":["Error: {0}","Erreur : {0}","エラー：{0}","錯誤：{0}","错误：{0}","Errore: {0}","Fehler: {0}","Ошибка: {0}","Hata: {0}"],
"Enter the 4-character room code.":["Introduce el código de sala de 4 caracteres.","Saisissez le code de salle à 4 caractères.","4文字のルームコードを入力してください。","請輸入 4 個字元的房間代碼。","请输入 4 位房间代码。","Inserisci il codice stanza di 4 caratteri.","Gib den 4-stelligen Raumcode ein.","Введите код комнаты из 4 символов.","4 karakterli oda kodunu gir."],
"Connecting...":["Conectando...","Connexion...","接続中……","連線中……","连接中……","Connessione in corso...","Verbinde...","Подключение...","Bağlanıyor..."],
"Could not reach that room. Check the code, or try another network.":["No se pudo llegar a esa sala. Revisa el código o prueba otra red.","Impossible de joindre cette salle. Vérifiez le code ou essayez un autre réseau.","そのルームに接続できませんでした。コードを確認するか、別のネットワークを試してください。","無法連到該房間。請檢查代碼，或換個網路試試。","无法连接到该房间。请检查代码，或换个网络试试。","Impossibile raggiungere quella stanza. Controlla il codice o prova un'altra rete.","Dieser Raum ist nicht erreichbar. Prüfe den Code oder versuche ein anderes Netzwerk.","Не удалось связаться с этой комнатой. Проверьте код или попробуйте другую сеть.","O odaya ulaşılamadı. Kodu kontrol et veya başka bir ağ dene."],
"Room not found. Check the code.":["Sala no encontrada. Revisa el código.","Salle introuvable. Vérifiez le code.","ルームが見つかりません。コードを確認してください。","找不到房間。請檢查代碼。","找不到房间。请检查代码。","Stanza non trovata. Controlla il codice.","Raum nicht gefunden. Prüfe den Code.","Комната не найдена. Проверьте код.","Oda bulunamadı. Kodu kontrol et."],
"Connected":["Conectado","Connecté","接続しました","已連線","已连接","Connesso","Verbunden","Подключено","Bağlandı"],
"You left the room.":["Has salido de la sala.","Vous avez quitté la salle.","ルームから退出しました。","你已離開房間。","你已离开房间。","Hai lasciato la stanza.","Du hast den Raum verlassen.","Вы покинули комнату.","Odadan ayrıldın."],
"Connection error.":["Error de conexión.","Erreur de connexion.","接続エラー。","連線錯誤。","连接错误。","Errore di connessione.","Verbindungsfehler.","Ошибка соединения.","Bağlantı hatası."],
"Connection lost.":["Conexión perdida.","Connexion perdue.","接続が切れました。","連線中斷。","连接中断。","Connessione persa.","Verbindung verloren.","Соединение потеряно.","Bağlantı koptu."],
"Your friend left the room.":["Tu amigo salió de la sala.","Votre ami a quitté la salle.","友だちがルームから退出しました。","你的朋友離開了房間。","你的朋友离开了房间。","Il tuo amico ha lasciato la stanza.","Dein Freund hat den Raum verlassen.","Ваш друг покинул комнату.","Arkadaşın odadan ayrıldı."],
"The host left the room.":["El anfitrión salió de la sala.","L'hôte a quitté la salle.","ホストがルームから退出しました。","房主離開了房間。","房主离开了房间。","L'host ha lasciato la stanza.","Der Host hat den Raum verlassen.","Хост покинул комнату.","Ev sahibi odadan ayrıldı."]
});
/* ---------- visual backgrounds (paste BELOW the translation blocks) ---------- */
Object.assign(SET,{bgMenus:true,bgBoss:true,bgStyle:'none'});
try{const s=JSON.parse(localStorage.getItem('soulxbeat-settings'));if(s){if(typeof s.bgMenus=='boolean')SET.bgMenus=s.bgMenus;if(typeof s.bgBoss=='boolean')SET.bgBoss=s.bgBoss;if(typeof s.bgStyle=='string')SET.bgStyle=s.bgStyle}}catch(e){}
/* every style: {id, name, pulse (1 = pulses to the beat), draw(o)}; later styles are added with BGS.push({...}) */
const BGS=[{id:'none',name:'None'},{id:'space',name:'Space',pulse:1,draw:bgSpace}];
let bgLast=0,bgStars=null,bgCol=null;
const hexRGB=h=>{h=h.replace('#','');if(h.length==3)h=h.replace(/./g,'$&$&');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
const bgTarget=()=>hexRGB(S=='boss'?BOSSES[bi].dc:(S=='mode'||S=='lobby'||S=='story'||!BO)?'#19e3ff':BO.dc);
function drawBG(){
const st=BGS.find(b=>b.id==SET.bgStyle);if(!st||!st.draw)return;
const menu=S=='mode'||S=='boss'||S=='lobby'||S=='story';if(!(menu?SET.bgMenus:SET.bgBoss))return;
const now=performance.now()/1000,dt=Math.min(.05,Math.max(0,now-bgLast));bgLast=now;
const tg=bgTarget();if(!bgCol)bgCol=tg.slice();else{const k=Math.min(1,dt*8);for(let i=0;i<3;i++)bgCol[i]+=(tg[i]-bgCol[i])*k}
let pu=0;if(S=='boss')pu=.55*(1-((now*100/60)%1));else if(!menu&&mus)pu=1-(((bt%1)+1)%1);
g.save();st.draw({dt,now,pu:st.pulse?pu*(SET.reduceFlash?.25:1):0,col:bgCol,dim:S=='dodge'?.7:1});g.restore();
if(S=='boss'){g.fillStyle='rgba(0,0,0,.6)';for(let i=0;i<3;i++)g.fillRect(40+i*250,190,220,290)}
}
function bgSpace(o){
if(!bgStars){bgStars=[];for(let i=0;i<90;i++)bgStars.push({x:Math.random()*W,y:Math.random()*H,v:25+Math.random()*75,s:1+Math.floor(Math.random()*3),p:Math.random()*6.28})}
const c=o.col.map(Math.round);
for(const s of bgStars){
s.y+=s.v*(1+o.pu*.5)*o.dt;if(s.y>H+20){s.y=-20;s.x=Math.random()*W}
const tw=.65+.35*Math.sin(o.now*2+s.p),a=Math.min(.8,(.14+.07*s.s)*tw*(1+o.pu*1.4)*o.dim);
g.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+a.toFixed(3)+')';
g.fillRect(s.x,s.y,s.s*(1+o.pu*.5),s.s+s.v/14)}}
/* ---------- translations: new settings labels [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] ---------- */
addTR({
"MENUS":["MENÚS","MENUS","メニュー","選單","菜单","MENU","MENÜS","МЕНЮ","MENÜLER"],
"BOSSES":["JEFES","BOSS","ボス","首領","首领","BOSS","BOSSE","БОССЫ","BOSSLAR"],
"VISUAL BACKGROUNDS":["FONDOS VISUALES","ARRIÈRE-PLANS","背景エフェクト","視覺背景","视觉背景","SFONDI VISIVI","HINTERGRÜNDE","ФОНЫ","GÖRSEL ARKA PLAN"],
"ON":["SÍ","OUI","オン","開","开","SÌ","AN","ВКЛ","AÇIK"],
"OFF":["NO","NON","オフ","關","关","NO","AUS","ВЫКЛ","KAPALI"],
"None":["Ninguno","Aucun","なし","無","无","Nessuno","Keiner","Нет","Yok"],
"Space":["Espacio","Espace","宇宙","太空","太空","Spazio","Weltraum","Космос","Uzay"]
});
/* ---------- visual backgrounds, step 2: Party, Aurora, Synthwave (paste directly ABOVE the "bosses" comment) ---------- */
const bgHsl=(h,s,l,a)=>'hsla('+Math.round(h)+','+s+'%,'+l+'%,'+Math.max(0,Math.min(1,a)).toFixed(3)+')';
const bgRgba=(r,gg,b,a)=>'rgba('+r+','+gg+','+b+','+Math.max(0,Math.min(1,a)).toFixed(3)+')';
const bgMenuDim=()=>(S=='mode'||S=='boss'||S=='lobby'||S=='story')?.75:1;
/* Party: five coloured spotlights sweeping down from the top, light pools on the floor, a soft colour haze */
function bgParty(o){
const d=o.dim*bgMenuDim();
g.globalCompositeOperation='lighter';
const n=5,hues=[190,130,52,28,265],L=H*.95,bw=58+34*o.pu;
for(let i=0;i<n;i++){
const hue=hues[i]+22*Math.sin(o.now*.35+i*1.7),x0=(i+.5)*W/n,x1=x0+Math.tan(Math.sin(o.now*.55+i*1.3)*.42)*L;
const gr=g.createLinearGradient(x0,0,x1,L);gr.addColorStop(0,bgHsl(hue,100,65,(.30+.22*o.pu)*d));gr.addColorStop(1,bgHsl(hue,100,60,0));
g.fillStyle=gr;g.beginPath();g.moveTo(x0-6,-10);g.lineTo(x0+6,-10);g.lineTo(x1+bw,L);g.lineTo(x1-bw,L);g.closePath();g.fill();
g.fillStyle=bgHsl(hue,100,62,(.16+.2*o.pu)*d);g.beginPath();g.ellipse(x1,H-24,54+bw*.5,13,0,0,Math.PI*2);g.fill()}
const hz=200+60*Math.sin(o.now*.2),gh=g.createLinearGradient(0,H,0,H-230);gh.addColorStop(0,bgHsl(hz,90,55,(.12+.14*o.pu)*d));gh.addColorStop(1,bgHsl(hz,90,55,0));
g.fillStyle=gh;g.fillRect(0,H-230,W,230)}
/* Aurora: three slow ribbons of northern light, brighter and taller on the beat */
function bgAurora(o){
const d=o.dim*bgMenuDim();
g.globalCompositeOperation='lighter';
const cfg=[[140,150,.9],[178,115,.7],[265,80,.55]];
cfg.forEach(([hue,by,st],i)=>{
const ph=i*2.1,hh=(130+55*Math.sin(o.now*.21+ph))*(1+o.pu*.28),top=x=>by+38*Math.sin(x*.008+o.now*.4+ph)+22*Math.sin(x*.017-o.now*.27+ph*2);
g.beginPath();
for(let x=0;x<=W;x+=20){const y=top(x);if(x==0)g.moveTo(x,y);else g.lineTo(x,y)}
for(let x=W;x>=0;x-=20)g.lineTo(x,top(x)+hh*(.6+.4*Math.sin(x*.011+o.now*.3+ph)));
g.closePath();
const gr=g.createLinearGradient(0,by-60,0,by+hh+60);gr.addColorStop(0,bgHsl(hue,90,60,0));gr.addColorStop(.25,bgHsl(hue,90,58,(.30+.25*o.pu)*st*d));gr.addColorStop(1,bgHsl(hue,90,55,0));
g.fillStyle=gr;g.fill()})}
/* Synthwave: striped neon sun over a scrolling perspective grid */
function bgSynth(o){
const hz=Math.round(H*.58),cx=W/2,a=o.dim*bgMenuDim(),p=o.pu;
let gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,bgRgba(20,0,60,.45*a));gr.addColorStop(1,bgRgba(110,30,140,(.34+.12*p)*a));g.fillStyle=gr;g.fillRect(0,0,W,hz);
const R=105*(1+p*.05),sy=hz-70;
g.save();g.beginPath();g.arc(cx,sy,R,0,Math.PI*2);g.clip();
gr=g.createLinearGradient(0,sy-R,0,sy+R);gr.addColorStop(0,bgRgba(255,225,80,(.46+.2*p)*a));gr.addColorStop(.55,bgRgba(255,130,40,(.42+.2*p)*a));gr.addColorStop(1,bgRgba(150,40,190,(.38+.2*p)*a));
g.fillStyle=gr;g.fillRect(cx-R,sy-R,2*R,2*R);
g.fillStyle='#000';for(let k=0;k<6;k++)g.fillRect(cx-R,sy+R*(.12+k*.15),2*R,3+k*2.6);
g.restore();
gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,bgRgba(60,0,100,.3*a));gr.addColorStop(1,bgRgba(60,0,100,0));g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);
g.fillStyle=bgRgba(90,220,255,(.5+.3*p)*a);g.fillRect(0,hz,W,2+p*2);
g.lineWidth=1.5;
for(let k=0;k<12;k++){const f=((k+o.now*.5)%12)/12;g.strokeStyle=bgRgba(90,220,255,(.1+.28*f+.3*p)*a);const y=hz+(H-hz)*f*f;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
g.strokeStyle=bgRgba(90,220,255,(.2+.25*p)*a);
for(let i=-9;i<=9;i++){g.beginPath();g.moveTo(cx,hz);g.lineTo(cx+i*95,H);g.stroke()}}
BGS.splice(1,0,{id:'party',name:'Party',pulse:1,draw:bgParty});
BGS.push({id:'aurora',name:'Aurora',pulse:1,draw:bgAurora},{id:'synth',name:'Synthwave',pulse:1,draw:bgSynth});
/* ---------- translations: new style names [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] ---------- */
addTR({
"Party":["Fiesta","Fête","パーティー","派對","派对","Festa","Party","Вечеринка","Parti"],
"Aurora":["Aurora","Aurore","オーロラ","極光","极光","Aurora","Polarlicht","Аврора","Aurora"],
"Synthwave":["Synthwave","Synthwave","シンセウェイブ","合成器浪潮","合成器浪潮","Synthwave","Synthwave","Синтвейв","Synthwave"]
});
/* ---------- visual backgrounds, step 3: the four seasons (paste directly ABOVE the "bosses" comment, below step 2) ---------- */
/* Seasons are a calm drift: they never pulse to the beat. */
const bgPart={};
function bgFlow(id,n,make,o,paint){
let a=bgPart[id];if(!a){a=bgPart[id]=[];for(let i=0;i<n;i++){const p=make();p.x=Math.random()*W;p.y=Math.random()*H;a.push(p)}}
const d=o.dim*bgMenuDim();
for(const p of a){p.y+=p.v*o.dt;if(p.v>0&&p.y>H+16){p.y=-16;p.x=Math.random()*W}else if(p.v<0&&p.y<-16){p.y=H+16;p.x=Math.random()*W}paint(p,d,p.x+p.amp*Math.sin(o.now*p.f+p.ph))}}
function bgSpring(o){
const d=o.dim*bgMenuDim(),gr=g.createLinearGradient(0,H,0,H-200);gr.addColorStop(0,bgRgba(140,230,130,.1*d));gr.addColorStop(1,bgRgba(140,230,130,0));g.fillStyle=gr;g.fillRect(0,H-200,W,200);
bgFlow('spring',46,()=>({v:26+Math.random()*34,amp:14+Math.random()*26,f:.5+Math.random()*.7,ph:Math.random()*6.28,s:3.5+Math.random()*3.5,r:Math.random()*6.28,rs:(Math.random()-.5)*1.6}),o,(p,dd,x)=>{p.r+=p.rs*o.dt;g.fillStyle=bgRgba(255,238,244,(.22+.18*p.s/7)*dd);g.beginPath();g.ellipse(x,p.y,p.s,p.s*.55,p.r,0,Math.PI*2);g.fill()})}
function bgSummer(o){
const d=o.dim*bgMenuDim();
g.globalCompositeOperation='lighter';
for(let i=0;i<4;i++){const a=.55+i*.17+.05*Math.sin(o.now*.25+i*1.9),L=H*1.25,x1=-60+Math.cos(a)*L,y1=-60+Math.sin(a)*L,w=34+i*10,nx=-Math.sin(a)*w,ny=Math.cos(a)*w;
const gr=g.createLinearGradient(-60,-60,x1,y1);gr.addColorStop(0,bgRgba(255,214,110,(.14-.02*i)*d));gr.addColorStop(1,bgRgba(255,214,110,0));
g.fillStyle=gr;g.beginPath();g.moveTo(-60-nx*.15,-60-ny*.15);g.lineTo(-60+nx*.15,-60+ny*.15);g.lineTo(x1+nx,y1+ny);g.lineTo(x1-nx,y1-ny);g.closePath();g.fill()}
g.globalCompositeOperation='source-over';
bgFlow('summer',40,()=>({v:-(8+Math.random()*16),amp:8+Math.random()*14,f:.4+Math.random()*.6,ph:Math.random()*6.28,s:1+Math.random()*1.8}),o,(p,dd,x)=>{const tw=.55+.45*Math.sin(o.now*1.6+p.ph);g.fillStyle=bgRgba(255,226,130,.45*tw*dd);g.beginPath();g.arc(x,p.y,p.s,0,Math.PI*2);g.fill()})}
function bgAutumn(o){
const pal=[[224,112,30],[196,60,30],[230,170,40],[150,80,30]];
bgFlow('autumn',34,()=>({v:28+Math.random()*40,amp:28+Math.random()*34,f:.45+Math.random()*.6,ph:Math.random()*6.28,s:5+Math.random()*5,r:Math.random()*6.28,rs:(Math.random()-.5)*2.2,c:pal[Math.floor(Math.random()*pal.length)]}),o,(p,dd,x)=>{p.r+=p.rs*o.dt;g.fillStyle=bgRgba(p.c[0],p.c[1],p.c[2],(.3+.12*p.s/10)*dd);g.beginPath();g.ellipse(x,p.y,p.s,p.s*.5,p.r+Math.sin(o.now*p.f+p.ph)*.6,0,Math.PI*2);g.fill()})}
function bgWinter(o){
const d=o.dim*bgMenuDim(),gr=g.createLinearGradient(0,H,0,H-220);gr.addColorStop(0,bgRgba(120,170,255,.1*d));gr.addColorStop(1,bgRgba(120,170,255,0));g.fillStyle=gr;g.fillRect(0,H-220,W,220);
bgFlow('winter',110,()=>{const s=1+Math.random()*2.2;return{v:16+s*16+Math.random()*14,amp:6+Math.random()*16,f:.4+Math.random()*.8,ph:Math.random()*6.28,s}},o,(p,dd,x)=>{g.fillStyle=bgRgba(225,240,255,(.22+.14*p.s/3.2)*dd);g.beginPath();g.arc(x,p.y,p.s,0,Math.PI*2);g.fill()})}
BGS.push({id:'spring',name:'Spring',pulse:0,draw:bgSpring},{id:'summer',name:'Summer',pulse:0,draw:bgSummer},{id:'autumn',name:'Autumn',pulse:0,draw:bgAutumn},{id:'winter',name:'Winter',pulse:0,draw:bgWinter});
/* ---------- translations: season names [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] ---------- */
addTR({
"Spring":["Primavera","Printemps","春","春天","春天","Primavera","Frühling","Весна","İlkbahar"],
"Summer":["Verano","Été","夏","夏天","夏天","Estate","Sommer","Лето","Yaz"],
"Autumn":["Otoño","Automne","秋","秋天","秋天","Autunno","Herbst","Осень","Sonbahar"],
"Winter":["Invierno","Hiver","冬","冬天","冬天","Inverno","Winter","Зима","Kış"]
});
/* ---------- step 4: screen shake + reduce flashing (paste directly ABOVE the "bosses" comment) ---------- */
Object.assign(SET,{touch:true,vjoy:false});
try{const s=JSON.parse(localStorage.getItem('soulxbeat-settings'));if(s){if(typeof s.touch=='boolean')SET.touch=s.touch;if(typeof s.vjoy=='boolean')SET.vjoy=s.vjoy}}catch(e){}
Object.assign(SET,{shake:true,reduceFlash:false});
try{const s=JSON.parse(localStorage.getItem('soulxbeat-settings'));if(s){if(typeof s.shake=='boolean')SET.shake=s.shake;if(typeof s.reduceFlash=='boolean')SET.reduceFlash=s.reduceFlash}}catch(e){}
SETSAVED={...SET};
/* attack warning glow: blinks normally, a steady build-up when Reduce Flashing is on */
const warnA=(age,h)=>SET.reduceFlash?.14+.3*Math.max(0,Math.min(1,age/h.warn)):.12+.25*Math.abs(Math.sin(age*Math.PI*2));
/* ---------- translations: new settings labels [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] ---------- */
addTR({
"SCREEN SHAKE":["TEMBLOR DE PANTALLA","TREMBLEMENT ÉCRAN","画面の揺れ","畫面震動","画面震动","TREMOLIO SCHERMO","BILDSCHIRMWACKELN","ТРЯСКА ЭКРАНА","EKRAN SARSINTISI"],
"REDUCE FLASHING":["REDUCIR DESTELLOS","RÉDUIRE LES FLASHS","点滅を減らす","減少閃爍","减少闪烁","RIDUCI LAMPEGGI","WENIGER FLACKERN","МЕНЬШЕ МИГАНИЯ","PARLAMAYI AZALT"]
});
addTR({
"TOUCH CONTROLS":["CONTROLES TÁCTILES","COMMANDES TACTILES","タッチ操作","觸控操作","触控操作","COMANDI TOUCH","TOUCH-STEUERUNG","СЕНСОРНОЕ УПРАВЛЕНИЕ","DOKUNMATİK KONTROL"],
"VIRTUAL JOYSTICK AND BUTTONS":["JOYSTICK Y BOTONES VIRTUALES","JOYSTICK ET BOUTONS VIRTUELS","バーチャルスティックとボタン","虛擬搖桿與按鈕","虚拟摇杆和按钮","JOYSTICK E PULSANTI VIRTUALI","VIRTUELLER JOYSTICK UND TASTEN","ВИРТУАЛЬНЫЙ ДЖОЙСТИК И КНОПКИ","SANAL JOYSTICK VE DÜĞMELER"],
"WARNING":["AVISO","ATTENTION","警告","警告","警告","ATTENZIONE","WARNUNG","ВНИМАНИЕ","UYARI"],
"CANCEL":["CANCELAR","ANNULER","キャンセル","取消","取消","ANNULLA","ABBRECHEN","ОТМЕНА","İPTAL"],
"CONTINUE":["CONTINUAR","CONTINUER","続ける","繼續","继续","CONTINUA","WEITER","ПРОДОЛЖИТЬ","DEVAM"],
"If you turn off touch controls on a phone,":["Si desactivas los controles táctiles en un teléfono,","Si vous désactivez les commandes tactiles sur un téléphone,","スマホでタッチ操作をオフにすると、","如果在手機上關閉觸控操作，","如果在手机上关闭触控操作，","Se disattivi i comandi touch su un telefono,","Wenn du die Touch-Steuerung am Handy ausschaltest,","Если отключить сенсорное управление на телефоне,","Telefonda dokunmatik kontrolleri kapatırsan,"],
"you'll need a keyboard or controller":["necesitarás un teclado o un mando","il vous faudra un clavier ou une manette","再びオンにするには","你需要使用鍵盤或控制器","你需要使用键盘或手柄","ti servirà una tastiera o un controller","brauchst du eine Tastatur oder einen Controller,","для повторного включения понадобится","tekrar açmak için"],
"to turn them back on.":["para volver a activarlos.","pour les réactiver.","キーボードかコントローラーが必要になります。","才能重新開啟。","才能重新开启。","per riattivarli.","um sie wieder einzuschalten.","клавиатура или геймпад.","klavye veya kontrolcü gerekir."]
});
addTR({
"If you turn off the joystick and buttons":["Si desactivas el joystick y los botones","Si vous désactivez le joystick et les boutons","スティックとボタンをオフにすると、","如果關閉搖桿和按鈕，","如果关闭摇杆和按钮，","Se disattivi joystick e pulsanti","Wenn du Joystick und Tasten ausschaltest,","Если отключить джойстик и кнопки,","Joystick ve düğmeleri kapatırsan,"],
"while touch controls are off, you'll need a":["mientras los controles táctiles están desactivados,","alors que les commandes tactiles sont désactivées,","タッチ操作がオフの場合、再びオンにするには","而觸控操作也處於關閉狀態，","而触控操作也处于关闭状态，","mentre i comandi touch sono disattivati,","während die Touch-Steuerung aus ist,","пока сенсорное управление выключено,","dokunmatik kontroller de kapalıyken,"],
"keyboard or controller to turn either back on.":["necesitarás un teclado o mando para activarlos.","il vous faudra un clavier ou une manette.","キーボードかコントローラーが必要になります。","你需要鍵盤或控制器才能重新開啟。","你需要键盘或手柄才能重新开启。","ti servirà una tastiera o un controller.","brauchst du Tastatur oder Controller zum Einschalten.","для включения понадобится клавиатура или геймпад.","tekrar açmak için klavye veya kontrolcü gerekir."]
});
addTR({
"HOW MANY PLAYERS?":["¿CUÁNTOS JUGADORES?","COMBIEN DE JOUEURS ?","何人で遊ぶ？","幾位玩家？","几位玩家？","QUANTI GIOCATORI?","WIE VIELE SPIELER?","СКОЛЬКО ИГРОКОВ?","KAÇ OYUNCU?"],
"{0} PLAYERS":["{0} JUGADORES","{0} JOUEURS","{0}人","{0} 位玩家","{0} 位玩家","{0} GIOCATORI","{0} SPIELER","{0} ИГРОКА","{0} OYUNCU"],
"Left / Right to choose, Enter / Z / A to confirm (or press 2, 3 or 4), X / B to go back":["Izquierda / Derecha para elegir, Enter / Z / A para confirmar (o pulsa 2, 3 o 4), X / B para volver","Gauche / Droite pour choisir, Entrée / Z / A pour valider (ou touches 2, 3, 4), X / B pour revenir","左 / 右で選択、Enter / Z / A で決定（または 2、3、4 キー）、X / B でもどる","左 / 右選擇，Enter / Z / A 確認（或按 2、3、4），X / B 返回","左 / 右选择，Enter / Z / A 确认（或按 2、3、4），X / B 返回","Sinistra / Destra per scegliere, Invio / Z / A per confermare (o premi 2, 3 o 4), X / B per tornare","Links / Rechts zum Wählen, Enter / Z / A zum Bestätigen (oder 2, 3 oder 4 drücken), X / B zurück","Влево / Вправо — выбор, Enter / Z / A — подтвердить (или нажмите 2, 3 или 4), X / B — назад","Seçmek için Sol / Sağ, onaylamak için Enter / Z / A (veya 2, 3 ya da 4 tuşu), geri dönmek için X / B"],
"P1: WASD + SPACE/SHIFT    P2: ARROWS + RIGHT SHIFT or /":["P1: WASD + ESPACIO/MAYÚS    P2: FLECHAS + MAYÚS DER. o /","P1 : WASD + ESPACE/MAJ    P2 : FLÈCHES + MAJ DROITE ou /","P1：WASD + スペース/Shift    P2：矢印キー + 右Shift または /","P1：WASD + 空白鍵/Shift    P2：方向鍵 + 右 Shift 或 /","P1：WASD + 空格键/Shift    P2：方向键 + 右 Shift 或 /","P1: WASD + SPAZIO/MAIUSC    P2: FRECCE + MAIUSC DESTRO o /","P1: WASD + LEERTASTE/UMSCHALT    P2: PFEILTASTEN + RECHTE UMSCHALT oder /","P1: WASD + ПРОБЕЛ/SHIFT    P2: СТРЕЛКИ + ПРАВЫЙ SHIFT или /","P1: WASD + BOŞLUK/SHIFT    P2: OK TUŞLARI + SAĞ SHIFT veya /"],
"Controllers: D-pad/stick to move, A to confirm and dash. Pads 1 to 4 = P1 to P4.":["Mandos: cruceta/palanca para moverte, A para confirmar y hacer dash. Mandos 1 a 4 = P1 a P4.","Manettes : croix directionnelle/stick pour bouger, A pour valider et dasher. Manettes 1 à 4 = P1 à P4.","コントローラー：十字キー/スティックで移動、Aで決定とダッシュ。1〜4台目 = P1〜P4。","手把：十字鍵/搖桿移動，A 鍵確認與衝刺。第 1 至 4 支 = P1 至 P4。","手柄：十字键/摇杆移动，A 键确认与冲刺。第 1 至 4 个 = P1 至 P4。","Controller: croce direzionale/stick per muoversi, A per confermare e scattare. Pad da 1 a 4 = da P1 a P4.","Controller: Steuerkreuz/Stick zum Bewegen, A zum Bestätigen und Dashen. Pad 1 bis 4 = P1 bis P4.","Геймпады: крестовина/стик — движение, A — подтвердить и рывок. Геймпады 1–4 = P1–P4.","Kontrolcüler: Hareket için yön tuşları/analog, onay ve atılma için A. 1. - 4. kol = P1 - P4."],
"Press your confirm key near the center!":["¡Pulsa tu tecla de confirmar cerca del centro!","Appuyez sur votre touche de validation près du centre !","中央付近で自分の決定ボタンを押そう！","在中央附近按下你的確認鍵！","在中央附近按下你的确认键！","Premi il tuo tasto di conferma vicino al centro!","Drücke deine Bestätigungstaste nahe der Mitte!","Нажмите свою кнопку подтверждения ближе к центру!","Merkeze yakınken kendi onay tuşuna bas!"],
"LEFT":["SALIÓ","PARTI","退出","已離開","已离开","USCITO","WEG","ВЫШЕЛ","AYRILDI"],
"P{0}   LEFT":["P{0}   SALIÓ","P{0}   PARTI","P{0}   退出","P{0}   已離開","P{0}   已离开","P{0}   USCITO","P{0}   WEG","P{0}   ВЫШЕЛ","P{0}   AYRILDI"],
"P{0}   DOWN":["P{0}   CAÍDO","P{0}   À TERRE","P{0}   ダウン","P{0}   倒下","P{0}   倒下","P{0}   CADUTO","P{0}   GEFALLEN","P{0}   ПАЛ","P{0}   DÜŞTÜ"],
"The Pink Pie goes to waste...":["La Tarta Rosa se desperdicia...","La Tarte Rose est gaspillée...","ピンクパイは無駄になった……","粉紅派白白浪費了……","粉红派白白浪费了……","La Torta Rosa va sprecata...","Der Rosa Kuchen geht verloren...","Розовый пирог пропал зря...","Pembe Turta boşa gitti..."],
"P{0} fed the Pink Pie to P{1}.":["P{0} le da la Tarta Rosa a P{1}.","P{0} donne la Tarte Rose à P{1}.","P{0}がP{1}にピンクパイを食べさせた。","P{0} 把粉紅派餵給了 P{1}。","P{0} 把粉红派喂给了 P{1}。","P{0} dà la Torta Rosa a P{1}.","P{0} gibt P{1} den Rosa Kuchen.","P{0} даёт Розовый пирог игроку P{1}.","P{0}, P{1} oyuncusuna Pembe Turta yedirdi."],
"It tastes a little... Corrupted?":["Sabe un poco... ¿corrupto?","Ça a un goût un peu... corrompu ?","ちょっと……バグった味がする？","嚐起來有點……壞掉了？","尝起来有点……坏掉了？","Ha un sapore un po'... corrotto?","Es schmeckt ein bisschen... verdorben?","На вкус чуть-чуть... испорчено?","Tadı biraz... bozulmuş gibi?"],
"P{0} recovered 12 HP.":["P{0} recupera 12 HP.","P{0} récupère 12 HP.","P{0}のHPが12回復した。","P{0} 的 HP 恢復了 12 點。","P{0} 的 HP 恢复了 12 点。","P{0} recupera 12 HP.","P{0} erhält 12 HP zurück.","P{0} восстанавливает 12 HP.","P{0}, 12 HP kazandı."],
"P{0}'s HP was maxed out.":["Los HP de P{0} están al máximo.","Les HP de P{0} sont au maximum.","P{0}のHPが満タンになった。","P{0} 的 HP 已滿。","P{0} 的 HP 已满。","Gli HP di P{0} sono al massimo.","Die HP von P{0} sind voll.","HP игрока P{0} полностью восстановлены.","P{0} oyuncusunun HP'si doldu."],
"P{0} gets back up!":["¡P{0} se levanta!","P{0} se relève !","P{0}が起き上がる！","P{0} 站了起來！","P{0} 站了起来！","P{0} si rialza!","P{0} steht wieder auf!","P{0} встаёт!","P{0} ayağa kalkıyor!"],
"P{0}: {1} damage!":["P{0}: ¡{1} de daño!","P{0} : {1} dégâts !","P{0}：{1}ダメージ！","P{0}：{1} 點傷害！","P{0}：{1} 点伤害！","P{0}: {1} danni!","P{0}: {1} Schaden!","P{0}: {1} урона!","P{0}: {1} hasar!"],
"P{0}: Miss...":["P{0}: Fallo...","P{0} : Raté...","P{0}：ミス……","P{0}：落空……","P{0}：落空……","P{0}: Mancato...","P{0}: Daneben...","P{0}: Мимо...","P{0}: Iskaladı..."],
"Not enough players want to flee!":["¡No hay suficientes jugadores que quieran huir!","Pas assez de joueurs veulent fuir !","逃げたいプレイヤーが足りない！","想逃跑的玩家不夠多！","想逃跑的玩家不够多！","Non ci sono abbastanza giocatori che vogliono fuggire!","Nicht genug Spieler wollen fliehen!","Недостаточно игроков хотят бежать!","Kaçmak isteyen yeterli oyuncu yok!"],
"({0} out of {1})":["({0} de {1})","({0} sur {1})","（{1}人中{0}人）","（{1} 人中有 {0} 人）","（{1} 人中有 {0} 人）","({0} su {1})","({0} von {1})","({0} из {1})","({0} / {1} oyuncu)"],
"Start":["Iniciar","Démarrer","スタート","開始","开始","Avvia","Start","Старт","Başlat"],
"Room open. Share the code. Up to 3 friends can join.":["Sala abierta. Comparte el código. Pueden unirse hasta 3 amigos.","Salle ouverte. Partagez le code. Jusqu'à 3 amis peuvent rejoindre.","ルームを開きました。コードを共有してください。最大3人の友達が参加できます。","房間已開啟。分享代碼吧，最多可有 3 位朋友加入。","房间已开启。分享代码吧，最多可有 3 位朋友加入。","Stanza aperta. Condividi il codice. Possono unirsi fino a 3 amici.","Raum geöffnet. Teile den Code. Bis zu 3 Freunde können beitreten.","Комната открыта. Поделитесь кодом. Могут присоединиться до 3 друзей.","Oda açık. Kodu paylaş. En fazla 3 arkadaş katılabilir."],
"{0} of 4 players are in the room. Press Start when ready.":["{0} de 4 jugadores en la sala. Pulsa Iniciar cuando estén listos.","{0} joueurs sur 4 dans la salle. Appuyez sur Démarrer quand vous êtes prêts.","ルームに{0}/4人。準備ができたらスタートを押してください。","房間內有 {0}/4 位玩家。準備好後按「開始」。","房间内有 {0}/4 位玩家。准备好后按“开始”。","{0} giocatori su 4 nella stanza. Premi Avvia quando siete pronti.","{0} von 4 Spielern im Raum. Drücke Start, wenn ihr bereit seid.","В комнате {0} из 4 игроков. Нажмите «Старт», когда будете готовы.","Odada {0}/4 oyuncu var. Hazır olunca Başlat'a bas."],
"Connected. Waiting for the host to start...":["Conectado. Esperando a que el anfitrión inicie...","Connecté. En attente du démarrage par l'hôte...","接続しました。ホストの開始を待っています……","已連線。等待房主開始……","已连接。等待房主开始……","Connesso. In attesa che l'host avvii...","Verbunden. Warte darauf, dass der Host startet...","Подключено. Ждём, пока хост начнёт...","Bağlandı. Ev sahibinin başlatması bekleniyor..."],
"Connected. Waiting for the host to start... ({0} of 4 players)":["Conectado. Esperando a que el anfitrión inicie... ({0} de 4 jugadores)","Connecté. En attente du démarrage par l'hôte... ({0} joueurs sur 4)","接続しました。ホストの開始を待っています……（{0}/4人）","已連線。等待房主開始……（{0}/4 位玩家）","已连接。等待房主开始……（{0}/4 位玩家）","Connesso. In attesa che l'host avvii... ({0} giocatori su 4)","Verbunden. Warte darauf, dass der Host startet... ({0} von 4 Spielern)","Подключено. Ждём, пока хост начнёт... ({0} из 4 игроков)","Bağlandı. Ev sahibinin başlatması bekleniyor... ({0}/4 oyuncu)"],
"That room is full or has already started.":["Esa sala está llena o ya ha comenzado.","Cette salle est pleine ou a déjà commencé.","そのルームは満員か、すでに開始しています。","該房間已滿或已經開始。","该房间已满或已经开始。","Quella stanza è piena o è già iniziata.","Dieser Raum ist voll oder hat bereits begonnen.","Эта комната заполнена или игра уже началась.","O oda dolu veya oyun zaten başladı."],
"Player {0} left the room.":["El jugador {0} salió de la sala.","Le joueur {0} a quitté la salle.","プレイヤー{0}がルームを退出しました。","玩家 {0} 離開了房間。","玩家 {0} 离开了房间。","Il giocatore {0} ha lasciato la stanza.","Spieler {0} hat den Raum verlassen.","Игрок {0} покинул комнату.","{0}. oyuncu odadan ayrıldı."]
});
/* ---------- translations: leave-room dialog, controllers, controls, online turn labels [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] ---------- */
addTR({
"LEAVE ROOM?":["¿SALIR DE LA SALA?","QUITTER LA SALLE ?","ルームを退出する？","要離開房間嗎？","要离开房间吗？","LASCIARE LA STANZA?","RAUM VERLASSEN?","ПОКИНУТЬ КОМНАТУ?","ODADAN AYRILINSIN MI?"],
"Closing the room disconnects":["Cerrar la sala desconecta","Fermer la salle déconnecte","ルームを閉じると、","關閉房間會中斷","关闭房间会断开","Chiudere la stanza disconnette","Wenn du den Raum schließt,","Закрытие комнаты отключит","Odayı kapatmak, katılan"],
"everyone who has joined.":["a todos los que se han unido.","tous les joueurs présents.","参加中の全員が切断されます。","所有已加入玩家的連線。","所有已加入玩家的连接。","tutti i giocatori entrati.","werden alle Beigetretenen getrennt.","всех присоединившихся игроков.","herkesin bağlantısını keser."],
"You are the host. Leaving ends":["Eres el anfitrión. Si sales,","Vous êtes l'hôte. Partir met fin","あなたはホストです。退出すると","你是房主。離開會結束","你是房主。离开会结束","Sei l'host. Uscire termina","Du bist der Host. Wenn du gehst,","Вы — хост. Выход завершит","Ev sahibisin. Ayrılırsan"],
"the match for everyone in the room.":["termina la partida para todos en la sala.","à la partie pour tout le monde dans la salle.","ルーム全員の対戦が終了します。","房間內所有人的對戰。","房间内所有人的对战。","la partita per tutti nella stanza.","endet die Partie für alle im Raum.","матч для всех в комнате.","odadaki herkes için maç biter."],
"You can rejoin with the room code":["Puedes volver con el código de la sala","Vous pouvez revenir avec le code de la salle","ルームコードで再参加できます","可使用房間代碼重新加入，","可使用房间代码重新加入，","Puoi rientrare con il codice della stanza","Du kannst mit dem Raumcode wieder beitreten,","Вернуться по коду комнаты можно,","Oda koduyla tekrar katılabilirsin,"],
"until the match starts.":["hasta que empiece la partida.","jusqu'au début de la partie.","（対戦が始まるまで）。","直到對戰開始為止。","直到对战开始为止。","finché la partita non inizia.","bis die Partie beginnt.","пока матч не начался.","maç başlayana kadar."],
"You will not be able to rejoin":["No podrás volver a unirte","Vous ne pourrez plus rejoindre","対戦が始まると","對戰開始後","对战开始后","Non potrai rientrare","Du kannst nicht wieder beitreten,","После начала матча","Maç başladıktan sonra"],
"once the match has started.":["una vez que empiece la partida.","une fois la partie commencée.","再参加できません。","就無法重新加入。","就无法重新加入。","una volta iniziata la partita.","sobald die Partie begonnen hat.","вернуться уже нельзя.","tekrar katılamazsın."],
"STAY":["QUEDARSE","RESTER","とどまる","留下","留下","RESTA","BLEIBEN","ОСТАТЬСЯ","KAL"],
"LEAVE":["SALIR","QUITTER","退出","離開","离开","ESCI","VERLASSEN","ВЫЙТИ","AYRIL"],
"CONTROLLERS":["MANDOS","MANETTES","コントローラー","手把","手柄","CONTROLLER","CONTROLLER","ГЕЙМПАДЫ","KONTROLCÜLER"],
"CONTROLS":["CONTROLES","COMMANDES","キー設定","按鍵設定","按键设置","COMANDI","STEUERUNG","УПРАВЛЕНИЕ","TUŞ AYARLARI"],
"OPEN":["ABRIR","OUVRIR","開く","開啟","打开","APRI","ÖFFNEN","ОТКРЫТЬ","AÇ"],
"CONTROLLER CONNECTED":["MANDO CONECTADO","MANETTE CONNECTÉE","コントローラー接続","手把已連線","手柄已连接","CONTROLLER COLLEGATO","CONTROLLER VERBUNDEN","ГЕЙМПАД ПОДКЛЮЧЁН","KONTROLCÜ BAĞLANDI"],
"REPLACE KEYBOARD (P{0})":["REEMPLAZAR TECLADO (P{0})","REMPLACER CLAVIER (P{0})","キーボードと入れ替え (P{0})","取代鍵盤 (P{0})","替换键盘 (P{0})","SOSTITUISCI TASTIERA (P{0})","TASTATUR ERSETZEN (P{0})","ЗАМЕНИТЬ КЛАВИАТУРУ (P{0})","KLAVYEYİ DEĞİŞTİR (P{0})"],
"REPLACE JOYSTICK (P{0})":["REEMPLAZAR JOYSTICK (P{0})","REMPLACER JOYSTICK (P{0})","スティックと入れ替え (P{0})","取代搖桿 (P{0})","替换摇杆 (P{0})","SOSTITUISCI JOYSTICK (P{0})","JOYSTICK ERSETZEN (P{0})","ЗАМЕНИТЬ ДЖОЙСТИК (P{0})","JOYSTICK'İ DEĞİŞTİR (P{0})"],
"USE P{0}":["USAR EN P{0}","UTILISER P{0}","P{0}で使う","用於 P{0}","用于 P{0}","USA P{0}","P{0} NUTZEN","ДЛЯ P{0}","P{0} İÇİN KULLAN"],
"JOIN AS P{0}":["UNIRSE COMO P{0}","REJOINDRE EN P{0}","P{0}として参加","以 P{0} 加入","以 P{0} 加入","ENTRA COME P{0}","ALS P{0} BEITRETEN","ВОЙТИ КАК P{0}","P{0} OLARAK KATIL"],
"Left / Right choose    Confirm accept    Back skip":["Izq. / Der.: elegir    Confirmar: aceptar    Volver: omitir","Gauche / Droite : choisir    Valider : accepter    Retour : ignorer","左 / 右：選択    決定：承認    もどる：スキップ","左 / 右：選擇    確認：接受    返回：略過","左 / 右：选择    确认：接受    返回：跳过","Sinistra / Destra: scegli    Conferma: accetta    Indietro: salta","Links / Rechts: wählen    Bestätigen: annehmen    Zurück: überspringen","Влево / Вправо: выбор    Подтвердить: принять    Назад: пропустить","Sol / Sağ: seç    Onay: kabul et    Geri: atla"],
"EMPTY":["VACÍO","VIDE","なし","空","空","VUOTO","LEER","ПУСТО","BOŞ"],
"KEYBOARD":["TECLADO","CLAVIER","キーボード","鍵盤","键盘","TASTIERA","TASTATUR","КЛАВИАТУРА","KLAVYE"],
"VIRTUAL":["VIRTUAL","VIRTUEL","バーチャル","虛擬","虚拟","VIRTUALE","VIRTUELL","ВИРТУАЛЬНЫЙ","SANAL"],
"CONTROLLER":["MANDO","MANETTE","コントローラー","手把","手柄","CONTROLLER","CONTROLLER","ГЕЙМПАД","KONTROLCÜ"],
"JOYSTICK AND BUTTONS":["JOYSTICK Y BOTONES","JOYSTICK ET BOUTONS","スティックとボタン","搖桿與按鈕","摇杆和按钮","JOYSTICK E PULSANTI","JOYSTICK UND TASTEN","ДЖОЙСТИК И КНОПКИ","JOYSTICK VE DÜĞMELER"],
"(disconnected)":["(desconectado)","(déconnecté)","（未接続）","（未連線）","（未连接）","(disconnesso)","(getrennt)","(отключён)","(bağlantı yok)"],
"(DISCONNECTED)":["(DESCONECTADO)","(DÉCONNECTÉ)","（未接続）","（未連線）","（未连接）","(DISCONNESSO)","(GETRENNT)","(ОТКЛЮЧЁН)","(BAĞLANTI YOK)"],
"ARROWS":["FLECHAS","FLÈCHES","矢印キー","方向鍵","方向键","FRECCE","PFEILTASTEN","СТРЕЛКИ","OK TUŞLARI"],
"Controller":["Mando","Manette","コントローラー","手把","手柄","Controller","Controller","Геймпад","Kontrolcü"],
"{0} controller detected":["{0} mando detectado","{0} manette détectée","コントローラーを{0}台検出","偵測到 {0} 支手把","检测到 {0} 个手柄","{0} controller rilevato","{0} Controller erkannt","Обнаружено геймпадов: {0}","{0} kontrolcü algılandı"],
"{0} controllers detected":["{0} mandos detectados","{0} manettes détectées","コントローラーを{0}台検出","偵測到 {0} 支手把","检测到 {0} 个手柄","{0} controller rilevati","{0} Controller erkannt","Обнаружено геймпадов: {0}","{0} kontrolcü algılandı"],
"Press any button on a controller to detect it":["Pulsa cualquier botón de un mando para detectarlo","Appuyez sur un bouton d'une manette pour la détecter","コントローラーのボタンを押すと検出します","按下手把上的任意按鈕即可偵測","按下手柄上的任意按钮即可检测","Premi un pulsante qualsiasi su un controller per rilevarlo","Drücke eine beliebige Taste am Controller, um ihn zu erkennen","Нажмите любую кнопку на геймпаде, чтобы обнаружить его","Algılamak için kontrolcüde herhangi bir tuşa bas"],
"SOURCES":["ENTRADAS","ENTRÉES","入力デバイス","輸入裝置","输入设备","INGRESSI","EINGABEGERÄTE","УСТРОЙСТВА ВВОДА","GİRİŞ AYGITLARI"],
"Up / Down choose    Confirm select    X / B back":["Arriba / Abajo: elegir    Confirmar: seleccionar    X / B: volver","Haut / Bas : choisir    Valider : sélectionner    X / B : retour","上 / 下：選択    決定：選ぶ    X / B：もどる","上 / 下：選擇    確認：決定    X / B：返回","上 / 下：选择    确认：决定    X / B：返回","Su / Giù: scegli    Conferma: seleziona    X / B: indietro","Hoch / Runter: wählen    Bestätigen: auswählen    X / B: zurück","Вверх / Вниз: выбор    Подтвердить: выбрать    X / B: назад","Yukarı / Aşağı: seç    Onay: seçim    X / B: geri"],
"A controller or the virtual joystick can only be in one slot.":["Un mando o el joystick virtual solo puede estar en una ranura.","Une manette ou le joystick virtuel ne peut occuper qu'un seul emplacement.","コントローラーとバーチャルスティックは、1つの枠にしか割り当てられません。","手把或虛擬搖桿只能分配給一個欄位。","手柄或虚拟摇杆只能分配给一个栏位。","Un controller o il joystick virtuale può stare in un solo slot.","Ein Controller oder der virtuelle Joystick kann nur in einem Slot sein.","Геймпад или виртуальный джойстик может быть только в одном слоте.","Bir kontrolcü veya sanal joystick yalnızca tek bir yuvada olabilir."],
"Picking one that is already used takes it from the other slot.":["Elegir uno que ya se usa lo quita de la otra ranura.","En choisir un déjà utilisé le retire de l'autre emplacement.","使用中のものを選ぶと、もう一方の枠から外れます。","選擇已被使用的裝置，會將它從另一個欄位移除。","选择已被使用的设备，会将其从另一个栏位移除。","Sceglierne uno già in uso lo toglie dall'altro slot.","Wählst du ein bereits verwendetes aus, wird es dem anderen Slot entzogen.","Если выбрать уже занятое устройство, оно уйдёт из другого слота.","Zaten kullanılan birini seçersen diğer yuvadan alınır."],
"Empty":["Vacío","Vide","なし","空","空","Vuoto","Leer","Пусто","Boş"],
"Keyboard ({0})":["Teclado ({0})","Clavier ({0})","キーボード（{0}）","鍵盤（{0}）","键盘（{0}）","Tastiera ({0})","Tastatur ({0})","Клавиатура ({0})","Klavye ({0})"],
"Virtual joystick and buttons":["Joystick y botones virtuales","Joystick et boutons virtuels","バーチャルスティックとボタン","虛擬搖桿與按鈕","虚拟摇杆和按钮","Joystick e pulsanti virtuali","Virtueller Joystick und Tasten","Виртуальный джойстик и кнопки","Sanal joystick ve düğmeler"],
"KEYBOARD ({0})":["TECLADO ({0})","CLAVIER ({0})","キーボード（{0}）","鍵盤（{0}）","键盘（{0}）","TASTIERA ({0})","TASTATUR ({0})","КЛАВИАТУРА ({0})","KLAVYE ({0})"],
"EMPTY SLOT":["RANURA VACÍA","EMPLACEMENT VIDE","空きスロット","空欄位","空栏位","SLOT VUOTO","LEERER SLOT","ПУСТОЙ СЛОТ","BOŞ YUVA"],
"KEY":["TECLA","TOUCHE","キー","按鍵","按键","TASTO","TASTE","КЛАВИША","TUŞ"],
"ALTERNATE":["ALTERNATIVA","ALTERNATIVE","サブ","備用","备用","ALTERNATIVO","ALTERNATIV","ДОПОЛНИТЕЛЬНАЯ","ALTERNATİF"],
"PRESS A KEY":["PULSA UNA TECLA","APPUYEZ SUR UNE TOUCHE","キーを押して","請按下按鍵","请按下按键","PREMI UN TASTO","TASTE DRÜCKEN","НАЖМИТЕ КЛАВИШУ","BİR TUŞA BAS"],
"PRESS A BUTTON":["PULSA UN BOTÓN","APPUYEZ SUR UN BOUTON","ボタンを押して","請按下按鈕","请按下按钮","PREMI UN PULSANTE","KNOPF DRÜCKEN","НАЖМИТЕ КНОПКУ","BİR DÜĞMEYE BAS"],
"BUTTON {0}":["BOTÓN {0}","BOUTON {0}","ボタン{0}","按鈕 {0}","按钮 {0}","PULSANTE {0}","KNOPF {0}","КНОПКА {0}","DÜĞME {0}"],
"DASH / CONFIRM":["DASH / CONFIRMAR","DASH / VALIDER","ダッシュ / 決定","衝刺 / 確認","冲刺 / 确认","SCATTO / CONFERMA","DASH / BESTÄTIGEN","РЫВОК / ПОДТВЕРДИТЬ","ATILMA / ONAY"],
"DASH":["DASH","DASH","ダッシュ","衝刺","冲刺","SCATTO","DASH","РЫВОК","ATILMA"],
"CONFIRM":["CONFIRMAR","VALIDER","決定","確認","确认","CONFERMA","BESTÄTIGEN","ПОДТВЕРДИТЬ","ONAY"],
"UP":["ARRIBA","HAUT","上","上","上","SU","HOCH","ВВЕРХ","YUKARI"],
"DOWN":["ABAJO","BAS","下","下","下","GIÙ","RUNTER","ВНИЗ","AŞAĞI"],
"RIGHT":["DERECHA","DROITE","右","右","右","DESTRA","RECHTS","ВПРАВО","SAĞ"],
"LEFT (direction)":["IZQUIERDA","GAUCHE","左","左","左","SINISTRA","LINKS","ВЛЕВО","SOL"],
"The D-pad and left stick move.":["La cruceta y el stick izquierdo sirven para moverse.","La croix directionnelle et le stick gauche servent à se déplacer.","十字キーと左スティックで移動します。","十字鍵與左搖桿用於移動。","十字键和左摇杆用于移动。","La croce direzionale e lo stick sinistro servono per muoversi.","Steuerkreuz und linker Stick dienen zum Bewegen.","Крестовина и левый стик отвечают за движение.","Yön tuşları ve sol analog hareket içindir."],
"The virtual joystick and buttons can't be remapped.":["El joystick y los botones virtuales no se pueden reasignar.","Le joystick et les boutons virtuels ne peuvent pas être réassignés.","バーチャルスティックとボタンは割り当てを変更できません。","虛擬搖桿與按鈕無法重新設定。","虚拟摇杆和按钮无法重新设置。","Il joystick e i pulsanti virtuali non si possono riassegnare.","Der virtuelle Joystick und die Tasten lassen sich nicht neu belegen.","Виртуальный джойстик и кнопки нельзя переназначить.","Sanal joystick ve düğmeler yeniden atanamaz."],
"This slot is empty. Pick a source in CONTROLLERS.":["Esta ranura está vacía. Elige una entrada en MANDOS.","Cet emplacement est vide. Choisissez une entrée dans MANETTES.","この枠は空です。「コントローラー」で入力デバイスを選んでください。","此欄位是空的。請在「手把」中選擇輸入裝置。","此栏位是空的。请在“手柄”中选择输入设备。","Questo slot è vuoto. Scegli un ingresso in CONTROLLER.","Dieser Slot ist leer. Wähle eine Eingabe unter CONTROLLER.","Этот слот пуст. Выберите устройство в разделе «ГЕЙМПАДЫ».","Bu yuva boş. KONTROLCÜLER bölümünden bir giriş seç."],
"RESET ALL":["RESTABLECER TODO","TOUT RÉINITIALISER","すべてリセット","全部重設","全部重置","RIPRISTINA TUTTO","ALLES ZURÜCKSETZEN","СБРОСИТЬ ВСЁ","HEPSİNİ SIFIRLA"],
"Press a button on the controller    Esc to cancel":["Pulsa un botón del mando    Esc: cancelar","Appuyez sur un bouton de la manette    Esc : annuler","コントローラーのボタンを押す    Esc：キャンセル","按下手把上的按鈕    Esc：取消","按下手柄上的按钮    Esc：取消","Premi un pulsante del controller    Esc: annulla","Drücke eine Taste am Controller    Esc: abbrechen","Нажмите кнопку на геймпаде    Esc: отмена","Kontrolcüde bir düğmeye bas    Esc: iptal"],
"Press a key    Esc to cancel":["Pulsa una tecla    Esc: cancelar","Appuyez sur une touche    Esc : annuler","キーを押す    Esc：キャンセル","按下按鍵    Esc：取消","按下按键    Esc：取消","Premi un tasto    Esc: annulla","Drücke eine Taste    Esc: abbrechen","Нажмите клавишу    Esc: отмена","Bir tuşa bas    Esc: iptal"],
"Press a key    Esc to cancel    Delete to clear":["Pulsa una tecla    Esc: cancelar    Delete: borrar","Appuyez sur une touche    Esc : annuler    Delete : effacer","キーを押す    Esc：キャンセル    Delete：消去","按下按鍵    Esc：取消    Delete：清除","按下按键    Esc：取消    Delete：清除","Premi un tasto    Esc: annulla    Delete: cancella","Drücke eine Taste    Esc: abbrechen    Delete: löschen","Нажмите клавишу    Esc: отмена    Delete: очистить","Bir tuşa bas    Esc: iptal    Delete: temizle"],
"Up / Down choose    Left / Right change    Confirm rebind    X / B back":["Arriba / Abajo: elegir    Izq. / Der.: cambiar    Confirmar: reasignar    X / B: volver","Haut / Bas : choisir    Gauche / Droite : modifier    Valider : réassigner    X / B : retour","上 / 下：選択    左 / 右：変更    決定：割り当て    X / B：もどる","上 / 下：選擇    左 / 右：調整    確認：重新設定    X / B：返回","上 / 下：选择    左 / 右：调整    确认：重新设置    X / B：返回","Su / Giù: scegli    Sinistra / Destra: cambia    Conferma: riassegna    X / B: indietro","Hoch / Runter: wählen    Links / Rechts: ändern    Bestätigen: neu belegen    X / B: zurück","Вверх / Вниз: выбор    Влево / Вправо: изменить    Подтвердить: переназначить    X / B: назад","Yukarı / Aşağı: seç    Sol / Sağ: değiştir    Onay: yeniden ata    X / B: geri"],
"{0} IS ALREADY USED BY":["{0} YA ESTÁ ASIGNADA A","{0} EST DÉJÀ ASSIGNÉE À","{0} はすでに割り当て済み:","{0} 已指派給：","{0} 已分配给：","{0} È GIÀ ASSEGNATO A","{0} IST BEREITS BELEGT VON","{0} УЖЕ НАЗНАЧЕНА НА:","{0} ZATEN ŞUNA ATANMIŞ:"],
"(ALT)":["(ALTERNATIVA)","(ALTERNATIVE)","（サブ）","（備用）","（备用）","(ALTERNATIVO)","(ALTERNATIV)","(ДОП.)","(ALTERNATİF)"],
"Swap the two keys?":["¿Intercambiar las dos teclas?","Échanger les deux touches ?","2つのキーを入れ替えますか？","要交換這兩個按鍵嗎？","要交换这两个按键吗？","Scambiare i due tasti?","Die beiden Tasten tauschen?","Поменять эти две клавиши местами?","İki tuşun yeri değiştirilsin mi?"],
"Free that key first, or pick another.":["Libera esa tecla primero o elige otra.","Libérez d'abord cette touche, ou choisissez-en une autre.","先にそのキーを解除するか、別のキーを選んでください。","請先釋放該按鍵，或選擇其他按鍵。","请先释放该按键，或选择其他按键。","Libera prima quel tasto, oppure scegline un altro.","Gib die Taste zuerst frei oder wähle eine andere.","Сначала освободите эту клавишу или выберите другую.","Önce o tuşu boşalt ya da başka bir tuş seç."],
"SWAP":["INTERCAMBIAR","ÉCHANGER","入れ替え","交換","交换","SCAMBIA","TAUSCHEN","ПОМЕНЯТЬ","DEĞİŞ"],
"green":["verde","vert","緑","綠色","绿色","verde","grün","зелёный","yeşil"],
"orange":["naranja","orange","オレンジ","橙色","橙色","arancione","orange","оранжевый","turuncu"],
"YOUR TURN":["TU TURNO","À VOUS DE JOUER","あなたの番","輪到你了","轮到你了","TOCCA A TE","DU BIST DRAN","ТВОЙ ХОД","SIRA SENDE"],
"P{0} is choosing":["P{0} está eligiendo","P{0} choisit","P{0}が選択中","P{0} 選擇中","P{0} 选择中","P{0} sta scegliendo","P{0} wählt","P{0} выбирает","P{0} seçiyor"]
});
const dl=s=>s=='LEFT'?lx('LEFT (direction)').replace(/ \(direction\)$/,''):lx(s);
/* ---------- bosses ---------- */
const BOSSES=[
{n:'PRISM',d:'EASY',dc:'#7dff3d',hp:50,bpm:132,key:60,gen:'chip',song:'Sunny Square',genre:'Chiptune',dmg:4,warn:2,bn:10,rs:200,rn:8,act:40,intro:'* Prism floats in, humming an upbeat tune.',fl:['* Prism bounces to the beat.','* Prism is smiling.','* Prism hums along.'],chk:"* PRISM - 4 ATK 2 DEF\n* DIFFICULTY: EASY\n* He's just looking for someone to dance with."},
{n:'PULSAR',d:'NORMAL',dc:'#ffb000',hp:70,bpm:128,key:57,gen:'edm',song:'Neon Drop',genre:'EDM',dmg:5,warn:1.5,bn:16,rs:260,rn:10,act:30,intro:'* Pulsar spins up. The bass kicks in!',fl:['* Pulsar throbs with the kick drum.','* The lights are blinding.','* Pulsar is charging up.'],chk:'* PULSAR - 5 ATK 3 DEF\n* DIFFICULTY: NORMAL\n* A star who really likes to rave.'},
{n:'MAW',d:'HARD',dc:'#ff3030',hp:90,bpm:140,key:53,gen:'dub',song:'Wobble Crown',genre:'Dubstep',dmg:6,warn:1,bn:22,rs:320,rn:14,act:25,hum:10,intro:'* MAW rumbles. The floor shakes.',fl:['* MAW grinds its teeth.','* The bass wobbles the air.','* MAW stares with three eyes.'],chk:'* MAW - 6 ATK 4 DEF\n* DIFFICULTY: HARD\n* Rumble rectangle who goes hard with the bass, and teeth.'},
/* story-only (Village 1's Soulcerer): not shown in SOLO / CO-OP / ONLINE boss select. dmg 7 = genocide route; story.js lowers it to 5 otherwise */
{n:'STAR SOULCERER',d:'SOULCERER',dc:'#ffd23f',hp:150,bpm:150,key:57,gen:'orch',song:'Fallen Constellation',genre:'Synth-orchestral',dmg:7,warn:1.25,bn:12,rs:300,rn:14,act:25,story:1,intro:'* The Star Soulcerer awakens. Its visor flickers.',fl:['* The Soulcerer hums a low, ancient note.','* Starlight gathers around the statue.','* The visor watches you.'],chk:'* STAR SOULCERER - 7 ATK 5 DEF\n* DIFFICULTY: SOULCERER\n* A hero of the old war, sealed in stone.'}];
const ACTS=[null,
[{n:'Clap',m:35,t:'* You clap along with the beat.\n* Pulsar seems pleased with your contribution.'},
 {n:'Vibe',m:25,t:'* You sway your arms and hips.\n* Pulsar seems impressed by your moves.',t2:"* Pulsar's ATTACK decreases!",adj:-2}],
[{n:'Headbang',m:35,t:'* You and Maw headbang to the dub.\n* But the intense head movement gives you headaches...\n* Your DEFENSE decreased.',adj:1},
 {n:'Brush Teeth',m:30,t:"* You offer to clean Maw's teeth.\n* His spikes perk up and he seems to be excited!",gr:1}],
[{n:'Pray',m:25,t:'* You kneel and pray to the Soulcerer.\n* Its light softens for a moment.'},
 {n:'Polish Armor',m:20,t:"* You polish the Soulcerer's armor.\n* It shines a little brighter.",t2:"* The Soulcerer's next attack weakens!",adj:-2},
 {n:'Mock',m:0,t:"* You laugh at the statue.\n* Its visor glows brighter. It didn't like that.",t2:"* The Soulcerer's next attack strengthens!",adj:2}]];
/* ---------- input ---------- */
const L=['ArrowLeft','KeyA','KeyF','KeyJ','PadL'],R=['ArrowRight','KeyD','KeyH','KeyL','PadR'],U=['ArrowUp','KeyW','KeyT','KeyI','PadU'],Dn=['ArrowDown','KeyS','KeyG','KeyK','PadD'],OK=['Enter','KeyZ','Space','KeyR','KeyU','PadA'],NO=['KeyX','Escape','Backspace','KeyY','KeyO','PadB'];
addEventListener('keydown',e=>{if(e.target&&e.target.tagName=='INPUT')return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Slash'].includes(e.code))e.preventDefault();initAudio();if(!keys[e.code]&&!(coopTurn()&&keyFreed(e.code)))press(e.code);keys[e.code]=1});
addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('blur',()=>{for(const k in keys)keys[k]=0});
document.addEventListener('visibilitychange',()=>{if(!AC)return;try{document.hidden?AC.suspend():AC.resume()}catch(e){}});
addEventListener('pointerdown',initAudio);
/* ---------- controllers: which input drives which player slot ---------- */
/* per slot: 'k0'-'k3' = that keyboard set, 'g:<pad index>' = a controller, 'v' = touch controls, '' = empty */
const SLOTSRC=['k0','k1','k2','k3'],POPST=['mode','boss','set','ctl','src'];
const CTLY=[428,470],SRCY=[165,215,265,315],SRCB=450;
const padMem={},padSeen={},popQ=[];let ctlPop=null,ctlI=0,srcI=0,keysBuilt=0;
const pst={};const pads=()=>[...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean);
const padById=i=>pads().find(gp=>gp.index==i);
const padName=gp=>String(gp.id||'Controller').replace(/\s*\(.*$/,'').replace(/^[0-9a-f]{4}-[0-9a-f]{4}-/i,'')||'Controller';
const coopTurn=()=>players.length>1&&['menu','tgt','sub','ptg','atk'].includes(S);
const keyFreed=c=>{const k=KOWN.findIndex(a=>a.includes(c));return k>=0&&SLOTSRC[k]!='k'+k};
function srcParts(s){if(!s)return['EMPTY',''];if(s[0]=='k')return['KEYBOARD',mvLabel(+s[1])];if(s=='v')return['VIRTUAL','JOYSTICK AND BUTTONS'];const gp=padById(+s.slice(2));return['CONTROLLER',gp?padName(gp):'(disconnected)']}
function srcText(s){const p=srcParts(s);return!s?'Empty':s[0]=='k'?'Keyboard ('+p[1]+')':s=='v'?'Virtual joystick and buttons':p[1]}
function srcActive(s){if(!s)return false;if(s[0]=='k'){return Object.values(BIND[+s[1]]).some(a=>a.some(k=>k&&keys[k]))}
if(s=='v')return!!(SET.vjoy&&(VC.sx||VC.sy||VC.a||VC.b));const gp=padById(+s.slice(2));return!!gp&&(gp.buttons.some(b=>b.pressed)||Math.abs(gp.axes[0]||0)>.3||Math.abs(gp.axes[1]||0)>.3)}
/* a controller or touch controls can only live in one slot; taking it from another slot leaves that slot empty */
function setSlot(i,s){if(s&&s[0]!='k')SLOTSRC.forEach((q,j)=>{if(q==s&&j!=i)SLOTSRC[j]=''});SLOTSRC[i]=s}
function srcOpts(i){return['k'+i,...pads().map(gp=>'g:'+gp.index),...(SET.vjoy?['v']:[]),'']}
function srcCycle(i,d){const o=srcOpts(i);let k=o.indexOf(SLOTSRC[i]);if(k<0)k=0;setSlot(i,o[(k+d+o.length)%o.length]);AC&&sfxSel()}
function wrapN(s,n){const o=[];let c='';for(const w of String(s).split(' ')){if(c&&(c+' '+w).length>n){o.push(c);c=w}else c=c?c+' '+w:w}if(c)o.push(c);return o}
/* a controller was found: put it straight in a slot, or queue the replace / join popup */
function padFound(gp){const id='g:'+gp.index;if(SLOTSRC.includes(id)||popQ.some(q=>q.pad==gp.index)||(ctlPop&&ctlPop.pad==gp.index))return;
const m=padMem[gp.id];if(m!=null&&SLOTSRC[m]&&SLOTSRC[m][0]=='k'){setSlot(m,id);return}
const t=SLOTSRC.findIndex(s=>s[0]!='g');if(t<0)return;
const j=SLOTSRC.findIndex((s,k)=>k>t&&s[0]!='g');
if(!SLOTSRC[t]||j<0){setSlot(t,id);padMem[gp.id]=t;return}
popQ.push({pad:gp.index,gid:gp.id,name:padName(gp),t,j,o:0})}
addEventListener('gamepaddisconnected',e=>{const i=e.gamepad.index;delete padSeen[i];SLOTSRC.forEach((s,k)=>{if(s=='g:'+i)SLOTSRC[k]='k'+k});
for(let k=popQ.length-1;k>=0;k--)if(popQ[k].pad==i)popQ.splice(k,1);if(ctlPop&&ctlPop.pad==i)ctlPop=null;if(kcap&&kcap.pad==i)kcap=null});
function pollPads(){if(!keysBuilt){keysBuilt=1;rebuildKeys()}
if(!ctlPop&&popQ.length&&POPST.includes(S)&&!warnOpen)ctlPop=popQ.shift();
pads().forEach(gp=>{const bo=padBind(gp),b=n=>gp.buttons[n]&&gp.buttons[n].pressed,ax=gp.axes[0]||0,ay=gp.axes[1]||0,
m={PadA:b(bo.ok),PadB:b(bo.no),PadL:b(14)||ax<-.5,PadR:b(15)||ax>.5,PadU:b(12)||ay<-.5,PadD:b(13)||ay>.5},sl=SLOTSRC.indexOf('g:'+gp.index),bt=[];
for(let n=0;n<12;n++)bt.push(!!b(n));
if(!padSeen[gp.index]){padSeen[gp.index]=1;padFound(gp);for(const k in m)pst[gp.index+k]=m[k];bt.forEach((v,n)=>pst[gp.index+'b'+n]=v);return}
if(kcap&&kcap.pad==gp.index){bt.forEach((v,n)=>{const id=gp.index+'b'+n;if(v&&!pst[id]&&kcap){padSetBtn(gp,kcap.act,n);kcap=null;AC&&sfxSel()}pst[id]=v});
const o2=padBind(gp);for(const k in m)pst[gp.index+k]=m[k];pst[gp.index+'PadA']=!!b(o2.ok);pst[gp.index+'PadB']=!!b(o2.no);return}
bt.forEach((v,n)=>pst[gp.index+'b'+n]=v);
for(const k in m){const id=gp.index+k;if(m[k]&&!pst[id]){initAudio();if(ctlPop||sl>=0||!coopTurn()){pw=sl;try{press(k)}finally{pw=-1}}}pst[id]=m[k]}})}
/* ---------- controllers: popup, CONTROLLERS screen, SOURCES screen ---------- */
function popPress(c,is){const p=ctlPop;if(is(L)||is(R)){p.o^=1;AC&&sfxSel()}
else if(is(OK)){const s=p.o?p.j:p.t;setSlot(s,'g:'+p.pad);padMem[p.gid]=s;ctlPop=null;AC&&sfxSel()}
else if(is(NO)){ctlPop=null;AC&&sfxSel()}}
function popTap(x,y){const by=190,bh=220;for(let j=0;j<2;j++){const cx=W/2+(j?115:-115);
if(x>=cx-105&&x<=cx+105&&y>=by+bh-80&&y<=by+bh-20){if(ctlPop.o==j)popPress('',a=>a===OK);else{ctlPop.o=j;AC&&sfxSel()}return}}}
function drawCtlPop(){const p=ctlPop;if(!p)return;g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);
const bx=150,by=190,bw=500,bh=220;g.fillStyle='#000';g.fillRect(bx,by,bw,bh);g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(bx,by,bw,bh);
txt('CONTROLLER CONNECTED',W/2,by+42,22,'#ff0','center');txt(p.name,W/2,by+78,16,'#fff','center',bw-40);
const rt=srcParts(SLOTSRC[p.t])[0],lb=[rt=='KEYBOARD'||rt=='VIRTUAL'?'REPLACE '+(rt=='VIRTUAL'?'JOYSTICK':rt)+' (P'+(p.t+1)+')':'USE P'+(p.t+1),'JOIN AS P'+(p.j+1)];
lb.forEach((s,j)=>{const cx=W/2+(j?115:-115),on=p.o==j,yy=by+bh-50,sl=j?p.j:p.t;if(on)soul(cx-92,yy,PCOL[sl],sl,1);txt(s,cx+8,yy+6,15,on?'#ff0':'#888','center',150)});
txt('Left / Right choose    Confirm accept    Back skip',W/2,by+bh-14,13,'#777','center',bw-30)}
function openCtl(){S='ctl';ctlI=0;AC&&sfxSel()}
function ctlPress(c,is){if(is(U)||is(Dn)){ctlI^=1;AC&&sfxSel()}
else if(is(OK)){if(ctlI==0){S='src';srcI=0}else S='set';AC&&sfxSel()}
else if(is(NO)){S='set';AC&&sfxSel()}}
function srcPress(c,is){if(is(U)){srcI=(srcI+4)%5;AC&&sfxSel()}else if(is(Dn)){srcI=(srcI+1)%5;AC&&sfxSel()}
else if(srcI<4&&(is(L)||is(R)))srcCycle(srcI,is(L)?-1:1);
else if(srcI<4&&is(OK))srcCycle(srcI,1);
else if((srcI==4&&is(OK))||is(NO)){S='ctl';AC&&sfxSel()}}
function ctlTap(x,y){const inR=(a,b,w,h)=>x>=a&&x<=a+w&&y>=b&&y<=b+h;
if(!inR(PX,PY,PW,PH)){S=S=='src'?'ctl':'set';return}
if(S=='ctl'){for(let j=0;j<2;j++)if(inR(W/2-100,CTLY[j]-22,200,44)){if(ctlI==j)ctlPress('',a=>a===OK);else{ctlI=j;AC&&sfxSel()}return}return}
for(let i=0;i<4;i++)if(inR(PX+20,SRCY[i]-24,PW-40,48)){srcI=i;if(inR(240,SRCY[i]-24,420,48))srcCycle(i,x<450?-1:1);return}
if(inR(W/2-100,SRCB-22,200,44)){if(srcI==4)srcPress('',a=>a===OK);else{srcI=4;AC&&sfxSel()}}}
function ctlPanel(t){g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W,H);g.fillStyle='#000';g.fillRect(PX,PY,PW,PH);g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(PX,PY,PW,PH);txt(t,W/2,PY+42,24,'#fff','center')}
function drawCtl(){ctlPanel('CONTROLLERS');
for(let i=0;i<4;i++){const x=128+i*140,cx=x+62,s=SLOTSRC[i],pr=srcParts(s);
txt('P'+(i+1),cx,172,20,PCOL[i],'center');g.fillStyle=PCOL[i];shp(cx,205,14,i);g.fill();
g.strokeStyle=PCOL[i];g.lineWidth=4;g.strokeRect(x,230,124,130);
txt(pr[0],cx,262,15,'#fff','center',108);wrapN(lx(pr[1]),11).slice(0,3).forEach((l,k)=>txt(l,cx,290+k*22,15,'#bbb','center',108));
g.fillStyle=srcActive(s)?PCOL[i]:'#333';g.fillRect(cx-6,338,12,12)}
const n=pads().length;txt(n?n+(n>1?' controllers':' controller')+' detected':'Press any button on a controller to detect it',W/2,392,15,'#aaa','center',560);
[['SOURCES',CTLY[0]],['BACK',CTLY[1]]].forEach((b,j)=>{const on=ctlI==j;if(on)soul(W/2-90,b[1],'#19e3ff');txt(b[0],W/2,b[1]+7,22,on?'#ff0':'#888','center')});
txt('Up / Down choose    Confirm select    X / B back',W/2,PY+PH-16,13,'#777','center',560)}
function drawSrc(){ctlPanel('SOURCES');
for(let i=0;i<4;i++){const yy=SRCY[i],on=srcI==i,c=on?'#ff0':'#888';if(on)soul(PX+36,yy,'#19e3ff');
g.fillStyle=PCOL[i];shp(PX+84,yy,10,i);g.fill();txt('P'+(i+1),PX+106,yy+6,18,c,'left',50);
g.fillStyle=c;g.beginPath();g.moveTo(258,yy);g.lineTo(272,yy-9);g.lineTo(272,yy+9);g.fill();g.beginPath();g.moveTo(642,yy);g.lineTo(628,yy-9);g.lineTo(628,yy+9);g.fill();
txt(srcText(SLOTSRC[i]),450,yy+7,18,c,'center',330)}
txt('A controller or the virtual joystick can only be in one slot.',W/2,372,14,'#aaa','center',560);
txt('Picking one that is already used takes it from the other slot.',W/2,394,14,'#aaa','center',560);
const on=srcI==4;if(on)soul(W/2-60,SRCB,'#19e3ff');txt('BACK',W/2,SRCB+7,22,on?'#ff0':'#888','center');
txt('Up / Down choose    Left / Right change    X / B back',W/2,PY+PH-16,13,'#777','center',560)}
/* ---------- key bindings: [primary, alternate] per action, saved between visits ---------- */
const BDEF=[
{U:['KeyW',''],D:['KeyS',''],L:['KeyA',''],R:['KeyD',''],DASH:['Space','ShiftLeft'],OK:['KeyZ','Space'],NO:['KeyX','']},
{U:['ArrowUp',''],D:['ArrowDown',''],L:['ArrowLeft',''],R:['ArrowRight',''],DASH:['ShiftRight','Slash'],OK:['Enter',''],NO:['Backspace','Escape']},
{U:['KeyT',''],D:['KeyG',''],L:['KeyF',''],R:['KeyH',''],DASH:['KeyR',''],OK:['KeyR',''],NO:['KeyY','']},
{U:['KeyI',''],D:['KeyK',''],L:['KeyJ',''],R:['KeyL',''],DASH:['KeyU',''],OK:['KeyU',''],NO:['KeyO','']}];
const BIND=BDEF.map(b=>{const o={};for(const a in b)o[a]=[...b[a]];return o}),PADBIND={};
const padBind=gp=>PADBIND[gp.id]||(PADBIND[gp.id]={ok:0,no:1});
function saveBind(){try{localStorage.setItem('soulxbeat-keys',JSON.stringify({k:BIND,p:PADBIND}))}catch(e){}}
function loadBind(){try{const s=JSON.parse(localStorage.getItem('soulxbeat-keys'));if(!s)return;
if(Array.isArray(s.k))s.k.forEach((b,i)=>{if(!BIND[i]||!b)return;for(const a in BIND[i]){const v=b[a];if(Array.isArray(v)&&v.length==2&&v.every(q=>typeof q=='string'&&/^[A-Za-z0-9]{0,20}$/.test(q))&&v[0])BIND[i][a]=[v[0],v[1]]}});
if(s.p)for(const id in s.p){const v=s.p[id];if(v&&Number.isInteger(v.ok)&&Number.isInteger(v.no)&&v.ok!=v.no&&v.ok>=0&&v.ok<12&&v.no>=0&&v.no<12)PADBIND[id]={ok:v.ok,no:v.no}}}catch(e){}}
loadBind();
/* the menu key lists and the key owners are rebuilt from the bindings; the Tap codes are used by the touch code (L[0], R[0], OK[1] ...) and by online play */
function rebuildKeys(){const all=a=>[...new Set(BIND.flatMap(b=>b[a]).filter(Boolean))],set=(arr,...x)=>{arr.length=0;arr.push(...x)};
set(L,'TapL',...all('L'),'PadL');set(R,'TapR',...all('R'),'PadR');set(U,'TapU',...all('U'),'PadU');set(Dn,'TapD',...all('D'),'PadD');
set(OK,'TapOK','TapOK',...all('OK'),'PadA');set(NO,'TapNO',...all('NO'),'PadB');
KOWN.forEach((a,i)=>set(a,...new Set(Object.values(BIND[i]).flat().filter(Boolean)),...(i?[]:['TapL','TapR','TapU','TapD','TapOK','TapNO'])))}
function bindChanged(){rebuildKeys();saveBind()}
/* online: the guest sends the action (not the raw key) so the host's own bindings don't matter */
const canonCode=c=>L.includes(c)?'TapL':R.includes(c)?'TapR':U.includes(c)?'TapU':Dn.includes(c)?'TapD':OK.includes(c)?'TapOK':NO.includes(c)?'TapNO':c;
const KEYN={ArrowLeft:'LEFT',ArrowRight:'RIGHT',ArrowUp:'UP',ArrowDown:'DOWN',Space:'SPACE',Enter:'ENTER',Escape:'ESC',Backspace:'BKSP',ShiftLeft:'L-SHIFT',ShiftRight:'R-SHIFT',ControlLeft:'L-CTRL',ControlRight:'R-CTRL',AltLeft:'L-ALT',AltRight:'R-ALT',Slash:'/',Tab:'TAB',Delete:'DEL',Backquote:'`',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Semicolon:';',Quote:"'",Comma:',',Period:'.',Backslash:'\\',CapsLock:'CAPS'};
const keyName=c=>!c?'--':KEYN[c]||c.replace(/^(Key|Digit)/,'').replace(/^Numpad/,'NUM ').toUpperCase();
function mvLabel(i){const b=BIND[i],k=[b.U[0],b.L[0],b.D[0],b.R[0]];if(k.every(c=>/^Arrow/.test(c)))return'ARROWS';if(k.join()=='KeyW,KeyA,KeyS,KeyD')return'WASD';return k.map(keyName).join('/')}
const keyHint=i=>'P'+(i+1)+': '+mvLabel(i)+' + '+BIND[i].DASH.filter(Boolean).map(keyName).join(' or ');
const padBtnName=(gp,n)=>gp.mapping!='standard'?'BUTTON '+n:(/054c|dualsense|dualshock|playstation/i.test(gp.id)?['CROSS','CIRCLE','SQUARE','TRIANGLE','L1','R1','L2','R2','SHARE','OPTIONS','L3','R3']:['A','B','X','Y','LB','RB','LT','RT','VIEW','MENU','L3','R3'])[n]||'BUTTON '+n;
function padSetBtn(gp,act,n){const bo=padBind(gp),o=act=='ok'?'no':'ok';if(bo[o]==n)bo[o]=bo[act];bo[act]=n;saveBind()}
/* ---------- CONTROLS screen: one tab per player ---------- */
const KROWS=[['UP','U'],['DOWN','D'],['LEFT','L'],['RIGHT','R'],['DASH','DASH'],['CONFIRM','OK'],['CANCEL','NO']],ACTN={U:'UP',D:'DOWN',L:'LEFT',R:'RIGHT',DASH:'DASH',OK:'CONFIRM',NO:'CANCEL'};
let kt=0,kr=-1,kc=0,kb=1,kcap=null,kconf=null;
const kView=()=>{const s=SLOTSRC[kt];return s&&s[0]=='k'?'k':s&&s[0]=='g'?'g':s=='v'?'v':'e'};
const kRows=()=>({k:7,g:2,v:0,e:0})[kView()];
function openKeys(){S='keys';kt=0;kr=-1;kc=0;kb=1;kcap=null;kconf=null;AC&&sfxSel()}
/* a key can't be shared between players or between different actions (Dash and Confirm may share one) */
function keyUse(code,p,act,slot){for(let q=0;q<4;q++)for(const a in BIND[q])for(let s=0;s<2;s++){if(BIND[q][a][s]!=code)continue;if(q==p&&a==act&&s==slot)continue;if(q==p&&((a=='DASH'&&act=='OK')||(a=='OK'&&act=='DASH')))continue;return{p:q,act:a,slot:s}}return null}
function keyBind(p,act,slot,code){const cur=BIND[p][act][slot];if(cur==code)return;const o=keyUse(code,p,act,slot);
if(!o){BIND[p][act][slot]=code;bindChanged();AC&&sfxSel();return}
kconf={p,act,slot,code,o,sw:!!cur,opt:0}}
function resetBind(){BDEF.forEach((b,i)=>{for(const a in b)BIND[i][a]=[...b[a]]});for(const id in PADBIND)delete PADBIND[id];bindChanged();AC&&sfxSel()}
function confPress(is){const k=kconf;
if(k.sw&&(is(L)||is(R))){k.opt^=1;AC&&sfxSel()}
else if(is(OK)){if(k.sw&&k.opt==0){const old=BIND[k.p][k.act][k.slot];BIND[k.o.p][k.o.act][k.o.slot]=old;BIND[k.p][k.act][k.slot]=k.code;bindChanged()}kconf=null;AC&&sfxSel()}
else if(is(NO)){kconf=null;AC&&sfxSel()}}
function keysPress(c,is){
if(kconf){confPress(is);return}
if(kcap){if(c=='Escape'||c=='PadB'){kcap=null;AC&&sfxSel();return}
if(kcap.pad!=null||/^(Pad|Tap)/.test(c))return;
if(c=='Delete'){if(kcap.slot==1){BIND[kcap.p][kcap.act][1]='';bindChanged()}kcap=null;AC&&sfxSel();return}
const k=kcap;kcap=null;keyBind(k.p,k.act,k.slot,c);return}
const n=kRows(),v=kView();
if(is(U)){kr=kr<0?n:kr-1;AC&&sfxSel()}
else if(is(Dn)){kr=kr>=n?-1:kr+1;AC&&sfxSel()}
else if(is(L)||is(R)){const d=is(L)?-1:1;if(kr<0){kt=(kt+d+4)%4;kc=0}else if(kr==n)kb^=1;else if(v=='k')kc^=1;AC&&sfxSel()}
else if(is(OK)){
if(kr==n){if(kb==0)resetBind();else{S='set';AC&&sfxSel()}}
else if(kr>=0&&v=='k'){kcap={p:kt,act:KROWS[kr][1],slot:kc};AC&&sfxSel()}
else if(kr>=0&&v=='g'){const gi=+SLOTSRC[kt].slice(2);if(padById(gi)){kcap={pad:gi,act:kr?'no':'ok'};AC&&sfxSel()}}}
else if(c=='Delete'&&v=='k'&&kr>=0&&kr<n&&kc==1){BIND[kt][KROWS[kr][1]][1]='';bindChanged();AC&&sfxSel()}
else if(is(NO)){S='set';AC&&sfxSel()}}
function keysTap(x,y){const inR=(a,b,w,h)=>x>=a&&x<=a+w&&y>=b&&y<=b+h;
if(kconf){const k=kconf;for(let j=0;j<(k.sw?2:1);j++)if(inR(W/2+(k.sw?(j?90:-90):0)-70,357,140,44)){if(!k.sw||k.opt==j)confPress(a=>a===OK);else{k.opt=j;AC&&sfxSel()}return}return}
if(kcap){kcap=null;return}
if(!inR(PX,PY,PW,PH)){S='set';return}
for(let i=0;i<4;i++)if(inR(125+i*140,134,130,38)){kt=i;kr=-1;kc=0;AC&&sfxSel();return}
const n=kRows(),v=kView();
for(let i=0;i<n;i++){const yy=v=='g'?244+i*40:234+i*30;if(inR(PX+20,yy-15,PW-40,v=='g'?36:30)){const col=v=='k'&&x>=470?1:0;if(kr==i&&kc==col)keysPress('',a=>a===OK);else{kr=i;kc=col;AC&&sfxSel()}return}}
for(let j=0;j<2;j++)if(inR(j?420:220,440,160,44)){if(kr==n&&kb==j)keysPress('',a=>a===OK);else{kr=n;kb=j;AC&&sfxSel()}return}}
function drawKeys(){ctlPanel('CONTROLS');const v=kView(),n=kRows(),s=SLOTSRC[kt];
for(let i=0;i<4;i++){const x=125+i*140,on=kt==i;
if(on){g.globalAlpha=.25;g.fillStyle=PCOL[i];g.fillRect(x,134,130,38);g.globalAlpha=1}
g.strokeStyle=on?PCOL[i]:'#444';g.lineWidth=on?4:2;g.strokeRect(x,134,130,38);
g.fillStyle=PCOL[i];shp(x+38,153,9,i);g.fill();txt('P'+(i+1),x+60,160,18,on?'#fff':'#888','left',50);
if(on&&kr<0)soul(x+114,153,'#19e3ff')}
txt(v=='k'?'KEYBOARD ('+mvLabel(kt)+')':v=='g'?srcText(s):v=='v'?'VIRTUAL JOYSTICK AND BUTTONS':'EMPTY SLOT',W/2,194,15,'#aaa','center',560);
if(v=='k'){txt('KEY',390,212,13,'#777','center');txt('ALTERNATE',530,212,13,'#777','center');
KROWS.forEach((r,i)=>{const yy=234+i*30,on=kr==i;if(on)soul(PX+36,yy,'#19e3ff');
txt(dl(r[0]),PX+60,yy+6,18,on?'#ff0':'#888','left',180,1);
for(let c=0;c<2;c++){const bx=330+c*140,sel=on&&kc==c,cp=kcap&&kcap.p==kt&&kcap.act==r[1]&&kcap.slot==c;
g.strokeStyle=sel?'#ff0':'#555';g.lineWidth=sel?3:2;g.strokeRect(bx,yy-14,120,28);
txt(cp?(Math.floor(performance.now()/400)%2?'PRESS A KEY':''):keyName(BIND[kt][r[1]][c]),bx+60,yy+6,15,cp?'#ff0':sel?'#fff':'#bbb','center',108,!cp)}})}
else if(v=='g'){const gi=+s.slice(2),gp=padById(gi);
[['DASH / CONFIRM','ok'],['CANCEL','no']].forEach((r,i)=>{const yy=244+i*40,on=kr==i,cp=kcap&&kcap.pad==gi&&kcap.act==r[1];if(on)soul(PX+36,yy,'#19e3ff');
txt(r[0],PX+60,yy+6,18,on?'#ff0':'#888','left',230);
g.strokeStyle=on?'#ff0':'#555';g.lineWidth=on?3:2;g.strokeRect(390,yy-14,200,28);
txt(cp?(Math.floor(performance.now()/400)%2?'PRESS A BUTTON':''):gp?padBtnName(gp,padBind(gp)[r[1]]):'(DISCONNECTED)',490,yy+6,15,cp?'#ff0':on?'#fff':'#bbb','center',188)});
txt('The D-pad and left stick move.',W/2,340,15,'#aaa','center',560)}
else txt(v=='v'?"The virtual joystick and buttons can't be remapped.":'This slot is empty. Pick a source in CONTROLLERS.',W/2,270,16,'#aaa','center',560);
[['RESET ALL',300],['BACK',500]].forEach((b,j)=>{const on=kr==n&&kb==j;if(on)soul(b[1]-70,462,'#19e3ff');txt(b[0],b[1],469,20,on?'#ff0':'#888','center',130)});
txt(kcap?(kcap.pad!=null?'Press a button on the controller    Esc to cancel':'Press a key    Esc to cancel'+(kcap.slot==1?'    Delete to clear':'')):'Up / Down choose    Left / Right change    Confirm rebind    X / B back',W/2,PY+PH-16,13,'#777','center',560);
if(kconf){const k=kconf,o=k.o,bx=170,by=205,bw=460,bh=210;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(PX,PY,PW,PH);g.fillStyle='#000';g.fillRect(bx,by,bw,bh);g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(bx,by,bw,bh);
txt(keyName(k.code)+' IS ALREADY USED BY',W/2,by+46,18,'#ff0','center',bw-30);
txt('P'+(o.p+1)+' '+dl(ACTN[o.act])+(o.slot?' '+lx('(ALT)'):''),W/2,by+84,20,PCOL[o.p],'center',bw-30,1);
txt(k.sw?'Swap the two keys?':'Free that key first, or pick another.',W/2,by+120,15,'#fff','center',bw-30);
(k.sw?['SWAP','CANCEL']:['OK']).forEach((s,j)=>{const cx=W/2+(k.sw?(j?90:-90):0),on=!k.sw||k.opt==j;if(on)soul(cx-58,by+bh-34,'#19e3ff');txt(s,cx,by+bh-27,20,on?'#ff0':'#888','center',100)})}}
/* ---------- audio (all original, synthesized live) ---------- */
function initAudio(){if(AC){if(AC.state!='running')try{AC.resume()}catch(e){}return}try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null;return}out=AC.createGain();out.gain.value=.5;out.connect(AC.destination);mG=AC.createGain();sG=AC.createGain();mG.connect(out);sG.connect(out);master=sG;applyVol();const n=AC.sampleRate;nb=AC.createBuffer(1,n,n);const d=nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}
function tone(f,t,dur,type,vol,f2){if(!AC)return;const o=AC.createOscillator(),v=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);v.gain.setValueAtTime(vol,t);v.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(v);v.connect(master);o.start(t);o.stop(t+dur+.02)}
function noise(t,dur,vol,hp){if(!AC)return;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),v=AC.createGain();s.buffer=nb;f.type='highpass';f.frequency.value=hp;v.gain.setValueAtTime(vol,t);v.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(v);v.connect(master);s.start(t);s.stop(t+dur+.02)}
function pad(f,t,dur,det,spb){if(!AC)return;const o=AC.createOscillator(),v=AC.createGain();o.type='sawtooth';o.frequency.value=f;o.detune.value=det;v.gain.setValueAtTime(.0001,t);for(let i=0;i<4;i++){v.gain.setValueAtTime(.01,t+i*spb);v.gain.linearRampToValueAtTime(.045,t+i*spb+spb*.8)}v.gain.linearRampToValueAtTime(.0001,t+dur);o.connect(v);v.connect(master);o.start(t);o.stop(t+dur+.05)}
function wob(f,t,dur,rate){if(!AC)return;const a=AC.createOscillator(),b=AC.createOscillator(),fl=AC.createBiquadFilter(),v=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();a.type='sawtooth';b.type='square';a.frequency.value=f;b.frequency.value=f*1.006;fl.type='lowpass';fl.Q.value=9;fl.frequency.value=350;l.frequency.value=rate;lg.gain.value=650;l.connect(lg);lg.connect(fl.frequency);v.gain.setValueAtTime(.2,t);v.gain.setValueAtTime(.2,t+dur-.04);v.gain.linearRampToValueAtTime(0,t+dur);a.connect(fl);b.connect(fl);fl.connect(v);v.connect(master);[a,b,l].forEach(o=>{o.start(t);o.stop(t+dur+.05)});tone(f,t,dur,'sine',.35)}
const mtof=m=>440*2**((m-69)/12);
/* string section: a sustained, softly filtered saw with a slow attack */
function strg(f,t,dur,vol){if(!AC)return;const o=AC.createOscillator(),o2=AC.createOscillator(),fl=AC.createBiquadFilter(),v=AC.createGain();o.type='sawtooth';o2.type='sawtooth';o.frequency.value=f;o2.frequency.value=f;o2.detune.value=7;fl.type='lowpass';fl.frequency.value=1500;v.gain.setValueAtTime(.0001,t);v.gain.linearRampToValueAtTime(vol,t+Math.min(.35,dur*.3));v.gain.setValueAtTime(vol,t+dur*.8);v.gain.linearRampToValueAtTime(.0001,t+dur);o.connect(fl);o2.connect(fl);fl.connect(v);v.connect(master);[o,o2].forEach(q=>{q.start(t);q.stop(t+dur+.05)})}
/* ---------- Star Soulcerer: "Fallen Constellation" ----------
   A song in sections (56 bars, ~90 s at 150 BPM) instead of a 4-bar loop.
   intro 8 > verse 16 > build 8 > chorus 16 > breakdown 8, then back to the verse.
   At low HP (phase 2) it jumps straight to the chorus once.
   Chords are semitones above the key (A minor); melodies are 8th notes above key+12 (null = rest). */
const OI=[0,3,7],OVI=[-4,0,3],OIII=[3,7,10],OVII=[-2,2,5],OIV=[5,8,12],OV=[7,11,14],__=null;
const ORCH_MEL={
verse:[[0,__,3,__,7,__,5,3],[2,__,3,__,0,__,__,__],[8,__,7,__,5,__,3,__],[5,__,3,__,0,__,__,__],[7,__,10,__,12,__,10,7],[5,__,7,__,3,__,__,__],[10,__,7,__,5,__,2,__],[11,__,__,__,7,__,__,__]],
chorus:[[12,__,15,__,14,12,10,12],[8,__,12,__,15,14,12,10],[7,__,10,__,12,15,14,12],[10,__,14,__,12,10,7,__]],
brk:[[8,__,__,__,7,__,5,__],[7,__,__,__,10,__,12,__],[10,__,__,__,7,__,5,__],[3,__,__,__,__,__,__,__]]};
const ORCH=[{n:'intro',len:8,ch:[OI,OVI,OIII,OVII]},{n:'verse',len:16,ch:[OI,OI,OVI,OVI,OIII,OIII,OVII,OV]},{n:'build',len:8,ch:[OIV,OIV,OVI,OVI,OVII,OVII,OV,OV]},{n:'chorus',len:16,ch:[OI,OVI,OIII,OVII]},{n:'brk',len:8,ch:[OVI,OIII,OVII,OI,OVI,OIII,OVII,OV]}];
const ORCH_LEN=56,ORCH_LOOP=8,ORCH_CHORUS=32;
function orchSec(sb){let s=0;for(const sec of ORCH){if(sb<s+sec.len)return{sec,i:sb-s};s+=sec.len}return{sec:ORCH[0],i:0}}
function orchBar(bar){if(mus.lb===bar)return;mus.lb=bar;mus.sb=mus.sb==null?0:mus.sb+1;if(mus.sb>=ORCH_LEN)mus.sb=ORCH_LOOP;
if(!mus.jp&&BO===mus.b&&lowHp()){mus.jp=1;if(orchSec(mus.sb).sec.n!='chorus')mus.sb=ORCH_CHORUS}}
function orchStep(b,t,st,spb){const key=b.key,{sec,i}=orchSec(mus.sb||0),c=sec.ch[i%sec.ch.length],n=sec.n,root=key-24+c[0],
kick=v=>tone(150,t,.18,'sine',v||.9,40),snare=()=>{noise(t,.14,.3,1800);tone(220,t,.08,'triangle',.12,120)},hat=v=>noise(t,.03,v||.06,9000),
lead=(m,v)=>{if(m==null)return;const f=mtof(key+12+m);tone(f,t,spb*.45,'square',v||.06);tone(f/2,t,spb*.45,'sawtooth',(v||.06)*.6)},
bell=(f,v)=>{tone(f,t,.8,'triangle',v||.12);tone(f*2,t,.5,'sine',(v||.12)*.4)};
if(st==0&&n!='build')for(const q of c)strg(mtof(key+q),t,spb*4,n=='chorus'?.05:.035);
if(n=='intro'){if(st%8==0)bell(mtof(key+24+c[(st>>3)%3]));if(st==0)tone(mtof(root),t,spb*4,'sine',.25)}
else if(n=='verse'){if(st==0||st==8)kick();if(st==4||st==12)snare();if(st%4==2)hat();if(st%2==0){tone(mtof(root),t,spb*.45,'triangle',.28);lead(ORCH_MEL.verse[i%8][st>>1],.05)}}
else if(n=='build'){if(i>=6?st%2==0:st%4==0)kick(.8);tone(mtof(key+12+c[st%3]+12*((st>>2)&1)),t,spb*.2,'square',.025+.006*i);if(st==0)tone(mtof(root),t,spb*4,'sawtooth',.12);
if(i>=6)noise(t,.05,.05+.03*(i-6)+.004*st,2000);else if(i>=4&&st%2==0)noise(t,.06,.06,2000)}
else if(n=='chorus'){if(i==0&&st==0)noise(t,.9,.18,3500);if(st%4==0)kick();if(st==4||st==12)snare();if(st%2)hat(.07);if(st%2==0)tone(mtof(root+12*((st>>1)&1)),t,spb*.45,'sawtooth',.2);
lead(st%2==0?ORCH_MEL.chorus[i%4][st>>1]:null,.07);if(st%8==4)bell(mtof(key+24+c[2]),.05)}
else{if(st==0)tone(mtof(root),t,spb*4,'sine',.22);if(st%2==0){const m=ORCH_MEL.brk[i%4][st>>1];if(m!=null)bell(mtof(key+12+m),.1)}}}
const CHM=[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],CHN=[[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]];
function startMusic(b){if(!AC)initAudio();const spb=60/b.bpm;mus={b,spb,t0:(AC?AC.currentTime:0)+.2,step:0,timer:setInterval(sched,25)};bt=-.2/spb}
function stopMusic(){if(mus){clearInterval(mus.timer);mus=null}}
function sched(){if(!mus||!AC)return;master=mG;try{sched2()}finally{master=sG}}
function sched2(){if(!mus||!AC)return;const{b,spb,t0}=mus,key=b.key;
while(t0+mus.step*spb/4<AC.currentTime+.15){const k=mus.step,t=t0+k*spb/4,st=k%16,bar=k>>4,ch=(b.gen=='chip'?CHM:CHN)[bar%4],r=key-24+ch[0];
if(b.gen=='orch'&&st==0)orchBar(bar);
if(t<AC.currentTime-.1){mus.step++;continue}
if(b.gen=='orch')orchStep(b,t,st,spb);
else if(b.gen=='chip'){
if(st%4==0)tone(150,t,.15,'sine',.8,45);if(st==4||st==12)noise(t,.12,.3,1800);noise(t,.03,st%2?.05:.09,8000);
if(st%2==0)tone(mtof(r+(st%8==6?12:0)),t,spb*.4,'triangle',.3);
tone(mtof(key+ch[[0,1,2,1][st%4]]+12*(1+((st>>3)&1))),t,spb*.2,'square',.08);
if(bar>=1&&st%4==2)tone(mtof(key+24+ch[(st>>2)%3]),t,spb*.15,'square',.04)}
else if(b.gen=='edm'){
if(st%4==0)tone(160,t,.2,'sine',.95,40);if(st==4||st==12)noise(t,.16,.35,1800);if(st%4==2)noise(t,.09,.14,9000);else if(st%2)noise(t,.02,.04,9000);
if(st==0)for(const c of ch)for(const d of[-9,0,9])pad(mtof(key+c+12),t,spb*3.9,d,spb);
if(st%4==2)tone(mtof(r),t,spb*.45,'sawtooth',.22);
if(bar>=1&&st%2==0)tone(mtof(key+12+ch[(st>>1)%3]+12*((st>>3)&1)),t,spb*.2,'square',.07)}
else{
if(st==0||st==10)tone(140,t,.25,'sine',1,35);if(st==8){noise(t,.22,.5,900);tone(200,t,.12,'square',.2,90)}
if(st%2==0)noise(t,.03,.05,9000);
if(st%8==0)wob(mtof(r),t,spb*1.95,(b.bpm/60)*[2,3,4,6][bar%4]);
if(st==6||st==14)tone(mtof(key+12+ch[2]),t,.12,'sawtooth',.07)}
mus.step++}}
const T0=()=>AC?AC.currentTime:0;const sfxDash=()=>tone(900,T0(),.12,'sine',.25,200),sfxHit=()=>{noise(T0(),.25,.6,300);tone(120,T0(),.25,'square',.3,40)},sfxUp=()=>[0,4,7,12].forEach((m,i)=>tone(mtof(72+m),T0()+i*.07,.15,'square',.12)),sfxSel=()=>tone(700,T0(),.06,'square',.1),jingle=()=>[0,4,7,12,16,19,24].forEach((m,i)=>tone(mtof(60+m),T0()+i*.1,.35,'square',.14));
/* ---------- attacks ---------- */
function genA(i,uniq){const D=BOSSES[i],r=Math.random,e=[],rx=()=>BX+40+r()*(BW-80),ry=()=>BY+30+r()*(BH-60),w=D.warn;
const vb=(b,x)=>e.push({b,t:'rect',x:x-26,y:BY,w:52,h:BH,warn:w,dur:.5}),hb=(b,y)=>e.push({b,t:'rect',x:BX,y:y-20,w:BW,h:40,warn:w,dur:.5}),bu=b=>e.push({b,t:'burst',x:rx(),y:ry(),warn:w,n:D.bn}),rain=(b,n)=>{for(let j=0;j<n;j++)e.push({b:b+j*.5,t:'b',x:rx(),y:BY-10,vx:0,vy:D.rs,r:8})};
/* Prism's own attack: tilted squares (diamonds) that appear at random spots in the board */
const sqs=(b,n)=>{const s=50,d=s*.7071,pts=[];for(let t=0;t<40&&pts.length<n;t++){const x=BX+d+r()*(BW-2*d),y=BY+d+r()*(BH-2*d);if(pts.every(q=>Math.hypot(q.x-x,q.y-y)>115))pts.push({x,y})}pts.forEach(q=>e.push({b,t:'sq',x:q.x,y:q.y,s,warn:w,dur:.75}))};
/* each boss's very own attack, by boss index (null = none yet, so that boss uses the shared attack every turn) */
const uq=[()=>{for(let k=1;k<8;k++){sqs(k*4,3);sqs(k*4+2,3)}},
/* Pulsar: suns (ball + 8 spikes) that charge for 4 beats, then fire 8 slow triangle spikes */
()=>{for(let k=1;k<8;k++){const B=k*4,n=k<3?2:3,pts=[];for(let t=0;t<40&&pts.length<n;t++){const x=BX+40+r()*(BW-80),y=BY+40+r()*(BH-80);if(pts.every(q=>Math.hypot(q.x-x,q.y-y)>130))pts.push({x,y})}pts.forEach(q=>e.push({b:B,t:'sun',x:q.x,y:q.y,a:r()*Math.PI/4,warn:4,sp:90}))}},
/* Maw: 3 jaw cycles; each cycle the missing tooth moves at least 5 slots away from the last one */
()=>{let last=-99;const gt=greenTooth;greenTooth=0;for(let c=0;c<3;c++){let m,n=0,z;do{m=1+Math.floor(r()*14);n++}while(Math.abs(m-last)<5&&n<60);last=m;if(gt)do{z=Math.floor(r()*16)}while(z==m);e.push({b:c*11,t:'jaw',gap:m,warn:10,gt:gt?z:-99})}},
/* Star Soulcerer: shooting stars, star bursts that split, constellation lines, statue slams.
   Phase 2 (low HP): shorter warnings and more stars. */
()=>{const p2=lowHp(),ww=p2?w*.7:w;
const shoot=(B,n)=>{for(let j=0;j<n;j++){const s=r()<.5?-1:1,vx=s*(120+r()*80),vy=240+r()*60;e.push({b:B+j*.5,t:'b',x:s<0?BX+BW*.45+r()*BW*.6:BX-40+r()*BW*.55,y:BY-10,vx,vy,r:7,a:Math.atan2(vy,vx),m:60})}};
const split=B=>e.push({b:B,t:'sb',x:rx(),y:ry(),warn:ww,n:p2?7:6});
const stars=(B,n)=>{const pts=[];for(let t=0;t<40&&pts.length<n;t++){const x=rx(),y=ry();if(pts.every(q=>Math.hypot(q.x-x,q.y-y)>110))pts.push({x,y})}for(let j=1;j<pts.length;j++)e.push({b:B,t:'ln',x1:pts[j-1].x,y1:pts[j-1].y,x2:pts[j].x,y2:pts[j].y,warn:ww+1,dur:1})};
const slam=B=>{e.push({b:B,t:'rect',x:BX,y:BY+BH-60,w:BW,h:60,warn:ww,dur:.4});e.push({b:B,t:'slam',warn:ww})};
for(let k=1;k<8;k++){const B=k*4;
if(k==4||k==7){slam(B);shoot(B+2,p2?4:2)}
else if(k%2){stars(B,p2?4:3);shoot(B+2,p2?5:3)}
else{split(B);if(p2)split(B+2);shoot(B+1,p2?3:2)}}}][i];
if(uniq&&uq)uq();else for(let k=1;k<8;k++){const B=k*4,p=Math.floor(r()*5);
if(p==0){vb(B,rx());vb(B+2,rx());if(i>1)vb(B+1,rx())}
else if(p==1){hb(B,ry());hb(B+2,ry());if(i)vb(B+1,rx())}
else if(p==2){bu(B);bu(B+2);if(i>1)hb(B,ry())}
else if(p==3){rain(B,D.rn);if(i)vb(B,rx())}
else{vb(B,rx());bu(B+1);hb(B+2,ry());if(i>1)bu(B+2)}}
if(i==2&&greenTooth){greenTooth=0;e.push({b:14+Math.floor(r()*4),t:'hs',x:BX+60+r()*(BW-120),top:r()<.5?1:0,life:999})}
return e.sort((a,b)=>a.b-b.b)}
/* ---------- Maw's jaw: 16 tooth slots along the board (even = top, odd = bottom), one tooth missing ----------
   JW slot width (a tooth's base is 2*JW wide), JL0 resting tooth length, JG grow-in beats, JB bite beats, JH hold-closed beats, JR retract beats.
   When the jaw bites, top and bottom teeth interlock like a zipper, so the only safe spot is where the tooth is missing. */
const JW=37.5,JL0=80,JG=1.5,JB=.2,JH=.5,JR=.3;
function jawLen(h,age){const w=h.warn;
if(age<JG)return[JL0*Math.max(0,age)/JG,0];
if(age<w)return[JL0,1];
if(age<w+JB){const q=(age-w)/JB;return[JL0+(BH-JL0)*q*q,1]}
if(age<w+JB+JH)return[BH,1];
return[BH*(1-Math.min(1,(age-w-JB-JH)/JR)),0]}
function jawTri(cx,m,L){return(m&1)?[cx-JW,BY+BH,cx+JW,BY+BH,cx,BY+BH-L]:[cx-JW,BY,cx+JW,BY,cx,BY+L]}
function jawHit(h,p){const[L,hm]=jawLen(h,bt-h.b);if(!hm||L<=0)return 0;
for(let m=-1;m<=16;m++){if(m==h.gap||m==h.gt)continue;const cx=BX+JW/2+m*JW,dx=Math.max(0,Math.abs(p.x-cx)-7),dy=(m&1)?BY+BH-Math.min(p.y+7,BY+BH):Math.max(p.y-7,BY)-BY;if(dx/JW+dy/L<1)return 1}return 0}
function sfxHeal(){tone(880,T0(),.1,'sine',.3);tone(1320,T0()+.09,.16,'sine',.3)}
function jawHeal(h,p){if(!(h.gt>=0)||h.gu)return;const[L,hm]=jawLen(h,bt-h.b);if(!hm||L<=0)return;const pi=players.indexOf(p);h.gh=h.gh||[];if(h.gh.includes(pi))return;const m=h.gt,cx=BX+JW/2+m*JW,dx=Math.max(0,Math.abs(p.x-cx)-7),dy=(m&1)?BY+BH-Math.min(p.y+7,BY+BH):Math.max(p.y-7,BY)-BY;
if(dx/JW+dy/L<1){h.gu=1;p.hp=Math.min(p.max,p.hp+3);sfxHeal()}}
function drawJaw(h){const age=bt-h.b,[L,hm]=jawLen(h,age),w=h.warn,tri=a=>{g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(a[2],a[3]);g.lineTo(a[4],a[5]);g.closePath()};
g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
if(L>0)for(let m=-1;m<=16;m++){if(m==h.gap||(m==h.gt&&h.gu))continue;const jx=hm&&age>=w-1&&age<w?Math.sin(age*120)*2:0,a=jawTri(BX+JW/2+m*JW+jx,m,L);
const col=m==h.gt?'#7dff3d':PINK;g.globalAlpha=m==h.gt&&h.gu?.4:1;
if(hm){tri(a);g.fillStyle=col;g.fill();const mx=(a[0]+a[2]+a[4])/3,my=(a[1]+a[3]+a[5])/3;tri(a.map((v,k)=>(k&1?my:mx)+.45*(v-(k&1?my:mx))));g.fillStyle='#fff';g.fill()}
else{tri(a);g.globalAlpha=.3;g.fillStyle=col;g.fill();g.globalAlpha=1;g.strokeStyle=col;g.lineWidth=2;g.stroke()}g.globalAlpha=1}
g.restore()}
/* ---------- Maw's healing spike (Brush Teeth, shared attack) ---------- */
function hsLen(h,age){return age<JG?[JL0*Math.max(0,age)/JG,0]:age<h.life?[JL0,1]:[JL0*Math.max(0,1-(age-h.life)/JR),0]}
function hsTouch(h,p){if(h.dead)return;const[L,sol]=hsLen(h,bt-h.b);if(!sol)return;const dx=Math.max(0,Math.abs(p.x-h.x)-7),dy=h.top?Math.max(p.y-7,BY)-BY:BY+BH-Math.min(p.y+7,BY+BH);
if(dx/JW+dy/L<1){h.dead=1;p.hp=Math.min(p.max,p.hp+3);sfxHeal()}}
function drawHS(h){if(h.dead)return;const[L,sol]=hsLen(h,bt-h.b);if(L<=0)return;const a=jawTri(h.x,h.top?0:1,L),tri=q=>{g.beginPath();g.moveTo(q[0],q[1]);g.lineTo(q[2],q[3]);g.lineTo(q[4],q[5]);g.closePath()};
g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
if(sol){tri(a);g.fillStyle='#7dff3d';g.fill();const mx=(a[0]+a[2]+a[4])/3,my=(a[1]+a[3]+a[5])/3;tri(a.map((v,k)=>(k&1?my:mx)+.45*(v-(k&1?my:mx))));g.fillStyle='#fff';g.fill()}
else{tri(a);g.globalAlpha=.3;g.fillStyle='#7dff3d';g.fill();g.globalAlpha=1;g.strokeStyle='#7dff3d';g.lineWidth=2;g.stroke()}
g.restore()}
/* ---------- victory animations ---------- */
let wsp=0,wanim=0,wimg=null,wtiles=[];
const PUREC=['#d9ffc4','#ffe8b0','#ffc4c4','#ffe27a'],hr=n=>{const x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
function winInit(sp){wxT=0;wsp=sp?1:0;wanim=0;wimg=null;wtiles=[]}
function bossImg(){const c=document.createElement('canvas');c.width=240;c.height=200;const old=g;g=c.getContext('2d');try{drawBoss(bi,120,100,0,1,0,false,true)}finally{g=old}wimg=c;
const d=c.getContext('2d').getImageData(0,0,240,200).data;wtiles=[];for(let ty=0;ty<200;ty+=6)for(let tx=0;tx<240;tx+=6)if(d[((ty+3)*240+tx+3)*4+3]>20)wtiles.push({x:tx,y:ty,r:hr(tx*31+ty*17)})}
function drawWinBoss(){const bx=W/2,by=95,t=wanim;
if(!wsp){/* fought: sweep of disintegrating pixels */
if(!wimg)bossImg();const ox=bx-120,oy=by-100;
for(const q of wtiles){const p=(t-(.15+q.x/240*.9+q.r*.35))/1.1;if(p>=1)continue;
if(p<=0){g.globalAlpha=1;g.drawImage(wimg,q.x,q.y,6,6,ox+q.x,oy+q.y,6,6)}
else{const k=p+p*p*.5;g.globalAlpha=1-p;g.drawImage(wimg,q.x,q.y,6,6,ox+q.x+(30+q.r*60)*k,oy+q.y-(40+hr(q.x+q.y*7)*80)*k,6,6)}}
g.globalAlpha=1;return}
/* spared: corruption flakes off, boss turns pure */
const p=Math.min(1,Math.max(0,(t-.5)/1.8)),sh=t<.5?Math.sin(t*90)*3:0;
if(p<1){g.globalAlpha=1-p;drawBoss(bi,bx+sh,by,0,1,0)}
g.globalAlpha=p;drawBoss(bi,bx+sh,by+Math.sin(t*3)*3*p,0,1,1);g.globalAlpha=1;
for(let i=0;i<32;i++){const s=(t-.4-hr(i*7.3)*1.3)/1.2;if(s<=0||s>=1)continue;
g.globalAlpha=1-s;g.fillStyle=i%3?'#ff2d75':'#7a0030';g.fillRect(bx+(hr(i*3.1)-.5)*130+(hr(i*9.7)-.5)*40*s,by+(hr(i*5.7)-.5)*80-s*60,6,6)}
g.globalAlpha=1;
const a=Math.sin(p*Math.PI)*.6+p*.08,gl=g.createRadialGradient(bx,by,10,bx,by,130);gl.addColorStop(0,'rgba(255,255,255,'+a+')');gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(bx-140,by-140,280,280);
if(t>1.6)for(let i=0;i<14;i++){const ph=(t*.6+hr(i*2.3))%1;g.globalAlpha=Math.sin(ph*Math.PI);g.fillStyle=i%2?'#fff':'#ffe97a';const x=bx+(hr(i*4.1)-.5)*180,y=by+55-ph*120;g.fillRect(x-1,y-4,2,8);g.fillRect(x-4,y-1,8,2)}
g.globalAlpha=1}
/* ---------- players ---------- */
const mkP=i=>({i,x:spx(i,mode),y:BY+BH/2,hp:20,max:20,inv:0,dash:0,dcd:0,fx:1,fy:0,down:0,rev:0,dp:0,col:PCOL[i],tr:[],rem:0,rx:0,ry:0,rd:0,rdp:0,rdi:-1});
const KSET=[{m:['KeyA','KeyD','KeyW','KeyS'],d:['Space','ShiftLeft']},{m:['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'],d:['ShiftRight','Slash']},{m:['KeyF','KeyH','KeyT','KeyG'],d:['KeyR']},{m:['KeyJ','KeyL','KeyI','KeyK'],d:['KeyU']}];
function srcInput(s,o){if(!s)return;
if(s[0]=='k'){const b=BIND[+s[1]],dn=a=>a.some(k=>k&&keys[k]);if(dn(b.L))o.x--;if(dn(b.R))o.x++;if(dn(b.U))o.y--;if(dn(b.D))o.y++;if(dn(b.DASH))o.d=1}
else if(s=='v'){if(SET.vjoy){if(VC.sx||VC.sy){o.x=VC.sx;o.y=VC.sy}if(VC.a)o.d=1}}
else{const gp=padById(+s.slice(2));if(!gp)return;const bo=padBind(gp),ax=gp.axes[0]||0,ay=gp.axes[1]||0,b=i=>gp.buttons[i]&&gp.buttons[i].pressed;
if(Math.abs(ax)>.3)o.x=ax;if(Math.abs(ay)>.3)o.y=ay;if(b(14))o.x=-1;if(b(15))o.x=1;if(b(12))o.y=-1;if(b(13))o.y=1;if(b(bo.ok))o.d=1}}
function input(p){const o={x:0,y:0,d:0},solo=!!net.role||mode==1;
let src=solo?SLOTSRC.slice(0,2):[SLOTSRC[p.i]];
if(solo||p.i==(SLOTSRC.includes('v')?SLOTSRC.indexOf('v'):0))src=[...src,'v'];
new Set(src).forEach(s=>srcInput(s,o));
let x=Math.max(-1,Math.min(1,o.x)),y=Math.max(-1,Math.min(1,o.y));const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}return[x,y,!!o.d]}
function upd(p,dt){p.inv=Math.max(0,p.inv-dt);p.dcd=Math.max(0,p.dcd-dt);if(p.down)return;
if(p.rem){if(p.rdi===dodgeId){p.x=Math.min(BX+BW-12,Math.max(BX+12,p.rx));p.y=Math.min(BY+BH-12,Math.max(BY+12,p.ry))}
const rd=performance.now()-(p.rt||0)<400?p.rd:0;if(rd&&!p.rdp)p.inv=Math.max(p.inv,.2);p.rdp=rd;p.dash=rd?.05:0;if(p.dash>0)p.tr.push({x:p.x,y:p.y,a:.6});p.tr.forEach(t=>t.a-=dt*4);p.tr=p.tr.filter(t=>t.a>0);return}
const[x,y,d]=input(p);if(x||y){p.fx=x;p.fy=y}
if(d&&!p.dp&&p.dcd<=0){p.dash=.14;p.dcd=.6;p.inv=Math.max(p.inv,.2);sfxDash()}p.dp=d;
let vx=x*250,vy=y*250;
if(p.dash>0){p.dash-=dt;const l=Math.hypot(p.fx,p.fy)||1;vx=p.fx/l*760;vy=p.fy/l*760;p.tr.push({x:p.x,y:p.y,a:.6})}
p.x=Math.min(BX+BW-12,Math.max(BX+12,p.x+vx*dt));p.y=Math.min(BY+BH-12,Math.max(BY+12,p.y+vy*dt));
p.tr.forEach(t=>t.a-=dt*4);p.tr=p.tr.filter(t=>t.a>0)}
function hurt(p){if(p.inv>0||p.dash>0||p.down)return;p.hp=Math.max(0,p.hp-storyTaken(p.i,BO.dmg+dmgNow));p.inv=1.2;p.hit=performance.now();shake=10;sfxHit();if(!p.hp){p.down=1;p.rev=0;lastDn=p.i}}
/* ---------- battle flow ---------- */
function wrapTxt(t){const cw=ch=>ch.charCodeAt(0)>0x2e7f?1.75:1,vw=q=>{let w=0;for(const ch of q)w+=cw(ch);return w},cut=(q,n)=>{let w=0,k=0;for(const ch of q){w+=cw(ch);if(w>n)break;k+=ch.length}return k};return t.split('\n').map(l=>{const o=[];let c=l;while(vw(c)>43){const n=cut(c,43),cj=/[\u2e80-\uffff]/.test(c.slice(0,n));let k=cj?n:c.lastIndexOf(' ',n);if(k<2)k=n;o.push(c.slice(0,k));c=(cj?'':'  ')+c.slice(k).trim()}o.push(c);return o.join('\n')}).join('\n')}
function showMsg(t,fn){S='msg';TXT=t;tc=0;nextFn=fn;msgWho=-1}
/* ---------- co-op turns: everyone picks, then it all plays out ---------- */
const KOWN=[['KeyA','KeyD','KeyW','KeyS','KeyZ','KeyX','Space','ShiftLeft'],['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','ShiftRight','Slash','Backspace','Escape'],['KeyF','KeyH','KeyT','KeyG','KeyR','KeyY'],['KeyJ','KeyL','KeyI','KeyK','KeyU','KeyO']];
function pressOwner(c){if(net.role)return fromG||0;if(pw>=0)return pw;return KOWN.findIndex(a=>a.includes(c))}
const shareOf=(t,k,N)=>{t=Math.round(t);return Math.floor(t/N)+(k==0?t%N:0)};
function mSoul(x,y){const k=players.length>1?pk:0;soul(x,y,PCOL[k],k)}
function showMsgP(i,t,fn){showMsg(t,fn);msgWho=i}
function menuAgain(){S='menu';TXT=curFl;tc=TXT.length}
function advance(){let n=pk+1;while(n<players.length&&players[n].down)n++;if(n<players.length){pk=n;S='menu';mi=0;tc=TXT.length}else resolve()}
function rec(o){picks[pk]=o;if(o.k=='i')items--;advance()}
function backPick(){let j=pk-1;while(j>=0&&players[j].down)j--;if(j<0)return;const o=picks[j];if(o&&o.k=='i')items++;picks[j]=null;pk=j;S='menu';mi=0;tc=TXT.length}
function coSub(){if(mi==1)rec({k:'a',s:subI});else if(mi==2){ptI=pk;S='ptg'}else rec({k:'m',s:subI})}
function ptStep(d){let j=ptI,n=0;do{j=(j+d+players.length)%players.length;n++}while(players[j].gone&&n<9);return j}
function resolve(){fleeMsg=0;const q=[],f=[];players.forEach((p,i)=>{const k=picks[i];if(!k||p.gone)return;if(k.k=='f')f.push(i);else q.push(i)});runQ(q,0,f)}
function runQ(q,j,f){if(j>=q.length){if(f.length)startBars(f);else startDodge();return}
const i=q[j],k=picks[i],nx=()=>runQ(q,j+1,f),N=players.length,P=(t,fn)=>showMsgP(i,t,fn);
if(k.k=='a'){
if(k.s==0)P(BO.chk,nx);
else if(bi){const a=ACTS[bi][k.s-1];hapT=[a.t,a.t2];spare=Math.min(100,spare+shareOf(a.m,i,N));if(a.adj)dmgAdj=a.adj;if(a.gr)greenTooth=1;P(a.t,a.t2?()=>P(a.t2,nx):nx)}
else if(k.s==1){spare=Math.min(100,spare+shareOf(BO.act,i,N));hapT=['* You dance! Prism sways.'];P('* You dance! Prism sways.',nx)}
else{spare=Math.min(100,spare+shareOf(BO.hum||BO.act/2,i,N));players.forEach(p=>{if(!p.down)p.hp=Math.min(p.max,p.hp+4)});hapT=['* You hum along. Prism starts to feel a little better.'];P('* You hum along. Prism starts to feel a little better.',nx)}}
else if(k.k=='i'){const t=players[k.t];
if(!t||t.gone)P('* The Pink Pie goes to waste...',nx);
else{const was=t.down,b4=t.hp;sfxPie(was);if(was){t.down=0;t.hp=Math.min(t.max,12);t.rev=0}else t.hp=Math.min(t.max,t.hp+12);
const self=k.t==i,nm='P'+(k.t+1),rc=b4+12<=t.max;
const l3=was?nm+' gets back up!':self?(rc?'You recovered 12 HP.':'Your HP was maxed out.'):(rc?nm+' recovered 12 HP.':nm+"'s HP was maxed out.");
P((self?'* You ate the Pink Pie.':'* P'+(i+1)+' fed the Pink Pie to '+nm+'.')+'\n* It tastes a little... Corrupted?\n* '+l3,nx)}}
else{if(k.s==0){if(spare>=100||lowHp())win(1);else{mbT=performance.now();nx()}}
else{const liv=players.filter(p=>!p.down&&!p.gone).length,vt=players.filter((p,x)=>picks[x]&&picks[x].k=='m'&&picks[x].s==1).length,need=net.role?Math.floor(liv/2)+1:1;
if(vt>=need){stopMusic();S='flee';exT=performance.now();exSn=0}else if(!fleeMsg){fleeMsg=1;P('* Not enough players want to flee!\n* ('+vt+' out of '+liv+')',nx)}else nx()}}}
function rndStarts(n){const R=100,gap=26,L=R-(n-1)*gap,o=[];for(let i=0;i<n;i++)o.push(Math.random()*L);o.sort((a,b)=>a-b);return o.map((v,i)=>v+i*gap).sort(()=>Math.random()-.5)}
function startBars(f){fb=[];const st=rndStarts(f.length);f.forEach((i,j)=>fb.push({k:i,x:st[j],done:0,d:0,miss:0}));fbDone=0;S='atk'}
function stopBar(w){let b=fb.find(q=>!q.done&&q.k===w);if(!b&&w<0)b=fb.find(q=>!q.done);if(b)b.done=1}
function finishBars(){const N=players.length;let tot=0;const Ln=fb.map(b=>{if(b.miss)return'* P'+(b.k+1)+': Miss...';const dx=Math.abs(b.x-260),base=dx<=6?25:Math.min(24,Math.round(25*(1-(dx-6)/254))),d=storyHit(b.k,Math.max(1,Math.round(base*shareOf(25,b.k,N)/25)));b.d=d;b.q=base;tot+=d;return'* P'+(b.k+1)+': '+d+' damage!'});
atkFx(fb.filter(b=>!b.miss).map(b=>({k:b.k,d:b.d,q:b.q})),tot,Ln.join('\n'))}
function drawBars(){const n=fb.length,hb=Math.min(52,Math.floor((176-8*(n-1))/n));
fb.forEach((b,i)=>{const p=players[b.k],y=BY+54+i*(hb+8);g.fillStyle='#222';g.fillRect(BX+40,y,520,hb);g.strokeStyle=p.col;g.lineWidth=3;g.strokeRect(BX+40,y,520,hb);g.fillStyle=PINK;g.fillRect(BX+294,y,12,hb);g.globalAlpha=b.done?.55:1;g.fillStyle='#fff';g.fillRect(BX+40+b.x-4,y-6,8,hb+12);g.globalAlpha=1;txt('P'+(b.k+1),BX+8,y+hb/2+6,16,p.col)});
txt('Press your confirm key near the center!',BX+BW/2,BY+30,16,'#fff','center')}
let curFl='',flLast=-1,flRep=0;
const LOWFL=[["* Prism's smile is flickering.","* Prism's glow is fading.","* Prism is out of breath, but still swaying."],["* Pulsar is sputtering.","* Pulsar's lights are flickering.","* Pulsar's beat is starting to skip."],["* MAW is wheezing, one eye half shut.","* MAW's teeth are chattering.","* MAW is wobbling, but won't fall."],["* The Soulcerer's light flickers.","* Cracks spread across the armor.","* The statue trembles, but holds."]];
function lowHp(){return!!BO&&bhp>0&&bhp<=BO.hp*.4}
function pickFl(){let n=Math.floor(Math.random()*3);if(n==flLast&&flRep>=2)n=(n+1+Math.floor(Math.random()*2))%3;if(n==flLast)flRep++;else{flLast=n;flRep=1}return(lowHp()?LOWFL[BOSSES.indexOf(BO)]:BO.fl)[n]}
function toMenu(){S='menu';mi=0;TXT=curFl;tc=0;if(players.length>1){picks=players.map(()=>null);pk=Math.max(0,players.findIndex(p=>!p.down&&!p.gone))}}
function startDodge(){dodgeId++;S='dodge';hz=[];dmgNow=dmgAdj;dmgAdj=0;ev=genA(bi,Math.random()<.5);ei=0;tb=(Math.floor(bt/4)+2)*4;players.forEach((p,i)=>{if(!(p.down&&!p.gone)){p.x=spx(i,players.length);p.y=BY+BH/2}p.inv=0;p.dash=0;p.tr=[];p.rd=0;p.rdp=0})}
function startBattle(){BO=BOSSES[bi];if(net.role=='host')netAssign();players=[...Array(mode)].map((_,i)=>mkP(i));if(storyFighting())storySetup(players);if(net.role=='host')players.forEach(p=>{if(p.i)p.rem=1});bhp=BO.hp;spare=0;items=storyFighting()?0:2;turn=0;dmgAdj=0;dmgNow=0;greenTooth=0;stopMusic();curFl=BO.intro;flLast=-1;flRep=0;S='intro';introT=performance.now();introSn=0}
function win(sp){stopMusic();jingle();S='win';tc=0;winInit(sp);if(storyFighting()){winTxt=storyWin(sp);return}const bk='  (Enter: back to boss select)';winTxt=sp?'* YOU WON!\n* You spared '+BO.n+'.\n\n'+bk:'* YOU WON!\n* '+BO.n+' fades away...\n\n'+bk}
function endAtk(miss){let d=0;if(!miss)d=storyHit(0,Math.max(2,Math.abs(atk.x-260)<=6?25:Math.min(24,Math.round(25*(1-(Math.abs(atk.x-260)-6)/254)))));atkFx(d>0?[{k:0,d}]:[],d,miss?'* Miss...':'* '+d+' damage!')}
function doSub(){
if(players.length>1){coSub();return}
if(mi==1){if(subI==0)showMsg(BO.chk,startDodge);else if(bi){const a=ACTS[bi][subI-1];hapT=[a.t,a.t2];spare=Math.min(100,spare+a.m);if(a.adj)dmgAdj=a.adj;if(a.gr)greenTooth=1;showMsg(a.t,a.t2?()=>showMsg(a.t2,startDodge):startDodge)}
else if(subI==1){spare=Math.min(100,spare+BO.act);hapT=['* You dance! Prism sways.'];showMsg('* You dance! Prism sways.',startDodge)}else{spare=Math.min(100,spare+(BO.hum||BO.act/2));players.forEach(p=>{if(!p.down)p.hp=Math.min(p.max,p.hp+4)});hapT=['* You hum along. Prism starts to feel a little better.'];showMsg('* You hum along. Prism starts to feel a little better.',startDodge)}}
else if(mi==2){items--;const rev=players.some(p=>p.down&&!p.gone),low=rev||players.some(p=>!p.gone&&p.hp<p.max-12);players.forEach(p=>{if(p.gone)return;if(p.down){p.down=0;p.hp=Math.min(p.max,8)}else p.hp=Math.min(p.max,p.hp+12)});sfxPie(rev);showMsg('* You ate the Pink Pie.\n* It tastes a little... Corrupted?\n* '+(low?'You recovered 12 HP.':'Your HP was maxed out.')+(rev?'\n* Fallen allies get up!':''),startDodge)}
else{if(subI==1){stopMusic();S='flee';exT=performance.now();exSn=0}else if(spare>=100||lowHp())win(1);else{mbT=performance.now();startDodge()}}}
function press(c){const is=a=>a.includes(c);
if(ctlPop){popPress(c,is);return}
if(lvOpen&&!fromG){if(net.role){lvPress(is);return}lvOpen=0}
if(net.role=='guest'&&net.ok&&S!='lobby'){if(S=='boss'&&is(NO)){askLeave();return}if(S!='dodge'&&S!='boss')sendNet({t:'p',c:canonCode(c)});return}
if(S=='lobby'){if(is(NO))askLeave();else if(is(OK)&&net.role=='host')hostStart();return}
if(S=='set'){setPress(c,is);return}
if(S=='ctl'){ctlPress(c,is);return}
if(S=='src'){srcPress(c,is);return}
if(S=='keys'){keysPress(c,is);return}
if(players.length>1&&(S=='menu'||S=='tgt'||S=='sub'||S=='ptg')){const w=pressOwner(c);if(w>=0&&w!==pk)return}
if((S=='mode'||S=='boss')&&!net.role&&(gOn||is(U))){gearPress(c,is);return}
if(S=='mode'&&npOn){if(is(L)){npI=(npI+2)%3;AC&&sfxSel()}else if(is(R)){npI=(npI+1)%3;AC&&sfxSel()}else if(/^(Digit|Numpad)[2-4]$/.test(c)){mode=+c.slice(-1);npOn=0;S='boss'}else if(is(OK)){mode=npI+2;npOn=0;S='boss'}else if(is(NO))npOn=0;return}
if(S=='story'){storyPress(c,is);return}
if(S=='mode'){const dn=/^(Digit|Numpad)[1-4]$/.test(c)?+c.slice(-1)-1:-1;
if(dn>=0||is(OK)){if(dn>=0)ms=dn;if(ms==0)openStory();else if(ms==3)openLobby();else if(ms==2){npOn=1;npI=0}else{mode=1;S='boss'}}
else if(is(L)||is(R)){ms=(ms+(is(L)?3:1))%4;AC&&sfxSel()}}
else if(S=='boss'){if(fromG){}else if(is(L)){bi=(bi+2)%3;sfxNav()}else if(is(R)){bi=(bi+1)%3;sfxNav()}else if(/^(Digit|Numpad)[1-3]$/.test(c)){bi=+c.slice(-1)-1;sfxGo();startBattle()}else if(is(OK)){sfxGo();startBattle()}else if(is(NO)){if(!net.role){S='mode';npOn=mode>1?1:0;npI=Math.max(0,mode-2)}else if(!fromG)askLeave()}}
else if(S=='msg'){if(is(OK)){if(tc<TXT.length)tc=TXT.length;else nextFn()}}
else if(S=='menu'){if(is(L)){mi=(mi+3)%4;sfxNav()}else if(is(R)){mi=(mi+1)%4;sfxNav()}else if(is(OK)){if(mi<2)S='tgt';else{subI=0;sub=mi==2?(items>0?['Pink Pie x'+items]:[]):['Spare','Flee'];if(!sub.length)showMsg('* No items left.',players.length>1?menuAgain:toMenu);else S='sub'}}else if(is(NO)&&players.length>1)backPick()}
else if(S=='ptg'){if(is(U)||is(L)){ptI=ptStep(-1);sfxNav()}else if(is(Dn)||is(R)){ptI=ptStep(1);sfxNav()}else if(is(OK))rec({k:'i',t:ptI});else if(is(NO))S='sub'}
else if(S=='tgt'){if(is(OK)){if(mi==0){if(players.length>1)rec({k:'f'});else{S='atk';atk={x:0}}}else{subI=0;sub=bi?['Check',...ACTS[bi].map(a=>a.n)]:['Check','Dance','Hum'];S='sub'}}else if(is(NO))S='menu'}
else if(S=='sub'){if(is(U)){subI=(subI+sub.length-1)%sub.length;if(sub.length>1)sfxNav()}else if(is(Dn)){subI=(subI+1)%sub.length;if(sub.length>1)sfxNav()}else if(is(OK))doSub();else if(is(NO))S=mi==1?'tgt':'menu'}
else if(S=='atk'){if(players.length>1){if(is(OK))stopBar(pressOwner(c))}else if(is(OK))endAtk(0)}
else if(S=='lose'){if(!(players.length>1&&pressOwner(c)>0)){const t=(performance.now()-loseT0)/1000;if(t<LOSE_MENU||loseGo){}else if(is(L)){if(loseI)sfxNav();loseI=0}else if(is(R)){if(!loseI)sfxNav();loseI=1}else if(is(U)||is(Dn)){sfxNav();loseI=1-loseI}else if(is(OK)&&t>LOSE_MENU+.1){if(loseI){S='lexit';exT=performance.now();exSn=0}else loseGo=performance.now()}}}
else if(S=='win'){if((c=='KeyR'||is(OK))&&!wxT){if(tc<winTxt.length)tc=winTxt.length;else wxT=performance.now()}}}
function update(dt){shake=Math.max(0,shake-dt*30);flash=Math.max(0,flash-dt);bhurt=Math.max(0,bhurt-dt);pollPads();
if(net.role=='guest'){gUpdate(dt);return}
if(S=='intro'&&(performance.now()-introT)/1000>=2){startMusic(BO);toMenu()}
if(S=='slash')slashStep();if(S=='win'&&wxT&&net.role!='guest'&&performance.now()-wxT>=600){wxT=0;if(!storyReturn())S='boss';fiT=performance.now()}
if(net.role!='host')players.forEach(p=>{p.rem=0});
if(mus){if(AC&&AC.state=='running')bt=(AC.currentTime-mus.t0)/mus.spb;else{bt+=dt/mus.spb;if(AC)mus.t0=AC.currentTime-bt*mus.spb}}else bt=0;tc+=dt*36;if(S=='win')wanim+=dt;
if(S=='atk'){if(players.length>1){fb.forEach(b=>{if(!b.done){b.x+=dt*347;if(b.x>=520){b.x=520;b.done=1;b.miss=1}}});if(fb.length&&fb.every(b=>b.done)){fbDone+=dt;if(fbDone>.45){fbDone=0;finishBars()}}}else{atk.x+=dt*480;if(atk.x>=520){atk.x=520;endAtk(1)}}return}
if(S!='dodge')return;
while(ei<ev.length&&tb+ev[ei].b<=bt){const e=ev[ei++];hz.push({...e,b:tb+e.b})}
for(const h of hz){const age=bt-h.b;
if(h.t=='burst'&&age>=h.warn){h.dead=1;const a0=Math.random()*6.28,sp=BO.rs*.75;for(let i=0;i<h.n;i++){const a=a0+i*6.2832/h.n;hz.push({t:'b',x:h.x,y:h.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:7})}}
else if(h.t=='rect'&&age>=h.warn+h.dur)h.dead=1;
else if(h.t=='sq'&&age>=h.warn+h.dur)h.dead=1;
else if(h.t=='hs'&&age>=h.life+JR)h.dead=1;
else if(h.t=='jaw'){if(!h.bit&&age>=h.warn+JB){h.bit=1;shake=10;noise(T0(),.2,.5,400);tone(90,T0(),.22,'square',.3,40)}if(age>=h.warn+JB+JH+JR)h.dead=1}
else if(h.t=='sun'&&age>=h.warn){h.dead=1;for(let j=0;j<8;j++){const a=h.a+j*Math.PI/4;hz.push({t:'b',x:h.x+Math.cos(a)*28,y:h.y+Math.sin(a)*28,vx:Math.cos(a)*h.sp,vy:Math.sin(a)*h.sp,r:7,a})}}
else if(h.t=='sb'&&age>=h.warn){h.dead=1;const a0=Math.random()*6.28,sp=BO.rs*.6;for(let i=0;i<h.n;i++){const a=a0+i*6.2832/h.n;hz.push({t:'b',x:h.x,y:h.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:9,a,spl:bt+1.2})}}
else if(h.t=='ln'&&age>=h.warn+h.dur)h.dead=1;
else if(h.t=='slam'&&age>=h.warn){h.dead=1;shake=12;noise(T0(),.3,.5,300);tone(80,T0(),.35,'sine',.4,35);for(let i=0;i<8;i++){const x=BX+40+i*(BW-80)/7,a=-Math.PI/2+(Math.random()-.5)*.6;hz.push({t:'b',x,y:BY+BH-8,vx:Math.cos(a)*260,vy:Math.sin(a)*260,r:7,a})}}
else if(h.t=='b'){h.x+=h.vx*dt;h.y+=h.vy*dt;const mx=h.m||20;if(h.x<BX-mx||h.x>BX+BW+mx||h.y<BY-30||h.y>BY+BH+20)h.dead=1;
else if(h.spl&&bt>=h.spl){h.dead=1;const sp=Math.hypot(h.vx,h.vy)*1.1;for(const d of[-.5,.5]){const a=h.a+d;hz.push({t:'b',x:h.x,y:h.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:6,a})}}}}
hz=hz.filter(h=>!h.dead);
for(const p of players){upd(p,dt);if(p.down)continue;
for(const h of hz){if(h.t=='rect'&&bt-h.b>=h.warn){if(p.x+7>h.x&&p.x-7<h.x+h.w&&p.y+7>h.y&&p.y-7<h.y+h.h)hurt(p)}
else if(h.t=='hs')hsTouch(h,p);
else if(h.t=='ln'){if(bt-h.b>=h.warn&&segDist(p.x,p.y,h)<13)hurt(p)}
else if(h.t=='jaw'){if(jawHit(h,p))hurt(p);else jawHeal(h,p)}
else if(h.t=='sq'){const a=bt-h.b;if(a>=h.warn&&a<h.warn+h.dur-.1&&Math.max(0,Math.abs(p.x-h.x)-7)+Math.max(0,Math.abs(p.y-h.y)-7)<h.s*.7071)hurt(p)}
else if(h.t=='b'&&Math.hypot(h.x-p.x,h.y-p.y)<h.r+6)hurt(p)}}
for(const p of players)if(p.down&&!p.gone){const o=players.find(q=>q!==p&&!q.down&&Math.hypot(q.x-p.x,q.y-p.y)<36);
if(o){p.rev+=dt;if(p.rev>=5){p.down=0;p.hp=10;p.inv=1.5;sfxUp()}}else p.rev=Math.max(0,p.rev-dt)}
if(players.every(p=>p.down)){loseInit(lastDn);S='lose';stopMusic();return}
if(bt>=tb+TL){hz=[];turn++;curFl=pickFl();toMenu()}}
/* ---------- drawing ---------- */
function txt(s,x,y,sz,col,al,mx,raw){s=raw?String(s):lx(s);al=al||'left';const f=n=>'bold '+n+'px monospace'+(FONTS[SET.lang]?','+FONTS[SET.lang]:'')+',sans-serif';g.font=f(sz);g.fillStyle=col||'#fff';g.textAlign=al;const mw=mx||(al=='center'?2*Math.min(x,W-x)-24:al=='right'?x-12:W-x-12),w=g.measureText(s).width;if(w>mw&&mw>40)g.font=f(sz*mw/w);g.fillText(s,x,y)}
function lines(t,x,y,sz,col){t.split('\n').forEach((l,i)=>txt(l,x,y+i*34,sz,col))}
const DIFFC={EASY:'#7dff3d',NORMAL:'#ff0',HARD:'#ff3030'};
function msgLines(vis,full,x,y,sz){
  const fl=full.split('\n'),DK=['EASY','NORMAL','HARD'],dw=DK.map(lx);
  vis.split('\n').forEach((l,i)=>{
    const m=/^(\* [^:\uff1a]+[:\uff1a] ?)(.+)$/.exec(fl[i]||''),k=m?dw.indexOf(m[2]):-1,p=k>=0?m[1].length:0;
    if(k>=0&&l.length>p){
      txt(m[1],x,y+i*34,sz);
      const w=g.measureText(m[1]).width;
      txt(l.slice(p),x+w,y+i*34,sz,DIFFC[DK[k]]);
    }else txt(l,x,y+i*34,sz);
  });
}
function drawBoss(i,x,y,pu,sc,pure,hurt,low,happy){const lw=low&&!hurt&&!pure,hy=happy&&!hurt&&!low&&!pure;g.save();g.translate(x,y);g.scale(sc,sc);const c=pure?PUREC[i]:i==0?'#ff7eb3':i==1?PINK:'#ff0a54';g.fillStyle=c;
if(i==0){g.save();g.rotate(Math.PI/4);const s=46+10*pu;g.fillRect(-s/2,-s/2,s,s);g.restore();if(pure){g.strokeStyle='#345';g.lineWidth=4;g.lineCap='round';g.beginPath();g.arc(-10,-3,6,Math.PI,0);g.stroke();g.beginPath();g.arc(10,-3,6,Math.PI,0);g.stroke();g.beginPath();g.arc(0,6,11,.25,Math.PI-.25);g.stroke();g.lineCap='butt'}else{g.fillStyle='#000';if(hurt){g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(-14,-9);g.lineTo(-6,-4);g.lineTo(-14,1);g.moveTo(14,-9);g.lineTo(6,-4);g.lineTo(14,1);g.stroke()}else if(lw){[-11.5,11.5].forEach(ex=>{g.fillStyle='#000';g.fillRect(ex-8,-10,16,16);g.fillStyle='#fff';g.beginPath();g.arc(ex-3,-6.2,3.4,0,6.29);g.fill();g.beginPath();g.arc(ex+3.2,-.5,1.7,0,6.29);g.fill()})}else if(hy){g.strokeStyle='#000';g.lineWidth=3;g.lineJoin='miter';g.beginPath();g.moveTo(-14,-2);g.lineTo(-10,-8);g.lineTo(-6,-2);g.moveTo(6,-2);g.lineTo(10,-8);g.lineTo(14,-2);g.stroke()}else{g.fillRect(-14,-9,8,10);g.fillRect(6,-9,8,10)}if(lw){g.strokeStyle='#000';g.lineWidth=3;g.lineCap='round';g.beginPath();g.arc(0,24,11,Math.PI+.55,-.55);g.stroke();g.lineCap='butt'}else{g.fillStyle='#000';g.fillRect(-10,13,20,4)}}}
else if(i==1){g.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8+bt*.3,r=(k%2?(pure?44:30):50)+8*pu;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,0,15,0,6.29);g.fill();g.fillStyle='#000';if(lw){const rot=SET.reduceFlash?0:performance.now()/500;g.strokeStyle='#000';g.lineWidth=1.7;g.lineCap='round';g.lineJoin='round';g.beginPath();for(let k=0;k<=60;k++){const a=k*.35+rot,r=1+k*.15;g[k?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}g.stroke();g.lineCap='butt'}else if(hy){g.beginPath();g.arc(0,0,7,0,6.29);g.fill();g.save();g.beginPath();g.arc(0,0,16,0,6.29);g.clip();g.fillStyle=c;g.beginPath();g.moveTo(-17,8.5);g.quadraticCurveTo(0,-2.5,17,8.5);g.lineTo(17,20);g.lineTo(-17,20);g.closePath();g.fill();g.restore()}else{g.beginPath();g.arc(0,0,hurt?3.5:7,0,6.29);g.fill()}}
else if(i==3)drawStarSoulcerer(pu,pure,hurt,low);
else{g.fillRect(-72,-12,144,54);if(!pure)for(let k=0;k<4;k++){const dx=18*2/(22+6*pu),l=k?-72+k*36-dx:-72,r=k<3?-36+k*36+dx:72;g.beginPath();g.moveTo(l,-10);if(!k)g.lineTo(-72,-12);g.lineTo(-54+k*36,-34-6*pu);if(k==3)g.lineTo(72,-12);g.lineTo(r,-10);g.fill()}
if(hurt&&!pure){g.fillStyle='#fff';g.beginPath();g.ellipse(-40,5,9,3.5,0,0,6.29);g.fill();g.fillStyle='#000';g.fillRect(-42,2,4,6);g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(5,-1);g.lineTo(-4,5);g.lineTo(5,11);g.moveTo(35,0);g.lineTo(45,10);g.moveTo(45,0);g.lineTo(35,10);g.stroke()}else{g.fillStyle='#fff';[-40,0,40].forEach(ex=>{g.beginPath();g.arc(ex,5,9,0,6.29);g.fill()});g.fillStyle=pure?'#345':'#000';[-40,0,40].forEach(ex=>{if(pure){g.beginPath();g.arc(ex,5,4,0,6.29);g.fill()}else if(lw&&ex<40)g.fillRect(ex-1,-1,2,12);else if(hy){g.beginPath();g.arc(ex,5,5.5,0,6.29);g.fill()}else g.fillRect(ex-2,0,4,10)});if(lw){g.fillStyle=c;g.beginPath();g.moveTo(30,-5);g.lineTo(50,-5);g.lineTo(50,7.8);g.lineTo(30,2.2);g.closePath();g.fill();g.strokeStyle='#000';g.lineWidth=2.5;g.beginPath();g.moveTo(32,2.8);g.lineTo(48,7.2);g.stroke()}}
if(lw){const Z=[[-60,32],[-50,30],[-30,38],[-10,30],[10,38],[30,30],[50,38],[70,30]],poly=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach((p,k)=>g[k?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fill()},U=Z.map(p=>[p[0],p[1]-11]),D=Z.map(p=>[p[0],p[1]+2]);g.fillStyle='#000';g.fillRect(-63,17,134,24);poly([[-60,19]].concat(U),'#fff');poly(D.concat([[70,40],[-60,40]]),'#fff')}else{g.strokeStyle=pure?'#345':'#000';g.lineWidth=3;g.beginPath();if(pure)g.arc(0,22,14,.2,Math.PI-.2);else{g.moveTo(-60,32);for(let k=0;k<7;k++)g.lineTo(-60+k*20+10,k%2?38:30)}g.stroke()}}
g.restore()}
/* distance from a point to a constellation line segment {x1,y1,x2,y2} */
function segDist(px,py,h){const dx=h.x2-h.x1,dy=h.y2-h.y1,l=dx*dx+dy*dy,u=l?Math.max(0,Math.min(1,((px-h.x1)*dx+(py-h.y1)*dy)/l)):0;return Math.hypot(px-h.x1-u*dx,py-h.y1-u*dy)}
/* Star Soulcerer (story boss): white armored star with a dark visor; pink corruption cracks (more at low HP); gold when pure. Its face is never shown. */
function drawStarSoulcerer(pu,pure,hurt,low){const R=58+6*pu,pts=[],now=performance.now(),RF=SET.reduceFlash;
for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?25:R;pts.push([Math.cos(a)*rr,Math.sin(a)*rr])}
const glow=(col,r)=>{const gl=g.createRadialGradient(0,0,10,0,0,r);gl.addColorStop(0,col);gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(-r,-r,2*r,2*r)};
if(pure)glow('rgba(255,226,122,.45)',95);else if(low)glow('rgba(255,45,117,.35)',90);
g.fillStyle=pure?'#ffe27a':hurt?'#ffd0de':'#f2f2f2';g.beginPath();pts.forEach((p,k)=>g[k?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fill();
const silver=pure?'#e8eef4':'#aab4c0',edge=pure?'#c9a640':'#5d6773';
[-1,1].forEach(s=>{g.save();g.rotate(s*Math.PI*2/5);g.fillStyle=silver;g.beginPath();g.moveTo(-13,-24);g.lineTo(13,-24);g.lineTo(9,-40);g.lineTo(-9,-40);g.closePath();g.fill();g.strokeStyle=edge;g.lineWidth=2;g.stroke();g.restore()});
g.fillStyle=silver;g.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;g[k?'lineTo':'moveTo'](Math.cos(a)*27,Math.sin(a)*27+4)}g.closePath();g.fill();g.strokeStyle=edge;g.lineWidth=2.5;g.stroke();
const vy=pure?-12:-4;g.save();if(pure){g.translate(0,vy);g.rotate(-.12);g.translate(0,-vy)}
g.fillStyle='#14161c';g.fillRect(-17,vy-6,34,13);g.fillStyle=pure?'#ffe27a':hurt?'#fff':low?PINK:'#ff7eb3';g.fillRect(-13,vy-1,26,3);g.restore();
if(pure){g.fillStyle='rgba(255,250,220,.9)';g.fillRect(-12,-3,24,4);return}
const cr=low?[[0,-6,-22,-40,-12,-50],[6,6,30,14,48,8],[-8,10,-20,34,-34,40],[10,12,16,36,24,48],[-6,-10,10,-34,4,-52]]:[[6,6,30,14,48,8],[-8,10,-20,34,-34,40]];
g.strokeStyle=PINK;g.lineWidth=low?3.5:3;g.lineJoin='round';cr.forEach(c=>{g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[2],c[3]);g.lineTo(c[4],c[5]);g.stroke()});g.lineJoin='miter';
if(low){g.fillStyle=PINK;for(let k=0;k<6;k++){const a=k*1.1+(RF?0:now/600),d=60+(RF?0:8*Math.sin(k*3+now/300));g.fillRect(Math.cos(a)*d-3,Math.sin(a)*d-3,6,6)}}}
addTR({"IT'S OVER":["SE ACABÓ","C'EST FINI","もう終わりだ","結束了","结束了","È FINITA","ES IST VORBEI","ВСЁ КОНЧЕНО","BİTTİ"],"Stay determined...":["Mantente decidido...","Reste déterminé...","あきらめるな...","保持決心……","坚定你的决心……","Resta determinato...","Bleib entschlossen...","Не сдавайся...","Kararlı kal..."],"RETRY":["REINTENTAR","RÉESSAYER","リトライ","重試","重试","RIPROVA","NOCHMAL","ЗАНОВО","TEKRAR DENE"],"BOSS SELECT":["ELEGIR JEFE","CHOIX DU BOSS","ボス選択","選擇首領","选择首领","SCELTA BOSS","BOSS-AUSWAHL","ВЫБОР БОССА","BOSS SEÇİMİ"]});
function loseInit(k){const q=players[k];loseK=q&&!q.gone?k:Math.max(0,players.findIndex(p=>!p.gone));loseT0=performance.now();loseI=0;loseGo=0}
function sfxNav(){if(AC)tone(660,T0(),.05,'triangle',.12)}
function sfxGo(){if(!AC)return;tone(660,T0(),.08,'sine',.16);tone(990,T0()+.07,.14,'sine',.16);tone(1320,T0()+.14,.2,'sine',.1)}
function sfxPie(rev){if(!AC)return;noise(T0(),.05,.12,1800);noise(T0()+.09,.05,.1,1800);tone(523,T0()+.22,.2,'sine',.16);tone(659,T0()+.3,.2,'sine',.16);tone(784,T0()+.38,.3,'sine',.16);tone(1047,T0()+.46,.45,'sine',.14);if(rev){tone(1568,T0()+.62,.5,'sine',.1);tone(2093,T0()+.7,.5,'sine',.08)}}
let slL=[],slMsg='',slT=0,slHit=0,slAll=[];const slSeen=new Set();
function sfxSlash(st){if(!AC)return;noise(T0(),.14,.14,4000);tone(2200,T0(),.12,'sawtooth',.07,500);if(st>1){tone(140,T0()+.06,.3,'sine',.3,50);tone(2600,T0()+.1,.1,'sawtooth',.05,700)}}
function atkFx(h,tot,msg){if(!h.length){flash=.5;shake=0;showMsg(msg,bhp<=0?()=>win(0):startDodge);return}
slL=h.map((x,i)=>({d:x.d,at:i*.25}));slMsg=msg;slT=performance.now();slHit=0;
h.forEach((x,i)=>slAll.push({id:Math.floor(Math.random()*1e9),t0:slT+i*250,col:PCOL[x.k],st:((q)=>q>=25?2:q>=12?1:0)(x.q==null?x.d:x.q),snd:0}));S='slash'}
function slashStep(){const e=(performance.now()-slT)/1000;while(slHit<slL.length&&e>=slL[slHit].at+.12){bhp=Math.max(0,bhp-slL[slHit].d);flash=.5;shake=6;bhurt=1;slHit++}
if(e>=slL[slL.length-1].at+.55)showMsg(slMsg,bhp<=0?()=>win(0):startDodge)}
function slSnap(){const n=performance.now();return slAll.filter(s=>n-s.t0<700).map(s=>({i:s.id,e:+((n-s.t0)/1000).toFixed(2),c:s.col,s:s.st}))}
function slApply(a){if(!a)return;a.forEach(x=>{if(!slSeen.has(x.i)){slSeen.add(x.i);slAll.push({id:x.i,t0:performance.now()-x.e*1000,col:x.c,st:x.s,snd:0})}});if(slSeen.size>80)slSeen.clear()}
function drawSlash(){const now=performance.now(),cl=(v,a,b)=>Math.max(0,Math.min(1,(v-a)/(b-a)));slAll=slAll.filter(s=>now-s.t0<900);if(!slAll.length)return;
g.save();g.setTransform(1,0,0,1,0,0);
slAll.forEach(s=>{const e=(now-s.t0)/1000;if(e<0)return;if(!s.snd){s.snd=1;if(e<.3)sfxSlash(s.st)}
const L=[80,105,120][s.st],wd=[7,9,11][s.st],cx=W/2,cy=100,
stroke=(m,e0)=>{if(e0<0||e0>.35)return;const hd=1-Math.pow(1-cl(e0,0,.12),3),tl=Math.min(hd,Math.pow(cl(e0,.1,.3),2)),a=1-cl(e0,.22,.35),N=14,top=[],bot=[],ix=[];
for(let i=0;i<=N;i++){const p=tl+(hd-tl)*i/N,x=cx+m*(L*.8-1.6*L*.8*p),y=cy-L*.75+1.5*L*.75*p,hw=wd*Math.sin(Math.PI*i/N)*(.6+.4*(1-p)),nx=.9*m,ny=.8;const nl=Math.hypot(nx,ny);top.push([x+nx/nl*hw,y+ny/nl*hw]);bot.push([x-nx/nl*hw,y-ny/nl*hw]);ix.push([x,y,hw])}
g.globalAlpha=a*.9;g.fillStyle=s.col;g.beginPath();top.forEach((q,i)=>g[i?'lineTo':'moveTo'](q[0],q[1]));for(let i=N;i>=0;i--)g.lineTo(bot[i][0],bot[i][1]);g.closePath();g.fill();
g.globalAlpha=a;g.fillStyle='#fff';g.beginPath();ix.forEach((q,i)=>g[i?'lineTo':'moveTo'](q[0]+q[2]*.18*m,q[1]-q[2]*.18));for(let i=N;i>=0;i--)g.lineTo(ix[i][0]-ix[i][2]*.18*m,ix[i][1]+ix[i][2]*.18);g.closePath();g.fill()};
stroke(1,e);if(s.st>1)stroke(-1,e-.08)});
g.restore()}
let wxT=0;
function drawWx(){const a=Math.min(1,(performance.now()-wxT)/500);g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=a;g.fillStyle='#000';g.fillRect(0,0,W,H);g.restore()}
let mbT=0;
let exT=0,exSn=0,fiT=0;
function drawFi(){if(!fiT)return;const a=1-Math.min(1,(performance.now()-fiT)/400);if(a<=0){fiT=0;return}g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=a;g.fillStyle='#000';g.fillRect(0,0,W,H);g.restore()}
function drawFlee(){const tf=(performance.now()-exT)/1000,cl=(v,a,b)=>Math.max(0,Math.min(1,(v-a)/(b-a))),X=q=>q<.3?572:q<.45?572+10*cl(q,.3,.45):582-642*Math.pow(cl(q,.45,.95),2.2);
if(exSn<1&&tf>=.3){if(tf<.6)tone(330,T0(),.06,'triangle',.1);exSn=1}
if(exSn<2&&tf>=.45){if(tf<.75){tone(1000,T0(),.3,'sine',.12,180);noise(T0(),.28,.06,2500)}exSn=2}
g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=cl(tf,0,.3);g.fillStyle='#000';g.fillRect(0,0,W,H);
if(tf>.47)for(let i=8;i>=1;i--){const x=X(tf-i*.025);if(x>-30){g.globalAlpha=.45*(1-i/9);soul(x,547,'#19e3ff',0)}}
const x=X(tf);if(x>-30){g.globalAlpha=1;soul(x,547,'#19e3ff',0)}
g.restore();
if(tf>=1.25&&net.role!='guest'){if(!storyReturn())S='boss';fiT=performance.now()}}
let introT=0,introSn=0;
function drawIntro(){const ti=(performance.now()-introT)/1000,cl=(v,a,b)=>Math.max(0,Math.min(1,(v-a)/(b-a))),io=v=>v<.5?2*v*v:1-Math.pow(-2*v+2,2)/2,EV=[.3,.45,.6,.75,.9,1.05,1.4];
while(introSn<EV.length&&ti>=EV[introSn]){if(ti-EV[introSn]<.25){if(introSn<6)tone(990,T0(),.05,'square',.08);else{tone(260,T0(),.45,'sine',.18,1100);noise(T0(),.35,.05,2500)}}introSn++}
g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1-cl(ti,1.4,2);g.fillStyle='#000';g.fillRect(0,0,W,H);
const u=io(cl(ti,1.4,2)),x=W/2+(122-W/2)*u,y=H/2+(547-H/2)*u,v=ti<.3?0:ti<1.2?(SET.reduceFlash?.6+.4*Math.cos(2*Math.PI*(ti-.3)/.3):(Math.floor((ti-.3)/.075)%2?0:1)):1;
if(v>0){g.globalAlpha=v;soul(x,y,'#19e3ff',0)}
g.restore()}
const LOSE_MENU=4.2,LOSEP=[[[-9,-9],[7,-10],[10,0],[-4,9]],[[-8,-10],[9,-6],[5,10],[-10,5]],[[-6,-8],[10,-10],[8,8],[-9,9],[-10,-1]],[[-10,-5],[1,-10],[10,4],[-2,10]],[[-8,-9],[8,-8],[10,5],[-8,10]],[[-10,-10],[9,-3],[-3,9]],[[-9,-7],[5,-10],[10,8],[-7,10]]],NOT3={en:["IT'S","NOT","OVER"],es:["","NO","SE ACABÓ"],fr:["C'EST","PAS","FINI"],ja:["まだ終わり","じゃない",""],'zh-TW':["還","沒","結束"],'zh-CN':["还","没","结束"],it:["","NON","È FINITA"],de:["ES IST NOCH","NICHT","VORBEI"],ru:["ЕЩЁ","НЕ","КОНЧЕНО"],tr:["BİT","ME","Dİ"]};let loseGo=0;
let loseSn=0;const LEV=[0,.35,1.6,1.9,2.6],LSFX=[
()=>{tone(784,T0(),.1,'sine',.12);tone(1175,T0()+.06,.14,'sine',.08)},
()=>{[0,4,7,12,16,19].forEach((m,i)=>tone(mtof(72+m),T0()+i*.17,.5,'sine',.03+.012*i));tone(200,T0(),1.2,'sine',.05,900)},
()=>{tone(1568,T0(),.7,'sine',.14);tone(2093,T0()+.02,.55,'sine',.08);tone(110,T0(),.3,'sine',.35,50);tone(100,T0()+.2,.25,'sine',.2,45)},
()=>{tone(392,T0(),.28,'triangle',.22);tone(784,T0(),.4,'sine',.16);tone(1175,T0()+.04,.3,'sine',.07)},
()=>{tone(300,T0(),.85,'sine',.12,1400);noise(T0(),.7,.035,3000)}];
function drawLose(){if(!loseGo)loseSn=0;else{const q=(performance.now()-loseGo)/1000;while(loseSn<LEV.length&&q>=LEV[loseSn]){if(q-LEV[loseSn]<.3)LSFX[loseSn]();loseSn++}}const now=performance.now(),t=(now-loseT0)/1000,tr=loseGo?(now-loseGo)/1000:-1,p=players[loseK],px=p?p.x:BX+BW/2,py=p?p.y:BY+BH/2,col=p?p.col:PCOL[0],k=p?p.i:0,cl=(v,a,b)=>Math.max(0,Math.min(1,(v-a)/(b-a))),ez=v=>1-Math.pow(1-v,3),io=v=>v<.5?2*v*v:1-Math.pow(-2*v+2,2)/2,ov=loseGo?1-cl(tr,3.1,3.5):1,ex=S=='lexit'?(now-exT)/1000:-1,uf=loseGo?1-cl(tr,0,.35):ex>=0?1-cl(ex,0,.3):1,tf=Math.max(0,tr-2.6),sqy=250-(40*tf+420*tf*tf);
g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=cl(t,0,.1);g.fillStyle='#000';g.fillRect(0,0,W,H);g.globalAlpha=1;
if(t<1.75){const a=t<.25?0:t<1.25?1+2.5*cl(t,.25,1.25):1.2,x=px+Math.sin(t*95)*a,y=py+Math.cos(t*79)*a;soul(x,y,col,k);
if(t>1.25){const f=cl(t,1.25,1.5),pts=[[-1,-10],[3,-3],[-3,2],[1,10]],n=pts.length-1;g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(x+pts[0][0],y+pts[0][1]);for(let i=0;i<n;i++){const u=Math.max(0,Math.min(1,f*n-i));if(u<=0)break;g.lineTo(x+pts[i][0]+(pts[i+1][0]-pts[i][0])*u,y+pts[i][1]+(pts[i+1][1]-pts[i][1])*u)}g.stroke()}}
else{const s=t-1.75;if(s<1.4){const an=[-2.6,-2,-1.4,-.9,-.4,.3,.9],sp=[150,190,230,170,210,160,200],sz=[4,5,6,4,5,3,4],sn=[5,-6,4,-5,6,-4,5];g.fillStyle=col;g.globalAlpha=1-s/1.4;for(let j=0;j<7;j++){const x=px+Math.cos(an[j])*sp[j]*s,y=py+Math.sin(an[j])*sp[j]*s+260*s*s;g.save();g.translate(x,y);g.rotate(sn[j]*s);g.beginPath();g.moveTo(0,-sz[j]);g.lineTo(sz[j],sz[j]);g.lineTo(-sz[j],sz[j]);g.closePath();g.fill();g.restore()}g.globalAlpha=1}}
if(!loseGo||tr<1.6){g.globalAlpha=cl(t,2.9,3.4)*ov;g.fillStyle='#19e3ff';LOSEP.forEach((q,j)=>{const x0=W/2+(j-3)*36,u=loseGo?io(cl(tr,.35,1.5)):0,cx=x0+(W/2-x0)*u,sc=1-.7*u,s2=ex>=0?Math.max(0,ex-.15-j*.1):0;g.save();g.translate(cx,250+450*s2*s2);g.rotate(s2*(j%2?3:-3));g.beginPath();q.forEach((v,i)=>g[i?'lineTo':'moveTo'](v[0]*sc,v[1]*sc));g.closePath();g.fill();g.restore()})}
if(loseGo&&tr>.5){const gi=(tr<1.6?cl(tr,.5,1.6):1-.8*cl(tr,1.6,2.6))*(1-cl(tr,2.6,3.2)),R=15+105*gi,A=Math.min(1,gi*1.1),gr=g.createRadialGradient(W/2,sqy,0,W/2,sqy,R);gr.addColorStop(0,'rgba(255,255,255,'+A+')');gr.addColorStop(.35,'rgba(170,245,255,'+A*.6+')');gr.addColorStop(1,'rgba(25,227,255,0)');g.globalAlpha=1;g.fillStyle=gr;g.fillRect(W/2-R,sqy-R,2*R,2*R)}
if(loseGo&&!SET.reduceFlash&&tr>1.55&&tr<1.9){g.globalAlpha=.22*cl(tr,1.55,1.6)*(1-cl(tr,1.6,1.9));g.fillStyle='#fff';g.fillRect(0,0,W,H)}
if(loseGo&&tr>=1.6){const sc=1+.9*(1-ez(cl(tr,1.6,1.95)));g.globalAlpha=1;g.save();g.translate(W/2,sqy+(tr<2.6?Math.sin(tr*7)*2:0));g.scale(sc,sc);soul(0,0,'#19e3ff',0);g.restore()}
const tAl=cl(t,2.7,3.3)*ov*(ex>=0?1-cl(ex,.9,1.6):1);
if(loseGo&&tr>=1.9){const lg=SET.lang,P=NOT3[lg]||NOT3.en,jn=['ja','zh-TW','zh-CN','tr'].includes(lg)?'':' ',orig=lx("IT'S OVER"),tt=cl(tr,1.9,2.4),u=ez(tt);g.font='bold 72px monospace'+(FONTS[lg]?','+FONTS[lg]:'')+',sans-serif';const w=P.map(s=>g.measureText(s).width),spw=jn?g.measureText(jn).width:0,wo=g.measureText(orig).width,tot=w.reduce((a,b)=>a+b,0)+spw*(P.filter(Boolean).length-1),sz=tot>640?72*640/tot:72,m=sz/72,xs=[];let x=W/2-tot*m/2;P.forEach((s,i)=>{xs[i]=x;if(s)x+=(w[i]+spw)*m});
const sl=[P[0],P[2]].filter(Boolean).join(jn)==orig,a0=W/2-wo/2,c0=a0+(P[0]?w[0]+spw:0),dr=(s,x,c,al)=>{if(s){g.globalAlpha=al;txt(s,x,150,sz,c,'left',2000)}};
if(sl){dr(P[0],a0+(xs[0]-a0)*u,'#19e3ff',tAl);dr(P[2],c0+(xs[2]-c0)*u,'#19e3ff',tAl)}else{g.globalAlpha=(1-tt)*tAl;txt("IT'S OVER",W/2,150,72,'#19e3ff','center',640);dr(P[0],xs[0],'#19e3ff',tt*tAl);dr(P[2],xs[2],'#19e3ff',tt*tAl)}dr(P[1],xs[1],'#fff',tt*tAl)}
else{g.globalAlpha=tAl;txt("IT'S OVER",W/2,150,72,'#19e3ff','center',640)}
g.globalAlpha=cl(t,3.3,3.8)*uf;txt('Stay determined...',W/2,340,22,'#fff','center',640);
g.globalAlpha=cl(t,3.8,4.2)*uf;[['RETRY',W/2-215],[storyFighting()?'VILLAGE':'BOSS SELECT',W/2+25]].forEach((b,i)=>{const on=loseI==i,c=on?'#ff0':'#ff9d00';g.strokeStyle=c;g.lineWidth=3;g.strokeRect(b[1],410,190,46);txt(b[0],b[1]+95,441,22,c,'center',170);if(on)txt('P1',b[1]-8,441,18,PCOL[0],'right')});
g.globalAlpha=1;g.restore();
if(ex>=0){while(exSn<7&&ex>=.15+exSn*.1){if(ex-(.15+exSn*.1)<.3){const f=mtof(84-exSn*2);tone(f,T0(),.25,'sine',.08,f/2)}exSn++}if(ex>=1.8&&net.role!='guest'){if(!storyReturn())S='boss';fiT=performance.now()}}if(loseGo&&tr>=3.5){if(net.role=='guest'){if(S!='lose')loseGo=0}else{if(S=='lose')startBattle();loseGo=0}}}
function shp(x,y,s,k){g.beginPath();if(k==1){g.moveTo(x,y-s-1);g.lineTo(x+s+1,y+s);g.lineTo(x-s-1,y+s)}else if(k==2){for(let j=0;j<5;j++){const a=-Math.PI/2+j*Math.PI*.4,r=s*1.2;j?g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}}else if(k==3){g.arc(x,y,s*1.1,0,7)}else g.rect(x-s,y-s,s*2,s*2);g.closePath()}
function soul(x,y,col,tri,out){if(out){g.fillStyle='#fff';shp(x,y,10,tri);g.fill()}g.fillStyle=col;shp(x,y,8,tri);g.fill()}
function draw(){g.setTransform(1,0,0,1,0,0);g.fillStyle='#000';g.fillRect(0,0,W,H);
if(S=='set'||S=='ctl'||S=='src'||S=='keys'){const k=S;S=setFrom;try{draw()}finally{S=k}if(k=='set')drawSet();else if(k=='ctl')drawCtl();else if(k=='src')drawSrc();else drawKeys();return}drawBG();
if(S=='story'){drawStory();return}
if(S=='lobby'){txt('SOUL x BEAT',W/2,90,60,'#19e3ff','center');txt('ONLINE CO-OP',W/2,140,24,'#ff0','center');if(net.ok&&net.role=='guest')txt('Connected! Waiting for the host...',W/2,200,18,'#7dff3d','center');return}
if(S=='mode'||S=='boss'){if(!net.role){drawGear();if(gOn)txt('Settings',W/2,565,20,'#ff0','center')}txt('SOUL x BEAT',W/2,90,60,'#19e3ff','center');txt('an Undertale / Just Shapes & Beats inspired fan mashup',W/2,125,15,'#aaa','center');
if(S=='mode'&&npOn){txt('HOW MANY PLAYERS?',W/2,190,22,'#fff','center');[2,3,4].forEach((n,i)=>{const cx=150+i*250,on=!gOn&&npI==i,top=255;txt(n+' PLAYERS',cx,243,16,on?'#ff0':'#888','center');g.strokeStyle=on?'#ff0':'#444';g.lineWidth=on?4:2;g.strokeRect(cx-90,top,180,140);const row=(y,ks)=>ks.forEach((k,j)=>{g.fillStyle=PCOL[k];shp(cx+(j-(ks.length-1)/2)*56,y,14,k);g.fill()});if(n==2)row(top+70,[0,1]);else{row(top+45,[0,1]);row(top+95,n==3?[2]:[2,3])}});
txt('Left / Right to choose, Enter / Z / A to confirm (or press 2, 3 or 4), X / B to go back',W/2,430,15,'#bbb','center');
txt(keyHint(0)+'    '+keyHint(1),W/2,460,15,'#bbb','center');
txt(keyHint(2)+'    '+keyHint(3),W/2,482,15,'#bbb','center');
txt('Controllers: D-pad/stick to move, A to confirm and dash. Pads 1 to 4 = P1 to P4.',W/2,505,15,'#bbb','center');
txt('Click or press a key once to enable sound (needed for controller-only play).',W/2,540,14,'#777','center')}else if(S=='mode'){txt('SELECT MODE',W/2,215,22,'#fff','center');
['STORY','SOLO','CO-OP','ONLINE'].forEach((s,i)=>{const x=115+i*190,on=!gOn&&ms==i;txt(s,x,300,32,on?'#ff0':'#888','center',140);if(on)soul(x-82,289,'#19e3ff')});
txt('Left / Right to choose, Enter / Z / A to confirm (or press 1, 2, 3 or 4)',W/2,360,15,'#bbb','center');
txt('CO-OP = one screen    ONLINE = play over the internet (PeerJS)',W/2,392,14,'#888','center');
txt('SOLO / ONLINE: WASD or ARROWS to move, SPACE or SHIFT to dash',W/2,418,15,'#bbb','center');
txt('CO-OP  P1: WASD + SPACE/SHIFT    P2: ARROWS + RIGHT SHIFT or /',W/2,438,15,'#bbb','center');
txt('Controllers: D-pad/stick to move, A to confirm and dash. 1st pad = P1, 2nd = P2.',W/2,455,15,'#bbb','center');
txt('Click or press a key once to enable sound (needed for controller-only play).',W/2,520,14,'#777','center')}
else{txt('SELECT BOSS',W/2,170,22,'#fff','center');BOSSES.filter(b=>!b.story).forEach((b,i)=>{const x=40+i*250,on=!gOn&&bi==i;g.strokeStyle=on?'#19e3ff':'#444';g.lineWidth=on?5:2;g.strokeRect(x,190,220,290);
drawBoss(i,x+110,265,Math.abs(Math.sin(Date.now()/230)),.9);txt(b.n,x+110,350,26,'#fff','center');txt(b.d,x+110,380,20,b.dc,'center');txt(b.genre,x+110,415,16,'#ff7eb3','center');txt('"'+b.song+'"',x+110,440,14,'#aaa','center');txt('HP '+b.hp,x+110,465,14,'#888','center')});
txt(net.role=='guest'?'Waiting for the host to choose a boss... X / B to leave':'Left / Right to choose, Enter / Z / A to fight, X / B to go back',W/2,520,14,'#bbb','center');if(net.role)txt('ONLINE CO-OP - you are P'+(net.me+1)+' ('+['cyan','yellow','green','orange'][net.me]+')',W/2,560,16,'#ff0','center')}
return}
if(SET.shake)g.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
g.fillStyle='#000';g.fillRect(BX,BY,BW,BH);
const RF=SET.reduceFlash,pu=mus?1-(((bt%1)+1)%1):0,dodge=S=='dodge';
if(dodge){g.strokeStyle='rgba(25,227,255,'+((RF?.06:.3)*pu)+')';g.lineWidth=3;const s=(1-pu)*260;g.strokeRect(BX-s,BY-s*.6,BW+2*s,BH+s*1.2)}
if(flash>0){if(RF)g.globalAlpha=1-.35*Math.min(1,flash*2);else if(Math.floor(flash*20)%2==0)g.globalAlpha=.4}if(S=='win')drawWinBoss();else{const hy=net.role=='guest'?bhap:S=='msg'&&hapT.includes(TXT),ha=1-bhurt,bsx=SET.shake&&bhurt>0&&ha<.45?Math.sin(ha*60)*7*(1-ha/.45):0;drawBoss(bi,W/2+bsx,95,RF?pu*.3:pu,1,0,bhurt>0,lowHp()||bhp<=0,hy)}g.globalAlpha=1;
g.strokeStyle=!RF&&dodge&&pu>.7?'#9ff':'#fff';g.lineWidth=4+(RF?.8:3)*pu;g.strokeRect(BX,BY,BW,BH);
if(S=='msg'||S=='menu'){const FT=wrapTxt(lx(TXT));msgLines(FT.slice(0,Math.floor(Math.min(1,tc/Math.max(1,TXT.length))*FT.length)),FT,BX+24,BY+50,22)}
if(S=='msg'&&msgWho>=0&&players[msgWho])txt('P'+(msgWho+1),BX+BW-16,BY+26,18,players[msgWho].col,'right');
if(S=='msg'&&tc>=TXT.length&&Math.floor(Date.now()/400)%2)txt('Enter / Z / Space / A',BX+BW-16,BY+BH-14,14,'#888','right');
if(S=='win'){const FW=lx(winTxt);lines(FW.slice(0,Math.floor(Math.min(1,tc/Math.max(1,winTxt.length))*FW.length)),BX+24,BY+50,22)}
if(S=='sub')sub.forEach((s,i)=>{txt('* '+s,BX+70,BY+60+i*36,24,mi==3&&i==0&&(spare>=100||lowHp())?'#ff0':'#fff');if(i==subI)mSoul(BX+40,BY+52+i*36)});
if(S=='tgt'){txt('* '+BO.n,BX+70,BY+60,24,(spare>=100||lowHp())?'#ff0':'#fff');mSoul(BX+40,BY+52)}
if(S=='ptg')players.forEach((p,i)=>{const y=BY+60+i*36;txt('* P'+(i+1)+'   '+(p.gone?'LEFT':p.down?'DOWN':p.hp+' / '+p.max+' HP'),BX+70,y,24,p.gone?'#555':p.col);if(i==ptI)mSoul(BX+40,y-8)});
if(S=='atk'&&players.length>1)drawBars();else if(S=='atk'){g.fillStyle='#222';g.fillRect(BX+40,BY+BH/2-26,520,52);g.strokeStyle='#fff';g.lineWidth=3;g.strokeRect(BX+40,BY+BH/2-26,520,52);g.fillStyle=PINK;g.fillRect(BX+294,BY+BH/2-26,12,52);g.fillStyle='#fff';g.fillRect(BX+40+atk.x-4,BY+BH/2-34,8,68);txt('Press confirm near the center!',BX+BW/2,BY+40,18,'#fff','center')}
if(dodge)for(const h of hz){if(h.t=='rect'){const age=bt-h.b;if(age<h.warn){g.globalAlpha=warnA(age,h);g.fillStyle=PINK;g.fillRect(h.x,h.y,h.w,h.h);g.globalAlpha=1;g.strokeStyle=PINK;g.lineWidth=2;g.strokeRect(h.x,h.y,h.w,h.h)}else{g.fillStyle=PINK;g.fillRect(h.x,h.y,h.w,h.h);g.fillStyle='#fff';g.fillRect(h.x+8,h.y+8,h.w-16,h.h-16)}}
else if(h.t=='sq'){const age=bt-h.b,d=h.s*.7071,PC=PINK,dia=(q)=>{g.beginPath();g.moveTo(h.x,h.y-q);g.lineTo(h.x+q,h.y);g.lineTo(h.x,h.y+q);g.lineTo(h.x-q,h.y);g.closePath()};
if(age<h.warn){g.globalAlpha=.12+.25*Math.abs(Math.sin(age*Math.PI*2));dia(d);g.fillStyle=PC;g.fill();g.globalAlpha=1;g.strokeStyle=PC;g.lineWidth=2;dia(d);g.stroke()}
else{g.globalAlpha=Math.max(0,Math.min(1,(h.warn+h.dur-age)/.1));dia(d);g.fillStyle=PC;g.fill();dia(d-11);g.fillStyle='#fff';g.fill();g.globalAlpha=1}}
else if(h.t=='hs')drawHS(h);
else if(h.t=='jaw')drawJaw(h);
else if(h.t=='sun'){const age=bt-h.b,f=Math.max(0,Math.min(1,age/h.warn)),pu2=SET.reduceFlash?f:Math.abs(Math.sin(age*Math.PI*(1+f*3))),fi=Math.min(1,age/.5);
g.save();g.translate(h.x,h.y);g.globalAlpha=fi*(.25+.35*f+.15*pu2);g.fillStyle=PINK;g.strokeStyle=PINK;g.lineWidth=2;
for(let j=0;j<8;j++){const a=h.a+j*Math.PI/4,L=30+5*f*pu2,c=Math.cos(a),s2=Math.sin(a),px=-s2,py=c;g.beginPath();g.moveTo(c*L,s2*L);g.lineTo(c*13+px*7,s2*13+py*7);g.lineTo(c*13-px*7,s2*13-py*7);g.closePath();g.fill();g.stroke()}
g.beginPath();g.arc(0,0,14+2*pu2,0,6.29);g.fill();g.stroke();g.globalAlpha=fi*(.3+.4*f);g.fillStyle='#fff';g.beginPath();g.arc(0,0,6,0,6.29);g.fill();g.restore();g.globalAlpha=1}
else if(h.t=='ln'){const age=bt-h.b,nodes=()=>{g.fillStyle='#fff';[[h.x1,h.y1],[h.x2,h.y2]].forEach(([x,y])=>{g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?3:8;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fill()})};
if(age<h.warn){g.globalAlpha=.25+.35*Math.abs(Math.sin(age*Math.PI*2));g.strokeStyle=PINK;g.lineWidth=2;g.setLineDash([8,6]);g.beginPath();g.moveTo(h.x1,h.y1);g.lineTo(h.x2,h.y2);g.stroke();g.setLineDash([]);g.globalAlpha=1;nodes()}
else{g.globalAlpha=Math.max(0,Math.min(1,(h.warn+h.dur-age)/.15));g.lineCap='round';g.strokeStyle=PINK;g.lineWidth=14;g.beginPath();g.moveTo(h.x1,h.y1);g.lineTo(h.x2,h.y2);g.stroke();g.strokeStyle='#fff';g.lineWidth=5;g.stroke();g.lineCap='butt';nodes();g.globalAlpha=1}}
else if(h.t=='slam'){}
else if(h.t=='burst'||h.t=='sb'){const f=(bt-h.b)/h.warn;g.strokeStyle=PINK;g.lineWidth=3;g.beginPath();g.arc(h.x,h.y,44-34*f,0,6.29);g.stroke();g.fillStyle=PINK;g.beginPath();g.arc(h.x,h.y,4+6*f,0,6.29);g.fill()}
else if(typeof h.a=='number'){const c=Math.cos(h.a),s2=Math.sin(h.a),px=-s2,py=c,tri=(k,hw)=>{g.beginPath();g.moveTo(h.x+c*11*k,h.y+s2*11*k);g.lineTo(h.x-c*11*k+px*hw*k,h.y-s2*11*k+py*hw*k);g.lineTo(h.x-c*11*k-px*hw*k,h.y-s2*11*k-py*hw*k);g.closePath();g.fill()};g.fillStyle=PINK;tri(1,8);g.fillStyle='#fff';tri(.4,8)}
else{g.fillStyle=PINK;g.beginPath();g.arc(h.x,h.y,h.r,0,6.29);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(h.x,h.y,h.r*.45,0,6.29);g.fill()}}
if(dodge)for(const p of players){for(const t of p.tr){g.globalAlpha=t.a*.6;g.fillStyle=p.col;shp(t.x,t.y,8,p.i);g.fill()}g.globalAlpha=1;
if(p.gone){}else if(p.down){g.globalAlpha=.5;g.strokeStyle=p.col;g.lineWidth=2;g.setLineDash([4,3]);shp(p.x,p.y,8,p.i);g.stroke();g.setLineDash([]);g.globalAlpha=1;
if(p.rev>0){g.strokeStyle='#7dff3d';g.lineWidth=4;g.beginPath();g.arc(p.x,p.y,18,-1.57,-1.57+6.28*p.rev/5);g.stroke()}else if(dodge)txt('REVIVE',p.x,p.y-18,11,'#fff','center')}
else{const hitF=performance.now()-(p.hit||0)<200;g.globalAlpha=p.inv>0&&p.dash<=0&&!hitF?(SET.reduceFlash?.55:Math.floor(p.inv*20)%2?.3:1):1;soul(p.x,p.y,hitF?PINK:p.col,p.i,p.dash>0);g.globalAlpha=1;
if(p.dcd>0&&dodge){g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2;g.beginPath();g.arc(p.x,p.y,15,-1.57,-1.57+6.28*(1-p.dcd/.6));g.stroke()}
if(players.length>1)txt('P'+(p.i+1),p.x,p.y-14,11,p.col,'center')}}
{const tp=players.length>1&&(S=='menu'||S=='tgt'||S=='sub'||S=='ptg')?pk:-1;players.forEach((p,i)=>{const n=players.length;if(n<3){const x=i?BX+BW-250:BX;if(i==tp){g.strokeStyle=p.col;g.lineWidth=3;g.strokeRect(x-8,452,258,40)}txt('P'+(i+1),x,478,18,p.col);txt('HP',x+40,478,14,'#fff');g.fillStyle='#600';g.fillRect(x+66,462,100,18);g.fillStyle=p.col;g.fillRect(x+66,462,100*p.hp/p.max,18);txt(p.gone?'LEFT':p.hp+' / '+p.max,x+176,478,16,'#fff')}else{const cw=W/n,x=i*cw+(cw-170)/2+8;if(i==tp){g.strokeStyle=p.col;g.lineWidth=3;g.strokeRect(x-8,452,170,40)}txt('P'+(i+1),x,478,16,p.col);txt('HP',x+30,478,11,'#fff');g.fillStyle='#600';g.fillRect(x+48,464,60,14);g.fillStyle=p.col;g.fillRect(x+48,464,60*p.hp/p.max,14);txt(p.gone?'LEFT':p.hp+'/'+p.max,x+114,478,13,'#fff')}})}
g.globalAlpha=dodge?.45:1;['FIGHT','ACT','ITEM','MERCY'].forEach((s,i)=>{const x=BX+i*150,on=S=='menu'&&mi==i,c=on?'#ff0':(S=='win'&&i==3&&wsp?'#ff0':'#ff9d00');g.strokeStyle=c;g.lineWidth=3;g.strokeRect(x,525,140,44);txt(s,x+70,555,22,c,'center');if(on)mSoul(x+22,547)});g.globalAlpha=1;
if(net.role&&net.ok)txt(lx('ONLINE  you = P'+(net.me+1))+(players.length>1&&(S=='menu'||S=='tgt'||S=='sub'||S=='ptg')?'  -  '+(pk==net.me?lx('YOUR TURN'):lx('P'+(pk+1)+' is choosing')):''),W-12,595,12,'#888','right',0,1);
if(BO){g.font='bold 18px monospace';const tw=g.measureText(lx(BO.n)+' ('+lx(BO.d)+')').width,ns=tw>180?18*180/tw:18;/* long names (Star Soulcerer) shrink so they don't run into the HP bar */
txt(BO.n,12,26,ns,'#fff');txt('('+BO.d+')',12+g.measureText(BO.n+' ').width,26,ns,BO.dc);g.fillStyle='#600';g.fillRect(200,10,200,16);g.fillStyle=PINK;g.fillRect(200,10,200*bhp/BO.hp,16);txt('HP',410,24,14,'#fff');
{const lo=lowHp()&&S!='win',ga=g.globalAlpha,dim=lo&&!SET.reduceFlash&&Math.floor(performance.now()/200)%2;g.globalAlpha=ga*(dim?.25:1);const mn=mbT?performance.now()-mbT:9e9,rd=mn<1200&&(SET.reduceFlash||Math.floor(mn/200)%2==0),mc=rd?'#f33':'#ff0';g.fillStyle=rd?'#8a1c1c':'#442';g.fillRect(200,32,200,10);g.fillStyle=mc;g.fillRect(200,32,2*spare,10);const mt='MERCY '+Math.round(spare)+'%';txt(mt,410,42,12,mc);if(lo){const cx=410+g.measureText(lx(mt)).width+14;g.fillStyle='#ff0';g.beginPath();g.moveTo(cx,30);g.lineTo(cx+8,43);g.lineTo(cx-8,43);g.closePath();g.fill();g.fillStyle='#000';g.fillRect(cx-1,34,2,5);g.fillRect(cx-1,40,2,2)}g.globalAlpha=ga}
{const sl='Song: '+BO.song+' ('+BO.genre+', '+BO.bpm+' BPM)';g.font='bold 14px monospace';/* too long for one line: split it so it doesn't cover the HP label */
if(g.measureText(lx(sl)).width<=348)txt(sl,W-12,26,14,'#aaa','right');else{txt('Song: '+BO.song,W-12,26,14,'#aaa','right',0,1);txt('('+BO.genre+', '+BO.bpm+' BPM)',W-12,44,14,'#aaa','right',0,1)}}
if(dodge){g.fillStyle='#19e3ff';g.fillRect(0,0,Math.min(1,Math.max(0,(bt-tb)/TL))*W,4);if(bt<tb+2)txt('DODGE!',W/2,170,24,'#19e3ff','center')}}if(S=='lose'||S=='lexit'||loseGo)drawLose();if(S=='intro')drawIntro();if(S=='flee')drawFlee();drawSlash();if(S=='win'&&wxT)drawWx()}

/* ---------- online co-op (PeerJS): host runs the game, guest sends its own position + button presses ---------- */
const net={role:null,peer:null,conn:null,slots:[null,null,null,null],ok:0,code:'',me:0},ALPHA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',PFX='soulxbeat-',SIGERR=['network','server-error','socket-error','socket-closed','disconnected'];
let netMsg='',netT=0,dodgeId=0,gBt=0,gT=0,gSpb=.5,myDi=-1,note='',noteT=0;
const el=id=>document.getElementById(id),r1=v=>Math.round(v*10)/10;
function setStatus(t){netMsg=t;el('status-msg').textContent=lx('Status: '+lx(t))}
function sendNet(o,only){if(net.role=='host'){net.slots.forEach((c,i)=>{if(i&&c&&c.open&&(only==null||only==i))try{c.send(o)}catch(e){}})}else if(net.conn&&net.conn.open)try{net.conn.send(o)}catch(e){}}
function lobbyBtns(busy){el('host-btn').disabled=busy;el('join-btn').disabled=busy;el('join-code').disabled=busy}
function cleanNet(){const cs=[net.conn,...net.slots],p=net.peer;net.conn=null;net.slots=[null,null,null,null];net.peer=null;net.role=null;net.ok=0;net.code='';net.me=0;myDi=-1;setTimeout(()=>{cs.forEach(c=>{try{c&&c.close()}catch(e){}});try{p&&p.destroy()}catch(e){}},200)}
function openLobby(){applyLobbyLang();S='lobby';el('lobby-ui').style.display='block';el('host-code').textContent='';el('slots').innerHTML='';el('start-btn').style.display='none';lobbyBtns(0);setStatus(typeof Peer=='undefined'?'PeerJS failed to load. Online play needs an internet connection.':'Host a room, or enter a friend\'s code.')}
function leaveLobby(){if(net.role=='host')sendNet({t:'bye'});cleanNet();el('lobby-ui').style.display='none';S='mode'}
function netDown(msg){cleanNet();stopMusic();players=[];hz=[];mode=1;ms=0;BO=null;S='mode';el('lobby-ui').style.display='none';note=msg;noteT=4}
function hostGame(tries){tries=tries||0;cleanNet();
if(typeof Peer=='undefined')return setStatus('PeerJS failed to load. Online play needs an internet connection.');
let code='';for(let i=0;i<4;i++)code+=ALPHA[Math.random()*ALPHA.length|0];
net.role='host';net.me=0;net.code=code;lobbyBtns(1);setStatus('Creating room...');
const p=net.peer=new Peer(PFX+code);
p.on('open',()=>{if(net.peer!==p)return;el('host-code').textContent=code;el('start-btn').style.display='inline-block';netRoster()});
p.on('disconnected',()=>{if(net.peer===p&&!p.destroyed)try{p.reconnect()}catch(e){}});p.on('connection',c=>{if(net.peer!==p)return;const k=S=='lobby'?[1,2,3].find(j=>!net.slots[j]):0;if(!k){c.on('open',()=>{try{c.send({t:'full'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},300)});return}net.slots[k]=c;c.slot=k;wire(c)});
p.on('error',e=>{if(net.peer!==p)return;if(net.ok){if(!SIGERR.includes(e.type))netDown('Connection error.');return}if(e.type=='unavailable-id'&&tries<5)hostGame(tries+1);else{cleanNet();lobbyBtns(0);setStatus('Error: '+e.type)}})}
function joinGame(){const code=el('join-code').value.trim().toUpperCase();
if(code.length!=4)return setStatus('Enter the 4-character room code.');
cleanNet();if(typeof Peer=='undefined')return setStatus('PeerJS failed to load. Online play needs an internet connection.');
net.role='guest';net.me=1;lobbyBtns(1);setStatus('Connecting...');
const p=net.peer=new Peer();
p.on('open',()=>{if(net.peer!==p)return;const c=net.conn=p.connect(PFX+code,{serialization:'json'});wire(c);
setTimeout(()=>{if(net.peer===p&&!net.ok){cleanNet();lobbyBtns(0);setStatus('Could not reach that room. Check the code, or try another network.')}},12000)});
p.on('error',e=>{if(net.peer!==p)return;if(net.ok){if(!SIGERR.includes(e.type))netDown('Connection error.');return}cleanNet();lobbyBtns(0);setStatus(e.type=='peer-unavailable'?'Room not found. Check the code.':'Error: '+e.type)})}
const SVGP=['<rect x="2" y="2" width="14" height="14"/>','<polygon points="9,1 17,16 1,16"/>','<polygon points="9,1 17,7 14,16 4,16 1,7"/>','<circle cx="9" cy="9" r="8"/>'];
function slotsHTML(r){return r.map((on,i)=>'<span style="display:inline-block;margin:0 7px;text-align:center;opacity:'+(on?1:.3)+'"><svg width="18" height="18" viewBox="0 0 18 18" fill="'+PCOL[i]+'">'+SVGP[i]+'</svg><br>P'+(i+1)+'</span>').join('')}
function lobbyRoster(r){r=(Array.isArray(r)?r:[1,0,0,0]).slice(0,4).map(v=>v?1:0);const n=r.reduce((x,y)=>x+y,0);el('slots').innerHTML=slotsHTML(r);
if(net.role=='host'){el('start-btn').disabled=n<2;setStatus(n<2?'Room open. Share the code. Up to 3 friends can join.':n+' of 4 players are in the room. Press Start when ready.')}else setStatus('Connected. Waiting for the host to start... ('+n+' of 4 players)')}
function netRoster(){const r=[1,...[1,2,3].map(k=>net.slots[k]?1:0)];net.slots.forEach((c,k)=>{if(k&&c&&c.open)try{c.send({t:'r',me:k,r})}catch(e){}});lobbyRoster(r)}
function netAssign(){const cs=net.slots.filter(Boolean);net.slots=[null,null,null,null];cs.forEach((c,i)=>{c.slot=i+1;net.slots[i+1]=c});mode=cs.length+1;net.ok=cs.length?1:0;netRoster()}
function hostStart(){if(net.role!='host'||S!='lobby'||!net.slots.some(Boolean))return;netAssign();players=[];S='boss';el('lobby-ui').style.display='none';try{document.activeElement.blur()}catch(e){}}
function netLeft(c){if(net.role!='host'||!c.slot||net.slots[c.slot]!==c)return;const k=c.slot;net.slots[k]=null;net.ok=net.slots.some(Boolean)?1:0;
const p=S!='lobby'?players[k]:null;if(p){p.gone=1;p.down=1;p.hp=0;p.rev=0;p.tr=[]}
if(S!='lobby'){note='Player '+(k+1)+' left the room.';noteT=3}netRoster()}
function wire(c){
c.on('open',()=>{if(net.role=='host'){if(net.slots[c.slot]!==c)return;net.ok=1;netRoster();return}
if(net.conn!==c)return;net.ok=1;try{document.activeElement.blur()}catch(e){}setStatus('Connected. Waiting for the host to start...')});
c.on('data',d=>onNet(d,c));
c.on('close',()=>{if(net.role=='host')netLeft(c);else if(net.conn===c)netDown('Connection lost.')});
c.on('error',()=>{if(net.role=='host')netLeft(c);else if(net.conn===c)netDown('Connection error.')})}
function onNet(d,c){if(!d||typeof d!='object')return;
if(net.role=='host'){
if(d.t=='p'&&typeof d.c=='string'&&d.c.length<16){fromG=c.slot;try{press(d.c)}finally{fromG=0}}
else if(d.t=='gbye')netLeft(c);else if(d.t=='m'){const p=players[c.slot];if(p){p.rt=performance.now();p.rx=+d.x||0;p.ry=+d.y||0;p.rd=!!d.d;p.rdi=d.di}}}
else if(d.t=='s')applySnap(d);else if(d.t=='r'){net.me=d.me|0;lobbyRoster(d.r)}else if(d.t=='full'){cleanNet();lobbyBtns(0);setStatus('That room is full or has already started.')}else if(d.t=='bye')netDown('The host left the room.')}
function snap(){return{t:'s',S,bi,ws:wsp,bo:BOSSES.indexOf(BO),mu:mus?BOSSES.indexOf(mus.b):-1,bt:+bt.toFixed(3),bhp,spare,TXT,tc:Math.floor(tc),mi,subI,sub,wt:winTxt,ax:Math.round(atk.x),pk,pt:ptI,mw:msgWho,fb:fb.map(b=>({k:b.k,x:Math.round(b.x),dn:b.done?1:0,d:b.d||0,m:b.miss?1:0})),fl:+flash.toFixed(2),bh:+bhurt.toFixed(2),bj:(S=='msg'&&hapT.includes(TXT))?1:0,lk:loseK,li:loseI,sl:slSnap(),mb:mbT?+((performance.now()-mbT)/1000).toFixed(2):-1,wx:wxT?+((performance.now()-wxT)/1000).toFixed(2):-1,lg:loseGo?+((performance.now()-loseGo)/1000).toFixed(2):-1,sh:+shake.toFixed(1),di:dodgeId,tn:turn,tb,
hz:hz.map(h=>h.t=='b'?{t:'b',x:r1(h.x),y:r1(h.y),vx:Math.round(h.vx),vy:Math.round(h.vy),r:h.r,...(typeof h.a=='number'?{a:+h.a.toFixed(3)}:{})}:h.t=='rect'?{t:'rect',x:h.x,y:h.y,w:h.w,h:h.h,b:h.b,warn:h.warn}:h.t=='sq'?{t:'sq',x:r1(h.x),y:r1(h.y),s:h.s,b:h.b,warn:h.warn,dur:h.dur}:h.t=='hs'?{t:'hs',b:h.b,x:r1(h.x),top:h.top,life:h.life}:h.t=='jaw'?{t:'jaw',b:h.b,warn:h.warn,gap:h.gap,gt:h.gt,gu:h.gu}:h.t=='sun'?{t:'sun',x:r1(h.x),y:r1(h.y),a:h.a,b:h.b,warn:h.warn}:{t:'burst',x:Math.round(h.x),y:Math.round(h.y),b:h.b,warn:h.warn}),
pl:players.map(p=>({x:r1(p.x),y:r1(p.y),hp:p.hp,inv:+p.inv.toFixed(2),dn:p.down,g:p.gone?1:0,rv:+p.rev.toFixed(2),d:p.dash>0?1:0,cd:+p.dcd.toFixed(2)}))}}
function applySnap(s){const prev=S;
if(s.S=='win'&&prev!='win')winInit(s.ws);if(s.S=='lose'){if(prev!='lose')loseInit(s.lk|0);loseI=s.li|0}if(s.lg>=0&&s.lg<3.3&&!loseGo)loseGo=performance.now()-s.lg*1000;if(s.S=='intro'&&prev!='intro'){introT=performance.now();introSn=0}if((s.S=='flee'&&prev!='flee')||(s.S=='lexit'&&prev!='lexit')){exT=performance.now();exSn=0}if((prev=='flee'||prev=='lexit')&&s.S=='boss')fiT=performance.now();slApply(s.sl);if(s.mb>=0&&s.mb<1.2){const mt0=performance.now()-s.mb*1000;if(!mbT||mt0>mbT+300)mbT=mt0}if(prev=='win'&&s.S=='boss'){wxT=0;fiT=performance.now()}if(s.S=='win'&&s.wx>=0&&s.wx<.8&&!wxT)wxT=performance.now()-s.wx*1000;S=s.S;if(S!='lobby')el('lobby-ui').style.display='none';bi=s.bi;BO=s.bo>=0?BOSSES[s.bo]:null;bhp=s.bhp;spare=s.spare;if(s.TXT!=TXT&&/ate the Pink Pie|fed the Pink Pie/.test(s.TXT))sfxPie(/gets back up|Fallen allies get up/.test(s.TXT));TXT=s.TXT;tc=s.tc;mi=s.mi;subI=s.subI;sub=s.sub;winTxt=s.wt;atk.x=s.ax;pk=s.pk|0;ptI=s.pt|0;msgWho=s.mw==null?-1:s.mw;fb=(s.fb||[]).map(b=>({k:b.k,x:b.x,done:b.dn,d:b.d,miss:b.m}));flash=s.fl;bhurt=s.bh||0;bhap=s.bj||0;shake=Math.max(shake,s.sh);tb=s.tb;turn=s.tn|0;hz=s.hz;;mode=Math.max(2,s.pl.length);
gBt=s.bt;gT=performance.now();gSpb=BO?60/BO.bpm:.5;
while(players.length<s.pl.length)players.push(mkP(players.length));players.length=s.pl.length;
const fresh=S=='dodge'&&s.di!==myDi;if(fresh)myDi=s.di;
s.pl.forEach((q,i)=>{const p=players[i];if(q.hp<p.hp)p.hit=performance.now();if(AC){if(q.hp<p.hp)sfxHit();if(p.down&&!q.dn&&q.hp>0&&q.hp<20)sfxUp()}
p.hp=q.hp;p.inv=q.inv;p.down=q.dn;p.gone=q.g;p.rev=q.rv;
if(i!=net.me){p.x=q.x;p.y=q.y;p.dash=q.d?.1:0;p.dcd=q.cd}else if(fresh){p.x=q.x;p.y=q.y;p.dash=0;p.tr=[]}});
if(AC){if(s.mu>=0){const b=BOSSES[s.mu];if(!mus||mus.b!==b){stopMusic();startMusic(b);syncMus(s.bt)}else if(Math.abs((AC.currentTime-mus.t0)/mus.spb-s.bt)>.75)syncMus(s.bt)}else if(mus)stopMusic();
if(S=='win'&&prev!='win')jingle()}}
function syncMus(b){mus.t0=AC.currentTime-b*mus.spb;mus.step=Math.max(0,Math.ceil(b*4))}
function gUpdate(dt){tc+=dt*36;if(S=='win')wanim+=dt;bt=gBt+(performance.now()-gT)/1000/gSpb;
if(S=='atk'){atk.x=Math.min(520,atk.x+dt*480);fb.forEach(b=>{if(!b.done)b.x=Math.min(520,b.x+dt*347)})}
players.forEach((p,i)=>{if(i==net.me&&S=='dodge')upd(p,dt);else{if(p.dash>0)p.tr.push({x:p.x,y:p.y,a:.6});p.tr.forEach(t=>t.a-=dt*4);p.tr=p.tr.filter(t=>t.a>0)}});
if(S=='dodge')for(const h of hz)if(h.t=='b'){h.x+=h.vx*dt;h.y+=h.vy*dt}
netT+=dt;if(netT>=1/30){netT=0;const p=players[net.me];if(p&&net.ok&&S=='dodge')sendNet({t:'m',x:r1(p.x),y:r1(p.y),d:p.dash>0?1:0,di:myDi})}}
function drawNote(dt){if(noteT<=0)return;noteT-=dt;g.setTransform(1,0,0,1,0,0);g.globalAlpha=Math.min(1,noteT);txt(note,W/2,H-30,20,'#ff7eb3','center');g.globalAlpha=1}
el('host-btn').addEventListener('click',e=>{e.currentTarget.blur();hostGame()});
el('join-btn').addEventListener('click',e=>{e.currentTarget.blur();joinGame()});
el('start-btn').addEventListener('click',e=>{e.currentTarget.blur();hostStart()});
el('back-btn').addEventListener('click',e=>{e.currentTarget.blur();askLeave()});
el('join-code').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')});
el('join-code').addEventListener('keydown',e=>{if(e.key=='Enter'){e.target.blur();joinGame()}});
/* ---------- touch / tap: presses the existing menu buttons (no on-screen gameplay controls yet) ---------- */
function tapAt(x,y){pw=S=='atk'?-1:pk;try{tapAt0(x,y)}finally{pw=-1}}
function tapAt0(x,y){const inR=(a,b,w,h)=>x>=a&&x<=a+w&&y>=b&&y<=b+h,
mv=(from,to,n,fw,bw)=>{const d=(to-from+n)%n;if(d<=n-d)for(let k=0;k<d;k++)press(fw);else for(let k=0;k<n-d;k++)press(bw)};
/* two-step taps: tapping a button that isn't highlighted only moves the highlight to it; tapping the highlighted one activates it */
if(!SET.touch)return;
if(lvOpen){lvTap(x,y,inR);return}
if(ctlPop){popTap(x,y);return}
if(S=='set'){setTap(x,y);return}
if(S=='ctl'||S=='src'){ctlTap(x,y);return}
if(S=='keys'){keysTap(x,y);return}
let wasG=0;if((S=='mode'||S=='boss')&&!net.role){if(inR(0,0,100,84)){if(gOn)press(OK[1]);else gOn=1;return}wasG=gOn;gOn=0}
if(S=='story'){storyTap(x,y,inR);return}
if(S=='mode'){const n=npOn?3:4;for(let i=0;i<n;i++)if(npOn?inR(150+i*250-90,243,180,152):inR(115+i*190-90,255,180,70)){const cur=npOn?npI:ms;if(cur==i&&!wasG)press(OK[1]);else mv(cur,i,n,R[0],L[0]);return}}
else if(S=='boss'){for(let i=0;i<3;i++)if(inR(40+i*250,190,220,290)){if(bi==i&&!wasG)press(OK[1]);else mv(bi,i,3,R[0],L[0]);return}}
else if(S=='msg'||S=='atk'||S=='win')press(OK[1]); else if(S=='lose'){if(net.role!='guest'){const t=(performance.now()-loseT0)/1000;if(t>LOSE_MENU+.1&&!loseGo)for(let i=0;i<2;i++)if(inR(W/2-215+i*240,410,190,46)){if(loseI==i)press(OK[1]);else loseI=i;return}}}
else if(S=='menu'||S=='tgt'||S=='sub'){
for(let i=0;i<4;i++)if(inR(BX+i*150,525,140,44)){
if(S=='menu'&&mi==i){press(OK[1]);return}
if(S=='sub'){press(NO[0]);if(mi==1)press(NO[0])}else if(S=='tgt')press(NO[0]);
mv(mi,i,4,R[0],L[0]);return}
if(S=='tgt'){if(inR(BX,BY,BW,BH))press(OK[1])}
else if(S=='sub'){for(let i=0;i<sub.length;i++)if(inR(BX+20,BY+60+i*36-28,BW-40,40)){if(subI==i)press(OK[1]);else mv(subI,i,sub.length,Dn[0],U[0]);return}}}}
function onTap(e){if(e.pointerType=='mouse'&&e.button!==0)return;const r=cv.getBoundingClientRect();if(!r.width||!r.height)return;const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;if(vcDown(e,x,y)){if(e.cancelable)e.preventDefault();return}tapAt(x,y);if(e.cancelable)e.preventDefault()}
cv.addEventListener('pointerdown',onTap);addEventListener('touchend',initAudio,{passive:true});
/* ---------- virtual joystick and buttons ---------- */
const VC={jid:-1,aid:-1,bid:-1,sx:0,sy:0,a:0,b:0,dir:[0,0,0,0],jc:{x:110,y:508,r:85},ac:{x:722,y:515,r:60},bc:{x:610,y:480,r:47}};
const vcIn=(c,x,y,pad)=>Math.hypot(x-c.x,y-c.y)<=c.r+pad;
function vcPos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
function vcStick(x,y){const c=VC.jc,dx=x-c.x,dy=y-c.y,l=Math.hypot(dx,dy)||1,m=Math.min(1,l/c.r);VC.sx=dx/l*m;VC.sy=dy/l*m;if(Math.hypot(VC.sx,VC.sy)<.2){VC.sx=0;VC.sy=0}
const ax=Math.abs(VC.sx),ay=Math.abs(VC.sy),k=[ax>=ay&&VC.sx<-.5,ax>=ay&&VC.sx>.5,ay>ax&&VC.sy<-.5,ay>ax&&VC.sy>.5],n=['PadL','PadR','PadU','PadD'];
k.forEach((on,i)=>{if(on&&!VC.dir[i]&&S!='dodge')press(n[i]);VC.dir[i]=on?1:0})}
function vcDown(e,x,y){if(!SET.vjoy)return 0;const id=e.pointerId,cap=()=>{try{cv.setPointerCapture(id)}catch(_){}};
if(VC.jid<0&&vcIn(VC.jc,x,y,30)){VC.jid=id;cap();vcStick(x,y);return 1}
if(VC.aid<0&&vcIn(VC.ac,x,y,6)){VC.aid=id;cap();VC.a=1;if(S!='dodge')press('PadA');return 1}
if(VC.bid<0&&vcIn(VC.bc,x,y,6)){VC.bid=id;cap();VC.b=1;if(S!='dodge')press('PadB');return 1}
return 0}
function vcMove(e){if(e.pointerId!==VC.jid)return;const p=vcPos(e);vcStick(p[0],p[1]);if(e.cancelable)e.preventDefault()}
function vcUp(e){const id=e.pointerId;if(id===VC.jid){VC.jid=-1;VC.sx=0;VC.sy=0;VC.dir=[0,0,0,0]}if(id===VC.aid){VC.aid=-1;VC.a=0}if(id===VC.bid){VC.bid=-1;VC.b=0}}
cv.addEventListener('pointermove',vcMove);cv.addEventListener('pointerup',vcUp);cv.addEventListener('pointercancel',vcUp);cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('blur',()=>{VC.jid=VC.aid=VC.bid=-1;VC.sx=VC.sy=VC.a=VC.b=0;VC.dir=[0,0,0,0]});
function drawVC(){cv.style.touchAction=SET.vjoy?'none':'';if(!SET.vjoy)return;g.save();g.lineWidth=3;const c=VC.jc;
g.globalAlpha=.1;g.fillStyle='#fff';g.beginPath();g.arc(c.x,c.y,c.r,0,7);g.fill();g.globalAlpha=.4;g.strokeStyle='#fff';g.stroke();
g.globalAlpha=.55;g.beginPath();g.arc(c.x+VC.sx*(c.r-36),c.y+VC.sy*(c.r-36),36,0,7);g.fill();
[[VC.ac,'A',VC.a],[VC.bc,'B',VC.b]].forEach(q=>{const k=q[0],col=q[2]?'#ff0':'#fff';g.globalAlpha=q[2]?.3:.1;g.fillStyle=col;g.beginPath();g.arc(k.x,k.y,k.r,0,7);g.fill();g.globalAlpha=q[2]?.9:.45;g.strokeStyle=col;g.stroke();g.globalAlpha=q[2]?.95:.6;txt(q[1],k.x,k.y+10,30,col,'center')});
g.restore()}
let last=performance.now();
function frame(n){requestAnimationFrame(frame);const dt=Math.min(.05,(n-last)/1000);last=n;try{update(dt);if(net.role=='host'&&net.ok&&S!='lobby'){netT+=dt;if(netT>=1/30){netT=0;sendNet(snap())}}draw();drawFi();drawCtlPop();drawLv();drawNote(dt);drawVC()}catch(e){console.error(e)}}
requestAnimationFrame(frame);
