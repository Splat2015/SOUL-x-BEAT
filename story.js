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
const itemsFull = s => s.items.length >= MAX_ITEMS;
/* Storage Boxes (bought in Daniel's shop, s.boxes 0-2): separate boxes of 8 items each (s.box[0], s.box[1]),
   opened from the ITEM panel's tabs. They don't add item slots and can't be opened in battle. */
const BOX_CAP = 8, MAX_BOXES = 2, BOX_TABS = ['BOX I', 'BOX II'], BOX_NAMES = ['Box I', 'Box II'];
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
        '* For a moment, you couldn\'t help but\n  feel a bit of guilt.',
        '* VILLAGE 1 COMPLETE.',
      ],
      /* killed on the genocide route (every mini boss killed 3 times) */
      genoKilled: [
        '* The Star Soulcerer crumbles to dust.',
        '* Its light goes out.',
        '* The whole village is silent now.',
        '* You feel nothing.',
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
  /* Square Village: still being built (soon = true), so the empty card slots show "???" / COMING SOON and its
     genocide route / corrupted music stay off until all 8 mini bosses exist. Soul Relics start here. */
  2: {
    name: 'SQUARE VILLAGE', tname: 'Square Village',
    shop: false, soon: true, slots: 9,   // 8 mini bosses + the Soulcerer: small cards, 5 on top and 4 (centred) below
    foes: [
      { id: 'racer', bi: 4, def: 6, bc: 25, exp: 60, sr: 2 },
      { id: 'tanga', bi: 5, def: 7, bc: 27, exp: 70, sr: 2 },
      { id: 'slug', bi: 6, def: 5, bc: 20, exp: 75, sr: 2 },   // $lug Thug (SR doubles if the Salt ACT finishes him)
      { id: 'neutlin', bi: 7, def: 7, bc: 30, exp: 80, sr: 2 },   // Neutlin: DEF 7, 30 BC, 80 EXP, 2 SR (all final)
      { id: 'pancy', bi: 8, def: 7, bc: 30, exp: 85, sr: 2 },   // Pancy: DEF 7, 30 BC, 85 EXP, 2 SR (all final)
    ],
    soulcerer: null,
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
  /* Square Village: no vendors, just the Slap Strap lying bottom left (pickup: the item id; gone once taken, see s.seen.strap) */
  2: [
    { n: 'STRAP', pickup: 'slap', seen: 'strap' },
    { n: 'WELL', well: 1 },   // the well (well.js): Lucaster is trapped inside
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
const FOE_IDS = ['prism', 'pulsar', 'maw', 'star', 'racer', 'tanga', 'slug', 'neutlin', 'pancy'];

/* Items. type: 'weapon' | 'armor' | 'food' | 'potion' | 'trinket'. Shop stock and prices are in shop.js. */
/* dur = DUR (durability): a weapon loses 1 per attack, armor loses 1 per hit taken; at 0 it breaks (slot becomes none). */
const ITEMS_RAW = {
  wsword: { name: 'Wooden Sword', type: 'weapon', atk: 1, dur: 30, info: 'A sturdy practice sword carved from oak.' },
  wshield: { name: 'Wooden Shield', type: 'armor', def: 1, dur: 50, info: "A light shield. It's seen a few dents." },
  ndagger: { name: 'Neon Dagger', type: 'weapon', atk: 3, dur: 40, bar: 1.3, info: 'It hums with a faint electric glow.' },   // bar: attack bar speed (1 = normal)
  slap: { name: 'Slap Strap', type: 'weapon', atk: 5, dur: 50, bar: .9, lines: 4, info: "It's tight, secure, and perfect for beatings." },   // lines: 4 white lines to stop in the center (like Undertale's Burnt Pan); found in Square Village
  rvisor: { name: 'Radiant Visor', type: 'armor', def: 3, dur: 60, info: 'Shiny enough to see your reflection.' },
  pcandy: { name: 'Pure Candy', type: 'food', heal: 8, info: 'It tastes like Paradise.', eat: "* It's sweet and sparkly." },
  ppie: { name: 'Pink Pie', type: 'food', heal: 12, info: 'A slice of pink pie. Smells... odd.', eat: '* It tastes a little... Corrupted?' },
  tslinger: { name: 'Twinkle Slinger', type: 'weapon', atk: 7, dur: 45, aim: 1, info: "It's a slingshot that shoots starlight. Aim for the center." },   // Daniel's shop; aim: the Bullseye attack (a crosshair on a target instead of the white bar, script.js)
  wcloak: { name: 'Wistful Cloak', type: 'armor', def: 5, dur: 40, info: "It's a bit worn down, it almost gives feelings of dread and longing." },   // Daniel's shop
  smelon: { name: 'Squaremelon', type: 'food', heal: 6, sp: 9, info: 'Grown in a box. Tastes like summer.', eat: "* It's crunchy and perfectly cubed." },   // Daniel's shop
  jerky: { name: 'Beat Jerky', type: 'food', heal: 15, sp: 0, info: 'Chewy strips of meat, pounded flat to the beat.', eat: '* Chewy. Very chewy. It has a nice rhythm.' },   // Daniel's shop
  sshades: { name: 'Shattered Shades', type: 'armor', def: 3, dur: 30, info: "Cracked and blurry. You can hardly see out of these things." },   // left behind by $lug Thug (killed 3 times)
  /* Potions (Lucaster, the well in Square Village). Drunk in battle or in the village; cost = SP the drinker pays.
     fx: what it does in a fight (in the village it waits for the next fight): regen = +10 HP at the end of each of 3 turns, atk / def = +3 for that fight. */
  spot: { name: 'SP Potion', type: 'potion', sp: 10, short: 'Recovers 10 SP', info: 'Recovers 10 SP.' },
  hppot: { name: 'HP Potion', type: 'potion', cost: 10, fx: 'regen', short: 'Heals 10 HP for 3 turns', info: 'Costs 10 SP to drink. Heals 10 HP at the end of each of the next 3 turns.' },
  atkpot: { name: 'ATK Potion', type: 'potion', cost: 15, fx: 'atk', short: '+3 ATK for one battle', info: 'Costs 15 SP to drink. Raises ATK by 3 for one battle.' },
  defpot: { name: 'DEF Potion', type: 'potion', cost: 15, fx: 'def', short: '+3 DEF for one battle', info: 'Costs 15 SP to drink. Raises DEF by 3 for one battle.' },
  /* Skill Trinkets: abilities that go in the box next to equipped weapon / armor (either slot). col = the aura color of an enemy carrying one. */
  poison: { name: 'Poison Trinket', type: 'trinket', col: '#b45bff', info: 'Your hits poison the enemy: 6 damage at the end of each turn, for 3 turns.' },
  speed: { name: 'Speed Trinket', type: 'trinket', col: '#2a45e0', info: 'The wearer moves 20% faster.' },
  regen: { name: 'Regen Trinket', type: 'trinket', col: '#1fbf6b', info: 'The wearer heals 2 HP at the end of every turn.' },
  thorns: { name: 'Thorns Trinket', type: 'trinket', col: '#d6203a', info: 'Whenever the wearer gets hit, the enemy takes 2 damage.' },
};
const TRINKET_IDS = ['poison', 'speed', 'regen', 'thorns'];
const POT_HEAL = 10, POT_TURNS = 3, POT_BOOST = 3;   // HP Potion: +10 HP x 3 turns; ATK / DEF Potions: +3 for one battle
const REGEN_HP = 2, FOE_REGEN = 3, THORNS_DMG = 2, FOE_THORNS = 1;   // player Regen / enemy Regen per turn; player Thorns / enemy Thorns damage
const TRINKET_AURA = .1, POISON_DMG = 6, POISON_TURNS = 3, SPEED_MUL = 1.2;   // 10% of enemies carry a trinket (never a Soulcerer)
const THEFT_CHANCE = .3;   // each lost story fight: 30% chance one carried item is stolen (see storyLost)
/* A weapon / armor you own is stored as its id plus its current DUR, e.g. 'ndagger:37' (a plain 'ndagger' = full DUR).
   It travels that way between the slots, the shared items, drops and the fight snapshot, so its wear is never lost.
   ITEMS[...] understands both forms (it ignores the ":37" part). */
const ITEMS = new Proxy(ITEMS_RAW, { get: (t, k) => { if (typeof k != 'string') return t[k]; const b = k.split(':')[0]; return Object.prototype.hasOwnProperty.call(t, b) ? t[b] : undefined; } });
const baseId = e => String(e).split(':')[0];
const durOf = e => { const it = ITEMS[e]; if (!it || !it.dur) return 0; const d = String(e).split(':')[1]; return d == null || d === '' ? it.dur : +d; };
/* a Skill Trinket on a piece of gear is the third part: 'ndagger:37:poison' (DUR is then always written out) */
const trinketOf = e => { if (!e) return null; const t = String(e).split(':')[2]; return t && ITEMS[t] && ITEMS[t].type == 'trinket' ? t : null; };
const withTrinket = (e, t) => okItem(baseId(e) + ':' + durOf(e) + (t ? ':' + t : ''));   // t = null takes the trinket off
const starterPlayer = () => ({ weapon: 'wsword', armor: 'wshield' });

/* Stats work like Undertale, extended to a max LV of 30.
   EXP_TABLE[lv-1] = total EXP needed to reach that LV. */
const MAX_LV = 30;
const EXP_TABLE = [0, 10, 30, 70, 120, 200, 300, 500, 800, 1200, 1700, 2500, 3500, 5000, 7000, 10000,
  15000, 25000, 50000, 70000, 95000, 125000, 160000, 200000, 250000, 310000, 380000, 460000, 550000, 650000];
const lvFromExp = exp => { let lv = 1; while (lv < MAX_LV && exp >= EXP_TABLE[lv]) lv++; return lv; };
const maxHp = lv => 16 + 4 * lv;
/* SP (stamina/skill points): each dash in a story fight costs 1; 0 SP = no dashing. 30 at LV1, +4 per LV.
   Carries between fights like HP, +4 after every won fight; food gives back half its HP as SP. */
const maxSp = lv => 26 + 4 * lv, SP_PER_FIGHT = 4;
const foodSp = it => it.sp != null ? it.sp : Math.floor(it.heal / 2);   // it.sp overrides (Squaremelon 9, Beat Jerky 0)
const foodTxt = it => 'Heals ' + it.heal + ' HP' + (foodSp(it) ? ', +' + foodSp(it) + ' SP' : '');
const baseAtk = lv => 2 * (lv - 1);
const baseDef = lv => Math.floor((lv - 1) / 4);
const itemAtk = id => (ITEMS[id] && ITEMS[id].atk) || 0;
const itemDef = id => (ITEMS[id] && ITEMS[id].def) || 0;

const ST = {
  scr: 'slots',   // 'slots' | 'players' | 'hub' | 'nobody' | 'road' | 'shops' (pick a shop) | 'shop1' (Daniel's shop; see shop.js)
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
  breaks: [],     // "Your Wooden Sword broke..." texts waiting for the end of the turn
  poison: 0,      // turns of poison left on the enemy (Poison Trinket)
  thornsOut: 0, thornsTaken: {},   // damage dealt to the enemy / to attackers by Thorns this turn (shown at the end of the turn)
  lst: null,      // list dialog (equip a trinket / make room for one): { title, rows, i, pick, cancel }
  nbT: 0,         // "But nobody came" text start time
  msg: '', msgT: 0, msgCol: '#fff',
  last: 0, sinceSave: 0,
  saves: [null, null, null],
};

/* ---------- saves (localStorage, separate key from settings) ---------- */
const nInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= (max == null ? Infinity : max);
const okItem = (id, type) => {
  if (typeof id != 'string') return null;
  const [b, d, t] = id.split(':'), it = ITEMS[b];
  if (!it || (type && it.type != type)) return null;
  if (!it.dur) return b;
  const n = nInt(+d, 1, it.dur) ? +d : it.dur, tr = t && ITEMS[t] && ITEMS[t].type == 'trinket' ? t : null;
  return tr ? b + ':' + n + ':' + tr : n < it.dur ? b + ':' + n : b;   // full DUR with no trinket is just the plain id
};
/* Each player keeps their own current HP; the max is shared (from the party's LV). */
function cleanPlayer(p, max, hp, maxS) {
  if (!p || typeof p != 'object') p = starterPlayer();
  return {
    weapon: 'weapon' in p ? okItem(p.weapon, 'weapon') : 'wsword',
    armor: 'armor' in p ? okItem(p.armor, 'armor') : 'wshield',
    hp: nInt(p.hp, 1, max) ? p.hp : hp,
    sp: nInt(p.sp, 0, maxS) ? p.sp : maxS,   // older saves start with full SP
    next: cleanNext(p.next),   // potions drunk in the village, used up in the next fight: { regen, atk, def }
  };
}
function cleanNext(o) {
  if (!o || typeof o != 'object') return null;
  const r = { regen: nInt(o.regen, 0, POT_TURNS) ? o.regen : 0, atk: o.atk ? POT_BOOST : 0, def: o.def ? POT_BOOST : 0 };
  return r.regen || r.atk || r.def ? r : null;
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
    foes[id] = { k: nInt(f.k, 0, 3) ? f.k : 0, sp: f.sp ? 1 : 0, st: Array.isArray(f.st) ? f.st.filter(t => ITEMS[t] && ITEMS[t].type == 'trinket').slice(0, 8) : [] };   // st: Skill Trinkets it stole from you (it carries them until spared / killed)
  });
  const ps = Array.isArray(s.players) ? s.players : [];
  const all = [...cleanItems(s.items), ...ps.slice(0, s.np).flatMap(p => cleanItems(p && p.items))], items = all.slice(0, MAX_ITEMS);
  const boxes = nInt(s.boxes, 0, MAX_BOXES) ? s.boxes : 0;
  const box = [0, 1].map(k => k < boxes ? cleanItems(Array.isArray(s.box) ? s.box[k] : null).slice(0, BOX_CAP) : []);
  all.slice(MAX_ITEMS).forEach(e => { const b = box.find((x, k) => k < boxes && x.length < BOX_CAP); if (b) b.push(e); });   // extra items (from when boxes added slots) go into the boxes
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
    players: [...Array(s.np)].map((_, k) => cleanPlayer(ps[k], maxHp(lv), oldHp, maxSp(lv))),
    items,   // shared party inventory (item ids)
    boxes,   // Storage Boxes bought in Daniel's shop (0-2)
    box,     // what's in them: [Box I items, Box II items], 8 each
    seen: cleanSeen(s.seen),   // one-time events already shown, e.g. { geno1: 1 }
    stock: cleanStock(s.stock),   // abandoned-stand items taken so far, e.g. { pcandy: 2 }
    well: cleanWell(s.well),   // the well in Square Village (well.js)
    held: Array.isArray(s.held) ? s.held.map(t => okItem(t)).filter(Boolean).slice(0, 8) : [],   // items waiting for an item slot (dropped trinkets, a removed player's gear)
    left: cleanLeft(s.left, maxHp(lv), maxSp(lv)),   // HP / SP of removed players by slot ("2" = P3), given back when that slot is added again
    thefts: Array.isArray(s.thefts) ? s.thefts.map(t => okItem(t)).filter(Boolean).slice(0, 20) : [],   // stolen items not yet announced ("* Your X was stolen." back in the village)
  };
}
function cleanLeft(o, max, maxS) {
  const r = {};
  if (o && typeof o == 'object') for (let k = 1; k < 4; k++) { const e = o[k]; if (e && nInt(e.hp, 1, max) && nInt(e.sp, 0, maxS)) r[k] = { hp: e.hp, sp: e.sp }; }
  return r;
}
/* the well: st 0 = no wish yet, 1 = relic tossed (shouting heard), 2 = won a fight since (Lucaster talks next), 3 = met him;
   stock = potions he still sells; bucket = 1 while his HP Potion waits in the raised bucket (items were full) */
