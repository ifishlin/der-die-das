"""Download MOE (教育部國語辭典簡編本) recordings via moedict CDN -> audio/zy/<n>_<k>.mp3,
find the first spoken segment (the headword) of each and write the ZY array into zhuyin.html.
Each entry plays the symbol sound, then the example word; a word id that is a list is played part by part (one recording per character).
Run: python3 tools/zhuyin/build.py   (needs curl + ffmpeg)"""
import glob, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from data import ZY
ROOT = os.path.join(HERE, '..', '..')
OUT = os.path.join(ROOT, 'audio', 'zy')
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(OUT, '*')): os.remove(f)

def fetch(rid, name, single):
    tmp = os.path.join(OUT, name + '.ogg'); mp3 = os.path.join(OUT, name + '.mp3')
    subprocess.run(['curl', '-sfL', '-o', tmp, f'https://r2-assets.moedict.tw/audio/a/{rid}.ogg'], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-codec:a', 'libmp3lame', '-q:a', '4', mp3], check=True)
    os.remove(tmp)
    d = '0.2' if single else '0.4'
    err = subprocess.run(['ffmpeg', '-i', mp3, '-af', f'silencedetect=noise=-35dB:d={d}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', err)]
    en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', err)]
    if st and st[0] < 0.05: s, e = en[0], (st[1] if len(st) > 1 else en[0] + 1)
    else: s, e = 0, (st[0] if st else 1)
    return [name, round(max(0, s - 0.05), 2), round(e + 0.1, 2)]

# 符號本身的讀音：教育部《國語注音符號手冊》開放部件（CC BY 4.0），F1..F37 依手冊順序
ORDER = 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ'
import tempfile, zipfile
zpath = os.path.join(tempfile.mkdtemp(), 'bopomofo.zip')
subprocess.run(['curl', '-sfL', '-o', zpath, 'https://language.moe.gov.tw/001/Upload/files/site_content/M0001/juyin/bopomofo_materials_20170213.zip'], check=True)
zf = zipfile.ZipFile(zpath)

def symbol_part(sym, name):
    wav = os.path.join(OUT, name + '.wav'); mp3 = os.path.join(OUT, name + '.mp3')
    open(wav, 'wb').write(zf.read(f'audio/F{ORDER.index(sym) + 1}.WAV'))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '4', mp3], check=True)
    os.remove(wav)
    return [name, 0, 1.0]  # 整檔約 0.8 秒，不剪

rows = []
for i, z in enumerate(ZY):
    ids = z[5] if isinstance(z[5], list) else [z[5]]
    parts = [symbol_part(z[0], f'{i}_s')]  # 先念符號本身的音
    single = len(z[1]) == 1 or isinstance(z[5], list)
    parts += [fetch(r, f'{i}_{k}', single) for k, r in enumerate(ids)]
    rows.append(list(z[:4]) + [parts])
    print(i, z[0], z[1], parts)
p = os.path.join(ROOT, 'zhuyin.html')
t = open(p, encoding='utf-8').read()
t = re.sub(r'const ZY=.*?;\n', lambda m: 'const ZY=' + json.dumps(rows, ensure_ascii=False) + ';\n', t, count=1, flags=re.S)
open(p, 'w', encoding='utf-8').write(t)
