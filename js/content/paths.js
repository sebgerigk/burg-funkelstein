// Was im Schreibturm nachgefahren wird. Zeichenfläche 400 × 260.
// Je Art vier Stufen (0, 1 = Klein; 2, 3 = Groß). tools/audit.mjs prüft, dass jede Stufe
// genug verschiedene Aufgaben hat (mindestens 6 / 8 / 8 / 10).
// Ein Eintrag ist eine Liste von Strichen (SVG-Pfade) in Schreibreihenfolge.

// Breite des Weges je Stufe (in Einheiten der Zeichenfläche).
export const WIDTH = [54, 46, 38, 32];

const one = d => ({ strokes: [d] });

/* ---------- Drachenwege: gerade Linien, Ecken, Treppen ---------- */

const H = (y, x1, x2) => `M${x1} ${y} H${x2}`;      // waagrecht, immer von links nach rechts
const V = (x, y1, y2) => `M${x} ${y1} V${y2}`;      // senkrecht, immer von oben nach unten
const D = (x1, y1, x2, y2) => `M${x1} ${y1} L${x2} ${y2}`;

const WEGE = [
  // Stufe 1: kurze gerade Wege an verschiedenen Stellen
  [H(80, 110, 290), H(130, 100, 300), H(190, 110, 290), V(130, 50, 210), V(200, 40, 220), V(270, 50, 210), H(130, 160, 340), V(120, 70, 230)],
  // Stufe 2: lange gerade Wege und erste Schrägen
  [H(60, 60, 340), H(130, 50, 350), H(200, 60, 340), V(100, 30, 230), V(200, 30, 230), V(300, 30, 230),
    D(90, 50, 310, 210), D(90, 210, 310, 50), D(150, 40, 260, 220), D(150, 220, 260, 40)],
  // Stufe 3: Schrägen, Ecken, Treppen
  [D(50, 60, 350, 200), D(50, 200, 350, 60), 'M80 50 V210 H320', 'M80 210 V50 H320', 'M80 50 H320 V210', 'M320 50 V210 H80',
    'M60 60 H140 V130 H220 V200 H340', 'M60 200 H140 V130 H220 V60 H340', 'M60 200 L140 80 L220 200', 'M80 60 L200 200 L320 60'],
  // Stufe 4: lange Wege mit mehreren Ecken
  ['M80 50 V210 H320 V50', 'M60 200 L200 60 H340', 'M60 60 H200 L340 200', 'M80 50 H320 V210 H80', 'M50 210 V50 H200 V210 H350 V50',
    'M50 60 H130 V200 H210 V60 H290 V200 H350', 'M60 130 L130 50 L200 130 L270 50 L340 130', 'M70 60 L330 60 L70 200 L330 200',
    'M200 40 L320 130 L200 220 L80 130', 'M60 220 V140 H160 V60 H260 V140 H340'],
];

/* ---------- Wellen und Zinnen ---------- */

// Wellen aus Bögen: n Bögen von x0 bis x1 auf Höhe y, Ausschlag a (positiv = erst nach oben)
const waves = (x0, x1, y, a, n) => {
  const w = (x1 - x0) / n;
  let d = `M${x0} ${y}`;
  for (let k = 0; k < n; k++) d += ` Q${x0 + w * k + w / 2} ${y - (k % 2 ? -a : a) * 2} ${x0 + w * (k + 1)} ${y}`;
  return d;
};
// Zickzack mit n Spitzen
const zigzag = (x0, x1, yb, yt, n) => {
  const w = (x1 - x0) / (2 * n);
  let d = `M${x0} ${yb}`;
  for (let k = 0; k < n; k++) d += ` L${x0 + w * (2 * k + 1)} ${yt} L${x0 + w * (2 * k + 2)} ${yb}`;
  return d;
};
// Burgzinnen mit n Zinnen
const zinnen = (x0, x1, yb, yt, n) => {
  const w = (x1 - x0) / (2 * n);
  let d = `M${x0} ${yb}`;
  for (let k = 0; k < n; k++) d += ` V${yt} H${x0 + w * (2 * k + 1)} V${yb} H${x0 + w * (2 * k + 2)}`;
  return d;
};
// Girlande mit Schleifen (wie ein geschriebenes e), Abstand 100
const loops = (x0, n, y = 170) => {
  let d = `M${x0} ${y}`;
  for (let k = 0; k < n; k++) {
    const x = x0 + k * 100;
    d += ` C${x + 40} ${y} ${x + 70} ${y - 30} ${x + 70} ${y - 60} C${x + 70} ${y - 90} ${x + 40} ${y - 90} ${x + 40} ${y - 60} C${x + 40} ${y - 20} ${x + 70} ${y} ${x + 100} ${y}`;
  }
  return d;
};

