// Zauberwald: Farben sortieren, Was ist gleich?, Schatten, Memory, Was passt nicht?,
// Fahnen-Muster, Was kommt zuerst? – Denkspiele als Vorstufe zum Programmieren.
// Stufen 0, 1 = Klein (etwa 3 Jahre), 2, 3 = Groß (etwa 4 Jahre).
import { pick, shuffle, rnd, wait } from '../engine/util.js';
import { sfx } from '../engine/audio.js';
import { T } from '../content/texts.js';
import { leastSeenFirst, markSeen } from '../engine/storage.js';
import { thingSvg } from '../art/things.js';
import { COLORS, EMBLEMS, picSvg, shieldSvg, pennantSvg, cardBack, SEQUENCES, seqSvg } from '../art/wald.js';
import { fitThumbs } from '../screens/castle.js';
import { pickAndPlace } from './drag.js';

const ANIMALS = ['pony', 'hund', 'katze', 'huhn', 'ente', 'schwan', 'eule', 'igel', 'hase'];
const PLANTS = ['rose', 'tulpe', 'sonnenblume', 'apfelbaum', 'pilz', 'kuerbis'];
const OBJECTS = ['krone', 'edelstein', 'hufeisen', 'brunnen'];
const GROUPS = [ANIMALS, PLANTS, OBJECTS];
const ALL = GROUPS.flat();
const COLOR_IDS = ['rot', 'blau', 'gelb', 'gruen', 'lila'];

// Wie viele Aufgaben eine Runde hat (Memory und Sortieren dauern länger).
const COUNT = { farben: 4, schatten: 4, memory: 3 };

const take = (list, n, key) => shuffle(leastSeenFirst(list, x => key + x).slice(0, n));

/* ---------- Aufgaben ---------- */

function makeTasks({ kind }, step) {
  const n = COUNT[kind] || 5;
  // Bildfolgen: jede höchstens einmal pro Runde, selten Gesehenes zuerst.
  const order = leastSeenFirst(SEQUENCES, s => 'ablauf:' + s);
  return Array.from({ length: n }, (_, i) => MAKE[kind](step, i, order));
}

