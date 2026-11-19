// Landschaft: Himmel, Hügel, die Burg und die Orte auf der Karte.
import { INK } from '../engine/util.js';

export const STONE = '#f3e6cc', STONE2 = '#dcc7a2', ROOF_R = '#e8504f', ROOF_B = '#4aa3ff', WOOD = '#a8683a';
export const GRASS = '#7fd36b', GRASS2 = '#5cbf54', GRASS3 = '#49a845', WATER = '#5bc0eb';

const cloud = (x, y, s, cls) => `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})"><path d="M0 40 Q0 14 28 16 Q40 -6 66 6 Q92 -4 100 22 Q124 22 120 42Z" fill="#fff" opacity=".95"/></g>`;

/** Himmel mit Sonne und Wolken für eine Fläche 1600 × 1000. */
export function sky() {
  return `<defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd8ff"/><stop offset="1" stop-color="#e3f6ff"/></linearGradient></defs>
    <rect width="1600" height="1000" fill="url(#skyg)"/>
    <g class="sun" transform="translate(-170 -10)"><circle cx="1360" cy="130" r="62" fill="#ffd23f" stroke="${INK}" stroke-width="5"/>
      <path d="M1340 125 q6 -6 12 0 M1368 125 q6 -6 12 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M1344 146 Q1360 160 1376 146" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    ${cloud(220, 90, 1.3, 'cloud-a')}${cloud(760, 60, 1, 'cloud-b')}${cloud(1050, 170, .8, 'cloud-a')}`;
}

/** Sanfte Hügel; ground = Höhe, ab der Wiese ist. */
export function hills(ground = 560) {
  return `<path d="M0 ${ground - 60} Q260 ${ground - 200} 520 ${ground - 80} Q800 ${ground - 230} 1100 ${ground - 90} Q1380 ${ground - 190} 1600 ${ground - 80} V1000 H0Z" fill="#a6e38f"/>
    <path d="M0 ${ground} Q400 ${ground - 90} 800 ${ground - 10} Q1200 ${ground - 100} 1600 ${ground} V1000 H0Z" fill="${GRASS}"/>`;
}

const crenels = (x1, x2, y, w = 20, hgt = 18) => {
  let d = '';
  for (let x = x1; x + w <= x2 + 0.1; x += w * 2) d += `<rect x="${x}" y="${y - hgt}" width="${w}" height="${hgt + 2}" fill="${STONE}"/>`;
  return d;
};
const win = (x, y, w = 18, hgt = 28) => `<path d="M${x} ${y + hgt} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + hgt}Z" fill="#3d2b4a"/>`;

/**
 * Die Burg. Zeichenfläche 400 breit, Boden bei y = 360, Turmspitzen bei y = 0 (Bergfried -50).
 * Wird mit transform an ihren Platz gesetzt.
 */
export function castle({ gate = true } = {}) {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    <!-- Mauern -->
    <rect x="100" y="180" width="200" height="180" fill="${STONE}"/>
    ${crenels(104, 296, 180)}
    <!-- Türme links und rechts -->
    <rect x="20" y="80" width="80" height="280" fill="${STONE}"/>
    <rect x="300" y="80" width="80" height="280" fill="${STONE}"/>
    <path d="M10 82 L60 0 L110 82Z" fill="${ROOF_R}"/>
    <path d="M290 82 L340 0 L390 82Z" fill="${ROOF_B}"/>
    ${win(51, 120)}${win(331, 120)}${win(51, 220)}${win(331, 220)}
    <!-- Bergfried -->
    <rect x="140" y="60" width="120" height="300" fill="${STONE}"/>
    <path d="M128 62 L200 -50 L272 62Z" fill="${ROOF_R}"/>
    <path d="M160 40 L200 -20 L240 40" fill="none" stroke="#c0383a" stroke-width="4"/>
    ${win(186, 100, 28, 40)}
    <path d="M140 200 H260 M140 250 H158 M240 250 H260 M100 290 H128 M272 290 H300" stroke="${STONE2}" stroke-width="4"/>
    ${gate ? `<path d="M168 360 V300 A32 32 0 0 1 232 300 V360Z" fill="${WOOD}"/>
    <path d="M180 360 V296 M200 360 V286 M220 360 V296 M168 320 H232 M168 342 H232" stroke="#7a4a28" stroke-width="4"/>
    <path d="M168 360 V300 A32 32 0 0 1 232 300 V360" fill="none"/>` : ''}
  </g>`;
}

/** Schreibturm: hoher runder Turm mit Fenster, Buch und Feder. Breite 200, Boden y = 0 (nach oben negativ). */
export function writeTower() {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    <path d="M40 0 V-260 H160 V0Z" fill="#e9dcf7"/>
    <path d="M40 -200 H160 M40 -120 H160 M40 -60 H70 M130 -60 H160" stroke="#cdb9ea" stroke-width="4"/>
    <path d="M26 -258 L100 -380 L174 -258Z" fill="#9067e0"/>
    <circle cx="100" cy="-385" r="12" fill="#ffd23f"/>
    <path d="M78 -150 V-188 A22 22 0 0 1 122 -188 V-150Z" fill="#3d2b4a"/>
    <!-- Eule im Fenster -->
    <ellipse cx="100" cy="-166" rx="16" ry="18" fill="#c9915a"/>
    <circle cx="93" cy="-170" r="6" fill="#fff"/><circle cx="107" cy="-170" r="6" fill="#fff"/>
    <circle cx="93" cy="-170" r="2.6" fill="${INK}" stroke="none"/><circle cx="107" cy="-170" r="2.6" fill="${INK}" stroke="none"/>
    <path d="M97 -162 L100 -157 L103 -162Z" fill="#ff9f43" stroke-width="2.5"/>
    <path d="M80 0 V-50 A20 20 0 0 1 120 -50 V0Z" fill="${WOOD}"/>
    <!-- Feder -->
    <path d="M170 -300 Q210 -350 230 -330 Q214 -296 176 -290Z" fill="#fff"/>
    <path d="M176 -290 L162 -270" stroke-width="4"/>
  </g>`;
}

