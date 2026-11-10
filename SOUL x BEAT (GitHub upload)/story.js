/* ==========================================================================
   SOUL x BEAT — Story Mode
   Round 1: save files, player count (1-4).
   Round 2: COPY / ERASE / EXPORT / IMPORT, playtime per file.
   Round 3: Star Village hub (boss cards, kill/spare tracking, "But nobody came",
            corrupted music), STATS and ITEM panels, starter equipment.
   Loaded after script.js and uses its globals: S, g, W, H, BX, BY, BW, BH, txt,
   lines, shp, soul, drawBoss, PCOL, L, R, U, Dn, OK, NO, AC, SET, bi, mode,
   startBattle, sfxSel, sfxGo, tone, T0, addTR, fiT.
   Story state lives in ST so it never clashes with script.js variables.
   ========================================================================== */

/* Translations only for the changed title-screen labels, so other languages don't regress.
   Story Mode screens themselves are English-only for now. [es, fr, ja, zh-TW, zh-CN, it, de, ru, tr] */
addTR({
  "STORY": ["HISTORIA", "HISTOIRE", "ストーリー", "故事", "故事", "STORIA", "STORY", "СЮЖЕТ", "HİKAYE"],
  "Left / Right to choose, Enter / Z / A to confirm (or press 1, 2, 3 or 4)": [
    "Izquierda / Derecha para elegir, Enter / Z / A para confirmar (o pulsa 1, 2, 3 o 4)",
    "Gauche / Droite pour choisir, Entrée / Z / A pour valider (ou touches 1, 2, 3, 4)",
    "左 / 右で選択、Enter / Z / A で決定（または 1、2、3、4 キー）",
    "左 / 右選擇，Enter / Z / A 確認（或按 1、2、3、4）",
    "左 / 右选择，Enter / Z / A 确认（或按 1、2、3、4）",
    "Sinistra / Destra per scegliere, Invio / Z / A per confermare (o premi 1, 2, 3 o 4)",
    "Links / Rechts zum Wählen, Enter / Z / A zum Bestätigen (oder 1, 2, 3 oder 4 drücken)",
    "Влево / Вправо — выбор, Enter / Z / A — подтвердить (или нажмите 1, 2, 3 или 4)",
    "Seçmek için Sol / Sağ, onaylamak için Enter / Z / A (veya 1, 2, 3 ya da 4 tuşu)"]
});

/* ---------- game data ---------- */
const STORY_KEY = 'soulxbeat-story';
const STORY_SLOTS = 3;
const MAX_ITEMS = 8;
const SHAPE_NAMES = ['SQUARE', 'TRIANGLE', 'PENTAGON', 'CIRCLE'];

/* Villages. Mini bosses use an existing battle (bi = index into BOSSES in script.js). */
const VILLAGES = {
  1: {
    name: 'STAR VILLAGE',
    foes: [
      { id: 'prism', bi: 0 },
      { id: 'pulsar', bi: 1 },
      { id: 'maw', bi: 2 },
    ],
    soulcerer: { id: 'star', name: 'STAR SOULCERER' },
  },
};
const FOE_IDS = ['prism', 'pulsar', 'maw'];

/* Items. type: 'weapon' | 'armor' (more types come with the shop round). */
const ITEMS = {
  wsword: { name: 'Wooden Sword', type: 'weapon', atk: 1 },
  wshield: { name: 'Wooden Shield', type: 'armor', def: 1 },
};
const starterPlayer = () => ({ weapon: 'wsword', armor: 'wshield' });

/* Stats work like Undertale, extended to a max LV of 30.
   EXP_TABLE[lv-1] = total EXP needed to reach that LV. */
const MAX_LV = 30;
const EXP_TABLE = [0, 10, 30, 70, 120, 200, 300, 500, 800, 1200, 1700, 2500, 3500, 5000, 7000, 10000,
  15000, 25000, 50000, 70000, 95000, 125000, 160000, 200000, 250000, 310000, 380000, 460000, 550000, 650000];
const lvFromExp = exp => { let lv = 1; while (lv < MAX_LV && exp >= EXP_TABLE[lv]) lv++; return lv; };
const maxHp = lv => 16 + 4 * lv;
const baseAtk = lv => 2 * (lv - 1);
const baseDef = lv => Math.floor((lv - 1) / 4);
const itemAtk = id => (ITEMS[id] && ITEMS[id].atk) || 0;
const itemDef = id => (ITEMS[id] && ITEMS[id].def) || 0;

const ST = {
  scr: 'slots',   // 'slots' | 'players' | 'hub' | 'nobody'
  i: 0,           // highlighted row / option on the current screen
  j: 0,           // highlighted column (file buttons row, hub rows)
  slot: -1,       // save file in use
  act: null,      // file-screen mode: null | 'copy' | 'copyTo' | 'erase' | 'export' | 'importTo'
  src: -1,        // source file for COPY
  pending: null,  // save data waiting to be placed by IMPORT
  ask: null,      // yes/no dialog: { title, lines, yes() }
  askI: 0,        // 0 = NO, 1 = YES
  panel: null,    // hub panel: null | 'stats' | 'item'
  pp: 0,          // panel page (player index)
  pr: 0,          // panel row
  who: null,      // ITEM: choosing who equips an item: { k: item index, sel: player }
  fight: null,    // story battle in progress: { id }
  nbT: 0,         // "But nobody came" text start time
  msg: '', msgT: 0, msgCol: '#fff',
  last: 0, sinceSave: 0,
  saves: [null, null, null],
};

