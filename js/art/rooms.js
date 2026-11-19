// Hintergründe der Runden: ein eigener Raum je Ort. Zeichenfläche 1600 × 1000 (wird beschnitten).
// Der Schmuck bleibt am Rand und in sanften Farben, damit die Aufgabe in der Mitte nicht untergeht.
import { INK } from '../engine/util.js';
import { thingG } from './things.js';
import { fir, sparkle } from './world.js';

const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

const torch = x => `<g ${S}>
  <path d="M${x - 14} 330 H${x + 14} L${x + 8} 380 H${x - 8}Z" fill="#8a5530"/>
  <g class="flame"><path d="M${x} 270 Q${x + 26} 302 ${x + 12} 326 Q${x} 336 ${x - 12} 326 Q${x - 26} 302 ${x} 270Z" fill="#ffb02e"/>
  <path d="M${x} 296 Q${x + 12} 312 ${x + 5} 324 Q${x} 328 ${x - 5} 324 Q${x - 12} 312 ${x} 296Z" fill="#fff1a8" stroke="none"/></g></g>`;
// Wimpel an einer Stange, unterhalb der Fortschrittsleiste
const banner = (x, c) => `<g ${S}><path d="M${x - 62} 150 H${x + 62}" stroke="#8a5530" stroke-width="12"/>
  <path d="M${x - 46} 156 V330 L${x} 300 L${x + 46} 330 V156Z" fill="${c}"/>
  <path d="M${x - 46} 180 H${x + 46}" stroke="#ffd23f" stroke-width="8"/>${thingG('krone', x, 244, .5)}</g>`;
const coinPile = (x, y, n = 9) => {
  let s = '';
  for (let k = 0; k < n; k++) {
    const row = Math.floor((Math.sqrt(8 * k + 1) - 1) / 2), col = k - row * (row + 1) / 2;
    s += `<ellipse cx="${x - row * 22 + col * 44}" cy="${y - (3 - row) * 20}" rx="22" ry="10" fill="#ffd23f"/>`;
  }
  return `<g ${S} stroke-width="4">${s}</g>`;
};

/** Schatzkammer: Gewölbe aus warmem Stein, Fackeln, Wimpel, Goldhaufen. */
function zahl() {
  let stones = '';
  for (let r = 0; r < 10; r++) for (let c = 0; c < 12; c++) {
    const x = c * 140 + (r % 2 ? 70 : 0) - 40, y = r * 76;
    stones += `<rect x="${x}" y="${y}" width="134" height="70" rx="12" fill="${(r + c) % 3 ? '#efdcb8' : '#e8d2aa'}"/>`;
  }
  return `<rect width="1600" height="1000" fill="#d9c196"/>
    <g opacity=".9">${stones}</g>
    <g ${S}>
      <path d="M520 760 V420 Q800 180 1080 420 V760" fill="#cdb284" opacity=".55" stroke="none"/>
      <path d="M520 760 V420 Q800 180 1080 420 V760" fill="none" stroke="#c4a571" stroke-width="10"/>
    </g>
    ${banner(330, '#9067e0')}${banner(1270, '#e8504f')}
    ${torch(150)}${torch(1450)}
    <rect y="760" width="1600" height="240" fill="#b98a55"/>
    <g stroke="#9c7040" stroke-width="5">${[800, 860, 920, 980].map(y => `<path d="M0 ${y} H1600"/>`).join('')}</g>
    <path d="M0 760 H1600" stroke="${INK}" stroke-width="5"/>
    ${coinPile(1430, 900, 10)}${coinPile(250, 920, 6)}
    ${thingG('edelstein', 1530, 840, .5, '#ff6b8b')}${thingG('edelstein', 1340, 940, .4, '#4aa3ff')}`;
}

