// Landschaft: Himmel, Hügel, die Burg und die Orte auf der Karte.
import { INK } from '../engine/util.js';

export const STONE = '#f3e6cc', STONE2 = '#dcc7a2', ROOF_R = '#e8504f', ROOF_B = '#4aa3ff', WOOD = '#a8683a';
export const GRASS = '#7fd36b', GRASS2 = '#5cbf54', GRASS3 = '#49a845', WATER = '#5bc0eb';

const cloud = (x, y, s, cls) => `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 40 Q0 14 28 16 Q40 -6 66 6 Q92 -4 100 22 Q124 22 120 42Z" fill="#fff"/>
  <path d="M6 40 Q30 30 60 36 Q92 30 118 40 Q120 46 112 46 H10 Q2 46 6 40Z" fill="#dceefa"/></g>`;

/** Weicher Schatten auf dem Boden. */
export const shadow = (cx, cy, rx, ry = rx * 0.18) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2f5d2a" opacity=".16" stroke="none"/>`;

/** Himmel mit Sonne und Wolken für eine Fläche 1600 × 1000. sun: false lässt die Sonne weg (Startbildschirm: dort steht das Logo). */
export function sky({ sun = true } = {}) {
  const rays = Array.from({ length: 12 }, (_, k) => {
    const a = k * 30 * Math.PI / 180;
    const p = (r, d) => `${(1360 + Math.cos(a + d) * r).toFixed(0)} ${(130 + Math.sin(a + d) * r).toFixed(0)}`;
    return `<path d="M${p(80, -0.09)} L${p(124, 0)} L${p(80, 0.09)}Z"/>`;
  }).join('');
  return `<defs>
      <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76cdfa"/><stop offset=".7" stop-color="#c8ecff"/><stop offset="1" stop-color="#eaf8ff"/></linearGradient>
      <radialGradient id="sunglow"><stop offset="0" stop-color="#fff6c0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c0" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="1000" fill="url(#skyg)"/>
    <g class="sun" transform="translate(-170 -10)" ${sun ? '' : 'display="none"'}>
      <circle cx="1360" cy="130" r="150" fill="url(#sunglow)"/>
      <g class="sun-rays" fill="#ffe27a">${rays}</g>
      <circle cx="1360" cy="130" r="62" fill="#ffd23f" stroke="${INK}" stroke-width="5"/>
      <path d="M1322 112 Q1340 84 1372 86" fill="none" stroke="#fff3a6" stroke-width="7" stroke-linecap="round"/>
      <path d="M1340 125 q6 -6 12 0 M1368 125 q6 -6 12 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="1332" cy="142" r="7" fill="#ffab73" opacity=".7"/><circle cx="1388" cy="142" r="7" fill="#ffab73" opacity=".7"/>
      <path d="M1344 146 Q1360 160 1376 146" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    ${cloud(220, 90, 1.3, 'cloud-a')}${cloud(760, 60, 1, 'cloud-b')}${cloud(1050, 170, .8, 'cloud-a')}
    <g class="birds" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity=".55">
      <path d="M560 150 q10 -10 20 0 q10 -10 20 0"/><path d="M620 120 q7 -7 14 0 q7 -7 14 0"/></g>`;
}

