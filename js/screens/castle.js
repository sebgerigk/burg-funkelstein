// Die eigene Burg: hier stehen alle Geschenke. Antippen lässt sie sich bewegen und klingen.
import { register, go } from '../engine/router.js';
import { getState } from '../engine/storage.js';
import { sfx, preload } from '../engine/audio.js';
import { replay } from '../engine/util.js';
import { GIFTS, giftById } from '../content/castle.js';
import { T, FIGURES, giftName, gemsText } from '../content/texts.js';
import { castleScene, giftArt } from '../art/castle.js';
import { createFips } from '../art/fips.js';
import { ICON } from '../art/icons.js';

const S = 'stroke="#3d2b4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';

/** Vorschaubild eines Geschenks. Der Bildausschnitt wird nach dem Einfügen mit fitThumbs() gesetzt. */
export const giftThumb = id => `<svg class="gift-thumb" viewBox="0 0 100 100" aria-hidden="true"><g ${S}>${giftArt(id)}</g></svg>`;

/** Setzt bei allen Vorschaubildern den Ausschnitt so, dass das Geschenk ganz zu sehen ist. */
export function fitThumbs(root) {
  root.querySelectorAll('.gift-thumb').forEach(svg => {
    try {
      const b = svg.firstElementChild.getBBox();
      const pad = Math.max(b.width, b.height) * 0.12 + 6;
      const size = Math.max(b.width, b.height) + pad * 2;
      svg.setAttribute('viewBox', `${b.x + b.width / 2 - size / 2} ${b.y + b.height / 2 - size / 2} ${size} ${size}`);
    } catch { /* unsichtbar – bleibt beim Standard */ }
  });
}

register('castle', (el, { from = { name: 'map' }, highlight = null } = {}) => {
  const st = getState();
  const count = Object.keys(st.owned).length;
  el.innerHTML = `<div class="castle-view">${castleScene({ owned: st.owned, gems: st.gems, figure: st.figure, highlight, order: GIFTS.map(g => g.id) })}</div>
    <header class="hud"><button class="round-btn back" aria-label="Zurück">${ICON.back}</button><div class="plank">Deine Burg</div><span></span></header>`;
  preload([T.castle, T.castle_empty, ...GIFTS.filter(g => st.owned[g.id]).map(giftName)]);
  const fips = createFips({ autoHide: true });
  el.appendChild(fips.el);
  fips.say(count || st.gems ? T.castle : [T.castle, T.castle_empty]);

  el.querySelector('.back').addEventListener('click', () => { sfx('tap'); go(from.name, from.params); });
  el.querySelector('.castle-scene').addEventListener('click', e => {
    const g = e.target.closest('.gift');
    if (g) {
      const id = g.dataset.id;
      if (id === 'edelstein') { sfx('sparkle'); replay(g, 'anim-hop'); fips.say(gemsText(st.gems)); return; }
      const gift = giftById(id);
      sfx(gift.sound);
      replay(g, 'anim-' + gift.anim);
      fips.say(giftName(gift));
      return;
    }
    if (e.target.closest('.castle-figure')) {
      const fig = el.querySelector('.castle-figure');
      sfx('hop');
      replay(fig, 'anim-hop');
      fips.say((FIGURES[st.figure] || FIGURES.ritter).hi);
    }
  });
});
