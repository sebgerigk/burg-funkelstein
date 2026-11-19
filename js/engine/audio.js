// Sprache (vorerzeugte Clips, sonst Sprachausgabe des Geräts) und Klänge.
// Übernommen aus der Schatzinsel; neu sind nur die Klänge am Ende.
let ctx = null;
let master = null;
let voiceGain = null;
let busyUntil = 0; // bis wann (Audio-Zeit) noch ein Soundeffekt klingt
let index = {};
const buffers = new Map();
const leads = new Map();   // Clip -> Sekunden Stille am Anfang
let lastVoiceEnd = -1;     // Audio-Zeit, zu der Fips zuletzt fertig gesprochen hat
let currentSrc = null;
let resolveCurrent = null;
let speakToken = 0;

export async function initAudio() {
  const get = name => fetch('assets/audio/' + name).then(r => r.json()).catch(() => ({}));
  index = await get('index.json');
  // iOS pausiert den Ton, wenn die App im Hintergrund war – bei jeder Berührung wieder aufwecken.
  document.addEventListener('pointerdown', unlockAudio, true);
}

/** Muss aus einer Berührung heraus aufgerufen werden (Vorgabe von iOS). */
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    // „playback": größerer Puffer in der Tonausgabe. Sprache startet dadurch ein paar
    // Hundertstelsekunden später, stockt aber nicht, wenn das iPad gerade viel zeichnet.
    try { ctx = new AC({ latencyHint: 'playback' }); } catch { ctx = new AC(); }
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    voiceGain = ctx.createGain();
    voiceGain.gain.value = 1.15;
    voiceGain.connect(master);
    // Unhörbarer Dauerton hält die Tonausgabe wach – sonst fehlt nach Pausen der Anfang der Sprache.
    try {
      const hum = ctx.createOscillator();
      const quiet = ctx.createGain();
      hum.frequency.value = 20;
      quiet.gain.value = 0.0008;
      hum.connect(quiet).connect(master);
      hum.start();
    } catch { /* nicht kritisch */ }
    try {
      // Spielt auch dann, wenn das iPad stummgeschaltet ist.
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch { /* nicht überall verfügbar */ }
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
}

const MAX_BUFFERS = 150;   // so viele entpackte Clips höchstens im Speicher (das iPad hat nicht unbegrenzt Platz)

async function loadBuffer(file) {
  if (buffers.has(file)) {
    const buf = buffers.get(file);
    buffers.delete(file);      // ans Ende rücken: zuletzt gebraucht
    buffers.set(file, buf);
    return buf;
  }
  const data = await (await fetch('assets/audio/' + file)).arrayBuffer();
  const buf = await new Promise((res, rej) => ctx.decodeAudioData(data, res, rej));
  buffers.set(file, buf);
  leads.set(buf, leadingSilence(buf));
  while (buffers.size > MAX_BUFFERS) {
    const oldest = buffers.keys().next().value;
    leads.delete(buffers.get(oldest));
    buffers.delete(oldest);
  }
  return buf;
}

/** Wie lange ein Clip mit Stille beginnt (die Clips haben absichtlich etwas Vorlauf). */
function leadingSilence(buf) {
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > 0.01) return i / buf.sampleRate;
  return 0;
}

export function stopSpeech() {
  speakToken++;
  if (currentSrc) {
    lastVoiceEnd = ctx.currentTime;   // unterbrochen: die Tonausgabe ist trotzdem wach
    try { currentSrc.onended = null; currentSrc.stop(); } catch { /* schon beendet */ }
    currentSrc = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (resolveCurrent) { resolveCurrent(); resolveCurrent = null; }
}

function playBuffer(buf) {
  return new Promise(res => {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(voiceGain);
    // Erst sprechen, wenn der Soundeffekt (Klingeln, Fanfare …) ausgeklungen ist.
    const delay = Math.min(0.9, Math.max(0, busyUntil - ctx.currentTime - 0.15));
    // Spricht Fips gleich im Anschluss weiter, ist die Tonausgabe schon wach: Den Vorlauf
    // fast ganz überspringen, damit die Sätze fließend ineinander übergehen statt Stück für Stück.
    const chained = lastVoiceEnd >= 0 && ctx.currentTime - lastVoiceEnd < 1.2;
    const offset = chained ? Math.max(0, (leads.get(buf) || 0) - 0.06) : 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (currentSrc === src) { currentSrc = null; resolveCurrent = null; lastVoiceEnd = ctx.currentTime; }
      res();
    };
    currentSrc = src;
    resolveCurrent = res;
    src.onended = finish;
    src.start(ctx.currentTime + delay, offset);
    setTimeout(finish, (delay + buf.duration - offset) * 1000 + 1200); // Sicherheitsnetz
  });
}

function tts(text) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = 0.85;   // für Drei- und Vierjährige etwas langsamer
    const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('de'));
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => res();
    resolveCurrent = res;
    speechSynthesis.speak(u);
    setTimeout(res, 9000);
  });
}