const MAKE = {
  // Edelsteine in Truhen der gleichen Farbe: Klein 2 Farben, Groß 3–4 Farben.
  farben(step) {
    const nColors = [2, 2, 3, 4][step];
    const nGems = [4, 5, 6, 8][step];
    const colors = shuffle(COLOR_IDS.slice(0, 4)).slice(0, nColors);
    const gems = shuffle(Array.from({ length: nGems }, (_, k) => colors[k % nColors]));
    return { kind: 'farben', colors, gems };
  },
  // Wappenschild: grob (Farbe) -> fein (Zeichen, Anzahl).
  paare(step) {
    const nChoices = step < 2 ? 2 : 3;
    const base = { color: COLORS[pick(['rot', 'blau', 'gruen', 'lila'])], emblem: pick(EMBLEMS), ecolor: '#fff', count: step === 3 ? rnd(1, 2) : 1, stripe: false };
    const key = s => JSON.stringify(s);
    const others = new Map();
    for (let guard = 0; others.size < nChoices - 1 && guard < 200; guard++) {
      const o = { ...base };
      if (step === 0) o.color = COLORS[pick(['rot', 'blau', 'gruen', 'lila', 'gelb'])];
      else if (step === 1) o.emblem = pick(EMBLEMS);
      else if (step === 2) { if (Math.random() < 0.5) o.color = COLORS[pick(['rot', 'blau', 'gruen', 'lila', 'gelb'])]; else o.emblem = pick(EMBLEMS); }
      else { if (Math.random() < 0.6) o.count = rnd(1, 3); else o.stripe = true; }
      if (key(o) !== key(base)) others.set(key(o), o);
    }
    const choices = shuffle([{ ...base, right: true }, ...others.values()]);
    return { kind: 'paare', target: base, choices };
  },
  // Schatten: Klein 2, Groß 3. Stufe 1 und 3: ähnliche Formen (aus derselben Gruppe).
  schatten(step) {
    const n = step < 2 ? 2 : 3;
    const similar = step === 1 || step === 3;
    const pool = similar ? pick(GROUPS.filter(g => g.length >= n)) : ALL;
    const ids = take(pool, n, 'schatten:');
    return { kind: 'schatten', ids, order: shuffle(ids) };
  },
  // Memory: 2 Paare (Klein) bis 4 Paare (Groß). Am Anfang sind die Karten kurz offen.
  memory(step) {
    const pairs = [2, 3, 3, 4][step];
    const ids = take(ALL, pairs, 'memory:');
    return { kind: 'memory', ids, cards: shuffle([...ids, ...ids]), preview: [2200, 1800, 1200, 0][step] };
  },
  // Was passt nicht? Stufe 0: zwei gleiche + ein ganz anderes; 1: zwei gleiche + ein ähnliches;
  // 2: drei gleiche + ein ähnliches; 3: drei verschiedene aus einer Gruppe + eins aus einer anderen.
  passt(step) {
    const group = pick(GROUPS);
    const other = pick(GROUPS.filter(g => g !== group));
    const [a, b] = shuffle(group);
    let pics, odd;
    if (step === 0) { odd = pick(other); pics = [a, a, odd]; }
    else if (step === 1) { odd = b; pics = [a, a, odd]; }
    else if (step === 2) { odd = b; pics = [a, a, a, odd]; }
    else { odd = pick(other); pics = [...shuffle(group).slice(0, 3), odd]; }
    return { kind: 'passt', pics: shuffle(pics.map(id => ({ id }))), odd };
  },
  // Fahnen-Muster: AB (Klein), AAB/ABB und ABC (Groß).
  muster(step) {
    const cols = shuffle(COLOR_IDS);
    const unit = [['A', 'B'], ['A', 'B'], pick([['A', 'A', 'B'], ['A', 'B', 'B']]), ['A', 'B', 'C']][step].map(x => cols['ABC'.indexOf(x)]);
    const shown = [4, rnd(3, 5), 5, 5][step];
    const seq = Array.from({ length: shown + 1 }, (_, k) => unit[k % unit.length]);
    const answer = seq.pop();
    const options = shuffle([...new Set([...unit, ...(step >= 2 ? [cols[3]] : [])])]).slice(0, step < 2 ? 2 : 3);
    if (!options.includes(answer)) options[0] = answer;
    return { kind: 'muster', seq, answer, options: shuffle(options) };
  },
  // Was kommt zuerst? Klein: Anfang und Ende – was war zuerst? Groß: drei Bilder ordnen.
  ablauf(step, i, order) {
    const id = order[i % order.length];
    const frames = step < 2 ? (step === 0 ? [0, 2] : pick([[0, 2], [0, 1], [1, 2]])) : [0, 1, 2];
    return { kind: 'ablauf', id, frames, shuffled: shuffle(frames) };
  },
};

function prompt(t) {
  switch (t.kind) {
    case 'farben': return T.farben;
    case 'paare': return T.paare;
    case 'schatten': return T.schatten;
    case 'memory': return T.memory;
    case 'passt': return T.passt;
    case 'muster': return T.muster;
    case 'ablauf': return t.frames.length === 2 ? T.ablauf2 : T.ablauf3;
    default: return '';
  }
}

/* ---------- Farben sortieren ---------- */

function mountFarben(root, t, api) {
  root.innerHTML = `<div class="sort-wrap">
    <div class="gem-row">${t.gems.map((c, k) => `<button class="gem" data-c="${c}" data-k="${k}">${thingSvg('edelstein', COLORS[c])}</button>`).join('')}</div>
    <div class="chest-row">${t.colors.map(c => `<button class="color-chest" data-c="${c}" style="--c:${COLORS[c]}">
      <span class="chest-inside"></span><span class="chest-front">${thingSvg('edelstein', COLORS[c])}</span></button>`).join('')}</div>
  </div>`;
  let left = t.gems.length;
  const nextGem = () => root.querySelector('.gem:not(.placed)');
  api.setAnswer(nextGem());
  pickAndPlace(root, {
    items: '.gem:not(.placed)', targets: '.color-chest',
    tryPlace(gem, chest) {
      if (gem.dataset.c !== chest.dataset.c) { api.wrong({ target: chest }); api.setAnswer(root.querySelector(`.color-chest[data-c="${gem.dataset.c}"]`)); return false; }
      gem.classList.add('placed');
      chest.querySelector('.chest-inside').insertAdjacentHTML('beforeend', thingSvg('edelstein', COLORS[gem.dataset.c]));
      root.querySelectorAll('.glow').forEach(g => g.classList.remove('glow'));
      sfx('place');
      api.talk(T.farbe[gem.dataset.c]);
      if (--left === 0) api.correct({ target: root.querySelector('.chest-row') }).then(() => api.done());
      else api.setAnswer(nextGem());
      return true;
    },
  });
}

