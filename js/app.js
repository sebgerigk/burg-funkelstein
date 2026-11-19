// Burg Funkelstein – Einstieg. Meldet die Bildschirme an und startet.
import { go, setGuard, onScreen } from './engine/router.js';
import { startPlaytime, setScreen, timeIsUp, PLAY_SCREENS } from './engine/playtime.js';
import { initAudio } from './engine/audio.js';
import { requestPersistence, initStorage } from './engine/storage.js';
import './screens/title.js';
import './screens/figur.js';
import './screens/map.js';
import './screens/place.js';
import './screens/round.js';
import './screens/castle.js';
import './screens/eltern.js';
import './screens/pause.js';

async function boot() {
  requestPersistence();
  await Promise.all([initAudio(), initStorage()]);
  // Spielzeit zählen und nach Erreichen des Tageslimits freundlich verabschieden.
  // Eine laufende Runde wird nicht unterbrochen: geprüft wird nur beim Wechsel des Bildschirms.
  onScreen(setScreen);
  setGuard(name => (PLAY_SCREENS.includes(name) && timeIsUp() ? 'pause' : name));
  startPlaytime();
  go('title');
}

// Kein Zoomen, kein Kontextmenü, kein Gummiband-Scrollen – die App soll sich wie eine App anfühlen.
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('touchmove', e => {
  if (!e.target.closest('.eltern-body')) e.preventDefault();
}, { passive: false });

// Offline-Betrieb (nur über https bzw. localhost möglich).
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

boot();