/** Schatzkammer: kleines Haus mit Kuppel und Edelstein. Breite 220, Boden y = 0. */
export function treasury() {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    <rect x="20" y="-150" width="180" height="150" fill="${STONE}"/>
    <path d="M10 -148 Q110 -300 210 -148Z" fill="#ffd23f"/>
    <path d="M50 -170 Q110 -250 170 -170" fill="none" stroke="#e9a21f" stroke-width="5"/>
    <path d="M110 -310 L130 -290 L110 -256 L90 -290Z" fill="#ff6b8b"/>
    <path d="M90 -290 H130" stroke-width="3"/>
    <path d="M80 0 V-70 A30 30 0 0 1 140 -70 V0Z" fill="#e9a21f"/>
    <circle cx="128" cy="-40" r="5" fill="${INK}"/>
    ${win(36, -120, 26, 34)}${win(158, -120, 26, 34)}
    <path d="M40 -122 l8 -14 8 14Z M168 -122 l8 -14 8 14Z" fill="#5cc96b" stroke-width="3"/>
  </g>`;
}

/** Musikgarten: Hecke mit Rosenbogen und Noten. Breite 260, Boden y = 0. */
export function musicGarden() {
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    <rect x="0" y="-70" width="90" height="70" rx="30" fill="${GRASS3}"/>
    <rect x="170" y="-70" width="90" height="70" rx="30" fill="${GRASS3}"/>
    <path d="M90 0 V-120 A40 40 0 0 1 170 -120 V0" fill="none" stroke="${INK}" stroke-width="18"/>
    <path d="M90 0 V-120 A40 40 0 0 1 170 -120 V0" fill="none" stroke="${GRASS2}" stroke-width="10"/>
    <circle cx="96" cy="-130" r="9" fill="#ff6b8b"/><circle cx="130" cy="-168" r="9" fill="#ffd23f"/><circle cx="164" cy="-130" r="9" fill="#ff6b8b"/>
    <g class="notes" fill="${INK}">
      <path d="M200 -170 V-220 L230 -230 V-180" fill="none" stroke-width="5"/><ellipse cx="194" cy="-170" rx="9" ry="7"/><ellipse cx="224" cy="-180" rx="9" ry="7"/>
      <path d="M50 -110 V-150" stroke-width="5"/><ellipse cx="44" cy="-110" rx="9" ry="7"/>
    </g>
  </g>`;
}

/** Zauberwald: drei Bäume mit Funkeln. Breite 280, Boden y = 0. */
export function magicForest() {
  const tree = (x, s, c) => `<g transform="translate(${x} 0) scale(${s})"><rect x="-12" y="-70" width="24" height="70" fill="${WOOD}"/>
    <path d="M0 -220 L70 -60 H-70Z" fill="${c}"/><path d="M0 -260 L55 -140 H-55Z" fill="${c}"/></g>`;
  const star = (x, y, r) => `<path class="twinkle" d="M${x} ${y - r} L${x + r * .3} ${y - r * .3} L${x + r} ${y} L${x + r * .3} ${y + r * .3} L${x} ${y + r} L${x - r * .3} ${y + r * .3} L${x - r} ${y} L${x - r * .3} ${y - r * .3}Z" fill="#fff6a8" stroke-width="3"/>`;
  return `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    ${tree(60, .8, '#3fa452')}${tree(220, .75, '#3fa452')}${tree(140, 1, '#2f8f4b')}
    ${star(40, -230, 16)}${star(250, -200, 13)}${star(150, -290, 18)}
    <circle cx="140" cy="-90" r="12" fill="#b98cff"/>
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
  return `<path d="M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="#e8cf93" stroke-width="44" stroke-linecap="round"/>
    <path d="M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="#f6e2ad" stroke-width="30" stroke-linecap="round"/>`;
};

/** Grasbüschel und Blümchen zur Auflockerung. */
export const tuft = (x, y) => `<path d="M${x - 14} ${y} q4 -18 8 0 q4 -24 8 0 q4 -18 8 0" fill="none" stroke="${GRASS3}" stroke-width="5" stroke-linecap="round"/>`;
export const flower = (x, y, c = '#ff6b8b') => `<g stroke="${INK}" stroke-width="3"><path d="M${x} ${y} V${y - 22}" stroke="${GRASS3}" stroke-width="4"/><circle cx="${x}" cy="${y - 26}" r="8" fill="${c}"/><circle cx="${x}" cy="${y - 26}" r="3" fill="#ffd23f" stroke="none"/></g>`;
