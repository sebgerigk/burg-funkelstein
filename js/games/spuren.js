// Schreibturm: Wege, Wellen, Formen, Buchstaben und der eigene Name – mit dem Finger nachfahren.
// Fips (als kleiner Kopf) wird über einen breiten Weg gezogen. Wer vom Weg abkommt,
// verliert nichts: Fips bleibt einfach stehen, bis der Finger wieder bei ihm ist.
import { shuffle, INK } from '../engine/util.js';
import { sfx } from '../engine/audio.js';
import { T, LETTER_WORDS } from '../content/texts.js';
import { SPUREN, WIDTH } from '../content/paths.js';
import { LETTERS } from '../content/letters.js';
import { thingG, GEM_COLORS } from '../art/things.js';
import { picSvg } from '../art/wald.js';
import { fitThumbs } from '../screens/castle.js';
import { leastSeenFirst, markSeen, settings } from '../engine/storage.js';

const TASKS = 5;
const STEP = 4;          // Abstand der Prüfpunkte entlang des Weges
const LOOKAHEAD = 8;     // so viele Prüfpunkte darf der Finger vorauseilen
const GOALS = ['apfel', 'edelstein', 'krone'];

// Buchstaben je Stufe, vom Leichten zum Schweren: erst gerade und einfache runde,
// dann mehr Striche, dann Schrägen und Bögen, zuletzt Umlaute und knifflige Formen.
const LETTER_STEPS = [
  ['I', 'L', 'T', 'O', 'C', 'U', 'V'],
  ['I', 'L', 'T', 'O', 'C', 'U', 'V', 'H', 'E', 'F', 'A', 'X', 'N'],
  ['H', 'E', 'F', 'A', 'X', 'N', 'M', 'W', 'K', 'Z', 'S', 'D', 'P', 'Y'],
  ['M', 'W', 'K', 'Z', 'S', 'D', 'P', 'Y', 'B', 'R', 'G', 'J', 'Q', 'Ä', 'Ö', 'Ü'],
];

/** Der Name aus dem Elternbereich, nur Buchstaben, die es zum Nachfahren gibt (höchstens acht). */
export function nameLetters(name = settings().name) {
  return [...String(name || '').toUpperCase()].filter(ch => LETTERS[ch]).slice(0, 8);
}

function pickFrom(pool, keyOf) {
  let list = leastSeenFirst(pool, keyOf);
  while (list.length < TASKS) list = list.concat(shuffle(pool));
  return list.slice(0, TASKS);
}

function makeTasks({ kind, name }, step) {
  const extra = i => ({ goal: GOALS[i % GOALS.length], color: GEM_COLORS[i % GEM_COLORS.length] });
  if (kind === 'buchstaben') {
    return pickFrom(LETTER_STEPS[step], L => 'b:' + L).map((L, i) => ({ kind, step, letter: L, strokes: LETTERS[L], key: 'b:' + L, ...extra(i) }));
  }
  if (kind === 'name') {
    const letters = nameLetters(name);
    return letters.map((L, i) => ({ kind, step, letter: L, strokes: LETTERS[L], key: `n:${i}:${L}`, index: i, word: letters, ...extra(i) }));
  }
  const pool = SPUREN[kind][step].map((p, i) => ({ ...p, key: `${kind}:${step}:${p.id || i}` }));
  return pickFrom(pool, p => p.key).map((p, i) => ({ kind, step, ...p, ...extra(i) }));
}

function prompt(t) {
  if (t.kind === 'formen') return T.formen[t.shape];
  if (t.kind === 'buchstaben' || t.kind === 'name') return T.buchstabe(t.letter);
  return T.weg;
}

function doneText(t) {
  if (t.kind === 'formen') return T.formen_done[t.shape];
  if (t.kind === 'buchstaben') return T.buchstabe_done(t.letter);
  if (t.kind === 'name') return t.index === t.word.length - 1 ? T.name_done : undefined;
  return undefined;
}

