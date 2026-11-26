const cv=document.getElementById('c');let g=cv.getContext('2d');
const W=800,H=600,BX=100,BY=190,BW=600,BH=240,TL=34;
/* An enemy carrying the Poison Trinket draws ALL its attacks purple (the trinket's color): while its hazards are drawn, PINK is swapped
   for violet and pkCol(color) turns the attacks' own pink shades (leaves, slime, cars...) violet too. PKA = 1 only during that loop. */
let PINK='#ff2d75',PKA=0;const PKC='#b45bff',PKD='#7a2fc0',pkCol=(c,dark)=>PKA?(dark?PKD:PKC):c;
let AC,master,nb,S='mode',players=[],bi=0,BO=null,bt=0,shake=0,mus=null,TXT='',tc=0,nextFn=null,hz=[],ev=[],ei=0,tb=0,turn=0,mi=0,subI=0,sub=[],spare=0,bhp=0,items=2,mode=1,atk={x:0},flash=0,bhurt=0,hapT=[],angT=[],bhap=0,loseT0=0,loseK=0,loseI=0,lastDn=0,winTxt='',ms=0,fromG=0,dmgAdj=0,dmgNow=0,greenTooth=0;
const keys={};
let npOn=0,npI=0,pk=0,picks=[],fb=[],ptI=0,msgWho=-1,fbDone=0,fleeMsg=0,pw=-1;
const PCOL=['#19e3ff','#ffd23f','#7dff3d','#ff9a2e'],SPXF=[[.5],[.3,.7],[.2,.5,.8],[.15,.38,.62,.85]];
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
"* Maw is wheezing, one eye half shut.":["* Maw resuella, con un ojo medio cerrado.","* Maw respire avec peine, un œil à moitié fermé.","* Maw はゼイゼイ息をし、片目が半分閉じている。","* Maw 喘著粗氣，一隻眼睛半閉著。","* Maw 喘着粗气，一只眼睛半闭着。","* Maw ansima, con un occhio socchiuso.","* Maw keucht, ein Auge halb geschlossen.","* Maw хрипит, один глаз полуприкрыт.","* Maw hırıldıyor, bir gözü yarı kapalı."],
"* Maw's teeth are chattering.":["* A Maw le castañetean los dientes.","* Les dents de Maw claquent.","* Maw の歯がカチカチ鳴っている。","* Maw 的牙齒在打顫。","* Maw 的牙齿在打颤。","* I denti di Maw battono.","* Maws Zähne klappern.","* Зубы Maw стучат.","* Maw'ın dişleri takırdıyor."],
"* Maw is wobbling, but won't fall.":["* Maw se tambalea, pero no cae.","* Maw chancelle, mais ne tombe pas.","* Maw はふらついているが、倒れない。","* Maw 搖搖晃晃，卻沒有倒下。","* Maw 摇摇晃晃，却没有倒下。","* Maw barcolla, ma non cade.","* Maw wankt, fällt aber nicht.","* Maw шатается, но не падает.","* Maw sendeliyor ama düşmüyor."]
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
"* Maw rumbles. The floor shakes.":["* Maw retumba. El suelo tiembla.","* Maw gronde. Le sol tremble.","* Maw がうなりをあげる。床が揺れている。","* Maw 發出隆隆聲。地面在震動。","* Maw 发出隆隆声。地面在震动。","* Maw rimbomba. Il pavimento trema.","* Maw grollt. Der Boden bebt.","* Maw рокочет. Пол трясётся.","* Maw gürlüyor. Zemin sarsılıyor."],
"* Maw grinds its teeth.":["* Maw rechina los dientes.","* Maw grince des dents.","* Maw が歯ぎしりしている。","* Maw 咬牙切齒。","* Maw 咬牙切齿。","* Maw digrigna i denti.","* Maw knirscht mit den Zähnen.","* Maw скрежещет зубами.","* Maw dişlerini gıcırdatıyor."],
"* The bass wobbles the air.":["* El bajo hace vibrar el aire.","* La basse fait vibrer l'air.","* ベースの揺れで空気がうねっている。","* 低音讓空氣都在震盪。","* 低音让空气都在震荡。","* Il basso fa vibrare l'aria.","* Der Bass lässt die Luft wabern.","* Бас заставляет воздух дрожать.","* Bas havayı titretiyor."],
"* Maw stares with three eyes.":["* Maw te mira con tres ojos.","* Maw vous fixe de ses trois yeux.","* Maw が3つの目でじっと見つめている。","* Maw 用三隻眼睛盯著你。","* Maw 用三只眼睛盯着你。","* Maw ti fissa con tre occhi.","* Maw starrt dich mit drei Augen an.","* Maw смотрит на тебя тремя глазами.","* Maw üç gözüyle bakıyor."],
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
{n:'PULSAR',d:'NORMAL',dc:'#ff0',hp:70,bpm:128,key:57,gen:'edm',song:'Neon Drop',genre:'EDM',dmg:5,warn:1.5,bn:16,rs:260,rn:10,act:30,intro:'* Pulsar spins up. The bass kicks in!',fl:['* Pulsar throbs with the kick drum.','* The lights are blinding.','* Pulsar is charging up.'],chk:'* PULSAR - 5 ATK 3 DEF\n* DIFFICULTY: NORMAL\n* A star who really likes to rave.'},
{n:'MAW',d:'HARD',dc:'#ff3030',hp:90,bpm:140,key:53,gen:'dub',song:'Wobble Crown',genre:'Dubstep',dmg:6,warn:1,bn:22,rs:320,rn:14,act:25,hum:10,intro:'* Maw rumbles. The floor shakes.',fl:['* Maw grinds its teeth.','* The bass wobbles the air.','* Maw stares with three eyes.'],chk:'* MAW - 6 ATK 4 DEF\n* DIFFICULTY: HARD\n* Rumble rectangle who goes hard with the bass, and teeth.'},
/* story-only (Village 1's Soulcerer): not shown in SOLO / CO-OP / ONLINE boss select. dmg 7 = genocide route; story.js lowers it to 5 otherwise */
{n:'STAR SOULCERER',d:'SOULCERER',dc:'#ffd23f',hp:150,bpm:150,key:57,gen:'orch',song:'Fallen Constellation',genre:'Synth-orchestral',dmg:7,warn:1.25,bn:12,rs:300,rn:14,act:25,story:1,intro:'* The Star Soulcerer awakens. Its visor flickers.',fl:['* The Soulcerer hums a low, ancient note.','* Starlight gathers around the statue.','* The visor watches you.'],chk:'* STAR SOULCERER - 7 ATK 5 DEF\n* DIFFICULTY: SOULCERER\n* A hero of the old war, sealed in stone.'},
/* story-only (Square Village mini boss 1). Song: an mp3 (music.js 'racer'): 144 BPM, first beat 0.025 s in, loops every 172 beats.
   7 ATK 5 DEF (his DEF lives in story.js's Square Village data). */
{n:'RACER',d:'EASY',dc:'#7dff3d',hp:85,bpm:144,mp3:'racer',off:.025,loopBeats:172,song:'RALLY-X A GO GO',artist:'Hiroyuki Kawada & Nobuyuki Ohnogi',dmg:8,warn:2,bn:10,rs:200,rn:8,act:35,story:1,intro:'* Racer screeches onto the track!',fl:['* Racer revs his engine impatiently.','* The smell of burnt rubber fills the air.','* Racer does a donut around the board.'],chk:'* RACER - 8 ATK 6 DEF\n* DIFFICULTY: EASY\n* A speed demon looking for a worthy rival.'},
/* story-only (Square Village mini boss 2). Song: an mp3 (music.js 'tanga'): 160 BPM, first beat 0.0406 s in; the first 32 beats
   (an intro) play once, then 128 beats loop. 6 ATK 6 DEF (her DEF lives in story.js's Square Village data). */
{n:'TANGA',d:'EASY',dc:'#7dff3d',hp:95,bpm:160,mp3:'tanga',off:.0406,introBeats:32,loopBeats:128,song:'TILA EN STEREO',artist:'Rainbowdragoneyes',dmg:7,warn:2,bn:10,rs:200,rn:8,act:35,story:1,intro:'* Tanga twirls onto the stage!',fl:['* Tanga strikes a pose and waits for applause.','* Leaves rustle to the beat.','* Tanga shakes her pom-poms at you.'],chk:'* TANGA - 7 ATK 7 DEF\n* DIFFICULTY: EASY\n* A cheerleader who just wants an audience.'},
/* story-only (Square Village mini boss 3). Song: an mp3 (music.js 'slug'): 107 BPM, first beat 0.026 s in, loops every 112 beats.
   No attack of his follows or aims at players. 6 ATK 4 DEF (his DEF lives in story.js's Square Village data).
   His ACTs have special effects (fx, see slugAct): Compliment = extra lucky coins, Pay Up = costs 10 BC, Salt = damages him. */
{n:'$LUG THUG',d:'EASY',dc:'#7dff3d',hp:105,bpm:107,mp3:'slug',off:.026,loopBeats:112,song:'Splash Woman',artist:'Mega Ran',dmg:7,warn:2,bn:10,rs:200,rn:8,act:35,story:1,intro:'* $lug Thug slides in, real slow.',fl:['* $lug Thug adjusts his shades.','* $lug Thug flashes his seashell bling.','* $lug Thug counts his coins. Slowly.'],chk:'* $LUG THUG - 7 ATK 5 DEF\n* DIFFICULTY: EASY\n* Talks big. Moves slow. Loves money.'},
/* story-only (Square Village mini boss 4): NEUTLIN, a small hooded creature that is mostly a big round head. Song: an mp3 (music.js 'neutlin'):
   111 BPM, first beat 0.0635 s; plays 0-4 s once (introBeats 7.2825), then loops 4.0 s to 99.1 s (176 beats). HP 110 / 8 ATK / 7 DEF (the DEF lives in story.js). */
{n:'NEUTLIN',d:'EASY',dc:'#7dff3d',hp:110,bpm:111,mp3:'neutlin',off:.0635,introBeats:7.2825,loopBeats:176,song:'Come and Find Me (B Mix)',artist:'Eric Skiff',dmg:8,warn:2,bn:10,rs:200,rn:8,act:35,story:1,intro:'* Neutlin pops out from the shadows.\n* ...Then regrets doing that.',fl:['* Neutlin shuffles in place, pouting.',"* Neutlin's tail twitches under the cloak.",'* Neutlin tugs the hood a little lower.'],chk:'* NEUTLIN - 8 ATK 7 DEF\n* DIFFICULTY: EASY\n* Hides in its cloak. Secretly wants to be found.'},
/* story-only (Square Village mini boss 5): PANCY, an angel archer. Song: an mp3 (music.js 'pancy'): 120 BPM, first beat 0.087 s; plays 0-16 s once
   (introBeats 32), then loops 16.1 s to 112.1 s (192 beats). HP 120 / 8 ATK / 7 DEF (the DEF lives in story.js). */
{n:'PANCY',d:'EASY',dc:'#7dff3d',hp:120,bpm:120,mp3:'pancy',off:.087,introBeats:32,loopBeats:192,song:'Drifting Deeper',artist:'Zef (feat. Stemage)',dmg:8,warn:2,bn:10,rs:200,rn:8,act:35,story:1,intro:'* Pancy descends, bow already drawn.',fl:['* Pancy polishes her golden bowtie.','* Pancy checks her aim. Twice.','* Pancy hums a hymn, slightly off-key.'],chk:'* PANCY - 8 ATK 7 DEF\n* DIFFICULTY: EASY\n* An angel archer. She blames every miss on the wind.'},
/* story-only (Square Village mini boss 6): DARIUS & KIPTO, a kid riding his Chinese dragon. Darius's attacks are YELLOW and drain SP;
   Kipto's are PINK and hurt HP. Song: an mp3 (music.js 'darius'): 160 BPM, first beat 0.93 s; plays 0-36.93 s once (introBeats 96), then loops
   36.93 s to 96.93 s (160 beats). HP 135 / 9 ATK / 8 DEF (the DEF lives in story.js). */
{n:'DARIUS & KIPTO',d:'EASY',dc:'#7dff3d',hp:135,bpm:160,mp3:'darius',off:.93,introBeats:96,loopBeats:160,song:'Counter Format',artist:'Shirobon',dmg:9,warn:2,bn:10,rs:200,rn:8,act:35,story:1,intro:'* The troublemaker and the firemaker\n  swoop into your sight!',fl:['* Darius and Kipto flash the same sharp grin.','* Darius pumps his fist to the beat.','* Kipto curls lazily through the air.'],chk:"* DARIUS & KIPTO - 9 ATK 8 DEF\n* DIFFICULTY: EASY\n* A brat and his lovable dragon.\n* Watch out: the yellow blobs drain SP."},
/* story-only (Square Village mini boss 7): TOURETTE TURRET, a round speaker-bot on treads (it). Song: an mp3 (music.js 'turret'): 132 BPM (the user's
   correction; it was wrongly set to 176 = 4/3 of it); the file is the user's own cut of the song's 2:10 breakdown, after the "hey" (beat 0 at .016 s), plays it once
   (introBeats 32 = 8 bars), then loops the drop 14.56 s to 72.74 s, the end of the file (loopBeats 128 = 32 bars).
   HP 140 / 9 ATK / 8 DEF (the DEF lives in story.js). */
{n:'TOURETTE TURRET',d:'EASY',dc:'#7dff3d',hp:140,bpm:132,mp3:'turret',off:.016,introBeats:32,loopBeats:128,song:'1985',artist:'Sabrepulse',dmg:9,warn:2,bn:10,rs:200,rn:8,act:35,story:1,intro:'* Tourette Turret rolls into position.\n* Its speaker crackles to life.',fl:['* Tourette Turret adjusts its volume knob.','* Static hums from its side speakers.','* Tourette Turret swivels back and forth.'],chk:'* TOURETTE TURRET - 9 ATK 8 DEF\n* DIFFICULTY: EASY\n* A speaker-bot on treads. Loud.'},
/* story-only (Square Village mini boss 8): THE PRETENDER (real name Jack, he): a nervous figure in a pink-painted scout cloak and smiley mask,
   pretending to be corrupted (yellow mask / brown cloak underneath). Song: an mp3 (music.js 'pretender'), the user's
   re-uploaded cut (2026-11-25): 48 bars. Beat 0 = its first hit at .02 s; it loops from there to beat 192 (86.60 s, introBeats 0, loopBeats 192,
   whole: no beat skip). bpm 133.05 (the user's 133, measured; at 133 the loop ended 30 ms after the last sound faded, a tiny gap the user heard).
   The file's last .35 s are silent export padding (skipped).
   HP 150 / 9 ATK / 8 DEF (the DEF lives in story.js), all final. */
{n:'THE PRETENDER',d:'EASY',dc:'#7dff3d',hp:150,bpm:133.05,mp3:'pretender',off:.02,introBeats:0,loopBeats:192,song:'Electric Children Sucks',artist:'Electric Children',dmg:9,warn:2,bn:10,rs:200,rn:8,act:35,story:1,intro:'* The Pretender shuffles into view.\n* He seems bothered about something.',fl:['* The Pretender adjusts his mask. Twice.','* The Pretender hums along. Off-key. Nervously.','* He looks like he wants to say something\n* But can\'t bring the courage to do so.'],chk:'* THE PRETENDER - 9 ATK 8 DEF\n* DIFFICULTY: EASY\n* Real name Jack.\n* He\'s just trying to blend in.'},
/* story-only (Square Village boss): SQUARE SOULCERER, a big white square in fancy armor (corner guards with filigree, shoulder plates, crown,
   cape); pink corruption cracks; pure = pale blue + gold. Song generated in code ('march': "Iron Oath", G minor, 120 BPM).
   HP 220; hits 12 on the genocide route, 10 otherwise (storyTaken -2); DEF 9 / 12 genocide (story.js); all final. The CHECK is rebuilt per route. */
{n:'SQUARE SOULCERER',d:'SOULCERER',dc:'#ffd23f',hp:220,bpm:120,key:55,gen:'march',song:'Iron Oath',genre:'Synth-march',dmg:12,warn:1.25,bn:12,rs:300,rn:14,act:25,story:1,intro:'* The Square Soulcerer rises on its pedestal.\n* Its crown catches the light.',fl:['* The Soulcerer stands perfectly still.\n* Not a single corner out of place.','* Its cape stirs, though there is no wind.','* The jewel in its crown pulses with the beat.'],chk:'* SQUARE SOULCERER - 12 ATK 9 DEF\n* DIFFICULTY: SOULCERER\n* A knight of the old war.\n* It never left its post.'}];
const ACTS=[null,
[{n:'Clap',m:35,t:'* You clap along with the beat.\n* Pulsar seems pleased with your contribution.'},
 {n:'Vibe',m:25,t:'* You sway your arms and hips.\n* Pulsar seems impressed by your moves.',t2:"* Pulsar's ATTACK decreases!",adj:-2}],
[{n:'Headbang',m:35,t:'* You and Maw headbang to the dub.\n* But the intense head movement gives you headaches...\n* Your DEFENSE decreased.',adj:1},
 {n:'Brush Teeth',m:30,t:"* You offer to clean Maw's teeth.\n* His spikes perk up and he seems to be excited!",gr:1}],
[{n:'Pray',m:25,t:'* You kneel and pray to the Soulcerer.\n* Its light softens for a moment.'},
 {n:'Polish Armor',m:20,t:"* You polish the Soulcerer's armor.\n* It shines a little brighter.",t2:"* The Soulcerer's next attack weakens!",adj:-2},
 {n:'Mock',m:0,t:"* You laugh at the statue.\n* Its visor glows brighter. It didn't like that.",t2:"* The Soulcerer's next attack strengthens!",adj:2}],
/* Racer */
[{n:'Race',m:35,fx:'race',an:'race',t:'* You challenge Racer to a race.\n* You lose badly, but Racer seems thrilled to have a rival.'},
 {n:'Pit Stop',m:20,an:'pit',t:'* You give Racer a quick pit stop and fresh tires.\n* He cools down a little.',t2:"* Racer's next attack weakens!",adj:-2},
 {n:'Honk',m:0,t:'* You honk at Racer to hurry up.\n* Racer takes it as a challenge!',t2:"* Racer's next attack strengthens!",adj:2}],
/* Tanga */
[{n:'Cheer',m:35,an:'cheer',t:'* You cheer for Tanga.\n* Her leaves rustle with joy.'},
 {n:'Water',m:20,fx:'water',an:'water',t:"* You water Tanga's roots.\n* She shakes the water off her leaves onto you."},
 {n:'Boo',m:0,fx:'boo',t:"* You boo Tanga's routine.\n* She drops her pom-poms in shock!",t2:'* Her next twirl will be an angry one!'}],
/* $lug Thug: special ACTs (fx), worked out in slugAct */
[{n:'Compliment',m:30,fx:'luck',an:'compl',t:'* You compliment $lug Thug\'s seashell bling.\n* He smirks. "Ya got taste."',t2:'* $lug Thug will drop 2 extra lucky coins next time it rains!'},
 {n:'Pay Up (10 BC)',m:50,fx:'pay',an:'pay'},
 {n:'Salt',m:-15,fx:'salt'}],
/* Neutlin: Comfort (+35 mercy), Share the Hood (+20 mercy, the party recovers SHARE_SP SP), Tug Hood (0 mercy: their DEF drops by 2 for the rest of the fight, no stacking, and
   they sulk inside the hood for a turn). Each plays an ACT animation (an); Tug Hood plays even though it gives no mercy (anx). */
[{n:'Comfort',m:35,an:'call',t:"* You kneel down and gently pat Neutlin's hood.",t2:'* Neutlin peeks out from under the hood.\n* They feel a bit relieved...'},
 {n:'Share the Hood',m:20,fx:'share',an:'share',t:'* You crouch under the hood next to Neutlin.\n* They scoot over to make room.'},
 {n:'Tug Hood',m:0,fx:'tug',an:'tug',anx:1,t:"* You yank Neutlin's hood down over their face.\n* They squeak and sink deep into the cloak.",t2:"* Neutlin's defense decreased!"}],
/* Pancy: Applaud (+35), Straighten Halo (+20; her NEXT attack runs 20% slower), Ruffle Feathers (0; her NEXT attack's warnings are shorter).
   Each plays an ACT animation; Ruffle Feathers plays even though it gives no mercy (anx). */
[{n:'Applaud',m:35,an:'applaud',t:"* You applaud Pancy's archery.\n* She takes a proud little bow."},
 {n:'Straighten Halo',m:20,fx:'halo',an:'halo',t:"* You reach up and straighten Pancy's halo.\n* She calms down a little.",t2:"* Pancy's next attack will be slower."},
 {n:'Ruffle Feathers',m:0,fx:'ruffle',an:'ruffle',anx:1,t:"* You ruffle Pancy's wings.\n* She gets all flustered!",t2:"* Pancy's next attack will give less warning!"}],
/* Darius & Kipto: Fist Bump (+35, the party recovers SHARE_SP SP), Scratch Chin (+30; Kipto's NEXT attack moves at 75% speed),
   Mess Up Hair (0; Darius is furious: the NEXT attack is a bigger Blob Splat, 10 blobs, so Kipto doesn't sweep). Each plays an ACT animation. */
[{n:'Fist Bump',m:35,fx:'bump',an:'bump',t:'* You hold out your fist.\n* Darius bumps it, grinning.'},
 {n:'Scratch Chin',m:30,fx:'chin',an:'chin',t:"* You scratch under Kipto's chin.\n* Kipto melts into it.",t2:"* Kipto's next attack will be slower."},
 {n:'Mess Up Hair',m:0,fx:'hair',an:'hair',anx:1,t:"* You ruffle Darius's spiky hair.\n* He is NOT happy about it.",t2:"* Darius's next attack will be bigger!\n* ...but Kipto is staying out of it."}],
/* Tourette Turret: Polish Speaker (+35), Turn Down (+25; its NEXT attack has fewer shots), Crank It Up (0; its NEXT attack has about a third
   more shots, but its DEF drops by 2 for the rest of the fight, no stacking). Each plays an ACT animation; Crank It Up plays even though it gives no mercy (anx). */
[{n:'Polish Speaker',m:35,an:'polish',t:'* You polish the grille of its speaker-eye.\n* Tourette Turret blinks, its eye shining.'},
 {n:'Turn Down',m:25,fx:'quiet',an:'quiet',t:"* You turn Tourette Turret's volume knob down.\n* It hums a little quieter.",t2:"* Tourette Turret's next attack will be quieter."},
 {n:'Crank It Up',m:0,fx:'crank',an:'crank',anx:1,t:'* You crank its volume all the way up!\n* Tourette Turret shakes and screeches!',t2:'* Its next attack will be LOUDER!\n* ...but its armor rattled loose.'}],
/* The Pretender: Call Him Jack (+35; +50 once you have Scratched the Paint), Play Along (+25; his NEXT attack runs at 75% speed),
   Scratch the Paint (0; his NEXT attack runs at 125% speed, and Call Him Jack gives +50 for the rest of the fight; a brown scratch stays on his cloak).
   Each plays an ACT animation; Scratch the Paint plays even though it gives no mercy (anx). */
[{n:'Call Him Jack',m:35,fx:'jack',an:'jack',t:'* You call him by his real name.\n* The Pretender freezes... then gives a tiny nod.'},
 {n:'Play Along',m:25,fx:'along',an:'along',t:'* You act corrupted too. "Rrrgh. Corruption."\n* The Pretender relaxes a little.',t2:"* The Pretender's next attack will be slower."},
 {n:'Scratch the Cloak',m:0,fx:'scratch',an:'scratch',anx:1,t:"* You scratch his cloak. It's brown underneath!\n* The Pretender panics!",t2:'* His next attack will be faster...\n* ...but now you know the truth.'}],
/* Square Soulcerer: Salute (+25), Kneel (+20; its next attack weakens, adj -2), Challenge (0; its next attack strengthens, adj +2,
   and if NOBODY is hit that turn it gains +35 mercy out of respect: sqChal / sqDuel / sqHit). */
[{n:'Salute',m:25,t:'* You give the Soulcerer a firm salute.\n* It straightens. Somehow, it seems proud.'},
 {n:'Kneel',m:20,t:'* You kneel before the Soulcerer.\n* Its cape settles around it.',t2:"* The Soulcerer's next attack weakens!",adj:-2},
 {n:'Challenge',m:0,fx:'duel',t:'* You challenge the Soulcerer to a duel!\n* Its crown flares. It accepts.',t2:'* Its next attack strengthens...\n* Take no hits, and it will respect you.',adj:2}]];
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
   It always plays in this order (phase 2 doesn't change the song).
   Chords are semitones above the key (A minor); melodies are 8th notes above key+12 (null = rest). */
const OI=[0,3,7],OVI=[-4,0,3],OIII=[3,7,10],OVII=[-2,2,5],OIV=[5,8,12],OV=[7,11,14],__=null;
const ORCH_MEL={
verse:[[0,__,3,__,7,__,5,3],[2,__,3,__,0,__,__,__],[8,__,7,__,5,__,3,__],[5,__,3,__,0,__,__,__],[7,__,10,__,12,__,10,7],[5,__,7,__,3,__,__,__],[10,__,7,__,5,__,2,__],[11,__,__,__,7,__,__,__]],
chorus:[[12,__,15,__,14,12,10,12],[8,__,12,__,15,14,12,10],[7,__,10,__,12,15,14,12],[10,__,14,__,12,10,7,__]],
brk:[[8,__,__,__,7,__,5,__],[7,__,__,__,10,__,12,__],[10,__,__,__,7,__,5,__],[3,__,__,__,__,__,__,__]]};
const ORCH=[{n:'intro',len:8,ch:[OI,OVI,OIII,OVII]},{n:'verse',len:16,ch:[OI,OI,OVI,OVI,OIII,OIII,OVII,OV]},{n:'build',len:8,ch:[OIV,OIV,OVI,OVI,OVII,OVII,OV,OV]},{n:'chorus',len:16,ch:[OI,OVI,OIII,OVII]},{n:'brk',len:8,ch:[OVI,OIII,OVII,OI,OVI,OIII,OVII,OV]}];
const ORCH_LEN=56,ORCH_LOOP=8;
function orchSec(sb){let s=0;for(const sec of ORCH){if(sb<s+sec.len)return{sec,i:sb-s};s+=sec.len}return{sec:ORCH[0],i:0}}
function orchBar(bar){if(mus.lb===bar)return;mus.lb=bar;mus.sb=mus.sb==null?0:mus.sb+1;if(mus.sb>=ORCH_LEN)mus.sb=ORCH_LOOP}
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
/* ---------- Square Soulcerer: "Iron Oath" (approved draft) ----------
   A heavy march in sections (56 bars, ~112 s at 120 BPM): intro 8 > march 16 > build 8 > anthem 16 > breakdown 8, then back to the march.
   Chords are semitones above the key (G minor); melodies are 8th notes above key+12 (null = rest). */
const MC={i:[0,3,7],VI:[-4,0,3],VII:[-2,2,5],V:[7,11,14],iv:[5,8,12]};
const MARCH=[{n:'intro',len:8,ch:[MC.i,MC.i,MC.VI,MC.VI,MC.iv,MC.iv,MC.V,MC.V]},{n:'march',len:16,ch:[MC.i,MC.i,MC.VI,MC.VII,MC.i,MC.iv,MC.V,MC.i]},{n:'build',len:8,ch:[MC.iv,MC.iv,MC.VI,MC.VI,MC.VII,MC.VII,MC.V,MC.V]},{n:'anthem',len:16,ch:[MC.i,MC.VI,MC.iv,MC.V]},{n:'brk',len:8,ch:[MC.VI,MC.iv,MC.i,MC.V,MC.VI,MC.iv,MC.V,MC.V]}];
const MARCH_MEL={march:[[0,__,0,3,7,__,5,3],[2,__,__,__,-2,__,__,__],[3,__,3,5,7,__,8,7],[5,__,__,__,2,__,__,__],[7,__,7,8,10,__,8,7],[5,__,3,__,2,__,-2,__],[0,__,3,__,2,__,-2,__],[0,__,__,__,__,__,__,__]],
 anthem:[[12,__,10,__,8,__,7,__],[8,__,7,__,5,__,3,__],[5,__,7,__,8,__,10,__],[11,__,__,__,7,__,__,__]],
 horn:[[0,__,__,__,7,__,__,__],[3,__,__,__,2,__,__,__],[5,__,__,__,3,__,__,__],[2,__,__,__,__,__,__,__]],
 brk:[[7,__,__,__,5,__,__,__],[3,__,__,__,2,__,__,__],[0,__,__,__,-2,__,__,__],[2,__,__,__,__,__,__,__]]};
const MARCH_LEN=56,MARCH_LOOP=8;
function marchSec(sb){let s=0;for(const sec of MARCH){if(sb<s+sec.len)return{sec,i:sb-s};s+=sec.len}return{sec:MARCH[0],i:0}}
function marchBar(bar){if(mus.lb===bar)return;mus.lb=bar;mus.sb=mus.sb==null?0:mus.sb+1;if(mus.sb>=MARCH_LEN)mus.sb=MARCH_LOOP}
/* brass: saw + sub square through a lowpass that opens on the attack */
function brass(f,t,d,v){if(!AC)return;const o=AC.createOscillator(),o2=AC.createOscillator(),fl=AC.createBiquadFilter(),g2=AC.createGain();o.type='sawtooth';o2.type='square';o.frequency.value=f;o2.frequency.value=f/2;fl.type='lowpass';fl.frequency.setValueAtTime(400,t);fl.frequency.linearRampToValueAtTime(2200,t+.06);fl.frequency.linearRampToValueAtTime(1200,t+d);
 g2.gain.setValueAtTime(.0001,t);g2.gain.linearRampToValueAtTime(v,t+.04);g2.gain.setValueAtTime(v,t+d*.75);g2.gain.linearRampToValueAtTime(.0001,t+d);o.connect(fl);o2.connect(fl);fl.connect(g2);g2.connect(master);[o,o2].forEach(q=>{q.start(t);q.stop(t+d+.05)})}
function marchStep(b,t,st,spb){const key=b.key,{sec,i}=marchSec(mus.sb||0),n=sec.n,c=sec.ch[i%sec.ch.length],root=key-24+c[0],
 timp=(m,v)=>{tone(mtof(m),t,.6,'sine',v||.5,mtof(m)*.85);noise(t,.08,.15,400)},snare=v=>{noise(t,.12,v||.28,1900);tone(200,t,.06,'triangle',.1,120)},kick=v=>tone(140,t,.2,'sine',v||.8,40),
 lead=(m,v,d)=>{if(m!=null)brass(mtof(key+12+m),t,d,v)};
 if(st==0&&n!='build')for(const q of c)strg(mtof(key+q),t,spb*4,n=='anthem'?.05:.035);
 if(n=='intro'){if(i<4)snare(.05+.05*(i+st/16)/4);if(st==0)timp(root+12,.55);if(st==8&&i%2)timp(root+19,.4);if(i>=4&&st%2==0)lead(MARCH_MEL.horn[i%4][st>>1],.08,spb*.9)}
 else if(n=='march'){if(st==0||st==8)kick();if(st==4||st==12)snare();if(st==14||st==15)snare(.12);if(st==6)snare(.08);if(st%4==0)timp(root+12,.25);
  if(st%2==0){tone(mtof(root+(st%4?7:0)),t,spb*.45,'triangle',.3);lead(MARCH_MEL.march[i%8][st>>1],.065,spb*.45)}}
 else if(n=='build'){snare(.05+.02*i);if(i>=6&&st%2==0)kick(.7);if(st==0)tone(mtof(root),t,spb*4,'sawtooth',.1);if(st%4==0)brass(mtof(key+c[(st>>2)%3]),t,spb*.9,.04+.006*i)}
 else if(n=='anthem'){if(i==0&&st==0)noise(t,1.2,.2,3500);if(st%4==0)kick();if(st==4||st==12)snare(.32);if(st%2)noise(t,.03,.06,9000);if(st%2==0)tone(mtof(root+12*((st>>1)&1)),t,spb*.45,'sawtooth',.18);
  lead(st%2==0?MARCH_MEL.anthem[i%4][st>>1]:null,.075,spb*.45);if(st==0){tone(mtof(key+24+c[2]),t,1,'triangle',.06);tone(mtof(key+24+c[2])*2.01,t,.6,'sine',.024);timp(root+12,.45)}}
 else{if(st==0){timp(root+12,.4);tone(mtof(root),t,spb*4,'sine',.2)}if(st%2==0){const m=MARCH_MEL.brk[i%4][st>>1];if(m!=null)brass(mtof(key+12+m),t,spb*1.8,.05)}}}
const CHM=[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],CHN=[[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]];
function startMusic(b){if(!AC)initAudio();const spb=60/b.bpm;mus={b,spb,t0:(AC?AC.currentTime:0)+.2,step:0,timer:setInterval(sched,25)};bt=-.2/spb;if(b.mp3&&typeof trackBuffer=='function')trackBuffer(b.mp3)}
function stopMusic(){if(mus){clearInterval(mus.timer);if(mus.src)try{mus.src.stop()}catch(e){}mus=null}}
function sched(){if(!mus||!AC)return;if(mus.b.mp3){mp3Sched();return}master=mG;try{sched2()}finally{master=sG}}
/* mp3 boss songs (music.js): beat 0 is b.off seconds into the mp3. b.introBeats (optional) play once; after that the
   next b.loopBeats beats loop forever, so the beat clock (bt) stays on the song's beat. Restarted at the right spot
   if the clock is re-synced. */
/* Off-beat loops (a loopBeats that isn't whole, like the Turret's): the music jumps back 1/3 beat "early", so the beat
   clock skips ahead to the next whole beat at each loop. musBt: raw clock beats -> game beats; musRaw: the reverse. */
const musLoop=()=>{const b=mus&&mus.b;if(!b||!b.mp3||!b.loopBeats||b.loopBeats%1==0)return null;return{B0:b.introBeats!=null?b.introBeats:-(b.off||0)/mus.spb,L:b.loopBeats,W:Math.ceil(b.loopBeats)}};
function musBt(r){const o=musLoop();if(!o||r<o.B0+o.L)return r;const n=Math.floor((r-o.B0)/o.L);return o.B0+n*o.W+(r-o.B0-n*o.L)}
function musRaw(x){const o=musLoop();if(!o||x<o.B0+o.L)return x;const n=Math.floor((x-o.B0)/o.W);return o.B0+n*o.L+Math.min(x-o.B0-n*o.W,o.L)}
function mp3Sched(){const b=mus.b,buf=typeof BUF!='undefined'&&BUF.ready[b.mp3];
if(mus.src&&AC.state=='running'&&Math.abs(mus.srcT0-mus.t0)>.03){try{mus.src.stop()}catch(e){}mus.src=null}
if(mus.src)return;if(!buf){trackBuffer(b.mp3);return}
const sp=mus.spb,ls=b.introBeats!=null?(b.off||0)+b.introBeats*sp:0/* introBeats 0 = loop from beat 0 itself (skips any padding before it) */,L=b.loopBeats?b.loopBeats*sp:buf.duration-ls,le=Math.min(ls+L,buf.duration),
 zero=mus.t0-(b.off||0),at=Math.max(AC.currentTime+.05,zero),p=at-zero,pos=p<le?p:ls+((p-ls)%(le-ls));
const s=AC.createBufferSource();s.buffer=buf;s.loop=true;s.loopStart=Math.max(0,ls);s.loopEnd=le;s.connect(typeof trackOut=='function'?trackOut(b.mp3):mG)/* each song's loudness gain (music.js) */;s.start(at,pos);mus.src=s;mus.srcT0=mus.t0}
function sched2(){if(!mus||!AC)return;const{b,spb,t0}=mus,key=b.key;
while(t0+mus.step*spb/4<AC.currentTime+.15){const k=mus.step,t=t0+k*spb/4,st=k%16,bar=k>>4,ch=(b.gen=='chip'?CHM:CHN)[bar%4],r=key-24+ch[0];
if(b.gen=='orch'&&st==0)orchBar(bar);if(b.gen=='march'&&st==0)marchBar(bar);
if(t<AC.currentTime-.1){mus.step++;continue}
if(b.gen=='orch')orchStep(b,t,st,spb);else if(b.gen=='march')marchStep(b,t,st,spb);
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
/* Star Soulcerer: one of four attacks per turn, never the same one twice in a row.
   0 Star Blazing, 1 visor beam, 2 constellations, 3 sword swing.
   Times are in beats (150 BPM: 2.5 beats = 1 second). Phase 2 (low HP): denser and faster. */
()=>{const p2=lowHp(),opts=[0,1,2,3].filter(k=>k!==lastSoulAtk),k=opts[Math.floor(r()*opts.length)];lastSoulAtk=k;
if(k==0){/* Star Blazing (no giant star): big stars fall diagonally, each bursts into 6 small stars */
 for(let B=2;B<26;B+=p2?1.6:2)e.push({b:B,t:'b',x:BX-130+r()*(BW+60),y:BY-30,vx:150,vy:230,r:16,st:24,spin:4,bur:(.75+r()*.6)*2.5,m:140})}
else if(k==1){/* visor beam: tracks a player, locks, fires; 6 squares fan out of the hit and float away */
 const n=p2?5:4,gap=p2?6:7.5;for(let j=0;j<n;j++)e.push({b:2+j*gap,t:'beam',track:p2?3.2:4,lock:1,fire:1.4})}
else if(k==2){/* constellations: two shapes connect dot by dot (warning), then go solid */
 /* the first wave starts right away with a shorter warning; waves keep coming until the turn is over
    (the next warning starts while the last shapes are still lit) */
 const n=p2?7:6,gap=p2?4.6:5.75;for(let j=0;j<n;j++)e.push({b:j*gap,t:'con',warn:j?(p2?3.2:4):(p2?2.2:2.5),dur:2.75})}
else{/* sword swing from a random side, in a random direction */
 const n=p2?5:4,gap=p2?6:7.5;for(let j=0;j<n;j++)e.push({b:2+j*gap,t:'sword',warn:4.75,swing:1.125,fade:.9})}},
/* Racer (EASY): one of three attacks per turn, never the same one twice in a row. Times in beats (144 BPM: 2.4 beats = 1 s).
   0 Shotgun Blast: the pipes stretch and aim at a player, lock onto where they stood, then fire two 5-pellet blasts.
   1 Rally Lanes: the board becomes a 3-lane road; cars zoom along 1-2 warned lanes (one lane is always clear).
   2 Smoke Screen: Racer drives off, then makes 3 passes along the top, dropping gray smoke clouds that drift down. */
()=>{const opts=[0,1,2].filter(k=>k!==lastRacerAtk),k=opts[Math.floor(r()*opts.length)];lastRacerAtk=k;
if(k==0){for(let j=0;j<4;j++)e.push({b:1+j*SHOT.cyc,t:'shot',first:j==0,last:j==3})}
else if(k==1){e.push({b:0,t:'road',dur:TL});
 for(let w=0;w<5;w++){const lanes=[0,1,2].sort(()=>r()-.5).slice(0,r()<.5?1:2);lanes.forEach(L=>e.push({b:1+w*7,t:'lane',lane:L,dir:r()<.5?1:-1,warn:2.5,n:r()<.5?1:2,gap:.7,spd:520}))}}
else{e.push({b:0,t:'drive'});for(let p=0;p<SMOKE.n;p++)for(let j=.8;j<SMOKE.pass-.6;j+=1)e.push({b:SMOKE.out+p*SMOKE.pass+j,t:'puff'})}},
/* Tanga (EASY): one of three attacks per turn, never the same one twice in a row. Times in beats (160 BPM: 2.67 beats = 1 s).
   0 Pom-Pom Toss: a dotted loop shows the path, then a pom-pom flies it like a boomerang, shedding leaves.
     Three single throws (alternating hands), then two double throws.
   1 Twirl Tornado: a spot is marked, then 2 slowly turning spiral arms of leaves shoot out of it while she twirls.
   2 Root Kick Line: 3 cracks on the top / bottom edges (corners too); then all 3 roots burst out, wiggle and sink. */
()=>{const opts=[0,1,2].filter(k=>k!==lastTangaAtk&&!(k==0&&tangaNoPom)),k=opts[Math.floor(r()*opts.length)];lastTangaAtk=k;   /* Boo: no Pom-Pom Toss next turn */
if(k==0){[[1,[1]],[7,[-1]],[13,[1]],[19,[-1,1]],[26,[-1,1]]].forEach(([b,sides])=>sides.forEach(s=>e.push({b,t:'pom',side:s,warn:2.5,fly:5,aim:r()<.5})))}
else if(k==1){const arms=tangaAngry?3:2;tangaAngry=0;[1,11.5,22].forEach((b,j)=>e.push({b,t:'tor',warn:4,dur:8,dir:j%2?-1:1,arms}))}   /* Boo: an angry twirl has 3 arms */
else{[1,12,23].forEach(b=>e.push({b,t:'root',warn:7,up:.4,wig:3,down:.9}))}},
/* $lug Thug (EASY): one of three attacks per turn, never the same one twice in a row. Nothing aims at players.
   Times in beats (107 BPM: 1.78 beats = 1 s).
   0 Make It Rain: pink coins and bills fall in random columns (a mark flashes at the top first); 1-4 sparkly gold
     coins fall slower among them: catching one gives +1 BC, and the turn ends with "* You caught X BC!".
   1 Slime Puddles: he spits slime balls (mouth goes "o") at random spots, corners included; each lands on its
     shadow and leaves a puddle that hurts for a few seconds, then dries.
   2 Seashell Shuffle: walls of shells slide across the board with 1-2 gaps; arrows on the edge warn first. */
()=>{const opts=[0,1,2].filter(k=>k!==lastSlugAtk),k=opts[Math.floor(r()*opts.length)];lastSlugAtk=k;
if(k==0){for(let B=1;B<30;B+=.5)e.push({b:B,t:'cash',kind:r()<.35?'bill':'coin',x:BX+24+r()*(BW-48),ph:r()*6});
 const n=1+Math.floor(r()*4)+slugLuck;slugLuck=0;   /* Compliment adds 2 lucky coins to the next rain */
 for(let j=0;j<n;j++)e.push({b:3+j*(24/n)+r()*3,t:'cash',kind:'gold',x:BX+60+r()*(BW-120),ph:0})}
else if(k==1){for(let B=1;B<26;B+=2)e.push({b:B,t:'spit'})}
else{for(let j=0;j<9;j++){const B=1+j*3,dir=Math.floor(j/2)%2?-1:1,g1=Math.floor(r()*(SHELL.n-1)),gaps=[g1,g1+1];
 if(r()<.35){let g2,t=0;do{g2=Math.floor(r()*SHELL.n);t++}while(t<30&&(Math.abs(g2-g1)<3||Math.abs(g2-g1-1)<3));if(t<30)gaps.push(g2)}e.push({b:B,t:'shellw',dir,gaps})}}},
/* Neutlin (EASY): one of three attacks per turn, never the same one twice in a row. Nothing follows or aims at a player.
   Times in beats (111 BPM: 1.85 beats = 1 s). Spots / gaps are random but fixed once chosen.
   0 Peekaboo: 7 waves of 2-3 eye pairs in dark spots; they blink twice, then each spot pops into 8 slow pellets.
   1 Cloak Curtain: 5 sweeps; fold lines + arrows + dashed lines mark the gap first, then a cloth panel with a zigzag hem crosses the board.
   2 Pout Stomp: 5 waves of 2 stomps; a dashed mark shows where it will land, it hops, then a ring (and a fainter one) spreads out. */
()=>{const opts=[0,1,2].filter(k=>k!==lastNeutAtk),k=opts[Math.floor(r()*opts.length)];lastNeutAtk=k;
if(k==0){const ws=[...NEUT_WAVES].sort(()=>r()-.5);for(let j=0;j<7;j++)ws[j%ws.length].forEach(s=>e.push({b:1+j*4,t:'peek',x:BX+NEUT_SPOTS[s][0],y:BY+NEUT_SPOTS[s][1],warn:PEEK.warn}))}
else if(k==1){let lg=-1;for(let j=0;j<5;j++){let g,n=0;do{g=BY+CURT.gapH/2+10+r()*(BH-CURT.gapH-20);n++}while(lg>0&&Math.abs(g-lg)<60&&n<30);lg=g;e.push({b:1+j*5.5,t:'curt',dir:j%2?-1:1,gy:g,warn:CURT.warn})}}
else{for(let j=0;j<5;j++){const B=1+j*6,p1=[BX+60+r()*(BW-120),BY+40+r()*(BH-80)];let p2,n=0;do{p2=[BX+60+r()*(BW-120),BY+40+r()*(BH-80)];n++}while(n<30&&Math.hypot(p1[0]-p2[0],p1[1]-p2[1])<200);e.push({b:B,t:'stomp',x:p1[0],y:p1[1],warn:STOMP.warn},{b:B+.5,t:'stomp',x:p2[0],y:p2[1],warn:STOMP.warn})}}},
/* Pancy (EASY): one of three attacks per turn, never the same one twice in a row. Times in beats (120 BPM: 2 beats = 1 s).
   0 Arrow Rain: she floats to the right side; 10 arrows one at a time (mark on the floor, then it falls and sticks); then the sneak shot
     (her face turns sinister, then ONE fast red-tipped arrow straight at a player, aimed when fired; it explodes on the wall into 8 fireballs).
   1 Volley: arrows fall straight down through the board in columns marked on the top edge; solid pink clouds drift left over them (they hurt).
   2 Swoop: she flies up out of sight; 4 dives, each down a lane near the middle marked with 3 down arrows first. */
()=>{const opts=[0,1,2].filter(k=>k!==lastPancyAtk),k=opts[Math.floor(r()*opts.length)];lastPancyAtk=k;
if(k==0){e.push({b:0,t:'pmove',dur:TL});let lx=-999;for(let j=0;j<10;j++){let x,n=0;do{x=BX+40+r()*(BW-150);n++}while(Math.abs(x-lx)<90&&n<30);lx=x;e.push({b:2+j*2.4,t:'arw',x,warn:ARW.warn*pancyWarn})}e.push({b:26.5,t:'snk',fw:SNK.fire*pancyWarn})}
else if(k==1){for(let B=1;B<30;B+=4.5)e.push({b:B,t:'cloud',y:BY+40+r()*(BH-80)});e.push({b:.5,t:'vup'});let lx=-999;for(let j=0;j<COL.n;j++){let x,m=0;do{x=BX+30+r()*(BW-60);m++}while(Math.abs(x-lx)<120&&m<40);lx=x;e.push({b:1.5+j*COL.gap,t:'col',x,warn:COL.warn*pancyWarn})}}   /* Volley: one fan of 24 shot up at the start, then they come down one by one */
else{e.push({b:0,t:'pgone',dur:TL});let la=null;for(let j=0;j<SWP.n;j++){let a,n=0;do{a=r()*Math.PI*2;n++}while(la!=null&&Math.abs((((a-la)%6.2832)+9.4248)%6.2832-3.1416)<.8&&n<30);la=a;e.push({b:3+j*SWP.gap,t:'swp',ang:a,off:(r()*2-1)*SWP.off,warn:SWP.warn*pancyWarn})}}}   /* Swoop: 5 dives, any direction, through the middle */,
/* 9 DARIUS & KIPTO: one attack per turn, never the same twice in a row. Yellow (Darius) drains SP, pink (Kipto) hurts HP.
   0 Blob Splat (Darius): 7 big yellow blobs lobbed onto marked spots, each splats into 6 small blobs flying outward.
   1 Serpent Sweep (Kipto): 5 sweeps along wavy paths shown first, alternating sides; his whole body hurts.
   2 Team attack: Kipto flies straight through lanes in the upper board while Darius drops 2 blobs per pass onto the floor; they splash up in a fan. */
()=>{const opts=dkMad?[0]:[0,1,2].filter(k=>k!==lastDariusAtk),k=opts[Math.floor(r()*opts.length)];lastDariusAtk=k;   /* after Mess Up Hair: always Blob Splat, 10 blobs */
if(k==0){const nb=dkMad?10:7,gp=dkMad?2.6:3.8;let last=null;for(let j=0;j<nb;j++){let x,y,n=0;do{x=BX+60+r()*(BW-120);y=BY+40+r()*(BH-80);n++}while(last&&Math.hypot(x-last[0],y-last[1])<160&&n<30);last=[x,y];e.push({b:1.5+j*gp,t:'blb',x,y,a0:r()*6.28,warn:BLB.warn})}}
else if(k==1){e.push({b:0,t:'dkgone',dur:TL});for(let j=0;j<5;j++)e.push({b:1+j*6,t:'ksw',dir:j%2?-1:1,amp:35+r()*45,wl:180+r()*140,mid:BY+60+r()*(BH-120),ph:r()*6.28,warn:KSW.warn})}
else{e.push({b:0,t:'dkgone',dur:TL});for(let j=0;j<5;j++){const xs=[];let n=0;while(xs.length<2&&n<40){const x=BX+90+r()*(BW-180);if(xs.every(q=>Math.abs(q-x)>170))xs.push(x);n++}e.push({b:1+j*6,t:'kst',dir:j%2?-1:1,y:BY+35+r()*80,xs,warn:KST.warn})}}},
/* 10 TOURETTE TURRET: one attack per turn, never the same twice in a row. All pink (HP).
   0 Sound Waves: a ring from its speaker eye every 3 beats (11), each with a gap at a new angle.
   1 Volume Bars: 4 volume bars on the floor (2 per wall) snap to new heights every 2 beats (dashed preview); 2 rectangular speakers take
     turns landing on every beat of the song, each firing 6 pellets as it lands.
   2 Beam Fire: it rolls along the top, stops, shows a dashed beam path with 2 bounces, then fires the beam along it (10 per turn).
   trQ (this turn, from the ACTs): 1 = Turn Down: 8 rings every 4 beats / 4 pellets per burst / 7 beams every 4 beats. 2 = Crank It Up: 15 rings every
   2 beats / 8 pellets per burst / 3 of the 10 stops fire a second beam at once (13 beams). */
()=>{const opts=[0,1,2].filter(k=>k!==lastTurretAtk),k=opts[Math.floor(r()*opts.length)],Q=trQ;lastTurretAtk=k;
if(k==0){const N=Q==1?8:Q==2?15:11,gp=Q==1?4:Q==2?2:3;let la=null;for(let j=0;j<N;j++){let a,n=0;do{a=Math.PI*(.15+.7*r());n++}while(la!=null&&Math.abs(a-la)<.45&&n<20);la=a;e.push({b:1+j*gp,t:'swv',a})}}   /* a ring every 3 beats */
else if(k==1){const hs=[];for(let s=0;s<19;s++)hs.push([.45+r()*.45,.25+r()*.45,.25+r()*.45,.45+r()*.45]);e.push({b:0,t:'vol',dur:TL,hs,ln:-1,a0:r(),np:Q==1?4:Q==2?8:6})}
else{const N=Q==1?7:10,gp=Q==1?4:3,aim=(ox,a)=>{const[ex,ey]=trEye(ox),en=ex+(BY-ey)*Math.cos(a)/Math.sin(a);return en>BX+20&&en<BX+BW-20};let lo=0;
 for(let j=0;j<N;j++){let ox=0,a=Math.PI/2,n=0,ok=false;do{ox=-200+r()*400;a=Math.PI*(.25+.5*r());ok=aim(ox,a)&&Math.abs(ox-lo)>60;n++}while(!ok&&n<40);lo=ox;e.push({b:1+j*gp,t:'tbm',ox,a});
  if(Q==2&&j%3==1){let a2=0,n2=0,ok2=false;do{a2=Math.PI*(.25+.5*r());ok2=aim(ox,a2)&&Math.abs(a2-a)>.4;n2++}while(!ok2&&n2<40);if(ok2)e.push({b:1+j*gp,t:'tbm',ox,a:a2,dup:1})}}}},
/* 11 THE PRETENDER: one attack per turn, never the same twice in a row. All pink (HP).
   0 Mask Boomerang: 4 throws, 7 beats each (2 warn: the dashed path flashes, 4 flight, 1 back on): the spinning mask drops into one side of the
     board, sweeps across to the other side and returns to his face; the direction alternates and the sweep height changes each throw.
   1 Wet Paint: a drip every beat at a random spot (never next to the last): it forms at the top edge (1 beat), runs down (1 beat) and splats;
     the puddle hurts while wet (3 beats), then dries brown (safe) and fades.
   2 Copycat: a pink fake soul retraces its target's path 1 beat behind for 8 beats, then mirrors it across the centre line for 8, and so on;
     it flickers the beat before switching. Co-op: ONE copy; at each switch it picks the next player (outlined in that player's color). */
()=>{const opts=[0,1,2].filter(k=>k!==lastPretAtk),k=opts[Math.floor(r()*opts.length)];lastPretAtk=k;
const sp=prSpd;   /* Play Along .75 / Scratch the Paint 1.25: 3 or 5 throws, 3 or 5 drips per 4 beats, a lazier or snappier copy */
if(k==0){const d0=r()<.5?1:-1,gp=PMK.warn+PMK.back+PMK.fly/sp,N=Math.floor((TL-2)/gp);for(let j=0;j<N;j++)e.push({b:1+j*gp,t:'pmk',d:j%2?-d0:d0,row:250+r()*110,sp})}
else if(k==1){let lx=W/2;const B=[];for(let j=0;j<27;j++){if(sp<1&&j%4==3)continue;B.push(j);if(sp>1&&j%4==1)B.push(j+.5)}
 for(const b of B){let x,n=0;do{x=BX+30+r()*(BW-60);n++}while(Math.abs(x-lx)<120&&n<20);lx=x;const kk=[];for(let q=0;q<10;q++)kk.push(.8+r()*.4);e.push({b,t:'pdr',x,y:BY+40+r()*(BH-70),r:26+r()*16,k:kk,sp})}}
else e.push({b:0,t:'pcc',dur:TL,t0i:Math.floor(r()*12),sp})},
/* 12 SQUARE SOULCERER: one of four attacks per turn, never the same one twice in a row. Phase 2 (low HP): denser and faster.
   0 Checkerboard: a 10x4 grid; every 4 beats a pattern of squares is outlined (2 beats), then lights up and hurts (1 beat), then a beat's rest. P2: every 3 beats (2 + 1).
   1 Cornerstones: a corner guard flies off (1 beat marker, half-beat throw), slams on the beat with a square shockwave, then returns;
     corners one at a time every 4 beats, then all four at once. P2: two at a time, bigger + faster shockwave.
   2 Royal Cape: every 4 beats an arrow + gap marker (1 beat), then a rippling cape wall with one gap sweeps across (2 beats); alternates sides.
     P2: every 3 beats, a slightly smaller gap.
   3 Crown Jewels: the crown fires a spinning square gem (1 beat path preview) that bounces off the walls 3 times; one every 2 beats, then one
     every beat for the second half of each 16 beats. P2: one every beat, 4 bounces. */
()=>{const p2=lowHp(),opts=[0,1,2,3].filter(k=>k!==lastSqAtk),k=opts[Math.floor(r()*opts.length)];lastSqAtk=k;
if(k==0){e.push({b:0,t:'qgrid',dur:TL});if(p2){for(let j=0;j<10;j++)e.push({b:1+3*j,t:'qck',p:j%10,w:2,on:1})}else for(let j=0;j<8;j++)e.push({b:1+4*j,t:'qck',p:j%10,w:2,on:1})}   /* slowed twice (user): every 4 beats (2 warn + 1 lit + 1 rest); P2 every 3 beats (2 + 1) */
else if(k==1){let lp=null;const tg=q=>{if(q!=null)return{x:BX+BW*(q%2?.78:.22)+(r()-.5)*50,y:BY+BH*(q>>1?.74:.26)+(r()-.5)*24};   /* spread out (user: wider gaps): together = opposite quadrants, near their outer corners */
  let p,n=0;do{p={x:BX+70+r()*(BW-140),y:BY+60+r()*(BH-120)};n++}while(lp&&Math.hypot(p.x-lp.x,p.y-lp.y)<240&&n<30);lp=p;return p};   /* one at a time: at least 240 px from the last one */
 if(p2){for(let j=0;j<8;j++){const a=j%2,b2=a+2;[a,b2].forEach((c,z)=>e.push({b:1+4*j,t:'qcs',c,big:1,...tg(z*3)}))}}
 else{[0,1,2,3].forEach(c=>e.push({b:1+4*c,t:'qcs',c,...tg()}));[0,1,2,3].forEach(c=>e.push({b:17,t:'qcs',c,...tg(c)}));[0,1,2].forEach(c=>e.push({b:21+4*c,t:'qcs',c,...tg()}))}}
else if(k==2){const N=p2?10:8,gp=p2?3:4,gap=p2?84:100/* widened (user): was 74 / 62 */,sw=p2?1.7:2,d0=r()<.5?1:-1;for(let j=0;j<N;j++)e.push({b:1+gp*j,t:'qcp',dir:j%2?-d0:d0,gy:BY+30+r()*(BH-60-gap),gap,sw})}
else{const bn=p2?4:3;for(let f=2;f<=32;f++){if(!p2&&!((f%16)>=8||f%2==0))continue;const P=sqGemPath(Math.PI/2+(r()-.5)*1.7,bn);e.push({b:f-1,t:'qcj',P,L:sqCum(P)})}}}][i];   /* Crank It Up: a second beam from the same stop */
if((uniq||D.story)&&uq)uq();else for(let k=1;k<8;k++){const B=k*4,p=Math.floor(r()*5);
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
const PUREC=['#d9ffc4','#ffe8b0','#ffc4c4','#ffe27a','#bfe3ff','#5fd63a','#d8c4ff','#bfe3ff','#fdf6ff','#4fcf8f','#eef3ff','#8a5a35','#bfe3ff'],hr=n=>{const x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
function winInit(sp){wxT=0;wsp=sp?1:0;wanim=0;wimg=null;wtiles=[];rBoom=0}
/* Racer doesn't fade away when fought: he shakes, glows, and EXPLODES (fireball, flying parts, smoke, a scorch mark) */
let rBoom=0;const BOOM_T=.5;
function drawRacerBoom(t){const bx=W/2,by=95,RF=SET.reduceFlash;
 if(t<BOOM_T){const k=t/BOOM_T,s=RF?0:k*k*7;g.save();g.translate(bx+(Math.random()-.5)*s,by+(Math.random()-.5)*s);g.scale(RACER_SC,RACER_SC);racerArt({low:1});
  g.globalAlpha=RF?.2:.15+.45*k*Math.abs(Math.sin(t*40));g.fillStyle='#ff3a1e';g.fillRect(-90,-34,180,62);g.restore();g.globalAlpha=1;return}
 if(!rBoom){rBoom=1;shake=SET.shake?16:0;noise(T0(),1.2,.9,200);noise(T0(),.5,.5,1800);tone(70,T0(),.9,'sawtooth',.35,30);tone(45,T0()+.05,1.1,'square',.25,25)}
 const e=t-BOOM_T,hr2=n=>hr(n*7.77);
 g.globalAlpha=.55;g.fillStyle='#1a0a0f';g.beginPath();g.ellipse(bx,by+42,90*Math.min(1,e*3),9,0,0,7);g.fill();g.globalAlpha=1;   // scorch mark on the ground
 /* smoke: dark puffs that rise and spread, lingering a while */
 for(let i=0;i<14;i++){const d=Math.max(0,e-.1-hr2(i)*.4);if(d<=0)continue;const f=Math.min(1,d/2.6),a=hr2(i+3)*6.28,r=18+d*30;
  g.globalAlpha=Math.max(0,.75*(1-f));g.fillStyle=i%3?'#3a3a3a':'#555';g.beginPath();g.arc(bx+Math.cos(a)*d*40,by-d*30+Math.sin(a)*d*14,r*(.6+hr2(i+9)*.6),0,7);g.fill()}
 g.globalAlpha=1;
 /* flying parts: pink body chunks, the spoiler, both wheels, the pipes */
 const parts=[['body',-40,'#ff2e88'],['body',30,'#ff2e88'],['body',-5,'#b8005a'],['wheel',-52],['wheel',56],['spoil',-72],['pipe',-80],['pipe',-75],['body',60,'#ff2e88'],['stripe',0]];
 parts.forEach(([kd,x0,c],i)=>{const vx=(x0/60+(hr2(i)-.5)*1.4)*260,vy=-(260+hr2(i+20)*260),px=bx+x0*RACER_SC+vx*e,py=by+vy*e+520*e*e,rot=e*(6+hr2(i+40)*10)*(i%2?1:-1),al=Math.max(0,1-e/2.2);
  if(py>H+40||al<=0)return;g.save();g.globalAlpha=al;g.translate(px,py);g.rotate(rot);
  if(kd=='wheel'){g.fillStyle='#111';g.beginPath();g.arc(0,0,14,0,7);g.fill();g.fillStyle='#d9d9e0';g.beginPath();g.arc(0,0,6,0,7);g.fill()}
  else if(kd=='spoil'){g.fillStyle='#b8005a';g.fillRect(-14,-3,28,6);g.fillRect(-8,3,3,10)}
  else if(kd=='pipe'){g.fillStyle='#d9d9e0';g.fillRect(-12,-3,24,6);g.fillStyle='#555';g.fillRect(10,-4,3,8)}
  else if(kd=='stripe'){g.fillStyle='#fff';g.fillRect(-18,-2,36,4)}
  else{g.fillStyle=c;g.beginPath();g.moveTo(-12,-8);g.lineTo(10,-10);g.lineTo(14,6);g.lineTo(-8,10);g.closePath();g.fill()}
  g.restore()});g.globalAlpha=1;
 /* the fireball: a white flash, then yellow / orange / red rings that swell and fade */
 if(e<.12&&!RF){g.globalAlpha=1-e/.12;g.fillStyle='#fff';g.fillRect(0,0,W,H);g.globalAlpha=1}
 [[1.1,'#ff2a1e',95],[.9,'#ff8a1e',75],[.7,'#ffd23f',55],[.45,'#fff6c0',35]].forEach(([life,c,R])=>{if(e>=life)return;const f=e/life;g.globalAlpha=1-f*f;g.fillStyle=c;g.beginPath();
  for(let k=0;k<=18;k++){const a=k/18*6.28,rr=R*(.4+.6*Math.sqrt(f))*(1+.18*Math.sin(a*5+e*20));g.lineTo(bx+Math.cos(a)*rr,by-6+Math.sin(a)*rr*.85)}g.closePath();g.fill()});
 g.globalAlpha=1}
function bossImg(){const c=document.createElement('canvas');c.width=240;c.height=200;const old=g;g=c.getContext('2d');try{drawBoss(bi,120,100,0,1,0,false,true)}finally{g=old}wimg=c;
const d=c.getContext('2d').getImageData(0,0,240,200).data;wtiles=[];for(let ty=0;ty<200;ty+=6)for(let tx=0;tx<240;tx+=6)if(d[((ty+3)*240+tx+3)*4+3]>20)wtiles.push({x:tx,y:ty,r:hr(tx*31+ty*17)})}
function drawWinBoss(){const bx=W/2,by=95,t=wanim;
if(!wsp){/* fought: sweep of disintegrating pixels (Racer explodes instead) */
if(bi==4){drawRacerBoom(t);return}
if(!wimg)bossImg();const ox=bx-120,oy=by-100;
for(const q of wtiles){const p=(t-(.15+q.x/240*.9+q.r*.35))/1.1;if(p>=1)continue;
if(p<=0){g.globalAlpha=1;g.drawImage(wimg,q.x,q.y,6,6,ox+q.x,oy+q.y,6,6)}
else{const k=p+p*p*.5;g.globalAlpha=1-p;g.drawImage(wimg,q.x,q.y,6,6,ox+q.x+(30+q.r*60)*k,oy+q.y-(40+hr(q.x+q.y*7)*80)*k,6,6)}}
g.globalAlpha=1;
/* $lug Thug: his sunglasses drop to the floor once his face turns to dust, bounce once, and stay there */
if(bi==6&&slugDrops()){const[sx,sy]=SLUG_SHADES0(),fy=SLUG_FLOOR(),t0=.75,f=Math.max(0,t-t0),fall=Math.sqrt(2*(fy-sy)/900);let y=sy,rot=.12;
 if(f>0){if(f<fall){y=sy+450*f*f;rot=.12-.3*f/fall}else{const b=f-fall,bh=b<.3?Math.sin(b/.3*Math.PI)*8:0;y=fy-bh;rot=-.18}}
 if(f>0&&f>=fall)drawFallenShades(sx,y,1,Math.min(1,(f-fall)/.5));else{g.save();g.translate(sx,y);g.scale(SLUG_SC,SLUG_SC);g.rotate(rot);slugShades(2,1);g.restore()}}
return}
/* spared: corruption flakes off, boss turns pure */
if(bi==11){prSpare(t,bx,by);return}   /* The Pretender was never corrupted: his paint chips fall to the floor; no glow, no sparkles */
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
if(d&&!p.dp&&p.dcd<=0){if(p.sp!=null&&p.sp<=0){p.spF=performance.now();sfxNoSp()}/* story: 0 SP = no dash */else{if(p.sp!=null)p.sp--;p.dash=.14;p.dcd=.6;p.inv=Math.max(p.inv,.2);sfxDash()}}p.dp=d;
const spm=storyFighting()?storySpeed(p.i):1;/* Speed Trinket: +20% walking speed */let vx=x*250*spm,vy=y*250*spm;
if(p.dash>0){p.dash-=dt;const l=Math.hypot(p.fx,p.fy)||1;vx=p.fx/l*760;vy=p.fy/l*760;p.tr.push({x:p.x,y:p.y,a:.6})}
p.x=Math.min(BX+BW-12,Math.max(BX+12,p.x+vx*dt));p.y=Math.min(BY+BH-12,Math.max(BY+12,p.y+vy*dt));
p.tr.forEach(t=>t.a-=dt*4);p.tr=p.tr.filter(t=>t.a>0)}
/* Darius's YELLOW hits: they drain SP instead of HP (the same amount an HP hit would take: ATK - DEF, at least 1).
   At 0 SP they do nothing more. Fights without SP (free modes) take it as a normal hit. */
function hurtSP(p){if(p.sp==null){hurt(p);return}
 if(p.inv>0||p.dash>0||p.down||p.sp<=0)return;
 p.sp=Math.max(0,p.sp-storyTaken(p.i,BO.dmg+dmgNow));if(storyFighting()){storyWear(p.i,'armor');storyThorns(p)}
 p.inv=1.2;p.hit=performance.now();p.spH=performance.now();shake=5;sfxSpHit()}
function sfxSpHit(){if(!AC)return;tone(700,T0(),.14,'square',.1,240);noise(T0(),.06,.08,3000)}
function hurt(p){if(p.inv>0||p.dash>0||p.down)return;p.hp=Math.max(0,p.hp-storyTaken(p.i,BO.dmg+dmgNow));if(storyFighting()){storyWear(p.i,'armor');/* each landed hit costs the armor 1 DUR */storyFoePoison(p)/* a Poison enemy's hit poisons you */;storyThorns(p)/* your Thorns Trinket pricks the enemy */}if(bi==12)sqHit=1;p.inv=1.2;p.hit=performance.now();shake=10;sfxHit();if(!p.hp){p.down=1;p.rev=0;lastDn=p.i}}
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
function rec(o){picks[pk]=o;if(o.k=='i'){if(storyFighting())o.it=storyTake(subI);else items--}advance()}
function backPick(){let j=pk-1;while(j>=0&&players[j].down)j--;if(j<0)return;const o=picks[j];if(o&&o.k=='i'){if(o.it)storyGiveBack(o.it);else items++}picks[j]=null;pk=j;S='menu';mi=0;tc=TXT.length}
function coSub(){if(mi==1)rec({k:'a',s:subI});else if(mi==2){if(storyFighting()&&storyIsGear(subI))rec({k:'i',t:pk});/* gear: equipped by whoever picks it */else{ptI=pk;S='ptg'}}else rec({k:'m',s:subI})}
function ptStep(d){let j=ptI,n=0;do{j=(j+d+players.length)%players.length;n++}while(players[j].gone&&n<9);return j}
function resolve(){fleeMsg=0;const q=[],f=[];players.forEach((p,i)=>{const k=picks[i];if(!k||p.gone)return;if(k.k=='f')f.push(i);else q.push(i)});runQ(q,0,f)}
function runQ(q,j,f){if(j>=q.length){if(f.length)startBars(f);else startDodge();return}
const i=q[j],k=picks[i],nx=()=>runQ(q,j+1,f),N=players.length,P=(t,fn)=>showMsgP(i,t,fn);
if(k.k=='a'){
if(k.s==0)P(BO.chk,nx);
else if(bi){const A0=ACTS[bi][k.s-1],a=slugAct(A0,A0.m<0?A0.m:shareOf(A0.m,i,N)),go=a.kill?()=>win(0):nx;hapT=a.fx=='salt'||((bi==3||bi==12)&&!(a.m>0))?[]:[a.t,a.t2];angT=(bi==3||bi==12)&&a.adj>0?[a.t,a.t2]:[]/* Soulcerer's Mock: angry visor */;spare=Math.max(0,Math.min(100,spare+(a.m<0?a.m:shareOf(a.m,i,N))));if(a.adj)dmgAdj=a.adj;if(a.gr)greenTooth=1;P(a.t,a.t2?()=>P(a.t2,go):go)}
else if(k.s==1){spare=Math.min(100,spare+shareOf(BO.act,i,N));hapT=['* You dance! Prism sways.'];P('* You dance! Prism sways.',nx)}
else{spare=Math.min(100,spare+shareOf(BO.hum||BO.act/2,i,N));players.forEach(p=>{if(!p.down)p.hp=Math.min(p.max,p.hp+4)});hapT=['* You hum along. Prism starts to feel a little better.'];P('* You hum along. Prism starts to feel a little better.',nx)}}
else if(k.k=='i'){const t=players[k.t];
if(k.it)P(storyUsePicked(i,k.t,k.it),nx);/* story: the food / gear this player picked from the shared items */
else if(!t||t.gone)P('* The Pink Pie goes to waste...',nx);
else{const was=t.down,b4=t.hp;sfxPie(was);if(was){t.down=0;t.hp=Math.min(t.max,12);t.rev=0}else t.hp=Math.min(t.max,t.hp+12);
const self=k.t==i,nm='P'+(k.t+1),rc=b4+12<=t.max;
const l3=was?nm+' gets back up!':self?(rc?'You recovered 12 HP.':'Your HP was maxed out.'):(rc?nm+' recovered 12 HP.':nm+"'s HP was maxed out.");
P((self?'* You ate the Pink Pie.':'* P'+(i+1)+' fed the Pink Pie to '+nm+'.')+'\n* It tastes a little... Corrupted?\n* '+l3,nx)}}
else{if(k.s==0){if(spare>=100||lowHp())win(1);else{mbT=performance.now();nx()}}
else{const liv=players.filter(p=>!p.down&&!p.gone).length,vt=players.filter((p,x)=>picks[x]&&picks[x].k=='m'&&picks[x].s==1).length,need=net.role?Math.floor(liv/2)+1:1;
if(vt>=need){stopMusic();S='flee';exT=performance.now();exSn=0}else if(!fleeMsg){fleeMsg=1;P('* Not enough players want to flee!\n* ('+vt+' out of '+liv+')',nx)}else nx()}}}
function rndStarts(n){const R=100,gap=26,L=R-(n-1)*gap,o=[];for(let i=0;i<n;i++)o.push(Math.random()*L);o.sort((a,b)=>a-b);return o.map((v,i)=>v+i*gap).sort(()=>Math.random()-.5)}
/* Slap Strap (story weapon): LINE_N white lines come in a row, each press stops the front one. A bar object with .ls = [{x,done,miss,q}]. */
const LINE_GAP=120;
const lineQ=x=>Math.max(2,Math.abs(x-260)<=6?25:Math.min(24,Math.round(25*(1-(Math.abs(x-260)-6)/254))));
const mkLines=(n,x0)=>[...Array(n)].map((_,i)=>({x:x0-i*LINE_GAP,done:0,miss:0,q:0}));
const newAtk=k=>{if(storyFighting()&&storyAims(k))return{x:0,bull:mkBull(k)};const n=storyFighting()?storyBarLines(k):1;return n>1?{x:0,ls:mkLines(n,0)}:{x:0}};
/* Twinkle Slinger (story weapon, ITEMS.tslinger aim:1): the BULLSEYE attack. A crosshair drifts over a round target;
   one press shoots a star at it. Distance from the centre = the timing score (pink centre = 25 = perfect, "BULLSEYE!"),
   outside the target or no shot within BULL.time s = Miss. Solo: atk.bull; co-op: a bar object with .bull (own crosshair, same target). */
const BULL={time:4,perfect:6,fly:.25,hold:.7};
const mkBull=k=>({k,t:0,ft:0,p:Math.random()*6.28,th:Math.random()*6.28,dir:Math.random()<.5?-1:1,w:2.1*(.9+Math.random()*.2),shot:null,q:0,miss:0,end:0});
/* target: centred in solo (or when every co-op player aims); on the right half when others have bars */
function bullGeo(){const mix=players.length>1&&fb.some(b=>!b.bull);return mix?{cx:BX+BW-150,cy:BY+138,r:78}:{cx:BX+BW/2,cy:BY+138,r:86}}
/* crosshair path: swings out and back through the centre about every 1.5 s while the direction slowly turns, so each pass crosses at a new angle */
function bullPos(b,G){const t=b.t,rad=G.r*1.1*Math.abs(Math.sin(b.w*t+b.p))*(.88+.12*Math.sin(1.7*t+b.p)),a=b.th+b.dir*(1.25*t+.6*Math.sin(.9*t));return[G.cx+Math.cos(a)*rad,G.cy+Math.sin(a)*rad]}
const bullQ=dn=>dn>90?0:dn<=BULL.perfect?25:Math.max(1,Math.round(25*(1-(dn-BULL.perfect)/(90-BULL.perfect))));   /* dn = distance scaled to a 90 px target */
function bullShoot(b){if(b.shot)return;const G=bullGeo(),[x,y]=bullPos(b,G),dn=Math.hypot(x-G.cx,y-G.cy)*90/G.r;b.shot={x:(x-G.cx)/G.r,y:(y-G.cy)/G.r};b.q=bullQ(dn);b.miss=b.q?0:1;sfxSling()}
function bullStep(b,dt){if(!b.shot){b.t+=dt;if(b.t>=BULL.time){b.done=1;b.miss=1;b.end=1}}else{b.ft+=dt;if(b.ft>=BULL.hold)b.end=1}}
function sfxSling(){if(!AC)return;tone(500,T0(),.1,'triangle',.18,1400);noise(T0(),.05,.06,3000)}
function sfxBullseye(){if(!AC)return;[1568,2093,2637].forEach((f,i)=>tone(f,T0()+i*.06,.18,'square',.07))}
function starPath(x,y,r){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.closePath()}
/* the target, each aiming player's crosshair, the slingshot and the flying star */
function drawBull(list){const G=bullGeo(),sx=G.cx-G.r-52,sy=BY+BH-40;
g.fillStyle='#222';g.beginPath();g.arc(G.cx,G.cy,G.r,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=3;g.stroke();
g.globalAlpha=.6;g.lineWidth=2;[.76,.52].forEach(f=>{g.beginPath();g.arc(G.cx,G.cy,G.r*f,0,7);g.stroke()});g.globalAlpha=1;
g.strokeStyle=PINK;g.lineWidth=3;g.beginPath();g.arc(G.cx,G.cy,G.r*.27,0,7);g.stroke();g.fillStyle=PINK;g.beginPath();g.arc(G.cx,G.cy,Math.max(7,G.r*.1),0,7);g.fill();
/* slingshot: gold Y with a band */
g.strokeStyle='#c9a640';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(sx,sy+18);g.lineTo(sx,sy);g.lineTo(sx-12,sy-18);g.moveTo(sx,sy);g.lineTo(sx+12,sy-18);g.stroke();g.lineCap='butt';
g.strokeStyle='#ddd';g.lineWidth=2;g.beginPath();g.moveTo(sx-12,sy-18);g.quadraticCurveTo(sx,sy-2,sx+12,sy-18);g.stroke();
if(list.some(b=>!b.shot)){g.fillStyle='#ffd23f';starPath(sx,sy-11,6);g.fill()}   /* a star waits in the band */
list.forEach(b=>{const col=PCOL[b.k];
if(b.shot){const tx=G.cx+b.shot.x*G.r,ty=G.cy+b.shot.y*G.r,f=Math.min(1,b.ft/BULL.fly);
if(f<1){const x=sx+(tx-sx)*f,y=sy-11+(ty-sy+11)*f-Math.sin(f*Math.PI)*40;g.fillStyle='#ffd23f';starPath(x,y,7);g.fill()}
else{const e=b.ft-BULL.fly;if(!b.miss){g.globalAlpha=Math.max(0,1-e*2.5);g.strokeStyle='#ffd23f';g.lineWidth=2;g.beginPath();g.arc(tx,ty,8+e*60,0,7);g.stroke();g.globalAlpha=1}
g.fillStyle='#ffd23f';starPath(tx,ty,8);g.fill();g.strokeStyle=col;g.lineWidth=1.5;g.stroke();
if(b.q>=25){if(!b.ding){b.ding=1;sfxBullseye()}const s=1+Math.max(0,.3-e)*1.5;txt('BULLSEYE!',G.cx,G.cy-G.r*.45,Math.round(26*s),'#ffd23f','center',0,true)}}}
else{const[x,y]=bullPos(b,G);g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(x,y,13,0,7);g.stroke();
g.beginPath();g.moveTo(x-20,y);g.lineTo(x-7,y);g.moveTo(x+7,y);g.lineTo(x+20,y);g.moveTo(x,y-20);g.lineTo(x,y-7);g.moveTo(x,y+7);g.lineTo(x,y+20);g.stroke();
g.fillStyle=col;g.beginPath();g.arc(x,y,2.5,0,7);g.fill();if(players.length>1)txt('P'+(b.k+1),x+16,y-14,13,col,'left',0,true)}})}
function lineStop(b){const l=b.ls.find(q=>!q.done);if(!l||l.x<0)return;l.done=1;l.q=lineQ(l.x)}   /* a press before the front line has come onto the bar does nothing */
function linesMove(b,v,dt){b.ls.forEach(l=>{if(!l.done){l.x+=dt*v;if(l.x>=520){l.x=520;l.done=1;l.miss=1}}})}
const linesDone=b=>b.ls.every(l=>l.done);
/* co-op: when all of a player's lines are used up, their bar is done: missed if none landed, else qm = the average timing score (missed lines count 0) */
function finishLines(b){b.done=1;const hit=b.ls.filter(l=>!l.miss);if(!hit.length)b.miss=1;else b.qm=Math.max(2,Math.round(hit.reduce((a,l)=>a+l.q,0)/b.ls.length))}
/* solo: all lines used up. One attack = one DUR; the damage uses the average score, then it is split over the lines that landed (one slash each). */
function endAtkLines(){const hit=atk.ls.filter(l=>!l.miss);if(!hit.length){endAtk(1);return}
const mean=Math.max(2,Math.round(hit.reduce((a,l)=>a+l.q,0)/atk.ls.length)),d=storyHit(0,mean);
if(d<=0){atkFx([],0,storyDodgeMsg());return}
const sq=hit.reduce((a,l)=>a+l.q,0);let left=d;const h=hit.map((l,i)=>{const di=i==hit.length-1?left:Math.min(left,Math.round(d*l.q/sq));left-=di;return{k:0,d:di,q:l.q}});
atkFx(h,d,'* '+d+' damage!')}
function startBars(f){fb=[];const st=rndStarts(f.length);f.forEach((i,j)=>{const b={k:i,x:st[j],done:0,d:0,miss:0},n=storyFighting()?storyBarLines(i):1;if(storyFighting()&&storyAims(i))b.bull=mkBull(i);else if(n>1)b.ls=mkLines(n,st[j]);fb.push(b)});fbDone=0;S='atk'}
function stopBar(w){let b=fb.find(q=>!q.done&&q.k===w);if(!b&&w<0)b=fb.find(q=>!q.done);if(b){if(b.bull){bullShoot(b.bull);b.q=b.bull.q;b.miss=b.bull.miss;b.done=1}else if(b.ls){lineStop(b);if(linesDone(b))finishLines(b)}else b.done=1}}
function finishBars(){const N=players.length;let tot=0;const Ln=fb.map(b=>{if(b.miss)return'* P'+(b.k+1)+': Miss...';const dx=Math.abs(b.x-260),base=b.bull?b.bull.q:b.ls?b.qm:dx<=6?25:Math.min(24,Math.round(25*(1-(dx-6)/254))),d=storyHit(b.k,Math.max(1,Math.round(base*shareOf(25,b.k,N)/25)));b.d=d;b.q=base;tot+=d;return'* P'+(b.k+1)+': '+(d>0?d+' damage!':'dodged!')});
atkFx(fb.filter(b=>!b.miss&&b.d>0).map(b=>({k:b.k,d:b.d,q:b.q})),tot,Ln.join('\n'))}
function drawBars(){const bars=fb.filter(b=>!b.bull),aims=fb.filter(b=>b.bull),n=bars.length,bw=aims.length?300:520,sc=bw/520,hb=Math.min(52,Math.floor((176-8*(n-1))/Math.max(1,n)));
/* players aiming with the Twinkle Slinger share the target on the right; the others' bars shrink to the left half (bar logic stays 0-520, drawn scaled) */
bars.forEach((b,i)=>{const p=players[b.k],y=BY+54+i*(hb+8);g.fillStyle='#222';g.fillRect(BX+40,y,bw,hb);g.strokeStyle=p.col;g.lineWidth=3;g.strokeRect(BX+40,y,bw,hb);g.fillStyle=PINK;g.fillRect(BX+40+260*sc-6,y,12,hb);g.fillStyle='#fff';if(b.ls)b.ls.forEach(l=>{if(l.x<0)return;g.globalAlpha=l.done?.55:1;g.fillRect(BX+40+l.x*sc-4,y-6,8,hb+12)});else{g.globalAlpha=b.done?.55:1;g.fillRect(BX+40+b.x*sc-4,y-6,8,hb+12)}g.globalAlpha=1;txt('P'+(b.k+1),BX+8,y+hb/2+6,16,p.col)});
if(aims.length)drawBull(aims.map(b=>b.bull));
txt(n?'Press your confirm key near the center!':'Shoot when your crosshair is over the center!',BX+BW/2,BY+30,16,'#fff','center')}
let curFl='',flLast=-1,flRep=0;
const LOWFL=[["* Prism's smile is flickering.","* Prism's glow is fading.","* Prism is out of breath, but still swaying."],["* Pulsar is sputtering.","* Pulsar's lights are flickering.","* Pulsar's beat is starting to skip."],["* Maw is wheezing, one eye half shut.","* Maw's teeth are chattering.","* Maw is wobbling, but won't fall."],["* The Soulcerer's light flickers.","* Cracks spread across the armor.","* The statue trembles, but holds."],["* Racer's engine is sputtering.","* Black smoke pours from Racer's pipes.","* Racer's paint is cracking all over."],["* Tanga's leaves are falling.","* Tanga's twirls are getting wobbly.","* Cracks run down Tanga's bark."],["* $lug Thug's shades are cracked.","* $lug Thug is drying out.","* $lug Thug's antennae droop."],["* Neutlin's cloak is coming apart at the seams.","* Neutlin's eyes keep drooping, but they stay hidden.","* Neutlin sniffles under the hood."],["* Pancy's halo flickers and cracks.","* Pancy's wings are losing feathers.","* Pancy's aim is getting shaky."],["* Darius and Kipto are both out of breath.","* Darius is holding on tighter.","* Kipto's whiskers droop."],["* Tourette Turret's sp-sp-speaker is crrrackling.","* Sparks fly from its s-s-side vent. BZZT!","* Its tr-tr-treads keep sl-sl-slipping."],["* The Pretender's paint is flaking off.","* The Pretender is sweating under his mask.","* The Pretender keeps glancing at the exit."],["* Cracks race along the Soulcerer's corners.","* Its armor rattles with every beat.","* The crown's jewel flickers, dim."]];
function lowHp(){return!!BO&&bhp>0&&bhp<=BO.hp*.4}
function pickFl(){if(spare>=100)return MERCYFL[BOSSES.indexOf(BO)];
if(neutSulk==1&&bi==7){neutSulk=2;return '* Neutlin is sulking inside the hood.'}   /* after Tug Hood *//* 100% mercy: one fixed line, beats the low-HP lines */
/* normal lines can get story extras (e.g. Racer heckling $lug Thug); the same line never shows 3 times in a row */
const L=lowHp()?LOWFL[BOSSES.indexOf(BO)]:BO.fl.concat(storyFighting()&&typeof storyExtraFl=='function'?storyExtraFl():[]),c=L.length;
let n=Math.floor(Math.random()*c);if(n==flLast&&flRep>=2)n=(n+1+Math.floor(Math.random()*(c-1)))%c;if(n==flLast)flRep++;else{flLast=n;flRep=1}
return L[n]}
const MERCYFL=["* Prism is glowing softly.\n* It doesn't want to fight anymore.","* Pulsar's beat has slowed to a calm rhythm.","* Maw's jaw hangs loose.\n* It looks almost peaceful.","* The Soulcerer's light steadies.","* Racer's engine settles into a calm idle.","* Tanga sways gently, swishing her pom-poms.","* $lug Thug kicks back. He's done with the beef.","* Neutlin pushes the hood back a little.\n* They almost look relieved.","* Pancy lowers her bow and smiles.","* Darius lowers his fist.\n* Kipto rumbles softly.","* Tourette Turret's speaker hums a gentle tune.","* The Pretender's shoulders drop.\n* He looks tired of pretending.","* The Soulcerer lowers its cape.\n* It seems ready to rest."];
function toMenu(){S='menu';mi=0;TXT=curFl;tc=0;if(players.length>1){picks=players.map(()=>null);pk=Math.max(0,players.findIndex(p=>!p.down&&!p.gone))}}
function startDodge(){dodgeId++;if(neutSulk==2)neutSulk=0;if(bi==8){pancySpd=pancySlow?.8:1;pancyWarn=pancyRush?.6:1;pancySlow=0;pancyRush=0}if(bi==12){sqDuel=sqChal;sqChal=0;sqHit=0}   /* Square Soulcerer: this turn is the duel */if(bi==11){prSpd=prFast&&!prSlow?1.25:prSlow&&!prFast?.75:1;prSlow=0;prFast=0}   /* The Pretender: Play Along / Scratch the Paint, this turn only */if(bi==10){trX=null;trLook=null;trQ=trLoud&&!trQuiet?2:trQuiet&&!trLoud?1:0;trQuiet=0;trLoud=0}   /* Tourette Turret: Turn Down / Crank It Up, this turn only (both at once cancel out) */if(bi==9){dkSpd=kiptoSlow?.75:1;dkMad=dariusMad;kiptoSlow=0;dariusMad=0}   /* Darius & Kipto: Scratch Chin / Mess Up Hair, this turn only */   /* Pancy: this turn only, after Straighten Halo / Ruffle Feathers */slugCaught=0;S='dodge';hz=[];dmgNow=dmgAdj;dmgAdj=0;ev=genA(bi,Math.random()<.5);ei=0;tb=(Math.floor(bt/4)+2)*4;players.forEach((p,i)=>{if(!(p.down&&!p.gone)){p.x=spx(i,players.length);p.y=BY+BH/2}p.inv=0;p.dash=0;p.dp=1;p.tr=[];p.rd=0;p.rdp=0})}/* dp=1: the confirm key (often also Dash) may still be held, so a fresh press is needed to dash */
function startBattle(){BO=BOSSES[bi];slugLuck=0;saltKill=0;slugMad=0;tangaNoPom=0;tangaAngry=0;tangaPomDrop=null;neutSulk=0;neutDefDrop=0;trQuiet=0;trLoud=0;trQ=0;trDefDrop=0;prSlow=0;prFast=0;prSpd=1;prKnown=0;sqChal=0;sqDuel=0;sqHit=0;BOSSES[10].chk=BOSSES[10].chk.replace(/\d+ DEF/,'8 DEF');pancySlow=0;pancyRush=0;pancySpd=1;pancyWarn=1;BOSSES[7].chk=BOSSES[7].chk.replace(/\d+ DEF/,'7 DEF');if(net.role=='host')netAssign();players=[...Array(mode)].map((_,i)=>mkP(i));if(storyFighting())storySetup(players);if(net.role=='host')players.forEach(p=>{if(p.i)p.rem=1});bhp=BO.hp;spare=0;items=storyFighting()?0:2;turn=0;dmgAdj=0;dmgNow=0;greenTooth=0;stopMusic();curFl=BO.intro+(storyFighting()?storyIntroExtra():'')/* a thief holding your trinket */;flLast=-1;flRep=0;S='intro';introT=performance.now();introSn=0}
function win(sp){stopMusic();jingle();S='win';tc=0;winInit(sp);if(storyFighting()){winTxt=storyWin(sp);return}const bk='  (Enter: back to boss select)';winTxt=sp?'* YOU WON!\n* You spared '+BO.n+'.\n\n'+bk:'* YOU WON!\n* '+BO.n+' fades away...\n\n'+bk}
function endAtk(miss){let d=0,q=0;if(!miss){q=atk.bull?atk.bull.q:Math.max(2,Math.abs(atk.x-260)<=6?25:Math.min(24,Math.round(25*(1-(Math.abs(atk.x-260)-6)/254))));d=storyHit(0,q)}
/* q = timing score (25 = perfect): it picks the slash size, so ATK bonuses don't turn an imperfect hit into a double slash */
atkFx(d>0?[{k:0,d,q}]:[],d,miss?'* Miss...':d>0?'* '+d+' damage!':storyDodgeMsg()/* a Speed enemy dodged */)}
function doSub(){
if(players.length>1){coSub();return}
if(mi==1){if(subI==0)showMsg(BO.chk,startDodge);else if(bi){const A0=ACTS[bi][subI-1],a=slugAct(A0,A0.m),go=a.kill?()=>win(0):startDodge;hapT=a.fx=='salt'||((bi==3||bi==12)&&!(a.m>0))?[]:[a.t,a.t2];angT=(bi==3||bi==12)&&a.adj>0?[a.t,a.t2]:[]/* Soulcerer's Mock: angry visor */;spare=Math.max(0,Math.min(100,spare+a.m));if(a.adj)dmgAdj=a.adj;if(a.gr)greenTooth=1;showMsg(a.t,a.t2?()=>showMsg(a.t2,go):go)}
else if(subI==1){spare=Math.min(100,spare+BO.act);hapT=['* You dance! Prism sways.'];showMsg('* You dance! Prism sways.',startDodge)}else{spare=Math.min(100,spare+(BO.hum||BO.act/2));players.forEach(p=>{if(!p.down)p.hp=Math.min(p.max,p.hp+4)});hapT=['* You hum along. Prism starts to feel a little better.'];showMsg('* You hum along. Prism starts to feel a little better.',startDodge)}}
else if(mi==2&&storyFighting())showMsg(storyUseSolo(subI),startDodge);/* story: food or gear from the shared items */
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
else if(S=='menu'){if(is(L)){mi=(mi+3)%4;sfxNav()}else if(is(R)){mi=(mi+1)%4;sfxNav()}else if(is(OK)){if(mi<2)S='tgt';else{subI=0;sub=mi==2?(storyFighting()?storyItemList():items>0?['Pink Pie x'+items]:[]):['Spare','Flee'];if(!sub.length)showMsg('* No items left.',players.length>1?menuAgain:toMenu);else S='sub'}}else if(is(NO)&&players.length>1)backPick()}
else if(S=='ptg'){if(is(U)||is(L)){ptI=ptStep(-1);sfxNav()}else if(is(Dn)||is(R)){ptI=ptStep(1);sfxNav()}else if(is(OK))rec({k:'i',t:ptI});else if(is(NO))S='sub'}
else if(S=='tgt'){if(is(OK)){if(mi==0){if(players.length>1)rec({k:'f'});else{S='atk';atk=newAtk(0)}}else{subI=0;sub=bi?['Check',...ACTS[bi].map(a=>a.n)]:['Check','Dance','Hum'];S='sub'}}else if(is(NO))S='menu'}
else if(S=='sub'){if(subGrid()&&(is(U)||is(Dn)||is(L)||is(R))){const b=subI;subGridMove(is(L)||is(R),is(U)?-1:is(Dn)?1:0);if(subI!=b)sfxNav()}else if(is(U)){subI=(subI+sub.length-1)%sub.length;if(sub.length>1)sfxNav()}else if(is(Dn)){subI=(subI+1)%sub.length;if(sub.length>1)sfxNav()}else if(is(OK))doSub();else if(is(NO))S=mi==1?'tgt':'menu'}
else if(S=='atk'){if(players.length>1){if(is(OK))stopBar(pressOwner(c))}else if(is(OK)){if(atk.bull)bullShoot(atk.bull);else if(atk.ls)lineStop(atk);else endAtk(0)}}
else if(S=='lose'){if(!(players.length>1&&pressOwner(c)>0)){const t=(performance.now()-loseT0)/1000;if(t<LOSE_MENU||loseGo){}
else if(storyOnlyVillage()){if(is(OK)&&t>LOSE_MENU+.1){S='lexit';exT=performance.now();exSn=0}}/* story potion death: only VILLAGE */
else if(is(L)){if(loseI)sfxNav();loseI=0}else if(is(R)){if(!loseI)sfxNav();loseI=1}else if(is(U)||is(Dn)){sfxNav();loseI=1-loseI}else if(is(OK)&&t>LOSE_MENU+.1){if(loseI){S='lexit';exT=performance.now();exSn=0}else loseGo=performance.now()}}}
else if(S=='win'){if((c=='KeyR'||is(OK))&&!wxT){if(tc<winTxt.length)tc=winTxt.length;else wxT=performance.now()}}}
function update(dt){shake=Math.max(0,shake-dt*30);flash=Math.max(0,flash-dt);bhurt=Math.max(0,bhurt-dt);pollPads();
if(net.role=='guest'){gUpdate(dt);return}
if(S=='intro'&&(performance.now()-introT)/1000>=2){startMusic(BO);toMenu()}
if(S=='slash')slashStep();if(S=='win'&&wxT&&net.role!='guest'&&performance.now()-wxT>=600){wxT=0;if(!storyReturn())S='boss';fiT=performance.now()}
if(net.role!='host')players.forEach(p=>{p.rem=0});
if(mus){if(AC&&AC.state=='running')bt=musBt((AC.currentTime-mus.t0)/mus.spb);else{bt+=dt/mus.spb;if(AC)mus.t0=AC.currentTime-musRaw(bt)*mus.spb}}else bt=0;tc+=dt*36;if(S=='win')wanim+=dt;
if(S=='atk'){if(players.length>1){fb.forEach(b=>{if(b.bull){bullStep(b.bull,dt);if(b.bull.end&&!b.done){b.done=1;b.miss=1}return}if(b.done)return;if(b.ls){linesMove(b,347*storyBarSpeed(b.k),dt);if(linesDone(b))finishLines(b)}else{b.x+=dt*347*storyBarSpeed(b.k);if(b.x>=520){b.x=520;b.done=1;b.miss=1}}});if(fb.length&&fb.every(b=>b.done)){fbDone+=dt;if(fbDone>.45){fbDone=0;finishBars()}}}else if(atk.bull){bullStep(atk.bull,dt);if(atk.bull.end)endAtk(atk.bull.miss?1:0)}else if(atk.ls){linesMove(atk,480*storyBarSpeed(0),dt);if(linesDone(atk))endAtkLines()}else{atk.x+=dt*480*storyBarSpeed(0);if(atk.x>=520){atk.x=520;endAtk(1)}}return}
if(S!='dodge')return;
while(ei<ev.length&&tb+ev[ei].b<=bt){const e=ev[ei++];hz.push({...e,b:tb+e.b})}
for(const h of hz){const age=bt-h.b;
if(h.t=='burst'&&age>=h.warn){h.dead=1;const a0=Math.random()*6.28,sp=BO.rs*.75;for(let i=0;i<h.n;i++){const a=a0+i*6.2832/h.n;hz.push({t:'b',x:h.x,y:h.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:7})}}
else if(h.t=='rect'&&age>=h.warn+h.dur)h.dead=1;
else if(h.t=='sq'&&age>=h.warn+h.dur)h.dead=1;
else if(h.t=='hs'&&age>=h.life+JR)h.dead=1;
else if(h.t=='jaw'){if(!h.bit&&age>=h.warn+JB){h.bit=1;shake=10;noise(T0(),.2,.5,400);tone(90,T0(),.22,'square',.3,40)}if(age>=h.warn+JB+JH+JR)h.dead=1}
else if(h.t=='sun'&&age>=h.warn){h.dead=1;for(let j=0;j<8;j++){const a=h.a+j*Math.PI/4;hz.push({t:'b',x:h.x+Math.cos(a)*28,y:h.y+Math.sin(a)*28,vx:Math.cos(a)*h.sp,vy:Math.sin(a)*h.sp,r:7,a})}}
else if(h.t=='beam'){/* aim through the target player while tracking, then lock and fire */
 if(h.tg==null){const al=players.map((p,k)=>k).filter(k=>!players[k].down&&!players[k].gone);h.tg=al.length?al[Math.floor(Math.random()*al.length)]:0;const p=players[h.tg];h.ang=p?Math.atan2(p.y-SV_Y,p.x-SV_X):Math.PI/2}
 const p=players[h.tg];if(age<h.track&&p&&!p.down)h.ang+=(Math.atan2(p.y-SV_Y,p.x-SV_X)-h.ang)*Math.min(1,dt*5);
 [h.ex,h.ey,h.nx,h.ny]=beamEnd(h.ang);
 if(!h.fired&&age>=h.track+h.lock){h.fired=1;shake=8;tone(1200,T0(),.35,'sawtooth',.12,200);noise(T0(),.3,.25,1500);
  const base=Math.atan2(h.ny,h.nx);[-70,-45,-20,20,45,70].forEach((deg,k)=>{const a=base+deg*Math.PI/180,v=230-Math.abs(deg)*.8;hz.push({t:'b',x:h.ex+h.nx*10+Math.cos(a)*14,y:h.ey+h.ny*10+Math.sin(a)*14,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:7,sqr:1,dr:.18,fl:-100,wob:k,free:1,spin:2.5})})}
 if(age>=h.track+h.lock+h.fire)h.dead=1}
else if(h.t=='con'){/* pick two different shapes, each anywhere on the board (middle included); they may overlap a little but never pile up */
 if(!h.cs){const order=CONS_SHAPES.map((s,k)=>k).sort(()=>Math.random()-.5),box=()=>{const w=170+Math.random()*60,hh=Math.min(BH-40,w*.75);return{w,hh,x:BX+15+Math.random()*(BW-30-w),y:BY+15+Math.random()*(BH-30-hh)}};
  const b0=box();let b1=box();for(let k=0;k<30&&Math.abs((b1.x+b1.w/2)-(b0.x+b0.w/2))<.6*(b0.w+b1.w)/2;k++)b1=box();
  h.cs=[b0,b1].map((b,j)=>{const S=CONS_SHAPES[order[j]];return{e:S.e,pts:S.p.map(([a,c])=>[b.x+a*b.w,b.y+c*b.hh])}})}
 if(!h.snd&&age>=h.warn){h.snd=1;tone(1500,T0(),.25,'triangle',.1,600)}
 if(age>=h.warn+h.dur)h.dead=1}
else if(h.t=='shot'){/* Racer's Shotgun Blast */
 const F=shotFire(),[px,py]=racerPivot();
 if(h.tg==null){const al=players.map((p,k)=>k).filter(k=>!players[k].down&&!players[k].gone);h.tg=al.length?al[Math.floor(Math.random()*al.length)]:0;const p=players[h.tg];
  h.ang=!h.first&&lastShotAng!=null?lastShotAng:p?Math.atan2(p.y-py,p.x-px):Math.PI/2}   // later shots swivel from where the last one pointed
 const p=players[h.tg];
 if(age<SHOT.grow+SHOT.aim){if(p&&!p.down)h.ang+=(Math.atan2(p.y-py,p.x-px)-h.ang)*Math.min(1,dt*6)}
 else if(h.lx==null){h.lx=p&&!p.down?p.x:BX+BW/2;h.ly=p&&!p.down?p.y:BY+BH/2;h.ang=Math.atan2(h.ly-py,h.lx-px);tone(900,T0(),.08,'square',.08)}   // lock onto where they stood
 if(h.fire==null)h.fire=lowHp()?1:0;
 if(h.fire){/* low HP: flamethrower. Both pipes spray flame puffs along the locked aim for SHOT.burn beats, with a fire whoosh + crackle */
  if(age>=F&&age<F+SHOT.burn){
   if(!h.f0){h.f0=1;h.sn=0;tone(70,T0(),.3,'sawtooth',.18,40)}
   h.sn-=dt;if(h.sn<=0){h.sn=.11;noise(T0(),.2,.22,500+Math.random()*500);noise(T0(),.03,.14,3500+Math.random()*3500)}
   h.fa=(h.fa||0)+dt*70;const[mx,my]=shotMuzzle(h);
   while(h.fa>=1){h.fa--;const a=h.ang+(Math.random()-.5)*.26,sp=330+Math.random()*90,off=Math.random()<.5?-5:5,lf=.9+Math.random()*.25;
    hz.push({t:'b',fp:1,x:mx-Math.sin(h.ang)*off,y:my+Math.cos(h.ang)*off,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:7,lf,lf0:lf})}}}
 else{for(let v=0;v<2;v++)if(!h['f'+v]&&age>=F+v*SHOT.gap){h['f'+v]=1;shake=6;noise(T0(),.25,.5,700);tone(110,T0(),.2,'square',.25,50);
  const[mx,my]=shotMuzzle(h);[-.2,-.1,0,.1,.2].forEach(o=>{const a=h.ang+o+(v?.05:-.05);hz.push({t:'b',x:mx,y:my,vx:Math.cos(a)*250,vy:Math.sin(a)*250,r:6,free:1,lf:3.5})})}
  /* reload: "chk" as the pipes pull back, "chk" as they push out again */
  const R=shotReload();if(!h.c0&&age>=R){h.c0=1;noise(T0(),.06,.35,3000);tone(240,T0(),.05,'square',.14)}
  if(!h.c1&&age>=R+SHOT.pull+SHOT.hold+SHOT.push*.8){h.c1=1;noise(T0(),.07,.4,2400);tone(320,T0(),.06,'square',.16)}}
 lastShotAng=h.ang;
 if(age>=(h.last?(h.fire?shotFire()+SHOT.burn:shotReloaded())+.3+SHOT.ret:SHOT.cyc))h.dead=1}
else if(h.t=='road'){if(age>=h.dur)h.dead=1}
else if(h.t=='lane'){if(!h.snd&&age>=h.warn){h.snd=1;noise(T0(),.3,.2,2500);tone(300,T0(),.3,'sawtooth',.06,700)}
 if(age>h.warn+(h.n-1)*h.gap+.5&&[...Array(h.n)].every((_,j)=>laneCarX(h,j)==null))h.dead=1}
else if(h.t=='drive'){if(age>=SMOKE.out+SMOKE.pass*SMOKE.n+2)h.dead=1}
else if(h.t=='puff'){/* a smoke cloud from the small Racer's pipes: drifts down, grows, fades */
 if(h.x==null){const c=smokeCar(h.b-tb),d=c.dir||1;h.x=(c.x||W/2)+d*(RACER_X-14)*SMOKE.sc;/* out of the pipes at the car's back */if(c.main||h.x<BX-90||h.x>BX+BW+90){h.dead=1;continue}
  h.x=Math.max(BX+16,Math.min(BX+BW-16,h.x));   /* puffs made just past the board's sides start in its upper corners */h.y=SMOKE.y-10;h.vx=-d*10+(Math.random()-.5)*12;if(h.x<=BX+16)h.vx=Math.abs(h.vx)*.5;if(h.x>=BX+BW-16)h.vx=-Math.abs(h.vx)*.5;/* corner puffs drift inward, not off the board */h.vy=40+Math.random()*10;h.r0=6;h.life=99;noise(T0(),.15,.08,300)}
 /* small clouds that sink through the whole board and slide out of the bottom edge */
 const s=age*(mus?mus.spb:.4);h.x+=h.vx*dt;h.y+=h.vy*dt;h.r=Math.min(18,h.r0+s*2.5);if(h.y-h.r>BY+BH||s>20)h.dead=1}
else if(h.t=='pom'){/* Tanga's Pom-Pom Toss */
 if(!h.H){h.H=tangaHand(h.side,POM_THROW);const al=players.filter(p=>!p.down&&!p.gone),tg=h.aim&&al.length?al[Math.floor(Math.random()*al.length)]:null,R=Math.random;
  h.F=tg?[Math.max(BX+40,Math.min(BX+BW-40,tg.x)),Math.max(BY+BH*.4,Math.min(BY+BH-25,tg.y))]:[h.side>0?BX+40+R()*BW*.5:BX+BW*.5+R()*(BW*.5-40),BY+BH*.45+R()*(BH*.55-25)];
  h.wid=h.side>0?70:-70}
 if(age>=h.warn&&!h.thr){h.thr=1;noise(T0(),.3,.18,900);tone(500,T0(),.25,'triangle',.08,900)}
 if(age>=h.warn&&age<h.warn+h.fly){h.acc=(h.acc||0)+dt;if(h.acc>.22){h.acc=0;const[x,y]=pomPt(h,(age-h.warn)/h.fly);hz.push({t:'b',leaf:1,x,y,vx:(Math.random()-.5)*24,vy:32,r:5,lf:1.6,spin:5,rot:Math.random()*6})}}
 if(age>=h.warn+h.fly){h.dead=1;tone(700,T0(),.06,'square',.06)}}
else if(h.t=='tor'){/* Tanga's Twirl Tornado: 2 spiral arms of leaves from a marked spot */
 if(h.x==null){h.x=BX+90+Math.random()*(BW-180);h.y=BY+60+Math.random()*(BH-120)}
 if(age>=h.warn&&!h.snd){h.snd=1;noise(T0(),.6,.12,1500);tone(300,T0(),.5,'triangle',.07,900)}
 if(age>=h.warn&&age<h.warn+h.dur){h.acc=(h.acc||0)+dt;if(h.acc>=.24){h.acc-=.24;const base=(age-h.warn)*(mus?mus.spb:.4)*2.2*h.dir;
  const na=h.arms||2;for(let k=0;k<na;k++){const an=base+k*Math.PI*2/na;hz.push({t:'b',leaf:1,x:h.x,y:h.y,vx:Math.cos(an)*95,vy:Math.sin(an)*95,r:5,spin:6,rot:an})}}}
 if(age>=h.warn+h.dur)h.dead=1}
else if(h.t=='root'){/* Tanga's Root Kick Line: 3 cracks on the top / bottom edges, then the roots burst out together */
 if(!h.cr){h.cr=[];for(let t=0;t<80&&h.cr.length<3;t++){const x=BX+ROOT.w/2+Math.random()*(BW-ROOT.w),top=Math.random()<.5;if(h.cr.every(c=>Math.abs(c.x-x)>ROOT.w+40))h.cr.push({x,top})}}
 if(age>=h.warn&&!h.snd){h.snd=1;shake=6;noise(T0(),.35,.45,300);tone(80,T0(),.3,'square',.2,40)}
 if(age>=h.warn+h.up+h.wig+h.down)h.dead=1}
else if(h.t=='cash'){if(age>=CASH.warn&&!cashPos(h))h.dead=1}
else if(h.t=='pop'){if(age>=1.6)h.dead=1}
else if(h.t=='spit'){/* $lug Thug's Slime Puddles: pick a landing spot (corners ~1 in 3), away from puddles still out */
 if(h.x==null){const R=Math.random,others=hz.filter(q=>q!==h&&q.t=='spit'&&q.x!=null);let x,y,t=0;
  do{if(R()<.33){x=R()<.5?BX+28:BX+BW-28;y=R()<.5?BY+18:BY+BH-18}else{x=BX+28+R()*(BW-56);y=BY+18+R()*(BH-36)}t++}while(t<40&&others.some(q=>Math.hypot(q.x-x,q.y-y)<110));h.x=x;h.y=y}
 if(age>=SPIT.warn&&!h.s1){h.s1=1;tone(260,T0(),.12,'square',.1,520);noise(T0(),.1,.15,1800)}
 if(age>=SPIT.warn+SPIT.fly&&!h.s2){h.s2=1;noise(T0(),.2,.3,500);tone(140,T0(),.15,'sine',.2,60)}
 if(age>=SPIT.warn+SPIT.fly+SPIT.stay+SPIT.dry)h.dead=1}
else if(h.t=='pmove'||h.t=='pgone'){if(age>=h.dur)h.dead=1}
else if(h.t=='arw'){if(!h.s0){h.s0=1;tone(900,T0(),.12,'triangle',.08,300)}const u=arwU(h);if(u>=0&&!h.s1){h.s1=1;noise(T0(),.12,.1,3000);tone(600,T0(),.12,'triangle',.07,1300)}if(u>=1&&h.stuckT==null){h.stuckT=bt;noise(T0(),.08,.25,700);tone(150,T0(),.1,'square',.1,80)}if(h.stuckT!=null&&(bt-h.stuckT)*SPB()>ARW.stick)h.dead=1}
else if(h.t=='snk'){if(!h.s0){h.s0=1;tone(220,T0(),.5,'sawtooth',.06,160)}
 if(age>=(h.fw||SNK.fire)&&h.ox==null){const al=players.filter(p=>!p.down&&!p.gone),tg=al.length?al[Math.floor(Math.random()*al.length)]:players[0],[bx,by]=pancyBow(),ox=Math.min(bx,BX+BW-14),oy=Math.max(BY+14,Math.min(BY+BH-14,by)),dx=tg.x-ox,dy=tg.y-oy,l=Math.hypot(dx,dy)||1;
  h.ox=ox;h.oy=oy;h.dx=dx/l;h.dy=dy/l;h.fb=bt;h.ang=Math.atan2(dy,dx);tone(1300,T0(),.08,'square',.08,400);noise(T0(),.08,.15,4000)}
 if(h.ox!=null){const[x,y]=snkPos(h);if(x<BX+2||x>BX+BW-2||y<BY+2||y>BY+BH-2){const ex=Math.max(BX+2,Math.min(BX+BW-2,x)),ey=Math.max(BY+2,Math.min(BY+BH-2,y)),nx=x<BX+2?1:x>BX+BW-2?-1:0,ny=y<BY+2?1:y>BY+BH-2?-1:0,na=Math.atan2(ny,nx);
  for(let i=0;i<FIREB.n;i++){const a=na+(i/(FIREB.n-1)-.5)*Math.PI*.95;hz.push({t:'b',x:ex+Math.cos(na)*12,y:ey+Math.sin(na)*12,vx:Math.cos(a)*FIREB.sp*pancySpd,vy:Math.sin(a)*FIREB.sp*pancySpd,r:9,fire:1,lf:3})}
  hz.push({t:'smk',b:bt,x:ex,y:ey});shake=14;noise(T0(),.7,.55,350);tone(70,T0(),.6,'sine',.5,30);noise(T0()+.05,.4,.25,2500);h.dead=1}}}   /* the sneak shot explodes on the wall */
else if(h.t=='smk'){if(age*SPB()>1.4)h.dead=1}
else if(h.t=='qgrid'){if(age>=h.dur)h.dead=1}   /* Square Soulcerer */
else if(h.t=='qck'){if(age>=h.w&&!h.s0){h.s0=1;noise(T0(),.1,.12,700);tone(90,T0(),.15,'sine',.2,50)}if(age>=h.w+h.on)h.dead=1}
else if(h.t=='qcs'){if(age>=QCS.warn&&!h.s0){h.s0=1;shake=Math.max(shake,8);noise(T0(),.25,.3,500);tone(80,T0(),.35,'sine',.45,35)}if(age>=QCS.warn+QCS.stay+QCS.ret)h.dead=1}
else if(h.t=='qcp'){if(age>=1&&!h.s0){h.s0=1;noise(T0(),.6,.12,1500)}if(age>=1+h.sw+.3)h.dead=1}
else if(h.t=='qcj'){if(age>=1&&!h.s0){h.s0=1;tone(1568,T0(),.25,'triangle',.08);tone(2349,T0(),.2,'sine',.04)}if(!qcjPos(h,age)&&age>1)h.dead=1}
else if(h.t=='pmk'){if(age>=PMK.warn&&!h.s0){h.s0=1;tone(300,T0(),.5,'sawtooth',.06,900);noise(T0(),.4,.08,3000)}if(age>=PMK.warn+pmkF(h)&&!h.s1){h.s1=1;tone(1200,T0(),.06,'square',.06);noise(T0(),.05,.12,1500)}if(age>=PMK.warn+pmkF(h)+PMK.back)h.dead=1}   /* The Pretender: whoosh as the mask flies, a click as it goes back on */
else if(h.t=='pdr'){if(age>=PDR.form+pdrF(h)&&!h.s0){h.s0=1;noise(T0(),.12,.12,1200);tone(180,T0(),.1,'sine',.12,90)}if(age>=PDR.form+pdrF(h)+PDR.wet+PDR.dry+PDR.gone)h.dead=1}   /* splat */
else if(h.t=='pcc'){if(!h.H){h.H=[];h.x=BX+BW/2;h.y=BY+24;h.k=-1}
 players.forEach((p,i)=>{const H=h.H[i]||(h.H[i]=[]);H.push([bt,p.x,p.y]);while(H.length>2&&H[0][0]<bt-pccD(h)-.5)H.shift()});   /* everyone's recent path */
 const k=Math.floor(Math.max(0,age)/PCC.seg);if(k!=h.k){h.k=k;const al=players.map((p,i)=>i).filter(i=>!players[i].down&&!players[i].gone);h.ti=al.length?al[(h.t0i+k)%al.length]:0;h.mir=k%2==1;
  if(k>0){tone(h.mir?660:440,T0(),.12,'square',.05);tone(h.mir?990:330,T0()+.08,.12,'square',.05)}}   /* switch mode (and target, in co-op) */
 const T=players[h.ti];if(T){let wx,wy;if(h.mir){wx=2*(BX+BW/2)-T.x;wy=T.y}else{const H=h.H[h.ti],tt=bt-pccD(h);let q=H[0];for(const z of H){if(z[0]<=tt)q=z;else break}wx=q[1];wy=q[2]}
  const bl=Math.min(1,dt*(h.mir?6:12)*(h.sp||1));h.x+=(wx-h.x)*bl;h.y+=(wy-h.y)*bl}
 if(age>=h.dur)h.dead=1}
else if(h.t=='swv'){if(!h.s0){h.s0=1;trFlash=performance.now();tone(90,T0(),.25,'sine',.25,45);noise(T0(),.12,.08,700)}if(swvR(h)>760)h.dead=1}
else if(h.t=='vol'){if(!h.hq){h.hq=[[],[]];trDrumHits(h.b,h.dur).forEach((x,k)=>h.hq[k%2].push(x));h.pi=[-1,-1];h.hn=[0,0]}   /* the drum hits, speakers taking turns */
 [0,1].forEach(sp=>{const a=h.hq[sp];while(h.hn[sp]<a.length&&a[h.hn[sp]]<=age){const ta=a[h.hn[sp]++];if(age-ta>.3)continue;const[cx,cy]=volCone(sp,age,h),a0=h.a0*6.28+ta*1.48;h['f'+sp]=age;
  const np=h.np||6;for(let q=0;q<np;q++){const an=a0+q*6.2832/np;hz.push({t:'b',x:cx,y:cy,vx:Math.cos(an)*VOL.pel,vy:Math.sin(an)*VOL.pel,r:6,b:bt})}tone(110,T0(),.12,'sine',.2,60);noise(T0(),.05,.06,900)}});   /* a speaker lands and thumps out 6 pellets on each drum hit (4 after Turn Down, 8 after Crank It Up) */
 if(age>=h.dur)h.dead=1}
else if(h.t=='tbm'){if(age>=0){if(h.from==null){h.from=trX||0;h.P=trBeam(h.ox,h.a)}const e=age;trX=h.from+(h.ox-h.from)*sm2(Math.min(1,e/TBM.move));trLook=e>=TBM.move&&e<TBM.move+TBM.warn+TBM.on?h.a:null;
  if(e>=TBM.move&&!h.s0){h.s0=1;tone(1400,T0(),.35,'square',.04,2200)}if(e>=TBM.move+TBM.warn&&!h.s1){h.s1=1;noise(T0(),.35,.18,2500);tone(220,T0(),.35,'sawtooth',.08,110)}
  if(e>=TBM.move+TBM.warn+TBM.on)h.dead=1}}
else if(h.t=='blb'){if(!h.s0){h.s0=1;tone(880,T0(),.08,'triangle',.06,600)}if(age>=h.warn&&!h.s1){h.s1=1;tone(300,T0(),.18,'sine',.1,600)}
 if(age>=h.warn+BLB.fly&&!h.landed){h.landed=bt;noise(T0(),.15,.2,900);tone(160,T0(),.15,'sine',.25,70);for(const p of players)if(Math.hypot(p.x-h.x,p.y-h.y)<BLB.r+6)hurtSP(p);
  for(let q=0;q<BLB.n;q++){const an=h.a0+q*6.2832/BLB.n;hz.push({t:'b',x:h.x,y:h.y,vx:Math.cos(an)*BLB.sp,vy:Math.sin(an)*BLB.sp,r:8,yb:1,b:bt})}}   /* splat: the landing spot hits, 6 small blobs fly out */
 if(h.landed&&(bt-h.landed)*SPB()>.6)h.dead=1}
else if(h.t=='ksw'||h.t=='kst'){const a=age-h.warn;if(a>=0&&!h.s0){h.s0=1;noise(T0(),.4,.2,1400);tone(220,T0(),.35,'sawtooth',.05,110)}
 if(a>=0){const hd=kHead(h,a),body=h.t=='ksw'?KSW.body:KST.body;if(h.dir>0?hd-body>BX+BW+60:hd+body<BX-60)h.dead=1;
  if(h.t=='kst'){h.tossed=h.tossed||[];const dx=hd-h.dir*150;h.xs.forEach((x,j)=>{if(!h.tossed[j]&&h.dir*(x-dx)<70){h.tossed[j]=1;hz.push({t:'bdr',b:bt,x0:dx,y0:h.y-40,x});tone(500,T0(),.1,'triangle',.07,250)}})}}}   /* Darius drops a blob as he passes over its spot */
else if(h.t=='bdr'){const fy=BY+BH;if(age>=BDR.fall&&!h.landed){h.landed=bt;noise(T0(),.15,.2,900);tone(160,T0(),.15,'sine',.25,70);for(const p of players)if(Math.abs(p.x-h.x)<BDR.r&&p.y>fy-28)hurtSP(p);
  for(let q=0;q<BDR.n;q++){const an=Math.PI+(q+.5)*Math.PI/BDR.n;hz.push({t:'b',x:h.x,y:fy-10,vx:Math.cos(an)*BDR.sp,vy:Math.sin(an)*BDR.sp,r:8,yb:1,b:bt})}}   /* splashes up in a fan */
 if(h.landed&&(bt-h.landed)*SPB()>.6)h.dead=1}
else if(h.t=='dkgone'){if(age>=h.dur)h.dead=1}
else if(h.t=='vup'){if(!h.s0){h.s0=1;noise(T0(),.3,.14,3000);tone(500,T0(),.25,'triangle',.08,1500)}if(age*SPB()>.8)h.dead=1}
else if(h.t=='col'){const y=colY(h);if(y!=null&&!h.s0){h.s0=1;noise(T0(),.12,.05,3200)}if(y!=null&&y-COL.len>BY+BH+10)h.dead=1}
else if(h.t=='cloud'){if(cloudX(h)<BX-130)h.dead=1}
else if(h.t=='swp'){const d=swpD(h);if(d!=null&&!h.s0){h.s0=1;noise(T0(),.35,.3,1600);tone(600,T0(),.3,'sawtooth',.06,150)}if(d!=null&&d>SWP.from)h.dead=1}
else if(h.t=='peek'){if(age>=h.warn){h.dead=1;noise(T0(),.12,.2,2400);tone(520,T0(),.1,'triangle',.12,260);const a0=Math.random()*6.283;for(let i=0;i<PEEK.n;i++){const a=a0+i*6.2832/PEEK.n;hz.push({t:'b',x:h.x,y:h.y,vx:Math.cos(a)*PEEK.sp,vy:Math.sin(a)*PEEK.sp,r:7})}}
 else{if(!h.s1&&age>=1){h.s1=1;tone(1400,T0(),.04,'sine',.05)}if(!h.s2&&age>=1.7){h.s2=1;tone(1400,T0(),.04,'sine',.05)}}}
else if(h.t=='curt'){if(age>=h.warn&&!h.snd){h.snd=1;noise(T0(),.45,.16,900);tone(180,T0(),.4,'sawtooth',.05,90)}if(age>=h.warn&&curtX(h)==null)h.dead=1}
else if(h.t=='stomp'){const s=(age-h.warn)*(mus?mus.spb:.4);if(s>=0&&!h.snd){h.snd=1;shake=5;noise(T0(),.18,.3,500);tone(110,T0(),.2,'sine',.3,45)}if(s>STOMP.exp+.5)h.dead=1}
else if(h.t=='shellw'){if(age>=SHELL.warn&&!h.snd){h.snd=1;noise(T0(),.25,.12,2600)}if(age>=SHELL.warn&&shellX(h)==null)h.dead=1}
else if(h.t=='sword'){if(h.side==null)swordSetup(h);if(!h.snd&&age>=h.warn){h.snd=1;noise(T0(),.3,.35,1200);tone(500,T0(),.3,'sawtooth',.08,120)}if(age>=h.warn+h.swing+h.fade)h.dead=1}
else if(h.t=='b'){if(h.dr){const d=Math.pow(h.dr,dt);h.vx*=d;h.vy=h.vy*d+h.fl*(1-d)}if(h.gy)h.vy+=h.gy*dt;
 h.x+=h.vx*dt+(h.wob!=null?Math.sin(bt*3+h.wob)*.25:0);h.y+=h.vy*dt;if(h.spin)h.rot=(h.rot||0)+h.spin*dt;
 if(h.free){if(h.y<-30)h.dead=1}   /* the beam's squares float right off the top of the screen */
 else{const mx=h.m||20;if(h.x<BX-mx||h.x>BX+BW+mx||(h.y<BY-30&&!h.fp)||h.y>BY+BH+20)h.dead=1}   /* flame puffs (fp) start above the board, so they're exempt from the top-edge cull */
 if(h.lf!=null){h.lf-=dt;if(h.lf<=0)h.dead=1}   /* small stars fade after 2 s so the board doesn't fill up */
 if(!h.dead&&h.bur!=null&&age>=h.bur){h.dead=1;for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.random()*.3,v=110+Math.random()*30;hz.push({t:'b',x:h.x,y:h.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:8,st:11,spin:6,gy:60,lf:2})}}}}
hz=hz.filter(h=>!h.dead);
for(const p of players){upd(p,dt);if(p.down)continue;
for(const h of hz){if(h.t=='rect'&&bt-h.b>=h.warn){if(p.x+7>h.x&&p.x-7<h.x+h.w&&p.y+7>h.y&&p.y-7<h.y+h.h)hurt(p)}
else if(h.t=='hs')hsTouch(h,p);
else if(h.t=='beam'){const a=bt-h.b;if(h.ex!=null&&a>=h.track+h.lock&&a<h.track+h.lock+h.fire-.3&&segDist(p.x,p.y,{x1:SV_X,y1:SV_Y,x2:h.ex,y2:h.ey})<20)hurt(p)}
else if(h.t=='con'){const a=bt-h.b;if(h.cs&&a>=h.warn&&a<h.warn+h.dur-.3&&h.cs.some(C=>C.e.some(([i,j])=>segDist(p.x,p.y,{x1:C.pts[i][0],y1:C.pts[i][1],x2:C.pts[j][0],y2:C.pts[j][1]})<13)))hurt(p)}
else if(h.t=='sword'){const a=bt-h.b;if(h.side!=null&&a>=h.warn&&a<h.warn+h.swing){const an=swordAng(h,a),c=Math.cos(an),s=Math.sin(an);if(segDist(p.x,p.y,{x1:h.px+c*40,y1:h.py+s*40,x2:h.px+c*h.len,y2:h.py+s*h.len})<16)hurt(p)}}
else if(h.t=='jaw'){if(jawHit(h,p))hurt(p);else jawHeal(h,p)}
else if(h.t=='lane'){const cy=laneY(h.lane);if(Math.abs(p.y-cy)<LANE_CAR.hh+5)for(let j=0;j<h.n;j++){const x=laneCarX(h,j);if(x!=null&&Math.abs(p.x-x)<LANE_CAR.hw+5){hurt(p);break}}}
else if(h.t=='pom'){const a=bt-h.b;if(h.H&&a>=h.warn&&a<h.warn+h.fly){const[x,y]=pomPt(h,(a-h.warn)/h.fly);if(Math.hypot(p.x-x,p.y-y)<20)hurt(p)}}
else if(h.t=='root'){if(h.cr)h.cr.forEach((c,i)=>{const R=rootEnds(h,c,i);if(R&&R.e>.25&&segDist(p.x,p.y,R)<17)hurt(p)})}
else if(h.t=='cash'){const c=cashPos(h);if(c&&!h.dead){const dx=p.x-c[0],dy=p.y-c[1];
 if(h.kind=='gold'){if(Math.hypot(dx,dy)<22){h.dead=1;slugCaught++;if(typeof storyBonusCoin=='function')storyBonusCoin();[0,4,7].forEach((m,i)=>tone(mtof(84+m),T0()+i*.05,.12,'square',.09));hz.push({t:'pop',b:bt,x:c[0],y:c[1]})}}   /* lucky coin: +1 BC */
 else if(h.kind=='bill'?Math.abs(dx)<20&&Math.abs(dy)<13:Math.hypot(dx,dy)<16)hurt(p)}}
else if(h.t=='spit'){const s=bt-h.b-SPIT.warn-SPIT.fly;if(h.x!=null&&s>.1&&s<SPIT.stay+SPIT.dry*.4){const rx=SPIT.r+5,ry=SPIT.r*.6+5,dx=(p.x-h.x)/rx,dy=(p.y-h.y)/ry;if(dx*dx+dy*dy<1)hurt(p)}}
else if(h.t=='arw'){const u=arwU(h);if(u>=0&&h.stuckT==null){const[x,y,a]=arwPos(h,Math.min(1,u)),L=ARW.len*ARW.sc;if(segDist(p.x,p.y,{x1:x,y1:y,x2:x-Math.cos(a)*L,y2:y-Math.sin(a)*L})<ARW.hit)hurt(p)}}
else if(h.t=='snk'){if(h.ox!=null){const[x,y]=snkPos(h);if(segDist(p.x,p.y,{x1:x,y1:y,x2:x-h.dx*ARW.len,y2:y-h.dy*ARW.len})<9)hurt(p)}}
else if(h.t=='col'){const y=colY(h);if(y!=null&&segDist(p.x,p.y,{x1:h.x,y1:y,x2:h.x,y2:y-COL.len})<9)hurt(p)}
else if(h.t=='cloud'){if(cloudParts(h).some(([cx,cy,cr])=>Math.hypot(p.x-cx,p.y-cy)<cr+4))hurt(p)}
else if(h.t=='swp'){const d=swpD(h);if(d!=null){const G=swpGeo(h),rx=p.x-G.x0,ry=p.y-G.y0,along=rx*G.c+ry*G.s,side=-rx*G.s+ry*G.c;if(Math.abs(side)<SWP.half&&Math.abs(along-d)<50)hurt(p)}}
else if(h.t=='curt'){const x=curtX(h);if(x!=null){const x2=x-h.dir*CURT.w,x0=Math.min(x,x2)-(h.dir<0?CURT.tooth:0),x1=Math.max(x,x2)+(h.dir>0?CURT.tooth:0);if(p.x+6>x0&&p.x-6<x1&&(p.y-6<h.gy-CURT.gapH/2||p.y+6>h.gy+CURT.gapH/2))hurt(p)}}
else if(h.t=='stomp'){const s=(bt-h.b-h.warn)*(mus?mus.spb:.4);if(s>0){const d=Math.hypot(p.x-h.x,p.y-h.y);for(const q of[stompR(s),stompR(s-.45)])if(q!=null&&Math.abs(d-q)<9)hurt(p)}}
else if(h.t=='shellw'){const x=shellX(h);if(x!=null&&Math.abs(p.x-x)<15){const gh=BH/SHELL.n;for(let r=0;r<SHELL.n;r++){if(h.gaps.includes(r))continue;if(Math.abs(p.y-(BY+gh*(r+.5)))<16){hurt(p);break}}}}
else if(h.t=='puff'){const s=(bt-h.b)*(mus?mus.spb:.4);if(h.x!=null&&s>.3&&s<h.life-.6&&Math.hypot(p.x-h.x,p.y-h.y)<h.r*.8+5)hurt(p)}
else if(h.t=='sq'){const a=bt-h.b;if(a>=h.warn&&a<h.warn+h.dur-.1&&Math.max(0,Math.abs(p.x-h.x)-7)+Math.max(0,Math.abs(p.y-h.y)-7)<h.s*.7071)hurt(p)}
else if(h.t=='qck'){const a=bt-h.b;if(a>=h.w&&a<h.w+h.on){const c=Math.floor((p.x-BX)/QCK.cw),rr=Math.floor((p.y-BY)/QCK.cw);if(c>=0&&c<10&&rr>=0&&rr<4&&SQPAT[h.p](c,rr))hurt(p)}}   /* lit squares */
else if(h.t=='qcs'){const a=bt-h.b;if(a>=QCS.warn&&a<QCS.warn+QCS.stay){const m=Math.max(Math.abs(p.x-h.x),Math.abs(p.y-h.y));if(m<20)hurt(p);const w=(a-QCS.warn)/(h.big?.8:1);if(w<1&&Math.abs(m-qcsRing(h,w)/2)<10)hurt(p)}}   /* the guard + its shockwave's edge */
else if(h.t=='qcp'){const cx=qcpX(h,bt-h.b);if(cx!=null&&Math.abs(p.x-cx)<QCP.w/2+6&&!(p.y>h.gy+6&&p.y<h.gy+h.gap-6))hurt(p)}   /* the cape, except its gap */
else if(h.t=='qcj'){const q=qcjPos(h,bt-h.b);if(q&&q[1]>BY&&Math.max(Math.abs(p.x-q[0]),Math.abs(p.y-q[1]))<QCJ.r+6)hurt(p)}   /* gems */
else if(h.t=='pmk'){const a=bt-h.b;if(a>=PMK.warn&&a<PMK.warn+pmkF(h)){const[x,y]=prCR(pmkP(h),pmkE(h));if(Math.hypot(p.x-x,p.y-y)<PMK.r+5)hurt(p)}}   /* the flying mask */
else if(h.t=='pdr'){const w=bt-h.b-PDR.form-pdrF(h);if(w>=.05&&w<PDR.wet){const sc=Math.min(1,.3+w*3),rx=h.r*sc+5,ry=h.r*.6*sc+5;if(((p.x-h.x)/rx)**2+((p.y-h.y)/ry)**2<1)hurt(p)}}   /* wet puddles only */
else if(h.t=='pcc'){if(h.x!=null&&bt-h.b>=1&&Math.hypot(p.x-h.x,p.y-h.y)<PCC.hit)hurt(p)}   /* the copy (hurts anyone) */
else if(h.t=='swv'){const[ox,oy]=trEye(),d=Math.hypot(p.x-ox,p.y-oy),rr=swvR(h);if(Math.abs(d-rr)<SWV.thk/2+6){const an=Math.atan2(p.y-oy,p.x-ox),df=Math.abs((((an-h.a)%6.2832)+9.4248)%6.2832-3.1416);if(df>SWV.gw/2)hurt(p)}}   /* the ring, except its gap */
else if(h.t=='vol'){const F=BY+BH;let hit=false;VOL.bars.forEach((o,q)=>{const x=BX+o,hh=volH(h,q);if(p.x>x-6&&p.x<x+VOL.bw+6&&p.y>F-hh-6)hit=true});
 [0,1].forEach(q=>{const x=BX+VOL.spk[q];if(p.x>x-6&&p.x<x+VOL.sw+6&&p.y>F-VOL.sh-volHop(h,q,bt-h.b)-6)hit=true});if(hit)hurt(p)}   /* the bars and the speakers themselves */
else if(h.t=='tbm'){const e=bt-h.b-TBM.move-TBM.warn;if(h.P&&e>=0&&e<TBM.on){for(let q=1;q<h.P.length-1;q++)if(segDist(p.x,p.y,{x1:h.P[q][0],y1:h.P[q][1],x2:h.P[q+1][0],y2:h.P[q+1][1]})<TBM.thk/2+6){hurt(p);break}}}
else if(h.t=='ksw'||h.t=='kst'){const P=kPts(h);if(P){let hit=Math.hypot(p.x-P[24][0],p.y-P[24][1])<22;for(let q=0;q<24&&!hit;q++)if(segDist(p.x,p.y,{x1:P[q][0],y1:P[q][1],x2:P[q+1][0],y2:P[q+1][1]})<KSW.half+6)hit=true;if(hit)hurt(p)}}
else if(h.t=='b'&&h.yb){if(Math.hypot(h.x-p.x,h.y-p.y)<h.r+6)hurtSP(p)}   /* Darius's yellow blobs drain SP */
else if(h.t=='b'&&Math.hypot(h.x-p.x,h.y-p.y)<h.r+6)hurt(p)}}
for(const p of players)if(p.down&&!p.gone){const o=players.find(q=>q!==p&&!q.down&&Math.hypot(q.x-p.x,q.y-p.y)<36);
if(o){p.rev+=dt;if(p.rev>=5){p.down=0;p.hp=10;p.inv=1.5;sfxUp()}}else p.rev=Math.max(0,p.rev-dt)}
if(players.every(p=>p.down)){if(storyFighting())storyLost()/* 30%: an item is stolen */;loseInit(lastDn);S='lose';stopMusic();return}
if(bt>=tb+TL){hz=[];turn++;curFl=pickFl();if(slugCaught>0)curFl='* You caught '+slugCaught+' BC!';slugCaught=0;slugMad=0;if(tangaNoPom)tangaPomsReturn();tangaNoPom=0;if(bi==12&&sqDuel){sqDuel=0;if(!sqHit){spare=Math.min(100,spare+35);curFl='* You took no hits.\n* The Soulcerer bows its crown in respect.'}}   /* Challenge won: +35 mercy */const bk=storyFighting()?storyTurnEnd():[];/* story: poison damage + "Your X broke..." boxes come before the boss's line; poison can finish the boss */const showBk=l=>l.length?showMsg(l[0],()=>showBk(l.slice(1))):bhp<=0?win(0):toMenu();showBk(bk)}}   /* $lug Thug's lucky coins */
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
/* ---------- Neutlin (Square Village mini boss 4): a small hooded creature, mostly a big round head ----------
   Drawn from the approved design (design space 216x300, centre 108,158). Its attacks never follow or aim at a player; times are in beats (111 BPM).
   0 Peekaboo: eye pairs open in dark spots, blink twice, then each spot pops into 8 slow pellets.
   1 Cloak Curtain: a gap is marked, then a cloth panel with a zigzag hem sweeps across; the gap moves each sweep.
   2 Pout Stomp: a dashed mark shows where Neutlin lands, it hops, and a ring (plus a fainter one) spreads from the stomp. */
const NEUT_SC=.62,NEUT_DY=18;
const NEUT_SPOTS=[[110,70],[300,60],[480,80],[200,170],[420,175]],NEUT_WAVES=[[0,2,3],[1,4],[2,3],[0,4],[1,3],[0,2,4]];
const SHARE_SP=6;
const PEEK={warn:2.5,r:64,sp:140,n:8},CURT={warn:3,w:210,spd:340,gapH:84,tooth:16,pitch:24},STOMP={warn:2,r0:14,rmax:110,exp:1.5,ring:7};
/* x of the curtain's leading edge (null before it starts and once it has left), and the radius of a stomp ring s seconds after the stomp */
const curtX=h=>{const a=bt-h.b-h.warn;if(a<0)return null;const x=(h.dir>0?BX-12:BX+BW+12)+h.dir*CURT.spd*a*(mus?mus.spb:.4),trail=x-h.dir*CURT.w;return(h.dir>0?trail>BX+BW+30:trail<BX-30)?null:x};
const stompR=s=>s<0||s>STOMP.exp?null:STOMP.r0+(STOMP.rmax-STOMP.r0)*s/STOMP.exp;
function drawPeek(h){const age=bt-h.b,f=Math.min(1,age/.4),t=performance.now()/1000;
 g.globalAlpha=f;g.fillStyle='#1c1022';g.beginPath();g.arc(h.x,h.y,36,0,7);g.fill();
 if(age>=.5){g.globalAlpha=f*(SET.reduceFlash?.8:.5+.3*Math.abs(Math.sin(t*6)));g.strokeStyle=PINK;g.lineWidth=3;g.setLineDash([8,8]);g.beginPath();g.arc(h.x,h.y,PEEK.r,0,7);g.stroke();g.setLineDash([])}
 g.globalAlpha=f;
 if((age>.95&&age<1.15)||(age>1.65&&age<1.85)){g.strokeStyle='#fff';g.lineWidth=2.5;g.lineCap='round';g.beginPath();g.moveTo(h.x-18,h.y);g.lineTo(h.x-6,h.y);g.moveTo(h.x+6,h.y);g.lineTo(h.x+18,h.y);g.stroke();g.lineCap='butt'}
 else[-12,12].forEach(dx=>{g.fillStyle='#fff';g.beginPath();g.arc(h.x+dx,h.y,7,0,7);g.fill();g.fillStyle='#14161c';g.beginPath();g.arc(h.x+dx+1.5,h.y+1,3,0,7);g.fill()});
 g.globalAlpha=1}
function drawCurt(h){const age=bt-h.b,gt=h.gy-CURT.gapH/2,gb=h.gy+CURT.gapH/2,dir=h.dir;
 if(age<h.warn){const f=Math.min(1,age/.6),pul=SET.reduceFlash?1:.55+.45*Math.abs(Math.sin(age*Math.PI*2));
  g.globalAlpha=.3*f;g.strokeStyle=PINK;g.lineWidth=2;g.beginPath();for(let k=1;k<=3;k++){const x=dir>0?BX+k*60:BX+BW-k*60;g.moveTo(x,BY+4);g.lineTo(x,BY+BH-4)}g.stroke();   /* fold lines */
  g.globalAlpha=.8*f*pul;g.lineWidth=3;g.setLineDash([8,8]);g.beginPath();g.moveTo(BX,gt);g.lineTo(BX+BW,gt);g.moveTo(BX,gb);g.lineTo(BX+BW,gb);g.stroke();g.setLineDash([]);   /* the gap */
  g.fillStyle=PINK;const ax=dir>0?BX+18:BX+BW-18;[gt+22,gb-22].forEach(y=>{g.beginPath();g.moveTo(ax+dir*10,y);g.lineTo(ax-dir*6,y-10);g.lineTo(ax-dir*6,y+10);g.closePath();g.fill()});   /* arrows along the sweep */
  g.globalAlpha=1;return}
 const x=curtX(h);if(x==null)return;const x2=x-dir*CURT.w,xl=Math.min(x,x2),xr=Math.max(x,x2);
 g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 const part=(y0,y1)=>{g.fillStyle=pkCol('#7a0040',1);g.fillRect(xl,y0,xr-xl,y1-y0);
  g.strokeStyle=pkCol('#b8005a',1);g.lineWidth=3;g.beginPath();for(let k=1;k<4;k++){const fx=x2+dir*k*CURT.w/4;g.moveTo(fx,y0+4);g.lineTo(fx,y1-4)}g.stroke();
  g.fillStyle=PINK;g.beginPath();for(let y=y0;y<y1;y+=CURT.pitch){const ye=Math.min(y+CURT.pitch,y1);g.moveTo(x,y);g.lineTo(x+dir*CURT.tooth,(y+ye)/2);g.lineTo(x,ye);g.closePath()}g.fill()};   /* hem teeth on the leading edge */
 part(BY,gt);part(gb,BY+BH);g.restore()}
function drawStomp(h){const age=bt-h.b,s=(age-h.warn)*(mus?mus.spb:.4);
 if(age<h.warn){g.globalAlpha=.85*Math.min(1,age/.5);g.strokeStyle=PINK;g.lineWidth=3;g.setLineDash([7,7]);g.beginPath();g.ellipse(h.x,h.y,34,12,0,0,7);g.stroke();g.setLineDash([]);g.lineCap='round';g.beginPath();g.moveTo(h.x-9,h.y-6);g.lineTo(h.x+9,h.y+6);g.moveTo(h.x+9,h.y-6);g.lineTo(h.x-9,h.y+6);g.stroke();g.lineCap='butt';g.globalAlpha=1;return}
 g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 if(s<.25){g.globalAlpha=1-s/.25;g.fillStyle=PINK;g.beginPath();g.arc(h.x,h.y,10+s*40,0,7);g.fill()}
 [[s,1],[s-.45,.6]].forEach(([q,al])=>{const r=stompR(q);if(r==null)return;g.globalAlpha=al*Math.min(1,(STOMP.exp-q)/.4+.2);g.strokeStyle=PINK;g.lineWidth=STOMP.ring+1;g.beginPath();g.arc(h.x,h.y,r,0,7);g.stroke();if(al==1){g.strokeStyle='#fff';g.lineWidth=2.5;g.beginPath();g.arc(h.x,h.y,r,0,7);g.stroke()}});
 g.restore();g.globalAlpha=1}
const NP={cloak:new Path2D('M38 254 Q34 150 56 94 Q108 38 160 94 Q182 150 178 254 L164 246 L152 258 L138 246 L124 258 L108 246 L92 258 L78 246 L64 258 L50 246 L40 258 Z'),
 cloakLow:new Path2D('M38 254 Q34 150 56 94 Q108 38 160 94 Q182 150 178 254 L170 240 L160 262 L148 238 L136 256 L122 236 L110 262 L96 240 L84 258 L72 238 L62 262 L50 244 Z'),
 shadow:new Path2D('M46 130 A62 62 0 0 1 170 130 Q108 158 46 130 Z'),shadowP:new Path2D('M46 130 A62 62 0 0 1 170 130 Q108 144 46 130 Z'),
 hood:new Path2D('M38 136 Q36 66 108 60 Q180 66 178 136 Q162 98 108 96 Q54 98 38 136 Z'),
 earL:new Path2D('M68 78 L56 50 L90 68 Z'),earR:new Path2D('M148 78 L160 50 L126 68 Z'),
 crackCloak:new Path2D('M70 190 L82 204 L72 218 M146 176 L134 192 L146 206 M122 214 L130 228 L122 242'),crackHood:new Path2D('M120 70 L126 84 L118 94')};
function drawNeutlin(pure,hurt,low){const A0=g.globalAlpha;   /* the spare crossfade fades the whole boss with globalAlpha, so every alpha below is relative to it */
 const t=performance.now()/1000,RF=SET.reduceFlash,lw=low&&!hurt&&!pure,hu=hurt&&!pure;
 const cloak=pure?'#bfe3ff':lw?'#e0287f':'#ff2e88',dark=pure?'#8fbfe6':'#b8005a',face=pure?'#efe6ff':'#ff86bd',shad=pure?'#8a96d6':lw?'#24061a':'#3a0a24';
 let hop=0,flare=1;const aC=actAnU('call'),aS=actAnU('share'),aT=actAnU('tug'),ease=u=>u<0?0:Math.min(1,u/.2)*Math.min(1,(1-u)/.15),eC=ease(aC),eS=ease(aS),eT=ease(aT),sulk=neutSulk==2&&S!='dodge'?1:0;   /* ACTs: Comfort lifts the hood and perks the ears, Share the Hood spreads the cloak, Tug Hood drops the hood over the eyes. Pout Stomp: it hops just before each stomp. Cloak Curtain: the cloak flares open. */
 if(S=='dodge'&&bi==7)for(const h of hz){if(h.dead)continue;
  if(h.t=='stomp'){const a=bt-h.b-(h.warn-1);if(a>=0&&a<1)hop=Math.max(hop,Math.sin(a*Math.PI)*26)}
  else if(h.t=='curt'){const a=bt-h.b-(h.warn-.8);if(a>=0&&a<2.4)flare=Math.max(flare,1+Math.sin(a/2.4*Math.PI)*.12)}}
 const bob=RF?0:Math.sin(t*2.2)*2,blink=!hu&&!lw&&!pure&&(t%4.3)<.14,F=d=>{g.fillStyle=d[1];g.fill(NP[d[0]])};
 g.save();g.translate(eT?Math.sin(t*40)*1.5*eT:0,NEUT_DY+bob-hop+eT*8);g.scale(NEUT_SC*Math.max(flare,1+.12*eS),NEUT_SC*(1-.05*eT));g.translate(-108,-158);
 const wag=RF?0:Math.sin(t*3)*6;g.strokeStyle=dark;g.lineWidth=8;g.lineCap='round';g.beginPath();
 if(pure){const w2=RF?0:Math.sin(t*4.5)*9;g.moveTo(166,242);g.quadraticCurveTo(206,250,210+w2*.3,222);g.quadraticCurveTo(213+w2*.5,198,200+w2*.8,188)}   /* pure: the tail is out, curled up and wagging */
 else{g.moveTo(150,238);g.quadraticCurveTo(186,232,188+wag*.4,212);g.quadraticCurveTo(190+wag*.4,196,176,200)}g.stroke();g.lineCap='butt';   /* tail */
 g.fillStyle=dark;[86,130].forEach(x=>{g.beginPath();g.ellipse(x,262,15,7,0,0,7);g.fill()});   /* feet */
 F([lw?'cloakLow':'cloak',cloak]);
 g.strokeStyle=dark;g.lineWidth=2.5;g.lineCap='round';g.beginPath();g.moveTo(68,196);g.lineTo(64,244);g.moveTo(148,196);g.lineTo(152,244);g.moveTo(108,200);g.lineTo(108,240);g.stroke();
 if(lw){g.strokeStyle='#fff';g.lineWidth=2;g.lineJoin='round';g.stroke(NP.crackCloak);g.lineJoin='miter'}
 g.lineCap='butt';
 g.fillStyle=face;g.beginPath();g.arc(108,132,62,0,7);g.fill();
 g.globalAlpha=A0*((pure?.5:.94)*(1-.6*eC));F(['shadow'+(pure?'P':''),shad]);g.globalAlpha=A0;
 g.save();if(pure)g.translate(0,-4);g.translate(0,-12*eC+22*Math.max(eT,sulk*.9));F(['hood',cloak]);g.strokeStyle=dark;g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(54,106);g.quadraticCurveTo(108,82,162,106);g.stroke();g.lineCap='butt';g.translate(0,-6*eC);F(['earL',cloak]);F(['earR',cloak]);
 if(lw){g.strokeStyle='#fff';g.lineWidth=2;g.lineJoin='round';g.stroke(NP.crackHood);g.lineJoin='miter'}g.restore();
 if(pure){g.strokeStyle='#345';g.lineWidth=3.5;g.lineCap='round';g.beginPath();g.moveTo(80,124);g.quadraticCurveTo(88,112,96,124);g.moveTo(120,124);g.quadraticCurveTo(128,112,136,124);g.moveTo(94,160);g.quadraticCurveTo(108,172,122,160);g.stroke();g.lineCap='butt'}
 else{const ey=lw?128:126;
  if(hu){g.strokeStyle='#fff';g.lineWidth=3;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(82,120);g.lineTo(94,126);g.lineTo(82,132);g.moveTo(134,120);g.lineTo(122,126);g.lineTo(134,132);g.stroke();g.lineCap='butt';g.lineJoin='miter'}
  else if(eT>.3||sulk){}   /* the hood is over the eyes */
  else if(blink){g.strokeStyle='#fff';g.lineWidth=2.5;g.lineCap='round';g.beginPath();g.moveTo(81,ey);g.lineTo(95,ey);g.moveTo(121,ey);g.lineTo(135,ey);g.stroke();g.lineCap='butt'}
  else{[88,128].forEach(x=>{g.fillStyle='#fff';g.beginPath();g.arc(x,ey,lw?5.5:6.5,0,7);g.fill();g.fillStyle='#14161c';g.beginPath();g.arc(x+1.5,ey+1,lw?2.4:2.6,0,7);g.fill()});if(lw){g.fillStyle=shad;g.fillRect(80,119,16,6);g.fillRect(120,119,16,6)}}
  g.strokeStyle='#7a0040';g.lineWidth=4;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(90,lw?172:170);g.lineTo(108,lw?162:159);g.lineTo(126,lw?172:170);g.stroke();g.lineCap='butt';g.lineJoin='miter'}   /* the obtuse frown */
 g.fillStyle='#ffd23f';g.fillRect(99,188,18,18);g.strokeStyle='#8a6a00';g.lineWidth=2;g.strokeRect(99,188,18,18);g.fillStyle=pure?'#fff':'#b8005a';g.fillRect(104,193,8,8);   /* square clasp */
 g.fillStyle=face;[66,150].forEach(x=>{g.beginPath();g.arc(x,lw?224:222,9,0,7);g.fill()});   /* plain round hands */
 if(eS>0){g.fillStyle='#fff';for(let k=0;k<7;k++){const ph=(aS*1.5+k/7)%1,x=40+((k*53)%140),y=250-ph*170,r=5+(k%3)*1.6;g.globalAlpha=A0*(Math.min(1,(1-ph)*2)*Math.min(1,eS*3));g.fillRect(x-r,y-.8,r*2,1.6);g.fillRect(x-.8,y-r,1.6,r*2)}g.globalAlpha=A0}   /* Share the Hood: sparkles */
 if(pure){g.fillStyle='#fff';[[30,73,1],[186,110,.8],[170,48,.7]].forEach(([x,y,s],k)=>{const tw=RF?1:.55+.45*Math.sin(t*3+k*2),r=9*s*tw;g.globalAlpha=A0*(tw);g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.3,y-r*.3);g.lineTo(x+r,y);g.lineTo(x+r*.3,y+r*.3);g.lineTo(x,y+r);g.lineTo(x-r*.3,y+r*.3);g.lineTo(x-r,y);g.lineTo(x-r*.3,y-r*.3);g.closePath();g.fill()});g.globalAlpha=A0}
 if(lw){g.fillStyle=cloak;[[44,274],[170,282],[116,284]].forEach(([x,y],k)=>{const ph=(t*.35+k/3)%1;g.globalAlpha=A0*(.7*(1-ph));g.beginPath();g.ellipse(x,y+ph*14,5,2.5,0,0,7);g.fill()});g.globalAlpha=A0}   /* falling scraps */
 g.restore()}/* ---------- Pancy (Square Village mini boss 5): an angel archer ----------
   Drawn from the approved design (design space 216x300, centre 108,125). She floats (bob, flapping wings). Times in beats (120 BPM = 2 beats a second).
   0 Arrow Rain: she floats to the right side of the board and shoots arrows up one at a time; each one's mark shows on the floor, then it falls the
     whole height and sticks in the floor. Then her face turns sinister and she fires ONE fast red-tipped arrow straight at where a player is (aimed
     when fired, flies straight); when it hits a wall it explodes into smoke and 8 fireballs.
   1 Volley: arrows fall straight down through the board in columns marked on the top edge, under solid pink clouds that drift left (clouds hurt).
   2 Swoop: she flies up out of sight; a lane near the middle lights up with 3 down arrows, then she dives straight down through it, very fast. */
const PANCY_SC=.74,PANCY_DY=24,SPB=()=>mus?mus.spb:.5,sm2=x=>x*x*(3-2*x);
const ARW={warn:1,fly:2,len:46,sc:1.4,hit:12,stick:1.2},SNK={fire:2,spd:900},COL={warn:1,spd:130,len:46,n:24,gap:1},CLOUD={spd:95},SWP={warn:2.5,spd:1100,half:52,lane:120,from:520,n:5,gap:6,off:40},FIREB={n:8,sp:170};
const pancySide=()=>[BX+BW+36,BY+BH/2];   /* where her centre floats during Arrow Rain */
const pancyHomeBow=()=>[W/2+(48-108)*PANCY_SC,95+PANCY_DY+(150-125)*PANCY_SC];   /* her bow hand when she is in her usual spot */
const pancyBow=()=>{const[x,y]=pancySide();return[x+(48-108)*PANCY_SC,y+(150-125)*PANCY_SC]};   /* her bow hand there */
/* Arrow Rain: the floor mark shows for h.warn beats, then she lobs the arrow from her bow; it flies an arc (ARW.fly beats) over the board
   and comes down nose-first into the mark. Arrows that land farther from her arc higher. arwU = flight progress (<0 not shot yet, 1 = landed). */
const arwU=h=>(bt-h.b-h.warn)/(ARW.fly/pancySpd);
function arwPos(h,u){const[bx,by]=pancyBow(),fy=BY+BH-4,pk=BY+30+(h.x-BX)/BW*60,H=(by+fy)/2-pk,y=by+(fy-by)*u-H*4*u*(1-u);
 return[bx+(h.x-bx)*u,y,Math.atan2((fy-by)-H*4*(1-2*u),h.x-bx)]}   /* [x, y, angle of flight] */
const snkPos=h=>{const s=(bt-h.fb)*SPB(),v=SNK.spd*pancySpd;return[h.ox+h.dx*v*s,h.oy+h.dy*v*s]};
const colY=h=>{const a=bt-h.b-h.warn;return a<0?null:BY-50+COL.spd*pancySpd*a*SPB()};
const cloudX=h=>BX+BW+90-CLOUD.spd*pancySpd*(bt-h.b)*SPB();
const cloudParts=h=>{const x=cloudX(h),y=h.y;return[[x-30,y+6,26],[x,y-10,32],[x+30,y+6,26],[x,y+10,28]]};
/* Swoop: each dive follows a lane through (near) the middle of the board at angle h.ang (any direction), h.off px to the side of the centre.
   swpD = how far along the lane she is (-SWP.from = before the board, 0 = the middle, +SWP.from = gone); null while the warning shows. */
const swpD=h=>{const a=bt-h.b-h.warn;return a<0?null:-SWP.from+SWP.spd*pancySpd*a*SPB()};
const swpGeo=h=>{const c=Math.cos(h.ang),s=Math.sin(h.ang);return{x0:BX+BW/2-s*h.off,y0:BY+BH/2+c*h.off,c,s}};   /* lane centre point + direction */
/* an arrow with its tip at (x,y) flying in direction ang: white shaft with a pink outline, fletching at the back; tip = tip colour */
function pArrow(x,y,ang,len,tip,al,sc){g.save();g.globalAlpha*=al==null?1:al;g.translate(x,y);g.rotate(ang);if(sc)g.scale(sc,sc);g.lineCap='round';
 g.strokeStyle=PINK;g.lineWidth=6;g.beginPath();g.moveTo(-len,0);g.lineTo(-10,0);g.stroke();g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(-len,0);g.lineTo(-10,0);g.stroke();
 g.strokeStyle=PINK;g.lineWidth=2.5;g.beginPath();g.moveTo(-len+2,0);g.lineTo(-len-6,-6);g.moveTo(-len+2,0);g.lineTo(-len-6,6);g.moveTo(-len+10,0);g.lineTo(-len+2,-6);g.moveTo(-len+10,0);g.lineTo(-len+2,6);g.stroke();
 g.fillStyle=tip||'#fff';g.strokeStyle=PINK;g.lineWidth=2;g.beginPath();g.moveTo(3,0);g.lineTo(-12,-6.5);g.lineTo(-12,6.5);g.closePath();g.fill();g.stroke();g.lineCap='butt';g.restore()}
function drawArw(h){const age=bt-h.b,fy=BY+BH-4,u=arwU(h);
 if(h.stuckT==null){g.strokeStyle=PINK;
  g.globalAlpha=SET.reduceFlash?.9:.6+.4*Math.abs(Math.sin(age*Math.PI*2));g.lineWidth=3;g.setLineDash([6,5]);g.beginPath();g.ellipse(h.x,fy-4,26,7,0,0,7);g.stroke();g.setLineDash([]);g.globalAlpha=1}   /* the mark on the floor */
 g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 if(h.stuckT==null){const fa=u<0?(SET.reduceFlash?.75:.55+.35*Math.abs(Math.sin(age*Math.PI*2))):Math.max(0,.55*(1-u*1.4));if(fa>0){g.globalAlpha=fa;g.strokeStyle=PINK;g.lineWidth=2.5;g.setLineDash([8,7]);g.beginPath();for(let k=0;k<=24;k++){const[px,py]=arwPos(h,k/24);k?g.lineTo(px,py):g.moveTo(px,py)}g.stroke();g.setLineDash([]);g.globalAlpha=1}}   /* the path it will fly, shown in the air (blinks while waiting, fades once it's shot) */
 if(u<0){g.restore();return}
 if(u<1&&!SET.reduceFlash){g.fillStyle=pkCol('#ff86bd');for(let k=1;k<=5;k++){const[tx,ty]=arwPos(h,Math.max(0,u-k*.03));g.globalAlpha=.1*(6-k);g.beginPath();g.arc(tx,ty,3.5,0,7);g.fill()}g.globalAlpha=1}   /* a faint trail */
 const[x,y,a]=arwPos(h,Math.min(1,u));pArrow(x,y,a,ARW.len,null,h.stuckT!=null?Math.max(0,1-(bt-h.stuckT)*SPB()/ARW.stick):1,ARW.sc);g.restore()}
function drawSnk(h){if(h.ox==null)return;const[x,y]=snkPos(h);g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;for(let k=1;k<4;k++){const o=k*7-14;g.beginPath();g.moveTo(x-h.dx*(ARW.len+10)-h.dy*o,y-h.dy*(ARW.len+10)+h.dx*o);g.lineTo(x-h.dx*(ARW.len+60+k*20)-h.dy*o,y-h.dy*(ARW.len+60+k*20)+h.dx*o);g.stroke()}   /* speed lines */
 pArrow(x,y,h.ang,ARW.len,'#ff2020');g.restore()}
function drawFireball(h){const t=performance.now()/1000,a=h.lf!=null?Math.min(1,h.lf/.5):1;g.globalAlpha=a;g.fillStyle='#ff8a1e';g.beginPath();g.arc(h.x,h.y,h.r+(SET.reduceFlash?0:Math.sin(t*30+h.x)*1.5),0,7);g.fill();
 g.fillStyle='#ffe27a';g.beginPath();g.arc(h.x-1,h.y-1,h.r*.45,0,7);g.fill();g.globalAlpha=1}
function drawSmk(h){const s=(bt-h.b)*SPB(),u=Math.min(1,s/1.4);if(s<.25){g.globalAlpha=1-s/.25;g.fillStyle='#ffe27a';g.beginPath();g.arc(h.x,h.y,20+s*120,0,7);g.fill()}
 g.fillStyle='#777';[[-14,-20],[16,-8],[-6,18],[22,22],[-26,8]].forEach(([dx,dy],k)=>{g.globalAlpha=.6*(1-u);g.beginPath();g.arc(h.x+dx*(1+u*1.5),h.y+dy*(1+u*1.5)-u*20,10+u*18+k,0,7);g.fill()});g.globalAlpha=1}
/* the Volley: the whole fan of arrows leaving her bow straight up at once (harmless; they come back down as 'col') */
function drawVup(h){const s=Math.min(1,(bt-h.b)*SPB()/.6),[bx,by]=pancyHomeBow();for(let i=0;i<9;i++){const a=-Math.PI/2+(i/8-.5)*1.5,d=20+s*190;pArrow(bx+Math.cos(a)*d,by+Math.sin(a)*d,a,COL.len,null,1-s*.8)}}   /* a wide fan of 9 spreading up and out (stands for the whole volley; all COL.n come down) */
function drawCol(h){const age=bt-h.b,y=colY(h);

 if(y==null||y<BY+BH){g.globalAlpha=y==null?(SET.reduceFlash?.9:.55+.45*Math.abs(Math.sin(age*Math.PI*2))):.5;g.fillStyle=PINK;g.beginPath();g.moveTo(h.x,BY-4);g.lineTo(h.x-9,BY-18);g.lineTo(h.x+9,BY-18);g.closePath();g.fill();g.globalAlpha=1}   /* column mark above the top edge */
 if(y!=null){g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();pArrow(h.x,y,Math.PI/2,COL.len);g.restore()}}
function drawCloud(h){const P=cloudParts(h);g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 g.fillStyle=pkCol('#ff2e88');P.forEach(([x,y,r])=>{g.beginPath();g.arc(x,y,r+3,0,7);g.fill()});g.fillStyle=pkCol('#ff86bd');P.forEach(([x,y,r])=>{g.beginPath();g.arc(x,y,r,0,7);g.fill()});
 g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(P[1][0]-8,P[1][1]-12,12,6,0,0,7);g.fill();g.restore()}
function drawSwp(h){const age=bt-h.b,G=swpGeo(h),L=SWP.lane/2,d=swpD(h);
 g.save();g.beginPath();g.rect(BX+2,BY+2,BW-4,BH-4);g.clip();g.translate(G.x0,G.y0);g.rotate(h.ang);   /* lane coordinates: +x = the way she flies */
 if(d==null){const f=Math.min(1,age/.5),pul=SET.reduceFlash?1:.55+.45*Math.abs(Math.sin(age*Math.PI*2));
  g.globalAlpha=.16*f;g.fillStyle=PINK;g.fillRect(-1000,-L,2000,SWP.lane);g.globalAlpha=f;g.strokeStyle=PINK;g.lineWidth=3;g.beginPath();g.moveTo(-1000,-L);g.lineTo(1000,-L);g.moveTo(-1000,L);g.lineTo(1000,L);g.stroke();
  g.globalAlpha=f*pul;g.lineWidth=5;g.lineJoin='round';[-75,0,75].forEach(cx=>{g.beginPath();g.moveTo(cx-14,-30);g.lineTo(cx+12,0);g.lineTo(cx-14,30);g.stroke()});g.lineJoin='miter';g.globalAlpha=1;g.restore();return}   /* the lane + 3 chevrons pointing her way */
 g.globalAlpha=.08;g.fillStyle=PINK;g.fillRect(-1000,-L,2000,SWP.lane);g.globalAlpha=.45;g.strokeStyle='#ff86bd';g.lineWidth=4;g.lineCap='round';
 [-30,-15,0,15,30].forEach(o=>{g.beginPath();g.moveTo(d-150+Math.abs(o),o);g.lineTo(d-60+Math.abs(o),o);g.stroke()});g.lineCap='butt';g.globalAlpha=1;   /* speed streaks behind her */
 g.translate(d,0);g.rotate(Math.PI/2);g.scale(PANCY_SC,PANCY_SC);g.translate(-108,-125);pancyBody({});g.restore()}   /* flying head first */
const PP={wingL:new Path2D('M88 140 Q50 112 30 128 Q40 136 32 146 Q46 150 40 162 Q60 164 88 156 Z'),wingR:new Path2D('M128 140 Q166 112 186 128 Q176 136 184 146 Q170 150 176 162 Q156 164 128 156 Z'),
 wingLlow:new Path2D('M88 140 Q52 116 32 128 L40 136 L30 144 L44 150 L38 160 L58 162 Q72 160 88 156 Z'),wingRlow:new Path2D('M128 140 Q164 116 184 128 L176 136 L186 144 L172 150 L178 160 L158 162 Q144 160 128 156 Z'),
 robe:new Path2D('M92 124 L124 124 Q140 160 146 204 Q134 212 124 204 Q116 214 108 204 Q100 214 92 204 Q82 212 70 204 Q76 160 92 124 Z'),
 robeLow:new Path2D('M92 124 L124 124 Q140 160 146 204 L136 196 L128 214 L118 198 L108 216 L98 198 L88 214 L80 196 L70 204 Q76 160 92 124 Z'),
 trim:new Path2D('M146 204 Q134 212 124 204 Q116 214 108 204 Q100 214 92 204 Q82 212 70 204'),chest:new Path2D('M94 132 Q108 126 122 132 L120 156 Q108 164 96 156 Z'),
 shL:new Path2D('M80 134 Q84 122 98 126 L96 138 Q86 140 80 134 Z'),shR:new Path2D('M136 134 Q132 122 118 126 L120 138 Q130 140 136 134 Z'),shRlow:new Path2D('M136 138 Q134 126 120 128 L120 140 Q130 144 136 138 Z'),
 hair:new Path2D('M76 94 Q72 52 108 52 Q144 52 140 94 Q141 108 137 118 L130 112 L130 94 Q120 80 108 84 Q96 80 86 94 L86 112 L79 118 Q75 108 76 94 Z'),
 bowtie:new Path2D('M108 124 L97 118 L97 130 Z M108 124 L119 118 L119 130 Z')};
/* her body in design space. o: {pure, hurt, low, sin (the sinister face before the sneak shot)} */
function pancyBody(o){const pure=o.pure,lw=o.low&&!o.hurt&&!pure,hu=o.hurt&&!pure,sin=o.sin&&!pure,t=performance.now()/1000,RF=SET.reduceFlash,an=o.an||{},pf=1+(an.puff||0);   /* an: ACT animation (spin, glint, tilt, glow, smile, puff, fluster) */
 const robe=pure?'#fdf6ff':lw?'#e0287f':'#ff2e88',wing=pure?'#ffffff':lw?'#e88ab5':'#ffb3d1',face=pure?'#ffeef4':'#ff86bd',hair=pure?'#ffe08a':'#b8005a',arm=pure?'#eef2f7':lw?'#c4c4cc':'#d9d9e0',bow=pure?'#e8b84a':'#b8005a';
 const F=(p,c)=>{g.fillStyle=c;g.fill(PP[p])},flap=RF?0:Math.sin(t*6)*.08;
 g.save();g.translate(88,148);g.rotate(-flap);g.scale(pf,pf);g.translate(-88,-148);F(lw?'wingLlow':'wingL',wing);g.restore();   /* wings flap around the shoulders */
 g.save();g.translate(128,148);g.rotate(flap);g.scale(pf,pf);g.translate(-128,-148);F(lw?'wingRlow':'wingR',wing);g.restore();
 g.lineCap='round';g.strokeStyle=bow;g.lineWidth=5;g.beginPath();g.moveTo(62,100);g.quadraticCurveTo(34,150,62,200);g.stroke();   /* bow */
 g.strokeStyle=pure?'#fff':'#ffd1e6';g.lineWidth=1.5;g.beginPath();g.moveTo(62,100);g.lineTo(lw?54:62,150);g.lineTo(62,200);g.stroke();
 F(lw?'robeLow':'robe',robe);if(pure){g.strokeStyle='#ffd23f';g.lineWidth=2.5;g.stroke(PP.trim)}
 g.strokeStyle=robe;g.lineWidth=8;g.beginPath();g.moveTo(88,138);g.lineTo(54,148);g.moveTo(128,138);g.lineTo(138,lw?162:158);g.stroke();g.lineCap='butt';
 g.fillStyle=face;g.beginPath();g.arc(48,150,6,0,7);g.fill();g.beginPath();g.arc(139,lw?165:161,6,0,7);g.fill();
 F('chest',arm);if(pure){g.strokeStyle='#c9a640';g.lineWidth=1.5;g.stroke(PP.chest)}
 if(lw){g.strokeStyle='#fff';g.lineWidth=1.8;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(104,134);g.lineTo(110,142);g.lineTo(104,150);g.stroke();g.lineCap='butt';g.lineJoin='miter'}
 g.fillStyle=face;g.beginPath();g.arc(108,90,30,0,7);g.fill();
 F('hair',hair);F('shL',arm);F(lw?'shRlow':'shR',arm);if(pure){g.strokeStyle='#c9a640';g.lineWidth=1.5;g.stroke(PP.shL);g.stroke(PP.shR)}
 if(lw){g.strokeStyle='#fff';g.lineWidth=1.6;g.lineCap='round';g.beginPath();g.moveTo(126,128);g.lineTo(130,134);g.stroke()}
 g.lineWidth=4;g.lineCap='round';   /* halo: whole, or broken in two at low HP */
 if(lw){g.strokeStyle='#c46a96';g.beginPath();g.moveTo(90,46);g.quadraticCurveTo(98,40,106,41);g.moveTo(114,38);g.quadraticCurveTo(124,38,128,46);g.stroke()}
 else{const hy=40+(RF?0:Math.sin(t*3)*1.5);g.strokeStyle=pure?'#ffd23f':'#ff86bd';g.save();g.translate(108,hy);g.rotate(an.tilt||0);if(an.glow){g.shadowColor='#fff3a0';g.shadowBlur=16*an.glow}g.beginPath();g.ellipse(0,0,20*(an.spin==null?1:Math.max(.15,an.spin)),5.5,0,0,7);g.stroke();g.restore();
  if(an.glint){g.save();g.globalAlpha*=an.glint*(RF?1:.6+.4*Math.sin(t*12));g.fillStyle='#fff';g.fillRect(122,hy-7,12,2);g.fillRect(127,hy-12,2,12);g.restore()}
  if(pure){g.strokeStyle='#ffe97a';g.lineWidth=2;g.beginPath();g.moveTo(108,hy-12);g.lineTo(108,hy-17);g.moveTo(88,hy-8);g.lineTo(84,hy-12);g.moveTo(128,hy-8);g.lineTo(132,hy-12);g.stroke()}}
 g.lineWidth=2.5;g.lineJoin='round';
 if(pure){g.strokeStyle='#345';g.beginPath();g.moveTo(94,98);g.quadraticCurveTo(98,92,102,98);g.moveTo(114,98);g.quadraticCurveTo(118,92,122,98);g.moveTo(102,107);g.quadraticCurveTo(108,113,114,107);g.stroke()}
 else if(sin){g.strokeStyle='#ff2020';g.lineWidth=3;g.beginPath();g.moveTo(92,93);g.lineTo(102,99);g.moveTo(124,93);g.lineTo(114,99);g.stroke();g.strokeStyle='#7a0040';g.lineWidth=2.5;g.beginPath();g.moveTo(99,107);g.quadraticCurveTo(108,117,117,107);g.stroke()}   /* sinister */
 else if(an.fluster){g.strokeStyle='#14161c';g.beginPath();g.moveTo(94,93);g.lineTo(100,97);g.lineTo(94,101);g.moveTo(122,93);g.lineTo(116,97);g.lineTo(122,101);g.stroke();g.strokeStyle='#7a0040';g.beginPath();g.moveTo(100,110);g.quadraticCurveTo(103,106,106,110);g.quadraticCurveTo(109,114,112,110);g.quadraticCurveTo(115,106,117,110);g.stroke()}   /* flustered */
 else if(hu){g.strokeStyle='#14161c';g.beginPath();g.moveTo(94,93);g.lineTo(100,97);g.lineTo(94,101);g.moveTo(122,93);g.lineTo(116,97);g.lineTo(122,101);g.stroke();g.strokeStyle='#7a0040';g.beginPath();g.moveTo(103,110);g.lineTo(113,110);g.stroke()}
 else if(lw){g.strokeStyle='#14161c';g.beginPath();g.moveTo(95,99);g.lineTo(101,99);g.stroke();g.fillStyle='#14161c';g.beginPath();g.ellipse(118,100,3.5,4,0,0,7);g.fill();g.fillStyle=face;g.fillRect(113,94,10,4);g.strokeStyle='#7a0040';g.beginPath();g.moveTo(102,112);g.quadraticCurveTo(108,107,114,112);g.stroke()}
 else{if(!RF&&(t%3.7)<.12){g.strokeStyle='#14161c';g.beginPath();g.moveTo(95,97);g.lineTo(101,97);g.moveTo(115,97);g.lineTo(121,97);g.stroke()}
  else{g.fillStyle='#14161c';g.beginPath();g.ellipse(98,97,3.5,4.5,0,0,7);g.fill();g.beginPath();g.ellipse(118,97,3.5,4.5,0,0,7);g.fill()}
  g.strokeStyle='#7a0040';g.beginPath();if(an.smile){g.moveTo(101,106);g.quadraticCurveTo(108,115,115,106)}else{g.moveTo(102,108);g.quadraticCurveTo(108,112,114,108)}g.stroke()}
 g.lineCap='butt';g.lineJoin='miter';
 g.fillStyle='#ffd23f';g.fill(PP.bowtie);g.beginPath();g.arc(108,124,3.5,0,7);g.fill();g.strokeStyle='#8a6a00';g.lineWidth=1.2;g.stroke()}   /* golden bowtie */
/* the boss itself: floats; Arrow Rain moves her to the right side of the board, Swoop takes her out of sight between dives */
/* ---------- DARIUS & KIPTO: art (from the approved mock-up, design coords: body x 2..244, y ~46..182) and attack pieces ---------- */
const DK_SC=1.05,DK_DY=26,DK_DX=26,DKY='#ffd23f',DKY2='#c9a640';
const BLB={warn:1.5,fly:2,r:26,n:6,sp:150},KSW={warn:3,spd:520,body:430,half:11},KST={warn:2.7,spd:430,body:360},BDR={fall:1.6,n:5,sp:170,r:26};
const DKP={},dp=s=>DKP[s]||(DKP[s]=new Path2D(s));   /* cached static shapes */
function dkCol(pure,low){return{body:pure?'#4fcf8f':low?'#e0287f':'#ff2e88',belly:pure?'#f6e7a8':'#ffb3d1',mane:pure?'#e8b84a':'#b8005a',horn:pure?'#fff4d6':'#ffd1e6',skin:pure?'#f2c9a8':'#ff86bd',hair:pure?'#3a2a20':'#b8005a',shirt:pure?'#1f1f26':'#3a1a2a',jeans:pure?'#4a6fb8':'#7a5fae',rip:pure?'#c8d6f0':'#d8c8f0'}}
const dkS=(p,c,w)=>{g.strokeStyle=c;g.lineWidth=w;g.stroke(p)},dkF=(p,c)=>{g.fillStyle=c;g.fill(p)};
/* Kipto's head (centre 188,76): mane, horns, eye, toothy grin, whiskers */
function dkHead(C,o){const lw=o.lw,hu=o.hu,pure=o.pure,k='#14161c';
 dkF(dp(lw?'M160 112 L156 96 L166 104 L166 88 L174 100 L178 86 L182 102 Z':'M160 108 L152 90 L164 98 L162 80 L172 94 L176 76 L182 96 Z'),C.mane);
 dkF(dp('M176 60 L166 40 L182 56 Z M190 58 L188 38 L198 56 Z'),C.horn);
 g.fillStyle=C.body;g.beginPath();g.ellipse(188,76,22,17,0,0,7);g.fill();dkF(dp('M198 66 Q222 66 222 80 Q222 92 204 92 L192 90 Z'),C.body);
 g.fillStyle=k;g.beginPath();g.arc(216,72,2,0,7);g.fill();g.lineCap='round';
 if(lw)dkS(dp('M180 70 q6 -3 12 0'),k,3);else if(hu)dkS(dp('M181 66 l9 6 M181 72 l9 -6'),k,2.5);else if(pure||o.happy)dkS(dp('M181 70 q5 -5 10 0'),k,2.5);
 else if(o.side){g.fillStyle='#fff';g.beginPath();g.ellipse(186,70,5,2.6,0,0,7);g.fill();g.fillStyle=k;g.beginPath();g.arc(182.5,70.3,2.2,0,7);g.fill();dkS(dp('M180 67.5 L192 68.5'),k,2.5)}   /* Mess Up Hair: a sideways squint back at Darius */
 else{g.fillStyle='#fff';g.beginPath();g.ellipse(186,69,5,6,0,0,7);g.fill();g.fillStyle=k;g.beginPath();g.arc(187,70,3,0,7);g.fill()}
 const gy=lw?90:86;if(o.side&&!lw)dkS(dp('M192 89 Q206 84.5 219 88.5'),k,2.5);else dkS(dp('M190 '+gy+' Q206 '+(gy+(lw?2:8))+' 220 '+(gy-2)),k,2.5);   /* ...with his mouth shut in a slight frown */
 if(!lw&&!o.side){const tp=dp('M196 '+(gy+2)+' l3 5 l3 -4 l3 5 l3 -4 l3 4 l3 -5');g.lineJoin='round';dkF(tp,'#fff');dkS(tp,'#fff',1);g.lineJoin='miter'}
 const wd=(lw?14:4)+(o.wig||0);dkS(new Path2D('M214 84 Q228 '+(88+wd)+' 234 '+(78+wd*1.6)+' M210 88 Q220 '+(100+wd)+' 214 '+(106+wd)),C.horn,2);g.lineCap='butt'}
/* Darius (hips ~110,140): skull shirt (X on the skull's left eye), ripped jeans, spiky hair, fist pumped up */
function dkDarius(C,o){const lw=o.lw,hu=o.hu,pure=o.pure,k='#14161c',kn=pure?'#c98f6e':'#b8005a';g.lineCap='round';
 dkF(dp('M98 140 L92 160 L100 160 L106 142 Z M120 140 L126 158 L118 160 L114 142 Z'),C.jeans);dkS(dp('M95 152 l4 2 l-3 2 M122 150 l3 3 l-4 1'),C.rip,1.5);
 dkF(dp('M103 112 h14 a7 7 0 0 1 7 7 v16 a7 7 0 0 1 -7 7 h-14 a7 7 0 0 1 -7 -7 v-16 a7 7 0 0 1 7 -7 Z'),C.shirt);
 g.fillStyle='#fff';g.beginPath();g.arc(110,124,7,0,7);g.fill();g.fillRect(106,128,8,6);
 dkS(dp('M104.5 121 l4 4 M108.5 121 l-4 4'),C.shirt,1.6);g.strokeStyle=C.shirt;g.lineWidth=1.4;g.beginPath();g.arc(113.5,123,2,0,7);g.stroke();dkS(dp('M108 133 v-3 M110 133 v-3 M112 133 v-3'),C.shirt,1);
 if(hu||lw){dkS(dp('M122 118 L134 128'),C.skin,6);g.fillStyle=C.skin;g.beginPath();g.arc(135,130,4.5,0,7);g.fill()}   /* holding on */
 else{const fp=(o.pump||0)-(o.bump||0)*24,sx=o.shake||0;g.lineJoin='round';dkS(new Path2D('M121 118 L133 112 L'+(134+sx)+' '+(96-fp)),C.skin,6);g.lineJoin='miter';
  if(o.bump>.85){g.save();g.strokeStyle='#fff';g.lineWidth=2;g.lineCap='round';g.beginPath();for(let q=0;q<4;q++){const a=q*Math.PI/2+.4;g.moveTo(146+Math.cos(a)*6,96+Math.sin(a)*6);g.lineTo(146+Math.cos(a)*12,96+Math.sin(a)*12)}g.stroke();g.restore()}   /* bump sparkle */
  g.save();g.translate(sx,-fp);dkF(dp('M131.5 83 h5 a3.5 3.5 0 0 1 3.5 3.5 v6 a3.5 3.5 0 0 1 -3.5 3.5 h-5 a3.5 3.5 0 0 1 -3.5 -3.5 v-6 a3.5 3.5 0 0 1 3.5 -3.5 Z'),C.skin);
  dkS(dp('M131 84.5 v4 M134 84 v4.5 M137 84.5 v4'),kn,1.3);dkS(dp('M128.5 91 q3 2 6 0'),kn,1.3);g.restore()}   /* the fist pump */
 dkS(dp('M98 118 L88 132'),C.skin,6);g.fillStyle=C.skin;g.beginPath();g.arc(87,134,4.5,0,7);g.fill();g.beginPath();g.arc(110,98,13,0,7);g.fill();
 dkF(dp(lw||o.flat?'M96 94 L94 84 L101 89 L102 80 L108 87 L111 79 L115 87 L120 81 L120 90 L126 88 L124 96 Q110 86 96 94 Z':'M96 94 L88 80 L100 86 L98 70 L107 82 L111 66 L115 82 L124 70 L122 86 L134 80 L124 96 Q110 86 96 94 Z'),C.hair);
 if(lw){g.fillStyle=k;g.beginPath();g.arc(105,100,1.8,0,7);g.fill();dkS(dp('M112 100 h5'),k,2);dkS(dp('M106 108 q4 -3 8 0'),k,2)}
 else if(hu){dkS(dp('M103 99 l4 2 l-4 2'),k,2);g.fillStyle=k;g.beginPath();g.arc(115,100,1.8,0,7);g.fill();dkS(dp('M106 107 h8'),k,2)}
 else if(pure||o.grin)dkS(dp('M102 100 q3 -3 6 0 M112 100 q3 -3 6 0 M104 105 q6 6 12 0'),k,2);
 else{dkS(dp('M101.5 95 L108 97.6 M118.5 95 L112 97.6'),k,2.2);dkF(dp('M102 98.6 L108.2 100.8 A3.3 3.3 0 0 1 102 98.6 Z M118 98.6 L111.8 100.8 A3.3 3.3 0 0 0 118 98.6 Z'),k);dkS(dp('M103.5 106.5 Q109 108.5 116.5 104'),k,2);dkF(dp('M113 106 L114.5 109.2 L116 105.6 Z'),'#fff')}   /* menacing: brows, tilted half-circle eyes, fanged smirk */
 g.lineCap='butt'}
/* Kipto lying level, his body an even wave from tail to neck (ph moves the wave along), with Darius riding the middle crest */
const dkWave=(x,ph)=>140-8*Math.cos(6.2832*(x-41)/60-ph);
function dkWhole(o){const C=dkCol(o.pure,o.lw),lw=o.lw,hu=o.hu,W8=x=>dkWave(x,o.ph)+(lw&&x>146?(x-146)/30*8:0);
 g.save();g.translate(0,W8(26)-140);dkF(dp('M26 140 Q8 126 4 138 Q12 142 2 152 Q16 152 16 162 Q26 152 32 148 Z'),C.mane);g.restore();   /* tail tuft */
 [69,129].forEach(x=>{const y=W8(x)+2;g.fillStyle=C.body;g.beginPath();g.moveTo(x-1,y);g.arcTo(x+6,y,x+6,y+20,5);g.arcTo(x+6,y+20,x-6,y+20,5);g.arcTo(x-6,y+20,x-6,y,5);g.arcTo(x-6,y,x+6,y,5);g.fill();
  g.strokeStyle=C.horn;g.lineWidth=2.5;g.lineCap='round';g.beginPath();g.moveTo(x-6,y+20);g.lineTo(x-9,y+24);g.moveTo(x,y+21);g.lineTo(x,y+26);g.moveTo(x+6,y+20);g.lineTo(x+9,y+24);g.stroke();g.lineCap='butt'});   /* legs */
 g.beginPath();for(let x=26;x<=176;x+=3){const y=W8(x);x==26?g.moveTo(x,y):g.lineTo(x,y)}
 g.lineCap='round';g.lineJoin='round';g.strokeStyle=C.body;g.lineWidth=26;g.stroke();g.save();g.translate(0,8);g.strokeStyle=C.belly;g.lineWidth=7;g.setLineDash([7,7]);g.stroke();g.setLineDash([]);g.restore();g.lineCap='butt';g.lineJoin='miter';
 g.fillStyle=C.mane;[41,101,161].forEach(x=>{const y=W8(x)-19;g.beginPath();g.moveTo(x-7,y);g.lineTo(x,y-12);g.lineTo(x+7,y);g.closePath();g.fill()});   /* spines */
 if(hu||lw){g.strokeStyle='#fff';g.lineWidth=2;g.lineCap='round';g.save();g.translate(0,W8(70)-140);g.stroke(dp('M70 140 l6 -6 l-2 8 l7 -4'));g.restore();
  if(lw){g.save();g.translate(0,W8(130)-140);g.stroke(dp('M130 142 l5 6 l3 -7'));g.restore();g.save();g.translate(0,W8(40)-140);g.stroke(dp('M40 138 l6 4 l-1 -8'));g.restore()}g.lineCap='butt'}   /* cracks */
 g.save();g.translate(8,48+W8(176)-140);if(o.tilt){g.translate(176,84);g.rotate(o.tilt);g.translate(-176,-84)}dkHead(C,o);g.restore();
 g.save();g.translate(-11,-20+(lw?4:0)+W8(101)-132);dkDarius(C,o);
 if(o.steam>0){g.globalAlpha*=o.steam;g.fillStyle='#fff';const tt=performance.now()/1000;[[96,80],[124,78],[110,72]].forEach(([x,y],q)=>{const f=(tt*1.6+q*.33)%1;g.globalAlpha=o.steam*(1-f)*.8;g.beginPath();g.arc(x+Math.sin(tt*5+q)*3,y-f*22,4+f*4,0,7);g.fill()})}   /* angry steam */
 g.restore()}
/* in the boss spot: a slow wave runs along Kipto, Darius bobs and pumps his fist; Serpent Sweep / the team attack take them out of sight */
function drawDarius(pure,hurt,low){const t=performance.now()/1000,RF=SET.reduceFlash;let oy=0,al=1;
 if(S=='dodge'&&bi==9)for(const h of hz){if(h.dead||h.t!='dkgone')continue;const a=bt-h.b,up=a<1.5?sm2(a/1.5):a>h.dur-1.5?sm2(Math.max(0,(h.dur-a)/1.5)):1;oy=-230*up;al=1-up}
 if(al<=.01)return;
 const lw=low&&!hurt&&!pure,hu=hurt&&!pure;
 /* ACT animations: Fist Bump (fist swings down to bump, sparkle, grin), Scratch Chin (Kipto tilts his head up, eyes shut happily, wave slows),
    Mess Up Hair (Darius's spikes flatten then spring back, steam puffs, fist shakes) */
 const ease=u=>u<0?0:Math.min(1,u/.2)*Math.min(1,(1-u)/.15),uB=actAnU('bump'),uC=actAnU('chin'),uH=actAnU('hair'),eB=ease(uB),eC=ease(uC),eH=ease(uH);
 const bump=uB>=0?Math.sin(Math.min(1,uB/.35)*Math.PI/2)*eB:0;
 g.save();g.globalAlpha*=al;g.translate(DK_DX,DK_DY+oy+(RF?0:Math.sin(t*2)*3));g.scale(DK_SC,DK_SC);g.translate(-122,-125);
 dkWhole({pure,lw,hu,ph:RF?0:t*(2.6-1.8*eC),pump:RF||hu||lw?0:uH>=0?0:Math.abs(Math.sin(t*4.19))*3,wig:RF?0:Math.sin(t*3)*2+6*eC,
  bump,grin:eB>.3,happy:eC>.3,side:eH>.15&&!hu&&!lw,tilt:-.18*eC,flat:uH>=0&&uH<.35,steam:eH,shake:eH&&!RF?Math.sin(t*40)*2.5:0});g.restore()}
const dkHand=()=>[W/2+DK_DX+DK_SC,95+DK_DY+(63-125)*DK_SC];   /* Darius's raised fist, where Blob Splat is thrown from */
function dkBlob(x,y,r,sq){g.save();g.translate(x,y);if(sq)g.scale(1+sq,1-sq);g.fillStyle=DKY;g.beginPath();g.arc(0,0,r,0,7);g.fill();g.strokeStyle=DKY2;g.lineWidth=Math.max(1.5,r*.15);g.stroke();g.fillStyle='#fff6c8';g.beginPath();g.arc(-r*.35,-r*.35,r*.28,0,7);g.fill();g.restore()}
function dkRing(x,y,rx,ry,age){g.save();g.globalAlpha*=SET.reduceFlash?.8:.4+.5*Math.abs(Math.sin(age*Math.PI*2));g.strokeStyle=DKY;g.lineWidth=3;g.setLineDash([6,5]);g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.stroke();g.setLineDash([]);g.restore()}
function dkSplat(x,y,e){if(e<.6){g.save();g.globalAlpha*=1-e/.6;g.fillStyle=DKY;g.beginPath();g.ellipse(x,y,30+e*50,14+e*14,0,0,7);g.fill();g.restore()}}
function drawBlb(h){const a=bt-h.b;if(h.landed){dkSplat(h.x,h.y,bt-h.landed);return}dkRing(h.x,h.y,BLB.r,BLB.r,a);
 if(a>=h.warn){const u=Math.min(1,(a-h.warn)/BLB.fly),[hx,hy]=dkHand();dkBlob(hx+(h.x-hx)*u,hy+(h.y-hy)*u-120*4*u*(1-u),20,Math.sin(u*Math.PI)*.08)}}   /* lobbed from his fist */
function drawBdr(h){const e=bt-h.b,fy=BY+BH;if(h.landed){dkSplat(h.x,fy-6,bt-h.landed);return}dkRing(h.x,fy-4,26,7,e);const u=Math.min(1,e/BDR.fall);dkBlob(h.x0+(h.x-h.x0)*u,h.y0+(fy-18-h.y0)*u*u-40*u*(1-u),18)}
/* Kipto flying through the board: along a wavy path (ksw) or a straight lane (kst); the path / lane blinks first */
function kHead(h,a){const s=a*SPB(),sp=(h.t=='ksw'?KSW.spd:KST.spd)*dkSpd;return h.dir>0?BX-40+s*sp:BX+BW+40-s*sp}
const kPathY=(h,x)=>h.t=='kst'?h.y:h.mid+h.amp*Math.sin((x-BX)/h.wl*6.2832+h.ph);
function kPts(h){const a=bt-h.b-h.warn;if(a<0)return null;const hd=kHead(h,a),tl=hd-h.dir*(h.t=='ksw'?KSW.body:KST.body),P=[];for(let q=0;q<=24;q++){const x=tl+(hd-tl)*q/24;P.push([x,kPathY(h,x)])}return P}
function drawKfly(h){const a=bt-h.b-h.warn,P=kPts(h);g.save();g.beginPath();g.rect(BX+2,BY+2,BW-4,BH-4);g.clip();
 const wa=a<0?(SET.reduceFlash?.8:.45+.45*Math.abs(Math.sin((bt-h.b)*Math.PI*2))):Math.max(0,.5-a/3);
 if(wa>0){g.save();g.globalAlpha*=wa;g.strokeStyle=PINK;g.lineWidth=3;g.setLineDash([10,8]);g.beginPath();for(let x=BX;x<=BX+BW;x+=6){const y=kPathY(h,x);x==BX?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();g.setLineDash([]);g.restore()}
 if(P){const C={...dkCol(false,false),body:pkCol('#ff2e88'),belly:pkCol('#ffb3d1'),mane:pkCol('#b8005a',1)};
  g.lineCap='round';g.lineJoin='round';g.beginPath();P.forEach(([x,y],q)=>q?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=C.body;g.lineWidth=KSW.half*2;g.stroke();
  g.save();g.translate(0,6);g.strokeStyle=C.belly;g.lineWidth=5;g.setLineDash([6,7]);g.stroke();g.setLineDash([]);g.restore();g.lineCap='butt';g.lineJoin='miter';
  g.fillStyle=C.mane;for(let q=3;q<24;q+=5){const[x,y]=P[q];g.beginPath();g.moveTo(x-6,y-9);g.lineTo(x,y-20);g.lineTo(x+6,y-9);g.closePath();g.fill()}
  const[hx,hy]=P[24];g.save();g.translate(hx,hy);g.scale(h.dir*.8,.8);g.translate(-188,-76);dkHead(C,{});g.restore();
  const dx=hx-h.dir*150,dy=kPathY(h,dx);g.save();g.translate(dx,dy);g.scale(.8,.8);g.translate(-112,-152);dkDarius(dkCol(false,false),{pump:SET.reduceFlash?0:Math.abs(Math.sin(performance.now()/1000*4.19))*3});g.restore()}   /* Darius rides along */
 g.restore()}
/* ---------- TOURETTE TURRET: art (from the approved mock-up v2, design coords: robot centre 125,92, treads to y 188) and attack pieces ---------- */
const TR_SC=.68,TR_DY=36,TR_DX=0,SWV={spd:130,thk:11,gw:.8,r0:30},VOL={bars:[17,73,486,542],bw:41,spk:[150,383],sw:67,sh:82,pel:150,tilt:.16,hop:8},TBM={move:.6,warn:1.3,on:1,thk:14};
let trFlash=0;
function trCol(pure,low){return pure?{B:'#eef3ff',D:'#9fb8e0',DD:'#8aa0c8',L:'#b9c8e6',E1:'#2a3340',E2:'#3a4658',E3:'#4b5a70',CAP:'#7fffd4',ANT:'#7fffd4'}:{B:low?'#e0287f':'#ff2e88',D:'#b8005a',DD:'#7a0040',L:'#ff86bd',E1:'#2a1220',E2:'#4a2236',E3:'#5e2c44',CAP:low?'#7a2a4a':'#ff86bd',ANT:'#ff86bd'}}
function trBody(o){const C=trCol(o.pure,o.lw),lw=o.lw,hu=o.hu,pu=o.pulse||0;
 g.fillStyle=C.DD;g.beginPath();g.moveTo(86,162);g.arcTo(177,162,177,188,13);g.arcTo(177,188,73,188,13);g.arcTo(73,188,73,162,13);g.arcTo(73,162,177,162,13);g.fill();   /* treads */
 [89,107,125,143,161].forEach(x=>{g.fillStyle=C.D;g.beginPath();g.arc(x,175,7,0,7);g.fill();g.fillStyle=C.DD;g.beginPath();g.arc(x,175,2.5,0,7);g.fill()});
 g.strokeStyle=C.D;g.lineWidth=2;g.beginPath();g.moveTo(86,162);g.arcTo(177,162,177,188,13);g.arcTo(177,188,73,188,13);g.arcTo(73,188,73,162,13);g.arcTo(73,162,177,162,13);g.stroke();
 g.save();g.translate(125,160);g.rotate((lw?-.16:0)+(o.sway||0));g.translate(-125,-160);
 g.fillStyle=C.D;g.fillRect(113,138,24,26);g.fillStyle=C.DD;g.beginPath();g.ellipse(125,146,30,7,0,0,7);g.fill();   /* neck + swivel ring */
 g.fillStyle=C.D;g.fillRect(64,88,12,12);g.fillRect(174,88,12,12);
 [58,192].forEach(x=>{g.fillStyle=C.D;g.beginPath();g.arc(x,94,15+pu*1.5,0,7);g.fill();g.fillStyle=C.E1;g.beginPath();g.arc(x,94,9+pu*1.5,0,7);g.fill()});   /* side speakers */
 dkS(dp('M53 90 h10 M53 94 h10 M53 98 h10 M187 90 h10 M187 94 h10 M187 98 h10'),C.DD,1.5);
 g.lineCap='round';if(lw){dkS(dp('M125 40 Q122 30 112 27'),C.D,4);g.fillStyle=C.D;g.beginPath();g.arc(109,27,5,0,7);g.fill()}else{dkS(dp('M125 40 L125 24'),C.D,4);g.fillStyle=C.ANT;g.beginPath();g.arc(125,21,5,0,7);g.fill()}g.lineCap='butt';
 g.fillStyle=C.B;g.beginPath();g.arc(125,92,54,0,7);g.fill();dkS(dp('M103 47 Q125 37 147 47'),C.D,3);dkS(dp('M82 124 Q125 142 168 124'),C.D,2.5);
 const gone=o.loose||(o.crank!=null&&o.crank>=.3),BOLT=[[166,68],[84,114]];   /* Crank It Up pops 2 bolts off (they stay off: its DEF is down) */
 g.fillStyle=C.D;(lw?[[84,68],[84,114]]:[[84,68],[166,68],[84,114],[166,114]]).filter(([x,y])=>!(gone&&BOLT.some(b=>b[0]==x&&b[1]==y))).forEach(([x,y])=>{g.beginPath();g.arc(x,y,3,0,7);g.fill()});
 g.lineCap='round';g.lineJoin='round';if(lw)dkS(dp('M152 52 l-6 10 l7 6 l-5 9 M90 120 l8 4 l-2 8'),'#fff',2);
 const lk=o.look,lx=lk==null?0:Math.cos(lk)*4,ly=lk==null?0:Math.sin(lk)*4,fl=o.flash||0;   /* the speaker eye (looks the way it aims) */
 g.fillStyle=C.E1;g.beginPath();g.arc(125,92,28,0,7);g.fill();g.fillStyle=C.E2;g.beginPath();g.arc(125,92,22+pu,0,7);g.fill();g.strokeStyle=C.E1;g.lineWidth=1.5;g.beginPath();g.arc(125,92,16,0,7);g.stroke();
 g.fillStyle=C.E3;g.beginPath();g.arc(125+lx*.5,92+ly*.5,11+pu,0,7);g.fill();if(o.pure){g.globalAlpha*=.25;g.fillStyle=C.CAP;g.beginPath();g.arc(125,92,13,0,7);g.fill();g.globalAlpha/=.25}
 const pl=o.polish==null?-1:o.polish,bl=pl>=.86&&pl<.96?Math.max(.12,Math.abs(Math.cos((pl-.86)/.1*Math.PI))):1,cr=Math.max(1.5,7+pu*2+fl*3);   /* Polish Speaker: the eye blinks at the end */
 g.save();g.globalAlpha*=1-.55*(o.dim||0);g.fillStyle=fl>.3?'#fff':C.CAP;g.beginPath();g.ellipse(125+lx,92+ly,cr,cr*bl,0,0,7);g.fill();g.restore();   /* Turn Down dims it */
 if(pl>=0){   /* Polish Speaker: a cloth wipes across the eye, then a shine sweeps over the grille and a sparkle pops */
  if(pl>.06&&pl<.6){const w=(pl-.06)/.54,cx=125+Math.sin(w*Math.PI*4)*20,cy=92+Math.sin(w*Math.PI*2)*5;g.save();g.translate(cx,cy);g.rotate(-.25+Math.sin(w*Math.PI*4)*.18);
   g.fillStyle='#fff6d8';g.strokeStyle='#c9b98a';g.lineWidth=1.5;g.beginPath();g.rect(-14,-10,28,20);g.fill();g.stroke();g.beginPath();g.moveTo(-14,-2);g.lineTo(14,-2);g.moveTo(-14,4);g.lineTo(14,4);g.stroke();g.restore()}
  if(pl>=.58&&pl<.84){const w=(pl-.58)/.26,x=92+w*66;g.save();g.beginPath();g.arc(125,92,28,0,7);g.clip();g.globalAlpha*=.85*Math.sin(w*Math.PI);g.strokeStyle='#fff';g.lineCap='round';
   g.lineWidth=8;g.beginPath();g.moveTo(x-14,60);g.lineTo(x+14,124);g.stroke();g.lineWidth=3;g.beginPath();g.moveTo(x+4,60);g.lineTo(x+32,124);g.stroke();g.restore()}
  if(pl>=.74&&pl<1){const k=Math.sin((pl-.74)/.26*Math.PI),s=10*k;g.fillStyle='#fff';g.beginPath();g.moveTo(150,66-s);g.lineTo(152,66);g.lineTo(150+s,68);g.lineTo(152,70);g.lineTo(150,70+s);g.lineTo(148,70);g.lineTo(150-s,68);g.lineTo(148,66);g.closePath();g.fill()}}
 if(o.crank!=null&&o.crank>=.3){const w=(o.crank-.3)/.7;[[166,68,1],[84,114,-1]].forEach(([x,y,d])=>{g.save();g.translate(x+d*70*w,y-55*w+120*w*w);g.rotate(w*12*d);g.fillStyle=C.D;g.beginPath();g.arc(0,0,4.5,0,7);g.fill();g.strokeStyle=C.DD;g.lineWidth=1.5;g.beginPath();g.moveTo(-3,0);g.lineTo(3,0);g.stroke();g.restore()})}   /* the 2 bolts fly off */
 if(!lw&&!hu){g.save();g.globalAlpha*=.5;dkS(dp('M111 81 A16 16 0 0 1 124 75'),'#fff',2);g.restore()}
 if(hu||lw)dkS(dp(lw?'M109 79 l7 6 l-4 5 l8 5 l-3 6 M138 100 l6 3':'M109 79 l7 6 l-4 5 l8 5 l-3 6'),'#fff',2);
 if(hu||(o.crank!=null&&o.crank>=0)){g.save();g.globalAlpha*=.8;dkS(dp('M196 58 l8 -4 l-4 8 l8 -4 M54 60 l-8 -4 l4 8 l-8 -4'),'#fff',2);g.restore()}   /* screech lines (hurt, Crank It Up) */
 g.lineCap='butt';g.lineJoin='miter';g.restore();
 if(lw&&!o.rf&&Math.sin(performance.now()/90)>.2){g.fillStyle='#ffd23f';g.fill(dp('M206 104 l4 -9 l3 7 l8 -3 l-6 6 l6 4 l-8 0 l-2 8 l-3 -7 l-8 2 l6 -5 Z'))}}   /* a spark */
const trEyeY=()=>95+TR_DY+(92-103)*TR_SC;
const trEye=ox=>[W/2+TR_DX+(ox==null?(S=='dodge'&&bi==10&&trX!=null?trX:0):ox),trEyeY()];
function drawTurret(pure,hurt,low,card){const t=performance.now()/1000,RF=SET.reduceFlash,lw=low&&!hurt&&!pure,hu=hurt&&!pure,fb=bt-Math.floor(bt);
 const pulse=RF||card?0:Math.max(0,1-fb*3),flash=Math.max(0,1-(performance.now()-trFlash)/220),ox=!card&&S=='dodge'&&bi==10&&trX!=null?trX:0;
 /* ACT animations: Polish Speaker (cloth wipe, shine, sparkle, blink), Turn Down (eye shrinks + dims, it settles lower), Crank It Up (shakes, eye flickers, 2 bolts fly off) */
 const ease=u=>u<0?0:Math.min(1,u/.2)*Math.min(1,(1-u)/.15),uP=card?-1:actAnU('polish'),uQ=card?-1:actAnU('quiet'),uC=card?-1:actAnU('crank'),eQ=ease(uQ),eC=ease(uC),
  shk=RF?0:eC*Math.sin(t*70)*3,fC=!RF&&uC>=0&&Math.sin(t*30)>0?eC:0;
 g.save();g.translate((card?0:TR_DX)+ox+shk,(card?0:TR_DY)+eQ*5);g.scale(TR_SC,TR_SC);g.translate(-125,-103);
 trBody({pure,lw,hu,pulse:pulse*(1-eQ)-1.5*eQ,flash:Math.max(flash,fC),rf:RF,sway:RF||card?0:Math.sin(t*1.6)*.05*(1-eQ),look:card?null:trLook,
  dim:eQ,polish:uP,crank:uC>=0?uC:null,loose:!card&&!pure&&trDefDrop>0});g.restore()}
/* Sound Waves */
const swvR=h=>SWV.r0+(bt-h.b)*SPB()*SWV.spd;
function drawSwv(h){const[ox,oy]=trEye(),r=swvR(h);g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();g.lineCap='round';
 g.strokeStyle=PINK;g.lineWidth=SWV.thk;g.beginPath();g.arc(ox,oy,r,h.a+SWV.gw/2,h.a-SWV.gw/2+6.2832);g.stroke();
 g.strokeStyle='#ffd1e6';g.lineWidth=2;g.stroke();g.lineCap='butt';g.restore()}
/* Volume Bars: heights change every 2 beats (step s = floor(age/2)) and SNAP there like an audio meter: a fast spring that overshoots and
   settles (~.25 s). Speakers: they take turns on the song's drum hits (TR_DR): a speaker hops up just before its hit, LANDS on it,
   squashes and ejects its pellets, and leans the other way each time (so the burst, the landing and the drum line up). */
function volH(h,q){const age=bt-h.b,s=Math.max(0,Math.floor(age/2)),f=age-s*2,cur=h.hs[Math.min(s,h.hs.length-1)][q],prv=s?h.hs[s-1][q]:cur,ts=f*SPB();
 return Math.min(BH*.97,Math.max(0,BH*(cur+(prv-cur)*Math.exp(-13*ts)*Math.cos(28*ts))))}
/* The song's drum hits (1985, the Turret's mp3), measured from the audio: one bit per 16th note in SONG beats at 132 BPM (0 = the
   breakdown's first beat, 640 slots = intro 32 + one loop 128), hex. The speakers take turns:
   each drum hit = one speaker lands and fires. */
const TR_DR=(()=>{const hx='',a=new Uint8Array(hx.length*4);   /* EMPTY by choice: the user picked 'every beat' (2026-11-25). Fill it to make the speakers follow a drum pattern instead. */
 for(let i=0;i<hx.length;i++){const v=parseInt(hx[i],16);for(let b=0;b<4;b++)a[i*4+b]=(v>>(3-b))&1}return a})();
/* drum hits from game beat b0 for dur beats, as ages (beats after b0). Game beats -> song beats undo the loop's beat skip (musBt).
   Not the Turret's song playing (no mp3) -> every beat. */
function trDrumHits(b0,dur){const D=BOSSES[10],B0=D.introBeats,L=D.loopBeats,W=Math.ceil(L),out=[];
 if(!TR_DR.length||!(mus&&mus.b.mp3=='turret')){for(let x=Math.ceil(b0);x<b0+dur;x++)out.push(x-b0);return out}
 for(let x=Math.ceil(b0*4)/4;x<b0+dur;x+=.25){let s=x;if(x>=B0+L){const q=(x-B0)%W;if(q>=L)continue;s=B0+q}const i=Math.round(s*4);if(i>=0&&i<TR_DR.length&&TR_DR[i]&&x-b0>=.25)out.push(x-b0)}return out}
/* speaker q's hits: index of its last hit at or before `age` (-1 = none yet) */
function volIx(h,q,age){const a=h.hq[q];let i=h.pi[q];while(i+1<a.length&&a[i+1]<=age)i++;while(i>=0&&a[i]>age)i--;h.pi[q]=i;return i}
/* hop window before speaker q's next hit: [start, landing] or null */
function volWin(h,q,age){if(!h.hq)return null;const a=h.hq[q],i=volIx(h,q,age),nx=a[i+1];if(nx==null)return null;const pv=i>=0?a[i]:nx-1,d=Math.min(.5,(nx-pv)*.7);return[nx-d,nx,i]}
const volHop=(h,q,age)=>{if(age<0||SET.reduceFlash)return 0;const w=volWin(h,q,age);return w&&age>=w[0]?Math.sin((age-w[0])/(w[1]-w[0])*Math.PI)*VOL.hop:0};
const volSd=k=>((k%2)+2)%2?1:-1;
const volRock=(q,age,h)=>{if(age<0||SET.reduceFlash||!h||!h.hq)return 0;const i=volIx(h,q,age),w=volWin(h,q,age),u=w&&age>=w[0]?(age-w[0])/(w[1]-w[0]):0,e=u*u*(3-2*u);
 return(q?-1:1)*VOL.tilt*(volSd(i)+(volSd(i+1)-volSd(i))*e)};   /* tilts while airborne toward its next lean, holds on the ground */
const volSq=(q,age,h)=>{if(age<0||SET.reduceFlash||!h||!h.hq)return 0;const i=volIx(h,q,age);return i<0?0:Math.max(0,1-(age-h.hq[q][i])*SPB()/.13)};   /* squash on landing */
function volCone(q,age,h){const x=BX+VOL.spk[q]+VOL.sw/2,a=volRock(q,age,h),L=(VOL.sh-28)*(1-.14*volSq(q,age,h));return[x+Math.sin(a)*L,BY+BH-volHop(h,q,age)-Math.cos(a)*L]}
function drawVol(h){const age=bt-h.b,F=BY+BH;g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 VOL.bars.forEach((o,q)=>{const x=BX+o,hh=volH(h,q);g.fillStyle=PINK;g.fillRect(x,F-hh,VOL.bw,hh);g.fillStyle='rgba(0,0,0,.28)';for(let y=F-10;y>F-hh+6;y-=10)g.fillRect(x,y,VOL.bw,3);g.fillStyle='#ffd1e6';g.fillRect(x,F-hh,VOL.bw,5)});
 const s=Math.max(0,Math.floor(age/2));if(age-s*2>1.4&&s+1<h.hs.length){g.strokeStyle=PINK;g.lineWidth=2;g.setLineDash([6,5]);VOL.bars.forEach((o,q)=>{const hh=BH*h.hs[s+1][q];g.strokeRect(BX+o,F-hh,VOL.bw,hh)});g.setLineDash([])}   /* next heights */
 [0,1].forEach(q=>{const x=BX+VOL.spk[q],px=x+VOL.sw/2,hy=volHop(h,q,age),a=volRock(q,age,h),p=Math.max(0,1-(age-(h['f'+q]==null?-9:h['f'+q]))*SPB()/.25);
  g.fillStyle=PINK;g.globalAlpha*=.18;g.beginPath();g.ellipse(px,F-2,VOL.sw/2*(1-hy/VOL.hop*.3),4,0,0,7);g.fill();g.globalAlpha/=.18;
  const sq=volSq(q,age,h);g.save();g.translate(px,F-hy);g.rotate(a);g.scale(1+.12*sq,1-.14*sq);g.translate(-VOL.sw/2,-VOL.sh);g.fillStyle=pkCol('#7a0040',1);g.fillRect(0,0,VOL.sw,VOL.sh);g.strokeStyle=pkCol('#b8005a',1);g.lineWidth=2;g.strokeRect(0,0,VOL.sw,VOL.sh);
  const cx=VOL.sw/2,r=18+p*4;g.fillStyle='#2a1220';g.beginPath();g.arc(cx,28,r,0,7);g.fill();g.fillStyle='#4a2236';g.beginPath();g.arc(cx,28,r*.66,0,7);g.fill();g.fillStyle=p>.3?'#fff':pkCol('#ff86bd');g.beginPath();g.arc(cx,28,r*.28,0,7);g.fill();
  g.fillStyle='#2a1220';g.beginPath();g.arc(cx,VOL.sh-18,8,0,7);g.fill();g.restore()});
 g.restore()}
/* Beam Fire: the beam's path from the speaker eye, 2 bounces off the walls / floor inside the board */
function trBeam(ox,a){const[ex,ey]=trEye(ox),dx0=Math.cos(a),dy0=Math.sin(a),k0=(BY-ey)/dy0,P=[[ex,ey],[ex+dx0*k0,BY]];let x=P[1][0],y=BY,dx=dx0,dy=dy0;
 for(let b=0;b<=2;b++){const tL=dx<0?(BX-x)/dx:1e9,tR=dx>0?(BX+BW-x)/dx:1e9,tB=dy>0?(BY+BH-y)/dy:1e9,tT=dy<0?(BY-y)/dy:1e9,tm=Math.min(tL,tR,tB,tT);x+=dx*tm;y+=dy*tm;P.push([x,y]);if(tm==tT)break;if(tm==tL||tm==tR)dx=-dx;else dy=-dy}return P}
function drawTbm(h){if(!h.P)return;const e=bt-h.b-TBM.move,ln=P=>{g.beginPath();P.forEach(([x,y],q)=>q?g.lineTo(x,y):g.moveTo(x,y))};g.save();g.lineJoin='round';g.lineCap='round';
 if(e>=0&&e<TBM.warn){g.globalAlpha*=SET.reduceFlash?.8:.45+.45*Math.abs(Math.sin(e*Math.PI*3));g.strokeStyle=PINK;g.lineWidth=2;g.setLineDash([8,6]);g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();ln(h.P.slice(1));g.stroke();g.restore();g.setLineDash([])}   /* the path, shown first */
 else if(e>=TBM.warn&&e<TBM.warn+TBM.on){const f=(e-TBM.warn)/TBM.on,w=TBM.thk*(f<.15?f/.15:1-Math.max(0,(f-.7)/.3));
  ln(h.P);g.strokeStyle=PINK;g.globalAlpha*=.35;g.lineWidth=w+8;g.stroke();g.globalAlpha/=.35;g.lineWidth=w;g.stroke();g.strokeStyle='#fff';g.lineWidth=w*.35;g.stroke()}
 g.restore()}
function drawPancy(pure,hurt,low){const t=performance.now()/1000,RF=SET.reduceFlash;let ox=0,oy=0,al=1,sin=false;
 if(S=='dodge'&&bi==8)for(const h of hz){if(h.dead)continue;const a=bt-h.b;
  if(h.t=='pmove'){const[sx,sy]=pancySide(),e=sm2(Math.min(1,a/1.5))*(a>h.dur-1.5?sm2(Math.max(0,(h.dur-a)/1.5)):1);ox=(sx-W/2)*e;oy=(sy-95-PANCY_DY)*e}
  else if(h.t=='pgone'){const up=a<1.5?sm2(a/1.5):a>h.dur-1.5?sm2(Math.max(0,(h.dur-a)/1.5)):1;oy=-230*up;al=1-up}
  else if(h.t=='snk'&&(h.ox==null||bt-h.fb<1.5))sin=true}
 if(al<=.01)return;
 const ease=u=>u<0?0:Math.min(1,u/.2)*Math.min(1,(1-u)/.15),uA=actAnU('applaud'),uH=actAnU('halo'),uR=actAnU('ruffle'),eA=ease(uA),eH=ease(uH),eR=ease(uR);
 const an={spin:uA>=0?Math.abs(Math.cos(Math.max(0,Math.min(1,(uA-.2)/.4))*Math.PI*2)):1,glint:eA,tilt:uH>=0?-.3*Math.cos(uH*18)*Math.max(0,1-uH*1.6):0,glow:uH>.5?eH:0,smile:eH>.3,puff:.18*eR,fluster:eR>.2};   /* Applaud: bow + halo spin + glint. Straighten Halo: wobble, settle, glow, smile. Ruffle Feathers: puffed shaking wings, flustered */
 g.save();g.globalAlpha*=al;g.translate(ox+(eR&&!RF?Math.sin(t*45)*2*eR:0),oy+PANCY_DY+(RF?0:Math.sin(t*2.4)*4)+8*eA);g.scale(PANCY_SC,PANCY_SC*(1-.06*eA));g.translate(-108,-125);pancyBody({pure,hurt,low,sin,an});g.restore()}function drawBoss(i,x,y,pu,sc,pure,hurt,low,happy,angry){const lw=low&&!hurt&&!pure,hy=happy&&!hurt&&!low&&!pure;g.save();g.translate(x,y);g.scale(sc,sc);const c=pure?PUREC[i]:i==0?'#ff7eb3':i==1?PINK:'#ff0a54';g.fillStyle=c;
if(i==0){g.save();g.rotate(Math.PI/4);const s=46+10*pu;g.fillRect(-s/2,-s/2,s,s);g.restore();if(pure){g.strokeStyle='#345';g.lineWidth=4;g.lineCap='round';g.beginPath();g.arc(-10,-3,6,Math.PI,0);g.stroke();g.beginPath();g.arc(10,-3,6,Math.PI,0);g.stroke();g.beginPath();g.arc(0,6,11,.25,Math.PI-.25);g.stroke();g.lineCap='butt'}else{g.fillStyle='#000';if(hurt){g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(-14,-9);g.lineTo(-6,-4);g.lineTo(-14,1);g.moveTo(14,-9);g.lineTo(6,-4);g.lineTo(14,1);g.stroke()}else if(lw){[-11.5,11.5].forEach(ex=>{g.fillStyle='#000';g.fillRect(ex-8,-10,16,16);g.fillStyle='#fff';g.beginPath();g.arc(ex-3,-6.2,3.4,0,6.29);g.fill();g.beginPath();g.arc(ex+3.2,-.5,1.7,0,6.29);g.fill()})}else if(hy){g.strokeStyle='#000';g.lineWidth=3;g.lineJoin='miter';g.beginPath();g.moveTo(-14,-2);g.lineTo(-10,-8);g.lineTo(-6,-2);g.moveTo(6,-2);g.lineTo(10,-8);g.lineTo(14,-2);g.stroke()}else{g.fillRect(-14,-9,8,10);g.fillRect(6,-9,8,10)}if(lw){g.strokeStyle='#000';g.lineWidth=3;g.lineCap='round';g.beginPath();g.arc(0,24,11,Math.PI+.55,-.55);g.stroke();g.lineCap='butt'}else{g.fillStyle='#000';g.fillRect(-10,13,20,4)}}}
else if(i==1){g.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8+bt*.3,r=(k%2?(pure?44:30):50)+8*pu;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,0,15,0,6.29);g.fill();g.fillStyle='#000';if(lw){const rot=SET.reduceFlash?0:performance.now()/500;g.strokeStyle='#000';g.lineWidth=1.7;g.lineCap='round';g.lineJoin='round';g.beginPath();for(let k=0;k<=60;k++){const a=k*.35+rot,r=1+k*.15;g[k?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}g.stroke();g.lineCap='butt'}else if(hy){g.beginPath();g.arc(0,0,7,0,6.29);g.fill();g.save();g.beginPath();g.arc(0,0,16,0,6.29);g.clip();g.fillStyle=c;g.beginPath();g.moveTo(-17,8.5);g.quadraticCurveTo(0,-2.5,17,8.5);g.lineTo(17,20);g.lineTo(-17,20);g.closePath();g.fill();g.restore()}else{g.beginPath();g.arc(0,0,hurt?3.5:7,0,6.29);g.fill()}}
else if(i==3)drawStarSoulcerer(pu,pure,hurt,low,hy,angry&&!pure);
else if(i==4)drawRacer(pu,pure,hurt,low);
else if(i==5)drawTangaBoss(pure,hurt,low);
else if(i==6)drawSlugBoss(pure,hurt,low);
else if(i==7)drawNeutlin(pure,hurt,low);
else if(i==8)drawPancy(pure,hurt,low);else if(i==9)drawDarius(pure,hurt,low);else if(i==10)drawTurret(pure,hurt,low,sc<1);else if(i==11)drawPretender(pure,hurt,low,sc<1);else if(i==12)drawSquareSoulcerer(pu,pure,hurt,low,hy,angry&&!pure,sc<1);
else{g.fillRect(-72,-12,144,54);if(!pure)for(let k=0;k<4;k++){const dx=18*2/(22+6*pu),l=k?-72+k*36-dx:-72,r=k<3?-36+k*36+dx:72;g.beginPath();g.moveTo(l,-10);if(!k)g.lineTo(-72,-12);g.lineTo(-54+k*36,-34-6*pu);if(k==3)g.lineTo(72,-12);g.lineTo(r,-10);g.fill()}
if(hurt&&!pure){g.fillStyle='#fff';g.beginPath();g.ellipse(-40,5,9,3.5,0,0,6.29);g.fill();g.fillStyle='#000';g.fillRect(-42,2,4,6);g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(5,-1);g.lineTo(-4,5);g.lineTo(5,11);g.moveTo(35,0);g.lineTo(45,10);g.moveTo(45,0);g.lineTo(35,10);g.stroke()}else{g.fillStyle='#fff';[-40,0,40].forEach(ex=>{g.beginPath();g.arc(ex,5,9,0,6.29);g.fill()});g.fillStyle=pure?'#345':'#000';[-40,0,40].forEach(ex=>{if(pure){g.beginPath();g.arc(ex,5,4,0,6.29);g.fill()}else if(lw&&ex<40)g.fillRect(ex-1,-1,2,12);else if(hy){g.beginPath();g.arc(ex,5,5.5,0,6.29);g.fill()}else g.fillRect(ex-2,0,4,10)});if(lw){g.fillStyle=c;g.beginPath();g.moveTo(30,-5);g.lineTo(50,-5);g.lineTo(50,7.8);g.lineTo(30,2.2);g.closePath();g.fill();g.strokeStyle='#000';g.lineWidth=2.5;g.beginPath();g.moveTo(32,2.8);g.lineTo(48,7.2);g.stroke()}}
if(lw){const Z=[[-60,32],[-50,30],[-30,38],[-10,30],[10,38],[30,30],[50,38],[70,30]],poly=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach((p,k)=>g[k?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fill()},U=Z.map(p=>[p[0],p[1]-11]),D=Z.map(p=>[p[0],p[1]+2]);g.fillStyle='#000';g.fillRect(-63,17,134,24);poly([[-60,19]].concat(U),'#fff');poly(D.concat([[70,40],[-60,40]]),'#fff')}else{g.strokeStyle=pure?'#345':'#000';g.lineWidth=3;g.beginPath();if(pure)g.arc(0,22,14,.2,Math.PI-.2);else{g.moveTo(-60,32);for(let k=0;k<7;k++)g.lineTo(-60+k*20+10,k%2?38:30)}g.stroke()}}
g.restore()}
/* ---------- THE PRETENDER (Jack): art (approved mock-ups v7-v9, design 160x220: feet at y 205, mask centre 80,69) and attack pieces ---------- */
const PR_SC=.7,PR_CARD=.6,PR_DY=93,PMK={warn:2,fly:4,back:1,r:22},PDR={form:1,fall:1,wet:3,dry:.6,gone:2},PCC={seg:8,delay:1,hit:13};
/* the attack's speed (h.sp, from prSpd: Play Along .75, Scratch the Paint 1.25) stretches or squeezes the mask's flight, the drip's run and the copy's delay */
const pmkF=h=>PMK.fly/(h.sp||1),pdrF=h=>PDR.fall/(h.sp||1),pccD=h=>PCC.delay/(h.sp||1);
const prCol=pure=>pure?{cl:'#8a5a35',cd:'#5e3b22',ln:'#4a3020',mk:'#ffd400',lg:'#3b3a44'}:{cl:'#ff2e88',cd:'#b8005a',ln:'#c41f6c',mk:'#ff86bd',lg:'#d4247a'};   /* painted / his real colors */
const prShuf=(t,per,off)=>{const u=((t+off)%per)/per;return u<.08?Math.sin(u/.08*Math.PI):0};
const prMaskOff=()=>S=='dodge'&&bi==11&&hz.some(h=>h.t=='pmk'&&bt-h.b>=PMK.warn&&bt-h.b<PMK.warn+pmkF(h));   /* his mask is off while a Mask Boomerang flies */
/* Idle: breathing, nervous jitter bursts, glancing mask, head sway, a foot tap now and then. Hurt: paint chips show yellow / brown. Low HP: flaking
   paint, a big chip on the mask, tiny white pupils, slumped, trembling, a dripping sweat drop. Pure (spared): his real yellow mask and brown cloak, calm. */
function drawPretender(pure,hurt,low,card){const t=performance.now()/1000,RF=SET.reduceFlash,lw=low&&!hurt&&!pure,hu=hurt&&!pure,C=prCol(pure),still=card||RF,off=!card&&prMaskOff();
 /* ACT animations: Call Him Jack (freezes, mask tilts toward you, a tiny nod), Play Along (shoulders drop, calm sway), Scratch the Paint (flinches, shakes hard, a sweat drop flies) */
 const ease=u=>u<0?0:Math.min(1,u/.2)*Math.min(1,(1-u)/.15),uJ=card?-1:actAnU('jack'),uA=card?-1:actAnU('along'),uS=card?-1:actAnU('scratch'),eJ=ease(uJ),eA=ease(uA),eS=ease(uS),
  nod=uJ>=.55&&uJ<.8?Math.sin((uJ-.55)/.25*Math.PI)*4:0;
 const br=still?0:Math.sin(t*(lw?2.6:1.9)),amp=pure||still?0:(lw?1.1:.45)*(off?2.5:1)*(1-eJ)*(1-.8*eA),burst=Math.sin(t*.9)>.6||lw||off?1:.25,
  jx=(Math.sin(t*47)+Math.sin(t*31.7))*.5*amp*burst+(RF?0:Math.sin(t*60)*3*eS+Math.sin(t*3)*2*eA),jy=Math.sin(t*39.3)*.3*amp*burst+3*eA-2*eS,sl=lw?4:0,
  gl=Math.sin(t*.55),look=still||pure||eJ>0?0:Math.abs(gl)>.75?Math.sign(gl)*sm2(Math.min(1,(Math.abs(gl)-.75)/.15))*(lw?2:3):0,
  tilt=still?0:(lw?-4+Math.sin(t*1.3):Math.sin(t*.8)*1.2)*Math.PI/180,per=lw?2.2:3.4,sL=still?0:prShuf(t,per,0),sR=still?0:prShuf(t,per,lw?1.1:1.7);
 g.save();g.translate(0,card?0:PR_DY);g.scale(card?PR_CARD:PR_SC,card?PR_CARD:PR_SC);   /* battle .7 (the user asked for him a bit bigger), cards .6 */g.translate(-80,card?-108:-205);
 [[-sL*2,-sL*5,'M65 160 L75 160 L75 196 L65 196 Z','M61 192 Q61 186 67 186 L76 186 L77 205 L58 205 Q56 199 61 192 Z'],[sR*2,-sR*5,'M85 160 L95 160 L95 196 L85 196 Z','M84 186 L93 186 Q99 186 99 192 Q104 199 102 205 L83 205 Z']].forEach(([dx,dy,lg,bo])=>{g.save();g.translate(dx,dy);dkF(dp(lg),C.lg);dkF(dp(bo),'#2b211c');g.restore()});   /* legs + boots */
 g.save();g.translate(jx,jy+sl+br*.8);g.translate(80,200);g.scale(1,1+br*.012);g.translate(-80,-200);   /* breathing, jitter, low-HP slump */
 g.save();g.translate(80,0);g.scale(.85,1);g.translate(-80,0);g.lineCap='round';g.lineJoin='round';   /* the scout cloak */
 dkF(dp('M80 88 C58 90 44 100 38 114 L24 188 L44 178 L57 187 L80 177 L101 186 L115 177 L140 195 L122 114 C116 100 102 90 80 88 Z'),C.cl);
 dkF(dp('M122 114 L140 195 L131 186 L118 120 Z'),C.ln);dkF(dp('M80 100 L89 178 L84 179 L76 102 Z'),C.ln);dkS(dp('M48 130 L38 182 M62 132 L57 182 M104 132 L111 180'),C.cd,2);
 dkF(dp('M80 78 C54 80 36 92 30 108 L35 136 L44 118 L51 144 L60 120 L68 138 L80 120 L92 138 L100 120 L109 144 L116 118 L125 136 L130 108 C124 92 106 80 80 78 Z'),C.cl);
 dkS(dp('M35 136 L44 118 L51 144 L60 120 L68 138 L80 120 L92 138 L100 120 L109 144 L116 118 L125 136'),C.cd,2);dkS(dp('M46 104 Q62 114 80 110 Q98 114 114 104'),C.cd,3.5);g.restore();
 const BRN='#8a5a35',YEL='#ffd400';
 if(hu)dkF(dp('M56 150 l8 -3 l3 7 l-8 4 Z M100 130 l7 2 l-2 7 l-7 -3 Z'),BRN);
 if(lw)dkF(dp('M48 160 l12 -4 l4 10 l-11 5 Z M94 150 l11 -2 l2 10 l-11 2 Z M64 108 l9 0 l-1 8 l-9 -2 Z M104 112 l7 2 l-3 8 l-6 -3 Z'),BRN);
 if(prKnown&&!pure&&!card){g.lineCap='round';dkS(dp('M58 140 l14 9 M61 135 l14 9 M65 131 l11 7'),BRN,2.5)}   /* Scratch the Paint: the brown scratch stays */
 g.save();g.translate(80,104+nod);g.rotate(tilt);g.translate(-80,-104);   /* hood + mask (Call Him Jack: a tiny nod) */
 dkF(dp('M80 10 C56 12 32 36 29 74 Q31 98 52 106 Q80 114 108 106 Q129 98 131 74 C131 50 123 28 110 14 L118 1 Q98 3 80 10 Z'),C.cl);dkF(dp('M110 14 L118 1 Q106 2 98 6 Z'),C.cd);
 g.lineCap='round';dkS(dp('M40 40 Q34 60 36 86 M122 60 Q126 78 120 96'),C.cd,2);
 g.fillStyle='#0a080a';g.beginPath();g.ellipse(80,66,37,40,0,0,7);g.fill();   /* the shadow where his face would be */
 g.save();g.globalAlpha*=.55;dkF(dp('M45 70 Q46 36 80 27 Q60 38 54 70 Z'),C.cd);g.restore();
 if(hu)dkF(dp('M100 26 l6 -1 l1 6 l-6 1 Z'),BRN);if(lw)dkF(dp('M38 40 l8 -3 l2 7 l-8 2 Z M120 66 l6 1 l-1 7 l-6 -2 Z'),BRN);
 if(!off){g.save();g.translate(look,lw?2:0);if(eJ){g.translate(80,69);g.rotate(-.18*eJ);g.translate(-80,-69)}g.fillStyle=C.mk;g.beginPath();g.arc(80,69,31,0,7);g.fill();
  if(lw){g.save();g.beginPath();g.arc(80,69,31,0,7);g.clip();dkF(dp('M82 36 L114 42 L114 70 L101 66 L97 54 L85 50 Z'),YEL);g.restore();dkF(dp('M57 80 l6 0 l0 6 l-6 -1 Z'),YEL)}
  if(hu)dkF(dp('M98 52 l6 -2 l2 5 l-5 3 Z M62 82 l5 1 l-1 5 l-5 -2 Z'),YEL);
  g.fillStyle='#111';[69,91].forEach(ex=>{g.beginPath();g.ellipse(ex+look*.6,61,4.3,8.3,0,0,7);g.fill()});
  if(lw){g.fillStyle='#fff';[69,91].forEach(ex=>{g.beginPath();g.arc(ex+look*.6,61,1,0,7);g.fill()})}   /* low HP: tiny white pupils */
  dkS(dp('M60 75 Q80 96 100 75'),'#111',3);g.restore()}
 if(uS>=.15&&!RF){const f=(uS-.15)/.85;g.save();g.globalAlpha*=1-f;g.translate(f*40,-f*30+f*f*60);dkF(dp('M126 30 q-5 9 0 12 q5 -3 0 -12 Z'),'#9fd8ff');g.restore()}   /* Scratch the Paint: a sweat drop flies off */
 if(lw&&!RF){const d=(t*.5)%1;g.save();g.globalAlpha*=d>.85?(1-d)/.15:1;g.translate(0,sm2(d)*26);dkF(dp('M126 30 q-5 9 0 12 q5 -3 0 -12 Z'),'#9fd8ff');g.restore()}   /* sweat drop */
 g.lineCap='butt';g.lineJoin='miter';g.restore();g.restore();g.restore()}
/* spared: no glow, no sparkles (he was never corrupted): a nervous shake, the paint fades off to his real colors and the chips fall to the floor */
function prSpare(t,bx,by){const p=Math.min(1,Math.max(0,(t-.5)/1.8)),sh=t<.5?Math.sin(t*90)*3:0;
 if(p<1){g.globalAlpha=1-p;drawBoss(11,bx+sh,by,0,1,0)}g.globalAlpha=p;drawBoss(11,bx+sh,by,0,1,1);g.globalAlpha=1;
 const fy=by+PR_DY;for(let i=0;i<26;i++){const s=t-.4-hr(i*7.3)*1.4;if(s<=0)continue;const x0=bx+(hr(i*3.1)-.5)*70+(hr(i*2.7)-.5)*30*Math.min(1,s),y0=by-25+hr(i*5.7)*95,ly=fy-3+(hr(i*9.1)-.5)*8,y=Math.min(ly,y0+300*s*s),rot=y<ly?s*7*(i%2?1:-1):(i%3-1)*.4;
  g.save();g.translate(x0,y);g.rotate(rot);g.fillStyle=i%3?PINK:'#b8005a';g.fillRect(-3.5,-2.5,7,5);g.restore()}}
/* Mask Boomerang: path from his face, down into one side, across the board, out the other side and back (Catmull-Rom through the points) */
const prMaskPos=()=>[W/2,95+PR_DY+(69-205)*PR_SC];
function prPts(d,row){const[sx,sy]=prMaskPos(),L=W/2-275*d,R=W/2+275*d;return[[sx,sy],[W/2-150*d,150],[L,row-40],[L+25*d,row+15],[W/2,row+25],[R-25*d,row+15],[R,row-40],[W/2+150*d,150],[sx,sy]]}
function prCR(P,u){const n=P.length-1,f=Math.max(0,Math.min(1,u))*n,i=Math.min(n-1,Math.floor(f)),t=f-i,p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(n,i+2)],
 q=k=>.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);return[q(0),q(1)]}
const pmkP=h=>h.P||(h.P=prPts(h.d,h.row));
const pmkE=h=>{const u=Math.max(0,Math.min(1,(bt-h.b-PMK.warn)/pmkF(h)));return u*u*(3-2*u)*.35+u*.65};   /* progress along the path */
function prMask(x,y,rot,r){g.save();g.translate(x,y);g.rotate(rot);g.scale(r/31,r/31);g.fillStyle=pkCol('#ff86bd');g.beginPath();g.arc(0,0,31,0,7);g.fill();
 g.fillStyle='#111';[-11,11].forEach(ex=>{g.beginPath();g.ellipse(ex,-8,4.3,8.3,0,0,7);g.fill()});g.lineCap='round';dkS(dp('M-20 6 Q0 27 20 6'),'#111',3);g.lineCap='butt';g.restore()}
function drawPmk(h){const a=bt-h.b,P=pmkP(h);
 if(a<PMK.warn){g.save();g.globalAlpha*=SET.reduceFlash?.8:.45+.45*Math.abs(Math.sin(a*Math.PI*2));g.strokeStyle=PINK;g.lineWidth=3;g.setLineDash([12,9]);g.beginPath();
  for(let k=0;k<=96;k++){const[x,y]=prCR(P,k/96);k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.setLineDash([]);g.restore()}   /* the path, shown first */
 else if(a<PMK.warn+pmkF(h)){const e=pmkE(h),[x,y]=prCR(P,e);prMask(x,y,e*6*Math.PI*h.d,PMK.r)}}   /* spins 3 turns */
/* Wet Paint */
const prMix=(a,b,u)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*u)).join(',')+')'};
function pdrBlob(x,y,s){g.beginPath();g.moveTo(x,y-12*s);g.quadraticCurveTo(x+9*s,y+2*s,x,y+8*s);g.quadraticCurveTo(x-9*s,y+2*s,x,y-12*s);g.fill()}
function drawPdr(h){const a=bt-h.b;g.save();g.beginPath();g.rect(BX+2,BY+2,BW-4,BH-4);g.clip();g.fillStyle=PINK;
 if(a<PDR.form){const s=Math.max(.2,a/PDR.form);pdrBlob(h.x,BY+4+s*6,s)}   /* a drop swells at the top edge */
 else if(a<PDR.form+pdrF(h)){const u=(a-PDR.form)/pdrF(h),y=BY+10+(h.y-BY-10)*u*u;g.save();g.globalAlpha*=.45;g.fillRect(h.x-2,BY+2,4,y-BY-2);g.restore();pdrBlob(h.x,y,1)}   /* runs down */
 else{const w=a-PDR.form-pdrF(h),sc=Math.min(1,.3+w*3),dry=Math.max(0,Math.min(1,(w-PDR.wet)/PDR.dry)),fade=Math.max(0,Math.min(1,w-PDR.wet-PDR.dry-PDR.gone+1));
  g.globalAlpha*=1-fade;if(dry<1){g.save();g.globalAlpha*=.45*(1-dry);g.fillRect(h.x-2,BY+2,4,h.y-BY-2);g.restore()}
  g.fillStyle=prMix(PINK,'#8a5a35',dry);g.lineJoin='round';g.beginPath();for(let i=0;i<=10;i++){const an=i/10*6.2832,rr=h.r*sc*h.k[i%10],x=h.x+Math.cos(an)*rr,y=h.y+Math.sin(an)*rr*.6;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fill();
  if(dry<1){g.globalAlpha*=.8*(1-dry);g.fillStyle='#ffc2de';g.beginPath();g.ellipse(h.x-h.r*.3*sc,h.y-h.r*.18*sc,h.r*.25*sc,h.r*.08*sc,0,0,7);g.fill()}}   /* wet shine */
 g.restore()}
/* Copycat: the fake soul is its target's shape, painted pink (outlined in the target's color in co-op) */
function drawPcc(h){if(h.x==null)return;const a=bt-h.b,T=players[h.ti];if(!T)return;
 g.save();g.beginPath();g.rect(BX+2,BY+2,BW-4,BH-4);g.clip();
 if(h.mir){g.globalAlpha=.5;g.strokeStyle=PINK;g.lineWidth=2;g.setLineDash([8,8]);g.beginPath();g.moveTo(BX+BW/2,BY+4);g.lineTo(BX+BW/2,BY+BH-4);g.stroke();g.setLineDash([])}   /* mirror line */
 else{const H=h.H[h.ti];if(H&&H.length>1){g.globalAlpha=.25;g.strokeStyle=PINK;g.lineWidth=2;g.beginPath();let st=0;for(const z of H){if(z[0]<bt-pccD(h))continue;st++?g.lineTo(z[1],z[2]):g.moveTo(z[1],z[2])}g.stroke()}}   /* the path it is about to take */
 let al=Math.min(1,Math.max(0,a));if(a%PCC.seg>=PCC.seg-1&&!SET.reduceFlash&&Math.sin(performance.now()/60)>0)al*=.45;   /* flickers the beat before it switches */
 g.globalAlpha=al;g.fillStyle=PINK;shp(h.x,h.y,9,T.i);g.fill();g.strokeStyle=players.length>1?T.col:'#ffc2de';g.lineWidth=2;g.stroke();g.restore()}
/* ---------- SQUARE SOULCERER: art (approved mock-ups v4 body + v5 cracks; design centred on 0,0, body 112 square) and attack pieces ---------- */
const SQ_SC=.8,SQ_DY=8,QCK={cw:60},QCS={warn:1,fly:.5,stay:1.5,ret:.75},QCP={w:70},QCJ={r:7,sp:330};
const SQ_CORNER=[[-41,-41,0],[41,-41,90],[41,41,180],[-41,41,270]],
 SQ_GUARD=['M-56 -26 L-56 -56 L-26 -56 L-26 -46 L-46 -46 L-46 -26 Z','M56 -26 L56 -56 L26 -56 L26 -46 L46 -46 L46 -26 Z','M56 26 L56 56 L26 56 L26 46 L46 46 L46 26 Z','M-56 26 L-56 56 L-26 56 L-26 46 L-46 46 L-46 26 Z'],
 SQ_FIL=['M-51 -32 Q-51 -51 -32 -51','M51 -32 Q51 -51 32 -51','M51 32 Q51 51 32 51','M-51 32 Q-51 51 -32 51'],
 SQ_CR=[[56,-14,30,6,8,20],[-56,34,-34,14,-18,10],[-20,56,-16,40,-30,28]],SQ_CR_LOW=SQ_CR.concat([[-30,-56,-12,-34,8,-10],[56,40,34,48,16,56]]);
const sqHome=c=>[W/2+SQ_CORNER[c][0]*SQ_SC,95+SQ_DY+SQ_CORNER[c][1]*SQ_SC],sqJewel=()=>[W/2,95+SQ_DY-72*SQ_SC];
const sqGuardOff=c=>S=='dodge'&&bi==12&&hz.some(h=>h.t=='qcs'&&h.c==c&&bt-h.b>=QCS.fly&&bt-h.b<QCS.warn+QCS.stay+QCS.ret);   /* that corner is flying */
const sqCapeSwing=()=>{if(S!='dodge'||bi!=12)return 0;for(const h of hz)if(h.t=='qcp'){const x=qcpX(h,bt-h.b);if(x!=null)return(x-W/2)/(W/2)}return 0};
const sqJewelFlare=()=>S=='dodge'&&bi==12&&hz.some(h=>h.t=='qcj'&&bt-h.b>=.6&&bt-h.b<1);
/* Corrupted: white body, silver armor, crimson cape, sparking pink cracks (more + a pink glow + orbiting squares at low HP). Pure: pale blue, gold
   trim, royal blue cape, cyan jewel, a soft glow. Mercy ACTs: the jewel turns gold; Challenge: it flares red. Its face is never shown. */
function drawSquareSoulcerer(pu,pure,hurt,low,happy,angry,card){const now=performance.now(),RF=SET.reduceFlash,t=now/1000;
 const C=pure?{bd:'#bfe3ff',sv:'#e8eef4',ed:'#c9a640',gd:'#e8b84a',cp:'#1f4fa8',cd:'#163a7d',gm:'#19e3ff'}:{bd:hurt?'#ffd0de':'#f2f2f2',sv:'#aab4c0',ed:'#5d6773',gd:'#8a8f99',cp:'#5a0a2c',cd:'#3a0019',gm:'#ff2d75'};
 if(happy)C.gm='#ffe27a';if(angry)C.gm='#ff3a3a';
 g.save();g.translate(0,card?0:SQ_DY);const s=SQ_SC*(1+.03*pu);g.scale(s,s);
 const glow=(col,r)=>{const gl=g.createRadialGradient(0,0,10,0,0,r);gl.addColorStop(0,col);gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(-r,-r,2*r,2*r)};
 if(pure)glow('rgba(191,227,255,.45)',115);else if(low)glow('rgba(255,45,117,.35)',110);
 const sw=card?0:sqCapeSwing()*30,rp=RF||card?0:Math.sin(t*2.2)*3;   /* cape: swings toward a Royal Cape sweep, ripples a little */
 g.fillStyle=C.cp;g.beginPath();g.moveTo(-50,-40);g.lineTo(50,-40);[[64,96],[36,86],[18,98],[0,88],[-18,98],[-36,86],[-64,96]].forEach(([x,y],k)=>g.lineTo(x+sw+(k%2?rp:-rp),y));g.closePath();g.fill();
 g.strokeStyle=C.cd;g.lineWidth=2;g.beginPath();[[-36,86,-30,40],[0,88,0,40],[36,86,30,40]].forEach(([x1,y1,x2,y2])=>{g.moveTo(x1+sw,y1);g.lineTo(x2,y2)});g.stroke();
 g.fillStyle=C.bd;g.beginPath();g.roundRect?g.roundRect(-56,-56,112,112,4):g.rect(-56,-56,112,112);g.fill();
 g.lineCap='round';for(let c=0;c<4;c++){if(!card&&sqGuardOff(c))continue;dkF(dp(SQ_GUARD[c]),C.sv);dkS(dp(SQ_GUARD[c]),C.ed,2);dkS(dp(SQ_FIL[c]),C.gd,1.6)}   /* corner guards (missing while thrown) */
 ['M-70 -62 L-40 -62 L-36 -40 L-66 -34 Z','M70 -62 L40 -62 L36 -40 L66 -34 Z'].forEach(d=>{dkF(dp(d),C.sv);dkS(dp(d),C.ed,2)});   /* shoulder plates */
 g.fillStyle=C.gd;[-62,-46,46,62].forEach(x=>{g.beginPath();g.arc(x,-54,2.4,0,7);g.fill()});
 dkF(dp('M-24 -62 L-24 -76 L-14 -68 L0 -80 L14 -68 L24 -76 L24 -62 Z'),C.gd);dkS(dp('M-24 -62 L-24 -76 L-14 -68 L0 -80 L14 -68 L24 -76 L24 -62 Z'),C.ed,1.5);   /* crown */
 const fl=!card&&!RF&&sqJewelFlare(),js=fl?5:3;if(fl||angry){g.save();g.globalAlpha*=.4;g.fillStyle=C.gm;g.fillRect(-9,-81,18,18);g.restore()}g.fillStyle=C.gm;g.fillRect(-js,-72-js,2*js,2*js);
 g.lineCap='butt';
 if(!pure){sparkCracks(low?SQ_CR_LOW:SQ_CR,low,now);g.globalAlpha=1;
  if(low){g.fillStyle=PINK;for(let k=0;k<6;k++){const a=k*1.05+(RF?0:t*1.6),d=92+(RF?0:8*Math.sin(k*3+t*3.3));g.fillRect(Math.cos(a)*d-3.5,Math.sin(a)*d-3.5,7,7)}}}   /* low HP: orbiting squares */
 g.restore()}
/* Checkerboard: patterns over the 10x4 grid (c = column 0-9, r = row 0-3) */
const SQPAT=[(c,r)=>(c+r)%2==0,(c,r)=>(c+r)%2==1,(c,r)=>(c+r)%2==0,(c,r)=>(c+r)%2==1,(c,r)=>c%2==0,(c,r)=>c%2==1,(c,r)=>r%2==0,(c,r)=>r%2==1,(c,r)=>((c>>1)+(r>>1))%2==0,(c,r)=>((c>>1)+(r>>1))%2==1];
function drawQgrid(h){g.save();g.strokeStyle='#1c1c26';g.lineWidth=1;g.beginPath();for(let c=1;c<10;c++){g.moveTo(BX+c*QCK.cw,BY+2);g.lineTo(BX+c*QCK.cw,BY+BH-2)}for(let r=1;r<4;r++){g.moveTo(BX+2,BY+r*QCK.cw);g.lineTo(BX+BW-2,BY+r*QCK.cw)}g.stroke();g.restore()}
function drawQck(h){const a=bt-h.b,cw=QCK.cw,pat=SQPAT[h.p];g.save();
 if(a<h.w){g.globalAlpha*=SET.reduceFlash?.8:.45+.45*Math.abs(Math.sin(a/h.w*Math.PI*3));g.strokeStyle=PINK;g.lineWidth=2.5;g.setLineDash([8,6]);for(let c=0;c<10;c++)for(let r=0;r<4;r++)if(pat(c,r))g.strokeRect(BX+c*cw+4,BY+r*cw+4,cw-8,cw-8);g.setLineDash([])}
 else{const u=(a-h.w)/h.on;g.globalAlpha*=u<.08?1:.85-.25*u;g.fillStyle=PINK;for(let c=0;c<10;c++)for(let r=0;r<4;r++)if(pat(c,r))g.fillRect(BX+c*cw+3,BY+r*cw+3,cw-6,cw-6)}
 g.restore()}
/* Cornerstones */
const qcsRing=(h,w)=>20+w*(h.big?200:150);   /* shockwave size; trimmed (was 170 / 240) to leave wider gaps */
function qcsGuard(c,x,y,rot,sc){g.save();g.translate(x,y);g.rotate(rot*Math.PI/180);g.scale(sc,sc);g.lineCap='round';dkF(dp('M-15 15 L-15 -15 L15 -15 L15 -5 L-5 -5 L-5 15 Z'),'#aab4c0');dkS(dp('M-15 15 L-15 -15 L15 -15 L15 -5 L-5 -5 L-5 15 Z'),'#5d6773',2);dkS(dp('M-10 6 Q-10 -10 6 -10'),'#8a8f99',1.6);g.lineCap='butt';g.restore()}
function drawQcs(h){const a=bt-h.b,[hx,hy]=sqHome(h.c),r0=SQ_CORNER[h.c][2],e=u=>u*u*(3-2*u);
 if(a<QCS.warn){g.save();g.globalAlpha*=SET.reduceFlash?.8:.45+.45*Math.abs(Math.sin(a*Math.PI*3));g.strokeStyle=PINK;g.lineWidth=3;g.setLineDash([8,6]);g.strokeRect(h.x-28,h.y-28,56,56);g.setLineDash([]);g.restore()}   /* landing marker */
 let x=hx,y=hy,rot=r0;
 if(a>=QCS.fly&&a<QCS.warn){const u=e((a-QCS.fly)/(QCS.warn-QCS.fly));x=hx+(h.x-hx)*u;y=hy+(h.y-hy)*u-Math.sin(u*Math.PI)*40;rot=r0+u*360}
 else if(a>=QCS.warn&&a<QCS.warn+QCS.stay){x=h.x;y=h.y;const w=(a-QCS.warn)/(h.big?.8:1);if(w<1){const s=qcsRing(h,w);g.save();g.globalAlpha*=1-w;g.strokeStyle=PINK;g.lineWidth=9;g.strokeRect(h.x-s/2,h.y-s/2,s,s);g.restore()}}   /* shockwave */
 else if(a>=QCS.warn+QCS.stay){const u=e(Math.min(1,(a-QCS.warn-QCS.stay)/QCS.ret));x=h.x+(hx-h.x)*u;y=h.y+(hy-h.y)*u;rot=r0+360-u*360}
 if(a>=QCS.fly)qcsGuard(h.c,x,y,rot,1.35)}
/* Royal Cape */
const qcpX=(h,a)=>{if(a<1||a>=1+h.sw)return null;const u=(a-1)/h.sw;return h.dir>0?BX-QCP.w+(BW+2*QCP.w)*u:BX+BW+QCP.w-(BW+2*QCP.w)*u};
function drawQcp(h){const a=bt-h.b,cx=qcpX(h,a),RF=SET.reduceFlash;g.save();
 if(a<1){g.globalAlpha*=RF?.8:.45+.45*Math.abs(Math.sin(a*Math.PI*3));g.fillStyle=PINK;const ax=h.dir>0?BX+14:BX+BW-14;g.beginPath();g.moveTo(ax,BY+BH/2-26);g.lineTo(ax+24*h.dir,BY+BH/2);g.lineTo(ax,BY+BH/2+26);g.closePath();g.fill();
  g.strokeStyle=PINK;g.lineWidth=3;g.setLineDash([8,6]);g.strokeRect(h.dir>0?BX+6:BX+BW-46,h.gy,40,h.gap);g.setLineDash([])}   /* the side it comes from + where the gap is */
 else if(cx!=null){g.beginPath();g.rect(BX+2,BY+2,BW-4,BH-4);g.clip();const L=cx-QCP.w/2,R=cx+QCP.w/2,wb=RF?0:Math.sin(performance.now()/110)*4,y0=h.gy,y1=h.gy+h.gap;
  g.translate(wb,0);g.fillStyle=PINK;g.beginPath();g.moveTo(L,BY-10);g.lineTo(R,BY-10);g.lineTo(R,y0);for(let i=6;i>=0;i--)g.lineTo(L+(R-L)*i/6,y0+(i%2?7:-1));g.closePath();
  g.moveTo(L,y1);for(let i=0;i<=6;i++)g.lineTo(L+(R-L)*i/6,y1-(i%2?7:-1));g.lineTo(R,BY+BH+10);g.lineTo(L,BY+BH+10);g.closePath();g.fill();
  g.strokeStyle=pkCol('#b8005a',1);g.lineWidth=3;g.beginPath();for(let q=1;q<4;q++){const fx=L+q*QCP.w/4+(RF?0:Math.sin(performance.now()/110+q)*3);g.moveTo(fx,BY);g.lineTo(fx,y0-6);g.moveTo(fx,y1+6);g.lineTo(fx,BY+BH)}g.stroke()}   /* fabric folds */
 g.restore()}
/* Crown Jewels: straight lines from the crown, bouncing off the board's walls (bn bounces), then the gem shatters */
function sqGemPath(an,bn){const[sx,sy]=sqJewel(),P=[[sx,sy]],r=QCJ.r;let x=sx,y=sy,vx=Math.cos(an),vy=Math.sin(an);const te=(BY+2-y)/vy;x+=vx*te;y+=vy*te;P.push([x,y]);
 for(let b=0;b<=bn;b++){const tx=vx>0?(BX+BW-r-x)/vx:(BX+r-x)/vx,ty=vy>0?(BY+BH-r-y)/vy:(BY+r-y)/vy,tt=Math.min(tx,ty);x+=vx*tt;y+=vy*tt;P.push([x,y]);if(tx<ty)vx=-vx;else vy=-vy}return P}
const sqCum=P=>{const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return L};
function qcjPos(h,a){if(a<1)return null;const d=(a-1)*SPB()*QCJ.sp;for(let i=1;i<h.P.length;i++)if(d<=h.L[i]){const u=(d-h.L[i-1])/(h.L[i]-h.L[i-1]);return[h.P[i-1][0]+(h.P[i][0]-h.P[i-1][0])*u,h.P[i-1][1]+(h.P[i][1]-h.P[i-1][1])*u,d]}return null}
function drawQcj(h){const a=bt-h.b;g.save();
 if(a<1){g.globalAlpha*=SET.reduceFlash?.75:.35+.4*Math.abs(Math.sin(a*Math.PI*3));g.strokeStyle=PINK;g.lineWidth=2.5;g.setLineDash([9,7]);g.beginPath();h.P.slice(0,4).forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.setLineDash([])}   /* path preview */
 else{const q=qcjPos(h,a);if(q&&q[1]>BY){g.translate(q[0],q[1]);g.rotate(q[2]*.026);g.fillStyle=PINK;g.fillRect(-QCJ.r,-QCJ.r,2*QCJ.r,2*QCJ.r);g.strokeStyle='#ffd1e6';g.lineWidth=1.5;g.strokeRect(-QCJ.r,-QCJ.r,2*QCJ.r,2*QCJ.r)}}
 g.restore()}
/* ---------- Star Soulcerer attack pieces ---------- */
let lastSoulAtk=-1,lastRacerAtk=-1,lastTangaAtk=-1,lastSlugAtk=-1,lastNeutAtk=-1,lastPancyAtk=-1,lastDariusAtk=-1,lastTurretAtk=-1,lastPretAtk=-1,lastSqAtk=-1,sqChal=0,sqDuel=0,sqHit=0,prSlow=0,prFast=0,prSpd=1,prKnown=0,trX=null,trLook=null,trQuiet=0,trLoud=0,trQ=0,trDefDrop=0,kiptoSlow=0,dariusMad=0,dkSpd=1,dkMad=0,pancySlow=0,pancyRush=0,pancySpd=1,pancyWarn=1,neutSulk=0,neutDefDrop=0,slugCaught=0,slugLuck=0,saltKill=0,slugMad=0,tangaNoPom=0,tangaAngry=0;
const TANGA_HEAL=6;   /* slugMad: annoyed after Salt, until the turn's attack ends */
/* $lug Thug's special ACTs. Returns the ACT to show (text t / t2, mercy m, kill = Salt finished him off).
   luck: +2 lucky coins in his next Make It Rain. pay: costs 10 BC (story fights; not enough = nothing happens).
   salt: 10 damage, mercy goes DOWN; if it takes his last HP, the fight is won and SR is doubled. */
const SALT_DMG=10,PAY_BC=10;
/* ---------- ACT animations (Square Village): a short animation while an ACT that gave mercy is on screen ----------
   slugAct() starts it (only when the ACT really adds mercy: a failed Pay Up doesn't); the boss's drawing asks actAnU(id) for the progress. */
let actAn={id:'',t0:0};const ACTAN_DUR=2.4;
function actAnStart(id){actAn={id,t0:performance.now()/1000};sfxActAn(id)}
/* progress 0..1 of the animation `id`, or -1 when it isn't playing (it also stops as soon as the text box is closed) */
function actAnU(id){if(actAn.id!=id||S!='msg')return -1;const u=(performance.now()/1000-actAn.t0)/ACTAN_DUR;if(u<0||u>1){if(u>1)actAn.id='';return -1}return u}
function sfxActAn(id){if(!AC)return;const t=T0();
 if(id=='bump'){tone(140,t+.25,.15,'sine',.3,70);noise(t+.25,.06,.2,1500);tone(1568,t+.3,.12,'square',.07);tone(2093,t+.36,.16,'square',.06);return}   /* Fist Bump: thud + sparkle */
 if(id=='chin'){for(let k=0;k<10;k++)tone(70+k%2*8,t+k*.08,.09,'sawtooth',.06);tone(523,t+.9,.25,'sine',.1);return}   /* Scratch Chin: a rumbly purr */
 if(id=='jack'){tone(523,t+.1,.18,'sine',.1);tone(440,t+.35,.35,'sine',.1);return}   /* Call Him Jack: a soft "oh..." */
 if(id=='along'){for(let k=0;k<6;k++)tone(90+k%2*12,t+k*.07,.08,'sawtooth',.07);noise(t+.6,.5,.06,800);return}   /* Play Along: "rrrgh", then a relieved sigh */
 if(id=='scratch'){for(let k=0;k<4;k++)noise(t+k*.06,.05,.18,6000);tone(1200,t+.35,.08,'square',.06,1600);tone(1500,t+.47,.08,'square',.06,2000);return}   /* Scratch the Paint: scratch, then panicked beeps */
 if(id=='polish'){[0,.22,.44].forEach(d=>tone(1300,t+.15+d,.14,'sine',.05,1900));tone(2637,t+1.45,.3,'sine',.08);tone(3520,t+1.53,.25,'sine',.05);return}   /* Polish Speaker: squeak squeak squeak, ding */
 if(id=='quiet'){[880,660,494,370].forEach((f,k)=>tone(f,t+k*.14,.22,'triangle',.12*(1-k*.22)));return}   /* Turn Down: steps down, getting quieter */
 if(id=='crank'){tone(180,t,.7,'sawtooth',.1,1400);noise(t+.2,.6,.1,4000);tone(2400,t+.75,.06,'square',.06);tone(2900,t+.88,.06,'square',.06);return}   /* Crank It Up: rising screech, 2 bolt tinks */
 if(id=='hair'){for(let k=0;k<6;k++)noise(t+k*.05,.04,.12,2600);tone(240,t+.35,.3,'sawtooth',.08,160);noise(t+.7,.35,.08,5000);return}   /* Mess Up Hair: scruffle, growl, steam */
 if(id=='race'){tone(80,t,.55,'sawtooth',.16,300);noise(t+.05,.5,.1,1200);tone(300,t+1.1,.5,'sawtooth',.14,90);tone(988,t+1.75,.1,'triangle',.12);tone(1319,t+1.83,.16,'triangle',.12)}
 else if(id=='pit'){for(let k=0;k<4;k++)noise(t+k*.07,.04,.16,3200);tone(660,t+.38,.1,'triangle',.14);tone(880,t+.46,.2,'triangle',.14)}
 else if(id=='cheer'){[523,659,784,1047].forEach((f,k)=>tone(f,t+k*.07,.16,'triangle',.14));noise(t+.25,.25,.08,6000)}
 else if(id=='water'){[1500,1900,1300,1700].forEach((f,k)=>tone(f,t+k*.12,.09,'sine',.1,f*.6));noise(t,.5,.05,5000)}
 else if(id=='compl'){tone(880,t,.18,'sine',.14);tone(1175,t+.12,.28,'sine',.14);tone(1760,t+.25,.2,'sine',.07)}
 else if(id=='call'){tone(660,t,.1,'triangle',.14);tone(990,t+.1,.16,'triangle',.14);tone(1760,t+.28,.12,'sine',.07)}
 else if(id=='share'){[784,988,1319].forEach((f,k)=>tone(f,t+k*.1,.4,'sine',.1))}
 else if(id=='tug'){noise(t,.12,.18,700);tone(110,t+.05,.2,'sine',.3,45);tone(1500,t+.28,.12,'square',.05,900)}
 else if(id=='applaud'){[0,.12,.24].forEach(d=>noise(t+d,.06,.18,2500));tone(1568,t+.4,.25,'sine',.08)}
 else if(id=='halo'){[1319,1568,2093,2637].forEach((f,k)=>tone(f,t+k*.08,.35,'sine',.07))}
 else if(id=='ruffle'){for(let k=0;k<6;k++)noise(t+k*.05,.04,.12,5000);tone(900,t+.35,.12,'square',.05,1400)}
 else if(id=='pay'){[0,.09,.18].forEach(d=>{tone(2093,t+.15+d,.07,'square',.06);tone(2637,t+.17+d,.1,'sine',.08)})}}
function slugAct(a,d){const o=slugAct0(a,d);if(o.an&&(o.m>0||o.anx)&&!o.kill)actAnStart(o.an);return o}
function slugAct0(a,d){if(!a.fx)return a;const o={...a};
 /* Neutlin's Share the Hood: everyone under the hood recovers SP. Tug Hood: it sulks (next turn's flavor line, hood stays down until the next attack). */
 if(a.fx=='share'||a.fx=='bump'){let any=0;players.forEach(p=>{if(!p.down&&!p.gone&&p.sp!=null){p.sp=Math.min(p.spMax,p.sp+SHARE_SP);any=1}});if(any){if(typeof sfxHeal=='function')sfxHeal();o.t=a.t+'\n* '+(players.length>1?'Everyone recovered ':'You recovered ')+SHARE_SP+' SP.'}}
 else if(a.fx=='tug'){neutSulk=1;neutDefDrop=2;BO.chk=BO.chk.replace(/\d+ DEF/,Math.max(0,7-neutDefDrop)+' DEF')}   /* DEF 7 -> 5 until the fight ends (the CHECK text follows) */
 else if(a.fx=='halo')pancySlow=1;     /* Pancy: her next attack runs slower */
 else if(a.fx=='ruffle')pancyRush=1;   /* Pancy: her next attack gives less warning */
 else if(a.fx=='chin')kiptoSlow=1;     /* Darius & Kipto: Kipto's next attack is slower */
 else if(a.fx=='hair')dariusMad=1;     /* Darius & Kipto: next attack = a bigger Blob Splat (no Kipto sweep) */
 else if(a.fx=='duel')sqChal=1;     /* Square Soulcerer: Challenge (respect if no one is hit next turn) */
 else if(a.fx=='along')prSlow=1;       /* The Pretender: next attack slower */
 else if(a.fx=='scratch'){prFast=1;prKnown=1}   /* next attack faster; his secret is out */
 else if(a.fx=='jack'&&prKnown)o.m=50;  /* found out: Call Him Jack lands harder */
 else if(a.fx=='quiet')trQuiet=1;      /* Tourette Turret: next attack has fewer shots */
 else if(a.fx=='crank'){trLoud=1;trDefDrop=2;BO.chk=BO.chk.replace(/\d+ DEF/,Math.max(0,8-trDefDrop)+' DEF')}   /* more shots next attack; DEF 8 -> 6 until the fight ends */
 /* Racer's Race: lose normally; if THIS Race fills the mercy meter you win; if it was already full it's a tie. d = mercy this ACT adds. */
 if(a.fx=='race'){if(spare>=100)o.t='* You challenge Racer to a race.\n* You both finish in a tie, neither of you win.';
  else if(spare+d>=100)o.t='* You challenge Racer to a race.\n* You win! Racer is stunned... then absolutely thrilled to finally have a real rival.'}
 /* Tanga's Water: the party gets sprinkled and heals 6 HP. Boo: she drops her pom-poms (her next turn can't be
    Pom-Pom Toss, and she's bare-handed), and her next Twirl Tornado gets a 3rd spiral arm. */
 if(a.fx=='water'){players.forEach(p=>{if(!p.down&&!p.gone)p.hp=Math.min(p.max,p.hp+TANGA_HEAL)});if(typeof sfxHeal=='function')sfxHeal();
  o.t=a.t+'\n* '+(players.length>1?'Everyone recovered ':'You recovered ')+TANGA_HEAL+' HP.'}
 else if(a.fx=='boo'){tangaNoPom=1;tangaAngry=1;noise(T0(),.15,.2,900);if(!tangaPomDrop)tangaDropPoms()}
 else if(a.fx=='luck')slugLuck=Math.min(6,slugLuck+2);
 else if(a.fx=='pay'){if(storyFighting()&&!storyPay(PAY_BC)){o.t="* You don't have enough BC to pay $lug Thug.\n* (Pay Up costs "+PAY_BC+' BC.)';o.m=0;o.t2=null}
  else{o.t='* You hand $lug Thug '+PAY_BC+' BC of "protection money."\n* He counts it. Slowly. Then he eases up a lot.';[0,4,7].forEach((m,i)=>tone(mtof(79+m),T0()+i*.05,.1,'square',.08))}}
 else if(a.fx=='salt'){bhp=Math.max(0,bhp-SALT_DMG);bhurt=1;shake=6;flash=.5;noise(T0(),.3,.3,4000);slugMad=1;
  if(bhp<=0){saltKill=1;o.kill=1;o.m=0;o.t='* You sprinkle salt near $lug Thug.\n* It was too much for him...'}
  else o.t='* You sprinkle salt near $lug Thug.\n* He takes '+SALT_DMG+' damage and is FURIOUS!';o.t2=null}
 return o}
/* ---------- Racer (Square Village): a hot-pink race car, two close-set exhaust pipes out the back ----------
   racerArt draws it in its own units (about 180 wide, facing right). o: {pure,hurt,low,len,ang} where len / ang are
   the pipes' length and angle (Shotgun Blast stretches and swivels them). Gas puffs out of the pipes all the time. */
const RACER_SC=.85,RACER_X=-80,RACER_Y=3,RPIPE_A=Math.atan2(-Math.sin(.8),-Math.cos(.8)),RPIPE_L=30;
function racerArt(o){const pure=o.pure,lw=o.low&&!o.hurt&&!pure,hu=o.hurt&&!pure,t=performance.now()/1000,RF=SET.reduceFlash;
const body=pure?'#bfe3ff':'#ff2e88',dark=pure?'#8fbfe6':'#b8005a',chrome=pure?'#eef6ff':'#d9d9e0',glass=pure?'#fff':'#2a0a1a';
const P=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach((p,k)=>g[k?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fill()},
 L=(pts,w,c)=>{g.strokeStyle=c||'#000';g.lineWidth=w||2;g.lineJoin='round';g.beginPath();pts.forEach((p,k)=>g[k?'lineTo':'moveTo'](p[0],p[1]));g.stroke();g.lineJoin='miter'};
/* low HP: the engine is about to blow. The pipes pump in and out, glow red-hot, and spew thick black smoke fast */
const pump=lw&&!RF?Math.sin(t*22)*4:0,len=(o.len||RPIPE_L)+pump,ang=o.ang==null?RPIPE_A:o.ang,dx=Math.cos(ang),dy=Math.sin(ang);
g.save();g.translate(RF?0:(lw?Math.sin(t*37)*1.4:0),RF?0:Math.sin(t*14)*(lw?2.4:.6));
/* gas puffs out of the pipe tips */
const n=lw?14:5,spd=lw?2.6:hu?1.1:1.5,reach=lw?95:70,grow=lw?14:9;
[[RACER_X,-2],[RACER_X,8]].forEach(([bx,by],k)=>{const tx=bx+dx*(len-2),ty=by+dy*(len-2);for(let j=0;j<n;j++){const ph=(t*spd+j/n+k*.37)%1,d=ph*reach,wob=lw?Math.sin(j*2.3+t*9)*ph*10:0;
 g.globalAlpha=(1-ph)*(pure?.55:lw?.85:.7);g.fillStyle=pure?'#fff':lw?(j%3?'#2a2a2a':'#4a4a4a'):o.gray?'#9a9a9a':hu?'#8a6a7a':'#ffb3d1';g.beginPath();g.arc(tx+dx*d-dy*wob,ty+dy*d+dx*wob-ph*6,4+ph*grow,0,7);g.fill()}
 if(lw&&!RF&&Math.sin(t*31+k*2)>.3){g.globalAlpha=.8;g.fillStyle=Math.sin(t*53+k)>0?'#ffb000':'#ff5a1e';g.beginPath();g.arc(tx,ty,4+Math.abs(Math.sin(t*41+k))*4,0,7);g.fill()}});   // sputtering sparks at the tips
g.globalAlpha=1;
/* the two pipes (shotgun barrels); red-hot when low */
[[RACER_X,-2],[RACER_X,8]].forEach(([bx,by])=>{g.save();g.translate(bx,by);g.rotate(ang);g.fillStyle=chrome;g.fillRect(-4,-3.5,len,7);
 if(lw){g.globalAlpha=RF?.5:.35+.35*Math.abs(Math.sin(t*12));g.fillStyle='#ff3a1e';g.fillRect(len*.35,-3.5,len*.65-4,7);g.globalAlpha=1}
 g.fillStyle='#555';g.fillRect(len-6,-4.5,4,9);g.restore()});
P([[-86,-32],[-58,-32],[-58,-26],[-86,-24]],dark);g.fillStyle=dark;g.fillRect(-78,-26,4,20);g.fillRect(-66,-26,4,20);   // spoiler
P([[-86,24],[-88,2],[-74,-6],[-42,-8],[-28,-30],[2,-30],[14,-8],[72,-6],[88,6],[88,24]],body);
g.fillStyle='#fff';g.fillRect(-86,8,174,5);                                                                       // stripe
P([[-36,-10],[-25,-26],[-12,-26],[-12,-10]],glass);P([[-8,-10],[-8,-26],[0,-26],[8,-10]],glass);
g.fillStyle=pure?'#fff8c4':'#ffe27a';g.fillRect(80,-2,7,6);g.fillStyle=dark;for(let k=0;k<3;k++)g.fillRect(30+k*10,-5,6,3);
if(!pure)L([[-30,0],[-20,6],[-10,-2]],2,dark);                                                                     // corruption scratch
if(hu||lw){L([[20,-6],[28,4],[22,10]]);L([[-60,-4],[-52,6]])}
if(hu){L([[28,4],[36,7]]);L([[-52,6],[-56,14]]);L([[62,-5],[66,4],[62,9]]);L([[-8,16],[-2,20],[-6,24]]);L([[-28,-22],[-24,-17],[-19,-19]],1.5,'#fff')}
if(lw){L([[50,-6],[44,4],[54,12],[48,22]],2.5);L([[44,4],[36,8]]);L([[-60,-4],[-52,6],[-58,14],[-50,22]],2.5);L([[-52,6],[-42,10]]);
 L([[-74,-4],[-80,6],[-76,14]]);L([[70,-5],[76,4],[72,10]]);L([[0,-8],[-4,2],[4,10],[0,20]],2.5);L([[-4,2],[-14,4]]);L([[4,10],[14,14]]);
 L([[-30,-24],[-26,-18],[-30,-13]],1.5,'#fff');L([[-26,-18],[-19,-20]],1.5,'#fff');L([[-4,-24],[-2,-17],[4,-14]],1.5,'#fff');L([[-84,-31],[-78,-27],[-82,-25]],1.5);
 g.fillStyle='#000';g.fillRect(60,16,10,4);g.fillRect(-20,18,8,3)}
[-52,56].forEach(wx=>{g.fillStyle='#111';g.beginPath();g.arc(wx,26,17,0,7);g.fill();g.save();g.translate(wx,26);g.rotate(t*(pure?4:lw?6:12)*(o.spin||1));g.fillStyle=chrome;g.beginPath();g.arc(0,0,8,0,7);g.fill();g.fillStyle='#111';for(let k=0;k<3;k++){g.rotate(Math.PI*2/3);g.fillRect(-1.5,0,3,8)}g.restore()});
g.restore()}
/* the boss itself (battle, hub card, win screen). During Shotgun Blast its pipes stretch and aim;
   during Smoke Screen it drives off and a smaller Racer makes passes along the top of the board instead. */
function drawRacer(pu,pure,hurt,low){const o={pure,hurt,low},sh=racerShot(),dv=racerDrive(),ra=actAnU('race'),rp=actAnU('pit');
if(dv){const a=bt-dv.b,c=smokeCar(a);if(!c.main)return;g.translate(c.mx,0)}
if(sh){const p=shotPipe(sh);o.len=p.len;o.ang=p.ang}
/* ACT Race: he peels out to the right, laps around and comes back in from the left, then hops happily. Pit Stop: wheels spin up, sparks, a bounce. */
if(ra>=0){if(ra>=.4&&ra<.55)return;const mx=ra<.4?Math.pow(ra/.4,2)*620:-Math.pow(1-(ra-.55)/.45,2)*620;g.translate(mx,ra>.85?-Math.abs(Math.sin((ra-.85)/.15*Math.PI*2))*5:0);o.spin=5;
 if(ra<.85){g.fillStyle='#bbb';for(let k=0;k<6;k++){g.globalAlpha=.5-k*.07;g.beginPath();g.arc(-80-k*26,18-k*1.5,5+k*2.2,0,7);g.fill()}g.globalAlpha=1}}
if(rp>=0){o.spin=5;g.translate(0,-Math.abs(Math.sin(rp*Math.PI*4))*5*(1-rp))}
g.scale(RACER_SC,RACER_SC);racerArt(o);
if(rp>=0){const t=performance.now()/1000;g.strokeStyle='#ffe27a';g.lineWidth=2;g.globalAlpha=1-rp*.6;for(const wx of[-52,56])for(let k=0;k<5;k++){const a=.25+k*.6+Math.sin(t*20+k+wx)*.15,r1=22+((t*6+k*.37)%1)*14;g.beginPath();g.moveTo(wx+Math.cos(a)*16,26+Math.sin(a)*16);g.lineTo(wx+Math.cos(a)*r1,26+Math.sin(a)*r1);g.stroke()}g.globalAlpha=1}}
const racerShot=()=>S=='dodge'&&bi==4?hz.find(h=>h.t=='shot'&&!h.dead):null,racerDrive=()=>S=='dodge'&&bi==4?hz.find(h=>h.t=='drive'&&!h.dead):null;
/* Shotgun Blast timing (beats from the hazard's start): grow (1st shot only; later ones just keep aiming), aim (follows
   the target), lock (the spot is fixed), two shots one beat apart, then RELOAD: the pipes pump short and long again
   ("chk-chk"). The pipes stay out between shots; after the last reload they slide back to rest. One shot = 8 beats. */
const SHOT={grow:1,aim:3,lock:1,gap:1,pull:.45,hold:.15,push:.6,ret:1,cyc:8,long:70,short:22,burn:2},   /* burn: low HP only, the pipes breathe fire for 2 beats instead of bang-bang, and there is no reload */
shotFire=()=>SHOT.grow+SHOT.aim+SHOT.lock,
 shotReload=()=>shotFire()+SHOT.gap+.4,shotReloaded=()=>shotReload()+SHOT.pull+SHOT.hold+SHOT.push;
let lastShotAng=null;
const racerPivot=()=>[W/2+RACER_X*RACER_SC,95+RACER_Y*RACER_SC];
function shotPipe(h){const a=bt-h.b,R=h.fire?1e9:shotReload(),RE=h.fire?shotFire()+SHOT.burn:shotReloaded(),sm=x=>x*x*(3-2*x),cl=x=>Math.max(0,Math.min(1,x)),
 tgt=h.ang==null?RPIPE_A:h.ang,d=((tgt-RPIPE_A+Math.PI*3)%(Math.PI*2))-Math.PI;
 let len=SHOT.long,e=1;   /* e: 0 = resting pipes, 1 = aimed */
 if(h.first&&a<SHOT.grow){e=sm(cl(a/SHOT.grow));len=RPIPE_L+(SHOT.long-RPIPE_L)*e}
 else if(a>=R&&a<RE){const f=a-R;len=f<SHOT.pull?SHOT.long-(SHOT.long-SHOT.short)*sm(f/SHOT.pull):f<SHOT.pull+SHOT.hold?SHOT.short:SHOT.short+(SHOT.long-SHOT.short)*sm(cl((f-SHOT.pull-SHOT.hold)/SHOT.push))}
 else if(h.last&&a>=RE+.3){e=1-sm(cl((a-RE-.3)/SHOT.ret));len=RPIPE_L+(SHOT.long-RPIPE_L)*e}
 return{len,ang:RPIPE_A+d*e}}
function shotMuzzle(h){const[px,py]=racerPivot(),p=shotPipe(h);return[px+Math.cos(p.ang)*p.len*RACER_SC,py+Math.sin(p.ang)*p.len*RACER_SC]}
/* Smoke Screen: where Racer is, a beats into the attack. main = the big Racer (driving off / coming back, mx = x offset);
   otherwise a small Racer drives along the top edge: 3 passes, turning around at each side. */
const SMOKE={out:1.5,pass:9.8,n:3,sc:.5,y:BY-30};
function smokeCar(a){const back=SMOKE.out+SMOKE.pass*SMOKE.n;
 if(a<SMOKE.out){const e=a/SMOKE.out;return{main:1,mx:e*e*560}}
 if(a>=back){const e=Math.min(1,(a-back)/2);return{main:1,mx:-(1-e)*(1-e)*560}}
 const k=Math.floor((a-SMOKE.out)/SMOKE.pass),f=((a-SMOKE.out)%SMOKE.pass)/SMOKE.pass,dir=k%2?-1:1,x0=BX-80,x1=BX+BW+80;
 return{main:0,x:dir>0?x0+f*(x1-x0):x1-f*(x1-x0),y:SMOKE.y,dir}}
/* a smoke cloud: gray puffs, grows as it drifts, fades out */
function drawPuff(h){const age=(bt-h.b)*(mus?mus.spb:.4),al=Math.min(1,age/.3)*Math.max(0,Math.min(1,(h.life-age)/1)),r=h.r;
 g.globalAlpha=al*.85;g.fillStyle='#9a9a9a';[[0,0,1],[-.55,.15,.7],[.55,.1,.75],[-.2,-.45,.65],[.3,-.4,.6]].forEach(([ox,oy,k])=>{g.beginPath();g.arc(h.x+ox*r,h.y+oy*r,r*k,0,7);g.fill()});
 g.globalAlpha=al*.5;g.fillStyle='#c8c8c8';g.beginPath();g.arc(h.x-r*.2,h.y-r*.25,r*.45,0,7);g.fill();g.globalAlpha=1}
/* a small traffic car for Rally Lanes (dir 1 = driving right) */
function miniCar(x,y,dir){g.save();g.translate(x,y);g.scale(dir*1.25,1.25);
 const P=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach((p,k)=>g[k?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fill()};
 P([[-30,-12],[-20,-12],[-20,-9],[-30,-8]],pkCol('#b8005a',1));P([[-30,8],[-31,0],[-26,-3],[-14,-3],[-9,-11],[2,-11],[6,-3],[26,-2],[31,2],[31,8]],pkCol('#ff2e88'));
 g.fillStyle='#fff';g.fillRect(-30,3,61,2);P([[-12,-4],[-8,-9],[0,-9],[3,-4]],'#2a0a1a');g.fillStyle='#111';[-18,20].forEach(wx=>{g.beginPath();g.arc(wx,9,6,0,7);g.fill()});g.restore()}
const LANES=3,LANE_H=BH/LANES,laneY=k=>BY+k*LANE_H+LANE_H/2,LANE_CAR={hw:39,hh:15};
/* where a Rally Lanes car is (x), or null if it hasn't started / has left */
function laneCarX(h,j){const ts=h.warn+j*h.gap,a=bt-h.b;if(a<ts)return null;const x=(h.dir>0?BX-60:BX+BW+60)+h.dir*h.spd*(a-ts)*(mus?mus.spb:.4);return x<BX-120||x>BX+BW+120?null:x}

/* ---------- Tanga (Square Village): a tree-like cheerleader, no face ----------
   A slim trunk with a leafy crown, a leaf cheer skirt, root feet and two branch arms with bushy pom-pom hands.
   She strikes a new pose every 2 beats (idle sway, cheer V, hip pose, star jump, twirl); her attacks override the pose.
   Pose: {aL, aR} arm angles (0 = straight out, negative = up), tw = twirl (narrows like she's spinning), jump = hop up. */
const TANGA_SC=.78,TANGA_DY=13,TANGA_ARM=50;
const TPOSES={idle:{aL:.35,aR:.35},V:{aL:-.8,aR:-.8},hipL:{aL:1.25,aR:-.85},hipR:{aL:-.85,aR:1.25},jump:{aL:-.35,aR:-.35,jump:1},twirl:{aL:-.3,aR:-.3,tw:1}};
const TPOSE_SEQ=['idle','V','hipL','idle','jump','hipR','twirl','V','idle','hipR','jump','twirl'];
const tangaBeat=()=>mus?bt:performance.now()/375;
/* the pose right now: an attack's own pose, or the beat routine; arms ease into a new pose over a quarter beat */
function tangaPose(){const b=tangaBeat(),ov=S=='dodge'&&bi==5?tangaAtkPose():null;if(ov)return ov;
 const k=Math.floor(b/2),cur=TPOSES[TPOSE_SEQ[((k%12)+12)%12]],prv=TPOSES[TPOSE_SEQ[(((k-1)%12)+12)%12]],e=Math.min(1,(b/2-k)*8);
 const p={aL:prv.aL+(cur.aL-prv.aL)*e,aR:prv.aR+(cur.aR-prv.aR)*e,jump:cur.jump?Math.sin(Math.min(1,(b/2-k)*2)*Math.PI):0};
 if(cur.tw)p.tw=(b/2-k)*2;return p}
/* where a hand is on screen (battle), for the arm angle of that side (side -1 = her left / screen left) */
function tangaHand(side,ang){return[W/2+(side*14+side*Math.cos(ang)*TANGA_ARM)*TANGA_SC,95+TANGA_DY+(-2+Math.sin(ang)*TANGA_ARM)*TANGA_SC]}
function tangaPom(cx,cy,r,rot,o){const leaf=o.pure?'#5fd63a':'#ff2e88',leaf2=o.pure?'#3fae22':'#c4006a',leaf3=o.pure?'#9cf27a':'#ff86bd',b=(x,y,rr,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,rr,0,7);g.fill()};
 g.save();g.translate(cx,cy);g.rotate(rot||0);for(let k=0;k<9;k++){const a=k/9*Math.PI*2;b(Math.cos(a)*r*.55,Math.sin(a)*r*.55,r*.55,k%2?leaf:leaf2)}b(0,0,r*.6,leaf3);
 if(o.low){b(r*.25,r*.15,r*.32,'#6a3a4a');b(-r*.3,-r*.25,r*.22,'#6a3a4a')}g.restore()}
/* o: {pure,hurt,low}; pose; bare: [left, right] hands without their pom-pom (thrown) */
function tangaArt(o,pose,bare){const pure=o.pure,low=o.low&&!pure,hurt=o.hurt&&!pure&&!low,t=performance.now()/1000;
 const leaf=pure?'#5fd63a':'#ff2e88',leaf2=pure?'#3fae22':'#c4006a',leaf3=pure?'#9cf27a':'#ff86bd',bark=pure?'#8a5a3a':'#5a2a3a',bark2=pure?'#6b4228':'#3e1a28';
 const b=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()},crack=(pts)=>{g.strokeStyle='#000';g.lineWidth=2;g.lineJoin='round';g.beginPath();pts.forEach((p,k)=>g[k?'lineTo':'moveTo'](p[0],p[1]));g.stroke();g.lineJoin='miter'};
 g.save();g.translate(0,-(pose.jump||0)*18);if(pose.tw!=null)g.scale(Math.max(.15,Math.abs(Math.cos(pose.tw*Math.PI))),1);
 g.fillStyle=bark;g.beginPath();g.moveTo(-12,-20);g.lineTo(12,-20);g.lineTo(9,22);g.lineTo(-9,22);g.closePath();g.fill();
 g.strokeStyle=bark2;g.lineWidth=2;g.beginPath();g.moveTo(-4,-14);g.lineTo(-2,0);g.lineTo(-5,14);g.moveTo(5,-10);g.lineTo(3,6);g.stroke();
 for(let k=0;k<7;k++){g.fillStyle=k%2?leaf:leaf2;g.beginPath();g.ellipse((k-3)*8.5,30,7,low?9:13,(k-3)*.12,0,7);g.fill()}   // leaf cheer skirt
 g.strokeStyle=bark;g.lineWidth=5;g.lineCap='round';(pose.jump>.3?[[-6,-26,44],[6,26,44]]:[[-6,-14,50],[6,14,50]]).forEach(([a,c,yy])=>{g.beginPath();g.moveTo(a,36);g.quadraticCurveTo(a,46,c,yy);g.stroke()});g.lineCap='butt';
 const cr=low?[[0,-42,18],[-17,-36,13],[16,-37,13],[-6,-56,11]]:[[0,-46,22],[-20,-38,16],[20,-39,16],[-11,-62,15],[12,-62,15],[0,-70,12],[-27,-52,11],[27,-53,11]];
 cr.forEach(([x,y,r],k)=>b(x,y,r,k%2?leaf2:leaf));cr.slice(0,3).forEach(([x,y,r])=>b(x-r*.25,y-r*.3,r*.45,leaf3));
 if(pure)[[-10,-55],[14,-44],[-22,-38],[6,-66],[22,-55]].forEach(([x,y])=>{for(let k=0;k<5;k++){const a=k/5*Math.PI*2;b(x+Math.cos(a)*3,y+Math.sin(a)*3,2.6,'#fff')}b(x,y,1.8,'#ffd23f')});
 [[-1,pose.aL],[1,pose.aR]].forEach(([s,ang])=>{const sx=s*14,sy=-2,L=TANGA_ARM,ex=sx+s*Math.cos(ang)*L,ey=sy+Math.sin(ang)*L;
  g.strokeStyle=bark;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(sx+s*L*.5*Math.cos(ang),sy+Math.sin(ang)*L*.5-6,ex,ey);g.stroke();
  g.lineWidth=3;g.beginPath();g.moveTo(sx+s*L*.45*Math.cos(ang),sy+Math.sin(ang)*L*.45-3);g.lineTo(sx+s*L*.45*Math.cos(ang)+s*8,sy+Math.sin(ang)*L*.45-12);g.stroke();
  if(bare&&bare[s>0?1:0])[-.6,0,.6].forEach(q=>{g.beginPath();g.moveTo(ex,ey);g.lineTo(ex+s*Math.cos(q)*8,ey+Math.sin(q)*8);g.stroke()});
  g.lineCap='butt';if(!(bare&&bare[s>0?1:0]))tangaPom(ex,ey,low?13:17,0,o)});
 if(hurt||low){crack([[-8,-18],[-3,-8],[-7,2]]);crack([[6,4],[2,12],[6,19]])}
 if(low){crack([[8,-18],[4,-10],[9,-2]]);crack([[-3,-8],[4,-4]]);crack([[-9,8],[-4,14],[-8,20]])}
 if(hurt||low){const n=low?6:3;for(let k=0;k<n;k++){const ph=(t*.35+k/n)%1,lx=-34+k*68/n+Math.sin(ph*8+k)*8,ly=-40+ph*95;g.globalAlpha=1-ph;g.fillStyle=k%2?leaf:leaf2;g.save();g.translate(lx,ly);g.rotate(ph*6+k);g.beginPath();g.ellipse(0,0,5,2.5,0,0,7);g.fill();g.restore()}g.globalAlpha=1}
 g.restore()}
/* ACT Cheer: a V with shaking pom-poms, three hops and a burst of leaves. ACT Water: droplets rain down, she shakes them off, then her crown sparkles. */
function tangaActFx(ca,wa,pure){const t=performance.now()/1000,lf=pure?['#5fd63a','#3fae22']:['#ff2e88','#c4006a'];
 if(ca>=0){for(let k=0;k<16;k++){const a=k/16*Math.PI*2+k*.7,d=14+ca*(70+(k%4)*14),x=Math.cos(a)*d,y=-50+Math.sin(a)*d*.8-ca*20+ca*ca*40;g.globalAlpha=Math.max(0,1-ca)*.95;g.fillStyle=k%3==2?'#fff':pure?'#b8ff9c':'#ffb3d9';g.save();g.translate(x,y);g.rotate(a+ca*7);g.beginPath();g.ellipse(0,0,9,4.5,0,0,7);g.fill();g.restore()}g.globalAlpha=1}
 if(wa>=0){for(let k=0;k<22;k++){const x=-58+((k*37)%116),ph=(wa*1.4+((k*13)%10)/10)%1,y=-100+ph*170;g.globalAlpha=.8*Math.min(1,(1-ph)*3);g.fillStyle='#7fd4ff';g.beginPath();g.ellipse(x,y,2.2,4,0,0,7);g.fill()}
  if(wa>.5){for(let k=0;k<6;k++){const x=[-22,-8,10,24,0,-30][k],y=[-62,-72,-66,-56,-82,-48][k],s=3+Math.sin(t*10+k)*1.5;g.globalAlpha=Math.min(1,(wa-.5)*4);g.fillStyle='#fff';g.fillRect(x-s,y-.7,s*2,1.4);g.fillRect(x-.7,y-s,1.4,s*2)}}
  g.globalAlpha=1}}
function drawTangaBoss(pure,hurt,low){let pose=tangaPose();const ca=actAnU('cheer'),wa=actAnU('water'),ta=performance.now()/1000;
 if(ca>=0)pose={aL:-.85+Math.sin(ta*30)*.16,aR:-.85+Math.sin(ta*30+1)*.16,jump:Math.abs(Math.sin(ca*Math.PI*3))};
 else if(wa>=0)pose={aL:-.45+Math.sin(ta*28)*.2,aR:-.45+Math.sin(ta*28+2)*.2,jump:0};
 const pm=S=='dodge'&&bi==5?hz.filter(h=>h.t=='pom'&&!h.dead&&bt-h.b>=h.warn):[];
 const pd=tangaPomDrop&&bi==5&&S!='win'?tangaPomDrop:null,bare=[!!pd||pm.some(h=>h.side<0),!!pd||pm.some(h=>h.side>0)];   /* Boo: bare-handed while her pom-poms are on the floor */
 g.translate(0,TANGA_DY);g.scale(TANGA_SC,TANGA_SC);if(wa>=0)g.translate(Math.sin(ta*34)*1.8*(1-wa),0);tangaArt({pure,hurt,low},pose,bare);tangaActFx(ca,wa,pure);
 if(pd){/* the dropped pom-poms: fall from her hands and bounce, lie on the floor during her turn, then float back up */
  const now=performance.now()/1000,e=now-pd.t0,sm=x=>x*x*(3-2*x);
  [[-1,pose.aL],[1,pose.aR]].forEach(([s,a],k)=>{const hx=s*14+s*Math.cos(a)*TANGA_ARM,hy=-2+Math.sin(a)*TANGA_ARM,fx=s*58,fy=52,st=pd.start[k];let x,y,rot=0;
   if(pd.state=='fall'){const f=Math.min(1,e/.55);x=st[0]+(fx-st[0])*f;y=f<1?st[1]+(fy-st[1])*f*f:fy-(e<.85?Math.sin((e-.55)/.3*Math.PI)*6:0);rot=s*Math.min(1,e/.55)*2.5}
   else if(pd.state=='down'){x=fx;y=fy;rot=s*2.5}
   else{const f=sm(Math.min(1,e/.9));x=fx+(hx-fx)*f;y=fy+(hy-fy)*f-Math.sin(f*Math.PI)*22;rot=s*2.5*(1-f);
    g.globalAlpha=.5*(1-f);for(let q=0;q<3;q++){const a2=now*6+q*2.1+k;g.fillStyle='#fff';g.beginPath();g.arc(x+Math.cos(a2)*20,y+Math.sin(a2)*20,2,0,7);g.fill()}g.globalAlpha=1}   // little sparkles as they float back
   tangaPom(x,y,low&&!pure?13:17,rot,{pure,hurt,low})});
  if(pd.state=='fall'&&e>=.85)pd.state='down';if(pd.state=='return'&&e>=.9)tangaPomDrop=null}}
/* Boo: drop the pom-poms (start = where her hands are right now, in her own units) */
let tangaPomDrop=null;
function tangaDropPoms(){const p=tangaPose(),h=a=>[a[0]*14+a[0]*Math.cos(a[1])*TANGA_ARM,-2+Math.sin(a[1])*TANGA_ARM];tangaPomDrop={state:'fall',t0:performance.now()/1000,start:[h([-1,p.aL]),h([1,p.aR])]};tone(180,T0(),.12,'triangle',.12,90)}
function tangaPomsReturn(){if(tangaPomDrop){tangaPomDrop.state='return';tangaPomDrop.t0=performance.now()/1000;[0,4,7,12].forEach((m,i)=>tone(mtof(76+m),T0()+i*.06,.12,'triangle',.07))}}
/* a falling / flying leaf bullet */
function drawLeaf(x,y,rot,al){g.save();g.globalAlpha=al;g.translate(x,y);g.rotate(rot);g.fillStyle=pkCol('#ff2e88');g.beginPath();g.ellipse(0,0,8,4,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,3.5,1.4,0,0,7);g.fill();g.restore();g.globalAlpha=1}
/* Pom-Pom Toss: the pom-pom flies a loop from the hand H out to the far point F and back (wid = how wide the loop bulges) */
function pomPt(h,u){const H=h.H,F=h.F,mx=(H[0]+F[0])/2,my=(H[1]+F[1])/2,dx=F[0]-H[0],dy=F[1]-H[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,a=L/2,th=Math.PI+u*Math.PI*2;
 return[mx+ux*Math.cos(th)*a-uy*Math.sin(th)*h.wid,my+uy*Math.cos(th)*a+ux*Math.sin(th)*h.wid]}
const POM_THROW=-.85;   // the throwing arm's angle (raised)
/* Root Kick Line: root width / length; rootNow gives a root's length (0-1 of ROOT.len) and sideways wiggle right now */
const ROOT={w:46,len:BH*.62};
function rootNow(h,i){const a=bt-h.b-h.warn;if(a<0||a>=h.up+h.wig+h.down)return null;
 const e=a<h.up?a/h.up:a<h.up+h.wig?1:1-(a-h.up-h.wig)/h.down,s=a*(mus?mus.spb:.4);return{e,sway:a<h.up+h.wig?Math.sin(s*14+i*1.7)*18*Math.min(1,a/h.up):0}}
function rootEnds(h,c,i){const r=rootNow(h,i);if(!r)return null;const base=c.top?BY-4:BY+BH+4,s=c.top?1:-1;return{x1:c.x,y1:base,x2:c.x+r.sway,y2:base+s*ROOT.len*r.e,e:r.e,sway:r.sway}}
function drawRoot(c,R){const s=c.top?1:-1,x=c.x,base=R.y1,tip=R.y2,tx=R.x2,mid=(base+tip)/2,w=ROOT.w,wig=R.sway,len=Math.abs(tip-base);
 g.fillStyle='#5a2a3a';g.beginPath();g.moveTo(x-w/2,base);g.quadraticCurveTo(x-w/2+4+wig*.4,mid,tx-5,tip-s*10);g.lineTo(tx,tip);g.lineTo(tx+5,tip-s*10);g.quadraticCurveTo(x+w/2-4+wig*.4,mid,x+w/2,base);g.closePath();g.fill();
 g.strokeStyle='#3e1a28';g.lineWidth=2;g.beginPath();g.moveTo(x-4,base+s*6);g.lineTo(x-1+wig*.4,mid);g.lineTo(tx-4,tip-s*Math.min(24,len*.3));g.stroke();
 [[.35,-1],[.6,1],[.8,-1]].forEach(([f,sd])=>{g.fillStyle=f>.7?pkCol('#ff2e88'):pkCol('#c4006a',1);g.beginPath();g.ellipse(x+wig*f+sd*(w/2-2-f*8),base+s*len*f,7,3.5,sd*.5,0,7);g.fill()});
 g.fillStyle=pkCol('#ff2e88');g.beginPath();g.ellipse(tx,tip-s*2,6,9,0,0,7);g.fill()}
function drawCrack(x,top,al){const y=top?BY+3:BY+BH-3,s=top?1:-1,now=performance.now()/1000;g.globalAlpha=al*(SET.reduceFlash?.6:.4+.4*Math.abs(Math.sin(now*9)));g.fillStyle=PINK;g.beginPath();g.ellipse(x,y,26,6,0,0,7);g.fill();
 g.globalAlpha=Math.min(1,al+.2);g.strokeStyle=PINK;g.lineWidth=2.5;g.beginPath();g.moveTo(x-16,y);g.lineTo(x-7,y+s*9);g.lineTo(x,y+s*3);g.lineTo(x+8,y+s*12);g.lineTo(x+16,y+s*2);g.moveTo(x-7,y+s*9);g.lineTo(x-9,y+s*16);g.stroke();g.globalAlpha=1}
/* the pose an attack gives Tanga (null = her normal routine) */
function tangaAtkPose(){const a=h=>bt-h.b;
 const rt=hz.find(h=>h.t=='root'&&a(h)>=h.warn&&a(h)<h.warn+h.up+h.wig+h.down);if(rt)return TPOSES.V;
 const to=hz.find(h=>h.t=='tor'&&a(h)>=h.warn&&a(h)<h.warn+h.dur);if(to)return{aL:-.3,aR:-.3,tw:a(to)*1.5};
 const pm=hz.filter(h=>h.t=='pom'&&a(h)<h.warn+h.fly);if(pm.length){const p={aL:.35,aR:.35};pm.forEach(h=>{if(h.side<0)p.aL=POM_THROW;else p.aR=POM_THROW});return p}
 return null}

/* ---------- $lug Thug (Square Village): a slug who's a thug ----------
   Side view, head on the right: sunglasses, two slash face marks, a smirk, a gold hoop earring, a seashell necklace,
   two antennae and a slime trail. Hurt: one lens cracked, mouth a flat line. Low: both lenses cracked, shades crooked,
   droopy antennae, a frown, dripping slime. Pure: lilac, shades pushed up, happy face. Mouth goes "o" when he spits. */
const SLUG_SC=.78,SLUG_DY=10;
function slugArt(o){const pure=o.pure,low=o.low&&!o.hurt&&!pure,hurt=o.hurt&&!pure,t=performance.now()/1000;
 const body=pure?'#d8c4ff':'#ff2e88',belly=pure?'#efe6ff':'#ff86bd',dark=pure?'#a98ee6':'#b8005a';
 const sq=1+Math.sin(t*(low?2:4))*(SET.reduceFlash?.02:.04);
 g.globalAlpha=.35;g.fillStyle=pure?'#e9ddff':'#ff86bd';g.beginPath();g.ellipse(-30,40,90,5,0,0,7);g.fill();g.globalAlpha=1;   // slime trail
 g.save();g.scale(sq,1/sq);g.fillStyle=body;g.beginPath();g.moveTo(-100,38);g.quadraticCurveTo(-112,30,-96,18);g.quadraticCurveTo(-40,6,10,6);g.quadraticCurveTo(28,-40,58,-42);g.quadraticCurveTo(92,-42,94,-6);g.quadraticCurveTo(96,30,78,38);g.closePath();g.fill();
 g.fillStyle=belly;g.beginPath();g.moveTo(-98,38);g.quadraticCurveTo(-10,30,80,36);g.lineTo(80,40);g.quadraticCurveTo(-10,44,-98,40);g.closePath();g.fill();
 g.strokeStyle=dark;g.lineWidth=2;for(let k=0;k<4;k++){g.beginPath();g.arc(-70+k*20,22,8,Math.PI*1.1,Math.PI*1.9);g.stroke()}g.restore();
 [[50,-40,-1],[70,-41,1]].forEach(([ax,ay,s])=>{const tx=ax+s*8+Math.sin(t*(o.wig?18:3)+s)*(o.wig?6:2)+(low?s*6:0),ty=ay-24+(low?14:0);g.strokeStyle=body;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(ax,ay+2);g.quadraticCurveTo(ax+s*2,ay-12,tx,ty);g.stroke();g.lineCap='butt';g.fillStyle=dark;g.beginPath();g.arc(tx,ty,4.5,0,7);g.fill()});
 if(!o.noShades){g.save();g.translate(72,pure?-36:-24);g.rotate(low?.12:0);slugShades(low?2:hurt?1:0);g.restore()}   // sunglasses (left off while they fall, see drawWinBoss)
 if(pure){g.strokeStyle='#345';g.lineWidth=2.5;g.lineCap='round';[[60,-16],[80,-16]].forEach(([ex,ey])=>{g.beginPath();g.arc(ex,ey,4,Math.PI,0);g.stroke()});g.lineCap='butt'}
 g.strokeStyle=dark;g.lineWidth=pure?2:3;g.lineCap='round';if(pure)g.globalAlpha=.6;g.beginPath();g.moveTo(50,-12);g.lineTo(58,-6);g.moveTo(48,-6);g.lineTo(56,0);g.stroke();g.globalAlpha=1;g.lineCap='butt';   // face marks
 g.strokeStyle='#ffd23f';g.lineWidth=2.5;g.beginPath();g.arc(35,-12,6,-.3,Math.PI*2-.6);g.stroke();g.fillStyle='#ffd23f';g.beginPath();g.arc(35,-18,2,0,7);g.fill();   // earring
 g.strokeStyle=pure?'#345':'#000';g.lineWidth=2.5;g.lineCap='round';g.beginPath();   // mouth
 const mad=o.mad&&!pure&&!low;   /* annoyed (after Salt): angry brows over the shades, a clenched zig-zag mouth, an anger mark. At low HP he keeps his low-HP look */
 if(o.spit&&!pure){g.fillStyle='#2a0a1a';g.ellipse(84,-1,5,6,0,0,7);g.fill();g.stroke()}
 else if(mad){g.moveTo(72,0);g.lineTo(76,-3);g.lineTo(80,0);g.lineTo(84,-3);g.lineTo(88,0);g.stroke();
  g.strokeStyle=dark;g.lineWidth=3.5;g.beginPath();g.moveTo(52,-38);g.lineTo(68,-31);g.moveTo(92,-38);g.lineTo(77,-31);g.stroke();
  g.strokeStyle='#ff0a54';g.lineWidth=2.5;g.beginPath();[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([sx,sy])=>{g.moveTo(40+sx*2,-34+sy*2);g.quadraticCurveTo(40+sx*7,-34+sy*2,40+sx*7,-34+sy*7)});g.stroke()}
 else{if(pure||o.smile)g.arc(80,-4,7,.2,Math.PI-.2);else if(low)g.arc(80,6,6,Math.PI+.4,-.4);else if(hurt){g.moveTo(73,-1);g.lineTo(89,-1)}else{g.moveTo(72,-1);g.quadraticCurveTo(80,3,90,-5)}g.stroke()}g.lineCap='butt';
 g.strokeStyle=pure?'#fff':'#f2e3c6';g.lineWidth=2;g.beginPath();g.moveTo(44,4);g.quadraticCurveTo(68,22,93,6);g.stroke();   // seashell necklace
 [[52,11],[84,13]].forEach(([bx,by])=>{g.fillStyle='#f2e3c6';g.beginPath();g.arc(bx,by,2.5,0,7);g.fill()});
 g.save();g.translate(68,19);g.fillStyle='#ffd9b0';g.beginPath();g.moveTo(0,-6);g.quadraticCurveTo(9,-4,8,5);g.quadraticCurveTo(0,10,-8,5);g.quadraticCurveTo(-9,-4,0,-6);g.fill();
 g.strokeStyle='#d99a6c';g.lineWidth=1.3;[-4,0,4].forEach(dx=>{g.beginPath();g.moveTo(0,-5);g.lineTo(dx,7);g.stroke()});g.restore();
 if(low){for(let k=0;k<3;k++){const ph=(t*.6+k/3)%1;g.globalAlpha=1-ph;g.fillStyle=belly;g.beginPath();g.ellipse(-60+k*45,40+ph*14,3,5,0,0,7);g.fill()}g.globalAlpha=1}}
/* his sunglasses, centred on the bridge; cr = cracked lenses (0, 1 or 2) */
function slugShades(cr,rim){const L=()=>{g.beginPath();g.moveTo(-26,-6);g.lineTo(-4,-6);g.lineTo(-6,6);g.quadraticCurveTo(-15,10,-24,5);g.closePath()},R=()=>{g.beginPath();g.moveTo(2,-6);g.lineTo(24,-6);g.lineTo(22,5);g.quadraticCurveTo(13,10,4,6);g.closePath()};
 g.fillStyle='#111';L();g.fill();if(rim){g.strokeStyle='#8a8a8a';g.lineWidth=2;g.stroke()}R();g.fill();if(rim){g.strokeStyle='#8a8a8a';g.lineWidth=2;g.stroke()}   /* rim: light edge so they show on a black background */
 g.strokeStyle='#111';g.lineWidth=2.5;g.beginPath();g.moveTo(-4,-4);g.lineTo(2,-4);g.moveTo(-26,-5);g.lineTo(-38,-3);g.stroke();
 g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-22,-4,6,2);g.fillRect(6,-4,6,2);
 if(cr>=1){g.strokeStyle='#fff';g.lineWidth=1.3;g.beginPath();g.moveTo(8,-6);g.lineTo(12,0);g.lineTo(9,6);g.moveTo(12,0);g.lineTo(18,2);g.stroke()}
 if(cr>=2){g.strokeStyle='#fff';g.lineWidth=1.3;g.beginPath();g.moveTo(-20,-6);g.lineTo(-15,1);g.lineTo(-19,6);g.moveTo(-15,1);g.lineTo(-9,-1);g.stroke()}}
/* while he fades away after being fought, his body turns to dust without the shades; they fall on their own */
/* ACT Compliment: he blushes, grins, wiggles his antennae and sparkles float up. ACT Pay Up: coins fly into his hand, a glint sweeps his shades, smug grin. */
function slugActFx(cu,pu){
 if(cu>=0){const a=Math.min(1,cu*6)*Math.min(1,(1-cu)*4);g.globalAlpha=.65*a;g.fillStyle='#ff6f9e';[[54,-2],[90,-2]].forEach(([x,y])=>{g.beginPath();g.ellipse(x,y,7,4,0,0,7);g.fill()});
  for(let k=0;k<5;k++){const ph=(cu*1.6+k/5)%1,x=30+k*17+Math.sin(ph*6+k)*4,y=-52-ph*38,s=3+(k%2)*1.5;g.globalAlpha=Math.min(1,(1-ph)*2)*.9;g.fillStyle='#fff';g.fillRect(x-s,y-.8,s*2,1.6);g.fillRect(x-.8,y-s,1.6,s*2)}g.globalAlpha=1}
 if(pu>=0){for(let k=0;k<6;k++){const f=Math.max(0,Math.min(1,(pu-k*.09)/.35));if(f<=0||f>=1)continue;const sx=[-70,-20,150,170,-40,120][k],sy=[-90,-110,-80,-30,60,70][k],e=f*f*(3-2*f),x=sx+(68-sx)*e,y=sy+(19-sy)*e-Math.sin(e*Math.PI)*20;g.fillStyle='#ffd23f';g.beginPath();g.arc(x,y,5.5,0,7);g.fill();g.fillStyle='#fff6a0';g.beginPath();g.arc(x-1.5,y-1.5,2,0,7);g.fill()}
  if(pu>.5&&pu<.85){const f=(pu-.5)/.35,gx=40+f*70;g.save();g.beginPath();g.rect(46,-31,52,14);g.clip();g.globalAlpha=.85;g.fillStyle='#fff';g.beginPath();g.moveTo(gx,-32);g.lineTo(gx+8,-32);g.lineTo(gx-2,-14);g.lineTo(gx-10,-14);g.closePath();g.fill();g.restore()}
  g.globalAlpha=1}}
function drawSlugBoss(pure,hurt,low){const cu=actAnU('compl'),pu=actAnU('pay');g.translate(-6,SLUG_DY);g.scale(SLUG_SC,SLUG_SC);slugArt({pure,hurt,low,spit:slugSpitting(),noShades:S=='win'&&!wsp&&slugDrops(),mad:slugMad&&bi==6&&S!='win',smile:cu>=0||pu>=0,wig:cu>=0});slugActFx(cu,pu)}
/* the fallen sunglasses lying on the floor (both lenses cracked, tipped a little): win screen and his empty hub card */
function drawFallenShades(x,y,sc,puddle,noShades){g.save();g.translate(x,y);g.scale(sc*SLUG_SC,sc*SLUG_SC);
 if(puddle!==0){g.globalAlpha=.75*(puddle==null?1:puddle);g.fillStyle='#ff2e88';g.beginPath();g.ellipse(-4,8,46,9,0,0,7);g.fill();g.fillStyle='#ff86bd';g.beginPath();g.ellipse(-18,6,14,3,0,0,7);g.fill();g.globalAlpha=1}   /* a little slime puddle: what's left of him */
 if(!noShades){g.rotate(-.18);slugShades(2,1)}g.restore()}
/* where the shades start (on his face, battle size) and the floor they land on */
/* kills 1 and 2: the shades turn to dust with him. Only the 3rd kill (the foe's kill count is already 3 on the win screen) makes them drop */
const slugDrops=()=>{const f=typeof cur=='function'&&storyFighting()&&cur().foes.slug;return !!f&&f.k>=3};
const SLUG_SHADES0=()=>[W/2-6+72*SLUG_SC,95+SLUG_DY-24*SLUG_SC],SLUG_FLOOR=()=>95+SLUG_DY+36*SLUG_SC;
/* his mouth (where slime balls come out), on screen in battle */
const slugMouth=()=>[W/2+(-6+84*SLUG_SC),95+SLUG_DY+(-1)*SLUG_SC];
/* Slime Puddles timing (beats): shadow warning, flight, puddle stays, dries */
const SPIT={warn:2,fly:1.1,stay:5.5,dry:1.1,r:34};
const slugSpitting=()=>S=='dodge'&&bi==6&&hz.some(h=>h.t=='spit'&&bt-h.b>SPIT.warn-.55&&bt-h.b<SPIT.warn+.2);
/* a slime puddle (wobbly pink blob) */
function drawPuddle(x,y,r,al){const t=performance.now()/1000;g.save();g.globalAlpha=al;g.fillStyle=pkCol('#ff2e88');g.beginPath();for(let k=0;k<=24;k++){const a=k/24*Math.PI*2,rr=r*(1+.12*Math.sin(a*5+t*2));g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.6)}g.closePath();g.fill();
 g.fillStyle=pkCol('#ff86bd');g.beginPath();g.ellipse(x-r*.25,y-r*.15,r*.35,r*.15,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+r*.3,y-r*.1,2.5,0,7);g.fill();g.restore()}
/* Make It Rain money: pink coin / bill (hurt), lucky gold coin (+1 BC) */
function drawCashCoin(x,y,sp){g.save();g.translate(x,y);g.scale(Math.max(.25,Math.abs(Math.cos(sp))),1);g.fillStyle=PINK;g.beginPath();g.arc(0,0,10,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,0,6.5,0,7);g.fill();g.restore();txt('$',x,y+5,12,PINK,'center',0,true)}
function drawBill(x,y,rot){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=PINK;g.fillRect(-15,-8,30,16);g.fillStyle='#fff';g.fillRect(-12,-5,24,10);g.fillStyle=PINK;g.beginPath();g.arc(0,0,4,0,7);g.fill();g.restore()}
function drawGoldCoin(x,y){const t=performance.now()/1000,RF=SET.reduceFlash;g.save();g.translate(x,y);g.globalAlpha=RF?.4:.35+.2*Math.sin(t*10);g.fillStyle='#fff6a0';g.beginPath();g.arc(0,0,17,0,7);g.fill();g.globalAlpha=1;
 g.scale(Math.max(.25,Math.abs(Math.cos(t*4))),1);g.fillStyle='#ffd23f';g.beginPath();g.arc(0,0,11,0,7);g.fill();g.fillStyle='#fff2a8';g.beginPath();g.arc(-2,-2,7,0,7);g.fill();g.restore();txt('$',x,y+5,13,'#c79a00','center',0,true);
 for(let k=0;k<4;k++){const a=t*3+k*1.57,r=16+3*Math.sin(t*7+k),sx=x+Math.cos(a)*r,sy=y+Math.sin(a)*r;g.fillStyle='#fff';g.globalAlpha=RF?.8:.5+.5*Math.abs(Math.sin(t*9+k));g.beginPath();g.moveTo(sx,sy-4);g.lineTo(sx+1.2,sy-1.2);g.lineTo(sx+4,sy);g.lineTo(sx+1.2,sy+1.2);g.lineTo(sx,sy+4);g.lineTo(sx-1.2,sy+1.2);g.lineTo(sx-4,sy);g.lineTo(sx-1.2,sy-1.2);g.closePath();g.fill()}g.globalAlpha=1}
/* where a falling piece of money is (null before it drops / after it leaves the board) */
const CASH={warn:1.5,v:{coin:160,bill:110,gold:95}};
function cashPos(h){const a=bt-h.b-CASH.warn;if(a<0)return null;const s=a*(mus?mus.spb:.4),y=BY-12+s*CASH.v[h.kind];if(y>BY+BH+24)return null;return[h.x+(h.kind=='bill'?Math.sin(s*4+h.ph)*18:0),y,s]}
/* Seashell Shuffle: walls of shells sliding across with gaps */
const SHELL={n:8,warn:1.8,spd:150};
function drawShell(x,y,rot){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=PINK;g.beginPath();g.moveTo(0,10);g.lineTo(-11,-2);g.quadraticCurveTo(-10,-11,0,-11);g.quadraticCurveTo(10,-11,11,-2);g.closePath();g.fill();
 g.strokeStyle='#fff';g.lineWidth=1.6;[-6,-2,2,6].forEach(dx=>{g.beginPath();g.moveTo(0,8);g.lineTo(dx*1.2,-9);g.stroke()});g.fillStyle=PINK;g.fillRect(-4,8,8,4);g.restore()}
function shellX(h){const a=bt-h.b-SHELL.warn;if(a<0)return null;const x=(h.dir>0?BX-16:BX+BW+16)+h.dir*SHELL.spd*a*(mus?mus.spb:.4);return x<BX-40||x>BX+BW+40?null:x}
const SV_X=W/2,SV_Y=91;   /* the Soulcerer's visor, where the beam comes from */
/* constellation shapes: points in a unit box, and which points connect */
const CONS_SHAPES=[
{p:[0,2,4,6,8].map(i=>[.5+.5*Math.cos(-Math.PI/2+i*Math.PI/5),.5+.5*Math.sin(-Math.PI/2+i*Math.PI/5)]),e:[[0,2],[2,4],[4,1],[1,3],[3,0]]},   /* star */
{p:[[0,.2],[.25,.85],[.5,.35],[.75,.85],[1,.15]],e:[[0,1],[1,2],[2,3],[3,4]]},                                                     /* W (Cassiopeia) */
{p:[[0,.1],[.22,.25],[.42,.3],[.6,.45],[.62,.85],[1,.9],[1,.5]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]]},                   /* ladle (Big Dipper) */
{p:[[.5,0],[.5,.45],[.5,1],[0,.4],[1,.4]],e:[[0,1],[1,2],[3,1],[1,4]]}];                                                          /* cross */
/* where a ray from the visor leaves the board, and that edge's inward normal (floor: up, walls: inward) */
function beamEnd(a){const dx=Math.cos(a),dy=Math.sin(a);let t=(BY+BH-SV_Y)/dy,nx=0,ny=-1;if(SV_X+dx*t<BX){t=(BX-SV_X)/dx;nx=1;ny=0}if(SV_X+dx*t>BX+BW){t=(BX+BW-SV_X)/dx;nx=-1;ny=0}return[SV_X+dx*t,SV_Y+dy*t,nx,ny]}
function starShape(x,y,R,rot){g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+rot+k*Math.PI/5,rr=k%2?R*.45:R;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath()}
/* sword pivot / reach / sweep for each side; the blade never reaches the far side, so there is always a safe area */
function swordSetup(h){const side=['left','top','right','bottom'][Math.floor(Math.random()*4)],cw=Math.random()<.5?1:-1,
P={left:[BX-40,BY+BH/2,0,370],right:[BX+BW+40,BY+BH/2,Math.PI,370],top:[BX+BW/2,BY-40,Math.PI/2,210],bottom:[BX+BW/2,BY+BH+40,-Math.PI/2,210]}[side],span=side=='left'||side=='right'?1.15:2.4;
Object.assign(h,{side,cw,px:P[0],py:P[1],len:P[3],a0:P[2]-cw*span/2,a1:P[2]+cw*span/2})}
const swEase=v=>v<.5?2*v*v:1-Math.pow(-2*v+2,2)/2;
function swordAng(h,age){return age<h.warn?h.a0:h.a0+(h.a1-h.a0)*swEase(Math.min(1,(age-h.warn)/h.swing))}
function drawSword(h,a,al,ghost){g.save();g.translate(h.px,h.py);g.rotate(a);g.globalAlpha=al;const L=h.len,h0=40;
if(ghost){g.setLineDash([8,6]);g.strokeStyle=PINK;g.lineWidth=2;g.beginPath();g.moveTo(h0,-11);g.lineTo(L-30,-11);g.lineTo(L,0);g.lineTo(L-30,11);g.lineTo(h0,11);g.closePath();g.stroke();g.setLineDash([])}
else{g.fillStyle=PINK;g.beginPath();g.moveTo(h0,-12);g.lineTo(L-32,-12);g.lineTo(L,0);g.lineTo(L-32,12);g.lineTo(h0,12);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(h0,-4);g.lineTo(L-34,-4);g.lineTo(L-12,0);g.lineTo(L-34,4);g.lineTo(h0,4);g.closePath();g.fill();
/* handle in the Soulcerer's colors: white guard and pommel, silver outlines, steel grip with silver wraps */
g.fillStyle='#5d6773';g.fillRect(0,-6,h0-8,12);g.fillStyle='#aab4c0';for(let w=6;w<h0-10;w+=8)g.fillRect(w,-6,3,12);g.fillStyle='#f2f2f2';g.fillRect(h0-8,-26,10,52);g.strokeStyle='#aab4c0';g.lineWidth=2;g.strokeRect(h0-8,-26,10,52);g.fillStyle='#f2f2f2';g.beginPath();g.arc(0,0,8,0,7);g.fill();g.stroke()}
g.restore();g.globalAlpha=1}
/* distance from a point to a line segment {x1,y1,x2,y2} */
function segDist(px,py,h){const dx=h.x2-h.x1,dy=h.y2-h.y1,l=dx*dx+dy*dy,u=l?Math.max(0,Math.min(1,((px-h.x1)*dx+(py-h.y1)*dy)/l)):0;return Math.hypot(px-h.x1-u*dx,py-h.y1-u*dy)}
/* sparking corruption cracks: each crack flickers, a spark runs along it and pops at the tip,
   and little streaks jump off the end. Low HP: faster. Reduce flashing: steady glow, sparks still travel. */
function sparkCracks(cr,low,now){const RF=SET.reduceFlash,T=now/1000,sp=low?1.6:1;
cr.forEach((c,ci)=>{const P=[[c[0],c[1]],[c[2],c[3]],[c[4],c[5]]];
const fl=RF?.85:.55+.45*Math.abs(Math.sin(T*(7+ci*1.7)+ci*2.1))*(Math.sin(T*23+ci)>-.6?1:.4);
g.globalAlpha=fl;g.strokeStyle=PINK;g.lineWidth=low?3.5:3;g.lineJoin='round';g.lineCap='round';g.beginPath();g.moveTo(P[0][0],P[0][1]);g.lineTo(P[1][0],P[1][1]);g.lineTo(P[2][0],P[2][1]);g.stroke();
g.globalAlpha=fl*.5;g.strokeStyle='#ffd0e0';g.lineWidth=1;g.stroke();g.globalAlpha=1;
const L1=Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1]),L2=Math.hypot(P[2][0]-P[1][0],P[2][1]-P[1][1]),at=u=>{const d=u*(L1+L2);if(d<=L1){const k=d/L1;return[P[0][0]+(P[1][0]-P[0][0])*k,P[0][1]+(P[1][1]-P[0][1])*k]}const k=(d-L1)/L2;return[P[1][0]+(P[2][0]-P[1][0])*k,P[1][1]+(P[2][1]-P[1][1])*k]};
const u=(T*.9*sp+ci*.37)%1;
if(u<.9){const[x,y]=at(u);g.fillStyle='rgba(255,45,117,.45)';g.beginPath();g.arc(x,y,5,0,7);g.fill();g.fillStyle='#fff';g.fillRect(x-1.5,y-1.5,3,3)}
else{const q=(u-.9)/.1,[x,y]=P[2];g.fillStyle='#fff';for(let k=0;k<4;k++){const a=k*1.57+ci,d=3+q*9;g.globalAlpha=1-q;g.fillRect(x+Math.cos(a)*d-1.5,y+Math.sin(a)*d-1.5,3,3)}g.globalAlpha=1}
const jr=low?2.3:1.4,jt=(T*jr+ci*.61)%1;if(jt<.18){const[x,y]=P[2],a=ci*2+Math.floor(T*jr+ci*.61)*1.9,d=4+jt*40;g.strokeStyle='#ffb3cf';g.lineWidth=1.5;g.globalAlpha=1-jt/.18;g.beginPath();g.moveTo(x+Math.cos(a)*d*.4,y+Math.sin(a)*d*.4);g.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);g.stroke();g.globalAlpha=1}});
g.lineCap='butt';g.lineJoin='miter'}
/* Star Soulcerer (story boss): white armored star with a dark visor; pink corruption cracks (more at low HP); gold when pure. Its face is never shown. */
function drawStarSoulcerer(pu,pure,hurt,low,happy,angry){const R=58+6*pu,pts=[],now=performance.now(),RF=SET.reduceFlash;
for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?25:R;pts.push([Math.cos(a)*rr,Math.sin(a)*rr])}
const glow=(col,r)=>{const gl=g.createRadialGradient(0,0,10,0,0,r);gl.addColorStop(0,col);gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(-r,-r,2*r,2*r)};
if(pure)glow('rgba(255,226,122,.45)',95);else if(low)glow('rgba(255,45,117,.35)',90);
g.fillStyle=pure?'#ffe27a':hurt?'#ffd0de':'#f2f2f2';g.beginPath();pts.forEach((p,k)=>g[k?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fill();
const silver=pure?'#e8eef4':'#aab4c0',edge=pure?'#c9a640':'#5d6773';
[-1,1].forEach(s=>{g.save();g.rotate(s*Math.PI*2/5);g.fillStyle=silver;g.beginPath();g.moveTo(-13,-24);g.lineTo(13,-24);g.lineTo(9,-40);g.lineTo(-9,-40);g.closePath();g.fill();g.strokeStyle=edge;g.lineWidth=2;g.stroke();g.restore()});
g.fillStyle=silver;g.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;g[k?'lineTo':'moveTo'](Math.cos(a)*27,Math.sin(a)*27+4)}g.closePath();g.fill();g.strokeStyle=edge;g.lineWidth=2.5;g.stroke();
const vy=pure?-12:-4;g.save();if(pure){g.translate(0,vy);g.rotate(-.12);g.translate(0,-vy)}
g.fillStyle='#14161c';g.fillRect(-17,vy-6,34,13);
if(happy){/* mercy ACT: the visor's slit turns into two happy ^ ^ eyes */g.strokeStyle='#ffe9a8';g.lineWidth=2.5;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(-12,vy+3);g.lineTo(-8,vy-3);g.lineTo(-4,vy+3);g.moveTo(4,vy+3);g.lineTo(8,vy-3);g.lineTo(12,vy+3);g.stroke();g.lineCap='butt';g.lineJoin='miter'}
else if(angry){/* Mock: the visor glows red and the slit slants into angry brows */g.fillStyle='rgba(255,40,40,.4)';g.fillRect(-17,vy-6,34,13);g.strokeStyle='#ff3a3a';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-13,vy-3);g.lineTo(-3,vy+2);g.moveTo(13,vy-3);g.lineTo(3,vy+2);g.stroke();g.lineCap='butt'}
 else{g.fillStyle=pure?'#ffe27a':hurt?'#fff':low?PINK:'#ff7eb3';g.fillRect(-13,vy-1,26,3)}g.restore();
if(pure){g.fillStyle='rgba(255,250,220,.9)';g.fillRect(-12,-3,24,4);return}
const cr=low?[[0,-6,-22,-40,-12,-50],[6,6,30,14,48,8],[-8,10,-20,34,-34,40],[10,12,16,36,24,48],[-6,-10,10,-34,4,-52]]:[[6,6,30,14,48,8],[-8,10,-20,34,-34,40]];
sparkCracks(cr,low,now);
if(low){g.fillStyle=PINK;for(let k=0;k<6;k++){const a=k*1.1+(RF?0:now/600),d=60+(RF?0:8*Math.sin(k*3+now/300));g.fillRect(Math.cos(a)*d-3,Math.sin(a)*d-3,6,6)}}}
addTR({"IT'S OVER":["SE ACABÓ","C'EST FINI","もう終わりだ","結束了","结束了","È FINITA","ES IST VORBEI","ВСЁ КОНЧЕНО","BİTTİ"],"Stay determined...":["Mantente decidido...","Reste déterminé...","あきらめるな...","保持決心……","坚定你的决心……","Resta determinato...","Bleib entschlossen...","Не сдавайся...","Kararlı kal..."],"RETRY":["REINTENTAR","RÉESSAYER","リトライ","重試","重试","RIPROVA","NOCHMAL","ЗАНОВО","TEKRAR DENE"],"BOSS SELECT":["ELEGIR JEFE","CHOIX DU BOSS","ボス選択","選擇首領","选择首领","SCELTA BOSS","BOSS-AUSWAHL","ВЫБОР БОССА","BOSS SEÇİMİ"]});
function loseInit(k){const q=players[k];loseK=q&&!q.gone?k:Math.max(0,players.findIndex(p=>!p.gone));loseT0=performance.now();loseI=0;loseGo=0}
function sfxNoSp(){if(AC)tone(170,T0(),.1,'square',.1,110)}   /* dash tried with 0 SP */
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
g.globalAlpha=cl(t,3.8,4.2)*uf;(storyOnlyVillage()?[['VILLAGE',W/2-95]]:[['RETRY',W/2-215],[storyFighting()?'VILLAGE':'BOSS SELECT',W/2+25]]).forEach((b,i)=>{const on=storyOnlyVillage()||loseI==i,c=on?'#ff0':'#ff9d00';g.strokeStyle=c;g.lineWidth=3;g.strokeRect(b[1],410,190,46);txt(b[0],b[1]+95,441,22,c,'center',170);if(on)txt('P1',b[1]-8,441,18,PCOL[0],'right')});
g.globalAlpha=1;g.restore();
if(ex>=0){while(exSn<7&&ex>=.15+exSn*.1){if(ex-(.15+exSn*.1)<.3){const f=mtof(84-exSn*2);tone(f,T0(),.25,'sine',.08,f/2)}exSn++}if(ex>=1.8&&net.role!='guest'){if(!storyReturn())S='boss';fiT=performance.now()}}if(loseGo&&tr>=3.5){if(net.role=='guest'){if(S!='lose')loseGo=0}else{if(S=='lose')startBattle();loseGo=0}}}
function shp(x,y,s,k){g.beginPath();if(k==1){g.moveTo(x,y-s-1);g.lineTo(x+s+1,y+s);g.lineTo(x-s-1,y+s)}else if(k==2){for(let j=0;j<5;j++){const a=-Math.PI/2+j*Math.PI*.4,r=s*1.2;j?g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}}else if(k==3){g.arc(x,y,s*1.1,0,7)}else g.rect(x-s,y-s,s*2,s*2);g.closePath()}
/* story battle ITEM menu: up to 8 items in 2 columns of 4 (left column first); subXY(i) = where line i is drawn */
const subGrid=()=>mi==2&&storyFighting(),subXY=i=>[BX+70+(i>>2)*260,BY+60+(i&3)*42];
/* grid moves: up / down stay in the column, left / right jump to the same row of the other column */
function subGridMove(dc,dr){const c=subI>>2,r=subI&3,n=c2=>Math.min(4,sub.length-c2*4);if(dr){const k=n(c);subI=c*4+(r+dr+k)%k}else{const c2=1-c;if(n(c2)<=0)return 0;subI=c2*4+Math.min(r,n(c2)-1)}return 1}
function soul(x,y,col,tri,out){if(out){g.fillStyle='#fff';shp(x,y,10,tri);g.fill()}g.fillStyle=col;shp(x,y,8,tri);g.fill()}
/* Shattered Shades (story armor): the wearer sees the fight through cracked, blurry lenses. drawLens() blurs the world
   and the HUD too, on purpose: it's a handicap) and lays fixed cracks over it. draw() calls it last. Cracks flash when a player is hit. */
const LENS_CR=[[[0,70],[90,110],[150,100],[260,160],[300,150]],[[90,110],[110,200],[80,280]],[[150,100],[210,40],[240,0]],
 [[800,500],[700,470],[640,520],[540,480],[480,520]],[[700,470],[690,380],[740,300]],[[640,520],[620,600]],[[540,480],[500,430]]];
let lensC=null,lensG=null,lensS=null;
const lensOn=()=>{try{if(typeof ST=='undefined'||!ST.fight||typeof cur!='function')return false;const s=cur(),pl=s.players[net.role?net.me:0]||s.players[0];return !!pl&&pl.armor=='sshades'}catch(e){return false}};
function drawLens(){
 if(!lensOn())return;   /* every phase of the fight: intro, win, flee and game over too, not just while the song plays */
 if(!lensC){lensC=document.createElement('canvas');lensC.width=W;lensC.height=H;lensG=lensC.getContext('2d')}
 const RF=SET.reduceFlash,now=performance.now(),b=RF?1.8:1.6+Math.sin(now/1000*1.3)*.7,hit=!RF&&players.some(p=>now-(p.hit||0)<250);
 g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;
 lensG.clearRect(0,0,W,H);lensG.drawImage(g.canvas,0,0,W,H);
 if('filter' in g){g.filter='blur('+b.toFixed(2)+'px)';g.drawImage(lensC,0,0,W,H);g.filter='none'}
 else{if(!lensS){lensS=document.createElement('canvas');lensS.width=W/3|0;lensS.height=H/3|0}const q=lensS.getContext('2d');q.drawImage(lensC,0,0,lensS.width,lensS.height);g.imageSmoothingEnabled=true;g.drawImage(lensS,0,0,W,H)}   /* no ctx.filter (Safari): cheap down/up-scale blur */
 g.globalAlpha=.07;g.drawImage(lensC,3,1,W,H);g.drawImage(lensC,-3,-1,W,H);g.globalAlpha=1;   /* faint double image */
 g.lineCap='round';g.lineJoin='round';
 for(const [lw,col,a] of [[hit?5:3,'#000',.35],[hit?2.2:1.2,hit?'#fff':'#e8f4ff',hit?1:.8]]){g.lineWidth=lw;g.strokeStyle=col;g.globalAlpha=a;
  for(const p of LENS_CR){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke()}}
 g.restore()}
/* story fights: a player's SP bar (yellow) under their HP bar; the label flashes red when a dash is tried at 0 SP */
function spBar(p,x,y,w,h,lx,nx,fs){const f=performance.now()-(p.spF||0)<350,c=f&&Math.floor(performance.now()/60)%2||p.sp<=0?'#f55':'#ff0';g.fillStyle='#553';g.fillRect(x,y,w,h);g.fillStyle=performance.now()-(p.spH||0)<450&&Math.floor(performance.now()/70)%2?'#fff':'#ff0';g.fillRect(x,y,w*p.sp/p.spMax,h);/* flashes white when Darius drains it */txt('SP',lx,y+h,fs,c);txt(p.sp+(w>80?' / ':'/')+p.spMax,nx,y+h,fs,c)}
/* story: an enemy carrying a Skill Trinket glows with that trinket's color (battle only, never on the hub cards) */
function drawAura(x,y,col){const t=performance.now()/1000,RF=SET.reduceFlash,p=RF?1:.88+.12*Math.sin(t*3.2);g.save();
const gr=g.createRadialGradient(x,y,14,x,y,112*p);gr.addColorStop(0,col+'aa');gr.addColorStop(.55,col+'44');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.beginPath();g.arc(x,y,115,0,6.29);g.fill();
g.fillStyle=col;for(let i=0;i<10;i++){const a=t*.9+i*.628,r=66+8*Math.sin(t*2+i*1.7);g.globalAlpha=.55+.35*Math.sin(t*3+i);g.beginPath();g.arc(x+Math.cos(a)*r,y+Math.sin(a)*r*.92,2.6,0,6.29);g.fill()}g.restore()}
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
if(storyFighting()&&ST.fight&&ST.fight.tr&&S!='win'&&S!='lose'&&S!='intro')drawAura(W/2,95,ITEMS[ST.fight.tr].col);
if(flash>0){if(RF)g.globalAlpha=1-.35*Math.min(1,flash*2);else if(Math.floor(flash*20)%2==0)g.globalAlpha=.4}if(S=='win')drawWinBoss();else{const hy=net.role=='guest'?bhap:S=='msg'&&hapT.includes(TXT),ha=1-bhurt,bsx=SET.shake&&bhurt>0&&ha<.45?Math.sin(ha*60)*7*(1-ha/.45):0;drawBoss(bi,W/2+bsx,95,RF?pu*.3:pu,1,0,bhurt>0,lowHp()||bhp<=0,hy,S=='msg'&&angT.includes(TXT))}g.globalAlpha=1;
g.strokeStyle=!RF&&dodge&&pu>.7?'#9ff':'#fff';g.lineWidth=4+(RF?.8:3)*pu;g.strokeRect(BX,BY,BW,BH);
if(S=='msg'||S=='menu'){const FT=wrapTxt(lx(TXT));msgLines(FT.slice(0,Math.floor(Math.min(1,tc/Math.max(1,TXT.length))*FT.length)),FT,BX+24,BY+50,22)}
if(S=='msg'&&msgWho>=0&&players[msgWho])txt('P'+(msgWho+1),BX+BW-16,BY+26,18,players[msgWho].col,'right');
if(S=='msg'&&tc>=TXT.length&&Math.floor(Date.now()/400)%2)txt('Enter / Z / Space / A',BX+BW-16,BY+BH-14,14,'#888','right');
if(S=='win'){const FW=lx(winTxt);lines(FW.slice(0,Math.floor(Math.min(1,tc/Math.max(1,winTxt.length))*FW.length)),BX+24,BY+50,22)}
{const grid=subGrid(),fs=24;
if(S=='sub')sub.forEach((s,i)=>{const[sx,sy]=grid?subXY(i):[BX+70,BY+60+i*36];txt('* '+s,sx,sy,fs,mi==3&&i==0&&(spare>=100||lowHp())?'#ff0':'#fff');if(mi==2&&storyFighting()){const c=storyItemCol(i);if(c){/* gear with a Skill Trinket: a square in the trinket's color after the name */g.font='bold '+fs+'px monospace';g.fillStyle=g.shadowColor=c;g.shadowBlur=9;g.fillRect(sx+Math.min(grid?240:BW-90,g.measureText('* '+s).width)+10,sy-fs*.6,fs*.6,fs*.6);g.shadowBlur=0;g.shadowColor='transparent'/* slight glow */}}if(i==subI)mSoul(sx-30,sy-8)});if(S=='sub'&&grid){const d=storyItemInfo(subI);if(d)txt(d,BX+24,BY+BH-16,15,'#aaa','left',0,true)/* the highlighted item's info, bottom left */}}
if(S=='tgt'){txt('* '+BO.n,BX+70,BY+60,24,(spare>=100||lowHp())?'#ff0':'#fff');mSoul(BX+40,BY+52)}
if(S=='ptg')players.forEach((p,i)=>{const y=BY+60+i*36;txt('* P'+(i+1)+'   '+(p.gone?'LEFT':p.down?'DOWN':p.hp+' / '+p.max+' HP'),BX+70,y,24,p.gone?'#555':p.col);if(i==ptI)mSoul(BX+40,y-8)});
if(S=='atk'&&players.length>1)drawBars();else if(S=='atk'&&atk.bull){drawBull([atk.bull]);txt('Shoot when the crosshair is over the center!',BX+BW/2,BY+34,18,'#fff','center')}else if(S=='atk'){g.fillStyle='#222';g.fillRect(BX+40,BY+BH/2-26,520,52);g.strokeStyle='#fff';g.lineWidth=3;g.strokeRect(BX+40,BY+BH/2-26,520,52);g.fillStyle=PINK;g.fillRect(BX+294,BY+BH/2-26,12,52);g.fillStyle='#fff';if(atk.ls)atk.ls.forEach(l=>{if(l.x<0)return;g.globalAlpha=l.done?.55:1;g.fillRect(BX+40+l.x-4,BY+BH/2-34,8,68)});else g.fillRect(BX+40+atk.x-4,BY+BH/2-34,8,68);g.globalAlpha=1;txt('Press confirm near the center!',BX+BW/2,BY+40,18,'#fff','center')}
const PKS=PINK;PKA=dodge&&storyFighting()&&ST.fight&&ST.fight.tr=='poison'?1:0;if(PKA)PINK=PKC;/* poison enemy: purple attacks */try{if(dodge)for(const h of hz){if(h.t=='rect'){const age=bt-h.b;if(age<h.warn){g.globalAlpha=warnA(age,h);g.fillStyle=PINK;g.fillRect(h.x,h.y,h.w,h.h);g.globalAlpha=1;g.strokeStyle=PINK;g.lineWidth=2;g.strokeRect(h.x,h.y,h.w,h.h)}else{g.fillStyle=PINK;g.fillRect(h.x,h.y,h.w,h.h);g.fillStyle='#fff';g.fillRect(h.x+8,h.y+8,h.w-16,h.h-16)}}
else if(h.t=='sq'){const age=bt-h.b,d=h.s*.7071,PC=PINK,dia=(q)=>{g.beginPath();g.moveTo(h.x,h.y-q);g.lineTo(h.x+q,h.y);g.lineTo(h.x,h.y+q);g.lineTo(h.x-q,h.y);g.closePath()};
if(age<h.warn){g.globalAlpha=.12+.25*Math.abs(Math.sin(age*Math.PI*2));dia(d);g.fillStyle=PC;g.fill();g.globalAlpha=1;g.strokeStyle=PC;g.lineWidth=2;dia(d);g.stroke()}
else{g.globalAlpha=Math.max(0,Math.min(1,(h.warn+h.dur-age)/.1));dia(d);g.fillStyle=PC;g.fill();dia(d-11);g.fillStyle='#fff';g.fill();g.globalAlpha=1}}
else if(h.t=='hs')drawHS(h);
else if(h.t=='jaw')drawJaw(h);
else if(h.t=='sun'){const age=bt-h.b,f=Math.max(0,Math.min(1,age/h.warn)),pu2=SET.reduceFlash?f:Math.abs(Math.sin(age*Math.PI*(1+f*3))),fi=Math.min(1,age/.5);
g.save();g.translate(h.x,h.y);g.globalAlpha=fi*(.25+.35*f+.15*pu2);g.fillStyle=PINK;g.strokeStyle=PINK;g.lineWidth=2;
for(let j=0;j<8;j++){const a=h.a+j*Math.PI/4,L=30+5*f*pu2,c=Math.cos(a),s2=Math.sin(a),px=-s2,py=c;g.beginPath();g.moveTo(c*L,s2*L);g.lineTo(c*13+px*7,s2*13+py*7);g.lineTo(c*13-px*7,s2*13-py*7);g.closePath();g.fill();g.stroke()}
g.beginPath();g.arc(0,0,14+2*pu2,0,6.29);g.fill();g.stroke();g.globalAlpha=fi*(.3+.4*f);g.fillStyle='#fff';g.beginPath();g.arc(0,0,6,0,6.29);g.fill();g.restore();g.globalAlpha=1}
else if(h.t=='beam'&&h.ex!=null){const age=bt-h.b,line=(w,col,al)=>{g.globalAlpha=al;g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(SV_X,SV_Y);g.lineTo(h.ex,h.ey);g.stroke();g.globalAlpha=1;g.lineCap='butt'},now=performance.now(),RF=SET.reduceFlash;
 if(age<h.track){line(34,PINK,.16+(RF?0:.08*Math.sin(now/90)));g.setLineDash([10,7]);line(2,PINK,.7);g.setLineDash([]);g.strokeStyle=PINK;g.lineWidth=2;g.beginPath();g.arc(h.ex,h.ey,14,0,6.29);g.stroke()}
 else if(age<h.track+h.lock)line(34,PINK,RF?.35:Math.floor(now/70)%2?.45:.15);
 else{const k=1-(age-h.track-h.lock)/h.fire;line(60,'#fff',k*.25);line(34,PINK,Math.min(1,k*3));line(12,'#fff',Math.min(1,k*3));g.fillStyle='#fff';g.globalAlpha=Math.max(0,k);g.beginPath();g.arc(SV_X,SV_Y,16,0,6.29);g.fill();g.globalAlpha=1}}
else if(h.t=='con'&&h.cs){const age=bt-h.b,now=performance.now(),node=(x,y,al)=>{g.globalAlpha=al;starShape(x,y,8,0);g.fillStyle='#fff';g.fill();g.globalAlpha=1};
 h.cs.forEach(C=>{const ne=C.e.length,P=C.pts;
  if(age<h.warn){const prog=age/h.warn*(ne+1),shown=Math.min(ne,Math.floor(prog));g.setLineDash([8,6]);g.strokeStyle=PINK;g.lineWidth=2;
   C.e.slice(0,shown).forEach(([a,b])=>{g.globalAlpha=.35+.3*Math.abs(Math.sin(now/120));g.beginPath();g.moveTo(P[a][0],P[a][1]);g.lineTo(P[b][0],P[b][1]);g.stroke()});g.setLineDash([]);g.globalAlpha=1;
   if(shown<ne){const[a,b]=C.e[shown],f=prog%1;g.strokeStyle=PINK;g.globalAlpha=.6;g.beginPath();g.moveTo(P[a][0],P[a][1]);g.lineTo(P[a][0]+(P[b][0]-P[a][0])*f,P[a][1]+(P[b][1]-P[a][1])*f);g.stroke();g.globalAlpha=1}
   P.forEach(q=>node(q[0],q[1],.6+.4*Math.abs(Math.sin(now/150))))}
  else{const al=Math.max(0,Math.min(1,(h.warn+h.dur-age)/.4));g.globalAlpha=al;g.lineCap='round';C.e.forEach(([a,b])=>{g.strokeStyle=PINK;g.lineWidth=14;g.beginPath();g.moveTo(P[a][0],P[a][1]);g.lineTo(P[b][0],P[b][1]);g.stroke();g.strokeStyle='#fff';g.lineWidth=5;g.stroke()});g.lineCap='butt';g.globalAlpha=1;P.forEach(q=>node(q[0],q[1],al))}})}
else if(h.t=='sword'&&h.side!=null){const age=bt-h.b,now=performance.now();
 if(age<h.warn){g.globalAlpha=.35+.25*Math.abs(Math.sin(now/110));g.setLineDash([6,8]);g.strokeStyle=PINK;g.lineWidth=2;g.beginPath();g.arc(h.px,h.py,h.len,Math.min(h.a0,h.a1),Math.max(h.a0,h.a1));g.stroke();g.setLineDash([]);g.globalAlpha=1;drawSword(h,h.a0,.9,1);
  const am=h.a0+(h.a1-h.a0)*.25;g.fillStyle=PINK;g.save();g.translate(h.px+Math.cos(am)*(h.len+14),h.py+Math.sin(am)*(h.len+14));g.rotate(am+h.cw*Math.PI/2);g.beginPath();g.moveTo(10,0);g.lineTo(-6,-7);g.lineTo(-6,7);g.closePath();g.fill();g.restore()}
 else{const sw=Math.min(1,(age-h.warn)/h.swing);for(let k=4;k>=1;k--)drawSword(h,h.a0+(h.a1-h.a0)*swEase(Math.max(0,sw-k*.06)),.12*(5-k)/4*(sw<1?1:.5),0);drawSword(h,swordAng(h,age),age>h.warn+h.swing?Math.max(0,1-(age-h.warn-h.swing)/h.fade):1,0)}}
else if(h.t=='shot'){const age=bt-h.b,F=shotFire();   /* aim cone (clipped to the board), crosshair once locked, muzzle flash */
 if(age>=SHOT.grow*.5&&age<F){const[mx,my]=shotMuzzle(h),sp=.2,lk=age>=SHOT.grow+SHOT.aim,now=performance.now();
  g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();g.globalAlpha=lk?(SET.reduceFlash?.3:.22+.12*Math.abs(Math.sin(now/90))):.15;g.fillStyle=PINK;g.beginPath();g.moveTo(mx,my);g.arc(mx,my,800,h.ang-sp,h.ang+sp);g.closePath();g.fill();
  g.globalAlpha=.85;g.setLineDash([8,6]);g.strokeStyle=PINK;g.lineWidth=2;g.beginPath();[h.ang-sp,h.ang+sp].forEach(a=>{g.moveTo(mx,my);g.lineTo(mx+Math.cos(a)*800,my+Math.sin(a)*800)});g.stroke();g.setLineDash([]);g.globalAlpha=1;g.restore();
  if(lk&&h.lx!=null){g.strokeStyle='#ff0';g.lineWidth=2;g.beginPath();g.arc(h.lx,h.ly,14,0,6.29);g.moveTo(h.lx-20,h.ly);g.lineTo(h.lx+20,h.ly);g.moveTo(h.lx,h.ly-20);g.lineTo(h.lx,h.ly+20);g.stroke()}}
 if(h.fire){if(age>=F&&age<F+SHOT.burn){const[mx,my]=shotMuzzle(h);g.globalAlpha=SET.reduceFlash?.5:.55+.25*Math.sin(performance.now()/40);g.fillStyle='#ff9a2a';g.beginPath();g.arc(mx,my,15,0,6.29);g.fill();g.fillStyle='#fff3a0';g.beginPath();g.arc(mx,my,8,0,6.29);g.fill();g.globalAlpha=1}}
 else for(let v=0;v<2;v++){const f=age-(F+v*SHOT.gap);if(f>=0&&f<.35){const[mx,my]=shotMuzzle(h);g.globalAlpha=1-f/.35;g.fillStyle='#ffe27a';g.beginPath();g.arc(mx,my,13,0,6.29);g.fill();g.globalAlpha=1}}}
else if(h.t=='road'){g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=3;g.setLineDash([26,18]);g.lineDashOffset=-bt*20;
 for(let k=1;k<LANES;k++){g.beginPath();g.moveTo(BX,BY+k*LANE_H);g.lineTo(BX+BW,BY+k*LANE_H);g.stroke()}g.setLineDash([]);g.lineDashOffset=0;g.restore()}
else if(h.t=='lane'){const age=bt-h.b,cy=laneY(h.lane),d=h.dir;g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 if(age<h.warn){const now=performance.now()/1000,RF=SET.reduceFlash;g.globalAlpha=RF?.18:.12+.1*Math.abs(Math.sin(now*8));g.fillStyle=PINK;g.fillRect(BX,BY+h.lane*LANE_H+3,BW,LANE_H-6);
  for(let a=0;a<3;a++){const ax=(d>0?BX+16:BX+BW-16)+d*a*16;g.globalAlpha=RF?.8:.5+.5*Math.abs(Math.sin(now*8+a));g.beginPath();g.moveTo(ax+d*10,cy);g.lineTo(ax-d*4,cy-12);g.lineTo(ax-d*4,cy+12);g.closePath();g.fill()}g.globalAlpha=1}
 for(let j=0;j<h.n;j++){const x=laneCarX(h,j);if(x==null)continue;for(let k=1;k<5;k++){g.globalAlpha=.25-k*.05;g.fillStyle=pkCol('#ff2e88');g.fillRect(x-d*(40+k*22)-10,cy-6,20,12)}g.globalAlpha=1;miniCar(x,cy,d)}
 g.restore()}
else if(h.t=='drive'){const c=smokeCar(bt-h.b);if(!c.main){g.save();g.translate(c.x,c.y);g.scale(c.dir*SMOKE.sc,SMOKE.sc);racerArt({low:lowHp(),gray:1});g.restore()}}
else if(h.t=='puff'){if(h.x!=null){g.save();g.beginPath();g.rect(BX,0,BW,BY+BH);g.clip();drawPuff(h);g.restore()}}   /* clouds stay within the board's width */
else if(h.t=='pom'&&h.H){const a=bt-h.b,now=performance.now()/1000;
 if(a<h.warn){g.save();g.beginPath();g.rect(0,BY-70,W,BH+70);g.clip();g.setLineDash([8,6]);g.strokeStyle=PINK;g.lineWidth=2;g.globalAlpha=SET.reduceFlash?.75:.5+.4*Math.abs(Math.sin(now*8));
  g.beginPath();for(let j=0;j<=60;j++){const q=pomPt(h,j/60);g[j?'lineTo':'moveTo'](q[0],q[1])}g.stroke();g.setLineDash([]);g.globalAlpha=1;
  [.2,.7].forEach(u=>{const q=pomPt(h,u),q2=pomPt(h,u+.02),an=Math.atan2(q2[1]-q[1],q2[0]-q[0]);g.fillStyle=PINK;g.save();g.translate(q[0],q[1]);g.rotate(an);g.beginPath();g.moveTo(9,0);g.lineTo(-5,-6);g.lineTo(-5,6);g.closePath();g.fill();g.restore()});g.restore()}
 else if(a<h.warn+h.fly){const u=(a-h.warn)/h.fly;for(let j=1;j<6;j++){const uu=u-j*.022;if(uu<0)break;const q=pomPt(h,uu);g.globalAlpha=.3-j*.05;tangaPom(q[0],q[1],16,0,{})}g.globalAlpha=1;const q=pomPt(h,u);tangaPom(q[0],q[1],18,now*12,{})}}
else if(h.t=='tor'&&h.x!=null){const a=bt-h.b,now=performance.now()/1000;
 if(a<h.warn){const f=a/h.warn;g.setLineDash([7,6]);g.strokeStyle=PINK;g.lineWidth=2;g.globalAlpha=SET.reduceFlash?.8:.5+.4*Math.abs(Math.sin(now*8));g.beginPath();g.arc(h.x,h.y,44-20*f,0,7);g.stroke();g.setLineDash([]);g.globalAlpha=1;
  const na=h.arms||2;for(let k=0;k<na;k++){const an=now*6*h.dir+k*Math.PI*2/na;drawLeaf(h.x+Math.cos(an)*(14+8*f),h.y+Math.sin(an)*(14+8*f),an+1.57,.5+.4*f)}}
 else if(a<h.warn+h.dur){g.globalAlpha=.25;g.fillStyle=PINK;g.beginPath();g.arc(h.x,h.y,10+3*Math.sin(now*12),0,7);g.fill();g.globalAlpha=1}}
else if(h.t=='root'&&h.cr){const a=bt-h.b;g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 h.cr.forEach((c,i)=>{if(a<h.warn){const f=a/h.warn;drawCrack(c.x,c.top,.35+.65*f);g.setLineDash([5,6]);g.strokeStyle=PINK;g.globalAlpha=.3*f;g.strokeRect(c.x-ROOT.w/2,c.top?BY:BY+BH-ROOT.len,ROOT.w,ROOT.len);g.setLineDash([]);g.globalAlpha=1}
  else{const R=rootEnds(h,c,i);if(R){drawCrack(c.x,c.top,.4);drawRoot(c,R)}}});g.restore()}
else if(h.t=='cash'){const a=bt-h.b,now=performance.now()/1000;g.save();g.beginPath();g.rect(BX,BY-4,BW,BH+4);g.clip();
 if(a<CASH.warn){g.globalAlpha=SET.reduceFlash?.5:.3+.3*Math.abs(Math.sin(now*10));g.fillStyle=h.kind=='gold'?'#ffd23f':PINK;g.fillRect(h.x-12,BY,24,6);g.globalAlpha=1}
 else{const c=cashPos(h);if(c){if(h.kind=='gold')drawGoldCoin(c[0],c[1]);else if(h.kind=='bill')drawBill(c[0],c[1],Math.sin(c[2]*4+h.ph)*.5);else drawCashCoin(c[0],c[1],now*5+h.ph)}}g.restore()}
else if(h.t=='pop'){const f=(bt-h.b)/1.6;g.globalAlpha=Math.max(0,1-f);txt('+1 BC',h.x,h.y-20-f*28,16,'#ffd23f','center',0,true);g.globalAlpha=1}
else if(h.t=='spit'&&h.x!=null){const a=bt-h.b,now=performance.now()/1000;
 if(a<SPIT.warn+SPIT.fly){const f=Math.min(1,a/SPIT.warn);g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();g.globalAlpha=.2+.35*f;g.fillStyle='#000';g.beginPath();g.ellipse(h.x,h.y,30*f+6,18*f+4,0,0,7);g.fill();
  g.strokeStyle=PINK;g.lineWidth=2;g.setLineDash([5,5]);g.globalAlpha=SET.reduceFlash?.8:.5+.4*Math.abs(Math.sin(now*9));g.stroke();g.setLineDash([]);g.globalAlpha=1;g.restore();
  if(a>=SPIT.warn){const u=(a-SPIT.warn)/SPIT.fly,[mx,my]=slugMouth(),x=mx+(h.x-mx)*u,y=my+(h.y-my)*u-Math.sin(u*Math.PI)*90;g.fillStyle=pkCol('#ff2e88');g.beginPath();g.ellipse(x,y,9,11,0,0,7);g.fill();g.fillStyle=pkCol('#ff86bd');g.beginPath();g.arc(x-3,y-4,3,0,7);g.fill()}}
 else{const s=a-SPIT.warn-SPIT.fly,al=s<SPIT.stay?1:Math.max(0,1-(s-SPIT.stay)/SPIT.dry),grow=Math.min(1,s/.3);g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();drawPuddle(h.x,h.y,SPIT.r*grow,al);
  if(s<.45){g.fillStyle=pkCol('#ff86bd');for(let q=0;q<6;q++){const an=q*1.05,d=20+s*90;g.beginPath();g.arc(h.x+Math.cos(an)*d,h.y+Math.sin(an)*d*.6,3,0,7);g.fill()}}g.restore()}}
else if(h.t=='shellw'){const a=bt-h.b,now=performance.now()/1000,gh=BH/SHELL.n;g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();
 if(a<SHELL.warn){const ex=h.dir>0?BX+14:BX+BW-14;g.globalAlpha=SET.reduceFlash?.8:.4+.5*Math.abs(Math.sin(now*9));g.fillStyle=PINK;   /* arrows only where shells will be: the gaps have none */
  for(let r=0;r<SHELL.n;r++){if(h.gaps.includes(r))continue;const cy=BY+gh*(r+.5);g.beginPath();g.moveTo(ex+h.dir*8,cy);g.lineTo(ex-h.dir*5,cy-7);g.lineTo(ex-h.dir*5,cy+7);g.closePath();g.fill()}g.globalAlpha=1}
 else{const x=shellX(h);if(x!=null)for(let r=0;r<SHELL.n;r++){if(h.gaps.includes(r))continue;drawShell(x,BY+gh*(r+.5),h.dir*Math.PI/2+Math.sin(now*6+r)*.15)}}g.restore()}
else if(h.t=='qgrid')drawQgrid(h);else if(h.t=='qck')drawQck(h);else if(h.t=='qcs')drawQcs(h);else if(h.t=='qcp')drawQcp(h);else if(h.t=='qcj')drawQcj(h);   /* Square Soulcerer */
else if(h.t=='pmk')drawPmk(h);else if(h.t=='pdr')drawPdr(h);else if(h.t=='pcc')drawPcc(h);   /* The Pretender */
else if(h.t=='swv')drawSwv(h);else if(h.t=='vol')drawVol(h);else if(h.t=='tbm')drawTbm(h);   /* Tourette Turret */
else if(h.t=='b'&&h.yb)dkBlob(h.x,h.y,h.r);else if(h.t=='blb')drawBlb(h);else if(h.t=='bdr')drawBdr(h);else if(h.t=='ksw'||h.t=='kst')drawKfly(h);else if(h.t=='dkgone'){}   /* Darius & Kipto */
else if(h.t=='b'&&h.fire)drawFireball(h);else if(h.t=='arw')drawArw(h);else if(h.t=='snk')drawSnk(h);else if(h.t=='col')drawCol(h);else if(h.t=='vup')drawVup(h);else if(h.t=='swp')drawSwp(h);else if(h.t=='smk')drawSmk(h);else if(h.t=='cloud'||h.t=='pmove'||h.t=='pgone'){}   /* Pancy (clouds are drawn after the loop, on top) */
else if(h.t=='peek')drawPeek(h);else if(h.t=='curt')drawCurt(h);else if(h.t=='stomp')drawStomp(h);
else if(h.t=='b'&&h.fp){const u=1-h.lf/h.lf0,c=u<.25?'#fff3a0':u<.55?'#ffb12a':u<.8?'#ff5a1f':'#b02a1a';g.globalAlpha=Math.min(1,h.lf/.25)*.9;g.fillStyle=c;g.beginPath();g.arc(h.x,h.y,h.r*(.5+1.1*u),0,6.29);g.fill();g.globalAlpha=1}   /* Racer's low-HP flame puff */
else if(h.t=='b'&&h.leaf){g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();drawLeaf(h.x,h.y,h.rot||0,h.lf!=null?Math.min(1,h.lf/.4):1);g.restore()}
else if(h.t=='b'&&h.st){g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();if(h.lf!=null)g.globalAlpha=Math.min(1,h.lf/.3);starShape(h.x,h.y,h.st,h.rot||0);g.fillStyle=PINK;g.fill();starShape(h.x,h.y,h.st*.45,h.rot||0);g.fillStyle='#fff';g.fill();g.restore()}
else if(h.t=='b'&&h.sqr){const sp=Math.hypot(h.vx,h.vy);if(sp>90){g.strokeStyle='#fff';g.globalAlpha=Math.min(1,(sp-90)/120);g.lineWidth=2;g.beginPath();g.moveTo(h.x-h.vx*.09,h.y-h.vy*.09);g.lineTo(h.x-h.vx*.035,h.y-h.vy*.035);g.stroke();g.globalAlpha=1}
 g.save();g.translate(h.x,h.y);g.rotate(h.rot||0);g.fillStyle=PINK;g.fillRect(-7,-7,14,14);g.fillStyle='#fff';g.fillRect(-3,-3,6,6);g.restore()}
else if(h.t=='burst'){const f=(bt-h.b)/h.warn;g.strokeStyle=PINK;g.lineWidth=3;g.beginPath();g.arc(h.x,h.y,44-34*f,0,6.29);g.stroke();g.fillStyle=PINK;g.beginPath();g.arc(h.x,h.y,4+6*f,0,6.29);g.fill()}
else if(typeof h.a=='number'){const c=Math.cos(h.a),s2=Math.sin(h.a),px=-s2,py=c,tri=(k,hw)=>{g.beginPath();g.moveTo(h.x+c*11*k,h.y+s2*11*k);g.lineTo(h.x-c*11*k+px*hw*k,h.y-s2*11*k+py*hw*k);g.lineTo(h.x-c*11*k-px*hw*k,h.y-s2*11*k-py*hw*k);g.closePath();g.fill()};g.fillStyle=PINK;tri(1,8);g.fillStyle='#fff';tri(.4,8)}
else{g.fillStyle=PINK;g.beginPath();g.arc(h.x,h.y,h.r,0,6.29);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(h.x,h.y,h.r*.45,0,6.29);g.fill()}}if(dodge&&bi==8)for(const h of hz)if(h.t=='cloud')drawCloud(h);   /* Pancy's clouds hide the arrows completely */
}finally{PINK=PKS;PKA=0}
if(dodge)for(const p of players){for(const t of p.tr){g.globalAlpha=t.a*.6;g.fillStyle=p.col;shp(t.x,t.y,8,p.i);g.fill()}g.globalAlpha=1;
if(p.gone){}else if(p.down){g.globalAlpha=.5;g.strokeStyle=p.col;g.lineWidth=2;g.setLineDash([4,3]);shp(p.x,p.y,8,p.i);g.stroke();g.setLineDash([]);g.globalAlpha=1;
if(p.rev>0){g.strokeStyle='#7dff3d';g.lineWidth=4;g.beginPath();g.arc(p.x,p.y,18,-1.57,-1.57+6.28*p.rev/5);g.stroke()}else if(dodge)txt('REVIVE',p.x,p.y-18,11,'#fff','center')}
else{const hitF=performance.now()-(p.hit||0)<200;g.globalAlpha=p.inv>0&&p.dash<=0&&!hitF?(SET.reduceFlash?.55:Math.floor(p.inv*20)%2?.3:1):1;soul(p.x,p.y,hitF?PINK:p.col,p.i,p.dash>0);g.globalAlpha=1;
if(p.dcd>0&&dodge){g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2;g.beginPath();g.arc(p.x,p.y,15,-1.57,-1.57+6.28*(1-p.dcd/.6));g.stroke()}
if(players.length>1)txt('P'+(p.i+1),p.x,p.y-14,11,p.col,'center')}}
{const tp=players.length>1&&(S=='menu'||S=='tgt'||S=='sub'||S=='ptg')?pk:-1;players.forEach((p,i)=>{const n=players.length;if(n<3){const x=i?BX+BW-250:BX;if(i==tp){g.strokeStyle=p.col;g.lineWidth=3;g.strokeRect(x-8,452,258,p.sp!=null?54:40)}txt('P'+(i+1),x,478,18,p.col);txt('HP',x+40,478,14,'#fff');g.fillStyle='#600';g.fillRect(x+66,462,100,18);g.fillStyle=p.col;g.fillRect(x+66,462,100*p.hp/p.max,18);txt(p.gone?'LEFT':p.hp+' / '+p.max,x+176,478,16,'#fff');if(p.sp!=null&&!p.gone)spBar(p,x+66,486,100,8,x+40,x+176,12);if(p.pois>0&&!p.gone)txt('POISONED '+p.pois,x+66,508,11,PKC)}else{const cw=W/n,x=i*cw+(cw-170)/2+8;if(i==tp){g.strokeStyle=p.col;g.lineWidth=3;g.strokeRect(x-8,452,170,p.sp!=null?54:40)}txt('P'+(i+1),x,478,16,p.col);txt('HP',x+30,478,11,'#fff');g.fillStyle='#600';g.fillRect(x+48,464,60,14);g.fillStyle=p.col;g.fillRect(x+48,464,60*p.hp/p.max,14);txt(p.gone?'LEFT':p.hp+'/'+p.max,x+114,478,13,'#fff');if(p.sp!=null&&!p.gone)spBar(p,x+48,483,60,7,x+30,x+114,11);if(p.pois>0&&!p.gone)txt('POISONED '+p.pois,x+48,504,10,PKC)}})}
g.globalAlpha=dodge?.45:1;['FIGHT','ACT','ITEM','MERCY'].forEach((s,i)=>{const x=BX+i*150,on=S=='menu'&&mi==i,c=on?'#ff0':(S=='win'&&i==3&&wsp?'#ff0':'#ff9d00');g.strokeStyle=c;g.lineWidth=3;g.strokeRect(x,525,140,44);txt(s,x+70,555,22,c,'center');if(on)mSoul(x+22,547)});g.globalAlpha=1;
if(net.role&&net.ok)txt(lx('ONLINE  you = P'+(net.me+1))+(players.length>1&&(S=='menu'||S=='tgt'||S=='sub'||S=='ptg')?'  -  '+(pk==net.me?lx('YOUR TURN'):lx('P'+(pk+1)+' is choosing')):''),W-12,595,12,'#888','right',0,1);
if(BO){g.font='bold 18px monospace';const tw=g.measureText(lx(BO.n)+' ('+lx(BO.d)+')').width,ns=tw>180?18*180/tw:18;/* long names (Star Soulcerer) shrink so they don't run into the HP bar */
txt(BO.n,12,26,ns,'#fff');txt('('+BO.d+')',12+g.measureText(BO.n+' ').width,26,ns,BO.dc);g.fillStyle='#600';g.fillRect(200,10,200,16);g.fillStyle=PINK;g.fillRect(200,10,200*bhp/BO.hp,16);txt('HP',410,24,14,'#fff');
{const lo=lowHp()&&S!='win',ga=g.globalAlpha,dim=lo&&!SET.reduceFlash&&Math.floor(performance.now()/200)%2;g.globalAlpha=ga*(dim?.25:1);const mn=mbT?performance.now()-mbT:9e9,rd=mn<1200&&(SET.reduceFlash||Math.floor(mn/200)%2==0),mc=rd?'#f33':'#ff0';g.fillStyle=rd?'#8a1c1c':'#442';g.fillRect(200,32,200,10);g.fillStyle=mc;g.fillRect(200,32,2*spare,10);const mt='MERCY '+Math.round(spare)+'%';txt(mt,410,42,12,mc);if(lo){const cx=410+g.measureText(lx(mt)).width+14;g.fillStyle='#ff0';g.beginPath();g.moveTo(cx,30);g.lineTo(cx+8,43);g.lineTo(cx-8,43);g.closePath();g.fill();g.fillStyle='#000';g.fillRect(cx-1,34,2,5);g.fillRect(cx-1,40,2,2)}g.globalAlpha=ga}
{const info=BO.artist?'(Artist: '+BO.artist+')':'('+BO.genre+', '+BO.bpm+' BPM)',sl='Song: '+BO.song+' '+info;g.font='bold 14px monospace';/* too long for one line: split it so it doesn't cover the HP label */
if(g.measureText(lx(sl)).width<=348)txt(sl,W-12,26,14,'#aaa','right');else{txt('Song: '+BO.song,W-12,26,14,'#aaa','right',348,1);
/* the second part sits beside the MERCY label, so it gets less room; long credits wrap onto more lines */
g.font='bold 14px monospace';const rows=[];let cur='';info.split(' ').forEach(w=>{const t=cur?cur+' '+w:w;if(cur&&g.measureText(t).width>270){rows.push(cur);cur=w}else cur=t});rows.push(cur);
rows.forEach((r,k)=>txt(r,W-12,44+k*18,14,'#aaa','right',270,1))}}
if(dodge){g.fillStyle='#19e3ff';g.fillRect(0,0,Math.min(1,Math.max(0,(bt-tb)/TL))*W,4);if(bt<tb+2)txt('DODGE!',W/2,170,24,'#19e3ff','center')}}if(S=='lose'||S=='lexit'||loseGo)drawLose();if(S=='intro')drawIntro();if(S=='flee')drawFlee();if(storyFighting()&&ST.poison>0&&BO&&S!='win'&&S!='lose')txt('POISONED  '+ST.poison,12,46,13,'#b45bff');drawSlash();drawLens();if(S=='win'&&wxT)drawWx()}

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
if(AC){if(s.mu>=0){const b=BOSSES[s.mu];if(!mus||mus.b!==b){stopMusic();startMusic(b);syncMus(s.bt)}else if(Math.abs(musBt((AC.currentTime-mus.t0)/mus.spb)-s.bt)>.75)syncMus(s.bt)}else if(mus)stopMusic();
if(S=='win'&&prev!='win')jingle()}}
function syncMus(b){mus.t0=AC.currentTime-musRaw(b)*mus.spb;mus.step=Math.max(0,Math.ceil(b*4));if(mus.src){try{mus.src.stop()}catch(e){}mus.src=null}}
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
else if(S=='msg'||S=='atk'||S=='win')press(OK[1]); else if(S=='lose'){if(net.role!='guest'){const t=(performance.now()-loseT0)/1000;if(t>LOSE_MENU+.1&&!loseGo){if(storyOnlyVillage()){if(inR(W/2-95,410,190,46))press(OK[1]);return}for(let i=0;i<2;i++)if(inR(W/2-215+i*240,410,190,46)){if(loseI==i)press(OK[1]);else loseI=i;return}}}}
else if(S=='menu'||S=='tgt'||S=='sub'){
for(let i=0;i<4;i++)if(inR(BX+i*150,525,140,44)){
if(S=='menu'&&mi==i){press(OK[1]);return}
if(S=='sub'){press(NO[0]);if(mi==1)press(NO[0])}else if(S=='tgt')press(NO[0]);
mv(mi,i,4,R[0],L[0]);return}
if(S=='tgt'){if(inR(BX,BY,BW,BH))press(OK[1])}
else if(S=='sub'){const grid=subGrid();for(let i=0;i<sub.length;i++){const[sx,sy]=grid?subXY(i):[BX+70,BY+60+i*36];if(grid?inR(sx-40,sy-30,260,42):inR(BX+20,sy-28,BW-40,40)){if(subI==i)press(OK[1]);else if(grid){subI=i;sfxNav()}else mv(subI,i,sub.length,Dn[0],U[0]);return}}}}}
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
