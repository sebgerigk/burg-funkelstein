// Die eigene Burg mit allen Geschenken an ihren festen Plätzen. Zeichenfläche 1600 × 1000.
// Die Burg steht bei x 540–1060, Boden bei y = 760, davor der Burggraben, vorne eine Wiese.
import { INK } from '../engine/util.js';
import { sky, hills, castle, GRASS3, WATER, WOOD, tuft } from './world.js';
import { thingG } from './things.js';
import { figureSvg } from './figure.js';

const S = 'stroke="#3d2b4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';

const flag = (x, y, c, emblem = '') => `<path d="M${x} ${y} V${y - 96}" stroke-width="6"/>
  <g class="cloth"><path d="M${x} ${y - 94} Q${x + 34} ${y - 108} ${x + 70} ${y - 90} Q${x + 36} ${y - 74} ${x} ${y - 56}Z" fill="${c}"/>${emblem}</g>
  <circle cx="${x}" cy="${y - 100}" r="6" fill="#ffd23f"/>`;
const starAt = (x, y, r, fill = '#ffd23f') => {
  let d = '';
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r;
    d += (k ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1);
  }
  return `<path d="${d}Z" fill="${fill}" stroke-width="3"/>`;
};
const heartAt = (x, y, r) => `<path d="M${x} ${y + r} C${x - r * 1.6} ${y - r * .2} ${x - r * .6} ${y - r * 1.4} ${x} ${y - r * .4} C${x + r * .6} ${y - r * 1.4} ${x + r * 1.6} ${y - r * .2} ${x} ${y + r}Z" fill="#ff6b8b" stroke-width="3"/>`;
const pole = (x, base) => `<path d="M${x} ${base} V${base - 60}" stroke-width="7"/>`;