/* ---------- saves (localStorage, separate key from settings) ---------- */
const nInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= (max == null ? Infinity : max);
const okItem = (id, type) => typeof id == 'string' && ITEMS[id] && (!type || ITEMS[id].type == type) ? id : null;
function cleanPlayer(p) {
  if (!p || typeof p != 'object') return starterPlayer();
  return {
    weapon: 'weapon' in p ? okItem(p.weapon, 'weapon') : 'wsword',
    armor: 'armor' in p ? okItem(p.armor, 'armor') : 'wshield',
  };
}
const cleanItems = a => Array.isArray(a) ? a.map(id => okItem(id)).filter(Boolean) : [];
/* Returns a clean save object with only known fields, or null if the data isn't a valid save.
   Older saves get the new fields: starter gear, full HP, no fights yet, and per-player
   item lists (round 3) are merged into the shared party inventory. */
function cleanSave(s) {
  if (!s || typeof s != 'object' || !nInt(s.np, 1, 4)) return null;
  const exp = nInt(s.exp, 0) ? s.exp : 0, lv = lvFromExp(exp);
  const foes = {}, sf = s.foes && typeof s.foes == 'object' ? s.foes : {};
  FOE_IDS.forEach(id => {
    const f = sf[id] || {};
    foes[id] = { k: nInt(f.k, 0, 3) ? f.k : 0, sp: f.sp ? 1 : 0 };
  });
  const ps = Array.isArray(s.players) ? s.players : [];
  const items = [...cleanItems(s.items), ...ps.slice(0, s.np).flatMap(p => cleanItems(p && p.items))].slice(0, MAX_ITEMS);
  return {
    v: 3,
    np: s.np,
    village: nInt(s.village, 1, 5) ? s.village : 1,
    exp, lv,
    hp: nInt(s.hp, 1, maxHp(lv)) ? s.hp : maxHp(lv),
    coins: nInt(s.coins, 0) ? s.coins : 0,
    relics: nInt(s.relics, 0) ? s.relics : 0,
    time: typeof s.time == 'number' && isFinite(s.time) && s.time >= 0 ? s.time : 0,
    created: nInt(s.created, 0) ? s.created : Date.now(),
    foes,
    players: [...Array(s.np)].map((_, k) => cleanPlayer(ps[k])),
    items,   // shared party inventory (item ids)
  };
}
function storyLoad() {
  ST.saves = [null, null, null];
  try {
    const d = JSON.parse(localStorage.getItem(STORY_KEY));
    if (Array.isArray(d)) for (let k = 0; k < STORY_SLOTS; k++) ST.saves[k] = cleanSave(d[k]);
  } catch (e) {}
}
function storySave() {
  ST.sinceSave = 0;
  try { localStorage.setItem(STORY_KEY, JSON.stringify(ST.saves)); } catch (e) {}
}
function newSave(np) { return cleanSave({ np }); }
const cur = () => ST.saves[ST.slot];
addEventListener('pagehide', () => { if (ST.slot >= 0) storySave(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && ST.slot >= 0) storySave(); });

const fmtTime = t => {
  t = Math.floor(t || 0);
  const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60;
  return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
};

/* ---------- export / import ---------- */
function exportFile(k) {
  const data = { game: 'SOUL x BEAT', kind: 'story-save', version: 3, save: ST.saves[k] };
  try {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'SOUL x BEAT - File ' + (k + 1) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    storyMsg('File ' + (k + 1) + ' exported.', '#7dff3d');
  } catch (e) { storyErr('Export failed.'); }
}
let importInput = null;
function startImport() {
  if (!importInput) {
    importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json,application/json';
    importInput.style.display = 'none';
    importInput.tabIndex = -1;
    importInput.addEventListener('change', () => {
      const f = importInput.files && importInput.files[0];
      importInput.value = '';
      importInput.blur();
      if (f) readImport(f);
    });
    document.body.appendChild(importInput);
  }
  importInput.click();
}
function readImport(f) {
  if (f.size > 100000) { storyErr('That file is not a SOUL x BEAT save.'); return; }
  f.text().then(t => {
    let d = null;
    try { d = JSON.parse(t); } catch (e) {}
    const s = d && d.game == 'SOUL x BEAT' && d.kind == 'story-save' ? cleanSave(d.save) : null;
    if (!s || S != 'story' || ST.scr != 'slots') { storyErr('That file is not a SOUL x BEAT save.'); return; }
    ST.pending = s; ST.act = 'importTo'; ST.i = firstEmpty();
    AC && sfxSel();
  }, () => storyErr('Could not read that file.'));
}
const firstEmpty = () => { const k = ST.saves.findIndex(s => !s); return k < 0 ? 0 : k; };

/* ---------- messages, dialogs, sounds ---------- */
function storyMsg(m, col) { ST.msg = m; ST.msgT = 3; ST.msgCol = col || '#fff'; }
function storyErr(m) { storyMsg(m, '#ff5a5a'); if (AC) tone(160, T0(), .18, 'square', .12, 90); }
function askYesNo(title, lines, yes) { ST.ask = { title, lines, yes }; ST.askI = 0; AC && sfxSel(); }
function askAnswer(yes) {
  const a = ST.ask; ST.ask = null;
  if (yes) a.yes(); else AC && sfxSel();
}

/* ---------- story mp3s (played through music.js) ----------
   Corrupted mix: hub + empty battles, once every mini boss in the village has been killed 3 times. */
const villageGone = s => s && VILLAGES[s.village].foes.every(f => s.foes[f.id].k >= 3);
function updStoryMusic() {
  const want = S == 'story' && (ST.scr == 'hub' || ST.scr == 'nobody') && villageGone(cur()) ? 'corrupted' : null;
  if (want) playTrack(want);
  else if (MP3.id == 'corrupted') stopTrack();
}

