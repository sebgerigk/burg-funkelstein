// Eine Runde an einer Station: fünf Aufgaben, dann die Schatztruhe.
// Keine Sterne, keine Bewertung. Fehler bekommen einen sanften Tipp; nach zwei Fehlversuchen
// leuchtet die richtige Antwort. Passiert eine Weile nichts, hilft Fips von selbst.
import { register, go } from '../engine/router.js';
import { getState, recordRound, roundsToday, ownGift, addGem } from '../engine/storage.js';
import { stepOf, adapt } from '../engine/level.js';
import { sfx, preload } from '../engine/audio.js';
import { h, pick, wait, withTimeout, shake, burst, confetti, replay } from '../engine/util.js';
import { PLACES } from '../content/places.js';
import { T, giftText } from '../content/texts.js';
import { offerGifts, firstGift, GEM } from '../content/castle.js';
import { zaehlen } from '../games/zaehlen.js';
import { spuren } from '../games/spuren.js';
import { wald } from '../games/wald.js';
import { createFips } from '../art/fips.js';
import { ponySvg, flagSvg, chestSvg } from '../art/things.js';
import { giftThumb, fitThumbs } from './castle.js';
import { ICON } from '../art/icons.js';

const GAMES = { zaehlen, spuren, wald };
const IDLE_MS = 10000;
const MAX_TODAY = 3;   // danach gibt es nur noch ein Geschenk („Probier doch mal was anderes!")

