/* ==========================================================================
   SOUL x BEAT — mp3 music
   Every mp3 the game plays is listed in TRACKS and played through here.
   (The generated chiptune / EDM / dubstep songs stay in script.js.)
   Tracks loop and follow the MUSIC volume in Settings (SET.music, 0-10).

   Each song lives in its own "song-....js" file next to index.html, holding the
   mp3 as Base64 text (so it works on sites that only accept code, like OneCompiler).
   A song file is only loaded the first time that song plays, then kept in memory.

   Use:  playTrack('corrupted')   start (or keep playing) a track
         stopTrack()              pause whatever mp3 is playing
   ========================================================================== */

/* file: the song file that sets SONGS[<id>] to the Base64 mp3 */
const TRACKS = {
  corrupted: { file: 'song-agrobacter.js', title: 'Agrobacter (Corrupted Mix)', artist: 'Just Shapes & Beats' },
  racer: { file: 'song-racer.js', title: 'RALLY-X A GO GO', artist: 'Hiroyuki Kawada & Nobuyuki Ohnogi' },
  tanga: { file: 'song-tanga.js', title: 'TILA EN STEREO', artist: 'Rainbowdragoneyes' },
  neutlin: { file: 'song-neutlin.js', title: 'Come and Find Me (B Mix)', artist: 'Eric Skiff' },   // Neutlin's battle song (CC BY 3.0): 111 BPM, first beat .0635 s; plays 0-4 s once (introBeats 7.2825), then loops 4.0 s to 99.1 s (loopBeats 176 = 44 bars)
  pancy: { file: 'song-pancy.js', title: 'Drifting Deeper', artist: 'Zef (feat. Stemage)' },   // Pancy's battle song: 120 BPM, first beat .087 s; plays 0-16 s once (introBeats 32), then loops 16.1 s to 112.1 s (loopBeats 192 = 48 bars)
  slug: { file: 'song-slug.js', title: 'Splash Woman', artist: 'Mega Ran' },   // $lug Thug's battle song (instrumental; 107 BPM, 112 beats loop)   // Tanga's battle song (160 BPM; 32-beat intro plays once, then 128 beats loop)   // Racer's battle song (144 BPM)
};

window.SONGS = window.SONGS || {};   // filled in by the song files: SONGS[id] = Base64 mp3
const MP3 = { id: null, audio: null, cache: {}, loading: {}, want: null };

/* load a song file once; calls done() when its data is ready */
function loadSong(id, done) {
  if (SONGS[id]) { done(); return; }
  if (MP3.loading[id]) return;   // already on its way
  MP3.loading[id] = 1;
  const s = document.createElement('script');
  s.src = TRACKS[id].file;
  s.onload = () => { MP3.loading[id] = 0; if (SONGS[id]) done(); };
  s.onerror = () => { MP3.loading[id] = 0; console.warn('Song file missing: ' + TRACKS[id].file); };
  document.head.appendChild(s);
}

/* Base64 text -> a playable blob: URL (made once per track) */
function songUrl(id) {
  const bin = atob(SONGS[id]), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  SONGS[id] = null;   // the text isn't needed once the mp3 is rebuilt
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
}

function playTrack(id) {
  if (!TRACKS[id]) return;
  MP3.want = id;
  if (!MP3.cache[id]) {   // first time: load the song file, then start if it's still wanted
    loadSong(id, () => {
      if (!MP3.cache[id]) { const a = new Audio(songUrl(id)); a.loop = true; MP3.cache[id] = a; }
      if (MP3.want == id) playTrack(id);
    });
    return;
  }
  if (MP3.id != id) {
    if (MP3.audio && !MP3.audio.paused) MP3.audio.pause();
    MP3.id = id;
    MP3.audio = MP3.cache[id];
  }
  MP3.audio.volume = Math.max(0, Math.min(1, SET.music / 10));
  if (MP3.audio.paused) MP3.audio.play().catch(() => {});
}

function stopTrack() {
  MP3.want = null;
  if (MP3.audio && !MP3.audio.paused) MP3.audio.pause();
  MP3.id = null;
  MP3.audio = null;
}

const trackPlaying = id => MP3.id == id && !!MP3.audio && !MP3.audio.paused;

/* ---------- battle songs ----------
   Boss battles with an mp3 (BOSSES[i].mp3 = a TRACKS id) play it through the game's own audio
   (script.js startMusic), so the beat clock and the song stay locked together and loop seamlessly.
   trackBuffer(id, done) loads the song file and decodes it once; done(buffer) gets the AudioBuffer. */
const BUF = { ready: {}, wait: {} };
function trackBuffer(id, done) {
  if (BUF.ready[id]) { if (done) done(BUF.ready[id]); return; }
  const list = BUF.wait[id];
  if (list) { if (done) list.push(done); return; }   // already loading / decoding
  BUF.wait[id] = done ? [done] : [];
  loadSong(id, () => {
    if (!AC) initAudio();
    const bin = atob(SONGS[id]), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    SONGS[id] = null;   // the text isn't needed once the bytes are made
    AC.decodeAudioData(bytes.buffer).then(b => {
      BUF.ready[id] = b;
      const w = BUF.wait[id]; BUF.wait[id] = null;
      w.forEach(f => f(b));
    }, () => { BUF.wait[id] = null; console.warn('Could not decode song: ' + id); });
  });
}
