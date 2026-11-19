#!/usr/bin/env python3
"""Erzeugt die deutschen Sprach-Clips für Fips mit der macOS-Stimme (aus der Schatzinsel übernommen).

Aufruf (im Projektordner):  python3 tools/gen-audio.py ["Petra (Premium)"]

Liest alle Sätze aus assets/audio/texts.json (erzeugt mit `node tools/list-texts.mjs`),
erzeugt pro Satz eine kleine AAC-Datei in assets/audio/ und schreibt
assets/audio/index.json (Text -> Dateiname). Vorhandene Clips werden nicht neu erzeugt.
Ohne Clips spricht die App mit der Sprachausgabe des Geräts.
"""
import audioop
import hashlib
import json
import math
import os
import subprocess
import sys
import tempfile
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio")
VOICE = sys.argv[1] if len(sys.argv) > 1 else "Petra (Premium)"
# Kurze Stille vor jedem Clip: ohne sie verschluckt die Tonausgabe gern die erste Silbe.
LEAD_IN = "[[slnc 250]] "
VERSION = "v1"
# Sprechtempo in Wörtern pro Minute: für Drei- und Vierjährige etwas langsamer als sonst (etwa 180).
WORDS_PER_MIN = 160
# Klang: Die Stimme liefert Details bis etwa 20 kHz. Mit 44,1 kHz bleiben s, sch, f und z
# klar unterscheidbar (bei 22 kHz war über 11 kHz alles abgeschnitten).
RATE = 44100
BITRATE = 64000
TAIL_MS = 80          # Stille am Ende: so kurz, dass Koko gleich weitermachen kann
FADE_MS = 15          # sanftes Ausblenden gegen Knackser
TARGET_DB = -16.0     # Lautstärke des gesprochenen Teils, damit alle Clips gleich laut wirken
MAX_BOOST_DB = 4.0    # Zischlaute (Dachchchch) nicht übermäßig anheben
MAX_CUT_DB = 3.0
PEAK_DB = -1.0        # nie lauter als knapp unter Vollaussteuerung

def pcm_of(path):
    """16-Bit-Mono-Daten einer WAV-Datei (auch im erweiterten WAV-Format von say)."""
    raw = open(path, "rb").read()
    i = raw.index(b"data")
    size = int.from_bytes(raw[i + 4:i + 8], "little")
    data = raw[i + 8:i + 8 + size]
    return data[:len(data) // 2 * 2]


def polish(data):
    """Kürzt die Stille am Ende und gleicht die Lautstärke an."""
    win = RATE // 100 * 2                      # 10 ms
    frames = [audioop.rms(data[i:i + win], 2) for i in range(0, len(data) - win + 1, win)]
    if not frames or max(frames) == 0:
        return data
    loud = max(frames) * 0.03
    active = [k for k, r in enumerate(frames) if r > loud]
    end = min(len(data), (active[-1] + 1) * win + RATE * TAIL_MS // 1000 * 2)
    data = data[:end]
    spoken = b"".join(data[k * win:(k + 1) * win] for k in active)
    rms = audioop.rms(spoken, 2) or 1
    gain_db = TARGET_DB - 20 * math.log10(rms / 32768)
    gain_db = max(-MAX_CUT_DB, min(MAX_BOOST_DB, gain_db))
    peak = audioop.max(data, 2) or 1
    gain_db = min(gain_db, PEAK_DB - 20 * math.log10(peak / 32768))
    data = audioop.mul(data, 2, 10 ** (gain_db / 20))
    fade = RATE * FADE_MS // 1000
    head, tail = data[:-fade * 2], data[-fade * 2:]
    faded = b"".join(audioop.mul(tail[k * 2:k * 2 + 2], 2, 1 - k / fade) for k in range(fade))
    return head + faded


def render(text, target):
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "say.wav")
        clean = os.path.join(tmp, "clip.wav")
        subprocess.run(["say", "-v", VOICE, "-r", str(WORDS_PER_MIN), f"--data-format=LEI16@{RATE}", "-o", raw, LEAD_IN + text], check=True)
        with wave.open(clean, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(RATE)
            w.writeframes(polish(pcm_of(raw)))
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", str(BITRATE), "-q", "127",
                        "-c", "1", clean, target], check=True)


def collect():
    with open(os.path.join(OUT, "texts.json"), encoding="utf-8") as f:
        return json.load(f)


def main():
    os.makedirs(OUT, exist_ok=True)
    index = {}
    made = 0
    for text in collect():
        name = hashlib.sha1((VERSION + "|" + VOICE + "|" + text).encode("utf-8")).hexdigest()[:12] + ".m4a"
        target = os.path.join(OUT, name)
        if not os.path.exists(target):
            render(text, target)
            made += 1
        index[text] = name
    # Clips entfernen, die nicht mehr gebraucht werden
    keep = set(index.values())
    for f in os.listdir(OUT):
        if f.endswith(".m4a") and f not in keep:
            os.remove(os.path.join(OUT, f))
    with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=1)
    print(f"{len(index)} Clips im Index, {made} neu erzeugt (Stimme: {VOICE})")


if __name__ == "__main__":
    main()
