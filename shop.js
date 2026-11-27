/* ==========================================================================
   SOUL x BEAT — shops (story mode). Loaded after story.js and uses its helpers
   (cur, ST, ITEMS, storySave, askYesNo, storyErr, txt, soul, ...).

   The hub's SHOP button opens a choice of three shops ('shops' screen).
   The left one is Daniel's shop ('shop1'): it opens once you've traveled to
   Square Village. The other two are locked for now.
   ========================================================================== */

/* ---------- data ---------- */
const SHOP_NAMES = ["DANIEL'S SHOP", '???', '???'];
const shopOpen = (s, k) => k == 0 && !!s.seen.been2;   // Daniel's shop: once you've been to Square Village
/* his menu: BUY (opens the categories), DEALS, SELL, EXIT */
const MAIN_MENU = ['BUY', 'DEALS', 'SELL', 'EXIT'], BUY_MENU = ['WEAPONS', 'ARMOR', 'ITEMS', 'STORAGE', 'BACK'];
const shopMenu = () => ST.shop && ST.shop.menu == 'buy' ? BUY_MENU : MAIN_MENU;
/* special deals: after each won fight there's a DEAL_CHANCE chance he gets one of his weapons / armor with a random Skill Trinket on it.
   One at a time (a new one replaces it), kept until bought; it costs the gear's BC price + DEAL_SR Soul Relics. */
const DEAL_CHANCE = .25, DEAL_SR = 5, DEAL_GEAR = ['tslinger', 'slap', 'bbonnet', 'wcloak'];
function shopDealRoll(s) {
  if (!shopOpen(s, 0) || Math.random() >= DEAL_CHANCE) return;
  s.deal = newDeal();
}
/* a random deal (gear + trinket), never the same as `old` */
function newDeal(old) {
  let d, n = 0;
  do { d = withTrinket(DEAL_GEAR[Math.floor(Math.random() * DEAL_GEAR.length)], TRINKET_IDS[Math.floor(Math.random() * TRINKET_IDS.length)]); n++; } while (d == old && n < 20);
  return d;
}
const DEAL_REFRESH = 10;   // BC to swap the current deal for a new one
/* Daniel's stock: [item id, price in BC]. Storage Boxes aren't items: each gives +8 item slots (s.boxes). */
const SHOP1 = {
  WEAPONS: [['slap', 30], ['tslinger', 55]],
  ARMOR: [['bbonnet', 35], ['wcloak', 50]],
  ITEMS: [['smelon', 14], ['jerky', 18]],
  STORAGE: [['box1', 100], ['box2', 200]],
};
const SHOP_BOXES = { box1: { name: 'Storage Box I', n: 1 }, box2: { name: 'Storage Box II', n: 2 } };
/* selling: half of what the item costs to buy (shop or stand price); items nobody sells go for 5 BC */
const BUY_PRICE = { pcandy: 12, ppie: 15, ndagger: 15, rvisor: 15, tslinger: 55, slap: 30, bbonnet: 35, wcloak: 50, smelon: 14, jerky: 18 };
const SELL_DEFAULT = 5;
/* Daniel won't buy potions or Skill Trinkets (he knows someone who would, but won't say who) */
const noSell = e => ITEMS[e].type == 'potion' || ITEMS[e].type == 'trinket';
const sellPrice = e => { const p = BUY_PRICE[baseId(e)]; return p ? Math.floor(p / 2) : SELL_DEFAULT; };

