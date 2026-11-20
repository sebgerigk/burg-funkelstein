// Schatzkammer: Zählen, Einpacken, Auf einen Blick, Zahlen kennen, Wo sind mehr?, Einer kommt dazu.
// Mengen über fünf werden immer auch in der Zehner-Schatulle (2 × 5) gezeigt.
import { pick, rnd, shuffle, scatter, wait, shake } from '../engine/util.js';
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
  blick: [[1, 4], [1, 5], [1, 6], [2, 6]],
  mehr: [[1, 5], [1, 6], [1, 10], [1, 10]],
  ziffer: [[1, 3], [1, 5], [1, 8], [1, 10]],
  dazu: [[1, 4], [1, 5], [2, 7], [3, 8]],     // Startmenge; dazu oder weg kommen 1 (Groß auch 2)
};
// Immer mindestens drei Antworten – bei zweien rät man zu leicht richtig.
const CHOICES = [3, 3, 3, 3];

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
    const thing = kind === 'mehr' ? 'apfel' : things[i];
    const color = pick(GEM_COLORS);
    if (kind === 'zaehlen' || kind === 'blick') {
      const gap = step === 0 ? 2 : 1;
      // Höchstens 10: so viel passt in eine Schatulle (Zählen bis 20 kommt mit der Station „Der große Schatz").
      const max = kind === 'blick' ? range[1] : Math.min(10, range[1] + 2);
      const others = distractors(n, CHOICES[step] - 1, gap, max);
      return { kind, n, thing, color, options: shuffle([n, ...others]), scattered: kind === 'blick' && step === 3 };
    }
    // In die Schatulle: Das Kind muss selbst aufhören und „fertig" sagen. Auf Stufe 1 zeigen Punkte, wie viele.
    // Die Schatulle hat immer Platz für mehr, als hineingehört – man kann also auch zu viele hineinlegen.
    if (kind === 'einpacken') return { kind, n, thing, color, slots: n >= 4 ? 10 : 5, pile: Math.min(12, n + rnd(2, 4)), dots: step === 0 };
    // Zahlen kennen: Menge -> Ziffer, oder Ziffer -> Menge (abwechselnd)
    if (kind === 'ziffer') {
      const others = distractors(n, 2, step === 0 ? 1 : 1, range[1]);
      return { kind, n, thing, color, mode: i % 2 ? 'menge' : 'zahl', options: shuffle([n, ...others]) };
    }
    // Einer kommt dazu / geht weg. Das Ergebnis bleibt sichtbar zum Nachzählen.
    if (kind === 'dazu') {
      const by = step === 3 && Math.random() < 0.4 ? 2 : 1;
      const plus = step === 0 || Math.random() < 0.55 || n - by < 1;
      const result = plus ? n + by : n - by;
      const others = distractors(result, 2, 1, 10);
      return { kind, step, n, by, plus, result, thing, color, options: shuffle([result, ...others]) };
    }
    // Wo sind mehr? Zwei Mengen mit Abstand (Klein mindestens 2). Ab Stufe 2 auch „gleich viele".
    const gap = step === 3 ? 1 : 2;
    const [lo, hi] = range;
    const small = Math.min(Math.max(lo, n - gap), hi - gap);
    const withEqual = step >= 1;
    const equal = withEqual && (i === 2 || (step === 3 && i === 4));
    const big = equal ? small : rnd(small + gap, Math.min(hi, small + gap + 3));
    const [a, b] = Math.random() < 0.5 ? [small, big] : [big, small];
    const q = step === 0 ? 'mehr' : pick(['mehr', 'weniger']);
    const fruit = step === 0 ? 'apfel' : pick(['apfel', 'apfel', 'edelstein', 'krone']);
    return { kind, q, a, b, thing: fruit, equal, withEqual };
  });
}

