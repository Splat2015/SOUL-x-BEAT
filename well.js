/* ==========================================================================
   SOUL x BEAT — the well in Square Village (story mode). Loaded after story.js and shop.js.

   It sits next to the Slap Strap's star (a stand spot, STANDS[2] { well: 1 }). Lucaster is trapped inside.
   s.well.st: 0 = make a wish (toss 1 SR) -> 1 = you heard shouting -> (win a fight) 2 = he talks to you,
   gives an HP Potion (or leaves it in the raised bucket if your items are full) -> 3 = TALK / BUY / LEAVE.
   BUY: 5 SR for a random potion (SP / HP / ATK / DEF), 5 in stock. The potions themselves are in story.js.
   All of his text is the user's script; a page starting with "~" shows in corrupted pink (hubSay).
   ========================================================================== */

const WELL_PRICE = 5, WELL_POTIONS = ['spot', 'hppot', 'atkpot', 'defpot'];
const WELL = {
  intro: ["* It's just an old well.\n* Nothing seems too suspicious about it...", "* There's a note attached to it.", '* "1 relic = 1 wish!"', '* Would you like to toss in 1 SR?'],
  no: ['* Oh Well...'],
  broke: ['* Who walks up to a well with no relics?'],
  wish: ['* You tossed a relic in, hoping for a granted wish.', '* ...', '* Any minute now.', '* ...', '* Ok, that was pretty lame.',
    '* You left the well, feeling utterly hopeless now.', "* But while leaving...\n* You could've sworn you heard someone shouting for help."],
  pleas: ["* You really can't ignore those pleas..."],
  meet: ["* Ok, it's really not becoming a joke anymore.\n* Whatever's down there shouting sounds desperate.",
    "* Slowly, you begin leaning your ear closer.\n* And that's when you hear it.",
    '* "Help! Somebody help me out of this pit!"', '* They then look up and notice you.',
    '* "Hey... are you the one who tossed that relic?"', '* "Thank heavens, I thought I was going broke!"',
    '* "Erm... I guess you deserve something too."\n* "Have this, it\'s one of many I\'ve concocted."'],
  got: ['* You got the HP Potion.'],
  full: ['* "Oh, you don\'t have enough room."', '* "Well then... I\'ll just leave this here."'],
  after: ['* "Anyway, you probably have questions."', '* "Like how I even got stuck in here to begin with."',
    '* "That... Or you just want more potions."\n* "My stock is quite limited, now at 5 potions."',
    '* "I\'ll take 5 Soul Relics for each potion, is that a deal?"', '* "What are you waiting for? Make a choice already!"'],
  greet: ['* "Hey, hey! You up there!"\n* "It\'s been a bit, huh?"', '* "So what\'d you like?"'],
  talk: ['* "Nothing better than small talk, I guess."\n* "What\'s up?"'],
  yourself: ['* "Ok... uh, where do I start?"', '* "My name is Lucaster."', '* "I\'m not exactly from this town."\n* "The one you\'re in right now."',
    '* "I was one of the survivors of the returning doom..."\n* "The thing... that we thought was gone for good."',
    '~* "The corruption."',
    '* "It was said that for almost centuries, a battle was fought."\n* "One between the pure and the corrupted."',
    '* "It was a battle never to be forgotten."', '* "... Especially since it just returned."',
    '* "While running from the others, I wasn\'t paying attention."\n* "And then next thing you know..."',
    '* "Now I\'m just stuck talking to someone who thinks they can save the world."\n* "It feels a bit far, now that I think about it."',
    '* "This is all I have to say;"\n* "I hope you know what you\'re doing."'],
  soulcerers: ['* "Let me ask you something real quick."', '* "Do you see these statues around the villages?"', '* "Of course you have, haven\'t you?"',
    '* "Those statues were built to thank the heroes of the previous war."', '* "However... almost all of them are in a state of being corrupted."',
    '* "Not to mention the legend,"\n* "The one that said the souls of the fallen heroes,"', '* "Went on to live inside the statues."',
    '* "That way the villages could be protected even without their presence."',
    '* "But because the statues are in the process of being corrupted,"\n* "Their souls might not be able to escape."',
    '* "Even worse... they might even corrupt alongside the statue."', '* "...But hey! You know what\'s coincidental?"',
    '* "The statue in this village sort of looks like you."', '* "It\'s almost like you were a descendant from them..."',
    '* "I\'ve visited most of these villages,"\n* "And can confidently say that there are about 4 statues."', '* "In each of them."',
    '* "..."', '* "Star?"', '* "A Star Soulcerer statue?"', '* "I have no idea what you\'re talking about!"', '* "There\'s 4 of them, right?"',
    '* "They said that 4 Soulcerers fought and died in the war."', '* "You\'re just messing with my head..."'],
  vendor: ['* "That... BASTARD!"', '* "..."', '* "Please pardon that."', '* "I just have... a bit of a bad history with him."',
    '* "One time he\'d call me over to buy one of his potions."', '* "You know... ones with them fancy names and all of that."',
    '* "And then I bought one."', '* "But as I was walking away,"\n* "I couldn\'t help but notice his almost smug look."',
    '* "I thought nothing of it."', '* "I thought he was just snickering about something else."', '* "...I thought wrong."',
    '* "Before I knew it, I drank that potion..."\n* "And collapsed to the floor, unconscious."',
    '* "When I woke up, I\'d have just realized what had happened."', '* "I stormed up to that stand,"\n* "And I was about to demand a damn refund."',
    '* "But... All I saw was a note taking the stand\'s place"', '* "The note mocked me.."\n* "Said how foolish I was to trust someone as shady as him..."',
    '* "..."', '* "What a strange vendor."', '* "Don\'t you agree?"'],
  bye: ['* "Safe travels, alright?"'],
  poor: ['* "Sorry, you don\'t have enough..."'],
  pockets: ['* "Hey, buddy..."\n* "Have you ever considered freeing up space?"'],
  soldOut: ['* "I have nothing more for you..."\n* "But if you\'d like, chit-chatting is still an option."'],
};