/** Sanfte Hügel in drei Lagen mit Bäumen und Büschen; ground = Höhe, ab der Wiese ist. */
export function hills(ground = 560) {
  const g = ground;
  const tree = (x, y, r) => `<circle cx="${x}" cy="${y - r}" r="${r}" fill="#86cc72"/><circle cx="${x - r * .35}" cy="${y - r * 1.2}" r="${r * .45}" fill="#9ad985"/>`;
  const bush = (x, y, r) => `<path d="M${x - r * 1.6} ${y} Q${x - r * 1.6} ${y - r} ${x - r * .6} ${y - r * .9} Q${x} ${y - r * 1.6} ${x + r * .7} ${y - r} Q${x + r * 1.7} ${y - r} ${x + r * 1.6} ${y}Z" fill="#5fb94f"/>`;
  return `<path d="M0 ${g - 120} Q300 ${g - 250} 640 ${g - 150} Q960 ${g - 270} 1260 ${g - 160} Q1450 ${g - 220} 1600 ${g - 150} V1000 H0Z" fill="#c4ebb0"/>
    <g stroke="none">${tree(180, g - 170, 22)}${tree(220, g - 176, 16)}${tree(1010, g - 200, 20)}${tree(1046, g - 196, 14)}${tree(1420, g - 178, 18)}</g>
    <path d="M0 ${g - 60} Q260 ${g - 200} 520 ${g - 80} Q800 ${g - 230} 1100 ${g - 90} Q1380 ${g - 190} 1600 ${g - 80} V1000 H0Z" fill="#a6e38f"/>
    <path d="M0 ${g - 60} Q260 ${g - 200} 520 ${g - 80} Q800 ${g - 230} 1100 ${g - 90} Q1380 ${g - 190} 1600 ${g - 80}" fill="none" stroke="#c2f0ab" stroke-width="8" opacity=".8"/>
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">${bush(90, g - 66, 26)}${bush(1530, g - 82, 30)}</g>
    <path d="M0 ${g} Q400 ${g - 90} 800 ${g - 10} Q1200 ${g - 100} 1600 ${g} V1000 H0Z" fill="${GRASS}"/>
    <path d="M0 ${g} Q400 ${g - 90} 800 ${g - 10} Q1200 ${g - 100} 1600 ${g}" fill="none" stroke="#9be585" stroke-width="10" opacity=".9"/>`;
}

const crenels = (x1, x2, y, w = 20, hgt = 18) => {
  let d = '';
  for (let x = x1; x + w <= x2 + 0.1; x += w * 2) d += `<rect x="${x}" y="${y - hgt}" width="${w}" height="${hgt + 2}" fill="${STONE}"/>`;
  return d;
};
// Fenster mit Fensterbank und einem warmen Schimmer
const win = (x, y, w = 18, hgt = 28) => `<path d="M${x} ${y + hgt} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + hgt}Z" fill="#3d2b4a"/>
  <path d="M${x + w * .25} ${y + hgt - 3} V${y + w * .55}" stroke="#6b5585" stroke-width="3"/>
  <rect x="${x - 4}" y="${y + hgt}" width="${w + 8}" height="6" rx="2" fill="${STONE2}" stroke-width="3"/>`;
