export const INK = '#3d2b4a';

/** Baut ein DOM-Element aus einem HTML-String. */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const wait = ms => new Promise(r => setTimeout(r, ms));

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Wartet auf ein Promise, aber höchstens ms Millisekunden. */
export function withTimeout(promise, ms) {
  return Promise.race([promise, wait(ms)]);
}

/** Startet eine CSS-Animation (Klasse) neu, auch wenn sie gerade schon läuft. */
export function replay(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.getBoundingClientRect();
  el.classList.add(cls);
}

/** Lässt ein Element kurz wackeln (daneben getippt). */
export const shake = el => replay(el, 'shake');

/** Funken rund um ein Element (richtig). */
export function burst(el, { n = 14, spread = 120 } = {}) {
  if (!el) return;
  const colors = ['#ffd23f', '#ff6b8b', '#5cc96b', '#4aa3ff', '#ffffff', '#b98cff'];
  const r = el.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'burst';
  layer.style.left = (r.left + r.width / 2) + 'px';
  layer.style.top = (r.top + r.height / 2) + 'px';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const d = spread * (0.55 + Math.random() * 0.6) + Math.max(r.width, r.height) * 0.25;
    s.style.setProperty('--dx', Math.cos(a) * d + 'px');
    s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = (Math.random() * 0.08) + 's';
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 1200);
}

/** Konfetti über den ganzen Bildschirm (Runde geschafft). */
export function confetti(n = 60) {
  const colors = ['#ffd23f', '#ff6b8b', '#5cc96b', '#4aa3ff', '#b98cff', '#ffffff'];
  const layer = document.createElement('div');
  layer.className = 'confetti';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.9 + 's';
    s.style.animationDuration = 2.2 + Math.random() * 1.6 + 's';
    s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    s.style.setProperty('--sway', (Math.random() * 120 - 60) + 'px');
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4800);
  return layer;
}

/**
 * Punkte ohne Überlappung in einem Rechteck verteilen (für Dinge zum Zählen).
 * Liefert n Punkte {x, y} in den Einheiten des Rechtecks. Fällt auf ein Raster zurück,
 * wenn der Zufall keinen Platz findet.
 */
export function scatter(n, w, h, minDist) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const pts = [];
    let tries = 0;
    while (pts.length < n && tries < 600) {
      tries++;
      const p = { x: minDist / 2 + Math.random() * (w - minDist), y: minDist / 2 + Math.random() * (h - minDist) };
      if (pts.every(q => Math.hypot(p.x - q.x, p.y - q.y) >= minDist)) pts.push(p);
    }
    if (pts.length === n) return pts;
  }
  const cols = Math.ceil(Math.sqrt(n * w / h));
  const rows = Math.ceil(n / cols);
  return Array.from({ length: n }, (_, i) => ({ x: (i % cols + 0.5) * w / cols, y: (Math.floor(i / cols) + 0.5) * h / rows }));
}
