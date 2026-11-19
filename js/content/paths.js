// Wege zum Nachfahren im Schreibturm. Zeichenfläche 400 × 260.
// Je Art vier Stufen (0, 1 = Klein; 2, 3 = Groß); jede Stufe hat mindestens fünf Wege.
// Ein Weg ist eine Liste von Strichen (SVG-Pfade) in Schreibreihenfolge.

// Breite des Weges je Stufe (in Einheiten der Zeichenfläche). Erlaubte Abweichung siehe games/spuren.js.
export const WIDTH = [54, 46, 38, 32];

const one = d => ({ strokes: [d] });

// Girlande mit Schleifen (wie ein geschriebenes e), Abstand 100
const loops = (x0, n) => {
  let d = `M${x0} 170`;
  for (let k = 0; k < n; k++) {
    const x = x0 + k * 100;
    d += ` C${x + 40} 170 ${x + 70} 140 ${x + 70} 110 C${x + 70} 80 ${x + 40} 80 ${x + 40} 110 C${x + 40} 150 ${x + 70} 170 ${x + 100} 170`;
  }
  return d;
};

export const SPUREN = {
  wege: [
    ['M100 90 H300', 'M100 170 H300', 'M110 130 H290', 'M150 50 V210', 'M250 50 V210'].map(one),
    ['M60 130 H340', 'M200 30 V230', 'M60 80 H340', 'M110 50 L290 210', 'M110 210 L290 50'].map(one),
    ['M50 60 L350 200', 'M50 200 L350 60', 'M80 50 V210 H320', 'M80 210 V50 H320', 'M60 130 H340', 'M320 50 V210 H80'].map(one),
    ['M50 60 L350 200', 'M350 60 L50 200', 'M80 50 V210 H320 V50', 'M60 200 L200 60 H340', 'M60 60 H200 L340 200', 'M80 50 H320 V210 H80'].map(one),
  ],
  wellen: [
    ['M90 200 Q200 20 310 200', 'M90 200 L200 70 L310 200', 'M90 70 Q200 250 310 70', 'M90 70 L200 200 L310 70', 'M80 130 Q140 50 200 130 Q260 210 320 130'].map(one),
    ['M60 190 Q130 60 200 190 Q270 60 340 190', 'M60 190 L130 80 L200 190 L270 80 L340 190', 'M50 140 Q100 60 150 140 T250 140 T350 140', 'M60 80 Q130 210 200 80 Q270 210 340 80', 'M60 80 L130 190 L200 80 L270 190 L340 80'].map(one),
    ['M40 130 Q80 70 120 130 T200 130 T280 130 T360 130', 'M40 190 L95 90 L150 190 L205 90 L260 190 L315 90 L360 170',
      'M40 180 V100 H100 V180 H160 V100 H220 V180 H280 V100 H340 V180', 'M50 100 Q100 200 150 100 Q200 200 250 100 Q300 200 350 100',
      'M50 190 Q100 70 150 190 Q200 70 250 190 Q300 70 350 190'].map(one),
    [loops(50, 3), 'M40 180 V100 H90 V180 H140 V100 H190 V180 H240 V100 H290 V180 H340 V100', 'M40 130 Q70 80 100 130 T160 130 T220 130 T280 130 T340 130',
      'M50 100 Q90 190 130 100 Q170 190 210 100 Q250 190 290 100 Q330 190 360 120', loops(80, 2)].map(one),
  ],
  formen: [
    [
      { shape: 'kreis', strokes: ['M200 30 A100 100 0 0 0 200 230 A100 100 0 0 0 200 30'] },
      { shape: 'kreuz', strokes: ['M200 30 V230', 'M100 130 H300'] },
    ],
    [
      { shape: 'kreis', strokes: ['M200 45 A85 85 0 0 0 200 215 A85 85 0 0 0 200 45'] },
      { shape: 'kreuz', strokes: ['M200 40 V220', 'M110 130 H290'] },
      { shape: 'kreuz', strokes: ['M130 60 L270 200', 'M270 60 L130 200'] },
    ],
    [
      { shape: 'kreis', strokes: ['M200 45 A85 85 0 0 0 200 215 A85 85 0 0 0 200 45'] },
      { shape: 'kreuz', strokes: ['M200 40 V220', 'M110 130 H290'] },
      { shape: 'quadrat', strokes: ['M125 55 V205 H275 V55 H125'] },
      { shape: 'dreieck', strokes: ['M200 35 L95 215 H305 L200 35'] },
    ],
    [
      { shape: 'kreis', strokes: ['M200 55 A75 75 0 0 0 200 205 A75 75 0 0 0 200 55'] },
      { shape: 'kreuz', strokes: ['M140 70 L260 190', 'M260 70 L140 190'] },
      { shape: 'quadrat', strokes: ['M135 65 V195 H265 V65 H135'] },
      { shape: 'dreieck', strokes: ['M200 45 L105 205 H295 L200 45'] },
    ],
  ],
};
