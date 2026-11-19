// Schreibturm: Wege, Wellen und Formen mit dem Finger nachfahren.
// Fips (als kleiner Kopf) wird über einen breiten Weg gezogen. Wer vom Weg abkommt,
// verliert nichts: Fips bleibt einfach stehen, bis der Finger wieder bei ihm ist.
import { shuffle, INK } from '../engine/util.js';
import { sfx } from '../engine/audio.js';
import { T } from '../content/texts.js';
import { SPUREN, WIDTH } from '../content/paths.js';
import { thingG, GEM_COLORS } from '../art/things.js';
import { leastSeenFirst, markSeen } from '../engine/storage.js';

const TASKS = 5;
const STEP = 4;          // Abstand der Prüfpunkte entlang des Weges
const LOOKAHEAD = 8;     // so viele Prüfpunkte darf der Finger vorauseilen
const GOALS = ['apfel', 'edelstein', 'krone'];
const FILL = { kreis: '#ffd23f', quadrat: '#4aa3ff', dreieck: '#ff6b8b', kreuz: '#5cc96b' };

function makeTasks({ kind }, step) {
  const pool = SPUREN[kind][step].map((p, i) => ({ ...p, key: `${kind}:${step}:${i}` }));
  let list = leastSeenFirst(pool, p => p.key);
  while (list.length < TASKS) list = list.concat(shuffle(pool));
  return list.slice(0, TASKS).map((p, i) => ({ kind, step, ...p, goal: GOALS[i % GOALS.length], color: GEM_COLORS[i % GEM_COLORS.length] }));
}

const prompt = t => (t.kind === 'formen' ? T.formen[t.shape] : T.weg);

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
  const closed = t.kind === 'formen' && t.shape !== 'kreuz';
  root.innerHTML = `<div class="trace-wrap panel">
    <svg class="trace-svg" viewBox="0 0 400 260">
      ${closed ? `<path class="fill" d="${strokes[0]}" fill="${FILL[t.shape]}"/>` : ''}
      <g class="road">${strokes.map(d => `<path d="${d}" stroke-width="${width + 8}" class="road-edge"/><path d="${d}" stroke-width="${width}" class="road-top"/>`).join('')}</g>
      <g class="guide">${strokes.map(d => `<path d="${d}"/>`).join('')}</g>
      <g class="ink">${strokes.map(d => `<path d="${d}" stroke-width="${width * 0.5}" stroke="${t.kind === 'formen' ? FILL[t.shape] : '#9067e0'}"/>`).join('')}</g>
      <g class="starts"></g>
      <g class="goal"></g>
      <g class="demo"></g>
      <g class="token"><circle class="ring" r="26"/>${fipsHead()}</g>
    </svg>
  </div>`;

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
  if (t.kind !== 'formen') {
    const end = lastPath.getPointAtLength(lastPath.getTotalLength());
    goal.innerHTML = thingG(t.goal, end.x, end.y, 0.42, t.color);
  }
  if (strokes.length > 1) {
    starts.innerHTML = guides.map((g, k) => {
      const p = g.getPointAtLength(0);
      return `<g class="start-num" data-k="${k}"><circle cx="${p.x}" cy="${p.y}" r="13"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${k + 1}</text></g>`;
    }).join('');
  }

  let cur = -1, samples = [], idx = 0, len = 0, active = false, finished = false, ticks = 0;

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
  function showDemo() {
    demo.innerHTML = `<circle r="7"><animateMotion dur="${Math.max(1.4, len / 120).toFixed(2)}s" repeatCount="indefinite" path="${strokes[cur]}"/></circle>`;
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
    if (++ticks % 5 === 0) sfx('trace');
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
      api.say(T.weiter);
      return;
    }
    finished = true;
    demo.innerHTML = '';
    root.querySelectorAll('.start-num').forEach(n => n.classList.add('done'));
    markSeen(t.key);
    if (closed) root.querySelector('.fill').classList.add('show');
    if (t.kind !== 'formen') { goal.classList.add('got'); token.classList.add('eat'); }
    await api.correct({ target: t.kind === 'formen' ? svg : goal, say: t.kind === 'formen' ? T.formen_done[t.shape] : undefined });
    api.done();
  }

  const end = () => { active = false; token.classList.remove('held'); if (!finished) showDemo(); };
  svg.addEventListener('pointerdown', e => { svg.setPointerCapture(e.pointerId); track(e); });
  svg.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') track(e); });
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  setStroke(0);
  api.setAnswer(token);
}

export const spuren = {
  makeTasks,
  prompt,
  mount,
  texts: t => [prompt(t), T.weiter, t.shape ? T.formen_done[t.shape] : ''],
};
