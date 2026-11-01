"""Download MOE (教育部國語辭典簡編本) recordings via moedict CDN -> audio/zy/<n>.mp3,
find the first spoken segment (the headword) and write it into the ZY array in zhuyin.html.
Run: python3 tools/zhuyin/build.py   (needs curl + ffmpeg)"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from data import ZY
ROOT = os.path.join(HERE, '..', '..')
OUT = os.path.join(ROOT, 'audio', 'zy')
os.makedirs(OUT, exist_ok=True)
rows = []
for i, z in enumerate(ZY):
    tmp = os.path.join(OUT, f'{i}.ogg'); mp3 = os.path.join(OUT, f'{i}.mp3')
    subprocess.run(['curl', '-sfL', '-o', tmp, f'https://r2-assets.moedict.tw/audio/a/{z[4]}.ogg'], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-codec:a', 'libmp3lame', '-q:a', '4', mp3], check=True)
    os.remove(tmp)
    err = subprocess.run(['ffmpeg', '-i', mp3, '-af', 'silencedetect=noise=-35dB:d=' + ('0.4' if len(z[1]) > 1 else '0.2') + '', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', err)]
    en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', err)]
    if st and st[0] < 0.05: s, e = en[0], (st[1] if len(st) > 1 else en[0] + 1)
    else: s, e = 0, (st[0] if st else 1)
    rows.append(list(z[:4]) + [[round(max(0, s - 0.05), 2), round(e + 0.1, 2)]])
    print(i, z[0], z[1], rows[-1][4])
p = os.path.join(ROOT, 'zhuyin.html')
t = open(p, encoding='utf-8').read()
t = re.sub(r'const ZY=.*?;\n', lambda m: 'const ZY=' + json.dumps(rows, ensure_ascii=False) + ';\n', t, count=1, flags=re.S)
open(p, 'w', encoding='utf-8').write(t)