// Jedes Geschenk: wie es aussieht (Koordinaten der Zeichenfläche).
const ART = {
  'fahne-rot': () => flag(618, 296, '#e8504f'),
  'fahne-blau': () => flag(982, 296, '#4aa3ff'),
  'fahne-gelb': () => flag(696, 504, '#ffd23f'),
  'fahne-gruen': () => flag(904, 504, '#5cc96b'),
  'fahne-stern': () => `${pole(350, 760)}${flag(350, 700, '#4aa3ff', starAt(380, 628, 14))}`,
  'fahne-herz': () => `${pole(1180, 760)}${flag(1180, 700, '#fff4dc', heartAt(1212, 624, 13))}`,
  wimpel: () => {
    const pts = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, x = 670 + t * 260, y = 512 + Math.sin(t * Math.PI) * 60;
      pts.push([x, y]);
    }
    const cols = ['#e8504f', '#ffd23f', '#4aa3ff', '#5cc96b', '#b98cff', '#ff8fb8', '#ffd23f', '#e8504f'];
    return `<path d="M670 512 Q800 632 930 512" fill="none" stroke-width="4"/>
      ${pts.slice(0, -1).map(([x, y], k) => {
        const [x2, y2] = pts[k + 1];
        return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} L${x2.toFixed(0)} ${y2.toFixed(0)} L${((x + x2) / 2).toFixed(0)} ${((y + y2) / 2 + 40).toFixed(0)}Z" fill="${cols[k]}" stroke-width="3"/>`;
      }).join('')}`;
  },
  krone: () => `<g transform="translate(750 126) scale(1)">${thingG('krone', 50, 50, 1)}</g>`,
  feder: () => `<path d="M806 456 Q846 376 892 364 Q874 420 818 464Z" fill="#fff"/><path d="M812 460 Q846 410 874 380" fill="none" stroke-width="3"/><path d="M806 456 L796 476" stroke-width="5"/>`,

  pony: () => `<g transform="translate(374 780) scale(1.3)">
    <path d="M24 92 V64 M40 92 V66 M76 92 V66 M92 92 V64" stroke-width="9"/><path d="M24 92 V64 M40 92 V66 M76 92 V66 M92 92 V64" stroke="#fff4dc" stroke-width="4"/>
    <path d="M18 50 Q6 60 10 80" fill="none" stroke="#ff8fb8" stroke-width="9"/>
    <ellipse cx="58" cy="58" rx="42" ry="20" fill="#fff4dc"/>
    <path d="M86 50 Q90 22 100 14 L114 32 Q108 40 98 44 L96 60Z" fill="#fff4dc"/>
    <path d="M90 22 Q78 30 82 50 Q88 34 98 26" fill="#ff8fb8"/><path d="M98 14 L96 4 L104 12" fill="#fff4dc"/>
    <circle cx="103" cy="24" r="2.6" fill="${INK}" stroke="none"/></g>`,
  hund: () => `<g transform="translate(590 900)">
    <path d="M-34 0 V-26 M-18 0 V-24 M18 0 V-24 M34 0 V-26" stroke-width="9"/><path d="M-34 0 V-26 M-18 0 V-24 M18 0 V-24 M34 0 V-26" stroke="#d9a35f" stroke-width="4"/>
    <path d="M-40 -40 Q-62 -60 -56 -74" fill="none" stroke-width="7"/>
    <ellipse cx="0" cy="-40" rx="46" ry="22" fill="#d9a35f"/>
    <circle cx="44" cy="-70" r="24" fill="#d9a35f"/><ellipse cx="64" cy="-64" rx="10" ry="8" fill="#c27a3e"/><circle cx="72" cy="-66" r="4" fill="${INK}"/>
    <path d="M30 -88 Q18 -78 24 -56 Q36 -66 38 -84Z" fill="#8a5530"/>
    <circle cx="50" cy="-76" r="3.4" fill="${INK}" stroke="none"/></g>`,
  katze: () => `<g transform="translate(982 616)">
    <path d="M24 -6 Q48 -10 44 -36" fill="none" stroke-width="6"/>
    <ellipse cx="0" cy="-22" rx="24" ry="22" fill="#ff9f43"/>
    <circle cx="0" cy="-58" r="20" fill="#ff9f43"/><path d="M-18 -66 L-16 -88 L-4 -76Z M18 -66 L16 -88 L4 -76Z" fill="#ff9f43"/>
    <circle cx="-7" cy="-60" r="3" fill="${INK}" stroke="none"/><circle cx="7" cy="-60" r="3" fill="${INK}" stroke="none"/>
    <path d="M-4 -52 Q0 -48 4 -52" fill="none" stroke-width="3"/><path d="M-10 -30 H10" stroke="#e07b22" stroke-width="4"/></g>`,
  huhn: () => `<g transform="translate(1020 900)">
    <path d="M-8 0 V-18 M8 0 V-18" stroke="#ff9f43" stroke-width="5"/>
    <ellipse cx="0" cy="-40" rx="32" ry="26" fill="#fff"/><path d="M-30 -48 Q-46 -66 -32 -70 Q-30 -58 -24 -54" fill="#fff"/>
    <circle cx="20" cy="-66" r="16" fill="#fff"/><path d="M14 -82 q4 -10 8 0 q4 -10 8 0" fill="#e8504f" stroke-width="3"/>
    <path d="M34 -68 L46 -64 L34 -60Z" fill="#ff9f43" stroke-width="3"/><circle cx="24" cy="-70" r="2.8" fill="${INK}" stroke="none"/>
    <path d="M-10 -40 Q2 -30 14 -42" fill="none" stroke-width="3"/></g>`,
  ente: () => `<g transform="translate(610 792)">
    <path d="M-34 -10 Q-40 -30 -20 -28 H18 Q34 -28 30 -6 Q0 6 -34 -10Z" fill="#ffd23f"/>
    <circle cx="20" cy="-40" r="14" fill="#ffd23f"/><path d="M32 -42 L46 -38 L32 -32Z" fill="#ff9f43" stroke-width="3"/><circle cx="22" cy="-44" r="2.6" fill="${INK}" stroke="none"/>
    <path d="M-14 -18 Q0 -10 12 -20" fill="none" stroke-width="3"/></g>`,
  schwan: () => `<g transform="translate(990 792)">
    <path d="M-40 -10 Q-48 -36 -16 -32 H16 Q40 -32 36 -6 Q0 8 -40 -10Z" fill="#fff"/>
    <path d="M22 -30 Q40 -40 30 -64 Q22 -82 36 -88" fill="none" stroke-width="15"/><path d="M22 -30 Q40 -40 30 -64 Q22 -82 36 -88" fill="none" stroke="#fff" stroke-width="7"/>
    <path d="M38 -92 L52 -86 L38 -82Z" fill="#ff9f43" stroke-width="3"/><circle cx="36" cy="-90" r="2.4" fill="${INK}" stroke="none"/>
    <path d="M-20 -22 Q-4 -12 12 -24" fill="none" stroke-width="3"/></g>`,
  eule: () => `<g transform="translate(618 616)">
    <ellipse cx="0" cy="-24" rx="18" ry="22" fill="#c9915a"/><path d="M-14 -40 L-16 -52 L-6 -44 M14 -40 L16 -52 L6 -44" fill="#c9915a"/>
    <circle cx="-7" cy="-30" r="6.5" fill="#fff"/><circle cx="7" cy="-30" r="6.5" fill="#fff"/>
    <circle cx="-7" cy="-30" r="2.8" fill="${INK}" stroke="none"/><circle cx="7" cy="-30" r="2.8" fill="${INK}" stroke="none"/>
    <path d="M-3 -22 L0 -17 L3 -22Z" fill="#ff9f43" stroke-width="2.5"/></g>`,
  igel: () => `<g transform="translate(1310 900)">
    <path d="M-40 0 Q-44 -44 0 -48 Q30 -48 40 -18 L48 -8 L40 0Z" fill="#8a5530"/>
    <path d="M-34 -14 l-10 -8 M-30 -30 l-10 -12 M-16 -40 l-6 -14 M0 -44 l0 -14 M16 -42 l6 -12" stroke-width="5"/>
    <path d="M24 -26 Q40 -24 48 -8 L36 0 H22Z" fill="#e8c493"/><circle cx="48" cy="-8" r="4" fill="${INK}"/><circle cx="32" cy="-16" r="2.6" fill="${INK}" stroke="none"/></g>`,
  hase: () => `<g transform="translate(1210 900)">
    <ellipse cx="0" cy="-26" rx="28" ry="26" fill="#eee5f4"/><circle cx="-26" cy="-22" r="9" fill="#fff"/>
    <circle cx="18" cy="-58" r="18" fill="#eee5f4"/>
    <path d="M8 -72 Q0 -112 12 -112 Q22 -110 20 -74Z M22 -72 Q28 -110 38 -106 Q44 -100 30 -70Z" fill="#eee5f4"/>
    <path d="M12 -78 Q8 -100 13 -104 M28 -76 Q34 -98 37 -100" stroke="#ff9db0" stroke-width="3.5" fill="none"/>
    <circle cx="24" cy="-60" r="2.8" fill="${INK}" stroke="none"/><circle cx="34" cy="-54" r="3" fill="#ff9db0" stroke="none"/></g>`,
  rose: () => `<g transform="translate(492 760)"><path d="M0 0 V-60" stroke="${GRASS3}" stroke-width="6"/><path d="M0 -30 Q16 -40 22 -30 Q12 -22 0 -30Z" fill="${GRASS3}" stroke-width="3"/>
    <circle cx="0" cy="-72" r="18" fill="#e8504f"/><path d="M-8 -72 Q0 -84 8 -72 Q0 -64 -8 -72" fill="none" stroke-width="3"/></g>`,
  tulpe: () => `<g transform="translate(1110 760)"><path d="M0 0 V-58" stroke="${GRASS3}" stroke-width="6"/><path d="M0 -20 Q-20 -30 -18 -48 Q-4 -40 0 -24" fill="${GRASS3}" stroke-width="3"/>
    <path d="M-18 -84 L-10 -72 L0 -86 L10 -72 L18 -84 Q20 -56 0 -54 Q-20 -56 -18 -84Z" fill="#ffd23f"/></g>`,
  sonnenblume: () => `<g transform="translate(1260 760)"><path d="M0 0 V-110" stroke="${GRASS3}" stroke-width="7"/><path d="M0 -50 Q-24 -60 -28 -40 Q-14 -34 0 -46" fill="${GRASS3}" stroke-width="3"/>
    ${Array.from({ length: 10 }, (_, k) => { const a = k * 36 * Math.PI / 180; return `<ellipse cx="${(Math.cos(a) * 26).toFixed(1)}" cy="${(-120 + Math.sin(a) * 26).toFixed(1)}" rx="13" ry="8" transform="rotate(${k * 36} ${(Math.cos(a) * 26).toFixed(1)} ${(-120 + Math.sin(a) * 26).toFixed(1)})" fill="#ffd23f" stroke-width="3"/>`; }).join('')}
    <circle cx="0" cy="-120" r="17" fill="#8a5530"/></g>`,
  apfelbaum: () => `<g transform="translate(1385 760)"><path d="M-14 0 L-10 -100 H10 L14 0Z" fill="${WOOD}"/>
    <path d="M0 -240 Q70 -240 80 -180 Q106 -150 80 -112 Q60 -84 0 -92 Q-60 -84 -80 -112 Q-106 -150 -80 -180 Q-70 -240 0 -240Z" fill="#5cc96b"/>
    ${[[-40, -170], [20, -200], [44, -130], [-20, -120], [60, -176]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#ff5a5a" stroke-width="3"/>`).join('')}</g>`,
  kuerbis: () => `<g transform="translate(1115 900)"><ellipse cx="0" cy="-30" rx="44" ry="30" fill="#ff9f43"/>
    <path d="M-16 -58 Q-24 -30 -16 -2 M16 -58 Q24 -30 16 -2" fill="none" stroke="#e07b22" stroke-width="4"/><path d="M0 -58 V-74 Q8 -80 14 -76" fill="none" stroke="${GRASS3}" stroke-width="7"/></g>`,
  pilz: () => `<g transform="translate(1415 900)"><path d="M-12 0 V-30 Q0 -36 12 -30 V0Z" fill="#fff4dc"/>
    <path d="M-40 -30 Q-40 -76 0 -76 Q40 -76 40 -30Z" fill="#e8504f"/><circle cx="-16" cy="-52" r="6" fill="#fff" stroke-width="2.5"/><circle cx="14" cy="-60" r="7" fill="#fff" stroke-width="2.5"/><circle cx="20" cy="-38" r="5" fill="#fff" stroke-width="2.5"/></g>`,
  brunnen: () => `<g transform="translate(430 760)"><rect x="-40" y="-50" width="80" height="50" rx="8" fill="#c8d2de"/><path d="M-40 -30 H40 M-14 -50 V-30 M14 -30 V0" stroke="#9aa7b8" stroke-width="4"/>
    <path d="M-34 -50 V-110 M34 -50 V-110" stroke="${WOOD}" stroke-width="8"/><path d="M-52 -106 L0 -140 L52 -106Z" fill="#e8504f"/>
    <path d="M0 -106 V-70" stroke-width="3"/><rect x="-10" y="-74" width="20" height="16" rx="3" fill="${WOOD}" stroke-width="3"/>
    <path d="M-30 -52 Q0 -44 30 -52" stroke="${WATER}" stroke-width="6" fill="none"/></g>`,
};

/** Wo das Kind steht (vor dem Tor auf der Brücke) und wo die Edelstein-Truhe steht. */
const FIGURE_AT = { x: 800, y: 905 };
const GEMS_AT = { x: 905, y: 905 };

function gemChest(n) {
  if (!n) return '';
  const shown = Math.min(n, 12);
  const gems = Array.from({ length: shown }, (_, k) => {
    const col = ['#ff6b8b', '#4aa3ff', '#5cc96b', '#ffd23f', '#b98cff'][k % 5];
    const x = GEMS_AT.x - 40 + (k % 4) * 26 + (Math.floor(k / 4) % 2) * 13, y = GEMS_AT.y - 60 - Math.floor(k / 4) * 14;
    return thingG('edelstein', x, y, .24, col);
  }).join('');
  return `<g class="gift gems" data-id="edelstein">
    <rect x="${GEMS_AT.x - 50}" y="${GEMS_AT.y - 54}" width="100" height="54" rx="8" fill="#c27a3e"/>
    <rect x="${GEMS_AT.x - 6}" y="${GEMS_AT.y - 54}" width="12" height="54" fill="#ffd23f"/>${gems}</g>`;
}

/**
 * Die ganze Burgansicht. owned: Geschenk-ids, die die Burg schon hat.
 * highlight: ein Geschenk, das gerade neu dazugekommen ist (leuchtet auf).
 */
export function castleScene({ owned = {}, gems = 0, figure = 'ritter', highlight = null, order = [] }) {
  const ids = order.filter(id => owned[id] && ART[id]);
  return `<svg class="castle-scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    ${sky()}${hills(720)}
    <g ${S}>
      <rect x="0" y="758" width="1600" height="242" fill="#7fd36b" stroke="none"/>
      ${tuft(520, 960)}${tuft(700, 850)}${tuft(1500, 820)}${tuft(1060, 960)}
    </g>
    <g transform="translate(540 292) scale(1.3)">${castle()}</g>
    <g ${S}>
      <path d="M510 762 H1090 V798 Q800 810 510 798Z" fill="${WATER}"/>
      <path d="M540 780 q16 -8 32 0 M680 784 q16 -8 32 0 M880 784 q16 -8 32 0 M1030 780 q16 -8 32 0" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/>
      <path d="M758 760 H842 L854 812 H746Z" fill="${WOOD}"/><path d="M754 778 H846 M750 796 H850" stroke="#7a4a28" stroke-width="4"/>
    </g>
    <g ${S}>${ids.map(id => `<g class="gift g-${id}${id === highlight ? ' new' : ''}" data-id="${id}">${ART[id]()}</g>`).join('')}${gemChest(gems)}</g>
    <g class="castle-figure"><g transform="translate(${FIGURE_AT.x - 45} ${FIGURE_AT.y - 150}) scale(.75)">${figureSvg(figure).replace('<svg ', '<svg width="120" height="200" ')}</g></g>
  </svg>`;
}

/** Ein Geschenk allein (für die Vorschau in der Truhe); die Größe passt fitThumbs() an. */
export function giftArt(id) {
  if (id === 'edelstein') return thingG('edelstein', 50, 50, 1, '#ff6b8b');
  return ART[id] ? ART[id]() : '';
}