/* ---------- playtime: counts inside a file (hub, empty battles, story fights) ---------- */
function tickPlaytime() {
  const now = performance.now(), dt = Math.min(.25, Math.max(0, (now - (ST.last || now)) / 1000));
  ST.last = now;
  if (ST.msgT > 0) ST.msgT -= dt;
  const inFile = ST.fight || (S == 'story' && (ST.scr == 'hub' || ST.scr == 'nobody'));
  const s = inFile && cur();
  if (!s) return;
  s.time += dt; ST.sinceSave += dt;
  if (ST.sinceSave >= 5) storySave();
}
(function storyTick() { requestAnimationFrame(storyTick); try { tickPlaytime(); updStoryMusic(); } catch (e) { console.error(e); } })();

/* ---------- story battles (called from script.js) ---------- */
const storyFighting = () => !!ST.fight;
/* Battle won: sp = spared. Records the result in the save. */
function storyWin(sp) {
  const s = cur(), f = ST.fight && s && s.foes[ST.fight.id];
  if (!f) return;
  if (sp) f.sp = 1; else f.k = Math.min(3, f.k + 1);
  storySave();
}
/* Battle over (won, fled or left the game-over screen): back to the hub. Returns true if handled. */
function storyReturn() {
  if (!ST.fight) return false;
  const k = VILLAGES[cur().village].foes.findIndex(f => f.id == ST.fight.id);
  ST.fight = null;
  S = 'story'; ST.scr = 'hub'; ST.i = 1; ST.j = Math.max(0, k); ST.panel = null;
  storySave();
  return true;
}
function startStoryFight(f) {
  const s = cur();
  ST.fight = { id: f.id };
  bi = f.bi; mode = s.np;
  AC && sfxGo();
  startBattle();
}

/* ---------- navigation ---------- */
function openStory() {
  storyLoad();
  S = 'story'; ST.scr = 'slots'; ST.i = 0; ST.j = 0; ST.slot = -1;
  ST.act = null; ST.ask = null; ST.pending = null; ST.panel = null; ST.fight = null; ST.msgT = 0;
  AC && sfxSel();
}
function storyGo(scr, i, j) {
  if ((ST.scr == 'hub' || ST.scr == 'nobody') && scr == 'slots') storySave();   // leaving a file: keep its playtime
  ST.scr = scr; ST.i = i || 0; ST.j = j || 0; ST.panel = null;
}
const toHub = () => storyGo('hub', 1, 0);
function storyExit() { S = 'mode'; AC && sfxSel(); }
function cancelAct() { ST.act = null; ST.src = -1; ST.pending = null; ST.i = ROW_ACTS; AC && sfxSel(); }

/* File-screen actions once a file is picked */
function fileChosen(k) {
  if (!nInt(k, 0, STORY_SLOTS - 1)) return;
  const s = ST.saves[k], n = 'File ' + (k + 1);
  if (ST.act == null) {
    ST.slot = k; AC && sfxGo();
    if (s) toHub(); else storyGo('players');
  } else if (ST.act == 'copy') {
    if (!s) { storyErr(n + ' is empty.'); return; }
    ST.src = k; ST.act = 'copyTo'; ST.i = (k + 1) % STORY_SLOTS; AC && sfxSel();
  } else if (ST.act == 'copyTo') {
    if (k == ST.src) { storyErr('Choose a different file.'); return; }
    const src = ST.src, go = () => {
      ST.saves[k] = cleanSave(ST.saves[src]); storySave(); ST.act = null; ST.i = k;
      AC && sfxGo(); storyMsg('File ' + (src + 1) + ' copied to ' + n + '.', '#7dff3d');
    };
    if (s) askYesNo('OVERWRITE ' + n.toUpperCase() + '?', [n + ' will be replaced by File ' + (src + 1) + '.', 'This cannot be undone.'], go);
    else go();
  } else if (ST.act == 'erase') {
    if (!s) { storyErr(n + ' is already empty.'); return; }
    askYesNo('ERASE ' + n.toUpperCase() + '?', ['All progress in ' + n + ' will be lost.', 'This cannot be undone.'], () => {
      ST.saves[k] = null; storySave(); ST.act = null; ST.i = k;
      AC && sfxGo(); storyMsg(n + ' erased.', '#ff9a2e');
    });
  } else if (ST.act == 'export') {
    if (!s) { storyErr(n + ' is empty.'); return; }
    ST.act = null; ST.i = k; AC && sfxGo(); exportFile(k);
  } else if (ST.act == 'importTo') {
    const go = () => {
      ST.saves[k] = ST.pending; ST.pending = null; storySave(); ST.act = null; ST.i = k;
      AC && sfxGo(); storyMsg('Save imported into ' + n + '.', '#7dff3d');
    };
    if (s) askYesNo('OVERWRITE ' + n.toUpperCase() + '?', [n + ' will be replaced by the imported save.', 'This cannot be undone.'], go);
    else go();
  }
}
function actButton(j) {
  ST.j = j;
  const a = FILE_ACTS[j];
  if (a == 'IMPORT') { AC && sfxSel(); startImport(); return; }
  if (ST.saves.every(s => !s)) { storyErr('There are no files to ' + a.toLowerCase() + '.'); return; }
  ST.act = a.toLowerCase(); ST.src = -1;
  const k = ST.saves.findIndex(s => s); ST.i = k < 0 ? 0 : k;
  AC && sfxSel();
}