/* Daniel: a cube-headed guy with an axe and no patience */
const DANIEL = {
  intro: [   // first visit, one page each
    '* Oh. A customer. Wow.',
    "* Name's Daniel. Yes, my head is a cube. Hell no I'm not letting you touch it.",
    '* I sell stuff. You buy stuff. I get coins. Simple, right?',
    '* Welcome to my shop, I guess.',
  ],
  greet: [   // later visits: one at random
    '* Back again? You must really like my face.',
    "* Oh good, you're back. My axe was getting lonely.",
    '* Welcome back. No refunds. Ever.',
  ],
  cat: {
    WEAPONS: '* Weapons. They hurt. A lot.',
    ARMOR: "* Protection. You're gonna need it. Trust me.",
    ITEMS: "* Food. It's good for you. Probably.",
    STORAGE: '* Boxes. For your stuff. Groundbreaking, I know.',
    SELL: "* Let's see what junk you've got.",
  },
  buy: '* Pleasure doing business. Mostly the business part.',
  broke: '* Nice try. Come back with actual coins.',
  full: '* Your pockets are full. Did you try having fewer things?',
  sold: "* I'll take it. Don't expect me to be happy about it.",
  hoard: '* Out of boxes. You bought them all, you hoarder.',
  bye: "* Bye. Or don't. I'm not your mom.",
  deals: "* Special deals. It doesn't happen often.",
  noDeal: '* No deals today. Check back later, maybe.',
  dealBuy: "* Enjoy. No, I won't tell you where I got it.",
  noSR: '* No relics, no deal. Those are the rules.',
  refresh: '* Picky, huh? Fine. Let me dig around in the back.',
  noSell: [   // SELL on a potion / Skill Trinket: his talk box, one page each, then back to the SELL list
    "* Sorry, pal. I don't take potions or trinkets.",
    "* I know a gal who'd gladly take 'em off your hands, though.",
    '* Who? ...Not telling.',
  ],
};

/* ---------- state ---------- */
/* ST.i = highlighted shop on the 'shops' screen (0-2, 3 = BACK).
   ST.shop (in 'shop1'): mode 'talk' (pages Enter goes through) | 'menu' | 'list',
   m = menu row, cat = open category, li = list row, top = first list row shown, line = Daniel's line, t0 = when it started typing. */
const inShop = () => ST.scr == 'shops' || ST.scr == 'shop1';
const SHOP_ROWS = 4;   // list rows shown at once in Daniel's shop
function openShops() { storyGo('shops', 0); }
function leaveShops() { AC && sfxSel(); storyGo('hub', 0, hubBtns().indexOf('SHOP')); }
function enterShop1() {
  const s = cur();
  ST.scr = 'shop1';
  ST.shop = { mode: 'menu', menu: 'main', m: 0, cat: null, li: 0, top: 0, line: '', t0: 0, pages: null, pi: 0, after: null };
  AC && sfxGo();
  if (!s.seen.daniel) shopTalk(DANIEL.intro, () => { s.seen.daniel = 1; storySave(); shopSay(''); });   // the welcome stays in his talk box only (not repeated above the menu)
  else shopSay(DANIEL.greet[Math.floor(Math.random() * DANIEL.greet.length)]);
}
function shopSay(line) { ST.shop.line = line; ST.shop.t0 = performance.now(); }
/* pages Daniel says one after another (Enter goes on); after() runs when the last one is closed */
function shopTalk(pages, after) { const P = ST.shop; P.mode = 'talk'; P.pages = pages; P.pi = 0; P.after = after || null; shopSay(pages[0]); }
const shopChars = () => Math.floor((performance.now() - ST.shop.t0) / 1000 * 40);
const shopTyping = () => shopChars() < ST.shop.line.length;

/* the rows of the open category: { id, name, price, detail, sold } */
function shopRows(cat) {
  const s = cur();
  if (cat == 'SELL') return s.items.map(e => ({ id: e, name: ITEMS[e].name, price: sellPrice(e), detail: shopDetail(e), no: noSell(e) }));
  if (cat == 'DEALS') return s.deal ? [{ id: s.deal, deal: 1, name: ITEMS[s.deal].name, price: BUY_PRICE[baseId(s.deal)], sr: DEAL_SR, detail: shopDetail(s.deal) },
    { refresh: 1, name: 'Refresh deal', price: DEAL_REFRESH, detail: 'Swap this deal for a new random one.' }] : [];
  if (cat == 'STORAGE') return SHOP1.STORAGE.map(([b, p]) => ({ box: b, name: SHOP_BOXES[b].name, price: p, sold: (s.boxes || 0) >= SHOP_BOXES[b].n, detail: 'Holds ' + BOX_CAP + ' items (open it from ITEM)' }));
  return (SHOP1[cat] || []).map(([id, p]) => ({ id, name: ITEMS[id].name, price: p, detail: shopDetail(id) }));
}
function shopDetail(e) {
  const it = ITEMS[e], tr = trinketOf(e), tn = tr ? ', ' + ITEMS[tr].name : '';
  return it.type == 'weapon' ? 'Weapon, +' + it.atk + ' ATK, DUR ' + durOf(e) + tn
    : it.type == 'armor' ? 'Armor, +' + it.def + ' DEF, DUR ' + durOf(e) + tn
    : it.type == 'food' ? foodTxt(it) : it.type == 'potion' ? it.short : it.type == 'trinket' ? 'Skill Trinket' : 'Item';
}
function shopChime() { if (AC) { tone(1046, T0(), .08, 'square', .1); tone(1568, T0() + .07, .12, 'square', .1); } }
function shopCoin() { if (AC) { tone(1318, T0(), .06, 'square', .09); tone(1760, T0() + .06, .1, 'square', .08); } }

