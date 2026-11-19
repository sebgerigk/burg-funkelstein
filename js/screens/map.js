// Die Karte des Königreichs: in der Mitte die eigene Burg, außen herum die vier Orte.
// Nichts ist gesperrt. Orte, die noch gebaut werden, tragen ein Gerüst.
import { register, go } from '../engine/router.js';
import { getState, settings } from '../engine/storage.js';
import { sfx } from '../engine/audio.js';
import { shake } from '../engine/util.js';
import { PLACES } from '../content/places.js';
import { T } from '../content/texts.js';
import { sky, hills, castle, writeTower, treasury, musicGarden, magicForest, scaffold, road, tuft, flower } from '../art/world.js';
import { figureSvg } from '../art/figure.js';
import { createFips } from '../art/fips.js';
import { openGate } from './gate.js';
import { ICON } from '../art/icons.js';

// Wo die Orte stehen (Zeichenfläche 1600 × 1000), wo ihr Eingang ist und wie man sie zeichnet.
const SPOTS = {
  castle: { at: [660, 368], scale: 0.7, art: () => castle(), door: { x: 800, y: 630 }, hit: [660, 300, 280, 330] },
  schreib: { at: [270, 590], scale: 1, art: writeTower, door: { x: 370, y: 610 }, hit: [270, 190, 220, 420] },
  zahl: { at: [1110, 600], scale: 1, art: treasury, door: { x: 1220, y: 620 }, hit: [1110, 280, 230, 330] },
  musik: { at: [390, 900], scale: 1, art: musicGarden, door: { x: 520, y: 920 }, hit: [380, 660, 280, 260] },
  wald: { at: [1060, 930], scale: 1, art: magicForest, door: { x: 1200, y: 950 }, hit: [1050, 640, 300, 300] },
};
let lastSpot = 'castle';
let greeted = false;

register('map', el => {
  const st = getState();
  const shown = settings().places;
  const ids = ['schreib', 'zahl', 'musik', 'wald'].filter(id => shown[id]);
  const spot = id => SPOTS[id];
  const fig = (x, y) => `translate(${x - 33}px, ${y - 108}px)`;

  el.innerHTML = `
    <svg class="map-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      ${sky()}${hills(640)}
      <rect x="0" y="640" width="1600" height="360" fill="#7fd36b"/>
      ${ids.map(id => road(SPOTS.castle.door, spot(id).door, id === 'schreib' ? -60 : id === 'zahl' ? 60 : 0)).join('')}
      ${tuft(200, 700)}${tuft(700, 740)}${tuft(960, 820)}${tuft(1460, 720)}${flower(640, 860)}${flower(990, 700, '#ffd23f')}${flower(1420, 860, '#b98cff')}
      ${['castle', ...ids].map(id => {
        const s = spot(id);
        const built = id === 'castle' || PLACES[id].built;
        return `<g class="map-place ${built ? '' : 'building'}" data-id="${id}">
          <rect class="hit" x="${s.hit[0]}" y="${s.hit[1]}" width="${s.hit[2]}" height="${s.hit[3]}" fill="transparent"/>
          <g transform="translate(${s.at[0]} ${s.at[1]}) scale(${s.scale})">${s.art()}${built ? '' : `<g transform="translate(${id === 'wald' ? 10 : 0} 0)">${scaffold()}</g>`}</g>
        </g>`;
      }).join('')}
      <g class="map-figure" style="transform:${fig(spot(lastSpot).door.x, spot(lastSpot).door.y + 40)}">
        <g class="fig-bob">${figureSvg(st.figure).replace('<svg ', '<svg width="66" height="110" ')}</g>
      </g>
    </svg>
    <button class="round-btn small parents" aria-label="Eltern">${ICON.gear}</button>`;

  const fips = createFips({ autoHide: true });
  el.appendChild(fips.el);
  fips.say(greeted ? T.map_again : T.map);
  greeted = true;

  const figure = el.querySelector('.map-figure');
  let moving = false;
  el.querySelector('.map-svg').addEventListener('click', e => {
    const g = e.target.closest('.map-place');
    if (!g || moving) return;
    const id = g.dataset.id;
    if (id !== 'castle' && !PLACES[id].built) {
      sfx('hammer');
      shake(g);
      fips.say(T.baustelle);
      return;
    }
    // Die Figur läuft hin, dann geht es los.
    moving = true;
    sfx('whoosh');
    const d = spot(id).door;
    figure.style.transform = fig(d.x, d.y + 40);
    lastSpot = id;
    fips.say(id === 'castle' ? T.castle_go : PLACES[id].say);
    setTimeout(() => go(id === 'castle' ? 'castle' : 'place', id === 'castle' ? { from: { name: 'map' } } : { place: id }), 950);
  });
  el.querySelector('.parents').addEventListener('click', () => { sfx('tap'); openGate(() => go('eltern')); });
});
