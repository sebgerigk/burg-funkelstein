// Etwas an seinen Platz bringen: ziehen ODER erst das Ding und dann das Ziel antippen.
// Dreijährige tippen oft lieber, als zu ziehen – beides führt zum Ziel.
import { sfx } from '../engine/audio.js';

/**
 * root: Bereich der Aufgabe. items/targets: CSS-Auswahl. tryPlace(item, target) -> true, wenn es passt
 * (dann kümmert sich der Aufrufer um das Aussehen); bei false gleitet das Ding zurück.
 */
export function pickAndPlace(root, { items, targets, tryPlace }) {
  let selected = null;
  const select = it => {
    if (selected) selected.classList.remove('lifted');
    selected = it;
    if (it) { it.classList.add('lifted'); sfx('tap'); }
  };

  root.addEventListener('pointerdown', e => {
    const it = e.target.closest(items);
    if (!it) return;
    const start = { x: e.clientX, y: e.clientY };
    let dragging = false;
    it.setPointerCapture(e.pointerId);
    const move = ev => {
      const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) > 12) { dragging = true; it.classList.add('dragging'); select(null); }
      if (dragging) it.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
    };
    const up = ev => {
      it.removeEventListener('pointermove', move);
      it.removeEventListener('pointerup', up);
      it.removeEventListener('pointercancel', up);
      if (!dragging) { select(selected === it ? null : it); return; }
      it.classList.remove('dragging');
      // Ziel unter dem Finger (etwas Spielraum: das nächste Ziel in 6 vmin Umkreis zählt auch)
      const slack = Math.min(innerWidth, innerHeight) * 0.06;
      const hit = [...root.querySelectorAll(targets)].find(t => {
        const r = t.getBoundingClientRect();
        return ev.clientX > r.left - slack && ev.clientX < r.right + slack && ev.clientY > r.top - slack && ev.clientY < r.bottom + slack;
      });
      it.style.transform = '';
      if (!(hit && tryPlace(it, hit))) { it.classList.add('back'); setTimeout(() => it.classList.remove('back'), 300); }
    };
    it.addEventListener('pointermove', move);
    it.addEventListener('pointerup', up);
    it.addEventListener('pointercancel', up);
  });

  root.addEventListener('click', e => {
    const t = e.target.closest(targets);
    if (!t || !selected) return;
    const it = selected;
    select(null);
    tryPlace(it, t);
  });
}
