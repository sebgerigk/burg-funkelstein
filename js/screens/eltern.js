// Elternbereich (hinter der Sperre): Stufe, Spielzeit, Orte, Figur, Fortschritt.
import { register, go } from '../engine/router.js';
import { getState, settings, setSetting, resetProgress } from '../engine/storage.js';
import { stepOf } from '../engine/level.js';
import { lastDays, minutesToday } from '../engine/playtime.js';
import { PLACES, PLACE_ORDER } from '../content/places.js';
import { GIFTS } from '../content/castle.js';
import { ICON } from '../art/icons.js';

const STEP_LABEL = ['Klein 1', 'Klein 2', 'Groß 1', 'Groß 2'];

register('eltern', el => {
  function render() {
    const s = settings();
    const st = getState();
    const seg = (key, options) => `<div class="seg" data-key="${key}">${options.map(([v, label]) =>
      `<button data-v="${v}" class="${String(s[key]) === String(v) ? 'on' : ''}">${label}</button>`).join('')}</div>`;
    const days = lastDays(7);
    const maxMin = Math.max(15, ...days.map(d => d.min));
    const owned = GIFTS.filter(g => st.owned[g.id]).length;

    el.innerHTML = `<div class="eltern">
      <header class="eltern-head">
        <button class="round-btn small back" aria-label="Zurück">${ICON.back}</button>
        <h1>Elternbereich</h1><span></span>
      </header>
      <div class="eltern-body">
        <section>
          <h2>Stufe</h2>
          <p>„Klein" passt für etwa Dreijährige (zwei Bilder zur Auswahl, Zählen bis 5), „Groß" für Vierjährige (drei Bilder, Zählen bis 10, später bis 20). Bei „Automatisch" passt sich jede Station von selbst an.</p>
          ${seg('stufe', [['auto', 'Automatisch'], ['klein', 'Klein'], ['gross', 'Groß']])}
        </section>
        <section>
          <h2>Spielzeit am Tag</h2>
          <p>Danach verabschiedet sich Fips freundlich. Eine angefangene Runde wird nicht unterbrochen. Heute gespielt: ${minutesToday()} Minuten.</p>
          ${seg('limitMin', [[0, 'Ohne'], [10, '10 Min.'], [15, '15 Min.'], [20, '20 Min.'], [30, '30 Min.']])}
          <div class="days">${days.map(d => `<div class="day"><i style="height:${Math.round(d.min / maxMin * 100)}%"></i><b>${d.min}</b><span>${d.label}</span></div>`).join('')}</div>
        </section>
        <section>
          <h2>Orte</h2>
          <p>Ausgeblendete Orte erscheinen nicht auf der Karte. Musikgarten und Zauberwald werden noch gebaut.</p>
          <div class="toggles">${PLACE_ORDER.map(id => `<button class="toggle ${s.places[id] ? 'on' : ''}" data-place="${id}">${PLACES[id].name}${PLACES[id].built ? '' : ' (Baustelle)'}</button>`).join('')}</div>
        </section>
        <section>
          <h2>Fortschritt</h2>
          <table class="progress-table">
            <tr><th>Station</th><th>Gespielt</th><th>Stufe</th></tr>
            ${PLACE_ORDER.filter(id => PLACES[id].built).flatMap(id => PLACES[id].stations.map(stn =>
              `<tr><td>${PLACES[id].name}: ${stn.title}</td><td>${st.played[stn.id] || 0}×</td><td>${STEP_LABEL[stepOf(stn.id)]}</td></tr>`)).join('')}
          </table>
          <p>Geschenke in der Burg: ${owned} von ${GIFTS.length}${st.gems ? `, dazu ${st.gems} Edelsteine` : ''}.</p>
        </section>
        <section>
          <h2>Spielfigur und Spielstand</h2>
          <div class="actions">
            <button class="btn small figure-again">Figur neu wählen</button>
            <button class="btn small danger reset">Fortschritt löschen</button>
          </div>
          <p class="hint">Der Spielstand liegt nur auf diesem Gerät. „Fortschritt löschen" entfernt Geschenke und Stufen; Einstellungen und Figur bleiben.</p>
        </section>
      </div>
    </div>`;

    el.querySelector('.back').addEventListener('click', () => go('map'));
    el.querySelectorAll('.seg').forEach(g => g.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      const key = g.dataset.key;
      setSetting(key, key === 'limitMin' ? Number(b.dataset.v) : b.dataset.v);
      render();
    }));
    el.querySelectorAll('.toggle').forEach(b => b.addEventListener('click', () => {
      const places = { ...settings().places, [b.dataset.place]: !settings().places[b.dataset.place] };
      setSetting('places', places);
      render();
    }));
    el.querySelector('.figure-again').addEventListener('click', () => go('figur'));
    const reset = el.querySelector('.reset');
    reset.addEventListener('click', () => {
      if (!reset.classList.contains('sure')) { reset.classList.add('sure'); reset.textContent = 'Wirklich löschen?'; return; }
      resetProgress();
      render();
    });
  }
  render();
});
