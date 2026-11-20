// Spielstand – liegt ausschließlich lokal auf dem Gerät. Ein Spielstand pro Gerät.
// Wie bei der Schatzinsel doppelt gesichert: in localStorage und in einer IndexedDB.
// Beim Start gilt die neuere Fassung (höherer Zähler „rev").

const KEY = 'burg-funkelstein.v1';
const DB_NAME = 'burg-funkelstein';
let idbOk = false;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  });
}

async function dbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction('kv').objectStore('kv').get(key);
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function dbPut(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(value, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

const defaults = () => ({
  // Die Spielfigur (ritterin, ritter, prinzessin, prinz); null = noch nicht gewählt
  figure: null,
  introSeen: false,
  // Je Station: wie oft gespielt, die feine Stufe (0–3) und die Hilfe der letzten Runden
  played: {}, step: {}, recent: {},
  // Heute gespielte Runden je Station (für „Probier doch mal was anderes")
  today: { date: '', rounds: {} },
  // Wie oft ein Inhalt schon dran war (selten Geübtes zuerst)
  seen: {},
  // Geschenke in der Burg (id -> true) und Edelsteine, wenn alles gesammelt ist
  owned: {}, gems: 0,
  // Einstellungen aus dem Elternbereich
  settings: {
    stufe: 'auto',            // 'auto' | 'klein' | 'gross'
    name: '',                 // Name des Kindes für „Mein Name" (Großbuchstaben)
    limitMin: 15,             // Spielzeit pro Tag, 0 = ohne Limit
    places: { schreib: true, zahl: true, musik: true, wald: true },
  },
  // Spielzeit: heute (Sekunden, Bonus) und Minuten der letzten Tage
  playtime: { date: '', sec: 0, bonus: 0 }, history: {},
});

function load() {
  try {
    return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {});
  } catch {
    return defaults();
  }
}

/** false, wenn der Browser nichts speichern darf (z. B. Safari mit blockierten Cookies). */
export const storageOk = (() => {
  try {
    localStorage.setItem(KEY + '.test', '1');
    localStorage.removeItem(KEY + '.test');
    return true;
  } catch {
    return false;
  }
})();

/** Bittet das Gerät, den Spielstand nicht von selbst aufzuräumen. */
export function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  } catch { /* nicht überall verfügbar */ }
}

let state = load();

/** Vor dem ersten Bildschirm aufrufen: gleicht beide Speicher ab und zählt den App-Start. */
export async function initStorage() {
  try {
    const fromDb = await Promise.race([dbGet('state'), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 2500))]);
    idbOk = true;
    if (fromDb && (fromDb.rev || 0) > (state.rev || 0)) state = Object.assign(defaults(), fromDb);
  } catch {
    idbOk = false;
  }
  state.launches = (state.launches || 0) + 1;
  save();
}

export const storageInfo = () => ({ local: storageOk, idb: idbOk, any: storageOk || idbOk, launches: state.launches || 0 });

export function getState() {
  return state;
}

export function save() {
  state.rev = (state.rev || 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* privater Modus o. Ä. – Spiel läuft trotzdem */ }
  if (idbOk) dbPut('state', JSON.parse(JSON.stringify(state))).catch(() => {});
}

// Beim Verlassen der App noch einmal sichern – iPadOS beendet Web-Apps ohne Vorwarnung.
if (typeof document !== 'undefined') {
  const flush = () => { if (document.visibilityState === 'hidden') save(); };
  document.addEventListener('visibilitychange', flush);
  window.addEventListener('pagehide', () => save());
}

/** Heutiges Datum als JJJJ-MM-TT (Ortszeit). */
export function todayKey() {
  const d = new Date();
  const two = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** Alle Einstellungen, ergänzt um Vorgaben für alles, was in einem älteren Spielstand noch fehlt. */
export function settings() {
  const base = defaults().settings;
  const own = state.settings || {};
  return { ...base, ...own, places: { ...base.places, ...(own.places || {}) } };
}

export function setSetting(key, value) {
  state.settings = { ...settings(), [key]: value };
  save();
}

export function setFigure(id) {
  state.figure = id;
  save();
}

export function setIntroSeen() {
  state.introSeen = true;
  save();
}

/** Wie oft die Station heute schon gespielt wurde. */
export function roundsToday(id) {
  if (state.today.date !== todayKey()) return 0;
  return state.today.rounds[id] || 0;
}

/** Trägt eine gespielte Runde ein. Gibt zurück, ob es der erste Besuch dieses Ortes war. */
export function recordRound(id, place) {
  const firstInPlace = !Object.keys(state.played).some(k => k.startsWith(place + '-'));
  state.played[id] = (state.played[id] || 0) + 1;
  if (state.today.date !== todayKey()) state.today = { date: todayKey(), rounds: {} };
  state.today.rounds[id] = (state.today.rounds[id] || 0) + 1;
  save();
  return firstInPlace;
}

export function ownGift(id) {
  state.owned = { ...state.owned, [id]: true };
  save();
}

export function addGem() {
  state.gems = (state.gems || 0) + 1;
  save();
}

/** Wie oft ein Inhalt schon geübt wurde. */
export const seenCount = key => (state.seen && state.seen[key]) || 0;

export function markSeen(key) {
  state.seen = state.seen || {};
  state.seen[key] = (state.seen[key] || 0) + 1;
}

/** Mischt eine Liste und stellt das am seltensten Geübte nach vorn. */
export function leastSeenFirst(items, keyOf) {
  return items
    .map(item => ({ item, n: seenCount(keyOf(item)), r: Math.random() }))
    .sort((a, b) => a.n - b.n || a.r - b.r)
    .map(x => x.item);
}

/** Fortschritt löschen; Einstellungen der Eltern und die Spielfigur bleiben. */
export function resetProgress() {
  const keep = { settings: settings(), figure: state.figure, introSeen: state.introSeen, launches: state.launches, rev: state.rev };
  state = Object.assign(defaults(), keep);
  save();
}