/** Schreibturm: Turmzimmer mit rundem Fenster, Bücherregal und Kerze. */
function schreib() {
  const books = [['#e8504f', 46], ['#4aa3ff', 34], ['#ffd23f', 40], ['#5cc96b', 30], ['#b98cff', 44], ['#ff9f43', 36]];
  let x = 40;
  const shelf = y => books.map(([c, w], k) => { const b = `<rect x="${x}" y="${y - 110 + (k % 3) * 10}" width="${w}" height="${110 - (k % 3) * 10}" rx="4" fill="${c}"/>`; x += w + 6; return b; }).join('');
  const s1 = shelf(380); x = 40; const s2 = shelf(560);
  return `<rect width="1600" height="1000" fill="#e6dbf5"/>
    <g opacity=".5" stroke="#d2c2ec" stroke-width="5">${[120, 320, 520, 720].map(y => `<path d="M0 ${y} H1600"/>`).join('')}
      ${[200, 600, 1000, 1400].map(x => `<path d="M${x} 0 V760"/>`).join('')}</g>
    <g ${S}>
      <circle cx="1340" cy="230" r="130" fill="#bfe8ff"/>
      <path d="M1240 270 Q1260 236 1300 244 Q1316 214 1352 226 Q1388 222 1392 254 Q1420 258 1416 280 H1244Z" fill="#fff" stroke-width="4"/>
      <path d="M1340 100 V360 M1210 230 H1470" stroke="#8a5530" stroke-width="12"/>
      <circle cx="1340" cy="230" r="130" fill="none" stroke="#8a5530" stroke-width="16"/>
      <circle cx="1340" cy="230" r="138" fill="none"/>
    </g>
    <g ${S}>
      <rect x="24" y="250" width="320" height="380" rx="8" fill="#a8683a"/>
      <rect x="36" y="262" width="296" height="356" fill="#7a4a28" stroke="none"/>
      ${s1}${s2}
      <path d="M24 380 H344 M24 560 H344" stroke-width="10"/>
    </g>
    <rect y="760" width="1600" height="240" fill="#b98cff" opacity=".35"/>
    <path d="M0 760 H1600" stroke="${INK}" stroke-width="5"/>
    <g ${S}>
      <rect x="1440" y="690" width="40" height="70" rx="6" fill="#fff4dc"/>
      <g class="flame"><path d="M1460 640 Q1478 664 1468 684 Q1460 692 1452 684 Q1442 664 1460 640Z" fill="#ffb02e"/></g>
      <ellipse cx="1460" cy="760" rx="60" ry="12" fill="#ffd23f"/>
    </g>`;
}

/** Zauberwald: Lichtung mit Stämmen, Pilzen, Glühwürmchen und Lichtstrahlen. */
function wald() {
  const trunk = (x, w, c = '#8a5a3a') => `<rect x="${x}" y="-20" width="${w}" height="800" fill="${c}"/>`;
  const shroom = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" ${S}><path d="M-12 0 V-30 Q0 -36 12 -30 V0Z" fill="#fff4dc"/>
    <path d="M-40 -30 Q-40 -76 0 -76 Q40 -76 40 -30Z" fill="${c}"/><circle cx="-16" cy="-52" r="6" fill="#fff" stroke-width="2.5"/><circle cx="14" cy="-60" r="7" fill="#fff" stroke-width="2.5"/></g>`;
  const flies = [[420, 300], [1180, 220], [1350, 520], [300, 600], [960, 140], [700, 120], [1500, 360]]
    .map(([x, y], k) => `<circle class="firefly" style="animation-delay:${(k * .37).toFixed(2)}s" cx="${x}" cy="${y}" r="7" fill="#fff6a8"/>`).join('');
  return `<defs><linearGradient id="woodsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9d8"/><stop offset="1" stop-color="#e6f7e9"/></linearGradient></defs>
    <rect width="1600" height="1000" fill="url(#woodsky)"/>
    <g opacity=".45" stroke="none">${trunk(80, 60, '#a7c9a0')}${trunk(560, 40, '#a7c9a0')}${trunk(1060, 50, '#a7c9a0')}${trunk(1380, 70, '#a7c9a0')}</g>
    <g opacity=".35" fill="#fff9c8">
      <path d="M700 0 L820 0 L1100 760 L860 760Z"/><path d="M1000 0 L1060 0 L1300 760 L1190 760Z"/></g>
    <g ${S}>${trunk(-20, 120)}${trunk(1500, 130)}
      ${[[30, 70, 110], [160, 40, 90], [290, 10, 80], [80, 200, 80]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#49a845"/>`).join('')}
      ${[[1570, 70, 110], [1440, 40, 90], [1310, 10, 80], [1520, 210, 80]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#49a845"/>`).join('')}
      ${[[120, 60, 34], [1480, 60, 34], [250, 30, 26], [1350, 30, 26]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#6fca5f" stroke="none"/>`).join('')}</g>
    <g ${S}>${fir(330, .9, '#5cbf54', '#49a845').replace('<g transform="translate(330 0)', '<g transform="translate(330 770)')}${fir(1270, .8, '#5cbf54', '#49a845').replace('<g transform="translate(1270 0)', '<g transform="translate(1270 770)')}</g>
    <path d="M0 770 Q400 730 800 760 Q1200 790 1600 750 V1000 H0Z" fill="#7fd36b" stroke="${INK}" stroke-width="5"/>
    ${shroom(1420, 900, 1.3, '#e8504f')}${shroom(1510, 880, .9, '#b98cff')}${shroom(260, 930, 1, '#ff9f43')}
    <g ${S}>${sparkle(1450, 640, 16)}${sparkle(180, 480, 12)}</g>
    <g>${flies}</g>`;
}

const ROOMS = { zahl, schreib, wald };

export function roomSvg(place) {
  return `<svg class="scene room" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${(ROOMS[place] || zahl)()}</svg>`;
}
