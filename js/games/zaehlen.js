// Schatzkammer: Zählen, Einpacken, Auf einen Blick, Wo sind mehr?
// Mengen über fünf werden immer auch in der Zehner-Schatulle (2 × 5) gezeigt.
import { pick, rnd, shuffle, scatter, wait } from '../engine/util.js';
import { sfx } from '../engine/audio.js';
import { T, NUM } from '../content/texts.js';
import { thingSvg, dieSvg, basketSvg, PIPS, GEM_COLORS } from '../art/things.js';
import { leastSeenFirst, markSeen } from '../engine/storage.js';

const KINDS = ['edelstein', 'apfel', 'krone', 'hufeisen'];
const TASKS = 5;

// Zahlenräume je Stufe (0, 1 = Klein; 2, 3 = Groß)
const RANGE = {
  zaehlen: [[2, 4], [3, 5], [4, 8], [6, 10]],
  einpacken: [[2, 3], [3, 5], [4, 7], [6, 10]],
  blick: [[1, 3], [1, 4], [1, 6], [2, 6]],
  mehr: [[1, 5], [1, 5], [1, 10], [1, 10]],
};
const CHOICES = [2, 2, 3, 3];

/** Verschiedene Zahlen aus einem Bereich, selten Geübtes zuerst; bei kleinem Bereich auch doppelt. */
function numbers(kind, [lo, hi], count) {
  const all = [];
  for (let n = lo; n <= hi; n++) all.push(n);
  let out = leastSeenFirst(all, n => `${kind}:${n}`);
  while (out.length < count) out = out.concat(shuffle(all));
  return out.slice(0, count);
}

/**
 * Falsche Auswahl-Zahlen: nicht zu nah (Klein: Abstand 2), nicht kleiner als 1, nicht größer als max.
 * Reicht das nicht (z. B. 2 bei Würfeln bis 3), wird der Bereich etwas erweitert. Die nächstgelegenen
 * Zahlen kommen zuerst dran, damit die Auswahl nicht zu leicht ist.
 */
function distractors(n, count, gap, max) {
  const pick = (g, m) => {
    const out = [];
    for (let d = g; d <= g + 4; d++) shuffle([n - d, n + d]).forEach(v => { if (v >= 1 && v <= m) out.push(v); });
    return out;
  };
  let pool = pick(gap, max);
  if (pool.length < count) pool = [...new Set([...pool, ...pick(gap, Math.min(10, max + 3)), ...pick(1, Math.min(10, max + 3))])];
  return pool.slice(0, count);
}

function makeTasks({ kind }, step) {
  const range = RANGE[kind][step];
  const nums = numbers(kind, range, TASKS);
  const things = shuffle([...KINDS, ...KINDS]);
  return nums.map((n, i) => {
    const thing = kind === 'blick' ? 'edelstein' : kind === 'mehr' ? 'apfel' : things[i];
    const color = pick(GEM_COLORS);
    if (kind === 'zaehlen' || kind === 'blick') {
      const gap = step === 0 ? 2 : 1;
      // Höchstens 10: so viel passt in eine Schatulle (Zählen bis 20 kommt mit der Station „Der große Schatz").
      const max = kind === 'blick' ? range[1] : Math.min(10, range[1] + 2);
      const others = distractors(n, CHOICES[step] - 1, gap, max);
      return { kind, n, thing, color, options: shuffle([n, ...others]), scattered: kind === 'blick' && step === 3 };
    }
    if (kind === 'einpacken') return { kind, n, thing, color, slots: range[1] > 5 ? 10 : 5, pile: Math.min(range[1] > 5 ? 12 : 7, n + rnd(1, 3)) };
    // Wo sind mehr? Zwei Mengen mit Abstand (Klein mindestens 2). Auf Stufe 3 auch „gleich viele".
    const gap = step === 3 ? 1 : 2;
    const [lo, hi] = range;
    const small = Math.min(Math.max(lo, n - gap), hi - gap);
    const equal = step === 3 && i === 2;
    const big = equal ? small : rnd(small + gap, Math.min(hi, small + gap + 3));
    const [a, b] = Math.random() < 0.5 ? [small, big] : [big, small];
    const q = step === 0 ? 'mehr' : pick(['mehr', 'weniger']);
    return { kind, q, a, b, thing: 'apfel', equal, withEqual: step === 3 };
  });
}

