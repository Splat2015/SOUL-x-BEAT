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

/* Villages. Mini bosses use an existing battle (bi = index into BOSSES in script.js).
   def = boss DEF (from its CHECK text). Rewards each win: bc Beat Coins (spare or kill),
   exp EXP (kill only), sr Soul Relics (none in Village 1). shop: false = closed (stands instead).
   tname = the name in story text. arrive = scene the first time you travel there. soon = no fights there yet. */
const VILLAGES = {
  1: {
    name: 'STAR VILLAGE', tname: 'Star Village',
    shop: false,
    foes: [
      { id: 'prism', bi: 0, def: 2, bc: 10, exp: 10, sr: 0 },
      { id: 'pulsar', bi: 1, def: 3, bc: 20, exp: 25, sr: 0 },
      { id: 'maw', bi: 2, def: 4, bc: 30, exp: 45, sr: 0 },
    ],
    /* Village boss: one fight only. Unlocks once all three mini bosses were spared or killed.
       Its hits do 7 on the genocide route, 5 otherwise (see storyTaken). */
    soulcerer: {
      id: 'star', bi: 3, name: 'STAR SOULCERER', def: 5, genoDef: 9, bc: 100, exp: 100, sr: 0,
      spared: [
        '* The corruption drains from the Star Soulcerer.',
        '* Its light settles into a warm, quiet glow.\n* For a moment, it almost looks... relieved.',
        '* VILLAGE 1 COMPLETE.',
      ],
      killed: [
        '* The Star Soulcerer crumbles to dust.',
        '* Its light goes out.',
        '* You feel as though this is only the\n  beginning of a long journey.',
        '* VILLAGE 1 COMPLETE.',
      ],
      rest: '* The Star Soulcerer rests peacefully.',
    },
    /* Genocide: shown in the hub text box after the last mini boss is killed for the 3rd time,
       only if none of the village's mini bosses was ever spared. Plays once per file. */
    genoCut: [
      '* ...',
      '* The village has gone quiet.\n* Not a single beat left to hear.',
      '* The vendors have already retreated from their stands.\n* Fearing for their lives.',
      "* Far ahead, the Star statue's light flickers.\n* It knows what you've done.",
    ],
  },
  /* Square Village: its mini bosses and Soulcerer come in later rounds (cards show "???" / COMING SOON) */
  2: {
    name: 'SQUARE VILLAGE', tname: 'Square Village',
    shop: false, soon: true,
    foes: [], soulcerer: null,
    arrive: [
      '* You leave Star Village behind.',
      '* The road stretches on for days.\n* The air grows heavier the further you go.',
      '* At last, square rooftops appear on the horizon.',
      '* You can already hear the new tracks all\n  around you.',
      '* You arrived at Square Village.',
    ],
  },
};
const VILLAGE_COUNT = 5;
/* village n can be traveled to once the previous village's Soulcerer was beaten (spared or killed) */
const villageOpen = (s, n) => n == 1 || (!!VILLAGES[n] && !!s.seen['done' + (n - 1)]);
/* the next village is open but you haven't traveled there yet (TRAVEL gets a "!") */
const newVillageReady = s => villageOpen(s, s.village + 1) && !s.seen['been' + (s.village + 1)];
const DOWNED_HP = 4;

/* Village 1 stands (only while the village's shop is closed). Prices in Beat Coins;
   the potion stand prices in Soul Relics and just makes fun of you. */
const STANDS = {
  1: [
    { n: 'SNACKS', awn: '#ff7eb3', icon: 'pie', line: '* "Fresh from the oven! Well... mostly fresh."', sell: [['pcandy', 12], ['ppie', 15]] },
    { n: 'GEAR', awn: '#19e3ff', icon: 'blade', line: '* "Upgrades! Shiny ones! No refunds."', sell: [['ndagger', 15], ['rvisor', 15]] },
    { n: 'POTIONS', awn: '#7dff3d', icon: 'flask', line: '* "Finest potions in Star Village! Only the best for you."',
      potions: [['Rhythm Elixir', 3, "Fully restores the party's HP"], ['Tempo Tonic', 5, 'A mysterious fizzy drink']] },
  ],
};
/* Genocide route: after the genocide scene the vendors are gone. SNACKS / GEAR are empty stalls that
   give items away ("Take it.", 0 BC); the POTIONS stand is replaced by a NOTE and a broken flask. */
const standsAbandoned = () => { const s = cur(); return !!s.seen['geno' + s.village]; };
const POTION_NOTE = [
  '* "OK, listen here bub, I don\'t know WHAT your\n  deal is, but your violence caused the other\n  vendors to flee!"',
  '* "I left too, but I took my stand with me.\n  I\'m not letting a psycho like YOU use MY\n  potions for YOUR killing benefits!!"',
  '* "Oh, and don\'t even bother trying to lick the\n  green liquid from the broken flask, it\'s\n  poison that I accidentally dropped, you\'ll die."',
];
/* flavor text, "Read the note?", then the note and the potion question; YES = the (harmless) poison death, NO = "Smart choice." */
function readPotionNote() {
  AC && sfxSel();
  hubSay(['* The potions stand is gone.',
          '* A written note is left on the ground.\n* And next to it is a shattered flask with\n  pouring liquid.'],
    () => askYesNo('', ['Read the note?'],
      () => hubSay(['* The note reads as follows:', ...POTION_NOTE],
        () => askYesNo('', ['Taste the spilled potion for possible', 'fight advantages?'],
          potionDeath, () => hubSay('* Smart choice.'))),
      () => hubSay('* You leave the note alone.\n* You have a good guess on who wrote it\n  anyways...')));
}
/* the cyan square shatters and the game-over screen shows, with only VILLAGE (no fight to retry). Costs nothing. */
function potionDeath() {
  ST.potionDeath = 1; ST.panel = null; ST.tb = null;
  players.length = 0;      // no battle players: the shattering soul is P1's cyan square
  loseInit(0);
  loseT0 -= 100;           // start on the black screen right away
  loseI = 1;               // VILLAGE
  S = 'lose';
}
const storyOnlyVillage = () => !!ST.potionDeath;
const potionRoast = sr => [
  "* \"Ah, a fine choice! That'll be " + sr + ' Soul Relics."',
  '* "...Wait. Zero? You have ZERO Soul Relics?"',
  '* "HAHAHAHA! You walked up to a POTION stand\n* with ZERO Soul Relics?!"\n* "You have to be joking me."',
  "* \"Come back when you're a little...\n* hmm, RICHER!\"",
];   // HP a downed player comes back with after a won (or fled) fight
const FOE_IDS = ['prism', 'pulsar', 'maw', 'star'];

