// Bilder für den Zauberwald: Wappenschilde, Wimpel, Bildfolgen, Memory-Rückseite,
// und Bilder aus der Burg (Tiere, Pflanzen, Dinge) für Memory, Schatten und „Was passt nicht?".
import { INK } from '../engine/util.js';
import { giftArt } from './castle.js';
import { thingG } from './things.js';

const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const box = (body, cls = '') => `<svg class="${cls}" viewBox="0 0 120 120" aria-hidden="true"><g ${S}>${body}</g></svg>`;

export const COLORS = {
  rot: '#e8504f', blau: '#4aa3ff', gelb: '#ffd23f', gruen: '#5cc96b', lila: '#b98cff',
};

/* ---------- Bilder aus der Burg ---------- */

const THINGS = ['edelstein', 'hufeisen', 'apfel'];
/** Ein Bild (Tier, Pflanze, Ding). Den Ausschnitt setzt fitThumbs() aus screens/castle.js. */
export function picSvg(id) {
  if (THINGS.includes(id)) return `<svg class="gift-thumb pic" viewBox="0 0 100 100" aria-hidden="true">${thingG(id, 50, 50, 1, '#4aa3ff')}</svg>`;
  return `<svg class="gift-thumb pic" viewBox="0 0 100 100" aria-hidden="true"><g ${S}>${giftArt(id)}</g></svg>`;
}

/* ---------- Wappenschilde ---------- */

const EMBLEM = {
  stern: (c, x, y, r) => {
    let d = '';
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r;
      d += (k ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1);
    }
    return `<path d="${d}Z" fill="${c}" stroke-width="3.5"/>`;
  },
  herz: (c, x, y, r) => `<path d="M${x} ${y + r} C${x - r * 1.7} ${y - r * .1} ${x - r * .7} ${y - r * 1.5} ${x} ${y - r * .45} C${x + r * .7} ${y - r * 1.5} ${x + r * 1.7} ${y - r * .1} ${x} ${y + r}Z" fill="${c}" stroke-width="3.5"/>`,
  mond: (c, x, y, r) => `<path d="M${x + r * .3} ${y - r} A${r} ${r} 0 1 0 ${x + r * .3} ${y + r} A${r * .75} ${r * .75} 0 1 1 ${x + r * .3} ${y - r}Z" fill="${c}" stroke-width="3.5"/>`,
  blume: (c, x, y, r) => `${[0, 72, 144, 216, 288].map(a => `<circle cx="${(x + Math.cos(a * Math.PI / 180) * r * .55).toFixed(1)}" cy="${(y + Math.sin(a * Math.PI / 180) * r * .55).toFixed(1)}" r="${(r * .45).toFixed(1)}" fill="${c}" stroke-width="3"/>`).join('')}<circle cx="${x}" cy="${y}" r="${(r * .35).toFixed(1)}" fill="#ffd23f" stroke-width="3"/>`,
  kreis: (c, x, y, r) => `<circle cx="${x}" cy="${y}" r="${r * .8}" fill="${c}" stroke-width="3.5"/>`,
};
export const EMBLEMS = Object.keys(EMBLEM);

/** Ein Wappenschild: { color, emblem, ecolor, count (1–3), stripe } */
export function shieldSvg({ color, emblem, ecolor = '#fff', count = 1, stripe = false }) {
  const spots = { 1: [[60, 58, 20]], 2: [[44, 50, 14], [76, 50, 14]], 3: [[42, 44, 12], [78, 44, 12], [60, 76, 12]] }[count];
  return box(`<path d="M16 14 H104 V56 Q104 96 60 112 Q16 96 16 56Z" fill="${color}"/>
    ${stripe ? '<path d="M16 34 H104" stroke-width="10" stroke="#fff" opacity=".8"/><path d="M16 14 H104 V56 Q104 96 60 112 Q16 96 16 56Z" fill="none"/>' : ''}
    ${spots.map(([x, y, r]) => EMBLEM[emblem](ecolor, x, y, r)).join('')}`, 'shield');
}