function prompt(t) {
  switch (t.kind) {
    case 'zaehlen': return T.zaehlen;
    case 'einpacken': return T.einpacken(t.n, t.thing);
    case 'blick': return T.blick;
    case 'mehr': return t.withEqual ? (t.q === 'mehr' ? T.mehr_gleich : T.weniger) : T[t.q];
    default: return '';
  }
}

/* ---------- Bausteine ---------- */

/** Zehner-Schatulle (oder Fünfer) als HTML: Mulden, die gefüllt sein können. */
function frameHtml(slots, filled, thing, color) {
  const rows = slots > 5 ? 2 : 1;
  let cells = '';
  for (let i = 0; i < slots; i++) cells += `<span class="slot">${i < filled ? thingSvg(thing, color) : ''}</span>`;
  return `<span class="frame rows-${rows}">${cells}</span>`;
}

/** Ein Ding als Knopf an einer Stelle (Prozent). */
const itemHtml = (t, p, size, i) => `<button class="item" data-i="${i}" style="left:${p.x}%;top:${p.y}%;--size:${size}vmin">${thingSvg(t.thing, t.thing === 'edelstein' ? GEM_COLORS[i % GEM_COLORS.length] : t.color)}<b class="badge"></b></button>`;

/** Positionen für n Dinge in einem Feld (Prozent), ohne Überlappung. */
function positions(n, w, hgt, size) {
  return scatter(n, w, hgt, size * 1.25).map(p => ({ x: (p.x / w) * 100, y: (p.y / hgt) * 100 }));
}

/* ---------- Edelsteine zählen ---------- */

function mountZaehlen(root, t, api) {
  // Das Feld ist 78 vmin breit: 1 Einheit = 0,78 vmin.
  const size = t.n <= 5 ? 13 : 10.5;
  const pos = positions(t.n, 100, 58, size / 0.78 * 1.15);
  root.innerHTML = `<div class="count-wrap">
    <div class="field panel">${pos.map((p, i) => itemHtml(t, p, size, i)).join('')}</div>
    <div class="choices n${t.options.length}" hidden>${t.options.map(v => `<button class="choice card" data-v="${v}">${frameHtml(v > 5 ? 10 : 5, v, t.thing, t.color)}</button>`).join('')}</div>
  </div>`;
  const items = [...root.querySelectorAll('.item')];
  const choices = root.querySelector('.choices');
  let counted = 0;
  items.forEach(it => it.addEventListener('click', () => {
    if (it.classList.contains('counted')) { it.classList.add('again'); setTimeout(() => it.classList.remove('again'), 400); return; }
    counted++;
    it.classList.add('counted');
    it.querySelector('.badge').textContent = counted;
    sfx('count');
    api.talk(NUM[counted]);
    if (counted === t.n) ask();
  }));

  async function ask() {
    await wait(900);
    if (!api.alive()) return;
    choices.hidden = false;
    api.say(T.wieviele);
    const right = choices.querySelector(`[data-v="${t.n}"]`);
    api.setAnswer(right);
    choices.addEventListener('click', e => {
      const c = e.target.closest('.choice');
      if (!c || root.classList.contains('solved')) return;
      if (Number(c.dataset.v) === t.n) {
        root.classList.add('solved');
        markSeen(`zaehlen:${t.n}`);
        api.correct({ target: c, say: T.genau(t.n) }).then(() => api.done());
      } else api.wrong({ target: c });
    });
  }
}

