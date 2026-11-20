// Die vier Orte im Königreich und ihre Stationen. Reihenfolge = vorgeschlagener Weg.
// Die ids sind sprechend und bleiben stabil, damit der Spielstand erhalten bleibt,
// wenn später Stationen dazwischen eingefügt werden.
// built: false -> auf der Karte als Baustelle zu sehen (kommt in Etappe 2).
// onlyGross: true -> nur bei Stufe „Groß" zu sehen (kommt in Etappe 3).
export const PLACES = {
  schreib: {
    name: 'Schreibturm',
    say: 'Der Schreibturm!',
    welcome: 'Willkommen im Schreibturm! Tippe auf ein Bild.',
    built: true,
    stations: [
      { id: 'schreib-wege', title: 'Drachenwege', game: 'spuren', opts: { kind: 'wege' } },
      { id: 'schreib-wellen', title: 'Wellen und Zinnen', game: 'spuren', opts: { kind: 'wellen' } },
      { id: 'schreib-formen', title: 'Formen malen', game: 'spuren', opts: { kind: 'formen' } },
      { id: 'schreib-buchstaben', title: 'Buchstaben spuren', game: 'spuren', opts: { kind: 'buchstaben' } },
      // Nur zu sehen, wenn die Eltern den Namen eingetragen haben
      { id: 'schreib-name', title: 'Mein Name', game: 'spuren', opts: { kind: 'name' }, needsName: true },
    ],
  },
  zahl: {
    name: 'Schatzkammer',
    say: 'Die Schatzkammer!',
    welcome: 'Willkommen in der Schatzkammer! Tippe auf ein Bild.',
    built: true,
    stations: [
      { id: 'zahl-zaehlen', title: 'Edelsteine zählen', game: 'zaehlen', opts: { kind: 'zaehlen' } },
      { id: 'zahl-einpacken', title: 'In die Schatulle', game: 'zaehlen', opts: { kind: 'einpacken' } },
      { id: 'zahl-blick', title: 'Auf einen Blick', game: 'zaehlen', opts: { kind: 'blick' } },
      { id: 'zahl-ziffer', title: 'Zahlen kennen', game: 'zaehlen', opts: { kind: 'ziffer' } },
      { id: 'zahl-mehr', title: 'Wo sind mehr?', game: 'zaehlen', opts: { kind: 'mehr' } },
      { id: 'zahl-dazu', title: 'Einer kommt dazu', game: 'zaehlen', opts: { kind: 'dazu' } },
    ],
  },
  musik: {
    name: 'Musikgarten',
    say: 'Der Musikgarten!',
    welcome: 'Willkommen im Musikgarten!',
    built: false,
    stations: [],
  },
  wald: {
    name: 'Zauberwald',
    say: 'Der Zauberwald!',
    welcome: 'Willkommen im Zauberwald! Tippe auf ein Bild.',
    built: true,
    stations: [
      { id: 'wald-farben', title: 'Farben sortieren', game: 'wald', opts: { kind: 'farben' } },
      { id: 'wald-paare', title: 'Was ist gleich?', game: 'wald', opts: { kind: 'paare' } },
      { id: 'wald-schatten', title: 'Schatten-Rätsel', game: 'wald', opts: { kind: 'schatten' } },
      { id: 'wald-memory', title: 'Memory', game: 'wald', opts: { kind: 'memory' } },
      { id: 'wald-passt', title: 'Was passt nicht?', game: 'wald', opts: { kind: 'passt' } },
      { id: 'wald-muster', title: 'Fahnen-Muster', game: 'wald', opts: { kind: 'muster' } },
      { id: 'wald-ablauf', title: 'Was kommt zuerst?', game: 'wald', opts: { kind: 'ablauf' } },
    ],
  },
};

export const PLACE_ORDER = ['schreib', 'zahl', 'musik', 'wald'];

/** Ort einer Station: 'zahl-mehr' -> 'zahl'. */
export const placeOf = stationId => stationId.split('-')[0];

export function allPlaceTexts() {
  return Object.values(PLACES).flatMap(p => [p.say, p.welcome]);
}