/* Items. type: 'weapon' | 'armor' (more types come with the shop round). */
const ITEMS = {
  wsword: { name: 'Wooden Sword', type: 'weapon', atk: 1, info: 'A sturdy practice sword carved from oak.' },
  wshield: { name: 'Wooden Shield', type: 'armor', def: 1, info: "A light shield. It's seen a few dents." },
  ndagger: { name: 'Neon Dagger', type: 'weapon', atk: 3, bar: 1.3, info: 'It hums with a faint electric glow.' },   // bar: attack bar speed (1 = normal)
  rvisor: { name: 'Radiant Visor', type: 'armor', def: 3, info: 'Shiny enough to see your reflection.' },
  pcandy: { name: 'Pure Candy', type: 'food', heal: 8, info: 'It tastes like Paradise.', eat: "* It's sweet and sparkly." },
  ppie: { name: 'Pink Pie', type: 'food', heal: 12, info: 'A slice of pink pie. Smells... odd.', eat: '* It tastes a little... Corrupted?' },
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
  iopt: null,     // ITEM: highlighted option (0 INFO, 1 USE, 2 DROP) for the selected item, or null
  stand: 0,       // which stand's menu is open (panel 'stand')
  fightItems: null, // { items, gear } when the current story fight started (a game over gives them back)
  cut: null,      // text box pages to show when back in the hub (cutscenes)
  fight: null,    // story battle in progress: { id }
  nbT: 0,         // "But nobody came" text start time
  msg: '', msgT: 0, msgCol: '#fff',
  last: 0, sinceSave: 0,
  saves: [null, null, null],
};