/* ---------- In die Schatulle ---------- */

function mountEinpacken(root, t, api) {
  // Der Haufen ist 44 vmin breit und hoch: 1 Einheit = 0,44 vmin.
  const size = t.pile > 7 ? 8.5 : 10;
  const pos = positions(t.pile, 100, 100, size / 0.44 * 1.12);
  root.innerHTML = `<div class="pack-wrap">
    <div class="pile panel">${pos.map((p, i) => itemHtml(t, p, size, i)).join('')}</div>
    <div class="box"><div class="box-target">${t.n}</div>${frameHtml(t.slots, 0, t.thing, t.color)}</div>
  </div>`;
  const pile = root.querySelector('.pile');
  const box = root.querySelector('.box');
  const slots = [...root.querySelectorAll('.slot')];
  root.querySelector('.box-target').innerHTML = Array.from({ length: t.n }, () => '<i></i>').join('');
  let filled = 0;
  let finished = false;

  function put(it) {
    if (finished || it.classList.contains('placed')) return;
    const slot = slots[filled];
    filled++;
    it.classList.add('placed');
    const from = it.getBoundingClientRect();
    slot.innerHTML = thingSvg(t.thing, t.thing === 'edelstein' ? GEM_COLORS[Number(it.dataset.i) % GEM_COLORS.length] : t.color);
    const to = slot.getBoundingClientRect();
    // Fliegen lassen: das Ding im Fach startet dort, wo es angetippt wurde.
    const svg = slot.firstElementChild;
    svg.style.transform = `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px)`;
    svg.getBoundingClientRect();
    svg.style.transition = 'transform .35s cubic-bezier(.3,1.4,.6,1)';
    svg.style.transform = '';
    it.style.visibility = 'hidden';
    sfx('place');
    api.talk(NUM[filled]);
    if (filled === t.n) {
      finished = true;
      box.classList.add('full');
      markSeen(`einpacken:${t.n}`);
      setTimeout(() => api.correct({ target: box, say: T.eingepackt(t.n, t.thing) }).then(() => api.done()), 500);
    }
  }

  // Antippen legt ein Ding hinein; Ziehen geht auch.
  pile.addEventListener('pointerdown', e => {
    const it = e.target.closest('.item');
    if (!it || it.classList.contains('placed') || finished) return;
    const start = { x: e.clientX, y: e.clientY };
    let dragging = false;
    it.setPointerCapture(e.pointerId);
    const move = ev => {
      const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) > 12) { dragging = true; it.classList.add('dragging'); }
      if (dragging) it.style.translate = `${dx}px ${dy}px`;
    };
    const up = ev => {
      it.removeEventListener('pointermove', move);
      it.removeEventListener('pointerup', up);
      it.removeEventListener('pointercancel', up);
      it.classList.remove('dragging');
      if (!dragging) { it.style.translate = ''; put(it); return; }
      const r = box.getBoundingClientRect();
      const inBox = ev.clientX > r.left - 40 && ev.clientX < r.right + 40 && ev.clientY > r.top - 40 && ev.clientY < r.bottom + 40;
      if (inBox) { put(it); it.style.translate = ''; } else { it.classList.add('back'); it.style.translate = ''; setTimeout(() => it.classList.remove('back'), 300); }
    };
    it.addEventListener('pointermove', move);
    it.addEventListener('pointerup', up);
    it.addEventListener('pointercancel', up);
  });
  api.setAnswer(pile.querySelector('.item'));
}

/* ---------- Auf einen Blick ---------- */

function cardHtml(v, t) {
  // Wie ein Würfel angeordnet, auf Stufe 3 durcheinander.
  const pts = t.scattered ? positions(v, 100, 100, 26) : PIPS[v].map(([x, y]) => ({ x, y }));
  return `<span class="mini">${pts.map(p => `<span class="dot" style="left:${p.x}%;top:${p.y}%">${thingSvg('edelstein', t.color)}</span>`).join('')}</span>`;
}