/* ---------- Was ist gleich? ---------- */

function mountPaare(root, t, api) {
  root.innerHTML = `<div class="same-wrap">
    <div class="target-shield">${shieldSvg(t.target)}</div>
    <div class="choices">${t.choices.map((c, k) => `<button class="choice card shield-card" data-k="${k}">${shieldSvg(c)}</button>`).join('')}</div>
  </div>`;
  const right = t.choices.findIndex(c => c.right);
  api.setAnswer(root.querySelector(`.choice[data-k="${right}"]`));
  choose(root, '.choice', c => Number(c.dataset.k) === right, api);
}

/** Antippen einer Auswahl: richtig -> Lob und weiter, falsch -> sanfter Tipp. */
function choose(root, sel, isRight, api, { say, before } = {}) {
  root.addEventListener('click', async e => {
    const c = e.target.closest(sel);
    if (!c || root.classList.contains('solved')) return;
    if (isRight(c)) {
      root.classList.add('solved');
      if (before) await before(c);
      api.correct({ target: c, say }).then(() => api.done());
    } else api.wrong({ target: c });
  });
}

/* ---------- Schatten-Rätsel ---------- */

function mountSchatten(root, t, api) {
  root.innerHTML = `<div class="shadow-wrap">
    <div class="pic-row">${t.ids.map(id => `<button class="pic-item" data-id="${id}">${picSvg(id)}</button>`).join('')}</div>
    <div class="pic-row">${t.order.map(id => `<button class="shadow-slot" data-id="${id}">${picSvg(id)}</button>`).join('')}</div>
  </div>`;
  fitThumbs(root);
  let left = t.ids.length;
  api.setAnswer(root.querySelector('.pic-item'));
  pickAndPlace(root, {
    items: '.pic-item:not(.placed)', targets: '.shadow-slot:not(.filled)',
    tryPlace(item, slot) {
      if (item.dataset.id !== slot.dataset.id) { api.wrong({ target: slot }); api.setAnswer(root.querySelector(`.shadow-slot[data-id="${item.dataset.id}"]`)); return false; }
      item.classList.add('placed');
      slot.classList.add('filled');
      root.querySelectorAll('.glow').forEach(g => g.classList.remove('glow'));
      sfx('place');
      if (--left === 0) api.correct({ target: root.querySelector('.shadow-wrap') }).then(() => api.done());
      else api.setAnswer(root.querySelector('.pic-item:not(.placed)'));
      return true;
    },
  });
}

/* ---------- Memory ---------- */

function mountMemory(root, t, api) {
  const cols = t.cards.length <= 4 ? t.cards.length : t.cards.length / 2;
  root.innerHTML = `<div class="memory" style="--cols:${cols}">${t.cards.map((id, k) => `<button class="mem-card" data-id="${id}" data-k="${k}">
    <span class="mem-back">${cardBack()}</span><span class="mem-front">${picSvg(id)}</span></button>`).join('')}</div>`;
  fitThumbs(root);
  const cards = [...root.querySelectorAll('.mem-card')];
  let open = [], busy = true, found = 0, tries = 0;
  (async () => {
    if (t.preview) {
      cards.forEach(c => c.classList.add('up'));
      await api.ready;
      api.say(T.memory_look);
      await wait(t.preview);
      if (!api.alive()) return;
      cards.forEach(c => c.classList.remove('up'));
    }
    busy = false;
  })();
  root.addEventListener('click', async e => {
    const c = e.target.closest('.mem-card');
    if (!c || busy || c.classList.contains('up')) return;
    sfx('tap');
    c.classList.add('up');
    open.push(c);
    if (open.length < 2) return;
    const [a, b] = open;
    open = [];
    tries++;
    if (a.dataset.id === b.dataset.id) {
      a.classList.add('matched'); b.classList.add('matched');
      sfx('sparkle');
      found++;
      if (found === t.ids.length) {
        markSeen('memory:' + t.ids.join());
        api.correct({ target: root.querySelector('.memory') }).then(() => api.done());
      }
      return;
    }
    // Kein Paar: kurz offen lassen, dann wieder umdrehen. Kein „falsch" – das gehört zum Spiel.
    busy = true;
    await wait(1100);
    a.classList.remove('up'); b.classList.remove('up');
    busy = false;
    // Viele Versuche: ein passendes Paar leuchtet als Hilfe.
    if (tries >= t.ids.length * 3) {
      const rest = cards.filter(x => !x.classList.contains('matched'));
      const id = rest[0] && rest[0].dataset.id;
      api.setAnswer(rest[0]);
      if (id && tries === t.ids.length * 3) rest.filter(x => x.dataset.id === id).forEach(x => x.classList.add('glow'));
    }
  });
}