const WELLEN = [
  // Stufe 1: ein Bogen, eine Spitze, ein Tal
  [waves(90, 310, 190, 80, 1), waves(90, 310, 80, -80, 1), zigzag(90, 310, 200, 70, 1), zigzag(90, 310, 70, 200, 1),
    waves(80, 320, 130, 40, 2), waves(110, 290, 200, 60, 1), zigzag(120, 280, 190, 90, 1), waves(80, 320, 130, -40, 2)],
  // Stufe 2: zwei Bögen, zwei Spitzen
  ['M60 190 Q130 50 200 190 Q270 50 340 190', zigzag(60, 340, 190, 80, 2),
    waves(50, 350, 140, 40, 3), zigzag(60, 340, 80, 190, 2), waves(60, 340, 130, -40, 3), zinnen(80, 320, 190, 110, 2),
    waves(70, 330, 150, 50, 2), zigzag(80, 320, 200, 100, 2)],
  // Stufe 3: viele Wellen, Zinnen, Girlanden
  [waves(40, 360, 130, 30, 4), zigzag(40, 360, 190, 90, 3), zinnen(40, 360, 180, 100, 3), zinnen(60, 340, 190, 120, 2),
    waves(50, 350, 100, -45, 3), zigzag(50, 350, 80, 180, 3), waves(40, 360, 160, 25, 5), zinnen(40, 360, 200, 140, 3),
    'M50 100 Q100 200 150 100 Q200 200 250 100 Q300 200 350 100', 'M50 190 Q100 70 150 190 Q200 70 250 190 Q300 70 350 190'],
  // Stufe 4: Schleifen, feine Zinnen, lange Wellen
  [loops(50, 3), loops(80, 2), loops(50, 3, 200), zinnen(40, 360, 180, 110, 4), waves(40, 360, 130, 25, 6), zigzag(40, 360, 190, 100, 4),
    zinnen(40, 360, 200, 150, 4), waves(40, 360, 150, 35, 5), zigzag(40, 360, 80, 170, 4), loops(100, 2, 150)],
];

/* ---------- Formen und Bilder aus Formen ---------- */
// fill: welche Striche nach dem Nachfahren gefüllt werden ([Index, Farbe]).

const circle = (cx, cy, r) => `M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} A${r} ${r} 0 0 0 ${cx} ${cy - r}`;
const ellipse = (cx, cy, rx, ry) => `M${cx} ${cy - ry} A${rx} ${ry} 0 0 0 ${cx} ${cy + ry} A${rx} ${ry} 0 0 0 ${cx} ${cy - ry}`;
const rays = (cx, cy, r1, r2) => [0, 90, 180, 270].map(a => {
  const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
  return `M${(cx + c * r1).toFixed(0)} ${(cy + s * r1).toFixed(0)} L${(cx + c * r2).toFixed(0)} ${(cy + s * r2).toFixed(0)}`;
});
const star = (cx, cy, r) => {
  const p = [0, 2, 4, 1, 3, 0].map(k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return `${(cx + Math.cos(a) * r).toFixed(0)} ${(cy + Math.sin(a) * r).toFixed(0)}`; });
  return 'M' + p.join(' L');
};