function prompt(t) {
  switch (t.kind) {
    case 'zaehlen': return T.zaehlen;
    case 'einpacken': return T.einpacken(t.n, t.thing);
    case 'blick': return T.blick;
    case 'mehr': return t.withEqual ? (t.q === 'mehr' ? T.mehr_gleich : T.weniger) : T[t.q];
    case 'ziffer': return t.mode === 'zahl' ? T.zahl_welche : T.soviele;
    case 'dazu': return T.dazu_look;
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
    api.count(NUM[counted]);
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
// Echtes Zählen: Die Schatulle schließt nicht von selbst. Das Kind legt hinein, hört auf
// und tippt auf den Haken. Zu viele? Antippen in der Schatulle holt eins wieder heraus.

function mountEinpacken(root, t, api) {
  // Der Haufen ist 44 vmin breit und hoch: 1 Einheit = 0,44 vmin.
  const size = t.pile > 7 ? 8.5 : 10;
  const pos = positions(t.pile, 100, 100, size / 0.44 * 1.12);
  root.innerHTML = `<div class="pack-wrap">
    <div class="pile panel">${pos.map((p, i) => itemHtml(t, p, size, i)).join('')}</div>
    <div class="box">${t.dots ? `<div class="box-target">${Array.from({ length: t.n }, () => '<i></i>').join('')}</div>` : ''}
      ${frameHtml(t.slots, 0, t.thing, t.color)}
      <button class="round-btn green check" aria-label="Fertig" hidden><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13 L10 19 L20 6"/></svg></button>
    </div>
  </div>`;
  const pile = root.querySelector('.pile');
  const box = root.querySelector('.box');
  const check = root.querySelector('.check');
  const slots = [...root.querySelectorAll('.slot')];
  const items = [...pile.querySelectorAll('.item')];
  const inBox = [];   // Indizes der Dinge in der Schatulle, in Reihenfolge der Mulden
  let finished = false;
  let hinted = false;
  const colorOf = i => (t.thing === 'edelstein' ? GEM_COLORS[i % GEM_COLORS.length] : t.color);

  function redraw() {
    slots.forEach((slot, k) => {
      const i = inBox[k];
      slot.innerHTML = i === undefined ? '' : thingSvg(t.thing, colorOf(i));
      slot.dataset.i = i === undefined ? '' : i;
      slot.classList.toggle('filled', i !== undefined);
    });
    check.hidden = inBox.length === 0;
    api.setAnswer(inBox.length === t.n ? check : inBox.length > t.n ? slots[inBox.length - 1] : pile.querySelector('.item:not(.placed)'));
    // Einmal sagen, wie es weitergeht – wenn die richtige Zahl zum ersten Mal erreicht ist.
    if (inBox.length === t.n && !hinted) { hinted = true; setTimeout(() => { if (api.alive() && !finished && inBox.length === t.n) api.say(T.fertig); }, 1400); }
  }

  function put(it) {
    if (finished || it.classList.contains('placed')) return;
    if (inBox.length >= slots.length) { sfx('wrong'); shake(box); return; }
    const from = it.getBoundingClientRect();
    inBox.push(Number(it.dataset.i));
    it.classList.add('placed');
    redraw();
    // Fliegen lassen: das Ding im Fach startet dort, wo es angetippt wurde.
    const slot = slots[inBox.length - 1];
    const to = slot.getBoundingClientRect();
    const svg = slot.firstElementChild;
    svg.style.transform = `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px)`;
    svg.getBoundingClientRect();
    svg.style.transition = 'transform .35s cubic-bezier(.3,1.4,.6,1)';
    svg.style.transform = '';
    sfx('place');
    api.count(NUM[inBox.length]);
  }

  function takeOut(slot) {
    if (finished || slot.dataset.i === '') return;
    const i = Number(slot.dataset.i);
    inBox.splice(inBox.indexOf(i), 1);
    items[i].classList.remove('placed');
    items[i].style.visibility = '';
    sfx('pop');
    redraw();
    if (inBox.length) api.count(NUM[inBox.length]);
  }

  box.addEventListener('click', e => {
    const slot = e.target.closest('.slot');
    if (slot) { takeOut(slot); return; }
    if (!e.target.closest('.check') || finished) return;
    if (inBox.length === t.n) {
      finished = true;
      box.classList.add('full');
      markSeen(`einpacken:${t.n}`);
      api.correct({ target: box, say: T.eingepackt(t.n, t.thing) }).then(() => api.done());
    } else {
      api.wrong({ target: box, say: inBox.length > t.n ? T.zuviel : T.zuwenig });
    }
  });

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
      const inside = ev.clientX > r.left - 40 && ev.clientX < r.right + 40 && ev.clientY > r.top - 40 && ev.clientY < r.bottom + 40;
      it.style.translate = '';
      if (inside) put(it); else { it.classList.add('back'); setTimeout(() => it.classList.remove('back'), 300); }
    };
    it.addEventListener('pointermove', move);
    it.addEventListener('pointerup', up);
    it.addEventListener('pointercancel', up);
  });
  redraw();
}

/* ---------- Zahlen kennen ---------- */

const digitCard = v => `<span class="digit">${v}</span>`;

function mountZiffer(root, t, api) {
  const shown = t.mode === 'zahl'
    ? `<div class="show-amount panel">${frameHtml(t.n > 5 ? 10 : 5, t.n, t.thing, t.color)}</div>`
    : `<div class="show-digit panel">${digitCard(t.n)}</div>`;
  const choice = v => (t.mode === 'zahl' ? digitCard(v) : cardHtml(v, { color: t.color, scattered: true, thing: t.thing }));
  root.innerHTML = `<div class="look-wrap">${shown}
    <div class="choices n3">${t.options.map(v => `<button class="choice card square" data-v="${v}">${choice(v)}</button>`).join('')}</div></div>`;
  const choices = root.querySelector('.choices');
  api.setAnswer(choices.querySelector(`[data-v="${t.n}"]`));
  choices.addEventListener('click', e => {
    const c = e.target.closest('.choice');
    if (!c || root.classList.contains('solved')) return;
    if (Number(c.dataset.v) === t.n) {
      root.classList.add('solved');
      markSeen(`ziffer:${t.n}`);
      api.correct({ target: c, say: T.genau(t.n) }).then(() => api.done());
    } else api.wrong({ target: c });
  });
}

