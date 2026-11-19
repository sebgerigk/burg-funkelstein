// Kleine Bildzeichen für Knöpfe (folgen der Textfarbe).
const ic = body => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICON = {
  back: ic('<path d="M15 4 L7 12 L15 20"/>'),
  play: ic('<path d="M8 5 L19 12 L8 19Z" fill="currentColor"/>'),
  check: ic('<path d="M4 13 L10 19 L20 6"/>'),
  cross: ic('<path d="M6 6 L18 18 M18 6 L6 18"/>'),
  del: ic('<path d="M9 6 H20 V18 H9 L3 12Z"/><path d="M12 10 L16 14 M16 10 L12 14" stroke-width="2.4"/>'),
  again: ic('<path d="M20 12 A8 8 0 1 1 17.7 6.3"/><path d="M18 2 V7 H13"/>'),
  gear: ic('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5 V5.5 M12 18.5 V21.5 M2.5 12 H5.5 M18.5 12 H21.5 M5.3 5.3 L7.4 7.4 M16.6 16.6 L18.7 18.7 M5.3 18.7 L7.4 16.6 M16.6 7.4 L18.7 5.3"/>'),
  castle: ic('<path d="M3 21 V8 H6 V11 H9 V8 H12 V11 H15 V8 H18 V11 H21 V21Z" fill="currentColor" fill-opacity=".25"/><path d="M10 21 V16 A2 2 0 0 1 14 16 V21"/>'),
  map: ic('<path d="M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20Z"/><path d="M9 4 V18 M15 6 V20"/>'),
};