export const FORMEN_ITEMS = {
  kreis: { strokes: [circle(200, 130, 100)], fill: [[0, '#ffd23f']] },
  kreuz: { strokes: ['M200 30 V230', 'M100 130 H300'], fill: [] },
  kreuz2: { say: 'kreuz', strokes: ['M130 60 L270 200', 'M270 60 L130 200'], fill: [] },
  ei: { strokes: ['M200 25 C140 25 125 130 125 165 C125 215 160 240 200 240 C240 240 275 215 275 165 C275 130 260 25 200 25'], fill: [[0, '#fff4dc']] },
  // Spirale aus Halbkreisen von innen nach außen; die Windungen liegen 60 auseinander (breiter als der Weg)
  schnecke: { strokes: ['M200 130 A30 30 0 0 1 260 130 A60 60 0 0 1 140 130 A90 90 0 0 1 320 130 A120 120 0 0 1 80 130'], fill: [] },
  mond: { strokes: ['M230 32 A100 100 0 1 0 230 228 A78 78 0 1 1 230 32'], fill: [[0, '#ffe27a']] },
  sonne: { strokes: [circle(200, 130, 52), ...rays(200, 130, 86, 124)], fill: [[0, "#ffd23f"]] },
  ballon: { strokes: [ellipse(200, 95, 62, 75), 'M200 170 Q185 200 205 225 Q215 238 200 250'], fill: [[0, '#ff6b8b']] },
  schneemann: { strokes: [circle(200, 70, 45), circle(200, 175, 65)], fill: [[0, '#ffffff'], [1, '#ffffff']] },
  quadrat: { strokes: ['M125 55 V205 H275 V55 H125'], fill: [[0, '#4aa3ff']] },
  dreieck: { strokes: ['M200 35 L95 215 H305 L200 35'], fill: [[0, '#ff6b8b']] },
  rechteck: { strokes: ['M150 30 V230 H250 V30 H150'], fill: [[0, '#c27a3e']] },
  raute: { strokes: ['M200 25 L290 130 L200 235 L110 130 L200 25'], fill: [[0, '#b98cff']] },
  haus: { strokes: ['M120 120 V230 H280 V120 H120', 'M105 125 L200 35 L295 125'], fill: [[0, '#f3e6cc']] },
  fahne: { strokes: ['M140 240 V25', 'M140 30 L280 75 L140 120'], fill: [[1, '#e8504f']] },
  turm: { strokes: ['M140 240 V80 H160 V50 H190 V80 H210 V50 H240 V80 H260 V240 H140'], fill: [[0, '#f3e6cc']] },
  stern: { strokes: [star(200, 135, 110)], fill: [] },
  herz: { strokes: ['M200 230 C120 170 70 120 100 70 C125 30 180 40 200 85 C220 40 275 30 300 70 C330 120 280 170 200 230'], fill: [[0, '#ff6b8b']] },
  tanne: { strokes: ['M200 25 L120 110 H160 L100 190 H300 L240 110 H280 L200 25', 'M200 190 V240'], fill: [[0, '#5cc96b']] },
};

const FORMEN = [
  ['kreis', 'kreuz', 'kreuz2', 'ei', 'schnecke', 'mond'],
  ['kreis', 'kreuz2', 'ei', 'schnecke', 'mond', 'sonne', 'ballon', 'schneemann'],
  ['quadrat', 'dreieck', 'rechteck', 'raute', 'haus', 'sonne', 'ballon', 'schneemann', 'mond', 'ei'],
  ['haus', 'fahne', 'turm', 'stern', 'herz', 'tanne', 'raute', 'dreieck', 'quadrat', 'sonne'],
];

export const SPUREN = {
  wege: WEGE.map(list => list.map(one)),
  wellen: WELLEN.map(list => list.map(one)),
  formen: FORMEN.map(list => list.map(id => ({ ...FORMEN_ITEMS[id], shape: FORMEN_ITEMS[id].say || id, id }))),
};