const fipsHead = () => `<g class="token-art" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
  <path d="M-12 -14 L-16 -26 L-6 -17Z M12 -14 L16 -26 L6 -17Z" fill="#fff4dc"/>
  <circle r="19" fill="#5cc96b"/>
  <ellipse cx="-7" cy="-3" rx="5" ry="6" fill="#fff"/><ellipse cx="7" cy="-3" rx="5" ry="6" fill="#fff"/>
  <circle cx="-6" cy="-2" r="3" fill="${INK}" stroke="none"/><circle cx="6" cy="-2" r="3" fill="${INK}" stroke="none"/>
  <path d="M-6 8 Q0 13 6 8" fill="none"/></g>`;

function mount(root, t, api) {
  const width = WIDTH[t.step];
  const tol = width * 0.85;
  const strokes = t.strokes;
  const isLetter = t.kind === 'buchstaben' || t.kind === 'name';
  const fills = t.fill || [];
  const firstFill = fills[0] && fills[0][1];
  const inkColor = t.kind === 'formen' ? (firstFill && firstFill !== '#ffffff' ? firstFill : '#5cc96b') : isLetter ? '#4aa3ff' : '#9067e0';
  const word = t.kind === 'buchstaben' && LETTER_WORDS[t.letter];
  root.innerHTML = `<div class="trace-layout">
    ${t.kind === 'name' ? `<div class="name-row">${t.word.map((L, i) => `<span class="${i < t.index ? 'done' : i === t.index ? 'now' : ''}">${L}</span>`).join('')}</div>` : ''}
    <div class="trace-row">
    <div class="trace-wrap panel">
    <svg class="trace-svg" viewBox="0 0 400 260">
      ${fills.map(([i, c]) => `<path class="fill" d="${strokes[i]}" fill="${c}"/>`).join('')}
      <g class="road">${strokes.map(d => `<path d="${d}" stroke-width="${width + 8}" class="road-edge"/><path d="${d}" stroke-width="${width}" class="road-top"/>`).join('')}</g>
      <g class="guide">${strokes.map(d => `<path d="${d}"/>`).join('')}</g>
      <g class="ink">${strokes.map(d => `<path d="${d}" stroke-width="${width * 0.5}" stroke="${inkColor}"/>`).join('')}</g>
      <g class="starts"></g>
      <g class="goal"></g>
      <g class="demo"></g>
      <g class="token"><circle class="ring" r="26"/>${fipsHead()}</g>
    </svg>
    </div>
    ${word ? `<div class="letter-pic card">${picSvg(word[1])}<b>${t.letter}</b></div>` : ''}
    </div>
  </div>`;
  if (word) fitThumbs(root);

  const svg = root.querySelector('.trace-svg');
  const inks = [...root.querySelectorAll('.ink path')];
  const guides = [...root.querySelectorAll('.guide path')];
  const token = root.querySelector('.token');
  const demo = root.querySelector('.demo');
  const starts = root.querySelector('.starts');
  const goal = root.querySelector('.goal');

  inks.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = `${l} ${l}`; p.style.strokeDashoffset = l; });

  // Ziel am Ende (bei Wegen und Wellen) und Startnummern bei mehreren Strichen.
  const lastPath = guides[guides.length - 1];
  if (t.kind === 'wege' || t.kind === 'wellen') {
    const end = lastPath.getPointAtLength(lastPath.getTotalLength());
    goal.innerHTML = thingG(t.goal, end.x, end.y, 0.42, t.color);
  }
  if (strokes.length > 1) {
    starts.innerHTML = guides.map((g, k) => {
      const p = g.getPointAtLength(0);
      return `<g class="start-num" data-k="${k}"><circle cx="${p.x}" cy="${p.y}" r="13"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${k + 1}</text></g>`;
    }).join('');
  }

  let cur = -1, samples = [], idx = 0, len = 0, active = false, finished = false, toldNext = false;

  function setStroke(k) {
    cur = k;
    const path = guides[k];
    len = path.getTotalLength();
    samples = [];
    for (let l = 0; l < len; l += STEP) samples.push(path.getPointAtLength(l));
    samples.push(path.getPointAtLength(len));
    idx = 0;
    active = false;
    guides.forEach((g, i) => g.classList.toggle('now', i === k));
    root.querySelectorAll('.start-num').forEach(n => n.classList.toggle('done', Number(n.dataset.k) < k));
    showDemo();
    moveToken();
  }

  // Ein kleiner Punkt zeigt, wohin es geht – nur solange der Finger nicht unterwegs ist.
  let cue = false;   // Hinweise erst nach der Ansage (während Fips spricht, soll nichts zappeln)
  function showDemo() {
    if (!cue || len < 4) return;
    demo.innerHTML = `<circle r="7"><animateMotion dur="${Math.max(1.4, len / 120).toFixed(2)}s" repeatCount="3" path="${strokes[cur]}"/></circle>`;
  }

  function moveToken() {
    const p = samples[idx];
    token.setAttribute('transform', `translate(${p.x} ${p.y})`);
    inks[cur].style.strokeDashoffset = Math.max(0, len - idx * STEP);
  }

  function toSvg(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function track(e) {
    if (finished) return;
    const p = toSvg(e);
    if (!active) {
      if (dist(p, samples[idx]) > tol * 1.5) return;
      active = true;
      token.classList.add('held');
      demo.innerHTML = '';
    }
    // Ein Punkt (Ä, Ö, Ü) ist geschafft, sobald der Finger dort ist.
    if (len < 4) { idx = samples.length - 1; moveToken(); strokeDone(); return; }
    let moved = false;
    for (;;) {
      let best = -1;
      const max = Math.min(idx + LOOKAHEAD, samples.length - 1);
      for (let j = idx + 1; j <= max; j++) if (dist(p, samples[j]) <= tol) best = j;
      if (best < 0) break;
      idx = best;
      moved = true;
    }
    if (!moved) return;
    moveToken();
    if (idx >= samples.length - 1) strokeDone();
  }

  async function strokeDone() {
    inks[cur].style.strokeDashoffset = 0;
    inks[cur].classList.add('done');
    active = false;
    token.classList.remove('held');
    if (cur + 1 < strokes.length) {
      sfx('pop');
      setStroke(cur + 1);
      // „Und jetzt hier weiter" nur beim ersten Mal – sonst redet Fips bei jedem Strich dazwischen.
      if (!toldNext) { toldNext = true; api.say(T.weiter); }
      return;
    }
    finished = true;
    demo.innerHTML = '';
    root.querySelectorAll('.start-num').forEach(n => n.classList.add('done'));
    markSeen(t.key);
    root.querySelectorAll('.fill').forEach(f => f.classList.add('show'));
    if (t.kind === 'wege' || t.kind === 'wellen') { goal.classList.add('got'); token.classList.add('eat'); }
    else token.classList.add('away');
    const pic = root.querySelector('.letter-pic');
    if (pic) pic.classList.add('show');
    if (t.kind === 'name') {
      const span = root.querySelectorAll('.name-row span')[t.index];
      span.classList.remove('now');
      span.classList.add('done');
    }
    await api.correct({ target: t.kind === 'wege' || t.kind === 'wellen' ? goal : svg, say: doneText(t) });
    api.done();
  }

  const end = () => { active = false; token.classList.remove('held'); if (!finished) showDemo(); };
  svg.addEventListener('pointerdown', e => { svg.setPointerCapture(e.pointerId); track(e); });
  svg.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') track(e); });
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  setStroke(0);
  api.setAnswer(token);
  Promise.resolve(api.ready).then(() => {
    if (!api.alive() || finished) return;
    cue = true;
    token.classList.add('cue');
    if (!active) showDemo();
  });
}

export const spuren = {
  makeTasks,
  sig: t => t.key,
  choices: () => null,
  prompt,
  mount,
  texts: t => [prompt(t), T.weiter, doneText(t), T.name_done].filter(Boolean),
};