// Mauerblock: Fläche, Schattenseite rechts, dann Umriss (so bleibt der Umriss oben)
const block = (x, y, w, h, shade = 0.3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${STONE}" stroke="none"/>
  <rect x="${x + w * (1 - shade)}" y="${y}" width="${w * shade}" height="${h}" fill="#e7d4b2" stroke="none"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"/>`;
// Spitzdach mit dunklerer rechter Hälfte
const roof = (x1, x2, yb, apex, c, c2) => {
  const m = (x1 + x2) / 2;
  return `<path d="M${x1} ${yb} L${m} ${apex} L${x2} ${yb}Z" fill="${c}"/><path d="M${m} ${apex} L${x2} ${yb} H${m + (x2 - m) * .15}Z" fill="${c2}" stroke="none"/>
    <path d="M${x1} ${yb} L${m} ${apex} L${x2} ${yb}Z" fill="none"/><path d="M${x1 + 10} ${yb - 12} H${x2 - 10}" stroke="${c2}" stroke-width="4"/>`;
};
// ein paar Steinfugen
const bricks = pts => pts.map(([x, y, w]) => `<path d="M${x} ${y} h${w}" stroke="${STONE2}" stroke-width="4"/>`).join('');

/**
 * Die Burg. Zeichenfläche 400 breit, Boden bei y = 360, Turmspitzen bei y = 0 (Bergfried -50).
 * Wird mit transform an ihren Platz gesetzt.
 */
export function castle({ gate = true } = {}) {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    ${shadow(200, 362, 230, 22)}
    <!-- Mauern -->
    ${block(100, 180, 200, 180, 0.15)}
    ${crenels(104, 296, 180)}
    <!-- Türme links und rechts -->
    ${block(20, 80, 80, 280)}${block(300, 80, 80, 280)}
    ${roof(10, 110, 82, 0, ROOF_R, '#c93e3e')}${roof(290, 390, 82, 0, ROOF_B, '#2f86d8')}
    ${win(51, 120)}${win(331, 120)}${win(51, 220)}${win(331, 220)}
    ${bricks([[30, 170, 16], [72, 200, 18], [34, 300, 18], [310, 180, 16], [352, 270, 18], [316, 320, 16], [110, 230, 18], [276, 250, 16], [112, 320, 14]])}
    <!-- Bergfried -->
    ${block(140, 60, 120, 300, 0.28)}
    ${roof(128, 272, 62, -50, ROOF_R, '#c93e3e')}
    ${win(186, 100, 28, 40)}
    <path d="M140 200 H260 M140 250 H158 M240 250 H260 M100 290 H128 M272 290 H300" stroke="${STONE2}" stroke-width="4"/>
    ${bricks([[160, 170, 18], [214, 160, 20], [152, 230, 16]])}
    ${gate ? `<path d="M160 360 V298 A40 40 0 0 1 240 298 V360" fill="${STONE2}"/>
    <path d="M168 360 V300 A32 32 0 0 1 232 300 V360Z" fill="${WOOD}"/>
    <path d="M180 360 V296 M200 360 V286 M220 360 V296 M168 320 H232 M168 342 H232" stroke="#7a4a28" stroke-width="4"/>
    <circle cx="213" cy="330" r="3.5" fill="#ffd23f" stroke-width="2.5"/>
    <path d="M168 360 V300 A32 32 0 0 1 232 300 V360" fill="none"/>` : ''}
  </g>`;
}

/** Schreibturm: hoher runder Turm mit Fenster, Buch und Feder. Breite 200, Boden y = 0 (nach oben negativ). */
export function writeTower() {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    ${shadow(100, 2, 110, 16)}
    <path d="M40 0 V-260 H160 V0Z" fill="#e9dcf7" stroke="none"/>
    <path d="M122 0 V-260 H160 V0Z" fill="#d9c7f0" stroke="none"/>
    <path d="M40 0 V-260 H160 V0Z" fill="none"/>
    <path d="M40 -200 H160 M40 -120 H160 M40 -60 H70 M130 -60 H160" stroke="#cdb9ea" stroke-width="4"/>
    ${roof(26, 174, -258, -380, '#9067e0', '#6f4cc4')}
    <circle cx="100" cy="-385" r="12" fill="#ffd23f"/>
    <path d="M78 -150 V-188 A22 22 0 0 1 122 -188 V-150Z" fill="#3d2b4a"/>
    <rect x="72" y="-150" width="56" height="7" rx="2" fill="#cdb9ea" stroke-width="3"/>
    <!-- Eule im Fenster -->
    <ellipse cx="100" cy="-166" rx="16" ry="18" fill="#c9915a"/>
    <circle cx="93" cy="-170" r="6" fill="#fff"/><circle cx="107" cy="-170" r="6" fill="#fff"/>
    <circle cx="93" cy="-170" r="2.6" fill="${INK}" stroke="none"/><circle cx="107" cy="-170" r="2.6" fill="${INK}" stroke="none"/>
    <path d="M97 -162 L100 -157 L103 -162Z" fill="#ff9f43" stroke-width="2.5"/>
    <path d="M80 0 V-50 A20 20 0 0 1 120 -50 V0Z" fill="${WOOD}"/><circle cx="112" cy="-26" r="3" fill="#ffd23f" stroke-width="2"/>
    <!-- Feder -->
    <path d="M170 -300 Q210 -350 230 -330 Q214 -296 176 -290Z" fill="#fff"/>
    <path d="M176 -292 Q200 -316 224 -330" fill="none" stroke="#d9c7f0" stroke-width="3"/>
    <path d="M176 -290 L162 -270" stroke-width="4"/>
  </g>`;
}

/** Schatzkammer: kleines Haus mit Kuppel und Edelstein. Breite 220, Boden y = 0. */
export function treasury() {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    ${shadow(110, 2, 120, 16)}
    ${block(20, -150, 180, 150, 0.22)}
    <path d="M10 -148 Q110 -300 210 -148Z" fill="#ffd23f"/>
    <path d="M110 -224 Q170 -214 210 -148 H140 Q140 -200 110 -224Z" fill="#f0b92a" stroke="none"/>
    <path d="M10 -148 Q110 -300 210 -148Z" fill="none"/>
    <path d="M50 -170 Q110 -250 170 -170" fill="none" stroke="#e9a21f" stroke-width="5"/>
    <path d="M48 -186 Q70 -224 102 -238" fill="none" stroke="#fff3a6" stroke-width="6" stroke-linecap="round"/>
    <g class="twinkle-slow"><path d="M110 -310 L130 -290 L110 -256 L90 -290Z" fill="#ff6b8b"/>
    <path d="M90 -290 H130" stroke-width="3"/><path d="M100 -300 L96 -292" stroke="#fff" stroke-width="3"/></g>
    <path d="M74 0 V-72 A36 36 0 0 1 146 -72 V0" fill="${STONE2}"/>
    <path d="M80 0 V-70 A30 30 0 0 1 140 -70 V0Z" fill="#e9a21f"/>
    <path d="M110 0 V-100" stroke="#c98a12" stroke-width="4"/>
    <circle cx="128" cy="-40" r="5" fill="${INK}"/>
    ${win(36, -120, 26, 34)}${win(158, -120, 26, 34)}
    <path d="M40 -122 l8 -14 8 14Z M168 -122 l8 -14 8 14Z" fill="#5cc96b" stroke-width="3"/>
    ${bricks([[30, -40, 18], [170, -20, 16], [60, -136, 14]])}
  </g>`;
}

/** Musikgarten: Hecke mit Rosenbogen und Noten. Breite 260, Boden y = 0. */
export function musicGarden() {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    ${shadow(130, 2, 140, 14)}
    <rect x="0" y="-70" width="90" height="70" rx="30" fill="${GRASS3}"/>
    <rect x="170" y="-70" width="90" height="70" rx="30" fill="${GRASS3}"/>
    <path d="M14 -40 Q40 -62 70 -52 M184 -40 Q210 -62 240 -52" fill="none" stroke="#6fca5f" stroke-width="6" stroke-linecap="round"/>
    <path d="M90 0 V-120 A40 40 0 0 1 170 -120 V0" fill="none" stroke="${INK}" stroke-width="18"/>
    <path d="M90 0 V-120 A40 40 0 0 1 170 -120 V0" fill="none" stroke="${GRASS2}" stroke-width="10"/>
    <circle cx="96" cy="-130" r="9" fill="#ff6b8b"/><circle cx="130" cy="-168" r="9" fill="#ffd23f"/><circle cx="164" cy="-130" r="9" fill="#ff6b8b"/>
    <g class="notes" fill="${INK}">
      <path d="M200 -170 V-220 L230 -230 V-180" fill="none" stroke-width="5"/><ellipse cx="194" cy="-170" rx="9" ry="7"/><ellipse cx="224" cy="-180" rx="9" ry="7"/>
      <path d="M50 -110 V-150" stroke-width="5"/><ellipse cx="44" cy="-110" rx="9" ry="7"/>
    </g>
  </g>`;
}

/** Tanne mit hellerer linker und dunklerer rechter Seite. (x = Mitte, Boden y = 0) */
export const fir = (x, s = 1, c = '#3fa452', c2 = '#2f8f4b') => `<g transform="translate(${x} 0) scale(${s})">
  <rect x="-12" y="-70" width="24" height="70" fill="${WOOD}"/>
  <path d="M0 -220 L70 -60 H-70Z" fill="${c}"/><path d="M0 -220 L70 -60 H8Z" fill="${c2}" stroke="none"/><path d="M0 -220 L70 -60 H-70Z" fill="none"/>
  <path d="M0 -260 L55 -140 H-55Z" fill="${c}"/><path d="M0 -260 L55 -140 H6Z" fill="${c2}" stroke="none"/><path d="M0 -260 L55 -140 H-55Z" fill="none"/>
</g>`;

const sparkle = (x, y, r, cls = 'twinkle') => `<path class="${cls}" d="M${x} ${y - r} L${x + r * .3} ${y - r * .3} L${x + r} ${y} L${x + r * .3} ${y + r * .3} L${x} ${y + r} L${x - r * .3} ${y + r * .3} L${x - r} ${y} L${x - r * .3} ${y - r * .3}Z" fill="#fff6a8" stroke-width="3"/>`;
export { sparkle };

/** Zauberwald: drei Bäume mit Funkeln. Breite 280, Boden y = 0. */
export function magicForest() {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    ${shadow(140, 2, 150, 16)}
    ${fir(60, .8)}${fir(220, .75)}${fir(140, 1, '#2f8f4b', '#237a3e')}
    ${sparkle(40, -230, 16)}${sparkle(250, -200, 13)}${sparkle(150, -290, 18)}
    <circle cx="140" cy="-90" r="12" fill="#b98cff"/><circle cx="136" cy="-94" r="4" fill="#fff" stroke="none" opacity=".8"/>
    <g transform="translate(232 0)"><path d="M-12 0 V-16 H12 V0Z" fill="#fff4dc" stroke-width="4"/><path d="M-24 -14 Q0 -44 24 -14Z" fill="#e8504f" stroke-width="4"/><circle cx="-6" cy="-24" r="4" fill="#fff" stroke="none"/></g>
  </g>`;
}

/** Baugerüst mit Schild (für Orte, die noch gebaut werden). Breite 260. */
export function scaffold() {
  return `<g class="scaffold" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M10 0 V-200 M250 0 V-200 M10 -60 H250 M10 -130 H250 M10 -200 H250 M10 -60 L250 -130 M10 -130 L250 -200" stroke="#c98b4f" stroke-width="9"/>
    <g transform="translate(130 -24)"><rect x="-70" y="-40" width="140" height="58" rx="10" fill="#ffd23f"/>
      <path d="M-60 -40 L-40 18 M-20 -40 L0 18 M20 -40 L40 18" stroke="${INK}" stroke-width="10"/>
      <rect x="-70" y="-40" width="140" height="58" rx="10" fill="none"/></g>
  </g>`;
}

/** Ein Weg über die Wiese von a nach b. */
export const road = (a, b, bend = 0) => {
  const mx = (a.x + b.x) / 2 + bend, my = (a.y + b.y) / 2 - bend / 3;
  const d = `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
  return `<path d="${d}" fill="none" stroke="#d9bb7c" stroke-width="48" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#f6e2ad" stroke-width="34" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#e8cf93" stroke-width="5" stroke-dasharray="3 26" stroke-linecap="round"/>`;
};

/** Grasbüschel und Blümchen zur Auflockerung. */
export const tuft = (x, y) => `<path d="M${x - 14} ${y} q4 -18 8 0 q4 -24 8 0 q4 -18 8 0" fill="none" stroke="${GRASS3}" stroke-width="5" stroke-linecap="round"/>`;
export const flower = (x, y, c = '#ff6b8b') => `<g stroke="${INK}" stroke-width="3"><path d="M${x} ${y} V${y - 22}" stroke="${GRASS3}" stroke-width="4"/><circle cx="${x}" cy="${y - 26}" r="8" fill="${c}"/><circle cx="${x}" cy="${y - 26}" r="3" fill="#ffd23f" stroke="none"/></g>`;