/* ---------- buying / selling ---------- */
function shopPick() {
  const P = ST.shop, s = cur(), r = shopRows(P.cat)[P.li];
  if (!r) return;
  if (P.cat == 'SELL') {
    if (r.no) { AC && tone(160, T0(), .18, 'square', .12, 90); shopTalk(DANIEL.noSell, () => { P.mode = 'list'; shopSay(DANIEL.cat.SELL); }); return; }   // kindly refused, then back in the list on the same item
    askYesNo('', ['Sell the ' + r.name, 'for ' + r.price + ' BC?'], () => {
      const k = P.li, e = s.items[k], tr = trinketOf(e);
      s.items.splice(k, 1);
      if (tr) s.items.push(tr);   // a Skill Trinket on the gear stays yours
      s.coins += r.price; storySave(); shopCoin(); shopSay(DANIEL.sold);
      if (tr) storyMsg('The ' + ITEMS[tr].name + ' went back to your items.', '#fff');
      if (!s.items.length) { P.mode = 'menu'; return; }
      P.li = Math.min(P.li, s.items.length - 1);
    });
    return;
  }
  if (r.refresh) {   // swap the deal for a new one
    if (s.coins < r.price) { shopSay(DANIEL.broke); AC && tone(160, T0(), .18, 'square', .12, 90); return; }
    askYesNo('', ['Refresh the deal', 'for ' + r.price + ' BC?'], () => {
      s.coins -= r.price; s.deal = newDeal(s.deal); P.li = 0;
      storySave(); shopCoin(); shopSay(DANIEL.refresh);
    });
    return;
  }
  if (r.deal) {
    if (s.coins < r.price) { shopSay(DANIEL.broke); AC && tone(160, T0(), .18, 'square', .12, 90); return; }
    if (s.relics < r.sr) { shopSay(DANIEL.noSR); AC && tone(160, T0(), .18, 'square', .12, 90); return; }
    if (itemsFull(s)) { shopSay(DANIEL.full); AC && tone(160, T0(), .18, 'square', .12, 90); return; }
    askYesNo('', ['Buy the ' + r.name + ' (' + ITEMS[trinketOf(r.id)].name + ')', 'for ' + r.price + ' BC + ' + r.sr + ' SR?'], () => {
      s.coins -= r.price; s.relics -= r.sr; s.items.push(r.id); s.deal = null;
      storySave(); shopChime(); shopSay(DANIEL.dealBuy); P.mode = 'menu';
    });
    return;
  }
  if (r.box) {
    if (r.sold) { if ((s.boxes || 0) >= MAX_BOXES) shopSay(DANIEL.hoard); else storyErr('You already have that box.'); return; }
    if (SHOP_BOXES[r.box].n > (s.boxes || 0) + 1) { storyErr('Buy Storage Box I first.'); return; }
  }
  if (s.coins < r.price) { shopSay(DANIEL.broke); AC && tone(160, T0(), .18, 'square', .12, 90); return; }
  if (!r.box && itemsFull(s)) { shopSay(DANIEL.full); AC && tone(160, T0(), .18, 'square', .12, 90); return; }
  askYesNo('', ['Buy the ' + r.name, 'for ' + r.price + ' BC?'], () => {
    s.coins -= r.price;
    if (r.box) { s.boxes = SHOP_BOXES[r.box].n; storyMsg('You can open ' + BOX_NAMES[s.boxes - 1] + ' from ITEM.', '#7dff3d'); }
    else s.items.push(r.id);
    storySave(); shopChime(); shopSay(DANIEL.buy);
  });
}
function shopMenuPick(m) {
  const P = ST.shop, s = cur(), c = shopMenu()[m];
  P.m = m;
  if (c == 'EXIT') { AC && sfxSel(); shopTalk([DANIEL.bye], () => { ST.shop = null; storyGo('shops', 0); }); return; }
  if (c == 'BUY') { AC && sfxSel(); P.mode = 'menu'; P.menu = 'buy'; P.m = 0; return; }   // the categories
  if (c == 'BACK') { shopBack(); return; }
  if (c == 'SELL' && !s.items.length) { storyErr('You have no items to sell.'); return; }
  if (c == 'DEALS' && !s.deal) { AC && sfxSel(); P.mode = 'menu'; shopSay(DANIEL.noDeal); return; }
  AC && sfxSel();
  P.mode = 'list'; P.cat = c; P.li = 0; P.top = 0;
  shopSay(c == 'DEALS' ? DANIEL.deals : c == 'STORAGE' && (s.boxes || 0) >= MAX_BOXES ? DANIEL.hoard : DANIEL.cat[c]);
}
/* X / B in the BUY menu: back to the main menu, on BUY */
function shopBack() { const P = ST.shop; AC && sfxSel(); P.mode = 'menu'; P.menu = 'main'; P.m = MAIN_MENU.indexOf('BUY'); }

