/* ==========================================================================
   SOUL x BEAT — mp3 music
   Every mp3 the game plays is listed in TRACKS and played through here.
   (The generated chiptune / EDM / dubstep songs stay in script.js.)
   Tracks loop and follow the MUSIC volume in Settings (SET.music, 0-10).

   Use:  playTrack('corrupted')   start (or keep playing) a track
         stopTrack()              pause whatever mp3 is playing
   ========================================================================== */

const TRACKS = {
  corrupted: { file: 'music/agrobacter-corrupted.mp3', title: 'Agrobacter (Corrupted Mix)', artist: 'Just Shapes & Beats' },
};

const MP3 = { id: null, audio: null, cache: {} };

function playTrack(id) {
  const t = TRACKS[id];
  if (!t) return;
  if (MP3.id != id) {
    stopTrack();
    if (!MP3.cache[id]) {
      const a = new Audio(t.file);
      a.loop = true;
      MP3.cache[id] = a;
    }
    MP3.id = id;
    MP3.audio = MP3.cache[id];
  }
  MP3.audio.volume = Math.max(0, Math.min(1, SET.music / 10));
  if (MP3.audio.paused) MP3.audio.play().catch(() => {});
}

function stopTrack() {
  if (MP3.audio && !MP3.audio.paused) MP3.audio.pause();
  MP3.id = null;
  MP3.audio = null;
}

const trackPlaying = id => MP3.id == id && !!MP3.audio && !MP3.audio.paused;
