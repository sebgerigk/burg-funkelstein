// Stufen: Jede Station hat vier feine Stufen. 0 und 1 gehören zu „Klein" (etwa 3 Jahre),
// 2 und 3 zu „Groß" (etwa 4 Jahre). Die App passt die Stufe behutsam an:
// zwei leichte Runden hintereinander -> eine Stufe schwerer,
// zwei Runden mit viel Hilfe hintereinander -> eine Stufe leichter.
// Legen die Eltern „Klein" oder „Groß" fest, bewegt sie sich nur innerhalb dieses Bereichs.
import { getState, settings, save } from './storage.js';

const BANDS = { auto: [0, 3], klein: [0, 1], gross: [2, 3] };
const UP_AFTER = 2;
const DOWN_AFTER = 2;

const band = () => BANDS[settings().stufe] || BANDS.auto;

/** Aktuelle Stufe einer Station (0–3). */
export function stepOf(id) {
  const [lo, hi] = band();
  const st = getState();
  const s = st.step[id] ?? lo;
  return Math.min(hi, Math.max(lo, s));
}

/** Ist die Station mit der aktuellen Einstellung überhaupt zu sehen? (minBand 'gross': nur für Vierjährige) */
export function stationVisible(station) {
  // „Mein Name" erst, wenn die Eltern einen Namen eingetragen haben
  if (station.needsName) return /[A-Za-zÄÖÜäöü]/.test(settings().name || '');
  if (!station.onlyGross) return true;
  const [, hi] = band();
  return hi >= 2 && (settings().stufe === 'gross' || Object.values(getState().step).some(s => s >= 2));
}

/**
 * Nach einer Runde: wie viel Hilfe war nötig? helps = Aufgaben, bei denen die Antwort
 * aufleuchten musste oder Fips von selbst geholfen hat.
 * Gibt die Veränderung zurück (-1, 0, 1).
 */
export function adapt(id, { helps, tasks }) {
  const st = getState();
  const [lo, hi] = band();
  const now = stepOf(id);
  const easy = helps <= 1;
  const hard = helps >= Math.ceil(tasks / 2);
  const recent = [...(st.recent[id] || []), easy ? 'e' : hard ? 'h' : 'm'].slice(-UP_AFTER);
  let change = 0;
  if (recent.length >= UP_AFTER && recent.slice(-UP_AFTER).every(r => r === 'e') && now < hi) change = 1;
  else if (recent.length >= DOWN_AFTER && recent.slice(-DOWN_AFTER).every(r => r === 'h') && now > lo) change = -1;
  st.step[id] = now + change;
  st.recent[id] = change ? [] : recent;
  save();
  return change;
}