/* long lines wrap (later lines indented under the "* "), and pages longer than 3 lines split into more pages */
const WELL_WRAP = 54;   // the text box fits about 56 letters per line
function wellWrap(line) {
  if (line.length <= WELL_WRAP) return [line];
  const out = []; let cur = '';
  line.split(' ').forEach(w => {
    const next = cur ? cur + ' ' + w : w;
    if (cur && next.length > WELL_WRAP) { out.push(cur); cur = '  ' + w; } else cur = next;
  });
  out.push(cur);
  return out;
}
function wellPages(blocks) {
  const out = [];
  blocks.forEach(b => {
    const fx = b[0] == '~', lines = (fx ? b.slice(1) : b).split('\n').flatMap(wellWrap);
    for (let i = 0; i < lines.length; i += 3) out.push((fx ? '~' : '') + lines.slice(i, i + 3).join('\n'));
  });
  return out;
}
const wellSay = (blocks, after) => hubSay(wellPages(blocks), after);
function sfxPlop() { if (AC) { tone(520, T0(), .12, 'sine', .14, 260); tone(300, T0() + .35, .2, 'sine', .08, 180); } }

/* ---------- selecting the well ---------- */
function openWell() {
  const s = cur(), w = s.well;
  AC && sfxSel();
  if (w.st == 0) {   // make a wish
    wellSay(WELL.intro, () => askYesNo('', ['Toss in 1 SR?'], () => {
      if (s.relics < 1) { wellSay(WELL.broke); return; }
      s.relics--; w.st = 1; storySave(); sfxPlop();
      wellSay(WELL.wish);
    }, () => wellSay(WELL.no)));
  }
  else if (w.st == 1) wellSay(WELL.pleas);   // no fight finished since the wish
  else if (w.st == 2) {   // Lucaster, the first time
    wellSay(WELL.meet, () => {
      w.st = 3; w.stock = 5;
      const next = () => wellSay(WELL.after, wellMenu);
      if (itemsFull(s)) { w.bucket = 1; storySave(); wellSay(WELL.full, next); }   // the potion waits in the bucket
      else { s.items.push('hppot'); storySave(); wellGotSfx(); wellSay(WELL.got, next); }
    });
  }
  else if (w.bucket && !itemsFull(s)) {   // the HP Potion left in the bucket
    w.bucket = 0; s.items.push('hppot'); storySave(); wellGotSfx();
    wellSay(WELL.got, () => wellSay(WELL.greet, wellMenu));
  }
  else wellSay(WELL.greet, wellMenu);
}
function wellGotSfx() { if (AC) { tone(1046, T0(), .08, 'square', .1); tone(1568, T0() + .07, .12, 'square', .1); } }

