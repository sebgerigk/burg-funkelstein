// Beim ersten Start: Fips stellt sich vor, das Kind wählt seine Figur, dann die kleine Geschichte.
// Auch aus dem Elternbereich erreichbar („Figur neu wählen").
import { register, go } from '../engine/router.js';
import { sfx, preload } from '../engine/audio.js';
import { getState, setFigure, setIntroSeen } from '../engine/storage.js';
import { replay, wait } from '../engine/util.js';
import { T, FIGURES } from '../content/texts.js';
import { figureSvg, FIGURE_IDS } from '../art/figure.js';
import { createFips } from '../art/fips.js';
import { ICON } from '../art/icons.js';

register('figur', el => {
  let alive = true;
  el.innerHTML = `<div class="meadow"></div>
    <div class="figures">${FIGURE_IDS.map(id => `<button class="figure-pick" data-id="${id}" aria-label="${FIGURES[id].name}">${figureSvg(id)}</button>`).join('')}</div>
    <button class="btn gold big go-on" hidden aria-label="Weiter">${ICON.play}</button>`;
  const fips = createFips();
  fips.el.classList.add('big');
  el.appendChild(fips.el);
  const goOn = el.querySelector('.go-on');
  preload([T.intro, ...Object.values(FIGURES).map(f => f.you), T.story, T.map]);
  fips.say(T.intro);

  let chosen = null;
  el.querySelector('.figures').addEventListener('click', async e => {
    const b = e.target.closest('.figure-pick');
    if (!b) return;
    chosen = b.dataset.id;
    sfx('hop');
    el.querySelectorAll('.figure-pick').forEach(x => x.classList.toggle('chosen', x === b));
    replay(b, 'anim-hop');
    setFigure(chosen);
    goOn.hidden = false;
    await fips.say(FIGURES[chosen].you);
    if (!alive || getState().introSeen) return;
    // Die Geschichte nur beim allerersten Mal.
    await wait(300);
    if (!alive || getState().figure !== chosen) return;
    await fips.say(T.story);
    if (alive && getState().figure === chosen) { setIntroSeen(); go('map'); }
  });
  goOn.addEventListener('click', () => { sfx('tap'); setIntroSeen(); go('map'); });
  return () => { alive = false; };
});
