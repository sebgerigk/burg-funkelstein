// Dinge: zum Zählen (Edelstein, Apfel, Hufeisen, Krone), Würfel, Truhe, Korb, Pony,
// und die Bilder der Stationen.
import { INK } from '../engine/util.js';

export const GEM_COLORS = ['#ff6b8b', '#4aa3ff', '#5cc96b', '#ffd23f', '#b98cff'];

const wrap = (body, vb = '0 0 100 100', cls = '') => `<svg class="thing ${cls}" viewBox="${vb}" aria-hidden="true"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;

const gemBody = (c = '#ff6b8b') => `<path d="M30 18 H70 L90 42 L50 90 L10 42Z" fill="${c}"/>
  <path d="M10 42 H90 M30 18 L40 42 L50 90 L60 42 L70 18" fill="none" stroke-width="3.5"/>
  <path d="M33 28 L28 38" stroke="#fff" stroke-width="5" opacity=".75"/>`;
const appleBody = () => `<path d="M50 30 Q30 14 16 34 Q4 56 22 78 Q36 94 50 84 Q64 94 78 78 Q96 56 84 34 Q70 14 50 30Z" fill="#ff5a5a"/>
  <path d="M50 30 Q50 18 56 8" fill="none" stroke-width="5"/><path d="M56 16 Q72 6 80 18 Q66 26 56 16Z" fill="#5cc96b" stroke-width="3.5"/>
  <path d="M28 44 Q26 54 30 62" stroke="#fff" stroke-width="5" opacity=".7" fill="none"/>`;
const shoeBody = () => `<path d="M24 86 L18 50 Q16 14 50 14 Q84 14 82 50 L76 86 H60 L64 52 Q66 32 50 32 Q34 32 36 52 L40 86Z" fill="#c8d2de"/>
  <circle cx="26" cy="64" r="3" fill="${INK}" stroke="none"/><circle cx="74" cy="64" r="3" fill="${INK}" stroke="none"/>
  <circle cx="30" cy="38" r="3" fill="${INK}" stroke="none"/><circle cx="70" cy="38" r="3" fill="${INK}" stroke="none"/>`;
const crownBody = () => `<path d="M14 78 L10 28 L32 50 L50 18 L68 50 L90 28 L86 78Z" fill="#ffd23f"/>
  <path d="M14 66 H86" stroke-width="4"/><circle cx="50" cy="56" r="6" fill="#ff6b8b" stroke-width="3"/>
  <circle cx="10" cy="26" r="5" fill="#fff"/><circle cx="50" cy="16" r="5" fill="#fff"/><circle cx="90" cy="26" r="5" fill="#fff"/>`;

const BODIES = { edelstein: gemBody, apfel: appleBody, hufeisen: shoeBody, krone: crownBody };

/** Ein Ding zum Zählen als SVG. color nur für Edelsteine. */
export const thingSvg = (kind, color) => wrap(BODIES[kind](color), '0 0 100 100', 'thing-' + kind);
/** Dasselbe als <g> zum Einbetten (Zeichenfläche 100 × 100, Mitte bei 50/50). */
export const thingG = (kind, x, y, s = 1, color) => `<g transform="translate(${x - 50 * s} ${y - 50 * s}) scale(${s})" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${BODIES[kind](color)}</g>`;

/** Würfelaugen für 1–6 (Positionen auf einer Fläche 100 × 100). */
export const PIPS = {
  1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
};

export const dieSvg = n => wrap(`<rect x="6" y="6" width="88" height="88" rx="18" fill="#fff"/>
  ${PIPS[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${INK}" stroke="none"/>`).join('')}`, '0 0 100 100', 'die');

/** Schatztruhe, offen oder zu. Zeichenfläche 200 × 160. */
export function chestSvg(open = false) {
  return `<svg class="chest-svg ${open ? 'open' : ''}" viewBox="0 0 200 170" aria-hidden="true"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    <g class="chest-glow" opacity="0"><circle cx="100" cy="70" r="60" fill="#fff6a8" stroke="none"/></g>
    <rect x="20" y="70" width="160" height="90" rx="10" fill="#c27a3e"/>
    <path d="M20 100 H180" stroke-width="4"/>
    <rect x="40" y="70" width="18" height="90" fill="#ffd23f"/><rect x="142" y="70" width="18" height="90" fill="#ffd23f"/>
    <rect x="88" y="88" width="24" height="28" rx="5" fill="#ffd23f"/><circle cx="100" cy="100" r="4" fill="${INK}" stroke="none"/>
    <g class="chest-lid"><path d="M20 72 V50 Q20 14 100 14 Q180 14 180 50 V72Z" fill="#d88a49"/>
      <path d="M40 72 V24 M58 72 V20 M142 72 V20 M160 72 V24" stroke="none"/>
      <path d="M40 72 V22 Q49 18 58 18 V72Z M142 72 V18 Q151 18 160 22 V72Z" fill="#ffd23f"/></g>
  </g></svg>`;
}

/** Ein Korb (für „Wo sind mehr?"). Zeichenfläche 300 × 120, als Unterteil hinter den Äpfeln. */
export const basketSvg = () => `<svg class="basket-svg" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
  <path d="M8 20 H292 L262 112 H38Z" fill="#d9a35f"/>
  <path d="M20 50 H280 M30 80 H270 M80 20 L90 112 M150 20 V112 M220 20 L210 112" stroke="#b07a3a" stroke-width="4"/>
  <rect x="2" y="10" width="296" height="18" rx="9" fill="#c98b4f"/></g></svg>`;

/** Kleines Pony von der Seite (Fortschritt in der Runde). Zeichenfläche 120 × 100. */
export const ponySvg = (c = '#fff4dc', mane = '#b98cff') => `<svg class="pony-svg" viewBox="0 0 120 100" aria-hidden="true"><g stroke="${INK}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M24 92 V64 M40 92 V66 M76 92 V66 M92 92 V64" stroke-width="9"/>
  <path d="M24 92 V64 M40 92 V66 M76 92 V66 M92 92 V64" stroke="${c}" stroke-width="4"/>
  <path d="M18 50 Q6 60 10 80" fill="none" stroke="${mane}" stroke-width="9"/>
  <ellipse cx="58" cy="58" rx="42" ry="20" fill="${c}"/>
  <path d="M86 50 Q90 22 100 14 L114 32 Q108 40 98 44 L96 60Z" fill="${c}"/>
  <path d="M90 22 Q78 30 82 50 Q88 34 98 26" fill="${mane}"/>
  <path d="M98 14 L96 4 L104 12" fill="${c}"/>
  <circle cx="103" cy="24" r="2.6" fill="${INK}" stroke="none"/>
</g></svg>`;

/** Kleine Fahne auf dem Fortschrittsweg. */
export const flagSvg = (c = '#ff6b8b') => `<svg class="flag-svg" viewBox="0 0 40 60" aria-hidden="true"><g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M8 58 V4" /><path d="M8 6 Q22 0 36 8 Q22 14 8 22Z" fill="${c}"/></g></svg>`;

/** Bilder für die Stationen (Zeichenfläche 120 × 120). */
export function stationIcon(id) {
  const box = body => `<svg class="st-icon" viewBox="0 0 120 120" aria-hidden="true"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
  const path = (d, c = '#9067e0') => `<path d="${d}" fill="none" stroke="#e9dcf7" stroke-width="22"/><path d="${d}" fill="none" stroke="${c}" stroke-width="6" stroke-dasharray="2 12"/>`;
  switch (id) {
    case 'schreib-wege': return box(`${path('M18 60 H102')}${thingG('apfel', 100, 60, .32)}<circle cx="20" cy="60" r="12" fill="#5cc96b"/>`);
    case 'schreib-wellen': return box(path('M12 70 Q36 30 60 70 T108 70'));
    case 'schreib-formen': return box(`<circle cx="42" cy="46" r="24" fill="#ffd23f"/><path d="M62 98 L84 58 L106 98Z" fill="#ff6b8b"/><rect x="14" y="76" width="34" height="30" fill="#4aa3ff"/>`);
    case 'zahl-zaehlen': return box(`${thingG('edelstein', 34, 38, .4, '#ff6b8b')}${thingG('edelstein', 82, 38, .4, '#4aa3ff')}${thingG('edelstein', 58, 82, .4, '#5cc96b')}`);
    case 'zahl-einpacken': return box(`<rect x="10" y="40" width="100" height="56" rx="10" fill="#c27a3e"/>
      ${[0, 1, 2].map(k => `<circle cx="${30 + k * 30}" cy="68" r="11" fill="#7a4a28"/>`).join('')}${thingG('apfel', 30, 66, .26)}${thingG('apfel', 60, 66, .26)}
      <path d="M86 16 Q96 30 90 44" fill="none" stroke-dasharray="4 8"/>`);
    case 'zahl-blick': return box(`<rect x="14" y="14" width="56" height="56" rx="12" fill="#fff"/><circle cx="30" cy="30" r="6" fill="${INK}" stroke="none"/><circle cx="42" cy="42" r="6" fill="${INK}" stroke="none"/><circle cx="54" cy="54" r="6" fill="${INK}" stroke="none"/>
      ${thingG('edelstein', 76, 74, .22, '#ff6b8b')}${thingG('edelstein', 90, 90, .22, '#ff6b8b')}${thingG('edelstein', 104, 106, .22, '#ff6b8b')}`);
    case 'zahl-mehr': return box(`<path d="M6 70 H54 L48 104 H12Z" fill="#d9a35f"/><path d="M66 70 H114 L108 104 H72Z" fill="#d9a35f"/>
      ${thingG('apfel', 30, 58, .26)}${thingG('apfel', 78, 58, .26)}${thingG('apfel', 102, 58, .26)}${thingG('apfel', 90, 38, .26)}`);
    default: return box('<circle cx="60" cy="60" r="30" fill="#ffd23f"/>');
  }
}