/* ---------- input ---------- */
function shopPress(c, is) {
  if (ST.scr == 'shops') {
    if ((is(L) || is(R)) && ST.i < 3) { ST.i = (ST.i + (is(L) ? 2 : 1)) % 3; AC && sfxSel(); }
    else if (is(Dn) && ST.i < 3) { ST.j = ST.i; ST.i = 3; AC && sfxSel(); }
    else if (is(U) && ST.i == 3) { ST.i = ST.j || 0; AC && sfxSel(); }
    else if (is(OK)) shopChoose(ST.i);
    else if (is(NO)) leaveShops();
    return;
  }
  const P = ST.shop;
  if (P.mode == 'talk') {
    if (!(is(OK) || is(NO))) return;
    if (shopTyping()) { P.t0 = -1e9; return; }   // first press finishes the line
    AC && sfxSel();
    if (P.pi + 1 < P.pages.length) { P.pi++; shopSay(P.pages[P.pi]); return; }
    const after = P.after; P.mode = 'menu'; P.pages = null; P.after = null;
    if (after) after();
    return;
  }
  if (P.mode == 'menu') {
    const n = shopMenu().length;
    if (is(U) || is(Dn)) { P.m = (P.m + (is(U) ? n - 1 : 1)) % n; AC && sfxSel(); }
    else if (is(OK)) shopMenuPick(P.m);
    else if (is(NO)) { if (P.menu == 'buy') shopBack(); else shopMenuPick(MAIN_MENU.indexOf('EXIT')); }
    return;
  }
  const n = shopRows(P.cat).length;   // list
  if (is(U) || is(Dn)) { if (n > 1) { P.li = (P.li + (is(U) ? n - 1 : 1)) % n; AC && sfxSel(); } }
  else if (is(OK)) shopPick();
  else if (is(NO)) { P.mode = 'menu'; AC && sfxSel(); }
}
function shopChoose(k) {
  if (k == 3) { leaveShops(); return; }
  if (!shopOpen(cur(), k)) { storyErr('This shop is locked.'); return; }
  enterShop1();
}
function shopTap(x, y, inR) {
  if (ST.scr == 'shops') {
    for (let k = 0; k < 3; k++) if (inR(SHOPC.x(k), SHOPC.y, SHOPC.w, SHOPC.h)) { if (ST.i == k) shopChoose(k); else { ST.i = k; AC && sfxSel(); } return; }
    if (inR(W / 2 - 100, BACK_Y - 22, 200, 44)) { if (ST.i == 3) leaveShops(); else { ST.i = 3; AC && sfxSel(); } }
    return;
  }
  const P = ST.shop, press = code => shopPress(code, a => a.includes(code));
  if (P.mode == 'talk') { press(OK[0]); return; }
  const menu = shopMenu();
  for (let m = 0; m < menu.length; m++) if (inR(SHOPR.x, SHOPR.y + SHOP_MENU_Y + m * SHOP_MENU_GAP - 22, SHOPR.w, SHOP_MENU_GAP)) {
    if (P.mode == 'menu' && P.m == m) shopMenuPick(m);
    else if (P.mode == 'list' && P.cat == menu[m]) { P.mode = 'menu'; AC && sfxSel(); }
    else if (menu[m] == 'EXIT' || menu[m] == 'BACK' || P.mode == 'list') shopMenuPick(m);   // in a list: another category opens right away
    else { P.m = m; AC && sfxSel(); }
    return;
  }
  if (P.mode == 'list') {
    const n = shopRows(P.cat).length, top = shopTop();
    for (let k = top; k < Math.min(n, top + SHOP_ROWS); k++) if (inR(SHOPL.x + 10, SHOPL.y + SHOP_ROW_Y + (k - top) * SHOP_ROW_GAP - 20, SHOPL.w - 20, SHOP_ROW_GAP)) {
      if (P.li == k) shopPick(); else { P.li = k; AC && sfxSel(); }
      return;
    }
  }
}