/* ---------- hub ---------- */
/* Hub rows: 0 = STATS / ITEM buttons, 1 = boss cards, 2 = BACK */
const HUB_COLS = [2, 4, 1];
const soulcererOpen = s => VILLAGES[s.village].foes.every(f => s.foes[f.id].k > 0 || s.foes[f.id].sp);
function pickCard(k) {
  const s = cur(), v = VILLAGES[s.village];
  if (k < v.foes.length) {
    const f = v.foes[k];
    if (s.foes[f.id].k >= 3) { AC && sfxGo(); ST.scr = 'nobody'; ST.nbT = performance.now(); return; }
    startStoryFight(f);
  } else if (!soulcererOpen(s)) storyErr('Spare or defeat all three to face the ' + v.soulcerer.name + '.');
  else storyErr('The ' + v.soulcerer.name + ' is not ready yet.');
}
function hubActivate() {
  if (ST.i == 0) { ST.panel = ST.j ? 'item' : 'stats'; ST.pp = 0; ST.pr = 0; ST.who = null; AC && sfxSel(); }
  else if (ST.i == 1) pickCard(ST.j);
  else { AC && sfxSel(); storyGo('slots', ST.slot); }
}
function hubMove(dr, dc) {
  if (dr) {
    const from = ST.i, to = (from + dr + 3) % 3;
    if (to == 0) ST.j = from == 1 ? Math.min(ST.j, 1) : 0;      // cards -> buttons: stay on the same side
    else if (to == 1) ST.j = from == 0 ? ST.j : 0;              // buttons -> cards: same column; BACK -> first card
    else ST.j = 0;
    ST.i = to;
  } else ST.j = (ST.j + dc + HUB_COLS[ST.i]) % HUB_COLS[ST.i];
  if (dr || HUB_COLS[ST.i] > 1) AC && sfxSel();
}

/* ---------- STATS / ITEM panels ---------- */
/* STATS: one page per player, rows 0 = WEAPON, 1 = ARMOR.
   ITEM: the party's shared inventory; equipping asks WHO EQUIPS IT? when there are 2+ players. */
const slotOf = id => ITEMS[id].type == 'weapon' ? 'weapon' : ITEMS[id].type == 'armor' ? 'armor' : null;
function unequip(slotName) {
  const s = cur(), p = s.players[ST.pp], id = p[slotName];
  if (!id) { storyErr('Nothing is equipped there.'); return; }
  if (s.items.length >= MAX_ITEMS) { storyErr('Your items are full.'); return; }
  askYesNo('UNEQUIP?', ['Move the ' + ITEMS[id].name + ' to your items?'], () => {
    p[slotName] = null; s.items.push(id); storySave();
    AC && sfxSel(); storyMsg(ITEMS[id].name + ' moved to your items.', '#fff');
  });
}
function equipItem(k, pi) {
  const s = cur(), p = s.players[pi], id = s.items[k], slotName = slotOf(id), old = p[slotName];
  p[slotName] = id;
  if (old) s.items[k] = old; else s.items.splice(k, 1);
  ST.pr = Math.min(ST.pr, Math.max(0, s.items.length - 1));
  ST.who = null;
  storySave(); AC && sfxGo();
  storyMsg((s.np > 1 ? 'P' + (pi + 1) : 'You') + ' equipped the ' + ITEMS[id].name + '.', '#7dff3d');
}
function useItem(k) {
  const s = cur(), id = s.items[k];
  if (!id) return;
  if (!slotOf(id)) { storyErr("That can't be used here."); return; }
  if (s.np == 1) equipItem(k, 0);
  else { ST.who = { k, sel: 0 }; AC && sfxSel(); }
}
function panelPress(c, is) {
  const s = cur(), np = s.np;
  if (ST.who) {
    if (is(L) || is(R)) { ST.who.sel = (ST.who.sel + (is(L) ? np - 1 : 1)) % np; AC && sfxSel(); }
    else if (is(OK)) equipItem(ST.who.k, ST.who.sel);
    else if (is(NO)) { ST.who = null; AC && sfxSel(); }
    return;
  }
  const rows = ST.panel == 'stats' ? 2 : s.items.length;
  if (is(L) || is(R)) { if (ST.panel == 'stats' && np > 1) { ST.pp = (ST.pp + (is(L) ? np - 1 : 1)) % np; ST.pr = 0; AC && sfxSel(); } }
  else if (is(U) || is(Dn)) { if (rows > 1) { ST.pr = (ST.pr + (is(U) ? rows - 1 : 1)) % rows; AC && sfxSel(); } }
  else if (is(OK)) {
    if (ST.panel == 'stats') unequip(ST.pr ? 'armor' : 'weapon');
    else if (rows) useItem(ST.pr);
  }
  else if (is(NO)) { ST.panel = null; AC && sfxSel(); }
}

function storyActivate() {
  if (ST.scr == 'slots') {
    if (ST.act) { fileChosen(ST.i); return; }
    if (ST.i == ROW_BACK) storyExit();
    else if (ST.i == ROW_ACTS) actButton(ST.j);
    else fileChosen(ST.i);
  } else if (ST.scr == 'players') {
    ST.saves[ST.slot] = newSave(ST.i + 1);
    storySave();
    AC && sfxGo();
    toHub();
  } else if (ST.scr == 'hub') hubActivate();
}
function storyBack() {
  if (ST.scr == 'slots') { if (ST.act) cancelAct(); else storyExit(); return; }
  AC && sfxSel();
  storyGo('slots', ST.slot);
}