/** Spricht einen Text. Das Promise endet, wenn fertig gesprochen oder unterbrochen wurde. */
export async function speak(text) {
  stopSpeech();
  const token = speakToken;
  if (!text) return;
  const file = index[text];
  if (file && ctx) {
    try {
      const buf = await loadBuffer(file);
      if (token !== speakToken) return;
      await playBuffer(buf);
      return;
    } catch { /* Clip fehlt oder nicht dekodierbar -> Sprachausgabe */ }
    if (token !== speakToken) return;
  }
  await tts(text);
}

/**
 * Lädt Clips schon einmal vor, damit sie ohne Verzögerung starten.
 */
export function preload(texts) {
  if (!ctx) return;
  const all = texts.filter(t => typeof t === 'string');
  // Die neue Anfrage kommt zuerst dran (sie gehört zum aktuellen Bildschirm), in ihrer Reihenfolge.
  const files = [...new Set(all.map(t => index[t]).filter(f => f && !buffers.has(f)))];
  const rest = queue.filter(f => !files.includes(f));
  queue.length = 0;
  // Mehr als in den Speicher passt, lohnt nicht – es würde gleich wieder verdrängt.
  queue.push(...[...files, ...rest].slice(0, MAX_BUFFERS / 2));
  if (!queueBusy) drainQueue();
}

// Vorladen geschieht nacheinander im Hintergrund, damit Fips' nächster Satz nicht warten muss.
const queue = [];
let queueBusy = false;
async function drainQueue() {
  queueBusy = true;
  while (queue.length) {
    const file = queue.shift();
    if (!buffers.has(file)) await loadBuffer(file).catch(() => {});
  }
  queueBusy = false;
}


function tone(freq, start, dur, type = 'sine', gain = 0.2, slideTo = null) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t0 = ctx.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

/** Kurzes Rauschen (Hammer, Plätschern, Rascheln). */
function noise(start, dur, gain = 0.15, freq = 1200) {
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = buf;
  f.type = 'bandpass';
  f.frequency.value = freq;
  g.gain.value = gain;
  src.connect(f).connect(g).connect(master);
  src.start(ctx.currentTime + start);
}

// Alle Klänge sanft und kurz: nichts soll erschrecken.
const SFX = {
  tap: () => tone(660, 0, 0.07, 'triangle', 0.12),
  pop: () => tone(440, 0, 0.12, 'sine', 0.2, 880),
  correct: () => { tone(784, 0, 0.16, 'triangle', 0.2); tone(1175, 0.11, 0.3, 'triangle', 0.2); },
  // „Daneben" ist kein Brummen, sondern ein fragendes Hm.
  wrong: () => { tone(392, 0, 0.14, 'sine', 0.14, 349); tone(349, 0.13, 0.2, 'sine', 0.12, 330); },
  sparkle: () => { [1568, 1976, 2349, 2637].forEach((f, i) => tone(f, i * 0.06, 0.25, 'sine', 0.08)); },
  fanfare: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.28, 'triangle', 0.2));
    tone(1319, 0.56, 0.6, 'triangle', 0.2);
  },
  chest: () => { tone(180, 0, 0.3, 'sawtooth', 0.04, 260); [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.3 + i * 0.08, 0.4, 'sine', 0.1)); },
  hop: () => tone(330, 0, 0.12, 'sine', 0.12, 520),
  count: () => tone(988, 0, 0.1, 'sine', 0.1),
  place: () => { tone(523, 0, 0.08, 'triangle', 0.14); tone(784, 0.06, 0.14, 'triangle', 0.12); },
  whoosh: () => noise(0, 0.35, 0.25, 900),
  hammer: () => { [0, 0.28].forEach(t => { noise(t, 0.08, 0.5, 2500); tone(180, t, 0.08, 'square', 0.05); }); },
  trace: () => tone(880, 0, 0.05, 'sine', 0.04),
  // Burg: Antippen der Geschenke
  boing: () => tone(220, 0, 0.3, 'sine', 0.2, 660),
  chime: () => { tone(1319, 0, 0.5, 'sine', 0.12); tone(1760, 0.1, 0.6, 'sine', 0.08); },
  splash: () => { noise(0, 0.3, 0.3, 700); tone(600, 0, 0.12, 'sine', 0.08, 300); },
  flap: () => { [0, 0.1, 0.2].forEach(t => noise(t, 0.07, 0.25, 500)); },
  snore: () => { tone(110, 0, 0.9, 'sine', 0.1, 140); },
};

const SFX_LEN = { tap: 0.08, pop: 0.14, correct: 0.42, wrong: 0.35, sparkle: 0.45, fanfare: 1.15, chest: 0.8, hop: 0.13, count: 0.1, place: 0.2, whoosh: 0.35, hammer: 0.4, trace: 0.05, boing: 0.3, chime: 0.7, splash: 0.3, flap: 0.27, snore: 0.9 };

export function sfx(name) {
  if (!ctx || ctx.state !== 'running' || !SFX[name]) return;
  try {
    SFX[name]();
    // Leise Begleitklänge halten Fips nicht vom Sprechen ab.
    if (!['count', 'trace', 'tap', 'hop'].includes(name)) busyUntil = Math.max(busyUntil, ctx.currentTime + SFX_LEN[name]);
  } catch { /* Ton ist nie kritisch */ }
}