register('round', (el, { place, idx }) => {
  const pl = PLACES[place];
  const station = pl.stations[idx];
  const game = GAMES[station.game];
  const step = stepOf(station.id);
  const tasks = game.makeTasks(station.opts, step);
  preload(tasks.flatMap(t => game.texts(t)).concat(T.praise, T.retry, T.hint));

  let i = 0;
  let helps = 0;
  let alive = true;
  let idleTimer = 0;
  let idleStage = 0;
  let task = null;   // Zustand der aktuellen Aufgabe

  const flagColors = ['#e8504f', '#ffd23f', '#4aa3ff', '#5cc96b', '#b98cff'];
  el.innerHTML = `
    <div class="round-bg"></div>
    <header class="round-top">
      <button class="round-btn small back" aria-label="Zurück">${ICON.back}</button>
      <div class="trail">
        <div class="trail-road"></div>
        ${tasks.map((_, k) => `<span class="trail-flag" style="left:${(k + 1) * 100 / (tasks.length + 1)}%">${flagSvg(flagColors[k])}</span>`).join('')}
        <span class="trail-chest">${chestSvg()}</span>
        <span class="trail-pony" style="left:0%">${ponySvg()}</span>
      </div>
    </header>
    <main class="task-area"></main>`;

  const area = el.querySelector('.task-area');
  const pony = el.querySelector('.trail-pony');
  const flags = [...el.querySelectorAll('.trail-flag')];
  const fips = createFips();
  el.appendChild(fips.el);
  fips.onTap(() => { if (task) { fips.say(task.prompt); resetIdle(); } else fips.say(T.chest); });
  el.querySelector('.back').addEventListener('click', () => { sfx('tap'); go('place', { place }); });

  /* ---------- Hilfe, wenn nichts passiert ---------- */

  function resetIdle() {
    clearTimeout(idleTimer);
    if (!alive || !task || task.over) return;
    idleTimer = setTimeout(onIdle, IDLE_MS);
  }
  function onIdle() {
    if (!alive || !task || task.over) return;
    idleStage++;
    if (idleStage === 1) fips.say(task.prompt);
    else showAnswer();
    resetIdle();
  }
  function showAnswer() {
    if (!task || !task.answer) return;
    if (!task.helped) { task.helped = true; helps++; }
    task.answer.classList.add('glow');
    fips.say(T.hint);
  }
  area.addEventListener('pointerdown', () => { idleStage = Math.min(idleStage, 1); resetIdle(); }, true);

  // Wildes Tippen: drei Fehlversuche in kurzer Zeit -> kurz Ruhe.
  let recentWrong = [];

  function makeApi(ready) {
    return {
      fips, ready, step,
      alive: () => alive,
      say: text => fips.say(text),
      talk: text => fips.talk(text),
      setAnswer(node) { if (task) task.answer = node; },
      async correct({ target, say } = {}) {
        if (task) task.over = true;
        clearTimeout(idleTimer);
        sfx('correct');
        fips.cheer();
        if (target) burst(target);
        if (task && task.answer) task.answer.classList.remove('glow');
        await Promise.all([withTimeout(fips.say(say || pick(T.praise)), 5000), wait(900)]);
      },
      wrong({ target } = {}) {
        sfx('wrong');
        shake(target);
        if (target) target.classList.add('tried');
        if (!task) return;
        task.wrongs++;
        const now = Date.now();
        recentWrong = recentWrong.filter(t => now - t < 2500).concat(now);
        if (recentWrong.length >= 3) {
          recentWrong = [];
          area.classList.add('calm');
          setTimeout(() => area.classList.remove('calm'), 1200);
          fips.say(T.slow);
          return;
        }
        if (task.wrongs >= 2) showAnswer();
        else fips.say(pick(T.retry));
      },
      done() {
        if (!alive) return;
        if (task && task.wrongs >= 2 && !task.helped) { task.helped = true; helps++; }
        flags[i].classList.add('reached');
        i++;
        pony.style.left = (i * 100 / (tasks.length + 1)) + '%';
        sfx('hop');
        setTimeout(next, 350);
      },
    };
  }

  function next() {
    if (!alive) return;
    if (i >= tasks.length) return finish();
    area.innerHTML = '';
    const wrap = h('<div class="task"></div>');
    area.appendChild(wrap);
    const t = tasks[i];
    task = { prompt: game.prompt(t), wrongs: 0, helped: false, answer: null, over: false };
    idleStage = 0;
    const ready = fips.say(task.prompt);
    game.mount(wrap, t, makeApi(ready));
    resetIdle();
  }

  /* ---------- Schatztruhe ---------- */

  async function finish() {
    task = null;
    clearTimeout(idleTimer);
    adapt(station.id, { helps, tasks: tasks.length });
    const today = roundsToday(station.id);
    const first = recordRound(station.id, place);
    const state = getState();
    const special = first ? firstGift(place, state.owned) : null;
    const offer = special ? [special] : offerGifts(state.owned, today >= MAX_TODAY ? 1 : 3);
    pony.style.left = '100%';

    area.innerHTML = `<div class="chest-stage">
      <div class="big-chest">${chestSvg()}</div>
      <div class="gifts"></div>
      <div class="result-actions" hidden>
        <button class="round-btn big castle-go" aria-label="Zur Burg">${ICON.castle}</button>
        <button class="round-btn big again" aria-label="Noch mal">${ICON.again}</button>
        <button class="round-btn big green cont" aria-label="Weiter">${ICON.check}</button>
      </div>
    </div>`;
    const chest = area.querySelector('.big-chest');
    const giftsEl = area.querySelector('.gifts');
    const actions = area.querySelector('.result-actions');
    sfx('fanfare');
    confetti();
    fips.cheer();
    await wait(700);
    if (!alive) return;
    sfx('chest');
    chest.querySelector('.chest-svg').classList.add('open');
    await wait(450);
    if (!alive) return;
    giftsEl.innerHTML = offer.map((g, k) => `<button class="gift-card" data-k="${k}" style="--k:${k}">${g === GEM ? '' : giftThumb(g.id)}</button>`).join('');
    if (offer[0] === GEM) giftsEl.firstElementChild.innerHTML = giftThumb('edelstein');
    fitThumbs(giftsEl);
    fips.say(special ? T.chest_first : T.chest);

    let picked = null;
    giftsEl.addEventListener('click', async e => {
      const card = e.target.closest('.gift-card');
      if (!card || picked) return;
      picked = offer[Number(card.dataset.k)];
      sfx('sparkle');
      burst(card);
      giftsEl.querySelectorAll('.gift-card').forEach(c => { if (c !== card) c.classList.add('away'); });
      card.classList.add('chosen');
      if (picked === GEM) addGem(); else ownGift(picked.id);
      const said = [picked === GEM ? T.gem : giftText(picked)];
      if (!special && today >= MAX_TODAY) said.push(T.chest_one);
      await fips.say(said);
      if (!alive) return;
      actions.hidden = false;
      replay(actions, 'pop');
    });

    actions.querySelector('.castle-go').addEventListener('click', () => { sfx('pop'); go('castle', { from: { name: 'place', params: { place } }, highlight: picked && picked !== GEM ? picked.id : null }); });
    actions.querySelector('.again').addEventListener('click', () => { sfx('tap'); go('round', { place, idx }); });
    actions.querySelector('.cont').addEventListener('click', () => { sfx('tap'); go('place', { place }); });
  }

  next();
  return () => { alive = false; clearTimeout(idleTimer); };
});