/* ---------- input ---------- */
function storyPress(c, is) {
  if (ST.ask) {
    if (is(L) || is(R)) { const j = is(L) ? 0 : 1; if (j != ST.askI) { ST.askI = j; AC && sfxSel(); } }
    else if (is(OK)) askAnswer(ST.askI == 1);
    else if (is(NO)) askAnswer(false);
    return;
  }
  const num = /^(Digit|Numpad)[1-4]$/.test(c) ? +c.slice(-1) - 1 : -1;
  if (ST.scr == 'nobody') {
    if (is(OK) || is(NO)) {
      if (!nobodyDone()) ST.nbT = -1e9;
      else { AC && sfxSel(); toHub(); }
    }
    return;
  }
  if (ST.scr == 'hub') {
    if (ST.panel) { panelPress(c, is); return; }
    if (is(U)) hubMove(-1, 0);
    else if (is(Dn)) hubMove(1, 0);
    else if (is(L)) hubMove(0, -1);
    else if (is(R)) hubMove(0, 1);
    else if (num >= 0) { ST.i = 1; ST.j = num; hubActivate(); }
    else if (is(OK)) hubActivate();
    else if (is(NO)) storyBack();
    return;
  }
  if (ST.scr == 'slots') {
    const rows = ST.act ? STORY_SLOTS : ROW_BACK + 1;   // while picking a file, only the files are selectable
    if (is(U) || is(Dn)) { ST.i = (ST.i + (is(U) ? rows - 1 : 1)) % rows; AC && sfxSel(); }
    else if ((is(L) || is(R)) && ST.i == ROW_ACTS && !ST.act) { ST.j = (ST.j + (is(L) ? 3 : 1)) % 4; AC && sfxSel(); }
    else if (num >= 0 && num < STORY_SLOTS) { ST.i = num; storyActivate(); }
    else if (is(OK)) storyActivate();
    else if (is(NO)) storyBack();
    return;
  }
  /* players screen */
  if (is(L) || is(R)) { ST.i = (ST.i + (is(L) ? 3 : 1)) % 4; AC && sfxSel(); }
  else if (num >= 0) { ST.i = num; storyActivate(); }
  else if (is(OK)) storyActivate();
  else if (is(NO)) storyBack();
}

/* touch: tapping an option that isn't highlighted moves the highlight; tapping the highlighted one activates it */
function storyTap(x, y, inR) {
  if (ST.ask) {
    for (let j = 0; j < 2; j++) if (inR(W / 2 + (j ? 90 : -90) - 80, 355, 160, 50)) {
      if (ST.askI == j) askAnswer(j == 1); else { ST.askI = j; AC && sfxSel(); }
      return;
    }
    return;
  }
  const pick = i => { if (ST.i == i) storyActivate(); else { ST.i = i; AC && sfxSel(); } };
  if (ST.scr == 'nobody') { storyPress(OK[0], a => a === OK); return; }
  if (ST.scr == 'hub') {
    if (ST.panel) { panelTap(x, y, inR); return; }
    const pick2 = (i, j) => { if (ST.i == i && ST.j == j) hubActivate(); else { ST.i = i; ST.j = j; AC && sfxSel(); } };
    for (let j = 0; j < 2; j++) if (inR(HUB_BTN_X[j], 22, 110, 40)) { pick2(0, j); return; }
    for (let j = 0; j < 4; j++) if (inR(cardX(j), CARD_Y, CARD_W, CARD_H)) { pick2(1, j); return; }
    if (inR(W / 2 - 100, BACK_Y - 22, 200, 44)) pick2(2, 0);
    return;
  }
  if (ST.scr == 'slots') {
    for (let k = 0; k < STORY_SLOTS; k++) if (inR(150, slotY(k), 500, SLOT_H)) { pick(k); return; }
    if (ST.act) { if (inR(W / 2 - 100, BACK_Y - 22, 200, 44)) cancelAct(); return; }
    for (let j = 0; j < 4; j++) if (inR(actX(j) - 70, ACT_Y - 24, 140, 40)) {
      if (ST.i == ROW_ACTS && ST.j == j) storyActivate(); else { ST.i = ROW_ACTS; ST.j = j; AC && sfxSel(); }
      return;
    }
    if (inR(W / 2 - 100, BACK_Y - 22, 200, 44)) pick(ROW_BACK);
  } else if (ST.scr == 'players') {
    for (let k = 0; k < 4; k++) if (inR(playerX(k) - 80, 228, 160, 172)) { pick(k); return; }
  }
}
function panelTap(x, y, inR) {
  const s = cur(), press = code => panelPress(code, a => a.includes(code));
  if (ST.who) {
    for (let k = 0; k < s.np; k++) if (inR(whoX(k, s.np) - 40, WHO.y + 60, 80, 90)) {
      if (ST.who.sel == k) press(OK[0]); else { ST.who.sel = k; AC && sfxSel(); }
      return;
    }
    if (!inR(WHO.x, WHO.y, WHO.w, WHO.h)) press(NO[0]);
    return;
  }
  if (!inR(PAN.x, PAN.y, PAN.w, PAN.h)) { ST.panel = null; AC && sfxSel(); return; }
  if (ST.panel == 'stats' && s.np > 1 && inR(PAN.x + PAN.w - 72, PAN.y + 62, 34, 40)) { press(L[0]); return; }
  if (ST.panel == 'stats' && s.np > 1 && inR(PAN.x + PAN.w - 38, PAN.y + 62, 34, 40)) { press(R[0]); return; }
  const rows = ST.panel == 'stats' ? [STAT_ROW_Y, STAT_ROW_Y + 30] : s.items.map((_, k) => ITEM_ROW_Y + k * 30);
  rows.forEach((ry, k) => {
    if (inR(PAN.x + 20, PAN.y + ry - 22, PAN.w - 40, 30)) {
      if (ST.pr == k) press(OK[0]); else { ST.pr = k; AC && sfxSel(); }
    }
  });
}

