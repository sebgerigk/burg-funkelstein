// Ein Ort mit seinen Stationen als großen Bildern entlang eines Weges.
// Alle Stationen sind offen; eine leuchtende Fußspur führt zur vorgeschlagenen.
import { register, go } from '../engine/router.js';
import { getState } from '../engine/storage.js';
import { stationVisible } from '../engine/level.js';
import { sfx } from '../engine/audio.js';
import { PLACES } from '../content/places.js';
import { T } from '../content/texts.js';
import { sky, hills, writeTower, treasury } from '../art/world.js';
import { stationIcon, flagSvg } from '../art/things.js';
import { createFips } from '../art/fips.js';
import { ICON } from '../art/icons.js';

const BUILDING = { schreib: writeTower, zahl: treasury };
const welcomed = new Set();

register('place', (el, { place }) => {
  const pl = PLACES[place];
  const st = getState();
  const list = pl.stations.map((s, idx) => ({ ...s, idx })).filter(stationVisible);
  const n = list.length;
  // Stationen im Zickzack über die Wiese (Prozent der Bildschirmbreite/-höhe).
  const x0 = n <= 3 ? 38 : 32, x1 = 84;
  const pos = list.map((s, k) => ({ x: n === 1 ? 60 : x0 + (k * (x1 - x0)) / (n - 1), y: k % 2 ? 72 : 50 }));
  const played = s => (st.played[s.id] || 0) > 0;
  // Vorschlag: die erste noch nicht gespielte Station, sonst die am seltensten gespielte.
  let next = list.findIndex(s => !played(s));
  if (next < 0) next = list.reduce((best, s, k) => ((st.played[s.id] || 0) < (st.played[list[best].id] || 0) ? k : best), 0);

  // Fußspur vom linken Rand zur vorgeschlagenen Station.
  const target = pos[next];
  const steps = [];
  const start = { x: 22, y: 92 };
  const count = 6;
  for (let k = 1; k <= count; k++) {
    const t = k / (count + 1);
    steps.push({ x: start.x + (target.x - start.x) * t, y: start.y + (target.y + 8 - start.y) * t, k });
  }

  el.innerHTML = `
    <svg class="scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      ${sky()}${hills(520)}<rect x="0" y="520" width="1600" height="480" fill="#7fd36b"/>
      <g transform="translate(150 ${place === 'schreib' ? 540 : 520}) scale(${place === 'schreib' ? 0.95 : 1.1})">${BUILDING[place] ? BUILDING[place]() : ''}</g>
    </svg>
    <div class="steps">${steps.map(s => `<i style="left:${s.x}%;top:${s.y}%;--k:${s.k}"></i>`).join('')}</div>
    <header class="hud">
      <button class="round-btn back" aria-label="Zurück zur Karte">${ICON.back}</button>
      <div class="plank">${pl.name}</div>
      <span></span>
    </header>
    ${list.map((s, k) => `<button class="station ${k === next ? 'next' : ''}" data-k="${k}" style="left:${pos[k].x}%;top:${pos[k].y}%" aria-label="${s.title}">
      ${stationIcon(s.id)}${played(s) ? `<span class="st-flag">${flagSvg('#ffd23f')}</span>` : ''}
    </button>`).join('')}`;

  const fips = createFips({ autoHide: true });
  el.appendChild(fips.el);
  if (!welcomed.has(place)) { welcomed.add(place); fips.say(pl.welcome); } else fips.say(T.place_again);

  el.querySelector('.back').addEventListener('click', () => { sfx('tap'); go('map'); });
  el.querySelectorAll('.station').forEach(b => b.addEventListener('click', () => {
    sfx('pop');
    go('round', { place, idx: list[Number(b.dataset.k)].idx });
  }));
});
