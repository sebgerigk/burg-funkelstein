// Die Spielfigur: Ritterin, Ritter, Prinzessin oder Prinz. Zeichenfläche 120 × 200.
import { INK } from '../engine/util.js';

const LOOK = {
  ritterin: { skin: '#f1c7a1', hair: '#c9682c', top: '#9aa7b8', top2: '#7b889a', legs: '#5a4a6a', kind: 'helm', plume: '#ff6b8b', emblem: '#ffd23f', braid: true },
  ritter: { skin: '#ffd9b8', hair: '#f2c94c', top: '#4aa3ff', top2: '#2f7fd6', legs: '#3d2b4a', kind: 'helm', plume: '#5cc96b', emblem: '#ffd23f' },
  prinzessin: { skin: '#9a6440', hair: '#2d1c14', top: '#ff8fb8', top2: '#e2668f', legs: '#ff8fb8', kind: 'krone', dress: true, long: true },
  prinz: { skin: '#d9a47a', hair: '#4a2c1c', top: '#e8504f', top2: '#c0383a', legs: '#3d2b4a', kind: 'krone', cape: '#7b5cd6', curls: true },
};

export const FIGURE_IDS = Object.keys(LOOK);

export function figureSvg(id) {
  const L = LOOK[id] || LOOK.ritter;
  const head = 62;
  const hairBack = L.long
    ? `<path d="M30 ${head} Q26 120 40 128 L80 128 Q94 120 90 ${head}Z" fill="${L.hair}"/>`
    : L.braid ? `<path d="M84 ${head + 10} Q100 96 92 124" fill="none" stroke="${INK}" stroke-width="13"/><path d="M84 ${head + 10} Q100 96 92 124" fill="none" stroke="${L.hair}" stroke-width="7"/>` : '';
  const legs = L.dress ? '' : `<rect x="44" y="150" width="12" height="34" rx="5" fill="${L.legs}"/><rect x="64" y="150" width="12" height="34" rx="5" fill="${L.legs}"/>`;
  const shoes = `<ellipse cx="48" cy="186" rx="11" ry="7" fill="#6b4630"/><ellipse cx="72" cy="186" rx="11" ry="7" fill="#6b4630"/>`;
  const body = L.dress
    ? `<path d="M44 100 L76 100 L96 178 Q60 190 24 178Z" fill="${L.top}"/><path d="M34 160 Q60 170 86 160" stroke="${L.top2}" stroke-width="3" fill="none"/><path d="M48 100 L60 116 L72 100" fill="#fff4dc"/>`
    : `<path d="M40 102 Q60 96 80 102 L84 154 L36 154Z" fill="${L.top}"/><path d="M36 140 H84" stroke="${L.top2}" stroke-width="4"/>
       ${L.emblem ? `<path d="M60 112 l3.5 7.5 8.2 1 -6 5.6 1.6 8 -7.3-4 -7.3 4 1.6-8 -6-5.6 8.2-1Z" fill="${L.emblem}" stroke-width="2.5"/>` : ''}`;
  const cape = L.cape ? `<path d="M40 102 Q20 140 26 170 L94 170 Q100 140 80 102Z" fill="${L.cape}"/>` : '';
  const arms = `<path d="M40 106 Q26 124 30 142" fill="none" stroke="${INK}" stroke-width="13"/><path d="M40 106 Q26 124 30 142" fill="none" stroke="${L.top}" stroke-width="7"/>
    <path d="M80 106 Q94 124 90 142" fill="none" stroke="${INK}" stroke-width="13"/><path d="M80 106 Q94 124 90 142" fill="none" stroke="${L.top}" stroke-width="7"/>
    <circle cx="30" cy="145" r="7" fill="${L.skin}"/><circle cx="90" cy="145" r="7" fill="${L.skin}"/>`;
  const face = `<circle cx="60" cy="${head}" r="30" fill="${L.skin}"/>
    <circle cx="50" cy="${head + 2}" r="4" fill="${INK}" stroke="none"/><circle cx="70" cy="${head + 2}" r="4" fill="${INK}" stroke="none"/>
    <circle cx="51.4" cy="${head + 0.5}" r="1.4" fill="#fff" stroke="none"/><circle cx="71.4" cy="${head + 0.5}" r="1.4" fill="#fff" stroke="none"/>
    <circle cx="42" cy="${head + 11}" r="5" fill="#ff8fa3" stroke="none" opacity=".6"/><circle cx="78" cy="${head + 11}" r="5" fill="#ff8fa3" stroke="none" opacity=".6"/>
    <path d="M52 ${head + 14} Q60 ${head + 21} 68 ${head + 14}" fill="none" stroke-width="3"/>`;
  let top;
  if (L.kind === 'helm') {
    top = `<path d="M28 ${head - 2} Q28 ${head - 34} 60 ${head - 34} Q92 ${head - 34} 92 ${head - 2} L86 ${head - 4} Q84 ${head - 22} 60 ${head - 22} Q36 ${head - 22} 34 ${head - 4}Z" fill="#c8d2de"/>
      <path d="M60 ${head - 34} V${head - 22}" stroke-width="3"/>
      <path d="M60 ${head - 34} Q66 ${head - 56} 84 ${head - 52} Q74 ${head - 44} 64 ${head - 33}" fill="${L.plume}"/>
      ${L.braid ? '' : `<path d="M36 ${head - 6} Q44 ${head - 14} 52 ${head - 10}" fill="none" stroke="${L.hair}" stroke-width="5"/>`}`;
  } else {
    const fringe = L.curls
      ? `<path d="M30 ${head - 4} Q30 ${head - 30} 60 ${head - 31} Q90 ${head - 30} 90 ${head - 4} Q84 ${head - 14} 76 ${head - 10} Q70 ${head - 18} 60 ${head - 12} Q50 ${head - 18} 44 ${head - 10} Q36 ${head - 14} 30 ${head - 4}Z" fill="${L.hair}"/>`
      : `<path d="M30 ${head + 2} Q28 ${head - 30} 60 ${head - 31} Q92 ${head - 30} 90 ${head + 2} Q80 ${head - 16} 60 ${head - 14} Q40 ${head - 16} 30 ${head + 2}Z" fill="${L.hair}"/>`;
    top = `${fringe}<path d="M38 ${head - 26} L36 ${head - 50} L48 ${head - 38} L60 ${head - 54} L72 ${head - 38} L84 ${head - 50} L82 ${head - 26}Z" fill="#ffd23f"/>
      <circle cx="60" cy="${head - 34}" r="3.5" fill="#ff6b8b" stroke-width="2"/>`;
  }
  return `<svg class="figure-svg" viewBox="0 0 120 200" aria-hidden="true"><g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    ${cape}${hairBack}${legs}${shoes}${body}${arms}${face}${top}
  </g></svg>`;
}