function cleanWell(o) {
  o = o && typeof o == 'object' ? o : {};
  return { st: nInt(o.st, 0, 3) ? o.st : 0, stock: nInt(o.stock, 0, 5) ? o.stock : 5, bucket: o.bucket ? 1 : 0 };
}
function cleanStock(o) {
  const r = {};
  if (o && typeof o == 'object') for (const k in o) if (ITEMS[k] && nInt(o[k], 1, 99)) r[k] = o[k];
  return r;
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
const villageGone = s => { const v = s && VILLAGES[s.village]; return !!v && !v.soon && v.foes.length > 0 && v.foes.every(f => s.foes[f.id].k >= 3); };
function updStoryMusic() {
  /* silent for good once the village's Soulcerer is beaten (spared or killed) */
  const want = S == 'story' && (ST.scr == 'hub' || ST.scr == 'nobody' || inShop()) && villageGone(cur()) && !cur().seen['done' + cur().village] ? 'corrupted' : null;
  if (want) playTrack(want);
  else if (MP3.id == 'corrupted' || MP3.want == 'corrupted') stopTrack();   // also cancels a song still loading
}

/* ---------- playtime: counts inside a file (hub, empty battles, story fights) ---------- */
function tickPlaytime() {
  const now = performance.now(), dt = Math.min(.25, Math.max(0, (now - (ST.last || now)) / 1000));
  ST.last = now;
  if (ST.msgT > 0) ST.msgT -= dt;
  const inFile = ST.fight || (S == 'story' && (ST.scr == 'hub' || ST.scr == 'nobody' || ST.scr == 'road' || inShop()));
  const s = inFile && cur();
  if (!s) return;
  s.time += dt; ST.sinceSave += dt;
  if (ST.sinceSave >= 5) storySave();
}
(function storyTick() { requestAnimationFrame(storyTick); try { tickPlaytime(); updStoryMusic(); } catch (e) { console.error(e); } })();

/* ---------- story battles (called from script.js) ---------- */
const storyFighting = () => !!ST.fight;
const villageFoes = v => [...v.foes, v.soulcerer].filter(Boolean);   // mini bosses + the Soulcerer (if the village has one yet)
const fightFoe = () => ST.fight && villageFoes(VILLAGES[cur().village]).find(f => f.id == ST.fight.id);
/* Genocide route for a village: every mini boss killed 3 times */
const genoRoute = s => villageGone(s);
/* a foe's DEF for this file's route (the Soulcerer is tougher on the genocide route) */
const foeDef = (s, f) => Math.max(0, (f.genoDef != null && genoRoute(s) ? f.genoDef : f.def) - (f.id == 'neutlin' ? neutDefDrop : 0));   // Neutlin's Tug Hood lowers its DEF for the rest of the fight
const soulcererDone = s => { const f = s.foes[VILLAGES[s.village].soulcerer.id]; return f.k > 0 || f.sp; };
function restoreFightSnap() {
  const s = cur(), f = ST.fightItems;
  s.items = f.items.slice();
  s.held = (f.held || []).slice();
  s.players.forEach((p, k) => { if (f.gear[k]) [p.weapon, p.armor] = f.gear[k]; });
}
/* Battle start: each player's bar gets the party's max HP and their saved current HP. */
function storySetup(ps) {
  const s = cur(), max = maxHp(s.lv);
  ST.breaks = []; ST.poison = 0; ST.thornsOut = 0; ST.thornsTaken = {};
  /* items and equipment: remember them at the start of a fight; RETRY after a game over starts again with the same ones */
  if (ST.fightItems) restoreFightSnap();
  else {
    ST.fightItems = { items: s.items.slice(), gear: s.players.map(p => [p.weapon, p.armor]), held: s.held.slice(), pot: s.players.map(p => p.next) };
    s.players.forEach(p => { p.next = null; });   // potions drunk in the village: used by this fight (and its RETRYs)
  }
  ST.pot = ps.map((_, k) => ({ regen: 0, atk: 0, def: 0, ...(ST.fightItems.pot[k] || {}) }));   // potion effects this fight, per player
  ps.forEach((p, k) => { p.max = max; p.hp = Math.max(1, Math.min(max, s.players[k].hp)); p.spMax = maxSp(s.lv); p.sp = Math.max(0, Math.min(p.spMax, s.players[k].sp)); });
}
/* Your hit: timing damage + ATK (LV + weapon) - boss DEF, never below 1. */
function storyHit(k, d) {
  if (!ST.fight || d <= 0) return d;
  const s = cur(), pl = s.players[k] || s.players[0];
  if (ST.fight.tr == 'speed' && Math.random() < FOE_DODGE) return 0;   // a Speed enemy dodges: 0 damage, and the weapon doesn't hit anything so it costs no DUR (and no poison)
  if (ST.fight.tr == 'thorns' && players[k] && players[k].hp > 1) { players[k].hp -= FOE_THORNS; ST.thornsTaken[k] = (ST.thornsTaken[k] || 0) + FOE_THORNS; }   // a Thorns enemy pricks whoever lands a hit (never knocks them out)
  const dmg = Math.max(1, d + baseAtk(s.lv) + itemAtk(pl.weapon) + potOf(k, 'atk') - foeDef(s, fightFoe()));   // + ATK Potion
  if (hasTrinket(pl, 'poison')) ST.poison = POISON_TURNS;   // a Poison Trinket in either slot: every hit (re)poisons for 3 turns
  storyWear(k, 'weapon');   // every attack you actually press costs the weapon 1 DUR (after this hit's damage is worked out)
  return dmg;
}
/* Enemies carrying a trinket get its ability: Poison = its hits poison the player (3 damage at the end of each of 3 turns, never below 1 HP);
   Speed = each attack you press has a 15% chance to be dodged. */
const FOE_POISON_DMG = 3, FOE_DODGE = .15;
const FOE_NAMES = { prism: 'Prism', pulsar: 'Pulsar', maw: 'Maw', star: 'The Star Soulcerer', racer: 'Racer', tanga: 'Tanga', slug: '$lug Thug', neutlin: 'Neutlin', pancy: 'Pancy' };
const storyDodgeMsg = () => '* ' + (ST.fight && FOE_NAMES[ST.fight.id] || 'It') + ' dodged!';
function storyFoePoison(p) { if (ST.fight && ST.fight.tr == 'poison') p.pois = POISON_TURNS; }   // called when a hit lands on player p
/* Thorns Trinket: when a hit lands on a wearer, the enemy takes 2 damage right away (the text comes at the end of the turn) */
function storyThorns(p) {
  const pl = cur().players[p.i] || cur().players[0];
  if (!hasTrinket(pl, 'thorns') || bhp <= 0) return;
  bhp = Math.max(0, bhp - THORNS_DMG); ST.thornsOut += THORNS_DMG;
}
const hasTrinket = (pl, t) => trinketOf(pl.weapon) == t || trinketOf(pl.armor) == t;
/* Speed Trinket: the wearer's walking speed multiplier (the dash is left alone) */
function storySpeed(k) { const pl = cur().players[k] || cur().players[0]; return hasTrinket(pl, 'speed') ? SPEED_MUL : 1; }
/* End of a turn (after the dodge): poison ticks. Returns the text boxes to show before the boss's line; may leave the boss at 0 HP. */
function storyTurnEnd() {
  const out = [], solo = players.length == 1;
  if (ST.thornsOut > 0) { out.push('* The thorns deal ' + ST.thornsOut + ' damage.'); ST.thornsOut = 0; }
  Object.keys(ST.thornsTaken).forEach(k => { out.push('* ' + (solo ? 'You were' : 'P' + (+k + 1) + ' was') + ' pricked by the thorns for ' + ST.thornsTaken[k] + '.'); });
  ST.thornsTaken = {};
  if (ST.poison > 0) {
    ST.poison--;
    bhp = Math.max(0, bhp - POISON_DMG);
    out.push('* The poison deals ' + POISON_DMG + ' damage.');
  }
  players.forEach((p, i) => {   // players poisoned by a Poison enemy
    if (!(p.pois > 0) || p.down || p.gone) return;
    p.pois--;
    const dmg = Math.min(FOE_POISON_DMG, p.hp - 1);   // never knocks anyone out
    if (dmg > 0) { p.hp -= dmg; out.push('* ' + (players.length > 1 ? 'P' + (i + 1) + ' took' : 'You took') + ' ' + dmg + ' poison damage.'); }
  });
  /* Regen: wearers heal 2 HP; a Regen enemy heals 3 HP (never past max, and not if it is already beaten) */
  const s = cur();
  players.forEach((p, i) => {
    const pl = s.players[i] || s.players[0];
    if (!hasTrinket(pl, 'regen') || p.down || p.gone || p.hp >= p.max) return;
    const g2 = Math.min(REGEN_HP, p.max - p.hp); p.hp += g2;
    out.push('* ' + (solo ? 'You recovered ' : 'P' + (i + 1) + ' recovered ') + g2 + ' HP.');
  });
  /* HP Potion: +10 HP at the end of each of its 3 turns */
  players.forEach((p, i) => {
    const P = ST.pot && ST.pot[i];
    if (!P || !(P.regen > 0) || p.down || p.gone) return;
    P.regen--;
    if (p.hp >= p.max) return;
    const g4 = Math.min(POT_HEAL, p.max - p.hp); p.hp += g4;
    out.push('* ' + (solo ? 'You recovered ' : 'P' + (i + 1) + ' recovered ') + g4 + ' HP.');
  });
  if (ST.fight.tr == 'regen' && bhp > 0 && bhp < BO.hp) {
    const g3 = Math.min(FOE_REGEN, BO.hp - bhp); bhp += g3;
    out.push('* ' + (FOE_NAMES[ST.fight.id] || 'It') + ' recovered ' + g3 + ' HP.');
  }
  return out.concat(storyBreaks());
}
/* DUR: take 1 off player k's weapon / armor. At 0 it breaks: the slot becomes none and the text waits in ST.breaks
   (shown at the end of the turn, before the boss's line; a win shows it under the win text). Only in story fights. */
function storyWear(k, slot) {
  if (!ST.fight) return;
  const s = cur(), i = s.players[k] ? k : 0, pl = s.players[i], e = pl[slot];
  if (!e) return;
  const d = durOf(e) - 1;
  const tr = trinketOf(e);
  if (d > 0) { pl[slot] = okItem(baseId(e) + ':' + d + (tr ? ':' + tr : '')); return; }
  pl[slot] = null;
  ST.breaks.push((s.np > 1 ? 'P' + (i + 1) + "'s " : 'Your ') + ITEMS[e].name + ' broke...');
  if (tr) { s.held.push(tr); ST.breaks.push('The ' + ITEMS[tr].name + ' came loose.'); }   // goes to your items after the fight
}
/* the pending "broke..." texts as separate text boxes (one each), cleared once taken */
function storyBreaks() { const b = ST.breaks.map(t => '* ' + t); ST.breaks = []; return b; }
/* how many white lines player k's weapon makes you stop in the center (1 normally, 4 for the Slap Strap) */
function storyBarLines(k) {
  if (!ST.fight) return 1;
  const pl = cur().players[k] || cur().players[0], w = ITEMS[pl.weapon];
  return (w && w.lines) || 1;
}
/* How fast player k's white attack bar moves (their weapon's "bar" value; 1 = normal speed) */
function storyBarSpeed(k) {
  if (!ST.fight) return 1;
  const pl = cur().players[k] || cur().players[0], w = ITEMS[pl.weapon];
  return (w && w.bar) || 1;
}
/* player k's weapon uses the Bullseye attack (Twinkle Slinger) instead of the white bar */
function storyAims(k) {
  if (!ST.fight) return false;
  const pl = cur().players[k] || cur().players[0], w = ITEMS[pl.weapon];
  return !!(w && w.aim);
}
/* potion effect of player k in this fight ('atk' / 'def' bonus) */
const potOf = (k, f) => (ST.fight && ST.pot && ST.pot[k] && ST.pot[k][f]) || 0;
/* Damage taken: boss damage - DEF (LV + armor), never below 1.
   The Soulcerer hits for 7 on the genocide route and 5 on pacifist / neutral (2 less). */
function storyTaken(k, d) {
  if (!ST.fight) return d;
  const s = cur(), pl = s.players[k] || s.players[0];
  const sc = VILLAGES[s.village].soulcerer;
  if (sc && ST.fight.id == sc.id && !genoRoute(s)) d -= 2;
  return Math.max(1, d - baseDef(s.lv) - itemDef(pl.armor) - potOf(k, 'def'));   // - DEF Potion
}
/* $lug Thug's lucky gold coins (Make It Rain): +1 Beat Coin each, for the whole party, kept even if the fight is lost */
function storyBonusCoin() {
  if (!ST.fight) return;
  cur().coins += 1;
}
/* Extra flavor lines for a story fight (added to the boss's normal ones, not the low-HP ones).
   $lug Thug: while Racer can still be fought (not killed 3 times), Racer heckles him from the corner.
   Tanga: while Prism can still be fought, he cheers her on. */
function storyExtraFl() {
  if (!ST.fight) return [];
  const s = cur(), r = s.foes.racer, p = s.foes.prism;
  if (ST.fight.id == 'slug' && r && r.k < 3) return ["* Racer laughs at $lug's sluggishness in the corner.\n* $lug Thug silently glares at him."];
  /* Tanga: while Prism (Star Village) can still be fought, he cheers for her from far away */
  if (ST.fight.id == 'tanga' && p && p.k < 3) return ['* Prism cheers for Tanga from far away.\n* Tanga almost appears to be flattered.'];
  return [];
}
/* $lug Thug's Pay Up ACT: spend Beat Coins. Returns false if the party can't afford it. */
function storyPay(bc) {
  const s = cur();
  if (!ST.fight || s.coins < bc) return false;
  s.coins -= bc;
  return true;
}
/* Save each player's HP after the fight (downed players come back with a few HP). */
function keepHp(gain, spGain) {
  const s = cur(), max = maxHp(s.lv), maxS = maxSp(s.lv);
  players.forEach((p, k) => {
    if (!s.players[k]) return;
    const hp = p.down || p.hp <= 0 ? DOWNED_HP : p.hp;
    s.players[k].hp = Math.max(1, Math.min(max, hp + (gain || 0)));
    s.players[k].sp = Math.max(0, Math.min(maxS, (p.sp == null ? maxS : p.sp) + (spGain || 0)));   // dashes stay spent
  });
}
/* Battle won: sp = spared. Records the result, gives rewards, returns the win text. */
function storyWin(sp) {
  const s = cur(), foe = fightFoe(), f = foe && s.foes[foe.id];
  if (!f) return '* YOU WON!';
  if (sp) f.sp = 1; else f.k = Math.min(3, f.k + 1);
  if (s.well.st == 1) s.well.st = 2;   // the well: after a finished fight, Lucaster is heard properly
  ST.fightItems = null;   // won: food eaten / gear swapped in this fight stays that way
  const v = VILLAGES[s.village], key = 'geno' + s.village, isSoul = foe === v.soulcerer;
  if (isSoul) {
    /* Soulcerer beaten (one fight only): its ending scene, and the village is complete */
    ST.cut = sp ? foe.spared : (foe.genoKilled && genoRoute(s) ? foe.genoKilled : foe.killed);
    s.seen['done' + s.village] = 1;
  } else if (!sp && v.genoCut && !s.seen[key] && villageGone(s) && v.foes.every(x => !s.foes[x.id].sp)) {
    /* Genocide cutscene: the last mini boss killed for the 3rd time, and none ever spared */
    s.seen[key] = 1;
    ST.cut = v.genoCut;
  }
  const salted = !sp && saltKill;   // $lug Thug finished off with the Salt ACT: double Soul Relics
  const exp = sp ? 0 : foe.exp, bc = foe.bc, sr = foe.sr * (salted ? 2 : 1), oldLv = s.lv;
  s.exp += exp; s.coins += bc; s.relics += sr;
  s.lv = lvFromExp(s.exp);
  keepHp(maxHp(s.lv) - maxHp(oldLv), maxSp(s.lv) - maxSp(oldLv) + SP_PER_FIGHT);   // level-up raises current HP / SP by the same amount as the max; every won fight gives +4 SP
  let drop = '';
  if (ST.fight && ST.fight.tr) {   // spared or killed: you get it back in the hub
    s.held.push(ST.fight.tr);
    if (ST.fight.stolen) {   // your own stolen trinket: no longer theirs
      const st = s.foes[ST.fight.id].st, j = st.indexOf(ST.fight.tr);
      if (j >= 0) st.splice(j, 1);
      drop = '\n* You got your ' + ITEMS[ST.fight.tr].name + ' back!';
    } else drop = '\n* It dropped the ' + ITEMS[ST.fight.tr].name + '!';
  }
  storySave();
  return '* YOU WON!\n* You earned ' + exp + ' EXP, ' + bc + ' BC and ' + sr + ' SR.' + (s.lv > oldLv ? '\n* You leveled up.' : '') + drop + storyBreaks().map(t => '\n' + t).join('');   // gear that broke on the last blow
}
/* Trinkets waiting in s.held (dropped by an enemy, or shaken loose by broken gear): into your items if there is room,
   otherwise you must drop an item or the trinket itself. Called whenever the hub shows up. */
function resolveHeld() {
  const s = cur();
  if (!s.held.length) return;
  const got = [];
  while (s.held.length && !itemsFull(s)) { const t = s.held.shift(); s.items.push(t); got.push(t); }
  storySave();
  const pages = got.map(t => '* The ' + ITEMS[t].name + ' went into your items.');
  if (s.held.length) {
    pages.push('* Your items are full.\n* Make room for the ' + ITEMS[s.held[0]].name + ',\n  or drop it.');
    hubSay(pages, openSwap);
  } else if (pages.length) hubSay(pages);
}
/* ---------- thefts ----------
   Every lost story fight (RETRY or VILLAGE) has a THEFT_CHANCE chance that one random carried item is stolen: it leaves the
   fight-start items (so neither RETRY nor going back brings it back). Equipped gear and Storage Boxes are safe.
   A stolen Skill Trinket goes to the mini boss you lost to (s.foes[id].st): it carries it (aura + intro line) until you spare or
   kill it, then you get it back. Soulcerers keep nothing: what they steal is gone for good, like any other stolen item.
   The texts ("* Your X was stolen.") wait in s.thefts and show one by one when you're back in the village. */
function storyLost() {
  if (!ST.fight || !ST.fightItems || Math.random() >= THEFT_CHANCE) return;
  const s = cur(), its = ST.fightItems.items;
  if (!its.length) return;
  const e = its.splice(Math.floor(Math.random() * its.length), 1)[0], foe = fightFoe();
  s.thefts.push(e);
  if (ITEMS[e].type == 'trinket' && foe && foe !== VILLAGES[s.village].soulcerer) {
    s.foes[foe.id].st.push(e);
    if (!ST.fight.tr) { ST.fight.tr = e; ST.fight.stolen = 1; }   // RETRY: it already has it
  }
  storySave();
}
/* the battle's first flavor line gets "* Racer is holding your Poison Trinket!" */
const storyIntroExtra = () => ST.fight && ST.fight.stolen && ST.fight.tr ? '\n* ' + (FOE_NAMES[ST.fight.id] || 'It') + ' is holding your ' + ITEMS[ST.fight.tr].name + '!' : '';
/* back in the village: the theft texts, one page each, then after() */
function hubNews(after) {
  const s = cur(), t = s.thefts.splice(0);
  if (!t.length) { after(); return; }
  storySave();
  hubSay(t.map(e => '* Your ' + ITEMS[e].name + ' was stolen.'), after);
}
/* items full: choose an item to drop for the waiting trinket, or drop the trinket (no backing out) */
function openSwap() {
  const s = cur(), t = s.held[0];
  ST.panel = 'lst'; ST.pr = 0;
  ST.lst = {
    title: 'ITEMS FULL', i: 0, cancel: false,
    rows: [...s.items.map(e => ITEMS[e].name), 'DROP THE ' + ITEMS[t].name.toUpperCase()],
    pick(i) {
      if (i == s.items.length) { s.held.shift(); closeSwap('* The ' + ITEMS[t].name + ' was thrown away.'); return; }
      const nm = ITEMS[s.items[i]].name;
      askYesNo('DROP ITEM?', ['Drop the ' + nm + '?', 'The ' + ITEMS[t].name + ' takes its place.'], () => {
        s.items.splice(i, 1); s.items.push(s.held.shift());
        closeSwap('* The ' + nm + ' was thrown away.\n* The ' + ITEMS[t].name + ' went into your items.');
      });
    },
  };
}
function closeSwap(msg) {
  ST.lst = null; ST.panel = null; storySave();
  hubSay(msg, resolveHeld);   // more waiting? ask again
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
  const vv = VILLAGES[cur().village], k0 = villageFoes(vv).findIndex(f => f.id == ST.fight.id), k = vv.soulcerer && k0 == vv.foes.length ? soulIdx(vv) : k0;   // back on the card you fought (the Soulcerer's is the last slot)
  ST.fight = null;
  S = 'story'; ST.scr = 'hub'; ST.i = 1; ST.j = Math.max(0, k); ST.panel = null; ST.tb = null;
  const cut = ST.cut; ST.cut = null;
  hubNews(() => { if (cut) hubSay(cut, resolveHeld); else resolveHeld(); });   // thefts first, then any cutscene, then waiting items
  storySave();
  return true;
}
function startStoryFight(f) {
  const s = cur();
  /* tr = the Skill Trinket this enemy carries (a rare aura in battle, its color = the trinket); dropped when it is spared or killed. Soulcerers never carry one. */
  /* stolen: it carries a Skill Trinket it took from you (always shown, with an intro line), until you spare or kill it */
  const sc = f === VILLAGES[s.village].soulcerer, st = s.foes[f.id].st, stolen = !sc && st.length > 0;
  ST.fight = { id: f.id, stolen: stolen ? 1 : 0, tr: stolen ? st[0] : !sc && Math.random() < TRINKET_AURA ? TRINKET_IDS[Math.floor(Math.random() * TRINKET_IDS.length)] : null };
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
const toHub = () => { storyGo('hub', 1, 0); if (ST.slot >= 0 && cur()) hubNews(resolveHeld); };   // thefts not yet told, then trinkets still waiting from last time
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
const standsHere = () => { const s = cur(); if (VILLAGES[s.village].shop) return null; const st = STANDS[s.village]; return st ? st.filter(x => !x.seen || !s.seen[x.seen]) : null; };   // a taken pickup (Slap Strap) is no longer there
const hubCols = i => i == 0 ? hubBtns().length : i == 1 ? Math.max(4, cardCount(VILLAGES[cur().village])) : standsHere() ? standsHere().length + 1 : 1;
const backCol = () => hubCols(2) - 1;
/* Undertale-style text box at the bottom of the hub (SHOP messages, cutscenes, travel) */
/* t = one page of text, or an array of pages (each page up to 3 lines); Enter goes to the next page */
/* after (optional) runs once the last page is closed */
/* a page that starts with "~" is drawn in corrupted pink and shakes (Lucaster's "The corruption.") */
function hubSay(t, after) {
  const pages = Array.isArray(t) ? t : [t];
  ST.tb = { pages, p: 0, t0: performance.now(), after };
  tbPage();
}
function tbPage() { const raw = ST.tb.pages[ST.tb.p]; ST.tb.fx = raw[0] == '~'; ST.tb.text = ST.tb.fx ? raw.slice(1) : raw; }
function tbNext() {
  if (tbChars() < ST.tb.text.length) { ST.tb.t0 = -1e9; return; }   // first press finishes the page
  if (ST.tb.p + 1 < ST.tb.pages.length) { ST.tb.p++; tbPage(); ST.tb.t0 = performance.now(); AC && sfxSel(); }
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
  if (k >= v.foes.length && (!v.soulcerer || k != soulIdx(v))) { storyErr('Coming soon.'); return; }   // an empty slot in an unfinished village
  if (k < v.foes.length) {
    const f = v.foes[k];
    if (s.foes[f.id].k >= 3 && f.id == 'slug' && !s.seen.shades) { takeShades(); return; }   // his glasses are still lying there
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
/* $lug Thug's empty card (killed 3 times): his broken glasses can be picked up once */
function takeShades() {
  AC && sfxSel();
  hubSay(["* It seems that all that's left of him are some glasses.", '* Take them?'], () =>
    askYesNo('', ['Take the broken glasses?'], () => {
      const s = cur();
      if (itemsFull(s)) { hubSay("* Your items are full."); return; }
      s.items.push('sshades'); s.seen.shades = 1; storySave();
      if (AC) { tone(1046, T0(), .08, 'square', .1); tone(1568, T0() + .07, .12, 'square', .1); }
      hubSay('* You got the Shattered Shades.');
    }));
}
function hubActivate() {
  if (ST.i == 0) {
    const b = hubBtns()[ST.j];
    if (b == 'STATS' || b == 'ITEM') { ST.panel = b == 'ITEM' ? 'item' : 'stats'; ST.pp = 0; ST.pr = 0; ST.itab = 0; ST.who = null; ST.iopt = null; AC && sfxSel(); }
    else if (b == 'SHOP') { AC && sfxSel(); openShops(); }   // the shop screens live in shop.js
    else if (b == 'TRAVEL') { ST.panel = 'travel'; ST.pr = cur().village - 1; AC && sfxSel(); }
  }
  else if (ST.i == 1) pickCard(ST.j);
  else if (ST.j < backCol()) openStand(ST.j);
  else { AC && sfxSel(); storyGo('slots', ST.slot); }
}
function hubMove(dr, dc) {
  const v = VILLAGES[cur().village];
  if (smallCards(v) && smallMove(v, dr, dc)) { AC && sfxSel(); return; }
  if (dr) {
    const from = ST.i, to = (from + dr + 3) % 3;
    if (to == 0) ST.j = from == 1 ? Math.min(ST.j, hubCols(0) - 1) : 0;   // cards -> buttons: the button above
    else if (to == 1) ST.j = Math.min(ST.j, 3);                           // to the cards: the card in the same column
    else ST.j = from == 1 ? Math.min(ST.j, backCol()) : 0;               // cards -> stands / BACK below
    ST.i = to;
  } else ST.j = (ST.j + dc + hubCols(ST.i)) % hubCols(ST.i);
  if (dr || hubCols(ST.i) > 1) AC && sfxSel();
}
/* small-card villages: Soulcerer on top, mini bosses in rows of 4 below. Returns true if it handled the move. */
function smallMove(v, dr, dc) {
  const sIdx = soulIdx(v), nm = sIdx, rows = miniRows(v);
  if (ST.i == 1) {
    if (ST.j == sIdx) {   // the Soulcerer: down to the first row (second card, under it), up to the buttons; left / right do nothing
      if (dr > 0) { ST.j = Math.min(1, nm - 1); return true; }
      if (dr < 0) { ST.i = 0; ST.j = 0; return true; }
      return false;
    }
    const r = Math.floor(ST.j / SMALL_COLS), c = ST.j % SMALL_COLS;
    if (dc) { const start = r * SMALL_COLS, len = Math.min(SMALL_COLS, nm - start); ST.j = start + (c + dc + len) % len; return len > 1; }   // left / right stay in the row
    if (dr < 0) { ST.j = r == 0 ? sIdx : ST.j - SMALL_COLS; return true; }   // up: the row above, or the Soulcerer
    if (dr > 0) { if (r + 1 < rows) ST.j = Math.min(ST.j + SMALL_COLS, nm - 1); else { ST.i = 2; ST.j = Math.min(c, backCol()); } return true; }   // down: the row below, or the stands / BACK
    return false;
  }
  if (ST.i == 0 && dr > 0) { ST.i = 1; ST.j = sIdx; return true; }   // buttons -> the Soulcerer
  if (ST.i == 2 && dr < 0) { ST.i = 1; ST.j = Math.min((rows - 1) * SMALL_COLS + Math.min(ST.j, SMALL_COLS - 1), nm - 1); return true; }   // stands / BACK -> the last mini boss row
  return false;
}

/* ---------- STATS / ITEM panels ---------- */
/* STATS: one page per player, rows 0 = WEAPON, 1 = ARMOR.
   ITEM: the party's shared inventory; equipping asks WHO EQUIPS IT? when there are 2+ players. */
const slotOf = id => ITEMS[id].type == 'weapon' ? 'weapon' : ITEMS[id].type == 'armor' ? 'armor' : null;
function unequip(slotName) {
  const s = cur(), p = s.players[ST.pp], id = p[slotName];
  if (!id) { storyErr('Nothing is equipped there.'); return; }
  if (itemsFull(s)) { storyErr('Your items are full.'); return; }
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
  if (ITEMS[id].type == 'trinket') { trinketTarget(k); return; }   // APPLY IT TO? (outside battle only: trinkets never show in the battle ITEM menu)
  if (ITEMS[id].type == 'potion') { if (s.np == 1) drinkItem(k, 0); else { ST.who = { k, sel: 0, act: 'drink' }; AC && sfxSel(); } return; }
  if (!food && !slotOf(id)) { storyErr("That can't be used here."); return; }
  if (s.np == 1) (food ? eatItem : equipItem)(k, 0);
  else { ST.who = { k, sel: 0, act: food ? 'eat' : 'equip' }; AC && sfxSel(); }
}
/* eating outside battle: heal that player (not past max HP); the text box says what happened */
function eatItem(k, pi) {
  const s = cur(), p = s.players[pi], it = ITEMS[s.items[k]], max = maxHp(s.lv), maxS = maxSp(s.lv), solo = s.np == 1, nm = 'P' + (pi + 1);
  ST.who = null;
  if (p.hp >= max && (p.sp >= maxS || !foodSp(it))) { storyErr((solo ? 'You are' : nm + ' is') + (foodSp(it) ? ' already at full HP and SP.' : ' already at full HP.')); return; }   // full HP still eats if SP is low
  const hpFull = p.hp + it.heal >= max, spFull = p.sp + foodSp(it) >= maxS;
  p.hp = Math.min(max, p.hp + it.heal);
  p.sp = Math.min(maxS, p.sp + foodSp(it));
  s.items.splice(k, 1);
  ST.pr = Math.min(ST.pr, Math.max(0, s.items.length - 1));
  storySave(); if (AC) sfxHeal();
  hubSay((solo ? '* You ate the ' : '* ' + nm + ' ate the ') + it.name + '.\n' + it.eat + '\n* ' + recLine(solo, nm, hpFull, it.heal, spFull, foodSp(it)));
}
/* drinking a potion in the village: pays its SP cost now; the SP Potion works right away, the others wait for the next fight */
function drinkItem(k, pi) {
  const s = cur(), p = s.players[pi], it = ITEMS[s.items[k]], maxS = maxSp(s.lv), solo = s.np == 1, nm = 'P' + (pi + 1);
  const subj = solo ? 'You' : nm, poss = solo ? 'Your' : nm + "'s", cost = it.cost || 0;
  ST.who = null;
  if (it.sp && p.sp >= maxS) { storyErr((solo ? 'You are' : nm + ' is') + ' already at full SP.'); return; }
  if (it.fx && p.next && p.next[it.fx]) { storyErr(subj + ' already drank one for the next fight.'); return; }
  if (p.sp < cost) { storyErr(subj + (solo ? " don't" : " doesn't") + ' have enough SP to drink it.'); return; }
  p.sp -= cost;
  s.items.splice(k, 1);
  ST.pr = Math.min(ST.pr, Math.max(0, s.items.length - 1));
  let line;
  if (it.sp) { const g = Math.min(it.sp, maxS - p.sp); p.sp += g; line = subj + ' recovered ' + g + ' SP.'; }
  else {
    p.next = p.next || { regen: 0, atk: 0, def: 0 };
    if (it.fx == 'regen') { p.next.regen = POT_TURNS; line = subj + ' will heal ' + POT_HEAL + ' HP for ' + POT_TURNS + ' turns\n  in the next fight.'; }
    else { p.next[it.fx] = POT_BOOST; line = poss + ' ' + it.fx.toUpperCase() + ' will rise by ' + POT_BOOST + ' in the next fight.'; }
  }
  storySave(); if (AC) sfxHeal();
  hubSay('* ' + subj + ' drank the ' + it.name + (cost ? ' (-' + cost + ' SP)' : '') + '.\n* ' + line);
}
/* the "what happened" line after eating: HP part + SP part, e.g. "You recovered 8 HP and 4 SP." */
function recLine(solo, nm, hpFull, hp, spFull, sp) {
  const subj = solo ? 'You' : nm, poss = solo ? 'Your' : nm + "'s";
  if (!sp) return hpFull ? poss + ' HP was maxed out.' : subj + ' recovered ' + hp + ' HP.';   // food with no SP (Beat Jerky)
  if (hpFull && spFull) return poss + ' HP and SP were maxed out.';
  if (!hpFull && !spFull) return subj + ' recovered ' + hp + ' HP and ' + sp + ' SP.';
  return hpFull ? poss + ' HP was maxed out. ' + subj + ' recovered ' + sp + ' SP.' : poss + ' SP was maxed out. ' + subj + ' recovered ' + hp + ' HP.';
}

/* ---------- stands ---------- */
/* the Slap Strap lying in Square Village: take it once */
function takeStrap() {
  AC && sfxSel();
  hubSay(['* A leather strap lies in the grass.\n* It looks like it would sting.', '* Take it?'], () =>
    askYesNo('', ['Take the strap?'], () => {
      const s = cur();
      if (itemsFull(s)) { hubSay('* Your items are full.'); return; }
      s.items.push('slap'); s.seen.strap = 1; storySave();
      if (AC) { tone(1046, T0(), .08, 'square', .1); tone(1568, T0() + .07, .12, 'square', .1); }
      hubSay('* You got the Slap Strap.');
    }));
}
function openStand(k) {
  if (standsHere()[k].pickup) { takeStrap(); return; }
  if (standsHere()[k].well) { openWell(); return; }   // well.js
  if (standsAbandoned() && standsHere()[k].potions) { readPotionNote(); return; }   // the potion stand is gone: read the note
  ST.panel = 'stand'; ST.stand = k; ST.pr = 0; ST.who = null; ST.iopt = null; AC && sfxSel();
}
const standRows = st => (st.sell || st.potions).length;
const standPrice = p => standsAbandoned() ? 0 : p;   // no vendor left to charge you
/* abandoned stands (genocide) only have STAND_STOCK of each item; s.stock counts how many were taken */
const STAND_STOCK = 4;
const outOfStock = id => standsAbandoned() && (cur().stock[id] || 0) >= STAND_STOCK;
function standBuy() {
  const s = cur(), st = standsHere()[ST.stand];
  if (st.potions) {   /* nobody can buy here: the vendor just laughs at your empty pockets */
    const sr = st.potions[ST.pr][1];
    AC && sfxSel();
    hubSay(s.relics >= sr ? '* "...You actually have some?\n* ...Sorry, all sold out."' : potionRoast(sr));
    return;
  }
  const id = st.sell[ST.pr][0], price = standPrice(st.sell[ST.pr][1]), it = ITEMS[id];
  if (outOfStock(id)) { storyErr('The ' + it.name + ' is out of stock.'); return; }
  if (s.coins < price) { storyErr("You can't afford the " + it.name + '.'); return; }
  if (itemsFull(s)) { storyErr('Your items are full.'); return; }
  /* confirm first; NO leaves you on the stand with the same item highlighted */
  const q = standsAbandoned() ? ['Take the ' + it.name + '?'] : ['Buy the ' + it.name, 'for ' + price + ' BC?'];
  askYesNo('', q, () => standPay(id, price));
}
function standPay(id, price) {
  const s = cur(), it = ITEMS[id];
  s.coins -= price; s.items.push(id);
  if (standsAbandoned()) s.stock[id] = (s.stock[id] || 0) + 1;
  storySave();
  if (AC) { tone(1046, T0(), .08, 'square', .1); tone(1568, T0() + .07, .12, 'square', .1); }
  storyMsg(standsAbandoned() ? 'You took the ' + it.name + '.' : 'You bought the ' + it.name + '. (-' + price + ' BC)', '#7dff3d');
}

/* ---------- items in story battles (called from script.js): food heals, weapons / armor get equipped ---------- */
const isFood = id => ITEMS[id] && ITEMS[id].type == 'food';
const isPotion = id => ITEMS[id] && ITEMS[id].type == 'potion';
const battleUsable = id => isFood(id) || isPotion(id) || (ITEMS[id] && !!slotOf(id));
/* battle ITEM menu: every usable item gets its own line (no "x2"), in inventory order; up to 8, drawn in 2 columns of 4 (script.js) */
const battleIdx = () => cur().items.map((_, k) => k).filter(k => battleUsable(cur().items[k]));   // inventory index of each menu line
const battleItem = idx => cur().items[battleIdx()[idx]];
function storyItemList() { return battleIdx().map(k => ITEMS[cur().items[k]].name); }
/* trinket color for line idx of that list (gear carrying a Skill Trinket), else null */
const storyItemCol = idx => { const t = trinketOf(battleItem(idx)); return t ? ITEMS[t].col : null; };
const storyIsGear = idx => { const id = battleItem(idx); return !!id && !!slotOf(id); };
/* the highlighted item's info, shown small at the bottom left of the battle box */
const storyItemInfo = idx => { const e = battleItem(idx), it = e && ITEMS[e]; if (!it) return ''; const tr = trinketOf(e) ? ', ' + ITEMS[trinketOf(e)].name : ''; return it.type == 'food' ? foodTxt(it) : it.type == 'potion' ? it.short + (it.cost ? ' (costs ' + it.cost + ' SP)' : '') : it.type == 'weapon' ? 'Weapon, +' + it.atk + ' ATK, DUR ' + durOf(e) + tr : 'Armor, +' + it.def + ' DEF, DUR ' + durOf(e) + tr; };
/* take the chosen item out of the shared items (co-op takes it when picked, gives it back if the pick is undone) */
function storyTake(idx) { const s = cur(), k = battleIdx()[idx]; if (k == null) return null; const id = s.items.splice(k, 1)[0]; return { id, ...ITEMS[id] }; }
/* player pi equips a weapon / armor mid-fight; the old one goes back into the shared items */
function storyEquip(pi, it) {
  const s = cur(), p = s.players[pi], slot = slotOf(it.id), old = p[slot];
  p[slot] = it.id;
  if (old) s.items.push(old);
  if (AC) sfxSel();
  return (players.length == 1 ? '* You' : '* P' + (pi + 1)) + ' equipped the ' + it.name + '.';
}
/* co-op: what a picked item does when the turn plays out */
function storyUsePicked(i, t, it) { return it && slotOf(it.id) ? storyEquip(i, it) : it && isPotion(it.id) ? storyDrink(i, t, it) : storyFeed(i, t, it); }
/* player i drinks / gives a potion to player t in battle; t pays its SP cost (not enough SP or downed: it goes back to the items) */
function storyDrink(i, t, it) {
  const T = players[t], solo = players.length == 1, nm = 'P' + (t + 1), subj = solo ? 'You' : nm, poss = solo ? 'Your' : nm + "'s", cost = it.cost || 0;
  if (!T || T.gone) return '* The ' + it.name + ' goes to waste...';
  if (T.down) { storyGiveBack(it); return '* ' + nm + " can't drink it while down."; }
  if (T.sp != null && T.sp < cost) { storyGiveBack(it); return '* ' + subj + (solo ? " don't" : " doesn't") + ' have enough SP to drink the ' + it.name + '.'; }
  if (T.sp != null) T.sp -= cost;
  const P = ST.pot[t] || (ST.pot[t] = { regen: 0, atk: 0, def: 0 });
  let l2;
  if (it.sp) { const g = T.sp == null ? it.sp : Math.min(it.sp, T.spMax - T.sp); if (T.sp != null) T.sp += g; l2 = subj + ' recovered ' + g + ' SP.'; }
  else if (it.fx == 'regen') { P.regen = POT_TURNS; l2 = subj + ' will heal ' + POT_HEAL + ' HP for ' + POT_TURNS + ' turns.'; }
  else { P[it.fx] = POT_BOOST; l2 = poss + ' ' + it.fx.toUpperCase() + ' rose by ' + POT_BOOST + '!'; }
  if (AC) sfxHeal();
  const l1 = solo ? '* You drank the ' + it.name + '.' : t == i ? '* ' + nm + ' drank the ' + it.name + '.' : '* P' + (i + 1) + ' gave the ' + it.name + ' to ' + nm + '.';
  return l1 + '\n* ' + l2;
}
function storyGiveBack(it) { if (it) cur().items.push(it.id); }
/* player i eats / feeds food to player t; returns the battle text */
function storyFeed(i, t, it) {
  const T = players[t];
  if (!it) return '* Nothing happened.';
  if (!T || T.gone) return '* The ' + it.name + ' goes to waste...';
  const was = T.down, b4 = T.hp, solo = players.length == 1, nm = 'P' + (t + 1);
  const b4s = T.sp == null ? 0 : T.sp;
  if (was) { T.down = 0; T.hp = Math.min(T.max, it.heal); T.rev = 0; } else T.hp = Math.min(T.max, T.hp + it.heal);
  if (T.sp != null) T.sp = Math.min(T.spMax, T.sp + foodSp(it));
  sfxPie(was);
  const l1 = solo ? '* You ate the ' + it.name + '.' : t == i ? '* ' + nm + ' ate the ' + it.name + '.' : '* P' + (i + 1) + ' fed the ' + it.name + ' to ' + nm + '.';
  const l3 = was ? nm + ' gets back up!' : recLine(solo, nm, b4 + it.heal > T.max, it.heal, b4s + foodSp(it) > T.spMax, foodSp(it));
  return l1 + '\n' + it.eat + '\n* ' + l3;
}
function storyUseSolo(idx) { const it = storyTake(idx); return storyUsePicked(0, 0, it); }
/* ITEM panel tabs: ST.itab 0 = your items, 1 = BOX I, 2 = BOX II (only the boxes you own) */
const itemTabs = () => 1 + (cur().boxes || 0);
const tabList = () => ST.itab ? cur().box[ST.itab - 1] : cur().items;
const itemOpts = () => ST.itab ? ['TAKE', 'INFO', 'DROP'] : cur().boxes ? ['INFO', 'USE', 'DROP', 'STORE'] : ['INFO', 'USE', 'DROP'];
function itemInfo(k) {
  const it = ITEMS[tabList()[k]];
  const e = tabList()[k], tn = trinketOf(e) ? ', ' + ITEMS[trinketOf(e)].name : '', kind = it.type == 'weapon' ? 'Weapon, +' + it.atk + ' ATK, DUR ' + durOf(e) + tn : it.type == 'armor' ? 'Armor, +' + it.def + ' DEF, DUR ' + durOf(e) + tn : it.type == 'trinket' ? 'Skill Trinket' : it.type == 'food' ? foodTxt(it) : it.type == 'potion' ? 'Potion, ' + it.short.toLowerCase() : 'Item';
  AC && sfxSel();
  hubSay('* "' + it.name + '" - ' + kind + '\n* ' + (it.info || ''));
}
function dropItem(k) {
  const L = tabList(), name = ITEMS[L[k]].name;
  askYesNo('DROP ITEM?', ['Drop the ' + name + '?'], () => {
    L.splice(k, 1);
    ST.pr = Math.min(ST.pr, Math.max(0, L.length - 1));
    ST.iopt = null;
    storySave();
    hubSay('* The ' + name + ' was thrown away.');
  });
}
function itemOption(j) {
  const k = ST.pr, o = itemOpts()[j];
  if (o == 'INFO') itemInfo(k);
  else if (o == 'USE') useItem(k);
  else if (o == 'DROP') dropItem(k);
  else if (o == 'STORE') storeItem(k);
  else takeItem(k);
}
/* STORE: an item from your items into a Storage Box (asks which box when you have both) */
function storeItem(k) {
  const s = cur();
  ST.iopt = null;
  const put = b => {
    if (s.box[b].length >= BOX_CAP) { hubSay('* That box is full.'); return; }
    const e = s.items.splice(k, 1)[0]; s.box[b].push(e);
    ST.pr = Math.min(ST.pr, Math.max(0, s.items.length - 1));
    storySave(); AC && sfxSel();
    storyMsg('The ' + ITEMS[e].name + ' went into ' + BOX_NAMES[b] + '.', '#fff');
  };
  if (s.boxes < 2) { put(0); return; }
  ST.panel = 'lst'; AC && sfxSel();
  ST.lst = {
    title: 'WHICH BOX?', i: 0, cancel: true, back: 'item',
    rows: [0, 1].map(b => BOX_TABS[b] + '   ' + s.box[b].length + ' / ' + BOX_CAP),
    pick(b) { ST.lst = null; ST.panel = 'item'; put(b); },
  };
}
/* TAKE: an item from the open box back into your items */
function takeItem(k) {
  const s = cur(), L = tabList();
  ST.iopt = null;
  if (itemsFull(s)) { hubSay('* Your items are full.'); return; }
  const e = L.splice(k, 1)[0]; s.items.push(e);
  ST.pr = Math.min(ST.pr, Math.max(0, L.length - 1));
  storySave(); AC && sfxSel();
  storyMsg('The ' + ITEMS[e].name + ' went back to your items.', '#fff');
}
/* ---------- Skill Trinkets: the box next to each equipped weapon / armor in STATS ---------- */
function trinketSlot(slot) {
  const s = cur(), p = s.players[ST.pp], e = p[slot], t = trinketOf(e);
  if (!e) { storyErr('Nothing is equipped there.'); return; }
  if (t) {   // take it off: back to your items
    if (itemsFull(s)) { storyErr('Your items are full.'); return; }
    askYesNo('REMOVE?', ['Move the ' + ITEMS[t].name + ' to your items?'], () => {
      p[slot] = withTrinket(p[slot], null); s.items.push(t); storySave();
      AC && sfxSel(); storyMsg(ITEMS[t].name + ' moved to your items.', '#fff');
    });
    return;
  }
  const ks = s.items.map((_, k) => k).filter(k => ITEMS[s.items[k]].type == 'trinket');
  if (!ks.length) { storyErr('You have no Skill Trinkets.'); return; }
  ST.panel = 'lst'; AC && sfxSel();
  ST.lst = {
    title: 'WHICH TRINKET?', i: 0, cancel: true, back: 'stats',
    rows: ks.map(k => ITEMS[s.items[k]].name),
    pick(i) {
      const tid = s.items.splice(ks[i], 1)[0];
      p[slot] = withTrinket(p[slot], tid); storySave();
      ST.lst = null; ST.panel = 'stats'; AC && sfxGo();
      storyMsg(ITEMS[tid].name + ' equipped.', '#7dff3d');
    },
  };
}
/* USE on a Skill Trinket in the ITEM panel: pick a weapon / armor to put it on (equipped by any player, or carried in your items).
   Gear that already has one swaps: the old trinket goes back to your items. */
function trinketTarget(k) {
  const s = cur(), tid = s.items[k], rows = [];
  s.players.forEach((p, pi) => ['weapon', 'armor'].forEach(sl => { if (p[sl]) rows.push({ pi, sl }); }));
  s.items.forEach((e, j) => { if (slotOf(e)) rows.push({ j }); });
  if (!rows.length) { storyErr('You have no weapons or armor.'); return; }
  const gear = r => r.j != null ? s.items[r.j] : s.players[r.pi][r.sl];
  const label = r => {
    const e = gear(r), tr = trinketOf(e), nm = ITEMS[e].name + (tr ? '  (' + ITEMS[tr].name.replace(' Trinket', '') + ')' : '');
    return r.j != null ? nm + '  - in items' : (s.np > 1 ? 'P' + (r.pi + 1) + ' ' : '') + (r.sl == 'weapon' ? 'WEAPON: ' : 'ARMOR: ') + nm;
  };
  ST.iopt = null; ST.panel = 'lst'; AC && sfxSel();
  ST.lst = {
    title: 'APPLY IT TO?', i: 0, cancel: true, back: 'item',
    rows: rows.map(label),
    pick(i) {
      const r = rows[i], e = gear(r), old = trinketOf(e);
      const apply = () => {
        const nw = withTrinket(e, tid);
        s.items.splice(k, 1);   // the trinket leaves your items (carried gear after it moves up one)
        if (r.j != null) s.items[r.j > k ? r.j - 1 : r.j] = nw; else s.players[r.pi][r.sl] = nw;
        if (old) s.items.push(old);
        ST.lst = null; ST.panel = 'item'; ST.pr = Math.min(ST.pr, Math.max(0, s.items.length - 1));
        storySave(); AC && sfxGo();
        storyMsg(ITEMS[tid].name + ' put on the ' + ITEMS[e].name + '.' + (old ? ' ' + ITEMS[old].name + ' back in items.' : ''), '#7dff3d');
      };
      if (old) askYesNo('REPLACE?', ['Replace the ' + ITEMS[old].name + '?', 'It goes back to your items.'], apply);
      else apply();
    },
  };
}
/* list dialog: 9 rows show at once; a longer list (APPLY IT TO? in 3-4 player co-op) scrolls with the highlight */
const LST_VIS = 9;
const lstTop = L => (L.top = Math.max(0, Math.min(L.i < (L.top || 0) ? L.i : L.i >= (L.top || 0) + LST_VIS ? L.i - LST_VIS + 1 : L.top || 0, L.rows.length - LST_VIS)));
/* small yellow arrows above / below a list that has more rows that way (also used by the shop's SELL list) */
function scrollArrows(x, yUp, yDn, up, dn) {
  g.fillStyle = '#ff0';
  if (up) { g.beginPath(); g.moveTo(x - 8, yUp + 5); g.lineTo(x + 8, yUp + 5); g.lineTo(x, yUp - 5); g.fill(); }
  if (dn) { g.beginPath(); g.moveTo(x - 8, yDn - 5); g.lineTo(x + 8, yDn - 5); g.lineTo(x, yDn + 5); g.fill(); }
}
/* ---------- party size (STATS: + ADD PLAYER / - REMOVE Pn) ----------
   STATS rows: 0 weapon, 1 its trinket box, 2 armor, 3 its trinket box, then 'add' (under 4 players) and 'rem' (2+ players; always the last player). */
const statRows = () => { const n = cur().np; return [0, 1, 2, 3, ...(n < 4 ? ['add'] : []), ...(n > 1 ? ['rem'] : [])]; };
const STAT_OPT_Y = 342;   // first ADD / REMOVE row (bottom right of STATS)
/* a new player joins with starter gear and full HP / SP at the party's LV (a slot removed earlier gets its old HP / SP back) */
function addPlayer() {
  const s = cur(), n = s.np;
  askYesNo('ADD A PLAYER?', ['P' + (n + 1) + ' (' + SHAPE_NAMES[n] + ') joins with a', 'Wooden Sword and Wooden Shield.'], () => {
    const back = s.left[n];   // this slot was removed before: its HP / SP come back (never above the current max)
    s.players.push({ ...starterPlayer(), hp: back ? Math.min(back.hp, maxHp(s.lv)) : maxHp(s.lv), sp: back ? Math.min(back.sp, maxSp(s.lv)) : maxSp(s.lv) });
    delete s.left[n];
    s.np = n + 1; ST.pp = n; ST.pr = 0;
    storySave(); AC && sfxGo();
    storyMsg('P' + (n + 1) + ' joined the party!', '#7dff3d');
  });
}
/* the last player leaves; their weapon / armor (DUR and trinkets kept) go to your items, or the ITEMS FULL list if there's no room */
function removePlayer() {
  const s = cur(), n = s.np, p = s.players[n - 1], gear = [p.weapon, p.armor].filter(Boolean);
  askYesNo('REMOVE P' + n + '?', gear.length ? ['P' + n + "'s " + gear.map(e => ITEMS[e].name).join(' and '), (gear.length > 1 ? 'go' : 'goes') + ' to your items.'] : ['P' + n + ' leaves the party.'], () => {
    s.left[n - 1] = { hp: p.hp, sp: p.sp };   // kept for when this slot is added back
    s.players.pop(); s.np = n - 1; s.held.push(...gear);
    ST.pp = Math.min(ST.pp, s.np - 1); ST.pr = 0;
    storySave(); AC && sfxSel();
    storyMsg('P' + n + ' left the party.', '#fff');
    resolveHeld();
  });
}
function listPress(is) {
  const L = ST.lst, n = L.rows.length;
  if (is(U) || is(Dn)) { L.i = (L.i + (is(U) ? n - 1 : 1)) % n; AC && sfxSel(); }
  else if (is(OK)) L.pick(L.i);
  else if (is(NO) && L.cancel) { ST.lst = null; ST.panel = L.back || null; AC && sfxSel(); if (L.onBack) L.onBack(); }
}
function panelPress(c, is) {
  const s = cur(), np = s.np;
  if (ST.panel == 'lst' && ST.lst) { listPress(is); return; }
  if (ST.who) {
    if (is(L) || is(R)) { ST.who.sel = (ST.who.sel + (is(L) ? np - 1 : 1)) % np; AC && sfxSel(); }
    else if (is(OK)) ({ eat: eatItem, drink: drinkItem }[ST.who.act] || equipItem)(ST.who.k, ST.who.sel);
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
  if (ST.iopt != null) {   // option row for the selected item (INFO / USE / DROP / STORE, or TAKE / INFO / DROP in a box)
    const n = itemOpts().length;
    if (is(L) || is(R)) { ST.iopt = (ST.iopt + (is(L) ? n - 1 : 1)) % n; AC && sfxSel(); }
    else if (is(OK)) itemOption(ST.iopt);
    else if (is(NO)) { ST.iopt = null; AC && sfxSel(); }
    return;
  }
  const rows = ST.panel == 'stats' ? statRows().length : tabList().length;   // stats: weapon, weapon's trinket box, armor, armor's trinket box (+ ADD / REMOVE player)
  if (is(L) || is(R)) {
    if (ST.panel == 'stats' && np > 1) { ST.pp = (ST.pp + (is(L) ? np - 1 : 1)) % np; ST.pr = 0; AC && sfxSel(); }
    else if (ST.panel == 'item' && itemTabs() > 1) { const n = itemTabs(); ST.itab = (ST.itab + (is(L) ? n - 1 : 1)) % n; ST.pr = 0; AC && sfxSel(); }   // ITEM / BOX I / BOX II
  }
  else if (is(U) || is(Dn)) { if (rows > 1) { ST.pr = (ST.pr + (is(U) ? rows - 1 : 1)) % rows; AC && sfxSel(); } }
  else if (is(OK)) {
    if (ST.panel == 'stats') { const o = statRows()[ST.pr]; if (o == 'add') addPlayer(); else if (o == 'rem') removePlayer(); else (ST.pr % 2 ? trinketSlot : unequip)(ST.pr < 2 ? 'weapon' : 'armor'); }
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
  if (inShop()) { shopPress(c, is); return; }   // shop.js
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
  if (inShop()) { shopTap(x, y, inR); return; }   // shop.js
  if (ST.scr == 'hub') {
    if (ST.tb) { storyPress(OK[0], a => a === OK); return; }
    if (ST.panel) { panelTap(x, y, inR); return; }
    const pick2 = (i, j) => { if (ST.i == i && ST.j == j) hubActivate(); else { ST.i = i; ST.j = j; AC && sfxSel(); } };
    const nb = hubCols(0);
    for (let j = 0; j < nb; j++) if (inR(hubBtnX(j, nb), 22, 110, 40)) { pick2(0, j); return; }
    { const v = VILLAGES[cur().village]; for (let j = 0; j < hubCols(1); j++) { const b = cardBox(v, j); if (inR(b.x, b.y, b.w, b.h)) { pick2(1, j); return; } } }
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
  if (ST.panel == 'item' && itemTabs() > 1) for (let k = 0; k < itemTabs(); k++) if (inR(tabX(k, itemTabs()) - 60, PAN.y + 16, 120, 40)) {   // the tabs
    if (ST.itab != k) { ST.itab = k; ST.pr = 0; ST.iopt = null; AC && sfxSel(); }
    return;
  }
  if (ST.iopt != null) {
    const no = itemOpts().length;
    for (let j = 0; j < no; j++) if (inR(optX(j, no) - 50, OPT_Y - 24, 100, 36)) {
      if (ST.iopt == j) itemOption(j); else { ST.iopt = j; AC && sfxSel(); }
      return;
    }
    ST.iopt = null; AC && sfxSel();
    return;
  }
  if (!inR(PAN.x, PAN.y, PAN.w, PAN.h)) {   // tap outside: close (a list dialog backs out the same way as X / B; a forced one stays)
    if (ST.panel == 'lst' && ST.lst) { if (ST.lst.cancel) listPress(a => a === NO); return; }
    ST.panel = null; AC && sfxSel(); return;
  }
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
  if (ST.panel == 'lst' && ST.lst) {   // list dialog: click a row to choose it
    const top = lstTop(ST.lst);
    ST.lst.rows.forEach((_, k) => { if (k >= top && k < top + LST_VIS && inR(PAN.x + 20, PAN.y + LST_ROW_Y - 22 + (k - top) * 30, PAN.w - 40, 30)) { if (ST.lst.i == k) press(OK[0]); else { ST.lst.i = k; AC && sfxSel(); } } });
    return;
  }
  if (ST.panel == 'stats') {   // + ADD PLAYER / - REMOVE Pn (bottom right)
    const so = statRows();
    for (let j = 4; j < so.length; j++) if (inR(PAN.x + PAN.w - 250, PAN.y + STAT_OPT_Y + (j - 4) * 26 - 20, 220, 26)) { if (ST.pr == j) press(OK[0]); else { ST.pr = j; AC && sfxSel(); } return; }
  }
  const rows = ST.panel == 'stats' ? [STAT_ROW_Y, STAT_ROW_Y + 30] : tabList().map((_, k) => ITEM_ROW_Y + k * 30);
  rows.forEach((ry, k) => {
    if (inR(PAN.x + 20, PAN.y + ry - 22, PAN.w - 40, 30)) {
      const kk = ST.panel == 'stats' ? k * 2 : k;   // stats rows: mouse picks the weapon / armor name (the boxes are keyboard)
      if (ST.pr == kk) press(OK[0]); else { ST.pr = kk; AC && sfxSel(); }
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
/* card layout: up to 4 big cards in a row (Star Village). Bigger villages (Square Village and every later one: 8 mini bosses + the Soulcerer)
   use small cards: the Soulcerer alone at the top centre, the mini bosses below in rows of SMALL_COLS (a short last row is centred).
   Card index: mini bosses 0..n-1 in village order, the Soulcerer is the LAST slot (soulIdx). */
const cardCount = v => v.slots || v.foes.length + (v.soulcerer ? 1 : 0);
const smallCards = v => cardCount(v) > 4;
const SMALL_COLS = 4, SMALL = { w: 150, h: 100, gap: 8, y: 112 };
const soulIdx = v => smallCards(v) ? cardCount(v) - 1 : v.foes.length;   // the Soulcerer's card slot
const miniRows = v => Math.ceil(soulIdx(v) / SMALL_COLS);
function cardBox(v, k) {
  if (!smallCards(v)) return { x: cardX(k), y: CARD_Y, w: CARD_W, h: CARD_H, cx: cardX(k) + 85, ay: CARD_Y + 85, sc: .62, ny: CARD_Y + 205, dy: CARD_Y + 237, ly: CARD_Y + 277, nf: 22, df: 18, lf: 16, big: 1 };
  const { w, h, gap } = SMALL, nm = soulIdx(v), soul = k == nm;
  const r = soul ? 0 : 1 + Math.floor(k / SMALL_COLS), c = soul ? 0 : k % SMALL_COLS, rowN = soul ? 1 : Math.min(SMALL_COLS, nm - (r - 1) * SMALL_COLS);
  const x = (W - (rowN * w + (rowN - 1) * gap)) / 2 + c * (w + gap), y = SMALL.y + r * (h + gap);
  return { x, y, w, h, cx: x + w / 2, ay: y + 33, sc: .29, ny: y + 70, dy: y + 84, ly: y + 96, nf: 13, df: 11, lf: 10 };
}
const CARD_DX = { 4: 12 };   // per-boss nudge of the card art (Racer: his exhaust puffs drift out to the left)
const PAN = { x: 170, y: 90, w: 460, h: 410 };

const LST_ROW_Y = 105;   // first row of the list dialog (trinket picker / items-full chooser)
const STAT_ROW_Y = 237, ITEM_ROW_Y = 105;   // ATK/DEF + WEAPON/ARMOR rows (moved down 12 to make room for SP above)
const WHO = { x: PAN.x + 30, y: PAN.y + 110, w: PAN.w - 60, h: 200 };
const whoX = (k, np) => W / 2 + (k - (np - 1) / 2) * 90;
const OPT_Y = PAN.y + PAN.h - 48, optX = (j, n) => W / 2 + (j - ((n || 3) - 1) / 2) * (n > 3 ? 100 : 120);   // INFO / USE / DROP (/ STORE) row
const tabX = (k, n) => W / 2 + (k - (n - 1) / 2) * 130;   // ITEM panel tabs: ITEM / BOX I / BOX II
const STAND_X = k => 28 + k * 100, STAND_Y = 446, BACK2_X = W / 2 + 40;  // hub stands (bottom left) and BACK beside them
const STAND_ROW_Y = 130;                                                  // first row in a stand's menu
const TRAVEL_ROW_Y = 110, TRAVEL_GAP = 52;                                // TRAVEL list rows
/* a little market stall: striped awning in the stand's color, a counter, and what it sells */
function drawStand(x, y, st, on) {
  if (st.pickup) { drawStrapSpot(x, y, on); return; }
  if (st.well) { drawWell(x, y, on); return; }   // well.js
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
/* the Slap Strap's spot in Square Village: a small white four-pointed star (select it to pick the strap up) */
function drawStrapSpot(x, y, on) {
  const cx = x + 44, cy = y + 38, t = performance.now() / 1000, r = 14 + (SET.reduceFlash ? 0 : Math.sin(t * 3) * 1.5), n = r * .3;
  g.save();
  g.shadowColor = '#fff'; g.shadowBlur = on ? 16 : 9;   // soft glow
  g.fillStyle = on ? '#ffff9a' : '#fff'; g.beginPath();
  g.moveTo(cx, cy - r); g.lineTo(cx + n, cy - n); g.lineTo(cx + r, cy); g.lineTo(cx + n, cy + n);
  g.lineTo(cx, cy + r); g.lineTo(cx - n, cy + n); g.lineTo(cx - r, cy); g.lineTo(cx - n, cy - n); g.closePath(); g.fill();
  g.restore();
  if (on) soul(x - 14, y + 34, '#19e3ff');
}/* where the potion stand stood (genocide route): the vendor's note on the left, the stand's green flask broken and spilled on the right */
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
  const rows = st.sell ? st.sell.map(([id, p]) => { const it = ITEMS[id], out = outOfStock(id); return [it.name, out ? 'OUT OF STOCK' : standPrice(p) + ' BC', it.type == 'food' ? foodTxt(it) : it.type == 'weapon' ? 'Weapon, +' + it.atk + ' ATK, DUR ' + it.dur : 'Armor, +' + it.def + ' DEF, DUR ' + it.dur, out ? '#ff5a5a' : '#ffd23f']; })
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
function drawSoulCard(b, sc, st, open, bounce) {
  const q = b.sc / .62, cx = b.cx, cy = b.ay + 3 * q;
  if (st.k > 0 && !st.sp) return;
  if (!open) {
    g.globalAlpha = .35; drawBoss(sc.bi, cx, cy, 0, b.sc); g.globalAlpha = 1;
    g.save(); g.translate(cx, cy); g.scale(q, q);
    g.fillStyle = '#aaa'; g.strokeStyle = '#aaa'; g.lineWidth = 3;
    g.beginPath(); g.arc(0, -2, 8, Math.PI, 0); g.stroke(); g.fillRect(-11, -2, 22, 17); g.restore();
  } else drawBoss(sc.bi, cx, cy, bounce, b.sc, !!st.sp);
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
  for (let k = 0; k < hubCols(1); k++) {
    const b = cardBox(v, k), on = ST.i == 1 && ST.j == k, tw = b.w - 10, q = b.sc / .62, f = v.foes[k];
    g.strokeStyle = on ? '#19e3ff' : '#444'; g.lineWidth = on ? (b.big ? 5 : 4) : 2; g.strokeRect(b.x, b.y, b.w, b.h);
    if (f) {
      const st = s.foes[f.id], B = BOSSES[f.bi], gone = st.k >= 3;
      if (!gone) drawBoss(f.bi, b.cx + (CARD_DX[f.bi] || 0) * q, b.ay, bounce, b.sc, !!st.sp, !st.sp && st.k == 1, !st.sp && st.k == 2);
      else if (f.id == 'slug') drawFallenShades(b.cx, b.ay + 30 * q, .95 * q, null, !!s.seen.shades);   // all that's left of $lug Thug (just the puddle once his glasses are taken)
      txt(B.n, b.cx, b.ny, b.nf, gone ? '#555' : on ? '#ff0' : '#fff', 'center', tw, true);
      txt(B.d, b.cx, b.dy, b.df, gone ? '#555' : B.dc, 'center', tw);
      if (!gone) txt('FIGHT', b.cx, b.ly, b.lf, on ? '#fff' : '#888', 'center', tw);
    } else if (v.soulcerer && k == soulIdx(v)) {
      const open = soulcererOpen(s), sc = v.soulcerer, st = s.foes[sc.id], gone = st.k > 0 && !st.sp, dim = !open || gone;
      drawSoulCard(b, sc, st, open, bounce);
      txt(sc.name, b.cx, b.ny, b.big ? 15 : 11, dim ? '#555' : on ? '#ff0' : '#fff', 'center', tw, true);
      txt(open ? BOSSES[sc.bi].d : '???', b.cx, b.dy, b.df, dim ? '#555' : BOSSES[sc.bi].dc, 'center', tw, true);
      const lab = !open ? 'LOCKED' : st.sp ? 'SPARED' : gone ? '' : 'FIGHT';
      if (lab) txt(lab, b.cx, b.ly, b.lf, !open ? '#555' : st.sp ? '#ffd23f' : on ? '#fff' : '#888', 'center', tw, true);
    } else {   // a card slot with no boss yet
      txt('???', b.cx, b.ay + 15 * q, b.big ? 40 : 26, '#555', 'center', tw, true);
      txt('???', b.cx, b.ny, b.nf, on ? '#ff0' : '#888', 'center', tw, true);
      txt('COMING SOON', b.cx, b.ly, b.lf, '#555', 'center', tw, true);
    }
  }  const stands = standsHere();
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
  else if (ST.panel == 'lst' && ST.lst) drawList();
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
  if (ST.tb.fx) {   // corrupted: pink, every letter shaking a little
    g.font = 'bold 22px monospace'; g.fillStyle = '#ff2e88'; g.textAlign = 'left';
    t.slice(0, n).split('\n').forEach((l, i) => { let cx = x + 24; for (const ch of l) { const j = SET.reduceFlash ? 0 : 1.6; g.fillText(ch, cx + (Math.random() - .5) * j, y + 42 + i * 34 + (Math.random() - .5) * j); cx += g.measureText(ch).width; } });
  } else t.slice(0, n).split('\n').forEach((l, i) => txt(l, x + 24, y + 42 + i * 34, 22, '#fff', 'left', 0, true));
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
  const s = cur(), p = ST.pp, pl = s.players[p], L0 = PAN.x + 40, R0 = L0 + 150, y = PAN.y;   // R0: WEAPON / ARMOR / NEXT column, close to the left to leave room for "... DUR 30"
  panelBox('STATS');
  let statsHint = 'Enter: unequip    X / B: close';
  panelPlayer(p);
  txt('LV  ' + s.lv, L0, y + 145, 18, '#fff', 'left', 0, true);
  txt('HP  ' + pl.hp + ' / ' + maxHp(s.lv), L0, y + 175, 18, '#fff', 'left', 0, true);
  txt('SP  ' + pl.sp + ' / ' + maxSp(s.lv), L0, y + 200, 18, '#fff', 'left', 0, true);
  txt('ATK ' + baseAtk(s.lv) + '  (' + itemAtk(pl.weapon) + ')', L0, y + STAT_ROW_Y, 18, '#fff', 'left', 0, true);
  txt('DEF ' + baseDef(s.lv) + '  (' + itemDef(pl.armor) + ')', L0, y + STAT_ROW_Y + 30, 18, '#fff', 'left', 0, true);
  [['WEAPON', pl.weapon], ['ARMOR', pl.armor]].forEach(([lab, id], k) => {
    const on = ST.pr == k * 2, onBox = ST.pr == k * 2 + 1, ry = y + STAT_ROW_Y + k * 30;
    if (on) soul(R0 - 18, ry - 6, '#19e3ff');
    const line = lab + ': ' + (id ? ITEMS[id].name.toUpperCase() + ' DUR ' + durOf(id) : 'NONE');
    txt(line, R0, ry, 14, on ? '#ff0' : '#aaa', 'left', 250, true);
    if (id) {   // small empty box after the DUR number (an empty slot for something coming with the shop)
      g.font = 'bold 14px monospace';
      const bx = R0 + Math.min(250, g.measureText(line).width) + 8;
      const tr = trinketOf(id);   // the Skill Trinket box: gray when empty, filled with the trinket's color when equipped, yellow when selected
      g.strokeStyle = onBox ? '#ff0' : '#888'; g.lineWidth = onBox ? 3 : 2; g.strokeRect(bx, ry - 15, 20, 20);
      if (tr) { g.fillStyle = ITEMS[tr].col; g.fillRect(bx + 4, ry - 11, 12, 12); }
      if (onBox) {
        if (ST.msgT <= 0) txt(tr ? ITEMS[tr].info : 'Equip a Skill Trinket from your items.', W / 2, y + PAN.h + 30, 15, '#aaa', 'center', W - 60, true);   // under the panel, where messages go
        statsHint = tr ? 'Enter: remove ' + ITEMS[tr].name + '    X / B: close' : 'Enter: equip a trinket    X / B: close';
      }
    }
  });
  statRows().slice(4).forEach((o, j) => {   // + ADD PLAYER / - REMOVE Pn
    const on = ST.pr == 4 + j, ry = y + STAT_OPT_Y + j * 26, lx = PAN.x + PAN.w - 40, t = o == 'add' ? '+ ADD PLAYER' : '- REMOVE P' + s.np;
    txt(t, lx, ry, 17, on ? '#ff0' : '#888', 'right', 0, true);
    if (!on) return;
    g.font = 'bold 17px monospace'; soul(lx - g.measureText(t).width - 18, ry - 6, '#19e3ff');
    statsHint = o == 'add' ? 'Enter: add a player    X / B: close' : 'Enter: remove P' + s.np + '    X / B: close';
    if (ST.msgT <= 0) txt(o == 'add' ? 'P' + (s.np + 1) + ' (' + SHAPE_NAMES[s.np] + ') joins with a Wooden Sword and Wooden Shield.' : 'P' + s.np + ' leaves the party. Their gear goes to your items.', W / 2, y + PAN.h + 30, 15, '#aaa', 'center', W - 60, true);
  });
  txt('EXP ' + s.exp, L0, y + 305, 18, '#fff', 'left', 0, true);
  txt('NEXT ' + (s.lv >= MAX_LV ? 'MAX' : EXP_TABLE[s.lv] - s.exp), R0, y + 305, 16, '#aaa', 'left', 0, true);
  txt('BEAT COINS ' + s.coins, L0, y + 342, 18, '#fff', 'left', 0, true);
  txt('SOUL RELICS ' + s.relics, L0, y + 368, 18, '#fff', 'left', 0, true);
  txt(statsHint, W / 2, y + PAN.h - 16, 13, '#777', 'center', 0, true);
  drawMsg(PAN.y + PAN.h + 30);
}
function drawList() {
  const L = ST.lst, L0 = PAN.x + 40, y = PAN.y;
  panelBox(L.title);
  const top = lstTop(L);
  scrollArrows(W / 2, y + LST_ROW_Y - 32, y + LST_ROW_Y + LST_VIS * 30 - 16, top > 0, top + LST_VIS < L.rows.length);
  L.rows.forEach((r, k) => {
    if (k < top || k >= top + LST_VIS) return;
    const on = L.i == k, ry = y + LST_ROW_Y + (k - top) * 30;
    if (on) soul(L0 - 2, ry - 6, '#19e3ff');
    txt('* ' + r, L0 + 20, ry, 18, on ? '#ff0' : '#fff', 'left', PAN.w - 90, true);
  });
  txt(L.cancel ? 'Enter: choose    X / B: back' : 'Enter: choose', W / 2, y + PAN.h - 16, 13, '#777', 'center', 0, true);
  drawMsg(PAN.y + PAN.h + 30);
}
function drawItems() {
  const s = cur(), L0 = PAN.x + 40, y = PAN.y, list = tabList(), nt = itemTabs(), opts = itemOpts();
  if (nt > 1) {   // tabs instead of the title once you own a Storage Box
    panelBox('');
    ['ITEM', ...BOX_TABS].slice(0, nt).forEach((t, k) => {
      const x = tabX(k, nt), on = ST.itab == k;
      txt(t, x, y + 42, on ? 24 : 19, on ? '#fff' : '#666', 'center', 0, true);
      if (on) { g.fillStyle = '#fff'; g.fillRect(x - 46, y + 52, 92, 3); }
    });
  } else panelBox('ITEM');
  if (!list.length) txt(ST.itab ? '* This box is empty.' : '* You have no items.', L0, y + ITEM_ROW_Y, 18, '#bbb', 'left', 0, true);
  list.forEach((id, k) => {
    const on = ST.pr == k, ry = y + ITEM_ROW_Y + k * 30;
    if (on) soul(L0 - 2, ry - 6, '#19e3ff');
    const it = ITEMS[id], tag = it.type == 'weapon' ? '+' + it.atk + ' ATK  DUR ' + durOf(id) : it.type == 'armor' ? '+' + it.def + ' DEF  DUR ' + durOf(id) : it.type == 'food' ? '+' + it.heal + ' HP' + (foodSp(it) ? '  +' + foodSp(it) + ' SP' : '') : it.type == 'trinket' ? 'Skill Trinket' : it.type == 'potion' ? (it.cost ? it.cost + ' SP to drink' : '+' + it.sp + ' SP') : '';
    txt('* ' + it.name, L0 + 20, ry, 18, on ? '#ff0' : '#fff', 'left', 0, true);
    const tr = trinketOf(id);   // gear with a Skill Trinket: a square in the trinket's color right after the name
    if (tr) { g.font = 'bold 18px monospace'; g.fillStyle = g.shadowColor = ITEMS[tr].col; g.shadowBlur = 9; g.fillRect(L0 + 20 + g.measureText('* ' + it.name).width + 10, ry - 12, 13, 13); g.shadowBlur = 0; g.shadowColor = 'transparent'; }   // slight glow
    if (tag) txt(tag, PAN.x + PAN.w - 40, ry, 15, '#aaa', 'right', 0, true);
  });
  if (list.length) opts.forEach((o, j) => {
    const on = ST.iopt == j, act = ST.iopt != null, x = optX(j, opts.length);
    if (on) soul(x - 46, OPT_Y - 6, '#19e3ff');
    txt(o, x, OPT_Y, 20, on ? '#ff0' : act ? '#fff' : '#555', 'center', 90, true);
  });
  txt(list.length + ' / ' + (ST.itab ? BOX_CAP : MAX_ITEMS), PAN.x + PAN.w - 24, y + PAN.h - 16, 14, '#888', 'right', 0, true);
  const sw = nt > 1 ? 'Left / Right: tab    ' : '';
  txt(ST.iopt != null ? 'Left / Right choose    X / B: back' : !list.length ? sw + 'X / B: close' : sw + 'Enter: choose    X / B: close',
    W / 2, y + PAN.h - 16, 13, '#777', 'center', 0, true);
  if (ST.who) drawWho();
  drawMsg(PAN.y + PAN.h + 30);
}
function drawWho() {
  const s = cur(), id = s.items[ST.who.k];
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h);
  g.fillStyle = '#000'; g.fillRect(WHO.x, WHO.y, WHO.w, WHO.h);
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(WHO.x, WHO.y, WHO.w, WHO.h);
  txt(ST.who.act == 'eat' ? 'WHO EATS IT?' : ST.who.act == 'drink' ? 'WHO DRINKS IT?' : 'WHO EQUIPS IT?', W / 2, WHO.y + 34, 20, '#ff0', 'center', 0, true);
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
  else if (inShop()) drawShop();   // shop.js
  if (ST.ask) drawAsk();
}