/* ---------- saves (localStorage, separate key from settings) ---------- */
const nInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= (max == null ? Infinity : max);
const okItem = (id, type) => typeof id == 'string' && ITEMS[id] && (!type || ITEMS[id].type == type) ? id : null;
/* Each player keeps their own current HP; the max is shared (from the party's LV). */
function cleanPlayer(p, max, hp) {
  if (!p || typeof p != 'object') p = starterPlayer();
  return {
    weapon: 'weapon' in p ? okItem(p.weapon, 'weapon') : 'wsword',
    armor: 'armor' in p ? okItem(p.armor, 'armor') : 'wshield',
    hp: nInt(p.hp, 1, max) ? p.hp : hp,
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
  const oldHp = nInt(s.hp, 1, maxHp(lv)) ? s.hp : maxHp(lv);   // round 3 saves had one shared HP value
  return {
    v: 5,
    np: s.np,
    village: nInt(s.village, 1, VILLAGE_COUNT) && VILLAGES[s.village] ? s.village : 1,
    exp, lv,
    coins: nInt(s.coins, 0) ? s.coins : 0,
    relics: nInt(s.relics, 0) ? s.relics : 0,
    time: typeof s.time == 'number' && isFinite(s.time) && s.time >= 0 ? s.time : 0,
    created: nInt(s.created, 0) ? s.created : Date.now(),
    foes,
    players: [...Array(s.np)].map((_, k) => cleanPlayer(ps[k], maxHp(lv), oldHp)),
    items,   // shared party inventory (item ids)
    seen: cleanSeen(s.seen),   // one-time events already shown, e.g. { geno1: 1 }
  };
}
function cleanSeen(o) {
  const r = {};
  if (o && typeof o == 'object') for (const k in o) if (/^[a-z0-9]{1,20}$/.test(k) && o[k]) r[k] = 1;
  return r;
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
  const data = { game: 'SOUL x BEAT', kind: 'story-save', version: 4, save: ST.saves[k] };
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
function askYesNo(title, lines, yes, no) { ST.ask = { title, lines, yes, no }; ST.askI = 0; AC && sfxSel(); }
function askAnswer(yes) {
  const a = ST.ask; ST.ask = null;
  if (yes) a.yes(); else { AC && sfxSel(); if (a.no) a.no(); }
}

/* ---------- story mp3s (played through music.js) ----------
   Corrupted mix: hub + empty battles, once every mini boss in the village has been killed 3 times. */
const villageGone = s => s && VILLAGES[s.village].foes.length > 0 && VILLAGES[s.village].foes.every(f => s.foes[f.id].k >= 3);
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
  const inFile = ST.fight || (S == 'story' && (ST.scr == 'hub' || ST.scr == 'nobody' || ST.scr == 'road'));
  const s = inFile && cur();
  if (!s) return;
  s.time += dt; ST.sinceSave += dt;
  if (ST.sinceSave >= 5) storySave();
}
(function storyTick() { requestAnimationFrame(storyTick); try { tickPlaytime(); updStoryMusic(); } catch (e) { console.error(e); } })();

/* ---------- story battles (called from script.js) ---------- */
const storyFighting = () => !!ST.fight;
const villageFoes = v => [...v.foes, v.soulcerer];   // mini bosses + the Soulcerer
const fightFoe = () => ST.fight && villageFoes(VILLAGES[cur().village]).find(f => f.id == ST.fight.id);
/* Genocide route for a village: every mini boss killed 3 times */
const genoRoute = s => villageGone(s);
/* a foe's DEF for this file's route (the Soulcerer is tougher on the genocide route) */
const foeDef = (s, f) => f.genoDef != null && genoRoute(s) ? f.genoDef : f.def;
const soulcererDone = s => { const f = s.foes[VILLAGES[s.village].soulcerer.id]; return f.k > 0 || f.sp; };
function restoreFightSnap() {
  const s = cur(), f = ST.fightItems;
  s.items = f.items.slice();
  s.players.forEach((p, k) => { if (f.gear[k]) [p.weapon, p.armor] = f.gear[k]; });
}
/* Battle start: each player's bar gets the party's max HP and their saved current HP. */
function storySetup(ps) {
  const s = cur(), max = maxHp(s.lv);
  /* items and equipment: remember them at the start of a fight; RETRY after a game over starts again with the same ones */
  if (ST.fightItems) restoreFightSnap(); else ST.fightItems = { items: s.items.slice(), gear: s.players.map(p => [p.weapon, p.armor]) };
  ps.forEach((p, k) => { p.max = max; p.hp = Math.max(1, Math.min(max, s.players[k].hp)); });
}
/* Your hit: timing damage + ATK (LV + weapon) - boss DEF, never below 1. */
function storyHit(k, d) {
  if (!ST.fight || d <= 0) return d;
  const s = cur(), pl = s.players[k] || s.players[0];
  return Math.max(1, d + baseAtk(s.lv) + itemAtk(pl.weapon) - foeDef(s, fightFoe()));
}
/* How fast player k's white attack bar moves (their weapon's "bar" value; 1 = normal speed) */
function storyBarSpeed(k) {
  if (!ST.fight) return 1;
  const pl = cur().players[k] || cur().players[0], w = ITEMS[pl.weapon];
  return (w && w.bar) || 1;
}
/* Damage taken: boss damage - DEF (LV + armor), never below 1.
   The Soulcerer hits for 7 on the genocide route and 5 on pacifist / neutral (2 less). */
function storyTaken(k, d) {
  if (!ST.fight) return d;
  const s = cur(), pl = s.players[k] || s.players[0];
  if (ST.fight.id == VILLAGES[s.village].soulcerer.id && !genoRoute(s)) d -= 2;
  return Math.max(1, d - baseDef(s.lv) - itemDef(pl.armor));
}
/* Save each player's HP after the fight (downed players come back with a few HP). */
function keepHp(gain) {
  const s = cur(), max = maxHp(s.lv);
  players.forEach((p, k) => {
    if (!s.players[k]) return;
    const hp = p.down || p.hp <= 0 ? DOWNED_HP : p.hp;
    s.players[k].hp = Math.max(1, Math.min(max, hp + (gain || 0)));
  });
}
/* Battle won: sp = spared. Records the result, gives rewards, returns the win text. */
function storyWin(sp) {
  const s = cur(), foe = fightFoe(), f = foe && s.foes[foe.id];
  if (!f) return '* YOU WON!';
  if (sp) f.sp = 1; else f.k = Math.min(3, f.k + 1);
  ST.fightItems = null;   // won: food eaten / gear swapped in this fight stays that way
  const v = VILLAGES[s.village], key = 'geno' + s.village, isSoul = foe === v.soulcerer;
  if (isSoul) {
    /* Soulcerer beaten (one fight only): its ending scene, and the village is complete */
    ST.cut = sp ? foe.spared : foe.killed;
    s.seen['done' + s.village] = 1;
  } else if (!sp && v.genoCut && !s.seen[key] && villageGone(s) && v.foes.every(x => !s.foes[x.id].sp)) {
    /* Genocide cutscene: the last mini boss killed for the 3rd time, and none ever spared */
    s.seen[key] = 1;
    ST.cut = v.genoCut;
  }
  const exp = sp ? 0 : foe.exp, bc = foe.bc, sr = foe.sr, oldLv = s.lv;
  s.exp += exp; s.coins += bc; s.relics += sr;
  s.lv = lvFromExp(s.exp);
  keepHp(maxHp(s.lv) - maxHp(oldLv));   // level-up raises current HP by the same amount as max HP
  storySave();
  return '* YOU WON!\n* You earned ' + exp + ' EXP, ' + bc + ' BC and ' + sr + ' SR.' + (s.lv > oldLv ? '\n* You leveled up.' : '');
}
/* Battle over (won, fled or left the game-over screen): back to the hub. Returns true if handled.
   Fleeing keeps your HP; a game over restores HP to what it was when the fight started. */
function storyReturn() {
  if (ST.potionDeath) {   // back from tasting the potion: nothing lost, just back at the note spot
    ST.potionDeath = 0;
    S = 'story'; ST.scr = 'hub'; ST.i = 2; ST.j = Math.max(0, standsHere() ? standsHere().findIndex(st => st.potions) : 0); ST.panel = null; ST.tb = null;
    return true;
  }
  if (!ST.fight) return false;
  if (S == 'flee') keepHp(0);
  else if (S == 'lexit' && ST.fightItems) restoreFightSnap();   // game over: items and equipment back to what they were
  ST.fightItems = null;
  const k = villageFoes(VILLAGES[cur().village]).findIndex(f => f.id == ST.fight.id);
  ST.fight = null;
  S = 'story'; ST.scr = 'hub'; ST.i = 1; ST.j = Math.max(0, k); ST.panel = null; ST.tb = null;
  if (ST.cut) { hubSay(ST.cut); ST.cut = null; }
  storySave();
  return true;
}
function startStoryFight(f) {
  const s = cur();
  ST.fight = { id: f.id };
  ST.fightItems = null;
  bi = f.bi; mode = s.np;
  if (f === VILLAGES[s.village].soulcerer)   // CHECK shows the route's ATK
    BOSSES[f.bi].chk = '* ' + f.name + ' - ' + (genoRoute(s) ? 7 : 5) + ' ATK ' + foeDef(s, f) + ' DEF\n* DIFFICULTY: SOULCERER\n* A hero of the old war, sealed in stone.';
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
  ST.scr = scr; ST.i = i || 0; ST.j = j || 0; ST.panel = null; ST.tb = null;
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
/* Hub rows: 0 = buttons (STATS, ITEM at the left; SHOP, TRAVEL at the right), 1 = boss cards, 2 = BACK. */
const hubBtns = () => ['STATS', 'ITEM', 'SHOP', 'TRAVEL'];
const hubBtnX = (j, n) => j < 2 ? 20 + j * 120 : W - 130 - (n - 1 - j) * 120;
/* bottom row: the village's stands (while its shop is closed), then BACK */
const standsHere = () => { const s = cur(); return VILLAGES[s.village].shop ? null : STANDS[s.village] || null; };
const hubCols = i => i == 0 ? hubBtns().length : i == 1 ? 4 : standsHere() ? standsHere().length + 1 : 1;
const backCol = () => hubCols(2) - 1;
/* Undertale-style text box at the bottom of the hub (SHOP messages, cutscenes, travel) */
/* t = one page of text, or an array of pages (each page up to 3 lines); Enter goes to the next page */
/* after (optional) runs once the last page is closed */
function hubSay(t, after) {
  const pages = Array.isArray(t) ? t : [t];
  ST.tb = { pages, p: 0, text: pages[0], t0: performance.now(), after };
}
function tbNext() {
  if (tbChars() < ST.tb.text.length) { ST.tb.t0 = -1e9; return; }   // first press finishes the page
  if (ST.tb.p + 1 < ST.tb.pages.length) { ST.tb.p++; ST.tb.text = ST.tb.pages[ST.tb.p]; ST.tb.t0 = performance.now(); AC && sfxSel(); }
  else { const after = ST.tb.after; ST.tb = null; AC && sfxSel(); if (after) after(); }
}
const tbChars = () => Math.floor((performance.now() - ST.tb.t0) / 1000 * 40);
/* ---------- TRAVEL: a list of all five villages ----------
   Locked villages show ??? until the previous village's Soulcerer is beaten. The first trip to a village
   plays its arrival scene on a black screen; later trips just say where you are. */
function travelPick(n) {
  const s = cur();
  if (n == s.village) { storyErr("You're already here."); return; }
  if (!villageOpen(s, n)) { storyErr("You can't go there yet."); return; }
  askYesNo('', ['Leave ' + VILLAGES[s.village].tname + '?'], () => {
    const v = VILLAGES[n], first = v.arrive && !s.seen['been' + n];
    s.village = n; s.seen['been' + n] = 1;
    storySave(); AC && sfxGo();
    if (first) { storyGo('road'); hubSay(v.arrive, () => storyGo('hub', 0, hubBtns().indexOf('TRAVEL'))); }
    else { storyGo('hub', 0, hubBtns().indexOf('TRAVEL')); hubSay('* You traveled to ' + v.tname + '.'); }
  });
}
const soulcererOpen = s => VILLAGES[s.village].foes.every(f => s.foes[f.id].k > 0 || s.foes[f.id].sp);
function pickCard(k) {
  const s = cur(), v = VILLAGES[s.village];
  if (v.soon) { storyErr('Coming soon.'); return; }
  if (k < v.foes.length) {
    const f = v.foes[k];
    if (s.foes[f.id].k >= 3) { AC && sfxGo(); ST.scr = 'nobody'; ST.nbT = performance.now(); return; }
    startStoryFight(f);
  } else if (!soulcererOpen(s)) storyErr('Spare or defeat all three to face the ' + v.soulcerer.name + '.');
  else {
    const st = s.foes[v.soulcerer.id];
    if (st.sp) { AC && sfxSel(); hubSay(v.soulcerer.rest); }                                   // spared: one fight only
    else if (st.k > 0) { AC && sfxGo(); ST.scr = 'nobody'; ST.nbT = performance.now(); }      // killed
    else startStoryFight(v.soulcerer);
  }
}
function hubActivate() {
  if (ST.i == 0) {
    const b = hubBtns()[ST.j];
    if (b == 'STATS' || b == 'ITEM') { ST.panel = b == 'ITEM' ? 'item' : 'stats'; ST.pp = 0; ST.pr = 0; ST.who = null; ST.iopt = null; AC && sfxSel(); }
    else if (b == 'SHOP') { AC && sfxSel(); hubSay('* The shop is closed.'); }
    else if (b == 'TRAVEL') { ST.panel = 'travel'; ST.pr = cur().village - 1; AC && sfxSel(); }
  }
  else if (ST.i == 1) pickCard(ST.j);
  else if (ST.j < backCol()) openStand(ST.j);
  else { AC && sfxSel(); storyGo('slots', ST.slot); }
}
function hubMove(dr, dc) {
  if (dr) {
    const from = ST.i, to = (from + dr + 3) % 3;
    if (to == 0) ST.j = from == 1 ? Math.min(ST.j, hubCols(0) - 1) : 0;   // cards -> buttons: the button above
    else if (to == 1) ST.j = Math.min(ST.j, 3);                           // to the cards: the card in the same column
    else ST.j = from == 1 ? Math.min(ST.j, backCol()) : 0;                // cards -> stands / BACK below
    ST.i = to;
  } else ST.j = (ST.j + dc + hubCols(ST.i)) % hubCols(ST.i);
  if (dr || hubCols(ST.i) > 1) AC && sfxSel();
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
  ST.iopt = null;
  const food = ITEMS[id].type == 'food';
  if (!food && !slotOf(id)) { storyErr("That can't be used here."); return; }
  if (s.np == 1) (food ? eatItem : equipItem)(k, 0);
  else { ST.who = { k, sel: 0, act: food ? 'eat' : 'equip' }; AC && sfxSel(); }
}
/* eating outside battle: heal that player (not past max HP); the text box says what happened */
function eatItem(k, pi) {
  const s = cur(), p = s.players[pi], it = ITEMS[s.items[k]], max = maxHp(s.lv), solo = s.np == 1, nm = 'P' + (pi + 1);
  ST.who = null;
  if (p.hp >= max) { storyErr((solo ? 'You are' : nm + ' is') + ' already at full HP.'); return; }
  const full = p.hp + it.heal >= max;
  p.hp = Math.min(max, p.hp + it.heal);
  s.items.splice(k, 1);
  ST.pr = Math.min(ST.pr, Math.max(0, s.items.length - 1));
  storySave(); if (AC) sfxHeal();
  hubSay((solo ? '* You ate the ' : '* ' + nm + ' ate the ') + it.name + '.\n' + it.eat + '\n* ' +
    (full ? (solo ? 'Your HP was maxed out.' : nm + "'s HP was maxed out.") : (solo ? 'You' : nm) + ' recovered ' + it.heal + ' HP.'));
}

/* ---------- stands ---------- */
function openStand(k) {
  if (standsAbandoned() && standsHere()[k].potions) { readPotionNote(); return; }   // the potion stand is gone: read the note
  ST.panel = 'stand'; ST.stand = k; ST.pr = 0; ST.who = null; ST.iopt = null; AC && sfxSel();
}
const standRows = st => (st.sell || st.potions).length;
const standPrice = p => standsAbandoned() ? 0 : p;   // no vendor left to charge you
function standBuy() {
  const s = cur(), st = standsHere()[ST.stand];
  if (st.potions) {   /* nobody can buy here: the vendor just laughs at your empty pockets */
    const sr = st.potions[ST.pr][1];
    AC && sfxSel();
    hubSay(s.relics >= sr ? '* "...You actually have some?\n* ...Sorry, all sold out."' : potionRoast(sr));
    return;
  }
  const id = st.sell[ST.pr][0], price = standPrice(st.sell[ST.pr][1]), it = ITEMS[id];
  if (s.coins < price) { storyErr("You can't afford the " + it.name + '.'); return; }
  if (s.items.length >= MAX_ITEMS) { storyErr('Your items are full.'); return; }
  /* confirm first; NO leaves you on the stand with the same item highlighted */
  const q = standsAbandoned() ? ['Take the ' + it.name + '?'] : ['Buy the ' + it.name, 'for ' + price + ' BC?'];
  askYesNo('', q, () => standPay(id, price));
}
function standPay(id, price) {
  const s = cur(), it = ITEMS[id];
  s.coins -= price; s.items.push(id); storySave();
  if (AC) { tone(1046, T0(), .08, 'square', .1); tone(1568, T0() + .07, .12, 'square', .1); }
  storyMsg(standsAbandoned() ? 'You took the ' + it.name + '.' : 'You bought the ' + it.name + '. (-' + price + ' BC)', '#7dff3d');
}

/* ---------- items in story battles (called from script.js): food heals, weapons / armor get equipped ---------- */
const isFood = id => ITEMS[id] && ITEMS[id].type == 'food';
const battleUsable = id => isFood(id) || (ITEMS[id] && !!slotOf(id));
const battleKinds = () => [...new Set(cur().items.filter(battleUsable))];   // each kind once, in inventory order
/* battle ITEM menu lines, e.g. "Pink Pie x2", "Neon Dagger" */
function storyItemList() { const s = cur(); return battleKinds().map(id => { const n = s.items.filter(x => x == id).length; return ITEMS[id].name + (n > 1 ? ' x' + n : ''); }); }
const storyIsGear = idx => { const id = battleKinds()[idx]; return !!id && !isFood(id); };
/* take the chosen item out of the shared items (co-op takes it when picked, gives it back if the pick is undone) */
function storyTake(idx) { const s = cur(), id = battleKinds()[idx]; if (!id) return null; s.items.splice(s.items.indexOf(id), 1); return { id, ...ITEMS[id] }; }
/* player pi equips a weapon / armor mid-fight; the old one goes back into the shared items */
function storyEquip(pi, it) {
  const s = cur(), p = s.players[pi], slot = slotOf(it.id), old = p[slot];
  p[slot] = it.id;
  if (old) s.items.push(old);
  if (AC) sfxSel();
  return (players.length == 1 ? '* You' : '* P' + (pi + 1)) + ' equipped the ' + it.name + '.';
}
/* co-op: what a picked item does when the turn plays out */
function storyUsePicked(i, t, it) { return it && !isFood(it.id) ? storyEquip(i, it) : storyFeed(i, t, it); }
function storyGiveBack(it) { if (it) cur().items.push(it.id); }
/* player i eats / feeds food to player t; returns the battle text */
function storyFeed(i, t, it) {
  const T = players[t];
  if (!it) return '* Nothing happened.';
  if (!T || T.gone) return '* The ' + it.name + ' goes to waste...';
  const was = T.down, b4 = T.hp, solo = players.length == 1, nm = 'P' + (t + 1);
  if (was) { T.down = 0; T.hp = Math.min(T.max, it.heal); T.rev = 0; } else T.hp = Math.min(T.max, T.hp + it.heal);
  sfxPie(was);
  const l1 = solo ? '* You ate the ' + it.name + '.' : t == i ? '* ' + nm + ' ate the ' + it.name + '.' : '* P' + (i + 1) + ' fed the ' + it.name + ' to ' + nm + '.';
  const l3 = was ? nm + ' gets back up!' : b4 + it.heal <= T.max ? (solo ? 'You' : nm) + ' recovered ' + it.heal + ' HP.' : (solo ? 'Your HP was maxed out.' : nm + "'s HP was maxed out.");
  return l1 + '\n' + it.eat + '\n* ' + l3;
}
function storyUseSolo(idx) { const it = storyTake(idx); return storyUsePicked(0, 0, it); }
const ITEM_OPTS = ['INFO', 'USE', 'DROP'];
function itemInfo(k) {
  const it = ITEMS[cur().items[k]];
  const kind = it.type == 'weapon' ? 'Weapon, +' + it.atk + ' ATK' : it.type == 'armor' ? 'Armor, +' + it.def + ' DEF' : it.type == 'food' ? 'Heals ' + it.heal + ' HP' : 'Item';
  AC && sfxSel();
  hubSay('* "' + it.name + '" - ' + kind + '\n* ' + (it.info || ''));
}
function dropItem(k) {
  const s = cur(), name = ITEMS[s.items[k]].name;
  askYesNo('DROP ITEM?', ['Drop the ' + name + '?'], () => {
    s.items.splice(k, 1);
    ST.pr = Math.min(ST.pr, Math.max(0, s.items.length - 1));
    ST.iopt = null;
    storySave();
    hubSay('* The ' + name + ' was thrown away.');
  });
}
function itemOption(j) {
  const k = ST.pr;
  if (j == 0) itemInfo(k);
  else if (j == 1) useItem(k);
  else dropItem(k);
}
function panelPress(c, is) {
  const s = cur(), np = s.np;
  if (ST.who) {
    if (is(L) || is(R)) { ST.who.sel = (ST.who.sel + (is(L) ? np - 1 : 1)) % np; AC && sfxSel(); }
    else if (is(OK)) (ST.who.act == 'eat' ? eatItem : equipItem)(ST.who.k, ST.who.sel);
    else if (is(NO)) { ST.who = null; AC && sfxSel(); }
    return;
  }
  if (ST.panel == 'travel') {
    const n = VILLAGE_COUNT;
    if (is(U) || is(Dn)) { ST.pr = (ST.pr + (is(U) ? n - 1 : 1)) % n; AC && sfxSel(); }
    else if (is(OK)) travelPick(ST.pr + 1);
    else if (is(NO)) { ST.panel = null; AC && sfxSel(); }
    return;
  }
  if (ST.panel == 'stand') {
    const n = standRows(standsHere()[ST.stand]);
    if (is(U) || is(Dn)) { if (n > 1) { ST.pr = (ST.pr + (is(U) ? n - 1 : 1)) % n; AC && sfxSel(); } }
    else if (is(OK)) standBuy();
    else if (is(NO)) { ST.panel = null; AC && sfxSel(); }
    return;
  }
  if (ST.iopt != null) {   // INFO / USE / DROP row for the selected item
    if (is(L) || is(R)) { ST.iopt = (ST.iopt + (is(L) ? 2 : 1)) % 3; AC && sfxSel(); }
    else if (is(OK)) itemOption(ST.iopt);
    else if (is(NO)) { ST.iopt = null; AC && sfxSel(); }
    return;
  }
  const rows = ST.panel == 'stats' ? 2 : s.items.length;
  if (is(L) || is(R)) { if (ST.panel == 'stats' && np > 1) { ST.pp = (ST.pp + (is(L) ? np - 1 : 1)) % np; ST.pr = 0; AC && sfxSel(); } }
  else if (is(U) || is(Dn)) { if (rows > 1) { ST.pr = (ST.pr + (is(U) ? rows - 1 : 1)) % rows; AC && sfxSel(); } }
  else if (is(OK)) {
    if (ST.panel == 'stats') unequip(ST.pr ? 'armor' : 'weapon');
    else if (rows) { ST.iopt = 0; AC && sfxSel(); }
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
  if (ST.scr == 'road') { if (ST.tb && (is(OK) || is(NO))) tbNext(); return; }   // travel scene: only the text box
  if (ST.scr == 'hub') {
    if (ST.tb) { if (is(OK) || is(NO)) tbNext(); return; }   // text box: finish the page, next page, close
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
  if (ST.scr == 'nobody' || ST.scr == 'road') { storyPress(OK[0], a => a === OK); return; }
  if (ST.scr == 'hub') {
    if (ST.tb) { storyPress(OK[0], a => a === OK); return; }
    if (ST.panel) { panelTap(x, y, inR); return; }
    const pick2 = (i, j) => { if (ST.i == i && ST.j == j) hubActivate(); else { ST.i = i; ST.j = j; AC && sfxSel(); } };
    const nb = hubCols(0);
    for (let j = 0; j < nb; j++) if (inR(hubBtnX(j, nb), 22, 110, 40)) { pick2(0, j); return; }
    for (let j = 0; j < 4; j++) if (inR(cardX(j), CARD_Y, CARD_W, CARD_H)) { pick2(1, j); return; }
    const stands = standsHere();
    if (stands) {
      for (let k = 0; k < stands.length; k++) if (inR(STAND_X(k) - 2, STAND_Y, 90, 90)) { pick2(2, k); return; }
      if (inR(BACK2_X - 100, BACK_Y - 22, 200, 44)) pick2(2, backCol());
    } else if (inR(W / 2 - 100, BACK_Y - 22, 200, 44)) pick2(2, 0);
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
  if (ST.iopt != null) {
    for (let j = 0; j < 3; j++) if (inR(optX(j) - 55, OPT_Y - 24, 110, 36)) {
      if (ST.iopt == j) itemOption(j); else { ST.iopt = j; AC && sfxSel(); }
      return;
    }
    ST.iopt = null; AC && sfxSel();
    return;
  }
  if (!inR(PAN.x, PAN.y, PAN.w, PAN.h)) { ST.panel = null; AC && sfxSel(); return; }
  if (ST.panel == 'travel') {
    for (let k = 0; k < VILLAGE_COUNT; k++) if (inR(PAN.x + 20, PAN.y + TRAVEL_ROW_Y + k * TRAVEL_GAP - 30, PAN.w - 40, TRAVEL_GAP)) {
      if (ST.pr == k) press(OK[0]); else { ST.pr = k; AC && sfxSel(); }
      return;
    }
    return;
  }
  if (ST.panel == 'stand') {
    const n = standRows(standsHere()[ST.stand]);
    for (let k = 0; k < n; k++) if (inR(PAN.x + 20, PAN.y + STAND_ROW_Y + k * 62 - 24, PAN.w - 40, 50)) {
      if (ST.pr == k) press(OK[0]); else { ST.pr = k; AC && sfxSel(); }
      return;
    }
    return;
  }
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
const CARD_Y = 130, CARD_W = 170, CARD_H = 300, cardX = k => 30 + k * 190;
const PAN = { x: 170, y: 90, w: 460, h: 410 };
const STAT_ROW_Y = 225, ITEM_ROW_Y = 105;
const WHO = { x: PAN.x + 30, y: PAN.y + 110, w: PAN.w - 60, h: 200 };
const whoX = (k, np) => W / 2 + (k - (np - 1) / 2) * 90;
const OPT_Y = PAN.y + PAN.h - 48, optX = j => W / 2 + (j - 1) * 120;   // INFO / USE / DROP row
const STAND_X = k => 28 + k * 100, STAND_Y = 446, BACK2_X = W / 2 + 40;  // hub stands (bottom left) and BACK beside them
const STAND_ROW_Y = 130;                                                  // first row in a stand's menu
const TRAVEL_ROW_Y = 110, TRAVEL_GAP = 52;                                // TRAVEL list rows
/* a little market stall: striped awning in the stand's color, a counter, and what it sells */
function drawStand(x, y, st, on) {
  const w = 86, cx = x + w / 2, cy = y + 40, gone = standsAbandoned();
  if (gone && st.potions) { drawNoteSpot(x, y, on); return; }
  g.fillStyle = '#2a1d14'; g.fillRect(x + 6, y + 26, w - 12, 34); g.fillStyle = '#4a3424'; g.fillRect(x + 2, y + 50, w - 4, 10);
  if (gone) g.globalAlpha = .75;   // abandoned: faded awning, nothing on the counter
  for (let k = 0; k < 6; k++) {
    g.fillStyle = k % 2 ? (gone ? '#ddd' : '#fff') : st.awn; g.beginPath();
    g.moveTo(x + k * w / 6, y + 8); g.lineTo(x + (k + 1) * w / 6, y + 8); g.lineTo(x + (k + 1) * w / 6, y + 22);
    g.arc(x + (k + .5) * w / 6, y + 22, w / 12, 0, Math.PI); g.closePath(); g.fill();
  }
  g.globalAlpha = 1;
  g.fillStyle = '#5d4a3a'; g.fillRect(x + 4, y + 8, 4, 52); g.fillRect(x + w - 8, y + 8, 4, 52);
  if (gone) {}
  else if (st.icon == 'pie') { g.fillStyle = '#ff7eb3'; g.beginPath(); g.arc(cx, cy + 4, 10, Math.PI, 0); g.fill(); g.fillStyle = '#ffd0e0'; g.fillRect(cx - 11, cy + 3, 22, 4); }
  else if (st.icon == 'blade') {   // dagger: cyan blade, white crossguard, steel grip, white pommel
    g.save(); g.translate(cx + 2, cy + 2); g.rotate(-.6);
    g.fillStyle = '#19e3ff'; g.beginPath(); g.moveTo(-2, 5); g.lineTo(-2, -5); g.lineTo(0, -11); g.lineTo(2, -5); g.lineTo(2, 5); g.closePath(); g.fill();   // pointed blade
    g.fillStyle = '#f2f2f2'; g.fillRect(-6, 5, 12, 3);
    g.fillStyle = '#5d6773'; g.fillRect(-1.5, 8, 3, 7);
    g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(0, 16.5, 2.5, 0, 7); g.fill();
    g.restore();
  }
  else { g.fillStyle = '#7dff3d'; g.beginPath(); g.arc(cx, cy + 5, 7, 0, 7); g.fill(); g.fillRect(cx - 3, cy - 6, 6, 7); g.fillStyle = '#fff'; g.fillRect(cx - 4, cy - 8, 8, 3); }
  g.strokeStyle = on ? '#ff0' : '#666'; g.lineWidth = on ? 3 : 1.5; g.strokeRect(x - 2, y + 2, w + 4, 62);
  if (on) soul(x - 14, y + 34, '#19e3ff');
  txt(st.n, cx, y + 82, 13, on ? '#ff0' : '#aaa', 'center', 0, true);
}
/* where the potion stand stood (genocide route): the vendor's note on the left, the stand's green flask broken and spilled on the right */
function drawNoteSpot(x, y, on) {
  g.save(); g.translate(x + 20, y + 44); g.rotate(-.15);
  g.fillStyle = '#e8e2c8'; g.fillRect(-12, -15, 24, 30); g.strokeStyle = '#8a8470'; g.lineWidth = 1;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-8, -9 + k * 5); g.lineTo(8, -9 + k * 5); g.stroke(); }
  g.restore();
  g.fillStyle = 'rgba(125,255,61,.55)'; g.beginPath(); g.ellipse(x + 62, y + 56, 22, 6, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(125,255,61,.8)'; g.beginPath(); g.ellipse(x + 56, y + 55, 9, 3, 0, 0, 7); g.fill();
  const fx = x + 62, fy = y + 47;
  g.fillStyle = '#7dff3d'; g.beginPath(); g.arc(fx, fy, 7, Math.PI * .15, Math.PI * 1.05); g.fill();     // bottom of the flask
  g.fillStyle = '#5fcf2a'; g.beginPath(); g.moveTo(fx - 7, fy); g.lineTo(fx - 3, fy - 4); g.lineTo(fx + 1, fy - 1); g.lineTo(fx + 5, fy - 5); g.lineTo(fx + 7, fy); g.closePath(); g.fill();   // jagged break
  g.save(); g.translate(fx + 16, fy + 4); g.rotate(1.1); g.fillStyle = '#7dff3d'; g.fillRect(-3, -6, 6, 7); g.fillStyle = '#fff'; g.fillRect(-4, -8, 8, 3); g.restore();   // the neck, rolled away
  g.fillStyle = '#7dff3d'; g.fillRect(fx - 14, fy + 6, 3, 3); g.fillRect(fx + 24, fy + 2, 2, 2);
  g.strokeStyle = on ? '#ff0' : '#333'; g.lineWidth = on ? 3 : 1; if (!on) g.setLineDash([4, 4]); g.strokeRect(x - 2, y + 2, 90, 62); g.setLineDash([]);
  if (on) soul(x - 14, y + 34, '#19e3ff');
  txt('NOTE', x + 43, y + 82, 13, on ? '#ff0' : '#aaa', 'center', 0, true);
}
function drawStandPanel() {
  const s = cur(), st = standsHere()[ST.stand], y = PAN.y, gone = standsAbandoned();
  panelBox(st.n);
  txt(gone ? '* "Take it."' : st.line, PAN.x + 30, y + 80, 15, '#bbb', 'left', PAN.w - 60, true);
  const rows = st.sell ? st.sell.map(([id, p]) => { const it = ITEMS[id]; return [it.name, standPrice(p) + ' BC', it.type == 'food' ? 'Heals ' + it.heal + ' HP' : it.type == 'weapon' ? 'Weapon, +' + it.atk + ' ATK' : 'Armor, +' + it.def + ' DEF', '#ffd23f']; })
    : st.potions.map(([n, sr, d]) => [n, sr + ' SR', d, '#7dff3d']);
  rows.forEach((r, k) => {
    const ry = y + STAND_ROW_Y + k * 62, on = ST.pr == k;
    if (on) soul(PAN.x + 30, ry - 6, '#19e3ff');
    txt('* ' + r[0], PAN.x + 50, ry, 19, on ? '#ff0' : '#fff', 'left', 0, true);
    txt(r[1], PAN.x + PAN.w - 30, ry, 17, r[3], 'right', 0, true);
    txt(r[2], PAN.x + 70, ry + 24, 13, '#888', 'left', 0, true);
  });
  txt('BEAT COINS ' + s.coins, PAN.x + 30, y + PAN.h - 48, 17, '#fff', 'left', 0, true);
  txt('SOUL RELICS ' + s.relics, PAN.x + PAN.w - 30, y + PAN.h - 48, 17, '#fff', 'right', 0, true);
  txt(gone ? 'Enter: take    X / B: leave' : 'Enter: buy    X / B: leave', W / 2, y + PAN.h - 16, 13, '#777', 'center', 0, true);
  drawMsg(PAN.y + PAN.h + 30);
}

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
  if (a.title) txt(a.title, W / 2, by + 42, 24, '#ff0', 'center', 0, true);
  a.lines.forEach((t, i) => txt(t, W / 2, by + (a.title ? 88 : 66) + i * 30, a.title ? 16 : 19, '#fff', 'center', bw - 30, true));
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

/* Soulcerer card art: locked (dim + lock), open (corrupted), spared (pure), killed (empty) */
function drawSoulCard(x, y, sc, st, open, bounce) {
  const cx = x + 85, cy = y + 88;
  if (st.k > 0 && !st.sp) return;
  if (!open) {
    g.globalAlpha = .35; drawBoss(sc.bi, cx, cy, 0, .62); g.globalAlpha = 1;
    g.fillStyle = '#aaa'; g.strokeStyle = '#aaa'; g.lineWidth = 3;
    g.beginPath(); g.arc(cx, cy - 2, 8, Math.PI, 0); g.stroke(); g.fillRect(cx - 11, cy - 2, 22, 17);
  } else drawBoss(sc.bi, cx, cy, bounce, .62, !!st.sp);
}

function drawHub() {
  const s = cur(), v = VILLAGES[s.village], bounce = Math.abs(Math.sin(Date.now() / 230));
  const btns = hubBtns();
  btns.forEach((b, j) => {
    const on = ST.i == 0 && ST.j == j, x = hubBtnX(j, btns.length);
    g.strokeStyle = on ? '#ff0' : '#888'; g.lineWidth = on ? 3 : 2; g.strokeRect(x, 22, 110, 40);
    txt(b, x + 55, 49, 18, on ? '#ff0' : '#888', 'center', 0, true);
    if (b == 'TRAVEL' && newVillageReady(s)) {   // yellow "!" on the corner: the next village is open but not visited yet
      const bx = x + 104, by = 20 - bounce * 3;
      g.fillStyle = '#000'; g.beginPath(); g.arc(bx, by, 13, 0, 7); g.fill();
      g.strokeStyle = '#ff0'; g.lineWidth = 2.5; g.beginPath(); g.arc(bx, by, 13, 0, 7); g.stroke();
      txt('!', bx, by + 8, 22, '#ff0', 'center', 0, true);
    }
  });
  /* village name after the buttons, so long names (SQUARE VILLAGE) sit in front of the ITEM / SHOP borders */
  txt(v.name, W / 2, 70, 40, '#fff', 'center', 0, true);
  txt('VILLAGE ' + s.village, W / 2, 102, 16, '#aaa', 'center', 0, true);
  if (v.soon) for (let k = 0; k < 4; k++) {   // no fights here yet
    const x = cardX(k), on = ST.i == 1 && ST.j == k;
    g.strokeStyle = on ? '#19e3ff' : '#444'; g.lineWidth = on ? 5 : 2; g.strokeRect(x, CARD_Y, CARD_W, CARD_H);
    txt('???', x + 85, CARD_Y + 100, 40, '#555', 'center', 150, true);
    txt('???', x + 85, CARD_Y + 205, 22, on ? '#ff0' : '#888', 'center', 150, true);
    txt('COMING SOON', x + 85, CARD_Y + 277, 16, '#555', 'center', 150, true);
  }
  v.foes.forEach((f, k) => {
    const x = cardX(k), on = ST.i == 1 && ST.j == k, st = s.foes[f.id], B = BOSSES[f.bi], gone = st.k >= 3;
    g.strokeStyle = on ? '#19e3ff' : '#444'; g.lineWidth = on ? 5 : 2; g.strokeRect(x, CARD_Y, CARD_W, CARD_H);
    if (!gone) drawBoss(f.bi, x + 85, CARD_Y + 85, bounce, .62, !!st.sp, !st.sp && st.k == 1, !st.sp && st.k == 2);
    txt(B.n, x + 85, CARD_Y + 205, 22, gone ? '#555' : on ? '#ff0' : '#fff', 'center', 150, true);
    txt(B.d, x + 85, CARD_Y + 237, 18, gone ? '#555' : B.dc, 'center', 150);
    if (!gone) txt('FIGHT', x + 85, CARD_Y + 277, 16, on ? '#fff' : '#888', 'center', 150);
  });
  if (v.soulcerer) {
    const k = v.foes.length, x = cardX(k), on = ST.i == 1 && ST.j == k, open = soulcererOpen(s),
      sc = v.soulcerer, st = s.foes[sc.id], gone = st.k > 0 && !st.sp, dim = !open || gone;
    g.strokeStyle = on ? '#19e3ff' : '#444'; g.lineWidth = on ? 5 : 2; g.strokeRect(x, CARD_Y, CARD_W, CARD_H);
    drawSoulCard(x, CARD_Y, sc, st, open, bounce);
    txt(sc.name, x + 85, CARD_Y + 205, 15, dim ? '#555' : on ? '#ff0' : '#fff', 'center', 150, true);
    txt(open ? BOSSES[sc.bi].d : '???', x + 85, CARD_Y + 237, 18, dim ? '#555' : BOSSES[sc.bi].dc, 'center', 150, true);
    const lab = !open ? 'LOCKED' : st.sp ? 'SPARED' : gone ? '' : 'FIGHT';
    if (lab) txt(lab, x + 85, CARD_Y + 277, 16, !open ? '#555' : st.sp ? '#ffd23f' : on ? '#fff' : '#888', 'center', 150, true);
  }
  const stands = standsHere();
  if (stands) {
    stands.forEach((st, k) => drawStand(STAND_X(k), STAND_Y, st, ST.i == 2 && ST.j == k));
    drawParty(W - 110, 500, s.np, 11, 36);
    const on = ST.i == 2 && ST.j == backCol();
    if (on) soul(BACK2_X - 62, BACK_Y - 7, '#19e3ff');
    txt('BACK', BACK2_X, BACK_Y, 22, on ? '#ff0' : '#888', 'center');
  } else {
    drawParty(78, 520, s.np, 11, 36);
    backButton(ST.i == 2);
  }
  drawMsg(470);
  txt('Arrows choose    Enter / Z / A select    X / B back', W / 2, 575, 14, '#777', 'center');
  if (ST.panel == 'stats') drawStats();
  else if (ST.panel == 'item') drawItems();
  else if (ST.panel == 'stand') drawStandPanel();
  else if (ST.panel == 'travel') drawTravel();
  if (ST.tb) drawTextBox();
}
function drawTravel() {
  const s = cur(), L0 = PAN.x + 40, y = PAN.y;
  panelBox('TRAVEL');
  for (let k = 0; k < VILLAGE_COUNT; k++) {
    const n = k + 1, on = ST.pr == k, ry = y + TRAVEL_ROW_Y + k * TRAVEL_GAP, open = villageOpen(s, n), here = n == s.village;
    if (on) soul(L0 - 2, ry - 6, '#19e3ff');
    txt(n + '  ' + (open ? VILLAGES[n].name : '???'), L0 + 20, ry, 19, on ? '#ff0' : open ? '#fff' : '#555', 'left', 0, true);
    if (here) txt('YOU ARE HERE', PAN.x + PAN.w - 40, ry, 14, '#19e3ff', 'right', 0, true);
    else if (!open) txt('LOCKED', PAN.x + PAN.w - 40, ry, 14, '#555', 'right', 0, true);
  }
  txt('Enter: travel    X / B: close', W / 2, y + PAN.h - 16, 13, '#777', 'center', 0, true);
  drawMsg(PAN.y + PAN.h + 30);
}
/* travel scene: a black screen, the party walking, and the text box */
function drawRoad() {
  const s = cur(), t = Date.now() / 1000;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#333'; g.lineWidth = 2; g.setLineDash([18, 14]); g.lineDashOffset = -t * 60;
  g.beginPath(); g.moveTo(0, 330); g.lineTo(W, 330); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0;
  for (let k = 0; k < s.np; k++) {
    g.fillStyle = PCOL[k]; shp(W / 2 + (k - (s.np - 1) / 2) * 50, 300 - Math.abs(Math.sin(t * 5 + k)) * 8, 14, k); g.fill();
  }
  if (ST.tb) drawTextBox();
}
function drawTextBox() {
  const x = 40, y = 448, w = W - 80, h = 128, t = ST.tb.text, n = Math.max(0, tbChars());
  g.fillStyle = '#000'; g.fillRect(x, y, w, h);
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(x, y, w, h);
  t.slice(0, n).split('\n').forEach((l, i) => txt(l, x + 24, y + 42 + i * 34, 22, '#fff', 'left', 0, true));
  if (n >= t.length && Math.floor(Date.now() / 400) % 2) txt('Enter / Z / Space / A', x + w - 16, y + h - 12, 14, '#888', 'right');
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
  txt('HP  ' + pl.hp + ' / ' + maxHp(s.lv), L0, y + 175, 18, '#fff', 'left', 0, true);
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
    const it = ITEMS[id], tag = it.type == 'weapon' ? '+' + it.atk + ' ATK' : it.type == 'armor' ? '+' + it.def + ' DEF' : it.type == 'food' ? '+' + it.heal + ' HP' : '';
    txt('* ' + it.name, L0 + 20, ry, 18, on ? '#ff0' : '#fff', 'left', 0, true);
    if (tag) txt(tag, PAN.x + PAN.w - 40, ry, 15, '#aaa', 'right', 0, true);
  });
  if (s.items.length) ITEM_OPTS.forEach((o, j) => {
    const on = ST.iopt == j, act = ST.iopt != null, x = optX(j);
    if (on) soul(x - 46, OPT_Y - 6, '#19e3ff');
    txt(o, x, OPT_Y, 20, on ? '#ff0' : act ? '#fff' : '#555', 'center', 90, true);
  });
  txt(s.items.length + ' / ' + MAX_ITEMS, PAN.x + PAN.w - 24, y + PAN.h - 16, 14, '#888', 'right', 0, true);
  txt(!s.items.length ? 'X / B: close' : ST.iopt != null ? 'Left / Right choose    X / B: back' : 'Enter: choose    X / B: close',
    W / 2, y + PAN.h - 16, 13, '#777', 'center', 0, true);
  if (ST.who) drawWho();
  drawMsg(PAN.y + PAN.h + 30);
}
function drawWho() {
  const s = cur(), id = s.items[ST.who.k];
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h);
  g.fillStyle = '#000'; g.fillRect(WHO.x, WHO.y, WHO.w, WHO.h);
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(WHO.x, WHO.y, WHO.w, WHO.h);
  txt(ST.who.act == 'eat' ? 'WHO EATS IT?' : 'WHO EQUIPS IT?', W / 2, WHO.y + 34, 20, '#ff0', 'center', 0, true);
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
  else if (ST.scr == 'road') drawRoad();
  if (ST.ask) drawAsk();
}