/* ---------- Wimpel (Fahnen-Muster) ---------- */

// Jede Farbe hat zusätzlich ein eigenes Zeichen – so geht es auch bei Farbschwäche.
const PENNANT_MARK = { rot: 'herz', blau: 'stern', gelb: 'kreis', gruen: 'blume', lila: 'mond' };
export function pennantSvg(color) {
  return `<svg class="pennant" viewBox="0 0 80 110" aria-hidden="true"><g ${S}>
    <path d="M6 8 H74 L40 104Z" fill="${COLORS[color]}"/>${EMBLEM[PENNANT_MARK[color]]('#fff', 40, 36, 13)}</g></svg>`;
}

/* ---------- Memory ---------- */

export const cardBack = () => box(`<rect x="6" y="6" width="108" height="108" rx="16" fill="#9067e0"/>
  <rect x="18" y="18" width="84" height="84" rx="10" fill="none" stroke="#b98cff" stroke-width="5"/>
  ${EMBLEM.stern('#ffd23f', 60, 62, 24)}`, 'card-back');

/* ---------- Bildfolgen (Was kommt zuerst?) ---------- */
// Je drei Bilder. Nur Abläufe, deren Reihenfolge ein Kind eindeutig erkennt.

const ground = '<path d="M8 104 H112" stroke-width="5"/>';
const SEQ_ART = {
  ei: [
    `<ellipse cx="60" cy="66" rx="30" ry="38" fill="#fff4dc"/>${ground}`,
    `<path d="M30 70 Q30 30 60 28 Q90 30 90 70 L80 60 L70 72 L60 58 L50 72 L40 60Z" fill="#fff4dc"/><circle cx="60" cy="58" r="14" fill="#ffd23f"/><circle cx="56" cy="55" r="2.5" fill="${INK}" stroke="none"/><path d="M62 60 L70 62 L62 64Z" fill="#ff9f43" stroke-width="2.5"/>
     <path d="M30 70 Q30 104 60 104 Q90 104 90 70 L80 80 L70 68 L60 82 L50 68 L40 80Z" fill="#fff4dc"/>${ground}`,
    `<ellipse cx="60" cy="78" rx="26" ry="22" fill="#ffd23f"/><circle cx="66" cy="46" r="18" fill="#ffd23f"/><circle cx="71" cy="42" r="3" fill="${INK}" stroke="none"/><path d="M82 46 L94 49 L82 53Z" fill="#ff9f43" stroke-width="3"/>
     <path d="M48 98 V104 M66 98 V104" stroke="#ff9f43" stroke-width="5"/>${ground}`,
  ],
  blume: [
    `<path d="M8 86 H112 V112 H8Z" fill="#a8683a"/><ellipse cx="60" cy="80" rx="8" ry="5" fill="#6b4630"/>`,
    `<path d="M8 86 H112 V112 H8Z" fill="#a8683a"/><path d="M60 86 V60" stroke="#49a845" stroke-width="6"/><path d="M60 66 Q44 52 36 62 Q46 74 60 68Z M60 62 Q76 48 84 58 Q74 70 60 64Z" fill="#5cc96b" stroke-width="3.5"/>`,
    `<path d="M8 86 H112 V112 H8Z" fill="#a8683a"/><path d="M60 86 V40" stroke="#49a845" stroke-width="6"/><path d="M60 70 Q44 58 38 66 Q48 78 60 74Z" fill="#5cc96b" stroke-width="3.5"/>
     ${EMBLEM.blume('#ff6b8b', 60, 32, 26)}`,
  ],
  apfel: [
    `${thingG('apfel', 60, 62, .8)}`,
    `<path d="M60 38 Q40 22 26 42 Q14 64 32 86 Q46 102 60 92 Q66 96 72 94 Q62 80 70 66 Q60 56 72 44 Q66 36 60 38Z" fill="#ff5a5a"/><path d="M72 44 Q60 56 70 66 Q62 80 72 94" fill="#fff4dc" stroke-width="4"/><path d="M60 38 Q60 26 66 16" fill="none"/>`,
    `<path d="M50 28 Q60 34 70 28 Q62 46 66 62 Q60 76 70 96 Q60 90 50 96 Q60 76 54 62 Q58 46 50 28Z" fill="#fff4dc"/><path d="M60 28 Q60 18 66 10" fill="none"/><ellipse cx="58" cy="60" rx="3" ry="5" fill="#6b4630" stroke="none"/>`,
  ],
  schneemann: [
    `<circle cx="60" cy="80" r="24" fill="#fff"/>${ground}`,
    `<circle cx="60" cy="80" r="24" fill="#fff"/><circle cx="60" cy="44" r="17" fill="#fff"/>${ground}`,
    `<circle cx="60" cy="80" r="24" fill="#fff"/><circle cx="60" cy="48" r="16" fill="#fff"/><circle cx="60" cy="22" r="12" fill="#fff"/>
     <rect x="48" y="2" width="24" height="12" fill="${INK}"/><path d="M42 14 H78" stroke-width="5"/><path d="M60 24 L72 26 L60 28Z" fill="#ff9f43" stroke-width="2.5"/>
     <circle cx="56" cy="19" r="2" fill="${INK}" stroke="none"/><circle cx="64" cy="19" r="2" fill="${INK}" stroke="none"/>${ground}`,
  ],
  turm: [
    `<rect x="36" y="76" width="48" height="28" rx="4" fill="#e8504f"/>${ground}`,
    `<rect x="36" y="76" width="48" height="28" rx="4" fill="#e8504f"/><rect x="40" y="48" width="40" height="28" rx="4" fill="#4aa3ff"/>${ground}`,
    `<rect x="36" y="76" width="48" height="28" rx="4" fill="#e8504f"/><rect x="40" y="48" width="40" height="28" rx="4" fill="#4aa3ff"/><rect x="44" y="20" width="32" height="28" rx="4" fill="#ffd23f"/>
     <path d="M60 20 V4" stroke-width="4"/><path d="M60 4 L78 9 L60 14Z" fill="#5cc96b" stroke-width="3"/>${ground}`,
  ],
  eis: [
    `<path d="M42 58 L60 108 L78 58Z" fill="#e8b46a"/><circle cx="60" cy="48" r="20" fill="#ff8fb8"/><circle cx="60" cy="24" r="16" fill="#fff4dc"/>`,
    `<path d="M42 58 L60 108 L78 58Z" fill="#e8b46a"/><circle cx="60" cy="48" r="20" fill="#ff8fb8"/>`,
    `<path d="M48 70 L60 108 L72 70Z" fill="#e8b46a"/><path d="M48 70 Q54 64 60 70 Q66 64 72 70" fill="none" stroke-width="4"/>`,
  ],
};
// Raupe -> Puppe -> Schmetterling
const leaf = `<path d="M10 100 Q60 70 112 96 Q60 116 10 100Z" fill="#5cc96b"/>`;
SEQ_ART.raupe = [
  `${leaf}${[0, 1, 2, 3, 4].map(k => `<circle cx="${30 + k * 14}" cy="${84 - (k % 2) * 4}" r="9" fill="#9ad985"/>`).join('')}<circle cx="96" cy="78" r="10" fill="#9ad985"/><circle cx="99" cy="75" r="2.4" fill="${INK}" stroke="none"/>`,
  `<path d="M60 8 V24" stroke-width="4"/><path d="M60 24 Q78 40 72 74 Q66 100 60 104 Q54 100 48 74 Q42 40 60 24Z" fill="#c9915a"/><path d="M50 50 Q60 56 70 50 M49 70 Q60 76 71 70" fill="none" stroke-width="3"/>`,
  `<path d="M60 40 Q20 10 14 46 Q12 72 58 62Z" fill="#ff9f43"/><path d="M60 40 Q100 10 106 46 Q108 72 62 62Z" fill="#ff9f43"/>
   <path d="M58 64 Q24 74 30 98 Q46 104 58 72Z" fill="#ffd23f"/><path d="M62 64 Q96 74 90 98 Q74 104 62 72Z" fill="#ffd23f"/>
   <ellipse cx="60" cy="64" rx="6" ry="24" fill="#6b4630"/><path d="M58 42 Q52 26 46 22 M62 42 Q68 26 74 22" fill="none" stroke-width="3"/>`,
];
// Malen: leeres Blatt -> halbes Bild -> fertiges Bild
const paper = `<rect x="14" y="14" width="92" height="92" rx="6" fill="#fff"/>`;
SEQ_ART.malen = [
  `${paper}<path d="M86 96 L104 78" stroke="#e8504f" stroke-width="7"/>`,
  `${paper}<path d="M36 52 A18 18 0 0 1 72 52" fill="none" stroke="#ffd23f" stroke-width="9"/><path d="M86 96 L104 78" stroke="#e8504f" stroke-width="7"/>`,
  `${paper}<circle cx="54" cy="52" r="18" fill="#ffd23f"/><path d="M54 24 V16 M54 80 V88 M26 52 H18 M82 52 H90" stroke="#ffd23f" stroke-width="5"/><path d="M20 98 Q60 84 100 98" stroke="#5cc96b" stroke-width="7" fill="none"/>`,
];
// Geschenk: eingepackt -> Deckel ab -> Teddy schaut heraus
const boxBase = `<rect x="22" y="56" width="76" height="52" rx="4" fill="#4aa3ff"/><path d="M60 56 V108" stroke="#ffd23f" stroke-width="8"/>`;
SEQ_ART.geschenk = [
  `${boxBase}<rect x="16" y="40" width="88" height="18" rx="4" fill="#4aa3ff"/><path d="M60 40 V58" stroke="#ffd23f" stroke-width="8"/><path d="M60 40 Q40 20 44 36 Q48 44 60 40 Q72 44 76 36 Q80 20 60 40Z" fill="#ffd23f"/>`,
  `${boxBase}<g transform="rotate(-28 104 52)"><rect x="24" y="36" width="80" height="16" rx="4" fill="#4aa3ff"/></g>`,
  `${boxBase}<circle cx="60" cy="44" r="18" fill="#c9915a"/><circle cx="46" cy="30" r="7" fill="#c9915a"/><circle cx="74" cy="30" r="7" fill="#c9915a"/>
   <circle cx="54" cy="42" r="2.5" fill="${INK}" stroke="none"/><circle cx="66" cy="42" r="2.5" fill="${INK}" stroke="none"/><ellipse cx="60" cy="50" rx="5" ry="4" fill="#e8c493" stroke-width="2.5"/>`,
];
// Wetter: Wolke -> Regen -> Regenbogen
const cloud = `<path d="M24 52 Q20 32 40 32 Q46 16 64 22 Q84 14 90 34 Q106 36 100 52Z" fill="#e6eef5"/>`;
SEQ_ART.regen = [
  `<circle cx="88" cy="30" r="16" fill="#ffd23f"/>${cloud.replace('#e6eef5', '#fff')}`,
  `${cloud.replace('#e6eef5', '#b8c6d6')}${[[34, 66], [54, 76], [74, 66], [44, 92], [64, 98], [84, 88]].map(([x, y]) => `<path d="M${x} ${y} l-4 10" stroke="#4aa3ff" stroke-width="5"/>`).join('')}`,
  `${['#e8504f', '#ff9f43', '#ffd23f', '#5cc96b', '#4aa3ff'].map((c, k) => `<path d="M${14 + k * 7} 100 A${46 - k * 7} ${46 - k * 7} 0 0 1 ${106 - k * 7} 100" fill="none" stroke="${c}" stroke-width="7"/>`).join('')}<circle cx="96" cy="26" r="13" fill="#ffd23f"/>`,
];

export const SEQUENCES = Object.keys(SEQ_ART);
export const seqSvg = (id, k) => box(SEQ_ART[id][k], 'seq-pic');