/* ---------- Einer kommt dazu ---------- */

function mountDazu(root, t, api) {
  const slots = Math.max(t.n, t.result) > 5 ? 10 : 5;
  // Klein: Antworten als Mengen (durcheinander, also wirklich zählen); Groß: als Ziffern.
  const choice = v => (t.step >= 2 ? digitCard(v) : cardHtml(v, { color: t.color, scattered: true, thing: t.thing }));
  root.innerHTML = `<div class="look-wrap">
    <div class="show-amount panel dazu">${frameHtml(slots, t.n, t.thing, t.color)}</div>
    <div class="choices n3" hidden>${t.options.map(v => `<button class="choice card square" data-v="${v}">${choice(v)}</button>`).join('')}</div></div>`;
  const cells = [...root.querySelectorAll('.show-amount .slot')];
  const choices = root.querySelector('.choices');
  (async () => {
    await api.ready;
    await wait(500);
    if (!api.alive()) return;
    api.say(T.dazu[(t.plus ? 'plus' : 'minus') + t.by]);
    for (let k = 0; k < t.by; k++) {
      if (t.plus) {
        const cell = cells[t.n + k];
        cell.innerHTML = thingSvg(t.thing, t.color);
        cell.firstElementChild.classList.add('fly-in');
      } else {
        const cell = cells[t.n - 1 - k];
        cell.firstElementChild && cell.firstElementChild.classList.add('fly-out');
      }
      sfx(t.plus ? 'place' : 'whoosh');
      await wait(700);
      if (!api.alive()) return;
    }
    await wait(900);
    if (!api.alive()) return;
    choices.hidden = false;
    api.say(T.jetzt);
  })();
  api.setAnswer(choices.querySelector(`[data-v="${t.result}"]`));
  choices.addEventListener('click', e => {
    const c = e.target.closest('.choice');
    if (!c || root.classList.contains('solved')) return;
    if (Number(c.dataset.v) === t.result) {
      root.classList.add('solved');
      markSeen(`dazu:${t.n}${t.plus ? '+' : '-'}${t.by}`);
      api.correct({ target: c, say: T.genau(t.result) }).then(() => api.done());
    } else api.wrong({ target: c });
  });
}

/* ---------- Auf einen Blick ---------- */

function cardHtml(v, t) {
  // Wie ein Würfel angeordnet, auf Stufe 3 durcheinander.
  const pts = t.scattered || !PIPS[v] ? positions(v, 100, 100, v > 6 ? 21 : 26) : PIPS[v].map(([x, y]) => ({ x, y }));
  return `<span class="mini">${pts.map(p => `<span class="dot" style="left:${p.x}%;top:${p.y}%">${thingSvg(t.thing || 'edelstein', t.color)}</span>`).join('')}</span>`;
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
      <span class="apples">${pos.map((p, i) => `<span class="apple" data-i="${i}" style="left:${p.x}%;top:${p.y}%;--size:${size}vmin">${thingSvg(t.thing, GEM_COLORS[i % GEM_COLORS.length])}</span>`).join('')}</span>
      <span class="ordered" hidden>${frameHtml(n > 5 ? 10 : 5, n, t.thing, GEM_COLORS[1])}</span>
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
  /** Für tools/audit.mjs: was eine Aufgabe ausmacht, und wie viele Antworten zur Auswahl stehen. */
  sig: t => (t.kind === 'mehr' ? `${t.a}/${t.b}/${t.q}` : t.kind === 'dazu' ? `${t.n}${t.plus ? '+' : '-'}${t.by}|${t.thing}|${t.options.slice().sort()}` : `${t.kind}|${t.n}|${t.thing}|${t.mode || ''}|${(t.options || []).slice().sort().join()}`),
  choices: t => (t.options ? t.options.length : t.kind === 'mehr' ? (t.withEqual ? 3 : 2) : null),
  prompt,
  mount(root, t, api) {
    if (t.kind === 'zaehlen') return mountZaehlen(root, t, api);
    if (t.kind === 'einpacken') return mountEinpacken(root, t, api);
    if (t.kind === 'blick') return mountBlick(root, t, api);
    if (t.kind === 'ziffer') return mountZiffer(root, t, api);
    if (t.kind === 'dazu') return mountDazu(root, t, api);
    return mountMehr(root, t, api);
  },
  /** Alles, was in den Aufgaben gesprochen wird (zum Vorladen). */
  texts: t => [prompt(t), ...NUM.slice(1, 11), T.wieviele, T.fertig, T.zuviel, T.zuwenig, T.jetzt, t.n ? T.genau(t.result || t.n) : T.gleich,
    t.n ? T.eingepackt(t.n, t.thing) : T.ordnen, t.kind === 'dazu' ? T.dazu[(t.plus ? 'plus' : 'minus') + t.by] : ''],
};