function mountBlick(root, t, api) {
  root.innerHTML = `<div class="look-wrap">
    <div class="big-die">${dieSvg(t.n)}</div>
    <div class="choices">${t.options.map(v => `<button class="choice card square" data-v="${v}">${cardHtml(v, t)}</button>`).join('')}</div>
  </div>`;
  const choices = root.querySelector('.choices');
  api.setAnswer(choices.querySelector(`[data-v="${t.n}"]`));
  choices.addEventListener('click', e => {
    const c = e.target.closest('.choice');
    if (!c || root.classList.contains('solved')) return;
    if (Number(c.dataset.v) === t.n) {
      root.classList.add('solved');
      markSeen(`blick:${t.n}`);
      api.correct({ target: c, say: T.genau(t.n) }).then(() => api.done());
    } else api.wrong({ target: c });
  });
}

/* ---------- Wo sind mehr? ---------- */

function mountMehr(root, t, api) {
  const side = (n, key) => {
    // Eine Seite ist 36 vmin breit: 1 Einheit = 0,36 vmin.
    const size = n <= 5 ? 8.5 : 6.5;
    const pos = positions(n, 100, 70, size / 0.36 * 1.1);
    return `<button class="side" data-k="${key}">
      <span class="apples">${pos.map((p, i) => `<span class="apple" data-i="${i}" style="left:${p.x}%;top:${p.y}%;--size:${size}vmin">${thingSvg('apfel')}</span>`).join('')}</span>
      <span class="ordered" hidden>${frameHtml(n > 5 ? 10 : 5, n, 'apfel')}</span>
      ${basketSvg()}
    </button>`;
  };
  root.innerHTML = `<div class="more-wrap">${side(t.a, 'a')}${t.withEqual ? `<button class="side equal" data-k="eq"><span class="eq-sign"><i></i><i></i></span></button>` : ''}${side(t.b, 'b')}</div>`;
  const wrap = root.querySelector('.more-wrap');
  const want = t.equal ? 'eq' : (t.q === 'mehr') === (t.a > t.b) ? 'a' : 'b';
  api.setAnswer(wrap.querySelector(`[data-k="${want}"]`));
  let helped = false;
  wrap.addEventListener('click', e => {
    const c = e.target.closest('.side');
    if (!c || root.classList.contains('solved')) return;
    if (c.dataset.k === want) {
      root.classList.add('solved');
      markSeen(`mehr:${Math.max(t.a, t.b)}`);
      api.correct({ target: c, say: t.equal ? T.gleich : undefined }).then(() => api.done());
    } else {
      api.wrong({ target: c });
      // Hilfe: Die Äpfel ordnen sich in die Schatulle, dann sieht man, wo Plätze frei bleiben.
      if (!helped) {
        helped = true;
        setTimeout(() => {
          if (!api.alive()) return;
          wrap.querySelectorAll('.side:not(.equal)').forEach(s => { s.querySelector('.apples').hidden = true; s.querySelector('.ordered').hidden = false; });
          sfx('pop');
          api.say(T.ordnen);
        }, 900);
      }
    }
  });
}

export const zaehlen = {
  makeTasks,
  prompt,
  mount(root, t, api) {
    if (t.kind === 'zaehlen') return mountZaehlen(root, t, api);
    if (t.kind === 'einpacken') return mountEinpacken(root, t, api);
    if (t.kind === 'blick') return mountBlick(root, t, api);
    return mountMehr(root, t, api);
  },
  /** Alles, was in den Aufgaben gesprochen wird (zum Vorladen). */
  texts: t => [prompt(t), ...NUM.slice(1, 11), T.wieviele, t.n ? T.genau(t.n) : T.gleich, t.n ? T.eingepackt(t.n, t.thing) : T.ordnen],
};