/* ---------- drawing ---------- */
const FILE_ACTS = ['COPY', 'ERASE', 'EXPORT', 'IMPORT'];
const ROW_ACTS = STORY_SLOTS, ROW_BACK = STORY_SLOTS + 1;   // rows on the file screen: files 0-2, button row, BACK
const SLOT_H = 80, slotY = k => 148 + k * 92;
const ACT_Y = 448, BACK_Y = 505;
const actX = j => W / 2 + (j - 1.5) * 150;
const playerX = k => 130 + k * 180;
const HUB_BTN_X = [20, 140];
const CARD_Y = 130, CARD_W = 170, CARD_H = 300, cardX = k => 30 + k * 190;
const PAN = { x: 170, y: 90, w: 460, h: 410 };
const STAT_ROW_Y = 225, ITEM_ROW_Y = 105;
const WHO = { x: PAN.x + 30, y: PAN.y + 110, w: PAN.w - 60, h: 200 };
const whoX = (k, np) => W / 2 + (k - (np - 1) / 2) * 90;

function drawParty(cx, y, np, size, gap) {
  for (let k = 0; k < np; k++) {
    g.fillStyle = PCOL[k];
    shp(cx + (k - (np - 1) / 2) * gap, y, size, k);
    g.fill();
  }
}
function storyHeader(sub, subCol) {
  txt('STORY MODE', W / 2, 80, 44, '#19e3ff', 'center');
  if (sub) txt(sub, W / 2, 118, 18, subCol || '#fff', 'center');
}
function backButton(on, label) {
  if (on) soul(W / 2 - 62, BACK_Y - 7, '#19e3ff');
  txt(label || 'BACK', W / 2, BACK_Y, 22, on ? '#ff0' : '#888', 'center');
}
function panelBox(title) {
  g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#000'; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h);
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(PAN.x, PAN.y, PAN.w, PAN.h);
  txt(title, W / 2, PAN.y + 42, 26, '#fff', 'center', 0, true);
}
function drawAsk() {
  const a = ST.ask, bx = 170, by = 185, bw = 460, bh = 230;
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#000'; g.fillRect(bx, by, bw, bh);
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(bx, by, bw, bh);
  txt(a.title, W / 2, by + 42, 24, '#ff0', 'center', 0, true);
  a.lines.forEach((t, i) => txt(t, W / 2, by + 88 + i * 28, 16, '#fff', 'center', bw - 30, true));
  [['NO', W / 2 - 90], ['YES', W / 2 + 90]].forEach((b, j) => {
    const on = ST.askI == j;
    if (on) soul(b[1] - 62, by + bh - 38, '#19e3ff');
    txt(b[0], b[1], by + bh - 31, 20, on ? '#ff0' : '#888', 'center', 110);
  });
}
function drawMsg(y) { if (ST.msgT > 0) txt(ST.msg, W / 2, y, 16, ST.msgCol, 'center', 0, true); }

function drawSlots() {
  const prompt = {
    copy: ['CHOOSE A FILE TO COPY', '#ff0'],
    copyTo: ['COPY FILE ' + (ST.src + 1) + ' TO WHICH FILE?', '#ff0'],
    erase: ['CHOOSE A FILE TO ERASE', '#ff5a5a'],
    export: ['CHOOSE A FILE TO EXPORT', '#ff0'],
    importTo: ['IMPORT INTO WHICH FILE?', '#ff0'],
  }[ST.act] || ['CHOOSE A FILE'];
  storyHeader(prompt[0], prompt[1]);
  for (let k = 0; k < STORY_SLOTS; k++) {
    const y = slotY(k), on = ST.i == k, s = ST.saves[k], c = on ? '#ff0' : '#888';
    const isSrc = ST.act == 'copyTo' && k == ST.src;
    g.fillStyle = '#000'; g.fillRect(150, y, 500, SLOT_H);
    g.strokeStyle = on ? '#ff0' : isSrc ? '#19e3ff' : '#444'; g.lineWidth = on || isSrc ? 4 : 2; g.strokeRect(150, y, 500, SLOT_H);
    if (on) soul(126, y + SLOT_H / 2, '#19e3ff');
    txt('FILE ' + (k + 1), 172, y + 30, 20, c, 'left', 200, true);
    if (s) {
      txt(fmtTime(s.time), 628, y + 30, 18, on ? '#fff' : '#aaa', 'right', 160, true);
      txt('VILLAGE ' + s.village + '  ·  ' + s.np + (s.np == 1 ? ' PLAYER' : ' PLAYERS') + '  ·  LV ' + s.lv,
        172, y + 60, 16, on ? '#fff' : '#aaa', 'left', 330, true);
      drawParty(575, y + 55, s.np, 8, 22);
    } else txt('NEW GAME', 172, y + 60, 16, on ? '#fff' : '#666', 'left', 330);
  }
  if (!ST.act) {
    FILE_ACTS.forEach((a, j) => {
      const on = ST.i == ROW_ACTS && ST.j == j, x = actX(j);
      if (on) soul(x - 58, ACT_Y - 7, '#19e3ff');
      txt(a, x, ACT_Y, 18, on ? '#ff0' : '#888', 'center', 90, true);
    });
    backButton(ST.i == ROW_BACK);
  } else backButton(false, 'CANCEL (X / B)');
  drawMsg(545);
  txt(ST.act ? 'Up / Down choose    Enter / Z / A select    X / B cancel'
             : 'Arrows choose    Enter / Z / A select    X / B back', W / 2, 575, 14, '#777', 'center');
}

