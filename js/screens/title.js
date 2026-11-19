// Startbildschirm. Der große Knopf schaltet auf iOS zugleich den Ton frei.
import { register, go } from '../engine/router.js';
import { unlockAudio, sfx } from '../engine/audio.js';
import { sky, hills, castle } from '../art/world.js';
import { fipsSvg } from '../art/fips.js';
import { ICON } from '../art/icons.js';
import { storageInfo, getState } from '../engine/storage.js';

const letters = word => [...word].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');

register('title', el => {
  const info = storageInfo();
  el.innerHTML = `
    <svg class="scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      ${sky()}${hills(760)}
      <path d="M380 760 Q800 520 1220 760Z" fill="#6fca5f" stroke="#3d2b4a" stroke-width="5"/>
      <g transform="translate(620 400) scale(.9)">${castle()}</g>
    </svg>
    <h1 class="logo" aria-label="Burg Funkelstein"><span class="logo-row small">${letters('Burg')}</span><span class="logo-row">${letters('Funkelstein')}</span></h1>
    <div class="title-fips">${fipsSvg()}</div>
    <button class="btn gold big start" aria-label="Los geht's">${ICON.play}</button>
    ${info.any ? '' : '<p class="storage-warning">Achtung: Auf diesem Gerät kann der Spielstand nicht gespeichert werden. In den Safari-Einstellungen „Alle Cookies blockieren" ausschalten und nicht im privaten Modus öffnen.</p>'}`;

  el.querySelector('.start').addEventListener('click', () => {
    unlockAudio();
    sfx('fanfare');
    const st = getState();
    go(st.figure && st.introSeen ? 'map' : 'figur');
  });
});
