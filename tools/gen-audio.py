#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
# Plume & Cie - Copyright (C) 2026 ZeBidule - GNU AGPL v3 or later, see LICENSE.
"""Génère les mp3 des énigmes « dictée » (champs `audio` et `say` de js/puzzles.js).

Dépendances : pip install piper-tts lameenc numpy, node dans le PATH, et une voix
Piper française (https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/siwis/medium) :
fr_FR-siwis-medium.onnx et son .json.

Usage : python3 tools/gen-audio.py <voix.onnx> [--force]
"""
import json, subprocess, sys
from pathlib import Path

import lameenc
import numpy as np
from piper import PiperVoice

root = Path(__file__).resolve().parent.parent
voice_path = next((a for a in sys.argv[1:] if not a.startswith("--")), None)
if not voice_path:
    sys.exit(__doc__)
force = "--force" in sys.argv

items = json.loads(subprocess.check_output(["node", "-e",
    "console.log(JSON.stringify(require('./js/puzzles.js').ALL_PUZZLES"
    ".filter(p=>p.audio).map(p=>({audio:p.audio,say:p.say}))))"], cwd=root))
voice = PiperVoice.load(voice_path)

for it in items:
    out = root / it["audio"]
    if out.exists() and not force:
        continue
    chunks = list(voice.synthesize(it["say"]))
    pcm = b"".join(c.audio_int16_bytes for c in chunks)
    # 150 ms de silence de chaque côté pour éviter les coupures
    pad = np.zeros(int(chunks[0].sample_rate * 0.15), dtype=np.int16).tobytes()
    enc = lameenc.Encoder()
    enc.set_bit_rate(64); enc.set_in_sample_rate(chunks[0].sample_rate)
    enc.set_channels(1); enc.set_quality(2)
    out.parent.mkdir(exist_ok=True)
    out.write_bytes(enc.encode(pad + pcm + pad) + enc.flush())
    print("ok", it["audio"], it["say"])