/* TALK / BUY / LEAVE (a list dialog; X / B = LEAVE) */
function wellMenu() {
  const w = cur().well;
  ST.panel = 'lst';
  ST.lst = {
    title: 'THE WELL', i: 0, cancel: true, onBack: wellLeave,
    rows: ['TALK', 'BUY   ' + WELL_PRICE + ' SR  (' + w.stock + ' left)', 'LEAVE'],
    pick(i) { ST.lst = null; ST.panel = null; AC && sfxSel(); [wellTalk, wellBuy, wellLeave][i](); },
  };
}
function wellLeave() { wellSay(WELL.bye); }
function wellTalk() { wellSay(WELL.talk, wellTopics); }
function wellTopics() {
  ST.panel = 'lst';
  ST.lst = {
    title: 'TALK ABOUT?', i: 0, cancel: true, onBack: wellMenu,
    rows: ['YOURSELF', 'SOULCERERS', 'POTIONS VENDOR', 'BACK'],
    pick(i) {
      ST.lst = null; ST.panel = null; AC && sfxSel();
      if (i == 3) { wellMenu(); return; }
      wellSay([WELL.yourself, WELL.soulcerers, WELL.vendor][i], wellTopics);
    },
  };
}
/* BUY: 5 SR for a random potion */
function wellBuy() {
  const s = cur(), w = s.well;
  if (w.stock <= 0) { wellSay(WELL.soldOut, wellMenu); return; }
  if (s.relics < WELL_PRICE) { wellSay(WELL.poor, wellMenu); return; }
  if (itemsFull(s)) { wellSay(WELL.pockets, wellMenu); return; }
  askYesNo('', ['Buy a random potion', 'for ' + WELL_PRICE + ' SR?'], () => {
    const id = WELL_POTIONS[Math.floor(Math.random() * WELL_POTIONS.length)];
    s.relics -= WELL_PRICE; w.stock--; s.items.push(id); storySave(); wellGotSfx();
    wellSay(['* You got the ' + ITEMS[id].name + '.'], wellMenu);
  }, wellMenu);
}

/* ---------- drawing (a stand spot in the hub: x, y = its top left, 90 x 90) ---------- */
function drawWell(x, y, on) {
  const w = cur().well, up = w.bucket, bob = SET.reduceFlash ? 0 : Math.sin(performance.now() / 600) * .8;
  g.save(); g.translate(x, y);
  g.fillStyle = '#6b4228'; g.fillRect(18, 10, 5, 34); g.fillRect(63, 10, 5, 34);   // posts
  g.fillStyle = '#a8323e'; g.beginPath(); g.moveTo(10, 14); g.lineTo(43, 0); g.lineTo(76, 14); g.closePath(); g.fill();   // roof
  g.fillStyle = '#7a1f2b'; g.fillRect(10, 13, 66, 3);
  g.fillStyle = '#8a5a3a'; g.fillRect(20, 16, 46, 3);   // the beam the rope hangs from
  const by = up ? 21 : 34 + bob;   // bucket: hanging inside, or pulled up holding the potion
  g.strokeStyle = '#d9c9a0'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(43, 19); g.lineTo(43, by); g.stroke();
  g.fillStyle = '#8a5a3a'; g.beginPath(); g.moveTo(37, by); g.lineTo(49, by); g.lineTo(47, by + 7); g.lineTo(39, by + 7); g.closePath(); g.fill();
  if (up) { g.fillStyle = '#fff'; g.fillRect(41, by - 8, 4, 4); g.fillStyle = '#7dff3d'; g.beginPath(); g.arc(43, by - 1, 3.5, 0, 7); g.fill(); }   // the HP Potion in the bucket (green)
  g.fillStyle = '#111'; g.beginPath(); g.ellipse(43, 44, 29, 6, 0, 0, 7); g.fill();   // the dark hole
  g.fillStyle = '#8f8f99'; g.beginPath(); g.moveTo(14, 44); g.lineTo(14, 58); g.quadraticCurveTo(43, 66, 72, 58); g.lineTo(72, 44); g.quadraticCurveTo(43, 52, 14, 44); g.closePath(); g.fill();   // stone ring
  g.strokeStyle = '#5f5f68'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(14, 51); g.quadraticCurveTo(43, 59, 72, 51);
  [[24, 46, 53], [38, 48, 56], [52, 48, 56], [64, 46, 53], [30, 55, 61], [46, 56, 62], [60, 54, 60]].forEach(([a, b, c]) => { g.moveTo(a, b); g.lineTo(a, c); });
  g.stroke();
  g.strokeStyle = '#b3b3bd'; g.lineWidth = 2; g.beginPath(); g.ellipse(43, 44, 29, 6, 0, 0, 7); g.stroke();
  g.restore();
  if (on) { g.strokeStyle = '#ff0'; g.lineWidth = 3; g.strokeRect(x - 2, y + 2, 90, 62); soul(x - 14, y + 34, '#19e3ff'); }
  txt('WELL', x + 43, y + 82, 13, on ? '#ff0' : '#aaa', 'center', 0, true);
}
