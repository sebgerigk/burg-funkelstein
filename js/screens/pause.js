// Abschiedsbildschirm: Die Spielzeit für heute ist um. Fips geht schlafen – freundlich, ohne Vorwurf.
import { register, go } from '../engine/router.js';
import { sfx } from '../engine/audio.js';
import { T } from '../content/texts.js';
import { addBonus } from '../engine/playtime.js';
import { hills, castle } from '../art/world.js';
import { createFips } from '../art/fips.js';
import { ICON } from '../art/icons.js';
import { openGate } from './gate.js';

register('pause', el => {
  const stars = Array.from({ length: 26 }, () => `<circle cx="${Math.round(Math.random() * 1600)}" cy="${Math.round(Math.random() * 420)}" r="${(2 + Math.random() * 3).toFixed(1)}" fill="#fff6a8" class="twinkle" style="animation-delay:${(Math.random() * 3).toFixed(1)}s"/>`).join('');
  el.innerHTML = `
    <svg class="scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1600" height="1000" fill="#2b2459"/>${stars}
      <circle cx="1300" cy="150" r="70" fill="#fff6c8" stroke="#3d2b4a" stroke-width="5"/><circle cx="1330" cy="130" r="62" fill="#2b2459"/>
      <g opacity=".75">${hills(760)}</g>
      <g transform="translate(620 400) scale(.9)" opacity=".9">${castle()}</g>
      <rect x="0" y="0" width="1600" height="1000" fill="#2b2459" opacity=".35"/>
    </svg>
    <button class="round-btn small parents" aria-label="Eltern">${ICON.gear}</button>`;
  const fips = createFips();
  fips.el.classList.add('big');
  el.appendChild(fips.el);
  fips.say(T.pause).then(() => { fips.sleep(); sfx('snore'); });

  // Eltern können für heute noch einmal 10 Minuten schenken.
  el.querySelector('.parents').addEventListener('click', () => openGate(() => { addBonus(10); go('map'); }));
});
