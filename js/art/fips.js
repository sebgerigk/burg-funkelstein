// Fips, der kleine Drache – Begleiter des Kindes. Reine SVG-Zeichnung, per CSS animiert.
import { INK, h } from '../engine/util.js';
import { speak, sfx } from '../engine/audio.js';

const G = '#5cc96b', G2 = '#3fa452', BELLY = '#ffe08a', BELLY2 = '#f2c255';
const WING = '#b98cff', WING2 = '#9067e0', HORN = '#fff4dc', SPIKE = '#ff9f43';

export function fipsSvg() {
  return `<svg class="fips-svg" viewBox="0 0 200 240" aria-hidden="true">
  <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g class="fips-tail">
      <path d="M138 206 Q186 210 184 170 Q182 146 166 140" fill="none" stroke="${INK}" stroke-width="17"/>
      <path d="M138 206 Q186 210 184 170 Q182 146 166 140" fill="none" stroke="${G}" stroke-width="9"/>
      <path d="M166 140 L150 128 L172 120 L178 142Z" fill="${SPIKE}"/>
    </g>
    <g class="fips-body">
      <g class="fips-wing fips-wing-l">
        <path d="M62 132 Q22 104 14 128 Q26 132 24 146 Q38 144 42 158 Q52 150 66 156Z" fill="${WING}"/>
        <path d="M60 136 Q40 134 28 140 M58 144 Q48 146 42 154" stroke="${WING2}" stroke-width="3" fill="none"/>
      </g>
      <g class="fips-wing fips-wing-r">
        <path d="M138 132 Q178 104 186 128 Q174 132 176 146 Q162 144 158 158 Q148 150 134 156Z" fill="${WING}"/>
        <path d="M140 136 Q160 134 172 140 M142 144 Q152 146 158 154" stroke="${WING2}" stroke-width="3" fill="none"/>
      </g>
      <ellipse cx="100" cy="172" rx="50" ry="52" fill="${G}"/>
      <ellipse cx="100" cy="182" rx="31" ry="36" fill="${BELLY}"/>
      <path d="M76 168 Q100 176 124 168 M72 186 Q100 195 128 186 M78 204 Q100 211 122 204" stroke="${BELLY2}" stroke-width="3" fill="none"/>
      <path d="M58 168 Q50 182 62 190" fill="${G}" />
      <path d="M142 168 Q150 182 138 190" fill="${G}" />
      <ellipse cx="74" cy="222" rx="18" ry="11" fill="${G}"/>
      <ellipse cx="126" cy="222" rx="18" ry="11" fill="${G}"/>
      <path d="M64 228 v-5 M74 230 v-6 M84 228 v-5 M116 228 v-5 M126 230 v-6 M136 228 v-5" stroke-width="3"/>
      <g class="fips-head">
        <path d="M70 46 L62 14 L84 38Z" fill="${HORN}"/>
        <path d="M130 46 L138 14 L116 38Z" fill="${HORN}"/>
        <path d="M88 40 L94 24 L100 38 L106 24 L112 40" fill="${SPIKE}"/>
        <ellipse cx="100" cy="86" rx="58" ry="50" fill="${G}"/>
        <ellipse cx="100" cy="110" rx="36" ry="24" fill="#8fe09a" stroke="none"/>
        <circle cx="90" cy="104" r="3" fill="${G2}" stroke="none"/>
        <circle cx="110" cy="104" r="3" fill="${G2}" stroke="none"/>
        <g class="fips-eyes-open">
          <g class="fips-eye">
            <ellipse cx="76" cy="78" rx="14" ry="16" fill="#fff"/>
            <circle cx="79" cy="80" r="9" fill="${INK}" stroke="none"/>
            <circle cx="82.5" cy="76" r="3.6" fill="#fff" stroke="none"/>
          </g>
          <g class="fips-eye">
            <ellipse cx="124" cy="78" rx="14" ry="16" fill="#fff"/>
            <circle cx="121" cy="80" r="9" fill="${INK}" stroke="none"/>
            <circle cx="124.5" cy="76" r="3.6" fill="#fff" stroke="none"/>
          </g>
        </g>
        <g class="fips-eyes-shut" fill="none">
          <path d="M64 82 Q76 90 88 82"/><path d="M112 82 Q124 90 136 82"/>
        </g>
        <circle cx="54" cy="100" r="8" fill="#ff9db0" stroke="none" opacity=".85"/>
        <circle cx="146" cy="100" r="8" fill="#ff9db0" stroke="none" opacity=".85"/>
        <path class="fips-smile" d="M86 118 Q100 128 114 118" fill="none"/>
        <path class="fips-mouth" d="M88 117 Q100 140 112 117Z" fill="#c2405a"/>
      </g>
    </g>
  </g>
</svg>`;
}

/**
 * Fips mit Sprechblase. say() zeigt den Text und spricht ihn, show() zeigt ihn nur.
 * Antippen wiederholt den letzten Text. Mehrere Sätze (Liste) spricht er nacheinander.
 * autoHide: die Sprechblase verschwindet kurz nach dem Sprechen (damit sie nichts verdeckt).
 */
export function createFips({ autoHide = false } = {}) {
  const el = h(`<div class="fips">
    <button class="fips-btn" aria-label="Fips wiederholt">${fipsSvg()}</button>
    <div class="bubble" hidden><span></span></div>
  </div>`);
  const btn = el.querySelector('.fips-btn');
  const bubble = el.querySelector('.bubble');
  const span = bubble.querySelector('span');
  let last = [];
  let talkId = 0;
  let onTap = null;
  let hideTimer = 0;

  function show(text) {
    clearTimeout(hideTimer);
    last = Array.isArray(text) ? text : [text];
    span.textContent = last.join(' ');
    bubble.hidden = false;
    bubble.classList.remove('pop');
    void bubble.offsetWidth;
    bubble.classList.add('pop');
  }

  /** Spricht einen Satz oder mehrere nacheinander. Endet, wenn alles gesagt oder unterbrochen ist. */
  async function say(text) {
    show(text);
    const id = ++talkId;
    for (const t of last) {
      if (id !== talkId) return;
      await talk(t, id);
    }
    if (autoHide && id === talkId) hideTimer = setTimeout(() => { bubble.hidden = true; }, 2500);
  }

  /** Spricht, ohne die Sprechblase zu ändern (z. B. beim Mitzählen). */
  async function talk(text, id = ++talkId) {
    el.classList.add('talking');
    await speak(text);
    if (id === talkId) el.classList.remove('talking');
  }

  function cheer() {
    el.classList.remove('cheer');
    void el.offsetWidth;
    el.classList.add('cheer');
  }

  btn.addEventListener('click', () => {
    sfx('tap');
    if (onTap) onTap();
    else if (last.length) say(last);
  });

  return {
    el, say, show, cheer,
    talk: text => talk(text),
    /** Eigene Reaktion auf Antippen (z. B. „Aufgabe wiederholen" in der Runde). */
    onTap(fn) { onTap = fn; },
    sleep(on = true) { el.classList.toggle('asleep', on); },
  };
}