/* ---------- Was passt nicht? ---------- */

function mountPasst(root, t, api) {
  root.innerHTML = `<div class="odd-wrap choices">${t.pics.map((p, k) => `<button class="choice card pic-card" data-k="${k}">${picSvg(p.id)}</button>`).join('')}</div>`;
  fitThumbs(root);
  const right = t.pics.findIndex(p => p.id === t.odd);
  api.setAnswer(root.querySelector(`.choice[data-k="${right}"]`));
  choose(root, '.choice', c => t.pics[Number(c.dataset.k)].id === t.odd, api);
}

/* ---------- Fahnen-Muster ---------- */

function mountMuster(root, t, api) {
  root.innerHTML = `<div class="pattern-wrap">
    <div class="garland"><span class="garland-rope"></span>${t.seq.map(c => `<span class="flag-slot">${pennantSvg(c)}</span>`).join('')}<span class="flag-slot empty">?</span></div>
    <div class="choices">${t.options.map(c => `<button class="choice card flag-choice" data-c="${c}">${pennantSvg(c)}</button>`).join('')}</div>
  </div>`;
  api.setAnswer(root.querySelector(`.choice[data-c="${t.answer}"]`));
  choose(root, '.choice', c => c.dataset.c === t.answer, api, {
    async before() {
      const slot = root.querySelector('.flag-slot.empty');
      slot.classList.remove('empty');
      slot.innerHTML = pennantSvg(t.answer);
      slot.classList.add('pop');
      sfx('place');
    },
  });
}

/* ---------- Was kommt zuerst? ---------- */

function mountAblauf(root, t, api) {
  root.innerHTML = `<div class="seq-wrap">
    <div class="seq-slots">${t.frames.map((_, k) => `<span class="seq-slot" data-k="${k}"><b>${k + 1}</b></span>`).join('<i class="seq-arrow"></i>')}</div>
    <div class="choices">${t.shuffled.map(f => `<button class="choice card seq-card" data-f="${f}">${seqSvg(t.id, f)}</button>`).join('')}</div>
  </div>`;
  const slots = [...root.querySelectorAll('.seq-slot')];
  let placed = 0;
  const nextFrame = () => t.frames[placed];
  api.setAnswer(root.querySelector(`.seq-card[data-f="${nextFrame()}"]`));
  root.querySelector('.choices').addEventListener('click', async e => {
    const c = e.target.closest('.seq-card');
    if (!c || c.classList.contains('placed') || root.classList.contains('solved')) return;
    if (Number(c.dataset.f) !== nextFrame()) { api.wrong({ target: c }); return; }
    root.querySelectorAll('.glow').forEach(g => g.classList.remove('glow'));
    c.classList.add('placed');
    slots[placed].innerHTML = seqSvg(t.id, nextFrame());
    slots[placed].classList.add('filled');
    placed++;
    sfx('place');
    // Bei zwei Bildern ergibt sich das zweite von selbst.
    if (placed === t.frames.length - 1) {
      const last = root.querySelector('.seq-card:not(.placed)');
      await wait(450);
      last.classList.add('placed');
      slots[placed].innerHTML = seqSvg(t.id, nextFrame());
      slots[placed].classList.add('filled');
      placed++;
    }
    if (placed === t.frames.length) {
      root.classList.add('solved');
      markSeen('ablauf:' + t.id);
      api.correct({ target: root.querySelector('.seq-slots') }).then(() => api.done());
    } else api.setAnswer(root.querySelector(`.seq-card[data-f="${nextFrame()}"]`));
  });
}

const MOUNT = { farben: mountFarben, paare: mountPaare, schatten: mountSchatten, memory: mountMemory, passt: mountPasst, muster: mountMuster, ablauf: mountAblauf };

export const wald = {
  makeTasks,
  prompt,
  mount: (root, t, api) => MOUNT[t.kind](root, t, api),
  texts: t => [prompt(t), T.memory_look, ...Object.values(T.farbe)],
};