function drawPlayers() {
  storyHeader('HOW MANY PLAYERS?');
  txt('FILE ' + (ST.slot + 1), W / 2, 150, 16, '#aaa', 'center', 0, true);
  for (let k = 0; k < 4; k++) {
    const cx = playerX(k), on = ST.i == k, np = k + 1, top = 245;
    txt(np + (np == 1 ? ' PLAYER' : ' PLAYERS'), cx, 233, 16, on ? '#ff0' : '#888', 'center', 150, true);
    g.strokeStyle = on ? '#ff0' : '#444'; g.lineWidth = on ? 4 : 2; g.strokeRect(cx - 75, top, 150, 150);
    if (np <= 2) drawParty(cx, top + 75, np, 14, 50);
    else {
      drawParty(cx, top + 50, 2, 14, 50);
      for (let j = 2; j < np; j++) { g.fillStyle = PCOL[j]; shp(cx + (np == 3 ? 0 : (j - 2.5) * 50), top + 102, 14, j); g.fill(); }
    }
  }
  txt('Left / Right choose    Enter / Z / A confirm (or press 1-4)    X / B back', W / 2, 568, 14, '#777', 'center');
}

function drawStarCard(x, y, open) {
  const cx = x + 85, cy = y + 90;
  g.globalAlpha = open ? .9 : .35;
  g.beginPath();
  for (let j = 0; j < 10; j++) {
    const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 20 : 46;
    j ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.closePath(); g.fillStyle = open ? '#fff' : '#ccc'; g.fill(); g.globalAlpha = 1;
  if (!open) {
    g.fillStyle = '#aaa'; g.strokeStyle = '#aaa'; g.lineWidth = 3;
    g.beginPath(); g.arc(cx, cy - 2, 8, Math.PI, 0); g.stroke(); g.fillRect(cx - 11, cy - 2, 22, 17);
  }
}

function drawHub() {
  const s = cur(), v = VILLAGES[s.village], bounce = Math.abs(Math.sin(Date.now() / 230));
  txt(v.name, W / 2, 70, 40, '#fff', 'center', 0, true);
  txt('VILLAGE ' + s.village, W / 2, 102, 16, '#aaa', 'center', 0, true);
  ['STATS', 'ITEM'].forEach((b, j) => {
    const on = ST.i == 0 && ST.j == j, x = HUB_BTN_X[j];
    g.strokeStyle = on ? '#ff0' : '#888'; g.lineWidth = on ? 3 : 2; g.strokeRect(x, 22, 110, 40);
    txt(b, x + 55, 49, 18, on ? '#ff0' : '#888', 'center', 0, true);
  });
  v.foes.forEach((f, k) => {
    const x = cardX(k), on = ST.i == 1 && ST.j == k, st = s.foes[f.id], B = BOSSES[f.bi], gone = st.k >= 3;
    g.strokeStyle = on ? '#19e3ff' : '#444'; g.lineWidth = on ? 5 : 2; g.strokeRect(x, CARD_Y, CARD_W, CARD_H);
    if (!gone) drawBoss(f.bi, x + 85, CARD_Y + 85, bounce, .62, !!st.sp, !st.sp && st.k == 1, !st.sp && st.k == 2);
    txt(B.n, x + 85, CARD_Y + 205, 22, gone ? '#555' : on ? '#ff0' : '#fff', 'center', 150, true);
    txt(B.d, x + 85, CARD_Y + 237, 18, gone ? '#555' : B.dc, 'center', 150);
    if (!gone) txt('FIGHT', x + 85, CARD_Y + 277, 16, on ? '#fff' : '#888', 'center', 150);
  });
  {
    const k = v.foes.length, x = cardX(k), on = ST.i == 1 && ST.j == k, open = soulcererOpen(s);
    g.strokeStyle = on ? '#19e3ff' : '#444'; g.lineWidth = on ? 5 : 2; g.strokeRect(x, CARD_Y, CARD_W, CARD_H);
    drawStarCard(x, CARD_Y, open);
    txt(v.soulcerer.name, x + 85, CARD_Y + 205, 15, !open ? '#555' : on ? '#ff0' : '#fff', 'center', 150, true);
    txt('???', x + 85, CARD_Y + 237, 18, '#555', 'center', 150, true);
    txt(open ? 'FIGHT' : 'LOCKED', x + 85, CARD_Y + 277, 16, !open ? '#555' : on ? '#fff' : '#888', 'center', 150);
  }
  drawParty(78, 520, s.np, 11, 36);
  backButton(ST.i == 2);
  drawMsg(470);
  txt('Arrows choose    Enter / Z / A select    X / B back', W / 2, 575, 14, '#777', 'center');
  if (ST.panel == 'stats') drawStats();
  else if (ST.panel == 'item') drawItems();
}
function panelPlayer(p) {
  const s = cur(), L0 = PAN.x + 40;
  g.fillStyle = PCOL[p]; shp(L0 + 14, PAN.y + 88, 14, p); g.fill();
  txt('P' + (p + 1) + '  ' + SHAPE_NAMES[p], L0 + 44, PAN.y + 95, 18, PCOL[p], 'left', 0, true);
  if (s.np > 1) {
    const ax = PAN.x + PAN.w - 55, ay = PAN.y + 88;
    g.fillStyle = '#ff0';
    g.beginPath(); g.moveTo(ax - 14, ay); g.lineTo(ax, ay - 10); g.lineTo(ax, ay + 10); g.fill();
    g.beginPath(); g.moveTo(ax + 34, ay); g.lineTo(ax + 20, ay - 10); g.lineTo(ax + 20, ay + 10); g.fill();
    txt((p + 1) + ' / ' + s.np, PAN.x + PAN.w - 24, PAN.y + PAN.h - 16, 14, '#888', 'right', 0, true);
  }
}
function drawStats() {
  const s = cur(), p = ST.pp, pl = s.players[p], L0 = PAN.x + 40, R0 = L0 + 190, y = PAN.y;
  panelBox('STATS');
  panelPlayer(p);
  txt('LV  ' + s.lv, L0, y + 145, 18, '#fff', 'left', 0, true);
  txt('HP  ' + s.hp + ' / ' + maxHp(s.lv), L0, y + 175, 18, '#fff', 'left', 0, true);
  txt('ATK ' + baseAtk(s.lv) + '  (' + itemAtk(pl.weapon) + ')', L0, y + STAT_ROW_Y, 18, '#fff', 'left', 0, true);
  txt('DEF ' + baseDef(s.lv) + '  (' + itemDef(pl.armor) + ')', L0, y + STAT_ROW_Y + 30, 18, '#fff', 'left', 0, true);
  [['WEAPON', pl.weapon], ['ARMOR', pl.armor]].forEach(([lab, id], k) => {
    const on = ST.pr == k, ry = y + STAT_ROW_Y + k * 30;
    if (on) soul(R0 - 18, ry - 6, '#19e3ff');
    txt(lab + ': ' + (id ? ITEMS[id].name.toUpperCase() : 'NONE'), R0, ry, 15, on ? '#ff0' : '#aaa', 'left', 220, true);
  });
  txt('EXP ' + s.exp, L0, y + 305, 18, '#fff', 'left', 0, true);
  txt('NEXT ' + (s.lv >= MAX_LV ? 'MAX' : EXP_TABLE[s.lv] - s.exp), R0, y + 305, 16, '#aaa', 'left', 0, true);
  txt('BEAT COINS ' + s.coins, L0, y + 342, 18, '#fff', 'left', 0, true);
  txt('SOUL RELICS ' + s.relics, L0, y + 368, 18, '#fff', 'left', 0, true);
  txt('Enter: unequip    X / B: close', W / 2, y + PAN.h - 16, 13, '#777', 'center', 0, true);
  drawMsg(PAN.y + PAN.h + 30);
}
function drawItems() {
  const s = cur(), L0 = PAN.x + 40, y = PAN.y;
  panelBox('ITEM');
  if (!s.items.length) txt('* You have no items.', L0, y + ITEM_ROW_Y, 18, '#bbb', 'left', 0, true);
  s.items.forEach((id, k) => {
    const on = ST.pr == k, ry = y + ITEM_ROW_Y + k * 30;
    if (on) soul(L0 - 2, ry - 6, '#19e3ff');
    const it = ITEMS[id], tag = it.type == 'weapon' ? '+' + it.atk + ' ATK' : it.type == 'armor' ? '+' + it.def + ' DEF' : '';
    txt('* ' + it.name, L0 + 20, ry, 18, on ? '#ff0' : '#fff', 'left', 0, true);
    if (tag) txt(tag, PAN.x + PAN.w - 40, ry, 15, '#aaa', 'right', 0, true);
  });
  txt(s.items.length + ' / ' + MAX_ITEMS, PAN.x + PAN.w - 24, y + PAN.h - 16, 14, '#888', 'right', 0, true);
  txt(s.items.length ? 'Enter: equip    X / B: close' : 'X / B: close', W / 2, y + PAN.h - 16, 13, '#777', 'center', 0, true);
  if (ST.who) drawWho();
  drawMsg(PAN.y + PAN.h + 30);
}
function drawWho() {
  const s = cur(), id = s.items[ST.who.k];
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h);
  g.fillStyle = '#000'; g.fillRect(WHO.x, WHO.y, WHO.w, WHO.h);
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(WHO.x, WHO.y, WHO.w, WHO.h);
  txt('WHO EQUIPS IT?', W / 2, WHO.y + 34, 20, '#ff0', 'center', 0, true);
  txt(ITEMS[id].name, W / 2, WHO.y + 58, 15, '#aaa', 'center', 0, true);
  for (let k = 0; k < s.np; k++) {
    const cx = whoX(k, s.np), on = ST.who.sel == k, cy = WHO.y + 105;
    g.strokeStyle = on ? '#ff0' : '#444'; g.lineWidth = on ? 3 : 2; g.strokeRect(cx - 34, cy - 34, 68, 68);
    g.fillStyle = PCOL[k]; shp(cx, cy, 16, k); g.fill();
    txt('P' + (k + 1), cx, cy + 58, 16, on ? '#ff0' : PCOL[k], 'center', 0, true);
  }
}