/* ---------- drawing ---------- */
const SHOPC = { x: k => W / 2 + (k - 1) * 240 - 100, y: 150, w: 200, h: 240 };   // shop cards on the 'shops' screen
const SHOPL = { x: 16, y: 350, w: 512, h: 238 }, SHOPR = { x: 540, y: 350, w: 244, h: 238 };   // Daniel's shop: text / list box, menu box
const SHOP_ROW_Y = 92, SHOP_ROW_GAP = 26, SHOP_MENU_Y = 38, SHOP_MENU_GAP = 30;
const shopTop = () => { const P = ST.shop, n = shopRows(P.cat).length; P.top = Math.max(0, Math.min(P.li < P.top ? P.li : P.li >= P.top + SHOP_ROWS ? P.li - SHOP_ROWS + 1 : P.top, n - SHOP_ROWS)); return P.top; };

function drawShop() { if (ST.scr == 'shops') drawShopChoice(); else drawShop1(); }


function rrect(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
/* Daniel's head (beanie, dot eyes, grin), drawn in the mock-up's coordinates: head box 290..390 x 100..194 */
function danielHead(talk, blink) {
  g.fillStyle = '#2ec4b6'; rrect(290, 100, 100, 94, 10); g.fill();
  g.fillStyle = '#d62839'; g.beginPath(); g.moveTo(286, 108); g.quadraticCurveTo(290, 56, 340, 54); g.quadraticCurveTo(390, 56, 394, 108); g.closePath(); g.fill();
  g.fillStyle = '#a81d2c'; rrect(282, 100, 116, 16, 4); g.fill();
  g.fillStyle = '#14161c';
  if (blink) { g.fillRect(316, 143, 12, 3); g.fillRect(352, 143, 12, 3); }
  else { g.beginPath(); g.arc(322, 144, 5, 0, 7); g.fill(); g.beginPath(); g.arc(358, 144, 5, 0, 7); g.fill(); }
  g.strokeStyle = '#14161c'; g.lineWidth = 4; g.lineCap = 'round';
  if (talk) { g.beginPath(); g.moveTo(314, 164); g.quadraticCurveTo(340, 194, 366, 164); g.closePath(); g.fill(); g.stroke(); }   // open grin while talking
  else { g.beginPath(); g.moveTo(314, 164); g.quadraticCurveTo(340, 186, 366, 164); g.stroke(); }
  g.lineCap = 'butt';
}
/* Daniel behind his counter, with his axe over his shoulder */
function drawDaniel(talk) {
  const t = performance.now() / 1000, dy = SET.reduceFlash ? 0 : Math.sin(t * 2) * 1.5, blink = t % 4 < .12;
  g.save(); g.translate(0, dy);
  /* axe over his shoulder: wooden handle (dark cap on top, grip wrap lower down) and a single-blade head */
  g.lineCap = 'round'; g.lineWidth = 8;
  g.strokeStyle = '#8a5a3a'; g.beginPath(); g.moveTo(394, 78); g.lineTo(432, 266); g.stroke();   // handle
  g.strokeStyle = '#5c3a24'; g.beginPath(); g.moveTo(394, 78); g.lineTo(397, 93); g.stroke();     // cap
  g.lineCap = 'butt'; g.lineWidth = 10; g.strokeStyle = '#3a2418'; g.beginPath(); g.moveTo(409, 150); g.lineTo(415, 180); g.stroke();   // grip wrap
  g.save(); g.translate(398, 98); g.rotate(-11.9 * Math.PI / 180);   // head, square to the handle
  g.fillStyle = '#8a8f99'; g.fillRect(-14, -12, 12, 20);   // flat back
  g.fillStyle = '#b9bec7'; g.beginPath(); g.moveTo(-3, -12); g.lineTo(16, -20); g.quadraticCurveTo(30, -2, 16, 30); g.lineTo(-3, 10); g.closePath(); g.fill();   // steel wedge
  g.fillStyle = '#d7dbe2'; g.beginPath(); g.moveTo(-3, -12); g.lineTo(16, -20); g.lineTo(14, -14); g.lineTo(-3, -6); g.closePath(); g.fill();   // top shine
  g.strokeStyle = '#eef2f7'; g.lineWidth = 4; g.beginPath(); g.moveTo(16, -20); g.quadraticCurveTo(30, -2, 16, 30); g.stroke();   // bright cutting edge
  g.restore();
  g.fillStyle = '#7a1f2b'; g.beginPath(); g.moveTo(290, 190); g.lineTo(390, 190); g.lineTo(410, 260); g.lineTo(270, 260); g.closePath(); g.fill();   // maroon shirt
  g.fillStyle = '#9c3442';   // its square pattern
  [[298, 200], [322, 200], [346, 200], [370, 200], [286, 224], [310, 224], [334, 224], [358, 224], [382, 224], [298, 246], [322, 246], [346, 246], [370, 246]].forEach(([x, y]) => g.fillRect(x, y, 12, 12));
  g.strokeStyle = '#7a1f2b'; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(392, 196); g.lineTo(414, 214); g.lineTo(404, 232); g.stroke(); g.lineCap = 'butt'; g.lineJoin = 'miter';   // arm holding the axe
  g.fillStyle = '#2ec4b6'; g.beginPath(); g.arc(404, 232, 9, 0, 7); g.fill();   // hand
  danielHead(talk, blink);
  g.restore();
}
/* the top of the screen: back wall, shelves of stock, Daniel, the counter */
function drawShopScene(talk) {
  g.save(); g.scale(1.25, 1.25); g.translate(-20, -20);   // mock-up coordinates (640 x 270 area) -> full width
  g.fillStyle = '#1a1016'; g.fillRect(20, 20, 640, 270);
  g.fillStyle = '#3a2418'; [[40, 70], [40, 140], [470, 70], [470, 140]].forEach(([x, y]) => g.fillRect(x, y, 170, 8));   // shelves
  [[56, 48, 18, 22, '#ff86bd'], [84, 52, 22, 18, '#7dff3d'], [118, 44, 14, 26, '#ffd23f'], [150, 50, 26, 20, '#19e3ff'],
   [60, 116, 26, 24, '#d9d9e0'], [100, 120, 18, 20, '#b8005a'], [134, 112, 30, 28, '#8a5a3a'],
   [488, 50, 20, 20, '#ff2e88'], [520, 46, 16, 24, '#bfe3ff'], [552, 52, 26, 18, '#e8b84a'], [592, 48, 18, 22, '#7dff3d'],
   [490, 114, 30, 26, '#5a2a3a'], [536, 118, 22, 22, '#ffd23f'], [574, 112, 26, 28, '#d9d9e0']].forEach(([x, y, w, h, c]) => { g.fillStyle = c; g.fillRect(x, y, w, h); });
  drawDaniel(talk);
  g.fillStyle = '#6b4228'; g.fillRect(20, 256, 640, 34); g.fillStyle = '#8a5a3a'; g.fillRect(20, 256, 640, 6);   // counter
  g.restore();
}
/* word wrap for Daniel's lines (later lines indented under the "* ") */
function shopWrap(text, size, maxW) {
  g.font = 'bold ' + size + 'px monospace';
  const out = [];
  text.split('\n').forEach(par => {
    let line = '';
    par.split(' ').forEach(w => {
      const next = line ? line + ' ' + w : w;
      if (line && g.measureText(next).width > maxW) { out.push(line); line = '  ' + w; } else line = next;
    });
    out.push(line);
  });
  return out;
}
function shopBox(b) { g.fillStyle = '#000'; g.fillRect(b.x, b.y, b.w, b.h); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(b.x, b.y, b.w, b.h); }

function drawShop1() {
  const s = cur(), P = ST.shop, typing = shopTyping(), talk = typing && Math.floor(performance.now() / 110) % 2 == 0;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  drawShopScene(talk);
  /* left box: Daniel's line, then the list */
  shopBox(SHOPL);
  const x0 = SHOPL.x + 20, big = P.mode == 'talk', size = big ? 20 : 16, gap = big ? 30 : 22;
  let n = Math.max(0, shopChars());
  shopWrap(P.line, size, SHOPL.w - 40).slice(0, big ? 6 : 3).forEach((l, i) => {   // typed out letter by letter
    const show = l.slice(0, Math.max(0, n)); n -= l.length + 1;
    if (show) txt(show, x0, SHOPL.y + 32 + i * gap, size, big ? '#fff' : '#bbb', 'left', 0, true);
  });
  if (big && !typing && Math.floor(Date.now() / 400) % 2) txt('Enter / Z / Space / A', SHOPL.x + SHOPL.w - 16, SHOPL.y + SHOPL.h - 14, 14, '#888', 'right');
  if (P.mode == 'list') {
    const rows = shopRows(P.cat), top = shopTop();
    rows.forEach((r, k) => {
      if (k < top || k >= top + SHOP_ROWS) return;
      const on = P.li == k, ry = SHOPL.y + SHOP_ROW_Y + (k - top) * SHOP_ROW_GAP, sell = P.cat == 'SELL';
      if (on) soul(x0 + 2, ry - 6, '#19e3ff');
      txt('* ' + r.name, x0 + 22, ry, 17, on ? '#ff0' : '#fff', 'left', 300, true);
      const tr = r.id && trinketOf(r.id);
      if (tr) { g.font = 'bold 17px monospace'; g.fillStyle = ITEMS[tr].col; g.fillRect(x0 + 22 + Math.min(300, g.measureText('* ' + r.name).width) + 8, ry - 12, 12, 12); }
      txt(r.no ? 'NO DEAL' : r.sold ? 'SOLD OUT' : (sell ? '+' : '') + r.price + ' BC' + (r.sr ? ' + ' + r.sr + ' SR' : ''), SHOPL.x + SHOPL.w - 36, ry, 15, r.sold || r.no ? '#555' : sell ? '#7dff3d' : s.coins < r.price || s.relics < (r.sr || 0) ? '#ff5a5a' : '#ffd23f', 'right', 0, true);
    });
    scrollArrows(SHOPL.x + SHOPL.w - 18, SHOPL.y + SHOP_ROW_Y - 14, SHOPL.y + SHOP_ROW_Y + (SHOP_ROWS - 1) * SHOP_ROW_GAP + 4, top > 0, top + SHOP_ROWS < rows.length);
    const r = rows[P.li];
    if (ST.msgT > 0) txt(ST.msg, x0, SHOPL.y + 196, 14, ST.msgCol, 'left', SHOPL.w - 40, true);
    else if (r) txt(r.detail, x0 + 22, SHOPL.y + 196, 14, '#888', 'left', SHOPL.w - 60, true);
  } else if (!big && ST.msgT > 0) txt(ST.msg, x0, SHOPL.y + 196, 14, ST.msgCol, 'left', SHOPL.w - 40, true);
  if (!big) {
    txt('BC ' + s.coins + '   SR ' + s.relics, x0, SHOPL.y + SHOPL.h - 16, 16, '#fff', 'left', 0, true);
    txt('ITEMS ' + s.items.length + ' / ' + MAX_ITEMS, SHOPL.x + SHOPL.w - 20, SHOPL.y + SHOPL.h - 16, 16, itemsFull(s) ? '#ff5a5a' : '#fff', 'right', 0, true);
  }
  /* right box: the menu */
  shopBox(SHOPR);
  shopMenu().forEach((c, m) => {
    const ry = SHOPR.y + SHOP_MENU_Y + m * SHOP_MENU_GAP, sel = P.mode == 'menu' && P.m == m, open = P.mode == 'list' && P.cat == c;
    if (sel) soul(SHOPR.x + 24, ry - 6, '#19e3ff');
    txt(c, SHOPR.x + 44, ry, 17, sel ? '#ff0' : open ? '#fff' : P.mode == 'talk' ? '#444' : '#888', 'left', 0, true);
    if (c == 'DEALS' && s.deal) {   // a deal is waiting: yellow "!"
      g.font = 'bold 17px monospace'; const bx = SHOPR.x + 44 + g.measureText(c).width + 16, by = ry - 6;
      g.fillStyle = '#000'; g.strokeStyle = '#ff0'; g.lineWidth = 2; g.beginPath(); g.arc(bx, by, 10, 0, 7); g.fill(); g.stroke();
      txt('!', bx, by + 6, 15, '#ff0', 'center', 0, true);
    }
  });
  if (!big) txt(P.mode == 'list' || P.menu == 'buy' ? 'X / B: back' : 'X / B: leave', SHOPR.x + SHOPR.w / 2, SHOPR.y + SHOPR.h - 16, 13, '#777', 'center', 0, true);
}

function drawShopChoice() {
  const s = cur();
  txt('SHOPS', W / 2, 90, 40, '#fff', 'center', 0, true);
  for (let k = 0; k < 3; k++) {
    const x = SHOPC.x(k), y = SHOPC.y, on = ST.i == k, open = shopOpen(s, k), cx = x + SHOPC.w / 2;
    g.strokeStyle = on ? '#19e3ff' : '#444'; g.lineWidth = on ? 4 : 2; g.strokeRect(x, y, SHOPC.w, SHOPC.h);
    if (on) soul(x - 18, y + SHOPC.h / 2, '#19e3ff');
    if (open) {   // Daniel's head as the shop's sign
      g.save(); g.translate(cx, y + 92); g.scale(.75, .75); g.translate(-340, -130); danielHead(false, performance.now() / 1000 % 4 < .12); g.restore();
      txt("DANIEL'S", cx, y + 176, 20, on ? '#ff0' : '#fff', 'center', SHOPC.w - 16, true);
      txt('SHOP', cx, y + 200, 20, on ? '#ff0' : '#fff', 'center', SHOPC.w - 16, true);
      txt('OPEN', cx, y + 226, 15, '#7dff3d', 'center', 0, true);
    } else {
      txt('???', cx, y + 100, 48, '#555', 'center', 0, true);
      g.strokeStyle = '#777'; g.lineWidth = 3; g.beginPath(); g.arc(cx, y + 132, 11, Math.PI, 0); g.stroke();
      g.fillStyle = '#777'; g.fillRect(cx - 17, y + 130, 34, 26);
      txt('???', cx, y + 200, 20, on ? '#ff0' : '#555', 'center', 0, true);
      txt('LOCKED', cx, y + 226, 15, '#555', 'center', 0, true);
    }
  }
  backButton(ST.i == 3);
  drawMsg(545);
  txt('Left / Right choose    Enter / Z / A enter    X / B back', W / 2, 575, 14, '#777', 'center');
}