/* "But nobody came." — the battle screen with an empty arena */
const NOBODY = '* But nobody came.';
const nobodyChars = () => Math.floor((performance.now() - ST.nbT) / 1000 * 18);
const nobodyDone = () => nobodyChars() >= NOBODY.length;
function drawNobody() {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(BX, BY, BW, BH);
  txt(NOBODY.slice(0, Math.max(0, nobodyChars())), BX + 24, BY + 50, 22, '#fff', 'left', 0, true);
  if (nobodyDone() && Math.floor(Date.now() / 400) % 2) txt('Enter / Z / Space / A', BX + BW - 16, BY + BH - 14, 14, '#888', 'right');
  ['FIGHT', 'ACT', 'ITEM', 'MERCY'].forEach((b, i) => {
    const x = BX + i * 150;
    g.strokeStyle = '#ff9d00'; g.lineWidth = 3; g.strokeRect(x, 525, 140, 44);
    txt(b, x + 70, 555, 22, '#ff9d00', 'center');
  });
}

function drawStory() {
  if (ST.scr == 'slots') drawSlots();
  else if (ST.scr == 'players') drawPlayers();
  else if (ST.scr == 'hub') drawHub();
  else if (ST.scr == 'nobody') drawNobody();
  if (ST.ask) drawAsk();
}
